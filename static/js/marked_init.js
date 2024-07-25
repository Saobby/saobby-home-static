var desmos_exp = {};
function render_desmos(desmos_id, expressions){
    var desmos = Desmos.GraphingCalculator(gebi(`desmos-${desmos_id}`));
    for (var index=0; index<expressions.length;index++){
        if (expressions[index]){
            desmos.setExpression({id: `expression${index+1}`, latex: expressions[index]});
        }
    }
    gebi(`desmos-${desmos_id}`).hidden = false;
}
var desmos_loaded = false;
async function load_desmos(callback){
    function finish_loading(){
        var ele = gebcn("desmos-loading-tips");
        for (var i=0;i<ele.length;i++){
           ele[i].hidden = true;
        }
        callback();
    }
    if (desmos_loaded){
        finish_loading();
        return;
    }
    var rep = await fetch_data("/static/js/desmos.js", "GET", {});
    eval(rep.response_text);
    desmos_loaded = true;
    finish_loading();
}
function switch_wrapper(id, vis){
    gebi(`marked-wrapper-div-${id}`).hidden = !vis;
    gebi(`marked-wrapper-fold-btn-${id}`).hidden = !vis;
    gebi(`marked-wrapper-unfold-btn-${id}`).hidden = vis;
}
!function(){
    var mdr = new marked.Renderer;
    var mdr_ = new marked.Renderer;
    mdr.image = function(src, title, alt) {
        var eid = "marked-generated-" + Math.random().toString();
        if (alt === "@Audio"){
            var media_type = "音频";
            var media_html = `<audio src_="${rsc(src)}" title="${title || ""}" class="marked-audio" preload="auto" id="${eid}" controls hidden>你的浏览器不支持使用AudioTag播放音频</audio>`;
        }else if (alt === "@Video"){
            var media_type = "视频";
            var media_html = `<video src_="${rsc(src)}" title="${title || ""}" class="marked-video" preload="auto" id="${eid}" controls hidden>你的浏览器不支持使用VideoTag播放视频</video>`;
        }else{
            var media_type = "图片";
            var media_html = `<img src_="${rsc(src)}" alt="${rsc(alt)}" title="${title || ""}" class="marked-img" id="${eid}" hidden>`;
        }
        var show_btn = `<a onclick="!function(t){var e=gebi('${eid}');e.src=e.getAttribute('src_');e.hidden=!1;t.hidden=!0}(this);" href="javascript:;">点击加载外部${media_type}</a>`;
        return media_html + show_btn;
    }
    mdr.table = function(e, t) {
        return '<table class="wux-table">\n<thead>\n' + e + "</thead>\n" + (t && "<tbody>" + t + "</tbody>") + "</table>\n"
    }
    mdr.codespan = function(e) {
        if (e === "[ ]"){
            return '<input class="wux-form-checks" type="checkbox" disabled>';
        }else if (e === "[x]"){
            return '<input class="wux-form-checks" type="checkbox" checked disabled>';
        }else if (e.match(/^黑幕:.+$/)){
            return `<span style="background-color:#000" onclick="this.style.backgroundColor='rgba(255, 255, 255, 0)';">${rsc(e)}</span>`;
        }
        var t;
        return e.match(/^网易云音乐:\d+$/) ? (t = Math.random(),
        `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src_="https://music.163.com/outchain/player?type=2&id=${e.match(/\d+$/)[0]}&auto=0&height=66" id="music-player-${t}" hidden></iframe><a onclick="!function(t){var e=gebi('music-player-${t}');e.src=e.getAttribute('src_');e.hidden=!1;t.hidden=!0}(this);" href="javascript:;">点击加载网易云音乐</a>`) : "<code>" + e + "</code>"
    }
    mdr.code = function(code, lang, a){
        if (lang === "desmos"){
            var cid = Math.random();
            desmos_exp[cid] = code.split("\n");
            var html = `<span class="desmos-loading-tips" id="desmos-loading-tips-${cid}" hidden>正在加载Desmos...</span><div id="desmos-${cid}" style="width:100%;height:500px;" hidden></div><a href="javascript:;" onclick="this.hidden=!0;gebi('desmos-loading-tips-${cid}').hidden=!1;load_desmos(function(){render_desmos(${cid}, desmos_exp[${cid}]);}).then();">点击加载Desmos计算器</a>`;
            return html;
        }else if (lang === "wrapper"){
            var wid = Math.random();
            return `<span><a href="javascript:;" id="marked-wrapper-unfold-btn-${wid}" onclick="switch_wrapper(${wid},true);">${icon_with_text("caret-down-primary", "展开隐藏的内容")}</a><a href="javascript:;" id="marked-wrapper-fold-btn-${wid}" onclick="switch_wrapper(${wid},false);" hidden>${icon_with_text("caret-up-primary", "收起隐藏的内容")}</a></span><br><div id="marked-wrapper-div-${wid}" hidden>${marked.parse(code)}</div>`;
        }else{
            return mdr_.code(code, lang, a);
        }
    }
    marked.setOptions({
        tables: true,
        sanitize: true,
        smartLists: true,
        silent: true,
        renderer: mdr,
        headerIds: false
    });
    marked.use(markedKatex({
        throwOnError: false
    }));
    marked.use(markedEmoji.markedEmoji({
        emojis: emojis,
        unicode: false
    }));
}();
