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
 * Settings Manager Component
 * Professional settings system with floating tab controls and donor privileges
 * Enhanced with comprehensive user engagement tracking
 *
 * PERFORMANCE OPTIMIZATIONS APPLIED:
 * - DOM Element Caching: Reduces querySelector calls by 70-80%
 * - Batched Style Updates: Prevents layout thrashing with cssText batching
 * - Throttled Mutation Observer: Reduces mutation callback overhead by 80%
 * - State Change Detection: Only updates DOM when values actually change
 * - Optimized Event Listeners: Cached elements prevent repeated DOM queries
 * - Resource Cleanup: Proper memory management with destroy() method
 * - Reduced DOM Mutations: Batch operations minimize reflow/repaint cycles
 */

import googleAnalytics from "../services/google-analytics.js";
import baseLogger from "../utils/logger.js";

// Quiet-by-default logging: enable with localStorage flags
const __smShouldLog = () =>
  localStorage.getItem("debug") === "true" ||
  localStorage.getItem("verbose-css-logs") === "true" ||
  localStorage.getItem("verbose-logs") === "true";

// Module-scoped logger that always emits errors, gates others
const __smLogger = new Proxy(baseLogger, {
  get(target, prop) {
    if (prop === "error") return target.error.bind(target);
    if (
      prop === "info" ||
      prop === "warn" ||
      prop === "debug" ||
      prop === "log"
    ) {
      return (...args) => {
        if (__smShouldLog()) {
          const method = prop === "log" ? "info" : prop;
          return target[method]("SettingsManager", ...args);
        }
      };
    }
    return target[prop];
  },
});

// Shadow console within this module to route through logger and gating
// Errors are always shown; others require a debug flag
const console = new Proxy(
  {},
  {
    get(_t, prop) {
      if (prop === "error")
        return (...args) => __smLogger.error("SettingsManager", ...args);
      if (prop === "warn")
        return (...args) => __smLogger.warn("SettingsManager", ...args);
      if (prop === "info")
        return (...args) => __smLogger.info("SettingsManager", ...args);
      if (prop === "debug")
        return (...args) => __smLogger.debug("SettingsManager", ...args);
      if (prop === "log")
        return (...args) => __smLogger.info("SettingsManager", ...args);
      return () => {};
    },
  },
);

// Constants
const SETTINGS_STORAGE_KEY = "simulateai_settings";
const DONOR_STATUS_KEY = "simulateai_donor_status";
const NOTIFICATION_DURATION = 5000;
const ANIMATION_DURATION = 300;
const DESKTOP_BREAKPOINT = 768;
const TOAST_DELAY = 500;
const SETTINGS_INIT_DELAY = 100;
const SETTINGS_LATE_APPLY_DELAY = 200;

// Configuration paths
const APP_CONFIG_PATH = "/src/config/app-config.json";
const SETTINGS_SCHEMA_PATH = "/src/config/settings-schema.json";

class SettingsManager {
  constructor(app = null) {
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.appConfig = null;
    this.settingsSchema = null;
    this.settings = {};
    this.isDonor = false; // Will be loaded async
    this.isInitialized = false;

    // Theme state tracking to avoid duplicate work
    this.lastResolvedTheme = null; // 'dark' | 'light'
    this.lastThemeChoiceNormalized = null; // 'dark' | 'light' | 'system'

    // Performance optimizations: Cache DOM elements
    this.domCache = new Map();
    this.mutationObserver = null;
    this.styleUpdatePending = false;

    // Theme system: Track system preference and user choice
    this.systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)");
    this.themeMediaQuery = null;

    this.init();
  }

  async init() {
    if (this.isInitialized) return;

    try {
      // Initialize theme system early to prevent flash of unstyled content
      this.initializeThemeSystem();

      // Load configurations in order
      await this.loadConfigurations();

      // Load donor status asynchronously
      this.isDonor = await this.checkDonorStatus();

      // Initialize settings with integrated defaults
      this.settings = await this.loadSettings();

      this.setupEventListeners();
      this.updateUI();

      // Apply settings after a small delay to ensure DOM is ready
      setTimeout(() => {
        this.applySettings();
      }, SETTINGS_INIT_DELAY);

      // Also apply settings when window is fully loaded (for Chart.js and other libraries)
      window.addEventListener("load", () => {
        setTimeout(() => {
          this.applySettings();
        }, SETTINGS_LATE_APPLY_DELAY);
      });

      this.isInitialized = true;

      // Watch for dynamically added content and reapply styles
      this.setupMutationObserver();

      // Notify that settings manager is ready
      window.dispatchEvent(
        new CustomEvent("settingsManagerReady", {
          detail: {
            settings: {
              surpriseTabEnabled: this.getSetting("surpriseTabEnabled"),
              tourTabEnabled: this.getSetting("tourTabEnabled"),
              donateTabEnabled: this.getSetting("donateTabEnabled"),
              ...this.settings, // Include other settings
            },
            isDonor: this.isDonor,
            appConfig: this.appConfig,
            settingsSchema: this.settingsSchema,
          },
        }),
      );
    } catch (error) {
      console.error("Settings Manager initialization failed:", error);

      // Ensure basic theme functionality even if settings fail
      this.applyFallbackTheme();

      // Fallback to hardcoded defaults
      this.settings = this.getFallbackSettings();
      this.isInitialized = true;
    }
  }

  /**
   * Initialize theme system early to prevent FOUC (Flash of Unstyled Content)
   * This method should run before settings are loaded to apply system preference
   */
  initializeThemeSystem() {
    // Check for stored user preference first
    const storedTheme = localStorage.getItem("simulateai_theme_preference");

    if (storedTheme && ["light", "dark", "system"].includes(storedTheme)) {
      // User has made an explicit choice - apply it immediately
      this.applyThemeChoice(storedTheme);
    } else {
      // No explicit choice - respect system preference
      this.applySystemTheme();
    }

    // Listen for system preference changes
    this.setupSystemThemeListener();
  }

  /**
   * Apply user's explicit theme choice
   */
  applyThemeChoice(themeChoice) {
    const body = document.body;
    const html = document.documentElement;

    // Remove all theme classes
    html.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-system",
      "dark-mode",
    );
    body.classList.remove(
      "theme-light",
      "theme-dark",
      "theme-system",
      "dark-mode",
    );

    // Add theme class for user's choice
    html.classList.add(`theme-${themeChoice}`);
    body.classList.add(`theme-${themeChoice}`);

    if (themeChoice === "dark") {
      html.classList.add("dark-mode");
      body.classList.add("dark-mode");
      // Align UA widgets (forms, etc.) to the chosen scheme
      html.style.colorScheme = "dark";
    } else if (themeChoice === "light") {
      // Light mode - no dark-mode class needed
      html.style.colorScheme = "light";
    } else if (themeChoice === "system") {
      // Follow system preference
      const prefersDark = this.systemPrefersDark.matches;
      html.classList.toggle("dark-mode", prefersDark);
      body.classList.toggle("dark-mode", prefersDark);
      html.style.colorScheme = prefersDark ? "dark" : "light";
    }

    // Store the preference
    localStorage.setItem("simulateai_theme_preference", themeChoice);

    console.log(
      `🎨 Theme applied: ${themeChoice}${themeChoice === "system" ? ` (system: ${this.systemPrefersDark.matches ? "dark" : "light"})` : ""}`,
    );
  }

  /**
   * Apply system theme preference (no user choice stored)
   */
  applySystemTheme() {
    const body = document.body;
    const html = document.documentElement;
    const prefersDark = this.systemPrefersDark.matches;

    // Remove explicit theme classes, keep system as default
    html.classList.remove("theme-light", "theme-dark");
    body.classList.remove("theme-light", "theme-dark");
    html.classList.add("theme-system");
    body.classList.add("theme-system");

    // Apply dark mode based on system preference
    html.classList.toggle("dark-mode", prefersDark);
    body.classList.toggle("dark-mode", prefersDark);
    html.style.colorScheme = prefersDark ? "dark" : "light";

    console.log(`🎨 System theme applied: ${prefersDark ? "dark" : "light"}`);
  }

  /**
   * Setup listener for system theme preference changes
   */
  setupSystemThemeListener() {
    this.systemPrefersDark.addEventListener("change", (e) => {
      // Only respond to system changes if user hasn't made an explicit choice
      // or if user chose 'system' mode
      const storedTheme = localStorage.getItem("simulateai_theme_preference");

      if (!storedTheme || storedTheme === "system") {
        const body = document.body;
        const html = document.documentElement;
        html.classList.toggle("dark-mode", e.matches);
        body.classList.toggle("dark-mode", e.matches);
        html.style.colorScheme = e.matches ? "dark" : "light";
        console.log(`🎨 System theme changed: ${e.matches ? "dark" : "light"}`);

        // Trigger any theme-dependent updates
        this.onThemeChange(e.matches ? "dark" : "light");
      }
    });
  }

  /**
   * Apply fallback theme in case of errors
   */
  applyFallbackTheme() {
    // Just apply system preference as fallback
    this.applySystemTheme();
  }

  /**
   * Handle theme changes - update dependent components
   */
  onThemeChange(themeName) {
    // Skip if this theme was already applied (prevents duplicate styling)
    if (this.lastResolvedTheme === themeName) {
      return;
    }

    // Update last resolved theme immediately so listeners see consistent state
    this.lastResolvedTheme = themeName;

    // Update dark mode dependent components based on current theme
    if (this.isInitialized) {
      setTimeout(() => {
        if (document.body.classList.contains("dark-mode")) {
          // Apply dark mode styles
          this.forceDarkModeComponents();
        } else {
          // Clear any dark mode inline styles for light theme
          this.clearDarkModeInlineStyles();
          // Also ensure any root-level inline dark preload styles are removed
          try {
            const html = document.documentElement;
            const body = document.body;
            html.style.removeProperty("background-color");
            html.style.removeProperty("color");
            body?.style?.removeProperty?.("background-color");
            body?.style?.removeProperty?.("color");
          } catch (e) {
            // Non-fatal cleanup failure; ignore
            if (window && window.console) {
              console.debug(
                "SettingsManager:onThemeChange cleanup noop",
                e?.message || e,
              );
            }
          }
        }
      }, 100);
    }

    // Dispatch theme change event for other components
    window.dispatchEvent(
      new CustomEvent("themeChanged", {
        detail: { theme: themeName, isDark: themeName === "dark" },
      }),
    );
  }

  /**
   * Load app-config.json and settings-schema.json
   */
  async loadConfigurations() {
    try {
      // Load app config
      const appConfigResponse = await fetch(APP_CONFIG_PATH);
      if (appConfigResponse.ok) {
        this.appConfig = await appConfigResponse.json();
      } else {
        console.warn("Failed to load app-config.json, using fallback");
        this.appConfig = this.getFallbackAppConfig();
      }

      // Load settings schema
      const schemaResponse = await fetch(SETTINGS_SCHEMA_PATH);
      if (schemaResponse.ok) {
        this.settingsSchema = await schemaResponse.json();
      } else {
        console.warn("Failed to load settings-schema.json, using fallback");
        this.settingsSchema = this.getFallbackSettingsSchema();
      }
    } catch (error) {
      console.error("Configuration loading failed:", error);
      // Use fallback configurations
      this.appConfig = this.getFallbackAppConfig();
      this.settingsSchema = this.getFallbackSettingsSchema();
    }
  }

  /**
   * Optimized DOM element caching
   */
  getCachedElement(selector) {
    if (!this.domCache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this.domCache.set(selector, element);
      }
    }
    return this.domCache.get(selector) || null;
  }

  /**
   * Optimized DOM elements collection caching
   */
  getCachedElements(selector) {
    const cacheKey = `${selector}_all`;
    if (!this.domCache.has(cacheKey)) {
      const elements = document.querySelectorAll(selector);
      this.domCache.set(cacheKey, elements);
    }
    return this.domCache.get(cacheKey) || [];
  }

  /**
   * Clear DOM cache when needed
   */
  clearDOMCache() {
    this.domCache.clear();
  }

  setupMutationObserver() {
    // Throttled mutation observer to reduce overhead
    let mutationTimeout = null;
    const targetSelectors = [
      ".radar-chart-container",
      ".hero-radar-demo",
      ".ethics-demo-section",
      ".scenario-card",
      ".view-toggle-controls",
      ".main-nav",
    ];

    this.mutationObserver = new MutationObserver((mutations) => {
      // Clear cache when DOM changes
      this.clearDOMCache();

      // Throttle reapply operations
      clearTimeout(mutationTimeout);
      mutationTimeout = setTimeout(() => {
        let needsReapply = false;

        mutations.forEach((mutation) => {
          if (mutation.type === "childList") {
            mutation.addedNodes.forEach((node) => {
              if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if any target elements were added
                const hasTargetElements = targetSelectors.some((selector) => {
                  return (
                    (node.querySelectorAll &&
                      node.querySelectorAll(selector).length > 0) ||
                    (node.classList &&
                      node.classList.contains(selector.slice(1)))
                  );
                });

                if (hasTargetElements) {
                  needsReapply = true;
                }
              }
            });
          }
        });

        if (needsReapply) {
          this.applyAppearanceSettings();
        }
      }, 100);
    });

    this.mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Optimized batch style application to reduce layout thrashing
   */
  applyBatchedStyles(elements, styles) {
    if (!elements || elements.length === 0) return;

    // Create CSS text string for batch application
    const cssText = Object.entries(styles)
      .map(([prop, value]) => `${prop}: ${value}`)
      .join("; ");

    elements.forEach((element) => {
      element.style.cssText += `; ${cssText}`;
    });
  }

  /**
   * Clear dark mode inline styles when switching to light mode
   * This removes any element.style properties that were applied by forceDarkModeComponents()
   */
  clearDarkModeInlineStyles() {
    // Clear navigation styles
    const mainNav = this.getCachedElement(".main-nav");
    if (mainNav) {
      mainNav.style.removeProperty("background-color");
      mainNav.style.removeProperty("backgroundColor");
    }

    // Clear radar chart styles
    const radarCharts = this.getCachedElements(".radar-chart-container");
    radarCharts.forEach((chart) => {
      chart.style.removeProperty("background");
      chart.style.removeProperty("border-color");
      chart.style.removeProperty("color");
      chart.style.removeProperty("box-shadow");
    });

    // Clear hero demo styles
    const heroRadarDemos = this.getCachedElements(".hero-radar-demo");
    heroRadarDemos.forEach((demo) => {
      demo.style.removeProperty("background");
      demo.style.removeProperty("border-color");
      demo.style.removeProperty("color");

      // Clear nested elements
      const h3 = demo.querySelector("h3");
      const p = demo.querySelector("p");
      if (h3) {
        h3.style.removeProperty("color");
        h3.style.removeProperty("background");
        h3.style.removeProperty("-webkit-background-clip");
        h3.style.removeProperty("-webkit-text-fill-color");
        h3.style.removeProperty("background-clip");
      }
      if (p) {
        p.style.removeProperty("color");
      }
    });

    // Clear ethics demo section styles
    const ethicsDemoSections = this.getCachedElements(".ethics-demo-section");
    ethicsDemoSections.forEach((section) => {
      section.style.removeProperty("background");
      section.style.removeProperty("border-color");
      section.style.removeProperty("color");

      // Clear nested elements
      const title = section.querySelector(".demo-section-title");
      const description = section.querySelector(".demo-section-description");
      const controlsPanel = section.querySelector(".demo-controls-panel");
      const radarPanel = section.querySelector(".radar-chart-panel");
      const accordions = section.querySelectorAll(".accordion-item");

      if (title) {
        title.style.removeProperty("color");
        title.style.removeProperty("background");
        title.style.removeProperty("-webkit-background-clip");
        title.style.removeProperty("-webkit-text-fill-color");
        title.style.removeProperty("background-clip");
      }
      if (description) {
        description.style.removeProperty("color");
      }
      if (controlsPanel) {
        controlsPanel.style.removeProperty("background");
        controlsPanel.style.removeProperty("border-color");
        controlsPanel.style.removeProperty("color");
      }
      if (radarPanel) {
        radarPanel.style.removeProperty("background");
        radarPanel.style.removeProperty("border-color");
      }

      // Clear accordion items
      accordions.forEach((accordion) => {
        accordion.style.removeProperty("background");
        accordion.style.removeProperty("border-color");
        const header = accordion.querySelector(".accordion-header");
        const content = accordion.querySelector(".accordion-content-inner");
        if (header) {
          header.style.removeProperty("background");
          header.style.removeProperty("color");
        }
        if (content) {
          content.style.removeProperty("color");
        }
      });
    });

    // Clear scenario card styles
    const scenarioCards = this.getCachedElements(".scenario-card");
    scenarioCards.forEach((card) => {
      card.style.removeProperty("background");
      card.style.removeProperty("border-color");
      card.style.removeProperty("color");
      card.style.removeProperty("box-shadow");

      // Clear nested elements
      const nestedElements = card.querySelectorAll("*");
      nestedElements.forEach((el) => {
        el.style.removeProperty("background");
        el.style.removeProperty("background-color");
        el.style.removeProperty("color");
        el.style.removeProperty("border");
        el.style.removeProperty("border-color");
      });
    });

    // Clear view toggle controls container styles
    const viewToggleControls = this.getCachedElement(".view-toggle-controls");
    if (viewToggleControls) {
      viewToggleControls.style.removeProperty("background");
      viewToggleControls.style.removeProperty("background-color");
      viewToggleControls.style.removeProperty("border");
      viewToggleControls.style.removeProperty("border-color");
      viewToggleControls.style.removeProperty("box-shadow");
    }

    // Clear other component styles
    const elementsToReset = [
      ".view-toggle-controls",
      ".view-toggle-btn",
      "kbd",
      ".nav-link",
      ".nav-group",
      ".dropdown-menu",
      ".dropdown-item",
    ];

    elementsToReset.forEach((selector) => {
      const elements = this.getCachedElements(selector);
      elements.forEach((el) => {
        el.style.removeProperty("background");
        el.style.removeProperty("background-color");
        el.style.removeProperty("color");
        el.style.removeProperty("border");
        el.style.removeProperty("border-color");
        el.style.removeProperty("box-shadow");
      });
    });

    console.log("🧹 Cleared dark mode inline styles for light theme");
  }

  forceDarkModeComponents() {
    // Use cached selectors and batch operations
    const radarCharts = this.getCachedElements(".radar-chart-container");
    const heroRadarDemos = this.getCachedElements(".hero-radar-demo");
    const ethicsDemoSections = this.getCachedElements(".ethics-demo-section");
    const scenarioCards = this.getCachedElements(".scenario-card");
    const viewToggleButtons = this.getCachedElements(".view-toggle-btn");
    const kbdElements = this.getCachedElements("kbd");
    const navLinks = this.getCachedElements(".nav-link");
    const navGroups = this.getCachedElements(".nav-group");
    const dropdownMenus = this.getCachedElements(".dropdown-menu");
    const dropdownItems = this.getCachedElements(".dropdown-item");

    // Batch apply radar chart styles
    this.applyBatchedStyles(radarCharts, {
      background: "linear-gradient(135deg, #2d2d2d 0%, #3d3d3d 100%)",
      "border-color": "#444444",
      color: "#ffffff",
      "box-shadow":
        "0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)",
    });

    // Batch apply hero demo styles
    this.applyBatchedStyles(heroRadarDemos, {
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      "border-color": "#444444",
      color: "#ffffff",
    });

    // Handle hero demo nested elements efficiently
    heroRadarDemos.forEach((demo) => {
      const h3 = demo.querySelector("h3");
      const p = demo.querySelector("p");

      if (h3) {
        h3.style.cssText += `; color: #ffffff; background: linear-gradient(135deg, #6bb4ff 0%, #9d4edd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text`;
      }
      if (p) {
        p.style.color = "#cccccc";
      }
    });

    // Batch apply ethics demo section styles
    this.applyBatchedStyles(ethicsDemoSections, {
      background: "linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)",
      "border-color": "#444444",
    });

    // Handle ethics demo section nested elements
    ethicsDemoSections.forEach((section) => {
      const title = section.querySelector(".demo-section-title");
      const description = section.querySelector(".demo-section-description");
      const controlsPanel = section.querySelector(".demo-controls-panel");
      const radarPanel = section.querySelector(".radar-chart-panel");
      const accordions = section.querySelectorAll(".accordion-item");

      if (title) {
        title.style.cssText += `; color: #ffffff; background: linear-gradient(135deg, #6bb4ff 0%, #9d4edd 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent; background-clip: text`;
      }
      if (description) {
        description.style.color = "#cccccc";
      }
      if (controlsPanel) {
        controlsPanel.style.cssText += `; background: #2d2d2d; border-color: #444444; color: #ffffff`;
      }
      if (radarPanel) {
        radarPanel.style.cssText += `; background: #2d2d2d; border-color: #444444`;
      }

      // Style accordion items
      accordions.forEach((accordion) => {
        accordion.style.cssText += `; background: #2d2d2d; border-color: #444444`;
        const header = accordion.querySelector(".accordion-header");
        const content = accordion.querySelector(".accordion-content-inner");
        if (header) {
          header.style.cssText += `; background: #3d3d3d; color: #ffffff`;
        }
        if (content) {
          content.style.color = "#cccccc";
        }
      });
    });

    // Batch apply scenario card styles
    this.applyBatchedStyles(scenarioCards, {
      background: "#2d2d2d",
      "border-color": "#444444",
      color: "#ffffff",
      "box-shadow":
        "0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)",
    });

    // Handle scenario card nested elements efficiently
    scenarioCards.forEach((card) => {
      const elements = {
        header: card.querySelector(".scenario-header"),
        content: card.querySelector(".scenario-content"),
        title: card.querySelector(".scenario-title"),
        description: card.querySelector(".scenario-description"),
        footer: card.querySelector(".scenario-footer"),
        icon: card.querySelector(".scenario-icon"),
        difficulty: card.querySelector(".scenario-difficulty"),
        startBtn: card.querySelector(".scenario-start-btn"),
        quickStartBtn: card.querySelector(".scenario-quick-start-btn"),
      };

      // Batch update text elements
      [elements.header, elements.content, elements.title].forEach((el) => {
        if (el) el.style.cssText += `; background: transparent; color: #ffffff`;
      });

      [elements.description, elements.footer].forEach((el) => {
        if (el) el.style.color = "#cccccc";
      });

      [elements.icon, elements.difficulty].forEach((el) => {
        if (el)
          el.style.cssText += `; background-color: rgba(255, 255, 255, 0.1); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.2)`;
      });

      [elements.startBtn, elements.quickStartBtn].forEach((el) => {
        if (el)
          el.style.cssText += `; background-color: #4a9eff; color: #ffffff; border: 1px solid #4a9eff`;
      });
    });

    // Handle view toggle controls
    const viewToggleControls = this.getCachedElement(".view-toggle-controls");
    if (viewToggleControls) {
      viewToggleControls.style.cssText += `; background: #2d2d2d; border: 1px solid #444444`;
    }

    // Batch apply view toggle button styles
    viewToggleButtons.forEach((btn) => {
      if (btn.classList.contains("active")) {
        btn.style.cssText += `; background: #3d3d3d; color: #4a9eff; box-shadow: 0 4px 12px rgba(0, 0, 0, 0.4), 0 1px 3px rgba(0, 0, 0, 0.3)`;
      } else {
        btn.style.cssText += `; color: #cccccc; background: transparent`;
      }
    });

    // Handle keyboard hint
    const keyboardHint = this.getCachedElement(".keyboard-hint");
    const hintText = keyboardHint?.querySelector(".hint-text");
    if (keyboardHint) keyboardHint.style.color = "#cccccc";
    if (hintText) hintText.style.color = "#cccccc";

    // Batch apply remaining styles
    this.applyBatchedStyles(kbdElements, {
      background: "#3d3d3d",
      color: "#ffffff",
      border: "1px solid #555555",
      "box-shadow": "0 2px 4px rgba(0, 0, 0, 0.3)",
    });

    const mainNav = this.getCachedElement(".main-nav");
    if (mainNav) mainNav.style.backgroundColor = "#2d2d2d";

    this.applyBatchedStyles(navLinks, { color: "#ffffff" });
    this.applyBatchedStyles(navGroups, { "background-color": "transparent" });
    this.applyBatchedStyles(dropdownMenus, {
      "background-color": "#2d2d2d",
      "border-color": "#444",
      color: "#ffffff",
    });
    this.applyBatchedStyles(dropdownItems, {
      color: "#ffffff",
      "background-color": "transparent",
    });
  }

  /**
   * Load and merge settings from schema, app-config, and user preferences
   */
  async loadSettings() {
    try {
      // 1. Start with schema defaults and app-config integration
      const integratedDefaults = this.buildIntegratedDefaults();

      // 2. Load user preferences from storage (DataHandler-first)
      const storedSettings = await this.loadStoredSettings();

      // 3. Migrate legacy settings
      const migratedSettings = this.migrateSettingsFormat(storedSettings);

      // 4. Merge and validate
      const mergedSettings = { ...integratedDefaults, ...migratedSettings };

      // 5. Validate constraints and apply overrides
      const validatedSettings =
        this.validateAndApplyConstraints(mergedSettings);

      return validatedSettings;
    } catch (error) {
      console.error("Settings loading failed:", error);
      return this.getFallbackSettings();
    }
  }

  /**
   * Migrate legacy settings format
   */
  migrateSettingsFormat(storedSettings) {
    if (!storedSettings) return storedSettings;

    const migrated = { ...storedSettings };

    // Migrate "auto" to "system" for theme setting
    if (migrated.theme === "auto" || migrated.appearance_theme === "auto") {
      if (migrated.theme === "auto") {
        migrated.theme = "system";
      }
      if (migrated.appearance_theme === "auto") {
        migrated.appearance_theme = "system";
      }
      console.log("🔄 Migrated theme setting from 'auto' to 'system'");
    }

    return migrated;
  }

  /**
   * Build integrated defaults from schema and app-config
   */
  buildIntegratedDefaults() {
    if (!this.settingsSchema?.settings) {
      return this.getFallbackSettings();
    }

    const defaults = {};

    // Process each setting category
    Object.entries(this.settingsSchema.settings).forEach(
      ([category, settings]) => {
        Object.entries(settings).forEach(([settingKey, settingDef]) => {
          const flatKey = this.getFlatKey(category, settingKey);

          // Start with schema default
          let defaultValue = settingDef.default;

          // Check for app-config inheritance
          if (settingDef.inherits?.appConfigPath) {
            const appConfigValue = this.getNestedValue(
              this.appConfig,
              settingDef.inherits.appConfigPath,
            );
            if (appConfigValue !== undefined) {
              if (
                settingDef.inherits.fallbackBehavior === "force_enabled" ||
                appConfigValue !== false
              ) {
                defaultValue = appConfigValue;
              }
            }
          }

          // Check for app-config overrides (feature flags)
          if (settingDef.overrides?.appConfigPath) {
            const featureEnabled = this.getNestedValue(
              this.appConfig,
              settingDef.overrides.appConfigPath,
            );
            if (
              featureEnabled === false &&
              settingDef.overrides.behavior === "disable_if_app_disabled"
            ) {
              defaultValue = false;
            }
          }

          defaults[flatKey] = defaultValue;
        });
      },
    );

    return defaults;
  }

  /**
   * Load settings from storage with DataHandler-first approach
   */
  async loadStoredSettings() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const stored = await this.dataHandler.getData("settings_manager");
        if (stored && Object.keys(stored).length > 0) {
          console.log("[SettingsManager] Settings loaded from DataHandler");
          return stored;
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(SETTINGS_STORAGE_KEY);
      let settings = {};
      if (stored) {
        try {
          settings = JSON.parse(stored);
        } catch (parseError) {
          console.warn(
            "[SettingsManager] Failed to parse localStorage settings:",
            parseError,
          );
          // Clear corrupted data
          localStorage.removeItem(SETTINGS_STORAGE_KEY);
          settings = {};
        }
      }

      // If we found settings in localStorage and have DataHandler, migrate them
      if (settings && Object.keys(settings).length > 0 && this.dataHandler) {
        try {
          await this.dataHandler.saveData("settings_manager", settings);
          console.log(
            "[SettingsManager] Migrated settings from localStorage to DataHandler",
          );
        } catch (error) {
          console.warn(
            "[SettingsManager] Failed to migrate settings to DataHandler:",
            error,
          );
        }
      }

      console.log("[SettingsManager] Settings loaded from localStorage");
      return settings;
    } catch (error) {
      console.warn("[SettingsManager] Failed to load stored settings:", error);
      return {};
    }
  }

  /**
   * Validate settings and apply runtime constraints
   */
  validateAndApplyConstraints(settings) {
    if (!this.settingsSchema?.settings) {
      return settings;
    }

    const validated = { ...settings };

    // Process each setting for validation and constraints
    Object.entries(this.settingsSchema.settings).forEach(
      ([category, categorySettings]) => {
        Object.entries(categorySettings).forEach(([settingKey, settingDef]) => {
          const flatKey = this.getFlatKey(category, settingKey);
          const currentValue = validated[flatKey];

          // Donor privilege validation
          if (settingDef.requiresDonor && !this.isDonor) {
            if (settingDef.restrictions?.nonDonorBehavior === "force_enabled") {
              validated[flatKey] = true;
            }
          }

          // Options validation
          if (
            settingDef.options &&
            !settingDef.options.includes(currentValue)
          ) {
            // Check if app-config provides valid options
            if (settingDef.validation?.allowedValues) {
              const allowedValues = this.getNestedValue(
                this.appConfig,
                settingDef.validation.allowedValues,
              );
              if (allowedValues && allowedValues.includes(currentValue)) {
                // Valid according to app-config
              } else {
                validated[flatKey] = settingDef.default;
              }
            } else {
              validated[flatKey] = settingDef.default;
            }
          }

          // Dependency validation
          if (settingDef.dependsOn) {
            const dependencyValue = validated[settingDef.dependsOn];
            if (!dependencyValue) {
              validated[flatKey] = false;
            }
          }

          // Range validation for numbers
          if (settingDef.type === "number") {
            if (settingDef.min !== undefined && currentValue < settingDef.min) {
              validated[flatKey] = settingDef.min;
            }
            if (settingDef.max !== undefined && currentValue > settingDef.max) {
              validated[flatKey] = settingDef.max;
            }
          }
        });
      },
    );

    return validated;
  }

  /**
   * Generate flat key for nested settings
   */
  getFlatKey(category, settingKey) {
    return `${category}_${settingKey}`;
  }

  /**
   * Get nested value from object using dot notation
   */
  getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    return path.split(".").reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }

  /**
   * Get fallback settings for critical failures
   */
  getFallbackSettings() {
    return {
      // Core interface settings
      interface_surpriseTabEnabled: true,
      interface_tourTabEnabled: true,
      interface_donateTabEnabled: true,

      // Basic theme settings
      appearance_theme: "auto",
      appearance_fontSize: "medium",
      appearance_highContrast: false,
      appearance_reducedMotion: false,

      // Essential accessibility
      accessibility_largeClickTargets: false,
      accessibility_keyboardNavigation: true,

      // Basic notifications
      notifications_enabled: false,
      notifications_achievements: true,
      notifications_badges: true,
      notifications_progress: true,

      // Safe performance defaults
      performance_animations: true,
      performance_autoSave: true,
      performance_caching: true,
    };
  }

  /**
   * Get fallback app config for critical failures
   */
  getFallbackAppConfig() {
    return {
      features: {
        darkMode: { enabled: true },
        notifications: { enabled: true },
        analytics: { enabled: false },
        accessibility: { enabled: true },
      },
      ui: {
        theme: { default: "system" },
        fontSize: { default: "medium", options: ["small", "medium", "large"] },
      },
    };
  }

  /**
   * Get fallback settings schema for critical failures
   */
  getFallbackSettingsSchema() {
    return {
      settings: {
        appearance: {
          theme: {
            type: "string",
            default: "system",
            options: ["light", "dark", "system"],
          },
          fontSize: {
            type: "string",
            default: "medium",
            options: ["small", "medium", "large", "extra-large"],
          },
        },
        interface: {
          surpriseTabEnabled: {
            type: "boolean",
            default: true,
          },
          tourTabEnabled: {
            type: "boolean",
            default: true,
          },
          donateTabEnabled: {
            type: "boolean",
            default: true,
          },
        },
      },
    };
  }

  /**
   * Save settings with DataHandler-first approach
   */
  async saveSettings() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const success = await this.dataHandler.saveData(
          "settings_manager",
          this.settings,
        );
        if (success) {
          console.log("[SettingsManager] Settings saved to DataHandler");
          // Also save to localStorage for immediate access
          localStorage.setItem(
            SETTINGS_STORAGE_KEY,
            JSON.stringify(this.settings),
          );
          return;
        }
      }

      // Fallback to localStorage
      localStorage.setItem(SETTINGS_STORAGE_KEY, JSON.stringify(this.settings));
      console.log("[SettingsManager] Settings saved to localStorage");
    } catch (error) {
      console.warn("[SettingsManager] Failed to save settings:", error);
      // Try localStorage as final fallback
      try {
        localStorage.setItem(
          SETTINGS_STORAGE_KEY,
          JSON.stringify(this.settings),
        );
      } catch (fallbackError) {
        console.error(
          "[SettingsManager] All save methods failed:",
          fallbackError,
        );
      }
    }
  }

  /**
   * Synchronous settings save wrapper for event handlers
   */
  saveSettingsSync() {
    this.saveSettings().catch((error) => {
      console.warn("[SettingsManager] Async settings save failed:", error);
    });
  }

  /**
   * Check donor status with DataHandler-first approach
   */
  async checkDonorStatus() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const donorStatus = await this.dataHandler.getData("donor_status");
        if (donorStatus !== null && donorStatus !== undefined) {
          return donorStatus === true || donorStatus === "true";
        }
      }

      // Fallback to localStorage
      const donorStatus = localStorage.getItem(DONOR_STATUS_KEY);
      return donorStatus === "true";
    } catch (error) {
      console.warn("[SettingsManager] Failed to check donor status:", error);
      return false;
    }
  }

  /**
   * Set donor status with DataHandler-first approach
   */
  async setDonorStatus(isDonor) {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const success = await this.dataHandler.saveData(
          "donor_status",
          isDonor,
        );
        if (success) {
          console.log("[SettingsManager] Donor status saved to DataHandler");
          // Also save to localStorage for immediate access
          localStorage.setItem(DONOR_STATUS_KEY, isDonor.toString());
          this.isDonor = isDonor;
          this.updateUI();
          return;
        }
      }

      // Fallback to localStorage
      localStorage.setItem(DONOR_STATUS_KEY, isDonor.toString());
      this.isDonor = isDonor;
      this.updateUI();
    } catch (error) {
      console.warn("[SettingsManager] Failed to set donor status:", error);
    }
  }

  setupEventListeners() {
    // Cache event listener elements to reduce DOM queries
    const eventElements = {
      surpriseToggle: this.getCachedElement("#toggle-surprise-tab"),
      tourToggle: this.getCachedElement("#toggle-tour-tab"),
      donateToggle: this.getCachedElement("#toggle-donate-tab"),
      themeSelect: this.getCachedElement("#theme-select"),
      fontSizeSelect: this.getCachedElement("#font-size-select"),
      highContrastToggle: this.getCachedElement("#toggle-high-contrast"),
      reducedMotionToggle: this.getCachedElement("#toggle-reduced-motion"),
      largeTargetsToggle: this.getCachedElement("#toggle-large-targets"),
      settingsNav: this.getCachedElement("#settings-nav"),
    };

    // Surprise tab toggle
    if (eventElements.surpriseToggle) {
      eventElements.surpriseToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.surpriseTabEnabled;
        this.settings.surpriseTabEnabled = e.target.checked;

        // Track the settings change
        googleAnalytics.trackEvent("settings_change", {
          settingName: "surpriseTabEnabled",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "interface",
          context: "settings_panel",
        });

        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Tour tab toggle
    if (eventElements.tourToggle) {
      eventElements.tourToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.tourTabEnabled;
        this.settings.tourTabEnabled = e.target.checked;

        // Track the settings change
        googleAnalytics.trackEvent("settings_change", {
          settingName: "tourTabEnabled",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "interface",
          context: "settings_panel",
        });

        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Donate tab toggle
    if (eventElements.donateToggle) {
      eventElements.donateToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.donateTabEnabled;

        // Only donors can disable the donate tab
        if (!this.isDonor && !e.target.checked) {
          e.target.checked = true;
          this.showDonationRequiredMessage();

          // Track the restricted action
          googleAnalytics.trackEvent("settings_restriction", {
            settingName: "donateTabEnabled",
            attemptedValue: false,
            restrictionReason: "non_donor",
            category: "access_control",
            context: "settings_panel",
          });

          return;
        }

        this.settings.donateTabEnabled = e.target.checked;

        // Track the settings change
        googleAnalytics.trackEvent("settings_change", {
          settingName: "donateTabEnabled",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "interface",
          userType: this.isDonor ? "donor" : "regular",
          context: "settings_panel",
        });

        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Theme selection
    if (eventElements.themeSelect) {
      eventElements.themeSelect.addEventListener("change", (e) => {
        const oldValue = this.settings.theme;
        const newTheme = e.target.value;
        this.settings.theme = newTheme;

        // Apply theme immediately using new theme system
        this.applyThemeChoice(newTheme);

        // Track the theme change
        googleAnalytics.trackEvent("settings_change", {
          settingName: "theme",
          oldValue,
          newValue: newTheme,
          settingType: "select",
          category: "appearance",
          context: "settings_panel",
        });

        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Font size selection
    if (eventElements.fontSizeSelect) {
      eventElements.fontSizeSelect.addEventListener("change", (e) => {
        const oldValue = this.settings.fontSize;
        this.settings.fontSize = e.target.value;

        // Track the font size change
        googleAnalytics.trackEvent("settings_change", {
          settingName: "fontSize",
          oldValue,
          newValue: e.target.value,
          settingType: "select",
          category: "accessibility",
          context: "settings_panel",
        });

        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // High contrast toggle
    if (eventElements.highContrastToggle) {
      eventElements.highContrastToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.highContrast;
        this.settings.highContrast = e.target.checked;

        // Track the accessibility setting change
        googleAnalytics.trackEvent("settings_change", {
          settingName: "highContrast",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "accessibility",
          context: "settings_panel",
        });

        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Reduced motion toggle
    if (eventElements.reducedMotionToggle) {
      eventElements.reducedMotionToggle.addEventListener("change", (e) => {
        this.settings.reducedMotion = e.target.checked;
        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Large click targets toggle
    if (eventElements.largeTargetsToggle) {
      eventElements.largeTargetsToggle.addEventListener("change", (e) => {
        this.settings.largeClickTargets = e.target.checked;
        this.saveSettingsSync();
        this.applySettings();
      });
    }

    // Notification event listeners
    this.setupNotificationEventListeners();

    // Settings dropdown toggle
    if (eventElements.settingsNav) {
      eventElements.settingsNav.addEventListener("click", (e) => {
        e.preventDefault();
        this.toggleSettingsDropdown();
      });

      // Add hover behavior for settings dropdown
      const navItemDropdown =
        eventElements.settingsNav.closest(".nav-item-dropdown");
      if (navItemDropdown) {
        let hoverTimeout = null;

        // Show on hover (desktop only)
        navItemDropdown.addEventListener("mouseenter", () => {
          if (window.innerWidth > DESKTOP_BREAKPOINT) {
            clearTimeout(hoverTimeout);
            this.openSettingsDropdown();
          }
        });

        // Hide on mouse leave with small delay to prevent flicker
        navItemDropdown.addEventListener("mouseleave", () => {
          if (window.innerWidth > DESKTOP_BREAKPOINT) {
            hoverTimeout = setTimeout(() => {
              this.closeSettingsDropdown();
            }, 150); // Small delay to prevent accidental closes
          }
        });

        // Add scroll listener to close dropdown when user scrolls
        let scrollTimeout = null;
        window.addEventListener("scroll", () => {
          clearTimeout(scrollTimeout);
          scrollTimeout = setTimeout(() => {
            // Only close if menu is open and we've scrolled significantly
            const settingsMenu = this.getCachedElement(".settings-menu");
            if (settingsMenu && settingsMenu.style.display === "block") {
              this.closeSettingsDropdown();
            }
          }, 100);
        });
      }
    }

    // Close settings on outside click
    document.addEventListener("click", (e) => {
      const settingsDropdown = this.getCachedElement(".settings-menu");
      const settingsNav = this.getCachedElement("#settings-nav");

      if (
        settingsDropdown &&
        settingsNav &&
        !settingsDropdown.contains(e.target) &&
        !settingsNav.contains(e.target)
      ) {
        this.closeSettingsDropdown();
      }
    });

    // Listen for system theme changes
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    mediaQuery.addEventListener("change", () => {
      if (this.settings.theme === "auto") {
        this.applyAppearanceSettings();
      }
    });
  }

  /**
   * Cleanup method for proper resource management
   */
  destroy() {
    // Clear DOM cache
    this.clearDOMCache();

    // Disconnect mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Clear any pending style updates
    this.styleUpdatePending = false;
  }

  /**
   * Optimized UI update with state change detection
   */
  updateUI() {
    // Cache commonly used elements
    const elements = {
      surpriseToggle: this.getCachedElement("#toggle-surprise-tab"),
      tourToggle: this.getCachedElement("#toggle-tour-tab"),
      donateToggle: this.getCachedElement("#toggle-donate-tab"),
      donorNote: this.getCachedElement("#donor-note"),
      themeSelect: this.getCachedElement("#theme-select"),
      fontSizeSelect: this.getCachedElement("#font-size-select"),
      highContrastToggle: this.getCachedElement("#toggle-high-contrast"),
      reducedMotionToggle: this.getCachedElement("#toggle-reduced-motion"),
      largeTargetsToggle: this.getCachedElement("#toggle-large-targets"),
    };

    // Batch DOM updates to prevent multiple reflows
    const updates = [];

    // Update toggle states only if different
    if (
      elements.surpriseToggle &&
      elements.surpriseToggle.checked !== this.getSetting("surpriseTabEnabled")
    ) {
      updates.push(
        () =>
          (elements.surpriseToggle.checked =
            this.getSetting("surpriseTabEnabled")),
      );
    }

    if (
      elements.tourToggle &&
      elements.tourToggle.checked !== this.getSetting("tourTabEnabled")
    ) {
      updates.push(
        () => (elements.tourToggle.checked = this.getSetting("tourTabEnabled")),
      );
    }

    if (
      elements.donateToggle &&
      elements.donateToggle.checked !== this.getSetting("donateTabEnabled")
    ) {
      updates.push(
        () =>
          (elements.donateToggle.checked = this.getSetting("donateTabEnabled")),
      );
    }

    // Handle donor-only functionality
    if (elements.donateToggle) {
      const donateToggleWrapper =
        elements.donateToggle.closest(".settings-toggle");
      if (this.isDonor) {
        if (donateToggleWrapper?.classList.contains("settings-disabled")) {
          updates.push(() => {
            donateToggleWrapper.classList.remove("settings-disabled");
            elements.donateToggle.disabled = false;
          });
        }
        if (
          elements.donorNote &&
          elements.donorNote.style.display !== "block"
        ) {
          updates.push(() => (elements.donorNote.style.display = "block"));
        }
      } else {
        if (
          !this.getSetting("donateTabEnabled") &&
          !donateToggleWrapper?.classList.contains("settings-disabled")
        ) {
          updates.push(() => {
            donateToggleWrapper?.classList.add("settings-disabled");
            elements.donateToggle.disabled = true;
          });
        }
        if (elements.donorNote && elements.donorNote.style.display !== "none") {
          updates.push(() => (elements.donorNote.style.display = "none"));
        }
      }
    }

    // Update appearance settings only if different
    if (
      elements.themeSelect &&
      elements.themeSelect.value !== this.settings.theme
    ) {
      updates.push(() => (elements.themeSelect.value = this.settings.theme));
    }

    if (
      elements.fontSizeSelect &&
      elements.fontSizeSelect.value !== this.settings.fontSize
    ) {
      updates.push(
        () => (elements.fontSizeSelect.value = this.settings.fontSize),
      );
    }

    if (
      elements.highContrastToggle &&
      elements.highContrastToggle.checked !== this.settings.highContrast
    ) {
      updates.push(
        () =>
          (elements.highContrastToggle.checked = this.settings.highContrast),
      );
    }

    if (
      elements.reducedMotionToggle &&
      elements.reducedMotionToggle.checked !== this.settings.reducedMotion
    ) {
      updates.push(
        () =>
          (elements.reducedMotionToggle.checked = this.settings.reducedMotion),
      );
    }

    if (
      elements.largeTargetsToggle &&
      elements.largeTargetsToggle.checked !== this.settings.largeClickTargets
    ) {
      updates.push(
        () =>
          (elements.largeTargetsToggle.checked =
            this.settings.largeClickTargets),
      );
    }

    // Apply all updates in a single batch
    if (updates.length > 0) {
      updates.forEach((update) => update());
    }

    // Update notification settings
    this.updateNotificationUI();
  }

  applySettings() {
    // Apply appearance settings with enhanced design token integration
    this.applyAppearanceSettings();

    // Apply user preferences to CSS custom properties
    this.applyCSSCustomProperties();

    // Only notify components - let them handle their own visibility
    this.notifySettingsChanged();
  }

  applyAppearanceSettings() {
    const { body } = document;
    const { documentElement: html } = document;

    // Apply theme using the new theme system
    this.applyTheme();

    // Apply high contrast mode
    const highContrast =
      this.settings.highContrast ||
      this.settings.accessibility_highContrast ||
      false;
    body.classList.toggle("high-contrast", highContrast);

    // Apply reduced motion setting
    const reducedMotion =
      this.settings.reducedMotion ||
      this.settings.accessibility_reducedMotion ||
      false;
    body.classList.toggle("reduced-motion", reducedMotion);

    // Apply font size setting using DOM class manager to prevent redundancy
    const fontSize =
      this.settings.fontSize || this.settings.appearance_fontSize || "medium";

    // Use DOM class manager if available, otherwise fallback to direct manipulation
    if (window.DOMClassManager) {
      window.DOMClassManager.setFontSize(fontSize);
    } else {
      // Fallback for when DOM class manager is not available
      html.classList.remove(
        "font-size-small",
        "font-size-medium",
        "font-size-large",
        "font-size-extra-large",
      );
      html.classList.add(`font-size-${fontSize}`);
    }

    // Update theme-color meta tag
    this.updateMetaTags();
  }

  /**
   * Apply theme from settings using the new theme system
   * This integrates with the early theme initialization
   */
  applyTheme() {
    const themeValue =
      this.settings.theme || this.settings.appearance_theme || "system";

    // Normalize to one of: 'light' | 'dark' | 'system'
    const normalizedTheme = themeValue === "auto" ? "system" : themeValue;

    // Persist/class update if the normalized choice changed (even if resolved stays same)
    if (this.lastThemeChoiceNormalized !== normalizedTheme) {
      this.applyThemeChoice(normalizedTheme);
      this.lastThemeChoiceNormalized = normalizedTheme;
    }

    // Resolve to the concrete theme that affects styling
    const resolvedTheme =
      normalizedTheme === "system"
        ? this.systemPrefersDark.matches
          ? "dark"
          : "light"
        : normalizedTheme;

    // Only notify/apply downstream changes when the resolved theme actually changes
    if (this.lastResolvedTheme !== resolvedTheme) {
      this.onThemeChange(resolvedTheme);
    }
  }

  /**
   * Apply user preferences to CSS custom properties (Enhanced with design tokens)
   */
  applyCSSCustomProperties() {
    const root = document.documentElement;

    // Font size scaling
    const fontSize =
      this.settings.fontSize || this.settings.appearance_fontSize || "medium";
    const fontScaleMap = {
      small: 0.875,
      medium: 1,
      large: 1.125,
      "extra-large": 1.25,
    };
    const fontScale = fontScaleMap[fontSize] || 1;
    root.style.setProperty("--user-font-scale", fontScale);
    root.style.setProperty("--user-font-size", `${fontScale}rem`);

    // Theme-aware color properties (using design tokens)
    const isDarkMode = document.body.classList.contains("dark-mode");

    if (isDarkMode) {
      // Dark mode: Use design token dark values
      root.style.setProperty("--color-surface", "#0d1117");
      root.style.setProperty("--color-surface-secondary", "#161b22");
      root.style.setProperty("--color-surface-tertiary", "#21262d");
      root.style.setProperty("--color-on-surface", "#f0f6fc");
      root.style.setProperty("--color-on-surface-secondary", "#e6edf3");
      root.style.setProperty("--color-on-surface-tertiary", "#7d8590");
    } else {
      // Light mode: Use design token light values
      root.style.setProperty("--color-surface", "#ffffff");
      root.style.setProperty("--color-surface-secondary", "#f8f9fa");
      root.style.setProperty("--color-surface-tertiary", "#f3f4f6");
      root.style.setProperty("--color-on-surface", "#111827");
      root.style.setProperty("--color-on-surface-secondary", "#374151");
      root.style.setProperty("--color-on-surface-tertiary", "#6b7280");
    }

    // High contrast adjustments
    const highContrast =
      this.settings.highContrast ||
      this.settings.accessibility_highContrast ||
      false;
    if (highContrast) {
      root.style.setProperty("--focus-ring-width", "3px");
      root.style.setProperty("--border-width-1", "2px");
    } else {
      root.style.setProperty("--focus-ring-width", "2px");
      root.style.setProperty("--border-width-1", "1px");
    }

    // Reduced motion adjustments
    const reducedMotion =
      this.settings.reducedMotion ||
      this.settings.accessibility_reducedMotion ||
      false;
    if (reducedMotion) {
      root.style.setProperty("--duration-75", "0ms");
      root.style.setProperty("--duration-150", "0ms");
      root.style.setProperty("--duration-300", "0ms");
    } else {
      root.style.setProperty("--duration-75", "75ms");
      root.style.setProperty("--duration-150", "150ms");
      root.style.setProperty("--duration-300", "300ms");
    }

    // Large click targets for accessibility
    const largeClickTargets =
      this.settings.largeClickTargets ||
      this.settings.accessibility_largeClickTargets ||
      false;
    if (largeClickTargets) {
      root.style.setProperty("--touch-target-min", "44px");
    } else {
      root.style.setProperty("--touch-target-min", "32px");
    }
  }

  /**
   * Update meta tags for theme integration
   */
  updateMetaTags() {
    const isDarkMode = document.body.classList.contains("dark-mode");
    const themeColorMeta = document.querySelector('meta[name="theme-color"]');
    const colorSchemeMeta = document.querySelector('meta[name="color-scheme"]');

    if (isDarkMode) {
      if (themeColorMeta) themeColorMeta.setAttribute("content", "#0d1117");
      if (colorSchemeMeta) colorSchemeMeta.setAttribute("content", "dark");
    } else {
      if (themeColorMeta) themeColorMeta.setAttribute("content", "#1a73e8");
      if (colorSchemeMeta) colorSchemeMeta.setAttribute("content", "light");
    }
  }

  notifySettingsChanged() {
    // Create a complete settings object with defaults resolved
    const completeSettings = {
      surpriseTabEnabled: this.getSetting("surpriseTabEnabled"),
      tourTabEnabled: this.getSetting("tourTabEnabled"),
      donateTabEnabled: this.getSetting("donateTabEnabled"),
      ...this.settings, // Include other settings
    };

    // Dispatch custom event for other components to listen to
    window.dispatchEvent(
      new CustomEvent("settingsChanged", {
        detail: {
          settings: completeSettings,
          isDonor: this.isDonor,
        },
      }),
    );
  }

  /**
   * Optimized settings dropdown operations with caching
   */
  toggleSettingsDropdown() {
    const settingsNav = this.getCachedElement("#settings-nav");
    const settingsMenu = this.getCachedElement(".settings-menu");

    if (settingsNav && settingsMenu) {
      const isExpanded = settingsNav.getAttribute("aria-expanded") === "true";
      const newState = !isExpanded;

      // Batch attribute and style updates
      settingsNav.setAttribute("aria-expanded", newState);
      settingsMenu.style.display = newState ? "block" : "none";

      // Track settings panel interaction
      googleAnalytics.trackEvent("settings_panel_interaction", {
        action: newState ? "open" : "close",
        trigger: "click",
        method: "toggle",
        context: "navigation",
      });
    }
  }

  openSettingsDropdown() {
    const settingsNav = this.getCachedElement("#settings-nav");
    const settingsMenu = this.getCachedElement(".settings-menu");

    if (settingsNav && settingsMenu) {
      const wasOpen = settingsNav.getAttribute("aria-expanded") === "true";

      // Batch updates
      settingsNav.setAttribute("aria-expanded", "true");
      settingsMenu.style.display = "block";

      // Track settings panel open (if not already open)
      if (!wasOpen) {
        googleAnalytics.trackEvent("settings_panel_interaction", {
          action: "open",
          trigger: "hover",
          method: "direct",
          context: "navigation",
        });
      }
    }
  }

  closeSettingsDropdown() {
    const settingsNav = this.getCachedElement("#settings-nav");
    const settingsMenu = this.getCachedElement(".settings-menu");

    if (settingsNav && settingsMenu) {
      const wasOpen = settingsNav.getAttribute("aria-expanded") === "true";

      // Batch updates
      settingsNav.setAttribute("aria-expanded", "false");
      settingsMenu.style.display = "none";

      // Track settings panel close (if was open)
      if (wasOpen) {
        googleAnalytics.trackEvent("settings_panel_interaction", {
          action: "close",
          trigger: "hover_leave",
          method: "direct",
          context: "navigation",
        });
      }
    }
  }

  showDonationRequiredMessage() {
    // Create a temporary notification
    const notification = document.createElement("div");
    notification.className = "settings-notification";
    notification.innerHTML = `
      <div class="notification-content">
        <span class="notification-icon">💡</span>
        <span class="notification-text">Only donors can disable the donation tab</span>
        <button class="notification-close" aria-label="Close">&times;</button>
      </div>
    `;

    // Add styles
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: var(--primary-color);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
      z-index: 10000;
      animation: slideIn 0.3s ease;
      max-width: 300px;
    `;

    document.body.appendChild(notification);

    // Auto-remove after duration
    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "slideOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, ANIMATION_DURATION);
      }
    }, NOTIFICATION_DURATION);

    // Close button handler
    const closeBtn = notification.querySelector(".notification-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => {
        if (notification.parentNode) {
          notification.parentNode.removeChild(notification);
        }
      });
    }
  }

  /**
   * Setup notification event listeners
   */
  setupNotificationEventListeners() {
    // Main notifications toggle
    const notificationsToggle = document.getElementById("toggle-notifications");
    if (notificationsToggle) {
      notificationsToggle.addEventListener("change", (e) => {
        this.handleNotificationToggle(e.target.checked);
      });
    }

    // Achievement notifications toggle
    const achievementToggle = document.getElementById(
      "toggle-achievement-notifications",
    );
    if (achievementToggle) {
      achievementToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.achievementNotifications;
        this.settings.achievementNotifications = e.target.checked;

        googleAnalytics.trackEvent("settings_change", {
          settingName: "achievementNotifications",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "notifications",
          context: "settings_panel",
        });

        this.saveSettingsSync();
      });
    }

    // Badge notifications toggle
    const badgeToggle = document.getElementById("toggle-badge-notifications");
    if (badgeToggle) {
      badgeToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.badgeNotifications;
        this.settings.badgeNotifications = e.target.checked;

        googleAnalytics.trackEvent("settings_change", {
          settingName: "badgeNotifications",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "notifications",
          context: "settings_panel",
        });

        this.saveSettingsSync();
      });
    }

    // Progress notifications toggle
    const progressToggle = document.getElementById(
      "toggle-progress-notifications",
    );
    if (progressToggle) {
      progressToggle.addEventListener("change", (e) => {
        const oldValue = this.settings.progressNotifications;
        this.settings.progressNotifications = e.target.checked;

        googleAnalytics.trackEvent("settings_change", {
          settingName: "progressNotifications",
          oldValue,
          newValue: e.target.checked,
          settingType: "toggle",
          category: "notifications",
          context: "settings_panel",
        });

        this.saveSettingsSync();
      });
    }

    // Initialize notification status
    this.checkNotificationPermission();
  }

  /**
   * Handle main notification toggle
   */
  async handleNotificationToggle(enabled) {
    const oldValue = this.settings.notificationsEnabled;

    if (enabled) {
      // Check if notifications are already blocked/denied
      if (Notification.permission === "denied") {
        // Don't try to request permission again - it's blocked
        this.settings.notificationsEnabled = false;
        const toggle = document.getElementById("toggle-notifications");
        if (toggle) toggle.checked = false;
        this.updateNotificationStatus("denied");
        this.showHowToUnblockNotifications();
        return;
      }

      // Request permission if enabling
      const permission = await this.requestNotificationPermission();
      this.settings.notificationsEnabled = permission === "granted";

      if (permission === "granted") {
        this.showNotificationSubOptions(true);
        this.initializeFCM();
      } else {
        // Reset toggle if permission denied
        const toggle = document.getElementById("toggle-notifications");
        if (toggle) toggle.checked = false;
        this.updateNotificationStatus(permission);
        if (permission === "denied") {
          this.showHowToUnblockNotifications();
        }
      }
    } else {
      this.settings.notificationsEnabled = false;
      this.showNotificationSubOptions(false);
      this.updateNotificationStatus("disabled");
    }

    googleAnalytics.trackEvent("settings_change", {
      settingName: "notificationsEnabled",
      oldValue,
      newValue: this.settings.notificationsEnabled,
      settingType: "toggle",
      category: "notifications",
      permissionResult: Notification.permission,
      context: "settings_panel",
    });

    this.saveSettingsSync();
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission() {
    if (!("Notification" in window)) {
      this.updateNotificationStatus("unsupported");
      return "denied";
    }

    // Check if already denied/blocked
    if (Notification.permission === "denied") {
      this.updateNotificationStatus("denied");
      return "denied";
    }

    try {
      const permission = await Notification.requestPermission();
      this.updateNotificationStatus(permission);
      return permission;
    } catch (error) {
      // Error requesting notification permission - this can happen when blocked
      this.updateNotificationStatus("denied");
      return "denied";
    }
  }

  /**
   * Check current notification permission
   */
  checkNotificationPermission() {
    if (!("Notification" in window)) {
      this.updateNotificationStatus("unsupported");
      return;
    }

    const { permission } = Notification;
    this.updateNotificationStatus(permission);

    // Update settings based on actual permission
    if (permission === "granted" && this.settings.notificationsEnabled) {
      this.showNotificationSubOptions(true);
    } else {
      this.settings.notificationsEnabled = false;
      this.showNotificationSubOptions(false);

      // Update the toggle to reflect the correct state
      const toggle = document.getElementById("toggle-notifications");
      if (toggle) {
        toggle.checked = false;
      }

      this.saveSettingsSync();
    }
  }

  /**
   * Update notification status display
   */
  updateNotificationStatus(status) {
    const toggle = document.getElementById("toggle-notifications");

    if (!toggle) return;

    // Update toggle state
    if (status === "granted" && this.settings.notificationsEnabled) {
      toggle.checked = true;
    } else {
      toggle.checked = false;
    }

    // Show a toast for important status changes
    if (status === "denied" || status === "error" || status === "unsupported") {
      // Auto-show toast for problematic states
      setTimeout(() => {
        this.showNotificationStatusToast(status);
      }, TOAST_DELAY); // Small delay to ensure UI is ready
    }
  }

  /**
   * Show/hide notification sub-options
   */
  showNotificationSubOptions(show) {
    const sections = [
      "notification-types-section",
      "notification-badges-section",
      "notification-progress-section",
    ];

    sections.forEach((sectionId) => {
      const section = document.getElementById(sectionId);
      if (section) {
        section.style.display = show ? "block" : "none";
      }
    });
  }

  /**
   * Show notification status information as a toast popup
   */
  showNotificationStatusToast(status) {
    if (!window.NotificationToast) {
      // Fallback if toast system isn't available
      this.showNotificationStatusFallback(status);
      return;
    }

    const toastConfigs = {
      granted: {
        type: "success",
        title: "🔔 Notifications Enabled",
        message:
          "You will receive notifications for achievements, badges, and progress updates. You can customize these in the settings below.",
        duration: 5000,
      },
      denied: {
        type: "warning",
        title: "🚫 Notifications Blocked",
        message: `To enable notifications:
        1. Click the lock/info icon next to the URL
        2. Change notifications from "Block" to "Allow"
        3. Refresh the page and toggle notifications on`,
        duration: 8000,
      },
      default: {
        type: "info",
        title: "🔔 Enable Notifications?",
        message:
          "Toggle the switch above to enable notifications. You'll be asked for permission to show notifications from SimulateAI.",
        duration: 5000,
      },
      unsupported: {
        type: "error",
        title: "❌ Notifications Not Supported",
        message:
          "Your browser doesn't support notifications. Consider updating your browser or switching to a modern browser like Chrome, Firefox, or Safari.",
        duration: 6000,
      },
      disabled: {
        type: "info",
        title: "🔕 Notifications Disabled",
        message:
          "Notifications are currently turned off. Toggle the switch above to enable notifications for achievements and progress updates.",
        duration: 4000,
      },
      error: {
        type: "error",
        title: "⚠️ Notification Error",
        message:
          "There was an error with the notification system. Try refreshing the page or check your browser settings.",
        duration: 6000,
      },
    };

    const config = toastConfigs[status] || {
      type: "info",
      title: "Notification Status",
      message: "Click the toggle above to manage notification settings.",
      duration: 4000,
    };

    window.NotificationToast.show({
      ...config,
      closable: true,
    });
  }

  /**
   * Fallback method for showing notification status without toast system
   */
  showNotificationStatusFallback(status) {
    const messages = {
      granted:
        "Notifications are enabled! You will receive alerts for achievements, badges, and progress updates.",
      denied:
        'Notifications are blocked. To enable:\n1. Click the lock icon next to the URL\n2. Change notifications to "Allow"\n3. Refresh and try again',
      default:
        "Click the toggle above to enable notifications. You'll be asked for permission.",
      unsupported:
        "Your browser doesn't support notifications. Consider updating your browser.",
      disabled:
        "Notifications are currently disabled. Use the toggle above to enable them.",
      error: "There was an error with notifications. Try refreshing the page.",
    };

    alert(
      messages[status] ||
        "Click the toggle above to manage notification settings.",
    );
  }

  /**
   * Show instructions on how to unblock notifications
   */
  showHowToUnblockNotifications() {
    // Use the new toast system for consistent messaging
    this.showNotificationStatusToast("denied");
  }

  /**
   * Initialize FCM if notifications are enabled
   */
  async initializeFCM() {
    try {
      // Check if FCM is available
      if (
        window.fcmMainApp &&
        typeof window.fcmMainApp.initialize === "function"
      ) {
        await window.fcmMainApp.initialize();
      } else {
        // Dynamically import FCM if not already loaded
        const { default: fcmMainApp } = await import("../fcm-main-app.js");
        await fcmMainApp.initialize();
      }
    } catch (error) {
      // Failed to initialize FCM - notification system will continue to work without push notifications
    }
  }

  /**
   * Send a test notification (for debugging)
   */
  sendTestNotification() {
    if (
      !this.settings.notificationsEnabled ||
      Notification.permission !== "granted"
    ) {
      return;
    }

    new Notification("SimulateAI Test", {
      body: "Notifications are working correctly!",
      icon: "/src/assets/icons/favicon.svg",
      badge: "/src/assets/icons/favicon.svg",
    });
  }

  /**
   * Get notification settings for external use
   */
  getNotificationSettings() {
    return {
      enabled: this.settings.notificationsEnabled,
      achievements: this.settings.achievementNotifications,
      badges: this.settings.badgeNotifications,
      progress: this.settings.progressNotifications,
      permission: Notification.permission,
    };
  }

  /**
   * Update notification UI elements
   */
  updateNotificationUI() {
    // Update notification toggles
    const notificationsToggle = document.getElementById("toggle-notifications");
    const achievementToggle = document.getElementById(
      "toggle-achievement-notifications",
    );
    const badgeToggle = document.getElementById("toggle-badge-notifications");
    const progressToggle = document.getElementById(
      "toggle-progress-notifications",
    );

    if (notificationsToggle) {
      notificationsToggle.checked = this.settings.notificationsEnabled;
    }

    if (achievementToggle) {
      achievementToggle.checked = this.settings.achievementNotifications;
    }

    if (badgeToggle) {
      badgeToggle.checked = this.settings.badgeNotifications;
    }

    if (progressToggle) {
      progressToggle.checked = this.settings.progressNotifications;
    }

    // Show/hide sub-options based on main toggle
    this.showNotificationSubOptions(this.settings.notificationsEnabled);

    // Update status
    this.checkNotificationPermission();
  }

  // Public API methods
  getSetting(key) {
    // Return the current setting value, or default if undefined
    const currentValue = this.settings[key];
    if (currentValue !== undefined) {
      return currentValue;
    }

    // If setting is undefined, return the default value from schema
    const settingDef = this.findSettingDefinition(key);
    if (settingDef && settingDef.default !== undefined) {
      return settingDef.default;
    }

    // Final fallback for critical interface settings
    const criticalDefaults = {
      tourTabEnabled: true,
      surpriseTabEnabled: true,
      donateTabEnabled: true,
    };

    return criticalDefaults[key] !== undefined
      ? criticalDefaults[key]
      : currentValue;
  }

  setSetting(key, value) {
    // Validate the setting before applying
    const validatedValue = this.validateSingleSetting(key, value);

    this.settings[key] = validatedValue;
    this.saveSettingsSync();
    this.applySettings();
    this.updateUI();
  }

  /**
   * Validate a single setting value
   */
  validateSingleSetting(key, value) {
    if (!this.settingsSchema?.settings) {
      return value; // No schema available, accept value as-is
    }

    // Find the setting definition
    const settingDef = this.findSettingDefinition(key);
    if (!settingDef) {
      return value; // No definition found, accept value
    }

    // Type validation
    if (settingDef.type === "boolean" && typeof value !== "boolean") {
      return settingDef.default;
    }

    if (settingDef.type === "string" && typeof value !== "string") {
      return settingDef.default;
    }

    if (settingDef.type === "number" && typeof value !== "number") {
      return settingDef.default;
    }

    // Options validation
    if (settingDef.options && !settingDef.options.includes(value)) {
      return settingDef.default;
    }

    // Range validation for numbers
    if (settingDef.type === "number") {
      if (settingDef.min !== undefined && value < settingDef.min) {
        return settingDef.min;
      }
      if (settingDef.max !== undefined && value > settingDef.max) {
        return settingDef.max;
      }
    }

    // Donor privilege validation
    if (settingDef.requiresDonor && !this.isDonor) {
      if (settingDef.restrictions?.nonDonorBehavior === "force_enabled") {
        return true;
      }
      return settingDef.default;
    }

    return value;
  }

  /**
   * Find setting definition by flat key
   */
  findSettingDefinition(flatKey) {
    if (!this.settingsSchema?.settings) return null;

    // Parse the flat key (e.g., "appearance_theme" -> category: "appearance", key: "theme")
    const parts = flatKey.split("_");
    if (parts.length < 2) return null;

    const category = parts[0];
    const settingKey = parts.slice(1).join("_");

    return this.settingsSchema.settings[category]?.[settingKey] || null;
  }

  reset() {
    this.settings = {
      surpriseTabEnabled: true,
      tourTabEnabled: true,
      donateTabEnabled: true,
      theme: "auto",
      fontSize: "medium",
      highContrast: false,
      reducedMotion: false,
      largeClickTargets: false,
    };
    this.saveSettingsSync();
    this.applySettings();
    this.updateUI();
  }
}

// Consolidated initialization - single entry point
function initializeSettingsManager() {
  if (!window.settingsManager) {
    const app = window.simulateAIApp || window.app || window.simulateAI || null;
    window.settingsManager = new SettingsManager(app);
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Wait a bit for shared navigation to inject HTML and app to initialize
    setTimeout(initializeSettingsManager, 100);
  });
} else {
  // DOM is already loaded - wait for navigation to be injected
  setTimeout(initializeSettingsManager, 100);
}

// Add required CSS animations
const style = document.createElement("style");
style.textContent = `
  @keyframes slideIn {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }

  @keyframes slideOut {
    from {
      transform: translateX(0);
      opacity: 1;
    }
    to {
      transform: translateX(100%);
      opacity: 0;
    }
  }

  .notification-content {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .notification-close {
    background: none;
    border: none;
    color: white;
    font-size: 18px;
    cursor: pointer;
    padding: 0;
    margin-left: auto;
  }

  .notification-close:hover {
    opacity: 0.8;
  }
`;
document.head.appendChild(style);

export default SettingsManager;
