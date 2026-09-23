const CACHE='tesoreria-pro-v23-future-final-20260827-r2';
const ASSETS=['./','./index.html','./styles.css','./app.js','./manifest.json','./favicon.svg'];
self.addEventListener('install',event=>{event.waitUntil(caches.open(CACHE).then(async cache=>{for(const asset of ASSETS){try{await cache.add(asset)}catch(err){console.warn('Cache omitido:',asset)}}}).then(()=>self.skipWaiting()))});
self.addEventListener('activate',event=>{event.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE).map(k=>caches.delete(k)))).then(()=>self.clients.claim()))});
self.addEventListener('fetch',event=>{if(event.request.method!=='GET')return;event.respondWith(caches.match(event.request).then(cached=>cached||fetch(event.request).then(response=>{if(response&&response.ok){const copy=response.clone();caches.open(CACHE).then(c=>c.put(event.request,copy)).catch(()=>{})}return response}).catch(()=>cached||new Response('',{status:503,headers:{'Content-Type':'text/plain'}}))))});
