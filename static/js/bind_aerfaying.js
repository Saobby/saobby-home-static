var domain = "https://aether.saobby.com:5002";
function get_verification_code() {
//    var e = new XMLHttpRequest;
//    e.open("POST", domain + "/api/get_aerfaying_verification_code", !0),
//    e.setRequestHeader("Content-Type", "application/json"),
//    e.send(JSON.stringify({})),
//    e.onreadystatechange = function() {
//        if (4 == e.readyState) {
//            if (504 == e.status)
//                return void (gebi("comment-content").innerHTML = "请求超时!请刷新页面");
//            var t = JSON.parse(e.responseText);
//            gebi("comment-content").innerHTML = t.data.auth_key,
//            gebi("timestamp").value = t.data.timestamp,
//            gebi("signature").value = t.data.signature
//        }
//    }
    gebi("check-btn").disabled = true;
    fetch_data(domain+"/api/get_aerfaying_verification_code", "POST", headers, JSON.stringify({})).then(function(val){
        var ret = JSON.parse(val.response_text);
        if (ret.success){
            gebi("comment-content").innerHTML = ret.data.auth_key;
            gebi("timestamp").value = ret.data.timestamp;
            gebi("signature").value = ret.data.signature;
            gebi("check-btn").disabled = false;
        }else{
            gebi("comment-content").innerHTML = `无法加载评论内容，因为:${ret.message}，请刷新页面`;
        }
    }, function(val){
        gebi("comment-content").innerHTML = `无法加载评论内容，因为:${val.message}，请刷新页面`;
    });
}
function check_comment() {
    gebi("check-btn").disabled = true;
    gebi("check-btn").innerHTML = "请完成人机验证";
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        gebi("check-btn").innerHTML = "请稍候";
        var data = {access_token: localStorage["access-token"],
            captcha_token: gebi("scpc-token").value,
            timestamp: gebi("timestamp").value,
            signature: gebi("signature").value,
            auth_key: gebi("comment-content").innerHTML};
        fetch_data(domain + "/api/set_aerfaying_uid", "POST", headers, JSON.stringify(data)).then(function(val2){
            var ret = JSON.parse(val2.response_text);
            if (ret.success){
                gebi("result").innerHTML = "绑定成功!有人回复你的评论时，你将会在阿尔法营收到提醒消息";
            }else{
                gebi("result").innerHTML = ret.message;
            }
            gebi("check-btn").disabled = false;
            gebi("check-btn").innerHTML = "我已评论";
        }, function(val2){
            gebi("result").innerHTML = val2.message;
            gebi("check-btn").disabled = false;
            gebi("check-btn").innerHTML = "我已评论";
        });
    }, function(val){
        gebi("result").innerHTML = "请先完成人机验证:"+val.message;
        gebi("check-btn").disabled = false;
        gebi("check-btn").innerHTML = "我已评论";
    });
}
// 已弃用
//function complete_captcha() {
//    gebi("check-btn").disabled = !0,
//    gebi("check-btn").innerHTML = "请稍候";
//    var e = new XMLHttpRequest;
//    e.open("POST", domain + "/api/set_aerfaying_uid", !0),
//    e.setRequestHeader("Content-Type", "application/json");
//    var t = {
//        access_token: localStorage["access-token"],
//        captcha_token: gebi("captcha-token").value,
//        timestamp: gebi("timestamp").value,
//        signature: gebi("signature").value,
//        auth_key: gebi("comment-content").innerHTML
//    };
//    e.send(JSON.stringify(t)),
//    e.onreadystatechange = function() {
//        if (4 == e.readyState) {
//            if (gebi("check-btn").disabled = !1,
//            gebi("check-btn").innerHTML = "我已评论",
//            504 == e.status)
//                return void (gebi("result").innerHTML = "请求超时!请刷新页面");
//            var t = JSON.parse(e.responseText);
//            t.success ? gebi("result").innerHTML = "绑定成功!有人回复你的评论时，你将会在阿尔法营收到提醒消息" : gebi("result").innerHTML = t.message
//        }
//    }
//}
function unbind() {
    gebi("unbind-btn").disabled = true;
    gebi("unbind-btn").innerHTML = "请稍候";
    fetch_data(domain + "/api/unbind_aerfaying", "POST", headers, JSON.stringify({access_token: localStorage["access-token"]})).then(function(val){
        var ret = JSON.parse(val.response_text);
        if (ret.success){
            gebi("result2").innerHTML = "解绑成功!";
        }else{
            gebi("result2").innerHTML = ret.message;
        }
        gebi("unbind-btn").disabled = false;
        gebi("unbind-btn").innerHTML = "解除绑定";
    }, function(val){
        gebi("result2").innerHTML = val.message;
        gebi("unbind-btn").disabled = false;
        gebi("unbind-btn").innerHTML = "解除绑定";
    });
//    var e = new XMLHttpRequest;
//    e.open("POST", domain + "/api/unbind_aerfaying", !0),
//    e.setRequestHeader("Content-Type", "application/json");
//    var t = {
//        access_token: localStorage["access-token"]
//    };
//    e.send(JSON.stringify(t)),
//    e.onreadystatechange = function() {
//        if (4 == e.readyState) {
//            if (gebi("unbind-btn").disabled = !1,
//            gebi("unbind-btn").innerHTML = "解除绑定",
//            504 == e.status)
//                return void (gebi("result2").innerHTML = "请求超时!请刷新页面");
//            var t = JSON.parse(e.responseText);
//            t.success ? gebi("result2").innerHTML = "解绑成功!" : gebi("result2").innerHTML = t.message
//        }
//    }
}
get_verification_code();
null == localStorage.getItem("access-token") && (localStorage.login_redirect = window.location.href,
window.location = "/login");
