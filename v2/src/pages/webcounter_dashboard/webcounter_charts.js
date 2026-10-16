// 各图表的 ECharts option 构造（图表配置本身与原页面一致）
import { countryCodeMap } from "./country_code_map.js";

export function chartTextColor(){
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "#fcfcfc" : "#333333";
}

export function chartTooltipBgColor(){
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "#242424" : "#ffffff";
}

function visitAxis(){
    return {
        type: "value",
        name: "访问量",
        position: "left",
        axisLine: { show: true, lineStyle: { color: "#5064e1" } },
        axisLabel: { color: "#5064e1" }
    };
}

function ipAxis(){
    return {
        type: "value",
        name: "独立IP数",
        position: "right",
        axisLine: { show: true, lineStyle: { color: "#ff5541" } },
        axisLabel: { color: "#ff5541" }
    };
}

function pieEmphasis(){
    return { itemStyle: { shadowBlur: 10, shadowOffsetX: 0, shadowColor: "rgba(0, 0, 0, 0.5)" } };
}

// /api/get_trend_data —— 访问量趋势（折线图）
export function buildTrendOption(data){
    return {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            textStyle: { color: chartTextColor() },
            backgroundColor: chartTooltipBgColor()
        },
        legend: {
            data: ["访问量", "独立IP数"],
            top: "0%",
            textStyle: { color: chartTextColor() }
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "10%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: data.trend.dates,
            axisLabel: { rotate: 45 }
        },
        yAxis: [visitAxis(), ipAxis()],
        series: [
            {
                name: "访问量",
                type: "line",
                data: data.trend.visits,
                smooth: true,
                itemStyle: { color: "#5064e1" },
                yAxisIndex: 0
            },
            {
                name: "独立IP数",
                type: "line",
                data: data.trend.ips,
                smooth: true,
                itemStyle: { color: "#ff5541" },
                yAxisIndex: 1
            }
        ]
    };
}

// /api/get_top type=0 —— 访问时间段（24 小时柱状图）
export function buildVisitTimeOption(data){
    return {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" },
            textStyle: { color: chartTextColor() },
            backgroundColor: chartTooltipBgColor()
        },
        legend: {
            data: ["访问量", "独立IP数"],
            top: "0%",
            textStyle: { color: chartTextColor() }
        },
        grid: {
            left: "3%",
            right: "4%",
            bottom: "3%",
            top: "10%",
            containLabel: true
        },
        xAxis: {
            type: "category",
            data: Array.from({ length: 24 }, (_, i) => `${i}时`),
            axisLabel: { interval: 0 }
        },
        yAxis: [visitAxis(), ipAxis()],
        series: [
            {
                name: "访问量",
                type: "bar",
                data: data.visits,
                itemStyle: { color: "#5064e1" },
                barGap: "0%",
                barWidth: "30%",
                yAxisIndex: 0
            },
            {
                name: "独立IP数",
                type: "bar",
                data: data.ips,
                itemStyle: { color: "#ff5541" },
                barWidth: "30%",
                yAxisIndex: 1
            }
        ]
    };
}

// /api/get_top type=1/2/3 —— 浏览器 / 设备 / 操作系统统计（嵌套饼图，三者配置完全一致）
export function buildTopOption(data){
    const names = new Set([
        ...Object.entries(data.ips).filter(([, value]) => value > 0).map(([name]) => name),
        ...Object.entries(data.visits).filter(([, value]) => value > 0).map(([name]) => name)
    ]);
    const totalVisits = Object.values(data.visits).reduce((sum, count) => sum + count, 0);
    const totalIps = Object.values(data.ips).reduce((sum, count) => sum + count, 0);
    const ipData = Array.from(names).map((name) => ({ name, value: data.ips[name] || 0 }));
    const visitData = Array.from(names).map((name) => ({ name, value: data.visits[name] || 0 }));
    return {
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const name = params.name;
                const ips = data.ips[name] || 0;
                const visits = data.visits[name] || 0;
                const ipPercent = ((ips / totalIps) * 100).toFixed(2);
                const visitPercent = ((visits / totalVisits) * 100).toFixed(2);
                return `${name}<br/>` +
                    `独立IP数: ${ips} (${ipPercent}%)<br/>` +
                    `访问次数: ${visits} (${visitPercent}%)`;
            },
            textStyle: { color: chartTextColor() },
            backgroundColor: chartTooltipBgColor()
        },
        legend: {
            orient: "horizontal",
            top: "top",
            left: "center",
            textStyle: { color: chartTextColor() }
        },
        series: [
            {
                name: "独立IP数",
                type: "pie",
                radius: ["45%", "70%"],
                center: ["50%", "60%"],
                label: { position: "outside", formatter: "{b}\nIP: {c}" },
                data: ipData,
                emphasis: pieEmphasis()
            },
            {
                name: "访问次数",
                type: "pie",
                radius: "45%",
                center: ["50%", "60%"],
                label: { position: "inside", formatter: "访问: {c}" },
                data: visitData,
                emphasis: pieEmphasis()
            }
        ]
    };
}

function accumulateCountry(source, target){
    for (const countryCode in source){
        const countryName = countryCodeMap[countryCode];
        if (countryName === undefined){
            // 对照表里没有的代码直接跳过（否则会累加成 NaN）
            continue;
        }
        target[countryName] += source[countryCode];
    }
}

function heatmapTooltip(countryName, countriesVisits, countriesIps){
    return `${countryName}<br/>访问量: ${countriesVisits[countryName]}<br/>独立IP数: ${countriesIps[countryName]}`;
}

// /api/get_heatmap_data —— 用户地理位置（世界地图热力图）
export function buildHeatmapOption(data){
    const countriesVisits = {};
    const countriesIps = {};
    for (const countryName of Object.values(countryCodeMap)){
        if (countriesVisits[countryName] === undefined){
            countriesVisits[countryName] = 0;
            countriesIps[countryName] = 0;
        }
    }
    accumulateCountry(data.visits, countriesVisits);
    accumulateCountry(data.ips, countriesIps);

    const maxVisits = Math.max(...Object.values(countriesVisits));
    const visitsData = Object.keys(countriesVisits).map((countryName) => ({
        name: countryName,
        value: countriesVisits[countryName]
    }));

    return {
        tooltip: {
            trigger: "item",
            formatter: (params) => heatmapTooltip(params.name, countriesVisits, countriesIps),
            textStyle: { color: chartTextColor() },
            backgroundColor: chartTooltipBgColor()
        },
        visualMap: [
            {
                type: "continuous",
                min: 0,
                max: maxVisits,
                text: ["访问量"],
                calculable: true,
                textStyle: { color: chartTextColor() },
                inRange: { color: ["#e0f3f8", "#5064e1"] },
                left: "left",
                top: "bottom"
            }
        ],
        series: [
            {
                name: "访问量",
                type: "map",
                map: "world",
                roam: true,
                selectedMode: false,
                emphasis: { label: { show: true } },
                data: visitsData,
                tooltip: {
                    formatter: (params) => heatmapTooltip(params.name, countriesVisits, countriesIps)
                }
            }
        ]
    };
}
