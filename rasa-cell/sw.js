const CACHE = "rasa-cell-1e9baebbcde6";
const PRECACHE = [
  "./assets/estedad-arabic-400-normal-C3QT4wBo.woff",
  "./assets/estedad-arabic-400-normal-DBEZ0XVf.woff2",
  "./assets/estedad-arabic-600-normal-B5D3ikyR.woff2",
  "./assets/estedad-arabic-600-normal-BAXrMeFW.woff",
  "./assets/index-CAuYp2Vx.css",
  "./assets/index-ClzQGkzc.js",
  "./assets/lalezar-arabic-400-normal-BT7j_n2X.woff",
  "./assets/lalezar-arabic-400-normal-D6_F3AeY.woff2",
  "./assets/vazirmatn-arabic-wght-normal-Cafbb7Zc.woff2",
  "./assets/vazirmatn-latin-ext-wght-normal-tDTa1Fj6.woff2",
  "./assets/vazirmatn-latin-wght-normal-BFexNX-K.woff2",
  "./icons/icon-192.png",
  "./icons/icon-512.png",
  "./icons/icon-maskable-512.png",
  "./icons/icon-maskable.svg",
  "./icons/icon.svg",
  "./index.html",
  "./manifest.webmanifest"
];

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
