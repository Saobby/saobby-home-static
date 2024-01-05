var domain = "https://comments.saobby.com";
function login() {
    if (gebi("username").value === "" || gebi("password").value === ""){
        gebi("result").innerHTML = "用户名和密码均不能为空!";
        return;
    }
    gebi("login-btn").disabled = true;
    gebi("login-btn").innerHTML = "请完成人机验证";
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        gebi("login-btn").innerHTML = "请稍候";
        var data = {username: gebi("username").value, password: gebi("password").value, captcha_token: gebi("scpc-token").value};
        fetch_data(domain+"/api/login", "POST", headers, JSON.stringify(data)).then(function(val2){
            var ret = JSON.parse(val2.response_text);
            if (ret.success){
                localStorage.setItem("access-token", ret.data.access_token);
                if (!(localStorage.login_redirect)){
                    window.location = "/";
                }else{
                    window.location = localStorage.login_redirect;
                    delete localStorage.login_redirect;
                }
            }else{
                gebi("login-btn").disabled = false;
                gebi("login-btn").innerHTML = "登录";
                gebi("result").innerHTML = ret.message;
            }
        }, function(val2){
            gebi("login-btn").disabled = false;
            gebi("login-btn").innerHTML = "登录";
            gebi("result").innerHTML = val2.message;
        });
    }, function(val){
        gebi("login-btn").disabled = false;
        gebi("login-btn").innerHTML = "登录";
        gebi("result").innerHTML = "请先完成人机验证:"+val.message;
    });
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
