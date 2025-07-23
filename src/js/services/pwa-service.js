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
 * Integrates PWA functionality with Firebase services
 */

import { UI, TIMING } from "../utils/constants.js";

export class PWAService {
  constructor(firebaseService = null) {
    this.firebaseService = firebaseService;
    this.registration = null;
    this.isInstalled = false;
    this.isOnline = navigator.onLine;
    this.syncQueue = [];
    this.installPromptEvent = null;

    // Don't auto-initialize to prevent service duplication
    // Call init() manually after construction
  }

  /**
   * Initialize PWA service
   */
  async init() {
    try {
      // Register service worker
      await this.registerServiceWorker();

      // Set up event listeners
      this.setupEventListeners();

      // Check installation status
      this.checkInstallationStatus();

      // Initialize background sync
      this.initializeBackgroundSync();

      // Track PWA initialization
      this.trackPWAEvent("pwa_service_initialized", {
        is_installed: this.isInstalled,
        is_online: this.isOnline,
        has_service_worker: !!this.registration,
      });
    } catch (error) {
      console.error("❌ PWA Service initialization failed:", error);
    }
  }

  /**
   * Register service worker
   */
  async registerServiceWorker() {
    if ("serviceWorker" in navigator) {
      try {
        this.registration = await navigator.serviceWorker.register("./sw.js", {
          scope: "/SimulateAI/",
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
   * Handle service worker updates
   */
  handleServiceWorkerUpdate() {
    const newWorker = this.registration.installing;

    if (newWorker) {
      newWorker.addEventListener("statechange", () => {
        if (
          newWorker.state === "installed" &&
          navigator.serviceWorker.controller
        ) {
          this.showUpdateNotification();
        }
      });
    }
  }

  /**
   * Show update notification to user
   */
  showUpdateNotification() {
    // Custom update notification
    const notification = {
      title: "SimulateAI Update Available",
      message:
        "A new version of SimulateAI is ready. Refresh to get the latest features!",
      actions: [
        {
          text: "Update Now",
          action: () => window.location.reload(),
        },
        {
          text: "Later",
          action: () => {
            // User dismissed the update notification
          },
        },
      ],
    };

    this.showNotification(notification);

    this.trackPWAEvent("update_available_shown", {
      version: "v1.10.0",
      user_choice: "pending",
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

    // Install prompt
    window.addEventListener("beforeinstallprompt", (e) => {
      e.preventDefault();
      this.installPromptEvent = e;
      this.showInstallPrompt();
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
   */
  handleOnlineStatusChange(isOnline) {
    if (isOnline) {
      this.processSyncQueue();
      this.hideOfflineIndicator();
    } else {
      this.showOfflineIndicator();
    }

    this.trackPWAEvent("connectivity_change", {
      is_online: isOnline,
      sync_queue_length: this.syncQueue.length,
    });

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
   * Check if app is installed as PWA
   */
  checkInstallationStatus() {
    // Check if running in standalone mode
    this.isInstalled =
      window.matchMedia("(display-mode: standalone)").matches ||
      window.navigator.standalone === true;

    if (this.isInstalled) {
      document.body.classList.add("pwa-installed");
    }

    return this.isInstalled;
  }

  /**
   * Show install prompt
   */
  showInstallPrompt() {
    // Don't show if already installed
    if (this.isInstalled) return;

    const prompt = {
      title: "📱 Install SimulateAI",
      message:
        "Get the full app experience with offline access and faster loading!",
      actions: [
        {
          text: "Install App",
          action: () => this.triggerInstall(),
        },
        {
          text: "Not Now",
          action: () => {
            /* action removed */
          },
        },
      ],
    };

    this.showNotification(prompt);

    this.trackPWAEvent("install_prompt_shown", {
      prompt_available: !!this.installPromptEvent,
    });
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
   */
  handleAppInstalled() {
    // Remove install prompts
    const installBanner = document.getElementById("pwa-install-banner");
    if (installBanner) {
      installBanner.remove();
    }

    // Add installed class
    document.body.classList.add("pwa-installed");

    this.trackPWAEvent("app_installed", {
      installation_time: Date.now(),
      user_agent: navigator.userAgent,
    });
  }

  /**
   * Initialize background sync for offline actions
   */
  initializeBackgroundSync() {
    // Listen for background sync events from service worker
    if (
      "serviceWorker" in navigator &&
      "sync" in window.ServiceWorkerRegistration.prototype
    ) {
    } else {
      console.warn("⚠️ Background sync not supported, using fallback");
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
   * Generic notification display
   */
  showNotification(notification) {
    // Create notification element
    const notificationEl = document.createElement("div");
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
        `;

    let content = `<div style="font-weight: bold; margin-bottom: 10px;">${notification.title}</div>`;
    content += `<div style="margin-bottom: 15px;">${notification.message}</div>`;

    if (notification.actions) {
      content += "<div>";
      notification.actions.forEach((action) => {
        content += `<button onclick="this.parentElement.parentElement.remove(); (${action.action.toString()})()" 
                           style="margin-right: 10px; padding: 8px 16px; border: none; border-radius: 5px; 
                           background: #667eea; color: white; cursor: pointer;">${action.text}</button>`;
      });
      content += "</div>";
    }

    notificationEl.innerHTML = content;
    document.body.appendChild(notificationEl);

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
   */
  trackPWAEvent(eventName, data = {}) {
    if (this.firebaseService && this.firebaseService.trackStorageEvent) {
      this.firebaseService.trackStorageEvent(`pwa_${eventName}`, {
        ...data,
        timestamp: Date.now(),
        user_agent: navigator.userAgent,
        is_standalone: this.isInstalled,
        is_online: this.isOnline,
      });
    }

    // Also track with Google Analytics if available
    if (typeof gtag !== "undefined") {
      gtag("event", eventName, {
        event_category: "PWA",
        event_label: data.label || eventName,
        custom_parameter_1: this.isInstalled ? "installed" : "browser",
        custom_parameter_2: this.isOnline ? "online" : "offline",
      });
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
}

// Export for use in other modules
export default PWAService;
