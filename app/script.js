/* globals simplicite */

let sw, app;

window.addEventListener('load', async () => {
    if ('serviceWorker' in navigator) {
        try {
            sw = await navigator.serviceWorker.register('/service-worker.js');
            app = simplicite.session({ url: 'https://demo.dev.simplicite.io' });
            document.getElementById('refresh').addEventListener('click', loadCatalog);
            await loadCatalog();
        } catch (err) {
            console.error(`Service worker registration failed: ${err}`);
        }
    }
});

async function loadCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = 'Loading...';
    try {
        const prds = await app.getBusinessObject('DemoProduct').search({ demoPrdAvailable: true }, { inlineDocuments: [ 'demoPrdPicture' ] });
        sw.active.postMessage('Products loaded');
        let html = '';
        for (const prd of prds)
            html += `<div class="product">
                <img src="data:${prd.demoPrdPicture.mime};base64,${prd.demoPrdPicture.content}"/>
                <h1>${prd.demoPrdName}</h1>
                <h2>${prd.demoPrdReference}</h2>
                <p>${prd.demoPrdDescription}</p>
                </div>`;
        catalog.innerHTML = html;
    } catch (err) {
        catalog.innerHTML = `Error: ${err}`;
    }
}
