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
        html += `<input type="text" class="wux-form-input wux-form-input-md" placeholder="选项${parseInt(i)+1}" value="${rsc(option)}" onchange="options[${i}]=this.value;"><button class="wux-btn wux-btn-primary" type="button" onclick="remove_option(${i});">删除此项</button><hr>`;
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
        gebi("submit-btn").disabled = status;
        set_ability(gebi("config"));
        if (!status){
            gebi("submit-btn").innerHTML = "创建投票";
        }
    }
    var title = gebi("title").value;
    var options_amount = options.length;
    var asr = gebi("always-show-result");
    var always_show_result = ({"true": true, "false": false})[asr.options[asr.selectedIndex].value];
    var font_size = gebi("font-size").value;
    var font_color = gebi("font-color").value;
    if (title === "" || font_size === "" || font_color === "" || include("", options)){
        gebi("result").innerHTML = "所有字段均不能为空";
        return;
    }
    if (options_amount < 2){
        gebi("result").innerHTML = "请至少添加2个选项";
        return;
    }
    set_buttons_status(true);
    gebi("submit-btn").innerHTML = "...";
    saobbyCaptchaV2.open_window_and_return_promise().then(function(val){
        gebi("submit-btn").innerHTML = "请稍候";
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
        }, function(val2){
            gebi("result").innerHTML = val2.message;
            set_buttons_status(false);
        });
    }, function(val){
        gebi("result").innerHTML = "请先完成人机验证:"+val.message;
        set_buttons_status(false);
    });
}
render_options();
