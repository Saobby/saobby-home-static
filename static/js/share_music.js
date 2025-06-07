gen_md_input();
gebi("submit-btn-0").innerHTML = icon_with_text("check-white", "分享");
gebi("submit-btn-1").innerHTML = icon_with_text("check-white", "分享");

gebi("retry-btn").innerHTML = icon_with_text("refresh-white", "再发一个");
const domain = "http://127.0.0.1:14514";
function start_query_status(music_id){
    const status_span = gebi("status");
    gebi("sharing-div").hidden = true;
    gebi("result-div").hidden = false;
    const timer = setInterval(async function (){
        const rsp0 = await fetch_api(domain+"/api/query_music_status", {
            music_id: music_id
        });
        if (rsp0.retcode){
            status_span.innerText = "无法查询任务状态: "+rsp0.msg;
        }else{
            if (rsp0.data.status === 1){
                status_span.innerText = rsp0.data.msg;
            }else if (rsp0.data.status === 0){
                status_span.innerText = "分享成功!即将跳转...";
                clearInterval(timer);
                window.location.href = "/music";
            }else if (rsp0.data.status === 2){
                status_span.innerText = "分享失败: "+rsp0.data.msg;
                clearInterval(timer);
            }
        }
    }, 2000);
}
async function share_music(src_type){
    const detail = {};
    const submit_btn = gebi("submit-btn-"+src_type);
    const result_span = gebi("result-"+src_type);
    function set_btn_status(status){
        if (status){
            set_btn_html(submit_btn, "...");
        }else {
            set_btn_html(submit_btn);
        }
        submit_btn.disabled = status;
    }
    switch (src_type){
        case 0:  // 网易云音乐
            const nmusic_url = gebi("nmusic-url-input").value;
            if (!(new RegExp("^https://music\\.163\\.com/#/song\\?id=\\d+$")).test(nmusic_url)){
                gebi("result-0").innerText = "链接格式错误";
                return;
            }
            detail.music_id = nmusic_url.split("=")[1];
            break;
    }
    const payload = {
        desc: gebi("desc-input-"+src_type).value,
        detail: detail,
        src_type: src_type
    };
    if (localStorage.getItem("access-token")){
        payload.access_token = localStorage.getItem("access-token");
    }
    set_btn_status(true);
    const rsp0 = await captcha_v3();
    if (rsp0.retcode){
        result_span.innerHTML = "人机验证失败: "+rsp0.msg;
        set_btn_status(false);
        return;
    }
    payload.captcha_token = rsp0.data.token;
    const rsp1 = await fetch_api(domain+"/api/share_music", payload);
    if (rsp1.retcode){
        result_span.innerHTML = rsp1.msg;
        set_btn_status(false);
        return;
    }
    const music_id = rsp1.data.id;
    set_btn_status(false);
    start_query_status(music_id);
}
async function share_music_file(){
    const submit_btn = gebi("submit-btn-1");
    const result_span = gebi("result-1");
    function set_btn_status(status){
        if (status){
            set_btn_html(submit_btn, "...");
        }else {
            set_btn_html(submit_btn);
        }
        submit_btn.disabled = status;
    }
    const file = gebi("music-file").files[0];
    const name = gebi("music-name-input").value;
    const src = gebi("src-input").value;
    const desc = gebi("desc-input-1").value;
    if (!file){
        result_span.innerText = "请选择音频文件";
        return;
    }
    if (!name){
        result_span.innerText = "请填写音乐名";
        return;
    }
    if (!src){
        result_span.innerText = "请填写来源";
        return;
    }
    set_btn_status(true);
    const rsp0 = await captcha_v3();
    if (rsp0.retcode){
        result_span.innerText = "人机验证失败: "+rsp0.msg;
        set_btn_status(false);
        return;
    }
    const captcha_token = rsp0.data.token;
    const form_data = new FormData;
    form_data.append("name", name);
    form_data.append("captcha_token", captcha_token);
    form_data.append("desc", desc);
    form_data.append("src", src);
    form_data.append("audio", file);
    if (localStorage.getItem("access-token")){
        form_data.append("access_token", localStorage.getItem("access-token"));
    }
    const submitter = new FormSubmitter(
        domain+"/api/share_music_file",
        form_data,
        true,
        function (progress){
            const progress_bar = gebi("upload-progress");
            progress_bar.hidden = false;
            progress_bar.value = progress;
            gebi("result-1").innerText = `上传中(${Math.round(progress*100)}%)`;
        }
    );
    const rsp1 = await submitter.send();
    if (rsp1.retcode){
        result_span.innerHTML = rsp1.msg;
        set_btn_status(false);
        return;
    }
    const music_id = rsp1.data.id;
    set_btn_status(false);
    start_query_status(music_id);
}