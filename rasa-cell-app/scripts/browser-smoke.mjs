import assert from "node:assert/strict";
import { promises as fs } from "node:fs";
import http from "node:http";
import path from "node:path";

import { chromium } from "playwright";

const root = path.resolve("dist");
const mimeTypes = new Map([
  [".css", "text/css; charset=utf-8"],
  [".html", "text/html; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".png", "image/png"],
  [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"]
]);

const server = http.createServer(async (request, response) => {
  try {
    const pathname = decodeURIComponent(new URL(request.url, "http://localhost").pathname);
    const relative = pathname === "/" ? "index.html" : pathname.replace(/^\/+/, "");
    const file = path.resolve(root, relative);
    if (file !== root && !file.startsWith(`${root}${path.sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }

    const content = await fs.readFile(file);
    response.writeHead(200, {
      "Cache-Control": "no-store",
      "Content-Type": mimeTypes.get(path.extname(file)) || "application/octet-stream"
    });
    response.end(content);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500).end("Not found");
  }
});

await new Promise((resolve, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", resolve);
});

const address = server.address();
const origin = `http://127.0.0.1:${address.port}/`;
let browser;

try {
  browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ serviceWorkers: "allow" });
  const page = await context.newPage();
  const pageErrors = [];
  page.on("pageerror", (error) => pageErrors.push(error.message));

  await page.goto(origin, { waitUntil: "networkidle" });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) {
      await new Promise((resolve) => navigator.serviceWorker.addEventListener("controllerchange", resolve, { once: true }));
    }
  });

  assert.equal(await page.locator(".stage-item").count(), 9, "online load must render all nine stages");
  assert.equal(await page.locator("#stage-name").innerText(), "پی و جانمایی دیجیتال");

  await context.setOffline(true);
  await page.reload({ waitUntil: "domcontentloaded" });
  await page.locator(".stage-item").first().waitFor({ state: "visible" });

  assert.equal(await page.locator(".stage-item").count(), 9, "offline reload must render all nine stages");
  assert.equal(await page.locator("#stage-name").innerText(), "پی و جانمایی دیجیتال");
  assert.match(await page.locator("#offline-status").innerText(), /آفلاین/);
  assert.deepEqual(pageErrors, [], `page errors: ${pageErrors.join(" | ")}`);

  console.log("Browser smoke test passed: installed service worker served a complete offline reload.");
} finally {
  await browser?.close();
  await new Promise((resolve) => server.close(resolve));
}
