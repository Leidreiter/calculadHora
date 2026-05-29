const CACHE_NAME = 'calculadhora-v2';
const CDN_CACHE = 'calculadhora-cdn-v1';
const APP_ASSETS = [
  './',
  './index.html',
  './css/styles.css',
  './js/script.js',
  './img/logo.svg',
  './img/favicon.svg',
  './img/icon-192.png',
  './img/icon-512.png',
  './manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(APP_ASSETS))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys.filter((key) => key !== CACHE_NAME && key !== CDN_CACHE).map((key) => caches.delete(key))
      )
    ).then(() => clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // CDN: stale-while-revalidate
  if (url.hostname !== location.hostname) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const fetchPromise = fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CDN_CACHE).then((cache) => cache.put(request, response.clone()));
          }
          return response;
        }).catch(() => cached);
        return cached || fetchPromise;
      })
    );
    return;
  }

  // App shell: cache-first, fallback to network
  event.respondWith(
    caches.match(request).then((response) => {
      return response || fetch(request).catch(() => {
        if (request.mode === 'navigate') return caches.match('./index.html');
      });
    })
  );
});
