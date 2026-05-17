const CACHE = 'la-v1'

// App shell — these are always cached on install
const SHELL = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/favicon.svg',
]

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE).then(cache => cache.addAll(SHELL))
  )
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  )
  self.clients.claim()
})

self.addEventListener('fetch', event => {
  const { request } = event
  const url = new URL(request.url)

  // Only handle same-origin GET requests
  if (request.method !== 'GET') return
  if (url.origin !== self.location.origin) return

  // Navigation requests → serve index.html (supports client-side routing)
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(resp => {
          const clone = resp.clone()
          caches.open(CACHE).then(c => c.put(request, clone))
          return resp
        })
        .catch(() => caches.match('/index.html'))
    )
    return
  }

  // Static assets → stale-while-revalidate
  event.respondWith(
    caches.match(request).then(cached => {
      const networkFetch = fetch(request).then(resp => {
        const clone = resp.clone()
        caches.open(CACHE).then(c => c.put(request, clone))
        return resp
      })
      return cached ?? networkFetch
    })
  )
})
