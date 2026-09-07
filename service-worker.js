// service-worker.js
const CACHE_NAME = 'deutschlandticket-v1';
const urlsToCache = [
  './',
  './deutschlandticket.html',
  './'
];

// Установка Service Worker и кэширование файлов
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache).catch(() => {
        // Если не все файлы доступны, продолжаем
        console.log('Кэширование завершено');
      });
    })
  );
  self.skipWaiting();
});

// Активация Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Перехват запросов и использование кэша
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Возвращаем из кэша если есть
      if (response) {
        return response;
      }
      
      // Иначе пытаемся получить из сети
      return fetch(event.request).then((response) => {
        // Если статус ОК, кэшируем и возвращаем
        if (!response || response.status !== 200 || response.type === 'error') {
          return response;
        }
        
        const responseToCache = response.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });
        
        return response;
      }).catch(() => {
        // Если нет интернета и нет в кэше, возвращаем кэшированную версию
        return caches.match(event.request);
      });
    })
  );
});
