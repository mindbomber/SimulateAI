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
 * Firebase Cloud Messaging Service
 * Handles push notifications for SimulateAI
 * Supports reply notifications, mentions, and new content alerts
 */

// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyAwoc3L-43aXyNjNB9ncGbFm7eE-yn5bFA",
  authDomain: "simulateai-research.firebaseapp.com",
  projectId: "simulateai-research",
  storageBucket: "simulateai-research.firebasestorage.app",
  messagingSenderId: "52924445915", // Crucial for FCM!
  appId: "1:52924445915:web:dadca1a93bc382403a08fe",
  measurementId: "G-XW8H062BMV",
};

// Import the functions you need from the SDKs you want to use - Using local npm package instead of CDN
import { initializeApp } from "firebase/app";
import {
  getMessaging,
  getToken,
  onMessage,
  isSupported,
} from "firebase/messaging";
import {
  getFirestore,
  doc,
  updateDoc,
  setDoc,
  collection,
  addDoc,
} from "firebase/firestore";

// Configuration constants
const NOTIFICATION_CONFIG = {
  VAPID_KEY:
    "BHxifT5EzYByOc7gGI_Iq_W-DHTs4kM823Z38-942vfdX59LZW_0rdwXT6rzNeKC6knJkIJdLvDg0LTavQESnsc", // Your actual VAPID key
  TOKEN_COLLECTION: "fcm-tokens",
  NOTIFICATION_COLLECTION: "notifications",
  SUBSCRIPTION_COLLECTION: "notification-subscriptions",
  AUTO_HIDE_DELAY: 5000,
};

// Standalone initialization functions for direct Firebase usage
// Initialize Firebase app and messaging service instance
let globalApp = null;
let globalMessaging = null;

export function initializeFirebaseMessaging() {
  try {
    // Initialize Firebase app if not already done
    if (!globalApp) {
      globalApp = initializeApp(firebaseConfig);
    }

    // Get the messaging service instance
    globalMessaging = getMessaging(globalApp);

    return { app: globalApp, messaging: globalMessaging };
  } catch (error) {
    // Log error for debugging
    if (typeof window !== "undefined" && window.console) {
      window.console.error("Failed to initialize Firebase Messaging:", error);
    }
    throw error;
  }
}

// Get FCM token for current device
export async function getFCMToken(vapidKey = NOTIFICATION_CONFIG.VAPID_KEY) {
  try {
    if (!globalMessaging) {
      initializeFirebaseMessaging();
    }

    const token = await getToken(globalMessaging, { vapidKey });
    return token;
  } catch (error) {
    // Log error for debugging
    if (typeof window !== "undefined" && window.console) {
      window.console.error("Error getting FCM token:", error);
    }
    throw error;
  }
}

// Set up foreground message listener
export function onForegroundMessage(callback) {
  if (!globalMessaging) {
    initializeFirebaseMessaging();
  }

  return onMessage(globalMessaging, callback);
}

class MessagingService {
  constructor(firebaseApp = null) {
    // Initialize Firebase if no app instance provided
    if (!firebaseApp) {
      this.app = initializeApp(firebaseConfig);
    } else {
      this.app = firebaseApp;
    }

    this.messaging = null;
    this.db = getFirestore(this.app);
    this.currentToken = null;
    this.isSupported = false;
    this.currentUser = null;

    // Don't auto-initialize to prevent service duplication
    // Call init() manually after construction
  }

  async init() {
    try {
      // Check if messaging is supported in this browser/environment
      const messagingSupported = await isSupported();
      this.isSupported =
        messagingSupported &&
        "serviceWorker" in navigator &&
        "Notification" in window;

      if (!this.isSupported) {
        this.logInfo(
          "Firebase Messaging not supported in this environment - skipping initialization",
        );
        return;
      }

      // Initialize messaging
      this.messaging = getMessaging(this.app);

      // Register service worker
      await this.registerServiceWorker();

      // Set up foreground message handler
      this.setupForegroundMessageHandler();

      // Log successful initialization in development
      this.logInfo("Firebase Messaging initialized");
    } catch (error) {
      this.handleError("Error initializing Firebase Messaging", error);
    }
  }

  async registerServiceWorker() {
    try {
      if ("serviceWorker" in navigator) {
        const registration = await navigator.serviceWorker.register(
          "/firebase-messaging-sw.js",
        );
        this.logInfo("Service Worker registered", registration);
        return registration;
      }
      return null;
    } catch (error) {
      this.handleError("Service Worker registration failed", error);
      throw error;
    }
  }

  async requestPermission() {
    try {
      const permission = await Notification.requestPermission();

      if (permission === "granted") {
        this.logInfo("Notification permission granted");
        return true;
      } else {
        this.logInfo("Notification permission denied");
        return false;
      }
    } catch (error) {
      this.handleError("Error requesting notification permission", error);
      return false;
    }
  }

  async getRegistrationToken(userId) {
    try {
      if (!this.messaging) {
        throw new Error("Messaging not initialized");
      }

      // Request permission first
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        throw new Error("Notification permission not granted");
      }

      // Get registration token
      const token = await getToken(this.messaging, {
        vapidKey: NOTIFICATION_CONFIG.VAPID_KEY,
      });

      if (token) {
        this.logInfo("FCM Registration token", token);
        this.currentToken = token;

        // Store token in Firestore
        if (userId) {
          await this.storeToken(userId, token);
        }

        return token;
      } else {
        this.logInfo("No registration token available");
        return null;
      }
    } catch (error) {
      this.handleError("Error getting registration token", error);
      throw error;
    }
  }

  async storeToken(userId, token) {
    try {
      const tokenDoc = doc(
        this.db,
        NOTIFICATION_CONFIG.TOKEN_COLLECTION,
        userId,
      );

      await setDoc(
        tokenDoc,
        {
          token,
          userId,
          createdAt: new Date(),
          updatedAt: new Date(),
          platform: this.getPlatform(),
          userAgent: navigator.userAgent,
          isActive: true,
        },
        { merge: true },
      );

      this.logInfo("FCM token stored for user", userId);
    } catch (error) {
      this.handleError("Error storing FCM token", error);
      throw error;
    }
  }

  setupForegroundMessageHandler() {
    if (!this.messaging) return;

    onMessage(this.messaging, (payload) => {
      this.logInfo("Foreground message received", payload);

      const { notification, data } = payload;

      // Show notification when app is in foreground
      this.showForegroundNotification(notification, data);

      // Handle specific notification types
      this.handleNotificationData(data);
    });
  }

  showForegroundNotification(notification, data) {
    // Create custom notification UI for foreground
    const notificationElement = this.createNotificationElement(
      notification,
      data,
    );

    // Add to notification container
    const container =
      document.getElementById("notification-container") ||
      this.createNotificationContainer();
    container.appendChild(notificationElement);

    // Auto-remove after delay
    setTimeout(() => {
      if (notificationElement.parentNode) {
        notificationElement.remove();
      }
    }, NOTIFICATION_CONFIG.AUTO_HIDE_DELAY);
  }

  // Error handling and logging methods
  handleError(message, error = null) {
    // In production, send to logging service
    // Use location check instead of process.env which is not available in browser
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isDevelopment) {
      // eslint-disable-next-line no-console
      console.error(`${message}${error ? ":" : ""}`, error || "");
    }
  }

  logInfo(message, data = null) {
    // In production, send to analytics
    // Use location check instead of process.env which is not available in browser
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";
    if (isDevelopment) {
      // eslint-disable-next-line no-console
    }
  }

  createNotificationContainer() {
    const container = document.createElement("div");
    container.id = "notification-container";
    container.className = "fcm-notification-container";
    container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            z-index: 10000;
            max-width: 400px;
        `;
    document.body.appendChild(container);
    return container;
  }

  createNotificationElement(notification, data) {
    const element = document.createElement("div");
    element.className = "fcm-notification";
    element.style.cssText = `
            background: white;
            border: 1px solid #ddd;
            border-radius: 8px;
            padding: 16px;
            margin-bottom: 10px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.1);
            cursor: pointer;
            transition: all 0.3s ease;
        `;

    element.innerHTML = `
            <div class="fcm-notification-header">
                <img src="${notification.icon || "/src/assets/icons/logo.svg"}" 
                     alt="Icon" 
                     style="width: 24px; height: 24px; margin-right: 12px; float: left;">
                <h4 style="margin: 0; font-size: 16px; color: #333;">${notification.title}</h4>
            </div>
            <div class="fcm-notification-body" style="margin-top: 8px;">
                <p style="margin: 0; color: #666; font-size: 14px;">${notification.body}</p>
            </div>
            <div class="fcm-notification-actions" style="margin-top: 12px; text-align: right;">
                <button class="dismiss-btn" style="margin-right: 8px; padding: 4px 12px; border: 1px solid #ddd; background: white; border-radius: 4px; cursor: pointer;">Dismiss</button>
                <button class="view-btn" style="padding: 4px 12px; border: none; background: #1a73e8; color: white; border-radius: 4px; cursor: pointer;">View</button>
            </div>
        `;

    // Add click handlers
    element.querySelector(".dismiss-btn").onclick = (e) => {
      e.stopPropagation();
      element.remove();
    };

    element.querySelector(".view-btn").onclick = (e) => {
      e.stopPropagation();
      this.handleNotificationClick(data);
      element.remove();
    };

    element.onclick = () => {
      this.handleNotificationClick(data);
      element.remove();
    };

    return element;
  }

  handleNotificationData(data) {
    if (!data) return;

    switch (data.type) {
      case "reply":
        this.handleReplyNotification(data);
        break;
      case "mention":
        this.handleMentionNotification(data);
        break;
      case "new-post":
        this.handleNewPostNotification(data);
        break;
      case "thread-update":
        this.handleThreadUpdateNotification(data);
        break;
      default:
        this.logInfo("Unknown notification type", data.type);
    }
  }

  handleNotificationClick(data) {
    if (data.url) {
      window.open(data.url, "_blank");
    } else if (data.threadId) {
      window.location.href = `/forum.html#thread=${data.threadId}`;
    } else if (data.postId) {
      window.location.href = `/blog.html#post=${data.postId}`;
    }
  }

  handleReplyNotification(data) {
    // Handle reply notifications
    this.logInfo("Reply notification", data);

    // Update UI if forum is open
    if (window.forumIntegration && data.threadId) {
      window.forumIntegration.handleNewReply(data.threadId, data.messageId);
    }
  }

  handleMentionNotification(data) {
    // Handle mention notifications
    this.logInfo("Mention notification", data);

    // Highlight mention if visible
    if (data.messageId) {
      const messageElement = document.querySelector(
        `[data-message-id="${data.messageId}"]`,
      );
      if (messageElement) {
        messageElement.classList.add("mentioned");
      }
    }
  }

  handleNewPostNotification(data) {
    // Handle new blog post notifications
    this.logInfo("New post notification", data);

    // Update blog list if visible
    if (window.blogService && data.postId) {
      window.blogService.handleNewPost(data.postId);
    }
  }

  handleThreadUpdateNotification(data) {
    // Handle thread update notifications
    this.logInfo("Thread update notification", data);

    // Update thread list if visible
    if (window.forumIntegration && data.threadId) {
      window.forumIntegration.handleThreadUpdate(data.threadId);
    }
  }

  // Subscription management
  async subscribeToThread(threadId, userId) {
    try {
      const subscriptionDoc = doc(
        this.db,
        NOTIFICATION_CONFIG.SUBSCRIPTION_COLLECTION,
        `${userId}_thread_${threadId}`,
      );

      await setDoc(subscriptionDoc, {
        userId,
        type: "thread",
        targetId: threadId,
        createdAt: new Date(),
        isActive: true,
        preferences: {
          replies: true,
          mentions: true,
          updates: true,
        },
      });

      this.logInfo("Subscribed to thread notifications", threadId);
    } catch (error) {
      this.handleError("Error subscribing to thread", error);
      throw error;
    }
  }

  async subscribeToNewPosts(userId) {
    try {
      const subscriptionDoc = doc(
        this.db,
        NOTIFICATION_CONFIG.SUBSCRIPTION_COLLECTION,
        `${userId}_new_posts`,
      );

      await setDoc(subscriptionDoc, {
        userId,
        type: "new-posts",
        targetId: "all",
        createdAt: new Date(),
        isActive: true,
        preferences: {
          immediate: false,
          daily: true,
          weekly: false,
        },
      });

      this.logInfo("Subscribed to new post notifications");
    } catch (error) {
      this.handleError("Error subscribing to new posts", error);
      throw error;
    }
  }

  async unsubscribeFromThread(threadId, userId) {
    try {
      const subscriptionDoc = doc(
        this.db,
        NOTIFICATION_CONFIG.SUBSCRIPTION_COLLECTION,
        `${userId}_thread_${threadId}`,
      );

      await updateDoc(subscriptionDoc, {
        isActive: false,
        unsubscribedAt: new Date(),
      });

      this.logInfo("Unsubscribed from thread notifications", threadId);
    } catch (error) {
      this.handleError("Error unsubscribing from thread", error);
      throw error;
    }
  }

  // Send notification (for testing - normally done by Cloud Functions)
  async sendTestNotification(userId, notification) {
    try {
      const notificationDoc = collection(
        this.db,
        NOTIFICATION_CONFIG.NOTIFICATION_COLLECTION,
      );

      await addDoc(notificationDoc, {
        userId,
        title: notification.title,
        body: notification.body,
        type: notification.type || "test",
        data: notification.data || {},
        createdAt: new Date(),
        sent: false,
        read: false,
      });

      this.logInfo("Test notification queued");
    } catch (error) {
      this.handleError("Error sending test notification", error);
      throw error;
    }
  }

  // Utility methods
  getPlatform() {
    const { userAgent } = navigator;
    if (userAgent.includes("Mobile")) return "mobile";
    if (userAgent.includes("Tablet")) return "tablet";
    return "desktop";
  }

  isNotificationSupported() {
    return this.isSupported;
  }

  getCurrentToken() {
    return this.currentToken;
  }

  async refreshToken(userId) {
    try {
      if (this.currentToken) {
        // Mark old token as inactive
        await this.markTokenInactive(userId, this.currentToken);
      }

      // Get new token
      const newToken = await this.getRegistrationToken(userId);
      return newToken;
    } catch (error) {
      this.handleError("Error refreshing token", error);
      throw error;
    }
  }

  async markTokenInactive(userId, _token) {
    try {
      const tokenDoc = doc(
        this.db,
        NOTIFICATION_CONFIG.TOKEN_COLLECTION,
        userId,
      );
      await updateDoc(tokenDoc, {
        isActive: false,
        deactivatedAt: new Date(),
      });
    } catch (error) {
      this.handleError("Error marking token inactive", error);
    }
  }

  // Cleanup
  cleanup() {
    // Clean up any listeners or intervals
    if (this.messaging) {
      // No specific cleanup needed for messaging
    }
  }
}

export { MessagingService };
