// Tesorería Pro · Super Suite — Service Worker
// Sube CACHE_NAME (ej. v2, v3...) cada vez que publiques cambios en index.html
// para que los usuarios que ya instalaron la app reciban la versión nueva.
const CACHE_NAME = 'tesoreria-pro-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.json',
  './favicon.svg',
  './icon-192.png',
  './icon-512.png',
  './apple-touch-icon.png'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      )
    ).then(() => self.clients.claim())
  );
});

// Estrategia: red primero (para traer cambios apenas haya conexión),
// con reserva a caché si no hay red. Así la app funciona offline
// y se actualiza sola cuando vuelve la conexión.
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    fetch(event.request)
      .then((response) => {
        const copy = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, copy));
        return response;
      })
      .catch(() => caches.match(event.request).then((cached) => cached || caches.match('./index.html')))
  );
});
