gen_md_input();
gebi("submit-btn-0").innerHTML = icon_with_text("check-white", "分享");
const domain = "http://127.0.0.1:14514";
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
        result_span.innerText = "人机验证失败: "+rsp0.msg;
        set_btn_status(false);
        return;
    }
    payload.captcha_token = rsp0.data.token;
    const rsp1 = await fetch_api(domain+"/api/share_music", payload);
    if (rsp1.retcode){
        result_span.innerText = rsp1.msg;
        set_btn_status(false);
        return;
    }
    const music_id = rsp1.data.id;
    const status_span = gebi("status");
    set_btn_status(false);
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
