const CACHE_NAME = 'quantedge-ai-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/favicon.svg',
  '/manifest.json',
  '/src/main.tsx',
];

// Install: Cache static shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(STATIC_ASSETS);
    }).catch((err) => {
      console.warn('[SW] Cache install failed:', err);
    })
  );
  self.skipWaiting();
});

// Activate: Clean old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
  self.clients.claim();
});

// Fetch: Cache-first for static, network-first for API
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // API calls: Network first, cache fallback
  if (url.pathname.startsWith('/api/') || url.pathname.startsWith('/ws')) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          return response;
        })
        .catch(() => {
          return caches.match(request).then((cached) => {
            return cached || new Response(JSON.stringify({ error: 'Offline' }), {
              status: 503,
              headers: { 'Content-Type': 'application/json' },
            });
          });
        })
    );
    return;
  }

  // Static assets: Cache first
  event.respondWith(
    caches.match(request).then((cached) => {
      return cached || fetch(request).then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
        return response;
      });
    })
  );
});

// Background Sync: Queue trade actions when offline
self.addEventListener('sync', (event) => {
  if (event.tag === 'quantedge-trade-sync') {
    event.waitUntil(syncPendingTrades());
  }
});

async function syncPendingTrades() {
  const db = await openDB();
  const pending = await db.getAll('pendingTrades');
  for (const trade of pending) {
    try {
      await fetch('/api/v1/execution/place', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(trade),
      });
      await db.delete('pendingTrades', trade.id);
    } catch (err) {
      console.error('[SW] Failed to sync trade:', err);
    }
  }
}

// Push Notifications: Trade alerts
self.addEventListener('push', (event) => {
  const data = event.data?.json() || {};
  const title = data.title || 'QuantEdge AI Alert';
  const options = {
    body: data.body || 'Trading update',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    tag: data.tag || 'quantedge-alert',
    requireInteraction: data.requireInteraction || false,
    data: data.payload || {},
  };

  event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(
    clients.openWindow('/')
  );
});

// IndexedDB helper for background sync
function openDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('QuantEdgeDB', 1);
    request.onerror = () => reject(request.error);
    request.onsuccess = () => resolve(request.result);
    request.onupgradeneeded = (event) => {
      const db = event.target.result;
      if (!db.objectStoreNames.contains('pendingTrades')) {
        db.createObjectStore('pendingTrades', { keyPath: 'id' });
      }
    };
  });
}
