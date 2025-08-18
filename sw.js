// SimulateAI Service Worker
// Comprehensive PWA service worker with offline support and caching strategies

// Service Worker Configuration
const CACHE_VERSION = "simulateai-v1.15.2"; // Incremented to refresh caches after CSS strategy change
const CACHE_NAME = `simulateai-main-${CACHE_VERSION}`;
const OFFLINE_CACHE = "simulateai-offline-v1.2";
const RUNTIME_CACHE = "simulateai-runtime-v1.2";

// Update strategy configuration (removed unused constants to satisfy linter)

// Core files to cache immediately (only guaranteed files that exist in build)
const CORE_FILES = ["/", "/index.html", "/app.html", "/manifest.json"];

// Remove extended files that may not exist after build
const EXTENDED_FILES = [];

// Legacy NETWORK_FIRST and CACHE_FIRST arrays removed (unused)

// Runtime cache patterns
const RUNTIME_PATTERNS = [
  // Prefer fresh CSS to avoid stale UI after deployments/edits
  {
    pattern: /\.css(?:\?|$)/,
    strategy: "network-first",
    cacheName: "css-assets",
  },
  {
    pattern: /^https:\/\/www\.gstatic\.com\/firebasejs\//,
    strategy: "stale-while-revalidate",
    cacheName: "firebase-cdn",
  },
  {
    pattern: /^https:\/\/fonts\.(googleapis|gstatic)\.com\//,
    strategy: "stale-while-revalidate",
    cacheName: "google-fonts",
  },
  {
    pattern: /^https:\/\/.*\.firebaseapp\.com\//,
    strategy: "network-first",
    cacheName: "firebase-api",
  },
  {
    pattern: /^https:\/\/.*\.cloudfunctions\.net\//,
    strategy: "network-only",
    cacheName: "cloud-functions",
  },
];

// Install event - cache core resources with better error handling
self.addEventListener("install", (event) => {
  console.log("🔧 Service Worker installing...");

  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then(async (cache) => {
        console.log("📦 Caching core files...");
        // Cache files individually to avoid complete failure if one file fails
        const cachePromises = CORE_FILES.map(async (url) => {
          try {
            await cache.add(new Request(url, { cache: "reload" }));
            console.log(`✅ Cached: ${url}`);
          } catch (error) {
            console.warn(`⚠️ Failed to cache: ${url}`, error);
            // Don't fail the entire installation for individual file failures
          }
        });
        await Promise.all(cachePromises);
      }),
      caches.open(OFFLINE_CACHE).then(async (cache) => {
        console.log("📦 Caching offline fallbacks...");
        // Try to cache offline files, but don't fail if they don't exist
        const offlineFiles = [
          "/offline.html",
          "/src/assets/icons/favicon.svg", // Use a file we know exists
        ];

        for (const file of offlineFiles) {
          try {
            await cache.add(new Request(file, { cache: "reload" }));
            console.log(`✅ Cached offline file: ${file}`);
          } catch (error) {
            console.warn(`⚠️ Failed to cache offline file: ${file}`, error);
          }
        }
      }),
    ])
      .then(() => {
        console.log("✅ Service Worker installation complete");
        // Force activation of new service worker
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error("❌ Service Worker installation failed:", error);
      }),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("🚀 Service Worker activating...");

  event.waitUntil(
    Promise.all([
      // Clean up old caches
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (
              cacheName !== CACHE_NAME &&
              cacheName !== OFFLINE_CACHE &&
              cacheName !== RUNTIME_CACHE &&
              !cacheName.includes("firebase-cdn") &&
              !cacheName.includes("google-fonts")
            ) {
              console.log("🗑️ Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      }),
      // Take control of all clients
      self.clients.claim(),
    ]).then(() => {
      console.log("✅ Service Worker activated and ready");

      // Cache extended files in background
      cacheExtendedFiles();
    }),
  );
});

// Background caching of extended files
async function cacheExtendedFiles() {
  try {
    const cache = await caches.open(CACHE_NAME);
    console.log("📦 Background caching extended files...");

    // Cache files in batches to avoid overwhelming the browser
    const batchSize = 5;
    for (let i = 0; i < EXTENDED_FILES.length; i += batchSize) {
      const batch = EXTENDED_FILES.slice(i, i + batchSize);
      await Promise.all(
        batch.map((url) =>
          cache
            .add(new Request(url, { cache: "reload" }))
            .catch((error) => console.warn("Failed to cache:", url, error)),
        ),
      );
      // Small delay between batches
      await new Promise((resolve) => setTimeout(resolve, 100));
    }

    console.log("✅ Extended files cached successfully");
  } catch (error) {
    console.warn("⚠️ Background caching failed:", error);
  }
}

// Message event - handle commands from PWA service
self.addEventListener("message", (event) => {
  console.log("📨 Service Worker received message:", event.data);

  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("🔄 Skipping waiting and taking control...");
    self.skipWaiting();

    // Notify all clients that update is ready
    self.clients.matchAll().then((clients) => {
      clients.forEach((client) => {
        client.postMessage({
          type: "SW_UPDATED",
          message: "Service Worker updated and ready",
        });
      });
    });
  }

  if (event.data && event.data.type === "CLEAR_CACHE") {
    console.log("🗑️ Clearing all caches on command...");
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            console.log("🗑️ Deleting cache:", cacheName);
            return caches.delete(cacheName);
          }),
        );
      }),
    );
  }
});

// Fetch event - handle all network requests
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests and chrome-extension requests
  if (request.method !== "GET" || url.protocol === "chrome-extension:") {
    return;
  }

  // Handle different request types with appropriate strategies
  event.respondWith(handleRequest(request));
});

// Main request handling logic
async function handleRequest(request) {
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
    console.error("❌ Request handling failed:", error);
    return handleOfflineFallback(request);
  }
}

// Handle runtime cache patterns (CDNs, external resources)
async function handleRuntimeCache(request, pattern) {
  const cache = await caches.open(pattern.cacheName);

  switch (pattern.strategy) {
    case "stale-while-revalidate":
      return staleWhileRevalidate(request, cache);
    case "network-first":
      return networkFirst(request, cache);
    case "network-only":
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
      .then((response) => {
        if (response.ok) {
          cache.put(request, response.clone());
        }
      })
      .catch((error) => {
        console.warn("Background update failed:", error);
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
        setTimeout(() => reject(new Error("Network timeout")), timeout),
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
    .then((response) => {
      if (response.ok) {
        cache.put(request, response.clone());
      }
      return response;
    })
    .catch((error) => {
      console.warn("Network update failed:", error);
      return null;
    });

  return cachedResponse || networkResponse;
}

// Request type detection
function isAppShellRequest(request) {
  const url = new URL(request.url);
  return (
    url.pathname === "/" ||
    url.pathname === "/index.html" ||
    url.pathname.endsWith(".html")
  );
}

function isStaticAsset(request) {
  const url = new URL(request.url);
  return (
    url.pathname.includes("/src/assets/") ||
    url.pathname.includes("/src/styles/") ||
    url.pathname.endsWith(".css") ||
    url.pathname.endsWith(".js") ||
    url.pathname.endsWith(".png") ||
    url.pathname.endsWith(".jpg") ||
    url.pathname.endsWith(".svg") ||
    url.pathname.endsWith(".ico")
  );
}

function isApiRequest(request) {
  const url = new URL(request.url);
  return (
    url.hostname.includes("firebase") ||
    url.hostname.includes("googleapis") ||
    url.pathname.includes("/api/")
  );
}

// Offline fallback handling
async function handleOfflineFallback(request) {
  // For HTML pages, return offline page
  if (request.headers.get("accept")?.includes("text/html")) {
    const offlineCache = await caches.open(OFFLINE_CACHE);
    const offlinePage = await offlineCache.match("/offline.html");
    if (offlinePage) {
      return offlinePage;
    }
  }

  // For images, return cached fallback icon
  if (request.headers.get("accept")?.includes("image/")) {
    const offlineCache = await caches.open(OFFLINE_CACHE);
    const fallbackImage = await offlineCache.match(
      "/src/assets/icons/Square Icon_192_x_192.png",
    );
    if (fallbackImage) {
      return fallbackImage;
    }
  }

  // For other resources, return network error
  return new Response("Network error", {
    status: 503,
    statusText: "Service Unavailable",
    headers: new Headers({
      "Content-Type": "text/plain",
    }),
  });
}

// Background sync for offline actions
self.addEventListener("sync", (event) => {
  console.log("🔄 Background sync triggered:", event.tag);

  if (event.tag === "background-sync") {
    event.waitUntil(doBackgroundSync());
  }
});

async function doBackgroundSync() {
  const startTime = Date.now();

  try {
    console.log("📤 Processing offline queue...");

    // FIREBASE 400 FIX: Batch Firebase operations instead of individual calls
    const queuedEvents = await getQueuedEvents();
    let processedCount = 0;

    if (queuedEvents.length > 0) {
      processedCount = await batchProcessEvents(queuedEvents);
    }

    console.log(
      `✅ Background sync completed: ${processedCount} events processed`,
    );

    // FIREBASE 400 FIX: Notify main thread with minimal data
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        payload: {
          success: true,
          count: processedCount,
          duration: Date.now() - startTime,
        },
      });
    });
  } catch (error) {
    console.error("❌ Background sync failed:", error);

    // Notify main thread of failure
    const clients = await self.clients.matchAll();
    clients.forEach((client) => {
      client.postMessage({
        type: "SYNC_COMPLETE",
        payload: {
          success: false,
          error: error.message,
          duration: Date.now() - startTime,
        },
      });
    });
  }
}

// FIREBASE 400 FIX: Helper functions for batch processing
async function getQueuedEvents() {
  // FIREBASE 400 FIX: Return empty array to prevent Firebase spam during fix period
  // TODO: Implement proper IndexedDB/Cache queuing when Firebase issues are resolved
  return [];
}

async function batchProcessEvents(events) {
  if (events.length === 0) return 0;

  try {
    // FIREBASE 400 FIX: Process in small batches to avoid overwhelming Firebase
    const batchSize = 5;
    let processed = 0;

    for (let i = 0; i < events.length; i += batchSize) {
      const batch = events.slice(i, i + batchSize);

      // Process batch with delay to prevent rate limiting
      await processBatch(batch);
      processed += batch.length;

      // Add delay between batches
      if (i + batchSize < events.length) {
        await new Promise((resolve) => setTimeout(resolve, 1000));
      }
    }

    return processed;
  } catch (error) {
    console.error("Batch processing failed:", error);
    return 0;
  }
}

async function processBatch(events) {
  // FIREBASE 400 FIX: Minimal processing to avoid Firebase errors
  for (const event of events) {
    try {
      // Log instead of sending to Firebase during fix period
      console.log("Processing queued event:", event.type);
    } catch (error) {
      console.warn("Failed to process event:", error);
    }
  }
}

// Push notification handling
self.addEventListener("push", (event) => {
  if (!event.data) {
    console.log("Push event but no data");
    return;
  }

  const data = event.data.json();
  console.log("📬 Push notification received:", data);

  const options = {
    body: data.body || "New update from SimulateAI",
    icon: "/src/assets/icons/Square Icon_192_x_192.png",
    badge: "/src/assets/icons/Square Icon_192_x_192.png",
    tag: data.tag || "simulateai-notification",
    requireInteraction: data.requireInteraction || false,
    actions: data.actions || [],
    data: data.data || {},
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "SimulateAI", options),
  );
});

// Notification click handling
self.addEventListener("notificationclick", (event) => {
  console.log("🔔 Notification clicked:", event.notification.tag);

  event.notification.close();

  // Handle notification actions
  if (event.action) {
    console.log("📱 Notification action:", event.action);
    // Handle specific actions based on event.action
  }

  // Open or focus the app
  event.waitUntil(
    self.clients
      .matchAll({ includeUncontrolled: true, type: "window" })
      .then((clientList) => {
        // Check if app is already open
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && "focus" in client) {
            return client.focus();
          }
        }

        // Open new window
        if (self.clients.openWindow) {
          return self.clients.openWindow("/");
        }
      }),
  );
});

// Performance monitoring
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "PERFORMANCE_MARK") {
    console.log("📊 Performance mark:", event.data.name, event.data.duration);
  }
});

console.log("🔥 SimulateAI Service Worker loaded successfully");
