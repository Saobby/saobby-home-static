"use strict";var domain="https://bilivideo-api.saobby.com";function query(){var t=gebi("video-link").value;""!==t?(set_btn_html(gebi("query-btn"),"..."),saobbyCaptchaV2.open_window_and_return_promise().then((function(e){var n={video_url:t,captcha_token:e.captcha_token};fetch_data(domain+"/api/get_video_pages","POST",headers,JSON.stringify(n)).then((function(t){var e=JSON.parse(t.response_text);if(e.success){var n=[];for(var i in e.data.pages){var a=e.data.pages[i];n.push("<b>P".concat(a.page_index," </b><span>").concat(rsc(a.title),"</span><br><b>时长: </b><span>").concat(sec2hms(a.duration),'</span><br><div id="p').concat(a.page_index,'-link-div"><button class="wux-btn wux-btn-primary wux-btn-sm" onclick="get_video_link(\'').concat(e.data.info.video_id,"','").concat(e.data.info.id_type,"',").concat(a.cid,",gebi('p").concat(a.page_index,"-link-div'),this,gebi('p").concat(a.page_index,"-error'));\">").concat(icon_with_text("search-white","解析"),'</button><br><span id="p').concat(a.page_index,'-error" class="result"></span></div>'))}gebi("pages-div").innerHTML=n.join("<hr>"),set_btn_html(gebi("query-btn")),gebi("notice-div").hidden=!0,gebi("result-div").hidden=!1,gebi("error-div").hidden=!0}else show_error_msg(e.message)}),(function(t){show_error_msg(t.message)}))}),(function(t){show_error_msg("请先完成人机验证:"+t.message)}))):show_error_msg("视频链接不能为空!")}function get_video_link(t,e,n,i,a,o){function r(t){t?set_btn_html(a,"..."):set_btn_html(a)}r(!0),saobbyCaptchaV2.open_window_and_return_promise().then((function(a){var s={video_id:t,id_type:e,cid:n,captcha_token:a.captcha_token};fetch_data(domain+"/api/get_video_link","POST",headers,JSON.stringify(s)).then((function(t){var e=JSON.parse(t.response_text);e.success?i.innerHTML="<b>画质: </b><span>".concat(e.data.quality,"</span><br><b>大小: </b><span>").concat(Math.round(100*e.data.size)/100,'MB</span><br><b>直链: </b><a target="_blank" href="').concat(rsc(e.data.url),'"><button class="wux-btn wux-btn-primary wux-btn-sm">').concat(icon_with_text("eye-white","打开"),'</button></a><button class="wux-btn wux-btn-primary wux-btn-sm" style="left:3px;" onclick="navigator.clipboard.writeText(\'').concat(rsc(e.data.url),"');\">").concat(icon_with_text("copy-white","复制"),"</button>"):(o.innerHTML=e.message,r(!1))}),(function(t){o.innerHTML=t.message,r(!1)}))}),(function(t){o.innerHTML="请先完成人机验证:"+t.message,r(!1)}))}function show_error_msg(t){gebi("error-msg").innerHTML=t,gebi("notice-div").hidden=!0,gebi("result-div").hidden=!0,gebi("error-div").hidden=!1,set_btn_html(gebi("query-btn"))}function sec2hms(t){var e=Math.floor(t/3600),n=Math.floor(t%3600/60),i=Math.floor(t%3600%60/1);return 0===e?n+":"+i:e+":"+n+":"+i}