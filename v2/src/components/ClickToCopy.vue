<script setup lang="js">
import { computed, onBeforeUnmount, ref } from 'vue';
import { IconCheck, IconCopy, IconX } from '@tabler/icons-vue';
import { copyToClipboard } from '@/assets/js/util.js';

const props = defineProps({
    value: { type: String, default: "" },
    display: { type: String, default: "" },
    href: { type: String, default: "" },
    copyOnTextClick: { type: Boolean, default: true },
    duration: { type: Number, default: 1000 },
    iconSize: { type: Number, default: 16 },
    btnClass: { type: String, default: "" }
});
const emit = defineEmits(['copied', 'error']);

const status = ref("");
let timer = null;

const text = computed(() => props.display || props.value);
const btnTitle = computed(() => {
    if (status.value === "copied"){
        return "已复制";
    }
    if (status.value === "failed"){
        return "复制失败，请手动复制";
    }
    return "复制";
});

async function copy(){
    clearTimeout(timer);
    const ok = await copyToClipboard(props.value);
    status.value = ok ? "copied" : "failed";
    emit(ok ? "copied" : "error");
    timer = setTimeout(() => { status.value = ""; }, props.duration);
}
onBeforeUnmount(() => clearTimeout(timer));
</script>

<template>
    <span class="mc2">
        <a v-if="href" class="copy-text" :href="href" target="_blank" @click="copyOnTextClick && copy()">{{ text }}</a>
        <span v-else class="copy-text" title="点击复制" @click="copy()">{{ text }}</span>
        <button type="button" :class="'wux-btn wux-btn-text icon-btn mc simple ' + btnClass" :title="btnTitle" :aria-label="btnTitle" @click="copy()">
            <IconCheck v-if="status === 'copied'" :width="iconSize + 'px'" :height="iconSize + 'px'" class="copy-ok"/>
            <IconX v-else-if="status === 'failed'" :width="iconSize + 'px'" :height="iconSize + 'px'" class="copy-fail"/>
            <IconCopy v-else :width="iconSize + 'px'" :height="iconSize + 'px'"/>
        </button>
    </span>
</template>

<style scoped>
.copy-text{
    color: var(--link-color);
    cursor: pointer;
    transition: .2s;
}
.copy-text:hover{
    color: var(--link-hover-color);
    text-decoration: underline;
}
.mc2 .wux-btn{
    margin-bottom: 0;
    vertical-align: middle;
}
.copy-ok{
    color: var(--status-success-color, #1f8a53);
}
.copy-fail{
    color: var(--status-error-color, #cc4434);
}
</style>
