// Perla Notte Narudžbenica — Service Worker (v1.5.0)
// NAMJERNO ne sprema NIŠTA u cache — svaki zahtjev ide izravno na mrežu.
// Jedina mu je svrha zadovoljiti Android/Chrome kriterij za instalaciju
// aplikacije (Add to Home Screen kao prava app, a ne obična prečica).
// Time je isključen svaki rizik od zastarjelog/keširanog sadržaja koji je
// uzrokovao ranije probleme (v1.1.x).

self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys()
      .then(function(names){ return Promise.all(names.map(function(n){ return caches.delete(n); })); })
      .then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  event.respondWith(fetch(event.request));
});
