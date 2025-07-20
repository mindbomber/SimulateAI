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

// === ENTERPRISE RADAR CHART CONSTANTS ===
const ENTERPRISE_CONSTANTS = {
  // Health monitoring thresholds
  HEALTH: {
    CHECK_INTERVAL: 30000, // 30 seconds
    HEARTBEAT_INTERVAL: 60000, // 1 minute
    MEMORY_THRESHOLD_MB: 100, // Memory usage threshold
    RENDER_TIME_THRESHOLD_MS: 500, // Chart render time threshold
    ERROR_THRESHOLD: 5, // Max errors before failsafe mode
    PERFORMANCE_SAMPLE_SIZE: 20, // Rolling average sample size
  },

  // Performance monitoring
  PERFORMANCE: {
    CHART_RENDER_TIMEOUT: 5000, // 5 seconds max render time
    ANIMATION_FRAME_BUDGET: 16, // 60fps budget in ms
    DATA_UPDATE_DEBOUNCE: 100, // Debounce data updates
    INTERACTION_TIMEOUT: 30000, // User interaction timeout
  },

  // Telemetry configuration
  TELEMETRY: {
    FLUSH_INTERVAL: 45000, // 45 seconds
    BATCH_SIZE: 50, // Events per batch
    EVENT_TYPES: {
      CHART_RENDER: "chart_render",
      USER_INTERACTION: "user_interaction",
      DATA_UPDATE: "data_update",
      PERFORMANCE_METRIC: "performance_metric",
      ERROR_EVENT: "error_event",
    },
  },

  // Error recovery settings
  ERROR_RECOVERY: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1000, // Base delay between retries
    CIRCUIT_BREAKER_THRESHOLD: 5,
    CIRCUIT_BREAKER_TIMEOUT: 60000,
  },
};

// Constants
const DEFAULT_CHART_SIZE = 400;
const ANIMATION_DURATION = 750;
const MAX_SCORE = 5;
const MIN_SCORE = 0;
const NEUTRAL_SCORE = 3;
const POSITIVE_THRESHOLD = 4;
const MODAL_LABEL_MAX_LENGTH = 10; // Shorter labels for modal context
const SCALE_PERCENTAGE = 100;
const MOBILE_BREAKPOINT = 768; // Mobile breakpoint for responsive features

// Ethical axes definitions (0-5 scale, 3 = neutral)
export const ETHICAL_AXES = {
  fairness: {
    label: "Fairness",
    description: "Treats all individuals and groups equitably",
    color: "#3498db",
  },
  sustainability: {
    label: "Sustainability",
    description: "Supports long-term ecological and social well-being",
    color: "#27ae60",
  },
  autonomy: {
    label: "Autonomy",
    description: "Respects individual control and self-determination",
    color: "#9b59b6",
  },
  beneficence: {
    label: "Beneficence",
    description: "Promotes well-being and prevents harm",
    color: "#e74c3c",
  },
  transparency: {
    label: "Transparency",
    description: "Provides openness in decision-making processes",
    color: "#f39c12",
  },
  accountability: {
    label: "Accountability",
    description: "Ensures clear responsibility for decisions",
    color: "#34495e",
  },
  privacy: {
    label: "Privacy",
    description: "Protects personal information and data rights",
    color: "#e67e22",
  },
  proportionality: {
    label: "Proportionality",
    description: "Balances benefits against severity of impact",
    color: "#1abc9c",
  },
};

// Default neutral scores (NEUTRAL_SCORE = neutral impact)
const DEFAULT_SCORES = {
  fairness: NEUTRAL_SCORE,
  sustainability: NEUTRAL_SCORE,
  autonomy: NEUTRAL_SCORE,
  beneficence: NEUTRAL_SCORE,
  transparency: NEUTRAL_SCORE,
  accountability: NEUTRAL_SCORE,
  privacy: NEUTRAL_SCORE,
  proportionality: NEUTRAL_SCORE,
};

export default class RadarChart {
  static instanceCount = 0;
  static allInstances = new Set();

  constructor(containerId, options = {}) {
    // === ENTERPRISE INITIALIZATION ===

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

    // Configuration options
    this.options = {
      width: options.width || DEFAULT_CHART_SIZE,
      height: options.height || DEFAULT_CHART_SIZE,
      showLabels: options.showLabels !== false,
      showLegend: options.showLegend !== false,
      animated: options.animated !== false,
      realTime: options.realTime || false, // For scenario real-time updates
      title: options.title || "Ethical Impact Analysis",
      isDemo: options.isDemo || false, // For demo charts that need minimal styling
      ...options,
    };

    // Core chart properties
    this.chart = null;
    this.currentScores = { ...DEFAULT_SCORES };

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
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.CHART_RENDER,
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

      // Create canvas element
      const canvas = document.createElement("canvas");
      canvas.width = this.options.width;
      canvas.height = this.options.height;
      canvas.style.maxWidth = "100%";
      canvas.style.height = "auto";
      canvas.style.display = "block";
      canvas.style.margin = "0 auto";

      // Clear any existing content including any "null" text
      this.container.innerHTML = "";
      this.container.textContent = "";

      // Ensure container is properly set up
      this.container.style.textAlign = "center";
      this.container.style.overflow = "visible";

      this.container.appendChild(canvas);
      logger.info(
        "RadarChart",
        "Canvas element created and appended to container",
      );

      // Apply visual enhancements classes BEFORE creating chart
      if (this.options.isDemo) {
        this.container.classList.add("radar-demo-container");
        logger.info(
          "RadarChart",
          "Applied radar-demo-container class for demo chart",
        );
      } else {
        this.container.classList.add("radar-chart-container");
        logger.info("RadarChart", "Applied radar-chart-container class");
      }

      // Initialize Chart.js radar chart
      const ctx = canvas.getContext("2d");
      const config = this.getChartConfig();
      logger.info("RadarChart", "Creating chart with config", config);

      this.chart = new window.Chart(ctx, config);
      logger.info("RadarChart", "Chart created successfully");

      // Add mobile tooltip dismissal for demo charts and scenario charts
      if (this.options.isDemo || this.options.realTime) {
        this.setupMobileTooltipDismissal();
      }

      // Force redraw to ensure labels are visible
      setTimeout(() => {
        if (this.chart) {
          this.chart.update();
          logger.info("RadarChart", "Chart updated/redrawn");
        }
      }, 100);

      this.isInitialized = true;

      // Record successful initialization performance
      const initDuration = performance.now() - startTime;
      this._recordPerformanceMetric("chart_render", initDuration);

      // Track user journey
      this.userJourney.chartViews++;

      // Log successful initialization
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.CHART_RENDER,
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
    const axesLabels = Object.values(ETHICAL_AXES).map((axis) => axis.label);
    const axesData = Object.values(this.currentScores);

    // Create gradient for the radar fill
    const gradientColors = this.createGradientColors();

    return {
      type: "radar",
      data: {
        labels: axesLabels,
        datasets: [
          {
            label: this.options.title,
            data: axesData,
            backgroundColor: gradientColors.background,
            borderColor: gradientColors.border,
            borderWidth: 3,
            pointBackgroundColor: gradientColors.points,
            pointBorderColor: "#ffffff",
            pointBorderWidth: 1,
            pointHoverBackgroundColor: "#ffffff",
            pointHoverBorderColor: gradientColors.border,
            pointRadius: 2, // Make dots tiny
            pointHoverRadius: 4, // Small hover radius
            tension: 0.2, // Smooth curves between points
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        layout: {
          padding: {
            top: 40,
            right: 40,
            bottom: 40,
            left: 40,
          },
        },
        animation: {
          duration: this.options.animated ? ANIMATION_DURATION : 0,
          easing: "easeInOutQuart",
        },
        interaction: {
          intersect: false,
          mode: "nearest",
        },
        onClick: (event, activeElements) => {
          // Handle click events for mobile tooltip toggle
          this.handleChartClick(event, activeElements);
        },
        plugins: {
          legend: {
            display: false, // Disable clickable legend to prevent chart toggle
            position: "top",
            labels: {
              font: {
                size: 14,
                weight: "500",
              },
              color: "#2d3748",
              usePointStyle: true,
              pointStyle: "circle",
            },
          },
          title: {
            display: true, // Enable title instead of legend
            text: this.options.title || "Ethical Impact Analysis",
            font: {
              size: 18,
              weight: "bold",
            },
            color: "#1a202c",
            padding: {
              top: 10,
              bottom: 20,
            },
          },
          tooltip: {
            enabled: window.innerWidth > MOBILE_BREAKPOINT, // Disable tooltips on mobile
            backgroundColor: "rgba(255, 255, 255, 0.3)",
            titleColor: "#1a202c",
            bodyColor: "#2d3748",
            borderColor: "#4a5568",
            borderWidth: 1,
            cornerRadius: 8,
            displayColors: false,
            titleFont: {
              size: 14,
              weight: "bold",
            },
            bodyFont: {
              size: 12,
            },
            padding: 12,
            callbacks: {
              title: (context) => {
                const axisKey = Object.keys(ETHICAL_AXES)[context[0].dataIndex];
                return ETHICAL_AXES[axisKey].label;
              },
              label: (context) => {
                const axisKey = Object.keys(ETHICAL_AXES)[context.dataIndex];
                const axisInfo = ETHICAL_AXES[axisKey];
                const score = context.parsed.r;
                const impact = this.getImpactDescription(score);

                return [
                  `Score: ${score}/5 (${impact})`,
                  ``,
                  axisInfo.description,
                ];
              },
            },
          },
        },
        scales: {
          r: {
            beginAtZero: true,
            min: MIN_SCORE,
            max: MAX_SCORE,
            ticks: {
              stepSize: 1,
              display: this.options.showLabels,
              backdropColor: "rgba(255, 255, 255, 0.8)",
              backdropPadding: 4,
              font: {
                size: 11,
                weight: "500",
              },
              color: "#4a5568",
              callback(value) {
                return value;
              },
            },
            grid: {
              color: (context) => {
                // Different colors for different score levels
                if (context.index === 0) return "rgba(239, 68, 68, 0.2)"; // Red for 0
                if (context.index === 1) return "rgba(245, 101, 101, 0.15)"; // Light red for 1
                if (context.index === 2) return "rgba(251, 191, 36, 0.15)"; // Yellow for 2
                if (context.index === NEUTRAL_SCORE)
                  return "rgba(156, 163, 175, 0.2)"; // Gray for neutral
                if (context.index === POSITIVE_THRESHOLD)
                  return "rgba(34, 197, 94, 0.15)"; // Light green for 4
                if (context.index === MAX_SCORE)
                  return "rgba(22, 163, 74, 0.2)"; // Green for 5
                return "rgba(156, 163, 175, 0.1)";
              },
              lineWidth: 2,
            },
            angleLines: {
              color: "rgba(156, 163, 175, 0.3)",
              lineWidth: 1.5,
            },
            pointLabels: {
              display: true,
              font: {
                size: 13,
                weight: "bold",
                family: "'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
              },
              color: "#1a202c",
              padding: 20,
              backdropColor: "rgba(255, 255, 255, 0.9)",
              backdropPadding: {
                x: 6,
                y: 3,
              },
              borderRadius: 4,
              callback: (label) => {
                // Ensure labels are visible - shorter labels for modal
                return label.length > MODAL_LABEL_MAX_LENGTH
                  ? `${label.substring(0, MODAL_LABEL_MAX_LENGTH)}...`
                  : label;
              },
            },
          },
        },
      },
    };
  }

  /**
   * Create dynamic gradient colors based on current scores
   */
  createGradientColors() {
    // Calculate average score to determine overall theme
    const avgScore =
      Object.values(this.currentScores).reduce((a, b) => a + b, 0) /
      Object.keys(this.currentScores).length;

    let backgroundColor, borderColor;

    if (avgScore < 2) {
      // Negative theme - reds
      backgroundColor = "rgba(239, 68, 68, 0.15)";
      borderColor = "rgba(239, 68, 68, 0.8)";
    } else if (avgScore < NEUTRAL_SCORE) {
      // Slightly negative - oranges/yellows
      backgroundColor = "rgba(245, 158, 11, 0.15)";
      borderColor = "rgba(245, 158, 11, 0.8)";
    } else if (avgScore === NEUTRAL_SCORE) {
      // Neutral theme - blues
      backgroundColor = "rgba(59, 130, 246, 0.15)";
      borderColor = "rgba(59, 130, 246, 0.8)";
    } else if (avgScore < POSITIVE_THRESHOLD) {
      // Slightly positive - light greens
      backgroundColor = "rgba(34, 197, 94, 0.15)";
      borderColor = "rgba(34, 197, 94, 0.8)";
    } else {
      // Highly positive - deep greens
      backgroundColor = "rgba(22, 163, 74, 0.15)";
      borderColor = "rgba(22, 163, 74, 0.8)";
    }

    // Create point colors based on individual scores
    const points = Object.values(this.currentScores).map((score) => {
      if (score <= 1) return "#ef4444"; // red-500
      if (score <= 2) return "#f87171"; // red-400
      if (score < NEUTRAL_SCORE) return "#fbbf24"; // amber-400
      if (score === NEUTRAL_SCORE) return "#9ca3af"; // gray-400
      if (score < MAX_SCORE) return "#22c55e"; // green-500
      return "#16a34a"; // green-600
    });

    return {
      background: backgroundColor,
      border: borderColor,
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

      // Validate and apply score updates
      for (const [axis, score] of Object.entries(scoreUpdates)) {
        if (axis in this.currentScores) {
          // Clamp score between MIN_SCORE and MAX_SCORE
          this.currentScores[axis] = Math.max(
            MIN_SCORE,
            Math.min(MAX_SCORE, score),
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
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.DATA_UPDATE,
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
    this.currentScores = { ...DEFAULT_SCORES };
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
    this.currentScores = { ...DEFAULT_SCORES, ...scores };
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
    }
  }

  /**
   * Get impact description for a score
   */
  getImpactDescription(score) {
    if (score <= 1) return "Highly Negative";
    if (score <= 2) return "Negative";
    if (score < NEUTRAL_SCORE) return "Slightly Negative";
    if (score === NEUTRAL_SCORE) return "Neutral";
    if (score < POSITIVE_THRESHOLD) return "Slightly Positive";
    if (score < MAX_SCORE) return "Positive";
    return "Highly Positive";
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
    this.container.innerHTML = `
            <div class="radar-chart-fallback">
                <h4>${this.options.title}</h4>
                <div class="fallback-scores">
                    ${Object.entries(this.currentScores)
                      .map(
                        ([axis, score]) => `
                        <div class="score-item">
                            <span class="axis-label">${ETHICAL_AXES[axis].label}:</span>
                            <span class="score-value">${score}/5</span>
                            <div class="score-bar">
                                <div class="score-fill" style="width: ${(score / MAX_SCORE) * SCALE_PERCENTAGE}%"></div>
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
      ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.USER_INTERACTION,
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
      }, ENTERPRISE_CONSTANTS.HEALTH.CHECK_INTERVAL);

      // Set up telemetry flush interval
      this.telemetryFlushInterval = setInterval(() => {
        this._flushTelemetryBatch();
      }, ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL);

      // Set up heartbeat interval
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, ENTERPRISE_CONSTANTS.HEALTH.HEARTBEAT_INTERVAL);

      logger.info("RadarChart", "🏢 Enterprise monitoring initialized", {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        healthCheckInterval: ENTERPRISE_CONSTANTS.HEALTH.CHECK_INTERVAL,
        telemetryFlushInterval: ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL,
        heartbeatInterval: ENTERPRISE_CONSTANTS.HEALTH.HEARTBEAT_INTERVAL,
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
      ENTERPRISE_CONSTANTS.ERROR_RECOVERY.CIRCUIT_BREAKER_THRESHOLD
    ) {
      this.circuitBreaker.state = "open";
      this.circuitBreaker.isOpen = true;
      this._enterFailsafeMode();
    }

    // Log telemetry for enterprise systems
    this._logTelemetry(ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.ERROR_EVENT, {
      error: error.message,
      context,
      circuitBreakerState: this.circuitBreaker.state,
      errorCount: this.errorCount,
    });

    // Attempt recovery if not in failsafe mode
    if (
      !this.circuitBreaker.isOpen &&
      this.circuitBreaker.failures <
        ENTERPRISE_CONSTANTS.ERROR_RECOVERY.MAX_RETRY_ATTEMPTS
    ) {
      setTimeout(() => {
        this._attemptRecovery(context);
      }, ENTERPRISE_CONSTANTS.ERROR_RECOVERY.RETRY_DELAY * this.circuitBreaker.failures);
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
        ENTERPRISE_CONSTANTS.HEALTH.PERFORMANCE_SAMPLE_SIZE
      ) {
        this.performanceMetrics.renderTimes.shift();
      }
    }

    // Log telemetry
    this._logTelemetry(
      ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE_METRIC,
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
    };

    this.telemetryBuffer.push(telemetryEvent);

    // Flush if buffer is full
    if (
      this.telemetryBuffer.length >= ENTERPRISE_CONSTANTS.TELEMETRY.BATCH_SIZE
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
      // For now, we'll use the logger for enterprise visibility
      logger.info("RadarChart", "Enterprise telemetry batch", {
        instanceId: this.instanceId,
        batchSize: this.telemetryBuffer.length,
        events: this.telemetryBuffer,
      });

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
        this.errorCount < ENTERPRISE_CONSTANTS.HEALTH.ERROR_THRESHOLD &&
        memoryUsage < ENTERPRISE_CONSTANTS.HEALTH.MEMORY_THRESHOLD_MB &&
        avgRenderTime < ENTERPRISE_CONSTANTS.HEALTH.RENDER_TIME_THRESHOLD_MS &&
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
      // Fallback estimation based on chart complexity
      return this.performanceMetrics.totalRenders * 0.1;
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
      randomScores[axis] = Math.random() * 5;
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
