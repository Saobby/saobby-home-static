var captcha_domain = "https://captcha-cf.saobby.cf";

function getElementAbsPos(t) {
  for (var e = t.offsetTop, n = t.offsetLeft; t = t.offsetParent;) e += t.offsetTop, n += t.offsetLeft;
  return { left: n + window.pageXOffset, top: e + window.pageYOffset }
}

function choose() {
  var t = window.event,
    e = document.getElementById("captcha_img"),
    n = document.getElementById("captcha_div"),
    a = getElementAbsPos(e),
    c = getElementAbsPos(n),
    d = document.getElementById("clicked").innerHTML,
    i = document.getElementById("total").innerHTML;
  if (parseInt(d) < parseInt(i)) {
    var o = document.getElementById("captcha-number-" + (parseInt(d) + 1));
    o.hidden = !1, o.style = "position: absolute; top: " + (t.pageY - c.top - 15) + "px; left: " + (t.pageX - c.left - 15) + "px;", document.getElementById("clicked").innerHTML = parseInt(d) + 1;
    var p = document.getElementById("clicked_pos").innerHTML;
    p = p + (t.pageX - a.left) + "," + (t.pageY - a.top) + ",", document.getElementById("clicked_pos").innerHTML = p, document.getElementById("clicked").innerHTML == i && (document.getElementById("submit_button").disabled = !1)
  }
}

function clear_all() {
  for (var t = document.getElementsByClassName("captcha-numbers"), e = 0; e < t.length; e++) t[e].hidden = !0;
  document.getElementById("clicked_pos").innerHTML = "", document.getElementById("clicked").innerHTML = "0"
}

function submit_captcha() {
  document.getElementById("submit_button").innerHTML = "加载中", document.getElementById("submit_button").disabled = !0;
  var t = new XMLHttpRequest;
  t.open("POST", captcha_domain + "/api/get_token", !0), t.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), t.send("id=" + document.getElementById("captcha-id").innerHTML + "&pos=" + document.getElementById("clicked_pos").innerHTML), t.onreadystatechange = function() {
    if (4 == t.readyState) {
      var e = t.responseText,
        n = JSON.parse(e);
      document.getElementById("submit_button").innerHTML = "确定", document.getElementById("submit_button").disabled = !1, !0 === n.validity ? (document.getElementById("captcha-token").value = n.token, document.getElementById("captcha-window").hidden = !0, complete_captcha()) : (document.getElementById("captcha_result").innerHTML = n.message, get_captcha_img())
    }
  }
}

function get_captcha_img() {
  document.getElementById("new_captcha").disabled = !0, document.getElementById("submit_button").disabled = !0, document.getElementById("new_captcha").disabled = !0, document.getElementById("loading-tips").hidden = !1, document.getElementById("loading-icon").hidden = !1, document.getElementById("loading-tips").innerHTML = "正在生成验证码", document.getElementById("captcha_img").hidden = !0, document.getElementById("captcha_tip").hidden = !0, clear_all();
  var t = new XMLHttpRequest;
  t.open("POST", captcha_domain + "/api/get_image", !0), t.setRequestHeader("Content-type", "application/x-www-form-urlencoded"), t.send(""), t.onreadystatechange = function() {
    if (4 === t.readyState) {
      var e = t.responseText,
        n = JSON.parse(e);
      document.getElementById("new_captcha").disabled = !1, document.getElementById("captcha_img").src = n.captcha_img, document.getElementById("captcha_tip").src = n.tip_img, document.getElementById("captcha-id").innerHTML = n.captcha_id, document.getElementById("total").innerHTML = n.captcha_lens, document.getElementById("loading-tips").hidden = !0, document.getElementById("loading-icon").hidden = !0, document.getElementById("captcha_img").hidden = !1, document.getElementById("captcha_result").innerHTML = "", document.getElementById("captcha_tip").hidden = !1
    }
  }, t.onprogress = function(t) { t.lengthComputable && (document.getElementById("loading-tips").innerHTML = "正在下载验证码(" + parseInt(t.loaded / t.total * 100) + "%)") }
}

function show_captcha_window() { document.getElementById("captcha-window").hidden = !1 }! function() {
  var t = "https://www.saobby.com/static/image/captcha/";
  document.getElementById("saobby-captcha").innerHTML = `<input id="captcha-token"type="hidden"name="s-captcha-token"><div id="captcha-window"class="wux-typo"hidden><pre style="position: fixed; top: calc( 50vh - 152px ); left: calc( 50vw - 152px ); width: 276px; height: 285px;background: #ffffff;"id="captcha_div"><span style="font-size: 15px; position: absolute; top: 5px; left:5px;">请<b style="color: #aa0000;">依次</b>点击</span><img style="position: absolute; top:5px; left:85px;"src=""height="30px"id="captcha_tip"hidden><span style="font-size: 15px; position: absolute; top: 0px; left: 210px;"><span style="color:#555555;"hidden="">已点击:<span id="clicked">0</span>/<span id="total">4</span></span></span><button class="wux-btn wux-btn-primary wux-btn-xs wux-btn-outline"style="font-size: 14px; position: absolute; top: 271px; left: 111px; height: 25px; "onclick="clear_all();"type="button">重置</button><button class="wux-btn wux-btn-primary wux-btn-xs wux-btn-outline"style="font-size: 14px; position: absolute; top: 271px; left: 163px; height: 25px;"onclick="get_captcha_img();"type="button"id="new_captcha">换一个</button><img src=""width="300"height="225"style="position: absolute; top: 40px; left: 0px; border-radius: 12px;"onclick="choose();"id="captcha_img"hidden><span id="loading-icon"style="position: absolute; top: 140px; left: 140px;"class="wux-loading"></span><span id="loading-tips"style="position: absolute; top: 170px; left: 100px;"></span><button class="wux-btn wux-btn-primary wux-btn-xs"style="font-size: 14px; position: absolute; top: 271px; left: 228px; height:25px; width:70px;"id="submit_button"onclick="submit_captcha();"type="button">确定</button><span id="captcha_result"style="font-size: 15px; position: absolute; top: 271px; left: 5px; color: #aa0000;"></span><img src="${t}1.svg"id="captcha-number-1"class="captcha-numbers"hidden><img src="${t}2.svg"id="captcha-number-2"class="captcha-numbers"hidden><img src="${t}3.svg"id="captcha-number-3"class="captcha-numbers"hidden><img src="${t}4.svg"id="captcha-number-4"class="captcha-numbers"hidden><img src="${t}5.svg"id="captcha-number-5"class="captcha-numbers"hidden><code id="captcha-id"hidden=""></code><code id="clicked_pos"hidden=""></code></pre></div>`
}();