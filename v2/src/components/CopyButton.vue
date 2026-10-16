<script setup lang="js">
import {IconCopy} from "@tabler/icons-vue";
import {onBeforeUnmount, ref} from "vue";
import {copyToClipboard} from "@/assets/js/util.js";

// 每个复制点一个实例（各管各的状态），别在页面里共用一个 copyText(text, key)（见 AGENT.md 8.18）
const props = defineProps({
    value: {type: String, default: ""},
    label: {type: String, default: "复制"},
});

const state = ref("");   // "" = 待复制，其余是 1 秒的反馈文案（已复制 / 失败）
let timer = null;

async function copy(){
    state.value = await copyToClipboard(props.value) ? "已复制" : "失败";
    clearTimeout(timer);
    timer = setTimeout(()=>{state.value = "";}, 1000);
}

onBeforeUnmount(()=>clearTimeout(timer));

</script>

<template>
    <button type="button" @click="copy()" :disabled="!!state"><IconCopy v-if="!state" width="16px" height="16px" class="middle"/><span class="middle">{{ state || label }}</span></button>
</template>

<style scoped>

</style>
