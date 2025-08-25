/**
 * Example: Alert Component JavaScript with CSS Layers Integration
 * Copyright 2025 Armando Sori
 *
 * Demonstrates how to create JavaScript components that work seamlessly
 * with CSS layers architecture
 */

// CSS Layers constants for better maintainability
const CSS_LAYERS = {
  RESET: "reset",
  TOKENS: "tokens",
  BASE: "base",
  LAYOUT: "layout",
  COMPONENTS: "components",
  UTILITIES: "utilities",
  OVERRIDES: "overrides",
};

// Component class definitions organized by CSS layer
const COMPONENT_CLASSES = {
  // @layer components classes
  ALERT: {
    base: "alert",
    icon: "alert__icon",
    content: "alert__content",
    title: "alert__title",
    message: "alert__message",
    close: "alert__close",
    // Variants
    success: "alert--success",
    warning: "alert--warning",
    error: "alert--error",
    info: "alert--info",
    // Sizes
    small: "alert--small",
    large: "alert--large",
    // States
    dismissible: "alert--dismissible",
    dismissing: "alert--dismissing",
    compact: "alert--compact",
    borderless: "alert--borderless",
  },
};

// Utility classes organized by CSS layer
const UTILITY_CLASSES = {
  // @layer utilities classes
  DISPLAY: {
    none: "d-none",
    block: "d-block",
    flex: "d-flex",
    grid: "d-grid",
  },
  TEXT: {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  },
  SPACING: {
    m0: "m-0",
    m1: "m-1",
    m2: "m-2",
    m3: "m-3",
    m4: "m-4",
    p0: "p-0",
    p1: "p-1",
    p2: "p-2",
    p3: "p-3",
    p4: "p-4",
  },
};

/**
 * Alert Component Class
 * Designed to work with CSS layers architecture
 */
class Alert {
  constructor(options = {}) {
    this.options = {
      type: "info", // success, warning, error, info
      size: "normal", // small, normal, large
      title: "",
      message: "",
      dismissible: true,
      autoClose: false,
      autoCloseDelay: 5000,
      position: "top-right",
      ...options,
    };

    this.element = null;
    this.autoCloseTimer = null;
    this.isVisible = false;

    // Create the alert element
    this.create();

    // Set up event listeners
    this.setupEventListeners();
  }

  /**
   * Create the alert DOM element using CSS layers classes
   */
  create() {
    // Create main alert container
    this.element = document.createElement("div");
    this.element.className = this.buildAlertClasses();
    this.element.setAttribute("role", "alert");
    this.element.setAttribute("aria-live", "assertive");

    // Create alert content structure
    this.element.innerHTML = this.buildAlertHTML();

    // Add to DOM
    this.appendToContainer();
  }

  /**
   * Build CSS classes using layers-aware class constants
   */
  buildAlertClasses() {
    const classes = [COMPONENT_CLASSES.ALERT.base];

    // Add type variant class (@layer components)
    if (this.options.type && COMPONENT_CLASSES.ALERT[this.options.type]) {
      classes.push(COMPONENT_CLASSES.ALERT[this.options.type]);
    }

    // Add size variant class (@layer components)
    if (
      this.options.size !== "normal" &&
      COMPONENT_CLASSES.ALERT[this.options.size]
    ) {
      classes.push(COMPONENT_CLASSES.ALERT[this.options.size]);
    }

    // Add state classes (@layer components)
    if (this.options.dismissible) {
      classes.push(COMPONENT_CLASSES.ALERT.dismissible);
    }

    return classes.join(" ");
  }

  /**
   * Build alert HTML structure
   */
  buildAlertHTML() {
    const iconSVG = this.getIconSVG();
    const hasTitle = this.options.title && this.options.title.trim();

    return `
      ${iconSVG ? `<div class="${COMPONENT_CLASSES.ALERT.icon}">${iconSVG}</div>` : ""}
      <div class="${COMPONENT_CLASSES.ALERT.content}">
        ${hasTitle ? `<div class="${COMPONENT_CLASSES.ALERT.title}">${this.options.title}</div>` : ""}
        <div class="${COMPONENT_CLASSES.ALERT.message}">${this.options.message}</div>
      </div>
      ${this.options.dismissible ? `<button class="${COMPONENT_CLASSES.ALERT.close}" aria-label="Close alert">&times;</button>` : ""}
    `;
  }

  /**
   * Get appropriate icon SVG based on alert type
   */
  getIconSVG() {
    const icons = {
      success: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clip-rule="evenodd"/></svg>`,
      warning: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clip-rule="evenodd"/></svg>`,
      error: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd"/></svg>`,
      info: `<svg viewBox="0 0 20 20" fill="currentColor"><path fill-rule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clip-rule="evenodd"/></svg>`,
    };

    return icons[this.options.type] || icons.info;
  }

  /**
   * Append alert to appropriate container
   */
  appendToContainer() {
    let container = document.querySelector(".alert-container");

    if (!container) {
      container = document.createElement("div");
      container.className = "alert-container";
      document.body.appendChild(container);
    }

    container.appendChild(this.element);
  }

  /**
   * Set up event listeners for alert interactions
   */
  setupEventListeners() {
    // Close button click handler
    if (this.options.dismissible) {
      const closeBtn = this.element.querySelector(
        `.${COMPONENT_CLASSES.ALERT.close}`,
      );
      if (closeBtn) {
        closeBtn.addEventListener("click", () => this.dismiss());
      }
    }

    // Auto-close timer
    if (this.options.autoClose) {
      this.autoCloseTimer = setTimeout(() => {
        this.dismiss();
      }, this.options.autoCloseDelay);
    }

    // Keyboard accessibility
    this.element.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.options.dismissible) {
        this.dismiss();
      }
    });
  }

  /**
   * Show the alert with animation (using CSS layers classes)
   */
  show() {
    if (this.isVisible) return;

    this.isVisible = true;

    // Add show animation class (@layer components)
    requestAnimationFrame(() => {
      this.element.classList.add(COMPONENT_CLASSES.ALERT.dismissible);
    });

    return this;
  }

  /**
   * Dismiss the alert with animation
   */
  dismiss() {
    if (!this.isVisible) return;

    this.isVisible = false;

    // Clear auto-close timer
    if (this.autoCloseTimer) {
      clearTimeout(this.autoCloseTimer);
      this.autoCloseTimer = null;
    }

    // Add dismissing animation class (@layer components)
    this.element.classList.add(COMPONENT_CLASSES.ALERT.dismissing);

    // Remove from DOM after animation
    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
    }, 200); // Match CSS animation duration

    return this;
  }

  /**
   * Update alert content dynamically
   */
  updateContent(title, message) {
    const titleEl = this.element.querySelector(
      `.${COMPONENT_CLASSES.ALERT.title}`,
    );
    const messageEl = this.element.querySelector(
      `.${COMPONENT_CLASSES.ALERT.message}`,
    );

    if (titleEl) titleEl.textContent = title;
    if (messageEl) messageEl.textContent = message;

    return this;
  }

  /**
   * Change alert type (updates CSS classes from components layer)
   */
  setType(type) {
    // Remove old type class
    Object.values(COMPONENT_CLASSES.ALERT).forEach((className) => {
      if (className.includes("alert--")) {
        this.element.classList.remove(className);
      }
    });

    // Add new type class
    if (COMPONENT_CLASSES.ALERT[type]) {
      this.element.classList.add(COMPONENT_CLASSES.ALERT[type]);
    }

    // Update icon
    const iconEl = this.element.querySelector(
      `.${COMPONENT_CLASSES.ALERT.icon}`,
    );
    if (iconEl) {
      iconEl.innerHTML = this.getIconSVG();
    }

    this.options.type = type;
    return this;
  }

  /**
   * Add utility classes from utilities layer
   */
  addUtilityClass(category, className) {
    if (UTILITY_CLASSES[category] && UTILITY_CLASSES[category][className]) {
      this.element.classList.add(UTILITY_CLASSES[category][className]);
    }
    return this;
  }

  /**
   * Remove utility classes from utilities layer
   */
  removeUtilityClass(category, className) {
    if (UTILITY_CLASSES[category] && UTILITY_CLASSES[category][className]) {
      this.element.classList.remove(UTILITY_CLASSES[category][className]);
    }
    return this;
  }
}

/**
 * Alert Manager - Global alert system
 * Manages multiple alerts and provides utility methods
 */
class AlertManager {
  constructor() {
    this.alerts = new Map();
    this.defaultOptions = {
      dismissible: true,
      autoClose: true,
      autoCloseDelay: 5000,
    };
  }

  /**
   * Create and show an alert
   */
  show(type, message, title = "", options = {}) {
    const alertOptions = {
      ...this.defaultOptions,
      ...options,
      type,
      message,
      title,
    };

    const alert = new Alert(alertOptions);
    const alertId = Date.now() + Math.random();

    this.alerts.set(alertId, alert);
    alert.show();

    // Auto-remove from manager when dismissed
    setTimeout(() => {
      this.alerts.delete(alertId);
    }, alertOptions.autoCloseDelay + 500);

    return alert;
  }

  /**
   * Convenience methods for different alert types
   */
  success(message, title = "", options = {}) {
    return this.show("success", message, title, options);
  }

  warning(message, title = "", options = {}) {
    return this.show("warning", message, title, options);
  }

  error(message, title = "", options = {}) {
    return this.show("error", message, title, { ...options, autoClose: false });
  }

  info(message, title = "", options = {}) {
    return this.show("info", message, title, options);
  }

  /**
   * Dismiss all alerts
   */
  dismissAll() {
    this.alerts.forEach((alert) => alert.dismiss());
    this.alerts.clear();
  }

  /**
   * Get count of active alerts
   */
  getActiveCount() {
    return this.alerts.size;
  }
}

// Create global alert manager instance
const alertManager = new AlertManager();

// Usage examples:
/*

// Basic usage
alertManager.success('Operation completed successfully!');
alertManager.error('Something went wrong', 'Error');
alertManager.warning('This action cannot be undone', 'Warning');
alertManager.info('New features are available', 'Info');

// Advanced usage with options
alertManager.show('success', 'Custom alert', 'Success', {
  dismissible: false,
  autoClose: false,
  size: 'large'
});

// Manual alert creation
const customAlert = new Alert({
  type: 'warning',
  title: 'Custom Alert',
  message: 'This is a custom alert with manual control',
  dismissible: true,
  autoClose: false
});

customAlert.show();

// Later update the alert
customAlert.updateContent('Updated Title', 'Updated message');
customAlert.setType('success');

*/

// Export for module usage
export {
  Alert,
  AlertManager,
  alertManager,
  CSS_LAYERS,
  COMPONENT_CLASSES,
  UTILITY_CLASSES,
};
