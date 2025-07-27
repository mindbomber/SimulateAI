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

  // Scenario completions
  async getScenarioCompletions(userId = "default") {
    return (await this.getData(`scenario_completions_${userId}`)) || [];
  }

  async saveScenarioCompletion(completionData, userId = "default") {
    const completions = await this.getScenarioCompletions(userId);
    completions.push({
      ...completionData,
      id: `${completionData.categoryId}_${completionData.scenarioId}_${Date.now()}`,
      savedAt: new Date().toISOString(),
    });
    return await this.saveData(`scenario_completions_${userId}`, completions);
  }

  async getAllCompletions(userId = "default") {
    return await this.getScenarioCompletions(userId);
  }

  async getAnalyticsData(userId = "default") {
    const completions = await this.getScenarioCompletions(userId);
    const research = await this.getResearchData(userId);

    return {
      totalScenarios: completions.length,
      totalResearch: research.length,
      completionsByCategory: this._groupBy(completions, "categoryId"),
      lastActivity: Math.max(
        ...completions.map((c) => new Date(c.timestamp).getTime()),
        ...research.map((r) => new Date(r.timestamp).getTime()),
      ),
    };
  }

  _groupBy(array, key) {
    return array.reduce((result, item) => {
      const group = item[key];
      result[group] = result[group] || [];
      result[group].push(item);
      return result;
    }, {});
  }

  // Consent data management
  async getConsentData(userId = "default") {
    return await this.getData(`research_consent_${userId}`);
  }

  async saveConsentData(consentData, userId = "default") {
    return await this.saveData(`research_consent_${userId}`, {
      ...consentData,
      savedAt: new Date().toISOString(),
      id: `consent_${Date.now()}`,
    });
  }

  // Navigation telemetry management
  async getNavigationTelemetry(userId = "default") {
    return (await this.getData(`nav_telemetry_${userId}`)) || [];
  }

  async saveNavigationTelemetry(telemetryData, userId = "default") {
    const existing = await this.getNavigationTelemetry(userId);
    const updated = Array.isArray(existing) ? existing : [];

    if (Array.isArray(telemetryData)) {
      updated.push(...telemetryData);
    } else {
      updated.push(telemetryData);
    }

    // Keep only last 100 entries
    if (updated.length > 100) {
      updated.splice(0, updated.length - 100);
    }

    return await this.saveData(`nav_telemetry_${userId}`, updated);
  }

  // Session management
  async getSessionData(sessionKey, userId = "default") {
    return await this.getData(`session_${sessionKey}_${userId}`);
  }

  async saveSessionData(sessionKey, sessionData, userId = "default") {
    return await this.saveData(`session_${sessionKey}_${userId}`, {
      ...sessionData,
      savedAt: new Date().toISOString(),
      sessionId: sessionKey,
    });
  }

  // Comprehensive data export for analytics
  async exportAllUserData(userId = "default") {
    try {
      const [
        settings,
        scenarios,
        research,
        badges,
        consent,
        navigation,
        progress,
        achievements,
      ] = await Promise.all([
        this.getData(`settings_manager_${userId}`),
        this.getScenarioCompletions(userId),
        this.getResearchData(userId),
        this.getData(`badge_manager_state_${userId}`),
        this.getConsentData(userId),
        this.getNavigationTelemetry(userId),
        this.getUserProgress(userId),
        this.getUserAchievements(userId),
      ]);

      return {
        exportDate: new Date().toISOString(),
        userId,
        settings,
        scenarios,
        research,
        badges,
        consent,
        navigation,
        progress,
        achievements,
        summary: {
          totalScenarios: scenarios?.length || 0,
          totalResearch: research?.length || 0,
          totalNavigationEvents: navigation?.length || 0,
          totalAchievements: achievements?.length || 0,
          hasConsent: !!consent,
          hasSettings: !!settings,
        },
      };
    } catch (error) {
      console.error("Failed to export user data:", error);
      return null;
    }
  }

  /**
   * Blog Comment Management Methods
   */

  /**
   * Save blog comments for a specific post
   */
  async saveBlogComments(postId, comments) {
    const commentsKey = `blog_comments_${postId}`;
    const enrichedComments = {
      postId,
      comments: Array.isArray(comments) ? comments : [],
      lastUpdated: new Date().toISOString(),
      totalComments: Array.isArray(comments) ? comments.length : 0,
    };

    return await this.saveData(commentsKey, enrichedComments, {
      priority: "medium",
      syncToFirebase: true,
    });
  }

  /**
   * Get blog comments for a specific post
   */
  async getBlogComments(postId) {
    const commentsKey = `blog_comments_${postId}`;
    const data = await this.getData(commentsKey);
    return data?.comments || [];
  }

  /**
   * Save blog analytics for a specific post
   */
  async saveBlogAnalytics(postId, analytics) {
    const analyticsKey = `blog_analytics_${postId}`;
    const enrichedAnalytics = {
      postId,
      ...analytics,
      lastUpdated: new Date().toISOString(),
    };

    return await this.saveData(analyticsKey, enrichedAnalytics, {
      priority: "low",
      syncToFirebase: true,
    });
  }

  /**
   * Get blog analytics for a specific post
   */
  async getBlogAnalytics(postId) {
    const analyticsKey = `blog_analytics_${postId}`;
    return await this.getData(analyticsKey);
  }

  /**
   * Delete blog comments and analytics for a specific post
   */
  async deleteBlogData(postId) {
    try {
      const commentsKey = `blog_comments_${postId}`;
      const analyticsKey = `blog_analytics_${postId}`;

      await this.deleteData(commentsKey);
      await this.deleteData(analyticsKey);

      console.log(`✅ Blog data deleted for post ${postId}`);
      return true;
    } catch (error) {
      console.error(`❌ Failed to delete blog data for post ${postId}:`, error);
      return false;
    }
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
   * User Profile Management Methods
   */

  /**
   * Save user profile data
   */
  async saveUserProfile(profileData) {
    const profileKey = "userProfile";
    const enrichedProfile = {
      ...profileData,
      version: this.version,
      lastSaved: new Date().toISOString(),
      source: "user-metadata-collector",
    };

    return await this.saveData(profileKey, enrichedProfile, {
      priority: "high",
      syncToFirebase: true,
      createBackup: true,
    });
  }

  /**
   * Get user profile data
   */
  async getUserProfile() {
    return await this.getData("userProfile", {
      includeMetadata: true,
    });
  }

  /**
   * Update specific profile section
   */
  async updateUserProfileSection(section, sectionData) {
    try {
      const currentProfile = (await this.getUserProfile()) || {};
      const updatedProfile = {
        ...currentProfile,
        [section]: { ...currentProfile[section], ...sectionData },
        updatedAt: new Date().toISOString(),
      };

      return await this.saveUserProfile(updatedProfile);
    } catch (error) {
      console.error(`Failed to update profile section ${section}:`, error);
      return false;
    }
  }

  /**
   * Delete user profile data (GDPR compliance)
   */
  async deleteUserProfile() {
    const profileKey = "userProfile";

    try {
      // Delete from Firebase if available
      if (this.firebaseService && this.isOnline) {
        await this.firebaseService.deleteUserData(profileKey);
        console.log("✅ User profile deleted from Firebase");
      }

      // Delete from localStorage
      localStorage.removeItem(this.generateStorageKey(profileKey));

      // Clear from cache
      this.cache.delete(profileKey);

      console.log("✅ User profile deleted from all storage locations");
      return true;
    } catch (error) {
      console.error("❌ Failed to delete user profile:", error);
      return false;
    }
  }

  /**
   * Check if user has completed profile
   */
  async hasUserProfile() {
    const profile = await this.getUserProfile();
    return profile && Object.keys(profile).length > 0;
  }

  /**
   * Get user profile completion status
   */
  async getUserProfileCompletion() {
    const profile = await this.getUserProfile();
    if (!profile) return { percentage: 0, sections: [] };

    const sections = ["demographics", "philosophy", "consent"];
    const completed = sections.filter((section) => {
      const data = profile[section];
      return data && Object.keys(data).length > 0;
    });

    return {
      percentage: Math.round((completed.length / sections.length) * 100),
      sections: completed,
      totalSections: sections.length,
      profile: profile,
    };
  }

  /**
   * Export user data for GDPR compliance
   */
  async exportUserData() {
    try {
      const userProfile = await this.getUserProfile();
      const scenarioData = (await this.getData("scenarios")) || {};
      const settingsData = (await this.getData("settings")) || {};
      const badgeData = (await this.getData("badges")) || {};
      const consentData = await this.getConsentData();
      const navigationData = (await this.getData("navigationTelemetry")) || {};

      return {
        exportDate: new Date().toISOString(),
        version: this.version,
        userData: {
          profile: userProfile,
          scenarios: scenarioData,
          settings: settingsData,
          badges: badgeData,
          consent: consentData,
          navigation: navigationData,
        },
        metadata: {
          source: "SimulateAI DataHandler",
          exportFormat: "JSON",
          gdprCompliant: true,
        },
      };
    } catch (error) {
      console.error("❌ Failed to export user data:", error);
      return null;
    }
  }

  /**
   * Compatibility aliases for components expecting get/set methods
   */
  async get(key, options = {}) {
    return await this.getData(key, options);
  }

  // === ONBOARDING TOUR MANAGEMENT ===

  /**
   * Save onboarding tour data and analytics
   */
  async saveOnboardingData(key, data) {
    try {
      const storageKey = this.generateStorageKey(`onboarding_${key}`);
      const success = await this.saveData(storageKey, {
        ...data,
        savedAt: Date.now(),
        version: this.config.version,
      });

      if (success) {
        console.log(`[DataHandler] Onboarding data saved: ${key}`);
      }

      return success;
    } catch (error) {
      console.error(
        `[DataHandler] Error saving onboarding data: ${key}`,
        error,
      );
      return false;
    }
  }

  /**
   * Get onboarding tour data
   */
  async getOnboardingData(key) {
    try {
      const storageKey = this.generateStorageKey(`onboarding_${key}`);
      const data = await this.getData(storageKey);
      return data || null;
    } catch (error) {
      console.error(
        `[DataHandler] Error getting onboarding data: ${key}`,
        error,
      );
      return null;
    }
  }

  /**
   * Save onboarding tour analytics
   */
  async saveOnboardingAnalytics(sessionId, analytics) {
    try {
      const analyticsKey = `onboarding_analytics_${sessionId}`;
      return await this.saveOnboardingData(analyticsKey, {
        type: "analytics",
        sessionId,
        analytics,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.error("[DataHandler] Error saving onboarding analytics", error);
      return false;
    }
  }

  /**
   * Get onboarding tour analytics
   */
  async getOnboardingAnalytics(sessionId = null) {
    try {
      if (sessionId) {
        const analyticsKey = `onboarding_analytics_${sessionId}`;
        return await this.getOnboardingData(analyticsKey);
      }

      // Get all analytics if no session specified
      const allData = await this.getOnboardingData("analytics");
      return allData || [];
    } catch (error) {
      console.error("[DataHandler] Error getting onboarding analytics", error);
      return null;
    }
  }

  /**
   * Save onboarding progress
   */
  async saveOnboardingProgress(progressData) {
    try {
      return await this.saveOnboardingData("progress", {
        type: "progress",
        ...progressData,
        lastUpdated: Date.now(),
      });
    } catch (error) {
      console.error("[DataHandler] Error saving onboarding progress", error);
      return false;
    }
  }

  /**
   * Get onboarding progress
   */
  async getOnboardingProgress() {
    try {
      return await this.getOnboardingData("progress");
    } catch (error) {
      console.error("[DataHandler] Error getting onboarding progress", error);
      return null;
    }
  }

  /**
   * Delete all onboarding data (GDPR compliance)
   */
  async deleteOnboardingData() {
    try {
      const keys = ["tour_data", "progress", "analytics"];
      const deletePromises = keys.map((key) =>
        this.deleteData(this.generateStorageKey(`onboarding_${key}`)),
      );

      await Promise.all(deletePromises);

      // Also clear localStorage onboarding data
      const localKeys = ["tour_completed", "has_visited"];
      localKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch (e) {
          console.warn(`Failed to remove localStorage key: ${key}`, e);
        }
      });

      console.log("[DataHandler] All onboarding data deleted");
      return true;
    } catch (error) {
      console.error("[DataHandler] Error deleting onboarding data", error);
      return false;
    }
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
