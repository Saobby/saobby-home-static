<script setup lang="js">
import { ref, onMounted } from 'vue';
import { fetch_api, ts2str, check_logged_in } from '@/assets/js/util.js';
import PaginationButtons from '@/components/PaginationButtons.vue';
import MarkdownDisplay from '@/components/MarkdownDisplay.vue';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import { IconDeselect, IconCheck, IconChecks, IconRefresh, IconClock } from '@tabler/icons-vue';

const domain = import.meta.env.VITE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const pageSize = 8;

const readStatus = ref(0);   // 0 全部 / 1 已读 / 2 未读
const pageIndex = ref(0);
const pageAmount = ref(1);
const notifications = ref([]);
const selected = ref([]);
const result = ref("");

const uiDisabled = ref(false);
const acking = ref(null);         // null | "selected" | "all"
const ackDisabled = ref(false);

async function loadNotifications(read_status, page_index){
    readStatus.value = read_status;
    pageIndex.value = page_index;
    selected.value = [];
    uiDisabled.value = true;
    const rsp = await fetch_api(domain + "/api/get_notification", {
        access_token: localStorage.getItem("access-token"),
        page_size: pageSize,
        page_index: page_index,
        read_status: read_status
    });
    uiDisabled.value = false;
    if (rsp.retcode){
        result.value = rsp.msg;
        return;
    }
    notifications.value = rsp.data.notifications;
    pageAmount.value = rsp.data.page_amount;
}

function switchTab(read_status){
    loadNotifications(read_status, 0);
}
function loadPage(index){
    loadNotifications(readStatus.value, index);
}
function refresh(){
    loadNotifications(readStatus.value, pageIndex.value);
}
function deselect(){
    const ids = notifications.value.map(n => n.id);
    selected.value = ids.filter(id => !selected.value.includes(id));
}

async function ackNotifications(target){
    acking.value = target === "all" ? "all" : "selected";
    ackDisabled.value = true;
    const rsp = await fetch_api(domain + "/api/ack_notification", {
        access_token: localStorage.getItem("access-token"),
        notifications: target
    });
    ackDisabled.value = false;
    acking.value = null;
    if (rsp.retcode){
        result.value = rsp.msg;
        return;
    }
    result.value = "操作成功";
    // 与原版一致：「全部」页签留在当前页，其它页签回到第一页
    loadNotifications(readStatus.value, readStatus.value === 0 ? pageIndex.value : 0);
}

onMounted(() => {
    if (check_logged_in()){
        return;
    }
    loadNotifications(0, 0);
});
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">通知中心</li>
        </ul>
        <div class="wux-typo">
            <h1 class="mt">通知中心</h1>
            <div class="action-row">
                <button type="button" class="wux-btn wux-btn-primary wux-btn-outline simple" :disabled="ackDisabled" @click="deselect()"><IconDeselect :width="16" :height="16" class="middle"/><span class="middle">反选</span></button>
                <BtnWithLoading btn-class="wux-btn-primary simple" :disabled="ackDisabled" :is-loading="acking==='selected'" @click="ackNotifications(selected)"><IconCheck :width="16" :height="16" class="middle"/><span class="middle">已读选中</span></BtnWithLoading>
                <BtnWithLoading btn-class="wux-btn-primary simple" :disabled="ackDisabled" :is-loading="acking==='all'" @click="ackNotifications('all')"><IconChecks :width="16" :height="16" class="middle"/><span class="middle">全部已读</span></BtnWithLoading>
                <BtnWithLoading btn-class="wux-btn-primary simple" :is-loading="uiDisabled" @click="refresh()"><IconRefresh :width="16" :height="16" class="middle"/><span class="middle">刷新</span></BtnWithLoading>
                <span class="result">{{ result }}</span>
            </div>
            <div class="wux-tab">
                <input class="wux-tab-item" type="radio" id="tab-all" name="notification-tab" :checked="readStatus===0" @click="switchTab(0)">
                <label class="wux-tab-item" for="tab-all">全部</label>
                <input class="wux-tab-item" type="radio" id="tab-unread" name="notification-tab" :checked="readStatus===2" @click="switchTab(2)">
                <label class="wux-tab-item" for="tab-unread">未读</label>
                <input class="wux-tab-item" type="radio" id="tab-read" name="notification-tab" :checked="readStatus===1" @click="switchTab(1)">
                <label class="wux-tab-item" for="tab-read">已读</label>
            </div>
            <hr>
            <div class="notifications-list">
                <div class="notification-item" v-for="noti in notifications" :key="noti.id">
                    <div class="notification-item-head">
                        <input type="checkbox" class="wux-form-checks" :value="noti.id" v-model="selected" :disabled="ackDisabled">
                        <span class="gray mc"><IconClock :width="16" :height="16"/>{{ ts2str(noti.create_at) }}</span>
                    </div>
                    <MarkdownDisplay :md="noti.content" :show-btn="false" :div-class="noti.is_read ? 'notification-read' : ''"/>
                    <hr>
                </div>
            </div>
            <PaginationButtons @changePage="loadPage" :pageIndex="pageIndex" :pageAmount="pageAmount" :btnAmount="7" :disabled="uiDisabled"/>
        </div>
    </div>
</template>

<style scoped>
.action-row {
    display: flex;
    flex-wrap: wrap;
    align-items: center;
    gap: 4px;
}
.notification-item-head {
    display: flex;
    align-items: center;
    gap: 8px;
}
/* wux 自带 margin-right:4px，会叠加到 flex gap 上 */
.notification-item-head .wux-form-checks {
    margin-right: 0;
}
/* tabler 图标全局带 translateY(-0.07em)，会让图标比 checkbox 的几何中线高 1px */
.notification-item-head :deep(.tabler-icon) {
    transform: none;
}
/* 去掉 MarkdownDisplay 内容块的 margin-left:5px，让正文左边界与 checkbox 对齐 */
.notification-item :deep(.margin) {
    margin-left: 0;
}
:deep(.notification-read) {
    color: #888888;
}
/* hr 是每条的最后一个子元素，margin-bottom 会被 .wux-typo hr:last-child 清零 */
.notifications-list .notification-item hr {
    margin-bottom: .8em;
}
</style>