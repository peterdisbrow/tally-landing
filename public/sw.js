/**
 * Tally Service Worker — PWA offline support
 * Strategy: Cache-first for static assets, network-first for API/dynamic routes.
 */

const CACHE_NAME = 'tally-shell-v1';
const PRECACHE_URLS = [
  '/',
  '/signin',
  '/signup',
  '/manifest.json',
];

// ─── INSTALL: pre-cache app shell ────────────────────────────────────────────

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(PRECACHE_URLS).catch(err => {
        // Non-fatal: some shell URLs may 404 in dev
        console.warn('[SW] Precache partial failure:', err.message);
      });
    }).then(() => self.skipWaiting())
  );
});

// ─── ACTIVATE: clean up old caches ───────────────────────────────────────────

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// ─── FETCH: routing strategy ─────────────────────────────────────────────────

self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET and cross-origin requests
  if (request.method !== 'GET') return;
  if (url.origin !== location.origin) return;

  // Skip API routes — always network
  if (url.pathname.startsWith('/api/')) return;

  // Skip portal (requires authentication — don't serve stale)
  if (url.pathname.startsWith('/church-portal') || url.pathname.startsWith('/church-login')) return;

  // Static assets (_next/static, images, fonts) — cache-first
  if (url.pathname.startsWith('/_next/static') || url.pathname.startsWith('/icons/')) {
    event.respondWith(
      caches.match(request).then(cached => {
        if (cached) return cached;
        return fetch(request).then(response => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
          }
          return response;
        });
      })
    );
    return;
  }

  // HTML pages — network-first, fall back to cache, then offline page
  event.respondWith(
    fetch(request)
      .then(response => {
        if (response.ok) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(request, clone));
        }
        return response;
      })
      .catch(() => caches.match(request).then(cached => cached || caches.match('/')))
  );
});
