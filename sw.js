// Only handle the app's top-level navigation. Never intercept Supabase, docs, exports or POST requests.
const scope = new URL(self.registration.scope);
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', event => event.waitUntil(self.clients.claim()));
self.addEventListener('fetch', event => {
  const req = event.request, url = new URL(req.url);
  if (req.method !== 'GET' || req.mode !== 'navigate' || url.origin !== scope.origin || ![scope.pathname, new URL('index.html', scope).pathname].includes(url.pathname)) return;
  event.respondWith(fetch(req).catch(() => new Response(`<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Laundry Desk — Offline</title><style>body{font:16px system-ui;background:#f7f6f2;color:#202321;max-width:440px;margin:15vh auto;padding:24px}button{font:inherit;background:#202321;color:white;border:0;padding:14px 24px;border-radius:8px}</style><h1>You're offline</h1><p>Laundry Desk needs a connection to retrieve current orders and balances. No offline payment or order is submitted.</p><button onclick="location.reload()">Retry connection</button></html>`, {headers:{'Content-Type':'text/html; charset=utf-8','Cache-Control':'no-store'}})));
});
