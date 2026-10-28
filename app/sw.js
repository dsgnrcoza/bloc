// Network first, cache as a fallback: always fresh when online, still opens offline.
const CACHE = 'bloc-v3';
const SHELL = ['/', '/styles.css', '/app.js', '/art.js', '/auth.js', '/firebase-config.js', '/manifest.webmanifest', '/icons/icon-192.png'];

self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(keys => Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  const { request } = e;
  const url = new URL(request.url);
  if (request.method !== 'GET' || url.origin !== location.origin || url.pathname.startsWith('/download/')) return;  // installers go straight to the network
  e.respondWith(fetch(request).then(res => {
    if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(request, copy)); }
    return res;
  }).catch(() => caches.match(request).then(hit => hit || caches.match('/'))));
});
