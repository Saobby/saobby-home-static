<script setup lang="js">
import { ref, reactive, computed, onMounted, nextTick } from 'vue';
import { fetch_api, ts2str, getUrlArgs, check_logged_in, getElementViewportTop, preserveElementPosition } from '@/assets/js/util.js';
import { captcha } from '@/assets/js/captcha.js';
import { confirmDialog, promptDialog } from '@/assets/js/dialog.js';
import CommentsSection from '@/components/CommentsSection.vue';
import MarkdownDisplay from '@/components/MarkdownDisplay.vue';
import MarkdownInput from '@/components/MarkdownInput.vue';
import TagEdit from '@/components/TagEdit.vue';
import PaginationButtons from '@/components/PaginationButtons.vue';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import PopupBackdrop from '@/components/PopupBackdrop.vue';
import EmotionsBar from '@/components/EmotionsBar.vue';
import ImageUploader from '@/components/ImageUploader.vue';
import { emotionsPack } from '@/assets/js/emojis';
import {
    IconPin,
    IconLock,
    IconLockOpen,
    IconPinnedOff,
    IconCircleDot,
    IconUser,
    IconClock,
    IconEye,
    IconVersions,
    IconTags,
    IconTrash,
    IconHistory,
    IconEdit,
    IconX,
    IconCheck,
    IconThumbUp,
    IconThumbUpFilled,
    IconFileDescription,
    IconMarkdown
} from '@tabler/icons-vue';

const domain = import.meta.env.VITE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const postsPageUrl = import.meta.env.VITE_POSTS_PAGE_URL;
const postPageUrl = import.meta.env.VITE_POST_PAGE_URL;
const args = getUrlArgs();

const postData = reactive({});
const status = ref('loading');
const result = ref('');

const editMode = ref(false);
const editTitle = ref('');
const editContent = ref('');

const operateResult = ref('');
const operateLoading = ref(null);
const loveLoading = ref(false);
const saveEditLoading = ref(false);

const historyShow = ref(false);
const historyList = ref([]);
const historyPageIndex = ref(0);
const historyPageAmount = ref(1);
const historyLoading = ref(false);
const historyResult = ref('');
const historyUiDisabled = ref(false);

const commentsSectionRef = ref(null);
const mdDisplayRef = ref(null);
const mdToggleBtnRef = ref(null);
const mdEditInputRef = ref(null);
const operateButtonsRef = ref(null);

const perms = computed(() => postData.permissions || {});
const canEdit = computed(() => !!perms.value.can_edit);
const isMdPreview = computed(() => !!(mdEditInputRef.value && mdEditInputRef.value.showPreview));
const editorTextarea = computed(() => mdEditInputRef.value ? mdEditInputRef.value.textareaRef : null);
const historyEmpty = computed(() => historyList.value.length === 0 && !historyResult.value);

// 用操作按钮行做锚点：正文高度变化时保证按钮行（及整页）不跳
function captureOperateAnchor(){
    return getElementViewportTop(operateButtonsRef.value);
}
async function restoreOperateAnchor(beforeTop){
    await nextTick();
    preserveElementPosition(operateButtonsRef.value, beforeTop);
}

async function toggleEditPreview(show){
    const anchor = captureOperateAnchor();
    if (mdEditInputRef.value){
        await mdEditInputRef.value.togglePreview(show);
    }
    await restoreOperateAnchor(anchor);
}

// 切换 Markdown/渲染视图时把“查看M↓”按钮钉在原位，免得还要手动滚回来
async function toggleMarkdown(){
    const btn = mdToggleBtnRef.value;
    const beforeTop = getElementViewportTop(btn);
    if (mdDisplayRef.value){
        mdDisplayRef.value.toggleShowMd();
    }
    await nextTick();
    preserveElementPosition(btn, beforeTop);
}

async function loadPost(silent=false){
    if (!args.pid){
        status.value = 'onerror';
        result.value = '参数错误';
        return;
    }
    const sendData = { name: args.pid };
    if (args.v){
        sendData.version = parseInt(args.v);
    }
    if (localStorage.getItem("access-token")){
        sendData.access_token = localStorage.getItem("access-token");
    }
    if (!silent){
        status.value = 'loading';
    }
    const rsp = await fetch_api(domain + "/api/get_post_details", sendData);
    if (rsp.retcode){
        if (silent){
            operateResult.value = rsp.msg;
        }else{
            status.value = 'onerror';
            result.value = rsp.msg;
        }
        return;
    }
    Object.assign(postData, rsp.data);
    document.title = postData.title + "-查看帖子-Saobby论坛";
    editTitle.value = postData.title;
    editContent.value = postData.content;
    editMode.value = false;
    if (!silent){
        operateResult.value = '';
    }
    status.value = 'showing';
    if (args.cid){
        scrollToComment(args.cid);
    }
}

async function editPost(){
    const anchor = captureOperateAnchor();
    // 编辑器常驻后预览状态会保留，进入编辑时重置回“编辑”
    if (mdEditInputRef.value){
        mdEditInputRef.value.resetPreview();
    }
    editMode.value = true;
    editTitle.value = postData.title;
    editContent.value = postData.content;
    await restoreOperateAnchor(anchor);
}
async function cancelEdit(){
    const anchor = captureOperateAnchor();
    editMode.value = false;
    operateResult.value = '';
    await restoreOperateAnchor(anchor);
}
async function saveEdit(){
    const title = editTitle.value;
    const content = editContent.value;
    if (title === "" || content === ""){
        operateResult.value = "标题和正文均不能为空";
        return;
    }
    if (content === postData.content && title === postData.title){
        operateResult.value = "你没有修改任何东西";
        return;
    }
    const description = await promptDialog({
        title: "保存编辑",
        content: "请填写编辑摘要/原因:",
        placeholder: "请输入编辑摘要",
        inputRows: 3,
        mustFill: true
    });
    if (description === null){
        operateResult.value = "用户取消了保存";
        return;
    }
    saveEditLoading.value = true;
    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        operateResult.value = "人机验证失败:"+captchaRsp.msg;
        saveEditLoading.value = false;
        return;
    }
    const rsp = await fetch_api(domain + "/api/edit_post", {
        access_token: localStorage.getItem("access-token"),
        name: args.pid,
        title: title,
        content: content,
        description: description,
        captcha_token: captchaRsp.data.token
    });
    if (rsp.retcode){
        operateResult.value = rsp.msg;
        saveEditLoading.value = false;
        return;
    }
    operateResult.value = "编辑成功";
    saveEditLoading.value = false;
    if (args.v){
        window.location = postPageUrl+"?pid="+args.pid;
    }else{
        const anchor = captureOperateAnchor();
        await loadPost(true);
        await restoreOperateAnchor(anchor);
    }
}

async function saveTags(tags){
    if (JSON.stringify(tags) === JSON.stringify(postData.tags || [])){
        return {retcode: 100, msg: "你没有修改任何东西"};
    }
    return await fetch_api(domain + "/api/set_post_tags", {
        access_token: localStorage.getItem("access-token"),
        name: args.pid,
        tags: tags
    });
}

async function love(){
    if (check_logged_in()){
        return;
    }
    loveLoading.value = true;
    const rsp = await fetch_api(domain + "/api/love_post", {
        access_token: localStorage.getItem("access-token"),
        name: args.pid,
        value: !postData.loved
    });
    if (rsp.retcode){
        operateResult.value = rsp.msg;
        loveLoading.value = false;
        return;
    }
    loveLoading.value = false;
    await loadPost(true);
}

async function operate(action){
    if (action === "close"){
        const confirmed = await confirmDialog({
            title: "警告!",
            content: "你确定要关闭这个帖子吗?关闭后你将无法再打开!"
        });
        if (!confirmed){
            operateResult.value = "操作被用户取消";
            return;
        }
    }
    operateLoading.value = action;
    const rsp = await fetch_api(domain + "/api/operate_post", {
        access_token: localStorage.getItem("access-token"),
        name: args.pid,
        action: action
    });
    if (rsp.retcode){
        operateResult.value = rsp.msg;
        operateLoading.value = null;
        return;
    }
    operateResult.value = "操作成功";
    if (action === "delete"){
        window.location = postsPageUrl;
        return;
    }
    operateLoading.value = null;
    await loadPost(true);
}
async function showHistory(){
    historyShow.value = true;
    historyLoading.value = true;
    await loadHistory(0);
}
function closeHistory(){
    historyShow.value = false;
}
async function loadHistory(pageIndex){
    historyUiDisabled.value = true;
    const rsp = await fetch_api(domain + "/api/get_edit_history", {
        name: args.pid,
        page_index: pageIndex,
        page_size: 3
    });
    if (rsp.retcode){
        historyResult.value = rsp.msg;
        historyLoading.value = false;
        historyUiDisabled.value = false;
        return;
    }
    historyResult.value = "";
    historyList.value = rsp.data.history;
    historyPageIndex.value = rsp.data.page_index;
    historyPageAmount.value = rsp.data.page_amount;
    historyLoading.value = false;
    historyUiDisabled.value = false;
}

function scrollToComment(cid){
    let tries = 0;
    const timer = setInterval(() => {
        tries++;
        const el = document.getElementById(`comment-div-${cid}`);
        if (el || tries > 25){
            clearInterval(timer);
            if (el){
                el.scrollIntoView({ behavior: "smooth" });
            }
        }
    }, 200);
}

onMounted(async () => {
    await loadPost();
});
</script>
<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item"><a :href="postsPageUrl">论坛</a></li>
            <li class="wux-breadcrumb-item">查看帖子</li>
        </ul>
        <div class="wux-typo">
            <div :hidden="status!=='loading'" class="centered">
                <span class="wux-loading"></span><span> 正在加载帖子，请稍候...</span>
            </div>
            <div :hidden="status!=='onerror'" class="centered">
                <span class="result" v-html="'无法加载帖子,因为:'+result"></span>
            </div>
            <div :hidden="status!=='showing'">
                <h1 :hidden="editMode" class="mt">
                    <IconPin v-show="postData.is_pinned" style="color:#5064E1;" :width="36" :height="36" class="middle"/>
                    <span :style="'color:#'+(postData.is_closed?'AA0000':'00AA00')"><IconLock v-show="postData.is_closed" :width="36" :height="36" class="middle"/><IconCircleDot v-show="!postData.is_closed" :width="36" :height="36" class="middle"/></span>
                    <span>{{ postData.title }}</span>
                </h1>
                <div :hidden="!editMode">
                    <input type="text" placeholder="帖子标题" class="wux-form-input wux-form-input-md" style="width:100%;" :disabled="saveEditLoading" v-model="editTitle">
                </div>
                <div class="post-meta-row">
                    <span class="mc"><IconUser :width="20" :height="20"/><span>{{ postData.author }}</span></span>
                    <span class="mc gray">
                        <IconClock :width="20" :height="20"/><span>{{ ts2str(postData.modify_time) }}</span>
                        <IconEye :width="20" :height="20" class="meta-sep"/><span>{{ postData.views }}</span>
                        <a href="javascript:;" @click="showHistory()" style="color:#777" class="mc"><IconVersions :width="20" :height="20" class="meta-sep"/>V{{ postData.version }}<span :hidden="postData.is_history">(最新)</span></a>
                    </span>
                </div>
                <div class="tags-line">
                    <span class="gray mc"><IconTags :width="20" :height="20"/></span>
                    <TagEdit :can-edit="canEdit" :edit="saveTags" v-model="postData.tags" :choices="[]" default-display="无"/>
                </div>
                <hr>
                <!-- 用 show(hidden) 而非 v-if：v-if 会重新挂载组件，懒加载的 marked 会先渲染成很短的
                     “Markdown 解析器加载中...”，此时量到的按钮位置在正文撑开后就不准了 -->
                <MarkdownDisplay :show="!editMode" ref="mdDisplayRef" :md="postData.content" :show-btn="false"/>
                <div :hidden="!editMode" class="post-edit">
                    <MarkdownInput ref="mdEditInputRef" v-model="editContent" :show-actions="false" :disabled="saveEditLoading" input-class="marked-textarea" placeholder="请输入帖子正文, 最多32768字"/>
                </div>
                <hr>
                <div ref="operateButtonsRef" class="operate-buttons">
                    <BtnWithLoading :hidden="!perms.can_delete" @click="operate('delete')" btn-class="wux-btn-outline" :is-loading="operateLoading==='delete'"><IconTrash :width="16" :height="16" class="middle"/><span class="middle">删除</span></BtnWithLoading>
                    <BtnWithLoading :hidden="!perms.can_close" @click="operate('close')" btn-class="wux-btn-outline" :is-loading="operateLoading==='close'"><IconLock :width="16" :height="16" class="middle"/><span class="middle">关闭</span></BtnWithLoading>
                    <BtnWithLoading :hidden="!perms.can_open" @click="operate('open')" btn-class="wux-btn-outline" :is-loading="operateLoading==='open'"><IconLockOpen :width="16" :height="16" class="middle"/><span class="middle">打开</span></BtnWithLoading>
                    <BtnWithLoading :hidden="!perms.can_pin" @click="operate('pin')" btn-class="wux-btn-outline" :is-loading="operateLoading==='pin'"><IconPin :width="16" :height="16" class="middle"/><span class="middle">置顶</span></BtnWithLoading>
                    <BtnWithLoading :hidden="!perms.can_unpin" @click="operate('unpin')" btn-class="wux-btn-outline" :is-loading="operateLoading==='unpin'"><IconPinnedOff :width="16" :height="16" class="middle"/><span class="middle">取消置顶</span></BtnWithLoading>
                    <button :hidden="editMode" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="showHistory()"><IconHistory :width="16" :height="16" class="middle"/><span class="middle">查看编辑记录</span></button>
                    <button ref="mdToggleBtnRef" :hidden="editMode || canEdit" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="toggleMarkdown()"><IconMarkdown :width="16" :height="16" class="middle"/><span class="middle">查看M↓</span></button>
                    <button :hidden="editMode || !canEdit" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="editPost()"><IconEdit :width="16" :height="16" class="middle"/><span class="middle">编辑</span></button>
                    <button :hidden="!editMode" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="cancelEdit()"><IconX :width="16" :height="16" class="middle"/><span class="middle">取消</span></button>
                    <button :hidden="!editMode || isMdPreview" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="toggleEditPreview(true)"><IconEye :width="16" :height="16" class="middle"/><span class="middle">预览</span></button>
                    <button :hidden="!editMode || !isMdPreview" type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="toggleEditPreview(false)"><IconEdit :width="16" :height="16" class="middle"/><span class="middle">编辑</span></button>
                    <BtnWithLoading :hidden="!editMode" @click="saveEdit()" btn-class="wux-btn-primary" :is-loading="saveEditLoading"><IconCheck :width="16" :height="16" class="middle"/><span class="middle">保存</span></BtnWithLoading>
                    <span :hidden="!editMode"><EmotionsBar :emotions="emotionsPack" :inputRef="editorTextarea" :btnClass="''"/></span>
                    <span :hidden="!editMode"><ImageUploader :inputRef="editorTextarea" :btnClass="''"/></span>
                </div>
                <span class="result operate-result" v-html="operateResult"></span>
                <button class="wux-btn wux-btn-primary right" type="button" @click="love()" :disabled="loveLoading">
                    <span :hidden="loveLoading"><IconThumbUpFilled v-show="postData.loved" :width="16" :height="16" class="middle"/><IconThumbUp v-show="!postData.loved" :width="16" :height="16" class="middle"/></span>
                    <span :hidden="!loveLoading" class="wux-loading"></span>
                    <span class="middle love-count">{{ postData.loves }}</span>
                </button>
                <hr>
                <h2>评论区</h2>
                <CommentsSection :place-id="postData.comment_place_id" ref="commentsSectionRef"/>
            </div>
            <div :hidden="!historyShow">
                <PopupBackdrop @click="closeHistory()"/>
                <div class="pre-like popup-panel history-window">
                    <button @click="closeHistory()" type="button" class="wux-btn wux-btn-primary wux-btn-text icon-btn history-close-btn"><IconX :width="24" :height="24"/></button>
                    <h2>帖子编辑记录</h2>
                    <div :hidden="!historyLoading" class="centered">
                        <span class="wux-loading"></span><br>
                        <span>编辑记录加载中</span>
                    </div>
                    <div :hidden="historyLoading" class="history-body">
                        <div class="history-content">
                            <span class="result" :hidden="!historyResult" v-html="'无法加载编辑记录,因为:'+historyResult"></span>
                            <div :hidden="!historyEmpty" class="centered"><span class="gray">没有编辑记录</span></div>
                            <div v-for="h in historyList" :key="h.version">
                                <span class="mc"><IconVersions :width="16" :height="16"/>V{{ h.version }}</span>
                                <span class="mc gray history-time"><IconClock :width="16" :height="16"/>{{ ts2str(h.timestamp) }}</span><br>
                                <span :hidden="!h.description" class="mc"><IconFileDescription :width="16" :height="16"/>{{ h.description }}</span>
                                <a :hidden="postData.version===h.version" :href="postPageUrl+'?pid='+args.pid+'&v='+h.version" target="_blank"><button class="wux-btn wux-btn-primary wux-btn-xs view-version-btn" type="button"><IconEye :width="16" :height="16"/>查看此版本</button></a>
                                <i :hidden="postData.version!==h.version" class="gray"> (当前版本)</i>
                                <hr>
                            </div>
                        </div>
                        <div class="history-footer">
                            <PaginationButtons @changePage="loadHistory" :pageIndex="historyPageIndex" :pageAmount="historyPageAmount" :btnAmount="7" :disabled="historyUiDisabled"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.operate-buttons {
    display: inline-flex;
    flex-wrap: wrap;
    gap: 4px;
    align-items: center;
}
.operate-buttons .wux-btn {
    margin: 0;
}
.tags-line {
    display: flex;
    align-items: center;
    gap: 6px;
}
.tags-line :deep(.tag-edit-container) {
    flex: 1 1 auto;
    width: auto;
}
.post-meta-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 10px;
}
.post-meta-row .mc {
    gap: 3px;
}
.post-meta-row :deep(.meta-sep) {
    margin-left: 7px;
}
.post-edit :deep(textarea) {
    height: calc(100vh - 180px);
    margin-bottom: 0;
}
/* 预览框与编辑框同高：切换预览时页面高度不变，按钮不移动、也不会累积滚动漂移 */
.post-edit :deep(.pre-like) {
    height: calc(100vh - 180px);
    box-sizing: border-box;
    overflow-y: auto;
}
.operate-result {
    margin-left: 8px;
    vertical-align: middle;
}
/* 模板里元素之间的空白会被编译器去掉，所以图标与赞数的间隔要显式补上 */
.love-count {
    margin-left: 6px;
}
.history-window {
    position: fixed;
    top: calc(50vh - 200px);
    left: calc(50vw - 200px);
    width: 400px;
    height: 400px;
    white-space: normal;
    display: flex;
    flex-direction: column;
    z-index: 114514;
}
.history-close-btn {
    position: absolute;
    top: 16px;
    right: 20px;
}
.history-body {
    display: flex;
    flex-direction: column;
    flex: 1 1 auto;
    min-height: 0;
}
.history-window h2 {
    margin-top: 0;
    margin-bottom: 8px;
}
.history-footer {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
}
.history-content {
    flex: 1 1 auto;
    min-height: 0;
    overflow-y: auto;
}
.history-content .mc {
    gap: 3px;
}
.history-window .history-content hr {
    margin-top: 4px;
    margin-bottom: 14px;
}
.history-time {
    margin-left: 8px;
}
.view-version-btn {
    display: inline-flex;
    align-items: center;
    gap: 3px;
    margin-left: 10px;
}
</style>

<style>
/* 本页自行补偿滚动位置，关掉浏览器自带的滚动锚定（否则两者叠加、越界被钳到 0 会弹到顶端） */
html,
body {
    overflow-anchor: none;
}
</style>