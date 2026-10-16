<script setup lang="js">
import { computed, nextTick, onBeforeUnmount, onMounted, ref, watch } from 'vue';
import { prepareEcharts } from '../echartsLoader.js';

const props = defineProps({
    option: { type: Object, default: null },
    loading: { type: Boolean, default: true },
    result: { type: String, default: "" },
    short: { type: Boolean, default: false }   // 并排的三张统计图用短容器（300px）
});

const chartRef = ref(null);
const error = ref("");

let chart = null;

const showChart = computed(() => !props.loading && !error.value && !!props.option);

function disposeChart(){
    if (chart){
        chart.dispose();
        chart = null;
    }
}

// ResizeObserver 是浏览器 API，core-js 补不了，所以用 window resize 跟随尺寸
function onWindowResize(){
    if (chart){
        chart.resize();
    }
}

async function renderChart(){
    await nextTick();
    if (!chartRef.value){
        return;
    }
    try{
        const echarts = await prepareEcharts();
        // 等库加载完的这段时间里，数据可能已经开始重新加载了
        if (props.loading || !chartRef.value){
            return;
        }
        if (!chart){
            chart = echarts.init(chartRef.value);
        }
        chart.setOption(props.option);
    }catch (err){
        error.value = err && err.message ? err.message : String(err);
    }
}

// 数据回来（此时容器已显示、尺寸正常）之后再 init，避免 0×0 的空图
watch([() => props.loading, () => props.option], ([loading, option]) => {
    if (loading || !option){
        disposeChart();
        return;
    }
    renderChart();
}, { immediate: true });

onMounted(() => window.addEventListener("resize", onWindowResize));
onBeforeUnmount(() => {
    window.removeEventListener("resize", onWindowResize);
    disposeChart();
});
</script>

<template>
    <!-- 与旧页面结构一致：只有需要横向滚动的大图才套 .chart-holder，并排的短图直接用容器 -->
    <div class="chart-holder" v-if="showChart && !short">
        <div ref="chartRef" class="chart-container"></div>
    </div>
    <div class="short-chart-container" v-else-if="showChart" ref="chartRef"></div>
    <div class="centered" v-else>
        <span class="wux-loading" v-if="loading"></span><br v-if="loading">
        <span v-if="loading">加载中</span><br v-if="loading">
        <span class="result">{{ result || error }}</span>
    </div>
</template>

<style scoped>
.chart-container{
    height: 400px;
    min-width: 720px;
}
.short-chart-container{
    height: 300px;
}
.chart-holder{
    overflow-x: auto;
}
</style>
