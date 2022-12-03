function get_verification_code(){
    var xhr = new XMLHttpRequest();
    xhr.open("POST", "https://fast-comment.saobby.com/api/get_aerfaying_verification_code", true);
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
            document.getElementById("comment-content").innerHTML = ret_json.data;
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
    xhr.open("POST", "https://fast-comment.saobby.com/api/set_aerfaying_uid", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    var sendData = {"access_token": localStorage["access-token"],
    "captcha_token": document.getElementById("captcha-token").value};
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
