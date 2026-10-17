// dashboard 用到的 ECharts 模块，由 echartsLoader.js 动态 import。
// 静态 import 才能让 Rollup tree-shake 掉未使用的模块。
import { init, registerMap, use } from "echarts/core";
import { BarChart, LineChart, MapChart, PieChart } from "echarts/charts";
import {
    GridComponent,
    LegendPlainComponent,
    TooltipComponent,
    VisualMapContinuousComponent
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

use([
    // 图表
    BarChart,
    LineChart,
    MapChart,
    PieChart,
    // 组件（MapChart 会自动注册 GeoComponent）
    GridComponent,
    LegendPlainComponent,
    TooltipComponent,
    VisualMapContinuousComponent,
    // 渲染器
    CanvasRenderer
]);

export { init, registerMap };
