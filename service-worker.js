// 自我注销：彻底关闭离线缓存，确保每次都从服务器加载最新页面（避免旧版本残留）
self.addEventListener('install', function(){ self.skipWaiting(); });
self.addEventListener('activate', function(e){
  e.waitUntil(self.registration.unregister());
});
