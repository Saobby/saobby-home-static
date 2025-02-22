var domain = "https://comments.saobby.com";
async function login() {
    if (gebi("username").value === "" || gebi("password").value === ""){
        gebi("result").innerHTML = "用户名和密码均不能为空!";
        return;
    }
    set_btn_html(gebi("login-btn"), "...");

    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        gebi("result").innerHTML = "人机验证失败:"+captcha_rsp.msg;
        set_btn_html(gebi("login-btn"));
        return;
    }

    const rsp = await fetch_api(domain+"/api/login", {
        username: gebi("username").value,
        password: gebi("password").value,
        captcha_token: captcha_rsp.data.token
    });
    if (rsp.retcode){
        gebi("result").innerHTML = rsp.msg;
        set_btn_html(gebi("login-btn"));
        return;
    }
    localStorage.setItem("access-token", rsp.data.access_token);
    if (!(localStorage.login_redirect)){
        window.location = "/";
    }else{
        window.location = localStorage.login_redirect;
        delete localStorage.login_redirect;
    }
}

// 已弃用
//function complete_captcha() {
//    gebi("login-btn").disabled = !0,
//    gebi("login-btn").innerHTML = "请稍候";
//    var e = gebi("username").value
//      , t = gebi("password").value
//      , n = gebi("captcha-token").value
//      , o = new XMLHttpRequest;
//    o.open("POST", domain + "/api/login", !0),
//    o.setRequestHeader("Content-Type", "application/json");
//    var a = {
//        username: e,
//        password: t,
//        captcha_token: n
//    };
//    o.send(JSON.stringify(a)),
//    o.onreadystatechange = function() {
//        if (4 === o.readyState) {
//            var e = JSON.parse(o.responseText);
//            e.success ? (localStorage.setItem("access-token", e.data.access_token),
//            void 0 === localStorage.login_redirect ? window.location = "/" : (window.location = localStorage.login_redirect,
//            delete localStorage.login_redirect)) : (gebi("login-btn").disabled = !1,
//            gebi("login-btn").innerHTML = "登录",
//            gebi("result").innerHTML = e.message)
//        }
//    }
//}
