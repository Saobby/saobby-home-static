!function(){
    var mdr = new marked.Renderer;
    mdr.image = function(e, t, n) {
        var d = Math.random();
        return `<img src_="${rsc(e)}" alt="${rsc(n)}" title="${t || ""}" class="marked-img" id="marked-img-${d}" hidden><a onclick="!function(t){var e=gebi('marked-img-${d}');e.src=e.getAttribute('src_');e.hidden=!1;t.hidden=!0}(this);" href="javascript:;">点击加载外部图片</a>`
    }
    mdr.table = function(e, t) {
        return '<table class="wux-table">\n<thead>\n' + e + "</thead>\n" + (t && "<tbody>" + t + "</tbody>") + "</table>\n"
    }
    mdr.codespan = function(e) {
        var t;
        return e.match(/^网易云音乐:\d+$/) ? (t = Math.random(),
        `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width=330 height=86 src_="//music.163.com/outchain/player?type=2&id=${e.match(/\d+$/)[0]}&auto=0&height=66" id="music-player-${t}" hidden></iframe><a onclick="!function(t){var e=gebi('music-player-${t}');e.src=e.getAttribute('src_');e.hidden=!1;t.hidden=!0}(this);" href="javascript:;">点击加载网易云音乐</a>`) : "<code>" + e + "</code>"
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