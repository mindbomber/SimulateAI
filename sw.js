// SimulateAI Service Worker
// Comprehensive PWA service worker with offline support and caching strategies

const CACHE_NAME = 'simulateai-v1.10.0';
const OFFLINE_CACHE = 'simulateai-offline-v1.0';
const RUNTIME_CACHE = 'simulateai-runtime-v1.0';

// Core files to cache immediately
const CORE_FILES = [
  '/SimulateAI/',
  '/SimulateAI/index.html',
  '/SimulateAI/app.html',
  '/SimulateAI/manifest.json',

  // Core JavaScript
  '/SimulateAI/src/js/app.js',
  '/SimulateAI/src/js/config/firebase-config.js',
  '/SimulateAI/src/js/services/firebase-service.js',
  '/SimulateAI/src/js/services/firebase-analytics-service.js',
  '/SimulateAI/src/js/services/hybrid-data-service.js',

  // Core CSS
  '/SimulateAI/src/styles/main.css',
  '/SimulateAI/src/styles/priority-components.css',
  '/SimulateAI/src/styles/consolidated-components.css',

  // Essential assets
  '/SimulateAI/src/assets/icons/Square Icon_192_x_192.png',
  '/SimulateAI/src/assets/icons/Square Icon_512_x_512.png',
  '/SimulateAI/src/assets/icons/favicon.svg',
  '/SimulateAI/src/assets/icons/logo.svg',

  // Data files
  '/SimulateAI/src/data/categories.js',
];

// Files to cache on first visit
const EXTENDED_FILES = [
  // Additional pages
  '/SimulateAI/firebase-analytics-dashboard.html',
  '/SimulateAI/firebase-integration-demo.html',

  // Component files
  '/SimulateAI/src/js/components/badge-modal.js',
  '/SimulateAI/src/js/components/card-component.js',
  '/SimulateAI/src/js/components/main-grid.js',
  '/SimulateAI/src/js/components/enhanced-simulation-modal.js',
  '/SimulateAI/src/js/components/ethics-explorer.js',
  '/SimulateAI/src/js/components/onboarding-tour.js',
  '/SimulateAI/src/js/components/post-simulation-modal.js',

  // Additional styles
  '/SimulateAI/src/styles/badge-modal.css',
  '/SimulateAI/src/styles/card-component.css',
  '/SimulateAI/src/styles/ethics-explorer.css',
  '/SimulateAI/src/styles/onboarding-tour.css',
  '/SimulateAI/src/styles/enhanced-simulation-modal.css',
];

// Network-first resources (always try network first)
const NETWORK_FIRST = [
  '/SimulateAI/src/js/services/',
  '/SimulateAI/firebase-analytics-dashboard.html',
  '/SimulateAI/firebase-integration-demo.html',
];

// Cache-first resources (static assets)
const CACHE_FIRST = [
  '/SimulateAI/src/assets/',
  '/SimulateAI/src/styles/',
  '/SimulateAI/manifest.json',
];

// Runtime cache patterns
const RUNTIME_PATTERNS = [
  {
    pattern: /^https:\/\/www\.gstatic\.com\/firebasejs\//,
    strategy: 'stale-while-revalidate',
    cacheName: 'firebase-cdn',
  },
  {
    pattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
    strategy: 'stale-while-revalidate',
    cacheName: 'google-fonts',
  },
  {
    pattern: /^https:\/\/.*\.firebaseapp\.com\//,
    strategy: 'network-first',
    cacheName: 'firebase-api',
  },
  {
    pattern: /^https:\/\/.*\.cloudfunctions\.net\//,
    strategy: 'network-only',
    cacheName: 'cloud-functions',
  },
];

// Install event - cache core resources
self.addEventListener('install', event => {
  console.log('🔧 Service Worker installing...');

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(cache => {
        console.log('📦 Caching core files...');
        return cache.addAll(
          CORE_FILES.map(
            url =>
              new Request(url, {
                cache: 'reload',
              })
          )
        );
      }),
      caches.open(OFFLINE_CACHE).then(cache => {
        console.log('📦 Caching offline fallbacks...');
        return cache.addAll([
          '/SimulateAI/offline.html',
          '/SimulateAI/src/assets/icons/Square Icon_192_x_192.png',
        ]);
      }),
    ])
      .then(() => {
        console.log('✅ Service Worker installation complete');
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('❌ Service Worker installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', event => {
  console.log('🚀 Service Worker activating...');

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then(cacheNames => {
        return Promise.all(
          cacheNames.map(cacheName => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== OFFLINE_CACHE &&
              cacheName !== RUNTIME_CACHE &&
              !cacheName.includes('firebase-cdn') &&
              !cacheName.includes('google-fonts')
            ) {
              console.log('🗑️ Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      }),
      // Take control of all clients
      self.clients.claim(),
    ]).then(() => {
      console.log('✅ Service Worker activated and ready');

      // Cache extended files in background
      cacheExtendedFiles();
    })
  );
});

// Background caching of extended files
async function cacheExtendedFiles() {
  try {
    const cache = await caches.open(CACHE_NAME);
    console.log('📦 Background caching extended files...');

    // Cache files in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < EXTENDED_FILES.length; i += batchSize) {
      const batch = EXTENDED_FILES.slice(i, i + batchSize);
      await Promise.all(
        batch.map(url =>
          cache
            .add(new Request(url, { cache: 'reload' }))
            .catch(error => console.warn('Failed to cache:', url, error))
        )
      );
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    console.log('✅ Extended files cached successfully');
  } catch (error) {
    console.warn('⚠️ Background caching failed:', error);
  }
}

// Fetch event - handle all network requests
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== 'GET' || url.protocol === 'chrome-extension:') {
    return;
  }

  // Handle different request types with appropriate strategies
  event.respondWith(handleRequest(request));
});

// Main request handling logic
async function handleRequest(request) {
  const url = new URL(request.url);

  try {
    // Check for runtime cache patterns
    for (const pattern of RUNTIME_PATTERNS) {
      if (pattern.pattern.test(request.url)) {
        return handleRuntimeCache(request, pattern);
      }
    }

    // Handle app shell requests
    if (isAppShellRequest(request)) {
      return handleAppShell(request);
    }

    // Handle static assets
    if (isStaticAsset(request)) {
      return handleStaticAsset(request);
    }

    // Handle API requests
    if (isApiRequest(request)) {
      return handleApiRequest(request);
    }

    // Default: network first with cache fallback
    return handleNetworkFirst(request);
  } catch (error) {
    console.error('❌ Request handling failed:', error);
    return handleOfflineFallback(request);
  }
}

// Handle runtime cache patterns (CDNs, external resources)
async function handleRuntimeCache(request, pattern) {
  const cache = await caches.open(pattern.cacheName);

  switch (pattern.strategy) {
    case 'stale-while-revalidate':
      return staleWhileRevalidate(request, cache);
    case 'network-first':
      return networkFirst(request, cache);
    case 'network-only':
      return fetch(request);
    default:
      return cacheFirst(request, cache);
  }
}

// App shell strategy - cache first with network update
async function handleAppShell(request) {
  const cache = await caches.open(CACHE_NAME);
  const cachedResponse = await cache.match(request);

  if (cachedResponse) {
    // Update cache in background
    fetch(request)
      .then(response => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch(error => {
        console.warn('Background update failed:', error);
      });

    return cachedResponse;
  }

  // Not in cache, fetch from network
  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return handleOfflineFallback(request);
  }
}

// Static assets strategy - cache first
async function handleStaticAsset(request) {
  const cache = await caches.open(CACHE_NAME);
  return cacheFirst(request, cache);
}

// API requests strategy - network first
async function handleApiRequest(request) {
  const cache = await caches.open(RUNTIME_CACHE);
  return networkFirst(request, cache, 3000); // 3 second timeout
}

// Network first with cache fallback
async function handleNetworkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  return networkFirst(request, cache);
}

// Cache strategies implementation
async function cacheFirst(request, cache) {
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }

  try {
    const response = await fetch(request);
    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    return handleOfflineFallback(request);
  }
}

async function networkFirst(request, cache, timeout = 5000) {
  try {
    const response = await Promise.race([
      fetch(request),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Network timeout')), timeout)
      ),
    ]);

    if (response.ok) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    return handleOfflineFallback(request);
  }
}

async function staleWhileRevalidate(request, cache) {
  const cachedResponse = await cache.match(request);

  const networkResponse = fetch(request)
    .then(response => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch(error => {
      console.warn('Network update failed:', error);
      return null;
    });

  return cachedResponse || networkResponse;
}

// Request type detection
function isAppShellRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname === '/SimulateAI/' ||
    url.pathname === '/SimulateAI/index.html' ||
    url.pathname.endsWith('.html')
  );
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes('/src/assets/') ||
    url.pathname.includes('/src/styles/') ||
    url.pathname.endsWith('.css') ||
    url.pathname.endsWith('.js') ||
    url.pathname.endsWith('.png') ||
    url.pathname.endsWith('.jpg') ||
    url.pathname.endsWith('.svg') ||
    url.pathname.endsWith('.ico')
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return (
    url.hostname.includes('firebase') ||
    url.hostname.includes('googleapis') ||
    url.pathname.includes('/api/')
  );
}

// Offline fallback handling
async function handleOfflineFallback(request) {
  const url = new URL(request.url);

  // For HTML pages, return offline page
  if (request.headers.get('accept')?.includes('text/html')) {
    const offlineCache = await caches.open(OFFLINE_CACHE);
    const offlinePage = await offlineCache.match('/SimulateAI/offline.html');
    if (offlinePage) {
      return offlinePage;
    }
  }

  // For images, return cached fallback icon
  if (request.headers.get('accept')?.includes('image/')) {
    const offlineCache = await caches.open(OFFLINE_CACHE);
    const fallbackImage = await offlineCache.match(
      '/SimulateAI/src/assets/icons/Square Icon_192_x_192.png'
    );
    if (fallbackImage) {
      return fallbackImage;
    }
  }

  // For other resources, return network error
  return new Response('Network error', {
    status: 503,
    statusText: 'Service Unavailable',
    headers: new Headers({
      'Content-Type': 'text/plain',
    }),
  });
}

// Background sync for offline actions
self.addEventListener('sync', event => {
  console.log('🔄 Background sync triggered:', event.tag);

  if (event.tag === 'background-sync') {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  try {
    // Handle any queued offline actions
    console.log('📤 Processing offline queue...');

    // This would integrate with your Firebase offline queue
    // For now, just log that sync is available
    console.log('✅ Background sync completed');
  } catch (error) {
    console.error('❌ Background sync failed:', error);
  }
}

// Push notification handling
self.addEventListener('push', event => {
  if (!event.data) {
    console.log('Push event but no data');
    return;
  }

  const data = event.data.json();
  console.log('📬 Push notification received:', data);

  const options = {
    body: data.body || 'New update from SimulateAI',
    icon: '/SimulateAI/src/assets/icons/Square Icon_192_x_192.png',
    badge: '/SimulateAI/src/assets/icons/Square Icon_192_x_192.png',
    tag: data.tag || 'simulateai-notification',
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || 'SimulateAI', options)
  );
});

// Notification click handling
self.addEventListener('notificationclick', event => {
  console.log('🔔 Notification clicked:', event.notification.tag);

  event.notification.close();

  // Handle notification actions
  if (event.action) {
    console.log('📱 Notification action:', event.action);
    // Handle specific actions based on event.action
  }

  // Open or focus the app
  event.waitUntil(
    clients
      .matchAll({ includeUncontrolled: true, type: 'window' })
      .then(clientList => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes('/SimulateAI/') && 'focus' in client) {
            return client.focus();
          }
        }

        // Open new window
        if (clients.openWindow) {
          return clients.openWindow('/SimulateAI/');
        }
      })
  );
});

// Performance monitoring
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'PERFORMANCE_MARK') {
    console.log('📊 Performance mark:', event.data.name, event.data.duration);
  }
});

console.log('🔥 SimulateAI Service Worker loaded successfully');
