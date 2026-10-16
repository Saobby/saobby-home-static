<script setup lang="js">
import {IconCopy} from "@tabler/icons-vue";
import {onBeforeUnmount, ref} from "vue";
import {copyToClipboard} from "@/assets/js/util.js";

// 「复制一段文本」的按钮。要复制的内容不是它自己的输入框时用它（旁边是 textarea / code / 链接），
// 输入框 + 复制按钮那一对用 TextDisplayWithCopy。
// 每个实例自己管自己的「已复制」状态（1 秒后复原），所以页面上有几个复制点就放几个实例；
// 按钮的 class/style 由使用方传属性进来（单根节点会自动合并到 <button> 上）。
const props = defineProps({
    value: {type: String, default: ""},
    label: {type: String, default: "复制"},
});

const copied = ref(false);
let timer = null;

function copy(){
    copyToClipboard(props.value);   // 不等 Promise：剪贴板被浏览器拒绝时也要照常给个「已复制」的反馈
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
