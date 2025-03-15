let domain = "https://w.saobby.com";
let access_token = get_url_args().access_token;
let tab = "overview";

async function login() {
    function set_btn_status(status){
        gebi("login-btn").disabled = status;
        if (status){
            set_btn_html(gebi("login-btn"), "...");
        }
        else{
            set_btn_html(gebi("login-btn"));
        }
    }
    const access_token = gebi("access-token-input").value;
    if (!access_token){
        gebi("login-result").innerHTML = "请输入访问密钥";
        return;
    }
    const payload = {
        access_token: access_token
    }
    set_btn_status(true);
    const rsp = await fetch_api(domain + "/api/verify_access_token", payload);
    set_btn_status(false);
    if (rsp.retcode){
        gebi("login-result").innerHTML = rsp.msg;
        return;
    }
    window.location.href = "/webcounter_dashboard?access_token=" + access_token;
}

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
            <td>${log.browser?log.browser:"解析中"}</td>
            <td>${log.device?log.device:"解析中"}</td>
            <td>${log.os?log.os:"解析中"}</td>
            <td>${log.country?log.country:"解析中"}</td>
            <td>${log.province?log.province:"解析中"}</td>
            <td>${log.city?log.city:"解析中"}</td>
            <td>${log.isp?log.isp:"解析中"}</td>
            <td>${log.is_mobile_ip===null?"解析中":(log.is_mobile_ip?"是":"否")}</td>
            <td>${log.is_proxy_ip===null?"解析中":(log.is_proxy_ip?"是":"否")}</td>
            <td>${log.is_hosting_ip===null?"解析中":(log.is_hosting_ip?"是":"否")}</td>
            <td>${log.referer?log.referer:"无"}</td>
        </tr>`;
    }
    gebi("log-table-body").innerHTML = logs_html;
    gen_cp_buttons(page_index+1, rsp.data.page_amount, 6, (n)=>{load_logs(n-1).then();}, gebi("change-page-div"), "wux-btn log-cp-btn", "wux-btn wux-btn-outline log-cp-btn");
    gebi("log-page-index").innerHTML = page_index+1;
    gebi("log-page-amount").innerHTML = rsp.data.page_amount;
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
        gebi("description").disabled = status;
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
    gebi("description").value = rsp.data.settings.desc;
}

async function save_settings(){
    function set_btn_status(status){
        gebi("save-settings-btn").disabled = status;
        gebi("image-type-select").disabled = status;
        gebi("display-setting-select").disabled = status;
        gebi("font-size").disabled = status;
        gebi("font-color").disabled = status;
        gebi("background-color").disabled = status;
        gebi("description").disabled = status;
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
        background_color: gebi("background-color").value, 
        desc: gebi("description").value
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
    render_ip_location_chart().then();
}

async function render_trend_chart() {
    function set_chart_status(status){
        gebi("overall-visits-trend-holder").hidden = status;
        gebi("overall-visits-trend-loading").hidden = !status;
    }
    set_chart_status(true);
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
    set_chart_status(false);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_visit_time_chart() {
    function set_chart_status(status){
        gebi("overall-visit-time-holder").hidden = status;
        gebi("overall-visit-time-loading").hidden = !status;
    }
    set_chart_status(true);
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
    set_chart_status(false);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_browser_stat_chart() {
    function set_chart_status(status){
        gebi("overall-browser-stat").hidden = status;
        gebi("overall-browser-stat-loading").hidden = !status;
    }
    set_chart_status(true);
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
    set_chart_status(false);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_device_stat_chart() {
    function set_chart_status(status){
        gebi("overall-device-stat").hidden = status;
        gebi("overall-device-stat-loading").hidden = !status;
    }
    set_chart_status(true);
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
    set_chart_status(false);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function render_os_stat_chart() {
    function set_chart_status(status){
        gebi("overall-os-stat").hidden = status;
        gebi("overall-os-stat-loading").hidden = !status;
    }
    set_chart_status(true);
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
    set_chart_status(false);
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

async function render_ip_location_chart() {
    function set_chart_status(status) {
        gebi("overall-ip-location-holder").hidden = status;
        gebi("overall-ip-location-loading").hidden = !status;
    }
    
    set_chart_status(true);
    const payload = {
        access_token: access_token,
        period: gebi("time-range-select").value
    }
    const rsp = await fetch_api(domain + "/api/get_heatmap_data", payload);
    if (rsp.retcode) {
        gebi("ip-location-result").innerHTML = "加载失败:" + rsp.msg;
        return;
    }
    if (JSON.stringify(rsp.data.visits) === "{}"){
        gebi("ip-location-result").innerHTML = "暂无数据";
        return;
    }

    const country_code_map = {"SO":"索马里","LI":"列支敦士登","MA":"摩洛哥","EH":"西撒哈拉","RS":"塞尔维亚","AF":"阿富汗","AO":"安哥拉","AL":"阿尔巴尼亚","AX":"奥兰群岛","AD":"安道尔","AE":"阿联酋","AR":"阿根廷","AM":"亚美尼亚","AS":"美属萨摩亚","TF":"法属南部领地","AG":"安提瓜和巴布达","AU":"澳大利亚","AT":"奥地利","AZ":"阿塞拜疆","BI":"布隆迪","BE":"比利时","BJ":"贝宁","BF":"布基纳法索","BD":"孟加拉国","BG":"保加利亚","BH":"巴林","BS":"巴哈马","BA":"波黑","BY":"白俄罗斯","BZ":"伯利兹","BM":"百慕大","BO":"玻利维亚","BR":"巴西","BB":"巴巴多斯","BN":"文莱","BT":"不丹","BW":"博茨瓦纳","CF":"中非共和国","CA":"加拿大","CH":"瑞士","CL":"智利","CN":"中国","CI":"科特迪瓦","CM":"喀麦隆","CD":"刚果（金）","CG":"刚果（布）","CO":"哥伦比亚","KM":"科摩罗","CV":"佛得角","CR":"哥斯达黎加","CU":"古巴","CW":"库拉索","KY":"开曼群岛","CT":"北塞浦路斯","CY":"塞浦路斯","CZ":"捷克","DE":"德国","DJ":"吉布提","DM":"多米尼克","DK":"丹麦","DO":"多米尼加","DZ":"阿尔及利亚","EC":"厄瓜多尔","EG":"埃及","ER":"厄立特里亚","ES":"西班牙","EE":"爱沙尼亚","ET":"埃塞俄比亚","FI":"芬兰","FJ":"斐济","FK":"马尔维纳斯群岛（福克兰）","FR":"法国","FO":"法罗群岛","FM":"密克罗尼西亚","GA":"加蓬","GB":"英国","GE":"格鲁吉亚","GH":"加纳","GN":"几内亚","GM":"冈比亚","GW":"几内亚比绍","GQ":"赤道几内亚","GR":"希腊","GD":"格林纳达","GL":"格陵兰","GT":"危地马拉","GU":"关岛","GY":"圭亚那","HM":"赫德岛和麦克唐纳群岛","HN":"洪都拉斯","HR":"克罗地亚","HT":"海地","HU":"匈牙利","ID":"印度尼西亚","IM":"马恩岛","IN":"印度","IO":"英属印度洋领地","IE":"爱尔兰","IR":"伊朗","IQ":"伊拉克","IS":"冰岛","IL":"以色列","IT":"意大利","JM":"牙买加","JE":"泽西岛","JO":"约旦","JP":"日本","":"锡亚琴冰川","KZ":"哈萨克斯坦","KE":"肯尼亚","KG":"吉尔吉斯斯坦","KH":"柬埔寨","KI":"基里巴斯","KR":"韩国","KW":"科威特","LA":"老挝","LB":"黎巴嫩","LR":"利比里亚","LY":"利比亚","LC":"圣卢西亚","LK":"斯里兰卡","LS":"莱索托","LT":"立陶宛","LU":"卢森堡","LV":"拉脱维亚","MD":"摩尔多瓦","MG":"马达加斯加","MX":"墨西哥","MK":"北马其顿","ML":"马里","MT":"马耳他","MM":"缅甸","ME":"黑山","MN":"蒙古","MP":"北马里亚纳群岛","MZ":"莫桑比克","MR":"毛里塔尼亚","MS":"蒙特塞拉特","MU":"毛里求斯","MW":"马拉维","MY":"马来西亚","NA":"纳米比亚","NC":"新喀里多尼亚","NE":"尼日尔","NG":"尼日利亚","NI":"尼加拉瓜","NU":"纽埃","NL":"荷兰","NO":"挪威","NP":"尼泊尔","NZ":"新西兰","OM":"阿曼","PK":"巴基斯坦","PA":"巴拿马","PE":"秘鲁","PH":"菲律宾","PW":"帕劳","PG":"巴布亚新几内亚","PL":"波兰","PR":"波多黎各","KP":"朝鲜","PT":"葡萄牙","PY":"巴拉圭","PS":"巴勒斯坦","PF":"法属波利尼西亚","QA":"卡塔尔","RO":"罗马尼亚","RU":"俄罗斯","RW":"卢旺达","SA":"沙特阿拉伯","SD":"苏丹","SS":"南苏丹","SN":"塞内加尔","SG":"新加坡","GS":"南乔治亚和南桑威奇群岛","SH":"圣赫勒拿","SB":"所罗门群岛","SL":"塞拉利昂","SV":"萨尔瓦多","PM":"圣皮埃尔和密克隆群岛","ST":"圣多美和普林西比","SR":"苏里南","SK":"斯洛伐克","SI":"斯洛文尼亚","SE":"瑞典","SZ":"斯威士兰","SC":"塞舌尔","SY":"叙利亚","TC":"特克斯和凯科斯群岛","TD":"乍得","TG":"多哥","TH":"泰国","TJ":"塔吉克斯坦","TM":"土库曼斯坦","TL":"东帝汶","TO":"汤加","TT":"特立尼达和多巴哥","TN":"突尼斯","TR":"土耳其","TZ":"坦桑尼亚","UG":"乌干达","UA":"乌克兰","UY":"乌拉圭","US":"美国","UZ":"乌兹别克斯坦","VC":"圣文森特和格林纳丁斯","VE":"委内瑞拉","VI":"美属维尔京群岛","VN":"越南","VU":"瓦努阿图","WS":"萨摩亚","YE":"也门","ZA":"南非","ZM":"赞比亚","ZW":"津巴布韦","AI": "英国","AQ":"","AW":"荷兰","BQ":"荷兰","BV":"挪威","CX":"澳大利亚","CC":"澳大利亚","CK":"新西兰","GF":"法国","GI":"英国","GP":"法国","GG":"英国","VA":"","HK":"中国","MO":"中国","MV":"","MH":"","MQ":"法国","YT":"法国","MC":"","NR":"","NF":"澳大利亚","PN":"英国","RE":"法国","BL":"法国","KN":"","MF":"法国","SM":"","SX":"荷兰","SJ":"挪威","TW":"中国","TK":"新西兰","TV":"","UM":"美国","VG":"英国","WF":"法国"};
    let countries_visits = {};
    let countries_ips = {};

    for (let country_code in country_code_map){
        const country_name = country_code_map[country_code];
        if (countries_visits[country_name] === undefined){
            countries_visits[country_name] = 0;
            countries_ips[country_name] = 0;
        }
    }

    for (let country_code in rsp.data.visits){
        const country_name = country_code_map[country_code];
        countries_visits[country_name] += rsp.data.visits[country_code];
    }
    for (let country_code in rsp.data.ips){
        const country_name = country_code_map[country_code];
        countries_ips[country_name] += rsp.data.ips[country_code];
    }

    const max_visits = Math.max(...Object.values(countries_visits));

    const chart_dom = gebi("overall-ip-location");
    const chart = echarts.init(chart_dom);

    let visits_data = [];
    for (let country_name in countries_visits){
        visits_data.push({
            name: country_name,
            value: countries_visits[country_name]
        });
    }
    let ips_data = [];
    for (let country_name in countries_ips){
        ips_data.push({
            name: country_name,
            value: countries_ips[country_name]
        });
    }

    const option = {
        backgroundColor: "#ffffff",
        tooltip: {
            trigger: "item",
            formatter: (params) => {
                const country_name = params.name;
                const visits = countries_visits[country_name];
                const ips = countries_ips[country_name];
                return `${country_name}<br/>访问量: ${visits}<br/>独立IP数: ${ips}`;
            }
        },
        visualMap: [
            {
                type: "continuous",
                min: 0,
                max: max_visits,
                text: ["访问量"],
                calculable: true,
                inRange: {
                    color: ["#e0f3f8", "#5064e1"]
                },
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
                emphasis: {
                    label: {
                        show: true
                    }
                },
                data: visits_data,
                tooltip: {
                    formatter: (params) => {
                        const country_name = params.name;
                        const visits = countries_visits[country_name];
                        const ips = countries_ips[country_name];
                        return `${country_name}<br/>访问量: ${visits}<br/>独立IP数: ${ips}`;
                    }
                }
            }
        ]
    };

    chart.setOption(option);
    set_chart_status(false);
    const resize_observer = new ResizeObserver(() => {
        chart.resize();
    });
    resize_observer.observe(chart_dom);
}

async function init(){
    if (access_token){
        gebi("login").hidden = true;
        gebi("dashboard").hidden = false;
        const [echarts_js, world_json] = await Promise.all([
            fetch("/static/js/echarts.min.js").then(response => response.text()),
            fetch("/static/js/world_cn.json").then(response => response.json())
        ]);
        eval(echarts_js);
        echarts.registerMap("world", world_json);
        load_overview_page().then();
    }else{
        gebi("login").hidden = false;
        gebi("dashboard").hidden = true;
    }
}

init().then();
