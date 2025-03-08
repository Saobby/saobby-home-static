domain = "http://127.0.0.1:7799";

function check_login() {
    if (!localStorage.getItem("access-token")) {
        gebi("login-tip").hidden = false;
    }
}

function login() {
    localStorage.login_redirect = window.location.href;
    window.location = "/login";
}

async function create_counter() {
    function set_btn_status(status){
        gebi("pic-type").disabled = status;
        gebi("display-type").disabled = status;
        gebi("font-size").disabled = status;
        gebi("font-color").disabled = status;
        gebi("background-color").disabled = status;
        gebi("create-counter-btn").disabled = status;
        if (status){
            set_btn_html(gebi("create-counter-btn"), "...");
        }
        else{
            set_btn_html(gebi("create-counter-btn"));
        }
    }
    const pic_type = parseInt(gebi("pic-type").value);
    const display_type = parseInt(gebi("display-type").value);
    const font_size = parseInt(gebi("font-size").value);
    const font_color = gebi("font-color").value;
    const background_color = gebi("background-color").value;
    if (isNaN(font_size)){
        gebi("create-counter-result").innerHTML = "请填写字体大小";
        return
    }
    if (!font_color || !background_color){
        gebi("create-counter-result").innerHTML = "请填写字体颜色和背景颜色";
        return
    }
    set_btn_status(true);
    const rsp = await captcha_v3();
    if (rsp.retcode){
        gebi("create-counter-result").innerHTML = "人机验证失败:"+rsp.msg;
        set_btn_status(false);
        return
    }
    const payload = {
        pic_type: pic_type,
        display_type: display_type,
        font_size: font_size,
        text_color: font_color,
        background_color: background_color, 
        captcha_token: rsp.data.token
    }
    if (localStorage.getItem("access-token")){
        payload.access_token = localStorage.getItem("access-token");
    }
    const rsp2 = await fetch_api(domain+"/api/create_counter", payload);
    if (rsp2.retcode){
        gebi("create-counter-result").innerHTML = rsp2.msg;
        set_btn_status(false);
        return
    }
    gebi("create-counter-result").innerHTML = "创建成功, 计数器信息已显示在下方";
    gebi("success-div").hidden = false;
    gebi("counter-id").innerHTML = rsp2.data.counter_id;
    gebi("access-token").innerHTML = rsp2.data.access_token;
    gebi("dashboard-link").href = "/webcounter_dashboard?access_token="+rsp2.data.access_token;
    const url = domain+"/w/"+rsp2.data.counter_id;
    gebi("markdown-code").value = `![](${url})`;
    gebi("html-code").value = `<img src="${url}">`;
    set_btn_status(false);
}
