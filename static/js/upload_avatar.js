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
        http.open("post", "https://upload-static.saobby.com/api/upload_image", true);
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
function set_avatar() {
    var e, a;
    "" != (a = gebi("avatar_url").value) ? (set_btn_html(gebi("save-btn"), "请稍候"),
    a = gebi("avatar_url").value,
    (e = new XMLHttpRequest).open("POST", domain + "/api/set_avatar_url", !0),
    e.setRequestHeader("Content-Type", "application/json"),
    a = {
        avatar_url: a,
        access_token: localStorage.getItem("access-token")
    },
    e.send(JSON.stringify(a)),
    e.onreadystatechange = function() {
        4 == e.readyState && ((ret_json = JSON.parse(e.responseText)).success ? window.location = "/" : (set_btn_html(gebi("save-btn")),
        gebi("set_result").innerHTML = ret_json.message))
    }
    ) : gebi("set_result").innerHTML = "头像链接不能为空!"
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
