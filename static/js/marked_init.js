!function(){
    var mdr = new marked.Renderer;
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
        var t;
        return e.match(/^网易云音乐:\d+$/) ? (t = Math.random(),
        `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src_="https://music.163.com/outchain/player?type=2&id=${e.match(/\d+$/)[0]}&auto=0&height=66" id="music-player-${t}" hidden></iframe><a onclick="!function(t){var e=gebi('music-player-${t}');e.src=e.getAttribute('src_');e.hidden=!1;t.hidden=!0}(this);" href="javascript:;">点击加载网易云音乐</a>`) : "<code>" + e + "</code>"
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
