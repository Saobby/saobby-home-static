<script setup lang="js">
import { onMounted, onUnmounted, ref } from "vue";
import { IconArrowLeft, IconPlus, IconMessage, IconCheck } from "@tabler/icons-vue";
import { createChannelApi, publishBroadcastApi, getChannelInfoApi, publishMessageApi } from "./connector.js";
import BtnWithLoading from "@/components/BtnWithLoading.vue";
import MarkdownInput from "@/components/MarkdownInput.vue";
import { getUrlArgs, updateUrlArgs } from "@/assets/js/util.js";
import MessagesDisplay from "./components/MessagesDisplay.vue";
import MarkdownDisplay from "@/components/MarkdownDisplay.vue";
import { toDataURL } from "qrcode";

const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

const mode = ref(0);  // 0：欢迎界面 1: 接收者界面 2: 发送者界面 3: 加载界面 4: 发送者输入频道号

const createResult = ref("");
const createBtnDisabled = ref(false);

const joinChannelResult = ref("");
const joinChannelBtnDisabled = ref(false);

const messageResult = ref("");
const messageBtnDisabled = ref(false);
const messageContent = ref("");

const broadcastResult = ref("");
const broadcastBtnDisabled = ref(false);
const broadcastContent = ref("");

const receivedContent = ref([]);

const loadingResult = ref("");

const channelId = ref("");
const secret = ref("");

const error = ref("");
const qrCodeDataUrl = ref("");

let interval = null;

async function generateQRCode() {
    try {
        const url = `${import.meta.env.VITE_CONNECTOR_BASE_URL}${channelId.value}`;
        const isDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const dataUrl = await toDataURL(url, {
            width: 256,
            margin: 0,
            color: {
                dark: isDark ? '#f2f2f2' : '#000',
                light: isDark ? '#242424' : '#fff'
            }
        });
        qrCodeDataUrl.value = dataUrl;
    } catch (error) {
        console.error('无法生成频道二维码:', error);
    }
}

async function init(){
    const args = getUrlArgs();
    if (args.channel_id) {
        mode.value = 3;
        channelId.value = args.channel_id;
        const rsp = await getChannelInfoApi(channelId.value);
        if (rsp.retcode){
            loadingResult.value = "无法加载频道信息:"+rsp.msg;
            return;
        }
        channelId.value = rsp.data.channel_id;
        receivedContent.value = rsp.data.received;
        broadcastContent.value = rsp.data.broadcast;
        if (args.secret) {
            secret.value = args.secret;
            mode.value = 1;
        }else{
            mode.value = 2;
        }
        generateQRCode();
    }else{
        mode.value = 0;
    }
}

onMounted(async () => {
    interval = setInterval(getChannelInfo, 2000);
    window.addEventListener('popstate', init);
    await init();
});
onUnmounted(() => {
    if (interval) {
        clearInterval(interval);
    }
    window.removeEventListener('popstate', init);
});

async function createChannel() {
    createBtnDisabled.value = true;
    const rsp = await createChannelApi();
    createBtnDisabled.value = false;
    if (rsp.retcode) {
        createResult.value = rsp.msg;
        return;
    }
    mode.value = 1;
    channelId.value = rsp.data.channel_id;
    secret.value = rsp.data.secret;
    updateUrlArgs({ channel_id: channelId.value, secret: secret.value });
    generateQRCode();
}
async function publishBroadcast() {
    if (!broadcastContent.value){
        broadcastResult.value = "内容不能为空";
        return;
    }
    broadcastBtnDisabled.value = true;
    const rsp = await publishBroadcastApi(channelId.value, secret.value, broadcastContent.value);
    broadcastBtnDisabled.value = false;
    if (rsp.retcode) {
        broadcastResult.value = rsp.msg;
        return;
    }
}
async function getChannelInfo(){
    if (!(mode.value === 1 || mode.value === 2)){
        return;
    }
    const rsp = await getChannelInfoApi(channelId.value);
    if (rsp.retcode) {
        error.value = "无法更新信息:"+rsp.msg;
        return;
    }
    receivedContent.value = rsp.data.received;
    if (mode.value === 2){
        broadcastContent.value = rsp.data.broadcast;
    }
}
async function joinChannel() {
    if (!channelId.value) {
        joinChannelResult.value = "请输入频道号";
        return;
    }
    if (channelId.value.replaceAll(" ", "").length !== 6) {
        joinChannelResult.value = "请输入有效的6位频道号";
        return;
    }
    joinChannelBtnDisabled.value = true;
    const rsp = await getChannelInfoApi(channelId.value.replaceAll(" ", ""));
    joinChannelBtnDisabled.value = false;
    if (rsp.retcode){
        joinChannelResult.value = rsp.msg;
        return;
    }
    channelId.value = rsp.data.channel_id;
    receivedContent.value = rsp.data.received;
    broadcastContent.value = rsp.data.broadcast;
    mode.value = 2;
    updateUrlArgs({ channel_id: channelId.value });
    generateQRCode();
}
async function publishMessage() {
    if (!messageContent.value) {
        messageResult.value = "内容不能为空";
        return;
    }
    messageBtnDisabled.value = true;
    const rsp = await publishMessageApi(channelId.value, messageContent.value);
    messageBtnDisabled.value = false;
    if (rsp.retcode) {
        messageResult.value = rsp.msg;
        return;
    }
    messageContent.value = "";
    getChannelInfo();
}
</script>
<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">多设备图文互传</li>
        </ul>
        <div class="wux-typo">
            <div :hidden="mode !== 3" class="centered">
                <span class="wux-loading"></span><br>
                <span>正在加载频道信息</span><br>
                <span class="result">{{ loadingResult }}</span>
            </div>
            <div :hidden="mode !== 0">
                <h2>多设备图文互传</h2>
                <p>手机需要给电脑发个链接，但又懒得打开聊天工具?电脑<code>创建频道</code>，手机<code>扫码或输入频道号加入频道</code>即可发送。</p>
                <p>本设备需要给其他多个设备发点文字图片?本设备<code>创建频道</code>，输入文字或上传图片，其他设备<code>扫码或输入频道号加入频道</code>即可统一接收。</p>
                <hr>
                <div class="wux-row-md-2 same-height-container">
                    <div class="wux-col same-height-box">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <BtnWithLoading :isLoading="createBtnDisabled" btnClass="wux-btn-primary wux-btn-text wux-btn-xl mc" @click="createChannel">
                                    <IconPlus width="16px" height="16px" />创建频道
                                </BtnWithLoading>
                                <br>
                                <span class="ml">立即创建频道</span>
                            </div>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div class="wux-card wux-card-hover">
                            <div class="wux-card-body">
                                <button @click="mode=4" type="button" class="wux-btn wux-btn-primary wux-btn-text wux-btn-xl mc">
                                    <IconMessage width="16px" height="16px" />加入频道
                                </button><br>
                                <span class="ml">输入频道号加入频道</span>
                            </div>
                        </div>
                    </div>
                </div>
                <span class="result">{{ createResult }}</span>
            </div>
            <div :hidden="mode !== 4">
                <button @click="mode=0" class="wux-btn wux-btn-text mc"><IconArrowLeft width="16px" height="16px" />返回</button>
                <h2 class="mt">加入频道</h2>
                <span>请输入频道号:</span>
                <input style="width: calc(100% - 80px);display:inline-block" type="text" v-model="channelId" class="wux-form-input wux-form-input-md" placeholder="请输入6位频道号" />
                <BtnWithLoading @click="joinChannel" :is-loading="joinChannelBtnDisabled" btn-class="mc simple">
                    <IconCheck width="16px" height="16px" />加入
                </BtnWithLoading><br>
                <span class="result">{{ joinChannelResult }}</span>
            </div>
            <div :hidden="mode !== 1">
                <span v-if="error" class="result">{{ error }}</span>
                <div class="wux-row-md-3 same-height-container">
                    <div class="wux-col same-height-box">
                        <div>
                            <h2>加入频道</h2>
                            <span>频道号:</span><br>
                            <span style="font-size:45px;line-height: 45px;">{{ channelId.slice(0, 3)+" "+channelId.slice(3, 6) }}</span>
                            <div v-if="qrCodeDataUrl" class="mt">
                                <img class="qrcode-img" :src="qrCodeDataUrl" title="扫码加入频道" alt="扫码加入频道"/><br>
                                <span class="gray">手机扫码加入频道</span>
                            </div>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div>
                            <h2>发布广播</h2>
                            <MarkdownInput input-class="broadcast-input" :rows="5" v-model="broadcastContent" placeholder="请输入广播内容,最多32768字">
                                <BtnWithLoading @click="publishBroadcast" btn-class="mc simple" :isLoading="broadcastBtnDisabled">
                                    <IconCheck width="16px" height="16px" />保存
                                </BtnWithLoading>
                            </MarkdownInput>
                            <span class="result">{{ broadcastResult }}</span>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div>
                            <h2>收到的消息</h2>
                            <MessagesDisplay boxClass="msg-box-receiver" :messages="receivedContent" />
                        </div>
                    </div>
                </div>
            </div>
            <div :hidden="mode !== 2">
                <span v-if="error" class="result">{{ error }}</span>
                <div class="wux-row-md-3 same-height-container">
                    <div class="wux-col same-height-box">
                        <div>
                            <h2>加入频道</h2>
                            <span>频道号:</span><br>
                            <span style="font-size:45px;line-height: 45px;">{{ channelId.slice(0, 3)+" "+channelId.slice(3, 6) }}</span>
                            <div v-if="qrCodeDataUrl" class="mt">
                                <img class="qrcode-img" :src="qrCodeDataUrl" title="扫码加入频道" alt="扫码加入频道"/><br>
                                <span class="gray">手机扫码加入频道</span>
                            </div>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div>
                            <h2>广播内容</h2>
                            <MarkdownDisplay div-class="broadcast-display" :md="broadcastContent || '*暂无内容*'" btnClass="wux-btn-sm"></MarkdownDisplay>
                        </div>
                    </div>
                    <div class="wux-col same-height-box">
                        <div>
                            <h2>已发送的消息</h2>
                            <MessagesDisplay boxClass="msg-box-sender" :messages="receivedContent" />
                            <div style="margin-top: 3px;">
                                <MarkdownInput :rows="5" v-model="messageContent" placeholder="请输入要发送的消息,最多32768字">
                                    <BtnWithLoading @click="publishMessage" :is-loading="messageBtnDisabled" btn-class="mc simple">
                                        <IconCheck width="16px" height="16px" />发送
                                    </BtnWithLoading>
                                </MarkdownInput>
                                <span class="result">{{ messageResult }}</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>
<style scoped>
:deep(.broadcast-input) {
    @media (min-width: 1024px){
        height: calc(100vh - 230px) !important;
    }
    @media (max-width: 1023px){
        max-height: calc(100vh - 230px) !important;
    }
    overflow-y: auto;
}
:deep(.broadcast-display) {
    @media (min-width: 1024px){
        height: calc(100vh - 220px) !important;
    }
    @media (max-width: 1023px){
        max-height: calc(100vh - 220px) !important;
    }
    overflow-y: auto;
}
:deep(.msg-box-receiver) {
    @media (min-width: 1024px){
        height: calc(100vh - 320px) !important;
    }
    @media (max-width: 1023px){
        max-height: calc(100vh - 320px) !important;
    }
    overflow-y: auto;
}
:deep(.msg-box-sender) {
    @media (min-width: 1024px){
        height: calc(100vh - 320px) !important;
    }
    @media (max-width: 1023px){
        max-height: calc(100vh - 320px) !important;
    }
    overflow-y: auto;
}
.qrcode-img{
    max-width: 256px;
}
</style>