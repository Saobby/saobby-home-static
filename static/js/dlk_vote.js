var names="你的黑橄榄*野猪老钱*shaozy*Okami*雪儿超乖*Erica*史努比*秀芳今天*是CBD酱呀*开朗大军*守护煮*谰语*单某人*土贼彭翔宇*OLL*Alchemy-菜问*星辰大海Always*EveFranic*Clabomi*我需要管理员的帮助*鸡仔MG3*假Arkos*Decadence*美西螈*Deletc丶*Shawn*怪哉-GuaiZai*北冥有鱼*码码乐君莫笑*谷雨*阿神kouki哈哈";names=names.split("*");var users_choices=[],vote_count=0,max_vote=5;function show_names(){for(var e="",t=0;t<names.length;t++){e+=`<b>${names[t]}</b><span> | 当前票数:<code id="vote-count-${t}">Loading...</code> | 你的投票数:<code id="your-vote-${t}">0</code> </span><button class="wux-btn wux-btn-primary vote-btn" type="button" onclick="vote_for(${t});">投票</button><br>`}document.getElementById("name-area").innerHTML=e}function vote_for(e){users_choices.push(e);var t=document.getElementById(`your-vote-${e}`);if(t.innerHTML=(Number(t.innerHTML)+1).toString(),vote_count+=1,document.getElementById("submit-btn").disabled=!1,vote_count>=max_vote)for(var n=document.getElementsByClassName("vote-btn"),o=0;o<n.length;o++)n[o].disabled=!0}function submit_vote(){get_captcha_img(),document.getElementById("captcha-window").hidden=!1}function complete_captcha(){var e=new XMLHttpRequest;e.open("POST","https://vote-api.saobby.com/api/vote",!0),e.setRequestHeader("Content-Type","application/json");var t={choice:users_choices,vote_id:1,captcha_token:document.getElementById("captcha-token").value};e.send(JSON.stringify(t)),e.onreadystatechange=function(){if(4==e.readyState){var t=JSON.parse(e.responseText);t.success?(alert("你的投票已提交！"),window.location=""):alert("投票失败，原因:"+t.message)}}}function get_vote_count(){var e=new XMLHttpRequest;e.open("POST","https://vote-api.saobby.com/api/get_vote_count",!0),e.setRequestHeader("Content-Type","application/json");e.send(JSON.stringify({vote_id:1})),e.onreadystatechange=function(){if(4==e.readyState){var t=JSON.parse(e.responseText);if(t.success)for(var n in t.data)document.getElementById(`vote-count-${n}`).innerHTML=t.data[n];else alert("无法获取得票数据")}}}show_names(),get_vote_count();