/* globals simplicite */

const url = 'https://demo.dev.simplicite.io';
const username = 'website';
const password = 'simplicite';

let sw, app, cliCode, cliId;

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

            let authtoken = window.localStorage.getItem('authtoken');
            if (!authtoken) {
                app = simplicite.session({ url: url, username: username, password: password });
                const user = await app.login(); // Get the token
                window.localStorage.setItem('authtoken', user.authtoken);
            } else {
                // Just set the token (do not call the login method)
                app = simplicite.session({ url: url, authtoken: authtoken });
            }

            await loadProducts();

            const code = document.getElementById('customer-code');
            const ok = document.getElementById('customer-code-ok');
            ok.addEventListener('click', async () => {
                cliCode = code.value.trim();
                if (!cliCode)
                    code.focus();
                else
                    await loadCustomer(cliCode);
            });
            code.focus();

            const br = document.getElementById('refresh');
            br.addEventListener('click', async () => {
                br.disabled = true;
                await loadProducts();
                if (cliCode)
                    await loadCustomer(cliCode);
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

function clearMessages() {
    document.getElementById('messages').innerHTML = '';
}

function showError(error) {
    document.getElementById('messages').innerHTML = `<span class="error"><strong>Error</strong>: ${error.message || error}</span>`;
}

async function loadCustomer(code) {
    clearMessages();
    try {
        const clis = await app.getBusinessObject('DemoClient').search({ demoCliCode: code }, { businessCase: `customer-${cliCode}` });
        postMessageToServiceWorker(`${clis.length} customers(s) found`);

        if (clis.length == 1) {
            const cli = clis[0];
            document.getElementById('customer').innerHTML = `<strong>Customer</strong>: ${cli.demoCliFirstname} ${cli.demoCliLastname}`;
            cliId = cli.row_id;

            for (const b of document.querySelectorAll('.product-order')) {
                b.addEventListener('click', () => orderProduct(b.getAttribute('data-rowid')));
                b.style.display = 'inline';
                b.disabled = false;
            }
        } else
            throw new Error(`Unable to find a single customer for code ${code}`);
    } catch (error) {
        showError(error);
    }
}

async function loadProducts() {
    clearMessages();
    const products = document.getElementById('products');
    products.innerHTML = '<p>Loading products...</p>';
    try {
        const prds = await app.getBusinessObject('DemoProduct').search({ demoPrdAvailable: true }, { inlineDocuments: [ 'demoPrdPicture' ], businessCase: 'products' });
        postMessageToServiceWorker(`${prds.length} product(s) found`);

        if (prds.length > 0) {
            let html = '';
            for (const prd of prds) {
                html += `<div class="product">
                    <img src="data:${prd.demoPrdPicture.mime};base64,${prd.demoPrdPicture.content}"/>
                    <h1>${prd.demoPrdName}</h1>
                    <h2>${prd.demoPrdReference}</h2>
                    <p>${prd.demoPrdDescription}</p>
                    <button class="product-order" data-rowid="${prd.row_id}" disabled="disabled" style="display: none;">Order!</button>
                    </div>`;
            }
            products.innerHTML = html;
        } else
            throw new Error('Unable to find any available product');
    } catch (error) {
        products.innerHTML = '<p>No product</p>';
        showError(error);
    }
}

async function orderProduct(prdId) {
    window.alert(`TODO: Place order product ${prdId} for customer ${cliId}`);
}
