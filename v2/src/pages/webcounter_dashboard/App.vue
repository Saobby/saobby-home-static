<script setup lang="js">
import { ref } from 'vue';
import { fetch_api, getUrlArgs } from '@/assets/js/util.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import OverviewTab from './components/OverviewTab.vue';
import LogTab from './components/LogTab.vue';
import SettingsTab from './components/SettingsTab.vue';
import { IconLogin2 } from '@tabler/icons-vue';
import { getCounterDashboardUrl } from '@/assets/js/webcounter.js';

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const webCounterPageUrl = import.meta.env.VITE_WEBCOUNTER_PAGE_URL;

const accessToken = ref(getUrlArgs().access_token || "");
const tab = ref("overview");
const tokenInput = ref("");
const loggingIn = ref(false);
const loginResult = ref("");

const overviewRef = ref(null);
const logRef = ref(null);
const settingsRef = ref(null);

async function login(){
    if (!tokenInput.value){
        loginResult.value = "请输入访问密钥";
        return;
    }
    loggingIn.value = true;
    loginResult.value = "";
    const rsp = await fetch_api(domain + "/api/verify_access_token", { access_token: tokenInput.value });
    loggingIn.value = false;
    if (rsp.retcode){
        loginResult.value = rsp.msg;
        return;
    }
    // 带在 URL 上重新打开，刷新后仍然可用
    window.location.href = getCounterDashboardUrl(tokenInput.value);
}

// 点 tab 就重新加载该 tab 的数据
function switchTab(name){
    tab.value = name;
    if (name === "overview" && overviewRef.value){
        overviewRef.value.loadAll();
    }else if (name === "log" && logRef.value){
        logRef.value.loadLogs(0);
    }else if (name === "settings" && settingsRef.value){
        settingsRef.value.loadSettings();
    }
}
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item"><a :href="webCounterPageUrl">网页计数器</a></li>
            <li class="wux-breadcrumb-item">控制面板</li>
        </ul>
        <div class="wux-typo">
            <div id="login" :hidden="!!accessToken">
                <h2>登录控制面板</h2>
                <input type="text" v-model="tokenInput" class="wux-form-input wux-form-input-md" placeholder="控制面板访问密钥" style="width:calc( 100% - 100px );display:inline-block;" @keyup.enter="login()"> <BtnWithLoading btn-class="wux-btn-primary" :is-loading="loggingIn" @click="login()"><IconLogin2 width="16px" height="16px" class="middle"/><span class="middle">登录</span></BtnWithLoading><br>
                <span class="result">{{ loginResult }}</span>
            </div>
            <!-- 没有 token 时不能挂载 dashboard：里面的 tab 会在 onMounted 里直接请求数据 -->
            <div id="dashboard" v-if="accessToken">
                <div class="wux-tab">
                    <input class="wux-tab-item" type="radio" name="tab-dashboard" id="tab-data-overview" :checked="tab === 'overview'" @click="switchTab('overview')">
                    <label class="wux-tab-item" for="tab-data-overview">数据总览</label>
                    <div class="wux-tab-content">
                        <OverviewTab ref="overviewRef" :access-token="accessToken"/>
                    </div>
                    <input class="wux-tab-item" type="radio" name="tab-dashboard" id="tab-log-query" :checked="tab === 'log'" @click="switchTab('log')">
                    <label class="wux-tab-item" for="tab-log-query">日志查询</label>
                    <div class="wux-tab-content">
                        <LogTab ref="logRef" :access-token="accessToken" :active="tab === 'log'"/>
                    </div>
                    <input class="wux-tab-item" type="radio" name="tab-dashboard" id="tab-settings" :checked="tab === 'settings'" @click="switchTab('settings')">
                    <label class="wux-tab-item" for="tab-settings">设置</label>
                    <div class="wux-tab-content">
                        <SettingsTab ref="settingsRef" :access-token="accessToken"/>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<style>
/* 作用于本页所有卡片（含子组件），所以不能加 scoped；.wux-typo 前缀用于压过 wux.css 的默认外边距 */
.wux-typo .wux-card-body h2{
    margin-top: 0px;
    margin-left: 4px;
    margin-bottom: 0px;
}
.wux-typo .wux-card-body h6{
    margin-top: 0px;
    margin-left: 12px;
    margin-bottom: 0px;
}
.wux-typo .wux-card-body .big-number{
    margin-left: 12px;
}
.wux-typo .wux-col {
    padding: 0px 4px;
}
</style>
