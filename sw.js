// Service worker : garde l'application sur l'appareil pour qu'elle marche sans internet.
// 752ba2a8d537 change à chaque build : l'ancienne copie est alors remplacée.
const CACHE = "ticket-mecef-752ba2a8d537";
const FICHIERS = ["./", "manifest.webmanifest", "icones/icone-192.png", "icones/icone-512.png", "icones/maskable-512.png"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHIERS.map(f => new Request(f, { cache: "reload" })))));
});

self.addEventListener("activate", e => {
  e.waitUntil(caches.keys()
    .then(cles => Promise.all(cles.filter(k => k.startsWith("ticket-mecef-") && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener("message", e => { if (e.data === "activer") self.skipWaiting(); });

// D'abord la copie locale (démarrage instantané, hors ligne), sinon le réseau.
self.addEventListener("fetch", e => {
  const req = e.request;
  if (req.method !== "GET" || new URL(req.url).origin !== location.origin) return;
  e.respondWith(caches.open(CACHE).then(async c =>
    (await c.match(req, { ignoreSearch: true })) ||
    (req.mode === "navigate" && await c.match("./")) ||
    fetch(req)));
});
