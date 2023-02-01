var e = new XMLHttpRequest;
e.open("GET", "https://birthdaystar-api.saobby.cf/api/get_birthdaystar", true);
e.send();
e.onload = function() {
  if (4 == e.readyState) {
    var t = JSON.parse(e.responseText);
    if (t.success) {
      if (t.data.length > 0) {
        var a = `今天是<b>${t.data.join("、")}</b>的生日！`;
        document.getElementById("birthdaystar").innerHTML = a;
      } else {
        document.getElementById("birthdaystar").innerHTML = "今天没有人过生日...";
      };
    } else {
      document.getElementById("birthdaystar").innerHTML = t.message;
    };
  };
};