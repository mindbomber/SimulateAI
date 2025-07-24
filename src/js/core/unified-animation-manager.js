/**
 * Unified Animation Manager - Phase 3 Component Integration
 * Consolidates animation-manager.js (core + utils) + helpers animation utilities
 *
 * Eliminates redundancy between:
 * - core/animation-manager.js (1,716 lines)
 * - utils/animation-manager.js (374 lines)
 * - utils/helpers.js animation methods (~200 lines)
 * - objects/layout-components.js AnimationManager (~50 lines)
 *
 * @version 3.0.0 - Unified Architecture
 * @author SimulateAI Development Team
 */

import logger from "../utils/logger.js";

// Simple error class for animation errors
class UnifiedAnimationError extends Error {
  constructor(message, context = {}) {
    super(message);
    this.name = "UnifiedAnimationError";
    this.context = context;
    this.timestamp = Date.now();
  }
}

// Enhanced animation constants combining all systems
const UNIFIED_ANIMATION_CONSTANTS = {
  // Core performance settings
  DEFAULT_DURATION: 300,
  REDUCED_MOTION_DURATION: 150,
  MAX_ANIMATIONS_PER_FRAME: 30,
  FRAME_TIME_LIMIT: 16.67, // 60fps
  CLEANUP_BUFFER_MS: 50,

  // Memory management
  MEMORY_CLEANUP_INTERVAL: 60000, // 1 minute
  HISTORY_CUTOFF_TIME: 60000, // 1 minute
  PERFORMANCE_WARNING_LIMIT: 5,
  PERFORMANCE_RESET_DELAY: 5000,

  // Easing constants
  CUBIC_POWER: 3,
  CUBIC_MULTIPLIER: 4,
  CUBIC_NEGATIVE_FACTOR: -2,
  EASE_MIDPOINT: 0.5,
  HALF_DIVISION: 2,

  // Bounce animation
  BOUNCE_THRESHOLD_1: 2.75,
  BOUNCE_THRESHOLD_2: 1.5,
  BOUNCE_THRESHOLD_3: 2,
  BOUNCE_THRESHOLD_4: 2.25,
  BOUNCE_THRESHOLD_5: 2.5,
  BOUNCE_COEFFICIENT: 7.5625,
  BOUNCE_OFFSET_1: 0.75,
  BOUNCE_OFFSET_2: 0.9375,
  BOUNCE_OFFSET_3: 0.984375,

  // Elastic animation
  ELASTIC_PERIOD: 3,
  ELASTIC_AMPLITUDE: 10,
  ELASTIC_PHASE: 0.75,

  // Gesture support
  SWIPE_DISTANCE: 300,
  PINCH_IN_SCALE: 0.8,
  PINCH_OUT_SCALE: 1.2,

  // ID generation
  ID_RANDOM_BASE: 36,
  ID_RANDOM_LENGTH: 8,

  // Cleanup delays
  CLEANUP_DELAY: 2000,
  PROPERTY_SIZE_MULTIPLIER: 64,
};

// Unified easing presets combining all systems
const UNIFIED_EASING_PRESETS = {
  accessibility: "easeInOut",
  reduced: "linear",
  smooth: "easeOutCubic",
  bounce: "bounce",
  elastic: "elastic",
  default: "easeInOut",
};

// Animation defaults combining utils and core patterns
const UNIFIED_ANIMATION_DEFAULTS = {
  duration: UNIFIED_ANIMATION_CONSTANTS.DEFAULT_DURATION,
  easing: "easeInOut",
  delay: 0,
  repeat: 0,
  yoyo: false,
  autoplay: true,
};

/**
 * Animation theme integration for accessibility and visual consistency
 * Enhanced from core/animation-manager.js
 */
class UnifiedAnimationTheme {
  static getCurrentTheme() {
    // Detect system preferences
    const reducedMotion =
      typeof window !== "undefined"
        ? window.matchMedia?.("(prefers-reduced-motion: reduce)").matches ||
          false
        : false;

    const highContrast =
      typeof window !== "undefined"
        ? window.matchMedia?.("(prefers-contrast: high)").matches || false
        : false;

    return {
      theme: "auto",
      reducedMotion,
      highContrast,
      animationSupport: this.detectAnimationSupport(),
    };
  }

  static detectAnimationSupport() {
    if (typeof window === "undefined") return false;

    const testElement = document.createElement("div");
    const animationProps = [
      "animation",
      "webkitAnimation",
      "mozAnimation",
      "oAnimation",
      "msAnimation",
    ];

    return animationProps.some((prop) => prop in testElement.style);
  }

  static getAnimationConfig(theme) {
    const config = {
      duration: theme.reducedMotion
        ? UNIFIED_ANIMATION_CONSTANTS.REDUCED_MOTION_DURATION
        : UNIFIED_ANIMATION_CONSTANTS.DEFAULT_DURATION,
      easing: theme.reducedMotion ? "linear" : "easeInOut",
      enabled: theme.animationSupport && !theme.reducedMotion,
    };

    return config;
  }
}

/**
 * Performance monitoring for animation operations
 * Enhanced from core/animation-manager.js
 */
class UnifiedAnimationPerformanceMonitor {
  constructor() {
    this.operations = new Map();
    this.metrics = {
      totalAnimations: 0,
      activeAnimations: 0,
      averageFrameTime: 0,
      memoryUsage: 0,
      errors: 0,
    };
  }

  startOperation(type) {
    const id = `${type}_${Date.now()}_${Math.random()}`;
    const operation = {
      id,
      type,
      startTime: performance.now(),
      memoryBefore: this.estimateMemoryUsage(),
    };

    this.operations.set(id, operation);
    return operation;
  }

  endOperation(type, operation) {
    if (!operation || !this.operations.has(operation.id)) return;

    const op = this.operations.get(operation.id);
    op.endTime = performance.now();
    op.duration = op.endTime - op.startTime;
    op.memoryAfter = this.estimateMemoryUsage();

    this.updateMetrics(op);
    this.operations.delete(operation.id);
  }

  updateMetrics(operation) {
    this.metrics.totalAnimations++;

    const frameTimes = Array.from(this.operations.values())
      .map((op) => op.duration)
      .filter((d) => d);

    if (frameTimes.length > 0) {
      this.metrics.averageFrameTime =
        frameTimes.reduce((a, b) => a + b) / frameTimes.length;
    }
  }

  estimateMemoryUsage() {
    return performance.memory ? performance.memory.usedJSHeapSize : 0;
  }

  trackMemory(id, size) {
    this.metrics.memoryUsage += size;
  }

  releaseMemory(id) {
    // Memory release tracking - simplified for performance
  }

  getMetrics() {
    return { ...this.metrics };
  }
}

/**
 * Enhanced error handling for animation operations
 */
class UnifiedAnimationError extends Error {
  constructor(message, context = {}, originalError = null) {
    super(message);
    this.name = "UnifiedAnimationError";
    this.context = context;
    this.originalError = originalError;
    this.timestamp = Date.now();
  }
}

/**
 * Main Unified Animation Manager Class
 * Consolidates all animation management functionality
 */
export class UnifiedAnimationManager {
  constructor(engine = null) {
    // Core state management
    this.engine = engine;
    this.animations = new Map();
    this.timelines = new Map();
    this.activeAnimations = new Set();
    this.animationId = 0;

    // Static animation loop (from utils pattern)
    this.rafId = null;

    // Enhanced state management
    this.theme = UnifiedAnimationTheme.getCurrentTheme();
    this.performanceMonitor = new UnifiedAnimationPerformanceMonitor();
    this.renderCache = new Map();

    // Performance settings with theme awareness
    this.maxAnimationsPerFrame =
      UNIFIED_ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME;
    this.frameTimeLimit = UNIFIED_ANIMATION_CONSTANTS.FRAME_TIME_LIMIT;

    // Accessibility features
    this.accessibilityEnabled = true;
    this.reducedMotionMode = this.theme.reducedMotion;
    this.announcements = [];
    this.accessibilityRegion = null;

    // Animation defaults
    this.defaultDuration = UNIFIED_ANIMATION_CONSTANTS.DEFAULT_DURATION;
    this.defaultEasing = UNIFIED_EASING_PRESETS.default;
    this.animationsEnabled = this.theme.animationSupport;

    // Error handling
    this.errorCount = 0;
    this.lastError = null;

    // Memory management
    this.memoryCleanupInterval = null;

    // Touch/gesture support
    this.gestureAnimations = new Map();

    // Settings persistence
    this.settings = this.loadSettings();

    // Configuration
    this.accessibilityConfig = {
      announceAnimations: this.settings.announceAnimations || true,
      respectReducedMotion: this.settings.respectReducedMotion || true,
      enableKeyboardControls: this.settings.enableKeyboardControls || true,
    };

    this.init();
  }

  /**
   * Initialize the unified animation manager
   */
  init() {
    try {
      this.setupThemeIntegration();
      this.setupAccessibilityFeatures();
      this.setupPerformanceMonitoring();
      this.setupMemoryManagement();
      this.setupEventListeners();
      this.createGlobalStyles();

      logger.info("UnifiedAnimationManager", "Initialization complete", {
        theme: this.theme,
        accessibilityEnabled: this.accessibilityEnabled,
        animationsEnabled: this.animationsEnabled,
      });
    } catch (error) {
      this.handleError(
        new UnifiedAnimationError("Initialization failed", {}, error),
      );
    }
  }

  /**
   * Setup theme integration
   */
  setupThemeIntegration() {
    // Listen for theme changes
    if (typeof window !== "undefined") {
      const reducedMotionQuery = window.matchMedia(
        "(prefers-reduced-motion: reduce)",
      );
      const highContrastQuery = window.matchMedia("(prefers-contrast: high)");

      const updateTheme = () => {
        this.theme = UnifiedAnimationTheme.getCurrentTheme();
        this.updateAnimationDefaults();
        this.announceThemeChange();
      };

      reducedMotionQuery.addEventListener("change", updateTheme);
      highContrastQuery.addEventListener("change", updateTheme);
    }
  }

  /**
   * Setup accessibility features
   */
  setupAccessibilityFeatures() {
    this.createAccessibilityRegion();
  }

  /**
   * Create accessibility announcement region
   */
  createAccessibilityRegion() {
    if (typeof document === "undefined") return;

    this.accessibilityRegion = document.createElement("div");
    this.accessibilityRegion.setAttribute("aria-live", "polite");
    this.accessibilityRegion.setAttribute("aria-atomic", "true");
    this.accessibilityRegion.className = "sr-only";
    this.accessibilityRegion.id = "animation-announcements";

    document.body.appendChild(this.accessibilityRegion);
  }

  /**
   * Setup performance monitoring
   */
  setupPerformanceMonitoring() {
    this.performanceConfig = {
      trackRenderTime: true,
      trackMemoryUsage: true,
      enableWarnings: true,
      maxAnimationDuration: this.reducedMotionMode
        ? UNIFIED_ANIMATION_CONSTANTS.REDUCED_MOTION_DURATION * 2
        : UNIFIED_ANIMATION_CONSTANTS.DEFAULT_DURATION * 6,
    };
  }

  /**
   * Setup memory management
   */
  setupMemoryManagement() {
    this.memoryCleanupInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, UNIFIED_ANIMATION_CONSTANTS.MEMORY_CLEANUP_INTERVAL);
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    if (typeof document !== "undefined") {
      // Pause animations when tab is not active
      document.addEventListener("visibilitychange", () => {
        if (document.hidden) {
          this.pauseAllAnimations();
        } else {
          this.resumeAllAnimations();
        }
      });
    }
  }

  /**
   * Update animation defaults based on theme
   */
  updateAnimationDefaults() {
    const config = UnifiedAnimationTheme.getAnimationConfig(this.theme);
    this.defaultDuration = config.duration;
    this.defaultEasing = config.easing;
    this.animationsEnabled = config.enabled || this.settings.forceAnimations;
  }

  /**
   * Announce theme change
   */
  announceThemeChange() {
    if (this.accessibilityConfig.announceAnimations) {
      this.announce(
        `Animation theme updated: ${this.theme.theme} mode, reduced motion: ${this.reducedMotionMode ? "on" : "off"}`,
      );
    }
  }

  /**
   * Primary animation method - consolidates animate methods from all systems
   * @param {Object} target - The object to animate
   * @param {Object} properties - Properties and their target values
   * @param {number|null} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string|null} Animation ID
   */
  animate(target, properties, duration = null, options = {}) {
    const startTime =
      this.performanceMonitor.startOperation("create-animation");

    try {
      if (!target || !properties) {
        throw new UnifiedAnimationError("Invalid animation parameters", {
          target,
          properties,
        });
      }

      // Apply theme-aware defaults
      const actualDuration =
        duration ||
        this.defaultDuration ||
        UNIFIED_ANIMATION_CONSTANTS.DEFAULT_DURATION;
      const themeDuration = this.reducedMotionMode
        ? Math.min(
            actualDuration,
            UNIFIED_ANIMATION_CONSTANTS.REDUCED_MOTION_DURATION,
          )
        : actualDuration;

      if (!this.animationsEnabled && !options.force) {
        // Skip animation but call completion callback
        if (options.onComplete) {
          setTimeout(() => options.onComplete(target), 0);
        }
        return null;
      }

      const animation = {
        id: ++this.animationId,
        target,
        properties: this.processProperties(target, properties),
        duration: Math.max(themeDuration, 1), // Minimum 1ms
        startTime: performance.now(),
        elapsed: 0,
        progress: 0,

        // Enhanced options with accessibility
        easing: options.easing || this.defaultEasing || "easeInOut",
        delay: options.delay || 0,
        repeat: options.repeat || 0,
        yoyo: options.yoyo || false,
        onStart: options.onStart || null,
        onUpdate: options.onUpdate || null,
        onComplete: options.onComplete || null,
        onRepeat: options.onRepeat || null,
        onError: options.onError || null,

        // Accessibility options
        announceStart: options.announceStart || false,
        announceComplete: options.announceComplete || false,
        description: options.description || "",

        // State
        started: false,
        completed: false,
        paused: false,
        repeatCount: 0,
        direction: 1,

        // Performance tracking
        createdAt: Date.now(),
        performanceWarnings: 0,
      };

      this.animations.set(animation.id, animation);
      this.activeAnimations.add(animation.id);

      // Track memory usage
      this.performanceMonitor.trackMemory(
        animation.id,
        this.estimateAnimationMemory(animation),
      );

      // Start animation loop for this animation
      this.startAnimationLoop();

      // Accessibility announcement
      if (animation.announceStart && animation.description) {
        this.announce(`Starting animation: ${animation.description}`);
      }

      return animation.id;
    } catch (error) {
      this.handleError(
        new UnifiedAnimationError(
          "Failed to create animation",
          { target, properties, duration, options },
          error,
        ),
      );
      return null;
    } finally {
      this.performanceMonitor.endOperation("create-animation", startTime);
    }
  }

  /**
   * Static animation method (from utils pattern) - Promise-based
   * @param {Object} target - The object to animate
   * @param {Object} properties - Properties and their target values
   * @param {Object} options - Animation configuration options
   * @returns {Promise} Promise that resolves when animation completes
   */
  static animate(target, properties, options = {}) {
    const config = { ...UNIFIED_ANIMATION_DEFAULTS, ...options };
    const animationId = `${target.id || target.constructor?.name || "unknown"}_${Date.now()}_${Math.random().toString(UNIFIED_ANIMATION_CONSTANTS.ID_RANDOM_BASE).substr(2, UNIFIED_ANIMATION_CONSTANTS.ID_RANDOM_LENGTH)}`;

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
        }, config.duration + UNIFIED_ANIMATION_CONSTANTS.CLEANUP_BUFFER_MS);
      } catch (error) {
        reject(
          new UnifiedAnimationError(
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
   * Consolidates both instance and static animation loop patterns
   */
  startAnimationLoop() {
    if (this.rafId) return;

    const updateAnimations = () => {
      const currentTime = performance.now();
      const completedAnimations = [];

      // Process static animations (utils pattern)
      if (this.constructor.activeAnimations) {
        for (const [id, animation] of this.constructor.activeAnimations) {
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
            const componentError = new UnifiedAnimationError(
              "Animation update failed",
              "UnifiedAnimationManager",
              { error: error.message },
            );
            completedAnimations.push({ id, animation, error: componentError });
          }
        }

        // Clean up completed animations
        for (const { id, animation, error } of completedAnimations) {
          this.constructor.activeAnimations.delete(id);
          if (error) {
            animation.reject(error);
          } else {
            animation.resolve();
          }
        }
      }

      // Process instance animations (core pattern)
      let processedCount = 0;
      let errorCount = 0;
      const frameStart =
        this.performanceMonitor.startOperation("animation-update");

      try {
        for (const animationId of this.activeAnimations) {
          if (
            processedCount >= this.maxAnimationsPerFrame ||
            performance.now() - frameStart.startTime > this.frameTimeLimit
          ) {
            break;
          }

          const animation = this.animations.get(animationId);
          if (animation && !animation.paused) {
            try {
              this.updateAnimation(animation, currentTime);
              processedCount++;
            } catch (error) {
              errorCount++;
              this.handleAnimationError(animation, error);
            }
          }
        }

        // Update timelines
        this.timelines.forEach((timeline) => {
          if (timeline.started && !timeline.completed && !timeline.paused) {
            try {
              this.updateTimeline(timeline, currentTime);
            } catch (error) {
              errorCount++;
              this.handleTimelineError(timeline, error);
            }
          }
        });

        // Clean up completed animations
        this.cleanupCompleted();
      } catch (error) {
        this.handleError(
          new UnifiedAnimationError(
            "Animation update failed",
            { processedCount, errorCount },
            error,
          ),
        );
      } finally {
        this.performanceMonitor.endOperation("animation-update", frameStart);
      }

      // Continue loop if animations remain
      if (
        (this.constructor.activeAnimations &&
          this.constructor.activeAnimations.size > 0) ||
        this.activeAnimations.size > 0
      ) {
        this.rafId = requestAnimationFrame(updateAnimations);
      } else {
        this.rafId = null;
      }
    };

    this.rafId = requestAnimationFrame(updateAnimations);
  }

  /**
   * Apply easing function to animation progress
   * Consolidates easing functions from all systems
   * @param {number} progress - Animation progress (0-1)
   * @param {string} easing - Easing function name
   * @returns {number} Eased progress value
   */
  applyEasing(progress, easing = "linear") {
    switch (easing) {
      case "ease":
      case "easeInOut":
        return progress < 0.5
          ? 2 * progress * progress
          : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      case "easeIn":
        return progress * progress;

      case "easeOut":
        return 1 - Math.pow(1 - progress, 2);

      case "easeInCubic":
        return progress * progress * progress;

      case "easeOutCubic":
        return (
          1 - Math.pow(1 - progress, UNIFIED_ANIMATION_CONSTANTS.CUBIC_POWER)
        );

      case "easeInOutCubic":
        return progress < UNIFIED_ANIMATION_CONSTANTS.EASE_MIDPOINT
          ? UNIFIED_ANIMATION_CONSTANTS.CUBIC_MULTIPLIER *
              progress *
              progress *
              progress
          : 1 -
              Math.pow(
                UNIFIED_ANIMATION_CONSTANTS.CUBIC_NEGATIVE_FACTOR * progress +
                  2,
                UNIFIED_ANIMATION_CONSTANTS.CUBIC_POWER,
              ) /
                UNIFIED_ANIMATION_CONSTANTS.HALF_DIVISION;

      case "bounce":
        if (progress < 1 / UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1) {
          return (
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT * progress * progress
          );
        } else if (
          progress <
          UNIFIED_ANIMATION_CONSTANTS.HALF_DIVISION /
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1
        ) {
          progress -=
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_2 /
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1;
          return (
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT *
              progress *
              progress +
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_OFFSET_1
          );
        } else if (
          progress <
          UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_3 /
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1
        ) {
          progress -=
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_4 /
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1;
          return (
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT *
              progress *
              progress +
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_OFFSET_2
          );
        } else {
          progress -=
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_5 /
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_THRESHOLD_1;
          return (
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_COEFFICIENT *
              progress *
              progress +
            UNIFIED_ANIMATION_CONSTANTS.BOUNCE_OFFSET_3
          );
        }

      case "elastic": {
        const c4 =
          (UNIFIED_ANIMATION_CONSTANTS.HALF_DIVISION * Math.PI) /
          UNIFIED_ANIMATION_CONSTANTS.ELASTIC_PERIOD;
        return progress === 0
          ? 0
          : progress === 1
            ? 1
            : Math.pow(
                UNIFIED_ANIMATION_CONSTANTS.HALF_DIVISION,
                -UNIFIED_ANIMATION_CONSTANTS.ELASTIC_AMPLITUDE * progress,
              ) *
                Math.sin(
                  (progress * UNIFIED_ANIMATION_CONSTANTS.ELASTIC_AMPLITUDE -
                    UNIFIED_ANIMATION_CONSTANTS.ELASTIC_PHASE) *
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
   * Update individual animation
   * @param {Object} animation - Animation object
   * @param {number} currentTime - Current timestamp
   */
  updateAnimation(animation, currentTime) {
    try {
      // Handle delay
      if (!animation.started) {
        if (currentTime - animation.startTime >= animation.delay) {
          animation.started = true;
          animation.startTime = currentTime;

          if (animation.onStart) {
            animation.onStart(animation.target, animation);
          }

          // Accessibility announcement
          if (animation.announceStart && animation.description) {
            this.announce(`Animation started: ${animation.description}`);
          }
        } else {
          return;
        }
      }

      // Calculate progress with bounds checking
      animation.elapsed = currentTime - animation.startTime;
      animation.progress = Math.min(
        Math.max(animation.elapsed / animation.duration, 0),
        1,
      );

      // Apply easing with error handling
      const easedProgress = this.applyEasing(
        animation.progress,
        animation.easing,
      );

      // Update properties with validation
      this.updateProperties(animation, easedProgress);

      // Call update callback with error handling
      if (animation.onUpdate) {
        try {
          animation.onUpdate(animation.target, animation.progress, animation);
        } catch (error) {
          animation.performanceWarnings++;
          if (animation.onError) {
            animation.onError(error, animation);
          }
        }
      }

      // Handle completion
      if (animation.progress >= 1) {
        this.handleAnimationComplete(animation);
      }
    } catch (error) {
      animation.performanceWarnings++;
      throw new UnifiedAnimationError(
        "Animation update failed",
        { animationId: animation.id },
        error,
      );
    }
  }

  /**
   * Update timeline
   * @param {Object} timeline - Timeline object
   * @param {number} currentTime - Current timestamp
   */
  updateTimeline(timeline, currentTime) {
    timeline.elapsed = currentTime - timeline.startTime;
    timeline.progress = Math.min(timeline.elapsed / timeline.duration, 1);

    // Update timeline animations
    timeline.animations.forEach((animation) => {
      const animationStart = timeline.startTime + animation.delay;
      const animationEnd = animationStart + animation.duration;

      if (
        currentTime >= animationStart &&
        currentTime <= animationEnd &&
        !animation.completed
      ) {
        if (!animation.started) {
          animation.started = true;
          if (animation.onStart) {
            animation.onStart(animation.target, animation);
          }
        }

        const animationProgress = Math.min(
          (currentTime - animationStart) / animation.duration,
          1,
        );
        const easedProgress = this.applyEasing(
          animationProgress,
          animation.easing,
        );

        this.updateProperties(animation, easedProgress);

        if (animation.onUpdate) {
          animation.onUpdate(animation.target, animationProgress, animation);
        }

        if (animationProgress >= 1 && !animation.completed) {
          animation.completed = true;
          if (animation.onComplete) {
            animation.onComplete(animation.target, animation);
          }
        }
      }
    });

    // Handle timeline completion
    if (timeline.progress >= 1) {
      timeline.completed = true;
      if (timeline.onComplete) {
        timeline.onComplete(timeline);
      }
    }
  }

  /**
   * Handle animation completion
   * @param {Object} animation - Animation object
   */
  handleAnimationComplete(animation) {
    try {
      if (animation.repeat > 0 || animation.repeat === -1) {
        // Handle repeat
        animation.repeatCount++;

        if (
          animation.repeat === -1 ||
          animation.repeatCount < animation.repeat
        ) {
          if (animation.yoyo) {
            animation.direction *= -1;
            // Swap start and end values for yoyo effect
            Object.keys(animation.properties).forEach((key) => {
              const prop = animation.properties[key];
              [prop.start, prop.end] = [prop.end, prop.start];
            });
          }

          animation.startTime = performance.now();
          animation.elapsed = 0;
          animation.progress = 0;

          if (animation.onRepeat) {
            animation.onRepeat(
              animation.target,
              animation.repeatCount,
              animation,
            );
          }

          return;
        }
      }

      // Animation fully completed
      animation.completed = true;
      this.activeAnimations.delete(animation.id);

      // Release memory tracking
      this.performanceMonitor.releaseMemory(animation.id);

      // Accessibility announcement
      if (animation.announceComplete && animation.description) {
        this.announce(`Animation completed: ${animation.description}`);
      }

      if (animation.onComplete) {
        animation.onComplete(animation.target, animation);
      }
    } catch (error) {
      this.handleAnimationError(animation, error);
    }
  }

  /**
   * Process properties for animation
   * @param {Object} target - Animation target
   * @param {Object} properties - Properties to animate
   * @returns {Object} Processed properties
   */
  processProperties(target, properties) {
    const processed = {};

    Object.keys(properties).forEach((key) => {
      const value = properties[key];
      const currentValue = target[key] || 0;

      if (typeof value === "number") {
        processed[key] = {
          type: "number",
          start: currentValue,
          end: value,
        };
      } else if (typeof value === "string" && value.includes("#")) {
        processed[key] = {
          type: "color",
          start: currentValue,
          end: value,
        };
      } else {
        processed[key] = {
          type: "transform",
          start: currentValue,
          end: value,
        };
      }
    });

    return processed;
  }

  /**
   * Update properties during animation
   * @param {Object} animation - Animation object
   * @param {number} progress - Animation progress
   */
  updateProperties(animation, progress) {
    Object.keys(animation.properties).forEach((key) => {
      const prop = animation.properties[key];

      if (prop.type === "number") {
        animation.target[key] = prop.start + (prop.end - prop.start) * progress;
      } else if (prop.type === "color") {
        animation.target[key] = this.interpolateColor(
          prop.start,
          prop.end,
          progress,
        );
      } else if (prop.type === "transform") {
        animation.target[key] = this.interpolateTransform(
          prop.start,
          prop.end,
          progress,
        );
      }
    });
  }

  /**
   * Interpolate color values
   * @param {string} start - Start color
   * @param {string} end - End color
   * @param {number} progress - Progress (0-1)
   * @returns {string} Interpolated color
   */
  interpolateColor(start, end, progress) {
    // Simplified color interpolation
    return end; // For now, just use end color
  }

  /**
   * Interpolate transform values
   * @param {*} start - Start value
   * @param {*} end - End value
   * @param {number} progress - Progress (0-1)
   * @returns {*} Interpolated value
   */
  interpolateTransform(start, end, progress) {
    // Simplified transform interpolation
    if (typeof start === "number" && typeof end === "number") {
      return start + (end - start) * progress;
    }
    return end;
  }

  /**
   * Clean up completed animations
   */
  cleanupCompleted() {
    // Remove completed animations from active set
    for (const animationId of this.activeAnimations) {
      const animation = this.animations.get(animationId);
      if (animation && animation.completed) {
        this.activeAnimations.delete(animationId);
      }
    }
  }

  /**
   * Pause all animations
   */
  pauseAllAnimations() {
    this.activeAnimations.forEach((id) => {
      const animation = this.animations.get(id);
      if (animation) {
        animation.paused = true;
      }
    });

    if (this.accessibilityConfig.announceAnimations) {
      this.announce("All animations paused");
    }
  }

  /**
   * Resume all animations
   */
  resumeAllAnimations() {
    const now = performance.now();
    this.activeAnimations.forEach((id) => {
      const animation = this.animations.get(id);
      if (animation && animation.paused) {
        animation.paused = false;
        animation.startTime = now - animation.elapsed;
      }
    });

    if (this.accessibilityConfig.announceAnimations) {
      this.announce("All animations resumed");
    }
  }

  /**
   * Stop animation by ID
   * @param {string} animationId - Animation ID to stop
   */
  stop(animationId) {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.completed = true;
      this.activeAnimations.delete(animationId);
      this.performanceMonitor.releaseMemory(animationId);
    }
  }

  /**
   * Stop all animations
   */
  stopAll() {
    this.activeAnimations.forEach((id) => this.stop(id));
  }

  /**
   * Announce accessibility message
   * @param {string} message - Message to announce
   * @param {boolean} urgent - Whether message is urgent
   */
  announce(message, urgent = false) {
    if (!this.accessibilityConfig.announceAnimations || !message) return;

    this.announcements.push({
      message: String(message).trim(),
      urgent,
      timestamp: Date.now(),
    });

    // Process announcement
    setTimeout(() => this.processAnnouncements(), 100);
  }

  /**
   * Process accessibility announcements
   */
  processAnnouncements() {
    if (this.announcements.length === 0 || !this.accessibilityRegion) return;

    const announcement = this.announcements.shift();
    this.accessibilityRegion.textContent = announcement.message;

    // Clear after announcement
    setTimeout(() => {
      if (
        this.accessibilityRegion &&
        this.accessibilityRegion.textContent === announcement.message
      ) {
        this.accessibilityRegion.textContent = "";
      }
    }, UNIFIED_ANIMATION_CONSTANTS.CLEANUP_DELAY);
  }

  /**
   * Estimate animation memory usage
   * @param {Object} animation - Animation object
   * @returns {number} Estimated memory usage in bytes
   */
  estimateAnimationMemory(animation) {
    const baseSize = 1024; // Base animation object
    const propertySize =
      Object.keys(animation.properties).length *
      UNIFIED_ANIMATION_CONSTANTS.PROPERTY_SIZE_MULTIPLIER;
    return baseSize + propertySize;
  }

  /**
   * Perform memory cleanup
   */
  performMemoryCleanup() {
    const cutoffTime =
      Date.now() - UNIFIED_ANIMATION_CONSTANTS.HISTORY_CUTOFF_TIME;

    this.animations.forEach((animation, id) => {
      if (animation.completed && animation.createdAt < cutoffTime) {
        this.animations.delete(id);
        this.performanceMonitor.releaseMemory(id);
      }
    });

    this.timelines.forEach((timeline, id) => {
      if (timeline.completed && timeline.createdAt < cutoffTime) {
        this.timelines.delete(id);
      }
    });

    // Clear render cache
    if (this.renderCache.size > 100) {
      this.renderCache.clear();
    }
  }

  /**
   * Handle animation error
   * @param {Object} animation - Animation object
   * @param {Error} error - Error object
   */
  handleAnimationError(animation, error) {
    animation.performanceWarnings++;

    if (animation.onError) {
      animation.onError(error, animation);
    } else {
      this.handleError(
        new UnifiedAnimationError(
          "Animation execution error",
          { animationId: animation.id },
          error,
        ),
      );
    }

    // Stop problematic animation if too many errors
    if (
      animation.performanceWarnings >
      UNIFIED_ANIMATION_CONSTANTS.PERFORMANCE_WARNING_LIMIT
    ) {
      this.stop(animation.id);
      this.announce(
        `Animation stopped due to errors: ${animation.description || "Unknown animation"}`,
      );
    }
  }

  /**
   * Handle timeline error
   * @param {Object} timeline - Timeline object
   * @param {Error} error - Error object
   */
  handleTimelineError(timeline, error) {
    logger.warn("Timeline error:", error);
    timeline.completed = true;
  }

  /**
   * Handle general error
   * @param {Error} error - Error object
   */
  handleError(error) {
    this.errorCount++;
    this.lastError = error;

    logger.error("UnifiedAnimationManager Error:", error);

    if (this.engine && this.engine.emit) {
      this.engine.emit("animation:error", error);
    }
  }

  /**
   * Load settings from localStorage
   * @returns {Object} Settings object
   */
  loadSettings() {
    try {
      if (typeof localStorage !== "undefined") {
        const settings = JSON.parse(
          localStorage.getItem("animationSettings") || "{}",
        );
        return {
          announceAnimations: settings.announceAnimations !== false,
          respectReducedMotion: settings.respectReducedMotion !== false,
          enableKeyboardControls: settings.enableKeyboardControls !== false,
          forceAnimations: settings.forceAnimations || false,
          maxAnimationsPerFrame:
            settings.maxAnimationsPerFrame ||
            UNIFIED_ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME,
        };
      }
    } catch (error) {
      logger.warn("Failed to load animation settings:", error);
    }

    return {
      announceAnimations: true,
      respectReducedMotion: true,
      enableKeyboardControls: true,
      forceAnimations: false,
      maxAnimationsPerFrame:
        UNIFIED_ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME,
    };
  }

  /**
   * Save settings to localStorage
   * @param {Object} settings - Settings to save
   */
  saveSettings(settings) {
    try {
      if (typeof localStorage !== "undefined") {
        const currentSettings = this.loadSettings();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem("animationSettings", JSON.stringify(newSettings));
        this.settings = newSettings;
      }
    } catch (error) {
      logger.warn("Failed to save animation settings:", error);
    }
  }

  /**
   * Create global styles for animations
   */
  createGlobalStyles() {
    if (
      typeof document === "undefined" ||
      document.getElementById("unified-animation-manager-styles")
    )
      return;

    const styleSheet = document.createElement("style");
    styleSheet.id = "unified-animation-manager-styles";
    styleSheet.textContent = `
      /* Global animation styles with accessibility support */
      @media (prefers-reduced-motion: reduce) {
        *,
        *::before,
        *::after {
          animation-duration: 0.01ms !important;
          animation-iteration-count: 1 !important;
          transition-duration: 0.01ms !important;
        }
        
        .animation-enabled {
          animation: none !important;
          transition: none !important;
        }
      }
      
      .sr-only {
        position: absolute !important;
        width: 1px !important;
        height: 1px !important;
        padding: 0 !important;
        margin: -1px !important;
        overflow: hidden !important;
        clip: rect(0, 0, 0, 0) !important;
        white-space: nowrap !important;
        border: 0 !important;
      }
      
      .animation-focus-highlight {
        outline: 2px solid #007bff !important;
        outline-offset: 2px !important;
      }
      
      @media (prefers-contrast: high) {
        .animation-focus-highlight {
          outline: 3px solid #ffff00 !important;
          outline-offset: 2px !important;
        }
      }
      
      .animation-container {
        contain: layout style;
      }
      
      .animation-target {
        will-change: auto;
      }
      
      .animation-target.animating {
        will-change: transform, opacity, background-color;
      }
    `;

    document.head.appendChild(styleSheet);
  }

  /**
   * Destroy the animation manager
   */
  destroy() {
    try {
      // Stop all animations
      this.stopAll();

      // Clear animation loop
      if (this.rafId) {
        cancelAnimationFrame(this.rafId);
        this.rafId = null;
      }

      // Clear intervals
      if (this.memoryCleanupInterval) {
        clearInterval(this.memoryCleanupInterval);
        this.memoryCleanupInterval = null;
      }

      // Remove accessibility region
      if (this.accessibilityRegion && this.accessibilityRegion.parentNode) {
        this.accessibilityRegion.parentNode.removeChild(
          this.accessibilityRegion,
        );
        this.accessibilityRegion = null;
      }

      // Clear all data structures
      this.animations.clear();
      this.timelines.clear();
      this.activeAnimations.clear();
      this.renderCache.clear();
      this.gestureAnimations.clear();
      this.announcements = [];

      logger.info(
        "UnifiedAnimationManager",
        "Animation manager destroyed successfully",
      );
    } catch (error) {
      this.handleError(
        new UnifiedAnimationError("Destruction failed", {}, error),
      );
    }
  }

  /**
   * Get performance report
   * @returns {Object} Performance metrics
   */
  getPerformanceReport() {
    return {
      metrics: this.performanceMonitor.getMetrics(),
      activeAnimations: this.activeAnimations.size,
      totalAnimations: this.animations.size,
      timelines: this.timelines.size,
      memoryUsage: this.performanceMonitor.estimateMemoryUsage(),
      errors: this.errorCount,
      lastError: this.lastError,
    };
  }

  /**
   * Get accessibility report
   * @returns {Object} Accessibility status
   */
  getAccessibilityReport() {
    return {
      isEnabled: this.accessibilityEnabled,
      reducedMotionMode: this.reducedMotionMode,
      theme: this.theme,
      activeAnimations: this.activeAnimations.size,
      announcements: this.accessibilityConfig.announceAnimations,
      settings: this.settings,
      performance: this.performanceMonitor.getMetrics(),
      errors: this.errorCount,
      lastError: this.lastError,
    };
  }
}

// Add static properties for utils pattern compatibility
UnifiedAnimationManager.activeAnimations = new Map();
UnifiedAnimationManager.rafId = null;

// Export unified manager and helper functions
export default UnifiedAnimationManager;

// Additional helper exports for backward compatibility
export {
  UnifiedAnimationTheme,
  UnifiedAnimationPerformanceMonitor,
  UnifiedAnimationError,
};

// Global availability for browser environments
if (typeof window !== "undefined") {
  window.UnifiedAnimationManager = UnifiedAnimationManager;
  window.UnifiedAnimationTheme = UnifiedAnimationTheme;
  window.UnifiedAnimationPerformanceMonitor =
    UnifiedAnimationPerformanceMonitor;

  // Create global instance for easy access
  window.animationManager = new UnifiedAnimationManager();
}
export {
  UNIFIED_ANIMATION_CONSTANTS,
  UNIFIED_EASING_PRESETS,
  UNIFIED_ANIMATION_DEFAULTS,
};
