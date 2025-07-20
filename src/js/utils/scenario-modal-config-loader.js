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
 * Scenario Modal Configuration Loader
 * Handles loading and processing of scenario modal configuration from JSON SSOT
 * Enterprise-grade configuration management with performance optimization
 */

import logger from "./logger.js";

/**
 * Configuration cache for performance optimization
 */
let configCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load scenario modal configuration from JSON file
 * @returns {Promise<Object>} The scenario modal configuration object
 */
export async function loadScenarioModalConfig() {
  try {
    // Check cache first
    if (
      configCache &&
      lastLoadTime &&
      Date.now() - lastLoadTime < CACHE_DURATION
    ) {
      logger.debug("ScenarioModal configuration loaded from cache");
      return configCache;
    }

    // Load from file
    const response = await fetch("/src/config/scenario-modal-config.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load scenario modal configuration: ${response.status} ${response.statusText}`,
      );
    }

    const configData = await response.json();

    if (!configData || !configData.scenarioModal) {
      throw new Error("Invalid scenario modal configuration structure");
    }

    // Apply computed properties and validate
    const processedConfig = await processScenarioModalConfig(
      configData.scenarioModal,
    );

    // Cache the result
    configCache = processedConfig;
    lastLoadTime = Date.now();

    logger.info("ScenarioModal configuration loaded successfully", {
      animations: !!processedConfig.animations,
      enterprise: !!processedConfig.enterprise,
      modal: !!processedConfig.modal,
      radarChart: !!processedConfig.radarChart,
    });

    return processedConfig;
  } catch (error) {
    logger.error("Error loading ScenarioModal configuration:", error);

    // Return fallback configuration
    const fallbackConfig = getScenarioModalFallbackConfig();
    logger.warn("Using fallback ScenarioModal configuration");
    return fallbackConfig;
  }
}

/**
 * Process and enhance configuration with computed properties
 * @param {Object} config - Raw configuration object
 * @returns {Promise<Object>} Processed configuration object
 */
async function processScenarioModalConfig(config) {
  try {
    // Create deep copy to avoid mutations
    const processedConfig = JSON.parse(JSON.stringify(config));

    // Add computed properties for easier access
    processedConfig.computed = {
      // Animation helpers
      animations: {
        modalEnterDuration:
          processedConfig.animations?.durations?.modalEnterTransition || 400,
        modalExitDuration:
          processedConfig.animations?.durations?.modalExitTransition || 300,
        typewriterSpeed:
          processedConfig.typewriter?.effects?.characterSpeed || 50,
        radarAnimationDuration:
          processedConfig.animations?.durations?.radarChartAnimation || 800,
      },

      // Enterprise thresholds
      performance: {
        isSlowModalOpen: (duration) =>
          duration >
          (processedConfig.enterprise?.performance?.thresholds
            ?.warningModalOpenTime || 1500),
        isCriticalModalOpen: (duration) =>
          duration >
          (processedConfig.enterprise?.performance?.thresholds
            ?.maxModalOpenTime || 3000),
        isSlowRadarInit: (duration) =>
          duration >
          (processedConfig.enterprise?.performance?.thresholds
            ?.warningRadarInitTime || 1000),
        isCriticalRadarInit: (duration) =>
          duration >
          (processedConfig.enterprise?.performance?.thresholds
            ?.maxRadarInitTime || 2000),
      },

      // Health monitoring helpers
      health: {
        shouldPerformHealthCheck: () =>
          processedConfig.enterprise?.health?.diagnostics
            ?.enableHealthChecks !== false,
        getCheckInterval: () =>
          processedConfig.enterprise?.health?.monitoring?.checkInterval ||
          20000,
        isUnhealthy: (errorCount) =>
          errorCount >=
          (processedConfig.enterprise?.health?.monitoring?.failureThreshold ||
            3),
      },

      // Circuit breaker helpers
      circuitBreaker: {
        isEnabled: () =>
          processedConfig.enterprise?.circuitBreaker?.behavior
            ?.enableCircuitBreaker !== false,
        shouldOpenCircuit: (failureCount) =>
          failureCount >=
          (processedConfig.enterprise?.circuitBreaker?.faultTolerance
            ?.failureThreshold || 4),
        getRecoveryTimeout: () =>
          processedConfig.enterprise?.circuitBreaker?.faultTolerance
            ?.recoveryTimeout || 30000,
      },

      // Accessibility helpers
      accessibility: {
        shouldTrapFocus: () =>
          processedConfig.accessibility?.focus?.trapFocus !== false,
        shouldRespectReducedMotion: () =>
          processedConfig.accessibility?.reducedMotion
            ?.respectUserPreference !== false,
        shouldAnnounceActions: () =>
          processedConfig.accessibility?.screenReader?.announceModalOpen !==
          false,
      },

      // CSS class helpers
      cssClasses: {
        modal:
          processedConfig.modal?.structure?.container?.className ||
          "scenario-modal",
        backdrop:
          processedConfig.modal?.structure?.backdrop?.className ||
          "scenario-modal-backdrop",
        optionCard:
          processedConfig.options?.rendering?.cardClassName || "option-card",
        radarChart:
          processedConfig.radarChart?.initialization?.containerSelector ||
          "#scenario-radar-chart",
      },
    };

    // Add performance optimization flags
    processedConfig.computed.optimizations = {
      shouldLazyLoadRadarChart:
        processedConfig.performance?.optimization?.lazyLoadRadarChart !== false,
      shouldBatchTelemetry:
        processedConfig.enterprise?.telemetry?.batching?.batchSize > 0,
      shouldTrackPerformance:
        processedConfig.enterprise?.performance?.optimization
          ?.enablePerformanceTracking !== false,
      shouldUseCircuitBreaker:
        processedConfig.enterprise?.circuitBreaker?.behavior
          ?.enableCircuitBreaker !== false,
    };

    return processedConfig;
  } catch (error) {
    logger.error("Error processing ScenarioModal configuration:", error);
    throw error;
  }
}

/**
 * Get fallback configuration when loading fails
 * @returns {Object} Fallback configuration object
 */
function getScenarioModalFallbackConfig() {
  return {
    animations: {
      durations: {
        modalAnimation: 300,
        modalEnterTransition: 400,
        modalExitTransition: 300,
        domSettleDelay: 250,
      },
    },
    radarChart: {
      scoring: {
        maxScore: 5,
        neutralScore: 3,
      },
      initialization: {
        maxInitAttempts: 15,
        initRetryDelay: 200,
        domSettleDelay: 250,
      },
    },
    enterprise: {
      performance: {
        thresholds: {
          maxModalOpenTime: 3000,
          maxRadarInitTime: 2000,
          warningModalOpenTime: 1500,
          warningRadarInitTime: 1000,
        },
      },
      health: {
        monitoring: {
          checkInterval: 20000,
          failureThreshold: 3,
        },
      },
      circuitBreaker: {
        faultTolerance: {
          failureThreshold: 4,
          recoveryTimeout: 30000,
          successThreshold: 2,
        },
      },
      telemetry: {
        batching: {
          batchSize: 8,
          flushInterval: 12000,
        },
      },
      errorRecovery: {
        retry: {
          maxRetryAttempts: 3,
          retryDelay: 800,
          backoffMultiplier: 1.5,
        },
      },
    },
    modal: {
      structure: {
        backdrop: { className: "scenario-modal-backdrop" },
        container: { className: "scenario-modal" },
      },
    },
    typewriter: {
      effects: {
        characterSpeed: 50,
        startDelay: 300,
      },
    },
    computed: {
      animations: {
        modalEnterDuration: 400,
        modalExitDuration: 300,
        typewriterSpeed: 50,
        radarAnimationDuration: 800,
      },
      performance: {
        isSlowModalOpen: (duration) => duration > 1500,
        isCriticalModalOpen: (duration) => duration > 3000,
        isSlowRadarInit: (duration) => duration > 1000,
        isCriticalRadarInit: (duration) => duration > 2000,
      },
      health: {
        shouldPerformHealthCheck: () => true,
        getCheckInterval: () => 20000,
        isUnhealthy: (errorCount) => errorCount >= 3,
      },
      circuitBreaker: {
        isEnabled: () => true,
        shouldOpenCircuit: (failureCount) => failureCount >= 4,
        getRecoveryTimeout: () => 30000,
      },
      accessibility: {
        shouldTrapFocus: () => true,
        shouldRespectReducedMotion: () => true,
        shouldAnnounceActions: () => true,
      },
      cssClasses: {
        modal: "scenario-modal",
        backdrop: "scenario-modal-backdrop",
        optionCard: "option-card",
        radarChart: "#scenario-radar-chart",
      },
      optimizations: {
        shouldLazyLoadRadarChart: true,
        shouldBatchTelemetry: true,
        shouldTrackPerformance: true,
        shouldUseCircuitBreaker: true,
      },
    },
  };
}

/**
 * Apply fallback values to configuration
 * @param {Object} config - Configuration object
 * @returns {Object} Configuration with fallbacks applied
 */
export function applyScenarioModalFallbacks(config) {
  if (!config) return getScenarioModalFallbackConfig();

  const fallback = getScenarioModalFallbackConfig();

  // Deep merge with fallback values
  return {
    ...fallback,
    ...config,
    animations: { ...fallback.animations, ...config.animations },
    radarChart: { ...fallback.radarChart, ...config.radarChart },
    enterprise: { ...fallback.enterprise, ...config.enterprise },
    modal: { ...fallback.modal, ...config.modal },
    typewriter: { ...fallback.typewriter, ...config.typewriter },
    computed: config.computed || fallback.computed,
  };
}

/**
 * Validate scenario modal configuration
 * @param {Object} config - Configuration object to validate
 * @returns {boolean} True if valid, false otherwise
 */
export function validateScenarioModalConfig(config) {
  try {
    if (!config || typeof config !== "object") return false;

    // Check required sections
    const requiredSections = [
      "animations",
      "radarChart",
      "enterprise",
      "modal",
    ];
    for (const section of requiredSections) {
      if (!config[section] || typeof config[section] !== "object") {
        logger.warn(
          `ScenarioModal configuration missing required section: ${section}`,
        );
        return false;
      }
    }

    // Validate critical values
    const animations = config.animations?.durations;
    if (animations) {
      if (
        typeof animations.modalEnterTransition !== "number" ||
        animations.modalEnterTransition < 0
      ) {
        logger.warn("Invalid modalEnterTransition duration");
        return false;
      }
    }

    const enterprise = config.enterprise?.performance?.thresholds;
    if (enterprise) {
      if (
        typeof enterprise.maxModalOpenTime !== "number" ||
        enterprise.maxModalOpenTime <= 0
      ) {
        logger.warn("Invalid maxModalOpenTime threshold");
        return false;
      }
    }

    return true;
  } catch (error) {
    logger.error("Error validating ScenarioModal configuration:", error);
    return false;
  }
}

/**
 * Clear configuration cache
 */
export function clearScenarioModalConfigCache() {
  configCache = null;
  lastLoadTime = null;
  logger.debug("ScenarioModal configuration cache cleared");
}

/**
 * Get cached configuration without loading
 * @returns {Object|null} Cached configuration or null if not cached
 */
export function getCachedScenarioModalConfig() {
  if (
    configCache &&
    lastLoadTime &&
    Date.now() - lastLoadTime < CACHE_DURATION
  ) {
    return configCache;
  }
  return null;
}

// Export the main loader function as default
export default loadScenarioModalConfig;
