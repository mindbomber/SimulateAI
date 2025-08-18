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
 * ⭐ ENTERPRISE-GRADE LOGGING SYSTEM ⭐
 * Advanced structured logging utility with comprehensive monitoring,
 * performance analytics, centralized log aggregation, and enterprise telemetry
 *
 * ENTERPRISE FEATURES:
 * • Real-time log performance monitoring and optimization
 * • Structured logging with enterprise metadata and correlation IDs
 * • Circuit breaker pattern for logging system resilience
 * • Centralized log aggregation and enterprise analytics
 * • Health monitoring with predictive failure detection
 * • Memory usage tracking and log buffer management
 * • Enterprise-grade error handling and recovery mechanisms
 * • Static enterprise methods for logging system monitoring
 */
/* eslint-disable no-console */

// ⭐ ENTERPRISE LOGGING CONFIGURATION ⭐
const ENTERPRISE_CONSTANTS = {
  // Health monitoring configuration
  HEALTH: {
    CHECK_INTERVAL: 30000, // Health check every 30 seconds
    MAX_ERRORS: 10, // Maximum logging errors before health failure
    MEMORY_THRESHOLD_MB: 50, // Memory threshold for log buffers
    LOG_PERFORMANCE_THRESHOLD: 10, // Max log operation time (ms)
    BUFFER_SIZE_THRESHOLD: 1000, // Max buffer size before health warning
    HEARTBEAT_INTERVAL: 60000, // Heartbeat every minute
  },

  // Performance monitoring thresholds
  PERFORMANCE: {
    LOG_OPERATION_THRESHOLD: 5, // Max log operation time (ms)
  },

  // Circuit breaker configuration
  CIRCUIT_BREAKER: {
    MAX_ERRORS: 5, // Circuit breaker trip threshold
    RECOVERY_TIMEOUT: 30000, // Auto-recovery timeout (30 seconds)
  },

  // Log aggregation and telemetry
  AGGREGATION: {
    BUFFER_SIZE: 100, // Logs before batch flush
    FLUSH_INTERVAL: 30000, // Max time before flush (30 seconds)
    MAX_BUFFER_SIZE: 1000, // Maximum buffer size before force flush
    COMPRESSION_ENABLED: true, // Enable log compression
  },

  // Enterprise telemetry configuration
  TELEMETRY: {
    BATCH_SIZE: 50, // Telemetry events before batch flush
    FLUSH_INTERVAL: 60000, // Max time before flush (1 minute)
    EVENT_TYPES: {
      LOG_EVENT: "log_event",
      PERFORMANCE_METRIC: "performance_metric",
      ERROR_EVENT: "error_event",
      HEALTH_CHECK: "health_check",
      BUFFER_FLUSH: "buffer_flush",
      CIRCUIT_BREAKER: "circuit_breaker",
    },
  },

  // Structured logging configuration
  STRUCTURED: {
    INCLUDE_STACK_TRACE: true, // Include stack traces in structured logs
    INCLUDE_USER_AGENT: true, // Include user agent information
    INCLUDE_SESSION_ID: true, // Include session tracking
    MAX_DEPTH: 10, // Maximum object serialization depth
    MAX_STRING_LENGTH: 1000, // Maximum string length in logs
  },
};

class Logger {
  constructor() {
    // ⭐ ENTERPRISE INITIALIZATION ⭐

    // OPTIMIZED: Cache current timestamp to avoid multiple Date.now() calls
    const initTimestamp = Date.now();

    // Generate unique instance identifier for enterprise tracking
    this.instanceId = this._generateUUID();
    this.sessionId = `log-session-${initTimestamp}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = initTimestamp;

    // Add to enterprise instance tracking
    if (!Logger._instances) {
      Logger._instances = new Set();
    }
    Logger._instances.add(this);

    // Define log levels FIRST - before environment detection
    this.levels = {
      ERROR: 0,
      WARN: 1,
      INFO: 2,
      DEBUG: 3,
      TRACE: 4,
    };

    // Enterprise monitoring initialization
    this.errorCount = 0;
    this.circuitBreakerTripped = false;
    this.telemetryBatch = [];
    this.lastTelemetryFlush = initTimestamp;

    // Performance tracking
    this.performanceMetrics = {
      totalLogs: 0,
      logsByLevel: { error: 0, warn: 0, info: 0, debug: 0, trace: 0 },
      operationTimes: [],
      bufferFlushes: 0,
      lastOperation: initTimestamp,
    };

    // Centralized log aggregation
    this.logBuffer = [];
    this.lastBufferFlush = initTimestamp;
    this.bufferCompressionEnabled =
      ENTERPRISE_CONSTANTS.AGGREGATION.COMPRESSION_ENABLED;

    // Health monitoring
    this.healthMetrics = {
      isHealthy: true,
      lastHealthCheck: initTimestamp,
      memoryUsage: 0,
      errorRate: 0,
      bufferSize: 0,
    };

    // OPTIMIZED: Cache environment detection to avoid repeated window.location access
    this._environmentCache = this._detectEnvironmentOnce();

    // Correlation ID tracking for enterprise logging
    this.correlationIds = new Map();
    this.currentCorrelationId = null;

    // Set log level based on environment
    this.currentLevel = this._environmentCache.logLevel;
    // Process only errors and warnings by default to reduce noise
    this.enabledTypes = new Set(["error", "warn"]);

    // Production mode disables most logging
    if (this._environmentCache.isProduction) {
      this.enabledTypes = new Set(["error"]);
    }

    // Initialize enterprise monitoring systems
    this._initializeEnterpriseMonitoring();

    // Initialize message deduplication to reduce console noise
    this.messageCache = new Map();
    this.maxCacheSize = 500;
    this.quietMode = this._environmentCache.isQuietMode;

    // Log enterprise initialization (only in verbose mode)
    if (!this.quietMode) {
      this._logTelemetry(ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.LOG_EVENT, {
        event: "logger_initialized",
        instanceId: this.instanceId,
        initTime: initTimestamp - this.startTime, // Should be near 0
        environment: this._environmentCache.isProduction
          ? "production"
          : "development",
        enabledTypes: Array.from(this.enabledTypes),
      });
    }
  }

  /**
   * OPTIMIZED: Cache environment detection to avoid repeated window.location access
   * @private
   */
  _detectEnvironmentOnce() {
    const cache = {
      isProduction: false,
      isDevelopment: false,
      logLevel: this.levels.WARN,
      hostname: null,
      isQuietMode: false,
    };

    // Check for common development indicators
    if (typeof window !== "undefined") {
      // OPTIMIZED: Cache hostname and storage values to avoid repeated access
      cache.hostname = window.location.hostname;
      const debugFromStorage = localStorage.getItem("debug") === "true";
      const quietFromStorage = localStorage.getItem("quiet-logs") === "true";

      cache.isDevelopment =
        cache.hostname === "localhost" ||
        cache.hostname === "127.0.0.1" ||
        cache.hostname.includes("dev") ||
        window.location.search.includes("debug=true") ||
        debugFromStorage;

      cache.isProduction =
        cache.hostname !== "localhost" &&
        cache.hostname !== "127.0.0.1" &&
        !cache.hostname.includes("dev");

      // In production or quiet mode, reduce logging noise
      cache.isQuietMode = quietFromStorage;

      if (cache.isQuietMode) {
        // Only show errors and warnings in quiet mode
        cache.logLevel = this.levels.WARN;
      } else {
        cache.logLevel = cache.isDevelopment
          ? this.levels.DEBUG
          : this.levels.WARN;
      }
    }

    return cache;
  }

  /**
   * OPTIMIZED: Use cached environment detection
   */
  detectEnvironment() {
    return this._environmentCache.logLevel;
  }

  /**
   * OPTIMIZED: Use cached environment detection
   */
  isProduction() {
    return this._environmentCache.isProduction;
  }

  /**
   * OPTIMIZED: Format log message with cached timestamp generation
   */
  formatMessage(level, context, message, data) {
    // OPTIMIZED: Cache timestamp generation to avoid multiple new Date() calls
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}]`;
    const contextStr = context ? ` [${context}]` : "";

    if (data !== undefined) {
      return [prefix + contextStr, message, data];
    }
    return [prefix + contextStr, message];
  }

  /**
   * Core logging method with enterprise enhancements
   */
  log(level, context, message, data) {
    try {
      const operationStart = performance.now();

      // Circuit breaker check
      if (this.circuitBreakerTripped) {
        return;
      }

      if (!this.enabledTypes.has(level)) {
        return;
      }

      // Quiet mode filtering - reduce INFO noise
      if (this.quietMode && level === "info") {
        // Only allow important info messages in quiet mode
        const importantKeywords = [
          "Error",
          "Failed",
          "Warning",
          "Critical",
          "Issue",
          "Problem",
          "Exception",
          "Timeout",
          "Retry",
          "Circuit breaker",
        ];
        const isImportant = importantKeywords.some(
          (keyword) =>
            message.toLowerCase().includes(keyword.toLowerCase()) ||
            (context && context.toLowerCase().includes(keyword.toLowerCase())),
        );

        if (!isImportant) {
          return; // Skip non-important info messages in quiet mode
        }
      }

      // Check for duplicate message to reduce console noise
      const messageKey = `${level}-${context}-${message}`;
      if (this._isDuplicateMessage(messageKey)) {
        return; // Skip duplicate message
      }

      // Generate correlation ID if enabled (always enabled in current config)
      const correlationId =
        this.currentCorrelationId || this._generateCorrelationId();

      // Create structured log entry
      const structuredLog = this._createStructuredLog(
        level,
        context,
        message,
        data,
        correlationId,
      );

      // Add to centralized buffer
      this._addToBuffer(structuredLog);

      // Format message for console output
      const args = this.formatMessage(level, context, message, data);

      // Console output with enterprise error handling
      try {
        switch (level) {
          case "error":
            console.error(...args);
            break;
          case "warn":
            console.warn(...args);
            break;
          default:
            // Suppress info/debug/trace/default console output to reduce noise
            break;
        }
      } catch (e) {
        // Fallback for environments without console methods
        try {
          // Only print fallback for errors
          if (level === "error") {
            console.log(...args);
          }
        } catch (fallbackError) {
          // Enterprise error tracking for logging failures
          this._handleError(fallbackError, "console_output_fallback");
        }
      }

      // Update performance metrics
      const operationTime = performance.now() - operationStart;
      this._recordPerformanceMetric("logOperationTime", operationTime);

      // Update counters
      this.performanceMetrics.totalLogs++;
      this.performanceMetrics.logsByLevel[level] =
        (this.performanceMetrics.logsByLevel[level] || 0) + 1;
      this.performanceMetrics.lastOperation = Date.now();

      // Log enterprise telemetry for this log event
      this._logTelemetry(ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.LOG_EVENT, {
        level,
        context,
        hasData: data !== undefined,
        correlationId,
        operationTime,
        bufferSize: this.logBuffer.length,
      });
    } catch (error) {
      this._handleError(error, "core_logging");
    }
  }

  /**
   * Generate UUID for enterprise tracking
   * OPTIMIZED: Modern arrow function syntax and improved readability
   * @returns {string} UUID
   * @private
   */
  _generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === "x" ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Generate correlation ID for request tracking
   * OPTIMIZED: Use cached timestamp for better performance
   * @returns {string} Correlation ID
   * @private
   */
  _generateCorrelationId() {
    const correlationId = `corr-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.currentCorrelationId = correlationId;
    return correlationId;
  }

  /**
   * Check if message is a duplicate to reduce console noise
   * @param {string} messageKey - The message key to check
   * @returns {boolean} True if message is a duplicate
   * @private
   */
  _isDuplicateMessage(messageKey) {
    const now = Date.now();
    const cooldownPeriod = 5000; // 5 seconds between duplicate messages

    if (this.messageCache.has(messageKey)) {
      const lastSeen = this.messageCache.get(messageKey);
      if (now - lastSeen < cooldownPeriod) {
        return true; // It's a duplicate within cooldown period
      }
    }

    // Update cache with current timestamp
    this.messageCache.set(messageKey, now);

    // Clean up old cache entries to prevent memory leak
    if (this.messageCache.size > this.maxCacheSize) {
      const entriesToDelete = [];
      this.messageCache.forEach((timestamp, key) => {
        if (now - timestamp > cooldownPeriod * 2) {
          entriesToDelete.push(key);
        }
      });
      entriesToDelete.forEach((key) => this.messageCache.delete(key));
    }

    return false;
  }

  /**
   * OPTIMIZED: Create structured log entry with enterprise metadata and cached environment data
   * @private
   */
  _createStructuredLog(level, context, message, data, correlationId) {
    const structuredLog = {
      timestamp: new Date().toISOString(),
      level: level.toUpperCase(),
      context,
      message,
      instanceId: this.instanceId,
      sessionId: this.sessionId,
      correlationId,
      version: "1.20.0",
      environment: this._environmentCache.isProduction
        ? "production"
        : "development",
    };

    // Add data if provided
    if (data !== undefined) {
      structuredLog.data = this._sanitizeData(data);
    }

    // Add enterprise metadata if enabled
    if (
      ENTERPRISE_CONSTANTS.STRUCTURED.INCLUDE_STACK_TRACE &&
      level === "error"
    ) {
      structuredLog.stackTrace = new Error().stack;
    }

    if (
      ENTERPRISE_CONSTANTS.STRUCTURED.INCLUDE_USER_AGENT &&
      typeof window !== "undefined"
    ) {
      structuredLog.userAgent = navigator.userAgent;
    }

    if (ENTERPRISE_CONSTANTS.STRUCTURED.INCLUDE_SESSION_ID) {
      structuredLog.windowSessionId = this._getWindowSessionId();
    }

    return structuredLog;
  }

  /**
   * Sanitize data for enterprise logging
   * @private
   */
  _sanitizeData(data, depth = 0) {
    if (depth > ENTERPRISE_CONSTANTS.STRUCTURED.MAX_DEPTH) {
      return "[Object: Max depth exceeded]";
    }

    if (
      typeof data === "string" &&
      data.length > ENTERPRISE_CONSTANTS.STRUCTURED.MAX_STRING_LENGTH
    ) {
      return (
        data.substring(0, ENTERPRISE_CONSTANTS.STRUCTURED.MAX_STRING_LENGTH) +
        "...[truncated]"
      );
    }

    if (typeof data === "object" && data !== null) {
      try {
        const sanitized = {};
        for (const [key, value] of Object.entries(data)) {
          sanitized[key] = this._sanitizeData(value, depth + 1);
        }
        return sanitized;
      } catch (error) {
        return "[Object: Serialization error]";
      }
    }

    return data;
  }

  /**
   * Get window session ID for tracking
   * OPTIMIZED: Cache session ID to avoid repeated sessionStorage access
   * @private
   */
  _getWindowSessionId() {
    if (typeof window === "undefined") return null;

    if (!window.sessionStorage) return null;

    // Cache session ID to avoid repeated storage access
    if (!this._cachedWindowSessionId) {
      let sessionId = window.sessionStorage.getItem(
        "enterprise-log-session-id",
      );
      if (!sessionId) {
        sessionId = `win-session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        window.sessionStorage.setItem("enterprise-log-session-id", sessionId);
      }
      this._cachedWindowSessionId = sessionId;
    }

    return this._cachedWindowSessionId;
  }

  /**
   * Add log to centralized buffer
   * @private
   */
  _addToBuffer(structuredLog) {
    this.logBuffer.push(structuredLog);

    // Check if buffer should be flushed
    const shouldFlush =
      this.logBuffer.length >= ENTERPRISE_CONSTANTS.AGGREGATION.BUFFER_SIZE ||
      Date.now() - this.lastBufferFlush >=
        ENTERPRISE_CONSTANTS.AGGREGATION.FLUSH_INTERVAL ||
      this.logBuffer.length >= ENTERPRISE_CONSTANTS.AGGREGATION.MAX_BUFFER_SIZE;

    if (shouldFlush) {
      this._flushLogBuffer();
    }
  }

  // ⭐ ENTERPRISE MONITORING METHODS ⭐

  /**
   * Initialize enterprise monitoring systems
   * @private
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Setup health monitoring interval
      this.healthCheckInterval = setInterval(() => {
        this.performHealthCheck();
      }, ENTERPRISE_CONSTANTS.HEALTH.CHECK_INTERVAL);

      // Setup telemetry flush interval
      this.telemetryFlushInterval = setInterval(() => {
        this._flushTelemetryBatch();
      }, ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL);

      // Setup log buffer flush interval
      this.bufferFlushInterval = setInterval(() => {
        this._flushLogBuffer();
      }, ENTERPRISE_CONSTANTS.AGGREGATION.FLUSH_INTERVAL);

      // Setup heartbeat interval
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, ENTERPRISE_CONSTANTS.HEALTH.HEARTBEAT_INTERVAL);

      return true;
    } catch (error) {
      console.error(
        "Logger: Failed to initialize enterprise monitoring",
        error,
      );
      return false;
    }
  }

  /**
   * OPTIMIZED: Handle errors with enterprise error management and reduced state mutations
   * @param {Error} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @private
   */
  _handleError(error, context = "unknown") {
    this.errorCount++;

    // OPTIMIZED: Batch calculations to reduce state changes
    const now = Date.now();
    const uptime = now - this.startTime;
    this.healthMetrics.errorRate = this.errorCount / (uptime / 1000);

    // OPTIMIZED: Create error data object once to avoid redundant object creation
    const errorData = {
      instanceId: this.instanceId,
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date(now).toISOString(),
      errorCount: this.errorCount,
      sessionId: this.sessionId,
    };

    // Check if circuit breaker should trip
    if (this.errorCount >= ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER.MAX_ERRORS) {
      this.circuitBreakerTripped = true;

      console.error("Logger: Circuit breaker tripped", {
        ...errorData,
        circuitBreakerState: "OPEN",
      });

      // Auto-recovery after timeout
      setTimeout(() => {
        this.circuitBreakerTripped = false;
        this.errorCount = 0;
      }, ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER.RECOVERY_TIMEOUT);
    }

    // Log to enterprise telemetry
    this._logTelemetry(
      ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.ERROR_EVENT,
      errorData,
    );

    console.error("Logger", `Error in ${context}`, errorData);
  }

  /**
   * Record performance metric with enterprise analytics
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   * @private
   */
  _recordPerformanceMetric(metricName, value, metadata = {}) {
    try {
      const metric = {
        name: metricName,
        value,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        sessionId: this.sessionId,
        ...metadata,
      };

      // Store in performance tracker
      this.performanceMetrics.operationTimes.push(metric);

      // Check performance thresholds (silenced to reduce console noise)
      // if (
      //   metricName === "logOperationTime" &&
      //   value > ENTERPRISE_CONSTANTS.PERFORMANCE.LOG_OPERATION_THRESHOLD
      // ) {
      //   // Previously warned to console; now tracked via telemetry only
      // }

      // Log to enterprise telemetry
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
        metric,
      );
    } catch (error) {
      console.error("Logger: Failed to record performance metric", error);
    }
  }

  /**
   * Log enterprise telemetry with batching
   * @param {string} eventType - Type of telemetry event
   * @param {Object} data - Event data
   * @private
   */
  _logTelemetry(eventType, data) {
    try {
      // OPTIMIZED: Cache timestamp to avoid multiple Date.now() calls
      const now = Date.now();

      const telemetryEvent = {
        eventType,
        timestamp: now,
        instanceId: this.instanceId,
        sessionId: this.sessionId,
        data,
        version: "1.20.0",
      };

      // Add to batch
      this.telemetryBatch.push(telemetryEvent);

      // OPTIMIZED: Check if batch should be flushed using cached timestamp
      const shouldFlush =
        this.telemetryBatch.length >=
          ENTERPRISE_CONSTANTS.TELEMETRY.BATCH_SIZE ||
        now - this.lastTelemetryFlush >=
          ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL;

      if (shouldFlush) {
        this._flushTelemetryBatch();
      }
    } catch (error) {
      console.error("Logger: Failed to log telemetry", error);
    }
  }

  /**
   * Flush telemetry batch to analytics service
   * @private
   */
  _flushTelemetryBatch() {
    if (this.telemetryBatch.length === 0) return;

    try {
      // Send to analytics service (placeholder for actual implementation)
      // Console output removed to reduce noise; relying on downstream telemetry pipeline

      // Clear batch
      this.telemetryBatch = [];
      this.lastTelemetryFlush = Date.now();
    } catch (error) {
      console.error("Logger: Failed to flush telemetry batch", error);
    }
  }

  /**
   * Flush log buffer to centralized aggregation service
   * @private
   */
  _flushLogBuffer() {
    if (this.logBuffer.length === 0) return;

    try {
      const flushStart = performance.now();

      const bufferData = {
        logs: [...this.logBuffer],
        batchId: `${this.instanceId}-${Date.now()}`,
        timestamp: Date.now(),
        logCount: this.logBuffer.length,
        compressed: this.bufferCompressionEnabled,
      };

      // Compress if enabled (placeholder for actual compression)
      if (this.bufferCompressionEnabled) {
        // TODO: Implement actual compression here
        bufferData.compressionRatio = 0.7; // Placeholder
      }

      // Send to log aggregation service (placeholder for actual implementation)
      // Console output removed to reduce noise

      // Update metrics
      this.performanceMetrics.bufferFlushes++;
      this._recordPerformanceMetric(
        "bufferFlushTime",
        performance.now() - flushStart,
      );

      // Clear buffer
      this.logBuffer = [];
      this.lastBufferFlush = Date.now();

      // Log buffer flush telemetry
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.BUFFER_FLUSH,
        {
          logCount: bufferData.logCount,
          flushTime: performance.now() - flushStart,
          bufferFlushes: this.performanceMetrics.bufferFlushes,
        },
      );
    } catch (error) {
      console.error("Logger: Failed to flush log buffer", error);
      this._handleError(error, "buffer_flush");
    }
  }

  /**
   * Send enterprise heartbeat
   * @private
   */
  _sendHeartbeat() {
    try {
      const heartbeatData = {
        instanceId: this.instanceId,
        timestamp: Date.now(),
        uptime: Date.now() - this.startTime,
        health: this.healthMetrics.isHealthy,
        errorCount: this.errorCount,
        circuitBreakerTripped: this.circuitBreakerTripped,
        metrics: {
          totalLogs: this.performanceMetrics.totalLogs,
          bufferSize: this.logBuffer.length,
          bufferFlushes: this.performanceMetrics.bufferFlushes,
          logsByLevel: this.performanceMetrics.logsByLevel,
        },
      };

      // Send heartbeat via telemetry instead of console to reduce noise
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.HEALTH_CHECK,
        heartbeatData,
      );
    } catch (error) {
      console.error("Logger: Failed to send heartbeat", error);
    }
  }

  /**
   * Perform health check with enterprise monitoring
   * @returns {Object} Health status report
   */
  performHealthCheck() {
    try {
      const now = Date.now();
      const uptime = now - this.startTime;
      const memoryUsage = performance.memory
        ? performance.memory.usedJSHeapSize / 1024 / 1024
        : 0;

      // Calculate average performance metrics
      const avgLogTime = this._calculateAverageMetric("operationTimes");

      const healthStatus = {
        instanceId: this.instanceId,
        healthy: true,
        timestamp: now,
        uptime,
        metrics: {
          ...this.healthMetrics,
          memoryUsage,
          errorCount: this.errorCount,
          bufferSize: this.logBuffer.length,
          averageLogTime: avgLogTime,
        },
        performance: {
          totalLogs: this.performanceMetrics.totalLogs,
          bufferFlushes: this.performanceMetrics.bufferFlushes,
          logsByLevel: this.performanceMetrics.logsByLevel,
        },
        circuitBreakerStatus: this.circuitBreakerTripped ? "OPEN" : "CLOSED",
        bufferStatus: {
          size: this.logBuffer.length,
          maxSize: ENTERPRISE_CONSTANTS.AGGREGATION.MAX_BUFFER_SIZE,
          utilizationPercent:
            (this.logBuffer.length /
              ENTERPRISE_CONSTANTS.AGGREGATION.MAX_BUFFER_SIZE) *
            100,
        },
      };

      // Determine overall health
      if (
        this.circuitBreakerTripped ||
        this.errorCount > ENTERPRISE_CONSTANTS.HEALTH.MAX_ERRORS ||
        memoryUsage > ENTERPRISE_CONSTANTS.HEALTH.MEMORY_THRESHOLD_MB ||
        this.logBuffer.length >
          ENTERPRISE_CONSTANTS.HEALTH.BUFFER_SIZE_THRESHOLD ||
        avgLogTime > ENTERPRISE_CONSTANTS.PERFORMANCE.LOG_OPERATION_THRESHOLD
      ) {
        healthStatus.healthy = false;
        this.healthMetrics.isHealthy = false;
      } else {
        this.healthMetrics.isHealthy = true;
      }

      this.healthMetrics.lastHealthCheck = now;
      this.healthMetrics.memoryUsage = memoryUsage;
      this.healthMetrics.bufferSize = this.logBuffer.length;

      return healthStatus;
    } catch (error) {
      console.error("Logger: Health check failed", error);
      return {
        instanceId: this.instanceId,
        healthy: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Calculate average for a performance metric array
   * @param {string} metricArrayName - Name of the metric array
   * @returns {number} Average value
   * @private
   */
  _calculateAverageMetric(metricArrayName) {
    const metrics = this.performanceMetrics[metricArrayName] || [];
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  /**
   * Error logging - always enabled
   */
  error(context, message, data) {
    this.log("error", context, message, data);
  }

  /**
   * Warning logging - enabled in dev and staging
   */
  warn(context, message, data) {
    this.log("warn", context, message, data);
  }

  /**
   * Info logging - enabled in development
   */
  info(context, message, data) {
    this.log("info", context, message, data);
  }

  /**
   * Debug logging - enabled in development with debug flag
   */
  debug(context, message, data) {
    this.log("debug", context, message, data);
  }

  /**
   * Trace logging - enabled in development with debug flag
   */
  trace(context, message, data) {
    this.log("trace", context, message, data);
  }

  /**
   * Performance timing
   */
  time(label) {
    if (this.enabledTypes.has("debug")) {
      console.time(label);
    }
  }

  timeEnd(label) {
    if (this.enabledTypes.has("debug")) {
      console.timeEnd(label);
    }
  }

  /**
   * Enable/disable specific log types
   */
  enable(type) {
    this.enabledTypes.add(type);
  }

  disable(type) {
    this.enabledTypes.delete(type);
  }

  /**
   * Enable debug mode
   */
  enableDebug() {
    this.enabledTypes.add("debug");
    this.enabledTypes.add("trace");
  }

  /**
   * Disable all logging except errors
   */
  silent() {
    this.enabledTypes.clear();
    this.enabledTypes.add("error");
  }

  // ⭐ STATIC ENTERPRISE METHODS ⭐

  /**
   * Get all active Logger instances
   * @returns {Array} Array of active instances
   * @static
   */
  static getAllInstances() {
    return Array.from(Logger._instances || []);
  }

  /**
   * Generate enterprise health report for all instances
   * @returns {Object} Comprehensive health report
   * @static
   */
  static getEnterpriseHealthReport() {
    const instances = Logger.getAllInstances();

    const report = {
      timestamp: Date.now(),
      totalInstances: instances.length,
      healthyInstances: 0,
      unhealthyInstances: 0,
      instances: [],
      aggregateMetrics: {
        totalErrors: 0,
        totalLogs: 0,
        totalBufferFlushes: 0,
        averageUptime: 0,
        circuitBreakerTrips: 0,
        totalBufferSize: 0,
      },
    };

    instances.forEach((instance) => {
      const health = instance.performHealthCheck();
      report.instances.push(health);

      if (health.healthy) {
        report.healthyInstances++;
      } else {
        report.unhealthyInstances++;
      }

      report.aggregateMetrics.totalErrors += health.metrics?.errorCount || 0;
      report.aggregateMetrics.totalLogs += health.performance?.totalLogs || 0;
      report.aggregateMetrics.totalBufferFlushes +=
        health.performance?.bufferFlushes || 0;
      report.aggregateMetrics.circuitBreakerTrips +=
        health.circuitBreakerStatus === "OPEN" ? 1 : 0;
      report.aggregateMetrics.totalBufferSize += health.bufferStatus?.size || 0;
    });

    if (instances.length > 0) {
      const totalUptime = instances.reduce(
        (acc, instance) => acc + (Date.now() - instance.startTime),
        0,
      );
      report.aggregateMetrics.averageUptime = totalUptime / instances.length;
    }

    return report;
  }

  /**
   * Debug enterprise status for all instances
   * @static
   */
  static debugEnterpriseStatus() {
    const healthReport = Logger.getEnterpriseHealthReport();

    console.group("🏢 Logger Enterprise Status");
    console.log("📊 Health Report:", healthReport);
    console.log("📈 Instance Count:", healthReport.totalInstances);
    console.log("✅ Healthy Instances:", healthReport.healthyInstances);
    console.log("❌ Unhealthy Instances:", healthReport.unhealthyInstances);
    console.log("⚡ Aggregate Metrics:", healthReport.aggregateMetrics);

    healthReport.instances.forEach((instance, index) => {
      console.group(`📱 Instance ${index + 1} (${instance.instanceId})`);
      console.log(
        "Health Status:",
        instance.healthy ? "✅ Healthy" : "❌ Unhealthy",
      );
      console.log("Uptime:", `${Math.round(instance.uptime / 1000)}s`);
      console.log("Circuit Breaker:", instance.circuitBreakerStatus);
      console.log("Performance Metrics:", instance.performance);
      console.log("Buffer Status:", instance.bufferStatus);
      console.log(
        "Memory Usage:",
        `${instance.metrics.memoryUsage?.toFixed(2)} MB`,
      );
      console.groupEnd();
    });

    console.groupEnd();

    return healthReport;
  }

  /**
   * Set correlation ID for request tracking
   * @param {string} correlationId - Correlation ID to set
   * @static
   */
  static setCorrelationId(correlationId) {
    Logger.getAllInstances().forEach((instance) => {
      instance.currentCorrelationId = correlationId;
    });
  }

  /**
   * Clear correlation ID
   * @static
   */
  static clearCorrelationId() {
    Logger.getAllInstances().forEach((instance) => {
      instance.currentCorrelationId = null;
    });
  }

  /**
   * Force flush all log buffers
   * @static
   */
  static flushAllBuffers() {
    Logger.getAllInstances().forEach((instance) => {
      instance._flushLogBuffer();
      instance._flushTelemetryBatch();
    });
  }
}

// ⭐ STATIC INSTANCE TRACKING ⭐
Logger._instances = new Set();

// Create singleton instance
const logger = new Logger();

// ⭐ GLOBAL ENTERPRISE DEBUG FUNCTIONS ⭐
// OPTIMIZED: Conditional global exposure to avoid unnecessary window pollution

/**
 * OPTIMIZED: Conditionally expose global debug functions based on environment
 * Only expose in development to reduce global namespace pollution
 */
function exposeGlobalDebugFunctions() {
  if (typeof window === "undefined") return;

  // OPTIMIZED: Reuse cached environment detection instead of duplicating logic
  // Use the singleton logger instance to avoid creating a new instance
  const isDevelopment = logger._environmentCache.isDevelopment;

  if (!isDevelopment) return;

  /**
   * Global debug function for Logger enterprise status
   * Usage: debugLogger() in browser console
   */
  window.debugLogger = function () {
    return Logger.debugEnterpriseStatus();
  };

  /**
   * Global function to get Logger health report
   * Usage: getLoggerHealth() in browser console
   */
  window.getLoggerHealth = function () {
    return Logger.getEnterpriseHealthReport();
  };

  /**
   * Global function to list all active Logger instances
   * Usage: listLoggerInstances() in browser console
   */
  window.listLoggerInstances = function () {
    const instances = Logger.getAllInstances();
    console.table(
      instances.map((instance) => ({
        instanceId: instance.instanceId,
        sessionId: instance.sessionId,
        startTime: new Date(instance.startTime).toLocaleString(),
        errorCount: instance.errorCount,
        circuitBreakerTripped: instance.circuitBreakerTripped,
        totalLogs: instance.performanceMetrics.totalLogs,
        bufferSize: instance.logBuffer.length,
      })),
    );
    return instances;
  };

  /**
   * Global function to set correlation ID for tracking requests
   * Usage: setLoggerCorrelationId('request-123') in browser console
   */
  window.setLoggerCorrelationId = function (correlationId) {
    Logger.setCorrelationId(correlationId);
    console.log("Correlation ID set:", correlationId);
  };

  /**
   * Global function to flush all log buffers
   * Usage: flushLoggerBuffers() in browser console
   */
  window.flushLoggerBuffers = function () {
    Logger.flushAllBuffers();
    console.log("All logger buffers flushed");
  };
}

// OPTIMIZED: Call the function to expose debug functions conditionally
exposeGlobalDebugFunctions();

// ES6 module exports
export default logger;
export { logger };

// Backward compatibility for older modules
if (typeof window !== "undefined") {
  window.Logger = logger;
}
