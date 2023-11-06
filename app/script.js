(async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registration succeeded:', registration);
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
})();

window.addEventListener('load', event => {
    document.getElementById('catalog').innerHTML = 'TODO: load catalog';
});
