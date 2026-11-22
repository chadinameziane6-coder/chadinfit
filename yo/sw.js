/* MOOD ON · app de usuarias (/yo) · 22 nov 2026 (OK de Javier y Chadín: «sin cobertura en el gimnasio» y «que abra más rápido»).
   Guarda la app en el móvil para que abra al momento y también sin conexión:
   · la página: la guardada al momento y, a la vez, se pide la nueva para la próxima vez (con «?v=…», la versión nueva, siempre de internet);
     /yo mira version.json (nunca de aquí) y, si hay versión nueva, se recarga con «?v=» → nunca se queda en una vieja.
   · nutri_datos.js?v=…, la librería de Supabase, las fuentes y las imágenes de /yo: la guardada, si la hay.
   · Lo de Supabase (datos, cuenta) y version.json: siempre de internet, nunca se guarda aquí. */
var CACHE = 'moodon-yo-1';
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) {
  e.waitUntil(caches.keys().then(function (L) { return Promise.all(L.filter(function (k) { return /^moodon-yo-/.test(k) && k !== CACHE; }).map(function (k) { return caches.delete(k); })); }).then(function () { return self.clients.claim(); }));
});
function guarda(req, res) { if (res && (res.ok || res.type === 'opaque')) { var c = res.clone(); caches.open(CACHE).then(function (ca) { ca.put(req, c); }); } return res; }
self.addEventListener('fetch', function (e) {
  var r = e.request; if (r.method !== 'GET') return;
  var u = new URL(r.url);
  if (/supabase\.co$/.test(u.hostname) || /version\.json$/.test(u.pathname) || /\/demo\//.test(u.pathname)) return;      // datos, versión y las demos: siempre de internet
  if (r.mode === 'navigate' && u.origin === location.origin) {
    var clave = new Request(u.origin + u.pathname);
    if (u.searchParams.get('v')) { e.respondWith(fetch(r).then(function (res) { return guarda(clave, res); }, function () { return caches.match(clave); })); return; }
    e.respondWith(caches.match(clave).then(function (c) {
      var red = fetch(r).then(function (res) { return guarda(clave, res); });
      if (c) { e.waitUntil(red.catch(function () { })); return c; }
      return red;
    }));
    return;
  }
  var fijo = (u.origin === location.origin && (/nutri_datos\.js$/.test(u.pathname) || /\/img\//.test(u.pathname))) || /cdn\.jsdelivr\.net$/.test(u.hostname) || /fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (fijo) e.respondWith(caches.match(r).then(function (c) { return c || fetch(r).then(function (res) { return guarda(r, res); }); }));
});
