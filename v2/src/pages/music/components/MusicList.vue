<script setup lang="js">
  import {IconUser, IconClock, IconThumbUp, IconPlayerPlay, IconThumbUpFilled, IconInfoCircle} from "@tabler/icons-vue";
  import {ts2str} from "@/assets/js/util.js";
  import { reactive, watch } from "vue";
  import LikeMusicBtn from "./LikeMusicBtn.vue";
  import TagsDisplay from "@/components/TagsDisplay.vue";
  import { jumpToSearchTag } from "../music";

  const props = defineProps({
    musicList: {},
    currentPlayingId: {type: Number, default: -1}
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
    <div v-for="music in musicList" class="bottom-line">
        <span class="wux-tag wux-tag-error" v-if="music.is_private">私有</span><a class="music-title-link" href="javascript:;" @click="emitPlay(music.id)"><b style="font-size: 20px;">{{ music.name }}</b></a>
      <br>
      <span class="bt" :hidden="music.tags.length===0"><TagsDisplay @click="jumpToSearchTag" :tags="music.tags"/></span>
      <br :hidden="music.tags.length===0">
      <span class="mc"><IconUser width="16px" height="16px" />{{ music.sharer_name || "匿名用户" }}</span>
      <span class="mc gray lleft"><IconClock width="16px" height="16px"/>{{ ts2str(music.shared_at) }}</span>
      <br>
      <button @click="emitPlay(music.id)" type="button" :class="music.id!==currentPlayingId?'wux-btn wux-btn-round icon-btn2 mc':'wux-btn wux-btn-error wux-btn-round icon-btn2 mc'"><IconPlayerPlay width="24px" height="24px"/></button>
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