var domain = "https://comments.saobby.com";
var last_save_draft = 0;
function preview(mode){
    if (mode){
        gebi("preview-html").innerHTML = marked.parse(gebi("content-input").value);
        update_highlight(gebi("preview-html"));
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
