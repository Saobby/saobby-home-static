const headers = {"Content-Type": "application/json"};

export function fetch_data(url, method, headers, data){
    return new Promise(function (resolve, reject) {
        const http = new XMLHttpRequest;
        http.open(method, url, true);
        for (let header in headers) {
            http.setRequestHeader(header, headers[header]);
        }
        try {
            if (method === "GET") {
                http.send();
            } else {
                http.send(data);
            }
        } catch (error) {
            reject({"message": error.name + error.message});
        }
        http.onreadystatechange = function () {
            if (http.readyState === 4) {
                if (http.status === 0) {
                    reject({"message": "网络错误"})
                } else {
                    resolve({
                        "response_text": http.responseText,
                        "status_code": http.status
                    });
                }
            }
        }
        http.onerror = function () {
            reject({"message": "网络错误"});
        }
    });
}

export function fetch_api(endpoint, payload){
    return new Promise(function(resolve, reject){
        fetch_data(endpoint, "POST", headers, JSON.stringify(payload)).then(function(val){
            try{
                var rsp = JSON.parse(val.response_text);
            }catch(err){
                resolve({
                    "retcode": -1,
                    "msg": err,
                    "data": null
                });
            }
            const ret = {
                "retcode": rsp.success ? 0: -2,
                "msg": rsp.message,
                "data": rsp.data
            };
            for (let key in rsp){
                if (!["success", "message"].includes(key) && ret[key] === undefined){
                    ret[key] = rsp[key];
                }
            }
            resolve(ret);
        }, function(val){
            resolve({
                "retcode": -3,
                "msg": val.message,
                "data": null
            });
        });
    });
}

export class FormSubmitter {
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

export function ts2str(e) {
    e = new Date(1e3 * e);
    return e.getFullYear() + "-" + ("0" + (e.getMonth() + 1)).slice(-2) + "-" + ("0" + e.getDate()).slice(-2) + " " + ("0" + e.getHours()).slice(-2) + ":" + ("0" + e.getMinutes()).slice(-2) + ":" + ("0" + e.getSeconds()).slice(-2)
}

export function check_logged_in(){
    if (localStorage.getItem("access-token") === null){
        localStorage.login_redirect = window.location.href;
        window.location = "/login";
        return true;
    }
    return false;
}
export function rsc(e) {
    return e ? e.replaceAll("&", "&amp;").replaceAll("<", "&lt;").replaceAll(">", "&gt;").replaceAll('"', "&quot;") : e;
}
export function gebi(eleid){
    return document.getElementById(eleid);
}
export function gebcn(classname){
    return document.getElementsByClassName(classname);
}