<script setup lang="js">
import BtnWithLoading from "@/components/BtnWithLoading.vue";
import TextDisplayWithCopy from "@/components/TextDisplayWithCopy.vue";
import {genShareLinkApi} from "@/pages/music/musicWebApi.js";
import {ref} from "vue";
import {IconShare} from "@tabler/icons-vue";

const siteUrl = import.meta.env.VITE_SITE_URL;
const musicPageUrl = import.meta.env.VITE_MUSIC_PAGE_URL;

const props = defineProps({
    musicId: {type: Number},
});
const shareExpiry = ref("2592000");
const btnDisabled = ref(false);
const result = ref("");
const link = ref("");

async function createShareLink() {
    btnDisabled.value = true;
    const rsp = await genShareLinkApi(props.musicId, shareExpiry.value);
    btnDisabled.value = false;
    if (rsp.retcode){
        result.value = rsp.msg;
    }else{
        link.value = siteUrl + musicPageUrl + rsp.data.url;
    }
}

</script>

<template>
    <span>有效期:</span>
    <select class="wux-form-select" style="width: 182px" v-model="shareExpiry">
        <option value="86400">1天</option>
        <option value="604800">7天</option>
        <option value="2592000" selected>30天</option>
    </select>
    <BtnWithLoading @click="createShareLink" :is-loading="btnDisabled" btn-class="mc simple"><IconShare width="16px" height="16px"/>创建</BtnWithLoading><br>
    <TextDisplayWithCopy v-if="link" :value="link" input-class="wux-form-input wux-form-input-md label"/>
    <span class="result" :hidden="!result">{{ result }}</span>
</template>

<style scoped>

</style>