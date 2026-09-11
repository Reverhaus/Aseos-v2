/* =====================================================================
   SERVICE WORKER · Aseo y Menús
   - App shell cacheado en install
   - Navegación: network-first (siempre intenta traer index.html nuevo)
   - Recursos: cache-first con revalidación en background
   - Al cambiar CACHE_VERSION, se limpian las cachés antiguas
   ===================================================================== */

const CACHE_VERSION = 'aseo-v1';

const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon.512.png'
];

/* ---------- INSTALL ---------- */
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_VERSION)
      .then((cache) => Promise.allSettled(
        APP_SHELL.map((url) =>
          cache.add(url).catch((err) => {
            console.warn('[SW] No se pudo cachear:', url, err);
          })
        )
      ))
      .then(() => self.skipWaiting())
  );
});

/* ---------- ACTIVATE ---------- */
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys
          .filter((k) => k !== CACHE_VERSION)
          .map((k) => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ---------- FETCH ---------- */
self.addEventListener('fetch', (event) => {
  const req = event.request;

  /* Solo GET y mismo origen */
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  /* Navegación: network-first con fallback a index.html cacheado */
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_VERSION).then((cache) =>
            cache.put('./index.html', copy)
          );
          return resp;
        })
        .catch(() =>
          caches.match('./index.html').then((r) => r || caches.match('./'))
        )
    );
    return;
  }

  /* Recursos estáticos: cache-first + revalidación en background */
  event.respondWith(
    caches.match(req).then((cached) => {
      const networkFetch = fetch(req)
        .then((resp) => {
          if (resp && resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_VERSION).then((cache) =>
              cache.put(req, copy)
            );
          }
          return resp;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});

/* ---------- MENSAJE: forzar update desde la app (opcional) ---------- */
self.addEventListener('message', (event) => {
  if (event.data === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});