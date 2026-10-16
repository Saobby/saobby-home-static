<script setup lang="js">
import CopyButton from "@/components/CopyButton.vue";

defineProps({
    value: {type: String, default: ""},
    placeholder: {type: String, default: ""},
    inputClass: {type: String, default: "wux-form-input wux-form-input-md"},
    inputStyle: {type: String, default: "width: calc( 100% - 80px );display: inline-block;"},
});

</script>

<template>
    <input type="text" :value="value" :style="inputStyle" :class="inputClass" :placeholder="placeholder || undefined" readonly>
    <CopyButton :value="value" class="wux-btn mc simple"/>
</template>

<style scoped>

</style>