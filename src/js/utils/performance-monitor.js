/**
 * Performance Monitor Utility
 *
 * Provides performance tracking and monitoring for components
 * with automatic threshold warnings and memory usage tracking.
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
};

/**
 * Performance monitoring utility for tracking component performance
 * and detecting performance bottlenecks across the application.
 */
export class PerformanceMonitor {
  static metrics = new Map();
  static isMonitoring = false;
  static instances = new Map();

  constructor(name) {
    this.name = name;
    this.measurements = new Map();
    this.startTimes = new Map();
  }

  static createInstance(name) {
    if (!this.instances.has(name)) {
      this.instances.set(name, new PerformanceMonitor(name));
    }
    return this.instances.get(name);
  }

  startMeasurement(key) {
    this.startTimes.set(key, performance.now());
  }

  endMeasurement(key) {
    const startTime = this.startTimes.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.measurements.set(key, duration);
      this.startTimes.delete(key);

      // Check against thresholds
      if (duration > PERFORMANCE_THRESHOLDS.RENDER_WARNING_MS) {
        ComponentDebug.warn(
          `${this.name} ${key} exceeded threshold: ${duration.toFixed(2)}ms`,
        );
      }

      return duration;
    }
    return 0;
  }

  getMeasurement(key) {
    return this.measurements.get(key) || 0;
  }

  // Legacy static methods for backward compatibility
  static startMonitoring(componentId) {
    if (!this.isMonitoring) return;

    this.metrics.set(componentId, {
      renderStart: performance.now(),
      memoryStart: this.getMemoryUsage(),
    });
  }

  static endMonitoring(componentId) {
    if (!this.isMonitoring || !this.metrics.has(componentId)) return;

    const metrics = this.metrics.get(componentId);
    const renderTime = performance.now() - metrics.renderStart;
    const memoryUsage = this.getMemoryUsage();

    if (renderTime > PERFORMANCE_THRESHOLDS.RENDER_WARNING_MS) {
      ComponentDebug.warn(
        `Component ${componentId} render time exceeded threshold: ${renderTime}ms`,
      );
    }

    if (
      memoryUsage >
      PERFORMANCE_THRESHOLDS.MEMORY_WARNING_MB *
        INPUT_UTILITY_CONSTANTS.BYTES_PER_KB *
        INPUT_UTILITY_CONSTANTS.BYTES_PER_KB
    ) {
      ComponentDebug.warn(
        `High memory usage detected: ${memoryUsage / INPUT_UTILITY_CONSTANTS.BYTES_PER_KB / INPUT_UTILITY_CONSTANTS.BYTES_PER_KB}MB`,
      );
    }

    this.metrics.delete(componentId);
  }

  static getMemoryUsage() {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  }

  static enable() {
    this.isMonitoring = true;
  }

  static disable() {
    this.isMonitoring = false;
    this.metrics.clear();
  }

  static cleanup() {
    this.metrics.clear();
    this.instances.clear();
    this.isMonitoring = false;
  }
}
