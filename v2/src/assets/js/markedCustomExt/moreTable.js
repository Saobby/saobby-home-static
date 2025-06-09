import {parseMd} from "@/assets/js/initMarked.js";

export function tablePlugin() {
  return {
    renderer: {
      table(token) {
        const header = token.header;
        const rows = token.rows;
        const align = token.align;
        let ret = `<table class="wux-table">`;
        ret += `<thead><tr>`;
        for (let i = 0; i < header.length; i++) {
          ret += `<th align="${align[i] || 'left'}" style="text-align: ${align[i] || 'left'}">${parseMd(header[i].text)}</th>`;
        }
        ret += `</tr></thead>`;
        ret += `<tbody>`;
        for (let row of rows) {
            ret += `<tr>`;
            for (let i = 0; i < row.length; i++) {
                ret += `<td align="${align[i] || 'left'}" style="text-align: ${align[i] || 'left'}">${parseMd(row[i].text)}</td>`;
            }
            ret += `</tr>`;
        }
        ret += `</tbody>`;
        ret += `</table>`;
        return ret;
      }
    }
  };
}
