! function() {
    var e = new XMLHttpRequest;
    e.open("GET", "https://birthdaystar.saobby.com/api/get_birthdaystar", !0), e.send(), e.onreadystatechange = function() {
        if (4 == e.readyState) {
            var t = JSON.parse(e.responseText);
            if (t.success)
                if (t.data.length > 0) {
                    gebi("birthdaystar").hidden = false;
                    var a = `${icon_with_text("cake-primary","今天是<b>"+t.data.join("、")+"</b>的生日！")}`;
                    gebi("birthdaystar").innerHTML = a
                } else gebi("birthdaystar").innerHTML = `${icon_with_text("cake-primary","今天没有人过生日...")}`;
            else gebi("birthdaystar").innerHTML = t.message
        }
    }
}();