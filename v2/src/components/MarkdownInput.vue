<script setup lang="js">
import { computed, ref } from 'vue';
import { IconEdit, IconEye } from '@tabler/icons-vue';
import { parseMd } from "@/assets/js/initMarked.js";
import { emotionsPack } from '@/assets/js/emojis';
import EmotionsBar from '@/components/EmotionsBar.vue';

const props = defineProps({
    rows: {
        type: Number,
        default: 8
    }, 
    placeholder: {
        type: String
    }
});
const fullPlaceholder = computed(() => {
    return props.placeholder + "\n提示:\n1. 支持Markdown语法、LaTeX语法\n2. 可直接粘贴图片到输入框，会自动上传\n3. 更多用法请见论坛置顶帖子";
});
const showPreview = ref(false);
const content = ref('');
const html = ref('');
function renderHtml(){
    html.value = parseMd(content.value);
}

const textareaRef = ref(null);

</script>
<template>
    <textarea ref="textareaRef" :rows="rows" :placeholder="fullPlaceholder" class="wux-form-input wux-form-input-md" v-if="!showPreview" v-model="content"></textarea>
    <div class="pre-like wux-typo" v-if="showPreview" v-html="html"></div>
    <button class="wux-btn wux-btn-primary wux-btn-outline mc" type="button" v-if="!showPreview" @click="showPreview = true; renderHtml()">
        <IconEye width="16px" height="16px" />
        预览
    </button>
    <button class="wux-btn wux-btn-primary wux-btn-outline mc" type="button" v-if="showPreview" @click="showPreview = false">
        <IconEdit width="16px" height="16px" />
        编辑
    </button>
    <EmotionsBar :emotions="emotionsPack" :inputRef="textareaRef" :hidden="showPreview"/>
</template>