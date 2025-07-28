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
 * Notification Service
 * Centralized notification system that respects user settings
 * Integrates with Firebase Cloud Messaging and browser notifications
 */

// Constants
const NOTIFICATION_AUTO_CLOSE_DELAY = 5000; // Auto-close delay for notifications
const TOAST_DURATION = 5000; // Duration for toast notifications

class NotificationService {
  constructor() {
    this.settings = null;
    this.fcm = null;
    this.toastService = null;
    this.isInitialized = false;
    this.init();
  }

  async init() {
    // Wait for settings manager to be ready
    if (window.settingsManager) {
      this.settings = window.settingsManager;
    } else {
      // Wait for settings manager
      window.addEventListener("settingsManagerReady", (event) => {
        this.settings = event.detail.settings;
        this.initializeServices();
      });
    }

    // Initialize toast service
    if (window.NotificationToast) {
      this.toastService = window.NotificationToast;
    }

    this.isInitialized = true;
  }

  async initializeServices() {
    // Initialize FCM if notifications are enabled
    const notificationSettings = this.getNotificationSettings();
    if (notificationSettings.enabled) {
      await this.initializeFCM();
    }
  }

  async initializeFCM() {
    try {
      if (window.fcmMainApp) {
        this.fcm = window.fcmMainApp;
        if (!this.fcm.isReady()) {
          await this.fcm.initialize();
        }
      } else {
        // Dynamically import FCM
        const { default: fcmMainApp } = await import("../fcm-main-app.js");
        this.fcm = fcmMainApp;
        await this.fcm.initialize();
      }
    } catch (error) {
      // FCM initialization failed - continue with basic notifications
    }
  }

  /**
   * Get notification settings from settings manager
   */
  getNotificationSettings() {
    if (this.settings && this.settings.getNotificationSettings) {
      return this.settings.getNotificationSettings();
    }

    // Fallback to checking permission directly
    return {
      enabled: false,
      achievements: true,
      badges: true,
      progress: true,
      permission: Notification.permission,
    };
  }

  /**
   * Send achievement notification
   */
  sendAchievementNotification(title, message, options = {}) {
    const settings = this.getNotificationSettings();

    if (!settings.enabled || !settings.achievements) {
      return;
    }

    this.sendNotification({
      type: "achievement",
      title,
      message,
      ...options,
    });
  }

  /**
   * Send badge notification
   */
  sendBadgeNotification(badge, options = {}) {
    const settings = this.getNotificationSettings();

    if (!settings.enabled || !settings.badges) {
      return;
    }

    this.sendNotification({
      type: "badge",
      title: `🏆 Badge Earned: ${badge.title}`,
      message: badge.description || `You've earned the ${badge.title} badge!`,
      icon: badge.icon || "/favicon.ico",
      ...options,
    });
  }

  /**
   * Send progress notification
   */
  sendProgressNotification(title, message, options = {}) {
    const settings = this.getNotificationSettings();

    if (!settings.enabled || !settings.progress) {
      return;
    }

    this.sendNotification({
      type: "progress",
      title,
      message,
      ...options,
    });
  }

  /**
   * Send general notification
   */
  sendNotification(notificationData) {
    const settings = this.getNotificationSettings();

    if (!settings.enabled || settings.permission !== "granted") {
      // Show as toast instead
      this.showToast(notificationData);
      return;
    }

    const {
      type = "info",
      title,
      message,
      icon = "/favicon.ico",
      badge = "/favicon.ico",
      tag,
      data = {},
    } = notificationData;

    try {
      const notification = new Notification(title, {
        body: message,
        icon,
        badge,
        tag: tag || `simulateai-${type}`,
        data: {
          ...data,
          type,
          timestamp: Date.now(),
        },
      });

      // Auto-close after delay
      setTimeout(() => {
        notification.close();
      }, NOTIFICATION_AUTO_CLOSE_DELAY);

      // Handle click
      notification.onclick = () => {
        window.focus();
        notification.close();

        // Handle specific notification actions
        this.handleNotificationClick(notificationData);
      };
    } catch (error) {
      // Fallback to toast
      this.showToast(notificationData);
    }
  }

  /**
   * Show toast notification as fallback
   */
  showToast(notificationData) {
    if (!this.toastService) {
      return;
    }

    const { type = "info", title, message } = notificationData;

    // Prevent duplicate toasts by checking if one was recently shown with same content
    const toastKey = `${title}-${message}`;
    const now = Date.now();

    if (this.recentToasts && this.recentToasts.has(toastKey)) {
      const lastShown = this.recentToasts.get(toastKey);
      if (now - lastShown < 2000) {
        // Within 2 seconds
        console.log(
          "[NotificationService] Preventing duplicate toast:",
          toastKey,
        );
        return;
      }
    }

    // Track this toast to prevent duplicates
    if (!this.recentToasts) {
      this.recentToasts = new Map();
    }
    this.recentToasts.set(toastKey, now);

    // Clean up old entries periodically
    if (this.recentToasts.size > 20) {
      const cutoff = now - 10000; // 10 seconds ago
      for (const [key, timestamp] of this.recentToasts.entries()) {
        if (timestamp < cutoff) {
          this.recentToasts.delete(key);
        }
      }
    }

    this.toastService.show({
      type: this.mapNotificationTypeToToast(type),
      title,
      message,
      duration: TOAST_DURATION,
      closable: true,
    });
  }

  /**
   * Map notification types to toast types
   */
  mapNotificationTypeToToast(notificationType) {
    const typeMap = {
      achievement: "success",
      badge: "success",
      progress: "info",
      error: "error",
      warning: "warning",
    };

    return typeMap[notificationType] || "info";
  }

  /**
   * Handle notification click events
   */
  handleNotificationClick(notificationData) {
    const { type, data = {} } = notificationData;

    switch (type) {
      case "achievement":
        // Navigate to achievements page or show details
        if (data.achievementId) {
          this.navigateToAchievement(data.achievementId);
        }
        break;

      case "badge":
        // Show badge details or navigate to badges page
        if (data.badgeId) {
          this.showBadgeDetails(data.badgeId);
        }
        break;

      case "progress":
        // Navigate to progress page or specific category
        if (data.categoryId) {
          this.navigateToCategory(data.categoryId);
        }
        break;

      default:
        // Default action - just focus the window
        break;
    }
  }

  /**
   * Navigate to achievement page
   */
  navigateToAchievement(achievementId) {
    // Implement navigation to achievement details
    window.location.href = `app.html#achievement=${achievementId}`;
  }

  /**
   * Show badge details
   */
  showBadgeDetails(badgeId) {
    // Implement badge details display
    if (window.badgeModal && window.badgeModal.showBadgeDetails) {
      window.badgeModal.showBadgeDetails(badgeId);
    }
  }

  /**
   * Navigate to category
   */
  navigateToCategory(categoryId) {
    window.location.href = `app.html?category=${categoryId}`;
  }

  /**
   * Test notification system
   */
  sendTestNotification() {
    this.sendNotification({
      type: "info",
      title: "SimulateAI Notifications",
      message: "Your notification system is working correctly!",
      data: {
        test: true,
      },
    });
  }

  /**
   * Check if notifications are supported and enabled
   */
  isNotificationSupported() {
    return "Notification" in window;
  }

  /**
   * Check robustness of the notification system
   */
  async checkSystemRobustness() {
    const report = {
      browserSupport: this.isNotificationSupported(),
      permission: Notification.permission,
      settings: this.getNotificationSettings(),
      fcmInitialized: this.fcm && this.fcm.isReady(),
      toastFallback: !!this.toastService,
      timestamp: new Date().toISOString(),
    };

    // Test FCM token retrieval
    if (this.fcm) {
      try {
        report.fcmToken = await this.fcm.getCurrentToken();
        report.fcmStatus = "working";
      } catch (error) {
        report.fcmStatus = "error";
        report.fcmError = error.message;
      }
    }

    // Test browser notification
    if (report.permission === "granted") {
      try {
        const testNotification = new Notification("Test", {
          body: "Testing notification system",
          tag: "robustness-test",
        });
        setTimeout(() => testNotification.close(), 1000);
        report.browserNotificationTest = "passed";
      } catch (error) {
        report.browserNotificationTest = "failed";
        report.browserNotificationError = error.message;
      }
    }

    return report;
  }
}

// Create global instance
const notificationService = new NotificationService();

// Export for use by other modules
export default notificationService;

// Make available globally
window.notificationService = notificationService;
