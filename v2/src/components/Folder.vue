<script setup>
import {ref} from "vue";
import {IconCaretDownFilled, IconCaretUpFilled} from "@tabler/icons-vue";

const props = defineProps({
  initialStatus: {type: Boolean, default: false},
  unfoldText: {type: String, default: '展开隐藏的内容'},
  foldText: {type: String, default: '折叠隐藏的内容'},
  aStyle: {type: String, default: ''},
})
const status = ref(props.initialStatus);
</script>

<template>
  <a class="mc2" :style="aStyle" href="javascript:" @click="status=true;" :hidden="status"><IconCaretDownFilled width="16px" height="16px"/>{{ unfoldText }}</a>
  <a class="mc2" :style="aStyle" href="javascript:" @click="status=false;" :hidden="!status"><IconCaretUpFilled width="16px" height="16px"/>{{ foldText }}</a>
  <div :hidden="!status">
    <slot/>
  </div>
</template>

<style scoped>
</style>