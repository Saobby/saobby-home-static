<script setup lang="js">
import { ref, computed, onMounted } from 'vue';
import { fetch_api, check_logged_in } from '@/assets/js/util.js';
import { captcha } from '@/assets/js/captcha.js';
import MarkdownInput from '@/components/MarkdownInput.vue';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import EmotionsBar from '@/components/EmotionsBar.vue';
import ImageUploader from '@/components/ImageUploader.vue';
import { emotionsPack } from '@/assets/js/emojis';
import { IconEye, IconEdit } from '@tabler/icons-vue';

const domain = import.meta.env.VITE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const postsPageUrl = import.meta.env.VITE_POSTS_PAGE_URL;
const postPageUrl = import.meta.env.VITE_POST_PAGE_URL;

const title = ref("");
const content = ref("");
const result = ref("");
const releasing = ref(false);

const mdInputRef = ref(null);
const isPreview = computed(() => !!(mdInputRef.value && mdInputRef.value.showPreview));
const editorTextarea = computed(() => mdInputRef.value ? mdInputRef.value.textareaRef : null);

let lastSaveDraft = 0;

async function loadPostDraft(){
    const accessToken = localStorage.getItem("access-token");
    if (!accessToken){
        return;
    }
    const rsp = await fetch_api(domain + "/api/get_post_draft", {access_token: accessToken});
    if (rsp.retcode){
        result.value = "无法加载草稿:" + rsp.msg;
        return;
    }
    const raw = rsp.data && rsp.data.content;
    if (!raw){
        return;
    }
    try{
        const draft = JSON.parse(raw);
        if (draft.c){
            content.value = draft.c;
        }
        if (draft.t){
            title.value = draft.t;
        }
    }catch(err){
        result.value = "无法加载草稿:" + err;
    }
}

async function savePostDraft(){
    // 与原版一致：最多每秒存一次草稿
    const ts = Date.now() / 1e3;
    if ((ts - lastSaveDraft) < 1){
        return;
    }
    lastSaveDraft = ts;
    const accessToken = localStorage.getItem("access-token");
    if (!accessToken){
        return;
    }
    if (!title.value && !content.value){
        return;
    }
    const rsp = await fetch_api(domain + "/api/save_post_draft", {
        content: JSON.stringify({t: title.value, c: content.value}),
        access_token: accessToken
    });
    if (rsp.retcode){
        result.value = "无法保存草稿:" + rsp.msg;
    }
}

async function release(){
    if (title.value === "" || content.value === ""){
        result.value = "标题和正文均不能为空";
        return;
    }
    releasing.value = true;
    result.value = "";
    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        result.value = "人机验证失败:" + captchaRsp.msg;
        releasing.value = false;
        return;
    }
    const rsp = await fetch_api(domain + "/api/create_post", {
        access_token: localStorage.getItem("access-token"),
        title: title.value,
        content: content.value,
        captcha_token: captchaRsp.data.token
    });
    if (rsp.retcode){
        result.value = rsp.msg;
        releasing.value = false;
        return;
    }
    result.value = "发表成功";
    window.location = postPageUrl + "?pid=" + rsp.data.name;
}

async function togglePreview(show){
    if (mdInputRef.value){
        await mdInputRef.value.togglePreview(show);
    }
}

onMounted(() => {
    // 未登录会跳到登录页并带上 login_redirect
    if (check_logged_in()){
        return;
    }
    loadPostDraft();
});
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item"><a :href="postsPageUrl">论坛</a></li>
            <li class="wux-breadcrumb-item">创建帖子</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">创建帖子</h2>
            <input type="text" placeholder="帖子标题" class="wux-form-input wux-form-input-md" v-model="title" :disabled="releasing" @input="savePostDraft()">
            <div class="post-edit">
                <MarkdownInput ref="mdInputRef" v-model="content" :show-actions="false" :disabled="releasing" input-class="marked-textarea" placeholder="请输入帖子正文, 最多32768字" @inputContent="savePostDraft()"/>
            </div>
            <!-- 按钮顺序对齐旧版：旧版 float:right 让“发表”在最右，这里用右侧分组的 flex 行 -->
            <div class="action-row">
                <span class="result">{{ result }}</span>
                <div class="action-buttons">
                    <span class="action-item"><ImageUploader :inputRef="editorTextarea" :btnClass="''"/></span>
                    <span class="action-item"><EmotionsBar :emotions="emotionsPack" :inputRef="editorTextarea" :btnClass="''"/></span>
                    <button :hidden="isPreview" type="button" class="wux-btn wux-btn-primary wux-btn-outline simple" @click="togglePreview(true)"><IconEye :width="16" :height="16" class="middle"/><span class="middle">预览</span></button>
                    <button :hidden="!isPreview" type="button" class="wux-btn wux-btn-primary wux-btn-outline simple" @click="togglePreview(false)"><IconEdit :width="16" :height="16" class="middle"/><span class="middle">编辑</span></button>
                    <BtnWithLoading btn-class="wux-btn-primary simple" :is-loading="releasing" @click="release()">发表</BtnWithLoading>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.action-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    /* 与上方编辑框留出间隔（textarea 的 margin-bottom 被清零以保证两框同高，故间距放这里） */
    margin-top: 8px;
}
.action-row .result {
    flex: 1 1 auto;
}
.action-buttons {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
    margin-left: auto;
}
/* 表情/上传按钮的多根节点组件用一层 flex 包裹，垂直对齐更稳 */
.action-item {
    display: flex;
    align-items: center;
}
/* 编辑框与预览框同高：切换预览时页面高度不变，按钮不会跳动 */
.post-edit :deep(textarea) {
    height: calc(100vh - 230px);
    margin-bottom: 0;
}
.post-edit :deep(.pre-like) {
    height: calc(100vh - 230px);
    box-sizing: border-box;
    overflow-y: auto;
}
</style>
