/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * Visual Engine - Core rendering and interaction system for SimulateAI
 * Supports multiple rendering modes: SVG, Canvas, and WebGL
 * Provides unified object management, input handling, and accessibility
 */

import { Scene } from './scene.js';
import { InputManager } from './input-manager.js';
import { AnimationManager } from './animation-manager.js';
import AccessibilityManager from './accessibility.js';
import CanvasRenderer from '../renderers/canvas-renderer.js';
import SVGRenderer from '../renderers/svg-renderer.js';
import WebGLRenderer from '../renderers/webgl-renderer.js';

// Import interactive components
import {
  Button,
  Slider,
  Meter,
  Label,
} from '../objects/interactive-objects.js';
import {
  InteractiveButton,
  InteractiveSlider,
  EthicsMeter,
} from '../objects/enhanced-objects.js';
import {
  ModalDialog,
  NavigationMenu,
  Chart,
  FormField,
  Tooltip,
} from '../objects/advanced-ui-components.js';
import {
  DataTable,
  NotificationToast,
  LoadingSpinner,
} from '../objects/priority-components.js';
import {
  TabContainer,
  ProgressStepper,
  SplitPane,
  TreeView,
  FileUpload,
} from '../objects/layout-components.js';
import {
  ColorPicker,
  Accordion,
  DateTimePicker,
  NumberInput,
  Drawer,
  SearchBox,
} from '../objects/input-utility-components.js';

// Constants to avoid magic numbers
const ENGINE_CONSTANTS = {
  DEFAULT_MAX_FPS: 60,
  DEFAULT_WIDTH: 800,
  DEFAULT_HEIGHT: 600,
  MIN_DEVICE_MEMORY: 2, // GB
  MIN_CORES: 2,
  FPS_UPDATE_INTERVAL: 1000, // ms
  DEBUG_PANEL_MIN_WIDTH: 200,
  DEBUG_PANEL_POSITION: {
    TOP: 10,
    RIGHT: 10,
    PADDING: 10,
    BORDER_RADIUS: 4,
    Z_INDEX: 1000,
  },
  // Animation timing constants
  MILLISECONDS_PER_SECOND: 1000,
  RGBA_ZERO_VALUES: {
    RED: 0,
    GREEN: 0,
    BLUE: 0,
    ALPHA: 0.8,
  },
  DEBUG_STYLES: {
    FONT_SIZE: 12,
    ZERO_THRESHOLD: 0,
    DECIMAL_PLACES: 2,
  },
  RESIZE_OBSERVER: {
    FIRST_ENTRY_INDEX: 0,
  },
};

export class VisualEngine {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      renderMode: options.renderMode || 'auto', // 'svg', 'canvas', 'webgl', 'auto'
      accessibility: options.accessibility !== false,
      highPerformance: options.highPerformance || false,
      maxFPS: options.maxFPS || ENGINE_CONSTANTS.DEFAULT_MAX_FPS,
      debug: options.debug || false,
      width: options.width || ENGINE_CONSTANTS.DEFAULT_WIDTH,
      height: options.height || ENGINE_CONSTANTS.DEFAULT_HEIGHT,
      ...options,
    };

    this.renderer = null;
    this.scene = new Scene();
    this.inputManager = null;
    this.accessibilityManager = null;
    this.animationManager = new AnimationManager(this);

    this.isRunning = false;
    this.isPaused = false;
    this.lastFrameTime = 0;
    this.deltaTime = 0;
    this.frameCount = 0;
    this.fpsCounter = 0;
    this.lastFPSUpdate = 0;
    // Performance monitoring
    this.performanceStats = {
      fps: 0,
      frameTime: 0,
      renderTime: 0,
      updateTime: 0,
    };

    // Add compatibility alias for EthicsSimulation
    this.config = this.options;
    this.init();
  }

  init() {
    this.logInfo('Initializing...');

    this.setupRenderer();
    this.setupInputManager();
    this.setupAccessibility();
    this.setupEventListeners();
    this.setupPerformanceMonitoring();
    this.setupComponentRegistry();

    this.logInfo(`Initialized with ${this.renderer.type} renderer`);
  }

  setupRenderer() {
    const mode = this.determineOptimalRenderMode();

    switch (mode) {
      case 'webgl':
        try {
          this.renderer = new WebGLRenderer(this.container, this.options);
        } catch (error) {
          this.logWarning(
            'WebGL renderer failed to initialize, falling back to Canvas',
            error
          );
          this.renderer = new CanvasRenderer(this.container, this.options);
        }
        break;
      case 'canvas':
        this.renderer = new CanvasRenderer(this.container, this.options);
        break;
      case 'svg':
        this.renderer = new SVGRenderer(this.container, this.options);
        break;
      default:
        this.renderer = new CanvasRenderer(this.container, this.options);
    }

    this.renderer.engine = this;
    this.logInfo(`Using ${this.renderer.type} renderer`);
  }

  setupInputManager() {
    this.inputManager = new InputManager(this);
  }

  setupAccessibility() {
    if (this.options.accessibility) {
      this.accessibilityManager = new AccessibilityManager(this.container);
      this.accessibilityManager.engine = this;
    }
  }

  setupEventListeners() {
    // Handle container resize
    if (typeof ResizeObserver !== 'undefined') {
      const resizeObserver = new ResizeObserver(entries => {
        this.handleResize(entries);
      });
      resizeObserver.observe(this.container);
    } else {
      // Fallback for older browsers
      window.addEventListener('resize', () => {
        this.handleResize();
      });
    }

    // Handle visibility changes for performance optimization
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        this.pause();
      } else {
        this.resume();
      }
    });
  }

  setupPerformanceMonitoring() {
    if (this.options.debug) {
      this.createDebugPanel();
    }
  }

  setupComponentRegistry() {
    this.componentRegistry = new Map();
    this.componentInstances = new Map();

    // Register core components
    this.registerComponent('button', Button);
    this.registerComponent('slider', Slider);
    this.registerComponent('meter', Meter);
    this.registerComponent('label', Label);

    // Register enhanced components
    this.registerComponent('interactive-button', InteractiveButton);
    this.registerComponent('interactive-slider', InteractiveSlider);
    this.registerComponent('ethics-meter', EthicsMeter);

    // Register advanced UI components
    this.registerComponent('modal-dialog', ModalDialog);
    this.registerComponent('navigation-menu', NavigationMenu);
    this.registerComponent('chart', Chart);
    this.registerComponent('form-field', FormField);
    this.registerComponent('tooltip', Tooltip);

    // Register priority components
    this.registerComponent('data-table', DataTable);
    this.registerComponent('notification-toast', NotificationToast);
    this.registerComponent('loading-spinner', LoadingSpinner);

    // Register layout components
    this.registerComponent('tab-container', TabContainer);
    this.registerComponent('progress-stepper', ProgressStepper);
    this.registerComponent('split-pane', SplitPane);
    this.registerComponent('tree-view', TreeView);
    this.registerComponent('file-upload', FileUpload);

    // Register input/utility components
    this.registerComponent('color-picker', ColorPicker);
    this.registerComponent('accordion', Accordion);
    this.registerComponent('datetime-picker', DateTimePicker);
    this.registerComponent('number-input', NumberInput);
    this.registerComponent('drawer', Drawer);
    this.registerComponent('search-box', SearchBox);

    this.logInfo(
      `Component registry initialized with ${this.componentRegistry.size} component types`
    );
  }

  registerComponent(name, componentClass) {
    this.componentRegistry.set(name, componentClass);
    this.componentInstances.set(name, new Set());
  }

  createComponent(type, options = {}) {
    const ComponentClass = this.componentRegistry.get(type);
    if (!ComponentClass) {
      this.logWarning(`Component type "${type}" not found in registry`);
      return null;
    }

    try {
      const component = new ComponentClass(options);
      this.componentInstances.get(type).add(component);

      // Add to scene
      this.addObject(component);

      return component;
    } catch (error) {
      this.logError(`Failed to create component of type "${type}"`, error);
      return null;
    }
  }

  destroyComponent(component) {
    if (!component) {
      this.logWarning('Attempted to destroy null/undefined component');
      return;
    }

    // Find component type and remove from instances
    for (const [, instances] of this.componentInstances) {
      if (instances.has(component)) {
        instances.delete(component);
        break;
      }
    }

    // Remove from scene
    this.removeObject(component);
  }

  getComponentsByType(type) {
    return Array.from(this.componentInstances.get(type) || []);
  }

  getAllComponents() {
    const all = [];
    for (const instances of this.componentInstances.values()) {
      all.push(...instances);
    }
    return all;
  }

  determineOptimalRenderMode() {
    if (this.options.renderMode !== 'auto') {
      return this.options.renderMode;
    }

    // Auto-detect best renderer based on capabilities and performance needs
    const hasWebGL = this.detectWebGLSupport();
    const hasCanvas = this.detectCanvasSupport();
    const isHighPerformance = this.options.highPerformance;
    const isMobile = /Mobi|Android/i.test(navigator.userAgent);
    const isLowEndDevice = this.detectLowEndDevice();

    if (isHighPerformance && hasWebGL && !isMobile && !isLowEndDevice) {
      return 'webgl';
    } else if (hasCanvas && !isLowEndDevice) {
      return 'canvas';
    } else {
      return 'svg';
    }
  }

  detectWebGLSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!(
        canvas.getContext('webgl') || canvas.getContext('experimental-webgl')
      );
    } catch (e) {
      return false;
    }
  }

  detectCanvasSupport() {
    try {
      const canvas = document.createElement('canvas');
      return !!canvas.getContext('2d');
    } catch (e) {
      return false;
    }
  }

  detectLowEndDevice() {
    // Basic heuristics for detecting low-end devices
    try {
      const memory = navigator.deviceMemory;
      const cores = navigator.hardwareConcurrency;

      if (memory && memory < ENGINE_CONSTANTS.MIN_DEVICE_MEMORY) return true; // Less than 2GB RAM
      if (cores && cores < ENGINE_CONSTANTS.MIN_CORES) return true; // Less than 2 cores

      return false;
    } catch (error) {
      // If device detection fails, assume it's not a low-end device
      this.logWarning('Device detection failed', error);
      return false;
    }
  }

  // Animation loop with performance optimization
  start() {
    if (this.isRunning) return;

    this.isRunning = true;
    this.isPaused = false;
    this.lastFrameTime = performance.now();
    this.lastFPSUpdate = this.lastFrameTime;

    this.logInfo('Starting animation loop');
    this.animate();
  }

  stop() {
    this.isRunning = false;
    this.isPaused = false;
    this.logInfo('Stopped');
  }

  pause() {
    this.isPaused = true;
    this.logInfo('Paused');
  }

  resume() {
    if (this.isRunning && this.isPaused) {
      this.isPaused = false;
      this.lastFrameTime = performance.now();
      this.logInfo('Resumed');
    }
  }

  animate(currentTime = performance.now()) {
    if (!this.isRunning) return;

    const updateStartTime = performance.now();

    // Calculate delta time with frame rate limiting
    this.deltaTime = Math.min(
      currentTime - this.lastFrameTime,
      ENGINE_CONSTANTS.MILLISECONDS_PER_SECOND / this.options.maxFPS
    );
    this.lastFrameTime = currentTime;

    if (!this.isPaused) {
      // Update systems
      this.update(this.deltaTime);

      // Render frame
      const renderStartTime = performance.now();
      this.render();
      this.performanceStats.renderTime = performance.now() - renderStartTime;

      // Update performance stats
      this.updatePerformanceStats(currentTime, updateStartTime);
    }

    requestAnimationFrame(time => this.animate(time));
  }

  update(deltaTime) {
    // Update animation manager
    this.animationManager.update(deltaTime);

    // Update scene objects
    this.scene.update(deltaTime);

    // Update input manager
    this.inputManager.update(deltaTime);

    // Update accessibility if needed
    if (this.accessibilityManager && this.accessibilityManager.needsUpdate) {
      this.accessibilityManager.update();
    }
  }

  render() {
    if (this.renderer) {
      this.renderer.render(this.scene);
    }
  }

  updatePerformanceStats(currentTime, updateStartTime) {
    this.frameCount++;
    this.performanceStats.updateTime = performance.now() - updateStartTime;
    this.performanceStats.frameTime = performance.now() - currentTime;

    // Update FPS counter every second
    if (
      currentTime - this.lastFPSUpdate >=
      ENGINE_CONSTANTS.FPS_UPDATE_INTERVAL
    ) {
      this.performanceStats.fps = Math.round(
        (this.frameCount * ENGINE_CONSTANTS.FPS_UPDATE_INTERVAL) /
          (currentTime - this.lastFPSUpdate)
      );
      this.frameCount = 0;
      this.lastFPSUpdate = currentTime;
      if (this.options.debug) {
        this.updateDebugPanel();
      }
    }
  }

  // Object management
  addObject(object) {
    if (!object) {
      this.logWarning('Attempted to add null/undefined object to scene');
      return null;
    }

    this.scene.add(object);

    if (
      this.accessibilityManager &&
      object.isInteractive &&
      object.accessibilityConfig
    ) {
      this.accessibilityManager.registerComponent(object);
    }

    return object;
  }

  removeObject(object) {
    if (!object) {
      this.logWarning('Attempted to remove null/undefined object from scene');
      return;
    }

    this.scene.remove(object);

    if (this.accessibilityManager && object.isInteractive) {
      this.accessibilityManager.unregisterComponent(object);
    }
  }

  clearScene() {
    this.scene.clear();

    if (this.accessibilityManager) {
      this.accessibilityManager.clearObjects();
    }
  }

  // Compatibility methods for EthicsSimulation
  addComponent(component) {
    // Compatibility method for EthicsSimulation
    return this.addObject(component);
  }

  removeComponent(component) {
    // Compatibility method for EthicsSimulation
    return this.removeObject(component);
  }

  // Coordinate transformations
  screenToWorld(screenX, screenY) {
    return this.renderer.screenToWorld
      ? this.renderer.screenToWorld(screenX, screenY)
      : { x: screenX, y: screenY };
  }

  worldToScreen(worldX, worldY) {
    return this.renderer.worldToScreen
      ? this.renderer.worldToScreen(worldX, worldY)
      : { x: worldX, y: worldY };
  }

  // Event handling
  handleResize(entries = null) {
    if (this.renderer && this.renderer.resize) {
      let width, height;

      // Use ResizeObserver data if available, otherwise get container dimensions
      if (
        entries &&
        entries[ENGINE_CONSTANTS.RESIZE_OBSERVER.FIRST_ENTRY_INDEX]
      ) {
        ({ width, height } =
          entries[
            ENGINE_CONSTANTS.RESIZE_OBSERVER.FIRST_ENTRY_INDEX
          ].contentRect);
      } else {
        ({ width, height } = this.container.getBoundingClientRect());
      }

      // Only resize if dimensions are valid
      if (
        width > ENGINE_CONSTANTS.DEBUG_STYLES.ZERO_THRESHOLD &&
        height > ENGINE_CONSTANTS.DEBUG_STYLES.ZERO_THRESHOLD
      ) {
        this.renderer.resize(width, height);
      }
    }

    // Notify scene objects of resize
    this.scene.handleResize();
  }

  // Debug functionality
  createDebugPanel() {
    this.debugPanel = document.createElement('div');
    this.debugPanel.style.cssText = `
            position: absolute;
            top: ${ENGINE_CONSTANTS.DEBUG_PANEL_POSITION.TOP}px;
            right: ${ENGINE_CONSTANTS.DEBUG_PANEL_POSITION.RIGHT}px;
            background: rgba(${ENGINE_CONSTANTS.RGBA_ZERO_VALUES.RED}, ${ENGINE_CONSTANTS.RGBA_ZERO_VALUES.GREEN}, ${ENGINE_CONSTANTS.RGBA_ZERO_VALUES.BLUE}, ${ENGINE_CONSTANTS.RGBA_ZERO_VALUES.ALPHA});
            color: white;
            padding: ${ENGINE_CONSTANTS.DEBUG_PANEL_POSITION.PADDING}px;
            font-family: monospace;
            font-size: ${ENGINE_CONSTANTS.DEBUG_STYLES.FONT_SIZE}px;
            border-radius: ${ENGINE_CONSTANTS.DEBUG_PANEL_POSITION.BORDER_RADIUS}px;
            z-index: ${ENGINE_CONSTANTS.DEBUG_PANEL_POSITION.Z_INDEX};
            min-width: ${ENGINE_CONSTANTS.DEBUG_PANEL_MIN_WIDTH}px;
        `;

    if (
      this.container.style.position !== 'absolute' &&
      this.container.style.position !== 'relative'
    ) {
      this.container.style.position = 'relative';
    }

    this.container.appendChild(this.debugPanel);
  }

  updateDebugPanel() {
    if (!this.debugPanel) return;

    try {
      const stats = this.performanceStats;
      const objects = this.scene.objects
        ? this.scene.objects.length
        : ENGINE_CONSTANTS.DEBUG_STYLES.ZERO_THRESHOLD;
      const interactiveObjects = this.scene.interactiveObjects
        ? this.scene.interactiveObjects.length
        : ENGINE_CONSTANTS.DEBUG_STYLES.ZERO_THRESHOLD;

      this.debugPanel.innerHTML = `
                <div><strong>Visual Engine Debug</strong></div>
                <div>FPS: ${stats.fps}</div>
                <div>Frame Time: ${stats.frameTime.toFixed(ENGINE_CONSTANTS.DEBUG_STYLES.DECIMAL_PLACES)}ms</div>
                <div>Update Time: ${stats.updateTime.toFixed(ENGINE_CONSTANTS.DEBUG_STYLES.DECIMAL_PLACES)}ms</div>
                <div>Render Time: ${stats.renderTime.toFixed(ENGINE_CONSTANTS.DEBUG_STYLES.DECIMAL_PLACES)}ms</div>
                <div>Objects: ${objects}</div>
                <div>Interactive: ${interactiveObjects}</div>
                <div>Renderer: ${this.renderer ? this.renderer.type : 'None'}</div>
            `;
    } catch (error) {
      this.logError('Error updating debug panel', error);
    }
  }

  // Event system for external integration
  emit(eventName, data = {}) {
    // Simple event emission - can be enhanced with proper EventEmitter if needed
    if (typeof this.options.onEvent === 'function') {
      this.options.onEvent(eventName, data);
    }

    // If there's a global event system, use it
    if (typeof window !== 'undefined' && window.dispatchEvent) {
      const customEvent = new CustomEvent(`visualengine:${eventName}`, {
        detail: data,
      });
      window.dispatchEvent(customEvent);
    }
  }

  // Error handling and logging
  logInfo(message, data = null) {
    if (this.options.debug) {
      // eslint-disable-next-line no-console

    }
  }

  logWarning(message, data = null) {
    if (this.options.debug) {
      // eslint-disable-next-line no-console
      console.warn(`VisualEngine: ${message}`, data || '');
    }
  }

  logError(message, error = null) {
    if (this.options.debug) {
      // eslint-disable-next-line no-console
      console.error(`VisualEngine: ${message}`, error || '');
    }

    // Emit error event for external handling
    this.emit('error', {
      message,
      error: error?.message || error,
      timestamp: Date.now(),
    });
  }

  // Utility methods
  getStats() {
    return {
      ...this.performanceStats,
      objects: this.scene.objects.length,
      interactiveObjects: this.scene.interactiveObjects.length,
      renderer: this.renderer ? this.renderer.type : 'None',
      isRunning: this.isRunning,
      isPaused: this.isPaused,
    };
  }

  // Cleanup
  destroy() {
    try {
      this.stop();

      if (
        this.inputManager &&
        typeof this.inputManager.destroy === 'function'
      ) {
        this.inputManager.destroy();
      }

      if (this.renderer && typeof this.renderer.destroy === 'function') {
        this.renderer.destroy();
      }

      if (
        this.accessibilityManager &&
        typeof this.accessibilityManager.destroy === 'function'
      ) {
        this.accessibilityManager.destroy();
      }

      if (this.debugPanel && this.debugPanel.parentNode) {
        this.debugPanel.parentNode.removeChild(this.debugPanel);
      }

      if (this.scene && typeof this.scene.clear === 'function') {
        this.scene.clear();
      }

      // Clear component instances
      if (this.componentInstances) {
        this.componentInstances.clear();
      }

      this.logInfo('Destroyed');
    } catch (error) {
      this.logError('Error during VisualEngine destruction', error);
    }
  }
}

export default VisualEngine;
