<script setup lang="js">
import MarkdownInput from '@/components/MarkdownInput.vue';
import { reactive, watch, ref } from 'vue';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { IconCircleDashedCheck, IconCheck, IconRefresh, IconLink, IconFileDescription, IconTag, IconFile, IconLabel } from '@tabler/icons-vue';
import TagSelect from '@/components/TagSelect.vue';
import { shareMusicApi, queryProgressApi, shareMusicFileApi } from './share_music';

const shareMusicPageUrl = import.meta.env.VITE_SHARE_MUSIC_PAGE_URL;
const musicPageUrl = import.meta.env.VITE_MUSIC_PAGE_URL;

const musicDetails = reactive({
    0: {url: "", desc: "", tags: []},  // 网易云音乐
    1: {name: "", src: "", desc: "", tags:[]}  // 文件上传
});
const results = reactive({
    0: {msg: "", isLoading: false},
    1: {msg: "", isLoading: false, uploadProgress: 0}
});
const status = ref(0);  // 0:显示表单 1:显示进度
const musicId = ref(0);
async function shareMusic(srcType) {
    const details = musicDetails[srcType];
    if (!details.url) {
        results[srcType].msg = "音乐页面链接不能为空";
        return;
    }
    if (details.desc.length > 200) {
        results[srcType].msg = "描述/推荐理由不能超过200字";
        return;
    }
    const reqDetail = {};
    switch (srcType) {
        case 0:  // 网易云音乐
            if (!(new RegExp("^https://music\\.163\\.com/#/song\\?id=\\d+$")).test(details.url)){
                results[srcType].msg = "链接格式错误";
                return;
            }
            reqDetail.music_id = details.url.split("=")[1];
            break;
    }
    results[srcType].isLoading = true;
    const rsp = await shareMusicApi(srcType, reqDetail, details.desc, details.tags);
    if (rsp.retcode){
        results[srcType].msg = rsp.msg;
        results[srcType].isLoading = false;
        return;
    }
    results[srcType].isLoading = false;
    musicId.value = rsp.data.musicId;
    status.value = 1;
}
async function shareMusicFile(){
    const file = fileInputRef.value.files[0];
    if (!file) {
        results[1].msg = "请选择音乐文件";
        return;
    }
    const details = musicDetails[1];
    if (!details.name) {
        results[1].msg = "曲名不能为空";
        return;
    }
    if (!details.src) {
        results[1].msg = "音频来源不能为空";
        return;
    }
    if (details.desc.length > 200) {
        results[1].msg = "描述/推荐理由不能超过200字";
        return;
    }
    if (details.src.length > 2048) {
        results[1].msg = "音频来源不能超过2048字";
        return;
    }
    results[1].isLoading = true;
    const rsp = await shareMusicFileApi(file, details.name, details.src, details.desc, details.tags, (p) => {
        results[1].uploadProgress = p;
        results[1].msg = `上传中(${Math.round(p*100)}%)`;
    });
    if (rsp.retcode) {
        results[1].msg = rsp.msg;
        results[1].isLoading = false;
        return;
    }
    results[1].isLoading = false;
    musicId.value = rsp.data.musicId;
    status.value = 1;
}

let pollingProgressInterval = null;
const progress = ref("");
watch(() => status.value, (newValue) => {
    switch (newValue) {
        case 0:
            if (pollingProgressInterval) {
                clearInterval(pollingProgressInterval);
            }
            break;
        case 1:
            progress.value = "等待中...";
            pollingProgressInterval = setInterval(async () => {
                const rsp = await queryProgressApi(musicId.value);
                progress.value = rsp.msg;
                if (rsp.status === 0){
                    window.location.href = `${import.meta.env.VITE_MUSIC_PAGE_URL}?music_id=${musicId.value}`;
                    clearInterval(pollingProgressInterval);
                }else if (rsp.status === 2){
                    clearInterval(pollingProgressInterval);
                }
            }, 2000);
            break;
    }
});
const fileInputRef = ref(null);

</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a href="/">主页</a></li>
            <li class="wux-breadcrumb-item"><a :href="musicPageUrl">一起听歌</a></li>
            <li class="wux-breadcrumb-item">分享音乐</li>
        </ul>
        <div class="wux-typo">
            <div :hidden="status !== 0">
                <h2 class="mt">分享音乐</h2>
                <span>请选择音乐平台</span>
                <div class="wux-tab">
                    <input class="wux-tab-item" type="radio" name="tab-src" id="tab-nmusic" checked>
                    <label class="wux-tab-item" for="tab-nmusic">网易云音乐</label>
                    <div class="wux-tab-content">
                        <hr>
                        <span class="mc"><IconLink width="16px" height="16px" />音乐页面链接:</span>
                        <input v-model="musicDetails[0].url" type="text" class="wux-form-input wux-form-input-md" placeholder="音乐页面链接, 例如: https://music.163.com/#/song?id=2708984802">
                        <span class="mc"><IconFileDescription width="16px" height="16px"/>描述/推荐理由(选填,支持markdown,200字以内):</span>
                        <markdown-input v-model="musicDetails[0].desc" :rows="5" placeholder="描述/推荐理由, 选填, 200字以内"></markdown-input>
                        <hr>
                        <span class="mc"><IconTag width="16px" height="16px"/>音乐标签(选填,最多8个):</span><br>
                        <tag-select v-model="musicDetails[0].tags" />
                        <hr>
                        <btn-with-loading @click="shareMusic(0)" :is-loading="results[0].isLoading" btn-class="mc"><icon-check :width="16" :height="16" />分享</btn-with-loading>
                        <span class="result simple">{{ results[0].msg }}</span>
                    </div>
                    <input class="wux-tab-item" type="radio" name="tab-src" id="tab-file">
                    <label class="wux-tab-item" for="tab-file">直接上传音频文件</label>
                    <div class="wux-tab-content">
                        <hr>
                        <span class="mc"><IconFile width="16px" height="16px"/>请选择音乐文件:</span>
                        <input ref="fileInputRef" class="wux-form-upload" type="file" accept="audio/*">
                        <span class="mc"><IconLabel width="16px" height="16px"/>曲名(建议包含<b>歌手/作曲家</b>名):</span>
                        <input v-model="musicDetails[1].name" type="text" class="wux-form-input wux-form-input-md" placeholder="曲名(建议包含歌手/作曲家名)">
                        <span class="mc"><IconFileDescription width="16px" height="16px"/>音频来源(必填,支持markdown,2048字以内):</span>
                        <markdown-input v-model="musicDetails[1].src" :rows="5" placeholder="音频来源,必填,2048字以内"></markdown-input><br>
                        <span class="mc"><IconFileDescription width="16px" height="16px"/>描述/推荐理由(选填,支持markdown,200字以内):</span>
                        <markdown-input v-model="musicDetails[1].desc" :rows="5" placeholder="描述/推荐理由,选填,200字以内"></markdown-input>
                        <hr>
                        <span class="mc"><IconTag width="16px" height="16px"/>音乐标签(选填,最多8个):</span><br>
                        <tag-select v-model="musicDetails[1].tags"/>
                        <hr>
                        <btn-with-loading @click="shareMusicFile" :is-loading="results[1].isLoading" btn-class="mc"><icon-check :width="16" :height="16" />分享</btn-with-loading>
                        <span class="result simple">{{ results[1].msg }}</span>
                        <progress :hidden="!results[1].isLoading" class="wux-progress" :value="results[1].uploadProgress" max="1"></progress>
                    </div>
                </div>
            </div>
            <div :hidden="status !== 1" class="centered">
                <h2 class="mc" style="color:#00aa00"><IconCircleDashedCheck width="36px" height="36px" />提交成功</h2>
                <hr>
                <span>你的请求<b>已在后台处理</b>,可能需要十几秒。</span><br>
                <i>如果你已经登录, 处理完成后你将在通知中心看到一条消息。</i><br>
                <hr>
                <span>当前状态: <code>{{ progress }}</code></span><br>
                <hr>
                <a :href="shareMusicPageUrl"><button type="button" class="wux-btn wux-btn-primary mc"><icon-refresh :width="16" :height="16" />再分享一个</button></a>
            </div>
        </div>
    </div>
</template>