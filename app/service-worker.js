const remoteName = 'demo.dev.simplicite.io';
const remoteURL = `https://${remoteName}`;

const appResources = [
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
];

const addResourcesToCache = async resources => {
    const cache = await caches.open('pwa-demo');
    await cache.addAll(resources);
};

const getResourceFromCache = async request => {
    console.log(`Get resource from cache: ${request.url}`);
    const resource = await caches.match(request);
    return resource || fetch(request);
};

const openIndexedDB = version => {
    return new Promise((resolve, reject) => {
        let db;
        const rq = indexedDB.open(remoteName, version);
        rq.onerror = event => {
            console.error(`Error opening indexedDB: ${event.target.error.message}`, event);
            reject(event.target.error);
        };
        rq.onsuccess = event => {
            console.log('IndexedDB opened (success)', event);
            db = event.target.result;
            console.log('Opened indexedDB', db);
            resolve(db);
        };
        rq.onupgradeneeded = event => {
            console.log('IndexedDB opened (upgrade needed)', event);
            db = event.target.result;
            console.log('Opened indexedDB', db);
            const store = db.createObjectStore('data', { keyPath: '_key'});
            store.transaction.commit();
            console.log('Created indexedDB store', store);
            resolve(db);
        };
    });
};

const readDataFromIndexedDB = (db, store, key) => {
    return new Promise((resolve, reject) => {
        const tr = db.transaction([ store ]);
        const st = tr.objectStore(store);
        const rq = st.get(key);
        rq.onerror = event => reject(event.target.error);
        rq.onsuccess = event => resolve(event.target.result);
    });
};

const writeDataToIndexedDB = (db, store, key, data) => {
    return new Promise((resolve, reject) => {
        const tr = db.transaction([ store ], 'readwrite');
        const st = tr.objectStore(store);
        data._key = key;
        const rq = st.put(data);
        rq.onerror = event => reject(event.target.error);
        rq.onsuccess = event => resolve(event.target.result);
        tr.commit();
    });
};

const getDataFromIndexedDB = async request => {
    const db = await openIndexedDB(1);
    try {
        const response = await fetch(request);
        const data = await response.json();
        console.log(`Write data to indexedDB for key=${request.url}`);
        await writeDataToIndexedDB(db, 'data', request.url, data);
        console.log('Written data to indexedDB');
        return new Promise(resolve => resolve(new Response(JSON.stringify(data))));
    } catch (error) {
        console.warning('Fetch error', error);
        console.log(`Read data from indexedDB for key=${request.url}`);
        const data = await readDataFromIndexedDB(db, 'data', request.url);
        return new Promise(resolve => resolve(new Response(JSON.stringify(data))));
    }
};

self.addEventListener('install', event => {
    console.log('Service worker install', event);
    event.waitUntil(addResourcesToCache(appResources));
});

self.addEventListener('fetch', async event => {
    console.log(`Service worker fetch ${event.request.url}`, event);
    if (event.request.url.startsWith(remoteURL)) {
        event.respondWith(getDataFromIndexedDB(event.request));
    } else {
        event.respondWith(getResourceFromCache(event.request));
    }
});

self.addEventListener('message', event => {
    console.log('Service worker message received', event.data);
});