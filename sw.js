const CACHE_NAME = 'nammy-v1.1.0';
const STATIC_CACHE = 'nammy-static-v1.1.0';
const urlsToCache = [
  '/',
  '/index.html',
  '/app.js',
  '/style.css',
  '/manifest.json',
  '/logo.svg',
  'https://cdn.tailwindcss.com',
  'https://unpkg.com/lucide@latest/dist/umd/lucide.js'
];

// URLs que NO deben ser cacheadas (imágenes externas, etc.)
const NO_CACHE_URLS = [
  'images.unsplash.com',
  'via.placeholder.com',
  'unsplash.com'
];

// Recursos locales para estrategia Stale-While-Revalidate
const LOCAL_ASSETS = [
  '/app.js',
  '/style.css',
  '/logo.svg',
  '/manifest.json'
];

// Helper para verificar si es recurso local
const isLocalAsset = (url) => {
  return LOCAL_ASSETS.some(asset => url.endsWith(asset)) || 
         url.includes(self.location.origin);
};

// Helper para verificar si es imagen externa
const isExternalImage = (request) => {
  return request.destination === 'image' && 
         !request.url.includes(self.location.origin) &&
         (request.url.includes('unsplash.com') || 
          request.url.includes('placeholder.com'));
};

// Install event - Cachear recursos esenciales
self.addEventListener('install', (event) => {
  console.log('🔧 Service Worker instalando...');
  
  event.waitUntil(
    Promise.all([
      // Cache principal para recursos dinámicos
      caches.open(CACHE_NAME)
        .then((cache) => {
          console.log('📦 Cache dinámico abierto:', CACHE_NAME);
          return cache.addAll(['/', '/index.html']);
        }),
      
      // Cache estático para recursos locales (CSS, JS, imágenes)
      caches.open(STATIC_CACHE)
        .then((cache) => {
          console.log('📦 Cache estático abierto:', STATIC_CACHE);
          const localResources = urlsToCache.filter(url => 
            !url.startsWith('http') || url.includes(self.location.origin)
          );
          return cache.addAll(localResources);
        })
    ])
      .then(() => {
        console.log('✅ Recursos esenciales cacheados correctamente');
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
  
  const expectedCaches = [CACHE_NAME, STATIC_CACHE];
  
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (!expectedCaches.includes(cacheName)) {
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

// Fetch event - Estrategias híbridas optimizadas
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);
  
  // Estrategia Stale-While-Revalidate para recursos locales (CSS, JS, imágenes locales)
  if (isLocalAsset(event.request.url)) {
    event.respondWith(staleWhileRevalidate(event.request));
    return;
  }
  
  // Manejo especial para imágenes externas con try...catch robusto
  if (isExternalImage(event.request)) {
    event.respondWith(handleExternalImage(event.request));
    return;
  }
  
  // Network First para todo lo demás
  event.respondWith(networkFirst(event.request));
});

// Estrategia Stale-While-Revalidate para recursos locales
async function staleWhileRevalidate(request) {
  try {
    console.log('🔄 Stale-While-Revalidate para:', request.url);
    
    // Intentar servir desde cache inmediatamente
    const cachedResponse = await caches.match(request);
    
    // En paralelo, actualizar desde la red
    const networkPromise = fetch(request).then(async (networkResponse) => {
      if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(STATIC_CACHE);
        await cache.put(request, networkResponse.clone());
        console.log('🔄 Cache actualizado para:', request.url);
      }
      return networkResponse;
    }).catch(() => {
      // Si falla la red, no hacer nada (ya tenemos cache)
      console.log('⚠️ Red falló, manteniendo cache para:', request.url);
    });
    
    // Si hay cache, devolverlo inmediatamente
    if (cachedResponse) {
      console.log('⚡ Servido desde cache (actualizando en background):', request.url);
      return cachedResponse;
    }
    
    // Si no hay cache, esperar la respuesta de red
    return await networkPromise;
    
  } catch (error) {
    console.error('❌ Error en Stale-While-Revalidate:', error);
    return new Response('Error de recurso local', { status: 503 });
  }
}

// Manejo especializado para imágenes externas con try...catch
async function handleExternalImage(request) {
  try {
    console.log('🖼️ Manejando imagen externa:', request.url);
    
    // Intentar cargar desde la red con timeout y manejo de errores específicos
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 segundos timeout
    
    try {
      const networkResponse = await fetch(request, { 
        signal: controller.signal,
        mode: 'cors',
        cache: 'default'
      });
      
      clearTimeout(timeoutId);
      
      // Verificar códigos de error específicos
      if (networkResponse.status === 404 || networkResponse.status === 503 || 
          networkResponse.status === 500 || !networkResponse.ok) {
        console.log(`🚫 Imagen externa falló con status ${networkResponse.status}, usando placeholder`);
        return createImagePlaceholder();
      }
      
      console.log('✅ Imagen externa cargada correctamente:', request.url);
      return networkResponse;
      
    } catch (fetchError) {
      clearTimeout(timeoutId);
      
      // Manejar diferentes tipos de errores sin lanzar TypeError
      if (fetchError.name === 'AbortError') {
        console.log('⏱️ Timeout en imagen externa, usando placeholder:', request.url);
      } else if (fetchError.name === 'TypeError') {
        console.log('🌐 Error de red en imagen externa, usando placeholder:', request.url);
      } else {
        console.log('❌ Error desconocido en imagen externa, usando placeholder:', request.url, fetchError.message);
      }
      
      return createImagePlaceholder();
    }
    
  } catch (error) {
    // Catch final para cualquier error no capturado
    console.log('🛡️ Error capturado en handleExternalImage, usando placeholder:', error.message);
    return createImagePlaceholder();
  }
}

// Network First para recursos dinámicos
async function networkFirst(request) {
  try {
    console.log('🌐 Network First para:', request.url);
    
    const networkResponse = await fetch(request);
    
    if (networkResponse && networkResponse.ok && shouldCache(request.url)) {
      try {
        const responseToCache = networkResponse.clone();
        const cache = await caches.open(CACHE_NAME);
        await cache.put(request, responseToCache);
        console.log('💾 Cacheado desde red:', request.url);
      } catch (cacheError) {
        console.warn('⚠️ No se pudo cachear:', request.url);
      }
    }
    
    return networkResponse;
    
  } catch (networkError) {
    console.log('📁 Red falló, intentando cache:', request.url);
    
    try {
      const cachedResponse = await caches.match(request);
      if (cachedResponse) {
        console.log('✅ Servido desde cache:', request.url);
        return cachedResponse;
      }
    } catch (cacheError) {
      console.warn('⚠️ Cache también falló:', request.url);
    }
    
    // Fallbacks específicos por tipo de recurso
    if (request.destination === 'document') {
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
    
    // Para imágenes que fallan, devolver placeholder
    if (request.destination === 'image') {
      return createImagePlaceholder();
    }
    
    // Para otros recursos, error silencioso
    console.warn('🚫 Recurso no disponible (ignorando):', request.url);
    return new Response('', {
      status: 503,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

// Función helper para crear placeholder de imagen
function createImagePlaceholder() {
  try {
    console.log('🖼️ Creando placeholder de imagen');
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
  } catch (error) {
    console.warn('⚠️ Error creando placeholder:', error);
    return new Response('', {
      status: 200,
      headers: { 'Content-Type': 'image/gif' }
    });
  }
}

// Función helper para verificar si la URL debe ser cacheada
function shouldCache(url) {
  return !NO_CACHE_URLS.some(domain => url.includes(domain));
}

// Message event - Comunicación con la app
self.addEventListener('message', (event) => {
  console.log('💬 Mensaje recibido en SW:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'GET_CACHE_INFO') {
    Promise.all([
      caches.open(CACHE_NAME).then(cache => cache.keys()),
      caches.open(STATIC_CACHE).then(cache => cache.keys())
    ]).then(([dynamicKeys, staticKeys]) => {
      event.ports[0].postMessage({
        type: 'CACHE_INFO',
        dynamicCacheSize: dynamicKeys.length,
        staticCacheSize: staticKeys.length,
        dynamicCacheName: CACHE_NAME,
        staticCacheName: STATIC_CACHE
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

console.log('🎯 Ñammy Service Worker cargado - Estrategias híbridas optimizadas v1.1.0');