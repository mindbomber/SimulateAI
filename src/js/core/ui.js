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
 * Enhanced UI Components System - Modern UI component framework for SimulateAI
 * Provides WCAG 2.1 AA compliant, responsive, and theme-aware UI components
 *
 * Features:
 * - Full accessibility compliance (WCAG 2.1 AA)
 * - Dark mode and theme integration
 * - Performance optimization and monitoring
 * - Advanced animation support
 * - Touch and mobile optimization
 * - Error handling and recovery
 * - RTL language support
 * - Screen reader compatibility
 *
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from "../utils/logger.js";
import { COMMON, TIMING } from "../utils/constants.js";

// Enhanced constants and configuration
const UI_CONSTANTS = {
  ANIMATION_DURATION: 300,
  DEBOUNCE_DELAY: 150,
  FOCUS_DELAY: 16,
  FOCUS_TRANSITION_DELAY: 100, // Delay for focus transitions in modals
  TOUCH_TARGET_SIZE: 44,
  FOCUS_RING_WIDTH: 2,
  BREAKPOINTS: {
    mobile: 768,
    tablet: 1024,
    desktop: 1200,
  },

  // Performance monitoring
  FRAME_TIME_LIMIT: 16, // 1 frame at 60fps

  // ID generation
  RANDOM_BASE: 36,
  RANDOM_ID_LENGTH: 9,

  // Panel constraints
  MIN_PANEL_WIDTH: 200,
  MIN_PANEL_HEIGHT: 150,

  // Feedback system
  DEFAULT_HIDE_DELAY: 5000,
  MAX_FEEDBACK_ITEMS: 5,

  // Ethics grading thresholds
  ETHICS_GRADES: {
    EXCELLENT: 90,
    GOOD: 80,
    FAIR: 70,
    NEEDS_IMPROVEMENT: 60,
  },

  // Animation delays
  CLEANUP_DELAY: 300,

  // Centralized animation timing (prevent duplicate rules)
  TRANSITION_EASE: "all 0.3s ease",
  TRANSITION_CUBIC: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  OPACITY_TRANSFORM_TRANSITION: "opacity 0.3s ease, transform 0.3s ease",
};

const THEME_COLORS = {
  light: {
    primary: "#1a73e8",
    secondary: "#34a853",
    surface: "#ffffff",
    background: "#f8f9fa",
    text: "#202124",
    border: "#dadce0",
  },
  dark: {
    primary: "#4285f4",
    secondary: "#34a853",
    surface: "#2d2d30",
    background: "#1e1e1e",
    text: "#e8eaed",
    border: "#5f6368",
  },
  highContrast: {
    primary: "#000000",
    secondary: "#000000",
    surface: "#ffffff",
    background: "#ffffff",
    text: "#000000",
    border: "#000000",
  },
};

/**
 * Enhanced theme detection and management for UI components
 */
class UIThemeManager {
  static getCurrentTheme() {
    const prefersHighContrast = window.matchMedia?.(
      "(prefers-contrast: high)",
    ).matches;
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    return {
      name: prefersHighContrast ? "highContrast" : "light",
      highContrast: prefersHighContrast,
      reducedMotion: prefersReducedMotion,
      colors: THEME_COLORS[prefersHighContrast ? "highContrast" : "light"],
    };
  }

  static applyThemeToElement(element, theme = this.getCurrentTheme()) {
    element.style.setProperty("--theme-primary", theme.colors.primary);
    element.style.setProperty("--theme-secondary", theme.colors.secondary);
    element.style.setProperty("--theme-surface", theme.colors.surface);
    element.style.setProperty("--theme-background", theme.colors.background);
    element.style.setProperty("--theme-text", theme.colors.text);
    element.style.setProperty("--theme-border", theme.colors.border);
  }
}

/**
 * Centralized style management to reduce DOM mutations
 */
class UIStyleManager {
  static styleElements = new Map();

  static addGlobalStyles() {
    if (document.getElementById("ui-global-styles")) return; // Already added

    const style = document.createElement("style");
    style.id = "ui-global-styles";
    style.textContent = `
      /* Centralized focus styles */
      .ui-component:focus {
        outline: ${UI_CONSTANTS.FOCUS_RING_WIDTH}px solid var(--theme-primary);
        outline-offset: 2px;
        box-shadow: 0 0 0 4px var(--theme-primary)20;
      }
      
      .ui-component:focus:not(:focus-visible) {
        outline: none;
        box-shadow: none;
      }
      
      /* Animation transitions */
      .ui-animated {
        transition: ${UI_CONSTANTS.TRANSITION_EASE};
      }
      
      .ui-animated-cubic {
        transition: ${UI_CONSTANTS.TRANSITION_CUBIC};
      }
      
      .ui-show-animation {
        transition: ${UI_CONSTANTS.OPACITY_TRANSFORM_TRANSITION};
      }
      
      /* Hover and focus states */
      .ui-component.hover {
        transform: translateY(-1px);
      }
      
      .ui-component.active {
        transform: translateY(1px);
      }
      
      .ui-component.focused {
        z-index: 1;
      }
      
      /* Responsive classes */
      .ui-component.mobile {
        min-width: ${UI_CONSTANTS.TOUCH_TARGET_SIZE}px;
        min-height: ${UI_CONSTANTS.TOUCH_TARGET_SIZE}px;
      }
    `;

    document.head.appendChild(style);
  }

  static getOrCreateStyleElement(id) {
    if (this.styleElements.has(id)) {
      return this.styleElements.get(id);
    }

    const style = document.createElement("style");
    style.id = `ui-styles-${id}`;
    document.head.appendChild(style);
    this.styleElements.set(id, style);
    return style;
  }

  static removeStyleElement(id) {
    const style = this.styleElements.get(id);
    if (style && style.parentNode) {
      style.parentNode.removeChild(style);
      this.styleElements.delete(id);
    }
  }
}

// Initialize global styles
UIStyleManager.addGlobalStyles();

/**
 * Performance monitoring utility for UI components
 */
class UIPerformanceMonitor {
  static measurements = new Map();

  static startMeasurement(id) {
    this.measurements.set(id, performance.now());
  }

  static endMeasurement(id) {
    const start = this.measurements.get(id);
    if (start) {
      const duration = performance.now() - start;
      this.measurements.delete(id);
      if (duration > UI_CONSTANTS.FRAME_TIME_LIMIT) {
        // Flag slow operations (> 1 frame)
        logger.warn(`UI operation '${id}' took ${duration.toFixed(2)}ms`);
      }
      return duration;
    }
    return 0;
  }
}

/**
 * Enhanced UIComponent - Base class for all UI components
 * Phase 3.2: DataHandler Integration for UI State Management
 * Provides modern accessibility, theming, performance features, and persistent UI state
 */
class UIComponent {
  constructor(config = {}) {
    // Performance monitoring
    UIPerformanceMonitor.startMeasurement(
      `ui-component-init-${this.constructor.name}`,
    );

    // Phase 3.2: DataHandler Integration
    this.app = config.app || null;
    this.dataHandler = config.app?.dataHandler || null;
    this.persistentState = config.persistentState !== false;

    // Core properties
    this.id =
      config.id ||
      `ui-${Date.now()}-${Math.random().toString(UI_CONSTANTS.RANDOM_BASE).substr(2, UI_CONSTANTS.RANDOM_ID_LENGTH)}`;
    this.position = config.position || { x: 0, y: 0 };
    this.size = config.size || { width: 100, height: 100 };
    this.visible = config.visible !== false;
    this.active = config.active !== false;
    this.zIndex = config.zIndex || 0;

    // Enhanced properties
    this.engine = null;
    this.element = null;
    this.styles = config.styles || {};
    this.theme = UIThemeManager.getCurrentTheme();
    this.accessible = config.accessible !== false;
    this.responsive = config.responsive !== false;
    this.animated = config.animated !== false && !this.theme.reducedMotion;

    // Event system
    this.events = new Map();
    this.listeners = new Map();

    // Accessibility properties
    this.ariaLabel = config.ariaLabel || "";
    this.ariaRole = config.ariaRole || "button";
    this.focusable = config.focusable !== false;
    this.tabIndex = config.tabIndex || (this.focusable ? 0 : -1);

    // Performance properties
    this.performanceOptions = {
      useGPU: config.useGPU !== false,
      enableVirtualization: config.enableVirtualization === true,
      debounceEvents: config.debounceEvents !== false,
    };

    // Phase 3.2: Persistent UI preferences
    this.uiPreferences = {
      position: null,
      size: null,
      theme: null,
      accessibility: null,
      customizations: {},
    };

    // Error handling
    this.errorHandler =
      config.errorHandler || this.defaultErrorHandler.bind(this);

    // Phase 3.2: Initialize async with DataHandler if available
    if (this.dataHandler && this.persistentState) {
      this.initializeUIStateAsync();
    }

    // Initialize component
    this.createElement();
    this.applyStyles();
    this.setupAccessibility();
    this.setupEventListeners();
    this.setupThemeMonitoring();

    UIPerformanceMonitor.endMeasurement(
      `ui-component-init-${this.constructor.name}`,
    );
  }

  /**
   * Phase 3.2: Async initialization for UI state management
   */
  async initializeUIStateAsync() {
    try {
      // Load persistent UI preferences
      await this.loadUIPreferences();

      // Apply loaded preferences to component
      this.applyUIPreferences();

      console.log(
        `[UIComponent] ${this.constructor.name} initialized with persistent state`,
      );
    } catch (error) {
      console.warn(
        `[UIComponent] Failed to initialize UI state for ${this.constructor.name}:`,
        error,
      );
    }
  }

  /**
   * Phase 3.2: Load UI preferences from DataHandler
   */
  async loadUIPreferences() {
    if (!this.dataHandler) return;

    try {
      const storageKey = `ui_component_${this.constructor.name.toLowerCase()}_${this.id}`;
      const storedPreferences = await this.dataHandler.getData(storageKey);

      if (storedPreferences && Object.keys(storedPreferences).length > 0) {
        this.uiPreferences = { ...this.uiPreferences, ...storedPreferences };
        console.log(
          `[UIComponent] Loaded UI preferences for ${this.constructor.name}`,
        );
      }
    } catch (error) {
      console.warn(`[UIComponent] Failed to load UI preferences:`, error);
    }
  }

  /**
   * Phase 3.2: Save UI preferences to DataHandler
   */
  async saveUIPreferences() {
    if (!this.dataHandler || !this.persistentState) return;

    try {
      const storageKey = `ui_component_${this.constructor.name.toLowerCase()}_${this.id}`;

      // Prepare preferences data
      const preferencesToSave = {
        position: this.position,
        size: this.size,
        theme: this.theme,
        accessibility: {
          ariaLabel: this.ariaLabel,
          focusable: this.focusable,
          tabIndex: this.tabIndex,
        },
        customizations: this.uiPreferences.customizations,
        lastUpdated: Date.now(),
      };

      await this.dataHandler.saveData(storageKey, preferencesToSave);
      console.log(
        `[UIComponent] Saved UI preferences for ${this.constructor.name}`,
      );
    } catch (error) {
      console.warn(`[UIComponent] Failed to save UI preferences:`, error);
    }
  }

  /**
   * Phase 3.2: Apply loaded UI preferences to component
   */
  applyUIPreferences() {
    try {
      // Apply position if available
      if (this.uiPreferences.position) {
        this.position = { ...this.position, ...this.uiPreferences.position };
      }

      // Apply size if available
      if (this.uiPreferences.size) {
        this.size = { ...this.size, ...this.uiPreferences.size };
      }

      // Apply accessibility preferences
      if (this.uiPreferences.accessibility) {
        const { accessibility } = this.uiPreferences;
        if (accessibility.ariaLabel) this.ariaLabel = accessibility.ariaLabel;
        if (accessibility.focusable !== undefined)
          this.focusable = accessibility.focusable;
        if (accessibility.tabIndex !== undefined)
          this.tabIndex = accessibility.tabIndex;
      }

      // Apply theme preferences
      if (this.uiPreferences.theme) {
        this.theme = { ...this.theme, ...this.uiPreferences.theme };
      }

      console.log(
        `[UIComponent] Applied UI preferences for ${this.constructor.name}`,
      );
    } catch (error) {
      console.warn(`[UIComponent] Failed to apply UI preferences:`, error);
    }
  }

  /**
   * Phase 3.2: Update UI preferences and save to DataHandler
   */
  async updateUIPreferences(updates) {
    try {
      // Update local preferences
      this.uiPreferences = { ...this.uiPreferences, ...updates };

      // Apply updates to component
      this.applyUIPreferences();

      // Save to DataHandler
      await this.saveUIPreferences();

      // Trigger preference change event
      this.triggerEvent("ui-preferences-changed", {
        componentId: this.id,
        componentType: this.constructor.name,
        updates,
        timestamp: Date.now(),
      });
    } catch (error) {
      console.warn(`[UIComponent] Failed to update UI preferences:`, error);
    }
  }

  /**
   * Create DOM element with modern features
   */
  createElement() {
    try {
      this.element = document.createElement(this.getElementTag());
      this.element.className = this.getElementClasses();
      this.element.id = this.id;

      // Apply theme CSS variables
      UIThemeManager.applyThemeToElement(this.element, this.theme);

      this.updateElementPosition();
    } catch (error) {
      this.errorHandler(error, "createElement");
    }
  }

  /**
   * Get element tag (override in subclasses)
   */
  getElementTag() {
    return "div";
  }

  /**
   * Get element CSS classes
   */
  getElementClasses() {
    const baseClasses = [
      "ui-component",
      `ui-${this.constructor.name.toLowerCase()}`,
      "theme-aware",
    ];

    if (this.responsive) baseClasses.push("responsive");
    if (this.animated) baseClasses.push("animated");
    if (this.theme.highContrast) baseClasses.push("high-contrast");

    return baseClasses.join(" ");
  }

  /**
   * Apply modern styles with CSS custom properties
   */
  applyStyles() {
    try {
      const baseStyles = {
        position: "absolute",
        boxSizing: "border-box",
        userSelect: "none",
        outline: "none",

        // Custom properties for theming
        backgroundColor: "var(--theme-surface)",
        color: "var(--theme-text)",
        borderColor: "var(--theme-border)",

        // Accessibility enhancements
        minWidth: this.focusable
          ? `${UI_CONSTANTS.TOUCH_TARGET_SIZE}px`
          : "auto",
        minHeight: this.focusable
          ? `${UI_CONSTANTS.TOUCH_TARGET_SIZE}px`
          : "auto",

        // Performance optimizations
        willChange: this.animated ? "transform, opacity" : "auto",
        backfaceVisibility: "hidden",
        transform: "translateZ(0)", // Force GPU layer

        ...this.styles,
      };

      Object.assign(this.element.style, baseStyles);

      // Use CSS classes instead of inline styles for animations
      if (this.animated) {
        this.element.classList.add("ui-animated");
      }
    } catch (error) {
      this.errorHandler(error, "applyStyles");
    }
  }

  /**
   * Add modern focus styles using CSS classes
   */
  addFocusStyles() {
    // Focus styles are now handled by global CSS classes
    // No need to create individual style elements
  }

  /**
   * Setup comprehensive accessibility features
   */
  setupAccessibility() {
    if (!this.accessible || !this.element) return;

    try {
      // ARIA attributes
      if (this.ariaLabel) {
        this.element.setAttribute("aria-label", this.ariaLabel);
      }

      if (this.ariaRole) {
        this.element.setAttribute("role", this.ariaRole);
      }

      // Focus management
      this.element.setAttribute("tabindex", this.tabIndex);

      // Screen reader support
      this.element.setAttribute("aria-hidden", this.visible ? "false" : "true");

      // Touch accessibility
      if ("ontouchstart" in window) {
        this.element.style.touchAction = "manipulation";
      }
    } catch (error) {
      this.errorHandler(error, "setupAccessibility");
    }
  }

  /**
   * Setup modern event listeners with performance optimization
   */
  setupEventListeners() {
    if (!this.element) return;

    try {
      // Keyboard navigation
      if (this.focusable) {
        this.addEventListener("keydown", this.handleKeyDown.bind(this));
        this.addEventListener("keyup", this.handleKeyUp.bind(this));
      }

      // Mouse events
      this.addEventListener("mouseenter", this.handleMouseEnter.bind(this));
      this.addEventListener("mouseleave", this.handleMouseLeave.bind(this));

      // Touch events (with passive listeners for performance)
      if ("ontouchstart" in window) {
        this.addEventListener("touchstart", this.handleTouchStart.bind(this), {
          passive: true,
        });
        this.addEventListener("touchend", this.handleTouchEnd.bind(this), {
          passive: true,
        });
      }

      // Focus events
      this.addEventListener("focus", this.handleFocus.bind(this));
      this.addEventListener("blur", this.handleBlur.bind(this));
    } catch (error) {
      this.errorHandler(error, "setupEventListeners");
    }
  }

  /**
   * Setup theme change monitoring
   */
  setupThemeMonitoring() {
    // Monitor system theme changes
    const contrastQuery = window.matchMedia?.("(prefers-contrast: high)");
    const motionQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");

    const handleThemeChange = () => {
      this.theme = UIThemeManager.getCurrentTheme();
      this.updateTheme();
    };

    contrastQuery?.addEventListener?.("change", handleThemeChange);
    motionQuery?.addEventListener?.("change", handleThemeChange);

    // Store references for cleanup
    this.themeQueries = { contrastQuery, motionQuery };
    this.themeChangeHandler = handleThemeChange;
  }

  /**
   * Update component when theme changes
   */
  updateTheme() {
    try {
      this.animated = !this.theme.reducedMotion;
      this.element.className = this.getElementClasses();
      UIThemeManager.applyThemeToElement(this.element, this.theme);
      this.applyStyles();

      this.emit("themeChanged", this.theme);
    } catch (error) {
      this.errorHandler(error, "updateTheme");
    }
  }

  /**
   * Enhanced event handling methods
   */
  handleKeyDown(event) {
    if (event.key === "Enter" || event.key === " ") {
      event.preventDefault();
      this.emit("activate", { event, source: "keyboard" });
    }

    this.emit("keyDown", { event, key: event.key });
  }

  handleKeyUp(event) {
    this.emit("keyUp", { event, key: event.key });
  }

  handleMouseEnter(event) {
    this.element.classList.add("hover");
    this.emit("mouseEnter", { event });
  }

  handleMouseLeave(event) {
    this.element.classList.remove("hover");
    this.emit("mouseLeave", { event });
  }

  handleTouchStart(event) {
    this.element.classList.add("active");
    this.emit("touchStart", { event });
  }

  handleTouchEnd(event) {
    this.element.classList.remove("active");
    this.emit("touchEnd", { event });
  }

  handleFocus(event) {
    this.element.classList.add("focused");
    this.emit("focus", { event });
  }

  handleBlur(event) {
    this.element.classList.remove("focused");
    this.emit("blur", { event });
  }

  /**
   * Enhanced utility methods
   */
  updateElementPosition() {
    if (this.element) {
      this.element.style.left = `${this.position.x}px`;
      this.element.style.top = `${this.position.y}px`;
      this.element.style.width = `${this.size.width}px`;
      this.element.style.height = `${this.size.height}px`;
      this.element.style.zIndex = this.zIndex;

      // Update responsive behavior
      if (this.responsive) {
        this.updateResponsiveStyles();
      }
    }
  }

  /**
   * Update responsive styles based on screen size
   */
  updateResponsiveStyles() {
    const width = window.innerWidth;
    const isMobile = width < UI_CONSTANTS.BREAKPOINTS.mobile;
    const isTablet = width < UI_CONSTANTS.BREAKPOINTS.tablet;

    this.element.classList.toggle("mobile", isMobile);
    this.element.classList.toggle("tablet", isTablet && !isMobile);
    this.element.classList.toggle("desktop", !isTablet);

    // Adjust touch targets on mobile
    if (isMobile && this.focusable) {
      this.element.style.minWidth = `${UI_CONSTANTS.TOUCH_TARGET_SIZE}px`;
      this.element.style.minHeight = `${UI_CONSTANTS.TOUCH_TARGET_SIZE}px`;
    }
  }

  setEngine(engine) {
    this.engine = engine;
    if (engine && engine.container) {
      engine.container.appendChild(this.element);
    }
  }

  setPosition(x, y) {
    this.position.x = x;
    this.position.y = y;
    this.updateElementPosition();

    // Phase 3.2: Save position to DataHandler
    if (this.persistentState) {
      this.saveUIPreferences().catch((error) => {
        console.warn(
          `[UIComponent] Failed to save position for ${this.constructor.name}:`,
          error,
        );
      });
    }
  }

  setSize(width, height) {
    this.size.width = width;
    this.size.height = height;
    this.updateElementPosition();

    // Phase 3.2: Save size to DataHandler
    if (this.persistentState) {
      this.saveUIPreferences().catch((error) => {
        console.warn(
          `[UIComponent] Failed to save size for ${this.constructor.name}:`,
          error,
        );
      });
    }
  }

  show() {
    this.visible = true;
    if (this.element) {
      this.element.style.display = "block";
      this.element.setAttribute("aria-hidden", "false");

      if (this.animated) {
        // Use CSS classes for animations
        this.element.classList.add("ui-show-animation");
        this.element.style.opacity = "0";
        this.element.style.transform = "scale(0.95)";

        requestAnimationFrame(() => {
          this.element.style.opacity = "1";
          this.element.style.transform = "scale(1)";
        });
      }
    }

    this.emit("show");
  }

  hide() {
    this.visible = false;
    if (this.element) {
      if (this.animated) {
        this.element.classList.add("ui-show-animation");
        this.element.style.opacity = "0";
        this.element.style.transform = "scale(0.95)";

        setTimeout(() => {
          this.element.style.display = "none";
          this.element.setAttribute("aria-hidden", "true");
        }, TIMING.FAST);
      } else {
        this.element.style.display = "none";
        this.element.setAttribute("aria-hidden", "true");
      }
    }

    this.emit("hide");
  }

  /**
   * Enhanced event system with debouncing
   */
  addEventListener(event, callback, options = {}) {
    if (
      this.performanceOptions.debounceEvents &&
      ["resize", "scroll", "mousemove"].includes(event)
    ) {
      callback = this.debounce(callback, UI_CONSTANTS.DEBOUNCE_DELAY);
    }

    this.element?.addEventListener(event, callback, options);

    // Store for cleanup
    if (!this.listeners.has(event)) {
      this.listeners.set(event, []);
    }
    this.listeners.get(event).push({ callback, options });
  }

  removeEventListener(event, callback) {
    this.element?.removeEventListener(event, callback);

    // Clean up stored listeners
    const listeners = this.listeners.get(event);
    if (listeners) {
      const index = listeners.findIndex((l) => l.callback === callback);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    }
  }

  /**
   * Debounce utility for performance
   */
  debounce(func, delay) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  emit(event, data = {}) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          this.errorHandler(error, `emit-${event}`);
        }
      });
    }
  }

  /**
   * Default error handler
   */
  defaultErrorHandler(error, context) {
    logger.error(`UI Component Error (${context}):`, error);

    // Emit error event for external handling
    this.emit("error", { error, context });
  }

  /**
   * Announce text for screen readers
   */
  announce(text, priority = "polite") {
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", priority);
    announcement.setAttribute("aria-atomic", "true");
    announcement.style.position = "absolute";
    announcement.style.left = "-10000px";
    announcement.style.width = "1px";
    announcement.style.height = "1px";
    announcement.style.overflow = "hidden";

    document.body.appendChild(announcement);

    setTimeout(() => {
      announcement.textContent = text;
      setTimeout(() => {
        document.body.removeChild(announcement);
      }, 1000);
    }, 100);
  }

  update(deltaTime) {
    // Override in subclasses for custom update logic
    this.emit("update", { deltaTime });
  }

  render() {
    // UI components render to DOM, not canvas/svg
    // Override in subclasses if needed
  }

  /**
   * Enhanced cleanup with memory leak prevention
   */
  destroy() {
    try {
      // Remove all event listeners
      this.listeners.forEach((listeners, event) => {
        listeners.forEach(({ callback }) => {
          this.element?.removeEventListener(event, callback);
        });
      });
      this.listeners.clear();

      // Clean up theme monitoring
      if (this.themeQueries) {
        const { contrastQuery, motionQuery } = this.themeQueries;
        contrastQuery?.removeEventListener?.("change", this.themeChangeHandler);
        motionQuery?.removeEventListener?.("change", this.themeChangeHandler);
      }

      // Remove DOM element
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }

      // Clear references
      this.element = null;
      this.engine = null;
      this.events.clear();

      this.emit("destroyed");
    } catch (error) {
      this.errorHandler(error, "destroy");
    }
  }
}

/**
 * Enhanced UIPanel - Modern panel component with accessibility and theming
 */
class UIPanel extends UIComponent {
  constructor(config = {}) {
    super({
      ...config,
      ariaRole: "dialog",
      ariaLabel: config.title || "Panel",
      styles: {
        backgroundColor: "var(--theme-surface)",
        border: "1px solid var(--theme-border)",
        borderRadius: "12px",
        padding: "20px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
        fontSize: "14px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backdropFilter: "blur(10px)",
        ...config.styles,
      },
    });

    this.title = config.title || "";
    this.content = config.content || "";
    this.resizable = config.resizable === true;
    this.closable = config.closable !== false;
    this.modal = config.modal === true;

    this.createContent();
    this.setupPanelBehavior();
  }

  /**
   * Get appropriate element tag for panels
   */
  getElementTag() {
    return "section";
  }

  /**
   * Get enhanced CSS classes for panels
   */
  getElementClasses() {
    const classes = super.getElementClasses();
    const panelClasses = ["ui-panel"];

    if (this.modal) panelClasses.push("modal-dialog");
    if (this.resizable) panelClasses.push("resizable");
    if (this.closable) panelClasses.push("closable");

    return `${classes} ${panelClasses.join(" ")}`;
  }

  createContent() {
    try {
      this.element.innerHTML = `
                ${
                  this.closable
                    ? `
                    <button class="panel-close" aria-label="Close panel" tabindex="0">
                        <span aria-hidden="true">&times;</span>
                    </button>
                `
                    : ""
                }
                ${
                  this.title
                    ? `
                    <header class="panel-header">
                        <h2 class="panel-title">${this.title}</h2>
                    </header>
                `
                    : ""
                }
                <main class="panel-content" role="main">${this.content}</main>
                <footer class="panel-controls" role="toolbar"></footer>
            `;

      // Cache frequently accessed elements
      this.cacheElements();
      this.styleContent();
    } catch (error) {
      this.errorHandler(error, "createContent");
    }
  }

  /**
   * Cache DOM elements to reduce querySelector calls
   */
  cacheElements() {
    this.cachedElements = {
      closeBtn: this.element.querySelector(".panel-close"),
      header: this.element.querySelector(".panel-header"),
      title: this.element.querySelector(".panel-title"),
      content: this.element.querySelector(".panel-content"),
      controls: this.element.querySelector(".panel-controls"),
    };
  }

  /**
   * Apply modern styling to panel content using cached elements
   */
  styleContent() {
    const { closeBtn, header, title, content, controls } = this.cachedElements;

    // Style the close button
    if (closeBtn) {
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "10px",
        right: "10px",
        background: "none",
        border: "none",
        fontSize: "24px",
        color: "var(--theme-text)",
        cursor: "pointer",
        width: "32px",
        height: "32px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "background-color 0.2s ease",
      });

      closeBtn.addEventListener("click", () => this.close());
      closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.backgroundColor = "var(--theme-border)";
      });
      closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.backgroundColor = "transparent";
      });
    }

    // Style the header
    if (header) {
      Object.assign(header.style, {
        fontWeight: "600",
        marginBottom: "16px",
        paddingBottom: "12px",
        borderBottom: "1px solid var(--theme-border)",
        color: "var(--theme-text)",
      });
    }

    // Style the title
    if (title) {
      Object.assign(title.style, {
        margin: "0",
        fontSize: "18px",
        fontWeight: "600",
        color: "var(--theme-text)",
      });
    }

    // Style the content
    if (content) {
      Object.assign(content.style, {
        marginBottom: "16px",
        lineHeight: "1.5",
        color: "var(--theme-text)",
        maxHeight: this.modal ? "60vh" : "none",
        overflowY: this.modal ? "auto" : "visible",
      });
    }

    // Style the controls
    if (controls) {
      Object.assign(controls.style, {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        paddingTop: "12px",
        borderTop: "1px solid var(--theme-border)",
      });
    }
  }

  /**
   * Setup panel-specific behavior
   */
  setupPanelBehavior() {
    // Modal behavior
    if (this.modal) {
      this.setupModalBehavior();
    }

    // Resizable behavior
    if (this.resizable) {
      this.setupResizableBehavior();
    }

    // Escape key handling
    this.addEventListener("keydown", (event) => {
      if (event.key === "Escape" && this.closable) {
        this.close();
      }
    });
  }

  /**
   * Setup modal dialog behavior
   */
  setupModalBehavior() {
    // Create backdrop
    this.backdrop = document.createElement("div");
    this.backdrop.className = "modal-backdrop";
    Object.assign(this.backdrop.style, {
      position: "fixed",
      top: "0",
      left: "0",
      width: "100%",
      height: "100%",
      backgroundColor: "rgba(0, 0, 0, 0.5)",
      backdropFilter: "blur(4px)",
      zIndex: this.zIndex - 1,
      display: "none",
    });

    // Close on backdrop click
    this.backdrop.addEventListener("click", (event) => {
      if (event.target === this.backdrop) {
        this.close();
      }
    });

    document.body.appendChild(this.backdrop);
  }

  /**
   * Setup resizable behavior
   */
  setupResizableBehavior() {
    // Add resize handles
    const handles = ["n", "e", "s", "w", "ne", "se", "sw", "nw"];
    handles.forEach((direction) => {
      const handle = document.createElement("div");
      handle.className = `resize-handle resize-${direction}`;
      handle.style.cssText = `
                position: absolute;
                background: transparent;
                cursor: ${direction}-resize;
            `;

      switch (direction) {
        case "n":
        case "s":
          handle.style.cssText += "left: 0; right: 0; height: 4px;";
          handle.style[direction === "n" ? "top" : "bottom"] = "-2px";
          break;
        case "e":
        case "w":
          handle.style.cssText += "top: 0; bottom: 0; width: 4px;";
          handle.style[direction === "e" ? "right" : "left"] = "-2px";
          break;
        default: // corners
          handle.style.cssText += "width: 8px; height: 8px;";
          if (direction.includes("n")) handle.style.top = "-4px";
          if (direction.includes("s")) handle.style.bottom = "-4px";
          if (direction.includes("e")) handle.style.right = "-4px";
          if (direction.includes("w")) handle.style.left = "-4px";
      }

      this.setupResizeHandle(handle, direction);
      this.element.appendChild(handle);
    });
  }

  /**
   * Setup individual resize handle
   */
  setupResizeHandle(handle, direction) {
    let isResizing = false;
    let startX, startY, startWidth, startHeight, startLeft, startTop;

    handle.addEventListener("mousedown", (event) => {
      isResizing = true;
      startX = event.clientX;
      startY = event.clientY;

      const rect = this.element.getBoundingClientRect();
      startWidth = rect.width;
      startHeight = rect.height;
      startLeft = rect.left;
      startTop = rect.top;

      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);

      event.preventDefault();
    });

    const handleMouseMove = (event) => {
      if (!isResizing) return;

      const deltaX = event.clientX - startX;
      const deltaY = event.clientY - startY;

      let newWidth = startWidth;
      let newHeight = startHeight;
      let newLeft = startLeft;
      let newTop = startTop;

      if (direction.includes("e")) newWidth += deltaX;
      if (direction.includes("w")) {
        newWidth -= deltaX;
        newLeft += deltaX;
      }
      if (direction.includes("s")) newHeight += deltaY;
      if (direction.includes("n")) {
        newHeight -= deltaY;
        newTop += deltaY;
      }

      // Apply constraints
      newWidth = Math.max(UI_CONSTANTS.MIN_PANEL_WIDTH, newWidth);
      newHeight = Math.max(UI_CONSTANTS.MIN_PANEL_HEIGHT, newHeight);

      this.setSize(newWidth, newHeight);
      this.setPosition(newLeft, newTop);
    };

    const handleMouseUp = () => {
      isResizing = false;
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }

  setContent(html) {
    if (this.cachedElements?.content) {
      this.cachedElements.content.innerHTML = html;
    }
  }

  /**
   * Close panel with animation
   */
  close() {
    this.emit("beforeClose");

    if (this.animated) {
      this.element.style.transition = UI_CONSTANTS.OPACITY_TRANSFORM_TRANSITION;
      this.element.style.opacity = "0";
      this.element.style.transform = "scale(0.95)";

      if (this.backdrop) {
        this.backdrop.style.transition = "opacity 0.3s ease";
        this.backdrop.style.opacity = "0";
      }

      setTimeout(() => {
        this.hide();
        this.emit("closed");
      }, TIMING.FAST);
    } else {
      this.hide();
      this.emit("closed");
    }
  }

  /**
   * Show panel with modal behavior
   */
  show() {
    if (this.modal && this.backdrop) {
      this.backdrop.style.display = "block";
      if (this.animated) {
        this.backdrop.style.opacity = "0";
        requestAnimationFrame(() => {
          this.backdrop.style.transition = "opacity 0.3s ease";
          this.backdrop.style.opacity = "1";
        });
      }
    }

    super.show();

    // Focus management for accessibility
    const firstFocusable = this.element.querySelector(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    if (firstFocusable) {
      setTimeout(
        () => firstFocusable.focus(),
        UI_CONSTANTS.FOCUS_TRANSITION_DELAY,
      );
    }
  }

  /**
   * Hide panel and backdrop
   */
  hide() {
    if (this.backdrop) {
      this.backdrop.style.display = "none";
    }

    super.hide();
  }

  /**
   * Add modern button with accessibility and theming
   */
  addButton(text, onClick, options = {}) {
    const button = document.createElement("button");
    button.textContent = text;
    button.className = "panel-button ui-button";
    button.type = "button";

    // Accessibility attributes
    if (options.ariaLabel) {
      button.setAttribute("aria-label", options.ariaLabel);
    }

    if (options.disabled) {
      button.disabled = true;
      button.setAttribute("aria-disabled", "true");
    }

    // Apply modern styling
    Object.assign(button.style, {
      padding: "8px 16px",
      margin: "4px",
      border: "none",
      backgroundColor: "var(--theme-primary)",
      color: "white",
      borderRadius: "6px",
      cursor: options.disabled ? "not-allowed" : "pointer",
      fontSize: "14px",
      fontWeight: "500",
      fontFamily: "inherit",
      minHeight: `${UI_CONSTANTS.TOUCH_TARGET_SIZE}px`,
      transition: "all 0.2s ease",
      outline: "none",
      opacity: options.disabled ? "0.6" : "1",
      ...options.styles,
    });

    // Enhanced event handling
    if (!options.disabled) {
      button.addEventListener("click", (event) => {
        try {
          onClick(event);
        } catch (error) {
          this.errorHandler(error, "button-click");
        }
      });

      // Hover effects
      button.addEventListener("mouseenter", () => {
        if (!button.disabled) {
          button.style.transform = "translateY(-1px)";
          button.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";
        }
      });

      button.addEventListener("mouseleave", () => {
        button.style.transform = "translateY(0)";
        button.style.boxShadow = "none";
      });

      // Active state
      button.addEventListener("mousedown", () => {
        button.style.transform = "translateY(0) scale(0.98)";
      });

      button.addEventListener("mouseup", () => {
        button.style.transform = "translateY(-1px) scale(1)";
      });

      // Keyboard handling
      button.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          button.click();
        }
      });
    }

    // Add focus styles
    button.addEventListener("focus", () => {
      button.style.outline = `2px solid var(--theme-primary)`;
      button.style.outlineOffset = "2px";
    });

    button.addEventListener("blur", () => {
      button.style.outline = "none";
    });

    if (this.cachedElements?.controls) {
      this.cachedElements.controls.appendChild(button);
    }

    return button;
  }

  /**
   * Add modern slider with accessibility and theming
   */
  addSlider(label, min, max, value, onChange, options = {}) {
    const container = document.createElement("div");
    container.className = "slider-container";
    container.style.marginBottom = "16px";

    // Create label
    const labelEl = document.createElement("label");
    labelEl.textContent = label;
    labelEl.style.cssText = `
            display: block;
            margin-bottom: 8px;
            font-size: 14px;
            font-weight: 500;
            color: var(--theme-text);
        `;

    // Create slider input
    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = min;
    slider.max = max;
    slider.value = value;
    slider.step = options.step || 1;
    slider.className = "panel-slider";

    // Generate unique ID for accessibility
    const sliderId = `slider-${this.id}-${Date.now()}`;
    slider.id = sliderId;
    labelEl.setAttribute("for", sliderId);

    // Accessibility attributes
    slider.setAttribute("role", "slider");
    slider.setAttribute("aria-valuemin", min);
    slider.setAttribute("aria-valuemax", max);
    slider.setAttribute("aria-valuenow", value);
    slider.setAttribute("aria-label", label);

    // Apply modern styling
    Object.assign(slider.style, {
      width: "100%",
      height: "6px",
      borderRadius: "3px",
      background: "var(--theme-border)",
      outline: "none",
      appearance: "none",
      marginBottom: "8px",
      cursor: "pointer",
      ...options.styles,
    });

    // Style the thumb (webkit browsers)
    const styleSheet = document.createElement("style");
    styleSheet.textContent = `
            #${sliderId}::-webkit-slider-thumb {
                appearance: none;
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--theme-primary);
                cursor: pointer;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
                transition: transform 0.2s ease;
            }
            
            #${sliderId}::-webkit-slider-thumb:hover {
                transform: scale(1.1);
            }
            
            #${sliderId}::-moz-range-thumb {
                width: 20px;
                height: 20px;
                border-radius: 50%;
                background: var(--theme-primary);
                cursor: pointer;
                border: none;
                box-shadow: 0 2px 4px rgba(0,0,0,0.2);
            }
            
            #${sliderId}:focus::-webkit-slider-thumb {
                outline: 2px solid var(--theme-primary);
                outline-offset: 2px;
            }
        `;
    document.head.appendChild(styleSheet);

    // Create value display
    const valueDisplay = document.createElement("div");
    valueDisplay.className = "slider-value-display";
    valueDisplay.style.cssText = `
            display: flex;
            justify-content: space-between;
            align-items: center;
            font-size: 12px;
            color: var(--theme-text);
            opacity: 0.8;
        `;

    const currentValue = document.createElement("span");
    currentValue.textContent = value;
    currentValue.style.fontWeight = "600";

    const minMaxDisplay = document.createElement("span");
    minMaxDisplay.textContent = `${min} - ${max}`;

    valueDisplay.appendChild(currentValue);
    valueDisplay.appendChild(minMaxDisplay);

    // Enhanced event handling
    const handleInput = (e) => {
      const newValue = parseFloat(e.target.value);
      currentValue.textContent = newValue;
      slider.setAttribute("aria-valuenow", newValue);

      try {
        onChange(newValue, e);
      } catch (error) {
        this.errorHandler(error, "slider-change");
      }
    };

    // Debounce for performance
    const debouncedHandler = this.debounce(
      handleInput,
      UI_CONSTANTS.FOCUS_DELAY,
    ); // ~60fps
    slider.addEventListener("input", debouncedHandler);

    // Immediate feedback for accessibility
    slider.addEventListener("input", (e) => {
      const newValue = parseFloat(e.target.value);
      currentValue.textContent = newValue;
      slider.setAttribute("aria-valuenow", newValue);
    });

    // Keyboard enhancements
    slider.addEventListener("keydown", (event) => {
      const step = parseFloat(slider.step);
      let currentVal = parseFloat(slider.value);

      switch (event.key) {
        case "ArrowUp":
        case "ArrowRight":
          event.preventDefault();
          currentVal = Math.min(max, currentVal + step);
          break;
        case "ArrowDown":
        case "ArrowLeft":
          event.preventDefault();
          currentVal = Math.max(min, currentVal - step);
          break;
        case "Home":
          event.preventDefault();
          currentVal = min;
          break;
        case "End":
          event.preventDefault();
          currentVal = max;
          break;
        case "PageUp":
          event.preventDefault();
          currentVal = Math.min(max, currentVal + step * 10);
          break;
        case "PageDown":
          event.preventDefault();
          currentVal = Math.max(min, currentVal - step * 10);
          break;
        default:
          return;
      }

      slider.value = currentVal;
      handleInput({ target: slider });
    });

    // Assemble the slider component
    container.appendChild(labelEl);
    container.appendChild(slider);
    container.appendChild(valueDisplay);

    if (this.cachedElements?.controls) {
      this.cachedElements.controls.appendChild(container);
    }

    return {
      container,
      slider,
      valueDisplay,
      setValue: (newValue) => {
        slider.value = newValue;
        currentValue.textContent = newValue;
        slider.setAttribute("aria-valuenow", newValue);
      },
    };
  }

  /**
   * Enhanced destroy method for panels
   */
  destroy() {
    // Clean up backdrop
    if (this.backdrop && this.backdrop.parentNode) {
      this.backdrop.parentNode.removeChild(this.backdrop);
    }

    super.destroy();
  }

  // ...existing panel methods...
}

/**
 * Enhanced EthicsDisplay - Modern ethics metrics visualization with accessibility
 */
class EthicsDisplay extends UIComponent {
  constructor(config = {}) {
    super({
      ...config,
      ariaRole: "status",
      ariaLabel: "Ethics metrics display",
      accessible: true,
      animated: config.animated !== false,
      styles: {
        backgroundColor: "var(--theme-surface)",
        color: "var(--theme-text)",
        border: "1px solid var(--theme-border)",
        borderRadius: "12px",
        padding: "20px",
        fontSize: "14px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        backdropFilter: "blur(10px)",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        ...config.styles,
      },
    });

    this.metrics = config.metrics || new Map();
    this.showLabels = config.showLabels !== false;
    this.showValues = config.showValues !== false;
    this.format = config.format || "percentage"; // 'percentage' | 'decimal' | 'score'
    this.colorMode = config.colorMode || "gradient"; // 'gradient' | 'threshold' | 'single'
    this.animated = config.animated !== false && !this.theme.reducedMotion;

    // Color schemes for different themes
    this.colorSchemes = {
      gradient: {
        low: "#ef4444", // Red
        medium: "#f59e0b", // Amber
        high: "#22c55e", // Green
      },
      threshold: {
        poor: "#ef4444",
        fair: "#f59e0b",
        good: "#22c55e",
        excellent: "#06b6d4",
      },
    };

    this.createMetersDisplay();
    this.setupLiveRegion();
  }

  /**
   * Get appropriate element tag
   */
  getElementTag() {
    return "section";
  }

  /**
   * Get enhanced CSS classes
   */
  getElementClasses() {
    const classes = super.getElementClasses();
    const displayClasses = ["ethics-display"];

    if (this.animated) displayClasses.push("animated");
    if (this.colorMode) displayClasses.push(`color-${this.colorMode}`);

    return `${classes} ${displayClasses.join(" ")}`;
  }

  createMetersDisplay() {
    try {
      this.element.innerHTML = `
                <header class="ethics-header">
                    <h3 class="ethics-title">Ethics Metrics</h3>
                    <div class="ethics-summary" aria-live="polite"></div>
                </header>
                <main class="ethics-meters" role="main"></main>
            `;

      // Cache frequently accessed elements
      this.cacheElements();
      this.styleHeader();
      this.renderMeters();
    } catch (error) {
      this.errorHandler(error, "createMetersDisplay");
    }
  }

  /**
   * Cache DOM elements to reduce querySelector calls
   */
  cacheElements() {
    this.cachedElements = {
      header: this.element.querySelector(".ethics-header"),
      title: this.element.querySelector(".ethics-title"),
      summary: this.element.querySelector(".ethics-summary"),
      meters: this.element.querySelector(".ethics-meters"),
    };
  }

  /**
   * Style the header elements using cached references
   */
  styleHeader() {
    const { header, title, summary } = this.cachedElements;

    if (header) {
      Object.assign(header.style, {
        marginBottom: "16px",
        borderBottom: "1px solid var(--theme-border)",
        paddingBottom: "12px",
      });
    }

    if (title) {
      Object.assign(title.style, {
        margin: "0 0 8px 0",
        fontSize: "18px",
        fontWeight: "600",
        color: "var(--theme-text)",
      });
    }

    if (summary) {
      Object.assign(summary.style, {
        fontSize: "12px",
        color: "var(--theme-text)",
        opacity: "0.8",
      });
    }
  }

  /**
   * Setup live region for screen readers
   */
  setupLiveRegion() {
    this.liveRegion = document.createElement("div");
    this.liveRegion.setAttribute("aria-live", "polite");
    this.liveRegion.setAttribute("aria-atomic", "false");
    this.liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;

    this.element.appendChild(this.liveRegion);
  }

  /**
   * Render all ethics meters using cached elements
   */
  renderMeters() {
    if (!this.cachedElements?.meters) return;

    this.cachedElements.meters.innerHTML = "";

    this.metrics.forEach((metric, name) => {
      const meterElement = this.createMeter(metric, name);
      this.cachedElements.meters.appendChild(meterElement);
    });

    this.updateSummary();
  }

  /**
   * Create individual ethics meter
   */
  createMeter(metric, name) {
    const meterContainer = document.createElement("div");
    meterContainer.className = "ethics-meter";
    meterContainer.setAttribute("data-metric", name);

    // Generate unique IDs for accessibility
    const labelId = `label-${this.id}-${name}`;
    const valueId = `value-${this.id}-${name}`;

    const value = Math.round(metric.value || 0);
    const formattedValue = this.formatValue(metric.value || 0);
    const color = this.getColorForValue(metric.value || 0);
    const description = metric.description || `${metric.label} level`;

    meterContainer.innerHTML = `
            ${
              this.showLabels
                ? `
                <div class="meter-label" id="${labelId}">
                    ${metric.label}
                    ${metric.description ? `<span class="meter-description">${metric.description}</span>` : ""}
                </div>
            `
                : ""
            }
            
            <div class="meter-container" role="progressbar" 
                 aria-labelledby="${labelId}" 
                 aria-describedby="${valueId}"
                 aria-valuemin="0" 
                 aria-valuemax="100" 
                 aria-valuenow="${value}"
                 aria-valuetext="${formattedValue} ${description}">
                 
                <div class="meter-track"></div>
                <div class="meter-fill" style="width: 0%; background-color: ${color};"></div>
                
                ${
                  this.showValues
                    ? `
                    <div class="meter-value" id="${valueId}" aria-hidden="true">
                        ${formattedValue}
                    </div>
                `
                    : ""
                }
            </div>
        `;

    this.styleMeter(meterContainer, metric);

    return meterContainer;
  }

  /**
   * Style individual meter
   */
  styleMeter(container) {
    Object.assign(container.style, {
      marginBottom: "16px",
      position: "relative",
    });

    const label = container.querySelector(".meter-label");
    if (label) {
      Object.assign(label.style, {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "8px",
        fontSize: "14px",
        fontWeight: "500",
        color: "var(--theme-text)",
      });
    }

    const description = container.querySelector(".meter-description");
    if (description) {
      Object.assign(description.style, {
        fontSize: "12px",
        fontWeight: "400",
        opacity: "0.7",
        fontStyle: "italic",
      });
    }

    const meterContainer = container.querySelector(".meter-container");
    if (meterContainer) {
      Object.assign(meterContainer.style, {
        position: "relative",
        height: "12px",
        borderRadius: "6px",
        overflow: "hidden",
        backgroundColor: "var(--theme-border)",
        border: "1px solid var(--theme-border)",
      });
    }

    const track = container.querySelector(".meter-track");
    if (track) {
      Object.assign(track.style, {
        position: "absolute",
        top: "0",
        left: "0",
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.1)",
        borderRadius: "6px",
      });
    }

    const fill = container.querySelector(".meter-fill");
    if (fill) {
      Object.assign(fill.style, {
        position: "absolute",
        top: "0",
        left: "0",
        height: "100%",
        borderRadius: "6px",
        transition: this.animated
          ? "width 0.8s cubic-bezier(0.4, 0, 0.2, 1), background-color 0.3s ease"
          : "none",
        backgroundImage:
          this.colorMode === "gradient"
            ? "linear-gradient(90deg, var(--meter-color) 0%, var(--meter-color) 100%)"
            : "none",
      });
    }

    const valueDisplay = container.querySelector(".meter-value");
    if (valueDisplay) {
      Object.assign(valueDisplay.style, {
        position: "absolute",
        right: "8px",
        top: "50%",
        transform: "translateY(-50%)",
        fontSize: "11px",
        fontWeight: "600",
        color: "var(--theme-text)",
        textShadow: "0 1px 2px rgba(0,0,0,0.3)",
        pointerEvents: "none",
      });
    }
  }

  /**
   * Get color for metric value
   */
  getColorForValue(value) {
    if (this.colorMode === "single") {
      return this.colorSchemes.gradient.high;
    }

    const normalized = Math.max(0, Math.min(100, value)) / 100;

    if (this.colorMode === "threshold") {
      if (normalized < COMMON.OPACITY_30)
        return this.colorSchemes.threshold.poor;
      if (normalized < COMMON.HALF) return this.colorSchemes.threshold.fair;
      if (normalized < COMMON.OPACITY_80)
        return this.colorSchemes.threshold.good;
      return this.colorSchemes.threshold.excellent;
    }

    // Gradient mode
    if (normalized < COMMON.HALF) {
      return this.interpolateColor(
        this.colorSchemes.gradient.low,
        this.colorSchemes.gradient.medium,
        normalized * 2,
      );
    } else {
      return this.interpolateColor(
        this.colorSchemes.gradient.medium,
        this.colorSchemes.gradient.high,
        (normalized - COMMON.HALF) * COMMON.TWO,
      );
    }
  }

  /**
   * Interpolate between two hex colors
   */
  interpolateColor(color1, color2, factor) {
    const c1 = this.hexToRgb(color1);
    const c2 = this.hexToRgb(color2);

    const r = Math.round(c1.r + (c2.r - c1.r) * factor);
    const g = Math.round(c1.g + (c2.g - c1.g) * factor);
    const b = Math.round(c1.b + (c2.b - c1.b) * factor);

    return `rgb(${r}, ${g}, ${b})`;
  }

  /**
   * Convert hex color to RGB
   */
  hexToRgb(hex) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
      ? {
          r: parseInt(result[1], 16),
          g: parseInt(result[2], 16),
          b: parseInt(result[3], 16),
        }
      : { r: 0, g: 0, b: 0 };
  }

  /**
   * Format value based on format setting
   */
  formatValue(value) {
    switch (this.format) {
      case "decimal":
        return (value / 100).toFixed(2);
      case "score":
        return `${Math.round(value)}/100`;
      case "percentage":
      default:
        return `${Math.round(value)}%`;
    }
  }

  /**
   * Update ethics summary using cached elements
   */
  updateSummary() {
    if (!this.cachedElements?.summary || this.metrics.size === 0) return;

    const values = Array.from(this.metrics.values()).map((m) => m.value || 0);
    const average = values.reduce((sum, val) => sum + val, 0) / values.length;
    const totalMetrics = this.metrics.size;

    const gradeText = this.getEthicsGrade(average);
    this.cachedElements.summary.textContent = `Overall: ${this.formatValue(average)} (${gradeText}) • ${totalMetrics} metrics`;
  }

  /**
   * Get ethics grade based on average score
   */
  getEthicsGrade(score) {
    if (score >= UI_CONSTANTS.ETHICS_GRADES.EXCELLENT) return "Excellent";
    if (score >= UI_CONSTANTS.ETHICS_GRADES.GOOD) return "Good";
    if (score >= UI_CONSTANTS.ETHICS_GRADES.FAIR) return "Fair";
    if (score >= UI_CONSTANTS.ETHICS_GRADES.NEEDS_IMPROVEMENT)
      return "Needs Improvement";
    return "Critical Issues";
  }

  /**
   * Update specific metric with animation
   */
  updateMetric(metricName, newValue) {
    const metric = this.metrics.get(metricName);
    if (!metric) return;

    const oldValue = metric.value || 0;
    metric.value = Math.max(0, Math.min(100, newValue));

    const meterElement = this.element.querySelector(
      `[data-metric="${metricName}"]`,
    );
    if (!meterElement) return;

    const fill = meterElement.querySelector(".meter-fill");
    const valueDisplay = meterElement.querySelector(".meter-value");
    const progressBar = meterElement.querySelector(".meter-container");

    if (fill) {
      const newColor = this.getColorForValue(metric.value);
      fill.style.backgroundColor = newColor;

      if (this.animated && !this.theme.reducedMotion) {
        // Animate the width change
        fill.style.width = `${metric.value}%`;
      } else {
        fill.style.width = `${metric.value}%`;
      }
    }

    if (valueDisplay) {
      valueDisplay.textContent = this.formatValue(metric.value);
    }

    if (progressBar) {
      progressBar.setAttribute("aria-valuenow", Math.round(metric.value));
      progressBar.setAttribute(
        "aria-valuetext",
        `${this.formatValue(metric.value)} ${metric.description || metric.label}`,
      );
    }

    // Announce significant changes for accessibility
    if (Math.abs(newValue - oldValue) >= 10) {
      const changeText = `${metric.label} changed to ${this.formatValue(metric.value)}`;
      this.announce(changeText);
    }

    this.updateSummary();
    this.emit("metricUpdated", {
      metricName,
      oldValue,
      newValue: metric.value,
    });
  }

  /**
   * Add new metric
   */
  addMetric(name, config) {
    this.metrics.set(name, {
      label: config.label || name,
      value: config.value || 0,
      description: config.description || "",
      color: config.color || null,
    });

    this.renderMeters();
    this.emit("metricAdded", { name, config });
  }

  /**
   * Remove metric
   */
  removeMetric(name) {
    if (this.metrics.delete(name)) {
      this.renderMeters();
      this.emit("metricRemoved", { name });
    }
  }

  /**
   * Get all metric values
   */
  getMetrics() {
    const result = {};
    this.metrics.forEach((metric, name) => {
      result[name] = metric.value;
    });
    return result;
  }

  /**
   * Set multiple metrics at once
   */
  setMetrics(values) {
    Object.entries(values).forEach(([name, value]) => {
      if (this.metrics.has(name)) {
        this.updateMetric(name, value);
      }
    });
  }

  /**
   * Reset all metrics to zero
   */
  resetMetrics() {
    this.metrics.forEach((metric, name) => {
      this.updateMetric(name, 0);
    });

    this.emit("metricsReset");
  }
}

/**
 * Enhanced FeedbackSystem - Modern feedback component with accessibility and theming
 */
class FeedbackSystem extends UIComponent {
  constructor(config = {}) {
    super({
      ...config,
      ariaRole: "alert",
      ariaLabel: "Feedback system",
      accessible: true,
      animated: config.animated !== false,
      styles: {
        backgroundColor: "var(--theme-surface)",
        color: "var(--theme-text)",
        border: "1px solid var(--theme-border)",
        borderRadius: "12px",
        padding: "16px",
        fontSize: "14px",
        fontFamily: "system-ui, -apple-system, sans-serif",
        maxWidth: "400px",
        boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        ...config.styles,
      },
    });

    this.feedbackQueue = [];
    this.currentFeedback = null;
    this.autoHide = config.autoHide !== false;
    this.hideDelay = config.hideDelay || UI_CONSTANTS.DEFAULT_HIDE_DELAY;
    this.maxItems = config.maxItems || UI_CONSTANTS.MAX_FEEDBACK_ITEMS;
    this.position = config.position || "top-right"; // top-right, top-left, bottom-right, bottom-left

    this.createFeedbackContainer();
    this.setupPositioning();
  }

  /**
   * Get appropriate element tag
   */
  getElementTag() {
    return "aside";
  }

  /**
   * Get enhanced CSS classes
   */
  getElementClasses() {
    const classes = super.getElementClasses();
    const feedbackClasses = ["feedback-system", `position-${this.position}`];

    if (this.animated) feedbackClasses.push("animated");

    return `${classes} ${feedbackClasses.join(" ")}`;
  }

  createFeedbackContainer() {
    try {
      this.element.innerHTML = `
                <div class="feedback-header" style="display: none;">
                    <h3 class="feedback-title">Notifications</h3>
                    <button class="feedback-clear" aria-label="Clear all notifications">Clear All</button>
                </div>
                <div class="feedback-list" role="log" aria-live="polite" aria-atomic="false"></div>
            `;

      this.setupFeedbackBehavior();
    } catch (error) {
      this.errorHandler(error, "createFeedbackContainer");
    }
  }

  /**
   * Setup feedback system positioning
   */
  setupPositioning() {
    const positions = {
      "top-right": { top: "20px", right: "20px" },
      "top-left": { top: "20px", left: "20px" },
      "bottom-right": { bottom: "20px", right: "20px" },
      "bottom-left": { bottom: "20px", left: "20px" },
    };

    const pos = positions[this.position] || positions["top-right"];

    Object.assign(this.element.style, {
      position: "fixed",
      ...pos,
      zIndex: "9999",
      pointerEvents: "auto",
    });
  }

  /**
   * Setup feedback behavior
   */
  setupFeedbackBehavior() {
    const clearButton = this.element.querySelector(".feedback-clear");
    if (clearButton) {
      clearButton.addEventListener("click", () => this.clearAll());

      Object.assign(clearButton.style, {
        background: "none",
        border: "none",
        color: "var(--theme-primary)",
        cursor: "pointer",
        fontSize: "12px",
        textDecoration: "underline",
      });
    }
  }

  /**
   * Show feedback message with enhanced styling and accessibility
   */
  showFeedback(message, type = "info", options = {}) {
    try {
      const feedback = {
        id: `feedback-${Date.now()}-${Math.random().toString(UI_CONSTANTS.RANDOM_BASE).substr(2, UI_CONSTANTS.RANDOM_ID_LENGTH)}`,
        message,
        type,
        timestamp: new Date(),
        duration: options.duration || this.hideDelay,
        persistent: options.persistent === true,
        actions: options.actions || [],
      };

      // Add to queue and process
      this.feedbackQueue.push(feedback);
      if (this.feedbackQueue.length > this.maxItems) {
        this.feedbackQueue.shift();
      }

      this.renderFeedback(feedback);

      // Auto-hide if not persistent
      if (this.autoHide && !feedback.persistent) {
        setTimeout(() => {
          this.hideFeedback(feedback.id);
        }, feedback.duration);
      }

      this.emit("feedbackShown", feedback);
      return feedback.id;
    } catch (error) {
      this.errorHandler(error, "showFeedback");
      return null;
    }
  }

  /**
   * Render individual feedback item
   */
  renderFeedback(feedback) {
    const container = this.element.querySelector(".feedback-list");
    if (!container) return;

    const feedbackElement = document.createElement("div");
    feedbackElement.className = `feedback-item feedback-${feedback.type}`;
    feedbackElement.setAttribute("data-feedback-id", feedback.id);
    feedbackElement.setAttribute("role", "alert");
    feedbackElement.setAttribute("aria-live", "assertive");

    const typeIcons = {
      success: "✓",
      error: "✕",
      warning: "⚠",
      info: "ℹ",
    };

    const typeColors = {
      success: "#22c55e",
      error: "#ef4444",
      warning: "#f59e0b",
      info: "#3b82f6",
    };

    feedbackElement.innerHTML = `
            <div class="feedback-icon" aria-hidden="true">${typeIcons[feedback.type] || typeIcons.info}</div>
            <div class="feedback-content">
                <div class="feedback-message">${feedback.message}</div>
                ${
                  feedback.actions.length > 0
                    ? `
                    <div class="feedback-actions">
                        ${feedback.actions
                          .map(
                            (action) => `
                            <button class="feedback-action" data-action="${action.id}">
                                ${action.label}
                            </button>
                        `,
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
            ${
              !feedback.persistent
                ? `
                <button class="feedback-close" aria-label="Close notification" data-close="${feedback.id}">
                    <span aria-hidden="true">&times;</span>
                </button>
            `
                : ""
            }
        `;

    // Style the feedback item
    Object.assign(feedbackElement.style, {
      display: "flex",
      alignItems: "flex-start",
      gap: "12px",
      padding: "16px",
      marginBottom: "12px",
      backgroundColor: "var(--theme-surface)",
      border: `1px solid ${typeColors[feedback.type]}`,
      borderLeft: `4px solid ${typeColors[feedback.type]}`,
      borderRadius: "8px",
      boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
      position: "relative",
      opacity: "0",
      transform: this.position.includes("top")
        ? "translateY(-20px)"
        : "translateY(20px)",
      transition: this.animated ? UI_CONSTANTS.TRANSITION_CUBIC : "none",
    });

    // Style components
    this.styleFeedbackComponents(
      feedbackElement,
      feedback,
      typeColors[feedback.type],
    );

    // Setup event handlers
    this.setupFeedbackEventHandlers(feedbackElement, feedback);

    container.appendChild(feedbackElement);

    // Animate in
    if (this.animated) {
      requestAnimationFrame(() => {
        feedbackElement.style.opacity = "1";
        feedbackElement.style.transform = "translateY(0)";
      });
    } else {
      feedbackElement.style.opacity = "1";
      feedbackElement.style.transform = "translateY(0)";
    }

    // Show header if we have multiple items
    this.updateHeader();
  }

  /**
   * Style feedback components
   */
  styleFeedbackComponents(element, feedback, accentColor) {
    const icon = element.querySelector(".feedback-icon");
    if (icon) {
      Object.assign(icon.style, {
        color: accentColor,
        fontSize: "18px",
        fontWeight: "bold",
        minWidth: "20px",
        textAlign: "center",
      });
    }

    const content = element.querySelector(".feedback-content");
    if (content) {
      Object.assign(content.style, {
        flex: "1",
        lineHeight: "1.4",
      });
    }

    const message = element.querySelector(".feedback-message");
    if (message) {
      Object.assign(message.style, {
        color: "var(--theme-text)",
        marginBottom: feedback.actions.length > 0 ? "8px" : "0",
      });
    }

    const actions = element.querySelector(".feedback-actions");
    if (actions) {
      Object.assign(actions.style, {
        display: "flex",
        gap: "8px",
        flexWrap: "wrap",
      });
    }

    // Style action buttons
    element.querySelectorAll(".feedback-action").forEach((btn) => {
      Object.assign(btn.style, {
        padding: "4px 12px",
        border: `1px solid ${accentColor}`,
        backgroundColor: "transparent",
        color: accentColor,
        borderRadius: "4px",
        fontSize: "12px",
        cursor: "pointer",
        transition: "all 0.2s ease",
      });

      btn.addEventListener("mouseenter", () => {
        btn.style.backgroundColor = accentColor;
        btn.style.color = "white";
      });

      btn.addEventListener("mouseleave", () => {
        btn.style.backgroundColor = "transparent";
        btn.style.color = accentColor;
      });
    });

    const closeBtn = element.querySelector(".feedback-close");
    if (closeBtn) {
      Object.assign(closeBtn.style, {
        position: "absolute",
        top: "8px",
        right: "8px",
        background: "none",
        border: "none",
        fontSize: "18px",
        color: "var(--theme-text)",
        cursor: "pointer",
        width: "24px",
        height: "24px",
        borderRadius: "50%",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        opacity: "0.7",
        transition: "all 0.2s ease",
      });

      closeBtn.addEventListener("mouseenter", () => {
        closeBtn.style.opacity = "1";
        closeBtn.style.backgroundColor = "var(--theme-border)";
      });

      closeBtn.addEventListener("mouseleave", () => {
        closeBtn.style.opacity = "0.7";
        closeBtn.style.backgroundColor = "transparent";
      });
    }
  }

  /**
   * Setup event handlers for feedback item
   */
  setupFeedbackEventHandlers(element, feedback) {
    // Close button
    const closeBtn = element.querySelector(".feedback-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        this.hideFeedback(feedback.id);
      });
    }

    // Action buttons
    element.querySelectorAll(".feedback-action").forEach((btn) => {
      btn.addEventListener("click", (event) => {
        const actionId = btn.getAttribute("data-action");
        const action = feedback.actions.find((a) => a.id === actionId);

        if (action && action.handler) {
          try {
            action.handler(feedback, event);
          } catch (error) {
            this.errorHandler(error, "feedback-action");
          }
        }

        // Hide feedback after action unless persistent
        if (!feedback.persistent) {
          this.hideFeedback(feedback.id);
        }
      });
    });

    // Keyboard navigation
    element.addEventListener("keydown", (event) => {
      if (this.disabled) return;

      if (event.key === "Escape") {
        this.hideFeedback(feedback.id);
      }
    });
  }

  /**
   * Hide specific feedback item
   */
  hideFeedback(feedbackId) {
    const element = this.element.querySelector(
      `[data-feedback-id="${feedbackId}"]`,
    );
    if (!element) return;

    if (this.animated) {
      element.style.transition = UI_CONSTANTS.TRANSITION_CUBIC;
      element.style.opacity = "0";
      element.style.transform = this.position.includes("top")
        ? "translateY(-20px)"
        : "translateY(20px)";
      element.style.maxHeight = "0";
      element.style.marginBottom = "0";
      element.style.padding = "0 16px";

      setTimeout(() => {
        if (element.parentNode) {
          element.parentNode.removeChild(element);
        }
        this.updateHeader();
      }, UI_CONSTANTS.CLEANUP_DELAY);
    } else {
      element.parentNode?.removeChild(element);
      this.updateHeader();
    }

    // Remove from queue
    this.feedbackQueue = this.feedbackQueue.filter((f) => f.id !== feedbackId);

    this.emit("feedbackHidden", { feedbackId });
  }

  /**
   * Update header visibility
   */
  updateHeader() {
    const header = this.element.querySelector(".feedback-header");
    const items = this.element.querySelectorAll(".feedback-item");

    if (header) {
      header.style.display = items.length > 1 ? "flex" : "none";

      if (items.length > 1) {
        Object.assign(header.style, {
          justifyContent: "space-between",
          alignItems: "center",
          padding: "12px 16px",
          borderBottom: "1px solid var(--theme-border)",
          marginBottom: "12px",
        });
      }
    }
  }

  /**
   * Convenience methods for different feedback types
   */
  showSuccess(message, options = {}) {
    return this.showFeedback(message, "success", options);
  }

  showError(message, options = {}) {
    return this.showFeedback(message, "error", {
      ...options,
      persistent: true,
    });
  }

  showWarning(message, options = {}) {
    return this.showFeedback(message, "warning", options);
  }

  showInfo(message, options = {}) {
    return this.showFeedback(message, "info", options);
  }

  /**
   * Clear all feedback items
   */
  clearAll() {
    const items = this.element.querySelectorAll(".feedback-item");
    items.forEach((item) => {
      const feedbackId = item.getAttribute("data-feedback-id");
      this.hideFeedback(feedbackId);
    });

    this.emit("allFeedbackCleared");
  }

  /**
   * Get current feedback count
   */
  getCount() {
    return this.feedbackQueue.length;
  }

  /**
   * Check if feedback system has any items
   */
  hasItems() {
    return this.feedbackQueue.length > 0;
  }
}

/**
 * Enhanced Button - Modern button component with accessibility and theming
 */
class Button extends UIComponent {
  constructor(config = {}) {
    super({
      ...config,
      ariaRole: "button",
      focusable: true,
      tabIndex: config.disabled ? -1 : 0,
      styles: {
        padding: "12px 24px",
        border: "none",
        borderRadius: "8px",
        fontSize: "14px",
        fontWeight: "500",
        fontFamily: "system-ui, -apple-system, sans-serif",
        cursor: config.disabled ? "not-allowed" : "pointer",
        minHeight: `${UI_CONSTANTS.TOUCH_TARGET_SIZE}px`,
        display: "inline-flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "8px",
        textDecoration: "none",
        outline: "none",
        transition: "all 0.2s ease",
        ...config.styles,
      },
    });

    this.text = config.text || "";
    this.icon = config.icon || null;
    this.variant = config.variant || "primary"; // primary, secondary, outline, ghost
    this.size = config.size || "medium"; // small, medium, large
    this.disabled = config.disabled === true;
    this.loading = config.loading === true;
    this.onClick = config.onClick || (() => {});

    this.createButton();
    this.applyVariantStyles();
    this.setupButtonBehavior();
  }

  /**
   * Get appropriate element tag
   */
  getElementTag() {
    return "button";
  }

  /**
   * Get enhanced CSS classes
   */
  getElementClasses() {
    const classes = super.getElementClasses();
    const buttonClasses = [
      "ui-button",
      `variant-${this.variant}`,
      `size-${this.size}`,
    ];

    if (this.disabled) buttonClasses.push("disabled");
    if (this.loading) buttonClasses.push("loading");

    return `${classes} ${buttonClasses.join(" ")}`;
  }

  createButton() {
    try {
      this.element.type = "button";
      this.element.disabled = this.disabled;

      if (this.ariaLabel) {
        this.element.setAttribute("aria-label", this.ariaLabel);
      }

      if (this.disabled) {
        this.element.setAttribute("aria-disabled", "true");
      }

      this.updateButtonContent();
    } catch (error) {
      this.errorHandler(error, "createButton");
    }
  }

  /**
   * Update button content
   */
  updateButtonContent() {
    const content = [];

    if (this.loading) {
      content.push('<span class="button-spinner" aria-hidden="true">⟳</span>');
    } else if (this.icon) {
      content.push(
        `<span class="button-icon" aria-hidden="true">${this.icon}</span>`,
      );
    }

    if (this.text) {
      content.push(`<span class="button-text">${this.text}</span>`);
    }

    this.element.innerHTML = content.join("");

    // Style the spinner
    const spinner = this.element.querySelector(".button-spinner");
    if (spinner) {
      Object.assign(spinner.style, {
        animation: "spin 1s linear infinite",
        display: "inline-block",
      });

      // Add spin animation if not exists
      if (!document.getElementById("button-spin-animation")) {
        const style = document.createElement("style");
        style.id = "button-spin-animation";
        style.textContent = `
                    @keyframes spin {
                        from { transform: rotate(0deg); }
                        to { transform: rotate(360deg); }
                    }
                `;
        document.head.appendChild(style);
      }
    }
  }

  /**
   * Apply variant-specific styles
   */
  applyVariantStyles() {
    const variants = {
      primary: {
        backgroundColor: "var(--theme-primary)",
        color: "white",
        border: "1px solid var(--theme-primary)",
      },
      secondary: {
        backgroundColor: "var(--theme-border)",
        color: "var(--theme-text)",
        border: "1px solid var(--theme-border)",
      },
      outline: {
        backgroundColor: "transparent",
        color: "var(--theme-primary)",
        border: "1px solid var(--theme-primary)",
      },
      ghost: {
        backgroundColor: "transparent",
        color: "var(--theme-text)",
        border: "1px solid transparent",
      },
    };

    const sizes = {
      small: { padding: "8px 16px", fontSize: "12px", minHeight: "32px" },
      medium: { padding: "12px 24px", fontSize: "14px", minHeight: "44px" },
      large: { padding: "16px 32px", fontSize: "16px", minHeight: "52px" },
    };

    const variantStyles = variants[this.variant] || variants.primary;
    const sizeStyles = sizes[this.size] || sizes.medium;

    Object.assign(this.element.style, variantStyles, sizeStyles);

    if (this.disabled) {
      this.element.style.opacity = "0.6";
      this.element.style.cursor = "not-allowed";
    }
  }

  /**
   * Setup button behavior and interactions
   */
  setupButtonBehavior() {
    if (this.disabled) return;

    // Click handler
    this.element.addEventListener("click", (event) => {
      if (this.loading) return;

      try {
        this.onClick(event);
        this.emit("click", { event });
      } catch (error) {
        this.errorHandler(error, "button-click");
      }
    });

    // Hover effects
    this.element.addEventListener("mouseenter", () => {
      if (this.disabled || this.loading) return;

      this.element.style.transform = "translateY(-1px)";
      this.element.style.boxShadow = "0 4px 8px rgba(0,0,0,0.2)";

      // Variant-specific hover effects
      if (this.variant === "primary") {
        this.element.style.filter = "brightness(1.1)";
      } else if (this.variant === "outline" || this.variant === "ghost") {
        this.element.style.backgroundColor = "var(--theme-primary)";
        this.element.style.color = "white";
      }
    });

    this.element.addEventListener("mouseleave", () => {
      if (this.disabled || this.loading) return;

      this.element.style.transform = "translateY(0)";
      this.element.style.boxShadow = "none";
      this.element.style.filter = "none";

      // Reset variant styles
      this.applyVariantStyles();
    });

    // Active state
    this.element.addEventListener("mousedown", () => {
      if (this.disabled || this.loading) return;
      this.element.style.transform = "translateY(0) scale(0.98)";
    });

    this.element.addEventListener("mouseup", () => {
      if (this.disabled || this.loading) return;
      this.element.style.transform = "translateY(-1px) scale(1)";
    });

    // Keyboard navigation
    this.element.addEventListener("keydown", (event) => {
      if (this.disabled || this.loading) return;

      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        this.element.click();
      }
    });
  }

  /**
   * Set button text
   */
  setText(text) {
    this.text = text;
    this.updateButtonContent();
  }

  /**
   * Set button icon
   */
  setIcon(icon) {
    this.icon = icon;
    this.updateButtonContent();
  }

  /**
   * Set loading state
   */
  setLoading(loading) {
    this.loading = loading;
    this.element.classList.toggle("loading", loading);
    this.updateButtonContent();

    if (loading) {
      this.element.setAttribute("aria-busy", "true");
    } else {
      this.element.removeAttribute("aria-busy");
    }
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    this.element.disabled = disabled;
    this.element.classList.toggle("disabled", disabled);

    if (disabled) {
      this.element.setAttribute("aria-disabled", "true");
      this.element.tabIndex = -1;
    } else {
      this.element.removeAttribute("aria-disabled");
      this.element.tabIndex = 0;
    }

    this.applyVariantStyles();
  }

  /**
   * Set button variant
   */
  setVariant(variant) {
    this.element.classList.remove(`variant-${this.variant}`);
    this.variant = variant;
    this.element.classList.add(`variant-${this.variant}`);
    this.applyVariantStyles();
  }
}

/**
 * Enhanced Slider - Modern slider component with accessibility and theming
 */
class Slider extends UIComponent {
  constructor(config = {}) {
    super({
      ...config,
      ariaRole: "slider",
      focusable: true,
      tabIndex: config.disabled ? -1 : 0,
      styles: {
        position: "relative",
        width: "200px",
        height: "24px",
        ...config.styles,
      },
    });

    this.min = config.min || 0;
    this.max = config.max || 100;
    this.value = Math.max(
      this.min,
      Math.min(this.max, config.value || this.min),
    );
    this.step = config.step || 1;
    this.disabled = config.disabled === true;
    this.label = config.label || "";
    this.showValue = config.showValue !== false;
    this.showLabels = config.showLabels === true;
    this.orientation = config.orientation || "horizontal"; // horizontal | vertical
    this.onChange = config.onChange || (() => {});

    this.isDragging = false;

    this.createSlider();
    this.setupSliderBehavior();
  }

  /**
   * Get enhanced CSS classes
   */
  getElementClasses() {
    const classes = super.getElementClasses();
    const sliderClasses = ["ui-slider", `orientation-${this.orientation}`];

    if (this.disabled) sliderClasses.push("disabled");

    return `${classes} ${sliderClasses.join(" ")}`;
  }

  createSlider() {
    try {
      // Set ARIA attributes
      this.element.setAttribute("aria-valuemin", this.min);
      this.element.setAttribute("aria-valuemax", this.max);
      this.element.setAttribute("aria-valuenow", this.value);

      if (this.label) {
        this.element.setAttribute("aria-label", this.label);
      }

      if (this.disabled) {
        this.element.setAttribute("aria-disabled", "true");
      }

      this.element.innerHTML = `
                ${
                  this.label && this.showLabels
                    ? `
                    <div class="slider-label">${this.label}</div>
                `
                    : ""
                }
                <div class="slider-container">
                    <div class="slider-track"></div>
                    <div class="slider-filled"></div>
                    <div class="slider-thumb" role="slider"></div>
                    ${
                      this.showLabels
                        ? `
                        <div class="slider-labels">
                            <span class="slider-min-label">${this.min}</span>
                            <span class="slider-max-label">${this.max}</span>
                        </div>
                    `
                        : ""
                    }
                </div>
                ${
                  this.showValue
                    ? `
                    <div class="slider-value" aria-live="polite">${this.value}</div>
                `
                    : ""
                }
            `;

      this.styleSlider();
      this.updateSliderPosition();
    } catch (error) {
      this.errorHandler(error, "createSlider");
    }
  }

  /**
   * Style slider components
   */
  styleSlider() {
    const container = this.element.querySelector(".slider-container");
    const track = this.element.querySelector(".slider-track");
    const filled = this.element.querySelector(".slider-filled");
    const thumb = this.element.querySelector(".slider-thumb");
    const label = this.element.querySelector(".slider-label");
    const valueDisplay = this.element.querySelector(".slider-value");
    const labels = this.element.querySelector(".slider-labels");

    if (container) {
      Object.assign(container.style, {
        position: "relative",
        width: this.orientation === "horizontal" ? "100%" : "24px",
        height: this.orientation === "horizontal" ? "24px" : "200px",
        margin: this.orientation === "horizontal" ? "12px 0" : "0 12px",
      });
    }

    if (track) {
      Object.assign(track.style, {
        position: "absolute",
        backgroundColor: "var(--theme-border)",
        borderRadius: "12px",
        ...(this.orientation === "horizontal"
          ? {
              top: "50%",
              left: "0",
              right: "0",
              height: "6px",
              transform: "translateY(-50%)",
            }
          : {
              left: "50%",
              top: "0",
              bottom: "0",
              width: "6px",
              transform: "translateX(-50%)",
            }),
      });
    }

    if (filled) {
      Object.assign(filled.style, {
        position: "absolute",
        backgroundColor: "var(--theme-primary)",
        borderRadius: "12px",
        transition: this.animated ? "all 0.2s ease" : "none",
        ...(this.orientation === "horizontal"
          ? {
              top: "50%",
              left: "0",
              height: "6px",
              transform: "translateY(-50%)",
            }
          : {
              left: "50%",
              bottom: "0",
              width: "6px",
              transform: "translateX(-50%)",
            }),
      });
    }

    if (thumb) {
      Object.assign(thumb.style, {
        position: "absolute",
        width: "20px",
        height: "20px",
        backgroundColor: "var(--theme-primary)",
        borderRadius: "50%",
        border: "2px solid white",
        boxShadow: "0 2px 4px rgba(0,0,0,0.2)",
        cursor: this.disabled ? "not-allowed" : "grab",
        transition: this.animated ? "all 0.2s ease" : "none",
        opacity: this.disabled ? "0.6" : "1",
        ...(this.orientation === "horizontal"
          ? {
              top: "50%",
              transform: "translate(-50%, -50%)",
            }
          : {
              left: "50%",
              transform: "translate(-50%, 50%)",
            }),
      });
    }

    if (label) {
      Object.assign(label.style, {
        fontSize: "14px",
        fontWeight: "500",
        color: "var(--theme-text)",
        marginBottom: this.orientation === "horizontal" ? "8px" : "0",
        marginRight: this.orientation === "vertical" ? "8px" : "0",
      });
    }

    if (valueDisplay) {
      Object.assign(valueDisplay.style, {
        fontSize: "12px",
        fontWeight: "600",
        color: "var(--theme-primary)",
        textAlign: "center",
        marginTop: this.orientation === "horizontal" ? "8px" : "0",
        marginLeft: this.orientation === "vertical" ? "8px" : "0",
      });
    }

    if (labels) {
      Object.assign(labels.style, {
        display: "flex",
        justifyContent: "space-between",
        fontSize: "11px",
        color: "var(--theme-text)",
        opacity: "0.7",
        marginTop: this.orientation === "horizontal" ? "4px" : "0",
        ...(this.orientation === "vertical"
          ? {
              flexDirection: "column",
              height: "100%",
              position: "absolute",
              left: "100%",
              top: "0",
              marginLeft: "8px",
            }
          : {}),
      });
    }
  }

  /**
   * Update slider position based on current value
   */
  updateSliderPosition() {
    const percentage = ((this.value - this.min) / (this.max - this.min)) * 100;
    const filled = this.element.querySelector(".slider-filled");
    const thumb = this.element.querySelector(".slider-thumb");

    if (this.orientation === "horizontal") {
      if (filled) filled.style.width = `${percentage}%`;
      if (thumb) thumb.style.left = `${percentage}%`;
    } else {
      if (filled) filled.style.height = `${percentage}%`;
      if (thumb) thumb.style.bottom = `${percentage}%`;
    }
  }

  /**
   * Setup slider behavior and interactions
   */
  setupSliderBehavior() {
    if (this.disabled) return;

    const container = this.element.querySelector(".slider-container");
    const thumb = this.element.querySelector(".slider-thumb");

    if (!container || !thumb) return;

    // Mouse events
    thumb.addEventListener("mousedown", this.handleMouseDown.bind(this));
    container.addEventListener("click", this.handleTrackClick.bind(this));

    // Touch events
    thumb.addEventListener("touchstart", this.handleTouchStart.bind(this), {
      passive: false,
    });

    // Keyboard events
    this.element.addEventListener("keydown", this.handleKeyDown.bind(this));

    // Focus events
    this.element.addEventListener("focus", () => {
      thumb.style.boxShadow =
        "0 0 0 3px var(--theme-primary)30, 0 2px 4px rgba(0,0,0,0.2)";
    });

    this.element.addEventListener("blur", () => {
      thumb.style.boxShadow = "0 2px 4px rgba(0,0,0,0.2)";
    });
  }

  /**
   * Handle mouse down on thumb
   */
  handleMouseDown(event) {
    if (this.disabled) return;

    event.preventDefault();
    this.isDragging = true;

    const thumb = this.element.querySelector(".slider-thumb");
    if (thumb) {
      thumb.style.cursor = "grabbing";
    }

    document.addEventListener("mousemove", this.handleMouseMove.bind(this));
    document.addEventListener("mouseup", this.handleMouseUp.bind(this));

    this.emit("dragStart", { value: this.value });
  }

  /**
   * Handle mouse move during drag
   */
  handleMouseMove(event) {
    if (!this.isDragging || this.disabled) return;

    this.updateValueFromEvent(event);
  }

  /**
   * Handle mouse up to end drag
   */
  handleMouseUp() {
    if (!this.isDragging) return;

    this.isDragging = false;

    const thumb = this.element.querySelector(".slider-thumb");
    if (thumb) {
      thumb.style.cursor = "grab";
    }

    document.removeEventListener("mousemove", this.handleMouseMove.bind(this));
    document.removeEventListener("mouseup", this.handleMouseUp.bind(this));

    this.emit("dragEnd", { value: this.value });
  }

  /**
   * Handle touch start
   */
  handleTouchStart(event) {
    if (this.disabled) return;

    event.preventDefault();
    this.isDragging = true;

    document.addEventListener("touchmove", this.handleTouchMove.bind(this), {
      passive: false,
    });
    document.addEventListener("touchend", this.handleTouchEnd.bind(this));

    this.emit("dragStart", { value: this.value });
  }

  /**
   * Handle touch move
   */
  handleTouchMove(event) {
    if (!this.isDragging || this.disabled) return;

    event.preventDefault();
    this.updateValueFromEvent(event.touches[0]);
  }

  /**
   * Handle touch end
   */
  handleTouchEnd() {
    if (!this.isDragging) return;

    this.isDragging = false;

    document.removeEventListener("touchmove", this.handleTouchMove.bind(this));
    document.removeEventListener("touchend", this.handleTouchEnd.bind(this));

    this.emit("dragEnd", { value: this.value });
  }

  /**
   * Handle track click
   */
  handleTrackClick(event) {
    if (this.disabled || this.isDragging) return;

    const thumb = event.target.closest(".slider-thumb");
    if (thumb) return; // Don't handle clicks on the thumb

    this.updateValueFromEvent(event);
  }

  /**
   * Handle keyboard navigation
   */
  handleKeyDown(event) {
    if (this.disabled) return;

    let newValue = this.value;
    const largeStep = this.step * 10;

    switch (event.key) {
      case "ArrowRight":
      case "ArrowUp":
        event.preventDefault();
        newValue = Math.min(this.max, this.value + this.step);
        break;
      case "ArrowLeft":
      case "ArrowDown":
        event.preventDefault();
        newValue = Math.max(this.min, this.value - this.step);
        break;
      case "PageUp":
        event.preventDefault();
        newValue = Math.min(this.max, this.value + largeStep);
        break;
      case "PageDown":
        event.preventDefault();
        newValue = Math.max(this.min, this.value - largeStep);
        break;
      case "Home":
        event.preventDefault();
        newValue = this.min;
        break;
      case "End":
        event.preventDefault();
        newValue = this.max;
        break;
      default:
        return;
    }

    this.setValue(newValue);
  }

  /**
   * Update value from mouse/touch event
   */
  updateValueFromEvent(event) {
    const container = this.element.querySelector(".slider-container");
    if (!container) return;

    const rect = container.getBoundingClientRect();
    let percentage;

    if (this.orientation === "horizontal") {
      percentage = (event.clientX - rect.left) / rect.width;
    } else {
      percentage = 1 - (event.clientY - rect.top) / rect.height;
    }

    percentage = Math.max(0, Math.min(1, percentage));
    const newValue = this.min + percentage * (this.max - this.min);
    const steppedValue = Math.round(newValue / this.step) * this.step;

    this.setValue(steppedValue);
  }

  /**
   * Set slider value
   */
  setValue(value) {
    const oldValue = this.value;
    this.value = Math.max(this.min, Math.min(this.max, value));

    // Update display
    this.updateSliderPosition();

    // Update ARIA
    this.element.setAttribute("aria-valuenow", this.value);

    // Update value display
    const valueDisplay = this.element.querySelector(".slider-value");
    if (valueDisplay) {
      valueDisplay.textContent = this.value;
    }

    // Call onChange if value actually changed
    if (oldValue !== this.value) {
      try {
        this.onChange(this.value, oldValue);
        this.emit("change", { value: this.value, oldValue });
      } catch (error) {
        this.errorHandler(error, "slider-change");
      }
    }
  }

  /**
   * Get current value
   */
  getValue() {
    return this.value;
  }

  /**
   * Set disabled state
   */
  setDisabled(disabled) {
    this.disabled = disabled;
    this.element.classList.toggle("disabled", disabled);

    if (disabled) {
      this.element.setAttribute("aria-disabled", "true");
      this.element.tabIndex = -1;
    } else {
      this.element.removeAttribute("aria-disabled");
      this.element.tabIndex = 0;
    }

    this.styleSlider();
  }
}

/**
 * Phase 3.2: UIManager - Global UI component coordinator with DataHandler integration
 * Manages UI components, preferences, themes, and persistent state across the application
 */
class UIManager {
  constructor(app = null) {
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.components = new Map();
    this.globalUIPreferences = {};
    this.themeWatchers = new Set();
    this.initialized = false;

    console.log(
      "[UIManager] Created with DataHandler support:",
      !!this.dataHandler,
    );
  }

  /**
   * Initialize UIManager with global UI preferences
   */
  async initialize() {
    if (this.initialized) return;

    try {
      // Load global UI preferences
      await this.loadGlobalUIPreferences();

      // Apply global theme preferences
      this.applyGlobalThemePreferences();

      // Setup theme change monitoring
      this.setupGlobalThemeMonitoring();

      this.initialized = true;
      console.log("[UIManager] Initialized with global UI preferences");
    } catch (error) {
      console.warn("[UIManager] Failed to initialize:", error);
    }
  }

  /**
   * Register a UI component with the manager
   */
  registerComponent(component) {
    if (component && component.id) {
      this.components.set(component.id, component);
      console.log(
        `[UIManager] Registered component: ${component.constructor.name} (${component.id})`,
      );
    }
  }

  /**
   * Unregister a UI component
   */
  unregisterComponent(componentId) {
    if (this.components.has(componentId)) {
      const component = this.components.get(componentId);
      this.components.delete(componentId);
      console.log(
        `[UIManager] Unregistered component: ${component.constructor.name} (${componentId})`,
      );
    }
  }

  /**
   * Create UI component with DataHandler support
   */
  createComponent(ComponentClass, config = {}) {
    const enhancedConfig = {
      ...config,
      app: this.app,
    };

    const component = new ComponentClass(enhancedConfig);
    this.registerComponent(component);
    return component;
  }

  /**
   * Load global UI preferences from DataHandler
   */
  async loadGlobalUIPreferences() {
    if (!this.dataHandler) return;

    try {
      const storedPreferences = await this.dataHandler.getData(
        "global_ui_preferences",
      );
      if (storedPreferences && Object.keys(storedPreferences).length > 0) {
        this.globalUIPreferences = storedPreferences;
        console.log("[UIManager] Loaded global UI preferences");
      }
    } catch (error) {
      console.warn("[UIManager] Failed to load global UI preferences:", error);
    }
  }

  /**
   * Save global UI preferences to DataHandler
   */
  async saveGlobalUIPreferences() {
    if (!this.dataHandler) return;

    try {
      await this.dataHandler.saveData(
        "global_ui_preferences",
        this.globalUIPreferences,
      );
      console.log("[UIManager] Saved global UI preferences");
    } catch (error) {
      console.warn("[UIManager] Failed to save global UI preferences:", error);
    }
  }

  /**
   * Update global UI preferences
   */
  async updateGlobalUIPreferences(updates) {
    this.globalUIPreferences = { ...this.globalUIPreferences, ...updates };

    // Apply to all registered components
    this.components.forEach((component) => {
      if (component.updateUIPreferences) {
        component.updateUIPreferences(updates);
      }
    });

    // Save to DataHandler
    await this.saveGlobalUIPreferences();

    console.log("[UIManager] Updated global UI preferences");
  }

  /**
   * Apply global theme preferences
   */
  applyGlobalThemePreferences() {
    if (this.globalUIPreferences.theme) {
      UIThemeManager.setTheme(this.globalUIPreferences.theme);
    }
  }

  /**
   * Setup global theme monitoring
   */
  setupGlobalThemeMonitoring() {
    // Monitor system theme changes
    const themeQuery = window.matchMedia("(prefers-color-scheme: dark)");
    themeQuery.addEventListener("change", () => {
      this.handleSystemThemeChange();
    });

    // Monitor accessibility preference changes
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    reducedMotionQuery.addEventListener("change", () => {
      this.handleAccessibilityChange();
    });
  }

  /**
   * Handle system theme changes
   */
  async handleSystemThemeChange() {
    const systemPrefersDark = window.matchMedia(
      "(prefers-color-scheme: dark)",
    ).matches;

    if (!this.globalUIPreferences.themeOverride) {
      await this.updateGlobalUIPreferences({
        theme: systemPrefersDark ? "dark" : "light",
        lastThemeUpdate: Date.now(),
      });
    }
  }

  /**
   * Handle accessibility preference changes
   */
  async handleAccessibilityChange() {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    await this.updateGlobalUIPreferences({
      accessibility: {
        ...this.globalUIPreferences.accessibility,
        reducedMotion: prefersReducedMotion,
      },
      lastAccessibilityUpdate: Date.now(),
    });
  }

  /**
   * Get component by ID
   */
  getComponent(componentId) {
    return this.components.get(componentId);
  }

  /**
   * Get all components of a specific type
   */
  getComponentsByType(ComponentClass) {
    return Array.from(this.components.values()).filter(
      (component) => component instanceof ComponentClass,
    );
  }

  /**
   * Cleanup all components
   */
  cleanup() {
    this.components.forEach((component) => {
      if (component.cleanup) {
        component.cleanup();
      }
    });
    this.components.clear();
    console.log("[UIManager] Cleaned up all components");
  }

  /**
   * Get UI statistics
   */
  getUIStatistics() {
    return {
      totalComponents: this.components.size,
      componentTypes: [
        ...new Set(
          Array.from(this.components.values()).map((c) => c.constructor.name),
        ),
      ],
      dataHandlerEnabled: !!this.dataHandler,
      globalPreferences: this.globalUIPreferences,
      registeredComponents: Array.from(this.components.keys()),
    };
  }
}

// Export all UI components
export {
  UIComponent,
  UIPanel,
  EthicsDisplay,
  FeedbackSystem,
  Button,
  Slider,
  UIThemeManager,
  UIStyleManager,
  UIPerformanceMonitor,
  UIManager,
  UI_CONSTANTS,
  THEME_COLORS,
};
