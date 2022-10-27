function show_comment_window(){
if (localStorage["access-token"] == undefined){
window.location = "/login";
return;
}
document.getElementById("comment-window").hidden=false;
}

function add_root_comment(){
content = document.getElementById("content").value;
if (content == ""){
document.getElementById("result0").innerHTML="评论不能为空!";
return;
}
get_captcha_img();
document.getElementById("captcha-window").hidden=false;
args = {"place_id": 114514, "access_token": localStorage["access-token"], "content": content, "reply_to": -1};
}

function complete_captcha(){
if (args.reply_to == -1){
document.getElementById("rel-btn").disabled=true;
document.getElementById("rel-btn").innerHTML="请稍候";
}else{
document.getElementById(`rel-btn-${args.reply_to}`).disabled=true;
document.getElementById(`rel-btn-${args.reply_to}`).innerHTML="请稍候";
}
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://fast-comment.saobby.com/api/post_comment", true);
xhr.setRequestHeader("Content-Type", "application/json");
args["captcha_token"] = document.getElementById("captcha-token").value;
xhr.send(JSON.stringify(args));
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        ret_json = JSON.parse(xhr.responseText);
        if (ret_json.success){
        if (args.reply_to == -1){
            document.getElementById("result0").innerHTML="评论发送成功!";
            document.getElementById("content").value="";
            comment_page_index = 0;
            get_all_comment();}
        else{
            document.getElementById(`reply-result-${args.reply_to}`).innerHTML="评论发送成功!";
	    document.getElementById(`reply-content-${args.reply_to}`).value="";
        }
        get_all_comment();
        }else{
	    if (args.reply_to == -1){
            document.getElementById("result0").innerHTML=ret_json.message;}else{
	    document.getElementById(`reply-result-${args.reply_to}`).innerHTML=ret_json.message;
	}
        }
        if (args.reply_to == -1){
        document.getElementById("rel-btn").disabled=false;
	document.getElementById("rel-btn").innerHTML="发表";
	}else{
	document.getElementById(`rel-btn-${args.reply_to}`).disabled=false;
	document.getElementById(`rel-btn-${args.reply_to}`).innerHTML="发表";
	}
    }
}
}

comment_page_index = 0;
function get_all_comment(){
var xhr = new XMLHttpRequest();
xhr.open("POST", "https://fast-comment.saobby.com/api/get_comment", true);
xhr.setRequestHeader("Content-Type", "application/json");
req_data = {"place_id": 114514, "amount_per_page": 8, "page_index": comment_page_index};
xhr.send(JSON.stringify(req_data));
xhr.onreadystatechange = function() {
    if (xhr.readyState == 4) {
        ret_json = JSON.parse(xhr.responseText);
        if (ret_json.success){
            display = "";
            for (var i in ret_json.data){
                console.log(ret_json.data[i]);
                display=display+read_comment(ret_json.data[i], 0);
            }
            document.getElementById("comment-area").innerHTML=display;
            if (ret_json.data.length < 8){
                document.getElementById("next-page").disabled = true;
            }else{
		document.getElementById("next-page").disabled = false;
            }
            if (comment_page_index == 0){
                document.getElementById("prev-page").disabled = true;
            }else{
		document.getElementById("prev-page").disabled = false;
            }
        }else{
            document.getElementById("comment-area").innerHTML="无法获取到评论,因为:"+ret_json.message;
        }
    }
}
}

function read_comment(comment, tabs){
var ret = "";
content=comment.content;
content_html = marked.parse(content);
username=comment.username.replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;");
reply_to = comment.reply_to;
ret = ret + `<div style="position:relative;left:${tabs*40}px;" id="comment-area-${comment.cid}"><div style="border-bottom: 2px solid #ddd;padding:12px 16px;"><img src="${comment.avatar_url}" width="32px" height="32px"><b style="position:relative;top:-17px;left:5px;">${username}</b><span style="color:#777777;position:relative;top:-17px;left:5px;"> 发表于 ${ts2str(comment.timestamp)} #${comment.cid}</span><br>`;
if (!(reply_to==-1)){
ret = ret + `<span style="color:#777777">回复 #${comment.reply_to}</span><br>`;
}
ret = ret + `<div>${content_html}</div><button onclick="show_reply_window(${comment.cid})" class="wux-btn wux-btn-primary wux-btn-sm" id="reply-btn-${comment.cid}">回复</button></div></div>`;
for (var i in comment.replies){
    ret=ret+read_comment(comment.replies[i], tabs+1);
}
return ret;
}

function ts2str(ts){
var date = new Date(ts*1000);
var year = date.getFullYear(),
    month = ("0" + (date.getMonth() + 1)).slice(-2),
    sdate = ("0" + date.getDate()).slice(-2),
    hour = ("0" + date.getHours()).slice(-2),
    minute = ("0" + date.getMinutes()).slice(-2),
    second = ("0" + date.getSeconds()).slice(-2);
var result = year + "-"+ month +"-"+ sdate +" "+ hour +":"+ minute +":" + second;
return result;}

function show_reply_window(cid){
if (localStorage["access-token"] == undefined){
window.location = "/login";
return;
}
document.getElementById(`reply-btn-${cid}`).disabled=true;
ele = document.getElementById(`comment-area-${cid}`);
if (document.getElementById(`comment-window-${cid}`) == undefined){
addhtml = `<div id="comment-window-${cid}">
            <textarea class="wux-form-input wux-form-input-md" placeholder="回复 #${cid} (支持Markdown语法)" rows="5" id="reply-content-${cid}"></textarea>
            <button class="wux-btn wux-btn-primary wux-btn-outline" onclick="document.getElementById('comment-window-${cid}').hidden=true;document.getElementById('reply-btn-${cid}').disabled=false;" type="button">取消</button><button class="wux-btn wux-btn-primary" type="button" onclick="add_reply_comment(${cid},document.getElementById('reply-content-${cid}').value)" id="rel-btn-${cid}">发表</button>
            <span id="reply-result-${cid}" style="color:#aa0000"></span>
        </div>`;
ele.innerHTML = ele.innerHTML + addhtml;
}else{
document.getElementById(`comment-window-${cid}`).hidden=false;
}
}


function add_reply_comment(reply_to, content){
if (content == ""){
document.getElementById(`reply-result-${reply_to}`).innerHTML="评论不能为空!";
return;
}
get_captcha_img();
document.getElementById("captcha-window").hidden=false;
args = {"place_id": 114514, "access_token": localStorage["access-token"], "content": content, "reply_to": reply_to};
}
function change_page(i){
document.getElementById("next-page").disabled = true;
document.getElementById("prev-page").disabled = true;
comment_page_index = comment_page_index + i;
get_all_comment();
}

marked.setOptions({
      gfm: true,
      tables: true,
      breaks: false,
      pedantic: false,
      sanitize: true,
      smartLists: true,
      smartypants: false
    });
get_all_comment();
