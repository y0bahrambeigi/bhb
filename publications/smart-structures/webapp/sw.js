const CACHE = "smart-structures-book-v1";
const CORE = [
  "./", "./index.html", "./styles.css", "./calculations.js", "./app.js", "./book-content.html",
  "./manifest.webmanifest", "./icons/icon.svg", "./icons/icon-192.png", "./icons/icon-512.png"
];

self.addEventListener("install", event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener("activate", event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)))).then(() => self.clients.claim()));
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;
  const url = new URL(event.request.url);
  if (url.origin !== self.location.origin) return;
  if (event.request.mode === "navigate") {
    event.respondWith(fetch(event.request).then(response => {
      caches.open(CACHE).then(cache => cache.put("./index.html", response.clone()));
      return response;
    }).catch(() => caches.match("./index.html")));
    return;
  }
  event.respondWith(caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
    if (response.ok) caches.open(CACHE).then(cache => cache.put(event.request, response.clone()));
    return response;
  })));
});

self.addEventListener("message", event => {
  if (event.data?.type !== "CACHE_BOOK") return;
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(["./book-content.html", "./assets/book/media/image1.webp", "./assets/book/media/image2.webp", "./assets/book/media/image3.webp", "./assets/book/media/image4.webp", "./assets/book/media/image5.webp", "./assets/book/media/image6.webp", "./assets/book/media/image7.webp", "./assets/book/media/image8.webp", "./assets/book/media/image9.webp", "./assets/book/media/image10.webp", "./assets/book/media/image11.webp"]))
      .then(() => event.source?.postMessage({type: "BOOK_CACHED"}))
  );
});
