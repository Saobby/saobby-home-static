<script setup lang="js">
import {nextTick, onBeforeUnmount, onMounted, ref, reactive, computed} from "vue"
import {getMusicUrlsApi, fetchMusicListApi} from "../musicWebApi.js";
import {IconPlayerPlayFilled, IconPlayerPauseFilled, IconPlayerTrackNextFilled, IconPlayerTrackPrevFilled, IconVolume, IconRefresh, IconRefreshOff} from "@tabler/icons-vue";

const props = defineProps({
    initialTitle: {type: String, default: '未知歌曲'},
    disableUi: {type: Boolean, default: false},
});
const emit = defineEmits(["requestPlay", "error"]);

const audio = ref(null);
let hls = null;
let musicInfoCache = {};

let audioCtx = null;
let audioCtxSrc = null;
let audioCtxGainNode = null;

const playMode = ref(null); // single或list
const playList = ref([]);
const playIndex = ref(-1);
const searchArgs = reactive({});
const currentPlayingId = ref(0);

const title = ref(props.initialTitle);
const isPlaying = ref(false);
const showVolume = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);
const isCycle = ref(false);  // 是否单曲播放
const setUiDisabled = ref(false);
const uiDisabled = computed(() => {
    return setUiDisabled.value || props.disableUi;
});
const progressBarStyle = computed(() => {
    let percentage = 0;
    if (duration.value !== 0){
        percentage = (currentTime.value / duration.value) * 100;
    }
    return `background: linear-gradient(to right, #5064e1 0%, #5064e1 ${percentage}%, #e5e5e5 ${percentage}%, #e5e5e5 100%);`;
});
const volumeBarStyle = computed(() => {
    return `background: linear-gradient(to right, #5064e1 0%, #5064e1 ${volume.value * 100}%, #e5e5e5 ${volume.value * 100}%, #e5e5e5 100%);`;
});
const canNext = computed(() => {
    if (playMode.value === "single") {
        return false;
    }
    return playIndex.value < playList.value.length - 1;
});
const canPrev = computed(() => {
    if (playMode.value === "single") {
        return false;
    }
    return playIndex.value > 0;
});
const isAudioLoading = ref(false);

// 以下为控件处理函数
function togglePlay() {
    if (!audio.value) return;
    if (currentPlayingId.value === 0) {
        emit("requestPlay");
        return;
    }
    if (isPlaying.value) {
        pause();
    } else {
        play();
    }
}

function play(){
    if (!audio.value) return;
    audio.value.play();
    isPlaying.value = true;
}

function pause(){
    if (!audio.value) return;
    audio.value.pause();
    isPlaying.value = false;
    isAudioLoading.value = false;
}

function toggleVolume() {
    showVolume.value = !showVolume.value;
}

function toggleCycle(){
    isCycle.value = !isCycle.value;
}

function onVolumeChange() {
    if (audio.value) {
        audio.value.volume = volume.value;
    }
}

function onTimeUpdate() {
    currentTime.value = audio.value.currentTime;
    if ("mediaSession" in navigator) {
        if (audio.value.duration){
            navigator.mediaSession.setPositionState({
                duration: audio.value.duration,
                playbackRate: audio.value.playbackRate,
                position: audio.value.currentTime
            });
        }
    }
}

function onLoadedMetadata() {
    duration.value = audio.value.duration;
}

function onSeek() {
    if (!audio.value) return;
    audio.value.currentTime = currentTime.value;
}

function formatTime(t) {
    if (!t || isNaN(t)) return "00:00";
    const m = Math.floor(t / 60);
    const s = Math.floor(t % 60);
    return `${m.toString().padStart(2, "0")}:${s
        .toString()
        .padStart(2, "0")}`;
}

onMounted(() => {
    audio.value.volume = volume.value;
});

// 以下为播放器基本API
async function getMusicUrls(ids){
    let requireFetch = [];
    for (const id of ids){
        if (!musicInfoCache[id]){
            requireFetch.push(id);
        }
    }
    if (requireFetch.length > 0){
        const rsp = await getMusicUrlsApi(requireFetch);
        if (rsp.retcode){
            handleError("无法获取音频文件 url: "+rsp.msg);
            return;
        }
        for (const i of rsp.data.urls){
            musicInfoCache[i.id] = i;
            if (i.version === 2){
                const blob = new Blob([i.audio_url], {type: "application/vnd.apple.mpegurl"});
                musicInfoCache[i.id].audio_url = URL.createObjectURL(blob);
            }
        }
    }
    let ret = [];
    for (const id of ids){
        ret.push(musicInfoCache[id]);
    }
    return ret;
}

function revokeAllBlob(){
    Object.keys(musicInfoCache).forEach(key => {
        const val = musicInfoCache[key];
        if (val.version === 2){
            URL.revokeObjectURL(val.audio_url);
        }
    });
}

function destroyHls(){
    if (hls){
        hls.detachMedia();
        hls.destroy();
        hls = null;
    }
}

async function setUpHls(m3u8Url){
    isAudioLoading.value = true;
    const {default: Hls} = await import("hls.js");
    isAudioLoading.value = false;
    if (Hls.isSupported()){
        destroyHls();
        hls = new Hls();
        hls.loadSource(m3u8Url);
        hls.attachMedia(audio.value);
    }else{
        audio.value.src = m3u8Url;
    }
}

function setGain(gain, time){
    const now = audioCtx.currentTime;
    audioCtxGainNode.gain.cancelScheduledValues(now);
    audioCtxGainNode.gain.setValueAtTime(audioCtxGainNode.gain.value, now);
    audioCtxGainNode.gain.linearRampToValueAtTime(gain, now + time);
}

async function handlePlay(musicType, src, musicTitle, gain) {
    await audioCtx.resume();
    audio.value.crossOrigin = "anonymous";
    switch (musicType){
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
    play();
    title.value = musicTitle;
    if ("mediaSession" in navigator){
        navigator.mediaSession.metadata = new MediaMetadata({
            title: musicTitle,
        });
    }
}

function handleError(msg){
    console.error(msg);
    emit("error", msg);
}

function resetPlaylist(){
    playList.value = [];
    playIndex.value = -1;
}

function onWaiting(){
    isAudioLoading.value = true;
}

function onPlaying(){
    isAudioLoading.value = false;
}

function onEnded(){
    isAudioLoading.value = false;
}

function onError(){
    isAudioLoading.value = false;
}

function onPlay(){
    navigator.mediaSession.playbackState = "playing";
}

function onPause(){
    navigator.mediaSession.playbackState = "paused";
}

defineExpose({
    playSingle,
    playAll,
    currentPlayingId
})

onMounted(() => {
    audio.value.addEventListener("waiting", onWaiting);
    audio.value.addEventListener("playing", onPlaying);
    audio.value.addEventListener("ended", onEnded);
    audio.value.addEventListener("error", onError);
    audio.value.addEventListener("timeupdate", onTimeUpdate);
    audio.value.addEventListener("loadedmetadata", onLoadedMetadata);
    audio.value.addEventListener("ended", onFinishPlaying);
    if ("mediaSession" in navigator){
        navigator.mediaSession.setActionHandler("play", () => {
            play();
        });
        navigator.mediaSession.setActionHandler("pause", () => {
            pause();
        });
        navigator.mediaSession.setActionHandler("previoustrack", () => {
            prevMusic();
        });
        navigator.mediaSession.setActionHandler("nexttrack", () => {
            nextMusic();
        });
        navigator.mediaSession.setActionHandler("seekto", (details) => {
            if (details.fastSeek && "fastSeek" in audio.value) {
                audio.value.fastSeek(details.seekTime);
            } else {
                audio.value.currentTime = details.seekTime;
            }
            navigator.mediaSession.setPositionState({
                duration: audio.value.duration,
                playbackRate: audio.value.playbackRate,
                position: details.seekTime
            });
        });
        audio.value.addEventListener("play", onPlay);
        audio.value.addEventListener("pause", onPause);
    }
    audioCtx = new AudioContext();
    audioCtxSrc = audioCtx.createMediaElementSource(audio.value);
    audioCtxGainNode = audioCtx.createGain();
    audioCtxSrc.connect(audioCtxGainNode).connect(audioCtx.destination);
});

onBeforeUnmount(() => {
    destroyHls();
    audio.value.removeEventListener("waiting", onWaiting);
    audio.value.removeEventListener("playing", onPlaying);
    audio.value.removeEventListener("ended", onEnded);
    audio.value.removeEventListener("error", onError);
    audio.value.removeEventListener("timeupdate", onTimeUpdate);
    audio.value.removeEventListener("loadedmetadata", onLoadedMetadata);
    audio.value.removeEventListener("ended", onFinishPlaying);
    if ("mediaSession" in navigator){
        navigator.mediaSession.setActionHandler("play", null);
        navigator.mediaSession.setActionHandler("pause", null);
        navigator.mediaSession.setActionHandler("previoustrack", null);
        navigator.mediaSession.setActionHandler("nexttrack", null);
        audio.value.removeEventListener("play", onPlay);
        audio.value.removeEventListener("pause", onPause);
    }
    revokeAllBlob();
    audioCtx.close();
    audioCtx = null;
    audioCtxSrc = null;
    audioCtxGainNode = null;
});

// 以下为单曲播放逻辑实现
async function playSingle(musicId) {
    playMode.value = "single";
    currentPlayingId.value = musicId;
    const rsp = await getMusicUrls([musicId]);
    if (!rsp){
        return;
    }
    const musicInfo = rsp[0];
    await handlePlay(
        musicInfo.version === 2 ? "m3u8": "default",
        musicInfo.audio_url,
        musicInfo.name,
        musicInfo.gain
    );
}

// 以下为列表播放逻辑实现
async function playAll(sort, order, keyword, includedTags, excludedTags){
    playMode.value = "list";
    resetPlaylist();
    searchArgs.value = {
        sort: sort,
        order: order,
        keyword: keyword,
        includedTags: includedTags,
        excludedTags: excludedTags,
        pageSize: 10,
        pageIndex: 0,
        pageAmount: 114514
    }
    await expandPlaylist();
    await nextMusic();
}

async function expandPlaylist(){
    const rsp = await fetchMusicListApi(
        searchArgs.value.sort,
        searchArgs.value.order,
        searchArgs.value.pageIndex,
        searchArgs.value.keyword,
        searchArgs.value.includedTags,
        searchArgs.value.excludedTags,
        searchArgs.value.pageSize
    )
    if (rsp.retcode){
        handleError("无法加载播放列表: "+rsp.msg);
        return;
    }
    searchArgs.value.pageAmount = rsp.data.pg_amount;
    searchArgs.value.pageIndex += 1;
    const list = rsp.data.list;
    let newIds = [];
    for (const i of list){
        newIds.push(i.id);
    }
    await getMusicUrls(newIds);  // 预先加载并缓存音频链接
    playList.value = playList.value.concat(newIds);
}

async function startPlay(){
    const musicId = playList.value[playIndex.value];
    currentPlayingId.value = musicId;
    const rsp = await getMusicUrls([musicId]);
    const musicInfo = rsp[0];
    await handlePlay(
        musicInfo.version === 2 ? "m3u8": "default",
        musicInfo.audio_url,
        musicInfo.name,
        musicInfo.gain
    );
}

async function nextMusic(){
    if (!canNext.value) return;
    if (playIndex.value === playList.value.length - 2){
        expandPlaylist().then();  // 准备开始播放列表中的最后一曲时加载后面的播放列表
    }
    playIndex.value++;
    await startPlay();
}

async function prevMusic(){
    if (!canPrev.value) return;
    playIndex.value--;
    await startPlay();
}

function onFinishPlaying(){
    if (isCycle.value){
        audio.value.currentTime = 0;
        audio.value.play();
        return;
    }
    if (playMode.value === "list"){
        nextMusic().then();
        return;
    }
    isPlaying.value = false;
}

</script>

<template>
    <div class="player-container">
        <audio ref="audio" />
        <div class="controls-row">
            <div class="title-mobile">
                {{ title }}
            </div>

            <div class="button-group">
                <button :disabled="uiDisabled || (!canPrev)" @click="prevMusic" title="上一曲" class="wux-btn wux-btn-round wux-btn-text icon-btn mc" type="button">
                    <IconPlayerTrackPrevFilled width="26px" height="26px"/>
                </button>
                <button :disabled="uiDisabled" @click="togglePlay" :title="isPlaying ? '暂停': '播放'" class="wux-btn wux-btn-round icon-btn3 mc" type="button">
                    <span style="width: 24px; height: 24px" v-if="isAudioLoading" class="wux-loading"></span>
                    <IconPlayerPauseFilled width="24px" height="24px" v-if="(!isAudioLoading) && isPlaying"/>
                    <IconPlayerPlayFilled width="24px" height="24px" v-if="(!isAudioLoading) && (!isPlaying)"/>
                </button>
                <button :disabled="uiDisabled || (!canNext)" @click="nextMusic" title="下一曲" class="wux-btn wux-btn-round wux-btn-text icon-btn mc" type="button">
                    <IconPlayerTrackNextFilled width="26px" height="26px"/>
                </button>
                <button @click="toggleCycle" :title="isCycle ? '切换为列表播放': '切换为单曲循环'" class="wux-btn wux-btn-round wux-btn-text icon-btn mc" type="button">
                    <IconRefresh v-if="isCycle" width="26px" height="26px"/>
                    <IconRefreshOff v-if="!isCycle" width="26px" height="26px"/>
                </button>
                <div class="volume-wrapper">
                    <button @click="toggleVolume" title="音量调节" class="wux-btn wux-btn-round wux-btn-text icon-btn mc" type="button">
                        <IconVolume width="26px" height="26px"/>
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
                        />
                    </div>
                </div>
            </div>

            <div class="progress-area">
                <div class="title title-desktop">
                    {{ title }}
                </div>

                <input
                    class="progress wux-form-range"
                    type="range"
                    min="0"
                    :max="duration"
                    step="0.1"
                    v-model.number="currentTime"
                    @input="onSeek"
                    :readonly="uiDisabled"
                    :style="progressBarStyle"
                />

                <div class="time-row">
                    <span class="gray">{{ formatTime(currentTime) }}</span>
                    <span class="gray">{{ formatTime(duration) }}</span>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.player-container {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    padding: 8px 14px 8px 14px;
    background: rgba(245, 245, 247, 0.75);
    z-index: 1000;
    max-width: 1280px;
    margin-left: auto;
    margin-right: auto;
    box-shadow: 0 0 32px 8px rgba(0,0,0,0.28);
    border-top: 1.5px solid #bbb;
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-radius: 12px 12px 0 0;
    overflow: visible;
}

.controls-row {
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: center;
    gap: 8px;
}

.button-group {
    display: flex;
    align-items: center;
    gap: 8px;
    flex-shrink: 0;
}

.title-mobile {
    display: none;
}

.title-desktop {
    display: block;
}

.volume-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.volume-slider {
    position: absolute;
    bottom: 60px;
    left: 50%;
    transform: translateX(-50%);
    width: 100px;
    padding: 8px 14px 8px 14px;
    background: rgba(245, 245, 247, 1);
    z-index: 1099;
    box-shadow: 0 0 32px 8px rgba(0,0,0,0.28);
    border: 1.5px solid #bbb;
    border-radius: 12px 12px 12px 12px;
}

.progress-area {
    display: flex;
    flex-direction: column;
    flex: 1;
    gap: 4px;
    margin-left: 10px;
}

.title {
    text-align: left;
}

.progress {
    width: 100%;
    margin-top: 5px;
    margin-bottom: 5px;
    --form-range-track-background: #00000000;
    border-radius: 999px;
}

.time-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}

@media (max-width: 600px) {
    .controls-row {
        grid-template-columns: 1fr;
        grid-template-rows: auto auto;
        gap: 0;
    }

    .progress-area {
        margin-left: 0;
        margin-top: 6px;
    }

    .title-mobile {
        display: block;
        width: 100%;
        text-align: center;
        font-weight: 500;
        margin-bottom: 6px;
    }

    .title-desktop {
        display: none;
    }

    .button-group {
        justify-content: center;
    }
}

</style>
