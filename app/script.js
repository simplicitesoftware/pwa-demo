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
            await loadCustomer('CLI001');
            await loadProducts();

            const br = document.getElementById('refresh');
            br.addEventListener('click', async () => {
                br.disabled = true;
                await loadProducts();
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

function getError(error) {
    return `<span class="error"><stong>Error<strong>: ${error.message || error}</span>`;
}

let cli;

async function loadCustomer(code) {
    const customer = document.getElementById('customer');
    customer.innerHTML = '<p>Loading...</p>';
    try {
        const clis = await app.getBusinessObject('DemoClient').search({ demoCliCode: code }, { businessCase: 'customer' });
        postMessageToServiceWorker(`${clis.length} customers(s) found`);

        if (clis.length == 1) {
            cli = clis[0];
            console.log(cli);
            customer.innerHTML = `Hello ${cli.demoCliFirstname} ${cli.demoCliLastname}`;
        } else
            throw new Error(`Unable to find a single customer for code ${code}`);
    } catch (error) {
        customer.innerHTML = getError(error);
    }
}

async function loadProducts() {
    const products = document.getElementById('products');
    products.innerHTML = '<p>Loading...</p>';
    try {
        const prds = await app.getBusinessObject('DemoProduct').search({ demoPrdAvailable: true }, { inlineDocuments: [ 'demoPrdPicture' ], businessCase: 'products' });
        postMessageToServiceWorker(`${prds.length} product(s) found`);

        if (prds.length > 0) {
            let html = '';
            for (const prd of prds) {
                console.log(prd);
                html += `<div class="product">
                    <img src="data:${prd.demoPrdPicture.mime};base64,${prd.demoPrdPicture.content}"/>
                    <h1>${prd.demoPrdName}</h1>
                    <h2>${prd.demoPrdReference}</h2>
                    <p>${prd.demoPrdDescription}</p>
                    <button class="product-order" data-rowid="${prd.row_id}">Order!</button>
                    </div>`;
            }
            products.innerHTML = html;

            for (const b of document.querySelectorAll('.product-order'))
                b.addEventListener('click', () => orderProduct(b.getAttribute('data-rowid')));
        } else
            throw new Error('Unable to find any available product');
    } catch (error) {
        products.innerHTML = getError(error);
    }
}

async function orderProduct(prdId) {
    window.alert(`TODO: Place order product ${prdId} for customer ${cli.row_id}`);
}
