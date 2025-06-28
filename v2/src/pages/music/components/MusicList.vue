<script setup lang="js">
  import {IconUser, IconClock, IconThumbUp, IconPlayerPlay, IconThumbUpFilled, IconInfoCircle} from "@tabler/icons-vue";
  import {ts2str} from "@/assets/js/util.js";
  import { reactive, watch } from "vue";
  import LikeMusicBtn from "./LikeMusicBtn.vue";

  const props = defineProps({
    musicList: {}
  });
  const emit = defineEmits(["play", "update", "showDetail"]);
  const statusMap = reactive({});
  watch(
    ()=>props.musicList, 
    ()=>{
      Object.keys(statusMap).forEach(key => delete statusMap[key]);
    }, 
    {deep: true}
  );

  function emitPlay(musicId){
    emit("play", musicId);
  }
</script>

<template>
  <div>
    <div class="centered" v-if="musicList.length===0">
      <span class="gray">没有任何数据</span>
    </div>
    <div v-for="music in musicList" style="border-bottom: 2px solid #ddd;padding:12px 16px;">
      <a style="color:#000;" href="javascript:;" @click="emit('play', music.id)"><b style="font-size: 20px;">{{ music.name }}</b></a>
      <br>
      <span class="mc"><IconUser width="16px" height="16px" />{{ music.sharer_name || "匿名用户" }}</span>
      <span class="mc gray simple"><IconClock width="16px" height="16px"/>{{ ts2str(music.shared_at) }}</span>
      <br>
      <button @click="emitPlay(music.id)" type="button" class="wux-btn wux-btn-round icon-btn2 mc"><IconPlayerPlay width="24px" height="24px"/></button>
      <LikeMusicBtn v-model:likes="music.likes" v-model:liked="music.liked" :music-id="music.id" btn-class="wux-btn-round wux-btn-text icon-btn2 sep"/>
      <button type="button" class="wux-btn wux-btn-round wux-btn-text icon-btn2 mc sep" @click="emit('showDetail', music.id)">
        <IconInfoCircle stroke="1.5px" width="24px" height="24px"/>详情
      </button>
      <span class="simple result" v-if="statusMap[music.id]?.result">{{ statusMap[music.id]?.result }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>