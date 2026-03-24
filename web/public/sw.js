const CACHE_NAME = 'paridhi-v1'
const CACHE_ASSETS = ['/', '/index.html', '/manifest.webmanifest', '/favicon.svg']

// Install event - cache assets
self.addEventListener('install', (event) => {
  console.log('[SW] Installing service worker...')
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching app shell')
      return cache.addAll(CACHE_ASSETS)
    }).then(() => {
      console.log('[SW] Skipping waiting - activating immediately')
      self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('[SW] Activating service worker...')
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((cacheName) => cacheName !== CACHE_NAME)
          .map((cacheName) => {
            console.log('[SW] Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          })
      )
    }).then(() => {
      console.log('[SW] Claiming clients...')
      return self.clients.claim()
    })
  )
})

// Fetch event - network first, fallback to cache
self.addEventListener('fetch', (event) => {
  const { request } = event

  // Skip non-GET requests
  if (request.method !== 'GET') {
    return
  }

  // Skip external requests
  if (!request.url.startsWith(self.location.origin)) {
    return
  }

  event.respondWith(
    fetch(request)
      .then((response) => {
        // Cache successful responses
        if (!response || response.status !== 200) {
          return response
        }

        const responseToCache = response.clone()
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(request, responseToCache)
        })
        return response
      })
      .catch(() => {
        // Fallback to cache on network error
        return caches.match(request).then((cached) => {
          if (cached) {
            console.log('[SW] Serving from cache:', request.url)
            return cached
          }
          // Fallback for failed navigation requests
          if (request.mode === 'navigate') {
            return caches.match('/index.html')
          }
        })
      })
  )
})