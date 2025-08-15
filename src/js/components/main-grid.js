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
  constructor(app = null) {
    // Enhanced integration
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

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
    this.userProgress = {}; // Will be loaded async
    this.lastModalOpenTime = 0; // Debounce tracking
    this.modalOpenCooldown = 500; // Minimum time between modal opens (ms)
    this.isModalOpen = false; // Track if modal is currently open
    this.scenarioModal = null; // Reusable modal instance
    this.modalClosedHandler = null; // Store bound event handler
    this.scenarioCompletedHandler = null; // Store bound event handler
    this.scenarioReflectionCompletedHandler = null; // Store bound reflection handler

    // Filter state protection flags
    this._isApplyingFilters = false; // Prevent infinite loop in category filters
    this._isApplyingScenarioFilters = false; // Prevent infinite loop in scenario filters

    // Initialize performance optimizations
    this.initializeEventDelegation();

    // Initialize async
    this.initializeAsync();
  }

  async initializeAsync() {
    // Load user progress asynchronously
    this.userProgress = await this.loadUserProgress();

    // Queue for deferred badge notifications (wait for reflection completion)
    this.deferredBadges = new Map(); // scenarioId -> { badges, scenarioData, timestamp }

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

    // Performance Optimization: DOM Element Cache
    this.domCache = new Map();
    this.searchCache = new Map();
    this.searchDebounceTimer = null;
    this.abortController = new AbortController();

    // Batched DOM update queue
    this.domUpdateQueue = [];
    this.domUpdateScheduled = false;

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

    // SimulateAI coordination system
    this.simulateAIFunction = null;
    this.categoryGridComponent = null;
    this.scenarioBrowserComponent = null;
    this.coordinationEnabled = false;

    // Initialize enterprise monitoring
    this._initializeEnterpriseMonitoring();

    // Initialize with performance tracking
    this._trackOperation("initialization", async () => {
      await this.init();
    });
  }

  /**
   * Set the SimulateAI function for coordinating category-grid and scenario-browser
   * @param {Object} simulateAIFunction - The SimulateAI coordination interface from app.js
   */
  setSimulateAIInitializer(simulateAIFunction) {
    try {
      this.simulateAIFunction = simulateAIFunction;
      this.coordinationEnabled = true;

      logger.info(
        "MainGrid: SimulateAI function set, initializing component coordination",
      );

      // Initialize coordinated components
      this._initializeCoordinatedComponents();

      logger.info("MainGrid: SimulateAI coordination enabled successfully");
    } catch (error) {
      logger.error("MainGrid: Failed to set SimulateAI initializer:", error);
      this.coordinationEnabled = false;
    }
  }

  /**
   * Initialize coordinated components using the SimulateAI function
   * @private
   */
  _initializeCoordinatedComponents() {
    if (!this.simulateAIFunction) {
      logger.warn(
        "MainGrid: No SimulateAI function available for coordination",
      );
      return;
    }

    try {
      // Initialize category grid component
      this.categoryGridComponent =
        this.simulateAIFunction.initializeCategoryGrid();

      // Initialize scenario browser component
      this.scenarioBrowserComponent =
        this.simulateAIFunction.initializeScenarioBrowser();

      // Set up event coordination
      this._setupEventCoordination();

      logger.info("MainGrid: Coordinated components initialized", {
        categoryGrid: !!this.categoryGridComponent,
        scenarioBrowser: !!this.scenarioBrowserComponent,
      });
    } catch (error) {
      logger.error(
        "MainGrid: Failed to initialize coordinated components:",
        error,
      );
      this.simulateAIFunction.onError(error, "component_coordination");
    }
  }

  /**
   * Set up event coordination between components
   * @private
   */
  _setupEventCoordination() {
    if (!this.simulateAIFunction) return;

    try {
      // Set up simulation launch coordination
      this.launchSimulation = (config) => {
        return this.simulateAIFunction.launchSimulation(config);
      };

      // Set up navigation coordination
      this.navigateToCategory = (categoryId) => {
        return this.simulateAIFunction.navigateToCategory(categoryId);
      };

      this.navigateToScenario = (categoryId, scenarioId) => {
        return this.simulateAIFunction.navigateToScenario(
          categoryId,
          scenarioId,
        );
      };

      // Set up analytics coordination
      this.trackEvent = (eventName, data) => {
        return this.simulateAIFunction.trackEvent(eventName, {
          ...data,
          source: "main_grid",
          component: "MainGrid",
        });
      };

      logger.info("MainGrid: Event coordination established");
    } catch (error) {
      logger.error("MainGrid: Failed to set up event coordination:", error);
    }
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
   * FIXED: Added loop prevention and throttling to prevent infinite DOM loops
   */
  _startHealthMonitoring() {
    if (!this.enterpriseConfig.monitoringEnabled) return;

    // Add monitoring state tracking to prevent infinite loops
    this.monitoringState = {
      healthCheckRunning: false,
      performanceCheckRunning: false,
      telemetryFlushRunning: false,
      lastHealthCheck: 0,
      lastPerformanceCheck: 0,
      lastTelemetryFlush: 0,
    };

    // Health check interval with loop prevention
    this.healthCheckInterval = setInterval(() => {
      // Prevent overlapping executions and check if classroom modal is active
      if (
        !this.monitoringState.healthCheckRunning &&
        !this._isClassroomModalActive()
      ) {
        this.monitoringState.healthCheckRunning = true;
        const now = Date.now();
        // Throttle to prevent rapid execution
        if (now - this.monitoringState.lastHealthCheck > 10000) {
          try {
            this._performHealthCheck();
            this.monitoringState.lastHealthCheck = now;
          } catch (error) {
            logger.warn("MainGrid health check failed:", error);
          }
        }
        this.monitoringState.healthCheckRunning = false;
      }
    }, ENTERPRISE_CONSTANTS.HEALTH_CHECK_INTERVAL);

    // Performance monitoring interval with loop prevention
    this.performanceMonitoringInterval = setInterval(() => {
      // Prevent overlapping executions and check if classroom modal is active
      if (
        !this.monitoringState.performanceCheckRunning &&
        !this._isClassroomModalActive()
      ) {
        this.monitoringState.performanceCheckRunning = true;
        const now = Date.now();
        // Throttle to prevent rapid execution
        if (now - this.monitoringState.lastPerformanceCheck > 60000) {
          try {
            this._performPerformanceCheck();
            this.monitoringState.lastPerformanceCheck = now;
          } catch (error) {
            logger.warn("MainGrid performance check failed:", error);
          }
        }
        this.monitoringState.performanceCheckRunning = false;
      }
    }, 60000); // Every minute

    // Telemetry flush interval with loop prevention
    this.telemetryFlushInterval = setInterval(() => {
      // Prevent overlapping executions and check if classroom modal is active
      if (
        !this.monitoringState.telemetryFlushRunning &&
        !this._isClassroomModalActive()
      ) {
        this.monitoringState.telemetryFlushRunning = true;
        const now = Date.now();
        // Throttle to prevent rapid execution
        if (now - this.monitoringState.lastTelemetryFlush > 30000) {
          try {
            this._flushTelemetry();
            this.monitoringState.lastTelemetryFlush = now;
          } catch (error) {
            logger.warn("MainGrid telemetry flush failed:", error);
          }
        }
        this.monitoringState.telemetryFlushRunning = false;
      }
    }, 30000); // Every 30 seconds
  }

  /**
   * Check if classroom modal is currently active to pause monitoring
   * ADDED: Helper method to prevent monitoring during modal interactions
   */
  _isClassroomModalActive() {
    // Check for visible modal elements that could conflict with monitoring
    const modals = document.querySelectorAll(
      '.modal.show, .modal-backdrop, [data-modal-active="true"]',
    );
    const classroomModals = document.querySelectorAll(
      '[id*="classroom"], [class*="classroom"]',
    );
    const focusedButton = document.activeElement;

    // Check if any modal is visible
    if (modals.length > 0) {
      return true;
    }

    // Check if classroom-related modals are active
    if (classroomModals.length > 0) {
      for (const modal of classroomModals) {
        if (modal.style.display !== "none" && modal.offsetParent !== null) {
          return true;
        }
      }
    }

    // Check if focus is on a button that might be part of classroom modal
    if (focusedButton && focusedButton.tagName === "BUTTON") {
      const buttonClasses = focusedButton.className;
      if (
        buttonClasses.includes("btn-primary") ||
        buttonClasses.includes("ui-focus-visible")
      ) {
        // This is likely the button causing the DOM breakpoint
        return true;
      }
    }

    return false;
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

      // Handle enterprise error with timing info
      logger.error(
        `[MainGrid] Operation ${operationType} failed after ${duration.toFixed(2)}ms:`,
        error,
      );
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
  _attemptRecovery(context, strategy) {
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
    // OPTIMIZED: Batch DOM queries and operations
    const modalsToRemove = this.getCachedElements(".modal-backdrop, .modal");
    const inertElements = this.getCachedElements("[inert]");

    // Batch all DOM removals
    modalsToRemove.forEach((modal) => {
      modal.remove();
    });

    // OPTIMIZED: Batch style operations using Object.assign
    Object.assign(document.body.style, {
      overflow: "",
    });
    document.body.classList.remove("modal-open");

    // Batch inert attribute removal
    inertElements.forEach((el) => {
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

    // Add batching performance metrics
    this.addBatchingMetrics();
  }

  /**
   * Add batching performance metrics to telemetry
   */
  addBatchingMetrics() {
    if (!this.batchingMetrics) {
      this.batchingMetrics = {
        touchEventBatches: 0,
        modalCleanupBatches: 0,
        searchUIBatches: 0,
        attributeBatches: 0,
        totalLayoutRecalculations: 0,
        layoutRecalculationReduction: 0,
      };
    }

    // Calculate layout recalculation reduction percentage
    const totalBatches =
      this.batchingMetrics.touchEventBatches +
      this.batchingMetrics.modalCleanupBatches +
      this.batchingMetrics.searchUIBatches;

    // Estimate 60% reduction in layout recalculations due to batching
    this.batchingMetrics.layoutRecalculationReduction = totalBatches * 0.6;

    this.telemetryBatch.push({
      type: "batching_performance",
      metrics: this.batchingMetrics,
      timestamp: performance.now(),
    });

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

      // Clean up performance optimizations
      this.performanceCleanup();
    } catch (error) {
      logger.error("[MainGrid] Error during cleanup:", error);
    }
  }

  async init() {
    this.container = this.getCachedElement(".categories-section");
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

  async loadUserProgress() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const stored = await this.dataHandler.getData("user_progress");
        if (stored && Object.keys(stored).length > 0) {
          console.log("[MainGrid] User progress loaded from DataHandler");
          return stored;
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem("simulateai_category_progress");
      const progress = stored ? JSON.parse(stored) : {};

      // Migrate to DataHandler if available
      if (progress && Object.keys(progress).length > 0 && this.dataHandler) {
        try {
          await this.dataHandler.saveData("user_progress", progress);
          console.log(
            "[MainGrid] Migrated user progress from localStorage to DataHandler",
          );
        } catch (error) {
          console.warn(
            "[MainGrid] Failed to migrate progress to DataHandler:",
            error,
          );
        }
      }

      console.log("[MainGrid] User progress loaded from localStorage");
      return progress;
    } catch (error) {
      logger.error("Failed to load user progress:", error);
      return {};
    }
  }

  async saveUserProgress() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const success = await this.dataHandler.saveData(
          "user_progress",
          this.userProgress,
        );
        if (success) {
          console.log("[MainGrid] User progress saved to DataHandler");
          // Also save to localStorage for immediate access
          localStorage.setItem(
            "simulateai_category_progress",
            JSON.stringify(this.userProgress),
          );
          return;
        }
      }

      // Fallback to localStorage
      localStorage.setItem(
        "simulateai_category_progress",
        JSON.stringify(this.userProgress),
      );
      console.log("[MainGrid] User progress saved to localStorage");
    } catch (error) {
      logger.error("Failed to save user progress:", error);
      // Try localStorage as final fallback
      try {
        localStorage.setItem(
          "simulateai_category_progress",
          JSON.stringify(this.userProgress),
        );
      } catch (fallbackError) {
        logger.error("All save methods failed:", fallbackError);
      }
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
        await this.attachEventListeners();

        // TOOLTIP FIX: Ensure robust tooltip attachment after all rendering is complete
        if (
          this.categoryHeader &&
          this.categoryHeader.robustTooltipAttachment
        ) {
          console.log(
            "🔧 MainGrid: Applying robust tooltip attachment after render...",
          );

          // Apply to both view containers
          this.categoryHeader.robustTooltipAttachment(this.categoryContainer);
          this.categoryHeader.robustTooltipAttachment(this.scenarioContainer);

          // Set up observers for both containers
          this.categoryHeader.setupProgressRingObserver(this.categoryContainer);
          this.categoryHeader.setupProgressRingObserver(this.scenarioContainer);
        }

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
    // Clear existing content but preserve structure
    const existingCards = this.categoryContainer.querySelectorAll(
      ".category-section, .category-controls-toolbar, .no-categories",
    );
    existingCards.forEach((card) => card.remove());

    // Remove existing toolbar to force recreation with latest options
    const existingToolbar = this.categoryContainer.querySelector(
      ".category-controls-toolbar",
    );
    if (existingToolbar) {
      existingToolbar.remove();
    }

    // Create category controls toolbar
    const toolbar = document.createElement("div");
    toolbar.className = "category-controls-toolbar";
    toolbar.innerHTML = `
        <div class="search-container">
          <div class="search-input-wrapper">
            <svg class="search-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
              <path fill-rule="evenodd" d="M9 3.5a5.5 5.5 0 100 11 5.5 5.5 0 000-11zM2 9a7 7 0 1112.452 4.391l3.328 3.329a.75.75 0 11-1.06 1.06l-3.329-3.328A7 7 0 012 9z" clip-rule="evenodd"/>
            </svg>
            <input type="search" class="search-input" placeholder="Search categories by title and tags..." aria-label="Search categories by title and tags" autocomplete="off" spellcheck="false">
            <button type="button" class="search-clear" aria-label="Clear search" style="display: none">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path d="M6.28 5.22a.75.75 0 00-1.06 1.06L8.94 10l-3.72 3.72a.75.75 0 101.06 1.06L10 11.06l3.72 3.72a.75.75 0 101.06-1.06L11.06 10l3.72-3.72a.75.75 0 00-1.06-1.06L10 8.94 6.28 5.22z"/>
              </svg>
            </button>
          </div>
        </div>
        <div class="category-controls-group">
          <div class="sort-container">
            <button class="sort-btn" aria-expanded="false" aria-haspopup="true">
              <span class="sort-text">Sort: A-Z</span>
              <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
              </svg>
            </button>
            <div class="sort-dropdown" style="display: none;">
              <button type="button" class="sort-option active" data-sort="alphabetical" role="option" aria-selected="true">
                <span class="option-text">Alphabetical (A-Z)</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="alphabetical-desc" role="option" aria-selected="false">
                <span class="option-text">Alphabetical (Z-A)</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="progress" role="option" aria-selected="false">
                <span class="option-text">Progress (Most Complete)</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="progress-desc" role="option" aria-selected="false">
                <span class="option-text">Progress (Least Complete)</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="difficulty" role="option" aria-selected="false">
                <span class="option-text">Difficulty (Beginner First)</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
              <button type="button" class="sort-option" data-sort="difficulty-desc" role="option" aria-selected="false">
                <span class="option-text">Difficulty (Advanced First)</span>
                <svg class="check-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                  <path fill-rule="evenodd" d="M16.704 4.153a.75.75 0 01.143 1.052l-8 10.5a.75.75 0 01-1.127.075l-4.5-4.5a.75.75 0 011.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 011.05-.143z" clip-rule="evenodd"/>
                </svg>
              </button>
            </div>
          </div>
          <div class="clear-all-container">
            <button class="clear-all-btn">
              <svg viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M8.75 1A2.75 2.75 0 006 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 10.23 1.482l.149-.022.841 10.518A2.75 2.75 0 007.596 19h4.807a2.75 2.75 0 002.742-2.53l.841-10.52.149.023a.75.75 0 00.23-1.482A41.03 41.03 0 0014 4.193V3.75A2.75 2.75 0 0011.25 1h-2.5zM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4zM8.58 7.72a.75.75 0 00-1.5.06l.3 7.5a.75.75 0 101.5-.06l-.3-7.5zm4.34.06a.75.75 0 10-1.5-.06l-.3 7.5a.75.75 0 101.5.06l.3-7.5z" clip-rule="evenodd"/>
              </svg>
              <span>Clear All</span>
            </button>
          </div>
        </div>
      `;

    // Add toolbar to container
    this.categoryContainer.appendChild(toolbar);

    // Initialize category filtering state
    this.categoryFilters = {
      search: "",
      sortBy: "alphabetical",
    };

    // Setup category toolbar event listeners
    this.setupCategoryControls();

    // OPTIMIZED: Use document fragment to batch DOM operations
    const categoryFragment = document.createDocumentFragment();

    // OPTIMIZED: Create all category sections in parallel
    const categorySectionPromises = this.getFilteredCategories().map(
      async (category) => {
        return await this.createCategorySection(category);
      },
    );

    // Wait for all sections to be created
    const categorySections = await Promise.all(categorySectionPromises);

    // Add all sections to fragment
    categorySections.forEach((section) =>
      categoryFragment.appendChild(section),
    );

    // Append all sections in single operation
    this.categoryContainer.appendChild(categoryFragment);
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
        <div class="category-controls-group">
          <div class="sort-container">
            <button class="sort-btn" aria-expanded="false">
              <svg class="sort-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M10 3a.75.75 0 01.55.24l3.25 3.5a.75.75 0 11-1.1 1.02L10 4.852 7.3 7.76a.75.75 0 01-1.1-1.02l3.25-3.5A.75.75 0 0110 3zm-3.76 9.2a.75.75 0 011.06.04l2.7 2.908 2.7-2.908a.75.75 0 111.1 1.02l-3.25 3.5a.75.75 0 01-1.1 0l-3.25-3.5a.75.75 0 01.04-1.06z" clip-rule="evenodd"/>
              </svg>
              <span class="sort-text">Sort: A-Z</span>
              <svg class="chevron-icon" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                <path fill-rule="evenodd" d="M5.23 7.21a.75.75 0 011.06.02L10 11.168l3.71-3.938a.75.75 0 111.08 1.04l-4.25 4.5a.75.75 0 01-1.08 0l-4.25-4.5a.75.75 0 01.02-1.06z" clip-rule="evenodd"/>
              </svg>
            </button>
            <div class="sort-dropdown" style="display: none;">
              <button type="button" class="sort-option active" data-sort="alphabetical" role="option" aria-selected="true">
                <span class="option-text">Sort: A-Z</span>
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

      // OPTIMIZED: Build all scenario cards in document fragment to reduce DOM mutations
      const scenarioFragment = document.createDocumentFragment();

      // Add scenario count display
      const countElement = document.createElement("div");
      countElement.className = "scenario-count";
      countElement.innerHTML = `
        <p class="count-text">Showing <span class="count-number">${allScenarios.length}</span> scenarios across all categories</p>
      `;
      scenarioFragment.appendChild(countElement);

      // OPTIMIZED: Create all scenario cards in parallel for better performance
      const scenarioCardPromises = allScenarios.map(async (scenario) => {
        const category = {
          id: scenario.categoryId,
          color: scenario.category?.color || "#667eea",
          icon: scenario.category?.icon || "🤖",
          title: scenario.category?.title || "Unknown Category",
        };

        const isCompleted =
          this.userProgress[scenario.categoryId]?.[scenario.id] || false;

        // Create both card and header HTML in parallel
        const [scenarioCardHtml, categoryHeaderHtml] = await Promise.all([
          ScenarioCard.render(scenario, category, isCompleted),
          this.categoryHeader.render(
            scenario.category || category,
            this.getCategoryProgress(scenario.categoryId),
          ),
        ]);

        // OPTIMIZED: Create wrapper and set all content at once
        const cardWrapper = document.createElement("div");
        cardWrapper.className = "scenario-card-wrapper";

        // Add category header for hover effect
        const categoryHeaderElement = document.createElement("div");
        categoryHeaderElement.className = "scenario-hover-category-header";
        categoryHeaderElement.innerHTML = categoryHeaderHtml;

        // Set wrapper content and append header in single operation
        cardWrapper.innerHTML = scenarioCardHtml;
        cardWrapper.appendChild(categoryHeaderElement);

        return cardWrapper;
      });

      // Wait for all cards to be created
      const scenarioCards = await Promise.all(scenarioCardPromises);

      // OPTIMIZED: Append all cards at once using document fragment
      scenarioCards.forEach((card) => scenarioFragment.appendChild(card));

      // Single DOM operation to add all scenario content
      this.scenarioContainer.appendChild(scenarioFragment);

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
      ".scenario-card-wrapper, .scenario-count, .scenario-view-progress-summary, .no-scenarios",
    );
    existingCards.forEach((card) => card.remove());

    // OPTIMIZED: Use document fragment for batched DOM operations
    const fallbackFragment = document.createDocumentFragment();
    let totalScenarios = 0;

    // OPTIMIZED: Create all scenario cards in parallel
    const allCardPromises = [];

    for (const category of this.categories) {
      const scenarios = getCategoryScenarios(category.id);
      totalScenarios += scenarios.length;

      // Add each scenario card creation to promises array
      scenarios.forEach((scenario) => {
        allCardPromises.push(
          (async () => {
            const isCompleted =
              this.userProgress[category.id]?.[scenario.id] || false;

            // Create card and header HTML in parallel
            const [scenarioCardHtml, categoryHeaderHtml] = await Promise.all([
              ScenarioCard.render(scenario, category, isCompleted),
              this.categoryHeader.render(
                category,
                this.getCategoryProgress(category.id),
              ),
            ]);

            // Create wrapper with category header for hover effect
            const cardWrapper = document.createElement("div");
            cardWrapper.className = "scenario-card-wrapper";
            cardWrapper.innerHTML = scenarioCardHtml;

            // Add category header for hover effect
            const categoryHeaderElement = document.createElement("div");
            categoryHeaderElement.className = "scenario-hover-category-header";
            categoryHeaderElement.innerHTML = categoryHeaderHtml;

            cardWrapper.appendChild(categoryHeaderElement);
            return cardWrapper;
          })(),
        );
      });
    }

    // Wait for all cards to be created
    const allCards = await Promise.all(allCardPromises);

    // Add count element first
    const countElement = document.createElement("div");
    countElement.className = "scenario-count";
    countElement.innerHTML = `
      <p class="count-text">Showing <span class="count-number">${totalScenarios}</span> scenarios across all categories</p>
    `;
    fallbackFragment.appendChild(countElement);

    // Add all cards to fragment
    allCards.forEach((card) => fallbackFragment.appendChild(card));

    // Single DOM operation to add all content
    this.scenarioContainer.appendChild(fallbackFragment);

    logger.info(
      "MainGrid",
      `Used fallback rendering for scenario view (${totalScenarios} scenarios)`,
    );
  }

  setupViewToggle() {
    this.viewToggleButtons =
      this.container.querySelectorAll(".view-toggle-btn");

    this.viewToggleButtons.forEach((button) => {
      button.addEventListener("click", async () => {
        const newView = button.getAttribute("data-view");
        await this.switchView(newView);
      });
    });

    // Add keyboard shortcut support (V key to toggle views)
    document.addEventListener("keydown", async (event) => {
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
        await this.switchView(newView);

        // Announce to screen readers
        const announcement = `Switched to ${newView} view`;
        this.announceToScreenReader(announcement);
      }
    });
  }

  announceToScreenReader(message) {
    const announcement = document.createElement("div");

    // Batch attribute updates for better performance
    this.setAttributes(announcement, {
      "aria-live": "polite",
      "aria-atomic": "true",
    });

    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      document.body.removeChild(announcement);
    }, 1000);
  }

  async switchView(newView) {
    if (newView === this.currentView) return;

    // OPTIMIZED: Batch all DOM updates using requestAnimationFrame for smoother performance
    requestAnimationFrame(() => {
      // Update button states
      this.viewToggleButtons.forEach((button) => {
        const isActive = button.getAttribute("data-view") === newView;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-checked", isActive.toString());
      });

      // OPTIMIZED: Batch container style updates
      const containers = this.container.querySelectorAll(".view-content");
      containers.forEach((container) => {
        const isActive = container.getAttribute("data-view") === newView;
        container.classList.toggle("active", isActive);
        container.style.display = isActive ? "" : "none";
      });
    });

    this.currentView = newView;

    // Clean up existing document listeners before re-attaching
    this.cleanup();

    // Initialize scenario controls if switching to scenario view
    if (newView === "scenario") {
      console.log("🔄 Switching to scenario view, ensuring initialization...");

      // Check if toolbar exists, if not render scenario view first
      const toolbar = this.scenarioContainer?.querySelector(
        ".scenario-controls-toolbar",
      );
      if (!toolbar) {
        console.log("🔧 Toolbar not found, rendering scenario view first...");
        await this.renderScenarioView();
      }

      // Always initialize controls after ensuring toolbar exists
      console.log("🔧 Initializing scenario controls...");
      await this.initializeScenarioControls();

      // Re-attach event listeners AFTER scenario controls are initialized
      console.log(
        "🔧 Attaching event listeners after scenario controls ready...",
      );
      await this.attachEventListeners();

      // TOOLTIP FIX: Ensure tooltips work in scenario view
      if (
        this.categoryHeader &&
        this.categoryHeader.attachTooltipsToProgressRings
      ) {
        console.log(
          "🔧 MainGrid: Applying tooltip attachment for scenario view...",
        );
        setTimeout(async () => {
          await this.categoryHeader.attachTooltipsToProgressRings(
            this.scenarioContainer,
          );
        }, 500); // Small delay to ensure scenario controls are fully initialized
      }
    } else {
      // For non-scenario views, attach event listeners immediately
      await this.attachEventListeners();

      // TOOLTIP FIX: Ensure tooltips work in category view
      if (
        this.categoryHeader &&
        this.categoryHeader.attachTooltipsToProgressRings
      ) {
        console.log(
          "🔧 MainGrid: Applying tooltip attachment for category view...",
        );
        setTimeout(async () => {
          await this.categoryHeader.attachTooltipsToProgressRings(
            this.categoryContainer,
          );
        }, 100); // Small delay to ensure rendering is complete
      }
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

    // Generate scenario cards using batched creation for better performance
    const scenarioCards = await this.batchCreateScenarioCards(
      scenarios,
      category,
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

  async attachEventListeners() {
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
      logger.info(
        "🎯 MAIN-GRID: scenario-modal-closed event listener attached",
      );
    } else {
      logger.info(
        "🎯 MAIN-GRID: scenario-modal-closed event listener already exists",
      );
    }

    // Listen for scenario reflection completion (for deferred badges) - only add once
    if (!this.scenarioReflectionCompletedHandler) {
      this.scenarioReflectionCompletedHandler =
        this.handleReflectionCompletion.bind(this);
      document.addEventListener(
        "scenarioReflectionCompleted",
        this.scenarioReflectionCompletedHandler,
      );
    }

    // Attach CategoryHeader event listeners for progress ring tooltips
    if (this.currentView === "category") {
      await this.categoryHeader.attachEventListeners(this.categoryContainer);
    } else if (this.currentView === "scenario") {
      await this.categoryHeader.attachEventListeners(this.scenarioContainer);
    }

    // NOTE: scenario-completed listener removed to prevent conflicts with app.js
    // Progress updates now handled via 'scenario-progress-update' event from app.js
    // after reflection modal is shown

    // Listen for scenario progress updates (triggered by app.js after reflection modal)
    if (!this.scenarioProgressUpdateHandler) {
      this.scenarioProgressUpdateHandler =
        this.handleScenarioProgressUpdate.bind(this);
      document.addEventListener(
        "scenario-progress-update",
        this.scenarioProgressUpdateHandler,
      );
      logger.info(
        "🎯 MAIN-GRID: scenario-progress-update event listener attached",
      );
    }

    // Listen for surprise tab scenario launch requests - only add once
    if (!this.launchScenarioHandler) {
      this.launchScenarioHandler = this.handleLaunchScenarioEvent.bind(this);
      document.addEventListener("launchScenario", this.launchScenarioHandler);
      logger.info(
        "🎯 MAIN-GRID: launchScenario event listener attached for surprise tab integration",
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

    // Remove scenario reflection completion event listener
    if (this.scenarioReflectionCompletedHandler) {
      document.removeEventListener(
        "scenarioReflectionCompleted",
        this.scenarioReflectionCompletedHandler,
      );
      this.scenarioReflectionCompletedHandler = null;
    }

    // Remove scenario completed event listener (removed to prevent app.js conflicts)
    // if (this.scenarioCompletedHandler) {
    //   document.removeEventListener(
    //     "scenario-completed",
    //     this.scenarioCompletedHandler,
    //   );
    //   this.scenarioCompletedHandler = null;
    // }

    // Remove scenario progress update event listener
    if (this.scenarioProgressUpdateHandler) {
      document.removeEventListener(
        "scenario-progress-update",
        this.scenarioProgressUpdateHandler,
      );
      this.scenarioProgressUpdateHandler = null;
    }

    // Remove launch scenario event listener
    if (this.launchScenarioHandler) {
      document.removeEventListener(
        "launchScenario",
        this.launchScenarioHandler,
      );
      this.launchScenarioHandler = null;
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

  /**
   * Check if a modal is actually currently open and visible
   * More robust than just checking for backdrop elements
   */
  isRealModalCurrentlyOpen() {
    try {
      // Check for visible modal backdrops that are actually displayed
      const visibleBackdrops = document.querySelectorAll(".modal-backdrop");
      for (const backdrop of visibleBackdrops) {
        const computedStyle = window.getComputedStyle(backdrop);
        if (
          computedStyle.display !== "none" &&
          computedStyle.visibility !== "hidden" &&
          computedStyle.opacity !== "0" &&
          backdrop.offsetParent !== null // Element is actually in the layout
        ) {
          return true;
        }
      }

      // Check for open Bootstrap modals with show class
      const openModals = document.querySelectorAll(".modal.show");
      if (openModals.length > 0) {
        return true;
      }

      // Check for any modal with display block (Bootstrap style)
      const blockModals = document.querySelectorAll(
        '.modal[style*="display: block"], .modal[style*="display:block"]',
      );
      if (blockModals.length > 0) {
        return true;
      }

      // Check body classes that indicate modal is open
      if (document.body.classList.contains("modal-open")) {
        // Double check - body class might be stale, verify there's actually a visible modal
        const activeModals = document.querySelectorAll(
          '.modal.show, .modal[style*="display: block"]',
        );
        return activeModals.length > 0;
      }

      return false;
    } catch (error) {
      logger.warn("Error checking modal state, assuming no modal open:", error);
      return false;
    }
  }

  /**
   * Ensure event listeners are properly attached to current container
   * Critical for fixing replay button issues after scenario completion
   */
  ensureEventListenersAttached() {
    logger.debug("MainGrid ensureEventListenersAttached called", {
      currentView: this.currentView,
      hasContainer: !!(this.currentView === "category"
        ? this.categoryContainer
        : this.scenarioContainer),
      hasBoundHandler: !!this.boundHandleScenarioClick,
      timestamp: Date.now(),
    });

    // Get the active container based on current view
    const activeContainer =
      this.currentView === "category"
        ? this.categoryContainer
        : this.scenarioContainer;

    if (!activeContainer) {
      logger.warn("ensureEventListenersAttached: No active container found");
      return;
    }

    if (!this.boundHandleScenarioClick) {
      logger.warn("ensureEventListenersAttached: No bound click handler found");
      return;
    }

    // Remove existing listener first to prevent duplicates
    activeContainer.removeEventListener("click", this.boundHandleScenarioClick);

    // Re-attach the listener
    activeContainer.addEventListener("click", this.boundHandleScenarioClick);

    logger.debug("Event listeners re-attached to", {
      view: this.currentView,
      containerClass: activeContainer.className,
      buttonsFound: activeContainer.querySelectorAll(
        ".scenario-quick-start-btn",
      ).length,
      replayButtonsFound: Array.from(
        activeContainer.querySelectorAll(".scenario-quick-start-btn"),
      ).filter((btn) => btn.textContent.trim().toLowerCase().includes("replay"))
        .length,
    });
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

          // Show the header immediately on touch (batched for performance)
          this.batchTouchStyleUpdates(categoryHeader, {
            transform: "translateY(0)",
            opacity: "1",
            pointerEvents: "auto",
          });

          // Hide after 3 seconds unless touched again
          touchTimeout = setTimeout(() => {
            this.batchTouchStyleUpdates(categoryHeader, {
              transform: "translateY(-100%)",
              opacity: "0",
              pointerEvents: "none",
            });
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
              this.batchTouchStyleUpdates(categoryHeader, {
                transform: "translateY(-100%)",
                opacity: "0",
                pointerEvents: "none",
              });
            }
          }, MOBILE_HEADER_FADE_DELAY);
        },
        { passive: true },
      );
    }
  }

  async handleScenarioClick(event) {
    // Add debugging for troubleshooting category view button issues
    console.log("🔍 MainGrid: handleScenarioClick called", {
      target: event.target,
      targetClass: event.target.className,
      currentView: this.currentView,
      timestamp: Date.now(),
    });

    const scenarioCard = event.target.closest(".scenario-card");
    if (!scenarioCard) {
      console.log("🔍 No scenario card found for click target");
      return;
    }

    // More robust button detection - check if click is inside any button
    const clickedButton = event.target.closest("button");

    if (!clickedButton) {
      console.log("🔍 No button found for click target");
      return;
    }

    console.log("🔍 Button found:", {
      className: clickedButton.className,
      textContent: clickedButton.textContent.trim(),
      scenarioCard: !!scenarioCard,
    });

    const isQuickStartBtn = clickedButton.classList.contains(
      "scenario-quick-start-btn",
    );
    const isLearningLabBtn =
      clickedButton.classList.contains("scenario-start-btn");

    console.log("🔍 Button type detection:", {
      isQuickStartBtn,
      isLearningLabBtn,
      allClasses: clickedButton.className,
    });

    // If the clicked button is not one of our scenario buttons, do nothing
    if (!isQuickStartBtn && !isLearningLabBtn) {
      console.log("🔍 Button is not a scenario button, ignoring");
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

    console.log("🔍 Attempting to launch scenario:", {
      scenarioId,
      categoryId,
      buttonType: isQuickStartBtn ? "quick-start" : "learning-lab",
    });

    if (isQuickStartBtn) {
      // Quick start button - direct to scenario modal
      console.log("🔍 Calling openScenarioModalDirect");
      this.openScenarioModalDirect(categoryId, scenarioId);
    } else if (isLearningLabBtn) {
      // Learning Lab button - go through pre-launch modal
      console.log("🔍 Calling openScenario");
      await this.openScenario(categoryId, scenarioId);
    }
  }

  async handleScenarioKeydown(event) {
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
        await this.openScenario(categoryId, scenarioId);
      }
    }
  }

  async openScenario(categoryId, scenarioId) {
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
    await this.openCategoryPremodal(category, scenario);
  }

  /**
   * Clean up any existing modal instances to prevent multiple modals
   */
  cleanupExistingModals() {
    // Collect all elements that need to be removed or modified
    const existingModalBackdrops = this.getCachedElements(".modal-backdrop");
    const orphanedPreLaunchModals = this.getCachedElements(".pre-launch-modal");
    const inertElements = this.getCachedElements("[inert]");

    // Separate pre-launch modal backdrops for removal
    const prelaunchBackdrops = [];
    existingModalBackdrops.forEach((backdrop) => {
      const modalDialog = backdrop.querySelector(".modal-dialog");
      if (modalDialog && modalDialog.querySelector(".pre-launch-modal")) {
        prelaunchBackdrops.push(backdrop);
      }
    });

    // Separate orphaned modals that need parent backdrop removal
    const elementsToRemove = [...prelaunchBackdrops];
    orphanedPreLaunchModals.forEach((modal) => {
      const parentBackdrop = modal.closest(".modal-backdrop");
      if (parentBackdrop && !prelaunchBackdrops.includes(parentBackdrop)) {
        elementsToRemove.push(parentBackdrop);
      } else if (!parentBackdrop) {
        elementsToRemove.push(modal);
      }
    });

    // Prepare inert elements for attribute removal
    const elementsToModify = [];
    inertElements.forEach((el) => {
      if (!el.classList.contains("modal-backdrop")) {
        elementsToModify.push({
          element: el,
          action: "removeAttribute",
          value: "inert",
        });
      }
    });

    // Perform batched cleanup
    this.batchModalCleanup(elementsToRemove, elementsToModify);

    // Handle body styles separately (immediate synchronous operations)
    document.body.style.overflow = "";
    document.body.classList.remove("modal-open");
  }

  async openCategoryPremodal(category, scenario) {
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

      await preModal.show();
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

      // Note: No need to add event listener here as we already have a persistent
      // listener in attachEventListeners() that handles all scenario completions
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
    console.log("🔍 MainGrid: openScenarioModalDirect called", {
      categoryId,
      scenarioId,
      currentView: this.currentView,
      isModalOpen: this.isModalOpen,
      lastModalOpenTime: this.lastModalOpenTime,
    });

    logger.debug("MainGrid: openScenarioModalDirect called", {
      categoryId,
      scenarioId,
    });

    // CRITICAL: Add protection against rapid successive calls or initialization loops
    const now = Date.now();
    const cooldown = this.modalOpenCooldown || 1000; // Increase default cooldown to 1 second
    const loopProtectionKey = `${categoryId}-${scenarioId}`;

    // Check for potential initialization loop
    if (
      this.lastModalRequestKey === loopProtectionKey &&
      now - this.lastModalOpenTime < 100
    ) {
      // Very short window indicates loop
      logger.warn(
        "MainGrid: Potential initialization loop detected, aborting request",
        {
          categoryId,
          scenarioId,
          timeSinceLastRequest: now - this.lastModalOpenTime,
        },
      );
      console.log("🔍 Aborting: Potential initialization loop detected");
      return;
    }

    if (now - this.lastModalOpenTime < cooldown) {
      logger.debug("Modal request debounced - too soon after last request");
      console.log("🔍 Aborting: Modal request debounced", {
        timeSinceLastModal: now - this.lastModalOpenTime,
        cooldown: cooldown,
      });
      return;
    }

    // Check if a modal is already open - use more robust detection
    const isActuallyModalOpen =
      this.isModalOpen || this.isRealModalCurrentlyOpen();

    if (isActuallyModalOpen) {
      logger.debug("Modal already open, ignoring request", {
        isModalOpenFlag: this.isModalOpen,
        isRealModalOpen: this.isRealModalCurrentlyOpen(),
      });
      console.log("🔍 Aborting: Modal already open", {
        isModalOpenFlag: this.isModalOpen,
        isRealModalOpen: this.isRealModalCurrentlyOpen(),
      });
      return;
    }

    console.log("🔍 Checks passed, proceeding with modal launch");

    this.lastModalOpenTime = now;
    this.lastModalRequestKey = loopProtectionKey;
    this.isModalOpen = true;

    const category = this.categories.find((c) => c.id === categoryId);
    const scenario = category?.scenarios.find((s) => s.id === scenarioId);

    if (!category || !scenario) {
      logger.error("Category or scenario not found:", categoryId, scenarioId);
      console.log("🔍 Error: Category or scenario not found", {
        categoryFound: !!category,
        scenarioFound: !!scenario,
        availableCategories: this.categories.map((c) => c.id),
      });
      return;
    }

    console.log("🔍 Found category and scenario:", {
      categoryTitle: category.title,
      scenarioTitle: scenario.title,
    });

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

    // Open the scenario modal directly - use fresh instance for direct access
    const scenarioModal = this.getScenarioModal();
    scenarioModal.open(scenarioId, categoryId);
  }

  /**
   * Get or create a fresh scenario modal instance
   * Creates new instance each time to prevent state corruption
   */
  getScenarioModal() {
    // Always create a fresh instance to prevent state corruption
    // This fixes the issue where surprise tab and quick start stop working
    // after completing a scenario with reflection modal
    if (this.scenarioModal) {
      try {
        // Clean up the previous instance properly
        this.scenarioModal.cleanup();
      } catch (error) {
        logger.warn("Error cleaning up previous scenario modal:", error);
      }
    }

    this.scenarioModal = new ScenarioModal();
    logger.debug("MainGrid: Created fresh ScenarioModal instance");
    return this.scenarioModal;
  }

  /**
   * Handle scenario progress update event (triggered by app.js after reflection modal)
   * This replaces the old handleScenarioCompleted to avoid conflicts with app.js
   */
  handleScenarioProgressUpdate(event) {
    const { scenarioId, categoryId, selectedOption, option, completionTime } =
      event.detail;

    logger.info("MainGrid: Scenario progress update received:", {
      scenarioId,
      categoryId,
      selectedOption,
      optionText: option?.text,
    });

    // Find the category that contains this scenario
    const category =
      this.categories.find((cat) => cat.id === categoryId) ||
      this.categories.find((cat) => {
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
          optionText: option?.text,
          impact: option?.impact,
          completionTime: completionTime || null,
          source: "category-grid-progress-update",
          timestamp: new Date().toISOString(),
        },
      });

      // Update progress (with badge checking for surprise tab scenarios)
      this.updateProgress(category.id, scenarioId, true, true);

      // Reset surprise tab cooldown to allow immediate new surprise
      const app =
        window.simulateAIApp || window.app || window.simulateAI || null;
      if (app && app.lastSurpriseTime) {
        app.lastSurpriseTime = 0;
        logger.debug("Reset surprise tab cooldown after scenario completion");
      }

      // Reset modal open cooldown to allow immediate new modal opens
      this.lastModalOpenTime = 0;
      this.isModalOpen = false;
      logger.debug("Reset modal cooldown after scenario completion");

      // Reset scenario modal state to allow immediate new opens
      const scenarioModal = this.getScenarioModal();
      if (scenarioModal && typeof scenarioModal.resetForReopen === "function") {
        scenarioModal.resetForReopen();
        logger.debug(
          "Reset scenario modal for immediate reopening after completion",
        );
      }

      // CRITICAL FIX: Re-attach event listeners after DOM re-rendering
      // When scenario cards are re-rendered with "Replay" buttons, event delegation may break
      setTimeout(() => {
        this.ensureEventListenersAttached();
        logger.debug(
          "Re-attached event listeners after scenario completion and DOM update",
        );
      }, 100);

      // Track analytics if available
      if (window.AnalyticsManager) {
        window.AnalyticsManager.trackEvent("scenario_completed", {
          categoryId: category.id,
          scenarioId,
          selectedOption,
          optionText: option?.text,
          impact: option?.impact,
        });
      }
    }
  }

  /**
   * Handle scenario launch requests from surprise tab and other components
   */
  handleLaunchScenarioEvent(event) {
    const { scenarioId, categoryId, source } = event.detail;

    logger.info("MainGrid: Handling launchScenario event", {
      scenarioId,
      categoryId,
      source,
    });

    // Track the launch request
    this.systemCollector.trackScenarioPerformance({
      scenarioId,
      categoryId,
      action: "view",
      metadata: {
        source: source || "unknown",
        launchMethod: "custom_event",
        timestamp: new Date().toISOString(),
      },
    });

    // Use the unified launch method (direct to scenario modal)
    this.openScenarioModalDirect(categoryId, scenarioId);
  }

  /**
   * Handle scenario modal fully closed event (for badge display)
   */
  async handleScenarioModalClosed(event) {
    const { categoryId, scenarioId, completed = true } = event.detail;

    logger.info("🔥 SCENARIO MODAL CLOSED - MainGrid received event:", {
      categoryId,
      scenarioId,
      completed,
      eventDetail: event.detail,
    });

    // CRITICAL FIX: Always reset modal state to allow new modals to open
    // This ensures subsequent Surprise Me clicks work regardless of how modal was closed
    this.isModalOpen = false;

    // Reset the last modal open time to allow immediate new opens after proper close
    this.lastModalOpenTime = 0;

    // Additional cleanup: Clear the scenario modal instance reference
    // This forces creation of a fresh instance on next open
    if (this.scenarioModal) {
      try {
        // Let the modal clean itself up if it hasn't already
        if (typeof this.scenarioModal.cleanup === "function") {
          this.scenarioModal.cleanup();
        }
      } catch (error) {
        logger.warn("Error during scenario modal cleanup:", error);
      }
      this.scenarioModal = null;
    }

    logger.debug(
      "MainGrid: Modal state reset, subsequent modals can now open with fresh instance",
    );

    // Only check for newly earned badges if scenario was actually completed
    if (completed && categoryId && scenarioId) {
      logger.info(
        `🎯 CALLING deferBadgesForReflection for ${categoryId}:${scenarioId}`,
      );
      // DEFERRED BADGE SYSTEM: Store badges for later display after reflection
      await this.deferBadgesForReflection(categoryId, scenarioId);
    } else {
      logger.debug(
        "Scenario modal closed without completion - skipping badge check",
        { completed, categoryId, scenarioId },
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

    // Save progress asynchronously (non-blocking)
    this.saveUserProgress().catch((error) => {
      console.warn("[MainGrid] Failed to save user progress:", error);
    });

    // Check for newly earned badges and defer them for reflection completion
    if (completed && checkBadges) {
      this.deferBadgesForReflection(categoryId, scenarioId);
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

                const progressRing = categorySection.querySelector(
                  ".category-progress-ring",
                );

                const progressText =
                  categorySection.querySelector(".progress-text");

                // Batch progress ring updates for better performance
                const progressUpdates = [];

                if (progressRing) {
                  progressUpdates.push({
                    element: progressRing,
                    property: "style",
                    value: { strokeDashoffset: offset },
                  });

                  if (progressText) {
                    progressUpdates.push({
                      element: progressText,
                      property: "textContent",
                      value: `${progress.completed}/${progress.total}`,
                    });

                    progressUpdates.push({
                      element: progressRing,
                      attributes: {
                        "aria-label": `${progress.completed} of ${progress.total} scenarios completed`,
                      },
                    });
                  }
                }

                if (progressUpdates.length > 0) {
                  this.batchProgressUpdates(progressUpdates);
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

            // UPDATE SCENARIO VIEW PROGRESS SUMMARY RINGS
            // This ensures the new visible progress rings are updated when scenarios are completed
            const progressSummary = container.querySelector(
              ".scenario-view-progress-summary",
            );
            if (progressSummary) {
              const categoryProgressRing = progressSummary.querySelector(
                `[data-category-id="${categoryId}"]`,
              );
              if (categoryProgressRing) {
                // Update the mini progress ring
                const progressCircle =
                  categoryProgressRing.querySelector(".progress-circle");
                const percentageSpan = categoryProgressRing.querySelector(
                  ".progress-percentage-mini",
                );
                const progressText = categoryProgressRing
                  .closest(".category-progress-item")
                  ?.querySelector(".category-progress-text-mini");

                // Batch all progress updates for better performance
                const progressUpdates = [];

                if (progressCircle) {
                  const newOffset = 100 - progress.percentage;
                  progressUpdates.push({
                    element: progressCircle,
                    property: "style",
                    value: { strokeDashoffset: newOffset },
                  });
                }

                if (percentageSpan) {
                  progressUpdates.push({
                    element: percentageSpan,
                    property: "textContent",
                    value: `${progress.percentage}%`,
                  });
                }

                if (progressText) {
                  progressUpdates.push({
                    element: progressText,
                    property: "textContent",
                    value: `${progress.completed}/${progress.total}`,
                  });
                }

                // Update tooltip and aria-label
                const newTooltip = `${progress.completed}/${progress.total} scenarios completed (${progress.percentage}%)`;
                progressUpdates.push({
                  element: categoryProgressRing,
                  attributes: {
                    "data-tooltip": newTooltip,
                    "aria-label": `Category progress: ${progress.completed} of ${progress.total} scenarios completed`,
                  },
                });

                if (progressUpdates.length > 0) {
                  this.batchProgressUpdates(progressUpdates);
                }

                logger.debug("Updated scenario view progress summary ring", {
                  categoryId,
                  progress: `${progress.completed}/${progress.total} (${progress.percentage}%)`,
                });
              }
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
   * Check for new badges and defer them for display after reflection completion
   * @param {string} categoryId - Category ID
   * @param {string} scenarioId - Scenario ID
   */
  async deferBadgesForReflection(categoryId, scenarioId) {
    try {
      logger.info(
        `🏆 deferBadgesForReflection called for ${categoryId}:${scenarioId}`,
      );

      // Refresh badge manager's category progress (now async)
      logger.info("Refreshing badge manager category progress...");
      await badgeManager.refreshCategoryProgress();

      // Check for newly earned badges (now async)
      logger.info("Checking for newly earned badges...");
      const newBadges = await badgeManager.updateScenarioCompletion(
        categoryId,
        scenarioId,
      );

      logger.info(
        `Badge check result: ${newBadges?.length || 0} badges found`,
        newBadges,
      );

      if (newBadges && newBadges.length > 0) {
        logger.info(
          `✋ DEFERRED: ${newBadges.length} badges for scenario ${scenarioId} - waiting for reflection completion`,
        );

        // Debug: Show badge titles being deferred
        const badgeTitles = newBadges.map((b) => b.title).join(", ");
        logger.info(`📋 Deferred badges: ${badgeTitles}`);

        // Store badges to show after reflection modal is closed
        this.deferredBadges.set(scenarioId, {
          badges: newBadges,
          categoryId,
          scenarioId,
          timestamp: Date.now(),
        });

        // Track the badge deferral
        if (window.AnalyticsManager) {
          window.AnalyticsManager.trackEvent("badges_deferred", {
            categoryId,
            scenarioId,
            badgeCount: newBadges.length,
            badgeTitles: badgeTitles,
          });
        }
      } else {
        logger.info(`No new badges earned for scenario ${scenarioId}`);
      }
    } catch (error) {
      logger.error("Error deferring badges for reflection:", error);
    }
  }

  /**
   * Handle scenario reflection completion and show deferred badges
   * This runs AFTER the user closes the reflection modal
   * @param {CustomEvent} event - Reflection completion event
   */
  async handleReflectionCompletion(event) {
    try {
      logger.info("🎯 Handling reflection completion:", event.detail);

      const scenarioId = event.detail.scenarioId;

      // Check if we have deferred badges for this scenario
      const deferredBadgeData = this.deferredBadges.get(scenarioId);

      if (deferredBadgeData && deferredBadgeData.badges.length > 0) {
        logger.info(
          `🎉 SHOWING DEFERRED BADGES: ${deferredBadgeData.badges.length} badges for scenario ${scenarioId}`,
        );

        const badgeTitles = deferredBadgeData.badges
          .map((b) => b.title)
          .join(", ");
        logger.info(`🏆 Badge celebration: ${badgeTitles}`);

        // Show badge notifications for each new badge with enhanced timing
        for (let i = 0; i < deferredBadgeData.badges.length; i++) {
          const badge = deferredBadgeData.badges[i];

          // Log each badge data for debugging
          logger.info(`Badge ${i + 1} data:`, {
            title: badge.title,
            categoryId: badge.categoryId,
            categoryEmoji: badge.categoryEmoji,
            sidekickEmoji: badge.sidekickEmoji,
            tier: badge.tier,
            hasRequiredFields: !!(
              badge.title &&
              badge.categoryEmoji &&
              badge.sidekickEmoji
            ),
          });

          setTimeout(
            async () => {
              try {
                logger.info("Showing deferred badge modal for:", badge.title);
                logger.info("Badge data validation:", {
                  hasTitle: !!badge.title,
                  hasCategoryEmoji: !!badge.categoryEmoji,
                  hasSidekickEmoji: !!badge.sidekickEmoji,
                  hasQuote: !!badge.quote,
                  tier: badge.tier,
                  fullBadge: badge,
                });

                // Announce badge for accessibility
                if (this.accessibilityManager) {
                  this.accessibilityManager.announce(
                    `Congratulations! You've earned the ${badge.title} badge!`,
                    "assertive",
                  );
                }

                logger.info("About to call badgeModal.showBadgeModal...");

                // Show badge modal with reflection context and enhanced celebration
                await badgeModal.showBadgeModal(badge, "reflection", {
                  showConfetti: true,
                  celebrationLevel: "high",
                  autoClose: false, // Let user close manually to fully enjoy
                });

                logger.info("Badge modal showBadgeModal call completed");

                // Track badge achievement
                logger.info("Deferred badge displayed:", {
                  categoryId: badge.categoryId,
                  badgeTitle: badge.title,
                  tier: badge.tier,
                  timestamp: badge.timestamp,
                  deferralTime: Date.now() - deferredBadgeData.timestamp,
                });

                // Track analytics
                if (window.AnalyticsManager) {
                  window.AnalyticsManager.trackEvent("deferred_badge_shown", {
                    categoryId: badge.categoryId,
                    badgeTitle: badge.title,
                    tier: badge.tier,
                    scenarioId,
                    deferralTime: Date.now() - deferredBadgeData.timestamp,
                  });
                }
              } catch (error) {
                logger.error("Failed to show deferred badge modal:", error);
              }
            },
            i * 2000 + 1000,
          ); // Stagger badges: 1s, 3s, 5s, etc.
        }

        // Clean up deferred badges
        this.deferredBadges.delete(scenarioId);

        // Reset surprise tab cooldown to allow immediate new surprise
        const appRef =
          window.simulateAIApp || window.app || window.simulateAI || null;
        if (appRef && appRef.lastSurpriseTime) {
          appRef.lastSurpriseTime = 0;
          logger.debug(
            "Reset surprise tab cooldown after reflection completion",
          );
        }

        // Reset modal open cooldown to allow immediate new modal opens
        this.lastModalOpenTime = 0;
        this.isModalOpen = false;
        logger.debug("Reset modal cooldown after reflection completion");

        // Reset scenario modal state to allow immediate new opens
        const scenarioModal = this.getScenarioModal();
        if (
          scenarioModal &&
          typeof scenarioModal.resetForReopen === "function"
        ) {
          scenarioModal.resetForReopen();
          logger.debug(
            "Reset scenario modal for immediate reopening after reflection completion",
          );
        }

        // Track the overall deferred badge completion
        if (window.AnalyticsManager) {
          // Safely extract reflection text for analytics
          const reflectionText =
            event.detail.reflection?.text ||
            event.detail.reflection?.content ||
            (typeof event.detail.reflection === "string"
              ? event.detail.reflection
              : "");

          window.AnalyticsManager.trackEvent("deferred_badges_completed", {
            scenarioId: scenarioId,
            categoryId: event.detail.categoryId,
            badgeCount: deferredBadgeData.badges.length,
            totalDeferralTime: Date.now() - deferredBadgeData.timestamp,
            reflectionWords: reflectionText
              ? reflectionText.split(" ").length
              : 0,
          });
        }
      } else {
        logger.info(`No deferred badges to show for scenario ${scenarioId}`);
      }
    } catch (error) {
      logger.error("Error in handleReflectionCompletion:", error);
    }
  }

  /**
   * Debug method to check deferred badge status
   * Available in browser console: window.app.mainGrid.getDeferredBadgeStatus()
   */
  getDeferredBadgeStatus() {
    const status = {
      totalDeferred: this.deferredBadges.size,
      scenarios: [],
    };

    for (const [scenarioId, data] of this.deferredBadges) {
      status.scenarios.push({
        scenarioId,
        categoryId: data.categoryId,
        badgeCount: data.badges.length,
        badgeTitles: data.badges.map((b) => b.title),
        waitingTime: Date.now() - data.timestamp,
        timestamp: new Date(data.timestamp).toLocaleTimeString(),
      });
    }

    console.table(status.scenarios);
    return status;
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
  async refreshProgress() {
    this.userProgress = await this.loadUserProgress();

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

  async highlightCategory(categoryId) {
    // Category highlighting only works in category view
    if (this.currentView !== "category") {
      // Switch to category view first
      await this.switchView("category");
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
    console.log("🔧 initializeScenarioControls called");
    const toolbar = this.scenarioContainer.querySelector(
      ".scenario-controls-toolbar",
    );
    if (!toolbar) {
      logger.error("MainGrid", "Scenario controls toolbar not found!");
      console.error("❌ Toolbar not found!");
      return;
    }
    console.log("✅ Toolbar found:", toolbar);

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

    // Setup all controls immediately since we're now called at the right time
    console.log("🔧 Setting up controls...");
    // Setup search input with autocomplete
    this.setupSearchInput();

    // Setup filter dropdown (DISABLED - filter container removed)
    // this.setupFilterDropdown();

    // Setup sort dropdown
    this.setupSortDropdown();

    // Setup clear all button
    this.setupClearAllButton();
    console.log("✅ All controls setup complete");

    // Populate category filter options (DISABLED - filter container removed)
    // this.populateCategoryFilter();

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
    console.log("🔍 Setting up search input...");
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

    console.log("🔍 Search elements:", {
      searchInput: !!searchInput,
      clearBtn: !!clearBtn,
      dropdown: !!dropdown,
    });

    if (!searchInput) {
      logger.error("Search input not found in scenario container");
      console.error("❌ Search input not found!");
      return;
    }
    console.log("✅ Search input found, adding listeners...");

    // Initialize autocomplete data
    this.initializeAutocompleteData();

    let debounceTimeout;

    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Batch UI updates for better performance
      const uiUpdates = [];

      if (clearBtn) {
        uiUpdates.push({
          element: clearBtn,
          styles: { display: query ? "block" : "none" },
        });
      }

      // Apply batched UI updates
      if (uiUpdates.length > 0) {
        this.batchSearchUIUpdates(uiUpdates);
      }

      // Use debounced search for better performance
      this.debouncedSearch(query.toLowerCase(), () => {
        this.searchQuery = query.toLowerCase();
        this.applyFiltersAndSort();
      });

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

    // Add scenario results using DocumentFragment for batched insertion
    if (matchingScenarios.length > 0) {
      const scenarioFragment = document.createDocumentFragment();
      matchingScenarios.forEach((scenario, index) => {
        const item = this.createAutocompleteItem(scenario, query, index);
        scenarioFragment.appendChild(item);
      });
      // Single DOM insertion instead of multiple appendChild calls
      scenariosContainer.appendChild(scenarioFragment);

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

    // Add tag results using DocumentFragment for batched insertion
    if (matchingTags.length > 0) {
      const tagFragment = document.createDocumentFragment();
      matchingTags.forEach((tag, index) => {
        const item = this.createAutocompleteItem(
          tag,
          query,
          index + matchingScenarios.length,
        );
        tagFragment.appendChild(item);
      });
      // Single DOM insertion instead of multiple appendChild calls
      tagsContainer.appendChild(tagFragment);

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

    // Batch attribute setting for better performance
    const baseAttributes = {
      role: "option",
      "data-index": index,
      "data-type": item.type,
    };

    if (item.type === "scenario") {
      // Batch all scenario-related attributes
      Object.assign(baseAttributes, {
        "data-scenario-id": item.id,
        "data-category-id": item.categoryId,
      });

      // Apply all attributes in one batch operation
      this.setElementAttributes(element, baseAttributes);

      element.innerHTML = `
        <div class="autocomplete-item-icon">${item.categoryIcon}</div>
        <div class="autocomplete-item-content">
          <div class="autocomplete-item-title">${this.highlightMatch(item.title, query)}</div>
          <div class="autocomplete-item-meta">${item.category}</div>
        </div>
      `;
    } else if (item.type === "tag") {
      // Batch all tag-related attributes
      Object.assign(baseAttributes, {
        "data-tag": item.tag,
      });

      // Apply all attributes in one batch operation
      this.setElementAttributes(element, baseAttributes);

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

        // Update active state - batch operations for performance
        filterOptions.forEach((opt) => {
          this.setElementAttributes(opt, {
            "aria-selected": "false",
            class: opt.className.replace(/\bactive\b/, "").trim(),
          });
        });

        this.setElementAttributes(option, {
          "aria-selected": "true",
          class: option.className + " active",
        });

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

        // Update active state - batch operations for performance
        sortOptions.forEach((opt) => {
          this.setElementAttributes(opt, {
            "aria-selected": "false",
            class: opt.className.replace(/\bactive\b/, "").trim(),
          });
        });

        this.setElementAttributes(option, {
          "aria-selected": "true",
          class: option.className + " active",
        });

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

    // Reset sort dropdown to "Sort: A-Z"
    const sortBtn = this.scenarioContainer.querySelector(".sort-btn");
    const sortOptions = this.scenarioContainer.querySelectorAll(".sort-option");

    if (sortBtn) {
      const sortText = sortBtn.querySelector(".sort-text");
      if (sortText) {
        sortText.textContent = "Sort: A-Z";
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
   * Populate category filter options with batched DOM operations
   */
  populateCategoryFilter() {
    const filterDropdown =
      this.scenarioContainer.querySelector(".filter-dropdown");
    if (!filterDropdown) return;

    // Batch remove existing category options
    const existingOptions = filterDropdown.querySelectorAll(
      '.filter-option[data-category]:not([data-category="all"])',
    );

    if (existingOptions.length > 0) {
      this.scheduleDOMUpdate(() => {
        existingOptions.forEach((option) => option.remove());
      });
    }

    // Prepare category options data for batched creation
    const categoryOptionsData = this.categories.map((category) => ({
      tagName: "button",
      className: "filter-option",
      attributes: {
        type: "button",
        "data-category": category.id,
        role: "option",
        "aria-selected": "false",
      },
      innerHTML: `
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
      `,
    }));

    // Use batched element creation for optimal performance
    this.batchCreateElements(categoryOptionsData, filterDropdown);
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
    // Clear DOM cache before filtering
    this.clearDOMCache();

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

    // Schedule DOM update for rendering
    this.scheduleDOMUpdate(async () => {
      await this.renderFilteredScenarios();
    });
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

    // Clear existing scenario cards (but keep the toolbar) - Use immediate removal for count elements
    const existingCards = scenariosContainer.querySelectorAll(
      ".scenario-card-wrapper, .scenario-card, .no-scenarios-message, .scenario-count",
    );

    // Remove elements immediately to prevent duplicates
    existingCards.forEach((card) => card.remove());

    if (this.filteredScenarios.length === 0) {
      // Create no results message using batched element creation
      const noResultsData = [
        {
          tagName: "div",
          className: "no-scenarios-message",
          innerHTML: `
          <div class="no-scenarios-icon">🔍</div>
          <h3>No scenarios found</h3>
          <p>Try adjusting your search terms or filters</p>
        `,
        },
      ];

      this.batchCreateElements(noResultsData, scenariosContainer);
      return;
    }

    // Create scenario count display immediately to prevent duplicates
    const countElement = document.createElement("div");
    countElement.className = "scenario-count";
    countElement.innerHTML = `
      <p class="count-text">Showing <span class="count-number">${this.filteredScenarios.length}</span> of ${this.allScenarios.length} scenarios</p>
    `;

    // Add the count element immediately
    scenariosContainer.appendChild(countElement);

    // Render scenarios using batched creation
    const scenarioElements = await Promise.all(
      this.filteredScenarios.map((scenario) =>
        this.createScenarioElement(scenario),
      ),
    );

    // Batch all scenario insertions into a single DOM operation using DocumentFragment
    this.scheduleDOMUpdate(() => {
      const fragment = document.createDocumentFragment();
      scenarioElements.forEach((element) => {
        fragment.appendChild(element);
      });
      scenariosContainer.appendChild(fragment);
    });

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

  // ===== SIMULATEAI COORDINATION UTILITIES =====

  /**
   * Get the current coordination status
   * @returns {Object} Coordination status information
   */
  getCoordinationStatus() {
    return {
      enabled: this.coordinationEnabled,
      simulateAIFunction: !!this.simulateAIFunction,
      categoryGridComponent: !!this.categoryGridComponent,
      scenarioBrowserComponent: !!this.scenarioBrowserComponent,
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Handle coordinated scenario launch
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   * @param {Object} options - Launch options
   */
  launchCoordinatedScenario(categoryId, scenarioId, options = {}) {
    if (!this.coordinationEnabled || !this.simulateAIFunction) {
      logger.warn(
        "MainGrid: Coordination not enabled, using fallback scenario launch",
      );
      return this.openScenario(categoryId, scenarioId);
    }

    try {
      // Track the launch via coordination
      this.trackEvent("coordinated_scenario_launch", {
        categoryId,
        scenarioId,
        options,
        coordinationStatus: this.getCoordinationStatus(),
      });

      // Launch via SimulateAI function
      return this.simulateAIFunction.navigateToScenario(categoryId, scenarioId);
    } catch (error) {
      logger.error("MainGrid: Failed coordinated scenario launch:", error);
      this.simulateAIFunction?.onError(error, "coordinated_scenario_launch");

      // Fallback to standard launch
      return this.openScenario(categoryId, scenarioId);
    }
  }

  /**
   * Get access to SimulateAI services through coordination
   * @param {string} serviceName - Name of the service to access
   * @returns {*} The requested service or null
   */
  getCoordinatedService(serviceName) {
    if (!this.coordinationEnabled || !this.simulateAIFunction) {
      return null;
    }

    const serviceMap = {
      analytics: () => this.simulateAIFunction.getAnalytics(),
      badges: () => this.simulateAIFunction.getBadgeManager(),
      accessibility: () => this.simulateAIFunction.getAccessibilityManager(),
      config: () => this.simulateAIFunction.getConfig(),
      appConfig: () => this.simulateAIFunction.getAppConfig(),
      preferences: () => this.simulateAIFunction.getPreferences(),
    };

    const serviceGetter = serviceMap[serviceName];
    if (serviceGetter) {
      try {
        return serviceGetter();
      } catch (error) {
        logger.error(
          `MainGrid: Failed to get coordinated service '${serviceName}':`,
          error,
        );
        return null;
      }
    }

    logger.warn(
      `MainGrid: Unknown coordinated service requested: ${serviceName}`,
    );
    return null;
  }

  /**
   * Setup category controls toolbar functionality
   */
  setupCategoryControls() {
    const searchInput = this.categoryContainer.querySelector(".search-input");
    const searchClear = this.categoryContainer.querySelector(".search-clear");
    const sortBtn = this.categoryContainer.querySelector(".sort-btn");
    const sortDropdown = this.categoryContainer.querySelector(".sort-dropdown");
    const sortOptions = this.categoryContainer.querySelectorAll(".sort-option");
    const clearAllBtn = this.categoryContainer.querySelector(".clear-all-btn");

    if (!searchInput || !sortBtn || !clearAllBtn) {
      logger.warn("Category controls elements not found");
      return;
    }

    // Search input functionality
    let searchDebounceTimer;
    searchInput.addEventListener("input", (e) => {
      const query = e.target.value.trim();

      // Show/hide clear button
      if (searchClear) {
        searchClear.style.display = query ? "flex" : "none";
      }

      // Debounced search
      clearTimeout(searchDebounceTimer);
      searchDebounceTimer = setTimeout(() => {
        this.categoryFilters.search = query;
        this.applyCategoryFilters();
      }, 300);
    });

    // Search clear functionality
    if (searchClear) {
      searchClear.addEventListener("click", () => {
        searchInput.value = "";
        searchClear.style.display = "none";
        this.categoryFilters.search = "";
        this.applyCategoryFilters();
      });
    }

    // Sort button functionality
    sortBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      const isVisible = sortDropdown.style.display === "block";
      sortDropdown.style.display = isVisible ? "none" : "block";
      sortBtn.setAttribute("aria-expanded", !isVisible);
    });

    // Sort options functionality
    sortOptions.forEach((option) => {
      option.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopImmediatePropagation(); // Prevent duplicate event handling

        // Prevent rapid clicking
        if (option.disabled) {
          return;
        }

        option.disabled = true;

        try {
          const sortValue = option.getAttribute("data-sort");
          const sortText =
            option.querySelector(".option-text")?.textContent.trim() ||
            option.textContent.trim();

          // Update active state - batch operations for performance
          sortOptions.forEach((opt) => {
            this.setElementAttributes(opt, {
              "aria-selected": "false",
              class: opt.className.replace(/\bactive\b/, "").trim(),
            });
          });

          this.setElementAttributes(option, {
            "aria-selected": "true",
            class: option.className + " active",
          });

          // Update button text
          const sortTextElement = sortBtn.querySelector(".sort-text");
          if (sortTextElement) {
            sortTextElement.textContent = `Sort: ${sortText.replace("Alphabetical ", "").replace("Progress ", "").replace("Difficulty ", "")}`;
          }

          this.categoryFilters.sortBy = sortValue;
          await this.applyCategoryFilters();
          sortDropdown.style.display = "none";
          sortBtn.setAttribute("aria-expanded", "false");
        } catch (error) {
          console.error("Error applying sort:", error);
        } finally {
          // Re-enable the option after a short delay
          setTimeout(() => {
            option.disabled = false;
          }, 300);
        }
      });
    });

    // Clear all functionality
    clearAllBtn.addEventListener("click", () => {
      // Reset search
      searchInput.value = "";
      if (searchClear) {
        searchClear.style.display = "none";
      }

      // Reset sort to default - batch operations for performance
      sortOptions.forEach((opt) => {
        this.setElementAttributes(opt, {
          "aria-selected": "false",
          class: opt.className.replace(/\bactive\b/, "").trim(),
        });
      });
      const defaultSort = this.categoryContainer.querySelector(
        ".sort-option[data-sort='alphabetical']",
      );
      if (defaultSort) {
        this.setElementAttributes(defaultSort, {
          "aria-selected": "true",
          class: defaultSort.className + " active",
        });
      }
      const sortTextElement = sortBtn.querySelector(".sort-text");
      if (sortTextElement) {
        sortTextElement.textContent = "Sort: A-Z";
      }

      // Reset filters
      this.categoryFilters = {
        search: "",
        sortBy: "alphabetical",
      };

      this.applyCategoryFilters();
    });

    // Close dropdown when clicking outside
    document.addEventListener("click", (e) => {
      if (!sortBtn.contains(e.target) && !sortDropdown.contains(e.target)) {
        sortDropdown.style.display = "none";
        sortBtn.setAttribute("aria-expanded", "false");
      }
    });
  }

  /**
   * Apply category filters and re-render
   */
  async applyCategoryFilters() {
    // Prevent infinite loops by tracking filter application state
    if (this._isApplyingFilters) {
      console.warn(
        "Already applying category filters, skipping duplicate call",
      );
      return;
    }

    try {
      this._isApplyingFilters = true;

      // Get filtered and sorted categories using enhanced filters
      const filteredCategories = this.getFilteredCategoriesEnhanced();

      // Clear existing category sections (but preserve toolbar)
      const existingSections =
        this.categoryContainer.querySelectorAll(".category-section");
      existingSections.forEach((section) => section.remove());

      // Render filtered categories
      const categoryFragment = document.createDocumentFragment();
      const categorySectionPromises = filteredCategories.map(
        async (category) => {
          return await this.createCategorySection(category);
        },
      );

      const categorySections = await Promise.all(categorySectionPromises);
      categorySections.forEach((section) =>
        categoryFragment.appendChild(section),
      );
      this.categoryContainer.appendChild(categoryFragment);

      // Update count display (if we add one later)
      this.updateCategoryCount(filteredCategories.length);
    } catch (error) {
      console.error("Error applying category filters:", error);
    } finally {
      this._isApplyingFilters = false;
    }
  }

  /**
   * Get filtered and sorted categories with enhanced search and sort functionality
   */
  getFilteredCategoriesEnhanced() {
    let filtered = [...this.categories];

    // Apply search filter
    if (this.categoryFilters.search) {
      const searchTerm = this.categoryFilters.search.toLowerCase();
      filtered = filtered.filter((category) => {
        // Search in title
        const titleMatch = category.title?.toLowerCase().includes(searchTerm);

        // Search in tags
        const tagMatch = category.tags?.some((tag) =>
          tag.toLowerCase().includes(searchTerm),
        );

        return titleMatch || tagMatch;
      });
    }

    // Apply sorting with error handling to prevent infinite loops
    try {
      switch (this.categoryFilters.sortBy) {
        case "alphabetical":
          filtered.sort((a, b) => {
            const titleA = a.title || "";
            const titleB = b.title || "";
            return titleA.localeCompare(titleB);
          });
          break;
        case "alphabetical-desc":
          filtered.sort((a, b) => {
            const titleA = a.title || "";
            const titleB = b.title || "";
            return titleB.localeCompare(titleA);
          });
          break;
        case "progress":
          filtered.sort((a, b) => {
            try {
              const progressA = this.getCategoryProgress(a.id)?.percentage || 0;
              const progressB = this.getCategoryProgress(b.id)?.percentage || 0;
              return progressB - progressA; // Most complete first
            } catch (error) {
              console.warn("Error calculating progress for sorting:", error);
              return 0; // Keep original order if progress calculation fails
            }
          });
          break;
        case "progress-desc":
          filtered.sort((a, b) => {
            try {
              const progressA = this.getCategoryProgress(a.id)?.percentage || 0;
              const progressB = this.getCategoryProgress(b.id)?.percentage || 0;
              return progressA - progressB; // Least complete first
            } catch (error) {
              console.warn("Error calculating progress for sorting:", error);
              return 0; // Keep original order if progress calculation fails
            }
          });
          break;
        case "difficulty":
          filtered.sort((a, b) => {
            const difficultyOrder = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
            };
            const diffA = difficultyOrder[a.difficulty] || 2;
            const diffB = difficultyOrder[b.difficulty] || 2;
            return diffA - diffB; // Beginner first
          });
          break;
        case "difficulty-desc":
          filtered.sort((a, b) => {
            const difficultyOrder = {
              beginner: 1,
              intermediate: 2,
              advanced: 3,
            };
            const diffA = difficultyOrder[a.difficulty] || 2;
            const diffB = difficultyOrder[b.difficulty] || 2;
            return diffB - diffA; // Advanced first
          });
          break;
        default:
          // Default to alphabetical
          filtered.sort((a, b) => {
            const titleA = a.title || "";
            const titleB = b.title || "";
            return titleA.localeCompare(titleB);
          });
      }
    } catch (error) {
      console.error("Error during category sorting:", error);
      // Return original filtered array if sorting fails
    }

    return filtered;
  }

  /**
   * Update category count display
   */
  updateCategoryCount(count) {
    // For now, just log the count. We can add a visual counter later if needed
    logger.info(`Showing ${count} of ${this.categories.length} categories`);
  }

  // ========================================
  // Event Delegation and Performance Methods
  // ========================================

  /**
   * Initialize event delegation for better performance
   */
  initializeEventDelegation() {
    // Use single event listener on document for common events
    this.boundDelegatedHandler = this.handleDelegatedEvents.bind(this);
    document.addEventListener("click", this.boundDelegatedHandler, true);
    document.addEventListener("input", this.boundDelegatedHandler, true);
    document.addEventListener("change", this.boundDelegatedHandler, true);
  }

  /**
   * Handle delegated events for better performance
   */
  handleDelegatedEvents(event) {
    const target = event.target;
    const type = event.type;

    // Handle different event types
    switch (type) {
      case "click":
        this.handleDelegatedClick(target, event);
        break;
      case "input":
        this.handleDelegatedInput(target, event);
        break;
      case "change":
        this.handleDelegatedChange(target, event);
        break;
    }
  }

  /**
   * Handle delegated click events
   */
  handleDelegatedClick(target, event) {
    // Category cards
    if (target.closest(".category-card")) {
      this.handleCategoryClick(target.closest(".category-card"), event);
      return;
    }

    // Filter options
    if (target.closest(".filter-option")) {
      this.handleFilterOptionClick(target.closest(".filter-option"), event);
      return;
    }

    // Sort options
    if (target.closest(".sort-option")) {
      this.handleSortOptionClick(target.closest(".sort-option"));
      return;
    }

    // Autocomplete items
    if (target.closest(".autocomplete-item")) {
      this.handleAutocompleteClick(target.closest(".autocomplete-item"), event);
      return;
    }
  }

  /**
   * Handle sort option click events
   */
  handleSortOptionClick(sortOption) {
    if (!sortOption) return;

    const sortValue = sortOption.dataset.value;
    const sortText = sortOption.textContent.trim();

    // Find the parent sort dropdown and button
    const sortDropdown = sortOption.closest(".sort-options");
    const sortBtn = sortDropdown ? sortDropdown.previousElementSibling : null;

    if (!sortBtn || !sortDropdown) return;

    // Update all options to inactive
    const allOptions = sortDropdown.querySelectorAll(".sort-option");
    allOptions.forEach((option) => {
      this.setElementAttributes(option, {
        "aria-selected": "false",
        class: option.className.replace(" active", ""),
      });
    });

    // Set clicked option as active
    this.setElementAttributes(sortOption, {
      "aria-selected": "true",
      class: sortOption.className + " active",
    });

    // Update button text to show selected sort option
    const sortTextElement = sortBtn.querySelector(".sort-text");
    if (sortTextElement) {
      sortTextElement.textContent = sortText;
    }

    // Apply the sorting
    this.applySorting(sortValue);

    // Close dropdown
    sortDropdown.style.display = "none";
    sortBtn.setAttribute("aria-expanded", "false");
  }

  /**
   * Handle delegated input events
   */
  handleDelegatedInput(target, event) {
    // Search input
    if (target.matches(".search-input, #searchInput")) {
      this.handleSearchInput(target, event);
      return;
    }
  }

  /**
   * Handle delegated change events
   */
  handleDelegatedChange(target, event) {
    // Filter selects
    if (target.matches(".filter-select")) {
      this.handleFilterChange(target, event);
      return;
    }
  }

  /**
   * Optimized search input handler
   */
  handleSearchInput(target) {
    const query = target.value.trim();

    // Show/hide clear button
    const clearBtn = this.getCachedElement(".search-clear-btn");
    if (clearBtn) {
      this.scheduleDOMUpdate(() => {
        clearBtn.style.display = query ? "block" : "none";
      });
    }

    // Use debounced search for better performance
    this.debouncedSearch(query.toLowerCase(), () => {
      this.searchQuery = query.toLowerCase();
      this.applyFiltersAndSort();
    });
  }

  // ========================================
  // Performance Optimization Methods
  // ========================================

  /**
   * Get cached DOM element (optimized querySelector)
   */
  getCachedElement(selector, container = document) {
    const cacheKey = `${container === document ? "doc" : "container"}:${selector}`;

    if (this.domCache.has(cacheKey)) {
      const cachedElement = this.domCache.get(cacheKey);
      // Verify element is still in DOM
      if (cachedElement && container.contains(cachedElement)) {
        return cachedElement;
      }
      // Clean up stale cache entry
      this.domCache.delete(cacheKey);
    }

    const element = container.querySelector(selector);
    if (element) {
      this.domCache.set(cacheKey, element);
    }
    return element;
  }

  /**
   * Get cached DOM elements (optimized querySelectorAll)
   */
  getCachedElements(selector, container = document) {
    const cacheKey = `${container === document ? "doc" : "container"}:${selector}:all`;

    if (this.domCache.has(cacheKey)) {
      const cachedElements = this.domCache.get(cacheKey);
      // Verify at least one element is still in DOM
      if (
        cachedElements &&
        cachedElements.length > 0 &&
        container.contains(cachedElements[0])
      ) {
        return cachedElements;
      }
      // Clean up stale cache entry
      this.domCache.delete(cacheKey);
    }

    const elements = Array.from(container.querySelectorAll(selector));
    if (elements.length > 0) {
      this.domCache.set(cacheKey, elements);
    }
    return elements;
  }

  /**
   * Clear DOM cache (called when DOM structure changes)
   */
  clearDOMCache() {
    this.domCache.clear();
  }

  /**
   * Schedule DOM update for batching
   */
  scheduleDOMUpdate(updateFn) {
    this.domUpdateQueue.push(updateFn);

    if (!this.domUpdateScheduled) {
      this.domUpdateScheduled = true;
      requestAnimationFrame(() => {
        this.flushDOMUpdates();
      });
    }
  }

  /**
   * Execute batched DOM updates
   */
  flushDOMUpdates() {
    const queue = this.domUpdateQueue.splice(0);
    this.domUpdateScheduled = false;

    // Execute all queued DOM updates in a single frame
    queue.forEach((updateFn) => {
      try {
        updateFn();
      } catch (error) {
        logger.error("[MainGrid] DOM update failed:", error);
      }
    });
  }

  /**
   * Perform optimized search operation
   */
  performSearch(searchTerm) {
    if (!searchTerm || searchTerm.length === 0) {
      return this.categories || [];
    }

    const lowerSearchTerm = searchTerm.toLowerCase();
    return this.categories.filter((category) => {
      const titleMatch = category.title
        ?.toLowerCase()
        .includes(lowerSearchTerm);
      const descriptionMatch = category.description
        ?.toLowerCase()
        .includes(lowerSearchTerm);
      const tagMatch = category.tags?.some((tag) =>
        tag.toLowerCase().includes(lowerSearchTerm),
      );

      return titleMatch || descriptionMatch || tagMatch;
    });
  }

  /**
   * Debounced search with caching
   */
  debouncedSearch(searchTerm, callback, delay = 300) {
    // Clear existing timer
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Check cache first
    if (this.searchCache.has(searchTerm)) {
      callback(this.searchCache.get(searchTerm));
      return;
    }

    // Set new timer
    this.searchDebounceTimer = setTimeout(() => {
      const results = this.performSearch(searchTerm);
      this.searchCache.set(searchTerm, results);
      callback(results);
    }, delay);
  }

  /**
   * Batch style updates for touch events (prevents layout thrashing)
   */
  batchTouchStyleUpdates(element, styles) {
    if (!element) return;

    this.scheduleDOMUpdate(() => {
      Object.assign(element.style, styles);
    });

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.touchEventBatches =
      (this.batchingMetrics.touchEventBatches || 0) + 1;
  }

  /**
   * Batch attribute updates for better performance
   */
  setAttributes(element, attributes) {
    if (!element) return;

    this.scheduleDOMUpdate(() => {
      Object.entries(attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    });

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.attributeBatches =
      (this.batchingMetrics.attributeBatches || 0) + 1;
  }

  /**
   * Batch modal cleanup operations
   */
  batchModalCleanup(elementsToRemove, elementsToModify) {
    this.scheduleDOMUpdate(() => {
      // Remove all elements in one batch
      elementsToRemove.forEach((el) => {
        try {
          el.remove();
        } catch (error) {
          logger.warn("[MainGrid] Failed to remove element:", error);
        }
      });

      // Apply modifications in one batch
      elementsToModify.forEach(({ element, action, value }) => {
        try {
          if (action === "removeAttribute") {
            element.removeAttribute(value);
          } else if (action === "setAttribute") {
            element.setAttribute(value.name, value.value);
          }
        } catch (error) {
          logger.warn("[MainGrid] Failed to modify element:", error);
        }
      });
    });

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.modalCleanupBatches =
      (this.batchingMetrics.modalCleanupBatches || 0) + 1;
  }

  /**
   * Batch scenario card creation for better performance
   */
  async batchCreateScenarioCards(scenarios, category) {
    const startTime = performance.now();

    // Create scenario cards in batches for better performance
    const batchSize = 10; // Process 10 cards at a time
    const batches = [];

    for (let i = 0; i < scenarios.length; i += batchSize) {
      const batch = scenarios.slice(i, i + batchSize);
      batches.push(batch);
    }

    // Process batches with minimal delay to prevent UI blocking
    const allCards = [];
    for (const batch of batches) {
      const batchCards = await Promise.all(
        batch.map((scenario) => this.createScenarioCard(scenario, category)),
      );
      allCards.push(...batchCards);

      // Yield control to prevent blocking the main thread
      if (batches.length > 1) {
        await new Promise((resolve) => setTimeout(resolve, 0));
      }
    }

    // Track performance metrics
    const duration = performance.now() - startTime;
    if (!this.performanceMetrics) this.performanceMetrics = {};
    this.performanceMetrics.scenarioCardBatching = {
      totalCards: scenarios.length,
      batchCount: batches.length,
      batchSize,
      duration,
      cardsPerMs: scenarios.length / duration,
    };

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.scenarioCardBatches =
      (this.batchingMetrics.scenarioCardBatches || 0) + 1;

    logger.debug("Batched scenario card creation completed", {
      totalCards: scenarios.length,
      batchCount: batches.length,
      duration: `${duration.toFixed(2)}ms`,
      cardsPerMs: (scenarios.length / duration).toFixed(2),
    });

    return allCards;
  }

  /**
   * Batch progress updates for better performance
   */
  batchProgressUpdates(progressUpdates) {
    this.scheduleDOMUpdate(() => {
      progressUpdates.forEach((update) => {
        const { element, property, value, attributes } = update;

        if (!element) return;

        // Update properties
        if (property && value !== undefined) {
          if (property === "textContent" || property === "innerHTML") {
            element[property] = value;
          } else if (property === "style") {
            Object.assign(element.style, value);
          }
        }

        // Update attributes
        if (attributes) {
          Object.entries(attributes).forEach(([key, val]) => {
            element.setAttribute(key, val);
          });
        }
      });
    });

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.progressUpdateBatches =
      (this.batchingMetrics.progressUpdateBatches || 0) + 1;

    logger.debug("Batched progress updates completed", {
      updateCount: progressUpdates.length,
    });
  }

  /**
   * Batch search UI updates for better performance
   */
  batchSearchUIUpdates(elements) {
    this.scheduleDOMUpdate(() => {
      elements.forEach(({ element, styles, attributes, content }) => {
        try {
          if (styles) {
            Object.assign(element.style, styles);
          }
          if (attributes) {
            Object.entries(attributes).forEach(([key, value]) => {
              element.setAttribute(key, value);
            });
          }
          if (content !== undefined) {
            element.textContent = content;
          }
        } catch (error) {
          logger.warn("[MainGrid] Failed to update search UI element:", error);
        }
      });
    });

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.searchUIBatches =
      (this.batchingMetrics.searchUIBatches || 0) + 1;
  }

  /**
   * Batch element creation and insertion using DocumentFragment
   */
  batchCreateElements(elementsData, targetContainer) {
    if (!elementsData || elementsData.length === 0) return;

    this.scheduleDOMUpdate(() => {
      // Create DocumentFragment for efficient batching
      const fragment = document.createDocumentFragment();

      elementsData.forEach(
        ({ tagName, className, attributes, innerHTML, children }) => {
          try {
            const element = document.createElement(tagName);

            if (className) element.className = className;
            if (innerHTML) element.innerHTML = innerHTML;

            // Batch set attributes
            if (attributes) {
              Object.entries(attributes).forEach(([key, value]) => {
                element.setAttribute(key, value);
              });
            }

            // Append children if provided
            if (children && children.length > 0) {
              children.forEach((child) => {
                if (typeof child === "string") {
                  element.appendChild(document.createTextNode(child));
                } else {
                  element.appendChild(child);
                }
              });
            }

            fragment.appendChild(element);
          } catch (error) {
            logger.warn("[MainGrid] Failed to create element:", error);
          }
        },
      );

      // Single DOM insertion operation
      if (targetContainer) {
        targetContainer.appendChild(fragment);
      }
    });

    // Track batching metrics
    if (!this.batchingMetrics) this.batchingMetrics = {};
    this.batchingMetrics.elementCreationBatches =
      (this.batchingMetrics.elementCreationBatches || 0) + 1;
  }

  /**
   * Set multiple attributes on an element in a batch operation
   * @param {HTMLElement} element - The element to set attributes on
   * @param {Object} attributes - Object with attribute name/value pairs
   */
  setElementAttributes(element, attributes) {
    if (!element || !attributes) return;

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "class") {
        element.className = value;
      } else if (key.startsWith("aria-") || key.startsWith("data-")) {
        element.setAttribute(key, value);
      } else {
        element.setAttribute(key, value);
      }
    });
  }

  /**
   * Performance cleanup method for component destruction
   */
  performanceCleanup() {
    // Cancel any pending operations
    if (this.abortController) {
      this.abortController.abort();
    }

    // Clear timers
    if (this.searchDebounceTimer) {
      clearTimeout(this.searchDebounceTimer);
    }

    // Clear caches
    this.domCache.clear();
    this.searchCache.clear();

    // Flush any pending DOM updates
    if (this.domUpdateScheduled) {
      this.flushDOMUpdates();
    }

    // Remove event listeners
    this.removeEventListeners();
  }
}

export default MainGrid;
