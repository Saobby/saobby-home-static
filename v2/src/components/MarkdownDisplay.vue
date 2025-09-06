<script setup lang="js">
import { parseMd } from '@/assets/js/initMarked.js';
import { computed, ref } from 'vue';
import { IconMarkdown } from '@tabler/icons-vue';
const props = defineProps({
    show: {type: Boolean, default: true},
    showBtn: {type: Boolean, default: true},
    md: {type: String },
    btnClass: {type: String, default: ''},
    divClass: {type: String, default: ''}
})
const showMd = ref(false);
const html = computed(() => {
    if (!props.md) return '';
    return parseMd(props.md);
});
</script>
<template>
    <div :hidden="!show">
        <div :class="'pre-like-code '+divClass" :hidden="!showMd" class="margin">{{ md }}</div>
        <div :class="divClass" :hidden="showMd" v-html="html"  class="margin"></div>
        <slot />
        <button @click="showMd=true" v-if="!showMd" :hidden="!showBtn" :class="'wux-btn wux-btn-primary wux-btn-outline mc simple '+btnClass" type="button">
            <IconMarkdown width="16px" height="16px" />
            查看M↓
        </button>
        <button @click="showMd=false" v-if="showMd" :hidden="!showBtn" :class="'wux-btn wux-btn-primary mc simple '+btnClass" type="button">
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