<script setup lang="js">
import {IconCopy} from "@tabler/icons-vue";
import {onBeforeUnmount, ref} from "vue";
import {copyToClipboard} from "@/assets/js/util.js";

// 每个复制点一个实例（各管各的「已复制」），别在页面里共用一个 copyText(text, key)（见 AGENT.md 8.18）
const props = defineProps({
    value: {type: String, default: ""},
    label: {type: String, default: "复制"},
});

const copied = ref(false);
let timer = null;

function copy(){
    copyToClipboard(props.value);   // 不等 Promise：剪贴板被拒时也要照常给反馈
    copied.value = true;
    clearTimeout(timer);
    timer = setTimeout(()=>{copied.value = false;}, 1000);
}

onBeforeUnmount(()=>clearTimeout(timer));

</script>

<template>
    <button type="button" @click="copy()" :disabled="copied"><IconCopy width="16px" height="16px" class="middle"/><span class="middle">{{ copied? "已复制": label }}</span></button>
</template>

<style scoped>

</style>
