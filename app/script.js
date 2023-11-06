let app;

window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      await navigator.serviceWorker.register('/service-worker.js');
      app = simplicite.session({ url: 'https://demo.dev.simplicite.io' });
      document.getElementById('refresh').addEventListener('click', loadCatalog);
      loadCatalog();
    } catch (err) {
      console.error(`Service worker registration failed: ${err}`);
    }
  }
});

async function loadCatalog() {
    const catalog = document.getElementById('catalog');
    catalog.innerHTML = 'Loading...';
    let html = '';
    for (const prd of await app.getBusinessObject('DemoProduct').search({ demoPrdAvailable: true }, { inlineDocuments: [ 'demoPrdPicture' ] }))
      html += `<div class="product">
        <img src="data:${prd.demoPrdPicture.mime};base64,${prd.demoPrdPicture.content}"/>
        <h1>${prd.demoPrdName}</h1>
        <h2>${prd.demoPrdReference}</h2>
        <p>${prd.demoPrdDescription}</p>
        </div>`;
    catalog.innerHTML = html;
}
