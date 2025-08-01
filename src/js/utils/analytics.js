/**
 * Enhanced AnalyticsManager - Modern privacy-focused analytics and behavior tracking
 * Provides comprehensive insights while respecting user privacy and accessibility
 *
 * Features:
 * - GDPR compliance and data privacy
 * - Theme-aware analytics tracking
 * - Advanced accessibility monitoring
 * - Performance tracking and optimization
 * - Real-time error monitoring and reporting
 * - Learning analytics and educational insights
 * - Comprehensive event system
 * - Memory management and cleanup
 * - Cross-session persistence
 * - Educational tool usage tracking
 *
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from "./logger.js";
import { StorageManager } from "./simple-storage.js";

// Enhanced constants and configuration
const ANALYTICS_CONSTANTS = {
  VERSION: "2.0.0",
  MAX_EVENT_QUEUE_SIZE: 100,
  MAX_BATCH_SIZE: 50,
  MIN_FLUSH_INTERVAL: 10000, // 10 seconds
  MAX_FLUSH_INTERVAL: 300000, // 5 minutes
  SESSION_TIMEOUT_MINUTES: 30, // 30 minutes for session timeout
  ERROR_SAMPLING_RATE: 1.0, // 100% for educational platform
  PERFORMANCE_SAMPLING_RATE: 0.1, // 10%
  MAX_STORED_EVENTS: 1000,
  ANONYMIZATION_SALT: "SimulateAI_Analytics_2024",

  // Time constants
  TIME: {
    MINUTES_PER_HOUR: 60,
    SECONDS_PER_MINUTE: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_YEAR: 365,
    MILLISECONDS_PER_SECOND: 1000,
    MILLISECONDS_PER_HOUR: 3600000,
    MEMORY_CHECK_INTERVAL: 30000, // 30 seconds
    DEBOUNCE_DELAY: 500, // 500ms
    RETURNING_USER_THRESHOLD: 24, // 24 hours to consider returning user
  },

  // Performance monitoring thresholds
  PERFORMANCE: {
    LAYOUT_SHIFT_THRESHOLD: 0.1,
    LARGE_RESOURCE_SIZE: 100000, // 100KB
    MEMORY_PRESSURE_THRESHOLD: 0.8, // 80%
    QUEUE_SIZE_URGENT: 50,
    QUEUE_SIZE_NORMAL: 20,
    BREADCRUMB_COUNT: 10,
  },

  // ID generation constants
  ID_GENERATION: {
    RADIX: 36,
    SUBSTRING_LENGTH: 9,
    SUBSTRING_START: 2,
    SESSION_ID_SUFFIX_LENGTH: 8,
  },

  // Memory and storage constants
  MEMORY: {
    BYTES_PER_KB: 1024,
    KB_PER_MB: 1024,
    LARGE_PAYLOAD_THRESHOLD: 10000,
    REQUEST_TIMEOUT: 30000, // 30 seconds
  },

  // Privacy and retention constants
  PRIVACY: {
    GDPR_RETENTION_DAYS: 90,
    CONSENT_REFRESH_DAYS: 365,
  },

  // Educational assessment thresholds
  EDUCATION: {
    MASTERY_THRESHOLD_HIGH: 0.8, // 80%
    CONFIDENCE_LOW: 30,
    CONFIDENCE_MEDIUM: 50,
    CONFIDENCE_HIGH: 70,
    ATTEMPTS_HIGH: 5,
    ATTEMPTS_MEDIUM: 3,
    EXPERT_THRESHOLD: 90,
    PROFICIENT_THRESHOLD: 80,
    DEVELOPING_THRESHOLD: 70,
    BEGINNING_THRESHOLD: 60,
    REVIEW_CONFIDENCE_THRESHOLD: 70,
  },

  // Screen resolution ranges (for privacy generalization)
  SCREEN: {
    RESOLUTION_4K: 3840,
    RESOLUTION_2K: 2560,
    RESOLUTION_FHD: 1920,
    RESOLUTION_HD_PLUS: 1366,
    RESOLUTION_HD: 1024,
  },

  // Session analysis thresholds
  SESSION: {
    SHORT_SESSION_THRESHOLD: 60000, // 1 minute
    LONG_SESSION_THRESHOLD: 1800000, // 30 minutes
    BOUNCE_EVENT_THRESHOLD: 2,
  },

  // Hash and encoding constants
  HASH: {
    HEX_RADIX: 16,
    HEX_PAD_LENGTH: 2,
    HEX_PAD_CHAR: "0",
    HASH_SUBSTRING_LENGTH: 16,
    HASH_SHIFT_BITS: 5,
    FALLBACK_RADIX: 36,
  },

  // Network and compression constants
  NETWORK: {
    COMPRESSION_THRESHOLD: 10000,
    REQUEST_TIMEOUT: 30000, // 30 seconds
  },

  // Analytics scoring and trend analysis
  ANALYTICS: {
    TIME_SCORE_DIVISOR: 60000, // 1 minute
    CONFIDENCE_HIGH_THRESHOLD: 10,
    CONFIDENCE_MEDIUM_THRESHOLD: 5,
    MIN_DATA_POINTS: 3,
    TREND_IMPROVEMENT_THRESHOLD: 5,
    TREND_DECLINE_THRESHOLD: -5,
    ENGAGEMENT_FEATURE_MULTIPLIER: 20,
    RECENT_SESSIONS_COUNT: 50,
  },
};

const ANALYTICS_EVENTS = {
  INITIALIZED: "analytics:initialized",
  SESSION_STARTED: "analytics:sessionStarted",
  SESSION_ENDED: "analytics:sessionEnded",
  BATCH_SENT: "analytics:batchSent",
  ERROR_TRACKED: "analytics:errorTracked",
  PRIVACY_CHANGED: "analytics:privacyChanged",
  QUOTA_EXCEEDED: "analytics:quotaExceeded",
};

/**
 * Theme monitoring for analytics context
 */
class AnalyticsTheme {
  static getCurrentTheme() {
    const prefersHighContrast = window.matchMedia(
      "(prefers-contrast: high)",
    ).matches;
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    return {
      highContrast: prefersHighContrast,
      reducedMotion: prefersReducedMotion,
      theme: prefersHighContrast ? "highContrast" : "light",
    };
  }

  static getAccessibilityContext() {
    return {
      screenReader:
        navigator.userAgent.includes("NVDA") ||
        navigator.userAgent.includes("JAWS") ||
        navigator.userAgent.includes("VoiceOver"),
      ...this.getCurrentTheme(),
    };
  }
}

/**
 * Enhanced error tracking and monitoring
 */
class AnalyticsErrorHandler {
  static errorCounts = new Map();
  static maxErrorsPerType = 10;

  static shouldTrackError(error) {
    const errorKey = `${error.name || "Unknown"}:${error.message || "No message"}`;
    const count = this.errorCounts.get(errorKey) || 0;

    if (count >= this.maxErrorsPerType) {
      return false;
    }

    this.errorCounts.set(errorKey, count + 1);
    return true;
  }

  static formatError(error, context = {}) {
    if (!error) return null;

    return {
      name: error.name || "Unknown",
      message: error.message || "Unknown error",
      stack: this.cleanStackTrace(error.stack),
      type: error.constructor?.name || "Error",
      timestamp: Date.now(),
      url: window.location.href,
      userAgent: navigator.userAgent.substring(0, 100),
      context: this.sanitizeContext(context),
    };
  }

  static cleanStackTrace(stack) {
    if (!stack) return null;

    return stack
      .split("\n")
      .slice(0, 10) // Limit to 10 lines
      .map((line) => line.trim())
      .filter((line) => line.length > 0)
      .join("\n");
  }

  static sanitizeContext(context) {
    const sanitized = { ...context };

    // Remove sensitive information
    const sensitiveKeys = ["password", "token", "key", "secret", "auth"];
    sensitiveKeys.forEach((key) => {
      if (sanitized[key]) {
        sanitized[key] = "[REDACTED]";
      }
    });

    return sanitized;
  }
}

/**
 * Performance monitoring and optimization
 */
class AnalyticsPerformance {
  static metrics = new Map();
  static observers = new Map();

  static startTracking() {
    try {
      this.setupPerformanceObserver();
      this.setupNavigationTracking();
      this.setupResourceTracking();
    } catch (error) {
      logger.warn("Performance tracking setup failed:", error);
    }
  }

  static setupPerformanceObserver() {
    if (typeof PerformanceObserver === "undefined") return;

    // Track paint metrics
    const paintObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        this.trackMetric("paint", {
          name: entry.name,
          startTime: entry.startTime,
          duration: entry.duration || 0,
        });
      });
    });

    try {
      paintObserver.observe({ entryTypes: ["paint"] });
      this.observers.set("paint", paintObserver);
    } catch (e) {
      logger.warn("Paint observer not supported:", e);
    }

    // Track layout shifts
    const layoutObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (
          entry.value > ANALYTICS_CONSTANTS.PERFORMANCE.LAYOUT_SHIFT_THRESHOLD
        ) {
          // Only track significant shifts
          this.trackMetric("layout-shift", {
            value: entry.value,
            hadRecentInput: entry.hadRecentInput,
            startTime: entry.startTime,
          });
        }
      });
    });

    try {
      layoutObserver.observe({ entryTypes: ["layout-shift"] });
      this.observers.set("layout-shift", layoutObserver);
    } catch (e) {
      logger.warn("Layout shift observer not supported:", e);
    }
  }

  static setupNavigationTracking() {
    window.addEventListener("load", () => {
      setTimeout(() => {
        const navigation = performance.getEntriesByType("navigation")[0];
        if (navigation) {
          this.trackMetric("navigation", {
            domContentLoaded:
              navigation.domContentLoadedEventEnd -
              navigation.domContentLoadedEventStart,
            loadComplete: navigation.loadEventEnd - navigation.loadEventStart,
            totalTime: navigation.loadEventEnd - navigation.fetchStart,
            transferSize: navigation.transferSize || 0,
          });
        }
      }, 0);
    });
  }

  static setupResourceTracking() {
    const resourceObserver = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (
          entry.transferSize >
          ANALYTICS_CONSTANTS.PERFORMANCE.LARGE_RESOURCE_SIZE
        ) {
          // Track large resources (>100KB)
          this.trackMetric("large-resource", {
            name: entry.name.split("/").pop(),
            size: entry.transferSize,
            duration: entry.duration,
            type: entry.initiatorType,
          });
        }
      });
    });

    try {
      resourceObserver.observe({ entryTypes: ["resource"] });
      this.observers.set("resource", resourceObserver);
    } catch (e) {
      logger.warn("Resource observer not supported:", e);
    }
  }

  static trackMetric(type, data) {
    if (Math.random() > ANALYTICS_CONSTANTS.PERFORMANCE_SAMPLING_RATE) return;

    const metric = {
      type,
      data,
      timestamp: Date.now(),
      theme: AnalyticsTheme.getCurrentTheme(),
    };

    this.metrics.set(`${type}_${Date.now()}`, metric);

    // Cleanup old metrics
    if (this.metrics.size > 100) {
      const oldestKey = this.metrics.keys().next().value;
      this.metrics.delete(oldestKey);
    }
  }

  static getMetrics() {
    return Array.from(this.metrics.values());
  }

  static cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.metrics.clear();
  }
}

/**
 * Enhanced AnalyticsManager with DataHandler Integration - Phase 3.1
 * Supports both static usage (backward compatibility) and instance usage (enhanced features)
 */
class AnalyticsManager {
  // Static properties for backward compatibility
  static isInitialized = false;
  static config = {
    enabled: true,
    anonymizeData: true,
    batchSize: 20,
    flushInterval: 30000, // 30 seconds
    endpoint: null, // Set if sending to external service
    debug: false,
    trackPerformance: true,
    trackAccessibility: true,
    trackErrors: true,
    gdprCompliant: true,
    retentionDays: 90,
  };

  static eventQueue = [];
  static sessionData = {};
  static flushTimer = null;
  static themeObserver = null;
  static isOnline = navigator.onLine;
  static retryQueue = [];

  // Global singleton instance for enhanced features
  static globalInstance = null;

  /**
   * Enhanced constructor for DataHandler integration
   * @param {Object} app - Enhanced app instance with DataHandler
   */
  constructor(app = null) {
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.isInstanceInitialized = false;

    // Instance-specific properties
    this.instanceConfig = { ...AnalyticsManager.config };
    this.instanceEventQueue = [];
    this.instanceSessionData = {};
    this.instanceFlushTimer = null;

    console.log(
      "[AnalyticsManager] Instance created with DataHandler support:",
      !!this.dataHandler,
    );

    // Auto-initialize async if DataHandler available
    if (this.dataHandler) {
      this.initializeAsync();
    }
  }

  /**
   * Async initialization for DataHandler integration
   */
  async initializeAsync() {
    if (this.isInstanceInitialized) return;

    try {
      // Load stored analytics configuration
      await this.loadAnalyticsConfig();

      // Load stored session data
      await this.loadSessionData();

      // Load stored event queue
      await this.loadEventQueue();

      this.isInstanceInitialized = true;
      console.log("[AnalyticsManager] Instance initialized with DataHandler");
    } catch (error) {
      console.warn(
        "[AnalyticsManager] Failed to initialize with DataHandler:",
        error,
      );
    }
  }

  /**
   * Load analytics configuration from DataHandler
   */
  async loadAnalyticsConfig() {
    if (!this.dataHandler) return;

    try {
      const storedConfig = await this.dataHandler.getData("analytics_config");
      if (storedConfig && Object.keys(storedConfig).length > 0) {
        this.instanceConfig = { ...this.instanceConfig, ...storedConfig };
        console.log(
          "[AnalyticsManager] Loaded analytics config from DataHandler",
        );
      }
    } catch (error) {
      console.warn(
        "[AnalyticsManager] Failed to load analytics config:",
        error,
      );
    }
  }

  /**
   * Save analytics configuration to DataHandler
   */
  async saveAnalyticsConfig() {
    if (!this.dataHandler) return;

    try {
      await this.dataHandler.saveData("analytics_config", this.instanceConfig);
      console.log("[AnalyticsManager] Saved analytics config to DataHandler");
    } catch (error) {
      console.warn(
        "[AnalyticsManager] Failed to save analytics config:",
        error,
      );
    }
  }

  /**
   * Load session data from DataHandler
   */
  async loadSessionData() {
    if (!this.dataHandler) return;

    try {
      const storedSession = await this.dataHandler.getData("analytics_session");
      if (storedSession && Object.keys(storedSession).length > 0) {
        this.instanceSessionData = storedSession;
        console.log("[AnalyticsManager] Loaded session data from DataHandler");
      }
    } catch (error) {
      console.warn("[AnalyticsManager] Failed to load session data:", error);
    }
  }

  /**
   * Save session data to DataHandler
   */
  async saveSessionData() {
    if (!this.dataHandler) return;

    try {
      await this.dataHandler.saveData(
        "analytics_session",
        this.instanceSessionData,
      );
      console.log("[AnalyticsManager] Saved session data to DataHandler");
    } catch (error) {
      console.warn("[AnalyticsManager] Failed to save session data:", error);
    }
  }

  /**
   * Load event queue from DataHandler
   */
  async loadEventQueue() {
    if (!this.dataHandler) return;

    try {
      const storedQueue = await this.dataHandler.getData(
        "analytics_event_queue",
      );
      if (storedQueue && Array.isArray(storedQueue)) {
        this.instanceEventQueue = storedQueue;
        console.log("[AnalyticsManager] Loaded event queue from DataHandler");
      }
    } catch (error) {
      console.warn("[AnalyticsManager] Failed to load event queue:", error);
    }
  }

  /**
   * Save event queue to DataHandler
   */
  async saveEventQueue() {
    if (!this.dataHandler) return;

    try {
      await this.dataHandler.saveData(
        "analytics_event_queue",
        this.instanceEventQueue,
      );
      console.log("[AnalyticsManager] Saved event queue to DataHandler");
    } catch (error) {
      console.warn("[AnalyticsManager] Failed to save event queue:", error);
    }
  }

  /**
   * Get or create global singleton instance
   */
  static getGlobalInstance(app = null) {
    if (!this.globalInstance && app) {
      this.globalInstance = new AnalyticsManager(app);
    }
    return this.globalInstance;
  }

  /**
   * Instance method: Initialize the analytics system with enhanced features
   * @param {Object} config - Configuration options
   */
  async init(config = {}) {
    if (this.isInstanceInitialized) return;

    try {
      // Merge configuration
      this.instanceConfig = { ...this.instanceConfig, ...config };

      // Save configuration to DataHandler
      await this.saveAnalyticsConfig();

      // Initialize session data with enhanced information
      await this.initializeInstanceSession();

      // Check user consent and privacy preferences
      await this.validatePrivacyConsentInstance();

      if (this.instanceConfig.enabled) {
        await this.startInstanceSession();
        this.setupInstanceEventListeners();
        this.setupInstanceThemeMonitoring();
        this.setupInstanceNetworkMonitoring();
        this.startInstanceFlushTimer();

        if (this.instanceConfig.trackPerformance) {
          AnalyticsPerformance.startTracking();
        }

        // Initialize accessibility tracking
        this.initializeInstanceAccessibilityTracking();
      }

      this.isInstanceInitialized = true;

      if (this.instanceConfig.debug) {
        console.log(
          "[AnalyticsManager] Instance initialized with DataHandler support",
          {
            enabled: this.instanceConfig.enabled,
            version: ANALYTICS_CONSTANTS.VERSION,
            dataHandler: !!this.dataHandler,
          },
        );
      }
    } catch (error) {
      console.error(
        "[AnalyticsManager] Instance initialization failed:",
        error,
      );
    }
  }

  /**
   * Instance method: Track events with DataHandler persistence
   */
  async trackEvent(eventName, eventData = {}, context = {}) {
    if (!this.instanceConfig.enabled) return;

    const event = this.createEventObject(eventName, eventData, context);
    this.instanceEventQueue.push(event);

    // Save event queue to DataHandler
    await this.saveEventQueue();

    // Process queue if it reaches batch size
    if (this.instanceEventQueue.length >= this.instanceConfig.batchSize) {
      await this.flushInstanceEvents();
    }

    if (this.instanceConfig.debug) {
      console.log("[AnalyticsManager] Event tracked:", event);
    }
  }

  /**
   * Instance method: Initialize session data with DataHandler persistence
   */
  async initializeInstanceSession() {
    this.instanceSessionData = {
      sessionId: await this.generateInstanceSessionId(),
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages || [navigator.language],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      theme: AnalyticsTheme.getCurrentTheme(),
      accessibility: AnalyticsTheme.getAccessibilityContext(),
      memory: AnalyticsManager.getMemoryInfo(),
      connection: AnalyticsManager.getConnectionInfo(),
    };

    // Save session data to DataHandler
    await this.saveSessionData();
  }

  /**
   * Instance method: Generate unique session ID with DataHandler persistence
   */
  async generateInstanceSessionId() {
    const timestamp = Date.now();
    const random = Math.random()
      .toString(ANALYTICS_CONSTANTS.ID_GENERATION.RADIX)
      .substr(
        ANALYTICS_CONSTANTS.ID_GENERATION.SUBSTRING_START,
        ANALYTICS_CONSTANTS.ID_GENERATION.SUBSTRING_LENGTH,
      );

    let stored = "";
    if (this.dataHandler) {
      try {
        const sessionData = await this.dataHandler.getData(
          "analytics_session_id",
        );
        stored = sessionData || "";
      } catch (error) {
        console.warn(
          "[AnalyticsManager] Failed to load session ID from DataHandler:",
          error,
        );
      }
    }

    // Fallback to StorageManager
    if (!stored) {
      stored = StorageManager.getSessionId?.() || "";
    }

    const sessionId = stored || `${timestamp}-${random}`;

    // Save session ID to DataHandler
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData("analytics_session_id", sessionId);
      } catch (error) {
        console.warn(
          "[AnalyticsManager] Failed to save session ID to DataHandler:",
          error,
        );
      }
    }

    return sessionId;
  }

  /**
   * Helper methods for instance functionality
   */
  createEventObject(eventName, eventData = {}, context = {}) {
    return {
      id: this.generateEventId(),
      name: eventName,
      data: this.sanitizeEventData(eventData),
      context: this.sanitizeEventData(context),
      timestamp: Date.now(),
      sessionId: this.instanceSessionData.sessionId || "unknown",
      url: window.location.href,
      referrer: document.referrer,
      theme: AnalyticsTheme.getCurrentTheme(),
    };
  }

  generateEventId() {
    return `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  sanitizeEventData(data) {
    if (!this.instanceConfig.anonymizeData) return data;
    const sanitized = { ...data };
    const sensitiveKeys = [
      "password",
      "token",
      "key",
      "secret",
      "auth",
      "email",
    ];
    sensitiveKeys.forEach((key) => {
      if (sanitized[key]) sanitized[key] = "[REDACTED]";
    });
    return sanitized;
  }

  async flushInstanceEvents() {
    if (this.instanceEventQueue.length === 0) return;
    try {
      const events = [...this.instanceEventQueue];
      this.instanceEventQueue = [];
      await this.saveEventQueue();
      if (this.instanceConfig.debug) {
        console.log("[AnalyticsManager] Flushed events:", events.length);
      }
    } catch (error) {
      console.error("[AnalyticsManager] Failed to flush events:", error);
    }
  }

  // Instance delegation methods
  async validatePrivacyConsentInstance() {
    return AnalyticsManager.validatePrivacyConsent();
  }
  async startInstanceSession() {
    return AnalyticsManager.startSession();
  }
  setupInstanceEventListeners() {
    return AnalyticsManager.setupEventListeners();
  }
  setupInstanceThemeMonitoring() {
    return AnalyticsManager.setupThemeMonitoring();
  }
  setupInstanceNetworkMonitoring() {
    return AnalyticsManager.setupNetworkMonitoring();
  }
  initializeInstanceAccessibilityTracking() {
    return AnalyticsManager.initializeAccessibilityTracking();
  }

  startInstanceFlushTimer() {
    if (this.instanceFlushTimer) clearInterval(this.instanceFlushTimer);
    this.instanceFlushTimer = setInterval(() => {
      this.flushInstanceEvents();
    }, this.instanceConfig.flushInterval);
  } /**
   * Initialize the analytics system with enhanced features
   * @param {Object} config - Configuration options
   */
  static async init(config = {}) {
    if (this.isInitialized) return;

    try {
      // Merge configuration
      this.config = { ...this.config, ...config };

      // Initialize session data with enhanced information
      await this.initializeSession();

      // Check user consent and privacy preferences
      await this.validatePrivacyConsent();

      if (this.config.enabled) {
        await this.startSession();
        this.setupEventListeners();
        this.setupThemeMonitoring();
        this.setupNetworkMonitoring();
        this.startFlushTimer();

        if (this.config.trackPerformance) {
          AnalyticsPerformance.startTracking();
        }

        // Initialize accessibility tracking
        this.initializeAccessibilityTracking();
      }

      this.isInitialized = true;
      this.dispatchEvent(ANALYTICS_EVENTS.INITIALIZED, {
        enabled: this.config.enabled,
        version: ANALYTICS_CONSTANTS.VERSION,
      });

      if (this.config.debug) {
        logger.debug("Enhanced AnalyticsManager initialized", {
          enabled: this.config.enabled,
          version: ANALYTICS_CONSTANTS.VERSION,
          features: {
            performance: this.config.trackPerformance,
            accessibility: this.config.trackAccessibility,
            errors: this.config.trackErrors,
            gdpr: this.config.gdprCompliant,
          },
        });
      }
    } catch (error) {
      logger.error("AnalyticsManager initialization failed:", error);
      this.trackError(error, { context: "initialization" });
    }
  }

  /**
   * Initialize session data with comprehensive information
   */
  static async initializeSession() {
    this.sessionData = {
      sessionId: await this.generateSessionId(),
      startTime: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      languages: navigator.languages || [navigator.language],
      timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
      screenResolution: `${screen.width}x${screen.height}`,
      viewportSize: `${window.innerWidth}x${window.innerHeight}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio || 1,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
      theme: AnalyticsTheme.getCurrentTheme(),
      accessibility: AnalyticsTheme.getAccessibilityContext(),
      memory: this.getMemoryInfo(),
      connection: this.getConnectionInfo(),
    };
  }

  /**
   * Generate a unique session ID
   */
  static async generateSessionId() {
    const timestamp = Date.now();
    const random = Math.random()
      .toString(ANALYTICS_CONSTANTS.ID_GENERATION.RADIX)
      .substr(
        ANALYTICS_CONSTANTS.ID_GENERATION.SUBSTRING_START,
        ANALYTICS_CONSTANTS.ID_GENERATION.SUBSTRING_LENGTH,
      );
    const stored = StorageManager.getSessionId?.() || "";

    return `${timestamp}_${random}_${stored.substr(-ANALYTICS_CONSTANTS.ID_GENERATION.SESSION_ID_SUFFIX_LENGTH)}`;
  }

  /**
   * Get memory information if available
   */
  static getMemoryInfo() {
    if (performance.memory) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  }

  /**
   * Get connection information if available
   */
  static getConnectionInfo() {
    if (navigator.connection) {
      return {
        effectiveType: navigator.connection.effectiveType,
        downlink: navigator.connection.downlink,
        rtt: navigator.connection.rtt,
        saveData: navigator.connection.saveData,
      };
    }
    return null;
  }

  /**
   * Validate privacy consent and GDPR compliance
   */
  static async validatePrivacyConsent() {
    try {
      const preferences = await StorageManager.getUserPreferences();
      const analytics = preferences.analytics || {};

      // Check explicit consent
      this.config.enabled = analytics.allowTracking !== false;
      this.config.anonymizeData = analytics.anonymizeData !== false;

      // GDPR compliance check
      if (this.config.gdprCompliant) {
        const lastConsentCheck = analytics.lastConsentCheck || 0;
        const needsConsentRefresh =
          Date.now() - lastConsentCheck >
          ANALYTICS_CONSTANTS.PRIVACY.CONSENT_REFRESH_DAYS *
            ANALYTICS_CONSTANTS.TIME.HOURS_PER_DAY *
            ANALYTICS_CONSTANTS.TIME.MINUTES_PER_HOUR *
            ANALYTICS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
            1000; // 1 year

        if (needsConsentRefresh && !analytics.explicitConsent) {
          this.config.enabled = false;
          this.requestConsentRenewal();
        }
      }

      // Regional privacy compliance
      this.applyRegionalPrivacyRules();
    } catch (error) {
      logger.warn("Privacy consent validation failed:", error);
      // Err on the side of privacy
      this.config.enabled = false;
      this.config.anonymizeData = true;
    }
  }

  /**
   * Apply regional privacy rules based on user location
   */
  static applyRegionalPrivacyRules() {
    const { timezone, language } = this.sessionData;

    // EU/GDPR regions
    const gdprRegions = ["Europe", "EU"];
    const isGDPRRegion =
      gdprRegions.some((region) => timezone.includes(region)) ||
      language.startsWith("de") ||
      language.startsWith("fr") ||
      language.startsWith("es") ||
      language.startsWith("it");

    if (isGDPRRegion) {
      this.config.gdprCompliant = true;
      this.config.anonymizeData = true;
      this.config.retentionDays = Math.min(
        this.config.retentionDays,
        ANALYTICS_CONSTANTS.PRIVACY.GDPR_RETENTION_DAYS,
      );
    }

    // California/CCPA
    if (timezone.includes("Los_Angeles") || timezone.includes("Pacific")) {
      this.config.anonymizeData = true;
    }
  }

  /**
   * Request consent renewal for GDPR compliance
   */
  static requestConsentRenewal() {
    this.dispatchEvent(ANALYTICS_EVENTS.PRIVACY_CHANGED, {
      action: "consent_renewal_required",
      reason: "gdpr_compliance",
    });
  }

  /**
   * Setup theme monitoring for accessibility insights
   */
  static setupThemeMonitoring() {
    // Monitor high contrast changes
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    contrastQuery.addEventListener("change", (e) => {
      this.trackThemeChange("high_contrast", e.matches);
    });

    // Monitor reduced motion changes
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    motionQuery.addEventListener("change", (e) => {
      this.trackThemeChange("reduced_motion", e.matches);
    });

    this.themeObserver = { contrastQuery, motionQuery };
  }

  /**
   * Setup network monitoring for offline/online events
   */
  static setupNetworkMonitoring() {
    window.addEventListener("online", () => {
      this.isOnline = true;
      this.trackEvent("network_status", { status: "online" });
      this.processRetryQueue();
    });

    window.addEventListener("offline", () => {
      this.isOnline = false;
      this.trackEvent("network_status", { status: "offline" });
    });
  }

  /**
   * Initialize accessibility tracking
   */
  static initializeAccessibilityTracking() {
    if (!this.config.trackAccessibility) return;

    // Track screen reader usage
    const isScreenReader = this.detectScreenReader();
    if (isScreenReader) {
      this.trackAccessibilityUsage("screen_reader", true);
    }

    // Track keyboard navigation
    this.setupKeyboardTracking();

    // Track focus indicators
    this.setupFocusTracking();
  }

  /**
   * Detect screen reader usage
   */
  static detectScreenReader() {
    const userAgent = navigator.userAgent.toLowerCase();
    const screenReaders = ["nvda", "jaws", "dragon", "voiceover"];

    return (
      screenReaders.some((sr) => userAgent.includes(sr)) ||
      navigator.userAgent.includes("aural") ||
      (window.speechSynthesis && window.speechSynthesis.speaking)
    );
  }

  /**
   * Setup keyboard navigation tracking
   */
  static setupKeyboardTracking() {
    let tabKeyUsed = false;

    document.addEventListener(
      "keydown",
      (e) => {
        if (e.key === "Tab") {
          if (!tabKeyUsed) {
            this.trackAccessibilityUsage("keyboard_navigation", true);
            tabKeyUsed = true;
          }
        }

        // Track common accessibility shortcuts
        if (e.altKey || e.ctrlKey) {
          this.trackAccessibilityUsage("keyboard_shortcut", true, {
            key: e.key,
            modifier: e.altKey ? "alt" : "ctrl",
          });
        }
      },
      { once: false, passive: true },
    );
  }

  /**
   * Setup focus tracking for accessibility
   */
  static setupFocusTracking() {
    let focusEvents = 0;

    document.addEventListener(
      "focusin",
      () => {
        focusEvents++;
        if (focusEvents === 1) {
          this.trackAccessibilityUsage("focus_indicators", true);
        }
      },
      { passive: true },
    );
  }

  /**
   * Dispatch custom events for the analytics system
   */
  static dispatchEvent(eventType, data) {
    try {
      const event = new CustomEvent(eventType, { detail: data });
      window.dispatchEvent(event);
    } catch (error) {
      if (this.config.debug) {
        logger.warn("Failed to dispatch analytics event:", error);
      }
    }
  } /**
   * Start a new analytics session
   */
  static async startSession() {
    const isReturning = await this.isReturningUser();

    await this.trackEvent("session_start", {
      ...this.sessionData,
      returningUser: isReturning,
      sessionCount: await this.getSessionCount(),
    });

    this.dispatchEvent(ANALYTICS_EVENTS.SESSION_STARTED, {
      sessionId: this.sessionData.sessionId,
      returningUser: isReturning,
    });
  }

  /**
   * Get the total session count for this user
   */
  static async getSessionCount() {
    try {
      const sessions = await StorageManager.get("analytics_sessions", []);
      return sessions.length + 1;
    } catch (error) {
      return 1;
    }
  } /**
   * Setup comprehensive event listeners
   */
  static setupEventListeners() {
    // Page visibility for session tracking
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.trackEvent("session_pause", {
          pauseTime: Date.now(),
          sessionDuration: Date.now() - this.sessionData.startTime,
        });
      } else {
        this.trackEvent("session_resume", {
          resumeTime: Date.now(),
        });
      }
    });

    // Window beforeunload for session end
    window.addEventListener("beforeunload", () => {
      this.endSession();
    });

    // Enhanced error tracking
    if (this.config.trackErrors) {
      window.addEventListener("error", (e) => {
        const errorData = AnalyticsErrorHandler.formatError(e.error, {
          filename: e.filename,
          lineno: e.lineno,
          colno: e.colno,
          type: "javascript_error",
        });

        if (errorData && AnalyticsErrorHandler.shouldTrackError(e.error)) {
          this.trackError(e.error, errorData.context);
        }
      });

      // Promise rejection tracking
      window.addEventListener("unhandledrejection", (e) => {
        const error =
          e.reason instanceof Error ? e.reason : new Error(String(e.reason));
        const errorData = AnalyticsErrorHandler.formatError(error, {
          type: "unhandled_promise_rejection",
        });

        if (errorData && AnalyticsErrorHandler.shouldTrackError(error)) {
          this.trackError(error, errorData.context);
        }
      });
    }

    // Performance tracking setup
    if (
      this.config.trackPerformance &&
      typeof PerformanceObserver !== "undefined"
    ) {
      this.setupAdvancedPerformanceTracking();
    }

    // Viewport and orientation changes
    window.addEventListener(
      "resize",
      this.debounce(() => {
        this.trackEvent("viewport_change", {
          newSize: `${window.innerWidth}x${window.innerHeight}`,
          orientation: window.orientation || 0,
        });
      }, ANALYTICS_CONSTANTS.TIME.DEBOUNCE_DELAY),
    );

    // Input method tracking
    this.setupInputMethodTracking();
  }

  /**
   * Setup advanced performance tracking
   */
  static setupAdvancedPerformanceTracking() {
    // Memory pressure detection
    if (performance.memory) {
      setInterval(() => {
        const { memory } = performance;
        const usage = memory.usedJSHeapSize / memory.jsHeapSizeLimit;

        if (usage > ANALYTICS_CONSTANTS.PERFORMANCE.MEMORY_PRESSURE_THRESHOLD) {
          // 80% memory usage
          this.trackPerformanceMetric("memory_pressure", usage * 100, "%");
        }
      }, ANALYTICS_CONSTANTS.TIME.MEMORY_CHECK_INTERVAL); // Check every 30 seconds
    }

    // Long task detection
    if (typeof PerformanceObserver !== "undefined") {
      try {
        const longTaskObserver = new PerformanceObserver((list) => {
          list.getEntries().forEach((entry) => {
            this.trackPerformanceMetric("long_task", entry.duration, "ms");
          });
        });
        longTaskObserver.observe({ entryTypes: ["longtask"] });
      } catch (e) {
        if (this.config.debug) {
          logger.warn("Long task observer not supported:", e);
        }
      }
    }
  }

  /**
   * Setup input method tracking for accessibility insights
   */
  static setupInputMethodTracking() {
    let mouseUsed = false;
    let touchUsed = false;
    let keyboardUsed = false;

    document.addEventListener(
      "mousedown",
      () => {
        if (!mouseUsed) {
          this.trackUserInteraction("input_method", "mouse");
          mouseUsed = true;
        }
      },
      { once: true, passive: true },
    );

    document.addEventListener(
      "touchstart",
      () => {
        if (!touchUsed) {
          this.trackUserInteraction("input_method", "touch");
          touchUsed = true;
        }
      },
      { once: true, passive: true },
    );

    document.addEventListener(
      "keydown",
      () => {
        if (!keyboardUsed) {
          this.trackUserInteraction("input_method", "keyboard");
          keyboardUsed = true;
        }
      },
      { once: true, passive: true },
    );
  }

  /**
   * Debounce utility for performance optimization
   */
  static debounce(func, wait) {
    let timeout;
    return function executedFunction(...args) {
      const later = () => {
        clearTimeout(timeout);
        func(...args);
      };
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
    };
  } /**
   * Start the flush timer with dynamic intervals
   */
  static startFlushTimer() {
    if (this.flushTimer) {
      clearInterval(this.flushTimer);
    }

    // Adaptive flush interval based on queue size
    const getFlushInterval = () => {
      const queueSize = this.eventQueue.length;
      if (queueSize > ANALYTICS_CONSTANTS.PERFORMANCE.QUEUE_SIZE_URGENT)
        return ANALYTICS_CONSTANTS.MIN_FLUSH_INTERVAL;
      if (queueSize > ANALYTICS_CONSTANTS.PERFORMANCE.QUEUE_SIZE_NORMAL)
        return this.config.flushInterval;
      return Math.min(
        this.config.flushInterval * 2,
        ANALYTICS_CONSTANTS.MAX_FLUSH_INTERVAL,
      );
    };

    this.flushTimer = setInterval(() => {
      this.flush();

      // Adjust interval for next flush
      const newInterval = getFlushInterval();
      if (newInterval !== this.config.flushInterval) {
        this.startFlushTimer();
      }
    }, getFlushInterval());
  }

  // Enhanced event tracking methods
  /**
   * Track an event with comprehensive data validation and enhancement
   * @param {string} eventName - Name of the event
   * @param {Object} data - Event data
   * @param {boolean} urgent - Whether to flush immediately
   */
  static async trackEvent(eventName, data = {}, urgent = false) {
    if (!this.config.enabled || !this.validateEventName(eventName)) return;

    try {
      const event = {
        name: eventName,
        timestamp: Date.now(),
        sessionId: this.sessionData.sessionId,
        data: await this.enhanceEventData(data),
        url: window.location.pathname,
        referrer: document.referrer || "",
        viewport: `${window.innerWidth}x${window.innerHeight}`,
        theme: AnalyticsTheme.getCurrentTheme(),
        performance: this.getBasicPerformanceMetrics(),
        eventId: this.generateEventId(),
      };

      // Apply anonymization if enabled
      if (this.config.anonymizeData) {
        event.data = await this.anonymizeEventData(event.data);
        event.url = this.anonymizeUrl(event.url);
        event.referrer = this.anonymizeUrl(event.referrer);
      }

      if (this.config.debug) {
        logger.debug("Analytics Event:", event);
      }

      // Queue management
      this.eventQueue.push(event);

      // Prevent memory leaks
      if (this.eventQueue.length > ANALYTICS_CONSTANTS.MAX_EVENT_QUEUE_SIZE) {
        this.eventQueue = this.eventQueue.slice(
          -ANALYTICS_CONSTANTS.MAX_BATCH_SIZE,
        );
        this.dispatchEvent(ANALYTICS_EVENTS.QUOTA_EXCEEDED, {
          action: "queue_trimmed",
          newSize: this.eventQueue.length,
        });
      }

      // Store event locally for persistence
      await this.storeEventLocally(event);

      // Flush if conditions are met
      if (urgent || this.eventQueue.length >= this.config.batchSize) {
        await this.flush();
      }
    } catch (error) {
      if (this.config.debug) {
        logger.error("Failed to track event:", error);
      }
      this.trackError(error, { context: "event_tracking", eventName });
    }
  }

  /**
   * Validate event name
   */
  static validateEventName(eventName) {
    return (
      typeof eventName === "string" &&
      eventName.length > 0 &&
      eventName.length <= 100 &&
      /^[a-zA-Z0-9_\-.:]+$/.test(eventName)
    );
  }

  /**
   * Generate unique event ID
   */
  static generateEventId() {
    return `${Date.now()}_${Math.random().toString(ANALYTICS_CONSTANTS.ID_GENERATION.RADIX).substr(ANALYTICS_CONSTANTS.ID_GENERATION.SUBSTRING_START, ANALYTICS_CONSTANTS.ID_GENERATION.SUBSTRING_LENGTH)}`;
  }

  /**
   * Enhance event data with additional context
   */
  static async enhanceEventData(data) {
    const enhanced = { ...data };

    // Add automatic context
    enhanced._timestamp = Date.now();
    enhanced._userAgent = navigator.userAgent.substring(0, 100);
    enhanced._language = navigator.language;
    enhanced._online = navigator.onLine;

    // Add memory info if available
    if (performance.memory) {
      enhanced._memoryUsage = Math.round(
        performance.memory.usedJSHeapSize /
          ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
          ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
      ); // MB
    }

    // Add connection info if available
    if (navigator.connection) {
      enhanced._connectionType = navigator.connection.effectiveType;
      enhanced._saveData = navigator.connection.saveData;
    }

    return enhanced;
  }

  /**
   * Get basic performance metrics
   */
  static getBasicPerformanceMetrics() {
    if (!this.config.trackPerformance) return null;

    return {
      timeOrigin: performance.timeOrigin,
      now: performance.now(),
      memory: performance.memory
        ? {
            used: Math.round(
              performance.memory.usedJSHeapSize /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
            total: Math.round(
              performance.memory.totalJSHeapSize /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
          }
        : null,
    };
  }

  /**
   * Store event locally for persistence
   */
  static async storeEventLocally(event) {
    try {
      await StorageManager.logAnalyticsEvent(event);
    } catch (error) {
      if (this.config.debug) {
        logger.warn("Failed to store event locally:", error);
      }
    }
  }

  /**
   * Anonymize URL for privacy
   */
  static anonymizeUrl(url) {
    if (!url) return "";

    try {
      const urlObj = new URL(url, window.location.origin);

      // Remove query parameters and hash
      urlObj.search = "";
      urlObj.hash = "";

      // Replace specific segments that might contain IDs
      let { pathname } = urlObj;
      pathname = pathname.replace(/\/\d+/g, "/:id");
      pathname = pathname.replace(/\/[a-f0-9]{8,}/g, "/:hash");

      return pathname;
    } catch (error) {
      return "/unknown";
    }
  }

  /**
   * Track theme changes for accessibility insights
   */
  static trackThemeChange(type, enabled) {
    this.trackEvent("theme_change", {
      type,
      enabled,
      theme: AnalyticsTheme.getCurrentTheme(),
    });
  } /**
   * Track ethics decisions with enhanced data
   */
  static trackEthicsDecision(decision) {
    this.trackEvent("ethics_decision", {
      simulationId: decision.simulationId,
      scenario: decision.scenario,
      category: decision.category,
      change: decision.change,
      hasReasoning: !!decision.reasoning,
      reasoningLength: decision.reasoning?.length || 0,
      ethicsMetrics: Object.keys(decision.allMetrics || {}).length,
      decisionTime: decision.timestamp || Date.now(),
      confidence: decision.confidence || null,
      difficulty: decision.difficulty || null,
      accessibility: AnalyticsTheme.getAccessibilityContext(),
    });
  }

  /**
   * Track simulation start with enhanced context
   */
  static trackSimulationStart(
    simulationId,
    simulationType,
    additionalData = {},
  ) {
    this.trackEvent("simulation_start", {
      simulationId,
      simulationType,
      isRetry: StorageManager.isSimulationCompleted?.(simulationId) || false,
      userLevel: additionalData.userLevel || "beginner",
      expectedDuration: additionalData.expectedDuration || null,
      prerequisites: additionalData.prerequisites || [],
      learningObjectives: additionalData.learningObjectives || [],
      theme: AnalyticsTheme.getCurrentTheme(),
      accessibility: AnalyticsTheme.getAccessibilityContext(),
    });
  }

  /**
   * Track simulation completion with comprehensive data
   */
  static trackSimulationComplete(simulationId, report) {
    this.trackEvent("simulation_complete", {
      simulationId,
      duration: report.duration,
      score: report.score,
      decisions: report.decisions,
      scenarios: report.scenarios,
      ethicsMetrics: Object.keys(report.ethicsMetrics || {}).length,
      completionRate: report.completionRate || 100,
      hintsUsed: report.hintsUsed || 0,
      errorsEncountered: report.errorsEncountered || 0,
      accessibilityFeaturesUsed: report.accessibilityFeaturesUsed || [],
      learningOutcomes: report.learningOutcomes || {},
      userFeedback: report.userFeedback
        ? {
            rating: report.userFeedback.rating,
            hasComment: !!report.userFeedback.comment,
          }
        : null,
    });
  }

  /**
   * Track scenario changes with detailed context
   */
  static trackScenarioChange(
    simulationId,
    fromScenario,
    toScenario,
    totalScenarios,
    additionalData = {},
  ) {
    this.trackEvent("scenario_change", {
      simulationId,
      fromScenario,
      toScenario,
      totalScenarios,
      progress: ((toScenario + 1) / totalScenarios) * 100,
      timeInPreviousScenario: additionalData.timeInPrevious || null,
      difficulty: additionalData.difficulty || null,
      userInitiated: additionalData.userInitiated !== false,
      navigationMethod: additionalData.navigationMethod || "unknown",
    });
  }

  /**
   * Track user interactions with enhanced data
   */
  static trackUserInteraction(interactionType, elementId, additionalData = {}) {
    this.trackEvent("user_interaction", {
      type: interactionType,
      elementId,
      timestamp: Date.now(),
      inputMethod: additionalData.inputMethod || "unknown",
      duration: additionalData.duration || null,
      coordinates: additionalData.coordinates || null,
      modifierKeys: additionalData.modifierKeys || {},
      accessibility: {
        screenReader: this.detectScreenReader(),
        keyboardNavigation: additionalData.keyboardNavigation || false,
        highContrast: AnalyticsTheme.getCurrentTheme().highContrast,
      },
      ...additionalData,
    });
  }

  /**
   * Track accessibility feature usage with comprehensive data
   */
  static trackAccessibilityUsage(feature, enabled, additionalData = {}) {
    this.trackEvent("accessibility_usage", {
      feature,
      enabled,
      timestamp: Date.now(),
      context: additionalData.context || "unknown",
      previousState: additionalData.previousState || null,
      trigger: additionalData.trigger || "user",
      theme: AnalyticsTheme.getCurrentTheme(),
      userAgent: navigator.userAgent.substring(0, 100),
      ...additionalData,
    });
  }

  /**
   * Enhanced error tracking with context and recovery information
   */
  static trackError(error, context = {}) {
    if (!error || !this.config.trackErrors) {
      if (this.config.debug && !error) {
        logger.warn("Analytics: Attempted to track null/undefined error");
      }
      return;
    }

    const errorData = AnalyticsErrorHandler.formatError(error, context);
    if (!errorData) return;

    this.trackEvent(
      "error",
      {
        ...errorData,
        errorId: this.generateEventId(),
        sessionId: this.sessionData.sessionId,
        breadcrumbs: this.getErrorBreadcrumbs(),
        recoveryAttempted: context.recoveryAttempted || false,
        userImpact: context.userImpact || "unknown",
        theme: AnalyticsTheme.getCurrentTheme(),
        performance: this.getBasicPerformanceMetrics(),
      },
      true,
    ); // Mark as urgent

    this.dispatchEvent(ANALYTICS_EVENTS.ERROR_TRACKED, {
      error: errorData,
      context,
    });
  }

  /**
   * Get error breadcrumbs for debugging context
   */
  static getErrorBreadcrumbs() {
    // Return last 10 events as breadcrumbs
    return this.eventQueue
      .slice(-ANALYTICS_CONSTANTS.PERFORMANCE.BREADCRUMB_COUNT)
      .map((event) => ({
        name: event.name,
        timestamp: event.timestamp,
        url: event.url,
      }));
  }

  /**
   * Track performance metrics with enhanced data
   */
  static trackPerformanceMetric(metricName, value, unit = "ms") {
    if (!this.config.trackPerformance) return;

    this.trackEvent("performance_metric", {
      metric: metricName,
      value,
      unit,
      timestamp: Date.now(),
      userAgent: navigator.userAgent.substring(0, 100),
      memory: performance.memory
        ? {
            used: Math.round(
              performance.memory.usedJSHeapSize /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
            limit: Math.round(
              performance.memory.jsHeapSizeLimit /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
          }
        : null,
      connection: navigator.connection
        ? {
            effectiveType: navigator.connection.effectiveType,
            rtt: navigator.connection.rtt,
          }
        : null,
      theme: AnalyticsTheme.getCurrentTheme(),
    });
  } // Enhanced learning analytics methods
  /**
   * Track learning path with comprehensive educational metrics
   */
  static trackLearningPath(simulationId, path, learningObjectives = []) {
    const pathAnalysis = this.analyzeLearningPath(path);

    this.trackEvent("learning_path", {
      simulationId,
      pathLength: path.length,
      uniqueScenarios: new Set(path.map((p) => p.scenario)).size,
      totalTime: path.reduce((sum, p) => sum + (p.timeSpent || 0), 0),
      averageTimePerScenario: pathAnalysis.averageTime,
      difficultyProgression: pathAnalysis.difficultyProgression,
      masteryLevel: pathAnalysis.masteryLevel,
      strugglingAreas: pathAnalysis.strugglingAreas,
      learningObjectivesMet: this.calculateObjectiveCompletion(
        path,
        learningObjectives,
      ),
      adaptiveAdjustments: pathAnalysis.adaptiveAdjustments,
      theme: AnalyticsTheme.getCurrentTheme(),
      accessibility: AnalyticsTheme.getAccessibilityContext(),
    });
  }

  /**
   * Analyze learning path for educational insights
   */
  static analyzeLearningPath(path) {
    if (!path || path.length === 0) {
      return {
        averageTime: 0,
        difficultyProgression: "none",
        masteryLevel: "unknown",
        strugglingAreas: [],
        adaptiveAdjustments: 0,
      };
    }

    const times = path.map((p) => p.timeSpent || 0).filter((t) => t > 0);
    const averageTime =
      times.length > 0 ? times.reduce((a, b) => a + b, 0) / times.length : 0;

    // Analyze difficulty progression
    const difficulties = path.map((p) => p.difficulty || 1);
    const isIncreasing = difficulties.every(
      (d, i) => i === 0 || d >= difficulties[i - 1],
    );
    const difficultyProgression = isIncreasing ? "increasing" : "mixed";

    // Estimate mastery level
    const correctAnswers = path.filter((p) => p.correct === true).length;
    const masteryPercentage =
      path.length > 0 ? (correctAnswers / path.length) * 100 : 0;
    const masteryLevel =
      masteryPercentage >= ANALYTICS_CONSTANTS.EDUCATION.PROFICIENT_THRESHOLD
        ? "high"
        : masteryPercentage >= ANALYTICS_CONSTANTS.EDUCATION.BEGINNING_THRESHOLD
          ? "medium"
          : "low";

    // Identify struggling areas
    const strugglingAreas = path
      .filter((p) => p.attempts > 2 || p.timeSpent > averageTime * 2)
      .map((p) => p.topic || p.scenario)
      .filter(Boolean);

    // Count adaptive adjustments
    const adaptiveAdjustments = path.filter(
      (p) => p.adaptiveHint || p.difficultyAdjusted,
    ).length;

    return {
      averageTime,
      difficultyProgression,
      masteryLevel,
      strugglingAreas: [...new Set(strugglingAreas)],
      adaptiveAdjustments,
    };
  }

  /**
   * Calculate learning objective completion
   */
  static calculateObjectiveCompletion(path, objectives) {
    if (!objectives || objectives.length === 0) return {};

    const completion = {};
    objectives.forEach((objective) => {
      const relatedSteps = path.filter(
        (step) =>
          step.objectives?.includes(objective.id) ||
          step.topics?.includes(objective.topic),
      );

      const completed = relatedSteps.filter(
        (step) => step.correct === true,
      ).length;
      const total = relatedSteps.length;

      completion[objective.id] = {
        percentage: total > 0 ? (completed / total) * 100 : 0,
        attempts: total,
        mastered:
          total > 0 &&
          completed / total >=
            ANALYTICS_CONSTANTS.EDUCATION.MASTERY_THRESHOLD_HIGH,
      };
    });

    return completion;
  }

  /**
   * Track knowledge gaps with enhanced educational context
   */
  static trackKnowledgeGap(topic, confidence, attempts, additionalData = {}) {
    this.trackEvent("knowledge_gap", {
      topic,
      confidence,
      attempts,
      needsReview:
        confidence < ANALYTICS_CONSTANTS.EDUCATION.REVIEW_CONFIDENCE_THRESHOLD,
      severityLevel: this.calculateGapSeverity(confidence, attempts),
      recommendedActions: this.getRecommendedActions(confidence, attempts),
      relatedTopics: additionalData.relatedTopics || [],
      prerequisites: additionalData.prerequisites || [],
      learningResources: additionalData.learningResources || [],
      difficultyLevel: additionalData.difficultyLevel || "unknown",
      timestamp: Date.now(),
      theme: AnalyticsTheme.getCurrentTheme(),
    });
  }

  /**
   * Calculate knowledge gap severity
   */
  static calculateGapSeverity(confidence, attempts) {
    if (
      confidence < ANALYTICS_CONSTANTS.EDUCATION.CONFIDENCE_LOW &&
      attempts > ANALYTICS_CONSTANTS.EDUCATION.ATTEMPTS_HIGH
    )
      return "critical";
    if (
      confidence < ANALYTICS_CONSTANTS.EDUCATION.CONFIDENCE_MEDIUM &&
      attempts > ANALYTICS_CONSTANTS.EDUCATION.ATTEMPTS_MEDIUM
    )
      return "high";
    if (confidence < ANALYTICS_CONSTANTS.EDUCATION.CONFIDENCE_HIGH)
      return "medium";
    return "low";
  }

  /**
   * Get recommended actions for knowledge gaps
   */
  static getRecommendedActions(confidence, attempts) {
    const actions = [];

    if (confidence < ANALYTICS_CONSTANTS.EDUCATION.CONFIDENCE_LOW) {
      actions.push(
        "review_fundamentals",
        "additional_practice",
        "tutor_assistance",
      );
    } else if (confidence < ANALYTICS_CONSTANTS.EDUCATION.CONFIDENCE_MEDIUM) {
      actions.push("practice_exercises", "peer_discussion");
    } else if (confidence < ANALYTICS_CONSTANTS.EDUCATION.CONFIDENCE_HIGH) {
      actions.push("light_review", "confidence_building");
    }

    if (attempts > ANALYTICS_CONSTANTS.EDUCATION.ATTEMPTS_HIGH) {
      actions.push("alternative_approach", "break_session");
    }

    return actions;
  }

  /**
   * Track educator tool usage with detailed context
   */
  static trackEducatorToolUsage(toolName, context = {}) {
    this.trackEvent("educator_tool_usage", {
      tool: toolName,
      context: context.context || "unknown",
      userId: context.userId ? this.hashValue(context.userId) : null,
      classSize: context.classSize || null,
      grade: context.grade || null,
      subject: context.subject || null,
      sessionDuration: context.sessionDuration || null,
      studentsEngaged: context.studentsEngaged || null,
      effectiveness: context.effectiveness || null,
      toolVersion: context.toolVersion || null,
      timestamp: Date.now(),
      theme: AnalyticsTheme.getCurrentTheme(),
    });
  }

  /**
   * Track educational outcomes and assessment results
   */
  static trackEducationalOutcome(assessment) {
    this.trackEvent("educational_outcome", {
      assessmentId: assessment.id,
      type: assessment.type || "unknown",
      score: assessment.score,
      maxScore: assessment.maxScore,
      percentage:
        assessment.maxScore > 0
          ? (assessment.score / assessment.maxScore) * 100
          : 0,
      timeSpent: assessment.timeSpent,
      attempts: assessment.attempts || 1,
      topics: assessment.topics || [],
      difficulty: assessment.difficulty || "medium",
      improvementFromPrevious: assessment.previousScore
        ? assessment.score - assessment.previousScore
        : null,
      masteryLevel: this.calculateMasteryLevel(assessment),
      strugglingAreas: assessment.strugglingAreas || [],
      strengths: assessment.strengths || [],
      recommendations: assessment.recommendations || [],
      accessibility: AnalyticsTheme.getAccessibilityContext(),
    });
  }

  /**
   * Calculate mastery level from assessment
   */
  static calculateMasteryLevel(assessment) {
    if (!assessment.maxScore || assessment.maxScore === 0) return "unknown";

    const percentage = (assessment.score / assessment.maxScore) * 100;

    if (percentage >= ANALYTICS_CONSTANTS.EDUCATION.EXPERT_THRESHOLD)
      return "expert";
    if (percentage >= ANALYTICS_CONSTANTS.EDUCATION.PROFICIENT_THRESHOLD)
      return "proficient";
    if (percentage >= ANALYTICS_CONSTANTS.EDUCATION.DEVELOPING_THRESHOLD)
      return "developing";
    if (percentage >= ANALYTICS_CONSTANTS.EDUCATION.BEGINNING_THRESHOLD)
      return "beginning";
    return "needs_support";
  } // Enhanced data processing methods
  /**
   * Enhanced anonymization with improved privacy protection
   */
  static async anonymizeEventData(data) {
    if (!data || typeof data !== "object") return data;

    const anonymized = { ...data };

    // Remove or hash potentially identifying information
    const sensitiveFields = [
      "email",
      "name",
      "userId",
      "ipAddress",
      "deviceId",
      "studentId",
    ];
    for (const field of sensitiveFields) {
      if (anonymized[field]) {
        anonymized[field] = await this.hashValue(anonymized[field]);
      }
    }

    // Generalize timestamps to hour precision for privacy
    if (anonymized.timestamp) {
      anonymized.timestamp =
        Math.floor(
          anonymized.timestamp / ANALYTICS_CONSTANTS.TIME.MILLISECONDS_PER_HOUR,
        ) * ANALYTICS_CONSTANTS.TIME.MILLISECONDS_PER_HOUR;
    }

    // Anonymize nested objects
    for (const [key, value] of Object.entries(anonymized)) {
      if (value && typeof value === "object" && !Array.isArray(value)) {
        anonymized[key] = await this.anonymizeEventData(value);
      }
    }

    // Remove high-precision location data
    if (anonymized.geolocation) {
      delete anonymized.geolocation;
    }

    // Generalize screen resolution for privacy
    if (anonymized.screenResolution) {
      anonymized.screenResolution = this.generalizeResolution(
        anonymized.screenResolution,
      );
    }

    return anonymized;
  }

  /**
   * Generalize screen resolution for privacy
   */
  static generalizeResolution(resolution) {
    if (!resolution || typeof resolution !== "string") return "unknown";

    const [width] = resolution.split("x").map(Number);

    if (width >= ANALYTICS_CONSTANTS.SCREEN.RESOLUTION_4K) return "4K+";
    if (width >= ANALYTICS_CONSTANTS.SCREEN.RESOLUTION_2K) return "2K+";
    if (width >= ANALYTICS_CONSTANTS.SCREEN.RESOLUTION_FHD) return "FHD";
    if (width >= ANALYTICS_CONSTANTS.SCREEN.RESOLUTION_HD_PLUS) return "HD+";
    if (width >= ANALYTICS_CONSTANTS.SCREEN.RESOLUTION_HD) return "HD";
    return "SD";
  }

  /**
   * Enhanced hash function with salt for better privacy
   */
  static async hashValue(value) {
    if (!value) return null;

    try {
      const encoder = new TextEncoder();
      const data = encoder.encode(
        value + ANALYTICS_CONSTANTS.ANONYMIZATION_SALT,
      );
      const hashBuffer = await crypto.subtle.digest("SHA-256", data);
      const hashArray = Array.from(new Uint8Array(hashBuffer));
      return hashArray
        .map((b) =>
          b
            .toString(ANALYTICS_CONSTANTS.HASH.HEX_RADIX)
            .padStart(
              ANALYTICS_CONSTANTS.HASH.HEX_PAD_LENGTH,
              ANALYTICS_CONSTANTS.HASH.HEX_PAD_CHAR,
            ),
        )
        .join("")
        .substring(0, ANALYTICS_CONSTANTS.HASH.HASH_SUBSTRING_LENGTH);
    } catch (error) {
      // Fallback to simple hash for older browsers
      let hash = 0;
      const str = String(value) + ANALYTICS_CONSTANTS.ANONYMIZATION_SALT;
      for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = (hash << ANALYTICS_CONSTANTS.HASH.HASH_SHIFT_BITS) - hash + char;
        hash = hash & hash; // Convert to 32-bit integer
      }
      return Math.abs(hash)
        .toString(ANALYTICS_CONSTANTS.HASH.FALLBACK_RADIX)
        .substring(0, ANALYTICS_CONSTANTS.HASH.HASH_SUBSTRING_LENGTH);
    }
  } // Enhanced data transmission with retry logic and optimization
  /**
   * Enhanced flush with intelligent batching and retry logic
   */
  static async flush() {
    if (this.eventQueue.length === 0) return;

    const events = [...this.eventQueue];
    this.eventQueue = [];

    try {
      if (this.config.endpoint && this.isOnline) {
        await this.sendToEndpoint(events);
      } else {
        await this.storeLocally(events);

        if (!this.isOnline) {
          this.addToRetryQueue(events);
        }
      }

      this.dispatchEvent(ANALYTICS_EVENTS.BATCH_SENT, {
        eventCount: events.length,
        method: this.config.endpoint && this.isOnline ? "endpoint" : "local",
      });
    } catch (error) {
      // Re-queue events on failure
      this.eventQueue.unshift(...events);
      this.addToRetryQueue(events);

      if (this.config.debug) {
        logger.error("Failed to flush analytics events:", error);
      }

      this.trackError(error, {
        context: "analytics_flush",
        eventCount: events.length,
      });
    }
  }

  /**
   * Add events to retry queue for later transmission
   */
  static addToRetryQueue(events) {
    this.retryQueue.push(...events);

    // Limit retry queue size
    if (this.retryQueue.length > ANALYTICS_CONSTANTS.MAX_STORED_EVENTS) {
      this.retryQueue = this.retryQueue.slice(
        -ANALYTICS_CONSTANTS.MAX_STORED_EVENTS,
      );
    }
  }

  /**
   * Process retry queue when connection is restored
   */
  static async processRetryQueue() {
    if (this.retryQueue.length === 0 || !this.isOnline || !this.config.endpoint)
      return;

    const events = [...this.retryQueue];
    this.retryQueue = [];

    try {
      await this.sendToEndpoint(events);

      if (this.config.debug) {
        logger.debug(`Successfully sent ${events.length} queued events`);
      }
    } catch (error) {
      // Re-queue failed events
      this.retryQueue.unshift(...events);

      if (this.config.debug) {
        logger.warn("Failed to send queued events:", error);
      }
    }
  }

  /**
   * Enhanced endpoint transmission with compression and authentication
   */
  static async sendToEndpoint(events) {
    if (!this.config.endpoint || events.length === 0) return;

    try {
      // Prepare payload with metadata
      const payload = {
        events,
        metadata: {
          sessionId: this.sessionData.sessionId,
          timestamp: Date.now(),
          version: ANALYTICS_CONSTANTS.VERSION,
          userAgent: navigator.userAgent.substring(0, 100),
          batchSize: events.length,
          compressed: false,
        },
      };

      // Compress large payloads
      let body = JSON.stringify(payload);
      if (
        body.length > ANALYTICS_CONSTANTS.NETWORK.COMPRESSION_THRESHOLD &&
        "CompressionStream" in window
      ) {
        body = await this.compressData(body);
        payload.metadata.compressed = true;
      }

      const headers = {
        "Content-Type": "application/json",
        "X-Analytics-Version": ANALYTICS_CONSTANTS.VERSION,
        "X-Session-ID": this.sessionData.sessionId,
      };

      // Add authentication if available
      if (this.config.apiKey) {
        headers["Authorization"] = `Bearer ${this.config.apiKey}`;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(
        () => controller.abort(),
        ANALYTICS_CONSTANTS.NETWORK.REQUEST_TIMEOUT,
      ); // 30 second timeout

      const response = await fetch(this.config.endpoint, {
        method: "POST",
        headers,
        body,
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Process response if it contains instructions
      const responseData = await response.json().catch(() => ({}));
      if (responseData.instructions) {
        this.processServerInstructions(responseData.instructions);
      }

      if (this.config.debug) {
        logger.debug(`Sent ${events.length} events to analytics endpoint`);
      }
    } catch (error) {
      if (error.name === "AbortError") {
        throw new Error("Request timeout");
      }
      throw error;
    }
  }

  /**
   * Compress data for transmission
   */
  static async compressData(data) {
    try {
      const stream = new CompressionStream("gzip");
      const writer = stream.writable.getWriter();
      const reader = stream.readable.getReader();

      writer.write(new TextEncoder().encode(data));
      writer.close();

      const chunks = [];
      let done = false;

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        if (value) chunks.push(value);
      }

      return new Uint8Array(
        chunks.reduce((acc, chunk) => [...acc, ...chunk], []),
      );
    } catch (error) {
      // Fallback to uncompressed data
      return data;
    }
  }

  /**
   * Process server instructions for configuration updates
   */
  static processServerInstructions(instructions) {
    if (instructions.updateConfig) {
      const allowedUpdates = ["flushInterval", "batchSize", "debug"];
      Object.entries(instructions.updateConfig).forEach(([key, value]) => {
        if (allowedUpdates.includes(key)) {
          this.config[key] = value;
        }
      });
    }

    if (instructions.disableTracking) {
      this.setEnabled(false);
    }

    if (instructions.requestConsent) {
      this.requestConsentRenewal();
    }
  }

  /**
   * Enhanced local storage with intelligent management
   */
  static async storeLocally(events) {
    try {
      const existingEvents = await StorageManager.get("analytics_batch", []);
      const allEvents = [...existingEvents, ...events];

      // Intelligent cleanup based on age and importance
      const cleanedEvents = this.cleanupLocalEvents(allEvents);

      await StorageManager.set("analytics_batch", cleanedEvents);

      if (this.config.debug) {
        logger.debug(
          `Stored ${events.length} events locally (total: ${cleanedEvents.length})`,
        );
      }
    } catch (error) {
      if (this.config.debug) {
        logger.warn("Failed to store events locally:", error);
      }
      throw error;
    }
  }

  /**
   * Cleanup local events with intelligent retention
   */
  static cleanupLocalEvents(events) {
    if (events.length <= ANALYTICS_CONSTANTS.MAX_STORED_EVENTS) {
      return events;
    }

    // Sort by importance and recency
    const sortedEvents = events.sort((a, b) => {
      // Critical events (errors, session events) have higher priority
      const aImportant = ["error", "session_start", "session_end"].includes(
        a.name,
      );
      const bImportant = ["error", "session_start", "session_end"].includes(
        b.name,
      );

      if (aImportant && !bImportant) return -1;
      if (!aImportant && bImportant) return 1;

      // Then sort by timestamp (newer first)
      return b.timestamp - a.timestamp;
    });

    return sortedEvents.slice(0, ANALYTICS_CONSTANTS.MAX_STORED_EVENTS);
  } // Enhanced analytics insights with machine learning potential
  /**
   * Generate comprehensive analytics insights with predictive capabilities
   */
  static async generateInsights() {
    try {
      const events = await StorageManager.get("analytics_batch", []);
      const decisions = (await StorageManager.getDecisions?.()) || [];
      const performanceMetrics = AnalyticsPerformance.getMetrics();

      const insights = {
        metadata: {
          generatedAt: new Date().toISOString(),
          version: ANALYTICS_CONSTANTS.VERSION,
          totalEvents: events.length,
          dateRange: this.getDateRange(events),
          theme: AnalyticsTheme.getCurrentTheme(),
        },

        // Session analytics
        sessions: this.analyzeSessionData(events),

        // User engagement metrics
        engagement: this.analyzeEngagement(events),

        // Learning analytics
        learning: this.analyzeLearningProgress(events, decisions),

        // Accessibility insights
        accessibility: this.analyzeAccessibilityUsage(events),

        // Performance insights
        performance: this.analyzePerformanceMetrics(events, performanceMetrics),

        // Error analysis
        errors: this.analyzeErrors(events),

        // Predictive insights
        predictions: this.generatePredictiveInsights(events, decisions),

        // Educational outcomes
        educational: this.analyzeEducationalOutcomes(events),

        // Theme and preference patterns
        preferences: this.analyzeUserPreferences(events),
      };

      return insights;
    } catch (error) {
      if (this.config.debug) {
        logger.error("Failed to generate insights:", error);
      }
      return { error: "Failed to generate insights", timestamp: Date.now() };
    }
  }

  /**
   * Get date range from events
   */
  static getDateRange(events) {
    if (events.length === 0) return null;

    const timestamps = events.map((e) => e.timestamp).filter(Boolean);
    return {
      start: new Date(Math.min(...timestamps)).toISOString(),
      end: new Date(Math.max(...timestamps)).toISOString(),
      span: Math.max(...timestamps) - Math.min(...timestamps),
    };
  }

  /**
   * Analyze session data with advanced metrics
   */
  static analyzeSessionData(events) {
    const sessions = new Map();

    events.forEach((event) => {
      if (!sessions.has(event.sessionId)) {
        sessions.set(event.sessionId, {
          id: event.sessionId,
          start: event.timestamp,
          end: event.timestamp,
          events: [],
          theme: event.theme,
          accessibility: event.data?.accessibility,
        });
      }

      const session = sessions.get(event.sessionId);
      session.end = Math.max(session.end, event.timestamp);
      session.events.push(event);
    });

    const sessionArray = Array.from(sessions.values());
    const durations = sessionArray.map((s) => s.end - s.start);

    return {
      totalSessions: sessionArray.length,
      avgDuration:
        durations.length > 0
          ? durations.reduce((a, b) => a + b, 0) / durations.length
          : 0,
      medianDuration: this.calculateMedian(durations),
      shortSessions: durations.filter(
        (d) => d < ANALYTICS_CONSTANTS.SESSION.SHORT_SESSION_THRESHOLD,
      ).length, // < 1 minute
      mediumSessions: durations.filter(
        (d) =>
          d >= ANALYTICS_CONSTANTS.SESSION.SHORT_SESSION_THRESHOLD &&
          d < ANALYTICS_CONSTANTS.SESSION.LONG_SESSION_THRESHOLD,
      ).length, // 1-30 minutes
      longSessions: durations.filter(
        (d) => d >= ANALYTICS_CONSTANTS.SESSION.LONG_SESSION_THRESHOLD,
      ).length, // > 30 minutes
      bounceRate: this.calculateBounceRate(sessionArray),
      returningUserRate: this.calculateReturningUserRate(events),
      themeDistribution: this.analyzeThemeDistribution(sessionArray),
      accessibilityUsage: this.calculateAccessibilityUsage(sessionArray),
    };
  }

  /**
   * Calculate median value
   */
  static calculateMedian(values) {
    if (values.length === 0) return 0;

    const sorted = [...values].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);

    return sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid];
  }

  /**
   * Calculate bounce rate (sessions with only 1-2 events)
   */
  static calculateBounceRate(sessions) {
    if (sessions.length === 0) return 0;

    const bounces = sessions.filter((s) => s.events.length <= 2).length;
    return (bounces / sessions.length) * 100;
  }

  /**
   * Calculate returning user rate
   */
  static calculateReturningUserRate(events) {
    const sessionStarts = events.filter((e) => e.name === "session_start");
    const returningUsers = sessionStarts.filter(
      (e) => e.data?.returningUser === true,
    ).length;

    return sessionStarts.length > 0
      ? (returningUsers / sessionStarts.length) * 100
      : 0;
  }

  /**
   * Analyze engagement patterns
   */
  static analyzeEngagement(events) {
    const interactions = events.filter((e) => e.name === "user_interaction");

    return {
      totalInteractions: interactions.length,
      interactionTypes: this.groupBy(interactions, (e) => e.data?.type),
      simulationEngagement: {
        started: events.filter((e) => e.name === "simulation_start").length,
        completed: events.filter((e) => e.name === "simulation_complete")
          .length,
        abandoned: this.calculateAbandonmentRate(events),
      },
      avgInteractionsPerSession:
        this.calculateAvgInteractionsPerSession(events),
      timeToFirstInteraction: this.calculateTimeToFirstInteraction(events),
      engagementScore: this.calculateEngagementScore(events),
    };
  }

  /**
   * Group array by key function
   */
  static groupBy(array, keyFn) {
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      groups[key] = (groups[key] || 0) + 1;
      return groups;
    }, {});
  }

  /**
   * Calculate simulation abandonment rate
   */
  static calculateAbandonmentRate(events) {
    const started = events.filter((e) => e.name === "simulation_start").length;
    const completed = events.filter(
      (e) => e.name === "simulation_complete",
    ).length;

    return started > 0 ? ((started - completed) / started) * 100 : 0;
  }

  /**
   * Calculate average interactions per session
   */
  static calculateAvgInteractionsPerSession(events) {
    const sessionInteractions = new Map();

    events.forEach((event) => {
      if (event.name === "user_interaction") {
        const count = sessionInteractions.get(event.sessionId) || 0;
        sessionInteractions.set(event.sessionId, count + 1);
      }
    });

    const counts = Array.from(sessionInteractions.values());
    return counts.length > 0
      ? counts.reduce((a, b) => a + b, 0) / counts.length
      : 0;
  }

  /**
   * Calculate time to first interaction
   */
  static calculateTimeToFirstInteraction(events) {
    const sessions = this.groupBy(events, (e) => e.sessionId);
    const times = [];

    Object.values(sessions).forEach((sessionEvents) => {
      const sessionStart = sessionEvents.find(
        (e) => e.name === "session_start",
      );
      const firstInteraction = sessionEvents.find(
        (e) => e.name === "user_interaction",
      );

      if (sessionStart && firstInteraction) {
        times.push(firstInteraction.timestamp - sessionStart.timestamp);
      }
    });

    return times.length > 0
      ? times.reduce((a, b) => a + b, 0) / times.length
      : 0;
  }

  /**
   * Calculate overall engagement score
   */
  static calculateEngagementScore(events) {
    let score = 0;

    // Base score from interactions
    score += events.filter((e) => e.name === "user_interaction").length * 2;

    // Bonus for completed simulations
    score += events.filter((e) => e.name === "simulation_complete").length * 10;

    // Bonus for time spent
    const sessionDurations = new Map();
    events.forEach((event) => {
      if (!sessionDurations.has(event.sessionId)) {
        sessionDurations.set(event.sessionId, {
          start: event.timestamp,
          end: event.timestamp,
        });
      } else {
        sessionDurations.get(event.sessionId).end = Math.max(
          sessionDurations.get(event.sessionId).end,
          event.timestamp,
        );
      }
    });

    const totalTime = Array.from(sessionDurations.values()).reduce(
      (sum, session) => sum + (session.end - session.start),
      0,
    );

    score += Math.floor(
      totalTime / ANALYTICS_CONSTANTS.ANALYTICS.TIME_SCORE_DIVISOR,
    ); // 1 point per minute

    return Math.min(score, 1000); // Cap at 1000
  } /**
   * Analyze learning progress with advanced educational metrics
   */
  static analyzeLearningProgress(events, _decisions) {
    const completions = events.filter((e) => e.name === "simulation_complete");

    return {
      totalCompletions: completions.length,
      avgScore: this.calculateAverageScore(completions),
      improvementTrend: this.calculateImprovementTrend(completions),
      masteryDistribution: this.calculateMasteryDistribution(completions),
      knowledgeGaps: this.analyzeKnowledgeGaps(events),
      learningPaths: this.analyzeLearningPaths(events),
      timeToMastery: this.calculateTimeToMastery(events),
      retentionRate: this.calculateRetentionRate(events),
    };
  }

  /**
   * Calculate average score with confidence intervals
   */
  static calculateAverageScore(completions) {
    if (completions.length === 0) return { average: 0, confidence: "low" };

    const scores = completions
      .map((c) => c.data?.score || 0)
      .filter((s) => s > 0);
    const average = scores.reduce((a, b) => a + b, 0) / scores.length;
    const confidence =
      scores.length >= ANALYTICS_CONSTANTS.ANALYTICS.CONFIDENCE_HIGH_THRESHOLD
        ? "high"
        : scores.length >=
            ANALYTICS_CONSTANTS.ANALYTICS.CONFIDENCE_MEDIUM_THRESHOLD
          ? "medium"
          : "low";

    return { average, confidence, sampleSize: scores.length };
  }

  /**
   * Enhanced improvement trend analysis
   */
  static calculateImprovementTrend(completions) {
    if (completions.length < ANALYTICS_CONSTANTS.ANALYTICS.MIN_DATA_POINTS)
      return { trend: "insufficient_data", slope: 0 };

    const scores = completions
      .map((c) => ({ score: c.data?.score || 0, timestamp: c.timestamp }))
      .filter((s) => s.score > 0)
      .sort((a, b) => a.timestamp - b.timestamp);

    if (scores.length < ANALYTICS_CONSTANTS.ANALYTICS.MIN_DATA_POINTS)
      return { trend: "insufficient_data", slope: 0 };

    // Simple linear regression for trend analysis
    const n = scores.length;
    const sumX = scores.reduce((sum, _, i) => sum + i, 0);
    const sumY = scores.reduce((sum, s) => sum + s.score, 0);
    const sumXY = scores.reduce((sum, s, i) => sum + i * s.score, 0);
    const sumXX = scores.reduce((sum, _, i) => sum + i * i, 0);

    const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);

    let trend = "stable";
    if (slope > ANALYTICS_CONSTANTS.ANALYTICS.TREND_IMPROVEMENT_THRESHOLD)
      trend = "improving";
    else if (slope < ANALYTICS_CONSTANTS.ANALYTICS.TREND_DECLINE_THRESHOLD)
      trend = "declining";

    return { trend, slope, correlation: this.calculateCorrelation(scores) };
  }

  /**
   * Calculate correlation coefficient
   */
  static calculateCorrelation(scores) {
    if (scores.length < 2) return 0;

    const n = scores.length;
    const indices = scores.map((_, i) => i);
    const values = scores.map((s) => s.score);

    const meanX = indices.reduce((a, b) => a + b, 0) / n;
    const meanY = values.reduce((a, b) => a + b, 0) / n;

    const numerator = scores.reduce(
      (sum, s, i) => sum + (i - meanX) * (s.score - meanY),
      0,
    );
    const denomX = Math.sqrt(
      scores.reduce((sum, _, i) => sum + (i - meanX) ** 2, 0),
    );
    const denomY = Math.sqrt(
      scores.reduce((sum, s) => sum + (s.score - meanY) ** 2, 0),
    );

    return denomX * denomY === 0 ? 0 : numerator / (denomX * denomY);
  }

  /**
   * Analyze accessibility usage patterns
   */
  static analyzeAccessibilityUsage(events) {
    const accessibilityEvents = events.filter(
      (e) => e.name === "accessibility_usage",
    );
    const features = this.groupBy(accessibilityEvents, (e) => e.data?.feature);
    const themeChanges = events.filter((e) => e.name === "theme_change");

    return {
      totalUsage: accessibilityEvents.length,
      featureUsage: features,
      themePreferences: this.analyzeThemePreferences(themeChanges),
      screenReaderUsage: accessibilityEvents.filter(
        (e) => e.data?.feature === "screen_reader",
      ).length,
      keyboardNavigation: accessibilityEvents.filter(
        (e) => e.data?.feature === "keyboard_navigation",
      ).length,
      highContrastUsage: themeChanges.filter(
        (e) => e.data?.type === "high_contrast" && e.data?.enabled,
      ).length,
      reducedMotionUsage: themeChanges.filter(
        (e) => e.data?.type === "reduced_motion" && e.data?.enabled,
      ).length,
      accessibilityScore: this.calculateAccessibilityScore(accessibilityEvents),
    };
  }

  /**
   * Analyze theme preferences
   */
  static analyzeThemePreferences(themeChanges) {
    const preferences = {
      light: 0,
      highContrast: 0,
      reducedMotion: 0,
    };

    themeChanges.forEach((event) => {
      const { type, enabled } = event.data || {};
      if (enabled) {
        switch (type) {
          case "high_contrast":
            preferences.highContrast++;
            break;
          case "reduced_motion":
            preferences.reducedMotion++;
            break;
          default:
            preferences.light++;
        }
      }
    });

    return preferences;
  }

  /**
   * Calculate accessibility score
   */
  static calculateAccessibilityScore(accessibilityEvents) {
    if (accessibilityEvents.length === 0) return 0;

    let score = 0;
    const features = new Set();

    accessibilityEvents.forEach((event) => {
      features.add(event.data?.feature);
      score += 10; // Base points for using accessibility features
    });

    // Bonus for feature diversity
    score +=
      features.size *
      ANALYTICS_CONSTANTS.ANALYTICS.ENGAGEMENT_FEATURE_MULTIPLIER;

    return Math.min(score, 100); // Cap at 100
  }

  /**
   * Analyze performance metrics
   */
  static analyzePerformanceMetrics(events, _performanceMetrics) {
    const performanceEvents = events.filter((e) =>
      e.name.startsWith("performance"),
    );
    const errorEvents = events.filter((e) => e.name === "error");

    return {
      totalMetrics: performanceEvents.length,
      errorRate: this.calculateErrorRate(events),
      averageLoadTime: this.calculateAverageLoadTime(performanceEvents),
      memoryUsage: this.analyzeMemoryUsage(events),
      networkPerformance: this.analyzeNetworkPerformance(events),
      performanceScore: this.calculatePerformanceScore(
        performanceEvents,
        errorEvents,
      ),
      recommendations: this.generatePerformanceRecommendations(
        performanceEvents,
        errorEvents,
      ),
    };
  }

  /**
   * Calculate error rate
   */
  static calculateErrorRate(events) {
    const totalEvents = events.length;
    const errorEvents = events.filter((e) => e.name === "error").length;
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
  }

  /**
   * Analyze errors with categorization
   */
  static analyzeErrors(events) {
    const errorEvents = events.filter((e) => e.name === "error");

    return {
      totalErrors: errorEvents.length,
      errorTypes: this.groupBy(errorEvents, (e) => e.data?.type || "unknown"),
      errorsByContext: this.groupBy(
        errorEvents,
        (e) => e.data?.context || "unknown",
      ),
      criticalErrors: errorEvents.filter(
        (e) => e.data?.userImpact === "critical",
      ).length,
      recurringErrors: this.findRecurringErrors(errorEvents),
      errorTrend: this.calculateErrorTrend(errorEvents),
      resolution: this.analyzeErrorResolution(errorEvents),
    };
  }

  /**
   * Generate predictive insights
   */
  static generatePredictiveInsights(events, decisions) {
    return {
      learningTrajectory: this.predictLearningTrajectory(events),
      riskFactors: this.identifyRiskFactors(events),
      recommendations: this.generateRecommendations(events, decisions),
      nextBestAction: this.suggestNextBestAction(events),
      completionProbability: this.calculateCompletionProbability(events),
    };
  }

  /**
   * Analyze educational outcomes
   */
  static analyzeEducationalOutcomes(events) {
    const outcomes = events.filter((e) => e.name === "educational_outcome");

    return {
      totalAssessments: outcomes.length,
      averagePerformance: this.calculateAveragePerformance(outcomes),
      masteryLevels: this.groupBy(outcomes, (e) => e.data?.masteryLevel),
      topicPerformance: this.analyzeTopicPerformance(outcomes),
      improvementAreas: this.identifyImprovementAreas(outcomes),
      strengths: this.identifyStrengths(outcomes),
    };
  }

  /**
   * Analyze user preferences
   */
  static analyzeUserPreferences(events) {
    return {
      themeUsage: this.analyzeThemeDistribution(events),
      interactionPatterns: this.analyzeInteractionPatterns(events),
      featureUsage: this.analyzeFeatureUsage(events),
      contentPreferences: this.analyzeContentPreferences(events),
    };
  } // Enhanced utility methods
  /**
   * Check if user is returning with more sophisticated logic
   */
  static async isReturningUser() {
    try {
      const completions =
        (await StorageManager.getCompletedSimulations?.()) || [];
      const previousSessions = await StorageManager.get(
        "analytics_sessions",
        [],
      );
      const lastVisit = await StorageManager.get("last_visit_timestamp", 0);

      const isReturning =
        completions.length > 0 ||
        previousSessions.length > 0 ||
        Date.now() - lastVisit >
          ANALYTICS_CONSTANTS.TIME.HOURS_PER_DAY *
            ANALYTICS_CONSTANTS.TIME.MINUTES_PER_HOUR *
            ANALYTICS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
            ANALYTICS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND; // 24 hours

      // Update last visit
      await StorageManager.set("last_visit_timestamp", Date.now());

      return isReturning;
    } catch (error) {
      return false;
    }
  }

  /**
   * End session with comprehensive cleanup
   */
  static async endSession() {
    try {
      const sessionDuration = Date.now() - this.sessionData.startTime;

      await this.trackEvent(
        "session_end",
        {
          duration: sessionDuration,
          eventCount: this.eventQueue.length,
          theme: AnalyticsTheme.getCurrentTheme(),
          finalUrl: window.location.pathname,
        },
        true,
      );

      // Store session metadata
      const sessions = await StorageManager.get("analytics_sessions", []);
      sessions.push({
        id: this.sessionData.sessionId,
        start: this.sessionData.startTime,
        end: Date.now(),
        duration: sessionDuration,
        eventCount: this.eventQueue.length,
      });

      // Keep only recent sessions
      const recentSessions = sessions.slice(
        -ANALYTICS_CONSTANTS.ANALYTICS.RECENT_SESSIONS_COUNT,
      );
      await StorageManager.set("analytics_sessions", recentSessions);

      await this.flush();

      this.dispatchEvent(ANALYTICS_EVENTS.SESSION_ENDED, {
        sessionId: this.sessionData.sessionId,
        duration: sessionDuration,
      });
    } catch (error) {
      if (this.config.debug) {
        logger.error("Failed to end session:", error);
      }
    }
  }

  /**
   * Enhanced enable/disable with privacy compliance
   */
  static async setEnabled(enabled) {
    const wasEnabled = this.config.enabled;
    this.config.enabled = enabled;

    try {
      // Update user preferences
      const preferences = await StorageManager.getUserPreferences();
      preferences.analytics = {
        ...preferences.analytics,
        allowTracking: enabled,
        lastConsentCheck: Date.now(),
        explicitConsent: enabled,
      };
      await StorageManager.saveUserPreferences(preferences);

      if (enabled && !wasEnabled) {
        if (!this.isInitialized) {
          await this.init();
        } else {
          this.setupEventListeners();
          this.startFlushTimer();
        }

        this.trackEvent("analytics_enabled", {
          previousState: wasEnabled,
          consentMethod: "user_action",
        });
      } else if (!enabled && wasEnabled) {
        await this.clearData();

        this.trackEvent(
          "analytics_disabled",
          {
            previousState: wasEnabled,
            reason: "user_request",
          },
          true,
        );

        await this.flush(); // Final flush before disabling
      }

      this.dispatchEvent(ANALYTICS_EVENTS.PRIVACY_CHANGED, {
        enabled,
        previousState: wasEnabled,
      });
    } catch (error) {
      if (this.config.debug) {
        logger.error("Failed to update analytics state:", error);
      }
    }
  }

  /**
   * Enhanced data clearing with secure deletion
   */
  static async clearData() {
    try {
      this.eventQueue = [];
      this.retryQueue = [];

      // Clear stored data
      await StorageManager.remove?.("analytics_batch");
      await StorageManager.remove?.("analytics_sessions");
      await StorageManager.remove?.("last_visit_timestamp");

      // Stop timers and observers
      if (this.flushTimer) {
        clearInterval(this.flushTimer);
        this.flushTimer = null;
      }

      // Cleanup performance tracking
      AnalyticsPerformance.cleanup();

      // Cleanup theme observers
      if (this.themeObserver) {
        Object.values(this.themeObserver).forEach((observer) => {
          if (observer && observer.removeEventListener) {
            observer.removeEventListener("change", () => {});
          }
        });
        this.themeObserver = null;
      }

      if (this.config.debug) {
        logger.debug("Analytics data cleared successfully");
      }
    } catch (error) {
      if (this.config.debug) {
        logger.error("Failed to clear analytics data:", error);
      }
    }
  }

  /**
   * Export analytics data with privacy controls
   */
  static async exportAnalytics() {
    try {
      const insights = await this.generateInsights();
      const events = await StorageManager.get("analytics_batch", []);

      const exportData = {
        metadata: {
          exportedAt: new Date().toISOString(),
          version: ANALYTICS_CONSTANTS.VERSION,
          anonymized: this.config.anonymizeData,
          gdprCompliant: this.config.gdprCompliant,
          retentionDays: this.config.retentionDays,
        },
        insights,
        events: this.config.anonymizeData
          ? await Promise.all(events.map((e) => this.anonymizeEventData(e)))
          : events,
        summary: {
          totalEvents: events.length,
          dateRange: insights.metadata?.dateRange,
          sessions: insights.sessions?.totalSessions || 0,
          learningProgress: insights.learning?.totalCompletions || 0,
        },
      };

      return exportData;
    } catch (error) {
      if (this.config.debug) {
        logger.error("Failed to export analytics:", error);
      }
      return {
        error: "Export failed",
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Get analytics status and health
   */
  static getStatus() {
    return {
      initialized: this.isInitialized,
      enabled: this.config.enabled,
      queueSize: this.eventQueue.length,
      retryQueueSize: this.retryQueue.length,
      isOnline: this.isOnline,
      hasEndpoint: !!this.config.endpoint,
      sessionId: this.sessionData.sessionId,
      theme: AnalyticsTheme.getCurrentTheme(),
      config: {
        anonymizeData: this.config.anonymizeData,
        gdprCompliant: this.config.gdprCompliant,
        trackPerformance: this.config.trackPerformance,
        trackAccessibility: this.config.trackAccessibility,
        trackErrors: this.config.trackErrors,
      },
    };
  }

  /**
   * Update configuration dynamically
   */
  static updateConfig(newConfig) {
    const allowedUpdates = [
      "batchSize",
      "flushInterval",
      "debug",
      "trackPerformance",
      "trackAccessibility",
      "trackErrors",
      "endpoint",
      "apiKey",
    ];

    Object.entries(newConfig).forEach(([key, value]) => {
      if (allowedUpdates.includes(key)) {
        this.config[key] = value;
      }
    });

    // Restart timer if interval changed
    if (newConfig.flushInterval && this.flushTimer) {
      this.startFlushTimer();
    }

    if (this.config.debug) {
      logger.debug("Analytics configuration updated:", newConfig);
    }
  }

  /**
   * Manual flush for critical events
   */
  static async forceFlush() {
    try {
      await this.flush();
      if (this.retryQueue.length > 0 && this.isOnline) {
        await this.processRetryQueue();
      }
    } catch (error) {
      if (this.config.debug) {
        logger.error("Force flush failed:", error);
      }
    }
  }

  /**
   * Get memory usage statistics
   */
  static getMemoryStats() {
    return {
      eventQueueSize: this.eventQueue.length,
      retryQueueSize: this.retryQueue.length,
      estimatedMemoryUsage: this.estimateMemoryUsage(),
      performanceMetrics: AnalyticsPerformance.metrics.size,
      jsHeapSize: performance.memory
        ? {
            used: Math.round(
              performance.memory.usedJSHeapSize /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
            total: Math.round(
              performance.memory.totalJSHeapSize /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
            limit: Math.round(
              performance.memory.jsHeapSizeLimit /
                ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB /
                ANALYTICS_CONSTANTS.MEMORY.KB_PER_MB,
            ),
          }
        : null,
    };
  }

  /**
   * Estimate memory usage of analytics system
   */
  static estimateMemoryUsage() {
    const eventSize = JSON.stringify(this.eventQueue[0] || {}).length;
    const queueMemory = this.eventQueue.length * eventSize;
    const retryMemory = this.retryQueue.length * eventSize;

    return Math.round(
      (queueMemory + retryMemory) / ANALYTICS_CONSTANTS.MEMORY.BYTES_PER_KB,
    ); // KB
  }

  // Helper methods for complex analytics (simplified implementations)
  static analyzeThemeDistribution(_data) {
    return {};
  }
  static calculateAccessibilityUsage(_data) {
    return 0;
  }
  static calculateMasteryDistribution(_data) {
    return {};
  }
  static analyzeKnowledgeGaps(_data) {
    return [];
  }
  static analyzeLearningPaths(_data) {
    return {};
  }
  static calculateTimeToMastery(_data) {
    return 0;
  }
  static calculateRetentionRate(_data) {
    return 0;
  }
  static calculateAverageLoadTime(_data) {
    return 0;
  }
  static analyzeMemoryUsage(_data) {
    return {};
  }
  static analyzeNetworkPerformance(_data) {
    return {};
  }
  static calculatePerformanceScore(_data1, _data2) {
    return 0;
  }
  static generatePerformanceRecommendations(_data1, _data2) {
    return [];
  }
  static findRecurringErrors(_data) {
    return [];
  }
  static calculateErrorTrend(_data) {
    return "stable";
  }
  static analyzeErrorResolution(_data) {
    return {};
  }
  static predictLearningTrajectory(_data) {
    return {};
  }
  static identifyRiskFactors(_data) {
    return [];
  }
  static generateRecommendations(_data1, _data2) {
    return [];
  }
  static suggestNextBestAction(_data) {
    return null;
  }
  static calculateCompletionProbability(_data) {
    return 0;
  }
  static calculateAveragePerformance(_data) {
    return 0;
  }
  static analyzeTopicPerformance(_data) {
    return {};
  }
  static identifyImprovementAreas(_data) {
    return [];
  }
  static identifyStrengths(_data) {
    return [];
  }
  static analyzeInteractionPatterns(_data) {
    return {};
  }
  static analyzeFeatureUsage(_data) {
    return {};
  }
  static analyzeContentPreferences(_data) {
    return {};
  }
}

// Enhanced initialization with error handling
if (typeof window !== "undefined") {
  // Wait for DOM to be ready
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", () => {
      AnalyticsManager.init().catch((error) => {
        logger.warn("Analytics initialization failed:", error);
      });
    });
  } else {
    // Initialize immediately if DOM is ready
    AnalyticsManager.init().catch((error) => {
      logger.warn("Analytics initialization failed:", error);
    });
  }

  // Global error handler for unhandled analytics errors
  window.addEventListener("error", (event) => {
    if (event.filename && event.filename.includes("analytics")) {
      logger.warn("Analytics module error:", event.error);
    }
  });
}

// Export for ES6 modules
export default AnalyticsManager;
