const VERSION = "2.0.1";
const CACHE_PREFIX = "mohandesyar-pages-";
const CACHE = `${CACHE_PREFIX}${VERSION}`;
const BASE = "/bhb/mohandesyar-ai/";
const OFFLINE_URL = `${BASE}offline.html`;
const PRECACHE = [
  BASE,
  `${BASE}index.html`,
  `${BASE}styles.css`,
  `${BASE}app.js`,
  `${BASE}db.js`,
  `${BASE}print.css`,
  `${BASE}manifest.webmanifest`,
  `${BASE}app-icon.svg`,
  `${BASE}app-icon-192.png`,
  `${BASE}app-icon-512.png`,
  OFFLINE_URL,
  `${BASE}report/`,
  `${BASE}report/index.html`,
  `${BASE}report/report.js`,
  `${BASE}publication/`,
  `${BASE}publication/index.html`,
  `${BASE}publication/mohandesyar-ai-v2-technical-report.pdf`,
  `${BASE}publication/SHA256SUMS`
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(PRECACHE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith(CACHE_PREFIX) && key !== CACHE).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

async function cacheResponse(request, response) {
  if (!response?.ok) return response;
  const cache = await caches.open(CACHE);
  await cache.put(request, response.clone());
  return response;
}

async function navigationResponse(request) {
  try {
    return await cacheResponse(request, await fetch(request));
  } catch {
    const cache = await caches.open(CACHE);
    const exact = await cache.match(request, {ignoreSearch: true});
    if (exact) return exact;
    const url = new URL(request.url);
    if (url.pathname.startsWith(`${BASE}report`)) return cache.match(`${BASE}report/`);
    if (url.pathname.startsWith(`${BASE}publication`)) return cache.match(`${BASE}publication/`);
    if (url.pathname.startsWith(BASE)) return cache.match(BASE);
    return cache.match(OFFLINE_URL);
  }
}

async function assetResponse(event) {
  const cache = await caches.open(CACHE);
  const cached = await cache.match(event.request);
  const network = fetch(event.request)
    .then(response => cacheResponse(event.request, response))
    .catch(() => null);
  if (cached) {
    event.waitUntil(network);
    return cached;
  }
  return (await network) || Response.error();
}

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin || !url.pathname.startsWith(BASE)) return;
  if (event.request.mode === "navigate") {
    event.respondWith(navigationResponse(event.request));
    return;
  }
  event.respondWith(assetResponse(event));
});

self.addEventListener("message", event => {
  if (event.data?.type === "SKIP_WAITING") self.skipWaiting();
});
