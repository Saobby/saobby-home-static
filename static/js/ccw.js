var domain = "https://ccw.saobby.com";
var ticket = "";
var status = "waiting";

function show_error_msg(msg){
    gebi("error-msg").innerHTML = msg;
    gebi("notice-div").hidden = true;
    gebi("result-div").hidden = true;
    gebi("progress-div").hidden = true;
    gebi("error-div").hidden = false;
    set_btn_html(gebi("query-btn"));
}

function query(){
    var url = gebi("project-link").value;
    if (!url){
        show_error_msg("作品链接不能为空");
        return
    }
    set_btn_html(gebi("query-btn"), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        var send_data = {"url": url, "captcha_token": val.captcha_token};
        fetch_data(domain+"/api/get_ticket", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                ticket = rep.data.ticket;
                if (rep.data.ret_type === 0){
                    var releases_html = [];
                    for (var index in rep.data.releases){
                        var rel = rep.data.releases[index];
                        releases_html.push(`<b>${rel.ver?rel.ver:"V"+rel.sys_ver} </b><br><b>发布时间: </b><span>${ts2str(rel.ts/1e3)}</span><br><button type="button" class="wux-btn wux-btn-primary wux-btn-sm" onclick="select_release(this, ${index});">${icon_with_text("download-white", "下载")}</button> <span id="select-result-${index}" class="result"></span>`);
                    }
                    gebi("versions-div").innerHTML = releases_html.join("<hr>");
                    set_btn_html(gebi("query-btn"));
                    gebi("notice-div").hidden = true;
                    gebi("progress-div").hidden = true;
                    gebi("result-div").hidden = false;
                    gebi("error-div").hidden = true;
                }else{
                    status_processing();
                }
            }else{
                show_error_msg(rep.message);
            }
        }, function(val2){
            show_error_msg(val2.message);
        });
    }, function(val){
        show_error_msg("请先完成人机验证:"+val.message);
    });
}

function status_processing(){
    status = "processing";
    gebi("process").innerHTML = "";
    gebi("notice-div").hidden = true;
    gebi("progress-div").hidden = false;
    gebi("result-div").hidden = true;
    gebi("error-div").hidden = true;
    gebi("query-btn").disabled = true;
}

function select_release(btn_ele, index){
    set_btn_html(btn_ele, "请稍候");
    var send_data = {"ticket": ticket, "index": index};
    fetch_data(domain+"/api/select_release", "POST", headers, JSON.stringify(send_data)).then(function(val2){
        var rep = JSON.parse(val2.response_text);
        if (rep.success){
            status_processing();
        }else{
            gebi(`select-result-${index}`).innerHTML = rep.message;
            set_btn_html(btn_ele);
        }
    }, function(val2){
        gebi(`select-result-${index}`).innerHTML = val2.message;
        set_btn_html(btn_ele);
    });
}

setInterval(function(){
    if (status !== "processing"){
        return;
    }
    fetch_data(domain+"/api/query_progress", "POST", headers, JSON.stringify({"ticket": ticket})).then(function(val2){
        var rep = JSON.parse(val2.response_text);
        if (rep.success){
            gebi("process").innerHTML = rep.data.status;
            if (rep.data.artifact_url){
                gebi("process").innerHTML = gebi("process").innerHTML + ` <a href="${rep.data.artifact_url}" target="_blank"><button type="button" class="wux-btn wux-btn-primary wux-btn-sm">${icon_with_text("download-white", "下载")}</button></a>`;
                status = "waiting";
                gebi("query-btn").disabled = false;
            }
        }else{
            gebi("process").innerHTML = "无法获取进度信息: "+rep.message;
        }
    }, function(val2){
        gebi("process").innerHTML = "无法获取进度信息: "+val2.message;
    });
}, 1000);

