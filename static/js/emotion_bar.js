var emotionBar = (function (){
    var sticker_packs = ["HSR PPG", "GI PP"];
    var target_textarea = null;
    var ret = {};
    var all_emotions = [];
    function load_emotions(pack_index){
        var imgs = gebcn(`emotion-img-${pack_index}`);
        for (var i=0; i<imgs.length; i++){
            var img = imgs[i];
            if (img.getAttribute("src_")){
                img.src = img.getAttribute("src_");
                img.removeAttribute("src_");
            }
        }
    }
    ret.init = (emotions) => {
        all_emotions = emotions;
        var select_pack_html = `<div id="emotion-select-pack-div" style="width:100%;height:65px;overflow-y:hidden;overflow-x:auto;" class="wux-tab"><div style="white-space:nowrap;">`;
        for (var pack_index in emotions){
            var pack = emotions[pack_index];
            select_pack_html += `<input class="wux-tab-item" type="radio" id="emotion-pack-select-${pack_index}" name="emotion-pack-select" onclick="emotionBar.select_pack(${pack_index});"${parseInt(pack_index)===0?" checked":""}><label class="wux-tab-item" for="emotion-pack-select-${pack_index}" style="display:inline-block;">${pack[0]}</label>`
        }
        select_pack_html += `</div></div>`;
        var emotions_html = "";
        for (var pack_index in emotions){
            var pack = emotions[pack_index];
            emotions_html += `<div id="emotion-select-div-${pack_index}" style="height:calc(100% - 130px);overflow-y:auto;line-height:40px;margin-top:10px;margin-bottom:10px;"${parseInt(pack_index)===0?"":" hidden"}>`;
            for (var emotion_index in pack[1]){
                var emotion = pack[1][emotion_index];
                if (is_in_array(sticker_packs, pack[0])){
                    emotions_html += `<a href="javascript:;" onclick="emotionBar.select_emotion(${pack_index},${emotion_index});" style="padding:8px;"><img height="64px" alt="${emotion[0]}" src_="${emotion[1]}" title="${emotion[0]}" class="emotion-img-${pack_index}"></a>`;
                }else{
                    emotions_html += `<a href="javascript:;" onclick="emotionBar.select_emotion(${pack_index},${emotion_index});" style="padding:8px;"><img width="24px" height="24px" alt="${emotion[0]}" src_="${emotion[1]}" title="${emotion[0]}" class="emotion-img-${pack_index}"></a>`;
                }
            }
            emotions_html += `</div>`;
        }
        var bar_html = `<div id="emotion-bar-div" style="position:fixed;top:calc(50vh - 175px);left:calc(50vw - 175px);width:350px;height:350px;background:#ffffff;" class="pre-like" hidden>${select_pack_html}${emotions_html}<button class="wux-btn wux-btn-primary wux-btn-outline" type="button", onclick="emotionBar.close();">${icon_with_text("x-primary", "关闭")}</button></div>`;
        gebi("emotion-bar").innerHTML = bar_html;
    };
    ret.show = (target) => {
        target_textarea = target;
        load_emotions(0);
        gebi("emotion-bar-div").hidden = false;
    };
    ret.close = () => {
        gebi("emotion-bar-div").hidden = true;
    }
    ret.select_pack = (pack_index) => {
        for (var i=0; i<all_emotions.length; i++){
            gebi(`emotion-select-div-${i}`).hidden = i!==pack_index;
        }
        load_emotions(pack_index);
    };
    ret.select_emotion = (pack_index, emotion_index) => {
        insert_into_textarea(`:${all_emotions[pack_index][1][emotion_index][0]}:`, target_textarea);
        ret.close();
    };
    ret.gen_open_btn = (textarea_id, size) => {
        return `<button class="wux-btn wux-btn-warning wux-btn-outline wux-btn-${size} simple" type="button" onclick="emotionBar.show(gebi('${textarea_id}'));">${icon_with_text("mood-happy", "表情")}</button>`;
    }
    return ret;
})();

(()=>{
    var bilibili = [];
    var scratch = [];
    var qq = [];
    var qq2 = [];
    var wechat = [];
    var ppg = [];
    var pp = [];
    for (var i in bilibili_emojis){
        bilibili.push([i, bilibili_emojis[i]]);
    }
    for (var i in scratch_emojis){
        scratch.push([i, scratch_emojis[i]]);
    }
    for (var i in qq_emojis1){
        qq.push([i, qq_emojis1[i]]);
    }
    for (var i in qq_emojis2){
        qq2.push([i, qq_emojis2[i]]);
    }
    for (var i in wechat_emojis1){
        wechat.push([i, wechat_emojis1[i]]);
    }
    for (var i in wechat_emojis2){
        wechat.push([i, wechat_emojis2[i]]);
    }
    for (var i in ppg_stickers){
        ppg.push([i, ppg_stickers[i]]);
    }
    for (var i in pp_stickers){
        pp.push([i, pp_stickers[i]]);
    }
    emotionBar.init([["B站表情包", bilibili], ["微信表情包", wechat], ["QQ表情包", qq2], ["QQ GIF", qq], ["Scratch", scratch], ["HSR PPG", ppg], ["GI PP", pp]]);
})();
