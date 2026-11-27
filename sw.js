// Minimal offline shell. Never touches API calls (those are cross-origin POSTs).
const CACHE = 'pmicc-shell-v1';
const SHELL = ['./', 'index.html', 'scanner.html', 'admin.html', 'cancel.html', 'config.js', 'api.js',
               'vendor/html5-qrcode.min.js', 'assets/logo-full.png', 'assets/logo-chapter.png', 'manifest.json', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(x => x !== CACHE).map(x => caches.delete(x)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const r = e.request, u = new URL(r.url);
  if (r.method !== 'GET' || u.origin !== location.origin) return;
  e.respondWith(fetch(r).then(res => { const copy = res.clone(); caches.open(CACHE).then(c => c.put(r, copy)); return res; })
    .catch(() => caches.match(r, { ignoreSearch: true })));
});
