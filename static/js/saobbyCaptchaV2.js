var saobbyCaptchaV2 = (function(api_base_url){
    gebi("scpc-v2").innerHTML = `<link rel="stylesheet" type="text/css" href="https://www.saobby.com/static/css/saobbyCaptchaV2.css"><div id="scpc-trigger" hidden><div class="scpc-pre-like" style="width:fit-content;" onclick="saobbyCaptchaV2.trigger_clicked();" id="scpc-trigger-div"><span id="scpc-trigger-text">⚪点击此处进行人机验证</span></div></div><div style="position:fixed;top:calc( 50vh - 152px );left:calc( 50vw - 152px );width:276px;height:285px;background:#ffffff;" id="scpc-window" class="scpc-pre-like" hidden><div id="scpc-challenge-area" hidden><span style="font-size:15px;top:5px;left:5px;" class="scpc-element"><span>请<b class="scpc-result">依次</b>点击</span></span><img style="top:0px;left:85px;" src="" height="30px" id="scpc-tip-image" class="scpc-element" draggable="false"><span style="font-size:15px;top:5px;left:215px;" class="scpc-element"><span style="color:#555555;">已点击:<span id="scpc-clicked-count">0</span>/<span id="scpc-total">-</span></span></span><button style="font-size:14px;top:271px;left:111px;height:25px;" onclick="document.dispatchEvent(saobbyCaptchaV2.cancelled_event);saobbyCaptchaV2.close_window();" type="button" class="scpc-element" id="scpc-close-window-btn">关闭</button><button style="font-size:14px;top:271px;left:163px;height:25px;" onclick="saobbyCaptchaV2.refresh();" type="button" id="scpc-refresh-btn" class="scpc-element" disabled>换一个</button><img src="" width="300px" height="225px" style="top:40px;left:0px;border-radius:12px;" id="scpc-challenge-image" class="scpc-element" draggable="false" hidden><div id="scpc-refreshing-tips" style="top:40px;left:0px;height:225px;width:300px;" class="scpc-element"><span style="font-size:15px;top:100px;left:120px;" class="scpc-element">请稍候...</span><br><span style="font-size:15px;top:120px;left:100px;" class="scpc-element">正在生成验证码...</span><br></div><button style="font-size:14px;top:271px;left:228px;height:25px;width:70px;" id="scpc-submit-btn" onclick="saobbyCaptchaV2.submit();" type="button" class="scpc-element" disabled>确认</button><span id="scpc-result" style="font-size:15px;top:271px;left:5px;" class="scpc-element scpc-result"></span><img src="https://www.saobby.com/static/image/captcha/1.svg" id="scpc-number-1" class="scpc-numbers scpc-element" number="1" hidden><img src="https://www.saobby.com/static/image/captcha/2.svg" id="scpc-number-2" class="scpc-numbers scpc-element" number="2" hidden><img src="https://www.saobby.com/static/image/captcha/3.svg" id="scpc-number-3" class="scpc-numbers scpc-element" number="3" hidden><img src="https://www.saobby.com/static/image/captcha/4.svg" id="scpc-number-4" class="scpc-numbers scpc-element" number="4" hidden><img src="https://www.saobby.com/static/image/captcha/5.svg" id="scpc-number-5" class="scpc-numbers scpc-element" number="5" hidden><input id="scpc-challenge-id" type="hidden" disabled><input id="scpc-clicked-positions" type="hidden" disabled></div><div id="scpc-loading-area"><span style="font-size:15px;top:130px;left:120px;" class="scpc-element">请稍候...</span><br><span style="font-size:15px;top:150px;left:80px;" class="scpc-element">正在尝试进行人机验证...</span><br><span style="font-size:15px;top:170px;left:100px;" class="scpc-element scpc-result" id="scpc-loading-result"></span></div></div><input id="scpc-token" type="hidden" name="saobby-captcha-token">`;
    if (gebi("scpc-v2").getAttribute("show-trigger") === "true"){
        gebi("scpc-trigger").hidden = false;
    }
    var functions = {};
    var headers = {"Content-Type": "application/json"};
    var event_challenge_resolved = new CustomEvent("scpc_challenge_resolved", {"detail": {}});
    var event_challenge_cancelled = new CustomEvent("scpc_challenge_cancelled", {"detail": {}});
    gebi("scpc-challenge-image").addEventListener("click", function(event){
        var count = parseInt(gebi("scpc-clicked-count").innerHTML);
        var total = parseInt(gebi("scpc-total").innerHTML);
        if (count < total){
            var x = event.offsetX;
            var y = event.offsetY;
            var positions = JSON.parse(gebi("scpc-clicked-positions").value);
            positions.push([x, y]);
            gebi("scpc-clicked-positions").value = JSON.stringify(positions);
            count += 1;
            gebi("scpc-clicked-count").innerHTML = count.toString();
            gebi("scpc-number-"+count).hidden = false;
            gebi("scpc-number-"+count).style = `left:${x-15}px;top:${y+40-15}px;`;
            if (count === total){
                gebi("scpc-submit-btn").disabled = false;
            }
        }
    });
    var numbers = gebcn("scpc-numbers");
    for (var i=0;i<numbers.length;i++){
        var number = numbers[i];
        number.setAttribute("onclick", `saobbyCaptchaV2.remove_choice(parseInt(this.getAttribute("number")));`);
    }
    function gebi(eleid){
        return document.getElementById(eleid);
    }
    function gebcn(class_name){
        return document.getElementsByClassName(class_name);
    }
    function fetch_data(url, method, headers, data){
        var promise = new Promise(function(resolve, reject){
            var http = new XMLHttpRequest;
            http.open(method, url, true);
            for (var header in headers){
                http.setRequestHeader(header, headers[header]);
            }
            try{
                if (method === "GET"){
                    http.send();
                }else{
                    http.send(data);
                }
            }catch(error){
                reject({"message": error.name+error.message});
            }
            http.onreadystatechange = function(){
                if (http.readyState === 4){
                    if (http.status === 0){
                        reject({"message": "网络错误"})
                    }else{
                        resolve({"response_text": http.responseText, "status_code": http.status});
                    }
                }
            }
            http.onerror = function(){
                reject({"message": "网络错误"});
            }
        });
        return promise;
    }
    function is_in(chr, str){
        for (var t in str){
            if (chr === str[t]){
                return true;
            }
        }
        return false;
    }
    function include(ele, list){
        for (var e = 0;e < list.length;e++){
            if (ele === list[e]){
                return true;
            }
        }
        return false;
    }
    function get_element_abs_position(ele){
        var x = window.pageXOffset;
        var y = window.pageYOffset;
        var element = ele;
        while (true){
            x += element.offsetLeft;
            y += element.offsetTop;
            element = element.offsetParent;
            if (element === null){
                break;
            }
        }
        return {"x": x, "y": y};
    }
    function load_captcha(){
        var promise = new Promise(function (resolve, reject){
            fetch_data(api_base_url+"/api/gen_challenge", "POST", headers, JSON.stringify({})).then(function(val){
                var ret = JSON.parse(val.response_text);
                if (ret.success){
                    resolve(ret);
                }else{
                    reject(ret);
                }
            }, function(val){
                reject({"success": false, "message": val.message, "data": null});
            });
        });
        return promise;
    }
    function clear_choices(){
        gebi("scpc-clicked-count").innerHTML = "0";
        gebi("scpc-clicked-positions").value = JSON.stringify([]);
        var numbers = gebcn("scpc-numbers");
        for (var i = 0;i < numbers.length;i++){
            var number = numbers[i];
            number.hidden = true;
            number.style = "";
        }
    }
    functions.open_window_and_return_promise = function(){
        var promise = new Promise(function(resolve, reject){
            document.addEventListener("scpc_challenge_resolved", function(event){
                resolve({"message": "用户完成了验证码", "captcha_token": gebi("scpc-token").value});
            });
            document.addEventListener("scpc_challenge_cancelled", function(event){
                reject({"message": "用户关闭了验证码窗口"});
            });
            if (!(gebi("scpc-window").hidden)){
                reject({"message": "有一个正在进行的人机验证，请先完成或取消当前的人机验证"});
                return;
            }
            gebi("scpc-window").hidden = false;
            gebi("scpc-challenge-area").hidden = true;
            gebi("scpc-loading-area").hidden = false;
            gebi("scpc-refresh-btn").disabled = true;
            gebi("scpc-submit-btn").disabled = true;
            clear_choices();
            gebi("scpc-loading-result").innerHTML = "";
            gebi("scpc-result").innerHTML = "";
            load_captcha().then(function(val){
                if (val.data.return_type === 1){
                    gebi("scpc-token").value = val.data.option.token;
                    functions.close_window();
                    resolve({"message": "用户直接通过了验证", "captcha_token": val.data.option.token});
                }else if (val.data.return_type === 0){
                    gebi("scpc-challenge-id").value = val.data.option.challenge_id;
                    gebi("scpc-total").innerHTML = val.data.option.word_length;
                    gebi("scpc-tip-image").src = val.data.option.tip_image;
                    gebi("scpc-challenge-image").src = val.data.option.captcha_image;
                    gebi("scpc-challenge-area").hidden = false;
                    gebi("scpc-challenge-image").hidden = false;
                    gebi("scpc-refreshing-tips").hidden = true;
                    gebi("scpc-loading-area").hidden = true;
                    gebi("scpc-refresh-btn").disabled = false;
                }
            }, function(val){
                gebi("scpc-loading-result").innerHTML = val.message;
                reject({"message": "无法加载验证码:"+val.message});
            });
        });
        return promise;
    }
    functions.close_window = function(){
        gebi("scpc-window").hidden = true;
    }
    functions.resolved_event = event_challenge_resolved;
    functions.cancelled_event = event_challenge_cancelled;
    functions.remove_choice = function(number){
        gebi("scpc-submit-btn").disabled = true;
        var total = parseInt(gebi("scpc-total").innerHTML);
        var positions = JSON.parse(gebi("scpc-clicked-positions").value);
        for (var n=number;n<=total;n++){
            if (!(gebi("scpc-number-"+n).hidden)){
                positions.pop();
            }
            gebi("scpc-number-"+n).hidden = true;
            gebi("scpc-number-"+n).style = "";
        }
        gebi("scpc-clicked-count").innerHTML = (number-1).toString();
        gebi("scpc-clicked-positions").value = JSON.stringify(positions);
    }
    functions.refresh = function(){
        gebi("scpc-submit-btn").disabled = true;
        clear_choices();
        gebi("scpc-challenge-image").hidden = true;
        gebi("scpc-refreshing-tips").hidden = false;
        gebi("scpc-refresh-btn").disabled = true;
        gebi("scpc-refresh-btn").innerHTML = "加载中";
        load_captcha().then(function(val){
            gebi("scpc-challenge-image").hidden = false;
            gebi("scpc-refreshing-tips").hidden = true;
            gebi("scpc-refresh-btn").disabled = false;
            gebi("scpc-refresh-btn").innerHTML = "换一个";
            gebi("scpc-challenge-id").value = val.data.option.challenge_id;
            gebi("scpc-total").innerHTML = val.data.option.word_length;
            gebi("scpc-tip-image").src = val.data.option.tip_image;
            gebi("scpc-challenge-image").src = val.data.option.captcha_image;
            gebi("scpc-result").innerHTML = "";
        }, function(val){
            gebi("scpc-refresh-btn").disabled = false;
            gebi("scpc-refresh-btn").innerHTML = "换一个";
            gebi("scpc-result").innerHTML = val.message;
        });
    }
    functions.submit = function(){
        gebi("scpc-submit-btn").disabled = true;
        gebi("scpc-refresh-btn").disabled = true;
        gebi("scpc-close-window-btn").disabled = true;
        gebi("scpc-submit-btn").innerHTML = "验证中";
        var challenge_id = gebi("scpc-challenge-id").value;
        var positions = JSON.parse(gebi("scpc-clicked-positions").value);
        fetch_data(api_base_url+"/api/get_token", "POST", headers, JSON.stringify({"challenge_id": challenge_id, "positions": positions})).then(function(val){
            var ret = JSON.parse(val.response_text);
            gebi("scpc-submit-btn").disabled = false;
            gebi("scpc-refresh-btn").disabled = false;
            gebi("scpc-close-window-btn").disabled = false;
            gebi("scpc-submit-btn").innerHTML = "确认";
            if (ret.success){
                gebi("scpc-token").value = ret.data.token;
                document.dispatchEvent(event_challenge_resolved);
                functions.close_window();
            }else{
                gebi("scpc-result").innerHTML = ret.message;
                functions.refresh();
            }
        }, function(val){
            gebi("scpc-result").innerHTML = val.message;
            gebi("scpc-submit-btn").disabled = false;
            gebi("scpc-refresh-btn").disabled = false;
            gebi("scpc-close-window-btn").disabled = false;
            gebi("scpc-submit-btn").innerHTML = "确认";
            functions.refresh();
        });
    }
    functions.trigger_clicked = function(){
        gebi("scpc-trigger-div").setAttribute("onclick", "");
        gebi("scpc-trigger-text").innerHTML = "⚫正在进行人机验证";
        functions.open_window_and_return_promise().then(function(val){
            gebi("scpc-trigger-text").innerHTML = "✔成功通过人机验证";
        }, function(val){
            gebi("scpc-trigger-text").innerHTML = "⚪点击此处进行人机验证";
            gebi("scpc-trigger-div").setAttribute("onclick", "saobbyCaptchaV2.trigger_clicked();");
        });
    }
    return functions;
})("https://aether.saobby.com:5001");
