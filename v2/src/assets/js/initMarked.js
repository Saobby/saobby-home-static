import { marked } from "marked";
import markedKatex from "marked-katex-extension";
import "katex/dist/katex.min.css";
import { markedHighlight } from "marked-highlight";
import hljs from "highlight.js";
import "highlight.js/styles/github.css";
import { emojis } from "@/assets/js/emojis.js";
import { markedEmoji } from "marked-emoji";

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
export function parseMd(markdown){
    return marked.parse(markdown);
}