/**
 * reCAPTCHA Enterprise Token Verification Service for SimulateAI
 * Server-side token validation using Google Cloud reCAPTCHA Enterprise API
 *
 * @version 1.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from "../utils/logger.js";

/**
 * reCAPTCHA Enterprise Verification Configuration
 */
const RECAPTCHA_VERIFICATION_CONFIG = {
  PROJECT_ID: "simulateai-research",
  SITE_KEY: "6LfizIQrAAAAAETdjKY14uI3ckhF-JeUujcloH53",

  // Minimum acceptable risk scores (0.0 to 1.0)
  SCORE_THRESHOLDS: {
    HIGH_SECURITY: 0.9, // For sensitive operations (account creation, password reset)
    MEDIUM_SECURITY: 0.7, // For form submissions, comments
    LOW_SECURITY: 0.5, // For general interactions
    MINIMUM: 0.3, // Absolute minimum to allow
  },

  // Expected actions that align with frontend
  VALID_ACTIONS: [
    "auth_login",
    "auth_signup",
    "submit_form",
    "contact_form",
    "research_consent",
    "feedback_form",
    "scenario_submit",
    "email_subscribe",
    "domain_test",
    "quick_test",
  ],

  // API endpoint for verification
  VERIFICATION_API_URL:
    "https://us-central1-simulateai-research.cloudfunctions.net/verifyRecaptcha",

  // Cache settings
  CACHE_DURATION: 300000, // 5 minutes
  MAX_CACHE_SIZE: 1000,
};

/**
 * Client-side reCAPTCHA Enterprise Verification Service
 * Handles token validation requests to backend API
 */
export class RecaptchaVerificationService {
  constructor() {
    this.cache = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the verification service
   */
  async initialize() {
    if (this.isInitialized) {
      logger.info("RecaptchaVerification", "Already initialized");
      return true;
    }

    try {
      // Test API connectivity
      const testResult = await this.testApiConnectivity();
      if (testResult) {
        this.isInitialized = true;
        logger.info(
          "RecaptchaVerification",
          "✅ Service initialized successfully",
        );
        return true;
      } else {
        logger.warn(
          "RecaptchaVerification",
          "⚠️ API not available, using fallback mode",
        );
        return false;
      }
    } catch (error) {
      logger.error("RecaptchaVerification", "Initialization failed:", error);
      return false;
    }
  }

  /**
   * Verify reCAPTCHA token with backend API
   * @param {string} token - reCAPTCHA token from frontend
   * @param {string} action - Expected action name
   * @param {string} securityLevel - Security level requirement
   * @returns {Promise<Object>} Verification result
   */
  async verifyToken(token, action, securityLevel = "medium") {
    try {
      // Input validation
      if (!token || typeof token !== "string") {
        throw new Error("Invalid token provided");
      }

      if (!RECAPTCHA_VERIFICATION_CONFIG.VALID_ACTIONS.includes(action)) {
        logger.warn("RecaptchaVerification", `Unknown action: ${action}`);
      }

      // Check cache first
      const cacheKey = `${token}_${action}`;
      if (this.cache.has(cacheKey)) {
        const cached = this.cache.get(cacheKey);
        if (
          Date.now() - cached.timestamp <
          RECAPTCHA_VERIFICATION_CONFIG.CACHE_DURATION
        ) {
          logger.debug("RecaptchaVerification", "Using cached result");
          return cached.result;
        } else {
          this.cache.delete(cacheKey);
        }
      }

      // Make API request
      const result = await this.makeVerificationRequest(
        token,
        action,
        securityLevel,
      );

      // Cache successful results
      if (result.success) {
        this.cacheResult(cacheKey, result);
      }

      return result;
    } catch (error) {
      logger.error(
        "RecaptchaVerification",
        "Token verification failed:",
        error,
      );
      return {
        success: false,
        error: error.message,
        score: 0,
        action: action,
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Make verification request to backend API
   * @param {string} token - reCAPTCHA token
   * @param {string} action - Expected action
   * @param {string} securityLevel - Security requirement
   * @returns {Promise<Object>} API response
   */
  async makeVerificationRequest(token, action, securityLevel) {
    const requestData = {
      token: token,
      action: action,
      securityLevel: securityLevel,
      siteKey: RECAPTCHA_VERIFICATION_CONFIG.SITE_KEY,
      timestamp: Date.now(),
    };

    try {
      const response = await fetch(
        RECAPTCHA_VERIFICATION_CONFIG.VERIFICATION_API_URL,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify(requestData),
        },
      );

      if (!response.ok) {
        throw new Error(
          `API request failed: ${response.status} ${response.statusText}`,
        );
      }

      const result = await response.json();
      logger.info(
        "RecaptchaVerification",
        `Verification result: score=${result.score}, valid=${result.success}`,
      );

      return result;
    } catch (error) {
      // Fallback for development/testing
      if (window.location.hostname === "localhost") {
        logger.warn("RecaptchaVerification", "Using development fallback");
        return this.getDevelopmentFallback(action);
      }

      throw error;
    }
  }

  /**
   * Test API connectivity
   * @returns {Promise<boolean>} Connection status
   */
  async testApiConnectivity() {
    try {
      const response = await fetch("/api/health", {
        method: "GET",
        timeout: 5000,
      });
      return response.ok;
    } catch (error) {
      return false;
    }
  }

  /**
   * Development fallback for testing
   * @param {string} action - Action being tested
   * @returns {Object} Mock verification result
   */
  getDevelopmentFallback(action) {
    logger.warn(
      "RecaptchaVerification",
      "Using development fallback - not suitable for production",
    );

    return {
      success: true,
      score: 0.8, // Mock good score
      action: action,
      valid: true,
      reasons: ["DEVELOPMENT_MODE"],
      timestamp: new Date().toISOString(),
      isDevelopmentMode: true,
    };
  }

  /**
   * Cache verification result
   * @param {string} key - Cache key
   * @param {Object} result - Verification result
   */
  cacheResult(key, result) {
    // Implement simple LRU cache
    if (this.cache.size >= RECAPTCHA_VERIFICATION_CONFIG.MAX_CACHE_SIZE) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }

    this.cache.set(key, {
      result: result,
      timestamp: Date.now(),
    });
  }

  /**
   * Get security threshold for level
   * @param {string} level - Security level (high, medium, low, minimum)
   * @returns {number} Score threshold
   */
  getSecurityThreshold(level) {
    const thresholds = RECAPTCHA_VERIFICATION_CONFIG.SCORE_THRESHOLDS;

    switch (level.toLowerCase()) {
      case "high":
        return thresholds.HIGH_SECURITY;
      case "medium":
        return thresholds.MEDIUM_SECURITY;
      case "low":
        return thresholds.LOW_SECURITY;
      case "minimum":
        return thresholds.MINIMUM;
      default:
        return thresholds.MEDIUM_SECURITY;
    }
  }

  /**
   * Evaluate if verification result meets security requirements
   * @param {Object} result - Verification result
   * @param {string} securityLevel - Required security level
   * @returns {boolean} Whether result meets requirements
   */
  meetsSecurityRequirements(result, securityLevel = "medium") {
    if (!result.success || !result.valid) {
      return false;
    }

    const requiredScore = this.getSecurityThreshold(securityLevel);
    return result.score >= requiredScore;
  }

  /**
   * Clear verification cache
   */
  clearCache() {
    this.cache.clear();
    logger.info("RecaptchaVerification", "Cache cleared");
  }

  /**
   * Get cache statistics
   * @returns {Object} Cache stats
   */
  getCacheStats() {
    return {
      size: this.cache.size,
      maxSize: RECAPTCHA_VERIFICATION_CONFIG.MAX_CACHE_SIZE,
      isInitialized: this.isInitialized,
    };
  }
}

// Create singleton instance
const recaptchaVerificationService = new RecaptchaVerificationService();

// Export service and configuration
export default recaptchaVerificationService;
export { RECAPTCHA_VERIFICATION_CONFIG };
