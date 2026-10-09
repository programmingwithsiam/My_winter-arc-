const CACHE_NAME = 'winter-arc-shell-v11';
const APP_SHELL = [
  './',
  './index.html',
  './manifest.webmanifest',
  './offline.html',
  './icon.svg',
  './icon-192.png',
  './icon-512.png',
  './winter_arc_alarm.wav',
  './firebase-config.js',
  './native-auth-config.js',
  './native-plugins.js'
];
const STATIC_URLS = new Set(APP_SHELL.map(path => new URL(path, self.registration.scope).href));

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(APP_SHELL))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys.filter(key => key.startsWith('winter-arc-shell-') && key !== CACHE_NAME).map(key => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET' || new URL(request.url).origin !== self.location.origin) return;

  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(async () => {
        const cache = await caches.open(CACHE_NAME);
        const url = new URL(request.url);
        const appRoot = new URL(self.registration.scope);
        const isAppShell = url.pathname === appRoot.pathname || url.pathname === new URL('./index.html', appRoot).pathname;
        return await cache.match(isAppShell ? './index.html' : './offline.html')
          || await cache.match('./offline.html');
      })
    );
    return;
  }

  if (!STATIC_URLS.has(request.url)) return;

  event.respondWith((async () => {
    const cache = await caches.open(CACHE_NAME);
    const cached = await cache.match(request);
    if (cached) return cached;
    const response = await fetch(request);
    if (response.ok) await cache.put(request, response.clone());
    return response;
  })());
});
