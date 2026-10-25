/* Tesorería Pro · service worker: permite abrir la app sin conexión.
   Los datos NO pasan por aquí (viven en IndexedDB); solo se guarda el código de la app. */
const CACHE='tesoreria-pro-v9-2026-10-25';
const SHELL=['./','./index.html','./manifest.json','./favicon.svg','./icon-192.png','./icon-512.png','./apple-touch-icon.png'];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting()))});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(k=>Promise.all(k.filter(x=>x!==CACHE).map(x=>caches.delete(x)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',e=>{
 const r=e.request;if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return; // Google Drive y otros: directo a la red
 e.respondWith(fetch(r).then(res=>{if(res.ok){const c=res.clone();caches.open(CACHE).then(ch=>ch.put(r,c))}return res}).catch(()=>caches.match(r).then(m=>m||caches.match('./index.html'))));
});
