<script setup lang="js">
import { computed, onBeforeUnmount, ref } from 'vue';
import { copyToClipboard, fetch_api } from '@/assets/js/util.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { IconCheck, IconCopy, IconHelp, IconKey, IconPalette, IconPhoto, IconTypography } from '@tabler/icons-vue';
import { getCounterApiUrl, getCounterHtmlCode, getCounterMarkdownCode } from '@/assets/js/webcounter.js';

const props = defineProps({
    accessToken: { type: String, default: "" }
});

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;

const settings = ref(null);
const imageType = ref(0);
const displayType = ref(0);
const fontSize = ref(16);
const fontColor = ref("#000000");
const backgroundColor = ref("#ffffff");
const description = ref("");
const loading = ref(false);
const saving = ref(false);
const result = ref("");
const copied = ref("");

let copyTimer = null;

const markdownCode = computed(() => settings.value ? getCounterMarkdownCode(settings.value.counter_id) : "");
const htmlCode = computed(() => settings.value ? getCounterHtmlCode(settings.value.counter_id) : "");
const apiUrl = computed(() => settings.value ? getCounterApiUrl(settings.value.counter_id) : "");

async function loadSettings(){
    loading.value = true;
    result.value = "";
    const rsp = await fetch_api(domain + "/api/get_counter_settings", { access_token: props.accessToken });
    loading.value = false;
    if (rsp.retcode){
        result.value = "无法加载设置:" + rsp.msg;
        return;
    }
    const data = rsp.data.settings;
    settings.value = data;
    imageType.value = data.pic_type;
    displayType.value = data.display_type;
    fontSize.value = data.font_size;
    fontColor.value = data.text_color;
    backgroundColor.value = data.background_color;
    description.value = data.desc;
}

async function saveSettings(){
    saving.value = true;
    result.value = "";
    const rsp = await fetch_api(domain + "/api/update_counter_settings", {
        access_token: props.accessToken,
        pic_type: imageType.value,
        display_type: displayType.value,
        font_size: fontSize.value,
        text_color: fontColor.value,
        background_color: backgroundColor.value,
        desc: description.value
    });
    saving.value = false;
    if (rsp.retcode){
        result.value = "无法保存设置:" + rsp.msg;
        return;
    }
    result.value = "设置已保存";
}

async function copyText(text, key){
    await copyToClipboard(text);
    copied.value = key;
    clearTimeout(copyTimer);
    copyTimer = setTimeout(() => {
        copied.value = "";
    }, 1000);
}

defineExpose({ loadSettings });

onBeforeUnmount(() => clearTimeout(copyTimer));
</script>

<template>
    <hr>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <b><IconKey width="16px" height="16px" class="middle"/><span class="middle">控制面板访问密钥: </span></b><span style="display: inline-block;"><code>{{ settings? settings.access_token: "" }}<span class="wux-loading" v-if="!settings"></span></code><button type="button" class="wux-btn wux-btn-primary wux-btn-xs wux-btn-outline simple" @click="copyText(settings? settings.access_token: '', 'access-token')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "access-token"? "已复制": "复制" }}</span></button></span>
                    <input type="text" v-model="description" class="wux-form-input wux-form-input-md mb right" placeholder="备注" style="width: 150px;" :disabled="loading || saving">
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-3 same-height-container">
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin">放置计数器</h2>
                    <span>将下面的图片放置在<b>需要计数的网页</b>:</span>
                    <input :value="markdownCode" class="wux-form-input wux-form-input-md" readonly>
                    <button type="button" class="wux-btn wux-btn-primary" @click="copyText(markdownCode, 'markdown')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "markdown"? "已复制": "复制 Markdown 代码" }}</span></button>
                    <input :value="htmlCode" class="wux-form-input wux-form-input-md" readonly>
                    <button type="button" class="wux-btn wux-btn-primary" @click="copyText(htmlCode, 'html')"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied === "html"? "已复制": "复制 HTML 代码" }}</span></button><br>
                    <hr>
                    <span><b>或者</b>在用户打开要计数的页面时，通过 JS 发送一个 GET 请求。响应的 JSON 中将包含访问量和 IP 数。<code>(图片和 API 选一个使用即可)</code></span>
                    <input :value="apiUrl" class="wux-form-input wux-form-input-md" readonly>
                </div>
            </div>
        </div>
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconPhoto width="32px" height="32px" class="middle"/><span class="middle">图片类型</span><button type="button" class="wux-btn wux-btn-primary wux-btn-text wux-tooltip"><IconHelp width="24px" height="24px" class="middle"/><span class="wux-tooltip-item wux-tooltip-item-bottom" style="color: white;">矢量图:放大不模糊<br>位图:放大会模糊</span></button></h2>
                    <select v-model.number="imageType" class="wux-form-select" :disabled="loading || saving">
                        <option :value="0">位图(JPEG)</option>
                        <option :value="1">矢量图(SVG) (推荐)</option>
                    </select>
                    <h2 class="thin"><IconTypography width="32px" height="32px" class="middle"/><span class="middle">显示内容</span><button type="button" class="wux-btn wux-btn-primary wux-btn-text wux-tooltip"><IconHelp width="24px" height="24px" class="middle"/><span class="wux-tooltip-item wux-tooltip-item-bottom" style="color: white;">访问次数:每访问一次页面+1<br>访客数:同一人多次访问算作一次</span></button></h2>
                    <select v-model.number="displayType" class="wux-form-select" :disabled="loading || saving">
                        <option :value="0">总访问次数</option>
                        <option :value="1">总访客数(独立IP数)</option>
                        <option :value="2">只统计不显示(仍需放置图片)</option>
                    </select>
                </div>
            </div>
        </div>
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <div class="wux-row-xs-1">
                        <div class="wux-col">
                            <h2 class="thin"><IconTypography width="32px" height="32px" class="middle"/><span class="middle">字体大小</span></h2>
                            <input type="number" class="wux-form-input wux-form-input-md" v-model.number="fontSize" min="1" max="100" :disabled="loading || saving">
                        </div>
                    </div>
                    <div class="wux-row-xs-2">
                        <div class="wux-col">
                            <h2 class="thin"><IconPalette width="32px" height="32px" class="middle"/><span class="middle">字体颜色</span></h2>
                            <input type="color" v-model="fontColor" style="width:64px;height:64px;" :disabled="loading || saving">
                        </div>
                        <div class="wux-col">
                            <h2 class="thin"><IconPalette width="32px" height="32px" class="middle"/><span class="middle">背景颜色</span></h2>
                            <input type="color" v-model="backgroundColor" style="width:64px;height:64px;" :disabled="loading || saving">
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <span class="result">{{ result }}</span>
                    <BtnWithLoading btn-class="wux-btn-primary right mb" :is-loading="saving" @click="saveSettings()"><IconCheck width="16px" height="16px" class="middle"/><span class="middle">保存设置</span></BtnWithLoading>
                </div>
            </div>
        </div>
    </div>
</template>
