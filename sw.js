const CACHE_NAME = 'enotov-ezhednevnik-v1';
const urlsToCache = [
  '/enotov-ezhednevnik/',
  '/enotov-ezhednevnik/index.html',
  '/enotov-ezhednevnik/manifest.json',
  '/enotov-ezhednevnik/icons/icon-192.png',
  '/enotov-ezhednevnik/icons/icon-512.png'
];

// Install: кэшируем файлы
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
      .then(() => self.skipWaiting())
  );
});

// Activate: чистим старые кэши
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames
          .filter(name => name !== CACHE_NAME)
          .map(name => caches.delete(name))
      );
    }).then(() => self.clients.claim())
  );
});

// Fetch: отдаём из кэша или сети
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Возвращаем кэш или идём в сеть
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Если сеть недоступна и это HTML — отдаём index.html
          if (event.request.mode === 'navigate') {
            return caches.match('/enotov-ezhednevnik/index.html');
          }
        });
      })
  );
});
