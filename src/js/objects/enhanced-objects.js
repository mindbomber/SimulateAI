/**
 * Enhanced Interactive Objects - Complete object system for SimulateAI
 * Provides sophisticated UI components with accessibility and animations
 *
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from "../utils/logger.js";

// Constants for performance and consistency
const DEFAULT_ANIMATION_DURATION = 300;
const DEFAULT_EASING = "easeInOut";
const TOUCH_TARGET_SIZE = 44;
const FOCUS_RING_WIDTH = 2;

// Enhanced Object System Constants
const OBJECT_CONSTANTS = {
  // Base object defaults
  DEFAULT_WIDTH: 100,
  DEFAULT_HEIGHT: 50,

  // ID generation
  ID_BASE: 36,
  ID_LENGTH: 9,
  ID_SUBSTRING_START: 2,

  // Animation and timing
  DOUBLE_CLICK_THRESHOLD: 500,
  RIPPLE_DURATION: 600,
  ANIMATION_PRECISION: 0.1,
  LOADING_SPINNER_SPEED: 2, // Math.PI * 2
  LOADING_SPINNER_ARC: 1.5, // Math.PI * 1.5
  SPINNER_RADIUS: 8,
  SPINNER_LINE_WIDTH: 2,
  BUTTON_TEXT_OFFSET: 10,
  BUTTON_SPINNER_OFFSET: 30,
  FPS_UPDATE_INTERVAL: 1000,

  // UI dimensions and scaling
  BUTTON_HOVER_SCALE: 1.02,
  BUTTON_SCALE_DURATION: 150,
  FOCUS_RING_OFFSET: 2,
  FOCUS_RING_EXTRA: 3,
  FOCUS_RING_BUTTON_OFFSET: 4,
  BORDER_WIDTH: 2,
  THICK_BORDER_WIDTH: 3,

  // Positioning ratios
  METER_TRACK_Y_RATIO: 0.4,
  METER_TRACK_HEIGHT_RATIO: 0.3,
  METER_LABEL_Y_RATIO: 0.3,
  METER_VALUE_LABEL_Y_RATIO: 0.9,
  SLIDER_VALUE_Y_OFFSET: 15,
  SLIDER_LABEL_Y_OFFSET: -5,

  // Default component dimensions
  METER_DEFAULT_WIDTH: 200,
  METER_DEFAULT_HEIGHT: 60,
  METER_DEFAULT_VALUE: 50,
  METER_DEFAULT_MAX: 100,

  BUTTON_DEFAULT_WIDTH: 120,
  BUTTON_DEFAULT_HEIGHT: 40,

  SLIDER_DEFAULT_WIDTH: 200,
  SLIDER_DEFAULT_HEIGHT: 40,
  SLIDER_DEFAULT_VALUE: 50,
  SLIDER_DEFAULT_MAX: 100,
  SLIDER_DEFAULT_STEP: 1,
  SLIDER_DEFAULT_TRACK_HEIGHT: 6,
  SLIDER_DEFAULT_HANDLE_SIZE: 20,

  // Scoring thresholds
  SCORE_THRESHOLD_EXCELLENT: 90,
  SCORE_THRESHOLD_GOOD: 70,
  SCORE_THRESHOLD_FAIR: 50,
  SCORE_THRESHOLD_POOR: 30,

  // Ripple effect
  RIPPLE_ALPHA: 0.3,
};

// Easing function constants
const EASING_CONSTANTS = {
  // Bezier curve control points
  HALF: 0.5,
  QUARTER: 0.25,
  THREE_QUARTERS: 0.75,

  // Cubic easing powers
  CUBIC_POWER: 3,
  QUARTIC_POWER: 4,

  // Bounce easing constants
  BOUNCE_N1: 7.5625,
  BOUNCE_D1: 2.75,
  BOUNCE_THRESHOLD_1: 1, // 1 / d1
  BOUNCE_THRESHOLD_2: 2, // 2 / d1
  BOUNCE_THRESHOLD_3: 2.5, // 2.5 / d1
  BOUNCE_OFFSET_1: 1.5, // 1.5 / d1
  BOUNCE_OFFSET_2: 2.25, // 2.25 / d1
  BOUNCE_OFFSET_3: 2.625, // 2.625 / d1
  BOUNCE_VALUE_1: 0.75,
  BOUNCE_VALUE_2: 0.9375,
  BOUNCE_VALUE_3: 0.984375,

  // Ease multipliers
  EASE_IN_OUT_MULTIPLIER: 2,
  EASE_IN_OUT_CUBIC_MULTIPLIER: 4,
  EASE_IN_OUT_QUART_MULTIPLIER: 8,
  EASE_NEGATIVE_MULTIPLIER: -2,
  EASE_ADDEND: 2,
  EASE_DIVISOR: 2,
};

// Animation frame management
class AnimationManager {
  constructor() {
    this.animations = new Map();
    this.isRunning = false;
    this.rafId = null;
  }

  add(id, callback) {
    this.animations.set(id, callback);
    this.start();
  }

  remove(id) {
    this.animations.delete(id);
    if (this.animations.size === 0) {
      this.stop();
    }
  }

  start() {
    if (!this.isRunning) {
      this.isRunning = true;
      this.tick();
    }
  }

  stop() {
    if (this.rafId) {
      cancelAnimationFrame(this.rafId);
      this.rafId = null;
    }
    this.isRunning = false;
  }

  tick() {
    const currentTime = performance.now();

    for (const [id, callback] of this.animations) {
      try {
        const shouldContinue = callback(currentTime);
        if (!shouldContinue) {
          this.animations.delete(id);
        }
      } catch (error) {
        logger.error(`Animation error for ${id}:`, error);
        this.animations.delete(id);
      }
    }

    if (this.animations.size > 0) {
      this.rafId = requestAnimationFrame(() => this.tick());
    } else {
      this.stop();
    }
  }

  clear() {
    this.animations.clear();
    this.stop();
  }
}

// Global animation manager instance
const animationManager = new AnimationManager();

// Utility functions
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));
const lerp = (start, end, progress) => start + (end - start) * progress;
const validateNumber = (value, defaultValue = 0) =>
  typeof value === "number" && !isNaN(value) ? value : defaultValue;
const validateString = (value, defaultValue = "") =>
  typeof value === "string" ? value : defaultValue;

// Enhanced easing functions
const EasingFunctions = {
  linear: (t) => t,
  easeIn: (t) => t * t,
  easeOut: (t) => 1 - (1 - t) * (1 - t),
  easeInOut: (t) =>
    t < EASING_CONSTANTS.HALF
      ? EASING_CONSTANTS.EASE_IN_OUT_MULTIPLIER * t * t
      : 1 - EASING_CONSTANTS.EASE_IN_OUT_MULTIPLIER * (1 - t) * (1 - t),
  easeInCubic: (t) => t * t * t,
  easeOutCubic: (t) => 1 - Math.pow(1 - t, EASING_CONSTANTS.CUBIC_POWER),
  easeInOutCubic: (t) =>
    t < EASING_CONSTANTS.HALF
      ? EASING_CONSTANTS.EASE_IN_OUT_CUBIC_MULTIPLIER * t * t * t
      : 1 -
        Math.pow(
          EASING_CONSTANTS.EASE_NEGATIVE_MULTIPLIER * t +
            EASING_CONSTANTS.EASE_ADDEND,
          EASING_CONSTANTS.CUBIC_POWER,
        ) /
          EASING_CONSTANTS.EASE_DIVISOR,
  easeInQuart: (t) => t * t * t * t,
  easeOutQuart: (t) => 1 - Math.pow(1 - t, EASING_CONSTANTS.QUARTIC_POWER),
  easeInOutQuart: (t) =>
    t < EASING_CONSTANTS.HALF
      ? EASING_CONSTANTS.EASE_IN_OUT_QUART_MULTIPLIER * t * t * t * t
      : 1 -
        Math.pow(
          EASING_CONSTANTS.EASE_NEGATIVE_MULTIPLIER * t +
            EASING_CONSTANTS.EASE_ADDEND,
          EASING_CONSTANTS.QUARTIC_POWER,
        ) /
          EASING_CONSTANTS.EASE_DIVISOR,
  bounce: (t) => {
    const n1 = EASING_CONSTANTS.BOUNCE_N1;
    const d1 = EASING_CONSTANTS.BOUNCE_D1;
    if (t < EASING_CONSTANTS.BOUNCE_THRESHOLD_1 / d1) return n1 * t * t;
    if (t < EASING_CONSTANTS.BOUNCE_THRESHOLD_2 / d1)
      return (
        n1 * (t -= EASING_CONSTANTS.BOUNCE_OFFSET_1 / d1) * t +
        EASING_CONSTANTS.BOUNCE_VALUE_1
      );
    if (t < EASING_CONSTANTS.BOUNCE_THRESHOLD_3 / d1)
      return (
        n1 * (t -= EASING_CONSTANTS.BOUNCE_OFFSET_2 / d1) * t +
        EASING_CONSTANTS.BOUNCE_VALUE_2
      );
    return (
      n1 * (t -= EASING_CONSTANTS.BOUNCE_OFFSET_3 / d1) * t +
      EASING_CONSTANTS.BOUNCE_VALUE_3
    );
  },
};

// Base Object Foundation with Enhanced Features
export class BaseObject {
  /**
   * Creates a new BaseObject instance
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    // Validate and set core properties
    this.id = validateString(options.id) || this.generateId();
    this.x = validateNumber(options.x, 0);
    this.y = validateNumber(options.y, 0);
    this.z = validateNumber(options.z, 0);
    this.width = validateNumber(options.width, OBJECT_CONSTANTS.DEFAULT_WIDTH);
    this.height = validateNumber(
      options.height,
      OBJECT_CONSTANTS.DEFAULT_HEIGHT,
    );
    this.rotation = validateNumber(options.rotation, 0);
    this.scaleX = validateNumber(options.scaleX, 1);
    this.scaleY = validateNumber(options.scaleY, 1);
    this.alpha = validateNumber(options.alpha, 1);
    this.visible = options.visible !== false;

    // Interaction states with validation
    this.isInteractive = options.interactive !== false;
    this.isDraggable = Boolean(options.draggable);
    this.isResizable = Boolean(options.resizable);
    this.isFocusable = options.focusable !== false;
    this.isSelectable = Boolean(options.selectable);

    // Current states
    this.isHovered = false;
    this.isFocused = false;
    this.isDragging = false;
    this.isSelected = false;
    this.isPressed = false;
    this.isDisabled = Boolean(options.disabled);

    // Styling with validation
    this.theme = validateString(options.theme, "default");
    this.className = validateString(options.className);
    this.style = { ...options.style };

    // Enhanced accessibility
    this.ariaLabel = validateString(options.ariaLabel);
    this.ariaRole = validateString(options.ariaRole, "generic");
    this.ariaDescribedBy = validateString(options.ariaDescribedBy);
    this.ariaExpanded = options.ariaExpanded;
    this.ariaPressed = options.ariaPressed;
    this.ariaChecked = options.ariaChecked;
    this.tabIndex = validateNumber(
      options.tabIndex,
      this.isInteractive ? 0 : -1,
    );

    // Enhanced event system
    this.eventHandlers = new Map();
    this.setupDefaultHandlers(options);

    // Improved animation support
    this.animations = new Map();
    this.transitions = new Map();
    this.animationQueue = [];

    // Parent/child relationships
    this.parent = null;
    this.children = [];
    this.scene = null;

    // Enhanced layout properties
    this.layout = {
      type: validateString(options.layout?.type, "absolute"),
      padding: this.validateSpacing(options.layout?.padding),
      margin: this.validateSpacing(options.layout?.margin),
      align: validateString(options.layout?.align, "start"),
      justify: validateString(options.layout?.justify, "start"),
      flexDirection: validateString(options.layout?.flexDirection, "row"),
      flexWrap: validateString(options.layout?.flexWrap, "nowrap"),
      gap: validateNumber(options.layout?.gap, 0),
    };

    // Performance tracking
    this.lastRenderTime = 0;
    this.renderCount = 0;
    this.needsRedraw = true;

    // Error handling
    this.errorHandler = options.errorHandler || this.defaultErrorHandler;

    // Cleanup tracking
    this.isDestroyed = false;
    this.cleanupTasks = [];
  }

  /**
   * Validates spacing object (margin, padding)
   * @param {Object|number} spacing
   * @returns {Object}
   */
  validateSpacing(spacing) {
    if (typeof spacing === "number") {
      return { top: spacing, right: spacing, bottom: spacing, left: spacing };
    }
    if (spacing && typeof spacing === "object") {
      return {
        top: validateNumber(spacing.top, 0),
        right: validateNumber(spacing.right, 0),
        bottom: validateNumber(spacing.bottom, 0),
        left: validateNumber(spacing.left, 0),
      };
    }
    return { top: 0, right: 0, bottom: 0, left: 0 };
  }

  /**
   * Default error handler
   * @param {Error} error
   * @param {string} context
   */
  defaultErrorHandler(error, context) {
    logger.error(
      `Error in ${this.constructor.name} (${this.id}) - ${context}:`,
      error,
    );
  }

  /**
   * Generates a unique ID for the object
   * @returns {string}
   */
  generateId() {
    return `obj_${Date.now()}_${Math.random()
      .toString(OBJECT_CONSTANTS.ID_BASE)
      .substring(
        OBJECT_CONSTANTS.ID_SUBSTRING_START,
        OBJECT_CONSTANTS.ID_SUBSTRING_START + OBJECT_CONSTANTS.ID_LENGTH,
      )}`;
  } /**
   * Sets up default event handlers from options
   * @param {Object} options
   */
  setupDefaultHandlers(options) {
    const events = [
      "click",
      "doubleClick",
      "hover",
      "hoverEnd",
      "focus",
      "blur",
      "keyDown",
      "keyUp",
      "mouseDown",
      "mouseUp",
      "mouseMove",
      "drag",
      "dragStart",
      "dragEnd",
      "drop",
      "change",
      "input",
    ];

    events.forEach((event) => {
      const handlerName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
      if (typeof options[handlerName] === "function") {
        this.on(event, options[handlerName]);
      }
    });
  }

  // Enhanced Event System
  /**
   * Adds an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function
   * @returns {BaseObject} - Returns this for chaining
   */
  on(event, handler) {
    if (typeof handler !== "function") {
      this.errorHandler(new Error("Event handler must be a function"), "on");
      return this;
    }

    if (!this.eventHandlers.has(event)) {
      this.eventHandlers.set(event, []);
    }
    this.eventHandlers.get(event).push(handler);

    // Add to cleanup tasks
    this.cleanupTasks.push(() => this.off(event, handler));

    return this;
  }

  /**
   * Removes an event listener
   * @param {string} event - Event name
   * @param {Function} handler - Event handler function to remove
   * @returns {BaseObject} - Returns this for chaining
   */
  off(event, handler) {
    if (this.eventHandlers.has(event)) {
      const handlers = this.eventHandlers.get(event);
      const index = handlers.indexOf(handler);
      if (index > -1) {
        handlers.splice(index, 1);
        if (handlers.length === 0) {
          this.eventHandlers.delete(event);
        }
      }
    }
    return this;
  }

  /**
   * Emits an event to all registered handlers
   * @param {string} event - Event name
   * @param {Object} data - Event data
   * @returns {BaseObject} - Returns this for chaining
   */
  emit(event, data = {}) {
    if (this.isDestroyed) return this;

    if (this.eventHandlers.has(event)) {
      const eventData = {
        ...data,
        target: this,
        type: event,
        timestamp: performance.now(),
        preventDefault: () => {
          eventData.defaultPrevented = true;
        },
        stopPropagation: () => {
          eventData.propagationStopped = true;
        },
      };

      this.eventHandlers.get(event).forEach((handler) => {
        try {
          if (!eventData.propagationStopped) {
            handler.call(this, eventData);
          }
        } catch (error) {
          this.errorHandler(error, `event:${event}`);
        }
      });
    }
    return this;
  } // Enhanced Parent/Child Management
  /**
   * Adds a child object
   * @param {BaseObject} child - Child object to add
   * @returns {BaseObject} - Returns this for chaining
   */
  addChild(child) {
    if (!(child instanceof BaseObject)) {
      this.errorHandler(
        new Error("Child must be a BaseObject instance"),
        "addChild",
      );
      return this;
    }

    if (child.parent) {
      child.parent.removeChild(child);
    }

    child.parent = this;
    child.scene = this.scene;
    this.children.push(child);

    this.emit("childAdded", { child });
    return this;
  }

  /**
   * Removes a child object
   * @param {BaseObject} child - Child object to remove
   * @returns {BaseObject} - Returns this for chaining
   */
  removeChild(child) {
    const index = this.children.indexOf(child);
    if (index > -1) {
      this.children.splice(index, 1);
      child.parent = null;
      child.scene = null;
      this.emit("childRemoved", { child });
    }
    return this;
  }

  /**
   * Removes all children
   * @returns {BaseObject} - Returns this for chaining
   */
  removeAllChildren() {
    while (this.children.length > 0) {
      this.removeChild(this.children[0]);
    }
    return this;
  }

  /**
   * Finds a child by ID
   * @param {string} id - Child ID to find
   * @returns {BaseObject|null} - Found child or null
   */
  findChildById(id) {
    return this.children.find((child) => child.id === id) || null;
  }

  /**
   * Finds children by class name
   * @param {string} className - Class name to search for
   * @returns {BaseObject[]} - Array of matching children
   */
  findChildrenByClass(className) {
    return this.children.filter((child) => child.className.includes(className));
  }

  // Enhanced Bounds and Collision Detection
  /**
   * Checks if a point is within this object's bounds
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {boolean} useTransform - Whether to apply transformations
   * @returns {boolean}
   */
  containsPoint(x, y, useTransform = false) {
    if (!this.visible || this.alpha <= 0) return false;

    let bounds = this.getBounds();

    if (
      useTransform &&
      (this.rotation !== 0 || this.scaleX !== 1 || this.scaleY !== 1)
    ) {
      // For simplicity, use bounding box of transformed object
      // In a real implementation, you might want more precise collision detection
      bounds = this.getTransformedBounds();
    }

    return (
      x >= bounds.x && x <= bounds.right && y >= bounds.y && y <= bounds.bottom
    );
  }

  /**
   * Gets the bounding box of this object
   * @returns {Object} - Bounds object with x, y, width, height, right, bottom
   */
  getBounds() {
    return {
      x: this.x,
      y: this.y,
      width: this.width,
      height: this.height,
      right: this.x + this.width,
      bottom: this.y + this.height,
      centerX: this.x + this.width / 2,
      centerY: this.y + this.height / 2,
    };
  }

  /**
   * Gets transformed bounds (approximate)
   * @returns {Object} - Transformed bounds
   */
  getTransformedBounds() {
    const bounds = this.getBounds();

    // Apply scaling
    const scaledWidth = bounds.width * Math.abs(this.scaleX);
    const scaledHeight = bounds.height * Math.abs(this.scaleY);

    // For rotation, use bounding box of rotated rectangle
    if (this.rotation !== 0) {
      const cos = Math.abs(Math.cos(this.rotation));
      const sin = Math.abs(Math.sin(this.rotation));
      const newWidth = scaledWidth * cos + scaledHeight * sin;
      const newHeight = scaledWidth * sin + scaledHeight * cos;

      return {
        x: bounds.centerX - newWidth / 2,
        y: bounds.centerY - newHeight / 2,
        width: newWidth,
        height: newHeight,
        right: bounds.centerX + newWidth / 2,
        bottom: bounds.centerY + newHeight / 2,
        centerX: bounds.centerX,
        centerY: bounds.centerY,
      };
    }

    return {
      x: bounds.centerX - scaledWidth / 2,
      y: bounds.centerY - scaledHeight / 2,
      width: scaledWidth,
      height: scaledHeight,
      right: bounds.centerX + scaledWidth / 2,
      bottom: bounds.centerY + scaledHeight / 2,
      centerX: bounds.centerX,
      centerY: bounds.centerY,
    };
  }

  /**
   * Checks if this object intersects with another object
   * @param {BaseObject} other - Other object to check
   * @returns {boolean}
   */
  intersects(other) {
    if (!(other instanceof BaseObject)) return false;

    const bounds1 = this.getBounds();
    const bounds2 = other.getBounds();

    return !(
      bounds1.right < bounds2.x ||
      bounds1.x > bounds2.right ||
      bounds1.bottom < bounds2.y ||
      bounds1.y > bounds2.bottom
    );
  } // Enhanced Input Handling
  /**
   * Handles input events with improved error handling and performance
   * @param {string} eventType - Type of input event
   * @param {Object} eventData - Event data
   * @returns {boolean} - Whether the event was handled
   */
  handleInput(eventType, eventData) {
    if (
      !this.isInteractive ||
      !this.visible ||
      this.isDisabled ||
      this.isDestroyed
    ) {
      return false;
    }

    try {
      switch (eventType) {
        case "mousedown":
        case "pointerdown":
          return this.handlePointerDown(eventData);

        case "mouseup":
        case "pointerup":
          return this.handlePointerUp(eventData);

        case "mousemove":
        case "pointermove":
          return this.handlePointerMove(eventData);

        case "keydown":
          return this.handleKeyDown(eventData);

        case "keyup":
          return this.handleKeyUp(eventData);

        case "wheel":
          return this.handleWheel(eventData);

        case "focus":
          return this.handleFocus(eventData);

        case "blur":
          return this.handleBlur(eventData);

        default:
          return false;
      }
    } catch (error) {
      this.errorHandler(error, `handleInput:${eventType}`);
      return false;
    }
  }

  handlePointerDown(eventData) {
    if (this.containsPoint(eventData.x, eventData.y)) {
      this.isPressed = true;
      const localData = {
        ...eventData,
        localX: eventData.x - this.x,
        localY: eventData.y - this.y,
      };
      this.emit("mouseDown", localData);
      this.emit("pointerDown", localData);
      return true;
    }
    return false;
  }

  handlePointerUp(eventData) {
    if (this.isPressed) {
      this.isPressed = false;
      this.emit("mouseUp", eventData);
      this.emit("pointerUp", eventData);

      if (this.containsPoint(eventData.x, eventData.y)) {
        this.emit("click", eventData);

        // Double click detection
        const now = performance.now();
        if (
          this.lastClickTime &&
          now - this.lastClickTime < OBJECT_CONSTANTS.DOUBLE_CLICK_THRESHOLD
        ) {
          this.emit("doubleClick", eventData);
          this.lastClickTime = 0;
        } else {
          this.lastClickTime = now;
        }
      }
      return true;
    }
    return false;
  }

  handlePointerMove(eventData) {
    const wasHovered = this.isHovered;
    this.isHovered = this.containsPoint(eventData.x, eventData.y);

    const localData = {
      ...eventData,
      localX: eventData.x - this.x,
      localY: eventData.y - this.y,
    };

    if (this.isHovered && !wasHovered) {
      this.emit("hover", localData);
      this.emit("mouseEnter", localData);
    } else if (!this.isHovered && wasHovered) {
      this.emit("hoverEnd", localData);
      this.emit("mouseLeave", localData);
    }

    if (this.isHovered || this.isDragging) {
      this.emit("mouseMove", localData);
      this.emit("pointerMove", localData);
    }

    // Handle dragging
    if (this.isDragging) {
      this.emit("drag", localData);
      return true;
    }

    return this.isHovered;
  }

  handleKeyDown(eventData) {
    if (this.isFocused) {
      this.emit("keyDown", eventData);

      // Handle common accessibility keys
      switch (eventData.key) {
        case "Enter":
        case " ":
          if (!eventData.defaultPrevented) {
            this.emit("click", { ...eventData, synthetic: true });
          }
          break;
        case "Escape":
          this.blur();
          break;
      }
      return true;
    }
    return false;
  }

  handleKeyUp(eventData) {
    if (this.isFocused) {
      this.emit("keyUp", eventData);
      return true;
    }
    return false;
  }

  handleWheel(eventData) {
    if (this.containsPoint(eventData.x, eventData.y)) {
      this.emit("wheel", eventData);
      return true;
    }
    return false;
  }

  handleFocus(eventData) {
    if (!this.isFocused && this.isFocusable) {
      this.isFocused = true;
      this.emit("focus", eventData);
      return true;
    }
    return false;
  }

  handleBlur(eventData) {
    if (this.isFocused) {
      this.isFocused = false;
      this.emit("blur", eventData);
      return true;
    }
    return false;
  }

  /**
   * Programmatically focus this object
   */
  focus() {
    if (this.isFocusable && !this.isDisabled && !this.isDestroyed) {
      this.handleFocus({ synthetic: true });
    }
  }

  /**
   * Programmatically blur this object
   */
  blur() {
    if (this.isFocused) {
      this.handleBlur({ synthetic: true });
    }
  } // Enhanced Animation System
  /**
   * Animates a property to a target value
   * @param {string|Object} property - Property name or object of property/value pairs
   * @param {number} targetValue - Target value (ignored if property is object)
   * @param {number} duration - Animation duration in milliseconds
   * @param {string|Function} easing - Easing function name or custom function
   * @returns {Promise} - Resolves when animation completes
   */
  animate(
    property,
    targetValue,
    duration = DEFAULT_ANIMATION_DURATION,
    easing = DEFAULT_EASING,
  ) {
    if (this.isDestroyed) return Promise.resolve();

    // Handle multiple properties
    if (typeof property === "object") {
      const promises = Object.entries(property).map(([prop, value]) =>
        this.animate(prop, value, targetValue || duration, duration || easing),
      );
      return Promise.all(promises);
    }

    return new Promise((resolve, reject) => {
      try {
        const startValue = this[property];
        if (startValue === undefined) {
          reject(new Error(`Property '${property}' not found`));
          return;
        }

        const startTime = performance.now();
        const animationId = `${property}_${startTime}`;
        const easingFn =
          typeof easing === "function"
            ? easing
            : EasingFunctions[easing] || EasingFunctions.linear;

        const animate = (currentTime) => {
          if (this.isDestroyed) {
            resolve();
            return false;
          }

          const elapsed = currentTime - startTime;
          const progress = Math.min(elapsed / duration, 1);
          const easedProgress = easingFn(progress);

          this[property] = lerp(startValue, targetValue, easedProgress);
          this.needsRedraw = true;

          if (progress < 1) {
            return true; // Continue animation
          } else {
            this.animations.delete(animationId);
            resolve();
            return false; // Animation complete
          }
        };

        this.animations.set(animationId, animate);
        animationManager.add(animationId, animate);

        // Add to cleanup tasks
        this.cleanupTasks.push(() => {
          animationManager.remove(animationId);
          this.animations.delete(animationId);
        });
      } catch (error) {
        this.errorHandler(error, "animate");
        reject(error);
      }
    });
  }

  /**
   * Stops all animations for this object
   */
  stopAnimations() {
    for (const animationId of this.animations.keys()) {
      animationManager.remove(animationId);
    }
    this.animations.clear();
  }

  /**
   * Queues an animation to run after current animations complete
   * @param {Function} animationFn - Function that returns an animation promise
   * @returns {Promise}
   */
  queueAnimation(animationFn) {
    const promise =
      this.animationQueue.length === 0
        ? animationFn()
        : this.animationQueue[this.animationQueue.length - 1].then(animationFn);

    this.animationQueue.push(promise);

    // Clean up completed animations
    promise.finally(() => {
      const index = this.animationQueue.indexOf(promise);
      if (index > -1) {
        this.animationQueue.splice(index, 1);
      }
    });

    return promise;
  } // Enhanced Lifecycle Methods
  /**
   * Updates the object and its children
   * @param {number} deltaTime - Time since last update in milliseconds
   */
  update(deltaTime) {
    if (this.isDestroyed) return;

    try {
      // Update animations (handled by AnimationManager)

      // Update children
      for (let i = this.children.length - 1; i >= 0; i--) {
        const child = this.children[i];
        if (child && typeof child.update === "function") {
          child.update(deltaTime);
        }
      }

      // Custom update logic (override in subclasses)
      this.onUpdate(deltaTime);
    } catch (error) {
      this.errorHandler(error, "update");
    }
  }

  /**
   * Override in subclasses for custom update logic
   * @param {number} deltaTime
   */
  onUpdate(_deltaTime) {
    // Override in subclasses
  }

  /**
   * Renders the object and its children
   * @param {Object} renderer - Renderer object
   */
  render(renderer) {
    if (!this.visible || this.alpha <= 0 || this.isDestroyed) return;

    try {
      this.renderCount++;
      this.lastRenderTime = performance.now();

      renderer.save();

      // Apply transformations
      this.applyTransforms(renderer);

      // Render this object
      this.renderSelf(renderer);

      // Render children
      this.renderChildren(renderer);

      renderer.restore();

      this.needsRedraw = false;
    } catch (error) {
      this.errorHandler(error, "render");
      renderer.restore(); // Ensure we restore state even on error
    }
  }

  /**
   * Applies transformations to the renderer
   * @param {Object} renderer
   */
  applyTransforms(renderer) {
    if (this.x || this.y) {
      renderer.translate(this.x, this.y);
    }

    if (this.rotation) {
      renderer.translate(this.width / 2, this.height / 2);
      renderer.rotate(this.rotation);
      renderer.translate(-this.width / 2, -this.height / 2);
    }

    if (this.scaleX !== 1 || this.scaleY !== 1) {
      renderer.translate(this.width / 2, this.height / 2);
      renderer.scale(this.scaleX, this.scaleY);
      renderer.translate(-this.width / 2, -this.height / 2);
    }

    if (this.alpha !== 1) {
      renderer.globalAlpha *= this.alpha;
    }
  }

  /**
   * Renders child objects
   * @param {Object} renderer
   */
  renderChildren(renderer) {
    for (const child of this.children) {
      if (child && typeof child.render === "function") {
        child.render(renderer);
      }
    }
  }

  /**
   * Override in subclasses to implement custom rendering
   * @param {Object} renderer
   */
  renderSelf(_renderer) {
    // Override in subclasses
  }

  /**
   * Gets debug information about this object
   * @returns {Object}
   */
  getDebugInfo() {
    return {
      id: this.id,
      className: this.constructor.name,
      bounds: this.getBounds(),
      visible: this.visible,
      interactive: this.isInteractive,
      children: this.children.length,
      animations: this.animations.size,
      renderCount: this.renderCount,
      lastRenderTime: this.lastRenderTime,
    };
  }

  /**
   * Enhanced cleanup method
   */
  destroy() {
    if (this.isDestroyed) return;

    try {
      this.isDestroyed = true;

      // Emit destroy event
      this.emit("destroy");

      // Stop all animations
      this.stopAnimations();

      // Clear event handlers
      this.eventHandlers.clear();

      // Run cleanup tasks
      this.cleanupTasks.forEach((task) => {
        try {
          task();
        } catch (error) {
          this.errorHandler(error, "cleanup");
        }
      });
      this.cleanupTasks = [];

      // Destroy children
      while (this.children.length > 0) {
        const child = this.children[0];
        this.removeChild(child);
        if (typeof child.destroy === "function") {
          child.destroy();
        }
      }

      // Remove from parent
      if (this.parent) {
        this.parent.removeChild(this);
      }

      // Clear references
      this.parent = null;
      this.scene = null;
      this.eventHandlers = null;
      this.animations = null;
      this.transitions = null;
    } catch (error) {
      this.errorHandler(error, "destroy");
    }
  }
}

// Ethics Meter Component
export class EthicsMeter extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || OBJECT_CONSTANTS.METER_DEFAULT_WIDTH,
      height: options.height || OBJECT_CONSTANTS.METER_DEFAULT_HEIGHT,
      ariaRole: "progressbar",
      interactive: false,
    });

    this.category = options.category || "ethics";
    this.value = options.value || OBJECT_CONSTANTS.METER_DEFAULT_VALUE;
    this.minValue = options.minValue || 0;
    this.maxValue = options.maxValue || OBJECT_CONSTANTS.METER_DEFAULT_MAX;
    this.label =
      options.label ||
      this.category.charAt(0).toUpperCase() + this.category.slice(1);
    this.showValue = options.showValue !== false;
    this.showLabel = options.showLabel !== false;
    this.animated = options.animated !== false;

    // Visual styling
    this.colors = {
      excellent: options.colors?.excellent || "#4CAF50",
      good: options.colors?.good || "#8BC34A",
      fair: options.colors?.fair || "#FFC107",
      poor: options.colors?.poor || "#FF9800",
      critical: options.colors?.critical || "#F44336",
      background: options.colors?.background || "#E0E0E0",
      text: options.colors?.text || "#333333",
    };

    this.thresholds = {
      excellent:
        options.thresholds?.excellent ||
        OBJECT_CONSTANTS.SCORE_THRESHOLD_EXCELLENT,
      good: options.thresholds?.good || OBJECT_CONSTANTS.SCORE_THRESHOLD_GOOD,
      fair: options.thresholds?.fair || OBJECT_CONSTANTS.SCORE_THRESHOLD_FAIR,
      poor: options.thresholds?.poor || OBJECT_CONSTANTS.SCORE_THRESHOLD_POOR,
    };

    // Animation state
    this.displayValue = this.value;
    this.targetValue = this.value;

    // Accessibility
    this.ariaLabel = `${this.label} ethics score: ${this.value} out of ${this.maxValue}`;
  }

  updateScore(newValue, reason = "") {
    const clampedValue = Math.max(
      this.minValue,
      Math.min(this.maxValue, newValue),
    );

    if (this.animated) {
      this.targetValue = clampedValue;
      this.animateToTarget();
    } else {
      this.setValue(clampedValue);
    }

    this.emit("scoreUpdate", {
      oldValue: this.value,
      newValue: clampedValue,
      reason,
      category: this.category,
    });
  }

  setValue(value) {
    this.value = value;
    this.displayValue = value;
    this.updateAccessibility();
  }

  animateToTarget() {
    if (
      Math.abs(this.displayValue - this.targetValue) <
      OBJECT_CONSTANTS.ANIMATION_PRECISION
    ) {
      this.setValue(this.targetValue);
      return;
    }

    const diff = this.targetValue - this.displayValue;
    this.displayValue += diff * OBJECT_CONSTANTS.ANIMATION_PRECISION;

    requestAnimationFrame(() => this.animateToTarget());
  }

  updateAccessibility() {
    this.ariaLabel = `${this.label} ethics score: ${Math.round(this.displayValue)} out of ${this.maxValue}`;
  }

  getScoreColor() {
    const value = this.displayValue;
    if (value >= this.thresholds.excellent) return this.colors.excellent;
    if (value >= this.thresholds.good) return this.colors.good;
    if (value >= this.thresholds.fair) return this.colors.fair;
    if (value >= this.thresholds.poor) return this.colors.poor;
    return this.colors.critical;
  }

  getScoreLabel() {
    const value = this.displayValue;
    if (value >= this.thresholds.excellent) return "Excellent";
    if (value >= this.thresholds.good) return "Good";
    if (value >= this.thresholds.fair) return "Fair";
    if (value >= this.thresholds.poor) return "Poor";
    return "Critical";
  }

  renderSelf(renderer) {
    const percentage =
      (this.displayValue - this.minValue) / (this.maxValue - this.minValue);
    const fillWidth = this.width * percentage;

    if (renderer.type === "canvas") {
      // Background track
      renderer.fillStyle = this.colors.background;
      renderer.fillRect(
        0,
        this.height * OBJECT_CONSTANTS.METER_TRACK_Y_RATIO,
        this.width,
        this.height * OBJECT_CONSTANTS.METER_TRACK_HEIGHT_RATIO,
      );

      // Progress fill
      renderer.fillStyle = this.getScoreColor();
      renderer.fillRect(
        0,
        this.height * OBJECT_CONSTANTS.METER_TRACK_Y_RATIO,
        fillWidth,
        this.height * OBJECT_CONSTANTS.METER_TRACK_HEIGHT_RATIO,
      );

      // Focus ring
      if (this.isFocused) {
        renderer.strokeStyle = "#2196F3";
        renderer.lineWidth = OBJECT_CONSTANTS.BORDER_WIDTH;
        renderer.strokeRect(
          -OBJECT_CONSTANTS.FOCUS_RING_OFFSET,
          this.height * OBJECT_CONSTANTS.METER_TRACK_Y_RATIO -
            OBJECT_CONSTANTS.FOCUS_RING_OFFSET,
          this.width + OBJECT_CONSTANTS.FOCUS_RING_BUTTON_OFFSET,
          this.height * OBJECT_CONSTANTS.METER_TRACK_HEIGHT_RATIO +
            OBJECT_CONSTANTS.FOCUS_RING_BUTTON_OFFSET,
        );
      }

      // Label
      if (this.showLabel) {
        renderer.fillStyle = this.colors.text;
        renderer.font = "14px Arial";
        renderer.textAlign = "left";
        renderer.fillText(
          this.label,
          0,
          this.height * OBJECT_CONSTANTS.METER_LABEL_Y_RATIO,
        );
      }

      // Value display
      if (this.showValue) {
        renderer.fillStyle = this.colors.text;
        renderer.font = "12px Arial";
        renderer.textAlign = "right";
        const valueText = `${Math.round(this.displayValue)}/${this.maxValue}`;
        renderer.fillText(
          valueText,
          this.width,
          this.height * OBJECT_CONSTANTS.METER_LABEL_Y_RATIO,
        );

        // Score label
        renderer.font = "10px Arial";
        renderer.fillText(
          this.getScoreLabel(),
          this.width,
          this.height * OBJECT_CONSTANTS.METER_VALUE_LABEL_Y_RATIO,
        );
      }
    }
  }
}

// Enhanced Button Component
export class InteractiveButton extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || OBJECT_CONSTANTS.BUTTON_DEFAULT_WIDTH,
      height: options.height || OBJECT_CONSTANTS.BUTTON_DEFAULT_HEIGHT,
      ariaRole: "button",
    });

    this.text = options.text || "Button";
    this.icon = options.icon || null;
    this.variant = options.variant || "primary";
    this.size = options.size || "medium";

    // Visual states
    this.colors = this.getColorScheme();
    this.currentColor = this.colors.normal;

    // Button state
    this.isLoading = false;
    this.loadingText = options.loadingText || "Loading...";

    // Ripple effect
    this.ripples = [];

    this.setupEventHandlers();
  }

  getColorScheme() {
    const schemes = {
      primary: {
        normal: { bg: "#2196F3", text: "#FFFFFF", border: "#2196F3" },
        hover: { bg: "#1976D2", text: "#FFFFFF", border: "#1976D2" },
        pressed: { bg: "#0D47A1", text: "#FFFFFF", border: "#0D47A1" },
        disabled: { bg: "#CCCCCC", text: "#666666", border: "#CCCCCC" },
      },
      secondary: {
        normal: { bg: "#757575", text: "#FFFFFF", border: "#757575" },
        hover: { bg: "#616161", text: "#FFFFFF", border: "#616161" },
        pressed: { bg: "#424242", text: "#FFFFFF", border: "#424242" },
        disabled: { bg: "#CCCCCC", text: "#666666", border: "#CCCCCC" },
      },
      outline: {
        normal: { bg: "transparent", text: "#2196F3", border: "#2196F3" },
        hover: { bg: "#E3F2FD", text: "#1976D2", border: "#1976D2" },
        pressed: { bg: "#BBDEFB", text: "#0D47A1", border: "#0D47A1" },
        disabled: { bg: "transparent", text: "#CCCCCC", border: "#CCCCCC" },
      },
    };

    return schemes[this.variant] || schemes.primary;
  }

  setupEventHandlers() {
    this.on("hover", () => {
      if (!this.isDisabled && !this.isPressed) {
        this.currentColor = this.colors.hover;
        this.animate(
          "scaleX",
          OBJECT_CONSTANTS.BUTTON_HOVER_SCALE,
          OBJECT_CONSTANTS.BUTTON_SCALE_DURATION,
        );
        this.animate(
          "scaleY",
          OBJECT_CONSTANTS.BUTTON_HOVER_SCALE,
          OBJECT_CONSTANTS.BUTTON_SCALE_DURATION,
        );
      }
    });

    this.on("hoverEnd", () => {
      if (!this.isDisabled && !this.isPressed) {
        this.currentColor = this.colors.normal;
        this.animate("scaleX", 1, OBJECT_CONSTANTS.BUTTON_SCALE_DURATION);
        this.animate("scaleY", 1, OBJECT_CONSTANTS.BUTTON_SCALE_DURATION);
      }
    });

    this.on("mouseDown", (event) => {
      if (!this.isDisabled) {
        this.isPressed = true;
        this.currentColor = this.colors.pressed;
        this.createRipple(event.localX, event.localY);
      }
    });

    this.on("mouseUp", () => {
      if (!this.isDisabled) {
        this.isPressed = false;
        this.currentColor = this.isHovered
          ? this.colors.hover
          : this.colors.normal;
      }
    });

    this.on("keyDown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && !this.isDisabled) {
        event.preventDefault();
        this.handleClick();
      }
    });
  }

  createRipple(x, y) {
    const ripple = {
      x: x || this.width / 2,
      y: y || this.height / 2,
      radius: 0,
      maxRadius: Math.max(this.width, this.height),
      alpha: OBJECT_CONSTANTS.RIPPLE_ALPHA,
      startTime: performance.now(),
    };

    this.ripples.push(ripple);

    setTimeout(() => {
      const index = this.ripples.indexOf(ripple);
      if (index > -1) {
        this.ripples.splice(index, 1);
      }
    }, OBJECT_CONSTANTS.RIPPLE_DURATION);
  }

  handleClick() {
    if (!this.isDisabled && !this.isLoading) {
      this.emit("click", { button: this });
    }
  }

  setLoading(loading, text = null) {
    this.isLoading = loading;
    if (text) this.loadingText = text;
    this.isDisabled = loading;
  }

  updateRipples() {
    const currentTime = performance.now();
    this.ripples.forEach((ripple) => {
      const elapsed = currentTime - ripple.startTime;
      const progress = Math.min(elapsed / OBJECT_CONSTANTS.RIPPLE_DURATION, 1);

      ripple.radius = ripple.maxRadius * progress;
      ripple.alpha = OBJECT_CONSTANTS.RIPPLE_ALPHA * (1 - progress);
    });
  }

  renderSelf(renderer) {
    if (renderer.type !== "canvas") return;

    this.updateRipples();

    const color = this.isDisabled ? this.colors.disabled : this.currentColor;

    // Button background
    if (color.bg !== "transparent") {
      renderer.fillStyle = color.bg;
      renderer.fillRect(0, 0, this.width, this.height);
    }

    // Button border
    if (color.border) {
      renderer.strokeStyle = color.border;
      renderer.lineWidth = OBJECT_CONSTANTS.BORDER_WIDTH;
      renderer.strokeRect(0, 0, this.width, this.height);
    }

    // Ripple effects
    this.ripples.forEach((ripple) => {
      renderer.save();
      renderer.globalAlpha = ripple.alpha;
      renderer.fillStyle = "#FFFFFF";
      renderer.beginPath();
      renderer.arc(
        ripple.x,
        ripple.y,
        ripple.radius,
        0,
        Math.PI * OBJECT_CONSTANTS.LOADING_SPINNER_SPEED,
      );
      renderer.fill();
      renderer.restore();
    });

    // Focus ring
    if (this.isFocused) {
      renderer.strokeStyle = "#FF9800";
      renderer.lineWidth = OBJECT_CONSTANTS.THICK_BORDER_WIDTH;
      renderer.strokeRect(
        -OBJECT_CONSTANTS.FOCUS_RING_OFFSET,
        -OBJECT_CONSTANTS.FOCUS_RING_OFFSET,
        this.width + OBJECT_CONSTANTS.FOCUS_RING_BUTTON_OFFSET,
        this.height + OBJECT_CONSTANTS.FOCUS_RING_BUTTON_OFFSET,
      );
    }

    // Button text
    const displayText = this.isLoading ? this.loadingText : this.text;
    renderer.fillStyle = color.text;
    renderer.font = this.getFontSize();
    renderer.textAlign = "center";
    renderer.textBaseline = "middle";

    const textX = this.width / 2;
    const textY = this.height / 2;

    // Loading spinner
    if (this.isLoading) {
      this.renderLoadingSpinner(
        renderer,
        textX - OBJECT_CONSTANTS.BUTTON_SPINNER_OFFSET,
        textY,
      );
      renderer.fillText(
        displayText,
        textX + OBJECT_CONSTANTS.BUTTON_TEXT_OFFSET,
        textY,
      );
    } else {
      renderer.fillText(displayText, textX, textY);
    }
  }

  getFontSize() {
    const sizes = {
      small: "12px Arial",
      medium: "14px Arial",
      large: "16px Arial",
    };
    return sizes[this.size] || sizes.medium;
  }

  renderLoadingSpinner(renderer, x, y) {
    const time = performance.now() / 1000;
    const rotation = time * Math.PI * OBJECT_CONSTANTS.LOADING_SPINNER_SPEED;

    renderer.save();
    renderer.translate(x, y);
    renderer.rotate(rotation);

    renderer.strokeStyle = this.currentColor.text;
    renderer.lineWidth = OBJECT_CONSTANTS.SPINNER_LINE_WIDTH;
    renderer.beginPath();
    renderer.arc(
      0,
      0,
      OBJECT_CONSTANTS.SPINNER_RADIUS,
      0,
      Math.PI * OBJECT_CONSTANTS.LOADING_SPINNER_ARC,
    );
    renderer.stroke();

    renderer.restore();
  }
}

// Enhanced Slider Component
export class InteractiveSlider extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || OBJECT_CONSTANTS.SLIDER_DEFAULT_WIDTH,
      height: options.height || OBJECT_CONSTANTS.SLIDER_DEFAULT_HEIGHT,
      ariaRole: "slider",
      draggable: true,
    });

    this.min = options.min || 0;
    this.max = options.max || OBJECT_CONSTANTS.SLIDER_DEFAULT_MAX;
    this.value = Math.max(
      this.min,
      Math.min(
        this.max,
        options.value || OBJECT_CONSTANTS.SLIDER_DEFAULT_VALUE,
      ),
    );
    this.step = options.step || OBJECT_CONSTANTS.SLIDER_DEFAULT_STEP;
    this.label = options.label || "";
    this.unit = options.unit || "";

    // Visual properties
    this.trackHeight =
      options.trackHeight || OBJECT_CONSTANTS.SLIDER_DEFAULT_TRACK_HEIGHT;
    this.handleSize =
      options.handleSize || OBJECT_CONSTANTS.SLIDER_DEFAULT_HANDLE_SIZE;
    this.showValue = options.showValue !== false;
    this.showLabel = options.showLabel !== false;

    // Colors
    this.colors = {
      track: options.colors?.track || "#E0E0E0",
      fill: options.colors?.fill || "#2196F3",
      handle: options.colors?.handle || "#FFFFFF",
      handleBorder: options.colors?.handleBorder || "#2196F3",
      text: options.colors?.text || "#333333",
    };

    // State
    this.isDraggingHandle = false;
    this.dragOffset = 0;
    this.hoverHandle = false;

    this.setupEventHandlers();
    this.updateAccessibility();
  }

  setupEventHandlers() {
    this.on("mouseDown", (event) => {
      const handleX = this.getHandlePosition();
      const clickX = event.localX;

      if (Math.abs(clickX - handleX) <= this.handleSize / 2) {
        this.isDraggingHandle = true;
        this.dragOffset = clickX - handleX;
        this.emit("dragStart", { value: this.value });
      } else {
        this.jumpToPosition(clickX);
      }
    });

    this.on("hover", (event) => {
      const handleX = this.getHandlePosition();
      this.hoverHandle =
        Math.abs(event.localX - handleX) <= this.handleSize / 2;
    });

    this.on("keyDown", (event) => {
      let newValue = this.value;

      switch (event.key) {
        case "ArrowLeft":
        case "ArrowDown":
          newValue = Math.max(this.min, this.value - this.step);
          break;
        case "ArrowRight":
        case "ArrowUp":
          newValue = Math.min(this.max, this.value + this.step);
          break;
        case "Home":
          newValue = this.min;
          break;
        case "End":
          newValue = this.max;
          break;
        default:
          return;
      }

      if (newValue !== this.value) {
        event.preventDefault();
        this.setValue(newValue, true);
      }
    });
  }

  jumpToPosition(x) {
    const trackStart = this.handleSize / 2;
    const trackWidth = this.width - this.handleSize;
    const percentage = Math.max(0, Math.min(1, (x - trackStart) / trackWidth));
    const newValue = this.min + (this.max - this.min) * percentage;
    this.setValue(this.snapToStep(newValue), true);
  }

  snapToStep(value) {
    return Math.round((value - this.min) / this.step) * this.step + this.min;
  }

  setValue(newValue, emitChange = false) {
    const clampedValue = Math.max(this.min, Math.min(this.max, newValue));
    const oldValue = this.value;

    this.value = clampedValue;
    this.updateAccessibility();

    if (emitChange && oldValue !== clampedValue) {
      this.emit("change", {
        oldValue,
        newValue: clampedValue,
        percentage: (clampedValue - this.min) / (this.max - this.min),
      });
    }
  }

  updateAccessibility() {
    const percentage = Math.round(
      ((this.value - this.min) / (this.max - this.min)) * 100,
    );
    this.ariaLabel = `${this.label || "Slider"}: ${this.value}${this.unit} (${percentage}%)`;
  }

  getHandlePosition() {
    const trackStart = this.handleSize / 2;
    const trackWidth = this.width - this.handleSize;
    const percentage = (this.value - this.min) / (this.max - this.min);
    return trackStart + trackWidth * percentage;
  }

  renderSelf(renderer) {
    if (renderer.type !== "canvas") return;

    const trackY = this.height / 2 - this.trackHeight / 2;
    const handleX = this.getHandlePosition();
    const handleY = this.height / 2;

    // Label
    if (this.showLabel && this.label) {
      renderer.fillStyle = this.colors.text;
      renderer.font = "12px Arial";
      renderer.textAlign = "left";
      renderer.fillText(this.label, 0, OBJECT_CONSTANTS.SLIDER_LABEL_Y_OFFSET);
    }

    // Track background
    renderer.fillStyle = this.colors.track;
    renderer.fillRect(
      this.handleSize / 2,
      trackY,
      this.width - this.handleSize,
      this.trackHeight,
    );

    // Track fill
    const fillWidth = handleX - this.handleSize / 2;
    renderer.fillStyle = this.colors.fill;
    renderer.fillRect(this.handleSize / 2, trackY, fillWidth, this.trackHeight);

    // Handle
    renderer.fillStyle = this.colors.handle;
    renderer.beginPath();
    renderer.arc(handleX, handleY, this.handleSize / 2, 0, Math.PI * 2);
    renderer.fill();

    // Handle border
    renderer.strokeStyle = this.colors.handleBorder;
    renderer.lineWidth =
      this.hoverHandle || this.isDraggingHandle
        ? OBJECT_CONSTANTS.THICK_BORDER_WIDTH
        : OBJECT_CONSTANTS.BORDER_WIDTH;
    renderer.stroke();

    // Focus ring
    if (this.isFocused) {
      renderer.strokeStyle = "#FF9800";
      renderer.lineWidth = OBJECT_CONSTANTS.BORDER_WIDTH;
      renderer.beginPath();
      renderer.arc(
        handleX,
        handleY,
        this.handleSize / 2 + OBJECT_CONSTANTS.FOCUS_RING_EXTRA,
        0,
        Math.PI * OBJECT_CONSTANTS.LOADING_SPINNER_SPEED,
      );
      renderer.stroke();
    }

    // Value display
    if (this.showValue) {
      renderer.fillStyle = this.colors.text;
      renderer.font = "11px Arial";
      renderer.textAlign = "center";
      const valueText = `${Math.round(this.value)}${this.unit}`;
      renderer.fillText(
        valueText,
        handleX,
        this.height + OBJECT_CONSTANTS.SLIDER_VALUE_Y_OFFSET,
      );
    }
  }
}

// Enhanced Scene Management
export class Scene extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      interactive: false,
    });

    this.camera = {
      x: 0,
      y: 0,
      zoom: 1,
    };

    this.layers = new Map();
    this.defaultLayer = "default";

    // Performance monitoring
    this.frameCount = 0;
    this.lastFrameTime = 0;
    this.fps = 0;
    this.fpsUpdateInterval = OBJECT_CONSTANTS.FPS_UPDATE_INTERVAL;
    this.lastFpsUpdate = 0;
  }

  addToLayer(object, layerName = this.defaultLayer) {
    if (!this.layers.has(layerName)) {
      this.layers.set(layerName, []);
    }
    this.layers.get(layerName).push(object);
    object.scene = this;
  }

  removeFromLayer(object, layerName = this.defaultLayer) {
    if (this.layers.has(layerName)) {
      const layer = this.layers.get(layerName);
      const index = layer.indexOf(object);
      if (index > -1) {
        layer.splice(index, 1);
        object.scene = null;
      }
    }
  }

  render(renderer) {
    const currentTime = performance.now();

    // Update FPS
    this.frameCount++;
    if (currentTime - this.lastFpsUpdate >= this.fpsUpdateInterval) {
      this.fps = this.frameCount;
      this.frameCount = 0;
      this.lastFpsUpdate = currentTime;
    }

    renderer.save();

    // Apply camera transform
    renderer.translate(-this.camera.x, -this.camera.y);
    renderer.scale(this.camera.zoom, this.camera.zoom);

    // Render layers in order
    for (const [, objects] of this.layers) {
      objects.forEach((object) => {
        if (object.render) {
          object.render(renderer);
        }
      });
    }

    renderer.restore();

    this.lastFrameTime = currentTime;
  }
}

// Export utility functions and classes
export {
  animationManager,
  EasingFunctions,
  clamp,
  lerp,
  validateNumber,
  validateString,
  TOUCH_TARGET_SIZE,
  FOCUS_RING_WIDTH,
  DEFAULT_ANIMATION_DURATION,
  DEFAULT_EASING,
};
