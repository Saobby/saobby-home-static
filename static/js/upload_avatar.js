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