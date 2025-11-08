var domain = "https://midishow-vc-fast.saobby.com";

function show_error_msg(msg){
    gebi("error-msg").innerHTML = msg;
    gebi("notice-div").hidden = true;
    gebi("success-div").hidden = true;
    gebi("error-div").hidden = false;
    set_btn_html(gebi("download-btn"));
}

async function download(){
    var url = gebi("url").value;
    if (!url){
        show_error_msg("请输入 MIDI 查看页面网址");
        return;
    }
    set_btn_html(gebi("download-btn"), "...");

    const captcha_rsp = await captcha_v3();
    if (captcha_rsp.retcode){
        show_error_msg("人机验证失败:"+captcha_rsp.msg);
        set_btn_html(gebi("download-btn"));
        return;
    }

    set_btn_html(gebi("download-btn"), "请等10s");
    var send_data = {"url": url, "captcha_token": captcha_rsp.data.token};
    const rsp = await fetch_api(domain+"/api/download_midi", send_data);
    if (rsp.retcode){
        show_error_msg(rsp.msg);
        set_btn_html(gebi("download-btn"));
        return;
    }
    var link = b642link(rsp.data.file);
    gebi("download-link").href = link;
    gebi("download-link").download = rsp.data.title.replaceAll("\\", "、").replaceAll("/", "、").replaceAll(":", "：").replaceAll("*", "⭐").replaceAll("?", "？").replaceAll('"', "'").replaceAll("<", "《").replaceAll(">", "》").replaceAll("|", " ")+".mid";  // windows系统不能用这些字符做文件名
    gebi("midi-player").src = link;
    gebi("notice-div").hidden = true;
    gebi("error-div").hidden = true;
    gebi("success-div").hidden = false;
    set_btn_html(gebi("download-btn"));
}

async function load_midi_player(){
    await load_script("/static/js/midi_player.js");
    gebi("midi-player-div").innerHTML = `
    <midi-player src="" sound-font="https://sfe.saobby.com/midi" id="midi-player"></midi-player>
    <midi-visualizer type="piano-roll" id="midi-visualizer"></midi-visualizer>
    `;
    gebi("midi-visualizer").config = {
        noteHeight: 8,
        noteSpacing: 1,
        pixelsPerTimeStep: 100,
        noteRGB: "80, 100, 225",
        activeNoteRGB: "255, 85, 65"
    };
    gebi("midi-player").addVisualizer(gebi("midi-visualizer"));
}

load_midi_player().then();
