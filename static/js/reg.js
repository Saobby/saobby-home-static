function reg(){username=document.getElementById("username").value,password=document.getElementById("password").value,password2=document.getElementById("password2").value,""==username|""==password|""==password2?document.getElementById("result").innerHTML="用户名和密码均不能为空!":password==password2?(get_captcha_img(),document.getElementById("captcha-window").hidden=!1):document.getElementById("result").innerHTML="两次密码输入不一致!"}function complete_captcha(){document.getElementById("reg-btn").disabled=!0,document.getElementById("reg-btn").innerHTML="请稍候",username=document.getElementById("username").value,password=document.getElementById("password").value,captcha_token=document.getElementById("captcha-token").value;var e=new XMLHttpRequest;e.open("POST","https://fast-comment.saobby.com/api/register",!0),e.setRequestHeader("Content-Type","application/json");var t={username:username,password:password,captcha_token:captcha_token};e.send(JSON.stringify(t)),e.onreadystatechange=function(){4==e.readyState&&(ret_json=JSON.parse(e.responseText),ret_json.success?(localStorage.setItem("access-token",ret_json.data.access_token),void 0===localStorage.login_redirect?window.location="/":(window.location=localStorage.login_redirect,localStorage.login_redirect=void 0)):(document.getElementById("reg-btn").disabled=!1,document.getElementById("reg-btn").innerHTML="注册",document.getElementById("result").innerHTML=ret_json.message))}}