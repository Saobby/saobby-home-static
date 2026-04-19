<script setup lang="js">
import { ref, watch } from 'vue';
import { likeMusic } from '../music.js';
import { IconThumbUp, IconThumbUpFilled } from '@tabler/icons-vue';
import { check_logged_in } from '@/assets/js/util.js';
const props = defineProps({
    likes: { type: Number, default: 0 },
    liked: { type: Boolean, default: false },
    musicId: { type: Number, default: 0 },
    btnClass: { type: String, default: "" },
    expiry: { type: Number, default: null },
    sign: { type: String, default: null },
});
const emit = defineEmits(["update", "update:likes", "update:liked"]);

function setLikes(newLikes) {
    if (newLikes !== props.likes) {
        emit("update:likes", newLikes);
    }
}
function setLiked(newLiked) {
    if (newLiked !== props.liked) {
        emit("update:liked", newLiked);
    }
}

const uiDisabled = ref(false);
const result = ref("");

async function likeMusic_(id, like){
    if (check_logged_in()){  // 检查是否登录，未登录自动跳转登录
        return;
    }
    uiDisabled.value = true;
    const rsp = await likeMusic(id, like, props.expiry, props.sign);
    if (rsp.retcode) {
        result.value = "操作失败: " + rsp.msg;
    } else {
        setLikes(rsp.data.likes);
        setLiked(like);
        emit("update");
    }
    uiDisabled.value = false;
}
</script>
<template>
    <button type="button" :class="'wux-btn mc '+btnClass" @click="likeMusic_(musicId, !liked)" :disabled="uiDisabled">
        <IconThumbUp stroke="1.5px" width="24px" height="24px" v-if="!liked"/>
        <IconThumbUpFilled stroke="1.5px" width="24px" height="24px" v-if="liked"/>
        {{ likes }}
    </button>
    <slot><span class="simple result" v-if="result">{{ result }}</span></slot>
</template>