function upload_file(){
var f = document.getElementById("file").files[0];
if (f === undefined){
document.getElementById("upload_result").innerHTML = "你未选择任何文件";
return;
}
get_captcha_img();
document.getElementById("captcha-window").hidden=false;
}

function complete_captcha(){
    document.getElementById("upload-btn").innerHTML = "上传中";
    document.getElementById("upload-btn").disabled = true;
    var avatar_file = document.getElementById("file").files[0];
    var captcha_token = document.getElementById("captcha-token").value;
    var fd = new FormData();
    var xhr = new XMLHttpRequest();
    xhr.open('post','https://saobby.pythonanywhere.com/api/github_picbed',true);
    xhr.onreadystatechange=function (){
        if(this.readyState==4){
            ret_json = JSON.parse(this.responseText);
            if (ret_json.success){
                document.getElementById("upload_result").innerHTML = ret_json.data.url;
            }else{
            document.getElementById("upload_result").innerHTML = ret_json.message;}
            document.getElementById("upload-btn").innerHTML = "上传";
            document.getElementById("upload-btn").disabled = false;
        }
    }
    xhr.upload.onprogress=function (ev){
        if(ev.lengthComputable){
            var precent=100 * ev.loaded/ev.total;
            if (precent==100){
                document.getElementById("upload_result").innerHTML="正在处理...";
            }else{
                document.getElementById("upload_result").innerHTML="上传中("+Math.floor(precent)+"%)";
            }
        }
    }
    fd.append("file", avatar_file);
    fd.append("captcha_token", captcha_token);
    xhr.send(fd);
};

if (localStorage.getItem("access-token")==undefined){
    window.location="/login";
}
