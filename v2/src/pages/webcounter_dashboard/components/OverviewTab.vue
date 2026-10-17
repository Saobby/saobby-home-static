<script setup lang="js">
import { computed, onMounted, reactive, ref } from 'vue';
import { fetch_api } from '@/assets/js/util.js';
import Chart from './Chart.vue';
import {
    IconBrandWindows, IconBrowser, IconClock, IconKeyboard,
    IconLogin2, IconTrendingUp, IconUser, IconWorld
} from '@tabler/icons-vue';
import {
    buildHeatmapOption, buildTopOption, buildTrendOption, buildVisitTimeOption
} from '../webcounter_charts.js';

const props = defineProps({
    accessToken: { type: String, default: "" }
});

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;

const period = ref("604800");
const stats = ref(null);
const statsResult = ref("");

// ready | loading | error
const statsState = computed(() => {
    if (stats.value) return "ready";
    return statsResult.value ? "error" : "loading";
});

const trend = reactive({ loading: true, option: null, result: "" });
const ipLocation = reactive({ loading: true, option: null, result: "" });
const visitTime = reactive({ loading: true, option: null, result: "" });
const browser = reactive({ loading: true, option: null, result: "" });
const device = reactive({ loading: true, option: null, result: "" });
const os = reactive({ loading: true, option: null, result: "" });

function startLoad(state){
    state.loading = true;
    state.option = null;
    state.result = "";
}

async function loadStats(){
    statsResult.value = "";
    const rsp = await fetch_api(domain + "/api/get_overall_data", { access_token: props.accessToken });
    if (rsp.retcode){
        statsResult.value = "无法获取数据:" + rsp.msg;
        return;
    }
    stats.value = rsp.data;
}

async function loadTrend(){
    startLoad(trend);
    const rsp = await fetch_api(domain + "/api/get_trend_data", {
        access_token: props.accessToken,
        period: period.value
    });
    trend.loading = false;
    if (rsp.retcode){
        trend.result = "加载失败:" + rsp.msg;
        return;
    }
    trend.option = buildTrendOption(rsp.data);
}

// 浏览器/设备/操作系统统计共用这一套逻辑（type 1/2/3），type 0 是访问时间段
async function loadTop(type, state){
    startLoad(state);
    const rsp = await fetch_api(domain + "/api/get_top", {
        access_token: props.accessToken,
        period: period.value,
        type: type
    });
    state.loading = false;
    if (rsp.retcode){
        state.result = "加载失败:" + rsp.msg;
        return;
    }
    state.option = type === 0 ? buildVisitTimeOption(rsp.data) : buildTopOption(rsp.data);
}

async function loadIpLocation(){
    startLoad(ipLocation);
    const rsp = await fetch_api(domain + "/api/get_heatmap_data", {
        access_token: props.accessToken,
        period: period.value
    });
    if (rsp.retcode){
        ipLocation.loading = false;
        ipLocation.result = "加载失败:" + rsp.msg;
        return;
    }
    if (JSON.stringify(rsp.data.visits) === "{}"){
        // 无数据也按错误提示处理
        ipLocation.loading = false;
        ipLocation.result = "暂无数据";
        return;
    }
    ipLocation.loading = false;
    ipLocation.option = buildHeatmapOption(rsp.data);
}

function loadAll(){
    loadStats();
    loadTrend();
    loadTop(0, visitTime);
    loadTop(1, browser);
    loadTop(2, device);
    loadTop(3, os);
    loadIpLocation();
}

defineExpose({ loadAll });

onMounted(() => {
    loadAll();
});
</script>

<template>
    <hr>
    <div class="wux-row-md-3 same-height-container">
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h6 class="thin gray"><IconLogin2 width="16px" height="16px" class="middle"/><span class="middle">总访问量</span></h6>
                    <b class="big-number"><span class="wux-loading" :hidden="statsState !== 'loading'"></span>{{ stats?.total_visits }}</b>
                    <h6 class="thin gray"><IconUser width="16px" height="16px" class="middle"/><span class="middle">总独立 IP 数量</span></h6>
                    <b class="big-number"><span class="wux-loading" :hidden="statsState !== 'loading'"></span>{{ stats?.total_ips }}</b>
                </div>
            </div>
        </div>
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h6 class="thin gray"><IconLogin2 width="16px" height="16px" class="middle"/><span class="middle">今日访问量</span></h6>
                    <b class="big-number"><span class="wux-loading" :hidden="statsState !== 'loading'"></span>{{ stats?.today_visits }}</b>
                    <h6 class="thin gray"><IconUser width="16px" height="16px" class="middle"/><span class="middle">今日独立 IP 数量</span></h6>
                    <b class="big-number"><span class="wux-loading" :hidden="statsState !== 'loading'"></span>{{ stats?.today_ips }}</b>
                </div>
            </div>
        </div>
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h6 class="thin gray"><IconLogin2 width="16px" height="16px" class="middle"/><span class="middle">昨日访问量</span></h6>
                    <b class="big-number"><span class="wux-loading" :hidden="statsState !== 'loading'"></span>{{ stats?.yesterday_visits }}</b>
                    <h6 class="thin gray"><IconUser width="16px" height="16px" class="middle"/><span class="middle">昨日独立 IP 数量</span></h6>
                    <b class="big-number"><span class="wux-loading" :hidden="statsState !== 'loading'"></span>{{ stats?.yesterday_ips }}</b>
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <span class="ml">时间段:</span> <select v-model="period" class="wux-form-select" style="width: 150px;" @change="loadAll()">
                        <option value="604800">最近 7 天</option>
                        <option value="1209600">最近 14 天</option>
                        <option value="2592000">最近 30 天</option>
                        <option value="7776000">最近 90 天</option>
                    </select> <span class="result">{{ statsResult }}</span>
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconTrendingUp width="32px" height="32px" class="middle"/><span class="middle">访问量趋势</span></h2>
                    <Chart :option="trend.option" :loading="trend.loading" :result="trend.result"/>
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconWorld width="32px" height="32px" class="middle"/><span class="middle">用户地理位置</span></h2>
                    <Chart :option="ipLocation.option" :loading="ipLocation.loading" :result="ipLocation.result"/>
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconClock width="32px" height="32px" class="middle"/><span class="middle">访问时间段</span></h2>
                    <Chart :option="visitTime.option" :loading="visitTime.loading" :result="visitTime.result"/>
                </div>
            </div>
        </div>
    </div>
    <div class="wux-row-md-3 same-height-container">
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconBrowser width="32px" height="32px" class="middle"/><span class="middle">浏览器统计</span></h2>
                    <Chart :option="browser.option" :loading="browser.loading" :result="browser.result" short/>
                </div>
            </div>
        </div>
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconKeyboard width="32px" height="32px" class="middle"/><span class="middle">设备统计</span></h2>
                    <Chart :option="device.option" :loading="device.loading" :result="device.result" short/>
                </div>
            </div>
        </div>
        <div class="wux-col same-height-box">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <h2 class="thin"><IconBrandWindows width="32px" height="32px" class="middle"/><span class="middle">操作系统统计</span></h2>
                    <Chart :option="os.option" :loading="os.loading" :result="os.result" short/>
                </div>
            </div>
        </div>
    </div>
</template>
