<script setup lang="js">
import TagsDisplay from '@/components/TagsDisplay.vue';
import { watch, ref } from 'vue';
import { IconPlus, IconCheck } from '@tabler/icons-vue';
const props = defineProps({
    modelValue: {
        type: Array,
        default: () => []
    },
    choices: {
        type: Array,
        default: () => ["古典", "流行", "摇滚", "金属", "电子", "嘻哈", "爵士", "民谣"]
    }
});
const emits = defineEmits(['update:modelValue']);
const tags = ref(props.modelValue);
watch(() => props.modelValue, (newValue) => {
    tags.value = newValue;
});
watch(tags, (newValue) => {
    emits('update:modelValue', newValue);
});
function addTag(tag) {
    if (!tag){
        msg.value = "标签不能为空";
        return;
    }
    if (tag.length > 16) {
        msg.value = "标签不能超过 16 个字";
        return;
    }
    if (tags.value.includes(tag)) {
        msg.value = "此标签已存在";
        return;
    }
    if (tags.value.length >= 8) {
        msg.value = "最多只能添加 8 个标签";
        return;
    }
    tags.value = [...tags.value, tag];  // 重新创建数组以触发响应式更新
    msg.value = "";
    newTag.value = "";
    showAddWindow.value = false;
}
const msg = ref("");
const newTag = ref("");
const showAddWindow = ref(false);
const addWindowRef = ref(null);
const plusBtnRef = ref(null);

function handleClickOutside(event) {
    if (!plusBtnRef.value.contains(event.target) && !addWindowRef.value.contains(event.target)) {
        showAddWindow.value = false;
        msg.value = "";
        newTag.value = "";
    }
}
watch (() => showAddWindow.value, (newValue) => {
    if (newValue) {
        document.addEventListener('click', handleClickOutside);
    }else{
        document.removeEventListener('click', handleClickOutside);
    }
});
</script>
<template>
    <div class="tag-select-container">
        <div class="bt">
            <TagsDisplay :tags="tags" @delete="tag => tags = tags.filter(t => t !== tag)" :showDelete="true" />
        </div>
        <div class="wrapper">
            <button ref="plusBtnRef" @click="showAddWindow=true" :hidden="showAddWindow" type="button" class="wux-btn wux-btn-round mc icon-btn2 simple"><IconPlus :width="16" :height="16" /></button>
            <slot />
            <div ref="addWindowRef" :hidden="!showAddWindow" class="pre-like add-window">
                <input v-model="newTag" class="wux-form-input wux-form-input-md add-input" type="text" placeholder="输入标签,最多16字" @keyup.enter="addTag(newTag)">
                <button @click="addTag(newTag)" type="button" class="wux-btn wux-btn-primary simple mc add-btn"><IconCheck :width="20" :height="20" /></button>
                <TagsDisplay tag-class="music-tag" @click="addTag" :tags="choices" :showDelete="false"/>
                <span class="result">{{ msg }}</span>
            </div>
        </div>
    </div>
</template>
<style scoped>
.tag-select-container {
    display: inline-block;
}
.add-window {
    position: absolute;
    width: 220px;
    max-height: 160px;
    background: white;
    border: 2px solid #ccc;
    border-radius: 12px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
    z-index: 1000;
}
@media (prefers-color-scheme: dark) {
    .add-window {
        background: #242424;
        border-color: #555;
    }
}
body[dark-mode] .add-window {
    background: #242424;
    border-color: #555;
}
.add-input {
    width: calc(100% - 50px);
    display: inline-block;
}
.add-btn {
    display: inline-block;
    vertical-align: top;
    padding: 7px 10px;
}
.wrapper {
    position: relative;
    display: inline-block;
}
</style>