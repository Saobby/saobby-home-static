<script setup lang="js">
import CopyButton from "@/components/CopyButton.vue";

defineProps({
    value: {type: String, default: ""},
    placeholder: {type: String, default: ""},
    rows: {type: [String, Number], default: ""},
    textareaClass: {type: String, default: "wux-form-input wux-form-input-md"},
    textareaStyle: {type: String, default: ""},
    label: {type: String, default: "复制"},
    btnClass: {type: String, default: "wux-btn wux-btn-primary"},
});

</script>

<template>
    <textarea :value="value" :rows="rows || undefined" :class="textareaClass" :style="textareaStyle || undefined" :placeholder="placeholder || undefined" readonly></textarea>
    <CopyButton :value="value" :label="label" :class="btnClass"/>
</template>

<style scoped>

</style>
