<script setup lang="js">
import {computed, onMounted, ref, nextTick} from 'vue';
import { IconMarkdown } from '@tabler/icons-vue';
import { getElementViewportTop, preserveElementPosition } from '@/assets/js/util.js';
const props = defineProps({
    show: {type: Boolean, default: true},
    showBtn: {type: Boolean, default: true},
    md: {type: String },
    btnClass: {type: String, default: ''},
    divClass: {type: String, default: ''}
})
const showMd = ref(false);
const mdParser = ref(null);
const html = computed(() => {
    if (!props.md) return '';
    if (!mdParser.value){
        return "Markdown 解析器加载中...";
    }
    return mdParser.value(props.md);
});
async function loadMdParser(){
    if (mdParser.value) return;
    const mod = await import("@/assets/js/initMarked.js");
    mdParser.value = mod.parseMd;
}
onMounted(async () => {
    await loadMdParser();
});
function toggleShowMd(){
    showMd.value = !showMd.value;
}
const buttonRef = ref(null);
const pressedButtonRef = ref(null);
// 两个“查看M↓”按钮切换时把按钮钉在原位；一显一隐，所以取“切换前后各自可见的”来量位置
async function onToggleMdBtnClick(){
    const beforeEl = showMd.value ? pressedButtonRef.value : buttonRef.value;
    const afterEl = showMd.value ? buttonRef.value : pressedButtonRef.value;
    const beforeTop = getElementViewportTop(beforeEl);
    showMd.value = !showMd.value;
    await nextTick();
    preserveElementPosition(afterEl, beforeTop);
}
defineExpose({ toggleShowMd });
</script>
<template>
    <div :hidden="!show">
        <div :class="'pre-like-code '+divClass" :hidden="!showMd" class="margin">{{ md }}</div>
        <div :class="divClass" :hidden="showMd" v-html="html"  class="margin"></div>
        <slot />
        <button ref="buttonRef" :hidden="showMd || !showBtn" @click="onToggleMdBtnClick()" :class="'wux-btn wux-btn-primary wux-btn-outline mc simple '+btnClass" type="button">
            <IconMarkdown width="16px" height="16px" />
            查看M↓
        </button>
        <button ref="pressedButtonRef" :hidden="!showMd || !showBtn" @click="onToggleMdBtnClick()" :class="'wux-btn wux-btn-primary mc simple '+btnClass" type="button">
            <IconMarkdown width="16px" height="16px" />
            查看M↓
        </button>
    </div>
</template>

<style scoped>
.margin {
  margin-top: 10px;
  margin-bottom: 10px;
  margin-left: 5px;
}
</style>