<script setup lang="js">
import {onMounted, reactive, ref, watch} from 'vue';
import { fetch_api, ts2str } from '@/assets/js/util.js';
import { IconDownload, IconTrash, IconTag, IconVinyl, IconFileDescription, IconUser, IconClock, IconMusic, IconBrandSpeedtest, IconStackFront, IconWaveSawTool, IconPlayerPlay } from '@tabler/icons-vue';
import CommentsSection from '@/components/CommentsSection.vue';
import LikeMusicBtn from './LikeMusicBtn.vue';
import { jumpToSearchTag } from '../music.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { deleteMusicApi, editMusicApi } from '../music.js';
import MarkdownEdit from '@/components/MarkdownEdit.vue';
import TagEdit from '@/components/TagEdit.vue';
import TitleEdit from '@/components/TitleEdit.vue';

const props = defineProps({
    musicId: { type: Number },
    currentPlayingId: { type: Number, default: -1 }
});
const emit = defineEmits(['play', 'update', 'close']);

defineExpose({
    getMusicInfo
});

const musicInfo = reactive({});
const status = ref("loading");
const result = ref("");
const showCover = ref(false);

async function getMusicInfo(){
    const payload = {
        music_ids: [props.musicId]
    };
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
    emit("play", musicInfo.id);
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
        <div class="wux-row-md-3 same-height-container">
            <div class="wux-col same-height-box">
                <div>
                    <div :hidden="!musicInfo.cover_url" style="text-align: center;">
                        <div class="centered" :hidden="showCover">
                            <span class="wux-loading"></span><br>
                            <span>音乐封面加载中</span>
                        </div>
                        <img class="cover-img" :hidden="!showCover" @load="showCover=true;" :src="musicInfo.cover_url" alt="音乐封面" width="100%">
                    </div>
                    <div class="no-cover-div" :hidden="musicInfo.cover_url" style="color:#777">
                        <IconMusic :stroke="1" width="100%" height="100%" />
                    </div>
                </div>
            </div>
            <div class="wux-col same-height-box">
                <div>
                    <TitleEdit @edited="emitUpdate" :can-edit="musicInfo.can_edit" :edit="editName" v-model="musicInfo.name"></TitleEdit>
                    <button @click="emitPlay" type="button" class="wux-btn mc"><IconPlayerPlay width="24px" height="24px"/>{{ currentPlayingId===musicId?"正在播放":"播放" }}</button>
                    <LikeMusicBtn btnClass="wux-btn-outline sep" v-model:likes="musicInfo.likes" v-model:liked="musicInfo.liked" :music-id="musicInfo.id" @update="emitUpdate"/>
                    <BtnWithLoading v-if="musicInfo.can_delete" @click="deleteMusic" btnClass="wux-btn-outline sep mc" :isLoading="delBtnLoading">
                        <IconTrash width="24px" height="24px"/>删除
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
            <div class="wux-col same-height-box">
                <div>
                    <h3>音乐信息</h3>
                    <span class="mc" title="推荐用户"><IconUser width="16px" height="16px"/><span class="simple">{{ musicInfo.sharer_name || "匿名用户" }}</span></span><br>
                    <span class="mc" title="推荐时间"><IconClock width="16px" height="16px"/><span class="simple">{{ ts2str(musicInfo.shared_at) }}</span></span><br>
                    <span class="gray" v-if="musicInfo.bit_rate > 320"><i>提示:以下为用户上传的源文件信息,音乐分发时最大比特率将被限制为 256kbps AAC</i></span><br v-if="musicInfo.bit_rate > 320">
                    <span class="mc" title="通道数" v-if="musicInfo.channels"><IconMusic width="16px" height="16px"/><span class="simple">通道数: {{ musicInfo.channels }}</span></span><br v-if="musicInfo.channels">
                    <span class="mc" title="采样频率" v-if="musicInfo.freq"><IconBrandSpeedtest width="16px" height="16px"/><span class="simple">采样频率: {{ musicInfo.freq }}Hz</span></span><br v-if="musicInfo.freq">
                    <span class="mc" title="位深度" v-if="musicInfo.bit_depth"><IconStackFront width="16px" height="16px"/><span class="simple">位深度: {{ musicInfo.bit_depth }}bit</span></span><br v-if="musicInfo.bit_depth">
                    <span class="mc" title="比特率" v-if="musicInfo.bit_rate"><IconWaveSawTool width="16px" height="16px"/><span class="simple">比特率: {{ musicInfo.bit_rate }}kbps</span></span><br v-if="musicInfo.bit_rate">
                </div>
            </div>
        </div>
        <hr>
        <h2>评论区</h2>
        <CommentsSection :placeId="musicInfo.comment_pid" />
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
</style>