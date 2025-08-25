/**
 * Unified Scroll Management System
 * Consolidates all scroll-related functionality into a single, efficient manager
 * Updated to work with ScrollLockManager to prevent conflicts
 */

import { logger } from "./logger.js";
import scrollLockManager from "./scroll-lock-manager.js";

class ScrollManager {
  constructor() {
    this.isAutoScrolling = false;
    this.scrollTimeout = null;
    this.observers = new Map();
    this.SCROLL_DURATION = 800;
    this.SCROLL_OFFSET = 80;
    this.MIN_SCROLL_DISTANCE = 5;
    this.EASE_MIDPOINT = 0.5;
    this.EASE_MULTIPLIER = 4;

    // Debounced scroll handlers
    this.debouncedHandlers = new Map();
    this.DEBOUNCE_DELAY = 16; // ~60fps
  }

  /**
   * Initialize scroll manager - call once on app startup
   */
  init() {
    this.setupScrollRestoration();
    this.setupGlobalScrollBehavior();
    this.initializeHorizontalScrolling();
    logger.info("ScrollManager initialized");
  }

  /**
   * Setup scroll restoration behavior - use browser defaults
   */
  setupScrollRestoration() {
    // Let browser handle scroll restoration naturally - don't override
    if ("scrollRestoration" in history) {
      // Keep browser default behavior for better UX
      history.scrollRestoration = "auto";
    }
  }

  /**
   * Setup global scroll behavior - minimal intervention
   */
  setupGlobalScrollBehavior() {
    // Do NOT force any scroll position on load.
    // Allow native browser scroll restoration to run without interference.

    // Delay enabling smooth scrolling until after restoration completes
    const applyLoadedClass = () => {
      try {
        if (window.DOMClassManager) {
          window.DOMClassManager.setLoadedState(true);
        } else {
          document.documentElement.classList.add("loaded");
        }
      } catch (e) {
        // Non-fatal: if DOMClassManager is unavailable, just proceed
        if (typeof logger?.debug === "function") {
          logger.debug("ScrollManager", "applyLoadedClass noop or failed", e);
        }
      }
    };

    // Use pageshow which fires after restoration; rAF to ensure layout is settled
    window.addEventListener("pageshow", () => {
      requestAnimationFrame(() => requestAnimationFrame(applyLoadedClass));
    });

    // As a fallback (in case pageshow doesn't fire in some browsers),
    // apply after DOMContentLoaded without changing scroll position
    if (document.readyState === "loading") {
      document.addEventListener(
        "DOMContentLoaded",
        () => {
          requestAnimationFrame(() => applyLoadedClass());
        },
        { once: true },
      );
    } else {
      // Document already loaded
      requestAnimationFrame(() => applyLoadedClass());
    }
  }

  /**
   * Unified scroll position reset - minimal intervention
   * Updated to use centralized scroll lock management
   */
  resetScrollPosition() {
    // Use the most reliable method for all browsers
    window.scrollTo(0, 0);

    // Force unlock any scroll locks to ensure scrolling works
    scrollLockManager.forceUnlock();

    // Set loaded state immediately - no delay needed
    if (window.DOMClassManager) {
      window.DOMClassManager.setLoadedState(true);
    } else {
      document.documentElement.classList.add("loaded");
    }
  }

  /**
   * Scroll to element with unified behavior
   * @param {HTMLElement|string} target - Element or selector to scroll to
   * @param {Object} options - Scroll options
   * @returns {Promise<void>} Promise that resolves when scrolling is complete
   */
  async scrollToElement(target, options = {}) {
    const element =
      typeof target === "string" ? document.querySelector(target) : target;
    if (!element) {
      logger.warn("ScrollManager: Element not found for scrolling", target);
      return;
    }

    const {
      behavior = "smooth",
      offset = this.SCROLL_OFFSET,
      respectReducedMotion = true,
    } = options;

    // Check if element is inside a modal
    const modalContainer = element.closest(
      '.scenario-modal, .pre-launch-modal, .modal, [role="dialog"]',
    );

    if (modalContainer) {
      await this.scrollWithinModal(element, modalContainer, offset, behavior);
    } else {
      await this.scrollMainWindow(
        element,
        offset,
        behavior,
        respectReducedMotion,
      );
    }
  }

  /**
   * Scroll within modal container
   * @param {HTMLElement} element - Element to scroll to
   * @param {HTMLElement} modalContainer - Modal container
   * @param {number} offset - Scroll offset
   * @param {string} behavior - Scroll behavior
   * @returns {Promise<void>} Promise that resolves when scrolling is complete
   */
  async scrollWithinModal(element, modalContainer, offset, behavior) {
    const modalScrollContainer =
      modalContainer.querySelector(
        ".modal-content, .scenario-content, .modal-body",
      ) || modalContainer;

    if (behavior === "auto" || this.shouldUseInstantScroll()) {
      // Use native scrollIntoView for instant scrolling
      element.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
      return;
    }

    // Custom smooth scrolling for modal
    const elementRect = element.getBoundingClientRect();
    const containerRect = modalScrollContainer.getBoundingClientRect();
    const currentScrollTop = modalScrollContainer.scrollTop;

    const elementTopInModal =
      elementRect.top - containerRect.top + currentScrollTop;
    const targetScrollTop = Math.max(0, elementTopInModal - offset);

    await this.animateScroll(
      modalScrollContainer,
      targetScrollTop,
      "scrollTop",
    );
  }

  /**
   * Scroll main window
   * @param {HTMLElement} element - Element to scroll to
   * @param {number} offset - Scroll offset
   * @param {string} behavior - Scroll behavior
   * @param {boolean} respectReducedMotion - Whether to respect reduced motion
   * @returns {Promise<void>} Promise that resolves when scrolling is complete
   */
  async scrollMainWindow(element, offset, behavior, respectReducedMotion) {
    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const actualBehavior =
      respectReducedMotion && prefersReducedMotion ? "auto" : behavior;

    if (actualBehavior === "auto" || this.shouldUseInstantScroll()) {
      // Use native scrollIntoView for instant scrolling
      element.scrollIntoView({
        behavior: "auto",
        block: "center",
        inline: "nearest",
      });
      return;
    }

    // Custom smooth scrolling for main window
    const elementRect = element.getBoundingClientRect();
    const targetScrollTop = Math.max(
      0,
      elementRect.top + window.pageYOffset - offset,
    );

    await this.animateScroll(window, targetScrollTop, "pageYOffset");
  }

  /**
   * Animate scroll with easing
   */
  async animateScroll(scrollContainer, targetPosition, propertyName) {
    return new Promise((resolve) => {
      const startPosition =
        propertyName === "scrollTop"
          ? scrollContainer.scrollTop
          : window.pageYOffset;

      const distance = targetPosition - startPosition;

      if (Math.abs(distance) < this.MIN_SCROLL_DISTANCE) {
        resolve();
        return;
      }

      this.isAutoScrolling = true;
      let startTime = null;

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / this.SCROLL_DURATION, 1);

        // Ease-in-out function
        const ease =
          progress < this.EASE_MIDPOINT
            ? 2 * progress * progress
            : -1 + (this.EASE_MULTIPLIER - 2 * progress) * progress;

        const currentPosition = startPosition + distance * ease;

        if (propertyName === "scrollTop") {
          scrollContainer.scrollTop = currentPosition;
        } else {
          window.scrollTo(0, currentPosition);
        }

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          this.isAutoScrolling = false;
          resolve();
        }
      };

      requestAnimationFrame(animation);
    });
  }

  /**
   * Initialize horizontal scrolling for category grids
   * NOTE: Horizontal scroll enhancement has been completely removed
   */
  initializeHorizontalScrolling() {
    // Horizontal scroll enhancement removed - using native browser scrolling
    // This method is kept for API compatibility but does nothing
    logger.info("ScrollManager: Using native horizontal scrolling");
  }

  /**
   * Debounce scroll handlers
   */
  debounce(func, delay = this.DEBOUNCE_DELAY) {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Check if instant scroll should be used
   */
  shouldUseInstantScroll() {
    return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  }

  /**
   * Reinitialize horizontal scrolling after dynamic content changes
   * NOTE: Horizontal scroll enhancement has been completely removed
   */
  reinitializeHorizontalScrolling() {
    // Horizontal scroll enhancement removed - no action needed
    // Native browser scrolling is used instead
  }

  /**
   * Cleanup method
   */
  cleanup() {
    this.observers.forEach((observer) => observer.disconnect());
    this.observers.clear();
    this.debouncedHandlers.clear();

    if (this.scrollTimeout) {
      clearTimeout(this.scrollTimeout);
    }
  }
}

// Create singleton instance
const scrollManager = new ScrollManager();

export default scrollManager;
