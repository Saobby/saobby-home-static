<script setup>
  import Search from "./components/Search.vue"
  import MusicList from "./components/MusicList.vue"
  import PaginationButtons from "@/components/PaginationButtons.vue"
  import {computed, onMounted, onUnmounted, ref} from "vue";
  import {fetchMusicList} from "./music.js";
  import MusicDetail from "./components/MusicDetail.vue";
  import { IconX, IconPlus, IconPlayerPlay } from "@tabler/icons-vue";
  import AudioPlayer from "./components/AudioPlayer.vue";
  import { getUrlArgs, updateUrlArgs } from "@/assets/js/util.js";
  import BtnWithLoading from "@/components/BtnWithLoading.vue";

  const shareMusicPageUrl = import.meta.env.VITE_SHARE_MUSIC_PAGE_URL;

  const sort = ref("0");
  const order = ref("0");
  const keyword = ref("");
  const includedTags = ref([]);
  const excludedTags = ref([]);

  const pageIndex = ref(0);
  const pageAmount = ref(0);
  const result = ref("正在加载歌曲列表");
  const musicList = ref([]);

  const uiDisabled = ref(false);
  const status = ref("loading");
  const mode = ref("list"); // list: 列表 detail: 详情
  const detailMusicId = ref(0);
  const playerRef = ref(null);
  const currentPlayingId = computed(() => {
      if (!playerRef.value){
          return 0;
      }
      return playerRef.value.currentPlayingId;
  });

  const playAllBtnDisabled = ref(false);
  const playerUiDisabled = ref(false);

  async function updateMusicList() {
    uiDisabled.value = true;
    const rsp = await fetchMusicList(sort.value, order.value, pageIndex.value, keyword.value, includedTags.value, excludedTags.value);
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
    includedTags.value = params.includedTags;
    excludedTags.value = params.excludedTags;
    pageIndex.value = 0; // 重置页码
    updateMusicList();
  }
  function changePage(index){
    pageIndex.value = index;
    updateMusicList();
  }
  function showDetail(musicId) {
    musicId = parseInt(musicId);
    detailMusicId.value = musicId;
    mode.value = "detail";
    updateUrlArgs({ music_id: musicId});
  }
  updateMusicList();
  function checkShowingDetail(){
    const urlArgs = getUrlArgs();
    if (urlArgs.music_id) {
      showDetail(urlArgs.music_id);
      return true;
    }
    return false;
  }
  onMounted(() => {
    checkShowingDetail();
    // 用户点浏览器前进/后退按钮引起url改变时更新页面状态
    const handlePopState = (e) => {
      const s = checkShowingDetail();
      if (!s) {
        closeMusicDetail();
      }
    };
    window.addEventListener('popstate', handlePopState);
    onUnmounted(() => {
      window.removeEventListener('popstate', handlePopState);
    });
  });
  async function playSingle(id){
      await playerRef.value.playSingle(id);
  }
  async function playAll() {
      playAllBtnDisabled.value = true;
      playerUiDisabled.value = true;
      await playerRef.value.playAll(sort.value, order.value, keyword.value, includedTags.value, excludedTags.value);
      playAllBtnDisabled.value = false;
      playerUiDisabled.value = false;
  }
  function handlePlayerError(msg){
      result.value = "播放器发生错误: "+msg;
      musicList.value = [];
      status.value = "onerror";
  }

  function closeMusicDetail(){
    mode.value = 'list';
    updateUrlArgs({music_id: undefined, comment_id: undefined});
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
          <BtnWithLoading :isLoading="playAllBtnDisabled" btnClass="wux-btn-primary mc simple" @click="playAll">
            <IconPlayerPlay width="16px" height="16px" />播放全部
          </BtnWithLoading>
          <a :href="shareMusicPageUrl" target="_blank"><button type="button" class="wux-btn wux-btn-primary wux-btn-outline mc simple"><IconPlus width="16px" height="16px" />分享音乐</button></a>
        </Search>
        <hr>
        <div :hidden="status!=='showing'"><MusicList :currentPlayingId="currentPlayingId" :music-list="musicList" @play="playSingle" @update="updateMusicList" @showDetail="showDetail"/></div>
        <div :hidden="status!=='loading'" class="centered">
          <span class="wux-loading" /><br>
          <span>歌曲列表加载中</span>
        </div>
        <div :hidden="status!=='onerror'">
          <span class="result" v-html="result"></span>
        </div>
        <PaginationButtons :page-index="pageIndex" :page-amount="pageAmount" :btn-amount="7" :disabled="uiDisabled" @change-page="changePage"/>
      </div>
      <div v-if="mode==='detail'">
<!--          每次打开详情都会重新挂载MusicDetail，就不用每次强制刷新-->
        <h2 class="mt">歌曲详情
          <button type="button" class="wux-btn wux-btn-lg wux-btn-primary wux-btn-text mc right" @click="closeMusicDetail">
            <IconX width="16px" height="16px"/>关闭
          </button>
        </h2>
        <MusicDetail :currentPlayingId="currentPlayingId" :music-id="detailMusicId" @play="playSingle" @update="updateMusicList" @close="closeMusicDetail"/>
      </div>
      <div>
          <AudioPlayer @error="handlePlayerError" :disable-ui="playerUiDisabled" initial-title="点击播放按钮以播放" @request-play="playAll" ref="playerRef"></AudioPlayer>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>