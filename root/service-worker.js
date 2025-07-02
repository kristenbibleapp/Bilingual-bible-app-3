const CACHE_NAME = 'bilingual-bible-cache-v1';
const OFFLINE_URLS = [
  './',
  'index.html',
  'style-kristen.css',
  'app.js',
  'manifest.json',
  'icons/icon-192x192.png',
  'icons/icon-512x512.png'
];

// Install: Pre-cache core shell
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

// Activate: Clean up old cache versions
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch handler: Cache-first, then network, then fallback
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) return cachedResponse;

      return fetch(event.request)
        .then(networkResponse => {
          // Clone and cache if valid response
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            (networkResponse.type === 'basic' || networkResponse.type === 'cors')
          ) {
            const cloned = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, cloned);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // If offline and request is HTML, fallback to cached index.html
          if (event.request.destination === 'document') {
            return caches.match('index.html');
          }
          // Otherwise fail silently
        });
    })
  );
});
