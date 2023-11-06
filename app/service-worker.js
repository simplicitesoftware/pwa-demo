const addResourcesToCache = async resources => {
    const cache = await caches.open('pwa-demo');
    await cache.addAll(resources);
};

const getResourceFromCache = async request => {
    const resource = await caches.match(request);
    return resource || fetch(request);
};

self.addEventListener('install', event => {
    console.log('Service worker install', event);
    event.waitUntil(addResourcesToCache([
        '/',
        '/index.html',
        '/styles.css',
        '/script.js',
        '/simplicite.min.js',
        '/images/logo.svg',
        '/manifest.json',
        '/icons/favicon.png',
        '/icons/icon32.png',
        '/icons/icon48.png',
        '/icons/icon64.png',
        '/icons/icon96.png',
        '/icons/icon120.png',
        '/icons/icon128.png',
        '/icons/icon144.png',
        '/icons/icon152.png',
        '/icons/icon167.png',
        '/icons/icon180.png',
        '/icons/icon192.png',
        '/icons/icon256.png'
    ]));
});

self.addEventListener('fetch', async event => {
    console.log(`Service worker fetch ${event.request.url}`, event);
    event.respondWith(getResourceFromCache(event.request));
});