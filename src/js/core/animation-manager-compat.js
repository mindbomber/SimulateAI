/**
 * Animation Manager Compatibility Layer - Phase 3 Component Integration
 * Provides backward compatibility for existing animation manager imports
 *
 * This file allows existing code to continue working while migrating to
 * the unified animation system. Provides drop-in replacement functionality.
 *
 * @version 3.0.0 - Compatibility Layer
 * @author SimulateAI Development Team
 */

import UnifiedAnimationManager, {
  UnifiedAnimationTheme,
  UnifiedAnimationPerformanceMonitor,
  UNIFIED_ANIMATION_CONSTANTS,
} from "./unified-animation-manager.js";
import logger from "../utils/logger.js";

// Create global singleton instance for backward compatibility
let globalAnimationManager = null;

/**
 * Get or create the global animation manager instance
 * @returns {UnifiedAnimationManager} Global animation manager
 */
function getGlobalAnimationManager() {
  if (!globalAnimationManager) {
    globalAnimationManager = new UnifiedAnimationManager();
    logger.info(
      "AnimationManagerCompat",
      "Created global unified animation manager instance",
    );
  }
  return globalAnimationManager;
}

/**
 * Core Animation Manager Compatibility
 * Maintains API compatibility with core/animation-manager.js
 */
export class AnimationManager {
  constructor(engine) {
    this.unifiedManager = new UnifiedAnimationManager(engine);
    logger.info(
      "AnimationManagerCompat",
      "Created core animation manager compatibility wrapper",
    );
  }

  // Delegate all methods to unified manager
  init() {
    return this.unifiedManager.init();
  }
  animate(target, properties, duration, options) {
    return this.unifiedManager.animate(target, properties, duration, options);
  }
  to(target, properties, duration, options) {
    return this.unifiedManager.animate(target, properties, duration, options);
  }
  from(target, properties, duration, options) {
    // Reverse the properties for 'from' animation
    const reversedProps = {};
    Object.keys(properties).forEach((key) => {
      reversedProps[key] = target[key] || 0;
      target[key] = properties[key];
    });
    return this.unifiedManager.animate(
      target,
      reversedProps,
      duration,
      options,
    );
  }

  pause(animationId) {
    return this.unifiedManager.stop(animationId);
  }
  resume(animationId) {
    /* Not implemented in unified - legacy compatibility */
  }
  stop(animationId) {
    return this.unifiedManager.stop(animationId);
  }
  stopAll() {
    return this.unifiedManager.stopAll();
  }

  pauseAllAnimations() {
    return this.unifiedManager.pauseAllAnimations();
  }
  resumeAllAnimations() {
    return this.unifiedManager.resumeAllAnimations();
  }

  update(deltaTime) {
    /* Handled automatically by unified manager */
  }

  // Accessibility methods
  announce(message, urgent) {
    return this.unifiedManager.announce(message, urgent);
  }

  // Settings methods
  loadSettings() {
    return this.unifiedManager.loadSettings();
  }
  saveSettings(settings) {
    return this.unifiedManager.saveSettings(settings);
  }

  // Configuration methods
  setReducedMotionMode(enabled) {
    this.unifiedManager.reducedMotionMode = enabled;
    this.unifiedManager.updateAnimationDefaults();
  }

  setAccessibilityAnnouncements(enabled) {
    this.unifiedManager.accessibilityConfig.announceAnimations = enabled;
  }

  // Reports
  getPerformanceReport() {
    return this.unifiedManager.getPerformanceReport();
  }
  getAccessibilityReport() {
    return this.unifiedManager.getAccessibilityReport();
  }

  // Cleanup
  destroy() {
    return this.unifiedManager.destroy();
  }

  // Timeline methods (basic compatibility)
  createTimeline(options = {}) {
    const timelineId = `timeline_${Date.now()}_${Math.random()}`;
    this.unifiedManager.timelines.set(timelineId, {
      id: timelineId,
      animations: [],
      duration: 0,
      startTime: null,
      started: false,
      completed: false,
      paused: false,
      onComplete: options.onComplete || null,
      createdAt: Date.now(),
    });
    return timelineId;
  }

  addToTimeline(
    timelineId,
    target,
    properties,
    duration,
    delay = 0,
    options = {},
  ) {
    const timeline = this.unifiedManager.timelines.get(timelineId);
    if (timeline) {
      timeline.animations.push({
        target,
        properties: this.unifiedManager.processProperties(target, properties),
        duration,
        delay,
        ...options,
        started: false,
        completed: false,
      });
      timeline.duration = Math.max(timeline.duration, delay + duration);
    }
  }

  playTimeline(timelineId) {
    const timeline = this.unifiedManager.timelines.get(timelineId);
    if (timeline) {
      timeline.started = true;
      timeline.startTime = performance.now();
    }
  }

  // Static compatibility methods
  static createGlobalStyles() {
    getGlobalAnimationManager().createGlobalStyles();
  }

  static detectAnimationSupport() {
    return UnifiedAnimationTheme.detectAnimationSupport();
  }

  static getSystemAnimationPreferences() {
    return UnifiedAnimationTheme.getCurrentTheme();
  }
}

/**
 * Utils Animation Manager Compatibility
 * Maintains API compatibility with utils/animation-manager.js
 */
export class UtilsAnimationManager {
  static activeAnimations = UnifiedAnimationManager.activeAnimations;
  static rafId = UnifiedAnimationManager.rafId;

  static animate(target, properties, options = {}) {
    return UnifiedAnimationManager.animate(target, properties, options);
  }

  static startAnimationLoop() {
    return getGlobalAnimationManager().startAnimationLoop();
  }

  static applyEasing(progress, easing = "linear") {
    return getGlobalAnimationManager().applyEasing(progress, easing);
  }

  static cancelAnimation(target) {
    const manager = getGlobalAnimationManager();
    const animationsToCancel = [];

    for (const [id, animation] of this.activeAnimations) {
      if (animation.target === target) {
        animationsToCancel.push(id);
      }
    }

    animationsToCancel.forEach((id) => {
      this.activeAnimations.delete(id);
      manager.stop(id);
    });
  }

  static cancelAllAnimations() {
    getGlobalAnimationManager().stopAll();
    this.cleanup();
  }

  static getActiveAnimationCount() {
    return this.activeAnimations.size;
  }

  static hasActiveAnimations(target) {
    for (const animation of this.activeAnimations.values()) {
      if (animation.target === target) {
        return true;
      }
    }
    return false;
  }

  static cleanup() {
    this.activeAnimations.clear();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  static pauseAll() {
    getGlobalAnimationManager().pauseAllAnimations();
  }

  static resumeAll() {
    getGlobalAnimationManager().resumeAllAnimations();
  }
}

/**
 * Helpers Animation Compatibility
 * Maintains API compatibility with utils/helpers.js animation methods
 */
export class HelpersAnimationCompat {
  /**
   * Advanced animation with accessibility and performance features
   * @param {Object} options - Animation options
   * @returns {Object} Animation controller
   */
  static animate(options = {}) {
    const {
      target = document.body,
      properties = {},
      duration = 300,
      easing = "easeInOut",
      updateCallback = () => {},
      completeCallback = () => {},
      respectReducedMotion = true,
      pauseOnVisibilityChange = true,
    } = options;

    const manager = getGlobalAnimationManager();
    let animationId = null;
    let paused = false;
    let cancelled = false;

    // Create animation using unified manager
    animationId = manager.animate(target, properties, duration, {
      easing,
      onUpdate: (target, progress) => {
        if (!paused && !cancelled) {
          updateCallback(progress, progress, performance.now());
        }
      },
      onComplete: () => {
        if (!cancelled && completeCallback) {
          completeCallback();
        }
      },
    });

    const controller = {
      start() {
        if (animationId) {
          // Animation already started
          return this;
        }
        return this;
      },

      pause() {
        paused = true;
        return this;
      },

      resume() {
        paused = false;
        return this;
      },

      cancel() {
        cancelled = true;
        if (animationId) {
          manager.stop(animationId);
          animationId = null;
        }
        return this;
      },

      getProgress() {
        if (animationId) {
          const animation = manager.animations.get(animationId);
          return animation ? animation.progress : 0;
        }
        return 0;
      },

      isPaused() {
        return paused;
      },

      isCancelled() {
        return cancelled;
      },

      getPerformance() {
        return manager.getPerformanceReport();
      },
    };

    return controller;
  }

  /**
   * Batch multiple animations with coordination
   * @param {Array} animations - Array of animation configurations
   * @param {Object} options - Batch options
   * @returns {Object} Batch controller
   */
  static createAnimationBatch(animations, options = {}) {
    const {
      sequential = false,
      delay = 0,
      onProgress = null,
      onComplete = null,
    } = options;

    const controllers = [];
    let completedCount = 0;
    let started = false;

    const handleAnimationComplete = () => {
      completedCount++;
      const progress = completedCount / animations.length;

      if (onProgress) onProgress(progress);

      if (completedCount === animations.length && onComplete) {
        onComplete();
      }
    };

    const createAnimation = (config) => {
      const animationConfig = {
        ...config,
        completeCallback: () => {
          if (config.completeCallback) config.completeCallback();
          handleAnimationComplete();
        },
      };

      return this.animate(animationConfig);
    };

    const batchController = {
      start() {
        if (started) return this;
        started = true;

        if (sequential) {
          // Start animations sequentially
          let currentDelay = delay;
          animations.forEach((config, index) => {
            setTimeout(() => {
              if (!this.isCancelled()) {
                const controller = createAnimation(config);
                controllers.push(controller);
                controller.start();
              }
            }, currentDelay);
            currentDelay += (config.duration || 300) + (config.delay || 0);
          });
        } else {
          // Start animations in parallel
          animations.forEach((config, index) => {
            setTimeout(
              () => {
                if (!this.isCancelled()) {
                  const controller = createAnimation(config);
                  controllers.push(controller);
                  controller.start();
                }
              },
              delay + (config.stagger || 0) * index,
            );
          });
        }

        return this;
      },

      pause() {
        controllers.forEach((controller) => controller.pause());
        return this;
      },

      resume() {
        controllers.forEach((controller) => controller.resume());
        return this;
      },

      cancel() {
        controllers.forEach((controller) => controller.cancel());
        return this;
      },

      getProgress() {
        if (controllers.length === 0) return 0;
        const totalProgress = controllers.reduce(
          (sum, controller) => sum + controller.getProgress(),
          0,
        );
        return totalProgress / controllers.length;
      },

      isCancelled() {
        return (
          controllers.length > 0 &&
          controllers.every((controller) => controller.isCancelled())
        );
      },
    };

    return batchController;
  }
}

/**
 * Layout Components Animation Manager Compatibility
 * Maintains API compatibility with objects/layout-components.js AnimationManager
 */
export class LayoutAnimationManager {
  static activeAnimations = new Map();
  static animationId = 0;

  static animate(target, from, to, options = {}) {
    const id = ++this.animationId;
    const manager = getGlobalAnimationManager();

    // Set initial values
    Object.keys(from).forEach((key) => {
      target[key] = from[key];
    });

    // Create unified animation
    const animationId = manager.animate(target, to, options.duration, {
      easing: options.easing,
      onUpdate: (target, progress) => {
        if (options.onUpdate) {
          const current = {};
          Object.keys(from).forEach((key) => {
            current[key] = target[key];
          });
          options.onUpdate(current, progress);
        }
      },
      onComplete: () => {
        this.activeAnimations.delete(id);
        if (options.onComplete) options.onComplete();
      },
    });

    this.activeAnimations.set(id, { animationId, target, from, to });
    return id;
  }

  static runAnimation(animation) {
    // This method is handled automatically by the unified manager
  }

  static applyEasing(progress, easing) {
    return getGlobalAnimationManager().applyEasing(progress, easing);
  }

  static cancelAnimation(animationId) {
    const animation = this.activeAnimations.get(animationId);
    if (animation) {
      getGlobalAnimationManager().stop(animation.animationId);
      this.activeAnimations.delete(animationId);
    }
  }

  static cancelAllAnimations() {
    this.activeAnimations.forEach((animation, id) => {
      getGlobalAnimationManager().stop(animation.animationId);
    });
    this.activeAnimations.clear();
  }
}

// Export default as the core AnimationManager for drop-in replacement
export default AnimationManager;

// Named exports for specific compatibility needs
export {
  UtilsAnimationManager as AnimationManagerUtils,
  HelpersAnimationCompat as HelpersAnimation,
  LayoutAnimationManager as LayoutComponentsAnimation,
  getGlobalAnimationManager,
};

// Global availability for legacy code
if (typeof window !== "undefined") {
  window.AnimationManagerCompat = {
    AnimationManager,
    UtilsAnimationManager,
    HelpersAnimationCompat,
    LayoutAnimationManager,
    getGlobalAnimationManager,
  };

  logger.info(
    "AnimationManagerCompat",
    "Animation manager compatibility layer available globally",
  );
}
