var domain = "https://comments.saobby.com"

function set_notification_btn_status(status){
        var inputs = gebcn("notification-form");
        for (var i=0; i<inputs.length; i++){
            inputs[i].disabled = status;
        }
        gebi("save-notification-config-btn").disabled = status;
    }

async function save_notification_config(){
    set_notification_btn_status(true);
    var inputs = gebcn("notification-form");
    var user_config = {};
    for (var i=0; i<inputs.length; i++){
        var input = inputs[i];
        user_config[input.getAttribute("field")] = input.checked;
    }
    var rsp = await fetch_api(domain+"/api/set_user_config", {"access_token": localStorage.getItem("access-token"), "user_config": user_config});
    gebi("notification-form-result").innerHTML = rsp.retcode?rsp.msg:"操作成功";
    set_notification_btn_status(false);
}

async function load_notification_config(){
    set_notification_btn_status(true);
    var rsp = await fetch_api(domain+"/api/get_user_config", {"access_token": localStorage.getItem("access-token")});
    if (rsp.retcode){
        gebi("notification-form-result").innerHTML = "无法加载用户配置,请刷新页面后重试。错误消息:"+rsp.msg;
    }else{
        var inputs = gebcn("notification-form");
        for (var i=0; i<inputs.length; i++){
            var input = inputs[i];
            input.checked = rsp.data[input.getAttribute("field")];
        }
        set_notification_btn_status(false);
    }
}

!function(){
    if (localStorage.getItem("access-token") === null){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
    }
    load_notification_config().then();
}();
