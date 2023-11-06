self.addEventListener('install', event => {
    console.log('Service worker: install', event);
});

self.addEventListener('fetch', async event => {
    console.log('Service worker: fetch', event);
    return fetch(event.request);
});