/**
 * Global Event Manager
 * Consolidates all event listeners from multiple components to prevent conflicts
 * and improve performance through unified event delegation.
 *
 * Features:
 * - Single source of truth for all event handling
 * - Event delegation for performance
 * - Proper cleanup and memory leak prevention
 * - Analytics integration
 * - Debug and monitoring capabilities
 */

class GlobalEventManager {
  constructor() {
    this.isInitialized = false;
    this.eventHandlers = new Map();
    this.delegatedListeners = new Map();
    this.cleanup = [];
    this.debug = window.DEBUG_MODE || localStorage.getItem("debug") === "true";

    // Components that need event coordination
    this.components = new Map();

    // Event categories for organization
    this.categories = {
      NAVIGATION: "navigation",
      SIMULATION: "simulation",
      UI_INTERACTION: "ui_interaction",
      ACCESSIBILITY: "accessibility",
      ANALYTICS: "analytics",
      THEME: "theme",
      SYSTEM: "system",
    };

    // Performance monitoring
    this.eventStats = {
      totalEvents: 0,
      categoryCounts: {},
      performanceWarnings: [],
    };
  }

  /**
   * Initialize the global event manager
   * This should be called early in app initialization
   */
  initialize() {
    if (this.isInitialized) {
      console.warn("[GlobalEventManager] Already initialized");
      return;
    }

    this.log("Initializing Global Event Manager");

    // Set up core event delegation
    this.setupEventDelegation();

    // Set up system-level events
    this.setupSystemEvents();

    // Set up cleanup
    this.setupCleanup();

    this.isInitialized = true;
    this.log("Global Event Manager initialized successfully");
  }

  /**
   * Register a component with the event manager
   */
  registerComponent(name, component, eventMappings = {}) {
    this.components.set(name, {
      instance: component,
      eventMappings,
      isActive: true,
    });

    this.log(`Component registered: ${name}`);
  }

  /**
   * Set up event delegation for common patterns
   */
  setupEventDelegation() {
    // Main document click delegation
    this.addDelegatedListener(
      document,
      "click",
      (event) => {
        this.handleDelegatedClick(event);
      },
      { passive: false },
    );

    // Main document keydown delegation
    this.addDelegatedListener(
      document,
      "keydown",
      (event) => {
        this.handleDelegatedKeydown(event);
      },
      { passive: false },
    );

    // Window-level events
    this.addDelegatedListener(
      window,
      "scroll",
      (event) => {
        this.handleScroll(event);
      },
      { passive: true },
    );

    this.addDelegatedListener(
      window,
      "resize",
      (event) => {
        this.handleResize(event);
      },
      { passive: true },
    );
  }

  /**
   * Handle delegated click events
   */
  handleDelegatedClick(event) {
    const target = event.target;
    const timestamp = performance.now();

    // Track for analytics
    this.trackEvent("click", { target: this.getElementDescription(target) });

    // Specific button handling for SimulateAI app

    // Start Learning button
    if (target.id === "start-learning") {
      event.preventDefault();
      this.notifyComponents("navigation.start_learning", { event, target });
      return;
    }

    // Test scenario modal button (debug)
    if (target.id === "test-scenario-modal") {
      event.preventDefault();
      this.notifyComponents("demo.pattern", {
        pattern: "test-scenario",
        event,
        target,
      });
      return;
    }

    // Simulation control buttons
    if (target.id === "reset-simulation") {
      event.preventDefault();
      this.notifyComponents("simulation.reset", { event, target });
      return;
    }

    if (target.id === "next-scenario") {
      event.preventDefault();
      this.notifyComponents("simulation.next", { event, target });
      return;
    }

    // Enhanced simulation card buttons
    if (target.classList.contains("enhanced-sim-button")) {
      event.preventDefault();
      const simulationId = target.getAttribute("data-simulation");
      if (simulationId) {
        this.notifyComponents("simulation.start", {
          simulationId,
          event,
          target,
        });
      }
      return;
    }

    // Quick start simulation buttons
    if (target.classList.contains("simulation-quick-start-btn")) {
      event.preventDefault();
      const simulationId = target.getAttribute("data-simulation");
      if (simulationId) {
        this.notifyComponents("simulation.quick-start", {
          simulationId,
          event,
          target,
        });
      }
      return;
    }

    // Modal close button
    if (
      target.classList.contains("modal-close") ||
      target.classList.contains("close")
    ) {
      event.preventDefault();
      this.notifyComponents("modal.close", { event, target });
      return;
    }

    // Modal backdrop clicks
    if (
      target.classList.contains("modal") ||
      target.classList.contains("modal-overlay")
    ) {
      this.notifyComponents("modal.backdrop-click", { event, target });
      return;
    }

    // Pattern demo buttons
    const pattern = target.getAttribute("data-pattern");
    if (pattern) {
      event.preventDefault();
      this.notifyComponents("demo.pattern", { pattern, event, target });
      return;
    }

    // Navigation events
    if (target.closest("[data-nav-item]")) {
      this.handleNavigationClick(event);
      return;
    }

    // Simulation events
    if (target.closest("[data-simulation-action]")) {
      this.handleSimulationClick(event);
      return;
    }

    // Modal events
    if (target.closest("[data-modal-action]")) {
      this.handleModalClick(event);
      return;
    }

    // Settings events
    if (target.closest(".settings-button")) {
      this.handleSettingsClick(event);
      return;
    }

    // Category grid events
    if (target.closest(".category-card, .scenario-card")) {
      this.handleGridItemClick(event);
      return;
    }

    // View toggle events
    if (target.closest(".view-toggle-btn")) {
      this.handleViewToggleClick(event);
      return;
    }

    // Demo controls
    if (target.closest(".demo-btn")) {
      this.handleDemoClick(event);
      return;
    }

    // Generic button handling
    if (target.closest("button") && !target.closest(".modal-backdrop")) {
      this.handleGenericButtonClick(event);
    }
  }

  /**
   * Handle delegated keydown events
   */
  handleDelegatedKeydown(event) {
    // Track for analytics
    this.trackEvent("keydown", {
      key: event.key,
      code: event.code,
      target: this.getElementDescription(event.target),
    });

    // Escape key - close modals, menus
    if (event.key === "Escape") {
      // Check if modal is open and handle specifically
      const modal = document.querySelector('.modal:not([aria-hidden="true"])');
      if (modal) {
        this.notifyComponents("system.escape", { event, modal });
      } else {
        this.handleEscapeKey(event);
      }
      return;
    }

    // Tab key - accessibility navigation and modal focus trapping
    if (event.key === "Tab") {
      const modal = document.querySelector('.modal:not([aria-hidden="true"])');
      if (modal) {
        this.notifyComponents("modal.tab-trap", { event, modal });
      } else {
        this.handleTabKey(event);
      }
      return;
    }

    // V key - toggle views (when not in input)
    if (event.key === "v" || event.key === "V") {
      if (!this.isInputTarget(event.target)) {
        this.handleViewToggleKey(event);
        return;
      }
    }

    // Enter/Space on interactive elements
    if (event.key === "Enter" || event.key === " ") {
      if (event.target.closest('[role="button"], .interactive')) {
        this.handleActivationKey(event);
        return;
      }
    }
  }

  /**
   * Handle scroll events with throttling
   */
  handleScroll(event) {
    // Throttle scroll events
    if (!this.scrollThrottle) {
      this.scrollThrottle = true;
      requestAnimationFrame(() => {
        this.notifyComponents("scroll", {
          scrollY: window.scrollY,
          scrollX: window.scrollX,
        });
        this.scrollThrottle = false;
      });
    }
  }

  /**
   * Handle resize events with debouncing
   */
  handleResize(event) {
    clearTimeout(this.resizeTimeout);
    this.resizeTimeout = setTimeout(() => {
      this.notifyComponents("resize", {
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }, 150);
  }

  /**
   * Handle navigation clicks
   */
  handleNavigationClick(event) {
    const navItem = event.target.closest("[data-nav-item]");
    const action = navItem?.dataset.navItem;

    this.notifyComponents("navigation", { action, event });
    this.trackEvent("navigation_click", { action });
  }

  /**
   * Handle simulation-related clicks
   */
  handleSimulationClick(event) {
    const actionEl = event.target.closest("[data-simulation-action]");
    const action = actionEl?.dataset.simulationAction;

    this.notifyComponents("simulation", { action, event });
    this.trackEvent("simulation_action", { action });
  }

  /**
   * Handle modal clicks
   */
  handleModalClick(event) {
    const actionEl = event.target.closest("[data-modal-action]");
    const action = actionEl?.dataset.modalAction || "backdrop-click";

    this.notifyComponents("modal", { action, event });
    this.trackEvent("modal_interaction", { action });
  }

  /**
   * Handle settings clicks
   */
  handleSettingsClick(event) {
    this.notifyComponents("settings", { event });
    this.trackEvent("settings_panel_open", {});
  }

  /**
   * Handle grid item clicks (categories/scenarios)
   */
  handleGridItemClick(event) {
    const card = event.target.closest(".category-card, .scenario-card");
    const cardType = card?.classList.contains("category-card")
      ? "category"
      : "scenario";
    const cardId = card?.dataset.categoryId || card?.dataset.scenarioId;

    this.notifyComponents("grid_item", { cardType, cardId, event });
    this.trackEvent("grid_item_click", { cardType, cardId });
  }

  /**
   * Handle view toggle clicks
   */
  handleViewToggleClick(event) {
    const btn = event.target.closest(".view-toggle-btn");
    const view = btn?.dataset.view;

    if (view) {
      this.notifyComponents("view_toggle", { view, event });
      this.trackEvent("view_toggle", { view });
    }
  }

  /**
   * Handle start learning click
   */
  handleStartLearningClick(event) {
    this.notifyComponents("start_learning", { event });
    this.trackEvent("start_learning_click", {});
  }

  /**
   * Handle demo button clicks
   */
  handleDemoClick(event) {
    const btn = event.target.closest(".demo-btn");
    const pattern = btn?.dataset.pattern;

    if (pattern) {
      this.notifyComponents("demo", { pattern, event });
      this.trackEvent("demo_pattern", { pattern });

      // IMPORTANT: Also execute the inline onclick handler if it exists
      // This ensures compatibility with existing onclick="simulateEthicsPattern(...)" handlers
      if (btn.onclick && typeof btn.onclick === "function") {
        try {
          btn.onclick.call(btn, event);
        } catch (error) {
          console.error("Error executing inline onclick handler:", error);
        }
      }

      // Alternative: Look for onclick attribute and execute it
      const onclickAttr = btn.getAttribute("onclick");
      if (onclickAttr) {
        try {
          // Create a function that executes in the button's context
          const onclickFunction = new Function("event", onclickAttr);
          onclickFunction.call(btn, event);
        } catch (error) {
          console.error("Error executing onclick attribute:", error);
        }
      }
    }
  }

  /**
   * Handle generic button clicks
   */
  handleGenericButtonClick(event) {
    const button = event.target.closest("button");
    const buttonId = button?.id;
    const buttonClass = button?.className;

    this.trackEvent("button_click", {
      id: buttonId,
      className: buttonClass,
      text: button?.textContent?.trim()?.substring(0, 50),
    });
  }

  /**
   * Handle escape key
   */
  handleEscapeKey(event) {
    this.notifyComponents("escape", { event });
  }

  /**
   * Handle view toggle key
   */
  handleViewToggleKey(event) {
    event.preventDefault();
    this.notifyComponents("view_toggle_key", { event });
    this.trackEvent("view_toggle_keyboard", {});
  }

  /**
   * Handle tab key for accessibility
   */
  handleTabKey(event) {
    this.notifyComponents("tab_navigation", {
      event,
      direction: event.shiftKey ? "backward" : "forward",
    });
  }

  /**
   * Handle activation keys (Enter/Space)
   */
  handleActivationKey(event) {
    const target = event.target;
    if (
      target.closest('[role="button"]') ||
      target.classList.contains("interactive")
    ) {
      event.preventDefault();
      target.click();
    }
  }

  /**
   * Set up system-level events
   */
  setupSystemEvents() {
    // Error handling
    window.addEventListener("error", (event) => {
      this.notifyComponents("error", { event });
      this.trackEvent("js_error", {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
      });
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.notifyComponents("unhandled_rejection", { event });
      this.trackEvent("unhandled_promise_rejection", {
        reason: event.reason?.toString(),
      });
    });

    // Theme change detection
    const reducedMotionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    const highContrastQuery = window.matchMedia?.("(prefers-contrast: high)");

    reducedMotionQuery?.addEventListener?.("change", (event) => {
      this.notifyComponents("theme_change", {
        type: "reduced_motion",
        matches: event.matches,
      });
    });

    highContrastQuery?.addEventListener?.("change", (event) => {
      this.notifyComponents("theme_change", {
        type: "high_contrast",
        matches: event.matches,
      });
    });

    // App shutdown
    window.addEventListener("beforeunload", (event) => {
      this.notifyComponents("app_shutdown", { event });
      this.cleanup.forEach((fn) => fn());
    });
  }

  /**
   * Add a delegated event listener
   */
  addDelegatedListener(element, eventType, handler, options = {}) {
    const wrappedHandler = (event) => {
      try {
        handler(event);
      } catch (error) {
        console.error(
          `[GlobalEventManager] Error in ${eventType} handler:`,
          error,
        );
      }
    };

    element.addEventListener(eventType, wrappedHandler, options);

    // Store for cleanup
    this.cleanup.push(() => {
      element.removeEventListener(eventType, wrappedHandler, options);
    });

    this.log(`Added delegated listener: ${eventType} on`, element);
  }

  /**
   * Notify all registered components of an event
   */
  notifyComponents(eventType, data) {
    this.components.forEach((component, name) => {
      if (!component.isActive) return;

      try {
        // Check if component has a handler for this event type
        const handler = component.eventMappings[eventType];
        if (typeof handler === "function") {
          handler.call(component.instance, data);
        } else if (
          typeof component.instance[`handle${this.capitalize(eventType)}`] ===
          "function"
        ) {
          component.instance[`handle${this.capitalize(eventType)}`](data);
        } else if (typeof component.instance.handleEvent === "function") {
          component.instance.handleEvent(eventType, data);
        }
      } catch (error) {
        console.error(
          `[GlobalEventManager] Error notifying ${name} of ${eventType}:`,
          error,
        );
      }
    });
  }

  /**
   * Track event for analytics
   */
  trackEvent(eventName, data = {}) {
    this.eventStats.totalEvents++;
    this.eventStats.categoryCounts[eventName] =
      (this.eventStats.categoryCounts[eventName] || 0) + 1;

    // Send to analytics systems
    if (window.simpleAnalytics?.trackEvent) {
      window.simpleAnalytics.trackEvent(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
        source: "global_event_manager",
      });
    }

    // Send to enhanced analytics if available
    if (window.app?.analyticsManager?.trackEvent) {
      window.app.analyticsManager.trackEvent(eventName, {
        ...data,
        timestamp: new Date().toISOString(),
        source: "global_event_manager",
      });
    }
  }

  /**
   * Setup cleanup for proper memory management
   */
  setupCleanup() {
    // Register cleanup function globally
    window.globalEventManagerCleanup = () => {
      this.cleanup.forEach((fn) => fn());
      this.components.clear();
      this.eventHandlers.clear();
      this.isInitialized = false;
      this.log("Global Event Manager cleaned up");
    };
  }

  /**
   * Get a descriptive string for an element (for debugging/analytics)
   */
  getElementDescription(element) {
    if (!element) return "unknown";

    const tagName = element.tagName?.toLowerCase() || "unknown";
    const id = element.id ? `#${element.id}` : "";
    const className = element.className
      ? `.${element.className.split(" ").join(".")}`
      : "";

    return `${tagName}${id}${className}`.substring(0, 100);
  }

  /**
   * Check if target is an input element
   */
  isInputTarget(element) {
    const inputTypes = ["input", "textarea", "select"];
    return (
      inputTypes.includes(element?.tagName?.toLowerCase()) ||
      element?.contentEditable === "true"
    );
  }

  /**
   * Capitalize first letter
   */
  capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Debug logging
   */
  log(message, ...args) {
    if (this.debug) {
      console.log(`[GlobalEventManager] ${message}`, ...args);
    }
  }

  /**
   * Get performance statistics
   */
  getStats() {
    return {
      ...this.eventStats,
      componentsRegistered: this.components.size,
      isInitialized: this.isInitialized,
    };
  }

  /**
   * Disable a component's event handling
   */
  disableComponent(name) {
    const component = this.components.get(name);
    if (component) {
      component.isActive = false;
      this.log(`Component disabled: ${name}`);
    }
  }

  /**
   * Enable a component's event handling
   */
  enableComponent(name) {
    const component = this.components.get(name);
    if (component) {
      component.isActive = true;
      this.log(`Component enabled: ${name}`);
    }
  }
}

// Create global instance
const globalEventManager = new GlobalEventManager();

// Export for use
export default globalEventManager;

// Also make available globally for debugging
window.globalEventManager = globalEventManager;
