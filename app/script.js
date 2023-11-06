window.addEventListener('load', async () => {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/service-worker.js');
      console.log('Service worker registration succeeded:', registration);
      render();
    } catch (error) {
      console.error(`Registration failed with ${error}`);
    }
  }
});

async function render() {
    console.log('Rendering...');
    const app = simplicite.session({ url: 'https://demo.dev.simplicite.io', debug: true });
    const user = await app.login({ username: 'website', password: 'simplicite' });
    console.log(user);
    document.getElementById('catalog').innerHTML = `Hello ${user.login}`;
}
