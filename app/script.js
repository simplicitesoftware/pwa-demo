/* globals simplicite */

let sw, app;

window.addEventListener('load', async () => {
    if ('serviceWorker' in navigator) {
        try {
            sw = await navigator.serviceWorker.register('/service-worker.js');

            /* Experimental: Update service worker
            sw.addEventListener('updatefound', async event => {
                console.log('Service worker update found event', event);
            });

            const bu = document.getElementById('update');
            bu.addEventListener('click', async () => {
                bu.disabled = true;
                await sw.update();
                bu.disabled = false;
                //window.location.reload();
            });
            bu.disabled = false;
            */

            app = simplicite.session({ url: 'https://demo.dev.simplicite.io' });
            await loadCatalog();

            const br = document.getElementById('refresh');
            br.addEventListener('click', async () => {
                br.disabled = true;
                await loadCatalog();
                br.disabled = false;
            });
            br.disabled = false;
        } catch (error) {
            console.error(`Service worker registration failed: ${error}`);
        }
    }
});

function postMessageToServiceWorker(msg) {
    try {
        sw.active.postMessage(msg);
    } catch (error) {
        console.error(`Unable to send message to service worker ${msg}`, error);
    }
}

async function loadCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = '<p>Loading...</p>';
    try {
        const prds = await app.getBusinessObject('DemoProduct').search({ demoPrdAvailable: true }, { inlineDocuments: [ 'demoPrdPicture' ] });
        postMessageToServiceWorker(`${prds.length} product(s) loaded!`);

        let html = '';
        for (const prd of prds)
            html += `<div class="product">
                <img src="data:${prd.demoPrdPicture.mime};base64,${prd.demoPrdPicture.content}"/>
                <h1>${prd.demoPrdName}</h1>
                <h2>${prd.demoPrdReference}</h2>
                <p>${prd.demoPrdDescription}</p>
                </div>`;
        catalog.innerHTML = html;
    } catch (error) {
        catalog.innerHTML = `Error: ${error.message || error}`;
    }
}
