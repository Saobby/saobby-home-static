<script setup lang="js">
import MarkdownInput from './MarkdownInput.vue';
import { IconCheck, IconLogin2 } from '@tabler/icons-vue';
import { fetch_api } from '@/assets/js/util.js';
import { watch, ref } from 'vue';

const props = defineProps({
    cid: { type: Number },
    content: { type: String, default: "" },
    rows: { type: Number, default: 5 },
    placeholder: { type: String, default: "" },
    btnClass: { type: String, default: "" }
});
const emits = defineEmits(['commentEdited']);

const result = ref("");
const loading = ref(false);
const accessToken = localStorage.getItem("access-token");

async function editComment(){
    const newContent = inputRef.value.getContent();
    if (!newContent){
        result.value = "评论内容不能为空";
        return;
    }
    if (newContent === props.content) {
        result.value = "评论未修改";
        return;
    }
    loading.value = true;
    const payload = {
        access_token: accessToken,
        content: newContent,
        cid: props.cid
    }
    const rsp = await fetch_api(import.meta.env.VITE_API_DOMAIN + "/api/edit_comment", payload);
    if (rsp.retcode) {
        result.value = rsp.msg;
    } else {
        result.value = "";
        emits('commentEdited');
    }
    loading.value = false;
}

const inputRef = ref(null);

function setContent() {
    if (inputRef.value) {
        inputRef.value.setContent(props.content);
    }
}

watch(()=>(inputRef.value), ()=>{
    setContent();
});
watch(()=>(props.content), (newVal)=>{
    setContent();
});

</script>
<template>
    <MarkdownInput ref="inputRef" :rows="rows" :placeholder="placeholder" :btnClass="btnClass">
        <slot />
        <button @click="editComment()" :disabled="loading" :class="'wux-btn wux-btn-primary simple mc '+btnClass" type="button">
            <span :hidden="loading" class="mc"><IconCheck width="16px" height="16px" />保存</span>
            <span :hidden="!loading" class="wux-loading"></span>
        </button>
    </MarkdownInput>
    <span class="result" v-html="result"></span>
</template>