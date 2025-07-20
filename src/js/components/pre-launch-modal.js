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
 * Pre-Launch Information Modal - ENTERPRISE EDITION
 * Educational context and preparation before simulation launch
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
 */

import { getSimulationInfo } from "../data/simulation-info.js";
import ModalUtility from "./modal-utility.js";
import { simpleAnalytics } from "../utils/simple-analytics.js";
import {
  getRadarChartExplanation,
  getEthicsGlossary,
} from "../utils/ethics-glossary.js";
import logger from "../utils/logger.js";

import { loadPreLaunchModalConfig } from "../utils/pre-launch-modal-config-loader.js";

// Constants still needed for fallback values
const DEFAULT_SCENARIO_DURATION = 15;

export default class PreLaunchModal {
  constructor(simulationId, options = {}) {
    const startTime = performance.now();

    try {
      // Core initialization
      this.simulationId = simulationId;
      this.options = {
        onLaunch: options.onLaunch || (() => {}),
        onCancel: options.onCancel || (() => {}),
        showEducatorResources: options.showEducatorResources || false,
        ...options,
      };

      // Load configuration asynchronously
      this.config = null;
      this.configLoaded = false;
      this._loadConfigurationAsync();

      // === ENTERPRISE INITIALIZATION ===
      this.instanceId = `prelaunch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.isHealthy = true;
      this.errorCount = 0;
      this.lastError = null;
      this.recoveryAttempts = 0;
      this.createdAt = Date.now();
      this.lastHealthCheck = Date.now();

      // Performance metrics tracking
      this.performanceMetrics = {
        renderCount: 0,
        totalRenderTime: 0,
        averageRenderTime: 0,
        tabSwitchCount: 0,
        totalTabSwitchTime: 0,
        averageTabSwitchTime: 0,
        contentGenerationTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        lastRenderTime: 0,
        lastTabSwitchTime: 0,
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
      this.telemetryBuffer = [];
      this.lastTelemetryFlush = Date.now();

      // Health monitoring intervals
      this.healthCheckInterval = null;
      this.telemetryFlushInterval = null;
      this.heartbeatInterval = null;

      // Track all instances for enterprise monitoring
      if (!PreLaunchModal._instances) {
        PreLaunchModal._instances = new Set();
      }
      PreLaunchModal._instances.add(this);

      // Check if category data is provided directly (for category-based premodals)
      if (options.categoryData && options.scenarioData) {
        this.simulationInfo = this.convertCategoryToSimulationInfo(
          options.categoryData,
          options.scenarioData,
        );
        this.isCategory = true;
      } else {
        // Traditional simulation-based premodal
        this.simulationInfo = getSimulationInfo(simulationId);
        this.isCategory = false;

        if (!this.simulationInfo) {
          this._handleError(
            new Error(`Simulation info not found for: ${simulationId}`),
            "constructor",
          );
          throw new Error(`Simulation info not found for: ${simulationId}`);
        }
      }

      this.modal = null;
      this.currentTab = "overview";

      // Initialize enterprise monitoring
      this._initializeEnterpriseMonitoring();

      // Track constructor performance
      const constructorTime = performance.now() - startTime;
      this._recordPerformanceMetric("constructor", constructorTime);

      // Log successful initialization
      this._logTelemetry("instance_created", {
        simulationId: this.simulationId,
        isCategory: this.isCategory,
        constructorTime: Math.round(constructorTime * 100) / 100,
        options: Object.keys(this.options),
      });
    } catch (error) {
      this._handleError(error, "constructor");
      throw error;
    }
  }

  /**
   * Load configuration asynchronously
   * This runs in the background to avoid blocking constructor
   */
  async _loadConfigurationAsync() {
    try {
      this.config = await loadPreLaunchModalConfig();
      this.configLoaded = true;

      logger.debug("[PreLaunchModal] Configuration loaded successfully", {
        instanceId: this.instanceId,
        configVersion: this.config.metadata?.version,
      });

      // Re-initialize enterprise monitoring with actual config values
      if (
        this.healthCheckInterval ||
        this.telemetryFlushInterval ||
        this.heartbeatInterval
      ) {
        this._reinitializeEnterpriseMonitoring();
      }
    } catch (error) {
      logger.error("[PreLaunchModal] Failed to load configuration:", error);
      // Continue with default values - don't break functionality
      this.configLoaded = false;
    }
  }

  /**
   * Get configuration value with fallback to hardcoded constants
   */
  _getConfigValue(path, fallback) {
    if (this.config && this.config.utils) {
      return this.config.utils.getValue(path, fallback);
    }
    return fallback;
  }

  /**
   * Re-initialize enterprise monitoring with loaded configuration
   */
  _reinitializeEnterpriseMonitoring() {
    try {
      // Clear existing intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
      }
      if (this.telemetryFlushInterval) {
        clearInterval(this.telemetryFlushInterval);
      }
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
      }

      // Re-initialize with config values
      this._initializeEnterpriseMonitoring();

      logger.debug(
        "[PreLaunchModal] Enterprise monitoring re-initialized with configuration",
      );
    } catch (error) {
      logger.error(
        "[PreLaunchModal] Error re-initializing enterprise monitoring:",
        error,
      );
    }
  }

  /**
   * Enterprise monitoring initialization
   * Sets up health checks, telemetry, and error recovery
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Health check monitoring
      const healthCheckInterval = this._getConfigValue(
        "enterprise.health.checkInterval",
        30000,
      );
      this.healthCheckInterval = setInterval(() => {
        this._performHealthCheck();
      }, healthCheckInterval);

      // Telemetry batch flushing
      const telemetryFlushInterval = this._getConfigValue(
        "enterprise.telemetry.flushInterval",
        60000,
      );
      this.telemetryFlushInterval = setInterval(() => {
        this._flushTelemetryBatch();
      }, telemetryFlushInterval);

      // Heartbeat monitoring
      const heartbeatInterval = this._getConfigValue(
        "enterprise.health.heartbeatInterval",
        60000,
      );
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, heartbeatInterval);

      // Set up error recovery baseline
      this._establishPerformanceBaseline();

      logger.debug(
        `[PreLaunchModal] Enterprise monitoring initialized for instance ${this.instanceId}`,
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

    // Log the error with telemetry
    this._logTelemetry("error_occurred", {
      error: error.message,
      context,
      errorCount: this.errorCount,
      circuitBreakerState: this.circuitBreaker.state,
    });

    // Attempt recovery if within limits
    const maxRetryAttempts = this._getConfigValue(
      "enterprise.errorRecovery.maxRetryAttempts",
      3,
    );
    if (this.recoveryAttempts < maxRetryAttempts && retryOperation) {
      this.recoveryAttempts++;

      const baseRetryDelay = this._getConfigValue(
        "enterprise.errorRecovery.retryDelay",
        1000,
      );
      const backoffMultiplier = this._getConfigValue(
        "enterprise.errorRecovery.backoffMultiplier",
        2,
      );

      const retryDelay =
        this.config?.computed?.errorRecovery?.getRetryDelay(
          this.recoveryAttempts,
        ) ||
        baseRetryDelay * Math.pow(backoffMultiplier, this.recoveryAttempts - 1);

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
      }, retryDelay);
    }

    // Update health status
    const healthFailureThreshold = this._getConfigValue(
      "enterprise.health.failureThreshold",
      5,
    );
    this.isHealthy = this.errorCount < healthFailureThreshold;

    logger.error(`[PreLaunchModal] Error in ${context}:`, error);
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
        case "render":
          this.performanceMetrics.renderCount++;
          this.performanceMetrics.totalRenderTime += duration;
          this.performanceMetrics.averageRenderTime =
            this.performanceMetrics.totalRenderTime /
            this.performanceMetrics.renderCount;
          this.performanceMetrics.lastRenderTime = duration;
          break;
        case "tab_switch":
          this.performanceMetrics.tabSwitchCount++;
          this.performanceMetrics.totalTabSwitchTime += duration;
          this.performanceMetrics.averageTabSwitchTime =
            this.performanceMetrics.totalTabSwitchTime /
            this.performanceMetrics.tabSwitchCount;
          this.performanceMetrics.lastTabSwitchTime = duration;
          break;
        case "content_generation":
          this.performanceMetrics.contentGenerationTime = duration;
          break;
      }

      // Check performance thresholds
      this._checkPerformanceThresholds(operation, duration);

      // Log telemetry
      this._logTelemetry("performance_metric", metric);
    } catch (error) {
      // Don't let performance tracking break the application
      logger.warn(
        "[PreLaunchModal] Error recording performance metric:",
        error,
      );
    }
  }

  /**
   * Circuit breaker state management
   */
  _updateCircuitBreaker(success) {
    const now = Date.now();

    const successThreshold = this._getConfigValue(
      "enterprise.circuitBreaker.successThreshold",
      3,
    );
    const failureThreshold = this._getConfigValue(
      "enterprise.circuitBreaker.failureThreshold",
      5,
    );
    const recoveryTimeout = this._getConfigValue(
      "enterprise.circuitBreaker.recoveryTimeout",
      30000,
    );

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
        simulationId: this.simulationId,
        ...data,
      };

      this.telemetryBatch.push(telemetryEvent);

      // Auto-flush if batch is full
      const batchSize = this._getConfigValue(
        "enterprise.telemetry.batchSize",
        50,
      );
      if (this.telemetryBatch.length >= batchSize) {
        this._flushTelemetryBatch();
      }
    } catch (error) {
      // Don't let telemetry errors break functionality
      logger.warn("[PreLaunchModal] Telemetry error:", error);
    }
  }

  /**
   * Flush telemetry batch to analytics
   */
  _flushTelemetryBatch() {
    try {
      if (this.telemetryBatch.length === 0) return;

      // Send batch to analytics
      const batchData = [...this.telemetryBatch];
      this.telemetryBatch = [];

      if (simpleAnalytics) {
        simpleAnalytics.trackEvent("pre_launch_modal_batch", {
          events: batchData,
          batchSize: batchData.length,
          instanceId: this.instanceId,
        });
      }

      this.lastTelemetryFlush = Date.now();
    } catch (error) {
      logger.warn("[PreLaunchModal] Error flushing telemetry batch:", error);
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
    });
  }

  /**
   * Performance threshold monitoring
   */
  _checkPerformanceThresholds(operation, duration) {
    // Use computed performance helpers if available, otherwise fallback to direct config access
    if (this.config?.computed?.performance) {
      const computed = this.config.computed.performance;

      if (computed.isPerformanceViolation(operation, duration)) {
        const thresholds = this._getThresholdsForOperation(operation);
        this._logTelemetry("performance_violation", {
          operation,
          duration,
          threshold: thresholds.critical,
          severity: "critical",
        });
      } else if (computed.isPerformanceWarning(operation, duration)) {
        const thresholds = this._getThresholdsForOperation(operation);
        this._logTelemetry("performance_warning", {
          operation,
          duration,
          threshold: thresholds.warning,
          severity: "warning",
        });
      }
    } else {
      // Fallback to hardcoded thresholds when config not loaded
      this._checkPerformanceThresholdsFallback(operation, duration);
    }
  }

  /**
   * Get performance thresholds for a specific operation
   */
  _getThresholdsForOperation(operation) {
    const performance = this._getConfigValue("enterprise.performance", {});

    switch (operation) {
      case "render":
        return {
          warning: performance.warningRenderTime || 500,
          critical: performance.maxRenderTime || 1000,
        };
      case "tab_switch":
        return {
          warning: performance.warningTabSwitchTime || 150,
          critical: performance.maxTabSwitchTime || 300,
        };
      case "content_generation":
        return {
          warning: performance.warningContentGenerationTime || 1000,
          critical: performance.maxContentGenerationTime || 2000,
        };
      case "constructor":
        return {
          warning: performance.warningConstructorTime || 50,
          critical: performance.maxConstructorTime || 100,
        };
      default:
        return { warning: 500, critical: 1000 };
    }
  }

  /**
   * Fallback performance threshold checking when config not loaded
   */
  _checkPerformanceThresholdsFallback(operation, duration) {
    const thresholds = {
      render: { max: 1000, warning: 500 },
      tab_switch: { max: 300, warning: 150 },
      content_generation: { max: 2000, warning: 1000 },
      constructor: { max: 100, warning: 50 },
    };

    const threshold = thresholds[operation];
    if (!threshold) return;

    if (duration > threshold.max) {
      this._logTelemetry("performance_violation", {
        operation,
        duration,
        threshold: threshold.max,
        severity: "critical",
      });
    } else if (duration > threshold.warning) {
      this._logTelemetry("performance_warning", {
        operation,
        duration,
        threshold: threshold.warning,
        severity: "warning",
      });
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
   * Converts category and scenario data to simulation info format
   * This allows the PreLaunchModal to work with both simulations and categories
   */
  convertCategoryToSimulationInfo(category, scenario) {
    return {
      id: category.id,
      title: scenario.title,
      subtitle: `${category.title} - ${scenario.description}`,

      // Educational Context
      learningObjectives: category.learningObjectives || [
        "Explore ethical decision-making scenarios",
        "Understand different perspectives on moral choices",
        "Practice reasoning through complex dilemmas",
        "Develop critical thinking about AI ethics",
      ],

      isteCriteria: [
        "Empowered Learner 1.1.5: Use technology to seek feedback and make improvements",
        "Digital Citizen 1.2.2: Engage in positive, safe, legal and ethical behavior",
        "Knowledge Constructor 1.3.1: Plan and employ effective research strategies",
        "Computational Thinker 1.5.3: Collect data and identify patterns",
      ],

      duration: `${category.estimatedTime || DEFAULT_SCENARIO_DURATION} minutes`,
      difficulty: category.difficulty || "intermediate",
      recommendedAge: "13+",
      prerequisites: [
        "Basic understanding of ethics and moral reasoning",
        "Awareness of AI and automated systems",
        "Open mind for exploring different perspectives",
      ],

      // Pre-Launch Information
      beforeYouStart: {
        briefing: `In this scenario, you'll explore "${scenario.title}" as part of the ${category.title} category. ${scenario.description}
                
                You'll be presented with ethical dilemmas and asked to make decisions while considering multiple perspectives. There are no single "correct" answers - instead, you'll discover the complexity of moral reasoning in AI systems.`,

        vocabulary: [
          {
            term: "Ethics",
            definition: "The study of what is morally right and wrong",
          },
          {
            term: "Dilemma",
            definition:
              "A situation requiring a choice between equally undesirable alternatives",
          },
          {
            term: "Stakeholder",
            definition:
              "A person or group affected by the decisions being made",
          },
          {
            term: "Autonomy",
            definition:
              "The ability of a system to make decisions independently",
          },
          {
            term: "Moral Agency",
            definition:
              "The capacity to make moral judgments and be held responsible for actions",
          },
        ],

        preparationTips: [
          "Consider multiple perspectives before making decisions",
          "Think about both immediate and long-term consequences",
          "Remember that ethical reasoning often involves trade-offs",
          "Stay open to challenging your initial assumptions",
          "Consider who might be affected by each decision",
        ],

        scenarioOverview: scenario.description,
      },

      contentNotes: [
        "This scenario deals with complex ethical questions that may not have clear answers",
        "Different cultural and philosophical backgrounds may lead to different conclusions",
        'The goal is to develop reasoning skills, not find the "right" answer',
      ],

      // Resources and connections
      relatedResources: [
        {
          type: "article",
          title: "Introduction to AI Ethics",
          description:
            "A comprehensive overview of ethical considerations in artificial intelligence",
          url: "#",
          audience: "general",
        },
        {
          type: "video",
          title: "Moral Decision-Making in AI Systems",
          description: "Video explanation of how AI systems make moral choices",
          url: "#",
          audience: "students",
        },
        {
          type: "activity",
          title: "Ethics Discussion Guide",
          description:
            "Structured questions for group discussion about AI ethics",
          url: "#",
          audience: "educators",
        },
      ],

      connectedSimulations: [],

      // Educator resources
      educatorResources: {
        discussionQuestions: [
          `What ethical considerations are most important in the "${category.title}" category?`,
          "How might different stakeholders view these scenarios differently?",
          "What real-world applications of these ethical dilemmas can you think of?",
          "How can we prepare for ethical challenges in AI and automation?",
          "What role should humans play in automated decision-making?",
        ],

        extensionActivities: [
          "Research real-world examples related to this category",
          "Debate different ethical approaches to these scenarios",
          "Create your own ethical dilemma scenarios",
          "Interview experts about AI ethics in this domain",
          "Design guidelines for ethical AI in this area",
        ],

        classroomTips: [
          "Encourage students to consider multiple perspectives",
          'Emphasize that there may not be single "correct" answers',
          "Connect scenarios to current events and real-world examples",
          "Allow time for reflection and discussion after each scenario",
          "Consider having students work in small groups to discuss choices",
        ],

        relatedStandards: [
          "CSTA K-12 Computer Science Standards: 3A-IC-24, 3A-IC-25, 3A-IC-26",
          "ISTE Standards: Digital Citizen 1.2.2, Knowledge Constructor 1.3.1",
        ],
      },

      // Additional data for category-specific features
      categoryInfo: {
        icon: category.icon,
        color: category.color,
        tags: category.tags || [],
      },
    };
  }

  /**
   * Shows the pre-launch modal with enterprise monitoring
   */
  show() {
    const startTime = performance.now();

    try {
      // Circuit breaker check
      if (this.circuitBreaker.state === "open") {
        const now = Date.now();
        if (now < this.circuitBreaker.nextAttemptTime) {
          this._logTelemetry("show_blocked_circuit_open", {
            nextAttemptTime: this.circuitBreaker.nextAttemptTime,
            currentTime: now,
          });
          throw new Error(
            "Modal show operation blocked: Circuit breaker is open",
          );
        } else {
          this.circuitBreaker.state = "half-open";
          this.circuitBreaker.successCount = 0;
        }
      }

      // Generate content with timing
      const contentStartTime = performance.now();
      const content = this.generateModalContent();
      const footer = this.generateModalFooter();
      const contentGenerationTime = performance.now() - contentStartTime;

      this._recordPerformanceMetric(
        "content_generation",
        contentGenerationTime,
      );

      // Create modal with error handling
      this.modal = new ModalUtility({
        title: `Prepare to Explore: ${this.simulationInfo.title}`,
        content,
        footer,
        onClose: () => {
          this._logTelemetry("modal_closed_via_close_callback");
          this.options.onCancel();
        },
        closeOnBackdrop: false,
        closeOnEscape: true,
      });

      // Open modal and setup
      this.modal.open();
      this.setupEventListeners();

      // Track analytics and performance
      const totalRenderTime = performance.now() - startTime;
      this._recordPerformanceMetric("render", totalRenderTime);
      this._updateCircuitBreaker(true); // Success

      this.trackAnalytics("pre_launch_viewed");
      this._logTelemetry("modal_shown", {
        renderTime: Math.round(totalRenderTime * 100) / 100,
        contentGenerationTime: Math.round(contentGenerationTime * 100) / 100,
      });
    } catch (error) {
      this._handleError(error, "show", () => this.show());
      throw error;
    }
  }

  /**
   * Closes the modal with enterprise cleanup
   */
  close() {
    try {
      this._logTelemetry("modal_closing", {
        uptime: Date.now() - this.createdAt,
        renderCount: this.performanceMetrics.renderCount,
        tabSwitchCount: this.performanceMetrics.tabSwitchCount,
      });

      if (this.modal) {
        this.modal.close();
        this.modal = null;
      }

      // Perform enterprise cleanup
      this._enterpriseCleanup();
    } catch (error) {
      this._handleError(error, "close");
    }
  }

  /**
   * Closes the modal with optional force destroy (for onboarding completion)
   */
  closeWithCleanup(forceDestroy = false) {
    try {
      this._logTelemetry("modal_closing_with_cleanup", {
        forceDestroy,
        uptime: Date.now() - this.createdAt,
      });

      if (this.modal) {
        if (forceDestroy) {
          this.modal.destroy();
        } else {
          this.modal.close();
        }
        this.modal = null;
      }

      // Perform enterprise cleanup
      this._enterpriseCleanup(forceDestroy);
    } catch (error) {
      this._handleError(error, "closeWithCleanup");
    }
  }

  /**
   * Destroys the modal completely (removes from DOM)
   */
  destroy() {
    try {
      this._logTelemetry("modal_destroying", {
        uptime: Date.now() - this.createdAt,
        totalErrors: this.errorCount,
      });

      if (this.modal) {
        this.modal.destroy();
        this.modal = null;
      }

      // Perform complete enterprise cleanup
      this._enterpriseCleanup(true);
    } catch (error) {
      this._handleError(error, "destroy");
    }
  }

  /**
   * Enterprise cleanup operations
   */
  _enterpriseCleanup(isDestroy = false) {
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
        isDestroy,
        finalMetrics: { ...this.performanceMetrics },
        finalHealth: {
          isHealthy: this.isHealthy,
          errorCount: this.errorCount,
          circuitBreakerState: this.circuitBreaker.state,
        },
        uptime: Date.now() - this.createdAt,
      });

      // Remove from instance tracking
      if (PreLaunchModal._instances) {
        PreLaunchModal._instances.delete(this);
      }

      // Reset state
      this.isHealthy = false;

      logger.debug(
        `[PreLaunchModal] Enterprise cleanup completed for instance ${this.instanceId}`,
      );
    } catch (error) {
      logger.error("[PreLaunchModal] Error during enterprise cleanup:", error);
    }
  }

  /**
   * Generates the main modal content with tabs
   */
  generateModalContent() {
    // Generate the tabbed content for the pre-launch modal
    return `
            <div class="pre-launch-modal">
                <!-- Tab Navigation with Hamburger Menu -->
                <nav class="pre-launch-tabs" role="tablist" aria-label="Pre-launch information tabs">
                    <!-- Mobile Hamburger Menu -->
                    <div class="tab-mobile-menu">
                        <button class="tab-hamburger" aria-label="Toggle navigation menu" aria-expanded="false">
                            <span class="hamburger-line"></span>
                            <span class="hamburger-line"></span>
                            <span class="hamburger-line"></span>
                        </button>
                        <span class="tab-current-label">Overview</span>
                    </div>
                    
                    <!-- Tab Buttons Container -->
                    <div class="tab-buttons-container">
                        <button class="tab-button active" data-tab="overview" role="tab" aria-selected="true" aria-controls="tab-overview">
                            <span class="tab-icon">🎯</span>
                            Overview
                        </button>
                        <button class="tab-button" data-tab="objectives" role="tab" aria-selected="false" aria-controls="tab-objectives">
                            <span class="tab-icon">📚</span>
                            Learning Goals
                        </button>
                        <button class="tab-button" data-tab="ethics" role="tab" aria-selected="false" aria-controls="tab-ethics">
                            <span class="tab-icon">⚖️</span>
                            Ethics Guide
                        </button>
                        <button class="tab-button" data-tab="preparation" role="tab" aria-selected="false" aria-controls="tab-preparation">
                            <span class="tab-icon">🚀</span>
                            Get Ready
                        </button>
                        <button class="tab-button" data-tab="resources" role="tab" aria-selected="false" aria-controls="tab-resources">
                            <span class="tab-icon">📖</span>
                            Resources
                        </button>
                        ${
                          this.options.showEducatorResources
                            ? `
                            <button class="tab-button" data-tab="educator" role="tab" aria-selected="false" aria-controls="tab-educator">
                                <span class="tab-icon">👨‍🏫</span>
                                For Educators
                            </button>
                        `
                            : ""
                        }
                    </div>
                </nav>
                
                <!-- Tab Content -->
                <div class="pre-launch-content">
                    ${this.generateOverviewTab()}
                    ${this.generateObjectivesTab()}
                    ${this.generateEthicsTab()}
                    ${this.generatePreparationTab()}
                    ${this.generateResourcesTab()}
                    ${this.options.showEducatorResources ? this.generateEducatorTab() : ""}
                </div>
            </div>
        `;
  }

  /**
   * Generates the overview tab content
   */
  generateOverviewTab() {
    const info = this.simulationInfo;

    return `
            <div class="tab-content active" id="tab-overview" role="tabpanel" aria-labelledby="tab-overview">
                <div class="simulation-overview">
                    <div class="overview-header">
                        <h3>${info.title}</h3>
                        <p class="subtitle">${info.subtitle}</p>
                    </div>
                    
                    <div class="overview-meta">
                        <div class="meta-item">
                            <span class="meta-label">Duration:</span>
                            <span class="meta-value">${info.duration}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Difficulty:</span>
                            <span class="meta-value difficulty-${info.difficulty}">${this.capitalizeFirst(info.difficulty)}</span>
                        </div>
                        <div class="meta-item">
                            <span class="meta-label">Recommended Age:</span>
                            <span class="meta-value">${info.recommendedAge}</span>
                        </div>
                    </div>
                    
                    <div class="overview-description">
                        <h4>What You'll Explore</h4>
                        <div class="briefing-text">
                            ${this.formatText(info.beforeYouStart.briefing)}
                        </div>
                    </div>
                    
                    <div class="scenario-overview">
                        <h4>Scenario Overview</h4>
                        <p>${info.beforeYouStart.scenarioOverview}</p>
                    </div>
                    
                    ${
                      info.contentNotes.length > 0
                        ? `
                        <div class="content-notes">
                            <h4>Content Notes</h4>
                            <ul class="notes-list">
                                ${info.contentNotes.map((note) => `<li>${note}</li>`).join("")}
                            </ul>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  /**
   * Generates the learning objectives tab
   */
  generateObjectivesTab() {
    const info = this.simulationInfo;

    return `
            <div class="tab-content" id="tab-objectives" role="tabpanel" aria-labelledby="tab-objectives">
                <div class="learning-objectives">
                    <div class="objectives-section">
                        <h4>Learning Objectives</h4>
                        <p class="section-description">By the end of this exploration, you will be able to:</p>
                        <ul class="objectives-list">
                            ${info.learningObjectives
                              .map(
                                (objective) => `
                                <li class="objective-item">
                                    <span class="objective-icon">🎯</span>
                                    ${objective}
                                </li>
                            `,
                              )
                              .join("")}
                        </ul>
                    </div>
                    
                    <div class="standards-section">
                        <h4>ISTE Standards Alignment</h4>
                        <p class="section-description">This simulation supports these ISTE Standards for Students:</p>
                        <ul class="standards-list">
                            ${info.isteCriteria
                              .map(
                                (standard) => `
                                <li class="standard-item">
                                    <span class="standard-icon">📋</span>
                                    ${standard}
                                </li>
                            `,
                              )
                              .join("")}
                        </ul>
                    </div>
                    
                    ${
                      info.prerequisites.length > 0
                        ? `
                        <div class="prerequisites-section">
                            <h4>Prerequisites</h4>
                            <p class="section-description">For the best experience, you should have:</p>
                            <ul class="prerequisites-list">
                                ${info.prerequisites
                                  .map(
                                    (prereq) => `
                                    <li class="prerequisite-item">
                                        <span class="prereq-icon">📚</span>
                                        ${prereq}
                                    </li>
                                `,
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  /**
   * Generates the ethics guide tab
   */
  generateEthicsTab() {
    const radarInfo = getRadarChartExplanation();
    const glossary = getEthicsGlossary();

    return `
            <div class="tab-content" id="tab-ethics" role="tabpanel" aria-labelledby="tab-ethics">
                <div class="ethics-guide">
                    <div class="radar-explanation">
                        <h4>${radarInfo.title}</h4>
                        <p class="section-description">${radarInfo.overview}</p>
                        
                        <div class="ethics-features">
                            ${radarInfo.features
                              .map(
                                (feature) => `
                                <div class="feature-item">
                                    <h5>${feature.title}</h5>
                                    <p>${feature.description}</p>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        
                        <div class="interpretation-guide">
                            <h5>How to Interpret the Chart</h5>
                            <p>${radarInfo.interpretation}</p>
                        </div>
                    </div>
                    
                    <div class="ethics-dimensions">
                        <h4>Ethical Dimensions Explained</h4>
                        <p class="section-description">Each point on the radar chart represents one of these ethical considerations:</p>
                        
                        <div class="dimensions-grid">
                            ${glossary
                              .map(
                                (dimension) => `
                                <div class="dimension-item">
                                    <div class="dimension-header">
                                        <span class="dimension-color" style="background-color: ${dimension.color}"></span>
                                        <h5>${dimension.label}</h5>
                                    </div>
                                    <p>${dimension.description}</p>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                        
                        <div class="ethics-reminder">
                            <p><strong>Remember:</strong> These dimensions often interact and sometimes conflict. Real ethical decision-making involves thoughtfully balancing these competing values based on context and consequences.</p>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates the preparation tab
   */
  generatePreparationTab() {
    const info = this.simulationInfo;

    return `
            <div class="tab-content" id="tab-preparation" role="tabpanel" aria-labelledby="tab-preparation">
                <div class="preparation-content">
                    <div class="preparation-tips">
                        <h4>Preparation Tips</h4>
                        <p class="section-description">Before you start exploring, consider these suggestions:</p>
                        <ul class="tips-list">
                            ${info.beforeYouStart.preparationTips
                              .map(
                                (tip) => `
                                <li class="tip-item">
                                    <span class="tip-icon">💡</span>
                                    ${tip}
                                </li>
                            `,
                              )
                              .join("")}
                        </ul>
                    </div>
                    
                    <div class="vocabulary-section">
                        <h4>Key Vocabulary</h4>
                        <p class="section-description">Important terms you'll encounter:</p>
                        <div class="vocabulary-grid">
                            ${info.beforeYouStart.vocabulary
                              .map(
                                (item) => `
                                <div class="vocabulary-card">
                                    <h5 class="vocab-term">${item.term}</h5>
                                    <p class="vocab-definition">${item.definition}</p>
                                </div>
                            `,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates the resources tab
   */
  generateResourcesTab() {
    const info = this.simulationInfo;

    return `
            <div class="tab-content" id="tab-resources" role="tabpanel" aria-labelledby="tab-resources">
                <div class="resources-content">
                    <div class="resources-intro">
                        <h4>Related Resources</h4>
                        <p class="section-description">Explore these resources to deepen your understanding:</p>
                    </div>
                    
                    <div class="resources-grid">
                        ${info.relatedResources
                          .map(
                            (resource) => `
                            <div class="resource-card" data-audience="${resource.audience}">
                                <div class="resource-header">
                                    <span class="resource-type resource-type-${resource.type}">${this.getResourceTypeIcon(resource.type)}</span>
                                    <span class="resource-audience">${this.capitalizeFirst(resource.audience)}</span>
                                </div>
                                <h5 class="resource-title">${resource.title}</h5>
                                <p class="resource-description">${resource.description}</p>
                                <a href="${resource.url}" target="_blank" rel="noopener noreferrer" class="resource-link">
                                    View Resource <span class="external-icon">↗</span>
                                </a>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                    
                    ${
                      info.connectedSimulations.length > 0
                        ? `
                        <div class="connected-simulations">
                            <h4>Related Simulations</h4>
                            <p class="section-description">Continue your learning journey with these connected explorations:</p>
                            <div class="connected-list">
                                ${info.connectedSimulations
                                  .map(
                                    (simId) => `
                                    <button class="connected-sim-button" data-simulation="${simId}">
                                        Explore: ${this.getSimulationTitle(simId)}
                                    </button>
                                `,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    `
                        : ""
                    }
                </div>
            </div>
        `;
  }

  /**
   * Generates the educator resources tab
   */
  generateEducatorTab() {
    const info = this.simulationInfo;
    const resources = info.educatorResources;

    return `
            <div class="tab-content" id="tab-educator" role="tabpanel" aria-labelledby="tab-educator">
                <div class="educator-content">
                    <div class="educator-intro">
                        <h4>Educator Resources</h4>
                        <p class="section-description">Tools and guidance for classroom implementation:</p>
                    </div>
                    
                    <div class="educator-sections">
                        <div class="educator-section">
                            <h5>Discussion Questions</h5>
                            <ul class="discussion-questions">
                                ${resources.discussionQuestions
                                  .map(
                                    (question) => `
                                    <li class="discussion-item">${question}</li>
                                `,
                                  )
                                  .join("")}
                            </ul>
                        </div>
                        
                        <div class="educator-section">
                            <h5>Extension Activities</h5>
                            <ul class="extension-activities">
                                ${resources.extensionActivities
                                  .map(
                                    (activity) => `
                                    <li class="activity-item">${activity}</li>
                                `,
                                  )
                                  .join("")}
                            </ul>
                        </div>
                        
                        <div class="educator-section">
                            <h5>Classroom Tips</h5>
                            <ul class="classroom-tips">
                                ${resources.classroomTips
                                  .map(
                                    (tip) => `
                                    <li class="tip-item">${tip}</li>
                                `,
                                  )
                                  .join("")}
                            </ul>
                        </div>
                        
                        <div class="educator-section">
                            <h5>Standards Alignment</h5>
                            <ul class="standards-alignment">
                                ${resources.relatedStandards
                                  .map(
                                    (standard) => `
                                    <li class="standard-item">${standard}</li>
                                `,
                                  )
                                  .join("")}
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates modal footer with action buttons
   */
  generateModalFooter() {
    return `
            <div class="pre-launch-footer">
                <div class="action-buttons">
                    <button type="button" class="btn-cancel" id="cancel-launch">
                        Maybe Later
                    </button>
                    <button type="button" class="btn-launch" id="start-exploration">
                        <span class="button-icon">🚀</span>
                        Start Exploration
                    </button>
                </div>
            </div>
        `;
  }

  /**
   * Sets up event listeners for modal interactions
   */
  setupEventListeners() {
    // Ensure modal container exists and has the expected structure
    if (!this.modal) {
      logger.error("Modal instance not available for event listener setup");
      return;
    }

    if (!this.modal.element) {
      logger.error("Modal element not available. Modal structure:", this.modal);
      return;
    }

    if (typeof this.modal.element.querySelectorAll !== "function") {
      logger.error(
        "Modal element does not have querySelectorAll method. Element type:",
        typeof this.modal.element,
        this.modal.element,
      );
      return;
    }

    try {
      // Hamburger menu toggle (mobile navigation)
      const hamburgerButton =
        this.modal.element.querySelector(".tab-hamburger");
      const tabButtonsContainer = this.modal.element.querySelector(
        ".tab-buttons-container",
      );

      if (hamburgerButton && tabButtonsContainer) {
        hamburgerButton.addEventListener("click", () => {
          const isExpanded =
            hamburgerButton.getAttribute("aria-expanded") === "true";
          hamburgerButton.setAttribute("aria-expanded", !isExpanded);
          tabButtonsContainer.classList.toggle("expanded", !isExpanded);
        });

        // Close menu when clicking outside
        document.addEventListener("click", (e) => {
          // Don't interfere with onboarding coach marks
          if (e.target.closest(".onboarding-coach-mark")) {
            return;
          }

          if (!e.target.closest(".pre-launch-tabs")) {
            hamburgerButton.setAttribute("aria-expanded", "false");
            tabButtonsContainer.classList.remove("expanded");
          }
        });

        // Close menu when pressing Escape key
        document.addEventListener("keydown", (e) => {
          if (
            e.key === "Escape" &&
            hamburgerButton.getAttribute("aria-expanded") === "true"
          ) {
            hamburgerButton.setAttribute("aria-expanded", "false");
            tabButtonsContainer.classList.remove("expanded");
            hamburgerButton.focus(); // Return focus to hamburger button
          }
        });
      }

      // Tab switching (scoped to this modal)
      const tabButtons = this.modal.element.querySelectorAll(".tab-button");
      const tabContainer = this.modal.element.querySelector(
        ".tab-buttons-container",
      );
      const tabNavigation =
        this.modal.element.querySelector(".pre-launch-tabs");

      // Handle scroll indicators for desktop tab overflow
      const updateScrollIndicators = () => {
        if (tabContainer && tabNavigation) {
          const { scrollLeft, scrollWidth, clientWidth } = tabContainer;
          const canScrollLeft = scrollLeft > 0;
          const canScrollRight = scrollLeft < scrollWidth - clientWidth - 1;

          tabNavigation.classList.toggle("scrollable-left", canScrollLeft);
          tabNavigation.classList.toggle("scrollable-right", canScrollRight);
        }
      };

      // Update scroll indicators on container scroll and resize
      if (tabContainer) {
        tabContainer.addEventListener("scroll", updateScrollIndicators);
        window.addEventListener("resize", updateScrollIndicators);
        // Initial check
        const updateDelay = this._getConfigValue(
          "ui.animations.updateDelay",
          100,
        );
        setTimeout(updateScrollIndicators, updateDelay);
      }

      tabButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const tabId = e.target.dataset.tab || e.currentTarget.dataset.tab;
          if (tabId) {
            this.switchTab(tabId);

            // Close mobile menu after tab selection
            if (hamburgerButton && tabButtonsContainer) {
              hamburgerButton.setAttribute("aria-expanded", "false");
              tabButtonsContainer.classList.remove("expanded");
            }
          } else {
            logger.warn(
              "Tab button clicked but no data-tab attribute found",
              e.target,
            );
          }
        });
      });

      // Action buttons (scoped to this modal)
      const startButton =
        this.modal.element.querySelector("#start-exploration");
      const cancelButton = this.modal.element.querySelector("#cancel-launch");

      if (startButton) {
        startButton.addEventListener("click", () => {
          logger.debug("Start Exploration button clicked", {
            simulationId: this.simulationId,
            onLaunch: typeof this.options.onLaunch,
          });

          this.trackAnalytics("simulation_launched");
          this.close();

          // Call the onLaunch callback
          if (typeof this.options.onLaunch === "function") {
            logger.debug("Calling onLaunch callback");
            this.options.onLaunch(this.simulationId);
          } else {
            logger.error("onLaunch is not a function:", this.options.onLaunch);
          }
        });
      } else {
        logger.error("Start button not found in modal");
      }

      if (cancelButton) {
        cancelButton.addEventListener("click", () => {
          this.trackAnalytics("launch_cancelled");
          this.close();
          this.options.onCancel();
        });
      }

      // Connected simulation buttons
      const connectedButtons = document.querySelectorAll(
        ".connected-sim-button",
      );
      connectedButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          const targetSimId = e.target.dataset.simulation;
          this.trackAnalytics("connected_simulation_clicked", {
            target: targetSimId,
          });
          // Could trigger loading of connected simulation
        });
      });

      // Resource link tracking
      const resourceLinks = document.querySelectorAll(".resource-link");
      resourceLinks.forEach((link) => {
        link.addEventListener("click", (e) => {
          this.trackAnalytics("resource_accessed", {
            url: e.target.href,
            type: e.target
              .closest(".resource-card")
              .querySelector(".resource-type").textContent,
          });
        });
      });
    } catch (error) {
      logger.error("Error setting up PreLaunchModal event listeners:", error);
    }
  }

  /**
   * Switches to a different tab with enterprise performance monitoring
   */
  switchTab(tabId) {
    const startTime = performance.now();

    if (!tabId) {
      logger.warn("switchTab called with null or undefined tabId");
      this._logTelemetry("tab_switch_invalid", { tabId });
      return;
    }

    try {
      // Circuit breaker check for tab switching
      if (this.circuitBreaker.state === "open") {
        this._logTelemetry("tab_switch_blocked_circuit_open", { tabId });
        logger.warn(`Tab switch to ${tabId} blocked: Circuit breaker is open`);
        return;
      }

      // Find the modal container to scope our searches
      const modalContainer =
        (this.modal && this.modal.element) ||
        document.querySelector(".pre-launch-modal");
      if (!modalContainer) {
        logger.warn("Pre-launch modal container not found");
        this._logTelemetry("tab_switch_failed_no_container", { tabId });
        return;
      }

      // Update buttons (scoped to the modal)
      const allTabButtons = modalContainer.querySelectorAll(".tab-button");
      allTabButtons.forEach((btn) => {
        btn.classList.remove("active");
        btn.setAttribute("aria-selected", "false");
      });

      const targetButton = modalContainer.querySelector(
        `[data-tab="${tabId}"]`,
      );
      if (targetButton) {
        targetButton.classList.add("active");
        targetButton.setAttribute("aria-selected", "true");

        // Scroll tab into view if needed (desktop only)
        const tabContainer = modalContainer.querySelector(
          ".tab-buttons-container",
        );
        const mobileBreakpoint = this._getConfigValue(
          "ui.layout.mobileBreakpoint",
          768,
        );
        if (tabContainer && window.innerWidth > mobileBreakpoint) {
          targetButton.scrollIntoView({
            behavior: "smooth",
            block: "nearest",
            inline: "center",
          });
        }

        // Update mobile menu current label
        const currentLabel = modalContainer.querySelector(".tab-current-label");
        if (currentLabel) {
          const buttonText = targetButton.textContent.trim();
          currentLabel.textContent = buttonText;
        }
      } else {
        logger.warn(`Tab button with data-tab="${tabId}" not found in modal`);
        this._logTelemetry("tab_switch_failed_button_not_found", { tabId });
      }

      // Update content (scoped to the modal)
      const allTabContent = modalContainer.querySelectorAll(".tab-content");
      allTabContent.forEach((content) => {
        content.classList.remove("active");
      });

      const targetContent = modalContainer.querySelector(`#tab-${tabId}`);
      if (targetContent) {
        targetContent.classList.add("active");
      } else {
        logger.warn(`Tab content with id="tab-${tabId}" not found in modal`);
        this._logTelemetry("tab_switch_failed_content_not_found", { tabId });
      }

      // Update state and tracking
      const previousTab = this.currentTab;
      this.currentTab = tabId;

      // Track performance and analytics
      const switchTime = performance.now() - startTime;
      this._recordPerformanceMetric("tab_switch", switchTime, {
        fromTab: previousTab,
        toTab: tabId,
      });
      this._updateCircuitBreaker(true); // Success

      this.trackAnalytics("tab_switched", { tab: tabId });
      this._logTelemetry("tab_switched", {
        fromTab: previousTab,
        toTab: tabId,
        switchTime: Math.round(switchTime * 100) / 100,
      });
    } catch (error) {
      this._handleError(error, "switchTab", () => this.switchTab(tabId));
      logger.error("Error in switchTab:", error);
    }
  }

  // Helper methods
  capitalizeFirst(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  formatText(text) {
    return text
      .split("\n\n")
      .map((paragraph) => `<p>${paragraph.trim()}</p>`)
      .join("");
  }

  getResourceTypeIcon(type) {
    const icons = {
      article: "📄",
      video: "🎥",
      research: "🔬",
      interactive: "🖥️",
      book: "📚",
      website: "🌐",
    };
    return icons[type] || "📎";
  }

  getSimulationTitle(simId) {
    const simInfo = getSimulationInfo(simId);
    return simInfo ? simInfo.title : simId;
  }

  trackAnalytics(event, data = {}) {
    if (simpleAnalytics) {
      simpleAnalytics.trackEvent("pre_launch", {
        event,
        simulation: this.simulationId,
        tab: this.currentTab,
        ...data,
      });
    }
  }

  // ===== ENTERPRISE STATIC UTILITIES =====
  /**
   * Enterprise health diagnostics for PreLaunchModal component
   * @returns {Object} Comprehensive health report
   */
  static getHealthReport() {
    try {
      const instances = PreLaunchModal._instances || new Set();
      const report = {
        timestamp: Date.now(),
        instanceCount: instances.size,
        systemHealth: "healthy",
        instances: [],
        performance: {
          averageRenderTime: 0,
          averageTabSwitchTime: 0,
          totalModalsShown: 0,
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
      let totalTabSwitchTime = 0;
      let totalModalsShown = 0;

      instances.forEach((instance) => {
        const instanceHealth = {
          id: instance.instanceId,
          simulationId: instance.simulationId,
          isHealthy: instance.isHealthy,
          circuitBreakerState: instance.circuitBreaker?.state || "unknown",
          renderCount: instance.performanceMetrics?.renderCount || 0,
          tabSwitchCount: instance.performanceMetrics?.tabSwitchCount || 0,
          averageRenderTime:
            instance.performanceMetrics?.averageRenderTime || 0,
          averageTabSwitchTime:
            instance.performanceMetrics?.averageTabSwitchTime || 0,
          errorCount: instance.errorCount || 0,
          lastError: instance.lastError || null,
          uptime: Date.now() - instance.createdAt,
          currentTab: instance.currentTab,
        };

        report.instances.push(instanceHealth);
        totalRenderTime +=
          instanceHealth.averageRenderTime * instanceHealth.renderCount;
        totalTabSwitchTime +=
          instanceHealth.averageTabSwitchTime * instanceHealth.tabSwitchCount;
        totalModalsShown += instanceHealth.renderCount;

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
      if (totalModalsShown > 0) {
        report.performance.averageRenderTime =
          Math.round((totalRenderTime / totalModalsShown) * 100) / 100;
        report.performance.totalModalsShown = totalModalsShown;
      }

      if (instances.size > 0) {
        const totalTabSwitches = Array.from(instances).reduce(
          (sum, inst) => sum + (inst.performanceMetrics?.tabSwitchCount || 0),
          0,
        );
        if (totalTabSwitches > 0) {
          report.performance.averageTabSwitchTime =
            Math.round((totalTabSwitchTime / totalTabSwitches) * 100) / 100;
        }
      }

      return report;
    } catch (error) {
      console.error("[PreLaunchModal] Error generating health report:", error);
      return {
        timestamp: Date.now(),
        systemHealth: "error",
        error: error.message,
        instanceCount: 0,
        instances: [],
        performance: {
          averageRenderTime: 0,
          averageTabSwitchTime: 0,
          totalModalsShown: 0,
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
      const instances = PreLaunchModal._instances || new Set();
      const metrics = {
        timestamp: Date.now(),
        totalInstances: instances.size,
        aggregatedMetrics: {
          totalRenders: 0,
          totalTabSwitches: 0,
          totalRenderTime: 0,
          totalTabSwitchTime: 0,
          averageRenderTime: 0,
          averageTabSwitchTime: 0,
          minRenderTime: Infinity,
          maxRenderTime: 0,
          errorRate: 0,
          totalErrors: 0,
        },
        instanceMetrics: [],
      };

      let totalRenderTime = 0;
      let totalTabSwitchTime = 0;
      let totalRenders = 0;
      let totalTabSwitches = 0;
      let totalErrors = 0;

      instances.forEach((instance) => {
        const perf = instance.performanceMetrics || {};
        const instanceMetric = {
          id: instance.instanceId,
          simulationId: instance.simulationId,
          renderCount: perf.renderCount || 0,
          tabSwitchCount: perf.tabSwitchCount || 0,
          averageRenderTime: perf.averageRenderTime || 0,
          averageTabSwitchTime: perf.averageTabSwitchTime || 0,
          totalRenderTime: perf.totalRenderTime || 0,
          totalTabSwitchTime: perf.totalTabSwitchTime || 0,
          errorCount: instance.errorCount || 0,
          memoryUsage: perf.memoryUsage || 0,
          uptime: Date.now() - instance.createdAt,
        };

        metrics.instanceMetrics.push(instanceMetric);

        totalRenders += instanceMetric.renderCount;
        totalTabSwitches += instanceMetric.tabSwitchCount;
        totalRenderTime += instanceMetric.totalRenderTime;
        totalTabSwitchTime += instanceMetric.totalTabSwitchTime;
        totalErrors += instanceMetric.errorCount;

        if (instanceMetric.averageRenderTime > 0) {
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
      metrics.aggregatedMetrics.totalTabSwitches = totalTabSwitches;
      metrics.aggregatedMetrics.totalRenderTime =
        Math.round(totalRenderTime * 100) / 100;
      metrics.aggregatedMetrics.totalTabSwitchTime =
        Math.round(totalTabSwitchTime * 100) / 100;
      metrics.aggregatedMetrics.totalErrors = totalErrors;

      if (totalRenders > 0) {
        metrics.aggregatedMetrics.averageRenderTime =
          Math.round((totalRenderTime / totalRenders) * 100) / 100;
        metrics.aggregatedMetrics.errorRate =
          Math.round((totalErrors / totalRenders) * 10000) / 100; // Percentage with 2 decimals
      }

      if (totalTabSwitches > 0) {
        metrics.aggregatedMetrics.averageTabSwitchTime =
          Math.round((totalTabSwitchTime / totalTabSwitches) * 100) / 100;
      }

      if (metrics.aggregatedMetrics.minRenderTime === Infinity) {
        metrics.aggregatedMetrics.minRenderTime = 0;
      }

      return metrics;
    } catch (error) {
      console.error(
        "[PreLaunchModal] Error generating performance metrics:",
        error,
      );
      return {
        timestamp: Date.now(),
        error: error.message,
        totalInstances: 0,
        aggregatedMetrics: {
          totalRenders: 0,
          totalTabSwitches: 0,
          totalRenderTime: 0,
          totalTabSwitchTime: 0,
          averageRenderTime: 0,
          averageTabSwitchTime: 0,
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
   * Enterprise debugging utilities for PreLaunchModal
   * @returns {Object} Debug information for troubleshooting
   */
  static getDebugInfo() {
    try {
      const instances = PreLaunchModal._instances || new Set();
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
          id: instance.instanceId,
          simulationId: instance.simulationId,
          className: instance.constructor.name,
          isHealthy: instance.isHealthy,
          currentTab: instance.currentTab,
          isCategory: instance.isCategory,
          uptime: Date.now() - instance.createdAt,
          state: {
            modalOpen: !!instance.modal,
            hasSimulationInfo: !!instance.simulationInfo,
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
            healthCheckInterval: !!instance.healthCheckInterval,
            lastHealthCheck: instance.lastHealthCheck || null,
            lastTelemetryFlush: instance.lastTelemetryFlush || null,
          },
        };

        debug.instances.push(debugInfo);
      });

      return debug;
    } catch (error) {
      console.error("[PreLaunchModal] Error generating debug info:", error);
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
   * Force health check on all PreLaunchModal instances
   * @returns {Promise<Object>} Health check results
   */
  static async forceHealthCheck() {
    try {
      const instances = PreLaunchModal._instances || new Set();
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
            id: instance.instanceId,
            simulationId: instance.simulationId,
            isHealthy: instance.isHealthy,
            checkDuration: Math.round((endTime - startTime) * 100) / 100,
            circuitBreakerState: instance.circuitBreaker?.state || "unknown",
            errorCount: instance.errorCount || 0,
            uptime: Date.now() - instance.createdAt,
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
            id: instance.instanceId || "unknown",
            simulationId: instance.simulationId || "unknown",
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
      console.error("[PreLaunchModal] Error performing health checks:", error);
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
   * Emergency recovery for all PreLaunchModal instances
   * @returns {Promise<Object>} Recovery results
   */
  static async emergencyRecovery() {
    try {
      const instances = PreLaunchModal._instances || new Set();
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

          // Force re-render if modal is open
          if (instance.modal && typeof instance.modal.open === "function") {
            // Refresh modal content - would require modal refresh capability
            instance._logTelemetry("recovery_modal_refresh_attempted");
          }

          const endTime = performance.now();
          const result = {
            id: instance.instanceId,
            simulationId: instance.simulationId,
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
            simulationId: instance.simulationId || "unknown",
            recovered: false,
            error: error.message,
            recoveryDuration: 0,
          };
        }
      });

      results.results = await Promise.all(recoveryPromises);

      console.log(
        `[PreLaunchModal] Emergency recovery completed: ${results.recoveredInstances}/${results.totalInstances} instances recovered`,
      );
      return results;
    } catch (error) {
      console.error("[PreLaunchModal] Error during emergency recovery:", error);
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
