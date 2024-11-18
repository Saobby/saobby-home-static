var domain = "https://comments.saobby.com";
//function upload_avatar() {
//    void 0 !== gebi("avatar_img_file").files[0] ? (get_captcha_img(),
//    gebi("captcha-window").hidden = !1) : gebi("upload_result").innerHTML = "你未选择任何文件"
//}
function upload_avatar() {
    var file = gebi("avatar_img_file").files[0];
    if (file === undefined){
        gebi("upload_result").innerHTML = "你未选择任何文件";
        return;
    }
    set_btn_html(gebi("upload-btn"), "请完成人机验证");
    gebi("avatar_img_file").disabled = true;
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("upload-btn"), "正在上传");
        var form_data = new FormData;
        var http = new XMLHttpRequest;
        http.open("post", "https://image.saobby.com/api/upload_image", true);
        http.onreadystatechange = function(){
            if (this.readyState === 4){
                var ret = JSON.parse(this.responseText);
                if (ret.success){
                    gebi("upload_result").innerHTML = "上传成功";
                    gebi("avatar_url").value = ret.data.image_url;
                    gebi("avatar_img").src = ret.data.image_url;
                }else{
                    gebi("upload_result").innerHTML = ret.message;
                }
                set_btn_html(gebi("upload-btn"));
                gebi("avatar_img_file").disabled = false;
            }
        };
        http.upload.onprogress = function(t){
            if (t.lengthComputable){
                var percentage = 100 * t.loaded / t.total;
                if (percentage === 100){
                    gebi("upload_result").innerHTML = "正在处理...";
                    gebi("upload-progress").hidden = true;
                }else{
                    gebi("upload_result").innerHTML = "上传中(" + Math.floor(percentage) + "%)";
                    gebi("upload-progress").value = percentage;
                    gebi("upload-progress").hidden = false;
                }
            }
        };
        form_data.append("image", file);
        form_data.append("captcha_token", val.captcha_token);
        http.send(form_data);
    },
    function(val){
        gebi("upload_result").innerHTML = "请先完成人机验证:"+val.message;
        gebi("avatar_img_file").disabled = false;
        set_btn_html(gebi("upload-btn"));
    });
}
async function set_avatar() {
    let avatar_url = gebi("avatar_url").value;
    if (!avatar_url) {
        gebi("set_result").innerHTML = "链接不能为空";
        return;
    }
    set_btn_html(gebi("save-btn"), "请稍候");
    let ret = await fetch_api(domain + "/api/set_avatar_url", {
        "avatar_url": avatar_url,
        "access_token": localStorage.getItem("access-token")
    });
    if (!ret.retcode){
        gebi("set_result").innerHTML = "头像设置成功";
    }else{
        gebi("set_result").innerHTML = ret.msg;
    }
    set_btn_html(gebi("save-btn"));
}
//function complete_captcha() {
//    gebi("upload-btn").innerHTML = "上传中",
//    gebi("upload-btn").disabled = !0;
//    var e = gebi("avatar_img_file").files[0]
//      , a = gebi("captcha-token").value
//      , t = new FormData
//      , n = new XMLHttpRequest;
//    n.open("post", "https://saobbyggusercontent.pythonanywhere.com/api/upload_image", !0),
//    n.onreadystatechange = function() {
//        4 == this.readyState && ((ret_json = JSON.parse(this.responseText)).success && (gebi("avatar_url").value = ret_json.data.image_url,
//        gebi("avatar_img").src = ret_json.data.image_url),
//        gebi("upload_result").innerHTML = ret_json.message,
//        gebi("upload-btn").innerHTML = "上传",
//        gebi("upload-btn").disabled = !1)
//    }
//    ,
//    n.upload.onprogress = function(e) {
//        e.lengthComputable && (e = 100 * e.loaded / e.total,
//        gebi("upload_result").innerHTML = 100 == e ? "正在处理..." : "上传中(" + Math.floor(e) + "%)")
//    }
//    ,
//    t.append("image", e),
//    t.append("captcha_token", a),
//    n.send(t)
//}
null == localStorage.getItem("access-token") && (localStorage.login_redirect = window.location.href,
window.location = "/login");
