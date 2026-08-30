const CACHE_NAME = 'ponds-app-cache-v1';
const ASSETS = [
    '/',
    '/index.html',
    '/asset.html',
    '/duty.html',
    '/dollar.html',
    '/income.html',
    '/pharmadash.html',
    '/uob.html',
    '/app.js',
    '/gas_backend.js',
    '/manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

self.addEventListener('fetch', event => {
    // Only cache GET requests for same origin (static assets)
    if (event.request.method === 'GET' && event.request.url.startsWith(self.location.origin)) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                // Return cached version immediately (Stale-while-revalidate)
                const networked = fetch(event.request).then(response => {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, clone);
                    });
                    return response;
                }).catch(() => {
                    // Ignore network errors on background fetch
                });
                return cached || networked;
            })
        );
    }
});
