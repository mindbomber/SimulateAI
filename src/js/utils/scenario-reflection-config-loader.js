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
 * Scenario Reflection Modal Configuration Loader
 * Handles loading and processing of scenario reflection modal configuration from JSON SSOT
 */

/**
 * Configuration cache for performance optimization
 */
let configCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load scenario reflection modal configuration from JSON file
 * @returns {Promise<Object>} Configuration object
 */
async function loadScenarioReflectionConfigFromFile() {
  try {
    const response = await fetch(
      "/src/config/scenario-reflection-modal-config.json",
    );
    if (!response.ok) {
      throw new Error(
        `Failed to load scenario reflection modal configuration: ${response.status}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error(
      "Error loading scenario reflection modal configuration file:",
      error,
    );
    throw error;
  }
}

/**
 * Load and process scenario reflection modal configuration
 * @returns {Promise<Object>} Processed configuration object
 */
async function loadScenarioReflectionConfig() {
  const now = Date.now();

  // Check if we have cached config and it's still valid
  if (configCache && lastLoadTime && now - lastLoadTime < CACHE_DURATION) {
    return configCache;
  }

  try {
    console.log(
      "🔄 Loading scenario reflection modal configuration from file...",
    );
    const config = await loadScenarioReflectionConfigFromFile();

    // Process and validate configuration
    const processedConfig = processScenarioReflectionConfig(config);

    // Cache the processed configuration
    configCache = processedConfig;
    lastLoadTime = now;

    console.log(
      "✅ Scenario reflection modal configuration loaded successfully",
    );
    return processedConfig;
  } catch (error) {
    console.error(
      "❌ Failed to load scenario reflection modal configuration:",
      error,
    );

    // Return fallback configuration
    return getFallbackConfig();
  }
}

/**
 * Process and validate scenario reflection configuration
 * @param {Object} config - Raw configuration object
 * @returns {Object} Processed configuration
 */
function processScenarioReflectionConfig(config) {
  const reflectionConfig = config.scenarioReflectionModal || {};

  return {
    // Animation settings
    animations: {
      durations: {
        modalAnimation:
          reflectionConfig.animations?.durations?.modalAnimation || 300,
        modalEnterTransition:
          reflectionConfig.animations?.durations?.modalEnterTransition || 400,
        modalExitTransition:
          reflectionConfig.animations?.durations?.modalExitTransition || 300,
        stepTransition:
          reflectionConfig.animations?.durations?.stepTransition || 250,
        dataLoadDelay:
          reflectionConfig.animations?.durations?.dataLoadDelay || 150,
        progressAnimation:
          reflectionConfig.animations?.durations?.progressAnimation || 500,
        domSettleDelay:
          reflectionConfig.animations?.durations?.domSettleDelay || 200,
      },
      easings: {
        modalEntrance:
          reflectionConfig.animations?.easings?.modalEntrance ||
          "cubic-bezier(0.25, 0.8, 0.25, 1)",
        modalExit:
          reflectionConfig.animations?.easings?.modalExit ||
          "cubic-bezier(0.4, 0, 0.6, 1)",
        stepTransition:
          reflectionConfig.animations?.easings?.stepTransition || "ease-out",
        progressBar:
          reflectionConfig.animations?.easings?.progressBar ||
          "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },

    // Step configuration
    steps: {
      totalSteps: reflectionConfig.steps?.configuration?.totalSteps || 4,
      allowSkip: reflectionConfig.steps?.configuration?.allowSkip !== false,
      requireCompletion:
        reflectionConfig.steps?.configuration?.requireCompletion || false,
      enableProgress:
        reflectionConfig.steps?.configuration?.enableProgress !== false,
      content: reflectionConfig.steps?.content || {},
    },

    // Community features
    community: {
      statistics: {
        enableRealTime:
          reflectionConfig.community?.statistics?.enableRealTime || false,
        showPercentages:
          reflectionConfig.community?.statistics?.showPercentages !== false,
        includeComparisons:
          reflectionConfig.community?.statistics?.includeComparisons !== false,
        anonymizeData:
          reflectionConfig.community?.statistics?.anonymizeData !== false,
      },
      insights: {
        generateDynamic:
          reflectionConfig.community?.insights?.generateDynamic !== false,
        includeContext:
          reflectionConfig.community?.insights?.includeContext !== false,
        showTrends: reflectionConfig.community?.insights?.showTrends || false,
      },
    },

    // Research data collection
    research: {
      dataCollection: {
        enableTracking:
          reflectionConfig.research?.dataCollection?.enableTracking !== false,
        anonymousMode:
          reflectionConfig.research?.dataCollection?.anonymousMode !== false,
        includeTimestamps:
          reflectionConfig.research?.dataCollection?.includeTimestamps !==
          false,
        trackProgression:
          reflectionConfig.research?.dataCollection?.trackProgression !== false,
      },
      analytics: {
        trackStepCompletion:
          reflectionConfig.research?.analytics?.trackStepCompletion !== false,
        measureEngagement:
          reflectionConfig.research?.analytics?.measureEngagement !== false,
        recordReflectionTime:
          reflectionConfig.research?.analytics?.recordReflectionTime !== false,
      },
    },

    // Accessibility features
    accessibility: {
      features: {
        keyboardNavigation:
          reflectionConfig.accessibility?.features?.keyboardNavigation !==
          false,
        screenReaderSupport:
          reflectionConfig.accessibility?.features?.screenReaderSupport !==
          false,
        focusManagement:
          reflectionConfig.accessibility?.features?.focusManagement !== false,
        reducedMotion:
          reflectionConfig.accessibility?.features?.reducedMotion !== false,
      },
      aria: {
        labelSteps: reflectionConfig.accessibility?.aria?.labelSteps !== false,
        announceProgress:
          reflectionConfig.accessibility?.aria?.announceProgress !== false,
        describeTabs:
          reflectionConfig.accessibility?.aria?.describeTabs !== false,
      },
    },

    // Theme configuration
    theming: {
      darkMode: {
        enabled: reflectionConfig.theming?.darkMode?.enabled !== false,
        autoDetect: reflectionConfig.theming?.darkMode?.autoDetect !== false,
        inheritFromApp:
          reflectionConfig.theming?.darkMode?.inheritFromApp !== false,
      },
      responsive: {
        breakpoints: {
          mobile:
            reflectionConfig.theming?.responsive?.breakpoints?.mobile ||
            "768px",
          tablet:
            reflectionConfig.theming?.responsive?.breakpoints?.tablet ||
            "1024px",
          desktop:
            reflectionConfig.theming?.responsive?.breakpoints?.desktop ||
            "1200px",
        },
        adaptiveLayout:
          reflectionConfig.theming?.responsive?.adaptiveLayout !== false,
      },
    },

    // Performance settings
    performance: {
      optimization: {
        lazyLoadContent:
          reflectionConfig.performance?.optimization?.lazyLoadContent !== false,
        cacheResults:
          reflectionConfig.performance?.optimization?.cacheResults !== false,
        deferAnalytics:
          reflectionConfig.performance?.optimization?.deferAnalytics !== false,
      },
      thresholds: {
        maxLoadTime:
          reflectionConfig.performance?.thresholds?.maxLoadTime || 2000,
        maxStepTransition:
          reflectionConfig.performance?.thresholds?.maxStepTransition || 500,
        warningLoadTime:
          reflectionConfig.performance?.thresholds?.warningLoadTime || 1000,
      },
    },

    // Integration settings
    integration: {
      badgeSystem: {
        enabled: reflectionConfig.integration?.badgeSystem?.enabled !== false,
        eventName:
          reflectionConfig.integration?.badgeSystem?.eventName ||
          "scenarioReflectionCompleted",
        deferredDisplay:
          reflectionConfig.integration?.badgeSystem?.deferredDisplay !== false,
        includeMetadata:
          reflectionConfig.integration?.badgeSystem?.includeMetadata !== false,
      },
      analytics: {
        trackCompletion:
          reflectionConfig.integration?.analytics?.trackCompletion !== false,
        recordChoiceData:
          reflectionConfig.integration?.analytics?.recordChoiceData !== false,
        measureReflectionQuality:
          reflectionConfig.integration?.analytics?.measureReflectionQuality ||
          false,
      },
    },
  };
}

/**
 * Get fallback configuration if loading fails
 * @returns {Object} Fallback configuration
 */
function getFallbackConfig() {
  console.log("⚠️ Using fallback scenario reflection modal configuration");

  return {
    animations: {
      durations: {
        modalAnimation: 300,
        modalEnterTransition: 400,
        modalExitTransition: 300,
        stepTransition: 250,
        dataLoadDelay: 150,
        progressAnimation: 500,
        domSettleDelay: 200,
      },
      easings: {
        modalEntrance: "cubic-bezier(0.25, 0.8, 0.25, 1)",
        modalExit: "cubic-bezier(0.4, 0, 0.6, 1)",
        stepTransition: "ease-out",
        progressBar: "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      },
    },
    steps: {
      totalSteps: 4,
      allowSkip: true,
      requireCompletion: false,
      enableProgress: true,
      content: {},
    },
    community: {
      statistics: {
        enableRealTime: false,
        showPercentages: true,
        includeComparisons: true,
        anonymizeData: true,
      },
      insights: {
        generateDynamic: true,
        includeContext: true,
        showTrends: false,
      },
    },
    research: {
      dataCollection: {
        enableTracking: true,
        anonymousMode: true,
        includeTimestamps: true,
        trackProgression: true,
      },
      analytics: {
        trackStepCompletion: true,
        measureEngagement: true,
        recordReflectionTime: true,
      },
    },
    accessibility: {
      features: {
        keyboardNavigation: true,
        screenReaderSupport: true,
        focusManagement: true,
        reducedMotion: true,
      },
      aria: {
        labelSteps: true,
        announceProgress: true,
        describeTabs: true,
      },
    },
    theming: {
      darkMode: {
        enabled: true,
        autoDetect: true,
        inheritFromApp: true,
      },
      responsive: {
        breakpoints: {
          mobile: "768px",
          tablet: "1024px",
          desktop: "1200px",
        },
        adaptiveLayout: true,
      },
    },
    performance: {
      optimization: {
        lazyLoadContent: true,
        cacheResults: true,
        deferAnalytics: true,
      },
      thresholds: {
        maxLoadTime: 2000,
        maxStepTransition: 500,
        warningLoadTime: 1000,
      },
    },
    integration: {
      badgeSystem: {
        enabled: true,
        eventName: "scenarioReflectionCompleted",
        deferredDisplay: true,
        includeMetadata: true,
      },
      analytics: {
        trackCompletion: true,
        recordChoiceData: true,
        measureReflectionQuality: false,
      },
    },
  };
}

/**
 * Clear configuration cache (useful for testing or forced reload)
 */
function clearConfigCache() {
  configCache = null;
  lastLoadTime = null;
}

/**
 * Get specific configuration section
 * @param {string} section - Configuration section name
 * @returns {Promise<Object>} Configuration section
 */
async function getConfigSection(section) {
  const config = await loadScenarioReflectionConfig();
  return config[section] || {};
}

export { loadScenarioReflectionConfig, clearConfigCache, getConfigSection };
