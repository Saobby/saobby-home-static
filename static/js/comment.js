var domain = "https://api-ry.saobby.com/comment";

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
    document.getElementById("comment-window").hidden = !1
}

function add_root_comment() {
    var e = document.getElementById("content").value;
    "" != e ? (get_captcha_img(), document.getElementById("captcha-window").hidden = !1, args = {
        place_id: place_id,
        access_token: localStorage["access-token"],
        content: e,
        reply_to: -1
    }) : document.getElementById("result0").innerHTML = "评论不能为空!"
}

function complete_captcha() {
    -1 == args.reply_to ? (document.getElementById("rel-btn").disabled = !0, document.getElementById("cancel-btn").disabled = !0, document.getElementById("content-preview-btn").disabled = !0, document.getElementById("content-edit-btn").disabled = !0, document.getElementById("rel-btn").innerHTML = "请稍候") : (document.getElementById(`rel-btn-${args.reply_to}`).disabled = !0, document.getElementById(`content-${args.reply_to}-preview-btn`).disabled = !0, document.getElementById(`content-${args.reply_to}-edit-btn`).disabled = !0, document.getElementById(`cancel-btn-${args.reply_to}`).disabled = !0, document.getElementById(`rel-btn-${args.reply_to}`).innerHTML = "请稍候");
    var e = new XMLHttpRequest;
    e.open("POST", domain + "/api/post_comment", !0), e.setRequestHeader("Content-Type", "application/json"), args.captcha_token = document.getElementById("captcha-token").value, e.send(JSON.stringify(args)), e.onreadystatechange = function() {
        if (4 == e.readyState) {
            var t = JSON.parse(e.responseText);
            t.success ? (-1 == args.reply_to ? (document.getElementById("result0").innerHTML = "评论发送成功!", document.getElementById("content").value = "", document.getElementById("content-preview").innerHTML = "", comment_page_index = 0, get_all_comment()) : (document.getElementById(`reply-result-${args.reply_to}`).innerHTML = "评论发送成功!", document.getElementById(`reply-content-${args.reply_to}`).value = "", document.getElementById(`content-preview-${args.reply_to}`).innerHTML = ""), get_all_comment()) : -1 == args.reply_to ? document.getElementById("result0").innerHTML = t.message : document.getElementById(`reply-result-${args.reply_to}`).innerHTML = t.message, -1 == args.reply_to ? (
                document.getElementById("rel-btn").disabled = !1, document.getElementById("cancel-btn").disabled = !1, document.getElementById("content-preview-btn").disabled = !1, document.getElementById("content-edit-btn").disabled = !1, 
            document.getElementById("rel-btn").innerHTML = "发表") : 
                (document.getElementById(`rel-btn-${args.reply_to}`).disabled = !1, document.getElementById(`content-${args.reply_to}-preview-btn`).disabled = !1, document.getElementById(`content-${args.reply_to}-edit-btn`).disabled = !1, document.getElementById(`cancel-btn-${args.reply_to}`).disabled = !1, document.getElementById(`rel-btn-${args.reply_to}`).innerHTML = "发表")
        }
    }
}

function get_all_comment() {
    var e = new XMLHttpRequest;
    e.open("POST", domain + "/api/get_comment", !0), e.setRequestHeader("Content-Type", "application/json");
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
                for (var d in t.data) n += read_comment(t.data[d], 0);
                comment_page_index = t.comment_data.page_index - 1, document.getElementById("comment-area").innerHTML = n, document.getElementById("page_index").innerHTML = t.comment_data.page_index, document.getElementById("page_amount").innerHTML = t.comment_data.page_amount, scroll_to && window.scrollTo(get_element_abs_pos2(document.getElementById(`comment-area-${scroll_to}`))), scroll_to && (scroll_to = void 0);
                var o = t.comment_data.page_index - 2,
                    i = t.comment_data.page_index + 2;
                t.comment_data.page_index - 2 < 1 && (o = 1), t.comment_data.page_index + 2 > t.comment_data.page_amount && (i = t.comment_data.page_amount);
                var a = "";
                1 != o && (a += '<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(0);">«</button>');
                for (var c = o; c <= i; c++) a += `<button class="${c==t.comment_data.page_index?"wux-btn cp-btn":"wux-btn cp-btn wux-btn-outline"}" onclick="change_page(${c-1});">${c}</button>`;
                i != t.comment_data.page_amount && (a += `<button class="wux-btn cp-btn wux-btn-outline" onclick="change_page(${t.comment_data.page_amount-1});">»</button>`), document.getElementById("change-page-btn").innerHTML = a
            } else document.getElementById("comment-area").innerHTML = "无法获取到评论,因为:" + t.message
        }
    }
}

function read_comment(e, t) {
    var n = "",
        d = e.content,
        o = marked.parse(d),
        i = e.username.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;"),
        a = e.reply_to,
        c = d.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
    for (var l in n += `<div style="position:relative;left:${40*t}px;" id="comment-area-${e.cid}"><div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><img src="${e.avatar_url}" width="32px" height="32px"><b style="position:relative;top:-17px;left:5px;">${e.nickname?e.nickname.replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;"):i}</b><span style="color:#777777;position:relative;top:-17px;left:5px;"> ${e.modify_time?"编辑于":"发表于"} ${e.modify_time?ts2str(e.modify_time):ts2str(e.timestamp)} #${e.cid}</span><br>`, 
         -1 != a && (n += `<span style="color:#777777" onclick="window.scrollTo(get_element_abs_pos2(document.getElementById('comment-area-${e.reply_to}')))">回复 #${e.reply_to}</span><br>`), 
         n += `<pre id="comment-md-${e.cid}" hidden>${c}</pre>
<div hidden>
    <textarea id="origin-content-${e.cid}">${c}</textarea>
</div>
<div id="edit-div-${e.cid}" hidden>
    <textarea class="wux-form-input wux-form-input-md" placeholder="编辑 #${e.cid} (支持Markdown语法)" rows="5" id="edit-content-${e.cid}">${c}</textarea>
</div>
<pre id="edit-preview-${e.cid}" hidden></pre>
<div class="comment-content" id="comment-html-${e.cid}">${o}</div>
<button onclick="show_reply_window(${e.cid})" class="wux-btn wux-btn-primary wux-btn-sm" id="reply-btn-${e.cid}">回复</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="view-md-${e.cid}" onclick="document.getElementById('comment-md-${e.cid}').hidden=!1;document.getElementById('comment-html-${e.cid}').hidden=!0;document.getElementById('view-html-${e.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" ${e.can_edit?"hidden":""}>查看M↓</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="view-html-${e.cid}" onclick="document.getElementById('comment-md-${e.cid}').hidden=!0;document.getElementById('comment-html-${e.cid}').hidden=!1;document.getElementById('view-md-${e.cid}').hidden=!1;this.hidden=!0;" style="margin-left:3px" hidden>查看M↓</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="edit-btn-${e.cid}" onclick="show_edit_window(${e.cid})" style="margin-left:3px" ${e.can_edit?"":"hidden"}>编辑</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" id="cancel-edit-btn-${e.cid}" onclick="hide_edit_window(${e.cid})" style="margin-left:3px" hidden>取消</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" onclick="document.getElementById('edit-preview-${e.cid}').innerHTML=marked.parse(document.getElementById('edit-content-${e.cid}').value);document.getElementById('edit-preview-${e.cid}').hidden=false;document.getElementById('edit-div-${e.cid}').hidden=true;this.hidden=true;document.getElementById('edit-${e.cid}-edit-btn').hidden=false;" id="edit-${e.cid}-preview-btn" hidden>预览</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline" onclick="document.getElementById('edit-preview-${e.cid}').hidden=true;document.getElementById('edit-div-${e.cid}').hidden=false;this.hidden=true;document.getElementById('edit-${e.cid}-preview-btn').hidden=false;" id="edit-${e.cid}-edit-btn" hidden>编辑</button>
<button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="save-edit-btn-${e.cid}" onclick="save_edition(${e.cid})" style="margin-left:3px" hidden>保存</button>
<span id="edit-result-${e.cid}" style="color:#aa0000;margin-left:3px"></span>
</div>
<div id="comment-window-${e.cid}" hidden>
    <div id="content-${e.cid}-div">
    	<textarea class="wux-form-input wux-form-input-md" placeholder="回复 #${e.cid} (支持Markdown语法)" rows="5" id="reply-content-${e.cid}"></textarea>
    </div>
    <pre id="content-preview-${e.cid}" hidden></pre>
    <button class="wux-btn wux-btn-primary wux-btn-outline" onclick="document.getElementById('comment-window-${e.cid}').hidden=!0;document.getElementById('reply-btn-${e.cid}').disabled=!1;" type="button" id="cancel-rp-{e.cid}">取消</button>
    <button class="wux-btn wux-btn-primary wux-btn-outline" onclick="document.getElementById('content-preview-${e.cid}').innerHTML=marked.parse(document.getElementById('reply-content-${e.cid}').value);document.getElementById('content-preview-${e.cid}').hidden=false;document.getElementById('content-${e.cid}-div').hidden=true;this.hidden=true;document.getElementById('content-${e.cid}-edit-btn').hidden=false;" type="button" id="content-${e.cid}-preview-btn">预览</button>
    <button class="wux-btn wux-btn-primary wux-btn-outline" onclick="document.getElementById('content-preview-${e.cid}').hidden=true;document.getElementById('content-${e.cid}-div').hidden=false;this.hidden=true;document.getElementById('content-${e.cid}-preview-btn').hidden=false;" type="button" id="content-${e.cid}-edit-btn" hidden>编辑</button>
    <button class="wux-btn wux-btn-primary" type="button" onclick="add_reply_comment(${e.cid},document.getElementById('reply-content-${e.cid}').value)" id="rel-btn-${e.cid}" style="margin-left:3px">发表</button>
    <span id="reply-result-${e.cid}" style="color:#aa0000;margin-left:3px"></span>
</div>
</div>`, e.replies) 
        n += read_comment(e.replies[l], t + 1);
    return n
}

function ts2str(e) {
    var t = new Date(1e3 * e);
    return t.getFullYear() + "-" + ("0" + (t.getMonth() + 1)).slice(-2) + "-" + ("0" + t.getDate()).slice(-2) + " " + ("0" + t.getHours()).slice(-2) + ":" + ("0" + t.getMinutes()).slice(-2) + ":" + ("0" + t.getSeconds()).slice(-2)
}

function show_edit_window(e) {
    document.getElementById(`edit-div-${e}`).hidden = !1, document.getElementById(`comment-html-${e}`).hidden = !0, document.getElementById(`save-edit-btn-${e}`).hidden = !1, document.getElementById(`cancel-edit-btn-${e}`).hidden = !1, document.getElementById(`edit-btn-${e}`).hidden = !0, document.getElementById(`edit-${e}-preview-btn`).hidden = false
}

function hide_edit_window(e) {
    document.getElementById(`edit-div-${e}`).hidden = !0, document.getElementById(`comment-html-${e}`).hidden = !1, document.getElementById(`save-edit-btn-${e}`).hidden = !0, document.getElementById(`cancel-edit-btn-${e}`).hidden = !0, document.getElementById(`edit-btn-${e}`).hidden = !1, document.getElementById(`edit-${e}-preview-btn`).hidden = true, document.getElementById(`edit-${e}-edit-btn`).hidden = true, document.getElementById(`edit-preview-${e}`).hidden = true
}

function save_edition(e) {
    var t = document.getElementById(`edit-content-${e}`).value;
    if ("" !== t)
        if (t !== document.getElementById(`origin-content-${e}`).value) {
            document.getElementById(`save-edit-btn-${e}`).disabled = !0, document.getElementById(`cancel-edit-btn-${e}`).disabled = !0, document.getElementById(`edit-${e}-preview-btn`).disabled = !0, document.getElementById(`edit-${e}-edit-btn`).disabled = !0, document.getElementById(`save-edit-btn-${e}`).innerHTML = "请稍候";
            var n = new XMLHttpRequest;
            n.open("POST", domain + "/api/edit_comment", !0), n.setRequestHeader("Content-Type", "application/json"), n.send(JSON.stringify({
                access_token: localStorage["access-token"],
                cid: e,
                content: t
            })), n.onreadystatechange = function() {
                if (4 == n.readyState) {
                    document.getElementById(`save-edit-btn-${e}`).disabled = !1, document.getElementById(`cancel-edit-btn-${e}`).disabled = !1, document.getElementById(`edit-${e}-preview-btn`).disabled = !1, document.getElementById(`edit-${e}-edit-btn`).disabled = !1, document.getElementById(`save-edit-btn-${e}`).innerHTML = "保存";
                    var t = JSON.parse(n.responseText);
                    t.success ? (document.getElementById(`edit-result-${e}`).innerHTML = "保存成功!", get_all_comment()) : document.getElementById(`edit-result-${e}`).innerHTML = t.message
                }
            }
        } else document.getElementById(`edit-result-${e}`).innerHTML = "你没有修改任何东西!";
    else document.getElementById(`edit-result-${e}`).innerHTML = "编辑内容不能为空!"
}

function show_reply_window(e) {
    if (null == localStorage["access-token"]) return localStorage.login_redirect = window.location.href, void(window.location = "/login");
    document.getElementById(`reply-btn-${e}`).disabled = !0, document.getElementById(`comment-window-${e}`).hidden = !1
}

function add_reply_comment(e, t) {
    "" != t ? (get_captcha_img(), document.getElementById("captcha-window").hidden = !1, args = {
        place_id: place_id,
        access_token: localStorage["access-token"],
        content: t,
        reply_to: e
    }) : document.getElementById(`reply-result-${e}`).innerHTML = "评论不能为空!"
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
    place_id = args[0], is_in_array(args, "comments-only") && function() {
        for (var e = document.getElementsByClassName("hco"), t = 0; t < e.length; t++) e[t].hidden = !0
    }();
    for (var scroll_to = void 0, i = 0; i < args.length; i++) {
        var t = args[i].split("=");
        2 === t.length && "scroll_to" === t[0] && (scroll_to = t[1])
    }
}
get_all_comment();
var mdr = new marked.Renderer;
mdr.image = function(e, t, n) {
    var d = Math.random();
    return `<img src_="${e}" alt="${n}" title="${t||""}" class="marked-img" id="marked-img-${d}" hidden><a onclick="show_image(document.getElementById('marked-img-${d}'));this.hidden=true;" href="javascript:;">点击加载外部图片</a>`
}, mdr.table = function(e, t) {
    return '<table class="wux-table">\n<thead>\n' + e + "</thead>\n" + (t = t && "<tbody>" + t + "</tbody>") + "</table>\n"
}, mdr.codespan = function(e) {
    if (e.match(/^网易云音乐:\d+$/)) {
        var t = Math.random();
        return `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src_="//music.163.com/outchain/player?type=2&id=${e.match(/\d+$/)[0]}&auto=0&height=66" id="music-player-${t}" hidden></iframe><a onclick="show_image(document.getElementById('music-player-${t}'));this.hidden=true;" href="javascript:;">点击加载网易云音乐</a>`
    }
    return "<code>" + e + "</code>"
}, marked.setOptions({
    tables: !0,
    sanitize: !0,
    smartLists: !0,
    silent: !0,
    renderer: mdr
}), marked.use(markedKatex({
    throwOnError: !1
}));
