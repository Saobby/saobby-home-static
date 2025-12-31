<script setup lang="js">
import {nextTick, onBeforeUnmount, onMounted, ref} from "vue"
import Hls from "hls.js"
import {getMusicUrlsApi, fetchMusicListApi} from "../musicWebApi.js";

const audio = ref(null);
let hls = null;
let musicInfoCache = {};

let playMode = null;
let playList = [];
let playIndex = -1;
let searchArgs = {};

const title = ref("未知歌曲");
const isPlaying = ref(false);
const showVolume = ref(false);
const currentTime = ref(0);
const duration = ref(0);
const volume = ref(1);

// 以下为控件处理函数
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

function handleError(msg){
    console.error(msg);
}

defineExpose({
    playSingle,
    playAll
})

onBeforeUnmount(() => {
    destroyHls();
});

// 以下为单曲播放逻辑实现
async function playSingle(musicId) {
    playMode = "single";
    const rsp = await getMusicUrls([musicId]);
    if (!rsp){
        return;
    }
    const musicInfo = rsp[0];
    await handlePlay(
        musicInfo.version === 2 ? "m3u8": "default",
        musicInfo.audio_url,
        musicInfo.name
    );
}

// 以下为列表播放逻辑实现
async function playAll(sort, order, keyword, includedTags, excludedTags){
    playMode = "list";
    searchArgs = {
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
        searchArgs.sort,
        searchArgs.order,
        searchArgs.pageIndex,
        searchArgs.keyword,
        searchArgs.includedTags,
        searchArgs.excludedTags,
        searchArgs.pageSize
    )
    if (rsp.retcode){
        handleError("无法加载播放列表: "+rsp.msg);
        return;
    }
    searchArgs.pageAmount = rsp.data.pg_amount;
    searchArgs.pageIndex += 1;
    const list = rsp.data.list;
    let newIds = [];
    for (const i of list){
        newIds.push(i.id);
    }
    await getMusicUrls(newIds);  // 预先加载并缓存音频链接
    playList = playList.concat(newIds);
}

async function startPlay(){
    const musicId = playList[playIndex];
    const rsp = await getMusicUrls([musicId]);
    const musicInfo = rsp[0];
    await handlePlay(
        musicInfo.version === 2 ? "m3u8": "default",
        musicInfo.audio_url,
        musicInfo.name
    );
}

async function nextMusic(){
    if (playIndex >= playList.length - 1) return;
    if (playIndex === playList.length - 2){
        expandPlaylist().then();  // 准备开始播放列表中的最后一曲时加载后面的播放列表
    }
    playIndex++;
    await startPlay();
}

async function prevMusic(){
    if (playIndex <= 0) return;
    playIndex--;
    await startPlay();
}

function onEnd(){
    if (playMode === "list"){
        nextMusic().then();
    }
}

</script>

<template>
    <div class="player-container">
        <audio
            ref="audio"
            @timeupdate="onTimeUpdate"
            @loadedmetadata="onLoadedMetadata"
            @ended="onEnd"
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
