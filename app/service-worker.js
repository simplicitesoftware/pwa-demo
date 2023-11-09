const remoteName = 'demo.dev.simplicite.io';
const remoteURL = `https://${remoteName}`;

const dbVersion = 1;
const dataStoreName = 'data';

const debug = true;

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

/* Not yet used
const clearResourcesFromCache = async () => {
    await caches.delete('pwa-demo');
};
*/

const getResourceFromCache = async request => {
    // cache first logic
    const resource = await caches.match(request);
    if (resource) {
        console.log(`Get resource from cache: ${request.url}`);
        return resource;
    } else {
        console.log(`Get resource from fetch: ${request.url}`);
        return fetch(request);
    }
};

const openIndexedDB = () => {
    return new Promise((resolve, reject) => {
        const rq = indexedDB.open(remoteName, dbVersion);
        rq.onerror = event => reject(event.target.error);
        rq.onsuccess = event => resolve(event.target.result);
    });
};

const readDataFromIndexedDB = async (key) => {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const tr = db.transaction([ dataStoreName ]);
        const st = tr.objectStore(dataStoreName);
        const rq = st.get(key);
        rq.onerror = event => reject(event.target.error);
        rq.onsuccess = event => resolve(event.target.result);
    });
};

const writeDataToIndexedDB = async (key, data) => {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const tr = db.transaction([ dataStoreName ], 'readwrite');
        const st = tr.objectStore(dataStoreName);
        data._key = key;
        const rq = st.put(data);
        rq.onerror = event => reject(event.target.error);
        rq.onsuccess = event => resolve(event.target.result);
        tr.commit();
    });
};

/* Not yet used
const clearAllDataFromIndexedDB = async () => {
    const db = await openIndexedDB();
    return new Promise((resolve, reject) => {
        const tr = db.transaction([ dataStoreName ], 'readwrite');
        const st = tr.objectStore(dataStoreName);
        const rq = st.clear();
        rq.onerror = event => reject(event.target.error);
        rq.onsuccess = event => resolve(event.target.result);
        tr.commit();
    });
};
*/

const getDataFromIndexedDB = async request => {
    // Network first logic
    try {
        const response = await fetch(request);
        const data = await response.json();
        console.log(`Got data from fetch: ${request.url}`, data);
        try {
            await writeDataToIndexedDB(request.url, data);
        } catch (error) {
            console.error('Error writing data to indexedDB', error);
        }
        return new Promise(resolve => resolve(new Response(JSON.stringify(data))));
    } catch (error) {
        if (debug) console.log('Fetch error', error);
        try {
            const data = await readDataFromIndexedDB(request.url);
            delete data._key;
            console.log(`Got data from indexedDB: ${request.url}`, data);
            return new Promise(resolve => resolve(new Response(JSON.stringify(data))));
        } catch (error) {
            console.error('Error reading data from indexedDB', error);
            return new Promise(resolve => resolve(new Response(JSON.stringify({ type: 'error', response: { message: error.message } }))));
        }
    }
};

self.addEventListener('install', async event => {
    if (debug) console.log(`${Date.now()} - Install event`, event);
    event.waitUntil(addResourcesToCache(appResources));

    // Create indexedDB and the data store if needed
    const rq = indexedDB.open(remoteName, dbVersion);
    rq.onerror = event => console.error(event.target.error);
    rq.onupgradeneeded = event => {
        if (debug) console.log('IndexedDB upgradeneeded event', event);
        const db = event.target.result;
        if (debug) console.log('Opened indexedDB for upgrade', db);
        const st = db.createObjectStore(dataStoreName, { keyPath: '_key'});
        st.transaction.commit();
        if (debug) console.log('Created indexedDB store', st);
    };
});

self.addEventListener('activate', event => {
    if (debug) console.log(`${Date.now()} - Activate event`, event);
    return self.clients.claim();
});

self.addEventListener('fetch', async event => {
    if (debug) console.log(`${Date.now()} - Fetch event ${event.request.url}`, event);
    if (event.request.url.startsWith(remoteURL)) {
        event.respondWith(getDataFromIndexedDB(event.request));
    } else {
        event.respondWith(getResourceFromCache(event.request));
    }
});

self.addEventListener('message', event => {
    if (debug) console.log(`${Date.now()} - Message event`, event);
    console.log(`Message: ${event.data}`);
});