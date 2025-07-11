export function codeBlockPlugin() {

  return {
    extensions: [
      {
        name: "customCodeBlock",
        level: "block",
        start(src) {
          return src.match(/(`{3,}|~{3,})(desmos|wrapper)/)?.index;
        },
        tokenizer(src) {
          const match = /^(`{3,}|~{3,})(desmos|wrapper)\n([\s\S]*?)\n\1/.exec(src);
          if (!match) return;
          return {
            type: "customCodeBlock",
            raw: match[0],
            lang: match[2],
            text: match[3]
          };
        },
        renderer(token) {
          if (token.lang === "desmos") {
            const cid = Math.random();
            window.desmos_exp[cid] = token.text.split("\n");
            return `<span class="desmos-loading-tips" id="desmos-loading-tips-${cid}" hidden>正在加载Desmos...</span><div id="desmos-${cid}" style="width:100%;height:500px;" hidden></div><a href="javascript:;" onclick="this.hidden=true;document.getElementById('desmos-loading-tips-${cid}').hidden=false;load_desmos(function(){render_desmos(${cid});});">点击加载Desmos计算器</a>`;
          }

          if (token.lang === "wrapper") {
            const wid = Math.random();
            return `<span><a href="javascript:;" id="marked-wrapper-unfold-btn-${wid}" onclick="switch_wrapper(${wid},true);">&#x25BC; 展开隐藏的内容</a><a href="javascript:;" id="marked-wrapper-fold-btn-${wid}" onclick="switch_wrapper(${wid},false);" hidden>&#x25B2; 收起隐藏的内容</a></span><br><div id="marked-wrapper-div-${wid}" hidden>${window.parseMd(token.text)}</div>`;
          }

          return false; // fallback to default
        }
      }
    ]
  };
}
