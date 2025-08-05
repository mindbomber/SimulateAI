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
 * Firebase App Check Configuration for SimulateAI
 * Provides enhanced security for Firebase services using reCAPTCHA v3
 * Fixed version to prevent initialization loops
 */

import logger from "../utils/logger.js";

// App Check configuration constants
export const APP_CHECK_CONFIG = {
  // reCAPTCHA Enterprise site key for SimulateAI
  RECAPTCHA_SITE_KEY:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
      ? "6LeIxAcTAAAAAJcZVRqyHh71UMIEGNQ_MXjiZKhI" // Test key for localhost
      : "6LcuUpsrAAAAAEzAeX1qx0cjShEt7Nf0f73rvLjf", // Production Enterprise key

  // Auto-refresh tokens - DISABLED to prevent loops
  AUTO_REFRESH_ENABLED: false,

  // Debug mode for development (should be false in production)
  DEBUG_MODE:
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1",

  // Token refresh interval (in milliseconds)
  TOKEN_REFRESH_INTERVAL: (() => {
    const SECONDS_PER_MINUTE = 60;
    const MS_PER_SECOND = 1000;
    const REFRESH_MINUTES = 30;
    return REFRESH_MINUTES * SECONDS_PER_MINUTE * MS_PER_SECOND;
  })(),

  // Display constants
  SITE_KEY_DISPLAY_LENGTH: 20,

  // App Check actions that align with reCAPTCHA actions
  ACTIONS: {
    SUBMIT_FORM: "submit_form",
    CONTACT_FORM: "contact_form",
    RESEARCH_CONSENT: "research_consent",
    FEEDBACK_FORM: "feedback_form",
    AUTH_LOGIN: "auth_login",
    AUTH_SIGNUP: "auth_signup",
    SCENARIO_SUBMIT: "scenario_submit",
    EMAIL_SUBSCRIBE: "email_subscribe",
    DATABASE_READ: "database_read",
    DATABASE_WRITE: "database_write",
    ANALYTICS_WRITE: "analytics_write",
    STORAGE_UPLOAD: "storage_upload",
  },
};

/**
 * App Check Service
 * Manages Firebase App Check integration with reCAPTCHA v3
 */
export class AppCheckService {
  constructor() {
    this.appCheck = null;
    this.isReady = false;
    this.tokenCache = new Map();
    this.lastTokenRefresh = null;
    this.isInitializing = false;
    this.initializationPromise = null;
    this.initialized = false;
  }

  /**
   * Initialize App Check with reCAPTCHA v3 provider
   * @param {FirebaseApp} app - Firebase app instance
   * @returns {Promise<boolean>} Success status
   */
  async initialize(app) {
    // Prevent multiple initializations
    if (this.initialized) {
      logger.info("🛡️ App Check already initialized, skipping");
      return true;
    }

    if (this.isInitializing) {
      logger.info("🛡️ App Check initialization in progress, waiting...");
      return this.initializationPromise;
    }

    this.isInitializing = true;
    this.initializationPromise = this._performInitialization(app);

    try {
      const result = await this.initializationPromise;
      this.initialized = true;
      return result;
    } catch (error) {
      this.isInitializing = false;
      this.initializationPromise = null;
      throw error;
    }
  }

  /**
   * Perform the actual initialization
   * @param {FirebaseApp} app - Firebase app instance
   * @returns {Promise<boolean>} Success status
   */
  async _performInitialization(app) {
    try {
      // For development, skip App Check to avoid ReCAPTCHA issues
      if (APP_CHECK_CONFIG.DEBUG_MODE) {
        logger.warn(
          "🛡️ App Check disabled in development mode to prevent ReCAPTCHA loops",
        );
        this.isReady = false;
        this.isInitializing = false;
        return true; // Allow app to continue without App Check
      }

      const { initializeAppCheck, ReCaptchaV3Provider } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js"
      );

      // Configure App Check for production only
      try {
        this.appCheck = initializeAppCheck(app, {
          provider: new ReCaptchaV3Provider(
            APP_CHECK_CONFIG.RECAPTCHA_SITE_KEY,
          ),
          isTokenAutoRefreshEnabled: APP_CHECK_CONFIG.AUTO_REFRESH_ENABLED,
        });

        this.isReady = true;
        this.isInitializing = false;
        this.lastTokenRefresh = Date.now();

        logger.info("🛡️ Firebase App Check initialized successfully");
        return true;
      } catch (appCheckError) {
        logger.warn(
          "⚠️ App Check initialization failed, continuing without App Check:",
          appCheckError.message,
        );
        // Continue without App Check - Firebase will work but with reduced security
        this.isReady = false;
        this.isInitializing = false;
        return true; // Return true to allow app to continue
      }
    } catch (error) {
      logger.error("❌ App Check initialization failed:", error);
      this.isInitializing = false;
      return false;
    }
  }

  /**
   * Get App Check token for validation
   * @param {boolean} forceRefresh - Force token refresh
   * @returns {Promise<string>} App Check token
   */
  async getToken(forceRefresh = false) {
    try {
      if (!this.isReady) {
        logger.warn("⚠️ App Check not ready, skipping token generation");
        return null;
      }

      const cacheKey = "appcheck_token";
      const now = Date.now();

      // Check if we have a cached token and it's still fresh
      if (!forceRefresh && this.tokenCache.has(cacheKey)) {
        const cached = this.tokenCache.get(cacheKey);
        if (now - cached.timestamp < APP_CHECK_CONFIG.TOKEN_REFRESH_INTERVAL) {
          return cached.token;
        }
      }

      const { getToken } = await import(
        "https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js"
      );
      const tokenResponse = await getToken(this.appCheck, forceRefresh);

      // Cache the token
      this.tokenCache.set(cacheKey, {
        token: tokenResponse.token,
        timestamp: now,
      });

      this.lastTokenRefresh = now;
      return tokenResponse.token;
    } catch (error) {
      logger.error("❌ Failed to get App Check token:", error);
      return null; // Return null instead of throwing to prevent app crashes
    }
  }

  /**
   * Validate App Check status
   * @returns {boolean} True if App Check is working
   */
  validateStatus() {
    try {
      return this.isReady && this.appCheck !== null;
    } catch (error) {
      logger.warn("⚠️ App Check validation failed:", error);
      return false;
    }
  }

  /**
   * Get App Check metrics for monitoring
   * @returns {object} App Check status and metrics
   */
  getMetrics() {
    return {
      initialized: this.initialized,
      isReady: this.isReady,
      lastTokenRefresh: this.lastTokenRefresh,
      cachedTokens: this.tokenCache.size,
      debugMode: APP_CHECK_CONFIG.DEBUG_MODE,
      autoRefreshEnabled: APP_CHECK_CONFIG.AUTO_REFRESH_ENABLED,
      siteKey: `${APP_CHECK_CONFIG.RECAPTCHA_SITE_KEY.substring(0, APP_CHECK_CONFIG.SITE_KEY_DISPLAY_LENGTH)}...`,
      uptime: this.lastTokenRefresh ? Date.now() - this.lastTokenRefresh : 0,
    };
  }

  /**
   * Clear token cache (useful for testing)
   */
  clearTokenCache() {
    this.tokenCache.clear();
    logger.info("🧹 App Check token cache cleared");
  }

  /**
   * Set custom action for App Check validation
   * @param {string} action - Action name from APP_CHECK_CONFIG.ACTIONS
   * @returns {Promise<string>} Token for the specific action
   */
  async getTokenForAction(action) {
    try {
      // Validate action
      const validActions = Object.values(APP_CHECK_CONFIG.ACTIONS);
      if (!validActions.includes(action)) {
        logger.warn(`⚠️ Unknown App Check action: ${action}`);
      }

      // Get token with action context
      const token = await this.getToken();

      // Log action for monitoring (in debug mode)
      if (APP_CHECK_CONFIG.DEBUG_MODE && token) {
        logger.debug(`🎯 App Check token generated for action: ${action}`);
      }

      return token;
    } catch (error) {
      logger.error(
        `❌ Failed to get App Check token for action ${action}:`,
        error,
      );
      return null; // Return null instead of throwing
    }
  }
}

// Create singleton instance
const appCheckService = new AppCheckService();

// Export singleton and configuration
export default appCheckService;
