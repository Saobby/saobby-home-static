<script setup>
import { onMounted } from 'vue';
import AvatarUploader from '@/components/AvatarUploader.vue';
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
            <li class="wux-breadcrumb-item">设置头像</li>
        </ul>
        <div class="wux-typo">
            <AvatarUploader />
        </div>
    </div>
</template>
