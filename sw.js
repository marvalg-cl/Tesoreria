const VERSION = 'tesoreria-final-v7';
const CACHE = VERSION;
const CORE = ['./','./index.html','./manifest.webmanifest','./icon-192.png','./icon-512.png','./CPA_5B_2026_final_seed.json'];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE)
      .then(cache => cache.addAll(CORE))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(k => k.startsWith('tesoreria-final-') && k !== CACHE).map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // Never intercept the service worker itself. This is critical so a new
  // deployment can always replace an old service worker.
  if (url.pathname.endsWith('/sw.js')) return;

  // HTML/navigation is network-first so GitHub Pages deployments appear
  // immediately instead of being trapped behind an old cached index.html.
  if (request.mode === 'navigate' || request.destination === 'document') {
    event.respondWith(
      fetch(request, {cache: 'no-store'})
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./index.html', copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('./index.html'))
    );
    return;
  }

  // Manifest is also network-first so install metadata can update.
  if (url.pathname.endsWith('/manifest.webmanifest')) {
    event.respondWith(
      fetch(request, {cache: 'no-store'})
        .then(response => {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put('./manifest.webmanifest', copy)).catch(() => {});
          return response;
        })
        .catch(() => caches.match('./manifest.webmanifest'))
    );
    return;
  }

  event.respondWith(
    caches.match(request).then(cached => {
      if (cached) return cached;
      return fetch(request).then(response => {
        if (response.ok && url.origin === self.location.origin) {
          const copy = response.clone();
          caches.open(CACHE).then(cache => cache.put(request, copy)).catch(() => {});
        }
        return response;
      });
    })
  );
});
