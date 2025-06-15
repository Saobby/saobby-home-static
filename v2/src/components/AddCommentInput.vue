<script setup lang="js">
import MarkdownInput from './MarkdownInput.vue';
import { IconCheck, IconLogin2 } from '@tabler/icons-vue';
import { fetch_api } from '@/assets/js/util.js';
import { ref } from 'vue';
import { captcha } from '@/assets/js/captcha.js';

const props = defineProps({
    placeId: { type: Number },
    replyTo: { type: Number, default: -1 },
    rows: { type: Number, default: 5 },
    placeholder: { type: String, default: "" },
    btnClass: { type: String, default: "" }
});
const emits = defineEmits(['commentAdded']);

const result = ref("");
const loading = ref(false);
const accessToken = localStorage.getItem("access-token");

async function addComment(){
    const content = inputRef.value.getContent();
    if (!content){
        result.value = "评论内容不能为空";
        return;
    }
    loading.value = true;
    const rsp0 = await captcha();
    if (rsp0.retcode){
        result.value = "人机验证失败:"+rsp0.msg;
        loading.value = false;
        return;
    }
    const payload = {
        access_token: accessToken,
        captcha_token: rsp0.data.token,
        content: content,
        place_id: props.placeId,
        reply_to: props.replyTo
    }
    const rsp1 = await fetch_api(import.meta.env.VITE_API_DOMAIN + "/api/post_comment", payload);
    if (rsp1.retcode) {
        result.value = rsp1.msg;
    } else {
        inputRef.value.setContent("");
        result.value = "";
        emits('commentAdded');
    }
    loading.value = false;
}

const inputRef = ref(null);

</script>
<template>
    <MarkdownInput ref="inputRef" :rows="rows" :placeholder="placeholder" :btnClass="btnClass">
        <slot />
        <button @click="addComment()" :disabled="loading || !accessToken" :class="'wux-btn wux-btn-primary simple mc '+btnClass" type="button">
            <span :hidden="loading" class="mc"><IconCheck width="16px" height="16px" />发表</span>
            <span :hidden="!loading" class="wux-loading"></span>
        </button>
    </MarkdownInput>
    <span class="result" v-html="result"></span>
    <span v-if="!accessToken">请先<a href="/login" class="mc"><IconLogin2 width="16px" height="16px" />登录</a></span>
</template>