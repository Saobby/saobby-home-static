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
