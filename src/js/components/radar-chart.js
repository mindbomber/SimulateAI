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
  getEnterpriseConstants,
  getChartConstants,
  getEthicalAxes,
  getDefaultScores,
  getImpactDescription,
  getChartConfigTemplate,
  validateConfig,
} from "../utils/radar-config-loader.js";

export default class RadarChart {
  static instanceCount = 0;
  static allInstances = new Set();
  static config = null;

  /**
   * Load configuration once for all instances
   */
  static async loadConfiguration() {
    if (!RadarChart.config) {
      try {
        RadarChart.config = await loadRadarConfig();
        validateConfig(RadarChart.config);
        logger.info("RadarChart", "Configuration loaded and validated");
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

    // Ensure configuration is loaded
    if (!RadarChart.config) {
      throw new Error(
        "Configuration not loaded. Call RadarChart.loadConfiguration() first.",
      );
    }

    const config = RadarChart.config;

    // Get constants from configuration
    this.ENTERPRISE_CONSTANTS = getEnterpriseConstants(config);
    this.CHART_CONSTANTS = getChartConstants(config);
    this.ETHICAL_AXES = getEthicalAxes(config);
    this.DEFAULT_SCORES = getDefaultScores(config);

    // Generate unique instance identifiers
    RadarChart.instanceCount++;
    this.instanceId = `radar-chart-${RadarChart.instanceCount}`;
    this.instanceUuid = this._generateUUID();
    this.createdAt = Date.now();

    // Basic container validation
    this.containerId = containerId;
    this.container = document.getElementById(containerId);

    if (!this.container) {
      const error = `Container with ID '${containerId}' not found`;
      console.error("❌ RadarChart error:", error);
      throw new Error(error);
    }

    // Configuration options with enhanced context awareness
    this.options = {
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

    // Core chart properties
    this.chart = null;

    // Use simple whole number scores - no complex decimals
    // Default is 3 (neutral) - can be 1, 2, 3, 4, or 5
    this.currentScores = { ...this.DEFAULT_SCORES };

    logger.info(
      "RadarChart",
      "Using simple whole number scores (1-5 scale, default=3)",
      this.currentScores,
    );

    // Track initialization status
    this.isInitialized = false;

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
      totalInstances: RadarChart.instanceCount,
    });
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
   * Initialize the Chart.js radar chart
  }
    this.initializationPromise = this.initializeChart();
  }

  /**
   * Initialize the Chart.js radar chart
   */
  async initializeChart() {
    const startTime = performance.now();

    try {
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

      // Track chart initialization attempt
      this._logTelemetry(
        this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.CHART_RENDER,
        {
          operation: "initialization_start",
        },
      );

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

      // Set CSS dimensions only (Chart.js will handle internal canvas scaling)
      canvas.style.width = this.options.width + "px";
      canvas.style.height = this.options.height + "px";
      canvas.style.maxWidth = "100%";
      canvas.style.display = "block";
      canvas.style.margin = "0 auto";

      // Set container dimensions to match
      this.container.style.width = this.options.width + "px";
      this.container.style.height = this.options.height + "px";
      this.container.style.minHeight = this.options.height + "px";

      // Get context for Chart.js (Chart.js will handle DPR scaling automatically)
      const ctx = canvas.getContext("2d");

      // Clear any existing content including any "null" text
      this.container.innerHTML = "";
      this.container.textContent = "";

      // Ensure container is properly set up for tooltips
      this.container.style.textAlign = "center";
      this.container.style.overflow = "visible";
      this.container.style.position = "relative";
      this.container.style.zIndex = "10"; // Ensure above most content

      // Force tooltip support for canvas
      canvas.style.position = "relative";
      canvas.style.zIndex = "1";

      this.container.appendChild(canvas);

      // VERIFICATION: Log dimensions to ensure they match
      logger.info("RadarChart", "Canvas dimensions verified", {
        htmlWidth: canvas.width,
        htmlHeight: canvas.height,
        cssWidth: canvas.style.width,
        cssHeight: canvas.style.height,
        containerMinHeight: this.container.style.minHeight,
        expectedMatch:
          canvas.width === this.options.width &&
          canvas.height === this.options.height,
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
      this._applyContextSpecificConfiguration(); // Force tooltip z-index fix for Chart.js
      this._setupTooltipZIndexFix();

      // REMOVED: Mobile tooltip dismissal setup moved to _attachEventListenersAfterRender()
      // This prevents interference with initial chart rendering
      // if (this.options.isDemo || this.options.realTime) {
      //   this.setupMobileTooltipDismissal();
      // }

      // Force redraw to ensure labels are visible
      setTimeout(() => {
        if (this.chart) {
          this.chart.update();
          logger.info("RadarChart", "Chart updated/redrawn");
        }
      }, 100);

      // CRITICAL: Ensure polygon visibility immediately for scenario modal charts
      setTimeout(() => {
        if (this.chart) {
          // DIMENSION VERIFICATION: Check if canvas dimensions match expectations
          const canvas = this.container.querySelector("canvas");
          if (canvas) {
            const expectedWidth = this.options.width;
            const expectedHeight = this.options.height;
            const actualWidth = canvas.width;
            const actualHeight = canvas.height;

            if (
              actualWidth !== expectedWidth ||
              actualHeight !== expectedHeight
            ) {
              logger.warn(
                "RadarChart",
                "Canvas dimension mismatch detected after initialization",
                {
                  expected: `${expectedWidth}x${expectedHeight}`,
                  actual: `${actualWidth}x${actualHeight}`,
                  containerId: this.containerId,
                },
              );

              // Force correct dimensions
              canvas.width = expectedWidth;
              canvas.height = expectedHeight;
              canvas.style.width = expectedWidth + "px";
              canvas.style.height = expectedHeight + "px";

              // Force chart resize and redraw
              this.chart.resize(expectedWidth, expectedHeight);
              this.chart.update("none");

              logger.info(
                "RadarChart",
                "Canvas dimensions corrected and chart redrawn",
              );
            }
          }

          // SIMPLIFIED: Only apply visibility fix if polygon doesn't render (rare case)
          // Modern Chart.js should render polygons with equal values fine
          // Reuse the canvas variable already declared above
          if (canvas && this._isAllValuesEqual()) {
            // For demo charts, minimal intervention - they should work with pure defaults
            // For scenario charts, apply fix only if really needed
            setTimeout(() => {
              // Check if values are still all equal after initial render
              if (this._isAllValuesEqual()) {
                logger.info(
                  "RadarChart",
                  "Checking if visibility fix needed for equal values",
                  { isDemo: this.options.isDemo },
                );
                this._ensureDefaultStateVisibility();
              }
            }, 50);
          }

          // CRITICAL FIX: Attach event listeners AFTER polygon is guaranteed to render
          // This prevents interference with Chart.js initial rendering cycle
          this._attachEventListenersAfterRender();
        }
      }, 200);

      this.isInitialized = true;

      // Record successful initialization performance
      const initDuration = performance.now() - startTime;
      this._recordPerformanceMetric("chart_render", initDuration);

      // Track user journey
      this.userJourney.chartViews++;

      // Log successful initialization
      this._logTelemetry(
        this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.CHART_RENDER,
        {
          operation: "initialization_complete",
          duration: initDuration,
          containerId: this.containerId,
        },
      );

      logger.info("RadarChart", "Radar chart initialized successfully", {
        instanceId: this.instanceId,
        duration: initDuration,
        chartViews: this.userJourney.chartViews,
      });
    } catch (error) {
      logger.error("Failed to initialize radar chart:", error);
      this._handleError(error, "initializeChart");
      this.showFallbackChart();
    }
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

    // Add blur effect to tooltip background
    baseConfig.options.plugins.tooltip.external = (context) => {
      // Create unique tooltip ID for this chart instance
      const tooltipId = `chartjs-tooltip-blur-${this.instanceId}`;

      // Get or create tooltip element specific to this chart instance
      let tooltipEl = document.getElementById(tooltipId);

      if (!tooltipEl) {
        tooltipEl = document.createElement("div");
        tooltipEl.id = tooltipId;
        tooltipEl.style.cssText = `
          position: absolute;
          background: rgba(255, 255, 255, 0.85);
          backdrop-filter: blur(8px);
          -webkit-backdrop-filter: blur(8px);
          border: 1px solid rgba(255, 255, 255, 0.3);
          border-radius: 8px;
          padding: 12px;
          pointer-events: none;
          z-index: 1000;
          font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
          font-size: 12px;
          color: #2d3748;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
          transition: opacity 0.2s ease;
        `;
        document.body.appendChild(tooltipEl);

        // Store reference for cleanup during destroy
        this.tooltipElement = tooltipEl;
      }

      const tooltip = context.tooltip;

      if (tooltip.opacity === 0) {
        tooltipEl.style.opacity = 0;
        return;
      }

      // Generate tooltip content manually since built-in tooltips are disabled
      let innerHtml = "";

      // Get the active data point info
      if (tooltip.dataPoints && tooltip.dataPoints.length > 0) {
        const dataPoint = tooltip.dataPoints[0];
        const dataIndex = dataPoint.dataIndex;

        // Safety check for dataIndex
        if (typeof dataIndex === "number" && dataIndex >= 0) {
          const axisKeys = Object.keys(this.ETHICAL_AXES);

          if (dataIndex < axisKeys.length) {
            const axisKey = axisKeys[dataIndex];
            const axisInfo = this.ETHICAL_AXES[axisKey];
            const score = dataPoint.parsed.r;
            const impact = getImpactDescription(config, score);

            // Title
            innerHtml += `<div style="font-weight: bold; margin-bottom: 4px; color: #1a202c;">${axisInfo.label}</div>`;

            // Score info
            innerHtml += `<div style="margin: 2px 0;">Score: ${score}/${config.scoring.maxScore} (${impact})</div>`;
            innerHtml += `<div style="margin: 2px 0;"></div>`;

            // Description
            innerHtml += `<div style="margin: 2px 0;">${axisInfo.description}</div>`;
          } else {
            innerHtml = `<div style="color: #666;">Ethical Analysis</div>`;
          }
        } else {
          innerHtml = `<div style="color: #666;">Ethical Analysis</div>`;
        }
      } else {
        innerHtml = `<div style="color: #666;">Ethical Analysis</div>`;
      }

      tooltipEl.innerHTML = innerHtml;

      const canvas = context.chart.canvas;
      const canvasRect = canvas.getBoundingClientRect();

      // Position tooltip
      tooltipEl.style.opacity = 1;
      tooltipEl.style.left =
        canvasRect.left + window.scrollX + tooltip.caretX + "px";
      tooltipEl.style.top =
        canvasRect.top + window.scrollY + tooltip.caretY + "px";
    };

    // CRITICAL FIX: Completely disable built-in tooltips when using external tooltip
    // This prevents dual tooltip display (built-in + external)
    baseConfig.options.plugins.tooltip.enabled = false;

    // Additional tooltip configuration to ensure external function works
    baseConfig.options.plugins.tooltip.intersect = false;
    baseConfig.options.plugins.tooltip.position = "nearest";

    // Ensure external tooltip function is preserved and working
    if (typeof baseConfig.options.plugins.tooltip.external === "function") {
      // External function is already set above, keep it
      logger.info(
        "RadarChart",
        "External tooltip function preserved, built-in tooltips disabled",
      );
    } else {
      logger.warn("RadarChart", "External tooltip function missing");
    }

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

      // Refresh the chart
      this.refreshChart();

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
    this.refreshChart();
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
    this.currentScores = { ...this.DEFAULT_SCORES, ...scores };
    this.refreshChart();
  }

  /**
   * Refresh the chart display
   */
  refreshChart() {
    if (this.chart) {
      const axesData = Object.values(this.currentScores);
      this.chart.data.datasets[0].data = axesData;
      this.chart.update(this.options.animated ? "active" : "none");

      // Check if we need to ensure visibility for equal values
      if (this._isAllValuesEqual()) {
        setTimeout(() => {
          this._ensureDefaultStateVisibility();
        }, 100);
      }
    }
  }

  /**
   * Apply context-specific styling classes
   * @private
   */
  _applyContextSpecificStyling() {
    switch (this.options.context) {
      case "hero-demo":
        this.container.classList.add(
          "radar-demo-container",
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
          this.container.classList.add("radar-demo-container");
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
    this.chart.data.datasets[0].backgroundColor = neutralTheme.background;
    this.chart.data.datasets[0].borderColor = neutralTheme.border;
    this.chart.data.datasets[0].pointBackgroundColor =
      RadarChart.config.pointColors["3"];

    // Start with balanced default scores for hero demo
    this.chart.data.datasets[0].data = Object.values(this.DEFAULT_SCORES);
    this.chart.update();

    logger.info("RadarChart", "Configured hero demo chart", {
      context: this.options.context,
      defaultScores: this.DEFAULT_SCORES,
    });
  }

  /**
   * Configure scenario modal chart
   * @private
   * @param {Object} neutralTheme - Theme colors
   */
  _configureScenarioChart(neutralTheme) {
    // Scenario charts: Optimized for real-time ethical decision tracking
    this.chart.data.datasets[0].backgroundColor = neutralTheme.background;
    this.chart.data.datasets[0].borderColor = neutralTheme.border;
    this.chart.data.datasets[0].pointBackgroundColor =
      RadarChart.config.pointColors["3"];

    // Use exact default scores for scenario consistency
    this.chart.data.datasets[0].data = Object.values(this.DEFAULT_SCORES);
    this.chart.update();

    logger.info("RadarChart", "Configured scenario modal chart", {
      context: this.options.context,
      realTime: this.options.realTime,
      defaultScores: this.DEFAULT_SCORES,
    });
  }

  /**
   * Configure test/debug chart
   * @private
   * @param {Object} neutralTheme - Theme colors
   */
  _configureTestChart(neutralTheme) {
    // Test charts: Optimized for debugging and validation
    this.chart.data.datasets[0].backgroundColor = neutralTheme.background;
    this.chart.data.datasets[0].borderColor = neutralTheme.border;
    this.chart.data.datasets[0].pointBackgroundColor =
      RadarChart.config.pointColors["3"];

    // Use default scores for consistent testing
    this.chart.data.datasets[0].data = Object.values(this.DEFAULT_SCORES);
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
    this.chart.data.datasets[0].backgroundColor = neutralTheme.background;
    this.chart.data.datasets[0].borderColor = neutralTheme.border;
    this.chart.data.datasets[0].pointBackgroundColor =
      RadarChart.config.pointColors["3"];
    this.chart.data.datasets[0].data = Object.values(this.DEFAULT_SCORES);
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
          // Scenario charts: Use minimal variation only if Chart.js requires it
          pattern = [3, 3, 3, 3, 3, 3, 3, 4];
          description = "minimal variation pattern for scenario chart";
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
            pattern = [3, 3, 3, 3, 3, 3, 3, 4];
            description = "minimal variation pattern (legacy scenario)";
          }
      }

      logger.info("RadarChart", `Using ${description}`, {
        context: this.options.context,
        pattern: pattern,
      });

      // Update chart data with chosen pattern
      this.chart.data.datasets[0].data = pattern;

      // Apply neutral colors
      const neutralTheme = RadarChart.config.themes.neutral;
      const dataset = this.chart.data.datasets[0];
      dataset.backgroundColor = neutralTheme.background;
      dataset.borderColor = neutralTheme.border;
      dataset.pointBackgroundColor = RadarChart.config.pointColors["3"];

      // Simple update
      this.chart.update();
    }
  } /**
   * Setup aggressive tooltip z-index fix for Chart.js tooltips
   * This ensures tooltips appear above modal content and other overlays
   * @private
   */
  _setupTooltipZIndexFix() {
    // Create a MutationObserver to watch for Chart.js tooltip elements
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
          if (node.nodeType === 1) {
            // Element node
            // Check for Chart.js tooltip elements
            if (
              (node.id && node.id.includes("chartjs-tooltip")) ||
              (node.className && node.className.includes("chartjs-tooltip")) ||
              (node.dataset && node.dataset.chartjs === "tooltip")
            ) {
              // Force high z-index and proper positioning
              node.style.zIndex = "1100";
              node.style.position = "fixed";
              node.style.pointerEvents = "none";
              logger.info(
                "RadarChart",
                "Applied z-index fix to Chart.js tooltip",
              );
            }

            // Also check child elements
            const tooltipElements =
              node.querySelectorAll &&
              node.querySelectorAll(
                '[id*="chartjs-tooltip"], [class*="chartjs-tooltip"], [data-chartjs="tooltip"]',
              );
            if (tooltipElements) {
              tooltipElements.forEach((tooltip) => {
                tooltip.style.zIndex = "1100";
                tooltip.style.position = "fixed";
                tooltip.style.pointerEvents = "none";
              });
            }
          }
        });
      });
    });

    // Start observing document body for tooltip additions
    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });

    // Store observer reference for cleanup
    this.tooltipObserver = observer;

    // Also apply immediate fix to any existing tooltips
    setTimeout(() => {
      const existingTooltips = document.querySelectorAll(
        '[id*="chartjs-tooltip"], [class*="chartjs-tooltip"], [data-chartjs="tooltip"]',
      );
      existingTooltips.forEach((tooltip) => {
        tooltip.style.zIndex = "1100";
        tooltip.style.position = "fixed";
        tooltip.style.pointerEvents = "none";
      });
    }, 100);
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

  /**
   * Show fallback chart if Chart.js fails
   */
  showFallbackChart() {
    const config = RadarChart.config;
    this.container.innerHTML = `
            <div class="radar-chart-fallback">
                <h4>${this.options.title}</h4>
                <div class="fallback-scores">
                    ${Object.entries(this.currentScores)
                      .map(
                        ([axis, score]) => `
                        <div class="score-item">
                            <span class="axis-label">${this.ETHICAL_AXES[axis].label}:</span>
                            <span class="score-value">${score}/${config.scoring.maxScore}</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${(score / config.scoring.maxScore) * config.chart.scalePercentage}%"></div>
                            </div>
                        </div>
                    `,
                      )
                      .join("")}
                </div>
            </div>
        `;
  }

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

      // Clean up tooltip observer
      if (this.tooltipObserver) {
        this.tooltipObserver.disconnect();
        this.tooltipObserver = null;
      }

      // Clean up instance-specific tooltip element
      if (this.tooltipElement) {
        this.tooltipElement.remove();
        this.tooltipElement = null;
      }

      // Clean up any legacy shared tooltip element if this is the last instance
      if (RadarChart.allInstances.size === 1) {
        const legacyTooltip = document.getElementById("chartjs-tooltip-blur");
        if (legacyTooltip) {
          legacyTooltip.remove();
        }
      }

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

      // Remove from instance tracking
      RadarChart.allInstances.delete(this);

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

  /**
   * Attach event listeners after chart rendering is complete
   * This prevents interference with Chart.js initial polygon rendering
   * @private
   */
  _attachEventListenersAfterRender() {
    if (!this.chart) {
      logger.warn(
        "RadarChart",
        "Cannot attach event listeners - chart not initialized",
      );
      return;
    }

    try {
      // Add onClick handler to chart configuration
      this.chart.options.onClick = (event, activeElements) => {
        this.handleChartClick(event, activeElements);
      };

      // Set up mobile tooltip dismissal for demo and scenario charts
      if (this.options.isDemo || this.options.realTime) {
        this.setupMobileTooltipDismissal();
      }

      // Update chart to apply new event handlers
      this.chart.update("none");

      logger.info("RadarChart", "Event listeners attached after chart render", {
        instanceId: this.instanceId,
        hasOnClick: !!this.chart.options.onClick,
        chartType: this.options.isDemo ? "demo" : "scenario",
      });
    } catch (error) {
      logger.error(
        "RadarChart",
        "Failed to attach event listeners after render",
        error,
      );
    }
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
    if (
      this.circuitBreaker.failures >=
      this.ENTERPRISE_CONSTANTS.ERROR_RECOVERY.CIRCUIT_BREAKER_THRESHOLD
    ) {
      this.circuitBreaker.state = "open";
      this.circuitBreaker.isOpen = true;
      this._enterFailsafeMode();
    }

    // Log telemetry for enterprise systems
    this._logTelemetry(
      this.ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.ERROR_EVENT,
      {
        error: error.message,
        context,
        circuitBreakerState: this.circuitBreaker.state,
        errorCount: this.errorCount,
      },
    );

    // Attempt recovery if not in failsafe mode
    if (
      !this.circuitBreaker.isOpen &&
      this.circuitBreaker.failures <
        this.ENTERPRISE_CONSTANTS.ERROR_RECOVERY.MAX_RETRY_ATTEMPTS
    ) {
      setTimeout(() => {
        this._attemptRecovery(context);
      }, this.ENTERPRISE_CONSTANTS.ERROR_RECOVERY.RETRY_DELAY * this.circuitBreaker.failures);
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
          this.initializeChart();
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

    // Show fallback chart if possible
    try {
      this.showFallbackChart();
    } catch (error) {
      // Final fallback - show error message
      this.container.innerHTML = `
        <div class="radar-chart-error">
          <p>Chart temporarily unavailable</p>
          <p>Instance: ${this.instanceId}</p>
        </div>
      `;
    }
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
