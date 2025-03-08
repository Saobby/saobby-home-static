domain = "http://127.0.0.1:7799";
access_token = get_url_args().access_token;
tab = "overview"


async function load_logs(page_index) {
    function set_btn_status(status){
        gebi("log-time-range-select").disabled = status;
        gebi("refresh-log-btn").disabled = status;
        const cp_btns = gebcn("log-cp-btn");
        for (let i = 0; i < cp_btns.length; i++){
            cp_btns[i].disabled = status;
        }
        if (status){
            set_btn_html(gebi("refresh-log-btn"), "...");
        }
        else{
            set_btn_html(gebi("refresh-log-btn"));
        }
    }
    const payload = {
        period: document.getElementById("log-time-range-select").value, 
        access_token: access_token,
        page_index: page_index,
        page_size: 64
    }
    set_btn_status(true);
    const rsp = await fetch_api(domain+"/api/get_log", payload);
    set_btn_status(false);
    if (rsp.retcode){
        gebi("log-result").innerHTML = rsp.msg;
        return;
    }
    let logs_html = "";
    for (let i = 0; i < rsp.data.logs.length; i++){
        const log = rsp.data.logs[i];
        logs_html += `<tr>
            <td>${ts2str(log.timestamp)}</td>
            <td>${log.ip}</td>
            <td>${log.browser}</td>
            <td>${log.device}</td>
            <td>${log.os}</td>
            <td>${log.country}</td>
            <td>${log.province}</td>
            <td>${log.city}</td>
            <td>${log.isp}</td>
            <td>${log.is_mobile_ip ? "是" : "否"}</td>
            <td>${log.is_proxy_ip ? "是" : "否"}</td>
            <td>${log.is_hosting_ip ? "是" : "否"}</td>
            <td>${log.referer}</td>
        </tr>`;
    }
    gebi("log-table-body").innerHTML = logs_html;
    gen_cp_buttons(page_index+1, rsp.data.page_amount, 8, (n)=>{load_logs(n-1).then();}, gebi("change-page-div"), "wux-btn log-cp-btn", "wux-btn wux-btn-outline log-cp-btn");
}

function update_auto_refresh_log(checked){
    if (checked){
        auto_refresh_interval = setInterval(() => {
            if (document.visibilityState === "visible" && tab === "log"){
                load_logs(0).then();
            }
        }, 5000);
    }
    else{
        clearInterval(auto_refresh_interval);
        auto_refresh_interval = null;
    }
}

async function load_settings() {
    function set_btn_status(status){
        gebi("save-settings-btn").disabled = status;
        gebi("image-type-select").disabled = status;
        gebi("display-setting-select").disabled = status;
        gebi("font-size").disabled = status;
        gebi("font-color").disabled = status;
        gebi("background-color").disabled = status;
    }
    set_btn_status(true);
    const rsp = await fetch_api(domain+"/api/get_counter_settings", {access_token: access_token});
    set_btn_status(false);
    if (rsp.retcode){
        gebi("save-settings-result").innerHTML = "无法加载设置:"+rsp.msg;
        return;
    }
    gebi("markdown-code").innerHTML = `![](${domain}/w/${rsp.data.settings.counter_id})`;
    gebi("html-code").innerHTML = `<img src="${domain}/w/${rsp.data.settings.counter_id}">`;
    gebi("access-token").innerHTML = rsp.data.settings.access_token;
    gebi("image-type-select").selectedIndex = rsp.data.settings.pic_type;
    gebi("display-setting-select").selectedIndex = rsp.data.settings.display_type;
    gebi("font-size").value = rsp.data.settings.font_size;
    gebi("font-color").value = rsp.data.settings.text_color;
    gebi("background-color").value = rsp.data.settings.background_color;
}

async function save_settings(){
    function set_btn_status(status){
        gebi("save-settings-btn").disabled = status;
        gebi("image-type-select").disabled = status;
        gebi("display-setting-select").disabled = status;
        gebi("font-size").disabled = status;
        gebi("font-color").disabled = status;
        gebi("background-color").disabled = status;
        if (status){
            set_btn_html(gebi("save-settings-btn"), "...");
        }
        else{
            set_btn_html(gebi("save-settings-btn"));
        }
    }
    const payload = {
        access_token: access_token,
        pic_type: gebi("image-type-select").selectedIndex,
        display_type: gebi("display-setting-select").selectedIndex,
        font_size: gebi("font-size").value,
        text_color: gebi("font-color").value,
        background_color: gebi("background-color").value
    }
    set_btn_status(true);
    const rsp = await fetch_api(domain+"/api/update_counter_settings", payload);
    set_btn_status(false);
    if (rsp.retcode){
        gebi("save-settings-result").innerHTML = "无法保存设置:"+rsp.msg;
        return;
    }
    gebi("save-settings-result").innerHTML = "设置已保存";
}

async function load_overview_page(){
    get_overall_data().then();
    render_trend_chart().then();
    render_visit_time_chart().then();
    render_browser_stat_chart().then();
    render_device_stat_chart().then();
    render_os_stat_chart().then();
}

async function render_trend_chart() {
    const payload = {
        access_token: access_token,
        period: gebi("time-range-select").value
    }
    const rsp = await fetch_api(domain + "/api/get_trend_data", payload);
    if (rsp.retcode) {
        gebi("visits-trend-result").innerHTML = "加载失败:" + rsp.msg;
        return;
    }

    const chart_dom = gebi("overall-visits-trend");
    const chart = echarts.init(chart_dom);
    const option = {
        tooltip: {
            trigger: "axis",
            axisPointer: { type: "shadow" }
        },
        legend: {
            data: ["访问量", "独立IP数"],
            top: "0%"
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
            data: rsp.data.trend.dates,
            axisLabel: { rotate: 45 }
        },
        yAxis: [
            {
                type: "value",
                name: "访问量",
                position: "left",
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#5064e1"
                    }
                },
                axisLabel: {
                    color: "#5064e1"
                }
            },
            {
                type: "value",
                name: "独立IP数",
                position: "right",
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#ff5541"
                    }
                },
                axisLabel: {
                    color: "#ff5541"
                }
            }
        ],
        series: [
            {
                name: "访问量",
                type: "line",
                data: rsp.data.trend.visits,
                smooth: true,
                itemStyle: { color: "#5064e1" },
                yAxisIndex: 0
            },
            {
                name: "独立IP数",
                type: "line",
                data: rsp.data.trend.ips,
                smooth: true,
                itemStyle: { color: "#ff5541" },
                yAxisIndex: 1
            }
        ]
    };
    chart.setOption(option);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_visit_time_chart() {
    const payload = {
        access_token: access_token, 
        period: gebi("time-range-select").value, 
        type: 0
    }
    const rsp = await fetch_api(domain + "/api/get_top", payload);
    if (rsp.retcode) {
        gebi("visits-time-result").innerHTML = "加载失败:" + rsp.msg;
        return;
    }

    const chart_dom = gebi("overall-visit-time");
    const chart = echarts.init(chart_dom);
    const option = {
        tooltip: {
            trigger: "axis",
            axisPointer: {
                type: "shadow"
            }
        },
        legend: {
            data: ["访问量", "独立IP数"],
            top: "0%"
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
            data: Array.from({length: 24}, (_, i) => `${i}时`),
            axisLabel: {
                interval: 0
            }
        },
        yAxis: [
            {
                type: "value",
                name: "访问量",
                position: "left",
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#5064e1"
                    }
                },
                axisLabel: {
                    color: "#5064e1"
                }
            },
            {
                type: "value",
                name: "独立IP数",
                position: "right",
                axisLine: {
                    show: true,
                    lineStyle: {
                        color: "#ff5541"
                    }
                },
                axisLabel: {
                    color: "#ff5541"
                }
            }
        ],
        series: [
            {
                name: "访问量",
                type: "bar",
                data: rsp.data.visits,
                itemStyle: {
                    color: "#5064e1"
                },
                barGap: "0%",
                barWidth: "30%",
                yAxisIndex: 0
            },
            {
                name: "独立IP数",
                type: "bar",
                data: rsp.data.ips,
                itemStyle: {
                    color: "#ff5541"
                },
                barWidth: "30%",
                yAxisIndex: 1
            }
        ]
    };
    
    chart.setOption(option);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_browser_stat_chart() {
    const payload = {
        access_token: access_token,
        period: gebi("time-range-select").value,
        type: 1  // 浏览器统计
    }
    const rsp = await fetch_api(domain + "/api/get_top", payload);
    if (rsp.retcode) {
        gebi("browser-stat-result").innerHTML = "加载失败:" + rsp.msg;
        return;
    }

    const chart_dom = gebi("overall-browser-stat");
    const chart = echarts.init(chart_dom);
    
    // 获取所有有效的浏览器（IP数大于0或访问次数大于0）
    const valid_browsers = new Set([
        ...Object.entries(rsp.data.ips)
            .filter(([_, value]) => value > 0)
            .map(([name]) => name),
        ...Object.entries(rsp.data.visits)
            .filter(([_, value]) => value > 0)
            .map(([name]) => name)
    ]);

    // 计算总访问次数和总IP数
    const total_visits = Object.values(rsp.data.visits).reduce((sum, count) => sum + count, 0);
    const total_ips = Object.values(rsp.data.ips).reduce((sum, count) => sum + count, 0);

    // 准备两组数据
    const ip_data = Array.from(valid_browsers).map(browser => ({
        name: browser,
        value: rsp.data.ips[browser] || 0
    }));

    const visit_data = Array.from(valid_browsers).map(browser => ({
        name: browser,
        value: rsp.data.visits[browser] || 0
    }));

    const option = {
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const browser = params.name;
                const ips = rsp.data.ips[browser] || 0;
                const visits = rsp.data.visits[browser] || 0;
                const ip_percent = ((ips / total_ips) * 100).toFixed(2);
                const visit_percent = ((visits / total_visits) * 100).toFixed(2);
                return `${browser}<br/>` + 
                       `独立IP数: ${ips} (${ip_percent}%)<br/>` +
                       `访问次数: ${visits} (${visit_percent}%)`;
            }
        },
        legend: {
            orient: "horizontal",
            top: "top",
            left: "center"
        },
        series: [
            {
                name: "独立IP数",
                type: "pie",
                radius: ["45%", "70%"],
                center: ["50%", "60%"],
                label: {
                    position: "outside",
                    formatter: "{b}\nIP: {c}"
                },
                data: ip_data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                }
            },
            {
                name: "访问次数",
                type: "pie",
                radius: "45%",
                center: ["50%", "60%"],
                label: {
                    position: "inside",
                    formatter: "访问: {c}"
                },
                data: visit_data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                }
            }
        ]
    };
    
    chart.setOption(option);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_device_stat_chart() {
    const payload = {
        access_token: access_token,
        period: gebi("time-range-select").value,
        type: 2  // 设备统计
    }
    const rsp = await fetch_api(domain + "/api/get_top", payload);
    if (rsp.retcode) {
        gebi("device-stat-result").innerHTML = "加载失败:" + rsp.msg;
        return;
    }

    const chart_dom = gebi("overall-device-stat");
    const chart = echarts.init(chart_dom);
    
    // 获取所有有效的设备（IP数大于0或访问次数大于0）
    const valid_devices = new Set([
        ...Object.entries(rsp.data.ips)
            .filter(([_, value]) => value > 0)
            .map(([name]) => name),
        ...Object.entries(rsp.data.visits)
            .filter(([_, value]) => value > 0)
            .map(([name]) => name)
    ]);

    // 计算总访问次数和总IP数
    const total_visits = Object.values(rsp.data.visits).reduce((sum, count) => sum + count, 0);
    const total_ips = Object.values(rsp.data.ips).reduce((sum, count) => sum + count, 0);

    // 准备两组数据
    const ip_data = Array.from(valid_devices).map(device => ({
        name: device,
        value: rsp.data.ips[device] || 0
    }));

    const visit_data = Array.from(valid_devices).map(device => ({
        name: device,
        value: rsp.data.visits[device] || 0
    }));

    const option = {
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const device = params.name;
                const ips = rsp.data.ips[device] || 0;
                const visits = rsp.data.visits[device] || 0;
                const ip_percent = ((ips / total_ips) * 100).toFixed(2);
                const visit_percent = ((visits / total_visits) * 100).toFixed(2);
                return `${device}<br/>` + 
                       `独立IP数: ${ips} (${ip_percent}%)<br/>` +
                       `访问次数: ${visits} (${visit_percent}%)`;
            }
        },
        legend: {
            orient: "horizontal",
            top: "top",
            left: "center"
        },
        series: [
            {
                name: "独立IP数",
                type: "pie",
                radius: ["45%", "70%"],  // 外圈环形
                center: ["50%", "60%"],
                label: {
                    position: "outside",
                    formatter: "{b}\nIP: {c}"
                },
                data: ip_data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                }
            },
            {
                name: "访问次数",
                type: "pie",
                radius: "45%",  // 修改这里，使其与外圈的内半径相等
                center: ["50%", "60%"],
                label: {
                    position: "inside",
                    formatter: "访问: {c}"
                },
                data: visit_data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                }
            }
        ]
    };
    
    chart.setOption(option);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_os_stat_chart() {
    const payload = {
        access_token: access_token,
        period: gebi("time-range-select").value,
        type: 3  // 操作系统统计
    }
    const rsp = await fetch_api(domain + "/api/get_top", payload);
    if (rsp.retcode) {
        gebi("os-stat-result").innerHTML = "加载失败:" + rsp.msg;
        return;
    }

    const chart_dom = gebi("overall-os-stat");
    const chart = echarts.init(chart_dom);
    
    // 获取所有有效的操作系统（IP数大于0或访问次数大于0）
    const valid_os = new Set([
        ...Object.entries(rsp.data.ips)
            .filter(([_, value]) => value > 0)
            .map(([name]) => name),
        ...Object.entries(rsp.data.visits)
            .filter(([_, value]) => value > 0)
            .map(([name]) => name)
    ]);

    // 计算总访问次数和总IP数
    const total_visits = Object.values(rsp.data.visits).reduce((sum, count) => sum + count, 0);
    const total_ips = Object.values(rsp.data.ips).reduce((sum, count) => sum + count, 0);

    // 准备两组数据
    const ip_data = Array.from(valid_os).map(os => ({
        name: os,
        value: rsp.data.ips[os] || 0
    }));

    const visit_data = Array.from(valid_os).map(os => ({
        name: os,
        value: rsp.data.visits[os] || 0
    }));

    const option = {
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const os = params.name;
                const ips = rsp.data.ips[os] || 0;
                const visits = rsp.data.visits[os] || 0;
                const ip_percent = ((ips / total_ips) * 100).toFixed(2);
                const visit_percent = ((visits / total_visits) * 100).toFixed(2);
                return `${os}<br/>` + 
                       `独立IP数: ${ips} (${ip_percent}%)<br/>` +
                       `访问次数: ${visits} (${visit_percent}%)`;
            }
        },
        legend: {
            orient: "horizontal",
            top: "top",
            left: "center"
        },
        series: [
            {
                name: "独立IP数",
                type: "pie",
                radius: ["45%", "70%"],  // 外圈环形
                center: ["50%", "60%"],
                label: {
                    position: "outside",
                    formatter: "{b}\nIP: {c}"
                },
                data: ip_data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                }
            },
            {
                name: "访问次数",
                type: "pie",
                radius: "45%",  // 修改这里，使其与外圈的内半径相等
                center: ["50%", "60%"],
                label: {
                    position: "inside",
                    formatter: "访问: {c}"
                },
                data: visit_data,
                emphasis: {
                    itemStyle: {
                        shadowBlur: 10,
                        shadowOffsetX: 0,
                        shadowColor: "rgba(0, 0, 0, 0.5)"
                    }
                }
            }
        ]
    };
    
    chart.setOption(option);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function get_overall_data() {
    const rsp = await fetch_api(domain+"/api/get_overall_data", {access_token: access_token});
    if (rsp.retcode){
        gebi("overall-data-result").innerHTML = "无法获取数据:"+rsp.msg;
        return;
    }
    gebi("overall-total-visits").innerHTML = rsp.data.total_visits;
    gebi("overall-total-ips").innerHTML = rsp.data.total_ips;
    gebi("overall-today-visits").innerHTML = rsp.data.today_visits;
    gebi("overall-today-ips").innerHTML = rsp.data.today_ips;
    gebi("overall-yesterday-visits").innerHTML = rsp.data.yesterday_visits;
    gebi("overall-yesterday-ips").innerHTML = rsp.data.yesterday_ips;
}

async function init(){
    await load_script("/static/js/echarts.min.js");
    load_overview_page().then();
}

init().then();
