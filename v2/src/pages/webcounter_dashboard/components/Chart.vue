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
const echartsLoading = ref(true);   // echarts 库是否仍在加载

let chart = null;

// chart | loading | error
const chartState = computed(() => {
    if (props.loading || (echartsLoading.value && props.option)){
        return "loading";
    }
    if (error.value || !props.option){
        return "error";
    }
    return "chart";
});

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
    try{
        const echarts = await prepareEcharts();
        // 容器显示后再 init（隐藏容器会得到 0×0）
        echartsLoading.value = false;
        await nextTick();
        // 等待期间数据可能已重新加载
        if (chartState.value !== "chart" || !chartRef.value){
            return;
        }
        if (!chart){
            chart = echarts.init(chartRef.value);
        }
        chart.setOption(props.option);
    }catch (err){
        echartsLoading.value = false;
        error.value = err && err.message ? err.message : String(err);
    }
}

// 数据就绪后渲染
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
    <!-- 大图套 .chart-holder 以支持横向滚动；短图直接使用容器 -->
    <div class="chart-holder" v-if="!short" :hidden="chartState !== 'chart'">
        <div ref="chartRef" class="chart-container"></div>
    </div>
    <!-- short 是静态结构分支 -->
    <div class="short-chart-container" v-else ref="chartRef" :hidden="chartState !== 'chart'"></div>
    <div class="centered" :hidden="chartState !== 'loading'">
        <span class="wux-loading"></span><br>
        <span>加载中</span>
    </div>
    <div class="centered" :hidden="chartState !== 'error'">
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
