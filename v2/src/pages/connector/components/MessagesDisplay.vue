<script setup>
import MarkdownDisplay from '@/components/MarkdownDisplay.vue';
const props = defineProps({
  messages: {
    type: Array,
    default: () => []
  }
});
</script>
<template>
    <div v-for="msg in messages" class="msg-div">
        <MarkdownDisplay :md="msg" btnClass="wux-btn-sm"></MarkdownDisplay>
    </div>
    <i v-if="messages.length === 0" class="gray">暂无消息</i>
    <hr v-if="messages.length === 0">
</template>
<style scoped>
.msg-div {
  border-bottom: 2px solid #ddd;
  padding:12px 0px;
}
</style>