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
 * Main Grid Component - Enterprise Edition
 * Displays the main content grid with category and scenario views
 * Handles view toggling, search, filtering, and modal management
 * Part of the SimulateAI Ethics Platform - Main Interface
 *
 * Enterprise Features:
 * - Performance monitoring and optimization
 * - Circuit breaker pattern for error resilience
 * - Comprehensive telemetry and analytics
 * - Memory leak prevention and cleanup
 * - Enterprise-grade error handling and recovery
 * - Real-time health monitoring
 */

import {
  getAllCategories,
  getCategoryProgress,
  getCategoryScenarios,
} from "../../data/categories.js";
import { CategoryMetadataManager } from "../utils/category-metadata-manager.js";
import logger from "../utils/logger.js";
import PreLaunchModal from "./pre-launch-modal.js";
import ScenarioModal from "./scenario-modal.js";
import ScenarioCard from "./scenario-card.js";
import CategoryHeader from "./category-header.js";
import badgeManager from "../core/badge-manager.js";
import badgeModal from "./badge-modal.js";
import { getSystemCollector } from "../services/system-metadata-collector.js";

// Enterprise Constants
const HIGHLIGHT_DURATION = 2000;
const BADGE_DELAY_MS = 2000; // Delay between multiple badge reveals
const MOBILE_HEADER_SHOW_DURATION = 3000; // Duration to show header on mobile touch
const MOBILE_HEADER_FADE_DELAY = 2000; // Delay before hiding header after touch end
const PROGRESS_RING_RADIUS = 15.915; // SVG progress ring radius

// Autocomplete constants
const AUTOCOMPLETE_DEBOUNCE_MS = 150;
const MAX_AUTOCOMPLETE_SCENARIOS = 5;
const MAX_AUTOCOMPLETE_TAGS = 8;

// Enterprise monitoring constants
const ENTERPRISE_CONSTANTS = {
  PERFORMANCE_WARNING_THRESHOLD: 2000, // 2 seconds
  MEMORY_WARNING_THRESHOLD: 50 * 1024 * 1024, // 50MB
  ERROR_RECOVERY_COOLDOWN: 5000, // 5 seconds
  CIRCUIT_BREAKER_THRESHOLD: 5,
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  MAX_RETRY_ATTEMPTS: 3,
  TELEMETRY_BATCH_SIZE: 10,
  COMPONENT_TIMEOUT: 10000, // 10 seconds
};

class MainGrid {
  constructor() {
    // Enterprise monitoring setup
    this.instanceId = `maingrid_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    this.version = "v2.1.0-enterprise";
    this.initTime = performance.now();

    // Core component state
    this.container = null;
    this.categoryContainer = null;
    this.scenarioContainer = null;
    this.viewToggleButtons = null;
    this.currentView = "category"; // 'category' or 'scenario'
    this.categories = getAllCategories();
    this.userProgress = this.loadUserProgress();
    this.lastModalOpenTime = 0; // Debounce tracking
    this.modalOpenCooldown = 500; // Minimum time between modal opens (ms)
    this.isModalOpen = false; // Track if modal is currently open
    this.scenarioModal = null; // Reusable modal instance
    this.modalClosedHandler = null; // Store bound event handler
    this.scenarioCompletedHandler = null; // Store bound event handler

    // Enterprise health and performance monitoring
    this.healthStatus = {
      overall: "healthy",
      components: new Map(),
      lastCheck: null,
      issues: [],
      initializationComplete: false,
    };
    this.performanceMetrics = {
      initTime: 0,
      renderTime: 0,
      searchPerformance: [],
      filterPerformance: [],
      modalOpenTime: [],
      memoryUsage: 0,
      errorCount: 0,
      operationCounts: {
        renders: 0,
        searches: 0,
        filters: 0,
        modals: 0,
        views: 0,
      },
      lastPerformanceCheck: null,
    };
    this.circuitBreakers = new Map();
    this.retryCounters = new Map();
    this.errorRecoveryStrategies = new Map();
    this.telemetryBatch = [];

    // Enterprise configuration
    this.enterpriseConfig = {
      monitoringEnabled: true,
      telemetryEnabled: true,
      errorReportingEnabled: true,
      performanceTrackingEnabled: true,
      circuitBreakerEnabled: true,
      autoRecoveryEnabled: true,
      debugMode: false,
    };

    // Search, filter, and sort state
    this.searchQuery = "";
    this.selectedCategory = null;
    this.selectedDifficulty = null;
    this.selectedCompleted = null;
    this.sortBy = "alphabetical"; // 'alphabetical', 'category', 'difficulty', 'newest'
    this.filteredScenarios = [];
    this.allScenarios = [];
    this.completedScenarios = new Set();

    // Initialize completed scenarios set from user progress
    Object.values(this.userProgress).forEach((categoryProgress) => {
      Object.entries(categoryProgress).forEach(([scenarioId, completed]) => {
        if (completed) {
          this.completedScenarios.add(scenarioId);
        }
      });
    });

    // Autocomplete state
    this.autocompleteScenarios = [];
    this.autocompleteTags = new Set();
    this.autocompleteTagsArray = [];
    this.autocompleteIndex = -1;

    // Document event listener references for cleanup
    this.boundDocumentListeners = {
      globalClick: null,
      globalKeydown: null,
      autocompleteClick: null,
      filterClick: null,
      sortClick: null,
    };

    // Container event listener bound methods for proper cleanup
    this.boundHandleScenarioClick = null;
    this.boundHandleScenarioKeydown = null;

    // Initialize category header component
    this.categoryHeader = new CategoryHeader();

    // Initialize system metadata collector for analytics
    this.systemCollector = getSystemCollector();

    // Enterprise monitoring intervals
    this.healthCheckInterval = null;
    this.performanceMonitoringInterval = null;
    this.telemetryFlushInterval = null;

    // Initialize enterprise monitoring
    this._initializeEnterpriseMonitoring();

    // Initialize with performance tracking
    this._trackOperation("initialization", async () => {
      await this.init();
    });
  }

  /**
   * Initialize enterprise-grade monitoring and health systems
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Set up error recovery strategies
      this._setupErrorRecoveryStrategies();

      // Initialize circuit breakers for critical components
      this._initializeCircuitBreakers();

      // Set up performance baseline
      this._establishPerformanceBaseline();

      // Start health monitoring
      this._startHealthMonitoring();

      logger.info(
        `[MainGrid] Enterprise monitoring initialized for instance ${this.instanceId}`,
      );
    } catch (error) {
      logger.error(
        "[MainGrid] Failed to initialize enterprise monitoring:",
        error,
      );
      // Continue initialization even if monitoring fails
    }
  }

  /**
   * Set up error recovery strategies for different types of failures
   */
  _setupErrorRecoveryStrategies() {
    this.errorRecoveryStrategies.set("render_failure", {
      strategy: "retry_with_fallback",
      maxRetries: 3,
      fallbackAction: "basic_render",
      cooldownMs: 2000,
    });

    this.errorRecoveryStrategies.set("search_failure", {
      strategy: "disable_and_recover",
      maxRetries: 2,
      fallbackAction: "clear_search_state",
      cooldownMs: 1000,
    });

    this.errorRecoveryStrategies.set("modal_failure", {
      strategy: "reset_modal_state",
      maxRetries: 1,
      fallbackAction: "force_modal_cleanup",
      cooldownMs: 500,
    });

    this.errorRecoveryStrategies.set("data_load_failure", {
      strategy: "retry_with_cache",
      maxRetries: 3,
      fallbackAction: "use_fallback_data",
      cooldownMs: 3000,
    });
  }

  /**
   * Initialize circuit breakers for critical system components
   */
  _initializeCircuitBreakers() {
    const criticalComponents = [
      "category_rendering",
      "scenario_rendering",
      "search_system",
      "filter_system",
      "modal_system",
      "progress_tracking",
      "event_handling",
    ];

    criticalComponents.forEach((component) => {
      this.circuitBreakers.set(component, {
        state: "closed", // closed, open, half-open
        failureCount: 0,
        threshold: ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER_THRESHOLD,
        timeout: 60000, // 1 minute
        lastFailureTime: null,
        successCount: 0,
      });
    });
  }

  /**
   * Establish performance baseline metrics
   */
  _establishPerformanceBaseline() {
    this.performanceMetrics = {
      initTime: performance.now(),
      renderTime: 0,
      searchPerformance: [],
      filterPerformance: [],
      modalOpenTime: [],
      memoryUsage: this._getCurrentMemoryUsage(),
      errorCount: 0,
      operationCounts: {
        renders: 0,
        searches: 0,
        filters: 0,
        modals: 0,
        views: 0,
      },
      lastPerformanceCheck: Date.now(),
      componentMetrics: {
        categoryRenderTime: [],
        scenarioRenderTime: [],
        searchResponseTime: [],
        filterResponseTime: [],
        modalOpenTime: [],
      },
    };
  }

  /**
   * Start health monitoring intervals
   */
  _startHealthMonitoring() {
    if (!this.enterpriseConfig.monitoringEnabled) return;

    // Health check interval
    this.healthCheckInterval = setInterval(() => {
      this._performHealthCheck();
    }, ENTERPRISE_CONSTANTS.HEALTH_CHECK_INTERVAL);

    // Performance monitoring interval
    this.performanceMonitoringInterval = setInterval(() => {
      this._performPerformanceCheck();
    }, 60000); // Every minute

    // Telemetry flush interval
    this.telemetryFlushInterval = setInterval(() => {
      this._flushTelemetry();
    }, 30000); // Every 30 seconds
  }

  /**
   * Perform comprehensive health check
   */
  _performHealthCheck() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      instanceId: this.instanceId,
      overall: "healthy",
      components: {},
      memory: this._getCurrentMemoryUsage(),
      errors: this.performanceMetrics.errorCount,
      warnings: [],
    };

    // Check memory usage
    const memoryUsage = this._getCurrentMemoryUsage();
    if (memoryUsage > ENTERPRISE_CONSTANTS.MEMORY_WARNING_THRESHOLD) {
      healthCheck.warnings.push(
        `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      );
      healthCheck.overall = "warning";
    }

    // Check error rate
    if (this.performanceMetrics.errorCount > 10) {
      healthCheck.warnings.push(
        `High error count: ${this.performanceMetrics.errorCount}`,
      );
      healthCheck.overall = "warning";
    }

    // Check circuit breaker states
    let hasOpenCircuits = false;
    this.circuitBreakers.forEach((breaker, component) => {
      healthCheck.components[component] = breaker.state;
      if (breaker.state === "open") {
        hasOpenCircuits = true;
        healthCheck.warnings.push(`Circuit breaker open for ${component}`);
      }
    });

    if (hasOpenCircuits) {
      healthCheck.overall = "degraded";
    }

    // Check render performance
    const avgRenderTime =
      this.performanceMetrics.componentMetrics.categoryRenderTime
        .slice(-5)
        .reduce((sum, time) => sum + time, 0) / 5;
    if (avgRenderTime > ENTERPRISE_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
      healthCheck.warnings.push(
        `Slow render performance: ${avgRenderTime.toFixed(2)}ms average`,
      );
      healthCheck.overall =
        healthCheck.overall === "healthy" ? "warning" : healthCheck.overall;
    }

    // Store health status - preserve original components Map
    this.healthStatus = {
      ...healthCheck,
      components: this.healthStatus.components || new Map(), // Preserve the original Map
      lastCheck: Date.now(),
      issues: healthCheck.warnings,
    };

    // Send to enterprise monitoring
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("maingrid_health_check", healthCheck);
    }

    // Log health status
    if (healthCheck.warnings.length > 0) {
      logger.warn(`[MainGrid] Health check warnings:`, healthCheck.warnings);
    }
  }

  /**
   * Perform performance monitoring check
   */
  _performPerformanceCheck() {
    const performanceData = {
      timestamp: new Date().toISOString(),
      instanceId: this.instanceId,
      memory: this._getCurrentMemoryUsage(),
      operationCounts: { ...this.performanceMetrics.operationCounts },
      averageMetrics: this._calculateAverageMetrics(),
    };

    // Update performance metrics
    this.performanceMetrics.lastPerformanceCheck = Date.now();
    this.performanceMetrics.memoryUsage = performanceData.memory;

    // Check for performance issues
    const issues = [];
    const avgRenderTime = performanceData.averageMetrics.renderTime;
    if (avgRenderTime > ENTERPRISE_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
      issues.push(`Slow render time: ${avgRenderTime.toFixed(2)}ms`);
    }

    if (
      performanceData.memory > ENTERPRISE_CONSTANTS.MEMORY_WARNING_THRESHOLD
    ) {
      issues.push(
        `High memory usage: ${(performanceData.memory / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Send to enterprise monitoring
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("maingrid_performance_metrics", {
        ...performanceData,
        issues,
      });
    }

    if (issues.length > 0) {
      logger.warn(`[MainGrid] Performance issues detected:`, issues);
    }
  }

  /**
   * Calculate average metrics from recent data
   */
  _calculateAverageMetrics() {
    const recentCount = 10; // Use last 10 measurements

    return {
      renderTime: this._average(
        this.performanceMetrics.componentMetrics.categoryRenderTime.slice(
          -recentCount,
        ),
      ),
      searchTime: this._average(
        this.performanceMetrics.componentMetrics.searchResponseTime.slice(
          -recentCount,
        ),
      ),
      filterTime: this._average(
        this.performanceMetrics.componentMetrics.filterResponseTime.slice(
          -recentCount,
        ),
      ),
      modalTime: this._average(
        this.performanceMetrics.componentMetrics.modalOpenTime.slice(
          -recentCount,
        ),
      ),
    };
  }

  /**
   * Calculate average of an array of numbers
   */
  _average(arr) {
    if (arr.length === 0) return 0;
    return arr.reduce((sum, val) => sum + val, 0) / arr.length;
  }

  /**
   * Get current memory usage if available
   */
  _getCurrentMemoryUsage() {
    if ("memory" in performance) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Track performance of operations
   */
  async _trackOperation(operationType, operation) {
    const startTime = performance.now();

    try {
      const result = await operation();
      const duration = performance.now() - startTime;

      // Update metrics
      this.performanceMetrics.operationCounts[operationType] =
        (this.performanceMetrics.operationCounts[operationType] || 0) + 1;

      // Store timing data
      const metricKey = `${operationType}ResponseTime`;
      if (this.performanceMetrics.componentMetrics[metricKey]) {
        this.performanceMetrics.componentMetrics[metricKey].push(duration);
        // Keep only recent measurements
        if (this.performanceMetrics.componentMetrics[metricKey].length > 50) {
          this.performanceMetrics.componentMetrics[metricKey] =
            this.performanceMetrics.componentMetrics[metricKey].slice(-25);
        }
      }

      // Update circuit breaker success
      this._updateCircuitBreakerSuccess(operationType);

      // Log slow operations
      if (duration > ENTERPRISE_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
        logger.warn(
          `[MainGrid] Slow ${operationType} operation: ${duration.toFixed(2)}ms`,
        );
      }

      return result;
    } catch (error) {
      const duration = performance.now() - startTime;
      this.performanceMetrics.errorCount++;

      // Update circuit breaker failure
      this._updateCircuitBreakerFailure(operationType);

      // Handle enterprise error
      this._handleEnterpriseError(error, operationType);

      throw error;
    }
  }

  /**
   * Update circuit breaker on success
   */
  _updateCircuitBreakerSuccess(component) {
    const breaker = this.circuitBreakers.get(component);
    if (breaker) {
      breaker.successCount++;
      if (breaker.state === "half-open" && breaker.successCount >= 3) {
        breaker.state = "closed";
        breaker.failureCount = 0;
        logger.info(`[MainGrid] Circuit breaker closed for ${component}`);
      }
    }
  }

  /**
   * Update circuit breaker on failure
   */
  _updateCircuitBreakerFailure(component) {
    const breaker = this.circuitBreakers.get(component);
    if (breaker) {
      breaker.failureCount++;
      breaker.lastFailureTime = Date.now();
      if (breaker.failureCount >= breaker.threshold) {
        breaker.state = "open";
        logger.warn(`[MainGrid] Circuit breaker opened for ${component}`);
      }
    }
  }

  /**
   * Handle enterprise-grade errors with recovery
   */
  _handleEnterpriseError(error, context = "unknown") {
    logger.error(`[MainGrid] Enterprise error in ${context}:`, error);

    // Add to telemetry
    this.telemetryBatch.push({
      type: "error",
      timestamp: new Date().toISOString(),
      instanceId: this.instanceId,
      context,
      message: error.message,
      stack: error.stack,
      memoryUsage: this._getCurrentMemoryUsage(),
    });

    // Attempt recovery if strategy exists
    const strategy = this.errorRecoveryStrategies.get(context);
    if (strategy && this.enterpriseConfig.autoRecoveryEnabled) {
      this._attemptRecovery(context, strategy, error);
    }

    // Send to enterprise error tracking
    if (window.enterpriseErrorTracking) {
      window.enterpriseErrorTracking.reportError({
        component: "MainGrid",
        context,
        error: {
          message: error.message,
          stack: error.stack,
        },
        instanceId: this.instanceId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Attempt automated recovery
   */
  _attemptRecovery(context, strategy, originalError) {
    const retryKey = context;
    const currentRetries = this.retryCounters.get(retryKey) || 0;

    if (currentRetries >= strategy.maxRetries) {
      logger.warn(
        `[MainGrid] Max retries exceeded for ${context}, executing fallback`,
      );
      this._executeFallbackAction(strategy.fallbackAction, context);
      return;
    }

    this.retryCounters.set(retryKey, currentRetries + 1);

    logger.info(
      `[MainGrid] Attempting recovery for ${context} (attempt ${currentRetries + 1}/${strategy.maxRetries})`,
    );

    setTimeout(() => {
      try {
        switch (strategy.strategy) {
          case "retry_with_fallback":
            this._retryOperation(context);
            break;
          case "disable_and_recover":
            this._disableAndRecover(context);
            break;
          case "reset_modal_state":
            this._resetModalState();
            break;
          case "retry_with_cache":
            this._retryWithCache(context);
            break;
          default:
            logger.warn(
              `[MainGrid] Unknown recovery strategy: ${strategy.strategy}`,
            );
        }
      } catch (recoveryError) {
        logger.error(
          `[MainGrid] Recovery attempt failed for ${context}:`,
          recoveryError,
        );
        this._executeFallbackAction(strategy.fallbackAction, context);
      }
    }, strategy.cooldownMs);
  }

  /**
   * Execute fallback actions
   */
  _executeFallbackAction(action, context) {
    logger.info(
      `[MainGrid] Executing fallback action: ${action} for ${context}`,
    );

    switch (action) {
      case "basic_render":
        this._performBasicRender();
        break;
      case "clear_search_state":
        this._clearSearchState();
        break;
      case "force_modal_cleanup":
        this._forceModalCleanup();
        break;
      case "use_fallback_data":
        this._useFallbackData();
        break;
      default:
        logger.warn(`[MainGrid] Unknown fallback action: ${action}`);
    }
  }

  /**
   * Retry operation with circuit breaker check
   */
  _retryOperation(context) {
    const breaker = this.circuitBreakers.get(context);
    if (breaker && breaker.state === "open") {
      logger.warn(
        `[MainGrid] Cannot retry ${context} - circuit breaker is open`,
      );
      return;
    }

    // Implementation depends on context
    logger.info(`[MainGrid] Retrying operation: ${context}`);
  }

  /**
   * Disable feature and attempt recovery
   */
  _disableAndRecover(context) {
    if (context === "search_failure") {
      this._clearSearchState();
      // Disable search temporarily
      const searchInput =
        this.scenarioContainer?.querySelector(".search-input");
      if (searchInput) {
        searchInput.disabled = true;
        searchInput.placeholder = "Search temporarily disabled - recovering...";
        setTimeout(() => {
          searchInput.disabled = false;
          searchInput.placeholder = "Search scenarios, titles, and tags...";
        }, 10000); // Re-enable after 10 seconds
      }
    }
  }

  /**
   * Reset modal state for recovery
   */
  _resetModalState() {
    this.isModalOpen = false;
    this.lastModalOpenTime = 0;
    this._forceModalCleanup();
  }

  /**
   * Retry with cached data
   */
  _retryWithCache(context) {
    if (context === "data_load_failure") {
      // Use cached categories if available
      try {
        const cachedCategories = JSON.parse(
          localStorage.getItem("cached_categories") || "[]",
        );
        if (cachedCategories.length > 0) {
          this.categories = cachedCategories;
          this.render();
          logger.info("[MainGrid] Successfully recovered using cached data");
        }
      } catch (error) {
        logger.error("[MainGrid] Failed to load cached data:", error);
        this._useFallbackData();
      }
    }
  }

  /**
   * Perform basic render without advanced features
   */
  _performBasicRender() {
    try {
      logger.info("[MainGrid] Performing basic fallback render");
      if (this.container) {
        this.container.innerHTML = `
          <div class="basic-fallback">
            <h2>Content Loading</h2>
            <p>The application is in recovery mode. Please refresh the page.</p>
            <button onclick="location.reload()" class="btn btn-primary">Refresh Page</button>
          </div>
        `;
      }
    } catch (error) {
      logger.error("[MainGrid] Even basic render failed:", error);
    }
  }

  /**
   * Clear search state for recovery
   */
  _clearSearchState() {
    this.searchQuery = "";
    this.filteredScenarios = [...this.allScenarios];

    const searchInput = this.scenarioContainer?.querySelector(".search-input");
    if (searchInput) {
      searchInput.value = "";
    }

    const clearBtn = this.scenarioContainer?.querySelector(".search-clear");
    if (clearBtn) {
      clearBtn.style.display = "none";
    }
  }

  /**
   * Force modal cleanup
   */
  _forceModalCleanup() {
    // Remove any modal elements
    document.querySelectorAll(".modal-backdrop, .modal").forEach((modal) => {
      modal.remove();
    });

    // Reset body styles
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");

    // Remove inert attributes
    document.querySelectorAll("[inert]").forEach((el) => {
      el.removeAttribute("inert");
    });

    // Reset modal state
    this.scenarioModal = null;
    this.isModalOpen = false;
  }

  /**
   * Use fallback data when primary data fails
   */
  _useFallbackData() {
    this.categories = [
      {
        id: "fallback",
        title: "Basic Content",
        description: "Fallback content while system recovers",
        scenarios: [],
        tags: ["fallback"],
        difficulty: "beginner",
      },
    ];

    try {
      this.render();
      logger.info("[MainGrid] Successfully rendered with fallback data");
    } catch (error) {
      logger.error(
        "[MainGrid] Failed to render even with fallback data:",
        error,
      );
      this._performBasicRender();
    }
  }

  /**
   * Flush telemetry data
   */
  _flushTelemetry() {
    if (this.telemetryBatch.length === 0) return;

    // Send to enterprise monitoring
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("maingrid_telemetry", {
        instanceId: this.instanceId,
        batch: this.telemetryBatch,
        timestamp: new Date().toISOString(),
      });
    }

    // Store locally as backup
    try {
      const existing = JSON.parse(
        localStorage.getItem("maingrid_telemetry") || "[]",
      );
      const combined = [...existing, ...this.telemetryBatch].slice(-100); // Keep last 100
      localStorage.setItem("maingrid_telemetry", JSON.stringify(combined));
    } catch (e) {
      // Storage error - continue without local backup
    }

    this.telemetryBatch = [];
  }

  /**
   * Stop enterprise monitoring
   */
  _stopEnterpriseMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.performanceMonitoringInterval) {
      clearInterval(this.performanceMonitoringInterval);
      this.performanceMonitoringInterval = null;
    }

    if (this.telemetryFlushInterval) {
      clearInterval(this.telemetryFlushInterval);
      this.telemetryFlushInterval = null;
    }
  }

  // Enterprise cleanup method to remove all document event listeners and monitoring
  cleanup() {
    logger.info(
      `[MainGrid] Starting enterprise cleanup for instance ${this.instanceId}`,
    );

    try {
      // Stop enterprise monitoring
      this._stopEnterpriseMonitoring();

      // Flush remaining telemetry
      this._flushTelemetry();

      // Remove all document event listeners
      Object.keys(this.boundDocumentListeners).forEach((key) => {
        const listener = this.boundDocumentListeners[key];
        if (listener) {
          document.removeEventListener("click", listener);
          document.removeEventListener("keydown", listener);
        }
      });

      // Reset listener references
      this.boundDocumentListeners = {
        globalClick: null,
        globalKeydown: null,
        autocompleteClick: null,
        filterClick: null,
        sortClick: null,
      };

      // Clean up container event listeners
      this.removeEventListeners();
      this.boundHandleScenarioClick = null;
      this.boundHandleScenarioKeydown = null;

      // Force modal cleanup
      this._forceModalCleanup();

      // Clear component state
      this.healthStatus.overall = "shutdown";
      if (
        this.healthStatus.components &&
        typeof this.healthStatus.components.clear === "function"
      ) {
        this.healthStatus.components.clear();
      }

      // Send final telemetry
      if (window.enterpriseMonitoring) {
        window.enterpriseMonitoring.send("maingrid_shutdown", {
          instanceId: this.instanceId,
          finalMetrics: this.performanceMetrics,
          timestamp: new Date().toISOString(),
        });
      }

      logger.info(
        `[MainGrid] Enterprise cleanup completed for instance ${this.instanceId}`,
      );
    } catch (error) {
      logger.error("[MainGrid] Error during cleanup:", error);
    }
  }

  async init() {
    this.container = document.querySelector(".categories-section");
    if (!this.container) {
      logger.error("Categories section not found");
      return;
    }

    // Find view containers
    this.categoryContainer = this.container.querySelector(
      '.categories-grid[data-view="category"]',
    );
    this.scenarioContainer = this.container.querySelector(
      '.scenarios-grid[data-view="scenario"]',
    );

    if (!this.categoryContainer || !this.scenarioContainer) {
      logger.error("View containers not found");
      return;
    }

    // Load CategoryHeader configuration before rendering
    await CategoryHeader.loadConfiguration();

    // Load ScenarioCard configuration before rendering
    await ScenarioCard.loadConfiguration();

    await this.render();
    this.setupViewToggle();
  }

  loadUserProgress() {
    // Load user progress from localStorage
    try {
      const stored = localStorage.getItem("simulateai_category_progress");
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load user progress:", error);
      return {};
    }
  }

  saveUserProgress() {
    try {
      localStorage.setItem(
        "simulateai_category_progress",
        JSON.stringify(this.userProgress),
      );
    } catch (error) {
      logger.error("Failed to save user progress:", error);
    }
  }

  getCategoryProgress(categoryId) {
    return getCategoryProgress(categoryId, this.userProgress);
  }

  async render() {
    return this._trackOperation("renders", async () => {
      try {
        const renderStartTime = performance.now();

        // Render category view with performance tracking
        await this._trackOperation("category_rendering", async () => {
          await this.renderCategoryView();
        });

        // Render scenario view with performance tracking
        await this._trackOperation("scenario_rendering", async () => {
          await this.renderScenarioView();
        });

        // Attach event listeners after rendering
        this.attachEventListeners();

        const renderTime = performance.now() - renderStartTime;
        this.performanceMetrics.renderTime = renderTime;
        this.performanceMetrics.componentMetrics.categoryRenderTime.push(
          renderTime,
        );

        // Update health status
        if (
          this.healthStatus.components &&
          typeof this.healthStatus.components.set === "function"
        ) {
          this.healthStatus.components.set("render_system", {
            status: "healthy",
            lastUpdate: Date.now(),
            renderTime,
          });
        }

        // Log performance
        if (renderTime > ENTERPRISE_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
          logger.warn(
            `[MainGrid] Slow render operation: ${renderTime.toFixed(2)}ms`,
          );
        }

        // Add to telemetry
        this.telemetryBatch.push({
          type: "render",
          timestamp: new Date().toISOString(),
          instanceId: this.instanceId,
          renderTime,
          view: this.currentView,
          categoriesCount: this.categories.length,
          scenariosCount: this.allScenarios.length,
        });

        logger.debug(
          `[MainGrid] Render completed in ${renderTime.toFixed(2)}ms`,
        );
      } catch (error) {
        this._handleEnterpriseError(error, "render_failure");
        throw error;
      }
    });
  }

  async renderCategoryView() {
    this.categoryContainer.innerHTML = "";

    // Create the complete category-based layout
    for (const category of this.categories) {
      const categorySection = await this.createCategorySection(category);
      this.categoryContainer.appendChild(categorySection);
    }
  }

  async renderScenarioView() {
    // Clear existing content but preserve structure
    const existingCards = this.scenarioContainer.querySelectorAll(
      ".scenario-card-wrapper, .scenario-count, .no-scenarios",
    );
    existingCards.forEach((card) => card.remove());

    // Remove existing toolbar to force recreation with latest options
    const existingToolbar = this.scenarioContainer.querySelector(
      ".scenario-controls-toolbar",
    );
    if (existingToolbar) {
      existingToolbar.remove();
    }

    // Create search controls toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "scenario-controls-toolbar";
    toolbar.innerHTML = `
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
            </svg>
            <input type="search" class="search-input" placeholder="Search scenarios, titles, and tags..." aria-label="Search scenarios by title, description, or tags" autocomplete="off" spellcheck="false" aria-expanded="false" aria-haspopup="listbox" role="combobox">
            <button type="button" class="search-clear" aria-label="Clear search" style="display: none">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>
          <div class="search-autocomplete-dropdown" role="listbox" aria-label="Search suggestions" style="display: none;">
            <div class="autocomplete-section">
              <div class="autocomplete-section-header">Scenarios</div>
              <div class="autocomplete-scenarios"></div>
            </div>
            <div class="autocomplete-section">
              <div class="autocomplete-section-header">Tags</div>
              <div class="autocomplete-tags"></div>
            </div>
            <div class="autocomplete-no-results" style="display: none;">
              <div class="no-results-text">No matches found</div>
            </div>
          </div>
        </div>
        <div class="controls-group">
          <div class="filter-container">
            <button class="filter-btn" aria-expanded="false">
              <svg class="filter-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M2.628 1.601C5.028 1.206 7.49 1 10 1s4.973.206 7.372.601a.75.75 0 01.628.74v2.288a2.25 2.25 0 01-.659 1.59l-4.682 4.683a2.25 2.25 0 00-.659 1.59v3.037c0 .684-.31 1.33-.844 1.757l-1.937 1.55A.75.75 0 018 18.25v-5.757a2.25 2.25 0 00-.659-1.591L2.659 6.22A2.25 2.25 0 012 4.629V2.34a.75.75 0 01.628-.74z" clip-rule="evenodd"/>
              </svg>
              <span class="filter-text">All Categories</span>
              <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
              </svg>
            </button>
            <div class="filter-dropdown" style="display: none;">
              <button type="button" class="filter-option active" data-category="all" role="option" aria-selected="true">
                <span class="option-text">All Categories</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <!-- Category options will be populated by JavaScript -->
            </div>
          </div>
          <div class="sort-container">
            <button class="sort-btn" aria-expanded="false">
              <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd"/>
              </svg>
              <span class="sort-text">Alphabetical</span>
              <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
              </svg>
            </button>
            <div class="sort-dropdown" style="display: none;">
              <button type="button" class="sort-option active" data-sort="alphabetical" role="option" aria-selected="true">
                <span class="option-text">Alphabetical</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="category" role="option" aria-selected="false">
                <span class="option-text">By Category</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="difficulty" role="option" aria-selected="false">
                <span class="option-text">By Difficulty</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="newest" role="option" aria-selected="false">
                <span class="option-text">Newest First</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="explored" role="option" aria-selected="false">
                <span class="option-text">Explored</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="unexplored" role="option" aria-selected="false">
                <span class="option-text">Unexplored</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="clear-all-container">
            <button class="clear-all-btn" aria-label="Clear all filters and sorting">
              <svg class="clear-all-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z" clip-rule="evenodd"/>
              </svg>
              <span class="clear-all-text">Clear All</span>
            </button>
          </div>
        </div>
      `;
    this.scenarioContainer.insertBefore(
      toolbar,
      this.scenarioContainer.firstChild,
    );

    try {
      // Get all scenarios from all categories with enhanced metadata
      const allScenarios = CategoryMetadataManager.getAllScenariosEnhanced();

      if (allScenarios.length === 0) {
        const noScenariosDiv = document.createElement("div");
        noScenariosDiv.className = "no-scenarios";
        noScenariosDiv.innerHTML = `
          <h3>No scenarios available</h3>
          <p>Unable to load scenarios. Please try refreshing the page.</p>
        `;
        this.scenarioContainer.appendChild(noScenariosDiv);
        return;
      }

      // Add scenario count display
      const countElement = document.createElement("div");
      countElement.className = "scenario-count";
      countElement.innerHTML = `
        <p class="count-text">Showing <span class="count-number">${allScenarios.length}</span> scenarios across all categories</p>
      `;
      this.scenarioContainer.appendChild(countElement);

      // Create individual scenario cards with hover category headers
      for (const scenario of allScenarios) {
        const category = {
          id: scenario.categoryId,
          color: scenario.category?.color || "#667eea",
          icon: scenario.category?.icon || "🤖",
          title: scenario.category?.title || "Unknown Category",
        };

        const isCompleted =
          this.userProgress[scenario.categoryId]?.[scenario.id] || false;
        const scenarioCardHtml = await ScenarioCard.render(
          scenario,
          category,
          isCompleted,
        );

        // Create wrapper with category header for hover effect
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "scenario-card-wrapper";
        cardWrapper.innerHTML = scenarioCardHtml;

        // Add category header for hover effect
        const categoryProgress = this.getCategoryProgress(scenario.categoryId);
        const categoryHeaderHtml = await this.categoryHeader.render(
          scenario.category || category,
          categoryProgress,
        );

        const categoryHeaderElement = document.createElement("div");
        categoryHeaderElement.className = "scenario-hover-category-header";
        categoryHeaderElement.innerHTML = categoryHeaderHtml;

        cardWrapper.appendChild(categoryHeaderElement);
        this.scenarioContainer.appendChild(cardWrapper);
      }

      logger.info(
        "MainGrid",
        `Rendered ${allScenarios.length} scenarios in scenario view`,
      );

      // Initialize scenario controls after rendering
      setTimeout(() => {
        this.initializeScenarioControls();
      }, 0);
    } catch (error) {
      logger.error("Failed to render scenario view:", error);

      // Fallback: Use basic scenario data from categories
      await this.renderScenarioViewFallback();
    }
  }

  async renderScenarioViewFallback() {
    // Clear only the scenario cards, preserve the toolbar
    const existingCards = this.scenarioContainer.querySelectorAll(
      ".scenario-card-wrapper, .scenario-count, .no-scenarios",
    );
    existingCards.forEach((card) => card.remove());

    let totalScenarios = 0;

    // Fallback approach using basic category data
    for (const category of this.categories) {
      const scenarios = getCategoryScenarios(category.id);
      totalScenarios += scenarios.length;

      for (const scenario of scenarios) {
        const isCompleted =
          this.userProgress[category.id]?.[scenario.id] || false;
        const scenarioCardHtml = await ScenarioCard.render(
          scenario,
          category,
          isCompleted,
        );

        // Create wrapper with category header for hover effect
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "scenario-card-wrapper";
        cardWrapper.innerHTML = scenarioCardHtml;

        // Add category header for hover effect
        const categoryProgress = this.getCategoryProgress(category.id);
        const categoryHeaderHtml = await this.categoryHeader.render(
          category,
          categoryProgress,
        );

        const categoryHeaderElement = document.createElement("div");
        categoryHeaderElement.className = "scenario-hover-category-header";
        categoryHeaderElement.innerHTML = categoryHeaderHtml;

        cardWrapper.appendChild(categoryHeaderElement);
        this.scenarioContainer.appendChild(cardWrapper);
      }
    }

    // Add count element at the beginning
    const countElement = document.createElement("div");
    countElement.className = "scenario-count";
    countElement.innerHTML = `
      <p class="count-text">Showing <span class="count-number">${totalScenarios}</span> scenarios across all categories</p>
    `;
    this.scenarioContainer.insertBefore(
      countElement,
      this.scenarioContainer.firstChild,
    );

    logger.info(
      "MainGrid",
      `Used fallback rendering for scenario view (${totalScenarios} scenarios)`,
    );
  }

  setupViewToggle() {
    this.viewToggleButtons =
      this.container.querySelectorAll(".view-toggle-btn");

    this.viewToggleButtons.forEach((button) => {
      button.addEventListener("click", () => {
        const newView = button.getAttribute("data-view");
        this.switchView(newView);
      });
    });

    // Add keyboard shortcut support (V key to toggle views)
    document.addEventListener("keydown", (event) => {
      // Only trigger if no input fields are focused and no modifiers are pressed
      if (
        event.key === "v" &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey &&
        !event.target.matches("input, textarea, [contenteditable]")
      ) {
        event.preventDefault();
        const newView =
          this.currentView === "category" ? "scenario" : "category";
        this.switchView(newView);

        // Announce to screen readers
        const announcement = `Switched to ${newView} view`;
        this.announceToScreenReader(announcement);
      }
    });
  }

  announceToScreenReader(message) {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  switchView(newView) {
    if (newView === this.currentView) return;

    // Update button states
    this.viewToggleButtons.forEach((button) => {
      const isActive = button.getAttribute("data-view") === newView;
      button.classList.toggle("active", isActive);
      button.setAttribute("aria-checked", isActive.toString());
    });

    // Update view containers
    const containers = this.container.querySelectorAll(".view-content");
    containers.forEach((container) => {
      const isActive = container.getAttribute("data-view") === newView;
      container.classList.toggle("active", isActive);
      container.style.display = isActive ? "" : "none";
    });

    this.currentView = newView;

    // Clean up existing document listeners before re-attaching
    this.cleanup();

    // Re-attach event listeners for the new view
    this.attachEventListeners();

    // Initialize scenario controls if switching to scenario view
    if (newView === "scenario") {
      setTimeout(() => {
        this.initializeScenarioControls();
      }, 0);
    }

    // Log analytics
    if (this.systemCollector) {
      this.systemCollector.trackInteraction({
        element: "view-toggle",
        action: "switch",
        metadata: {
          fromView: this.currentView === "category" ? "scenario" : "category",
          toView: newView,
          timestamp: new Date().toISOString(),
        },
      });
    }

    logger.info("MainGrid", `Switched to ${newView} view`);
  }

  async createCategorySection(category) {
    const section = document.createElement("section");
    section.className = "category-section";
    section.setAttribute("data-category-id", category.id);
    section.id = `category-${category.id}`;

    const progress = this.getCategoryProgress(category.id);
    const scenarios = getCategoryScenarios(category.id);

    // Use CategoryHeader component to render the header
    const categoryHeaderHtml = await this.categoryHeader.render(
      category,
      progress,
    );

    // Generate scenario cards asynchronously
    const scenarioCards = await Promise.all(
      scenarios.map((scenario) => this.createScenarioCard(scenario, category)),
    );

    section.innerHTML = `
            ${categoryHeaderHtml}

            <div class="scenarios-grid">
                ${scenarioCards.join("")}
            </div>
        `;

    return section;
  }

  async createScenarioCard(scenario, category) {
    const isCompleted = this.userProgress[category.id]?.[scenario.id] || false;

    return await ScenarioCard.render(scenario, category, isCompleted);
  }

  attachEventListeners() {
    // Debug log to track event listener attachment
    logger.debug("MainGrid attachEventListeners called", {
      currentView: this.currentView,
      timestamp: Date.now(),
    });

    // Remove existing listeners to prevent duplicates
    this.removeEventListeners();

    // Bind methods once to maintain consistent references
    if (!this.boundHandleScenarioClick) {
      this.boundHandleScenarioClick = this.handleScenarioClick.bind(this);
    }
    if (!this.boundHandleScenarioKeydown) {
      this.boundHandleScenarioKeydown = this.handleScenarioKeydown.bind(this);
    }

    // Add listeners to both view containers
    const activeContainer =
      this.currentView === "category"
        ? this.categoryContainer
        : this.scenarioContainer;

    activeContainer.addEventListener("click", this.boundHandleScenarioClick);
    activeContainer.addEventListener(
      "keydown",
      this.boundHandleScenarioKeydown,
    );

    // Add touch event listeners for mobile category header support (scenario view only)
    if (this.currentView === "scenario") {
      this.addTouchEventListeners(activeContainer);
    }

    // Remove existing global listeners if they exist
    if (this.boundDocumentListeners.globalClick) {
      document.removeEventListener(
        "click",
        this.boundDocumentListeners.globalClick,
      );
    }
    if (this.boundDocumentListeners.globalKeydown) {
      document.removeEventListener(
        "keydown",
        this.boundDocumentListeners.globalKeydown,
      );
    }

    // Add global click listener to close dropdowns in scenario view
    if (this.currentView === "scenario") {
      this.boundDocumentListeners.globalClick =
        this.handleGlobalClick.bind(this);
      this.boundDocumentListeners.globalKeydown =
        this.handleGlobalKeydown.bind(this);
      document.addEventListener(
        "click",
        this.boundDocumentListeners.globalClick,
      );
      document.addEventListener(
        "keydown",
        this.boundDocumentListeners.globalKeydown,
      );
    }

    // Listen for scenario modal fully closed (for badge display) - only add once
    if (!this.modalClosedHandler) {
      this.modalClosedHandler = this.handleScenarioModalClosed.bind(this);
      document.addEventListener(
        "scenario-modal-closed",
        this.modalClosedHandler,
      );
    }

    // Attach CategoryHeader event listeners for progress ring tooltips
    if (this.currentView === "category") {
      this.categoryHeader.attachEventListeners(this.categoryContainer);
    } else if (this.currentView === "scenario") {
      this.categoryHeader.attachEventListeners(this.scenarioContainer);
    }

    // Listen for scenario completion tracking - only add once
    if (!this.scenarioCompletedHandler) {
      this.scenarioCompletedHandler = this.handleScenarioCompleted.bind(this);
      document.addEventListener(
        "scenario-completed",
        this.scenarioCompletedHandler,
      );
    }
  }

  removeEventListeners() {
    // Debug log to track event listener removal
    logger.debug("MainGrid removeEventListeners called", {
      currentView: this.currentView,
      timestamp: Date.now(),
    });

    // Remove listeners from both containers to prevent duplicates
    [this.categoryContainer, this.scenarioContainer].forEach((container) => {
      if (container && this.boundHandleScenarioClick) {
        container.removeEventListener("click", this.boundHandleScenarioClick);
      }
      if (container && this.boundHandleScenarioKeydown) {
        container.removeEventListener(
          "keydown",
          this.boundHandleScenarioKeydown,
        );
      }
    });

    // Remove global event listeners to prevent accumulation
    if (this.modalClosedHandler) {
      document.removeEventListener(
        "scenario-modal-closed",
        this.modalClosedHandler,
      );
      this.modalClosedHandler = null;
    }

    // Remove scenario completed event listener
    if (this.scenarioCompletedHandler) {
      document.removeEventListener(
        "scenario-completed",
        this.scenarioCompletedHandler,
      );
      this.scenarioCompletedHandler = null;
    }

    // Clean up scenario modal instance
    if (this.scenarioModal) {
      // If modal is open, close it
      if (this.scenarioModal.modal) {
        this.scenarioModal.close();
      }
      this.scenarioModal = null;
    }
  }

  addTouchEventListeners(container) {
    // Add touch event listeners for mobile category header functionality
    const isMobile = "ontouchstart" in window || navigator.maxTouchPoints > 0;

    if (isMobile) {
      let touchTimeout;

      container.addEventListener(
        "touchstart",
        (event) => {
          const scenarioWrapper = event.target.closest(
            ".scenario-card-wrapper",
          );
          if (!scenarioWrapper) return;

          const categoryHeader = scenarioWrapper.querySelector(
            ".scenario-hover-category-header",
          );
          if (!categoryHeader) return;

          // Clear any existing timeout
          clearTimeout(touchTimeout);

          // Show the header immediately on touch
          categoryHeader.style.transform = "translateY(0)";
          categoryHeader.style.opacity = "1";
          categoryHeader.style.pointerEvents = "auto";

          // Hide after 3 seconds unless touched again
          touchTimeout = setTimeout(() => {
            categoryHeader.style.transform = "translateY(-100%)";
            categoryHeader.style.opacity = "0";
            categoryHeader.style.pointerEvents = "none";
          }, MOBILE_HEADER_SHOW_DURATION);
        },
        { passive: true },
      );

      // Also handle touch end to keep header visible for a moment
      container.addEventListener(
        "touchend",
        (event) => {
          const scenarioWrapper = event.target.closest(
            ".scenario-card-wrapper",
          );
          if (!scenarioWrapper) return;

          // Keep header visible for a bit longer after touch end
          clearTimeout(touchTimeout);
          touchTimeout = setTimeout(() => {
            const categoryHeader = scenarioWrapper.querySelector(
              ".scenario-hover-category-header",
            );
            if (categoryHeader) {
              categoryHeader.style.transform = "translateY(-100%)";
              categoryHeader.style.opacity = "0";
              categoryHeader.style.pointerEvents = "none";
            }
          }, MOBILE_HEADER_FADE_DELAY);
        },
        { passive: true },
      );
    }
  }

  handleScenarioClick(event) {
    const scenarioCard = event.target.closest(".scenario-card");
    if (!scenarioCard) return;

    // More robust button detection - check if click is inside any button
    const clickedButton = event.target.closest("button");

    if (!clickedButton) {
      return;
    }

    const isQuickStartBtn = clickedButton.classList.contains(
      "scenario-quick-start-btn",
    );
    const isLearningLabBtn =
      clickedButton.classList.contains("scenario-start-btn");

    // If the clicked button is not one of our scenario buttons, do nothing
    if (!isQuickStartBtn && !isLearningLabBtn) {
      return;
    }

    // Debug log to track event handling
    logger.debug("MainGrid handleScenarioClick", {
      buttonType: isQuickStartBtn ? "quick-start" : "learning-lab",
      scenarioId: scenarioCard.getAttribute("data-scenario-id"),
      categoryId: scenarioCard.getAttribute("data-category-id"),
      timestamp: Date.now(),
    });

    // Prevent default navigation behavior
    event.preventDefault();
    event.stopPropagation(); // Also stop propagation to prevent any duplicate handling

    const scenarioId = scenarioCard.getAttribute("data-scenario-id");
    const categoryId = scenarioCard.getAttribute("data-category-id");

    if (isQuickStartBtn) {
      // Quick start button - direct to scenario modal
      this.openScenarioModalDirect(categoryId, scenarioId);
    } else if (isLearningLabBtn) {
      // Learning Lab button - go through pre-launch modal
      this.openScenario(categoryId, scenarioId);
    }
  }

  handleScenarioKeydown(event) {
    if (event.key === "Enter" || event.key === " ") {
      const scenarioCard = event.target.closest(".scenario-card");
      if (!scenarioCard) return;

      // Only respond to keyboard events on specific buttons
      const isQuickStartBtn = event.target.classList.contains(
        "scenario-quick-start-btn",
      );
      const isLearningLabBtn =
        event.target.classList.contains("scenario-start-btn");

      // If focus is not on either button, do nothing
      if (!isQuickStartBtn && !isLearningLabBtn) {
        return;
      }

      event.preventDefault();

      const scenarioId = scenarioCard.getAttribute("data-scenario-id");
      const categoryId = scenarioCard.getAttribute("data-category-id");

      if (isQuickStartBtn) {
        // Quick start button - direct to scenario modal
        this.openScenarioModalDirect(categoryId, scenarioId);
      } else if (isLearningLabBtn) {
        // Learning Lab button - go through pre-launch modal
        this.openScenario(categoryId, scenarioId);
      }
    }
  }

  openScenario(categoryId, scenarioId) {
    const category = this.categories.find((c) => c.id === categoryId);
    const scenario = category?.scenarios.find((s) => s.id === scenarioId);

    if (!category || !scenario) {
      logger.error("Category or scenario not found:", categoryId, scenarioId);
      return;
    }

    logger.info("Opening premodal for category:", category);

    // Track scenario access via pre-launch modal
    this.systemCollector.trackScenarioPerformance({
      scenarioId,
      categoryId,
      action: "view",
      metadata: {
        source: "category-grid-prelaunch",
        modalType: "with-prelaunch",
        scenarioTitle: scenario.title,
        categoryTitle: category.title,
        accessMethod: "standard",
        timestamp: new Date().toISOString(),
      },
    });

    // Track user interaction with category content
    this.systemCollector.trackInteraction({
      element: "scenario-card",
      action: "click",
      metadata: {
        scenarioId,
        categoryId,
        component: "category-grid",
        interactionType: "scenario-selection",
      },
    });

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent("scenario-selected", {
      detail: { category, scenario, categoryId, scenarioId },
    });
    document.dispatchEvent(event);

    // Open the PreLaunchModal configured for this category
    this.openCategoryPremodal(category, scenario);
  }

  /**
   * Clean up any existing modal instances to prevent multiple modals
   */
  cleanupExistingModals() {
    // Close any existing pre-launch modals by backdrop
    const existingModalBackdrops = document.querySelectorAll(".modal-backdrop");
    existingModalBackdrops.forEach((backdrop) => {
      const modalDialog = backdrop.querySelector(".modal-dialog");
      if (modalDialog && modalDialog.querySelector(".pre-launch-modal")) {
        // Found a pre-launch modal, remove it immediately
        backdrop.remove();
      }
    });

    // Also clean up any orphaned modal elements
    const orphanedPreLaunchModals =
      document.querySelectorAll(".pre-launch-modal");
    orphanedPreLaunchModals.forEach((modal) => {
      const parentBackdrop = modal.closest(".modal-backdrop");
      if (parentBackdrop) {
        parentBackdrop.remove();
      } else {
        modal.remove();
      }
    });

    // Clean up body styles that might be left behind
    document.body.style.overflow = "";

    // Remove any modal-related classes from body
    document.body.classList.remove("modal-open");

    // Remove any lingering inert states from other elements
    document.querySelectorAll("[inert]").forEach((el) => {
      if (!el.classList.contains("modal-backdrop")) {
        el.removeAttribute("inert");
      }
    });
  }

  openCategoryPremodal(category, scenario) {
    try {
      // Clean up any existing modals first
      this.cleanupExistingModals();

      // Use the category ID as the "simulation ID" and pass category/scenario data
      const preModal = new PreLaunchModal(category.id, {
        categoryData: category,
        scenarioData: scenario,
        onLaunch: () => {
          logger.info("Starting scenario:", scenario.title);
          // Launch the scenario modal with both category and scenario IDs
          this.openScenarioModal(scenario.id, category.id);
        },
        onCancel: () => {
          logger.info("Category premodal cancelled");
        },
        showEducatorResources: true,
      });

      preModal.show();
    } catch (error) {
      logger.error("Failed to open category premodal:", error);
      // Fallback to simple alert
      alert(
        `Opening "${scenario.title}" from ${category.title} - Premodal setup needed for categories!`,
      );
    }
  }

  /**
   * Open scenario modal for a specific scenario
   */
  openScenarioModal(scenarioId, categoryId = null) {
    try {
      // Track scenario view for analytics
      this.systemCollector.trackScenarioPerformance({
        scenarioId,
        categoryId: categoryId || "unknown",
        action: "view",
        metadata: {
          source: "category-grid",
          modalType: "with-prelaunch",
          timestamp: new Date().toISOString(),
        },
      });

      // Track navigation from category to scenario
      this.systemCollector.trackNavigation({
        from: `category-${categoryId}`,
        to: `scenario-${scenarioId}`,
        action: "click",
        metadata: {
          component: "category-grid",
          modalFlow: "standard",
        },
      });

      const scenarioModal = this.getScenarioModal();
      scenarioModal.open(scenarioId, categoryId);

      // Listen for scenario completion
      document.addEventListener(
        "scenario-completed",
        this.handleScenarioCompleted.bind(this),
        { once: true },
      );
    } catch (error) {
      logger.error("Failed to open scenario modal:", error);
      // Fallback to alert
      alert(`Failed to open scenario modal for: ${scenarioId}`);
    }
  }

  /**
   * Open scenario modal directly, skipping pre-launch modal
   */
  openScenarioModalDirect(categoryId, scenarioId) {
    logger.debug("MainGrid: openScenarioModalDirect called", {
      categoryId,
      scenarioId,
    });

    // Enhanced debounce to prevent rapid successive calls
    const now = Date.now();
    const cooldown = this.modalOpenCooldown || 1000; // Increase default cooldown to 1 second

    if (now - this.lastModalOpenTime < cooldown) {
      logger.debug("Modal request debounced - too soon after last request");
      return;
    }

    // Check if a modal is already open
    if (
      this.isModalOpen ||
      document.querySelector('.modal-backdrop:not([aria-hidden="true"])')
    ) {
      logger.debug("Modal already open, ignoring request", {
        isModalOpenFlag: this.isModalOpen,
        hasVisibleModalBackdrop: !!document.querySelector(
          '.modal-backdrop:not([aria-hidden="true"])',
        ),
      });
      return;
    }

    this.lastModalOpenTime = now;
    this.isModalOpen = true;

    const category = this.categories.find((c) => c.id === categoryId);
    const scenario = category?.scenarios.find((s) => s.id === scenarioId);

    if (!category || !scenario) {
      logger.error("Category or scenario not found:", categoryId, scenarioId);
      return;
    }

    logger.info("MainGrid", "Opening scenario modal directly for:", {
      title: scenario.title,
    });

    // Track direct scenario access for analytics
    this.systemCollector.trackScenarioPerformance({
      scenarioId,
      categoryId,
      action: "view",
      metadata: {
        source: "category-grid-direct",
        modalType: "direct",
        scenarioTitle: scenario.title,
        categoryTitle: category.title,
        timestamp: new Date().toISOString(),
      },
    });

    // Track navigation pattern for direct access
    this.systemCollector.trackNavigation({
      from: `category-${categoryId}`,
      to: `scenario-${scenarioId}`,
      action: "direct-access",
      metadata: {
        component: "category-grid",
        modalFlow: "direct",
        bypassPrelaunch: true,
      },
    });

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent("scenario-selected", {
      detail: { category, scenario, categoryId, scenarioId },
    });
    document.dispatchEvent(event);

    // Open the scenario modal directly
    this.openScenarioModal(scenarioId, categoryId);
  }

  /**
   * Get or create a reusable scenario modal instance
   */
  getScenarioModal() {
    if (!this.scenarioModal) {
      this.scenarioModal = new ScenarioModal();
    }
    return this.scenarioModal;
  }

  /**
   * Handle scenario completion event (immediate progress tracking)
   */
  handleScenarioCompleted(event) {
    const { scenarioId, selectedOption, option } = event.detail;

    logger.info("Scenario completed:", {
      scenarioId,
      selectedOption,
      optionText: option.text,
    });

    // Find the category that contains this scenario
    const category = this.categories.find((cat) => {
      const scenarios = getCategoryScenarios(cat.id);
      return scenarios.some((scenario) => scenario.id === scenarioId);
    });

    if (category) {
      // Track scenario completion for system analytics
      this.systemCollector.trackScenarioPerformance({
        scenarioId,
        categoryId: category.id,
        action: "complete",
        metadata: {
          selectedOption,
          optionText: option.text,
          impact: option.impact,
          completionTime: event.detail.completionTime || null,
          source: "category-grid-completion",
          timestamp: new Date().toISOString(),
        },
      });

      // Update progress (without badge checking)
      this.updateProgress(category.id, scenarioId, true, false);

      // Track analytics if available
      if (window.AnalyticsManager) {
        window.AnalyticsManager.trackEvent("scenario_completed", {
          categoryId: category.id,
          scenarioId,
          selectedOption,
          optionText: option.text,
          impact: option.impact,
        });
      }
    }
  }

  /**
   * Handle scenario modal fully closed event (for badge display)
   */
  handleScenarioModalClosed(event) {
    const { categoryId, scenarioId, completed = true } = event.detail;

    logger.info("Scenario modal fully closed:", {
      categoryId,
      scenarioId,
      completed,
    });

    // CRITICAL FIX: Always reset modal state to allow new modals to open
    // This ensures subsequent Surprise Me clicks work regardless of how modal was closed
    this.isModalOpen = false;

    // Reset the last modal open time to allow immediate new opens after proper close
    this.lastModalOpenTime = 0;

    logger.debug("MainGrid: Modal state reset, subsequent modals can now open");

    // Only check for newly earned badges if scenario was actually completed
    if (completed && categoryId && scenarioId) {
      this.checkForNewBadges(categoryId, scenarioId);
    } else {
      logger.debug(
        "Scenario modal closed without completion - skipping badge check",
      );
    }
  }

  updateProgress(categoryId, scenarioId, completed = true, checkBadges = true) {
    if (!this.userProgress[categoryId]) {
      this.userProgress[categoryId] = {};
    }

    this.userProgress[categoryId][scenarioId] = completed;

    // Update completed scenarios set for sorting
    if (completed) {
      this.completedScenarios.add(scenarioId);
    } else {
      this.completedScenarios.delete(scenarioId);
    }

    this.saveUserProgress();

    // Check for newly earned badges only if explicitly requested
    if (completed && checkBadges) {
      this.checkForNewBadges(categoryId, scenarioId);
    }

    // Update scenario completion status in DOM without full re-render
    this.updateScenarioCompletionStatus(categoryId, scenarioId, completed);
  }

  /**
   * Update scenario completion status in DOM without full re-render
   * @param {string} categoryId - Category ID
   * @param {string} scenarioId - Scenario ID
   * @param {boolean} completed - Completion status
   */
  updateScenarioCompletionStatus(categoryId, scenarioId, completed) {
    try {
      // Update in both view containers
      [this.categoryContainer, this.scenarioContainer].forEach((container) => {
        if (!container) return;

        const scenarioCard = container.querySelector(
          `[data-category-id="${categoryId}"][data-scenario-id="${scenarioId}"]`,
        );

        if (scenarioCard) {
          // Update completion status class
          scenarioCard.classList.toggle("completed", completed);

          // Update completion indicator if it exists
          const completionIndicator = scenarioCard.querySelector(
            ".completion-indicator",
          );
          if (completionIndicator) {
            completionIndicator.style.display = completed ? "block" : "none";
          }

          // Update progress ring in category headers if in category view
          if (container === this.categoryContainer) {
            // Get updated progress for this category
            const progress = this.getCategoryProgress(categoryId);
            const category = this.categories.find(
              (cat) => cat.id === categoryId,
            );

            if (category && this.categoryHeader) {
              logger.debug("Updating category progress ring", {
                categoryId,
                progress,
                container: !!container,
              });

              // Update the category header progress ring using the new method
              this.categoryHeader.updateProgressRing(
                categoryId,
                category,
                progress,
                container,
              );
            } else {
              logger.warn(
                "Could not update progress ring - missing category or categoryHeader",
                {
                  categoryId,
                  hasCategory: !!category,
                  hasCategoryHeader: !!this.categoryHeader,
                },
              );
            }

            // Legacy support: Also update old progress ring if it exists
            const categorySection = scenarioCard.closest(".category-section");
            if (categorySection) {
              const progressRing =
                categorySection.querySelector(".progress-ring");
              if (progressRing) {
                const percentage =
                  progress.total > 0
                    ? (progress.completed / progress.total) * 100
                    : 0;
                const circumference = 2 * Math.PI * PROGRESS_RING_RADIUS;
                const offset =
                  circumference - (percentage / 100) * circumference;

                progressRing.style.strokeDashoffset = offset;

                // Update aria-label for accessibility
                const progressText =
                  categorySection.querySelector(".progress-text");
                if (progressText) {
                  progressText.textContent = `${progress.completed}/${progress.total}`;
                  progressRing.setAttribute(
                    "aria-label",
                    `${progress.completed} of ${progress.total} scenarios completed`,
                  );
                }
              }
            }
          }

          // Update progress ring in scenario view hover headers if in scenario view
          if (container === this.scenarioContainer) {
            // Get updated progress for this category
            const progress = this.getCategoryProgress(categoryId);
            const category = this.categories.find(
              (cat) => cat.id === categoryId,
            );

            if (category && this.categoryHeader) {
              logger.debug(
                "Updating scenario view hover header progress rings",
                {
                  categoryId,
                  progress,
                  container: !!container,
                },
              );

              // Find all scenario cards for this category in scenario view
              const categoryScenarioCards = container.querySelectorAll(
                `[data-category-id="${categoryId}"]`,
              );

              categoryScenarioCards.forEach((scenarioCardInView) => {
                const hoverHeader = scenarioCardInView
                  .closest(".scenario-card-wrapper")
                  ?.querySelector(".scenario-hover-category-header");

                if (hoverHeader) {
                  // Update the progress ring within the hover header
                  this.categoryHeader.updateProgressRing(
                    categoryId,
                    category,
                    progress,
                    hoverHeader,
                  );
                }
              });
            } else {
              logger.warn(
                "Could not update scenario hover header progress rings - missing category or categoryHeader",
                {
                  categoryId,
                  hasCategory: !!category,
                  hasCategoryHeader: !!this.categoryHeader,
                },
              );
            }
          }
        }
      });

      logger.debug("Updated scenario completion status in DOM", {
        categoryId,
        scenarioId,
        completed,
      });
    } catch (error) {
      logger.error("Failed to update scenario completion status:", error);
      // Fallback to full render only if DOM update fails
      this.render();
    }
  }

  /**
   * Checks for newly earned badges and displays them
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   */
  async checkForNewBadges(categoryId, scenarioId) {
    try {
      // Refresh badge manager's category progress
      badgeManager.refreshCategoryProgress();

      // Check for newly earned badges
      const newBadges = badgeManager.updateScenarioCompletion(
        categoryId,
        scenarioId,
      );

      if (newBadges && newBadges.length > 0) {
        // Display each new badge with a delay between multiple badges
        for (let i = 0; i < newBadges.length; i++) {
          const badge = newBadges[i];

          // Add small delay between multiple badges
          if (i > 0) {
            await this.delay(BADGE_DELAY_MS);
          }

          // Show badge modal with main context (from home page)
          await badgeModal.showBadgeModal(badge, "main");

          // Track badge achievement
          logger.info("Badge earned:", {
            categoryId: badge.categoryId,
            badgeTitle: badge.title,
            tier: badge.tier,
            timestamp: badge.timestamp,
          });

          // Track analytics if available
          if (window.AnalyticsManager) {
            window.AnalyticsManager.trackEvent("badge_earned", {
              categoryId: badge.categoryId,
              badgeTitle: badge.title,
              tier: badge.tier,
              scenarioId,
            });
          }
        }
      }
    } catch (error) {
      logger.error("Error checking for new badges:", error);
    }
  }

  /**
   * Handle global click events to close dropdowns
   */
  handleGlobalClick(event) {
    const filterBtn = this.scenarioContainer?.querySelector(".filter-btn");
    const filterDropdown =
      this.scenarioContainer?.querySelector(".filter-dropdown");
    const sortBtn = this.scenarioContainer?.querySelector(".sort-btn");
    const sortDropdown =
      this.scenarioContainer?.querySelector(".sort-dropdown");

    // Close filter dropdown if clicking outside
    if (
      filterBtn &&
      filterDropdown &&
      !filterBtn.contains(event.target) &&
      !filterDropdown.contains(event.target)
    ) {
      filterDropdown.style.display = "none";
      filterBtn.setAttribute("aria-expanded", "false");
    }

    // Close sort dropdown if clicking outside
    if (
      sortBtn &&
      sortDropdown &&
      !sortBtn.contains(event.target) &&
      !sortDropdown.contains(event.target)
    ) {
      sortDropdown.style.display = "none";
      sortBtn.setAttribute("aria-expanded", "false");
    }
  }

  /**
   * Handle global keydown events for accessibility
   */
  handleGlobalKeydown(event) {
    if (event.key === "Escape") {
      // Close all dropdowns on Escape
      const filterDropdown =
        this.scenarioContainer?.querySelector(".filter-dropdown");
      const sortDropdown =
        this.scenarioContainer?.querySelector(".sort-dropdown");
      const filterBtn = this.scenarioContainer?.querySelector(".filter-btn");
      const sortBtn = this.scenarioContainer?.querySelector(".sort-btn");

      if (filterDropdown && filterDropdown.style.display === "block") {
        filterDropdown.style.display = "none";
        if (filterBtn) {
          filterBtn.setAttribute("aria-expanded", "false");
          filterBtn.focus(); // Return focus to the button
        }
      }

      if (sortDropdown && sortDropdown.style.display === "block") {
        sortDropdown.style.display = "none";
        if (sortBtn) {
          sortBtn.setAttribute("aria-expanded", "false");
          sortBtn.focus(); // Return focus to the button
        }
      }
    }
  }

  /**
   * Utility function to create delays
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getFilteredCategories(filter = {}) {
    let filtered = [...this.categories];

    if (filter.difficulty) {
      filtered = filtered.filter((c) => c.difficulty === filter.difficulty);
    }

    if (filter.tags) {
      filtered = filtered.filter((c) =>
        filter.tags.some((tag) => c.tags.includes(tag)),
      );
    }

    if (filter.completed !== undefined) {
      filtered = filtered.filter((c) => {
        const progress = this.getCategoryProgress(c.id);
        return filter.completed
          ? progress.completed === progress.total
          : progress.completed < progress.total;
      });
    }

    return filtered;
  }

  // Public API for external components
  refreshProgress() {
    this.userProgress = this.loadUserProgress();

    // Refresh completed scenarios set
    this.completedScenarios.clear();
    Object.values(this.userProgress).forEach((categoryProgress) => {
      Object.entries(categoryProgress).forEach(([scenarioId, completed]) => {
        if (completed) {
          this.completedScenarios.add(scenarioId);
        }
      });
    });

    this.render();
  }

  highlightScenario(categoryId, scenarioId) {
    // Search in the currently active view
    const activeContainer =
      this.currentView === "category"
        ? this.categoryContainer
        : this.scenarioContainer;
    const card = activeContainer.querySelector(
      `[data-category-id="${categoryId}"][data-scenario-id="${scenarioId}"]`,
    );
    if (card) {
      card.scrollIntoView({ behavior: "smooth", block: "center" });
      card.classList.add("scenario-card-highlighted");
      setTimeout(
        () => card.classList.remove("scenario-card-highlighted"),
        HIGHLIGHT_DURATION,
      );
    }
  }

  highlightCategory(categoryId) {
    // Category highlighting only works in category view
    if (this.currentView !== "category") {
      // Switch to category view first
      this.switchView("category");
    }

    const section = this.categoryContainer.querySelector(
      `[data-category-id="${categoryId}"]`,
    );
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
      section.classList.add("category-section-highlighted");
      setTimeout(
        () => section.classList.remove("category-section-highlighted"),
        HIGHLIGHT_DURATION,
      );
    }
  }

  /**
   * Initialize scenario controls (search, filter, sort)
   */
  async initializeScenarioControls() {
    const toolbar = this.scenarioContainer.querySelector(
      ".scenario-controls-toolbar",
    );
    if (!toolbar) {
      logger.error("MainGrid", "Scenario controls toolbar not found!");
      return;
    }

    // Initialize all scenarios data
    try {
      this.allScenarios = CategoryMetadataManager.getAllScenariosEnhanced();
    } catch (error) {
      logger.error("Failed to load scenarios for controls:", error);
      this.allScenarios = this.getFallbackScenarios();
    }

    this.filteredScenarios = [...this.allScenarios];

    // Initialize autocomplete index for keyboard navigation
    this.autocompleteIndex = -1;

    // Add a small delay to ensure HTML is rendered before setting up all controls
    const DROPDOWN_SETUP_DELAY = 50; // ms
    setTimeout(() => {
      // Setup search input with autocomplete
      this.setupSearchInput();

      // Setup filter dropdown
      this.setupFilterDropdown();

      // Setup sort dropdown
      this.setupSortDropdown();

      // Setup clear all button
      this.setupClearAllButton();
    }, DROPDOWN_SETUP_DELAY);

    // Populate category filter options
    this.populateCategoryFilter();

    // Initial render with current state
    await this.renderFilteredScenarios();
  }

  /**
   * Get fallback scenarios data
   */
  getFallbackScenarios() {
    const scenarios = [];
    this.categories.forEach((category) => {
      const categoryScenarios = getCategoryScenarios(category.id);
      categoryScenarios.forEach((scenario) => {
        scenarios.push({
          ...scenario,
          categoryId: category.id,
          category,
        });
      });
    });
    return scenarios;
  }

  /**
   * Setup search input functionality
   */
  setupSearchInput() {
    const searchInput = this.scenarioContainer.querySelector(".search-input");
    const clearBtn = this.scenarioContainer.querySelector(".search-clear");
    const dropdown = this.scenarioContainer.querySelector(
      ".search-autocomplete-dropdown",
    );

    logger.info("Setting up search input - elements found:", {
      searchInput: !!searchInput,
      clearBtn: !!clearBtn,
      dropdown: !!dropdown,
    });

    if (!searchInput) {
      logger.error("Search input not found in scenario container");
      return;
    }

    // Initialize autocomplete data
    this.initializeAutocompleteData();

    let debounceTimeout;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();
      this.searchQuery = query.toLowerCase();

      // Show/hide clear button
      if (clearBtn) {
        clearBtn.style.display = query ? "block" : "none";
      }

      // Debounce the autocomplete update
      clearTimeout(debounceTimeout);
      debounceTimeout = setTimeout(() => {
        if (query.length > 0) {
          this.showAutocomplete(query);
        } else {
          this.hideAutocomplete();
        }
      }, AUTOCOMPLETE_DEBOUNCE_MS);

      // Apply filters immediately for typing
      this.applyFiltersAndSort();
    });

    // Handle autocomplete navigation
    searchInput.addEventListener("keydown", (e) => {
      if (dropdown.style.display !== "none") {
        this.handleAutocompleteKeydown(e);
      }
    });

    // Clear button functionality
    if (clearBtn) {
      clearBtn.addEventListener("click", () => {
        searchInput.value = "";
        this.searchQuery = "";
        clearBtn.style.display = "none";
        this.hideAutocomplete();
        searchInput.focus();
        this.applyFiltersAndSort();
      });
    }

    // Remove existing autocomplete click listener if it exists
    if (this.boundDocumentListeners.autocompleteClick) {
      document.removeEventListener(
        "click",
        this.boundDocumentListeners.autocompleteClick,
      );
    }

    // Hide autocomplete when clicking outside - store reference for cleanup
    this.boundDocumentListeners.autocompleteClick = (e) => {
      if (!searchInput.contains(e.target) && !dropdown.contains(e.target)) {
        this.hideAutocomplete();
      }
    };
    document.addEventListener(
      "click",
      this.boundDocumentListeners.autocompleteClick,
    );

    // Show autocomplete on focus if there's a value
    searchInput.addEventListener("focus", () => {
      if (searchInput.value.trim().length > 0) {
        this.showAutocomplete(searchInput.value.trim());
      }
    });
  }

  /**
   * Initialize autocomplete data from scenarios and tags
   */
  initializeAutocompleteData() {
    this.autocompleteScenarios = [];
    this.autocompleteTags = new Set();

    // Collect scenario titles and tags
    this.allScenarios.forEach((scenario) => {
      // Add scenario for title search
      this.autocompleteScenarios.push({
        type: "scenario",
        title: scenario.title,
        category: scenario.category?.title || "Unknown",
        categoryIcon: scenario.category?.icon || "🤖",
        id: scenario.id,
        categoryId: scenario.categoryId,
      });

      // Collect tags
      if (scenario.metadata?.tags) {
        scenario.metadata.tags.forEach((tag) => {
          this.autocompleteTags.add(tag);
        });
      }
    });

    // Convert tags set to array for easier handling
    this.autocompleteTagsArray = Array.from(this.autocompleteTags).map(
      (tag) => ({
        type: "tag",
        tag,
        title: tag,
      }),
    );
  }

  /**
   * Show autocomplete dropdown with filtered results
   */
  showAutocomplete(query) {
    logger.info("showAutocomplete called with query:", query);

    const dropdown = this.scenarioContainer?.querySelector(
      ".search-autocomplete-dropdown",
    );

    if (!dropdown) {
      logger.warn("Autocomplete dropdown not found");
      return;
    }

    logger.info("Autocomplete dropdown found, proceeding with display");

    const scenariosContainer = dropdown.querySelector(
      ".autocomplete-scenarios",
    );
    const tagsContainer = dropdown.querySelector(".autocomplete-tags");
    const noResults = dropdown.querySelector(".autocomplete-no-results");
    const searchInput = this.scenarioContainer?.querySelector(".search-input");

    if (!scenariosContainer || !tagsContainer) {
      logger.warn("Autocomplete containers not found", {
        scenariosContainer,
        tagsContainer,
      });
      return;
    }

    const queryLower = query.toLowerCase();

    // Filter scenarios
    const matchingScenarios = this.autocompleteScenarios
      .filter((scenario) => scenario.title.toLowerCase().includes(queryLower))
      .slice(0, MAX_AUTOCOMPLETE_SCENARIOS);

    // Filter tags
    const matchingTags = this.autocompleteTagsArray
      .filter((tag) => tag.tag.toLowerCase().includes(queryLower))
      .slice(0, MAX_AUTOCOMPLETE_TAGS);

    // Clear containers
    scenariosContainer.innerHTML = "";
    tagsContainer.innerHTML = "";

    // Add scenario results
    if (matchingScenarios.length > 0) {
      matchingScenarios.forEach((scenario, index) => {
        const item = this.createAutocompleteItem(scenario, query, index);
        scenariosContainer.appendChild(item);
      });
      const firstSection = dropdown.querySelector(
        ".autocomplete-section:first-child",
      );
      if (firstSection) {
        firstSection.style.display = "block";
      }
    } else {
      const firstSection = dropdown.querySelector(
        ".autocomplete-section:first-child",
      );
      if (firstSection) {
        firstSection.style.display = "none";
      }
    }

    // Add tag results
    if (matchingTags.length > 0) {
      matchingTags.forEach((tag, index) => {
        const item = this.createAutocompleteItem(
          tag,
          query,
          index + matchingScenarios.length,
        );
        tagsContainer.appendChild(item);
      });
      const lastSection = dropdown.querySelector(
        ".autocomplete-section:last-child",
      );
      if (lastSection) {
        lastSection.style.display = "block";
      }
    } else {
      const lastSection = dropdown.querySelector(
        ".autocomplete-section:last-child",
      );
      if (lastSection) {
        lastSection.style.display = "none";
      }
    }

    // Show/hide sections and no results
    const hasResults = matchingScenarios.length > 0 || matchingTags.length > 0;

    logger.info("Autocomplete results found:", {
      scenarios: matchingScenarios.length,
      tags: matchingTags.length,
      hasResults,
    });

    if (hasResults) {
      if (noResults) noResults.style.display = "none";
      dropdown.style.display = "block";
      if (searchInput) searchInput.setAttribute("aria-expanded", "true");
      logger.info(
        "Showing dropdown with results, display set to:",
        dropdown.style.display,
      );
    } else {
      if (noResults) noResults.style.display = "block";
      dropdown.style.display = "block";
      if (searchInput) searchInput.setAttribute("aria-expanded", "true");
      logger.info(
        "Showing dropdown with no results, display set to:",
        dropdown.style.display,
      );
    }

    // Reset focus index
    this.autocompleteIndex = -1;
  }

  /**
   * Create autocomplete item element
   */
  createAutocompleteItem(item, query, index) {
    const element = document.createElement("div");
    element.className = "autocomplete-item";
    element.setAttribute("role", "option");
    element.setAttribute("data-index", index);
    element.setAttribute("data-type", item.type);

    if (item.type === "scenario") {
      element.setAttribute("data-scenario-id", item.id);
      element.setAttribute("data-category-id", item.categoryId);

      element.innerHTML = `
        <div class="autocomplete-item-icon">${item.categoryIcon}</div>
        <div class="autocomplete-item-content">
          <div class="autocomplete-item-title">${this.highlightMatch(item.title, query)}</div>
          <div class="autocomplete-item-meta">${item.category}</div>
        </div>
      `;
    } else if (item.type === "tag") {
      element.setAttribute("data-tag", item.tag);

      element.innerHTML = `
        <div class="autocomplete-item-icon">🏷️</div>
        <div class="autocomplete-item-content">
          <div class="autocomplete-item-title">
            <span class="autocomplete-item-tag">${this.highlightMatch(item.tag, query)}</span>
          </div>
          <div class="autocomplete-item-meta">Tag</div>
        </div>
      `;
    }

    // Handle click selection
    element.addEventListener("click", () => {
      this.selectAutocompleteItem(item);
    });

    return element;
  }

  /**
   * Highlight matching text in autocomplete items
   */
  highlightMatch(text, query) {
    if (!query) return text;

    const queryLower = query.toLowerCase();
    const textLower = text.toLowerCase();
    const index = textLower.indexOf(queryLower);

    if (index === -1) return text;

    const beforeMatch = text.substring(0, index);
    const match = text.substring(index, index + query.length);
    const afterMatch = text.substring(index + query.length);

    return `${beforeMatch}<span class="autocomplete-highlight">${match}</span>${afterMatch}`;
  }

  /**
   * Handle keyboard navigation in autocomplete
   */
  handleAutocompleteKeydown(e) {
    const dropdown = this.scenarioContainer.querySelector(
      ".search-autocomplete-dropdown",
    );
    const items = dropdown.querySelectorAll(".autocomplete-item");

    if (!items.length) return;

    switch (e.key) {
      case "ArrowDown":
        e.preventDefault();
        this.autocompleteIndex = Math.min(
          this.autocompleteIndex + 1,
          items.length - 1,
        );
        this.updateAutocompleteSelection(items);
        break;

      case "ArrowUp":
        e.preventDefault();
        this.autocompleteIndex = Math.max(this.autocompleteIndex - 1, -1);
        this.updateAutocompleteSelection(items);
        break;

      case "Enter":
        e.preventDefault();
        if (this.autocompleteIndex >= 0 && items[this.autocompleteIndex]) {
          const item = this.getItemDataFromElement(
            items[this.autocompleteIndex],
          );
          this.selectAutocompleteItem(item);
        }
        break;

      case "Escape":
        e.preventDefault();
        this.hideAutocomplete();
        break;
    }
  }

  /**
   * Update visual selection in autocomplete
   */
  updateAutocompleteSelection(items) {
    items.forEach((item, index) => {
      item.classList.toggle("focused", index === this.autocompleteIndex);
    });

    // Scroll focused item into view
    if (this.autocompleteIndex >= 0 && items[this.autocompleteIndex]) {
      items[this.autocompleteIndex].scrollIntoView({
        block: "nearest",
        behavior: "smooth",
      });
    }
  }

  /**
   * Get item data from DOM element
   */
  getItemDataFromElement(element) {
    const type = element.getAttribute("data-type");

    if (type === "scenario") {
      return {
        type: "scenario",
        id: element.getAttribute("data-scenario-id"),
        categoryId: element.getAttribute("data-category-id"),
        title: element
          .querySelector(".autocomplete-item-title")
          .textContent.trim(),
      };
    } else if (type === "tag") {
      return {
        type: "tag",
        tag: element.getAttribute("data-tag"),
        title: element.getAttribute("data-tag"),
      };
    }

    return null;
  }

  /**
   * Select an autocomplete item
   */
  selectAutocompleteItem(item) {
    const searchInput = this.scenarioContainer.querySelector(".search-input");

    if (item.type === "scenario") {
      // Set search to scenario title and filter
      searchInput.value = item.title;
      this.searchQuery = item.title.toLowerCase();
    } else if (item.type === "tag") {
      // Set search to tag and filter
      searchInput.value = item.tag;
      this.searchQuery = item.tag.toLowerCase();
    }

    // Update clear button
    const clearBtn = this.scenarioContainer.querySelector(".search-clear");
    if (clearBtn) {
      clearBtn.style.display = "block";
    }

    // Hide autocomplete
    this.hideAutocomplete();

    // Apply filters
    this.applyFiltersAndSort();

    // Focus search input
    searchInput.focus();
  }

  /**
   * Hide autocomplete dropdown
   */
  hideAutocomplete() {
    const dropdown = this.scenarioContainer.querySelector(
      ".search-autocomplete-dropdown",
    );
    const searchInput = this.scenarioContainer.querySelector(".search-input");

    if (dropdown) {
      dropdown.style.display = "none";
    }

    if (searchInput) {
      searchInput.setAttribute("aria-expanded", "false");
    }

    this.autocompleteIndex = -1;
  }

  /**
   * Setup filter dropdown functionality
   */
  setupFilterDropdown() {
    const filterBtn = this.scenarioContainer.querySelector(".filter-btn");
    const filterDropdown =
      this.scenarioContainer.querySelector(".filter-dropdown");

    // Debug: Check if elements exist
    if (!filterBtn) {
      logger.error("Filter button not found in scenario container");
      return;
    }
    if (!filterDropdown) {
      logger.error("Filter dropdown not found in scenario container");
      return;
    }

    logger.info("Setting up filter dropdown - elements found:", {
      filterBtn: !!filterBtn,
      filterDropdown: !!filterDropdown,
    });

    filterBtn.addEventListener("click", (e) => {
      logger.info("Filter button clicked!");
      e.stopPropagation();
      const isVisible = filterDropdown.style.display === "block";

      // Hide other dropdowns
      const sortDropdown =
        this.scenarioContainer.querySelector(".sort-dropdown");
      if (sortDropdown) sortDropdown.style.display = "none";

      // Toggle filter dropdown
      filterDropdown.style.display = isVisible ? "none" : "block";
      filterBtn.setAttribute("aria-expanded", !isVisible);
    });

    // Handle filter selections
    const filterOptions = filterDropdown.querySelectorAll(".filter-option");
    filterOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        e.stopPropagation();
        const categoryValue = option.getAttribute("data-category");
        const categoryText = option.textContent.trim();

        // Update active state
        filterOptions.forEach((opt) => {
          opt.classList.remove("active");
          opt.setAttribute("aria-selected", "false");
        });
        option.classList.add("active");
        option.setAttribute("aria-selected", "true");

        // Update button text to show selected category
        const filterTextElement = filterBtn.querySelector(".filter-text");
        if (filterTextElement) {
          if (categoryValue === "all") {
            filterTextElement.textContent = "All Categories";
          } else {
            filterTextElement.textContent = categoryText;
          }
        }

        this.applyFilter("category", categoryValue);
        filterDropdown.style.display = "none";
        filterBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Remove existing filter click listener if it exists
    if (this.boundDocumentListeners.filterClick) {
      document.removeEventListener(
        "click",
        this.boundDocumentListeners.filterClick,
      );
    }

    // Close dropdown when clicking outside - store reference for cleanup
    this.boundDocumentListeners.filterClick = (e) => {
      if (!filterBtn.contains(e.target) && !filterDropdown.contains(e.target)) {
        filterDropdown.style.display = "none";
        filterBtn.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("click", this.boundDocumentListeners.filterClick);
  }

  /**
   * Setup sort dropdown functionality
   */
  setupSortDropdown() {
    const sortBtn = this.scenarioContainer.querySelector(".sort-btn");
    const sortDropdown = this.scenarioContainer.querySelector(".sort-dropdown");

    if (!sortBtn || !sortDropdown) return;

    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = sortDropdown.style.display === "block";

      // Hide other dropdowns
      const filterDropdown =
        this.scenarioContainer.querySelector(".filter-dropdown");
      if (filterDropdown) filterDropdown.style.display = "none";

      // Toggle sort dropdown
      sortDropdown.style.display = isVisible ? "none" : "block";
      sortBtn.setAttribute("aria-expanded", !isVisible);
    });

    // Handle sort selections
    const sortOptions = sortDropdown.querySelectorAll(".sort-option");

    sortOptions.forEach((option) => {
      option.addEventListener("click", (e) => {
        e.preventDefault();
        const sortValue = option.getAttribute("data-sort");
        const sortText =
          option.querySelector(".option-text")?.textContent.trim() ||
          option.textContent.trim();

        // Update active state
        sortOptions.forEach((opt) => {
          opt.classList.remove("active");
          opt.setAttribute("aria-selected", "false");
        });
        option.classList.add("active");
        option.setAttribute("aria-selected", "true");

        // Update button text to show selected sort option
        const sortTextElement = sortBtn.querySelector(".sort-text");
        if (sortTextElement) {
          sortTextElement.textContent = sortText;
        }

        this.applySorting(sortValue);
        sortDropdown.style.display = "none";
        sortBtn.setAttribute("aria-expanded", "false");
      });
    });

    // Remove existing sort click listener if it exists
    if (this.boundDocumentListeners.sortClick) {
      document.removeEventListener(
        "click",
        this.boundDocumentListeners.sortClick,
      );
    }

    // Close dropdown when clicking outside - store reference for cleanup
    this.boundDocumentListeners.sortClick = (e) => {
      if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
        sortDropdown.style.display = "none";
        sortBtn.setAttribute("aria-expanded", "false");
      }
    };
    document.addEventListener("click", this.boundDocumentListeners.sortClick);
  }

  /**
   * Setup clear all button functionality
   */
  setupClearAllButton() {
    const clearAllBtn = this.scenarioContainer.querySelector(".clear-all-btn");

    if (!clearAllBtn) {
      logger.warn("Clear all button not found");
      return;
    }

    clearAllBtn.addEventListener("click", (e) => {
      e.preventDefault();
      this.clearAllFilters();
    });
  }

  /**
   * Clear all filters and reset to default state
   */
  clearAllFilters() {
    // Reset all filter and sort states
    this.searchQuery = "";
    this.selectedCategory = null;
    this.selectedDifficulty = null;
    this.selectedCompleted = null;
    this.sortBy = "alphabetical";

    // Reset search input
    const searchInput = this.scenarioContainer.querySelector(".search-input");
    if (searchInput) {
      searchInput.value = "";
    }

    // Hide search clear button
    const searchClearBtn =
      this.scenarioContainer.querySelector(".search-clear");
    if (searchClearBtn) {
      searchClearBtn.style.display = "none";
    }

    // Hide autocomplete dropdown
    this.hideAutocomplete();

    // Reset filter dropdown to "All Categories"
    const filterBtn = this.scenarioContainer.querySelector(".filter-btn");
    const filterOptions =
      this.scenarioContainer.querySelectorAll(".filter-option");

    if (filterBtn) {
      const filterText = filterBtn.querySelector(".filter-text");
      if (filterText) {
        filterText.textContent = "All Categories";
      }
    }

    filterOptions.forEach((option) => {
      const isAllOption = option.getAttribute("data-category") === "all";
      option.classList.toggle("active", isAllOption);
      option.setAttribute("aria-selected", isAllOption ? "true" : "false");
    });

    // Reset sort dropdown to "Alphabetical"
    const sortBtn = this.scenarioContainer.querySelector(".sort-btn");
    const sortOptions = this.scenarioContainer.querySelectorAll(".sort-option");

    if (sortBtn) {
      const sortText = sortBtn.querySelector(".sort-text");
      if (sortText) {
        sortText.textContent = "Alphabetical";
      }
    }

    sortOptions.forEach((option) => {
      const isAlphabetical =
        option.getAttribute("data-sort") === "alphabetical";
      option.classList.toggle("active", isAlphabetical);
      option.setAttribute("aria-selected", isAlphabetical ? "true" : "false");
    });

    // Close any open dropdowns
    const filterDropdown =
      this.scenarioContainer.querySelector(".filter-dropdown");
    const sortDropdown = this.scenarioContainer.querySelector(".sort-dropdown");

    if (filterDropdown) {
      filterDropdown.style.display = "none";
    }
    if (sortDropdown) {
      sortDropdown.style.display = "none";
    }
    if (filterBtn) {
      filterBtn.setAttribute("aria-expanded", "false");
    }
    if (sortBtn) {
      sortBtn.setAttribute("aria-expanded", "false");
    }

    // Re-apply filters and sort (which will now be default)
    this.applyFiltersAndSort();

    logger.info("All filters and sort options cleared, reset to default");
  }

  /**
   * Populate category filter options
   */
  populateCategoryFilter() {
    const filterDropdown =
      this.scenarioContainer.querySelector(".filter-dropdown");
    if (!filterDropdown) return;

    // Don't clear - there's already an "All Categories" option
    // Just add category-specific options
    const existingOptions = filterDropdown.querySelectorAll(
      '.filter-option[data-category]:not([data-category="all"])',
    );
    existingOptions.forEach((option) => option.remove());

    // Add category options
    this.categories.forEach((category) => {
      const option = document.createElement("button");
      option.type = "button";
      option.className = "filter-option";
      option.setAttribute("data-category", category.id);
      option.setAttribute("role", "option");
      option.setAttribute("aria-selected", "false");

      option.innerHTML = `
        <span class="option-text">${category.icon} ${category.title}</span>
        <svg
          class="check-icon"
          viewBox="0 0 20 20"
          fill="currentColor"
          aria-hidden="true"
        >
          <path
            fill-rule="evenodd"
            d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z"
            clip-rule="evenodd"
          />
        </svg>
      `;

      filterDropdown.appendChild(option);
    });
  }

  /**
   * Apply filter
   */
  applyFilter(filterType, filterValue) {
    if (filterType === "category") {
      this.selectedCategory = filterValue === "all" ? null : filterValue;
    } else if (filterType === "difficulty") {
      this.selectedDifficulty = filterValue === "all" ? null : filterValue;
    } else if (filterType === "completed") {
      this.selectedCompleted =
        filterValue === "all" ? null : filterValue === "true";
    }

    this.applyFiltersAndSort();
  }

  /**
   * Apply sorting
   */
  applySorting(sortValue) {
    this.sortBy = sortValue;
    this.applyFiltersAndSort();
  }

  /**
   * Apply filters and sorting to scenarios
   */
  async applyFiltersAndSort() {
    // Start with all scenarios
    let filtered = [...this.allScenarios];

    // Apply search filter - ONLY search title and tags
    if (this.searchQuery) {
      filtered = filtered.filter((scenario) => {
        // Only search in title and tags - no other fields
        const titleMatch = scenario.title
          .toLowerCase()
          .includes(this.searchQuery);
        const tagsMatch = (scenario.metadata?.tags || []).some((tag) =>
          tag.toLowerCase().includes(this.searchQuery),
        );

        return titleMatch || tagsMatch;
      });
    }

    // Apply category filter
    if (this.selectedCategory) {
      filtered = filtered.filter(
        (scenario) => scenario.categoryId === this.selectedCategory,
      );
    }

    // Apply difficulty filter
    if (this.selectedDifficulty) {
      filtered = filtered.filter(
        (scenario) => scenario.difficulty === this.selectedDifficulty,
      );
    }

    // Apply completed filter
    if (this.selectedCompleted !== null) {
      filtered = filtered.filter((scenario) => {
        const isCompleted = this.completedScenarios.has(scenario.id);
        return isCompleted === this.selectedCompleted;
      });
    }

    // Apply sorting
    this.sortScenarios(filtered);

    // Update filtered scenarios
    this.filteredScenarios = filtered;

    // Render the filtered results
    await this.renderFilteredScenarios();
  }

  /**
   * Sort scenarios array
   */
  sortScenarios(scenarios) {
    scenarios.sort((a, b) => {
      switch (this.sortBy) {
        case "alphabetical":
          return a.title.localeCompare(b.title);
        case "category": {
          const catA = a.category?.title || "";
          const catB = b.category?.title || "";
          return catA.localeCompare(catB) || a.title.localeCompare(b.title);
        }
        case "difficulty": {
          const difficultyOrder = { Beginner: 1, Intermediate: 2, Advanced: 3 };
          const diffA = difficultyOrder[a.difficulty] || 0;
          const diffB = difficultyOrder[b.difficulty] || 0;
          return diffA - diffB || a.title.localeCompare(b.title);
        }
        case "newest":
          return new Date(b.dateAdded || 0) - new Date(a.dateAdded || 0);
        case "explored": {
          // Show completed scenarios first, then alphabetical within each group
          const completedA = this.completedScenarios.has(a.id);
          const completedB = this.completedScenarios.has(b.id);
          if (completedA && !completedB) return -1;
          if (!completedA && completedB) return 1;
          return a.title.localeCompare(b.title);
        }
        case "unexplored": {
          // Show uncompleted scenarios first, then alphabetical within each group
          const completedA = this.completedScenarios.has(a.id);
          const completedB = this.completedScenarios.has(b.id);
          if (!completedA && completedB) return -1;
          if (completedA && !completedB) return 1;
          return a.title.localeCompare(b.title);
        }
        default:
          return a.title.localeCompare(b.title);
      }
    });
  }

  /**
   * Render filtered scenarios
   */
  async renderFilteredScenarios() {
    // Find the scenarios container - it's the scenario container itself, not a child .scenarios-grid
    const scenariosContainer = this.scenarioContainer;
    if (!scenariosContainer) return;

    // Clear existing scenario cards (but keep the toolbar)
    const existingCards = scenariosContainer.querySelectorAll(
      ".scenario-card-wrapper, .scenario-card, .no-scenarios-message, .scenario-count",
    );
    existingCards.forEach((card) => card.remove());

    if (this.filteredScenarios.length === 0) {
      // Show no results message
      const noResults = document.createElement("div");
      noResults.className = "no-scenarios-message";
      noResults.innerHTML = `
        <div class="no-scenarios-icon">🔍</div>
        <h3>No scenarios found</h3>
        <p>Try adjusting your search terms or filters</p>
      `;
      scenariosContainer.appendChild(noResults);
      return;
    }

    // Add scenario count display
    const countElement = document.createElement("div");
    countElement.className = "scenario-count";
    countElement.innerHTML = `
      <p class="count-text">Showing <span class="count-number">${this.filteredScenarios.length}</span> of ${this.allScenarios.length} scenarios</p>
    `;
    scenariosContainer.appendChild(countElement);

    // Render scenarios
    for (const scenario of this.filteredScenarios) {
      const scenarioElement = await this.createScenarioElement(scenario);
      scenariosContainer.appendChild(scenarioElement);
    }

    // Update results count
    this.updateResultsCount();
  }

  /**
   * Create scenario element
   */
  async createScenarioElement(scenario) {
    const category = {
      id: scenario.categoryId,
      color: scenario.category?.color || "#667eea",
      icon: scenario.category?.icon || "🤖",
      title: scenario.category?.title || "Unknown Category",
    };

    const isCompleted =
      this.userProgress[scenario.categoryId]?.[scenario.id] || false;
    const scenarioCardHtml = await ScenarioCard.render(
      scenario,
      category,
      isCompleted,
    );

    // Create wrapper with category header for hover effect
    const cardWrapper = document.createElement("div");
    cardWrapper.className = "scenario-card-wrapper";
    cardWrapper.innerHTML = scenarioCardHtml;

    // Add category header for hover effect
    const categoryProgress = this.getCategoryProgress(scenario.categoryId);
    const categoryHeaderHtml = await this.categoryHeader.render(
      scenario.category || category,
      categoryProgress,
    );

    const categoryHeaderElement = document.createElement("div");
    categoryHeaderElement.className = "scenario-hover-category-header";
    categoryHeaderElement.innerHTML = categoryHeaderHtml;
    cardWrapper.appendChild(categoryHeaderElement);

    return cardWrapper;
  }

  /**
   * Update results count display
   */
  updateResultsCount() {
    const countElement = this.scenarioContainer.querySelector(".results-count");
    if (countElement) {
      const count = this.filteredScenarios.length;
      const total = this.allScenarios.length;
      countElement.textContent = `Showing ${count} of ${total} scenarios`;
    }
  }

  /**
   * Start a scenario
   */
  startScenario(categoryId, scenarioId) {
    // Navigate to scenario
    if (this.onScenarioSelect) {
      this.onScenarioSelect(categoryId, scenarioId);
    } else {
      // Default navigation
      window.location.href = `scenario.html?category=${categoryId}&scenario=${scenarioId}`;
    }
  }

  // ===== ENTERPRISE STATIC UTILITIES =====
  /**
   * Enterprise health diagnostics for MainGrid component
   * @returns {Object} Comprehensive health report
   */
  static getHealthReport() {
    try {
      const instances = MainGrid._instances || new Set();
      const report = {
        timestamp: Date.now(),
        instanceCount: instances.size,
        systemHealth: "healthy",
        instances: [],
        performance: {
          averageRenderTime: 0,
          totalRenders: 0,
          memoryUsage: performance.memory
            ? Math.round(performance.memory.usedJSHeapSize / 1024 / 1024)
            : "unknown",
        },
        circuitBreakers: {
          total: 0,
          open: 0,
          halfOpen: 0,
          closed: 0,
        },
      };

      let totalRenderTime = 0;
      let totalRenders = 0;

      instances.forEach((instance) => {
        const instanceHealth = {
          id: instance.container?.id || "unknown",
          isHealthy: instance.isHealthy,
          circuitBreakerState: instance.circuitBreaker?.state || "unknown",
          renderCount: instance.performanceMetrics?.renderCount || 0,
          averageRenderTime:
            instance.performanceMetrics?.averageRenderTime || 0,
          errorCount: instance.errorCount || 0,
          lastError: instance.lastError || null,
        };

        report.instances.push(instanceHealth);
        totalRenderTime +=
          instanceHealth.averageRenderTime * instanceHealth.renderCount;
        totalRenders += instanceHealth.renderCount;

        // Circuit breaker stats
        report.circuitBreakers.total++;
        switch (instanceHealth.circuitBreakerState) {
          case "open":
            report.circuitBreakers.open++;
            break;
          case "half-open":
            report.circuitBreakers.halfOpen++;
            break;
          case "closed":
            report.circuitBreakers.closed++;
            break;
        }

        // Determine overall health
        if (
          !instanceHealth.isHealthy ||
          instanceHealth.circuitBreakerState === "open"
        ) {
          report.systemHealth = "degraded";
        }
      });

      // Calculate system averages
      if (totalRenders > 0) {
        report.performance.averageRenderTime =
          Math.round((totalRenderTime / totalRenders) * 100) / 100;
        report.performance.totalRenders = totalRenders;
      }

      return report;
    } catch (error) {
      console.error("[MainGrid] Error generating health report:", error);
      return {
        timestamp: Date.now(),
        systemHealth: "error",
        error: error.message,
        instanceCount: 0,
        instances: [],
        performance: {
          averageRenderTime: 0,
          totalRenders: 0,
          memoryUsage: "unknown",
        },
        circuitBreakers: { total: 0, open: 0, halfOpen: 0, closed: 0 },
      };
    }
  }

  /**
   * Enterprise performance analytics aggregation
   * @returns {Object} Performance metrics across all instances
   */
  static getPerformanceMetrics() {
    try {
      const instances = MainGrid._instances || new Set();
      const metrics = {
        timestamp: Date.now(),
        totalInstances: instances.size,
        aggregatedMetrics: {
          totalRenders: 0,
          totalRenderTime: 0,
          averageRenderTime: 0,
          minRenderTime: Infinity,
          maxRenderTime: 0,
          errorRate: 0,
          totalErrors: 0,
        },
        instanceMetrics: [],
      };

      let totalRenderTime = 0;
      let totalRenders = 0;
      let totalErrors = 0;
      const renderTimes = [];

      instances.forEach((instance) => {
        const perf = instance.performanceMetrics || {};
        const instanceMetric = {
          id: instance.container?.id || "unknown",
          renderCount: perf.renderCount || 0,
          averageRenderTime: perf.averageRenderTime || 0,
          totalRenderTime: perf.totalRenderTime || 0,
          errorCount: instance.errorCount || 0,
          memoryUsage: perf.memoryUsage || 0,
        };

        metrics.instanceMetrics.push(instanceMetric);

        totalRenders += instanceMetric.renderCount;
        totalRenderTime += instanceMetric.totalRenderTime;
        totalErrors += instanceMetric.errorCount;

        if (instanceMetric.averageRenderTime > 0) {
          renderTimes.push(instanceMetric.averageRenderTime);
          metrics.aggregatedMetrics.minRenderTime = Math.min(
            metrics.aggregatedMetrics.minRenderTime,
            instanceMetric.averageRenderTime,
          );
          metrics.aggregatedMetrics.maxRenderTime = Math.max(
            metrics.aggregatedMetrics.maxRenderTime,
            instanceMetric.averageRenderTime,
          );
        }
      });

      // Calculate aggregated metrics
      metrics.aggregatedMetrics.totalRenders = totalRenders;
      metrics.aggregatedMetrics.totalRenderTime =
        Math.round(totalRenderTime * 100) / 100;
      metrics.aggregatedMetrics.totalErrors = totalErrors;

      if (totalRenders > 0) {
        metrics.aggregatedMetrics.averageRenderTime =
          Math.round((totalRenderTime / totalRenders) * 100) / 100;
        metrics.aggregatedMetrics.errorRate =
          Math.round((totalErrors / totalRenders) * 10000) / 100; // Percentage with 2 decimals
      }

      if (metrics.aggregatedMetrics.minRenderTime === Infinity) {
        metrics.aggregatedMetrics.minRenderTime = 0;
      }

      return metrics;
    } catch (error) {
      console.error("[MainGrid] Error generating performance metrics:", error);
      return {
        timestamp: Date.now(),
        error: error.message,
        totalInstances: 0,
        aggregatedMetrics: {
          totalRenders: 0,
          totalRenderTime: 0,
          averageRenderTime: 0,
          minRenderTime: 0,
          maxRenderTime: 0,
          errorRate: 0,
          totalErrors: 0,
        },
        instanceMetrics: [],
      };
    }
  }

  /**
   * Enterprise debugging utilities for MainGrid
   * @returns {Object} Debug information for troubleshooting
   */
  static getDebugInfo() {
    try {
      const instances = MainGrid._instances || new Set();
      const debug = {
        timestamp: Date.now(),
        version: "1.20-enterprise",
        instanceCount: instances.size,
        globalState: {
          memoryUsage: performance.memory
            ? {
                used: Math.round(
                  performance.memory.usedJSHeapSize / 1024 / 1024,
                ),
                total: Math.round(
                  performance.memory.totalJSHeapSize / 1024 / 1024,
                ),
                limit: Math.round(
                  performance.memory.jsHeapSizeLimit / 1024 / 1024,
                ),
              }
            : "unavailable",
          timing: performance.timing
            ? {
                loadComplete:
                  performance.timing.loadEventEnd -
                  performance.timing.navigationStart,
                domReady:
                  performance.timing.domContentLoadedEventEnd -
                  performance.timing.navigationStart,
              }
            : "unavailable",
        },
        instances: [],
      };

      instances.forEach((instance) => {
        const debugInfo = {
          id: instance.container?.id || "unknown",
          className: instance.constructor.name,
          isHealthy: instance.isHealthy,
          state: {
            currentCategory: instance.currentCategory,
            currentView: instance.currentView,
            searchTerm: instance.searchTerm,
            isLoading: instance.isLoading,
          },
          circuitBreaker: {
            state: instance.circuitBreaker?.state || "unknown",
            failureCount: instance.circuitBreaker?.failureCount || 0,
            lastFailureTime: instance.circuitBreaker?.lastFailureTime || null,
          },
          performance: instance.performanceMetrics || {},
          errors: {
            count: instance.errorCount || 0,
            lastError: instance.lastError || null,
            recoveryAttempts: instance.recoveryAttempts || 0,
          },
          monitoring: {
            telemetryBatchSize: instance.telemetryBatch?.length || 0,
            healthCheckInterval: instance.healthCheckInterval || null,
            lastHealthCheck: instance.lastHealthCheck || null,
          },
        };

        debug.instances.push(debugInfo);
      });

      return debug;
    } catch (error) {
      console.error("[MainGrid] Error generating debug info:", error);
      return {
        timestamp: Date.now(),
        error: error.message,
        version: "1.20-enterprise",
        instanceCount: 0,
        globalState: {},
        instances: [],
      };
    }
  }

  /**
   * Force health check on all MainGrid instances
   * @returns {Promise<Object>} Health check results
   */
  static async forceHealthCheck() {
    try {
      const instances = MainGrid._instances || new Set();
      const results = {
        timestamp: Date.now(),
        totalInstances: instances.size,
        healthyInstances: 0,
        unhealthyInstances: 0,
        results: [],
      };

      const healthPromises = Array.from(instances).map(async (instance) => {
        try {
          const startTime = performance.now();

          // Force health check
          if (typeof instance._performHealthCheck === "function") {
            await instance._performHealthCheck();
          }

          const endTime = performance.now();
          const result = {
            id: instance.container?.id || "unknown",
            isHealthy: instance.isHealthy,
            checkDuration: Math.round((endTime - startTime) * 100) / 100,
            circuitBreakerState: instance.circuitBreaker?.state || "unknown",
            errorCount: instance.errorCount || 0,
          };

          if (result.isHealthy) {
            results.healthyInstances++;
          } else {
            results.unhealthyInstances++;
          }

          return result;
        } catch (error) {
          results.unhealthyInstances++;
          return {
            id: instance.container?.id || "unknown",
            isHealthy: false,
            error: error.message,
            checkDuration: 0,
            circuitBreakerState: "unknown",
            errorCount: -1,
          };
        }
      });

      results.results = await Promise.all(healthPromises);
      return results;
    } catch (error) {
      console.error("[MainGrid] Error performing health checks:", error);
      return {
        timestamp: Date.now(),
        error: error.message,
        totalInstances: 0,
        healthyInstances: 0,
        unhealthyInstances: 0,
        results: [],
      };
    }
  }

  /**
   * Emergency recovery for all MainGrid instances
   * @returns {Promise<Object>} Recovery results
   */
  static async emergencyRecovery() {
    try {
      const instances = MainGrid._instances || new Set();
      const results = {
        timestamp: Date.now(),
        totalInstances: instances.size,
        recoveredInstances: 0,
        failedRecoveries: 0,
        results: [],
      };

      const recoveryPromises = Array.from(instances).map(async (instance) => {
        try {
          const startTime = performance.now();

          // Reset circuit breaker
          if (instance.circuitBreaker) {
            instance.circuitBreaker.state = "closed";
            instance.circuitBreaker.failureCount = 0;
            instance.circuitBreaker.lastFailureTime = null;
          }

          // Reset error tracking
          instance.errorCount = 0;
          instance.lastError = null;
          instance.recoveryAttempts = 0;

          // Reset health status
          instance.isHealthy = true;

          // Clear telemetry batch
          if (instance.telemetryBatch) {
            instance.telemetryBatch.length = 0;
          }

          // Force re-render if possible
          if (typeof instance.render === "function") {
            await instance.render();
          }

          const endTime = performance.now();
          const result = {
            id: instance.container?.id || "unknown",
            recovered: true,
            recoveryDuration: Math.round((endTime - startTime) * 100) / 100,
            newState: {
              isHealthy: instance.isHealthy,
              circuitBreakerState: instance.circuitBreaker?.state || "unknown",
              errorCount: instance.errorCount,
            },
          };

          results.recoveredInstances++;
          return result;
        } catch (error) {
          results.failedRecoveries++;
          return {
            id: instance.container?.id || "unknown",
            recovered: false,
            error: error.message,
            recoveryDuration: 0,
          };
        }
      });

      results.results = await Promise.all(recoveryPromises);

      console.log(
        `[MainGrid] Emergency recovery completed: ${results.recoveredInstances}/${results.totalInstances} instances recovered`,
      );
      return results;
    } catch (error) {
      console.error("[MainGrid] Error during emergency recovery:", error);
      return {
        timestamp: Date.now(),
        error: error.message,
        totalInstances: 0,
        recoveredInstances: 0,
        failedRecoveries: 0,
        results: [],
      };
    }
  }
}

export default MainGrid;
