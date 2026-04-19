<script setup lang="js">
import MarkdownInput from './MarkdownInput.vue';
import { IconCheck, IconLogin2 } from '@tabler/icons-vue';
import { fetch_api } from '@/assets/js/util.js';
import {onBeforeUnmount, ref} from 'vue';
import { captcha } from '@/assets/js/captcha.js';

const loginPageUrl = import.meta.env.VITE_LOGIN_PAGE_URL;

const props = defineProps({
    placeId: { type: Number },
    replyTo: { type: Number, default: -1 },
    rows: { type: Number, default: 5 },
    placeholder: { type: String, default: "" },
    btnClass: { type: String, default: "" },
    expiry: { type: Number, default: null },
    sign: { type: String, default: null }
});
const emits = defineEmits(['commentAdded']);

const result = ref("");
const loading = ref(false);
let isDirty = false;
let lastSavedContent = null;
let saveDraftInterval = null;
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
    if (props.sign && props.expiry){
        payload.expiry = props.expiry;
        payload.sign = props.sign;
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

async function saveDraft(){
    if (!isDirty) return;
    const accessToken = localStorage.getItem("access-token");
    if (!accessToken){
        return;
    }
    const content = inputRef.value.getContent();
    if (!content){
        return;
    }
    const rsp = await fetch_api(import.meta.env.VITE_API_DOMAIN + "/api/save_comment_draft", {
        access_token: accessToken,
        content: content,
        place_id: props.placeId,
        reply_to: props.replyTo
    });
    if (rsp.retcode) {
        result.value = "保存草稿失败:"+rsp.msg;
    }else{
        isDirty = false;
        lastSavedContent = content;
    }
}

async function loadDraft(placeId) {
    const accessToken = localStorage.getItem("access-token");
    if (!accessToken){
        return;
    }
    const rsp = await fetch_api(import.meta.env.VITE_API_DOMAIN + "/api/get_comment_draft", {
        access_token: accessToken,
        place_id: placeId || props.placeId,
        reply_to: props.replyTo
    });
    if (rsp.retcode) {
        result.value = "加载草稿失败:"+rsp.msg;
    } else {
        if (rsp.data.content){
            inputRef.value.setContent(rsp.data.content);
        }
    }
}

defineExpose({
    loadDraft
});

// 只有用户输入过一次内容，才初始化 setInterval
function initSaveDraft(){
    if (saveDraftInterval !== null) return;
    saveDraftInterval = window.setInterval(
        saveDraft,
        2e3
    );
}

onBeforeUnmount(() => {
    if (saveDraftInterval !== null) {
      window.clearInterval(saveDraftInterval);
    }
});

function setDirty(){
    if (inputRef.value.getContent() !== lastSavedContent){
        isDirty = true;
    }
}

</script>
<template>
    <MarkdownInput @inputContent="initSaveDraft();setDirty();" ref="inputRef" :rows="rows" :placeholder="placeholder" :btnClass="btnClass">
        <slot />
        <button @click="addComment()" :disabled="loading || !accessToken" :class="'wux-btn wux-btn-primary simple mc '+btnClass" type="button">
            <span :hidden="loading" class="mc"><IconCheck width="16px" height="16px" />发表</span>
            <span :hidden="!loading" class="wux-loading"></span>
        </button>
    </MarkdownInput>
    <span class="result" v-html="result"></span>
    <span v-if="!accessToken">请先<a :href="loginPageUrl" class="mc"><IconLogin2 width="16px" height="16px" />登录</a></span>
</template>