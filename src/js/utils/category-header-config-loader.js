/**
 * Category Header Configuration Loader
 * Provides type-safe access to category header configuration from JSON SSOT
 */

import logger from "./logger.js";

let configCache = null;

/**
 * Load and cache the category header configuration
 * @returns {Promise<Object>} Configuration object
 */
export async function loadCategoryHeaderConfig() {
  if (configCache) {
    return configCache;
  }

  try {
    const response = await fetch("/src/config/category-header-config.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load category header config: ${response.status}`,
      );
    }
    configCache = await response.json();

    logger.info("CategoryHeader", "Configuration loaded successfully");
    return configCache;
  } catch (error) {
    logger.error("CategoryHeader", "Failed to load configuration", error);
    throw error;
  }
}

/**
 * Get progress ring configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Progress ring configuration
 */
export function getProgressRingConfig(config) {
  if (!config) throw new Error("Configuration required");
  return config.progressRing || {};
}

/**
 * Get tooltip configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Tooltip configuration
 */
export function getTooltipConfig(config) {
  if (!config) throw new Error("Configuration required");
  return config.tooltip || {};
}

/**
 * Get HTML template configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} HTML templates configuration
 */
export function getHtmlTemplates(config) {
  if (!config) throw new Error("Configuration required");
  return config.htmlTemplates || {};
}

/**
 * Get styling configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Styling configuration
 */
export function getStylingConfig(config) {
  if (!config) throw new Error("Configuration required");
  return config.styling || {};
}

/**
 * Get event handling configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Events configuration
 */
export function getEventsConfig(config) {
  if (!config) throw new Error("Configuration required");
  return config.events || {};
}

/**
 * Get badge configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Badge configuration
 */
export function getBadgeConfig(config) {
  if (!config) throw new Error("Configuration required");
  return config.badge || {};
}

/**
 * Get CSS selectors configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Selectors configuration
 */
export function getSelectors(config) {
  if (!config) throw new Error("Configuration required");
  return config.selectors || {};
}

/**
 * Get HTML attributes configuration
 * @param {Object} config - Main configuration object
 * @returns {Object} Attributes configuration
 */
export function getAttributes(config) {
  if (!config) throw new Error("Configuration required");
  return config.attributes || {};
}

/**
 * Calculate progress circle stroke-dashoffset
 * @param {Object} config - Main configuration object
 * @param {number} percentage - Progress percentage (0-100)
 * @returns {number} Calculated stroke-dashoffset value
 */
export function calculateProgressOffset(config, percentage) {
  const progressRing = getProgressRingConfig(config);
  const circumference = progressRing.dimensions?.circumference || 163;
  return circumference - (percentage / 100) * circumference;
}

/**
 * Generate tooltip content based on progress and badge status
 * @param {Object} config - Main configuration object
 * @param {Object} progress - Progress data
 * @param {Object} badgeProgress - Badge progress data
 * @returns {string} Formatted tooltip content
 */
export function generateTooltipContent(config, progress, badgeProgress) {
  const badgeConfig = getBadgeConfig(config);
  const messages = badgeConfig.messages || {};

  let content =
    messages.completedFormat
      ?.replace("{completed}", progress.completed)
      ?.replace("{total}", progress.total) ||
    `${progress.completed} of ${progress.total} scenarios completed`;

  if (badgeProgress?.nextBadge) {
    const { remaining } = badgeProgress.progress || {};

    if (remaining === badgeConfig.alertThreshold) {
      content += `. ${messages.oneScenarioAway}: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
    } else if (remaining > 1) {
      const multipleMessage =
        messages.multipleScenarios?.replace("{remaining}", remaining) ||
        `${remaining} more to unlock next badge`;
      content += `. ${multipleMessage}: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
    }
  } else {
    const percentageText =
      messages.percentageFormat?.replace("{percentage}", progress.percentage) ||
      `(${progress.percentage}%)`;
    content += ` ${percentageText}`;
  }

  return content;
}

/**
 * Get category selector with interpolated categoryId
 * @param {Object} config - Main configuration object
 * @param {string} categoryId - Category identifier
 * @returns {string} CSS selector for category progress ring
 */
export function getCategorySelector(config, categoryId) {
  const selectors = getSelectors(config);
  return (
    selectors.progressRingByCategory?.replace("{categoryId}", categoryId) ||
    `.category-progress-ring[data-category-id="${categoryId}"]`
  );
}

/**
 * Create progress ring styles based on configuration
 * @param {Object} config - Main configuration object
 * @param {Object} category - Category data
 * @param {number} percentage - Progress percentage
 * @returns {Object} Style properties for progress ring
 */
export function createProgressRingStyles(config, category, percentage) {
  const progressRing = getProgressRingConfig(config);
  const styling = getStylingConfig(config);

  return {
    strokeDasharray: progressRing.dimensions?.circumference || 163,
    strokeDashoffset: calculateProgressOffset(config, percentage),
    stroke: category.color,
    strokeWidth: progressRing.dimensions?.strokeWidth || 4,
    strokeLinecap: progressRing.colors?.strokeLinecap || "round",
    transform: styling.progressRing?.transform || "rotate(-90deg)",
    transformOrigin: progressRing.animation?.transformOrigin || "30px 30px",
  };
}

/**
 * Create tooltip positioning styles
 * @param {Object} config - Main configuration object
 * @param {DOMRect} ringRect - Progress ring bounding rectangle
 * @param {DOMRect} tooltipRect - Tooltip bounding rectangle
 * @returns {Object} Style properties for tooltip positioning
 */
export function createTooltipStyles(config, ringRect, tooltipRect) {
  const tooltipConfig = getTooltipConfig(config);
  const offset = tooltipConfig.offset || 8;

  const styles = {
    position: tooltipConfig.positioning?.position || "fixed",
    left: `${ringRect.left + ringRect.width / 2}px`,
    transform: tooltipConfig.positioning?.transform || "translateX(-50%)",
    zIndex: tooltipConfig.zIndex || 1000,
  };

  // Calculate top position
  const topPosition = ringRect.top - tooltipRect.height - offset;

  if (topPosition < 0) {
    // Show below if would go off-screen
    styles.top = `${ringRect.bottom + offset}px`;
  } else {
    styles.top = `${topPosition}px`;
  }

  return styles;
}

/**
 * Validate category header configuration
 * @param {Object} config - Configuration to validate
 * @returns {boolean} True if valid
 */
export function validateCategoryHeaderConfig(config) {
  try {
    const required = [
      "progressRing",
      "tooltip",
      "htmlTemplates",
      "events",
      "selectors",
    ];

    for (const section of required) {
      if (!config[section]) {
        throw new Error(`Missing required configuration section: ${section}`);
      }
    }

    // Validate progress ring dimensions
    const progressRing = config.progressRing;
    if (!progressRing.dimensions || !progressRing.dimensions.circumference) {
      throw new Error("Progress ring dimensions.circumference is required");
    }

    // Validate tooltip configuration
    if (typeof config.tooltip.offset !== "number") {
      throw new Error("Tooltip offset must be a number");
    }

    logger.info("CategoryHeader", "Configuration validation passed");
    return true;
  } catch (error) {
    logger.error("CategoryHeader", "Configuration validation failed", error);
    return false;
  }
}

/**
 * Get configuration summary for debugging
 * @param {Object} config - Configuration object
 * @returns {Object} Configuration summary
 */
export function getConfigSummary(config) {
  if (!config) return null;

  return {
    progressRing: {
      dimensions: !!config.progressRing?.dimensions,
      animation: !!config.progressRing?.animation,
      colors: !!config.progressRing?.colors,
    },
    tooltip: {
      hasOffset: typeof config.tooltip?.offset === "number",
      hasMobileConfig: !!config.tooltip?.mobile,
      hasDesktopConfig: !!config.tooltip?.desktop,
    },
    templates: {
      categoryHeader: !!config.htmlTemplates?.categoryHeader,
      progressRing: !!config.htmlTemplates?.progressRing,
      categoryMeta: !!config.htmlTemplates?.categoryMeta,
    },
    events: {
      desktop: Object.keys(config.events?.desktop || {}).length,
      mobile: Object.keys(config.events?.mobile || {}).length,
      accessibility: Object.keys(config.events?.accessibility || {}).length,
    },
    selectors: Object.keys(config.selectors || {}).length,
    badges: !!config.badge?.messages,
  };
}

// Export the main loader function as default
export default loadCategoryHeaderConfig;
