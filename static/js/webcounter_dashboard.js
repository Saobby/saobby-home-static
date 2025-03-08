domain = "http://127.0.0.1:7799";
access_token = get_url_args().access_token;


async function load_logs(page_index) {
    function set_btn_status(status){
        gebi("log-time-range-select").disabled = status;
        gebi("refresh-log-btn").disabled = status;
        const cp_btns = gebcn("log-cp-btn");
        for (let i = 0; i < cp_btns.length; i++){
            cp_btns[i].disabled = status;
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
            if (document.visibilityState === "visible"){
                load_logs(0).then();
            }
        }, 5000);
    }
    else{
        clearInterval(auto_refresh_interval);
        auto_refresh_interval = null;
    }
}
