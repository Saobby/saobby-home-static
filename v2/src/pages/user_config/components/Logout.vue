<script setup lang="js">
import BtnWithLoading from "@/components/BtnWithLoading.vue";
import { fetch_api } from '@/assets/js/util';
import { ref } from 'vue';
import { IconLogout } from "@tabler/icons-vue";

const domain = import.meta.env.VITE_API_DOMAIN;
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

const loading = ref(false);
const result = ref('');

async function logout(){
    loading.value = true;
    const rsp = await fetch_api(domain+'/api/logout', {
        access_token: localStorage.getItem('access-token')
    });
    loading.value = false;
    if (rsp.retcode){
        result.value = rsp.msg;
    }else{
        result.value = '退出登录成功';
        localStorage.removeItem('access-token');
        window.location.href = homePageUrl;
    }
}

</script>

<template>
    <h2 class="mt">退出登录</h2>
    <p>退出登录并销毁当前会话。退出登录后可登录其他账户。</p>
    <BtnWithLoading btn-class="mc" :is-loading="loading" @click="logout"><IconLogout width="16px" height="16px"/>退出登录</BtnWithLoading>
    <span class="result simple">{{ result }}</span>
</template>

<style scoped>

</style>