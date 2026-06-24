import { rsc } from "@/assets/js/util.js";

export function codeSpanPlugin() {
  return {
    extensions: [
      {
        name: "customCodespan",
        level: "inline",
        start(src) {
          return src.indexOf("[");
        },
        tokenizer(src) {
          const checkboxMatch = /^\`\[( |x)\]\`/.exec(src);
          if (checkboxMatch) {
            return {
              type: "customCodespan",
              raw: checkboxMatch[0],
              kind: "checkbox",
              checked: checkboxMatch[1] === "x"
            };
          }

          const spoilerMatch = /^\`(黑幕|剧透):([^\s\n`]+)\`/.exec(src);
          if (spoilerMatch) {
            return {
              type: "customCodespan",
              raw: spoilerMatch[0],
              kind: "spoiler",
              text: spoilerMatch[2]
            };
          }

          const musicMatch = /^\`网易云音乐:(\d+)\`/.exec(src);
          if (musicMatch) {
            return {
              type: "customCodespan",
              raw: musicMatch[0],
              kind: "music",
              id: musicMatch[1]
            };
          }

          return;
        },
        renderer(token) {
          if (token.kind === "checkbox") {
            return `<input class="wux-form-checks" type="checkbox" ${token.checked ? "checked" : ""} disabled>`;
          } else if (token.kind === "spoiler") {
            return `<span class="spoilers-bg" style="cursor:pointer;" title="剧透内容,点击显示 Spoilers.Click to reveal" onclick="this.style.backgroundColor='rgba(255,255,255,0)';this.title='';this.style.cursor='text';">${rsc(token.text)}</span>`;
          } else if (token.kind === "music") {
            const eid = `music-${Math.random().toString(36).slice(2)}`;
            return `<iframe frameborder="no" border="0" marginwidth="0" marginheight="0" width="330" height="86" src_="https://music.163.com/outchain/player?type=2&id=${token.id}&auto=0&height=66" id="${eid}" hidden></iframe><a onclick="(function(t){var e=document.getElementById('${eid}');e.src=e.getAttribute('src_');e.hidden=false;t.hidden=true})(this)" href="javascript:;">点击加载网易云音乐</a>`;
          }
        }
      }
    ]
  };
}
