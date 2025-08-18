/**
 * DOM Class Management Utility
 * Prevents redundant DOM manipulation and provides centralized class management
 * Addresses the issue with redundant "loaded" and "font-size-medium" class operations
 */

import baseLogger from "./logger.js";

// Gate logs: enabled if any of these flags are set
const __shouldLog = () =>
  localStorage.getItem("debug") === "true" ||
  localStorage.getItem("verbose-css-logs") === "true" ||
  localStorage.getItem("verbose-logs") === "true";

// Soft logger that respects the debug flags; errors always pass
const logger = new Proxy(baseLogger, {
  get(target, prop) {
    if (prop === "error") return target.error.bind(target);
    if (
      prop === "info" ||
      prop === "warn" ||
      prop === "debug" ||
      prop === "log"
    ) {
      return (...args) => {
        if (__shouldLog()) return target[prop](...args);
      };
    }
    return target[prop];
  },
});

class DOMClassManager {
  constructor() {
    this.classStates = new Map();
    this.pendingOperations = new Set();
    this.batchTimeout = null;
    this.initialized = false;
  }

  /**
   * Initialize the DOM class manager
   */
  init() {
    if (this.initialized) return;

    this.initialized = true;

    // Track current class states to prevent redundant operations
    this.syncCurrentClasses();

    // Set up mutation observer to track external changes
    this.setupMutationObserver();

    logger.info("[DOMClassManager] Initialized with redundancy prevention");
  }

  /**
   * Sync current classes to prevent conflicts
   */
  syncCurrentClasses() {
    const html = document.documentElement;
    const body = document.body;

    // Track HTML classes
    if (html.classList.length > 0) {
      html.classList.forEach((className) => {
        this.classStates.set(`html:${className}`, true);
      });
    }

    // Track body classes
    if (body && body.classList.length > 0) {
      body.classList.forEach((className) => {
        this.classStates.set(`body:${className}`, true);
      });
    }
  }

  /**
   * Set up mutation observer to track external DOM changes
   */
  setupMutationObserver() {
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (
          mutation.type === "attributes" &&
          mutation.attributeName === "class"
        ) {
          const target = mutation.target;
          const targetType =
            target === document.documentElement
              ? "html"
              : target === document.body
                ? "body"
                : "other";

          if (targetType !== "other") {
            // Sync external changes
            target.classList.forEach((className) => {
              this.classStates.set(`${targetType}:${className}`, true);
            });
          }
        }
      });
    });

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    if (document.body) {
      observer.observe(document.body, {
        attributes: true,
        attributeFilter: ["class"],
      });
    }
  }

  /**
   * Safely add a class, preventing redundant operations
   */
  addClass(target, className) {
    const targetType = this.getTargetType(target);
    const key = `${targetType}:${className}`;

    // Check if class is already applied
    if (this.classStates.get(key)) {
      logger.debug(
        `[DOMClassManager] Skipping redundant addClass: ${className} on ${targetType}`,
      );
      return false; // No operation needed
    }

    // Apply the class
    target.classList.add(className);
    this.classStates.set(key, true);

    logger.debug(
      `[DOMClassManager] Added class: ${className} on ${targetType}`,
    );
    return true; // Operation performed
  }

  /**
   * Safely remove a class, preventing redundant operations
   */
  removeClass(target, className) {
    const targetType = this.getTargetType(target);
    const key = `${targetType}:${className}`;

    // Check if class is already removed
    if (!this.classStates.get(key)) {
      logger.debug(
        `[DOMClassManager] Skipping redundant removeClass: ${className} on ${targetType}`,
      );
      return false; // No operation needed
    }

    // Remove the class
    target.classList.remove(className);
    this.classStates.set(key, false);

    logger.debug(
      `[DOMClassManager] Removed class: ${className} on ${targetType}`,
    );
    return true; // Operation performed
  }

  /**
   * Safely toggle a class
   */
  toggleClass(target, className, force = null) {
    const targetType = this.getTargetType(target);
    const key = `${targetType}:${className}`;
    const hasClass = this.classStates.get(key) || false;

    if (force === null) {
      // Normal toggle
      if (hasClass) {
        return this.removeClass(target, className);
      } else {
        return this.addClass(target, className);
      }
    } else {
      // Forced toggle
      if (force && !hasClass) {
        return this.addClass(target, className);
      } else if (!force && hasClass) {
        return this.removeClass(target, className);
      }
      return false; // No operation needed
    }
  }

  /**
   * Batch class operations to prevent layout thrashing
   */
  batchOperation(operations) {
    const results = [];

    // Clear any pending batch
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }

    // Execute operations immediately but track them
    operations.forEach((op) => {
      const { action, target, className, force } = op;
      let result = false;

      switch (action) {
        case "add":
          result = this.addClass(target, className);
          break;
        case "remove":
          result = this.removeClass(target, className);
          break;
        case "toggle":
          result = this.toggleClass(target, className, force);
          break;
      }

      results.push(result);
    });

    return results;
  }

  /**
   * Handle font size class changes specifically
   */
  setFontSize(fontSize = "medium") {
    const html = document.documentElement;
    const fontSizeClasses = [
      "font-size-small",
      "font-size-medium",
      "font-size-large",
      "font-size-extra-large",
    ];

    const targetClass = `font-size-${fontSize}`;

    // Check if target class is already applied
    if (this.classStates.get(`html:${targetClass}`)) {
      logger.debug(
        `[DOMClassManager] Font size ${fontSize} already applied, skipping redundant operation`,
      );
      return false;
    }

    // Batch operation to remove all font-size classes and add the new one
    const operations = [
      ...fontSizeClasses.map((cls) => ({
        action: "remove",
        target: html,
        className: cls,
      })),
      { action: "add", target: html, className: targetClass },
    ];

    logger.debug(`[DOMClassManager] Changing font size to: ${fontSize}`);
    return this.batchOperation(operations);
  }

  /**
   * Handle loaded class specifically (prevent multiple additions)
   */
  setLoadedState(loaded = true) {
    const html = document.documentElement;

    if (loaded) {
      const success = this.addClass(html, "loaded");
      if (!success) {
        logger.debug(
          "[DOMClassManager] Page already marked as loaded, preventing redundant operation",
        );
      }
      return success;
    } else {
      return this.removeClass(html, "loaded");
    }
  }

  /**
   * Get target type for tracking
   */
  getTargetType(target) {
    if (target === document.documentElement) return "html";
    if (target === document.body) return "body";
    return "element";
  }

  /**
   * Get current state of a class
   */
  hasClass(target, className) {
    const targetType = this.getTargetType(target);
    const key = `${targetType}:${className}`;
    return this.classStates.get(key) || false;
  }

  /**
   * Reset all tracked states (for testing/debugging)
   */
  reset() {
    this.classStates.clear();
    this.pendingOperations.clear();
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    this.syncCurrentClasses();
  }

  /**
   * Get statistics about prevented redundant operations
   */
  getStats() {
    return {
      trackedClasses: this.classStates.size,
      classStates: Object.fromEntries(this.classStates),
    };
  }
}

// Create global instance
window.DOMClassManager = window.DOMClassManager || new DOMClassManager();

// Auto-initialize when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    window.DOMClassManager.init();
  });
} else {
  window.DOMClassManager.init();
}

export default window.DOMClassManager;
