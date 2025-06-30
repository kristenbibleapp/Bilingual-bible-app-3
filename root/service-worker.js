
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

// Install: cache files
self.addEventListener('install', event => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(OFFLINE_URLS))
  );
});

// Activate: take control immediately
self.addEventListener('activate', event => {
  self.clients.claim();
});

// Fetch: serve from cache if available
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => response || fetch(event.request))
  );
});
