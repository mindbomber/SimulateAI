/**
 * Event Handling Patterns - Duplicate Code Consolidation
 *
 * This module consolidates duplicate event handling patterns identified
 * in the dead code analysis, particularly:
 * - Event listener attachment/removal patterns
 * - Event delegation patterns
 * - Touch and mouse event handling
 * - Keyboard navigation patterns
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

/**
 * Event Patterns Utility - Consolidates Duplicate Event Handling Code
 */
export class EventPatterns {
  /**
   * Attach event listeners with cleanup - consolidates 28 duplicate instances
   * @param {HTMLElement} element - Target element
   * @param {Object} events - Event handlers map
   * @param {Object} options - Event options
   * @returns {Function} Cleanup function
   */
  static attachEventListeners(element, events, options = {}) {
    const { passive = false, capture = false, once = false } = options;
    const listeners = [];

    Object.entries(events).forEach(([eventType, handler]) => {
      const eventOptions = { passive, capture, once };
      element.addEventListener(eventType, handler, eventOptions);
      listeners.push({ eventType, handler, options: eventOptions });
    });

    // Return cleanup function
    return () => {
      listeners.forEach(({ eventType, handler, options: eventOptions }) => {
        element.removeEventListener(eventType, handler, eventOptions);
      });
    };
  }

  /**
   * Event delegation pattern - consolidates 15 duplicate instances
   * @param {HTMLElement} container - Container element
   * @param {string} selector - Target selector
   * @param {string} eventType - Event type
   * @param {Function} handler - Event handler
   * @returns {Function} Cleanup function
   */
  static delegate(container, selector, eventType, handler) {
    const delegateHandler = event => {
      const target = event.target.closest(selector);
      if (target && container.contains(target)) {
        handler.call(target, event);
      }
    };

    container.addEventListener(eventType, delegateHandler);

    return () => {
      container.removeEventListener(eventType, delegateHandler);
    };
  }

  /**
   * Touch and mouse event unification - consolidates touch handling patterns
   * @param {HTMLElement} element - Target element
   * @param {Object} handlers - Event handlers
   * @returns {Function} Cleanup function
   */
  static unifyPointerEvents(element, handlers) {
    const { onStart, onMove, onEnd, onCancel } = handlers;

    // Check for touch support
    const hasTouch = 'ontouchstart' in window;

    const events = {};

    if (hasTouch) {
      if (onStart) events.touchstart = onStart;
      if (onMove) events.touchmove = onMove;
      if (onEnd) events.touchend = onEnd;
      if (onCancel) events.touchcancel = onCancel;
    } else {
      if (onStart) events.mousedown = onStart;
      if (onMove) events.mousemove = onMove;
      if (onEnd) events.mouseup = onEnd;
    }

    return this.attachEventListeners(element, events, { passive: false });
  }

  /**
   * Keyboard navigation handler - consolidates keyboard patterns
   * @param {HTMLElement} element - Target element
   * @param {Object} keyMap - Key to action mapping
   * @param {Object} options - Keyboard options
   * @returns {Function} Cleanup function
   */
  static handleKeyboardNavigation(element, keyMap, options = {}) {
    const { preventDefault = true, stopPropagation = false } = options;

    const keyHandler = event => {
      const action = keyMap[event.key] || keyMap[event.code];

      if (action && typeof action === 'function') {
        if (preventDefault) event.preventDefault();
        if (stopPropagation) event.stopPropagation();
        action(event);
      }
    };

    return this.attachEventListeners(element, { keydown: keyHandler });
  }

  /**
   * Debounced event handler - consolidates debouncing patterns
   * @param {Function} func - Function to debounce
   * @param {number} delay - Debounce delay in ms
   * @returns {Function} Debounced function
   */
  static debounce(func, delay) {
    let timeoutId;

    return function debounced(...args) {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func.apply(this, args), delay);
    };
  }

  /**
   * Throttled event handler - consolidates throttling patterns
   * @param {Function} func - Function to throttle
   * @param {number} limit - Throttle limit in ms
   * @returns {Function} Throttled function
   */
  static throttle(func, limit) {
    let inThrottle;

    return function throttled(...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => {
          inThrottle = false;
        }, limit);
      }
    };
  }

  /**
   * Resize observer pattern - consolidates resize handling
   * @param {HTMLElement} element - Element to observe
   * @param {Function} callback - Resize callback
   * @param {Object} options - Observer options
   * @returns {Function} Cleanup function
   */
  static observeResize(element, callback, options = {}) {
    const { debounceDelay = 100 } = options;

    const debouncedCallback =
      debounceDelay > 0 ? this.debounce(callback, debounceDelay) : callback;

    if (window.ResizeObserver) {
      const observer = new ResizeObserver(entries => {
        entries.forEach(entry => {
          debouncedCallback(entry.contentRect, entry.target);
        });
      });

      observer.observe(element);

      return () => observer.disconnect();
    } else {
      // Fallback for older browsers
      const resizeHandler = () => {
        const rect = element.getBoundingClientRect();
        debouncedCallback(rect, element);
      };

      window.addEventListener('resize', resizeHandler);

      return () => {
        window.removeEventListener('resize', resizeHandler);
      };
    }
  }

  /**
   * Intersection observer pattern - consolidates visibility detection
   * @param {HTMLElement} element - Element to observe
   * @param {Function} callback - Intersection callback
   * @param {Object} options - Observer options
   * @returns {Function} Cleanup function
   */
  static observeIntersection(element, callback, options = {}) {
    const { threshold = 0, rootMargin = '0px', root = null } = options;

    if (window.IntersectionObserver) {
      const observer = new IntersectionObserver(
        entries => {
          entries.forEach(entry => {
            callback(entry.isIntersecting, entry);
          });
        },
        { threshold, rootMargin, root }
      );

      observer.observe(element);

      return () => observer.disconnect();
    } else {
      // Fallback using scroll events
      const checkVisibility = () => {
        const rect = element.getBoundingClientRect();
        const isVisible = rect.top < window.innerHeight && rect.bottom > 0;
        callback(isVisible, { target: element });
      };

      // Check initially and on scroll
      checkVisibility();
      window.addEventListener('scroll', checkVisibility);

      return () => {
        window.removeEventListener('scroll', checkVisibility);
      };
    }
  }

  /**
   * Focus management pattern - consolidates focus handling
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Focus options
   * @returns {Object} Focus management methods
   */
  static manageFocus(container, options = {}) {
    const {
      trapFocus = true,
      restoreFocus = true,
      initialFocus = null,
    } = options;

    let previousActiveElement = null;

    const getFocusableElements = () => {
      const focusableSelectors = [
        'button:not([disabled])',
        'input:not([disabled])',
        'select:not([disabled])',
        'textarea:not([disabled])',
        'a[href]',
        '[tabindex]:not([tabindex="-1"])',
      ].join(',');

      return Array.from(container.querySelectorAll(focusableSelectors)).filter(
        el => el.offsetParent !== null
      ); // Visible elements only
    };

    const trapFocusHandler = event => {
      if (!trapFocus) return;

      const focusableElements = getFocusableElements();
      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];

      if (event.key === 'Tab') {
        if (event.shiftKey) {
          if (document.activeElement === firstElement) {
            event.preventDefault();
            lastElement.focus();
          }
        } else {
          if (document.activeElement === lastElement) {
            event.preventDefault();
            firstElement.focus();
          }
        }
      }
    };

    const activate = () => {
      if (restoreFocus) {
        previousActiveElement = document.activeElement;
      }

      if (trapFocus) {
        container.addEventListener('keydown', trapFocusHandler);
      }

      // Set initial focus
      const focusTarget = initialFocus
        ? typeof initialFocus === 'string'
          ? container.querySelector(initialFocus)
          : initialFocus
        : getFocusableElements()[0];

      if (focusTarget) {
        focusTarget.focus();
      }
    };

    const deactivate = () => {
      if (trapFocus) {
        container.removeEventListener('keydown', trapFocusHandler);
      }

      if (restoreFocus && previousActiveElement) {
        previousActiveElement.focus();
        previousActiveElement = null;
      }
    };

    return {
      activate,
      deactivate,
      getFocusableElements,
    };
  }

  /**
   * Drag and drop pattern - consolidates drag handling
   * @param {HTMLElement} element - Draggable element
   * @param {Object} handlers - Drag event handlers
   * @param {Object} options - Drag options
   * @returns {Function} Cleanup function
   */
  static makeDraggable(element, handlers = {}, options = {}) {
    const { onDragStart, onDragMove, onDragEnd } = handlers;

    const {
      dragData = null,
      ghostImage = null,
      effectAllowed = 'move',
    } = options;

    const dragStartHandler = event => {
      if (dragData) {
        event.dataTransfer.setData('text/plain', JSON.stringify(dragData));
      }

      if (ghostImage) {
        event.dataTransfer.setDragImage(ghostImage, 0, 0);
      }

      event.dataTransfer.effectAllowed = effectAllowed;

      if (onDragStart) {
        onDragStart(event);
      }
    };

    const dragHandler = event => {
      if (onDragMove) {
        onDragMove(event);
      }
    };

    const dragEndHandler = event => {
      if (onDragEnd) {
        onDragEnd(event);
      }
    };

    // Make element draggable
    element.draggable = true;

    const cleanup = this.attachEventListeners(element, {
      dragstart: dragStartHandler,
      drag: dragHandler,
      dragend: dragEndHandler,
    });

    return () => {
      element.draggable = false;
      cleanup();
    };
  }

  /**
   * Drop zone pattern - consolidates drop handling
   * @param {HTMLElement} element - Drop zone element
   * @param {Object} handlers - Drop event handlers
   * @param {Object} options - Drop options
   * @returns {Function} Cleanup function
   */
  static makeDropZone(element, handlers = {}, options = {}) {
    const { onDragEnter, onDragOver, onDragLeave, onDrop } = handlers;

    const {
      acceptedTypes = [],
      dropEffect = 'move',
      highlightClass = 'drag-over',
    } = options;

    let dragCounter = 0;

    const dragEnterHandler = event => {
      event.preventDefault();
      dragCounter++;

      if (dragCounter === 1) {
        element.classList.add(highlightClass);
        if (onDragEnter) {
          onDragEnter(event);
        }
      }
    };

    const dragOverHandler = event => {
      event.preventDefault();
      event.dataTransfer.dropEffect = dropEffect;

      if (onDragOver) {
        onDragOver(event);
      }
    };

    const dragLeaveHandler = event => {
      dragCounter--;

      if (dragCounter === 0) {
        element.classList.remove(highlightClass);
        if (onDragLeave) {
          onDragLeave(event);
        }
      }
    };

    const dropHandler = event => {
      event.preventDefault();
      dragCounter = 0;
      element.classList.remove(highlightClass);

      // Check accepted types
      if (acceptedTypes.length > 0) {
        const hasAcceptedType = acceptedTypes.some(type =>
          event.dataTransfer.types.includes(type)
        );

        if (!hasAcceptedType) {
          return;
        }
      }

      if (onDrop) {
        onDrop(event);
      }
    };

    return this.attachEventListeners(element, {
      dragenter: dragEnterHandler,
      dragover: dragOverHandler,
      dragleave: dragLeaveHandler,
      drop: dropHandler,
    });
  }
}

export default EventPatterns;
