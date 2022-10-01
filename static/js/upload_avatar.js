function upload_avatar(){
    document.getElementById("upload-btn").innerHTML = "上传中";
    document.getElementById("upload-btn").disabled = true;
    var avatar_file = document.getElementById("avatar_img_file").files[0];
    var fd = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open('post','https://saobbygguserdata.pythonanywhere.com/api/upload_image',true);
    xhr.onreadystatechange=function (){
        if(this.readyState==4){
            ret_json = JSON.parse(this.responseText);
            if (ret_json.success){
                document.getElementById("avatar_url").value = ret_json.image_url;
                document.getElementById("avatar_img").src = ret_json.image_url;
            }
            document.getElementById("upload_result").innerHTML = ret_json.message;
            document.getElementById("upload-btn").innerHTML = "上传";
            document.getElementById("upload-btn").disabled = false;
        }
    }
    xhr.upload.onprogress=function (ev){
        if(ev.lengthComputable){
            var precent=100 * ev.loaded/ev.total;
        document.getElementById("upload_result").innerHTML=Math.floor(precent)+"%";
        }
    }
}

function set_avatar(){
var avatar_url = document.getElementById("avatar_url").value;
if (avatar_url == ""){
document.getElementById("set_result").innerHTML="头像链接不能为空!";
return;
}
get_captcha_img();
document.getElementById("captcha-window").hidden=false;
};

function complete_captcha(){
document.getElementById("save-btn").disabled=true;
document.getElementById("save-btn").innerHTML="请稍候";
var avatar_url = document.getElementById("avatar_url").value;
var captcha_token = document.getElementById("captcha-token").value;
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://comment.saobby.com/api/set_avatar", true);
xhr.setRequestHeader("Content-Type", "application/json");
var sendData = {"avatar_url": avatar_url, "captcha_token": captcha_token, "access_token": localStorage.getItem("access-token")};
xhr.send(JSON.stringify(sendData));
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        ret_json = JSON.parse(xhr.responseText);
        if (ret_json.success){
            window.location="/";
        }else{
            document.getElementById("save-btn").disabled=false;
            document.getElementById("save-btn").innerHTML="保存";
            document.getElementById("set_result").innerHTML=ret_json.message;
        }
    }
}
};