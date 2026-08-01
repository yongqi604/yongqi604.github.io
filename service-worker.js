// 正常缓存版 Service Worker：预缓存应用壳，支持离线开壳
// 策略：导航(HTML) 网络优先 + 缓存兜底；静态资源 缓存优先 + 后台更新；跨域 API 不缓存
const CACHE = 'rental-app-v1';
const CORE = [
  './',
  './index.html',
  './manifest.webmanifest',
  './icon-192.png',
  './icon-512.png',
  './icon-maskable.png'
];

self.addEventListener('install', function (e) {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then(function (c) {
      return c.addAll(CORE);
    }).catch(function () {})
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('fetch', function (e) {
  var req = e.request;
  if (!req || req.method !== 'GET') return; // 不拦截 POST（Supabase 写入等）

  var url;
  try { url = new URL(req.url); } catch (err) { return; }

  // 跨域（Supabase API / CDN）一律走网络，不缓存，保证数据实时且不串数据
  if (url.origin !== self.location.origin) return;

  // 导航请求：网络优先，失败回退缓存（离线开壳）
  if (req.mode === 'navigate') {
    e.respondWith(
      fetch(req).then(function (res) {
        var cp = res.clone();
        caches.open(CACHE).then(function (c) { c.put(req, cp); });
        return res;
      }).catch(function () {
        return caches.match(req)
          .then(function (r) { return r || caches.match('./index.html'); })
          .then(function (r) { return r || caches.match('./'); });
      })
    );
    return;
  }

  // 同源静态资源：缓存优先，后台更新
  e.respondWith(
    caches.match(req).then(function (cached) {
      if (cached) return cached;
      return fetch(req).then(function (res) {
        if (res && res.ok) {
          var cp = res.clone();
          caches.open(CACHE).then(function (c) { c.put(req, cp); });
        }
        return res;
      }).catch(function () { return cached; });
    })
  );
});
