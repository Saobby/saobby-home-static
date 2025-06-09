import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import "katex/dist/katex.min.css";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { emojis } from "@/assets/js/emojis.js";
import { markedEmoji } from "marked-emoji";
import { mediaPlugin } from "@/assets/js/markedCustomExt/moreMedia.js";
import { codeSpanPlugin } from "@/assets/js/markedCustomExt/moreCodeSpan.js";
import { codeBlockPlugin } from "@/assets/js/markedCustomExt/moreCodeBlock";
import { gebi, gebcn, fetch_data } from "@/assets/js/util.js";
import { tablePlugin } from "@/assets/js/markedCustomExt/moreTable.js";
import { linkTargetPlugin } from "@/assets/js/markedCustomExt/moreLink.js";

window.desmos_exp = {};

marked.setOptions({
    silent: true
});
marked.use(markedKatex({
    throwOnError: false,
    nonStandard: true
}));
marked.use(markedHighlight({
    emptyLangClass: "hljs",
    langPrefix: "hljs language-",
    highlight(code, lang, info) {
        if (lang && hljs.getLanguage(lang)) {
            return hljs.highlight(code, { language: lang }).value
        }
        return hljs.highlightAuto(code).value
    }
}));
marked.use(markedEmoji({
    emojis: emojis,
    unicode: false
}));
marked.use({  // 转义html
    walkTokens(token) {
        if (token.type === 'html') {
        token.type = 'text';
        token.text = token.raw;
        }
    }
});
marked.use(mediaPlugin());
marked.use(codeSpanPlugin());
marked.use(codeBlockPlugin());
marked.use(tablePlugin());
marked.use(linkTargetPlugin());

export function parseMd(markdown){
    return marked.parse(markdown);
}

window.render_desmos = function(desmos_id){
    const expressions = window.desmos_exp[desmos_id];
    var desmos = Desmos.GraphingCalculator(gebi(`desmos-${desmos_id}`));
    for (var index=0; index<expressions.length;index++){
        if (expressions[index]){
            desmos.setExpression({id: `expression${index+1}`, latex: expressions[index]});
        }
    }
    gebi(`desmos-${desmos_id}`).hidden = false;
}
window.desmos_loaded = false;
window.load_desmos = async function (callback){
    function finish_loading(){
        var ele = gebcn("desmos-loading-tips");
        for (var i=0;i<ele.length;i++){
        ele[i].hidden = true;
        }
        callback();
    }
    if (window.desmos_loaded){
        finish_loading();
        return;
    }
    var rep = await fetch_data("https://www.saobby.com/static/js/desmos.js", "GET", {});
    eval(rep.response_text);
    window.desmos_loaded = true;
    finish_loading();
}
window.switch_wrapper = function(id, vis){
    gebi(`marked-wrapper-div-${id}`).hidden = !vis;
    gebi(`marked-wrapper-fold-btn-${id}`).hidden = !vis;
    gebi(`marked-wrapper-unfold-btn-${id}`).hidden = vis;
}
window.parseMd = parseMd;