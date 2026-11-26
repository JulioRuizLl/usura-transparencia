/* Criterio 25 bis: funciona sin conexión y se actualiza sola cuando hay red. */
var CACHE = 'criterio25bis-v2';
var ARCHIVOS = ['./', 'index.html', 'datos.json', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(e.request).then(function (r) {
    var copia = r.clone();
    caches.open(CACHE).then(function (c) { c.put(e.request, copia); });
    return r;
  }).catch(function () { return caches.match(e.request, {ignoreSearch: true}); }));
});
