var domain = "https://comments.saobby.com"

function load_bound_email(){
    fetch_data(domain+"/api/get_bound_email", "POST", headers, JSON.stringify({access_token: localStorage["access-token"]})).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            gebi("email-addr").innerHTML = rep.data.address?rsc(rep.data.address):"当前还未绑定邮箱";
        }else{
            gebi("email-addr").innerHTML = "无法加载已绑定邮箱:"+rep.message;
        }
    }, function(val){
        gebi("email-addr").innerHTML = "无法加载已绑定邮箱:"+val.message;
    });
}

async function send_email(){
    var addr = gebi("email-addr-input").value;
    if (!addr){
        gebi("send-email-result").innerHTML = "请输入邮箱地址";
        return
    }
    set_btn_html(gebi("send-email-btn"), "...");
    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        gebi("send-email-result").innerHTML = "人机验证失败:"+captcha_rsp.msg;
        set_btn_html(gebi("send-email-btn"));
        return;
    }
    const rsp = await fetch_api(domain+"/api/bind_email", {
        access_token: localStorage["access-token"],
        captcha_token: captcha_rsp.data.token,
        address: addr
    });
    if (rsp.retcode){
        gebi("send-email-result").innerHTML = rsp.msg;
        set_btn_html(gebi("send-email-btn"));
        return;
    }
    gebi("send-email-result").innerHTML = "已发送验证邮件，请查收";
    set_btn_html(gebi("send-email-btn"));
}

function unbind_email(){
    set_btn_html(gebi("unbind-email-btn"), "请稍候");
    fetch_data(domain + "/api/unbind_email", "POST", headers, JSON.stringify({access_token: localStorage["access-token"]})).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            gebi("unbind-email-result").innerHTML = "解绑成功!";
        }else{
            gebi("unbind-email-result").innerHTML = rep.message;
        }
        set_btn_html(gebi("unbind-email-btn"));
    }, function(val){
        gebi("unbind-email-result").innerHTML = val.message;
        set_btn_html(gebi("unbind-email-btn"));
    });
}

null == localStorage.getItem("access-token") && (localStorage.login_redirect = window.location.href,
window.location = "/login");
load_bound_email();