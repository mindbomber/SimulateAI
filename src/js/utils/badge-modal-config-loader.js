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
 * Badge Modal Configuration Loader
 * Handles loading and processing of badge modal configuration from JSON SSOT
 */

/**
 * Configuration cache for performance optimization
 */
let configCache = null;
let lastLoadTime = null;
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

/**
 * Load badge modal configuration from JSON file
 * @returns {Promise<Object>} Configuration object
 */
async function loadBadgeModalConfigFromFile() {
  try {
    const response = await fetch("/src/config/badge-modal-config.json");
    if (!response.ok) {
      throw new Error(
        `Failed to load badge modal configuration: ${response.status}`,
      );
    }
    return await response.json();
  } catch (error) {
    console.error("Error loading badge modal configuration file:", error);
    throw error;
  }
}

/**
 * Load and process badge modal configuration
 * @returns {Promise<Object>} Processed configuration object
 */
export async function loadBadgeModalConfig() {
  // Check cache validity
  const now = Date.now();
  if (configCache && lastLoadTime && now - lastLoadTime < CACHE_DURATION) {
    return configCache;
  }

  try {
    const rawConfig = await loadBadgeModalConfigFromFile();
    const processedConfig = processBadgeModalConfig(rawConfig);

    // Cache the processed configuration
    configCache = processedConfig;
    lastLoadTime = now;

    return processedConfig;
  } catch (error) {
    console.error("Error loading badge modal configuration:", error);

    // Return fallback configuration
    return getFallbackBadgeModalConfig();
  }
}

/**
 * Process and enhance the raw configuration
 * @param {Object} rawConfig - Raw configuration from JSON
 * @returns {Object} Enhanced configuration with computed properties
 */
function processBadgeModalConfig(rawConfig) {
  const config = rawConfig.badgeModal;

  // Add computed properties for easier access
  config.computed = {
    // Duration resolver - converts string references to actual values
    resolveDuration: (durationKey) => {
      if (typeof durationKey === "number") return durationKey;
      return config.animations.durations[durationKey] || 0;
    },

    // CSS class generators
    cssClasses: {
      backdrop: config.structure.modal.backdrop.className,
      modal: config.structure.modal.container.className,
      content: config.structure.modal.content.className,
      visualContainer: config.structure.visual.container.className,
      shield: config.structure.visual.shield.className,
      shieldEmoji: config.structure.visual.shield.emojiClassName,
      categoryEmoji: config.structure.visual.categoryEmoji.className,
      sidekickEmoji: config.structure.visual.sidekickEmoji.className,
      textContent: config.structure.text.container.className,
      title: config.structure.text.title.className,
      quote: config.structure.text.quote.className,
      details: config.structure.text.details.container.className,
      reason: config.structure.text.details.reason.className,
      timestamp: config.structure.text.details.timestamp.className,
      footer: config.structure.footer.container.className,
      closeBtn: config.structure.footer.closeButton.className,
      particles: config.structure.containers.particles.className,
      bubbles: config.structure.containers.bubbles.className,
      floatingParticle: config.effects.particles.className,
      bubblingEmojiCategory: config.effects.bubbles.category.className,
      bubblingEmojiSidekick: config.effects.bubbles.sidekick.className,
    },

    // Template processors
    textTemplates: {
      reasonText: (tierText, categoryName) => {
        return config.templates.reasonText
          .replace("{tierText}", tierText)
          .replace("{categoryName}", categoryName);
      },
      buttonText: (returnContext) => {
        return (
          config.templates.buttonText[returnContext] ||
          config.templates.buttonText.main
        );
      },
    },

    // Animation configurations
    animations: {
      modalEntrance: {
        duration: config.animations.durations.modalEnter,
        easing: config.animations.easings.modalEntrance,
        delay: config.animations.durations.entranceDelay,
      },
      modalExit: {
        duration: config.animations.durations.modalExit,
        easing: config.animations.easings.modalExit,
      },
      shield: {
        duration: config.animations.durations.badgeScale,
        easing: config.animations.easings.modalEntrance,
        delay: config.animations.durations.shieldDelay,
      },
      sidekick: {
        duration: config.animations.durations.sidekickEntrance,
        easing: config.animations.easings.modalEntrance,
        delay: config.animations.durations.sidekickDelay,
      },
      text: {
        duration: 400,
        easing: config.animations.easings.textElements,
        startDelay: config.animations.durations.textStartDelay,
        staggerDelay: config.animations.durations.textStaggerDelay,
      },
      typewriter: {
        startDelay: config.animations.durations.typewriterStartDelay,
        charSpeed: config.typography.typewriter.charSpeed,
        cursorDelay: config.typography.typewriter.cursorDelay,
      },
    },

    // Confetti wave configurations
    confettiWaves: config.effects.confetti.waves.map((wave) => ({
      ...wave,
      delay:
        typeof wave.delay === "string"
          ? config.animations.durations[wave.delay]
          : wave.delay,
    })),

    // Tier effect configurations
    tierEffects: Object.entries(config.effects.confetti.tierEffects).reduce(
      (acc, [key, effect]) => {
        acc[key] = {
          ...effect,
          delay:
            typeof effect.delay === "string"
              ? config.animations.durations[effect.delay]
              : effect.delay,
        };
        return acc;
      },
      {},
    ),

    // Accessibility helpers
    accessibility: {
      isReducedMotion: () =>
        window.matchMedia("(prefers-reduced-motion: reduce)").matches,
      announceToScreenReader: (message) => {
        const announcement = document.createElement("div");
        announcement.setAttribute("aria-live", "polite");
        announcement.setAttribute("aria-atomic", "true");
        announcement.className = "sr-only";
        announcement.textContent = message;
        document.body.appendChild(announcement);
        setTimeout(() => document.body.removeChild(announcement), 1000);
      },
    },

    // Performance helpers
    performance: {
      shouldReduceEffects: () => {
        // Check for low-end device indicators
        const connection =
          navigator.connection ||
          navigator.mozConnection ||
          navigator.webkitConnection;
        const isSlowConnection =
          connection &&
          (connection.effectiveType === "slow-2g" ||
            connection.effectiveType === "2g");
        const isLowMemory =
          navigator.deviceMemory && navigator.deviceMemory < 4;
        return (
          isSlowConnection ||
          isLowMemory ||
          config.computed.accessibility.isReducedMotion()
        );
      },
      getOptimizedCounts: () => {
        const shouldReduce = config.computed.performance.shouldReduceEffects();
        if (shouldReduce) {
          return {
            particles: config.performance.thresholds.lowEnd.particleCount,
            bubbles: config.performance.thresholds.lowEnd.bubbleCount,
            confettiMultiplier:
              config.performance.thresholds.lowEnd.confettiMultiplier,
          };
        }
        return {
          particles: config.effects.particles.count,
          bubbles:
            config.effects.bubbles.category.count +
            config.effects.bubbles.sidekick.count,
          confettiMultiplier: 1,
        };
      },
    },
  };

  return config;
}

/**
 * Get fallback configuration when main config fails to load
 * @returns {Object} Minimal fallback configuration
 */
function getFallbackBadgeModalConfig() {
  console.warn("Using fallback badge modal configuration");

  return {
    animations: {
      durations: {
        modalEnter: 600,
        modalExit: 400,
        confettiSecondDelay: 500,
        confettiThirdDelay: 1000,
        entranceDelay: 100,
        shieldDelay: 200,
        sidekickDelay: 400,
        textStartDelay: 400,
        textStaggerDelay: 100,
        typewriterStartDelay: 1000,
      },
    },
    effects: {
      confetti: {
        waves: [
          { emojiSize: 60, baseCount: 8, delay: 0 },
          { emojiSize: 40, baseCount: 10, delay: 10 },
          { emojiSize: 25, baseCount: 6, delay: 500 },
        ],
        tierEffects: {
          large: { threshold: 3, count: 12, emojiSize: 70 },
          epic: { threshold: 6, count: 15, emojiSize: 80 },
          legendary: {
            threshold: 9,
            count: 20,
            emojiSize: 90,
            extraEmojis: ["✨", "🌟"],
          },
        },
      },
      particles: { count: 8, minSize: 2, sizeRange: 3 },
      bubbles: {
        category: { count: 4 },
        sidekick: { count: 3 },
      },
    },
    structure: {
      visual: {
        shield: { emoji: "🛡️" },
      },
    },
    templates: {
      reasonText:
        "You've earned this badge for completing {tierText} in the {categoryName} category.",
      buttonText: { main: "Back to Scenarios", category: "Back to Category" },
    },
    tiers: {
      descriptions: {
        1: "your first scenario",
        2: "three scenarios",
        3: "all six scenarios",
      },
    },
    fallbacks: {
      defaults: {
        glowClass: "badge-glow-low",
        tierText: "scenarios",
        categoryName: "Unknown Category",
      },
    },
    computed: {
      resolveDuration: (key) => parseInt(key) || 500,
      cssClasses: {
        backdrop: "badge-modal-backdrop",
        modal: "badge-modal",
        shield: "badge-shield",
      },
      textTemplates: {
        reasonText: (tierText, categoryName) =>
          `You've earned this badge for completing ${tierText} in the ${categoryName} category.`,
        buttonText: (context) =>
          context === "category" ? "Back to Category" : "Back to Scenarios",
      },
      confettiWaves: [
        { emojiSize: 60, baseCount: 8, delay: 0 },
        { emojiSize: 40, baseCount: 10, delay: 10 },
        { emojiSize: 25, baseCount: 6, delay: 500 },
      ],
      tierEffects: {
        large: { threshold: 3, count: 12, emojiSize: 70 },
        epic: { threshold: 6, count: 15, emojiSize: 80 },
        legendary: {
          threshold: 9,
          count: 20,
          emojiSize: 90,
          extraEmojis: ["✨", "🌟"],
        },
      },
      performance: {
        shouldReduceEffects: () => false,
        getOptimizedCounts: () => ({
          particles: 8,
          bubbles: 7,
          confettiMultiplier: 1,
        }),
      },
      accessibility: {
        isReducedMotion: () => false,
        announceToScreenReader: () => {},
      },
    },
  };
}

/**
 * Apply fallback values for missing badge modal data
 * @param {Object} badgeConfig - Badge configuration (may be incomplete)
 * @param {Object} config - Badge modal configuration (optional)
 * @returns {Object} Object with sanitized badge configuration
 */
export function applyBadgeModalFallbacks(badgeConfig, config = null) {
  const fallbacks = config?.fallbacks?.defaults || {
    glowClass: "badge-glow-low",
    tierText: "scenarios",
    categoryName: "Unknown Category",
  };

  return {
    title: badgeConfig.title || "Achievement Unlocked",
    quote: badgeConfig.quote || "Congratulations on your progress!",
    categoryEmoji: badgeConfig.categoryEmoji || "🎯",
    sidekickEmoji: badgeConfig.sidekickEmoji || "⭐",
    tier: badgeConfig.tier || 1,
    glowIntensity: badgeConfig.glowIntensity || "low",
    timestamp: badgeConfig.timestamp || Date.now(),
    categoryName: badgeConfig.categoryName || fallbacks.categoryName,
    ...badgeConfig,
  };
}

/**
 * Validate badge modal configuration
 * @param {Object} badgeConfig - Badge configuration to validate
 * @param {Object} config - Badge modal configuration (optional)
 * @returns {Object} Validation result with isValid boolean and errors array
 */
export function validateBadgeModalConfig(badgeConfig, config = null) {
  const errors = [];

  // Required fields
  const requiredFields = ["title", "categoryEmoji", "sidekickEmoji"];
  for (const field of requiredFields) {
    if (!badgeConfig || !badgeConfig[field]) {
      errors.push(`Missing required badge field: ${field}`);
    }
  }

  // Type validations
  if (
    badgeConfig.tier &&
    (!Number.isInteger(badgeConfig.tier) || badgeConfig.tier < 1)
  ) {
    errors.push("Badge tier must be a positive integer");
  }

  if (badgeConfig.timestamp && isNaN(new Date(badgeConfig.timestamp))) {
    errors.push("Badge timestamp must be a valid date");
  }

  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Clear the configuration cache (useful for testing or forcing reload)
 */
export function clearBadgeModalConfigCache() {
  configCache = null;
  lastLoadTime = null;
}

// Export the main loader function as default
export default loadBadgeModalConfig;
