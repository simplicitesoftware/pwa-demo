self.addEventListener('install', event => {
    console.log('Service worker: install', event);
});

self.addEventListener('fetch', event => {
    console.log('Service worker: fetch', event);
    return fetch(event.request);
});