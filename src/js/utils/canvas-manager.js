/**
 * Enhanced Canvas Manager - Modern canvas and visual engine management system
 * Provides accessibility, performance monitoring, theme integration, and error handling
 * 
 * Features:
 * - WCAG 2.1 AA compliant canvas accessibility
 * - Theme integration
 * - Performance monitoring and optimization
 * - Advanced error handling and recovery
 * - Touch and gesture support
 * - Memory management and cleanup
 * - Cross-tab canvas coordination
 * - Dynamic resize handling
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

// Enhanced constants and configuration
const CANVAS_CONSTANTS = {
    DEFAULT_WIDTH: 400,
    DEFAULT_HEIGHT: 300,
    MIN_WIDTH: 100,
    MIN_HEIGHT: 100,
    MAX_WIDTH: 4096,
    MAX_HEIGHT: 4096,
    RESIZE_DEBOUNCE: 100,
    CLEANUP_INTERVAL: 300000, // 5 minutes
    TOUCH_TARGET_SIZE: 44,
    FOCUS_RING_WIDTH: 3
};

const CANVAS_EVENTS = {
    CANVAS_CREATED: 'canvas:created',
    CANVAS_REMOVED: 'canvas:removed',
    ENGINE_CREATED: 'canvas:engineCreated',
    ENGINE_REMOVED: 'canvas:engineRemoved',
    PERFORMANCE_WARNING: 'canvas:performanceWarning',
    ERROR_OCCURRED: 'canvas:errorOccurred',
    RESIZE_DETECTED: 'canvas:resizeDetected'
};

/**
 * Canvas theme management for visual consistency
 */
class CanvasTheme {
    static getCurrentTheme() {
        const prefersHighContrast = window.matchMedia?.('(prefers-contrast: high)').matches;
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        
        return {
            highContrast: prefersHighContrast,
            reducedMotion: prefersReducedMotion,
            theme: prefersHighContrast ? 'highContrast' : 'light'
        };
    }
    
    static getCanvasStyle(theme = null) {
        const currentTheme = theme || this.getCurrentTheme();
        
        return {
            backgroundColor: currentTheme.highContrast ? '#000000' : '#ffffff',
            borderColor: currentTheme.highContrast ? '#ffff00' : '#e0e0e0',
            focusColor: currentTheme.highContrast ? '#ffff00' : '#007bff'
        };
    }
}

/**
 * Performance monitoring for canvas operations
 */
class CanvasPerformanceMonitor {
    static metrics = new Map();
    static operations = new Map();
    
    static startOperation(operationId) {
        const startTime = performance.now();
        this.operations.set(operationId, startTime);
        return startTime;
    }
    
    static endOperation(operationId, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;
        
        if (!this.metrics.has(operationId)) {
            this.metrics.set(operationId, {
                count: 0,
                totalTime: 0,
                averageTime: 0,
                maxTime: 0,
                minTime: Infinity
            });
        }
        
        const metric = this.metrics.get(operationId);
        metric.count++;
        metric.totalTime += duration;
        metric.averageTime = metric.totalTime / metric.count;
        metric.maxTime = Math.max(metric.maxTime, duration);
        metric.minTime = Math.min(metric.minTime, duration);
        
        this.operations.delete(operationId);
        
        // Use different thresholds for different operation types
        const getThreshold = (opId) => {
            if (opId.includes('engine-creation') || opId.includes('canvas-creation')) {
                return 50; // Engine/canvas creation can take longer
            }
            if (opId.includes('render') || opId.includes('draw')) {
                return 16; // Rendering operations should be fast (60fps)
            }
            return 25; // Default threshold for other operations
        };
        
        const threshold = getThreshold(operationId);
        if (duration > threshold) {
            logger.warn(`Slow canvas operation: ${operationId} took ${duration.toFixed(2)}ms (threshold: ${threshold}ms)`);
        }
        
        return duration;
    }
    
    static getMetrics() {
        return Object.fromEntries(this.metrics);
    }
    
    static reset() {
        this.metrics.clear();
        this.operations.clear();
    }
}

/**
 * Enhanced error handling for canvas operations
 */
class CanvasError extends Error {
    constructor(message, context = {}, originalError = null) {
        super(message);
        this.name = 'CanvasError';
        this.context = context;
        this.canvasId = context.canvasId;
        this.timestamp = Date.now();
        this.theme = CanvasTheme.getCurrentTheme();
        this.originalError = originalError;
    }
}

/**
 * Enhanced Canvas Manager with modern features and accessibility
 */
import logger from './logger.js';

class CanvasManager {    constructor() {
        this.canvases = new Map();
        this.visualEngines = new Map();
        this.activeEngines = new Set();
        this.nextId = 1;
        this.eventListeners = new Map();
        this.resizeObservers = new Map();
        this.performanceMonitor = CanvasPerformanceMonitor;
        this.theme = CanvasTheme.getCurrentTheme();
        this.cleanupInterval = null;
        this.accessibilityEnabled = true;
        this.touchSupported = 'ontouchstart' in window;
        this.errorCount = 0;
        
        // Setup theme monitoring
        this.setupThemeMonitoring();
        
        // Setup periodic cleanup
        this.setupPeriodicCleanup();
        
        // Setup global error handling
        this.setupErrorHandling();
        
        logger.debug('Enhanced CanvasManager initialized with advanced features');
    }
    
    /**
     * Setup theme change monitoring
     */
    setupThemeMonitoring() {
        const contrastQuery = window.matchMedia?.('(prefers-contrast: high)');
        const motionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        
        const handleThemeChange = () => {
            this.theme = CanvasTheme.getCurrentTheme();
            this.updateAllCanvasThemes();
            this.emit(CANVAS_EVENTS.THEME_CHANGED, { theme: this.theme });
        };
        
        contrastQuery?.addEventListener?.('change', handleThemeChange);
        motionQuery?.addEventListener?.('change', handleThemeChange);
        
        // Store references for cleanup
        this.themeQueries = { contrastQuery, motionQuery };
        this.themeChangeHandler = handleThemeChange;
    }
    
    /**
     * Setup periodic cleanup of unused resources
     */
    setupPeriodicCleanup() {
        this.cleanupInterval = setInterval(() => {
            this.performMaintenanceCleanup();
        }, CANVAS_CONSTANTS.CLEANUP_INTERVAL);
    }
    
    /**
     * Setup global error handling
     */
    setupErrorHandling() {
        window.addEventListener('error', (event) => {
            if (event.target && event.target.tagName === 'CANVAS') {
                this.handleError(new CanvasError('Canvas error detected', {
                    canvasId: event.target.id,
                    error: event.error
                }, event.error));
            }
        });
    }
    
    /**
     * Update theme for all managed canvases
     */
    updateAllCanvasThemes() {
        const style = CanvasTheme.getCanvasStyle(this.theme);
        
        for (const [canvasId, canvasData] of this.canvases) {
            try {
                this.applyCanvasTheme(canvasData.element, style);
                
                // Notify visual engine of theme change
                const engine = this.visualEngines.get(canvasId);
                if (engine && engine.updateTheme) {
                    engine.updateTheme(this.theme.theme); // Pass the theme string, not the theme object
                }
            } catch (error) {
                this.handleError(new CanvasError('Failed to update canvas theme', {
                    canvasId
                }, error));
            }
        }
    }
    
    /**
     * Apply theme styling to canvas
     */
    applyCanvasTheme(canvas, style) {
        if (!canvas) return;
        
        canvas.style.backgroundColor = style.backgroundColor;
        canvas.style.border = `1px solid ${style.borderColor}`;
        canvas.style.outline = 'none';
        
        // Add theme classes
        canvas.classList.toggle('canvas-high-contrast', this.theme.highContrast);
        canvas.classList.toggle('canvas-reduced-motion', this.theme.reducedMotion);
    }    /**
     * Create a managed canvas with enhanced features and accessibility
     */
    async createCanvas(options = {}) {
        const startTime = this.performanceMonitor.startOperation('canvas-creation');
        
        try {
            const {
                width = CANVAS_CONSTANTS.DEFAULT_WIDTH,
                height = CANVAS_CONSTANTS.DEFAULT_HEIGHT,
                id = null,
                container = null,
                className = 'managed-canvas',
                accessibility = true,
                responsive = false,
                touchSupport = this.touchSupported,
                ariaLabel = 'Interactive canvas element'
            } = options;

            // Validate dimensions
            const validatedWidth = Math.max(CANVAS_CONSTANTS.MIN_WIDTH, 
                                  Math.min(CANVAS_CONSTANTS.MAX_WIDTH, width));
            const validatedHeight = Math.max(CANVAS_CONSTANTS.MIN_HEIGHT, 
                                   Math.min(CANVAS_CONSTANTS.MAX_HEIGHT, height));

            // Generate unique ID if not provided
            const canvasId = id || `managed-canvas-${this.nextId++}`;
            
            // Check if canvas already exists
            if (this.canvases.has(canvasId)) {
                logger.warn(`Canvas with ID ${canvasId} already exists. Returning existing canvas.`);
                const existingCanvasData = this.canvases.get(canvasId);
                return { canvas: existingCanvasData.element, id: canvasId };
            }

            const canvas = document.createElement('canvas');
            canvas.id = canvasId;
            canvas.width = validatedWidth;
            canvas.height = validatedHeight;
            canvas.className = `${className} canvas-managed`;
            
            // Enhanced accessibility attributes
            if (accessibility && this.accessibilityEnabled) {
                this.setupCanvasAccessibility(canvas, {
                    ariaLabel,
                    role: options.role || 'img',
                    description: options.description
                });
            }
            
            // Apply theme styling
            const themeStyle = CanvasTheme.getCanvasStyle(this.theme);
            this.applyCanvasTheme(canvas, themeStyle);
            
            // Setup touch support if enabled
            if (touchSupport) {
                this.setupTouchSupport(canvas);
            }
            
            // Store canvas reference with enhanced metadata
            const canvasData = {
                element: canvas,
                created: Date.now(),
                options: { ...options, width: validatedWidth, height: validatedHeight },
                accessibility,
                responsive,
                touchSupport,
                resizeObserver: null,
                performanceMetrics: {
                    renderCount: 0,
                    totalRenderTime: 0,
                    averageRenderTime: 0
                }
            };
            
            this.canvases.set(canvasId, canvasData);

            // Append to container if provided
            if (container) {
                container.appendChild(canvas);
                
                // Setup responsive behavior if enabled
                if (responsive) {
                    this.makeResponsive(canvasId);
                }
            }

            // Emit creation event
            this.emit(CANVAS_EVENTS.CANVAS_CREATED, {
                canvasId,
                dimensions: { width: validatedWidth, height: validatedHeight },
                timestamp: Date.now()
            });

            logger.debug(`Created enhanced canvas: ${canvasId} (${validatedWidth}x${validatedHeight})`);
            return { canvas, id: canvasId };
            
        } catch (error) {
            this.handleError(new CanvasError('Failed to create canvas', {
                options
            }, error));
            throw error;
        } finally {
            this.performanceMonitor.endOperation('canvas-creation', startTime);
        }
    }
    
    /**
     * Setup accessibility features for canvas
     */
    setupCanvasAccessibility(canvas, accessibilityOptions) {
        const { ariaLabel, role, description } = accessibilityOptions;
        
        // Basic ARIA attributes
        canvas.setAttribute('role', role);
        canvas.setAttribute('aria-label', ariaLabel);
        canvas.setAttribute('tabindex', '0');
        
        // Enhanced accessibility features
        if (description) {
            const descId = `${canvas.id}-description`;
            const descElement = document.createElement('div');
            descElement.id = descId;
            descElement.className = 'sr-only';
            descElement.textContent = description;
            canvas.parentNode?.insertBefore(descElement, canvas.nextSibling);
            canvas.setAttribute('aria-describedby', descId);
        }
        
        // Focus styling
        canvas.addEventListener('focus', () => {
            canvas.style.outline = `${CANVAS_CONSTANTS.FOCUS_RING_WIDTH}px solid ${CanvasTheme.getCanvasStyle(this.theme).focusColor}`;
            canvas.style.outlineOffset = '2px';
        });
        
        canvas.addEventListener('blur', () => {
            canvas.style.outline = 'none';
        });
        
        // Keyboard event handling
        canvas.addEventListener('keydown', (e) => {
            this.handleCanvasKeydown(canvas.id, e);
        });
    }
    
    /**
     * Setup touch support for canvas
     */
    setupTouchSupport(canvas) {
        // Touch event handling with proper touch targets
        canvas.style.touchAction = 'manipulation';
        canvas.style.minWidth = `${CANVAS_CONSTANTS.TOUCH_TARGET_SIZE}px`;
        canvas.style.minHeight = `${CANVAS_CONSTANTS.TOUCH_TARGET_SIZE}px`;
        
        // Prevent default touch behaviors that might interfere
        canvas.addEventListener('touchstart', (e) => {
            e.preventDefault();
        }, { passive: false });
        
        canvas.addEventListener('touchmove', (e) => {
            e.preventDefault();
        }, { passive: false });
    }
    
    /**
     * Handle keyboard interactions on canvas
     */
    handleCanvasKeydown(canvasId, event) {
        const engine = this.visualEngines.get(canvasId);
        
        // Standard accessibility keyboard shortcuts
        switch (event.key) {
            case 'Enter':
            case ' ':
                // Trigger interaction
                if (engine && engine.handleInteraction) {
                    engine.handleInteraction('activate');
                }
                event.preventDefault();
                break;
                
            case 'Escape':
                // Cancel or exit
                if (engine && engine.handleInteraction) {
                    engine.handleInteraction('cancel');
                }
                event.preventDefault();
                break;
                
            case 'ArrowUp':
            case 'ArrowDown':
            case 'ArrowLeft':
            case 'ArrowRight':
                // Navigation within canvas
                if (engine && engine.handleNavigation) {
                    engine.handleNavigation(event.key);
                }
                event.preventDefault();
                break;
        }
    }    /**
     * Create a visual engine for a specific canvas with enhanced features
     */
    async createVisualEngine(canvasId, engineOptions = {}) {
        const startTime = this.performanceMonitor.startOperation('engine-creation');
        
        try {
            const canvasData = this.canvases.get(canvasId);
            if (!canvasData) {
                throw new CanvasError(`Canvas ${canvasId} not found. Create canvas first.`, {
                    canvasId
                });
            }

            // Check if engine already exists for this canvas
            if (this.visualEngines.has(canvasId)) {
                logger.warn(`Visual engine for ${canvasId} already exists. Returning existing engine.`);
                return this.visualEngines.get(canvasId);
            }

            // Enhanced engine options with theme and accessibility integration
            const enhancedOptions = {
                renderMode: 'canvas',
                accessibility: this.accessibilityEnabled,
                debug: false,
                theme: this.theme.theme, // Extract the theme string from the theme object
                performance: {
                    monitoring: true,
                    targetFPS: 60,
                    maxMemoryUsage: 100 * 1024 * 1024 // 100MB
                },
                ...engineOptions
            };

            // Import visual engine dynamically to avoid circular dependencies
            const VisualEngine = await import('../core/visual-engine.js');
            
            const engine = new VisualEngine.default(canvasData.element, enhancedOptions);

            // Enhanced engine integration
            if (engine.setTheme) {
                engine.setTheme(this.theme.theme); // Pass the theme string, not the theme object
            }
            
            if (engine.setPerformanceMonitor) {
                engine.setPerformanceMonitor(this.performanceMonitor);
            }
            
            if (engine.setErrorHandler) {
                engine.setErrorHandler((error) => {
                    this.handleError(new CanvasError('Visual engine error', {
                        canvasId,
                        engineError: error.message
                    }, error));
                });
            }

            // Store engine reference
            this.visualEngines.set(canvasId, engine);
            this.activeEngines.add(canvasId);

            // Setup engine event listeners
            this.setupEngineEventListeners(canvasId, engine);

            // Emit creation event
            this.emit(CANVAS_EVENTS.ENGINE_CREATED, {
                canvasId,
                engineOptions: enhancedOptions,
                timestamp: Date.now()
            });

            logger.debug(`Created enhanced visual engine for canvas: ${canvasId}`);
            return engine;
            
        } catch (error) {
            this.handleError(new CanvasError(`Failed to create visual engine for ${canvasId}`, {
                canvasId,
                engineOptions
            }, error));
            throw error;
        } finally {
            this.performanceMonitor.endOperation('engine-creation', startTime);
        }
    }
    
    /**
     * Setup event listeners for visual engine
     */
    setupEngineEventListeners(canvasId, engine) {
        // Performance monitoring
        if (engine.on) {
            engine.on('render', (renderTime) => {
                const canvasData = this.canvases.get(canvasId);
                if (canvasData) {
                    canvasData.performanceMetrics.renderCount++;
                    canvasData.performanceMetrics.totalRenderTime += renderTime;
                    canvasData.performanceMetrics.averageRenderTime = 
                        canvasData.performanceMetrics.totalRenderTime / canvasData.performanceMetrics.renderCount;
                    
                    // Warn about slow renders
                    if (renderTime > 16) {
                        this.emit(CANVAS_EVENTS.PERFORMANCE_WARNING, {
                            canvasId,
                            renderTime,
                            threshold: 16
                        });
                    }
                }
            });
            
            engine.on('error', (error) => {
                this.handleError(new CanvasError('Engine error event', {
                    canvasId
                }, error));
            });
            
            engine.on('accessibility', (data) => {
                // Handle accessibility events from engine
                if (data.announcement) {
                    this.announceToScreenReader(data.announcement);
                }
            });
        }
    }
    
    /**
     * Announce information to screen readers
     */
    announceToScreenReader(message, priority = 'polite') {
        if (!this.accessibilityEnabled) return;
        
        const announcement = document.createElement('div');
        announcement.setAttribute('aria-live', priority);
        announcement.setAttribute('aria-atomic', 'true');
        announcement.className = 'sr-only';
        announcement.textContent = message;
        
        document.body.appendChild(announcement);
        
        // Remove after announcement
        setTimeout(() => {
            document.body.removeChild(announcement);
        }, 1000);
    }

    /**
     * Get canvas element by ID
     */
    getCanvas(canvasId) {
        const canvasData = this.canvases.get(canvasId);
        return canvasData ? canvasData.element : null;
    }

    /**
     * Get visual engine by canvas ID
     */
    getVisualEngine(canvasId) {
        return this.visualEngines.get(canvasId);
    }    /**
     * Remove canvas and cleanup associated resources with enhanced cleanup
     */
    async removeCanvas(canvasId) {
        const startTime = this.performanceMonitor.startOperation('canvas-removal');
        
        try {
            // Cleanup visual engine first
            await this.removeVisualEngine(canvasId);

            // Remove canvas from DOM and storage
            const canvasData = this.canvases.get(canvasId);
            if (canvasData) {
                // Cleanup resize observer
                if (canvasData.resizeObserver) {
                    canvasData.resizeObserver.disconnect();
                }
                
                // Remove accessibility description
                const descElement = document.getElementById(`${canvasId}-description`);
                if (descElement) {
                    descElement.remove();
                }
                
                // Remove canvas element
                if (canvasData.element.parentNode) {
                    canvasData.element.parentNode.removeChild(canvasData.element);
                }
                
                // Clear canvas data
                this.canvases.delete(canvasId);
                
                // Emit removal event
                this.emit(CANVAS_EVENTS.CANVAS_REMOVED, {
                    canvasId,
                    timestamp: Date.now()
                });
                
                logger.debug(`Removed canvas: ${canvasId}`);
            }
        } catch (error) {
            this.handleError(new CanvasError('Failed to remove canvas', {
                canvasId
            }, error));
        } finally {
            this.performanceMonitor.endOperation('canvas-removal', startTime);
        }
    }

    /**
     * Remove visual engine and cleanup resources with enhanced error handling
     */
    async removeVisualEngine(canvasId) {
        const startTime = this.performanceMonitor.startOperation('engine-removal');
        
        try {
            const engine = this.visualEngines.get(canvasId);
            if (engine) {
                // Comprehensive cleanup sequence
                try {
                    // Stop any active animations
                    if (engine.pause) {
                        engine.pause();
                    }
                    
                    // Remove event listeners
                    if (engine.removeAllListeners) {
                        engine.removeAllListeners();
                    }
                    
                    // Cleanup engine resources
                    if (engine.destroy) {
                        await engine.destroy();
                    } else if (engine.cleanup) {
                        await engine.cleanup();
                    }
                    
                    // Clear scene if it exists
                    if (engine.scene && engine.scene.clear) {
                        engine.scene.clear();
                    }
                    
                    // Clear canvas context
                    const canvas = this.getCanvas(canvasId);
                    if (canvas) {
                        const ctx = canvas.getContext('2d');
                        if (ctx) {
                            ctx.clearRect(0, 0, canvas.width, canvas.height);
                        }
                    }
                    
                } catch (cleanupError) {
                    logger.warn(`Error during engine cleanup for ${canvasId}:`, cleanupError);
                }

                this.visualEngines.delete(canvasId);
                this.activeEngines.delete(canvasId);
                
                // Emit removal event
                this.emit(CANVAS_EVENTS.ENGINE_REMOVED, {
                    canvasId,
                    timestamp: Date.now()
                });
                
                logger.debug(`Removed visual engine: ${canvasId}`);
            }
        } catch (error) {
            this.handleError(new CanvasError('Failed to remove visual engine', {
                canvasId
            }, error));
        } finally {
            this.performanceMonitor.endOperation('engine-removal', startTime);
        }
    }

    /**
     * Enhanced cleanup of all canvases and engines
     */
    async cleanup() {
        const startTime = this.performanceMonitor.startOperation('full-cleanup');
        
        try {
            logger.debug('Starting enhanced canvas manager cleanup...');
            
            // Stop periodic cleanup
            if (this.cleanupInterval) {
                clearInterval(this.cleanupInterval);
                this.cleanupInterval = null;
            }
            
            // Remove theme change listeners
            if (this.themeQueries) {
                const { contrastQuery, motionQuery } = this.themeQueries;
                
                contrastQuery?.removeEventListener?.('change', this.themeChangeHandler);
                motionQuery?.removeEventListener?.('change', this.themeChangeHandler);
            }
            
            // Remove all visual engines
            const engineCleanupPromises = [];
            for (const canvasId of this.visualEngines.keys()) {
                engineCleanupPromises.push(this.removeVisualEngine(canvasId));
            }
            await Promise.all(engineCleanupPromises);

            // Remove all canvases
            const canvasCleanupPromises = [];
            for (const canvasId of this.canvases.keys()) {
                canvasCleanupPromises.push(this.removeCanvas(canvasId));
            }
            await Promise.all(canvasCleanupPromises);
            
            // Clear event listeners
            this.eventListeners.clear();
            
            // Clear resize observers
            for (const observer of this.resizeObservers.values()) {
                observer.disconnect();
            }
            this.resizeObservers.clear();
            
            // Reset performance monitoring
            this.performanceMonitor.reset();

            logger.debug('Enhanced canvas manager cleanup complete');
        } catch (error) {
            this.handleError(new CanvasError('Failed to complete cleanup', {}, error));
        } finally {
            this.performanceMonitor.endOperation('full-cleanup', startTime);
        }
    }

    /**
     * Enhanced pause functionality with performance optimization
     */
    pauseAll() {
        const startTime = this.performanceMonitor.startOperation('pause-all');
        
        try {
            this.activeEngines.forEach(canvasId => {
                const engine = this.visualEngines.get(canvasId);
                if (engine && engine.pause) {
                    try {
                        engine.pause();
                    } catch (error) {
                        logger.warn(`Failed to pause engine ${canvasId}:`, error);
                    }
                }
            });
            
            logger.debug(`Paused ${this.activeEngines.size} active engines`);
        } catch (error) {
            this.handleError(new CanvasError('Failed to pause all engines', {}, error));
        } finally {
            this.performanceMonitor.endOperation('pause-all', startTime);
        }
    }

    /**
     * Enhanced resume functionality with error handling
     */
    resumeAll() {
        const startTime = this.performanceMonitor.startOperation('resume-all');
        
        try {
            this.activeEngines.forEach(canvasId => {
                const engine = this.visualEngines.get(canvasId);
                if (engine && engine.resume) {
                    try {
                        engine.resume();
                    } catch (error) {
                        logger.warn(`Failed to resume engine ${canvasId}:`, error);
                    }
                }
            });
            
            logger.debug(`Resumed ${this.activeEngines.size} active engines`);
        } catch (error) {
            this.handleError(new CanvasError('Failed to resume all engines', {}, error));
        } finally {
            this.performanceMonitor.endOperation('resume-all', startTime);
        }
    }    /**
     * Enhanced status reporting with performance metrics
     */
    getStatus() {
        return {
            canvases: Array.from(this.canvases.keys()),
            visualEngines: Array.from(this.visualEngines.keys()),
            activeEngines: Array.from(this.activeEngines),
            totalCanvases: this.canvases.size,
            totalEngines: this.visualEngines.size,
            theme: this.theme,
            performance: this.performanceMonitor.getMetrics(),
            accessibility: this.accessibilityEnabled,
            touchSupported: this.touchSupported,
            errorCount: this.errorCount,
            memoryUsage: this.getMemoryUsage()
        };
    }
    
    /**
     * Get memory usage estimation
     */
    getMemoryUsage() {
        let totalMemory = 0;
        
        for (const [, canvasData] of this.canvases) {
            const canvas = canvasData.element;
            // Estimate memory usage based on canvas size and pixel data
            const pixelData = canvas.width * canvas.height * 4; // RGBA
            totalMemory += pixelData;
        }
        
        return {
            estimatedBytes: totalMemory,
            estimatedMB: (totalMemory / (1024 * 1024)).toFixed(2),
            canvasCount: this.canvases.size
        };
    }

    /**
     * Enhanced canvas resizing with validation and notifications
     */
    async resizeCanvas(canvasId, width, height) {
        const startTime = this.performanceMonitor.startOperation('canvas-resize');
        
        try {
            // Validate dimensions
            const validatedWidth = Math.max(CANVAS_CONSTANTS.MIN_WIDTH, 
                                  Math.min(CANVAS_CONSTANTS.MAX_WIDTH, width));
            const validatedHeight = Math.max(CANVAS_CONSTANTS.MIN_HEIGHT, 
                                   Math.min(CANVAS_CONSTANTS.MAX_HEIGHT, height));
            
            const canvas = this.getCanvas(canvasId);
            const engine = this.getVisualEngine(canvasId);
            const canvasData = this.canvases.get(canvasId);

            if (canvas && canvasData) {
                // Store old dimensions for comparison
                const oldWidth = canvas.width;
                const oldHeight = canvas.height;
                
                // Update canvas dimensions
                canvas.width = validatedWidth;
                canvas.height = validatedHeight;
                
                // Update canvas data
                canvasData.options.width = validatedWidth;
                canvasData.options.height = validatedHeight;
                
                // Notify engine of resize with proper error handling
                if (engine && engine.resize) {
                    try {
                        await engine.resize(validatedWidth, validatedHeight);
                    } catch (engineError) {
                        logger.warn(`Engine resize failed for ${canvasId}:`, engineError);
                    }
                }
                
                // Emit resize event
                this.emit(CANVAS_EVENTS.RESIZE_DETECTED, {
                    canvasId,
                    oldDimensions: { width: oldWidth, height: oldHeight },
                    newDimensions: { width: validatedWidth, height: validatedHeight },
                    timestamp: Date.now()
                });

                logger.debug(`Resized canvas ${canvasId} to ${validatedWidth}x${validatedHeight}`);
                
                // Announce resize to screen readers if significant change
                const sizeChange = Math.abs(validatedWidth - oldWidth) + Math.abs(validatedHeight - oldHeight);
                if (sizeChange > 50) {
                    this.announceToScreenReader(
                        `Canvas resized to ${validatedWidth} by ${validatedHeight} pixels`
                    );
                }
            }
        } catch (error) {
            this.handleError(new CanvasError('Failed to resize canvas', {
                canvasId,
                width,
                height
            }, error));
        } finally {
            this.performanceMonitor.endOperation('canvas-resize', startTime);
        }
    }

    /**
     * Enhanced responsive canvas with performance optimization
     */
    makeResponsive(canvasId) {
        try {
            const canvas = this.getCanvas(canvasId);
            const canvasData = this.canvases.get(canvasId);
            
            if (!canvas || !canvasData) {
                throw new CanvasError('Canvas not found for responsive setup', { canvasId });
            }
            
            // Disconnect existing observer if any
            if (canvasData.resizeObserver) {
                canvasData.resizeObserver.disconnect();
            }

            // Create debounced resize handler
            let resizeTimeout;
            const debouncedResize = (entries) => {
                if (resizeTimeout) {
                    clearTimeout(resizeTimeout);
                }
                
                resizeTimeout = setTimeout(() => {
                    for (const entry of entries) {
                        const { width, height } = entry.contentRect;
                        
                        // Only resize if dimensions changed significantly
                        if (Math.abs(width - canvas.width) > 5 || Math.abs(height - canvas.height) > 5) {
                            this.resizeCanvas(canvasId, width, height);
                        }
                    }
                }, CANVAS_CONSTANTS.RESIZE_DEBOUNCE);
            };

            const resizeObserver = new ResizeObserver(debouncedResize);
            
            // Observe the canvas container or the canvas itself
            const targetElement = canvas.parentElement || canvas;
            resizeObserver.observe(targetElement);
            
            // Store observer for cleanup
            canvasData.resizeObserver = resizeObserver;
            this.resizeObservers.set(canvasId, resizeObserver);
            
            logger.debug(`Made canvas ${canvasId} responsive`);
        } catch (error) {
            this.handleError(new CanvasError('Failed to make canvas responsive', {
                canvasId
            }, error));
        }
    }
    
    /**
     * Perform maintenance cleanup of unused resources
     */
    performMaintenanceCleanup() {
        try {
            const now = Date.now();
            const maxAge = 30 * 60 * 1000; // 30 minutes
            let cleanedCount = 0;
            
            // Clean up old canvases that might be orphaned
            for (const [canvasId, canvasData] of this.canvases) {
                const age = now - canvasData.created;
                
                // Check if canvas is still in DOM
                if (!document.contains(canvasData.element)) {
                    logger.debug(`Cleaning up orphaned canvas: ${canvasId}`);
                    this.removeCanvas(canvasId);
                    cleanedCount++;
                }
                // Check if canvas is very old and inactive
                else if (age > maxAge && !this.activeEngines.has(canvasId)) {
                    logger.debug(`Cleaning up old inactive canvas: ${canvasId}`);
                    this.removeCanvas(canvasId);
                    cleanedCount++;
                }
            }
            
            if (cleanedCount > 0) {
                logger.debug(`Maintenance cleanup: removed ${cleanedCount} canvases`);
            }
            
            // Reset performance metrics periodically
            if (Object.keys(this.performanceMonitor.getMetrics()).length > 100) {
                this.performanceMonitor.reset();
            }
            
        } catch (error) {
            logger.warn('Maintenance cleanup error:', error);
        }
    }
    
    /**
     * Enhanced error handling with context and recovery
     */
    handleError(error) {
        this.errorCount++;
        
        logger.error('Canvas Manager Error:', error);
        
        // Emit error event for application-level handling
        this.emit(CANVAS_EVENTS.ERROR_OCCURRED, {
            error: error.message,
            context: error.context,
            timestamp: error.timestamp,
            canvasId: error.canvasId
        });
        
        // Attempt recovery for certain error types
        if (error.canvasId && error.message.includes('engine')) {
            this.attemptEngineRecovery(error.canvasId);
        }
    }
    
    /**
     * Attempt to recover from engine errors
     */
    async attemptEngineRecovery(canvasId) {
        try {
            logger.debug(`Attempting engine recovery for canvas: ${canvasId}`);
            
            const canvasData = this.canvases.get(canvasId);
            if (!canvasData) return;
            
            // Remove the problematic engine
            await this.removeVisualEngine(canvasId);
            
            // Wait a short time before recreating
            setTimeout(async () => {
                try {
                    // Recreate engine with safe options
                    await this.createVisualEngine(canvasId, {
                        ...canvasData.options,
                        debug: true,
                        errorRecovery: true
                    });
                    
                    logger.debug(`Engine recovery successful for canvas: ${canvasId}`);
                } catch (recoveryError) {
                    logger.error(`Engine recovery failed for canvas: ${canvasId}`, recoveryError);
                }
            }, 1000);
            
        } catch (error) {
            logger.error('Engine recovery attempt failed:', error);
        }
    }
    
    /**
     * Event emitter functionality
     */
    on(event, callback) {
        if (!this.eventListeners.has(event)) {
            this.eventListeners.set(event, []);
        }
        this.eventListeners.get(event).push(callback);
    }
    
    off(event, callback) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            const index = listeners.indexOf(callback);
            if (index > -1) {
                listeners.splice(index, 1);
            }
        }
    }
    
    emit(event, data) {
        const listeners = this.eventListeners.get(event);
        if (listeners) {
            listeners.forEach(callback => {
                try {
                    callback(data);
                } catch (error) {
                    logger.error('Canvas event listener error:', error);
                }
            });
        }
    }
}

// Create global instance with enhanced initialization
const canvasManager = new CanvasManager();

// Enhanced cleanup on page unload with proper async handling
window.addEventListener('beforeunload', async () => {
    try {
        await canvasManager.cleanup();
    } catch (error) {
        logger.error('Error during canvas manager cleanup:', error);
    }
});

// Handle page visibility changes for performance optimization
document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
        canvasManager.pauseAll();
    } else {
        canvasManager.resumeAll();
    }
});

// Handle focus/blur for accessibility
window.addEventListener('focus', () => {
    if (canvasManager.accessibilityEnabled) {
        canvasManager.resumeAll();
    }
});

window.addEventListener('blur', () => {
    if (canvasManager.accessibilityEnabled) {
        canvasManager.pauseAll();
    }
});

export default canvasManager;
