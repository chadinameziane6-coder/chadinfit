/* MOOD ON · v53.4.54 · avisos push (como los de una app).
   Este «service worker» solo enseña los avisos que manda el servidor y, al tocarlos, abre la app (o la trae al frente).
   No guarda nada ni hace que la app funcione sin conexión: la app sigue siendo la misma de siempre. */
self.addEventListener('install', function () { self.skipWaiting(); });
self.addEventListener('activate', function (e) { e.waitUntil(self.clients.claim()); });

self.addEventListener('push', function (e) {
  var a = {};
  try { a = e.data ? e.data.json() : {}; } catch (er) { a = { b: e.data ? e.data.text() : '' }; }
  var tag = String(a.tag || 'moodon');
  e.waitUntil(self.registration.showNotification(String(a.t || 'MOOD ON'), {
    body: String(a.b || ''),
    icon: 'icono-192.png',
    badge: 'icono-aviso.png',
    tag: tag,
    renotify: true,
    data: { url: String(a.url || './') }
  }));
});

self.addEventListener('notificationclick', function (e) {
  e.notification.close();
  var url = new URL((e.notification.data && e.notification.data.url) || './', self.registration.scope).href;
  e.waitUntil((async function () {
    if (new URL(url).origin !== self.location.origin) return self.clients.openWindow(url);      // la videollamada (Meet): se abre tal cual
    var L = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    for (var i = 0; i < L.length; i++) {
      var c = L[i];
      if (new URL(c.url).origin !== self.location.origin || !('focus' in c)) continue;
      try { await c.focus(); } catch (er) { }
      try { c.postMessage({ chadinfit: 1, ir: url }); } catch (er) { }      // la página de inicio se lo pasa a la app (abre el chat, su ficha…)
      return;
    }
    return self.clients.openWindow(url);
  })());
});
