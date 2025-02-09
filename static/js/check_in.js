function get_date() {
    const now = new Date();
    now.setMinutes(now.getMinutes() + now.getTimezoneOffset() + 480);
    return now.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit' });
}

function show_date(){
    gebi("date").innerHTML = get_date();
    gebi("loading-div").hidden = true;
    gebi("show-date-div").hidden = false;
    gebi("show-fortune-div").hidden = true;
}

function show_checked_in(fortune_data, combo){
    gebi("fortune").innerHTML = fortune_data.fortune;
    gebi("check-in-combo").innerHTML = combo;
    gebi("show-date-div").hidden = true;
    gebi("show-fortune-div").hidden = false;
    gebi("loading-div").hidden = true;
}

async function check_in(){
    if (check_logged_in()){
        return;
    }
    set_btn_html(gebi("check-in-btn"), "...");
    var rsp = await fetch_api(domain+"/api/check_in", {"access_token": localStorage["access-token"]});
    if (rsp.retcode){
        gebi("check-in-result").innerHTML = rsp.msg;
    }else{
        show_checked_in(rsp.data.fortune, rsp.data.combo);
    }
    set_btn_html(gebi("check-in-btn"));
}

async function get_check_in_status(){
    if (localStorage.getItem("access-token") === null){
        show_date();
        return;
    }
    var rsp = await fetch_api(domain+"/api/get_check_in_status", {"access_token": localStorage["access-token"]});
    if (rsp.retcode){
        gebi("check-in-loading-result").innerHTML = rsp.msg;
    }else{
        if (rsp.data.checked_in){
            show_checked_in(rsp.data.fortune, rsp.data.combo);
        }else{
            show_date();
        }
    }
}

get_check_in_status().then();
