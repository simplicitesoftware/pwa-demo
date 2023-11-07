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
    return new Promise(function(resolve, reject) {
        let db;
        const dbReq = indexedDB.open(remoteName, version);
        dbReq.onerror = event => {
            console.error(`Error opening indexedDB: ${event.target.error.message}`, event);
            reject(event.target.error);
        };
        dbReq.onsuccess = event => {
            console.log(`IndexedDB opened`, event);
            db = event.target.result;
            console.log('Opened indexedDB', db);
            resolve(db);
        }
        dbReq.onupgradeneeded = event => {
            console.log('IndexedDB opened for upgrade', event);
            db = event.target.result;
            console.log('Opened indexedDB', db);
            const store = db.createObjectStore('data', { keyPath: '_key'});
            store.transaction.commit();
            console.log('Created indexedDB store', store);
            resolve(db);
        }
    });
}

const readDataFromIndexedDB = (db, store, key) => {
    return new Promise(function(resolve, reject) {
        const tr = db.transaction([ store ]);
        const st = tr.objectStore(store);
        const rq = st.get(key);
        rq.onerror = event => {
            console.error(`Error reading data from indexedDB store=${store} key=${key}: ${event.target.error.message}`, event);
            reject(event.target.error);
        };
        rq.onsuccess = event => {
            const data = event.target.result;
            resolve(data);
        };
    });
};

const writeDataToIndexedDB = (db, store, key, data) => {
    return new Promise(function(resolve, reject) {
        const tr = db.transaction([ store ], 'readwrite');
        const st = tr.objectStore(store);
        data._key = key;
        const rq = st.put(data);
        rq.onerror = event => {
            console.error(`Error writing data to indexedDB store=${store} key=${key}: ${event.target.error.message}`, event);
            reject(event.target.error);
        };
        rq.onsuccess = event => {
            resolve(event.target.result);
        };
        tr.commit();
    });
};

const getDataFromIndexedDB = async request => {
    try {
        console.log(`Get data from indexedDB: ${request.url}`);
        const db = await openIndexedDB(1);
        console.log('IndexedDB to get data', db);
        // ---------------------------------------------------------------------------------------
        const date = new Date().toUTCString();
        const key = await writeDataToIndexedDB(db, 'data', date, { value: `Hello world! ${date}` });
        console.log(`Written data to indexedDB key=${key}`);
        // ---------------------------------------------------------------------------------------
        const data = await readDataFromIndexedDB(db, 'data', request.url);
        console.log('Read data from indexedDB', data);
        // TODO:
        // - check network status
        // - return data from indexedDB if network is not available
        // - store data into indexedDB and return it if network is available
        return fetch(request);
    } catch (error) {
        console.error(error);
        return fetch(request); // Try to get from network anyway
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