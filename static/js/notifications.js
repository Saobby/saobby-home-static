var domain = "https://comments.saobby.com";
var selected = [];
var rs = 0;
var pi = 0;

function check(box, id){
    if (box.checked){
        selected.push(id);
    }else{
        selected.splice(selected.indexOf(id), 1);
    }
}

function deselect(){
    var checks = gebcn("notification-check");
    for (var index=0; index<checks.length; index++){
        var checkbox = checks[index];
        checkbox.checked = !checkbox.checked;
        check(checkbox, parseInt(checkbox.getAttribute("nid")));
    }
}

async function load_notifications(read_status, page_index){
    function set_buttons_status(status){
        gebi("refresh-btn").disabled = status;
        var cp_btn = gebcn("cp-btn");
        for (var a=0; a<cp_btn.length; a++){
            cp_btn[a].disabled = status;
        }
    }
    rs = read_status;
    pi = page_index;
    set_buttons_status(true);
    selected = [];
    var req_data = {"access_token": localStorage.getItem("access-token"),
        "page_size": 8, "page_index": page_index, "read_status": read_status};
    var ret = await fetch_data(domain+"/api/get_notification", "POST", headers, JSON.stringify(req_data)).catch((err) => {
        gebi("result").innerHTML = err.message;
        set_buttons_status(false);
    });
    if (!ret.response_text){
        return;
    }
    ret = JSON.parse(ret.response_text);
    if (ret.success){
        var html = "";
        for (var index in ret.data.notifications){
            var noti = ret.data.notifications[index];
            html += `<input onchange="check(this, ${noti.id});" type="checkbox" class="wux-form-checks notification-check" nid="${noti.id}"><span style="color:#777777">${icon_with_text("clock-grey", ts2str(noti.create_at))}</span><div style="${noti.is_read?"color:#888888;":""}">${marked.parse(noti.content)}</div><hr>`;
        }
        gebi("notifications-div").innerHTML = html;
        gen_cp_buttons(page_index+1, ret.data.page_amount, 7, (i)=>{load_notifications(read_status, i-1).then();}, gebi("cp-btn-div"), "wux-btn cp-btn", "wux-btn wux-btn-outline cp-btn");
    }else{
        gebi("result").innerHTML = ret.message;
    }
    set_buttons_status(false);
}

function refresh(){
    load_notifications(rs, pi).then();
}

async function ack_notifications(notifications){
    function set_buttons_status(status){
        gebi("deselect-btn").disabled = status;
        gebi("ack-btn").disabled = status;
        gebi("ack-all-btn").disabled = status;
        var checks = gebcn("notification-check");
        for (var a=0; a<checks.length; a++){
            checks[a].disabled = status;
        }
    }
    set_buttons_status(true);
    var req_data = {"access_token": localStorage.getItem("access-token"), "notifications": notifications};
    var ret = await fetch_data(domain+"/api/ack_notification", "POST", headers, JSON.stringify(req_data)).catch((err) => {
        gebi("result").innerHTML = err.message;
        set_buttons_status(false);
    });
    if (!ret.response_text){
        return;
    }
    ret = JSON.parse(ret.response_text);
    if (ret.success){
        gebi("result").innerHTML = "操作成功";
        if (rs === 0){
            refresh();
        }else{
            load_notifications(rs, 0);
        }
    }else{
        gebi("result").innerHTML = ret.message;
    }
    set_buttons_status(false);
}

!function(){
    if (localStorage.getItem("access-token") === null){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
    }
    load_notifications(0, 0).then();
}();

