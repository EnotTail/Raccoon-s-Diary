const CACHE_NAME = 'enotov-ezhednevnik-v2';

// Определяем базовый путь динамически
const BASE_PATH = self.location.pathname.replace(/sw\.js$/, '');

const urlsToCache = [
  BASE_PATH,
  BASE_PATH + 'index.html',
  BASE_PATH + 'manifest.json',
  BASE_PATH + 'icons/icon-192.png',
  BASE_PATH + 'icons/icon-512.png'
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
  const requestUrl = new URL(event.request.url);

  // Для навигации (открытие приложения) — отдаём index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      caches.match(BASE_PATH + 'index.html')
        .then(response => response || fetch(event.request))
        .catch(() => caches.match(BASE_PATH + 'index.html'))
    );
    return;
  }

  // Для остальных запросов — сначала кэш, потом сеть
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        if (response) {
          return response;
        }
        return fetch(event.request).catch(() => {
          // Fallback для HTML
          if (event.request.headers.get('accept') && 
              event.request.headers.get('accept').includes('text/html')) {
            return caches.match(BASE_PATH + 'index.html');
          }
        });
      })
  );
});
