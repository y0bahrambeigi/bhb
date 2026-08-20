import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

test("publishes an installable Persian PWA manifest", async () => {
  const manifest = JSON.parse(await readFile("public/manifest.webmanifest", "utf8"));

  assert.equal(manifest.lang, "fa");
  assert.equal(manifest.dir, "rtl");
  assert.equal(manifest.display, "standalone");
  assert.equal(manifest.scope, "/");
  assert.ok(manifest.icons.some((icon) => icon.sizes === "any"));
  assert.ok(manifest.icons.some((icon) => icon.purpose.includes("maskable")));
});

test("service worker caches the dashboard and official report", async () => {
  const source = await readFile("public/sw.js", "utf8");

  assert.match(source, /\"\/\"/);
  assert.match(source, /\/report\/official/);
  assert.match(source, /offline\.html/);
  assert.match(source, /request\.mode === \"navigate\"/);
  assert.match(source, /!url\.pathname\.startsWith\(\"\/api\/\"\)/);
});
