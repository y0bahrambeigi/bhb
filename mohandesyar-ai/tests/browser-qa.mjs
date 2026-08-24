import assert from "node:assert/strict";
import {createServer} from "node:http";
import {readFile, mkdtemp} from "node:fs/promises";
import {tmpdir} from "node:os";
import path from "node:path";
import {fileURLToPath} from "node:url";
import {chromium} from "playwright";
import {PDFDocument} from "pdf-lib";

const appRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const repoRoot = path.resolve(appRoot, "..");
const publicPrefix = "/bhb/";
const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webmanifest": "application/manifest+json; charset=utf-8"
};
let serveUpdatedWorker = false;

function localPath(urlPath) {
  const stripped = urlPath.startsWith(publicPrefix) ? urlPath.slice(publicPrefix.length) : urlPath.slice(1);
  const normalized = stripped.endsWith("/") ? `${stripped}index.html` : stripped;
  const resolved = path.resolve(repoRoot, normalized);
  if (!resolved.startsWith(`${repoRoot}${path.sep}`)) throw new Error("Invalid test route");
  return resolved;
}

const server = createServer(async (request, response) => {
  try {
    const url = new URL(request.url, "http://127.0.0.1");
    const filename = localPath(url.pathname);
    let content = await readFile(filename);
    if (serveUpdatedWorker && url.pathname === "/bhb/mohandesyar-ai/sw.js") {
      content = Buffer.from(content.toString("utf8").replace('const VERSION = "2.0.0";', 'const VERSION = "2.0.1-qa";'));
    }
    response.writeHead(200, {
      "Content-Type": mimeTypes[path.extname(filename)] || "application/octet-stream",
      "Cache-Control": url.pathname.endsWith("/sw.js") ? "no-store" : "no-cache"
    });
    response.end(content);
  } catch {
    response.writeHead(404, {"Content-Type": "text/plain"});
    response.end("Not found");
  }
});

await new Promise(resolve => server.listen(0, "127.0.0.1", resolve));
const {port} = server.address();
const baseUrl = `http://127.0.0.1:${port}/bhb/mohandesyar-ai/`;
const qaTemp = await mkdtemp(path.join(tmpdir(), "mohandesyar-qa-"));
const backupPath = path.join(qaTemp, "backup.json");
const pdfPath = path.join(qaTemp, "report.pdf");
const imageBuffer = await readFile(path.join(appRoot, "app-icon-192.png"));
const videoBuffer = Buffer.from([0x1a, 0x45, 0xdf, 0xa3, 0x9f, 0x42, 0x86, 0x81, 0x01]);

const browser = await chromium.launch({headless: true});
const context = await browser.newContext({
  acceptDownloads: true,
  geolocation: {latitude: 37.5527, longitude: 45.0761},
  permissions: ["geolocation"],
  serviceWorkers: "allow"
});
const page = await context.newPage();
page.on("dialog", dialog => dialog.accept());

try {
  await page.goto(baseUrl, {waitUntil: "networkidle"});
  await page.waitForFunction(() => document.querySelector("#project-count")?.textContent !== "۰");
  await page.waitForFunction(() => navigator.serviceWorker.controller);

  await page.locator('[name="name"]').fill("آزمون انتشار مهندس‌یار ۲");
  const longPersian = "این بند برای کنترل صفحه‌بندی گزارش فارسی، راست‌به‌چپ بودن متن و خوانایی خروجی PDF ثبت شده است. ".repeat(90);
  await page.locator('[name="description"]').fill(longPersian);
  await page.locator('[name="findings"]').fill(longPersian);
  await page.locator('[name="recommendations"]').fill(longPersian);
  await page.locator("#capture-location").check();

  const images = Array.from({length: 6}, (_, index) => ({
    name: `evidence-${index + 1}.png`,
    mimeType: "image/png",
    buffer: imageBuffer
  }));
  await page.locator("#file-input").setInputFiles(images);
  await page.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 6);
  await page.locator("#file-input").setInputFiles({name: "field-video.webm", mimeType: "video/webm", buffer: videoBuffer});
  await page.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 7);

  await page.reload({waitUntil: "networkidle"});
  await page.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 7);
  assert.equal(await page.locator(".evidence-preview img").count(), 6, "Six persisted image previews are required");
  assert.equal(await page.locator(".evidence-preview video").count(), 1, "The persisted video preview is required");
  assert.equal(await page.locator(".evidence-location").count(), 7, "GPS metadata must persist with every captured file");
  assert.equal(await page.locator(".evidence-hash").count(), 7, "Every evidence file must retain a SHA-256 value");

  const downloadEvent = page.waitForEvent("download");
  await page.locator("#export-backup").click();
  const download = await downloadEvent;
  await download.saveAs(backupPath);
  const backup = JSON.parse(await readFile(backupPath, "utf8"));
  assert.equal(backup.evidence.length, 7);
  assert.ok(backup.evidence.every(item => item.dataUrl?.startsWith("data:")), "Backup must include every evidence blob");

  await page.locator("#delete-project").click();
  await page.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 0);
  await page.locator("#replace-on-import").check();
  await page.locator("#import-backup").setInputFiles(backupPath);
  await page.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 7);
  assert.equal(await page.locator('[name="name"]').inputValue(), "آزمون انتشار مهندس‌یار ۲");

  await page.goto(`${baseUrl}report/`, {waitUntil: "networkidle"});
  await page.locator("#print-report:not([disabled])").waitFor();
  assert.equal(await page.locator("html").getAttribute("dir"), "rtl");
  assert.equal(await page.locator(".report-evidence-preview img").count(), 6);
  assert.equal(await page.locator(".report-evidence-preview img").evaluateAll(images => images.filter(image => image.complete && image.naturalWidth > 0).length), 6, "Printed thumbnails must not be blank");
  assert.equal(await page.locator("#report-watermark").isVisible(), true, "Report watermark must remain visible");
  await page.pdf({path: pdfPath, format: "A4", printBackground: true});
  const pdf = await PDFDocument.load(await readFile(pdfPath));
  assert.ok(pdf.getPageCount() >= 2, "The Persian QA report must span multiple A4 pages");

  await page.goto(baseUrl, {waitUntil: "networkidle"});
  serveUpdatedWorker = true;
  await page.evaluate(async () => {
    const registration = await navigator.serviceWorker.getRegistration();
    const previousController = navigator.serviceWorker.controller;
    const controllerChanged = new Promise(resolve => {
      navigator.serviceWorker.addEventListener("controllerchange", resolve, {once: true});
    });
    await registration.update();
    if (navigator.serviceWorker.controller === previousController) {
      await Promise.race([
        controllerChanged,
        new Promise((_, reject) => setTimeout(() => reject(new Error("Updated service worker did not activate")), 15_000))
      ]);
    }
  });
  await page.reload({waitUntil: "networkidle"});
  await page.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 7);
  assert.equal(await page.locator('[name="name"]').inputValue(), "آزمون انتشار مهندس‌یار ۲", "Service-worker updates must preserve IndexedDB projects");

  await context.setOffline(true);
  const offlinePage = await context.newPage();
  await offlinePage.goto(baseUrl, {waitUntil: "domcontentloaded"});
  await offlinePage.waitForFunction(() => document.querySelectorAll(".evidence-card").length === 7);
  assert.match(await offlinePage.locator("#connection").textContent(), /اینترنت قطع است/);

  console.log(`Browser QA passed: 6 images, 1 video, backup/restore, ${pdf.getPageCount()}-page Persian PDF, service-worker update, IndexedDB retention, and offline relaunch.`);
} finally {
  await browser.close();
  await new Promise(resolve => server.close(resolve));
}
