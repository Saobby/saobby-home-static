function login(){
username = document.getElementById("username").value;
password = document.getElementById("password").value;
if (username == "" | password == ""){
document.getElementById("result").innerHTML="用户名和密码均不能为空!";
return;
}
get_captcha_img();
document.getElementById("captcha-window").hidden=false;
};

function complete_captcha(){
document.getElementById("login-btn").disabled=true;
document.getElementById("login-btn").innerHTML="请稍候";
username = document.getElementById("username").value;
password = document.getElementById("password").value;
captcha_token = document.getElementById("captcha-token").value;
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://fast-comment.saobby.com/api/login", true);
xhr.setRequestHeader("Content-Type", "application/json");
var sendData = {"username": username, "password": password, "captcha_token": captcha_token};
xhr.send(JSON.stringify(sendData));
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        ret_json = JSON.parse(xhr.responseText);
        if (ret_json.success){
            localStorage.setItem("access-token", ret_json.data.access_token);
            window.location="/";
        }else{
            document.getElementById("login-btn").disabled=false;
            document.getElementById("login-btn").innerHTML="登录";
            document.getElementById("result").innerHTML=ret_json.message;
        }
    }
}
};
