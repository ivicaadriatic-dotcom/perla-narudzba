// Perla Notte Narudžbenica — Service Worker je UKLONJEN iz aplikacije (v1.2.0).
// Ova se datoteka namjerno ostavlja na istoj adresi samo zato da svaki uređaj
// na kojem je stara verzija SW-a ostala aktivna, dohvati OVU verziju, sam sebe
// ugasi, obriše cache i ponovno učita stranicu izravno s mreže.
self.addEventListener('install', function(event){
  self.skipWaiting();
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    self.registration.unregister()
      .then(function(){ return caches.keys(); })
      .then(function(names){ return Promise.all(names.map(function(n){ return caches.delete(n); })); })
      .then(function(){ return self.clients.matchAll({type:'window'}); })
      .then(function(clients){
        clients.forEach(function(client){ client.navigate(client.url); });
      })
  );
});

self.addEventListener('fetch', function(event){
  // Ne presreće ništa — sve ide izravno na mrežu dok se gašenje ne dovrši.
});
