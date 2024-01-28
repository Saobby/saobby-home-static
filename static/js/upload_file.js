function upload_file() {
    var file = gebi("file").files[0];
    if (file === undefined){
        gebi("upload_result").innerHTML = "你未选择任何文件";
        return;
    }
    set_btn_html(gebi("upload-btn"), "请完成人机验证");
    gebi("file").disabled = true;
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("upload-btn"), "正在上传");
        var form_data = new FormData;
        var http = new XMLHttpRequest;
        http.open("post", "https://github-picbed.saobby.com/api/github_picbed", true);
        http.onreadystatechange = function(){
            if (this.readyState === 4){
                var ret = JSON.parse(this.responseText);
                if (ret.success){
                    gebi("upload_result").innerHTML = "上传成功";
                    gebi("file_url").value = ret.data.url;
                    gebi("markdown").value = "![](" + ret.data.url + ")";
                }else{
                    gebi("upload_result").innerHTML = ret.message;
                }
                set_btn_html(gebi("upload-btn"));
                gebi("file").disabled = false;
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
        form_data.append("file", file);
        form_data.append("captcha_token", val.captcha_token);
        http.send(form_data);
    },
    function(val){
        gebi("upload_result").innerHTML = "请先完成人机验证:"+val.message;
        gebi("file").disabled = false;
        set_btn_html(gebi("upload-btn"));
    });
}
//function complete_captcha() {
//    gebi("upload-btn").innerHTML = "上传中",
//    gebi("upload-btn").disabled = !0;
//    var e = gebi("file").files[0]
//      , a = gebi("captcha-token").value
//      , t = new FormData
//      , n = new XMLHttpRequest;
//    n.open("post", "https://saobby.pythonanywhere.com/api/github_picbed", !0),
//    n.onreadystatechange = function() {
//        4 == this.readyState && ((ret_json = JSON.parse(this.responseText)).success ? (gebi("upload_result").innerHTML = "上传成功",
//        gebi("file_url").value = ret_json.data.url,
//        gebi("markdown").value = "![](" + ret_json.data.url + ")") : gebi("upload_result").innerHTML = ret_json.message,
//        gebi("upload-btn").innerHTML = "上传",
//        gebi("upload-btn").disabled = !1)
//    }
//    ,
//    n.upload.onprogress = function(e) {
//        e.lengthComputable && (e = 100 * e.loaded / e.total,
//        gebi("upload_result").innerHTML = 100 == e ? "正在处理..." : "上传中(" + Math.floor(e) + "%)")
//    }
//    ,
//    t.append("file", e),
//    t.append("captcha_token", a),
//    n.send(t)
//}
