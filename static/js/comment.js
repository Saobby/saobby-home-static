function is_in_array(e, t) {
    for (var n = 0; n < e.length; n++)
        if (e[n] === t) return !0;
    return !1
}

function get_element_abs_pos2(e) {
    for (var t = e.offsetTop, n = e.offsetLeft; e = e.offsetParent;) t += e.offsetTop, n += e.offsetLeft;
    return {
        left: n,
        top: t
    }
}

function show_comment_window() {
    if (null == localStorage["access-token"]) return localStorage.login_redirect = window.location.href, void(window.location = "/login");
    document.getElementById("comment-window")
        .hidden = !1
}

function add_root_comment() {
    var e = document.getElementById("content")
        .value;
    "" != e ? (get_captcha_img(), document.getElementById("captcha-window")
            .hidden = !1, args = {
                place_id: place_id,
                access_token: localStorage["access-token"],
                content: e,
                reply_to: -1
            }) : document.getElementById("result0")
        .innerHTML = "评论不能为空!"
}

function complete_captcha() {
    -1 == args.reply_to ? (document.getElementById("rel-btn")
        .disabled = !0, document.getElementById("rel-btn")
        .innerHTML = "请稍候") : (document.getElementById(`rel-btn-${args.reply_to}`)
        .disabled = !0, document.getElementById(`rel-btn-${args.reply_to}`)
        .innerHTML = "请稍候");
    var e = new XMLHttpRequest;
    e.open("POST", "https://fast-comment.saobby.com/api/post_comment", !0), e.setRequestHeader("Content-Type", "application/json"), args.captcha_token = document.getElementById("captcha-token")
        .value, e.send(JSON.stringify(args)), e.onreadystatechange = function() {
            if (4 == e.readyState) {
                var t = JSON.parse(e.responseText);
                t.success ? (-1 == args.reply_to ? (document.getElementById("result0")
                        .innerHTML = "评论发送成功!", document.getElementById("content")
                        .value = "", comment_page_index = 0, get_all_comment()) : (document.getElementById(`reply-result-${args.reply_to}`)
                        .innerHTML = "评论发送成功!", document.getElementById(`reply-content-${args.reply_to}`)
                        .value = ""), get_all_comment()) : -1 == args.reply_to ? document.getElementById("result0")
                    .innerHTML = t.message : document.getElementById(`reply-result-${args.reply_to}`)
                    .innerHTML = t.message, -1 == args.reply_to ? (document.getElementById("rel-btn")
                        .disabled = !1, document.getElementById("rel-btn")
                        .innerHTML = "发表") : (document.getElementById(`rel-btn-${args.reply_to}`)
                        .disabled = !1, document.getElementById(`rel-btn-${args.reply_to}`)
                        .innerHTML = "发表")
            }
        }
}

function get_all_comment() {
    var e = new XMLHttpRequest;
    e.open("POST", "https://fast-comment.saobby.com/api/get_comment", !0), e.setRequestHeader("Content-Type", "application/json");
    var t = {
        place_id: place_id,
        amount_per_page: 8,
        page_index: comment_page_index,
        access_token: localStorage["access-token"],
        scroll_to: scroll_to
    };
    e.send(JSON.stringify(t)), e.onreadystatechange = function() {
        if (4 == e.readyState) {
            var t = JSON.parse(e.responseText);
            if (t.success) {
                var n = "";
                for (var o in t.data) n += read_comment(t.data[o], 0);
                comment_page_index = t.comment_data.page_index - 1, document.getElementById("comment-area")
                    .innerHTML = n, document.getElementById("page_index")
                    .innerHTML = t.comment_data.page_index, document.getElementById("page_amount")
                    .innerHTML = t.comment_data.page_amount, scroll_to && window.scrollTo(get_element_abs_pos2(document.getElementById(`comment-area-${scroll_to}`))), scroll_to && (scroll_to = void 0);
                var a = t.comment_data.page_index - 2,
                    l = t.comment_data.page_index + 2;
                t.comment_data.page_index - 2 < 1 && (a = 1), t.comment_data.page_index + 2 > t.comment_data.page_amount && (l = t.comment_data.page_amount);
                var d = "";
                1 != a && (d += '<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(0);">«</button>');
                for (var c = a; c <= l; c++) d += `<button class="${c==t.comment_data.page_index?"wux-btn cp-btn":"wux-btn cp-btn wux-btn-outline"}" onclick="change_page(${c-1});">${c}</button>`;
                l != t.comment_data.page_amount && (d += `<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(${t.comment_data.page_amount-1});">»</button>`), document.getElementById("change-page-btn")
                    .innerHTML = d
            } else document.getElementById("comment-area")
                .innerHTML = "无法获取到评论,因为:" + t.message
        }
    }
}

function read_comment(e, t) {
    var n = "",
        o = e.content,
        a = marked.parse(o),
        l = e.username.replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;"),
        d = e.reply_to,
        c = o.replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;");
    for (var r in n += `<div style="position:relative;left:${40*t}px;" id="comment-area-${e.cid}"><div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><img src="${e.avatar_url}" width="32px" height="32px"><b style="position:relative;top:-17px;left:5px;">${l}</b><span style="color:#777777;position:relative;top:-17px;left:5px;"> ${e.modify_time?"编辑于":"发表于"} ${e.modify_time?ts2str(e.modify_time):ts2str(e.timestamp)} #${e.cid}</span><br>`, -1 != d && (n += `<span style="color:#777777" onclick="window.scrollTo(get_element_abs_pos2(document.getElementById('comment-area-${e.reply_to}')))">回复 #${e.reply_to}</span><br>`), n += `<pre id="comment-md-${e.cid}" hidden>${c}</pre><div id="edit-div-${e.cid}" hidden><textarea class="wux-form-input wux-form-input-md" placeholder="编辑 #${e.cid} (支持Markdown语法)" rows="5" id="edit-content-${e.cid}">${c}</textarea></div><div class="comment-content" id="comment-html-${e.cid}">${a}</div><button onclick="show_reply_window(${e.cid})" class="wux-btn wux-btn-primary wux-btn-sm" id="reply-btn-${e.cid}">回复</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="view-md-${e.cid}" onclick="document.getElementById('comment-md-${e.cid}').hidden=!1;document.getElementById('comment-html-${e.cid}').hidden=!0;document.getElementById('view-html-${e.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" ${e.can_edit?"hidden":""}>查看M↓</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="view-html-${e.cid}" onclick="document.getElementById('comment-md-${e.cid}').hidden=!0;document.getElementById('comment-html-${e.cid}').hidden=!1;document.getElementById('view-md-${e.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" hidden>查看M↓</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="edit-btn-${e.cid}" onclick="show_edit_window(${e.cid})" style="margin-left:3px" ${e.can_edit?"":"hidden"}>编辑</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="cancel-edit-btn-${e.cid}" onclick="hide_edit_window(${e.cid})" style="margin-left:3px" hidden>取消</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="save-edit-btn-${e.cid}" onclick="save_edition(${e.cid})" style="margin-left:3px" hidden>保存</button><span id="edit-result-${e.cid}" style="color:#aa0000;margin-left:3px"></span></div><div id="comment-window-${e.cid}" hidden><textarea class="wux-form-input wux-form-input-md" placeholder="回复 #${e.cid} (支持Markdown语法)" rows="5" id="reply-content-${e.cid}"></textarea><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="document.getElementById('comment-window-${e.cid}').hidden=!0;document.getElementById('reply-btn-${e.cid}').disabled=!1;" type="button">取消</button><button class="wux-btn wux-btn-primary" type="button" onclick="add_reply_comment(${e.cid},document.getElementById('reply-content-${e.cid}').value)" id="rel-btn-${e.cid}" style="margin-left:3px">发表</button><span id="reply-result-${e.cid}" style="color:#aa0000;margin-left:3px"></span></div></div>`, e.replies) n += read_comment(e.replies[r], t + 1);
    return n
}

function ts2str(e) {
    var t = new Date(1e3 * e);
    return t.getFullYear() + "-" + ("0" + (t.getMonth() + 1))
        .slice(-2) + "-" + ("0" + t.getDate())
        .slice(-2) + " " + ("0" + t.getHours())
        .slice(-2) + ":" + ("0" + t.getMinutes())
        .slice(-2) + ":" + ("0" + t.getSeconds())
        .slice(-2)
}

function show_edit_window(cid){
    document.getElementById(`edit-div-${cid}`).hidden=false;
    document.getElementById(`comment-html-${cid}`).hidden=true;
    document.getElementById(`save-edit-btn-${cid}`).hidden=false;
    document.getElementById(`cancel-edit-btn-${cid}`).hidden=false;
    document.getElementById(`edit-btn-${cid}`).hidden=true;
}
function hide_edit_window(cid){
    document.getElementById(`edit-div-${cid}`).hidden=true;
    document.getElementById(`comment-html-${cid}`).hidden=false;
    document.getElementById(`save-edit-btn-${cid}`).hidden=true;
    document.getElementById(`cancel-edit-btn-${cid}`).hidden=true;
    document.getElementById(`edit-btn-${cid}`).hidden=false;
}
function save_edition(cid){
    document.getElementById(`save-edit-btn-${cid}`).disabled=true;
    document.getElementById(`cancel-edit-btn-${cid}`).disabled=true;
    document.getElementById(`save-edit-btn-${cid}`).innerHTML="请稍候";
    var content = document.getElementById(`edit-content-${cid}`).value;
    var e = new XMLHttpRequest;
    e.open("POST", "https://fast-comment.saobby.com/api/edit_comment", !0);
    e.setRequestHeader("Content-Type", "application/json");
    e.send(JSON.stringify({access_token: localStorage["access-token"], 
    cid: cid, content: content}));
    e.onreadystatechange = function() {
            if (4 == e.readyState) {
                document.getElementById(`save-edit-btn-${cid}`).disabled=false;
    document.getElementById(`cancel-edit-btn-${cid}`).disabled=false;
    document.getElementById(`save-edit-btn-${cid}`).innerHTML="保存";
                var t = JSON.parse(e.responseText);
                if (t.success){
                    document.getElementById(`edit-result-${cid}`).innerHTML="保存成功!";
                    get_all_comment();
                }else{
                    document.getElementById(`edit-result-${cid}`).innerHTML=t.message;
                }
            }
        }
}

function show_reply_window(e) {
    if (null == localStorage["access-token"]) return localStorage.login_redirect = window.location.href, void(window.location = "/login");
    document.getElementById(`reply-btn-${e}`)
        .disabled = !0;
    
    document.getElementById(`comment-window-${e}`)
        .hidden = !1
}

function add_reply_comment(e, t) {
    "" != t ? (get_captcha_img(), document.getElementById("captcha-window")
            .hidden = !1, args = {
                place_id: place_id,
                access_token: localStorage["access-token"],
                content: t,
                reply_to: e
            }) : document.getElementById(`reply-result-${e}`)
        .innerHTML = "评论不能为空!"
}

function change_page(e) {
    for (var t = document.getElementsByClassName("cp-btn"), n = 0; n < t.length; n++) t[n].disabled = !0;
    comment_page_index = e, get_all_comment()
}

function show_image(e) {
    e.src = e.getAttribute("src_"), e.hidden = !1
}
String.prototype.replaceAll = function(e, t) {
    return this.replace(new RegExp(e, "gm"), t)
};
var comment_page_index = 0,
    nurl = window.location.href.split("?"),
    place_id = 114514;
if (2 === nurl.length) {
    var args = nurl[1].split("&");
    place_id = args[0], is_in_array(args, "comments-only") && (document.getElementById("contact")
        .hidden = !0, document.getElementById("tools")
        .hidden = !0);
    for (var scroll_to = void 0, i = 0; i < args.length; i++) {
        var t = args[i].split("=");
        2 === t.length && "scroll_to" === t[0] && (scroll_to = t[1])
    }
}
get_all_comment();
var mdr = new marked.Renderer;
mdr.image = function(e, t, n) {
    var o = Math.random();
    return `<img src_="${e}" alt="${n}" title="${t||""}" class="marked-img" id="marked-img-${o}" hidden><a onclick="show_image(document.getElementById('marked-img-${o}'));this.hidden=true;" href="javascript:;">点击加载外部图片</a>`
}, mdr.table = function(e, t) {
    return '<table class="wux-table">\n<thead>\n' + e + "</thead>\n" + (t = t && "<tbody>" + t + "</tbody>") + "</table>\n"
}, marked.setOptions({
    tables: !0,
    sanitize: !0,
    smartLists: !0,
    silent: !0,
    renderer: mdr
});