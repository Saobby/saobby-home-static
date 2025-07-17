<script setup lang="js">
import { IconPhotoUp, IconX } from '@tabler/icons-vue';
import { ref, watch } from 'vue';
import { gen_captcha } from '@/assets/js/captcha.js';
import { FormSubmitter, insertIntoTextareaPosition } from '@/assets/js/util.js';
const props = defineProps({
    inputRef: { type: Object },
    btnClass: { type: String, default: "" }
});
const show = ref(false);
const result = ref("");
const progress = ref(0);
const status = ref("closed");
let formSubmitter = null;

function cancel(){
    if (formSubmitter){
        formSubmitter.abort();
    }
    show.value = false;
    status.value = "closed";
}
watch(
    () => props.inputRef, 
    (textarea) => {
        if (!textarea) return;
        textarea.addEventListener('paste', async function(event){
            const items = (event.clipboardData || event.originalEvent.clipboardData).items;
            let prevented = false;
            for (let i = 0; i < items.length; i++) {
                const item = items[i];
                if (item.type.startsWith("image/")) {
                    if (!prevented){
                        event.preventDefault();
                        prevented = true;
                    }
                    const image_file = item.getAsFile();
                    await upload_image(image_file, event.target);
                }
            }
        });
    }
);
async function upload_image(image_file, textarea){
    return new Promise(function(resolve, reject){
        if (status.value !== "closed"){
            result.value = "无法上传图片,因为有一个正在进行的上传任务";
            reject({"message": "无法上传图片,因为有一个正在进行的上传任务"});
            return;
        }
        textarea.readOnly = true;
        let ta_selected_range = [textarea.selectionStart, textarea.selectionEnd];
        status.value = "captcha_verifying";
        result.value = "正在进行人机验证...";
        gen_captcha().verify().then(function(val){
            if (val.retcode){
                status.value = "closed";
                result.value = "人机验证失败:"+ val.msg;
                textarea.readOnly = false;
                reject({"message": "无法上传图片,人机验证失败:"+val.msg});
                return;
            }
            show.value = true;
            progress.value = 0;
            result.value = "正在上传...";
            status.value = "uploading";

            const formData = new FormData;
            formData.append("image", image_file);
            formData.append("captcha_token", val.data.token);

            formSubmitter = new FormSubmitter(
                import.meta.env.VITE_IMAGE_UPLOAD_API_URL, 
                formData, 
                true, 
                (p)=>{
                    progress.value = p;
                    if (p === 1){
                        result.value = "正在处理...";
                    }
                }
            );
            formSubmitter.send().then((rsp)=>{
                if (rsp.retcode){
                    result.value = "上传失败:"+rsp.msg;
                    status.value = "closed";
                    textarea.readOnly = false;
                    reject({"message": "上传失败:"+rsp.msg});
                }else{
                    insertIntoTextareaPosition(textarea, `![](${rsp.data.image_url})`, ta_selected_range[0], ta_selected_range[1]);
                    result.value = "";
                    show.value = false;
                    status.value = "closed";
                    textarea.readOnly = false;
                    resolve({"message": "OK"});
                }
            });
        });
    });
}
const fileInput = ref(null);
async function selectFile(){
    const file = fileInput.value.files[0];
    fileInput.value.value = "";
    if (!file){
        return;
    }
    await upload_image(file, props.inputRef);
}
</script>
<template>
    <input @change="selectFile()" ref="fileInput" type="file" accept="image/*" hidden>
    <button @click="fileInput.click();" type="button" :class="'wux-btn wux-btn-success wux-btn-text icon-btn simple '+btnClass">
        <IconPhotoUp width="24px" height="24px" />
    </button>
    <span class="result simple">{{ result }}</span>
    <div :hidden="!show" style="position:fixed;top:calc(50vh - 90px);left:calc(50vw - 200px);width:400px;height:180px;background:#ffffff;white-space:normal;z-index:114514;" class="pre-like">
        <h2>正在上传图片...</h2>
        <progress class="wux-progress" :value="progress" max="1"></progress>
        <span>上传进度:{{ Math.round(progress * 100) }}%</span>
        <br>
        <span class="result">{{ result }}</span>
        <button @click="cancel()" type="button" class="wux-btn wux-btn-primary wux-btn-outline right mc">
            <IconX width="16px" height="16px" />
            取消
        </button>
    </div>
</template>