/**
 * Firebase App Check Configuration for SimulateAI
 * Provides enhanced security for Firebase services using reCAPTCHA v3
 */

// App Check configuration constants
export const APP_CHECK_CONFIG = {
  // reCAPTCHA v3 site key for SimulateAI
  RECAPTCHA_SITE_KEY: '6LfizIQrAAAAAETdjKY14uI3ckhF-JeUujcloH53',

  // Auto-refresh tokens for better user experience
  AUTO_REFRESH_ENABLED: true,

  // Debug mode for development (should be false in production)
  DEBUG_MODE:
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1',

  // Token refresh interval (in milliseconds)
  TOKEN_REFRESH_INTERVAL: 30 * 60 * 1000, // 30 minutes

  // App Check actions that align with reCAPTCHA actions
  ACTIONS: {
    SUBMIT_FORM: 'submit_form',
    CONTACT_FORM: 'contact_form',
    RESEARCH_CONSENT: 'research_consent',
    FEEDBACK_FORM: 'feedback_form',
    AUTH_LOGIN: 'auth_login',
    AUTH_SIGNUP: 'auth_signup',
    SCENARIO_SUBMIT: 'scenario_submit',
    EMAIL_SUBSCRIBE: 'email_subscribe',
    DATABASE_READ: 'database_read',
    DATABASE_WRITE: 'database_write',
    ANALYTICS_WRITE: 'analytics_write',
    STORAGE_UPLOAD: 'storage_upload',
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
  }

  /**
   * Initialize App Check with reCAPTCHA v3 provider
   * @param {FirebaseApp} app - Firebase app instance
   * @returns {Promise<boolean>} Success status
   */
  async initialize(app) {
    try {
      const { initializeAppCheck, ReCaptchaV3Provider } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js'
      );

      // Configure debug token for development
      if (APP_CHECK_CONFIG.DEBUG_MODE) {
        // Set debug token for local development
        const { setLogLevel } = await import(
          'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js'
        );
        setLogLevel('debug');
      }

      this.appCheck = initializeAppCheck(app, {
        provider: new ReCaptchaV3Provider(APP_CHECK_CONFIG.RECAPTCHA_SITE_KEY),
        isTokenAutoRefreshEnabled: APP_CHECK_CONFIG.AUTO_REFRESH_ENABLED,
      });

      this.isReady = true;
      this.lastTokenRefresh = Date.now();

      console.log('🛡️ Firebase App Check initialized successfully');
      return true;
    } catch (error) {
      console.error('❌ App Check initialization failed:', error);
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
        throw new Error('App Check not initialized');
      }

      const cacheKey = 'appcheck_token';
      const now = Date.now();

      // Check if we have a cached token and it's still fresh
      if (!forceRefresh && this.tokenCache.has(cacheKey)) {
        const cached = this.tokenCache.get(cacheKey);
        if (now - cached.timestamp < APP_CHECK_CONFIG.TOKEN_REFRESH_INTERVAL) {
          return cached.token;
        }
      }

      const { getToken } = await import(
        'https://www.gstatic.com/firebasejs/10.7.1/firebase-app-check.js'
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
      console.error('❌ Failed to get App Check token:', error);
      throw error;
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
      console.warn('⚠️ App Check validation failed:', error);
      return false;
    }
  }

  /**
   * Get App Check metrics for monitoring
   * @returns {object} App Check status and metrics
   */
  getMetrics() {
    return {
      isReady: this.isReady,
      lastTokenRefresh: this.lastTokenRefresh,
      cachedTokens: this.tokenCache.size,
      debugMode: APP_CHECK_CONFIG.DEBUG_MODE,
      autoRefreshEnabled: APP_CHECK_CONFIG.AUTO_REFRESH_ENABLED,
      siteKey: `${APP_CHECK_CONFIG.RECAPTCHA_SITE_KEY.substring(0, 20)}...`,
      uptime: this.lastTokenRefresh ? Date.now() - this.lastTokenRefresh : 0,
    };
  }

  /**
   * Clear token cache (useful for testing)
   */
  clearTokenCache() {
    this.tokenCache.clear();
    console.log('🧹 App Check token cache cleared');
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
        console.warn(`⚠️ Unknown App Check action: ${action}`);
      }

      // Get token with action context
      const token = await this.getToken();

      // Log action for monitoring (in debug mode)
      if (APP_CHECK_CONFIG.DEBUG_MODE) {
        console.log(`🎯 App Check token generated for action: ${action}`);
      }

      return token;
    } catch (error) {
      console.error(
        `❌ Failed to get App Check token for action ${action}:`,
        error
      );
      throw error;
    }
  }
}

// Create singleton instance
const appCheckService = new AppCheckService();

// Export singleton and configuration
export default appCheckService;
