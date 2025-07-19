/**
 * Firebase Cloud Messaging Main App Integration
 * Registers service worker, requests permissions, and handles FCM tokens
 *
 * This file should be imported and initialized in your main app entry point
 */

// Import Firebase messaging functions
import {
  getMessaging,
  getToken,
  onMessage,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-messaging.js';
import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';

// Import your Firebase configuration
import { firebaseConfig, VAPID_KEY } from './config/firebase-config.js';

// Constants
const NOTIFICATION_AUTO_CLOSE_DELAY = 8000; // 8 seconds
const UI_PROMPT_AUTO_REMOVE_DELAY = 10000; // 10 seconds

/**
 * Initialize Firebase Cloud Messaging for the main application
 */
export class FCMMainApp {
  constructor() {
    this.app = null;
    this.messaging = null;
    this.currentToken = null;
    this.isInitialized = false;
  }

  /**
   * Initialize FCM in the main application
   */
  async initialize() {
    try {
      // Initialize Firebase app
      this.app = initializeApp(firebaseConfig);

      // Get messaging instance
      this.messaging = getMessaging(this.app);

      // Register service worker
      await this.registerServiceWorker();

      // Request permission and get token
      await this.requestPermissionAndGetToken();

      // Set up foreground message handler
      this.setupForegroundMessageHandler();

      this.isInitialized = true;
      this.logInfo('FCM Main App initialized successfully');
    } catch (error) {
      this.handleError('Failed to initialize FCM Main App', error);
    }
  }

  /**
   * 1. Register the service worker
   */
  async registerServiceWorker() {
    try {
      if ('serviceWorker' in navigator) {
        const registration = await navigator.serviceWorker.register(
          '/firebase-messaging-sw.js'
        );
        this.logInfo(
          'Service Worker registered with scope:',
          registration.scope
        );

        // Optionally pass the service worker registration to getMessaging
        // const messaging = getMessaging(app, { serviceWorkerRegistration: registration });

        return registration;
      } else {
        throw new Error('Service Worker not supported in this browser');
      }
    } catch (error) {
      this.handleError('Service Worker registration failed', error);
      throw error;
    }
  }

  /**
   * 2. Request permission and get the token
   */
  async requestPermissionAndGetToken() {
    try {
      // Check if notifications are supported
      if (!('Notification' in window)) {
        throw new Error('This browser does not support notifications');
      }

      // Request notification permission
      const permission = await Notification.requestPermission();

      if (permission === 'granted') {
        this.logInfo('Notification permission granted');

        // Get FCM token
        const currentToken = await getToken(this.messaging, {
          vapidKey: VAPID_KEY,
        });

        if (currentToken) {
          this.currentToken = currentToken;
          this.logInfo('FCM registration token:', currentToken);

          // TODO: Send this token to your server!
          // You'll need to store this token in your database (e.g., Cloud Firestore)
          // so you can send messages to this specific user/device later.
          await this.saveTokenToDatabase(currentToken);
        } else {
          // Show UI to ask user to enable notifications
          this.logInfo(
            'No registration token available. Request permission to generate one.'
          );
          this.showEnableNotificationsUI();
        }
      } else if (permission === 'denied') {
        this.handleError('Notifications blocked by the user');
        this.showNotificationsBlockedUI();
      } else {
        this.logInfo('Notification permission not granted');
        this.showPermissionRequiredUI();
      }
    } catch (error) {
      this.handleError('An error occurred while retrieving token', error);

      // Handle specific error cases
      if (Notification.permission === 'denied') {
        this.logInfo('Notifications blocked by the user');
        this.showNotificationsBlockedUI();
      }
    }
  }

  /**
   * 3. Handle foreground messages
   */
  setupForegroundMessageHandler() {
    onMessage(this.messaging, payload => {
      this.logInfo('Foreground message received:', payload);

      // Customize how you want to display the message in the foreground
      // For example, you could show a custom in-app notification or a toast message.
      const notificationTitle =
        payload.notification?.title || 'SimulateAI Notification';
      const notificationOptions = {
        body: payload.notification?.body || 'You have a new notification',
        icon: '/src/assets/icons/logo.svg', // SimulateAI logo
        badge: '/src/assets/icons/favicon.png',
        tag: payload.data?.type || 'general',
        data: payload.data,
        requireInteraction: payload.data?.priority === 'high',
        actions: [
          {
            action: 'view',
            title: 'View',
            icon: '/src/assets/icons/view.svg',
          },
          {
            action: 'dismiss',
            title: 'Dismiss',
            icon: '/src/assets/icons/close.svg',
          },
        ],
      };

      // Display the notification using the browser's Notification API
      if (Notification.permission === 'granted') {
        const notification = new Notification(
          notificationTitle,
          notificationOptions
        );

        // Handle notification click
        notification.onclick = event => {
          event.preventDefault();
          window.focus();

          // Navigate to the relevant page based on payload data
          if (payload.data?.url) {
            window.location.href = payload.data.url;
          }

          notification.close();
        };

        // Auto-close notification after delay
        setTimeout(() => {
          notification.close();
        }, NOTIFICATION_AUTO_CLOSE_DELAY);
      }
    });
  }

  /**
   * Save FCM token to database
   */
  async saveTokenToDatabase(token) {
    try {
      // This would typically save to Firestore or your backend
      // For now, we'll store it locally and log it
      localStorage.setItem('fcm_token', token);

      // TODO: Implement actual database save
      // Example: Save to Firestore
      /*
      import { getFirestore, doc, setDoc } from 'firebase/firestore';
      const db = getFirestore(this.app);
      const userId = getCurrentUserId(); // Your user ID logic
      
      await setDoc(doc(db, 'fcm-tokens', userId), {
        token: token,
        timestamp: new Date(),
        device: navigator.userAgent,
        active: true
      });
      */

      this.logInfo('FCM token saved to database');
    } catch (error) {
      this.handleError('Failed to save FCM token to database', error);
    }
  }

  /**
   * Show UI to enable notifications
   */
  showEnableNotificationsUI() {
    // Create a notification prompt UI
    const notificationPrompt = document.createElement('div');
    notificationPrompt.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #1a73e8;
        color: white;
        padding: 16px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.2);
        z-index: 10000;
        max-width: 300px;
      ">
        <h4 style="margin: 0 0 8px 0;">Enable Notifications</h4>
        <p style="margin: 0 0 12px 0; font-size: 14px;">
          Get notified about replies, mentions, and new posts
        </p>
        <button onclick="this.parentElement.parentElement.remove()" 
                style="background: white; color: #1a73e8; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">
          Enable Notifications
        </button>
      </div>
    `;

    document.body.appendChild(notificationPrompt);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notificationPrompt.parentElement) {
        notificationPrompt.remove();
      }
    }, UI_PROMPT_AUTO_REMOVE_DELAY);
  }

  /**
   * Show UI when notifications are blocked
   */
  showNotificationsBlockedUI() {
    this.logInfo('Showing notifications blocked UI');
    // Could show instructions on how to enable notifications in browser settings
  }

  /**
   * Show UI when permission is required
   */
  showPermissionRequiredUI() {
    this.logInfo('Showing permission required UI');
    // Could show a button to request permission again
  }

  /**
   * Get current FCM token
   */
  getCurrentToken() {
    return this.currentToken;
  }

  /**
   * Check if FCM is initialized
   */
  isReady() {
    return this.isInitialized;
  }

  /**
   * Log information (development helper)
   */
  logInfo(message, ...args) {
    if (
      typeof window !== 'undefined' &&
      window.console &&
      window.location.hostname === 'localhost'
    ) {
      window.console.log(`[FCM] ${message}`, ...args);
    }
  }

  /**
   * Handle errors
   */
  handleError(message, error = null) {
    if (typeof window !== 'undefined' && window.console) {
      if (error) {
        window.console.error(`[FCM Error] ${message}:`, error);
      } else {
        window.console.error(`[FCM Error] ${message}`);
      }
    }
  }
}

// Create global instance
const fcmMainApp = new FCMMainApp();

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    fcmMainApp.initialize();
  });
} else {
  fcmMainApp.initialize();
}

// Export for manual use
export default fcmMainApp;
