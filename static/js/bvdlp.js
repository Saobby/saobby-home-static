var domain = "https://bilivideo-api.saobby.com";

async function query(){
    var video_link = gebi("video-link").value;
    if (video_link === ""){
        show_error_msg("视频链接不能为空!");
        return
    }
    set_btn_html(gebi("query-btn"), "...");
    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        show_error_msg("人机验证失败:"+captcha_rsp.msg);
        return;
    }
    const rsp = await fetch_api(domain+"/api/get_video_pages", {
        video_url: video_link,
        captcha_token: captcha_rsp.data.token
    });
    if (rsp.retcode){
        show_error_msg(rsp.msg);
        return;
    }
    var page_html = [];
    for (var page_index in rsp.data.pages){
        var page = rsp.data.pages[page_index];
        page_html.push(`<b>P${page.page_index} </b><span>${rsc(page.title)}</span><br><b>时长: </b><span>${sec2hms(page.duration)}</span><br><div id="p${page.page_index}-link-div"><button class="wux-btn wux-btn-primary wux-btn-sm" onclick="get_video_link('${rsp.data.info.video_id}','${rsp.data.info.id_type}',${page.cid},gebi('p${page.page_index}-link-div'),this,gebi('p${page.page_index}-error')).then();">${icon_with_text("search-white", "解析")}</button><br><span id="p${page.page_index}-error" class="result"></span></div>`);
    }
    gebi("pages-div").innerHTML = page_html.join("<hr>");
    set_btn_html(gebi("query-btn"));
    gebi("notice-div").hidden = true;
    gebi("result-div").hidden = false;
    gebi("error-div").hidden = true;
}

async function get_video_link(vid, vid_type, cid, ele, btn, res){
    function set_btn_status(status){
        // btn.disabled = status;
        (status ? set_btn_html(btn, "..."): set_btn_html(btn))
    }
    set_btn_status(true);
    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        res.innerHTML = "人机验证失败:"+captcha_rsp.msg;
        set_btn_status(false);
        return;
    }

    const rsp = await fetch_api(domain+"/api/get_video_link", {
        video_id: vid,
        id_type: vid_type,
        cid: cid,
        captcha_token: captcha_rsp.data.token
    });
    if (rsp.retcode){
        res.innerHTML = rsp.msg;
        set_btn_status(false);
        return;
    }

    ele.innerHTML = `<b>画质: </b><span>${rsp.data.quality}</span><br><b>大小: </b><span>${Math.round(rsp.data.size*100)/100}MB</span><br><b>直链: </b><a target="_blank" href="${rsc(rsp.data.url)}"><button class="wux-btn wux-btn-primary wux-btn-sm">${icon_with_text("eye-white", "打开")}</button></a><button class="wux-btn wux-btn-primary wux-btn-sm" style="left:3px;" onclick="copy_text('${rsc(rsp.data.url)}',this);">${icon_with_text("copy-white", "复制")}</button>`;
    set_btn_status(false);
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
