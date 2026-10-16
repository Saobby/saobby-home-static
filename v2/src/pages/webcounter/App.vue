<script setup lang="js">
import { IconPlus, IconUser, IconSettings } from '@tabler/icons-vue';

const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const createWebCounterPageUrl = import.meta.env.VITE_CREATE_WEBCOUNTER_PAGE_URL;
const myWebCountersPageUrl = import.meta.env.VITE_MY_WEBCOUNTERS_PAGE_URL;
const webCounterDashboardPageUrl = import.meta.env.VITE_WEBCOUNTER_DASHBOARD_PAGE_URL;
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">网页计数器</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">网页访问量计数器</h2>
            <ul>
                <li>在图片上实时显示页面<b>访问量/独立IP数</b>，或者<b>静默统计</b></li>
                <li>只需放置一张图片，即可在后台自动统计<b>网页访问量、IP 数量、访客位置、访问量趋势、访问时段、浏览器、设备、操作系统</b>等信息</li>
                <li>还可以<b>查看访问日志</b>，进行进一步分析</li>
                <li>使用方便，<b>可在各类支持 Markdown 的平台上使用，完全免费</b></li>
            </ul>
            <hr>
            <div class="wux-row-md-3 same-height-container">
                <div class="wux-col same-height-box">
                    <div class="wux-card wux-card-hover">
                        <div class="wux-card-body">
                            <a :href="createWebCounterPageUrl"><button class="wux-btn wux-btn-primary wux-btn-text wux-btn-xl" type="button"><IconPlus width="24px" height="24px" class="middle"/><span class="middle">创建计数器</span></button></a><br>
                            <span class="ml">新建一个网页计数器</span>
                        </div>
                    </div>
                </div>
                <div class="wux-col same-height-box">
                    <div class="wux-card wux-card-hover">
                        <div class="wux-card-body">
                            <a :href="myWebCountersPageUrl"><button class="wux-btn wux-btn-primary wux-btn-text wux-btn-xl" type="button"><IconUser width="24px" height="24px" class="middle"/><span class="middle">我的计数器</span></button></a><br>
                            <span class="ml">登录用户可查看自己创建的所有计数器</span>
                        </div>
                    </div>
                </div>
                <div class="wux-col same-height-box">
                    <div class="wux-card wux-card-hover">
                        <div class="wux-card-body">
                            <a :href="webCounterDashboardPageUrl"><button class="wux-btn wux-btn-primary wux-btn-text wux-btn-xl" type="button"><IconSettings width="24px" height="24px" class="middle"/><span class="middle">控制面板</span></button></a><br>
                            <span class="ml">查看统计数据、修改显示设置</span>
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
    margin-left: 12px;
    margin-bottom: 8px;
}
.wux-typo .wux-col {
    padding: 0px 4px;
}
</style>
