/**
 * Scenario Modal Component - ENTERPRISE EDITION
 * Displays individual ethical scenarios with radar chart visualization
 * Dynamically loads scenario data for all categories
 *
 * ENTERPRISE FEATURES:
 * - Comprehensive error handling and recovery
 * - Performance monitoring and optimization
 * - Health status tracking with circuit breakers
 * - Enterprise-grade telemetry and analytics
 * - Memory usage monitoring and cleanup
 * - Automated error recovery strategies
 * - Real-time health diagnostics
 * - Static utility methods for debugging
 * - Modal state management with reliability
 * - Radar chart initialization monitoring
 */

import logger from "../utils/logger.js";
import RadarChart from "./radar-chart.js";
import scenarioDataManager from "../data/scenario-data-manager.js";
import { getAllCategories } from "../../data/categories.js";
import { typewriterSequence } from "../utils/typewriter.js";
import { loadScenarioModalConfig } from "../utils/scenario-modal-config-loader.js";

class ScenarioModal {
  constructor(options = {}) {
    const startTime = performance.now();

    try {
      logger.info("ScenarioModal", "Constructor called with options:", options);

      // === CONFIGURATION INITIALIZATION ===
      this.config = null; // Will be loaded from JSON SSOT
      this.isConfigLoaded = false;

      // Initialize configuration loading
      this.initializeConfiguration();

      // === ENTERPRISE INITIALIZATION ===
      this.instanceId = `scenario_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.isHealthy = true;
      this.errorCount = 0;
      this.lastError = null;
      this.recoveryAttempts = 0;
      this.createdAt = Date.now();
      this.lastHealthCheck = Date.now();

      // Performance metrics tracking
      this.performanceMetrics = {
        modalOpenCount: 0,
        totalModalOpenTime: 0,
        averageModalOpenTime: 0,
        radarInitCount: 0,
        totalRadarInitTime: 0,
        averageRadarInitTime: 0,
        optionSelectCount: 0,
        totalOptionSelectTime: 0,
        averageOptionSelectTime: 0,
        typewriterCount: 0,
        totalTypewriterTime: 0,
        averageTypewriterTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        lastModalOpenTime: 0,
        lastRadarInitTime: 0,
        scenarioCompletionCount: 0,
      };

      // Circuit breaker for fault tolerance
      this.circuitBreaker = {
        state: "closed", // closed, open, half-open
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
        successCount: 0,
      };

      // Enterprise telemetry batching
      this.telemetryBatch = [];
      this.lastTelemetryFlush = Date.now();

      // Health monitoring intervals
      this.healthCheckInterval = null;
      this.telemetryFlushInterval = null;
      this.heartbeatInterval = null;

      // Track all instances for enterprise monitoring
      if (!ScenarioModal._instances) {
        ScenarioModal._instances = new Set();
      }
      ScenarioModal._instances.add(this);

      // Core modal properties
      this.modal = null;
      this.backdrop = null;
      this.radarChart = null;
      this.currentScenario = null;
      this.selectedOption = null;
      this.currentCategoryId = null;
      this.currentScenarioId = null;
      this.isOpening = false; // Flag to prevent duplicate openings
      this.isClosing = false; // Flag to prevent duplicate closings
      this.wasCompleted = false; // Flag to track if scenario was completed
      this.isTestMode = options.isTestMode || false; // Flag for test scenarios

      // Event handlers
      this.escapeHandler = null; // For keyboard event cleanup

      // Cache for categories and scenarios
      this.categories = getAllCategories();
      this.scenarioData = null;

      // Initialize enterprise monitoring
      this._initializeEnterpriseMonitoring();

      // Track constructor performance
      const constructorTime = performance.now() - startTime;
      this._recordPerformanceMetric("constructor", constructorTime);

      // Log successful initialization
      this._logTelemetry("instance_created", {
        options: Object.keys(options),
        constructorTime: Math.round(constructorTime * 100) / 100,
        categoriesCount: this.categories.length,
      });
    } catch (error) {
      this._handleError(error, "constructor");
      throw error;
    }
  }

  /**
   * Initialize configuration from JSON SSOT
   */
  async initializeConfiguration() {
    try {
      this.config = await loadScenarioModalConfig();
      this.isConfigLoaded = true;
      logger.info("ScenarioModal configuration loaded successfully", {
        hasAnimations: !!this.config.animations,
        hasEnterprise: !!this.config.enterprise,
        hasRadarChart: !!this.config.radarChart,
      });
      return true;
    } catch (error) {
      logger.error("Error loading ScenarioModal configuration:", error);
      this.isConfigLoaded = false;
      return false;
    }
  }

  /**
   * Ensure configuration is loaded before operations
   */
  async ensureConfigLoaded() {
    if (!this.isConfigLoaded || !this.config) {
      await this.initializeConfiguration();
    }
  }

  /**
   * Enterprise monitoring initialization
   * Sets up health checks, telemetry, and error recovery
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Ensure configuration is available, use fallback values if not
      const healthConfig = this.config?.enterprise?.health?.monitoring || {};
      const telemetryConfig =
        this.config?.enterprise?.telemetry?.batching || {};

      // Health check monitoring
      this.healthCheckInterval = setInterval(() => {
        this._performHealthCheck();
      }, healthConfig.checkInterval || 20000);

      // Telemetry batch flushing
      this.telemetryFlushInterval = setInterval(() => {
        this._flushTelemetryBatch();
      }, telemetryConfig.flushInterval || 12000);

      // Heartbeat monitoring
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, healthConfig.heartbeatInterval || 15000);

      // Set up error recovery baseline
      this._establishPerformanceBaseline();

      logger.debug(
        `[ScenarioModal] Enterprise monitoring initialized for instance ${this.instanceId}`,
      );
    } catch (error) {
      this._handleError(error, "_initializeEnterpriseMonitoring");
      // Don't throw here - monitoring failure shouldn't break modal functionality
    }
  }

  /**
   * Enterprise error handling with recovery strategies
   */
  _handleError(error, context = "unknown", retryOperation = null) {
    this.errorCount++;
    this.lastError = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
      instanceId: this.instanceId,
    };

    // Update circuit breaker
    this._updateCircuitBreaker(false);

    // Update individual error rate
    const totalOperations = this.performanceMetrics.modalOpenCount || 1;
    this.performanceMetrics.errorRate =
      Math.round((this.errorCount / totalOperations) * 10000) / 100; // Percentage with 2 decimals

    // Log the error with telemetry
    this._logTelemetry("error_occurred", {
      error: error.message,
      context,
      errorCount: this.errorCount,
      circuitBreakerState: this.circuitBreaker.state,
    });

    // Attempt recovery if within limits
    const errorRecoveryConfig =
      this.config?.enterprise?.errorRecovery?.retry || {};
    const maxRetryAttempts = errorRecoveryConfig.maxRetryAttempts || 3;
    const retryDelay = errorRecoveryConfig.retryDelay || 800;
    const backoffMultiplier = errorRecoveryConfig.backoffMultiplier || 1.5;

    if (this.recoveryAttempts < maxRetryAttempts && retryOperation) {
      this.recoveryAttempts++;
      const calculatedRetryDelay =
        retryDelay * Math.pow(backoffMultiplier, this.recoveryAttempts - 1);

      setTimeout(() => {
        try {
          retryOperation();
          this._updateCircuitBreaker(true); // Success
        } catch (retryError) {
          this._handleError(
            retryError,
            `${context}_retry_${this.recoveryAttempts}`,
          );
        }
      }, calculatedRetryDelay);
    }

    // Update health status
    const healthConfig = this.config?.enterprise?.health?.monitoring || {};
    const failureThreshold = healthConfig.failureThreshold || 3;
    this.isHealthy = this.errorCount < failureThreshold;

    logger.error(`[ScenarioModal] Error in ${context}:`, error);
  }

  /**
   * Performance metrics recording
   */
  _recordPerformanceMetric(operation, duration, additionalData = {}) {
    try {
      const metric = {
        operation,
        duration: Math.round(duration * 100) / 100,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        ...additionalData,
      };

      // Update specific metrics
      switch (operation) {
        case "modal_open":
          this.performanceMetrics.modalOpenCount++;
          this.performanceMetrics.totalModalOpenTime += duration;
          this.performanceMetrics.averageModalOpenTime =
            this.performanceMetrics.totalModalOpenTime /
            this.performanceMetrics.modalOpenCount;
          this.performanceMetrics.lastModalOpenTime = duration;
          break;
        case "radar_init":
          this.performanceMetrics.radarInitCount++;
          this.performanceMetrics.totalRadarInitTime += duration;
          this.performanceMetrics.averageRadarInitTime =
            this.performanceMetrics.totalRadarInitTime /
            this.performanceMetrics.radarInitCount;
          this.performanceMetrics.lastRadarInitTime = duration;
          break;
        case "option_select":
          this.performanceMetrics.optionSelectCount++;
          this.performanceMetrics.totalOptionSelectTime += duration;
          this.performanceMetrics.averageOptionSelectTime =
            this.performanceMetrics.totalOptionSelectTime /
            this.performanceMetrics.optionSelectCount;
          break;
        case "typewriter":
          this.performanceMetrics.typewriterCount++;
          this.performanceMetrics.totalTypewriterTime += duration;
          this.performanceMetrics.averageTypewriterTime =
            this.performanceMetrics.totalTypewriterTime /
            this.performanceMetrics.typewriterCount;
          break;
        case "scenario_completion":
          this.performanceMetrics.scenarioCompletionCount++;
          break;
      }

      // Check performance thresholds
      this._checkPerformanceThresholds(operation, duration);

      // Log telemetry
      this._logTelemetry("performance_metric", metric);
    } catch (error) {
      // Don't let performance tracking break the application
      logger.warn("[ScenarioModal] Error recording performance metric:", error);
    }
  }

  /**
   * Circuit breaker state management
   */
  _updateCircuitBreaker(success) {
    const now = Date.now();
    const circuitBreakerConfig =
      this.config?.enterprise?.circuitBreaker?.faultTolerance || {};
    const successThreshold = circuitBreakerConfig.successThreshold || 2;
    const failureThreshold = circuitBreakerConfig.failureThreshold || 4;
    const recoveryTimeout = circuitBreakerConfig.recoveryTimeout || 30000;

    if (success) {
      if (this.circuitBreaker.state === "half-open") {
        this.circuitBreaker.successCount++;
        if (this.circuitBreaker.successCount >= successThreshold) {
          this.circuitBreaker.state = "closed";
          this.circuitBreaker.failureCount = 0;
          this.circuitBreaker.successCount = 0;
        }
      } else if (this.circuitBreaker.state === "closed") {
        this.circuitBreaker.failureCount = 0;
      }
    } else {
      this.circuitBreaker.failureCount++;
      this.circuitBreaker.lastFailureTime = now;

      if (this.circuitBreaker.failureCount >= failureThreshold) {
        this.circuitBreaker.state = "open";
        this.circuitBreaker.nextAttemptTime = now + recoveryTimeout;
      }
    }

    // Check if circuit should move to half-open
    if (
      this.circuitBreaker.state === "open" &&
      now >= this.circuitBreaker.nextAttemptTime
    ) {
      this.circuitBreaker.state = "half-open";
      this.circuitBreaker.successCount = 0;
    }
  }

  /**
   * Health check performance
   */
  _performHealthCheck() {
    try {
      const healthData = {
        timestamp: Date.now(),
        instanceId: this.instanceId,
        isHealthy: this.isHealthy,
        errorCount: this.errorCount,
        circuitBreakerState: this.circuitBreaker.state,
        memoryUsage: this._getMemoryUsage(),
        performanceMetrics: { ...this.performanceMetrics },
        modalState: {
          isOpen: !!this.modal,
          isOpening: this.isOpening,
          currentScenario: this.currentScenarioId,
          hasRadarChart: !!this.radarChart,
        },
      };

      this.lastHealthCheck = Date.now();
      this._logTelemetry("health_check", healthData);
    } catch (error) {
      this._handleError(error, "_performHealthCheck");
    }
  }

  /**
   * Memory usage monitoring
   */
  _getMemoryUsage() {
    try {
      if (performance.memory) {
        const memoryMB = Math.round(
          performance.memory.usedJSHeapSize / 1024 / 1024,
        );
        this.performanceMetrics.memoryUsage = memoryMB;
        return memoryMB;
      }
      return 0;
    } catch {
      return 0;
    }
  }

  /**
   * Telemetry logging with batching
   */
  _logTelemetry(event, data = {}) {
    try {
      const telemetryEvent = {
        event,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        currentScenario: this.currentScenarioId,
        currentCategory: this.currentCategoryId,
        ...data,
      };

      this.telemetryBatch.push(telemetryEvent);

      // Auto-flush if batch is full
      const telemetryConfig =
        this.config?.enterprise?.telemetry?.batching || {};
      const batchSize = telemetryConfig.batchSize || 8;
      if (this.telemetryBatch.length >= batchSize) {
        this._flushTelemetryBatch();
      }
    } catch (error) {
      // Don't let telemetry errors break functionality
      logger.warn("[ScenarioModal] Telemetry error:", error);
    }
  }

  /**
   * Flush telemetry batch to analytics
   */
  _flushTelemetryBatch() {
    try {
      if (this.telemetryBatch.length === 0) return;

      // Send batch to analytics (placeholder for actual analytics service)
      const batchData = [...this.telemetryBatch];
      this.telemetryBatch = [];

      // In a real implementation, this would send to your analytics service
      logger.debug("[ScenarioModal] Telemetry batch flushed:", {
        batchSize: batchData.length,
        instanceId: this.instanceId,
      });

      this.lastTelemetryFlush = Date.now();
    } catch (error) {
      logger.warn("[ScenarioModal] Error flushing telemetry batch:", error);
    }
  }

  /**
   * Send heartbeat signal
   */
  _sendHeartbeat() {
    this._logTelemetry("heartbeat", {
      uptime: Date.now() - this.createdAt,
      lastHealthCheck: this.lastHealthCheck,
      isHealthy: this.isHealthy,
      modalState: !!this.modal,
    });
  }

  /**
   * Performance threshold monitoring
   */
  _checkPerformanceThresholds(operation, duration) {
    const performanceConfig =
      this.config?.enterprise?.performance?.thresholds || {};

    switch (operation) {
      case "modal_open": {
        const maxModalOpenTime = performanceConfig.maxModalOpenTime || 3000;
        const warningModalOpenTime =
          performanceConfig.warningModalOpenTime || 1500;

        if (duration > maxModalOpenTime) {
          this._logTelemetry("performance_violation", {
            operation,
            duration,
            threshold: maxModalOpenTime,
            severity: "critical",
          });
        } else if (duration > warningModalOpenTime) {
          this._logTelemetry("performance_warning", {
            operation,
            duration,
            threshold: warningModalOpenTime,
            severity: "warning",
          });
        }
        break;
      }
      case "radar_init": {
        const maxRadarInitTime = performanceConfig.maxRadarInitTime || 2000;
        const warningRadarInitTime =
          performanceConfig.warningRadarInitTime || 1000;

        if (duration > maxRadarInitTime) {
          this._logTelemetry("performance_violation", {
            operation,
            duration,
            threshold: maxRadarInitTime,
            severity: "critical",
          });
        } else if (duration > warningRadarInitTime) {
          this._logTelemetry("performance_warning", {
            operation,
            duration,
            threshold: warningRadarInitTime,
            severity: "warning",
          });
        }
        break;
      }
      case "option_select": {
        const maxOptionSelectTime =
          performanceConfig.maxOptionSelectTime || 500;
        if (duration > maxOptionSelectTime) {
          this._logTelemetry("performance_violation", {
            operation,
            duration,
            threshold: maxOptionSelectTime,
            severity: "warning",
          });
        }
        break;
      }
      case "typewriter": {
        const maxTypewriterTime = performanceConfig.maxTypewriterTime || 5000;
        if (duration > maxTypewriterTime) {
          this._logTelemetry("performance_violation", {
            operation,
            duration,
            threshold: maxTypewriterTime,
            severity: "warning",
          });
        }
        break;
      }
    }
  }

  /**
   * Establish performance baseline
   */
  _establishPerformanceBaseline() {
    // Record initial memory usage
    this._getMemoryUsage();

    // Log baseline establishment
    this._logTelemetry("baseline_established", {
      initialMemory: this.performanceMetrics.memoryUsage,
      timestamp: Date.now(),
    });
  }

  /**
   * Enterprise cleanup operations
   */
  _enterpriseCleanup() {
    try {
      // Clear monitoring intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      if (this.telemetryFlushInterval) {
        clearInterval(this.telemetryFlushInterval);
        this.telemetryFlushInterval = null;
      }

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      // Final telemetry flush
      this._flushTelemetryBatch();

      // Log final metrics
      this._logTelemetry("instance_cleanup", {
        finalMetrics: { ...this.performanceMetrics },
        finalHealth: {
          isHealthy: this.isHealthy,
          errorCount: this.errorCount,
          circuitBreakerState: this.circuitBreaker.state,
        },
        uptime: Date.now() - this.createdAt,
      });

      // Remove from instance tracking
      if (ScenarioModal._instances) {
        ScenarioModal._instances.delete(this);
      }

      // Reset state
      this.isHealthy = false;

      logger.debug(
        `[ScenarioModal] Enterprise cleanup completed for instance ${this.instanceId}`,
      );
    } catch (error) {
      logger.error("[ScenarioModal] Error during enterprise cleanup:", error);
    }
  }

  /**
   * Open the modal with a specific scenario - ENTERPRISE EDITION
   * @param {string} scenarioId - The scenario ID to display
   * @param {string} categoryId - The category ID (optional, will be detected if not provided)
   * @param {boolean} isTestMode - Whether this is a test scenario (optional, defaults to false)
   */
  async open(scenarioId, categoryId = null, isTestMode = false) {
    const startTime = performance.now();

    try {
      // Circuit breaker check
      if (this.circuitBreaker.state === "open") {
        const now = Date.now();
        if (now < this.circuitBreaker.nextAttemptTime) {
          this._logTelemetry("open_blocked_circuit_open", {
            scenarioId,
            categoryId,
            nextAttemptTime: this.circuitBreaker.nextAttemptTime,
            currentTime: now,
          });
          throw new Error(
            "Modal open operation blocked: Circuit breaker is open",
          );
        } else {
          this.circuitBreaker.state = "half-open";
          this.circuitBreaker.successCount = 0;
        }
      }

      // Prevent duplicate openings
      if (this.isOpening || this.modal) {
        logger.warn(
          "Modal is already opening or open, ignoring duplicate request",
        );
        this._logTelemetry("open_duplicate_request", {
          scenarioId,
          categoryId,
          isOpening: this.isOpening,
          hasModal: !!this.modal,
        });
        return;
      }

      this.isOpening = true;
      this.wasCompleted = false; // Reset completion flag for new scenario
      this.isTestMode = isTestMode; // Set test mode for this session

      this._logTelemetry("modal_opening_started", {
        scenarioId,
        categoryId,
        isTestMode,
      });

      // Find the category if not provided
      if (!categoryId) {
        categoryId = this.findCategoryForScenario(scenarioId);
        if (!categoryId) {
          const error = new Error(
            `Could not find category for scenario: ${scenarioId}`,
          );
          this._handleError(error, "open_category_not_found");
          throw error;
        }
      }

      // Load scenario data with timing
      const dataLoadStartTime = performance.now();
      this.currentCategoryId = categoryId;
      this.currentScenarioId = scenarioId;
      this.scenarioData = await scenarioDataManager.getScenario(
        categoryId,
        scenarioId,
      );
      const dataLoadTime = performance.now() - dataLoadStartTime;

      if (!this.scenarioData) {
        const error = new Error(
          `Could not load scenario data for: ${categoryId}:${scenarioId}`,
        );
        this._handleError(error, "open_data_load_failed");
        throw error;
      }

      this.currentScenario = this.scenarioData;

      this._logTelemetry("scenario_data_loaded", {
        scenarioId,
        categoryId,
        dataLoadTime: Math.round(dataLoadTime * 100) / 100,
        hasOptions: !!this.scenarioData.options,
        optionsCount: this.scenarioData.options?.length || 0,
      });

      // Create and show modal with timing
      const modalCreateStartTime = performance.now();
      await this.createModal();
      const modalCreateTime = performance.now() - modalCreateStartTime;

      const modalShowStartTime = performance.now();
      await this.show();
      const modalShowTime = performance.now() - modalShowStartTime;

      // Track overall performance
      const totalOpenTime = performance.now() - startTime;
      this._recordPerformanceMetric("modal_open", totalOpenTime, {
        scenarioId,
        categoryId,
        isTestMode,
        dataLoadTime: Math.round(dataLoadTime * 100) / 100,
        modalCreateTime: Math.round(modalCreateTime * 100) / 100,
        modalShowTime: Math.round(modalShowTime * 100) / 100,
      });

      this._updateCircuitBreaker(true); // Success

      this._logTelemetry("modal_opened_successfully", {
        scenarioId,
        categoryId,
        isTestMode,
        totalOpenTime: Math.round(totalOpenTime * 100) / 100,
        dataLoadTime: Math.round(dataLoadTime * 100) / 100,
        modalCreateTime: Math.round(modalCreateTime * 100) / 100,
        modalShowTime: Math.round(modalShowTime * 100) / 100,
      });

      logger.info(
        "ScenarioModal",
        `Opened scenario modal for: ${categoryId}:${scenarioId}${isTestMode ? " (TEST MODE)" : ""} in ${Math.round(totalOpenTime)}ms`,
      );
    } catch (error) {
      this._handleError(error, "open", () =>
        this.open(scenarioId, categoryId, isTestMode),
      );
      logger.error("Failed to open scenario modal:", error);
      alert(`Failed to load scenario: ${scenarioId}. Please try again.`);

      // Ensure cleanup on error to prevent modal from being stuck
      this.cleanup();
      throw error;
    } finally {
      // Reset the opening flag
      this.isOpening = false;
    }
  }

  /**
   * Clean up modal state in case of errors - ENTERPRISE EDITION
   */
  cleanup() {
    try {
      this._logTelemetry("cleanup_started", {
        hasModal: !!this.modal,
        hasBackdrop: !!this.backdrop,
        currentScenario: this.currentScenarioId,
        uptime: Date.now() - this.createdAt,
      });

      if (this.modal) {
        this.modal.remove();
        this.modal = null;
      }
      if (this.backdrop) {
        this.backdrop.remove();
        this.backdrop = null;
      }

      // Clean up radar chart instance first
      if (this.radarChart) {
        try {
          logger.info("ScenarioModal", "Destroying radar chart during cleanup");
          this.radarChart.destroy();
        } catch (e) {
          logger.warn(
            "ScenarioModal",
            "Failed to destroy radar chart during cleanup",
            e,
          );
        }
      }

      // Reset all state flags
      this.isOpening = false;
      this.isClosing = false;
      this.currentScenario = null;
      this.selectedOption = null;
      this.currentCategoryId = null;
      this.currentScenarioId = null;
      this.scenarioData = null;
      this.radarChart = null;

      // Restore body scrolling
      document.body.style.overflow = "";

      // Remove event listeners
      if (this.escapeHandler) {
        document.removeEventListener("keydown", this.escapeHandler);
        this.escapeHandler = null;
      }

      // Perform enterprise cleanup
      this._enterpriseCleanup();

      this._logTelemetry("cleanup_completed", {
        timestamp: Date.now(),
      });
    } catch (error) {
      this._handleError(error, "cleanup");
    }
  }

  /**
   * Find which category contains a specific scenario
   */
  findCategoryForScenario(scenarioId) {
    for (const category of this.categories) {
      if (
        category.scenarios &&
        category.scenarios.some((s) => s.id === scenarioId)
      ) {
        return category.id;
      }
    }
    return null;
  }

  /**
   * Create modal DOM structure
   */
  async createModal() {
    // Remove existing modal if present and wait for it to be fully closed
    await this.closeAndWait();

    // Clean up any orphaned modals or radar chart containers from previous instances
    const existingModals = document.querySelectorAll(
      ".scenario-modal, .scenario-modal-backdrop",
    );
    existingModals.forEach((modal) => {
      logger.info("ScenarioModal", "Removing orphaned modal element");
      modal.remove();
    });

    // Clean up any orphaned radar chart containers with Chart.js instances
    const orphanedChartContainers = document.querySelectorAll(
      "#scenario-radar-chart",
    );
    orphanedChartContainers.forEach((container) => {
      // Use RadarChart's consolidated cleanup utility
      RadarChart.cleanupOrphanedCharts(container);
      container.remove();
    });

    logger.info("ScenarioModal", "Creating scenario modal DOM structure");
    logger.info(
      "Current scenario data:",
      this.currentScenario ? "LOADED" : "NULL",
    );

    // Create modal elements
    this.backdrop = document.createElement("div");
    this.backdrop.className = "scenario-modal-backdrop";

    this.modal = document.createElement("div");
    this.modal.className = "scenario-modal";
    this.modal.innerHTML = this.getModalHTML();

    // Add to DOM
    document.body.appendChild(this.backdrop);
    document.body.appendChild(this.modal);

    logger.info(
      "ScenarioModal",
      "Scenario modal DOM structure created and appended to body",
    );
    logger.info(
      "Modal HTML contains radar chart container:",
      this.modal.innerHTML.includes("scenario-radar-chart"),
    );

    // Attach event listeners
    this.attachEventListeners();
  }

  /**
   * Generate modal HTML content
   */
  getModalHTML() {
    logger.info(
      "getModalHTML called - currentScenario status:",
      this.currentScenario ? "LOADED" : "NULL",
    );

    if (!this.currentScenario) {
      logger.warn("No current scenario data - returning loading message");
      return '<div class="scenario-content"><p>Loading scenario...</p></div>';
    }

    const categoryInfo = this.categories.find(
      (c) => c.id === this.currentCategoryId,
    );
    const categoryTitle = categoryInfo
      ? categoryInfo.title
      : "Unknown Category";

    logger.info(
      "ScenarioModal",
      `Generating HTML for scenario: ${this.currentScenario.title} in category: ${categoryTitle}`,
    );

    const html = `
            <div class="scenario-modal-dialog">
                <div class="scenario-modal-header">
                    <div class="scenario-title-section">
                        <span class="scenario-category">${categoryTitle}</span>
                        <h1 class="scenario-title">${this.currentScenario.title}</h1>
                    </div>
                    <button class="close-button" aria-label="Close modal">
                        <span class="close-icon">×</span>
                    </button>
                </div>

                <div class="scenario-content typewriter-ready">
                    <div class="scenario-main">
                        <div class="scenario-description">
                            <div class="dilemma-section">
                                <h3>The Dilemma</h3>
                                <p class="dilemma-text"></p>
                            </div>

                            <div class="ethical-question-section">
                                <h3>Ethical Question</h3>
                                <p class="ethical-question"></p>
                            </div>
                        </div>

                        <div class="options-section">
                            <h3>Choose Your Approach</h3>
                            <div class="options-container">
                                ${this.renderOptions()}
                            </div>
                        </div>
                    </div>

                    <div class="scenario-sidebar">
                        <div id="scenario-radar-chart" style="min-height: var(--radar-chart-size, 400px); width: var(--radar-chart-size, 400px); height: var(--radar-chart-size, 400px); position: relative; margin: 0 auto;"></div>
                        <div class="chart-legend">
                            <p>This chart shows how your choice affects different ethical dimensions. Select an option to see its impact.</p>
                        </div>
                    </div>
                </div>

                <div class="scenario-modal-footer">
                    ${this.isTestMode ? '<div class="test-mode-indicator">🧪 Test Mode - Choices not tracked</div>' : ""}
                    <button class="btn btn-secondary" id="cancel-scenario">
                        Cancel
                    </button>
                    <button class="btn btn-primary" id="confirm-choice" disabled>
                        ${this.isTestMode ? "Close Test" : "Confirm Choice"}
                    </button>
                </div>
            </div>
        `;

    logger.info(
      "ScenarioModal",
      "Generated scenario modal HTML, checking for radar chart container...",
    );
    logger.info("ScenarioModal", "HTML contains scenario-radar-chart:", {
      hasRadarChart: html.includes("scenario-radar-chart"),
    });

    return html;
  }

  /**
   * Render option buttons
   */
  renderOptions() {
    if (!this.currentScenario.options) {
      return "<p>No options available</p>";
    }

    return this.currentScenario.options
      .map(
        (option) => `
            <div class="option-card" data-option-id="${option.id}">
                <div class="option-header">
                    <h4 class="option-title">${option.text}</h4>
                </div>
                <div class="option-description">
                    <p>${option.description}</p>
                </div>
                <div class="option-details" style="display: none;">
                    ${
                      option.pros
                        ? `
                        <div class="pros-section">
                            <h5>Pros</h5>
                            <ul>${option.pros.map((pro) => `<li>${pro}</li>`).join("")}</ul>
                        </div>
                    `
                        : ""
                    }
                    ${
                      option.cons
                        ? `
                        <div class="cons-section">
                            <h5>Cons</h5>
                            <ul>${option.cons.map((con) => `<li>${con}</li>`).join("")}</ul>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `,
      )
      .join("");
  }

  /**
   * Initialize radar chart - ENTERPRISE EDITION
   */
  async initializeRadarChart() {
    const startTime = performance.now();

    try {
      this._logTelemetry("radar_init_started", {
        timestamp: Date.now(),
        modalState: !!this.modal,
        hasRadarChart: !!this.radarChart,
      });

      logger.info("RadarChart", "Starting radar chart initialization...");

      // Circuit breaker check for radar chart initialization
      if (this.circuitBreaker.state === "open") {
        this._logTelemetry("radar_init_blocked_circuit_open");
        logger.warn(
          "Radar chart initialization blocked: Circuit breaker is open",
        );
        return;
      }

      // Enhanced checks for modal state - WITH DETAILED DEBUGGING
      logger.debug("Modal state debug:", {
        isClosing: this.isClosing,
        hasModal: !!this.modal,
        modalInDOM: this.modal ? document.body.contains(this.modal) : false,
        modalDisplay: this.modal ? this.modal.style.display : "no modal",
        modalAriaHidden: this.modal
          ? this.modal.getAttribute("aria-hidden")
          : "no modal",
        modalHasAriaHidden: this.modal
          ? this.modal.hasAttribute("aria-hidden")
          : false,
      });

      if (this.isClosing) {
        logger.debug(
          "RadarChart",
          "Modal is closing, skipping radar chart initialization",
        );
        this._logTelemetry("radar_init_skipped_modal_closing");
        logger.debug("Exit: Modal is closing");
        return;
      }

      if (!this.modal || !document.body.contains(this.modal)) {
        logger.debug(
          "RadarChart",
          "Modal not in DOM, skipping radar chart initialization",
        );
        logger.debug("Exit: Modal not in DOM");
        return;
      }

      // Check if modal is visible - FIXED LOGIC
      const isVisible =
        this.modal.style.display !== "none" &&
        !this.modal.hasAttribute("aria-hidden") &&
        this.modal.getAttribute("aria-hidden") !== "true";

      logger.debug("Visibility check:", {
        displayNotNone: this.modal.style.display !== "none",
        noAriaHiddenAttr: !this.modal.hasAttribute("aria-hidden"),
        ariaHiddenNotTrue: this.modal.getAttribute("aria-hidden") !== "true",
        finalIsVisible: isVisible,
      });

      if (!isVisible) {
        logger.debug(
          "RadarChart",
          "Modal not visible, skipping radar chart initialization",
        );
        logger.debug("Exit: Modal not visible");
        return;
      }

      logger.debug("All modal state checks passed!");

      // Check if RadarChart class is available
      if (!RadarChart) {
        logger.error(
          "RadarChart",
          "RadarChart class not available - import failed",
        );
        return;
      }

      // Check if Chart.js is available using consolidated utility
      if (!RadarChart.isChartJSAvailable()) {
        logger.error(
          "RadarChart",
          "Chart.js not loaded - radar chart cannot be initialized",
        );
        return;
      }

      logger.debug(
        "All prerequisites met, proceeding with radar chart initialization",
      );
      logger.info(
        "RadarChart",
        "Prerequisites check passed - Chart.js and RadarChart class available",
      );

      // Clean up any existing radar chart instance first
      if (this.radarChart) {
        try {
          logger.info(
            "RadarChart",
            "Cleaning up existing radar chart instance",
          );
          this.radarChart.destroy();
          this.radarChart = null;
        } catch (e) {
          logger.warn(
            "RadarChart",
            "Failed to destroy existing radar chart",
            e,
          );
        }
      }
      if (this.radarChart) {
        try {
          this.radarChart.destroy();
        } catch (e) {
          logger.warn(
            "RadarChart",
            "Failed to destroy existing radar chart",
            e,
          );
        }
        this.radarChart = null;
      }

      // More robust container search with additional checks
      let chartContainer = null;
      let attempts = 0;
      const maxAttempts = 20; // Increased attempts
      const retryDelay = 150; // ms - delay between attempts

      while (!chartContainer && attempts < maxAttempts) {
        // Check if modal is closing before each attempt
        if (
          this.isClosing ||
          !this.modal ||
          !document.body.contains(this.modal)
        ) {
          logger.info(
            "RadarChart",
            "Modal closing during container search, aborting",
          );
          return;
        }

        // Check if modal has been properly rendered
        if (this.modal.style.display === "none") {
          logger.debug(
            "RadarChart",
            `Modal not visible yet (attempt ${attempts + 1}/${maxAttempts})`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempts++;
          continue;
        }

        // Double-check that modal contains the expected HTML
        if (!this.modal.innerHTML.includes("scenario-radar-chart")) {
          logger.debug(
            "RadarChart",
            `Modal HTML incomplete (attempt ${attempts + 1}/${maxAttempts})`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempts++;
          continue;
        }

        chartContainer = document.getElementById("scenario-radar-chart");
        if (!chartContainer) {
          logger.debug(
            "RadarChart",
            `Container not found in DOM (attempt ${attempts + 1}/${maxAttempts})`,
          );
          await new Promise((resolve) => setTimeout(resolve, retryDelay));
          attempts++;
        }
      }

      logger.info("RadarChart", `Container search completed`, {
        found: !!chartContainer,
        attempts: attempts + 1,
        modalVisible: this.modal?.style.display !== "none",
        modalInDOM: document.body.contains(this.modal),
        modalHasHTML: this.modal?.innerHTML.includes("scenario-radar-chart"),
      });

      if (!chartContainer) {
        // If we still can't find the container, this might not be an error but normal behavior
        // (e.g., user closed modal quickly)
        if (this.isClosing || !document.body.contains(this.modal)) {
          logger.info(
            "RadarChart",
            "Modal was closed during initialization, this is normal",
          );
        } else {
          logger.error("RadarChart", "Container not found after all attempts", {
            modalVisible: this.modal?.style.display !== "none",
            modalHTML: this.modal?.innerHTML ? "present" : "missing",
            modalInDOM: document.body.contains(this.modal),
            containerInHTML: this.modal?.innerHTML.includes(
              "scenario-radar-chart",
            ),
          });
        }
        return;
      }

      // Clean up any existing Chart.js instances in the container using consolidated utility
      RadarChart.destroyChartInContainer(chartContainer);

      // Clear any existing content to prevent "null" display
      chartContainer.innerHTML = "";
      chartContainer.textContent = "";

      logger.info("RadarChart", "Container cleared, initializing radar chart");

      try {
        // Pass the container ID (string), not the element itself
        logger.info("RadarChart", "Creating new RadarChart instance...");

        // Load RadarChart configuration first
        await RadarChart.loadConfiguration();
        const chartConfig = RadarChart.config;

        this.radarChart = new RadarChart("scenario-radar-chart", {
          width: chartConfig?.chart?.defaultSize || 400,
          height: chartConfig?.chart?.defaultSize || 400,
          showLabels: true,
          showLegend: false,
          animated: true,
          realTime: true,
          title: null, // Disable chart title to avoid duplication with h3
        });
        logger.info("RadarChart", "RadarChart constructor completed");

        // Wait for the RadarChart to be fully initialized
        logger.info(
          "RadarChart",
          "Waiting for radar chart initialization promise...",
        );
        if (this.radarChart.initializationPromise) {
          await this.radarChart.initializationPromise;
          logger.info(
            "RadarChart",
            "Radar chart async initialization completed",
          );
        } else {
          logger.warn(
            "RadarChart",
            "No initialization promise found on radar chart instance",
          );
        }

        // Verify the chart was created successfully
        if (!this.radarChart) {
          logger.error(
            "RadarChart",
            "Radar chart instance is null after initialization",
          );
          return;
        }

        // Ensure radar chart config exists
        const radarConfig = this.config?.radarChart || {};
        const neutralScore = radarConfig.neutralScore || 3.0;

        // Set initial slightly varied neutral scores to ensure polygon visibility
        // These values are carefully chosen to average exactly 3.0 while providing variation
        const neutralScores = {
          fairness: neutralScore + 0.02, // 3.02
          sustainability: neutralScore - 0.01, // 2.99
          autonomy: neutralScore + 0.01, // 3.01
          beneficence: neutralScore - 0.01, // 2.99
          transparency: neutralScore + 0.01, // 3.01
          accountability: neutralScore - 0.01, // 2.99
          privacy: neutralScore + 0.01, // 3.01
          proportionality: neutralScore - 0.02, // 2.98
        };
        // Average: (3.02 + 2.99 + 3.01 + 2.99 + 3.01 + 2.99 + 3.01 + 2.98) / 8 = 24.00 / 8 = 3.00 exactly

        logger.info(
          "RadarChart",
          "Setting initial neutral scores...",
          neutralScores,
        );
        this.radarChart.setScores(neutralScores);
        logger.info(
          "RadarChart",
          "Radar chart initialized successfully with neutral scores",
        );

        // Verify chart is visible in DOM and has correct dimensions
        const chartCanvas = chartContainer.querySelector("canvas");
        if (chartCanvas) {
          logger.info(
            "RadarChart",
            "Canvas element created successfully in container",
            {
              canvasWidth: chartCanvas.width,
              canvasHeight: chartCanvas.height,
              cssWidth: chartCanvas.style.width,
              cssHeight: chartCanvas.style.height,
            },
          );

          // CRITICAL FIX: Ensure canvas HTML attributes match CSS dimensions exactly
          const expectedSize = chartConfig?.chart?.defaultSize || 400;
          if (
            chartCanvas.width !== expectedSize ||
            chartCanvas.height !== expectedSize
          ) {
            logger.warn(
              "RadarChart",
              "Canvas dimensions mismatch detected, fixing",
              {
                htmlWidth: chartCanvas.width,
                htmlHeight: chartCanvas.height,
                expectedWidth: expectedSize,
                expectedHeight: expectedSize,
              },
            );

            // Force correct canvas dimensions
            chartCanvas.width = expectedSize;
            chartCanvas.height = expectedSize;
            chartCanvas.style.width = `${expectedSize}px`;
            chartCanvas.style.height = `${expectedSize}px`;

            // Force chart redraw with corrected dimensions
            if (this.radarChart && this.radarChart.chart) {
              logger.info(
                "RadarChart",
                "Forcing chart redraw after dimension correction",
              );
              this.radarChart.chart.resize();
              this.radarChart.chart.update("none");

              // Re-apply scores to ensure polygon visibility after resize
              setTimeout(() => {
                if (this.radarChart && this.radarChart.chart) {
                  this.radarChart.setScores(neutralScores);
                  this.radarChart.chart.update();
                  logger.info(
                    "RadarChart",
                    "Chart redrawn with corrected dimensions and scores",
                  );
                }
              }, 100);
            }
          }
        } else {
          logger.warn(
            "RadarChart",
            "No canvas element found in container after initialization",
          );
        }
      } catch (error) {
        logger.error("RadarChart", "Error during radar chart creation:", error);
        this.radarChart = null;
        return;
      }

      // Process any pending radar chart updates
      if (this.pendingRadarUpdate && this.selectedOption) {
        logger.info("ScenarioModal", "Processing pending radar chart update");
        this.updateRadarChart();
        this.pendingRadarUpdate = false;
      }

      // Track successful radar chart initialization
      const initTime = performance.now() - startTime;
      this._recordPerformanceMetric("radar_init", initTime);
      this._updateCircuitBreaker(true); // Success

      this._logTelemetry("radar_init_completed", {
        initTime: Math.round(initTime * 100) / 100,
        hasChart: !!this.radarChart,
        processingPendingUpdate:
          this.pendingRadarUpdate && !!this.selectedOption,
      });
    } catch (error) {
      const initTime = performance.now() - startTime;
      this._handleError(error, "initializeRadarChart", () =>
        this.initializeRadarChart(),
      );

      logger.error("Radar chart initialization failed:", error);

      this._logTelemetry("radar_init_failed", {
        error: error.message,
        initTime: Math.round(initTime * 100) / 100,
      });

      // Clear container and show fallback message instead of null
      const chartContainer = document.getElementById("scenario-radar-chart");
      if (chartContainer) {
        chartContainer.innerHTML = `
                    <div style="
                        display: flex; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 300px; 
                        color: #6b7280; 
                        font-size: 0.9rem;
                        text-align: center;
                        background: rgba(248, 250, 252, 0.5);
                        border-radius: 8px;
                        border: 1px solid rgba(229, 231, 235, 0.6);
                    ">
                        <div>
                            <p style="margin: 0 0 0.5rem 0;">Chart Loading...</p>
                            <small style="color: #9ca3af;">Ethical impact visualization will appear here</small>
                        </div>
                    </div>
                `;
      }
    }
  }

  /**
   * Attach event listeners
   */
  attachEventListeners() {
    // Close button
    const closeButton = this.modal.querySelector(".close-button");
    if (closeButton) {
      closeButton.addEventListener("click", () => this.close());
    }

    // Backdrop click to close
    if (this.backdrop) {
      this.backdrop.addEventListener("click", () => this.close());
    }

    // Option selection
    const optionCards = this.modal.querySelectorAll(".option-card");
    optionCards.forEach((card) => {
      card.addEventListener("click", () => this.selectOption(card));
    });

    // Cancel button
    const cancelButton = this.modal.querySelector("#cancel-scenario");
    if (cancelButton) {
      cancelButton.addEventListener("click", () => this.close());
    }

    // Confirm button
    const confirmButton = this.modal.querySelector("#confirm-choice");
    if (confirmButton) {
      confirmButton.addEventListener("click", () => this.confirmChoice());
    }

    // Escape key to close
    this.escapeHandler = (e) => {
      if (e.key === "Escape") {
        this.close();
      }
    };
    document.addEventListener("keydown", this.escapeHandler);
  }

  /**
   * Select an option - ENTERPRISE EDITION
   */
  selectOption(card) {
    const startTime = performance.now();

    try {
      logger.info("ScenarioModal", "Option selection started");

      const optionId = card.getAttribute("data-option-id");
      const isCurrentlySelected = card.classList.contains("selected");

      this._logTelemetry("option_selection_started", {
        optionId,
        isCurrentlySelected,
        currentScenario: this.currentScenarioId,
      });

      // If the clicked option is already selected, deselect it
      if (isCurrentlySelected) {
        logger.info("ScenarioModal", "Deselecting currently selected option:", {
          optionId,
        });

        // Remove selection
        card.classList.remove("selected");
        const details = card.querySelector(".option-details");
        if (details) details.style.display = "none";

        // Clear selected option
        this.selectedOption = null;

        // Reset radar chart to neutral state
        if (this.radarChart && this.radarChart.isInitialized) {
          this.radarChart.resetScores();
          logger.info("RadarChart", "Radar chart reset to neutral state");
        }

        // Disable confirm button
        const confirmButton = this.modal.querySelector("#confirm-choice");
        if (confirmButton) {
          confirmButton.disabled = true;
        }

        // Track deselection performance
        const selectionTime = performance.now() - startTime;
        this._recordPerformanceMetric("option_select", selectionTime, {
          optionId,
          wasSelected: false,
          action: "deselect",
          currentScenario: this.currentScenarioId,
        });

        this._logTelemetry("option_deselected", {
          optionId,
          selectionTime: Math.round(selectionTime * 100) / 100,
        });

        return;
      }

      // Remove previous selection from all cards
      this.modal.querySelectorAll(".option-card").forEach((c) => {
        c.classList.remove("selected");
        const details = c.querySelector(".option-details");
        if (details) details.style.display = "none";
      });

      // Select new option
      card.classList.add("selected");
      const details = card.querySelector(".option-details");
      if (details) details.style.display = "block";

      // Store selected option
      this.selectedOption = this.currentScenario.options.find(
        (opt) => opt.id === optionId,
      );

      logger.info("Option selected:", {
        optionId,
        hasSelectedOption: !!this.selectedOption,
        hasImpact: !!this.selectedOption?.impact,
        impact: this.selectedOption?.impact,
      });

      // Queue radar chart update if chart isn't ready yet
      if (this.radarChart && this.radarChart.isInitialized) {
        this.updateRadarChart();
      } else {
        // Store the update request for when chart is ready
        this.pendingRadarUpdate = true;
        logger.info("ScenarioModal", "Radar chart not ready, queuing update");
      }

      // Enable confirm button
      const confirmButton = this.modal.querySelector("#confirm-choice");
      if (confirmButton) {
        confirmButton.disabled = false;
      }

      // Track performance
      const selectionTime = performance.now() - startTime;
      this._recordPerformanceMetric("option_select", selectionTime, {
        optionId,
        wasSelected: !isCurrentlySelected,
        currentScenario: this.currentScenarioId,
      });

      this._logTelemetry("option_selection_completed", {
        optionId,
        wasSelected: !isCurrentlySelected,
        selectionTime: Math.round(selectionTime * 100) / 100,
        hasRadarChart: !!this.radarChart,
      });

      logger.info("ScenarioModal", "Option selection completed");
    } catch (error) {
      this._handleError(error, "selectOption");
      logger.error("[ScenarioModal] Error in selectOption:", error);
    }
  }

  /**
   * Update radar chart with selected option impact
   */
  updateRadarChart() {
    if (
      !this.radarChart ||
      !this.selectedOption ||
      !this.selectedOption.impact
    ) {
      logger.warn(
        "RadarChart",
        "Cannot update radar chart - missing components",
        {
          hasRadarChart: !!this.radarChart,
          hasSelectedOption: !!this.selectedOption,
          hasImpact: !!this.selectedOption?.impact,
        },
      );
      return;
    }

    try {
      // Check if radar chart is initialized
      if (!this.radarChart.isInitialized) {
        logger.warn(
          "RadarChart",
          "Radar chart not yet initialized, skipping update",
        );
        return;
      }

      // Convert impact data from (-2 to +2) to radar chart scale (0 to 5)
      // -2 becomes 1, -1 becomes 2, 0 becomes 3, +1 becomes 4, +2 becomes 5
      const impactScores = {};
      const neutralScore = this.config.radarChart.scoring.neutralScore; // Middle of 0-5 scale

      Object.keys(this.selectedOption.impact).forEach((axis) => {
        const impactValue = this.selectedOption.impact[axis] || 0;
        impactScores[axis] = neutralScore + impactValue;

        // Clamp to valid range (0-5)
        impactScores[axis] = Math.max(
          this.config.radarChart.scoring.minScore,
          Math.min(this.config.radarChart.scoring.maxScore, impactScores[axis]),
        );
      });

      logger.info(
        "RadarChart",
        "Updating radar chart with converted scores:",
        impactScores,
      );
      this.radarChart.setScores(impactScores);
      logger.info("RadarChart", "Radar chart updated successfully");
    } catch (error) {
      logger.error("Failed to update radar chart:", error);
    }
  }

  /**
   * Confirm the selected choice
   */
  async confirmChoice() {
    if (!this.selectedOption) {
      logger.warn("No option selected for confirmation");
      return;
    }

    // If this is a test scenario, just close the modal without tracking
    if (this.isTestMode) {
      logger.info("Test scenario completed, closing modal without tracking:", {
        categoryId: this.currentCategoryId,
        scenarioId: this.currentScenarioId,
        selectedOption: this.selectedOption?.id || "unknown",
        testMode: true,
      });

      // Simply close the modal without any tracking or events
      this.close();
      return;
    }

    // Mark as completed for proper close event handling
    this.wasCompleted = true;

    // Store completion data for after modal closes
    const completionData = {
      categoryId: this.currentCategoryId,
      scenarioId: this.currentScenarioId,
      selectedOption: this.selectedOption,
      option: this.selectedOption, // Legacy compatibility
      completed: true, // Mark as completed
    };

    // Dispatch initial scenario completion event (for immediate progress tracking)
    const event = new CustomEvent("scenario-completed", {
      detail: completionData,
    });
    document.dispatchEvent(event);

    logger.info("Scenario completed:", {
      categoryId: this.currentCategoryId,
      scenarioId: this.currentScenarioId,
      selectedOption: this.selectedOption?.id || "unknown",
    });

    // Close modal with delay to show completion, then dispatch final event
    setTimeout(async () => {
      await this.closeAndWait();

      // Dispatch event after modal is fully closed (for badge display)
      const closedEvent = new CustomEvent("scenario-modal-closed", {
        detail: completionData,
      });
      document.dispatchEvent(closedEvent);

      logger.info(
        "ScenarioModal",
        "Scenario modal fully closed, badges can now be displayed",
      );
    }, 1000);
  }

  /**
   * Show the modal
   */
  async show() {
    if (!this.modal || !this.backdrop) {
      logger.error("Modal elements not created");
      return;
    }

    // Focus management
    this.previousFocusedElement = document.activeElement;

    // Prevent body scrolling
    document.body.style.overflow = "hidden";

    // Add show class for animation and wait for it to complete
    await new Promise((resolve) => {
      requestAnimationFrame(() => {
        this.backdrop.classList.add("show");
        this.modal.classList.add("show");

        // Wait for CSS transition to complete
        setTimeout(() => {
          // Focus close button after animation
          const closeButton = this.modal.querySelector(".close-button");
          if (closeButton) {
            closeButton.focus();
          }
          resolve();
        }, this.config?.animations?.duration || 300);
      });
    });

    // Start typewriter effect for the dilemma and ethical question
    // Initialize radar chart first, before typewriter effect - with additional delay
    logger.debug("About to initialize radar chart");
    logger.debug("DOM ready state:", document.readyState);
    logger.debug("Chart.js available:", !!window.Chart);
    logger.debug(
      "Container exists:",
      !!document.getElementById("scenario-radar-chart"),
    );

    // Add a small delay to ensure DOM is fully settled
    const DOM_SETTLE_DELAY = 200; // ms
    await new Promise((resolve) => setTimeout(resolve, DOM_SETTLE_DELAY));

    await this.initializeRadarChart();

    // Then start typewriter effect
    await this.startTypewriterEffect();
  }

  /**
   * Close the modal and wait for it to be fully removed
   */
  async closeAndWait() {
    if (this.modal || this.backdrop) {
      this.close();
      // Wait for the animation to complete plus small buffer
      const CLOSE_BUFFER = 50; // ms
      await new Promise((resolve) =>
        setTimeout(
          resolve,
          (this.config?.animations?.duration || 300) + CLOSE_BUFFER,
        ),
      );
    }
  }

  /**
   * Close the modal
   */
  close() {
    // Set closing flag to prevent radar chart initialization
    this.isClosing = true;

    if (this.modal) {
      this.modal.classList.add("closing");
      setTimeout(() => {
        if (this.modal) {
          this.modal.remove();
          this.modal = null;
        }
      }, this.config?.animations?.duration || 300);
    }

    if (this.backdrop) {
      this.backdrop.classList.add("closing");
      setTimeout(() => {
        if (this.backdrop) {
          this.backdrop.remove();
          this.backdrop = null;
        }
      }, this.config?.animations?.duration || 300);
    }

    // Restore focus
    if (this.previousFocusedElement) {
      this.previousFocusedElement.focus();
    }

    // Restore body scrolling
    document.body.style.overflow = "";

    // Remove event listeners
    if (this.escapeHandler) {
      document.removeEventListener("keydown", this.escapeHandler);
      this.escapeHandler = null;
    }

    // CRITICAL FIX: Only dispatch uncompleted event if scenario wasn't actually completed
    // This prevents overriding the completion event from confirmChoice
    if (!this.wasCompleted) {
      const modalClosedEvent = new CustomEvent("scenario-modal-closed", {
        detail: {
          categoryId: this.currentCategoryId,
          scenarioId: this.currentScenarioId,
          completed: false, // Indicate this was closed without completion
        },
      });

      // Dispatch after a short delay to ensure modal cleanup is complete
      const CLOSE_EVENT_DELAY = 50; // ms - small buffer after animation
      setTimeout(
        () => {
          document.dispatchEvent(modalClosedEvent);
          logger.info(
            "ScenarioModal",
            "Modal closed event dispatched (without completion)",
          );
        },
        (this.config?.animations?.duration || 300) + CLOSE_EVENT_DELAY,
      );
    }

    // Reset state
    this.currentScenario = null;
    this.selectedOption = null;
    this.currentCategoryId = null;
    this.currentScenarioId = null;
    this.scenarioData = null;
    this.radarChart = null;
    this.isOpening = false; // Reset opening flag
    this.isClosing = false; // Reset closing flag to allow reopening

    logger.info("ScenarioModal", "Scenario modal closed");
  }

  /**
   * Start typewriter effect for dilemma and ethical question text
   */
  async startTypewriterEffect() {
    try {
      const dilemmaElement = this.modal.querySelector(".dilemma-text");
      const ethicalQuestionElement =
        this.modal.querySelector(".ethical-question");
      const scenarioContent = this.modal.querySelector(".scenario-content");

      if (!dilemmaElement || !ethicalQuestionElement) {
        logger.warn("Could not find text elements for typewriter effect");
        return;
      }

      // Add active class to start typewriter styling
      if (scenarioContent) {
        scenarioContent.classList.add("typewriter-active");
      }

      // Get the original text content
      const dilemmaText = this.currentScenario.dilemma;
      const ethicalQuestionText = this.currentScenario.ethicalQuestion;

      // Apply typewriter effect sequentially
      await typewriterSequence([
        {
          element: dilemmaElement,
          text: dilemmaText,
          options: {
            speed: 15, // Faster typing
            delay: 200, // Small delay before starting
            cursor: true,
          },
        },
        {
          element: ethicalQuestionElement,
          text: ethicalQuestionText,
          options: {
            speed: 20, // Faster typing for emphasis
            delay: 200, // Shorter delay after first text completes
            cursor: true,
          },
        },
      ]);

      logger.info("ScenarioModal", "Typewriter effect completed");
    } catch (error) {
      logger.error("Failed to apply typewriter effect:", error);

      // Fallback - show text immediately if typewriter fails
      const dilemmaElement = this.modal.querySelector(".dilemma-text");
      const ethicalQuestionElement =
        this.modal.querySelector(".ethical-question");

      if (dilemmaElement) {
        dilemmaElement.textContent = this.currentScenario.dilemma;
      }
      if (ethicalQuestionElement) {
        ethicalQuestionElement.textContent =
          this.currentScenario.ethicalQuestion;
      }
    }
  }

  // ===== ENTERPRISE STATIC UTILITIES =====
  /**
   * Enterprise health diagnostics for ScenarioModal component
   * @returns {Object} Comprehensive health report
   */
  static getHealthReport() {
    try {
      const instances = ScenarioModal._instances || new Set();
      const report = {
        timestamp: Date.now(),
        instanceCount: instances.size,
        systemHealth: "healthy",
        instances: [],
        performance: {
          averageModalOpenTime: 0,
          averageRadarInitTime: 0,
          averageOptionSelectTime: 0,
          totalScenariosOpened: 0,
          totalScenariosCompleted: 0,
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

      let totalModalOpenTime = 0;
      let totalRadarInitTime = 0;
      let totalOptionSelectTime = 0;
      let totalScenariosOpened = 0;
      let totalScenariosCompleted = 0;

      instances.forEach((instance) => {
        const instanceHealth = {
          id: instance.instanceId,
          isHealthy: instance.isHealthy,
          circuitBreakerState: instance.circuitBreaker?.state || "unknown",
          modalOpenCount: instance.performanceMetrics?.modalOpenCount || 0,
          radarInitCount: instance.performanceMetrics?.radarInitCount || 0,
          optionSelectCount:
            instance.performanceMetrics?.optionSelectCount || 0,
          scenarioCompletionCount:
            instance.performanceMetrics?.scenarioCompletionCount || 0,
          averageModalOpenTime:
            instance.performanceMetrics?.averageModalOpenTime || 0,
          averageRadarInitTime:
            instance.performanceMetrics?.averageRadarInitTime || 0,
          averageOptionSelectTime:
            instance.performanceMetrics?.averageOptionSelectTime || 0,
          errorCount: instance.errorCount || 0,
          lastError: instance.lastError || null,
          uptime: Date.now() - instance.createdAt,
          currentScenario: instance.currentScenarioId,
          modalState: !!instance.modal,
        };

        report.instances.push(instanceHealth);
        totalModalOpenTime +=
          instanceHealth.averageModalOpenTime * instanceHealth.modalOpenCount;
        totalRadarInitTime +=
          instanceHealth.averageRadarInitTime * instanceHealth.radarInitCount;
        totalOptionSelectTime +=
          instanceHealth.averageOptionSelectTime *
          instanceHealth.optionSelectCount;
        totalScenariosOpened += instanceHealth.modalOpenCount;
        totalScenariosCompleted += instanceHealth.scenarioCompletionCount;

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
      if (totalScenariosOpened > 0) {
        report.performance.averageModalOpenTime =
          Math.round((totalModalOpenTime / totalScenariosOpened) * 100) / 100;
        report.performance.totalScenariosOpened = totalScenariosOpened;
      }

      if (instances.size > 0) {
        const totalRadarInits = Array.from(instances).reduce(
          (sum, inst) => sum + (inst.performanceMetrics?.radarInitCount || 0),
          0,
        );
        if (totalRadarInits > 0) {
          report.performance.averageRadarInitTime =
            Math.round((totalRadarInitTime / totalRadarInits) * 100) / 100;
        }

        const totalOptionSelects = Array.from(instances).reduce(
          (sum, inst) =>
            sum + (inst.performanceMetrics?.optionSelectCount || 0),
          0,
        );
        if (totalOptionSelects > 0) {
          report.performance.averageOptionSelectTime =
            Math.round((totalOptionSelectTime / totalOptionSelects) * 100) /
            100;
        }
      }

      report.performance.totalScenariosCompleted = totalScenariosCompleted;

      return report;
    } catch (error) {
      console.error("[ScenarioModal] Error generating health report:", error);
      return {
        timestamp: Date.now(),
        systemHealth: "error",
        error: error.message,
        instanceCount: 0,
        instances: [],
        performance: {
          averageModalOpenTime: 0,
          averageRadarInitTime: 0,
          averageOptionSelectTime: 0,
          totalScenariosOpened: 0,
          totalScenariosCompleted: 0,
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
      const instances = ScenarioModal._instances || new Set();
      const metrics = {
        timestamp: Date.now(),
        totalInstances: instances.size,
        aggregatedMetrics: {
          totalModalOpens: 0,
          totalRadarInits: 0,
          totalOptionSelects: 0,
          totalScenariosCompleted: 0,
          totalModalOpenTime: 0,
          totalRadarInitTime: 0,
          totalOptionSelectTime: 0,
          averageModalOpenTime: 0,
          averageRadarInitTime: 0,
          averageOptionSelectTime: 0,
          minModalOpenTime: Infinity,
          maxModalOpenTime: 0,
          errorRate: 0,
          totalErrors: 0,
          completionRate: 0,
        },
        instanceMetrics: [],
      };

      let totalModalOpenTime = 0;
      let totalRadarInitTime = 0;
      let totalOptionSelectTime = 0;
      let totalModalOpens = 0;
      let totalRadarInits = 0;
      let totalOptionSelects = 0;
      let totalScenariosCompleted = 0;
      let totalErrors = 0;

      instances.forEach((instance) => {
        const perf = instance.performanceMetrics || {};
        const instanceMetric = {
          id: instance.instanceId,
          modalOpenCount: perf.modalOpenCount || 0,
          radarInitCount: perf.radarInitCount || 0,
          optionSelectCount: perf.optionSelectCount || 0,
          scenarioCompletionCount: perf.scenarioCompletionCount || 0,
          averageModalOpenTime: perf.averageModalOpenTime || 0,
          averageRadarInitTime: perf.averageRadarInitTime || 0,
          averageOptionSelectTime: perf.averageOptionSelectTime || 0,
          totalModalOpenTime: perf.totalModalOpenTime || 0,
          totalRadarInitTime: perf.totalRadarInitTime || 0,
          totalOptionSelectTime: perf.totalOptionSelectTime || 0,
          errorCount: instance.errorCount || 0,
          memoryUsage: perf.memoryUsage || 0,
          uptime: Date.now() - instance.createdAt,
        };

        metrics.instanceMetrics.push(instanceMetric);

        totalModalOpens += instanceMetric.modalOpenCount;
        totalRadarInits += instanceMetric.radarInitCount;
        totalOptionSelects += instanceMetric.optionSelectCount;
        totalScenariosCompleted += instanceMetric.scenarioCompletionCount;
        totalModalOpenTime += instanceMetric.totalModalOpenTime;
        totalRadarInitTime += instanceMetric.totalRadarInitTime;
        totalOptionSelectTime += instanceMetric.totalOptionSelectTime;
        totalErrors += instanceMetric.errorCount;

        if (instanceMetric.averageModalOpenTime > 0) {
          metrics.aggregatedMetrics.minModalOpenTime = Math.min(
            metrics.aggregatedMetrics.minModalOpenTime,
            instanceMetric.averageModalOpenTime,
          );
          metrics.aggregatedMetrics.maxModalOpenTime = Math.max(
            metrics.aggregatedMetrics.maxModalOpenTime,
            instanceMetric.averageModalOpenTime,
          );
        }
      });

      // Calculate aggregated metrics
      metrics.aggregatedMetrics.totalModalOpens = totalModalOpens;
      metrics.aggregatedMetrics.totalRadarInits = totalRadarInits;
      metrics.aggregatedMetrics.totalOptionSelects = totalOptionSelects;
      metrics.aggregatedMetrics.totalScenariosCompleted =
        totalScenariosCompleted;
      metrics.aggregatedMetrics.totalModalOpenTime =
        Math.round(totalModalOpenTime * 100) / 100;
      metrics.aggregatedMetrics.totalRadarInitTime =
        Math.round(totalRadarInitTime * 100) / 100;
      metrics.aggregatedMetrics.totalOptionSelectTime =
        Math.round(totalOptionSelectTime * 100) / 100;
      metrics.aggregatedMetrics.totalErrors = totalErrors;

      if (totalModalOpens > 0) {
        metrics.aggregatedMetrics.averageModalOpenTime =
          Math.round((totalModalOpenTime / totalModalOpens) * 100) / 100;
        metrics.aggregatedMetrics.errorRate =
          Math.round((totalErrors / totalModalOpens) * 10000) / 100; // Percentage with 2 decimals
        metrics.aggregatedMetrics.completionRate =
          Math.round((totalScenariosCompleted / totalModalOpens) * 10000) / 100;
      }

      if (totalRadarInits > 0) {
        metrics.aggregatedMetrics.averageRadarInitTime =
          Math.round((totalRadarInitTime / totalRadarInits) * 100) / 100;
      }

      if (totalOptionSelects > 0) {
        metrics.aggregatedMetrics.averageOptionSelectTime =
          Math.round((totalOptionSelectTime / totalOptionSelects) * 100) / 100;
      }

      if (metrics.aggregatedMetrics.minModalOpenTime === Infinity) {
        metrics.aggregatedMetrics.minModalOpenTime = 0;
      }

      return metrics;
    } catch (error) {
      console.error(
        "[ScenarioModal] Error generating performance metrics:",
        error,
      );
      return {
        timestamp: Date.now(),
        error: error.message,
        totalInstances: 0,
        aggregatedMetrics: {
          totalModalOpens: 0,
          totalRadarInits: 0,
          totalOptionSelects: 0,
          totalScenariosCompleted: 0,
          totalModalOpenTime: 0,
          totalRadarInitTime: 0,
          totalOptionSelectTime: 0,
          averageModalOpenTime: 0,
          averageRadarInitTime: 0,
          averageOptionSelectTime: 0,
          minModalOpenTime: 0,
          maxModalOpenTime: 0,
          errorRate: 0,
          totalErrors: 0,
          completionRate: 0,
        },
        instanceMetrics: [],
      };
    }
  }

  /**
   * Emergency recovery for all ScenarioModal instances
   * @returns {Promise<Object>} Recovery results
   */
  static async emergencyRecovery() {
    try {
      const instances = ScenarioModal._instances || new Set();
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

          // Close modal if open and problematic
          if (instance.modal && !instance.isHealthy) {
            instance.close();
          }

          const endTime = performance.now();
          const result = {
            id: instance.instanceId,
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
            id: instance.instanceId || "unknown",
            recovered: false,
            error: error.message,
            recoveryDuration: 0,
          };
        }
      });

      results.results = await Promise.all(recoveryPromises);

      console.log(
        `[ScenarioModal] Emergency recovery completed: ${results.recoveredInstances}/${results.totalInstances} instances recovered`,
      );
      return results;
    } catch (error) {
      console.error("[ScenarioModal] Error during emergency recovery:", error);
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

export default ScenarioModal;
