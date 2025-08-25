/**
 * UIBinder - Unified UI Management System
 * Provides centralized UI operations, theme management, and accessibility features
 *
 * Features:
 * - Theme application and management
 * - Modal and component UI patterns
 * - Accessibility enhancements
 * - Performance-optimized DOM operations
 * - Event delegation and management
 * - Animation coordination
 */

class UIBinder {
  constructor(options = {}) {
    // Handle both old style (dataHandler) and new style (options) constructors
    if (
      typeof options === "object" &&
      (options.enableThemeManager || options.dataHandler)
    ) {
      // New options-based constructor
      this.dataHandler = options.dataHandler || null;
      this.enableThemeManager = options.enableThemeManager !== false;
      this.enableAccessibility = options.enableAccessibility !== false;
      this.enablePerformanceMonitoring =
        options.enablePerformanceMonitoring !== false;
    } else {
      // Legacy constructor (dataHandler parameter)
      this.dataHandler = options;
      this.enableThemeManager = true;
      this.enableAccessibility = true;
      this.enablePerformanceMonitoring = true;
    }

    this.themeCache = new Map();
    this.componentRegistry = new Map();
    this.eventDelegates = new Map();
    this.animationQueue = [];
    this.isInitialized = false;
    this.performanceMetrics = {
      domOperations: 0,
      themeApplications: 0,
      eventBindings: 0,
      animationsProcessed: 0,
    };

    try {
      const __verbose =
        (typeof localStorage !== "undefined" &&
          (localStorage.getItem("debug") === "true" ||
            localStorage.getItem("verbose-logs") === "true")) ||
        false;
      if (__verbose) {
        console.log(
          "[UIBinder] Initialized with theme and component management",
        );
      }
    } catch (_) {
      // no-op
    }
  }

  /**
   * Initialize UIBinder (alias for backward compatibility)
   */
  async initialize() {
    return await this.init();
  }

  /**
   * Initialize UIBinder
   */
  async init() {
    if (this.isInitialized) return;

    try {
      // Load saved theme preferences
      if (this.enableThemeManager) {
        await this.loadThemePreferences();
      }

      // Set up global event delegation
      this.setupGlobalEventDelegation();

      // Initialize accessibility features
      if (this.enableAccessibility) {
        this.initializeAccessibilityFeatures();
      }

      // Set up performance monitoring
      if (this.enablePerformanceMonitoring) {
        this.setupPerformanceMonitoring();
      }

      this.isInitialized = true;
      try {
        const __verbose =
          (typeof localStorage !== "undefined" &&
            (localStorage.getItem("debug") === "true" ||
              localStorage.getItem("verbose-logs") === "true")) ||
          false;
        if (__verbose) {
          console.log("[UIBinder] Initialization complete");
        }
      } catch (_) {
        // no-op
      }
    } catch (error) {
      console.error("[UIBinder] Initialization failed:", error);
    }
  }

  /**
   * Theme Management
   */
  async applyTheme(themeName, options = {}) {
    const startTime = performance.now();

    try {
      // Check cache first
      let themeData = this.themeCache.get(themeName);

      if (!themeData || options.forceReload) {
        // Load theme data
        themeData = await this.loadThemeData(themeName);
        if (themeData) {
          this.themeCache.set(themeName, themeData);
        }
      }

      if (!themeData) {
        console.warn(`[UIBinder] Theme '${themeName}' not found`);
        return false;
      }

      // Apply CSS variables
      if (themeData.cssVariables) {
        this.applyCSSVariables(themeData.cssVariables);
      }

      // Apply component styles
      if (themeData.componentStyles) {
        this.applyComponentStyles(themeData.componentStyles);
      }

      // Update body classes - OPTIMIZED: Avoid unnecessary DOM mutations
      if (themeData.bodyClasses) {
        const currentClasses = Array.from(document.body.classList);
        const themeClassesToRemove = currentClasses.filter((cls) =>
          cls.startsWith("theme-"),
        );

        // Only remove classes if there are any to remove
        if (themeClassesToRemove.length > 0) {
          document.body.classList.remove(...themeClassesToRemove);
        }

        // Only add classes that aren't already present
        const classesToAdd = themeData.bodyClasses.filter(
          (cls) => !document.body.classList.contains(cls),
        );
        if (classesToAdd.length > 0) {
          document.body.classList.add(...classesToAdd);
        }
      }

      // Save preference
      if (this.dataHandler && !options.temporary) {
        await this.saveThemePreference(themeName);
      }

      this.performanceMetrics.themeApplications++;
      try {
        const __verbose =
          (typeof localStorage !== "undefined" &&
            (localStorage.getItem("debug") === "true" ||
              localStorage.getItem("verbose-logs") === "true")) ||
          false;
        if (__verbose) {
          console.log(
            `[UIBinder] Theme '${themeName}' applied in ${performance.now() - startTime}ms`,
          );
        }
      } catch (_) {
        // no-op
      }

      // Emit theme change event
      this.emit("themeChanged", { theme: themeName, data: themeData });

      return true;
    } catch (error) {
      console.error(`[UIBinder] Failed to apply theme '${themeName}':`, error);
      return false;
    }
  }

  async loadThemeData(themeName) {
    // Default themes
    const defaultThemes = {
      light: {
        cssVariables: {
          "--primary-bg": "#ffffff",
          "--secondary-bg": "#f8f9fa",
          "--text-primary": "#212529",
          "--text-secondary": "#6c757d",
          "--accent-color": "#007bff",
          "--border-color": "#dee2e6",
        },
        bodyClasses: ["theme-light"],
        componentStyles: {},
      },
      dark: {
        cssVariables: {
          "--primary-bg": "#1a1a1a",
          "--secondary-bg": "#2d2d2d",
          "--text-primary": "#ffffff",
          "--text-secondary": "#cccccc",
          "--accent-color": "#4dabf7",
          "--border-color": "#404040",
        },
        bodyClasses: ["theme-dark"],
        componentStyles: {},
      },
    };

    // Try to load from DataHandler first
    if (this.dataHandler) {
      const customTheme = await this.dataHandler.getData(`theme_${themeName}`);
      if (customTheme) return customTheme;
    }

    return defaultThemes[themeName] || null;
  }

  applyCSSVariables(variables) {
    const root = document.documentElement;
    // OPTIMIZED: Batch CSS variable updates to reduce layout thrashing
    const cssText = Object.entries(variables)
      .map(([key, value]) => `${key}: ${value}`)
      .join("; ");

    // Apply all variables at once if possible, or fallback to individual application
    if (cssText) {
      try {
        const currentStyle = root.style.cssText;
        root.style.cssText =
          currentStyle + (currentStyle ? "; " : "") + cssText;
      } catch (error) {
        // Fallback to individual property setting if batch fails
        Object.entries(variables).forEach(([key, value]) => {
          root.style.setProperty(key, value);
        });
      }
    }
  }

  applyComponentStyles(styles) {
    Object.entries(styles).forEach(([selector, rules]) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        Object.assign(element.style, rules);
      });
    });
  }

  async loadThemePreferences() {
    if (!this.dataHandler) return;

    const preferences = await this.dataHandler.getUserPreferences();
    const savedTheme = preferences.theme || "light";
    await this.applyTheme(savedTheme, { temporary: true });
  }

  async saveThemePreference(themeName) {
    if (!this.dataHandler) return;

    const preferences = await this.dataHandler.getUserPreferences();
    preferences.theme = themeName;
    await this.dataHandler.saveUserPreferences(preferences);
  }

  /**
   * Component Management
   */
  registerComponent(name, config) {
    this.componentRegistry.set(name, {
      ...config,
      instances: new Set(),
    });
    console.log(`[UIBinder] Component '${name}' registered`);
  }

  async createComponent(name, container, props = {}) {
    const componentConfig = this.componentRegistry.get(name);
    if (!componentConfig) {
      console.error(`[UIBinder] Component '${name}' not registered`);
      return null;
    }

    try {
      const instance = await componentConfig.factory(container, props, this);
      componentConfig.instances.add(instance);

      console.log(`[UIBinder] Component '${name}' created`);
      return instance;
    } catch (error) {
      console.error(`[UIBinder] Failed to create component '${name}':`, error);
      return null;
    }
  }

  destroyComponent(name, instance) {
    const componentConfig = this.componentRegistry.get(name);
    if (componentConfig && componentConfig.instances.has(instance)) {
      componentConfig.instances.delete(instance);

      if (typeof instance.destroy === "function") {
        instance.destroy();
      }

      console.log(`[UIBinder] Component '${name}' destroyed`);
    }
  }

  /**
   * Modal Management
   */
  async showModal(modalConfig) {
    // Configure close behavior with sensible defaults
    const closeOnEsc =
      modalConfig.closeOnEsc === undefined ? true : !!modalConfig.closeOnEsc;
    const closeOnBackdrop =
      modalConfig.closeOnBackdrop === undefined
        ? true
        : !!modalConfig.closeOnBackdrop;
    const showCloseButton =
      modalConfig.showCloseButton === undefined
        ? true
        : !!modalConfig.showCloseButton;
    const modal = document.createElement("div");
    modal.className = "ui-modal";
    modal.innerHTML = `
            <div class="ui-modal-backdrop"></div>
            <div class="ui-modal-content" role="dialog" aria-modal="true">
                <div class="ui-modal-header">
                    <h2>${modalConfig.title || ""}</h2>
                    ${
                      showCloseButton
                        ? '<button class="ui-modal-close" aria-label="Close modal">&times;</button>'
                        : ""
                    }
                </div>
                <div class="ui-modal-body">
                    ${modalConfig.content || ""}
                </div>
                ${
                  modalConfig.actions
                    ? `
                    <div class="ui-modal-footer">
                        ${modalConfig.actions
                          .map(
                            (action) =>
                              `<button class="ui-btn ui-btn-${action.type || "primary"}" data-action="${action.id}">
                                ${action.label}
                            </button>`,
                          )
                          .join("")}
                    </div>
                `
                    : ""
                }
            </div>
        `;

    // OPTIMIZED: Cache DOM elements to avoid multiple queries
    const closeBtn = modal.querySelector(".ui-modal-close");
    const backdrop = modal.querySelector(".ui-modal-backdrop");

    const closeModal = () => {
      modal.remove();
      document.body.classList.remove("ui-modal-open");
      if (modalConfig.onClose) modalConfig.onClose();
    };

    if (closeBtn) {
      closeBtn.addEventListener("click", closeModal);
    }
    if (backdrop && closeOnBackdrop) {
      backdrop.addEventListener("click", closeModal);
    }

    // Action handlers - OPTIMIZED: Batch DOM queries
    if (modalConfig.actions) {
      const actionButtons = new Map();
      modalConfig.actions.forEach((action) => {
        const btn = modal.querySelector(`[data-action="${action.id}"]`);
        if (btn) actionButtons.set(action.id, btn);
      });

      modalConfig.actions.forEach((action) => {
        const btn = actionButtons.get(action.id);
        if (btn && action.handler) {
          btn.addEventListener("click", (e) => {
            const result = action.handler(e);
            if (result !== false) closeModal();
          });
        }
      });
    }

    // Accessibility (pass policy flags)
    this.setupModalAccessibility(modal, { closeOnEsc });

    // Add to DOM
    document.body.appendChild(modal);
    document.body.classList.add("ui-modal-open");

    // Animation
    requestAnimationFrame(() => {
      modal.classList.add("ui-modal-show");
    });

    if (modalConfig.onShow) modalConfig.onShow(modal);

    return modal;
  }

  setupModalAccessibility(modal, options = {}) {
    const modalContent = modal.querySelector(".ui-modal-content");
    const closeOnEsc = options.closeOnEsc !== false; // default true

    // Focus management
    const focusableElements = modalContent.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }

    // Trap focus within modal
    modalContent.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        const firstElement = focusableElements[0];
        const lastElement = focusableElements[focusableElements.length - 1];

        if (e.shiftKey && document.activeElement === firstElement) {
          e.preventDefault();
          lastElement.focus();
        } else if (!e.shiftKey && document.activeElement === lastElement) {
          e.preventDefault();
          firstElement.focus();
        }
      } else if (e.key === "Escape" && closeOnEsc) {
        const closeBtn = modal.querySelector(".ui-modal-close");
        if (closeBtn) {
          closeBtn.click();
        } else {
          // Fallback: remove modal if close button hidden but ESC allowed
          modal.remove();
          document.body.classList.remove("ui-modal-open");
        }
      }
    });
  }

  /**
   * Event Management
   */
  setupGlobalEventDelegation() {
    // Delegate common UI events
    document.addEventListener("click", this.handleGlobalClick.bind(this));
    document.addEventListener("keydown", this.handleGlobalKeydown.bind(this));
    document.addEventListener("focus", this.handleGlobalFocus.bind(this), true);

    this.performanceMetrics.eventBindings += 3;
  }

  handleGlobalClick(event) {
    const target = event.target;

    // Handle data-action attributes
    const actionElement = target.closest("[data-action]");
    if (actionElement) {
      const action = actionElement.dataset.action;
      this.emit("action", { action, element: actionElement, event });
    }

    // Handle component-specific clicks
    const componentElement = target.closest("[data-component]");
    if (componentElement) {
      const componentName = componentElement.dataset.component;
      this.emit("componentClick", {
        component: componentName,
        element: componentElement,
        event,
      });
    }
  }

  handleGlobalKeydown(event) {
    // Global keyboard shortcuts
    if (event.ctrlKey || event.metaKey) {
      switch (event.key) {
        case "k":
          event.preventDefault();
          this.emit("quickAction", { action: "search" });
          break;
        case "/":
          event.preventDefault();
          this.emit("quickAction", { action: "help" });
          break;
      }
    }
  }

  handleGlobalFocus(event) {
    // Accessibility: Ensure focus is visible
    if (
      event.target.matches("button, a, input, select, textarea, [tabindex]")
    ) {
      event.target.classList.add("ui-focus-visible");

      const removeFocus = () => {
        event.target.classList.remove("ui-focus-visible");
        event.target.removeEventListener("blur", removeFocus);
      };

      event.target.addEventListener("blur", removeFocus);
    }
  }

  /**
   * Animation Management
   */
  queueAnimation(animationConfig) {
    this.animationQueue.push({
      ...animationConfig,
      timestamp: Date.now(),
    });

    if (this.animationQueue.length === 1) {
      this.processAnimationQueue();
    }
  }

  async processAnimationQueue() {
    while (this.animationQueue.length > 0) {
      const animation = this.animationQueue.shift();
      await this.executeAnimation(animation);
      this.performanceMetrics.animationsProcessed++;
    }
  }

  async executeAnimation(config) {
    return new Promise((resolve) => {
      const element = config.element;
      const duration = config.duration || 300;
      const easing = config.easing || "ease-in-out";

      if (config.type === "fadeIn") {
        // OPTIMIZED: Batch style applications to reduce layout thrashing
        element.style.cssText += `opacity: 0; transition: opacity ${duration}ms ${easing};`;

        requestAnimationFrame(() => {
          element.style.opacity = "1";
          setTimeout(resolve, duration);
        });
      } else if (config.type === "slideIn") {
        // OPTIMIZED: Batch style applications to reduce layout thrashing
        element.style.cssText += `
          transform: translateY(-20px); 
          opacity: 0; 
          transition: transform ${duration}ms ${easing}, opacity ${duration}ms ${easing};
        `;

        requestAnimationFrame(() => {
          element.style.transform = "translateY(0)";
          element.style.opacity = "1";
          setTimeout(resolve, duration);
        });
      } else {
        // Custom animation
        if (config.executor) {
          config.executor(element, resolve);
        } else {
          resolve();
        }
      }
    });
  }

  /**
   * Accessibility Features
   */
  initializeAccessibilityFeatures() {
    // High contrast mode detection
    if (window.matchMedia("(prefers-contrast: high)").matches) {
      document.body.classList.add("ui-high-contrast");
    }

    // Reduced motion detection
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      document.body.classList.add("ui-reduced-motion");
    }

    // Color scheme detection
    if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      document.body.classList.add("ui-prefers-dark");
    }

    try {
      const __verbose =
        (typeof localStorage !== "undefined" &&
          (localStorage.getItem("debug") === "true" ||
            localStorage.getItem("verbose-logs") === "true")) ||
        false;
      if (__verbose) {
        console.log("[UIBinder] Accessibility features initialized");
      }
    } catch (_) {
      // no-op
    }
  }

  /**
   * Utility Methods
   */
  createElement(tag, attributes = {}, children = []) {
    const element = document.createElement(tag);

    Object.entries(attributes).forEach(([key, value]) => {
      if (key === "className") {
        element.className = value;
      } else if (key === "dataset") {
        Object.assign(element.dataset, value);
      } else {
        element.setAttribute(key, value);
      }
    });

    children.forEach((child) => {
      if (typeof child === "string") {
        element.appendChild(document.createTextNode(child));
      } else {
        element.appendChild(child);
      }
    });

    this.performanceMetrics.domOperations++;
    return element;
  }

  updateElement(element, updates) {
    if (updates.text !== undefined) {
      element.textContent = updates.text;
    }
    if (updates.html !== undefined) {
      element.innerHTML = updates.html;
    }
    if (updates.attributes) {
      Object.entries(updates.attributes).forEach(([key, value]) => {
        element.setAttribute(key, value);
      });
    }
    if (updates.styles) {
      Object.assign(element.style, updates.styles);
    }
    if (updates.classes) {
      if (updates.classes.add) {
        element.classList.add(...updates.classes.add);
      }
      if (updates.classes.remove) {
        element.classList.remove(...updates.classes.remove);
      }
    }

    this.performanceMetrics.domOperations++;
  }

  /**
   * Event System
   */
  emit(eventName, data = {}) {
    const event = new CustomEvent(`uibinder:${eventName}`, { detail: data });
    document.dispatchEvent(event);
  }

  on(eventName, handler) {
    document.addEventListener(`uibinder:${eventName}`, handler);
  }

  off(eventName, handler) {
    document.removeEventListener(`uibinder:${eventName}`, handler);
  }

  /**
   * Performance Monitoring
   * OPTIMIZED: Throttled mutation observation to reduce performance overhead
   */
  setupPerformanceMonitoring() {
    // Monitor DOM mutations with throttling to avoid excessive callbacks
    if (window.MutationObserver) {
      let mutationCount = 0;
      let throttleTimeout = null;

      const observer = new MutationObserver((mutations) => {
        mutationCount += mutations.length;

        // Throttle updates to avoid excessive metric updates
        if (!throttleTimeout) {
          throttleTimeout = setTimeout(() => {
            this.performanceMetrics.domOperations += mutationCount;
            mutationCount = 0;
            throttleTimeout = null;
          }, 100); // Update metrics every 100ms max
        }
      });

      observer.observe(document.body, {
        childList: true,
        subtree: true,
        attributes: false, // OPTIMIZED: Skip attribute changes to reduce noise
      });

      // Store observer reference for cleanup
      this.mutationObserver = observer;
    }
  }

  getPerformanceMetrics() {
    return {
      ...this.performanceMetrics,
      componentCount: this.componentRegistry.size,
      themesCached: this.themeCache.size,
      animationQueueLength: this.animationQueue.length,
    };
  }

  /**
   * Health Check
   */
  healthCheck() {
    return {
      status: "healthy",
      initialized: this.isInitialized,
      components: this.componentRegistry.size,
      themes: this.themeCache.size,
      metrics: this.getPerformanceMetrics(),
      accessibility: {
        highContrast: document.body.classList.contains("ui-high-contrast"),
        reducedMotion: document.body.classList.contains("ui-reduced-motion"),
        prefersDark: document.body.classList.contains("ui-prefers-dark"),
      },
    };
  }

  /**
   * Cleanup method to prevent memory leaks
   * OPTIMIZED: Proper resource cleanup
   */
  destroy() {
    // Disconnect mutation observer
    if (this.mutationObserver) {
      this.mutationObserver.disconnect();
      this.mutationObserver = null;
    }

    // Clear all registries and caches
    this.themeCache.clear();
    this.componentRegistry.clear();
    this.eventDelegates.clear();
    this.animationQueue.length = 0;

    // Remove global event listeners
    document.removeEventListener("click", this.handleGlobalClick.bind(this));
    document.removeEventListener(
      "keydown",
      this.handleGlobalKeydown.bind(this),
    );
    document.removeEventListener(
      "focus",
      this.handleGlobalFocus.bind(this),
      true,
    );

    this.isInitialized = false;
    console.log("[UIBinder] Cleanup complete");
  }
}

// Export for use in modules
if (typeof window !== "undefined") {
  window.UIBinder = UIBinder;
}

// ES6 export for modern modules
export default UIBinder;
