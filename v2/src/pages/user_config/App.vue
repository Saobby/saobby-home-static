<script setup>
import { onMounted } from 'vue';
import NotificationSettings from './components/NotificationSettings.vue';
import BindEmailForm from './components/BindEmailForm.vue';
import AvatarUploader from './components/AvatarUploader.vue';
import Logout from "./components/Logout.vue";
import { check_logged_in } from '@/assets/js/util';
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

onMounted(()=>{
    check_logged_in();
});

</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">用户设置</li>
        </ul>
        <div class="wux-typo">
            <div class="wux-tab">
                <input class="wux-tab-item" type="radio" name="tab-user-config" id="tab-notifications" checked>
                <label class="wux-tab-item" for="tab-notifications">通知设置</label>
                <div class="wux-tab-content">
                    <notification-settings />
                </div>
                <input class="wux-tab-item" type="radio" name="tab-user-config" id="tab-bind-email">
                <label class="wux-tab-item" for="tab-bind-email">绑定电子邮箱</label>
                <div class="wux-tab-content">
                    <bind-email-form />
                </div>
                <input class="wux-tab-item" type="radio" name="tab-user-config" id="tab-set-avatar">
                <label class="wux-tab-item" for="tab-set-avatar">设置头像</label>
                <div class="wux-tab-content">
                    <avatar-uploader />
                </div>
                <input class="wux-tab-item" type="radio" name="tab-user-config" id="tab-logout">
                <label class="wux-tab-item" for="tab-logout">退出登录</label>
                <div class="wux-tab-content">
                    <logout />
                </div>
            </div>
        </div>
    </div>
</template>

<style scoped>
[hidden] { display: none !important; }
</style>

