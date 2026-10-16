<script setup lang="js">
import { onMounted, ref } from 'vue';
import { check_logged_in, fetch_api, ts2str } from '@/assets/js/util.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import PaginationButtons from '@/components/PaginationButtons.vue';
import { IconClock, IconExternalLink, IconPlus, IconSearch, IconTypography } from '@tabler/icons-vue';
import { getCounterDashboardUrl, getDisplayTypeName, getPicTypeName } from '@/assets/js/webcounter.js';

const domain = import.meta.env.VITE_WEBCOUNTER_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const webCounterPageUrl = import.meta.env.VITE_WEBCOUNTER_PAGE_URL;
const createWebCounterPageUrl = import.meta.env.VITE_CREATE_WEBCOUNTER_PAGE_URL;

const pageSize = 8;

const keyword = ref("");
const counters = ref(null);   // null = 还没加载成功过（显示加载中状态）
const pageIndex = ref(0);
const pageAmount = ref(1);
const loading = ref(false);
const result = ref("");

async function loadWebCounters(index){
    loading.value = true;
    result.value = "";
    const rsp = await fetch_api(domain + "/api/get_users_counter", {
        access_token: localStorage.getItem("access-token"),
        page_index: index,
        page_size: pageSize,
        keyword: keyword.value
    });
    loading.value = false;
    if (rsp.retcode){
        result.value = rsp.msg;
        return;
    }
    counters.value = rsp.data.counters;
    pageIndex.value = rsp.data.page_index;
    pageAmount.value = rsp.data.page_amount;
}

onMounted(() => {
    // 未登录时会跳转到登录页并返回 true
    if (check_logged_in()){
        return;
    }
    loadWebCounters(0);
});
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item"><a :href="webCounterPageUrl">网页计数器</a></li>
            <li class="wux-breadcrumb-item">我的计数器</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">我的计数器</h2>
            <input type="text" v-model="keyword" class="wux-form-input wux-form-input-md" placeholder="搜索 ID 或备注" style="width:calc( 100% - 100px );display:inline-block;" @keyup.enter="loadWebCounters(0)"> <BtnWithLoading btn-class="wux-btn-primary" :is-loading="loading" @click="loadWebCounters(0)"><IconSearch width="16px" height="16px" class="middle"/><span class="middle">搜索</span></BtnWithLoading><br>
            <a :href="createWebCounterPageUrl" target="_blank"><button class="wux-btn wux-btn-primary mt" type="button"><IconPlus width="16px" height="16px" class="middle"/><span class="middle">创建计数器</span></button></a>
            <hr>
            <div id="webcounters">
                <div class="centered" v-if="counters === null">
                    <span class="wux-loading"></span><br>
                    <span>加载中</span><br>
                    <span class="result">{{ result }}</span>
                </div>
                <template v-else>
                    <div class="bottom-line" v-for="counter in counters" :key="counter.counter_id">
                        <b style="font-size:20px;">{{ counter.desc? counter.desc: counter.counter_id }}</b><br>
                        <span class="gray"><IconClock width="16px" height="16px" class="middle"/>{{ ts2str(counter.create_at) }}</span> <span class="gray"><IconTypography width="16px" height="16px" class="middle"/>{{ getPicTypeName(counter.pic_type) }}·{{ getDisplayTypeName(counter.display_type) }}</span><br>
                        <a :href="getCounterDashboardUrl(counter.access_token)" target="_blank"><button class="wux-btn wux-btn-primary wux-btn-sm" type="button"><IconExternalLink width="16px" height="16px" class="middle"/><span class="middle">进入控制面板</span></button></a>
                    </div>
                    <span class="result" v-if="result">{{ result }}</span>
                </template>
            </div>
            <PaginationButtons :page-index="pageIndex" :page-amount="pageAmount" :btn-amount="7" :disabled="loading" group-class="mt" @change-page="loadWebCounters"/>
        </div>
    </div>
</template>
