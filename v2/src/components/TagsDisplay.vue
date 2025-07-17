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
    <span @click="emitClick(tag)" v-for="tag in tags" :class="'wux-tag '+tagClass">{{ tag }}<span v-if="showDelete" @click="emitDelete(tag)" class="wux-tag-close">×</span></span>
</template>