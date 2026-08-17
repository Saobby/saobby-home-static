<script setup lang="js">
import {computed, onMounted, reactive, ref, watch} from 'vue';
import { fetch_api, ts2str } from '@/assets/js/util.js';
import {
    IconEyeOff,
    IconEye,
    IconTrash,
    IconTag,
    IconVinyl,
    IconFileDescription,
    IconMusic,
    IconPlayerPlay,
    IconX,
    IconShare
} from '@tabler/icons-vue';
import CommentsSection from '@/components/CommentsSection.vue';
import LikeMusicBtn from './LikeMusicBtn.vue';
import { jumpToSearchTag } from '../music.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { deleteMusicApi, editMusicApi, setVisibilityApi } from '../music.js';
import { genShareLinkApi } from '../musicWebApi.js';
import MarkdownEdit from '@/components/MarkdownEdit.vue';
import TagEdit from '@/components/TagEdit.vue';
import TitleEdit from '@/components/TitleEdit.vue';
import PopupBackdrop from "@/components/PopupBackdrop.vue";
import TextDisplayWithCopy from "@/components/TextDisplayWithCopy.vue";

const siteUrl = import.meta.env.VITE_SITE_URL;
const musicPageUrl = import.meta.env.VITE_MUSIC_PAGE_URL;
const embeddedMusicPageUrl = import.meta.env.VITE_EMBED_MUSIC_PAGE_URL;

const props = defineProps({
    musicId: { type: Number },
    currentPlayingId: { type: Number, default: -1 },
    expiry: { type: Number, default: null },
    sign: { type: String, default: null }
});
const emit = defineEmits(['play', 'update', 'close']);

defineExpose({
    getMusicInfo
});

const musicInfo = reactive({});
const status = ref("loading");
const result = ref("");
const showCover = ref(false);

const showShareWindow = ref(false);
const shareQuery = ref("");
const htmlAutoplay = ref(false);
const mdAutoplay = ref(false);
const shareTabId = Math.random().toString(36).substring(2, 15);
const shareTab = ref(0);
const shareTabRef = ref(null);

function onShareTabWheel(e) {
  const el = shareTabRef.value;
  if (!el) return;
  const delta = Math.abs(e.deltaX) > Math.abs(e.deltaY) ? e.deltaX : e.deltaY;
  el.scrollLeft += delta;
}

function openShareWindow() {
    showShareWindow.value = true;
    shareTab.value = 0;
    if (!musicInfo.is_private) {
        shareQuery.value = "music_id=" + props.musicId;
    } else if (props.sign) {
        shareQuery.value = "music_id=" + props.musicId + "&expiry=" + props.expiry + "&sign=" + props.sign;
    } else {
        shareQuery.value = "";
    }
}

// 私有音乐: 创建带签名分享链接
const shareExpiry = ref("2592000");
const shareBtnDisabled = ref(false);
const shareResult = ref("");

async function createShareLink() {
    shareBtnDisabled.value = true;
    const rsp = await genShareLinkApi(props.musicId, shareExpiry.value);
    shareBtnDisabled.value = false;
    if (rsp.retcode){
        shareResult.value = rsp.msg;
    }else{
        shareResult.value = "";
        shareQuery.value = rsp.data.url.replace(/^\?/, "");
    }
}

const shareExpiryTs = computed(() => {
    if (!shareQuery.value) return null;
    const m = shareQuery.value.match(/(?:^|&)expiry=(\d+)/);
    return m ? parseInt(m[1]) : null;
});

const pageLink = computed(() => {
    if (!shareQuery.value) return "";
    return siteUrl + musicPageUrl + "?" + shareQuery.value;
});

const htmlEmbedCode = computed(() => {
    if (!shareQuery.value) return "";
    const src = siteUrl + embeddedMusicPageUrl + "?" + shareQuery.value + "&autoplay=" + (htmlAutoplay.value ? "1" : "0");
    return `<iframe src="${src}" width="400" height="82" frameborder="0" allow="autoplay" style="border-radius:10px;overflow:hidden;"></iframe>`;
});

const markdownEmbedCode = computed(() => {
    if (!shareQuery.value) return "";
    return "`一起听歌:" + shareQuery.value + "&autoplay=" + (mdAutoplay.value ? "1" : "0") + "`";
});

async function getMusicInfo(){
    const payload = {
        music_ids: [props.musicId],
        signs: {}
    };
    if (props.sign){
        payload.signs[props.musicId] = {expiry: props.expiry, sign: props.sign};
    }
    if (localStorage.getItem('access-token')) {
        payload.access_token = localStorage.getItem('access-token');
    }
    status.value = "loading";
    result.value = "";
    const rsp = await fetch_api(import.meta.env.VITE_API_DOMAIN+"/api/get_music_urls", payload);
    if (rsp.retcode){
        status.value = "onerror";
        result.value = "音乐信息加载失败:"+rsp.msg;
    }else{
        status.value = "showing";
        result.value = "";
        const data = rsp.data.urls[0];
        if (!data){
            status.value = "onerror";
            result.value = "你要访问的音乐不存在";
            return;
        }
        Object.assign(musicInfo, data);
        showCover.value = false;
    }
}

watch(
    () => { return (props.musicId); },
    (newId, n) => {
        if (newId > 0) {
            getMusicInfo();
        }
    }
);
onMounted(async () => {
    if (props.musicId > 0){
        await getMusicInfo();
    }
});

function emitUpdate() {
    emit("update");
}
function emitPlay() {
    if (props.sign){
        emit("play", musicInfo.id, {expiry: props.expiry, sign: props.sign});
    }else{
        emit("play", musicInfo.id);
    }
}

const delBtnLoading = ref(false);
async function deleteMusic() {
    delBtnLoading.value = true;
    const rsp = await deleteMusicApi(musicInfo.id);
    if (rsp.retcode){
        delBtnLoading.value = false;
        status.value = "onerror";
        result.value = "音乐删除失败:"+rsp.msg;
        return;
    }else{
        delBtnLoading.value = false;
        emitUpdate();
        emit("close");
    }
}
async function editName(newName){
    if (newName === musicInfo.name){
        return {retcode: 100, msg: "你没有修改任何东西"};
    }
    if (!newName){
        return {retcode: 101, msg: "内容不能为空"};
    }
    return await editMusicApi(musicInfo.id, 0, newName);
}
async function editSrc(newSrc){
    if (newSrc === musicInfo.src){
        return {retcode: 100, msg: "你没有修改任何东西"};
    }
    if (!newSrc){
        return {retcode: 101, msg: "内容不能为空"};
    }
    return await editMusicApi(musicInfo.id, 1, newSrc);
}
async function editDesc(newDesc){
    if (newDesc === musicInfo.desc){
        return {retcode: 100, msg: "你没有修改任何东西"};
    }
    return await editMusicApi(musicInfo.id, 2, newDesc);
}
async function editTags(newTags){
    if (JSON.stringify(newTags) === JSON.stringify(musicInfo.tags)){
        return {retcode: 100, msg: "你没有修改任何东西"};
    }
    return await editMusicApi(musicInfo.id, 3, newTags);
}
const setVisibilityBtnLoading = ref(false);
async function setVisibility(visibility){
    if (!visibility){
        const r = confirm("你确定要把这个曲目设为公开吗？该操作不可逆。");
        if (!r){
            return;
        }
    }
    setVisibilityBtnLoading.value = true;
    const rsp = await setVisibilityApi(musicInfo.id, visibility);
    if (rsp.retcode){
        setVisibilityBtnLoading.value = false;
        status.value = "onerror";
        result.value = "设置可见性失败:"+rsp.msg;
        return;
    }else{
        setVisibilityBtnLoading.value = false;
        emitUpdate();
        emit("close");
    }
}

</script>
<template>
    <div :hidden="status!=='loading'" class="centered">
        <span class="wux-loading"></span>
        <br>
        <span>音乐加载中</span>
    </div>
    <div :hidden="status!=='onerror'" class="centered">
        <span class="result" v-html="result"></span>
    </div>
    <div :hidden="status!=='showing'">
        <div class="detail-container same-height-container">
            <div class="detail-cover-col same-height-box">
                <div>
                    <div :hidden="!musicInfo.cover_url" style="text-align: center;">
                        <div class="centered" :hidden="showCover">
                            <span class="wux-loading"></span><br>
                            <span>音乐封面加载中</span>
                        </div>
                        <img class="cover-img" :hidden="!showCover" @load="showCover=true;" :src="musicInfo.cover_url" alt="音乐封面" width="100%">
                    </div>
                    <div class="no-cover-div gray" :hidden="musicInfo.cover_url">
                        <IconMusic :stroke="1" width="100%" height="100%" />
                    </div>
                </div>
            </div>
            <div class="detail-desc-col same-height-box">
                <div>
                    <TitleEdit @edited="emitUpdate" :can-edit="musicInfo.can_edit" :edit="editName" v-model="musicInfo.name"></TitleEdit>
                    <button @click="emitPlay" type="button" class="wux-btn mc"><IconPlayerPlay width="24px" height="24px"/>{{ currentPlayingId===musicId?"正在播放":"播放" }}</button>
                    <LikeMusicBtn btnClass="wux-btn-outline sep" v-model:likes="musicInfo.likes" v-model:liked="musicInfo.liked" :music-id="musicInfo.id" :expiry="props.expiry" :sign="props.sign" @update="emitUpdate"/>
                    <button type="button" class="wux-btn wux-btn-outline sep mc" @click="openShareWindow" :disabled="showShareWindow"><IconShare width="24px" height="24px"/>分享</button>
                    <BtnWithLoading v-if="musicInfo.can_delete" @click="deleteMusic" btnClass="wux-btn-outline sep mc" :isLoading="delBtnLoading">
                        <IconTrash width="24px" height="24px"/>删除
                    </BtnWithLoading>
                    <BtnWithLoading v-if="musicInfo.can_set_private" @click="setVisibility(true)" btnClass="wux-btn-outline sep mc" :isLoading="setVisibilityBtnLoading">
                        <IconEyeOff width="24px" height="24px"/>设为私有
                    </BtnWithLoading>
                    <BtnWithLoading v-if="musicInfo.can_set_public" @click="setVisibility(false)" btnClass="wux-btn-outline sep mc" :isLoading="setVisibilityBtnLoading">
                        <IconEye width="24px" height="24px"/>设为公开
                    </BtnWithLoading>
                    <hr>
                    <b class="mc"><IconVinyl width="16px" height="16px"/>来源</b><br>
                    <MarkdownEdit :edit="editSrc" :can-edit="musicInfo.can_edit" v-model="musicInfo.src" display-default="*暂无信息*" btn-class="wux-btn-sm" placeholder="编辑来源, 32768 字以内"></MarkdownEdit>
                    <hr>
                    <b class="mc"><IconFileDescription width="16px" height="16px"/>描述/推荐理由</b><br>
                    <MarkdownEdit :edit="editDesc" :can-edit="musicInfo.can_edit" v-model="musicInfo.desc" display-default="*暂无信息*" btn-class="wux-btn-sm" placeholder="编辑描述/推荐理由, 200 字以内"></MarkdownEdit>
                    <hr>
                    <b class="mc"><IconTag width="16px" height="16px"/>标签</b><br>
                    <span class="bt"><TagEdit @edited="emitUpdate" :edit="editTags" :can-edit="musicInfo.can_edit" v-model="musicInfo.tags" :clickTag="jumpToSearchTag" default-display="没有任何标签"/></span>
                </div>
            </div>
            <div :hidden="!showShareWindow">
                <PopupBackdrop />
                <div class="pre-like share-window">
                    <button @click="showShareWindow=false;" type="button" class="wux-btn wux-btn-text icon-btn2" style="position: absolute; left: 290px; top: 10px"><IconX width="30px" height="30px" /></button>
                    <h2 style="margin-top: 4px;">分享此页面</h2>
                    <div v-if="musicInfo.is_private && musicInfo.can_share && !shareQuery">
                        <span>分享有效期:</span>
                        <select class="wux-form-select" style="width: 150px" v-model="shareExpiry">
                            <option value="86400">1天</option>
                            <option value="604800">7天</option>
                            <option value="2592000" selected>30天</option>
                        </select>
                        <BtnWithLoading @click="createShareLink" :is-loading="shareBtnDisabled" btn-class="mc simple"><IconShare width="16px" height="16px"/>分享</BtnWithLoading>
                        <span class="result" :hidden="!shareResult" style="display:inline-block;">{{ shareResult }}</span>
                        <br>
                    </div>
                    <div v-if="shareQuery" style="width:100%;overflow-y:hidden;overflow-x:auto;" class="wux-tab" ref="shareTabRef" @wheel.prevent="onShareTabWheel">
                        <div style="white-space:nowrap; padding-bottom: 5px">
                            <span>
                                <input class="wux-tab-item" type="radio" :name="shareTabId" :id="shareTabId+'-link'" :checked="shareTab===0" @click="shareTab=0">
                                <label class="wux-tab-item" :for="shareTabId+'-link'" style="display:inline-block;">分享链接</label>
                            </span>
                            <span>
                                <input class="wux-tab-item" type="radio" :name="shareTabId" :id="shareTabId+'-html'" :checked="shareTab===1" @click="shareTab=1">
                                <label class="wux-tab-item" :for="shareTabId+'-html'" style="display:inline-block;">HTML嵌入代码</label>
                            </span>
                            <span>
                                <input class="wux-tab-item" type="radio" :name="shareTabId" :id="shareTabId+'-md'" :checked="shareTab===2" @click="shareTab=2">
                                <label class="wux-tab-item" :for="shareTabId+'-md'" style="display:inline-block;">本站Markdown嵌入代码</label>
                            </span>
                        </div>
                    </div>
                    <div v-if="shareQuery" style="margin-top:12px;">
                        <div v-show="shareTab===0">
                            <TextDisplayWithCopy :value="pageLink" />
                        </div>
                        <div v-show="shareTab===1">
                            <label class="mc"><input type="checkbox" class="wux-form-checks" v-model="htmlAutoplay"/>自动开播</label><br>
                            <TextDisplayWithCopy :value="htmlEmbedCode" input-class="wux-form-input wux-form-input-md label"/>
                        </div>
                        <div v-show="shareTab===2">
                            <label class="mc"><input type="checkbox" class="wux-form-checks" v-model="mdAutoplay"/>自动开播</label><br>
                            <TextDisplayWithCopy :value="markdownEmbedCode" input-class="wux-form-input wux-form-input-md label"/>
                        </div>
                    </div>
                    <span v-if="musicInfo.is_private && shareExpiryTs"><span class="gray">此分享过期时间:{{ ts2str(shareExpiryTs) }}</span></span>
                </div>
            </div>
        </div>
        <hr>
        <h2>评论区</h2>
        <CommentsSection :placeId="musicInfo.comment_pid" :expiry="props.expiry" :sign="props.sign" />
    </div>
    
</template>
<style scoped>
@media (max-width: 1023px){
    .no-cover-div {
        display: none;
    }
}
.cover-img{
    max-width: 405px;
}
.share-window {
    position: fixed;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 320px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    white-space: normal;
    z-index: 114514;
}
@media (prefers-color-scheme: dark) {
    .share-window {
        background: #242424;
        border-color: #555;
    }
}
body[dark-mode] .share-window {
    background: #242424;
    border-color: #555;
}
@media (min-width: 1024px){
    .detail-container{
        display: flex;
        margin-right: -8px;
        margin-left: -8px;
    }
    .detail-cover-col{
        flex: 1;
        float: left;
        width: 33.33%;
        position: relative;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        display: block;
        min-height: 1px;
        padding-right: 8px;
        padding-left: 8px;
        margin-bottom: 8px;
    }
    .detail-desc-col{
        flex: 2;
        float: left;
        width: 66.67%;
        position: relative;
        -webkit-box-sizing: border-box;
        box-sizing: border-box;
        display: block;
        min-height: 1px;
        padding-right: 8px;
        padding-left: 8px;
        margin-bottom: 8px;
    }
}
</style>