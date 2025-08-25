/**
 * RADAR CHART REFACTORING GUIDE
 *
 * This file demonstrates how to refactor radar-chart.js to use the JSON SSOT.
 * Replace the hardcoded constants with configuration-driven approach.
 */

// BEFORE: Hardcoded constants in radar-chart.js
/*
const ENTERPRISE_CONSTANTS = {
  HEALTH: {
    CHECK_INTERVAL: 30000,
    // ... more hardcoded values
  }
};

export const ETHICAL_AXES = {
  fairness: {
    label: "Fairness",
    description: "Treats all individuals and groups equitably",
    color: "#3498db",
  },
  // ... more hardcoded values
};
*/

// AFTER: Configuration-driven approach

import logger from "../utils/logger.js";
import {
  loadRadarConfig,
  getEnterpriseConstants,
  getChartConstants,
  getEthicalAxes,
  getDefaultScores,
  getPointColor,
  getGridColor,
  getThemeColors,
  getImpactDescription,
  getChartConfigTemplate,
  validateConfig,
} from "../utils/radar-config-loader.js";

/**
 * Example of how to refactor the RadarChart class constructor
 */
class RefactoredRadarChart {
  static instanceCount = 0;
  static allInstances = new Set();
  static config = null;

  /**
   * Load configuration once for all instances
   */
  static async loadConfiguration() {
    if (!RefactoredRadarChart.config) {
      try {
        RefactoredRadarChart.config = await loadRadarConfig();
        validateConfig(RefactoredRadarChart.config);
        logger.info("RadarChart", "Configuration loaded and validated");
      } catch (error) {
        logger.error("RadarChart", "Failed to load configuration", error);
        throw error;
      }
    }
    return RefactoredRadarChart.config;
  }

  constructor(containerId, options = {}) {
    // Ensure configuration is loaded
    if (!RefactoredRadarChart.config) {
      throw new Error(
        "Configuration not loaded. Call RadarChart.loadConfiguration() first.",
      );
    }

    const config = RefactoredRadarChart.config;

    // Get constants from configuration
    this.ENTERPRISE_CONSTANTS = getEnterpriseConstants(config);
    this.CHART_CONSTANTS = getChartConstants(config);
    this.ETHICAL_AXES = getEthicalAxes(config);
    this.DEFAULT_SCORES = getDefaultScores(config);

    // Initialize with configuration values
    RefactoredRadarChart.instanceCount++;
    this.instanceId = `radar-chart-${RefactoredRadarChart.instanceCount}`;
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

    // Configuration options with defaults from config
    this.options = {
      width: options.width || this.CHART_CONSTANTS.DEFAULT_CHART_SIZE,
      height: options.height || this.CHART_CONSTANTS.DEFAULT_CHART_SIZE,
      showLabels: options.showLabels !== false,
      showLegend: options.showLegend !== false,
      animated: options.animated !== false,
      realTime: options.realTime || false,
      title: options.title || "Ethical Impact Analysis",
      isDemo: options.isDemo || false,
      ...options,
    };

    // Core chart properties using configuration
    this.chart = null;
    this.currentScores = { ...this.DEFAULT_SCORES };

    // Continue with rest of initialization...
  }

  /**
   * Example of using configuration in createGradientColors method
   */
  createGradientColors() {
    const config = RefactoredRadarChart.config;

    // Calculate average score to determine overall theme
    const avgScore =
      Object.values(this.currentScores).reduce((a, b) => a + b, 0) /
      Object.keys(this.currentScores).length;

    // Get theme colors from configuration
    const themeColors = getThemeColors(config, avgScore);

    // Create point colors based on individual scores using configuration
    const points = Object.values(this.currentScores).map((score) =>
      getPointColor(config, score),
    );

    return {
      background: themeColors.background,
      border: themeColors.border,
      points,
    };
  }

  /**
   * Example of using configuration in getChartConfig method
   */
  getChartConfig() {
    const config = RefactoredRadarChart.config;
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

    // Add grid color callback using configuration
    baseConfig.options.scales.r.grid = {
      ...baseConfig.options.scales.r.grid,
      color: (context) => getGridColor(config, context.index),
      lineWidth: config.chartConfig.scales.r.grid.lineWidth,
    };

    // Add tooltip callbacks using configuration
    baseConfig.options.plugins.tooltip.callbacks = {
      title: (context) => {
        const axisKey = Object.keys(this.ETHICAL_AXES)[context[0].dataIndex];
        return this.ETHICAL_AXES[axisKey].label;
      },
      label: (context) => {
        const axisKey = Object.keys(this.ETHICAL_AXES)[context.dataIndex];
        const axisInfo = this.ETHICAL_AXES[axisKey];
        const score = context.parsed.r;
        const impact = getImpactDescription(config, score);

        return [
          `Score: ${score}/${config.scoring.maxScore} (${impact})`,
          ``,
          axisInfo.description,
        ];
      },
    };

    return baseConfig;
  }

  /**
   * Example of using configuration in getImpactDescription method
   */
  getImpactDescription(score) {
    return getImpactDescription(RefactoredRadarChart.config, score);
  }

  /**
   * Example static method to initialize all radar charts
   */
  static async initializeAll() {
    await RefactoredRadarChart.loadConfiguration();
    logger.info(
      "RadarChart",
      "Ready to create instances with loaded configuration",
    );
  }
}

/**
 * MIGRATION STEPS:
 *
 * 1. Replace all hardcoded constants with config calls:
 *    - ENTERPRISE_CONSTANTS → getEnterpriseConstants(config)
 *    - ETHICAL_AXES → getEthicalAxes(config)
 *    - DEFAULT_SCORES → getDefaultScores(config)
 *    - Color constants → getPointColor(), getGridColor(), getThemeColors()
 *
 * 2. Update methods that use constants:
 *    - createGradientColors() → use config-based color functions
 *    - getChartConfig() → use getChartConfigTemplate()
 *    - getImpactDescription() → use config-based function
 *
 * 3. Add configuration loading:
 *    - Static loadConfiguration() method
 *    - Validate configuration on load
 *    - Cache configuration for reuse
 *
 * 4. Update initialization:
 *    - Load config before creating instances
 *    - Pass config to all methods that need it
 *    - Add error handling for config loading
 *
 * 5. Benefits achieved:
 *    - Single source of truth for all configuration
 *    - Easy to modify colors, thresholds, and patterns
 *    - Better maintainability and consistency
 *    - Configuration validation and error handling
 *    - Easier testing with different configurations
 */

export default RefactoredRadarChart;
