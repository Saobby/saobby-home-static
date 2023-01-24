!function(){
var e = new XMLHttpRequest;
e.open("GET", "https://birthdaystar-api.saobby.cf/api/get_birthdaystar", true);
e.send();
e.onreadystatechange = function() {
        if (4 == e.readyState) {
                var t=JSON.parse(e.responseText);
                if (t.success){
                    if (t.data){
                    var character = t.data.join("、");
                    var msg = `今天是<b>${character}</b>的生日！`;
                    document.getElementById("birthdaystar").innerHTML=msg;}
                    else{
                    document.getElementById("birthdaystar").innerHTML="今天没有人过生日...";
                    }
                }
                else{
                    document.getElementById("birthdaystar").innerHTML=t.message;
                }
        }
}}();