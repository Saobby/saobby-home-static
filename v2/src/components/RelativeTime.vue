<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue';
import { ts2str, relative_time } from '@/assets/js/util.js';

const props = defineProps({
    timestamp: {
        type: Number,
        required: true
    }
});

const now = ref(Date.now() / 1e3);
let timerId = null;

function tick() {
    now.value = Date.now() / 1e3;
    const elapsed = Math.max(0, now.value - props.timestamp);
    // 自适应刷新间隔：越久远刷新越慢
    let delay = 24 * 3600 * 1000;
    if (elapsed < 60) {
        delay = 1000;
    } else if (elapsed < 3600) {
        delay = 60 * 1000;
    } else if (elapsed < 86400) {
        delay = 3600 * 1000;
    }
    timerId = setTimeout(tick, delay);
}

onMounted(() => {
    tick();
});
onBeforeUnmount(() => {
    clearTimeout(timerId);
});

const text = computed(() => relative_time(props.timestamp, now.value));
</script>
<template>
    <span :title="ts2str(props.timestamp)">{{ text }}</span>
</template>
