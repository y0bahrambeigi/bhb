const CACHE_NAME = "python-academy-yousef-pages-v3";
const BASE_URL = new URL("./", self.registration.scope);
const CORE = [
  "./", "./index.html", "./manifest.webmanifest", "./favicon.svg",
  "./icon-192.png", "./icon-512.png", "./apple-touch-icon.png",
  "./assets/index-CPpVOKx_.css", "./assets/index-BfHxFA1W.js",
  "./assets/page-CLR9xq8Z.js", "./assets/framework-CXnKph_e.js",
  "./assets/layout-segment-context-BEXM-2mF.js", "./assets/rolldown-runtime-S-ySWqyJ.js",
  "./assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-f6b33328.woff2",
  "./assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44745446.woff2",
  "./assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-44e03052.woff2",
  "./assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-013b2f2f.woff2",
  "./assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-0638449e.woff2",
  "./assets/_vinext_fonts/geist-mono-00e989178794/geist-mono-971fb274.woff2",
  "./pyodide/pyodide.js", "./pyodide/pyodide.asm.mjs", "./pyodide/pyodide.asm.wasm",
  "./pyodide/python_stdlib.zip", "./pyodide/pyodide-lock.json"
].map(path => new URL(path, BASE_URL).href);

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(names => Promise.all(names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE_NAME).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(() => caches.match(new URL("./index.html", BASE_URL).href))));
});
