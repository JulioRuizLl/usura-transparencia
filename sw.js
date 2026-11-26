/* Usura y transparencia: funciona sin conexión y se actualiza sola cuando hay red. */
var CACHE = 'usura-transp-v4';
var LECTOR = 'usura-lector-v1'; /* bibliotecas del lector de contratos: no cambian y pesan, se guardan aparte */
var ARCHIVOS = ['./', 'index.html', 'datos.json', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', function (e) {
  e.waitUntil(caches.open(CACHE).then(function (c) { return c.addAll(ARCHIVOS); }).then(function () { return self.skipWaiting(); }));
});
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (ks) { return Promise.all(ks.filter(function (k) { return k !== CACHE && k !== LECTOR; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
self.addEventListener('fetch', function (e) {
  var u = new URL(e.request.url);
  if (e.request.method !== 'GET' || u.origin !== location.origin) return;
  if (u.pathname.indexOf('/vendor/') >= 0) { /* lector: primero la copia guardada */
    e.respondWith(caches.open(LECTOR).then(function (c) {
      return c.match(e.request).then(function (r) {
        return r || fetch(e.request).then(function (n) { if (n.ok) c.put(e.request, n.clone()); return n; });
      });
    }));
    return;
  }
  /* la app y los datos: siempre la versión más reciente si hay red (sin la caché del navegador), y la guardada si no la hay */
  e.respondWith(fetch(e.request.url, {cache: 'no-cache'}).then(function (r) {
    if (r.ok) { var copia = r.clone(); caches.open(CACHE).then(function (c) { c.put(e.request, copia); }); }
    return r;
  }).catch(function () { return caches.match(e.request, {ignoreSearch: true}); }));
});
