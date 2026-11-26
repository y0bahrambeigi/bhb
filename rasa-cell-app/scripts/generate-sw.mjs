import { createHash } from "node:crypto";
import { promises as fs } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const dist = path.resolve("dist");

async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(entries.map(async (entry) => {
    const absolute = path.join(directory, entry.name);
    return entry.isDirectory() ? walk(absolute) : absolute;
  }));
  return files.flat();
}

export async function collectPrecacheEntries(directory = dist) {
  const files = (await walk(directory)).filter((file) => !file.endsWith("sw.js"));
  const entries = await Promise.all(files.map(async (file) => ({
    url: `./${path.relative(directory, file).split(path.sep).join("/")}`,
    digest: createHash("sha256").update(await fs.readFile(file)).digest("hex")
  })));
  return entries.sort((left, right) => left.url.localeCompare(right.url));
}

export function createCacheVersion(entries) {
  const fingerprint = entries.map(({ url, digest }) => `${url}:${digest}`).join("\n");
  return createHash("sha256").update(fingerprint).digest("hex").slice(0, 12);
}

export async function generateServiceWorker(directory = dist) {
  const entries = await collectPrecacheEntries(directory);
  const files = entries.map(({ url }) => url);
  const hash = createCacheVersion(entries);
  const source = `const CACHE = "rasa-cell-${hash}";
const PRECACHE = ${JSON.stringify(files, null, 2)};

self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((key) => key.startsWith("rasa-cell-") && key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  event.respondWith(
    caches.match(event.request, { ignoreSearch: true }).then((cached) => {
      if (cached) return cached;
      return fetch(event.request).then((response) => {
        if (!response || response.status !== 200) return response;
        const copy = response.clone();
        caches.open(CACHE).then((cache) => cache.put(event.request, copy));
        return response;
      }).catch(() => caches.match("./index.html"));
    })
  );
});
`;

  await fs.writeFile(path.join(directory, "sw.js"), source);
  console.log(`Generated offline cache rasa-cell-${hash} with ${files.length} assets.`);
  return { cache: `rasa-cell-${hash}`, files };
}

const invokedPath = process.argv[1] ? path.resolve(process.argv[1]) : null;
if (invokedPath === fileURLToPath(import.meta.url)) await generateServiceWorker();
