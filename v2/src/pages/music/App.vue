<script setup>
  import Search from "./components/Search.vue"
  import MusicList from "./components/MusicList.vue"
  import PaginationButtons from "@/components/PaginationButtons.vue"
  import {nextTick, onMounted, ref} from "vue";
  import {fetchMusicList, buildPlayList} from "./music.js";
  import MusicDetail from "./components/MusicDetail.vue";
  import { IconX, IconPlus, IconPlayerPlay } from "@tabler/icons-vue";
  import { Vue3AudioPlayer } from '@codeniu/vue3-audio-player'
  import '@codeniu/vue3-audio-player/dist/vue3-audio-player.css'
  import { getUrlArgs, setUrlArgs, updateUrlArgs } from "@/assets/js/util.js";

  const sort = ref("0");
  const order = ref("0");
  const keyword = ref("");

  const pageIndex = ref(0);
  const pageAmount = ref(0);
  const result = ref("正在加载歌曲列表");
  const musicList = ref([]);
  const playList = ref([]);
  const playMode = ref("single"); // single: 播放单曲 all: 播放全部

  const uiDisabled = ref(false);
  const status = ref("loading");
  const mode = ref("list"); // list: 列表 detail: 详情
  const detailMusicId = ref(0);
  const musicDetailUpdateN = ref(0);
  const playerRef = ref(null);
  const playerKey = ref(0);

  const playAllSort = ref(null);
  const playAllOrder = ref(null);
  const playAllKeyword = ref(null);
  const playAllPageIndex = ref(null);
  const playAllPageAmount = ref(null);
  const playAllListIndex = ref(null);

  async function updateMusicList() {
    uiDisabled.value = true;
    const rsp = await fetchMusicList(sort.value, order.value, pageIndex.value, keyword.value);
    if (rsp.retcode){
      result.value = "加载歌曲列表失败: "+rsp.msg;
      musicList.value = [];
      status.value = "onerror";
    }else{
      result.value = "";
      musicList.value = rsp.data.list;
      pageIndex.value = rsp.data.pg_index;
      pageAmount.value = rsp.data.pg_amount;
      status.value = "showing";
    }
    uiDisabled.value = false;
  }
  function search(params) {
    sort.value = params.sort;
    order.value = params.order;
    keyword.value = params.keyword;
    pageIndex.value = 0; // 重置页码
    updateMusicList();
  }
  function changePage(index){
    pageIndex.value = index;
    updateMusicList();
  }
  function showDetail(musicId) {
    detailMusicId.value = musicId;
    mode.value = "detail";
    musicDetailUpdateN.value += 1;  // 强制更新音乐详情组件
    updateUrlArgs({ music_id: musicId});
  }
  updateMusicList();
  onMounted(() => {
    const urlArgs = getUrlArgs();
    if (urlArgs.music_id) {
      showDetail(urlArgs.music_id);
    }
  });
  async function playSingle(id){
    playMode.value = "single";
    await setPlayList([id]);
    playerKey.value += 1; // 重新挂载播放器,重置播放列表index
    await nextTick();
    playerRef.value.pause();
    playerRef.value.play();
  }
  async function playAll() {
    playAllSort.value = sort.value;
    playAllOrder.value = order.value;
    playAllKeyword.value = keyword.value;
    playAllPageIndex.value = -1;
    playAllListIndex.value = 0;
    playAllPageAmount.value = 9999;
    playList.value = [];

    playMode.value = "all";
    await expandPlayList();
    playerKey.value += 1; // 重新挂载播放器,重置播放列表index
    await nextTick();
    playerRef.value.pause();
    playerRef.value.play();
  }
  async function setPlayList(ids){
    const rsp = await buildPlayList(ids);
    if (rsp.retcode){

    }else{
      playList.value = rsp.data;
    }
  }
  async function expandPlayList(){
    if (playAllPageIndex.value >= playAllPageAmount.value - 1) {
      return;
    }
    const rsp = await fetchMusicList(playAllSort.value, playAllOrder.value, playAllPageIndex.value+1, playAllKeyword.value, 10);
    if (rsp.retcode){
      return;
    }
    playAllPageIndex.value = rsp.data.pg_index;
    playAllPageAmount.value = rsp.data.pg_amount;
    let ids = [];
    for (let i=0; i<rsp.data.list.length; i++){
      ids.push(rsp.data.list[i].id);
    }
    const rsp2 = await buildPlayList(ids);
    if (rsp2.retcode){
      return;
    }
    playList.value = playList.value.concat(rsp2.data);
  }
  async function onPlayNext(){
    if (playMode.value === "all") {
      if (playAllListIndex.value >= playList.value.length - 1) {
        await expandPlayList();
      }
    }
  }

  async function befNext(){
    if (playMode.value === "all") {
      playAllListIndex.value += 1;
    }
    return true;
  }
  async function befPrev(){
    if (playMode.value === "all") {
      playAllListIndex.value -= 1;
    }
    return true;
  }
  
</script>

<template>
  <div class="wux-container">
    <ul class="wux-breadcrumb">
      <li class="wux-breadcrumb-item"><a href="/">主页</a></li>
      <li class="wux-breadcrumb-item">一起听歌</li>
    </ul>
    <div class="wux-typo" style="padding-bottom: 140px;">
      <div :hidden="mode!=='list'">
        <h2 class="mt">歌曲列表</h2>
        <Search :disabled="uiDisabled" @search="search">
          <a href="/share_music"><button type="button" class="wux-btn wux-btn-primary mc simple"><IconPlus width="16px" height="16px" />分享音乐</button></a>
          <button @click="playAll" type="button" class="wux-btn wux-btn-primary mc simple"><IconPlayerPlay width="16px" height="16px" />播放全部</button>
        </Search>
        <hr>
        <div :hidden="status!=='showing'"><MusicList :music-list="musicList" @play="playSingle" @update="updateMusicList" @showDetail="showDetail"/></div>
        <div :hidden="status!=='loading'" class="centered">
          <span class="wux-loading" /><br>
          <span>歌曲列表加载中</span>
        </div>
        <div :hidden="status!=='onerror'">
          <span class="result" v-html="result"></span>
        </div>
        <PaginationButtons :page-index="pageIndex" :page-amount="pageAmount" btn-amount="7" :disabled="uiDisabled" @change-page="changePage"/>
      </div>
      <div :hidden="mode!=='detail'">
        <h2 class="mt">歌曲详情
          <button type="button" class="wux-btn wux-btn-lg wux-btn-primary wux-btn-text mc right" @click="mode='list';setUrlArgs({});">
            <IconX width="16px" height="16px"/>关闭
          </button>
        </h2>
        <MusicDetail :update-n="musicDetailUpdateN" :music-id="detailMusicId" @play="playSingle" @update="updateMusicList"/>
      </div>
      <div class="fixed-bottom">
        <Vue3AudioPlayer 
          ref="playerRef"
          :progressInterval="50" 
          themeColor="#5064e1"
          :audioList="playList"
          :isLoop="false"
          :beforeNext="befNext"
          :beforePrev="befPrev"
          @play-next="onPlayNext"
          :key="playerKey"
        ></Vue3AudioPlayer>
      </div>
    </div>
  </div>
</template>

<style scoped>
  .fixed-bottom {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
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
</style>