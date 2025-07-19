/**
 * ColorPicker Component
 *
 * Advanced color picker with accessibility, smooth animations,
 * and modern interaction patterns.
 *
 * Features:
 * - Full HSL color space support
 * - Alpha channel support
 * - Keyboard navigation
 * - Screen reader accessibility
 * - Color presets
 * - Multiple format support (hex, rgb, hsl, hsv)
 * - Performance optimized rendering
 * - Theme integration
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import { BaseObject } from '../../objects/enhanced-objects.js';
import { INPUT_UTILITY_CONSTANTS } from './constants.js';
import { ComponentTheme } from './theme.js';

// These utilities are defined in the main input-utility-components.js file
// We'll import them temporarily until they're extracted to their own modules
// For now, let's define them locally to avoid circular dependencies

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

// Temporary local ComponentDebug utility
const ComponentDebug = {
  isEnabled: true,
  warn: (message, ...args) => {
    if (ComponentDebug.isEnabled) {
      console.warn(`[ComponentDebug] ${message}`, ...args);
    }
  },
  error: (message, ...args) => {
    if (ComponentDebug.isEnabled) {
      console.error(`[ComponentDebug] ${message}`, ...args);
    }
  },
  componentError: (component, error, context) => {
    ComponentDebug.error(`${component} error in ${context}:`, error);
  },
};

// Temporary local PerformanceMonitor
const PerformanceMonitor = {
  startMonitoring: label => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-start`);
    }
  },
  endMonitoring: label => {
    if (typeof performance !== 'undefined') {
      performance.mark(`${label}-end`);
      try {
        performance.measure(label, `${label}-start`, `${label}-end`);
      } catch (e) {
        // Ignore measurement errors
      }
    }
  },
};

// Temporary local AnimationManager
const AnimationManager = {
  animate: async (target, properties, options = {}) => {
    return new Promise(resolve => {
      const duration = options.duration || 300;
      const startTime = performance.now();
      const startValues = {};

      // Store starting values
      Object.keys(properties).forEach(key => {
        startValues[key] = target[key] || 0;
      });

      const animate = currentTime => {
        const elapsed = currentTime - startTime;
        const progress = Math.min(elapsed / duration, 1);

        // Apply easing (simple ease-out)
        const easedProgress = 1 - Math.pow(1 - progress, 3);

        // Update properties
        Object.keys(properties).forEach(key => {
          const start = startValues[key];
          const end = properties[key];
          target[key] = start + (end - start) * easedProgress;
        });

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          resolve();
        }
      };

      requestAnimationFrame(animate);
    });
  },
  cancelAnimation: () => {
    // Simple implementation - in a full system this would track and cancel animations
  },
};

// PERFORMANCE_THRESHOLDS and ACCESSIBILITY_DEFAULTS need to be imported
// from the main constants or defined here
const PERFORMANCE_THRESHOLDS = {
  eventThrottle: 16, // ~60fps
};

const ACCESSIBILITY_DEFAULTS = {
  announceChanges: true,
};

class ColorPicker extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width:
        options.width || INPUT_UTILITY_CONSTANTS.DEFAULT_COLOR_PICKER_WIDTH,
      height:
        options.height || INPUT_UTILITY_CONSTANTS.DEFAULT_COLOR_PICKER_HEIGHT,
      ariaRole: 'button',
      ariaLabel: options.ariaLabel || 'Color picker',
    });

    // Validate options
    this.validateOptions(options);

    // Core properties
    this.value = options.value || '#ff0000';
    this.format = options.format || 'hex'; // 'hex', 'rgb', 'hsl', 'hsv'
    this.showAlpha = options.showAlpha !== false;
    this.showPresets = options.showPresets !== false;
    this.disabled = options.disabled || false;

    // Color presets with accessibility considerations
    this.presets = options.presets || this.getDefaultPresets();

    // Theme integration
    this.theme = options.theme || ComponentTheme.getCurrentTheme();
    this.borderColor =
      options.borderColor || ComponentTheme.getColor('border', this.theme);
    this.backgroundColor =
      options.backgroundColor ||
      ComponentTheme.getColor('background', this.theme);

    // State management
    this.isOpen = false;
    this.hue = 0;
    this.saturation = 100;
    this.lightness = 50;
    this.alpha = 1;
    this.lastValidColor = this.value;

    // Performance optimization
    this.renderCache = new Map();
    this.throttledRender = this.throttle(
      this.render.bind(this),
      PERFORMANCE_THRESHOLDS.eventThrottle
    );

    // Accessibility
    this.announcer = this.createScreenReaderAnnouncer();
    this.keyboardHandler = this.createKeyboardHandler();

    // Animation state
    this.animationState = {
      isAnimating: false,
      openProgress: this.isOpen ? 1 : 0,
    };

    // Error handling
    this.errorHandler = this.createErrorHandler();

    try {
      this.parseColor();
      this.setupEventHandlers();
      this.setupAccessibility();
      this.setupResizeObserver();
    } catch (error) {
      this.errorHandler.handle(error, 'constructor');
    }
  }

  validateOptions(options) {
    const validFormats = ['hex', 'rgb', 'hsl', 'hsv'];
    if (options.format && !validFormats.includes(options.format)) {
      throw new ComponentError(
        `Invalid color format: ${options.format}`,
        'ColorPicker'
      );
    }

    if (options.value && !this.isValidColor(options.value)) {
      ComponentDebug.warn(
        `Invalid initial color value: ${options.value}, using default`
      );
    }
  }

  getDefaultPresets() {
    return [
      { color: '#ff0000', name: 'Red' },
      { color: '#00ff00', name: 'Green' },
      { color: '#0000ff', name: 'Blue' },
      { color: '#ffff00', name: 'Yellow' },
      { color: '#ff00ff', name: 'Magenta' },
      { color: '#00ffff', name: 'Cyan' },
      { color: '#000000', name: 'Black' },
      { color: '#ffffff', name: 'White' },
      { color: '#808080', name: 'Gray' },
      { color: '#800000', name: 'Maroon' },
      { color: '#008000', name: 'Dark Green' },
      { color: '#000080', name: 'Navy' },
    ];
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
      ArrowLeft: () =>
        this.adjustHue(-INPUT_UTILITY_CONSTANTS.HUE_ADJUSTMENT_STEP),
      ArrowRight: () =>
        this.adjustHue(INPUT_UTILITY_CONSTANTS.HUE_ADJUSTMENT_STEP),
      ArrowUp: () =>
        this.adjustLightness(INPUT_UTILITY_CONSTANTS.LIGHTNESS_ADJUSTMENT_STEP),
      ArrowDown: () =>
        this.adjustLightness(
          -INPUT_UTILITY_CONSTANTS.LIGHTNESS_ADJUSTMENT_STEP
        ),
      'Shift+ArrowUp': () =>
        this.adjustSaturation(
          INPUT_UTILITY_CONSTANTS.SATURATION_ADJUSTMENT_STEP
        ),
      'Shift+ArrowDown': () =>
        this.adjustSaturation(
          -INPUT_UTILITY_CONSTANTS.SATURATION_ADJUSTMENT_STEP
        ),
      Enter: () => this.confirmSelection(),
      Escape: () => this.close(),
      Tab: event => this.handleTabNavigation(event),
    };
  }

  createErrorHandler() {
    return {
      handle: (error, context) => {
        const componentError = new ComponentError(
          error.message || 'Unknown error',
          'ColorPicker',
          { context, originalError: error }
        );

        ComponentDebug.error('ColorPicker Error', componentError);
        this.emit('error', componentError);

        // Attempt recovery
        this.recoverFromError(context);
      },
    };
  }

  recoverFromError(context) {
    switch (context) {
      case 'color-parsing':
        this.value = this.lastValidColor;
        this.parseColor();
        break;
      case 'render':
        this.clearRenderCache();
        break;
      default:
        this.reset();
    }
  }

  setupEventHandlers() {
    const eventHandlers = {
      click: this.handleClick.bind(this),
      mouseMove: this.handleMouseMove.bind(this),
      mouseDown: this.handleMouseDown.bind(this),
      mouseUp: this.handleMouseUp.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
      wheel: this.handleWheel.bind(this),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.on(event, handler);
    });
  }

  setupAccessibility() {
    // ARIA attributes
    this.setAttribute('aria-expanded', this.isOpen.toString());
    this.setAttribute('aria-haspopup', 'dialog');
    this.setAttribute('aria-valuemin', '0');
    this.setAttribute('aria-valuemax', '360');
    this.setAttribute('aria-valuenow', this.hue.toString());
    this.setAttribute('aria-valuetext', this.getColorDescription());

    // Keyboard accessibility
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');

    // Focus management
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

  // Color manipulation with error handling
  parseColor() {
    try {
      const color = this.value;

      if (!this.isValidColor(color)) {
        throw new Error(`Invalid color format: ${color}`);
      }

      if (color.startsWith('#')) {
        this.parseHexColor(color);
      } else if (color.startsWith('rgb')) {
        this.parseRgbColor(color);
      } else if (color.startsWith('hsl')) {
        this.parseHslColor(color);
      }

      this.lastValidColor = this.value;
    } catch (error) {
      this.errorHandler.handle(error, 'color-parsing');
    }
  }

  parseHexColor(hex) {
    const cleanHex = hex.slice(1);
    const r = parseInt(cleanHex.substr(0, 2), 16);
    const g = parseInt(cleanHex.substr(2, 2), 16);
    const b = parseInt(
      cleanHex.substr(INPUT_UTILITY_CONSTANTS.HEX_BLUE_OFFSET, 2),
      16
    );

    if (isNaN(r) || isNaN(g) || isNaN(b)) {
      throw new Error('Invalid hex color format');
    }

    const hsl = this.rgbToHsl(r, g, b);
    this.hue = hsl.h;
    this.saturation = hsl.s;
    this.lightness = hsl.l;
  }

  parseRgbColor(rgb) {
    const matches = rgb.match(/rgba?\(([^)]+)\)/);
    if (!matches) throw new Error('Invalid RGB color format');

    const values = matches[1].split(',').map(v => parseFloat(v.trim()));
    if (
      values.length < INPUT_UTILITY_CONSTANTS.RGB_CHANNEL_COUNT ||
      values.some(isNaN)
    ) {
      throw new Error('Invalid RGB values');
    }

    const [r, g, b, a = 1] = values;
    const hsl = this.rgbToHsl(r, g, b);
    this.hue = hsl.h;
    this.saturation = hsl.s;
    this.lightness = hsl.l;
    this.alpha = a;
  }

  parseHslColor(hsl) {
    const matches = hsl.match(/hsla?\(([^)]+)\)/);
    if (!matches) throw new Error('Invalid HSL color format');

    const values = matches[1].split(',').map(v => parseFloat(v.trim()));
    if (
      values.length < INPUT_UTILITY_CONSTANTS.RGB_CHANNEL_COUNT ||
      values.some(isNaN)
    ) {
      throw new Error('Invalid HSL values');
    }

    const [h, s, l, a = 1] = values;
    this.hue = h;
    this.saturation = s;
    this.lightness = l;
    this.alpha = a;
  }

  isValidColor(color) {
    if (typeof color !== 'string') return false;

    const hexPattern = /^#[0-9A-Fa-f]{6}$/;
    const rgbPattern =
      /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/;
    const hslPattern =
      /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(?:,\s*[\d.]+\s*)?\)$/;

    return (
      hexPattern.test(color) || rgbPattern.test(color) || hslPattern.test(color)
    );
  }

  // Enhanced color space conversions with validation
  rgbToHsl(r, g, b) {
    r =
      Math.max(0, Math.min(INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE, r)) /
      INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE;
    g =
      Math.max(0, Math.min(INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE, g)) /
      INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE;
    b =
      Math.max(0, Math.min(INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE, b)) /
      INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h, s;
    const l = (max + min) / 2;

    if (max === min) {
      h = s = 0; // achromatic
    } else {
      const d = max - min;
      s =
        l > INPUT_UTILITY_CONSTANTS.HSL_MIDPOINT
          ? d / (2 - max - min)
          : d / (max + min);

      switch (max) {
        case r:
          h =
            (g - b) / d +
            (g < b ? INPUT_UTILITY_CONSTANTS.HUE_SECTOR_COUNT : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + INPUT_UTILITY_CONSTANTS.HUE_BLUE_OFFSET;
          break;
      }
      h /= INPUT_UTILITY_CONSTANTS.HUE_SECTOR_COUNT;
    }

    return {
      h: Math.round(h * INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES),
      s: Math.round(s * INPUT_UTILITY_CONSTANTS.SATURATION_MAX_PERCENT),
      l: Math.round(l * INPUT_UTILITY_CONSTANTS.LIGHTNESS_MAX_PERCENT),
    };
  }

  hslToRgb(h, s, l) {
    h =
      ((h % INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES) +
        INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES) %
      INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES; // Normalize hue
    s =
      Math.max(0, Math.min(INPUT_UTILITY_CONSTANTS.SATURATION_MAX_PERCENT, s)) /
      INPUT_UTILITY_CONSTANTS.SATURATION_MAX_PERCENT;
    l =
      Math.max(0, Math.min(INPUT_UTILITY_CONSTANTS.LIGHTNESS_MAX_PERCENT, l)) /
      INPUT_UTILITY_CONSTANTS.LIGHTNESS_MAX_PERCENT;

    const hue2rgb = (p, q, t) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1 / INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_SIX)
        return p + (q - p) * INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_SIX * t;
      if (t < 1 / INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_TWO) return q;
      if (
        t <
        INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_TWO /
          INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_THREE
      )
        return (
          p +
          (q - p) *
            (INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_TWO /
              INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_THREE -
              t) *
            INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_SIX
        );
      return p;
    };

    let r, g, b;

    if (s === 0) {
      r = g = b = l; // achromatic
    } else {
      const q =
        l < INPUT_UTILITY_CONSTANTS.HSL_MIDPOINT ? l * (1 + s) : l + s - l * s;
      const p = INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_TWO * l - q;
      r = hue2rgb(
        p,
        q,
        h / INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES +
          1 / INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_THREE
      );
      g = hue2rgb(p, q, h / INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES);
      b = hue2rgb(
        p,
        q,
        h / INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES -
          1 / INPUT_UTILITY_CONSTANTS.HSL_DIVISOR_THREE
      );
    }

    return {
      r: Math.round(r * INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE),
      g: Math.round(g * INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE),
      b: Math.round(b * INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE),
    };
  }

  // Value management with validation and events
  updateValue() {
    try {
      const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
      const oldValue = this.value;

      switch (this.format) {
        case 'hex':
          this.value = this.rgbToHex(rgb.r, rgb.g, rgb.b);
          break;
        case 'rgb':
          this.value = this.showAlpha
            ? `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.alpha})`
            : `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
          break;
        case 'hsl':
          this.value = this.showAlpha
            ? `hsla(${Math.round(this.hue)}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%, ${this.alpha})`
            : `hsl(${Math.round(this.hue)}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%)`;
          break;
        case 'hsv': {
          const hsv = this.hslToHsv(this.hue, this.saturation, this.lightness);
          this.value = `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;
          break;
        }
      }

      if (oldValue !== this.value) {
        this.lastValidColor = this.value;
        this.updateAccessibility();
        this.announceColorChange();
        this.emit('colorChanged', {
          value: this.value,
          hsl: { h: this.hue, s: this.saturation, l: this.lightness },
          alpha: this.alpha,
          rgb,
        });
      }
    } catch (error) {
      this.errorHandler.handle(error, 'value-update');
    }
  }

  rgbToHex(r, g, b) {
    const toHex = n => {
      const hex = Math.round(
        Math.max(0, Math.min(INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE, n))
      ).toString(INPUT_UTILITY_CONSTANTS.HEX_BASE);
      return hex.length === 1 ? `0${hex}` : hex;
    };
    return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
  }

  hslToHsv(h, s, l) {
    s /= 100;
    l /= 100;
    const v = l + s * Math.min(l, 1 - l);
    const sNew = v === 0 ? 0 : 2 * (1 - l / v);
    return { h, s: sNew * 100, v: v * 100 };
  }

  updateAccessibility() {
    this.setAttribute('aria-valuenow', this.hue.toString());
    this.setAttribute('aria-valuetext', this.getColorDescription());
  }

  getColorDescription() {
    const colorName = this.getColorName();
    return `${colorName}, hue ${Math.round(this.hue)} degrees, saturation ${Math.round(this.saturation)} percent, lightness ${Math.round(this.lightness)} percent`;
  }

  getColorName() {
    // Basic color name mapping
    const { hue } = this;
    if (this.saturation < INPUT_UTILITY_CONSTANTS.SATURATION_THRESHOLD_LOW)
      return this.lightness > INPUT_UTILITY_CONSTANTS.LIGHTNESS_THRESHOLD_HIGH
        ? 'white'
        : this.lightness < INPUT_UTILITY_CONSTANTS.LIGHTNESS_THRESHOLD_LOW
          ? 'black'
          : 'gray';
    if (
      hue < INPUT_UTILITY_CONSTANTS.HUE_RED_MAX ||
      hue >= INPUT_UTILITY_CONSTANTS.HUE_RED_MIN
    )
      return 'red';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_ORANGE_MAX) return 'orange';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_YELLOW_MAX) return 'yellow';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_GREEN_MAX) return 'green';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_CYAN_MAX) return 'cyan';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_BLUE_MAX) return 'blue';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_PURPLE_MAX) return 'purple';
    if (hue < INPUT_UTILITY_CONSTANTS.HUE_MAGENTA_MAX) return 'magenta';
    return 'pink';
  }

  announceColorChange() {
    if (!ACCESSIBILITY_DEFAULTS.announceChanges) return;

    this.announcer.textContent = `Color changed to ${this.getColorDescription()}`;
  }

  // Enhanced event handlers with error handling
  handleClick(event) {
    try {
      if (this.disabled) return;

      const { localX, localY } = event;

      if (!this.isOpen) {
        this.open();
      } else {
        this.handleColorSelection(localX, localY);
      }
    } catch (error) {
      this.errorHandler.handle(error, 'click-handler');
    }
  }

  async open() {
    if (this.isOpen || this.disabled) return;

    try {
      this.isOpen = true;
      this.setAttribute('aria-expanded', 'true');

      // Animate opening if motion is not reduced
      if (!this.prefersReducedMotion()) {
        await AnimationManager.animate(
          this.animationState,
          { openProgress: 1 },
          { duration: 200, easing: 'ease-out' }
        );
      } else {
        this.animationState.openProgress = 1;
      }

      this.emit('opened');
      this.announcer.textContent = 'Color picker opened';
    } catch (error) {
      this.errorHandler.handle(error, 'open');
    }
  }

  async close() {
    if (!this.isOpen) return;

    try {
      this.isOpen = false;
      this.setAttribute('aria-expanded', 'false');

      // Animate closing
      if (!this.prefersReducedMotion()) {
        await AnimationManager.animate(
          this.animationState,
          { openProgress: 0 },
          { duration: 150, easing: 'ease-in' }
        );
      } else {
        this.animationState.openProgress = 0;
      }

      this.emit('closed');
      this.announcer.textContent = 'Color picker closed';
    } catch (error) {
      this.errorHandler.handle(error, 'close');
    }
  }

  prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  // Enhanced color selection with precision and validation
  handleColorSelection(x, y) {
    try {
      // Color wheel area (improved precision)
      if (
        y >= INPUT_UTILITY_CONSTANTS.COLOR_WHEEL_Y_START &&
        y < INPUT_UTILITY_CONSTANTS.COLOR_WHEEL_Y_END
      ) {
        const centerX = this.width / 2;
        const centerY = 125;
        const radius = 80;

        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          this.hue =
            ((Math.atan2(dy, dx) *
              INPUT_UTILITY_CONSTANTS.DEGREES_TO_RADIANS_FACTOR) /
              Math.PI +
              INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES) %
            INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES;
          this.saturation = Math.min(100, (distance / radius) * 100);
          this.updateValue();
        }
      }

      // Lightness slider area
      if (
        y >= INPUT_UTILITY_CONSTANTS.LIGHTNESS_SLIDER_Y_MIN &&
        y <= INPUT_UTILITY_CONSTANTS.LIGHTNESS_SLIDER_Y_MAX &&
        x >= INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN &&
        x <= this.width - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN
      ) {
        this.lightness = Math.max(
          0,
          Math.min(
            INPUT_UTILITY_CONSTANTS.LIGHTNESS_MAX_PERCENT,
            ((x - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN) /
              (this.width - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN * 2)) *
              INPUT_UTILITY_CONSTANTS.LIGHTNESS_MAX_PERCENT
          )
        );
        this.updateValue();
      }

      // Alpha slider area
      if (
        this.showAlpha &&
        y >= INPUT_UTILITY_CONSTANTS.ALPHA_SLIDER_Y_MIN &&
        y <= INPUT_UTILITY_CONSTANTS.ALPHA_SLIDER_Y_MAX &&
        x >= INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN &&
        x <= this.width - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN
      ) {
        this.alpha = Math.max(
          0,
          Math.min(
            1,
            (x - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN) /
              (this.width - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN * 2)
          )
        );
        this.updateValue();
      }

      // Preset colors
      if (this.showPresets && y >= INPUT_UTILITY_CONSTANTS.PRESET_Y) {
        const presetWidth =
          (this.width - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN * 2) /
          this.presets.length;
        const presetIndex = Math.floor(
          (x - INPUT_UTILITY_CONSTANTS.SLIDER_MARGIN) / presetWidth
        );

        if (presetIndex >= 0 && presetIndex < this.presets.length) {
          this.setValue(
            this.presets[presetIndex].color || this.presets[presetIndex]
          );
        }
      }
    } catch (error) {
      this.errorHandler.handle(error, 'color-selection');
    }
  }

  // Keyboard navigation and adjustment methods
  adjustHue(delta) {
    this.hue =
      (this.hue + delta + INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES) %
      INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES;
    this.updateValue();
  }

  adjustSaturation(delta) {
    this.saturation = Math.max(0, Math.min(100, this.saturation + delta));
    this.updateValue();
  }

  adjustLightness(delta) {
    this.lightness = Math.max(0, Math.min(100, this.lightness + delta));
    this.updateValue();
  }

  confirmSelection() {
    this.emit('colorConfirmed', { value: this.value });
    this.close();
  }

  handleKeyDown(event) {
    try {
      if (this.disabled) return;

      const { key, shiftKey, ctrlKey, metaKey } = event;

      const keyCombo = [
        shiftKey && 'Shift',
        (ctrlKey || metaKey) && 'Ctrl',
        key,
      ]
        .filter(Boolean)
        .join('+');

      const handler =
        this.keyboardHandler[keyCombo] || this.keyboardHandler[key];

      if (handler) {
        event.preventDefault();
        handler(event);
      }
    } catch (error) {
      this.errorHandler.handle(error, 'keyboard-handler');
    }
  }

  handleTabNavigation(event) {
    // Implement focus management within the color picker
    const focusableElements = this.getFocusableElements();
    const currentIndex = focusableElements.indexOf(event.target);

    if (event.shiftKey) {
      // Shift+Tab (previous)
      const nextIndex =
        currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
      focusableElements[nextIndex]?.focus();
    } else {
      // Tab (next)
      const nextIndex =
        currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
      focusableElements[nextIndex]?.focus();
    }

    event.preventDefault();
  }

  getFocusableElements() {
    // Return array of focusable elements within the color picker
    return Array.from(
      this.element?.querySelectorAll('[tabindex]:not([tabindex="-1"])') || []
    );
  }

  handleMouseMove(event) {
    if (!this.isMouseDown || this.disabled) return;

    try {
      const { localX, localY } = event;
      this.handleColorSelection(localX, localY);
    } catch (error) {
      this.errorHandler.handle(error, 'mouse-move');
    }
  }

  handleMouseDown(event) {
    if (this.disabled) return;

    try {
      this.isMouseDown = true;
      const { localX, localY } = event;
      this.handleColorSelection(localX, localY);

      // Add global mouse handlers for drag operations
      this.addGlobalMouseHandlers();
    } catch (error) {
      this.errorHandler.handle(error, 'mouse-down');
    }
  }

  handleMouseUp() {
    this.isMouseDown = false;
    this.removeGlobalMouseHandlers();
  }

  addGlobalMouseHandlers() {
    this.globalMouseMove = this.handleMouseMove.bind(this);
    this.globalMouseUp = this.handleMouseUp.bind(this);

    document.addEventListener('mousemove', this.globalMouseMove);
    document.addEventListener('mouseup', this.globalMouseUp);
  }

  removeGlobalMouseHandlers() {
    if (this.globalMouseMove) {
      document.removeEventListener('mousemove', this.globalMouseMove);
      this.globalMouseMove = null;
    }

    if (this.globalMouseUp) {
      document.removeEventListener('mouseup', this.globalMouseUp);
      this.globalMouseUp = null;
    }
  }

  handleFocus() {
    this.isFocused = true;
    this.emit('focus');
  }

  handleBlur() {
    this.isFocused = false;
    this.emit('blur');

    // Close picker on blur if not persistent
    if (this.isOpen && !this.persistent) {
      setTimeout(() => this.close(), INPUT_UTILITY_CONSTANTS.CLOSE_TIMEOUT);
    }
  }

  handleWheel(event) {
    if (!this.isFocused || this.disabled) return;

    try {
      event.preventDefault();

      const delta =
        event.deltaY > 0
          ? INPUT_UTILITY_CONSTANTS.WHEEL_STEP_DELTA_NEGATIVE
          : INPUT_UTILITY_CONSTANTS.WHEEL_STEP_DELTA;

      if (event.shiftKey) {
        this.adjustSaturation(delta);
      } else if (event.ctrlKey || event.metaKey) {
        this.adjustLightness(delta);
      } else {
        this.adjustHue(delta);
      }
    } catch (error) {
      this.errorHandler.handle(error, 'wheel-handler');
    }
  }

  handleFocusIn() {
    this.setAttribute('aria-describedby', 'color-picker-instructions');
    this.announcer.textContent =
      'Use arrow keys to adjust color, Shift+arrows for saturation, Ctrl+arrows for lightness';
  }

  handleFocusOut() {
    this.removeAttribute('aria-describedby');
  }

  // Enhanced rendering with performance optimization and caching
  renderSelf(renderer) {
    if (renderer.type !== 'canvas') return;

    try {
      PerformanceMonitor.startMonitoring('ColorPicker');

      if (!this.isOpen && this.animationState.openProgress === 0) {
        this.renderPreview(renderer);
      } else {
        this.renderPicker(renderer);
      }

      PerformanceMonitor.endMonitoring('ColorPicker');
    } catch (error) {
      this.errorHandler.handle(error, 'render');
    }
  }

  renderPreview(renderer) {
    const cacheKey = `preview_${this.value}_${this.width}_${this.height}_${this.disabled}`;

    if (this.renderCache.has(cacheKey)) {
      const cachedImage = this.renderCache.get(cacheKey);
      renderer.drawImage(cachedImage, 0, 0);
      return;
    }

    // Create off-screen canvas for caching
    const offscreenCanvas = new OffscreenCanvas(this.width, this.height);
    const offscreenRenderer = offscreenCanvas.getContext('2d');

    // Render preview to off-screen canvas
    this.drawPreview(offscreenRenderer);

    // Cache and draw
    this.renderCache.set(cacheKey, offscreenCanvas);
    renderer.drawImage(offscreenCanvas, 0, 0);
  }

  drawPreview(renderer) {
    // Color preview box with improved styling
    const gradient = renderer.createLinearGradient(0, 0, this.width, 0);
    gradient.addColorStop(0, this.value);
    gradient.addColorStop(1, this.value);

    renderer.fillStyle = gradient;
    renderer.fillRect(0, 0, this.width, this.height);

    // Enhanced border with theme support
    const borderColor = this.disabled
      ? ComponentTheme.getColor('disabled', this.theme)
      : this.isFocused
        ? ComponentTheme.getColor('focus', this.theme)
        : ComponentTheme.getColor('border', this.theme);

    renderer.strokeStyle = borderColor;
    renderer.lineWidth = this.isFocused ? 2 : 1;
    renderer.strokeRect(0, 0, this.width, this.height);

    // Improved dropdown arrow with theme support
    renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
    renderer.font = '12px Arial';
    renderer.textAlign = 'right';
    renderer.textBaseline = 'middle';
    renderer.fillText('▼', this.width - 10, this.height / 2);

    // Focus indicator
    if (this.isFocused) {
      this.drawFocusIndicator(renderer);
    }

    // Disabled overlay
    if (this.disabled) {
      renderer.fillStyle = 'rgba(255, 255, 255, 0.5)';
      renderer.fillRect(0, 0, this.width, this.height);
    }
  }

  drawFocusIndicator(renderer) {
    renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
    renderer.lineWidth = 2;
    renderer.setLineDash([2, 2]);
    renderer.strokeRect(
      INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_OFFSET,
      INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_OFFSET,
      this.width - INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_BORDER,
      this.height - INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_BORDER
    );
    renderer.setLineDash([]);
  }

  renderPicker(renderer) {
    // Apply animation progress
    const alpha = this.animationState.openProgress;
    renderer.globalAlpha = alpha;

    // Background with theme support
    renderer.fillStyle = ComponentTheme.getColor('background', this.theme);
    renderer.fillRect(0, 0, this.width, this.height);

    // Enhanced border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(0, 0, this.width, this.height);

    // Render components
    this.renderColorWheel(renderer);
    this.renderLightnessSlider(renderer);

    if (this.showAlpha) {
      this.renderAlphaSlider(renderer);
    }

    if (this.showPresets) {
      this.renderPresets(renderer);
    }

    this.renderCurrentColor(renderer);
    this.renderInstructions(renderer);

    renderer.globalAlpha = 1;
  }

  renderColorWheel(renderer) {
    const centerX = this.width / 2;
    const centerY = 125;
    const radius = 80;

    // Enhanced color wheel with better color accuracy
    const imageData = renderer.createImageData(radius * 2, radius * 2);
    const { data } = imageData;

    for (let y = 0; y < radius * 2; y++) {
      for (let x = 0; x < radius * 2; x++) {
        const dx = x - radius;
        const dy = y - radius;
        const distance = Math.sqrt(dx * dx + dy * dy);

        if (distance <= radius) {
          const angle = Math.atan2(dy, dx);
          const hue =
            ((angle * INPUT_UTILITY_CONSTANTS.DEGREES_TO_RADIANS_FACTOR) /
              Math.PI +
              INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES) %
            INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES;
          const saturation = Math.min(100, (distance / radius) * 100);

          const rgb = this.hslToRgb(
            hue,
            saturation,
            INPUT_UTILITY_CONSTANTS.COLOR_WHEEL_LIGHTNESS_DEFAULT
          );
          const index =
            (y * radius * 2 + x) * INPUT_UTILITY_CONSTANTS.RGBA_CHANNELS;

          data[index] = rgb.r; // Red
          data[index + 1] = rgb.g; // Green
          data[index + 2] = rgb.b; // Blue
          data[index + INPUT_UTILITY_CONSTANTS.ALPHA_CHANNEL_OFFSET] =
            INPUT_UTILITY_CONSTANTS.RGB_MAX_VALUE; // Alpha
        }
      }
    }

    renderer.putImageData(imageData, centerX - radius, centerY - radius);

    // Current color indicator
    this.renderColorIndicator(renderer, centerX, centerY, radius);
  }

  renderColorIndicator(renderer, centerX, centerY, radius) {
    const currentAngle =
      (this.hue * Math.PI) / INPUT_UTILITY_CONSTANTS.DEGREES_TO_RADIANS_FACTOR;
    const currentDistance = (this.saturation / 100) * radius;
    const indicatorX = centerX + Math.cos(currentAngle) * currentDistance;
    const indicatorY = centerY + Math.sin(currentAngle) * currentDistance;

    // Indicator ring
    renderer.strokeStyle = '#ffffff';
    renderer.lineWidth = 3;
    renderer.beginPath();
    renderer.arc(
      indicatorX,
      indicatorY,
      INPUT_UTILITY_CONSTANTS.COLOR_INDICATOR_RADIUS,
      0,
      Math.PI * 2
    );
    renderer.stroke();

    renderer.strokeStyle = '#000000';
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.arc(
      indicatorX,
      indicatorY,
      INPUT_UTILITY_CONSTANTS.COLOR_INDICATOR_RADIUS,
      0,
      Math.PI * 2
    );
    renderer.stroke();

    // Center dot
    renderer.fillStyle = this.value;
    renderer.beginPath();
    renderer.arc(
      indicatorX,
      indicatorY,
      INPUT_UTILITY_CONSTANTS.COLOR_INDICATOR_CENTER_RADIUS,
      0,
      Math.PI * 2
    );
    renderer.fill();
  }

  renderLightnessSlider(renderer) {
    const y = INPUT_UTILITY_CONSTANTS.LIGHTNESS_SLIDER_Y;
    const height = INPUT_UTILITY_CONSTANTS.SLIDER_HEIGHT;
    const startX = INPUT_UTILITY_CONSTANTS.SLIDER_START_MARGIN;
    const endX = this.width - INPUT_UTILITY_CONSTANTS.SLIDER_START_MARGIN;

    // Enhanced gradient with better color representation
    const steps = 50;
    const stepWidth = (endX - startX) / steps;

    for (let i = 0; i < steps; i++) {
      const lightness = (i / (steps - 1)) * 100;
      const rgb = this.hslToRgb(this.hue, this.saturation, lightness);

      renderer.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
      renderer.fillRect(startX + i * stepWidth, y, stepWidth + 1, height);
    }

    // Slider border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(startX, y, endX - startX, height);

    // Current lightness indicator
    const indicatorX = startX + (this.lightness / 100) * (endX - startX);
    this.renderSliderIndicator(renderer, indicatorX, y, height);
  }

  renderAlphaSlider(renderer) {
    const y = INPUT_UTILITY_CONSTANTS.ALPHA_SLIDER_Y;
    const height = INPUT_UTILITY_CONSTANTS.SLIDER_HEIGHT;
    const startX = INPUT_UTILITY_CONSTANTS.SLIDER_START_MARGIN;
    const endX = this.width - INPUT_UTILITY_CONSTANTS.SLIDER_START_MARGIN;

    // Checkerboard pattern for transparency visualization
    this.renderCheckerboard(renderer, startX, y, endX - startX, height);

    // Alpha gradient
    const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
    const gradient = renderer.createLinearGradient(startX, y, endX, y);
    gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
    gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);

    renderer.fillStyle = gradient;
    renderer.fillRect(startX, y, endX - startX, height);

    // Slider border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(startX, y, endX - startX, height);

    // Current alpha indicator
    const indicatorX = startX + this.alpha * (endX - startX);
    this.renderSliderIndicator(renderer, indicatorX, y, height);
  }

  renderCheckerboard(renderer, x, y, width, height) {
    const checkSize = 8;
    const checksX = Math.ceil(width / checkSize);
    const checksY = Math.ceil(height / checkSize);

    for (let i = 0; i < checksX; i++) {
      for (let j = 0; j < checksY; j++) {
        const isEven = (i + j) % 2 === 0;
        renderer.fillStyle = isEven ? '#ffffff' : '#e0e0e0';
        renderer.fillRect(
          x + i * checkSize,
          y + j * checkSize,
          checkSize,
          checkSize
        );
      }
    }
  }

  renderSliderIndicator(renderer, x, y, height) {
    // Enhanced slider indicator with better visibility
    const indicatorWidth = INPUT_UTILITY_CONSTANTS.SLIDER_INDICATOR_WIDTH;
    const indicatorHeight =
      height + INPUT_UTILITY_CONSTANTS.INDICATOR_HEIGHT_OFFSET;
    const indicatorX = x - indicatorWidth / 2;
    const indicatorY = y - INPUT_UTILITY_CONSTANTS.SLIDER_INDICATOR_OFFSET;

    // Shadow
    renderer.fillStyle = 'rgba(0, 0, 0, 0.2)';
    renderer.fillRect(
      indicatorX + 1,
      indicatorY + 1,
      indicatorWidth,
      indicatorHeight
    );

    // Main indicator
    renderer.fillStyle = '#ffffff';
    renderer.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);

    // Border
    renderer.strokeStyle = '#000000';
    renderer.lineWidth = 1;
    renderer.strokeRect(
      indicatorX,
      indicatorY,
      indicatorWidth,
      indicatorHeight
    );

    // Arrow pointer
    renderer.beginPath();
    renderer.moveTo(
      x,
      y + height + INPUT_UTILITY_CONSTANTS.SLIDER_INDICATOR_OFFSET
    );
    renderer.lineTo(
      x - INPUT_UTILITY_CONSTANTS.SLIDER_INDICATOR_OFFSET,
      y + height + INPUT_UTILITY_CONSTANTS.INDICATOR_HEIGHT_OFFSET
    );
    renderer.lineTo(
      x + INPUT_UTILITY_CONSTANTS.SLIDER_INDICATOR_OFFSET,
      y + height + INPUT_UTILITY_CONSTANTS.INDICATOR_HEIGHT_OFFSET
    );
    renderer.closePath();
    renderer.fill();
    renderer.stroke();
  }

  renderPresets(renderer) {
    const y = 280;
    const height = 20;
    const startX = 20;
    const presetWidth =
      (this.width - INPUT_UTILITY_CONSTANTS.COLOR_DISPLAY_MARGIN) /
      this.presets.length;

    this.presets.forEach((preset, index) => {
      const x = startX + index * presetWidth;
      const color = preset.color || preset;
      const isSelected = color === this.value;

      // Preset color
      renderer.fillStyle = color;
      renderer.fillRect(
        x + INPUT_UTILITY_CONSTANTS.PRESET_BORDER_OFFSET,
        y + INPUT_UTILITY_CONSTANTS.PRESET_BORDER_OFFSET,
        presetWidth - INPUT_UTILITY_CONSTANTS.PRESET_BORDER_SIZE,
        height - INPUT_UTILITY_CONSTANTS.PRESET_BORDER_HEIGHT
      );

      // Border with selection highlight
      renderer.strokeStyle = isSelected
        ? ComponentTheme.getColor('focus', this.theme)
        : ComponentTheme.getColor('border', this.theme);
      renderer.lineWidth = isSelected ? 2 : 1;
      renderer.strokeRect(
        x + INPUT_UTILITY_CONSTANTS.PRESET_BORDER_OFFSET,
        y + INPUT_UTILITY_CONSTANTS.PRESET_BORDER_OFFSET,
        presetWidth - INPUT_UTILITY_CONSTANTS.PRESET_BORDER_SIZE,
        height - INPUT_UTILITY_CONSTANTS.PRESET_BORDER_HEIGHT
      );

      // Accessibility: Add preset name if available
      if (preset.name && this.isFocused) {
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.font = '10px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'top';
        renderer.fillText(
          preset.name.substring(0, INPUT_UTILITY_CONSTANTS.PRESET_NAME_LENGTH),
          x + presetWidth / 2,
          y + height + 2
        );
      }
    });
  }

  renderCurrentColor(renderer) {
    const x = INPUT_UTILITY_CONSTANTS.SLIDER_START_MARGIN;
    const y = this.height - INPUT_UTILITY_CONSTANTS.COLOR_DISPLAY_MARGIN;
    const width = this.width - INPUT_UTILITY_CONSTANTS.COLOR_DISPLAY_MARGIN;
    const height = 20;

    // Background for alpha visualization
    this.renderCheckerboard(renderer, x, y, width, height);

    // Current color
    renderer.fillStyle = this.value;
    renderer.fillRect(x, y, width, height);

    // Border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(x, y, width, height);

    // Color value text with theme support
    renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
    renderer.font = '11px monospace';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'top';
    renderer.fillText(this.value, this.width / 2, y + height + 2);
  }

  renderInstructions(renderer) {
    if (!this.isFocused) return;

    const instructions = [
      'Arrow keys: Adjust hue/lightness',
      'Shift+Arrows: Adjust saturation',
      'Enter: Confirm, Esc: Cancel',
    ];

    renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
    renderer.font = '10px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'top';

    instructions.forEach((instruction, index) => {
      renderer.fillText(
        instruction,
        INPUT_UTILITY_CONSTANTS.INSTRUCTION_MARGIN,
        INPUT_UTILITY_CONSTANTS.INSTRUCTION_MARGIN +
          index * INPUT_UTILITY_CONSTANTS.INSTRUCTION_LINE_HEIGHT
      );
    });
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

  async setValue(value) {
    try {
      if (!this.isValidColor(value)) {
        throw new ComponentError(
          `Invalid color value: ${value}`,
          'ColorPicker'
        );
      }

      const oldValue = this.value;
      this.value = value;
      this.parseColor();
      this.clearRenderCache();

      if (oldValue !== this.value) {
        this.emit('colorChanged', {
          value: this.value,
          oldValue,
          hsl: { h: this.hue, s: this.saturation, l: this.lightness },
          alpha: this.alpha,
        });
      }
    } catch (error) {
      this.errorHandler.handle(error, 'setValue');
    }
  }

  getColorComponents() {
    return {
      hue: this.hue,
      saturation: this.saturation,
      lightness: this.lightness,
      alpha: this.alpha,
      rgb: this.hslToRgb(this.hue, this.saturation, this.lightness),
    };
  }

  setColorComponents({ hue, saturation, lightness, alpha }) {
    if (hue !== undefined)
      this.hue = Math.max(
        0,
        Math.min(INPUT_UTILITY_CONSTANTS.HUE_MAX_DEGREES, hue)
      );
    if (saturation !== undefined)
      this.saturation = Math.max(0, Math.min(100, saturation));
    if (lightness !== undefined)
      this.lightness = Math.max(0, Math.min(100, lightness));
    if (alpha !== undefined) this.alpha = Math.max(0, Math.min(1, alpha));

    this.updateValue();
  }

  reset() {
    this.value = '#ff0000';
    this.hue = 0;
    this.saturation = 100;
    this.lightness = 50;
    this.alpha = 1;
    this.isOpen = false;
    this.animationState.openProgress = 0;
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
    this.close();
    this.clearRenderCache();
    this.emit('disabled');
  }

  // Cleanup and memory management
  destroy() {
    try {
      // Cancel any active animations
      AnimationManager.cancelAnimation(this);

      // Remove global event listeners
      this.removeGlobalMouseHandlers();

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
      ComponentDebug.componentError('ColorPicker', error, 'cleanup');
    }
  }
}

export { ColorPicker };
