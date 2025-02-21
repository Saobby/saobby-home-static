var domain = "https://comments.saobby.com";
var last_save_draft = 0;

function get_element_abs_pos2(element) {
    var top = element.offsetTop;
    var left = element.offsetLeft;
    
    while (element = element.offsetParent) {
        top += element.offsetTop;
        left += element.offsetLeft;
    }
    
    return {
        left: left,
        top: top
    }
}
function show_comment_window() {
    if (!(localStorage["access-token"])){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
    }else{
        gebi("comment-window").hidden = false;
        // gebi("upload-btn-span").innerHTML = pasteToUpload.gen_upload_btn("content", "md");
        load_comment_draft(-1);
    }
}
async function add_comment(reply_to, content) {
    function show_error_msg(msg){
        if (reply_to == -1){
            gebi("result0").innerHTML = msg;
        }else{
            gebi("reply-result-" + reply_to).innerHTML = msg;
        }
        set_btn_status(true);
    }
    function set_btn_status(status){
        if (reply_to == -1){
            gebi("cancel-btn").disabled = !status;
            gebi("content-preview-btn").disabled = !status;
            gebi("content-edit-btn").disabled = !status;
            if (status){
                set_btn_html(gebi("rel-btn"));
            }else{
                set_btn_html(gebi("rel-btn"), "...");
            }
        }else{
            gebi(`content-${reply_to}-preview-btn`).disabled = !status;
            gebi(`content-${reply_to}-edit-btn`).disabled = !status;
            gebi("cancel-rp-" + reply_to).disabled = !status;
            if (status){
                set_btn_html(gebi("rel-btn-" + reply_to));
            }else{
                set_btn_html(gebi("rel-btn-" + reply_to), "...");
            }
        }
    }
    set_btn_status(false);
    if (content === ""){
        show_error_msg("评论不能为空");
        return;
    }
    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        show_error_msg("人机验证失败"+captcha_rsp.msg);
        return;
    }
    const rsp = await fetch_api(domain+"/api/post_comment", {
        place_id: place_id,
        access_token: localStorage["access-token"],
        content: content,
        reply_to: reply_to,
        captcha_token: captcha_rsp.data.token
    });
    if (rsp.retcode){
        show_error_msg(rsp.msg);
        return;
    }
    if (reply_to == -1){
        gebi("content").value = "";
        gebi("content-preview").innerHTML = "";
        comment_page_index = 0;
    }else{
        gebi("reply-content-" + reply_to).value = "";
        gebi("content-preview-" + reply_to).innerHTML = "";
    }
    show_error_msg("评论发送成功!");
    get_all_comment().then();
}
// 已弃用
//function add_reply_comment(e, t) {
//    if (t != ""){
//
//        get_captcha_img();
//        gebi("captcha-window").hidden = !1;
//        args = {
//            place_id: place_id,
//            access_token: localStorage["access-token"],
//            content: t,
//            reply_to: e
//        }
//    }else{
//        gebi("reply-result-" + e).innerHTML = "评论不能为空!";
//    }
//}
// 已弃用
//function complete_captcha() {
//    if (args.reply_to === -1){
//        gebi("rel-btn").disabled = true;
//        gebi("cancel-btn").disabled = true;
//        gebi("content-preview-btn").disabled = true;
//        gebi("content-edit-btn").disabled = true;
//        gebi("rel-btn").innerHTML = "请稍候";
//    }else{
//        gebi("rel-btn-" + args.reply_to).disabled = true;
//        gebi(`content-${args.reply_to}-preview-btn`).disabled = true;
//        gebi(`content-${args.reply_to}-edit-btn`).disabled = true;
//        gebi("cancel-rp-" + args.reply_to).disabled = true
//        gebi("rel-btn-" + args.reply_to).innerHTML = "请稍候";
//    }
//    var t = new XMLHttpRequest;
//    t.open("POST", domain + "/api/post_comment", !0);
//    t.setRequestHeader("Content-Type", "application/json");
//    args.captcha_token = gebi("captcha-token").value;
//    t.send(JSON.stringify(args));
//    t.onreadystatechange = function() {
//        if (t.readyState === 4){
//            var e = JSON.parse(t.responseText);
//            if (e.success){
//                if (args.reply_to === -1){
//                    gebi("result0").innerHTML = "评论发送成功!";
//                    gebi("content").value = "";
//                    gebi("content-preview").innerHTML = "";
//                    comment_page_index = 0;
//                }else{
//                    gebi("reply-result-" + args.reply_to).innerHTML = "评论发送成功!",
//                    gebi("reply-content-" + args.reply_to).value = "",
//                    gebi("content-preview-" + args.reply_to).innerHTML = ""
//                }
//                get_all_comment();
//            }else{
//                if (args.reply_to === -1){
//                    gebi("result0").innerHTML = e.message;
//                }else{
//                    gebi("reply-result-" + args.reply_to).innerHTML = e.message;
//                }
//            }
//            if (args.reply_to === -1){
//                gebi("rel-btn").disabled = false;
//                gebi("cancel-btn").disabled = false;
//                gebi("content-preview-btn").disabled = false;
//                gebi("content-edit-btn").disabled = false;
//                gebi("rel-btn").innerHTML = "发表";
//            }else{
//                gebi("rel-btn-" + args.reply_to).disabled = false;
//                gebi(`content-${args.reply_to}-preview-btn`).disabled = false;
//                gebi(`content-${args.reply_to}-edit-btn`).disabled = false;
//                gebi("cancel-rp-" + args.reply_to).disabled = false;
//                gebi("rel-btn-" + args.reply_to).innerHTML = "发表";
//            }
//        }
//    }
//}
async function get_all_comment() {
    var api_response = await fetch_api(
        domain + "/api/get_comment",
        {
            place_id: place_id,
            amount_per_page: 8,
            page_index: comment_page_index,
            access_token: localStorage["access-token"],
            scroll_to: scroll_to
        }
    );

    if (api_response.retcode) {
        gebi("comment-area").innerHTML = `<span class="result">无法加载评论:${api_response.msg}</span>`;
        return;
    }

    // 生成评论HTML
    var comment_html = "";
    for (let comment_id in api_response.data) {
        comment_html += read_comment(api_response.data[comment_id], 0);
    }

    // 更新页面状态
    comment_page_index = api_response.comment_data.page_index - 1;
    gebi("comment-area").innerHTML = comment_html;
    gebi("page_index").innerHTML = api_response.comment_data.page_index;
    gebi("page_amount").innerHTML = api_response.comment_data.page_amount;

    // 处理滚动
    if (scroll_to) {
        window.scrollTo(get_element_abs_pos2(gebi("comment-area-" + scroll_to)));
        scroll_to = undefined;
    }

    // 生成分页按钮
    var start_page = api_response.comment_data.page_index - 2;
    var end_page = api_response.comment_data.page_index + 2;

    if (start_page < 1) {
        start_page = 1;
    }
    if (end_page > api_response.comment_data.page_amount) {
        end_page = api_response.comment_data.page_amount;
    }

    var page_buttons_html = "";
    
    // 添加首页按钮
    if (start_page != 1) {
        page_buttons_html += '<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(0);">«</button>';
    }

    // 添加页码按钮
    for (var page_num = start_page; page_num <= end_page; page_num++) {
        var button_class = page_num == api_response.comment_data.page_index ? 
            "wux-btn cp-btn" : 
            "wux-btn cp-btn wux-btn-outline";
        page_buttons_html += `<button class="${button_class}" onclick="change_page(${page_num - 1});">${page_num}</button>`;
    }

    // 添加末页按钮
    if (end_page != api_response.comment_data.page_amount) {
        page_buttons_html += `<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(${api_response.comment_data.page_amount - 1});">»</button>`;
    }

    gebi("change-page-btn").innerHTML = page_buttons_html;

    // 初始化其他功能
    pasteToUpload.init();
    add_markdown_tips();
}
function read_comment(comment_data, indent_level) {
    let html_output = "";
    let content = comment_data.content;
    let parsed_content = marked.parse(content);
    let username = rsc(comment_data.username);
    let reply_to_id = comment_data.reply_to;
    let escaped_content = rsc(content);
    
    // 构建评论HTML
    html_output += `<div style="position:relative;left:${20 * indent_level}px;" id="comment-area-${comment_data.cid}"><div style="border-bottom: 2px solid #ddd;padding:12px 0px;"><img src="${comment_data.avatar_url}" alt="用户头像" width="32px" height="32px"><b style="position:relative;top:-17px;left:5px;">${comment_data.nickname ? rsc(comment_data.nickname) : username}</b><span style="color:#777777;position:relative;top:-17px;left:5px;" class="middle"> <img src="/static/image/icon/mail-check-grey.svg" width="16px" height="16px" alt="(已绑定电子邮箱)" title="此用户已绑定电子邮箱" class="middle" ${comment_data.is_email_checked?"":"hidden"}> <img src="/static/image/icon/pencil-check-grey.svg" width="16px" height="16px" alt="(已编辑)" title="(已编辑)" class="middle" ${comment_data.modify_time?"":"hidden"}> <img src="/static/image/icon/clock-grey.svg" width="16px" height="16px" alt="发表时间" class="middle">${comment_data.modify_time ? ts2str(comment_data.modify_time) : ts2str(comment_data.timestamp)} #${comment_data.cid}</span><br>`;

    if (reply_to_id !== -1) {
        html_output += `<span style="color:#777777" onclick="window.scrollTo(get_element_abs_pos2(gebi('comment-area-${comment_data.reply_to}')))" class="middle">${icon_with_text("corner-down-right-grey", "回复 #"+comment_data.reply_to.toString())}</span><br>`;
    }

    html_output += `<div id="comment-md-${comment_data.cid}" class="pre-like-code" hidden>${escaped_content}</div><div hidden><textarea id="origin-content-${comment_data.cid}">${escaped_content}</textarea></div><div id="edit-div-${comment_data.cid}" hidden><textarea class="wux-form-input wux-form-input-md marked-textarea" placeholder="编辑 #${comment_data.cid} 最多4096字" rows="5" id="edit-content-${comment_data.cid}">${escaped_content}</textarea></div><div id="edit-preview-${comment_data.cid}" class="pre-like" hidden></div><div class="comment-content" id="comment-html-${comment_data.cid}">${parsed_content}</div><i style="color:#777777;" ${comment_data.is_read === null? "hidden": ""}>${comment_data.is_read !== null ? (comment_data.is_read ? "已读("+ts2str(comment_data.read_time)+")": "未读"):""}</i><br ${comment_data.is_read === null? "hidden": ""}><button onclick="show_reply_window(${comment_data.cid})" class="wux-btn wux-btn-primary wux-btn-sm" id="reply-btn-${comment_data.cid}">${icon_with_text("message-reply-white", "回复")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="view-md-${comment_data.cid}" onclick="gebi('comment-md-${comment_data.cid}').hidden=!1;gebi('comment-html-${comment_data.cid}').hidden=!0;gebi('view-html-${comment_data.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" ${comment_data.can_edit ? "hidden" : ""}>${icon_with_text("markdown-primary", "查看M↓")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="view-html-${comment_data.cid}" onclick="gebi('comment-md-${comment_data.cid}').hidden=!0;gebi('comment-html-${comment_data.cid}').hidden=!1;gebi('view-md-${comment_data.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" hidden>${icon_with_text("markdown-white", "查看M↓")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="edit-btn-${comment_data.cid}" onclick="show_edit_window(${comment_data.cid})" style="margin-left:3px" ${comment_data.can_edit ? "" : "hidden"}>${icon_with_text("edit-primary", "编辑")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="cancel-edit-btn-${comment_data.cid}" onclick="hide_edit_window(${comment_data.cid})" style="margin-left:3px" hidden>${icon_with_text("x-primary", "取消")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" onclick="gebi('edit-preview-${comment_data.cid}').innerHTML=marked.parse(gebi('edit-content-${comment_data.cid}').value);gebi('edit-preview-${comment_data.cid}').hidden=false;gebi('edit-div-${comment_data.cid}').hidden=true;this.hidden=true;gebi('edit-${comment_data.cid}-edit-btn').hidden=false;" id="edit-${comment_data.cid}-preview-btn" style="margin-left:3px" hidden>${icon_with_text("eye-primary", "预览")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" onclick="gebi('edit-preview-${comment_data.cid}').hidden=true;gebi('edit-div-${comment_data.cid}').hidden=false;this.hidden=true;gebi('edit-${comment_data.cid}-preview-btn').hidden=false;" id="edit-${comment_data.cid}-edit-btn" style="margin-left:3px" hidden>${icon_with_text("edit-primary", "编辑")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="save-edit-btn-${comment_data.cid}" onclick="save_edition(${comment_data.cid})" style="margin-left:3px" hidden>${icon_with_text("check-white", "保存")}</button><span id="edit-upload-btn-${comment_data.cid}" hidden>${pasteToUpload.gen_upload_btn("edit-content-"+comment_data.cid, "sm")}${emotionBar.gen_open_btn("edit-content-"+comment_data.cid, "sm")}</span><span id="edit-result-${comment_data.cid}" style="color:#aa0000;margin-left:3px"></span></div><div id="comment-window-${comment_data.cid}" hidden><div id="content-${comment_data.cid}-div"><textarea class="wux-form-input wux-form-input-md marked-textarea" placeholder="回复 #${comment_data.cid} 最多4096字" rows="5" id="reply-content-${comment_data.cid}" onchange="save_comment_draft(this,${comment_data.cid});"></textarea></div><div id="content-preview-${comment_data.cid}" class="pre-like" hidden></div><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="gebi('comment-window-${comment_data.cid}').hidden=!0;gebi('reply-btn-${comment_data.cid}').disabled=!1;" type="button" id="cancel-rp-${comment_data.cid}">${icon_with_text("x-primary", "取消")}</button><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="gebi('content-preview-${comment_data.cid}').innerHTML=marked.parse(gebi('reply-content-${comment_data.cid}').value);gebi('content-preview-${comment_data.cid}').hidden=false;gebi('content-${comment_data.cid}-div').hidden=true;this.hidden=true;gebi('content-${comment_data.cid}-edit-btn').hidden=false;" type="button" id="content-${comment_data.cid}-preview-btn" style="margin-left:3px">${icon_with_text("eye-primary", "预览")}</button><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="gebi('content-preview-${comment_data.cid}').hidden=true;gebi('content-${comment_data.cid}-div').hidden=false;this.hidden=true;gebi('content-${comment_data.cid}-preview-btn').hidden=false;" type="button" id="content-${comment_data.cid}-edit-btn" style="margin-left:3px" hidden>${icon_with_text("edit-primary", "编辑")}</button><button class="wux-btn wux-btn-primary" type="button" onclick="add_comment(${comment_data.cid},gebi('reply-content-${comment_data.cid}').value).then();" id="rel-btn-${comment_data.cid}" style="margin-left:3px">发表</button>${pasteToUpload.gen_upload_btn("reply-content-"+comment_data.cid, "md")}${emotionBar.gen_open_btn("reply-content-"+comment_data.cid, "md")}<span id="reply-result-${comment_data.cid}" style="color:#aa0000;margin-left:3px"></span></div></div>`;

    // 递归处理回复
    if (comment_data.replies) {
        for (let reply_id in comment_data.replies) {
            html_output += read_comment(comment_data.replies[reply_id], indent_level + 1);
        }
    }
    
    return html_output;
}
function ts2str(timestamp) {
    let date = new Date(1000 * timestamp);
    return date.getFullYear() + "-" + 
           ("0" + (date.getMonth() + 1)).slice(-2) + "-" + 
           ("0" + date.getDate()).slice(-2) + " " + 
           ("0" + date.getHours()).slice(-2) + ":" + 
           ("0" + date.getMinutes()).slice(-2) + ":" + 
           ("0" + date.getSeconds()).slice(-2);
}
function show_edit_window(comment_id) {
    gebi("edit-div-" + comment_id).hidden = false;
    gebi("comment-html-" + comment_id).hidden = true;
    gebi("save-edit-btn-" + comment_id).hidden = false;
    gebi("cancel-edit-btn-" + comment_id).hidden = false;
    gebi("edit-btn-" + comment_id).hidden = true;
    gebi(`edit-${comment_id}-preview-btn`).hidden = false;
    gebi(`edit-upload-btn-${comment_id}`).hidden = false;
}
function hide_edit_window(comment_id) {
    gebi("edit-div-" + comment_id).hidden = true;
    gebi("comment-html-" + comment_id).hidden = false;
    gebi("save-edit-btn-" + comment_id).hidden = true;
    gebi("cancel-edit-btn-" + comment_id).hidden = true;
    gebi("edit-btn-" + comment_id).hidden = false;
    gebi(`edit-${comment_id}-preview-btn`).hidden = true;
    gebi(`edit-${comment_id}-edit-btn`).hidden = true;
    gebi("edit-preview-" + comment_id).hidden = true;
    gebi(`edit-upload-btn-${comment_id}`).hidden = true;
}
function save_edition(comment_id) {
    let edited_content = gebi("edit-content-" + comment_id).value;
    
    if (edited_content === "") {
        gebi("edit-result-" + comment_id).innerHTML = "编辑内容不能为空!";
        return;
    }
    
    if (edited_content === gebi("origin-content-" + comment_id).value) {
        gebi("edit-result-" + comment_id).innerHTML = "你没有修改任何东西!";
        return;
    }

    // 禁用按钮并显示加载状态
    set_btn_html(gebi("save-edit-btn-" + comment_id), "请稍候");
    gebi("cancel-edit-btn-" + comment_id).disabled = true;
    gebi(`edit-${comment_id}-preview-btn`).disabled = true;
    gebi(`edit-${comment_id}-edit-btn`).disabled = true;

    let xhr = new XMLHttpRequest();
    xhr.open("POST", domain + "/api/edit_comment", true);
    xhr.setRequestHeader("Content-Type", "application/json");
    xhr.send(JSON.stringify({
        access_token: localStorage["access-token"],
        cid: comment_id,
        content: edited_content
    }));

    xhr.onreadystatechange = function() {
        if (xhr.readyState === 4) {
            // 恢复按钮状态
            set_btn_html(gebi("save-edit-btn-" + comment_id));
            gebi("cancel-edit-btn-" + comment_id).disabled = false;
            gebi(`edit-${comment_id}-preview-btn`).disabled = false;
            gebi(`edit-${comment_id}-edit-btn`).disabled = false;

            let response = JSON.parse(xhr.responseText);
            if (response.success) {
                gebi("edit-result-" + comment_id).innerHTML = "保存成功!";
                get_all_comment().then();
            } else {
                gebi("edit-result-" + comment_id).innerHTML = response.message;
            }
        }
    };
}
function show_reply_window(e) {
    null == localStorage["access-token"] ? (localStorage.login_redirect = window.location.href,
    window.location = "/login") : (gebi("reply-btn-" + e).disabled = !0,
    gebi("comment-window-" + e).hidden = !1,load_comment_draft(e))
}
function change_page(e) {
    for (var t = document.getElementsByClassName("cp-btn"), n = 0; n < t.length; n++)
        t[n].disabled = !0;
    comment_page_index = e,
    get_all_comment().then()
}
function show_image(e) {
    e.src = e.getAttribute("src_"),
    e.hidden = !1
}
var comment_page_index = 0
  , nurl = window.location.href.split("?")
  , place_id = 114514;
if (2 === nurl.length) {
    var args = nurl[1].split("&")
      , place_id = args[0];
    is_in_array(args, "comments-only") && function() {
        for (var e = document.getElementsByClassName("hco"), t = 0; t < e.length; t++)
            e[t].hidden = !0
    }();
    for (var scroll_to = void 0, i = 0; i < args.length; i++) {
        var t = args[i].split("=");
        2 === t.length && "scroll_to" === t[0] && (scroll_to = t[1])
    }
}
function load_comment_draft(reply_to){
    function apply_draft(content){
        if (!content){
            return;
        }
        if (reply_to === -1){
            gebi("content").value = content;
        }else{
            gebi(`reply-content-${reply_to}`).value = content;
        }
    }
    function show_error_msg(msg){
        if (reply_to === -1){
            gebi("result0").innerHTML = msg;
        }else{
            gebi(`reply-result-${reply_to}`).innerHTML = msg;
        }
    }
    var access_token = localStorage.getItem("access-token");
    if (!access_token){
        return;
    }
    var data = {"place_id": place_id, "reply_to": reply_to, "access_token": access_token};
    fetch_data(domain+"/api/get_comment_draft", "POST", headers, JSON.stringify(data)).then(function(val){
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
function save_comment_draft(textarea, reply_to){
    function show_error_msg(msg){
        if (reply_to === -1){
            gebi("result0").innerHTML = msg;
        }else{
            gebi(`reply-result-${reply_to}`).innerHTML = msg;
        }
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
    var content = textarea.value;
    if (!content){
        return;
    }
    var data = {"place_id": place_id, "reply_to": reply_to, "content": content, "access_token": access_token};
    fetch_data(domain+"/api/save_comment_draft", "POST", headers, JSON.stringify(data)).then(function(val){
        var rsp = JSON.parse(val.response_text);
        if (!rsp.success){
            show_error_msg("无法保存草稿:"+rsp.message);
        }
    }, function(val){
        show_error_msg("无法保存草稿:"+val.message);
    });
}
async function get_notification_count(){
    var access_token = localStorage.getItem("access-token");
    if (!access_token){
        return;
    }
    var rsp = await fetch_data(domain+"/api/count_unread_notification", "POST", headers, JSON.stringify({"access_token": access_token})).catch((err)=>{console.warn("failed to fetch notification count.")});
    if (!rsp.response_text){
        return;
    }
    var ret = JSON.parse(rsp.response_text);
    if (ret.success){
        gebi("notification-count").innerHTML = ret.data.count.toString();
        gebi("notification-count").hidden = ret.data.count === 0;
    }else{
        console.warn(ret.message);
    }
}
get_notification_count().then();
get_all_comment().then();
