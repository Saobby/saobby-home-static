function get_verification_code(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://comment-hongkong.saobby.com/api/get_aerfaying_verification_code", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendData = {};
    xhr.send(JSON.stringify(sendData));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            if (xhr.status == 504){
                document.getElementById("comment-content").innerHTML = "请求超时!请刷新页面";
                return;
            }
            var ret_json = JSON.parse(xhr.responseText);
            document.getElementById("comment-content").innerHTML = ret_json.data.auth_key;
            document.getElementById("timestamp").value = ret_json.data.timestamp;
            document.getElementById("signature").value = ret_json.data.signature;
        }
    }
}

function check_comment(){
    get_captcha_img();
    document.getElementById("captcha-window").hidden = false;
}

function complete_captcha(){
    document.getElementById("check-btn").disabled = true;
    document.getElementById("check-btn").innerHTML = "请稍候";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://comment-hongkong.saobby.com/api/set_aerfaying_uid", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendData = {"access_token": localStorage["access-token"],
    "captcha_token": document.getElementById("captcha-token").value,
    "timestamp": document.getElementById("timestamp").value,
    "signature": document.getElementById("signature").value,
    "auth_key": document.getElementById("comment-content").innerHTML};
    xhr.send(JSON.stringify(sendData));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            document.getElementById("check-btn").disabled = false;
            document.getElementById("check-btn").innerHTML = "我已评论";
            if (xhr.status == 504){
                document.getElementById("result").innerHTML = "请求超时!请刷新页面";
                return;
            }
            var ret_json = JSON.parse(xhr.responseText);
            if (ret_json.success){
                document.getElementById("result").innerHTML = "绑定成功!有人回复你的评论时，你将会在阿尔法营收到提醒消息";
            }else{
                document.getElementById("result").innerHTML = ret_json.message;
            }
        }
    }
}

function unbind(){
    document.getElementById("unbind-btn").disabled = true;
    document.getElementById("unbind-btn").innerHTML = "请稍候";
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://comment-hongkong.saobby.com/api/unbind_aerfaying", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendData = {"access_token": localStorage["access-token"]}
    xhr.send(JSON.stringify(sendData));
    xhr.onreadystatechange = function() {
        if (xhr.readyState == 4) {
            document.getElementById("unbind-btn").disabled = false;
            document.getElementById("unbind-btn").innerHTML = "解除绑定";
            if (xhr.status == 504){
                document.getElementById("result2").innerHTML = "请求超时!请刷新页面";
                return;
            }
            var ret_json = JSON.parse(xhr.responseText);
            if (ret_json.success){
                document.getElementById("result2").innerHTML = "解绑成功!";
            }else{
                document.getElementById("result2").innerHTML = ret_json.message;
            }
        }
    }
}
get_verification_code();
