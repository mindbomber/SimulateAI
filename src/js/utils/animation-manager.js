/**
 * Animation Manager Utility
 *
 * Provides centralized animation management with easing functions,
 * performance optimization, and lifecycle management.
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import {
  INPUT_UTILITY_CONSTANTS,
  ANIMATION_DEFAULTS,
} from "../components/input-utilities/constants.js";
import { ComponentError } from "./component-error.js";

// Animation constants to eliminate magic numbers
const ANIMATION_CONSTANTS = {
  ID_RANDOM_BASE: 36,
  ID_RANDOM_LENGTH: 9,
  CLEANUP_BUFFER_MS: 100,
  CUBIC_POWER: 3,
  EASE_MIDPOINT: 0.5,
  CUBIC_MULTIPLIER: 4,
  CUBIC_NEGATIVE_FACTOR: -2,
  BOUNCE_THRESHOLD_1: 2.75,
  BOUNCE_THRESHOLD_2: 1.5,
  BOUNCE_THRESHOLD_3: 2.5,
  BOUNCE_THRESHOLD_4: 2.25,
  BOUNCE_THRESHOLD_5: 2.625,
  BOUNCE_COEFFICIENT: 7.5625,
  BOUNCE_OFFSET_1: 0.75,
  BOUNCE_OFFSET_2: 0.9375,
  BOUNCE_OFFSET_3: 0.984375,
  ELASTIC_PERIOD: 3,
  ELASTIC_AMPLITUDE: 10,
  ELASTIC_PHASE: 0.75,
  HALF_DIVISION: 2,
};

/**
 * Centralized animation management system with requestAnimationFrame
 * optimization and comprehensive easing function support.
 */
export class AnimationManager {
  static activeAnimations = new Map();
  static rafId = null;

  /**
   * Animate properties of a target object over time
   * @param {Object} target - The object to animate
   * @param {Object} properties - Properties and their target values
   * @param {Object} options - Animation configuration options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static animate(target, properties, options = {}) {
    const config = { ...ANIMATION_DEFAULTS, ...options };
    const animationId = `${target.id || target.constructor?.name || "unknown"}_${Date.now()}_${Math.random().toString(ANIMATION_CONSTANTS.ID_RANDOM_BASE).substr(2, ANIMATION_CONSTANTS.ID_RANDOM_LENGTH)}`;

    return new Promise((resolve, reject) => {
      try {
        // Validate inputs
        if (!target || typeof target !== "object") {
          throw new Error("Animation target must be an object");
        }

        if (!properties || typeof properties !== "object") {
          throw new Error("Animation properties must be an object");
        }

        const animation = {
          target,
          properties: { ...properties }, // Clone to avoid mutations
          config,
          startTime: performance.now(),
          resolve,
          reject,
          initialValues: {},
        };

        // Store initial values for proper interpolation
        for (const prop in properties) {
          animation.initialValues[prop] = target[prop] || 0;
        }

        this.activeAnimations.set(animationId, animation);
        this.startAnimationLoop();

        // Auto-cleanup after duration with buffer
        setTimeout(() => {
          if (this.activeAnimations.has(animationId)) {
            this.activeAnimations.delete(animationId);
            resolve();
          }
        }, config.duration + ANIMATION_CONSTANTS.CLEANUP_BUFFER_MS); // Small buffer for cleanup
      } catch (error) {
        reject(
          new ComponentError(
            "Animation failed",
            target.constructor?.name || "Unknown",
            {
              error: error.message,
              properties: Object.keys(properties),
              config,
            },
          ),
        );
      }
    });
  }

  /**
   * Start the main animation loop using requestAnimationFrame
   */
  static startAnimationLoop() {
    if (this.rafId) return;

    const updateAnimations = () => {
      const currentTime = performance.now();
      const completedAnimations = [];

      for (const [id, animation] of this.activeAnimations) {
        try {
          const elapsed = currentTime - animation.startTime;
          const progress = Math.min(elapsed / animation.config.duration, 1);

          // Apply easing function
          const easedProgress = this.applyEasing(
            progress,
            animation.config.easing,
          );

          // Update properties with interpolated values
          for (const [prop, targetValue] of Object.entries(
            animation.properties,
          )) {
            const initialValue = animation.initialValues[prop];
            const delta = targetValue - initialValue;
            animation.target[prop] = initialValue + delta * easedProgress;
          }

          // Check if animation is complete
          if (progress >= 1) {
            completedAnimations.push({ id, animation });
          }
        } catch (error) {
          // Handle animation errors gracefully - use ComponentError for consistency
          const componentError = new ComponentError(
            "Animation update failed",
            "AnimationManager",
            { error: error.message },
          );
          completedAnimations.push({ id, animation, error: componentError });
        }
      }

      // Clean up completed animations
      for (const { id, animation, error } of completedAnimations) {
        this.activeAnimations.delete(id);
        if (error) {
          animation.reject(error);
        } else {
          animation.resolve();
        }
      }

      // Continue loop if animations remain
      if (this.activeAnimations.size > 0) {
        this.rafId = requestAnimationFrame(updateAnimations);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(updateAnimations);
  }

  /**
   * Apply easing function to animation progress
   * @param {number} progress - Animation progress (0-1)
   * @param {string} easing - Easing function name
   * @returns {number} Eased progress value
   */
  static applyEasing(progress, easing = "linear") {
    switch (easing) {
      case "ease-in":
        return progress * progress;

      case "ease-out":
        return 1 - Math.pow(1 - progress, 2);

      case "ease-in-out":
        return progress < INPUT_UTILITY_CONSTANTS.EASE_THRESHOLD
          ? INPUT_UTILITY_CONSTANTS.EASE_MULTIPLIER * progress * progress
          : 1 -
              Math.pow(
                INPUT_UTILITY_CONSTANTS.EASE_NEGATIVE_MULTIPLIER * progress +
                  INPUT_UTILITY_CONSTANTS.EASE_MULTIPLIER,
                INPUT_UTILITY_CONSTANTS.EASE_MULTIPLIER,
              ) /
                INPUT_UTILITY_CONSTANTS.EASE_MULTIPLIER;

      case "ease-in-cubic":
        return progress * progress * progress;

      case "ease-out-cubic":
        return 1 - Math.pow(1 - progress, ANIMATION_CONSTANTS.CUBIC_POWER);

      case "ease-in-out-cubic":
        return progress < ANIMATION_CONSTANTS.EASE_MIDPOINT
          ? ANIMATION_CONSTANTS.CUBIC_MULTIPLIER *
              progress *
              progress *
              progress
          : 1 -
              Math.pow(
                ANIMATION_CONSTANTS.CUBIC_NEGATIVE_FACTOR * progress +
                  ANIMATION_CONSTANTS.HALF_DIVISION,
                ANIMATION_CONSTANTS.CUBIC_POWER,
              ) /
                ANIMATION_CONSTANTS.HALF_DIVISION;

      case "bounce":
        if (progress < 1 / ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1) {
          return ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT * progress * progress;
        } else if (
          progress <
          ANIMATION_CONSTANTS.HALF_DIVISION /
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1
        ) {
          progress -=
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_2 /
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1;
          return (
            ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT * progress * progress +
            ANIMATION_CONSTANTS.BOUNCE_OFFSET_1
          );
        } else if (
          progress <
          ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_3 /
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1
        ) {
          progress -=
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_4 /
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1;
          return (
            ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT * progress * progress +
            ANIMATION_CONSTANTS.BOUNCE_OFFSET_2
          );
        } else {
          progress -=
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_5 /
            ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1;
          return (
            ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT * progress * progress +
            ANIMATION_CONSTANTS.BOUNCE_OFFSET_3
          );
        }

      case "elastic": {
        const c4 =
          (ANIMATION_CONSTANTS.HALF_DIVISION * Math.PI) /
          ANIMATION_CONSTANTS.ELASTIC_PERIOD;
        return progress === 0
          ? 0
          : progress === 1
            ? 1
            : Math.pow(
                ANIMATION_CONSTANTS.HALF_DIVISION,
                -ANIMATION_CONSTANTS.ELASTIC_AMPLITUDE * progress,
              ) *
                Math.sin(
                  (progress * ANIMATION_CONSTANTS.ELASTIC_AMPLITUDE -
                    ANIMATION_CONSTANTS.ELASTIC_PHASE) *
                    c4,
                ) +
              1;
      }

      case "linear":
      default:
        return progress;
    }
  }

  /**
   * Cancel animations for a specific target
   * @param {Object} target - The target object whose animations should be cancelled
   */
  static cancelAnimation(target) {
    const animationsToCancel = [];

    for (const [id, animation] of this.activeAnimations) {
      if (animation.target === target) {
        animationsToCancel.push({ id, animation });
      }
    }

    for (const { id, animation } of animationsToCancel) {
      this.activeAnimations.delete(id);
      animation.reject(
        new ComponentError(
          "Animation cancelled",
          target.constructor?.name || "Unknown",
        ),
      );
    }
  }

  /**
   * Cancel all active animations
   */
  static cancelAllAnimations() {
    for (const [, animation] of this.activeAnimations) {
      animation.reject(
        new ComponentError("All animations cancelled", "AnimationManager"),
      );
    }
    this.cleanup();
  }

  /**
   * Get the number of active animations
   * @returns {number} Number of active animations
   */
  static getActiveAnimationCount() {
    return this.activeAnimations.size;
  }

  /**
   * Check if a target has active animations
   * @param {Object} target - The target to check
   * @returns {boolean} True if target has active animations
   */
  static hasActiveAnimations(target) {
    for (const animation of this.activeAnimations.values()) {
      if (animation.target === target) {
        return true;
      }
    }
    return false;
  }

  /**
   * Clean up all animations and resources
   */
  static cleanup() {
    this.activeAnimations.clear();
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Pause all animations (for performance optimization)
   */
  static pauseAll() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
  }

  /**
   * Resume all animations
   */
  static resumeAll() {
    if (this.activeAnimations.size > 0 && !this.rafId) {
      // Update start times to account for pause duration
      const now = performance.now();
      for (const animation of this.activeAnimations.values()) {
        const elapsed = now - animation.startTime;
        animation.startTime = now - elapsed;
      }
      this.startAnimationLoop();
    }
  }
}
