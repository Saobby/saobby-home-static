<script setup>
import { ref } from 'vue';
import { FormSubmitter } from '@/assets/js/util.js';
import { captcha } from '@/assets/js/captcha.js';
import BtnWithLoading from '@/components/BtnWithLoading.vue';
import TextDisplayWithCopy from '@/components/TextDisplayWithCopy.vue';
import { IconUpload } from '@tabler/icons-vue';

const uploadUrl = import.meta.env.VITE_GITHUB_PICBED_API_DOMAIN + "/api/github_picbed";
const homePageUrl = import.meta.env.VITE_HOME_PAGE_URL;

const fileRef = ref(null);
const fileUrl = ref("");
const markdown = ref("");
const uploadResult = ref("");
const uploadProgress = ref(0);
const uploading = ref(false);

async function uploadFile(){
    const file = fileRef.value && fileRef.value.files[0];
    if (!file){
        uploadResult.value = "你未选择任何文件";
        return;
    }
    uploading.value = true;
    uploadResult.value = "";

    const captchaRsp = await captcha();
    if (captchaRsp.retcode){
        uploadResult.value = "人机验证失败:" + captchaRsp.msg;
        uploading.value = false;
        return;
    }

    const form = new FormData();
    form.append("file", file);
    form.append("captcha_token", captchaRsp.data.token);
    const submitter = new FormSubmitter(uploadUrl, form, true, (progress) => {
        uploadProgress.value = progress;
        uploadResult.value = progress === 1 ? "正在处理..." : `上传中(${Math.floor(progress * 100)}%)`;
    });
    const rsp = await submitter.send();
    uploading.value = false;
    uploadProgress.value = 0;
    if (rsp.retcode){
        uploadResult.value = rsp.msg;
        return;
    }
    uploadResult.value = "上传成功";
    fileUrl.value = rsp.data.url;
    markdown.value = `![](${rsp.data.url})`;
}
</script>

<template>
    <div class="wux-container">
        <ul class="wux-breadcrumb">
            <li class="wux-breadcrumb-item"><a :href="homePageUrl">主页</a></li>
            <li class="wux-breadcrumb-item">图床/网盘</li>
        </ul>
        <div class="wux-typo">
            <h2 class="mt">文件上传</h2>
            <p>文件最大 25 MB, <b>上传后要等大约1分钟才能通过链接下载到文件</b></p>
            <input ref="fileRef" class="wux-form-upload" type="file" :disabled="uploading"><br>
            <BtnWithLoading btn-class="wux-btn-primary" :is-loading="uploading" @click="uploadFile()"><IconUpload width="16px" height="16px" class="middle"/><span class="middle">上传</span></BtnWithLoading> <span class="result">{{ uploadResult }}</span><br>
            <progress class="wux-progress" :value="uploadProgress * 100" max="100" :hidden="!uploadProgress"></progress><br :hidden="!uploadProgress">
            <TextDisplayWithCopy :value="fileUrl" placeholder="文件链接会显示在这里" input-style="width: calc( 100% - 90px );display: inline-block;"/>
            <TextDisplayWithCopy :value="markdown" placeholder="图片markdown会显示在这里" input-style="width: calc( 100% - 90px );display: inline-block;"/>
        </div>
    </div>
</template>
