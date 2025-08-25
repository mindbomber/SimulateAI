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
 * AccessibilityManager - Enhanced accessibility features for simulations
 * Modern implementation with theme support, performance optimization, and advanced features
 *
 * Features:
 * - WCAG 2.1 AA compliance
 * - Dark mode and theme integration
 * - Performance monitoring
 * - Advanced error handling
 * - Animation management
 * - Touch/gesture support
 * - RTL language support
 *
 * @version 2.0.0
 * @author SimulateAI Team
 */

import logger from "../utils/logger.js";

// Enhanced constants and configuration
const ACCESSIBILITY_CONSTANTS = {
  ANNOUNCEMENT_DELAY: 100,
  FOCUS_DELAY: 16,
  KEYBOARD_REPEAT_DELAY: 200,
  ANIMATION_DURATION: 250,
  HIGH_CONTRAST_THRESHOLD: 4.5,
  TOUCH_TARGET_MIN_SIZE: 44,

  // Screen reader adaptation
  SCREEN_READER_DELAY_MULTIPLIER: 1.5,

  // Performance and timing
  FEATURE_DISABLE_TIMEOUT: 30000,
  FOCUS_HISTORY_LIMIT: 50,
  ANNOUNCEMENT_TIMEOUT: 2000,
  ANNOUNCEMENT_CLEAR_DELAY: 1500,
  ANNOUNCEMENT_MIN_DURATION: 1000,
  ANNOUNCEMENT_CHAR_MULTIPLIER: 50,
  GESTURE_TIMEOUT: 5000,

  // Focus indicator dimensions
  FOCUS_BORDER_OFFSET: 3,
  FOCUS_BORDER_PADDING: 6,

  // Ethics and performance thresholds
  ETHICS_SIGNIFICANT_CHANGE: 20,
  ETHICS_HIGH_PRIORITY: 15,
  PERFORMANCE_EXCELLENT: 90,
  PERFORMANCE_GOOD: 75,
  PERFORMANCE_SATISFACTORY: 60,
};

const SCREEN_READER_PATTERNS = {
  NVDA: /nvda/i,
  JAWS: /jaws/i,
  VOICEOVER: /voiceover/i,
  NARRATOR: /narrator/i,
  DRAGON: /dragon/i,
};

/**
 * Enhanced theme management for accessibility features
 */
class AccessibilityTheme {
  static getCurrentTheme() {
    const prefersHighContrast = window.matchMedia?.(
      "(prefers-contrast: high)",
    ).matches;
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    return {
      highContrast: prefersHighContrast,
      reducedMotion: prefersReducedMotion,
      theme: prefersHighContrast ? "highContrast" : "light",
    };
  }

  static getFocusStyle(theme = null) {
    const currentTheme = theme || this.getCurrentTheme();

    if (currentTheme.highContrast) {
      return {
        outline: "3px solid #ffff00",
        outlineOffset: "2px",
        backgroundColor: "transparent",
      };
    }

    return {
      outline: "2px solid #007bff",
      outlineOffset: "2px",
      backgroundColor: "rgba(0, 123, 255, 0.1)",
    };
  }
}

/**
 * Performance monitoring for accessibility operations
 */
class AccessibilityPerformanceMonitor {
  static metrics = new Map();

  static startOperation(operationName) {
    const startTime = performance.now();
    this.metrics.set(operationName, { startTime, operations: 0 });
    return startTime;
  }

  static endOperation(operationName, startTime = null) {
    const endTime = performance.now();
    const metric = this.metrics.get(operationName);

    if (metric) {
      const duration = endTime - (startTime || metric.startTime);
      metric.operations += 1;
      metric.lastDuration = duration;
      metric.averageDuration =
        ((metric.averageDuration || 0) * (metric.operations - 1) + duration) /
        metric.operations;

      // Performance warning for slow accessibility operations
      if (duration > ACCESSIBILITY_CONSTANTS.FOCUS_DELAY * 2) {
        logger.warn(
          `Slow accessibility operation: ${operationName} took ${duration.toFixed(2)}ms`,
        );
      }
    }
  }

  static getMetrics() {
    return Object.fromEntries(this.metrics);
  }
}

/**
 * Enhanced error handling for accessibility operations
 */
class AccessibilityError extends Error {
  constructor(message, context = {}, originalError = null) {
    super(message);
    this.name = "AccessibilityError";
    this.context = context;
    this.originalError = originalError;
    this.timestamp = new Date().toISOString();
    this.userAgent = navigator.userAgent;
    this.screenReader = AccessibilityManager.detectScreenReaderType();
  }
}

class AccessibilityManager {
  constructor(container, engine) {
    this.container = container;
    this.engine = engine;
    this.components = new Map();
    this.focusableElements = [];
    this.currentFocusIndex = -1;
    this.keyboardNavigationEnabled = true;
    this.screenReaderEnabled = this.detectScreenReader();

    // Enhanced state management
    this.announcements = [];
    this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY;
    this.theme = AccessibilityTheme.getCurrentTheme();
    this.isHighContrastMode = this.theme.highContrast;

    // Performance monitoring
    this.performanceMonitor = AccessibilityPerformanceMonitor;

    // Advanced features
    this.gestureHandler = null;
    this.voiceCommands = new Map();
    this.keyboardShortcuts = new Map();
    this.focusHistory = [];
    this.regionManager = new Map();

    // Error handling
    this.errorCount = 0;
    this.lastError = null;

    // Performance optimizations
    this.cachedContainerRect = null;
    this.needsContainerRectUpdate = true;

    // Setup resize observer to invalidate container rect cache
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(() => {
        this.needsContainerRectUpdate = true;
      });
      this.resizeObserver.observe(this.container);
    }

    this.init();
  }

  init() {
    const startTime =
      this.performanceMonitor.startOperation("accessibility-init");

    try {
      this.setupContainer();
      this.setupKeyboardNavigation();
      this.setupScreenReaderSupport();
      this.setupFocusManagement();
      this.setupThemeIntegration();
      this.setupGestureSupport();
      this.createAccessibilityOverlay();
      this.setupPerformanceMonitoring();

      // Listen for theme changes
      this.setupThemeChangeListeners();

      // Setup voice commands if supported
      this.setupVoiceCommands();

      logger.info(
        "Accessibility",
        "Enhanced AccessibilityManager initialized with advanced features",
      );
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Failed to initialize AccessibilityManager",
          { container: this.container.id },
          error,
        ),
      );
    } finally {
      this.performanceMonitor.endOperation("accessibility-init", startTime);
    }
  }

  /**
   * Utility method to set multiple attributes efficiently
   */
  setElementAttributes(element, attributes) {
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value);
      }
    });
  }

  setupContainer() {
    // Enhanced container setup with theme awareness
    const containerAttributes = {};

    if (!this.container.hasAttribute("tabindex")) {
      containerAttributes.tabindex = "0";
    }

    if (!this.container.hasAttribute("role")) {
      containerAttributes.role = "application";
    }

    if (!this.container.hasAttribute("aria-label")) {
      containerAttributes["aria-label"] = "AI Ethics Simulation Environment";
    }

    // Enhanced accessibility attributes
    containerAttributes["aria-describedby"] = "accessibility-description";
    containerAttributes["aria-live"] = "polite";
    containerAttributes["aria-atomic"] = "false";

    // Apply all attributes at once
    this.setElementAttributes(this.container, containerAttributes);

    // Theme-aware classes
    this.container.classList.add("accessibility-enabled");
    this.updateContainerTheme();

    // Create accessibility description
    this.createAccessibilityDescription();
  }

  createAccessibilityDescription() {
    if (document.getElementById("accessibility-description")) return;

    const description = document.createElement("div");
    description.id = "accessibility-description";
    description.className = "sr-only";
    description.textContent =
      "Interactive AI ethics simulation with keyboard navigation, screen reader support, and voice commands. Press ? for help.";
    document.body.appendChild(description);
  }

  /**
   * Centralized method to update theme-related CSS classes
   */
  updateThemeClasses(element = this.container, options = {}) {
    const updates = {
      "high-contrast": options.highContrast ?? this.theme.highContrast,
      "reduced-motion": options.reducedMotion ?? this.theme.reducedMotion,
      "accessibility-enabled": true,
    };

    Object.entries(updates).forEach(([className, shouldAdd]) => {
      element.classList.toggle(className, shouldAdd);
    });
  }

  updateContainerTheme() {
    // Use centralized theme class updates
    this.updateThemeClasses();

    // Batch CSS custom properties update for better performance
    const focusColor = this.theme.highContrast ? "#ffff00" : "#007bff";
    const bgColor = this.theme.highContrast ? "#000000" : "#ffffff";

    // Use cssText for batched custom property updates
    const existingStyle = this.container.getAttribute("style") || "";
    const customPropertiesStyle = `
      --accessibility-focus-color: ${focusColor};
      --accessibility-bg-color: ${bgColor};
    `;

    // Combine existing styles with new custom properties
    this.container.style.cssText = existingStyle + customPropertiesStyle;
  }

  /**
   * Centralized error handling with consistent logging and context
   */
  handleAccessibilityError(operation, error, context = {}) {
    const errorContext = {
      operation,
      timestamp: new Date().toISOString(),
      userAgent: navigator.userAgent,
      screenReader: this.screenReaderEnabled,
      ...context,
    };

    // Log error with context
    console.error(`Accessibility Error in ${operation}:`, error, errorContext);

    // Create accessibility-specific error
    const accessibilityError = new AccessibilityError(
      `Failed to execute ${operation}`,
      errorContext,
      error,
    );

    // Announce error to screen readers if appropriate
    if (this.screenReaderEnabled && !context.silent) {
      this.announce(`Error in ${operation}. Please try again.`, true);
    }

    return accessibilityError;
  }

  /**
   * Performance monitoring decorator to reduce repetitive performance tracking
   */
  withPerformanceMonitoring(operationName, fn, context = {}) {
    return (...args) => {
      const startTime = this.performanceMonitor.startOperation(operationName);

      try {
        const result = fn.apply(this, args);

        // Handle both sync and async operations
        if (result && typeof result.then === "function") {
          return result
            .then((value) => {
              this.performanceMonitor.endOperation(operationName, startTime);
              return value;
            })
            .catch((error) => {
              this.performanceMonitor.endOperation(operationName, startTime);
              throw this.handleAccessibilityError(
                operationName,
                error,
                context,
              );
            });
        } else {
          this.performanceMonitor.endOperation(operationName, startTime);
          return result;
        }
      } catch (error) {
        this.performanceMonitor.endOperation(operationName, startTime);
        throw this.handleAccessibilityError(operationName, error, context);
      }
    };
  }

  setupThemeIntegration() {
    // Apply theme-specific accessibility enhancements
    this.applyThemeSpecificStyles();

    // Setup automatic theme detection
    this.observeThemeChanges();
  }

  applyThemeSpecificStyles() {
    const focusStyle = AccessibilityTheme.getFocusStyle(this.theme);

    // Create or update focus style sheet
    let styleSheet = document.getElementById("accessibility-focus-styles");
    if (!styleSheet) {
      styleSheet = document.createElement("style");
      styleSheet.id = "accessibility-focus-styles";
      document.head.appendChild(styleSheet);
    }

    styleSheet.textContent = `
            .accessibility-enabled *:focus {
                outline: ${focusStyle.outline} !important;
                outline-offset: ${focusStyle.outlineOffset} !important;
                background-color: ${focusStyle.backgroundColor} !important;
            }
            
            .accessibility-enabled .focus-indicator {
                border: 3px solid ${this.theme.highContrast ? "#ffff00" : "#007bff"};
                box-shadow: ${this.theme.highContrast ? "none" : "0 0 0 1px white"};
            }
            
            .accessibility-enabled .high-contrast {
                filter: ${this.theme.highContrast ? "contrast(200%) brightness(150%)" : "none"};
            }
        `;
  }

  observeThemeChanges() {
    // Watch for system theme changes
    const contrastQuery = window.matchMedia("(prefers-contrast: high)");
    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

    const updateTheme = () => {
      this.theme = AccessibilityTheme.getCurrentTheme();
      this.updateContainerTheme();
      this.applyThemeSpecificStyles();
      this.updateFocusIndicatorTheme();
      this.announce(`Theme updated: ${this.theme.theme} mode`);
    };

    if (contrastQuery.addEventListener) {
      contrastQuery.addEventListener("change", updateTheme);
      motionQuery.addEventListener("change", updateTheme);
    } else {
      // Fallback for older browsers
      contrastQuery.addListener(updateTheme);
      motionQuery.addListener(updateTheme);
    }
  }

  setupThemeChangeListeners() {
    // Custom theme change events
    document.addEventListener("themechange", (event) => {
      this.theme = AccessibilityTheme.getCurrentTheme();
      this.updateContainerTheme();
      this.applyThemeSpecificStyles();
      this.announce(`Application theme changed to ${event.detail.theme}`);
    });
  }

  setupGestureSupport() {
    if (!("ontouchstart" in window)) return;

    this.gestureHandler = {
      startX: 0,
      startY: 0,
      threshold: 50,
      restraint: 100,
      allowedTime: 300,
      startTime: 0,
    };

    this.container.addEventListener(
      "touchstart",
      (e) => this.handleTouchStart(e),
      { passive: true },
    );
    this.container.addEventListener("touchend", (e) => this.handleTouchEnd(e), {
      passive: true,
    });
  }

  handleTouchStart(e) {
    const touch = e.changedTouches[0];
    this.gestureHandler.startX = touch.pageX;
    this.gestureHandler.startY = touch.pageY;
    this.gestureHandler.startTime = new Date().getTime();
  }

  handleTouchEnd(e) {
    const touch = e.changedTouches[0];
    const distX = touch.pageX - this.gestureHandler.startX;
    const distY = touch.pageY - this.gestureHandler.startY;
    const elapsedTime = new Date().getTime() - this.gestureHandler.startTime;

    if (elapsedTime <= this.gestureHandler.allowedTime) {
      if (
        Math.abs(distX) >= this.gestureHandler.threshold &&
        Math.abs(distY) <= this.gestureHandler.restraint
      ) {
        const direction = distX < 0 ? "left" : "right";
        this.handleSwipeGesture(direction);
      } else if (
        Math.abs(distY) >= this.gestureHandler.threshold &&
        Math.abs(distX) <= this.gestureHandler.restraint
      ) {
        const direction = distY < 0 ? "up" : "down";
        this.handleSwipeGesture(direction);
      }
    }
  }

  handleSwipeGesture(direction) {
    switch (direction) {
      case "right":
        this.handleTabNavigation(false);
        this.announce("Swiped to next element");
        break;
      case "left":
        this.handleTabNavigation(true);
        this.announce("Swiped to previous element");
        break;
      case "up":
        this.cycleFocusRegions(-1);
        break;
      case "down":
        this.cycleFocusRegions(1);
        break;
    }
  }

  setupVoiceCommands() {
    if (
      !("webkitSpeechRecognition" in window) &&
      !("SpeechRecognition" in window)
    ) {
      return; // Voice commands not supported
    }

    try {
      const SpeechRecognition =
        window.SpeechRecognition || window.webkitSpeechRecognition;
      this.speechRecognition = new SpeechRecognition();
      this.speechRecognition.continuous = false;
      this.speechRecognition.interimResults = false;
      this.speechRecognition.lang = navigator.language || "en-US";

      this.setupVoiceCommandMap();

      this.speechRecognition.onresult = (event) => {
        const command = event.results[0][0].transcript.toLowerCase().trim();
        this.processVoiceCommand(command);
      };

      this.speechRecognition.onerror = (event) => {
        logger.warn("Speech recognition error:", event.error);
      };
    } catch (error) {
      logger.warn("Voice commands setup failed:", error);
    }
  }

  setupVoiceCommandMap() {
    this.voiceCommands.set("next", () => this.handleTabNavigation(false));
    this.voiceCommands.set("previous", () => this.handleTabNavigation(true));
    this.voiceCommands.set("activate", () => this.activateCurrentElement());
    this.voiceCommands.set("help", () => this.showKeyboardShortcuts());
    this.voiceCommands.set("escape", () => this.handleEscape());
    this.voiceCommands.set("high contrast", () =>
      this.toggleHighContrastMode(),
    );
    this.voiceCommands.set("large text", () => this.toggleLargeTextMode());
  }

  processVoiceCommand(command) {
    for (const [trigger, action] of this.voiceCommands) {
      if (command.includes(trigger)) {
        action();
        this.announce(`Voice command executed: ${trigger}`);
        return;
      }
    }

    this.announce(
      'Voice command not recognized. Say "help" for available commands.',
    );
  }

  setupPerformanceMonitoring() {
    // Monitor focus performance
    let focusOperations = 0;
    const originalFocus = this.focusComponent;

    this.focusComponent = (...args) => {
      const startTime =
        this.performanceMonitor.startOperation("focus-component");
      const result = originalFocus.apply(this, args);
      this.performanceMonitor.endOperation("focus-component", startTime);

      focusOperations++;
      if (focusOperations % 100 === 0) {
        logger.info(
          "Accessibility Performance:",
          this.performanceMonitor.getMetrics(),
        );
      }

      return result;
    };
  }

  setupKeyboardNavigation() {
    // Enhanced keyboard event handling with performance optimization
    const throttledKeyDown = this.throttle(
      (e) => this.handleKeyDown(e),
      ACCESSIBILITY_CONSTANTS.KEYBOARD_REPEAT_DELAY,
    );

    this.container.addEventListener("keydown", throttledKeyDown);
    this.container.addEventListener("keyup", (e) => this.handleKeyUp(e));

    // Enhanced focus management
    this.container.addEventListener("focus", () => this.onContainerFocus());
    this.container.addEventListener("blur", () => this.onContainerBlur());

    // Setup advanced keyboard shortcuts
    this.setupKeyboardShortcuts();
  }

  setupKeyboardShortcuts() {
    this.keyboardShortcuts.set("ctrl+shift+?", () =>
      this.showKeyboardShortcuts(),
    );
    this.keyboardShortcuts.set("ctrl+shift+h", () =>
      this.toggleHighContrastMode(),
    );
    this.keyboardShortcuts.set("ctrl+shift+l", () =>
      this.toggleLargeTextMode(),
    );
    this.keyboardShortcuts.set("ctrl+shift+v", () =>
      this.toggleVoiceCommands(),
    );
    this.keyboardShortcuts.set("ctrl+shift+r", () =>
      this.resetAccessibilitySettings(),
    );
    this.keyboardShortcuts.set("ctrl+shift+f", () =>
      this.showAccessibilityReport(),
    );
  }

  toggleVoiceCommands() {
    if (this.speechRecognition) {
      if (this.voiceCommandsEnabled) {
        this.speechRecognition.stop();
        this.voiceCommandsEnabled = false;
        this.announce("Voice commands disabled");
      } else {
        this.speechRecognition.start();
        this.voiceCommandsEnabled = true;
        this.announce(
          'Voice commands enabled. Say "help" for available commands.',
        );
      }
    } else {
      this.announce("Voice commands not supported in this browser");
    }
  }

  showAccessibilityReport() {
    const metrics = this.performanceMonitor.getMetrics();
    const componentCount = this.components.size;
    const focusableCount = this.focusableElements.length;

    const report = `
            Accessibility Report:
            - ${componentCount} registered components
            - ${focusableCount} focusable elements
            - Theme: ${this.theme.theme}
            - High contrast: ${this.theme.highContrast ? "enabled" : "disabled"}
            - Reduced motion: ${this.theme.reducedMotion ? "enabled" : "disabled"}
            - Screen reader: ${this.screenReaderEnabled ? "detected" : "not detected"}
            - Voice commands: ${this.voiceCommandsEnabled ? "available" : "not available"}
            - Performance: ${Object.keys(metrics).length} tracked operations
        `;

    this.announce(report, true);
    logger.info("Accessibility Report:", {
      metrics,
      theme: this.theme,
      components: componentCount,
    });
  }

  resetAccessibilitySettings() {
    this.setHighContrastMode(false);
    this.setLargeTextMode(false);
    this.setKeyboardNavigationEnabled(true);

    if (this.speechRecognition && this.voiceCommandsEnabled) {
      this.speechRecognition.stop();
      this.voiceCommandsEnabled = false;
    }
    this.announce("Accessibility settings reset to defaults");
  }

  setupScreenReaderSupport() {
    // Enhanced screen reader support with multiple announcement regions
    this.createAnnouncementRegions();
    this.setupScreenReaderDetection();
  }

  createAnnouncementRegions() {
    // Use DocumentFragment for batched DOM insertion - reduces reflows from 4 to 1
    const fragment = document.createDocumentFragment();

    // Primary announcement region (polite)
    this.liveRegion = this.createAnnouncementRegion(
      "polite",
      "accessibility-announcements",
      fragment,
    );

    // Urgent announcements region (assertive)
    this.urgentRegion = this.createAnnouncementRegion(
      "assertive",
      "accessibility-urgent",
      fragment,
    );

    // Status region for ongoing updates
    this.statusRegion = this.createAnnouncementRegion(
      "polite",
      "accessibility-status",
      fragment,
    );
    this.statusRegion.setAttribute("aria-atomic", "false");

    // Log region for detailed information
    this.logRegion = this.createAnnouncementRegion(
      "polite",
      "accessibility-log",
      fragment,
    );
    this.logRegion.setAttribute("role", "log");

    // Single DOM insertion instead of 4 separate appendChild calls
    document.body.appendChild(fragment);
  }

  createAnnouncementRegion(liveType, id, parentFragment = null) {
    if (document.getElementById(id)) {
      return document.getElementById(id);
    }

    const region = document.createElement("div");

    // Batch attribute setting using setElementAttributes
    this.setElementAttributes(region, {
      id: id,
      "aria-live": liveType,
      "aria-atomic": "true",
      class: "sr-only",
    });

    region.style.cssText = `
            position: absolute !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip: rect(1px, 1px, 1px, 1px) !important;
            white-space: nowrap !important;
        `;

    // Append to fragment if provided, otherwise append to body
    if (parentFragment) {
      parentFragment.appendChild(region);
    } else {
      document.body.appendChild(region);
    }

    return region;
  }

  setupScreenReaderDetection() {
    // Enhanced screen reader detection
    this.screenReaderType = this.detectScreenReaderType();
    this.screenReaderEnabled = this.screenReaderType !== null;

    // Customize behavior based on detected screen reader
    if (this.screenReaderType) {
      this.adaptToScreenReader(this.screenReaderType);
    }
  }

  detectScreenReaderType() {
    const { userAgent } = navigator;

    for (const [type, pattern] of Object.entries(SCREEN_READER_PATTERNS)) {
      if (pattern.test(userAgent)) {
        return type.toLowerCase();
      }
    }

    // Check for screen reader APIs
    if (
      window.speechSynthesis &&
      window.speechSynthesis.getVoices().length > 0
    ) {
      return "speech-synthesis";
    }

    // Check for high contrast as screen reader indicator
    if (
      window.matchMedia &&
      window.matchMedia("(prefers-contrast: high)").matches
    ) {
      return "high-contrast-user";
    }

    return null;
  }

  adaptToScreenReader(screenReaderType) {
    switch (screenReaderType) {
      case "nvda":
      case "jaws":
        // Optimize for Windows screen readers
        this.announcementDelay =
          ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY *
          ACCESSIBILITY_CONSTANTS.SCREEN_READER_DELAY_MULTIPLIER;
        this.verboseMode = true;
        break;
      case "voiceover":
        // Optimize for macOS VoiceOver
        this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY;
        this.verboseMode = false;
        break;
      case "narrator":
        // Optimize for Windows Narrator
        this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY * 2;
        this.verboseMode = true;
        break;
      default:
        this.verboseMode = false;
    }

    logger.info(
      `Accessibility optimized for ${screenReaderType} screen reader`,
    );
  }

  setupFocusManagement() {
    // Track focus changes
    document.addEventListener("focusin", (e) => this.onFocusChange(e));
    document.addEventListener("focusout", (e) => this.onFocusChange(e));
  }

  createAccessibilityOverlay() {
    // Enhanced accessibility overlay with modern features
    this.overlay = document.createElement("div");
    this.overlay.className = "accessibility-overlay";
    this.overlay.setAttribute("aria-hidden", "true");
    this.overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 10000;
            contain: layout style;
        `;

    this.container.appendChild(this.overlay);

    // Enhanced focus indicator with theme support
    this.createFocusIndicator();

    // Create accessibility toolbar
    this.createAccessibilityToolbar();
  }

  createFocusIndicator() {
    this.focusIndicator = document.createElement("div");
    this.focusIndicator.className = "focus-indicator";
    this.focusIndicator.setAttribute("aria-hidden", "true");
    this.updateFocusIndicatorTheme();

    this.overlay.appendChild(this.focusIndicator);
  }

  updateFocusIndicatorTheme() {
    if (!this.focusIndicator) return;

    this.focusIndicator.style.cssText = `
            position: absolute;
            border: 3px solid ${this.theme.highContrast ? "#ffff00" : "#007bff"};
            border-radius: 4px;
            box-shadow: ${this.theme.highContrast ? "none" : "0 0 0 1px white, 0 0 8px rgba(0, 123, 255, 0.3)"};
            pointer-events: none;
            transition: ${this.theme.reducedMotion ? "none" : "all 0.2s ease"};
            display: none;
            z-index: 10001;
        `;
  }

  createAccessibilityToolbar() {
    if (!this.theme.highContrast) return;

    this.accessibilityToolbar = document.createElement("div");

    // Batch toolbar attributes
    this.setElementAttributes(this.accessibilityToolbar, {
      class: "accessibility-toolbar",
      role: "toolbar",
      "aria-label": "Accessibility Tools",
    });

    const toolbarButtons = [
      {
        id: "high-contrast",
        label: "Toggle High Contrast",
        action: () => this.toggleHighContrastMode(),
      },
      {
        id: "large-text",
        label: "Toggle Large Text",
        action: () => this.toggleLargeTextMode(),
      },
      {
        id: "keyboard-help",
        label: "Show Keyboard Help",
        action: () => this.showKeyboardShortcuts(),
      },
      {
        id: "voice-commands",
        label: "Toggle Voice Commands",
        action: () => this.toggleVoiceCommands(),
      },
    ];

    // Use DocumentFragment for batched button insertion
    const buttonFragment = document.createDocumentFragment();

    toolbarButtons.forEach((button) => {
      const btn = document.createElement("button");

      // Batch button attributes
      this.setElementAttributes(btn, {
        id: button.id,
        "aria-label": button.label,
      });

      btn.textContent = button.label;
      btn.addEventListener("click", button.action);
      buttonFragment.appendChild(btn);
    });

    // Single DOM insertion for all buttons
    this.accessibilityToolbar.appendChild(buttonFragment);

    this.accessibilityToolbar.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            background: #ffffff;
            border: 2px solid ${this.theme.highContrast ? "#ffff00" : "#007bff"};
            border-radius: 4px;
            padding: 5px;
            z-index: 10002;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `;
    document.body.appendChild(this.accessibilityToolbar);
  }

  // Enhanced component registration with performance monitoring
  registerComponent(component) {
    const startTime =
      this.performanceMonitor.startOperation("register-component");

    try {
      if (!component || !component.id) {
        throw new AccessibilityError(
          "Invalid component for accessibility registration",
          { component },
        );
      }

      const accessibilityConfig =
        component.accessibilityConfig ||
        this.getDefaultAccessibilityConfig(component);

      // Enhanced component data with performance tracking
      const componentData = {
        component,
        config: accessibilityConfig,
        focusable: accessibilityConfig.focusable !== false,
        description:
          accessibilityConfig.description ||
          this.generateComponentDescription(component),
        role: accessibilityConfig.role || "button",
        keyboardActions: accessibilityConfig.keyboardActions || {},
        registrationTime: Date.now(),
        focusCount: 0,
        lastFocused: null,
      };

      this.components.set(component.id, componentData);
      this.updateFocusableElements();
      this.applyAccessibilityAttributes(component, accessibilityConfig);

      // Register with region manager
      this.registerComponentInRegion(component, accessibilityConfig);

      // Announce registration if verbose mode
      if (this.verboseMode) {
        this.announce(`Component registered: ${componentData.description}`);
      }
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Failed to register component",
          { componentId: component?.id },
          error,
        ),
      );
    } finally {
      this.performanceMonitor.endOperation("register-component", startTime);
    }
  }

  generateComponentDescription(component) {
    const type = component.constructor.name.toLowerCase();
    const text = component.text || component.label || component.title || "";
    const value =
      component.value !== undefined ? ` with value ${component.value}` : "";

    return `${type}${text ? `: ${text}` : ""}${value}`;
  }

  registerComponentInRegion(component, config) {
    const regionName = config.region || "main";

    if (!this.regionManager.has(regionName)) {
      this.regionManager.set(regionName, {
        components: new Set(),
        focusIndex: -1,
        description: config.regionDescription || `${regionName} region`,
      });
    }

    this.regionManager.get(regionName).components.add(component.id);
  }

  unregisterComponent(component) {
    if (component && component.id) {
      const componentData = this.components.get(component.id);
      if (componentData && this.verboseMode) {
        this.announce(`Component unregistered: ${componentData.description}`);
      }

      this.components.delete(component.id);
      this.updateFocusableElements();

      // Remove from region manager
      for (const region of this.regionManager.values()) {
        region.components.delete(component.id);
      }
    }
  }

  getDefaultAccessibilityConfig(component) {
    const componentType = component.constructor.name.toLowerCase();

    const defaults = {
      button: {
        role: "button",
        focusable: true,
        keyboardActions: { Enter: "click", Space: "click" },
        description: "Button",
      },
      slider: {
        role: "slider",
        focusable: true,
        keyboardActions: {
          ArrowLeft: "decrease",
          ArrowRight: "increase",
          ArrowDown: "decrease",
          ArrowUp: "increase",
          Home: "minimum",
          End: "maximum",
        },
        description: "Slider",
      },
      panel: {
        role: "region",
        focusable: true,
        keyboardActions: {},
        description: "Panel",
      },
      tabcontainer: {
        role: "tablist",
        focusable: true,
        keyboardActions: {
          ArrowLeft: "previousTab",
          ArrowRight: "nextTab",
          Home: "firstTab",
          End: "lastTab",
        },
        description: "Tab container",
      },
      treeview: {
        role: "tree",
        focusable: true,
        keyboardActions: {
          ArrowUp: "previousNode",
          ArrowDown: "nextNode",
          ArrowLeft: "collapseNode",
          ArrowRight: "expandNode",
          Enter: "activateNode",
          Space: "toggleNode",
        },
        description: "Tree view",
      },
      fileupload: {
        role: "button",
        focusable: true,
        keyboardActions: { Enter: "openFileDialog", Space: "openFileDialog" },
        description: "File upload",
      },
    };

    return (
      defaults[componentType] || {
        role: "generic",
        focusable: true,
        keyboardActions: {},
        description: "Interactive element",
      }
    );
  }

  applyAccessibilityAttributes(component, config) {
    if (!component.element) return;

    const { element } = component;

    try {
      // Batch all ARIA attributes to reduce DOM mutations
      const ariaAttributes = {};

      if (config.role) {
        ariaAttributes.role = config.role;
      }

      if (config.description) {
        ariaAttributes["aria-label"] = config.description;
      }

      if (config.required) {
        ariaAttributes["aria-required"] = "true";
      }

      if (config.expanded !== undefined) {
        ariaAttributes["aria-expanded"] = config.expanded.toString();
      }

      if (config.selected !== undefined) {
        ariaAttributes["aria-selected"] = config.selected.toString();
      }

      if (config.pressed !== undefined) {
        ariaAttributes["aria-pressed"] = config.pressed.toString();
      }

      if (config.focusable) {
        ariaAttributes.tabindex = element.hasAttribute("tabindex")
          ? element.getAttribute("tabindex")
          : "0";
      }

      // Apply all attributes in a single batch operation
      this.setElementAttributes(element, ariaAttributes);

      // Add keyboard event listeners with enhanced error handling
      this.addKeyboardListeners(element, component, config.keyboardActions);
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Failed to apply accessibility attributes",
          {
            componentId: component.id,
            config,
          },
          error,
        ),
      );
    }
  }

  setAriaAttribute(element, attribute, value) {
    if (value !== null && value !== undefined) {
      element.setAttribute(attribute, value);
    }
  }

  addKeyboardListeners(element, component, keyboardActions) {
    Object.entries(keyboardActions).forEach(([key, action]) => {
      const listener = (e) => {
        if (e.key === key || e.code === key) {
          e.preventDefault();
          e.stopPropagation();
          this.handleComponentKeyboardAction(component, action, e);
        }
      };

      element.addEventListener("keydown", listener);

      // Store listener for cleanup
      if (!component._accessibilityListeners) {
        component._accessibilityListeners = [];
      }
      component._accessibilityListeners.push({
        element,
        event: "keydown",
        listener,
      });
    });
  }

  updateFocusableElements() {
    const startTime =
      this.performanceMonitor.startOperation("update-focusable");

    try {
      this.focusableElements = Array.from(this.components.values())
        .filter(
          (item) =>
            item.focusable &&
            item.component.visible !== false &&
            !item.component.disabled,
        )
        .map((item) => item.component)
        .sort((a, b) => {
          // Sort by tabindex, then by DOM order
          const aTabIndex = parseInt(
            a.element?.getAttribute("tabindex") || "0",
          );
          const bTabIndex = parseInt(
            b.element?.getAttribute("tabindex") || "0",
          );

          if (aTabIndex !== bTabIndex) {
            return aTabIndex - bTabIndex;
          }

          // Use DOM order if tabindex is the same
          if (a.element && b.element && a.element.compareDocumentPosition) {
            return a.element.compareDocumentPosition(b.element) &
              Node.DOCUMENT_POSITION_FOLLOWING
              ? -1
              : 1;
          }

          return 0;
        });

      // Update current focus index if needed
      if (this.currentFocusIndex >= this.focusableElements.length) {
        this.currentFocusIndex = this.focusableElements.length - 1;
      }
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Failed to update focusable elements",
          {},
          error,
        ),
      );
    } finally {
      this.performanceMonitor.endOperation("update-focusable", startTime);
    }
  }

  // Enhanced error handling
  handleError(error) {
    this.errorCount++;
    this.lastError = error;

    logger.error("Accessibility Error:", error);

    // Emit error event for application-level handling
    if (this.engine && this.engine.emit) {
      this.engine.emit("accessibility:error", error);
    }

    // Attempt graceful recovery
    this.attemptErrorRecovery(error);

    // Rate limiting: if too many errors, temporarily disable features
    if (this.errorCount > 10) {
      logger.warn(
        "High error rate detected, temporarily reducing accessibility features",
      );
      this.reduceFeatures();
    }
  }

  attemptErrorRecovery(error) {
    switch (error.context?.operation) {
      case "focus":
        this.currentFocusIndex = -1;
        break;
      case "register-component":
        // Try to recover component registration
        if (error.context?.componentId) {
          setTimeout(() => {
            const component = this.findComponentById(error.context.componentId);
            if (component) {
              this.registerComponent(component);
            }
          }, 1000);
        }
        break;
      case "keyboard":
        this.keyboardNavigationEnabled = true;
        break;
    }
  }

  reduceFeatures() {
    this.verboseMode = false;
    this.announcementDelay *= 2;

    // Re-enable after a delay
    setTimeout(() => {
      this.errorCount = 0;
      this.verboseMode = this.screenReaderType !== null;
      this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY;
    }, ACCESSIBILITY_CONSTANTS.FEATURE_DISABLE_TIMEOUT);
  }

  findComponentById(id) {
    const data = this.components.get(id);
    return data ? data.component : null;
  }

  // Enhanced keyboard navigation with performance optimization
  handleKeyDown(e) {
    if (!this.keyboardNavigationEnabled) return;

    const startTime = this.performanceMonitor.startOperation(
      "keyboard-navigation",
    );

    try {
      // Check for keyboard shortcuts first
      const shortcutKey = this.getShortcutKey(e);
      if (this.keyboardShortcuts.has(shortcutKey)) {
        e.preventDefault();
        e.stopPropagation();
        this.keyboardShortcuts.get(shortcutKey)();
        return;
      }

      switch (e.key) {
        case "Tab":
          e.preventDefault();
          this.handleTabNavigation(e.shiftKey);
          break;
        case "Escape":
          this.handleEscape();
          break;
        case "F6":
          e.preventDefault();
          this.cycleFocusRegions(e.shiftKey ? -1 : 1);
          break;
        case "?":
          if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            this.showKeyboardShortcuts();
          }
          break;
        case "F1":
          e.preventDefault();
          this.showAccessibilityHelp();
          break;
      }
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Keyboard navigation error",
          { key: e.key, operation: "keyboard" },
          error,
        ),
      );
    } finally {
      this.performanceMonitor.endOperation("keyboard-navigation", startTime);
    }
  }

  getShortcutKey(e) {
    const parts = [];
    if (e.ctrlKey) parts.push("ctrl");
    if (e.shiftKey) parts.push("shift");
    if (e.altKey) parts.push("alt");
    if (e.metaKey) parts.push("meta");
    parts.push(e.key.toLowerCase());
    return parts.join("+");
  }

  showAccessibilityHelp() {
    const help = `
            Accessibility Help:
            
            Navigation:
            - Tab/Shift+Tab: Move between elements
            - Arrow keys: Navigate within components
            - Enter/Space: Activate elements
            - Escape: Cancel or close
            - F6/Shift+F6: Cycle between regions
            - F1: Show this help
            
            Shortcuts:
            - Ctrl+Shift+?: Show keyboard shortcuts
            - Ctrl+Shift+H: Toggle high contrast
            - Ctrl+Shift+L: Toggle large text
            - Ctrl+Shift+V: Toggle voice commands
            - Ctrl+Shift+R: Reset accessibility settings
            - Ctrl+Shift+F: Show accessibility report
            
            Voice Commands (if available):
            - "Next" or "Previous": Navigate elements
            - "Activate": Activate current element
            - "Help": Show available commands
            - "High contrast": Toggle high contrast mode
            - "Large text": Toggle large text mode
            
            Current Settings:
            - Theme: ${this.theme.theme}
            - High contrast: ${this.theme.highContrast ? "on" : "off"}
            - Reduced motion: ${this.theme.reducedMotion ? "on" : "off"}
            - Screen reader: ${this.screenReaderEnabled ? "detected" : "not detected"}
            - Voice commands: ${this.voiceCommandsEnabled ? "enabled" : "disabled"}
        `;

    this.announce(help, true);
  }

  handleTabNavigation(backwards = false) {
    if (this.focusableElements.length === 0) return;

    const direction = backwards ? -1 : 1;
    let newIndex = this.currentFocusIndex + direction;

    // Wrap around
    if (newIndex >= this.focusableElements.length) {
      newIndex = 0;
    } else if (newIndex < 0) {
      newIndex = this.focusableElements.length - 1;
    }

    this.currentFocusIndex = newIndex;
    this.focusComponent(this.focusableElements[this.currentFocusIndex]);
  }

  handleComponentKeyboardAction(component, action, event) {
    const componentData = this.components.get(component.id);
    if (!componentData) return;

    const startTime =
      this.performanceMonitor.startOperation("component-action");

    try {
      // Update component usage statistics
      componentData.lastFocused = Date.now();
      componentData.focusCount++;

      switch (action) {
        case "click":
        case "activate":
          this.activateComponent(component, componentData);
          break;

        case "increase":
        case "decrease":
          this.adjustComponentValue(component, action, componentData);
          break;

        case "minimum":
        case "maximum":
          this.setComponentExtreme(component, action, componentData);
          break;

        case "previousTab":
        case "nextTab":
        case "firstTab":
        case "lastTab":
          this.handleTabAction(component, action, componentData);
          break;

        case "previousNode":
        case "nextNode":
        case "expandNode":
        case "collapseNode":
        case "activateNode":
        case "toggleNode":
          this.handleTreeAction(component, action, componentData);
          break;

        case "openFileDialog":
          this.handleFileAction(component, action, componentData);
          break;

        default:
          // Custom action handling
          if (component[action] && typeof component[action] === "function") {
            component[action](event);
            this.announce(
              `${action} performed on ${componentData.description}`,
            );
          }
      }
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Component action failed",
          {
            componentId: component.id,
            action,
            operation: "component-action",
          },
          error,
        ),
      );
    } finally {
      this.performanceMonitor.endOperation("component-action", startTime);
    }
  }

  activateComponent(component, componentData) {
    if (component.element && component.element.click) {
      component.element.click();
    } else if (component.onClick) {
      component.onClick();
    } else if (component.activate) {
      component.activate();
    }
    this.announce(`${componentData.description} activated`);
  }

  adjustComponentValue(component, action, componentData) {
    if (component.setValue && component.value !== undefined) {
      const delta = action === "increase" ? 1 : -1;
      const step = component.step || 1;
      const newValue = Math.max(
        component.min || 0,
        Math.min(component.max || 100, component.value + delta * step),
      );
      component.setValue(newValue);
      this.announce(`${componentData.description} ${action}d to ${newValue}`);
    }
  }

  setComponentExtreme(component, action, componentData) {
    if (component.setValue) {
      const value =
        action === "minimum" ? component.min || 0 : component.max || 100;
      component.setValue(value);
      this.announce(
        `${componentData.description} set to ${action} value: ${value}`,
      );
    }
  }

  handleTabAction(component, action, componentData) {
    if (component.handleTabNavigation) {
      component.handleTabNavigation(action);
      this.announce(
        `Tab navigation: ${action} on ${componentData.description}`,
      );
    }
  }

  handleTreeAction(component, action, componentData) {
    if (component[action]) {
      component[action]();
      this.announce(`Tree action: ${action} on ${componentData.description}`);
    }
  }

  handleFileAction(component, action, componentData) {
    if (component.openFileDialog) {
      component.openFileDialog();
      this.announce(`File dialog opened for ${componentData.description}`);
    }
  }

  focusComponent(component) {
    if (!component || !component.element) return;

    const startTime = this.performanceMonitor.startOperation("focus-component");

    try {
      // Store focus history
      this.focusHistory.push({
        component: component.id,
        timestamp: Date.now(),
      });

      // Limit history size
      if (
        this.focusHistory.length > ACCESSIBILITY_CONSTANTS.FOCUS_HISTORY_LIMIT
      ) {
        this.focusHistory.shift();
      }

      component.element.focus();
      this.updateFocusIndicator(component);

      const componentData = this.components.get(component.id);
      if (componentData) {
        componentData.lastFocused = Date.now();
        componentData.focusCount++;

        if (componentData.description) {
          this.announce(componentData.description);
        }
      }
    } catch (error) {
      this.handleError(
        new AccessibilityError(
          "Focus operation failed",
          {
            componentId: component.id,
            operation: "focus",
          },
          error,
        ),
      );
    } finally {
      this.performanceMonitor.endOperation("focus-component", startTime);
    }
  }

  updateFocusIndicator(component) {
    if (!component.element || !this.focusIndicator) return;

    // Cache container rect if it hasn't changed
    if (!this.cachedContainerRect || this.needsContainerRectUpdate) {
      this.cachedContainerRect = this.container.getBoundingClientRect();
      this.needsContainerRectUpdate = false;
    }

    try {
      const rect = component.element.getBoundingClientRect();
      const containerRect = this.cachedContainerRect;

      const left =
        rect.left -
        containerRect.left -
        ACCESSIBILITY_CONSTANTS.FOCUS_BORDER_OFFSET;
      const top =
        rect.top -
        containerRect.top -
        ACCESSIBILITY_CONSTANTS.FOCUS_BORDER_OFFSET;
      const width = rect.width + ACCESSIBILITY_CONSTANTS.FOCUS_BORDER_PADDING;
      const height = rect.height + ACCESSIBILITY_CONSTANTS.FOCUS_BORDER_PADDING;

      // Batch focus indicator style updates with optimized CSS properties
      requestAnimationFrame(() => {
        // Use cssText for maximum performance - single style update
        this.focusIndicator.style.cssText = `
          display: block;
          position: absolute;
          left: ${left}px;
          top: ${top}px;
          width: ${width}px;
          height: ${height}px;
          border: 3px solid ${this.theme.highContrast ? "#ffff00" : "#007bff"};
          border-radius: 4px;
          box-shadow: ${this.theme.highContrast ? "none" : "0 0 0 1px white, 0 0 8px rgba(0, 123, 255, 0.3)"};
          pointer-events: none;
          transition: ${this.theme.reducedMotion ? "none" : "all 0.2s ease"};
          z-index: 10001;
        `;

        // Ensure focus indicator is visible
        if (this.theme.reducedMotion) {
          this.focusIndicator.scrollIntoView({ block: "nearest" });
        } else {
          this.focusIndicator.scrollIntoView({
            block: "nearest",
            behavior: "smooth",
          });
        }
      });
    } catch (error) {
      this.handleAccessibilityError("updateFocusIndicator", error, {
        componentId: component.id,
      });
    }
  }

  // Enhanced screen reader announcements with intelligent queuing and debouncing
  announce(message, urgent = false, options = {}) {
    if (!message) return;

    const announcement = {
      message: String(message).trim(),
      urgent,
      timestamp: Date.now(),
      category: options.category || "general",
      priority: urgent ? "high" : options.priority || "normal",
      delay: options.delay || this.announcementDelay,
      repeat: options.repeat || false,
    };

    // Enhanced debouncing: check for duplicate announcements with time-based deduplication
    const debounceKey = `${announcement.category}-${announcement.message}`;
    const now = Date.now();
    const debounceThreshold = urgent ? 500 : 2000; // Shorter debounce for urgent messages

    if (this.lastAnnouncements && this.lastAnnouncements.has(debounceKey)) {
      const lastTime = this.lastAnnouncements.get(debounceKey);
      if (now - lastTime < debounceThreshold && !options.allowDuplicates) {
        return; // Skip duplicate announcement within debounce window
      }
    }

    // Initialize debounce tracking if needed
    if (!this.lastAnnouncements) {
      this.lastAnnouncements = new Map();
    }
    this.lastAnnouncements.set(debounceKey, now);

    // Clean up old debounce entries periodically
    if (this.lastAnnouncements.size > 50) {
      this.cleanupAnnouncementCache();
    }

    // Check for duplicate announcements in current queue
    if (
      !options.allowDuplicates &&
      this.isDuplicateAnnouncement(announcement)
    ) {
      return;
    }

    this.announcements.push(announcement);

    // Process immediately if urgent, otherwise queue
    if (urgent) {
      this.processUrgentAnnouncement(announcement);
    } else {
      setTimeout(() => this.processAnnouncements(), announcement.delay);
    }
  }

  /**
   * Clean up old announcement cache entries to prevent memory leaks
   */
  cleanupAnnouncementCache() {
    const now = Date.now();
    const maxAge = 60000; // 1 minute

    for (const [key, timestamp] of this.lastAnnouncements.entries()) {
      if (now - timestamp > maxAge) {
        this.lastAnnouncements.delete(key);
      }
    }
  }

  isDuplicateAnnouncement(newAnnouncement) {
    const recentAnnouncements = this.announcements.filter(
      (a) =>
        Date.now() - a.timestamp < ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_TIMEOUT,
    );

    return recentAnnouncements.some(
      (a) =>
        a.message === newAnnouncement.message &&
        a.category === newAnnouncement.category,
    );
  }

  processUrgentAnnouncement(announcement) {
    if (this.urgentRegion) {
      this.urgentRegion.textContent = announcement.message;

      setTimeout(() => {
        if (this.urgentRegion) {
          this.urgentRegion.textContent = "";
        }
      }, ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_CLEAR_DELAY);
    }
  }

  processAnnouncements() {
    if (this.announcements.length === 0) return;

    // Process announcements by priority
    this.announcements.sort((a, b) => {
      const priorityOrder = { high: 3, normal: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    });

    const announcement = this.announcements.shift();

    // Select appropriate region based on announcement type
    let region = this.liveRegion;

    if (announcement.urgent) {
      region = this.urgentRegion;
    } else if (announcement.category === "status") {
      region = this.statusRegion;
    } else if (announcement.category === "log") {
      region = this.logRegion;
    }

    if (region) {
      region.textContent = announcement.message;

      // Clear after announcement with variable timing based on content length
      const clearDelay = Math.min(
        ACCESSIBILITY_CONSTANTS.GESTURE_TIMEOUT,
        Math.max(
          ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_MIN_DURATION,
          announcement.message.length *
            ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_CHAR_MULTIPLIER,
        ),
      );
      setTimeout(() => {
        if (region && region.textContent === announcement.message) {
          region.textContent = "";
        }
      }, clearDelay);
    }

    // Log announcement for debugging
    if (this.verboseMode) {
      logger.info("Accessibility Announcement:", announcement);
    }
  }

  // Enhanced region management
  cycleFocusRegions(direction = 1) {
    const regionNames = Array.from(this.regionManager.keys());
    if (regionNames.length <= 1) return;

    const currentRegion = this.getCurrentRegion();
    let currentIndex = regionNames.indexOf(currentRegion);

    if (currentIndex === -1) currentIndex = 0;

    currentIndex =
      (currentIndex + direction + regionNames.length) % regionNames.length;
    const newRegion = regionNames[currentIndex];

    this.focusOnRegion(newRegion);

    const regionData = this.regionManager.get(newRegion);
    this.announce(`Moved to ${regionData.description}`, false, {
      category: "navigation",
    });
  }

  getCurrentRegion() {
    // Determine current region based on focused element
    if (
      this.currentFocusIndex >= 0 &&
      this.focusableElements[this.currentFocusIndex]
    ) {
      const focusedComponent = this.focusableElements[this.currentFocusIndex];

      for (const [regionName, regionData] of this.regionManager) {
        if (regionData.components.has(focusedComponent.id)) {
          return regionName;
        }
      }
    }

    return "main";
  }

  focusOnRegion(regionName) {
    const regionData = this.regionManager.get(regionName);
    if (!regionData || regionData.components.size === 0) return;

    // Focus on first component in region
    const firstComponentId = Array.from(regionData.components)[0];
    const componentData = this.components.get(firstComponentId);

    if (componentData) {
      const componentIndex = this.focusableElements.indexOf(
        componentData.component,
      );
      if (componentIndex >= 0) {
        this.currentFocusIndex = componentIndex;
        this.focusComponent(componentData.component);
      }
    }
  }

  // Enhanced configuration methods with persistence
  setKeyboardNavigationEnabled(enabled) {
    this.keyboardNavigationEnabled = enabled;
    this.announce(
      `Keyboard navigation ${enabled ? "enabled" : "disabled"}`,
      false,
      { category: "settings" },
    );

    // Persist setting
    this.saveSetting("keyboardNavigation", enabled);
  }

  setHighContrastMode(enabled) {
    this.isHighContrastMode = enabled;
    this.theme.highContrast = enabled;

    // Batch DOM mutations using requestAnimationFrame
    requestAnimationFrame(() => {
      // Update container classes
      this.updateThemeClasses(this.container, { highContrast: enabled });

      // Update body classes
      this.updateThemeClasses(document.body, { highContrast: enabled });

      // Update related theme styles
      this.updateContainerTheme();
      this.applyThemeSpecificStyles();
      this.updateFocusIndicatorTheme();
    });

    this.announce(
      `High contrast mode ${enabled ? "enabled" : "disabled"}`,
      false,
      { category: "settings" },
    );

    // Persist setting
    this.saveSetting("highContrast", enabled);
  }

  toggleHighContrastMode() {
    this.setHighContrastMode(!this.isHighContrastMode);
  }

  setLargeTextMode(enabled) {
    // Batch DOM mutations using requestAnimationFrame
    requestAnimationFrame(() => {
      this.updateThemeClasses(this.container, { "large-text": enabled });
      this.updateThemeClasses(document.body, { "large-text": enabled });
    });

    this.announce(
      `Large text mode ${enabled ? "enabled" : "disabled"}`,
      false,
      { category: "settings" },
    );

    // Persist setting
    this.saveSetting("largeText", enabled);
  }

  toggleLargeTextMode() {
    const isEnabled = this.container.classList.contains("large-text");
    this.setLargeTextMode(!isEnabled);
  }

  saveSetting(key, value) {
    try {
      if (localStorage) {
        const settings = JSON.parse(
          localStorage.getItem("accessibilitySettings") || "{}",
        );
        settings[key] = value;
        localStorage.setItem("accessibilitySettings", JSON.stringify(settings));
      }
    } catch (error) {
      logger.warn("Failed to save accessibility setting:", error);
    }
  }

  loadSettings() {
    try {
      if (localStorage) {
        const settings = JSON.parse(
          localStorage.getItem("accessibilitySettings") || "{}",
        );

        if (settings.keyboardNavigation !== undefined) {
          this.keyboardNavigationEnabled = settings.keyboardNavigation;
        }

        if (settings.highContrast) {
          this.setHighContrastMode(true);
        }

        if (settings.largeText) {
          this.setLargeTextMode(true);
        }
      }
    } catch (error) {
      logger.warn("Failed to load accessibility settings:", error);
    }
  }

  // Enhanced utility methods
  throttle(func, wait) {
    let timeout;
    let lastTime = 0;

    return function executedFunction(...args) {
      const now = Date.now();

      if (now - lastTime >= wait) {
        func.apply(this, args);
        lastTime = now;
      } else {
        clearTimeout(timeout);
        timeout = setTimeout(
          () => {
            func.apply(this, args);
            lastTime = Date.now();
          },
          wait - (now - lastTime),
        );
      }
    };
  }

  activateCurrentElement() {
    if (
      this.currentFocusIndex >= 0 &&
      this.focusableElements[this.currentFocusIndex]
    ) {
      const component = this.focusableElements[this.currentFocusIndex];
      this.handleComponentKeyboardAction(component, "activate", {});
    }
  }

  // Enhanced simulation-specific announcements
  announceEthicsChange(metric, oldValue, newValue, reasoning) {
    const change = newValue - oldValue;
    const direction = change > 0 ? "increased" : "decreased";
    const magnitude = Math.abs(change);

    let description = "slightly";
    if (magnitude > ACCESSIBILITY_CONSTANTS.ETHICS_SIGNIFICANT_CHANGE)
      description = "significantly";
    else if (magnitude > 10) description = "moderately";

    const message = `${metric} ${description} ${direction} from ${oldValue} to ${newValue}. ${reasoning}`;

    this.announce(message, false, {
      category: "ethics",
      priority:
        magnitude > ACCESSIBILITY_CONSTANTS.ETHICS_HIGH_PRIORITY
          ? "high"
          : "normal",
    });
  }

  announceScenarioChange(scenarioTitle, scenarioNumber, totalScenarios) {
    const message = `Starting scenario ${scenarioNumber} of ${totalScenarios}: ${scenarioTitle}`;
    this.announce(message, true, { category: "scenario" });
  }

  announceSimulationComplete(score, totalMetrics) {
    const percentage = Math.round((score / totalMetrics) * 100);
    let performance = "needs improvement";

    if (percentage >= ACCESSIBILITY_CONSTANTS.PERFORMANCE_EXCELLENT)
      performance = "excellent";
    else if (percentage >= ACCESSIBILITY_CONSTANTS.PERFORMANCE_GOOD)
      performance = "good";
    else if (percentage >= ACCESSIBILITY_CONSTANTS.PERFORMANCE_SATISFACTORY)
      performance = "satisfactory";

    const message = `Simulation complete. Final score: ${score} out of ${totalMetrics} (${percentage}%). Performance: ${performance}.`;
    this.announce(message, true, { category: "completion" });
  }

  // Event handlers with enhanced functionality
  onContainerFocus() {
    if (this.focusableElements.length > 0 && this.currentFocusIndex === -1) {
      this.currentFocusIndex = 0;
      this.focusComponent(this.focusableElements[0]);
    }

    // Announce entry to application
    if (this.verboseMode) {
      this.announce("Entered simulation environment", false, {
        category: "navigation",
      });
    }
  }

  onContainerBlur() {
    if (this.focusIndicator) {
      this.focusIndicator.style.display = "none";
    }
  }

  onFocusChange(e) {
    // Track focus changes for analytics and optimization
    if (e.type === "focusin") {
      const component = this.findComponentByElement(e.target);
      if (component) {
        this.currentFocusIndex = this.focusableElements.indexOf(component);
        this.updateFocusIndicator(component);

        // Update component statistics
        const componentData = this.components.get(component.id);
        if (componentData) {
          componentData.lastFocused = Date.now();
          componentData.focusCount++;
        }
      }
    }
  }

  findComponentByElement(element) {
    for (const [, data] of this.components) {
      if (
        data.component.element === element ||
        data.component.element?.contains(element)
      ) {
        return data.component;
      }
    }
    return null;
  }

  // Enhanced utility methods with error handling
  detectScreenReader() {
    try {
      return this.detectScreenReaderType() !== null;
    } catch (error) {
      logger.warn("Screen reader detection failed:", error);
      return false;
    }
  }

  handleEscape() {
    // Enhanced escape handling with context awareness
    this.announce("Escape pressed", false, { category: "interaction" });

    // Close any open accessibility toolbar
    if (
      this.accessibilityToolbar &&
      this.accessibilityToolbar.style.display !== "none"
    ) {
      this.accessibilityToolbar.style.display = "none";
      this.announce("Accessibility toolbar closed");
      return;
    }

    // Reset focus if lost
    if (this.currentFocusIndex === -1 && this.focusableElements.length > 0) {
      this.currentFocusIndex = 0;
      this.focusComponent(this.focusableElements[0]);
      return;
    }

    if (this.engine && this.engine.emit) {
      this.engine.emit("accessibility:escape");
    }
  }

  showKeyboardShortcuts() {
    const shortcuts = `
            Keyboard Shortcuts:
            
            Basic Navigation:
            • Tab/Shift+Tab: Navigate between elements
            • Arrow keys: Navigate within components
            • Enter/Space: Activate buttons and controls
            • Escape: Cancel, close, or reset focus
            • F6/Shift+F6: Cycle between regions
            • F1: Show accessibility help
            
            Advanced Shortcuts:
            • Ctrl+Shift+?: Show this shortcuts list
            • Ctrl+Shift+H: Toggle high contrast mode
            • Ctrl+Shift+L: Toggle large text mode
            • Ctrl+Shift+V: Toggle voice commands
            • Ctrl+Shift+R: Reset accessibility settings
            • Ctrl+Shift+F: Show accessibility report
            
            Component-Specific:
            • Home/End: First/last item in lists
            • Arrow keys: Navigate trees and tabs
            • Space: Toggle checkboxes and expand/collapse
            • Enter: Activate primary actions
            
            Voice Commands (if supported):
            • "Next" / "Previous": Navigate elements
            • "Activate": Activate current element
            • "High contrast": Toggle high contrast
            • "Large text": Toggle large text
            • "Help": Show voice command help
        `;

    this.announce(shortcuts, true, { category: "help" });
  }

  handleKeyUp(e) {
    // Handle key release events for advanced interactions
    if (e.key === "Alt" && this.altKeyPressed) {
      this.altKeyPressed = false;
      // Could show accessibility menu on Alt release
    }
  }

  // Enhanced cleanup with comprehensive resource management
  destroy() {
    const startTime = this.performanceMonitor.startOperation("cleanup");

    try {
      // Remove event listeners with error handling
      this.removeEventListeners();

      // Clean up speech recognition
      if (this.speechRecognition) {
        try {
          this.speechRecognition.stop();
          this.speechRecognition = null;
        } catch (error) {
          logger.warn("Speech recognition cleanup failed:", error);
        }
      }

      // Remove DOM elements
      this.removeDOMElements();

      // Clean up component listeners
      this.cleanupComponentListeners();

      // Clear data structures
      this.clearDataStructures();

      // Save final settings
      this.saveFinalSettings();

      logger.info("AccessibilityManager destroyed successfully");
    } catch (error) {
      logger.error("Error during AccessibilityManager cleanup:", error);
    } finally {
      this.performanceMonitor.endOperation("cleanup", startTime);

      // Final performance report
      if (this.verboseMode) {
        logger.info(
          "Final Accessibility Performance Report:",
          this.performanceMonitor.getMetrics(),
        );
      }
    }
  }

  removeEventListeners() {
    try {
      // Remove container event listeners
      this.container.removeEventListener("keydown", this.handleKeyDown);
      this.container.removeEventListener("keyup", this.handleKeyUp);
      this.container.removeEventListener("focus", this.onContainerFocus);
      this.container.removeEventListener("blur", this.onContainerBlur);

      // Remove document event listeners
      document.removeEventListener("focusin", this.onFocusChange);
      document.removeEventListener("focusout", this.onFocusChange);

      // Remove theme change listeners
      const contrastQuery = window.matchMedia("(prefers-contrast: high)");
      const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");

      if (contrastQuery.removeEventListener) {
        contrastQuery.removeEventListener("change", this.updateTheme);
        motionQuery.removeEventListener("change", this.updateTheme);
      }
    } catch (error) {
      logger.warn("Event listener cleanup failed:", error);
    }
  }

  removeDOMElements() {
    const elementsToRemove = [
      this.liveRegion,
      this.urgentRegion,
      this.statusRegion,
      this.logRegion,
      this.overlay,
      this.accessibilityToolbar,
      document.getElementById("accessibility-description"),
      document.getElementById("accessibility-focus-styles"),
    ];

    elementsToRemove.forEach((element) => {
      try {
        if (element && element.parentNode) {
          element.parentNode.removeChild(element);
        }
      } catch (error) {
        logger.warn("Failed to remove DOM element:", error);
      }
    });
  }

  cleanupComponentListeners() {
    for (const [id, componentData] of this.components) {
      const { component } = componentData;

      if (component._accessibilityListeners) {
        component._accessibilityListeners.forEach(
          ({ element, event, listener }) => {
            try {
              element.removeEventListener(event, listener);
            } catch (error) {
              logger.warn(
                `Failed to remove listener for component ${id}:`,
                error,
              );
            }
          },
        );

        delete component._accessibilityListeners;
      }
    }
  }

  clearDataStructures() {
    this.components.clear();
    this.focusableElements = [];
    this.announcements = [];
    this.focusHistory = [];
    this.regionManager.clear();
    this.voiceCommands.clear();
    this.keyboardShortcuts.clear();
    this.renderCache.clear();
  }

  saveFinalSettings() {
    try {
      if (localStorage) {
        const finalReport = {
          sessionDuration: Date.now() - (this.initTime || Date.now()),
          totalComponents: this.components.size,
          totalAnnouncements: this.announcements.length,
          errorCount: this.errorCount,
          performanceMetrics: this.performanceMonitor.getMetrics(),
          lastSession: Date.now(),
        };

        localStorage.setItem(
          "accessibilitySessionReport",
          JSON.stringify(finalReport),
        );
      }
    } catch (error) {
      logger.warn("Failed to save session report:", error);
    }
  }

  // Public API for enhanced accessibility features
  getAccessibilityReport() {
    return {
      isEnabled: true,
      componentsRegistered: this.components.size,
      focusableElements: this.focusableElements.length,
      theme: this.theme,
      screenReader: {
        enabled: this.screenReaderEnabled,
        type: this.screenReaderType,
      },
      features: {
        keyboardNavigation: this.keyboardNavigationEnabled,
        voiceCommands: this.voiceCommandsEnabled,
        highContrast: this.isHighContrastMode,
        largeText: this.container.classList.contains("large-text"),
      },
      performance: this.performanceMonitor.getMetrics(),
      errors: this.errorCount,
      lastError: this.lastError,
    };
  }

  updateAccessibilityConfig(config) {
    if (config.theme) {
      this.theme = { ...this.theme, ...config.theme };
      this.updateContainerTheme();
    }

    if (config.announcements) {
      this.announcementDelay =
        config.announcements.delay || this.announcementDelay;
      this.verboseMode =
        config.announcements.verbose !== undefined
          ? config.announcements.verbose
          : this.verboseMode;
    }

    if (config.performance) {
      // Update performance thresholds
      Object.assign(ACCESSIBILITY_CONSTANTS, config.performance);
    }

    this.announce("Accessibility configuration updated", false, {
      category: "settings",
    });
  }
}

// Static methods for global accessibility utilities
AccessibilityManager.detectScreenReaderType = function () {
  const { userAgent } = navigator;

  for (const [type, pattern] of Object.entries(SCREEN_READER_PATTERNS)) {
    if (pattern.test(userAgent)) {
      return type.toLowerCase();
    }
  }

  return null;
};

AccessibilityManager.createGlobalAccessibilityStyles = function () {
  if (document.getElementById("global-accessibility-styles")) return;

  const styleSheet = document.createElement("style");
  styleSheet.id = "global-accessibility-styles";
  styleSheet.textContent = `
        /* Global accessibility styles */
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
        
        .accessibility-enabled *:focus {
            outline: 2px solid #007bff !important;
            outline-offset: 2px !important;
        }
        
        .high-contrast *:focus {
            outline: 3px solid #ffff00 !important;
            outline-offset: 2px !important;
        }
        
        .large-text {
            font-size: 120% !important;
            line-height: 1.5 !important;
        }
        
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .accessibility-enabled * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;

  document.head.appendChild(styleSheet);
};

// Initialize global styles when module loads
if (typeof document !== "undefined") {
  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      AccessibilityManager.createGlobalAccessibilityStyles,
    );
  } else {
    AccessibilityManager.createGlobalAccessibilityStyles();
  }
}

// Export for ES6 modules
export default AccessibilityManager;
