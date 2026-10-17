<script setup>
import { ref } from 'vue';
import { fetch_api } from '@/assets/js/util.js';
import { captcha } from '@/assets/js/captcha.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import CopyButton from '@/components/CopyButton.vue';
import { IconEye, IconSearch } from '@tabler/icons-vue';

const domain = import.meta.env.VITE_BILIVIDEO_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

const videoLink = ref("");
const videoInfo = ref(null);
const pages = ref([]);
const querying = ref(false);
const errorMsg = ref("");
const state = ref("notice");

function showError(msg){
    errorMsg.value = msg;
    state.value = "error";
}

async function query(){
    if (!videoLink.value){
        showError("视频链接不能为空!");
        return;
    }
    querying.value = true;
    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        querying.value = false;
        showError("人机验证失败:" + captchaRsp.msg);
        return;
    }
    const rsp = await fetch_api(domain + "/api/get_video_pages", {
        video_url: videoLink.value,
        captcha_token: captchaRsp.data.token
    });
    querying.value = false;
    if (rsp.retcode){
        showError(rsp.msg);
        return;
    }
    videoInfo.value = rsp.data.info;
    pages.value = rsp.data.pages.map((page) => ({
        ...page, loading: false, error: "", link: null
    }));
    state.value = "result";
}

async function getVideoLink(page){
    page.loading = true;
    page.error = "";
    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        page.loading = false;
        page.error = "人机验证失败:" + captchaRsp.msg;
        return;
    }
    const rsp = await fetch_api(domain + "/api/get_video_link", {
        video_id: videoInfo.value.video_id,
        id_type: videoInfo.value.id_type,
        cid: page.cid,
        captcha_token: captchaRsp.data.token
    });
    page.loading = false;
    if (rsp.retcode){
        page.error = rsp.msg;
        return;
    }
    page.link = {
        quality: rsp.data.quality,
        size: Math.round(rsp.data.size * 100) / 100,
        url: rsp.data.url
    };
}

function sec2hms(sec){
    const h = Math.floor(sec / 3600);
    const m = Math.floor(sec % 3600 / 60);
    const s = Math.floor(sec % 3600 % 60 / 1);
    return h === 0 ? `${m}:${s}` : `${h}:${m}:${s}`;
}
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">B站视频直链解析</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">B站视频直链解析</h2>
            <input type="text" class="wux-form-input wux-form-input-md" style="width:calc( 100% - 90px );display:inline-block;" v-model="videoLink" placeholder="视频链接,如https://www.bilibili.com/video/BV18X4y1N7Yh/"> <BtnWithLoading btn-class="wux-btn-primary" :is-loading="querying" @click="query()"><IconSearch width="16px" height="16px" class="middle"/><span class="middle">解析</span></BtnWithLoading><br>
            <div :hidden="state !== 'notice'">
                <h2>注意事项</h2>
                <ul>
                    <li>目前<b>仅支持解析普通视频</b>，暂不支持解析番剧直链</li>
                    <li>支持填写视频链接，也支持填写b站短网址链接(如<code>https://b23.tv/HSepNvF</code>)</li>
                    <li>由于b站API限制，目前<b>最高仅能解析出720P清晰度</b>的视频直链</li>
                    <li>解析出来的直链有效期只有<b>4小时</b>，因此解析后请尽快下载</li>
                    <li>若无法正常使用，请发邮件到<code>bugs@saobby.com</code>反馈或者直接在主页评论区留言反馈</li>
                </ul>
            </div>
            <div :hidden="state !== 'result'">
                <h2>请选择需要解析的视频分P</h2>
                <div class="pre-like">
                    <template v-for="(page, index) in pages" :key="page.cid">
                        <b>P{{ page.page_index }} </b><span>{{ page.title }}</span><br><b>时长: </b><span>{{ sec2hms(page.duration) }}</span><br>
                        <div :hidden="!page.link">
                            <b>画质: </b><span>{{ page.link?.quality }}</span><br><b>大小: </b><span>{{ page.link?.size }}MB</span><br><b>直链: </b><a target="_blank" :href="page.link?.url"><button type="button" class="wux-btn wux-btn-primary wux-btn-sm"><IconEye width="16px" height="16px" class="middle"/><span class="middle">打开</span></button></a><CopyButton :value="page.link?.url || ''" class="wux-btn wux-btn-primary wux-btn-sm" style="left:3px;"/>
                        </div>
                        <div :hidden="!!page.link">
                            <BtnWithLoading btn-class="wux-btn-primary wux-btn-sm" :is-loading="page.loading" @click="getVideoLink(page)"><IconSearch width="16px" height="16px" class="middle"/><span class="middle">解析</span></BtnWithLoading><br><span class="result">{{ page.error }}</span>
                        </div>
                        <hr :hidden="index === pages.length - 1">
                    </template>
                </div>
            </div>
            <div :hidden="state !== 'error'">
                <h2>发生错误</h2>
                <span>错误信息:</span><span class="result">{{ errorMsg }}</span>
            </div>
        </div>
    </div>
</template>
