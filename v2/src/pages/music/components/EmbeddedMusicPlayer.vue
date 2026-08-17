<script setup lang="js">
import {computed, onMounted, ref} from "vue";
import {useMusicPlayer} from "../musicPlayerCore.js";
import {IconMusic, IconPlayerPlayFilled, IconPlayerPauseFilled, IconInfoCircle, IconVolume} from "@tabler/icons-vue";

const props = defineProps({
    musicId: {type: Number, required: true},
    expiry: {type: Number, default: null},
    sign: {type: String, default: null},
    autoplay: {type: Boolean, default: false},
});
const emit = defineEmits(["error"]);

const {
    audio,
    isAudioLoading,
    getMusicUrls,
    handlePlay,
    initAudioContext,
    formatTime,
} = useMusicPlayer();

const musicPageUrl = import.meta.env.VITE_MUSIC_PAGE_URL;

const title = ref("未知歌曲");
const coverUrl = ref("");
const detailSign = ref(null);
const isPlaying = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const showVolume = ref(false);
const playerReady = ref(false);
const errorMsg = ref("");

const detailUrl = computed(() => {
    let url = musicPageUrl + "?music_id=" + props.musicId;
    if (detailSign.value) {
        url += "&expiry=" + detailSign.value.expiry + "&sign=" + detailSign.value.sign;
    }
    return url;
});

const remainingTime = computed(() => {
    return "-" + formatTime(Math.max(0, duration.value - currentTime.value));
});

const progressBarStyle = computed(() => {
    let percentage = 0;
    if (duration.value !== 0) {
        percentage = (currentTime.value / duration.value) * 100;
    }
    return {'--player-progress-percent': `${percentage}%`};
});

const volumeBarStyle = computed(() => {
    return {'--player-progress-percent': `${volume.value * 100}%`};
});

function play() {
    if (!audio.value || !playerReady.value) return;
    audio.value.play().then(() => {
        isPlaying.value = true;
    }).catch(() => {
        isPlaying.value = false;
    });
}

function pause() {
    if (!audio.value) return;
    audio.value.pause();
    isPlaying.value = false;
    isAudioLoading.value = false;
}

function togglePlay() {
    if (isPlaying.value) {
        pause();
    } else {
        play();
    }
}

function toggleVolume() {
    showVolume.value = !showVolume.value;
}

function onVolumeChange() {
    if (audio.value) {
        audio.value.volume = volume.value;
        localStorage["audioPlayerVolume"] = volume.value;
    }
}

function onTimeUpdate() {
    currentTime.value = audio.value.currentTime;
}

function onLoadedMetadata() {
    duration.value = audio.value.duration;
}

function onSeek() {
    if (!audio.value) return;
    audio.value.currentTime = currentTime.value;
}

function onWaiting() {
    isAudioLoading.value = true;
}

function onPlaying() {
    isAudioLoading.value = false;
}

function onPlay() {
    isPlaying.value = true;
}

function onPause() {
    isPlaying.value = false;
    isAudioLoading.value = false;
}

function onEnded() {
    isAudioLoading.value = false;
    isPlaying.value = false;
}

function onError() {
    isAudioLoading.value = false;
    isPlaying.value = false;
}

function handleError(msg) {
    console.error(msg);
    errorMsg.value = msg;
    emit("error", msg);
}

async function init() {
    if (!props.musicId || props.musicId <= 0) {
        handleError("缺少 music_id 参数");
        return;
    }
    const signs = {};
    if (props.sign) {
        signs[props.musicId] = {expiry: props.expiry, sign: props.sign};
    }
    const rsp = await getMusicUrls([props.musicId], signs);
    if (rsp.retcode) {
        handleError("无法获取音频文件 url: " + rsp.msg);
        return;
    }
    const musicInfo = rsp.data[0];
    if (!musicInfo) {
        handleError("你要访问的音乐不存在");
        return;
    }
    title.value = musicInfo.name || "未知歌曲";
    coverUrl.value = musicInfo.cover_url || "";
    if (musicInfo.sign) {
        detailSign.value = musicInfo.sign;
    }
    playerReady.value = true;
    await handlePlay(
        musicInfo.version === 1 ? "default" : "m3u8",
        musicInfo.audio_url,
        musicInfo.gain,
        () => {
            // 如果 query 中指定了 autoplay，尝试自动播放
            // (iframe 内可能被浏览器拦截, 失败后由用户手动点击播放)
            if (props.autoplay) {
                play();
            }
        }
    );
}

onMounted(async () => {
    if (localStorage["audioPlayerVolume"]) {
        volume.value = localStorage["audioPlayerVolume"];
    }
    audio.value.volume = volume.value;
    initAudioContext();
    audio.value.addEventListener("waiting", onWaiting);
    audio.value.addEventListener("playing", onPlaying);
    audio.value.addEventListener("ended", onEnded);
    audio.value.addEventListener("error", onError);
    audio.value.addEventListener("timeupdate", onTimeUpdate);
    audio.value.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.value.addEventListener("play", onPlay);
    audio.value.addEventListener("pause", onPause);
    await init();
});
</script>

<template>
    <div v-if="errorMsg" class="embedded-player-container error-state">
        <span class="error-text">{{ errorMsg }}</span>
    </div>
    <div v-else class="embedded-player-container">
        <audio ref="audio" />
        <div class="cover-col">
            <img v-if="coverUrl" class="cover-img" :src="coverUrl" alt="音乐封面" />
            <div v-else class="no-cover gray">
                <IconMusic :stroke="1" width="100%" height="100%" />
            </div>
            <button
                type="button"
                class="play-overlay-btn"
                :title="isPlaying ? '暂停' : '播放'"
                @click="togglePlay"
            >
                <span v-if="isAudioLoading" class="wux-loading"></span>
                <IconPlayerPauseFilled v-if="(!isAudioLoading) && isPlaying" width="26px" height="26px"/>
                <IconPlayerPlayFilled v-if="(!isAudioLoading) && (!isPlaying)" width="26px" height="26px"/>
            </button>
        </div>

        <div class="info-col">
            <div class="top-row">
                <a class="detail-link" target="_blank" :href="detailUrl" title="详情">
                    <span class="detail-btn mc">
                        <IconInfoCircle width="20px" height="20px"/>
                    </span>
                </a>
                <span class="music-title" :title="title">{{ title }}</span>
            </div>

            <div class="bottom-row">
                <div class="volume-wrapper">
                    <button type="button" class="volume-btn mc" title="音量调节" @click="toggleVolume">
                        <IconVolume width="18px" height="18px"/>
                    </button>
                    <div v-if="showVolume" class="volume-slider">
                        <input
                            type="range"
                            min="0"
                            max="1"
                            step="0.01"
                            v-model.number="volume"
                            @input="onVolumeChange"
                            class="progress wux-form-range"
                            :style="volumeBarStyle"
                            title="音量"
                        />
                    </div>
                </div>

                <input
                    class="progress wux-form-range"
                    type="range"
                    min="0"
                    :max="duration || 0"
                    step="0.1"
                    v-model.number="currentTime"
                    @input="onSeek"
                    :style="progressBarStyle"
                    title="进度"
                />

                <span class="remaining-time">{{ remainingTime }}</span>
            </div>
        </div>
    </div>
</template>

<style scoped>
.embedded-player-container {
    --player-progress-fill: #5064e1;
    --player-progress-track: rgba(128, 128, 128, 0.35);
    --player-bg: rgba(250, 250, 250, 0.96);
    --player-border: #d8d8d8;
    --player-text: #1a1a1a;
    --player-text-muted: #777;
    display: flex;
    align-items: center;
    gap: 12px;
    box-sizing: border-box;
    width: 100%;
    padding: 8px;
    background: var(--player-bg);
    color: var(--player-text);
    border: 1px solid var(--player-border);
    border-radius: 10px;
    box-shadow: 0 2px 12px rgba(0, 0, 0, 0.12);
    font-family: inherit;
}

@media (prefers-color-scheme: dark) {
    .embedded-player-container {
        --player-progress-fill: #7383e7;
        --player-progress-track: rgba(128, 128, 128, 0.45);
        --player-bg: rgba(30, 30, 30, 0.96);
        --player-border: #444;
        --player-text: #f2f2f2;
        --player-text-muted: #aaa;
    }
}

body[dark-mode] .embedded-player-container {
    --player-progress-fill: #7383e7;
    --player-progress-track: rgba(128, 128, 128, 0.45);
    --player-bg: rgba(30, 30, 30, 0.96);
    --player-border: #444;
    --player-text: #f2f2f2;
    --player-text-muted: #aaa;
}

.cover-col {
    position: relative;
    flex-shrink: 0;
    width: 64px;
    height: 64px;
    overflow: hidden;
    border-radius: 8px;
}

.cover-img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
}

.no-cover {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    height: 100%;
    background: #e5e5e5;
}

body[dark-mode] .no-cover {
    background: #3a3a3a;
}

.play-overlay-btn {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    display: flex;
    align-items: center;
    justify-content: center;
    width: 36px;
    height: 36px;
    padding: 0;
    border: none;
    border-radius: 50%;
    background: rgba(0, 0, 0, 0.5);
    color: #fff;
    backdrop-filter: blur(2px);
    -webkit-backdrop-filter: blur(2px);
    cursor: pointer;
    transition: background-color 0.2s ease;
}

.play-overlay-btn:hover {
    background: rgba(0, 0, 0, 0.68);
}

.play-overlay-btn .wux-loading {
    width: 20px;
    height: 20px;
}

.info-col {
    display: flex;
    flex-direction: column;
    flex: 1;
    min-width: 0;
    gap: 6px;
}

.top-row {
    display: flex;
    align-items: center;
    gap: 4px;
    min-width: 0;
}

.detail-link {
    display: inline-flex;
    flex-shrink: 0;
    text-decoration: none;
}

.detail-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 26px;
    height: 26px;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--player-text-muted);
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;
}

.detail-btn:hover {
    color: var(--player-text);
    background: rgba(128, 128, 128, 0.15);
}

.music-title {
    flex: 1;
    min-width: 0;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    font-size: 15px;
    font-weight: 600;
    color: var(--player-text);
}

.bottom-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.volume-wrapper {
    position: relative;
    display: flex;
    align-items: center;
    flex-shrink: 0;
}

.volume-btn {
    display: inline-flex;
    align-items: center;
    justify-content: center;
    width: 24px;
    height: 24px;
    padding: 0;
    border: none;
    border-radius: 6px;
    background: transparent;
    color: var(--player-text-muted);
    cursor: pointer;
    transition: color 0.2s ease, background-color 0.2s ease;
}

.volume-btn:hover {
    color: var(--player-text);
    background: rgba(128, 128, 128, 0.15);
}

.volume-slider {
    position: absolute;
    bottom: 30px;
    left: 50%;
    transform: translateX(-50%);
    width: 96px;
    padding: 8px 12px;
    background: var(--player-bg);
    border: 1px solid var(--player-border);
    border-radius: 8px;
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2);
    z-index: 10;
}

.progress {
    flex: 1;
    min-width: 0;
    margin: 0;
    --form-range-track-background: transparent;
    --player-progress-track-height: 5px;
    border-radius: 999px;
    background: transparent;
    cursor: pointer;
}

.progress::-webkit-slider-runnable-track {
    height: var(--player-progress-track-height);
    background: linear-gradient(
        to right,
        var(--player-progress-fill) 0%,
        var(--player-progress-fill) var(--player-progress-percent, 0%),
        var(--player-progress-track) var(--player-progress-percent, 0%),
        var(--player-progress-track) 100%
    );
    border-radius: 999px;
    cursor: pointer;
}

.progress::-webkit-slider-thumb {
    cursor: pointer;
}

.progress::-moz-range-track {
    height: var(--player-progress-track-height);
    background-color: var(--player-progress-track);
    border-radius: 999px;
    cursor: pointer;
}

.progress::-moz-range-progress {
    height: var(--player-progress-track-height);
    background-color: var(--player-progress-fill);
    border-radius: 999px;
    cursor: pointer;
}

.progress::-moz-range-thumb {
    cursor: pointer;
}

.remaining-time {
    flex-shrink: 0;
    font-size: 12px;
    color: var(--player-text-muted);
    font-variant-numeric: tabular-nums;
}

.error-state {
    justify-content: center;
    min-height: 64px;
    padding: 16px;
}

.error-text {
    color: var(--player-text-muted);
    font-size: 14px;
    text-align: center;
}
</style>