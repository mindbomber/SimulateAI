/**
 * Performance Monitor Utility
 *
 * Provides performance tracking and monitoring for components
 * with automatic threshold warnings and memory usage tracking.
 * Phase 3.3: Enhanced with DataHandler integration for persistent metrics.
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import {
  INPUT_UTILITY_CONSTANTS,
  PERFORMANCE_THRESHOLDS,
} from "../components/input-utilities/constants.js";

// Local debug utility to avoid circular dependencies
const ComponentDebug = {
  warn(message, data) {
    if (typeof window !== "undefined" && window.DEBUG_MODE) {
      if (data) {
        window.console.warn(`[Performance] ${message}:`, data);
      } else {
        window.console.warn(`[Performance] ${message}`);
      }
    }
  },
  log(message, data) {
    if (typeof window !== "undefined" && window.DEBUG_MODE) {
      if (data) {
        window.console.log(`[Performance] ${message}:`, data);
      } else {
        window.console.log(`[Performance] ${message}`);
      }
    }
  },
};

/**
 * Performance monitoring utility for tracking component performance
 * and detecting performance bottlenecks across the application.
 * Phase 3.3: Enhanced with DataHandler integration for persistent metrics.
 */
export class PerformanceMonitor {
  static metrics = new Map();
  static isMonitoring = false;
  static instances = new Map();

  /**
   * Phase 3.3: Enhanced constructor with DataHandler support
   * @param {string} name - Monitor instance name
   * @param {Object} app - App instance with DataHandler (optional for backward compatibility)
   */
  constructor(name, app = null) {
    this.name = name;
    this.measurements = new Map();
    this.startTimes = new Map();

    // Phase 3.3: DataHandler integration
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.persistentMetrics = this.dataHandler ? true : false;

    // Performance metrics history for trend analysis
    this.metricsHistory = [];
    this.warningCount = 0;
    this.criticalCount = 0;

    // Auto-initialize persistent metrics loading
    if (this.persistentMetrics) {
      this.initializeMetricsAsync();
    }

    ComponentDebug.log(`PerformanceMonitor ${name} initialized`, {
      persistentMetrics: this.persistentMetrics,
      hasDataHandler: !!this.dataHandler,
    });
  }

  /**
   * Phase 3.3: Enhanced createInstance with app parameter support
   * @param {string} name - Instance name
   * @param {Object} app - App instance with DataHandler (optional)
   * @returns {PerformanceMonitor} Monitor instance
   */
  static createInstance(name, app = null) {
    if (!this.instances.has(name)) {
      this.instances.set(name, new PerformanceMonitor(name, app));
    }
    return this.instances.get(name);
  }

  /**
   * Phase 3.3: Async initialization for persistent metrics loading
   */
  async initializeMetricsAsync() {
    if (!this.dataHandler) return;

    try {
      const savedMetrics = await this.loadPerformanceMetrics();
      if (savedMetrics) {
        this.metricsHistory = savedMetrics.history || [];
        this.warningCount = savedMetrics.warningCount || 0;
        this.criticalCount = savedMetrics.criticalCount || 0;

        ComponentDebug.log(`${this.name} metrics loaded from persistence`, {
          historyEntries: this.metricsHistory.length,
          warnings: this.warningCount,
          critical: this.criticalCount,
        });
      }
    } catch (error) {
      ComponentDebug.warn(`Failed to load metrics for ${this.name}:`, error);
    }
  }

  /**
   * Phase 3.3: Load performance metrics from DataHandler
   * @returns {Object|null} Saved metrics or null
   */
  async loadPerformanceMetrics() {
    if (!this.dataHandler) return null;

    try {
      const key = `performance_metrics_${this.name}`;
      return await this.dataHandler.getData(key);
    } catch (error) {
      ComponentDebug.warn(`Failed to load performance metrics:`, error);
      return null;
    }
  }

  /**
   * Phase 3.3: Save performance metrics to DataHandler
   * @param {Object} metrics - Metrics to save
   */
  async savePerformanceMetrics(metrics) {
    if (!this.dataHandler) return;

    try {
      const key = `performance_metrics_${this.name}`;
      await this.dataHandler.setData(key, {
        ...metrics,
        lastUpdate: new Date().toISOString(),
        monitorName: this.name,
      });
    } catch (error) {
      ComponentDebug.warn(`Failed to save performance metrics:`, error);
    }
  }

  /**
   * Phase 3.3: Update performance metrics in DataHandler
   * @param {Object} updates - Metric updates
   */
  async updatePerformanceMetrics(updates) {
    if (!this.dataHandler) return;

    try {
      const key = `performance_metrics_${this.name}`;
      await this.dataHandler.updateData(key, {
        ...updates,
        lastUpdate: new Date().toISOString(),
      });
    } catch (error) {
      ComponentDebug.warn(`Failed to update performance metrics:`, error);
    }
  }

  startMeasurement(key) {
    this.startTimes.set(key, performance.now());
  }

  /**
   * Phase 3.3: Enhanced endMeasurement with persistent metrics tracking
   * @param {string} key - Measurement key
   * @param {Object} metadata - Additional metadata for the measurement
   * @returns {number} Duration in milliseconds
   */
  async endMeasurement(key, metadata = {}) {
    const startTime = this.startTimes.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.measurements.set(key, duration);
      this.startTimes.delete(key);

      // Enhanced threshold checking with different severity levels
      let severity = "normal";
      const criticalThreshold =
        PERFORMANCE_THRESHOLDS.RENDER_CRITICAL_MS || 5000;
      if (duration > criticalThreshold) {
        severity = "critical";
        this.criticalCount++;
        ComponentDebug.warn(
          `${this.name} ${key} CRITICAL performance issue: ${duration.toFixed(2)}ms`,
        );
      } else if (duration > PERFORMANCE_THRESHOLDS.RENDER_WARNING_MS) {
        severity = "warning";
        this.warningCount++;
        ComponentDebug.warn(
          `${this.name} ${key} exceeded threshold: ${duration.toFixed(2)}ms`,
        );
      }

      // Phase 3.3: Track measurement in history for trend analysis
      const measurementRecord = {
        key,
        duration,
        severity,
        timestamp: new Date().toISOString(),
        metadata,
        memoryUsage: this.getMemoryUsage(),
        ...this.getPerformanceContext(),
      };

      this.metricsHistory.push(measurementRecord);

      // Keep history manageable (last 100 measurements)
      if (this.metricsHistory.length > 100) {
        this.metricsHistory.shift();
      }

      // Phase 3.3: Auto-persist metrics if enabled
      if (this.persistentMetrics) {
        await this.updatePerformanceMetrics({
          history: this.metricsHistory,
          warningCount: this.warningCount,
          criticalCount: this.criticalCount,
          lastMeasurement: measurementRecord,
        });
      }

      return duration;
    }
    return 0;
  }

  /**
   * Phase 3.3: Get additional performance context
   * @returns {Object} Performance context data
   */
  getPerformanceContext() {
    return {
      userAgent: navigator.userAgent,
      viewport: {
        width: window.innerWidth,
        height: window.innerHeight,
      },
      connection: navigator.connection
        ? {
            effectiveType: navigator.connection.effectiveType,
            downlink: navigator.connection.downlink,
          }
        : null,
      hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
    };
  }

  getMeasurement(key) {
    return this.measurements.get(key) || 0;
  }

  /**
   * Phase 3.3: Get performance analytics and trends
   * @returns {Object} Performance analytics data
   */
  getPerformanceAnalytics() {
    const analytics = {
      totalMeasurements: this.metricsHistory.length,
      warningCount: this.warningCount,
      criticalCount: this.criticalCount,
      averageDuration: 0,
      trends: {},
      recentPerformance: [],
      systemHealth: "good",
    };

    if (this.metricsHistory.length > 0) {
      // Calculate average duration
      analytics.averageDuration =
        this.metricsHistory.reduce((sum, m) => sum + m.duration, 0) /
        this.metricsHistory.length;

      // Get recent performance (last 10 measurements)
      analytics.recentPerformance = this.metricsHistory.slice(-10);

      // Calculate trends by measurement key
      const keyGroups = {};
      this.metricsHistory.forEach((m) => {
        if (!keyGroups[m.key]) keyGroups[m.key] = [];
        keyGroups[m.key].push(m.duration);
      });

      Object.keys(keyGroups).forEach((key) => {
        const durations = keyGroups[key];
        analytics.trends[key] = {
          count: durations.length,
          average: durations.reduce((sum, d) => sum + d, 0) / durations.length,
          min: Math.min(...durations),
          max: Math.max(...durations),
          recent: durations.slice(-5), // Last 5 measurements for this key
        };
      });

      // Determine system health
      const criticalRate =
        analytics.criticalCount / analytics.totalMeasurements;
      const warningRate = analytics.warningCount / analytics.totalMeasurements;

      if (criticalRate > 0.1) analytics.systemHealth = "critical";
      else if (warningRate > 0.3) analytics.systemHealth = "degraded";
      else if (warningRate > 0.1) analytics.systemHealth = "warning";
    }

    return analytics;
  }

  /**
   * Phase 3.3: Get memory usage with enhanced tracking
   * @returns {Object} Memory usage information
   */
  getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return { used: 0, total: 0, limit: 0, usedMB: 0, totalMB: 0, limitMB: 0 };
  }

  /**
   * Phase 3.3: Clear metrics history
   * @param {boolean} persistChange - Whether to persist the clear operation
   */
  async clearMetrics(persistChange = true) {
    this.metricsHistory = [];
    this.warningCount = 0;
    this.criticalCount = 0;
    this.measurements.clear();

    if (persistChange && this.persistentMetrics) {
      await this.savePerformanceMetrics({
        history: [],
        warningCount: 0,
        criticalCount: 0,
        clearedAt: new Date().toISOString(),
      });
    }

    ComponentDebug.log(`${this.name} metrics cleared`);
  }

  /**
   * Phase 3.3: Export metrics for analysis
   * @returns {Object} Exportable metrics data
   */
  exportMetrics() {
    return {
      monitorName: this.name,
      analytics: this.getPerformanceAnalytics(),
      fullHistory: this.metricsHistory,
      currentMeasurements: Object.fromEntries(this.measurements),
      systemInfo: this.getPerformanceContext(),
      exportedAt: new Date().toISOString(),
    };
  }

  // ============================================================================
  // ENHANCED STATIC METHODS - Phase 3.3 Improvements
  // ============================================================================

  /**
   * Legacy static methods for backward compatibility
   * Enhanced with DataHandler integration capabilities
   */
  static startMonitoring(componentId, app = null) {
    if (!this.isMonitoring) return;

    // Phase 3.3: Create instance-based monitor for enhanced tracking
    if (app && app.dataHandler) {
      const instanceMonitor = this.createInstance(`static_${componentId}`, app);
      instanceMonitor.startMeasurement("render");
    }

    this.metrics.set(componentId, {
      renderStart: performance.now(),
      memoryStart: this.getMemoryUsage(),
      timestamp: new Date().toISOString(),
      componentId,
    });
  }

  static endMonitoring(componentId, app = null) {
    if (!this.isMonitoring || !this.metrics.has(componentId)) return;

    const metrics = this.metrics.get(componentId);
    const renderTime = performance.now() - metrics.renderStart;
    const memoryUsage = this.getMemoryUsage();

    // Phase 3.3: Enhanced threshold checking
    const criticalThreshold = PERFORMANCE_THRESHOLDS.RENDER_CRITICAL_MS || 5000;

    if (renderTime > criticalThreshold) {
      ComponentDebug.warn(
        `Component ${componentId} CRITICAL render time: ${renderTime.toFixed(2)}ms`,
      );
    } else if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_WARNING_MS) {
      ComponentDebug.warn(
        `Component ${componentId} render time exceeded threshold: ${renderTime.toFixed(2)}ms`,
      );
    }

    // Memory warning check
    const memoryWarningThreshold =
      PERFORMANCE_THRESHOLDS.MEMORY_WARNING_MB *
      INPUT_UTILITY_CONSTANTS.BYTES_PER_KB *
      INPUT_UTILITY_CONSTANTS.BYTES_PER_KB;

    if (memoryUsage.used > memoryWarningThreshold) {
      ComponentDebug.warn(
        `High memory usage detected: ${memoryUsage.usedMB}MB`,
      );
    }

    // Phase 3.3: Sync with instance monitor if available
    if (app && app.dataHandler) {
      const instanceMonitor = this.instances.get(`static_${componentId}`);
      if (instanceMonitor) {
        instanceMonitor.endMeasurement("render", {
          componentId,
          memoryBefore: metrics.memoryStart,
          memoryAfter: memoryUsage,
          staticMonitoring: true,
        });
      }
    }

    this.metrics.delete(componentId);
  }

  static getMemoryUsage() {
    if (performance.memory) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
        usedMB: Math.round(performance.memory.usedJSHeapSize / 1024 / 1024),
        totalMB: Math.round(performance.memory.totalJSHeapSize / 1024 / 1024),
        limitMB: Math.round(performance.memory.jsHeapSizeLimit / 1024 / 1024),
      };
    }
    return { used: 0, total: 0, limit: 0, usedMB: 0, totalMB: 0, limitMB: 0 };
  }

  /**
   * Phase 3.3: Enhanced static analytics aggregation
   * @returns {Object} Aggregated analytics from all instances
   */
  static getGlobalAnalytics() {
    const globalAnalytics = {
      totalInstances: this.instances.size,
      totalMeasurements: 0,
      totalWarnings: 0,
      totalCritical: 0,
      instanceSummaries: {},
      systemHealth: "good",
      aggregatedAt: new Date().toISOString(),
    };

    // Aggregate data from all instances
    this.instances.forEach((monitor, name) => {
      const analytics = monitor.getPerformanceAnalytics();
      globalAnalytics.totalMeasurements += analytics.totalMeasurements;
      globalAnalytics.totalWarnings += analytics.warningCount;
      globalAnalytics.totalCritical += analytics.criticalCount;

      globalAnalytics.instanceSummaries[name] = {
        measurements: analytics.totalMeasurements,
        warnings: analytics.warningCount,
        critical: analytics.criticalCount,
        health: analytics.systemHealth,
        averageDuration: analytics.averageDuration,
      };
    });

    // Determine global system health
    if (globalAnalytics.totalCritical > 0) {
      globalAnalytics.systemHealth = "critical";
    } else if (
      globalAnalytics.totalWarnings >
      globalAnalytics.totalMeasurements * 0.1
    ) {
      globalAnalytics.systemHealth = "degraded";
    } else if (globalAnalytics.totalWarnings > 0) {
      globalAnalytics.systemHealth = "warning";
    }

    return globalAnalytics;
  }

  static enable() {
    this.isMonitoring = true;
    ComponentDebug.log("Performance monitoring enabled");
  }

  static disable() {
    this.isMonitoring = false;
    this.metrics.clear();
    ComponentDebug.log("Performance monitoring disabled");
  }

  /**
   * Phase 3.3: Enhanced cleanup with instance management
   */
  static cleanup() {
    this.metrics.clear();

    // Clear all instances
    this.instances.forEach((monitor) => {
      monitor.measurements.clear();
      monitor.startTimes.clear();
      monitor.metricsHistory = [];
    });

    this.instances.clear();
    this.isMonitoring = false;
    ComponentDebug.log("Performance monitoring cleaned up");
  }

  /**
   * Phase 3.3: Create enhanced monitor with DataHandler support
   * @param {string} name - Monitor name
   * @param {Object} app - App instance with DataHandler
   * @returns {PerformanceMonitor} Enhanced monitor instance
   */
  static createEnhancedMonitor(name, app) {
    if (!app || !app.dataHandler) {
      ComponentDebug.warn(
        `Creating monitor ${name} without DataHandler support`,
      );
    }

    return this.createInstance(name, app);
  }

  /**
   * Phase 3.3: Get or create application performance monitor
   * @param {Object} app - App instance with DataHandler
   * @returns {PerformanceMonitor} Application monitor instance
   */
  static getAppMonitor(app) {
    return this.createEnhancedMonitor("application", app);
  }
}

// ============================================================================
// ENHANCED EXPORT WITH BACKWARD COMPATIBILITY
// ============================================================================

// Default export maintains backward compatibility
export default PerformanceMonitor;

// Phase 3.3: Static instance for global monitoring
export const GlobalPerformanceMonitor = PerformanceMonitor;
