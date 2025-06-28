<script setup lang="js">
  import {IconUser, IconClock, IconThumbUp, IconPlayerPlay, IconThumbUpFilled, IconInfoCircle} from "@tabler/icons-vue";
  import {ts2str, check_logged_in} from "@/assets/js/util.js";
  import { reactive, watch } from "vue";
  import {likeMusic} from "../music.js";

  const props = defineProps({
    musicList: {}
  });
  const emit = defineEmits(["play", "update", "showDetail"]);
  const statusMap = reactive({});
  async function likeMusic_(id, like){
    if (check_logged_in()){  // 检查是否登录，未登录自动跳转登录
      return;
    }
    statusMap[id] = {disabled: true};
    const rsp = await likeMusic(id, like);
    if (rsp.retcode) {
      statusMap[id].result = "操作失败: " + rsp.msg;
    } else {
      emit("update");
    }
    statusMap[id].disabled = false;
  }
  watch(
    ()=>props.musicList, 
    ()=>{
      Object.keys(statusMap).forEach(key => delete statusMap[key]);
    }, 
    {deep: true}
  );
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
      <button type="button" class="wux-btn wux-btn-round icon-btn2 mc"><IconPlayerPlay width="24px" height="24px"/></button>
      <button type="button" class="wux-btn wux-btn-round wux-btn-text icon-btn2 mc wux-btn-outline sep" @click="likeMusic_(music.id, !music.liked)" :disabled="statusMap[music.id]?.disabled">
        <IconThumbUp stroke="1.5px" width="24px" height="24px" v-if="!music.liked"/>
        <IconThumbUpFilled stroke="1.5px" width="24px" height="24px" v-if="music.liked"/>
        {{ music.likes }}
      </button>
      <button type="button" class="wux-btn wux-btn-round wux-btn-text icon-btn2 mc wux-btn-outline sep" @click="emit('showDetail', music.id)">
        <IconInfoCircle stroke="1.5px" width="24px" height="24px"/>详情
      </button>
      <span class="simple result" v-if="statusMap[music.id]?.result">{{ statusMap[music.id]?.result }}</span>
    </div>
  </div>
</template>

<style scoped>

</style>