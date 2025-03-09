let domain = "https://w.saobby.com";

async function load_webcounters(page_index) {
    function set_btn_status(status){
        const cp_btns = gebcn("cp-btn");
        for (let i = 0; i < cp_btns.length; i++){
            cp_btns[i].disabled = status;
        }
        gebi("refresh-btn").disabled = status;
    }
    set_btn_status(true);
    const payload = {
        access_token: localStorage.getItem("access-token"), 
        page_index: page_index, 
        page_size: 8, 
        keyword: gebi("search-input").value
    };
    const rsp = await fetch_api(domain+"/api/get_users_counter", payload);
    set_btn_status(false);
    if (rsp.retcode){
        gebi("result").innerHTML = rsp.msg;
        return;
    }
    let html = "";
    for (let i = 0; i < rsp.data.counters.length; i++){
        const counter = rsp.data.counters[i];
        html += `<div class="bottom-line"><b style="font-size:20px;">${counter.desc?counter.desc:counter.counter_id}</b><br><span style="color:#777;">${icon_with_text("clock-grey", ts2str(counter.create_at))}</span> <span style="color:#777;">${icon_with_text("typeface-grey", "")}${["JPEG", "SVG"][counter.pic_type]}·${["访问量", "IP数", "不显示"][counter.display_type]}</span><br><a href="/webcounter_dashboard?access_token=${counter.access_token}" target="_blank"><button class="wux-btn wux-btn-primary wux-btn-sm">${icon_with_text("external-link-white", "进入控制面板")}</button></a></div>`;
    }
    gebi("webcounters").innerHTML = html;
    gen_cp_buttons(rsp.data.page_index+1, rsp.data.page_amount, 6, (n)=>{load_webcounters(n-1).then();}, gebi("change-page-div"), "wux-btn cp-btn", "wux-btn wux-btn-outline cp-btn");
    gebi("page-index").innerHTML = rsp.data.page_index+1;
    gebi("page-amount").innerHTML = rsp.data.page_amount;
}

if (!check_logged_in()){
    load_webcounters(0).then();
}
