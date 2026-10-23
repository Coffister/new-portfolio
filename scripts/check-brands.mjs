// Preflight for public/brands/<slug>/guide.json, run before every build:
//   node scripts/check-brands.mjs
// Fails the build on a broken guide instead of shipping it to a client.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { join } from "node:path";

const ROOT = "public/brands";
const HEX = /^#([0-9a-f]{3}|[0-9a-f]{6})$/i;
const SLUG = /^[a-z0-9-]+$/;
const BLOCKS = ["logos", "colors", "typography", "gallery", "text", "downloads"];
const FILE_KEYS = { logos: "file", typography: "file", gallery: "src", downloads: "file" };

export function checkGuide(guide, fileExists) {
  const errors = [];
  const str = (v) => typeof v === "string" && v.trim() !== "";
  const path = (p, where) => {
    // relative path inside the brand folder only: no "..", no scheme, no leading slash
    if (!str(p) || p.startsWith("/") || p.includes("..") || p.includes(":") || p.includes("\\")) {
      errors.push(`${where}: unsafe path ${JSON.stringify(p)}`);
    } else if (!fileExists(p)) errors.push(`${where}: missing file ${p}`);
  };

  if (!str(guide?.name)) errors.push("name is required");
  for (const [key, value] of Object.entries(guide?.theme ?? {})) {
    if (!HEX.test(value)) errors.push(`theme.${key}: not a hex colour`);
  }
  if (guide?.cover !== undefined) path(guide.cover, "cover");
  if (!Array.isArray(guide?.blocks)) return [...errors, "blocks must be an array"];

  guide.blocks.forEach((block, i) => {
    const where = `blocks[${i}]`;
    if (!BLOCKS.includes(block?.type)) return errors.push(`${where}: unknown type ${block?.type}`);
    if (block.type === "text") {
      if (!str(block.title) || !str(block.text)) errors.push(`${where}: text needs title and text`);
      return;
    }
    if (!Array.isArray(block.items) || block.items.length === 0) return errors.push(`${where}: items are empty`);
    block.items.forEach((item, j) => {
      const at = `${where}.items[${j}]`;
      if (block.type === "colors") {
        if (!str(item.name) || !HEX.test(item.hex ?? "")) errors.push(`${at}: colour needs name and hex`);
      } else if (block.type === "gallery") {
        if (!str(item.alt)) errors.push(`${at}: image needs alt text`);
      } else if (!str(item.name ?? item.label)) errors.push(`${at}: name is required`);
      const key = FILE_KEYS[block.type];
      // colours carry no file; a font file is optional (preview only)
      if (key && (item[key] !== undefined || block.type !== "typography")) path(item[key], at);
    });
  });
  return errors;
}

if (import.meta.url === `file://${process.argv[1]}`) {
  let failed = false;
  const slugs = existsSync(ROOT) ? readdirSync(ROOT) : [];
  for (const slug of slugs) {
    const dir = join(ROOT, slug);
    let errors;
    if (!SLUG.test(slug)) errors = ["folder name must be a-z, 0-9 and -"];
    else {
      try {
        const guide = JSON.parse(readFileSync(join(dir, "guide.json"), "utf8"));
        errors = checkGuide(guide, (p) => existsSync(join(dir, p)));
      } catch (e) {
        errors = [`guide.json: ${e.message}`];
      }
    }
    for (const error of errors) console.error(`brands/${slug}: ${error}`);
    failed ||= errors.length > 0;
  }
  if (failed) process.exit(1);
  console.log(`brands: ${slugs.length} guide(s) ok`);
}
