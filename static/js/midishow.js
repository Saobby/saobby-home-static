var domain = "https://midishow.saobby.com";
gebi("midi-visualizer").config={noteHeight:8,noteSpacing:1,pixelsPerTimeStep:100,noteRGB:"80, 100, 225",activeNoteRGB:"255, 85, 65"};

function show_error_msg(msg){
    gebi("error-msg").innerHTML = msg;
    gebi("notice-div").hidden = true;
    gebi("success-div").hidden = true;
    gebi("error-div").hidden = false;
    set_btn_html(gebi("download-btn"));
}

function download(){
    var url = gebi("url").value;
    if (!url){
        show_error_msg("请输入 MIDI 查看页面网址");
        return;
    }
    set_btn_html(gebi("download-btn"), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("download-btn"), "请等几秒");
        var send_data = {"url": url, "captcha_token": val.captcha_token};
        fetch_data(domain+"/api/download_midi", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                var link = b642link(rep.data.file);
                gebi("download-link").href = link;
                gebi("midi-player").src = link;
                gebi("notice-div").hidden = true;
                gebi("error-div").hidden = true;
                gebi("success-div").hidden = false;
            }else{
                show_error_msg(rep.message);
            }
            set_btn_html(gebi("download-btn"));
        }, function(val2){
            show_error_msg(val2.message);
            set_btn_html(gebi("download-btn"));
        });
    }, function(val){
        show_error_msg("请先完成人机验证:"+val.message);
        set_btn_html(gebi("download-btn"));
    });
}
