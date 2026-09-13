<script setup lang="js">
import { computed, ref, watch, nextTick } from 'vue';
import { IconEdit, IconEye } from '@tabler/icons-vue';
import { emotionsPack } from '@/assets/js/emojis';
import { getElementViewportTop, preserveElementPosition } from '@/assets/js/util.js';
import EmotionsBar from '@/components/EmotionsBar.vue';
import ImageUploader from '@/components/ImageUploader.vue';

const props = defineProps({
    rows: {
        type: Number,
        default: 8
    }, 
    placeholder: {
        type: String
    }, 
    btnClass: {
        type: String, 
        default: ""
    },
    inputClass: {
        type: String, 
        default: ""
    },
    modelValue: {
        type: String,
        default: ''
    },
    // 为 false 时不自带“预览/编辑、表情、上传”按钮，改由父组件放到别处渲染
    showActions: {
        type: Boolean,
        default: true
    },
    // 提交中禁用输入框（如发帖/保存时）
    disabled: {
        type: Boolean,
        default: false
    }
});
const emits = defineEmits(['inputContent', 'update:modelValue']);  // 保存草稿用
const fullPlaceholder = computed(() => {
    return props.placeholder + "\n提示:\n1. 支持Markdown语法、LaTeX语法\n2. 可直接粘贴图片到输入框，会自动上传\n3. 更多用法请见论坛置顶帖子";
});
const showPreview = ref(false);
const content = ref(props.modelValue);
const html = ref('');
async function renderHtml(){
    html.value = "加载中...";
    const { parseMd } = await import("@/assets/js/initMarked.js");
    html.value = parseMd(content.value);
}

const textareaRef = ref(null);

function getContent(){
    return content.value;
}
function setContent(value){
    content.value = value;
}

watch(() => props.modelValue, (newValue) => {
    content.value = newValue;
});

watch(content, (newValue) => {
    emits('update:modelValue', newValue);
});

defineExpose({
    getContent,
    setContent,
    togglePreview,
    showPreview,
    textareaRef,
    resetPreview
});

function emitInputContent() {
    emits('inputContent');
}
function resetPreview(){   // 编辑器常驻后，父组件重新打开时需要重置回“编辑”
    showPreview.value = false;
}

const previewBtnRef = ref(null);
const pressedPreviewBtnRef = ref(null);
// 切换预览/编辑时把按钮钉在原位；两个按钮一显一隐，所以取“切换前后各自可见的”来量位置。
// 先渲染好预览内容再切换视图，避免中间态被绘制出“先跳一下再滚回来”
async function togglePreview(show){
    const beforeEl = show ? previewBtnRef.value : pressedPreviewBtnRef.value;
    const afterEl = show ? pressedPreviewBtnRef.value : previewBtnRef.value;
    const beforeTop = getElementViewportTop(beforeEl);
    if (show){
        await renderHtml();
    }
    showPreview.value = show;
    await nextTick();
    preserveElementPosition(afterEl, beforeTop);
}

</script>
<template>
    <textarea @focusout="emitInputContent" @input="emitInputContent" ref="textareaRef" :rows="rows" :placeholder="fullPlaceholder" :class="'wux-form-input wux-form-input-md '+inputClass" :hidden="showPreview" :disabled="disabled" v-model="content"></textarea>
    <div :class="inputClass" class="pre-like wux-typo" :hidden="!showPreview" v-html="html"></div>
    <button ref="previewBtnRef" :hidden="!showActions || showPreview" :class="'wux-btn wux-btn-primary wux-btn-outline mc '+btnClass" type="button" @click="togglePreview(true)">
        <IconEye width="16px" height="16px" />
        预览
    </button>
    <button ref="pressedPreviewBtnRef" :hidden="!showActions || !showPreview" :class="'wux-btn wux-btn-primary wux-btn-outline mc '+btnClass" type="button" @click="togglePreview(false)">
        <IconEdit width="16px" height="16px" />
        编辑
    </button>
    <slot />
    <EmotionsBar v-if="showActions" :emotions="emotionsPack" :inputRef="textareaRef" :btnClass="btnClass"/>
    <ImageUploader v-if="showActions" :inputRef="textareaRef" :btnClass="btnClass"/>
</template>