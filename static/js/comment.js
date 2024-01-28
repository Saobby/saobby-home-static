var domain = "https://comments.saobby.com";
function is_in_array(e, t) {
    for (var n = 0; n < e.length; n++)
        if (e[n] === t)
            return true;
    return false
}
function get_element_abs_pos2(e) {
    for (var t = e.offsetTop, n = e.offsetLeft; e = e.offsetParent; )
        t += e.offsetTop,
        n += e.offsetLeft;
    return {
        left: n,
        top: t
    }
}
function show_comment_window() {
    if (!(localStorage["access-token"])){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
    }else{
        gebi("comment-window").hidden = false;
    }
}
function add_comment(reply_to, content) {
//    var e = gebi("content").value;
    if (content != ""){
//        get_captcha_img();
//        gebi("captcha-window").hidden = false;
//        args = {
//            place_id: place_id,
//            access_token: localStorage["access-token"],
//            content: e,
//            reply_to: -1
//        }
        if (reply_to == -1){
            set_btn_html(gebi("rel-btn"), "请完成验证码");
            gebi("cancel-btn").disabled = true;
            gebi("content-preview-btn").disabled = true;
            gebi("content-edit-btn").disabled = true;
        }else{
            set_btn_html(gebi("rel-btn-" + reply_to), "请完成验证码");
            gebi(`content-${reply_to}-preview-btn`).disabled = true;
            gebi(`content-${reply_to}-edit-btn`).disabled = true;
            gebi("cancel-rp-" + reply_to).disabled = true;
        }

        saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
            if (reply_to == -1){
                set_btn_html(gebi("rel-btn"), "请稍候");
            }else{
                set_btn_html(gebi("rel-btn-" + reply_to), "请稍候");
            }
            fetch_data(domain+"/api/post_comment", "POST", headers, JSON.stringify({place_id: place_id,
                access_token: localStorage["access-token"],
                content: content,
                reply_to: reply_to,
                captcha_token: gebi("scpc-token").value
            })).then(function(val2){
                var ret = JSON.parse(val2.response_text);
                if (ret.success){
                    if (reply_to == -1){
                        gebi("result0").innerHTML = "评论发送成功!";
                        gebi("content").value = "";
                        gebi("content-preview").innerHTML = "";
                        comment_page_index = 0;
                    }else{
                        gebi("reply-result-" + reply_to).innerHTML = "评论发送成功!";
                        gebi("reply-content-" + reply_to).value = "";
                        gebi("content-preview-" + reply_to).innerHTML = "";
                    }
                    get_all_comment();
                }else{
                    if (reply_to == -1){
                        gebi("result0").innerHTML = ret.message;
                    }else{
                        gebi("reply-result-" + reply_to).innerHTML = ret.message;
                    }
                }
                if (reply_to == -1){
                    gebi("cancel-btn").disabled = false;
                    gebi("content-preview-btn").disabled = false;
                    gebi("content-edit-btn").disabled = false;
                    set_btn_html(gebi("rel-btn"));
                }else{
                    gebi(`content-${reply_to}-preview-btn`).disabled = false;
                    gebi(`content-${reply_to}-edit-btn`).disabled = false;
                    gebi("cancel-rp-" + reply_to).disabled = false;
                    set_btn_html(gebi("rel-btn-" + reply_to));
                }
            }, function(val2){
                if (reply_to == -1){
                    gebi("result0").innerHTML = val2.message;
                    gebi("cancel-btn").disabled = false;
                    gebi("content-preview-btn").disabled = false;
                    gebi("content-edit-btn").disabled = false;
                    set_btn_html(gebi("rel-btn"));
                }else{
                    gebi("reply-result-" + reply_to).innerHTML = val2.message;
                    gebi(`content-${reply_to}-preview-btn`).disabled = false;
                    gebi(`content-${reply_to}-edit-btn`).disabled = false;
                    gebi("cancel-rp-" + reply_to).disabled = false;
                    set_btn_html(gebi("rel-btn-" + reply_to));
                }
            });
        }, function(val){
            if (reply_to == -1){
                gebi("result0").innerHTML = "请先完成验证码:"+val.message;
                gebi("cancel-btn").disabled = false;
                gebi("content-preview-btn").disabled = false;
                gebi("content-edit-btn").disabled = false;
                set_btn_html(gebi("rel-btn"));
            }else{
                gebi("reply-result-" + reply_to).innerHTML = "请先完成验证码:"+val.message;
                gebi(`content-${reply_to}-preview-btn`).disabled = false;
                gebi(`content-${reply_to}-edit-btn`).disabled = false;
                gebi("cancel-rp-" + reply_to).disabled = false;
                set_btn_html(gebi("rel-btn-" + reply_to));
            }
        });
    }else{
        if (reply_to == -1){
            gebi("result0").innerHTML = "评论不能为空";
        }else{
            gebi("reply-result-" + reply_to).innerHTML = "评论不能为空";
        }
    }
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
function get_all_comment() {
    var l = new XMLHttpRequest
      , e = (l.open("POST", domain + "/api/get_comment", !0),
    l.setRequestHeader("Content-Type", "application/json"),
    {
        place_id: place_id,
        amount_per_page: 8,
        page_index: comment_page_index,
        access_token: localStorage["access-token"],
        scroll_to: scroll_to
    });
    l.send(JSON.stringify(e)),
    l.onreadystatechange = function() {
        if (4 == l.readyState) {
            var e = JSON.parse(l.responseText);
            if (e.success) {
                var t, n = "";
                for (t in e.data)
                    n += read_comment(e.data[t], 0);
                comment_page_index = e.comment_data.page_index - 1,
                gebi("comment-area").innerHTML = n,
                gebi("page_index").innerHTML = e.comment_data.page_index,
                gebi("page_amount").innerHTML = e.comment_data.page_amount,
                scroll_to && window.scrollTo(get_element_abs_pos2(gebi("comment-area-" + scroll_to))),
                scroll_to = scroll_to && void 0;
                var d = e.comment_data.page_index - 2
                  , i = e.comment_data.page_index + 2
                  , o = (e.comment_data.page_index - 2 < 1 && (d = 1),
                e.comment_data.page_index + 2 > e.comment_data.page_amount && (i = e.comment_data.page_amount),
                "");
                1 != d && (o += '<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(0);">«</button>');
                for (var c = d; c <= i; c++)
                    o += `<button class="${c == e.comment_data.page_index ? "wux-btn cp-btn" : "wux-btn cp-btn wux-btn-outline"}" onclick="change_page(${c - 1});">${c}</button>`;
                i != e.comment_data.page_amount && (o += `<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(${e.comment_data.page_amount - 1});">»</button>`),
                gebi("change-page-btn").innerHTML = o;
                pasteToUpload.init();
            } else
                gebi("comment-area").innerHTML = "无法获取到评论,因为:" + e.message
        }
    }
}
function read_comment(e, t) {
    var n, d = "", i = e.content, o = marked.parse(i), c = rsc(e.username), l = e.reply_to, i = rsc(i);
    for (n in d += `<div style="position:relative;left:${40 * t}px;" id="comment-area-${e.cid}"><div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><img src="${e.avatar_url}" width="32px" height="32px"><b style="position:relative;top:-17px;left:5px;">${e.nickname ? rsc(e.nickname) : c}</b><span style="color:#777777;position:relative;top:-17px;left:5px;" class="middle"> ${e.modify_time ? "(已编辑)" : ""} <img src="/static/image/icon/clock-grey.svg" width="16px" alt="发表时间" class="middle">${e.modify_time ? ts2str(e.modify_time) : ts2str(e.timestamp)} #${e.cid}</span><br>`,
    -1 != l && (d += `<span style="color:#777777" onclick="window.scrollTo(get_element_abs_pos2(gebi('comment-area-${e.reply_to}')))" class="middle">${icon_with_text("corner-down-right-grey", "回复 #"+e.reply_to.toString())}</span><br>`),
    d += `<div id="comment-md-${e.cid}" class="pre-like-code" hidden>${i}</div><div hidden><textarea id="origin-content-${e.cid}">${i}</textarea></div><div id="edit-div-${e.cid}" hidden><textarea class="wux-form-input wux-form-input-md marked-textarea" placeholder="编辑 #${e.cid} (支持Markdown语法)" rows="5" id="edit-content-${e.cid}">${i}</textarea></div><div id="edit-preview-${e.cid}" class="pre-like" hidden></div><div class="comment-content" id="comment-html-${e.cid}">${o}</div><i style="color:#777777;" ${e.is_read === null? "hidden": ""}>${e.is_read !== null ? (e.is_read ? "已读("+ts2str(e.read_time)+")": "未读"):""}</i><br ${e.is_read === null? "hidden": ""}><button onclick="show_reply_window(${e.cid})" class="wux-btn wux-btn-primary wux-btn-sm" id="reply-btn-${e.cid}">${icon_with_text("message-reply-white", "回复")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="view-md-${e.cid}" onclick="gebi('comment-md-${e.cid}').hidden=!1;gebi('comment-html-${e.cid}').hidden=!0;gebi('view-html-${e.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" ${e.can_edit ? "hidden" : ""}>${icon_with_text("markdown-primary", "查看M↓")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="view-html-${e.cid}" onclick="gebi('comment-md-${e.cid}').hidden=!0;gebi('comment-html-${e.cid}').hidden=!1;gebi('view-md-${e.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" hidden>${icon_with_text("markdown-white", "查看M↓")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="edit-btn-${e.cid}" onclick="show_edit_window(${e.cid})" style="margin-left:3px" ${e.can_edit ? "" : "hidden"}>${icon_with_text("edit-primary", "编辑")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="cancel-edit-btn-${e.cid}" onclick="hide_edit_window(${e.cid})" style="margin-left:3px" hidden>${icon_with_text("x-primary", "取消")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" onclick="gebi('edit-preview-${e.cid}').innerHTML=marked.parse(gebi('edit-content-${e.cid}').value);gebi('edit-preview-${e.cid}').hidden=false;gebi('edit-div-${e.cid}').hidden=true;this.hidden=true;gebi('edit-${e.cid}-edit-btn').hidden=false;" id="edit-${e.cid}-preview-btn" style="margin-left:3px" hidden>${icon_with_text("eye-primary", "预览")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" onclick="gebi('edit-preview-${e.cid}').hidden=true;gebi('edit-div-${e.cid}').hidden=false;this.hidden=true;gebi('edit-${e.cid}-preview-btn').hidden=false;" id="edit-${e.cid}-edit-btn" style="margin-left:3px" hidden>${icon_with_text("edit-primary", "编辑")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="save-edit-btn-${e.cid}" onclick="save_edition(${e.cid})" style="margin-left:3px" hidden>${icon_with_text("check-white", "保存")}</button><span id="edit-result-${e.cid}" style="color:#aa0000;margin-left:3px"></span></div><div id="comment-window-${e.cid}" hidden><div id="content-${e.cid}-div"><textarea class="wux-form-input wux-form-input-md marked-textarea" placeholder="回复 #${e.cid} (支持Markdown语法)" rows="5" id="reply-content-${e.cid}"></textarea></div><div id="content-preview-${e.cid}" class="pre-like" hidden></div><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="gebi('comment-window-${e.cid}').hidden=!0;gebi('reply-btn-${e.cid}').disabled=!1;" type="button" id="cancel-rp-${e.cid}">${icon_with_text("x-primary", "取消")}</button><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="gebi('content-preview-${e.cid}').innerHTML=marked.parse(gebi('reply-content-${e.cid}').value);gebi('content-preview-${e.cid}').hidden=false;gebi('content-${e.cid}-div').hidden=true;this.hidden=true;gebi('content-${e.cid}-edit-btn').hidden=false;" type="button" id="content-${e.cid}-preview-btn" style="margin-left:3px">${icon_with_text("eye-primary", "预览")}</button><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="gebi('content-preview-${e.cid}').hidden=true;gebi('content-${e.cid}-div').hidden=false;this.hidden=true;gebi('content-${e.cid}-preview-btn').hidden=false;" type="button" id="content-${e.cid}-edit-btn" style="margin-left:3px" hidden>${icon_with_text("edit-primary", "编辑")}</button><button class="wux-btn wux-btn-primary" type="button" onclick="add_comment(${e.cid},gebi('reply-content-${e.cid}').value)" id="rel-btn-${e.cid}" style="margin-left:3px">发表</button><span id="reply-result-${e.cid}" style="color:#aa0000;margin-left:3px"></span></div></div>`,
    e.replies)
        d += read_comment(e.replies[n], t + 1);
    return d
}
function ts2str(e) {
    e = new Date(1e3 * e);
    return e.getFullYear() + "-" + ("0" + (e.getMonth() + 1)).slice(-2) + "-" + ("0" + e.getDate()).slice(-2) + " " + ("0" + e.getHours()).slice(-2) + ":" + ("0" + e.getMinutes()).slice(-2) + ":" + ("0" + e.getSeconds()).slice(-2)
}
function show_edit_window(e) {
    gebi("edit-div-" + e).hidden = !1,
    gebi("comment-html-" + e).hidden = !0,
    gebi("save-edit-btn-" + e).hidden = !1,
    gebi("cancel-edit-btn-" + e).hidden = !1,
    gebi("edit-btn-" + e).hidden = !0,
    gebi(`edit-${e}-preview-btn`).hidden = !1
}
function hide_edit_window(e) {
    gebi("edit-div-" + e).hidden = !0,
    gebi("comment-html-" + e).hidden = !1,
    gebi("save-edit-btn-" + e).hidden = !0,
    gebi("cancel-edit-btn-" + e).hidden = !0,
    gebi("edit-btn-" + e).hidden = !1,
    gebi(`edit-${e}-preview-btn`).hidden = !0,
    gebi(`edit-${e}-edit-btn`).hidden = !0,
    gebi("edit-preview-" + e).hidden = !0
}
function save_edition(t) {
    var n, e = gebi("edit-content-" + t).value;
    "" !== e ? e !== gebi("origin-content-" + t).value ? (set_btn_html(gebi("save-edit-btn-" + t), "请稍候"),
    gebi("cancel-edit-btn-" + t).disabled = !0,
    gebi(`edit-${t}-preview-btn`).disabled = !0,
    gebi(`edit-${t}-edit-btn`).disabled = !0,
    (n = new XMLHttpRequest).open("POST", domain + "/api/edit_comment", !0),
    n.setRequestHeader("Content-Type", "application/json"),
    n.send(JSON.stringify({
        access_token: localStorage["access-token"],
        cid: t,
        content: e
    })),
    n.onreadystatechange = function() {
        var e;
        4 == n.readyState && (set_btn_html(gebi("save-edit-btn-" + t)),
        gebi("cancel-edit-btn-" + t).disabled = !1,
        gebi(`edit-${t}-preview-btn`).disabled = !1,
        gebi(`edit-${t}-edit-btn`).disabled = !1,
        (e = JSON.parse(n.responseText)).success ? (gebi("edit-result-" + t).innerHTML = "保存成功!",
        get_all_comment()) : gebi("edit-result-" + t).innerHTML = e.message)
    }
    ) : gebi("edit-result-" + t).innerHTML = "你没有修改任何东西!" : gebi("edit-result-" + t).innerHTML = "编辑内容不能为空!"
}
function show_reply_window(e) {
    null == localStorage["access-token"] ? (localStorage.login_redirect = window.location.href,
    window.location = "/login") : (gebi("reply-btn-" + e).disabled = !0,
    gebi("comment-window-" + e).hidden = !1)
}
function change_page(e) {
    for (var t = document.getElementsByClassName("cp-btn"), n = 0; n < t.length; n++)
        t[n].disabled = !0;
    comment_page_index = e,
    get_all_comment()
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
get_all_comment();
var mdr = new marked.Renderer;
mdr.image = function(src, title, alt) {
    var eid = "marked-generated-" + Math.random().toString();
    if (alt === "@Audio"){
        var media_type = "音频";
        var media_html = `<audio src_="${rsc(src)}" title="${title || ""}" class="marked-audio" preload="auto" id="${eid}" controls hidden>你的浏览器不支持使用AudioTag播放音频</audio>`;
    }else if (alt === "@Video"){
        var media_type = "视频";
        var media_html = `<video src_="${rsc(src)}" title="${title || ""}" class="marked-video" preload="auto" id="${eid}" controls hidden>你的浏览器不支持使用VideoTag播放视频</video>`;
    }else{
        var media_type = "图片";
        var media_html = `<img src_="${rsc(src)}" alt="${rsc(alt)}" title="${title || ""}" class="marked-img" id="${eid}" hidden>`;
    }
    var show_btn = `<a onclick="!function(t){var e=gebi('${eid}');e.src=e.getAttribute('src_');e.hidden=!1;t.hidden=!0}(this);" href="javascript:;">点击加载外部${media_type}</a>`;
    return media_html + show_btn;
}
mdr.table = function(e, t) {
    return '<table class="wux-table">\n<thead>\n' + e + "</thead>\n" + (t && "<tbody>" + t + "</tbody>") + "</table>\n"
}
,
mdr.codespan = function(e) {
    var t;
    return e.match(/^网易云音乐:\d+$/) ? (t = Math.random(),
    `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src_="https://music.163.com/outchain/player?type=2&id=${e.match(/\d+$/)[0]}&auto=0&height=66" id="music-player-${t}" hidden></iframe><a onclick="show_image(gebi('music-player-${t}'));this.hidden=true;" href="javascript:;">点击加载网易云音乐</a>`) : "<code>" + e + "</code>"
}
,
marked.setOptions({
    tables: !0,
    sanitize: !0,
    smartLists: !0,
    silent: !0,
    renderer: mdr,
    headerIds: false
}),
marked.use(markedKatex({
    throwOnError: !1
})),
marked.use(markedEmoji.markedEmoji({
    emojis: emojis,
    unicode: !1
}));
