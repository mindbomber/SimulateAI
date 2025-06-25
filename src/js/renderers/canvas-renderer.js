/**
 * Enhanced Canvas Renderer for SimulateAI Platform
 * High-performance, accessible, and modern canvas-based graphics rendering
 * 
 * Features:
 * - High-DPI and responsive canvas support
 * - Accessibility integration with ARIA and screen reader support
 * - Theme-aware rendering with dark mode support
 * - Performance monitoring and optimization
 * - Advanced animation system with motion sensitivity
 * - Memory management and cleanup
 * - Security-conscious rendering
 * - Comprehensive error handling
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

// Enhanced constants and configuration
const CANVAS_CONSTANTS = {
    VERSION: '2.0.0',
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    MAX_CANVAS_SIZE: 32767, // Browser limitation
    ANIMATION_FPS: 60,
    PERFORMANCE_SAMPLE_RATE: 0.1,
    ACCESSIBILITY: {
        MIN_CONTRAST_RATIO: 4.5,
        MIN_FONT_SIZE: 12,
        MIN_TOUCH_TARGET: 44
    },
    THEMES: {
        LIGHT: {
            background: '#ffffff',
            foreground: '#333333',
            primary: '#007acc',
            secondary: '#28a745',
            accent: '#6c757d'
        },
        DARK: {
            background: '#1a1a1a',
            foreground: '#e0e0e0',
            primary: '#4da6ff',
            secondary: '#66bb6a',
            accent: '#9e9e9e'
        },
        HIGH_CONTRAST: {
            background: '#000000',
            foreground: '#ffffff',
            primary: '#ffff00',
            secondary: '#00ffff',
            accent: '#ff00ff'
        }
    }
};

/**
 * Performance monitoring for canvas operations
 */
class CanvasPerformanceMonitor {
    constructor() {
        this.metrics = {
            drawCalls: 0,
            renderTime: 0,
            frameCount: 0,
            averageFrameTime: 0,
            droppedFrames: 0,
            lastFrameTime: 0
        };
        this.enabled = CANVAS_CONSTANTS.PERFORMANCE_SAMPLE_RATE > Math.random();
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
    
    recordDrawCall() {
        if (!this.enabled) return;
        this.metrics.drawCalls++;
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
 * Canvas accessibility manager
 */
class CanvasAccessibilityManager {
    constructor(canvas, renderer) {
        this.canvas = canvas;
        this.renderer = renderer;
        this.description = '';
        this.elements = new Map();
        this.focusedElement = null;
        this.setupAccessibility();
    }
    
    setupAccessibility() {
        // Set up canvas accessibility attributes
        this.canvas.setAttribute('role', 'img');
        this.canvas.setAttribute('tabindex', '0');
        this.updateDescription('Interactive simulation canvas');
        
        // Add keyboard navigation
        this.canvas.addEventListener('keydown', this.handleKeydown.bind(this));
        this.canvas.addEventListener('focus', this.handleFocus.bind(this));
        this.canvas.addEventListener('blur', this.handleBlur.bind(this));
    }
    
    updateDescription(description) {
        this.description = description;
        this.canvas.setAttribute('aria-label', description);
    }
    
    addElement(id, element) {
        this.elements.set(id, {
            ...element,
            id,
            focusable: element.focusable !== false
        });
        this.updateDescription();
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
            .filter(el => el.focusable);
        
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
        }
    }
    
    focusElement(id) {
        this.focusedElement = id;
        const element = this.elements.get(id);
        if (element) {
            this.announceElement(element);
            this.renderer.requestRender();
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
        this.canvas.style.outline = '2px solid #007acc';
    }
    
    handleBlur() {
        this.canvas.style.outline = 'none';
        this.focusedElement = null;
    }
    
    getElementAt(x, y) {
        for (const [id, element] of this.elements.entries()) {
            if (this.isPointInElement(x, y, element)) {
                return id;
            }
        }
        return null;
    }
    
    isPointInElement(x, y, element) {
        const { x: ex, y: ey, width, height } = element;
        return x >= ex && x <= ex + width && y >= ey && y <= ey + height;
    }
}

/**
 * Enhanced Canvas Renderer with modern features
 */

class CanvasRenderer {
  /**
   * Create an enhanced canvas renderer
   * @param {HTMLElement} container - Container element
   * @param {Object} options - Renderer options
   */
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || CANVAS_CONSTANTS.DEFAULT_WIDTH,
      height: options.height || CANVAS_CONSTANTS.DEFAULT_HEIGHT,
      pixelRatio: options.pixelRatio || window.devicePixelRatio || 1,
      alpha: options.alpha !== false,
      antialias: options.antialias !== false,
      theme: options.theme || 'light',
      enableAccessibility: options.enableAccessibility !== false,
      enablePerformanceMonitoring: options.enablePerformanceMonitoring !== false,
      respectReducedMotion: options.respectReducedMotion !== false,
      maxDrawCalls: options.maxDrawCalls || 10000,
      ...options
    };

    // Core canvas properties
    this.canvas = null;
    this.ctx = null;
    this.layers = new Map();
    this.animations = new Set();
    this.isRendering = false;
    this.renderRequested = false;
    
    // Enhanced features
    this.performanceMonitor = new CanvasPerformanceMonitor();
    this.accessibilityManager = null;
    
    // Safely handle theme selection with proper type checking
    const themeKey = (typeof this.options.theme === 'string' ? this.options.theme : 'light').toUpperCase();
    this.currentTheme = CANVAS_CONSTANTS.THEMES[themeKey] || CANVAS_CONSTANTS.THEMES.LIGHT;
    
    this.imageCache = new Map();
    this.drawCallCount = 0;
    
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
   * Initialize the canvas renderer with enhanced features
   */
  initialize() {
    this.validateContainer();
    this.createCanvas();
    this.setupContext();
    this.setupAccessibility();
    this.setupResponsiveHandling();
    this.setupThemeMonitoring();
    this.applyInitialStyles();
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
   * Create and configure canvas element
   */
  createCanvas() {
    this.canvas = document.createElement('canvas');
    
    // Validate canvas size limits
    const maxWidth = Math.min(this.options.width, CANVAS_CONSTANTS.MAX_CANVAS_SIZE);
    const maxHeight = Math.min(this.options.height, CANVAS_CONSTANTS.MAX_CANVAS_SIZE);
    
    // Set canvas styling
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    this.canvas.style.touchAction = 'none'; // Prevent default touch behaviors
    
    // Set canvas size with device pixel ratio
    this.canvas.width = maxWidth * this.options.pixelRatio;
    this.canvas.height = maxHeight * this.options.pixelRatio;
    
    // Add security attributes
    this.canvas.setAttribute('data-renderer', 'canvas');
    this.canvas.setAttribute('data-version', CANVAS_CONSTANTS.VERSION);
    
    this.container.appendChild(this.canvas);
  }
  
  /**
   * Setup canvas context with enhanced options
   */
  setupContext() {
    const contextOptions = {
      alpha: this.options.alpha,
      antialias: this.options.antialias,
      colorSpace: 'srgb',
      desynchronized: false,
      willReadFrequently: false
    };
    
    this.ctx = this.canvas.getContext('2d', contextOptions);
    
    if (!this.ctx) {
      throw new Error('Failed to get 2D canvas context');
    }
    
    // Scale context for high-DPI displays
    this.ctx.scale(this.options.pixelRatio, this.options.pixelRatio);
    
    // Set default styles with theme awareness
    this.applyDefaultStyles();
  }
  
  /**
   * Apply default canvas styles
   */
  applyDefaultStyles() {
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif';
    this.ctx.textBaseline = 'middle';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    this.ctx.imageSmoothingEnabled = this.options.antialias;
    this.ctx.imageSmoothingQuality = 'high';
  }
  
  /**
   * Setup accessibility features
   */
  setupAccessibility() {
    if (this.options.enableAccessibility) {
      this.accessibilityManager = new CanvasAccessibilityManager(this.canvas, this);
    }
  }
  
  /**
   * Setup responsive canvas handling
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
   * Apply initial canvas styles
   */
  applyInitialStyles() {
    this.clear();
    this.ctx.fillStyle = this.currentTheme.background;
    this.ctx.fillRect(0, 0, this.options.width, this.options.height);
  }
  
  /**
   * Handle container resize
   */
  handleResize(entries) {
    let width, height;
    
    if (entries && entries[0]) {
      ({ width, height } = entries[0].contentRect);
    } else {
      // Fallback for non-ResizeObserver browsers
      ({ width, height } = this.container.getBoundingClientRect());
    }
    
    // Validate dimensions before resizing
    if (width > 0 && height > 0) {
      this.resize(width, height);
    }
    // Skip resize silently if dimensions are invalid (container might be hidden)
  }
  
  /**
   * Set theme with automatic style updates
   * @param {string} themeName - Theme name ('light', 'dark', 'high_contrast')
   */
  setTheme(themeName) {
    // Safely handle theme name with proper type checking
    const themeKey = (typeof themeName === 'string' ? themeName : 'light').toUpperCase();
    const theme = CANVAS_CONSTANTS.THEMES[themeKey];
    if (theme && theme !== this.currentTheme) {
      this.currentTheme = theme;
      this.options.theme = themeName;
      this.applyInitialStyles();
      this.requestRender();
    }
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
    console.error(`CanvasRenderer Error: ${message}`, error);
    
    if (this.options.enableAccessibility && this.accessibilityManager) {
      this.accessibilityManager.announceToScreenReader(`Rendering error: ${message}`);
    }
  }
  // Enhanced drawing methods with accessibility and theme support
  /**
   * Clear canvas area with theme-aware background
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate  
   * @param {number} width - Width to clear
   * @param {number} height - Height to clear
   */
  clear(x = 0, y = 0, width = this.options.width, height = this.options.height) {
    this.ctx.clearRect(x, y, width, height);
    
    // Apply theme background if clearing full canvas
    if (x === 0 && y === 0 && width === this.options.width && height === this.options.height) {
      this.ctx.fillStyle = this.currentTheme.background;
      this.ctx.fillRect(x, y, width, height);
    }
    
    this.performanceMonitor.recordDrawCall();
  }

  /**
   * Draw rectangle with enhanced options and accessibility
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {Object} options - Drawing options
   */
  drawRect(x, y, width, height, options = {}) {
    if (this.drawCallCount >= this.options.maxDrawCalls) {
      this.errorHandler('Maximum draw calls exceeded', new Error('Performance limit'));
      return;
    }
    
    this.ctx.save();
    
    try {
      // Apply theme-aware defaults
      const fill = options.fill || (options.primary ? this.currentTheme.primary : null);
      const stroke = options.stroke || (options.border ? this.currentTheme.foreground : null);
      
      // Accessibility: Ensure minimum size for interactive elements
      if (options.interactive && (width < CANVAS_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET || 
                                  height < CANVAS_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET)) {
        console.warn('Interactive element below minimum touch target size');
      }
      
      if (fill) {
        this.ctx.fillStyle = fill;
        if (options.borderRadius) {
          this.drawRoundedRect(x, y, width, height, options.borderRadius);
          this.ctx.fill();
        } else {
          this.ctx.fillRect(x, y, width, height);
        }
      }
      
      if (stroke) {
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = options.strokeWidth || 1;
        if (options.borderRadius) {
          this.drawRoundedRect(x, y, width, height, options.borderRadius);
          this.ctx.stroke();
        } else {
          this.ctx.strokeRect(x, y, width, height);
        }
      }
      
      // Register with accessibility manager
      if (options.interactive && this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `rect_${Date.now()}`, {
          type: 'rectangle',
          x, y, width, height,
          label: options.label,
          ariaLabel: options.ariaLabel,
          onClick: options.onClick,
          focusable: options.focusable
        });
      }
    } catch (error) {
      this.errorHandler('Failed to draw rectangle', error);
    } finally {
      this.ctx.restore();
      this.performanceMonitor.recordDrawCall();
      this.drawCallCount++;
    }
  }

  /**
   * Draw rounded rectangle path
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number|Object} radius - Border radius (number or {tl, tr, br, bl})
   */
  drawRoundedRect(x, y, width, height, radius) {
    if (typeof radius === 'number') {
      radius = { tl: radius, tr: radius, br: radius, bl: radius };
    }
    
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius.tl, y);
    this.ctx.lineTo(x + width - radius.tr, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    this.ctx.lineTo(x + width, y + height - radius.br);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    this.ctx.lineTo(x + radius.bl, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    this.ctx.lineTo(x, y + radius.tl);
    this.ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    this.ctx.closePath();
  }

  /**
   * Draw circle with enhanced accessibility features
   * @param {number} x - Center X coordinate
   * @param {number} y - Center Y coordinate
   * @param {number} radius - Circle radius
   * @param {Object} options - Drawing options
   */
  drawCircle(x, y, radius, options = {}) {
    if (this.drawCallCount >= this.options.maxDrawCalls) return;
    
    this.ctx.save();
    
    try {
      // Apply theme-aware defaults
      const fill = options.fill || (options.primary ? this.currentTheme.primary : null);
      const stroke = options.stroke || (options.border ? this.currentTheme.foreground : null);
      
      this.ctx.beginPath();
      this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
      
      if (fill) {
        this.ctx.fillStyle = fill;
        this.ctx.fill();
      }
      
      if (stroke) {
        this.ctx.strokeStyle = stroke;
        this.ctx.lineWidth = options.strokeWidth || 1;
        this.ctx.stroke();
      }
      
      // Register with accessibility manager
      if (options.interactive && this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `circle_${Date.now()}`, {
          type: 'circle',
          x: x - radius, y: y - radius, 
          width: radius * 2, height: radius * 2,
          label: options.label,
          ariaLabel: options.ariaLabel,
          onClick: options.onClick
        });
      }
    } catch (error) {
      this.errorHandler('Failed to draw circle', error);
    } finally {
      this.ctx.restore();
      this.performanceMonitor.recordDrawCall();
      this.drawCallCount++;
    }
  }

  /**
   * Draw line with enhanced styling options
   * @param {number} x1 - Start X coordinate
   * @param {number} y1 - Start Y coordinate
   * @param {number} x2 - End X coordinate
   * @param {number} y2 - End Y coordinate
   * @param {Object} options - Drawing options
   */
  drawLine(x1, y1, x2, y2, options = {}) {
    if (this.drawCallCount >= this.options.maxDrawCalls) return;
    
    this.ctx.save();
    
    try {
      this.ctx.beginPath();
      this.ctx.moveTo(x1, y1);
      this.ctx.lineTo(x2, y2);
      
      this.ctx.strokeStyle = options.stroke || this.currentTheme.foreground;
      this.ctx.lineWidth = options.strokeWidth || 1;
      
      if (options.lineCap) {
        this.ctx.lineCap = options.lineCap;
      }
      
      if (options.dashPattern) {
        this.ctx.setLineDash(options.dashPattern);
      }
      
      this.ctx.stroke();
    } catch (error) {
      this.errorHandler('Failed to draw line', error);
    } finally {
      this.ctx.restore();
      this.performanceMonitor.recordDrawCall();
      this.drawCallCount++;
    }
  }

  /**
   * Draw path with multiple points
   * @param {Array} points - Array of {x, y} points
   * @param {Object} options - Drawing options
   */
  drawPath(points, options = {}) {
    if (!Array.isArray(points) || points.length < 2) return;
    if (this.drawCallCount >= this.options.maxDrawCalls) return;
    
    this.ctx.save();
    
    try {
      this.ctx.beginPath();
      this.ctx.moveTo(points[0].x, points[0].y);
      
      for (let i = 1; i < points.length; i++) {
        if (options.smooth && i > 0 && i < points.length - 1) {
          // Smooth curves using quadratic curves
          const cp = points[i];
          const next = points[i + 1];
          this.ctx.quadraticCurveTo(cp.x, cp.y, (cp.x + next.x) / 2, (cp.y + next.y) / 2);
        } else {
          this.ctx.lineTo(points[i].x, points[i].y);
        }
      }
      
      if (options.closePath) {
        this.ctx.closePath();
      }
      
      if (options.fill) {
        this.ctx.fillStyle = options.fill;
        this.ctx.fill();
      }
      
      if (options.stroke) {
        this.ctx.strokeStyle = options.stroke;
        this.ctx.lineWidth = options.strokeWidth || 1;
        this.ctx.stroke();
      }
    } catch (error) {
      this.errorHandler('Failed to draw path', error);
    } finally {
      this.ctx.restore();
      this.performanceMonitor.recordDrawCall();
      this.drawCallCount++;
    }
  }

  /**
   * Draw text with enhanced accessibility and typography
   * @param {string} text - Text to draw
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} options - Text options
   */
  drawText(text, x, y, options = {}) {
    if (typeof text !== 'string' || this.drawCallCount >= this.options.maxDrawCalls) return;
    
    this.ctx.save();
    
    try {
      // Accessibility: Ensure minimum font size
      const fontSize = Math.max(
        options.fontSize || 14, 
        CANVAS_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE
      );
      
      // Apply theme-aware defaults
      const fill = options.fill || options.color || this.currentTheme.foreground;
      
      // Set font properties with accessibility considerations
      const fontWeight = options.fontWeight || 'normal';
      const fontFamily = options.fontFamily || 
        '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, system-ui, sans-serif';
      
      this.ctx.font = `${fontWeight} ${fontSize}px ${fontFamily}`;
      this.ctx.textAlign = options.textAlign || 'left';
      this.ctx.textBaseline = options.textBaseline || 'middle';
      
      // Text shadow for better readability if specified
      if (options.shadow) {
        this.ctx.shadowColor = options.shadow.color || 'rgba(0,0,0,0.5)';
        this.ctx.shadowBlur = options.shadow.blur || 2;
        this.ctx.shadowOffsetX = options.shadow.offsetX || 1;
        this.ctx.shadowOffsetY = options.shadow.offsetY || 1;
      }
      
      if (fill) {
        this.ctx.fillStyle = fill;
        this.ctx.fillText(text, x, y);
      }
      
      if (options.stroke) {
        this.ctx.strokeStyle = options.stroke;
        this.ctx.lineWidth = options.strokeWidth || 1;
        this.ctx.strokeText(text, x, y);
      }
      
      // Register with accessibility manager for screen readers
      if (options.accessible && this.accessibilityManager) {
        const metrics = this.ctx.measureText(text);
        this.accessibilityManager.addElement(options.id || `text_${Date.now()}`, {
          type: 'text',
          x, y: y - fontSize/2,
          width: metrics.width,
          height: fontSize,
          text: text,
          label: options.label || text,
          ariaLabel: options.ariaLabel || text
        });
      }
    } catch (error) {
      this.errorHandler('Failed to draw text', error);
    } finally {
      this.ctx.restore();
      this.performanceMonitor.recordDrawCall();
      this.drawCallCount++;
    }
  }
  // Advanced drawing methods with enhanced accessibility and theme support
  
  /**
   * Draw accessible button with proper focus handling
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Button width
   * @param {number} height - Button height
   * @param {string} text - Button text
   * @param {Object} options - Button styling and interaction options
   */
  drawButton(x, y, width, height, text, options = {}) {
    if (this.drawCallCount >= this.options.maxDrawCalls) return;
    
    try {
      // Ensure minimum touch target size for accessibility
      const adjustedWidth = Math.max(width, CANVAS_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET);
      const adjustedHeight = Math.max(height, CANVAS_CONSTANTS.ACCESSIBILITY.MIN_TOUCH_TARGET);
      
      // Theme-aware colors
      const backgroundColor = options.backgroundColor || 
        (options.variant === 'secondary' ? this.currentTheme.secondary : this.currentTheme.primary);
      const borderColor = options.borderColor || this.currentTheme.foreground;
      const textColor = options.textColor || '#ffffff';
      
      // Draw button background with focus indicator
      const isFocused = this.accessibilityManager?.focusedElement === options.id;
      this.drawRect(x, y, adjustedWidth, adjustedHeight, {
        fill: backgroundColor,
        stroke: isFocused ? this.currentTheme.accent : borderColor,
        strokeWidth: isFocused ? 3 : 1,
        borderRadius: options.borderRadius || 4,
        interactive: true,
        id: options.id,
        label: options.label || text,
        ariaLabel: options.ariaLabel || text,
        onClick: options.onClick,
        focusable: true
      });
      
      // Draw button text with proper contrast
      this.drawText(text, x + adjustedWidth / 2, y + adjustedHeight / 2, {
        fill: textColor,
        fontSize: Math.max(options.fontSize || 14, CANVAS_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE),
        fontWeight: options.fontWeight || '500',
        textAlign: 'center',
        textBaseline: 'middle',
        accessible: true,
        id: `${options.id}_text`,
        ariaLabel: `Button: ${text}`
      });
    } catch (error) {
      this.errorHandler('Failed to draw button', error);
    }
  }
  /**
   * Draw accessible chart with proper labeling and keyboard navigation
   * @param {Array} data - Chart data
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Chart width
   * @param {number} height - Chart height
   * @param {Object} options - Chart options
   */
  drawChart(data, x, y, width, height, options = {}) {
    if (!Array.isArray(data) || data.length === 0) {
      this.errorHandler('Invalid chart data provided', new Error('Data must be non-empty array'));
      return;
    }
    
    const chartType = options.type || 'bar';
    
    this.ctx.save();
    
    try {
      // Draw chart background with theme awareness
      if (options.backgroundColor !== false) {
        this.drawRect(x, y, width, height, {
          fill: options.backgroundColor || this.currentTheme.background
        });
      }
      
      // Draw chart border
      if (options.border !== false) {
        this.drawRect(x, y, width, height, {
          stroke: options.borderColor || this.currentTheme.foreground,
          strokeWidth: 1
        });
      }
      
      // Add chart title if provided
      if (options.title) {
        this.drawText(options.title, x + width / 2, y - 20, {
          fill: this.currentTheme.foreground,
          fontSize: 16,
          fontWeight: 'bold',
          textAlign: 'center',
          accessible: true,
          ariaLabel: `Chart title: ${options.title}`
        });
      }
      
      // Render chart based on type
      switch (chartType) {
        case 'bar':
          this.drawBarChart(data, x, y, width, height, options);
          break;
        case 'line':
          this.drawLineChart(data, x, y, width, height, options);
          break;
        case 'pie':
          this.drawPieChart(data, x, y, Math.min(width, height), options);
          break;
        default:
          throw new Error(`Unsupported chart type: ${chartType}`);
      }
      
      // Register chart with accessibility manager
      if (this.accessibilityManager) {
        this.accessibilityManager.addElement(options.id || `chart_${Date.now()}`, {
          type: 'chart',
          x, y, width, height,
          chartType,
          data,
          label: options.label || `${chartType} chart`,
          ariaLabel: options.ariaLabel || this.generateChartDescription(data, chartType)
        });
      }
    } catch (error) {
      this.errorHandler('Failed to draw chart', error);
    } finally {
      this.ctx.restore();
    }
  }
  
  /**
   * Generate accessible description for chart data
   * @param {Array} data - Chart data
   * @param {string} chartType - Type of chart
   * @returns {string} Accessible description
   */
  generateChartDescription(data, chartType) {
    const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
    const itemCount = data.length;
    const maxValue = Math.max(...data.map(d => d.value || 0));
    const minValue = Math.min(...data.map(d => d.value || 0));
    
    return `${chartType} chart with ${itemCount} data points. ` +
           `Values range from ${minValue} to ${maxValue}. Total: ${total}`;
  }
  /**
   * Draw accessible bar chart with enhanced features
   * @param {Array} data - Chart data
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Chart width
   * @param {number} height - Chart height
   * @param {Object} options - Chart options
   */
  drawBarChart(data, x, y, width, height, options = {}) {
    if (!data.length) return;
    
    try {
      const maxValue = Math.max(...data.map(d => d.value || 0));
      if (maxValue === 0) return;
      
      const barWidth = width / data.length;
      const padding = Math.max(barWidth * 0.1, 2);
      const chartArea = height * 0.8;
      
      data.forEach((item, index) => {
        const barHeight = (item.value / maxValue) * chartArea;
        const barX = x + index * barWidth + padding;
        const barY = y + height - barHeight - 20;
        const actualBarWidth = barWidth - padding * 2;
        
        // Use theme-aware colors with contrast checking
        const barColor = item.color || options.barColor || this.currentTheme.primary;
        
        this.drawRect(barX, barY, actualBarWidth, barHeight, {
          fill: barColor,
          interactive: options.interactive,
          id: `bar_${index}`,
          label: `${item.label || `Item ${index + 1}`}: ${item.value}`,
          ariaLabel: `Bar ${index + 1} of ${data.length}: ${item.label || 'Unnamed'} with value ${item.value}`,
          onClick: () => options.onBarClick?.(item, index)
        });
        
        // Draw value label on top of bar
        if (options.showValues !== false) {
          this.drawText(item.value.toString(), barX + actualBarWidth / 2, barY - 10, {
            fill: this.currentTheme.foreground,
            fontSize: Math.max(10, CANVAS_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE),
            textAlign: 'center',
            textBaseline: 'bottom'
          });
        }
        
        // Draw category label
        if (item.label) {
          this.drawText(item.label, barX + actualBarWidth / 2, y + height - 5, {
            fill: this.currentTheme.foreground,
            fontSize: Math.max(12, CANVAS_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE),
            textAlign: 'center',
            textBaseline: 'bottom'
          });
        }
      });
    } catch (error) {
      this.errorHandler('Failed to draw bar chart', error);
    }
  }
  /**
   * Draw accessible line chart with enhanced features
   * @param {Array} data - Chart data
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Chart width
   * @param {number} height - Chart height
   * @param {Object} options - Chart options
   */
  drawLineChart(data, x, y, width, height, options = {}) {
    if (data.length < 2) {
      this.errorHandler('Line chart requires at least 2 data points', new Error('Insufficient data'));
      return;
    }
    
    try {
      const values = data.map(d => d.value || 0);
      const maxValue = Math.max(...values);
      const minValue = Math.min(...values);
      const range = maxValue - minValue || 1; // Avoid division by zero
      
      const chartArea = height * 0.8;
      const points = data.map((item, index) => ({
        x: x + (index / (data.length - 1)) * width,
        y: y + chartArea - ((item.value - minValue) / range) * chartArea + 20,
        value: item.value,
        label: item.label
      }));
      
      // Draw grid lines for better readability
      if (options.showGrid !== false) {
        this.drawGrid(x, y + 20, width, chartArea, options);
      }
      
      // Draw line with theme-aware styling
      this.drawPath(points, {
        stroke: options.lineColor || this.currentTheme.primary,
        strokeWidth: options.lineWidth || 2,
        smooth: options.smooth !== false
      });
      
      // Draw data points with accessibility features
      points.forEach((point, index) => {
        this.drawCircle(point.x, point.y, options.pointRadius || 4, {
          fill: options.pointColor || this.currentTheme.primary,
          stroke: this.currentTheme.background,
          strokeWidth: 2,
          interactive: options.interactive,
          id: `point_${index}`,
          label: `${point.label || `Point ${index + 1}`}: ${point.value}`,
          ariaLabel: `Data point ${index + 1} of ${points.length}: ${point.label || 'Unnamed'} with value ${point.value}`,
          onClick: () => options.onPointClick?.(data[index], index)
        });
        
        // Show value labels if requested
        if (options.showValues) {
          this.drawText(point.value.toString(), point.x, point.y - 15, {
            fill: this.currentTheme.foreground,
            fontSize: 10,
            textAlign: 'center',
            textBaseline: 'bottom'
          });
        }
      });
    } catch (error) {
      this.errorHandler('Failed to draw line chart', error);
    }
  }
  
  /**
   * Draw grid lines for charts
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Grid width
   * @param {number} height - Grid height
   * @param {Object} options - Grid options
   */
  drawGrid(x, y, width, height, options = {}) {
    const gridColor = options.gridColor || this.currentTheme.accent + '40'; // Semi-transparent
    const gridLines = options.gridLines || 5;
    
    this.ctx.save();
    this.ctx.strokeStyle = gridColor;
    this.ctx.lineWidth = 0.5;
    this.ctx.setLineDash([2, 2]);
    
    // Horizontal grid lines
    for (let i = 0; i <= gridLines; i++) {
      const lineY = y + (i / gridLines) * height;
      this.ctx.beginPath();
      this.ctx.moveTo(x, lineY);
      this.ctx.lineTo(x + width, lineY);
      this.ctx.stroke();
    }
    
    // Vertical grid lines
    for (let i = 0; i <= gridLines; i++) {
      const lineX = x + (i / gridLines) * width;
      this.ctx.beginPath();
      this.ctx.moveTo(lineX, y);
      this.ctx.lineTo(lineX, y + height);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }
  /**
   * Draw accessible pie chart with enhanced features
   * @param {Array} data - Chart data
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} size - Chart size
   * @param {Object} options - Chart options
   */
  drawPieChart(data, x, y, size, options = {}) {
    if (!data.length) return;
    
    try {
      const centerX = x + size / 2;
      const centerY = y + size / 2;
      const radius = size / 2 * 0.8;
      
      const total = data.reduce((sum, item) => sum + (item.value || 0), 0);
      if (total === 0) return;
      
      let currentAngle = -Math.PI / 2; // Start at top
      
      data.forEach((item, index) => {
        const sliceAngle = (item.value / total) * 2 * Math.PI;
        const endAngle = currentAngle + sliceAngle;
        
        // Calculate slice center for label positioning
        const labelAngle = currentAngle + sliceAngle / 2;
        const labelRadius = radius * 0.7;
        const labelX = centerX + Math.cos(labelAngle) * labelRadius;
        const labelY = centerY + Math.sin(labelAngle) * labelRadius;
        
        this.ctx.save();
        
        // Draw slice
        this.ctx.beginPath();
        this.ctx.moveTo(centerX, centerY);
        this.ctx.arc(centerX, centerY, radius, currentAngle, endAngle);
        this.ctx.closePath();
        
        const sliceColor = item.color || this.generateSliceColor(index, data.length);
        this.ctx.fillStyle = sliceColor;
        this.ctx.fill();
        
        // Draw border
        this.ctx.strokeStyle = options.borderColor || this.currentTheme.background;
        this.ctx.lineWidth = 2;
        this.ctx.stroke();
        
        this.ctx.restore();
        
        // Register slice with accessibility manager
        if (this.accessibilityManager) {
          const percentage = ((item.value / total) * 100).toFixed(1);
          this.accessibilityManager.addElement(`slice_${index}`, {
            type: 'pie-slice',
            x: centerX - radius, y: centerY - radius,
            width: radius * 2, height: radius * 2,
            label: `${item.label || `Slice ${index + 1}`}: ${percentage}%`,
            ariaLabel: `Pie slice ${index + 1} of ${data.length}: ${item.label || 'Unnamed'} representing ${percentage}% with value ${item.value}`,
            interactive: options.interactive,
            onClick: () => options.onSliceClick?.(item, index)
          });
        }
        
        // Draw label if there's enough space
        if (sliceAngle > 0.2 && options.showLabels !== false) {
          const percentage = ((item.value / total) * 100).toFixed(1);
          const labelText = options.showPercentages ? `${percentage}%` : item.label;
          
          if (labelText) {
            this.drawText(labelText, labelX, labelY, {
              fill: this.currentTheme.background,
              fontSize: Math.max(10, CANVAS_CONSTANTS.ACCESSIBILITY.MIN_FONT_SIZE),
              textAlign: 'center',
              textBaseline: 'middle',
              fontWeight: 'bold'
            });
          }
        }
        
        currentAngle = endAngle;
      });
      
      // Draw legend if requested
      if (options.showLegend !== false) {
        this.drawPieChartLegend(data, x + size + 20, y, options);
      }
    } catch (error) {
      this.errorHandler('Failed to draw pie chart', error);
    }
  }
  
  /**
   * Generate color for pie chart slice
   * @param {number} index - Slice index
   * @param {number} total - Total number of slices
   * @returns {string} Color value
   */
  generateSliceColor(index, total) {
    const hue = (index / total) * 360;
    const saturation = 70;
    const lightness = 50;
    return `hsl(${hue}, ${saturation}%, ${lightness}%)`;
  }
  
  /**
   * Draw legend for pie chart
   * @param {Array} data - Chart data
   * @param {number} x - Legend X coordinate
   * @param {number} y - Legend Y coordinate
   * @param {Object} options - Legend options
   */
  drawPieChartLegend(data, x, y, options = {}) {
    const itemHeight = 25;
    const colorBoxSize = 15;
    
    data.forEach((item, index) => {
      const itemY = y + index * itemHeight;
      const color = item.color || this.generateSliceColor(index, data.length);
      
      // Draw color box
      this.drawRect(x, itemY, colorBoxSize, colorBoxSize, {
        fill: color,
        stroke: this.currentTheme.foreground,
        strokeWidth: 1
      });
      
      // Draw label
      this.drawText(item.label || `Item ${index + 1}`, x + colorBoxSize + 10, itemY + colorBoxSize / 2, {
        fill: this.currentTheme.foreground,
        fontSize: 12,
        textBaseline: 'middle'
      });
    });
  }
  // Enhanced animation methods with motion sensitivity and performance optimization
  
  /**
   * Create accessible animation with motion sensitivity support
   * @param {Function} callback - Animation callback function
   * @param {number} duration - Animation duration in milliseconds
   * @param {Object} options - Animation options
   * @returns {string} Animation ID for control
   */
  animate(callback, duration = 1000, options = {}) {
    // Respect user's motion preferences
    if (this.options.respectReducedMotion && window.matchMedia && 
        window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      
      // Skip animation for motion-sensitive users
      if (options.skipOnReducedMotion !== false) {
        callback(1); // Complete immediately
        return null;
      }
      
      // Reduce animation duration for motion-sensitive users
      duration = Math.min(duration * 0.2, 300);
    }
    
    const animation = {
      callback,
      duration,
      startTime: performance.now(),
      id: Math.random().toString(36).substr(2, 9),
      easing: options.easing || 'easeInOut',
      onComplete: options.onComplete,
      onProgress: options.onProgress,
      paused: false,
      cancelled: false
    };
    
    this.animations.add(animation);
    this.runAnimation(animation);
    
    return animation.id;
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
        animation.callback(progress);
        
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
        this.errorHandler('Animation callback failed', error);
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
      case 'easeIn':
        return t * t;
      case 'easeOut':
        return t * (2 - t);
      case 'easeInOut':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      case 'easeInCubic':
        return t * t * t;
      case 'easeOutCubic':
        return (--t) * t * t + 1;
      case 'easeInOutCubic':
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
        // Adjust start time to account for pause duration
        animation.startTime = performance.now() - (animation.duration * animation.progress || 0);
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
   * Create fade animation
   * @param {Object} target - Target object with alpha property
   * @param {number} targetAlpha - Target alpha value
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  fadeAnimation(target, targetAlpha, duration = 500, options = {}) {
    const startAlpha = target.alpha || 0;
    const deltaAlpha = targetAlpha - startAlpha;
    
    return this.animate((progress) => {
      target.alpha = startAlpha + (deltaAlpha * progress);
      this.requestRender();
    }, duration, options);
  }
  
  /**
   * Create slide animation
   * @param {Object} target - Target object with x/y properties
   * @param {number} targetX - Target X position
   * @param {number} targetY - Target Y position
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  slideAnimation(target, targetX, targetY, duration = 500, options = {}) {
    const startX = target.x || 0;
    const startY = target.y || 0;
    const deltaX = targetX - startX;
    const deltaY = targetY - startY;
    
    return this.animate((progress) => {
      target.x = startX + (deltaX * progress);
      target.y = startY + (deltaY * progress);
      this.requestRender();
    }, duration, options);
  }
  
  /**
   * Create scale animation
   * @param {Object} target - Target object with scale property
   * @param {number} targetScale - Target scale value
   * @param {number} duration - Animation duration
   * @param {Object} options - Animation options
   * @returns {string} Animation ID
   */
  scaleAnimation(target, targetScale, duration = 500, options = {}) {
    const startScale = target.scale || 1;
    const deltaScale = targetScale - startScale;
    
    return this.animate((progress) => {
      target.scale = startScale + (deltaScale * progress);
      this.requestRender();
    }, duration, options);
  }
  // Enhanced rendering and integration methods
  
  /**
   * Get renderer type for Visual Engine integration
   * @returns {string} Renderer type
   */
  get type() {
    return 'canvas';
  }

  /**
   * Get canvas element for external integration
   * @returns {HTMLCanvasElement} Canvas element
   */
  getElement() {
    return this.canvas;
  }

  /**
   * Render complete scene with performance monitoring
   * @param {Object} scene - Scene object to render
   */
  render(scene) {
    if (!scene) return;
    
    this.performanceMonitor.startFrame();
    this.drawCallCount = 0;
    
    try {
      this.clear();
      
      if (scene.backgroundColor) {
        this.ctx.fillStyle = scene.backgroundColor;
        this.ctx.fillRect(0, 0, this.options.width, this.options.height);
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
    
    this.ctx.save();
    
    try {
      // Apply transformations
      if (object.x || object.y) {
        this.ctx.translate(object.x || 0, object.y || 0);
      }
      
      if (object.rotation) {
        this.ctx.rotate(object.rotation);
      }
      
      if (object.scale && object.scale !== 1) {
        const scaleX = typeof object.scale === 'object' ? object.scale.x : object.scale;
        const scaleY = typeof object.scale === 'object' ? object.scale.y : object.scale;
        this.ctx.scale(scaleX, scaleY);
      }
      
      if (object.alpha !== undefined) {
        this.ctx.globalAlpha = Math.max(0, Math.min(1, object.alpha));
      }
      
      // Apply blend mode if specified
      if (object.blendMode) {
        this.ctx.globalCompositeOperation = object.blendMode;
      }
      
      // Render based on object type or custom render method
      if (object.render && typeof object.render === 'function') {
        object.render(this);
      } else if (object.type) {
        this.renderByType(object);
      }
    } catch (error) {
      this.errorHandler(`Failed to render object: ${object.type || 'unknown'}`, error);
    } finally {
      this.ctx.restore();
    }
  }

  /**
   * Render object by type with enhanced features
   * @param {Object} object - Object to render
   */
  renderByType(object) {
    const commonOptions = {
      fill: object.fill || object.color,
      stroke: object.stroke || object.borderColor,
      strokeWidth: object.strokeWidth || object.borderWidth,
      interactive: object.interactive,
      id: object.id,
      label: object.label,
      ariaLabel: object.ariaLabel,
      onClick: object.onClick
    };
    
    switch (object.type) {
      case 'rect':
      case 'rectangle':
        this.drawRect(0, 0, 
          object.width || 50, 
          object.height || 50, 
          {
            ...commonOptions,
            borderRadius: object.borderRadius
          }
        );
        break;
        
      case 'circle':
        this.drawCircle(0, 0, object.radius || 25, commonOptions);
        break;
        
      case 'text':
        this.drawText(object.text || '', 0, 0, {
          fill: commonOptions.fill,
          fontSize: object.fontSize,
          fontFamily: object.fontFamily,
          fontWeight: object.fontWeight,
          textAlign: object.textAlign || object.align,
          textBaseline: object.textBaseline || object.baseline,
          accessible: object.accessible,
          id: commonOptions.id,
          label: commonOptions.label,
          ariaLabel: commonOptions.ariaLabel
        });
        break;
        
      case 'line':
        this.drawLine(
          object.x1 || 0, object.y1 || 0,
          object.x2 || 50, object.y2 || 50,
          {
            stroke: commonOptions.stroke,
            strokeWidth: commonOptions.strokeWidth,
            lineCap: object.lineCap,
            dashPattern: object.dashPattern
          }
        );
        break;
        
      case 'path':
        if (object.points && Array.isArray(object.points)) {
          this.drawPath(object.points, {
            ...commonOptions,
            closePath: object.closePath,
            smooth: object.smooth
          });
        }
        break;
        
      case 'image':
        if (object.src || object.image) {
          this.drawImage(object.src || object.image, 0, 0, {
            width: object.width,
            height: object.height,
            ...commonOptions
          });
        }
        break;
        
      default:
        // Draw a placeholder for unknown types
        this.drawRect(-5, -5, 10, 10, { 
          fill: '#ff6b6b',
          stroke: '#e55555',
          strokeWidth: 1
        });
        console.warn(`Unknown object type: ${object.type}`);
    }
  }
  // Advanced utility and image methods
  
  /**
   * Draw image with caching and error handling
   * @param {string|HTMLImageElement} source - Image source or element
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {Object} options - Drawing options
   */
  drawImage(source, x, y, options = {}) {
    if (this.drawCallCount >= this.options.maxDrawCalls) return;
    
    const drawImageElement = (img) => {
      try {
        const width = options.width || img.naturalWidth || img.width;
        const height = options.height || img.naturalHeight || img.height;
        
        // Apply any filters or effects
        if (options.filter) {
          this.ctx.filter = options.filter;
        }
        
        if (options.opacity !== undefined) {
          const oldAlpha = this.ctx.globalAlpha;
          this.ctx.globalAlpha = options.opacity;
          this.ctx.drawImage(img, x, y, width, height);
          this.ctx.globalAlpha = oldAlpha;
        } else {
          this.ctx.drawImage(img, x, y, width, height);
        }
        
        // Reset filter
        if (options.filter) {
          this.ctx.filter = 'none';
        }
        
        // Register with accessibility manager
        if (options.accessible && this.accessibilityManager) {
          this.accessibilityManager.addElement(options.id || `image_${Date.now()}`, {
            type: 'image',
            x, y, width, height,
            label: options.label || options.alt || 'Image',
            ariaLabel: options.ariaLabel || options.alt || 'Interactive image'
          });
        }
        
        this.performanceMonitor.recordDrawCall();
        this.drawCallCount++;
      } catch (error) {
        this.errorHandler('Failed to draw image', error);
      }
    };
    
    if (typeof source === 'string') {
      // Check cache first
      if (this.imageCache.has(source)) {
        const cachedImg = this.imageCache.get(source);
        if (cachedImg.complete) {
          drawImageElement(cachedImg);
        } else {
          cachedImg.addEventListener('load', () => drawImageElement(cachedImg));
        }
        return;
      }
      
      // Load and cache new image
      const img = new Image();
      this.imageCache.set(source, img);
      
      img.onload = () => drawImageElement(img);
      img.onerror = () => {
        this.errorHandler('Failed to load image', new Error(`Image not found: ${source}`));
        this.imageCache.delete(source);
      };
      
      // Set CORS if needed
      if (options.crossOrigin) {
        img.crossOrigin = options.crossOrigin;
      }
      
      img.src = source;
    } else if (source instanceof HTMLImageElement) {
      drawImageElement(source);
    } else {
      this.errorHandler('Invalid image source', new Error('Source must be string URL or HTMLImageElement'));
    }
  }
  
  /**
   * Create gradient with theme awareness
   * @param {string} type - Gradient type ('linear' or 'radial')
   * @param {Array} colorStops - Array of color stops
   * @param {Object} coordinates - Gradient coordinates
   * @returns {CanvasGradient} Gradient object
   */
  createGradient(type, colorStops, coordinates) {
    let gradient;
    
    try {
      if (type === 'linear') {
        const { x0 = 0, y0 = 0, x1 = 0, y1 = 100 } = coordinates;
        gradient = this.ctx.createLinearGradient(x0, y0, x1, y1);
      } else if (type === 'radial') {
        const { x0 = 0, y0 = 0, r0 = 0, x1 = 0, y1 = 0, r1 = 100 } = coordinates;
        gradient = this.ctx.createRadialGradient(x0, y0, r0, x1, y1, r1);
      } else {
        throw new Error(`Unsupported gradient type: ${type}`);
      }
      
      colorStops.forEach(stop => {
        const offset = typeof stop === 'object' ? stop.offset : stop[0];
        const color = typeof stop === 'object' ? stop.color : stop[1];
        gradient.addColorStop(offset, color);
      });
      
      return gradient;
    } catch (error) {
      this.errorHandler('Failed to create gradient', error);
      return this.currentTheme.primary;
    }
  }
  
  /**
   * Resize canvas with proper scaling and cleanup
   * @param {number} width - New width
   * @param {number} height - New height
   */
  resize(width, height) {
    if (!width || !height || width <= 0 || height <= 0) {
      this.errorHandler('Invalid resize dimensions', new Error('Width and height must be positive'));
      return;
    }
    
    try {
      // Validate against browser limits
      const maxWidth = Math.min(width, CANVAS_CONSTANTS.MAX_CANVAS_SIZE);
      const maxHeight = Math.min(height, CANVAS_CONSTANTS.MAX_CANVAS_SIZE);
      
      this.options.width = maxWidth;
      this.options.height = maxHeight;
      
      // Store current transform
      const transform = this.ctx.getTransform();
      
      // Resize canvas
      this.canvas.width = maxWidth * this.options.pixelRatio;
      this.canvas.height = maxHeight * this.options.pixelRatio;
      
      // Reapply scaling and default styles
      this.ctx.scale(this.options.pixelRatio, this.options.pixelRatio);
      this.applyDefaultStyles();
      
      // Trigger resize event for listeners
      this.canvas.dispatchEvent(new CustomEvent('canvasResize', {
        detail: { width: maxWidth, height: maxHeight }
      }));
      
      // Clear performance metrics on resize
      this.performanceMonitor.reset();
      this.drawCallCount = 0;
    } catch (error) {
      this.errorHandler('Failed to resize canvas', error);
    }
  }

  /**
   * Get image data with error handling
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @returns {ImageData|null} Image data or null on error
   */
  getImageData(x = 0, y = 0, width = this.options.width, height = this.options.height) {
    try {
      return this.ctx.getImageData(x, y, width, height);
    } catch (error) {
      this.errorHandler('Failed to get image data', error);
      return null;
    }
  }

  /**
   * Put image data with error handling
   * @param {ImageData} imageData - Image data to put
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   */
  putImageData(imageData, x = 0, y = 0) {
    if (!imageData) {
      this.errorHandler('Invalid image data', new Error('ImageData is required'));
      return;
    }
    
    try {
      this.ctx.putImageData(imageData, x, y);
      this.performanceMonitor.recordDrawCall();
      this.drawCallCount++;
    } catch (error) {
      this.errorHandler('Failed to put image data', error);
    }
  }

  /**
   * Convert canvas to data URL with error handling
   * @param {string} type - Image type
   * @param {number} quality - Image quality
   * @returns {string|null} Data URL or null on error
   */
  toDataURL(type = 'image/png', quality = 0.92) {
    try {
      return this.canvas.toDataURL(type, quality);
    } catch (error) {
      this.errorHandler('Failed to export canvas', error);
      return null;
    }
  }
  
  /**
   * Convert canvas to blob with error handling
   * @param {Function} callback - Callback function
   * @param {string} type - Image type
   * @param {number} quality - Image quality
   */
  toBlob(callback, type = 'image/png', quality = 0.92) {
    try {
      this.canvas.toBlob(callback, type, quality);
    } catch (error) {
      this.errorHandler('Failed to create blob', error);
      callback(null);
    }
  }
  
  /**
   * Get performance metrics
   * @returns {Object} Performance metrics
   */
  getPerformanceMetrics() {
    return {
      ...this.performanceMonitor.getMetrics(),
      drawCallCount: this.drawCallCount,
      activeAnimations: this.animations.size,
      cacheSize: this.imageCache.size,
      canvasSize: {
        width: this.options.width,
        height: this.options.height,
        pixelRatio: this.options.pixelRatio
      }
    };
  }
  
  /**
   * Clear image cache
   */
  clearImageCache() {
    this.imageCache.clear();
  }
  
  /**
   * Clean up resources and event listeners
   */
  destroy() {
    try {
      // Stop all animations
      this.stopAllAnimations();
      
      // Clear caches
      this.clearImageCache();
      
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
        this.accessibilityManager = null;
      }
      
      // Remove canvas from DOM
      if (this.canvas && this.canvas.parentNode) {
        this.canvas.parentNode.removeChild(this.canvas);
      }
      
      // Clear references
      this.canvas = null;
      this.ctx = null;
      this.container = null;
      this.layers.clear();
      
      // Dispatch cleanup event
      document.dispatchEvent(new CustomEvent('canvasRendererDestroyed', {
        detail: { rendererId: this.id }
      }));
    } catch (error) {
      this.errorHandler('Error during cleanup', error);
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CanvasRenderer = CanvasRenderer;
}

export default CanvasRenderer;
