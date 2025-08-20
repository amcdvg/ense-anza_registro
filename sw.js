// sw.js - Service Worker para la aplicación de Registro de Enseñanzas
const CACHE_NAME = 'registro-ensenanzas-v1';
const urlsToCache = [
  '/',
  '/manifest.json',
  '/calendar.ico',
  '/calendar.png'
];

// Instalación del Service Worker
self.addEventListener('install', event => {
  console.log('Service Worker instalándose.');
  
  // Realizar la instalación
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Cache abierto');
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        console.log('Todos los recursos han sido cacheados');
        return self.skipWaiting();
      })
  );
});

// Activación del Service Worker
self.addEventListener('activate', event => {
  console.log('Service Worker activándose.');
  
  // Eliminar cachés antiguos
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('Service Worker activado.');
      return self.clients.claim();
    })
  );
});

// Interceptar solicitudes
self.addEventListener('fetch', event => {
  // Para las solicitudes a Google Sheets, siempre ir a la red
  if (event.request.url.includes('script.google.com')) {
    event.respondWith(fetch(event.request));
    return;
  }
  
  // Para otros recursos, usar estrategia cache-first
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devolver el recurso en caché o buscarlo en la red
        return response || fetch(event.request);
      }
    )
  );
});