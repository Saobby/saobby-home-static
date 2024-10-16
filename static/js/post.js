var domain = "https://comments.saobby.com";
var post_data = {};
var comments_data = {};
var args = get_url_args();
var last_save_draft = 0;
function load_post(){
    if (!args.pid){
        gebi("loading-result").innerHTML = "无法加载帖子,因为:参数错误";
        return;
    }
    var send_data = {"name": args.pid};
    if (args.v){
        send_data.version = parseInt(args.v);
    }
    if (localStorage.getItem("access-token")){
        send_data.access_token = localStorage.getItem("access-token");
    }
    fetch_data(domain+"/api/get_post_details", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            post_data = rep.data;
            gebi("author").innerHTML = rsc(rep.data.author);
            gebi("post-title").innerHTML = rsc(rep.data.title);
            gebi("title-input").value = rep.data.title;
            gebi("html").innerHTML = marked.parse(rep.data.content);
            gebi("markdown").innerHTML = rsc(rep.data.content);
            gebi("content-input").value = rep.data.content;
            gebi("release-time").innerHTML = ts2str(rep.data.modify_time);
            gebi("version").innerHTML = rep.data.version.toString();
            gebi("is-history").hidden = rep.data.is_history;
            gebi("pinned").hidden = !rep.data.is_pinned;
            gebi("status").innerHTML = rep.data.is_closed?'<img src="/static/image/icon/lock-red.svg" width="36px" alt="[已关闭]" class="middle">':'<img src="/static/image/icon/circle-dot-green.svg" width="36px" alt="[开放]" class="middle">';
            gebi("status").setAttribute("style", rep.data.is_closed?"color:#AA0000;":"color:#00AA00;");
            gebi("loves").innerHTML = rep.data.loves.toString();
            gebi("views").innerHTML = rep.data.views.toString();
            gebi("delete-btn").hidden = !rep.data.permissions.can_delete;
            gebi("close-btn").hidden = !rep.data.permissions.can_close;
            gebi("open-btn").hidden = !rep.data.permissions.can_open;
            gebi("pin-btn").hidden = !rep.data.permissions.can_pin;
            gebi("unpin-btn").hidden = !rep.data.permissions.can_unpin;
            gebi("edit-btn").hidden = !rep.data.permissions.can_edit;
            gebi("add-tag-btn").hidden = !rep.data.permissions.can_edit;
            gebi("view-markdown-btn").hidden = rep.data.permissions.can_edit;
            gebi("loading-div").hidden = true;
            gebi("post-view-div").hidden = false;
            gebi("loved").innerHTML = rep.data.loved?'<img src="/static/image/icon/thumb-up-filled-white.svg" width="16px" alt="已赞" class="middle">':'<img src="/static/image/icon/thumb-up-white.svg" width="16px" alt="点赞" class="middle">';
            gebi("love-btn").disabled = false;
            var tags_html = "";
            for (var ti in rep.data.tags){
                var tag = rep.data.tags[ti];
                tags_html += `<span class="wux-tag simple">${rsc(tag)}<span class="wux-tag-close post-tags-close-btn" onclick="remove_tag(${ti});" ${rep.data.permissions.can_edit?"":"hidden"}>×</span></span>`;
            }
            gebi("tags-div").innerHTML = tags_html?tags_html:"无";
            comments_load(0, args.cid?parseInt(args.cid):null);
            load_comment_draft(-1);
        }else{
            gebi("loading-result").innerHTML = "无法加载帖子,因为:"+rep.message;
            gebi("loading-div").hidden = false;
            gebi("post-view-div").hidden = true;
        }
    }, function(val){
        gebi("loading-result").innerHTML = "无法加载帖子,因为:"+val.message;
        gebi("loading-div").hidden = false;
        gebi("post-view-div").hidden = true;
    });
}
async function add_tag(){
    var tag = await prompt("添加标签", "请输入希望添加的标签:", true);
    if (tag === null){
        gebi("tag-result").innerHTML = "操作被用户取消";
        return;
    }
    var tags = post_data.tags.slice(0);
    tags.push(tag);
    save_tags(tags);
}
function remove_tag(index){
    var tags = post_data.tags.slice(0);
    tags.splice(index, 1);
    save_tags(tags);
}
function save_tags(tags){
    function set_buttons_status(status){
        if (status){
            set_btn_html(gebi("add-tag-btn"), "...");
        }else{
            set_btn_html(gebi("add-tag-btn"));
        }
        var btn = gebcn("post-tags-close-btn");
        for (var i=0;i<btn.length;i++){
            btn[i].hidden = status;
        }
    }
    var send_data = {"access_token": localStorage["access-token"], "name": args.pid, "tags": tags};
    set_buttons_status(true);
    fetch_data(domain+"/api/set_post_tags", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            gebi("tag-result").innerHTML = "设置成功";
            load_post();
        }else{
            gebi("tag-result").innerHTML = rep.message;
        }
        set_buttons_status(false);
    }, function(val){
        gebi("tag-result").innerHTML = val.message;
        set_buttons_status(false);
    });
}
function edit_post(mode){
    gebi("edit-btn").hidden = mode;
    gebi("cancel-edit-btn").hidden = !mode;
    gebi("title-input").hidden = !mode;
    gebi("post-title-h1").hidden = mode;
    gebi("content-input").hidden = !mode;
    gebi("html").hidden = mode;
    gebi("preview-btn").hidden = !mode;
    gebi("close-preview-btn").hidden = true;
    gebi("preview-html").hidden = true;
    gebi("save-edit-btn").hidden = !mode;
    gebi("edit-upload-btn-span").hidden = !mode;
    gebi("edit-emotions-btn-span").hidden = !mode;
}
function preview(mode){
    gebi("preview-btn").hidden = mode;
    gebi("close-preview-btn").hidden = !mode;
    gebi("preview-html").innerHTML = marked.parse(gebi("content-input").value);
    gebi("preview-html").hidden = !mode;
    gebi("content-input").hidden = mode;
}
async function save_edit(){
    var title = gebi("title-input").value;
    var content = gebi("content-input").value;
    if (title === "" || content === ""){
        gebi("operate-result").innerHTML = "标题和正文均不能为空";
        return;
    }
    if (content === post_data.content && title === post_data.title){
        gebi("operate-result").innerHTML = "你没有修改任何东西";
        return;
    }
    var description = await prompt("保存编辑", "请填写编辑摘要/原因:", true);
    if (description === null){
        gebi("operate-result").innerHTML = "用户取消了保存";
        return;
    }
    gebi("content-input").disabled = true;
    gebi("title-input").disabled = true;
    set_btn_html(gebi("save-edit-btn"), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("save-edit-btn"), "请稍候");
        var send_data = {"access_token": localStorage.getItem("access-token"), "name": args.pid, "title": title, "content": content, "description": description, "captcha_token": gebi("scpc-token").value};
        fetch_data(domain+"/api/edit_post", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                gebi("operate-result").innerHTML = "编辑成功";
                if (args.v){
                    window.location = "/post/?pid="+args.pid;
                }else{
                    edit_post(false);
                    load_post();
                }
            }else{
                gebi("operate-result").innerHTML = rep.message;
            }
            gebi("content-input").disabled = false;
            gebi("title-input").disabled = false;
            set_btn_html(gebi("save-edit-btn"));
        }, function(val2){
            gebi("operate-result").innerHTML = val2.message;
            gebi("content-input").disabled = false;
            gebi("title-input").disabled = false;
            set_btn_html(gebi("save-edit-btn"));
        });
    }, function(val){
        gebi("operate-result").innerHTML = "请先完成人机验证:"+val.message;
        gebi("content-input").disabled = false;
        gebi("title-input").disabled = false;
        set_btn_html(gebi("save-edit-btn"));
    });
}
function view_markdown(mode){
    gebi("view-markdown-btn").hidden = mode;
    gebi("view-markdown-btn-pressed").hidden = !mode;
    gebi("markdown").hidden = !mode;
    gebi("html").hidden = mode;
}
function love(){
    if (check_logged_in()){
        return;
    }
    gebi("loved").innerHTML = "请稍候";
    gebi("love-btn").disabled = true;
    var send_data = {"access_token": localStorage.getItem("access-token"), "name": args.pid, "value": !post_data.loved};
    fetch_data(domain+"/api/love_post", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
            if (rep.success){
                load_post();
            }else{
                gebi("operate-result").innerHTML = rep.message;
                gebi("love-btn").disabled = false;
                gebi("loved").innerHTML = post_data.loved?'<img src="/static/image/icon/thumb-up-filled-white.svg" width="16px" alt="已赞" class="middle">':'<img src="/static/image/icon/thumb-up-white.svg" width="16px" alt="点赞" class="middle">';
            }
    }, function(val){
        gebi("operate-result").innerHTML = val.message;
        gebi("love-btn").disabled = false;
        gebi("loved").innerHTML = post_data.loved?'<img src="/static/image/icon/thumb-up-filled-white.svg" width="16px" alt="已赞" class="middle">':'<img src="/static/image/icon/thumb-up-white.svg" width="16px" alt="点赞" class="middle">';
    });
}
async function operate(action){
    if (action === "close"){
        var conf = await confirm("警告!", "你确定要关闭这个帖子吗?关闭后你将无法再打开!");
        if (!conf){
            gebi("operate-result").innerHTML = "操作被用户取消";
            return;
        }
    }
    var eid = action+"-btn";
    var origin_text = gebi(eid).innerHTML;
    set_btn_html(gebi(eid), "请稍候");
    var send_data = {"access_token": localStorage.getItem("access-token"), "name": args.pid, "action": action};
    fetch_data(domain+"/api/operate_post", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
            if (rep.success){
                gebi("operate-result").innerHTML = "操作成功";
                if (action === "delete"){
                    window.location = "/posts";
                }else{
                    load_post();
                }
            }else{
                gebi("operate-result").innerHTML = rep.message;
            }
            set_btn_html(gebi(eid));
    }, function(val){
        gebi("operate-result").innerHTML = val.message;
        set_btn_html(gebi(eid));
    });
}
function show_history(){
    set_btn_html(gebi("view-history-btn"), "...");
    gebi("history-div").hidden = false;
    gebi("history-content-div").innerHTML = "正在加载编辑记录...";
    load_history(0);
}
function close_history(){
    set_btn_html(gebi("view-history-btn"));
    gebi("history-div").hidden = true;
}
function load_history(page_index){
    var send_data = {"name": args.pid, "page_index": page_index, "page_size": 3};
    var cp_btn = gebcn("history-cp-btn");
    for (var a=0; a<cp_btn.length; a++){
        cp_btn[a].disabled = true;
    }
    fetch_data(domain+"/api/get_edit_history", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
            if (rep.success){
                var html = "";
                for (var i in rep.data.history){
                    var h = rep.data.history[i];
                    html += `<b>${icon_with_text("versions", "V"+(h.version).toString())}</b><span style="color:#777;"> ${icon_with_text("clock-grey", ts2str(h.timestamp))}</span><br><span ${h.description?"":"hidden"}>${icon_with_text("file-description", rsc(h.description))}</span><a href="/post/?pid=${args.pid}&v=${h.version}" target="_blank" ${post_data.version===h.version?"hidden":""}><button class="wux-btn wux-btn-primary wux-btn-xs" style="margin-left:10px" type="button">${icon_with_text("eye-white", "查看此版本")}</button></a><i style="color:#777;" ${post_data.version===h.version?"":"hidden"}> (当前版本)</i><hr>`;
                }
                gebi("history-content-div").innerHTML = html;
                gebi("history-page-index").innerHTML = (rep.data.page_index+1).toString();
                gebi("history-page-amount").innerHTML = rep.data.page_amount.toString();
                gen_cp_buttons(rep.data.page_index+1, rep.data.page_amount, 7, function(n){load_history(n-1);}, gebi("history-change-page-btn"), "wux-btn history-cp-btn", "wux-btn wux-btn-outline history-cp-btn");

            }else{
                gebi("history-content-div").innerHTML = "无法加载编辑记录,因为:"+rep.message;
            }
            for (var a=0; a<cp_btn.length; a++){
                cp_btn[a].disabled = false;
            }
    }, function(val){
        gebi("history-content-div").innerHTML = "无法加载编辑记录,因为:"+val.message;
        for (var a=0; a<cp_btn.length; a++){
            cp_btn[a].disabled = false;
        }
    });
}
function comments_preview(cid, mode){
    var cid = cid.toString();
    gebi("comments-preview-"+cid).innerHTML = marked.parse(gebi("comments-content-"+cid).value);
    gebi("comments-content-"+cid).hidden = mode;
    gebi("comments-preview-"+cid).hidden = !mode;
    gebi("comments-preview-btn-"+cid).hidden = mode;
    gebi("comments-edit-btn-"+cid).hidden = !mode;
}
function comments_release(reply_to) {
    function set_buttons_status(status){
        gebi("comments-content-"+reply_to).disabled = status;
        gebi("comments-cancel-btn-"+reply_to).disabled = status;
    }
    var reply_to = reply_to.toString();
    var content = gebi("comments-content-"+reply_to).value;
    if (content === ""){
        gebi("comments-result-"+reply_to).innerHTML = "评论内容不能为空";
        return;
    }
    set_buttons_status(true);
    set_btn_html(gebi("comments-release-btn-"+reply_to), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("comments-release-btn-"+reply_to), "请稍候");
        fetch_data(domain+"/api/post_comment", "POST", headers, JSON.stringify({"place_id": post_data.comment_place_id, "access_token": localStorage["access-token"], "content": content, "reply_to": parseInt(reply_to), "captcha_token": gebi("scpc-token").value})).then(function(val2){
            var ret = JSON.parse(val2.response_text);
            if (ret.success){
                gebi("comments-result-"+reply_to).innerHTML = "发送成功";
                gebi("comments-content-"+reply_to).value = "";
                gebi("comments-preview-"+reply_to).innerHTML = "";
                comments_load(reply_to==="-1"?0:comments_data.common.page_index, null);
            }else{
                gebi("comments-result-"+reply_to).innerHTML = ret.message;
            }
            set_buttons_status(false);
            set_btn_html(gebi("comments-release-btn-"+reply_to));
        }, function(val2){
            gebi("comments-result-"+reply_to).innerHTML = val2.message;
            set_buttons_status(false);
            set_btn_html(gebi("comments-release-btn-"+reply_to));
        });
    }, function(val){
        gebi("comments-result-"+reply_to).innerHTML = "请先完成验证码:"+val.message;
        set_buttons_status(false);
        set_btn_html(gebi("comments-release-btn-"+reply_to));
    });
}
function comments_load(page_index, comment_id){
    function parse_comments(comments_obj, layer){
        var ret = "";
        for (var i in comments_obj){
            var comment = comments_obj[i];
            ret += `<div style="position:relative;left:${20 * layer}px;" id="comment-div-${comment.cid}"><div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><img src="${comment.avatar_url}" alt="用户头像" width="32px" height="32px"><b style="position:relative;top:-17px;left:5px;">${comment.nickname ? rsc(comment.nickname) : rsc(comment.username)}</b><span style="color:#777777;position:relative;top:-17px;left:5px;" class="middle"> <img src="/static/image/icon/mail-check-grey.svg" width="16px" alt="(已绑定电子邮箱)" title="此用户已绑定电子邮箱" class="middle" ${comment.is_email_checked?"":"hidden"}> ${comment.modify_time ? '<img src="/static/image/icon/pencil-check-grey.svg" width="16px" alt="(已编辑)" title="(已编辑)" class="middle"> <img src="/static/image/icon/clock-grey.svg" width="16px" alt="编辑时间" class="middle">' : '<img src="/static/image/icon/clock-grey.svg" width="16px" alt="发表时间" class="middle">'}${comment.modify_time ? ts2str(comment.modify_time) : ts2str(comment.timestamp)} #${comment.cid}</span><br><span style="color:#777777" class="middle" onclick="window.scrollTo(get_element_abs_pos2(gebi('comment-div-${comment.reply_to}')))" ${comment.reply_to===-1?"hidden":""}><img src="/static/image/icon/corner-down-right-grey.svg" alt="" width="16px" class="middle">回复 #${comment.reply_to}</span><br ${comment.reply_to===-1?"hidden":""}><div id="comment-markdown-${comment.cid}" class="pre-like-code" hidden>${rsc(comment.content)}</div><textarea id="comment-origin-content-${comment.cid}" hidden>${rsc(comment.content)}</textarea><textarea class="wux-form-input wux-form-input-md marked-textarea" placeholder="编辑 #${comment.cid} 最多1024字" rows="5" id="comment-edit-content-${comment.cid}" hidden>${rsc(comment.content)}</textarea><div id="comment-edit-preview-${comment.cid}" class="pre-like"  hidden></div><div class="comment-content" id="comment-html-${comment.cid}">${marked.parse(comment.content)}</div><i style="color:#777777;" ${comment.is_read===null?"hidden":""}>${comment.is_read!==null?(comment.is_read?"已读("+ts2str(comment.read_time)+")":"未读"):""}</i><br ${comment.is_read === null? "hidden": ""}><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" id="comment-reply-btn-${comment.cid}" onclick="comments_reply_window(${comment.cid},true);">${icon_with_text("message-reply-white", "回复")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline simple" id="comment-view-md-btn-${comment.cid}" onclick="comments_markdown(${comment.cid},true);" ${comment.can_edit ? "hidden" : ""}>${icon_with_text("markdown-primary", "查看M↓")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm simple" id="comment-view-html-btn-${comment.cid}" onclick="comments_markdown(${comment.cid},false);" hidden>${icon_with_text("markdown-white", "查看M↓")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline simple" id="comment-edit-btn-${comment.cid}" onclick="comments_edit(${comment.cid},true);" ${comment.can_edit ? "" : "hidden"}>${icon_with_text("edit-primary", "编辑")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline simple" id="comment-cancel-edit-btn-${comment.cid}" onclick="comments_edit(${comment.cid},false);" hidden>${icon_with_text("x-primary", "取消")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline simple" onclick="comments_edit_preview(${comment.cid},true);" id="comment-preview-btn-${comment.cid}" hidden>${icon_with_text("eye-primary", "预览")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm wux-btn-outline simple" onclick="comments_edit_preview(${comment.cid},false);" id="comment-close-preview-btn-${comment.cid}" hidden>${icon_with_text("edit-primary", "编辑")}</button><button type="button" class="wux-btn wux-btn-primary wux-btn-sm simple" id="comment-save-edit-btn-${comment.cid}" onclick="comments_save_edit(${comment.cid});" hidden>${icon_with_text("check-white", "保存")}</button><span id="edit-comment-upload-btn-span-${comment.cid}" hidden>${pasteToUpload.gen_upload_btn("comment-edit-content-"+comment.cid,"sm")}${emotionBar.gen_open_btn("comment-edit-content-"+comment.cid,"sm")}</span><span id="comment-edit-result-${comment.cid}" class="result simple"></span></div><div id="comment-reply-div-${comment.cid}" hidden><textarea class="wux-form-input wux-form-input-md marked-textarea" placeholder="回复 #${comment.cid} 最多1024字" rows="5" id="comments-content-${comment.cid}" onchange="save_comment_draft(this,${comment.cid});"></textarea><div id="comments-preview-${comment.cid}" class="pre-like" hidden></div><button class="wux-btn wux-btn-primary wux-btn-outline" onclick="comments_reply_window(${comment.cid},false);" type="button" id="comments-cancel-btn-${comment.cid}">${icon_with_text("x-primary", "取消")}</button><button class="wux-btn wux-btn-primary wux-btn-outline simple" onclick="comments_preview(${comment.cid},true);" type="button" id="comments-preview-btn-${comment.cid}">${icon_with_text("eye-primary", "预览")}</button><button class="wux-btn wux-btn-primary wux-btn-outline simple" onclick="comments_preview(${comment.cid},false);" type="button" id="comments-edit-btn-${comment.cid}" hidden>${icon_with_text("edit-primary", "编辑")}</button><button class="wux-btn wux-btn-primary simple" type="button" onclick="comments_release(${comment.cid});" id="comments-release-btn-${comment.cid}">发表</button><span id="release-comment-upload-btn-span-${comment.cid}">${pasteToUpload.gen_upload_btn("comments-content-"+comment.cid, "md")}${emotionBar.gen_open_btn("comments-content-"+comment.cid, "md")}</span><span id="comments-result-${comment.cid}" class="result simple"></span></div></div>`;
            ret += parse_comments(comment.replies, layer+1);
        }
        return ret;
    }
    var send_data = {"place_id": post_data.comment_place_id, "amount_per_page": 8, "page_index": page_index};
    if (comment_id !== null){
        send_data.scroll_to = comment_id;
    }
    if (localStorage.getItem("access-token")){
        send_data.access_token = localStorage["access-token"];
    }
    var cp_btn = gebcn("comments-cp-btn");
    for (var q=0;q<cp_btn.length;q++){
        cp_btn[q].disabled = true;
    }
    fetch_data(domain+"/api/get_comment", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            comments_data.common = {"page_index": rep.comment_data.page_index-1, "page_amount": rep.comment_data.page_amount};
            comments_data.comments = rep.data;
            var html = parse_comments(rep.data, 0);
            gebi("comments-view-div").innerHTML = html?html:`<span style="color:#777;">还没有评论</span>`;
            gebi("comments-page-index").innerHTML = rep.comment_data.page_index.toString();
            gebi("comments-page-amount").innerHTML = rep.comment_data.page_amount.toString();
            gen_cp_buttons(rep.comment_data.page_index, rep.comment_data.page_amount, 7, function(i){comments_load(i-1, null);}, gebi("comments-change-page-div"), "wux-btn comments-cp-btn", "wux-btn wux-btn-outline comments-cp-btn");
            pasteToUpload.init();
            add_markdown_tips();
            if (comment_id){
                window.scrollTo(get_element_abs_pos2(gebi(`comment-div-${comment_id}`)));
            }
        }else{
            gebi("comments-view-div").innerHTML = "无法获取到评论,因为:"+rep.message;
        }
        for (var q=0;q<cp_btn.length;q++){
            cp_btn[q].disabled = false;
        }
    }, function(val){
        gebi("comments-view-div").innerHTML = "无法获取到评论,因为:"+val.message;
        for (var q=0;q<cp_btn.length;q++){
            cp_btn[q].disabled = false;
        }
    })
}
function comments_save_edit(cid){
    function set_buttons_status(status){
        gebi(`comment-cancel-edit-btn-${cid}`).disabled = status;
        gebi(`comment-edit-content-${cid}`).disabled = status;
    }
    var content = gebi(`comment-edit-content-${cid}`).value;
    if (content === ""){
        gebi(`comment-edit-result-${cid}`).innerHTML = "评论内容不能为空";
        return;
    }
    if (content === gebi(`comment-origin-content-${cid}`).value){
        gebi(`comment-edit-result-${cid}`).innerHTML = "你没有修改任何东西";
        return;
    }
    set_buttons_status(true);
    set_btn_html(gebi(`comment-save-edit-btn-${cid}`), "请稍候");
    var send_data = {"access_token": localStorage["access-token"], "cid": cid, "content": content};
    fetch_data(domain+"/api/edit_comment", "POST", headers, JSON.stringify(send_data)).then(function(val){
        var rep = JSON.parse(val.response_text);
        if (rep.success){
            gebi(`comment-edit-result-${cid}`).innerHTML = "编辑成功";
            comments_load(comments_data.common.page_index, null);
        }else{
            gebi(`comment-edit-result-${cid}`).innerHTML = rep.message;
        }
        set_buttons_status(false);
        set_btn_html(gebi(`comment-save-edit-btn-${cid}`));
    }, function(val){
        gebi(`comment-edit-result-${cid}`).innerHTML = val.message;
        set_buttons_status(false);
        set_btn_html(gebi(`comment-save-edit-btn-${cid}`));
    });
}
function comments_reply_window(cid, mode){
    if (check_logged_in()){
        return;
    }
    gebi(`comment-reply-btn-${cid}`).disabled = mode;
    gebi(`comment-reply-div-${cid}`).hidden = !mode;
    load_comment_draft(cid);
}
function comments_edit(cid, mode){
    gebi(`comment-edit-btn-${cid}`).hidden = mode;
    gebi(`comment-cancel-edit-btn-${cid}`).hidden = !mode;
    gebi(`comment-edit-content-${cid}`).hidden = !mode;
    gebi(`comment-edit-preview-${cid}`).hidden = true;
    gebi(`comment-html-${cid}`).hidden = mode;
    gebi(`comment-preview-btn-${cid}`).hidden = !mode;
    gebi(`comment-close-preview-btn-${cid}`).hidden = true;
    gebi(`comment-save-edit-btn-${cid}`).hidden = !mode;
    gebi(`edit-comment-upload-btn-span-${cid}`).hidden = !mode;
}
function comments_edit_preview(cid, mode){
    var cid = cid.toString();
    gebi("comment-edit-preview-"+cid).innerHTML = marked.parse(gebi("comment-edit-content-"+cid).value);
    gebi("comment-edit-content-"+cid).hidden = mode;
    gebi("comment-edit-preview-"+cid).hidden = !mode;
    gebi("comment-preview-btn-"+cid).hidden = mode;
    gebi("comment-close-preview-btn-"+cid).hidden = !mode;
}
function comments_markdown(cid, mode){
    gebi(`comment-view-md-btn-${cid}`).hidden = mode;
    gebi(`comment-view-html-btn-${cid}`).hidden = !mode;
    gebi(`comment-markdown-${cid}`).hidden = !mode;
    gebi(`comment-html-${cid}`).hidden = mode;
}
function load_comment_draft(reply_to){
    function apply_draft(content){
        if (!content){
            return;
        }
        gebi(`comments-content-${reply_to}`).value = content;
    }
    function show_error_msg(msg){
        gebi(`comments-result-${reply_to}`).innerHTML = msg;
    }
    var access_token = localStorage.getItem("access-token");
    if (!access_token){
        return;
    }
    var data = {"place_id": post_data.comment_place_id, "reply_to": reply_to, "access_token": access_token};
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
        gebi(`comments-result-${reply_to}`).innerHTML = msg;
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
    var data = {"place_id": post_data.comment_place_id, "reply_to": reply_to, "content": content, "access_token": access_token};
    fetch_data(domain+"/api/save_comment_draft", "POST", headers, JSON.stringify(data)).then(function(val){
        var rsp = JSON.parse(val.response_text);
        if (!rsp.success){
            show_error_msg("无法保存草稿:"+rsp.message);
        }
    }, function(val){
        show_error_msg("无法保存草稿:"+val.message);
    });
}
load_post();
!function(){
    var t = localStorage.getItem("access-token") === null;
    gebi("comments-release-btn--1").disabled = t;
    gebi("comments-login-btn").hidden = !t;
}();
