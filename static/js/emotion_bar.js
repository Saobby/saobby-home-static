"use strict";var emotionBar=function(){var t=["HSR PPG","GI PP"],i=null,o={},e=[];function c(t){for(var i=gebcn("emotion-img-".concat(t)),o=0;o<i.length;o++){var e=i[o];e.getAttribute("src_")&&(e.src=e.getAttribute("src_"),e.removeAttribute("src_"))}}return o.init=function(i){e=i;var o='<div id="emotion-select-pack-div" style="width:100%;height:65px;overflow-y:hidden;overflow-x:auto;" class="wux-tab"><div style="white-space:nowrap;">';for(var c in i){var n=i[c];o+='<input class="wux-tab-item" type="radio" id="emotion-pack-select-'.concat(c,'" name="emotion-pack-select" onclick="emotionBar.select_pack(').concat(c,');"').concat(0===parseInt(c)?" checked":"",'><label class="wux-tab-item" for="emotion-pack-select-').concat(c,'" style="display:inline-block;">').concat(n[0],"</label>")}o+="</div></div>";var a="";for(var c in i){n=i[c];for(var r in a+='<div id="emotion-select-div-'.concat(c,'" style="height:calc(100% - 130px);overflow-y:auto;line-height:40px;margin-top:10px;margin-bottom:10px;"').concat(0===parseInt(c)?"":" hidden",">"),n[1]){var s=n[1][r];is_in_array(t,n[0])?a+='<a href="javascript:;" onclick="emotionBar.select_emotion('.concat(c,",").concat(r,');" style="padding:8px;"><img height="64px" alt="').concat(s[0],'" src_="').concat(s[1],'" title="').concat(s[0],'" class="emotion-img-').concat(c,'"></a>'):a+='<a href="javascript:;" onclick="emotionBar.select_emotion('.concat(c,",").concat(r,');" style="padding:8px;"><img width="24px" height="24px" alt="').concat(s[0],'" src_="').concat(s[1],'" title="').concat(s[0],'" class="emotion-img-').concat(c,'"></a>')}a+="</div>"}var l='<div id="emotion-bar-div" style="position:fixed;top:calc(50vh - 175px);left:calc(50vw - 175px);width:350px;height:350px;background:#ffffff;" class="pre-like" hidden>'.concat(o).concat(a,'<button class="wux-btn wux-btn-primary wux-btn-outline" type="button", onclick="emotionBar.close();">').concat(icon_with_text("x-primary","关闭"),"</button></div>");gebi("emotion-bar").innerHTML=l},o.show=function(t){i=t,c(0),gebi("emotion-bar-div").hidden=!1},o.close=function(){gebi("emotion-bar-div").hidden=!0},o.select_pack=function(t){for(var i=0;i<e.length;i++)gebi("emotion-select-div-".concat(i)).hidden=i!==t;c(t)},o.select_emotion=function(t,c){insert_into_textarea(":".concat(e[t][1][c][0],":"),i),o.close()},o.gen_open_btn=function(t,i){return'<button class="wux-btn wux-btn-warning wux-btn-outline wux-btn-'.concat(i,' simple" type="button" onclick="emotionBar.show(gebi(\'').concat(t,"'));\">").concat(icon_with_text("mood-happy","表情"),"</button>")},o}();!function(){var t=[],i=[],o=[],e=[],c=[],n=[],a=[];for(var r in bilibili_emojis)t.push([r,bilibili_emojis[r]]);for(var r in scratch_emojis)i.push([r,scratch_emojis[r]]);for(var r in qq_emojis1)o.push([r,qq_emojis1[r]]);for(var r in qq_emojis2)e.push([r,qq_emojis2[r]]);for(var r in wechat_emojis1)c.push([r,wechat_emojis1[r]]);for(var r in wechat_emojis2)c.push([r,wechat_emojis2[r]]);for(var r in ppg_stickers)n.push([r,ppg_stickers[r]]);for(var r in pp_stickers)a.push([r,pp_stickers[r]]);emotionBar.init([["B站表情包",t],["微信表情包",c],["QQ表情包",e],["QQ GIF",o],["Scratch",i],["HSR PPG",n],["GI PP",a]])}();