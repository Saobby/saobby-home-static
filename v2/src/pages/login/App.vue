<script setup lang="js">
import { ref } from 'vue';
import BtnWithLoading from "@/components/BtnWithLoading.vue";
import { IconLogin } from "@tabler/icons-vue";
import { fetch_api } from "@/assets/js/util.js";
import { captcha } from "@/assets/js/captcha.js";

const username = ref('');
const password = ref('');

const loading = ref(false);
const result = ref('');

const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;
const registerPageUrl = import.meta.env.VITE_REGISTER_PAGE_URL;
const domain = import.meta.env.VITE_API_DOMAIN;

async function login(){
    if (username.value === "" || password.value === ""){
        result.value = "用户名和密码均不能为空!";
        return;
    }
    loading.value = true;

    const captcha_rsp = await captcha();
    if (captcha_rsp.retcode){
        result.value = "人机验证失败:"+captcha_rsp.msg;
        loading.value = false;
        return;
    }

    const rsp = await fetch_api(domain+"/api/login", {
        username: username.value,
        password: password.value,
        captcha_token: captcha_rsp.data.token
    });
    if (rsp.retcode){
        result.value = rsp.msg;
        loading.value = false;
        return;
    }
    localStorage.setItem("access-token", rsp.data.access_token);
    if (!(localStorage.login_redirect)){
        window.location = homePageUrl;
    }else{
        window.location = localStorage.login_redirect;
        delete localStorage.login_redirect;
    }
}
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">登录</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">登录</h2>
            <input class="wux-form-input wux-form-input-md" placeholder="用户名" type="text" v-model="username">
            <input class="wux-form-input wux-form-input-md" placeholder="密码" type="password" v-model="password">
            <BtnWithLoading btn-class="wux-btn-primary mc" :is-loading="loading" @click="login"><IconLogin width="16px" height="16px"/><span class="middle">登录</span></BtnWithLoading>
            <a class="simple" :href="registerPageUrl">没有账号?点击注册!</a>
            <br>
            <span class="result">{{ result }}</span>
        </div>
    </div>
</template>

<style scoped>

</style>