/**
 * Event Manager - Prevents race conditions and duplicate event listeners
 * Copyright 2025 Armando Sori
 */

class EventManager {
  constructor() {
    this.listeners = new Map();
    this.delegatedEvents = new Set();
    this.initialized = false;
  }

  /**
   * Safely add event listener with automatic deduplication
   */
  addListener(element, event, handler, options = {}) {
    const key = this.getListenerKey(element, event, handler);

    // Check if already registered
    if (this.listeners.has(key)) {
      console.warn(`Event listener already registered: ${event} on`, element);
      return false;
    }

    // Add listener
    element.addEventListener(event, handler, options);
    this.listeners.set(key, { element, event, handler, options });
    return true;
  }

  /**
   * Safely remove event listener
   */
  removeListener(element, event, handler) {
    const key = this.getListenerKey(element, event, handler);
    const listener = this.listeners.get(key);

    if (listener) {
      element.removeEventListener(event, handler);
      this.listeners.delete(key);
      return true;
    }
    return false;
  }

  /**
   * Use event delegation to prevent duplicate listeners
   */
  delegate(parentElement, event, selector, handler) {
    const delegationKey = `${event}-${selector}`;

    if (this.delegatedEvents.has(delegationKey)) {
      console.warn(`Delegated event already registered: ${delegationKey}`);
      return false;
    }

    const delegatedHandler = (e) => {
      const target = e.target.closest(selector);
      if (target && parentElement.contains(target)) {
        handler.call(target, e);
      }
    };

    this.addListener(parentElement, event, delegatedHandler);
    this.delegatedEvents.add(delegationKey);
    return true;
  }

  /**
   * Clean up all listeners
   */
  cleanup() {
    for (const [key, { element, event, handler }] of this.listeners) {
      try {
        element.removeEventListener(event, handler);
      } catch (error) {
        console.warn(`Failed to remove listener: ${key}`, error);
      }
    }
    this.listeners.clear();
    this.delegatedEvents.clear();
  }

  /**
   * Generate unique key for listener tracking
   */
  getListenerKey(element, event, handler) {
    const elementId = element.id || element.className || element.tagName;
    const handlerString = handler.toString().substring(0, 50);
    return `${elementId}-${event}-${handlerString}`;
  }

  /**
   * Prevent button race conditions by ensuring type="button"
   */
  secureButtons(container = document) {
    const buttons = container.querySelectorAll("button:not([type])");
    buttons.forEach((button) => {
      button.setAttribute("type", "button");
    });
    return buttons.length;
  }
}

// Export singleton instance
export const eventManager = new EventManager();

// Auto-secure buttons on load
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    eventManager.secureButtons();
  });
} else {
  eventManager.secureButtons();
}
