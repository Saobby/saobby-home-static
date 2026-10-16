<script setup lang="js">
import { computed, onBeforeUnmount, ref } from 'vue';
import { copyToClipboard, fetch_api } from '@/assets/js/util.js';
import { captcha } from '@/assets/js/captcha.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import {
    IconCheck, IconCopy, IconExternalLink, IconHelp, IconLogin2,
    IconPalette, IconPhoto, IconRefresh, IconTypography
} from '@tabler/icons-vue';
import {
    getCounterDashboardUrl, getCounterHtmlCode, getCounterImageUrl, getCounterMarkdownCode
} from '@/assets/js/webcounter.js';

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const webCounterPageUrl = import.meta.env.VITE_WEBCOUNTER_PAGE_URL;
const myWebCountersPageUrl = import.meta.env.VITE_MY_WEBCOUNTERS_PAGE_URL;
const loginPageUrl = import.meta.env.VITE_LOGIN_PAGE_URL;

const exampleCounterUrl = getCounterImageUrl("e51jahcg");

const loggedIn = ref(!!localStorage.getItem("access-token"));
const picType = ref(1);
const displayType = ref(0);
const fontSize = ref(16);
const fontColor = ref("#000000");
const backgroundColor = ref("#ffffff");
const creating = ref(false);
const result = ref("");
const created = ref(null);
const copied = ref("");

let copyTimer = null;

const markdownCode = computed(() => created.value ? getCounterMarkdownCode(created.value.counter_id) : "");
const htmlCode = computed(() => created.value ? getCounterHtmlCode(created.value.counter_id) : "");
const dashboardUrl = computed(() => created.value ? getCounterDashboardUrl(created.value.access_token) : "");

async function createCounter(){
    const size = parseInt(fontSize.value);
    if (isNaN(size)){
        result.value = "请填写字体大小";
        return;
    }
    if (!fontColor.value || !backgroundColor.value){
        result.value = "请填写字体颜色和背景颜色";
        return;
    }
    creating.value = true;
    result.value = "";

    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        result.value = "人机验证失败:" + captchaRsp.msg;
        creating.value = false;
        return;
    }

    const payload = {
        pic_type: parseInt(picType.value),
        display_type: parseInt(displayType.value),
        font_size: size,
        text_color: fontColor.value,
        background_color: backgroundColor.value,
        captcha_token: captchaRsp.data.token
    };
    const accessToken = localStorage.getItem("access-token");
    if (accessToken){
        payload.access_token = accessToken;
    }
    const rsp = await fetch_api(domain + "/api/create_counter", payload);
    if (rsp.retcode){
        result.value = rsp.msg;
        creating.value = false;
        return;
    }
    created.value = rsp.data;
    creating.value = false;
}

function reset(){
    created.value = null;
    result.value = "";
}

function login(){
    localStorage.login_redirect = window.location.href;
    window.location = loginPageUrl;
}

async function copyText(text, key){
    await copyToClipboard(text);
    copied.value = key;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
        copied.value = "";
    }, 1000);
}

onBeforeUnmount(() => clearTimeout(copyTimer));
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item"><a :href="webCounterPageUrl">网页计数器</a></li>
            <li class="wux-breadcrumb-item">创建计数器</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">创建网页计数器</h2>
            <ul>
                <li>在图片上实时显示页面<b>访问量/独立IP数</b>，或者<b>静默统计</b></li>
                <li>只需放置一张图片，即可在后台自动统计<b>网页访问量、IP 数量、访客位置、访问量趋势、访问时段、浏览器、设备、操作系统</b>等信息</li>
                <li>还可以<b>查看访问日志</b>，进行进一步分析</li>
                <li>使用方便，<b>可在各类支持 Markdown 的平台上使用，完全免费</b></li>
                <li>还支持<b>前端直接调用 API </b>记录当前访问并得到当前访问量和 IP 数</li>
                <li class="middle">示例:当前页面访问次数:<img :src="exampleCounterUrl" alt="当前页面访问人数" class="middle"></li>
            </ul>
            <hr>
            <div id="args-div" v-if="!created">
                <h3 class="thin">立即创建一个计数器并打开控制面板</h3>
                <div class="wux-alert wux-alert-info" v-if="!loggedIn">你还没有登录!登录后可查看账户创建的所有计数器，<b>无需手动记录控制面板访问密钥</b>，更加方便。<br>当然，不登录仍然可以使用本工具的完整功能。<br><a href="javascript:;" @click="login()"><IconLogin2 width="16px" height="16px" class="middle"/><span class="middle">立即登录</span></a></div>
                <div class="wux-row-md-2 same-height-container">
                    <div class="wux-col same-height-box">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <h2 class="thin"><IconPhoto width="32px" height="32px" class="middle"/><span class="middle">图片类型</span><button type="button" class="wux-btn wux-btn-primary wux-btn-text wux-tooltip"><IconHelp width="24px" height="24px" class="middle"/><span class="wux-tooltip-item wux-tooltip-item-bottom" style="color: white;">矢量图:放大不模糊<br>位图:放大会模糊</span></button></h2>
                                <select class="wux-form-select wux-form-select-md" v-model.number="picType" :disabled="creating">
                                    <option :value="0">位图(JPEG)</option>
                                    <option :value="1">矢量图(SVG) (推荐)</option>
                                </select>
                                <h2 class="thin"><IconTypography width="32px" height="32px" class="middle"/><span class="middle">显示内容</span><button type="button" class="wux-btn wux-btn-primary wux-btn-text wux-tooltip"><IconHelp width="24px" height="24px" class="middle"/><span class="wux-tooltip-item wux-tooltip-item-bottom" style="color: white;">访问次数:每访问一次页面+1<br>访客数:同一人多次访问算作一次</span></button></h2>
                                <select class="wux-form-select wux-form-select-md" v-model.number="displayType" :disabled="creating">
                                    <option :value="0">总访问次数</option>
                                    <option :value="1">总访客数(独立IP数)</option>
                                    <option :value="2">只统计不显示(仍需放置图片)</option>
                                </select>
                                <hr>
                                <p class="gray">如果你是要统计的站点的站长，也可以通过前端直接调用 API 的方式进行统计，并直接得到当前访问量和 IP 数。请在创建计数器后在控制面板的设置页面查看具体方法。</p>
                            </div>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <h2 class="thin"><IconTypography width="32px" height="32px" class="middle"/><span class="middle">字体大小</span></h2>
                                <input type="number" class="wux-form-input wux-form-input-md" v-model.number="fontSize" min="1" max="100" :disabled="creating">
                                <h2 class="thin"><IconPalette width="32px" height="32px" class="middle"/><span class="middle">字体颜色</span></h2>
                                <input type="color" style="width: 64px; height: 64px;" v-model="fontColor" :disabled="creating" placeholder="填6位16进制颜色代码,要带#号,如#aa0000表示红色"><br>
                                <h2 class="thin"><IconPalette width="32px" height="32px" class="middle"/><span class="middle">背景颜色</span></h2>
                                <input type="color" style="width: 64px; height: 64px;" v-model="backgroundColor" :disabled="creating" placeholder="填6位16进制颜色代码,要带#号,如#aa0000表示红色"><br>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="wux-row-md-1">
                    <div class="wux-col">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <BtnWithLoading btn-class="wux-btn-primary" :is-loading="creating" @click="createCounter()"><IconCheck width="16px" height="16px" class="middle"/><span class="middle">创建计数器</span></BtnWithLoading> <span class="result">{{ result }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div id="success-div" v-else>
                <h3 class="thin">创建成功</h3>
                <div class="wux-row-md-2 same-height-container">
                    <div class="wux-col same-height-box">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <span>将下面的图片放置在<b>需要计数的网页</b>:</span>
                                <textarea class="wux-form-input wux-form-input-md mt" readonly :value="markdownCode"></textarea>
                                <button type="button" class="wux-btn wux-btn-primary" @click="copyText(markdownCode, 'markdown')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "markdown"? "已复制": "复制 Markdown 代码" }}</span></button>
                                <textarea class="wux-form-input wux-form-input-md mt" readonly :value="htmlCode"></textarea>
                                <button type="button" class="wux-btn wux-btn-primary" @click="copyText(htmlCode, 'html')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "html"? "已复制": "复制 HTML 代码" }}</span></button>
                            </div>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <div class="wux-row-xs-2">
                                    <div class="wux-col">
                                        <b>计数器 ID:</b>
                                    </div>
                                    <div class="wux-col">
                                        <button type="button" class="wux-btn wux-btn-primary wux-btn-xs wux-btn-outline simple right" @click="copyText(created.counter_id, 'counter-id')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "counter-id"? "已复制": "复制" }}</span></button><code class="right">{{ created.counter_id }}</code>
                                    </div>
                                </div>
                                <div class="wux-row-xs-2">
                                    <div class="wux-col">
                                        <b>控制面板访问密钥:</b>
                                    </div>
                                    <div class="wux-col">
                                        <button type="button" class="wux-btn wux-btn-primary wux-btn-xs wux-btn-outline simple right" @click="copyText(created.access_token, 'access-token')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "access-token"? "已复制": "复制" }}</span></button><code class="right">{{ created.access_token }}</code>
                                    </div>
                                </div>
                                <a :href="dashboardUrl" target="_blank"><button type="button" class="wux-btn wux-btn-primary"><IconExternalLink width="16px" height="16px" class="middle"/><span class="middle">打开控制面板</span></button></a> <button type="button" class="wux-btn wux-btn-primary wux-btn-outline" @click="reset()"><IconRefresh width="16px" height="16px" class="middle"/><span class="middle">再创建一个</span></button><br>
                                <b class="result">如果你未登录，请务必记好访问密钥!</b><br>
                                <span>登录用户可在<a :href="myWebCountersPageUrl" target="_blank">我的计数器</a>查看自己创建的计数器</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
/* 覆盖 wux.css 的默认外边距（同旧页面 <head> 的内联样式） */
.wux-typo .wux-card-body h2{
    margin-top: 0px;
    margin-left: 4px;
    margin-bottom: 0px;
}
.wux-typo .wux-col {
    padding: 0px 4px;
}
</style>
