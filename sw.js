const CACHE_NAME = 'estoquepro-saas-v19'; // Ao mudar este número, os celulares atualizam sozinhos
const urlsToCache = [
  './index.html',
  './manifest.json'
];

// INSTALAÇÃO: Baixa os arquivos e força a troca imediata
self.addEventListener('install', event => {
  self.skipWaiting(); // Força o novo Service Worker a assumir IMEDIATAMENTE
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ATIVAÇÃO: Apaga os caches velhos (ex: v10, v9) para não lotar o celular
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando versão antiga:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim()) // Toma o controle de todas as abas abertas
  );
});

// BUSCA (FETCH): Estratégia "Network First" (Rede primeiro, Cache se estiver offline)
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(networkResponse => {
        // Se a internet está funcionando e pegou o arquivo novo, salva uma cópia atualizada no cache
        if (event.request.method === 'GET') {
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return networkResponse;
      })
      .catch(() => {
        // Se der erro (ex: celular sem internet), pega a versão salva no cache
        return caches.match(event.request);
      })
  );
});
