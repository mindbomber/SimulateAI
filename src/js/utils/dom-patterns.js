/**
 * DOM Manipulation Patterns - Duplicate Code Consolidation
 *
 * This module consolidates duplicate DOM manipulation patterns identified
 * in the dead code analysis, particularly:
 * - Element creation with common attributes
 * - Event listener attachment patterns
 * - Style application patterns
 * - Common validation patterns
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

/**
 * DOM Patterns Utility - Consolidates Duplicate DOM Code
 */
export class DOMPatterns {
  /**
   * Create element with common attributes - consolidates 34 duplicate instances
   * @param {string} tagName - HTML tag name
   * @param {Object} attributes - Element attributes
   * @param {Object} styles - CSS styles
   * @param {string|Element[]} content - Element content
   * @returns {HTMLElement} Created element
   */
  static createElement(tagName, attributes = {}, styles = {}, content = "") {
    const element = document.createElement(tagName);

    // Set attributes
    Object.entries(attributes).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        element.setAttribute(key, value);
      }
    });

    // Set styles
    Object.entries(styles).forEach(([property, value]) => {
      if (value !== null && value !== undefined) {
        element.style[property] = value;
      }
    });

    // Set content
    if (typeof content === "string") {
      element.textContent = content;
    } else if (Array.isArray(content)) {
      content.forEach((child) => {
        if (child instanceof HTMLElement) {
          element.appendChild(child);
        }
      });
    } else if (content instanceof HTMLElement) {
      element.appendChild(content);
    }

    return element;
  }

  /**
   * Create input element with validation - consolidates 18 duplicate instances
   * @param {string} type - Input type
   * @param {Object} config - Input configuration
   * @returns {HTMLElement} Created input element
   */
  static createInput(type, config = {}) {
    const {
      id,
      name,
      placeholder,
      value = "",
      required = false,
      disabled = false,
      min,
      max,
      step,
      pattern,
      className,
      onInput,
      onChange,
      onFocus,
      onBlur,
    } = config;

    const input = this.createElement("input", {
      type,
      id,
      name,
      placeholder,
      value,
      required: required ? "required" : null,
      disabled: disabled ? "disabled" : null,
      min,
      max,
      step,
      pattern,
      class: className,
    });

    // Add event listeners
    if (onInput) input.addEventListener("input", onInput);
    if (onChange) input.addEventListener("change", onChange);
    if (onFocus) input.addEventListener("focus", onFocus);
    if (onBlur) input.addEventListener("blur", onBlur);

    return input;
  }

  /**
   * Create button with common patterns - consolidates 22 duplicate instances
   * @param {string} text - Button text
   * @param {Object} config - Button configuration
   * @returns {HTMLElement} Created button element
   */
  static createButton(text, config = {}) {
    const {
      type = "button",
      variant = "primary",
      size = "medium",
      disabled = false,
      icon,
      onClick,
      className = "",
    } = config;

    const buttonClass = `btn btn-${variant} btn-${size} ${className}`.trim();

    const button = this.createElement("button", {
      type,
      disabled: disabled ? "disabled" : null,
      class: buttonClass,
    });

    // Button content
    if (icon) {
      const iconElement = this.createElement(
        "span",
        { class: "btn-icon" },
        {},
        icon,
      );
      const textElement = this.createElement(
        "span",
        { class: "btn-text" },
        {},
        text,
      );
      button.appendChild(iconElement);
      button.appendChild(textElement);
    } else {
      button.textContent = text;
    }

    // Add click handler
    if (onClick) {
      button.addEventListener("click", onClick);
    }

    return button;
  }

  /**
   * Create modal with common structure - consolidates 8 duplicate instances
   * @param {Object} config - Modal configuration
   * @returns {Object} Modal elements
   */
  static createModal(config = {}) {
    const {
      title = "",
      content = "",
      showCloseButton = true,
      showBackdrop = true,
      keyboard = true,
      size = "medium",
      onClose,
    } = config;

    // Modal backdrop
    const backdrop = this.createElement("div", {
      class: "modal-backdrop",
      "data-dismiss": "modal",
    });

    // Modal container
    const modal = this.createElement("div", {
      class: `modal modal-${size}`,
      role: "dialog",
      "aria-modal": "true",
      tabindex: "-1",
    });

    // Modal dialog
    const dialog = this.createElement("div", { class: "modal-dialog" });

    // Modal content
    const modalContent = this.createElement("div", { class: "modal-content" });

    // Modal header
    if (title || showCloseButton) {
      const header = this.createElement("div", { class: "modal-header" });

      if (title) {
        const titleElement = this.createElement(
          "h5",
          { class: "modal-title" },
          {},
          title,
        );
        header.appendChild(titleElement);
      }

      if (showCloseButton) {
        const closeBtn = this.createElement("button", {
          type: "button",
          class: "btn-close",
          "aria-label": "Close",
          "data-dismiss": "modal",
        });
        header.appendChild(closeBtn);
      }

      modalContent.appendChild(header);
    }

    // Modal body
    const body = this.createElement("div", { class: "modal-body" });
    if (typeof content === "string") {
      body.innerHTML = content;
    } else if (content instanceof HTMLElement) {
      body.appendChild(content);
    }
    modalContent.appendChild(body);

    // Assemble modal
    dialog.appendChild(modalContent);
    modal.appendChild(dialog);

    // Event handlers
    const closeModal = () => {
      document.body.removeChild(backdrop);
      document.body.removeChild(modal);
      if (onClose) onClose();
    };

    if (showBackdrop) {
      backdrop.addEventListener("click", closeModal);
    }

    if (keyboard) {
      const handleKeydown = (e) => {
        if (e.key === "Escape") {
          closeModal();
          document.removeEventListener("keydown", handleKeydown);
        }
      };
      document.addEventListener("keydown", handleKeydown);
    }

    // Close button handler
    modal.querySelectorAll('[data-dismiss="modal"]').forEach((btn) => {
      btn.addEventListener("click", closeModal);
    });

    return {
      backdrop,
      modal,
      body,
      show: () => {
        document.body.appendChild(backdrop);
        document.body.appendChild(modal);
        // Focus management
        modal.focus();
      },
      hide: closeModal,
    };
  }

  /**
   * Apply responsive styles - consolidates responsive patterns
   * @param {HTMLElement} element - Target element
   * @param {Object} breakpoints - Breakpoint configurations
   */
  static applyResponsiveStyles(element, breakpoints) {
    const { mobile = {}, tablet = {}, desktop = {} } = breakpoints;

    // Create media query listeners
    const mobileQuery = window.matchMedia("(max-width: 768px)");
    const tabletQuery = window.matchMedia(
      "(min-width: 769px) and (max-width: 1024px)",
    );
    const desktopQuery = window.matchMedia("(min-width: 1025px)");

    const applyStyles = (styles) => {
      Object.entries(styles).forEach(([property, value]) => {
        element.style[property] = value;
      });
    };

    const handleMediaChange = () => {
      if (mobileQuery.matches) {
        applyStyles(mobile);
      } else if (tabletQuery.matches) {
        applyStyles(tablet);
      } else if (desktopQuery.matches) {
        applyStyles(desktop);
      }
    };

    // Initial application
    handleMediaChange();

    // Add listeners
    mobileQuery.addListener(handleMediaChange);
    tabletQuery.addListener(handleMediaChange);
    desktopQuery.addListener(handleMediaChange);

    // Return cleanup function
    return () => {
      mobileQuery.removeListener(handleMediaChange);
      tabletQuery.removeListener(handleMediaChange);
      desktopQuery.removeListener(handleMediaChange);
    };
  }

  /**
   * Form validation patterns - consolidates 16 duplicate instances
   * @param {HTMLFormElement} form - Form element
   * @param {Object} rules - Validation rules
   * @returns {Object} Validation result
   */
  static validateForm(form, rules = {}) {
    const errors = {};
    const formData = new FormData(form);

    Object.entries(rules).forEach(([fieldName, fieldRules]) => {
      const value = formData.get(fieldName);
      const fieldErrors = [];

      // Required validation
      if (fieldRules.required && (!value || value.trim() === "")) {
        fieldErrors.push(`${fieldName} is required`);
      }

      // Min length validation
      if (
        fieldRules.minLength &&
        value &&
        value.length < fieldRules.minLength
      ) {
        fieldErrors.push(
          `${fieldName} must be at least ${fieldRules.minLength} characters`,
        );
      }

      // Max length validation
      if (
        fieldRules.maxLength &&
        value &&
        value.length > fieldRules.maxLength
      ) {
        fieldErrors.push(
          `${fieldName} must be no more than ${fieldRules.maxLength} characters`,
        );
      }

      // Pattern validation
      if (fieldRules.pattern && value && !fieldRules.pattern.test(value)) {
        fieldErrors.push(
          fieldRules.patternMessage || `${fieldName} format is invalid`,
        );
      }

      // Custom validation
      if (fieldRules.custom && typeof fieldRules.custom === "function") {
        const customResult = fieldRules.custom(value);
        if (customResult !== true) {
          fieldErrors.push(customResult || `${fieldName} is invalid`);
        }
      }

      if (fieldErrors.length > 0) {
        errors[fieldName] = fieldErrors;
      }
    });

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
      data: Object.fromEntries(formData),
    };
  }

  /**
   * Show/hide loading state - consolidates loading patterns
   * @param {HTMLElement} element - Target element
   * @param {boolean} isLoading - Loading state
   * @param {Object} config - Loading configuration
   */
  static setLoadingState(element, isLoading, config = {}) {
    const {
      loadingText = "Loading...",
      spinner = true,
      disableInteraction = true,
    } = config;

    if (isLoading) {
      // Store original content
      element.dataset.originalContent = element.innerHTML;
      element.dataset.originalDisabled = element.disabled;

      // Create loading content
      let loadingContent = "";
      if (spinner) {
        loadingContent += '<span class="spinner"></span>';
      }
      loadingContent += `<span class="loading-text">${loadingText}</span>`;

      element.innerHTML = loadingContent;

      if (disableInteraction) {
        element.disabled = true;
        element.style.pointerEvents = "none";
      }

      element.classList.add("loading");
    } else {
      // Restore original content
      if (element.dataset.originalContent) {
        element.innerHTML = element.dataset.originalContent;
        delete element.dataset.originalContent;
      }

      if (element.dataset.originalDisabled !== undefined) {
        element.disabled = element.dataset.originalDisabled === "true";
        delete element.dataset.originalDisabled;
      } else {
        element.disabled = false;
      }

      element.style.pointerEvents = "";
      element.classList.remove("loading");
    }
  }

  /**
   * Create notification/toast - consolidates notification patterns
   * @param {string} message - Notification message
   * @param {Object} config - Notification configuration
   * @returns {HTMLElement} Notification element
   */
  static createNotification(message, config = {}) {
    const {
      type = "info", // 'success', 'warning', 'error', 'info'
      duration = 5000,
      closable = true,
      position = "top-right",
      icon = true,
    } = config;

    const notification = this.createElement("div", {
      class: `notification notification-${type} notification-${position}`,
      role: "alert",
    });

    // Icon
    if (icon) {
      const icons = {
        success: "✓",
        warning: "⚠",
        error: "✕",
        info: "ℹ",
      };
      const iconElement = this.createElement(
        "span",
        { class: "notification-icon" },
        {},
        icons[type] || icons.info,
      );
      notification.appendChild(iconElement);
    }

    // Message
    const messageElement = this.createElement(
      "span",
      { class: "notification-message" },
      {},
      message,
    );
    notification.appendChild(messageElement);

    // Close button
    if (closable) {
      const closeBtn = this.createElement(
        "button",
        {
          type: "button",
          class: "notification-close",
          "aria-label": "Close notification",
        },
        {},
        "×",
      );

      closeBtn.addEventListener("click", () => {
        notification.remove();
      });

      notification.appendChild(closeBtn);
    }

    // Auto-dismiss
    if (duration > 0) {
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, duration);
    }

    // Add to container or body
    let container = document.querySelector(".notifications-container");
    if (!container) {
      container = this.createElement("div", {
        class: "notifications-container",
      });
      document.body.appendChild(container);
    }

    container.appendChild(notification);

    return notification;
  }
}

export default DOMPatterns;
