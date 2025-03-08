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

function load_overview_page(){
    get_overall_data().then();
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

load_overview_page();
