<script setup>
import MarkdownDisplay from '@/components/MarkdownDisplay.vue';
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  },
  boxClass: {
    type: String,
    default: ''
  }
});
</script>
<template>
  <div :class="boxClass">
    <div v-for="msg in messages" class="msg-div">
      <MarkdownDisplay :md="msg" btnClass="wux-btn-sm"></MarkdownDisplay>
    </div>
    <i v-if="messages.length === 0" class="gray">暂无消息</i>
    <hr v-if="messages.length === 0">
  </div>
</template>
<style scoped>
.msg-div {
  border-bottom: 2px solid #ddd;
  padding:12px 0px;
}
@media (prefers-color-scheme: dark) {
  .msg-div {
    border-bottom-color: #444;
  }
}
body[dark-mode] .msg-div {
  border-bottom-color: #444;
}
</style>