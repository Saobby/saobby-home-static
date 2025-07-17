import { rsc } from "@/assets/js/util.js";

export function linkTargetPlugin() {
  return {
    renderer: {
      link(e) {
        const href = e.href || "";
        const text = e.text || "";
        const title = e.title || "";
        const titleAttr = title ? ` title="${rsc(title)}"` : "";
        return `<a href="${rsc(href)}" target="_blank" rel="noopener noreferrer"${titleAttr}>${rsc(text)}</a>`;
      }
    }
  };
}
