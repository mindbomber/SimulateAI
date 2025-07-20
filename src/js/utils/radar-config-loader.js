/**
 * Radar Chart Configuration Loader
 * Provides type-safe access to radar chart configuration from JSON SSOT
 */

import logger from "./logger.js";

let configCache = null;

/**
 * Load and cache the radar chart configuration
 * @returns {Promise<Object>} Configuration object
 */
export async function loadRadarConfig() {
  if (configCache) {
    return configCache;
  }

  try {
    // Use relative path from public root
    const response = await fetch("/src/config/radar-chart-config.json");
    if (!response.ok) {
      throw new Error(`Failed to load radar config: ${response.status}`);
    }
    configCache = await response.json();
    logger.info("RadarConfig", "Configuration loaded successfully", {
      version: configCache.version,
      lastUpdated: configCache.lastUpdated,
    });

    return configCache;
  } catch (error) {
    logger.error("RadarConfig", "Failed to load configuration", error);
    throw error;
  }
}

/**
 * Get enterprise constants
 * @param {Object} config - Configuration object
 * @returns {Object} Enterprise constants
 */
export function getEnterpriseConstants(config) {
  return {
    HEALTH: config.enterprise.health,
    PERFORMANCE: config.enterprise.performance,
    TELEMETRY: {
      ...config.enterprise.telemetry,
      EVENT_TYPES: config.enterprise.telemetry.eventTypes,
    },
    ERROR_RECOVERY: config.enterprise.errorRecovery,
  };
}

/**
 * Get chart constants
 * @param {Object} config - Configuration object
 * @returns {Object} Chart constants
 */
export function getChartConstants(config) {
  return {
    DEFAULT_CHART_SIZE: config.chart.defaultSize,
    ANIMATION_DURATION: config.chart.animationDuration,
    MOBILE_BREAKPOINT: config.chart.mobileBreakpoint,
    MODAL_LABEL_MAX_LENGTH: config.chart.modalLabelMaxLength,
    SCALE_PERCENTAGE: config.chart.scalePercentage,
    MAX_SCORE: config.scoring.maxScore,
    MIN_SCORE: config.scoring.minScore,
    NEUTRAL_SCORE: config.scoring.neutralScore,
    POSITIVE_THRESHOLD: config.scoring.positiveThreshold,
  };
}

/**
 * Get ethical axes definitions
 * @param {Object} config - Configuration object
 * @returns {Object} Ethical axes
 */
export function getEthicalAxes(config) {
  return config.ethicalAxes;
}

/**
 * Get default scores
 * @param {Object} config - Configuration object
 * @returns {Object} Default scores
 */
export function getDefaultScores(config) {
  return { ...config.defaultScores };
}

/**
 * Get color for score value
 * @param {Object} config - Configuration object
 * @param {number} score - Score value
 * @returns {string} Color hex code
 */
export function getPointColor(config, score) {
  const { neutralScore, maxScore } = config.scoring;

  if (score <= 1) return config.pointColors["0"];
  if (score <= 2) return config.pointColors["2"];
  if (score < neutralScore) return config.pointColors["2.5"];
  if (score === neutralScore) return config.pointColors["3"];
  if (score < maxScore) return config.pointColors["4"];
  return config.pointColors["5"];
}

/**
 * Get grid color for context index
 * @param {Object} config - Configuration object
 * @param {number} index - Grid line index
 * @returns {string} Color rgba string
 */
export function getGridColor(config, index) {
  return config.gridColors[index] || config.gridColors.default;
}

/**
 * Get theme colors based on average score
 * @param {Object} config - Configuration object
 * @param {number} avgScore - Average score
 * @returns {Object} Theme colors {background, border}
 */
export function getThemeColors(config, avgScore) {
  const { neutralScore, positiveThreshold } = config.scoring;

  if (avgScore < 2) return config.themes.negative;
  if (avgScore < neutralScore) return config.themes.slightlyNegative;
  if (avgScore === neutralScore) return config.themes.neutral;
  if (avgScore < positiveThreshold) return config.themes.slightlyPositive;
  return config.themes.positive;
}

/**
 * Get impact description for score
 * @param {Object} config - Configuration object
 * @param {number} score - Score value
 * @returns {string} Impact description
 */
export function getImpactDescription(config, score) {
  const { neutralScore, positiveThreshold, maxScore } = config.scoring;

  if (score <= 1) return config.impactDescriptions["0-1"];
  if (score <= 2) return config.impactDescriptions["1-2"];
  if (score < neutralScore) return config.impactDescriptions["2-3"];
  if (score === neutralScore) return config.impactDescriptions["3"];
  if (score < positiveThreshold) return config.impactDescriptions["3-4"];
  if (score < maxScore) return config.impactDescriptions["4-5"];
  return config.impactDescriptions["5"];
}

/**
 * Get demo pattern by name
 * @param {Object} config - Configuration object
 * @param {string} patternName - Pattern name
 * @returns {Object|null} Demo pattern or null if not found
 */
export function getDemoPattern(config, patternName) {
  return config.demoPatterns[patternName] || null;
}

/**
 * Get Chart.js configuration template
 * @param {Object} config - Configuration object
 * @param {Object} options - Chart options override
 * @returns {Object} Chart.js configuration
 */
export function getChartConfigTemplate(config, options = {}) {
  const template = {
    type: "radar",
    options: {
      responsive:
        config.chartConfig.responsive !== undefined
          ? config.chartConfig.responsive
          : true,
      maintainAspectRatio:
        config.chartConfig.maintainAspectRatio !== undefined
          ? config.chartConfig.maintainAspectRatio
          : false,
      devicePixelRatio: config.chartConfig.devicePixelRatio || 1,
      layout: config.chartConfig.layout,
      animation: {
        duration:
          options.animated !== false
            ? config.chartConfig.animation?.duration ||
              config.chart.animationDuration
            : 0,
        easing: config.chartConfig.animation?.easing || "easeInOutQuart",
        animateRotate:
          config.chartConfig.animation?.animateRotate !== undefined
            ? config.chartConfig.animation.animateRotate
            : true,
        animateScale:
          config.chartConfig.animation?.animateScale !== undefined
            ? config.chartConfig.animation.animateScale
            : false,
      },
      interaction: {
        intersect:
          config.chartConfig.interaction?.intersect !== undefined
            ? config.chartConfig.interaction.intersect
            : false,
        mode: config.chartConfig.interaction?.mode || "nearest",
        includeInvisible:
          config.chartConfig.interaction?.includeInvisible !== undefined
            ? config.chartConfig.interaction.includeInvisible
            : false,
      },
      plugins: {
        ...config.chartConfig.plugins,
        title: {
          ...config.chartConfig.plugins.title,
          text: options.title || "Ethical Impact Analysis",
        },
        tooltip: {
          ...config.chartConfig.plugins.tooltip,
          enabled:
            typeof window !== "undefined"
              ? window.innerWidth > config.chart.mobileBreakpoint
              : true,
        },
      },
      scales: {
        r: {
          ...config.chartConfig.scales.r,
          min: config.scoring.minScore,
          max: config.scoring.maxScore,
          ticks: {
            ...config.chartConfig.scales.r.ticks,
            display: options.showLabels !== false,
          },
        },
      },
      elements: config.chartConfig.elements || {},
      hover: config.chartConfig.hover || {
        mode: "nearest",
        intersect: false,
        animationDuration: 200,
      },
    },
  };

  return template;
}

/**
 * Validate configuration integrity
 * @param {Object} config - Configuration object
 * @returns {boolean} True if valid
 * @throws {Error} If configuration is invalid
 */
export function validateConfig(config) {
  const required = [
    "enterprise",
    "chart",
    "scoring",
    "ethicalAxes",
    "defaultScores",
    "themes",
    "pointColors",
    "gridColors",
    "impactDescriptions",
    "demoPatterns",
    "chartConfig",
  ];

  for (const key of required) {
    if (!config[key]) {
      throw new Error(`Missing required configuration section: ${key}`);
    }
  }

  // Validate ethical axes match default scores
  const axesKeys = Object.keys(config.ethicalAxes);
  const scoresKeys = Object.keys(config.defaultScores);

  if (axesKeys.length !== scoresKeys.length) {
    throw new Error("Ethical axes and default scores count mismatch");
  }

  for (const key of axesKeys) {
    if (!scoresKeys.includes(key)) {
      throw new Error(`Default score missing for axis: ${key}`);
    }
  }

  logger.info("RadarConfig", "Configuration validation passed");
  return true;
}

/**
 * Get configuration summary for debugging
 * @param {Object} config - Configuration object
 * @returns {Object} Configuration summary
 */
export function getConfigSummary(config) {
  return {
    version: config.version,
    lastUpdated: config.lastUpdated,
    ethicalAxesCount: Object.keys(config.ethicalAxes).length,
    demoPatternCount: Object.keys(config.demoPatterns).length,
    enterpriseMonitoring: !!config.enterprise,
    chartThemes: Object.keys(config.themes).length,
  };
}

// Make configuration loader available globally for debugging
if (typeof window !== "undefined") {
  window.debugRadarConfig = async function () {
    try {
      const config = await loadRadarConfig();
      return getConfigSummary(config);
    } catch (error) {
      console.error("Failed to load radar config for debugging:", error);
      return null;
    }
  };
}

// Export the main loader function as default
export default loadRadarConfig;
