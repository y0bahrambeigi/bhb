import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import {fileURLToPath} from "node:url";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const required = [
  "index.html", "styles.css", "app.js", "calculations.js", "book-content.html",
  "manifest.webmanifest", "sw.js", "icons/icon.svg", "icons/icon-192.png", "icons/icon-512.png",
];
for (const file of required) assert.ok(fs.existsSync(path.join(root, file)), `missing ${file}`);

const html = fs.readFileSync(path.join(root, "index.html"), "utf8");
const book = fs.readFileSync(path.join(root, "book-content.html"), "utf8");
const manifest = JSON.parse(fs.readFileSync(path.join(root, "manifest.webmanifest"), "utf8"));
assert.equal(manifest.display, "standalone");
assert.equal(manifest.dir, "rtl");
assert.equal(manifest.lang, "fa");
assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
assert.match(html, /apple-mobile-web-app-capable/);
assert.match(html, /viewport-fit=cover/);
assert.doesNotMatch(book, /bhb\/publications\/smart-structures\/webapp/);
assert.ok((book.match(/<h1/g) || []).length >= 18, "full book headings were not generated");
for (let i = 1; i <= 11; i++) assert.ok(fs.existsSync(path.join(root, `assets/book/media/image${i}.webp`)), `missing book image ${i}`);

const context = vm.createContext({globalThis: {}});
vm.runInContext(fs.readFileSync(path.join(root, "calculations.js"), "utf8"), context);
const calc = context.globalThis.SmartCalc;
const sdof = calc.sdof(1e6, 1, 0.02, 1);
assert.ok(Math.abs(sdof.stiffness / 1e6 - 39.4784) < 1e-3);
assert.ok(Math.abs(sdof.damping / 1e6 - 0.251327) < 1e-4);
assert.ok(Math.abs(sdof.magnification - 25) < 1e-10);
const resonance = calc.resonance(0.30, 1, 0.02, 0.20);
assert.ok(Math.abs(resonance.before - 1.8631) < 1e-3);
assert.ok(Math.abs(resonance.after - 0.18631) < 1e-3);
assert.ok(Math.abs(resonance.reduction - 90) < 1e-10);
const isolation = calc.baseIsolation(1e6, 9869604, 0.15);
assert.ok(Math.abs(isolation.period - 2) < 1e-5);
assert.ok(Math.abs(calc.viscousDamper(1800, 0.5, 0.45) - 1207.4767) < 1e-3);

console.log("Smart Structures webapp validation passed.");
