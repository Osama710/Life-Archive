const CACHE = 'life-archive-static-v12'
const STATIC_ASSETS = [
  '/offline',
  '/manifest.json',
  '/favicon.png',
  '/icon-192.png',
  '/icon-512.png',
  '/icon-maskable.png',
  '/brand/logo-icon-1024.png',
  '/brand/logo-icon-512.png',
  '/brand/logo-mark-192.png',
  '/brand/logo-mark-560.png',
  '/brand/logo-primary-560.png',
  '/brand/logo-primary-1120.png',
  '/brand/svg/life-archive-primary.svg',
  '/brand/svg/life-archive-mark.svg',
  '/brand/svg/life-archive-icon.svg',
  '/brand/svg/life-archive-monochrome.svg',
  '/brand/svg/life-archive-reversed.svg',
]

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(STATIC_ASSETS)))
  self.skipWaiting()
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))),
    ),
  )
  self.clients.claim()
})

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return

  const url = new URL(request.url)
  if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase')) {
    return
  }

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE)
        return (await cache.match('/offline')) || Response.error()
      }),
    )
    return
  }

  if (
    url.pathname.startsWith('/_next/static/') ||
    url.pathname.startsWith('/brand/') ||
    STATIC_ASSETS.includes(url.pathname)
  ) {
    event.respondWith(
      caches.match(request).then(
        (cached) =>
          cached ||
          fetch(request).then((response) => {
            const copy = response.clone()
            caches.open(CACHE).then((cache) => cache.put(request, copy))
            return response
          }),
      ),
    )
  }
})
