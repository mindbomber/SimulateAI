/**
 * DataHandler - Centralized Data Management System
 * Provides unified interface for data operations with Firebase/localStorage fallback
 *
 * Features:
 * - Automatic Firebase sync when authenticated
 * - Smart caching to reduce redundant operations
 * - Graceful fallback to localStorage
 * - Queue management for offline operations
 * - Performance monitoring and optimization
 * - Error handling with retry logic
 */

class DataHandler {
  constructor(options = {}) {
    // Handle both old style (firebaseService) and new style (options) constructors
    if (
      typeof options === "object" &&
      (options.appName || options.firebaseService)
    ) {
      // New options-based constructor
      this.appName = options.appName || "SimulateAI";
      this.version = options.version || "1.40";
      this.enableFirebase = options.enableFirebase !== false;
      this.enableCaching = options.enableCaching !== false;
      this.enableOfflineQueue = options.enableOfflineQueue !== false;
      this.firebaseService = options.firebaseService || null;
    } else {
      // Legacy constructor - assume first parameter is firebaseService
      this.firebaseService = options;
      this.appName = "SimulateAI";
      this.version = "1.40";
      this.enableFirebase = true;
      this.enableCaching = true;
      this.enableOfflineQueue = true;
    }

    this.cache = new Map();
    this.pendingOperations = new Map();
    this.operationQueue = [];
    this.isOnline = navigator.onLine;
    this.performanceMetrics = {
      cacheHits: 0,
      cacheMisses: 0,
      firebaseOperations: 0,
      localStorageOperations: 0,
      averageResponseTime: 0,
      operationCount: 0,
    };

    this.initializeEventListeners();
    console.log("[DataHandler] Initialized with caching and queue management");
  }

  /**
   * Initialize with Firebase service for backward compatibility
   */
  async initialize(firebaseService = null) {
    if (firebaseService) {
      this.firebaseService = firebaseService;
    }

    console.log("[DataHandler] Initialization complete", {
      hasFirebase: !!this.firebaseService,
      appName: this.appName,
      version: this.version,
      enableCaching: this.enableCaching,
      enableOfflineQueue: this.enableOfflineQueue,
    });

    return this;
  }

  initializeEventListeners() {
    // Monitor online/offline status
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.processQueue();
      console.log("[DataHandler] Online - processing queued operations");
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      console.log("[DataHandler] Offline - will queue operations");
    });
  }

  /**
   * Get data with caching and fallback
   */
  async getData(key, options = {}) {
    const startTime = performance.now();
    const cacheKey = this.generateCacheKey(key, options);

    try {
      // Check cache first
      if (this.cache.has(cacheKey) && !options.bypassCache) {
        this.performanceMetrics.cacheHits++;
        const cached = this.cache.get(cacheKey);
        if (this.isCacheValid(cached, options.ttl)) {
          console.log(`[DataHandler] Cache hit for ${key}`);
          return cached.data;
        }
      }

      this.performanceMetrics.cacheMisses++;
      let data = null;

      // Try Firebase first if available and online
      if (
        this.firebaseService &&
        this.isOnline &&
        this.firebaseService.isAuthenticated()
      ) {
        try {
          data = await this.firebaseService.getData(key);
          this.performanceMetrics.firebaseOperations++;
          console.log(`[DataHandler] Firebase data retrieved for ${key}`);
        } catch (firebaseError) {
          console.warn(
            `[DataHandler] Firebase failed for ${key}:`,
            firebaseError,
          );
        }
      }

      // Fallback to localStorage
      if (data === null) {
        const localData = localStorage.getItem(key);
        if (localData) {
          try {
            data = JSON.parse(localData);
            this.performanceMetrics.localStorageOperations++;
            console.log(`[DataHandler] localStorage data retrieved for ${key}`);
          } catch (parseError) {
            console.error(
              `[DataHandler] Failed to parse localStorage data for ${key}:`,
              parseError,
            );
          }
        }
      }

      // Cache the result
      if (data !== null) {
        this.cache.set(cacheKey, {
          data: data,
          timestamp: Date.now(),
          source:
            this.firebaseService && this.isOnline ? "firebase" : "localStorage",
        });
      }

      this.updatePerformanceMetrics(startTime);
      return data;
    } catch (error) {
      console.error(`[DataHandler] Failed to get data for ${key}:`, error);
      this.updatePerformanceMetrics(startTime);
      return null;
    }
  }

  /**
   * Save data with Firebase sync and local backup
   */
  async saveData(key, data, options = {}) {
    const startTime = performance.now();

    try {
      // Always save to localStorage first for immediate availability
      const serializedData = JSON.stringify(data);
      localStorage.setItem(key, serializedData);
      this.performanceMetrics.localStorageOperations++;

      // Update cache
      const cacheKey = this.generateCacheKey(key, options);
      this.cache.set(cacheKey, {
        data: data,
        timestamp: Date.now(),
        source: "localStorage",
      });

      // Try Firebase if available and online
      if (
        this.firebaseService &&
        this.isOnline &&
        this.firebaseService.isAuthenticated()
      ) {
        try {
          await this.firebaseService.saveData(key, data);
          this.performanceMetrics.firebaseOperations++;

          // Update cache source
          this.cache.set(cacheKey, {
            data: data,
            timestamp: Date.now(),
            source: "firebase",
          });

          console.log(
            `[DataHandler] Data saved to Firebase and localStorage for ${key}`,
          );
        } catch (firebaseError) {
          console.warn(
            `[DataHandler] Firebase save failed for ${key}, queuing for later:`,
            firebaseError,
          );
          this.queueOperation("save", key, data, options);
        }
      } else if (
        this.firebaseService &&
        this.firebaseService.isAuthenticated()
      ) {
        // Queue for when online
        this.queueOperation("save", key, data, options);
        console.log(`[DataHandler] Queued Firebase save for ${key} (offline)`);
      }

      this.updatePerformanceMetrics(startTime);
      return true;
    } catch (error) {
      console.error(`[DataHandler] Failed to save data for ${key}:`, error);
      this.updatePerformanceMetrics(startTime);
      return false;
    }
  }

  /**
   * Remove data from all storage locations
   */
  async removeData(key, options = {}) {
    const startTime = performance.now();

    try {
      // Remove from localStorage
      localStorage.removeItem(key);
      this.performanceMetrics.localStorageOperations++;

      // Remove from cache
      const cacheKey = this.generateCacheKey(key, options);
      this.cache.delete(cacheKey);

      // Remove from Firebase if available
      if (
        this.firebaseService &&
        this.isOnline &&
        this.firebaseService.isAuthenticated()
      ) {
        try {
          await this.firebaseService.removeData(key);
          this.performanceMetrics.firebaseOperations++;
          console.log(
            `[DataHandler] Data removed from Firebase and localStorage for ${key}`,
          );
        } catch (firebaseError) {
          console.warn(
            `[DataHandler] Firebase remove failed for ${key}:`,
            firebaseError,
          );
        }
      }

      this.updatePerformanceMetrics(startTime);
      return true;
    } catch (error) {
      console.error(`[DataHandler] Failed to remove data for ${key}:`, error);
      this.updatePerformanceMetrics(startTime);
      return false;
    }
  }

  /**
   * Specialized methods for common data types
   */

  // User preferences
  async getUserPreferences(userId = "default") {
    return (await this.getData(`preferences_${userId}`)) || {};
  }

  async saveUserPreferences(preferences, userId = "default") {
    return await this.saveData(`preferences_${userId}`, preferences);
  }

  // User progress
  async getUserProgress(userId = "default") {
    return (await this.getData(`progress_${userId}`)) || {};
  }

  async saveUserProgress(progress, userId = "default") {
    return await this.saveData(`progress_${userId}`, progress);
  }

  // Settings
  async getSettings() {
    return (await this.getData("app_settings")) || {};
  }

  async saveSettings(settings) {
    return await this.saveData("app_settings", settings);
  }

  // User achievements/badges
  async getUserAchievements(userId = "default") {
    return (await this.getData(`achievements_${userId}`)) || [];
  }

  async saveUserAchievements(achievements, userId = "default") {
    return await this.saveData(`achievements_${userId}`, achievements);
  }

  /**
   * Cache management
   */
  generateCacheKey(key, options = {}) {
    return `${key}_${JSON.stringify(options)}`;
  }

  isCacheValid(cached, ttl = 300000) {
    // Default 5 minutes
    return cached && Date.now() - cached.timestamp < ttl;
  }

  clearCache(pattern = null) {
    if (pattern) {
      for (const [key] of this.cache) {
        if (key.includes(pattern)) {
          this.cache.delete(key);
        }
      }
    } else {
      this.cache.clear();
    }
    console.log(
      `[DataHandler] Cache cleared${pattern ? ` for pattern: ${pattern}` : ""}`,
    );
  }

  /**
   * Queue management for offline operations
   */
  queueOperation(operation, key, data = null, options = {}) {
    this.operationQueue.push({
      operation,
      key,
      data,
      options,
      timestamp: Date.now(),
    });
  }

  async processQueue() {
    if (
      !this.firebaseService ||
      !this.isOnline ||
      !this.firebaseService.isAuthenticated()
    ) {
      return;
    }

    console.log(
      `[DataHandler] Processing ${this.operationQueue.length} queued operations`,
    );

    const queue = [...this.operationQueue];
    this.operationQueue = [];

    for (const operation of queue) {
      try {
        switch (operation.operation) {
          case "save":
            await this.firebaseService.saveData(operation.key, operation.data);
            console.log(
              `[DataHandler] Queued save completed for ${operation.key}`,
            );
            break;
          case "remove":
            await this.firebaseService.removeData(operation.key);
            console.log(
              `[DataHandler] Queued remove completed for ${operation.key}`,
            );
            break;
        }
        this.performanceMetrics.firebaseOperations++;
      } catch (error) {
        console.error(
          `[DataHandler] Queued operation failed for ${operation.key}:`,
          error,
        );
        // Re-queue failed operations (with exponential backoff logic could be added)
        this.operationQueue.push(operation);
      }
    }
  }

  /**
   * Performance monitoring
   */
  updatePerformanceMetrics(startTime) {
    const duration = performance.now() - startTime;
    this.performanceMetrics.operationCount++;
    this.performanceMetrics.averageResponseTime =
      (this.performanceMetrics.averageResponseTime *
        (this.performanceMetrics.operationCount - 1) +
        duration) /
      this.performanceMetrics.operationCount;
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      cacheHitRate:
        (this.performanceMetrics.cacheHits /
          (this.performanceMetrics.cacheHits +
            this.performanceMetrics.cacheMisses)) *
        100,
      queueLength: this.operationQueue.length,
      cacheSize: this.cache.size,
    };
  }

  /**
   * Health check
   */
  async healthCheck() {
    const health = {
      status: "healthy",
      timestamp: new Date().toISOString(),
      online: this.isOnline,
      firebase: false,
      localStorage: false,
      cache: this.cache.size > 0,
      queue: this.operationQueue.length,
      metrics: this.getPerformanceMetrics(),
    };

    try {
      // Test localStorage
      const testKey = "_health_check_test";
      localStorage.setItem(testKey, "test");
      localStorage.removeItem(testKey);
      health.localStorage = true;
    } catch (error) {
      health.localStorage = false;
      console.warn("[DataHandler] localStorage health check failed:", error);
    }

    try {
      // Test Firebase if available
      if (this.firebaseService && this.isOnline) {
        health.firebase = this.firebaseService.isAuthenticated();
      }
    } catch (error) {
      health.firebase = false;
      console.warn("[DataHandler] Firebase health check failed:", error);
    }

    if (!health.localStorage && !health.firebase) {
      health.status = "critical";
    } else if (!health.firebase && this.firebaseService) {
      health.status = "degraded";
    }

    return health;
  }

  /**
   * Batch operations for efficiency
   */
  async batchSave(operations) {
    const results = [];
    for (const { key, data, options } of operations) {
      const result = await this.saveData(key, data, options);
      results.push({ key, success: result });
    }
    return results;
  }

  async batchGet(keys, options = {}) {
    const results = {};
    for (const key of keys) {
      results[key] = await this.getData(key, options);
    }
    return results;
  }

  /**
   * Compatibility aliases for components expecting get/set methods
   */
  async get(key, options = {}) {
    return await this.getData(key, options);
  }

  async set(key, data, options = {}) {
    return await this.saveData(key, data, options);
  }
}

// Export for use in modules
if (typeof window !== "undefined") {
  window.DataHandler = DataHandler;
}

// ES6 export for modern modules
export default DataHandler;
