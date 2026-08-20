const CACHE_PREFIX = "mohandesyar-ai";
const CACHE_VERSION = "v1-offline";
const APP_SHELL_CACHE = `${CACHE_PREFIX}-${CACHE_VERSION}`;
const PRECACHE_URLS = [
  "/",
  "/report/official",
  "/offline.html",
  "/manifest.webmanifest",
  "/app-icon.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(APP_SHELL_CACHE)
      .then((cache) => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key.startsWith(CACHE_PREFIX) && key !== APP_SHELL_CACHE)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("message", (event) => {
  if (event.data?.type === "SKIP_WAITING") {
    self.skipWaiting();
    return;
  }

  if (event.data?.type !== "CACHE_URLS" || !Array.isArray(event.data.urls)) {
    return;
  }

  const urls = event.data.urls.filter((value) => {
    try {
      const url = new URL(value, self.location.origin);
      return url.origin === self.location.origin && !url.pathname.startsWith("/api/");
    } catch {
      return false;
    }
  });

  event.waitUntil(
    caches.open(APP_SHELL_CACHE).then(async (cache) => {
      await Promise.all(
        urls.map(async (url) => {
          try {
            const response = await fetch(url, { credentials: "same-origin" });
            if (response.ok) await cache.put(url, response);
          } catch {
            // The app shell already contains a safe offline fallback.
          }
        }),
      );
    }),
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const copy = response.clone();
            caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
          }
          return response;
        })
        .catch(async () => {
          return (
            (await caches.match(request)) ||
            (await caches.match(url.pathname)) ||
            (await caches.match("/")) ||
            (await caches.match("/offline.html"))
          );
        }),
    );
    return;
  }

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(APP_SHELL_CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      });
    }),
  );
});
