// Self-check for the guide preflight and colour maths:
//   node --experimental-strip-types scripts/check-brand-logic.ts
import assert from "node:assert/strict";
import { checkGuide } from "./check-brands.mjs";
import { hexToRgb, rgbToCmyk, rgbToHsl } from "../src/brand/color.ts";

assert.deepEqual(hexToRgb("#0099FF"), [0, 153, 255]);
assert.deepEqual(hexToRgb("#fff"), [255, 255, 255]);
assert.deepEqual(rgbToHsl([0, 153, 255]), [204, 100, 50]);
assert.deepEqual(rgbToHsl([12, 12, 12]), [0, 0, 5]);
assert.deepEqual(rgbToCmyk([0, 153, 255]), [100, 40, 0, 0]);
assert.deepEqual(rgbToCmyk([0, 0, 0]), [0, 0, 0, 100]);

const exists = (p: string) => p === "files/logo.svg";
const ok = { name: "X", blocks: [{ type: "logos", items: [{ name: "Logo", file: "files/logo.svg" }] }] };
assert.deepEqual(checkGuide(ok, exists), []);

const bad = (block: object) => checkGuide({ name: "X", blocks: [block] }, exists);
assert.equal(bad({ type: "logos", items: [{ name: "L", file: "../../index.html" }] }).length, 1, "path traversal");
assert.equal(bad({ type: "downloads", items: [{ label: "L", file: "/etc/passwd" }] }).length, 1, "absolute path");
assert.equal(bad({ type: "downloads", items: [{ label: "L", file: "javascript:alert(1)" }] }).length, 1, "scheme");
assert.equal(bad({ type: "downloads", items: [{ label: "L", file: "files/gone.pdf" }] }).length, 1, "missing file");
assert.equal(bad({ type: "colors", items: [{ name: "C", hex: "red;x" }] }).length, 1, "bad hex");
assert.equal(bad({ type: "gallery", items: [{ src: "files/logo.svg", alt: "" }] }).length, 1, "alt required");
assert.equal(bad({ type: "html" }).length, 1, "unknown block");
assert.deepEqual(bad({ type: "typography", items: [{ name: "F", role: "Text" }] }), [], "font file optional");
assert.equal(checkGuide({ name: "X", theme: { accent: "url(x)" }, blocks: [] }, exists).length, 1, "theme hex");

console.log("brand logic: ok");
