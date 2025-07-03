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
 * AnimationManager - Enhanced animation system for simulations
 * Modern implementation with accessibility, theme integration, and performance optimization
 *
 * Features:
 * - WCAG 2.1 AA compliance with reduced motion support
 * - Dark mode and theme integration
 * - Performance monitoring and optimization
 * - Advanced error handling and recovery
 * - Touch/gesture animation support
 * - Memory management and cleanup
 * - Accessibility announcements
 *
 * @version 2.0.0
 * @author SimulateAI Team
 */

import logger from '../utils/logger.js';
import { COMMON, EASING } from '../utils/constants.js';

// Enhanced constants and configuration
const ANIMATION_CONSTANTS = {
  DEFAULT_DURATION: 300,
  REDUCED_MOTION_DURATION: 50,
  MAX_ANIMATIONS_PER_FRAME: 50,
  FRAME_TIME_LIMIT: 16, // ~60 FPS
  PERFORMANCE_WARNING_THRESHOLD: 32, // 2x frame time
  MEMORY_CLEANUP_INTERVAL: 30000, // 30 seconds
  THROTTLE_DELAY: 16,
  TOUCH_GESTURE_THRESHOLD: 50,
};

const EASING_PRESETS = {
  accessibility: 'easeInOut',
  reduced: 'linear',
  smooth: 'easeOutCubic',
  bounce: 'bounce',
  elastic: 'elastic',
};

/**
 * Animation theme integration for accessibility and visual consistency
 */
class AnimationTheme {
  static getCurrentTheme() {
    const prefersReducedMotion = window.matchMedia?.(
      '(prefers-reduced-motion: reduce)'
    ).matches;
    const prefersHighContrast = window.matchMedia?.(
      '(prefers-contrast: high)'
    ).matches;

    return {
      reducedMotion: prefersReducedMotion,
      highContrast: prefersHighContrast,
      theme: prefersHighContrast ? 'highContrast' : 'light',
    };
  }

  static getAnimationConfig(theme = null) {
    const currentTheme = theme || this.getCurrentTheme();

    return {
      duration: currentTheme.reducedMotion
        ? ANIMATION_CONSTANTS.REDUCED_MOTION_DURATION
        : ANIMATION_CONSTANTS.DEFAULT_DURATION,
      easing: currentTheme.reducedMotion
        ? EASING_PRESETS.reduced
        : EASING_PRESETS.accessibility,
      enabled: !currentTheme.reducedMotion,
      respectSystemPreferences: true,
    };
  }
}

/**
 * Performance monitoring for animation operations
 */
class AnimationPerformanceMonitor {
  static metrics = new Map();
  static memoryTracker = new Map();

  static startOperation(operationName) {
    const startTime = performance.now();
    this.metrics.set(operationName, {
      startTime,
      operations: (this.metrics.get(operationName)?.operations || 0) + 1,
    });
    return startTime;
  }

  static endOperation(operationName, startTime = null) {
    const endTime = performance.now();
    const metric = this.metrics.get(operationName);

    if (metric) {
      const duration = endTime - (startTime || metric.startTime);
      metric.lastDuration = duration;
      metric.averageDuration =
        ((metric.averageDuration || 0) * (metric.operations - 1) + duration) /
        metric.operations;

      // Performance warning for slow animations
      if (duration > ANIMATION_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
        logger.warn(
          `Slow animation operation: ${operationName} took ${duration.toFixed(2)}ms`
        );
      }
    }
  }

  static trackMemory(animationId, size) {
    this.memoryTracker.set(animationId, {
      size,
      timestamp: Date.now(),
    });
  }

  static releaseMemory(animationId) {
    this.memoryTracker.delete(animationId);
  }

  static getMetrics() {
    return {
      operations: Object.fromEntries(this.metrics),
      memory: {
        trackedAnimations: this.memoryTracker.size,
        totalMemoryEstimate: Array.from(this.memoryTracker.values()).reduce(
          (total, item) => total + item.size,
          0
        ),
      },
    };
  }
}

/**
 * Enhanced error handling for animation operations
 */
class AnimationError extends Error {
  constructor(message, context = {}, originalError = null) {
    super(message);
    this.name = 'AnimationError';
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.animationId = context.animationId;
    this.theme = AnimationTheme.getCurrentTheme();
  }
}

export class AnimationManager {
  constructor(engine) {
    this.engine = engine;
    this.animations = new Map();
    this.timelines = new Map();
    this.activeAnimations = new Set();
    this.animationId = 0;

    // Enhanced state management
    this.theme = AnimationTheme.getCurrentTheme();
    this.performanceMonitor = AnimationPerformanceMonitor;
    this.renderCache = new Map();

    // Performance settings with theme awareness
    this.maxAnimationsPerFrame = ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME;
    this.frameTimeLimit = ANIMATION_CONSTANTS.FRAME_TIME_LIMIT;

    // Accessibility features
    this.accessibilityEnabled = true;
    this.reducedMotionMode = this.theme.reducedMotion;
    this.announcements = [];

    // Error handling
    this.errorCount = 0;
    this.lastError = null;

    // Memory management
    this.memoryCleanupInterval = null;

    // Touch/gesture support
    this.gestureAnimations = new Map();

    // Settings persistence
    this.settings = this.loadSettings();

    this.init();
  }

  init() {
    const startTime = this.performanceMonitor.startOperation(
      'animation-manager-init'
    );

    try {
      this.setupThemeIntegration();
      this.setupAccessibilityFeatures();
      this.setupPerformanceMonitoring();
      this.setupMemoryManagement();
      this.setupEventListeners();

      logger.info(
        'Enhanced AnimationManager initialized with accessibility and performance features'
      );
    } catch (error) {
      this.handleError(
        new AnimationError(
          'Failed to initialize AnimationManager',
          { engine: this.engine },
          error
        )
      );
    } finally {
      this.performanceMonitor.endOperation('animation-manager-init', startTime);
    }
  }

  setupThemeIntegration() {
    // Watch for theme changes
    const reducedMotionQuery = window.matchMedia(
      '(prefers-reduced-motion: reduce)'
    );
    const contrastQuery = window.matchMedia('(prefers-contrast: high)');

    const updateTheme = () => {
      this.theme = AnimationTheme.getCurrentTheme();
      this.reducedMotionMode = this.theme.reducedMotion;
      this.updateAnimationDefaults();
      this.announceThemeChange();
    };

    if (reducedMotionQuery.addEventListener) {
      reducedMotionQuery.addEventListener('change', updateTheme);
      contrastQuery.addEventListener('change', updateTheme);
    }

    // Store listeners for cleanup
    this.themeListeners = { reducedMotionQuery, contrastQuery, updateTheme };
  }

  setupAccessibilityFeatures() {
    // Create announcement region for animation states
    this.createAccessibilityRegion();

    // Setup accessibility announcements
    this.accessibilityConfig = {
      announceAnimations: this.settings.announceAnimations !== false,
      respectReducedMotion: this.settings.respectReducedMotion !== false,
      enableKeyboardControls: this.settings.enableKeyboardControls !== false,
    };
  }

  createAccessibilityRegion() {
    if (typeof document === 'undefined') return;

    let region = document.getElementById('animation-announcements');
    if (!region) {
      region = document.createElement('div');
      region.id = 'animation-announcements';
      region.setAttribute('aria-live', 'polite');
      region.setAttribute('aria-atomic', 'true');
      region.className = 'sr-only';
      region.style.cssText = `
                position: absolute !important;
                left: -10000px !important;
                width: 1px !important;
                height: 1px !important;
                overflow: hidden !important;
            `;
      document.body.appendChild(region);
    }
    this.accessibilityRegion = region;
  }

  setupPerformanceMonitoring() {
    // Monitor animation performance
    this.performanceConfig = {
      trackRenderTime: true,
      trackMemoryUsage: true,
      enableWarnings: true,
      maxAnimationDuration: this.reducedMotionMode
        ? COMMON.MILLISECONDS_100
        : COMMON.MILLISECONDS_2000,
    };
  }

  setupMemoryManagement() {
    // Periodic cleanup
    this.memoryCleanupInterval = setInterval(() => {
      this.performMemoryCleanup();
    }, ANIMATION_CONSTANTS.MEMORY_CLEANUP_INTERVAL);
  }

  setupEventListeners() {
    // Listen for visibility changes to pause animations when tab is not active
    if (typeof document !== 'undefined') {
      document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
          this.pauseAllAnimations();
        } else {
          this.resumeAllAnimations();
        }
      });
    }
  }

  updateAnimationDefaults() {
    const config = AnimationTheme.getAnimationConfig(this.theme);
    this.defaultDuration = config.duration;
    this.defaultEasing = config.easing;
    this.animationsEnabled = config.enabled || this.settings.forceAnimations;
  }

  announceThemeChange() {
    if (this.accessibilityConfig.announceAnimations) {
      this.announce(
        `Animation theme updated: ${this.theme.theme} mode, reduced motion: ${this.reducedMotionMode ? 'on' : 'off'}`
      );
    }
  } // Enhanced animation methods with accessibility and performance
  animate(target, properties, duration = null, options = {}) {
    const startTime =
      this.performanceMonitor.startOperation('create-animation');

    try {
      if (!target || !properties) {
        throw new AnimationError('Invalid animation parameters', {
          target,
          properties,
        });
      }

      // Apply theme-aware defaults
      const actualDuration =
        duration ||
        this.defaultDuration ||
        ANIMATION_CONSTANTS.DEFAULT_DURATION;
      const themeDuration = this.reducedMotionMode
        ? Math.min(actualDuration, ANIMATION_CONSTANTS.REDUCED_MOTION_DURATION)
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
        easing: options.easing || this.defaultEasing || 'easeInOut',
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
        description: options.description || '',

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
        this.estimateAnimationMemory(animation)
      );

      // Accessibility announcement
      if (animation.announceStart && animation.description) {
        this.announce(`Starting animation: ${animation.description}`);
      }

      return animation.id;
    } catch (error) {
      this.handleError(
        new AnimationError(
          'Failed to create animation',
          { target, properties, duration, options },
          error
        )
      );
      return null;
    } finally {
      this.performanceMonitor.endOperation('create-animation', startTime);
    }
  }

  // Tween to specific values
  to(target, properties, duration, options = {}) {
    return this.animate(target, properties, duration, options);
  }

  // Tween from specific values
  from(target, properties, duration, options = {}) {
    // Set the starting values, then animate to current values
    const endValues = {};
    Object.keys(properties).forEach(key => {
      endValues[key] = target[key] || 0;
      target[key] = properties[key];
    });

    return this.animate(target, endValues, duration, options);
  }

  // Timeline management
  createTimeline(options = {}) {
    const timeline = {
      id: ++this.animationId,
      animations: [],
      duration: 0,
      startTime: 0,
      elapsed: 0,
      progress: 0,

      // Options
      repeat: options.repeat || 0,
      yoyo: options.yoyo || false,
      onStart: options.onStart || null,
      onUpdate: options.onUpdate || null,
      onComplete: options.onComplete || null,

      // State
      started: false,
      completed: false,
      paused: false,
    };

    this.timelines.set(timeline.id, timeline);
    return timeline.id;
  }

  // Add animation to timeline
  addToTimeline(
    timelineId,
    target,
    properties,
    duration,
    delay = 0,
    options = {}
  ) {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return null;

    const animation = {
      target,
      properties: this.processProperties(target, properties),
      duration,
      delay,
      easing: options.easing || 'easeInOut',
      onStart: options.onStart || null,
      onUpdate: options.onUpdate || null,
      onComplete: options.onComplete || null,
      started: false,
      completed: false,
    };

    timeline.animations.push(animation);
    timeline.duration = Math.max(timeline.duration, delay + duration);

    return animation;
  }

  // Play timeline
  playTimeline(timelineId) {
    const timeline = this.timelines.get(timelineId);
    if (!timeline) return;

    timeline.startTime = performance.now();
    timeline.started = true;
    timeline.completed = false;

    if (timeline.onStart) {
      timeline.onStart(timeline);
    }
  }

  // Control methods
  pause(animationId) {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.paused = true;
    }
  }

  resume(animationId) {
    const animation = this.animations.get(animationId);
    if (animation && animation.paused) {
      animation.paused = false;
      // Adjust start time to account for pause duration
      const now = performance.now();
      animation.startTime = now - animation.elapsed;
    }
  }

  stop(animationId) {
    const animation = this.animations.get(animationId);
    if (animation) {
      animation.completed = true;
      this.activeAnimations.delete(animationId);
    }
  }

  stopAll() {
    this.activeAnimations.forEach(id => this.stop(id));
  } // Enhanced update method with performance monitoring and error handling
  update(deltaTime) {
    const frameStart =
      this.performanceMonitor.startOperation('animation-update');
    let processedCount = 0;
    let errorCount = 0;

    try {
      // Update active animations with performance monitoring
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
            this.updateAnimation(animation, deltaTime);
            processedCount++;
          } catch (error) {
            errorCount++;
            this.handleAnimationError(animation, error);
          }
        }
      }

      // Update timelines with error handling
      this.timelines.forEach(timeline => {
        if (timeline.started && !timeline.completed && !timeline.paused) {
          try {
            this.updateTimeline(timeline, deltaTime);
          } catch (error) {
            errorCount++;
            this.handleTimelineError(timeline, error);
          }
        }
      });

      // Clean up completed animations
      this.cleanupCompleted();

      // Performance warnings
      const frameTime = performance.now() - frameStart.startTime;
      if (frameTime > this.frameTimeLimit * 2) {
        logger.warn(
          `Animation frame took ${frameTime.toFixed(2)}ms (processed ${processedCount} animations)`
        );
      }
    } catch (error) {
      this.handleError(
        new AnimationError(
          'Animation update failed',
          { processedCount, errorCount },
          error
        )
      );
    } finally {
      this.performanceMonitor.endOperation('animation-update', frameStart);
    }
  }

  updateAnimation(animation, _deltaTime) {
    const now = performance.now();

    try {
      // Handle delay
      if (!animation.started) {
        if (now - animation.startTime >= animation.delay) {
          animation.started = true;
          animation.startTime = now;

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
      animation.elapsed = now - animation.startTime;
      animation.progress = Math.min(
        Math.max(animation.elapsed / animation.duration, 0),
        1
      );

      // Apply easing with error handling
      const easedProgress = this.applyEasing(
        animation.progress,
        animation.easing
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
      throw new AnimationError(
        'Animation update failed',
        { animationId: animation.id },
        error
      );
    }
  }

  updateTimeline(timeline, _deltaTime) {
    const now = performance.now();
    timeline.elapsed = now - timeline.startTime;
    timeline.progress = Math.min(timeline.elapsed / timeline.duration, 1);

    // Update timeline animations
    timeline.animations.forEach(animation => {
      const animationStart = timeline.startTime + animation.delay;
      const animationEnd = animationStart + animation.duration;

      if (
        now >= animationStart &&
        now <= animationEnd &&
        !animation.completed
      ) {
        if (!animation.started) {
          animation.started = true;
          if (animation.onStart) {
            animation.onStart(animation.target, animation);
          }
        }

        const animationProgress = Math.min(
          (now - animationStart) / animation.duration,
          1
        );
        const easedProgress = this.applyEasing(
          animationProgress,
          animation.easing
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
            Object.keys(animation.properties).forEach(key => {
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
              animation
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

  // Enhanced error handling methods
  handleError(error) {
    this.errorCount++;
    this.lastError = error;

    logger.error('AnimationManager Error:', error);

    // Emit error event for application-level handling
    if (this.engine && this.engine.emit) {
      this.engine.emit('animation:error', error);
    }

    // Attempt graceful recovery
    this.attemptErrorRecovery(error);
  }

  handleAnimationError(animation, error) {
    animation.performanceWarnings++;

    if (animation.onError) {
      animation.onError(error, animation);
    } else {
      this.handleError(
        new AnimationError(
          'Animation execution error',
          { animationId: animation.id },
          error
        )
      );
    }

    // Stop problematic animation if too many errors
    if (animation.performanceWarnings > 5) {
      this.stop(animation.id);
      this.announce(
        `Animation stopped due to errors: ${animation.description || 'Unknown animation'}`
      );
    }
  }

  handleTimelineError(timeline, error) {
    logger.warn('Timeline error:', error);
    timeline.completed = true;
  }

  attemptErrorRecovery(error) {
    switch (error.context?.operation) {
      case 'create-animation':
        // Clear any partial animation state
        if (error.context?.animationId) {
          this.stop(error.context.animationId);
        }
        break;
      case 'animation-update':
        // Reduce animation complexity temporarily
        this.maxAnimationsPerFrame = Math.max(
          10,
          this.maxAnimationsPerFrame - 10
        );
        setTimeout(() => {
          this.maxAnimationsPerFrame =
            ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME;
        }, 5000);
        break;
    }
  }

  // Enhanced accessibility methods
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
        this.accessibilityRegion.textContent = '';
      }
    }, 1500);
  }

  // Memory management methods
  estimateAnimationMemory(animation) {
    // Rough estimate of animation memory usage
    const baseSize = 1024; // Base animation object
    const propertySize = Object.keys(animation.properties).length * 128;
    return baseSize + propertySize;
  }

  performMemoryCleanup() {
    // Remove old completed animations from memory
    const cutoffTime = Date.now() - 60000; // 1 minute ago

    this.animations.forEach((animation, id) => {
      if (animation.completed && animation.createdAt < cutoffTime) {
        this.animations.delete(id);
        this.performanceMonitor.releaseMemory(id);
      }
    });

    // Clean old timelines
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

  // Enhanced control methods
  pauseAllAnimations() {
    this.activeAnimations.forEach(id => {
      const animation = this.animations.get(id);
      if (animation) {
        animation.paused = true;
      }
    });

    if (this.accessibilityConfig.announceAnimations) {
      this.announce('All animations paused');
    }
  }

  resumeAllAnimations() {
    const now = performance.now();
    this.activeAnimations.forEach(id => {
      const animation = this.animations.get(id);
      if (animation && animation.paused) {
        animation.paused = false;
        animation.startTime = now - animation.elapsed;
      }
    });

    if (this.accessibilityConfig.announceAnimations) {
      this.announce('All animations resumed');
    }
  }

  // Settings management
  loadSettings() {
    try {
      if (typeof localStorage !== 'undefined') {
        const settings = JSON.parse(
          localStorage.getItem('animationSettings') || '{}'
        );
        return {
          announceAnimations: settings.announceAnimations !== false,
          respectReducedMotion: settings.respectReducedMotion !== false,
          enableKeyboardControls: settings.enableKeyboardControls !== false,
          forceAnimations: settings.forceAnimations || false,
          maxAnimationsPerFrame:
            settings.maxAnimationsPerFrame ||
            ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME,
        };
      }
    } catch (error) {
      logger.warn('Failed to load animation settings:', error);
    }

    return {
      announceAnimations: true,
      respectReducedMotion: true,
      enableKeyboardControls: true,
      forceAnimations: false,
      maxAnimationsPerFrame: ANIMATION_CONSTANTS.MAX_ANIMATIONS_PER_FRAME,
    };
  }

  saveSettings(settings) {
    try {
      if (typeof localStorage !== 'undefined') {
        const currentSettings = this.loadSettings();
        const newSettings = { ...currentSettings, ...settings };
        localStorage.setItem('animationSettings', JSON.stringify(newSettings));
        this.settings = newSettings;
      }
    } catch (error) {
      logger.warn('Failed to save animation settings:', error);
    }
  }

  // Enhanced configuration methods
  setReducedMotionMode(enabled) {
    this.reducedMotionMode = enabled;
    this.settings.respectReducedMotion = enabled;
    this.updateAnimationDefaults();
    this.saveSettings({ respectReducedMotion: enabled });

    if (enabled) {
      // Convert existing animations to reduced motion
      this.activeAnimations.forEach(id => {
        const animation = this.animations.get(id);
        if (animation && !animation.completed) {
          animation.duration = Math.min(
            animation.duration,
            ANIMATION_CONSTANTS.REDUCED_MOTION_DURATION
          );
          animation.easing = 'linear';
        }
      });
    }

    this.announce(`Reduced motion mode ${enabled ? 'enabled' : 'disabled'}`);
  }

  setAccessibilityAnnouncements(enabled) {
    this.accessibilityConfig.announceAnimations = enabled;
    this.saveSettings({ announceAnimations: enabled });
    this.announce(
      `Animation announcements ${enabled ? 'enabled' : 'disabled'}`
    );
  }

  updateProperties(animation, progress) {
    Object.keys(animation.properties).forEach(key => {
      const prop = animation.properties[key];

      if (prop.type === 'number') {
        animation.target[key] = prop.start + (prop.end - prop.start) * progress;
      } else if (prop.type === 'color') {
        animation.target[key] = this.interpolateColor(
          prop.start,
          prop.end,
          progress
        );
      } else if (prop.type === 'transform') {
        animation.target[key] = this.interpolateTransform(
          prop.start,
          prop.end,
          progress
        );
      }
    });
  }

  processProperties(target, properties) {
    const processed = {};

    Object.keys(properties).forEach(key => {
      const endValue = properties[key];
      const startValue = target[key] || 0;

      if (typeof endValue === 'number') {
        processed[key] = {
          type: 'number',
          start: startValue,
          end: endValue,
        };
      } else if (this.isColor(endValue)) {
        processed[key] = {
          type: 'color',
          start: this.parseColor(startValue),
          end: this.parseColor(endValue),
        };
      } else if (
        typeof endValue === 'string' &&
        endValue.includes('transform')
      ) {
        processed[key] = {
          type: 'transform',
          start: startValue,
          end: endValue,
        };
      } else {
        // Fallback to number
        processed[key] = {
          type: 'number',
          start: parseFloat(startValue) || 0,
          end: parseFloat(endValue) || 0,
        };
      }
    });

    return processed;
  }

  // Easing functions
  applyEasing(progress, easingName) {
    const easings = {
      linear: t => t,
      easeIn: t => t * t,
      easeOut: t => t * (2 - t),
      easeInOut: t =>
        t < COMMON.HALF
          ? COMMON.TWO * t * t
          : -1 + (COMMON.FOUR - COMMON.TWO * t) * t,
      easeInCubic: t => t * t * t,
      easeOutCubic: t => --t * t * t + 1,
      easeInOutCubic: t =>
        t < COMMON.HALF
          ? COMMON.FOUR * t * t * t
          : (t - 1) *
              (COMMON.TWO * t - COMMON.TWO) *
              (COMMON.TWO * t - COMMON.TWO) +
            1,
      easeInQuart: t => t * t * t * t,
      easeOutQuart: t => 1 - --t * t * t * t,
      easeInOutQuart: t =>
        t < COMMON.HALF
          ? COMMON.EIGHT * t * t * t * t
          : 1 - COMMON.EIGHT * --t * t * t * t,
      easeInSine: t => 1 - Math.cos((t * Math.PI) / 2),
      easeOutSine: t => Math.sin((t * Math.PI) / 2),
      easeInOutSine: t => -(Math.cos(Math.PI * t) - 1) / 2,
      bounce: t => {
        if (t < 1 / EASING.BOUNCE_C4) return EASING.BOUNCE_C5 * t * t;
        if (t < COMMON.TWO / EASING.BOUNCE_C4)
          return (
            EASING.BOUNCE_C5 *
              (t -= COMMON.ONE_AND_HALF / EASING.BOUNCE_C4) *
              t +
            COMMON.THREE_QUARTERS
          );
        if (t < COMMON.TWO_AND_HALF / EASING.BOUNCE_C4)
          return (
            EASING.BOUNCE_C5 *
              (t -= COMMON.TWO_AND_QUARTER / EASING.BOUNCE_C4) *
              t +
            COMMON.FIFTEEN_SIXTEENTHS
          );
        return (
          EASING.BOUNCE_C5 *
            (t -= COMMON.TWO_AND_FIVE_EIGHTHS / EASING.BOUNCE_C4) *
            t +
          COMMON.SIXTYTHREE_SIXTYFOURTHS
        );
      },
      elastic: t => {
        if (t === 0) return 0;
        if (t === 1) return 1;
        return (
          Math.pow(COMMON.TWO, -COMMON.TEN * t) *
            Math.sin(
              ((t - COMMON.ONE_TENTH) * (COMMON.TWO * Math.PI)) /
                COMMON.OPACITY_40
            ) +
          1
        );
      },
    };

    const easingFunc = easings[easingName] || easings.linear;
    return easingFunc(progress);
  }

  // Color interpolation
  isColor(value) {
    return (
      typeof value === 'string' &&
      (value.startsWith('#') ||
        value.startsWith('rgb') ||
        value.startsWith('hsl'))
    );
  }

  parseColor(color) {
    if (typeof color !== 'string') return { r: 0, g: 0, b: 0, a: 1 };

    // Simple hex color parsing
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      if (hex.length === 3) {
        return {
          r: parseInt(hex[0] + hex[0], 16),
          g: parseInt(hex[1] + hex[1], 16),
          b: parseInt(hex[2] + hex[2], 16),
          a: 1,
        };
      } else if (hex.length === 6) {
        return {
          r: parseInt(hex.slice(0, 2), 16),
          g: parseInt(hex.slice(2, 4), 16),
          b: parseInt(hex.slice(4, 6), 16),
          a: 1,
        };
      }
    }

    // RGB parsing would go here
    return { r: 0, g: 0, b: 0, a: 1 };
  }

  interpolateColor(start, end, progress) {
    const r = Math.round(start.r + (end.r - start.r) * progress);
    const g = Math.round(start.g + (end.g - start.g) * progress);
    const b = Math.round(start.b + (end.b - start.b) * progress);
    const a = start.a + (end.a - start.a) * progress;

    return `rgba(${r}, ${g}, ${b}, ${a})`;
  }

  interpolateTransform(start, end, progress) {
    // Basic transform interpolation
    // In a real implementation, this would parse and interpolate transform strings
    return progress < 0.5 ? start : end;
  }

  // Utility methods
  cleanupCompleted() {
    const toDelete = [];

    this.animations.forEach((animation, id) => {
      if (animation.completed) {
        toDelete.push(id);
      }
    });

    toDelete.forEach(id => {
      this.animations.delete(id);
      this.activeAnimations.delete(id);
    });

    // Clean up completed timelines
    const timelinesToDelete = [];
    this.timelines.forEach((timeline, id) => {
      if (timeline.completed) {
        timelinesToDelete.push(id);
      }
    });

    timelinesToDelete.forEach(id => {
      this.timelines.delete(id);
    });
  }

  getActiveAnimationCount() {
    return this.activeAnimations.size;
  }

  getActiveTimelineCount() {
    return Array.from(this.timelines.values()).filter(
      t => t.started && !t.completed
    ).length;
  } // Enhanced preset animations with accessibility
  fadeIn(target, duration = null, options = {}) {
    const actualDuration = duration || this.defaultDuration;
    target.opacity = target.opacity || 0;

    return this.to(target, { opacity: 1 }, actualDuration, {
      ...options,
      description: options.description || 'Fade in animation',
      announceComplete: options.announceComplete || false,
    });
  }

  fadeOut(target, duration = null, options = {}) {
    const actualDuration = duration || this.defaultDuration;

    return this.to(target, { opacity: 0 }, actualDuration, {
      ...options,
      description: options.description || 'Fade out animation',
      announceComplete: options.announceComplete || false,
    });
  }

  slideIn(
    target,
    direction = 'left',
    distance = 100,
    duration = null,
    options = {}
  ) {
    const actualDuration = duration || this.defaultDuration;
    const startPos =
      direction === 'left'
        ? -distance
        : direction === 'right'
          ? distance
          : direction === 'up'
            ? -distance
            : distance;

    const property = direction === 'left' || direction === 'right' ? 'x' : 'y';
    const endPos = target[property] || 0;

    target[property] = startPos;

    return this.to(target, { [property]: endPos }, actualDuration, {
      ...options,
      description: options.description || `Slide in from ${direction}`,
      easing: options.easing || 'easeOutCubic',
    });
  }

  scale(target, scale = 1.2, duration = null, options = {}) {
    const actualDuration = duration || this.defaultDuration * 0.8; // Slightly faster for scale
    const originalScale = target.scale || 1;

    return this.to(target, { scale }, actualDuration, {
      ...options,
      yoyo: true,
      description: options.description || 'Scale animation',
      onComplete: () => {
        target.scale = originalScale;
        if (options.onComplete) options.onComplete();
      },
    });
  }

  shake(target, intensity = 5, duration = null, options = {}) {
    const actualDuration = duration || this.defaultDuration;
    const originalX = target.x || 0;
    const shakeCount = this.reducedMotionMode ? 3 : 10; // Fewer shakes for reduced motion
    const shakeDistance = this.reducedMotionMode
      ? Math.min(intensity, 2)
      : intensity;

    const timeline = this.createTimeline({
      ...options,
      description: options.description || 'Shake animation',
    });

    for (let i = 0; i < shakeCount; i++) {
      const direction = i % 2 === 0 ? 1 : -1;
      const x = originalX + direction * shakeDistance;

      this.addToTimeline(
        timeline,
        target,
        { x },
        actualDuration / shakeCount,
        i * (actualDuration / shakeCount)
      );
    }

    // Return to original position
    this.addToTimeline(
      timeline,
      target,
      { x: originalX },
      actualDuration / shakeCount,
      actualDuration - actualDuration / shakeCount
    );

    this.playTimeline(timeline);
    return timeline;
  }

  // New accessibility-focused animations
  focusHighlight(target, duration = null, options = {}) {
    const actualDuration = duration || this.defaultDuration * 0.5;

    if (this.theme.highContrast) {
      // High contrast focus animation
      return this.to(
        target,
        {
          borderWidth: 3,
          borderColor: '#ffff00',
        },
        actualDuration,
        {
          ...options,
          description: 'Focus highlight animation',
          yoyo: true,
        }
      );
    } else {
      // Standard focus animation
      return this.to(
        target,
        {
          scale: 1.05,
          boxShadow: '0 0 10px rgba(0, 123, 255, 0.5)',
        },
        actualDuration,
        {
          ...options,
          description: 'Focus highlight animation',
          yoyo: true,
          easing: 'easeInOut',
        }
      );
    }
  }

  slideReveal(target, direction = 'down', duration = null, options = {}) {
    const actualDuration = duration || this.defaultDuration;
    const property =
      direction === 'down' || direction === 'up' ? 'height' : 'width';
    const from = 0;
    const to =
      target[
        `original${property.charAt(0).toUpperCase() + property.slice(1)}`
      ] ||
      target[property] ||
      100;

    target[property] = from;
    target.overflow = 'hidden';

    return this.to(target, { [property]: to }, actualDuration, {
      ...options,
      description: options.description || `Slide reveal ${direction}`,
      easing: 'easeOutCubic',
      onComplete: () => {
        target.overflow = 'visible';
        if (options.onComplete) options.onComplete();
      },
    });
  }

  // Touch/gesture animation support
  createGestureAnimation(target, gestureType, options = {}) {
    const gestureAnimations = {
      swipeLeft: () => this.slideIn(target, 'left', 50, null, options),
      swipeRight: () => this.slideIn(target, 'right', 50, null, options),
      swipeUp: () => this.slideIn(target, 'up', 50, null, options),
      swipeDown: () => this.slideIn(target, 'down', 50, null, options),
      pinchIn: () => this.scale(target, 0.8, null, options),
      pinchOut: () => this.scale(target, 1.2, null, options),
      tap: () => this.focusHighlight(target, null, options),
    };

    const animationFunc = gestureAnimations[gestureType];
    if (animationFunc) {
      const animationId = animationFunc();
      this.gestureAnimations.set(target, animationId);
      return animationId;
    }

    return null;
  }

  // Enhanced accessibility reporting
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

  // Performance and diagnostic methods
  getPerformanceReport() {
    const metrics = this.performanceMonitor.getMetrics();
    const activeCount = this.activeAnimations.size;
    const timelineCount = this.getActiveTimelineCount();

    return {
      activeAnimations: activeCount,
      activeTimelines: timelineCount,
      framePerformance: {
        averageFrameTime:
          metrics.operations['animation-update']?.averageDuration || 0,
        lastFrameTime:
          metrics.operations['animation-update']?.lastDuration || 0,
        frameTimeLimit: this.frameTimeLimit,
        maxAnimationsPerFrame: this.maxAnimationsPerFrame,
      },
      memory: metrics.memory,
      errors: this.errorCount,
      reducedMotionMode: this.reducedMotionMode,
      theme: this.theme.theme,
    };
  } // Enhanced cleanup with comprehensive resource management
  destroy() {
    const startTime =
      this.performanceMonitor.startOperation('animation-cleanup');

    try {
      // Stop all animations gracefully
      this.stopAll();

      // Clean up event listeners
      this.removeEventListeners();

      // Clean up accessibility resources
      this.cleanupAccessibilityFeatures();

      // Clear memory tracking
      this.performanceMonitor.memoryTracker.clear();

      // Clear intervals
      if (this.memoryCleanupInterval) {
        clearInterval(this.memoryCleanupInterval);
        this.memoryCleanupInterval = null;
      }

      // Clear data structures
      this.animations.clear();
      this.timelines.clear();
      this.activeAnimations.clear();
      this.gestureAnimations.clear();
      this.renderCache.clear();
      this.announcements = [];

      // Save final settings
      this.saveSettings(this.settings);

      logger.info('Enhanced AnimationManager destroyed successfully');
    } catch (error) {
      logger.error('Error during AnimationManager cleanup:', error);
    } finally {
      this.performanceMonitor.endOperation('animation-cleanup', startTime);
    }
  }

  removeEventListeners() {
    try {
      if (this.themeListeners) {
        const { reducedMotionQuery, contrastQuery, updateTheme } =
          this.themeListeners;

        if (reducedMotionQuery.removeEventListener) {
          reducedMotionQuery.removeEventListener('change', updateTheme);
          contrastQuery.removeEventListener('change', updateTheme);
        }
      }

      // Remove document event listeners
      if (typeof document !== 'undefined') {
        document.removeEventListener(
          'visibilitychange',
          this.handleVisibilityChange
        );
      }
    } catch (error) {
      logger.warn('Event listener cleanup failed:', error);
    }
  }

  cleanupAccessibilityFeatures() {
    try {
      // Remove accessibility region
      if (this.accessibilityRegion && this.accessibilityRegion.parentNode) {
        this.accessibilityRegion.parentNode.removeChild(
          this.accessibilityRegion
        );
      }
    } catch (error) {
      logger.warn('Accessibility cleanup failed:', error);
    }
  }
}

// Static utility methods for global animation operations
AnimationManager.createGlobalStyles = function () {
  if (
    typeof document === 'undefined' ||
    document.getElementById('animation-manager-styles')
  )
    return;

  const styleSheet = document.createElement('style');
  styleSheet.id = 'animation-manager-styles';
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
};

AnimationManager.detectAnimationSupport = function () {
  if (typeof window === 'undefined') return false;

  const testElement = document.createElement('div');
  const animationProps = [
    'animation',
    'webkitAnimation',
    'mozAnimation',
    'oAnimation',
    'msAnimation',
  ];

  return animationProps.some(prop => prop in testElement.style);
};

AnimationManager.getSystemAnimationPreferences = function () {
  if (typeof window === 'undefined') return {};

  return {
    reducedMotion:
      window.matchMedia?.('(prefers-reduced-motion: reduce)').matches || false,
    highContrast:
      window.matchMedia?.('(prefers-contrast: high)').matches || false,
    animationSupport: this.detectAnimationSupport(),
  };
};

// Initialize global styles when module loads
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') {
    document.addEventListener(
      'DOMContentLoaded',
      AnimationManager.createGlobalStyles
    );
  } else {
    AnimationManager.createGlobalStyles();
  }
}

export default AnimationManager;
