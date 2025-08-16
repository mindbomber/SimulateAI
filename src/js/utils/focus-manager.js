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
 * Centralized Focus Management Utility
 *
 * Provides consistent focus management across all components including:
 * - Focus trapping for modals and dialogs
 * - Focus restoration after modal close
 * - Keyboard navigation helpers
 * - Auto-focus with timing management
 *
 * @version 1.0.0
 */

// Centralized constants for consistent timing
const FOCUS_CONSTANTS = {
  FOCUS_DELAY: 100, // Standard delay for focus operations
  KEYBOARD_REPEAT_DELAY: 200, // Delay for keyboard repeat prevention
  ANIMATION_DELAY: 16, // Frame-based delay for animation coordination
  AUTO_FOCUS_TIMEOUT: 150, // Timeout for auto-focus operations
};

// Standard selectors for focusable elements
const FOCUSABLE_SELECTORS = [
  "button:not([disabled])",
  "[href]:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  '[tabindex]:not([tabindex="-1"]):not([disabled])',
  '[contenteditable="true"]',
].join(", ");

/**
 * Focus Stack Manager - tracks focus history for restoration
 */
class FocusStack {
  constructor() {
    this.stack = [];
    this.maxSize = 10; // Prevent memory leaks
  }

  push(element) {
    if (element && typeof element.focus === "function") {
      this.stack.push(element);
      if (this.stack.length > this.maxSize) {
        this.stack.shift(); // Remove oldest entry
      }
    }
  }

  pop() {
    return this.stack.pop();
  }

  peek() {
    return this.stack[this.stack.length - 1];
  }

  clear() {
    this.stack = [];
  }

  isEmpty() {
    return this.stack.length === 0;
  }
}

/**
 * Main Focus Manager Class
 */
class FocusManager {
  constructor() {
    this.focusStack = new FocusStack();
    this.activeTrappers = new Set(); // Track active focus traps
    this.keyboardNavigationActive = false;
    this.lastFocusMethod = null; // 'mouse' | 'keyboard' | 'programmatic'

    this.init();
  }

  init() {
    // Track keyboard vs mouse navigation
    document.addEventListener("mousedown", () => {
      this.lastFocusMethod = "mouse";
      document.documentElement.classList.remove("keyboard-navigation");
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        this.lastFocusMethod = "keyboard";
        this.keyboardNavigationActive = true;
        document.documentElement.classList.add("keyboard-navigation");
      }
    });

    // Global escape key handler for trapped focus
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.activeTrappers.size > 0) {
        this.handleEscapeKey(e);
      }
    });
  }

  /**
   * Get all focusable elements within a container
   * @param {HTMLElement} container - Container to search within
   * @returns {NodeList} List of focusable elements
   */
  getFocusableElements(container = document) {
    return container.querySelectorAll(FOCUSABLE_SELECTORS);
  }

  /**
   * Get the first focusable element in a container
   * @param {HTMLElement} container - Container to search within
   * @returns {HTMLElement|null} First focusable element
   */
  getFirstFocusable(container) {
    const focusable = this.getFocusableElements(container);
    return focusable.length > 0 ? focusable[0] : null;
  }

  /**
   * Get the last focusable element in a container
   * @param {HTMLElement} container - Container to search within
   * @returns {HTMLElement|null} Last focusable element
   */
  getLastFocusable(container) {
    const focusable = this.getFocusableElements(container);
    return focusable.length > 0 ? focusable[focusable.length - 1] : null;
  }

  /**
   * Store current focus for later restoration
   * @param {HTMLElement} [element] - Element to store (defaults to activeElement)
   */
  storeFocus(element = document.activeElement) {
    this.focusStack.push(element);
  }

  /**
   * Restore focus to previously stored element
   * @param {boolean} [fallbackToBody=true] - Whether to focus body if no stored focus
   * @returns {boolean} Whether focus was restored
   */
  restoreFocus(fallbackToBody = true) {
    const element = this.focusStack.pop();

    if (
      element &&
      document.contains(element) &&
      typeof element.focus === "function"
    ) {
      try {
        element.focus({ preventScroll: true });
        return true;
      } catch (error) {
        // Silent fail for focus restoration - avoid console.warn for linting
        // Dev-only logging removed to avoid process reference in browser context
      }
    }

    if (fallbackToBody) {
      document.body.focus();
    }

    return false;
  }

  /**
   * Focus an element with optional delay and method tracking
   * @param {HTMLElement} element - Element to focus
   * @param {Object} options - Focus options
   * @param {number} options.delay - Delay before focusing (ms)
   * @param {boolean} options.preventScroll - Prevent scrolling on focus
   * @param {string} options.method - Method of focus ('auto', 'keyboard', 'programmatic')
   * @returns {Promise<boolean>} Whether focus was successful
   */
  async focusElement(element, options = {}) {
    const {
      delay = 0,
      preventScroll = false,
      method = "programmatic",
    } = options;

    if (!element || typeof element.focus !== "function") {
      return false;
    }

    this.lastFocusMethod = method;

    if (delay > 0) {
      await new Promise((resolve) => setTimeout(resolve, delay));
    }

    try {
      element.focus({ preventScroll });
      return true;
    } catch (error) {
      // Silent fail for focus operations
      return false;
    }
  }

  /**
   * Auto-focus first element in container (respects user preferences)
   * @param {HTMLElement} container - Container to search within
   * @param {Object} options - Auto-focus options
   * @param {boolean} options.keyboardOnly - Only auto-focus if keyboard navigation
   * @param {number} options.delay - Delay before auto-focusing
   * @returns {Promise<boolean>} Whether auto-focus was successful
   */
  async autoFocus(container, options = {}) {
    const { keyboardOnly = true, delay = FOCUS_CONSTANTS.AUTO_FOCUS_TIMEOUT } =
      options;

    // Respect user preference for keyboard-only auto-focus
    if (keyboardOnly && !this.keyboardNavigationActive) {
      return false;
    }

    const firstFocusable = this.getFirstFocusable(container);
    if (!firstFocusable) {
      return false;
    }

    return this.focusElement(firstFocusable, {
      delay,
      method: "auto",
    });
  }

  /**
   * Create a focus trap for a container
   * @param {HTMLElement} container - Container to trap focus within
   * @param {Object} options - Trap options
   * @param {boolean} options.autoFocus - Whether to auto-focus first element
   * @param {boolean} options.restoreFocus - Whether to restore focus on destroy
   * @returns {Object} Focus trap controller
   */
  createTrap(container, options = {}) {
    const { autoFocus = true, restoreFocus = true } = options;

    // Store current focus for restoration
    if (restoreFocus) {
      this.storeFocus();
    }

    const trapId = Symbol("focus-trap");

    const trapHandler = (event) => {
      if (event.key === "Tab") {
        this.handleTabInTrap(event, container);
      }
    };

    // Add trap to active set
    this.activeTrappers.add(trapId);

    // Set up event listener
    document.addEventListener("keydown", trapHandler);

    // Auto-focus if requested
    if (autoFocus) {
      this.autoFocus(container, { keyboardOnly: false });
    }

    // Return controller object
    return {
      id: trapId,
      container,
      destroy: () => {
        document.removeEventListener("keydown", trapHandler);
        this.activeTrappers.delete(trapId);

        if (restoreFocus) {
          // Small delay to ensure any animations complete
          setTimeout(() => {
            this.restoreFocus();
          }, FOCUS_CONSTANTS.FOCUS_DELAY);
        }
      },
      focusFirst: () => this.focusElement(this.getFirstFocusable(container)),
      focusLast: () => this.focusElement(this.getLastFocusable(container)),
    };
  }

  /**
   * Handle Tab navigation within a focus trap
   * @param {KeyboardEvent} event - Tab keyboard event
   * @param {HTMLElement} container - Container with trapped focus
   */
  handleTabInTrap(event, container) {
    const focusable = this.getFocusableElements(container);
    if (focusable.length === 0) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];
    const currentElement = document.activeElement;

    // Check if focus is outside the container - bring it back
    if (!container.contains(currentElement)) {
      event.preventDefault();
      firstElement.focus({ preventScroll: true });
      return;
    }

    if (event.shiftKey) {
      // Shift + Tab (backward)
      if (currentElement === firstElement) {
        event.preventDefault();
        lastElement.focus({ preventScroll: true });
      }
    } else {
      // Tab (forward)
      if (currentElement === lastElement) {
        event.preventDefault();
        firstElement.focus({ preventScroll: true });
      }
    }
  }

  /**
   * Handle Escape key for focus traps
   * @param {KeyboardEvent} _event - Escape keyboard event (unused in base implementation)
   */
  handleEscapeKey() {
    // Override this in specific implementations
    // Base implementation does nothing to avoid conflicts
  }

  /**
   * Keyboard navigation helper for grids/lists
   * @param {HTMLElement} container - Container with navigable elements
   * @param {Object} options - Navigation options
   * @returns {Function} Event handler for keyboard navigation
   */
  createKeyboardNavigator(container, options = {}) {
    const {
      selector = container.children,
      wrap = true,
      orientation = "both", // 'horizontal', 'vertical', 'both'
    } = options;

    return (event) => {
      const items = Array.from(
        typeof selector === "string"
          ? container.querySelectorAll(selector)
          : selector,
      );

      const currentIndex = items.indexOf(document.activeElement);
      if (currentIndex === -1) return;

      let newIndex = currentIndex;

      switch (event.key) {
        case "ArrowLeft":
          if (orientation === "horizontal" || orientation === "both") {
            event.preventDefault();
            newIndex =
              wrap && currentIndex === 0
                ? items.length - 1
                : Math.max(0, currentIndex - 1);
          }
          break;

        case "ArrowRight":
          if (orientation === "horizontal" || orientation === "both") {
            event.preventDefault();
            newIndex =
              wrap && currentIndex === items.length - 1
                ? 0
                : Math.min(items.length - 1, currentIndex + 1);
          }
          break;

        case "ArrowUp":
          if (orientation === "vertical" || orientation === "both") {
            event.preventDefault();
            newIndex =
              wrap && currentIndex === 0
                ? items.length - 1
                : Math.max(0, currentIndex - 1);
          }
          break;

        case "ArrowDown":
          if (orientation === "vertical" || orientation === "both") {
            event.preventDefault();
            newIndex =
              wrap && currentIndex === items.length - 1
                ? 0
                : Math.min(items.length - 1, currentIndex + 1);
          }
          break;

        case "Home":
          event.preventDefault();
          newIndex = 0;
          break;

        case "End":
          event.preventDefault();
          newIndex = items.length - 1;
          break;

        default:
          return; // Don't handle other keys
      }

      if (newIndex !== currentIndex && items[newIndex]) {
        this.focusElement(items[newIndex]);

        // Scroll into view if needed
        items[newIndex].scrollIntoView({
          behavior: "smooth",
          block: "nearest",
          inline: "nearest",
        });
      }
    };
  }

  /**
   * Clean up all focus management
   */
  destroy() {
    this.focusStack.clear();
    this.activeTrappers.clear();
    this.keyboardNavigationActive = false;
  }
}

// Create and export singleton instance
const focusManager = new FocusManager();

export default focusManager;
export { FocusManager, FOCUS_CONSTANTS, FOCUSABLE_SELECTORS };
