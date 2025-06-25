/**
 * Input and Utility Components - Modern Implementation
 * Advanced implementation of ColorPicker, DateTimePicker, NumberInput, Accordion, Drawer, and SearchBox
 * with accessibility, performance optimization, error handling, and modern features
 * 
 * Features:
 * - Full ARIA accessibility support
 * - Dark mode and theme adaptation
 * - Performance monitoring and optimization
 * - Error handling and validation
 * - Animation management
 * - Memory cleanup
 * - Keyboard navigation
 * - Touch/gesture support
 * - RTL language support
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import { BaseObject } from './enhanced-objects.js';

// Utility functions and constants
const ANIMATION_DEFAULTS = {
    duration: 300,
    easing: 'cubic-bezier(0.4, 0.0, 0.2, 1)',
    fillMode: 'forwards'
};

const ACCESSIBILITY_DEFAULTS = {
    announceChanges: true,
    highContrast: false,
    reducedMotion: false
};

const PERFORMANCE_THRESHOLDS = {
    renderTime: 16, // 60fps target
    memoryWarning: 50 * 1024 * 1024, // 50MB
    eventThrottle: 16 // ~60fps
};

/**
 * Utility class for managing component themes and accessibility
 */
class ComponentTheme {
    static themes = {
        light: {
            background: '#ffffff',
            surface: '#f8f9fa',
            primary: '#007bff',
            secondary: '#6c757d',
            text: '#333333',
            textSecondary: '#6c757d',
            border: '#dee2e6',
            focus: '#007bff',
            error: '#dc3545',
            warning: '#ffc107',
            success: '#28a745',
            disabled: '#e9ecef'
        },
        dark: {
            background: '#1a1a1a',
            surface: '#2d2d2d',
            primary: '#4da6ff',
            secondary: '#9da5b4',
            text: '#e0e0e0',
            textSecondary: '#9da5b4',
            border: '#404040',
            focus: '#4da6ff',
            error: '#ff5f5f',
            warning: '#ffcc02',
            success: '#4caf50',
            disabled: '#404040'
        },
        highContrast: {
            background: '#000000',
            surface: '#1a1a1a',
            primary: '#ffffff',
            secondary: '#cccccc',
            text: '#ffffff',
            textSecondary: '#cccccc',
            border: '#ffffff',
            focus: '#ffff00',
            error: '#ff0000',
            warning: '#ffff00',
            success: '#00ff00',
            disabled: '#666666'
        }
    };

    static getCurrentTheme() {
        const mediaQuery = window.matchMedia;
        const prefersColorScheme = mediaQuery && mediaQuery('(prefers-color-scheme: dark)').matches;
        const prefersHighContrast = mediaQuery && mediaQuery('(prefers-contrast: high)').matches;
        
        if (prefersHighContrast) return this.themes.highContrast;
        return prefersColorScheme ? this.themes.dark : this.themes.light;
    }

    static getColor(colorName, customTheme = null) {
        const theme = customTheme || this.getCurrentTheme();
        return theme[colorName] || theme.text;
    }
}

/**
 * Performance monitoring utility
 */
class PerformanceMonitor {
    static metrics = new Map();
    static isMonitoring = false;

    static startMonitoring(componentId) {
        if (!this.isMonitoring) return;
        
        this.metrics.set(componentId, {
            renderStart: performance.now(),
            memoryStart: this.getMemoryUsage()
        });
    }

    static endMonitoring(componentId) {
        if (!this.isMonitoring || !this.metrics.has(componentId)) return;
        
        const metrics = this.metrics.get(componentId);
        const renderTime = performance.now() - metrics.renderStart;
        const memoryUsage = this.getMemoryUsage();
        
        if (renderTime > PERFORMANCE_THRESHOLDS.renderTime) {
            console.warn(`Component ${componentId} render time exceeded threshold: ${renderTime}ms`);
        }
        
        if (memoryUsage > PERFORMANCE_THRESHOLDS.memoryWarning) {
            console.warn(`High memory usage detected: ${memoryUsage / 1024 / 1024}MB`);
        }
        
        this.metrics.delete(componentId);
    }

    static getMemoryUsage() {
        return performance.memory ? performance.memory.usedJSHeapSize : 0;
    }

    static enable() {
        this.isMonitoring = true;
    }

    static disable() {
        this.isMonitoring = false;
        this.metrics.clear();
    }
}

/**
 * Error handling utility
 */
class ComponentError extends Error {
    constructor(message, component, context = {}) {
        super(message);
        this.name = 'ComponentError';
        this.component = component;
        this.context = context;
        this.timestamp = new Date().toISOString();
    }
}

/**
 * Animation management utility
 */
class AnimationManager {
    static activeAnimations = new Map();
    static rafId = null;

    static animate(target, properties, options = {}) {
        const config = { ...ANIMATION_DEFAULTS, ...options };
        const animationId = `${target.id || 'unknown'}_${Date.now()}`;
        
        return new Promise((resolve, reject) => {
            try {
                const animation = {
                    target,
                    properties,
                    config,
                    startTime: performance.now(),
                    resolve,
                    reject
                };
                
                this.activeAnimations.set(animationId, animation);
                this.startAnimationLoop();
                
                // Auto-cleanup after duration
                setTimeout(() => {
                    if (this.activeAnimations.has(animationId)) {
                        this.activeAnimations.delete(animationId);
                        resolve();
                    }
                }, config.duration);
                
            } catch (error) {
                reject(new ComponentError('Animation failed', target.constructor.name, { error }));
            }
        });
    }

    static startAnimationLoop() {
        if (this.rafId) return;
        
        const updateAnimations = () => {
            const currentTime = performance.now();
            
            for (const [id, animation] of this.activeAnimations) {
                const elapsed = currentTime - animation.startTime;
                const progress = Math.min(elapsed / animation.config.duration, 1);
                
                // Apply easing
                const easedProgress = this.applyEasing(progress, animation.config.easing);
                
                // Update properties
                for (const [prop, target] of Object.entries(animation.properties)) {
                    const current = animation.target[prop] || 0;
                    const delta = target - current;
                    animation.target[prop] = current + (delta * easedProgress);
                }
                
                if (progress >= 1) {
                    this.activeAnimations.delete(id);
                    animation.resolve();
                }
            }
            
            if (this.activeAnimations.size > 0) {
                this.rafId = requestAnimationFrame(updateAnimations);
            } else {
                this.rafId = null;
            }
        };
        
        this.rafId = requestAnimationFrame(updateAnimations);
    }

    static applyEasing(progress, easing) {
        switch (easing) {
            case 'ease-in':
                return progress * progress;
            case 'ease-out':
                return 1 - Math.pow(1 - progress, 2);
            case 'ease-in-out':
                return progress < 0.5 ? 2 * progress * progress : 1 - Math.pow(-2 * progress + 2, 2) / 2;
            default:
                return progress;
        }
    }

    static cancelAnimation(target) {
        for (const [id, animation] of this.activeAnimations) {
            if (animation.target === target) {
                this.activeAnimations.delete(id);
                animation.reject(new ComponentError('Animation cancelled', target.constructor.name));
            }
        }
    }

    static cleanup() {
        this.activeAnimations.clear();
        if (this.rafId) {
            cancelAnimationFrame(this.rafId);
            this.rafId = null;
        }
    }
}

// =============================================================================
// MODERN COLOR PICKER COMPONENT
// =============================================================================

/**
 * Advanced ColorPicker component with accessibility, performance optimization,
 * and modern features including alpha support, color spaces, and presets.
 */
class ColorPicker extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 280,
            height: options.height || 320,
            ariaRole: 'button',
            ariaLabel: options.ariaLabel || 'Color picker'
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
        this.borderColor = options.borderColor || ComponentTheme.getColor('border', this.theme);
        this.backgroundColor = options.backgroundColor || ComponentTheme.getColor('background', this.theme);
        
        // State management
        this.isOpen = false;
        this.hue = 0;
        this.saturation = 100;
        this.lightness = 50;
        this.alpha = 1;
        this.lastValidColor = this.value;
        
        // Performance optimization
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Animation state
        this.animationState = {
            isAnimating: false,
            openProgress: this.isOpen ? 1 : 0
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
            throw new ComponentError(`Invalid color format: ${options.format}`, 'ColorPicker');
        }
        
        if (options.value && !this.isValidColor(options.value)) {
            console.warn(`Invalid initial color value: ${options.value}, using default`);
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
            { color: '#000080', name: 'Navy' }
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
            'ArrowLeft': () => this.adjustHue(-5),
            'ArrowRight': () => this.adjustHue(5),
            'ArrowUp': () => this.adjustLightness(5),
            'ArrowDown': () => this.adjustLightness(-5),
            'Shift+ArrowUp': () => this.adjustSaturation(5),
            'Shift+ArrowDown': () => this.adjustSaturation(-5),
            'Enter': () => this.confirmSelection(),
            'Escape': () => this.close(),
            'Tab': (event) => this.handleTabNavigation(event)
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
                
                console.error('ColorPicker Error:', componentError);
                this.emit('error', componentError);
                
                // Attempt recovery
                this.recoverFromError(context);
            }
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
            'click': this.handleClick.bind(this),
            'mouseMove': this.handleMouseMove.bind(this),
            'mouseDown': this.handleMouseDown.bind(this),
            'mouseUp': this.handleMouseUp.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this),
            'wheel': this.handleWheel.bind(this)
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
            this.resizeObserver = new ResizeObserver(entries => {
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
            let color = this.value;
            
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
        const b = parseInt(cleanHex.substr(4, 2), 16);
        
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
        if (values.length < 3 || values.some(isNaN)) {
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
        if (values.length < 3 || values.some(isNaN)) {
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
        const rgbPattern = /^rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+\s*(?:,\s*[\d.]+\s*)?\)$/;
        const hslPattern = /^hsla?\(\s*\d+\s*,\s*\d+%?\s*,\s*\d+%?\s*(?:,\s*[\d.]+\s*)?\)$/;
        
        return hexPattern.test(color) || rgbPattern.test(color) || hslPattern.test(color);
    }
    
    // Enhanced color space conversions with validation
    rgbToHsl(r, g, b) {
        r = Math.max(0, Math.min(255, r)) / 255;
        g = Math.max(0, Math.min(255, g)) / 255;
        b = Math.max(0, Math.min(255, b)) / 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0; // achromatic
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { 
            h: Math.round(h * 360), 
            s: Math.round(s * 100), 
            l: Math.round(l * 100) 
        };
    }
    
    hslToRgb(h, s, l) {
        h = ((h % 360) + 360) % 360; // Normalize hue
        s = Math.max(0, Math.min(100, s)) / 100;
        l = Math.max(0, Math.min(100, l)) / 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l; // achromatic
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, (h / 360) + 1/3);
            g = hue2rgb(p, q, h / 360);
            b = hue2rgb(p, q, (h / 360) - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
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
                    this.value = this.showAlpha ? 
                        `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.alpha})` :
                        `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                    break;
                case 'hsl':
                    this.value = this.showAlpha ?
                        `hsla(${Math.round(this.hue)}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%, ${this.alpha})` :
                        `hsl(${Math.round(this.hue)}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%)`;
                    break;
                case 'hsv':
                    const hsv = this.hslToHsv(this.hue, this.saturation, this.lightness);
                    this.value = `hsv(${Math.round(hsv.h)}, ${Math.round(hsv.s)}%, ${Math.round(hsv.v)}%)`;
                    break;
            }
            
            if (oldValue !== this.value) {
                this.lastValidColor = this.value;
                this.updateAccessibility();
                this.announceColorChange();
                this.emit('colorChanged', { 
                    value: this.value, 
                    hsl: { h: this.hue, s: this.saturation, l: this.lightness }, 
                    alpha: this.alpha,
                    rgb 
                });
            }
            
        } catch (error) {
            this.errorHandler.handle(error, 'value-update');
        }
    }
    
    rgbToHex(r, g, b) {
        const toHex = (n) => {
            const hex = Math.round(Math.max(0, Math.min(255, n))).toString(16);
            return hex.length === 1 ? '0' + hex : hex;
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
        const hue = this.hue;
        if (this.saturation < 10) return this.lightness > 90 ? 'white' : this.lightness < 10 ? 'black' : 'gray';
        if (hue < 15 || hue >= 345) return 'red';
        if (hue < 45) return 'orange';
        if (hue < 75) return 'yellow';
        if (hue < 165) return 'green';
        if (hue < 195) return 'cyan';
        if (hue < 255) return 'blue';
        if (hue < 285) return 'purple';
        if (hue < 315) return 'magenta';
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
                await AnimationManager.animate(this.animationState, 
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
                await AnimationManager.animate(this.animationState, 
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
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
      // Enhanced color selection with precision and validation
    handleColorSelection(x, y) {
        try {
            // Color wheel area (improved precision)
            if (y >= 50 && y < 200) {
                const centerX = this.width / 2;
                const centerY = 125;
                const radius = 80;
                
                const dx = x - centerX;
                const dy = y - centerY;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= radius) {
                    this.hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
                    this.saturation = Math.min(100, (distance / radius) * 100);
                    this.updateValue();
                }
            }
            
            // Lightness slider area
            if (y >= 220 && y <= 240 && x >= 20 && x <= this.width - 20) {
                this.lightness = Math.max(0, Math.min(100, ((x - 20) / (this.width - 40)) * 100));
                this.updateValue();
            }
            
            // Alpha slider area
            if (this.showAlpha && y >= 250 && y <= 270 && x >= 20 && x <= this.width - 20) {
                this.alpha = Math.max(0, Math.min(1, (x - 20) / (this.width - 40)));
                this.updateValue();
            }
            
            // Preset colors
            if (this.showPresets && y >= 280) {
                const presetWidth = (this.width - 40) / this.presets.length;
                const presetIndex = Math.floor((x - 20) / presetWidth);
                
                if (presetIndex >= 0 && presetIndex < this.presets.length) {
                    this.setValue(this.presets[presetIndex].color || this.presets[presetIndex]);
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'color-selection');
        }
    }
    
    // Keyboard navigation and adjustment methods
    adjustHue(delta) {
        this.hue = (this.hue + delta + 360) % 360;
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
            
            const key = event.key;
            const shiftKey = event.shiftKey;
            const ctrlKey = event.ctrlKey || event.metaKey;
            
            const keyCombo = [
                shiftKey && 'Shift',
                ctrlKey && 'Ctrl',
                key
            ].filter(Boolean).join('+');
            
            const handler = this.keyboardHandler[keyCombo] || this.keyboardHandler[key];
            
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
            const nextIndex = currentIndex > 0 ? currentIndex - 1 : focusableElements.length - 1;
            focusableElements[nextIndex]?.focus();
        } else {
            // Tab (next)
            const nextIndex = currentIndex < focusableElements.length - 1 ? currentIndex + 1 : 0;
            focusableElements[nextIndex]?.focus();
        }
        
        event.preventDefault();
    }
    
    getFocusableElements() {
        // Return array of focusable elements within the color picker
        return Array.from(this.element?.querySelectorAll('[tabindex]:not([tabindex="-1"])') || []);
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
            setTimeout(() => this.close(), 150);
        }
    }
    
    handleWheel(event) {
        if (!this.isFocused || this.disabled) return;
        
        try {
            event.preventDefault();
            
            const delta = event.deltaY > 0 ? -5 : 5;
            
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
        this.announcer.textContent = 'Use arrow keys to adjust color, Shift+arrows for saturation, Ctrl+arrows for lightness';
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
        const borderColor = this.disabled ? ComponentTheme.getColor('disabled', this.theme) :
                          this.isFocused ? ComponentTheme.getColor('focus', this.theme) :
                          ComponentTheme.getColor('border', this.theme);
        
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
        renderer.strokeRect(2, 2, this.width - 4, this.height - 4);
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
        const data = imageData.data;
        
        for (let y = 0; y < radius * 2; y++) {
            for (let x = 0; x < radius * 2; x++) {
                const dx = x - radius;
                const dy = y - radius;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance <= radius) {
                    const angle = Math.atan2(dy, dx);
                    const hue = (angle * 180 / Math.PI + 360) % 360;
                    const saturation = Math.min(100, (distance / radius) * 100);
                    
                    const rgb = this.hslToRgb(hue, saturation, 50);
                    const index = (y * radius * 2 + x) * 4;
                    
                    data[index] = rgb.r;     // Red
                    data[index + 1] = rgb.g; // Green
                    data[index + 2] = rgb.b; // Blue
                    data[index + 3] = 255;   // Alpha
                }
            }
        }
        
        renderer.putImageData(imageData, centerX - radius, centerY - radius);
        
        // Current color indicator
        this.renderColorIndicator(renderer, centerX, centerY, radius);
    }
    
    renderColorIndicator(renderer, centerX, centerY, radius) {
        const currentAngle = this.hue * Math.PI / 180;
        const currentDistance = (this.saturation / 100) * radius;
        const indicatorX = centerX + Math.cos(currentAngle) * currentDistance;
        const indicatorY = centerY + Math.sin(currentAngle) * currentDistance;
        
        // Indicator ring
        renderer.strokeStyle = '#ffffff';
        renderer.lineWidth = 3;
        renderer.beginPath();
        renderer.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2);
        renderer.stroke();
        
        renderer.strokeStyle = '#000000';
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.arc(indicatorX, indicatorY, 6, 0, Math.PI * 2);
        renderer.stroke();
        
        // Center dot
        renderer.fillStyle = this.value;
        renderer.beginPath();
        renderer.arc(indicatorX, indicatorY, 3, 0, Math.PI * 2);
        renderer.fill();
    }
      renderLightnessSlider(renderer) {
        const y = 220;
        const height = 20;
        const startX = 20;
        const endX = this.width - 20;
        
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
        const y = 250;
        const height = 20;
        const startX = 20;
        const endX = this.width - 20;
        
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
        const indicatorWidth = 8;
        const indicatorHeight = height + 8;
        const indicatorX = x - indicatorWidth / 2;
        const indicatorY = y - 4;
        
        // Shadow
        renderer.fillStyle = 'rgba(0, 0, 0, 0.2)';
        renderer.fillRect(indicatorX + 1, indicatorY + 1, indicatorWidth, indicatorHeight);
        
        // Main indicator
        renderer.fillStyle = '#ffffff';
        renderer.fillRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        // Border
        renderer.strokeStyle = '#000000';
        renderer.lineWidth = 1;
        renderer.strokeRect(indicatorX, indicatorY, indicatorWidth, indicatorHeight);
        
        // Arrow pointer
        renderer.beginPath();
        renderer.moveTo(x, y + height + 4);
        renderer.lineTo(x - 4, y + height + 8);
        renderer.lineTo(x + 4, y + height + 8);
        renderer.closePath();
        renderer.fill();
        renderer.stroke();
    }
    
    renderPresets(renderer) {
        const y = 280;
        const height = 20;
        const startX = 20;
        const presetWidth = (this.width - 40) / this.presets.length;
        
        this.presets.forEach((preset, index) => {
            const x = startX + index * presetWidth;
            const color = preset.color || preset;
            const isSelected = color === this.value;
            
            // Preset color
            renderer.fillStyle = color;
            renderer.fillRect(x + 1, y + 1, presetWidth - 3, height - 2);
            
            // Border with selection highlight
            renderer.strokeStyle = isSelected ? 
                ComponentTheme.getColor('focus', this.theme) : 
                ComponentTheme.getColor('border', this.theme);
            renderer.lineWidth = isSelected ? 2 : 1;
            renderer.strokeRect(x + 1, y + 1, presetWidth - 3, height - 2);
            
            // Accessibility: Add preset name if available
            if (preset.name && this.isFocused) {
                renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
                renderer.font = '10px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'top';
                renderer.fillText(
                    preset.name.substring(0, 3), 
                    x + presetWidth / 2, 
                    y + height + 2
                );
            }
        });
    }
    
    renderCurrentColor(renderer) {
        const x = 20;
        const y = this.height - 40;
        const width = this.width - 40;
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
            'Enter: Confirm, Esc: Cancel'
        ];
        
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '10px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        instructions.forEach((instruction, index) => {
            renderer.fillText(instruction, 5, 5 + index * 12);
        });
    }
    
    // Performance optimization methods
    clearRenderCache() {
        this.renderCache.clear();
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
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
                throw new ComponentError(`Invalid color value: ${value}`, 'ColorPicker');
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
                    alpha: this.alpha 
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
            rgb: this.hslToRgb(this.hue, this.saturation, this.lightness)
        };
    }
    
    setColorComponents({ hue, saturation, lightness, alpha }) {
        if (hue !== undefined) this.hue = Math.max(0, Math.min(360, hue));
        if (saturation !== undefined) this.saturation = Math.max(0, Math.min(100, saturation));
        if (lightness !== undefined) this.lightness = Math.max(0, Math.min(100, lightness));
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
            console.error('Error during ColorPicker cleanup:', error);
        }
    }
}

// =============================================================================
// MODERN ACCORDION COMPONENT
// =============================================================================

/**
 * Advanced Accordion component with accessibility, smooth animations,
 * and modern interaction patterns.
 */
class Accordion extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 400,
            height: options.height || 300,
            ariaRole: 'region',
            ariaLabel: options.ariaLabel || 'Accordion'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.items = options.items || [];
        this.allowMultiple = options.allowMultiple || false;
        this.expandedItems = new Set(options.expandedItems || []);
        this.animationDuration = options.animationDuration || 300;
        this.disabled = options.disabled || false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        this.headerHeight = options.headerHeight || 40;
        
        // Animation and performance
        this.animatingItems = new Map();
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.focusedItemIndex = -1;
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        try {
            this.setupItems();
            this.setupEventHandlers();
            this.setupAccessibility();
            this.setupResizeObserver();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.items && !Array.isArray(options.items)) {
            throw new ComponentError('Items must be an array', 'Accordion');
        }
        
        if (options.animationDuration && (typeof options.animationDuration !== 'number' || options.animationDuration < 0)) {
            throw new ComponentError('Animation duration must be a positive number', 'Accordion');
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
            'ArrowUp': () => this.navigateToItem(-1),
            'ArrowDown': () => this.navigateToItem(1),
            'Home': () => this.navigateToItem('first'),
            'End': () => this.navigateToItem('last'),
            'Enter': () => this.toggleFocusedItem(),
            'Space': () => this.toggleFocusedItem(),
            'Escape': () => this.collapseAll()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'Accordion',
                    { context, originalError: error }
                );
                
                console.error('Accordion Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'animation':
                this.animatingItems.clear();
                break;
            case 'render':
                this.clearRenderCache();
                break;
            default:
                this.reset();
        }
    }
    
    setupAccessibility() {
        // ARIA attributes
        this.setAttribute('role', 'region');
        this.setAttribute('aria-multiselectable', this.allowMultiple.toString());
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
                this.clearRenderCache();
                this.throttledRender();
            });
            
            if (this.element) {
                this.resizeObserver.observe(this.element);
            }
        }
    }
      setupItems() {
        this.items = this.items.map((item, index) => ({
            id: item.id || `item-${index}`,
            title: item.title || `Item ${index + 1}`,
            content: item.content || '',
            icon: item.icon || null,
            disabled: item.disabled || false,
            level: item.level || 1, // For hierarchical accordions
            ...item
        }));
        
        // Set up ARIA IDs for each item
        this.items.forEach((item, index) => {
            item.headerId = `accordion-header-${this.id}-${index}`;
            item.panelId = `accordion-panel-${this.id}-${index}`;
        });
    }
    
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced item management with animations
    async expandItem(itemId) {
        try {
            const item = this.items.find(i => i.id === itemId);
            if (!item || item.disabled || this.expandedItems.has(itemId)) return;
            
            if (!this.allowMultiple) {
                await this.collapseAll();
            }
            
            this.expandedItems.add(itemId);
            
            // Animate expansion
            if (!this.prefersReducedMotion()) {
                await this.animateItem(itemId, 'expand');
            }
            
            this.updateItemAccessibility(item, true);
            this.announceChange(`${item.title} expanded`);
            this.emit('itemExpanded', { itemId, item });
            
        } catch (error) {
            this.errorHandler.handle(error, 'expand-item');
        }
    }
    
    async collapseItem(itemId) {
        try {
            const item = this.items.find(i => i.id === itemId);
            if (!item || !this.expandedItems.has(itemId)) return;
            
            this.expandedItems.delete(itemId);
            
            // Animate collapse
            if (!this.prefersReducedMotion()) {
                await this.animateItem(itemId, 'collapse');
            }
            
            this.updateItemAccessibility(item, false);
            this.announceChange(`${item.title} collapsed`);
            this.emit('itemCollapsed', { itemId, item });
            
        } catch (error) {
            this.errorHandler.handle(error, 'collapse-item');
        }
    }
    
    async toggleItem(itemId) {
        if (this.expandedItems.has(itemId)) {
            await this.collapseItem(itemId);
        } else {
            await this.expandItem(itemId);
        }
    }
    
    async animateItem(itemId, type) {
        const animationConfig = {
            duration: this.animationDuration,
            easing: type === 'expand' ? 'ease-out' : 'ease-in'
        };
        
        const animationData = {
            type,
            startTime: performance.now(),
            duration: this.animationDuration
        };
        
        this.animatingItems.set(itemId, animationData);
        
        return new Promise((resolve) => {
            const animate = () => {
                const elapsed = performance.now() - animationData.startTime;
                const progress = Math.min(elapsed / this.animationDuration, 1);
                
                if (progress >= 1) {
                    this.animatingItems.delete(itemId);
                    resolve();
                } else {
                    requestAnimationFrame(animate);
                }
            };
            
            animate();
        });
    }
    
    updateItemAccessibility(item, isExpanded) {
        // Update ARIA attributes for screen readers
        if (this.element) {
            const header = this.element.querySelector(`#${item.headerId}`);
            const panel = this.element.querySelector(`#${item.panelId}`);
            
            if (header) {
                header.setAttribute('aria-expanded', isExpanded.toString());
            }
            
            if (panel) {
                panel.setAttribute('aria-hidden', (!isExpanded).toString());
            }
        }
    }
    
    // Enhanced keyboard navigation
    navigateToItem(direction) {
        try {
            const enabledItems = this.items.filter(item => !item.disabled);
            if (enabledItems.length === 0) return;
            
            let newIndex;
            
            switch (direction) {
                case 'first':
                    newIndex = 0;
                    break;
                case 'last':
                    newIndex = enabledItems.length - 1;
                    break;
                case 1: // Down
                    newIndex = Math.min(this.focusedItemIndex + 1, enabledItems.length - 1);
                    break;
                case -1: // Up
                    newIndex = Math.max(this.focusedItemIndex - 1, 0);
                    break;
                default:
                    return;
            }
            
            this.focusedItemIndex = newIndex;
            this.updateFocusedItem();
            
        } catch (error) {
            this.errorHandler.handle(error, 'navigation');
        }
    }
    
    updateFocusedItem() {
        const enabledItems = this.items.filter(item => !item.disabled);
        const focusedItem = enabledItems[this.focusedItemIndex];
        
        if (focusedItem) {
            this.announceChange(`Focused on ${focusedItem.title}`);
            this.emit('itemFocused', { item: focusedItem });
        }
    }
    
    toggleFocusedItem() {
        const enabledItems = this.items.filter(item => !item.disabled);
        const focusedItem = enabledItems[this.focusedItemIndex];
        
        if (focusedItem) {
            this.toggleItem(focusedItem.id);
        }
    }
    
    prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
      // Enhanced calculations with validation
    getItemHeight(item) {
        try {
            const isExpanded = this.expandedItems.has(item.id);
            const animation = this.animatingItems.get(item.id);
            
            if (!animation) {
                return isExpanded ? this.getContentHeight(item) : 0;
            }
            
            const elapsed = performance.now() - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            const contentHeight = this.getContentHeight(item);
            const easedProgress = this.easeInOut(progress);
            
            if (animation.type === 'expand') {
                return contentHeight * easedProgress;
            } else {
                return contentHeight * (1 - easedProgress);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'height-calculation');
            return 0;
        }
    }
    
    getContentHeight(item) {
        // Enhanced content height calculation
        if (!item.content) return 0;
        
        const baseHeight = 16;
        const padding = 24;
        const lines = item.content.split('\n');
        
        // Calculate wrapped lines for better height estimation
        let totalLines = 0;
        const maxWidth = this.width - 24;
        
        // Create temporary canvas for text measurement
        const tempCanvas = new OffscreenCanvas(1, 1);
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.font = '12px Arial';
        
        lines.forEach(line => {
            const wrappedLines = this.wrapText(tempCtx, line, maxWidth);
            totalLines += wrappedLines.length;
        });
        
        const estimatedHeight = totalLines * baseHeight + padding;
        
        return Math.max(60, estimatedHeight);
    }
    
    // Enhanced keyboard navigation
    handleKeyDown(event) {
        if (this.disabled) return;
        
        try {
            const handler = this.keyboardHandler[event.key];
            if (handler) {
                event.preventDefault();
                handler();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'keyboard-navigation');
        }
    }
    
    handleFocusIn() {
        this.isFocused = true;
        this.focusedItemIndex = this.focusedItemIndex >= 0 ? this.focusedItemIndex : 0;
        this.updateFocusedItem();
    }
    
    handleFocusOut() {
        this.isFocused = false;
        this.focusedItemIndex = -1;
    }
    
    // Public API with enhanced error handling
    async expandAll() {
        try {
            if (this.allowMultiple) {
                const promises = this.items
                    .filter(item => !item.disabled)
                    .map(item => this.expandItem(item.id));
                
                await Promise.all(promises);
                this.emit('allExpanded');
            }
        } catch (error) {
            this.errorHandler.handle(error, 'expand-all');
        }
    }
    
    async collapseAll() {
        try {
            const promises = Array.from(this.expandedItems)
                .map(itemId => this.collapseItem(itemId));
            
            await Promise.all(promises);
            this.emit('allCollapsed');
        } catch (error) {
            this.errorHandler.handle(error, 'collapse-all');
        }
    }
    
    // Performance optimization methods
    clearRenderCache() {
        this.renderCache.clear();
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Memory management and cleanup
    destroy() {
        try {
            // Cancel any active animations
            AnimationManager.cancelAnimation(this);
            
            // Clear animation state
            this.animatingItems.clear();
            
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
            console.error('Error during Accordion cleanup:', error);
        }
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    getItemBounds(itemIndex) {
        let y = 0;
        
        for (let i = 0; i < itemIndex; i++) {
            y += this.headerHeight + this.getItemHeight(this.items[i]);
        }
        
        return {
            x: 0,
            y,
            width: this.width,
            headerHeight: this.headerHeight,
            contentHeight: this.getItemHeight(this.items[itemIndex])
        };
    }
    
    getItemFromPosition(y) {
        let currentY = 0;
        
        for (let i = 0; i < this.items.length; i++) {
            const itemHeight = this.headerHeight + this.getItemHeight(this.items[i]);
            
            if (y >= currentY && y < currentY + itemHeight) {
                const isInHeader = y < currentY + this.headerHeight;
                return { item: this.items[i], index: i, isInHeader };
            }
            
            currentY += itemHeight;
        }
        
        return null;
    }
    
    // Event Handlers
    handleClick(event) {
        const { localY } = event;
        const result = this.getItemFromPosition(localY);
        
        if (result && result.isInHeader) {
            this.toggleItem(result.item.id);
        }
    }
    
    handleKeyDown(event) {
        // Implement keyboard navigation
        switch (event.key) {
            case 'ArrowUp':
                // Navigate to previous item
                break;
            case 'ArrowDown':
                // Navigate to next item
                break;
            case 'Enter':
            case ' ':
                // Toggle focused item
                break;
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        let currentY = 0;
        
        this.items.forEach((item, index) => {
            const bounds = this.getItemBounds(index);
            const isExpanded = this.expandedItems.has(item.id);
            
            // Render header
            this.renderItemHeader(renderer, item, bounds, isExpanded);
            
            // Render content if expanded
            if (isExpanded || this.animatingItems.has(item.id)) {
                this.renderItemContent(renderer, item, bounds);
            }
        });
        
        // Update animations
        this.updateAnimations();
    }
      renderItemHeader(renderer, item, bounds, isExpanded) {
        const backgroundColor = isExpanded ? 
            ComponentTheme.getColor('primaryHover', this.theme) : 
            ComponentTheme.getColor('background', this.theme);
        
        // Header background
        renderer.fillStyle = backgroundColor;
        renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);
        
        // Header border
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);
        
        // Focus indicator for keyboard navigation
        if (this.focusedItemIndex >= 0 && this.items[this.focusedItemIndex] === item) {
            renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
            renderer.lineWidth = 2;
            renderer.setLineDash([2, 2]);
            renderer.strokeRect(bounds.x + 2, bounds.y + 2, bounds.width - 4, bounds.headerHeight - 4);
            renderer.setLineDash([]);
        }
        
        // Expand/collapse icon
        const iconX = bounds.x + 12;
        const iconY = bounds.y + bounds.headerHeight / 2;
        
        renderer.fillStyle = item.disabled ? 
            ComponentTheme.getColor('disabled', this.theme) : 
            ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(isExpanded ? '▼' : '▶', iconX, iconY);
        
        // Item icon
        let textX = iconX + 20;
        if (item.icon) {
            renderer.fillStyle = item.disabled ? 
                ComponentTheme.getColor('disabled', this.theme) : 
                ComponentTheme.getColor('primary', this.theme);
            renderer.fillText(item.icon, textX, iconY);
            textX += 20;
        }
        
        // Title
        renderer.fillStyle = item.disabled ? 
            ComponentTheme.getColor('disabled', this.theme) : 
            ComponentTheme.getColor('text', this.theme);
        renderer.font = isExpanded ? 'bold 13px Arial' : '13px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        // Truncate title if too long
        const maxTitleWidth = bounds.width - textX - 12;
        const truncatedTitle = this.truncateText(renderer, item.title, maxTitleWidth);
        renderer.fillText(truncatedTitle, textX, iconY);
        
        // Disabled overlay
        if (item.disabled) {
            renderer.fillStyle = 'rgba(255, 255, 255, 0.6)';
            renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);
        }
    }
    
    truncateText(renderer, text, maxWidth) {
        const metrics = renderer.measureText(text);
        if (metrics.width <= maxWidth) {
            return text;
        }
        
        const ellipsis = '...';
        const ellipsisWidth = renderer.measureText(ellipsis).width;
        
        let truncated = text;
        while (renderer.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + ellipsis;
    }
      renderItemContent(renderer, item, bounds) {
        const contentY = bounds.y + bounds.headerHeight;
        const contentHeight = bounds.contentHeight;
        
        if (contentHeight <= 0) return;
        
        // Content background with theme support
        renderer.fillStyle = ComponentTheme.getColor('backgroundSecondary', this.theme);
        renderer.fillRect(bounds.x, contentY, bounds.width, contentHeight);
        
        // Content border
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.strokeRect(bounds.x, contentY, bounds.width, contentHeight);
        
        // Content text with theme support
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.font = '12px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        const lines = item.content.split('\n');
        const maxWidth = bounds.width - 24; // Account for padding
        
        lines.forEach((line, lineIndex) => {
            const wrappedLines = this.wrapText(renderer, line, maxWidth);
            wrappedLines.forEach((wrappedLine, wrapIndex) => {
                const totalLineIndex = lineIndex + wrapIndex;
                renderer.fillText(wrappedLine, bounds.x + 12, contentY + 12 + totalLineIndex * 16);
            });
        });
    }
    
    wrapText(renderer, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
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
        
        return lines.length ? lines : [''];
    }
    
    updateAnimations() {
        const now = Date.now();
        const toRemove = [];
        
        for (const [itemId, animation] of this.animatingItems) {
            const elapsed = now - animation.startTime;
            
            if (elapsed >= animation.duration) {
                toRemove.push(itemId);
            }
        }
        
        toRemove.forEach(itemId => {
            this.animatingItems.delete(itemId);
        });
        
        if (this.animatingItems.size > 0) {
            // Continue animation
            requestAnimationFrame(() => this.updateAnimations());
        }
    }
    
    // Public API
    addItem(item, index = -1) {
        const newItem = {
            id: item.id || `item-${Date.now()}`,
            title: item.title || 'New Item',
            content: item.content || '',
            icon: item.icon || null,
            disabled: item.disabled || false,
            ...item
        };
        
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 0, newItem);
        } else {
            this.items.push(newItem);
        }
        
        this.emit('itemAdded', { item: newItem, index });
    }
    
    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index >= 0) {
            const removedItem = this.items.splice(index, 1)[0];
            this.expandedItems.delete(itemId);
            this.animatingItems.delete(itemId);
            this.emit('itemRemoved', { item: removedItem, index });
        }
    }
    
    updateItem(itemId, updates) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, updates);
            this.emit('itemUpdated', { itemId, item, updates });
        }
    }
    
    expandAll() {
        this.items.forEach(item => {
            if (!item.disabled) {
                this.expandedItems.add(item.id);
            }
        });
        this.emit('allExpanded');
    }
    
    collapseAll() {
        this.expandedItems.clear();
        this.animatingItems.clear();
        this.emit('allCollapsed');
    }
}

// =============================================================================
// DATE TIME PICKER COMPONENT
// =============================================================================

class DateTimePicker extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 320,
            height: options.height || 280,
            ariaRole: 'application',
            ariaLabel: options.ariaLabel || 'Date Time Picker'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.value = options.value ? new Date(options.value) : new Date();
        this.format = options.format || 'MM/DD/YYYY';
        this.showTime = options.showTime !== false;
        this.show24Hour = options.show24Hour || false;
        this.minDate = options.minDate ? new Date(options.minDate) : null;
        this.maxDate = options.maxDate ? new Date(options.maxDate) : null;
        this.disabled = options.disabled || false;
        this.locale = options.locale || 'en-US';
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // State management
        this.isOpen = false;
        this.currentView = 'calendar'; // 'calendar', 'time'
        this.displayMonth = this.value.getMonth();
        this.displayYear = this.value.getFullYear();
        this.selectedHour = this.value.getHours();
        this.selectedMinute = this.value.getMinutes();
        this.focusedDate = new Date(this.value);
        
        // Animation and performance
        this.animationState = { openProgress: 0 };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
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
        if (options.value && !(options.value instanceof Date) && isNaN(new Date(options.value))) {
            throw new ComponentError('Invalid date value provided', 'DateTimePicker');
        }
        
        if (options.minDate && options.maxDate && new Date(options.minDate) > new Date(options.maxDate)) {
            throw new ComponentError('minDate cannot be greater than maxDate', 'DateTimePicker');
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
            'ArrowLeft': () => this.currentView === 'calendar' ? this.navigateDay(-1) : null,
            'ArrowRight': () => this.currentView === 'calendar' ? this.navigateDay(1) : null,
            'ArrowUp': () => this.currentView === 'calendar' ? this.navigateDay(-7) : null,
            'ArrowDown': () => this.currentView === 'calendar' ? this.navigateDay(7) : null,
            'Enter': () => this.confirmSelection(),
            'Escape': () => this.close(),
            'Home': () => this.goToToday(),
            'End': () => this.goToEndOfMonth(),
            'PageUp': () => this.navigateMonth(-1),
            'PageDown': () => this.navigateMonth(1),
            'Tab': (event) => this.handleTabNavigation(event)
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'DateTimePicker',
                    { context, originalError: error }
                );
                
                console.error('DateTimePicker Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'animation':
                this.animationState.openProgress = this.isOpen ? 1 : 0;
                break;
            case 'render':
                this.clearRenderCache();
                break;
            case 'navigation':
                this.focusedDate = new Date(this.value);
                break;
            default:
                this.reset();
        }
    }
    
    setupAccessibility() {
        // ARIA attributes
        this.setAttribute('role', 'application');
        this.setAttribute('aria-label', 'Date and time picker');
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Keyboard accessibility
        this.addEventListener('keydown', (event) => this.handleKeyDown(event));
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {                this.clearRenderCache();
                this.throttledRender();
            });
            
            if (this.element) {
                this.resizeObserver.observe(this.element);
            }
        }
    }
    
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced date/time management with validation
    async open() {
        if (this.isOpen || this.disabled) return;
        
        try {
            this.isOpen = true;
            this.focusedDate = new Date(this.value);
            
            if (!this.prefersReducedMotion()) {
                await this.animateOpen();
            } else {
                this.animationState.openProgress = 1;
            }
            
            this.announceChange('Date picker opened');
            this.emit('opened');
        } catch (error) {
            this.errorHandler.handle(error, 'open');
        }
    }
    
    async close() {
        if (!this.isOpen) return;
        
        try {
            this.isOpen = false;
            
            if (!this.prefersReducedMotion()) {
                await this.animateClose();
            } else {
                this.animationState.openProgress = 0;
            }
            
            this.announceChange('Date picker closed');
            this.emit('closed');
        } catch (error) {
            this.errorHandler.handle(error, 'close');
        }
    }
    
    async animateOpen() {
        return AnimationManager.animate(this, {
            duration: 200,
            easing: 'ease-out',
            update: (progress) => {
                this.animationState.openProgress = progress;
            }
        });
    }
    
    async animateClose() {
        return AnimationManager.animate(this, {
            duration: 150,
            easing: 'ease-in',
            update: (progress) => {
                this.animationState.openProgress = 1 - progress;
            }
        });
    }
    
    prefersReducedMotion() {
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
      // Enhanced date manipulation with validation
    formatDate(date) {
        try {
            const options = { 
                year: 'numeric', 
                month: '2-digit', 
                day: '2-digit'
            };
            
            switch (this.format) {
                case 'DD/MM/YYYY':
                    return date.toLocaleDateString(this.locale, options).split('/').reverse().join('/');
                case 'YYYY-MM-DD':
                    return date.toISOString().split('T')[0];
                default: // MM/DD/YYYY
                    return date.toLocaleDateString(this.locale, options);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'format-date');
            return '';
        }
    }
    
    formatTime(hour, minute) {
        try {
            if (this.show24Hour) {
                return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
            } else {
                const ampm = hour >= 12 ? 'PM' : 'AM';
                const displayHour = hour % 12 || 12;
                return `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;
            }
        } catch (error) {
            this.errorHandler.handle(error, 'format-time');
            return '';
        }
    }
    
    getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    getFirstDayOfMonth(month, year) {
        return new Date(year, month, 1).getDay();
    }
    
    isDateDisabled(date) {
        if (this.minDate && date < this.minDate) return true;
        if (this.maxDate && date > this.maxDate) return true;
        return false;
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    isSameDate(date1, date2) {
        return date1.toDateString() === date2.toDateString();
    }
    
    // Enhanced navigation with accessibility
    navigateDay(days) {
        try {
            const newDate = new Date(this.focusedDate);
            newDate.setDate(newDate.getDate() + days);
            
            if (!this.isDateDisabled(newDate)) {
                this.focusedDate = newDate;
                this.updateDisplayMonth();
                this.announceChange(`Focused on ${this.formatDate(this.focusedDate)}`);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'navigate-day');
        }
    }
    
    navigateMonth(direction) {
        try {
            this.displayMonth += direction;
            
            if (this.displayMonth < 0) {
                this.displayMonth = 11;
                this.displayYear--;
            } else if (this.displayMonth > 11) {
                this.displayMonth = 0;
                this.displayYear++;
            }
            
            // Update focused date to stay in view
            this.focusedDate = new Date(this.displayYear, this.displayMonth, 
                Math.min(this.focusedDate.getDate(), this.getDaysInMonth(this.displayMonth, this.displayYear)));
            
            this.announceChange(`Viewing ${this.getMonthNames()[this.displayMonth]} ${this.displayYear}`);
            this.clearRenderCache();
        } catch (error) {
            this.errorHandler.handle(error, 'navigate-month');
        }
    }
    
    updateDisplayMonth() {
        const focusedMonth = this.focusedDate.getMonth();
        const focusedYear = this.focusedDate.getFullYear();
        
        if (focusedMonth !== this.displayMonth || focusedYear !== this.displayYear) {
            this.displayMonth = focusedMonth;
            this.displayYear = focusedYear;
            this.clearRenderCache();
        }
    }
    
    goToToday() {
        try {
            const today = new Date();
            this.focusedDate = today;
            this.displayMonth = today.getMonth();
            this.displayYear = today.getFullYear();
            this.announceChange('Navigated to today');
            this.clearRenderCache();
        } catch (error) {
            this.errorHandler.handle(error, 'go-to-today');
        }
    }
    
    goToEndOfMonth() {
        try {
            const lastDay = this.getDaysInMonth(this.displayMonth, this.displayYear);
            this.focusedDate = new Date(this.displayYear, this.displayMonth, lastDay);
            this.announceChange(`Navigated to end of month: ${this.formatDate(this.focusedDate)}`);
        } catch (error) {
            this.errorHandler.handle(error, 'go-to-end-of-month');
        }
    }
    
    confirmSelection() {
        try {
            if (this.currentView === 'calendar') {
                this.selectDate(this.focusedDate);
                if (this.showTime) {
                    this.currentView = 'time';
                    this.announceChange('Switched to time selection');
                } else {
                    this.close();
                }
            } else if (this.currentView === 'time') {
                this.updateDateTime();
                this.close();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'confirm-selection');
        }
    }
    
    selectDate(date) {
        try {
            if (!this.isDateDisabled(date)) {
                this.value = new Date(date);
                this.value.setHours(this.selectedHour, this.selectedMinute, 0, 0);
                this.emit('dateChanged', { value: this.value });
                this.announceChange(`Selected ${this.formatDate(this.value)}`);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'select-date');
        }
    }
    
    getMonthNames() {
        return [
            'January', 'February', 'March', 'April', 'May', 'June',
            'July', 'August', 'September', 'October', 'November', 'December'
        ];
    }
      // Enhanced event handlers with accessibility
    handleClick(event) {
        if (this.disabled) return;
        
        try {
            const { localX, localY } = event;
            
            if (!this.isOpen) {
                this.open();
                return;
            }
            
            if (this.currentView === 'calendar') {
                this.handleCalendarClick(localX, localY);
            } else if (this.currentView === 'time') {
                this.handleTimeClick(localX, localY);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'click-handler');
        }
    }
    
    handleCalendarClick(x, y) {
        try {
            // Header navigation
            if (y < 40) {
                if (x < 40) {
                    this.navigateMonth(-1);
                } else if (x > this.width - 40) {
                    this.navigateMonth(1);
                } else if (this.showTime && x > this.width - 80) {
                    this.currentView = 'time';
                    this.announceChange('Switched to time selection');
                }
                return;
            }
            
            // Calendar grid
            const gridY = y - 70; // Account for header and day labels
            const cellWidth = this.width / 7;
            const cellHeight = 30;
            
            if (gridY >= 0) {
                const col = Math.floor(x / cellWidth);
                const row = Math.floor(gridY / cellHeight);
                
                const firstDay = this.getFirstDayOfMonth(this.displayMonth, this.displayYear);
                const dayNumber = row * 7 + col - firstDay + 1;
                const daysInMonth = this.getDaysInMonth(this.displayMonth, this.displayYear);
                
                if (dayNumber >= 1 && dayNumber <= daysInMonth) {
                    const selectedDate = new Date(this.displayYear, this.displayMonth, dayNumber);
                    
                    if (!this.isDateDisabled(selectedDate)) {
                        this.focusedDate = selectedDate;
                        this.selectDate(selectedDate);
                        
                        if (!this.showTime) {
                            this.close();
                        }
                    }
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'calendar-click');
        }
    }
    
    handleTimeClick(x, y) {
        try {
            // Time selection logic
            const centerX = this.width / 2;
            const centerY = this.height / 2;
            const radius = 80;
            
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                const angle = Math.atan2(dy, dx);
                const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
                
                if (distance < radius * 0.6) {
                    // Hour selection
                    this.selectedHour = Math.floor((normalizedAngle / (Math.PI * 2)) * 12);
                    if (!this.show24Hour && this.selectedHour === 0) {
                        this.selectedHour = 12;
                    }
                } else {
                    // Minute selection
                    this.selectedMinute = Math.floor((normalizedAngle / (Math.PI * 2)) * 60);
                }
                
                this.updateDateTime();
            }
            
            // Back to calendar button
            if (y < 40 && x < 80) {
                this.currentView = 'calendar';
                this.announceChange('Switched to calendar view');
            }
        } catch (error) {
            this.errorHandler.handle(error, 'time-click');
        }
    }
    
    handleKeyDown(event) {
        if (this.disabled) return;
        
        try {
            if (!this.isOpen) {
                if (event.key === 'Enter' || event.key === ' ') {
                    event.preventDefault();
                    this.open();
                }
                return;
            }
            
            const handler = this.keyboardHandler[event.key];
            if (handler) {
                event.preventDefault();
                handler(event);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'keyboard-handler');
        }
    }
    
    handleTabNavigation(event) {
        // Handle tab navigation within the picker
        const focusableElements = this.getFocusableElements();
        const currentIndex = focusableElements.indexOf(event.target);
        
        if (event.shiftKey) {
            // Shift+Tab - go backwards
            if (currentIndex <= 0) {
                event.preventDefault();
                focusableElements[focusableElements.length - 1]?.focus();
            }
        } else {
            // Tab - go forwards
            if (currentIndex >= focusableElements.length - 1) {
                event.preventDefault();
                focusableElements[0]?.focus();
            }
        }
    }
    
    getFocusableElements() {
        return Array.from(this.element?.querySelectorAll('[tabindex]:not([tabindex="-1"])') || []);
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
            setTimeout(() => this.close(), 150);
        }
    }
    
    handleFocusIn() {
        this.setAttribute('aria-describedby', 'date-picker-instructions');
        this.announcer.textContent = 'Use arrow keys to navigate dates, Enter to select, Escape to close';
    }
    
    handleFocusOut() {
        this.removeAttribute('aria-describedby');
    }
    
    updateDateTime() {
        try {
            this.value.setHours(this.selectedHour);
            this.value.setMinutes(this.selectedMinute);
            this.emit('dateChanged', { value: this.value });
            this.announceChange(`Time updated to ${this.formatTime(this.selectedHour, this.selectedMinute)}`);
        } catch (error) {
            this.errorHandler.handle(error, 'update-date-time');
        }
    }
      // Enhanced rendering with theme support and caching
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        try {
            PerformanceMonitor.startMonitoring('DateTimePicker');
            
            if (!this.isOpen && this.animationState.openProgress === 0) {
                this.renderInputField(renderer);
            } else {
                this.renderPicker(renderer);
            }
            
            PerformanceMonitor.endMonitoring('DateTimePicker');
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    renderInputField(renderer) {
        const cacheKey = `input_${this.formatDate(this.value)}_${this.width}_${this.height}_${this.disabled}`;
        
        if (this.renderCache.has(cacheKey)) {
            const cachedImage = this.renderCache.get(cacheKey);
            renderer.drawImage(cachedImage, 0, 0);
            return;
        }
        
        // Create off-screen canvas for caching
        const offscreenCanvas = new OffscreenCanvas(this.width, 40);
        const offscreenRenderer = offscreenCanvas.getContext('2d');
        
        // Render input field to off-screen canvas
        this.drawInputField(offscreenRenderer);
        
        // Cache and draw
        this.renderCache.set(cacheKey, offscreenCanvas);
        renderer.drawImage(offscreenCanvas, 0, 0);
    }
    
    drawInputField(renderer) {
        // Input field background
        renderer.fillStyle = this.disabled ? 
            ComponentTheme.getColor('disabled', this.theme) : 
            ComponentTheme.getColor('background', this.theme);
        renderer.fillRect(0, 0, this.width, 40);
        
        // Border with theme support
        const borderColor = this.disabled ? 
            ComponentTheme.getColor('border', this.theme) :
            this.isFocused ? ComponentTheme.getColor('focus', this.theme) :
            ComponentTheme.getColor('border', this.theme);
            
        renderer.strokeStyle = borderColor;
        renderer.lineWidth = this.isFocused ? 2 : 1;
        renderer.strokeRect(0, 0, this.width, 40);
        
        // Date text
        renderer.fillStyle = this.disabled ? 
            ComponentTheme.getColor('textDisabled', this.theme) : 
            ComponentTheme.getColor('text', this.theme);
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        let displayText = this.formatDate(this.value);
        if (this.showTime) {
            displayText += ' ' + this.formatTime(this.selectedHour, this.selectedMinute);
        }
        
        renderer.fillText(displayText, 12, 20);
        
        // Calendar icon
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '16px Arial';
        renderer.textAlign = 'right';
        renderer.fillText('📅', this.width - 12, 20);
        
        // Focus indicator
        if (this.isFocused) {
            this.drawFocusIndicator(renderer);
        }
        
        // Disabled overlay
        if (this.disabled) {
            renderer.fillStyle = 'rgba(255, 255, 255, 0.5)';
            renderer.fillRect(0, 0, this.width, 40);
        }
    }
    
    drawFocusIndicator(renderer) {
        renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
        renderer.lineWidth = 2;
        renderer.setLineDash([2, 2]);
        renderer.strokeRect(2, 2, this.width - 4, 36);
        renderer.setLineDash([]);
    }
    
    renderPicker(renderer) {
        // Apply animation progress
        const alpha = this.animationState.openProgress;
        renderer.globalAlpha = alpha;
        
        // Background
        renderer.fillStyle = ComponentTheme.getColor('background', this.theme);
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Shadow for depth
        renderer.shadowColor = 'rgba(0, 0, 0, 0.1)';
        renderer.shadowBlur = 10;
        renderer.shadowOffsetY = 5;
        
        if (this.currentView === 'calendar') {
            this.renderCalendar(renderer);
        } else {
            this.renderTimePicker(renderer);
        }
        
        // Reset shadow
        renderer.shadowColor = 'transparent';
        renderer.shadowBlur = 0;
        renderer.shadowOffsetY = 0;
        
        renderer.globalAlpha = 1;
    }
      renderCalendar(renderer) {
        // Header
        this.renderCalendarHeader(renderer);
        
        // Day labels
        this.renderDayLabels(renderer);
        
        // Calendar grid
        this.renderCalendarGrid(renderer);
        
        // Instructions for accessibility
        if (this.isFocused) {
            this.renderInstructions(renderer);
        }
    }
    
    renderCalendarHeader(renderer) {
        // Header background
        renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
        renderer.fillRect(0, 0, this.width, 40);
        
        // Month/Year text
        const monthNames = this.getMonthNames();
        
        renderer.fillStyle = ComponentTheme.getColor('onPrimary', this.theme);
        renderer.font = 'bold 14px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(`${monthNames[this.displayMonth]} ${this.displayYear}`, this.width / 2, 20);
        
        // Navigation arrows with hover states
        renderer.font = '16px Arial';
        renderer.textAlign = 'center';
        renderer.fillText('‹', 20, 20); // Previous month
        renderer.fillText('›', this.width - 20, 20); // Next month
        
        // Time button
        if (this.showTime) {
            renderer.font = '12px Arial';
            renderer.textAlign = 'right';
            renderer.fillText('Time', this.width - 50, 20);
        }
    }
    
    renderDayLabels(renderer) {
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const cellWidth = this.width / 7;
        
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = 'bold 12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        
        dayLabels.forEach((label, index) => {
            const x = index * cellWidth + cellWidth / 2;
            renderer.fillText(label, x, 55);
        });
        
        // Separator line
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(0, 65);
        renderer.lineTo(this.width, 65);
        renderer.stroke();
    }
    
    renderCalendarGrid(renderer) {
        const cellWidth = this.width / 7;
        const cellHeight = 30;
        const startY = 70;
        
        const firstDay = this.getFirstDayOfMonth(this.displayMonth, this.displayYear);
        const daysInMonth = this.getDaysInMonth(this.displayMonth, this.displayYear);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayIndex = firstDay + day - 1;
            const row = Math.floor(dayIndex / 7);
            const col = dayIndex % 7;
            
            const x = col * cellWidth;
            const y = startY + row * cellHeight;
            
            const date = new Date(this.displayYear, this.displayMonth, day);
            const isSelected = this.isSameDate(this.value, date);
            const isFocused = this.isSameDate(this.focusedDate, date);
            const isToday = this.isToday(date);
            const isDisabled = this.isDateDisabled(date);
            
            // Cell background
            if (isSelected) {
                renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
                renderer.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            } else if (isFocused) {
                renderer.fillStyle = ComponentTheme.getColor('primaryLight', this.theme);
                renderer.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            } else if (isToday) {
                renderer.fillStyle = ComponentTheme.getColor('warning', this.theme);
                renderer.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            }
            
            // Focus indicator
            if (isFocused) {
                renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
                renderer.lineWidth = 2;
                renderer.setLineDash([2, 2]);
                renderer.strokeRect(x + 1, y + 1, cellWidth - 2, cellHeight - 2);
                renderer.setLineDash([]);
            }
            
            // Day number
            renderer.fillStyle = isDisabled ? 
                ComponentTheme.getColor('textDisabled', this.theme) : 
                isSelected ? ComponentTheme.getColor('onPrimary', this.theme) :
                isToday ? ComponentTheme.getColor('onWarning', this.theme) :
                ComponentTheme.getColor('text', this.theme);
                
            renderer.font = isSelected ? 'bold 14px Arial' : '14px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(day.toString(), x + cellWidth / 2, y + cellHeight / 2);
            
            // Disabled overlay
            if (isDisabled) {
                renderer.fillStyle = 'rgba(128, 128, 128, 0.5)';
                renderer.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            }
        }
    }
    
    renderInstructions(renderer) {
        const instructions = [
            'Arrow keys: Navigate',
            'Enter: Select, Esc: Close',
            'Home: Today, PgUp/PgDn: Month'
        ];
        
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '10px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        instructions.forEach((instruction, index) => {
            renderer.fillText(instruction, 5, this.height - 45 + index * 12);
        });
    }
      renderTimePicker(renderer) {
        // Header
        this.renderTimeHeader(renderer);
        
        // Clock face
        this.renderClockFace(renderer);
        
        // Digital time display
        this.renderDigitalTime(renderer);
        
        // Instructions for accessibility
        if (this.isFocused) {
            this.renderTimeInstructions(renderer);
        }
    }
    
    renderTimeHeader(renderer) {
        // Header background
        renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
        renderer.fillRect(0, 0, this.width, 40);
        
        // Back button
        renderer.fillStyle = ComponentTheme.getColor('onPrimary', this.theme);
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText('← Calendar', 12, 20);
        
        // Time display
        const timeText = this.formatTime(this.selectedHour, this.selectedMinute);
        renderer.textAlign = 'center';
        renderer.font = 'bold 16px Arial';
        renderer.fillText(timeText, this.width / 2, 20);
    }
    
    renderClockFace(renderer) {
        const centerX = this.width / 2;
        const centerY = this.height / 2 + 20;
        const radius = 80;
        
        // Clock circle background
        renderer.fillStyle = ComponentTheme.getColor('backgroundSecondary', this.theme);
        renderer.beginPath();
        renderer.arc(centerX, centerY, radius, 0, Math.PI * 2);
        renderer.fill();
        
        // Clock circle border
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 2;
        renderer.beginPath();
        renderer.arc(centerX, centerY, radius, 0, Math.PI * 2);
        renderer.stroke();
        
        // Hour markers and numbers
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = centerX + Math.cos(angle) * (radius - 15);
            const y1 = centerY + Math.sin(angle) * (radius - 15);
            const x2 = centerX + Math.cos(angle) * (radius - 8);
            const y2 = centerY + Math.sin(angle) * (radius - 8);
            
            // Hour marker lines
            renderer.strokeStyle = ComponentTheme.getColor('textSecondary', this.theme);
            renderer.lineWidth = i % 3 === 0 ? 3 : 1;
            renderer.beginPath();
            renderer.moveTo(x1, y1);
            renderer.lineTo(x2, y2);
            renderer.stroke();
            
            // Hour numbers
            const hour = i === 0 ? 12 : i;
            const textX = centerX + Math.cos(angle) * (radius - 25);
            const textY = centerY + Math.sin(angle) * (radius - 25);
            
            renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
            renderer.font = i % 3 === 0 ? 'bold 14px Arial' : '12px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(hour.toString(), textX, textY);
        }
        
        // Minute markers (every 5 minutes)
        for (let i = 0; i < 60; i += 5) {
            if (i % 15 !== 0) { // Skip quarter hours
                const angle = (i * 6 - 90) * Math.PI / 180;
                const x1 = centerX + Math.cos(angle) * (radius - 10);
                const y1 = centerY + Math.sin(angle) * (radius - 10);
                const x2 = centerX + Math.cos(angle) * (radius - 5);
                const y2 = centerY + Math.sin(angle) * (radius - 5);
                
                renderer.strokeStyle = ComponentTheme.getColor('textSecondary', this.theme);
                renderer.lineWidth = 1;
                renderer.beginPath();
                renderer.moveTo(x1, y1);
                renderer.lineTo(x2, y2);
                renderer.stroke();
            }
        }
        
        // Selected hour indicator
        const hourAngle = ((this.selectedHour % 12) * 30 - 90) * Math.PI / 180;
        const hourX = centerX + Math.cos(hourAngle) * (radius * 0.5);
        const hourY = centerY + Math.sin(hourAngle) * (radius * 0.5);
        
        renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
        renderer.beginPath();
        renderer.arc(hourX, hourY, 8, 0, Math.PI * 2);
        renderer.fill();
        
        // Hour hand
        renderer.strokeStyle = ComponentTheme.getColor('primary', this.theme);
        renderer.lineWidth = 4;
        renderer.beginPath();
        renderer.moveTo(centerX, centerY);
        renderer.lineTo(hourX, hourY);
        renderer.stroke();
        
        // Selected minute indicator
        const minuteAngle = (this.selectedMinute * 6 - 90) * Math.PI / 180;
        const minuteX = centerX + Math.cos(minuteAngle) * (radius * 0.8);
        const minuteY = centerY + Math.sin(minuteAngle) * (radius * 0.8);
        
        renderer.fillStyle = ComponentTheme.getColor('secondary', this.theme);
        renderer.beginPath();
        renderer.arc(minuteX, minuteY, 6, 0, Math.PI * 2);
        renderer.fill();
        
        // Minute hand
        renderer.strokeStyle = ComponentTheme.getColor('secondary', this.theme);
        renderer.lineWidth = 3;
        renderer.beginPath();
        renderer.moveTo(centerX, centerY);
        renderer.lineTo(minuteX, minuteY);
        renderer.stroke();
        
        // Center dot
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.beginPath();
        renderer.arc(centerX, centerY, 4, 0, Math.PI * 2);
        renderer.fill();
    }
    
    renderDigitalTime(renderer) {
        const timeText = this.formatTime(this.selectedHour, this.selectedMinute);
        
        renderer.fillStyle = ComponentTheme.getColor('background', this.theme);
        renderer.fillRect(this.width / 2 - 60, this.height - 50, 120, 30);
        
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.strokeRect(this.width / 2 - 60, this.height - 50, 120, 30);
        
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.font = 'bold 18px monospace';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(timeText, this.width / 2, this.height - 35);
    }
    
    renderTimeInstructions(renderer) {
        const instructions = [
            'Click clock: Set time',
            'Enter: Confirm, Esc: Cancel'
        ];
        
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '10px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        instructions.forEach((instruction, index) => {
            renderer.fillText(instruction, 5, 5 + index * 12);
        });
    }
    
    // Performance optimization methods
    clearRenderCache() {
        this.renderCache.clear();
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API with enhanced error handling
    getValue() {
        return new Date(this.value);
    }
    
    async setValue(value) {
        try {
            const newDate = new Date(value);
            if (isNaN(newDate.getTime())) {
                throw new ComponentError(`Invalid date value: ${value}`, 'DateTimePicker');
            }
            
            if (this.isDateDisabled(newDate)) {
                throw new ComponentError('Date is disabled', 'DateTimePicker');
            }
            
            const oldValue = new Date(this.value);
            this.value = newDate;
            this.selectedHour = newDate.getHours();
            this.selectedMinute = newDate.getMinutes();
            this.displayMonth = newDate.getMonth();
            this.displayYear = newDate.getFullYear();
            this.focusedDate = new Date(newDate);
            
            this.clearRenderCache();
            
            if (oldValue.getTime() !== this.value.getTime()) {
                this.emit('dateChanged', { 
                    value: this.value, 
                    oldValue,
                    formatted: {
                        date: this.formatDate(this.value),
                        time: this.formatTime(this.selectedHour, this.selectedMinute)
                    }
                });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'setValue');
        }
    }
    
    reset() {
        const today = new Date();
        this.value = today;
        this.selectedHour = today.getHours();
        this.selectedMinute = today.getMinutes();
        this.displayMonth = today.getMonth();
        this.displayYear = today.getFullYear();
        this.focusedDate = new Date(today);
        this.isOpen = false;
        this.currentView = 'calendar';
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
            console.error('Error during DateTimePicker cleanup:', error);
        }
    }
}

// =============================================================================
// NUMBER INPUT COMPONENT
// =============================================================================

class NumberInput extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 150,
            height: options.height || 40,
            ariaRole: 'spinbutton',
            ariaLabel: options.ariaLabel || 'Number Input'
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
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
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
        if (options.min !== undefined && options.max !== undefined && options.min > options.max) {
            throw new ComponentError('min cannot be greater than max', 'NumberInput');
        }
        
        if (options.step !== undefined && (typeof options.step !== 'number' || options.step <= 0)) {
            throw new ComponentError('step must be a positive number', 'NumberInput');
        }
        
        if (options.precision !== undefined && (!Number.isInteger(options.precision) || options.precision < 0)) {
            throw new ComponentError('precision must be a non-negative integer', 'NumberInput');
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
            'ArrowUp': () => this.increment(),
            'ArrowDown': () => this.decrement(),
            'Enter': () => this.commitEdit(),
            'Escape': () => this.cancelEdit(),
            'Home': () => this.setValue(this.min),
            'End': () => this.setValue(this.max),
            'PageUp': () => this.setValue(this.value + this.step * 10),
            'PageDown': () => this.setValue(this.value - this.step * 10)
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
                
                console.error('NumberInput Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
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
        this.addEventListener('keydown', (event) => this.handleKeyDown(event));
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
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
            'click': this.handleClick.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this),
            'wheel': this.handleWheel.bind(this),
            'mouseDown': this.handleMouseDown.bind(this),
            'mouseUp': this.handleMouseUp.bind(this)
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
                throw new ComponentError(`Invalid numeric value: ${value}`, 'NumberInput');
            }
            
            const oldValue = this.value;
            this.value = this.clampValue(numValue);
            this.clearRenderCache();
            
            if (oldValue !== this.value) {
                this.emit('valueChanged', { 
                    value: this.value, 
                    oldValue,
                    formatted: this.formatValue(this.value)
                });
                
                if (announce) {
                    this.announceChange(`Value changed to ${this.formatValue(this.value)}`);
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
                cleanValue = cleanValue.substring(0, cleanValue.length - this.suffix.length);
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
            clamped = this.min + (steps * this.step);
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
            
            this.repeatInterval = setTimeout(repeat, 150);
        };
        
        // Initial delay before repeating
        this.repeatInterval = setTimeout(repeat, 500);
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
            
            if (this.showControls && localX > this.width - 20) {
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
            
            if (this.showControls && localX > this.width - 20) {
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
        this.announcer.textContent = 'Use arrow keys to adjust value, Enter to edit directly';
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
        if (key === '-' && (this.editingValue.includes('-') || this.editingValue.length > 0)) return false;
        
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
            renderer.fillStyle = this.disabled ? 
                ComponentTheme.getColor('disabled', this.theme) : 
                ComponentTheme.getColor('background', this.theme);
            renderer.fillRect(0, 0, this.width, this.height);
            
            // Border with focus state
            const borderColor = this.disabled ? 
                ComponentTheme.getColor('border', this.theme) :
                this.isFocused ? ComponentTheme.getColor('focus', this.theme) :
                ComponentTheme.getColor('border', this.theme);
                
            renderer.strokeStyle = borderColor;
            renderer.lineWidth = this.isFocused ? 2 : 1;
            renderer.strokeRect(0, 0, this.width, this.height);
            
            // Value text
            const displayValue = this.isEditing ? this.editingValue : this.formatValue(this.value);
            const textColor = this.disabled ? 
                ComponentTheme.getColor('textDisabled', this.theme) : 
                ComponentTheme.getColor('text', this.theme);
            
            renderer.fillStyle = textColor;
            renderer.font = '14px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            
            const placeholderText = displayValue || this.placeholder;
            const isPlaceholder = !displayValue && this.placeholder;
            
            if (isPlaceholder) {
                renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
                renderer.font = 'italic 14px Arial';
            }
            
            renderer.fillText(placeholderText, 8, this.height / 2);
            
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
            
            PerformanceMonitor.endMonitoring('NumberInput');        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    drawFocusIndicator(renderer) {
        renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
        renderer.lineWidth = 2;
        renderer.setLineDash([2, 2]);
        renderer.strokeRect(2, 2, this.width - 4, this.height - 4);
        renderer.setLineDash([]);    }
    
    renderSpinnerControls(renderer) {
        const controlWidth = 20;
        const controlX = this.width - controlWidth;
        
        // Separator line
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(controlX, 0);
        renderer.lineTo(controlX, this.height);
        renderer.stroke();
        
        // Control background on hover/active
        const controlBg = this.isMouseDownOnControl ? 
            ComponentTheme.getColor('primaryLight', this.theme) :
            ComponentTheme.getColor('background', this.theme);
            
        renderer.fillStyle = controlBg;
        renderer.fillRect(controlX + 1, 1, controlWidth - 2, this.height - 2);
        
        // Up arrow
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '10px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('▲', controlX + controlWidth / 2, this.height / 4);
        
        // Down arrow
        renderer.fillText('▼', controlX + controlWidth / 2, (this.height * 3) / 4);
    }
    
    renderCursor(renderer, text) {
        const textWidth = renderer.measureText(text).width;
        const cursorX = 8 + textWidth + 2;
        
        // Blinking cursor effect
        const shouldShow = Math.floor(Date.now() / 500) % 2 === 0;
        if (!shouldShow) return;
        
        renderer.strokeStyle = ComponentTheme.getColor('text', this.theme);
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(cursorX, 8);
        renderer.lineTo(cursorX, this.height - 8);
        renderer.stroke();
    }
    
    // Performance optimization methods
    clearRenderCache() {
        this.renderCache.clear();
    }
    
    throttle(func, limit) {
        let inThrottle;
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
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
            console.error('Error during NumberInput cleanup:', error);
        }
    }
}

// =============================================================================
// =============================================================================
// MODERN DRAWER COMPONENT
// =============================================================================

/**
 * Advanced Drawer component with accessibility, smooth animations,
 * theme support, and modern interaction patterns.
 */
class Drawer extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 300,
            height: options.height || 600,
            ariaRole: 'dialog',
            ariaLabel: options.ariaLabel || 'Drawer'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.isOpen = options.isOpen || false;
        this.position = options.position || 'left'; // 'left', 'right', 'top', 'bottom'
        this.modal = options.modal !== false;
        this.persistent = options.persistent || false;
        this.title = options.title || '';
        this.content = options.content || '';
        this.disabled = options.disabled || false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // Animation and performance
        this.animationDuration = options.animationDuration || 300;
        this.animationState = { 
            isAnimating: false, 
            progress: this.isOpen ? 1 : 0,
            type: null,
            startTime: 0
        };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        this.trapFocus = options.trapFocus !== false;
        this.restoreFocus = options.restoreFocus !== false;
        this.previouslyFocusedElement = null;
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('Drawer');
        
        try {
            this.setupEventHandlers();
            this.setupAccessibility();
            this.setupResizeObserver();
            this.setupTouchSupport();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        const validPositions = ['left', 'right', 'top', 'bottom'];
        if (options.position && !validPositions.includes(options.position)) {
            throw new ComponentError(`Invalid position: ${options.position}. Must be one of: ${validPositions.join(', ')}`, 'Drawer');
        }
        
        if (options.animationDuration && (typeof options.animationDuration !== 'number' || options.animationDuration < 0)) {
            throw new ComponentError('Animation duration must be a positive number', 'Drawer');
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
            'Escape': () => !this.persistent && this.close(),
            'Tab': (event) => this.handleTabNavigation(event),
            'Enter': () => this.handleEnterKey(),
            'Space': () => this.handleSpaceKey()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'Drawer',
                    { context, originalError: error }
                );
                
                console.error('Drawer Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'animation':
                this.animationState.isAnimating = false;
                AnimationManager.cancelAnimation(this);
                break;
            case 'render':
                this.clearRenderCache();
                break;
            default:
                this.reset();
        }
    }
      
    setupAccessibility() {
        // ARIA attributes
        this.setAttribute('role', 'dialog');
        this.setAttribute('aria-modal', this.modal.toString());
        this.setAttribute('aria-hidden', (!this.isOpen).toString());
        
        if (this.title) {
            this.setAttribute('aria-labelledby', `drawer-title-${this.id}`);
        }
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
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
            isDragging: false
        };
        
        this.addEventListener('touchstart', this.handleTouchStart.bind(this));
        this.addEventListener('touchmove', this.handleTouchMove.bind(this));
        this.addEventListener('touchend', this.handleTouchEnd.bind(this));
    }
    
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced drawer management with animations
    async open() {
        try {
            if (this.isOpen || this.animationState.isAnimating || this.disabled) return;
            
            this.isOpen = true;
            this.setAttribute('aria-hidden', 'false');
            
            // Store previously focused element for restoration
            if (this.restoreFocus && document.activeElement) {
                this.previouslyFocusedElement = document.activeElement;
            }
            
            // Animate opening
            if (!this.prefersReducedMotion()) {
                await this.startAnimation('open');
            } else {
                this.animationState.progress = 1;
            }
            
            // Focus management
            this.manageFocus();
            
            this.announceChange(`${this.title || 'Drawer'} opened`);
            this.emit('drawerOpened', { position: this.position });
            
        } catch (error) {
            this.errorHandler.handle(error, 'open');
        }
    }
    
    async close() {
        try {
            if (!this.isOpen || this.animationState.isAnimating) return;
            
            this.isOpen = false;
            this.setAttribute('aria-hidden', 'true');
            
            // Animate closing
            if (!this.prefersReducedMotion()) {
                await this.startAnimation('close');
            } else {
                this.animationState.progress = 0;
            }
            
            // Restore focus
            if (this.restoreFocus && this.previouslyFocusedElement) {
                this.previouslyFocusedElement.focus();
                this.previouslyFocusedElement = null;
            }
            
            this.announceChange(`${this.title || 'Drawer'} closed`);
            this.emit('drawerClosed', { position: this.position });
            
        } catch (error) {
            this.errorHandler.handle(error, 'close');
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
                
                if (type === 'open') {
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
        return window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
      
    getDrawerBounds() {
        const progress = this.animationState.progress;
        
        switch (this.position) {
            case 'left':
                return {
                    x: -this.width + (this.width * progress),
                    y: 0,
                    width: this.width,
                    height: this.height
                };
            case 'right':
                return {
                    x: this.width - (this.width * progress),
                    y: 0,
                    width: this.width,
                    height: this.height
                };
            case 'top':
                return {
                    x: 0,
                    y: -this.height + (this.height * progress),
                    width: this.width,
                    height: this.height
                };
            case 'bottom':
                return {
                    x: 0,
                    y: this.height - (this.height * progress),
                    width: this.width,
                    height: this.height
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
            if (this.title && localY >= bounds.y && localY < bounds.y + 50 && 
                localX >= bounds.x + bounds.width - 40 && localX < bounds.x + bounds.width) {
                this.close();
                return;
            }
            
            // Click on overlay (if modal and not persistent)
            if (this.modal && !this.persistent) {
                const isInsideDrawer = localX >= bounds.x && localX < bounds.x + bounds.width &&
                                      localY >= bounds.y && localY < bounds.y + bounds.height;
                
                if (!isInsideDrawer) {
                    this.close();
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'click-handler');
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
            this.errorHandler.handle(error, 'keyboard-handler');
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
        this.emit('enterPressed');
    }
    
    handleSpaceKey() {
        // Can be overridden for specific drawer actions
        this.emit('spacePressed');
    }
    
    handleFocusIn() {
        this.isFocused = true;
        this.emit('focusIn');
    }
    
    handleFocusOut() {
        this.isFocused = false;
        this.emit('focusOut');
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
    
    handleTouchEnd(event) {
        if (this.disabled || !this.isOpen || !this.touchState.isDragging) return;
        
        const deltaX = this.touchState.currentX - this.touchState.startX;
        const deltaY = this.touchState.currentY - this.touchState.startY;
        const threshold = 50;
        
        // Check for swipe to close based on drawer position
        let shouldClose = false;
        switch (this.position) {
            case 'left':
                shouldClose = deltaX < -threshold;
                break;
            case 'right':
                shouldClose = deltaX > threshold;
                break;
            case 'top':
                shouldClose = deltaY < -threshold;
                break;
            case 'bottom':
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
            'button',
            '[href]',
            'input',
            'select',
            'textarea',
            '[tabindex]:not([tabindex="-1"])'
        ];
        
        return Array.from(this.element?.querySelectorAll(selectors.join(',')) || [])
            .filter(el => !el.disabled && el.offsetParent !== null);
    }
      
    // Enhanced rendering with theme support
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        if (this.animationState.progress <= 0) return;
        
        try {
            this.performanceMonitor.startMeasurement('render');
            
            // Render overlay if modal
            if (this.modal) {
                this.renderOverlay(renderer);
            }
            
            // Render drawer
            this.renderDrawer(renderer);
            
            this.performanceMonitor.endMeasurement('render');
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    renderOverlay(renderer) {
        const alpha = this.animationState.progress * 0.5;
        const overlayColor = ComponentTheme.getColor('overlay', this.theme);
        
        // Parse overlay color or use default
        let baseColor = 'rgba(0, 0, 0, 0.5)';
        if (overlayColor.startsWith('rgba')) {
            const rgbaMatch = overlayColor.match(/rgba\(([^)]+)\)/);
            if (rgbaMatch) {
                const parts = rgbaMatch[1].split(',');
                if (parts.length >= 3) {
                    baseColor = `rgba(${parts[0]}, ${parts[1]}, ${parts[2]}, ${alpha})`;
                }
            }
        } else if (overlayColor.startsWith('rgb')) {
            const rgbMatch = overlayColor.match(/rgb\(([^)]+)\)/);
            if (rgbMatch) {
                baseColor = `rgba(${rgbMatch[1]}, ${alpha})`;
            }
        } else {
            // Hex or named color - convert to rgba
            baseColor = `rgba(0, 0, 0, ${alpha})`;
        }
        
        renderer.fillStyle = baseColor;
        renderer.fillRect(0, 0, this.width * 2, this.height * 2); // Cover entire viewport
    }
    
    renderDrawer(renderer) {
        const bounds = this.getDrawerBounds();
        
        // Enhanced shadow with theme support
        const shadowColor = ComponentTheme.getColor('shadow', this.theme) || 'rgba(0, 0, 0, 0.15)';
        renderer.shadowColor = shadowColor;
        renderer.shadowBlur = 12;
        renderer.shadowOffsetX = this.position === 'left' ? 3 : this.position === 'right' ? -3 : 0;
        renderer.shadowOffsetY = this.position === 'top' ? 3 : this.position === 'bottom' ? -3 : 0;
        
        // Drawer background with theme support
        renderer.fillStyle = ComponentTheme.getColor('background', this.theme);
        renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Reset shadow
        renderer.shadowColor = 'transparent';
        renderer.shadowBlur = 0;
        renderer.shadowOffsetX = 0;
        renderer.shadowOffsetY = 0;
        
        // Drawer border with theme support
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
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
        const headerHeight = 50;
        
        // Header background with theme support
        renderer.fillStyle = ComponentTheme.getColor('backgroundSecondary', this.theme);
        renderer.fillRect(bounds.x, bounds.y, bounds.width, headerHeight);
        
        // Header border with theme support
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(bounds.x, bounds.y + headerHeight);
        renderer.lineTo(bounds.x + bounds.width, bounds.y + headerHeight);
        renderer.stroke();
        
        // Title with theme support and truncation
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.font = 'bold 16px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        const maxTitleWidth = bounds.width - 60; // Account for close button
        const truncatedTitle = this.truncateText(renderer, this.title, maxTitleWidth);
        renderer.fillText(truncatedTitle, bounds.x + 16, bounds.y + headerHeight / 2);
        
        // Enhanced close button with hover state
        const closeButtonX = bounds.x + bounds.width - 30;
        const closeButtonY = bounds.y + headerHeight / 2;
        
        // Close button background (optional hover effect)
        if (this.isCloseButtonHovered) {
            renderer.fillStyle = ComponentTheme.getColor('dangerHover', this.theme);
            renderer.beginPath();
            renderer.arc(closeButtonX, closeButtonY, 12, 0, Math.PI * 2);
            renderer.fill();
        }
        
        // Close button icon
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '18px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('×', closeButtonX, closeButtonY);
    }
    
    renderContent(renderer, bounds) {
        const contentY = bounds.y + (this.title ? 50 : 0);
        const contentHeight = bounds.height - (this.title ? 50 : 0);
        const padding = 16;
        
        // Content area with theme support
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        // Enhanced content rendering with line wrapping
        const lines = this.content.split('\n');
        const maxWidth = bounds.width - (padding * 2);
        let currentY = contentY + padding;
        
        lines.forEach(line => {
            const wrappedLines = this.wrapText(renderer, line, maxWidth);
            wrappedLines.forEach(wrappedLine => {
                if (currentY + 20 <= contentY + contentHeight - padding) {
                    renderer.fillText(wrappedLine, bounds.x + padding, currentY);
                    currentY += 20;
                }
            });
        });
    }
    
    renderFocusIndicator(renderer, bounds) {
        renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
        renderer.lineWidth = 2;
        renderer.setLineDash([3, 3]);
        renderer.strokeRect(bounds.x + 2, bounds.y + 2, bounds.width - 4, bounds.height - 4);
        renderer.setLineDash([]);
    }
    
    wrapText(renderer, text, maxWidth) {
        const words = text.split(' ');
        const lines = [];
        let currentLine = '';
        
        for (const word of words) {
            const testLine = currentLine + (currentLine ? ' ' : '') + word;
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
        
        return lines.length ? lines : [''];
    }
    
    truncateText(renderer, text, maxWidth) {
        const metrics = renderer.measureText(text);
        if (metrics.width <= maxWidth) {
            return text;
        }
        
        const ellipsis = '...';
        const ellipsisWidth = renderer.measureText(ellipsis).width;
        
        let truncated = text;
        while (renderer.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 0) {
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
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API with enhanced error handling
    setTitle(title) {
        this.title = title;
        if (this.title) {
            this.setAttribute('aria-labelledby', `drawer-title-${this.id}`);
        }
        this.clearRenderCache();
        this.emit('titleChanged', { title });
    }
    
    setContent(content) {
        this.content = content;
        this.clearRenderCache();
        this.emit('contentChanged', { content });
    }
    
    setPosition(position) {
        const validPositions = ['left', 'right', 'top', 'bottom'];
        if (!validPositions.includes(position)) {
            throw new ComponentError(`Invalid position: ${position}`, 'Drawer');
        }
        
        this.position = position;
        this.clearRenderCache();
        this.emit('positionChanged', { position });
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
    
    reset() {
        this.isOpen = false;
        this.animationState = { 
            isAnimating: false, 
            progress: 0,
            type: null,
            startTime: 0
        };
        this.setAttribute('aria-hidden', 'true');
        this.clearRenderCache();
        this.emit('reset');
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
            this.emit('destroyed');
        } catch (error) {
            console.error('Error during Drawer cleanup:', error);
        }    }
}

// =============================================================================
// MODERN SEARCH BOX COMPONENT
// =============================================================================

/**
 * Advanced SearchBox component with accessibility, autocomplete,
 * theme support, and modern interaction patterns.
 */
class SearchBox extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 300,
            height: options.height || 40,
            ariaRole: 'searchbox',
            ariaLabel: options.ariaLabel || 'Search'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.value = options.value || '';
        this.placeholder = options.placeholder || 'Search...';
        this.disabled = options.disabled || false;
        this.showClearButton = options.showClearButton !== false;
        this.showSearchButton = options.showSearchButton !== false;
        this.debounceDelay = options.debounceDelay || 300;
        
        // Search behavior
        this.searchOnType = options.searchOnType !== false;
        this.minSearchLength = options.minSearchLength || 1;
        this.suggestions = options.suggestions || [];
        this.showSuggestions = options.showSuggestions !== false;
        this.maxSuggestions = options.maxSuggestions || 5;
        this.caseSensitive = options.caseSensitive || false;
        this.highlightMatches = options.highlightMatches !== false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // State management
        this.isFocused = false;
        this.showingSuggestions = false;
        this.filteredSuggestions = [];
        this.selectedSuggestionIndex = -1;
        this.debounceTimer = null;
        this.searchHistory = [];
        this.maxHistoryLength = options.maxHistoryLength || 10;
        
        // Animation and performance
        this.animationState = { suggestionProgress: 0 };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('SearchBox');
        
        try {
            this.setupEventHandlers();
            this.setupAccessibility();
            this.setupResizeObserver();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.debounceDelay && (typeof options.debounceDelay !== 'number' || options.debounceDelay < 0)) {
            throw new ComponentError('Debounce delay must be a positive number', 'SearchBox');
        }
        
        if (options.minSearchLength && (typeof options.minSearchLength !== 'number' || options.minSearchLength < 0)) {
            throw new ComponentError('Minimum search length must be a positive number', 'SearchBox');
        }
        
        if (options.maxSuggestions && (typeof options.maxSuggestions !== 'number' || options.maxSuggestions < 1)) {
            throw new ComponentError('Maximum suggestions must be a positive number', 'SearchBox');
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
            'Enter': () => this.handleEnterKey(),
            'Escape': () => this.handleEscapeKey(),
            'ArrowDown': () => this.navigateSuggestions(1),
            'ArrowUp': () => this.navigateSuggestions(-1),
            'Tab': (event) => this.handleTabKey(event),
            'Backspace': () => this.handleBackspace(),
            'Delete': () => this.handleDelete()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'SearchBox',
                    { context, originalError: error }
                );
                
                console.error('SearchBox Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'search':
                this.clearSuggestions();
                break;
            case 'render':
                this.clearRenderCache();
                break;
            default:
                this.reset();
        }
    }
      
    setupAccessibility() {
        // ARIA attributes
        this.setAttribute('role', 'searchbox');
        this.setAttribute('aria-autocomplete', 'list');
        this.setAttribute('aria-expanded', 'false');
        this.setAttribute('aria-haspopup', 'listbox');
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupResizeObserver() {
        if ('ResizeObserver' in window) {
            this.resizeObserver = new ResizeObserver(entries => {
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
            'click': this.handleClick.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'keyUp': this.handleKeyUp.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced search functionality
    async setValue(value) {
        try {
            const oldValue = this.value;
            this.value = String(value || '');
            
            if (oldValue !== this.value) {
                this.clearRenderCache();
                this.updateSuggestions();
                this.emit('valueChanged', { value: this.value, oldValue });
                
                if (this.searchOnType) {
                    this.debouncedSearch();
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'setValue');
        }
    }
    
    updateSuggestions() {
        try {
            if (!this.showSuggestions || this.value.length < this.minSearchLength) {
                this.clearSuggestions();
                return;
            }
            
            const query = this.caseSensitive ? this.value : this.value.toLowerCase();
            
            // Filter suggestions based on current value
            this.filteredSuggestions = this.suggestions
                .filter(suggestion => {
                    const suggestionText = this.caseSensitive ? suggestion : suggestion.toLowerCase();
                    return suggestionText.includes(query);
                })
                .slice(0, this.maxSuggestions);
            
            // Add search history if enabled
            if (this.searchHistory.length > 0 && query.length > 0) {
                const historyMatches = this.searchHistory
                    .filter(item => {
                        const itemText = this.caseSensitive ? item : item.toLowerCase();
                        return itemText.includes(query) && !this.filteredSuggestions.includes(item);
                    })
                    .slice(0, Math.max(0, this.maxSuggestions - this.filteredSuggestions.length));
                
                this.filteredSuggestions = [...this.filteredSuggestions, ...historyMatches];
            }
            
            this.showingSuggestions = this.filteredSuggestions.length > 0;
            this.selectedSuggestionIndex = -1;
            
            // Update ARIA attributes
            this.setAttribute('aria-expanded', this.showingSuggestions.toString());
            
            if (this.showingSuggestions) {
                this.announceChange(`${this.filteredSuggestions.length} suggestions available`);
            }
            
        } catch (error) {
            this.errorHandler.handle(error, 'updateSuggestions');
        }
    }
    
    clearSuggestions() {
        this.filteredSuggestions = [];
        this.showingSuggestions = false;
        this.selectedSuggestionIndex = -1;
        this.setAttribute('aria-expanded', 'false');
    }
    
    debouncedSearch() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.performSearch();
        }, this.debounceDelay);
    }
    
    async performSearch() {
        try {
            if (this.value.length >= this.minSearchLength) {
                // Add to search history
                this.addToHistory(this.value);
                
                this.emit('search', { 
                    query: this.value,
                    timestamp: new Date().toISOString()
                });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'performSearch');
        }
    }
    
    addToHistory(query) {
        if (!query || this.searchHistory.includes(query)) return;
        
        this.searchHistory.unshift(query);
        if (this.searchHistory.length > this.maxHistoryLength) {
            this.searchHistory = this.searchHistory.slice(0, this.maxHistoryLength);
        }
        
        this.emit('historyUpdated', { history: this.searchHistory });
    }
    
    selectSuggestion(index) {
        try {
            if (index >= 0 && index < this.filteredSuggestions.length) {
                const selectedValue = this.filteredSuggestions[index];
                this.setValue(selectedValue);
                this.clearSuggestions();
                this.performSearch();
                
                this.announceChange(`Selected: ${selectedValue}`);
                this.emit('suggestionSelected', { value: selectedValue, index });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'selectSuggestion');
        }
    }
    
    navigateSuggestions(direction) {
        if (!this.showingSuggestions || this.filteredSuggestions.length === 0) return;
        
        const maxIndex = this.filteredSuggestions.length - 1;
        let newIndex = this.selectedSuggestionIndex + direction;
        
        // Wrap around navigation
        if (newIndex < -1) {
            newIndex = maxIndex;
        } else if (newIndex > maxIndex) {
            newIndex = -1;
        }
        
        this.selectedSuggestionIndex = newIndex;
        
        // Announce current selection
        if (newIndex >= 0) {
            const suggestion = this.filteredSuggestions[newIndex];
            this.announceChange(`${newIndex + 1} of ${this.filteredSuggestions.length}: ${suggestion}`);
        } else {
            this.announceChange('Back to search input');
        }
        
        this.clearRenderCache();
    }
    
    clear() {
        this.setValue('');
        this.clearSuggestions();
        this.emit('cleared');
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
            
            // Clear button
            if (this.showClearButton && this.value && 
                localX >= this.width - 70 && localX < this.width - 45) {
                this.clear();
                return;
            }
            
            // Search button
            if (this.showSearchButton && localX >= this.width - 40) {
                this.performSearch();
                return;
            }
            
            // Suggestion selection
            if (this.showingSuggestions && localY > this.height) {
                const suggestionIndex = Math.floor((localY - this.height) / 30);
                if (suggestionIndex >= 0 && suggestionIndex < this.filteredSuggestions.length) {
                    this.selectSuggestion(suggestionIndex);
                }
                return;
            }
            
            // Focus the input
            this.focus();
            
        } catch (error) {
            this.errorHandler.handle(error, 'click-handler');
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
            this.errorHandler.handle(error, 'keyboard-handler');
        }
    }
    
    handleKeyUp(event) {
        if (this.disabled) return;
        
        try {
            // Handle regular character input
            if (event.key.length === 1 && !event.ctrlKey && !event.altKey && !event.metaKey) {
                this.setValue(this.value + event.key);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'keyup-handler');
        }
    }
    
    handleEnterKey() {
        if (this.selectedSuggestionIndex >= 0) {
            this.selectSuggestion(this.selectedSuggestionIndex);
        } else {
            this.performSearch();
        }
    }
    
    handleEscapeKey() {
        if (this.showingSuggestions) {
            this.clearSuggestions();
        } else {
            this.clear();
        }
    }
    
    handleTabKey(event) {
        if (this.showingSuggestions && this.selectedSuggestionIndex >= 0) {
            event.preventDefault();
            this.selectSuggestion(this.selectedSuggestionIndex);
        }
    }
    
    handleBackspace() {
        if (this.value.length > 0) {
            this.setValue(this.value.slice(0, -1));
        }
    }
    
    handleDelete() {
        // For now, same as backspace - could be enhanced for cursor position
        this.handleBackspace();
    }
    
    handleFocus() {
        this.isFocused = true;
        this.updateSuggestions();
        this.emit('focus');
    }
    
    handleBlur() {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => {
            this.isFocused = false;
            this.clearSuggestions();
            this.emit('blur');
        }, 150);
    }
    
    handleFocusIn() {
        this.isFocused = true;
        this.clearRenderCache();
    }
    
    handleFocusOut() {
        this.isFocused = false;
        this.clearRenderCache();
    }
      
    // Enhanced rendering with theme support
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        try {
            this.performanceMonitor.startMeasurement('render');
            
            this.renderInputField(renderer);
            
            if (this.showingSuggestions) {
                this.renderSuggestions(renderer);
            }
            
            this.performanceMonitor.endMeasurement('render');
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    renderInputField(renderer) {
        // Background with theme support
        const bgColor = this.disabled ? 
            ComponentTheme.getColor('backgroundDisabled', this.theme) : 
            ComponentTheme.getColor('background', this.theme);
        
        renderer.fillStyle = bgColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border with theme support and focus state
        const borderColor = this.isFocused ? 
            ComponentTheme.getColor('focus', this.theme) : 
            ComponentTheme.getColor('border', this.theme);
        
        renderer.strokeStyle = borderColor;
        renderer.lineWidth = this.isFocused ? 2 : 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Search icon
        this.renderSearchIcon(renderer);
        
        // Text content
        this.renderTextContent(renderer);
        
        // Clear button
        if (this.showClearButton && this.value) {
            this.renderClearButton(renderer);
        }
        
        // Search button
        if (this.showSearchButton) {
            this.renderSearchButton(renderer);
        }
        
        // Focus indicator for screen readers
        if (this.isFocused) {
            this.renderFocusIndicator(renderer);
        }
        
        // Cursor
        if (this.isFocused && !this.showingSuggestions) {
            this.renderCursor(renderer);
        }
    }
    
    renderSearchIcon(renderer) {
        const iconX = 12;
        const iconY = this.height / 2;
        
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '16px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('🔍', iconX, iconY);
    }
    
    renderTextContent(renderer) {
        const displayText = this.value || this.placeholder;
        const isPlaceholder = !this.value;
        const textColor = this.disabled ? 
            ComponentTheme.getColor('disabled', this.theme) : 
            isPlaceholder ? 
                ComponentTheme.getColor('textSecondary', this.theme) : 
                ComponentTheme.getColor('text', this.theme);
        
        renderer.fillStyle = textColor;
        renderer.font = isPlaceholder ? 'italic 14px Arial' : '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        const textX = 30; // Account for search icon
        const maxTextWidth = this.width - 80; // Account for buttons and padding
        const truncatedText = this.truncateText(renderer, displayText, maxTextWidth);
        
        renderer.fillText(truncatedText, textX, this.height / 2);
    }
    
    renderClearButton(renderer) {
        const buttonX = this.width - 55;
        const buttonY = this.height / 2;
        const buttonRadius = 8;
        
        // Button background (hover effect)
        if (this.isClearButtonHovered) {
            renderer.fillStyle = ComponentTheme.getColor('dangerHover', this.theme);
            renderer.beginPath();
            renderer.arc(buttonX, buttonY, buttonRadius, 0, Math.PI * 2);
            renderer.fill();
        }
        
        // Clear icon
        renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
        renderer.font = '14px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('×', buttonX, buttonY);
    }
    
    renderSearchButton(renderer) {
        const buttonWidth = 35;
        const buttonHeight = this.height - 4;
        const buttonX = this.width - buttonWidth - 2;
        const buttonY = 2;
        
        // Button background
        renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
        renderer.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
        
        // Button text
        renderer.fillStyle = ComponentTheme.getColor('primaryText', this.theme);
        renderer.font = '12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('Go', buttonX + buttonWidth / 2, buttonY + buttonHeight / 2);
        
        // Button border
        renderer.strokeStyle = ComponentTheme.getColor('primaryBorder', this.theme);
        renderer.lineWidth = 1;
        renderer.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
    }
    
    renderFocusIndicator(renderer) {
        renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
        renderer.lineWidth = 2;
        renderer.setLineDash([2, 2]);
        renderer.strokeRect(2, 2, this.width - 4, this.height - 4);
        renderer.setLineDash([]);
    }
    
    renderCursor(renderer) {
        const textWidth = renderer.measureText(this.value).width;
        const cursorX = 30 + textWidth; // Account for search icon
        
        // Animated cursor
        const time = Date.now();
        const opacity = Math.sin(time * 0.005) * 0.5 + 0.5;
        
        renderer.strokeStyle = `rgba(${this.theme === 'dark' ? '255,255,255' : '0,0,0'}, ${opacity})`;
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(cursorX, 8);
        renderer.lineTo(cursorX, this.height - 8);
        renderer.stroke();
    }
    
    renderSuggestions(renderer) {
        const startY = this.height;
        const suggestionHeight = 30;
        const totalHeight = this.filteredSuggestions.length * suggestionHeight;
        
        // Suggestions container background
        renderer.fillStyle = ComponentTheme.getColor('background', this.theme);
        renderer.fillRect(0, startY, this.width, totalHeight);
        
        // Suggestions container border
        renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
        renderer.lineWidth = 1;
        renderer.strokeRect(0, startY, this.width, totalHeight);
        
        // Individual suggestions
        this.filteredSuggestions.forEach((suggestion, index) => {
            this.renderSuggestion(renderer, suggestion, index, startY + index * suggestionHeight, suggestionHeight);
        });
    }
    
    renderSuggestion(renderer, suggestion, index, y, height) {
        const isSelected = index === this.selectedSuggestionIndex;
        
        // Highlight selected suggestion
        if (isSelected) {
            renderer.fillStyle = ComponentTheme.getColor('primaryHover', this.theme);
            renderer.fillRect(0, y, this.width, height);
        }
        
        // Suggestion text with highlighting
        if (this.highlightMatches && this.value) {
            this.renderHighlightedText(renderer, suggestion, this.value, 12, y + height / 2);
        } else {
            renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
            renderer.font = '14px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            
            const maxWidth = this.width - 24;
            const truncatedSuggestion = this.truncateText(renderer, suggestion, maxWidth);
            renderer.fillText(truncatedSuggestion, 12, y + height / 2);
        }
        
        // Selection indicator
        if (isSelected) {
            renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
            renderer.font = '12px Arial';
            renderer.textAlign = 'right';
            renderer.textBaseline = 'middle';
            renderer.fillText('↩', this.width - 12, y + height / 2);
        }
        
        // Separator line
        if (index < this.filteredSuggestions.length - 1) {
            renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
            renderer.lineWidth = 1;
            renderer.beginPath();
            renderer.moveTo(0, y + height);
            renderer.lineTo(this.width, y + height);
            renderer.stroke();
        }
    }
    
    renderHighlightedText(renderer, text, query, x, y) {
        const caseSensitiveText = this.caseSensitive ? text : text.toLowerCase();
        const caseSensitiveQuery = this.caseSensitive ? query : query.toLowerCase();
        const matchIndex = caseSensitiveText.indexOf(caseSensitiveQuery);
        
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        if (matchIndex === -1) {
            // No match, render normally
            renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
            renderer.fillText(text, x, y);
        } else {
            // Render with highlighting
            const beforeMatch = text.slice(0, matchIndex);
            const match = text.slice(matchIndex, matchIndex + query.length);
            const afterMatch = text.slice(matchIndex + query.length);
            
            let currentX = x;
            
            // Before match
            if (beforeMatch) {
                renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
                renderer.fillText(beforeMatch, currentX, y);
                currentX += renderer.measureText(beforeMatch).width;
            }
            
            // Highlighted match
            if (match) {
                renderer.fillStyle = ComponentTheme.getColor('primaryText', this.theme);
                const matchWidth = renderer.measureText(match).width;
                
                // Highlight background
                renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
                renderer.fillRect(currentX, y - 8, matchWidth, 16);
                
                // Match text
                renderer.fillStyle = ComponentTheme.getColor('primaryText', this.theme);
                renderer.fillText(match, currentX, y);
                currentX += matchWidth;
            }
            
            // After match
            if (afterMatch) {
                renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
                renderer.fillText(afterMatch, currentX, y);
            }
        }
    }
    
    truncateText(renderer, text, maxWidth) {
        const metrics = renderer.measureText(text);
        if (metrics.width <= maxWidth) {
            return text;
        }
        
        const ellipsis = '...';
        const ellipsisWidth = renderer.measureText(ellipsis).width;
        
        let truncated = text;
        while (renderer.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 0) {
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
        return function(...args) {
            if (!inThrottle) {
                func.apply(this, args);
                inThrottle = true;
                setTimeout(() => inThrottle = false, limit);
            }
        };
    }
    
    // Public API with enhanced error handling
    getSuggestions() {
        return [...this.suggestions];
    }
    
    setSuggestions(suggestions) {
        if (!Array.isArray(suggestions)) {
            throw new ComponentError('Suggestions must be an array', 'SearchBox');
        }
        
        this.suggestions = suggestions.map(s => String(s));
        this.updateSuggestions();
        this.emit('suggestionsChanged', { suggestions: this.suggestions });
    }
    
    addSuggestion(suggestion) {
        const suggestionStr = String(suggestion);
        if (!this.suggestions.includes(suggestionStr)) {
            this.suggestions.push(suggestionStr);
            this.updateSuggestions();
            this.emit('suggestionAdded', { suggestion: suggestionStr });
        }
    }
    
    removeSuggestion(suggestion) {
        const index = this.suggestions.indexOf(suggestion);
        if (index >= 0) {
            this.suggestions.splice(index, 1);
            this.updateSuggestions();
            this.emit('suggestionRemoved', { suggestion, index });
        }
    }
    
    getSearchHistory() {
        return [...this.searchHistory];
    }
    
    clearSearchHistory() {
        this.searchHistory = [];
        this.emit('historyCleared');
    }
    
    setPlaceholder(placeholder) {
        this.placeholder = String(placeholder || '');
        this.clearRenderCache();
        this.emit('placeholderChanged', { placeholder: this.placeholder });
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
        this.clearSuggestions();
        this.clearRenderCache();
        this.emit('disabled');
    }
    
    reset() {
        this.value = '';
        this.clearSuggestions();
        this.clearSearchHistory();
        this.selectedSuggestionIndex = -1;
        this.clearRenderCache();
        this.emit('reset');
    }
    
    // Cleanup and memory management
    destroy() {
        try {
            // Cancel any pending searches
            if (this.debounceTimer) {
                clearTimeout(this.debounceTimer);
                this.debounceTimer = null;
            }
            
            // Clean up resize observer
            if (this.resizeObserver) {
                this.resizeObserver.disconnect();
                this.resizeObserver = null;
            }
            
            // Remove announcer from DOM
            if (this.announcer && this.announcer.parentNode) {
                this.announcer.parentNode.removeChild(this.announcer);
            }
            
            // Clear caches and state
            this.clearRenderCache();
            this.clearSuggestions();
            this.clearSearchHistory();
            
            // Call parent cleanup
            super.destroy?.();
            this.emit('destroyed');
        } catch (error) {
            console.error('Error during SearchBox cleanup:', error);
        }
    }
}

// Export all components
export {
    ColorPicker,
    Accordion,
    DateTimePicker,
    NumberInput,
    Drawer,
    SearchBox
};

export default {
    ColorPicker,
    Accordion,
    DateTimePicker,
    NumberInput,
    Drawer,
    SearchBox
};
