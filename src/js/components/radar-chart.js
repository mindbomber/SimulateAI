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
 * ⭐ ENTERPRISE-GRADE RADAR CHART VISUALIZATION SYSTEM ⭐
 *
 * Advanced ethical decision visualization component with comprehensive enterprise monitoring:
 * - Real-time performance tracking and health monitoring
 * - Circuit breaker pattern for fault tolerance
 * - User interaction analytics and engagement metrics
 * - Chart rendering performance optimization
 * - Enterprise telemetry and error recovery
 * - Memory usage monitoring and leak detection
 * - Static enterprise methods for instance management
 * - Data integrity validation and corruption detection
 */

import logger from "../utils/logger.js";
import {
  loadRadarConfig,
  getChartConstants,
  getEthicalAxes,
  getDefaultScores,
  getImpactDescription,
  getChartConfigTemplate,
  validateConfig,
  getEnterpriseConstants,
  initializeCSSIntegration,
} from "../utils/radar-config-loader.js";
import chartEventCoordinator from "../constants/chart-event-coordinator.js";

export default class RadarChart {
  static instanceCount = 0;
  static instanceCounter = 0; // Add missing static property
  static allInstances = new Set();
  static config = null;
  static animationCoordinator = {
    activeAnimations: 0,
    maxConcurrentAnimations: 1, // Limit to 1 animation at a time

    /**
     * Request permission to animate
     * @param {string} instanceId - The instance requesting animation
     * @param {string} context - The context (hero-demo, scenario, etc.)
     * @returns {boolean} Whether animation is allowed
     */
    requestAnimation(instanceId, context) {
      // Hero demo gets lower priority if scenario animations are happening
      if (context === "hero-demo" && this.hasActiveScenarioAnimations()) {
        logger.info(
          "RadarChart",
          `Delaying hero demo animation due to active scenario animations`,
          {
            instanceId,
            activeAnimations: this.activeAnimations,
          },
        );
        return false;
      }

      if (this.activeAnimations < this.maxConcurrentAnimations) {
        this.activeAnimations++;
        logger.info("RadarChart", `Animation granted`, {
          instanceId,
          context,
          activeAnimations: this.activeAnimations,
        });
        return true;
      }

      return false;
    },

    /**
     * Release animation slot
     * @param {string} instanceId - The instance releasing animation
     */
    releaseAnimation(instanceId) {
      if (this.activeAnimations > 0) {
        this.activeAnimations--;
        logger.info("RadarChart", `Animation released`, {
          instanceId,
          activeAnimations: this.activeAnimations,
        });
      }
    },

    /**
     * Check if scenario animations are active
     * @returns {boolean}
     */
    hasActiveScenarioAnimations() {
      return Array.from(RadarChart.allInstances).some(
        (instance) =>
          instance.options?.context === "scenario" && instance.isAnimating,
      );
    },
  };

  /**
   * Load configuration once for all instances
   */
  static async loadConfiguration() {
    if (!RadarChart.config) {
      try {
        RadarChart.config = await loadRadarConfig();
        validateConfig(RadarChart.config);

        // Initialize CSS integration for consistent styling
        initializeCSSIntegration(RadarChart.config, {
          syncThemes: true,
          syncScoring: true,
        });

        logger.info(
          "RadarChart",
          "Configuration loaded, validated, and CSS synchronized",
        );
      } catch (error) {
        logger.error("RadarChart", "Failed to load configuration", error);
        throw error;
      }
    }
    return RadarChart.config;
  }

  /**
   * Initialize all radar charts with configuration
   */
  static async initializeAll() {
    await RadarChart.loadConfiguration();
    logger.info(
      "RadarChart",
      "Ready to create instances with loaded configuration",
    );
  }

  constructor(containerId, options = {}) {
    // === ENTERPRISE INITIALIZATION ===

    // Ensure configuration is loaded - Auto-load if not already loaded
    if (!RadarChart.config) {
      logger.warn(
        "RadarChart",
        "Configuration not preloaded, loading automatically",
      );
      // Auto-initialize configuration for better developer experience
      this.initializationPromise = this._initializeWithConfig(
        containerId,
        options,
      );
      return; // Exit early, actual initialization happens in _initializeWithConfig
    }

    this._initializeInstance(containerId, options);
  }

  /**
   * Initialize instance with automatic configuration loading
   * @private
   * @param {string} containerId - Container element ID
   * @param {Object} options - Chart options
   */
  async _initializeWithConfig(containerId, options) {
    try {
      await RadarChart.loadConfiguration();
      this._initializeInstance(containerId, options);
    } catch (error) {
      logger.error("RadarChart", "Failed to auto-load configuration", error);
      throw error;
    }
  }

  /**
   * Initialize the actual chart instance
   * @private
   * @param {string} containerId - Container element ID
   * @param {Object} options - Chart options
   */
  _initializeInstance(containerId, options) {
    const config = RadarChart.config;

    // === LOAD CONFIGURATION-BASED CONSTANTS ===
    this.CHART_CONSTANTS = getChartConstants(config);
    this.ETHICAL_AXES = getEthicalAxes(config);
    this.DEFAULT_SCORES = getDefaultScores(config);

    // Load enterprise constants with comprehensive validation
    try {
      this.ENTERPRISE_CONSTANTS = getEnterpriseConstants(config);
    } catch (error) {
      logger.warn(
        "RadarChart",
        "Failed to load enterprise constants from config:",
        error.message,
      );
      this.ENTERPRISE_CONSTANTS = null;
    }

    // Validate enterprise constants structure thoroughly
    if (
      !this.ENTERPRISE_CONSTANTS ||
      !this.ENTERPRISE_CONSTANTS.TELEMETRY ||
      !this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES ||
      !this.ENTERPRISE_CONSTANTS.HEALTH ||
      !this.ENTERPRISE_CONSTANTS.ERROR_RECOVERY
    ) {
      logger.warn(
        "RadarChart",
        "Enterprise constants not loaded properly or missing required structure, using defaults",
      );
      this.ENTERPRISE_CONSTANTS = this._getDefaultEnterpriseConstants();
    }

    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      throw new Error(`Container element "${containerId}" not found`);
    }

    // Track instance creation for analytics
    logger.log(
      "RadarChart",
      `Creating new instance in container: ${containerId}`,
    );

    // === MERGE AND VALIDATE OPTIONS ===
    this.options = {
      ...config.chartDefaults,
      width: options.width || this.CHART_CONSTANTS.DEFAULT_CHART_SIZE,
      height: options.height || this.CHART_CONSTANTS.DEFAULT_CHART_SIZE,
      showLabels: options.showLabels !== false,
      showLegend: options.showLegend !== false,
      animated: options.animated !== false,
      realTime: options.realTime || false, // For scenario real-time updates
      title: options.title || "Ethical Impact Analysis",
      isDemo: options.isDemo || false, // For demo charts that need minimal styling
      context: options.context || this._determineContext(options), // Auto-detect context
      ...options,
    };

    // Validate chart options
    if (!this._validateChartOptions(this.options)) {
      throw new Error("Invalid chart configuration options");
    }

    // === ENTERPRISE INITIALIZATION ===
    this.instanceId = this._generateUUID();
    this.instanceNumber = ++RadarChart.instanceCounter;
    this.createdAt = Date.now();

    // Set container accessibility
    this.container.setAttribute("aria-label", "Interactive Radar Chart");
    this.container.setAttribute("role", "img");
    this.container.setAttribute("tabindex", "0");

    // === CHART CONFIGURATION ===
    this.chart = null;

    // Ensure initial scores are whole numbers
    if (this.options.scores) {
      const wholeNumberScores = {};
      for (const [axis, score] of Object.entries(this.options.scores)) {
        wholeNumberScores[axis] = Math.max(1, Math.min(5, Math.round(score)));
      }
      this.currentScores = { ...this.DEFAULT_SCORES, ...wholeNumberScores };
    } else {
      this.currentScores = { ...this.DEFAULT_SCORES };
    }

    // === ACCESSIBILITY INITIALIZATION ===
    // Note: Accessibility manager integration available if needed
    // this.accessibilityManager = new RadarChartAccessibility(this);

    logger.log(
      "RadarChart",
      "Using simple whole number scores (1-5 scale, default=3)",
      this.currentScores,
    );

    // Chart rendering and animation state
    this.isAnimating = false;
    // Removed unused pendingAnimations array

    // Track initialization status
    this.isInitialized = false;
    // Prevent parallel/double initialization
    this.initializing = false;
    // Track last init attempt to throttle recoveries
    this.lastInitAttempt = 0;

    // Enterprise health monitoring
    this.isHealthy = true;
    this.errorCount = 0;
    this.lastError = null;
    this.lastHealthCheck = Date.now();
    this.lastHeartbeat = Date.now();

    // Performance tracking
    this.performanceMetrics = {
      renderTimes: [],
      memoryUsage: [],
      frameDrops: 0,
      totalRenders: 0,
      lastRenderTime: 0,
      interactionCount: 0,
      dataUpdateCount: 0,
    };

    // Circuit breaker for error recovery
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: "closed", // closed, open, half-open
      isOpen: false,
    };

    // Enterprise telemetry batching
    this.telemetryBuffer = [];
    this.lastTelemetryFlush = Date.now();

    // User engagement tracking
    this.userJourney = {
      sessionId: this._generateUUID(),
      startTime: Date.now(),
      interactions: [],
      chartViews: 0,
      dataUpdates: 0,
      renderingErrors: 0,
    };

    // Track all instances for enterprise monitoring
    RadarChart.allInstances.add(this);

    // Register with event coordinator to prevent conflicts with other chart systems
    chartEventCoordinator.registerElement(
      this.container,
      "radar-chart.js",
      this,
    );

    // Initialize enterprise monitoring intervals
    this.healthCheckInterval = null;
    this.heartbeatInterval = null;
    this.telemetryFlushInterval = null;

    // Initialize enterprise monitoring
    this._initializeEnterpriseMonitoring();

    // Initialize chart after enterprise setup
    this.initializationPromise = this.initializeChart();

    logger.info("RadarChart", "🏢 Enterprise radar chart instance created", {
      instanceId: this.instanceId,
      containerId: this.containerId,
      totalInstances: RadarChart.instanceCounter,
    });
  }

  /**
   * Get default enterprise constants as fallback
   * @private
   * @returns {Object} Default enterprise constants
   */
  _getDefaultEnterpriseConstants() {
    return {
      TELEMETRY: {
        EVENT_TYPES: {
          CHART_RENDER: "chart_render",
          DATA_UPDATE: "data_update",
          USER_INTERACTION: "user_interaction",
          ERROR_EVENT: "error_event",
          PERFORMANCE_METRIC: "performance_metric",
        },
        BATCH_SIZE: 50,
        FLUSH_INTERVAL: 60000,
      },
      HEALTH: {
        CHECK_INTERVAL: 30000,
        ERROR_THRESHOLD: 10,
        MEMORY_THRESHOLD_MB: 50,
        RENDER_TIME_THRESHOLD_MS: 1000,
        HEARTBEAT_INTERVAL: 60000,
        PERFORMANCE_SAMPLE_SIZE: 100,
      },
      ERROR_RECOVERY: {
        CIRCUIT_BREAKER_THRESHOLD: 5,
        MAX_RETRY_ATTEMPTS: 3,
        RETRY_DELAY: 1000,
      },
    };
  }

  /**
   * Generate UUID for instance tracking
   * @private
   * @returns {string} UUID
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

  /**
   * Determine chart context based on options and container
   * @private
   * @param {Object} options - Chart options
   * @returns {string} Context type: 'hero-demo', 'scenario', or 'test'
   */
  _determineContext(options) {
    // Check container ID patterns
    if (
      this.containerId.includes("hero") ||
      this.containerId.includes("demo")
    ) {
      return "hero-demo";
    }

    if (this.containerId.includes("scenario") || options.realTime) {
      return "scenario";
    }

    if (
      this.containerId.includes("test") ||
      this.containerId.includes("debug")
    ) {
      return "test";
    }

    // Fallback based on isDemo flag
    return options.isDemo ? "hero-demo" : "scenario";
  }

  /**
   * Validate chart options
   * @private
   * @param {Object} options - Chart options to validate
   * @returns {boolean} True if options are valid
   */
  _validateChartOptions(options) {
    if (!options || typeof options !== "object") {
      logger.error("RadarChart", "Options must be a valid object");
      return false;
    }

    // Validate dimensions
    if (
      options.width &&
      (typeof options.width !== "number" || options.width <= 0)
    ) {
      logger.error("RadarChart", "Width must be a positive number");
      return false;
    }

    if (
      options.height &&
      (typeof options.height !== "number" || options.height <= 0)
    ) {
      logger.error("RadarChart", "Height must be a positive number");
      return false;
    }

    // Validate boolean options
    const booleanOptions = [
      "showLabels",
      "showLegend",
      "animated",
      "realTime",
      "isDemo",
    ];
    for (const boolOption of booleanOptions) {
      if (
        Object.prototype.hasOwnProperty.call(options, boolOption) &&
        typeof options[boolOption] !== "boolean"
      ) {
        logger.error("RadarChart", `${boolOption} must be a boolean value`);
        return false;
      }
    }

    // Validate string options
    if (options.title && typeof options.title !== "string") {
      logger.error("RadarChart", "Title must be a string");
      return false;
    }

    if (options.context && typeof options.context !== "string") {
      logger.error("RadarChart", "Context must be a string");
      return false;
    }

    // Validate scores object if provided
    if (options.scores) {
      if (typeof options.scores !== "object" || Array.isArray(options.scores)) {
        logger.error("RadarChart", "Scores must be an object");
        return false;
      }

      // Check that all score values are numbers within valid range
      for (const [axis, score] of Object.entries(options.scores)) {
        if (typeof score !== "number" || score < 1 || score > 5) {
          logger.error(
            "RadarChart",
            `Score for ${axis} must be a number between 1 and 5`,
          );
          return false;
        }
      }
    }

    logger.debug("RadarChart", "Chart options validation passed");
    return true;
  }

  /**
   * Initialize the Chart.js radar chart
   */
  async initializeChart() {
    const startTime = performance.now();

    try {
      // Prevent concurrent or duplicate initialization
      if (this.initializing) {
        logger.warn(
          "RadarChart",
          "Initialization already in progress, skipping",
        );
        return;
      }

      // If already initialized and chart exists, avoid rebuilding
      if (this.isInitialized && this.chart) {
        logger.info(
          "RadarChart",
          "Chart already initialized, skipping re-init",
        );
        return;
      }

      this.initializing = true;
      this.lastInitAttempt = Date.now();
      // Check circuit breaker
      if (this.circuitBreaker.isOpen) {
        logger.warn(
          "RadarChart",
          "Circuit breaker open, skipping initialization",
          {
            instanceId: this.instanceId,
          },
        );
        return;
      }

      logger.info("RadarChart", "Initializing radar chart");

      // Track chart initialization attempt (with safe access)
      if (this.ENTERPRISE_CONSTANTS?.TELEMETRY?.EVENT_TYPES?.CHART_RENDER) {
        this._logTelemetry(
          this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.CHART_RENDER,
          {
            operation: "initialization_start",
          },
        );
      }

      // Ensure Chart.js is loaded
      if (typeof window.Chart === "undefined") {
        logger.info("RadarChart", "Chart.js not found, loading");
        await this.loadChartJS();
        logger.info("RadarChart", "Chart.js loaded successfully");
      } else {
        logger.info("RadarChart", "Chart.js already available");
      }

      // Create canvas element with proper sizing
      const canvas = document.createElement("canvas");

      // CRITICAL: Let Chart.js handle canvas dimensions and DPR scaling for sharp rendering
      // Don't manually set canvas.width/height as it interferes with device pixel ratio

      // OPTIMIZED: Batch DOM style changes to minimize reflows
      const canvasStyles = {
        // In hero demo, let the canvas fully fill its container; elsewhere use configured size
        width:
          this.options.context === "hero-demo"
            ? "100%"
            : this.options.width + "px",
        height:
          this.options.context === "hero-demo"
            ? "100%"
            : this.options.height + "px",
        maxWidth: "100%",
        maxHeight: "100%",
        display: "block",
        margin: "0 auto",
        position: "relative",
        // FIXED: Use lower z-index for hero demo to avoid popover conflicts
        zIndex: this.options.context === "hero-demo" ? "0" : "1",
      };

      const containerStyles = {
        width: this.options.width + "px",
        height: this.options.height + "px",
        minHeight: this.options.height + "px",
        textAlign: "center",
        overflow: "visible",
        position: "relative",
        zIndex: "10",
      };

      // Apply all canvas styles in one batch to minimize reflows
      Object.assign(canvas.style, canvasStyles);

      // Get context for Chart.js (Chart.js will handle DPR scaling automatically)
      const ctx = canvas.getContext("2d");

      // PERFORMANCE: Enable crisp rendering hints (Chart.js will manage the actual scaling)
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // OPTIMIZED: Clear only existing canvas elements, preserve other content
      const existingCanvases = this.container.querySelectorAll("canvas");
      existingCanvases.forEach((canvas) => canvas.remove());

      // For hero demo containers, preserve existing structure but remove old charts
      if (this.options.context === "hero-demo") {
        // Only remove chart-related elements, keep popover and other UI
        const chartElements = this.container.querySelectorAll(
          ".chartjs-tooltip, .chart-fallback",
        );
        chartElements.forEach((el) => el.remove());
      } else {
        // For other contexts, can safely clear all content
        this.container.innerHTML = "";
      }

      // Apply container styles more conservatively for hero demo
      if (this.options.context === "hero-demo") {
        // For hero demo, only set essential chart container styles
        // FIXED: Remove z-index to avoid stacking context conflicts with popover content
        Object.assign(this.container.style, {
          textAlign: "center",
          overflow: "visible",
          position: "relative",
          // Don't set z-index for hero demo to avoid conflicts with popovers (z-index: 1000)
          // Don't override width/height for hero demo - let CSS handle it
        });
      } else {
        // For other contexts, apply all container styles
        Object.assign(this.container.style, containerStyles);
      }

      this.container.appendChild(canvas);

      // DPR SCALING INFO: Chart.js handles Device Pixel Ratio automatically for sharp rendering
      logger.info("RadarChart", "Canvas created with DPR scaling support", {
        cssWidth: canvas.style.width,
        cssHeight: canvas.style.height,
        containerMinHeight: this.container.style.minHeight,
        devicePixelRatio: window.devicePixelRatio || 1,
        note: "Chart.js will scale canvas.width/height automatically for sharp rendering",
      });

      logger.info(
        "RadarChart",
        "Canvas element created and appended to container",
      );

      // Apply visual enhancements classes BEFORE creating chart
      this._applyContextSpecificStyling();

      // Initialize Chart.js radar chart
      const config = this.getChartConfig();
      logger.info("RadarChart", "Creating chart with config", config);

      this.chart = new window.Chart(ctx, config);
      logger.info("RadarChart", "Chart created successfully");

      // Apply context-specific configuration
      this._applyContextSpecificConfiguration();

      // SIMPLIFIED: No complex tooltip z-index setup needed with built-in tooltips
      // Chart.js handles tooltip positioning and z-index automatically

      // OPTIMIZED: Single deferred initialization to minimize DOM thrashing
      // Combine all post-initialization tasks into one operation
      this._deferredInitialization();

      this.isInitialized = true;

      // Record successful initialization performance
      const initDuration = performance.now() - startTime;
      this._recordPerformanceMetric("chart_render", initDuration);

      // Track user journey
      this.userJourney.chartViews++;

      // Log successful initialization (with safe access)
      if (this.ENTERPRISE_CONSTANTS?.TELEMETRY?.EVENT_TYPES?.CHART_RENDER) {
        this._logTelemetry(
          this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.CHART_RENDER,
          {
            operation: "initialization_complete",
            duration: initDuration,
            containerId: this.containerId,
          },
        );
      }

      logger.info("RadarChart", "Radar chart initialized successfully", {
        instanceId: this.instanceId,
        duration: initDuration,
        chartViews: this.userJourney.chartViews,
      });
    } catch (error) {
      logger.error("Failed to initialize radar chart:", error);
      this._handleError(error, "initializeChart");
      // Enter a minimal error state instead of rendering legacy HTML fallback
      this._enterFailsafeMode();
    } finally {
      // Always clear initializing flag
      this.initializing = false;
    }
  }

  /**
   * Optimized deferred initialization to minimize DOM thrashing
   * Combines multiple post-initialization tasks into a single operation
   * @private
   */
  _deferredInitialization() {
    // Use requestAnimationFrame for optimal timing
    requestAnimationFrame(() => {
      if (!this.chart) return;

      // Single chart update instead of multiple scattered updates
      this.chart.update("none");
      logger.info("RadarChart", "Chart updated/redrawn");

      // Context-specific polygon visibility handling
      if (this.options.context === "scenario") {
        logger.info("RadarChart", "Ensuring scenario chart polygon visibility");
        this._ensureScenarioPolygonVisibility();
      } else if (this._isAllValuesEqual()) {
        logger.info(
          "RadarChart",
          "Checking if visibility fix needed for equal values",
          {
            isDemo: this.options.isDemo,
          },
        );
        this._ensureDefaultStateVisibility();
      }
    });
  }

  /**
   * Get Chart.js configuration
   */
  getChartConfig() {
    const config = RadarChart.config;
    const axesLabels = Object.values(this.ETHICAL_AXES).map(
      (axis) => axis.label,
    );
    const axesData = Object.values(this.currentScores);

    // Get base configuration template
    const baseConfig = getChartConfigTemplate(config, this.options);

    // Create gradient for the radar fill
    const gradientColors = this.createGradientColors();

    // Combine with data
    baseConfig.data = {
      labels: axesLabels,
      datasets: [
        {
          label: this.options.title,
          data: axesData,
          backgroundColor: gradientColors.background,
          borderColor: gradientColors.border,
          borderWidth: config.chartConfig.dataset.borderWidth,
          pointBackgroundColor: gradientColors.points,
          pointBorderColor: config.chartConfig.dataset.pointBorderColor,
          pointBorderWidth: config.chartConfig.dataset.pointBorderWidth,
          pointHoverBackgroundColor:
            config.chartConfig.dataset.pointHoverBackgroundColor,
          pointHoverBorderColor: gradientColors.border,
          pointRadius: config.chartConfig.dataset.pointRadius,
          pointHoverRadius: config.chartConfig.dataset.pointHoverRadius,
          tension: config.chartConfig.dataset.tension,
        },
      ],
    };

    // Use solid professional dark grid color for all lines
    baseConfig.options.scales.r.grid = {
      ...baseConfig.options.scales.r.grid,
      color: "rgba(156, 163, 175, 0.3)", // Professional dark gray for all grid lines
      lineWidth: config.chartConfig.scales.r.grid.lineWidth,
    };

    // Add label truncation with ellipsis for point labels
    baseConfig.options.scales.r.pointLabels = {
      ...baseConfig.options.scales.r.pointLabels,
      callback: function (label) {
        const maxLength = 10; // Maximum characters before ellipsis
        if (label.length > maxLength) {
          return label.substring(0, maxLength - 3) + "...";
        }
        return label;
      },
    };

    // Update animation duration from configuration
    baseConfig.options.animation.duration = this.options.animated
      ? config.chart.animationDuration
      : 0;

    // Add tooltip callbacks using configuration
    baseConfig.options.plugins.tooltip.callbacks = {
      title: (context) => {
        // Safety check: ensure context exists and has elements
        if (!context || !Array.isArray(context) || context.length === 0) {
          return "Ethical Analysis";
        }

        // Safety check: ensure first element exists and has dataIndex
        const firstElement = context[0];
        if (!firstElement || typeof firstElement.dataIndex !== "number") {
          return "Ethical Analysis";
        }

        const axisKey = Object.keys(this.ETHICAL_AXES)[firstElement.dataIndex];
        return axisKey && this.ETHICAL_AXES[axisKey]
          ? this.ETHICAL_AXES[axisKey].label
          : "Ethical Analysis";
      },
      label: (context) => {
        // Safety check: ensure context exists and has required properties
        if (
          !context ||
          typeof context.dataIndex !== "number" ||
          !context.parsed
        ) {
          return ["Score: N/A", "", "Data not available"];
        }

        const axisKey = Object.keys(this.ETHICAL_AXES)[context.dataIndex];
        const axisInfo = this.ETHICAL_AXES[axisKey];

        // Safety check: ensure axis info exists
        if (!axisInfo) {
          return ["Score: N/A", "", "Data not available"];
        }

        const score = context.parsed.r;
        const impact = getImpactDescription(config, score);

        return [
          `Score: ${score}/${config.scoring.maxScore} (${impact})`,
          ``,
          axisInfo.description,
        ];
      },
    };

    // SIMPLIFIED: Use Chart.js built-in tooltips with proper styling via CSS
    // Enable built-in tooltips - much simpler and more reliable
    baseConfig.options.plugins.tooltip.enabled = true;
    baseConfig.options.plugins.tooltip.intersect = false;
    baseConfig.options.plugins.tooltip.position = "nearest";

    // Style tooltips via CSS classes instead of complex external functions
    baseConfig.options.plugins.tooltip.displayColors = false;
    baseConfig.options.plugins.tooltip.backgroundColor =
      "rgba(255, 255, 255, 0.95)";
    baseConfig.options.plugins.tooltip.titleColor = "#1a202c";
    baseConfig.options.plugins.tooltip.bodyColor = "#2d3748";
    baseConfig.options.plugins.tooltip.borderColor = "rgba(156, 163, 175, 0.3)";
    baseConfig.options.plugins.tooltip.borderWidth = 1;
    baseConfig.options.plugins.tooltip.cornerRadius = 8;
    baseConfig.options.plugins.tooltip.padding = 12;

    // Set mobile breakpoint for tooltips
    if (window.innerWidth <= config.chart.mobileBreakpoint) {
      baseConfig.options.plugins.tooltip.enabled = false;
    }

    // CRITICAL FIX: Don't add onClick handler during initialization
    // This can interfere with Chart.js initial polygon rendering
    // Event handlers will be attached after chart is fully rendered
    // baseConfig.options.onClick = (event, activeElements) => {
    //   this.handleChartClick(event, activeElements);
    // };

    // CRITICAL: Add rendering optimization for sharp, crisp charts
    baseConfig.options.devicePixelRatio = window.devicePixelRatio || 1;
    baseConfig.options.responsive = true;
    // Allow the chart to grow to fill its container, especially for hero demo
    baseConfig.options.maintainAspectRatio = false;

    // Ensure crisp font rendering
    baseConfig.options.font = {
      family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
      size: 12,
      weight: "normal",
    };

    return baseConfig;
  }

  /**
   * Create simple blue gradient colors (always neutral theme)
   */
  createGradientColors() {
    const config = RadarChart.config;

    // Always use blue neutral theme - no complex score-based color calculations
    const themeColors = config.themes.neutral;

    // Use neutral gray points for all scores
    const points = Object.values(this.currentScores).map(
      () => config.pointColors["3"],
    );

    return {
      background: themeColors.background,
      border: themeColors.border,
      points,
    };
  }

  /**
   * Update scores for specific axes
   * @param {Object} scoreUpdates - Object with axis keys and new scores
   */
  updateScores(scoreUpdates) {
    const startTime = performance.now();

    try {
      // Check circuit breaker
      if (this.circuitBreaker.isOpen) {
        logger.warn(
          "RadarChart",
          "Circuit breaker open, skipping score update",
          {
            instanceId: this.instanceId,
          },
        );
        return;
      }

      // Validate and apply score updates - ensure whole numbers only
      for (const [axis, score] of Object.entries(scoreUpdates)) {
        if (axis in this.currentScores) {
          // Round to whole number and clamp between 1-5
          const wholeScore = Math.round(score);
          this.currentScores[axis] = Math.max(
            1, // MIN_SCORE is 1
            Math.min(5, wholeScore), // MAX_SCORE is 5
          );
        }
      }

      // Track data update
      this.userJourney.dataUpdates++;
      this.performanceMetrics.dataUpdateCount++;

      // For scenario charts, ensure smooth transitions
      if (this.options.context === "scenario") {
        this._refreshScenarioChartSmooth();
      } else {
        // Standard refresh for other chart types
        this.refreshChart();
      }

      // Record performance
      const updateDuration = performance.now() - startTime;
      this._recordPerformanceMetric("data_update", updateDuration);

      // Log telemetry
      this._logTelemetry(
        this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.DATA_UPDATE,
        {
          axesUpdated: Object.keys(scoreUpdates),
          updateCount: this.userJourney.dataUpdates,
          duration: updateDuration,
        },
      );
    } catch (error) {
      this._handleError(error, "updateScores");
    }
  }

  /**
   * Apply answer impact to scores
   * @param {Object} answerImpact - Object with axis keys and impact deltas
   */
  applyAnswerImpact(answerImpact) {
    const updates = {};

    for (const [axis, delta] of Object.entries(answerImpact)) {
      if (axis in this.currentScores) {
        // Start from current score and apply delta
        updates[axis] = this.currentScores[axis] + delta;
      }
    }

    this.updateScores(updates);

    // Log the impact for debugging
    logger.info(
      "Applied answer impact:",
      answerImpact,
      "New scores:",
      this.currentScores,
    );
  }

  /**
   * Reset all scores to neutral (3)
   */
  resetScores() {
    this.currentScores = { ...this.DEFAULT_SCORES };
    this.refreshChart(true); // Force refresh for reset
  }

  /**
   * Get current scores
   */
  getScores() {
    return { ...this.currentScores };
  }

  /**
   * Set scores directly
   */
  setScores(scores) {
    // Ensure all scores are whole numbers (1-5 range)
    const wholeNumberScores = {};
    for (const [axis, score] of Object.entries(scores)) {
      wholeNumberScores[axis] = Math.max(1, Math.min(5, Math.round(score)));
    }

    this.currentScores = { ...this.DEFAULT_SCORES, ...wholeNumberScores };
    this.refreshChart();
  }

  /**
   * Refresh the chart display
   */
  refreshChart(forceUpdate = false) {
    if (!this.chart) return;

    // OPTIMIZED: Check if data actually changed before updating
    const newData = Object.values(this.currentScores);
    const currentData = this.chart.data.datasets[0].data;

    // Skip update if data hasn't changed (unless forced)
    if (!forceUpdate && this._arraysEqual(newData, currentData)) {
      return;
    }

    // Update data
    this.chart.data.datasets[0].data = newData;

    // For scenario charts, use smooth animations; for demos, use configurable animations
    const animationMode =
      this.options.context === "scenario"
        ? "active"
        : this.options.animated
          ? "active"
          : "none";

    this.chart.update(animationMode);

    // OPTIMIZED: Only apply visibility fixes if needed and avoid nested setTimeout
    if (this._isAllValuesEqual()) {
      this._handleEqualValuesVisibility();
    }
  }

  /**
   * Check if two arrays are equal
   * @private
   */
  _arraysEqual(arr1, arr2) {
    if (arr1.length !== arr2.length) return false;
    return arr1.every((val, index) => val === arr2[index]);
  }

  /**
   * Handle visibility for equal values without nested timeouts
   * @private
   */
  _handleEqualValuesVisibility() {
    if (this.options.context === "scenario") {
      // For scenario charts, immediately ensure visibility
      this._ensureScenarioPolygonVisibility();
    } else {
      // For other charts, use single timeout
      if (this._visibilityTimeout) {
        clearTimeout(this._visibilityTimeout);
      }
      this._visibilityTimeout = setTimeout(() => {
        this._ensureDefaultStateVisibility();
        this._visibilityTimeout = null;
      }, 100);
    }
  }

  /**
   * Smooth refresh specifically for scenario charts
   * Ensures no jarring transitions when polygon becomes visible
   * @private
   */
  _refreshScenarioChartSmooth() {
    if (!this.chart || this.options.context !== "scenario") {
      this.refreshChart(); // Fallback to standard refresh
      return;
    }

    const axesData = Object.values(this.currentScores);

    // OPTIMIZED: Check if data actually changed before updating
    const currentData = this.chart.data.datasets[0].data;
    if (this._arraysEqual(axesData, currentData)) {
      return; // Skip update if data hasn't changed
    }

    // Check if this is the first real update from initial state
    const isTransitioningFromInitial = currentData.some(
      (val) => val !== Math.floor(val),
    );

    if (isTransitioningFromInitial) {
      logger.info("RadarChart", "Smooth transition from initial state", {
        currentData: currentData,
        newData: axesData,
      });
    }

    // Update data
    this.chart.data.datasets[0].data = axesData;

    // Always use smooth animation for scenario charts to prevent jarring transitions
    this.chart.update("active");

    // No need for visibility checks since scenario charts should always be visible
  }

  /**
   * Apply context-specific styling classes
   * @private
   */
  _applyContextSpecificStyling() {
    switch (this.options.context) {
      case "hero-demo":
        this.container.classList.add(
          "radar-chart-demo-container",
          "hero-radar-chart",
        );
        logger.info("RadarChart", "Applied hero demo styling classes");
        break;
      case "scenario":
        this.container.classList.add(
          "radar-chart-container",
          "scenario-radar-chart",
        );
        logger.info("RadarChart", "Applied scenario modal styling classes");
        break;
      case "test":
        this.container.classList.add(
          "radar-chart-container",
          "test-radar-chart",
        );
        logger.info("RadarChart", "Applied test chart styling classes");
        break;
      default:
        // Fallback to legacy behavior
        if (this.options.isDemo) {
          this.container.classList.add("radar-chart-demo-container");
        } else {
          this.container.classList.add("radar-chart-container");
        }
        logger.info("RadarChart", "Applied fallback styling classes");
    }
  }

  /**
   * Apply context-specific chart configuration
   * @private
   */
  _applyContextSpecificConfiguration() {
    const neutralTheme = RadarChart.config.themes.neutral;

    switch (this.options.context) {
      case "hero-demo":
        this._configureHeroDemoChart(neutralTheme);
        break;
      case "scenario":
        this._configureScenarioChart(neutralTheme);
        break;
      case "test":
        this._configureTestChart(neutralTheme);
        break;
      default:
        // Fallback to legacy behavior
        this._configureLegacyChart(neutralTheme);
    }
  }

  /**
   * Configure hero demo chart
   * @private
   * @param {Object} neutralTheme - Theme colors
   */
  _configureHeroDemoChart(neutralTheme) {
    // Hero demo charts: Optimized for interactive demonstrations
    // Batch all dataset changes to minimize DOM mutations
    const dataset = this.chart.data.datasets[0];
    dataset.backgroundColor = neutralTheme.background;
    dataset.borderColor = neutralTheme.border;
    dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];
    dataset.data = Object.values(this.DEFAULT_SCORES);

    // Use animation coordinator to prevent simultaneous animations
    const canAnimate = RadarChart.animationCoordinator.requestAnimation(
      this.instanceId,
      this.options.context,
    );

    if (canAnimate) {
      this.isAnimating = true;
      this.chart.update(); // Animated update

      // Release animation slot after completion
      setTimeout(
        () => {
          this.isAnimating = false;
          RadarChart.animationCoordinator.releaseAnimation(this.instanceId);
        },
        (RadarChart.config?.chart?.animationDuration || 1000) + 100,
      );
    } else {
      // No animation - instant update
      this.chart.update("none");

      // Queue animation for later if desired
      setTimeout(() => {
        if (
          RadarChart.animationCoordinator.requestAnimation(
            this.instanceId,
            this.options.context,
          )
        ) {
          this.isAnimating = true;
          this.chart.update();

          setTimeout(
            () => {
              this.isAnimating = false;
              RadarChart.animationCoordinator.releaseAnimation(this.instanceId);
            },
            (RadarChart.config?.chart?.animationDuration || 1000) + 100,
          );
        }
      }, 1500); // Delay hero demo animation if scenarios are active
    }

    logger.info("RadarChart", "Configured hero demo chart", {
      context: this.options.context,
      defaultScores: this.DEFAULT_SCORES,
      animated: canAnimate,
    });
  }

  /**
   * Configure scenario modal chart
   * @private
   * @param {Object} neutralTheme - Theme colors
   */
  _configureScenarioChart(neutralTheme) {
    // Scenario charts: Optimized for real-time ethical decision tracking
    // Batch all dataset changes to minimize DOM mutations
    const dataset = this.chart.data.datasets[0];
    dataset.backgroundColor = neutralTheme.background;
    dataset.borderColor = neutralTheme.border;
    dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];

    // CRITICAL: Ensure polygon visibility from the start for scenario charts
    // Use pure default pattern to match neutral state
    // This prevents the "abrupt appearance" when first option is selected
    const visiblePattern = [3, 3, 3, 3, 3, 3, 3, 3]; // All neutral defaults
    dataset.data = visiblePattern;

    // Keep current scores as whole numbers for consistency
    const axisKeys = Object.keys(this.ETHICAL_AXES);
    axisKeys.forEach((key) => {
      this.currentScores[key] = 3; // Keep all as neutral 3
    });

    // Scenario charts get priority for animations
    const canAnimate = RadarChart.animationCoordinator.requestAnimation(
      this.instanceId,
      this.options.context,
    );

    if (canAnimate) {
      this.isAnimating = true;
      this.chart.update("none"); // No animation for initial setup, but track as animated

      // Release quickly since this is just setup
      setTimeout(() => {
        this.isAnimating = false;
        RadarChart.animationCoordinator.releaseAnimation(this.instanceId);
      }, 100);
    } else {
      this.chart.update("none"); // No animation for initial setup
    }

    logger.info(
      "RadarChart",
      "Configured scenario modal chart with polygon visibility",
      {
        context: this.options.context,
        realTime: this.options.realTime,
        visiblePattern: visiblePattern,
        currentScores: this.currentScores,
        animated: canAnimate,
      },
    );
  }

  /**
   * Configure test/debug chart
   * @private
   * @param {Object} neutralTheme - Theme colors
   */
  _configureTestChart(neutralTheme) {
    // Test charts: Optimized for debugging and validation
    // Batch all dataset changes to minimize DOM mutations
    const dataset = this.chart.data.datasets[0];
    dataset.backgroundColor = neutralTheme.background;
    dataset.borderColor = neutralTheme.border;
    dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];
    dataset.data = Object.values(this.DEFAULT_SCORES);

    // Single chart update after all changes
    this.chart.update();

    logger.info("RadarChart", "Configured test chart", {
      context: this.options.context,
      containerId: this.containerId,
      defaultScores: this.DEFAULT_SCORES,
    });
  }

  /**
   * Configure chart using legacy method (fallback)
   * @private
   * @param {Object} neutralTheme - Theme colors
   */
  _configureLegacyChart(neutralTheme) {
    // Batch all dataset changes to minimize DOM mutations
    const dataset = this.chart.data.datasets[0];
    dataset.backgroundColor = neutralTheme.background;
    dataset.borderColor = neutralTheme.border;
    dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];
    dataset.data = Object.values(this.DEFAULT_SCORES);

    // Single chart update after all changes
    this.chart.update();

    logger.info("RadarChart", "Applied legacy chart configuration", {
      isDemo: this.options.isDemo,
      defaultScores: this.DEFAULT_SCORES,
    });
  }
  _isAllValuesEqual() {
    const values = Object.values(this.currentScores);
    const firstValue = values[0];
    return values.every((value) => value === firstValue);
  }

  /**
   * Helper to detect if chart data has actually changed
   * @private
   * @param {Array} newData - New data array
   * @returns {boolean} - Whether data changed
   */
  _hasDataChanged(newData) {
    if (!this.chart || !this.chart.data.datasets[0]) return true;
    const currentData = this.chart.data.datasets[0].data;
    return !this._arraysEqual(currentData, newData);
  }

  /**
   * SIMPLIFIED: Ensure visibility only when Chart.js can't render equal values
   * @private
   */
  _ensureDefaultStateVisibility() {
    if (!this.chart) return;

    // Only apply alternating pattern if Chart.js fails to render polygon with equal values
    // This should be rare with modern Chart.js versions
    if (this._isAllValuesEqual()) {
      logger.info(
        "RadarChart",
        "Applying visibility fix for Chart.js polygon rendering",
        { context: this.options.context },
      );

      let pattern;
      let description;

      // Context-aware visibility patterns
      switch (this.options.context) {
        case "hero-demo":
          // Hero demo: Always use pure default values (all 3s) for clean demonstrations
          pattern = [3, 3, 3, 3, 3, 3, 3, 3];
          description = "pure default pattern for hero demo";
          break;
        case "scenario":
          // Scenario charts: Use pure neutral pattern for consistency
          pattern = [3, 3, 3, 3, 3, 3, 3, 3];
          description = "pure neutral pattern for scenario chart";
          break;
        case "test":
          // Test charts: Use pure defaults for predictable testing
          pattern = [3, 3, 3, 3, 3, 3, 3, 3];
          description = "pure default pattern for test chart";
          break;
        default:
          // Legacy fallback
          if (this.options.isDemo) {
            pattern = [3, 3, 3, 3, 3, 3, 3, 3];
            description = "pure default pattern (legacy demo)";
          } else {
            pattern = [3, 3, 3, 3, 3, 3, 3, 3];
            description = "pure neutral pattern (legacy scenario)";
          }
      }

      logger.info("RadarChart", `Using ${description}`, {
        context: this.options.context,
        pattern: pattern,
      });

      // Update chart data with chosen pattern
      this.chart.data.datasets[0].data = pattern;

      // OPTIMIZED: Check if colors need updating
      const neutralTheme = RadarChart.config.themes.neutral;
      const dataset = this.chart.data.datasets[0];
      const needsColorUpdate =
        dataset.backgroundColor !== neutralTheme.background ||
        dataset.borderColor !== neutralTheme.border ||
        dataset.pointBackgroundColor !== RadarChart.config.pointColors["3"];

      if (needsColorUpdate) {
        // Apply neutral colors
        dataset.backgroundColor = neutralTheme.background;
        dataset.borderColor = neutralTheme.border;
        dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];

        // Single update
        this.chart.update("none");
      }
    }
  }

  /**
   * Ensure scenario chart polygon is visible from initialization
   * Prevents abrupt polygon appearance when first option is selected
   * @private
   */
  _ensureScenarioPolygonVisibility() {
    if (!this.chart || this.options.context !== "scenario") return;

    // OPTIMIZED: Check if already applied
    const currentData = this.chart.data.datasets[0].data;
    const targetPattern = [3, 3, 3, 3, 3, 3, 3, 3]; // All neutral defaults

    if (this._arraysEqual(currentData, targetPattern)) {
      return; // Already applied, skip update
    }

    // For scenario charts, use pure neutral pattern to match default state
    // Chart.js should handle polygon rendering correctly with equal values
    this.chart.data.datasets[0].data = targetPattern;

    // Keep current scores as neutral whole numbers for consistency
    const axisKeys = Object.keys(this.ETHICAL_AXES);
    axisKeys.forEach((key) => {
      this.currentScores[key] = 3; // Keep all neutral
    });

    // Apply neutral colors to ensure consistent appearance
    const neutralTheme = RadarChart.config.themes.neutral;
    const dataset = this.chart.data.datasets[0];
    dataset.backgroundColor = neutralTheme.background;
    dataset.borderColor = neutralTheme.border;
    dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];

    // Smooth update without animation to prevent jarring transitions
    this.chart.update("none");

    logger.info("RadarChart", "Applied scenario chart polygon visibility fix", {
      context: this.options.context,
      pattern: targetPattern,
      currentScores: this.currentScores,
    });
  }

  /**
   * Get demo pattern from JSON SSOT configuration
   * @param {string} patternName - Pattern name (utilitarian, deontological, etc.)
   * @returns {Object|null} Pattern data or null if not found
   */
  getDemoPattern(patternName) {
    const config = RadarChart.config;
    if (!config || !config.demoPatterns || !config.demoPatterns[patternName]) {
      logger.warn(
        "RadarChart",
        `Demo pattern '${patternName}' not found in JSON SSOT`,
      );
      return null;
    }

    const pattern = config.demoPatterns[patternName];
    logger.info(
      "RadarChart",
      `Retrieved demo pattern '${patternName}' from JSON SSOT`,
      {
        context: this.options.context,
        pattern: pattern.name,
      },
    );

    return pattern;
  }

  /**
   * Apply demo pattern from JSON SSOT (specifically for hero demo context)
   * @param {string} patternName - Pattern name to apply
   * @returns {boolean} Success status
   */
  applyDemoPattern(patternName) {
    if (this.options.context !== "hero-demo") {
      logger.warn(
        "RadarChart",
        `applyDemoPattern should only be used with hero-demo context, current: ${this.options.context}`,
      );
    }

    const pattern = this.getDemoPattern(patternName);
    if (!pattern) {
      return false;
    }

    // Apply the pattern scores
    this.setScores(pattern.scores);

    logger.info("RadarChart", `Applied demo pattern '${patternName}'`, {
      context: this.options.context,
      scores: pattern.scores,
      description: pattern.description,
    });

    return true;
  }

  /**
   * Get impact description for a score
   */
  getImpactDescription(score) {
    return getImpactDescription(RadarChart.config, score);
  }

  /**
   * Load Chart.js if not already loaded
   */
  async loadChartJS() {
    return new Promise((resolve, reject) => {
      if (typeof window.Chart !== "undefined") {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.src = "https://cdn.jsdelivr.net/npm/chart.js";
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  }

  // ===== CHART.JS UTILITIES FOR COMPONENT INTEGRATION =====

  /**
   * Check if Chart.js is available globally
   * @static
   * @returns {boolean} True if Chart.js is loaded and available
   */
  static isChartJSAvailable() {
    return typeof window.Chart !== "undefined" && window.Chart.getChart;
  }

  /**
   * Ensure Chart.js is loaded globally
   * @static
   * @returns {Promise<void>} Promise that resolves when Chart.js is available
   */
  static async ensureChartJSLoaded() {
    if (!RadarChart.isChartJSAvailable()) {
      logger.info("RadarChart", "Loading Chart.js globally for component use");

      return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.src = "https://cdn.jsdelivr.net/npm/chart.js";
        script.onload = () => {
          logger.info("RadarChart", "Chart.js loaded successfully");
          resolve();
        };
        script.onerror = (error) => {
          logger.error("RadarChart", "Failed to load Chart.js", error);
          reject(error);
        };
        document.head.appendChild(script);
      });
    }
  }

  /**
   * Clean up orphaned Chart.js instances in containers
   * @static
   * @param {string|HTMLElement} containerSelector - CSS selector or element containing charts
   * @returns {number} Number of instances cleaned up
   */
  static cleanupOrphanedCharts(containerSelector) {
    let cleanupCount = 0;

    try {
      const containers =
        typeof containerSelector === "string"
          ? document.querySelectorAll(containerSelector)
          : [containerSelector];

      containers.forEach((container) => {
        if (!container) return;

        const canvases = container.querySelectorAll("canvas");
        canvases.forEach((canvas) => {
          if (RadarChart.isChartJSAvailable()) {
            const chartInstance = window.Chart.getChart(canvas);
            if (chartInstance) {
              logger.info(
                "RadarChart",
                "Destroying orphaned Chart.js instance",
                {
                  canvasId: canvas.id || "unnamed",
                  chartType: chartInstance.config?.type || "unknown",
                },
              );
              chartInstance.destroy();
              cleanupCount++;
            }
          }
        });
      });

      if (cleanupCount > 0) {
        logger.info(
          "RadarChart",
          `Cleaned up ${cleanupCount} orphaned Chart.js instances`,
        );
      }
    } catch (error) {
      logger.error("RadarChart", "Error during Chart.js cleanup", error);
    }

    return cleanupCount;
  }

  /**
   * Destroy specific Chart.js instance in container
   * @static
   * @param {string|HTMLElement} container - Container element or selector
   * @returns {boolean} True if chart was found and destroyed
   */
  static destroyChartInContainer(container) {
    try {
      const element =
        typeof container === "string"
          ? document.querySelector(container)
          : container;

      if (!element) return false;

      const canvas = element.querySelector("canvas");
      if (!canvas || !RadarChart.isChartJSAvailable()) return false;

      const chartInstance = window.Chart.getChart(canvas);
      if (chartInstance) {
        logger.info(
          "RadarChart",
          "Destroying Chart.js instance before replacement",
          {
            containerId: element.id || "unnamed",
            chartType: chartInstance.config?.type || "unknown",
          },
        );
        chartInstance.destroy();
        return true;
      }
    } catch (error) {
      logger.error("RadarChart", "Error destroying chart instance", error);
    }

    return false;
  }

  // Legacy HTML fallback removed – we rely on a minimal error state when needed

  /**
   * Destroy the chart and clean up
   */
  destroy() {
    try {
      // Log destruction for enterprise monitoring
      this._logTelemetry("instance_destroyed", {
        uptime: Date.now() - this.createdAt,
        totalRenders: this.performanceMetrics.totalRenders,
        totalInteractions: this.performanceMetrics.interactionCount,
        errorCount: this.errorCount,
      });

      // Flush any remaining telemetry
      this._flushTelemetryBatch();

      // Clean up chart
      if (this.chart) {
        this.chart.destroy();
        this.chart = null;
      }

      // SIMPLIFIED: No need for complex tooltip cleanup since we use Chart.js built-in tooltips
      // Chart.js automatically handles tooltip cleanup when chart is destroyed

      // Clean up mobile event listeners
      if (this.documentTouchHandler) {
        document.removeEventListener("touchstart", this.documentTouchHandler);
        this.documentTouchHandler = null;
      }

      // Clean up canvas click handler
      if (this.canvasClickHandler) {
        const canvas = this.container.querySelector("canvas");
        if (canvas) {
          canvas.removeEventListener("click", this.canvasClickHandler);
        }
        this.canvasClickHandler = null;
      }

      // Clean up enterprise monitoring intervals
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }

      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }

      if (this.telemetryFlushInterval) {
        clearInterval(this.telemetryFlushInterval);
        this.telemetryFlushInterval = null;
      }

      // OPTIMIZED: Clean up visibility timeout
      if (this._visibilityTimeout) {
        clearTimeout(this._visibilityTimeout);
        this._visibilityTimeout = null;
      }

      // Clean up animation coordination
      if (this.isAnimating) {
        RadarChart.animationCoordinator.releaseAnimation(this.instanceId);
        this.isAnimating = false;
      }

      // Remove from instance tracking
      RadarChart.allInstances.delete(this);

      // Unregister from event coordinator
      chartEventCoordinator.unregisterElement(this.container);

      // Mark as destroyed
      this.isDestroyed = true;

      logger.info("RadarChart", "Enterprise radar chart destroyed", {
        instanceId: this.instanceId,
        uptime: Date.now() - this.createdAt,
      });
    } catch (error) {
      this._handleError(error, "destroy");
    }
  }

  /**
   * Export chart as image
   */
  exportAsImage() {
    if (this.chart) {
      return this.chart.toBase64Image();
    }
    return null;
  }

  /**
   * Handle chart click events for mobile tooltip toggle
   * Allows users to click nodes to show/hide tooltips on mobile
   */
  handleChartClick(event, activeElements) {
    // Track user interaction
    this.performanceMetrics.interactionCount++;
    this.userJourney.interactions.push({
      type: "chart_click",
      timestamp: Date.now(),
      elementCount: activeElements ? activeElements.length : 0,
    });

    // Log interaction telemetry
    this._logTelemetry(
      this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.USER_INTERACTION,
      {
        interactionType: "chart_click",
        hasActiveElements: !!(activeElements && activeElements.length > 0),
        totalInteractions: this.performanceMetrics.interactionCount,
      },
    );

    // Only handle clicks on mobile/touch devices
    if (!("ontouchstart" in window) && !navigator.maxTouchPoints) {
      return;
    }

    if (!this.chart || !this.chart.tooltip) {
      return;
    }

    // If clicking on a node/point
    if (activeElements && activeElements.length > 0) {
      const activeElement = activeElements[0];
      const currentActiveElements = this.chart.tooltip.getActiveElements();

      // Check if the same element is already active
      const isSameElement =
        currentActiveElements.length > 0 &&
        currentActiveElements[0].datasetIndex === activeElement.datasetIndex &&
        currentActiveElements[0].index === activeElement.index;

      if (isSameElement) {
        // If the same node is clicked again, hide the tooltip (deselect)
        this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      } else {
        // Show tooltip for the clicked node (select)
        this.chart.tooltip.setActiveElements([activeElement], {
          x: event.native.offsetX,
          y: event.native.offsetY,
        });
      }

      this.chart.update("none");

      // Prevent event from bubbling to avoid triggering document touch handler
      if (event.native) {
        event.native.stopPropagation();
      }
    } else {
      // If clicking on empty area, hide tooltips
      this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
      this.chart.update("none");
    }
  }

  /**
   * Setup mobile tooltip dismissal for demo and scenario charts
   * Allows users to tap anywhere to dismiss tooltips on mobile
   */
  setupMobileTooltipDismissal() {
    // Only add this functionality on mobile/touch devices
    if (!("ontouchstart" in window) && !navigator.maxTouchPoints) {
      return;
    }

    // Add direct canvas click handler for empty area clicks
    const canvas = this.container.querySelector("canvas");
    if (canvas) {
      this.canvasClickHandler = (event) => {
        // Get chart elements at the click position
        const points = this.chart.getElementsAtEventForMode(
          event,
          "nearest",
          { intersect: true },
          false,
        );

        // If no elements were clicked (empty area), hide tooltips
        if (points.length === 0) {
          if (this.chart && this.chart.tooltip) {
            this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            this.chart.update("none");
          }
        }
      };

      canvas.addEventListener("click", this.canvasClickHandler);
    }

    // Add touch event listener to the container for touches outside canvas
    this.container.addEventListener(
      "touchstart",
      (event) => {
        // Check if the touch is outside the canvas area
        const canvas = this.container.querySelector("canvas");
        if (!canvas) return;

        const rect = canvas.getBoundingClientRect();
        const touch = event.touches[0];

        // If touch is outside the canvas, hide tooltips
        if (
          touch.clientX < rect.left ||
          touch.clientX > rect.right ||
          touch.clientY < rect.top ||
          touch.clientY > rect.bottom
        ) {
          // Hide any active tooltips
          if (this.chart && this.chart.tooltip) {
            this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
            this.chart.update("none");
          }
        }
      },
      { passive: true },
    );

    // Also add a general document touch listener for clicking outside the entire container
    this.documentTouchHandler = (event) => {
      // Only dismiss if the touch is completely outside the radar chart container
      if (!this.container.contains(event.target)) {
        // Hide tooltips when touching outside the entire container
        if (this.chart && this.chart.tooltip) {
          this.chart.tooltip.setActiveElements([], { x: 0, y: 0 });
          this.chart.update("none");
        }
      }
    };

    document.addEventListener("touchstart", this.documentTouchHandler, {
      passive: true,
    });

    const chartType = this.options.isDemo ? "demo" : "scenario";
    logger.info(
      `Mobile tooltip dismissal setup complete for ${chartType} radar chart`,
    );
  }

  // === ENTERPRISE MONITORING METHODS ===

  /**
   * Initialize enterprise monitoring infrastructure
   * @private
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Set up health check interval
      this.healthCheckInterval = setInterval(() => {
        this._performHealthCheck();
      }, this.ENTERPRISE_CONSTANTS.HEALTH.CHECK_INTERVAL);

      // Set up telemetry flush interval
      this.telemetryFlushInterval = setInterval(() => {
        this._flushTelemetryBatch();
      }, this.ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL);

      // Set up heartbeat interval
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, this.ENTERPRISE_CONSTANTS.HEALTH.HEARTBEAT_INTERVAL);

      logger.info("RadarChart", "🏢 Enterprise monitoring initialized", {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        healthCheckInterval: this.ENTERPRISE_CONSTANTS.HEALTH.CHECK_INTERVAL,
        telemetryFlushInterval:
          this.ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL,
        heartbeatInterval: this.ENTERPRISE_CONSTANTS.HEALTH.HEARTBEAT_INTERVAL,
      });
    } catch (error) {
      this._handleError(error, "_initializeEnterpriseMonitoring");
    }
  }

  /**
   * Enterprise error handling with circuit breaker pattern
   * @private
   * @param {Error} error - The error that occurred
   * @param {string} context - Context where the error occurred
   */
  _handleError(error, context) {
    this.errorCount++;
    this.lastError = {
      message: error.message,
      stack: error.stack,
      context,
      timestamp: Date.now(),
    };

    // Update circuit breaker state
    this.circuitBreaker.failures++;
    this.circuitBreaker.lastFailureTime = Date.now();

    // Open circuit breaker if threshold exceeded
    const maxThreshold =
      this.ENTERPRISE_CONSTANTS?.ERROR_RECOVERY?.CIRCUIT_BREAKER_THRESHOLD || 5;
    if (this.circuitBreaker.failures >= maxThreshold) {
      this.circuitBreaker.state = "open";
      this.circuitBreaker.isOpen = true;
      this._enterFailsafeMode();
    }

    // Log telemetry for enterprise systems (with safe access)
    if (this.ENTERPRISE_CONSTANTS?.TELEMETRY?.EVENT_TYPES?.ERROR_EVENT) {
      this._logTelemetry(
        this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.ERROR_EVENT,
        {
          error: error.message,
          context,
          circuitBreakerState: this.circuitBreaker.state,
          errorCount: this.errorCount,
        },
      );
    } else {
      // Fallback logging if enterprise constants are not available
      logger.error("RadarChart", `Error in ${context}: ${error.message}`, {
        error: error.message,
        context,
        circuitBreakerState: this.circuitBreaker.state,
        errorCount: this.errorCount,
      });
    }

    // Attempt recovery if not in failsafe mode
    const maxRetries =
      this.ENTERPRISE_CONSTANTS?.ERROR_RECOVERY?.MAX_RETRY_ATTEMPTS || 3;
    const retryDelay =
      this.ENTERPRISE_CONSTANTS?.ERROR_RECOVERY?.RETRY_DELAY || 1000;

    if (
      !this.circuitBreaker.isOpen &&
      this.circuitBreaker.failures < maxRetries
    ) {
      setTimeout(() => {
        this._attemptRecovery(context);
      }, retryDelay * this.circuitBreaker.failures);
    }

    logger.error("RadarChart", "Enterprise error handled", {
      instanceId: this.instanceId,
      error: error.message,
      context,
      circuitBreakerState: this.circuitBreaker.state,
      errorCount: this.errorCount,
    });
  }

  /**
   * Record performance metrics for enterprise monitoring
   * @private
   * @param {string} operation - Operation being measured
   * @param {number} duration - Duration in milliseconds
   */
  _recordPerformanceMetric(operation, duration) {
    if (operation === "chart_render") {
      this.performanceMetrics.renderTimes.push(duration);
      this.performanceMetrics.totalRenders++;
      this.performanceMetrics.lastRenderTime = duration;

      // Keep only recent samples for rolling average
      if (
        this.performanceMetrics.renderTimes.length >
        this.ENTERPRISE_CONSTANTS.HEALTH.PERFORMANCE_SAMPLE_SIZE
      ) {
        this.performanceMetrics.renderTimes.shift();
      }
    }

    // Log telemetry
    this._logTelemetry(
      this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
      {
        operation,
        duration,
        timestamp: Date.now(),
      },
    );
  }

  /**
   * Log telemetry data for enterprise analytics
   * @private
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  _logTelemetry(event, data = {}) {
    const telemetryEvent = {
      instanceId: this.instanceId,
      instanceUuid: this.instanceUuid,
      event,
      data,
      timestamp: Date.now(),
      containerId: this.containerId,
      chartType: this.options.isDemo ? "demo" : "scenario",
      context: this.options.context, // Enhanced context tracking
    };

    this.telemetryBuffer.push(telemetryEvent);

    // Flush if buffer is full
    if (
      this.telemetryBuffer.length >=
      this.ENTERPRISE_CONSTANTS.TELEMETRY.BATCH_SIZE
    ) {
      this._flushTelemetryBatch();
    }
  }

  /**
   * Flush telemetry batch to enterprise systems
   * @private
   */
  _flushTelemetryBatch() {
    if (this.telemetryBuffer.length === 0) return;

    try {
      // In a real enterprise environment, this would send to analytics service
      // Enterprise telemetry logging disabled for cleaner console output
      // logger.info("RadarChart", "Enterprise telemetry batch", {
      //   instanceId: this.instanceId,
      //   batchSize: this.telemetryBuffer.length,
      //   events: this.telemetryBuffer,
      // });

      // Clear the buffer
      this.telemetryBuffer = [];
      this.lastTelemetryFlush = Date.now();
    } catch (error) {
      logger.error("RadarChart", "Failed to flush telemetry batch", error);
    }
  }

  /**
   * Perform health check for enterprise monitoring
   * @private
   */
  _performHealthCheck() {
    try {
      const now = Date.now();
      const memoryUsage = this._getMemoryUsage();
      const avgRenderTime = this._getAverageRenderTime();

      // Health status assessment
      this.isHealthy =
        this.errorCount < this.ENTERPRISE_CONSTANTS.HEALTH.ERROR_THRESHOLD &&
        memoryUsage < this.ENTERPRISE_CONSTANTS.HEALTH.MEMORY_THRESHOLD_MB &&
        avgRenderTime <
          this.ENTERPRISE_CONSTANTS.HEALTH.RENDER_TIME_THRESHOLD_MS &&
        !this.circuitBreaker.isOpen;

      this.lastHealthCheck = now;

      // Log health status
      this._logTelemetry("health_check", {
        isHealthy: this.isHealthy,
        errorCount: this.errorCount,
        memoryUsage,
        avgRenderTime,
        circuitBreakerState: this.circuitBreaker.state,
        uptime: now - this.createdAt,
      });
    } catch (error) {
      this._handleError(error, "_performHealthCheck");
    }
  }

  /**
   * Send heartbeat for enterprise monitoring
   * @private
   */
  _sendHeartbeat() {
    this.lastHeartbeat = Date.now();
    this._logTelemetry("heartbeat", {
      uptime: this.lastHeartbeat - this.createdAt,
      isInitialized: this.isInitialized,
      chartExists: !!this.chart,
    });
  }

  /**
   * Get memory usage estimation
   * @private
   * @returns {number} Memory usage in MB
   */
  _getMemoryUsage() {
    try {
      if (performance.memory) {
        return Math.round(performance.memory.usedJSHeapSize / 1024 / 1024);
      }
      // Fallback estimation based on chart complexity - round to whole number
      return Math.round(this.performanceMetrics.totalRenders / 10);
    } catch (error) {
      return 0;
    }
  }

  /**
   * Get average render time
   * @private
   * @returns {number} Average render time in milliseconds
   */
  _getAverageRenderTime() {
    if (this.performanceMetrics.renderTimes.length === 0) return 0;
    const sum = this.performanceMetrics.renderTimes.reduce((a, b) => a + b, 0);
    return sum / this.performanceMetrics.renderTimes.length;
  }

  /**
   * Attempt recovery from errors
   * @private
   * @param {string} context - Context where recovery is needed
   */
  _attemptRecovery(context) {
    try {
      logger.info("RadarChart", "Attempting recovery", {
        instanceId: this.instanceId,
        context,
        attempt: this.circuitBreaker.failures,
      });

      switch (context) {
        case "initializeChart":
          // If we still have a live chart, prefer a lightweight refresh
          if (this.chart && this.isInitialized) {
            this.refreshChart(true);
            break;
          }
          // Throttle re-initialization attempts to avoid loops
          if (Date.now() - this.lastInitAttempt < 2000) {
            logger.warn(
              "RadarChart",
              "Skipping re-initialization due to recent attempt",
            );
            break;
          }
          // Only attempt rebuild if not initializing already
          if (!this.initializing) {
            this.initializeChart();
          }
          break;
        case "updateScores":
          this.refreshChart();
          break;
        default:
          // Generic recovery - try to refresh chart
          if (this.chart) {
            this.chart.update();
          }
      }

      // Reset circuit breaker on successful recovery
      this.circuitBreaker.failures = 0;
      this.circuitBreaker.state = "closed";
      this.circuitBreaker.isOpen = false;
    } catch (error) {
      this._handleError(error, `recovery_${context}`);
    }
  }

  /**
   * Enter failsafe mode when circuit breaker opens
   * @private
   */
  _enterFailsafeMode() {
    logger.warn("RadarChart", "Entering failsafe mode", {
      instanceId: this.instanceId,
      failures: this.circuitBreaker.failures,
    });

    // Render a simple, accessible error message (no HTML fallback UI)
    this.container.innerHTML = `
      <div class="radar-chart-error" role="status" aria-live="polite">
        <p>Chart temporarily unavailable</p>
        <p>Instance: ${this.instanceId}</p>
      </div>
    `;
  }

  // === STATIC ENTERPRISE METHODS ===

  /**
   * Get all RadarChart instances for enterprise monitoring
   * @static
   * @returns {Set} Set of all RadarChart instances
   */
  static getAllInstances() {
    return RadarChart.allInstances;
  }

  /**
   * Generate enterprise health report for all instances
   * @static
   * @returns {Object} Comprehensive health report
   */
  static getEnterpriseHealthReport() {
    const instances = Array.from(RadarChart.allInstances);
    const healthyInstances = instances.filter((instance) => instance.isHealthy);
    const report = {
      totalInstances: instances.length,
      healthyInstances: healthyInstances.length,
      unhealthyInstances: instances.length - healthyInstances.length,
      avgUptime:
        instances.reduce(
          (sum, instance) => sum + (Date.now() - instance.createdAt),
          0,
        ) / instances.length,
      totalErrors: instances.reduce(
        (sum, instance) => sum + instance.errorCount,
        0,
      ),
      avgRenderTime:
        instances.reduce(
          (sum, instance) => sum + instance._getAverageRenderTime(),
          0,
        ) / instances.length,
      instances: instances.map((instance) => ({
        instanceId: instance.instanceId,
        containerId: instance.containerId,
        isHealthy: instance.isHealthy,
        errorCount: instance.errorCount,
        uptime: Date.now() - instance.createdAt,
        circuitBreakerState: instance.circuitBreaker.state,
        lastHealthCheck: instance.lastHealthCheck,
        chartType: instance.options.isDemo ? "demo" : "scenario",
      })),
      generatedAt: Date.now(),
    };

    logger.info("RadarChart", "Enterprise health report generated", report);
    return report;
  }

  /**
   * Debug enterprise status for instance
   * @returns {Object} Debug information
   */
  debugEnterpriseStatus() {
    return {
      instanceUuid: this.instanceUuid,
      instanceId: this.instanceId,
      isHealthy: this.isHealthy,
      errorCount: this.errorCount,
      lastError: this.lastError,
      circuitBreaker: this.circuitBreaker,
      performanceMetrics: this.performanceMetrics,
      userJourney: this.userJourney,
      isInitialized: this.isInitialized,
      containerId: this.containerId,
      chartType: this.options.isDemo ? "demo" : "scenario",
      uptime: Date.now() - this.createdAt,
      telemetryBufferSize: this.telemetryBuffer.length,
      lastHealthCheck: this.lastHealthCheck,
      lastHeartbeat: this.lastHeartbeat,
      lastTelemetryFlush: this.lastTelemetryFlush,
    };
  }
}

// === ENTERPRISE DEBUG FUNCTIONS ===

/**
 * Global function to get enterprise health report for all radar charts
 */
window.debugRadarChartHealth = function () {
  return RadarChart.getEnterpriseHealthReport();
};

/**
 * Global function to get all radar chart instances
 */
window.debugRadarChartInstances = function () {
  const instances = Array.from(RadarChart.getAllInstances());
  return instances.map((instance) => ({
    instanceId: instance.instanceId,
    containerId: instance.containerId,
    isHealthy: instance.isHealthy,
    isInitialized: instance.isInitialized,
    chartType: instance.options.isDemo ? "demo" : "scenario",
    uptime: Date.now() - instance.createdAt,
    errorCount: instance.errorCount,
  }));
};

/**
 * Global function to debug specific radar chart instance
 */
window.debugRadarChartInstance = function (instanceId) {
  const instances = Array.from(RadarChart.getAllInstances());
  const instance = instances.find((inst) => inst.instanceId === instanceId);

  if (!instance) {
    console.warn(`Radar chart instance ${instanceId} not found`);
    console.log(
      "Available instances:",
      instances.map((inst) => inst.instanceId),
    );
    return null;
  }

  return instance.debugEnterpriseStatus();
};

/**
 * Global function to simulate radar chart stress test
 */
window.debugRadarChartStressTest = function (instanceId) {
  const instances = Array.from(RadarChart.getAllInstances());
  const instance = instances.find((inst) => inst.instanceId === instanceId);

  if (!instance) {
    console.warn(`Radar chart instance ${instanceId} not found`);
    return null;
  }

  console.log(`Starting stress test for radar chart ${instanceId}`);

  // Rapid score updates to test performance
  let updateCount = 0;
  const stressInterval = setInterval(() => {
    const randomScores = {};
    Object.keys(instance.currentScores).forEach((axis) => {
      // Generate random whole number between 1-5
      randomScores[axis] = Math.floor(Math.random() * 5) + 1;
    });

    instance.updateScores(randomScores);
    updateCount++;

    if (updateCount >= 50) {
      clearInterval(stressInterval);
      console.log(`Stress test completed for ${instanceId}. Performance:`, {
        updates: updateCount,
        avgRenderTime: instance._getAverageRenderTime(),
        totalRenders: instance.performanceMetrics.totalRenders,
        errors: instance.errorCount,
      });
    }
  }, 100);

  return `Stress test started for ${instanceId}`;
};

// Make RadarChart class available globally for debugging
window.RadarChart = RadarChart;
