<script setup>
import { ref, onMounted } from 'vue';
import { fetch_api } from '@/assets/js/util';
import { captcha } from "@/assets/js/captcha.js";
import { IconMail, IconUnlink } from "@tabler/icons-vue";
import BtnWithLoading from "@/components/BtnWithLoading.vue";
const domain = import.meta.env.VITE_API_DOMAIN;

const currentEmail = ref('加载中');
const emailInput = ref('');
const sending = ref(false);
const unbinding = ref(false);
const sendResult = ref('');
const unbindResult = ref('');

async function loadBoundEmail(){
    const rsp = await fetch_api(domain + '/api/get_bound_email', { access_token: localStorage.getItem('access-token') });
    if (!rsp.retcode && rsp.data && rsp.data.address){
        currentEmail.value = rsp.data.address;
    }else if (!rsp.retcode){
        currentEmail.value = '当前还未绑定邮箱';
    }else{
        currentEmail.value = '无法加载已绑定邮箱:' + rsp.msg;
    }
}

async function sendEmail(){
    if (!emailInput.value){
        sendResult.value = '请输入邮箱地址';
        return;
    }
    sending.value = true;
    let captchaToken = null;
    const cap = await captcha();
    if (cap && cap.retcode){
        sendResult.value = '人机验证失败:' + cap.msg;
        sending.value = false;
        return;
    }
    captchaToken = cap.data.token;
    const payload = { access_token: localStorage.getItem('access-token'), captcha_token: captchaToken, address: emailInput.value };
    const rsp = await fetch_api(domain + '/api/bind_email', payload);
    sendResult.value = rsp.retcode ? rsp.msg : '已发送验证邮件，请查收';
    sending.value = false;
}

async function unbindEmail(){
    unbinding.value = true;
    const rsp = await fetch_api(domain + '/api/unbind_email', { access_token: localStorage.getItem('access-token') });
    unbindResult.value = rsp.retcode ? rsp.msg : '解绑成功!';
    unbinding.value = false;
}

onMounted(()=>{
    loadBoundEmail();
});
</script>

<template>
    <div>
        <h2 class="mt">绑定电子邮箱</h2>
        <p>绑定电子邮箱后，有人回复你的评论时，或者有人在你的帖子下评论时，你的电子邮箱将会收到一封<b>提醒邮件</b>，点击邮件中的链接可以快速跳转到评论位置。</p>
        <p>支持绑定任何域名邮箱，<b>一个电子邮箱可绑定多个账户</b>，<b>一个账户只能绑定一个电子邮箱</b>，可以随时解绑。</p>
        <p>当前绑定的电子邮箱:<code id="email-addr">{{ currentEmail }}</code></p>
        <p>绑定方法: 在下面的输入框里输入要绑定的邮箱地址，点击<code>发送验证邮件</code>按钮，点击邮箱收到的验证邮件中的链接即可完成绑定。</p>
        <input type="email" v-model="emailInput" placeholder="要绑定的电子邮箱地址" class="wux-form-input wux-form-input-md" style="width: calc( 100% - 150px );display: inline-block;">
        <BtnWithLoading btn-class="wux-btn-primary mc simple" :is-loading="sending" @click="sendEmail"><IconMail width="16px" height="16px"/><span class="middle">发送验证邮件</span></BtnWithLoading><br>
        <span class="result">{{ sendResult }}</span><br>
        <p>如果想要解除绑定，请点击<code>解除绑定</code>按钮</p>
        <BtnWithLoading btn-class="wux-btn-primary mc" @click="unbindEmail" :is-loading="unbinding"><IconUnlink width="16px" height="16px"/><span class="middle">解除绑定</span></BtnWithLoading>
        <span class="result simple">{{ unbindResult }}</span>
    </div>
</template>

