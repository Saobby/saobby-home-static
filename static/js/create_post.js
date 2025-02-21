var domain = "https://comments.saobby.com";
var last_save_draft = 0;
function preview(mode){
    if (mode){
        gebi("preview-html").innerHTML = marked.parse(gebi("content-input").value);
    }
    gebi("content-input").hidden = mode;
    gebi("preview-html").hidden = !mode;
    gebi("preview-btn").hidden = mode;
    gebi("edit-btn").hidden = !mode;
}
async function release(){
    var title = gebi("title-input").value;
    var content = gebi("content-input").value;
    if (title === "" || content === ""){
        gebi("result").innerHTML = "标题和正文均不能为空";
        return null;
    }
    gebi("content-input").disabled = true;
    gebi("title-input").disabled = true;
    set_btn_html(gebi("release-btn"), "...");

    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        gebi("result").innerHTML = "人机验证失败:"+captcha_rsp.msg;
        gebi("content-input").disabled = false;
        gebi("title-input").disabled = false;
        set_btn_html(gebi("release-btn"));
        return;
    }

    const rsp = await fetch_api(domain+"/api/create_post", {
        access_token: localStorage.getItem("access-token"),
        title: title,
        content: content,
        captcha_token: captcha_rsp.data.token
    });
    if (rsp.retcode){
        gebi("result").innerHTML = rsp.msg;
        gebi("content-input").disabled = false;
        gebi("title-input").disabled = false;
        set_btn_html(gebi("release-btn"));
        return;
    }
    gebi("result").innerHTML = "发表成功";
    window.location = "/post/?pid="+rsp.data.name;
}
function load_post_draft(){
    function apply_draft(data){
        if (!data){
            return;
        }
        var d = JSON.parse(data);
        var title = d.t;
        var content = d.c;
        if (content){
            gebi("content-input").value = content;
        }
        if (title){
            gebi("title-input").value = title;
        }
    }
    function show_error_msg(msg){
        gebi("result").innerHTML = msg;
    }
    var access_token = localStorage.getItem("access-token");
    if (!access_token){
        return;
    }
    var data = {"access_token": access_token};
    fetch_data(domain+"/api/get_post_draft", "POST", headers, JSON.stringify(data)).then(function(val){
        var rsp = JSON.parse(val.response_text);
        if (rsp.success){
            apply_draft(rsp.data.content);
        }else{
            show_error_msg("无法加载草稿:"+rsp.message);
        }
    }, function(val){
        show_error_msg("无法加载草稿:"+val.message);
    });
}
function save_post_draft(){
    function show_error_msg(msg){
        gebi("result").innerHTML = msg;
    }
    var ts = new Date().getTime() / 1e3;
    if ((ts - last_save_draft) < 1){
        return;
    }
    last_save_draft = ts;
    var access_token = localStorage.getItem("access-token");
    if (!access_token){
        return;
    }
    var content = gebi("content-input").value;
    var title = gebi("title-input").value;
    if ((!content)&&(!title)){
        return;
    }
    var data = {"content": JSON.stringify({"t": title, "c": content}), "access_token": access_token};
    fetch_data(domain+"/api/save_post_draft", "POST", headers, JSON.stringify(data)).then(function(val){
        var rsp = JSON.parse(val.response_text);
        if (!rsp.success){
            show_error_msg("无法保存草稿:"+rsp.message);
        }
    }, function(val){
        show_error_msg("无法保存草稿:"+val.message);
    });
}
!function(){
    if (localStorage.getItem("access-token") === null){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
    }
    load_post_draft();
}();
