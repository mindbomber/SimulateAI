/**
 * NumberInput Component - Advanced Numeric Input with Accessibility
 *
 * A comprehensive numeric input component with:
 * - Step-based value control with increment/decrement
 * - Precision and range validation
 * - Keyboard shortcuts and wheel support
 * - Real-time editing with validation
 * - Custom prefix/suffix support
 * - Full ARIA accessibility
 * - Theme integration and animations
 * - Performance optimization
 *
 * Features:
 * - Spinner controls for value adjustment
 * - Direct text editing with validation
 * - Custom step, min, max, and precision
 * - Keyboard navigation (arrows, home, end, page up/down)
 * - Mouse wheel support for fine adjustments
 * - Screen reader announcements
 * - Error recovery and validation
 * - Memory management and cleanup
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import { BaseObject } from '../../objects/enhanced-objects.js';
import { INPUT_UTILITY_CONSTANTS } from './constants.js';
import { ComponentTheme } from './theme.js';

// Number input specific constants
const NUMBER_INPUT_REPEAT_INTERVAL = 100;
const NUMBER_INPUT_REPEAT_INITIAL_DELAY = 300;
const NUMBER_INPUT_CONTROL_WIDTH = 20;
const NUMBER_INPUT_TEXT_MARGIN = 8;
const NUMBER_INPUT_CURSOR_OFFSET = 2;
const NUMBER_INPUT_BLINK_INTERVAL = 500;
const NUMBER_INPUT_CURSOR_MARGIN = 4;
const NUMBER_INPUT_QUARTER_HEIGHT = 4;
const NUMBER_INPUT_THREE_QUARTER_HEIGHT = 3;
const FOCUS_INDICATOR_OFFSET = 2;
const FOCUS_INDICATOR_BORDER = 4;
const DEFAULT_NUMBER_INPUT_WIDTH = 150;
const DEFAULT_NUMBER_INPUT_HEIGHT = 32;
const DEFAULT_THROTTLE_INTERVAL = 16;

// Temporary local utility implementations to avoid circular dependencies
// These will be extracted to shared modules in future iterations

// Temporary local ComponentError class
class ComponentError extends Error {
  constructor(message, component, metadata = {}) {
    super(message);
    this.name = 'ComponentError';
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

  static startMonitoring(label) {
    this.timers.set(label, performance.now());
  }

  static endMonitoring(label) {
    const start = this.timers.get(label);
    if (start) {
      const duration = performance.now() - start;
      if (
        INPUT_UTILITY_CONSTANTS.DEBUG_MODE &&
        duration > INPUT_UTILITY_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD
      ) {
        ComponentDebug.warn(
          `Performance warning: ${label} took ${duration.toFixed(2)}ms`
        );
      }
      this.timers.delete(label);
      return duration;
    }
    return 0;
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
 * Advanced NumberInput component with accessibility, step control,
 * validation, and modern interaction patterns.
 */
class NumberInput extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width:
        options.width ||
        INPUT_UTILITY_CONSTANTS.NUMBER_INPUT_DEFAULT_WIDTH ||
        DEFAULT_NUMBER_INPUT_WIDTH,
      height:
        options.height ||
        INPUT_UTILITY_CONSTANTS.NUMBER_INPUT_DEFAULT_HEIGHT ||
        DEFAULT_NUMBER_INPUT_HEIGHT,
      ariaRole: 'spinbutton',
      ariaLabel: options.ariaLabel || 'Number Input',
    });

    // Validate options
    this.validateOptions(options);

    // Core properties
    this.value = options.value || 0;
    this.min = options.min !== undefined ? options.min : -Infinity;
    this.max = options.max !== undefined ? options.max : Infinity;
    this.step = options.step || 1;
    this.precision = options.precision || 0;
    this.placeholder = options.placeholder || '';
    this.disabled = options.disabled || false;
    this.showControls = options.showControls !== false;
    this.allowDecimals = options.allowDecimals !== false;
    this.prefix = options.prefix || '';
    this.suffix = options.suffix || '';

    // Theme integration
    this.theme = options.theme || ComponentTheme.getCurrentTheme();

    // State management
    this.isFocused = false;
    this.isEditing = false;
    this.editingValue = '';
    this.isMouseDownOnControl = false;
    this.repeatInterval = null;

    // Animation and performance
    this.renderCache = new Map();
    this.throttledRender = this.throttle(
      this.render.bind(this),
      INPUT_UTILITY_CONSTANTS.PERFORMANCE_THRESHOLDS?.eventThrottle ||
        DEFAULT_THROTTLE_INTERVAL
    );

    // Accessibility
    this.announcer = this.createScreenReaderAnnouncer();
    this.keyboardHandler = this.createKeyboardHandler();

    // Error handling
    this.errorHandler = this.createErrorHandler();

    try {
      this.setupEventHandlers();
      this.setupAccessibility();
      this.setupResizeObserver();
    } catch (error) {
      this.errorHandler.handle(error, 'constructor');
    }
  }

  validateOptions(options) {
    if (
      options.min !== undefined &&
      options.max !== undefined &&
      options.min > options.max
    ) {
      throw new ComponentError('min cannot be greater than max', 'NumberInput');
    }

    if (
      options.step !== undefined &&
      (typeof options.step !== 'number' || options.step <= 0)
    ) {
      throw new ComponentError('step must be a positive number', 'NumberInput');
    }

    if (
      options.precision !== undefined &&
      (!Number.isInteger(options.precision) || options.precision < 0)
    ) {
      throw new ComponentError(
        'precision must be a non-negative integer',
        'NumberInput'
      );
    }
  }

  createScreenReaderAnnouncer() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
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
      ArrowUp: () => this.increment(),
      ArrowDown: () => this.decrement(),
      Enter: () => this.commitEdit(),
      Escape: () => this.cancelEdit(),
      Home: () => this.setValue(this.min),
      End: () => this.setValue(this.max),
      PageUp: () => this.setValue(this.value + this.step * 10),
      PageDown: () => this.setValue(this.value - this.step * 10),
    };
  }

  createErrorHandler() {
    return {
      handle: (error, context) => {
        const componentError = new ComponentError(
          error.message || 'Unknown error',
          'NumberInput',
          { context, originalError: error }
        );

        logger.error('NumberInput Error:', componentError);
        this.emit('error', componentError);

        this.recoverFromError(context);
      },
    };
  }

  recoverFromError(context) {
    switch (context) {
      case 'validation':
        this.value = this.clampValue(this.value);
        break;
      case 'render':
        this.clearRenderCache();
        break;
      case 'editing':
        this.cancelEdit();
        break;
      default:
        this.reset();
    }
  }

  setupAccessibility() {
    // ARIA attributes
    this.setAttribute('role', 'spinbutton');
    this.setAttribute('aria-valuemin', this.min.toString());
    this.setAttribute('aria-valuemax', this.max.toString());
    this.setAttribute('aria-valuenow', this.value.toString());
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');

    // Update ARIA attributes when value changes
    this.on('valueChanged', ({ value }) => {
      this.setAttribute('aria-valuenow', value.toString());
    });

    // Keyboard accessibility
    this.addEventListener('keydown', event => this.handleKeyDown(event));
    this.addEventListener('focusin', () => this.handleFocusIn());
    this.addEventListener('focusout', () => this.handleFocusOut());
  }

  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(_entries => {
        this.clearRenderCache();
        this.throttledRender();
      });

      if (this.element) {
        this.resizeObserver.observe(this.element);
      }
    }
  }

  setupEventHandlers() {
    const eventHandlers = {
      click: this.handleClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
      wheel: this.handleWheel.bind(this),
      mouseDown: this.handleMouseDown.bind(this),
      mouseUp: this.handleMouseUp.bind(this),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.on(event, handler);
    });
  }

  // Enhanced value management with validation
  async setValue(value, announce = true) {
    try {
      const numValue = this.parseValue(value);
      if (numValue === null) {
        throw new ComponentError(
          `Invalid numeric value: ${value}`,
          'NumberInput'
        );
      }

      const oldValue = this.value;
      this.value = this.clampValue(numValue);
      this.clearRenderCache();

      if (oldValue !== this.value) {
        this.emit('valueChanged', {
          value: this.value,
          oldValue,
          formatted: this.formatValue(this.value),
        });

        if (announce) {
          this.announceChange(
            `Value changed to ${this.formatValue(this.value)}`
          );
        }
      }
    } catch (error) {
      this.errorHandler.handle(error, 'setValue');
    }
  }

  parseValue(value) {
    if (typeof value === 'number') return value;
    if (typeof value === 'string') {
      // Remove prefix and suffix for parsing
      let cleanValue = value;
      if (this.prefix && cleanValue.startsWith(this.prefix)) {
        cleanValue = cleanValue.substring(this.prefix.length);
      }
      if (this.suffix && cleanValue.endsWith(this.suffix)) {
        cleanValue = cleanValue.substring(
          0,
          cleanValue.length - this.suffix.length
        );
      }

      const parsed = parseFloat(cleanValue.trim());
      return isNaN(parsed) ? null : parsed;
    }
    return null;
  }

  clampValue(value) {
    let clamped = Math.max(this.min, Math.min(this.max, value));

    // Apply step constraint
    if (this.step !== 1) {
      const steps = Math.round((clamped - this.min) / this.step);
      clamped = this.min + steps * this.step;
    }

    // Apply precision
    if (this.precision > 0) {
      clamped = parseFloat(clamped.toFixed(this.precision));
    } else {
      clamped = Math.round(clamped);
    }

    return clamped;
  }

  formatValue(value) {
    let formatted;
    if (this.precision > 0) {
      formatted = value.toFixed(this.precision);
    } else {
      formatted = Math.round(value).toString();
    }

    return this.prefix + formatted + this.suffix;
  }

  increment() {
    try {
      this.setValue(this.value + this.step);
      this.announceChange(`Incremented to ${this.formatValue(this.value)}`);
    } catch (error) {
      this.errorHandler.handle(error, 'increment');
    }
  }

  decrement() {
    try {
      this.setValue(this.value - this.step);
      this.announceChange(`Decremented to ${this.formatValue(this.value)}`);
    } catch (error) {
      this.errorHandler.handle(error, 'decrement');
    }
  }

  startRepeating(operation) {
    this.stopRepeating();

    const repeat = () => {
      if (operation === 'increment') {
        this.increment();
      } else {
        this.decrement();
      }

      this.repeatInterval = setTimeout(repeat, NUMBER_INPUT_REPEAT_INTERVAL);
    };

    // Initial delay before repeating
    this.repeatInterval = setTimeout(repeat, NUMBER_INPUT_REPEAT_INITIAL_DELAY);
  }

  stopRepeating() {
    if (this.repeatInterval) {
      clearTimeout(this.repeatInterval);
      this.repeatInterval = null;
    }
  }

  announceChange(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // Enhanced event handlers with accessibility
  handleClick(event) {
    if (this.disabled) return;

    try {
      const { localX, localY } = event;

      if (
        this.showControls &&
        localX > this.width - NUMBER_INPUT_CONTROL_WIDTH
      ) {
        // Spinner controls
        if (localY < this.height / 2) {
          this.increment();
        } else {
          this.decrement();
        }
      } else {
        // Start editing
        this.startEditing();
      }
    } catch (error) {
      this.errorHandler.handle(error, 'click-handler');
    }
  }

  handleMouseDown(event) {
    if (this.disabled) return;

    try {
      const { localX, localY } = event;

      if (
        this.showControls &&
        localX > this.width - NUMBER_INPUT_CONTROL_WIDTH
      ) {
        this.isMouseDownOnControl = true;

        // Start repeating after a delay
        const operation = localY < this.height / 2 ? 'increment' : 'decrement';
        this.startRepeating(operation);

        // Prevent text selection
        event.preventDefault();
      }
    } catch (error) {
      this.errorHandler.handle(error, 'mouse-down');
    }
  }

  handleMouseUp() {
    if (this.isMouseDownOnControl) {
      this.isMouseDownOnControl = false;
      this.stopRepeating();
    }
  }

  handleKeyDown(event) {
    if (this.disabled) return;

    try {
      if (this.isEditing) {
        switch (event.key) {
          case 'Enter':
            this.commitEdit();
            break;
          case 'Escape':
            this.cancelEdit();
            break;
          case 'Backspace':
            this.editingValue = this.editingValue.slice(0, -1);
            break;
          default:
            if (this.isValidInput(event.key)) {
              this.editingValue += event.key;
            }
        }
      } else {
        const handler = this.keyboardHandler[event.key];
        if (handler) {
          event.preventDefault();
          handler();
        }
      }
    } catch (error) {
      this.errorHandler.handle(error, 'keyboard-handler');
    }
  }

  handleFocus() {
    this.isFocused = true;
    this.emit('focus');
  }

  handleBlur() {
    this.isFocused = false;
    if (this.isEditing) {
      this.commitEdit();
    }
    this.emit('blur');
  }

  handleWheel(event) {
    if (this.disabled || !this.isFocused) return;

    try {
      event.preventDefault();

      if (event.deltaY < 0) {
        this.increment();
      } else {
        this.decrement();
      }
    } catch (error) {
      this.errorHandler.handle(error, 'wheel-handler');
    }
  }

  handleFocusIn() {
    this.setAttribute('aria-describedby', 'number-input-instructions');
    this.announcer.textContent =
      'Use arrow keys to adjust value, Enter to edit directly';
  }

  handleFocusOut() {
    this.removeAttribute('aria-describedby');
  }

  // Enhanced input validation and editing
  isValidInput(key) {
    const validChars = this.allowDecimals ? '0123456789.-' : '0123456789-';
    if (!validChars.includes(key)) return false;

    // Prevent multiple decimal points
    if (key === '.' && this.editingValue.includes('.')) return false;

    // Prevent multiple minus signs or minus in wrong position
    if (
      key === '-' &&
      (this.editingValue.includes('-') || this.editingValue.length > 0)
    )
      return false;

    return true;
  }

  startEditing() {
    try {
      this.isEditing = true;
      this.editingValue = this.formatValue(this.value);
      this.announceChange('Editing mode activated');
    } catch (error) {
      this.errorHandler.handle(error, 'start-editing');
    }
  }

  commitEdit() {
    try {
      const newValue = this.parseValue(this.editingValue);
      if (newValue !== null) {
        this.setValue(newValue, false);
      }
      this.isEditing = false;
      this.editingValue = '';
      this.announceChange('Edit committed');
    } catch (error) {
      this.errorHandler.handle(error, 'commit-edit');
    }
  }

  cancelEdit() {
    try {
      this.isEditing = false;
      this.editingValue = '';
      this.announceChange('Edit cancelled');
    } catch (error) {
      this.errorHandler.handle(error, 'cancel-edit');
    }
  }

  // Enhanced rendering with theme support
  renderSelf(renderer) {
    if (renderer.type !== 'canvas') return;

    try {
      PerformanceMonitor.startMonitoring('NumberInput');

      // Background with theme support
      renderer.fillStyle = this.disabled
        ? ComponentTheme.getColor('disabled', this.theme)
        : ComponentTheme.getColor('background', this.theme);
      renderer.fillRect(0, 0, this.width, this.height);

      // Border with focus state
      const borderColor = this.disabled
        ? ComponentTheme.getColor('border', this.theme)
        : this.isFocused
          ? ComponentTheme.getColor('focus', this.theme)
          : ComponentTheme.getColor('border', this.theme);

      renderer.strokeStyle = borderColor;
      renderer.lineWidth = this.isFocused ? 2 : 1;
      renderer.strokeRect(0, 0, this.width, this.height);

      // Value text
      const displayValue = this.isEditing
        ? this.editingValue
        : this.formatValue(this.value);
      const textColor = this.disabled
        ? ComponentTheme.getColor('textDisabled', this.theme)
        : ComponentTheme.getColor('text', this.theme);

      renderer.fillStyle = textColor;
      renderer.font = '14px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';

      const placeholderText = displayValue || this.placeholder;
      const isPlaceholder = !displayValue && this.placeholder;

      if (isPlaceholder) {
        renderer.fillStyle = ComponentTheme.getColor(
          'textSecondary',
          this.theme
        );
        renderer.font = 'italic 14px Arial';
      }

      renderer.fillText(
        placeholderText,
        NUMBER_INPUT_TEXT_MARGIN,
        this.height / 2
      );

      // Spinner controls
      if (this.showControls) {
        this.renderSpinnerControls(renderer);
      }

      // Cursor when editing
      if (this.isEditing && this.isFocused) {
        this.renderCursor(renderer, displayValue);
      }

      // Focus indicator
      if (this.isFocused) {
        this.drawFocusIndicator(renderer);
      }

      // Disabled overlay
      if (this.disabled) {
        renderer.fillStyle = 'rgba(255, 255, 255, 0.6)';
        renderer.fillRect(0, 0, this.width, this.height);
      }

      PerformanceMonitor.endMonitoring('NumberInput');
    } catch (error) {
      this.errorHandler.handle(error, 'render');
    }
  }

  drawFocusIndicator(renderer) {
    renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
    renderer.lineWidth = 2;
    renderer.setLineDash([2, 2]);
    renderer.strokeRect(
      FOCUS_INDICATOR_OFFSET,
      FOCUS_INDICATOR_OFFSET,
      this.width - FOCUS_INDICATOR_BORDER,
      this.height - FOCUS_INDICATOR_BORDER
    );
    renderer.setLineDash([]);
  }

  renderSpinnerControls(renderer) {
    const controlWidth = NUMBER_INPUT_CONTROL_WIDTH;
    const controlX = this.width - controlWidth;

    // Separator line
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(controlX, 0);
    renderer.lineTo(controlX, this.height);
    renderer.stroke();

    // Control background on hover/active
    const controlBg = this.isMouseDownOnControl
      ? ComponentTheme.getColor('primaryLight', this.theme)
      : ComponentTheme.getColor('background', this.theme);

    renderer.fillStyle = controlBg;
    renderer.fillRect(controlX + 1, 1, controlWidth - 2, this.height - 2);

    // Up arrow
    renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
    renderer.font = '10px Arial';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText(
      '▲',
      controlX + controlWidth / 2,
      this.height / NUMBER_INPUT_QUARTER_HEIGHT
    );

    // Down arrow
    renderer.fillText(
      '▼',
      controlX + controlWidth / 2,
      (this.height * NUMBER_INPUT_THREE_QUARTER_HEIGHT) /
        NUMBER_INPUT_QUARTER_HEIGHT
    );
  }

  renderCursor(renderer, text) {
    const textWidth = renderer.measureText(text).width;
    const cursorX =
      NUMBER_INPUT_TEXT_MARGIN + textWidth + NUMBER_INPUT_CURSOR_OFFSET;

    // Blinking cursor effect
    const shouldShow =
      Math.floor(Date.now() / NUMBER_INPUT_BLINK_INTERVAL) % 2 === 0;
    if (!shouldShow) return;

    renderer.strokeStyle = ComponentTheme.getColor('text', this.theme);
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(cursorX, NUMBER_INPUT_CURSOR_MARGIN);
    renderer.lineTo(cursorX, this.height - NUMBER_INPUT_CURSOR_MARGIN);
    renderer.stroke();
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
  getValue() {
    return this.value;
  }

  reset() {
    this.value = 0;
    this.isEditing = false;
    this.editingValue = '';
    this.isFocused = false;
    this.stopRepeating();
    this.clearRenderCache();
    this.emit('reset');
  }

  enable() {
    this.disabled = false;
    this.setAttribute('tabindex', '0');
    this.clearRenderCache();
    this.emit('enabled');
  }

  disable() {
    this.disabled = true;
    this.setAttribute('tabindex', '-1');
    this.cancelEdit();
    this.stopRepeating();
    this.clearRenderCache();
    this.emit('disabled');
  }

  // Cleanup and memory management
  destroy() {
    try {
      // Stop any repeating operations
      this.stopRepeating();

      // Clean up resize observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // Remove announcer from DOM
      if (this.announcer && this.announcer.parentNode) {
        this.announcer.parentNode.removeChild(this.announcer);
      }

      // Clear caches
      this.clearRenderCache();

      // Clear timers
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Call parent cleanup
      super.destroy?.();
      this.emit('destroyed');
    } catch (error) {
      logger.error('Error during NumberInput cleanup:', error);
    }
  }
}

export { NumberInput };
