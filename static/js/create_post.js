var domain = "https://comments.saobby.com";
function preview(mode){
    if (mode){
        gebi("preview-html").innerHTML = marked.parse(gebi("content-input").value);
    }
    gebi("content-input").hidden = mode;
    gebi("preview-html").hidden = !mode;
    gebi("preview-btn").hidden = mode;
    gebi("edit-btn").hidden = !mode;
}
function release(){
    var title = gebi("title-input").value;
    var content = gebi("content-input").value;
    if (title === "" || content === ""){
        gebi("result").innerHTML = "标题和正文均不能为空";
        return null;
    }
    gebi("content-input").disabled = true;
    gebi("title-input").disabled = true;
    set_btn_html(gebi("release-btn"), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("release-btn"), "稍等");
        var send_data = {"access_token": localStorage.getItem("access-token"), "title": title, "content": content, "captcha_token": gebi("scpc-token").value};
        fetch_data(domain+"/api/create_post", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                gebi("result").innerHTML = "发表成功";
                window.location = "/post/?pid="+rep.data.name;
            }else{
                gebi("result").innerHTML = rep.message;
            }
            gebi("content-input").disabled = false;
            gebi("title-input").disabled = false;
            set_btn_html(gebi("release-btn"));
        }, function(val2){
            gebi("result").innerHTML = val2.message;
            gebi("content-input").disabled = false;
            gebi("title-input").disabled = false;
            set_btn_html(gebi("release-btn"));
        });
    }, function(val){
        gebi("result").innerHTML = "请先完成人机验证:"+val.message;
        gebi("content-input").disabled = false;
        gebi("title-input").disabled = false;
        set_btn_html(gebi("release-btn"));
    });
}
!function(){
    if (localStorage.getItem("access-token") === null){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
    }
}();
