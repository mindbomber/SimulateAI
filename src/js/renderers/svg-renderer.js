/**
 * Enhanced SVG Renderer for SimulateAI Platform
 * High-performance, accessible, and modern SVG-based graphics rendering
 * 
 * Features:
 * - Vector-based scalable graphics with responsive design
 * - Accessibility integration with ARIA and screen reader support
 * - Theme-aware rendering with dark mode support
 * - Performance monitoring and optimization
 * - Advanced animation system with motion sensitivity
 * - Memory management and cleanup
 * - Security-conscious rendering
 * - Comprehensive error handling
 * - SVG-specific optimizations and capabilities
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from '../utils/logger.js';

// Enhanced constants and configuration
const SVG_CONSTANTS = {
    VERSION: '2.0.0',
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    SVG_NAMESPACE: 'http://www.w3.org/2000/svg',
    XLINK_NAMESPACE: 'http://www.w3.org/1999/xlink',
    ANIMATION_FPS: 60,
    PERFORMANCE_SAMPLE_RATE: 0.1,
    MAX_ELEMENTS: 10000,
    ACCESSIBILITY: {
        MIN_CONTRAST_RATIO: 4.5,
        MIN_FONT_SIZE: 12,
        MIN_TOUCH_TARGET: 44,
        MIN_STROKE_WIDTH: 1
    },
    THEMES: {
        LIGHT: {
            background: '#ffffff',
            foreground: '#333333',
            primary: '#007acc',
            secondary: '#28a745',
            accent: '#6c757d',
            border: '#e0e0e0'
        },
        DARK: {
            background: '#1a1a1a',
            foreground: '#e0e0e0',
            primary: '#4da6ff',
            secondary: '#66bb6a',
            accent: '#9e9e9e',
            border: '#404040'
        },
        HIGH_CONTRAST: {
            background: '#000000',
            foreground: '#ffffff',
            primary: '#ffff00',
            secondary: '#00ffff',
            accent: '#ff00ff',
            border: '#ffffff'
        }
    }
};

/**
 * Performance monitoring for SVG operations
 */
class SVGPerformanceMonitor {
    constructor() {
        this.metrics = {
            elementCount: 0,
            animationCount: 0,
            renderTime: 0,
            frameCount: 0,
            averageFrameTime: 0,
            droppedFrames: 0,
            lastFrameTime: 0,
            domOperations: 0
        };
        this.enabled = SVG_CONSTANTS.PERFORMANCE_SAMPLE_RATE > Math.random();
    }
    
    startFrame() {
        if (!this.enabled) return;
        this.frameStartTime = performance.now();
    }
    
    endFrame() {
        if (!this.enabled) return;
        
        const frameTime = performance.now() - this.frameStartTime;
        this.metrics.frameCount++;
        this.metrics.renderTime += frameTime;
        this.metrics.averageFrameTime = this.metrics.renderTime / this.metrics.frameCount;
        
        if (frameTime > 16.67) { // > 60fps threshold
            this.metrics.droppedFrames++;
        }
        
        this.metrics.lastFrameTime = frameTime;
    }
    
    recordDOMOperation() {
        if (!this.enabled) return;
        this.metrics.domOperations++;
    }
    
    recordElement() {
        if (!this.enabled) return;
        this.metrics.elementCount++;
    }
    
    getMetrics() {
        return { ...this.metrics };
    }
    
    reset() {
        Object.keys(this.metrics).forEach(key => {
            this.metrics[key] = 0;
        });
    }
}

/**
 * SVG accessibility manager with enhanced screen reader support
 */
class SVGAccessibilityManager {
    constructor(svg, renderer) {
        this.svg = svg;
        this.renderer = renderer;
        this.description = '';
        this.elements = new Map();
        this.focusedElement = null;
        this.tabIndex = 0;
        this.setupAccessibility();
    }
    
    setupAccessibility() {
        // Set up SVG accessibility attributes
        this.svg.setAttribute('role', 'img');
        this.svg.setAttribute('tabindex', '0');
        this.svg.setAttribute('focusable', 'true');
        this.updateDescription('Interactive simulation SVG graphics');
        
        // Add keyboard navigation
        this.svg.addEventListener('keydown', this.handleKeydown.bind(this));
        this.svg.addEventListener('focus', this.handleFocus.bind(this));
        this.svg.addEventListener('blur', this.handleBlur.bind(this));
        this.svg.addEventListener('click', this.handleClick.bind(this));
    }
    
    updateDescription(description) {
        this.description = description;
        this.svg.setAttribute('aria-label', description);
        
        // Update or create title element
        let title = this.svg.querySelector('title');
        if (!title) {
            title = document.createElementNS(SVG_CONSTANTS.SVG_NAMESPACE, 'title');
            this.svg.insertBefore(title, this.svg.firstChild);
        }
        title.textContent = description;
    }
    
    addElement(id, element) {
        const elementData = {
            ...element,
            id,
            tabIndex: this.tabIndex++,
            focusable: element.focusable !== false
        };
        
        this.elements.set(id, elementData);
        
        // Add accessibility attributes to SVG element
        if (element.svgElement) {
            this.enhanceElementAccessibility(element.svgElement, elementData);
        }
        
        this.updateDescription();
    }
    
    enhanceElementAccessibility(svgElement, elementData) {
        if (elementData.focusable) {
            svgElement.setAttribute('tabindex', elementData.tabIndex);
            svgElement.setAttribute('focusable', 'true');
        }
        
        if (elementData.ariaLabel) {
            svgElement.setAttribute('aria-label', elementData.ariaLabel);
        }
        
        if (elementData.role) {
            svgElement.setAttribute('role', elementData.role);
        }
        
        // Add title element for screen readers
        if (elementData.label || elementData.ariaLabel) {
            const title = document.createElementNS(SVG_CONSTANTS.SVG_NAMESPACE, 'title');
            title.textContent = elementData.label || elementData.ariaLabel;
            svgElement.insertBefore(title, svgElement.firstChild);
        }
        
        // Add description if provided
        if (elementData.description) {
            const desc = document.createElementNS(SVG_CONSTANTS.SVG_NAMESPACE, 'desc');
            desc.textContent = elementData.description;
            svgElement.appendChild(desc);
        }
    }
    
    removeElement(id) {
        this.elements.delete(id);
        if (this.focusedElement === id) {
            this.focusedElement = null;
        }
        this.updateDescription();
    }
    
    handleKeydown(event) {
        const focusableElements = Array.from(this.elements.values())
            .filter(el => el.focusable)
            .sort((a, b) => a.tabIndex - b.tabIndex);
        
        if (focusableElements.length === 0) return;
        
        let currentIndex = focusableElements.findIndex(el => el.id === this.focusedElement);
        
        switch (event.key) {
            case 'Tab':
                event.preventDefault();
                if (event.shiftKey) {
                    currentIndex = currentIndex <= 0 ? focusableElements.length - 1 : currentIndex - 1;
                } else {
                    currentIndex = currentIndex >= focusableElements.length - 1 ? 0 : currentIndex + 1;
                }
                this.focusElement(focusableElements[currentIndex].id);
                break;
                
            case 'Enter':
            case ' ':
                if (this.focusedElement) {
                    const element = this.elements.get(this.focusedElement);
                    if (element && element.onClick) {
                        event.preventDefault();
                        element.onClick();
                    }
                }
                break;
                
            case 'Escape':
                if (this.focusedElement) {
                    this.focusedElement = null;
                    this.svg.focus();
                    this.renderer.requestRender();
                }
                break;
        }
    }
    
    handleClick(event) {
        // Find clicked element
        const { target } = event;
        const elementId = this.findElementIdByTarget(target);
        
        if (elementId) {
            this.focusElement(elementId);
            const element = this.elements.get(elementId);
            if (element && element.onClick) {
                element.onClick(event);
            }
        }
    }
    
    findElementIdByTarget(target) {
        for (const [id, element] of this.elements.entries()) {
            if (element.svgElement === target || element.svgElement?.contains(target)) {
                return id;
            }
        }
        return null;
    }
    
    focusElement(id) {
        this.focusedElement = id;
        const element = this.elements.get(id);
        if (element) {
            this.announceElement(element);
            this.highlightFocusedElement(element);
            this.renderer.requestRender();
        }
    }
    
    highlightFocusedElement(element) {
        // Remove previous focus indicators
        this.svg.querySelectorAll('.focus-indicator').forEach(el => el.remove());
        
        if (element.svgElement) {
            // Create focus indicator
            const bbox = element.svgElement.getBBox();
            const indicator = document.createElementNS(SVG_CONSTANTS.SVG_NAMESPACE, 'rect');
            indicator.setAttribute('class', 'focus-indicator');
            indicator.setAttribute('x', bbox.x - 2);
            indicator.setAttribute('y', bbox.y - 2);
            indicator.setAttribute('width', bbox.width + 4);
            indicator.setAttribute('height', bbox.height + 4);
            indicator.setAttribute('fill', 'none');
            indicator.setAttribute('stroke', '#007acc');
            indicator.setAttribute('stroke-width', '2');
            indicator.setAttribute('stroke-dasharray', '4,2');
            indicator.setAttribute('pointer-events', 'none');
            
            // Insert after the focused element
            element.svgElement.parentNode.insertBefore(indicator, element.svgElement.nextSibling);
        }
    }
    
    announceElement(element) {
        const announcement = element.ariaLabel || element.label || `${element.type} element`;
        this.announceToScreenReader(announcement);
    }
    
    announceToScreenReader(message) {
        const announcer = document.createElement('div');
        announcer.setAttribute('aria-live', 'polite');
        announcer.setAttribute('aria-atomic', 'true');
        announcer.style.position = 'absolute';
        announcer.style.left = '-10000px';
        announcer.style.width = '1px';
        announcer.style.height = '1px';
        announcer.style.overflow = 'hidden';
        
        document.body.appendChild(announcer);
        announcer.textContent = message;
        
        setTimeout(() => {
            document.body.removeChild(announcer);
        }, 1000);
    }
    
    handleFocus() {
        this.svg.style.outline = '2px solid #007acc';
    }
    
    handleBlur() {
        this.svg.style.outline = 'none';
        this.focusedElement = null;
        this.svg.querySelectorAll('.focus-indicator').forEach(el => el.remove());
    }
    
    generateOverallDescription() {
        const elementTypes = new Map();
        for (const element of this.elements.values()) {
            const count = elementTypes.get(element.type) || 0;
            elementTypes.set(element.type, count + 1);
        }
        
        const descriptions = Array.from(elementTypes.entries())
            .map(([type, count]) => `${count} ${type}${count > 1 ? 's' : ''}`)
            .join(', ');
        
        return `SVG contains ${descriptions}`;
    }
}

/**
 * Enhanced SVG Renderer with modern features
 */

class SVGRenderer {
  /**
   * Create an enhanced SVG renderer
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Renderer options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || SVG_CONSTANTS.DEFAULT_WIDTH,
      height: options.height || SVG_CONSTANTS.DEFAULT_HEIGHT,
      preserveAspectRatio: options.preserveAspectRatio || 'xMidYMid meet',
      theme: options.theme || 'light',
      enableAccessibility: options.enableAccessibility !== false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      respectReducedMotion: options.respectReducedMotion !== false,
      maxElements: options.maxElements || SVG_CONSTANTS.MAX_ELEMENTS,
      ...options
    };

    // Core SVG properties
    this.svg = null;
    this.defs = null;
    this.mainGroup = null;
    this.layers = new Map();
    this.animations = new Set();
    this.elementCount = 0;
    this.renderRequested = false;
    
    // Enhanced features
    this.performanceMonitor = new SVGPerformanceMonitor();
    this.accessibilityManager = null;
    this.currentTheme = SVG_CONSTANTS.THEMES[this.options.theme.toUpperCase()] || SVG_CONSTANTS.THEMES.LIGHT;
    this.gradientCache = new Map();
    this.patternCache = new Map();
    
    // Responsive handling
    this.resizeObserver = null;
    this.boundHandleResize = this.handleResize.bind(this);
    
    // Animation frame handling
    this.animationFrameId = null;
    this.lastFrameTime = 0;
    
    // Error handling
    this.errorHandler = options.errorHandler || this.defaultErrorHandler.bind(this);
    
    // Initialize
    try {
      this.initialize();
    } catch (error) {
      this.errorHandler('Initialization failed', error);
    }
  }

  /**
   * Initialize the SVG renderer with enhanced features
   */
  initialize() {
    this.validateContainer();
    this.createSVG();
    this.setupStructure();
    this.setupAccessibility();
    this.setupResponsiveHandling();
    this.setupThemeMonitoring();
    this.addDefaultStyles();
  }
  
  /**
   * Validate container element
   */
  validateContainer() {
    if (!this.container || !this.container.nodeType) {
      throw new Error('Invalid container element provided');
    }
  }
  
  /**
   * Create and configure SVG element
   */
  createSVG() {
    this.svg = this.createSVGElement('svg', {
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${this.options.width} ${this.options.height}`,
      preserveAspectRatio: this.options.preserveAspectRatio,
      role: 'img',
      'aria-label': 'Interactive simulation graphics',
      class: 'svg-renderer',
      'data-theme': this.options.theme,
      'data-version': SVG_CONSTANTS.VERSION
    });
    
    this.container.appendChild(this.svg);
  }
  
  /**
   * Setup SVG structure with defs and main group
   */
  setupStructure() {
    // Create defs for reusable elements
    this.defs = this.createSVGElement('defs');
    this.svg.appendChild(this.defs);

    // Create main group for all content
    this.mainGroup = this.createSVGElement('g', {
      class: 'main-group'
    });
    this.svg.appendChild(this.mainGroup);
  }
  
  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    if (this.options.enableAccessibility) {
      this.accessibilityManager = new SVGAccessibilityManager(this.svg, this);
    }
  }
  
  /**
   * Setup responsive SVG handling
   */
  setupResponsiveHandling() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver(this.boundHandleResize);
      this.resizeObserver.observe(this.container);
    } else {
      window.addEventListener('resize', this.boundHandleResize);
    }
  }
  
  /**
   * Setup theme change monitoring
   */
  setupThemeMonitoring() {
    if (window.matchMedia) {
      const contrastQuery = window.matchMedia('(prefers-contrast: high)');
      
      const updateTheme = () => {
        let newTheme = 'light';
        if (contrastQuery.matches) {
          newTheme = 'high_contrast';
        }
        this.setTheme(newTheme);
      };
      
      contrastQuery.addEventListener('change', updateTheme);
      
      // Initial theme detection
      updateTheme();
    }
  }
  
  /**
   * Handle container resize
   */
  handleResize(entries) {
    if (entries && entries[0]) {
      const { width, height } = entries[0].contentRect;
      this.resize(width, height);
    } else {
      // Fallback for non-ResizeObserver browsers
      const rect = this.container.getBoundingClientRect();
      this.resize(rect.width, rect.height);
    }
  }
  
  /**
   * Set theme with automatic style updates
   * @param {string} themeName - Theme name ('light', 'dark', 'high_contrast')
   */
  setTheme(themeName) {
    const theme = SVG_CONSTANTS.THEMES[themeName.toUpperCase()];
    if (theme && theme !== this.currentTheme) {
      this.currentTheme = theme;
      this.options.theme = themeName;
      this.svg.setAttribute('data-theme', themeName);
      this.updateThemeStyles();
      this.requestRender();
    }
  }
  
  /**
   * Update theme-specific styles
   */
  updateThemeStyles() {
    // Update existing theme-dependent elements
    this.svg.querySelectorAll('[data-theme-color]').forEach(element => {
      const colorType = element.getAttribute('data-theme-color');
      const colorValue = this.currentTheme[colorType];
      if (colorValue) {
        const attribute = element.getAttribute('data-theme-attribute') || 'fill';
        element.setAttribute(attribute, colorValue);
      }
    });
  }
  
  /**
   * Request render frame with performance monitoring
   */
  requestRender() {
    if (this.renderRequested) return;
    
    this.renderRequested = true;
    this.animationFrameId = requestAnimationFrame((timestamp) => {
      this.performanceMonitor.startFrame();
      this.renderRequested = false;
      this.lastFrameTime = timestamp;
      this.performanceMonitor.endFrame();
    });
  }
  
  /**
   * Default error handler
   */
  defaultErrorHandler(message, error) {
    logger.error(`SVGRenderer Error: ${message}`, error);
    
    if (this.options.enableAccessibility && this.accessibilityManager) {
      this.accessibilityManager.announceToScreenReader(`Rendering error: ${message}`);
    }
  }
  // Enhanced SVG element creation and styling methods
  
  /**
   * Create SVG element with enhanced error handling and accessibility
   * @param {string} tagName - SVG element tag name
   * @param {Object} attributes - Element attributes
   * @returns {SVGElement} Created SVG element
   */
  createSVGElement(tagName, attributes = {}) {
    try {
      const element = document.createElementNS(SVG_CONSTANTS.SVG_NAMESPACE, tagName);
      
      Object.entries(attributes).forEach(([key, value]) => {
        if (value !== null && value !== undefined) {
          element.setAttribute(key, value);
        }
      });

      this.performanceMonitor.recordDOMOperation();
      return element;
    } catch (error) {
      this.errorHandler(`Failed to create SVG element: ${tagName}`, error);
      return null;
    }
  }

  /**
   * Add comprehensive default styles with theme support
   */
  addDefaultStyles() {
    const style = this.createSVGElement('style');
    if (!style) return;
    
    style.textContent = `
      .svg-renderer {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, system-ui, sans-serif;
        overflow: hidden;
      }
      
      .svg-renderer[data-theme="light"] {
        background: ${this.currentTheme.background};
        color: ${this.currentTheme.foreground};
      }
      
      .svg-renderer[data-theme="high_contrast"] {
        background: ${SVG_CONSTANTS.THEMES.HIGH_CONTRAST.background};
        color: ${SVG_CONSTANTS.THEMES.HIGH_CONTRAST.foreground};
      }
      
      .clickable {
        cursor: pointer;
        transition: opacity 0.2s ease;
      }
      
      .clickable:hover:not([aria-disabled="true"]) {
        opacity: 0.8;
      }
      
      .clickable:focus {
        outline: 2px solid #007acc;
        outline-offset: 2px;
      }
      
      .animated {
        transition: all 0.3s ease;
      }
      
      @media (prefers-reduced-motion: reduce) {
        .animated {
          transition: none;
        }
      }
      
      .text-element {
        user-select: none;
        pointer-events: none;
        font-size: ${Math.max(14, SVG_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE)}px;
      }
      
      .interactive {
        pointer-events: all;
      }
      
      .accessible-element {
        outline: none;
      }
      
      .accessible-element:focus {
        outline: 2px solid #007acc;
        outline-offset: 1px;
      }
      
      .focus-indicator {
        animation: focus-pulse 2s infinite;
      }
      
      @keyframes focus-pulse {
        0%, 100% { opacity: 1; }
        50% { opacity: 0.5; }
      }
      
      .screen-reader-only {
        position: absolute;
        width: 1px;
        height: 1px;
        padding: 0;
        margin: -1px;
        overflow: hidden;
        clip: rect(0, 0, 0, 0);
        white-space: nowrap;
        border: 0;
      }
    `;
    
    this.defs.appendChild(style);
  }

  /**
   * Create layer with enhanced features
   * @param {string} name - Layer name
   * @param {number} zIndex - Layer z-index
   * @param {Object} options - Layer options
   * @returns {SVGElement} Created layer element
   */
  createLayer(name, zIndex = 0, options = {}) {
    const layer = this.createSVGElement('g', {
      class: `layer layer-${name} ${options.className || ''}`,
      'data-layer': name,
      'data-z-index': zIndex,
      transform: options.transform || '',
      opacity: options.opacity || 1
    });

    if (!layer) return null;

    // Insert layer in correct z-order
    const existingLayers = Array.from(this.mainGroup.children)
      .filter(child => child.hasAttribute('data-layer'))
      .sort((a, b) => {
        const aZ = parseInt(a.getAttribute('data-z-index') || '0');
        const bZ = parseInt(b.getAttribute('data-z-index') || '0');
        return aZ - bZ;
      });

    let insertBefore = null;
    for (const existingLayer of existingLayers) {
      const existingZ = parseInt(existingLayer.getAttribute('data-z-index') || '0');
      if (existingZ > zIndex) {
        insertBefore = existingLayer;
        break;
      }
    }

    if (insertBefore) {
      this.mainGroup.insertBefore(layer, insertBefore);
    } else {
      this.mainGroup.appendChild(layer);
    }

    this.layers.set(name, layer);
    this.performanceMonitor.recordElement();
    
    return layer;
  }

  /**
   * Get layer by name or create if it doesn't exist
   * @param {string} name - Layer name
   * @returns {SVGElement} Layer element
   */
  getLayer(name) {
    return this.layers.get(name) || this.createLayer(name);
  }
  // Enhanced shape creation methods with accessibility and theme support
  
  /**
   * Create accessible rectangle with theme awareness
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {Object} options - Drawing options
   * @returns {SVGElement} Rectangle element
   */
  createRect(x, y, width, height, options = {}) {
    if (this.elementCount >= this.options.maxElements) {
      this.errorHandler('Maximum element count exceeded', new Error('Performance limit'));
      return null;
    }

    try {
      // Apply theme-aware defaults
      const fill = options.fill || (options.primary ? this.currentTheme.primary : 'transparent');
      const stroke = options.stroke || (options.border ? this.currentTheme.border : 'none');
      
      // Accessibility: Ensure minimum size for interactive elements
      if (options.interactive && (width < SVG_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET || 
                                  height < SVG_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET)) {
        logger.warn('Interactive element below minimum touch target size');
      }

      const rect = this.createSVGElement('rect', {
        x,
        y,
        width,
        height,
        fill,
        stroke,
        'stroke-width': options.strokeWidth || (stroke !== 'none' ? SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH : 0),
        rx: options.borderRadius || 0,
        ry: options.borderRadius || 0,
        class: `rect-element ${options.className || ''} ${options.interactive ? 'interactive clickable accessible-element' : ''}`,
        'data-theme-color': options.themeColor,
        'data-theme-attribute': options.themeAttribute || 'fill',
        ...options.attributes
      });

      if (!rect) return null;

      // Register with accessibility manager
      if (options.interactive && this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `rect_${this.elementCount}`, {
          type: 'rectangle',
          svgElement: rect,
          x, y, width, height,
          label: options.label,
          ariaLabel: options.ariaLabel,
          description: options.description,
          onClick: options.onClick,
          focusable: options.focusable !== false,
          role: options.role || 'button'
        });
      }

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return rect;
    } catch (error) {
      this.errorHandler('Failed to create rectangle', error);
      return null;
    }
  }

  /**
   * Create accessible circle with theme awareness
   * @param {number} cx - Center X coordinate
   * @param {number} cy - Center Y coordinate
   * @param {number} radius - Circle radius
   * @param {Object} options - Drawing options
   * @returns {SVGElement} Circle element
   */
  createCircle(cx, cy, radius, options = {}) {
    if (this.elementCount >= this.options.maxElements) {
      this.errorHandler('Maximum element count exceeded', new Error('Performance limit'));
      return null;
    }

    try {
      // Apply theme-aware defaults
      const fill = options.fill || (options.primary ? this.currentTheme.primary : 'transparent');
      const stroke = options.stroke || (options.border ? this.currentTheme.border : 'none');
      
      // Accessibility: Ensure minimum size for interactive elements
      const diameter = radius * 2;
      if (options.interactive && diameter < SVG_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET) {
        logger.warn('Interactive circle below minimum touch target size');
      }

      const circle = this.createSVGElement('circle', {
        cx,
        cy,
        r: radius,
        fill,
        stroke,
        'stroke-width': options.strokeWidth || (stroke !== 'none' ? SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH : 0),
        class: `circle-element ${options.className || ''} ${options.interactive ? 'interactive clickable accessible-element' : ''}`,
        'data-theme-color': options.themeColor,
        'data-theme-attribute': options.themeAttribute || 'fill',
        ...options.attributes
      });

      if (!circle) return null;

      // Register with accessibility manager
      if (options.interactive && this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `circle_${this.elementCount}`, {
          type: 'circle',
          svgElement: circle,
          x: cx - radius, y: cy - radius,
          width: diameter, height: diameter,
          label: options.label,
          ariaLabel: options.ariaLabel,
          description: options.description,
          onClick: options.onClick,
          focusable: options.focusable !== false,
          role: options.role || 'button'
        });
      }

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return circle;
    } catch (error) {
      this.errorHandler('Failed to create circle', error);
      return null;
    }
  }

  /**
   * Create accessible line with enhanced styling
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @param {Object} options - Drawing options
   * @returns {SVGElement} Line element
   */
  createLine(x1, y1, x2, y2, options = {}) {
    if (this.elementCount >= this.options.maxElements) {
      this.errorHandler('Maximum element count exceeded', new Error('Performance limit'));
      return null;
    }

    try {
      const stroke = options.stroke || this.currentTheme.foreground;
      
      const line = this.createSVGElement('line', {
        x1,
        y1,
        x2,
        y2,
        stroke,
        'stroke-width': Math.max(options.strokeWidth || 1, SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH),
        'stroke-linecap': options.linecap || 'round',
        'stroke-linejoin': options.linejoin || 'round',
        'stroke-dasharray': options.dashArray,
        'stroke-dashoffset': options.dashOffset,
        class: `line-element ${options.className || ''}`,
        'data-theme-color': options.themeColor,
        'data-theme-attribute': 'stroke',
        ...options.attributes
      });

      if (!line) return null;

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return line;
    } catch (error) {
      this.errorHandler('Failed to create line', error);
      return null;
    }
  }

  /**
   * Create accessible path with enhanced features
   * @param {string} pathData - SVG path data
   * @param {Object} options - Drawing options
   * @returns {SVGElement} Path element
   */
  createPath(pathData, options = {}) {
    if (this.elementCount >= this.options.maxElements) {
      this.errorHandler('Maximum element count exceeded', new Error('Performance limit'));
      return null;
    }

    try {
      const fill = options.fill || 'none';
      const stroke = options.stroke || this.currentTheme.foreground;
      
      const path = this.createSVGElement('path', {
        d: pathData,
        fill,
        stroke,
        'stroke-width': options.strokeWidth || (stroke !== 'none' ? SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH : 0),
        'stroke-linecap': options.linecap || 'round',
        'stroke-linejoin': options.linejoin || 'round',
        'stroke-dasharray': options.dashArray,
        'stroke-dashoffset': options.dashOffset,
        'fill-rule': options.fillRule || 'evenodd',
        class: `path-element ${options.className || ''} ${options.interactive ? 'interactive clickable accessible-element' : ''}`,
        'data-theme-color': options.themeColor,
        'data-theme-attribute': options.themeAttribute || 'stroke',
        ...options.attributes
      });

      if (!path) return null;

      // Register with accessibility manager if interactive
      if (options.interactive && this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `path_${this.elementCount}`, {
          type: 'path',
          svgElement: path,
          label: options.label,
          ariaLabel: options.ariaLabel,
          description: options.description,
          onClick: options.onClick,
          focusable: options.focusable !== false,
          role: options.role || 'button'
        });
      }

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return path;
    } catch (error) {
      this.errorHandler('Failed to create path', error);
      return null;
    }
  }

  /**
   * Create accessible text with enhanced typography
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} text - Text content
   * @param {Object} options - Text options
   * @returns {SVGElement} Text element
   */
  createText(x, y, text, options = {}) {
    if (this.elementCount >= this.options.maxElements) {
      this.errorHandler('Maximum element count exceeded', new Error('Performance limit'));
      return null;
    }

    try {
      // Accessibility: Ensure minimum font size
      const fontSize = Math.max(
        parseFloat(options.fontSize) || 14,
        SVG_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE
      );

      const fill = options.fill || options.color || this.currentTheme.foreground;

      const textElement = this.createSVGElement('text', {
        x,
        y,
        'text-anchor': options.textAnchor || 'start',
        'dominant-baseline': options.dominantBaseline || 'middle',
        'font-size': fontSize,
        'font-family': options.fontFamily || 'inherit',
        'font-weight': options.fontWeight || 'normal',
        'font-style': options.fontStyle || 'normal',
        'text-decoration': options.textDecoration,
        fill,
        stroke: options.stroke,
        'stroke-width': options.strokeWidth || 0,
        'letter-spacing': options.letterSpacing,
        'word-spacing': options.wordSpacing,
        class: `text-element ${options.className || ''} ${options.accessible ? 'accessible-element' : ''}`,
        'data-theme-color': options.themeColor,
        'data-theme-attribute': 'fill',
        ...options.attributes
      });

      if (!textElement) return null;

      textElement.textContent = text;

      // Add text shadow for better readability if specified
      if (options.shadow) {
        const filter = this.createTextShadowFilter(options.shadow);
        if (filter) {
          textElement.setAttribute('filter', `url(#${filter.id})`);
        }
      }

      // Register with accessibility manager
      if (options.accessible && this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `text_${this.elementCount}`, {
          type: 'text',
          svgElement: textElement,
          x, y,
          width: textElement.getBBox ? textElement.getBBox().width : 0,
          height: fontSize,
          text,
          label: options.label || text,
          ariaLabel: options.ariaLabel || text,
          description: options.description
        });
      }

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return textElement;
    } catch (error) {
      this.errorHandler('Failed to create text', error);
      return null;
    }
  }

  /**
   * Create group element with enhanced features
   * @param {Object} options - Group options
   * @returns {SVGElement} Group element
   */
  createGroup(options = {}) {
    try {
      const group = this.createSVGElement('g', {
        class: `group-element ${options.className || ''}`,
        transform: options.transform || '',
        opacity: options.opacity || 1,
        'data-group-id': options.id,
        ...options.attributes
      });

      if (!group) return null;

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return group;
    } catch (error) {
      this.errorHandler('Failed to create group', error);
      return null;
    }
  }
  // Advanced utility methods
  
  /**
   * Create text shadow filter for better readability
   * @param {Object} shadow - Shadow configuration
   * @returns {SVGElement} Filter element
   */
  createTextShadowFilter(shadow) {
    try {
      const filterId = `text-shadow-${Math.random().toString(36).substr(2, 9)}`;
      const filter = this.createSVGElement('filter', {
        id: filterId,
        x: '-50%',
        y: '-50%',
        width: '200%',
        height: '200%'
      });

      const dropShadow = this.createSVGElement('feDropShadow', {
        dx: shadow.offsetX || 1,
        dy: shadow.offsetY || 1,
        'std-deviation': shadow.blur || 1,
        'flood-color': shadow.color || 'rgba(0,0,0,0.5)',
        'flood-opacity': shadow.opacity || 0.5
      });

      filter.appendChild(dropShadow);
      this.defs.appendChild(filter);
      return filter;
    } catch (error) {
      this.errorHandler('Failed to create text shadow filter', error);
      return null;
    }
  }

  /**
   * Create gradient with theme awareness
   * @param {string} type - Gradient type ('linear' or 'radial')
   * @param {Array} colorStops - Array of color stops
   * @param {Object} coordinates - Gradient coordinates
   * @param {string} id - Optional gradient ID
   * @returns {SVGElement} Gradient element
   */
  createGradient(type, colorStops, coordinates, id) {
    try {
      const gradientId = id || `gradient-${Math.random().toString(36).substr(2, 9)}`;
      
      // Check cache first
      if (this.gradientCache.has(gradientId)) {
        return this.gradientCache.get(gradientId);
      }

      let gradient;
      if (type === 'linear') {
        gradient = this.createSVGElement('linearGradient', {
          id: gradientId,
          x1: coordinates.x1 || '0%',
          y1: coordinates.y1 || '0%',
          x2: coordinates.x2 || '100%',
          y2: coordinates.y2 || '0%'
        });
      } else if (type === 'radial') {
        gradient = this.createSVGElement('radialGradient', {
          id: gradientId,
          cx: coordinates.cx || '50%',
          cy: coordinates.cy || '50%',
          r: coordinates.r || '50%',
          fx: coordinates.fx || coordinates.cx || '50%',
          fy: coordinates.fy || coordinates.cy || '50%'
        });
      } else {
        throw new Error(`Unsupported gradient type: ${type}`);
      }

      if (!gradient) return null;

      colorStops.forEach(stop => {
        const offset = typeof stop === 'object' ? stop.offset : stop[0];
        const color = typeof stop === 'object' ? stop.color : stop[1];
        const opacity = typeof stop === 'object' ? stop.opacity : undefined;

        const stopElement = this.createSVGElement('stop', {
          offset: typeof offset === 'number' ? `${offset * 100}%` : offset,
          'stop-color': color,
          'stop-opacity': opacity
        });

        gradient.appendChild(stopElement);
      });

      this.defs.appendChild(gradient);
      this.gradientCache.set(gradientId, gradient);
      return gradient;
    } catch (error) {
      this.errorHandler('Failed to create gradient', error);
      return null;
    }
  }

  /**
   * Create accessible button with enhanced features
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Button width
   * @param {number} height - Button height
   * @param {string} text - Button text
   * @param {Function} onClick - Click handler
   * @param {Object} options - Button options
   * @returns {SVGElement} Button group element
   */
  createButton(x, y, width, height, text, onClick, options = {}) {
    try {
      // Ensure minimum touch target size
      const adjustedWidth = Math.max(width, SVG_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET);
      const adjustedHeight = Math.max(height, SVG_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET);

      const button = this.createGroup({
        className: 'svg-button clickable interactive accessible-element',
        transform: `translate(${x}, ${y})`,
        id: options.id
      });

      if (!button) return null;

      // Create button background
      const background = this.createRect(0, 0, adjustedWidth, adjustedHeight, {
        fill: options.backgroundColor || this.currentTheme.primary,
        stroke: options.borderColor || this.currentTheme.border,
        strokeWidth: 1,
        borderRadius: options.borderRadius || 4,
        themeColor: 'primary',
        className: 'button-background'
      });

      // Create button text
      const textElement = this.createText(adjustedWidth / 2, adjustedHeight / 2, text, {
        textAnchor: 'middle',
        dominantBaseline: 'middle',
        fill: options.textColor || '#ffffff',
        fontSize: Math.max(options.fontSize || 14, SVG_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE),
        fontWeight: options.fontWeight || '500',
        className: 'button-text',
        accessible: true
      });

      if (background) button.appendChild(background);
      if (textElement) button.appendChild(textElement);

      // Add event handlers
      if (onClick) {
        button.addEventListener('click', onClick);
        button.addEventListener('keydown', (e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            onClick(e);
          }
        });
      }

      // Set accessibility attributes
      button.setAttribute('tabindex', '0');
      button.setAttribute('role', 'button');
      button.setAttribute('aria-label', options.ariaLabel || text);
      
      if (options.disabled) {
        button.setAttribute('aria-disabled', 'true');
        button.style.opacity = '0.5';
        button.style.cursor = 'not-allowed';
      }

      // Register with accessibility manager
      if (this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `button_${this.elementCount}`, {
          type: 'button',
          svgElement: button,
          x, y,
          width: adjustedWidth,
          height: adjustedHeight,
          text,
          label: options.label || text,
          ariaLabel: options.ariaLabel || text,
          description: options.description,
          onClick,
          focusable: !options.disabled,
          role: 'button'
        });
      }

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return button;
    } catch (error) {
      this.errorHandler('Failed to create button', error);
      return null;
    }
  }

  /**
   * Create accessible chart container
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Chart width
   * @param {number} height - Chart height
   * @param {Object} options - Chart options
   * @returns {SVGElement} Chart group element
   */
  createChart(x, y, width, height, options = {}) {
    try {
      const chart = this.createGroup({
        className: 'svg-chart accessible-element',
        transform: `translate(${x}, ${y})`,
        id: options.id
      });

      if (!chart) return null;

      // Create chart background
      if (options.backgroundColor !== false) {
        const background = this.createRect(0, 0, width, height, {
          fill: options.backgroundColor || this.currentTheme.background,
          stroke: options.borderColor || this.currentTheme.border,
          strokeWidth: options.borderWidth || 1,
          className: 'chart-background'
        });
        
        if (background) chart.appendChild(background);
      }

      // Add chart title if provided
      if (options.title) {
        const title = this.createText(width / 2, -10, options.title, {
          textAnchor: 'middle',
          fill: this.currentTheme.foreground,
          fontSize: 16,
          fontWeight: 'bold',
          className: 'chart-title',
          accessible: true
        });
        
        if (title) chart.appendChild(title);
      }

      // Register with accessibility manager
      if (this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `chart_${this.elementCount}`, {
          type: 'chart',
          svgElement: chart,
          x, y, width, height,
          label: options.label || options.title || 'Chart',
          ariaLabel: options.ariaLabel || `${options.type || 'Data'} chart`,
          description: options.description || 'Interactive data visualization'
        });
      }

      this.elementCount++;
      this.performanceMonitor.recordElement();
      return chart;
    } catch (error) {
      this.errorHandler('Failed to create chart', error);
      return null;
    }
  }

  /**
   * Create pattern for fills and strokes
   * @param {string} type - Pattern type ('dots', 'lines', 'grid', etc.)
   * @param {Object} options - Pattern options
   * @param {string} id - Optional pattern ID
   * @returns {SVGElement} Pattern element
   */
  createPattern(type, options = {}, id) {
    try {
      const patternId = id || `pattern-${type}-${Math.random().toString(36).substr(2, 9)}`;
      
      // Check cache first
      if (this.patternCache.has(patternId)) {
        return this.patternCache.get(patternId);
      }

      const pattern = this.createSVGElement('pattern', {
        id: patternId,
        patternUnits: 'userSpaceOnUse',
        width: options.width || 10,
        height: options.height || 10
      });

      if (!pattern) return null;

      const color = options.color || this.currentTheme.accent;
      const strokeWidth = options.strokeWidth || 1;

      switch (type) {
        case 'dots': {
          const dot = this.createCircle(5, 5, 1, {
            fill: color
          });
          if (dot) pattern.appendChild(dot);
          break;
        }

        case 'lines': {
          const line = this.createLine(0, 0, 0, 10, {
            stroke: color,
            strokeWidth
          });
          if (line) pattern.appendChild(line);
          break;
        }

        case 'grid': {
          const vLine = this.createLine(0, 0, 0, 10, {
            stroke: color,
            strokeWidth
          });
          const hLine = this.createLine(0, 0, 10, 0, {
            stroke: color,
            strokeWidth
          });
          if (vLine) pattern.appendChild(vLine);
          if (hLine) pattern.appendChild(hLine);
          break;
        }

        case 'diagonal': {
          const diagLine = this.createLine(0, 10, 10, 0, {
            stroke: color,
            strokeWidth
          });
          if (diagLine) pattern.appendChild(diagLine);
          break;
        }

        default:
          logger.warn(`Unknown pattern type: ${type}`);
      }

      this.defs.appendChild(pattern);
      this.patternCache.set(patternId, pattern);
      return pattern;
    } catch (error) {
      this.errorHandler('Failed to create pattern', error);
      return null;
    }
  }
  // Enhanced animation system with motion sensitivity and performance optimization
  
  /**
   * Create accessible animation with motion sensitivity support
   * @param {SVGElement} element - Element to animate
   * @param {Object} properties - Properties to animate
   * @param {number} duration - Animation duration in milliseconds
   * @param {string} easing - Easing function name
   * @param {Object} options - Animation options
   * @returns {string} Animation ID for control
   */
  animate(element, properties, duration = 1000, easing = 'ease', options = {}) {
    if (!element) {
      this.errorHandler('Invalid element for animation', new Error('Element is required'));
      return null;
    }

    // Respect user's motion preferences
    if (this.options.respectReducedMotion && window.matchMedia && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      
      // Skip animation for motion-sensitive users
      if (options.skipOnReducedMotion !== false) {
        this.applyFinalAnimationState(element, properties);
        return null;
      }
      
      // Reduce animation duration for motion-sensitive users
      duration = Math.min(duration * 0.2, 300);
    }

    const animation = {
      element,
      properties,
      duration,
      easing,
      startTime: performance.now(),
      startValues: {},
      id: Math.random().toString(36).substr(2, 9),
      onComplete: options.onComplete,
      onProgress: options.onProgress,
      paused: false,
      cancelled: false
    };

    // Store starting values
    Object.keys(properties).forEach(prop => {
      try {
        if (prop === 'transform') {
          animation.startValues[prop] = element.getAttribute('transform') || '';
        } else if (prop === 'opacity') {
          animation.startValues[prop] = parseFloat(element.getAttribute('opacity')) || 1;
        } else {
          animation.startValues[prop] = parseFloat(element.getAttribute(prop)) || 0;
        }
      } catch (error) {
        logger.warn(`Failed to get starting value for property: ${prop}`, error);
        animation.startValues[prop] = 0;
      }
    });

    this.animations.add(animation);
    this.runAnimation(animation);

    return animation.id;
  }

  /**
   * Apply final animation state immediately
   * @param {SVGElement} element - Target element
   * @param {Object} properties - Final properties
   */
  applyFinalAnimationState(element, properties) {
    try {
      Object.entries(properties).forEach(([prop, value]) => {
        element.setAttribute(prop, value);
      });
    } catch (error) {
      this.errorHandler('Failed to apply animation state', error);
    }
  }

  /**
   * Run animation with performance monitoring
   * @param {Object} animation - Animation object
   */
  runAnimation(animation) {
    const animate = (currentTime) => {
      if (animation.cancelled) {
        this.animations.delete(animation);
        return;
      }

      if (animation.paused) {
        requestAnimationFrame(animate);
        return;
      }

      const elapsed = currentTime - animation.startTime;
      let progress = Math.min(elapsed / animation.duration, 1);

      // Apply easing function
      progress = this.applyEasing(progress, animation.easing);

      try {
        // Update element properties
        Object.entries(animation.properties).forEach(([prop, endValue]) => {
          const startValue = animation.startValues[prop];
          
          if (prop === 'transform') {
            // Handle transform separately as it's not numeric
            animation.element.setAttribute(prop, endValue);
          } else {
            const currentValue = startValue + (endValue - startValue) * progress;
            animation.element.setAttribute(prop, currentValue);
          }
        });

        if (animation.onProgress) {
          animation.onProgress(progress);
        }

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          this.animations.delete(animation);
          if (animation.onComplete) {
            animation.onComplete();
          }
        }
      } catch (error) {
        this.errorHandler('Animation update failed', error);
        this.animations.delete(animation);
      }
    };

    requestAnimationFrame(animate);
  }

  /**
   * Apply easing function to animation progress
   * @param {number} t - Progress value (0-1)
   * @param {string} easing - Easing function name
   * @returns {number} Eased progress value
   */
  applyEasing(t, easing) {
    switch (easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return t * (2 - t);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'ease-in-cubic':
        return t * t * t;
      case 'ease-out-cubic':
        return (--t) * t * t + 1;
      case 'ease-in-out-cubic':
        return t < 0.5 ? 4 * t * t * t : (t - 1) * (2 * t - 2) * (2 * t - 2) + 1;
      case 'bounce':
        if (t < 1 / 2.75) {
          return 7.5625 * t * t;
        } else if (t < 2 / 2.75) {
          return 7.5625 * (t -= 1.5 / 2.75) * t + 0.75;
        } else if (t < 2.5 / 2.75) {
          return 7.5625 * (t -= 2.25 / 2.75) * t + 0.9375;
        } else {
          return 7.5625 * (t -= 2.625 / 2.75) * t + 0.984375;
        }
      case 'elastic': {
        const c4 = (2 * Math.PI) / 3;
        return t === 0
          ? 0
          : t === 1
          ? 1
          : Math.pow(2, -10 * t) * Math.sin((t * 10 - 0.75) * c4) + 1;
      }
      default:
        return t;
    }
  }

  /**
   * Pause animation by ID
   * @param {string} animationId - Animation ID to pause
   */
  pauseAnimation(animationId) {
    for (const animation of this.animations) {
      if (animation.id === animationId) {
        animation.paused = true;
        break;
      }
    }
  }

  /**
   * Resume animation by ID
   * @param {string} animationId - Animation ID to resume
   */
  resumeAnimation(animationId) {
    for (const animation of this.animations) {
      if (animation.id === animationId) {
        animation.paused = false;
        break;
      }
    }
  }

  /**
   * Stop animation by ID
   * @param {string} animationId - Animation ID to stop
   */
  stopAnimation(animationId) {
    for (const animation of this.animations) {
      if (animation.id === animationId) {
        animation.cancelled = true;
        break;
      }
    }
  }

  /**
   * Stop all animations
   */
  stopAllAnimations() {
    for (const animation of this.animations) {
      animation.cancelled = true;
    }
    this.animations.clear();
  }

  /**
   * Create fade animation using CSS or SMIL
   * @param {SVGElement} element - Target element
   * @param {number} targetOpacity - Target opacity value
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  fadeAnimation(element, targetOpacity, duration = 500, options = {}) {
    return this.animate(element, { opacity: targetOpacity }, duration, options.easing || 'ease-out', options);
  }

  /**
   * Create slide animation
   * @param {SVGElement} element - Target element
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  slideAnimation(element, targetX, targetY, duration = 500, options = {}) {
    const newTransform = `translate(${targetX}, ${targetY})`;
    
    return this.animate(element, { transform: newTransform }, duration, options.easing || 'ease-out', options);
  }

  /**
   * Create scale animation
   * @param {SVGElement} element - Target element
   * @param {number} targetScale - Target scale value
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  scaleAnimation(element, targetScale, duration = 500, options = {}) {
    const currentTransform = element.getAttribute('transform') || '';
    const scaleTransform = `scale(${targetScale})`;
    
    // Preserve existing transforms
    let newTransform = scaleTransform;
    if (currentTransform && !currentTransform.includes('scale')) {
      newTransform = `${currentTransform} ${scaleTransform}`;
    }
    
    return this.animate(element, { transform: newTransform }, duration, options.easing || 'ease-out', options);
  }

  /**
   * Create rotation animation
   * @param {SVGElement} element - Target element
   * @param {number} targetRotation - Target rotation in degrees
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  rotateAnimation(element, targetRotation, duration = 500, options = {}) {
    const currentTransform = element.getAttribute('transform') || '';
    const rotateTransform = `rotate(${targetRotation})`;
    
    // Preserve existing transforms
    let newTransform = rotateTransform;
    if (currentTransform && !currentTransform.includes('rotate')) {
      newTransform = `${currentTransform} ${rotateTransform}`;
    }
    
    return this.animate(element, { transform: newTransform }, duration, options.easing || 'ease-out', options);
  }
  // Enhanced rendering and integration methods
  
  /**
   * Get renderer type for Visual Engine integration
   * @returns {string} Renderer type
   */
  get type() {
    return 'svg';
  }

  /**
   * Get SVG element for external integration
   * @returns {SVGElement} SVG element
   */
  getElement() {
    return this.svg;
  }

  /**
   * Render complete scene with performance monitoring
   * @param {Object} scene - Scene object to render
   */
  render(scene) {
    if (!scene) return;
    
    this.performanceMonitor.startFrame();
    
    try {
      this.clear();
      
      if (scene.backgroundColor) {
        const background = this.createRect(0, 0, this.options.width, this.options.height, {
          fill: scene.backgroundColor,
          className: 'scene-background'
        });
        if (background) this.mainGroup.appendChild(background);
      }
      
      if (scene.render && typeof scene.render === 'function') {
        scene.render(this);
      } else if (scene.objects && Array.isArray(scene.objects)) {
        scene.objects.forEach(obj => this.renderObject(obj));
      }
      
      // Announce scene changes to screen readers
      if (this.accessibilityManager && scene.description) {
        this.accessibilityManager.updateDescription(scene.description);
      }
    } catch (error) {
      this.errorHandler('Failed to render scene', error);
    } finally {
      this.performanceMonitor.endFrame();
    }
  }

  /**
   * Render individual object with transformations and accessibility
   * @param {Object} object - Object to render
   */
  renderObject(object) {
    if (!object || object.visible === false) return;
    
    try {
      // Create SVG group for this object
      const group = this.createGroup({
        className: 'scene-object',
        id: object.id
      });
      
      if (!group) return;
      
      // Apply transformations
      const transforms = [];
      
      if (object.x || object.y) {
        transforms.push(`translate(${object.x || 0}, ${object.y || 0})`);
      }
      
      if (object.rotation) {
        const rotationDeg = object.rotation * 180 / Math.PI;
        transforms.push(`rotate(${rotationDeg})`);
      }
      
      if (object.scale && object.scale !== 1) {
        const scaleX = typeof object.scale === 'object' ? object.scale.x : object.scale;
        const scaleY = typeof object.scale === 'object' ? object.scale.y : object.scale;
        transforms.push(`scale(${scaleX}, ${scaleY})`);
      }
      
      if (transforms.length > 0) {
        group.setAttribute('transform', transforms.join(' '));
      }
      
      if (object.alpha !== undefined) {
        group.setAttribute('opacity', Math.max(0, Math.min(1, object.alpha)));
      }
      
      // Apply blend mode if specified
      if (object.blendMode) {
        group.style.mixBlendMode = object.blendMode;
      }
      
      // Render based on object type or custom render method
      let element;
      if (object.render && typeof object.render === 'function') {
        // Let object render itself
        object.render(this, group);
      } else if (object.type) {
        element = this.renderByType(object);
      }
      
      if (element) {
        group.appendChild(element);
      }
      
      this.mainGroup.appendChild(group);
    } catch (error) {
      this.errorHandler(`Failed to render object: ${object.type || 'unknown'}`, error);
    }
  }

  /**
   * Render object by type with enhanced features
   * @param {Object} object - Object to render
   * @returns {SVGElement} Rendered element
   */
  renderByType(object) {
    const commonOptions = {
      fill: object.fill || object.color,
      stroke: object.stroke || object.borderColor,
      strokeWidth: object.strokeWidth || object.borderWidth,
      className: object.className,
      interactive: object.interactive,
      id: object.id,
      label: object.label,
      ariaLabel: object.ariaLabel,
      description: object.description,
      onClick: object.onClick,
      themeColor: object.themeColor,
      themeAttribute: object.themeAttribute
    };
    
    try {
      switch (object.type) {
        case 'rect':
        case 'rectangle':
          return this.createRect(
            0, 0,
            object.width || 50,
            object.height || 50,
            {
              ...commonOptions,
              borderRadius: object.borderRadius
            }
          );
          
        case 'circle':
          return this.createCircle(
            0, 0,
            object.radius || 25,
            commonOptions
          );
          
        case 'ellipse':
          return this.createSVGElement('ellipse', {
            cx: 0,
            cy: 0,
            rx: object.radiusX || object.radius || 25,
            ry: object.radiusY || object.radius || 25,
            fill: commonOptions.fill || 'transparent',
            stroke: commonOptions.stroke || 'none',
            'stroke-width': commonOptions.strokeWidth || SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH,
            class: `ellipse-element ${commonOptions.className || ''}`
          });
          
        case 'text':
          return this.createText(
            0, 0,
            object.text || '',
            {
              fill: commonOptions.fill,
              fontSize: object.fontSize,
              fontFamily: object.fontFamily,
              fontWeight: object.fontWeight,
              fontStyle: object.fontStyle,
              textAnchor: object.textAnchor || object.align,
              dominantBaseline: object.dominantBaseline || object.baseline,
              accessible: object.accessible,
              className: commonOptions.className,
              id: commonOptions.id,
              label: commonOptions.label,
              ariaLabel: commonOptions.ariaLabel,
              description: commonOptions.description
            }
          );
          
        case 'line':
          return this.createLine(
            object.x1 || 0, object.y1 || 0,
            object.x2 || 50, object.y2 || 50,
            {
              stroke: commonOptions.stroke,
              strokeWidth: commonOptions.strokeWidth,
              linecap: object.linecap,
              linejoin: object.linejoin,
              dashArray: object.dashArray,
              dashOffset: object.dashOffset,
              className: commonOptions.className
            }
          );
          
        case 'path':
          if (object.pathData || object.d) {
            return this.createPath(
              object.pathData || object.d,
              {
                ...commonOptions,
                linecap: object.linecap,
                linejoin: object.linejoin,
                dashArray: object.dashArray,
                fillRule: object.fillRule
              }
            );
          }
          break;
          
        case 'polygon':
          if (object.points) {
            const pointsString = Array.isArray(object.points) 
              ? object.points.map(p => `${p.x},${p.y}`).join(' ')
              : object.points;
            
            return this.createSVGElement('polygon', {
              points: pointsString,
              fill: commonOptions.fill || 'transparent',
              stroke: commonOptions.stroke || 'none',
              'stroke-width': commonOptions.strokeWidth || SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH,
              class: `polygon-element ${commonOptions.className || ''}`
            });
          }
          break;
          
        case 'polyline':
          if (object.points) {
            const pointsString = Array.isArray(object.points) 
              ? object.points.map(p => `${p.x},${p.y}`).join(' ')
              : object.points;
            
            return this.createSVGElement('polyline', {
              points: pointsString,
              fill: 'none',
              stroke: commonOptions.stroke || this.currentTheme.foreground,
              'stroke-width': commonOptions.strokeWidth || SVG_CONSTANTS.ACCESSIBILITY.MIN_STROKE_WIDTH,
              class: `polyline-element ${commonOptions.className || ''}`
            });
          }
          break;
          
        case 'image':
          if (object.href || object.src) {
            return this.createSVGElement('image', {
              x: 0,
              y: 0,
              width: object.width || 50,
              height: object.height || 50,
              href: object.href || object.src,
              preserveAspectRatio: object.preserveAspectRatio || 'xMidYMid meet',
              class: `image-element ${commonOptions.className || ''}`
            });
          }
          break;
          
        default:
          // Draw a placeholder for unknown types
          logger.warn(`Unknown object type: ${object.type}`);
          return this.createRect(-5, -5, 10, 10, {
            fill: '#ff6b6b',
            stroke: '#e55555',
            strokeWidth: 1,
            className: 'unknown-object-placeholder'
          });
      }
    } catch (error) {
      this.errorHandler(`Failed to render object type: ${object.type}`, error);
      return null;
    }
    
    return null;
  }
  // Enhanced utility and management methods
  
  /**
   * Resize SVG with proper scaling and cleanup
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    if (!width || !height || width <= 0 || height <= 0) {
      this.errorHandler('Invalid resize dimensions', new Error('Width and height must be positive'));
      return;
    }
    
    try {
      this.options.width = width;
      this.options.height = height;
      
      this.svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
      
      // Trigger resize event for listeners
      this.svg.dispatchEvent(new CustomEvent('svgResize', {
        detail: { width, height }
      }));
      
      // Clear performance metrics on resize
      this.performanceMonitor.reset();
      this.elementCount = 0;
    } catch (error) {
      this.errorHandler('Failed to resize SVG', error);
    }
  }

  /**
   * Add element to specific layer
   * @param {string} layerName - Layer name
   * @param {SVGElement} element - Element to add
   * @returns {SVGElement} Added element
   */
  addToLayer(layerName, element) {
    if (!element) {
      this.errorHandler('Invalid element provided to layer', new Error('Element is required'));
      return null;
    }
    
    try {
      const layer = this.getLayer(layerName);
      layer.appendChild(element);
      return element;
    } catch (error) {
      this.errorHandler('Failed to add element to layer', error);
      return null;
    }
  }

  /**
   * Clear SVG content with optional layer targeting
   * @param {string} layerName - Optional layer name to clear
   */
  clear(layerName = null) {
    try {
      if (layerName) {
        const layer = this.getLayer(layerName);
        layer.innerHTML = '';
      } else {
        // Clear all content but preserve structure
        this.mainGroup.innerHTML = '';
        this.layers.clear();
        this.elementCount = 0;
        
        // Clear accessibility elements
        if (this.accessibilityManager) {
          this.accessibilityManager.elements.clear();
        }
      }
      
      this.performanceMonitor.recordDOMOperation();
    } catch (error) {
      this.errorHandler('Failed to clear SVG content', error);
    }
  }

  /**
   * Set SVG viewBox for zooming and panning
   * @param {number} x - ViewBox X
   * @param {number} y - ViewBox Y
   * @param {number} width - ViewBox width
   * @param {number} height - ViewBox height
   */
  setViewBox(x, y, width, height) {
    try {
      this.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
    } catch (error) {
      this.errorHandler('Failed to set viewBox', error);
    }
  }

  /**
   * Export SVG as string with optional optimization
   * @param {Object} options - Export options
   * @returns {string} SVG string
   */
  exportSVG(options = {}) {
    try {
      let svgString = new XMLSerializer().serializeToString(this.svg);
      
      if (options.optimize) {
        // Basic optimization: remove unnecessary whitespace and comments
        svgString = svgString.replace(/>\s+</g, '><');
        svgString = svgString.replace(/<!--[\s\S]*?-->/g, '');
      }
      
      if (options.standalone) {
        // Add XML declaration and DOCTYPE for standalone SVG
        svgString = `<?xml version="1.0" encoding="UTF-8"?>\n${svgString}`;
      }
      
      return svgString;
    } catch (error) {
      this.errorHandler('Failed to export SVG', error);
      return '';
    }
  }

  /**
   * Convert SVG to data URL
   * @param {Object} options - Export options
   * @returns {string} Data URL
   */
  toDataURL(options = {}) {
    try {
      const svgString = this.exportSVG(options);
      const base64 = btoa(unescape(encodeURIComponent(svgString)));
      return `data:image/svg+xml;base64,${base64}`;
    } catch (error) {
      this.errorHandler('Failed to create data URL', error);
      return '';
    }
  }

  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMonitor.getMetrics(),
      elementCount: this.elementCount,
      activeAnimations: this.animations.size,
      gradientCacheSize: this.gradientCache.size,
      patternCacheSize: this.patternCache.size,
      layerCount: this.layers.size,
      svgSize: {
        width: this.options.width,
        height: this.options.height
      }
    };
  }

  /**
   * Clear caches to free memory
   */
  clearCaches() {
    try {
      this.gradientCache.clear();
      this.patternCache.clear();
    } catch (error) {
      this.errorHandler('Failed to clear caches', error);
    }
  }

  /**
   * Find element by ID within SVG
   * @param {string} id - Element ID
   * @returns {SVGElement|null} Found element
   */
  getElementById(id) {
    try {
      return this.svg.querySelector(`#${CSS.escape(id)}`);
    } catch (error) {
      this.errorHandler('Failed to find element by ID', error);
      return null;
    }
  }

  /**
   * Find elements by class name within SVG
   * @param {string} className - Class name
   * @returns {NodeList} Found elements
   */
  getElementsByClassName(className) {
    try {
      return this.svg.querySelectorAll(`.${CSS.escape(className)}`);
    } catch (error) {
      this.errorHandler('Failed to find elements by class', error);
      return [];
    }
  }

  /**
   * Get bounding box of element or entire SVG
   * @param {SVGElement} element - Optional element (defaults to SVG)
   * @returns {Object} Bounding box
   */
  getBoundingBox(element = null) {
    try {
      const target = element || this.svg;
      if (target.getBBox) {
        return target.getBBox();
      } else if (target.getBoundingClientRect) {
        return target.getBoundingClientRect();
      }
      return { x: 0, y: 0, width: 0, height: 0 };
    } catch (error) {
      this.errorHandler('Failed to get bounding box', error);
      return { x: 0, y: 0, width: 0, height: 0 };
    }
  }

  /**
   * Clean up resources and event listeners
   */
  destroy() {
    try {
      // Stop all animations
      this.stopAllAnimations();
      
      // Clear caches
      this.clearCaches();
      
      // Remove event listeners
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
      } else {
        window.removeEventListener('resize', this.boundHandleResize);
      }
      
      // Cancel any pending animation frames
      if (this.animationFrameId) {
        cancelAnimationFrame(this.animationFrameId);
      }
      
      // Remove accessibility manager
      if (this.accessibilityManager) {
        this.accessibilityManager.elements.clear();
        this.accessibilityManager = null;
      }
      
      // Remove SVG from DOM
      if (this.svg && this.svg.parentNode) {
        this.svg.parentNode.removeChild(this.svg);
      }
      
      // Clear references
      this.svg = null;
      this.defs = null;
      this.mainGroup = null;
      this.container = null;
      this.layers.clear();
      
      // Dispatch cleanup event
      document.dispatchEvent(new CustomEvent('svgRendererDestroyed', {
        detail: { rendererId: this.id }
      }));
    } catch (error) {
      this.errorHandler('Error during cleanup', error);
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SVGRenderer = SVGRenderer;
}

export default SVGRenderer;
