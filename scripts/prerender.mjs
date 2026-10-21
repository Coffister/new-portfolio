// Bakes the rendered app into dist/index.html so crawlers that don't run
// JavaScript (AI search bots) see the real content. The client hydrates it.
import { readFileSync, rmSync, writeFileSync } from "node:fs";

const { render, structuredData } = await import("../dist-ssr/entry-server.js");
const html = render();
const jsonLd = structuredData()
  .map((data) => `<script type="application/ld+json">${JSON.stringify(data).replace(/</g, "\\u003c")}</script>`)
  .join("");

// React emits resource hints (<link rel="preload">) ahead of the markup; they belong in <head>.
const hints = html.match(/^(<link[^>]*\/>)*/)[0];
const body = html.slice(hints.length);

const template = readFileSync("dist/index.html", "utf8");
if (!template.includes('<div id="root"></div>')) throw new Error("prerender: #root placeholder not found");

writeFileSync(
  "dist/index.html",
  template.replace("</head>", `${hints}${jsonLd}</head>`).replace('<div id="root"></div>', `<div id="root">${body}</div>`),
);
rmSync("dist-ssr", { recursive: true, force: true });
console.log(`prerender: ${body.length} chars of markup baked into dist/index.html`);
