// Installable shell. Do not cache customer, authentication, or financial responses.
if ('serviceWorker' in navigator && window.isSecureContext) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js').catch(err => console.warn('App installation unavailable:', err.message));
  });
}
