/**
 * Pre-Launch Modal Configuration Loader
 * Enterprise-grade async configuration loading with caching, validation, and computed properties
 *
 * Features:
 * - Async configuration loading with 5-minute caching
 * - Computed properties for easier access to nested values
 * - Configuration validation and fallback handling
 * - Performance optimization with lazy loading
 * - Circuit breaker and health monitoring helpers
 * - Enterprise monitoring configuration utilities
 */

// Configuration cache with 5-minute TTL
let configCache = null;
let configCacheTimestamp = 0;
const CONFIG_CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Configuration validation schema
const CONFIG_SCHEMA = {
  enterprise: {
    health: ["checkInterval", "heartbeatInterval", "failureThreshold"],
    telemetry: ["flushInterval", "batchSize", "retryAttempts"],
    performance: ["maxRenderTime", "warningRenderTime", "maxTabSwitchTime"],
    circuitBreaker: ["failureThreshold", "successThreshold", "recoveryTimeout"],
    errorRecovery: ["maxRetryAttempts", "retryDelay", "backoffMultiplier"],
  },
  ui: {
    animations: ["duration", "easing", "updateDelay"],
    layout: ["mobileBreakpoint", "maxModalWidth", "contentPadding"],
    tabs: ["defaultTab", "tabOrder", "icons"],
    accessibility: ["enableAriaLabels", "enableKeyboardNavigation"],
  },
  modal: {
    behavior: ["closeOnBackdrop", "closeOnEscape", "preventBodyScroll"],
    styling: ["backdrop", "modal"],
    positioning: ["centered", "responsive"],
  },
};

// Default fallback configuration
const DEFAULT_CONFIG = {
  enterprise: {
    health: {
      checkInterval: 30000,
      heartbeatInterval: 60000,
      failureThreshold: 5,
    },
    telemetry: {
      flushInterval: 60000,
      batchSize: 50,
      retryAttempts: 3,
    },
    performance: {
      maxRenderTime: 1000,
      warningRenderTime: 500,
      maxTabSwitchTime: 300,
      maxContentGenerationTime: 2000,
    },
    circuitBreaker: {
      failureThreshold: 5,
      successThreshold: 3,
      recoveryTimeout: 30000,
    },
    errorRecovery: {
      maxRetryAttempts: 3,
      retryDelay: 1000,
      backoffMultiplier: 2,
    },
  },
  ui: {
    animations: {
      duration: 300,
      updateDelay: 100,
    },
    layout: {
      mobileBreakpoint: 768,
      maxModalWidth: 1200,
      contentPadding: 24,
    },
    tabs: {
      defaultTab: "overview",
      tabOrder: [
        "overview",
        "objectives",
        "ethics",
        "preparation",
        "resources",
      ],
    },
  },
  modal: {
    behavior: {
      closeOnBackdrop: false,
      closeOnEscape: true,
      preventBodyScroll: true,
    },
  },
};

/**
 * Load and cache pre-launch modal configuration
 * @param {boolean} forceRefresh - Force reload from source
 * @returns {Promise<Object>} Processed configuration object
 */
export async function loadPreLaunchModalConfig(forceRefresh = false) {
  try {
    // Check cache validity
    const now = Date.now();
    if (
      !forceRefresh &&
      configCache &&
      now - configCacheTimestamp < CONFIG_CACHE_TTL
    ) {
      return configCache;
    }

    // Load configuration from JSON file
    const response = await fetch("/src/config/pre-launch-modal-config.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load config: ${response.status} ${response.statusText}`,
      );
    }

    const rawConfig = await response.json();

    // Validate and process configuration
    const processedConfig = await processPreLaunchModalConfig(rawConfig);

    // Cache the processed configuration
    configCache = processedConfig;
    configCacheTimestamp = now;

    console.log(
      "[PreLaunchModal Config] Configuration loaded and cached successfully",
    );
    return processedConfig;
  } catch (error) {
    console.error(
      "[PreLaunchModal Config] Error loading configuration:",
      error,
    );

    // Return default configuration as fallback
    const fallbackConfig = await processPreLaunchModalConfig(DEFAULT_CONFIG);
    console.warn("[PreLaunchModal Config] Using fallback configuration");
    return fallbackConfig;
  }
}

/**
 * Process and enhance configuration with computed properties
 * @param {Object} rawConfig - Raw configuration object
 * @returns {Promise<Object>} Enhanced configuration with computed properties
 */
export async function processPreLaunchModalConfig(rawConfig) {
  try {
    // Validate configuration structure
    const validatedConfig = validateConfigStructure(rawConfig);

    // Add computed properties for easier access
    const enhancedConfig = {
      ...validatedConfig,

      // Computed enterprise properties
      computed: {
        // Health monitoring helpers
        health: {
          isCheckIntervalValid: () =>
            validatedConfig.enterprise.health.checkInterval >= 1000,
          isHeartbeatIntervalValid: () =>
            validatedConfig.enterprise.health.heartbeatInterval >= 5000,
          getEffectiveCheckInterval: () =>
            Math.max(1000, validatedConfig.enterprise.health.checkInterval),
          getEffectiveHeartbeatInterval: () =>
            Math.max(5000, validatedConfig.enterprise.health.heartbeatInterval),
        },

        // Performance threshold helpers
        performance: {
          getRenderThresholds: () => ({
            warning: validatedConfig.enterprise.performance.warningRenderTime,
            critical: validatedConfig.enterprise.performance.maxRenderTime,
          }),
          getTabSwitchThresholds: () => ({
            warning:
              validatedConfig.enterprise.performance.warningTabSwitchTime ||
              validatedConfig.enterprise.performance.maxTabSwitchTime * 0.7,
            critical: validatedConfig.enterprise.performance.maxTabSwitchTime,
          }),
          getContentGenerationThresholds: () => ({
            warning:
              validatedConfig.enterprise.performance
                .warningContentGenerationTime ||
              validatedConfig.enterprise.performance.maxContentGenerationTime *
                0.6,
            critical:
              validatedConfig.enterprise.performance.maxContentGenerationTime,
          }),
          isPerformanceViolation: (operation, duration) => {
            const thresholds = validatedConfig.enterprise.performance;
            switch (operation) {
              case "render":
                return duration > thresholds.maxRenderTime;
              case "tab_switch":
                return duration > thresholds.maxTabSwitchTime;
              case "content_generation":
                return duration > thresholds.maxContentGenerationTime;
              case "constructor":
                return duration > (thresholds.maxConstructorTime || 100);
              default:
                return false;
            }
          },
          isPerformanceWarning: (operation, duration) => {
            const thresholds = validatedConfig.enterprise.performance;
            switch (operation) {
              case "render":
                return duration > thresholds.warningRenderTime;
              case "tab_switch":
                return (
                  duration >
                  (thresholds.warningTabSwitchTime ||
                    thresholds.maxTabSwitchTime * 0.7)
                );
              case "content_generation":
                return (
                  duration >
                  (thresholds.warningContentGenerationTime ||
                    thresholds.maxContentGenerationTime * 0.6)
                );
              case "constructor":
                return duration > (thresholds.warningConstructorTime || 50);
              default:
                return false;
            }
          },
        },

        // Circuit breaker helpers
        circuitBreaker: {
          shouldTripCircuit: (failureCount) =>
            failureCount >=
            validatedConfig.enterprise.circuitBreaker.failureThreshold,
          shouldCloseCircuit: (successCount) =>
            successCount >=
            validatedConfig.enterprise.circuitBreaker.successThreshold,
          getNextAttemptTime: (lastFailureTime) =>
            lastFailureTime +
            validatedConfig.enterprise.circuitBreaker.recoveryTimeout,
          isRecoveryWindowExpired: (lastFailureTime) => {
            return (
              Date.now() >=
              lastFailureTime +
                validatedConfig.enterprise.circuitBreaker.recoveryTimeout
            );
          },
        },

        // Error recovery helpers
        errorRecovery: {
          getRetryDelay: (attemptNumber) => {
            const baseDelay =
              validatedConfig.enterprise.errorRecovery.retryDelay;
            const multiplier =
              validatedConfig.enterprise.errorRecovery.backoffMultiplier;
            const maxDelay =
              validatedConfig.enterprise.errorRecovery.maxRetryDelay || 10000;

            if (validatedConfig.enterprise.errorRecovery.exponentialBackoff) {
              const delay = baseDelay * Math.pow(multiplier, attemptNumber - 1);
              return Math.min(delay, maxDelay);
            }
            return baseDelay;
          },
          shouldRetry: (attemptNumber) =>
            attemptNumber <
            validatedConfig.enterprise.errorRecovery.maxRetryAttempts,
          getRecoveryStrategy: (context) => {
            const strategies =
              validatedConfig.enterprise.errorRecovery.recoveryStrategies;
            return strategies[context] || ["retry"];
          },
        },

        // Telemetry helpers
        telemetry: {
          shouldFlushBatch: (batchSize) =>
            batchSize >= validatedConfig.enterprise.telemetry.batchSize,
          getEffectiveBatchSize: () =>
            Math.min(
              validatedConfig.enterprise.telemetry.batchSize,
              validatedConfig.enterprise.telemetry.maxBatchSize || 200,
            ),
          isCompressionEnabled: () =>
            validatedConfig.enterprise.telemetry.compressionEnabled !== false,
        },

        // UI helpers
        ui: {
          isMobile: () =>
            window.innerWidth <= validatedConfig.ui.layout.mobileBreakpoint,
          isTablet: () =>
            window.innerWidth <=
            (validatedConfig.ui.layout.tabletBreakpoint || 1024),
          getAnimationDuration: (type = "default") => {
            const animations = validatedConfig.ui.animations;
            switch (type) {
              case "tab":
                return animations.tabSwitchDuration || animations.duration;
              case "content":
                return (
                  animations.contentFadeDuration || animations.duration * 0.5
                );
              default:
                return animations.duration;
            }
          },
          getTabIcon: (tabId) => {
            return validatedConfig.ui.tabs.icons[tabId] || "📄";
          },
          isAccessibilityEnabled: (feature) => {
            return validatedConfig.ui.accessibility[feature] !== false;
          },
        },

        // Modal helpers
        modal: {
          shouldCloseOnBackdrop: () =>
            validatedConfig.modal.behavior.closeOnBackdrop === true,
          shouldCloseOnEscape: () =>
            validatedConfig.modal.behavior.closeOnEscape !== false,
          shouldPreventBodyScroll: () =>
            validatedConfig.modal.behavior.preventBodyScroll !== false,
          getModalStyles: () => ({
            maxWidth: validatedConfig.ui.layout.maxModalWidth,
            minHeight: validatedConfig.ui.layout.minModalHeight,
            padding: validatedConfig.ui.layout.contentPadding,
            borderRadius: validatedConfig.modal.styling.modal.borderRadius,
            backgroundColor:
              validatedConfig.modal.styling.modal.backgroundColor,
          }),
        },
      },
    };

    // Add utility methods
    enhancedConfig.utils = {
      // Get nested configuration value with fallback
      getValue: (path, fallback = null) => {
        return getNestedValue(enhancedConfig, path, fallback);
      },

      // Check if feature is enabled
      isFeatureEnabled: (featurePath) => {
        return getNestedValue(
          enhancedConfig,
          `features.${featurePath}.enabled`,
          false,
        );
      },

      // Get configuration metadata
      getMetadata: () => enhancedConfig.metadata || {},

      // Validate configuration integrity
      validateIntegrity: () => validateConfigStructure(enhancedConfig),

      // Get enterprise monitoring configuration
      getMonitoringConfig: () => ({
        health: enhancedConfig.enterprise.health,
        telemetry: enhancedConfig.enterprise.telemetry,
        performance: enhancedConfig.enterprise.performance,
        circuitBreaker: enhancedConfig.enterprise.circuitBreaker,
        errorRecovery: enhancedConfig.enterprise.errorRecovery,
      }),
    };

    return enhancedConfig;
  } catch (error) {
    console.error(
      "[PreLaunchModal Config] Error processing configuration:",
      error,
    );
    throw error;
  }
}

/**
 * Validate configuration structure against schema
 * @param {Object} config - Configuration to validate
 * @returns {Object} Validated configuration with fallbacks
 */
function validateConfigStructure(config) {
  const validatedConfig = JSON.parse(JSON.stringify(config)); // Deep clone

  // Validate and apply fallbacks for each section
  Object.keys(CONFIG_SCHEMA).forEach((section) => {
    if (!validatedConfig[section]) {
      validatedConfig[section] = {};
    }

    Object.keys(CONFIG_SCHEMA[section]).forEach((subsection) => {
      if (!validatedConfig[section][subsection]) {
        validatedConfig[section][subsection] = {};
      }

      // Apply fallbacks for required properties
      CONFIG_SCHEMA[section][subsection].forEach((property) => {
        if (validatedConfig[section][subsection][property] === undefined) {
          const fallbackValue = getNestedValue(
            DEFAULT_CONFIG,
            `${section}.${subsection}.${property}`,
          );
          if (fallbackValue !== undefined) {
            validatedConfig[section][subsection][property] = fallbackValue;
          }
        }
      });
    });
  });

  return validatedConfig;
}

/**
 * Get nested object value by path
 * @param {Object} obj - Object to search
 * @param {string} path - Dot-separated path
 * @param {*} fallback - Fallback value
 * @returns {*} Found value or fallback
 */
function getNestedValue(obj, path, fallback = undefined) {
  return path.split(".").reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : fallback;
  }, obj);
}

/**
 * Clear configuration cache (useful for testing or config updates)
 */
export function clearConfigCache() {
  configCache = null;
  configCacheTimestamp = 0;
  console.log("[PreLaunchModal Config] Configuration cache cleared");
}

/**
 * Get current cache status
 * @returns {Object} Cache status information
 */
export function getCacheStatus() {
  const now = Date.now();
  return {
    isCached: configCache !== null,
    cacheAge: configCache ? now - configCacheTimestamp : 0,
    cacheValid: configCache && now - configCacheTimestamp < CONFIG_CACHE_TTL,
    ttl: CONFIG_CACHE_TTL,
    remainingTtl: configCache
      ? Math.max(0, CONFIG_CACHE_TTL - (now - configCacheTimestamp))
      : 0,
  };
}

/**
 * Preload configuration for better performance
 * @returns {Promise<Object>} Loaded configuration
 */
export async function preloadConfig() {
  console.log("[PreLaunchModal Config] Preloading configuration...");
  return await loadPreLaunchModalConfig();
}

// Export default loader function
export default loadPreLaunchModalConfig;
