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
 * Scenario Card Configuration Loader
 * Handles loading and processing of scenario card configuration from JSON SSOT
 */

/**
 * Configuration cache for performance optimization
 */
let configCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load scenario card configuration from JSON file
 * @returns {Promise<Object>} Configuration object
 */
async function loadScenarioCardConfigFromFile() {
  try {
    const response = await fetch("/src/config/scenario-card-config.json");
    if (!response.ok) {
      throw new Error(`Failed to load configuration: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading scenario card configuration file:", error);
    throw error;
  }
}

/**
 * Load and process scenario card configuration
 * @returns {Promise<Object>} Processed configuration object
 */
export async function loadScenarioCardConfig() {
  const now = Date.now();

  // Return cached config if still valid
  if (configCache && lastLoadTime && now - lastLoadTime < CACHE_DURATION) {
    return configCache;
  }

  try {
    // Load configuration from file
    const scenarioCardConfig = await loadScenarioCardConfigFromFile();

    // Process configuration with computed values
    const config = {
      ...scenarioCardConfig,
      computed: {
        // Pre-compute SVG templates for performance
        svgTemplates: {
          learningLabIcon: createSVGTemplate(
            scenarioCardConfig.card.buttons.learningLab.icon.svg,
          ),
          quickStartIcon: createSVGTemplate(
            scenarioCardConfig.card.buttons.quickStart.icon.svg,
          ),
        },

        // Pre-process CSS class combinations
        cssClasses: {
          base: scenarioCardConfig.card.structure.container.baseClass,
          completed: `${scenarioCardConfig.card.structure.container.baseClass} ${scenarioCardConfig.card.structure.container.completedModifier}`,
          header: scenarioCardConfig.card.structure.header.class,
          content: scenarioCardConfig.card.structure.content.class,
          footer: scenarioCardConfig.card.structure.footer.class,
          icon: scenarioCardConfig.card.structure.header.icon.class,
          difficulty: scenarioCardConfig.card.structure.header.difficulty.class,
          title: scenarioCardConfig.card.structure.content.title.class,
          description:
            scenarioCardConfig.card.structure.content.description.class,
          completedBadge:
            scenarioCardConfig.card.structure.completedBadge.class,
          learningLabBtn: scenarioCardConfig.card.buttons.learningLab.class,
          quickStartBtn: scenarioCardConfig.card.buttons.quickStart.class,
        },

        // Pre-process style values
        styles: {
          iconBackground: (color) =>
            `background-color: ${color}${scenarioCardConfig.card.structure.header.icon.styles.backgroundOpacity}`,
          iconColor: (color) => `color: ${color}`,
          difficultyClass: (difficulty) =>
            `${scenarioCardConfig.card.structure.header.difficulty.prefixClass}${difficulty}`,
        },

        // Pre-process text templates
        textTemplates: {
          ariaLabel: (scenario) =>
            scenarioCardConfig.card.accessibility.ariaLabelTemplate
              .replace("{title}", scenario.title)
              .replace("{difficulty}", scenario.difficulty),

          learningLabAriaLabel: (title) =>
            scenarioCardConfig.card.buttons.learningLab.ariaLabelTemplate.replace(
              "{title}",
              title,
            ),

          quickStartAriaLabel: (title, isCompleted) => {
            const action = isCompleted
              ? scenarioCardConfig.card.buttons.quickStart.text.completed
              : scenarioCardConfig.card.buttons.quickStart.text.default;
            return scenarioCardConfig.card.buttons.quickStart.ariaLabelTemplate
              .replace("{action}", action)
              .replace("{title}", title);
          },
        },
      },
    };

    // Cache the processed config
    configCache = config;
    lastLoadTime = now;

    return config;
  } catch (error) {
    console.error("Error loading scenario card configuration:", error);
    return getDefaultConfig();
  }
}

/**
 * Create SVG template string from configuration
 * @param {Object} svgConfig - SVG configuration object
 * @returns {string} SVG HTML string
 */
function createSVGTemplate(svgConfig) {
  const { width, height, viewBox, fill, path } = svgConfig;
  return `<svg width="${width}" height="${height}" viewBox="${viewBox}" fill="${fill}">
    <path d="${path.d}" stroke="${path.stroke}" stroke-width="${path.strokeWidth}" stroke-linecap="${path.strokeLinecap}" stroke-linejoin="${path.strokeLinejoin}"/>
  </svg>`;
}

/**
 * Get default fallback configuration
 * @returns {Object} Default configuration object
 */
function getDefaultConfig() {
  return {
    card: {
      structure: {
        container: {
          element: "article",
          baseClass: "scenario-card",
          completedModifier: "completed",
        },
      },
      buttons: {
        learningLab: {
          class: "scenario-start-btn",
          text: "Learning Lab",
        },
        quickStart: {
          class: "scenario-quick-start-btn",
          text: { default: "Start", completed: "Replay" },
        },
      },
      fallbacks: {
        category: {
          color: "#667eea",
          icon: "🤖",
          id: "default",
        },
      },
    },
    computed: {
      cssClasses: {
        base: "scenario-card",
        completed: "scenario-card completed",
        header: "scenario-header",
        content: "scenario-content",
        footer: "scenario-footer",
      },
      styles: {
        iconBackground: (color) => `background-color: ${color}15`,
        iconColor: (color) => `color: ${color}`,
        difficultyClass: (difficulty) => `difficulty-${difficulty}`,
      },
    },
  };
}

/**
 * Get configuration for a specific theme
 * @param {string} theme - Theme name (dark, highContrast, etc.)
 * @returns {Object} Theme-specific configuration
 */
export function getScenarioCardThemeConfig(theme = "default") {
  const config = loadScenarioCardConfig();

  if (theme === "default") {
    return config;
  }

  const themeOverrides = config.themes?.[theme] || {};

  return {
    ...config,
    styles: {
      ...config.styles,
      ...themeOverrides,
    },
  };
}

/**
 * Get responsive configuration for specific breakpoint
 * @param {string} breakpoint - Breakpoint name (mobile, tablet, desktop)
 * @returns {Object} Responsive configuration
 */
export function getScenarioCardResponsiveConfig(breakpoint = "desktop") {
  const config = loadScenarioCardConfig();
  const responsiveConfig = config.responsive?.[breakpoint] || {};

  return {
    ...config,
    styles: {
      ...config.styles,
      ...responsiveConfig.modifications,
    },
  };
}

/**
 * Validate scenario and category data against configuration requirements
 * @param {Object} scenario - Scenario data to validate
 * @param {Object} category - Category data to validate
 * @param {Object} config - Configuration object (optional, will use minimal validation if not provided)
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateScenarioCardData(scenario, category, config = null) {
  const errors = [];

  // If no config provided, use minimal validation
  if (!config) {
    const requiredScenarioFields = ["id", "title", "description", "difficulty"];
    for (const field of requiredScenarioFields) {
      if (!scenario || !scenario[field]) {
        errors.push(`Missing required scenario field: ${field}`);
      }
    }

    const requiredCategoryFields = ["id", "color", "icon"];
    for (const field of requiredCategoryFields) {
      if (!category || !category[field]) {
        errors.push(`Missing required category field: ${field}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  // Validate required scenario fields
  const requiredScenarioFields = config.validation?.required?.scenario || [
    "id",
    "title",
    "description",
    "difficulty",
  ];
  for (const field of requiredScenarioFields) {
    if (!scenario || !scenario[field]) {
      errors.push(`Missing required scenario field: ${field}`);
    }
  }

  // Validate required category fields
  const requiredCategoryFields = config.validation?.required?.category || [
    "id",
    "color",
    "icon",
  ];
  for (const field of requiredCategoryFields) {
    if (!category || !category[field]) {
      errors.push(`Missing required category field: ${field}`);
    }
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Apply fallback values for missing scenario or category data
 * @param {Object} scenario - Scenario data (may be incomplete)
 * @param {Object} category - Category data (may be incomplete)
 * @param {Object} config - Configuration object (optional, will load if not provided)
 * @returns {Object} Object with sanitized scenario and category data
 */
export function applyScenarioCardFallbacks(scenario, category, config = null) {
  // If no config provided, we need a fallback since this should be sync
  if (!config) {
    console.warn(
      "applyScenarioCardFallbacks called without config, using minimal fallbacks",
    );
    const minimalFallbacks = {
      category: { color: "#667eea", icon: "🤖", id: "default" },
      missingData: {
        title: "Untitled Scenario",
        description: "No description available",
        difficulty: "medium",
      },
    };

    const safeScenario = {
      id: "unknown",
      title: minimalFallbacks.missingData.title,
      description: minimalFallbacks.missingData.description,
      difficulty: minimalFallbacks.missingData.difficulty,
      ...scenario,
    };

    const safeCategory = {
      color: minimalFallbacks.category.color,
      icon: minimalFallbacks.category.icon,
      id: minimalFallbacks.category.id,
      ...category,
    };

    return { safeScenario, safeCategory };
  }

  const fallbacks = config.card.fallbacks;

  const safeScenario = {
    id: "unknown",
    title: fallbacks.missingData?.title || "Untitled Scenario",
    description:
      fallbacks.missingData?.description || "No description available",
    difficulty: fallbacks.missingData?.difficulty || "medium",
    ...scenario,
  };

  const safeCategory = {
    color: fallbacks.category.color,
    icon: fallbacks.category.icon,
    id: fallbacks.category.id,
    ...category,
  };

  return { safeScenario, safeCategory };
}

/**
 * Clear configuration cache (useful for development/testing)
 */
export function clearScenarioCardConfigCache() {
  configCache = null;
  lastLoadTime = null;
}

// Export the main loader function as default
export default loadScenarioCardConfig;
