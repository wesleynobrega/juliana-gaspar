// Juliana Gaspar — Service Worker
// Cache-first para assets estáticos, network-first para navegação

const CACHE_NAME = 'jg-v1';

// Assets que serão cacheados no install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((names) =>
      Promise.all(
        names.filter((n) => n !== CACHE_NAME).map((n) => caches.delete(n))
      )
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;

  // Só cacheia GET
  if (request.method !== 'GET') return;

  // API — sempre network first (não cacheia)
  if (request.url.includes('/api/')) return;

  // Navegação HTML — network first
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() =>
        caches.match(request).then((r) => r || caches.match('/'))
      )
    );
    return;
  }

  // Assets estáticos — cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      const fetched = fetch(request).then((response) => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(request, clone);
          });
        }
        return response;
      });
      return cached || fetched;
    })
  );
});
