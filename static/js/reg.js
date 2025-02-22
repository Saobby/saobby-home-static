var domain = "https://comments.saobby.com";
async function reg() {
    var username = gebi("username").value;
    var password = gebi("password").value;
    var password2 = gebi("password2").value;
    if (username === "" || password === "" || password2 === ""){
        gebi("result").innerHTML = "用户名和密码均不能为空!";
        return;
    }
    if (password !== password2){
        gebi("result").innerHTML = "两次密码输入不一致!";
        return;
    }
    set_btn_html(gebi("reg-btn"), "...");
    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        gebi("result").innerHTML = "人机验证失败:"+captcha_rsp.msg;
        set_btn_html(gebi("reg-btn"));
        return;
    }

    const rsp = await fetch_api(domain+"/api/register", {
        "username": username,
        "password": password,
        "captcha_token": captcha_rsp.data.token
    });
    if (rsp.retcode){
        gebi("result").innerHTML = rsp.msg;
        set_btn_html(gebi("reg-btn"));
        return;
    }
    localStorage.setItem("access-token", rsp.data.access_token);
    if (localStorage.login_redirect){
        window.location = localStorage.login_redirect;
        delete localStorage.login_redirect;
    }else{
        window.location = "/";
    }
}
// 已弃用
//function complete_captcha() {
//    gebi("reg-btn").disabled = !0,
//    gebi("reg-btn").innerHTML = "请稍候";
//    var e = gebi("username").value
//      , t = gebi("password").value
//      , n = gebi("captcha-token").value
//      , a = new XMLHttpRequest;
//    a.open("POST", domain + "/api/register", !0),
//    a.setRequestHeader("Content-Type", "application/json");
//    var o = {
//        username: e,
//        password: t,
//        captcha_token: n
//    };
//    a.send(JSON.stringify(o)),
//    a.onreadystatechange = function() {
//        if (4 === a.readyState) {
//            var e = JSON.parse(a.responseText);
//            e.success ? (localStorage.setItem("access-token", e.data.access_token),
//            void 0 === localStorage.login_redirect ? window.location = "/" : (window.location = localStorage.login_redirect,
//            delete localStorage.login_redirect)) : (gebi("reg-btn").disabled = !1,
//            gebi("reg-btn").innerHTML = "注册",
//            gebi("result").innerHTML = e.message)
//        }
//    }
//}
