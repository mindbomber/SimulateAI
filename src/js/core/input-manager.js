/**
 * @fileoverview Advanced Input Manager for SimulateAI Platform
 * Provides comprehensive input handling with accessibility, theme support, and performance monitoring
 * @version 2.0.0
 * @author SimulateAI Development Team
 * @since 2025
 */

import logger from '../utils/logger.js';

// Configuration Constants
const INPUT_CONFIG = {
  // Performance settings
  PERFORMANCE_MONITOR_INTERVAL: 1000,
  MAX_EVENT_HISTORY: 100,
  THROTTLE_INTERVAL: 16, // ~60fps
  MAX_LOG_ENTRIES: 50,

  // Gesture thresholds
  GESTURE_THRESHOLDS: {
    TAP_TIMEOUT: 300,
    TAP_MAX_DISTANCE: 10,
    PAN_MIN_DISTANCE: 10,
    PINCH_MIN_DISTANCE: 20,
    LONG_PRESS_DURATION: 500,
    DOUBLE_TAP_INTERVAL: 300,
  },

  // Touch settings
  TOUCH_SETTINGS: {
    DEFAULT_RADIUS: 20,
    DEFAULT_FORCE: 1,
    MAX_TOUCHES: 10,
    PASSIVE_EVENTS: false,
  },

  // Keyboard settings
  KEYBOARD_SETTINGS: {
    REPEAT_DELAY: 500,
    REPEAT_RATE: 50,
    GLOBAL_SHORTCUTS: ['F1', 'F11', 'F12', 'Tab', 'Escape'],
    ACCESSIBILITY_KEYS: [
      'Tab',
      'Enter',
      'Space',
      'ArrowUp',
      'ArrowDown',
      'ArrowLeft',
      'ArrowRight',
    ],
  },

  // Gamepad settings
  GAMEPAD_SETTINGS: {
    POLL_INTERVAL: 16,
    DEADZONE: 0.1,
    BUTTON_THRESHOLD: 0.5,
    VIBRATION_ENABLED: true,
  },

  // Accessibility settings
  ACCESSIBILITY: {
    FOCUS_VISIBLE_OUTLINE: '2px solid #0078d4',
    HIGH_CONTRAST_SUPPORT: true,
    REDUCED_MOTION_SUPPORT: true,
    SCREEN_READER_SUPPORT: true,
  },

  // Privacy settings
  PRIVACY: {
    ANONYMOUS_TRACKING: true,
    RESPECT_DNT: true,
    MINIMAL_DATA_COLLECTION: true,
  },
};

// Theme Constants
const INPUT_THEMES = {
  light: {
    focusColor: '#0078d4',
    hoverColor: '#106ebe',
    disabledColor: '#8a8886',
    backgroundColor: '#ffffff',
    textColor: '#323130',
  },
  dark: {
    focusColor: '#4cc2ff',
    hoverColor: '#0078d4',
    disabledColor: '#605e5c',
    backgroundColor: '#1f1f1f',
    textColor: '#ffffff',
  },
  highContrast: {
    focusColor: '#ffff00',
    hoverColor: '#ffffff',
    disabledColor: '#808080',
    backgroundColor: '#000000',
    textColor: '#ffffff',
  },
};

// Error Types
const INPUT_ERRORS = {
  INVALID_EVENT: 'INVALID_EVENT',
  HANDLER_ERROR: 'HANDLER_ERROR',
  GESTURE_ERROR: 'GESTURE_ERROR',
  GAMEPAD_ERROR: 'GAMEPAD_ERROR',
  ACCESSIBILITY_ERROR: 'ACCESSIBILITY_ERROR',
};

/**
 * Advanced Input Manager with comprehensive event handling, accessibility, and performance monitoring
 * @class InputManager
 */
export class InputManager {
  /**
   * Creates a new InputManager instance
   * @param {Object} engine - The engine instance
   * @param {Object} options - Configuration options
   */
  constructor(engine, options = {}) {
    // Validate required parameters
    if (!engine) {
      throw new Error('Engine instance is required for InputManager');
    }

    this.engine = engine;
    this.container = engine.container;
    this.renderer = engine.renderer;

    // Configuration
    this.config = {
      ...INPUT_CONFIG,
      ...options,
    };

    // Theme management
    this.currentTheme = options.theme || 'light';
    this.themeColors = INPUT_THEMES[this.currentTheme];

    // Initialize helper classes
    this.performanceMonitor = new InputPerformanceMonitor();
    this.accessibilityManager = new InputAccessibilityManager(this);
    this.errorHandler = new InputErrorHandler();
    this.privacyManager = new InputPrivacyManager(this.config.PRIVACY);
    this.inputValidator = new InputValidator();

    // Event throttling
    this.throttleTimers = new Map();
    this.eventHistory = [];

    // Enhanced input state tracking
    this.mouse = {
      x: 0,
      y: 0,
      down: false,
      button: -1,
      wheel: 0,
      velocity: { x: 0, y: 0 },
      lastUpdate: performance.now(),
      buttons: new Set(),
      hoveredElements: new Set(),
    };

    this.keyboard = {
      keys: new Set(),
      modifiers: {
        shift: false,
        ctrl: false,
        alt: false,
        meta: false,
      },
      composition: false,
      lastKeyTime: 0,
      repeatKeys: new Map(),
    };

    this.touch = {
      touches: new Map(),
      maxTouches: 0,
      gestures: {
        pinch: {
          active: false,
          scale: 1,
          startDistance: 0,
          center: { x: 0, y: 0 },
        },
        pan: { active: false, deltaX: 0, deltaY: 0, velocity: { x: 0, y: 0 } },
        tap: { active: false, startTime: 0, count: 0, lastTapTime: 0 },
        longPress: { active: false, startTime: 0, triggered: false },
        rotate: { active: false, angle: 0, startAngle: 0 },
      },
      history: [],
    };

    // Gamepad support
    this.gamepad = {
      controllers: new Map(),
      pollInterval: null,
      deadzone: this.config.GAMEPAD_SETTINGS.DEADZONE,
      buttonStates: new Map(),
      axisStates: new Map(),
    };

    // Event callbacks with priority system
    this.eventHandlers = new Map();
    this.eventPriorities = new Map();

    // Enhanced gesture settings
    this.gestureThreshold = {
      ...this.config.GESTURE_THRESHOLDS,
    };

    // Initialize subsystems
    this.init();
  }

  /**
   * Initialize the input manager and all subsystems
   */
  init() {
    try {
      this.setupMouseEvents();
      this.setupKeyboardEvents();
      this.setupTouchEvents();
      this.setupWheelEvents();
      this.setupGamepadEvents();
      this.setupAccessibilityFeatures();
      this.startPerformanceMonitoring();

      // Apply theme
      this.applyTheme(this.currentTheme);

      // Set up privacy compliance
      this.privacyManager.initialize();

      this.log('InputManager initialized successfully', 'info');
    } catch (error) {
      this.errorHandler.handleError(error, 'INITIALIZATION_ERROR');
      throw error;
    }
  }

  /**
   * Apply theme to input elements
   * @param {string} themeName - Theme name (light, dark, highContrast)
   */
  applyTheme(themeName) {
    if (!INPUT_THEMES[themeName]) {
      this.log(`Unknown theme: ${themeName}`, 'warn');
      return;
    }

    this.currentTheme = themeName;
    this.themeColors = INPUT_THEMES[themeName];

    // Apply theme-specific styles
    const element = this.renderer.getElement();
    if (element) {
      element.style.setProperty(
        '--input-focus-color',
        this.themeColors.focusColor
      );
      element.style.setProperty(
        '--input-hover-color',
        this.themeColors.hoverColor
      );
    }

    this.emit('themeChanged', { theme: themeName, colors: this.themeColors });
  }

  /**
   * Enhanced logging with context and performance
   * @param {string} message - Log message
   * @param {string} level - Log level
   * @param {Object} context - Additional context
   */
  log(message, level = 'info', context = {}) {
    if (!this.privacyManager.shouldLog()) return;

    const timestamp = new Date().toISOString();
    const logEntry = {
      timestamp,
      level,
      message,
      context,
      component: 'InputManager',
    };

    switch (level) {
      case 'error':
        logger.error(`[InputManager Error] ${message}`, context);
        break;
      case 'warn':
        logger.warn(`[InputManager Warning] ${message}`, context);
        break;
      case 'debug':
        logger.debug(`[InputManager Debug] ${message}`, context);
        break;
      default:
        logger.info(`[InputManager] ${message}`, context);
    }

    this.performanceMonitor.logEvent(logEntry);
  }

  /**
   * Throttle function for performance optimization
   * @param {Function} func - Function to throttle
   * @param {number} delay - Throttle delay in ms
   * @returns {Function} Throttled function
   */
  throttle(func, delay) {
    let timeoutId;
    let lastExecTime = 0;

    return (...args) => {
      const currentTime = performance.now();

      if (currentTime - lastExecTime > delay) {
        func.apply(this, args);
        lastExecTime = currentTime;
      } else {
        clearTimeout(timeoutId);
        timeoutId = setTimeout(
          () => {
            func.apply(this, args);
            lastExecTime = performance.now();
          },
          delay - (currentTime - lastExecTime)
        );
      }
    };
  }

  /**
   * Setup enhanced mouse events
   */
  setupMouseEvents() {
    const element = this.renderer.getElement();
    const options = { passive: false, capture: false };

    // Bind methods to preserve context
    this.boundMouseHandlers = {
      mousedown: this.handleMouseDown.bind(this),
      mousemove: this.throttle(
        this.handleMouseMove.bind(this),
        this.config.THROTTLE_INTERVAL
      ),
      mouseup: this.handleMouseUp.bind(this),
      mouseenter: this.handleMouseEnter.bind(this),
      mouseleave: this.handleMouseLeave.bind(this),
      contextmenu: this.handleContextMenu.bind(this),
    };

    // Add event listeners
    Object.entries(this.boundMouseHandlers).forEach(([event, handler]) => {
      element.addEventListener(event, handler, options);
    });
  }

  /**
   * Setup enhanced keyboard events
   */
  setupKeyboardEvents() {
    const options = { passive: false, capture: true };

    // Bind handlers
    this.boundKeyboardHandlers = {
      keydown: this.handleKeyDown.bind(this),
      keyup: this.handleKeyUp.bind(this),
    };

    // Use document for keyboard events to capture global shortcuts
    Object.entries(this.boundKeyboardHandlers).forEach(([event, handler]) => {
      document.addEventListener(event, handler, options);
    });
  }

  /**
   * Setup enhanced touch events
   */
  setupTouchEvents() {
    const element = this.renderer.getElement();
    const options = {
      passive: this.config.TOUCH_SETTINGS.PASSIVE_EVENTS,
      capture: false,
    };

    // Bind handlers
    this.boundTouchHandlers = {
      touchstart: this.handleTouchStart.bind(this),
      touchmove: this.throttle(
        this.handleTouchMove.bind(this),
        this.config.THROTTLE_INTERVAL
      ),
      touchend: this.handleTouchEnd.bind(this),
      touchcancel: this.handleTouchCancel.bind(this),
    };

    Object.entries(this.boundTouchHandlers).forEach(([event, handler]) => {
      element.addEventListener(event, handler, options);
    });
  }

  /**
   * Setup enhanced wheel events
   */
  setupWheelEvents() {
    const element = this.renderer.getElement();
    const options = { passive: false, capture: false };

    this.boundWheelHandler = this.throttle(
      this.handleWheel.bind(this),
      this.config.THROTTLE_INTERVAL
    );
    element.addEventListener('wheel', this.boundWheelHandler, options);
  }

  /**
   * Setup gamepad events
   */
  setupGamepadEvents() {
    window.addEventListener(
      'gamepadconnected',
      this.handleGamepadConnected.bind(this)
    );
    window.addEventListener(
      'gamepaddisconnected',
      this.handleGamepadDisconnected.bind(this)
    );

    // Start gamepad polling
    this.startGamepadPolling();
  }

  /**
   * Setup accessibility features
   */
  setupAccessibilityFeatures() {
    this.accessibilityManager.initialize();
    this.setupFocusManagement();
    this.setupAriaSupport();
  }

  /**
   * Start performance monitoring
   */
  startPerformanceMonitoring() {
    this.performanceMonitor.start(this.config.PERFORMANCE_MONITOR_INTERVAL);
  }

  /**
   * Setup focus management for accessibility
   */
  setupFocusManagement() {
    const element = this.renderer.getElement();

    // Make element focusable
    if (!element.hasAttribute('tabindex')) {
      element.setAttribute('tabindex', '0');
    }

    // Add focus/blur handlers
    element.addEventListener('focus', this.handleFocus.bind(this));
    element.addEventListener('blur', this.handleBlur.bind(this));
  }

  /**
   * Setup ARIA support for screen readers
   */
  setupAriaSupport() {
    const element = this.renderer.getElement();

    element.setAttribute('role', 'application');
    element.setAttribute('aria-label', 'Interactive simulation canvas');
  }

  /**
   * Start gamepad polling
   */
  startGamepadPolling() {
    if (this.gamepad.pollInterval) return;

    this.gamepad.pollInterval = setInterval(() => {
      this.pollGamepads();
    }, this.config.GAMEPAD_SETTINGS.POLL_INTERVAL);
  }

  /**
   * Poll connected gamepads for state changes
   */
  pollGamepads() {
    const gamepads = navigator.getGamepads();

    for (let i = 0; i < gamepads.length; i++) {
      const gamepad = gamepads[i];
      if (!gamepad) continue;

      this.processGamepadState(gamepad);
    }
  }

  /**
   * Process gamepad state and emit events
   * @param {Gamepad} gamepad - Gamepad object
   */
  processGamepadState(gamepad) {
    const { id } = gamepad;
    const prevState = this.gamepad.controllers.get(id) || {};

    // Process buttons
    gamepad.buttons.forEach((button, index) => {
      const wasPressed = prevState.buttons?.[index]?.pressed || false;
      const isPressed =
        button.pressed ||
        button.value > this.config.GAMEPAD_SETTINGS.BUTTON_THRESHOLD;

      if (isPressed !== wasPressed) {
        this.emit(isPressed ? 'gamepadbuttondown' : 'gamepadbuttonup', {
          gamepadId: id,
          button: index,
          value: button.value,
        });
      }
    });

    // Store current state
    this.gamepad.controllers.set(id, {
      buttons: gamepad.buttons.map(b => ({
        pressed: b.pressed,
        value: b.value,
      })),
      axes: [...gamepad.axes],
    });
  }

  // ==================== EVENT HANDLERS ====================

  /**
   * Enhanced mouse down handler with validation and accessibility
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseDown(event) {
    try {
      const coords = this.getEventCoordinates(event);
      const now = performance.now();

      // Update mouse state
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
      this.mouse.down = true;
      this.mouse.button = event.button;
      this.mouse.buttons.add(event.button);
      this.mouse.lastUpdate = now;

      this.updateKeyboardModifiers(event);

      const inputEvent = {
        type: 'mousedown',
        x: coords.x,
        y: coords.y,
        button: event.button,
        buttons: Array.from(this.mouse.buttons),
        timestamp: now,
        originalEvent: event,
        ...this.keyboard.modifiers,
      };

      this.performanceMonitor.recordEvent('mousedown', now);
      this.emit('mousedown', inputEvent);
      this.notifyScene('mousedown', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced mouse move handler
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseMove(event) {
    try {
      const coords = this.getEventCoordinates(event);
      const now = performance.now();

      // Calculate velocity
      const deltaTime = now - this.mouse.lastUpdate;
      const deltaX = coords.x - this.mouse.x;
      const deltaY = coords.y - this.mouse.y;

      this.mouse.velocity.x = deltaTime > 0 ? deltaX / deltaTime : 0;
      this.mouse.velocity.y = deltaTime > 0 ? deltaY / deltaTime : 0;

      // Update mouse state
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
      this.mouse.lastUpdate = now;

      this.updateKeyboardModifiers(event);

      const inputEvent = {
        type: 'mousemove',
        x: coords.x,
        y: coords.y,
        deltaX,
        deltaY,
        velocity: { ...this.mouse.velocity },
        button: this.mouse.button,
        down: this.mouse.down,
        timestamp: now,
        originalEvent: event,
        ...this.keyboard.modifiers,
      };

      this.performanceMonitor.recordEvent('mousemove', now);
      this.emit('mousemove', inputEvent);
      this.notifyScene('mousemove', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced mouse up handler
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseUp(event) {
    try {
      const coords = this.getEventCoordinates(event);
      const now = performance.now();

      // Update mouse state
      this.mouse.x = coords.x;
      this.mouse.y = coords.y;
      this.mouse.down = false;
      this.mouse.buttons.delete(event.button);
      this.mouse.lastUpdate = now;

      this.updateKeyboardModifiers(event);

      const inputEvent = {
        type: 'mouseup',
        x: coords.x,
        y: coords.y,
        button: event.button,
        buttons: Array.from(this.mouse.buttons),
        timestamp: now,
        originalEvent: event,
        ...this.keyboard.modifiers,
      };

      this.performanceMonitor.recordEvent('mouseup', now);
      this.emit('mouseup', inputEvent);
      this.notifyScene('mouseup', inputEvent);

      // Reset button if no buttons are pressed
      if (this.mouse.buttons.size === 0) {
        this.mouse.button = -1;
      }
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced mouse enter handler
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseEnter(event) {
    try {
      const inputEvent = {
        type: 'mouseenter',
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('mouseenter', inputEvent);
      this.performanceMonitor.recordEvent('mouseenter');
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced mouse leave handler with state cleanup
   * @param {MouseEvent} event - Mouse event
   */
  handleMouseLeave(event) {
    try {
      // Clean up mouse state
      this.mouse.down = false;
      this.mouse.buttons.clear();
      this.mouse.button = -1;

      const inputEvent = {
        type: 'mouseleave',
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('mouseleave', inputEvent);
      this.performanceMonitor.recordEvent('mouseleave');
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced context menu handler
   * @param {MouseEvent} event - Mouse event
   */
  handleContextMenu(event) {
    try {
      // Prevent default context menu
      event.preventDefault();

      const coords = this.getEventCoordinates(event);
      const inputEvent = {
        type: 'contextmenu',
        x: coords.x,
        y: coords.y,
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('contextmenu', inputEvent);
      this.performanceMonitor.recordEvent('contextmenu');
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced keyboard down handler
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyDown(event) {
    try {
      // Only handle if container has focus or event is global
      if (
        !this.container.contains(document.activeElement) &&
        !this.isGlobalShortcut(event)
      ) {
        return;
      }

      const now = performance.now();

      // Add to pressed keys
      this.keyboard.keys.add(event.code);
      this.updateKeyboardModifiers(event);

      const inputEvent = {
        type: 'keydown',
        key: event.key,
        code: event.code,
        repeat: event.repeat,
        timestamp: now,
        originalEvent: event,
        ...this.keyboard.modifiers,
      };

      this.performanceMonitor.recordEvent('keydown', now);
      this.emit('keydown', inputEvent);
      this.notifyScene('keydown', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced keyboard up handler
   * @param {KeyboardEvent} event - Keyboard event
   */
  handleKeyUp(event) {
    try {
      const now = performance.now();

      // Remove from pressed keys
      this.keyboard.keys.delete(event.code);
      this.updateKeyboardModifiers(event);

      const inputEvent = {
        type: 'keyup',
        key: event.key,
        code: event.code,
        timestamp: now,
        originalEvent: event,
        ...this.keyboard.modifiers,
      };

      this.performanceMonitor.recordEvent('keyup', now);
      this.emit('keyup', inputEvent);
      this.notifyScene('keyup', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced touch start handler
   * @param {TouchEvent} event - Touch event
   */
  handleTouchStart(event) {
    try {
      event.preventDefault();

      const touches = this.processTouches(event.touches);
      const now = performance.now();

      // Update touch state
      touches.forEach(touch => {
        this.touch.touches.set(touch.identifier, {
          ...touch,
          startTime: now,
          startX: touch.x,
          startY: touch.y,
        });
      });

      // Detect gestures
      this.detectGestures(touches);

      const inputEvent = {
        type: 'touchstart',
        touches,
        touchCount: this.touch.touches.size,
        timestamp: now,
        originalEvent: event,
      };

      this.performanceMonitor.recordEvent('touchstart', now);
      this.emit('touchstart', inputEvent);
      this.notifyScene('touchstart', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced touch move handler
   * @param {TouchEvent} event - Touch event
   */
  handleTouchMove(event) {
    try {
      event.preventDefault();

      const touches = this.processTouches(event.touches);
      const now = performance.now();

      // Update touch state
      touches.forEach(touch => {
        const existingTouch = this.touch.touches.get(touch.identifier);
        if (existingTouch) {
          this.touch.touches.set(touch.identifier, {
            ...touch,
            startTime: existingTouch.startTime,
            startX: existingTouch.startX,
            startY: existingTouch.startY,
          });
        }
      });

      // Update gestures
      this.updateGestures(touches);

      const inputEvent = {
        type: 'touchmove',
        touches,
        gestures: { ...this.touch.gestures },
        touchCount: this.touch.touches.size,
        timestamp: now,
        originalEvent: event,
      };

      this.performanceMonitor.recordEvent('touchmove', now);
      this.emit('touchmove', inputEvent);
      this.notifyScene('touchmove', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced touch end handler
   * @param {TouchEvent} event - Touch event
   */
  handleTouchEnd(event) {
    try {
      event.preventDefault();

      const touches = this.processTouches(event.changedTouches);
      const now = performance.now();

      // Remove ended touches
      touches.forEach(touch => {
        this.touch.touches.delete(touch.identifier);
      });

      // Finalize gestures
      this.finalizeGestures(touches);

      const inputEvent = {
        type: 'touchend',
        touches,
        gestures: { ...this.touch.gestures },
        touchCount: this.touch.touches.size,
        timestamp: now,
        originalEvent: event,
      };

      this.performanceMonitor.recordEvent('touchend', now);
      this.emit('touchend', inputEvent);
      this.notifyScene('touchend', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced touch cancel handler
   * @param {TouchEvent} event - Touch event
   */
  handleTouchCancel(event) {
    try {
      // Clear all touches and gestures
      this.touch.touches.clear();
      this.resetGestures();

      const inputEvent = {
        type: 'touchcancel',
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('touchcancel', inputEvent);
      this.performanceMonitor.recordEvent('touchcancel');
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Enhanced wheel handler
   * @param {WheelEvent} event - Wheel event
   */
  handleWheel(event) {
    try {
      event.preventDefault();

      const coords = this.getEventCoordinates(event);
      const now = performance.now();

      this.mouse.wheel = event.deltaY;

      const inputEvent = {
        type: 'wheel',
        x: coords.x,
        y: coords.y,
        deltaX: event.deltaX,
        deltaY: event.deltaY,
        deltaZ: event.deltaZ,
        timestamp: now,
        originalEvent: event,
      };

      this.performanceMonitor.recordEvent('wheel', now);
      this.emit('wheel', inputEvent);
      this.notifyScene('wheel', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR);
    }
  }

  /**
   * Focus handler for accessibility
   * @param {FocusEvent} event - Focus event
   */
  handleFocus(event) {
    try {
      this.accessibilityManager.onFocus(event);

      const inputEvent = {
        type: 'focus',
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('focus', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.ACCESSIBILITY_ERROR);
    }
  }

  /**
   * Blur handler for accessibility
   * @param {FocusEvent} event - Blur event
   */
  handleBlur(event) {
    try {
      this.accessibilityManager.onBlur(event);

      const inputEvent = {
        type: 'blur',
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('blur', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.ACCESSIBILITY_ERROR);
    }
  }

  /**
   * Gamepad connected handler
   * @param {GamepadEvent} event - Gamepad event
   */
  handleGamepadConnected(event) {
    try {
      const { gamepad } = event;
      this.gamepad.controllers.set(gamepad.id, {
        buttons: gamepad.buttons.map(b => ({
          pressed: b.pressed,
          value: b.value,
        })),
        axes: [...gamepad.axes],
      });

      this.log(`Gamepad connected: ${gamepad.id}`, 'info');

      const inputEvent = {
        type: 'gamepadconnected',
        gamepadId: gamepad.id,
        gamepad,
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('gamepadconnected', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.GAMEPAD_ERROR);
    }
  }

  /**
   * Gamepad disconnected handler
   * @param {GamepadEvent} event - Gamepad event
   */
  handleGamepadDisconnected(event) {
    try {
      const { gamepad } = event;
      this.gamepad.controllers.delete(gamepad.id);

      this.log(`Gamepad disconnected: ${gamepad.id}`, 'info');

      const inputEvent = {
        type: 'gamepaddisconnected',
        gamepadId: gamepad.id,
        timestamp: performance.now(),
        originalEvent: event,
      };

      this.emit('gamepaddisconnected', inputEvent);
    } catch (error) {
      this.errorHandler.handleError(error, INPUT_ERRORS.GAMEPAD_ERROR);
    }
  }

  // ==================== UTILITY METHODS ====================

  /**
   * Get event coordinates relative to the canvas
   * @param {Event} event - Event object
   * @returns {Object} Coordinates {x, y}
   */
  getEventCoordinates(event) {
    const rect = this.renderer.getElement().getBoundingClientRect();
    return {
      x: event.clientX - rect.left,
      y: event.clientY - rect.top,
    };
  }

  /**
   * Process touch list into normalized touch objects
   * @param {TouchList} touchList - Touch list
   * @returns {Array} Normalized touch objects
   */
  processTouches(touchList) {
    const rect = this.renderer.getElement().getBoundingClientRect();
    const touches = [];

    for (let i = 0; i < touchList.length; i++) {
      const touch = touchList[i];
      touches.push({
        identifier: touch.identifier,
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top,
        radiusX: touch.radiusX || this.config.TOUCH_SETTINGS.DEFAULT_RADIUS,
        radiusY: touch.radiusY || this.config.TOUCH_SETTINGS.DEFAULT_RADIUS,
        force: touch.force || this.config.TOUCH_SETTINGS.DEFAULT_FORCE,
      });
    }

    return touches;
  }

  /**
   * Update keyboard modifier state
   * @param {Event} event - Event object
   */
  updateKeyboardModifiers(event) {
    this.keyboard.modifiers.shift = event.shiftKey;
    this.keyboard.modifiers.ctrl = event.ctrlKey;
    this.keyboard.modifiers.alt = event.altKey;
    this.keyboard.modifiers.meta = event.metaKey;
  }

  /**
   * Check if event is a global shortcut
   * @param {KeyboardEvent} event - Keyboard event
   * @returns {boolean} Whether it's a global shortcut
   */
  isGlobalShortcut(event) {
    const globalShortcuts = this.config.KEYBOARD_SETTINGS.GLOBAL_SHORTCUTS;

    return (
      globalShortcuts.includes(event.key) ||
      (event.ctrlKey && ['?', 'h', 'H'].includes(event.key))
    );
  }

  // ==================== GESTURE DETECTION ====================

  /**
   * Detect gestures from touch input
   * @param {Array} touches - Touch objects
   */
  detectGestures(touches) {
    if (touches.length === 1) {
      // Single touch - potential tap
      this.touch.gestures.tap = {
        active: true,
        startTime: performance.now(),
        startX: touches[0].x,
        startY: touches[0].y,
      };
    } else if (touches.length === 2) {
      // Two touches - potential pinch
      const distance = this.getTouchDistance(touches[0], touches[1]);
      this.touch.gestures.pinch = {
        active: true,
        scale: 1,
        startDistance: distance,
        centerX: (touches[0].x + touches[1].x) / 2,
        centerY: (touches[0].y + touches[1].y) / 2,
      };
    }
  }

  /**
   * Update ongoing gestures
   * @param {Array} touches - Touch objects
   */
  updateGestures(touches) {
    // Update pinch gesture
    if (this.touch.gestures.pinch.active && touches.length === 2) {
      const distance = this.getTouchDistance(touches[0], touches[1]);
      const scale = distance / this.touch.gestures.pinch.startDistance;

      this.touch.gestures.pinch.scale = scale;
      this.touch.gestures.pinch.centerX = (touches[0].x + touches[1].x) / 2;
      this.touch.gestures.pinch.centerY = (touches[0].y + touches[1].y) / 2;

      // Emit pinch event
      this.emit('pinch', {
        scale,
        centerX: this.touch.gestures.pinch.centerX,
        centerY: this.touch.gestures.pinch.centerY,
      });
    }

    // Update pan gesture
    if (touches.length === 1 && this.touch.gestures.tap.active) {
      const deltaX = touches[0].x - this.touch.gestures.tap.startX;
      const deltaY = touches[0].y - this.touch.gestures.tap.startY;
      const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);

      if (distance > this.gestureThreshold.PAN_MIN_DISTANCE) {
        this.touch.gestures.tap.active = false;
        this.touch.gestures.pan = {
          active: true,
          deltaX,
          deltaY,
        };

        this.emit('panstart', {
          x: touches[0].x,
          y: touches[0].y,
          deltaX,
          deltaY,
        });
      }
    }
  }

  /**
   * Finalize gestures when touch ends
   * @param {Array} _touches - Touch objects (unused)
   */
  finalizeGestures(_touches) {
    // Check for tap completion
    if (this.touch.gestures.tap.active) {
      const elapsed = performance.now() - this.touch.gestures.tap.startTime;
      if (elapsed < this.gestureThreshold.TAP_TIMEOUT) {
        this.emit('tap', {
          x: this.touch.gestures.tap.startX,
          y: this.touch.gestures.tap.startY,
        });
      }
    }

    // Finalize pan gesture
    if (this.touch.gestures.pan.active) {
      this.emit('panend', {
        deltaX: this.touch.gestures.pan.deltaX,
        deltaY: this.touch.gestures.pan.deltaY,
      });
    }

    this.resetGestures();
  }

  /**
   * Reset all gesture states
   */
  resetGestures() {
    this.touch.gestures = {
      pinch: { active: false, scale: 1, startDistance: 0 },
      pan: { active: false, deltaX: 0, deltaY: 0 },
      tap: { active: false, startTime: 0 },
    };
  }

  /**
   * Calculate distance between two touches
   * @param {Object} touch1 - First touch
   * @param {Object} touch2 - Second touch
   * @returns {number} Distance
   */
  getTouchDistance(touch1, touch2) {
    const dx = touch1.x - touch2.x;
    const dy = touch1.y - touch2.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  // ==================== EVENT SYSTEM ====================

  /**
   * Register event handler
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  on(eventType, callback) {
    if (!this.eventHandlers.has(eventType)) {
      this.eventHandlers.set(eventType, new Set());
    }
    this.eventHandlers.get(eventType).add(callback);
  }

  /**
   * Unregister event handler
   * @param {string} eventType - Event type
   * @param {Function} callback - Callback function
   */
  off(eventType, callback) {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType).delete(callback);
    }
  }

  /**
   * Emit event to registered handlers
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   */
  emit(eventType, eventData) {
    if (this.eventHandlers.has(eventType)) {
      this.eventHandlers.get(eventType).forEach(callback => {
        try {
          callback(eventData);
        } catch (error) {
          this.errorHandler.handleError(error, INPUT_ERRORS.HANDLER_ERROR, {
            eventType,
          });
        }
      });
    }
  }

  /**
   * Notify scene of input event
   * @param {string} eventType - Event type
   * @param {Object} eventData - Event data
   */
  notifyScene(eventType, eventData) {
    if (this.engine.scene && this.engine.scene.handleInput) {
      this.engine.scene.handleInput(eventType, eventData);
    }
  }

  // ==================== QUERY METHODS ====================

  /**
   * Check if key is currently pressed
   * @param {string} keyCode - Key code
   * @returns {boolean} Whether key is pressed
   */
  isKeyPressed(keyCode) {
    return this.keyboard.keys.has(keyCode);
  }

  /**
   * Check if mouse is down
   * @returns {boolean} Whether mouse is down
   */
  isMouseDown() {
    return this.mouse.down;
  }

  /**
   * Get current mouse position
   * @returns {Object} Mouse position {x, y}
   */
  getMousePosition() {
    return { x: this.mouse.x, y: this.mouse.y };
  }

  /**
   * Get current touch count
   * @returns {number} Number of active touches
   */
  getTouchCount() {
    return this.touch.touches.size;
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return this.performanceMonitor.getMetrics();
  }

  // ==================== LIFECYCLE METHODS ====================

  /**
   * Update method (called by engine)
   * @param {number} _deltaTime - Time since last update (unused)
   */
  update(_deltaTime) {
    // Update any time-based input processing
    // Currently used for gesture timeouts and key repeat handling

    // Update performance monitoring
    this.performanceMonitor.update();

    // Update accessibility features
    this.accessibilityManager.update();
  }

  /**
   * Cleanup all event listeners and state
   */
  destroy() {
    try {
      const element = this.renderer.getElement();

      // Remove mouse event listeners
      if (this.boundMouseHandlers) {
        Object.entries(this.boundMouseHandlers).forEach(([event, handler]) => {
          element.removeEventListener(event, handler);
        });
      }

      // Remove keyboard event listeners
      if (this.boundKeyboardHandlers) {
        Object.entries(this.boundKeyboardHandlers).forEach(
          ([event, handler]) => {
            document.removeEventListener(event, handler);
          }
        );
      }

      // Remove touch event listeners
      if (this.boundTouchHandlers) {
        Object.entries(this.boundTouchHandlers).forEach(([event, handler]) => {
          element.removeEventListener(event, handler);
        });
      }

      // Remove wheel event listener
      if (this.boundWheelHandler) {
        element.removeEventListener('wheel', this.boundWheelHandler);
      }

      // Remove gamepad event listeners
      window.removeEventListener(
        'gamepadconnected',
        this.handleGamepadConnected
      );
      window.removeEventListener(
        'gamepaddisconnected',
        this.handleGamepadDisconnected
      );

      // Stop gamepad polling
      if (this.gamepad.pollInterval) {
        clearInterval(this.gamepad.pollInterval);
      }

      // Stop performance monitoring
      this.performanceMonitor.stop();

      // Clear state
      this.eventHandlers.clear();
      this.keyboard.keys.clear();
      this.keyboard.repeatKeys.clear();
      this.touch.touches.clear();
      this.gamepad.controllers.clear();
      this.eventHistory = [];

      this.log('InputManager destroyed', 'info');
    } catch (error) {
      this.errorHandler.handleError(error, 'DESTRUCTION_ERROR');
    }
  }
}

// ==================== HELPER CLASSES ====================

/**
 * Performance monitoring for input events
 */
class InputPerformanceMonitor {
  constructor() {
    this.events = new Map();
    this.metrics = {
      totalEvents: 0,
      averageResponseTime: 0,
      peakResponseTime: 0,
      eventCounts: new Map(),
    };
    this.isRunning = false;
    this.logEntries = [];
  }

  start(interval = 1000) {
    if (this.isRunning) return;

    this.isRunning = true;
    this.startTime = performance.now();

    this.monitorInterval = setInterval(() => {
      this.updateMetrics();
    }, interval);
  }

  stop() {
    if (!this.isRunning) return;

    this.isRunning = false;
    clearInterval(this.monitorInterval);
  }

  recordEvent(eventType, timestamp = performance.now()) {
    if (!this.events.has(eventType)) {
      this.events.set(eventType, []);
    }

    this.events.get(eventType).push(timestamp);
    this.metrics.totalEvents++;

    const count = this.metrics.eventCounts.get(eventType) || 0;
    this.metrics.eventCounts.set(eventType, count + 1);
  }

  updateMetrics() {
    const now = performance.now();
    const recentEvents = [];

    for (const [, timestamps] of this.events) {
      const recent = timestamps.filter(t => now - t < 1000);
      recentEvents.push(...recent);
    }

    if (recentEvents.length > 0) {
      const responseTime =
        recentEvents.reduce((sum, t) => sum + (now - t), 0) /
        recentEvents.length;
      this.metrics.averageResponseTime = responseTime;
      this.metrics.peakResponseTime = Math.max(
        this.metrics.peakResponseTime,
        responseTime
      );
    }
  }

  getMetrics() {
    return { ...this.metrics };
  }

  logEvent(logEntry) {
    this.logEntries.push(logEntry);

    if (this.logEntries.length > INPUT_CONFIG.MAX_EVENT_HISTORY) {
      this.logEntries = this.logEntries.slice(-INPUT_CONFIG.MAX_LOG_ENTRIES);
    }
  }

  update() {
    // Update performance metrics if needed
  }
}

/**
 * Accessibility manager for input events
 */
class InputAccessibilityManager {
  constructor(inputManager) {
    this.inputManager = inputManager;
    this.focusVisible = false;
    this.reducedMotion = false;
    this.highContrast = false;
    this.screenReader = false;
  }

  initialize() {
    this.detectAccessibilityPreferences();
    this.setupAccessibilityFeatures();
  }

  detectAccessibilityPreferences() {
    if (window.matchMedia) {
      const reducedMotionQuery = window.matchMedia(
        '(prefers-reduced-motion: reduce)'
      );
      this.reducedMotion = reducedMotionQuery.matches;

      const updateReducedMotion = e => {
        this.reducedMotion = e.matches;
        this.inputManager.emit('accessibilityChanged', {
          reducedMotion: this.reducedMotion,
        });
      };

      reducedMotionQuery.addListener(updateReducedMotion);

      const highContrastQuery = window.matchMedia('(prefers-contrast: high)');
      this.highContrast = highContrastQuery.matches;

      const updateHighContrast = e => {
        this.highContrast = e.matches;
        this.inputManager.emit('accessibilityChanged', {
          highContrast: this.highContrast,
        });
      };

      highContrastQuery.addListener(updateHighContrast);
    }

    this.screenReader = this.detectScreenReader();
  }

  detectScreenReader() {
    return (
      window.navigator.userAgent.includes('NVDA') ||
      window.navigator.userAgent.includes('JAWS') ||
      window.speechSynthesis ||
      window.navigator.userAgent.includes('VoiceOver')
    );
  }

  setupAccessibilityFeatures() {
    document.addEventListener('keydown', () => {
      this.focusVisible = true;
    });

    document.addEventListener('mousedown', () => {
      this.focusVisible = false;
    });
  }

  getEventAccessibilityData(_event) {
    return {
      focusVisible: this.focusVisible,
      reducedMotion: this.reducedMotion,
      highContrast: this.highContrast,
      screenReader: this.screenReader,
      keyboardNavigation: this.focusVisible,
    };
  }

  onFocus(event) {
    this.focusVisible = true;
    if (event.target) {
      event.target.setAttribute('data-focus-visible', 'true');
    }
  }

  onBlur(event) {
    if (event.target) {
      event.target.removeAttribute('data-focus-visible');
    }
  }

  update() {
    // Update accessibility features if needed
  }
}

/**
 * Error handler for input events
 */
class InputErrorHandler {
  constructor() {
    this.errors = [];
    this.maxErrors = 50;
  }

  handleError(error, type, context = {}) {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      type,
      message: error.message,
      stack: error.stack,
      context,
    };

    this.errors.push(errorEntry);

    if (this.errors.length > this.maxErrors) {
      this.errors = this.errors.slice(-this.maxErrors / 2);
    }

    if (type === INPUT_ERRORS.INVALID_EVENT) {
      logger.warn('[InputManager] Invalid event:', errorEntry);
    } else {
      logger.error('[InputManager] Error:', errorEntry);
    }
  }

  getErrors() {
    return [...this.errors];
  }

  clearErrors() {
    this.errors = [];
  }
}

/**
 * Privacy manager for input handling
 */
class InputPrivacyManager {
  constructor(config) {
    this.config = config;
    this.respectDNT = config.RESPECT_DNT;
    this.anonymousTracking = config.ANONYMOUS_TRACKING;
    this.minimalDataCollection = config.MINIMAL_DATA_COLLECTION;
  }

  initialize() {
    if (this.respectDNT && navigator.doNotTrack === '1') {
      this.anonymousTracking = false;
    }
  }

  shouldLog() {
    return !navigator.doNotTrack || !this.respectDNT;
  }

  sanitizeEventData(eventData) {
    if (!this.minimalDataCollection) return eventData;

    const sanitized = { ...eventData };
    delete sanitized.originalEvent;
    delete sanitized.element;

    return sanitized;
  }
}

/**
 * Input validator for event validation
 */
class InputValidator {
  validate(event, eventType) {
    if (!event) {
      throw new Error('Event is null or undefined');
    }

    if (!eventType) {
      throw new Error('Event type is required');
    }

    if (typeof event !== 'object') {
      throw new Error('Event must be an object');
    }

    switch (eventType) {
      case 'mousedown':
      case 'mouseup':
      case 'mousemove':
        return this.validateMouseEvent(event);
      case 'keydown':
      case 'keyup':
        return this.validateKeyboardEvent(event);
      case 'touchstart':
      case 'touchmove':
      case 'touchend':
        return this.validateTouchEvent(event);
      default:
        return true;
    }
  }

  validateMouseEvent(event) {
    return (
      typeof event.clientX === 'number' && typeof event.clientY === 'number'
    );
  }

  validateKeyboardEvent(event) {
    return typeof event.key === 'string' || typeof event.code === 'string';
  }

  validateTouchEvent(event) {
    return event.touches && typeof event.touches.length === 'number';
  }
}

export default InputManager;
