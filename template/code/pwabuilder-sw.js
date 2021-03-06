// This is the "Offline page" service worker

importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.0.0/workbox-sw.js');

const CACHE = "pwabuilder-page";

// TODO: replace the following with the correct offline fallback page i.e.: const offlineFallbackPage = "offline.html";
const offlineFallbackPage = "offlinepage.html";
const {
  registerRoute
} = workbox.routing;
const {
  CacheFirst
} = workbox.strategies;

const {
  CacheableResponse
} = workbox.cacheableResponse;





self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    self.skipWaiting();
  }
});

self.addEventListener('install', async (event) => {
  event.waitUntil(
    caches.open(CACHE)
    .then((cache) => {
      cache.add(offlineFallbackPage);
      cache.add("/images/warning.png");
    })
  );
});

if (workbox.navigationPreload.isSupported()) {
  workbox.navigationPreload.enable();
}

registerRoute(
  /\.(?:png|jpg|jpeg|svg|gif|css)$/,
  new CacheFirst({
    plugins: [
      new CacheableResponse({
        statuses: [0, 200]
      })
    ],
  })
);
self.addEventListener('fetch', (event) => {
  if (event.request.mode === 'navigate') {
    event.respondWith((async () => {
      try {
        const preloadResp = await event.preloadResponse;

        if (preloadResp) {
          return preloadResp;
        }

        const networkResp = await fetch(event.request);
        return networkResp;
      } catch (error) {

        const cache = await caches.open(CACHE);
        let cachedResp = await (cache.match(offlineFallbackPage) || cache.match("/images/warning.png"));
        return cachedResp;
      }
    })());
  }
});