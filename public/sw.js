const CACHE_NAME = "ifixorlando-v3";
// Only truly immutable, safe-to-cache-first assets belong here.
// Do NOT add HTML pages — they must be revalidated on every load so users
// see design/content updates after a new deploy.
const APP_SHELL_ASSETS = [
  "/manifest.json",
  "/icon-192x192.svg",
  "/icon-512x512.svg",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL_ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  const url = new URL(request.url);
  const isSameOrigin = url.origin === self.location.origin;
  const isStaticAsset =
    request.destination === "style" ||
    request.destination === "script" ||
    request.destination === "image" ||
    request.destination === "font" ||
    url.pathname.startsWith("/_next/static/") ||
    APP_SHELL_ASSETS.includes(url.pathname);

  if (!isSameOrigin || !isStaticAsset) {
    return;
  }

  event.respondWith(
    caches.match(request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(request)
        .then((response) => {
          if (!response.ok) {
            return response;
          }

          const responseClone = response.clone();
          void caches
            .open(CACHE_NAME)
            .then((cache) => cache.put(request, responseClone));

          return response;
        })
        .catch(() => caches.match(request).then((cached) => cached ?? Response.error()));
    })
  );
});
