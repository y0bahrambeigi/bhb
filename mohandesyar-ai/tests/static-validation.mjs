import assert from "node:assert/strict";
import {access, readFile} from "node:fs/promises";
import {fileURLToPath} from "node:url";
import path from "node:path";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const read = file => readFile(path.join(root, file), "utf8");

const requiredFiles = [
  "index.html", "styles.css", "app.js", "db.js", "sw.js", "offline.html",
  "manifest.webmanifest", "app-icon.svg", "app-icon-192.png", "app-icon-512.png",
  "report/index.html", "report/report.js", "print.css", "README.md"
];
await Promise.all(requiredFiles.map(file => access(path.join(root, file))));

const [index, app, db, serviceWorker, report, manifestText] = await Promise.all([
  read("index.html"), read("app.js"), read("db.js"), read("sw.js"), read("report/index.html"), read("manifest.webmanifest")
]);
const manifest = JSON.parse(manifestText);

assert.match(index, /<html lang="fa" dir="rtl">/, "Persian RTL attributes are required");
assert.match(index, /type="module" src="\.\/app\.js"/, "The dashboard must load the module application");
assert.doesNotMatch(index, /پروژه مسکونی آریا/, "Demo project data must not ship in the production UI");
assert.match(db, /indexedDB\.open/, "IndexedDB persistence is required");
assert.match(db, /blob:\s*file/, "Evidence file blobs must be persisted");
assert.match(db, /SHA-256/, "Evidence hashing must be SHA-256");
assert.match(app, /navigator\.geolocation/, "Optional geolocation capture must be implemented");
assert.match(report, /src="\.\/report\.js"/, "The report must load the dynamic report module");
assert.equal(manifest.start_url, "/bhb/mohandesyar-ai/", "Installed offline launch must use the cached canonical URL");
assert.equal(manifest.scope, "/bhb/mohandesyar-ai/");
assert.equal(manifest.dir, "rtl");
assert.equal(manifest.lang, "fa");
assert.ok(manifest.icons.some(icon => icon.sizes === "192x192"));
assert.ok(manifest.icons.some(icon => icon.sizes === "512x512"));
assert.match(serviceWorker, /key\.startsWith\(CACHE_PREFIX\)/, "Cache cleanup must be namespace-scoped");
assert.doesNotMatch(serviceWorker, /filter\(key\s*=>\s*key\s*!==\s*CACHE\)/, "Global origin cache deletion is forbidden");

for (const asset of ["db.js", "report/report.js", "offline.html", "manifest.webmanifest"]) {
  assert.ok(serviceWorker.includes(asset), `${asset} must be available offline`);
}

console.log("MohandesYar AI static release validation passed.");
