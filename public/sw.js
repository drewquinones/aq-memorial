const CACHE = "aq-memorial-v1";
const ASSETS = ["/", "/index.html", "/static/js/main.js"];

self.addEventListener("install", e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(["/", "/index.html"])));
});

self.addEventListener("fetch", e => {
  e.respondWith(
    caches.match(e.request).then(r => r || fetch(e.request))
  );
});
