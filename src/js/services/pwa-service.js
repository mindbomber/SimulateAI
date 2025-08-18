/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * PWA Service - Progressive Web App Features Integration
 * Phase 3.5: Enhanced with DataHandler integration for persistent PWA state management
 * Integrates PWA functionality with Firebase services and persistent storage
 */

import { UI, TIMING } from "../utils/constants.js";

export class PWAService {
  constructor(firebaseService = null, app = null) {
    this.firebaseService = firebaseService;
    this.app = app; // Phase 3.5: App instance for DataHandler integration
    this.dataHandler = null; // Phase 3.5: DataHandler for persistent storage
    this.registration = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.installPromptEvent = null;

    // Phase 3.5: Persistent PWA state management
    this.installationHistory = [];
    this.connectivityHistory = [];
    this.syncMetrics = {
      totalSyncs: 0,
      failedSyncs: 0,
      lastSyncTime: null,
      averageSyncDuration: 0,
    };

    // Phase 3.5: PWA health monitoring
    this.pwaHealth = {
      serviceWorkerStatus: "unknown",
      installStatus: "unknown",
      connectivityStatus: this.isOnline ? "online" : "offline",
      syncQueueHealth: "healthy",
    };

    // FIREBASE 400 FIX: Add rate limiting and initialization tracking
    this.eventThrottle = new Map();
    this.maxEventsPerMinute = 10;
    this.isInitializing = true;
    this.recentErrors = 0;
    this.initialized = false; // Prevent duplicate initialization

    // PWA prompt dismissal tracking
    this.promptDismissed = false;
    this.promptDismissedAt = null;
    this.promptCooldownHours = 24; // Don't show again for 24 hours
    this.updatePromptDismissedAt = null; // Track update prompt dismissals separately
    this.currentUpdateWorker = null; // Track current service worker to prevent duplicate updates

    // Don't auto-initialize to prevent service duplication
    // Call init() manually after construction
  }

  /**
   * Phase 3.5: Initialize DataHandler integration for persistent PWA state
   */
  async initializeDataHandlerIntegration() {
    // Try multiple sources for DataHandler
    this.dataHandler = this.app?.dataHandler || window.dataHandler || null;

    if (this.dataHandler) {
      // Load existing PWA data
      await this.loadPWAData();

      // Initialize PWA analytics
      this.initializePWAAnalytics();

      // DataHandler integration initialized
    } else {
      console.warn(
        "⚠️ PWAService: DataHandler not available, using fallback storage",
      );
    }
  }

  /**
   * Phase 3.5: Load PWA persistent data from DataHandler
   */
  async loadPWAData() {
    if (!this.dataHandler) return;

    try {
      const pwaData = (await this.dataHandler.get("pwa_state")) || {};

      this.installationHistory = pwaData.installationHistory || [];
      this.connectivityHistory = pwaData.connectivityHistory || [];
      this.syncMetrics = {
        ...this.syncMetrics,
        ...pwaData.syncMetrics,
      };

      // Load prompt dismissal state
      this.promptDismissed = pwaData.promptDismissed || false;
      this.promptDismissedAt = pwaData.promptDismissedAt || null;

      // Persistent PWA data loaded
    } catch (error) {
      console.error("❌ PWAService: Failed to load PWA data:", error);
    }
  }

  /**
   * Phase 3.5: Save PWA state to persistent storage
   */
  async savePWAData() {
    if (!this.dataHandler) return;

    try {
      const pwaData = {
        installationHistory: this.installationHistory,
        connectivityHistory: this.connectivityHistory,
        syncMetrics: this.syncMetrics,
        promptDismissed: this.promptDismissed,
        promptDismissedAt: this.promptDismissedAt,
        lastUpdated: Date.now(),
      };

      await this.dataHandler.set("pwa_state", pwaData);
    } catch (error) {
      console.error("❌ PWAService: Failed to save PWA data:", error);
    }
  }

  /**
   * Check if install prompt should be shown (respects dismissal cooldown)
   */
  shouldShowInstallPrompt() {
    // Don't show if already installed
    if (this.isInstalled) return false;

    // Don't show if dismissed and still in cooldown
    if (this.promptDismissed && this.promptDismissedAt) {
      const hoursPasssed =
        (Date.now() - this.promptDismissedAt) / (1000 * 60 * 60);
      if (hoursPasssed < this.promptCooldownHours) {
        return false;
      }
    }

    return true;
  }

  /**
   * Mark install prompt as dismissed
   */
  async dismissInstallPrompt() {
    this.promptDismissed = true;
    this.promptDismissedAt = Date.now();

    // Save to persistent storage
    await this.savePWAData();

    this.trackPWAEvent("install_prompt_dismissed", {
      dismissed_at: this.promptDismissedAt,
      cooldown_hours: this.promptCooldownHours,
    });

    // Install prompt dismissed (24h cooldown)
  }

  /**
   * Phase 3.5: Initialize PWA analytics tracking
   */
  initializePWAAnalytics() {
    if (this.app && this.app.analytics) {
      // Track PWA initialization in app analytics
      this.app.analytics.trackEvent("pwa_datahandler_integration", {
        has_data_handler: !!this.dataHandler,
        installation_history_count: this.installationHistory.length,
        connectivity_history_count: this.connectivityHistory.length,
        total_syncs: this.syncMetrics.totalSyncs,
      });
    }
  }

  /**
   * Phase 3.5: Enhanced PWA event tracking with DataHandler persistence
   */
  trackInstallationEvent(eventType, details = {}) {
    const installEvent = {
      type: eventType,
      timestamp: Date.now(),
      details: {
        ...details,
        user_agent: navigator.userAgent,
        is_standalone: this.isInstalled,
      },
    };

    this.installationHistory.push(installEvent);

    // Keep only last 50 installation events
    if (this.installationHistory.length > 50) {
      this.installationHistory = this.installationHistory.slice(-50);
    }

    this.debouncedSave();
    this.trackPWAEvent("installation_event", installEvent);
  }

  /**
   * Phase 3.5: Enhanced connectivity tracking with persistence
   */
  trackConnectivityEvent(online) {
    const connectivityEvent = {
      status: online ? "online" : "offline",
      timestamp: Date.now(),
      navigator_online: navigator.onLine,
    };

    this.connectivityHistory.push(connectivityEvent);

    // Keep only last 100 connectivity events
    if (this.connectivityHistory.length > 100) {
      this.connectivityHistory = this.connectivityHistory.slice(-100);
    }

    this.pwaHealth.connectivityStatus = online ? "online" : "offline";
    this.debouncedSave();
    this.trackPWAEvent("connectivity_change", connectivityEvent);
  }

  /**
   * Phase 3.5: Update PWA health monitoring
   */
  updatePWAHealth() {
    this.pwaHealth = {
      serviceWorkerStatus: this.registration ? "active" : "inactive",
      installStatus: this.isInstalled ? "installed" : "browser",
      connectivityStatus: this.isOnline ? "online" : "offline",
      syncQueueHealth: this.syncQueue.length > 50 ? "overloaded" : "healthy",
    };
  }

  /**
   * Phase 3.5: Debounced save to prevent excessive storage writes
   */
  debouncedSave = (() => {
    let timeout;
    return () => {
      clearTimeout(timeout);
      timeout = setTimeout(() => this.savePWAData(), 1000);
    };
  })();

  /**
   * Initialize PWA service with enhanced deduplication
   * Phase 3.5: Enhanced with DataHandler integration
   */
  async init() {
    if (this.initialized) {
      console.warn(
        "📱 PWAService already initialized - skipping duplicate initialization",
      );
      return;
    }

    try {
      // Initializing PWA Service

      // Phase 3.5: Initialize DataHandler integration first
      await this.initializeDataHandlerIntegration();

      // Check installation status first
      this.checkInstallationStatus();

      // Register service worker
      await this.registerServiceWorker();

      // Set up event listeners
      this.setupEventListeners();

      // Initialize background sync
      this.initializeBackgroundSync();

      // Phase 3.5: Update PWA health status
      this.updatePWAHealth();

      // Mark as initialized
      this.initialized = true;

      // Track PWA initialization
      this.trackPWAEvent("pwa_service_initialized", {
        is_installed: this.isInstalled,
        is_online: this.isOnline,
        has_service_worker: !!this.registration,
        has_data_handler: !!this.dataHandler,
      });

      // PWA Service initialized successfully

      // Only show install prompt if not installed and not in cooldown
      if (!this.isInstalled) {
        // Delay install prompt to avoid overwhelming user on page load
        setTimeout(() => {
          if (this.installPromptEvent && this.shouldShowInstallPrompt()) {
            this.showInstallPrompt();
          }
        }, 3000); // 3 second delay
      }

      // FIREBASE 400 FIX: Mark initialization complete
      this.isInitializing = false;
    } catch (error) {
      console.error("❌ PWA Service initialization failed:", error);
      this.isInitializing = false; // FIREBASE 400 FIX: Clear initialization flag on error

      // Phase 3.5: Track initialization failure
      this.trackPWAEvent("pwa_service_init_failed", {
        error: error.message,
        stack: error.stack,
      });
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    // Skip Service Worker registration in development
    const isDevelopment = window.location.hostname === "localhost";
    if (isDevelopment) {
      // Skipping SW registration in development
      return null;
    }

    if ("serviceWorker" in navigator) {
      try {
        // Determine the correct base path for service worker
        const basePath = "/";
        const swPath = "/sw.js";

        // Service Worker registration details (omitted)

        this.registration = await navigator.serviceWorker.register(swPath, {
          scope: basePath,
        });

        // Handle updates
        this.registration.addEventListener("updatefound", () => {
          this.handleServiceWorkerUpdate();
        });

        return this.registration;
      } catch (error) {
        console.error("❌ Service Worker registration failed:", error);
        throw error;
      }
    } else {
      throw new Error("Service Workers not supported");
    }
  }

  /**
   * Handle service worker updates with deduplication
   */
  handleServiceWorkerUpdate() {
    const newWorker = this.registration.installing;

    if (newWorker) {
      // Prevent multiple update notifications for the same worker
      if (this.currentUpdateWorker === newWorker) {
        // Service worker update already being handled
        return;
      }

      this.currentUpdateWorker = newWorker;

      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          // Only show update notification if app is installed
          // For non-installed apps, this should be an install prompt instead
          if (this.isInstalled) {
            this.showUpdateNotification();
          } else {
            // Service worker updated but app not installed - show install prompt instead
            this.showInstallPrompt();
          }
        }
      });
    }
  }

  /**
   * Force service worker update and cache refresh
   */
  async forceUpdate() {
    try {
      // Forcing PWA update and cache refresh

      // Step 1: Tell the service worker to skip waiting
      if (this.registration && this.registration.waiting) {
        this.registration.waiting.postMessage({ type: "SKIP_WAITING" });
      }

      // Step 2: Clear all caches
      if ("caches" in window) {
        const cacheNames = await caches.keys();

        await Promise.all(
          cacheNames.map((cacheName) => {
            // Deleting cache: ${cacheName}
            return caches.delete(cacheName);
          }),
        );
      }

      // Step 3: Unregister current service worker
      if (this.registration) {
        // Unregistering service worker
        await this.registration.unregister();
      }

      // Step 4: Clear browser storage related to app
      this.clearAppStorage();

      // Step 5: Force hard reload with cache bypass
      // Performing hard reload
      window.location.reload(true); // Force reload from server, not cache
    } catch (error) {
      console.error("❌ Force update failed:", error);
      // Fallback to regular reload
      window.location.reload();
    }
  }

  /**
   * Clear app-specific storage
   */
  clearAppStorage() {
    try {
      // Clear localStorage items that might be stale
      const storageKeys = Object.keys(localStorage);
      const appKeys = storageKeys.filter(
        (key) =>
          key.startsWith("simulateai_") ||
          key.startsWith("pwa_") ||
          key.includes("cache") ||
          key.includes("version"),
      );

      appKeys.forEach((key) => {
        localStorage.removeItem(key);
      });

      // Clear sessionStorage
      sessionStorage.clear();
    } catch (error) {
      console.warn("⚠️ Could not clear some storage:", error);
    }
  }

  /**
   * Show update notification to user with deduplication
   */
  showUpdateNotification() {
    // Check for existing update notifications
    const existingUpdateNotification = document.getElementById(
      "pwa-update-simulateai",
    );
    if (existingUpdateNotification) {
      // Update notification already showing - skipping duplicate
      return;
    }

    // Custom update notification
    const notification = {
      id: "pwa-update-simulateai",
      title: "SimulateAI Update Available",
      message:
        "A new version of SimulateAI is ready. This will clear cache and reload the app with the latest features!",
      actions: [
        {
          text: "Update Now",
          action: () => {
            // User chose to update PWA
            this.forceUpdate(); // Use the new force update method
          },
        },
        {
          text: "Later",
          action: () => {
            // User dismissed PWA update
            this.trackPWAEvent("update_dismissed", {
              version: "v1.15.0",
              user_choice: "later",
            });

            // Dismiss for a shorter period for updates (1 hour vs 24 hours for install)
            this.updatePromptDismissedAt = Date.now();
          },
        },
      ],
    };

    this.showNotification(notification);

    this.trackPWAEvent("update_available_shown", {
      version: "v1.15.0",
      user_choice: "pending",
      service_worker_state: this.registration?.waiting ? "waiting" : "unknown",
    });
  }

  /**
   * Set up event listeners for PWA functionality
   */
  setupEventListeners() {
    // Online/offline status
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.handleOnlineStatusChange(true);
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.handleOnlineStatusChange(false);
    });

    // Install prompt with enhanced deduplication
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPromptEvent = e;

      // Don't automatically show prompt - let init() handle timing
      // Install prompt event captured, will show with delay

      // Only auto-show if we're past the initialization phase
      if (
        this.initialized &&
        !this.isInstalled &&
        this.shouldShowInstallPrompt()
      ) {
        setTimeout(() => {
          this.showInstallPrompt();
        }, 2000); // 2 second delay for auto-prompt
      }
    });

    // App installed
    window.addEventListener("appinstalled", () => {
      this.isInstalled = true;
      this.handleAppInstalled();
    });

    // Visibility change (for background sync)
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden && this.isOnline) {
        this.processSyncQueue();
      }
    });
  }

  /**
   * Handle online/offline status changes
   * Phase 3.5: Enhanced with persistent connectivity tracking
   */
  handleOnlineStatusChange(isOnline) {
    // Phase 3.5: Update stored connectivity status first
    this.isOnline = isOnline;
    this.trackConnectivityEvent(isOnline);

    if (isOnline) {
      this.processSyncQueue();
      this.hideOfflineIndicator();
    } else {
      this.showOfflineIndicator();
    }

    // Phase 3.5: Update PWA health monitoring
    this.updatePWAHealth();

    // Notify Firebase service if available
    if (this.firebaseService && this.firebaseService.handleConnectivityChange) {
      this.firebaseService.handleConnectivityChange(isOnline);
    }
  }

  /**
   * Show offline indicator
   */
  showOfflineIndicator() {
    let indicator = document.getElementById("offline-indicator");

    if (!indicator) {
      indicator = document.createElement("div");
      indicator.id = "offline-indicator";
      indicator.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                right: 0;
                background: #dc3545;
                color: white;
                padding: 10px;
                text-align: center;
                font-size: 14px;
                z-index: ${UI.Z_INDEX.PWA_NOTIFICATION};
                animation: slideDown 0.3s ease-out;
            `;
      indicator.innerHTML = "📡 You're offline - Some features may be limited";
      document.body.appendChild(indicator);
    }

    indicator.style.display = "block";
  }

  /**
   * Hide offline indicator
   */
  hideOfflineIndicator() {
    const indicator = document.getElementById("offline-indicator");
    if (indicator) {
      indicator.style.display = "none";
    }
  }

  /**
   * Check if app is installed as PWA with enhanced detection
   */
  checkInstallationStatus() {
    // Multiple methods to detect PWA installation
    const standaloneMode = window.matchMedia(
      "(display-mode: standalone)",
    ).matches;
    const iosStandalone = window.navigator.standalone === true;
    const isAndroidPWA = window.location.search.includes(
      "utm_source=homescreen",
    );
    const hasInstalledClass = document.body.classList.contains("pwa-installed");

    // Check if beforeinstallprompt event is available (indicates not installed)
    const beforeInstallPromptAvailable = "onbeforeinstallprompt" in window;

    this.isInstalled =
      standaloneMode || iosStandalone || isAndroidPWA || hasInstalledClass;

    // PWA Installation Status check complete

    if (this.isInstalled) {
      document.body.classList.add("pwa-installed");

      // Clear any pending install prompts since app is installed
      this.installPromptEvent = null;

      // Remove any existing install notifications
      const installNotifications =
        document.querySelectorAll(".pwa-notification");
      installNotifications.forEach((notification) => {
        if (notification.textContent.includes("Install")) {
          notification.remove();
        }
      });
    } else {
      document.body.classList.remove("pwa-installed");
    }

    return this.isInstalled;
  }

  /**
   * Show install prompt with enhanced deduplication
   */
  showInstallPrompt() {
    // Disable PWA install prompt from service - using index.html version instead
    // PWA install prompt disabled in service - using index.html version
    return;
  }

  /**
   * Trigger PWA installation
   */
  async triggerInstall() {
    if (!this.installPromptEvent) {
      console.warn("Install prompt not available");
      return false;
    }

    try {
      this.installPromptEvent.prompt();
      const { outcome } = await this.installPromptEvent.userChoice;

      this.trackPWAEvent("install_prompt_result", {
        outcome,
        user_choice: outcome,
      });

      if (outcome === "accepted") {
        return true;
      } else {
        return false;
      }
    } catch (error) {
      console.error("❌ PWA installation failed:", error);
      return false;
    } finally {
      this.installPromptEvent = null;
    }
  }

  /**
   * Handle app installation
   * Phase 3.5: Enhanced with persistent installation tracking
   */
  handleAppInstalled() {
    this.isInstalled = true;

    // Remove install prompts
    const installBanner = document.getElementById("pwa-install-banner");
    if (installBanner) {
      installBanner.remove();
    }

    // Add installed class
    document.body.classList.add("pwa-installed");

    // Phase 3.5: Track installation with enhanced details
    this.trackInstallationEvent("app_installed", {
      installation_time: Date.now(),
      user_agent: navigator.userAgent,
      installation_source: "app_banner",
    });

    // Phase 3.5: Update PWA health status
    this.updatePWAHealth();
  }

  /**
   * Initialize background sync for offline actions
   * Phase 3.5: Enhanced with DataHandler integration
   */
  initializeBackgroundSync() {
    // Listen for background sync events from service worker
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      // Background sync is supported
      // Background sync supported

      // Phase 3.5: Track sync capability
      this.trackPWAEvent("background_sync_supported", {
        has_sync: true,
        user_agent: navigator.userAgent,
      });

      // Listen for sync messages from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type === "SYNC_COMPLETE") {
          this.handleSyncComplete(event.data.payload);
        }
      });
    } else {
      console.warn("⚠️ Background sync not supported, using fallback");

      // Phase 3.5: Track lack of sync capability
      this.trackPWAEvent("background_sync_not_supported", {
        has_sync: false,
        user_agent: navigator.userAgent,
      });
    }
  }

  /**
   * Add action to sync queue for offline processing
   */
  addToSyncQueue(action) {
    this.syncQueue.push({
      ...action,
      timestamp: Date.now(),
      id: this.generateId(),
    });

    // Try to register background sync
    this.registerBackgroundSync();
  }

  /**
   * Register background sync
   */
  async registerBackgroundSync() {
    if (
      this.registration &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
      try {
        await this.registration.sync.register("background-sync");
      } catch (error) {
        console.warn("⚠️ Background sync registration failed:", error);
        // Fallback to manual sync when online
        this.scheduleManualSync();
      }
    }
  }

  /**
   * Schedule manual sync for when online
   */
  scheduleManualSync() {
    const checkOnline = () => {
      if (navigator.onLine && this.syncQueue.length > 0) {
        this.processSyncQueue();
      } else if (this.syncQueue.length > 0) {
        setTimeout(checkOnline, TIMING.POLLING_INTERVAL); // Check again in 5 seconds
      }
    };

    setTimeout(checkOnline, TIMING.SLOW);
  }

  /**
   * Process sync queue when back online
   */
  async processSyncQueue() {
    if (!this.isOnline || this.syncQueue.length === 0) return;

    const results = {
      success: 0,
      failed: 0,
      total: this.syncQueue.length,
    };

    // Process each queued action
    while (this.syncQueue.length > 0) {
      const action = this.syncQueue.shift();

      try {
        await this.processQueuedAction(action);
        results.success++;
      } catch (error) {
        console.error("❌ Sync action failed:", action.type, error);
        results.failed++;

        // Re-queue if it's worth retrying
        if (this.shouldRetry(action)) {
          action.retries = (action.retries || 0) + 1;
          this.syncQueue.push(action);
        }
      }
    }

    this.trackPWAEvent("sync_queue_processed", results);

    if (results.success > 0) {
      this.showSyncNotification(results);
    }
  }

  /**
   * Process individual queued action
   */
  async processQueuedAction(action) {
    if (!this.firebaseService) {
      throw new Error("Firebase service not available");
    }

    switch (action.type) {
      case "submit_research_response":
        return await this.firebaseService.submitSecureResearchResponse(
          action.data,
        );

      case "update_user_profile":
        return await this.firebaseService.updateSecureUserProfile(action.data);

      case "track_analytics_event":
        return await this.firebaseService.trackStorageEvent(
          action.eventName,
          action.data,
        );

      case "upload_file":
        return await this.firebaseService.uploadFileWithAnalysis(
          action.file,
          action.options,
        );

      default:
        throw new Error(`Unknown action type: ${action.type}`);
    }
  }

  /**
   * Check if action should be retried
   */
  shouldRetry(action) {
    const maxRetries = 3;
    const retries = action.retries || 0;

    // Don't retry if max attempts reached
    if (retries >= maxRetries) return false;

    // Don't retry old actions (older than 24 hours)
    const ageHours = (Date.now() - action.timestamp) / (1000 * 60 * 60);
    if (ageHours > 24) return false;

    return true;
  }

  /**
   * Phase 3.5: Handle sync completion from service worker
   */
  handleSyncComplete(payload) {
    // Background sync completed

    // Update sync metrics
    this.syncMetrics.totalSyncs++;
    this.syncMetrics.lastSyncTime = Date.now();

    if (payload.duration) {
      // Update average sync duration
      if (this.syncMetrics.averageSyncDuration === 0) {
        this.syncMetrics.averageSyncDuration = payload.duration;
      } else {
        this.syncMetrics.averageSyncDuration =
          (this.syncMetrics.averageSyncDuration + payload.duration) / 2;
      }
    }

    if (payload.success === false) {
      this.syncMetrics.failedSyncs++;
    }

    // Update PWA health
    this.updatePWAHealth();

    // Save metrics
    this.debouncedSave();

    // Track the sync completion
    this.trackPWAEvent("background_sync_completed", {
      sync_type: payload.type || "unknown",
      success: payload.success !== false,
      duration: payload.duration,
      total_syncs: this.syncMetrics.totalSyncs,
      failed_syncs: this.syncMetrics.failedSyncs,
    });
  }

  /**
   * Show sync completion notification
   */
  showSyncNotification(results) {
    const message =
      results.failed === 0
        ? `✅ ${results.success} offline actions synced successfully`
        : `⚠️ ${results.success} synced, ${results.failed} failed`;

    this.showNotification({
      title: "Sync Complete",
      message,
      duration: 3000,
    });
  }

  /**
   * Generic notification display with deduplication
   */
  showNotification(notification) {
    // Prevent duplicate notifications
    const notificationId =
      notification.id ||
      `pwa-${notification.title.replace(/\s+/g, "-").toLowerCase()}`;

    // Remove any existing notification with the same ID
    const existingNotification = document.getElementById(notificationId);
    if (existingNotification) {
      existingNotification.remove();
    }

    // Don't show install prompts if app is already installed
    if (notification.title.includes("Install") && this.isInstalled) {
      return;
    }

    // Create notification element
    const notificationEl = document.createElement("div");
    notificationEl.id = notificationId;
    notificationEl.className = "pwa-notification";
    notificationEl.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: white;
            color: #333;
            padding: 20px;
            border-radius: 10px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.2);
            z-index: ${UI.Z_INDEX.CRITICAL_OVERLAY};
            max-width: 350px;
            border-left: 4px solid #667eea;
            animation: slideInRight 0.3s ease-out;
        `;

    let content = `<div style="font-weight: bold; margin-bottom: 10px;">${notification.title}</div>`;
    content += `<div style="margin-bottom: 15px;">${notification.message}</div>`;

    if (notification.actions) {
      content += "<div>";
      notification.actions.forEach((action, index) => {
        content += `<button onclick="this.parentElement.parentElement.remove(); window.pwaNotificationAction_${index}_${Date.now()}()" 
                           style="margin-right: 10px; padding: 8px 16px; border: none; border-radius: 5px; 
                           background: #667eea; color: white; cursor: pointer;">${action.text}</button>`;

        // Create global function for the action
        const functionName = `pwaNotificationAction_${index}_${Date.now()}`;
        window[functionName] = () => {
          try {
            action.action();
          } catch (error) {
            console.error("PWA notification action error:", error);
          }
          // Clean up the global function
          delete window[functionName];
        };
      });
      content += "</div>";
    }

    notificationEl.innerHTML = content;
    document.body.appendChild(notificationEl);

    // Track notification display
    // Showing PWA notification

    // Auto-remove after duration
    const duration = notification.duration || TIMING.NOTIFICATION_NORMAL;
    setTimeout(() => {
      if (notificationEl.parentNode) {
        notificationEl.remove();
      }
    }, duration);
  }

  /**
   * Track PWA-related events
   * FIREBASE 400 FIX: Added rate limiting and error handling
   */
  trackPWAEvent(eventName, data = {}) {
    // FIREBASE 400 FIX: Rate limiting check
    const now = Date.now();
    const key = `pwa_${eventName}`;
    const lastEvent = this.eventThrottle.get(key) || 0;

    if (now - lastEvent < 6000) {
      // 6 seconds between same events
      console.log(`⚠️ Throttling PWA event: ${eventName}`);
      return;
    }

    this.eventThrottle.set(key, now);

    // FIREBASE 400 FIX: Only track critical events during initialization
    const criticalEvents = [
      "pwa_service_initialized",
      "background_sync_supported",
      "pwa_service_init_failed",
    ];
    if (!criticalEvents.includes(eventName) && this.isInitializing) {
      console.log(
        `⏳ Skipping non-critical PWA event during initialization: ${eventName}`,
      );
      return;
    }

    if (this.firebaseService && this.firebaseService.trackStorageEvent) {
      // FIREBASE 400 FIX: Add try-catch to prevent cascade failures
      try {
        this.firebaseService.trackStorageEvent(`pwa_${eventName}`, {
          ...data,
          timestamp: Date.now(),
          user_agent: navigator.userAgent,
          is_standalone: this.isInstalled,
          is_online: this.isOnline,
        });
      } catch (error) {
        this.recentErrors++;
        console.warn(
          `Failed to track PWA event ${eventName} (${this.recentErrors} recent errors):`,
          error,
        );

        // If too many errors, temporarily disable PWA tracking
        if (this.recentErrors > 5) {
          console.error(
            "🚨 Too many PWA tracking errors, temporarily disabling Firebase tracking",
          );
          setTimeout(() => {
            this.recentErrors = 0;
            console.log("✅ Re-enabling PWA Firebase tracking");
          }, 60000); // 1 minute
        }
      }
    }

    // Also track with Google Analytics if available
    if (typeof window !== "undefined" && typeof window.gtag !== "undefined") {
      try {
        window.gtag("event", eventName, {
          event_category: "PWA",
          event_label: data.label || eventName,
          custom_parameter_1: this.isInstalled ? "installed" : "browser",
          custom_parameter_2: this.isOnline ? "online" : "offline",
        });
      } catch (error) {
        console.warn("Google Analytics tracking failed:", error);
      }
    }
  }

  /**
   * Get PWA status information
   */
  getStatus() {
    return {
      isInstalled: this.isInstalled,
      isOnline: this.isOnline,
      hasServiceWorker: !!this.registration,
      syncQueueLength: this.syncQueue.length,
      canInstall: !!this.installPromptEvent,
    };
  }

  /**
   * Generate unique ID for actions
   */
  generateId() {
    return `${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Force refresh service worker cache
   */
  async refreshCache() {
    if (this.registration) {
      try {
        await this.registration.update();

        return true;
      } catch (error) {
        console.error("❌ Cache refresh failed:", error);
        return false;
      }
    }
    return false;
  }

  /**
   * Get cache usage information
   */
  async getCacheInfo() {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          quota: estimate.quota,
          usage: estimate.usage,
          usagePercentage: ((estimate.usage / estimate.quota) * 100).toFixed(2),
        };
      } catch (error) {
        console.warn("⚠️ Storage estimate failed:", error);
        return null;
      }
    }
    return null;
  }

  /**
   * Phase 3.5: Get comprehensive PWA analytics
   */
  getPWAAnalytics() {
    const now = Date.now();
    const last24Hours = now - 24 * 60 * 60 * 1000;
    const last7Days = now - 7 * 24 * 60 * 60 * 1000;

    // Connectivity analysis
    const recentConnectivity = this.connectivityHistory.filter(
      (event) => event.timestamp >= last24Hours,
    );

    const connectivityChanges = recentConnectivity.length;
    const offlineTime = recentConnectivity
      .filter((event) => event.status === "offline")
      .reduce((total, event, index, arr) => {
        const nextEvent = arr[index + 1];
        if (nextEvent && nextEvent.status === "online") {
          return total + (nextEvent.timestamp - event.timestamp);
        }
        return total;
      }, 0);

    // Installation analysis
    const recentInstallations = this.installationHistory.filter(
      (event) => event.timestamp >= last7Days,
    );

    // Sync performance analysis
    const syncSuccessRate =
      this.syncMetrics.totalSyncs > 0
        ? (
            ((this.syncMetrics.totalSyncs - this.syncMetrics.failedSyncs) /
              this.syncMetrics.totalSyncs) *
            100
          ).toFixed(2)
        : 100;

    return {
      overview: {
        isInstalled: this.isInstalled,
        isOnline: this.isOnline,
        hasServiceWorker: !!this.registration,
        hasDataHandler: !!this.dataHandler,
        healthStatus: this.getPWAHealthScore(),
      },
      connectivity: {
        currentStatus: this.isOnline ? "online" : "offline",
        changes24h: connectivityChanges,
        offlineTime24h: Math.round(offlineTime / 1000 / 60), // minutes
        connectivityReliability: this.getConnectivityReliability(),
      },
      installation: {
        installationCount7d: recentInstallations.length,
        totalInstallEvents: this.installationHistory.length,
        lastInstallEvent:
          this.installationHistory.length > 0
            ? this.installationHistory[this.installationHistory.length - 1]
            : null,
      },
      sync: {
        totalSyncs: this.syncMetrics.totalSyncs,
        failedSyncs: this.syncMetrics.failedSyncs,
        successRate: syncSuccessRate,
        averageDuration: this.syncMetrics.averageSyncDuration,
        lastSyncTime: this.syncMetrics.lastSyncTime,
        queueLength: this.syncQueue.length,
      },
      performance: {
        cacheEnabled: !!this.registration,
        backgroundSyncSupported:
          "sync" in window.ServiceWorkerRegistration.prototype,
        persistentStorageAvailable: !!this.dataHandler,
        healthScore: this.getPWAHealthScore(),
      },
      timestamp: now,
    };
  }

  /**
   * Phase 3.5: Calculate PWA health score
   */
  getPWAHealthScore() {
    let score = 0;
    const maxScore = 100;

    // Service Worker health (25 points)
    if (this.registration && this.pwaHealth.serviceWorkerStatus === "active") {
      score += 25;
    }

    // Connectivity stability (25 points)
    const connectivityReliability = this.getConnectivityReliability();
    score += Math.round(connectivityReliability * 0.25);

    // Sync performance (25 points)
    if (this.syncMetrics.totalSyncs > 0) {
      const successRate =
        (this.syncMetrics.totalSyncs - this.syncMetrics.failedSyncs) /
        this.syncMetrics.totalSyncs;
      score += Math.round(successRate * 25);
    } else {
      score += 25; // No syncs attempted, assume healthy
    }

    // Queue health (25 points)
    if (this.syncQueue.length === 0) {
      score += 25;
    } else if (this.syncQueue.length < 10) {
      score += 15;
    } else if (this.syncQueue.length < 50) {
      score += 5;
    }
    // else 0 points for overloaded queue

    return Math.min(score, maxScore);
  }

  /**
   * Phase 3.5: Calculate connectivity reliability percentage
   */
  getConnectivityReliability() {
    if (this.connectivityHistory.length < 2) return 100;

    const totalTime =
      this.connectivityHistory[this.connectivityHistory.length - 1].timestamp -
      this.connectivityHistory[0].timestamp;

    let onlineTime = 0;

    for (let i = 0; i < this.connectivityHistory.length - 1; i++) {
      const current = this.connectivityHistory[i];
      const next = this.connectivityHistory[i + 1];
      const duration = next.timestamp - current.timestamp;

      if (current.status === "online") {
        onlineTime += duration;
      }
    }

    return totalTime > 0 ? Math.round((onlineTime / totalTime) * 100) : 100;
  }

  /**
   * Phase 3.5: Get sync queue analytics
   */
  getSyncQueueAnalytics() {
    const now = Date.now();
    const oldestItem =
      this.syncQueue.length > 0
        ? Math.min(...this.syncQueue.map((item) => item.timestamp))
        : now;

    return {
      totalItems: this.syncQueue.length,
      oldestItemAge: Math.round((now - oldestItem) / 1000 / 60), // minutes
      itemTypes: this.syncQueue.reduce((types, item) => {
        types[item.type] = (types[item.type] || 0) + 1;
        return types;
      }, {}),
      averageAge:
        this.syncQueue.length > 0
          ? Math.round(
              this.syncQueue.reduce(
                (sum, item) => sum + (now - item.timestamp),
                0,
              ) /
                this.syncQueue.length /
                1000 /
                60,
            )
          : 0,
    };
  }

  /**
   * Phase 3.5: Clear old PWA data for maintenance
   */
  async clearOldPWAData() {
    if (!this.dataHandler) return;

    try {
      const cutoffTime = Date.now() - 30 * 24 * 60 * 60 * 1000; // 30 days

      // Clear old connectivity history
      this.connectivityHistory = this.connectivityHistory.filter(
        (event) => event.timestamp >= cutoffTime,
      );

      // Clear old installation history
      this.installationHistory = this.installationHistory.filter(
        (event) => event.timestamp >= cutoffTime,
      );

      // Clear old sync queue items
      this.syncQueue = this.syncQueue.filter(
        (item) => item.timestamp >= cutoffTime,
      );

      // Save cleaned data
      await this.savePWAData();

      console.log("✅ PWAService: Cleared old PWA data");
    } catch (error) {
      console.error("❌ PWAService: Failed to clear old data:", error);
    }
  }

  /**
   * Phase 3.5: Export PWA data for analysis
   */
  async exportPWAData() {
    const analytics = this.getPWAAnalytics();
    const syncQueueAnalytics = this.getSyncQueueAnalytics();

    return {
      exportTimestamp: Date.now(),
      pwaService: {
        version: "3.5.0",
        features: {
          dataHandlerIntegration: !!this.dataHandler,
          serviceWorkerSupport: !!this.registration,
          backgroundSyncSupport:
            "sync" in window.ServiceWorkerRegistration.prototype,
        },
      },
      analytics,
      syncQueue: syncQueueAnalytics,
      rawData: {
        installationHistory: this.installationHistory,
        connectivityHistory: this.connectivityHistory.slice(-100), // Last 100 events
        syncMetrics: this.syncMetrics,
        pwaHealth: this.pwaHealth,
      },
    };
  }

  /**
   * Phase 3.5: Reset PWA analytics data
   */
  async resetAnalytics() {
    if (!this.dataHandler) return;

    try {
      this.installationHistory = [];
      this.connectivityHistory = [];
      this.syncMetrics = {
        totalSyncs: 0,
        failedSyncs: 0,
        lastSyncTime: null,
        averageSyncDuration: 0,
      };

      await this.savePWAData();
      console.log("✅ PWAService: Analytics data reset");
    } catch (error) {
      console.error("❌ PWAService: Failed to reset analytics:", error);
    }
  }
}

// Export for use in other modules
export default PWAService;
