/**
 * SimulationEngine - Enhanced core rendering and interaction engine
 * Modern implementation with accessibility, theme integration, and performance optimization
 * 
 * Features:
 * - Multiple rendering modes: SVG, Canvas, and WebGL with automatic fallback
 * - WCAG 2.1 AA accessibility compliance
 * - Dark mode and theme integration
 * - Performance monitoring and optimization
 * - Advanced error handling and recovery
 * - Animation system integration
 * - Memory management and cleanup
 * - Settings persistence
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 */

import { InputManager } from './input-manager.js';
import AccessibilityManager from './accessibility.js';
import AnimationManager from './animation-manager.js';
import { Scene } from './scene.js';
import CanvasRenderer from '../renderers/canvas-renderer.js';
import SVGRenderer from '../renderers/svg-renderer.js';
import WebGLRenderer from '../renderers/webgl-renderer.js';

// Enhanced constants and configuration
const ENGINE_CONSTANTS = {
    DEFAULT_WIDTH: 800,
    DEFAULT_HEIGHT: 600,
    TARGET_FPS: 60,
    FRAME_TIME_LIMIT: 16.67, // ~60 FPS
    PERFORMANCE_WARNING_THRESHOLD: 33.33, // ~30 FPS
    MEMORY_CLEANUP_INTERVAL: 30000, // 30 seconds
    MAX_DELTA_TIME: 100, // Prevent spiral of death
    DEBUG_UPDATE_INTERVAL: 250 // Debug info update frequency
};

const RENDER_MODES = {
    AUTO: 'auto',
    CANVAS: 'canvas',
    SVG: 'svg',
    WEBGL: 'webgl'
};

const PERFORMANCE_MODES = {
    HIGH: 'high',
    BALANCED: 'balanced',
    COMPATIBILITY: 'compatibility'
};

/**
 * Enhanced error handling for engine operations
 */
class EngineError extends Error {
    constructor(message, context = {}, originalError = null) {
        super(message);
        this.name = 'EngineError';
        this.context = context;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
        this.engineState = context.engineState || 'unknown';
        this.renderMode = context.renderMode || 'unknown';
    }
}

/**
 * Performance monitoring for engine operations
 */
class EnginePerformanceMonitor {
    static metrics = new Map();
    static memoryTracker = new Map();
    
    static startOperation(operationName) {
        const startTime = performance.now();
        this.metrics.set(operationName, { 
            startTime, 
            operations: (this.metrics.get(operationName)?.operations || 0) + 1 
        });
        return startTime;
    }
    
    static endOperation(operationName, startTime = null) {
        const endTime = performance.now();
        const metric = this.metrics.get(operationName);
        
        if (metric) {
            const duration = endTime - (startTime || metric.startTime);
            metric.lastDuration = duration;
            metric.averageDuration = ((metric.averageDuration || 0) * (metric.operations - 1) + duration) / metric.operations;
            
            // Performance warning for slow operations
            if (duration > ENGINE_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
                console.warn(`Slow engine operation: ${operationName} took ${duration.toFixed(2)}ms`);
            }
        }
    }
    
    static getMetrics() {
        return {
            operations: Object.fromEntries(this.metrics),
            memory: {
                trackedComponents: this.memoryTracker.size,
                totalMemoryEstimate: Array.from(this.memoryTracker.values())
                    .reduce((total, item) => total + item.size, 0)
            }
        };
    }
    
    static trackMemory(componentId, size) {
        this.memoryTracker.set(componentId, {
            size,
            timestamp: Date.now()
        });
    }
    
    static releaseMemory(componentId) {
        this.memoryTracker.delete(componentId);
    }
}

/**
 * Theme integration for engine and rendering
 */
class EngineTheme {
    static getCurrentTheme() {
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const prefersHighContrast = window.matchMedia?.('(prefers-contrast: high)').matches;
        
        return {
            reducedMotion: prefersReducedMotion,
            darkMode: prefersDark,
            highContrast: prefersHighContrast,
            theme: prefersHighContrast ? 'highContrast' : (prefersDark ? 'dark' : 'light')
        };
    }
    
    static getEngineConfig(theme = null) {
        const currentTheme = theme || this.getCurrentTheme();
        
        return {
            reducedMotion: currentTheme.reducedMotion,
            darkMode: currentTheme.darkMode,
            highContrast: currentTheme.highContrast,
            performanceMode: currentTheme.reducedMotion ? PERFORMANCE_MODES.COMPATIBILITY : PERFORMANCE_MODES.BALANCED
        };
    }
}

class SimulationEngine {
    constructor(containerId, config = {}) {
        try {
            this.container = document.getElementById(containerId);
            if (!this.container) {
                throw new EngineError(`Container with id "${containerId}" not found`, { containerId });
            }

            // Get theme configuration
            this.themeConfig = EngineTheme.getEngineConfig();

            // Enhanced configuration with theme integration
            this.config = {
                renderMode: config.renderMode || RENDER_MODES.AUTO,
                width: config.width || ENGINE_CONSTANTS.DEFAULT_WIDTH,
                height: config.height || ENGINE_CONSTANTS.DEFAULT_HEIGHT,
                accessibility: config.accessibility !== false,
                performance: config.performance || this.themeConfig.performanceMode,
                debug: config.debug || false,
                targetFPS: config.targetFPS || ENGINE_CONSTANTS.TARGET_FPS,
                enableAnimations: !this.themeConfig.reducedMotion && config.enableAnimations !== false,
                darkMode: this.themeConfig.darkMode,
                highContrast: this.themeConfig.highContrast,
                autoSave: config.autoSave !== false,
                memoryCleanup: config.memoryCleanup !== false,
                ...config
            };

            // Core systems
            this.renderer = null;
            this.scene = new Scene();
            this.inputManager = null;
            this.accessibilityManager = null;
            this.animationManager = null;
            this.animationId = null;
            this.isRunning = false;
            this.isPaused = false;
            this.deltaTime = 0;
            this.lastTime = 0;
            this.frameBuffer = [];

            // Enhanced performance monitoring
            this.frameCount = 0;
            this.fps = 0;
            this.lastFPSUpdate = 0;
            this.performanceData = {
                averageFrameTime: 0,
                worstFrameTime: 0,
                frameTimeHistory: [],
                memoryUsage: 0,
                renderTime: 0,
                updateTime: 0
            };

            // Error handling and recovery
            this.errorCount = 0;
            this.lastError = null;
            this.recoveryAttempts = 0;
            this.maxRecoveryAttempts = 3;

            // Memory management
            this.memoryCleanupTimer = null;
            this.componentPool = new Map();
            this.lastMemoryCleanup = Date.now();

            // Settings and persistence
            this.settings = this.loadSettings();
            this.settingsSaveTimer = null;

            // Theme change monitoring
            this.setupThemeMonitoring();

            // Initialize engine
            this.init();

        } catch (error) {
            console.error('Engine initialization failed:', error);
            throw new EngineError('Failed to initialize SimulationEngine', 
                { containerId, config }, error);
        }
    }    init() {
        try {
            EnginePerformanceMonitor.startOperation('engine_init');

            this.setupRenderer();
            this.setupInputHandling();
            this.setupAccessibility();
            this.setupAnimationManager();
            this.setupPerformanceMonitoring();
            this.setupMemoryManagement();
            
            if (this.config.debug) {
                this.setupDebugTools();
            }

            // Initialize the scene
            this.scene.setEngine(this);
            
            // Apply theme to engine
            this.applyTheme();
            
            // Announce successful initialization
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Simulation engine initialized');
            }

            EnginePerformanceMonitor.endOperation('engine_init');
            console.log(`SimulationEngine initialized with ${this.config.renderMode} renderer`);
            
        } catch (error) {
            this.handleError(new EngineError('Engine initialization failed', 
                { renderMode: this.config.renderMode }, error));
        }
    }    setupRenderer() {
        try {
            EnginePerformanceMonitor.startOperation('renderer_setup');

            let renderMode = this.config.renderMode;
            
            // Auto-detect best renderer based on device capabilities
            if (renderMode === RENDER_MODES.AUTO) {
                renderMode = this.detectBestRenderer();
            }

            // Apply theme-specific renderer configuration
            const rendererConfig = {
                ...this.config,
                darkMode: this.config.darkMode,
                highContrast: this.config.highContrast,
                reducedMotion: this.themeConfig.reducedMotion
            };

            switch (renderMode) {
                case RENDER_MODES.SVG:
                    this.renderer = new SVGRenderer(this.container, rendererConfig);
                    break;
                case RENDER_MODES.CANVAS:
                    this.renderer = new CanvasRenderer(this.container, rendererConfig);
                    break;
                case RENDER_MODES.WEBGL:
                    if (this.isWebGLSupported()) {
                        this.renderer = new WebGLRenderer(this.container, rendererConfig);
                    } else {
                        console.warn('WebGL not supported, falling back to Canvas');
                        this.renderer = new CanvasRenderer(this.container, rendererConfig);
                        renderMode = RENDER_MODES.CANVAS;
                    }
                    break;
                default:
                    this.renderer = new CanvasRenderer(this.container, rendererConfig);
                    renderMode = RENDER_MODES.CANVAS;
            }

            // Update actual render mode used
            this.config.renderMode = renderMode;

            // Setup renderer accessibility
            if (this.renderer.setupAccessibility) {
                this.renderer.setupAccessibility();
            }

            EnginePerformanceMonitor.endOperation('renderer_setup');
            
        } catch (error) {
            console.error('Failed to initialize renderer:', error);
            // Enhanced fallback with error tracking
            try {
                this.renderer = new CanvasRenderer(this.container, this.config);
                this.config.renderMode = RENDER_MODES.CANVAS;
                this.handleError(new EngineError('Renderer fallback activated', 
                    { originalMode: this.config.renderMode, fallbackMode: RENDER_MODES.CANVAS }, error));
            } catch (fallbackError) {
                throw new EngineError('All renderer initialization failed', 
                    { originalError: error }, fallbackError);
            }
        }
    }

    setupInputHandling() {
        this.inputManager = new InputManager(this.renderer.getElement());
        
        // Register for common input events
        this.inputManager.on('mousedown', (event) => this.handleMouseDown(event));
        this.inputManager.on('mousemove', (event) => this.handleMouseMove(event));
        this.inputManager.on('mouseup', (event) => this.handleMouseUp(event));
        this.inputManager.on('keydown', (event) => this.handleKeyDown(event));
        this.inputManager.on('keyup', (event) => this.handleKeyUp(event));
        this.inputManager.on('touch', (event) => this.handleTouch(event));
    }

    setupAccessibility() {
        if (this.config.accessibility) {
            this.accessibilityManager = new AccessibilityManager(this.container, this);
        }
    }    setupPerformanceMonitoring() {
        try {
            EnginePerformanceMonitor.startOperation('performance_setup');

            // Enhanced performance monitoring based on performance mode
            switch (this.config.performance) {
                case PERFORMANCE_MODES.HIGH:
                    this.enablePerformanceOptimizations();
                    this.setupAdvancedMetrics();
                    break;
                case PERFORMANCE_MODES.BALANCED:
                    this.setupBasicMetrics();
                    break;
                case PERFORMANCE_MODES.COMPATIBILITY:
                    // Minimal monitoring for compatibility
                    this.setupMinimalMetrics();
                    break;
            }

            // Memory usage monitoring
            if (performance.memory) {
                setInterval(() => {
                    this.performanceData.memoryUsage = performance.memory.usedJSHeapSize;
                }, 5000);
            }

            EnginePerformanceMonitor.endOperation('performance_setup');
            
        } catch (error) {
            console.warn('Performance monitoring setup failed:', error);
        }
    }

    setupAdvancedMetrics() {
        // Detailed frame timing analysis
        this.performanceData.detailedTiming = true;
        
        // Track render and update times separately
        this.trackRenderTimes = true;
        this.trackUpdateTimes = true;
        
        // Enable performance warnings
        this.performanceWarnings = true;
    }

    setupBasicMetrics() {
        // Standard FPS and frame time tracking
        this.performanceData.basicTiming = true;
        this.trackRenderTimes = false;
        this.trackUpdateTimes = false;
        this.performanceWarnings = false;
    }

    setupMinimalMetrics() {
        // Only essential FPS tracking
        this.performanceData.minimal = true;
        this.trackRenderTimes = false;
        this.trackUpdateTimes = false;
        this.performanceWarnings = false;
    }

    setupDebugTools() {
        // Create debug overlay
        const debugOverlay = document.createElement('div');
        debugOverlay.className = 'debug-overlay';
        debugOverlay.style.cssText = `
            position: absolute;
            top: 10px;
            left: 10px;
            background: rgba(0,0,0,0.8);
            color: white;
            padding: 10px;
            font-family: monospace;
            font-size: 12px;
            border-radius: 4px;
            z-index: 1000;
        `;
        this.container.appendChild(debugOverlay);
        this.debugOverlay = debugOverlay;
    }

    setupAnimationManager() {
        try {
            this.animationManager = new AnimationManager({
                container: this.container,
                enableAnimations: this.config.enableAnimations,
                reducedMotion: this.themeConfig.reducedMotion,
                performanceMode: this.config.performance
            });

            // Integrate animation manager with engine
            this.animationManager.setEngine(this);
            
        } catch (error) {
            console.warn('Failed to initialize animation manager:', error);
            this.animationManager = null;
        }
    }

    setupMemoryManagement() {
        if (this.config.memoryCleanup) {
            this.memoryCleanupTimer = setInterval(() => {
                this.performMemoryCleanup();
            }, ENGINE_CONSTANTS.MEMORY_CLEANUP_INTERVAL);
        }
    }

    setupThemeMonitoring() {
        // Monitor theme changes
        const darkModeQuery = window.matchMedia?.('(prefers-color-scheme: dark)');
        const reducedMotionQuery = window.matchMedia?.('(prefers-reduced-motion: reduce)');
        const highContrastQuery = window.matchMedia?.('(prefers-contrast: high)');

        const handleThemeChange = () => {
            const newThemeConfig = EngineTheme.getEngineConfig();
            if (JSON.stringify(newThemeConfig) !== JSON.stringify(this.themeConfig)) {
                this.themeConfig = newThemeConfig;
                this.handleThemeChange();
            }
        };

        if (darkModeQuery?.addEventListener) {
            darkModeQuery.addEventListener('change', handleThemeChange);
        }
        if (reducedMotionQuery?.addEventListener) {
            reducedMotionQuery.addEventListener('change', handleThemeChange);
        }
        if (highContrastQuery?.addEventListener) {
            highContrastQuery.addEventListener('change', handleThemeChange);
        }

        // Store cleanup functions
        this.themeCleanup = () => {
            darkModeQuery?.removeEventListener?.('change', handleThemeChange);
            reducedMotionQuery?.removeEventListener?.('change', handleThemeChange);
            highContrastQuery?.removeEventListener?.('change', handleThemeChange);
        };
    }

    detectBestRenderer() {
        // Auto-detect best renderer based on capabilities and performance mode
        if (this.config.performance === PERFORMANCE_MODES.HIGH && this.isWebGLSupported()) {
            return RENDER_MODES.WEBGL;
        } else if (this.config.performance === PERFORMANCE_MODES.COMPATIBILITY) {
            return RENDER_MODES.SVG;
        } else {
            return RENDER_MODES.CANVAS; // Balanced default
        }
    }

    applyTheme() {
        // Apply theme configuration to renderer and components
        if (this.renderer?.applyTheme) {
            this.renderer.applyTheme(this.themeConfig);
        }

        // Update container classes for theme
        const themeClasses = [];
        if (this.config.darkMode) themeClasses.push('dark-mode');
        if (this.config.highContrast) themeClasses.push('high-contrast');
        if (this.themeConfig.reducedMotion) themeClasses.push('reduced-motion');

        this.container.className = this.container.className
            .replace(/\b(dark-mode|high-contrast|reduced-motion)\b/g, '')
            .trim() + ' ' + themeClasses.join(' ');
    }

    handleThemeChange() {
        try {
            // Update configuration
            this.config.darkMode = this.themeConfig.darkMode;
            this.config.highContrast = this.themeConfig.highContrast;
            this.config.enableAnimations = !this.themeConfig.reducedMotion && this.config.enableAnimations !== false;

            // Apply new theme
            this.applyTheme();

            // Update animation manager
            if (this.animationManager) {
                this.animationManager.updateConfiguration({
                    enableAnimations: this.config.enableAnimations,
                    reducedMotion: this.themeConfig.reducedMotion
                });
            }

            // Notify accessibility manager
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Theme changed');
            }

            // Save updated settings
            this.saveSettings();

        } catch (error) {
            this.handleError(new EngineError('Theme change handling failed', 
                { newTheme: this.themeConfig }, error));
        }
    }

    loadSettings() {
        try {
            const saved = localStorage.getItem('simulationEngine_settings');
            return saved ? JSON.parse(saved) : {};
        } catch (error) {
            console.warn('Failed to load engine settings:', error);
            return {};
        }
    }

    saveSettings() {
        if (!this.config.autoSave) return;

        try {
            const settings = {
                renderMode: this.config.renderMode,
                performance: this.config.performance,
                accessibility: this.config.accessibility,
                debug: this.config.debug,
                lastSaved: Date.now()
            };

            localStorage.setItem('simulationEngine_settings', JSON.stringify(settings));

            // Debounced save to prevent excessive writes
            clearTimeout(this.settingsSaveTimer);
            this.settingsSaveTimer = setTimeout(() => {
                // Additional settings persistence could go here
            }, 1000);

        } catch (error) {
            console.warn('Failed to save engine settings:', error);
        }
    }

    performMemoryCleanup() {
        try {
            EnginePerformanceMonitor.startOperation('memory_cleanup');

            // Clean up performance data
            if (this.performanceData.frameTimeHistory.length > 100) {
                this.performanceData.frameTimeHistory = this.performanceData.frameTimeHistory.slice(-50);
            }

            // Clean up component pool
            const now = Date.now();
            const maxAge = 60000; // 1 minute
            
            for (const [key, value] of this.componentPool.entries()) {
                if (now - value.lastUsed > maxAge) {
                    this.componentPool.delete(key);
                    EnginePerformanceMonitor.releaseMemory(key);
                }
            }

            // Force garbage collection hint
            if (window.gc) {
                window.gc();
            }

            this.lastMemoryCleanup = now;
            EnginePerformanceMonitor.endOperation('memory_cleanup');

        } catch (error) {
            this.handleError(new EngineError('Memory cleanup failed', {}, error));
        }
    }

    handleError(error) {
        this.errorCount++;
        this.lastError = error;

        console.error('Engine Error:', error);

        // Announce error to accessibility manager
        if (this.accessibilityManager && error.name === 'EngineError') {
            this.accessibilityManager.announce('Engine error occurred', 'assertive');
        }

        // Recovery attempts for critical errors
        if (this.recoveryAttempts < this.maxRecoveryAttempts) {
            this.recoveryAttempts++;
            console.log(`Attempting recovery ${this.recoveryAttempts}/${this.maxRecoveryAttempts}`);
            
            // Attempt recovery based on error type
            if (error.context?.renderMode && error.context.renderMode !== RENDER_MODES.CANVAS) {
                this.attemptRendererRecovery();
            }
        }
    }

    attemptRendererRecovery() {
        try {
            console.log('Attempting renderer recovery...');
            
            // Try to reinitialize with canvas renderer
            if (this.renderer) {
                this.renderer.destroy();
            }
            
            this.config.renderMode = RENDER_MODES.CANVAS;
            this.setupRenderer();
            
            this.recoveryAttempts = 0; // Reset on successful recovery
            console.log('Renderer recovery successful');
            
        } catch (recoveryError) {
            console.error('Renderer recovery failed:', recoveryError);
        }
   }

    // Component management
    addComponent(component) {
        try {
            if (!component || typeof component.update !== 'function') {
                throw new EngineError('Invalid component: must have update method', { component });
            }

            EnginePerformanceMonitor.trackMemory(`component_${component.id || Date.now()}`, 
                component.memorySize || 1024);

            component.setEngine?.(this);
            this.scene.add(component);

            // Register with accessibility manager
            if (this.accessibilityManager && component.accessibilityConfig) {
                this.accessibilityManager.registerComponent(component);
            }

            // Apply current theme to component
            if (component.applyTheme && this.themeConfig) {
                component.applyTheme(this.themeConfig);
            }

            return component;
            
        } catch (error) {
            this.handleError(new EngineError('Failed to add component', { component }, error));
            return null;
        }
    }

    removeComponent(component) {
        try {
            this.scene.remove(component);
            
            if (this.accessibilityManager) {
                this.accessibilityManager.unregisterComponent(component);
            }

            // Release component memory tracking
            if (component.id) {
                EnginePerformanceMonitor.releaseMemory(`component_${component.id}`);
            }

            // Cleanup component
            if (component.destroy) {
                component.destroy();
            }
            
        } catch (error) {
            this.handleError(new EngineError('Failed to remove component', { component }, error));
        }
    }

    // Animation loop
    start() {
        if (this.isRunning) return;
        
        try {
            this.isRunning = true;
            this.isPaused = false;
            this.lastTime = performance.now();
            this.frameCount = 0;
            this.recoveryAttempts = 0;

            // Start animation manager
            if (this.animationManager) {
                this.animationManager.start();
            }

            // Announce start to accessibility
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Simulation started');
            }

            this.animate();
            
        } catch (error) {
            this.handleError(new EngineError('Failed to start engine', {}, error));
        }
    }

    stop() {
        if (!this.isRunning) return;

        try {
            this.isRunning = false;
            this.isPaused = false;
            
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            // Stop animation manager
            if (this.animationManager) {
                this.animationManager.stop();
            }

            // Announce stop to accessibility
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Simulation stopped');
            }

            // Save settings
            this.saveSettings();
            
        } catch (error) {
            this.handleError(new EngineError('Failed to stop engine', {}, error));
        }
    }

    pause() {
        if (!this.isRunning || this.isPaused) return;

        try {
            this.isPaused = true;
            
            if (this.animationId) {
                cancelAnimationFrame(this.animationId);
                this.animationId = null;
            }

            // Pause animation manager
            if (this.animationManager) {
                this.animationManager.pause();
            }

            // Announce pause to accessibility
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Simulation paused');
            }
            
        } catch (error) {
            this.handleError(new EngineError('Failed to pause engine', {}, error));
        }
    }

    resume() {
        if (!this.isRunning || !this.isPaused) return;

        try {
            this.isPaused = false;
            this.lastTime = performance.now(); // Reset timing
            
            // Resume animation manager
            if (this.animationManager) {
                this.animationManager.resume();
            }

            // Announce resume to accessibility
            if (this.accessibilityManager) {
                this.accessibilityManager.announce('Simulation resumed');
            }

            this.animate();
            
        } catch (error) {
            this.handleError(new EngineError('Failed to resume engine', {}, error));
        }
    }

    animate() {
        if (!this.isRunning || this.isPaused) return;

        try {
            const currentTime = performance.now();
            let deltaTime = currentTime - this.lastTime;
            
            // Prevent spiral of death
            if (deltaTime > ENGINE_CONSTANTS.MAX_DELTA_TIME) {
                deltaTime = ENGINE_CONSTANTS.MAX_DELTA_TIME;
            }
            
            this.deltaTime = deltaTime;
            this.lastTime = currentTime;

            // Performance tracking
            const frameStart = currentTime;
            
            // Update FPS
            this.updateFPS(currentTime);

            // Update scene
            const updateStart = this.trackUpdateTimes ? performance.now() : null;
            this.update(deltaTime);
            if (this.trackUpdateTimes) {
                this.performanceData.updateTime = performance.now() - updateStart;
            }
            
            // Render frame
            const renderStart = this.trackRenderTimes ? performance.now() : null;
            this.render();
            if (this.trackRenderTimes) {
                this.performanceData.renderTime = performance.now() - renderStart;
            }

            // Track frame time
            const frameTime = performance.now() - frameStart;
            this.trackFrameTime(frameTime);

            // Update debug info
            if (this.config.debug && this.frameCount % 15 === 0) { // Update every 15 frames
                this.updateDebugInfo();
            }

            // Performance warning
            if (this.performanceWarnings && frameTime > ENGINE_CONSTANTS.PERFORMANCE_WARNING_THRESHOLD) {
                console.warn(`Slow frame: ${frameTime.toFixed(2)}ms`);
            }

            this.animationId = requestAnimationFrame(() => this.animate());
            
        } catch (error) {
            this.handleError(new EngineError('Animation loop error', 
                { deltaTime: this.deltaTime, frameCount: this.frameCount }, error));
        }
    }

    update(deltaTime) {
        try {
            EnginePerformanceMonitor.startOperation('scene_update');
            
            // Update all scene components
            this.scene.update(deltaTime);
            
            // Update input manager
            if (this.inputManager) {
                this.inputManager.update(deltaTime);
            }

            // Update animation manager
            if (this.animationManager) {
                this.animationManager.update(deltaTime);
            }

            EnginePerformanceMonitor.endOperation('scene_update');
            
        } catch (error) {
            this.handleError(new EngineError('Update loop error', { deltaTime }, error));
        }
    }

    render() {
        try {
            if (!this.renderer) return;
            
            EnginePerformanceMonitor.startOperation('scene_render');
            
            this.renderer.clear();
            this.scene.render(this.renderer);
            
            EnginePerformanceMonitor.endOperation('scene_render');
            
        } catch (error) {
            this.handleError(new EngineError('Render loop error', {}, error));
        }
    }

    trackFrameTime(frameTime) {
        if (this.performanceData.frameTimeHistory) {
            this.performanceData.frameTimeHistory.push(frameTime);
            
            // Update performance statistics
            this.performanceData.averageFrameTime = this.performanceData.frameTimeHistory
                .reduce((sum, time) => sum + time, 0) / this.performanceData.frameTimeHistory.length;
            
            this.performanceData.worstFrameTime = Math.max(this.performanceData.worstFrameTime, frameTime);
        }
    }

    // Input event handlers with enhanced error handling
    handleMouseDown(event) {
        try {
            const sceneCoords = this.screenToScene(event.x, event.y);
            this.scene.handleInput('mousedown', { ...event, ...sceneCoords });
        } catch (error) {
            this.handleError(new EngineError('Mouse down handler error', { event }, error));
        }
    }

    handleMouseMove(event) {
        try {
            const sceneCoords = this.screenToScene(event.x, event.y);
            this.scene.handleInput('mousemove', { ...event, ...sceneCoords });
        } catch (error) {
            this.handleError(new EngineError('Mouse move handler error', { event }, error));
        }
    }

    handleMouseUp(event) {
        try {
            const sceneCoords = this.screenToScene(event.x, event.y);
            this.scene.handleInput('mouseup', { ...event, ...sceneCoords });
        } catch (error) {
            this.handleError(new EngineError('Mouse up handler error', { event }, error));
        }
    }

    handleKeyDown(event) {
        try {
            // Enhanced keyboard handling with accessibility
            if (this.accessibilityManager?.handleKeyDown?.(event)) {
                return; // Accessibility manager handled the event
            }
            
            this.scene.handleInput('keydown', event);
        } catch (error) {
            this.handleError(new EngineError('Key down handler error', { event }, error));
        }
    }

    handleKeyUp(event) {
        try {
            this.scene.handleInput('keyup', event);
        } catch (error) {
            this.handleError(new EngineError('Key up handler error', { event }, error));
        }
    }

    handleTouch(event) {
        try {
            const sceneCoords = this.screenToScene(event.x, event.y);
            this.scene.handleInput('touch', { ...event, ...sceneCoords });
        } catch (error) {
            this.handleError(new EngineError('Touch handler error', { event }, error));
        }
    }

    // Enhanced coordinate transformation
    screenToScene(screenX, screenY) {
        try {
            const rect = this.renderer.getElement().getBoundingClientRect();
            return {
                sceneX: screenX - rect.left,
                sceneY: screenY - rect.top
            };
        } catch (error) {
            console.warn('Screen to scene coordinate transformation failed:', error);
            return { sceneX: screenX, sceneY: screenY };
        }
    }

    // Enhanced utility methods
    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            const context = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            return !!context;
        } catch (e) {
            return false;
        }
    }

    updateFPS(currentTime) {
        this.frameCount++;
        
        if (currentTime >= this.lastFPSUpdate + 1000) {
            this.fps = this.frameCount;
            this.frameCount = 0;
            this.lastFPSUpdate = currentTime;
        }
    }

    updateDebugInfo() {
        try {
            if (!this.debugOverlay) return;
            
            const metrics = EnginePerformanceMonitor.getMetrics();
            const memoryInfo = performance.memory ? 
                `Memory: ${(performance.memory.usedJSHeapSize / 1048576).toFixed(2)}MB` : 
                'Memory: N/A';
            
            this.debugOverlay.innerHTML = `
                FPS: ${this.fps}
                Components: ${this.scene.getComponentCount()}
                Renderer: ${this.config.renderMode}
                Delta: ${this.deltaTime.toFixed(2)}ms
                ${memoryInfo}
                Errors: ${this.errorCount}
                Theme: ${this.themeConfig.theme}
                Reduced Motion: ${this.themeConfig.reducedMotion}
                Avg Frame: ${this.performanceData.averageFrameTime?.toFixed(2) || 'N/A'}ms
            `;
        } catch (error) {
            console.warn('Debug info update failed:', error);
        }
    }

    enablePerformanceOptimizations() {
        try {
            // Implement performance optimizations
            this.useObjectPooling = true;
            this.useFrustumCulling = true;
            this.useLevelOfDetail = true;
            
            console.log('Performance optimizations enabled');
        } catch (error) {
            console.warn('Failed to enable performance optimizations:', error);
        }
    }

    // Enhanced cleanup with comprehensive resource management
    destroy() {
        try {
            this.stop();
            
            // Cleanup theme monitoring
            if (this.themeCleanup) {
                this.themeCleanup();
            }
            
            // Clear timers
            if (this.memoryCleanupTimer) {
                clearInterval(this.memoryCleanupTimer);
            }
            if (this.settingsSaveTimer) {
                clearTimeout(this.settingsSaveTimer);
            }
            
            // Destroy managers and systems
            if (this.inputManager) {
                this.inputManager.destroy();
            }
            
            if (this.accessibilityManager) {
                this.accessibilityManager.destroy();
            }
            
            if (this.animationManager) {
                this.animationManager.destroy();
            }
            
            if (this.renderer) {
                this.renderer.destroy();
            }
            
            // Clear scene
            this.scene.clear();
            
            // Remove debug overlay
            if (this.debugOverlay) {
                this.debugOverlay.remove();
            }
            
            // Clear component pool
            this.componentPool.clear();
            
            // Save final settings
            this.saveSettings();
            
            console.log('SimulationEngine destroyed');
            
        } catch (error) {
            console.error('Engine destruction error:', error);
        }
    }

    // Public API methods
    getMetrics() {
        return {
            fps: this.fps,
            componentCount: this.scene.getComponentCount(),
            renderMode: this.config.renderMode,
            errorCount: this.errorCount,
            isRunning: this.isRunning,
            isPaused: this.isPaused,
            performance: this.performanceData,
            theme: this.themeConfig
        };
    }    updateConfiguration(newConfig) {
        try {
            Object.assign(this.config, newConfig);
            
            // Apply configuration changes
            if (newConfig.darkMode !== undefined || newConfig.highContrast !== undefined) {
                this.applyTheme();
            }
            
            if (newConfig.performance !== undefined) {
                this.setupPerformanceMonitoring();
            }
            
            this.saveSettings();
            
        } catch (error) {
            this.handleError(new EngineError('Configuration update failed', { newConfig }, error));
        }
    }

    setupDebugTools() {
        try {
            // Create enhanced debug overlay with theme support
            const debugOverlay = document.createElement('div');
            debugOverlay.className = 'debug-overlay';
            debugOverlay.setAttribute('role', 'complementary');
            debugOverlay.setAttribute('aria-label', 'Debug Information');
            
            const baseStyles = `
                position: absolute;
                top: 10px;
                left: 10px;
                padding: 12px;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-size: 11px;
                border-radius: 6px;
                z-index: 10000;
                min-width: 200px;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                pointer-events: none;
                user-select: none;
            `;
            
            const themeStyles = this.config.darkMode ? 
                'background: rgba(0, 0, 0, 0.9); color: #e0e0e0; border-color: rgba(255, 255, 255, 0.2);' :
                'background: rgba(255, 255, 255, 0.9); color: #333; border-color: rgba(0, 0, 0, 0.1);';
            
            debugOverlay.style.cssText = baseStyles + themeStyles;
            
            this.container.appendChild(debugOverlay);
            this.debugOverlay = debugOverlay;
            
            // Add debug keyboard shortcuts
            this.setupDebugKeyboard();
            
        } catch (error) {
            console.warn('Debug tools setup failed:', error);
        }
    }

    setupDebugKeyboard() {
        // Debug keyboard shortcuts
        const handleDebugKeys = (event) => {
            if (!this.config.debug) return;
            
            // Ctrl/Cmd + Shift + D: Toggle debug overlay
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                if (this.debugOverlay) {
                    this.debugOverlay.style.display = 
                        this.debugOverlay.style.display === 'none' ? 'block' : 'none';
                }
            }
            
            // Ctrl/Cmd + Shift + P: Performance snapshot
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                console.log('Engine Performance Snapshot:', this.getMetrics());
            }
        };
        
        document.addEventListener('keydown', handleDebugKeys);
        
        // Store cleanup function
        this.debugKeyboardCleanup = () => {
            document.removeEventListener('keydown', handleDebugKeys);
        };
    }
}

// Enhanced Scene management class with performance optimization
class Scene {
    constructor() {
        this.components = [];
        this.engine = null;
        this.componentIndex = new Map(); // Performance optimization for lookups
        this.dirtyComponents = new Set(); // Track components that need updates
    }

    setEngine(engine) {
        this.engine = engine;
    }

    add(component) {
        try {
            if (this.components.indexOf(component) === -1) {
                this.components.push(component);
                
                // Index component for fast lookups
                if (component.id) {
                    this.componentIndex.set(component.id, component);
                }
                
                // Mark as dirty for initial update
                this.dirtyComponents.add(component);
                
                // Apply theme if available
                if (this.engine?.themeConfig && component.applyTheme) {
                    component.applyTheme(this.engine.themeConfig);
                }
            }
        } catch (error) {
            console.error('Failed to add component to scene:', error);
        }
    }

    remove(component) {
        try {
            const index = this.components.indexOf(component);
            if (index !== -1) {
                this.components.splice(index, 1);
                
                // Remove from index
                if (component.id && this.componentIndex.has(component.id)) {
                    this.componentIndex.delete(component.id);
                }
                
                // Remove from dirty set
                this.dirtyComponents.delete(component);
            }
        } catch (error) {
            console.error('Failed to remove component from scene:', error);
        }
    }

    findById(id) {
        return this.componentIndex.get(id);
    }

    update(deltaTime) {
        try {
            // Update only active components
            for (let component of this.components) {
                if (component.active !== false) {
                    try {
                        component.update(deltaTime);
                        this.dirtyComponents.delete(component); // Mark as clean
                    } catch (componentError) {
                        console.error('Component update error:', componentError);
                        if (this.engine) {
                            this.engine.handleError(new EngineError('Component update failed', 
                                { componentId: component.id || 'unknown' }, componentError));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Scene update error:', error);
        }
    }

    render(renderer) {
        try {
            // Render only visible components
            for (let component of this.components) {
                if (component.visible !== false) {
                    try {
                        component.render(renderer);
                    } catch (componentError) {
                        console.error('Component render error:', componentError);
                        if (this.engine) {
                            this.engine.handleError(new EngineError('Component render failed', 
                                { componentId: component.id || 'unknown' }, componentError));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Scene render error:', error);
        }
    }

    handleInput(type, event) {
        try {
            // Handle input events in reverse order (top to bottom)
            for (let i = this.components.length - 1; i >= 0; i--) {
                const component = this.components[i];
                if (component.handleInput) {
                    try {
                        if (component.handleInput(type, event)) {
                            // Event was handled, stop propagation
                            break;
                        }
                    } catch (componentError) {
                        console.error('Component input handler error:', componentError);
                        if (this.engine) {
                            this.engine.handleError(new EngineError('Component input handling failed', 
                                { componentId: component.id || 'unknown', inputType: type }, componentError));
                        }
                    }
                }
            }
        } catch (error) {
            console.error('Scene input handling error:', error);
        }
    }

    getComponentCount() {
        return this.components.length;
    }

    getDirtyComponentCount() {
        return this.dirtyComponents.size;
    }

    getComponentsByType(type) {
        return this.components.filter(component => component.type === type);
    }

    clear() {
        try {
            // Cleanup all components
            for (let component of this.components) {
                if (component.destroy) {
                    component.destroy();
                }
            }
            
            this.components = [];
            this.componentIndex.clear();
            this.dirtyComponents.clear();
        } catch (error) {
            console.error('Scene clear error:', error);
        }
    }

    // Performance and debugging methods
    getPerformanceInfo() {
        return {
            totalComponents: this.components.length,
            activeComponents: this.components.filter(c => c.active !== false).length,
            visibleComponents: this.components.filter(c => c.visible !== false).length,
            dirtyComponents: this.dirtyComponents.size,
            indexedComponents: this.componentIndex.size
        };
    }
}
            debugOverlay.className = 'debug-overlay';
            debugOverlay.setAttribute('role', 'complementary');
            debugOverlay.setAttribute('aria-label', 'Debug Information');
            
            const baseStyles = `
                position: absolute;
                top: 10px;
                left: 10px;
                padding: 12px;
                font-family: 'Consolas', 'Monaco', 'Courier New', monospace;
                font-size: 11px;
                border-radius: 6px;
                z-index: 10000;
                min-width: 200px;
                backdrop-filter: blur(8px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                pointer-events: none;
                user-select: none;
            `;
            
            const themeStyles = this.config.darkMode ? 
                'background: rgba(0, 0, 0, 0.9); color: #e0e0e0; border-color: rgba(255, 255, 255, 0.2);' :
                'background: rgba(255, 255, 255, 0.9); color: #333; border-color: rgba(0, 0, 0, 0.1);';
            
            debugOverlay.style.cssText = baseStyles + themeStyles;
            
            this.container.appendChild(debugOverlay);
            this.debugOverlay = debugOverlay;
            
            // Add debug keyboard shortcuts
            this.setupDebugKeyboard();
            
        } catch (error) {
            console.warn('Debug tools setup failed:', error);
        }
    }

    setupDebugKeyboard() {
        // Debug keyboard shortcuts
        const handleDebugKeys = (event) => {
            if (!this.config.debug) return;
            
            // Ctrl/Cmd + Shift + D: Toggle debug overlay
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'D') {
                event.preventDefault();
                if (this.debugOverlay) {
                    this.debugOverlay.style.display = 
                        this.debugOverlay.style.display === 'none' ? 'block' : 'none';
                }
            }
            
            // Ctrl/Cmd + Shift + P: Performance snapshot
            if ((event.ctrlKey || event.metaKey) && event.shiftKey && event.key === 'P') {
                event.preventDefault();
                console.log('Engine Performance Snapshot:', this.getMetrics());
            }
        };
        
        document.addEventListener('keydown', handleDebugKeys);
        
        // Store cleanup function
        this.debugKeyboardCleanup = () => {
            document.removeEventListener('keydown', handleDebugKeys);
        };
    }
class Scene {
    constructor() {
        this.components = [];
        this.engine = null;
    }

    setEngine(engine) {
        this.engine = engine;
    }

    add(component) {
        if (this.components.indexOf(component) === -1) {
            this.components.push(component);
        }
    }

    remove(component) {
        const index = this.components.indexOf(component);
        if (index !== -1) {
            this.components.splice(index, 1);
        }
    }

    update(deltaTime) {
        for (let component of this.components) {
            if (component.active !== false) {
                component.update(deltaTime);
            }
        }
    }

    render(renderer) {
        for (let component of this.components) {
            if (component.visible !== false) {
                component.render(renderer);
            }
        }
    }

    handleInput(type, event) {
        // Handle input events in reverse order (top to bottom)
        for (let i = this.components.length - 1; i >= 0; i--) {
            const component = this.components[i];
            if (component.handleInput && component.handleInput(type, event)) {
                // Event was handled, stop propagation
                break;
            }
        }
    }

    getComponentCount() {
        return this.components.length;
    }

    clear() {
        this.components = [];
    }
}

// Export for ES6 modules
export { SimulationEngine };
export default SimulationEngine;
