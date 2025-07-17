<script setup lang='js'>
const props = defineProps({
  isLoading: { type: Boolean, default: false },
  btnClass: { type: String, default: '' }
});
const emit = defineEmits(['click']);

function emitClick(event) {
    emit('click', event);
}

</script>
<template>
    <button @click="emitClick" type="button" :class="'wux-btn '+btnClass" :disabled="isLoading">
        <slot v-if="!isLoading" />
        <span :hidden="!isLoading" class="wux-loading"></span>
    </button>
</template>