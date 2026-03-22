<script setup lang="js">
import {IconCopy} from "@tabler/icons-vue";
import {ref} from "vue";

const props = defineProps({
    value: {type: String, default: ""},
    inputClass: {type: String, default: "wux-form-input wux-form-input-md"},
    inputStyle: {type: String, default: "width: calc( 100% - 80px );display: inline-block;"},
});

const disabled = ref(false);

function copy(){
    navigator.clipboard.writeText(props.value);
    disabled.value = true;
    setTimeout(()=>{disabled.value = false;}, 1000);
}

</script>

<template>
    <input type="text" :value="value" :style="inputStyle" :class="inputClass" readonly>
    <button type="button" class="wux-btn mc simple" @click="copy" :disabled="disabled"><IconCopy width="16px" height="16px"/>{{ disabled? "OK!": "复制" }}</button>
</template>

<style scoped>

</style>