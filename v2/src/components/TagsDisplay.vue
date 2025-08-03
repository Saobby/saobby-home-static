<script setup lang="js">
const props = defineProps({
    tags: {
        type: Array,
        default: () => []
    },
    showDelete: {
        type: Boolean,
        default: false
    },
    tagClass: {
        type: String,
        default: ""
    },
    displayDefault: {
        type: String,
        default: ""
    }
});
const emits = defineEmits(["delete", "click"]);
function emitDelete(tag) {
    emits('delete', tag);
}
function emitClick(tag) {
    emits('click', tag);
}
</script>
<template>
    <div class="tags-container">
        <span class="gray" :hidden="!displayDefault" v-if="tags.length === 0">{{ displayDefault }}</span>
        <span @click="emitClick(tag)" v-for="tag in tags" :class="'wux-tag '+tagClass">{{ tag }}<span v-if="showDelete" @click="emitDelete(tag)" class="wux-tag-close">×</span></span>
    </div>
</template>
<style scoped>
.tags-container {
    display: flex;
    flex-wrap: wrap;
    gap: 2px;
    align-items: flex-start;
}
.tags-container .wux-tag {
    white-space: nowrap;
    word-break: keep-all;
    overflow-wrap: normal;
    padding: 1px 8px;
}
</style>