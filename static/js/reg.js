var domain = "https://api-ry.saobby.com/comment";
function reg() {
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
    gebi("reg-btn").disabled = true;
    gebi("reg-btn").innerHTML = "请完成人机验证";
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        gebi("reg-btn").innerHTML = "请稍候";
        fetch_data(domain+"/api/register", "POST", headers, JSON.stringify({username:username, password:password, captcha_token: gebi("scpc-token").value})).then(function(val2){
            var ret = JSON.parse(val2.response_text);
            if (ret.success){
                localStorage.setItem("access-token", ret.data.access_token);
                if (localStorage.login_redirect){
                    window.location = localStorage.login_redirect;
                    delete localStorage.login_redirect;
                }else{
                    window.location = "/";
                }
            }else{
                gebi("reg-btn").disabled = false;
                gebi("reg-btn").innerHTML = "注册";
                gebi("result").innerHTML = ret.message;
            }
        }, function(val2){
            gebi("reg-btn").disabled = false;
            gebi("reg-btn").innerHTML = "注册";
            gebi("result").innerHTML = val2.message;
        });
    }, function(val){
        gebi("reg-btn").disabled = false;
        gebi("reg-btn").innerHTML = "注册";
        gebi("result").innerHTML = "请先完成人机验证:"+val.message;
    });
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
