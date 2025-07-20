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
 * Enhanced Helper Utilities for SimulateAI Platform
 * Comprehensive utility functions for modern web applications
 * ENTERPRISE ENHANCED with monitoring, health checks, and performance analytics
 *
 * Features:
 * - Mathematical and statistical operations
 * - Advanced array and string manipulation
 * - Theme and accessibility integration
 * - Performance optimization utilities
 * - Privacy and security helpers
 * - Educational analytics support
 * - Cross-browser compatibility
 * - Memory management utilities
 * - Advanced validation and sanitization
 *
 * Enterprise Features:
 * - Comprehensive health monitoring and performance tracking
 * - Circuit breaker patterns for utility operation reliability
 * - Operation analytics and telemetry batching
 * - Static enterprise methods for fleet management
 * - Memory usage monitoring and optimization
 * - Global debug functions for enterprise monitoring
 *
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from "./logger.js";
import { COMMON } from "./constants.js";

// Enterprise Configuration Constants
const ENTERPRISE_HELPERS = {
  HEALTH: {
    CHECK_INTERVAL: 30000,
    MAX_OPERATION_TIME: 5000,
    MEMORY_THRESHOLD: 100 * 1024 * 1024, // 100MB
    ERROR_THRESHOLD: 0.05, // 5% error rate
    WARNING_THRESHOLD: 0.02, // 2% warning rate
  },
  PERFORMANCE: {
    SLOW_OPERATION_THRESHOLD: 1000,
    BATCH_SIZE: 50,
    CACHE_SIZE: 1000,
    TELEMETRY_INTERVAL: 60000,
  },
  CIRCUIT_BREAKER: {
    FAILURE_THRESHOLD: 5,
    RECOVERY_TIMEOUT: 30000,
    HALF_OPEN_MAX_CALLS: 3,
  },
  MONITORING: {
    OPERATION_HISTORY_SIZE: 1000,
    PERFORMANCE_SAMPLE_SIZE: 100,
    HEALTH_REPORT_INTERVAL: 120000,
  },
};

// Enterprise Monitoring Infrastructure
class EnterpriseHelpersMonitor {
  constructor() {
    this.instances = new Set();
    this.operationHistory = [];
    this.performanceMetrics = {
      operationCount: 0,
      totalExecutionTime: 0,
      errorCount: 0,
      warningCount: 0,
      slowOperations: 0,
      memoryUsage: 0,
      lastHealthCheck: Date.now(),
    };
    this.circuitBreaker = {
      state: "CLOSED", // CLOSED, OPEN, HALF_OPEN
      failures: 0,
      lastFailure: null,
      nextRetry: null,
    };
    this.telemetryBatch = [];
    this.healthCheckInterval = null;
    this.initializeMonitoring();
  }

  initializeMonitoring() {
    this.healthCheckInterval = setInterval(() => {
      this.performHealthCheck();
    }, ENTERPRISE_HELPERS.HEALTH.CHECK_INTERVAL);

    setInterval(() => {
      this.batchTelemetry();
    }, ENTERPRISE_HELPERS.PERFORMANCE.TELEMETRY_INTERVAL);

    this.logSystemInfo("Enterprise Helpers Monitor initialized");
  }

  registerInstance(instance) {
    this.instances.add(instance);
    this.logSystemInfo(
      `Helper instance registered. Total instances: ${this.instances.size}`,
    );
  }

  unregisterInstance(instance) {
    this.instances.delete(instance);
    this.logSystemInfo(
      `Helper instance unregistered. Total instances: ${this.instances.size}`,
    );
  }

  recordOperation(operationType, executionTime, success = true, metadata = {}) {
    const operation = {
      type: operationType,
      timestamp: Date.now(),
      executionTime,
      success,
      metadata,
      memoryUsage: this.getMemoryUsage(),
    };

    this.operationHistory.push(operation);
    if (
      this.operationHistory.length >
      ENTERPRISE_HELPERS.MONITORING.OPERATION_HISTORY_SIZE
    ) {
      this.operationHistory.shift();
    }

    this.updatePerformanceMetrics(operation);
    this.checkCircuitBreaker(success, executionTime);
  }

  updatePerformanceMetrics(operation) {
    this.performanceMetrics.operationCount++;
    this.performanceMetrics.totalExecutionTime += operation.executionTime;
    this.performanceMetrics.memoryUsage = operation.memoryUsage;

    if (!operation.success) {
      this.performanceMetrics.errorCount++;
    }

    if (
      operation.executionTime >
      ENTERPRISE_HELPERS.PERFORMANCE.SLOW_OPERATION_THRESHOLD
    ) {
      this.performanceMetrics.slowOperations++;
    }
  }

  checkCircuitBreaker(success, executionTime) {
    if (
      !success ||
      executionTime > ENTERPRISE_HELPERS.HEALTH.MAX_OPERATION_TIME
    ) {
      this.circuitBreaker.failures++;
      this.circuitBreaker.lastFailure = Date.now();

      if (
        this.circuitBreaker.failures >=
        ENTERPRISE_HELPERS.CIRCUIT_BREAKER.FAILURE_THRESHOLD
      ) {
        this.circuitBreaker.state = "OPEN";
        this.circuitBreaker.nextRetry =
          Date.now() + ENTERPRISE_HELPERS.CIRCUIT_BREAKER.RECOVERY_TIMEOUT;
        logger.warn("Helper circuit breaker opened due to failures", {
          failures: this.circuitBreaker.failures,
          component: "EnterpriseHelpersMonitor",
        });
      }
    } else if (this.circuitBreaker.state === "HALF_OPEN") {
      this.circuitBreaker.state = "CLOSED";
      this.circuitBreaker.failures = 0;
      logger.info("Helper circuit breaker closed - recovery successful");
    }
  }

  performHealthCheck() {
    const now = Date.now();
    const health = {
      timestamp: now,
      instances: this.instances.size,
      operationCount: this.performanceMetrics.operationCount,
      errorRate: this.calculateErrorRate(),
      averageExecutionTime: this.calculateAverageExecutionTime(),
      memoryUsage: this.getMemoryUsage(),
      circuitBreakerState: this.circuitBreaker.state,
      status: "healthy",
    };

    // Determine health status
    if (health.errorRate > ENTERPRISE_HELPERS.HEALTH.ERROR_THRESHOLD) {
      health.status = "unhealthy";
      health.reason = "High error rate";
    } else if (
      health.memoryUsage > ENTERPRISE_HELPERS.HEALTH.MEMORY_THRESHOLD
    ) {
      health.status = "warning";
      health.reason = "High memory usage";
    } else if (health.errorRate > ENTERPRISE_HELPERS.HEALTH.WARNING_THRESHOLD) {
      health.status = "warning";
      health.reason = "Elevated error rate";
    }

    this.performanceMetrics.lastHealthCheck = now;
    this.addToTelemetryBatch("health_check", health);

    if (health.status !== "healthy") {
      logger.warn("Helper health check warning", health);
    }

    return health;
  }

  calculateErrorRate() {
    if (this.performanceMetrics.operationCount === 0) return 0;
    return (
      this.performanceMetrics.errorCount /
      this.performanceMetrics.operationCount
    );
  }

  calculateAverageExecutionTime() {
    if (this.performanceMetrics.operationCount === 0) return 0;
    return (
      this.performanceMetrics.totalExecutionTime /
      this.performanceMetrics.operationCount
    );
  }

  getMemoryUsage() {
    if (
      typeof window !== "undefined" &&
      window.performance &&
      window.performance.memory
    ) {
      return window.performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  addToTelemetryBatch(type, data) {
    this.telemetryBatch.push({
      type,
      timestamp: Date.now(),
      data,
    });
  }

  batchTelemetry() {
    if (this.telemetryBatch.length > 0) {
      logger.info("Helper telemetry batch", {
        batchSize: this.telemetryBatch.length,
        metrics: this.performanceMetrics,
        component: "EnterpriseHelpersMonitor",
      });
      this.telemetryBatch = [];
    }
  }

  logSystemInfo(message, data = {}) {
    logger.info(message, {
      ...data,
      component: "EnterpriseHelpersMonitor",
      timestamp: new Date().toISOString(),
    });
  }

  // Static methods for enterprise management
  static getGlobalStats() {
    if (!window.enterpriseHelpersMonitor) return null;
    return {
      instances: window.enterpriseHelpersMonitor.instances.size,
      metrics: { ...window.enterpriseHelpersMonitor.performanceMetrics },
      circuitBreaker: { ...window.enterpriseHelpersMonitor.circuitBreaker },
      health: window.enterpriseHelpersMonitor.performHealthCheck(),
    };
  }

  static resetMetrics() {
    if (window.enterpriseHelpersMonitor) {
      window.enterpriseHelpersMonitor.performanceMetrics = {
        operationCount: 0,
        totalExecutionTime: 0,
        errorCount: 0,
        warningCount: 0,
        slowOperations: 0,
        memoryUsage: 0,
        lastHealthCheck: Date.now(),
      };
      window.enterpriseHelpersMonitor.operationHistory = [];
      logger.info("Helper metrics reset", {
        component: "EnterpriseHelpersMonitor",
      });
    }
  }

  static forceHealthCheck() {
    if (window.enterpriseHelpersMonitor) {
      return window.enterpriseHelpersMonitor.performHealthCheck();
    }
    return null;
  }
}

// Initialize global enterprise monitor
if (typeof window !== "undefined") {
  if (!window.enterpriseHelpersMonitor) {
    window.enterpriseHelpersMonitor = new EnterpriseHelpersMonitor();
  }
}

// Enhanced constants and configuration
const HELPERS_CONSTANTS = {
  VERSION: "2.0.0",
  MAX_CACHE_SIZE: 1000,
  CACHE_EXPIRY: 300000, // 5 minutes
  PERFORMANCE_SAMPLE_RATE: 0.1,

  // UI and spacing constants
  UI: {
    TOOLTIP_SPACING: 8,
    SMOOTH_SCROLL_DURATION: 500,
    TOOLTIP_ID_LENGTH: 8,
    DEFAULT_SPACING: 8,
  },

  // Scoring constants
  SCORING: {
    PASSWORD_BASE_SCORE: 20,
    PASSWORD_LENGTH_BONUS: 10,
    PASSWORD_MIN_SECURE_LENGTH: 12,
    PASSWORD_VARIETY_BONUS: 15,
    PASSWORD_REPETITION_PENALTY: 20,
    PASSWORD_STRENGTH_VERY_STRONG: 80,
    PASSWORD_STRENGTH_STRONG: 60,
    PASSWORD_STRENGTH_MODERATE: 40,
    PASSWORD_STRENGTH_WEAK_THRESHOLD: 60,
    ACCESSIBILITY_SCORE_PENALTY: 25,
    NEUTRAL_SCORE: 50,
    EXCELLENT_THRESHOLD: 90,
    GOOD_THRESHOLD: 80,
    SATISFACTORY_THRESHOLD: 70,
    NEEDS_IMPROVEMENT_THRESHOLD: 60,
    POOR_THRESHOLD: 50,
    PASSING_THRESHOLD: 60,
    SIGNIFICANT_CHANGE_THRESHOLD: 20,
    POOR_PERFORMANCE_THRESHOLD: 50,
    AVERAGE_PERFORMANCE_THRESHOLD: 70,
    EXCELLENT_PERFORMANCE_THRESHOLD: 90,
    DECLINING_TREND_THRESHOLD: -10,
    MAX_RECOMMENDATIONS: 5,
  },

  // Text analysis constants
  TEXT_ANALYSIS: {
    EXCESSIVE_CAPS_PENALTY: 50,
    EXCESSIVE_PUNCTUATION_PENALTY: 20,
    PUNCTUATION_THRESHOLD: 0.1,
    PUNCTUATION_PENALTY: 15,
    MAX_WORDS_PER_SENTENCE: 20,
  }, // Time constants
  TIME: {
    SECONDS_PER_MINUTE: 60,
    MINUTES_PER_HOUR: 60,
    HOURS_PER_DAY: 24,
    DAYS_PER_WEEK: 7,
    DAYS_PER_MONTH: 30,
    DAYS_PER_YEAR: 365,
    MILLISECONDS_PER_SECOND: 1000,
    SUNDAY: 0,
    SATURDAY: 6,
    URL_CLEANUP_DELAY: 1000, // 1 second for URL cleanup
    GOOD_DECISION_TIME: 30000, // 30 seconds
    QUICK_DECISION_TIME: 10000, // 10 seconds
    SLOW_DECISION_TIME: 60000, // 60 seconds
    QUICK_DECISION_RATIO: 0.5, // 50% threshold
    SLOW_DECISION_RATIO: 0.3, // 30% threshold
    FRAME_RATE_TARGET: 16.67, // Target 60fps
  },

  // Weekend days (derived from TIME constants)
  get WEEKEND_DAYS() {
    return [this.TIME.SUNDAY, this.TIME.SATURDAY];
  },

  // Device and responsiveness constants
  DEVICE: {
    MOBILE_BREAKPOINT: 576,
    TABLET_BREAKPOINT: 768,
    DESKTOP_BREAKPOINT: 992,
    LARGE_DESKTOP_BREAKPOINT: 1200,
    HIGH_DPI_THRESHOLD: 1.5,
    LOW_BATTERY_THRESHOLD: 0.2, // 20%
  },

  // ID and string generation constants
  GENERATION: {
    ID_RADIX: 36,
    ID_START_INDEX: 2,
    ID_END_INDEX: 11,
  },

  // File size constants (in bytes)
  FILE_SIZE: {
    BYTES_PER_KB: 1024,
    KB_PER_MB: 1024,
    DEFAULT_TEXT_LIMIT_MB: 100,
    DEFAULT_BINARY_LIMIT_MB: 50,
    SMALL_BINARY_LIMIT_MB: 10,
    CONTROL_CHAR_THRESHOLD: 32, // ASCII control characters
  },

  // Performance and animation constants
  ANIMATION: {
    EASING_THRESHOLD: 0.5,
    EASING_FACTOR_4: 4,
    EASING_FACTOR_2: 2,
    BOUNCE_DIVISOR: 2.75,
    BOUNCE_MULTIPLIER: 7.5625,
    BOUNCE_OFFSET_1_5: 1.5,
    BOUNCE_OFFSET_2: 2,
    BOUNCE_OFFSET_2_25: 2.25,
    BOUNCE_OFFSET_2_5: 2.5,
    BOUNCE_OFFSET_2_625: 2.625,
    BOUNCE_RETURN_0_75: 0.75,
    BOUNCE_RETURN_0_9375: 0.9375,
    BOUNCE_RETURN_0_984375: 0.984375,
    ELASTIC_PERIOD_DIVISOR: 4,
    FRAME_DELTA_TARGET: 0.016, // 60fps target
  },

  // Additional scoring thresholds
  ANALYSIS: {
    SLOW_DECISION_RATIO: 0.3,
    HIGH_PERFORMANCE_THRESHOLD: 80,
    LOW_PERFORMANCE_THRESHOLD: 40,
    ETHICS_WARNING_THRESHOLD: 70,
    COMPLETION_WARNING_THRESHOLD: 80,
    CRITICAL_VALUE_THRESHOLD: 50,
    EXTENDED_RECOMMENDATIONS: 8,
  },

  // Color constants
  COLOR: {
    RGB_MAX: 255,
    HEX_SHORT_LENGTH: 3,
    HEX_SHIFT_ALPHA: 24,
    HEX_SHIFT_RED: 16,
    HEX_SHIFT_GREEN: 8,
    HEX_BASE: 16,
    THRESHOLD_LOW: 30,
    THRESHOLD_MEDIUM: 60,
    THRESHOLD_HIGH: 50,
    LUMINANCE_OFFSET: 0.05,
    LUMINANCE_THRESHOLD: 0.03928,
    LUMINANCE_DIVISOR: 12.92,
    LUMINANCE_OFFSET_2: 0.055,
    LUMINANCE_DIVISOR_2: 1.055,
    LUMINANCE_EXPONENT: 2.4,
    // Color science constants for luminance calculation
    LUMINANCE_RED_WEIGHT: 0.2126,
    LUMINANCE_GREEN_WEIGHT: 0.7152,
    LUMINANCE_BLUE_WEIGHT: 0.0722,
    // HSL conversion constants
    HSL_HUE_CIRCLE: 360,
    HSL_HUE_SECTIONS: 6,
    HSL_HUE_RED_OFFSET: 4,
    HSL_LIGHTNESS_THRESHOLD: 0.5,
    HSL_SATURATION_DIVISOR: 2,
    FACTOR_LIGHTEN: 0.8,
  },

  VALIDATION_PATTERNS: {
    EMAIL: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    URL: /^https?:\/\/[^\s/$.?#].[^\s]*$/i,
    UUID: /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i,
    SLUG: /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    PASSWORD_STRONG:
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/,
  },
  ACCESSIBILITY_COLORS: {
    HIGH_CONTRAST: {
      background: "#000000",
      text: "#ffffff",
      primary: "#ffff00",
      secondary: "#00ffff",
      danger: "#ff0000",
      success: "#00ff00",
    },
    LIGHT_MODE: {
      background: "#ffffff",
      text: "#333333",
      primary: "#007bff",
      secondary: "#28a745",
      danger: "#dc3545",
      success: "#28a745",
    },
  },
};

/**
 * Memory management for caching and performance
 */
class HelperCache {
  static cache = new Map();
  static accessTimes = new Map();

  static set(key, value, ttl = HELPERS_CONSTANTS.CACHE_EXPIRY) {
    const expiry = Date.now() + ttl;
    this.cache.set(key, { value, expiry });
    this.accessTimes.set(key, Date.now());
    this.cleanup();
  }

  static get(key) {
    const entry = this.cache.get(key);
    if (!entry) return null;

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      this.accessTimes.delete(key);
      return null;
    }

    this.accessTimes.set(key, Date.now());
    return entry.value;
  }

  static cleanup() {
    if (this.cache.size <= HELPERS_CONSTANTS.MAX_CACHE_SIZE) return;

    // Remove expired entries first
    for (const [key, entry] of this.cache.entries()) {
      if (Date.now() > entry.expiry) {
        this.cache.delete(key);
        this.accessTimes.delete(key);
      }
    }

    // If still over limit, remove least recently used
    if (this.cache.size > HELPERS_CONSTANTS.MAX_CACHE_SIZE) {
      const sortedByAccess = [...this.accessTimes.entries()]
        .sort(([, a], [, b]) => a - b)
        .slice(0, this.cache.size - HELPERS_CONSTANTS.MAX_CACHE_SIZE);

      sortedByAccess.forEach(([key]) => {
        this.cache.delete(key);
        this.accessTimes.delete(key);
      });
    }
  }

  static clear() {
    this.cache.clear();
    this.accessTimes.clear();
  }
}

/**
 * Theme and accessibility utilities
 */
class ThemeHelpers {
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

  static getThemeColors(theme = null) {
    const currentTheme = theme || this.getCurrentTheme();

    if (currentTheme.highContrast) {
      return HELPERS_CONSTANTS.ACCESSIBILITY_COLORS.HIGH_CONTRAST;
    }

    return HELPERS_CONSTANTS.ACCESSIBILITY_COLORS.LIGHT_MODE;
  }

  static applyTheme(element, theme = null) {
    const colors = this.getThemeColors(theme);
    const currentTheme = theme || this.getCurrentTheme();

    element.style.backgroundColor = colors.background;
    element.style.color = colors.text;

    // Add theme-specific classes
    element.classList.remove("theme-light", "theme-high-contrast");
    element.classList.add(`theme-${currentTheme.theme}`);

    if (currentTheme.reducedMotion) {
      element.classList.add("reduce-motion");
    }

    return colors;
  }

  static createThemeObserver(callback) {
    const observers = [];

    // High contrast observer
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    const contrastHandler = (e) => callback("highContrast", e.matches);
    contrastQuery.addEventListener("change", contrastHandler);
    observers.push(() =>
      contrastQuery.removeEventListener("change", contrastHandler),
    );

    // Reduced motion observer
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    const motionHandler = (e) => callback("reducedMotion", e.matches);
    motionQuery.addEventListener("change", motionHandler);
    observers.push(() =>
      motionQuery.removeEventListener("change", motionHandler),
    );

    return () => observers.forEach((cleanup) => cleanup());
  }
}

/**
 * Enhanced Helpers class with modern utilities
 */
class Helpers {
  constructor() {
    // Enterprise monitoring integration
    this.monitor = window.enterpriseHelpersMonitor;
    this.instanceId = this.generateInstanceId();
    this.operationCount = 0;
    this.lastOperation = null;

    // Register with enterprise monitor
    if (this.monitor) {
      this.monitor.registerInstance(this);
    }

    // Initialize performance tracking
    this.performanceCache = new Map();
    this.circuitBreakerStates = new Map();

    logger.info("Enterprise Helpers instance created", {
      instanceId: this.instanceId,
      component: "Helpers",
    });
  }

  generateInstanceId() {
    return `helper_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Enterprise operation wrapper
  executeWithMonitoring(operationType, operation, ...args) {
    const startTime = performance.now();
    let success = true;
    let result = null;

    try {
      // Check circuit breaker
      if (this.isCircuitBreakerOpen(operationType)) {
        throw new Error(`Circuit breaker open for operation: ${operationType}`);
      }

      result = operation.apply(this, args);
      this.recordCircuitBreakerSuccess(operationType);
    } catch (err) {
      success = false;
      this.recordCircuitBreakerFailure(operationType);
      logger.error(`Helper operation failed: ${operationType}`, {
        error: err.message,
        instanceId: this.instanceId,
        component: "Helpers",
      });
      throw err;
    } finally {
      const executionTime = performance.now() - startTime;
      this.operationCount++;
      this.lastOperation = {
        type: operationType,
        timestamp: Date.now(),
        executionTime,
        success,
      };

      // Record with enterprise monitor
      if (this.monitor) {
        this.monitor.recordOperation(operationType, executionTime, success, {
          instanceId: this.instanceId,
          operationCount: this.operationCount,
          args: args.length,
        });
      }

      // Log slow operations
      if (
        executionTime > ENTERPRISE_HELPERS.PERFORMANCE.SLOW_OPERATION_THRESHOLD
      ) {
        logger.warn(`Slow helper operation detected: ${operationType}`, {
          executionTime,
          threshold: ENTERPRISE_HELPERS.PERFORMANCE.SLOW_OPERATION_THRESHOLD,
          instanceId: this.instanceId,
          component: "Helpers",
        });
      }
    }

    return result;
  }

  isCircuitBreakerOpen(operationType) {
    const state = this.circuitBreakerStates.get(operationType);
    if (!state) return false;

    if (state.state === "OPEN") {
      if (Date.now() > state.nextRetry) {
        state.state = "HALF_OPEN";
        state.attempts = 0;
        return false;
      }
      return true;
    }

    return false;
  }

  recordCircuitBreakerSuccess(operationType) {
    const state = this.circuitBreakerStates.get(operationType);
    if (state && state.state === "HALF_OPEN") {
      state.state = "CLOSED";
      state.failures = 0;
    }
  }

  recordCircuitBreakerFailure(operationType) {
    const state = this.circuitBreakerStates.get(operationType) || {
      state: "CLOSED",
      failures: 0,
      nextRetry: null,
      attempts: 0,
    };

    state.failures++;
    if (
      state.failures >= ENTERPRISE_HELPERS.CIRCUIT_BREAKER.FAILURE_THRESHOLD
    ) {
      state.state = "OPEN";
      state.nextRetry =
        Date.now() + ENTERPRISE_HELPERS.CIRCUIT_BREAKER.RECOVERY_TIMEOUT;
    }

    this.circuitBreakerStates.set(operationType, state);
  }

  // Enhanced Math utilities with performance optimization and caching
  /**
   * Clamp a value between min and max bounds
   * @param {number} value - Value to clamp
   * @param {number} min - Minimum bound
   * @param {number} max - Maximum bound
   * @returns {number} Clamped value
   */
  static clamp(value, min, max) {
    if (typeof value !== "number" || isNaN(value)) return min;
    return Math.min(Math.max(value, min), max);
  }

  /**
   * Linear interpolation between two values
   * @param {number} start - Start value
   * @param {number} end - End value
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {number} Interpolated value
   */
  static lerp(start, end, factor) {
    factor = this.clamp(factor, 0, 1);
    return start + (end - start) * factor;
  }

  /**
   * Map a value from one range to another
   * @param {number} value - Value to map
   * @param {number} inputMin - Input range minimum
   * @param {number} inputMax - Input range maximum
   * @param {number} outputMin - Output range minimum
   * @param {number} outputMax - Output range maximum
   * @returns {number} Mapped value
   */
  static map(value, inputMin, inputMax, outputMin, outputMax) {
    if (inputMax === inputMin) return outputMin;
    const factor = (value - inputMin) / (inputMax - inputMin);
    return outputMin + (outputMax - outputMin) * factor;
  }

  /**
   * Generate a random number between min and max
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random number
   */
  static randomBetween(min, max) {
    return Math.random() * (max - min) + min;
  }

  /**
   * Generate a random integer between min and max (inclusive)
   * @param {number} min - Minimum value
   * @param {number} max - Maximum value
   * @returns {number} Random integer
   */
  static randomInt(min, max) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Round a number to specified decimal places
   * @param {number} number - Number to round
   * @param {number} decimals - Number of decimal places
   * @returns {number} Rounded number
   */
  static roundTo(number, decimals) {
    if (typeof number !== "number" || isNaN(number)) return 0;
    return Number(`${Math.round(`${number}e${decimals}`)}e-${decimals}`);
  }

  /**
   * Calculate statistical mean
   * @param {number[]} values - Array of numbers
   * @returns {number} Mean value
   */
  static mean(values) {
    // Refactored: Use consolidated validation pattern
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = this.filterValidNumbers(values);
    return validValues.length > 0
      ? validValues.reduce((a, b) => a + b, 0) / validValues.length
      : 0;
  }

  /**
   * Calculate statistical median
   * @param {number[]} values - Array of numbers
   * @returns {number} Median value
   */
  static median(values) {
    // Refactored: Use consolidated validation pattern
    if (!Array.isArray(values) || values.length === 0) return 0;
    const validValues = this.filterValidNumbers(values).sort((a, b) => a - b);
    const mid = Math.floor(validValues.length / 2);
    return validValues.length % 2 === 0
      ? (validValues[mid - 1] + validValues[mid]) / 2
      : validValues[mid];
  }

  /**
   * Calculate standard deviation
   * @param {number[]} values - Array of numbers
   * @returns {number} Standard deviation
   */
  static standardDeviation(values) {
    const average = this.mean(values);
    const validValues = values.filter(
      (v) => typeof v === "number" && !isNaN(v),
    );
    const squaredDiffs = validValues.map((v) => Math.pow(v - average, 2));
    return Math.sqrt(this.mean(squaredDiffs));
  }

  /**
   * Calculate correlation coefficient between two datasets
   * @param {number[]} x - First dataset
   * @param {number[]} y - Second dataset
   * @returns {number} Correlation coefficient (-1 to 1)
   */
  static correlation(x, y) {
    if (
      !Array.isArray(x) ||
      !Array.isArray(y) ||
      x.length !== y.length ||
      x.length === 0
    )
      return 0;

    const meanX = this.mean(x);
    const meanY = this.mean(y);

    let numerator = 0;
    let sumSqX = 0;
    let sumSqY = 0;

    for (let i = 0; i < x.length; i++) {
      const deltaX = x[i] - meanX;
      const deltaY = y[i] - meanY;
      numerator += deltaX * deltaY;
      sumSqX += deltaX * deltaX;
      sumSqY += deltaY * deltaY;
    }

    const denominator = Math.sqrt(sumSqX * sumSqY);
    return denominator === 0 ? 0 : numerator / denominator;
  } // Enhanced Array utilities with performance optimization
  /**
   * Shuffle an array using Fisher-Yates algorithm (non-mutating)
   * @param {Array} array - Array to shuffle
   * @returns {Array} Shuffled copy of the array
   */
  static shuffleArray(array) {
    if (!Array.isArray(array)) return [];
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }

  /**
   * Get a random element from an array
   * @param {Array} array - Source array
   * @returns {*} Random element or undefined if array is empty
   */
  static getRandomElement(array) {
    if (!Array.isArray(array) || array.length === 0) return undefined;
    return array[Math.floor(Math.random() * array.length)];
  }

  /**
   * Get multiple random elements from an array (without replacement)
   * @param {Array} array - Source array
   * @param {number} count - Number of elements to select
   * @returns {Array} Array of selected elements
   */
  static getRandomElements(array, count) {
    if (!Array.isArray(array) || count <= 0) return [];
    const shuffled = this.shuffleArray(array);
    return shuffled.slice(0, Math.min(count, shuffled.length));
  }

  /**
   * Group array elements by a key function
   * @param {Array} array - Array to group
   * @param {Function} keyFn - Function that returns the grouping key
   * @returns {Object} Grouped object
   */
  static groupBy(array, keyFn) {
    if (!Array.isArray(array) || typeof keyFn !== "function") return {};
    return array.reduce((groups, item) => {
      const key = keyFn(item);
      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
      return groups;
    }, {});
  }

  /**
   * Remove duplicates from an array
   * @param {Array} array - Array with potential duplicates
   * @param {Function} keyFn - Optional key function for object comparison
   * @returns {Array} Array without duplicates
   */
  static unique(array, keyFn = null) {
    if (!Array.isArray(array)) return [];

    if (keyFn && typeof keyFn === "function") {
      const seen = new Set();
      return array.filter((item) => {
        const key = keyFn(item);
        if (seen.has(key)) return false;
        seen.add(key);
        return true;
      });
    }

    return [...new Set(array)];
  }

  /**
   * Chunk an array into smaller arrays of specified size
   * @param {Array} array - Array to chunk
   * @param {number} size - Size of each chunk
   * @returns {Array[]} Array of chunks
   */
  static chunk(array, size) {
    if (!Array.isArray(array) || size <= 0) return [];
    const chunks = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  /**
   * Flatten a nested array structure
   * @param {Array} array - Nested array
   * @param {number} depth - Maximum depth to flatten (default: Infinity)
   * @returns {Array} Flattened array
   */
  static flatten(array, depth = Infinity) {
    if (!Array.isArray(array)) return [];
    return depth > 0
      ? array.reduce(
          (acc, val) =>
            acc.concat(Array.isArray(val) ? this.flatten(val, depth - 1) : val),
          [],
        )
      : array.slice();
  }

  /**
   * Find the intersection of multiple arrays
   * @param {...Array} arrays - Arrays to intersect
   * @returns {Array} Intersection of all arrays
   */
  static intersection(...arrays) {
    if (arrays.length === 0) return [];
    if (arrays.length === 1)
      return Array.isArray(arrays[0]) ? [...arrays[0]] : [];

    return arrays.reduce((result, array) => {
      if (!Array.isArray(array)) return [];
      return result.filter((item) => array.includes(item));
    });
  }

  /**
   * Sort array of objects by multiple criteria
   * @param {Array} array - Array to sort
   * @param {Array} criteria - Array of {key, direction} objects
   * @returns {Array} Sorted array
   */
  static sortBy(array, criteria) {
    if (!Array.isArray(array) || !Array.isArray(criteria)) return [...array];

    return [...array].sort((a, b) => {
      for (const criterion of criteria) {
        const { key, direction = "asc" } = criterion;
        const aVal = typeof key === "function" ? key(a) : a[key];
        const bVal = typeof key === "function" ? key(b) : b[key];

        if (aVal < bVal) return direction === "asc" ? -1 : 1;
        if (aVal > bVal) return direction === "asc" ? 1 : -1;
      }
      return 0;
    });
  } // Enhanced String utilities with security and accessibility features
  /**
   * Capitalize the first letter of a string
   * @param {string} str - String to capitalize
   * @returns {string} Capitalized string
   */
  static capitalize(str) {
    if (typeof str !== "string" || str.length === 0) return "";
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert camelCase to kebab-case
   * @param {string} str - camelCase string
   * @returns {string} kebab-case string
   */
  static camelToKebab(str) {
    if (typeof str !== "string") return "";
    return str.replace(/([a-z0-9]|(?=[A-Z]))([A-Z])/g, "$1-$2").toLowerCase();
  }

  /**
   * Convert kebab-case to camelCase
   * @param {string} str - kebab-case string
   * @returns {string} camelCase string
   */
  static kebabToCamel(str) {
    if (typeof str !== "string") return "";
    return str.replace(/-([a-z])/g, (g) => g[1].toUpperCase());
  }

  /**
   * Truncate text with optional suffix
   * @param {string} text - Text to truncate
   * @param {number} maxLength - Maximum length
   * @param {string} suffix - Suffix to add (default: '...')
   * @returns {string} Truncated text
   */
  static truncateText(text, maxLength, suffix = "...") {
    if (typeof text !== "string" || text.length <= maxLength) return text;
    return text.substring(0, maxLength - suffix.length) + suffix;
  }

  /**
   * Strip HTML tags from a string (security-conscious)
   * @param {string} html - HTML string
   * @returns {string} Plain text
   */
  static stripHtml(html) {
    if (typeof html !== "string") return "";
    // Create a temporary element and use textContent for security
    const div = document.createElement("div");
    div.innerHTML = html;
    return div.textContent || div.innerText || "";
  }

  /**
   * Escape HTML entities for security
   * @param {string} text - Text to escape
   * @returns {string} HTML-escaped text
   */
  static escapeHtml(text) {
    if (typeof text !== "string") return "";
    const div = document.createElement("div");
    div.textContent = text;
    return div.innerHTML;
  }

  /**
   * Generate a secure random string
   * @param {number} length - Length of the string
   * @param {string} charset - Character set to use
   * @returns {string} Random string
   */
  static generateRandomString(
    length = 12,
    charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
  ) {
    let result = "";
    const charsetLength = charset.length;

    if (window.crypto && window.crypto.getRandomValues) {
      // Use cryptographically secure random
      const randomValues = new Uint8Array(length);
      window.crypto.getRandomValues(randomValues);
      for (let i = 0; i < length; i++) {
        result += charset[randomValues[i] % charsetLength];
      }
    } else {
      // Fallback to Math.random
      for (let i = 0; i < length; i++) {
        result += charset[Math.floor(Math.random() * charsetLength)];
      }
    }

    return result;
  }

  /**
   * Create a URL-friendly slug from text
   * @param {string} text - Text to convert
   * @param {number} maxLength - Maximum length (default: 50)
   * @returns {string} URL slug
   */
  static createSlug(text, maxLength = 50) {
    if (typeof text !== "string") return "";

    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, "") // Remove special characters
      .replace(/\s+/g, "-") // Replace spaces with hyphens
      .replace(/-+/g, "-") // Replace multiple hyphens with single
      .substring(0, maxLength)
      .replace(/-$/, ""); // Remove trailing hyphen
  }

  /**
   * Format text for screen readers
   * @param {string} text - Text to format
   * @param {Object} options - Formatting options
   * @returns {string} Screen reader friendly text
   */
  static formatForScreenReader(text, options = {}) {
    if (typeof text !== "string") return "";

    const {
      expandAbbreviations = true,
      addPunctuation = true,
      slowDown = false,
    } = options;

    let formatted = text;

    if (expandAbbreviations) {
      const abbreviations = {
        AI: "Artificial Intelligence",
        ML: "Machine Learning",
        UI: "User Interface",
        UX: "User Experience",
        API: "Application Programming Interface",
      };

      Object.entries(abbreviations).forEach(([abbr, full]) => {
        const regex = new RegExp(`\\b${abbr}\\b`, "gi");
        formatted = formatted.replace(regex, full);
      });
    }

    if (addPunctuation && !formatted.match(/[.!?]$/)) {
      formatted += ".";
    }

    if (slowDown) {
      // Add pauses for screen readers
      formatted = formatted.replace(/[.!?]/g, "$&\u00A0"); // Non-breaking space
    }

    return formatted;
  }

  /**
   * Check if text meets accessibility guidelines
   * @param {string} text - Text to check
   * @returns {Object} Accessibility assessment
   */
  static assessTextAccessibility(text) {
    if (typeof text !== "string")
      return { score: 0, issues: ["Invalid input"] };

    const issues = [];
    let score = 100;

    // Check length
    if (text.length === 0) {
      issues.push("Text is empty");
      score -= HELPERS_CONSTANTS.TEXT_ANALYSIS.EXCESSIVE_CAPS_PENALTY;
    }

    // Check for all caps (poor for screen readers)
    if (text.length > 10 && text === text.toUpperCase()) {
      issues.push("Text is all uppercase");
      score -= HELPERS_CONSTANTS.TEXT_ANALYSIS.EXCESSIVE_PUNCTUATION_PENALTY;
    }

    // Check for excessive punctuation
    const punctuationRatio =
      (text.match(/[!?]{2,}/g) || []).length / text.length;
    if (
      punctuationRatio > HELPERS_CONSTANTS.TEXT_ANALYSIS.PUNCTUATION_THRESHOLD
    ) {
      issues.push("Excessive punctuation detected");
      score -= HELPERS_CONSTANTS.TEXT_ANALYSIS.PUNCTUATION_PENALTY;
    }

    // Check reading level (simplified)
    const sentences = text.split(/[.!?]+/).filter((s) => s.trim().length > 0);
    const words = text.split(/\s+/).filter((w) => w.length > 0);
    const avgWordsPerSentence = words.length / Math.max(sentences.length, 1);

    if (
      avgWordsPerSentence >
      HELPERS_CONSTANTS.TEXT_ANALYSIS.MAX_WORDS_PER_SENTENCE
    ) {
      issues.push("Sentences may be too long");
      score -= 10;
    }

    return {
      score: Math.max(0, score),
      issues,
      wordCount: words.length,
      sentenceCount: sentences.length,
      avgWordsPerSentence: this.roundTo(avgWordsPerSentence, 1),
    };
  } // Enhanced Time utilities with internationalization and accessibility
  /**
   * Format duration with accessibility support
   * @param {number} milliseconds - Duration in milliseconds
   * @param {Object} options - Formatting options
   * @returns {string} Formatted duration
   */
  static formatDuration(milliseconds, options = {}) {
    if (typeof milliseconds !== "number" || milliseconds < 0) return "0s";

    const {
      includeMilliseconds = false,
      verbose = false,
      screenReader = false,
    } = options;

    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / COMMON.MINUTES_60);
    const hours = Math.floor(minutes / COMMON.MINUTES_60);
    const days = Math.floor(hours / COMMON.HOURS_24);

    if (verbose || screenReader) {
      const parts = [];
      if (days > 0) parts.push(`${days} day${days > 1 ? "s" : ""}`);
      if (hours % COMMON.HOURS_24 > 0)
        parts.push(
          `${hours % COMMON.HOURS_24} hour${hours % COMMON.HOURS_24 > 1 ? "s" : ""}`,
        );
      if (minutes % HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE > 0)
        parts.push(
          `${minutes % HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE} minute${minutes % HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE > 1 ? "s" : ""}`,
        );
      if (seconds % COMMON.MINUTES_60 > 0)
        parts.push(
          `${seconds % COMMON.MINUTES_60} second${seconds % COMMON.MINUTES_60 > 1 ? "s" : ""}`,
        );

      if (parts.length === 0) return screenReader ? "0 seconds" : "0s";
      return parts.join(screenReader ? ", " : " ");
    }

    if (days > 0) {
      return `${days}d ${hours % COMMON.HOURS_24}h ${minutes % COMMON.MINUTES_60}m`;
    } else if (hours > 0) {
      return `${hours}:${(minutes % HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE).toString().padStart(2, "0")}:${(seconds % HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE).toString().padStart(2, "0")}`;
    } else if (minutes > 0) {
      return `${minutes}:${(seconds % HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE).toString().padStart(2, "0")}`;
    } else {
      return includeMilliseconds
        ? `${seconds}.${Math.floor((milliseconds % HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND) / 100)}s`
        : `${seconds}s`;
    }
  }

  /**
   * Format timestamp with enhanced options and accessibility
   * @param {number} timestamp - Timestamp to format
   * @param {string|Object} format - Format string or options object
   * @returns {string} Formatted timestamp
   */
  static formatTimestamp(timestamp, format = "short") {
    if (typeof timestamp !== "number" || isNaN(timestamp))
      return "Invalid date";

    const date = new Date(timestamp);

    if (typeof format === "string") {
      switch (format) {
        case "short":
          return date.toLocaleDateString();
        case "long":
          return `${date.toLocaleDateString()} ${date.toLocaleTimeString()}`;
        case "time":
          return date.toLocaleTimeString();
        case "iso":
          return date.toISOString();
        case "relative":
          return this.getTimeAgo(timestamp);
        case "accessible":
          return date.toLocaleDateString("en-US", {
            weekday: "long",
            year: "numeric",
            month: "long",
            day: "numeric",
            hour: "numeric",
            minute: "2-digit",
          });
        default:
          return date.toString();
      }
    }

    // Format object with options
    const options = {
      locale: "en-US",
      includeTime: true,
      includeWeekday: false,
      ...format,
    };

    const dateOptions = {
      year: "numeric",
      month: options.monthFormat || "short",
      day: "numeric",
    };

    if (options.includeWeekday) {
      dateOptions.weekday = "long";
    }

    if (options.includeTime) {
      dateOptions.hour = "numeric";
      dateOptions.minute = "2-digit";
    }

    return date.toLocaleDateString(options.locale, dateOptions);
  }

  /**
   * Get human-readable time ago with enhanced precision
   * @param {number} timestamp - Past timestamp
   * @param {Object} options - Formatting options
   * @returns {string} Time ago string
   */
  static getTimeAgo(timestamp, options = {}) {
    if (typeof timestamp !== "number" || isNaN(timestamp))
      return "Unknown time";

    const { precise = false, shortForm = false } = options;

    const now = Date.now();
    const diff = now - timestamp;

    if (diff < 0) return "In the future";

    const units = [
      {
        name: "year",
        short: "y",
        ms:
          HELPERS_CONSTANTS.TIME.DAYS_PER_YEAR *
          HELPERS_CONSTANTS.TIME.HOURS_PER_DAY *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
      {
        name: "month",
        short: "mo",
        ms:
          HELPERS_CONSTANTS.TIME.DAYS_PER_MONTH *
          HELPERS_CONSTANTS.TIME.HOURS_PER_DAY *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
      {
        name: "week",
        short: "w",
        ms:
          HELPERS_CONSTANTS.TIME.DAYS_PER_WEEK *
          HELPERS_CONSTANTS.TIME.HOURS_PER_DAY *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
      {
        name: "day",
        short: "d",
        ms:
          HELPERS_CONSTANTS.TIME.HOURS_PER_DAY *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
      {
        name: "hour",
        short: "h",
        ms:
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
      {
        name: "minute",
        short: "m",
        ms:
          HELPERS_CONSTANTS.TIME.SECONDS_PER_MINUTE *
          HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
      {
        name: "second",
        short: "s",
        ms: HELPERS_CONSTANTS.TIME.MILLISECONDS_PER_SECOND,
      },
    ];

    // Find the appropriate unit
    for (const unit of units) {
      if (diff >= unit.ms) {
        const value = Math.floor(diff / unit.ms);
        const unitName = shortForm ? unit.short : unit.name;
        const plural = !shortForm && value > 1 ? "s" : "";

        if (precise && units.indexOf(unit) < units.length - 1) {
          const nextUnit = units[units.indexOf(unit) + 1];
          const remainder = Math.floor((diff % unit.ms) / nextUnit.ms);
          if (remainder > 0) {
            const nextUnitName = shortForm ? nextUnit.short : nextUnit.name;
            const nextPlural = !shortForm && remainder > 1 ? "s" : "";
            return `${value}${unitName}${plural} ${remainder}${nextUnitName}${nextPlural} ago`;
          }
        }

        return `${value}${shortForm ? "" : " "}${unitName}${plural}${shortForm ? "" : " ago"}`;
      }
    }

    return "Just now";
  }

  /**
   * Parse various date formats
   * @param {string|number} input - Date input
   * @returns {Date|null} Parsed date or null if invalid
   */
  static parseDate(input) {
    if (input instanceof Date) return input;
    if (typeof input === "number") return new Date(input);
    if (typeof input !== "string") return null;

    // Try parsing ISO format first
    const isoMatch = input.match(
      /^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}:\d{2}(\.\d{3})?Z?)?$/,
    );
    if (isoMatch) {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }

    // Try common formats
    const commonFormats = [
      /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/, // MM/DD/YYYY
      /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/, // YYYY/MM/DD
      /^(\d{1,2})-(\d{1,2})-(\d{4})$/, // MM-DD-YYYY
      /^(\d{4})-(\d{1,2})-(\d{1,2})$/, // YYYY-MM-DD
    ];

    for (const format of commonFormats) {
      const match = input.match(format);
      if (match) {
        const date = new Date(input);
        return isNaN(date.getTime()) ? null : date;
      }
    }

    return null;
  }

  /**
   * Calculate business days between two dates
   * @param {Date} startDate - Start date
   * @param {Date} endDate - End date
   * @param {number[]} excludedDays - Days to exclude (0=Sunday, 6=Saturday)
   * @returns {number} Number of business days
   */
  static calculateBusinessDays(
    startDate,
    endDate,
    excludedDays = HELPERS_CONSTANTS.WEEKEND_DAYS,
  ) {
    if (!(startDate instanceof Date) || !(endDate instanceof Date)) return 0;

    let count = 0;
    const current = new Date(startDate);

    while (current <= endDate) {
      if (!excludedDays.includes(current.getDay())) {
        count++;
      }
      current.setDate(current.getDate() + 1);
    }

    return count;
  } // Enhanced Color utilities with accessibility and theme support
  /**
   * Convert hex color to RGB object
   * @param {string} hex - Hex color string
   * @returns {Object|null} RGB object or null if invalid
   */
  static hexToRgb(hex) {
    if (typeof hex !== "string") return null;

    // Remove # if present and validate
    hex = hex.replace("#", "");
    if (!/^[0-9A-Fa-f]{6}$/.test(hex) && !/^[0-9A-Fa-f]{3}$/.test(hex))
      return null;

    // Expand 3-digit hex to 6-digit
    if (hex.length === HELPERS_CONSTANTS.COLOR.HEX_SHORT_LENGTH) {
      hex = hex
        .split("")
        .map((char) => char + char)
        .join("");
    }

    const result = /^([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : null;
  }

  /**
   * Convert RGB values to hex color
   * @param {number} r - Red value (0-255)
   * @param {number} g - Green value (0-255)
   * @param {number} b - Blue value (0-255)
   * @returns {string} Hex color string
   */
  static rgbToHex(r, g, b) {
    r = this.clamp(Math.round(r), 0, HELPERS_CONSTANTS.COLOR.RGB_MAX);
    g = this.clamp(Math.round(g), 0, HELPERS_CONSTANTS.COLOR.RGB_MAX);
    b = this.clamp(Math.round(b), 0, HELPERS_CONSTANTS.COLOR.RGB_MAX);

    return `#${((1 << HELPERS_CONSTANTS.COLOR.HEX_SHIFT_ALPHA) + (r << HELPERS_CONSTANTS.COLOR.HEX_SHIFT_RED) + (g << HELPERS_CONSTANTS.COLOR.HEX_SHIFT_GREEN) + b).toString(HELPERS_CONSTANTS.COLOR.HEX_BASE).slice(1)}`;
  }

  /**
   * Interpolate between two colors
   * @param {string} color1 - Start color (hex)
   * @param {string} color2 - End color (hex)
   * @param {number} factor - Interpolation factor (0-1)
   * @returns {string} Interpolated color
   */
  static interpolateColor(color1, color2, factor) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return color1;

    factor = this.clamp(factor, 0, 1);

    const r = Math.round(this.lerp(rgb1.r, rgb2.r, factor));
    const g = Math.round(this.lerp(rgb1.g, rgb2.g, factor));
    const b = Math.round(this.lerp(rgb1.b, rgb2.b, factor));

    return this.rgbToHex(r, g, b);
  }

  /**
   * Get ethics-appropriate color based on score with accessibility support
   * @param {number} value - Score value (0-100)
   * @param {Object} options - Color options
   * @returns {string} Color string
   */
  static getEthicsColor(value, options = {}) {
    const { highContrast = false, colorBlindSafe = false } = options;

    value = this.clamp(value, 0, 100);

    if (highContrast) {
      // High contrast colors for accessibility
      if (value < HELPERS_CONSTANTS.COLOR.THRESHOLD_LOW) return "#ff0000"; // Red
      if (value < HELPERS_CONSTANTS.COLOR.THRESHOLD_MEDIUM) return "#ffff00"; // Yellow
      return "#00ff00"; // Green
    }

    if (colorBlindSafe) {
      // Color-blind friendly palette
      if (value < HELPERS_CONSTANTS.COLOR.THRESHOLD_LOW) return "#d73027"; // Red-orange
      if (value < HELPERS_CONSTANTS.COLOR.THRESHOLD_MEDIUM) return "#fee08b"; // Yellow-orange
      return "#4575b4"; // Blue
    }

    // Default light theme
    if (value < HELPERS_CONSTANTS.COLOR.THRESHOLD_HIGH) {
      return this.interpolateColor(
        "#ff4444",
        "#ffaa00",
        value / HELPERS_CONSTANTS.COLOR.THRESHOLD_HIGH,
      );
    } else {
      return this.interpolateColor(
        "#ffaa00",
        "#00aa00",
        (value - HELPERS_CONSTANTS.COLOR.THRESHOLD_HIGH) /
          HELPERS_CONSTANTS.COLOR.THRESHOLD_HIGH,
      );
    }
  }

  /**
   * Calculate color contrast ratio for accessibility
   * @param {string} color1 - First color (hex)
   * @param {string} color2 - Second color (hex)
   * @returns {number} Contrast ratio (1-21)
   */
  static getContrastRatio(color1, color2) {
    const rgb1 = this.hexToRgb(color1);
    const rgb2 = this.hexToRgb(color2);

    if (!rgb1 || !rgb2) return 1;

    const luminance1 = this.getLuminance(rgb1);
    const luminance2 = this.getLuminance(rgb2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (
      (lighter + HELPERS_CONSTANTS.COLOR.LUMINANCE_OFFSET) /
      (darker + HELPERS_CONSTANTS.COLOR.LUMINANCE_OFFSET)
    );
  }

  /**
   * Calculate relative luminance of a color
   * @param {Object} rgb - RGB color object
   * @returns {number} Relative luminance (0-1)
   */
  static getLuminance(rgb) {
    const { r, g, b } = rgb;

    const [rs, gs, bs] = [r, g, b].map((c) => {
      c = c / HELPERS_CONSTANTS.COLOR.RGB_MAX;
      return c <= HELPERS_CONSTANTS.COLOR.LUMINANCE_THRESHOLD
        ? c / HELPERS_CONSTANTS.COLOR.LUMINANCE_DIVISOR
        : Math.pow(
            (c + HELPERS_CONSTANTS.COLOR.LUMINANCE_OFFSET_2) /
              HELPERS_CONSTANTS.COLOR.LUMINANCE_DIVISOR_2,
            HELPERS_CONSTANTS.COLOR.LUMINANCE_EXPONENT,
          );
    });

    return (
      HELPERS_CONSTANTS.COLOR.LUMINANCE_RED_WEIGHT * rs +
      HELPERS_CONSTANTS.COLOR.LUMINANCE_GREEN_WEIGHT * gs +
      HELPERS_CONSTANTS.COLOR.LUMINANCE_BLUE_WEIGHT * bs
    );
  }

  /**
   * Check if color combination meets WCAG accessibility standards
   * @param {string} foreground - Foreground color (hex)
   * @param {string} background - Background color (hex)
   * @param {string} level - WCAG level ('AA' or 'AAA')
   * @returns {Object} Accessibility assessment
   */
  static checkColorAccessibility(foreground, background, level = "AA") {
    const ratio = this.getContrastRatio(foreground, background);

    const requirements = {
      AA: { normal: 4.5, large: 3.0 },
      AAA: { normal: 7.0, large: 4.5 },
    };

    const req = requirements[level] || requirements["AA"];

    return {
      ratio: this.roundTo(ratio, 2),
      passesNormal: ratio >= req.normal,
      passesLarge: ratio >= req.large,
      level,
      grade: ratio >= req.normal ? "Pass" : "Fail",
      recommendation:
        ratio < req.normal
          ? `Increase contrast to at least ${req.normal}:1`
          : "Contrast meets accessibility guidelines",
    };
  }

  /**
   * Generate accessible color palette
   * @param {string} baseColor - Base color (hex)
   * @param {Object} options - Generation options
   * @returns {Object} Color palette
   */
  static generateAccessiblePalette(baseColor, options = {}) {
    const { steps = 5, lightBackground = "#ffffff" } = options;

    const rgb = this.hexToRgb(baseColor);
    if (!rgb) return null;

    const palette = {
      base: baseColor,
      variations: [],
      accessible: {
        onLight: [],
      },
    };

    // Generate variations
    for (let i = 0; i < steps; i++) {
      const factor = i / (steps - 1);
      const lightVariation = this.interpolateColor(
        baseColor,
        "#ffffff",
        factor * HELPERS_CONSTANTS.COLOR.FACTOR_LIGHTEN,
      );

      palette.variations.push({
        light: lightVariation,
        factor: this.roundTo(factor, 2),
      });

      // Check accessibility on light background
      const lightContrast = this.checkColorAccessibility(
        lightVariation,
        lightBackground,
      );

      if (lightContrast.passesNormal) {
        palette.accessible.onLight.push({
          color: lightVariation,
          contrast: lightContrast.ratio,
        });
      }
    }

    return palette;
  }

  /**
   * Convert color to different formats
   * @param {string} color - Input color (hex, rgb, hsl)
   * @param {string} outputFormat - Output format ('hex', 'rgb', 'hsl')
   * @returns {string|Object} Converted color
   */
  static convertColor(color, outputFormat = "hex") {
    const rgb = this.parseColorToRgb(color);
    if (!rgb) return null;

    switch (outputFormat.toLowerCase()) {
      case "hex": {
        return this.rgbToHex(rgb.r, rgb.g, rgb.b);
      }
      case "rgb": {
        return `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      }
      case "hsl": {
        const hsl = this.rgbToHsl(rgb);
        return `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`;
      }
      case "object": {
        return rgb;
      }
      default: {
        return color;
      }
    }
  }

  /**
   * Parse various color formats to RGB
   * @param {string} color - Color string
   * @returns {Object|null} RGB object
   */
  static parseColorToRgb(color) {
    if (typeof color !== "string") return null;

    // Hex format
    if (color.startsWith("#")) {
      return this.hexToRgb(color);
    }

    // RGB format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return {
        r: parseInt(rgbMatch[1], 10),
        g: parseInt(rgbMatch[2], 10),
        b: parseInt(rgbMatch[3], 10),
      };
    }

    // Named colors (basic set)
    const namedColors = {
      red: "#ff0000",
      green: "#008000",
      blue: "#0000ff",
      white: "#ffffff",
      black: "#000000",
      yellow: "#ffff00",
      cyan: "#00ffff",
      magenta: "#ff00ff",
    };

    const namedColor = namedColors[color.toLowerCase()];
    if (namedColor) {
      return this.hexToRgb(namedColor);
    }

    return null;
  }

  /**
   * Convert RGB to HSL
   * @param {Object} rgb - RGB color object
   * @returns {Object} HSL color object
   */
  static rgbToHsl(rgb) {
    let { r, g, b } = rgb;
    r /= HELPERS_CONSTANTS.COLOR.RGB_MAX;
    g /= HELPERS_CONSTANTS.COLOR.RGB_MAX;
    b /= HELPERS_CONSTANTS.COLOR.RGB_MAX;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h;
    let s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s =
        l > HELPERS_CONSTANTS.COLOR.HSL_LIGHTNESS_THRESHOLD
          ? d / (HELPERS_CONSTANTS.COLOR.HSL_SATURATION_DIVISOR - max - min)
          : d / (max + min);

      switch (max) {
        case r:
          h =
            (g - b) / d +
            (g < b ? HELPERS_CONSTANTS.COLOR.HSL_HUE_SECTIONS : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + HELPERS_CONSTANTS.COLOR.HSL_HUE_RED_OFFSET;
          break;
      }
      h /= HELPERS_CONSTANTS.COLOR.HSL_HUE_SECTIONS;
    }

    return {
      h: Math.round(h * HELPERS_CONSTANTS.COLOR.HSL_HUE_CIRCLE),
      s: Math.round(s * 100),
      l: Math.round(l * 100),
    };
  } // Enhanced DOM utilities with accessibility and performance features
  /**
   * Create an element with comprehensive options
   * @param {string} tag - HTML tag name
   * @param {string|Object} className - CSS class name or options object
   * @param {Object} attributes - Element attributes
   * @returns {HTMLElement} Created element
   */
  static createElement(tag, className = "", attributes = {}) {
    if (typeof tag !== "string" || tag.trim() === "") {
      throw new Error("Invalid tag name provided");
    }

    const element = document.createElement(tag);

    // Handle className parameter
    if (typeof className === "object" && className !== null) {
      // If className is actually an options object
      attributes = { ...className, ...attributes };
      className = attributes.className || "";
    }

    if (className) element.className = className;

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "style" && typeof value === "object") {
        Object.assign(element.style, value);
      } else if (key === "dataset" && typeof value === "object") {
        Object.entries(value).forEach(([dataKey, dataValue]) => {
          element.dataset[dataKey] = dataValue;
        });
      } else if (key === "listeners" && typeof value === "object") {
        Object.entries(value).forEach(([event, handler]) => {
          element.addEventListener(event, handler);
        });
      } else if (key === "children" && Array.isArray(value)) {
        value.forEach((child) => {
          if (child instanceof HTMLElement) {
            element.appendChild(child);
          } else if (typeof child === "string") {
            element.appendChild(document.createTextNode(child));
          }
        });
      } else if (key === "innerHTML") {
        element.innerHTML = value;
      } else if (key === "textContent") {
        element.textContent = value;
      } else if (key !== "className") {
        element.setAttribute(key, value);
      }
    });

    return element;
  }

  /**
   * Get comprehensive element position and dimensions
   * @param {HTMLElement} element - Target element
   * @param {Object} options - Position calculation options
   * @returns {Object} Position and dimension data
   */
  static getElementPosition(element, options = {}) {
    if (!(element instanceof HTMLElement)) {
      return { x: 0, y: 0, width: 0, height: 0, visible: false };
    }

    const {
      includeMargin = false,
      includePadding = false,
      relativeTo = null,
    } = options;

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    const position = {
      x: rect.left + window.scrollX,
      y: rect.top + window.scrollY,
      width: rect.width,
      height: rect.height,
      top: rect.top,
      left: rect.left,
      bottom: rect.bottom,
      right: rect.right,
      visible: this.isElementVisible(element),
    };

    if (includeMargin) {
      const margin = {
        top: parseFloat(styles.marginTop) || 0,
        right: parseFloat(styles.marginRight) || 0,
        bottom: parseFloat(styles.marginBottom) || 0,
        left: parseFloat(styles.marginLeft) || 0,
      };

      position.margin = margin;
      position.outerWidth = position.width + margin.left + margin.right;
      position.outerHeight = position.height + margin.top + margin.bottom;
    }

    if (includePadding) {
      const padding = {
        top: parseFloat(styles.paddingTop) || 0,
        right: parseFloat(styles.paddingRight) || 0,
        bottom: parseFloat(styles.paddingBottom) || 0,
        left: parseFloat(styles.paddingLeft) || 0,
      };

      position.padding = padding;
      position.innerWidth = position.width - padding.left - padding.right;
      position.innerHeight = position.height - padding.top - padding.bottom;
    }

    if (relativeTo && relativeTo instanceof HTMLElement) {
      const relativeRect = relativeTo.getBoundingClientRect();
      position.relativeX = rect.left - relativeRect.left;
      position.relativeY = rect.top - relativeRect.top;
    }

    return position;
  }

  /**
   * Enhanced element visibility checking
   * @param {HTMLElement} element - Element to check
   * @param {Object} options - Visibility options
   * @returns {boolean|Object} Visibility status
   */
  static isElementVisible(element, options = {}) {
    if (!(element instanceof HTMLElement)) return false;

    const {
      threshold = 0,
      partial = false,
      checkOpacity = true,
      checkDisplay = true,
      returnDetails = false,
    } = options;

    const rect = element.getBoundingClientRect();
    const styles = window.getComputedStyle(element);

    const viewport = {
      width: window.innerWidth || document.documentElement.clientWidth,
      height: window.innerHeight || document.documentElement.clientHeight,
    };

    const visibility = {
      inViewport: false,
      percentageVisible: 0,
      opacity: parseFloat(styles.opacity),
      display: styles.display,
      visibility: styles.visibility,
      dimensions: { width: rect.width, height: rect.height },
    };

    // Check basic visibility styles
    if (
      checkDisplay &&
      (styles.display === "none" || styles.visibility === "hidden")
    ) {
      return returnDetails ? visibility : false;
    }

    if (checkOpacity && visibility.opacity <= 0) {
      return returnDetails ? visibility : false;
    }

    // Calculate viewport intersection
    const intersectionWidth = Math.max(
      0,
      Math.min(rect.right, viewport.width) - Math.max(rect.left, 0),
    );
    const intersectionHeight = Math.max(
      0,
      Math.min(rect.bottom, viewport.height) - Math.max(rect.top, 0),
    );
    const intersectionArea = intersectionWidth * intersectionHeight;
    const elementArea = rect.width * rect.height;

    visibility.percentageVisible =
      elementArea > 0 ? (intersectionArea / elementArea) * 100 : 0;
    visibility.inViewport = visibility.percentageVisible >= threshold;

    if (partial) {
      visibility.inViewport = visibility.percentageVisible > 0;
    }

    return returnDetails ? visibility : visibility.inViewport;
  }

  /**
   * Enhanced scroll to element with accessibility support
   * @param {HTMLElement} element - Element to scroll to
   * @param {Object} options - Scroll options
   */
  static scrollToElement(element, options = {}) {
    if (!(element instanceof HTMLElement)) return;

    const {
      behavior = "smooth",
      block = "center",
      inline = "nearest",
      offset = 0,
      respectReducedMotion = true,
      focus = false,
      announceToScreenReader = false,
    } = options;

    // Respect user's motion preferences
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const actualBehavior =
      respectReducedMotion && prefersReducedMotion ? "auto" : behavior;

    // Calculate target position with offset
    if (offset !== 0) {
      const elementRect = element.getBoundingClientRect();
      const targetY = elementRect.top + window.scrollY + offset;

      window.scrollTo({
        top: targetY,
        behavior: actualBehavior,
      });
    } else {
      element.scrollIntoView({
        behavior: actualBehavior,
        block,
        inline,
      });
    }

    // Optional focus management
    if (focus) {
      // Ensure element is focusable
      if (
        !element.hasAttribute("tabindex") &&
        !element.matches("a, button, input, select, textarea")
      ) {
        element.setAttribute("tabindex", "-1");
      }

      setTimeout(
        () => {
          element.focus();

          // Remove temporary tabindex
          if (
            element.getAttribute("tabindex") === "-1" &&
            !element.matches("a, button, input, select, textarea")
          ) {
            element.removeAttribute("tabindex");
          }
        },
        actualBehavior === "smooth"
          ? HELPERS_CONSTANTS.UI.SMOOTH_SCROLL_DURATION
          : 0,
      );
    }

    // Screen reader announcement
    if (announceToScreenReader) {
      const announcement = `Scrolled to ${element.textContent || element.getAttribute("aria-label") || "content"}`;
      this.announceToScreenReader(announcement);
    }
  }

  /**
   * Announce message to screen readers
   * @param {string} message - Message to announce
   * @param {string} priority - Priority level ('polite' or 'assertive')
   */
  static announceToScreenReader(message, priority = "polite") {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", priority);
    announcer.setAttribute("aria-atomic", "true");
    announcer.style.position = "absolute";
    announcer.style.left = "-10000px";
    announcer.style.width = "1px";
    announcer.style.height = "1px";
    announcer.style.overflow = "hidden";

    document.body.appendChild(announcer);
    announcer.textContent = message;

    setTimeout(() => {
      document.body.removeChild(announcer);
    }, 1000);
  }

  /**
   * Create accessible tooltip
   * @param {HTMLElement} trigger - Element that triggers tooltip
   * @param {string} content - Tooltip content
   * @param {Object} options - Tooltip options
   * @returns {HTMLElement} Tooltip element
   */
  static createAccessibleTooltip(trigger, content, options = {}) {
    const {
      position = "top",
      delay = 500,
      hideDelay = 100,
      className = "tooltip",
      id = `tooltip-${this.generateRandomString(HELPERS_CONSTANTS.UI.TOOLTIP_ID_LENGTH)}`,
    } = options;

    const tooltip = this.createElement("div", {
      id,
      className: `${className} ${className}--${position}`,
      role: "tooltip",
      "aria-hidden": "true",
      textContent: content,
      style: {
        position: "absolute",
        zIndex: "9999",
        visibility: "hidden",
        opacity: "0",
        transition: "opacity 0.2s, visibility 0.2s",
      },
    });

    document.body.appendChild(tooltip);

    // Set up ARIA relationship
    trigger.setAttribute("aria-describedby", id);

    let showTimeout, hideTimeout;

    const showTooltip = () => {
      clearTimeout(hideTimeout);
      showTimeout = setTimeout(() => {
        const triggerRect = trigger.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();

        let top, left;

        switch (position) {
          case "top":
            top =
              triggerRect.top -
              tooltipRect.height -
              HELPERS_CONSTANTS.UI.TOOLTIP_SPACING;
            left =
              triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case "bottom":
            top = triggerRect.bottom + HELPERS_CONSTANTS.UI.TOOLTIP_SPACING;
            left =
              triggerRect.left + (triggerRect.width - tooltipRect.width) / 2;
            break;
          case "left":
            top =
              triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            left =
              triggerRect.left -
              tooltipRect.width -
              HELPERS_CONSTANTS.UI.TOOLTIP_SPACING;
            break;
          case "right":
            top =
              triggerRect.top + (triggerRect.height - tooltipRect.height) / 2;
            left = triggerRect.right + HELPERS_CONSTANTS.UI.TOOLTIP_SPACING;
            break;
        }

        tooltip.style.top = `${top + window.scrollY}px`;
        tooltip.style.left = `${left + window.scrollX}px`;
        tooltip.style.visibility = "visible";
        tooltip.style.opacity = "1";
        tooltip.setAttribute("aria-hidden", "false");
      }, delay);
    };

    const hideTooltip = () => {
      clearTimeout(showTimeout);
      hideTimeout = setTimeout(() => {
        tooltip.style.visibility = "hidden";
        tooltip.style.opacity = "0";
        tooltip.setAttribute("aria-hidden", "true");
      }, hideDelay);
    };

    trigger.addEventListener("mouseenter", showTooltip);
    trigger.addEventListener("mouseleave", hideTooltip);
    trigger.addEventListener("focus", showTooltip);
    trigger.addEventListener("blur", hideTooltip);

    return tooltip;
  } // Enhanced Event utilities with performance monitoring and accessibility
  /**
   * Create a debounced function with performance monitoring
   * @param {Function} func - Function to debounce
   * @param {number} wait - Wait time in milliseconds
   * @param {Object} options - Debounce options
   * @returns {Function} Debounced function
   */
  static debounce(func, wait, options = {}) {
    const {
      immediate = false,
      maxWait = null,
      trackPerformance = false,
      context = null,
    } = options;

    let timeout,
      maxTimeout,
      lastCallTime = 0;

    const debounced = function executedFunction(...args) {
      const currentTime = Date.now();
      const ctx = context || this;

      const later = () => {
        timeout = null;
        maxTimeout = null;
        if (!immediate) {
          if (trackPerformance) {
            const start = performance.now();
            const result = func.apply(ctx, args);
            const duration = performance.now() - start;
            logger.debug(
              `Debounced function executed in ${duration.toFixed(2)}ms`,
            );
            return result;
          } else {
            return func.apply(ctx, args);
          }
        }
        return undefined;
      };

      const callNow = immediate && !timeout;

      clearTimeout(timeout);
      if (maxTimeout) clearTimeout(maxTimeout);

      timeout = setTimeout(later, wait);

      // Ensure function is called within maxWait if specified
      if (maxWait && currentTime - lastCallTime >= maxWait) {
        later();
        lastCallTime = currentTime;
      } else if (maxWait && !maxTimeout) {
        maxTimeout = setTimeout(later, maxWait - (currentTime - lastCallTime));
      }

      if (callNow) {
        lastCallTime = currentTime;
        return func.apply(ctx, args);
      }
      return undefined;
    };

    debounced.cancel = () => {
      clearTimeout(timeout);
      if (maxTimeout) clearTimeout(maxTimeout);
      timeout = maxTimeout = null;
    };

    debounced.flush = (...args) => {
      if (timeout) {
        clearTimeout(timeout);
        timeout = null;
        return func.apply(context, args);
      }
      return undefined;
    };

    return debounced;
  }

  /**
   * Create a throttled function with accessibility considerations
   * @param {Function} func - Function to throttle
   * @param {number} limit - Throttle limit in milliseconds
   * @param {Object} options - Throttle options
   * @returns {Function} Throttled function
   */
  static throttle(func, limit, options = {}) {
    const {
      leading = true,
      trailing = true,
      respectReducedMotion = true,
      trackPerformance = false,
    } = options;

    let lastFunc, lastRan;

    return function executedFunction(...args) {
      // Respect user's motion preferences for visual updates
      if (
        respectReducedMotion &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches
      ) {
        // Increase throttle limit for reduced motion users
        limit = Math.max(limit, 100);
      }

      const context = this;
      const now = Date.now();

      if (!lastRan && leading) {
        if (trackPerformance) {
          const start = performance.now();
          func.apply(context, args);
          const duration = performance.now() - start;
          logger.debug(
            `Throttled function (leading) executed in ${duration.toFixed(2)}ms`,
          );
        } else {
          func.apply(context, args);
        }
        lastRan = now;
      } else {
        clearTimeout(lastFunc);
        lastFunc = setTimeout(
          () => {
            if (now - lastRan >= limit && trailing) {
              if (trackPerformance) {
                const start = performance.now();
                func.apply(context, args);
                const duration = performance.now() - start;
                logger.debug(
                  `Throttled function (trailing) executed in ${duration.toFixed(2)}ms`,
                );
              } else {
                func.apply(context, args);
              }
              lastRan = Date.now();
            }
          },
          limit - (now - lastRan),
        );
      }
    };
  }

  /**
   * Create a function that can only be called once
   * @param {Function} func - Function to call once
   * @param {Object} options - Once options
   * @returns {Function} Once function
   */
  static once(func, options = {}) {
    const { resetAfter = null, trackCalls = false } = options;

    let called = false;
    let callCount = 0;
    let result;

    const onceFunction = function executedFunction(...args) {
      callCount++;

      if (trackCalls && called) {
        logger.warn(
          `Function called ${callCount} times, but can only execute once`,
        );
      }

      if (!called) {
        called = true;
        result = func.apply(this, args);

        // Optional reset mechanism
        if (resetAfter && typeof resetAfter === "number") {
          setTimeout(() => {
            called = false;
            callCount = 0;
          }, resetAfter);
        }
      }

      return result;
    };

    onceFunction.reset = () => {
      called = false;
      callCount = 0;
      result = undefined;
    };

    onceFunction.hasBeenCalled = () => called;
    onceFunction.getCallCount = () => callCount;

    return onceFunction;
  }

  /**
   * Create an event handler with enhanced features
   * @param {HTMLElement} element - Target element
   * @param {string} event - Event type
   * @param {Function} handler - Event handler
   * @param {Object} options - Event options
   * @returns {Function} Cleanup function
   */
  static createEventHandler(element, event, handler, options = {}) {
    const {
      once = false,
      passive = true,
      capture = false,
      debounce: debounceTime = null,
      throttle: throttleTime = null,
      preventDefault = false,
      stopPropagation = false,
      trackPerformance = false,
    } = options;

    let processedHandler = handler;

    // Add performance tracking
    if (trackPerformance) {
      const originalHandler = processedHandler;
      processedHandler = function (...args) {
        const start = performance.now();
        const result = originalHandler.apply(this, args);
        const duration = performance.now() - start;
        logger.debug(
          `Event handler for ${event} executed in ${duration.toFixed(2)}ms`,
        );
        return result;
      };
    }

    // Add event control
    if (preventDefault || stopPropagation) {
      const originalHandler = processedHandler;
      processedHandler = function (e, ...args) {
        if (preventDefault) e.preventDefault();
        if (stopPropagation) e.stopPropagation();
        return originalHandler.apply(this, [e, ...args]);
      };
    }

    // Add debounce or throttle
    if (debounceTime) {
      processedHandler = this.debounce(processedHandler, debounceTime);
    } else if (throttleTime) {
      processedHandler = this.throttle(processedHandler, throttleTime);
    }

    const eventOptions = { once, passive, capture };
    element.addEventListener(event, processedHandler, eventOptions);

    return () =>
      element.removeEventListener(event, processedHandler, eventOptions);
  }

  /**
   * Create a keyboard navigation helper
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Navigation options
   * @returns {Object} Navigation controller
   */
  static createKeyboardNavigation(container, options = {}) {
    const {
      selector = "[tabindex], a, button, input, select, textarea",
      circular = true,
      skipHidden = true,
      announceNavigation = true,
    } = options;

    let currentIndex = 0;
    let elements = [];

    const updateElements = () => {
      elements = Array.from(container.querySelectorAll(selector)).filter(
        (el) => !skipHidden || this.isElementVisible(el),
      );
    };

    const navigate = (direction) => {
      updateElements();
      if (elements.length === 0) return;

      const oldIndex = currentIndex;

      if (direction === "next") {
        currentIndex = circular
          ? (currentIndex + 1) % elements.length
          : Math.min(currentIndex + 1, elements.length - 1);
      } else if (direction === "previous") {
        currentIndex = circular
          ? (currentIndex - 1 + elements.length) % elements.length
          : Math.max(currentIndex - 1, 0);
      } else if (direction === "first") {
        currentIndex = 0;
      } else if (direction === "last") {
        currentIndex = elements.length - 1;
      }

      const targetElement = elements[currentIndex];
      if (targetElement) {
        targetElement.focus();

        if (announceNavigation && currentIndex !== oldIndex) {
          const announcement = `Focused on ${targetElement.textContent || targetElement.getAttribute("aria-label") || "interactive element"}`;
          this.announceToScreenReader(announcement);
        }
      }
    };

    const keydownHandler = (e) => {
      switch (e.key) {
        case "ArrowDown":
        case "ArrowRight":
          e.preventDefault();
          navigate("next");
          break;
        case "ArrowUp":
        case "ArrowLeft":
          e.preventDefault();
          navigate("previous");
          break;
        case "Home":
          e.preventDefault();
          navigate("first");
          break;
        case "End":
          e.preventDefault();
          navigate("last");
          break;
      }
    };

    container.addEventListener("keydown", keydownHandler);
    updateElements();

    return {
      navigate,
      updateElements,
      getCurrentElement: () => elements[currentIndex],
      destroy: () => container.removeEventListener("keydown", keydownHandler),
    };
  } // Enhanced Validation utilities with security and accessibility
  /**
   * Comprehensive email validation with security features
   * @param {string} email - Email to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateEmail(email, options = {}) {
    const {
      allowInternational = true,
      maxLength = 254,
      blockedDomains = [],
      requireTld = true,
    } = options;

    if (typeof email !== "string") {
      return { valid: false, error: "Email must be a string" };
    }

    if (email.length > maxLength) {
      return {
        valid: false,
        error: `Email exceeds maximum length of ${maxLength}`,
      };
    }

    // Basic format validation
    const basicPattern = allowInternational
      ? /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      : /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

    if (!basicPattern.test(email)) {
      return { valid: false, error: "Invalid email format" };
    }

    // Check for blocked domains
    const domain = email.split("@")[1];
    if (blockedDomains.includes(domain.toLowerCase())) {
      return { valid: false, error: "Email domain is not allowed" };
    }

    // TLD validation
    if (requireTld && !domain.includes(".")) {
      return {
        valid: false,
        error: "Email must have a valid top-level domain",
      };
    }

    // Additional security checks
    const securityIssues = [];
    if (email.includes(".."))
      securityIssues.push("Consecutive dots not allowed");
    if (email.startsWith(".") || email.endsWith("."))
      securityIssues.push("Cannot start or end with dot");

    if (securityIssues.length > 0) {
      return { valid: false, error: securityIssues.join(", ") };
    }

    return {
      valid: true,
      normalized: email.toLowerCase().trim(),
      domain,
      local: email.split("@")[0],
    };
  }

  /**
   * Enhanced URL validation with security checks
   * @param {string} url - URL to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateUrl(url, options = {}) {
    const {
      allowedProtocols = ["http:", "https:"],
      allowLocalhost = false,
      allowPrivateIps = false,
      maxLength = 2048,
      requireTld = true,
    } = options;

    if (typeof url !== "string") {
      return { valid: false, error: "URL must be a string" };
    }

    if (url.length > maxLength) {
      return {
        valid: false,
        error: `URL exceeds maximum length of ${maxLength}`,
      };
    }

    try {
      const urlObj = new URL(url);

      // Protocol validation
      if (!allowedProtocols.includes(urlObj.protocol)) {
        return {
          valid: false,
          error: `Protocol ${urlObj.protocol} not allowed. Allowed: ${allowedProtocols.join(", ")}`,
        };
      }

      // Localhost validation
      if (
        !allowLocalhost &&
        (urlObj.hostname === "localhost" || urlObj.hostname === "127.0.0.1")
      ) {
        return { valid: false, error: "Localhost URLs not allowed" };
      }

      // Private IP validation
      if (!allowPrivateIps && this.isPrivateIp(urlObj.hostname)) {
        return { valid: false, error: "Private IP addresses not allowed" };
      }

      // TLD validation
      if (requireTld && !urlObj.hostname.includes(".")) {
        return {
          valid: false,
          error: "URL must have a valid top-level domain",
        };
      }

      return {
        valid: true,
        parsed: {
          protocol: urlObj.protocol,
          hostname: urlObj.hostname,
          pathname: urlObj.pathname,
          search: urlObj.search,
          hash: urlObj.hash,
        },
      };
    } catch (error) {
      return { valid: false, error: "Invalid URL format" };
    }
  }

  /**
   * Check if IP address is private
   * @param {string} ip - IP address to check
   * @returns {boolean} True if private IP
   */
  static isPrivateIp(ip) {
    const privateRanges = [
      /^10\./,
      /^172\.(1[6-9]|2[0-9]|3[0-1])\./,
      /^192\.168\./,
      /^127\./,
      /^169\.254\./,
      /^::1$/,
      /^fc00:/,
      /^fe80:/,
    ];

    return privateRanges.some((range) => range.test(ip));
  }

  /**
   * Validate password strength with accessibility feedback
   * @param {string} password - Password to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with accessibility features
   */
  static validatePassword(password, options = {}) {
    const {
      minLength = 8,
      maxLength = 128,
      requireUppercase = true,
      requireLowercase = true,
      requireNumbers = true,
      requireSymbols = true,
      blockedPatterns = [],
      provideFeedback = true,
    } = options;

    if (typeof password !== "string") {
      return { valid: false, error: "Password must be a string", score: 0 };
    }

    const feedback = [];
    const errors = [];
    let score = 0;

    // Length validation
    if (password.length < minLength) {
      errors.push(`Password must be at least ${minLength} characters long`);
    } else if (password.length >= minLength) {
      score += HELPERS_CONSTANTS.SCORING.PASSWORD_BASE_SCORE;
      if (
        password.length >= HELPERS_CONSTANTS.SCORING.PASSWORD_MIN_SECURE_LENGTH
      )
        score += HELPERS_CONSTANTS.SCORING.PASSWORD_LENGTH_BONUS;
    }

    if (password.length > maxLength) {
      errors.push(`Password must not exceed ${maxLength} characters`);
    }

    // Character type validation
    const hasUppercase = /[A-Z]/.test(password);
    const hasLowercase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSymbols = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    if (requireUppercase && !hasUppercase) {
      errors.push("Password must contain at least one uppercase letter");
    } else if (hasUppercase) {
      score += HELPERS_CONSTANTS.SCORING.PASSWORD_VARIETY_BONUS;
    }

    if (requireLowercase && !hasLowercase) {
      errors.push("Password must contain at least one lowercase letter");
    } else if (hasLowercase) {
      score += HELPERS_CONSTANTS.SCORING.PASSWORD_VARIETY_BONUS;
    }

    if (requireNumbers && !hasNumbers) {
      errors.push("Password must contain at least one number");
    } else if (hasNumbers) {
      score += HELPERS_CONSTANTS.SCORING.PASSWORD_VARIETY_BONUS;
    }

    if (requireSymbols && !hasSymbols) {
      errors.push("Password must contain at least one special character");
    } else if (hasSymbols) {
      score += HELPERS_CONSTANTS.SCORING.PASSWORD_VARIETY_BONUS;
    }

    // Pattern validation
    for (const pattern of blockedPatterns) {
      if (pattern.test(password)) {
        errors.push("Password contains blocked pattern");
        score -= HELPERS_CONSTANTS.SCORING.PASSWORD_REPETITION_PENALTY;
      }
    }

    // Common patterns check
    const commonPatterns = [
      /(.)\1{2,}/, // Repeated characters
      /123456/, // Sequential numbers
      /abcdef/, // Sequential letters
      /password/i, // Common word
      /qwerty/i, // Keyboard pattern
    ];

    for (const pattern of commonPatterns) {
      if (pattern.test(password)) {
        score -= 10;
        if (provideFeedback) {
          feedback.push("Avoid common patterns and repeated characters");
        }
        break;
      }
    }

    // Generate strength feedback
    let strength = "weak";
    if (score >= HELPERS_CONSTANTS.SCORING.PASSWORD_STRENGTH_VERY_STRONG)
      strength = "very strong";
    else if (score >= HELPERS_CONSTANTS.SCORING.PASSWORD_STRENGTH_STRONG)
      strength = "strong";
    else if (score >= HELPERS_CONSTANTS.SCORING.PASSWORD_STRENGTH_MODERATE)
      strength = "moderate";

    if (provideFeedback) {
      if (score < HELPERS_CONSTANTS.SCORING.PASSWORD_STRENGTH_WEAK_THRESHOLD) {
        feedback.push(
          "Consider using a longer password with mixed character types",
        );
      }
      if (!hasSymbols && requireSymbols) {
        feedback.push("Adding special characters improves security");
      }
    }

    return {
      valid: errors.length === 0,
      errors,
      score: Math.max(0, Math.min(100, score)),
      strength,
      feedback,
      hasUppercase,
      hasLowercase,
      hasNumbers,
      hasSymbols,
      length: password.length,
    };
  }

  /**
   * Advanced input sanitization with security features
   * @param {string} input - Input to sanitize
   * @param {Object} options - Sanitization options
   * @returns {string} Sanitized input
   */
  static sanitizeInput(input, options = {}) {
    const {
      allowHtml = false,
      allowUrls = true,
      maxLength = null,
      trimWhitespace = true,
      removeInvisibleChars = true,
      normalizeUnicode = true,
    } = options;

    if (typeof input !== "string") return "";

    let sanitized = input;

    // Trim whitespace
    if (trimWhitespace) {
      sanitized = sanitized.trim();
    }

    // Remove invisible characters
    if (removeInvisibleChars) {
      sanitized = sanitized.replace(/[\u200B-\u200D\uFEFF]/g, "");
    }

    // Normalize unicode
    if (normalizeUnicode) {
      sanitized = sanitized.normalize("NFKC");
    }

    // HTML sanitization
    if (!allowHtml) {
      sanitized = this.escapeHtml(sanitized);
    }

    // URL validation
    if (!allowUrls) {
      sanitized = sanitized.replace(/https?:\/\/[^\s]+/g, "[URL removed]");
    }

    // Length limiting
    if (maxLength && sanitized.length > maxLength) {
      sanitized = sanitized.substring(0, maxLength);
    }

    return sanitized;
  }

  /**
   * Legacy validation methods with enhanced features
   */
  static isValidEmail(email) {
    const result = this.validateEmail(email);
    return result.valid;
  }

  static isValidUrl(url) {
    const result = this.validateUrl(url);
    return result.valid;
  }

  static isNumeric(value) {
    return !isNaN(parseFloat(value)) && isFinite(value);
  }

  static isEmpty(value) {
    return (
      value == null ||
      value === "" ||
      (Array.isArray(value) && value.length === 0) ||
      (typeof value === "object" && Object.keys(value).length === 0)
    );
  }

  /**
   * Validate accessibility requirements for form inputs
   * @param {HTMLElement} input - Input element to validate
   * @returns {Object} Accessibility validation result
   */
  static validateInputAccessibility(input) {
    const issues = [];
    const recommendations = [];

    // Check for label association
    const id = input.getAttribute("id");
    const hasLabel = id && document.querySelector(`label[for="${id}"]`);
    const hasAriaLabel = input.getAttribute("aria-label");
    const hasAriaLabelledBy = input.getAttribute("aria-labelledby");

    if (!hasLabel && !hasAriaLabel && !hasAriaLabelledBy) {
      issues.push("Input lacks proper labeling");
      recommendations.push("Add a label element or aria-label attribute");
    }

    // Check for error handling
    const hasAriaInvalid = input.hasAttribute("aria-invalid");

    if (input.checkValidity && !input.checkValidity() && !hasAriaInvalid) {
      issues.push("Invalid input lacks aria-invalid attribute");
      recommendations.push('Add aria-invalid="true" for invalid inputs');
    }

    // Check contrast for visible elements
    if (this.isElementVisible(input)) {
      const styles = window.getComputedStyle(input);
      const bgColor = styles.backgroundColor;
      const textColor = styles.color;

      if (bgColor !== "rgba(0, 0, 0, 0)" && textColor !== "rgba(0, 0, 0, 0)") {
        const contrastInfo = this.checkColorAccessibility(textColor, bgColor);
        if (!contrastInfo.passesNormal) {
          issues.push(`Insufficient color contrast (${contrastInfo.ratio}:1)`);
          recommendations.push("Increase color contrast to at least 4.5:1");
        }
      }
    }

    return {
      accessible: issues.length === 0,
      issues,
      recommendations,
      score: Math.max(
        0,
        100 -
          issues.length * HELPERS_CONSTANTS.SCORING.ACCESSIBILITY_SCORE_PENALTY,
      ),
    };
  } // Enhanced Browser detection with privacy and feature support
  /**
   * Comprehensive browser information with privacy considerations
   * @param {Object} options - Detection options
   * @returns {Object} Browser information
   */
  static getBrowserInfo(options = {}) {
    const {
      includeVersion = false,
      includeFeatureSupport = false,
      respectPrivacy = true,
    } = options;

    const ua = navigator.userAgent;
    const info = {
      name: "unknown",
      version: "unknown",
      engine: "unknown",
      mobile: /Mobile|Android|iPhone|iPad/.test(ua),
      touch: "ontouchstart" in window,
    };

    // Browser detection with version extraction
    const browsers = [
      { name: "Chrome", pattern: /Chrome\/(\d+)/, engine: "Blink" },
      { name: "Firefox", pattern: /Firefox\/(\d+)/, engine: "Gecko" },
      { name: "Safari", pattern: /Safari\/(\d+)/, engine: "WebKit" },
      { name: "Edge", pattern: /Edg\/(\d+)/, engine: "Blink" },
      { name: "Opera", pattern: /OPR\/(\d+)/, engine: "Blink" },
      {
        name: "IE",
        pattern: /MSIE (\d+)|Trident.*rv:(\d+)/,
        engine: "Trident",
      },
    ];

    for (const browser of browsers) {
      const match = ua.match(browser.pattern);
      if (match) {
        info.name = browser.name;
        info.engine = browser.engine;
        if (includeVersion && match[1]) {
          info.version = match[1];
        }
        break;
      }
    }

    // Feature support detection
    if (includeFeatureSupport) {
      info.features = {
        webgl: this.supportsWebGL(),
        webgl2: this.supportsWebGL2(),
        localStorage: this.supportsLocalStorage(),
        sessionStorage: this.supportsSessionStorage(),
        indexedDB: this.supportsIndexedDB(),
        webWorkers: typeof Worker !== "undefined",
        serviceWorkers: "serviceWorker" in navigator,
        webAssembly: typeof WebAssembly !== "undefined",
        es6Modules: this.supportsES6Modules(),
        css3: this.supportsCSS3(),
        mediaQueries: this.supportsMediaQueries(),
        geolocation: "geolocation" in navigator,
        notifications: "Notification" in window,
        fullscreen: this.supportsFullscreen(),
        webRTC: this.supportsWebRTC(),
        speechRecognition: this.supportsSpeechRecognition(),
        intersectionObserver: "IntersectionObserver" in window,
        resizeObserver: "ResizeObserver" in window,
      };
    }

    // Privacy-conscious reporting
    if (respectPrivacy) {
      // Avoid fingerprinting by limiting detailed version info
      if (info.version && info.version.length > 2) {
        info.version = `${info.version.substring(0, 2)}x`;
      }
    }

    return info;
  }

  /**
   * Enhanced WebGL support detection
   * @param {number} version - WebGL version to check (1 or 2)
   * @returns {boolean} WebGL support status
   */
  static supportsWebGL(version = 1) {
    try {
      const canvas = document.createElement("canvas");
      const context =
        version === 2
          ? canvas.getContext("webgl2")
          : canvas.getContext("webgl") ||
            canvas.getContext("experimental-webgl");
      return !!context;
    } catch {
      return false;
    }
  }

  static supportsWebGL2() {
    return this.supportsWebGL(2);
  }

  /**
   * Enhanced storage support detection
   * @param {string} type - Storage type ('local', 'session', 'indexed')
   * @returns {boolean} Storage support status
   */
  static supportsLocalStorage() {
    try {
      const test = "__localStorage_test__";
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static supportsSessionStorage() {
    try {
      const test = "__sessionStorage_test__";
      sessionStorage.setItem(test, test);
      sessionStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  static supportsIndexedDB() {
    return "indexedDB" in window;
  }

  /**
   * Check for ES6 modules support
   * @returns {boolean} ES6 modules support
   */
  static supportsES6Modules() {
    try {
      new Function('import("")');
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Check for CSS3 support
   * @returns {boolean} CSS3 support
   */
  static supportsCSS3() {
    const testElement = document.createElement("div");
    const cssProperties = [
      "transform",
      "transition",
      "animation",
      "borderRadius",
    ];
    return cssProperties.some((prop) => prop in testElement.style);
  }

  /**
   * Check for media queries support
   * @returns {boolean} Media queries support
   */
  static supportsMediaQueries() {
    return typeof window.matchMedia !== "undefined";
  }

  /**
   * Check for fullscreen API support
   * @returns {boolean} Fullscreen support
   */
  static supportsFullscreen() {
    const element = document.documentElement;
    return !!(
      element.requestFullscreen ||
      element.webkitRequestFullscreen ||
      element.mozRequestFullScreen ||
      element.msRequestFullscreen
    );
  }

  /**
   * Check for WebRTC support
   * @returns {boolean} WebRTC support
   */
  static supportsWebRTC() {
    return !!(
      window.RTCPeerConnection ||
      window.webkitRTCPeerConnection ||
      window.mozRTCPeerConnection
    );
  }

  /**
   * Check for speech recognition support
   * @returns {boolean} Speech recognition support
   */
  static supportsSpeechRecognition() {
    return !!(window.SpeechRecognition || window.webkitSpeechRecognition);
  }

  /**
   * Responsive device type detection with accessibility considerations
   * @param {Object} options - Detection options
   * @returns {Object} Device information
   */
  static getDeviceInfo(options = {}) {
    const {
      includeOrientation = false,
      includePixelRatio = false,
      includeTouchPoints = false,
    } = options;

    const width = window.innerWidth;
    const height = window.innerHeight;

    let deviceType = "desktop";
    let breakpoint = "xl";

    if (width < HELPERS_CONSTANTS.DEVICE.MOBILE_BREAKPOINT) {
      deviceType = "mobile";
      breakpoint = "xs";
    } else if (width < HELPERS_CONSTANTS.DEVICE.TABLET_BREAKPOINT) {
      deviceType = "mobile";
      breakpoint = "sm";
    } else if (width < HELPERS_CONSTANTS.DEVICE.DESKTOP_BREAKPOINT) {
      deviceType = "tablet";
      breakpoint = "md";
    } else if (width < HELPERS_CONSTANTS.DEVICE.LARGE_DESKTOP_BREAKPOINT) {
      deviceType = "desktop";
      breakpoint = "lg";
    }

    const deviceInfo = {
      type: deviceType,
      breakpoint,
      width,
      height,
      mobile: deviceType === "mobile",
      tablet: deviceType === "tablet",
      desktop: deviceType === "desktop",
    };

    if (includeOrientation) {
      deviceInfo.orientation = width > height ? "landscape" : "portrait";
    }

    if (includePixelRatio) {
      deviceInfo.pixelRatio = window.devicePixelRatio || 1;
      deviceInfo.highDPI =
        deviceInfo.pixelRatio > HELPERS_CONSTANTS.DEVICE.HIGH_DPI_THRESHOLD;
    }

    if (includeTouchPoints && "maxTouchPoints" in navigator) {
      deviceInfo.maxTouchPoints = navigator.maxTouchPoints;
      deviceInfo.multiTouch = navigator.maxTouchPoints > 1;
    }

    return deviceInfo;
  }

  /**
   * Legacy compatibility method
   */
  static getDeviceType() {
    return this.getDeviceInfo().type;
  }

  /**
   * Check for accessibility preferences
   * @returns {Object} Accessibility preferences
   */
  static getAccessibilityPreferences() {
    const preferences = {
      reduceMotion: false,
      highContrast: false,
      largeText: false,
      reducedTransparency: false,
    };

    // Check for prefers-reduced-motion
    if (window.matchMedia) {
      preferences.reduceMotion = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      ).matches;
      preferences.highContrast = window.matchMedia(
        "(prefers-contrast: high)",
      ).matches;

      // Check for other accessibility preferences if supported
      try {
        preferences.reducedTransparency = window.matchMedia(
          "(prefers-reduced-transparency: reduce)",
        ).matches;
      } catch (e) {
        // Not all browsers support this yet
      }
    }

    return preferences;
  }

  /**
   * Performance testing with accessibility considerations
   * @param {Object} options - Performance test options
   * @returns {Object} Performance metrics
   */
  static getPerformanceMetrics(options = {}) {
    const {
      includeMemory = false,
      includeConnection = false,
      respectBattery = true,
    } = options;

    const metrics = {
      timestamp: Date.now(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookieEnabled: navigator.cookieEnabled,
      onLine: navigator.onLine,
    };

    // Performance timing
    if (performance && performance.timing) {
      const { timing } = performance;
      metrics.pageLoadTime = timing.loadEventEnd - timing.navigationStart;
      metrics.domContentLoaded =
        timing.domContentLoadedEventEnd - timing.navigationStart;
      metrics.domInteractive = timing.domInteractive - timing.navigationStart;
    }

    // Memory information (if available and permission granted)
    if (includeMemory && "memory" in performance) {
      metrics.memory = {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }

    // Connection information (if available)
    if (includeConnection && "connection" in navigator) {
      const { connection } = navigator;
      metrics.connection = {
        effectiveType: connection.effectiveType,
        downlink: connection.downlink,
        rtt: connection.rtt,
      };
    }

    // Battery consideration
    if (respectBattery && "getBattery" in navigator) {
      navigator
        .getBattery()
        .then((battery) => {
          if (battery.level < HELPERS_CONSTANTS.DEVICE.LOW_BATTERY_THRESHOLD) {
            metrics.lowBattery = true;
          }
        })
        .catch(() => {
          // Battery API not available
        });
    }

    return metrics;
  } // Enhanced Ethics-specific utilities with accessibility and privacy
  /**
   * Advanced ethics score calculation with weighting and normalization
   * @param {Map|Object} metrics - Ethics metrics
   * @param {Object} options - Calculation options
   * @returns {number} Normalized ethics score (0-100)
   */
  static calculateEthicsScore(metrics, options = {}) {
    const {
      normalizationMethod = "weighted",
      minScore = 0,
      maxScore = 100,
      defaultWeight = 1,
      penalizeIncomplete = true,
    } = options;

    if (
      !metrics ||
      (typeof metrics.size === "number"
        ? metrics.size === 0
        : Object.keys(metrics).length === 0)
    ) {
      return penalizeIncomplete ? 0 : HELPERS_CONSTANTS.SCORING.NEUTRAL_SCORE; // Neutral score for incomplete data
    }

    let totalScore = 0;
    let totalWeight = 0;
    let validMetrics = 0;

    const processMetric = (metric, _key) => {
      if (typeof metric === "object" && metric !== null) {
        const value = typeof metric.value === "number" ? metric.value : 0;
        const weight =
          typeof metric.weight === "number" ? metric.weight : defaultWeight;
        const importance =
          typeof metric.importance === "number" ? metric.importance : 1;

        if (value >= 0 && value <= 100) {
          totalScore += value * weight * importance;
          totalWeight += weight * importance;
          validMetrics++;
        }
      } else if (typeof metric === "number" && metric >= 0 && metric <= 100) {
        totalScore += metric * defaultWeight;
        totalWeight += defaultWeight;
        validMetrics++;
      }
    };

    if (metrics instanceof Map) {
      metrics.forEach(processMetric);
    } else {
      Object.entries(metrics).forEach(([key, metric]) =>
        processMetric(metric, key),
      );
    }

    if (validMetrics === 0) {
      return penalizeIncomplete ? 0 : HELPERS_CONSTANTS.SCORING.NEUTRAL_SCORE;
    }

    let finalScore;

    switch (normalizationMethod) {
      case "weighted":
        finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
        break;
      case "average":
        finalScore = totalScore / validMetrics;
        break;
      case "harmonic": {
        // Harmonic mean - more sensitive to low scores
        const harmonicSum = Array.from(
          metrics instanceof Map ? metrics.values() : Object.values(metrics),
        )
          .filter(
            (m) =>
              typeof m === "number" ||
              (typeof m === "object" && typeof m.value === "number"),
          )
          .reduce((sum, m) => {
            const value = typeof m === "number" ? m : m.value;
            return sum + (value > 0 ? 1 / value : 0);
          }, 0);
        finalScore = harmonicSum > 0 ? validMetrics / harmonicSum : 0;
        break;
      }
      default:
        finalScore = totalWeight > 0 ? totalScore / totalWeight : 0;
    }

    return this.clamp(Math.round(finalScore), minScore, maxScore);
  }

  /**
   * Enhanced ethics grading with detailed feedback
   * @param {number} score - Ethics score (0-100)
   * @param {Object} options - Grading options
   * @returns {Object} Detailed grade information
   */
  static getEthicsGrade(score, options = {}) {
    const { includeAdvice = true, includeAccessibility = true } = options;

    if (typeof score !== "number" || score < 0 || score > 100) {
      return {
        grade: "Invalid",
        description: "Invalid score provided",
        level: "error",
        color: "#ff0000",
        score: 0,
      };
    }

    let grade,
      description,
      level,
      color,
      advice = [];

    if (score >= HELPERS_CONSTANTS.SCORING.EXCELLENT_THRESHOLD) {
      grade = "A+";
      description = "Excellent";
      level = "excellent";
      color = "#00aa00";
      if (includeAdvice) {
        advice = [
          "Outstanding ethical decision-making",
          "Continue to maintain these high standards",
          "Consider mentoring others in ethical practices",
        ];
      }
    } else if (score >= HELPERS_CONSTANTS.SCORING.GOOD_THRESHOLD) {
      grade = "A";
      description = "Very Good";
      level = "very-good";
      color = "#44aa00";
      if (includeAdvice) {
        advice = [
          "Strong ethical performance",
          "Look for opportunities to reach excellence",
          "Review any areas that scored below 90",
        ];
      }
    } else if (score >= HELPERS_CONSTANTS.SCORING.SATISFACTORY_THRESHOLD) {
      grade = "B";
      description = "Good";
      level = "good";
      color = "#88aa00";
      if (includeAdvice) {
        advice = [
          "Good ethical foundation",
          "Focus on improving consistency",
          "Consider additional ethical training",
        ];
      }
    } else if (score >= HELPERS_CONSTANTS.SCORING.NEEDS_IMPROVEMENT_THRESHOLD) {
      grade = "C";
      description = "Fair";
      level = "fair";
      color = "#aaaa00";
      if (includeAdvice) {
        advice = [
          "Meets basic ethical standards",
          "Significant room for improvement",
          "Review ethical guidelines and principles",
        ];
      }
    } else if (score >= HELPERS_CONSTANTS.SCORING.POOR_THRESHOLD) {
      grade = "D";
      description = "Needs Improvement";
      level = "needs-improvement";
      color = "#aa6600";
      if (includeAdvice) {
        advice = [
          "Below acceptable ethical standards",
          "Immediate attention required",
          "Seek guidance from ethical advisors",
        ];
      }
    } else {
      grade = "F";
      description = "Poor";
      level = "poor";
      color = "#aa0000";
      if (includeAdvice) {
        advice = [
          "Serious ethical concerns identified",
          "Comprehensive ethical review needed",
          "Consider professional ethical training",
        ];
      }
    }

    const result = {
      score,
      grade,
      description,
      level,
      color,
      percentile: Math.round(score),
      passed: score >= HELPERS_CONSTANTS.SCORING.PASSING_THRESHOLD,
    };

    if (includeAdvice) {
      result.advice = advice;
    }

    // Accessibility features
    if (includeAccessibility) {
      result.accessibility = {
        ariaLabel: `Ethics score: ${score} out of 100, Grade ${grade}, ${description}`,
        colorBlindSafeColor: this.getEthicsColor(score, {
          colorBlindSafe: true,
        }),
        highContrastColor: this.getEthicsColor(score, { highContrast: true }),
        screenReaderText: this.formatForScreenReader(
          `Your ethics score is ${score} points out of 100, earning a grade of ${grade}, which is considered ${description.toLowerCase()}.`,
        ),
      };
    }

    return result;
  }

  /**
   * Generate contextual ethics insights
   * @param {number} oldValue - Previous score
   * @param {number} newValue - Current score
   * @param {string} category - Category name
   * @param {Object} options - Insight options
   * @returns {Object} Insight information
   */
  static generateEthicsInsight(oldValue, newValue, category, options = {}) {
    const {
      includePercentage = true,
      includeRecommendations = true,
      includeAccessibility = true,
    } = options;

    const change = newValue - oldValue;
    const absChange = Math.abs(change);
    const percentageChange = oldValue > 0 ? (change / oldValue) * 100 : 0;

    let intensity = "slightly";
    let significance = "minor";

    if (absChange > HELPERS_CONSTANTS.SCORING.SIGNIFICANT_CHANGE_THRESHOLD) {
      intensity = "significantly";
      significance = "major";
    } else if (absChange > 10) {
      intensity = "moderately";
      significance = "moderate";
    }

    const direction = change > 0 ? "improved" : "declined";
    const directionColor = change > 0 ? "#00aa00" : "#aa0000";

    let message = `${category} has ${intensity} ${direction} by ${absChange} points`;
    if (includePercentage && oldValue > 0) {
      message += ` (${Math.abs(percentageChange).toFixed(1)}%)`;
    }

    const insight = {
      category,
      oldValue,
      newValue,
      change,
      absChange,
      percentageChange,
      direction,
      intensity,
      significance,
      message,
      color: directionColor,
      trend: change > 0 ? "positive" : change < 0 ? "negative" : "stable",
    };

    if (includeRecommendations) {
      insight.recommendations = this.generateEthicsRecommendations(
        newValue,
        category,
        change,
      );
    }

    if (includeAccessibility) {
      insight.accessibility = {
        ariaLabel: `${category}: ${direction} from ${oldValue} to ${newValue} points`,
        screenReaderText: this.formatForScreenReader(message),
        announcement: `${category} score has ${direction} ${intensity}. New score: ${newValue} points.`,
      };
    }

    return insight;
  }

  /**
   * Generate contextual recommendations based on ethics performance
   * @param {number} score - Current score
   * @param {string} category - Category name
   * @param {number} change - Score change
   * @returns {Array} Array of recommendations
   */
  static generateEthicsRecommendations(score, category, change = 0) {
    const recommendations = [];

    // Score-based recommendations
    if (score < HELPERS_CONSTANTS.SCORING.POOR_PERFORMANCE_THRESHOLD) {
      recommendations.push(
        `Critical: ${category} requires immediate attention and improvement`,
      );
      recommendations.push("Consider consulting with ethics experts");
      recommendations.push("Review fundamental ethical principles");
    } else if (
      score < HELPERS_CONSTANTS.SCORING.AVERAGE_PERFORMANCE_THRESHOLD
    ) {
      recommendations.push(`${category} needs improvement to meet standards`);
      recommendations.push("Implement additional training or guidelines");
    } else if (
      score < HELPERS_CONSTANTS.SCORING.EXCELLENT_PERFORMANCE_THRESHOLD
    ) {
      recommendations.push(
        `${category} is performing well but has room for excellence`,
      );
      recommendations.push("Fine-tune processes for optimal performance");
    } else {
      recommendations.push(
        `Excellent ${category} performance - maintain current standards`,
      );
    }

    // Change-based recommendations
    if (change < HELPERS_CONSTANTS.SCORING.DECLINING_TREND_THRESHOLD) {
      recommendations.push("Investigate causes of recent decline");
      recommendations.push("Implement corrective measures immediately");
    } else if (change > 10) {
      recommendations.push("Identify successful practices to replicate");
      recommendations.push("Document improvements for future reference");
    }

    // Category-specific recommendations
    const categorySpecific = {
      privacy: [
        "Review data collection practices",
        "Ensure transparent privacy policies",
        "Implement data minimization principles",
      ],
      fairness: [
        "Audit for algorithmic bias",
        "Ensure equal treatment across demographics",
        "Implement fairness metrics and monitoring",
      ],
      transparency: [
        "Improve explainability of decisions",
        "Provide clear documentation",
        "Enable user understanding of processes",
      ],
      accountability: [
        "Establish clear responsibility chains",
        "Implement audit trails",
        "Create feedback mechanisms",
      ],
    };

    const categoryKey = category.toLowerCase();
    if (categorySpecific[categoryKey]) {
      recommendations.push(...categorySpecific[categoryKey].slice(0, 2));
    }

    return recommendations.slice(
      0,
      HELPERS_CONSTANTS.SCORING.MAX_RECOMMENDATIONS,
    ); // Limit to 5 recommendations
  } // Enhanced Simulation utilities with accessibility and performance
  /**
   * Generate unique scenario identifier with metadata
   * @param {Object} options - Generation options
   * @returns {string} Unique scenario ID
   */
  static generateScenarioId(options = {}) {
    const {
      prefix = "scenario",
      includeTimestamp = true,
      includeRandom = true,
      includeVersion = false,
      version = "1.0",
    } = options;

    const parts = [prefix];

    if (includeTimestamp) {
      parts.push(Date.now().toString());
    }

    if (includeRandom) {
      parts.push(
        Math.random()
          .toString(HELPERS_CONSTANTS.GENERATION.ID_RADIX)
          .substring(
            HELPERS_CONSTANTS.GENERATION.ID_START_INDEX,
            HELPERS_CONSTANTS.GENERATION.ID_END_INDEX,
          ),
      );
    }

    if (includeVersion) {
      parts.push(`v${version}`);
    }

    return parts.join("_");
  }

  /**
   * Enhanced progress bar with accessibility features
   * @param {number} current - Current progress value
   * @param {number} total - Total value
   * @param {Object} options - Progress bar options
   * @returns {Object} Progress bar data
   */
  static createProgressBar(current, total, options = {}) {
    const {
      width = 200,
      includePercentage = true,
      includeEstimate = false,
      startTime = null,
      precision = 1,
      accessibleText = true,
    } = options;

    const safeTotal = Math.max(total, 1);
    const safeCurrent = Math.max(0, Math.min(current, safeTotal));
    const percentage = (safeCurrent / safeTotal) * 100;
    const progressWidth = (percentage / 100) * width;

    const progress = {
      current: safeCurrent,
      total: safeTotal,
      percentage: this.roundTo(percentage, precision),
      width: this.roundTo(progressWidth, precision),
      completed: safeCurrent >= safeTotal,
      remaining: safeTotal - safeCurrent,
    };

    // Text representations
    progress.text = `${safeCurrent}/${safeTotal}`;
    if (includePercentage) {
      progress.percentageText = `${progress.percentage}%`;
    }

    // Time estimation
    if (includeEstimate && startTime && safeCurrent > 0) {
      const elapsed = Date.now() - startTime;
      const rate = safeCurrent / elapsed;
      const estimatedTotal = safeTotal / rate;
      const remaining = estimatedTotal - elapsed;

      progress.timeEstimate = {
        elapsed: this.formatDuration(elapsed),
        remaining: this.formatDuration(Math.max(0, remaining)),
        total: this.formatDuration(estimatedTotal),
      };
    }

    // Accessibility features
    if (accessibleText) {
      progress.accessibility = {
        ariaValueNow: safeCurrent,
        ariaValueMin: 0,
        ariaValueMax: safeTotal,
        ariaLabel: `Progress: ${safeCurrent} of ${safeTotal} completed`,
        ariaValueText: `${progress.percentage}% complete`,
        screenReaderText: this.formatForScreenReader(
          `Progress is ${progress.percentage} percent complete. ${progress.remaining} items remaining.`,
        ),
      };
    }

    return progress;
  }

  /**
   * Generate comprehensive simulation report with accessibility
   * @param {Object} simulation - Simulation data
   * @param {Object} options - Report options
   * @returns {Object} Detailed simulation report
   */
  static generateSimulationReport(simulation, options = {}) {
    const {
      includeMetrics = true,
      includeInsights = true,
      includeRecommendations = true,
      includeAccessibility = true,
    } = options;

    if (!simulation || typeof simulation !== "object") {
      throw new Error("Invalid simulation data provided");
    }

    const ethicsScore = this.calculateEthicsScore(
      simulation.ethicsMetrics || new Map(),
    );
    const grade = this.getEthicsGrade(ethicsScore, {
      includeAdvice: true,
      includeAccessibility,
    });

    const report = {
      metadata: {
        simulationId: simulation.id || this.generateScenarioId(),
        title: simulation.title || "Untitled Simulation",
        completedAt: new Date().toISOString(),
        duration: simulation.state?.timeElapsed || 0,
        version: simulation.version || "1.0",
        reportGenerated: Date.now(),
      },
      performance: {
        score: ethicsScore,
        grade: grade.grade,
        gradeDescription: grade.description,
        level: grade.level,
        passed: grade.passed,
      },
      statistics: {
        decisions: simulation.state?.decisions?.length || 0,
        scenarios: simulation.scenarios?.length || 0,
        completionRate: this.calculateCompletionRate(simulation),
        averageDecisionTime: this.calculateAverageDecisionTime(simulation),
      },
    };

    // Include detailed metrics
    if (includeMetrics && simulation.ethicsMetrics) {
      report.ethicsMetrics = this.processEthicsMetrics(
        simulation.ethicsMetrics,
      );
    }

    // Generate insights
    if (includeInsights) {
      report.insights = this.generateSimulationInsights(simulation);
    }

    // Generate recommendations
    if (includeRecommendations) {
      report.recommendations =
        this.generateSimulationRecommendations(simulation);
    }

    // Accessibility features
    if (includeAccessibility) {
      report.accessibility = {
        summary: this.formatForScreenReader(
          `Simulation ${report.metadata.title} completed with a score of ${ethicsScore} points, earning grade ${grade.grade}.`,
        ),
        ariaLabel: `Simulation report for ${report.metadata.title}`,
        keyFindings: this.generateAccessibleSummary(report),
        navigation: this.generateReportNavigation(report),
      };
    }

    return report;
  }

  /**
   * Calculate simulation completion rate
   * @param {Object} simulation - Simulation data
   * @returns {number} Completion rate (0-100)
   */
  static calculateCompletionRate(simulation) {
    if (!simulation.scenarios || simulation.scenarios.length === 0) return 0;

    const completedScenarios = simulation.scenarios.filter(
      (scenario) => scenario.completed || scenario.status === "completed",
    ).length;

    return this.roundTo(
      (completedScenarios / simulation.scenarios.length) * 100,
      1,
    );
  }

  /**
   * Calculate average decision time
   * @param {Object} simulation - Simulation data
   * @returns {number} Average decision time in milliseconds
   */
  static calculateAverageDecisionTime(simulation) {
    const decisions = simulation.state?.decisions || [];
    if (decisions.length === 0) return 0;

    const totalTime = decisions.reduce((sum, decision) => {
      return sum + (decision.timeSpent || decision.duration || 0);
    }, 0);

    return Math.round(totalTime / decisions.length);
  }

  /**
   * Process ethics metrics for reporting
   * @param {Map|Object} metrics - Raw metrics data
   * @returns {Object} Processed metrics
   */
  static processEthicsMetrics(metrics) {
    const processed = {};

    const processMetric = (metric, key) => {
      if (typeof metric === "object" && metric !== null) {
        processed[key] = {
          value: metric.value || 0,
          weight: metric.weight || 1,
          label: metric.label || key,
          description: metric.description || "",
          category: metric.category || "general",
        };
      } else if (typeof metric === "number") {
        processed[key] = {
          value: metric,
          weight: 1,
          label: key,
          description: "",
          category: "general",
        };
      }
    };

    if (metrics instanceof Map) {
      metrics.forEach(processMetric);
    } else if (typeof metrics === "object") {
      Object.entries(metrics).forEach(([key, metric]) =>
        processMetric(metric, key),
      );
    }

    return processed;
  }

  /**
   * Generate insights from simulation data
   * @param {Object} simulation - Simulation data
   * @returns {Array} Array of insights
   */
  static generateSimulationInsights(simulation) {
    const insights = [];
    const decisions = simulation.state?.decisions || [];
    const metrics = simulation.ethicsMetrics || new Map();

    // Time-based insights
    if (decisions.length > 0) {
      const avgDecisionTime = this.calculateAverageDecisionTime(simulation);
      insights.push({
        type: "performance",
        category: "time",
        message: `Average decision time: ${this.formatDuration(avgDecisionTime)}`,
        value: avgDecisionTime,
        benchmark: 30000, // 30 seconds
        status:
          avgDecisionTime <= HELPERS_CONSTANTS.TIME.GOOD_DECISION_TIME
            ? "good"
            : "attention",
      });

      // Decision pattern analysis
      const quickDecisions = decisions.filter(
        (d) => (d.timeSpent || 0) < HELPERS_CONSTANTS.TIME.QUICK_DECISION_TIME,
      ).length;
      const slowDecisions = decisions.filter(
        (d) => (d.timeSpent || 0) > HELPERS_CONSTANTS.TIME.SLOW_DECISION_TIME,
      ).length;

      if (
        quickDecisions >
        decisions.length * HELPERS_CONSTANTS.TIME.QUICK_DECISION_RATIO
      ) {
        insights.push({
          type: "behavior",
          category: "decision-speed",
          message:
            "Tendency to make quick decisions - consider taking more time for complex scenarios",
          value: quickDecisions,
          status: "caution",
        });
      }

      if (
        slowDecisions >
        decisions.length * HELPERS_CONSTANTS.ANALYSIS.SLOW_DECISION_RATIO
      ) {
        insights.push({
          type: "behavior",
          category: "decision-speed",
          message:
            "Some decisions took longer than usual - this suggests careful consideration",
          value: slowDecisions,
          status: "positive",
        });
      }
    }

    // Ethics performance insights
    const processMetricInsight = (metric, name) => {
      const value = typeof metric === "object" ? metric.value : metric;
      const label = typeof metric === "object" ? metric.label : name;

      if (typeof value === "number") {
        if (value >= HELPERS_CONSTANTS.ANALYSIS.HIGH_PERFORMANCE_THRESHOLD) {
          insights.push({
            type: "ethics",
            category: name,
            message: `Strong performance in ${label}`,
            value,
            status: "excellent",
          });
        } else if (
          value <= HELPERS_CONSTANTS.ANALYSIS.LOW_PERFORMANCE_THRESHOLD
        ) {
          insights.push({
            type: "ethics",
            category: name,
            message: `Opportunity to improve ${label}`,
            value,
            status: "needs-improvement",
          });
        }
      }
    };

    if (metrics instanceof Map) {
      metrics.forEach(processMetricInsight);
    } else if (typeof metrics === "object") {
      Object.entries(metrics).forEach(([name, metric]) =>
        processMetricInsight(metric, name),
      );
    }

    return insights.slice(0, 10); // Limit to 10 insights
  }

  /**
   * Generate recommendations from simulation data
   * @param {Object} simulation - Simulation data
   * @returns {Array} Array of recommendations
   */
  static generateSimulationRecommendations(simulation) {
    const recommendations = [];
    const ethicsScore = this.calculateEthicsScore(
      simulation.ethicsMetrics || new Map(),
    );
    const completionRate = this.calculateCompletionRate(simulation);

    // Score-based recommendations
    if (ethicsScore < HELPERS_CONSTANTS.ANALYSIS.ETHICS_WARNING_THRESHOLD) {
      recommendations.push({
        priority: "high",
        category: "ethics",
        title: "Review Ethical Principles",
        description:
          "Consider reviewing the ethical principles before retrying",
        action: "study",
        resources: ["Ethics Guidelines", "Decision Framework"],
      });

      recommendations.push({
        priority: "high",
        category: "process",
        title: "Take More Time",
        description:
          "Take more time to consider the consequences of each decision",
        action: "reflect",
        resources: ["Decision Checklist", "Impact Assessment"],
      });
    }

    // Completion-based recommendations
    if (
      completionRate < HELPERS_CONSTANTS.ANALYSIS.COMPLETION_WARNING_THRESHOLD
    ) {
      recommendations.push({
        priority: "medium",
        category: "completion",
        title: "Complete All Scenarios",
        description:
          "Try to complete all scenarios for a comprehensive evaluation",
        action: "continue",
        resources: ["Scenario Guide", "Progress Tracker"],
      });
    }

    // Metric-specific recommendations
    const processMetricRecommendation = (metric, name) => {
      const value = typeof metric === "object" ? metric.value : metric;
      const label = typeof metric === "object" ? metric.label : name;

      if (
        typeof value === "number" &&
        value < HELPERS_CONSTANTS.ANALYSIS.CRITICAL_VALUE_THRESHOLD
      ) {
        recommendations.push({
          priority: "medium",
          category: "improvement",
          title: `Improve ${label}`,
          description: `Focus on improving ${label} in future simulations`,
          action: "focus",
          resources: [`${label} Guide`, "Best Practices"],
        });
      }
    };

    const metrics = simulation.ethicsMetrics || new Map();
    if (metrics instanceof Map) {
      metrics.forEach(processMetricRecommendation);
    } else if (typeof metrics === "object") {
      Object.entries(metrics).forEach(([name, metric]) =>
        processMetricRecommendation(metric, name),
      );
    }

    return recommendations.slice(
      0,
      HELPERS_CONSTANTS.ANALYSIS.EXTENDED_RECOMMENDATIONS,
    ); // Limit to 8 recommendations
  }

  /**
   * Generate accessible summary for screen readers
   * @param {Object} report - Report data
   * @returns {string} Accessible summary
   */
  static generateAccessibleSummary(report) {
    const parts = [
      `Simulation ${report.metadata.title} has been completed.`,
      `Final score: ${report.performance.score} out of 100 points.`,
      `Grade: ${report.performance.grade}, ${report.performance.gradeDescription}.`,
      `${report.statistics.decisions} decisions made across ${report.statistics.scenarios} scenarios.`,
    ];

    if (report.insights && report.insights.length > 0) {
      parts.push(`${report.insights.length} key insights identified.`);
    }

    if (report.recommendations && report.recommendations.length > 0) {
      parts.push(
        `${report.recommendations.length} recommendations provided for improvement.`,
      );
    }

    return this.formatForScreenReader(parts.join(" "));
  }

  /**
   * Generate navigation structure for report accessibility
   * @param {Object} report - Report data
   * @returns {Array} Navigation structure
   */
  static generateReportNavigation(report) {
    return [
      { section: "metadata", label: "Simulation Information", priority: 1 },
      { section: "performance", label: "Performance Summary", priority: 1 },
      { section: "statistics", label: "Statistics", priority: 2 },
      ...(report.ethicsMetrics
        ? [{ section: "ethicsMetrics", label: "Ethics Metrics", priority: 2 }]
        : []),
      ...(report.insights
        ? [{ section: "insights", label: "Insights", priority: 3 }]
        : []),
      ...(report.recommendations
        ? [
            {
              section: "recommendations",
              label: "Recommendations",
              priority: 3,
            },
          ]
        : []),
    ];
  } // Enhanced File utilities with security and accessibility
  /**
   * Secure file download with validation and accessibility
   * @param {string|Blob} content - File content
   * @param {string} filename - File name
   * @param {Object} options - Download options
   */
  static downloadFile(content, filename, options = {}) {
    const {
      mimeType = "text/plain",
      charset = "utf-8",
      validateFilename = true,
      announceDownload = true,
      maxSizeBytes = HELPERS_CONSTANTS.FILE_SIZE.DEFAULT_TEXT_LIMIT_MB *
        HELPERS_CONSTANTS.FILE_SIZE.BYTES_PER_KB *
        HELPERS_CONSTANTS.FILE_SIZE.KB_PER_MB, // 100MB default limit
      allowedExtensions = null,
    } = options;

    // Validate filename for security
    if (validateFilename) {
      const validation = this.validateFilename(filename, { allowedExtensions });
      if (!validation.valid) {
        throw new Error(`Invalid filename: ${validation.error}`);
      }
      filename = validation.sanitized;
    }

    // Create blob with proper encoding
    let blob;
    if (content instanceof Blob) {
      blob = content;
    } else {
      const fullMimeType = mimeType.includes("charset")
        ? mimeType
        : `${mimeType};charset=${charset}`;
      blob = new Blob([content], { type: fullMimeType });
    }

    // Check file size
    if (blob.size > maxSizeBytes) {
      throw new Error(
        `File size (${blob.size} bytes) exceeds maximum allowed size (${maxSizeBytes} bytes)`,
      );
    }

    // Create secure download
    const url = URL.createObjectURL(blob);

    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      link.style.display = "none";

      // Accessibility attributes
      link.setAttribute("aria-label", `Download ${filename}`);

      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Announce download to screen readers
      if (announceDownload) {
        this.announceToScreenReader(
          `Download started for ${filename}`,
          "polite",
        );
      }
    } finally {
      // Clean up object URL
      setTimeout(
        () => URL.revokeObjectURL(url),
        HELPERS_CONSTANTS.TIME.URL_CLEANUP_DELAY,
      );
    }
  }

  /**
   * Validate filename for security and compatibility
   * @param {string} filename - Filename to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result
   */
  static validateFilename(filename, options = {}) {
    const {
      maxLength = 255,
      allowedExtensions = null,
      allowSpaces = true,
      allowUnicode = true,
    } = options;

    if (typeof filename !== "string") {
      return { valid: false, error: "Filename must be a string" };
    }

    if (filename.length === 0) {
      return { valid: false, error: "Filename cannot be empty" };
    }

    if (filename.length > maxLength) {
      return {
        valid: false,
        error: `Filename too long (max ${maxLength} characters)`,
      };
    }

    // Check for dangerous characters
    const dangerousChars = /[<>:"|?*\\/]/;
    // Check for control characters (0-31)
    const hasControlChars = filename
      .split("")
      .some(
        (char) =>
          char.charCodeAt(0) <
          HELPERS_CONSTANTS.FILE_SIZE.CONTROL_CHAR_THRESHOLD,
      );
    if (dangerousChars.test(filename) || hasControlChars) {
      return { valid: false, error: "Filename contains invalid characters" };
    }

    // Check for reserved names (Windows)
    const reservedNames = /^(CON|PRN|AUX|NUL|COM[1-9]|LPT[1-9])(\.|$)/i;
    if (reservedNames.test(filename)) {
      return { valid: false, error: "Filename uses a reserved name" };
    }

    // Validate extension if specified
    if (allowedExtensions) {
      const extension = filename.split(".").pop()?.toLowerCase();
      if (!extension || !allowedExtensions.includes(extension)) {
        return {
          valid: false,
          error: `File extension not allowed. Allowed: ${allowedExtensions.join(", ")}`,
        };
      }
    }

    // Sanitize filename
    let sanitized = filename;

    if (!allowSpaces) {
      sanitized = sanitized.replace(/\s+/g, "_");
    }

    if (!allowUnicode) {
      // Remove non-ASCII characters (keep only printable ASCII)
      sanitized = sanitized.replace(/[^\u0020-\u007F]/g, "");
    }

    // Remove leading/trailing dots and spaces
    sanitized = sanitized.trim().replace(/^\.+|\.+$/g, "");

    return {
      valid: true,
      sanitized,
      original: filename,
    };
  }

  /**
   * Enhanced file reading with progress and error handling
   * @param {File} file - File to read
   * @param {Object} options - Reading options
   * @returns {Promise} File content promise
   */
  static readFileAsText(file, options = {}) {
    const {
      encoding = "UTF-8",
      maxSizeBytes = HELPERS_CONSTANTS.FILE_SIZE.DEFAULT_BINARY_LIMIT_MB *
        HELPERS_CONSTANTS.FILE_SIZE.BYTES_PER_KB *
        HELPERS_CONSTANTS.FILE_SIZE.KB_PER_MB, // 50MB default
      onProgress = null,
      validateType = true,
      allowedTypes = ["text/plain", "text/csv", "application/json", "text/xml"],
    } = options;

    return new Promise((resolve, reject) => {
      if (!(file instanceof File)) {
        reject(new Error("Invalid file object"));
        return;
      }

      // Validate file size
      if (file.size > maxSizeBytes) {
        reject(
          new Error(
            `File size (${file.size} bytes) exceeds maximum (${maxSizeBytes} bytes)`,
          ),
        );
        return;
      }

      // Validate file type
      if (validateType && !allowedTypes.includes(file.type)) {
        reject(
          new Error(
            `File type ${file.type} not allowed. Allowed: ${allowedTypes.join(", ")}`,
          ),
        );
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => {
        try {
          resolve(e.target.result);
        } catch (error) {
          reject(new Error(`Failed to read file: ${error.message}`));
        }
      };

      reader.onerror = () => {
        reject(new Error("File reading failed"));
      };

      reader.onabort = () => {
        reject(new Error("File reading was aborted"));
      };

      // Progress tracking
      if (onProgress && typeof onProgress === "function") {
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            const progress = (e.loaded / e.total) * 100;
            onProgress(progress, e.loaded, e.total);
          }
        };
      }

      reader.readAsText(file, encoding);
    });
  }

  /**
   * Read file as data URL with validation
   * @param {File} file - File to read
   * @param {Object} options - Reading options
   * @returns {Promise} Data URL promise
   */
  static readFileAsDataURL(file, options = {}) {
    const {
      maxSizeBytes = HELPERS_CONSTANTS.FILE_SIZE.SMALL_BINARY_LIMIT_MB *
        HELPERS_CONSTANTS.FILE_SIZE.BYTES_PER_KB *
        HELPERS_CONSTANTS.FILE_SIZE.KB_PER_MB, // 10MB for binary files
      allowedTypes = ["image/jpeg", "image/png", "image/gif", "image/webp"],
      onProgress = null,
    } = options;

    return new Promise((resolve, reject) => {
      if (!(file instanceof File)) {
        reject(new Error("Invalid file object"));
        return;
      }

      if (file.size > maxSizeBytes) {
        reject(new Error(`File size exceeds maximum allowed size`));
        return;
      }

      if (!allowedTypes.includes(file.type)) {
        reject(new Error(`File type not allowed`));
        return;
      }

      const reader = new FileReader();

      reader.onload = (e) => resolve(e.target.result);
      reader.onerror = () => reject(new Error("File reading failed"));
      reader.onabort = () => reject(new Error("File reading was aborted"));

      if (onProgress && typeof onProgress === "function") {
        reader.onprogress = (e) => {
          if (e.lengthComputable) {
            onProgress((e.loaded / e.total) * 100);
          }
        };
      }

      reader.readAsDataURL(file);
    });
  }

  /**
   * Parse CSV file with accessibility features
   * @param {string} csvText - CSV text content
   * @param {Object} options - Parsing options
   * @returns {Object} Parsed CSV data with metadata
   */
  static parseCSV(csvText, options = {}) {
    const {
      delimiter = ",",
      hasHeader = true,
      skipEmptyLines = true,
      maxRows = 10000,
      validateData = true,
    } = options;

    if (typeof csvText !== "string") {
      throw new Error("CSV content must be a string");
    }

    const lines = csvText.split("\n");
    const result = {
      headers: [],
      data: [],
      metadata: {
        totalRows: lines.length,
        totalColumns: 0,
        parsedRows: 0,
        skippedRows: 0,
        errors: [],
      },
    };

    let currentRow = 0;

    // Parse header if specified
    if (hasHeader && lines.length > 0) {
      result.headers = this.parseCSVLine(lines[0], delimiter);
      result.metadata.totalColumns = result.headers.length;
      currentRow = 1;
    }

    // Parse data rows
    for (
      let i = currentRow;
      i < lines.length && result.data.length < maxRows;
      i++
    ) {
      const line = lines[i].trim();

      if (skipEmptyLines && line === "") {
        result.metadata.skippedRows++;
        continue;
      }

      try {
        const row = this.parseCSVLine(line, delimiter);

        if (validateData && hasHeader && row.length !== result.headers.length) {
          result.metadata.errors.push(`Row ${i + 1}: Column count mismatch`);
          continue;
        }

        result.data.push(
          hasHeader
            ? Object.fromEntries(
                result.headers.map((header, idx) => [header, row[idx] || ""]),
              )
            : row,
        );
        result.metadata.parsedRows++;
      } catch (error) {
        result.metadata.errors.push(`Row ${i + 1}: ${error.message}`);
      }
    }

    return result;
  }

  /**
   * Parse single CSV line
   * @param {string} line - CSV line
   * @param {string} delimiter - Field delimiter
   * @returns {Array} Parsed fields
   */
  static parseCSVLine(line, delimiter = ",") {
    const fields = [];
    let current = "";
    let inQuotes = false;
    let i = 0;

    while (i < line.length) {
      const char = line[i];

      if (char === '"') {
        if (inQuotes && line[i + 1] === '"') {
          // Escaped quote
          current += '"';
          i += 2;
        } else {
          // Toggle quote state
          inQuotes = !inQuotes;
          i++;
        }
      } else if (char === delimiter && !inQuotes) {
        // Field separator
        fields.push(current.trim());
        current = "";
        i++;
      } else {
        current += char;
        i++;
      }
    }

    // Add the last field
    fields.push(current.trim());

    return fields;
  }

  /**
   * Export data as CSV with accessibility
   * @param {Array} data - Data to export
   * @param {Object} options - Export options
   * @returns {string} CSV string
   */
  static exportToCSV(data, options = {}) {
    const {
      headers = null,
      delimiter = ",",
      includeHeaders = true,
      quote = '"',
      lineBreak = "\n",
    } = options;

    if (!Array.isArray(data) || data.length === 0) {
      return "";
    }

    const csvLines = [];

    // Determine headers
    let csvHeaders = headers;
    if (!csvHeaders && data.length > 0) {
      if (typeof data[0] === "object" && data[0] !== null) {
        csvHeaders = Object.keys(data[0]);
      }
    }

    // Add headers if requested
    if (includeHeaders && csvHeaders) {
      csvLines.push(
        csvHeaders
          .map((h) => this.escapeCSVField(h, delimiter, quote))
          .join(delimiter),
      );
    }

    // Add data rows
    data.forEach((row) => {
      let csvRow;
      if (Array.isArray(row)) {
        csvRow = row.map((field) =>
          this.escapeCSVField(field, delimiter, quote),
        );
      } else if (typeof row === "object" && row !== null) {
        csvRow = csvHeaders
          ? csvHeaders.map((header) =>
              this.escapeCSVField(row[header], delimiter, quote),
            )
          : Object.values(row).map((field) =>
              this.escapeCSVField(field, delimiter, quote),
            );
      } else {
        csvRow = [this.escapeCSVField(row, delimiter, quote)];
      }
      csvLines.push(csvRow.join(delimiter));
    });

    return csvLines.join(lineBreak);
  }

  /**
   * Escape CSV field value
   * @param {*} field - Field value
   * @param {string} delimiter - Field delimiter
   * @param {string} quote - Quote character
   * @returns {string} Escaped field
   */
  static escapeCSVField(field, delimiter = ",", quote = '"') {
    if (field == null) return "";

    const str = String(field);
    const needsQuoting =
      str.includes(delimiter) ||
      str.includes(quote) ||
      str.includes("\n") ||
      str.includes("\r");

    if (needsQuoting) {
      return quote + str.replace(new RegExp(quote, "g"), quote + quote) + quote;
    }

    return str;
  } // Enhanced Animation utilities with accessibility and performance
  /**
   * Enhanced easing functions with accessibility considerations
   */
  static easeInOut(t, options = {}) {
    const { respectReducedMotion = true, strength = 1 } = options;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return t; // Linear for reduced motion
    }

    const adjustedT = Math.pow(t, strength);
    return adjustedT < HELPERS_CONSTANTS.ANIMATION.EASING_THRESHOLD
      ? 2 * adjustedT * adjustedT
      : -1 +
          (HELPERS_CONSTANTS.ANIMATION.EASING_FACTOR_4 -
            HELPERS_CONSTANTS.ANIMATION.EASING_FACTOR_2 * adjustedT) *
            adjustedT;
  }

  static easeIn(t, options = {}) {
    const { respectReducedMotion = true, strength = 2 } = options;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return t;
    }

    return Math.pow(t, strength);
  }

  static easeOut(t, options = {}) {
    const { respectReducedMotion = true, strength = 2 } = options;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return t;
    }

    return 1 - Math.pow(1 - t, strength);
  }

  /**
   * Bounce easing function
   * @param {number} t - Time progress (0-1)
   * @param {Object} options - Easing options
   * @returns {number} Eased value
   */
  static easeBounce(t, options = {}) {
    const { respectReducedMotion = true } = options;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return t;
    }

    if (t < 1 / HELPERS_CONSTANTS.ANIMATION.BOUNCE_DIVISOR) {
      return HELPERS_CONSTANTS.ANIMATION.BOUNCE_MULTIPLIER * t * t;
    } else if (
      t <
      HELPERS_CONSTANTS.ANIMATION.BOUNCE_OFFSET_2 /
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_DIVISOR
    ) {
      return (
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_MULTIPLIER *
          (t -=
            HELPERS_CONSTANTS.ANIMATION.BOUNCE_OFFSET_1_5 /
            HELPERS_CONSTANTS.ANIMATION.BOUNCE_DIVISOR) *
          t +
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_RETURN_0_75
      );
    } else if (
      t <
      HELPERS_CONSTANTS.ANIMATION.BOUNCE_OFFSET_2_5 /
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_DIVISOR
    ) {
      return (
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_MULTIPLIER *
          (t -=
            HELPERS_CONSTANTS.ANIMATION.BOUNCE_OFFSET_2_25 /
            HELPERS_CONSTANTS.ANIMATION.BOUNCE_DIVISOR) *
          t +
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_RETURN_0_9375
      );
    } else {
      return (
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_MULTIPLIER *
          (t -=
            HELPERS_CONSTANTS.ANIMATION.BOUNCE_OFFSET_2_625 /
            HELPERS_CONSTANTS.ANIMATION.BOUNCE_DIVISOR) *
          t +
        HELPERS_CONSTANTS.ANIMATION.BOUNCE_RETURN_0_984375
      );
    }
  }

  /**
   * Elastic easing function
   * @param {number} t - Time progress (0-1)
   * @param {Object} options - Easing options
   * @returns {number} Eased value
   */
  static easeElastic(t, options = {}) {
    const {
      respectReducedMotion = true,
      amplitude = 1,
      period = 0.3,
    } = options;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      return t;
    }

    if (t === 0 || t === 1) return t;

    const s = period / HELPERS_CONSTANTS.ANIMATION.ELASTIC_PERIOD_DIVISOR;
    return -(
      amplitude *
      Math.pow(2, 10 * (t -= 1)) *
      Math.sin(((t - s) * (2 * Math.PI)) / period)
    );
  }

  /**
   * Advanced animation with accessibility and performance features
   * @param {Object} options - Animation options
   * @returns {Object} Animation controller
   */
  static animate(options = {}) {
    const {
      duration = 300,
      easing = this.easeInOut,
      updateCallback = null,
      completeCallback = null,
      respectReducedMotion = true,
      fps = null,
      pauseOnVisibilityChange = true,
      trackPerformance = false,
    } = options;

    if (typeof updateCallback !== "function") {
      throw new Error("updateCallback is required");
    }

    // Respect user's motion preferences
    const prefersReducedMotion =
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    const actualDuration = prefersReducedMotion
      ? Math.min(duration, 100)
      : duration;
    const frameInterval = fps ? 1000 / fps : null;

    let startTime = null;
    let animationId = null;
    let paused = false;
    let pausedAt = 0;
    let totalPausedTime = 0;
    let lastFrameTime = 0;
    let frameCount = 0;
    let cancelled = false;

    const performance = trackPerformance
      ? {
          startTime: 0,
          frameCount: 0,
          droppedFrames: 0,
          averageFrameTime: 0,
          totalFrameTime: 0,
        }
      : null;

    const tick = (currentTime) => {
      if (cancelled) return;

      if (!startTime) {
        startTime = currentTime;
        if (performance) performance.startTime = currentTime;
      }

      const elapsed = currentTime - startTime - totalPausedTime;
      const progress = Math.min(elapsed / actualDuration, 1);

      // Frame rate limiting
      if (frameInterval && currentTime - lastFrameTime < frameInterval) {
        animationId = requestAnimationFrame(tick);
        return;
      }

      // Performance tracking
      if (performance && frameCount > 0) {
        const frameDuration = currentTime - lastFrameTime;
        performance.totalFrameTime += frameDuration;
        performance.frameCount++;

        if (frameDuration > HELPERS_CONSTANTS.TIME.FRAME_RATE_TARGET) {
          // > 60fps threshold
          performance.droppedFrames++;
        }

        performance.averageFrameTime =
          performance.totalFrameTime / performance.frameCount;
      }

      lastFrameTime = currentTime;
      frameCount++;

      if (!paused) {
        const easedProgress =
          typeof easing === "function"
            ? easing(progress, { respectReducedMotion })
            : progress;

        try {
          updateCallback(easedProgress, progress, elapsed);
        } catch (error) {
          logger.error("Animation update callback error:", error);
          controller.cancel();
          return;
        }
      }

      if (progress < 1) {
        animationId = requestAnimationFrame(tick);
      } else {
        if (completeCallback && typeof completeCallback === "function") {
          try {
            completeCallback(performance);
          } catch (error) {
            logger.error("Animation complete callback error:", error);
          }
        }
      }
    };

    // Visibility change handling
    const handleVisibilityChange = () => {
      if (pauseOnVisibilityChange) {
        if (document.hidden && !paused) {
          controller.pause();
        } else if (!document.hidden && paused) {
          controller.resume();
        }
      }
    };

    if (pauseOnVisibilityChange) {
      document.addEventListener("visibilitychange", handleVisibilityChange);
    }

    const controller = {
      start() {
        if (!cancelled && !animationId) {
          animationId = requestAnimationFrame(tick);
        }
        return this;
      },

      pause() {
        if (!paused && animationId) {
          paused = true;
          pausedAt = performance.now();
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        return this;
      },

      resume() {
        if (paused) {
          paused = false;
          totalPausedTime += performance.now() - pausedAt;
          animationId = requestAnimationFrame(tick);
        }
        return this;
      },

      cancel() {
        cancelled = true;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        if (pauseOnVisibilityChange) {
          document.removeEventListener(
            "visibilitychange",
            handleVisibilityChange,
          );
        }
        return this;
      },

      getProgress() {
        if (!startTime) return 0;
        const elapsed = performance.now() - startTime - totalPausedTime;
        return Math.min(elapsed / actualDuration, 1);
      },

      isPaused() {
        return paused;
      },

      isCancelled() {
        return cancelled;
      },

      getPerformance() {
        return performance ? { ...performance } : null;
      },
    };

    return controller;
  }

  /**
   * Create a spring animation with physics
   * @param {Object} options - Spring options
   * @returns {Object} Spring animation controller
   */
  static createSpringAnimation(options = {}) {
    const {
      from = 0,
      to = 1,
      stiffness = 100,
      damping = 10,
      mass = 1,
      precision = 0.01,
      updateCallback = null,
      completeCallback = null,
      respectReducedMotion = true,
    } = options;

    if (
      respectReducedMotion &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      // For reduced motion, use simple linear interpolation
      return this.animate({
        duration: 200,
        easing: (t) => t,
        updateCallback: (progress) => {
          const value = from + (to - from) * progress;
          if (updateCallback) updateCallback(value, progress);
        },
        completeCallback,
        respectReducedMotion: false,
      });
    }

    let currentValue = from;
    let velocity = 0;
    let startTime = null;
    let animationId = null;
    let cancelled = false;

    const tick = (currentTime) => {
      if (cancelled) return;

      if (!startTime) startTime = currentTime;

      const deltaTime = Math.min(
        (currentTime - (startTime || currentTime)) / 1000,
        HELPERS_CONSTANTS.ANIMATION.FRAME_DELTA_TARGET,
      );
      startTime = currentTime;

      // Spring physics calculations
      const springForce = -stiffness * (currentValue - to);
      const dampingForce = -damping * velocity;
      const acceleration = (springForce + dampingForce) / mass;

      velocity += acceleration * deltaTime;
      currentValue += velocity * deltaTime;

      if (updateCallback) {
        updateCallback(
          currentValue,
          Math.abs(to - currentValue) / Math.abs(to - from),
        );
      }

      // Check if spring has settled
      const isSettled =
        Math.abs(to - currentValue) < precision &&
        Math.abs(velocity) < precision;

      if (!isSettled) {
        animationId = requestAnimationFrame(tick);
      } else {
        currentValue = to; // Snap to final value
        if (updateCallback) updateCallback(currentValue, 1);
        if (completeCallback) completeCallback();
      }
    };

    return {
      start() {
        if (!cancelled && !animationId) {
          animationId = requestAnimationFrame(tick);
        }
        return this;
      },

      cancel() {
        cancelled = true;
        if (animationId) {
          cancelAnimationFrame(animationId);
          animationId = null;
        }
        return this;
      },

      getCurrentValue() {
        return currentValue;
      },

      getVelocity() {
        return velocity;
      },

      isCancelled() {
        return cancelled;
      },
    };
  }

  /**
   * Batch multiple animations with coordination
   * @param {Array} animations - Array of animation configurations
   * @param {Object} options - Batch options
   * @returns {Object} Batch controller
   */
  static createAnimationBatch(animations, options = {}) {
    const {
      sequential = false,
      delay = 0,
      onProgress = null,
      onComplete = null,
    } = options;

    const controllers = [];
    let completedCount = 0;
    let started = false;

    const handleAnimationComplete = () => {
      completedCount++;
      const progress = completedCount / animations.length;

      if (onProgress) onProgress(progress);

      if (completedCount === animations.length && onComplete) {
        onComplete();
      }
    };

    const createAnimation = (config, _index) => {
      const animationConfig = {
        ...config,
        completeCallback: () => {
          if (config.completeCallback) config.completeCallback();
          handleAnimationComplete();
        },
      };

      return this.animate(animationConfig);
    };

    // Create all animation controllers
    animations.forEach((config, index) => {
      controllers.push(createAnimation(config, index));
    });

    return {
      start() {
        if (started) return this;
        started = true;

        if (sequential) {
          // Start animations one after another
          const startNext = (index) => {
            if (index < controllers.length) {
              setTimeout(
                () => {
                  controllers[index].start();
                  startNext(index + 1);
                },
                index === 0 ? delay : 0,
              );
            }
          };
          startNext(0);
        } else {
          // Start all animations simultaneously
          setTimeout(() => {
            controllers.forEach((controller) => controller.start());
          }, delay);
        }

        return this;
      },

      pause() {
        controllers.forEach((controller) => controller.pause());
        return this;
      },

      resume() {
        controllers.forEach((controller) => controller.resume());
        return this;
      },

      cancel() {
        controllers.forEach((controller) => controller.cancel());
        return this;
      },

      getProgress() {
        return completedCount / animations.length;
      },

      getControllers() {
        return [...controllers];
      },
    };
  }

  /**
   * Consolidated number validation pattern (refactored from duplicate code)
   * Filters array to only include valid numbers
   * @param {any[]} values - Array of values to filter
   * @returns {number[]} Array of valid numbers
   */
  static filterValidNumbers(values) {
    return values.filter((v) => typeof v === "number" && !isNaN(v));
  }

  // Enterprise Static Methods for Fleet Management
  static getEnterpriseStats() {
    if (typeof window !== "undefined" && window.enterpriseHelpersMonitor) {
      return window.enterpriseHelpersMonitor.performHealthCheck();
    }
    return {
      status: "unavailable",
      reason: "Enterprise monitor not initialized",
      timestamp: Date.now(),
    };
  }

  static getAllInstanceStats() {
    const stats = [];
    if (typeof window !== "undefined" && window.enterpriseHelpersMonitor) {
      window.enterpriseHelpersMonitor.instances.forEach((instance) => {
        stats.push({
          instanceId: instance.instanceId,
          operationCount: instance.operationCount,
          lastOperation: instance.lastOperation,
          circuitBreakerStates: Array.from(
            instance.circuitBreakerStates.entries(),
          ),
        });
      });
    }
    return stats;
  }

  static resetAllMetrics() {
    if (typeof window !== "undefined" && window.enterpriseHelpersMonitor) {
      window.enterpriseHelpersMonitor.performanceMetrics = {
        operationCount: 0,
        totalExecutionTime: 0,
        errorCount: 0,
        warningCount: 0,
        slowOperations: 0,
        memoryUsage: 0,
        lastHealthCheck: Date.now(),
      };
      window.enterpriseHelpersMonitor.operationHistory = [];

      // Reset instance metrics
      window.enterpriseHelpersMonitor.instances.forEach((instance) => {
        instance.operationCount = 0;
        instance.lastOperation = null;
        instance.circuitBreakerStates.clear();
      });

      logger.info("All helper metrics reset", { component: "Helpers" });
      return true;
    }
    return false;
  }

  static forceCircuitBreakerReset(operationType = null) {
    let resetCount = 0;
    if (typeof window !== "undefined" && window.enterpriseHelpersMonitor) {
      window.enterpriseHelpersMonitor.instances.forEach((instance) => {
        if (operationType) {
          if (instance.circuitBreakerStates.has(operationType)) {
            instance.circuitBreakerStates.delete(operationType);
            resetCount++;
          }
        } else {
          resetCount += instance.circuitBreakerStates.size;
          instance.circuitBreakerStates.clear();
        }
      });

      logger.info("Circuit breakers reset", {
        operationType: operationType || "all",
        resetCount,
        component: "Helpers",
      });
    }
    return resetCount;
  }

  static getPerformanceReport() {
    if (typeof window !== "undefined" && window.enterpriseHelpersMonitor) {
      const monitor = window.enterpriseHelpersMonitor;
      const recentOperations = monitor.operationHistory.slice(-100);

      return {
        timestamp: Date.now(),
        totalInstances: monitor.instances.size,
        globalMetrics: { ...monitor.performanceMetrics },
        recentOperations: recentOperations.length,
        averageExecutionTime: monitor.calculateAverageExecutionTime(),
        errorRate: monitor.calculateErrorRate(),
        circuitBreakerState: monitor.circuitBreaker.state,
        memoryUsage: monitor.getMemoryUsage(),
        instanceStats: this.getAllInstanceStats(),
      };
    }
    return { status: "unavailable" };
  }
}

// Global Debug Functions for Enterprise Monitoring
if (typeof window !== "undefined") {
  // Global debug helpers for enterprise monitoring
  window.debugHelpers = {
    stats: () => {
      console.group("🔧 Enterprise Helpers Statistics");
      const stats = Helpers.getEnterpriseStats();
      console.table(stats);
      console.groupEnd();
      return stats;
    },

    performance: () => {
      console.group("📊 Helper Performance Report");
      const report = Helpers.getPerformanceReport();
      console.table(report.globalMetrics);
      console.log("Instance Statistics:", report.instanceStats);
      console.groupEnd();
      return report;
    },

    instances: () => {
      console.group("🏭 Helper Instance Fleet");
      const instances = Helpers.getAllInstanceStats();
      console.table(instances);
      console.groupEnd();
      return instances;
    },

    resetMetrics: () => {
      console.log("🔄 Resetting all helper metrics...");
      const result = Helpers.resetAllMetrics();
      console.log(result ? "✅ Metrics reset successfully" : "❌ Reset failed");
      return result;
    },

    resetCircuitBreakers: (operationType = null) => {
      console.log("🔧 Resetting circuit breakers...", operationType || "all");
      const count = Helpers.forceCircuitBreakerReset(operationType);
      console.log(`✅ Reset ${count} circuit breaker(s)`);
      return count;
    },

    monitor: () => {
      if (window.enterpriseHelpersMonitor) {
        console.group("🔍 Enterprise Helper Monitor");
        console.log("Monitor Instance:", window.enterpriseHelpersMonitor);
        console.log(
          "Operation History:",
          window.enterpriseHelpersMonitor.operationHistory.slice(-10),
        );
        console.log(
          "Circuit Breaker:",
          window.enterpriseHelpersMonitor.circuitBreaker,
        );
        console.groupEnd();
        return window.enterpriseHelpersMonitor;
      }
      console.warn("❌ Enterprise monitor not available");
      return null;
    },

    health: () => {
      console.group("💚 Helper Health Check");
      if (window.enterpriseHelpersMonitor) {
        const health = window.enterpriseHelpersMonitor.performHealthCheck();
        console.log(`Status: ${health.status}`);
        console.table(health);
        console.groupEnd();
        return health;
      }
      console.warn("❌ Health check unavailable");
      console.groupEnd();
      return null;
    },
  };

  // Console shortcuts
  window.helperStats = window.debugHelpers.stats;
  window.helperHealth = window.debugHelpers.health;
  window.helperPerf = window.debugHelpers.performance;

  console.log("🔧 Enterprise Helpers Debug Tools Available:");
  console.log("- window.debugHelpers.stats() - Get statistics");
  console.log("- window.debugHelpers.performance() - Performance report");
  console.log("- window.debugHelpers.instances() - Instance fleet status");
  console.log("- window.debugHelpers.health() - Health check");
  console.log("- window.debugHelpers.monitor() - Monitor details");
  console.log("- window.helperStats() - Quick stats shortcut");
  console.log("- window.helperHealth() - Quick health shortcut");
  console.log("- window.helperPerf() - Quick performance shortcut");
}

// Global cleanup function for better memory management
window.addEventListener("beforeunload", () => {
  HelperCache.clear();
});

// Initialize theme monitoring
if (typeof window !== "undefined") {
  ThemeHelpers.createThemeObserver((property, value) => {
    // Emit custom event for theme changes
    window.dispatchEvent(
      new CustomEvent("themeChange", {
        detail: { property, value },
      }),
    );
  });
}

// Export for ES6 modules
export default Helpers;
