
var names = "你的黑橄榄*野猪老钱*shaozy*Okami*雪儿超乖*Erica*史努比*秀芳今天*是CBD酱呀*开朗大军*守护煮*谰语*单某人*土贼彭翔宇*OLL*Alchemy-菜问*星辰大海Always*EveFranic*Clabomi*我需要管理员的帮助*鸡仔MG3*假Arkos*Decadence*美西螈*Deletc丶*Shawn*怪哉-GuaiZai*北冥有鱼*码码乐君莫笑*谷雨";
names = names.split("*");
var users_choices = [];
function show_names(){
    var html = "";
    for (var index=0; index < names.length; index++){
        var one = `<b>${names[index]}</b><span> | 当前票数:<span id="vote-count-${index}">Loading...</span> | 你的投票数:<span id="your-vote-${index}">0</span></span><button class="wux-btn wux-btn-primary" type="button" onclick="vote_for(${index});" id="login-btn">投票</button><br>`;
        html += one;
    }
    document.getElementById("name-area").innerHTML=html;
}


show_names();
