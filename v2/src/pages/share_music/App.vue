<script setup lang="js">
import MarkdownInput from '@/components/MarkdownInput.vue';
import { reactive, watch } from 'vue';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { IconCheck, IconRefresh } from '@tabler/icons-vue';
import TagSelect from '@/components/TagSelect.vue';
import { shareMusicApi, queryProgressApi } from './share_music';

const musicDetails = reactive({  // 除了直接文件上传以外的其他平台
    0: {url: "", desc: "", tags: []},  // 网易云音乐
});
const results = reactive({
    0: {msg: "", isLoading: false},
    1: {msg: "", isLoading: false}
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

const pollingProgressInterval = null;
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
                    window.location.href = `/music?music_id=${musicId.value}`;
                    clearInterval(pollingProgressInterval);
                }else if (rsp.status === 2){
                    clearInterval(pollingProgressInterval);
                }
            }, 2000);
            break;
    }
});


</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a href="/">主页</a></li>
            <li class="wux-breadcrumb-item"><a href="/music">一起听歌</a></li>
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
                        <span>音乐页面链接:</span>
                        <input v-model="musicDetails[0].url" type="text" class="wux-form-input wux-form-input-md" placeholder="音乐页面链接, 例如: https://music.163.com/#/song?id=2708984802">
                        <span>描述/推荐理由(选填,支持markdown,200字以内):</span>
                        <markdown-input v-model="musicDetails[0].desc" :rows="5" placeholder="描述/推荐理由, 选填, 200字以内"></markdown-input>
                        <hr>
                        <span>音乐标签(选填,最多8个):</span><br>
                        <tag-select v-model="musicDetails[0].tags" />
                        <hr>
                        <btn-with-loading @click="shareMusic(0)" :is-loading="results[0].isLoading" btn-class="mc"><icon-check :width="16" :height="16" />分享</btn-with-loading>
                        <span class="result simple">{{ results[0].msg }}</span>
                    </div>
                    <input class="wux-tab-item" type="radio" name="tab-src" id="tab-file">
                    <label class="wux-tab-item" for="tab-file">直接上传音频文件</label>
                    <div class="wux-tab-content">
                        <hr>
                        <span>请选择音乐文件:</span>
                        <input class="wux-form-upload" type="file" accept="audio/*">
                        <span>曲名(建议包含<b>歌手/作曲家</b>名):</span>
                        <input type="text" class="wux-form-input wux-form-input-md" placeholder="曲名(建议包含歌手/作曲家名)">
                        <span>音频来源(必填,支持markdown,2048字以内):</span>
                        <markdown-input :rows="5" placeholder="音频来源,必填,2048字以内"></markdown-input>
                        <span>描述/推荐理由(选填,支持markdown,200字以内):</span>
                        <markdown-input :rows="5" placeholder="描述/推荐理由,选填,200字以内"></markdown-input>
                        <hr>
                        <btn-with-loading :is-loading="results[1].isLoading" btn-class="mc"><icon-check :width="16" :height="16" />分享</btn-with-loading>
                        <span class="result simple">{{ results[1].msg }}</span>
                        <progress class="wux-progress" value="0" max="1" hidden></progress>
                    </div>
                </div>
            </div>
            <div :hidden="status !== 1">
                <h2>提交成功</h2>
                <span>你的请求<b>已在后台处理</b>,可能需要十几秒。</span><br>
                <i>如果你已经登录, 处理完成后你将在通知中心看到一条消息。</i><br>
                <span>当前状态: <code>{{ progress }}</code></span><br>
                <a href="/share_music"><button type="button" class="wux-btn wux-btn-primary mc"><icon-refresh :width="16" :height="16" />再分享一个</button></a>
            </div>
        </div>
    </div>
</template>