// Perla Notte Narudžbenica — Service Worker
// Cache ime prati verziju aplikacije (APP_VERSION u index.html).
// Svaka nova verzija automatski briše stare cacheve u activate koraku,
// pa se izbjegava "zaglavljena" stara verzija u pregledniku.
var CACHE_NAME = 'pn-narudzba-v1.1.1';
var CORE_ASSETS = ['./', './index.html'];

self.addEventListener('install', function(event){
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(function(cache){
      return cache.addAll(CORE_ASSETS).catch(function(){ /* ignoriraj pojedinačne greške pri prvom punjenju */ });
    })
  );
});

self.addEventListener('activate', function(event){
  event.waitUntil(
    caches.keys().then(function(names){
      return Promise.all(names.filter(function(n){ return n !== CACHE_NAME; }).map(function(n){ return caches.delete(n); }));
    }).then(function(){ return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function(event){
  var req = event.request;
  if(req.method !== 'GET') return;

  var isHtml = req.mode === 'navigate' || (req.headers.get('accept') || '').indexOf('text/html') !== -1;

  if(isHtml){
    // Mrežа prvo — cache:'no-store' izričito zaobilazi preglednikov HTTP cache
    // (bez ovoga, "mreža prvo" i dalje zna vratiti staru keširanu HTTP verziju).
    // Cache Storage je tu samo kao rezerva ako veze uopće nema.
    event.respondWith(
      fetch(req, {cache:'no-store'}).then(function(res){
        var copy = res.clone();
        caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
        return res;
      }).catch(function(){
        return caches.match(req).then(function(cached){ return cached || caches.match('./index.html'); });
      })
    );
    return;
  }

  // Sve ostalo (CDN biblioteke i sl.) — cache prvo, mreža kao dopuna/rezerva.
  event.respondWith(
    caches.match(req).then(function(cached){
      if(cached) return cached;
      return fetch(req).then(function(res){
        if(res && res.status === 200 && res.type !== 'opaque'){
          var copy = res.clone();
          caches.open(CACHE_NAME).then(function(cache){ cache.put(req, copy); });
        }
        return res;
      }).catch(function(){ return cached; });
    })
  );
});
