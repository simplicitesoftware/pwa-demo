self.addEventListener('install', event => {
    console.log('Service worker: install', event);
    self.skipWaiting();
});

self.addEventListener('fetch', event => {
    console.log(`Service worker: fetch ${event.request.url}`, event);
    return fetch(event.request);
});