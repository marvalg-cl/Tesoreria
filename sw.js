const CACHE_NAME = "tesoreria-pwa-v12";
const BASE = "/Tesoreria/";

const APP_SHELL = [
  BASE,
  BASE + "index.html",
  BASE + "manifest.webmanifest",
  BASE + "icon-192.png",
  BASE + "icon-512.png",
  BASE + "icon-512-maskable.png"
];

self.addEventListener("install", event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener("activate", event => {
  event.waitUntil(
    caches.keys()
      .then(keys =>
        Promise.all(
          keys
            .filter(key => key !== CACHE_NAME)
            .map(key => caches.delete(key))
        )
      )
      .then(() => self.clients.claim())
  );
});

self.addEventListener("fetch", event => {
  if (event.request.method !== "GET") return;

  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;

      return fetch(event.request)
        .then(response => {
          if (!response || response.status !== 200) return response;

          const copy = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, copy);
          }).catch(() => {});

          return response;
        })
        .catch(() => {
          if (event.request.mode === "navigate") {
            return caches.match(BASE + "index.html");
          }
          return new Response("", {
            status: 503,
            statusText: "Offline"
          });
        });
    })
  );
});
