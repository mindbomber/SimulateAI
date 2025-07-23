/**
 * Drawer Component - Advanced Sliding Panel with Accessibility
 *
 * A comprehensive drawer/sidebar component with:
 * - Multi-directional positioning (left, right, top, bottom)
 * - Smooth animations with easing
 * - Modal and non-modal modes
 * - Touch/swipe gesture support
 * - Focus management and keyboard navigation
 * - Full ARIA accessibility
 * - Theme integration and customization
 * - Performance optimization
 *
 * Features:
 * - Configurable slide-in/out animations
 * - Focus trapping when modal
 * - Swipe to close on mobile devices
 * - Overlay background for modal mode
 * - Customizable header with close button
 * - Content wrapping and scrolling
 * - Keyboard shortcuts (Escape, Tab navigation)
 * - Screen reader announcements
 * - Error recovery and validation
 * - Memory management and cleanup
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import { BaseObject } from "../../objects/enhanced-objects.js";
import { INPUT_UTILITY_CONSTANTS } from "./constants.js";
import { ComponentTheme } from "./theme.js";

// Drawer specific constants
const DRAWER_CONSTANTS = {
  HEADER_HEIGHT: 50,
  CLOSE_BUTTON_SIZE: 30,
  CLOSE_BUTTON_RADIUS: 15,
  CONTENT_PADDING: 16,
  CONTENT_LINE_HEIGHT: 20,
  SWIPE_THRESHOLD: 50,
  FOCUS_INDICATOR_OFFSET: 2,
  FOCUS_INDICATOR_BORDER: 4,
  BORDER_DASH_SIZE: 2,
  OVERLAY_ALPHA: 0.5,
  SHADOW_BLUR: 12,
  SHADOW_OFFSET: 4,
  DEFAULT_WIDTH: 300,
  DEFAULT_HEIGHT: 400,
  DEFAULT_ANIMATION_DURATION: 300,
  DEFAULT_THROTTLE_INTERVAL: 16,
  CUBIC_POWER: 3,
  RGB_MIN_PARTS: 3,
};

// Temporary local utility implementations to avoid circular dependencies
// These will be extracted to shared modules in future iterations

// Temporary local ComponentError class
class ComponentError extends Error {
  constructor(message, component, metadata = {}) {
    super(message);
    this.name = "ComponentError";
    this.component = component;
    this.metadata = metadata;
    this.timestamp = Date.now();
  }
}

// Temporary local ComponentDebug class
class ComponentDebug {
  static log(message, data = {}) {
    if (INPUT_UTILITY_CONSTANTS.DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.log(`[ComponentDebug] ${message}`, data);
    }
  }

  static warn(message, data = {}) {
    if (INPUT_UTILITY_CONSTANTS.DEBUG_MODE) {
      // eslint-disable-next-line no-console
      console.warn(`[ComponentDebug] ${message}`, data);
    }
  }

  static error(message, data = {}) {
    // eslint-disable-next-line no-console
    console.error(`[ComponentDebug] ${message}`, data);
  }
}

// Temporary local PerformanceMonitor class
class PerformanceMonitor {
  static timers = new Map();

  static createInstance(label) {
    return {
      startMeasurement: (operation) => {
        this.timers.set(`${label}-${operation}`, performance.now());
      },
      endMeasurement: (operation) => {
        const start = this.timers.get(`${label}-${operation}`);
        if (start) {
          const duration = performance.now() - start;
          if (
            INPUT_UTILITY_CONSTANTS.DEBUG_MODE &&
            duration > INPUT_UTILITY_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD
          ) {
            ComponentDebug.warn(
              `Performance warning: ${label}-${operation} took ${duration.toFixed(2)}ms`,
            );
          }
          this.timers.delete(`${label}-${operation}`);
          return duration;
        }
        return 0;
      },
    };
  }
}

// Temporary local AnimationManager class
class AnimationManager {
  static cancelAnimation(_component) {
    // Simple animation cancellation
    // In a full implementation, this would track and cancel specific animations
  }
}

// Temporary local logger implementation
const logger = {
  error: (message, error) => {
    // eslint-disable-next-line no-console
    console.error(message, error);
  },
  warn: (message, data) => {
    // eslint-disable-next-line no-console
    console.warn(message, data);
  },
  info: (message, data) => {
    // eslint-disable-next-line no-console
    console.info(message, data);
  },
};

/**
 * Advanced Drawer component with accessibility, animations,
 * touch support, and modern interaction patterns.
 */
class Drawer extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width:
        options.width ||
        INPUT_UTILITY_CONSTANTS.ACCORDION_DEFAULT_WIDTH ||
        DRAWER_CONSTANTS.DEFAULT_WIDTH,
      height:
        options.height ||
        INPUT_UTILITY_CONSTANTS.ACCORDION_DEFAULT_HEIGHT ||
        DRAWER_CONSTANTS.DEFAULT_HEIGHT,
      ariaRole: "dialog",
      ariaLabel: options.ariaLabel || "Drawer",
    });

    // Validate options
    this.validateOptions(options);

    // Core properties
    this.isOpen = options.isOpen || false;
    this.position = options.position || "left"; // 'left', 'right', 'top', 'bottom'
    this.modal = options.modal !== false;
    this.persistent = options.persistent || false;
    this.title = options.title || "";
    this.content = options.content || "";
    this.disabled = options.disabled || false;

    // Theme integration
    this.theme = options.theme || ComponentTheme.getCurrentTheme();

    // Animation and performance
    this.animationDuration =
      options.animationDuration ||
      INPUT_UTILITY_CONSTANTS.DEFAULT_ANIMATION_DURATION ||
      DRAWER_CONSTANTS.DEFAULT_ANIMATION_DURATION;
    this.animationState = {
      isAnimating: false,
      progress: this.isOpen ? 1 : 0,
      type: null,
      startTime: 0,
    };
    this.renderCache = new Map();
    this.throttledRender = this.throttle(
      this.render.bind(this),
      INPUT_UTILITY_CONSTANTS.PERFORMANCE_THRESHOLDS?.eventThrottle ||
        DRAWER_CONSTANTS.DEFAULT_THROTTLE_INTERVAL,
    );

    // Accessibility
    this.announcer = this.createScreenReaderAnnouncer();
    this.keyboardHandler = this.createKeyboardHandler();
    this.trapFocus = options.trapFocus !== false;
    this.restoreFocus = options.restoreFocus !== false;
    this.previouslyFocusedElement = null;
    this.isFocused = false;

    // Error handling
    this.errorHandler = this.createErrorHandler();

    // Performance monitoring
    this.performanceMonitor = PerformanceMonitor.createInstance("Drawer");

    // Touch support
    this.isCloseButtonHovered = false;

    try {
      this.setupEventHandlers();
      this.setupAccessibility();
      this.setupResizeObserver();
      this.setupTouchSupport();
    } catch (error) {
      this.errorHandler.handle(error, "constructor");
    }
  }

  validateOptions(options) {
    const validPositions = ["left", "right", "top", "bottom"];
    if (options.position && !validPositions.includes(options.position)) {
      throw new ComponentError(
        `Invalid position: ${options.position}. Must be one of: ${validPositions.join(", ")}`,
        "Drawer",
      );
    }

    if (
      options.animationDuration &&
      (typeof options.animationDuration !== "number" ||
        options.animationDuration < 0)
    ) {
      throw new ComponentError(
        "Animation duration must be a positive number",
        "Drawer",
      );
    }
  }

  createScreenReaderAnnouncer() {
    const announcer = document.createElement("div");
    announcer.setAttribute("aria-live", "polite");
    announcer.setAttribute("aria-atomic", "true");
    announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
    document.body.appendChild(announcer);
    return announcer;
  }

  createKeyboardHandler() {
    return {
      Escape: () => !this.persistent && this.close(),
      Tab: (event) => this.handleTabNavigation(event),
      Enter: () => this.handleEnterKey(),
      Space: () => this.handleSpaceKey(),
    };
  }

  createErrorHandler() {
    return {
      handle: (error, context) => {
        const componentError = new ComponentError(
          error.message || "Unknown error",
          "Drawer",
          { context, originalError: error },
        );

        logger.error("Drawer Error:", componentError);
        this.emit("error", componentError);

        this.recoverFromError(context);
      },
    };
  }

  recoverFromError(context) {
    switch (context) {
      case "animation":
        this.animationState.isAnimating = false;
        AnimationManager.cancelAnimation(this);
        break;
      case "render":
        this.clearRenderCache();
        break;
      default:
        this.reset();
    }
  }

  setupAccessibility() {
    // ARIA attributes
    this.setAttribute("role", "dialog");
    this.setAttribute("aria-modal", this.modal.toString());
    this.setAttribute("aria-hidden", (!this.isOpen).toString());

    if (this.title) {
      this.setAttribute("aria-labelledby", `drawer-title-${this.id}`);
    }

    // Keyboard accessibility
    this.setAttribute("tabindex", this.disabled ? "-1" : "0");

    // Focus management
    this.addEventListener("focusin", () => this.handleFocusIn());
    this.addEventListener("focusout", () => this.handleFocusOut());
  }

  setupResizeObserver() {
    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver((_entries) => {
        this.clearRenderCache();
        this.throttledRender();
      });

      if (this.element) {
        this.resizeObserver.observe(this.element);
      }
    }
  }

  setupTouchSupport() {
    // Touch/swipe gestures for mobile
    this.touchState = {
      startX: 0,
      startY: 0,
      currentX: 0,
      currentY: 0,
      isDragging: false,
    };

    this.addEventListener("touchstart", this.handleTouchStart.bind(this));
    this.addEventListener("touchmove", this.handleTouchMove.bind(this));
    this.addEventListener("touchend", this.handleTouchEnd.bind(this));
  }

  setupEventHandlers() {
    const eventHandlers = {
      click: this.handleClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.on(event, handler);
    });
  }

  // Enhanced drawer management with animations
  async open() {
    try {
      if (this.isOpen || this.animationState.isAnimating || this.disabled)
        return;

      this.isOpen = true;
      this.setAttribute("aria-hidden", "false");

      // Store previously focused element for restoration
      if (this.restoreFocus && document.activeElement) {
        this.previouslyFocusedElement = document.activeElement;
      }

      // Animate opening
      if (!this.prefersReducedMotion()) {
        await this.startAnimation("open");
      } else {
        this.animationState.progress = 1;
      }

      // Focus management
      this.manageFocus();

      this.announceChange(`${this.title || "Drawer"} opened`);
      this.emit("drawerOpened", { position: this.position });
    } catch (error) {
      this.errorHandler.handle(error, "open");
    }
  }

  async close() {
    try {
      if (!this.isOpen || this.animationState.isAnimating) return;

      this.isOpen = false;
      this.setAttribute("aria-hidden", "true");

      // Animate closing
      if (!this.prefersReducedMotion()) {
        await this.startAnimation("close");
      } else {
        this.animationState.progress = 0;
      }

      // Restore focus
      if (this.restoreFocus && this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }

      this.announceChange(`${this.title || "Drawer"} closed`);
      this.emit("drawerClosed", { position: this.position });
    } catch (error) {
      this.errorHandler.handle(error, "close");
    }
  }

  async toggle() {
    if (this.isOpen) {
      await this.close();
    } else {
      await this.open();
    }
  }

  async startAnimation(type) {
    this.animationState.isAnimating = true;
    this.animationState.type = type;
    this.animationState.startTime = performance.now();

    return new Promise((resolve) => {
      const animate = () => {
        const elapsed = performance.now() - this.animationState.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        const easedProgress = this.easeOutCubic(progress);

        if (type === "open") {
          this.animationState.progress = easedProgress;
        } else {
          this.animationState.progress = 1 - easedProgress;
        }

        this.clearRenderCache();

        if (progress >= 1) {
          this.animationState.isAnimating = false;
          this.animationState.progress = this.isOpen ? 1 : 0;
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }

  manageFocus() {
    if (this.trapFocus && this.isOpen) {
      // Focus the drawer itself or first focusable element
      this.focus();
    }
  }

  prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    );
  }

  announceChange(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  easeOutCubic(t) {
    const power =
      INPUT_UTILITY_CONSTANTS.EASING_CUBIC_POWER ||
      DRAWER_CONSTANTS.CUBIC_POWER;
    return 1 - Math.pow(1 - t, power);
  }

  getDrawerBounds() {
    const { progress } = this.animationState;

    switch (this.position) {
      case "left":
        return {
          x: -this.width + this.width * progress,
          y: 0,
          width: this.width,
          height: this.height,
        };
      case "right":
        return {
          x: this.width - this.width * progress,
          y: 0,
          width: this.width,
          height: this.height,
        };
      case "top":
        return {
          x: 0,
          y: -this.height + this.height * progress,
          width: this.width,
          height: this.height,
        };
      case "bottom":
        return {
          x: 0,
          y: this.height - this.height * progress,
          width: this.width,
          height: this.height,
        };
      default:
        return { x: 0, y: 0, width: this.width, height: this.height };
    }
  }

  // Enhanced event handlers with accessibility
  handleClick(event) {
    if (this.disabled) return;

    try {
      const { localX, localY } = event;
      const bounds = this.getDrawerBounds();

      // Close button
      if (
        this.title &&
        localY >= bounds.y &&
        localY < bounds.y + DRAWER_CONSTANTS.HEADER_HEIGHT &&
        localX >=
          bounds.x + bounds.width - DRAWER_CONSTANTS.CLOSE_BUTTON_SIZE &&
        localX < bounds.x + bounds.width
      ) {
        this.close();
        return;
      }

      // Click on overlay (if modal and not persistent)
      if (this.modal && !this.persistent) {
        const isInsideDrawer =
          localX >= bounds.x &&
          localX < bounds.x + bounds.width &&
          localY >= bounds.y &&
          localY < bounds.y + bounds.height;

        if (!isInsideDrawer) {
          this.close();
        }
      }
    } catch (error) {
      this.errorHandler.handle(error, "click-handler");
    }
  }

  handleKeyDown(event) {
    if (this.disabled) return;

    try {
      const handler = this.keyboardHandler[event.key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    } catch (error) {
      this.errorHandler.handle(error, "keyboard-handler");
    }
  }

  handleTabNavigation(event) {
    if (!this.trapFocus || !this.isOpen) return;

    // Basic focus trap - can be enhanced with more sophisticated logic
    const focusableElements = this.getFocusableElements();
    if (focusableElements.length === 0) return;

    const firstElement = focusableElements[0];
    const lastElement = focusableElements[focusableElements.length - 1];

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

  handleEnterKey() {
    // Can be overridden for specific drawer actions
    this.emit("enterPressed");
  }

  handleSpaceKey() {
    // Can be overridden for specific drawer actions
    this.emit("spacePressed");
  }

  handleFocus() {
    this.isFocused = true;
    this.emit("focus");
  }

  handleBlur() {
    this.isFocused = false;
    this.emit("blur");
  }

  handleFocusIn() {
    this.isFocused = true;
    this.emit("focusIn");
  }

  handleFocusOut() {
    this.isFocused = false;
    this.emit("focusOut");
  }

  // Touch support for mobile
  handleTouchStart(event) {
    if (this.disabled || !this.isOpen) return;

    const touch = event.touches[0];
    this.touchState.startX = touch.clientX;
    this.touchState.startY = touch.clientY;
    this.touchState.currentX = touch.clientX;
    this.touchState.currentY = touch.clientY;
    this.touchState.isDragging = false;
  }

  handleTouchMove(event) {
    if (this.disabled || !this.isOpen) return;

    const touch = event.touches[0];
    this.touchState.currentX = touch.clientX;
    this.touchState.currentY = touch.clientY;

    const deltaX = Math.abs(this.touchState.currentX - this.touchState.startX);
    const deltaY = Math.abs(this.touchState.currentY - this.touchState.startY);

    // Detect swipe gesture
    if (deltaX > 10 || deltaY > 10) {
      this.touchState.isDragging = true;
    }
  }

  handleTouchEnd(_event) {
    if (this.disabled || !this.isOpen || !this.touchState.isDragging) return;

    const deltaX = this.touchState.currentX - this.touchState.startX;
    const deltaY = this.touchState.currentY - this.touchState.startY;
    const threshold = DRAWER_CONSTANTS.SWIPE_THRESHOLD;

    // Check for swipe to close based on drawer position
    let shouldClose = false;
    switch (this.position) {
      case "left":
        shouldClose = deltaX < -threshold;
        break;
      case "right":
        shouldClose = deltaX > threshold;
        break;
      case "top":
        shouldClose = deltaY < -threshold;
        break;
      case "bottom":
        shouldClose = deltaY > threshold;
        break;
    }

    if (shouldClose && !this.persistent) {
      this.close();
    }

    this.touchState.isDragging = false;
  }

  getFocusableElements() {
    const selectors = [
      "button",
      "[href]",
      "input",
      "select",
      "textarea",
      '[tabindex]:not([tabindex="-1"])',
    ];

    return Array.from(
      this.element?.querySelectorAll(selectors.join(",")) || [],
    ).filter((el) => !el.disabled && el.offsetParent !== null);
  }

  // Enhanced rendering with theme support
  renderSelf(renderer) {
    if (renderer.type !== "canvas") return;
    if (this.animationState.progress <= 0) return;

    try {
      this.performanceMonitor.startMeasurement("render");

      // Render overlay if modal
      if (this.modal) {
        this.renderOverlay(renderer);
      }

      // Render drawer
      this.renderDrawer(renderer);

      this.performanceMonitor.endMeasurement("render");
    } catch (error) {
      this.errorHandler.handle(error, "render");
    }
  }

  renderOverlay(renderer) {
    const alpha = this.animationState.progress * DRAWER_CONSTANTS.OVERLAY_ALPHA;
    const overlayColor = ComponentTheme.getColor("overlay", this.theme);

    // Parse overlay color or use default
    let baseColor = `rgba(0, 0, 0, ${alpha})`;
    if (overlayColor.startsWith("rgba")) {
      const rgbaMatch = overlayColor.match(/rgba\(([^)]+)\)/);
      if (rgbaMatch) {
        const parts = rgbaMatch[1].split(",");
        if (parts.length >= DRAWER_CONSTANTS.RGB_MIN_PARTS) {
          baseColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
        }
      }
    } else if (overlayColor.startsWith("rgb")) {
      const rgbMatch = overlayColor.match(/rgb\(([^)]+)\)/);
      if (rgbMatch) {
        baseColor = `rgba(${rgbMatch[1]}, ${alpha})`;
      }
    }

    renderer.fillStyle = baseColor;
    renderer.fillRect(0, 0, this.width * 2, this.height * 2); // Cover entire viewport
  }

  renderDrawer(renderer) {
    const bounds = this.getDrawerBounds();

    // Enhanced shadow with theme support
    const shadowColor =
      ComponentTheme.getColor("shadow", this.theme) || "rgba(0, 0, 0, 0.15)";
    renderer.shadowColor = shadowColor;
    renderer.shadowBlur = DRAWER_CONSTANTS.SHADOW_BLUR;
    renderer.shadowOffsetX =
      this.position === "left"
        ? DRAWER_CONSTANTS.SHADOW_OFFSET
        : this.position === "right"
          ? -DRAWER_CONSTANTS.SHADOW_OFFSET
          : 0;
    renderer.shadowOffsetY =
      this.position === "top"
        ? DRAWER_CONSTANTS.SHADOW_OFFSET
        : this.position === "bottom"
          ? -DRAWER_CONSTANTS.SHADOW_OFFSET
          : 0;

    // Drawer background with theme support
    renderer.fillStyle = ComponentTheme.getColor("background", this.theme);
    renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Reset shadow
    renderer.shadowColor = "transparent";
    renderer.shadowBlur = 0;
    renderer.shadowOffsetX = 0;
    renderer.shadowOffsetY = 0;

    // Drawer border with theme support
    renderer.strokeStyle = ComponentTheme.getColor("border", this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);

    // Header
    if (this.title) {
      this.renderHeader(renderer, bounds);
    }

    // Content
    this.renderContent(renderer, bounds);

    // Focus indicator
    if (this.isFocused) {
      this.renderFocusIndicator(renderer, bounds);
    }
  }

  renderHeader(renderer, bounds) {
    const headerHeight = DRAWER_CONSTANTS.HEADER_HEIGHT;

    // Header background with theme support
    renderer.fillStyle = ComponentTheme.getColor(
      "backgroundSecondary",
      this.theme,
    );
    renderer.fillRect(bounds.x, bounds.y, bounds.width, headerHeight);

    // Header border with theme support
    renderer.strokeStyle = ComponentTheme.getColor("border", this.theme);
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(bounds.x, bounds.y + headerHeight);
    renderer.lineTo(bounds.x + bounds.width, bounds.y + headerHeight);
    renderer.stroke();

    // Title with theme support and truncation
    renderer.fillStyle = ComponentTheme.getColor("text", this.theme);
    renderer.font = "bold 16px Arial";
    renderer.textAlign = "left";
    renderer.textBaseline = "middle";

    const maxTitleWidth = bounds.width - DRAWER_CONSTANTS.CLOSE_BUTTON_SIZE; // Account for close button
    const truncatedTitle = this.truncateText(
      renderer,
      this.title,
      maxTitleWidth,
    );
    renderer.fillText(
      truncatedTitle,
      bounds.x + DRAWER_CONSTANTS.CONTENT_PADDING,
      bounds.y + headerHeight / 2,
    );

    // Enhanced close button with hover state
    const closeButtonX =
      bounds.x + bounds.width - DRAWER_CONSTANTS.CLOSE_BUTTON_SIZE;
    const closeButtonY = bounds.y + headerHeight / 2;

    // Close button background (optional hover effect)
    if (this.isCloseButtonHovered) {
      renderer.fillStyle = ComponentTheme.getColor("dangerHover", this.theme);
      renderer.beginPath();
      renderer.arc(
        closeButtonX,
        closeButtonY,
        DRAWER_CONSTANTS.CLOSE_BUTTON_RADIUS,
        0,
        Math.PI * 2,
      );
      renderer.fill();
    }

    // Close button icon
    renderer.fillStyle = ComponentTheme.getColor("textSecondary", this.theme);
    renderer.font = "18px Arial";
    renderer.textAlign = "center";
    renderer.textBaseline = "middle";
    renderer.fillText("×", closeButtonX, closeButtonY);
  }

  renderContent(renderer, bounds) {
    const contentY =
      bounds.y + (this.title ? DRAWER_CONSTANTS.HEADER_HEIGHT : 0);
    const contentHeight =
      bounds.height - (this.title ? DRAWER_CONSTANTS.HEADER_HEIGHT : 0);
    const padding = DRAWER_CONSTANTS.CONTENT_PADDING;

    // Content area with theme support
    renderer.fillStyle = ComponentTheme.getColor("text", this.theme);
    renderer.font = "14px Arial";
    renderer.textAlign = "left";
    renderer.textBaseline = "top";

    // Enhanced content rendering with line wrapping
    const lines = this.content.split("\n");
    const maxWidth = bounds.width - padding * 2;
    let currentY = contentY + padding;

    lines.forEach((line) => {
      const wrappedLines = this.wrapText(renderer, line, maxWidth);
      wrappedLines.forEach((wrappedLine) => {
        if (
          currentY + DRAWER_CONSTANTS.CONTENT_LINE_HEIGHT <=
          contentY + contentHeight - padding
        ) {
          renderer.fillText(wrappedLine, bounds.x + padding, currentY);
          currentY += DRAWER_CONSTANTS.CONTENT_LINE_HEIGHT;
        }
      });
    });
  }

  renderFocusIndicator(renderer, bounds) {
    renderer.strokeStyle = ComponentTheme.getColor("focus", this.theme);
    renderer.lineWidth = 2;
    renderer.setLineDash([
      DRAWER_CONSTANTS.BORDER_DASH_SIZE,
      DRAWER_CONSTANTS.BORDER_DASH_SIZE,
    ]);
    renderer.strokeRect(
      bounds.x + DRAWER_CONSTANTS.FOCUS_INDICATOR_OFFSET,
      bounds.y + DRAWER_CONSTANTS.FOCUS_INDICATOR_OFFSET,
      bounds.width - DRAWER_CONSTANTS.FOCUS_INDICATOR_BORDER,
      bounds.height - DRAWER_CONSTANTS.FOCUS_INDICATOR_BORDER,
    );
    renderer.setLineDash([]);
  }

  wrapText(renderer, text, maxWidth) {
    const words = text.split(" ");
    const lines = [];
    let currentLine = "";

    for (const word of words) {
      const testLine = currentLine + (currentLine ? " " : "") + word;
      const metrics = renderer.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length ? lines : [""];
  }

  truncateText(renderer, text, maxWidth) {
    const metrics = renderer.measureText(text);
    if (metrics.width <= maxWidth) {
      return text;
    }

    const ellipsis = "...";

    let truncated = text;
    while (
      renderer.measureText(truncated + ellipsis).width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }

    return truncated + ellipsis;
  }

  // Performance optimization methods
  clearRenderCache() {
    this.renderCache.clear();
  }

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Public API with enhanced error handling
  setTitle(title) {
    this.title = title;
    if (this.title) {
      this.setAttribute("aria-labelledby", `drawer-title-${this.id}`);
    }
    this.clearRenderCache();
    this.emit("titleChanged", { title });
  }

  setContent(content) {
    this.content = content;
    this.clearRenderCache();
    this.emit("contentChanged", { content });
  }

  setPosition(position) {
    const validPositions = ["left", "right", "top", "bottom"];
    if (!validPositions.includes(position)) {
      throw new ComponentError(`Invalid position: ${position}`, "Drawer");
    }

    this.position = position;
    this.clearRenderCache();
    this.emit("positionChanged", { position });
  }

  enable() {
    this.disabled = false;
    this.setAttribute("tabindex", "0");
    this.clearRenderCache();
    this.emit("enabled");
  }

  disable() {
    this.disabled = true;
    this.setAttribute("tabindex", "-1");
    this.close();
    this.clearRenderCache();
    this.emit("disabled");
  }

  reset() {
    this.isOpen = false;
    this.animationState = {
      isAnimating: false,
      progress: 0,
      type: null,
      startTime: 0,
    };
    this.setAttribute("aria-hidden", "true");
    this.clearRenderCache();
    this.emit("reset");
  }

  // Cleanup and memory management
  destroy() {
    try {
      // Cancel any active animations
      AnimationManager.cancelAnimation(this);

      // Clean up resize observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // Remove announcer from DOM
      if (this.announcer && this.announcer.parentNode) {
        this.announcer.parentNode.removeChild(this.announcer);
      }

      // Restore focus if needed
      if (this.restoreFocus && this.previouslyFocusedElement) {
        this.previouslyFocusedElement.focus();
        this.previouslyFocusedElement = null;
      }

      // Clear caches
      this.clearRenderCache();

      // Clear timers
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }
      // Call parent cleanup
      super.destroy?.();
      this.emit("destroyed");
    } catch (error) {
      logger.error("Error during Drawer cleanup:", error);
    }
  }
}

export { Drawer };
