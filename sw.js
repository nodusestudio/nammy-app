const CACHE_NAME = 'nammy-v1.0.2';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/logo.png',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js'
];

// URLs que NO deben ser cacheadas (imágenes externas, etc.)
const NO_CACHE_URLS = [
  'images.unsplash.com',
  'via.placeholder.com',
  'unsplash.com'
];

// Install event - Cachear recursos esenciales
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('📦 Cache abierto:', CACHE_NAME);
        return cache.addAll(urlsToCache.filter(url => {
          // Solo cachear URLs locales, no externas
          return !url.startsWith('http') || url.includes(self.location.origin);
        }));
      })
      .then(() => {
        console.log('✅ Recursos esenciales cacheados');
        self.skipWaiting(); // Activar inmediatamente
      })
      .catch((error) => {
        console.error('❌ Error cacheando recursos:', error);
      })
  );
});

// Activate event - Limpiar caches antiguos
self.addEventListener('activate', (event) => {
  console.log('🚀 Service Worker activado');
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('🗑️ Eliminando cache antiguo:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      console.log('✅ Service Worker listo para funcionar');
      return self.clients.claim(); // Tomar control inmediatamente
    })
  );
});

// Fetch event - Estrategia Network First con manejo robusto de errores
self.addEventListener('fetch', (event) => {
  // Función helper para verificar si la URL debe ser cacheada
  const shouldCache = (url) => {
    return !NO_CACHE_URLS.some(domain => url.includes(domain));
  };

  event.respondWith(
    (async () => {
      try {
        console.log('🌐 Network First para:', event.request.url);
        
        // Intentar desde la red primero (Network First)
        const networkResponse = await fetch(event.request);
        
        // Si la respuesta es exitosa y debe ser cacheada
        if (networkResponse && 
            networkResponse.ok && 
            networkResponse.status === 200 && 
            shouldCache(event.request.url)) {
          
          try {
            const responseToCache = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            await cache.put(event.request, responseToCache);
            console.log('💾 Cacheado desde red:', event.request.url);
          } catch (cacheError) {
            console.warn('⚠️ No se pudo cachear:', event.request.url);
          }
        }
        
        return networkResponse;
        
      } catch (networkError) {
        console.log('📁 Red falló, intentando cache:', event.request.url);
        
        // Si falla la red, intentar desde cache
        try {
          const cachedResponse = await caches.match(event.request);
          if (cachedResponse) {
            console.log('✅ Servido desde cache:', event.request.url);
            return cachedResponse;
          }
        } catch (cacheError) {
          console.warn('⚠️ Cache también falló:', event.request.url);
        }
        
        // Fallbacks específicos por tipo de recurso
        if (event.request.destination === 'document') {
          try {
            const fallback = await caches.match('/index.html');
            return fallback || new Response('Aplicación offline', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          } catch {
            return new Response('Error de conexión', {
              status: 503,
              headers: { 'Content-Type': 'text/html; charset=utf-8' }
            });
          }
        }
        
        // Para imágenes que fallan, devolver placeholder transparente
        if (event.request.destination === 'image') {
          console.log('🖼️ Imagen falló, devolviendo placeholder transparente');
          return new Response(
            new Uint8Array([
              0x47, 0x49, 0x46, 0x38, 0x39, 0x61, 0x01, 0x00, 0x01, 0x00, 0x80,
              0x00, 0x00, 0xf3, 0xf4, 0xf6, 0x00, 0x00, 0x00, 0x21, 0xf9, 0x04,
              0x01, 0x00, 0x00, 0x00, 0x00, 0x2c, 0x00, 0x00, 0x00, 0x00, 0x01,
              0x00, 0x01, 0x00, 0x00, 0x02, 0x02, 0x04, 0x01, 0x00, 0x3b
            ]),
            {
              status: 200,
              headers: { 
                'Content-Type': 'image/gif',
                'Cache-Control': 'no-cache'
              }
            }
          );
        }
        
        // Para otros recursos, error silencioso
        console.warn('🚫 Recurso no disponible (ignorando):', event.request.url);
        return new Response('', {
          status: 503,
          headers: { 'Content-Type': 'text/plain' }
        });
      }
    })()
  );
});

// Message event - Comunicación con la app
self.addEventListener('message', (event) => {
  console.log('💬 Mensaje recibido en SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    caches.open(CACHE_NAME).then(cache => {
      cache.keys().then(keys => {
        event.ports[0].postMessage({
          type: 'CACHE_INFO',
          cacheSize: keys.length,
          cacheName: CACHE_NAME
        });
      });
    });
  }
});

// Push event - Notificaciones push (futuro)
self.addEventListener('push', (event) => {
  console.log('📱 Push recibido:', event);
  
  if (event.data) {
    const data = event.data.json();
    const options = {
      body: data.body,
      icon: '/icons/icon-192x192.png',
      badge: '/icons/icon-192x192.png',
      vibrate: [100, 50, 100],
      data: data.url,
      actions: [
        {
          action: 'open',
          title: 'Ver ahora',
          icon: '/icons/icon-192x192.png'
        },
        {
          action: 'close',
          title: 'Cerrar'
        }
      ]
    };
    
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    );
  }
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  console.log('🔔 Notificación clickeada:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    event.waitUntil(
      clients.openWindow(event.notification.data || '/')
    );
  }
});

// Background sync event (futuro)
self.addEventListener('sync', (event) => {
  console.log('🔄 Background sync:', event);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

function doBackgroundSync() {
  // Implementar lógica de sincronización en background
  return Promise.resolve();
}

console.log('🎯 Ñammy Service Worker cargado - Network First Strategy');