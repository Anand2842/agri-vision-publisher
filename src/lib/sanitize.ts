import xss from "xss";
import type * as XSS from "xss";

// HTML sanitizer that works in the browser and on the server (Cloudflare Workers).
// isomorphic-dompurify needs jsdom on the server, which fails there, so pages using it
// were sent to search engines with an empty body.
// xss is CommonJS: use the default import (the module object) so it loads under strict
// ESM too; its typings describe that object as the named exports.
const { filterXSS, getDefaultWhiteList } = xss as unknown as typeof XSS;
const whiteList = getDefaultWhiteList();
for (const tag of ["p", "div", "span", "h1", "h2", "h3", "h4", "h5", "h6", "figure", "img", "a", "table", "td", "th"]) {
  whiteList[tag] = [...(whiteList[tag] ?? []), "class", "id"];
}
whiteList.img = [...(whiteList.img ?? []), "loading"];
whiteList.a = [...(whiteList.a ?? []), "rel"];

export function sanitizeHtml(html: string | null | undefined) {
  return filterXSS(html ?? "", {
    whiteList,
    stripIgnoreTag: true,
    stripIgnoreTagBody: ["script", "style"],
  });
}
