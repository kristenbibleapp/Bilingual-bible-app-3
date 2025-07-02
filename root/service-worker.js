
// Name the cache and list core files
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

// Install: pre-cache essential shell files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

// Activate: take control immediately and clean up old caches
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Fetch: try cache → then network → then cache the result for future use
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        return cachedResponse;
      }

      return fetch(event.request).then(networkResponse => {
        if (
          !networkResponse ||
          networkResponse.status !== 200 ||
          networkResponse.type !== 'basic'
        ) {
          return networkResponse;
        }

        const responseClone = networkResponse.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, responseClone);
        });

        return networkResponse;
      }).catch(() => {
        return caches.match('index.html');
      });
    })
  );
});
