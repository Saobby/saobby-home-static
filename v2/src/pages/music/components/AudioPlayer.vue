<script setup lang="js">
import {nextTick, onBeforeUnmount, onMounted, ref} from "vue"
import Hls from "hls.js"
import {getMusicUrlsApi} from "../musicWebApi.js";

const audio = ref(null);
let hls = null;
let musicInfoCache = {};

const title = ref("未知歌曲");
const isPlaying = ref(false);
const showVolume = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);

function togglePlay() {
    if (!audio.value) return;
    if (isPlaying.value) {
        audio.value.pause();
    } else {
        audio.value.play();
    }
    isPlaying.value = !isPlaying.value;
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
}

function toggleVolume() {
    showVolume.value = !showVolume.value;
}

function onVolumeChange() {
    if (audio.value) {
        audio.value.volume = volume.value;
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
            showErrorMsg(rsp.msg);
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

function destroyHls(){
    if (hls){
        hls.detachMedia();
        hls.destroy();
        hls = null;
    }
}

function setUpHls(m3u8Url){
    if (Hls.isSupported()){
        destroyHls();
        hls = new Hls();
        hls.loadSource(m3u8Url);
        hls.attachMedia(audio.value);
    }else{
        audio.value.src = m3u8Url;
    }
}

async function handlePlay(musicType, src, musicTitle) {
    switch (musicType){
        case "default":
            destroyHls();
            audio.value.src = src;
            break;
        case "m3u8":
            setUpHls(src);
            break;
    }
    await nextTick();
    play();
    title.value = musicTitle;
}

function showErrorMsg(msg){
    console.error(msg);
}

async function playSingle(musicId) {
    const musicInfo = (await getMusicUrls([musicId]))[0];
    await handlePlay(
        musicInfo.version === 2 ? "m3u8": "default",
        musicInfo.audio_url,
        musicInfo.name
    );
}

defineExpose({
    playSingle,
})

onBeforeUnmount(() => {
    destroyHls();
});

</script>

<template>
    <div class="player-container">
        <audio
            ref="audio"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
        />
        <div class="controls-row">
            <button>⏮</button>
            <button @click="togglePlay">
                {{ isPlaying ? "⏸" : "▶" }}
            </button>
            <button>⏭</button>
            <button>🔁</button>

            <div class="volume-wrapper">
                <button @click="toggleVolume">🔊</button>
                <div v-if="showVolume" class="volume-slider">
                    <input
                        type="range"
                        min="0"
                        max="1"
                        step="0.01"
                        v-model.number="volume"
                        @input="onVolumeChange"
                        orient="vertical"
                    />
                </div>
            </div>

            <div class="progress-area">
                <div class="title">
                    {{ title }}
                </div>

                <input
                    class="progress"
                    type="range"
                    min="0"
                    :max="duration"
                    step="0.1"
                    v-model.number="currentTime"
                    @input="onSeek"
                />

                <div class="time-row">
                    <span>{{ formatTime(currentTime) }}</span>
                    <span>{{ formatTime(duration) }}</span>
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
    background: white;
    padding: 10px;
}

.controls-row {
    display: flex;
    align-items: center;
    gap: 8px;
}

.volume-wrapper {
    position: relative;
    display: flex;
    align-items: center;
}

.volume-slider {
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
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
}

.time-row {
    display: flex;
    justify-content: space-between;
    font-size: 12px;
}
</style>
