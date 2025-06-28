<script setup>
  import Search from "./components/Search.vue"
  import MusicList from "./components/MusicList.vue"
  import PaginationButtons from "@/components/PaginationButtons.vue"
  import {ref} from "vue";
  import {fetchMusicList} from "./music.js";
  import MusicDetail from "./components/MusicDetail.vue";
  import { IconX } from "@tabler/icons-vue";

  const sort = ref("0");
  const order = ref("0");
  const keyword = ref("");

  const pageIndex = ref(0);
  const pageAmount = ref(0);
  const result = ref("正在加载歌曲列表");
  const musicList = ref([]);

  const uiDisabled = ref(false);
  const status = ref("loading");
  const mode = ref("list"); // list: 列表 detail: 详情
  const detailMusicId = ref(0);
  const musicDetailUpdateN = ref(0);

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
  }
  updateMusicList();
</script>

<template>
  <div class="wux-container">
    <ul class="wux-breadcrumb">
      <li class="wux-breadcrumb-item"><a href="/">主页</a></li>
      <li class="wux-breadcrumb-item">一起听歌</li>
    </ul>
    <div class="wux-typo">
      <div :hidden="mode!=='list'">
        <h2 class="mt">歌曲列表</h2>
        <Search :disabled="uiDisabled" @search="search"/>
        <hr>
        <div :hidden="status!=='showing'"><MusicList :music-list="musicList" @update="updateMusicList" @showDetail="showDetail"/></div>
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
          <button type="button" class="wux-btn wux-btn-lg wux-btn-primary wux-btn-text mc right" @click="mode='list'">
            <IconX width="16px" height="16px"/>关闭
          </button>
        </h2>
        <MusicDetail :update-n="musicDetailUpdateN" :music-id="detailMusicId" @update="updateMusicList"/>
      </div>
    </div>
  </div>
</template>

<style scoped>

</style>