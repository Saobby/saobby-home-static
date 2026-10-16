<script setup lang="js">
import { onBeforeUnmount, ref, watch } from 'vue';
import { fetch_api, ts2str } from '@/assets/js/util.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import PaginationButtons from '@/components/PaginationButtons.vue';
import { IconLogs, IconRefresh } from '@tabler/icons-vue';

const props = defineProps({
    accessToken: { type: String, default: "" },
    active: { type: Boolean, default: false }   // 当前是否在「日志查询」tab（自动刷新会用到）
});

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;
const pageSize = 64;

const period = ref("604800");
const logs = ref([]);
const pageIndex = ref(0);
const pageAmount = ref(1);
const loading = ref(false);
const result = ref("");
const autoRefresh = ref(false);

let refreshInterval = null;

async function loadLogs(index){
    loading.value = true;
    result.value = "";
    const rsp = await fetch_api(domain + "/api/get_log", {
        period: period.value,
        access_token: props.accessToken,
        page_index: index,
        page_size: pageSize
    });
    loading.value = false;
    if (rsp.retcode){
        result.value = rsp.msg;
        return;
    }
    logs.value = rsp.data.logs;
    pageIndex.value = index;
    pageAmount.value = rsp.data.page_amount;
}

// 5 秒一次，且只在该 tab 可见、页面在前台时刷新
function updateAutoRefresh(checked){
    clearInterval(refreshInterval);
    refreshInterval = null;
    if (!checked){
        return;
    }
    refreshInterval = setInterval(() => {
        if (document.visibilityState === "visible" && props.active){
            loadLogs(0);
        }
    }, 5000);
}

watch(autoRefresh, (checked) => updateAutoRefresh(checked));
onBeforeUnmount(() => clearInterval(refreshInterval));

defineExpose({ loadLogs });
</script>

<template>
    <hr>
    <div class="wux-row-md-1">
        <div class="wux-col">
            <div class="wux-card wux-card-hover">
                <div class="wux-card-body">
                    <span style="font-size: 28px;"><IconLogs width="32px" height="32px" class="middle"/><span class="middle">日志查询</span></span> <select v-model="period" class="wux-form-select" style="width: 150px;">
                        <option value="604800">最近 7 天</option>
                        <option value="1209600">最近 14 天</option>
                        <option value="2592000">最近 30 天</option>
                    </select> <BtnWithLoading btn-class="wux-btn-primary" :is-loading="loading" @click="loadLogs(0)"><IconRefresh width="16px" height="16px" class="middle"/><span class="middle">刷新</span></BtnWithLoading> <label style="display: inline-block;"><input type="checkbox" class="wux-form-checks" v-model="autoRefresh">自动刷新</label> <span class="result">{{ result }}</span>
                    <hr>
                    <div style="overflow-x: auto;">
                        <table class="wux-table log-table">
                            <thead>
                                <tr>
                                    <th>时间</th>
                                    <th>IP</th>
                                    <th>浏览器</th>
                                    <th>设备</th>
                                    <th>操作系统</th>
                                    <th>国家/地区</th>
                                    <th>地区</th>
                                    <th>城市</th>
                                    <th>网络服务商</th>
                                    <th>是否移动网络</th>
                                    <th>是否代理IP</th>
                                    <th>是否机房IP</th>
                                    <th>Referer</th>
                                    <th>User-Agent</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr v-for="(log, index) in logs" :key="index">
                                    <td>{{ ts2str(log.timestamp) }}</td>
                                    <td>{{ log.ip }}</td>
                                    <td>{{ log.browser? log.browser: "解析中" }}</td>
                                    <td>{{ log.device? log.device: "解析中" }}</td>
                                    <td>{{ log.os? log.os: "解析中" }}</td>
                                    <td>{{ log.country? log.country: "解析中" }}</td>
                                    <td>{{ log.province? log.province: "解析中" }}</td>
                                    <td>{{ log.city? log.city: "解析中" }}</td>
                                    <td>{{ log.isp? log.isp: "解析中" }}</td>
                                    <td>{{ log.is_mobile_ip === null? "解析中": (log.is_mobile_ip? "是": "否") }}</td>
                                    <td>{{ log.is_proxy_ip === null? "解析中": (log.is_proxy_ip? "是": "否") }}</td>
                                    <td>{{ log.is_hosting_ip === null? "解析中": (log.is_hosting_ip? "是": "否") }}</td>
                                    <td>{{ log.referer? log.referer: "无" }}</td>
                                    <td>{{ log.user_agent? log.user_agent: "无" }}</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>
                    <PaginationButtons :page-index="pageIndex" :page-amount="pageAmount" :btn-amount="7" :disabled="loading" group-class="mt" @change-page="loadLogs"/>
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
.log-table{
    table-layout: auto;
    width: 100%;
}
.log-table th{
    white-space: nowrap;
}
.log-table td{
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
}
</style>
