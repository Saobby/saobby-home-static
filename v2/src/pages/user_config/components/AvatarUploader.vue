<script setup>
import { ref } from 'vue';
import { FormSubmitter, fetch_api } from '@/assets/js/util';
import { captcha } from "@/assets/js/captcha";
import {IconUpload, IconCheck} from "@tabler/icons-vue";
const domain = import.meta.env.VITE_API_DOMAIN || 'https://comments.saobby.com';

const fileRef = ref(null);
const avatarUrl = ref('');
const preview = ref('');
const uploadProgress = ref(0);
const uploadMsg = ref('');
const uploading = ref(false);

async function uploadAvatar(){
    const file = fileRef.value && fileRef.value.files[0];
    if (!file){
        uploadMsg.value = '你未选择任何文件';
        return;
    }
    uploading.value = true;
    // captcha
    let captchaToken = null;
    const cap = await captcha();
    if (cap && cap.retcode){
        uploadMsg.value = '人机验证失败:'+cap.msg;
        uploading.value=false;
        return
    } else {
        captchaToken = cap.data.token;
    }
    const form = new FormData();
    form.append('image', file);
    if (captchaToken) form.append('captcha_token', captchaToken);
    const submitter = new FormSubmitter('https://image.saobby.com/api/upload_image', form, true, (p)=>{
        uploadProgress.value = p;
        uploadMsg.value = `上传中(${Math.round(p*100)}%)`;
    });
    const rsp = await submitter.send();
    if (rsp.retcode){
        uploadMsg.value = rsp.msg;
    }else{
        uploadMsg.value = '上传成功';
        avatarUrl.value = rsp.data.image_url;
        preview.value = rsp.data.image_url;
    }
    uploading.value = false;
}

async function setAvatar(){
    if (!avatarUrl.value){ uploadMsg.value = '链接不能为空'; return; }
    const rsp = await fetch_api(domain + '/api/set_avatar_url', { avatar_url: avatarUrl.value, access_token: localStorage.getItem('access-token') });
    uploadMsg.value = rsp.retcode? rsp.msg: '头像设置成功';
}
</script>

<template>
    <div>
        <h2 class="mt">设置头像</h2>
        <p>上传头像或者设置头像图片链接，图片最大 16MB</p>
        <input ref="fileRef" class="wux-form-upload" type="file" accept="image/*"><br>
        <button class="wux-btn wux-btn-primary mc" type="button" @click="uploadAvatar" :disabled="uploading"><IconUpload width="16px" height="16px"/><span class="middle">上传</span></button>
        <span class="result">{{ uploadMsg }}</span><br>
        <progress class="wux-progress" :value="uploadProgress" max="1" :hidden="uploadProgress===0"></progress><br>
        <img :src="preview" alt="头像" id="avatar_img" width="32" height="32" v-if="preview"><br>
        <input class="wux-form-input wux-form-input-md" placeholder="头像链接" type="text" v-model="avatarUrl">
        <button class="wux-btn wux-btn-primary mc" type="button" @click="setAvatar"><IconCheck width="16px" height="16px"/><span class="middle">保存</span></button>
        <span class="result">{{ uploadMsg }}</span>
    </div>
</template>

<style scoped>
.result{ margin-left:12px }
</style>

