var headers = {"Content-Type": "application/json"};

function gebi(eleid){
    return document.getElementById(eleid);
}

function gebcn(class_name){
    return document.getElementsByClassName(class_name);
}

function fetch_data(url, method, headers, data){
    var promise = new Promise(function(resolve, reject){
        var http = new XMLHttpRequest;
        http.open(method, url, true);
        for (var header in headers){
            http.setRequestHeader(header, headers[header]);
        }
        try{
            if (method === "GET"){
                http.send();
            }else{
                http.send(data);
            }
        }catch(error){
            reject({"message": error.name+error.message});
        }
        http.onreadystatechange = function(){
            if (http.readyState === 4){
                if (http.status === 0){
                    reject({"message": "网络错误"})
                }else{
                    resolve({"response_text": http.responseText, "status_code": http.status});
                }
            }
        }
        http.onerror = function(){
            reject({"message": "网络错误"});
        }
    });
    return promise;
}

function fetch_api(endpoint, payload){
    return new Promise(function(resolve, reject){
        fetch_data(endpoint, "POST", headers, JSON.stringify(payload)).then(function(val){
            try{
                var rsp = JSON.parse(val.response_text);
            }catch(err){
                resolve({"retcode": -1, "msg": err, "data": null});
            }
            var ret = {"retcode": rsp.success?0:-2, "msg": rsp.message, "data": rsp.data};
            for (var key in rsp){
                if (!["success", "message"].includes(key) && ret[key] === undefined){
                    ret[key] = rsp[key];
                }
            }
            resolve(ret);
        }, function(val){
            resolve({"retcode": -3, "msg": val.message, "data": null})
        });
    });
}

class FormSubmitter {
    constructor(url, form_data, is_rsp_json, onprogress) {
        this.url = url;
        this.form_data = form_data;
        this.is_rsp_json = is_rsp_json;
        this.onprogress = onprogress;
    }

    async send() {
        return new Promise((resolve) => {
            const xhr = new XMLHttpRequest();
            xhr.open("POST", this.url, true);

            xhr.upload.onprogress = (event) => {
                if (this.onprogress && event.lengthComputable) {
                    this.onprogress(event.loaded / event.total);
                }
            };

            xhr.onload = () => {
                if (this.is_rsp_json){
                    try{
                        var rsp = JSON.parse(xhr.responseText);
                    }catch(err){
                        resolve({
                            retcode: -1,
                            msg: err,
                            data: null
                        });
                    }
                    let ret = {
                        retcode: rsp.success?0:-2,
                        msg: rsp.message,
                        data: rsp.data
                    };
                    for (let key in rsp){
                        if (!["success", "message"].includes(key) && ret[key] === undefined){
                            ret[key] = rsp[key];
                        }
                    }
                    resolve(ret);
                }else{
                    resolve({
                        retcode: 0,
                        data: xhr.responseText,
                    });
                }
            };

            xhr.onerror = () => {
                resolve({
                    retcode: -3,
                    msg: "网络错误",
                    data: null
                });
            };

            xhr.onabort = () => {
                resolve({
                    retcode: -4,
                    msg: "操作被用户取消",
                    data: null
                });
            };

            xhr.send(this.form_data);
            this.xhr = xhr;
        });
    }

    abort() {
        if (this.xhr) {
            this.xhr.abort();
        }
    }
}

function is_in(chr, str){
    for (var t in str){
        if (chr === str[t]){
            return true;
        }
    }
    return false;
}
function include(ele, list){
    for (var e = 0;e < list.length;e++){
        if (ele === list[e]){
            return true;
        }
    }
    return false;
}
function ts2str(e) {
    e = new Date(1e3 * e);
    return e.getFullYear() + "-" + ("0" + (e.getMonth() + 1)).slice(-2) + "-" + ("0" + e.getDate()).slice(-2) + " " + ("0" + e.getHours()).slice(-2) + ":" + ("0" + e.getMinutes()).slice(-2) + ":" + ("0" + e.getSeconds()).slice(-2)
}
function rsc(e) {
    return e ? e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;") : e;
}
function get_url_args(){
    var url = window.location.href;
    var ret = {};
    if (url.includes("?")){
        var args = url.split("?").slice(1).join("?").split("&");
        for (var index in args){
            var arg = args[index];
            if (arg.includes("=")){
                var kv = arg.split("=");
                ret[kv[0]] = kv.slice(1).join("=");
            }else{
                ret[arg] = null;
            }
        }
    }
    return ret;
}
function check_logged_in(){
    if (localStorage.getItem("access-token") === null){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
        return true;
    }
    return false;
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
function get_element_abs_pos_center(el) {
    if (!el) return null;

    const rect = el.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2 + window.scrollX;
    const centerY = rect.top + rect.height / 2 + window.scrollY;

    return { x: centerX, y: centerY };
}
function icon_with_text(icon_name, text, size){
    if (!size){
        size = 16;
    }
    return `<img src="/static/image/icon/${icon_name}.svg" alt="" width="${size}px" height="${size}px" class="middle"><span class="middle">${text}</span>`;
}
function set_btn_html(ele, html){
    if (html){
        var loading_words = ["请稍候", "...", "正在上传"];
        for (var i in loading_words){
            var t = loading_words[i];
            html = html.replaceAll(t, '<span class="wux-loading"></span>');
        }
        if (!ele.getAttribute("old_html")){
            ele.setAttribute("old_html", ele.innerHTML);
        }
        ele.innerHTML = html;
        ele.disabled = true;
    }else{
        if (ele.getAttribute("old_html")){
            ele.innerHTML = ele.getAttribute("old_html");
            ele.removeAttribute("old_html");
        }
        ele.disabled = false;
    }
}
String.prototype.replaceAll = function(e, t) {
    return this.split(e).join(t);
}

function b642link(b64, type){
    var file_bytes = atob(b64);
    var file_bytes_array = new Uint8Array(file_bytes.length);
    for (var i=0; i < file_bytes.length; i++){
        file_bytes_array[i] = file_bytes.charCodeAt(i);
    }
    var file_blob = new Blob([file_bytes_array], {"type": type});
    var file_url = URL.createObjectURL(file_blob);
    return file_url;
}

function input_file2b64(file){
    return new Promise(function(resolve, reject){
        var file_reader = new FileReader();
        file_reader.readAsDataURL(file);
        file_reader.onload = function(){
            resolve(this.result.split(",")[1]);
        }
    });
}

// 已弃用
// function update_highlight(parent){
//    if (parent){
//         var hl_ele = parent.querySelectorAll(".marked-highlight");
//     }else{
//         var hl_ele = gebcn("marked-highlight");
//     }
//     for (var i=0; i<hl_ele.length; i++){
//         var ele = hl_ele[i];
//         hljs.highlightElement(ele);
//     }
// }

function insert_into_textarea(text, textarea, select_text){
    var start_pos = textarea.selectionStart;
    var end_pos = textarea.selectionEnd;
    var old_text = textarea.value;
    var new_text = old_text.substring(0, start_pos) + text + old_text.substring(end_pos, old_text.length);
    textarea.value = new_text;
    if (select_text){
        textarea.setSelectionRange(start_pos, start_pos + text.length);
    }else{
        textarea.setSelectionRange(start_pos + text.length, start_pos + text.length);
    }
}

function insert_into_textarea_position(text, textarea, start_pos, end_pos, select_text){
    var old_text = textarea.value;
    var new_text = old_text.substring(0, start_pos) + text + old_text.substring(end_pos, old_text.length);
    textarea.value = new_text;
    if (select_text){
        textarea.setSelectionRange(start_pos, start_pos + text.length);
        return [start_pos, start_pos + text.length];
    }else{
        textarea.setSelectionRange(start_pos + text.length, start_pos + text.length);
        return [start_pos + text.length, start_pos + text.length];
    }
}

function is_in_array(e, t) {
    for (var n = 0; n < e.length; n++)
        if (e[n] === t)
            return true;
    return false
}

function add_markdown_tips(){
    var markdown_tips = "\n提示:\n1. 支持Markdown语法、LaTeX语法\n2. 可直接粘贴图片到输入框，会自动上传\n3. 更多用法请见论坛置顶帖子";
    var textareas = gebcn("marked-textarea");
    for (var i=0;i<textareas.length;i++){
        var textarea = textareas[i];
        if (textarea.getAttribute("placeholder") && !textarea.getAttribute("markdown-tips-set")){
            textarea.setAttribute("placeholder", textarea.getAttribute("placeholder")+markdown_tips);
            textarea.setAttribute("markdown-tips-set", "true");
        }
    }
}

async function load_script(url){
    var rsp = await fetch_data(url, "GET", {});
    eval(rsp.response_text);
}

function copy_text(text, btn){
    navigator.clipboard.writeText(text);
    set_btn_html(btn, "已复制");
    setTimeout(set_btn_html, 1000, btn);
}

function gen_randint(a, b) {
    return Math.floor(Math.random() * (b - a + 1)) + a;
}

function gen_continuous_random(a, b){
    return Math.random() * (b - a) + a;
}

async function captcha_v3(){
    const captcha = new SaobbyCaptchaV3({
        apiBaseUrl: "https://captcha-v3.saobby.com",
        once: true
    });
    return await captcha.verify();
}

function gen_captcha_v3(){
    return new SaobbyCaptchaV3({
        apiBaseUrl: "https://captcha-v3.saobby.com",
        once: true
    });
}

add_markdown_tips();
