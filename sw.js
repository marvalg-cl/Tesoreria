const CACHE_NAME = 'lumo-gf-cache-v1';
const RECURSOS = [
    self.registration.scope,
    'manifest.json',
    'icon-192.png',
    'icon-512.png',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.5.29/jspdf.plugin.autotable.min.js'
];

self.addEventListener('install', e => {
    e.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => Promise.all(RECURSOS.map(url => cache.add(url).catch(() => null))))
    );
    self.skipWaiting();
});

self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(nombres => Promise.all(nombres.filter(n => n !== CACHE_NAME).map(n => caches.delete(n))))
    );
    self.clients.claim();
});

self.addEventListener('fetch', e => {
    e.respondWith(
        caches.match(e.request).then(respuestaCache => {
            const redFetch = fetch(e.request).then(respuestaRed => {
                if (respuestaRed && respuestaRed.status === 200) {
                    const copia = respuestaRed.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(e.request, copia));
                }
                return respuestaRed;
            }).catch(() => respuestaCache);
            return respuestaCache || redFetch;
        })
    );
});
