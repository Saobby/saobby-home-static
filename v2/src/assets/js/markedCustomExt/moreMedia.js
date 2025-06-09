// converted by ChatGPT from /static/js/marked_init.js

import { rsc } from "@/assets/js/util.js";

export function mediaPlugin() {
  return {
    extensions: [
      {
        name: "mediaImage",
        level: "inline",
        start(src) {
          return src.match(/!\[.*?@?(?:Audio|Video)?\]/)?.index;
        },
        tokenizer(src) {
          const match = /^!\[(.*?)@?(Audio|Video)?\]\((.*?)(?:\s+['"](.*?)['"])?\)/.exec(src);
          if (!match) return;
          return {
            type: "mediaImage",
            raw: match[0],
            alt: match[1],
            mediaType: match[2] || "Image",
            href: match[3],
            title: match[4] || ""
          };
        },
        renderer(token) {
          const eid = `media-${Math.random().toString(36).slice(2)}`;
          const { href, alt, mediaType, title } = token;

          let html = "";
          if (mediaType === "Audio") {
            html = `<audio src_="${rsc(href)}" title="${rsc(title)}" class="marked-audio" preload="auto" id="${eid}" controls hidden>你的浏览器不支持使用AudioTag播放音频</audio>`;
          } else if (mediaType === "Video") {
            html = `<video src_="${rsc(href)}" title="${rsc(title)}" class="marked-video" preload="auto" id="${eid}" controls hidden>你的浏览器不支持使用VideoTag播放视频</video>`;
          } else {
            html = `<img src_="${rsc(href)}" alt="${rsc(alt)}" title="${rsc(title)}" class="marked-img" id="${eid}" hidden>`;
          }

          const label = mediaType === "Audio" ? "音频" : mediaType === "Video" ? "视频" : "图片";
          const showBtn = `<a onclick="(function(t){var e=document.getElementById('${eid}');e.src=e.getAttribute('src_');e.hidden=false;t.hidden=true})(this)" href="javascript:;">点击加载外部${label}</a>`;

          return html + showBtn;
        }
      }
    ]
  };
}
