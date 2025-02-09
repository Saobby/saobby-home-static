var options = ["", ""];
var domain = "https://vote.saobby.com";
function add_option(){
    options.push("");
    render_options();
}
function remove_option(index){
    options.splice(index, 1);
    render_options();
}
function render_options(){
    var html = "";
    for (var i in options){
        var option = options[i];
        html += `<input type="text" class="wux-form-input wux-form-input-md" placeholder="选项${parseInt(i)+1}" value="${rsc(option)}" onchange="options[${i}]=this.value;"><button class="wux-btn wux-btn-primary" type="button" onclick="remove_option(${i});">${icon_with_text("trash-white", "删除此项")}</button><hr>`;
    }
    gebi("options-div").innerHTML = html;
}
function submit(){
    function set_buttons_status(status){
        function set_ability(ele){
            var children = ele.children;
            for (var i=0;i<children.length;i++){
                children[i].disabled = status;
                set_ability(children[i]);
            }
        }
        set_ability(gebi("config"));
    }
    var title = gebi("title").value;
    var options_amount = options.length;
    var always_show_result = gebi("always-show-result").checked;
    var font_size = gebi("font-size").value;
    var font_color = gebi("font-color").value.slice(1);
    if (title === "" || font_size === "" || font_color === "" || include("", options)){
        gebi("result").innerHTML = "所有字段均不能为空";
        return;
    }
    if (options_amount < 2){
        gebi("result").innerHTML = "请至少添加2个选项";
        return;
    }
    set_buttons_status(true);
    set_btn_html(gebi("submit-btn"), "...");
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        set_btn_html(gebi("submit-btn"), "请稍候");
        var send_data = {"options_amount": options_amount, "always_show_result": always_show_result, "show_number": gebi("show-number").checked, "show_percent": gebi("show-percent").checked, "font_size": font_size, "font_color": font_color, "captcha_token": gebi("scpc-token").value};
        fetch_data(domain+"/api/create_vote", "POST", headers, JSON.stringify(send_data)).then(function(val2){
            var rep = JSON.parse(val2.response_text);
            if (rep.success){
                gebi("result").innerHTML = "创建成功";
                var markdown = `**投票:${title}**(点击选项进行投票):  \n`;
                for (var i in options){
                    var option = options[i];
                    markdown += `[${option}](${domain+"/v/"+rep.data.vote_id+"/"+i.toString()}) ![](${domain+"/i/"+rep.data.vote_id+"/"+i.toString()})  \n`;
                }
                gebi("markdown").value = markdown;
            }else{
                gebi("result").innerHTML = rep.message;
            }
            set_buttons_status(false);
            set_btn_html(gebi("submit-btn"));
        }, function(val2){
            gebi("result").innerHTML = val2.message;
            set_buttons_status(false);
            set_btn_html(gebi("submit-btn"));
        });
    }, function(val){
        gebi("result").innerHTML = "请先完成人机验证:"+val.message;
        set_buttons_status(false);
        set_btn_html(gebi("submit-btn"));
    });
}

function preview_color(){
    var r = parseInt(gebi("color-r-range").value);
    var g = parseInt(gebi("color-g-range").value);
    var b = parseInt(gebi("color-b-range").value);
    gebi("color-r-val").innerHTML = r;
    gebi("color-g-val").innerHTML = g;
    gebi("color-b-val").innerHTML = b;
    var hex = "#"+r.toString(16).padStart(2, "0")+g.toString(16).padStart(2, "0")+b.toString(16).padStart(2, "0");
    gebi("font-color").value = hex;
    gebi("color-preview-div").style.backgroundColor = hex;
}

function set_color(){
    var hex = gebi("font-color").value;
    var r = parseInt(hex.slice(1, 3), 16);
    var g = parseInt(hex.slice(3, 5), 16);
    var b = parseInt(hex.slice(5, 7), 16);
    gebi("color-r-range").value = r;
    gebi("color-g-range").value = g;
    gebi("color-b-range").value = b;
    gebi("color-r-val").innerHTML = r;
    gebi("color-g-val").innerHTML = g;
    gebi("color-b-val").innerHTML = b;
    gebi("color-preview-div").style.backgroundColor = hex;
}

render_options();
