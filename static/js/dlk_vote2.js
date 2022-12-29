
var names = "你的黑橄榄*野猪老钱*shaozy*Okami*雪儿超乖*Erica*史努比*秀芳今天*是CBD酱呀*开朗大军*守护煮*谰语*单某人*土贼彭翔宇*OLL*Alchemy-菜问*星辰大海Always*EveFranic*Clabomi*我需要管理员的帮助*鸡仔MG3*假Arkos*Decadence*美西螈*Deletc丶*Shawn*怪哉-GuaiZai*北冥有鱼*码码乐君莫笑*谷雨*阿神kouki哈哈";
names = names.split("*");
var users_choices = [];
var vote_count = 0;
var max_vote = 5;
function show_names(){
    var html = "";
    for (var index=0; index < names.length; index++){
        var one = `<b>${names[index]}</b><span> | 当前票数:<code id="vote-count-${index}">Loading...</code> | 你的投票数:<code id="your-vote-${index}">0</code> </span><button class="wux-btn wux-btn-primary vote-btn" type="button" onclick="vote_for(${index});">投票</button><br>`;
        html += one;
    }
    document.getElementById("name-area").innerHTML=html;
}

function vote_for(choice){
    users_choices.push(choice);
    var e = document.getElementById(`your-vote-${choice}`);
    e.innerHTML = (Number(e.innerHTML)+1).toString();
    vote_count += 1;
    document.getElementById("submit-btn").disabled=false;
    if (vote_count>=max_vote){
        var t = document.getElementsByClassName("vote-btn");
        for (var m=0;m<t.length;m++){
            t[m].disabled=true;
        }
    }
}

function submit_vote(){
    get_captcha_img();
    document.getElementById("captcha-window").hidden = !1;
}

function complete_captcha(){
    document.getElementById("submit-btn").disabled = true;
    document.getElementById("submit-btn").innerHTML = "请稍候";
    var o = new XMLHttpRequest;
    o.open("POST", "https://vote-api.saobby.com/api/vote", !0);
    o.setRequestHeader("Content-Type", "application/json");
    var a = {
        choice: users_choices,
        vote_id: 1,
        captcha_token : document.getElementById("captcha-token").value
    };
    o.send(JSON.stringify(a));
    o.onreadystatechange = function() {
        if (4 == o.readyState){
            document.getElementById("submit-btn").disabled = false;
            document.getElementById("submit-btn").innerHTML = "确认投票";
            var ret = JSON.parse(o.responseText);
            if (ret.success){
                document.getElementById("result").innerHTML = "你的投票已提交";
                get_vote_count();
            }else{
                document.getElementById("result").innerHTML = ret.message;
            }
        }
    }
}

function get_vote_count(){
var o = new XMLHttpRequest;
    o.open("POST", "https://vote-api.saobby.com/api/get_vote_count", !0);
    o.setRequestHeader("Content-Type", "application/json");
    var a = {

        vote_id: 1,

    };
    o.send(JSON.stringify(a));
    o.onreadystatechange = function() {
        if (4 == o.readyState){
            var ret = JSON.parse(o.responseText);
            if (ret.success){
                for (var index in ret.data){
                    document.getElementById(`vote-count-${index}`).innerHTML = ret.data[index];
                }
            }else{
                document.getElementById("result").innerHTML="无法获取得票数据";
            }
        }
    }

}

show_names();
get_vote_count();
