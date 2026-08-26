import {nextTick, onBeforeUnmount, ref} from "vue";
import {getMusicUrlsApi} from "./musicWebApi.js";

export function formatTime(t) {
    if (!t || isNaN(t)) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
}

/**
 * 抽取 AudioPlayer 与嵌入式播放器共用的音频播放核心逻辑。
 * 用法: const { audio, getMusicUrls, handlePlay, ... } = useMusicPlayer();
 * 模板中通过 <audio ref="audio" /> 绑定实际的 audio 元素。
 */
export function useMusicPlayer() {
    const audio = ref(null);
    const isAudioLoading = ref(false);
    let hls = null;
    let musicInfoCache = {};
    let audioCtx = null;
    let audioCtxSrc = null;
    let audioCtxGainNode = null;

    /**
     * 获取音乐音频地址(自动缓存, 并处理 m3u8 版本的 blob URL 转换)。
     * 返回 { retcode, msg, data } 其中 data 为音乐信息数组。
     */
    async function getMusicUrls(ids, signs) {
        const requireFetch = [];
        for (const id of ids) {
            if (!musicInfoCache[id]) {
                requireFetch.push(id);
            }
        }
        if (requireFetch.length > 0) {
            const rsp = await getMusicUrlsApi(requireFetch, signs);
            if (rsp.retcode) {
                return {retcode: rsp.retcode, msg: rsp.msg, data: null};
            }
            for (const i of rsp.data.urls) {
                musicInfoCache[i.id] = i;
                if (signs && signs[i.id]) {
                    musicInfoCache[i.id].sign = signs[i.id];
                }
                if (i.version === 2) {
                    const blob = new Blob([i.audio_url], {type: "application/vnd.apple.mpegurl"});
                    musicInfoCache[i.id].audio_url = URL.createObjectURL(blob);
                    musicInfoCache[i.id].preload_list = i.preload_list;
                } else if (i.version === 3) {
                    let masterM3u8 = i.audio_url;
                    for (let j = 0; j < i.m3u8s.length; j++) {
                        const blob1 = new Blob([i.m3u8s[j][1]], {type: "application/vnd.apple.mpegurl"});
                        const url1 = URL.createObjectURL(blob1);
                        musicInfoCache[i.id].m3u8s[j][1] = url1;
                        masterM3u8 = masterM3u8.replaceAll(`[m3u8link_${i.m3u8s[j][0]}]`, url1);
                    }
                    const blob2 = new Blob([masterM3u8], {type: "application/vnd.apple.mpegurl"});
                    musicInfoCache[i.id].audio_url = URL.createObjectURL(blob2);
                    musicInfoCache[i.id].preload_list = i.preload_list;
                }
            }
        }
        const ret = [];
        for (const id of ids) {
            if (musicInfoCache[id]) {
                ret.push(musicInfoCache[id]);
            }
        }
        return {retcode: 0, msg: "ok", data: ret};
    }

    function revokeAllBlob() {
        Object.keys(musicInfoCache).forEach(key => {
            const val = musicInfoCache[key];
            if (val.version === 2) {
                URL.revokeObjectURL(val.audio_url);
            } else if (val.version === 3) {
                URL.revokeObjectURL(val.audio_url);
                for (let i = 0; i < val.m3u8s.length; i++) {
                    URL.revokeObjectURL(val.m3u8s[i][1]);
                }
            }
        });
        musicInfoCache = {};
    }

    function getCachedMusicInfo(id) {
        return musicInfoCache[id] || null;
    }

    function destroyHls() {
        if (hls) {
            hls.detachMedia();
            hls.destroy();
            hls = null;
        }
    }

    async function setUpHls(m3u8Url) {
        isAudioLoading.value = true;
        const {default: Hls} = await import("hls.js");
        isAudioLoading.value = false;
        if (Hls.isSupported()) {
            destroyHls();
            hls = new Hls();
            hls.loadSource(m3u8Url);
            hls.attachMedia(audio.value);
        } else {
            audio.value.src = m3u8Url;
        }
    }

    function setGain(gain, time) {
        if (!audioCtx || !audioCtxGainNode) return;
        const now = audioCtx.currentTime;
        audioCtxGainNode.gain.cancelScheduledValues(now);
        audioCtxGainNode.gain.setValueAtTime(audioCtxGainNode.gain.value, now);
        audioCtxGainNode.gain.linearRampToValueAtTime(gain, now + time);
    }

    /**
     * 设置音频源并自动开始播放核心逻辑(不包含 UI 状态/媒体会话处理)。
     * @param musicType "default" 或 "m3u8"
     * @param src 音频地址
     * @param gain 音量增益
     * @param onReady 播放准备完成后回调(可在此调用 audio.play() 等)
     */
    async function handlePlay(musicType, src, gain, onReady) {
        await resumeAudioContext();
        audio.value.crossOrigin = "anonymous";
        switch (musicType) {
            case "default":
                destroyHls();
                audio.value.src = src;
                break;
            case "m3u8":
                await setUpHls(src);
                break;
        }
        await nextTick();
        setGain(gain || 1.0, 30e-3);
        if (typeof onReady === "function") {
            onReady();
        }
    }

    function initAudioContext() {
        if (audioCtx || !audio.value) return;
        const Ctx = window.AudioContext || window.webkitAudioContext;
        if (!Ctx) return;
        audioCtx = new Ctx();
        audioCtxSrc = audioCtx.createMediaElementSource(audio.value);
        audioCtxGainNode = audioCtx.createGain();
        audioCtxSrc.connect(audioCtxGainNode).connect(audioCtx.destination);
    }

    /**
     * 确保 AudioContext 存在并尝试恢复为 running 状态。
     * 在跨域 iframe 等自动播放被拦截的场景下, 未处于用户手势时 resume()
     * 的 Promise 可能一直处于 pending 状态; 这里用超时兜底, 避免调用方被永久阻塞。
     * 用户之后点击播放按钮时会在用户手势中再次调用本函数, 届时即可恢复出声。
     */
    async function resumeAudioContext() {
        initAudioContext();
        if (audioCtx && audioCtx.state === "suspended") {
            await Promise.race([
                audioCtx.resume(),
                new Promise(resolve => setTimeout(resolve, 300)),
            ]);
        }
    }

    function closeAudioContext() {
        if (audioCtx) {
            audioCtx.close();
            audioCtx = null;
            audioCtxSrc = null;
            audioCtxGainNode = null;
        }
    }

    onBeforeUnmount(() => {
        destroyHls();
        revokeAllBlob();
        closeAudioContext();
    });

    return {
        audio,
        isAudioLoading,
        getMusicUrls,
        getCachedMusicInfo,
        revokeAllBlob,
        destroyHls,
        setUpHls,
        setGain,
        handlePlay,
        initAudioContext,
        resumeAudioContext,
        closeAudioContext,
        formatTime,
    };
}