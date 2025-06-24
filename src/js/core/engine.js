/**
 * SimulationEngine - Core rendering and interaction engine
 * Supports multiple rendering modes: SVG, Canvas, and WebGL
 */

import { InputManager } from './input-manager.js';
import AccessibilityManager from './accessibility.js';
import CanvasRenderer from '../renderers/canvas-renderer.js';
import SVGRenderer from '../renderers/svg-renderer.js';
import WebGLRenderer from '../renderers/webgl-renderer.js';

class SimulationEngine {
    constructor(containerId, config = {}) {
        this.container = document.getElementById(containerId);
        if (!this.container) {
            throw new Error(`Container with id "${containerId}" not found`);
        }

        this.config = {
            renderMode: config.renderMode || 'canvas', // 'svg', 'canvas', 'webgl'
            width: config.width || 800,
            height: config.height || 600,
            accessibility: config.accessibility !== false,
            performance: config.performance || 'balanced', // 'high', 'balanced', 'compatibility'
            debug: config.debug || false,
            ...config
        };

        this.renderer = null;
        this.scene = new Scene();
        this.inputManager = null;
        this.accessibilityManager = null;
        this.animationId = null;
        this.isRunning = false;
        this.deltaTime = 0;
        this.lastTime = 0;

        // Performance monitoring
        this.frameCount = 0;
        this.fps = 0;
        this.lastFPSUpdate = 0;

        this.init();
    }

    init() {
        this.setupRenderer();
        this.setupInputHandling();
        this.setupAccessibility();
        this.setupPerformanceMonitoring();
        
        if (this.config.debug) {
            this.setupDebugTools();
        }

        // Initialize the scene
        this.scene.setEngine(this);
        
        console.log(`SimulationEngine initialized with ${this.config.renderMode} renderer`);
    }

    setupRenderer() {
        try {
            switch (this.config.renderMode) {
                case 'svg':
                    this.renderer = new SVGRenderer(this.container, this.config);
                    break;
                case 'canvas':
                    this.renderer = new CanvasRenderer(this.container, this.config);
                    break;
                case 'webgl':
                    if (this.isWebGLSupported()) {
                        this.renderer = new WebGLRenderer(this.container, this.config);
                    } else {
                        console.warn('WebGL not supported, falling back to Canvas');
                        this.renderer = new CanvasRenderer(this.container, this.config);
                    }
                    break;
                default:
                    this.renderer = new CanvasRenderer(this.container, this.config);
            }
        } catch (error) {
            console.error('Failed to initialize renderer:', error);
            // Fallback to canvas renderer
            this.renderer = new CanvasRenderer(this.container, this.config);
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
    }

    setupPerformanceMonitoring() {
        if (this.config.performance === 'high') {
            // Enable performance optimizations
            this.enablePerformanceOptimizations();
        }
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

    // Component management
    addComponent(component) {
        if (!component || typeof component.update !== 'function') {
            console.error('Invalid component: must have update method');
            return;
        }

        component.setEngine(this);
        this.scene.add(component);

        if (this.accessibilityManager && component.accessibilityConfig) {
            this.accessibilityManager.registerComponent(component);
        }

        return component;
    }

    removeComponent(component) {
        this.scene.remove(component);
        
        if (this.accessibilityManager) {
            this.accessibilityManager.unregisterComponent(component);
        }
    }

    // Animation loop
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    animate() {
        if (!this.isRunning) return;

        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;

        // Update FPS
        this.updateFPS(currentTime);

        // Update scene
        this.update(this.deltaTime);
        
        // Render frame
        this.render();

        // Update debug info
        if (this.config.debug) {
            this.updateDebugInfo();
        }

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    update(deltaTime) {
        // Update all scene components
        this.scene.update(deltaTime);
        
        // Update input manager
        if (this.inputManager) {
            this.inputManager.update(deltaTime);
        }
    }

    render() {
        if (!this.renderer) return;
        
        this.renderer.clear();
        this.scene.render(this.renderer);
    }

    // Input event handlers
    handleMouseDown(event) {
        const sceneCoords = this.screenToScene(event.x, event.y);
        this.scene.handleInput('mousedown', { ...event, ...sceneCoords });
    }

    handleMouseMove(event) {
        const sceneCoords = this.screenToScene(event.x, event.y);
        this.scene.handleInput('mousemove', { ...event, ...sceneCoords });
    }

    handleMouseUp(event) {
        const sceneCoords = this.screenToScene(event.x, event.y);
        this.scene.handleInput('mouseup', { ...event, ...sceneCoords });
    }

    handleKeyDown(event) {
        this.scene.handleInput('keydown', event);
    }

    handleKeyUp(event) {
        this.scene.handleInput('keyup', event);
    }

    handleTouch(event) {
        const sceneCoords = this.screenToScene(event.x, event.y);
        this.scene.handleInput('touch', { ...event, ...sceneCoords });
    }

    // Coordinate transformation
    screenToScene(screenX, screenY) {
        const rect = this.renderer.getElement().getBoundingClientRect();
        return {
            sceneX: screenX - rect.left,
            sceneY: screenY - rect.top
        };
    }

    // Utility methods
    isWebGLSupported() {
        try {
            const canvas = document.createElement('canvas');
            return !!(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
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
        if (!this.debugOverlay) return;
        
        this.debugOverlay.innerHTML = `
            FPS: ${this.fps}
            Components: ${this.scene.getComponentCount()}
            Renderer: ${this.config.renderMode}
            Delta: ${this.deltaTime.toFixed(2)}ms
        `;
    }

    enablePerformanceOptimizations() {
        // Implement performance optimizations
        // - Object pooling
        // - Frustum culling
        // - Level of detail
        console.log('Performance optimizations enabled');
    }

    // Cleanup
    destroy() {
        this.stop();
        
        if (this.inputManager) {
            this.inputManager.destroy();
        }
        
        if (this.accessibilityManager) {
            this.accessibilityManager.destroy();
        }
        
        if (this.renderer) {
            this.renderer.destroy();
        }
        
        if (this.debugOverlay) {
            this.debugOverlay.remove();
        }
    }
}

// Scene management class
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
