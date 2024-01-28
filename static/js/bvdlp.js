var domain = "https://bilivideo-api.saobby.com";

function query(){
    var video_link = gebi("video-link").value;
    if (video_link === ""){
        show_error_msg("视频链接不能为空!");
        return
    }
    set_btn_html(gebi("query-btn"), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        var send_data = {"video_url": video_link, "captcha_token": val.captcha_token};
        fetch_data(domain+"/api/get_video_pages", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                var page_html = [];
                for (var page_index in rep.data.pages){
                    var page = rep.data.pages[page_index];
                    page_html.push(`<b>P${page.page_index} </b><span>${rsc(page.title)}</span><br><b>时长: </b><span>${sec2hms(page.duration)}</span><br><div id="p${page.page_index}-link-div"><button class="wux-btn wux-btn-primary wux-btn-sm" onclick="get_video_link('${rep.data.info.video_id}','${rep.data.info.id_type}',${page.cid},gebi('p${page.page_index}-link-div'),this,gebi('p${page.page_index}-error'));">${icon_with_text("search-white", "解析")}</button><br><span id="p${page.page_index}-error" class="result"></span></div>`);
                }
                gebi("pages-div").innerHTML = page_html.join("<hr>");
                set_btn_html(gebi("query-btn"));
                gebi("notice-div").hidden = true;
                gebi("result-div").hidden = false;
                gebi("error-div").hidden = true;
            }else{
                show_error_msg(rep.message);
            }
        }, function(val2){
            show_error_msg(val2.message);
        });
    }, function(val){
        show_error_msg("请先完成人机验证:"+val.message);
    });
}

function get_video_link(vid, vid_type, cid, ele, btn, res){
    function set_btn_status(status){
        // btn.disabled = status;
        (status ? set_btn_html(btn, "..."): set_btn_html(btn))
    }
    set_btn_status(true);
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        var send_data = {"video_id": vid, "id_type": vid_type, "cid": cid, "captcha_token": val.captcha_token};
        fetch_data(domain+"/api/get_video_link", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                ele.innerHTML = `<b>画质: </b><span>${rep.data.quality}</span><br><b>大小: </b><span>${Math.round(rep.data.size*100)/100}MB</span><br><b>直链: </b><a target="_blank" href="${rsc(rep.data.url)}"><button class="wux-btn wux-btn-primary wux-btn-sm">${icon_with_text("eye-white", "打开")}</button></a><button class="wux-btn wux-btn-primary wux-btn-sm" style="left:3px;" onclick="navigator.clipboard.writeText('${rsc(rep.data.url)}');">${icon_with_text("copy-white", "复制")}</button>`;
            }else{
                res.innerHTML = rep.message;
                set_btn_status(false);
            }
        }, function(val2){
            res.innerHTML = val2.message;
            set_btn_status(false);
        });
    }, function(val){
        res.innerHTML = "请先完成人机验证:"+val.message;
        set_btn_status(false);
    });
}

function show_error_msg(msg){
    gebi("error-msg").innerHTML = msg;
    gebi("notice-div").hidden = true;
    gebi("result-div").hidden = true;
    gebi("error-div").hidden = false;
    set_btn_html(gebi("query-btn"));
}

function sec2hms(sec){
    var h = Math.floor(sec/3600);
    var m = Math.floor(sec%3600/60);
    var s = Math.floor(sec%3600%60/1);
    if (h === 0){
        return m + ":" + s;
    }else{
        return h + ":" + m + ":" + s;
    }
}
