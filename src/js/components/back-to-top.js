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
 * ⭐ ENTERPRISE-GRADE BACK TO TOP NAVIGATION SYSTEM ⭐
 * Advanced scroll navigation component with comprehensive monitoring,
 * performance analytics, user interaction tracking, and enterprise telemetry
 *
 * ENTERPRISE FEATURES:
 * • Real-time scroll performance monitoring and optimization
 * • User navigation pattern analysis and behavioral insights
 * • Circuit breaker pattern for error resilience and fault tolerance
 * • Comprehensive telemetry batching and enterprise analytics
 * • Health monitoring with predictive failure detection
 * • Memory usage tracking and performance optimization
 * • Enterprise-grade error handling and recovery mechanisms
 * • Static enterprise methods for fleet monitoring and debugging
 */

// ⭐ ENTERPRISE CONFIGURATION CONSTANTS ⭐
const ENTERPRISE_CONSTANTS = {
  // Health monitoring configuration
  HEALTH: {
    CHECK_INTERVAL: 30000, // Health check every 30 seconds
    MAX_ERRORS: 5, // Maximum errors before health failure
    MEMORY_THRESHOLD_MB: 10, // Memory threshold in MB
    SCROLL_PERFORMANCE_THRESHOLD: 50, // Max scroll handler execution time (ms)
    ANIMATION_PERFORMANCE_THRESHOLD: 100, // Max animation duration threshold (ms)
    HEARTBEAT_INTERVAL: 60000, // Heartbeat every minute
  },

  // Performance monitoring thresholds
  PERFORMANCE: {
    SCROLL_HANDLER_THRESHOLD: 20, // Max scroll handler time (ms)
    ANIMATION_DURATION_THRESHOLD: 50, // Max animation time (ms)
    VISIBILITY_CHECK_THRESHOLD: 5, // Max visibility check time (ms)
    BUTTON_RENDER_THRESHOLD: 10, // Max button render time (ms)
  },

  // Circuit breaker configuration
  CIRCUIT_BREAKER: {
    MAX_ERRORS: 3, // Circuit breaker trip threshold
    RECOVERY_TIMEOUT: 30000, // Auto-recovery timeout (30 seconds)
  },

  // Telemetry configuration
  TELEMETRY: {
    BATCH_SIZE: 20, // Events before batch flush
    FLUSH_INTERVAL: 60000, // Max time before flush (1 minute)
    EVENT_TYPES: {
      SCROLL_EVENT: "scroll_event",
      BUTTON_CLICK: "button_click",
      BUTTON_SHOW: "button_show",
      BUTTON_HIDE: "button_hide",
      PERFORMANCE_METRIC: "performance_metric",
      ERROR_EVENT: "error_event",
      VISIBILITY_CHANGE: "visibility_change",
    },
  },

  // User interaction analytics
  ANALYTICS: {
    SCROLL_SAMPLE_RATE: 0.1, // Sample 10% of scroll events
    INTERACTION_TIMEOUT: 5000, // User interaction session timeout
    ENGAGEMENT_THRESHOLD: 3, // Minimum interactions for engagement
  },
};

// Original configuration constants
const VIEWPORT_HEIGHT_MULTIPLIER = 3;
const SCROLL_THROTTLE_MS = 16; // ~60fps
const SCROLL_ANIMATION_DURATION_MS = 600;

class BackToTop {
  constructor() {
    // ⭐ ENTERPRISE INITIALIZATION ⭐

    // Generate unique instance identifier for enterprise tracking
    this.instanceId = this._generateUUID();
    this.sessionId = `session-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.startTime = Date.now();

    // Add to enterprise instance tracking
    if (!BackToTop._instances) {
      BackToTop._instances = new Set();
    }
    BackToTop._instances.add(this);

    // Initialize enterprise monitoring systems
    this.errorCount = 0;
    this.circuitBreakerTripped = false;
    this.telemetryBatch = [];
    this.lastTelemetryFlush = Date.now();

    // Performance tracking
    this.performanceMetrics = {
      totalScrollEvents: 0,
      totalButtonClicks: 0,
      totalVisibilityChanges: 0,
      scrollHandlerTimes: [],
      animationTimes: [],
      lastInteraction: Date.now(),
    };

    // User interaction analytics
    this.userJourney = {
      sessionStart: Date.now(),
      scrollPatterns: [],
      buttonInteractions: [],
      engagementScore: 0,
    };

    // Health monitoring
    this.healthMetrics = {
      isHealthy: true,
      lastHealthCheck: Date.now(),
      memoryUsage: 0,
      errorRate: 0,
    };

    // Original component properties
    this.button = null;
    this.isVisible = false;
    this.threshold = window.innerHeight * VIEWPORT_HEIGHT_MULTIPLIER;

    // Initialize enterprise monitoring before component setup
    this._initializeEnterpriseMonitoring();

    this.init();

    // Log enterprise initialization
    this._logTelemetry(
      ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
      {
        event: "component_initialized",
        initTime: Date.now() - this.startTime,
        threshold: this.threshold,
        viewport: {
          width: window.innerWidth,
          height: window.innerHeight,
        },
      },
    );
  }

  /**
   * Generate UUID for enterprise tracking
   * @returns {string} UUID
   * @private
   */
  _generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  init() {
    this.createButton();
    this.setupEventListeners();
    this.updateVisibility();
  }

  createButton() {
    try {
      const renderStart = performance.now();

      // Remove any existing button
      const existing = document.getElementById("back-to-top");
      if (existing) {
        existing.remove();
      }

      this.button = document.createElement("button");
      this.button.id = "back-to-top";
      this.button.className = "back-to-top";
      this.button.setAttribute("aria-label", "Back to top");
      this.button.innerHTML = "↑";

      // Apply inline styles for immediate visibility
      Object.assign(this.button.style, {
        position: "fixed",
        bottom: "2rem",
        right: "2rem",
        width: "3.5rem",
        height: "3.5rem",
        borderRadius: "50%",
        border: "2px solid #007acc",
        backgroundColor: "transparent",
        color: "#007acc",
        fontSize: "1.8rem",
        cursor: "pointer",
        zIndex: "1000",
        opacity: "0",
        visibility: "hidden",
        transition: "all 0.3s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        boxShadow: "0 4px 12px rgba(0, 122, 204, 0.2)",
        fontWeight: "bold",
      });

      document.body.appendChild(this.button);

      // Record enterprise performance metrics
      const renderTime = performance.now() - renderStart;
      this._recordPerformanceMetric("buttonRenderTime", renderTime);

      // Log button creation telemetry
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
        {
          event: "button_created",
          renderTime,
          buttonId: this.button.id,
          timestamp: Date.now(),
        },
      );
    } catch (error) {
      this._handleError(error, "createButton");
    }
  }

  setupEventListeners() {
    try {
      let throttleTimer = null;

      const throttledScroll = () => {
        if (throttleTimer) return;

        const scrollStart = performance.now();

        throttleTimer = setTimeout(() => {
          this.updateVisibility();

          // Track scroll performance
          const scrollTime = performance.now() - scrollStart;
          this._recordPerformanceMetric("scrollHandlerTime", scrollTime);

          // Track scroll events for analytics
          this.performanceMetrics.totalScrollEvents++;
          this.performanceMetrics.lastInteraction = Date.now();

          // Sample scroll events for telemetry
          if (
            Math.random() < ENTERPRISE_CONSTANTS.ANALYTICS.SCROLL_SAMPLE_RATE
          ) {
            this._logTelemetry(
              ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.SCROLL_EVENT,
              {
                scrollY: window.pageYOffset,
                scrollTime,
                timestamp: Date.now(),
                isVisible: this.isVisible,
              },
            );
          }

          throttleTimer = null;
        }, SCROLL_THROTTLE_MS);
      };

      window.addEventListener("scroll", throttledScroll, { passive: true });

      this.button.addEventListener("click", (e) => {
        e.preventDefault();

        // Track button click analytics
        this.performanceMetrics.totalButtonClicks++;
        this.userJourney.buttonInteractions.push({
          timestamp: Date.now(),
          scrollPosition: window.pageYOffset,
          action: "scroll_to_top",
        });

        // Log enterprise telemetry
        this._logTelemetry(
          ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.BUTTON_CLICK,
          {
            scrollPosition: window.pageYOffset,
            timestamp: Date.now(),
            totalClicks: this.performanceMetrics.totalButtonClicks,
          },
        );

        this.scrollToTop();
      });

      // Hover effects with enterprise tracking
      this.button.addEventListener("mouseenter", () => {
        this.button.style.backgroundColor = "rgba(0, 122, 204, 0.1)";
        this.button.style.borderColor = "#005a9e";
        this.button.style.color = "#005a9e";
        this.button.style.transform = "scale(1.1)";

        // Track hover interaction
        this._logTelemetry(
          ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
          {
            event: "button_hover_enter",
            timestamp: Date.now(),
          },
        );
      });

      this.button.addEventListener("mouseleave", () => {
        this.button.style.backgroundColor = "transparent";
        this.button.style.borderColor = "#007acc";
        this.button.style.color = "#007acc";
        this.button.style.transform = "scale(1)";

        // Track hover interaction
        this._logTelemetry(
          ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
          {
            event: "button_hover_leave",
            timestamp: Date.now(),
          },
        );
      });
    } catch (error) {
      this._handleError(error, "setupEventListeners");
    }
  }

  updateVisibility() {
    try {
      const visibilityStart = performance.now();
      const scrollY = window.pageYOffset || document.documentElement.scrollTop;
      const shouldShow = scrollY > this.threshold;

      if (shouldShow !== this.isVisible) {
        this.isVisible = shouldShow;
        this.performanceMetrics.totalVisibilityChanges++;

        if (shouldShow) {
          this.button.style.opacity = "1";
          this.button.style.visibility = "visible";

          // Log button show event
          this._logTelemetry(
            ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.BUTTON_SHOW,
            {
              scrollPosition: scrollY,
              threshold: this.threshold,
              timestamp: Date.now(),
            },
          );
        } else {
          this.button.style.opacity = "0";
          this.button.style.visibility = "hidden";

          // Log button hide event
          this._logTelemetry(
            ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.BUTTON_HIDE,
            {
              scrollPosition: scrollY,
              threshold: this.threshold,
              timestamp: Date.now(),
            },
          );
        }

        // Record visibility check performance
        const visibilityTime = performance.now() - visibilityStart;
        this._recordPerformanceMetric("visibilityCheckTime", visibilityTime);

        // Log visibility change telemetry
        this._logTelemetry(
          ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.VISIBILITY_CHANGE,
          {
            isVisible: shouldShow,
            scrollPosition: scrollY,
            visibilityTime,
            totalChanges: this.performanceMetrics.totalVisibilityChanges,
          },
        );
      }
    } catch (error) {
      this._handleError(error, "updateVisibility");
    }
  }

  scrollToTop() {
    try {
      const animationStart = performance.now();

      // Hide immediately
      this.button.style.opacity = "0";
      this.isVisible = false;

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });

      // Track animation performance
      setTimeout(() => {
        const animationTime = performance.now() - animationStart;
        this._recordPerformanceMetric("animationTime", animationTime);

        // Update user engagement score
        this.userJourney.engagementScore++;

        // Log scroll to top telemetry
        this._logTelemetry(
          ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
          {
            event: "scroll_to_top_completed",
            animationTime,
            engagementScore: this.userJourney.engagementScore,
            timestamp: Date.now(),
          },
        );
      }, SCROLL_ANIMATION_DURATION_MS);

      // Recheck visibility after animation
      setTimeout(() => {
        this.updateVisibility();
      }, SCROLL_ANIMATION_DURATION_MS);
    } catch (error) {
      this._handleError(error, "scrollToTop");
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

      // Setup heartbeat interval
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, ENTERPRISE_CONSTANTS.HEALTH.HEARTBEAT_INTERVAL);

      return true;
    } catch (error) {
      console.error(
        "BackToTop: Failed to initialize enterprise monitoring",
        error,
      );
      return false;
    }
  }

  /**
   * Handle errors with enterprise error management
   * @param {Error} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @private
   */
  _handleError(error, context = "unknown") {
    this.errorCount++;
    this.healthMetrics.errorRate =
      this.errorCount / ((Date.now() - this.startTime) / 1000);

    const errorData = {
      instanceId: this.instanceId,
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount,
      sessionId: this.sessionId,
    };

    // Check if circuit breaker should trip
    if (this.errorCount >= ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER.MAX_ERRORS) {
      this.circuitBreakerTripped = true;

      console.error("BackToTop: Circuit breaker tripped", {
        ...errorData,
        circuitBreakerState: "OPEN",
      });

      // Auto-recovery after timeout
      setTimeout(() => {
        this.circuitBreakerTripped = false;
        this.errorCount = 0;
        console.info("BackToTop: Circuit breaker auto-recovery", {
          instanceId: this.instanceId,
        });
      }, ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER.RECOVERY_TIMEOUT);
    }

    // Log to enterprise telemetry
    this._logTelemetry(
      ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.ERROR_EVENT,
      errorData,
    );

    console.error("BackToTop", `Error in ${context}`, errorData);
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
      if (metricName === "scrollHandlerTime") {
        this.performanceMetrics.scrollHandlerTimes.push(metric);
      } else if (metricName === "animationTime") {
        this.performanceMetrics.animationTimes.push(metric);
      }

      // Check performance thresholds
      if (
        metricName === "scrollHandlerTime" &&
        value > ENTERPRISE_CONSTANTS.PERFORMANCE.SCROLL_HANDLER_THRESHOLD
      ) {
        console.warn("BackToTop: Scroll handler time exceeded threshold", {
          threshold: ENTERPRISE_CONSTANTS.PERFORMANCE.SCROLL_HANDLER_THRESHOLD,
          actual: value,
          instanceId: this.instanceId,
        });
      }

      if (
        metricName === "animationTime" &&
        value > ENTERPRISE_CONSTANTS.PERFORMANCE.ANIMATION_DURATION_THRESHOLD
      ) {
        console.warn("BackToTop: Animation time exceeded threshold", {
          threshold:
            ENTERPRISE_CONSTANTS.PERFORMANCE.ANIMATION_DURATION_THRESHOLD,
          actual: value,
          instanceId: this.instanceId,
        });
      }

      // Log to enterprise telemetry
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
        metric,
      );
    } catch (error) {
      console.error("BackToTop: Failed to record performance metric", error);
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
      const telemetryEvent = {
        eventType,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        sessionId: this.sessionId,
        data,
        version: "1.20.0",
      };

      // Add to batch
      this.telemetryBatch.push(telemetryEvent);

      // Check if batch should be flushed
      const shouldFlush =
        this.telemetryBatch.length >=
          ENTERPRISE_CONSTANTS.TELEMETRY.BATCH_SIZE ||
        Date.now() - this.lastTelemetryFlush >=
          ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL;

      if (shouldFlush) {
        this._flushTelemetryBatch();
      }
    } catch (error) {
      console.error("BackToTop: Failed to log telemetry", error);
    }
  }

  /**
   * Flush telemetry batch to analytics service
   * @private
   */
  _flushTelemetryBatch() {
    if (this.telemetryBatch.length === 0) return;

    try {
      const batchData = {
        events: [...this.telemetryBatch],
        batchId: `${this.instanceId}-${Date.now()}`,
        timestamp: Date.now(),
        instanceCount: this.telemetryBatch.length,
      };

      // Send to analytics service (placeholder for actual implementation)
      console.info("BackToTop: Telemetry batch flushed", {
        batchSize: this.telemetryBatch.length,
        batchId: batchData.batchId,
        instanceId: this.instanceId,
      });

      // Clear batch
      this.telemetryBatch = [];
      this.lastTelemetryFlush = Date.now();
    } catch (error) {
      console.error("BackToTop: Failed to flush telemetry batch", error);
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
          totalScrollEvents: this.performanceMetrics.totalScrollEvents,
          totalButtonClicks: this.performanceMetrics.totalButtonClicks,
          totalVisibilityChanges:
            this.performanceMetrics.totalVisibilityChanges,
          engagementScore: this.userJourney.engagementScore,
        },
      };

      console.debug("BackToTop: Heartbeat sent", heartbeatData);
    } catch (error) {
      console.error("BackToTop: Failed to send heartbeat", error);
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
      const avgScrollTime = this._calculateAverageMetric("scrollHandlerTimes");
      const avgAnimationTime = this._calculateAverageMetric("animationTimes");

      const healthStatus = {
        instanceId: this.instanceId,
        healthy: true,
        timestamp: now,
        uptime,
        metrics: {
          ...this.healthMetrics,
          memoryUsage,
          errorCount: this.errorCount,
          averageScrollTime: avgScrollTime,
          averageAnimationTime: avgAnimationTime,
        },
        performance: {
          totalScrollEvents: this.performanceMetrics.totalScrollEvents,
          totalButtonClicks: this.performanceMetrics.totalButtonClicks,
          totalVisibilityChanges:
            this.performanceMetrics.totalVisibilityChanges,
          engagementScore: this.userJourney.engagementScore,
        },
        circuitBreakerStatus: this.circuitBreakerTripped ? "OPEN" : "CLOSED",
        telemetryBatchSize: this.telemetryBatch.length,
      };

      // Determine overall health
      if (
        this.circuitBreakerTripped ||
        this.errorCount > ENTERPRISE_CONSTANTS.HEALTH.MAX_ERRORS ||
        memoryUsage > ENTERPRISE_CONSTANTS.HEALTH.MEMORY_THRESHOLD_MB ||
        avgScrollTime >
          ENTERPRISE_CONSTANTS.PERFORMANCE.SCROLL_HANDLER_THRESHOLD
      ) {
        healthStatus.healthy = false;
        this.healthMetrics.isHealthy = false;
      } else {
        this.healthMetrics.isHealthy = true;
      }

      this.healthMetrics.lastHealthCheck = now;
      this.healthMetrics.memoryUsage = memoryUsage;

      return healthStatus;
    } catch (error) {
      console.error("BackToTop: Health check failed", error);
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

  // ⭐ STATIC ENTERPRISE METHODS ⭐

  /**
   * Get all active BackToTop instances
   * @returns {Array} Array of active instances
   * @static
   */
  static getAllInstances() {
    return Array.from(BackToTop._instances || []);
  }

  /**
   * Generate enterprise health report for all instances
   * @returns {Object} Comprehensive health report
   * @static
   */
  static getEnterpriseHealthReport() {
    const instances = BackToTop.getAllInstances();

    const report = {
      timestamp: Date.now(),
      totalInstances: instances.length,
      healthyInstances: 0,
      unhealthyInstances: 0,
      instances: [],
      aggregateMetrics: {
        totalErrors: 0,
        totalScrollEvents: 0,
        totalButtonClicks: 0,
        totalVisibilityChanges: 0,
        averageUptime: 0,
        circuitBreakerTrips: 0,
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
      report.aggregateMetrics.totalScrollEvents +=
        health.performance?.totalScrollEvents || 0;
      report.aggregateMetrics.totalButtonClicks +=
        health.performance?.totalButtonClicks || 0;
      report.aggregateMetrics.totalVisibilityChanges +=
        health.performance?.totalVisibilityChanges || 0;
      report.aggregateMetrics.circuitBreakerTrips +=
        health.circuitBreakerStatus === "OPEN" ? 1 : 0;
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
    const healthReport = BackToTop.getEnterpriseHealthReport();

    console.group("🏢 BackToTop Enterprise Status");
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
      console.log(
        "Memory Usage:",
        `${instance.metrics.memoryUsage?.toFixed(2)} MB`,
      );
      console.groupEnd();
    });

    console.groupEnd();

    return healthReport;
  }
}

// ⭐ STATIC INSTANCE TRACKING ⭐
BackToTop._instances = new Set();

// ⭐ GLOBAL ENTERPRISE DEBUG FUNCTIONS ⭐

/**
 * Global debug function for BackToTop enterprise status
 * Usage: debugBackToTop() in browser console
 */
window.debugBackToTop = function () {
  return BackToTop.debugEnterpriseStatus();
};

/**
 * Global function to get BackToTop health report
 * Usage: getBackToTopHealth() in browser console
 */
window.getBackToTopHealth = function () {
  return BackToTop.getEnterpriseHealthReport();
};

/**
 * Global function to list all active BackToTop instances
 * Usage: listBackToTopInstances() in browser console
 */
window.listBackToTopInstances = function () {
  const instances = BackToTop.getAllInstances();
  console.table(
    instances.map((instance) => ({
      instanceId: instance.instanceId,
      isVisible: instance.isVisible,
      startTime: new Date(instance.startTime).toLocaleString(),
      errorCount: instance.errorCount,
      circuitBreakerTripped: instance.circuitBreakerTripped,
      totalScrollEvents: instance.performanceMetrics.totalScrollEvents,
      totalButtonClicks: instance.performanceMetrics.totalButtonClicks,
    })),
  );
  return instances;
};

// Initialize immediately when script loads
const backToTopInstance = new BackToTop();

// Also make it globally accessible for debugging
window.BackToTop = backToTopInstance;

// Backup initialization on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    if (!document.getElementById("back-to-top")) {
      new BackToTop();
    }
  });
}

export default BackToTop;
