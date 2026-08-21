const CACHE = "mohandesyar-pages-v1";
const BASE = "/bhb/mohandesyar-ai/";
const ASSETS = [BASE, `${BASE}index.html`, `${BASE}styles.css`, `${BASE}app.js`, `${BASE}print.css`, `${BASE}manifest.webmanifest`, `${BASE}app-icon.svg`, `${BASE}app-icon-192.png`, `${BASE}app-icon-512.png`, `${BASE}offline.html`, `${BASE}report/`, `${BASE}report/index.html`];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});
self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  }).catch(async () => (await caches.match(event.request)) || (event.request.mode === "navigate" ? caches.match(`${BASE}offline.html`) : Response.error())));
});
