/**
 * Modern Layout Components
 * Implementation of TabContainer, ProgressStepper, SplitPane, TreeView, and FileUpload
 * Enhanced with accessibility, performance, themes, and modern JavaScript patterns
 */

import { BaseObject } from './enhanced-objects.js';

// =============================================================================
// MODERN INFRASTRUCTURE FOR LAYOUT COMPONENTS
// =============================================================================

/**
 * Component theme management with enhanced layout-specific colors
 */
class ComponentTheme {
    static themes = {
        light: {
            // Base colors
            background: '#ffffff',
            backgroundSecondary: '#f8f9fa',
            backgroundDisabled: '#e9ecef',
            text: '#212529',
            textSecondary: '#6c757d',
            disabled: '#adb5bd',
            
            // Interactive elements
            primary: '#007bff',
            primaryHover: '#0056b3',
            primaryText: '#ffffff',
            primaryBorder: '#0056b3',
            
            // Layout-specific colors
            border: '#dee2e6',
            borderActive: '#007bff',
            shadow: 'rgba(0, 0, 0, 0.1)',
            overlay: 'rgba(0, 0, 0, 0.5)',
            
            // Status colors
            success: '#28a745',
            successHover: '#218838',
            warning: '#ffc107',
            warningHover: '#e0a800',
            danger: '#dc3545',
            dangerHover: '#c82333',
            
            // Focus and selection
            focus: '#007bff',
            selection: '#e3f2fd',
            hover: '#f5f5f5',
            
            // Tab-specific colors
            tabBackground: '#f8f9fa',
            tabActive: '#ffffff',
            tabBorder: '#dee2e6',
            tabHover: '#e9ecef',
            
            // Tree-specific colors
            treeExpander: '#6c757d',
            treeSelected: '#007bff',
            treeHover: '#f8f9fa',
            
            // Progress colors
            progressTrack: '#e9ecef',
            progressFill: '#007bff',
            progressComplete: '#28a745',
            
            // Upload colors
            uploadBorder: '#007bff',
            uploadHover: '#e3f2fd',
            uploadError: '#dc3545'
        },
        
        dark: {
            // Base colors
            background: '#1a1a1a',
            backgroundSecondary: '#2d2d2d',
            backgroundDisabled: '#404040',
            text: '#ffffff',
            textSecondary: '#b3b3b3',
            disabled: '#666666',
            
            // Interactive elements
            primary: '#4dabf7',
            primaryHover: '#339af0',
            primaryText: '#000000',
            primaryBorder: '#339af0',
            
            // Layout-specific colors
            border: '#404040',
            borderActive: '#4dabf7',
            shadow: 'rgba(0, 0, 0, 0.3)',
            overlay: 'rgba(0, 0, 0, 0.7)',
            
            // Status colors
            success: '#51cf66',
            successHover: '#40c057',
            warning: '#ffd43b',
            warningHover: '#fab005',
            danger: '#ff6b6b',
            dangerHover: '#fa5252',
            
            // Focus and selection
            focus: '#4dabf7',
            selection: '#1c7ed6',
            hover: '#2d2d2d',
            
            // Tab-specific colors
            tabBackground: '#2d2d2d',
            tabActive: '#1a1a1a',
            tabBorder: '#404040',
            tabHover: '#333333',
            
            // Tree-specific colors
            treeExpander: '#b3b3b3',
            treeSelected: '#4dabf7',
            treeHover: '#2d2d2d',
            
            // Progress colors
            progressTrack: '#404040',
            progressFill: '#4dabf7',
            progressComplete: '#51cf66',
            
            // Upload colors
            uploadBorder: '#4dabf7',
            uploadHover: '#1c7ed6',
            uploadError: '#ff6b6b'
        },
        
        highContrast: {
            // Base colors
            background: '#000000',
            backgroundSecondary: '#1a1a1a',
            backgroundDisabled: '#333333',
            text: '#ffffff',
            textSecondary: '#cccccc',
            disabled: '#666666',
            
            // Interactive elements
            primary: '#ffffff',
            primaryHover: '#cccccc',
            primaryText: '#000000',
            primaryBorder: '#ffffff',
            
            // Layout-specific colors
            border: '#ffffff',
            borderActive: '#ffff00',
            shadow: 'rgba(255, 255, 255, 0.3)',
            overlay: 'rgba(0, 0, 0, 0.8)',
            
            // Status colors
            success: '#00ff00',
            successHover: '#00cc00',
            warning: '#ffff00',
            warningHover: '#cccc00',
            danger: '#ff0000',
            dangerHover: '#cc0000',
            
            // Focus and selection
            focus: '#ffff00',
            selection: '#0000ff',
            hover: '#333333',
            
            // Tab-specific colors
            tabBackground: '#1a1a1a',
            tabActive: '#000000',
            tabBorder: '#ffffff',
            tabHover: '#333333',
            
            // Tree-specific colors
            treeExpander: '#ffffff',
            treeSelected: '#ffff00',
            treeHover: '#333333',
            
            // Progress colors
            progressTrack: '#333333',
            progressFill: '#ffffff',
            progressComplete: '#00ff00',
            
            // Upload colors
            uploadBorder: '#ffffff',
            uploadHover: '#333333',
            uploadError: '#ff0000'
        }
    };
    
    static getCurrentTheme() {
        // Check for high contrast preference
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            return 'highContrast';
        }
        
        // Check for dark mode preference
        if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
            return 'dark';
        }
        
        return 'light';
    }
    
    static getColor(colorName, customTheme = null) {
        const theme = customTheme || this.getCurrentTheme();
        return this.themes[theme]?.[colorName] || this.themes.light[colorName] || '#000000';
    }
    
    static getAllColors(customTheme = null) {
        const theme = customTheme || this.getCurrentTheme();
        return { ...this.themes[theme] };
    }
}

/**
 * Enhanced performance monitoring for layout components
 */
class PerformanceMonitor {
    static instances = new Map();
    static measurements = new Map();
    
    static createInstance(componentId) {
        const instance = {
            startMeasurement: (operation) => this.startMeasurement(componentId, operation),
            endMeasurement: (operation) => this.endMeasurement(componentId, operation),
            getMetrics: () => this.getMetrics(componentId)
        };
        this.instances.set(componentId, instance);
        return instance;
    }
    
    static startMeasurement(componentId, operation) {
        const key = `${componentId}-${operation}`;
        this.measurements.set(key, {
            startTime: performance.now(),
            startMemory: this.getMemoryUsage()
        });
    }
    
    static endMeasurement(componentId, operation) {
        const key = `${componentId}-${operation}`;
        const start = this.measurements.get(key);
        
        if (start) {
            const endTime = performance.now();
            const endMemory = this.getMemoryUsage();
            
            const measurement = {
                duration: endTime - start.startTime,
                memoryDelta: endMemory - start.startMemory,
                timestamp: new Date().toISOString()
            };
            
            this.measurements.delete(key);
            
            // Log performance warnings
            if (measurement.duration > PERFORMANCE_THRESHOLDS.renderTime) {
                console.warn(`Performance warning: ${operation} took ${measurement.duration.toFixed(2)}ms in ${componentId}`);
            }
            
            return measurement;
        }
        
        return null;
    }
    
    static getMemoryUsage() {
        if ('memory' in performance) {
            return performance.memory.usedJSHeapSize;
        }
        return 0;
    }
    
    static getMetrics(componentId) {
        const measurements = Array.from(this.measurements.entries())
            .filter(([key]) => key.startsWith(componentId))
            .map(([key, value]) => ({ operation: key.split('-')[1], ...value }));
        
        return {
            activeOperations: measurements.length,
            totalMemory: this.getMemoryUsage()
        };
    }
}

/**
 * Enhanced component error handling
 */
class ComponentError extends Error {
    constructor(message, component, context = {}) {
        super(message);
        this.name = 'ComponentError';
        this.component = component;
        this.context = context;
        this.timestamp = new Date().toISOString();
        this.stack = (new Error()).stack;
    }
    
    static create(message, component, context) {
        return new ComponentError(message, component, context);
    }
    
    toString() {
        return `${this.name} in ${this.component}: ${this.message}`;
    }
}

/**
 * Enhanced animation manager for layout components
 */
class AnimationManager {
    static activeAnimations = new Map();
    static animationId = 0;
    
    static animate(target, from, to, options = {}) {
        const id = ++this.animationId;
        const animation = {
            id,
            target,
            from: { ...from },
            to: { ...to },
            duration: options.duration || ANIMATION_DEFAULTS.duration,
            easing: options.easing || ANIMATION_DEFAULTS.easing,
            startTime: performance.now(),
            onUpdate: options.onUpdate || (() => {}),
            onComplete: options.onComplete || (() => {})
        };
        
        this.activeAnimations.set(id, animation);
        this.runAnimation(animation);
        
        return id;
    }
    
    static runAnimation(animation) {
        const animate = () => {
            const elapsed = performance.now() - animation.startTime;
            const progress = Math.min(elapsed / animation.duration, 1);
            const easedProgress = this.applyEasing(progress, animation.easing);
            
            // Interpolate values
            const current = {};
            for (const key in animation.from) {
                const fromValue = animation.from[key];
                const toValue = animation.to[key];
                current[key] = fromValue + (toValue - fromValue) * easedProgress;
            }
            
            animation.onUpdate(current, progress);
            
            if (progress >= 1) {
                animation.onComplete();
                this.activeAnimations.delete(animation.id);
            } else {
                requestAnimationFrame(animate);
            }
        };
        
        animate();
    }
    
    static applyEasing(progress, easing) {
        const easings = {
            linear: t => t,
            easeIn: t => t * t,
            easeOut: t => 1 - Math.pow(1 - t, 2),
            easeInOut: t => t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t,
            easeOutCubic: t => 1 - Math.pow(1 - t, 3),
            bounce: t => {
                if (t < 1/2.75) return 7.5625 * t * t;
                if (t < 2/2.75) return 7.5625 * (t -= 1.5/2.75) * t + 0.75;
                if (t < 2.5/2.75) return 7.5625 * (t -= 2.25/2.75) * t + 0.9375;
                return 7.5625 * (t -= 2.625/2.75) * t + 0.984375;
            }
        };
        
        return easings[easing] ? easings[easing](progress) : progress;
    }
    
    static cancelAnimation(animationId) {
        this.activeAnimations.delete(animationId);
    }
    
    static cancelAllAnimations() {
        this.activeAnimations.clear();
    }
}

// Enhanced constants and defaults
const ANIMATION_DEFAULTS = {
    duration: 250,
    easing: 'easeOutCubic'
};

const ACCESSIBILITY_DEFAULTS = {
    announceDelay: 150,
    focusDelay: 100
};

const PERFORMANCE_THRESHOLDS = {
    renderTime: 16, // 60fps target
    eventThrottle: 16,
    memoryWarning: 50 * 1024 * 1024 // 50MB
};

// =============================================================================
// MODERN TAB CONTAINER COMPONENT
// =============================================================================

/**
 * Advanced TabContainer component with accessibility, drag-and-drop,
 * theme support, and modern interaction patterns.
 */
export class TabContainer extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 600,
            height: options.height || 400,
            ariaRole: 'tablist',
            ariaLabel: options.ariaLabel || 'Tab Container'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.tabs = options.tabs || [];
        this.activeTabIndex = options.activeTab || 0;
        this.tabHeight = options.tabHeight || 40;
        this.closeable = options.closeable !== false;
        this.reorderable = options.reorderable !== false;
        this.maxTabs = options.maxTabs || 20;
        this.disabled = options.disabled || false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // Enhanced state management
        this.hoveredTabIndex = -1;
        this.draggedTabIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
        this.focusedTabIndex = -1;
        this.isDragging = false;
        
        // Animation and performance
        this.animationState = {
            tabTransitions: new Map(),
            contentFade: 0
        };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('TabContainer');
        
        try {
            this.setupTabs();
            this.setupEventHandlers();
            this.setupAccessibility();
            this.setupResizeObserver();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.maxTabs && (typeof options.maxTabs !== 'number' || options.maxTabs < 1)) {
            throw new ComponentError('maxTabs must be a positive number', 'TabContainer');
        }
        
        if (options.tabHeight && (typeof options.tabHeight !== 'number' || options.tabHeight < 20)) {
            throw new ComponentError('tabHeight must be at least 20 pixels', 'TabContainer');
        }
        
        if (options.tabs && !Array.isArray(options.tabs)) {
            throw new ComponentError('tabs must be an array', 'TabContainer');
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
            'ArrowLeft': () => this.navigateTab(-1),
            'ArrowRight': () => this.navigateTab(1),
            'Home': () => this.navigateToTab('first'),
            'End': () => this.navigateToTab('last'),
            'Enter': () => this.activateFocusedTab(),
            'Space': () => this.activateFocusedTab(),
            'Delete': () => this.closeFocusedTab(),
            'Escape': () => this.handleEscape()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'TabContainer',
                    { context, originalError: error }
                );
                
                console.error('TabContainer Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'tab-management':
                this.validateTabState();
                break;
            case 'animation':
                this.animationState.tabTransitions.clear();
                AnimationManager.cancelAllAnimations();
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
        this.setAttribute('role', 'tablist');
        this.setAttribute('aria-multiselectable', 'false');
        this.setAttribute('aria-orientation', 'horizontal');
        
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
    
    setupTabs() {
        try {
            // Ensure we have at least one tab
            if (this.tabs.length === 0) {
                this.tabs.push({
                    id: 'default',
                    title: 'Tab 1',
                    content: 'Default content',
                    closeable: false
                });
            }
            
            // Normalize tab data with enhanced properties
            this.tabs = this.tabs.map((tab, index) => ({
                id: tab.id || `tab-${index}`,
                title: tab.title || `Tab ${index + 1}`,
                content: tab.content || '',
                closeable: tab.closeable !== false && this.closeable,
                icon: tab.icon || null,
                badge: tab.badge || null,
                disabled: tab.disabled || false,
                ariaControls: `tabpanel-${tab.id || index}`,
                ariaSelected: false,
                ...tab
            }));
            
            // Validate and clamp active tab index
            this.validateTabState();
            
            // Set up ARIA relationships
            this.updateTabAccessibility();
            
        } catch (error) {
            this.errorHandler.handle(error, 'tab-setup');
        }
    }
    
    validateTabState() {
        // Ensure we have valid tabs
        if (this.tabs.length === 0) {
            this.tabs.push({
                id: 'fallback',
                title: 'Default Tab',
                content: '',
                closeable: false
            });
        }
        
        // Clamp active tab index
        this.activeTabIndex = Math.max(0, Math.min(this.activeTabIndex, this.tabs.length - 1));
        
        // Ensure focused tab is valid
        if (this.focusedTabIndex >= this.tabs.length) {
            this.focusedTabIndex = this.activeTabIndex;
        }
    }
    
    updateTabAccessibility() {
        this.tabs.forEach((tab, index) => {
            tab.ariaSelected = index === this.activeTabIndex;
        });
    }
    
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'mouseMove': this.handleMouseMove.bind(this),
            'mouseDown': this.handleMouseDown.bind(this),
            'mouseUp': this.handleMouseUp.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced tab management with animations and accessibility
    async addTab(tabData, index = -1) {
        try {
            if (this.tabs.length >= this.maxTabs) {
                this.announceChange('Maximum number of tabs reached');
                return false;
            }
            
            const newTab = {
                id: tabData.id || `tab-${Date.now()}`,
                title: tabData.title || 'New Tab',
                content: tabData.content || '',
                closeable: tabData.closeable !== false && this.closeable,
                icon: tabData.icon || null,
                badge: tabData.badge || null,
                disabled: tabData.disabled || false,
                ariaControls: `tabpanel-${tabData.id || Date.now()}`,
                ariaSelected: false,
                ...tabData
            };
            
            let insertIndex;
            if (index >= 0 && index < this.tabs.length) {
                this.tabs.splice(index, 0, newTab);
                insertIndex = index;
                if (index <= this.activeTabIndex) {
                    this.activeTabIndex++;
                }
            } else {
                this.tabs.push(newTab);
                insertIndex = this.tabs.length - 1;
            }
            
            // Animate tab appearance
            if (!this.prefersReducedMotion()) {
                await this.animateTabInsertion(insertIndex);
            }
            
            this.updateTabAccessibility();
            this.clearRenderCache();
            
            this.announceChange(`Tab "${newTab.title}" added`);
            this.emit('tabAdded', { tab: newTab, index: insertIndex });
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'addTab');
            return false;
        }
    }
    
    async removeTab(index) {
        try {
            if (index < 0 || index >= this.tabs.length || this.tabs.length <= 1) {
                return false;
            }
            
            const removedTab = this.tabs[index];
            if (!removedTab.closeable) {
                this.announceChange('Tab cannot be closed');
                return false;
            }
            
            // Animate tab removal
            if (!this.prefersReducedMotion()) {
                await this.animateTabRemoval(index);
            }
            
            this.tabs.splice(index, 1);
            
            // Adjust active tab index
            if (index < this.activeTabIndex) {
                this.activeTabIndex--;
            } else if (index === this.activeTabIndex) {
                this.activeTabIndex = Math.min(this.activeTabIndex, this.tabs.length - 1);
            }
            
            // Adjust focused tab index
            if (this.focusedTabIndex >= this.tabs.length) {
                this.focusedTabIndex = Math.max(0, this.tabs.length - 1);
            }
            
            this.updateTabAccessibility();
            this.clearRenderCache();
            
            this.announceChange(`Tab "${removedTab.title}" removed`);
            this.emit('tabRemoved', { tab: removedTab, index });
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'removeTab');
            return false;
        }
    }
    
    async setActiveTab(index) {
        try {
            if (index >= 0 && index < this.tabs.length && !this.tabs[index].disabled) {
                const previousIndex = this.activeTabIndex;
                this.activeTabIndex = index;
                this.focusedTabIndex = index;
                
                // Animate content transition
                if (!this.prefersReducedMotion() && previousIndex !== index) {
                    await this.animateContentTransition(previousIndex, index);
                }
                
                this.updateTabAccessibility();
                this.clearRenderCache();
                
                const activeTab = this.tabs[index];
                this.announceChange(`Tab "${activeTab.title}" activated`);
                this.emit('tabChanged', { 
                    previousIndex, 
                    activeIndex: index, 
                    tab: activeTab 
                });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'setActiveTab');
        }
    }
    
    updateTab(index, updates) {
        try {
            if (index >= 0 && index < this.tabs.length) {
                const oldTab = { ...this.tabs[index] };
                Object.assign(this.tabs[index], updates);
                
                // Update ARIA if needed
                if (updates.title) {
                    this.announceChange(`Tab renamed to "${updates.title}"`);
                }
                
                this.clearRenderCache();
                this.emit('tabUpdated', { index, tab: this.tabs[index], updates, oldTab });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'updateTab');
        }
    }
    
    // Event Handlers
    handleClick(event) {
        const { localX, localY } = event;
        
        if (localY <= this.tabHeight) {
            const tabIndex = this.getTabIndexFromX(localX);
            
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                const tab = this.tabs[tabIndex];
                const tabBounds = this.getTabBounds(tabIndex);
                
                // Check if clicking close button
                if (tab.closeable && localX >= tabBounds.x + tabBounds.width - 20) {
                    this.removeTab(tabIndex);
                } else if (!tab.disabled) {
                    this.setActiveTab(tabIndex);
                }
            }
        }
    }
    
    handleMouseMove(event) {
        const { localX, localY } = event;
        
        if (localY <= this.tabHeight) {
            this.hoveredTabIndex = this.getTabIndexFromX(localX);
        } else {
            this.hoveredTabIndex = -1;
        }
        
        // Handle tab dragging
        if (this.draggedTabIndex >= 0 && this.reorderable) {
            const newIndex = this.getTabIndexFromX(localX);
            if (newIndex >= 0 && newIndex !== this.draggedTabIndex) {
                this.reorderTab(this.draggedTabIndex, newIndex);
                this.draggedTabIndex = newIndex;
            }
        }
    }
    
    handleMouseDown(event) {
        const { localX, localY } = event;
        
        if (localY <= this.tabHeight && this.reorderable) {
            const tabIndex = this.getTabIndexFromX(localX);
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                this.draggedTabIndex = tabIndex;
                this.dragOffset.x = localX - this.getTabBounds(tabIndex).x;
            }
        }
    }
    
    handleMouseUp(event) {
        this.draggedTabIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                if (this.activeTabIndex > 0) {
                    this.setActiveTab(this.activeTabIndex - 1);
                }
                break;
            case 'ArrowRight':
                if (this.activeTabIndex < this.tabs.length - 1) {
                    this.setActiveTab(this.activeTabIndex + 1);
                }
                break;
            case 'Home':
                this.setActiveTab(0);
                break;
            case 'End':
                this.setActiveTab(this.tabs.length - 1);
                break;
            case 'Delete':
                if (this.tabs[this.activeTabIndex]?.closeable) {
                    this.removeTab(this.activeTabIndex);
                }
                break;
        }
    }
    
    // Utility Methods
    getTabIndexFromX(x) {
        const tabWidth = this.width / this.tabs.length;
        return Math.floor(x / tabWidth);
    }
    
    getTabBounds(index) {
        const tabWidth = this.width / this.tabs.length;
        return {
            x: index * tabWidth,
            y: 0,
            width: tabWidth,
            height: this.tabHeight
        };
    }
    
    reorderTab(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        const tab = this.tabs.splice(fromIndex, 1)[0];
        this.tabs.splice(toIndex, 0, tab);
        
        // Update active tab index
        if (this.activeTabIndex === fromIndex) {
            this.activeTabIndex = toIndex;
        } else if (fromIndex < this.activeTabIndex && toIndex >= this.activeTabIndex) {
            this.activeTabIndex--;
        } else if (fromIndex > this.activeTabIndex && toIndex <= this.activeTabIndex) {
            this.activeTabIndex++;
        }
        
        this.emit('tabReordered', { fromIndex, toIndex, tab });
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        this.renderTabHeaders(renderer);
        this.renderActiveContent(renderer);
    }
    
    renderTabHeaders(renderer) {
        const tabWidth = this.width / this.tabs.length;
        
        this.tabs.forEach((tab, index) => {
            const bounds = this.getTabBounds(index);
            const isActive = index === this.activeTabIndex;
            const isHovered = index === this.hoveredTabIndex;
            
            // Tab background
            let backgroundColor = this.tabBackgroundColor;
            if (isActive) {
                backgroundColor = this.activeTabColor;
            } else if (isHovered) {
                backgroundColor = '#e9ecef';
            }
            
            renderer.fillStyle = backgroundColor;
            renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            
            // Tab border
            renderer.strokeStyle = this.tabBorderColor;
            renderer.lineWidth = 1;
            renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            
            // Active tab indicator
            if (isActive) {
                renderer.fillStyle = '#007bff';
                renderer.fillRect(bounds.x, bounds.y + bounds.height - 3, bounds.width, 3);
            }
            
            // Tab content
            const contentX = bounds.x + 10;
            let textX = contentX;
            
            // Icon
            if (tab.icon) {
                renderer.fillStyle = tab.disabled ? '#999999' : '#333333';
                renderer.font = '14px Arial';
                renderer.textAlign = 'left';
                renderer.fillText(tab.icon, textX, bounds.y + bounds.height / 2 + 2);
                textX += 20;
            }
            
            // Title
            renderer.fillStyle = tab.disabled ? '#999999' : '#333333';
            renderer.font = isActive ? 'bold 12px Arial' : '12px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
              const maxTextWidth = bounds.width - (textX - bounds.x) - 30;
            let title = tab.title;
            const titleWidth = renderer.measureText(title).width;
            if (titleWidth > maxTextWidth) {
                const ellipsis = '...';
                const ellipsisWidth = renderer.measureText(ellipsis).width;
                const availableWidth = maxTextWidth - ellipsisWidth;
                
                // Binary search for optimal length
                let left = 0;
                let right = title.length;
                while (left < right) {
                    const mid = Math.floor((left + right + 1) / 2);
                    if (renderer.measureText(title.substring(0, mid)).width <= availableWidth) {
                        left = mid;
                    } else {
                        right = mid - 1;
                    }
                }
                title = title.substring(0, left) + ellipsis;
            }
            
            renderer.fillText(title, textX, bounds.y + bounds.height / 2);
            
            // Badge
            if (tab.badge) {
                const badgeX = bounds.x + bounds.width - 35;
                const badgeY = bounds.y + 5;
                
                renderer.fillStyle = '#dc3545';
                renderer.beginPath();
                renderer.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
                renderer.fill();
                
                renderer.fillStyle = '#ffffff';
                renderer.font = 'bold 10px Arial';
                renderer.textAlign = 'center';
                renderer.fillText(tab.badge, badgeX, badgeY + 1);
            }
            
            // Close button
            if (tab.closeable) {
                const closeX = bounds.x + bounds.width - 15;
                const closeY = bounds.y + bounds.height / 2;
                
                renderer.fillStyle = isHovered ? '#dc3545' : '#666666';
                renderer.font = '12px Arial';
                renderer.textAlign = 'center';
                renderer.fillText('×', closeX, closeY);
            }
        });
    }
    
    renderActiveContent(renderer) {
        const contentY = this.tabHeight;
        const contentHeight = this.height - this.tabHeight;
        
        // Content background
        renderer.fillStyle = this.contentBackgroundColor;
        renderer.fillRect(0, contentY, this.width, contentHeight);
        
        // Content border
        renderer.strokeStyle = this.tabBorderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(0, contentY, this.width, contentHeight);
        
        // Active tab content
        if (this.activeTabIndex >= 0 && this.activeTabIndex < this.tabs.length) {
            const activeTab = this.tabs[this.activeTabIndex];
            
            if (typeof activeTab.content === 'string') {
                renderer.fillStyle = '#333333';
                renderer.font = '14px Arial';
                renderer.textAlign = 'left';
                renderer.textBaseline = 'top';
                renderer.fillText(activeTab.content, 20, contentY + 20);
            }
            // If content is a component/object, it should render itself
        }
    }
      // Animation methods
    async animateTabInsertion(index) {
        const duration = 300;
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeOutCubic',
            onUpdate: (progress) => {
                this.animationState.tabTransitions.set(index, {
                    type: 'insert',
                    progress,
                    scale: 0.8 + (0.2 * progress),
                    opacity: progress
                });
                this.invalidate();
            },
            onComplete: () => {
                this.animationState.tabTransitions.delete(index);
                this.invalidate();
            }
        });
        
        return animation.start();
    }
    
    async animateTabRemoval(index) {
        const duration = 200;
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeInCubic',
            onUpdate: (progress) => {
                this.animationState.tabTransitions.set(index, {
                    type: 'remove',
                    progress: 1 - progress,
                    scale: 1 - (0.2 * progress),
                    opacity: 1 - progress
                });
                this.invalidate();
            },
            onComplete: () => {
                this.animationState.tabTransitions.delete(index);
                this.invalidate();
            }
        });
        
        return animation.start();
    }
    
    async animateContentTransition(fromIndex, toIndex) {
        const duration = 250;
        this.animationState.contentFade = 1;
        
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeInOutCubic',
            onUpdate: (progress) => {
                this.animationState.contentFade = progress < 0.5 ? 
                    1 - (progress * 2) : (progress - 0.5) * 2;
                this.invalidate();
            },
            onComplete: () => {
                this.animationState.contentFade = 1;
                this.invalidate();
            }
        });
        
        return animation.start();
    }
    
    // Focus and keyboard navigation
    navigateTab(direction) {
        const newIndex = this.focusedTabIndex + direction;
        if (newIndex >= 0 && newIndex < this.tabs.length) {
            this.focusedTabIndex = newIndex;
            this.updateFocusVisuals();
        }
    }
    
    navigateToTab(position) {
        switch (position) {
            case 'first':
                this.focusedTabIndex = 0;
                break;
            case 'last':
                this.focusedTabIndex = this.tabs.length - 1;
                break;
        }
        this.updateFocusVisuals();
    }
    
    activateFocusedTab() {
        if (this.focusedTabIndex >= 0 && this.focusedTabIndex < this.tabs.length) {
            this.setActiveTab(this.focusedTabIndex);
        }
    }
    
    closeFocusedTab() {
        if (this.focusedTabIndex >= 0 && this.focusedTabIndex < this.tabs.length) {
            const tab = this.tabs[this.focusedTabIndex];
            if (tab.closeable) {
                this.removeTab(this.focusedTabIndex);
            }
        }
    }
    
    handleEscape() {
        this.focusedTabIndex = this.activeTabIndex;
        this.updateFocusVisuals();
    }
    
    updateFocusVisuals() {
        this.invalidate();
        
        // Update screen reader announcement
        if (this.focusedTabIndex >= 0 && this.focusedTabIndex < this.tabs.length) {
            const tab = this.tabs[this.focusedTabIndex];
            this.announceChange(`Focused on tab "${tab.title}"`);
        }
    }
    
    handleFocusIn() {
        if (this.focusedTabIndex === -1) {
            this.focusedTabIndex = this.activeTabIndex;
        }
        this.updateFocusVisuals();
    }
    
    handleFocusOut() {
        // Keep focused tab for keyboard users
        this.updateFocusVisuals();
    }
    
    // Utility methods
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    prefersReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    clearRenderCache() {
        this.renderCache.clear();
        this.invalidate();
    }
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    reset() {
        this.activeTabIndex = 0;
        this.focusedTabIndex = 0;
        this.hoveredTabIndex = -1;
        this.draggedTabIndex = -1;
        this.animationState.tabTransitions.clear();
        this.animationState.contentFade = 1;
        this.clearRenderCache();
        this.validateTabState();
    }
    
    destroy() {
        // Clean up resources
        if (this.resizeObserver) {
            this.resizeObserver.disconnect();
        }
        
        if (this.announcer && this.announcer.parentNode) {
            this.announcer.parentNode.removeChild(this.announcer);
        }
        
        this.animationState.tabTransitions.clear();
        AnimationManager.cancelAllAnimations();
        this.renderCache.clear();
        
        super.destroy();
    }
    
    // Public API
    getActiveTab() {
        return this.tabs[this.activeTabIndex];
    }
    
    getTabById(id) {
        return this.tabs.find(tab => tab.id === id);
    }
    
    getTabIndex(id) {
        return this.tabs.findIndex(tab => tab.id === id);
    }
    
    getTabs() {
        return [...this.tabs];
    }
    
    getTabCount() {
        return this.tabs.length;
    }
    
    isTabCloseable(index) {
        return this.tabs[index]?.closeable || false;
    }
    
    setTabCloseable(index, closeable) {
        if (this.tabs[index]) {
            this.tabs[index].closeable = closeable;
            this.clearRenderCache();
        }
    }
    
    setTheme(theme) {
        this.theme = theme;
        this.clearRenderCache();
        this.emit('themeChanged', { theme });
    }
}

// =============================================================================
// PROGRESS STEPPER COMPONENT
// =============================================================================

/**
 * Advanced ProgressStepper component with accessibility, animations,
 * theme support, and modern interaction patterns.
 */
export class ProgressStepper extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 600,
            height: options.height || 80,
            ariaRole: 'progressbar',
            ariaLabel: options.ariaLabel || 'Progress Steps'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.steps = options.steps || [];
        this.currentStep = Math.max(0, Math.min(options.currentStep || 0, this.steps.length - 1));
        this.orientation = options.orientation || 'horizontal';
        this.allowStepClick = options.allowStepClick !== false;
        this.showStepNumbers = options.showStepNumbers !== false;
        this.showLabels = options.showLabels !== false;
        this.disabled = options.disabled || false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // Enhanced state management
        this.hoveredStepIndex = -1;
        this.focusedStepIndex = -1;
        this.animatingSteps = new Set();
        this.progressPercentage = 0;
        
        // Animation and performance
        this.animationState = {
            stepTransitions: new Map(),
            progressAnimation: null
        };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('ProgressStepper');
        
        try {
            this.setupSteps();
            this.setupEventHandlers();
            this.setupAccessibility();
            this.updateProgress();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.currentStep && (typeof options.currentStep !== 'number' || options.currentStep < 0)) {
            throw new ComponentError('currentStep must be a non-negative number', 'ProgressStepper');
        }
        
        if (options.orientation && !['horizontal', 'vertical'].includes(options.orientation)) {
            throw new ComponentError('orientation must be "horizontal" or "vertical"', 'ProgressStepper');
        }
        
        if (options.steps && !Array.isArray(options.steps)) {
            throw new ComponentError('steps must be an array', 'ProgressStepper');
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
            'ArrowLeft': () => this.navigateStep(-1),
            'ArrowRight': () => this.navigateStep(1),
            'ArrowUp': () => this.navigateStep(-1),
            'ArrowDown': () => this.navigateStep(1),
            'Home': () => this.navigateToStep('first'),
            'End': () => this.navigateToStep('last'),
            'Enter': () => this.activateFocusedStep(),
            'Space': () => this.activateFocusedStep(),
            'Escape': () => this.handleEscape()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'ProgressStepper',
                    { context, originalError: error }
                );
                
                console.error('ProgressStepper Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'step-management':
                this.validateStepState();
                break;
            case 'animation':
                this.animationState.stepTransitions.clear();
                this.animatingSteps.clear();
                AnimationManager.cancelAllAnimations();
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
        this.setAttribute('role', 'progressbar');
        this.setAttribute('aria-valuemin', '0');
        this.setAttribute('aria-valuemax', this.steps.length - 1);
        this.setAttribute('aria-valuenow', this.currentStep);
        this.setAttribute('aria-valuetext', this.getStepDescription(this.currentStep));
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupSteps() {
        try {
            // Ensure we have at least one step
            if (this.steps.length === 0) {
                this.steps.push({
                    id: 'default',
                    title: 'Step 1',
                    description: 'Default step',
                    completed: false
                });
            }
            
            // Normalize step data
            this.steps = this.steps.map((step, index) => ({
                id: step.id || `step-${index}`,
                title: step.title || `Step ${index + 1}`,
                description: step.description || '',
                completed: step.completed || false,
                disabled: step.disabled || false,
                icon: step.icon || null,
                optional: step.optional || false,
                ...step
            }));
            
            // Validate and clamp current step
            this.validateStepState();
            
            // Update accessibility
            this.updateStepAccessibility();
            
        } catch (error) {
            this.errorHandler.handle(error, 'step-setup');
        }
    }
    
    validateStepState() {
        // Ensure we have valid steps
        if (this.steps.length === 0) {
            this.steps.push({
                id: 'fallback',
                title: 'Default Step',
                description: '',
                completed: false
            });
        }
        
        // Clamp current step
        this.currentStep = Math.max(0, Math.min(this.currentStep, this.steps.length - 1));
        
        // Ensure focused step is valid
        if (this.focusedStepIndex >= this.steps.length) {
            this.focusedStepIndex = this.currentStep;
        }
    }
    
    updateStepAccessibility() {
        this.setAttribute('aria-valuenow', this.currentStep);
        this.setAttribute('aria-valuetext', this.getStepDescription(this.currentStep));
        
        // Calculate progress percentage
        this.progressPercentage = this.steps.length > 1 ? 
            (this.currentStep / (this.steps.length - 1)) * 100 : 100;
    }
    
    getStepDescription(index) {
        if (index >= 0 && index < this.steps.length) {
            const step = this.steps[index];
            const status = step.completed ? 'completed' : 
                          index === this.currentStep ? 'current' : 'pending';
            return `${step.title}, ${status}. ${step.description || ''}`.trim();
        }
        return '';
    }
    
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'mouseMove': this.handleMouseMove.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
          Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced step management with animations and accessibility
    async goToStep(stepIndex) {
        try {
            if (stepIndex >= 0 && stepIndex < this.steps.length) {
                const step = this.steps[stepIndex];
                if (!step.disabled && (this.allowStepClick || stepIndex <= this.getLastCompletedStep() + 1)) {
                    const previousStep = this.currentStep;
                    this.currentStep = stepIndex;
                    this.focusedStepIndex = stepIndex;
                    
                    // Animate step transition
                    if (!this.prefersReducedMotion() && previousStep !== stepIndex) {
                        await this.animateStepTransition(previousStep, stepIndex);
                    }
                    
                    this.updateProgress();
                    this.updateStepAccessibility();
                    this.clearRenderCache();
                    
                    this.announceChange(`Moved to ${step.title}`);
                    this.emit('stepChanged', { 
                        previousStep, 
                        currentStep: stepIndex, 
                        step: this.steps[stepIndex] 
                    });
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'goToStep');
        }
    }
    
    async nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            await this.goToStep(this.currentStep + 1);
        }
    }
    
    async previousStep() {
        if (this.currentStep > 0) {
            await this.goToStep(this.currentStep - 1);
        }
    }
    
    async completeStep(stepIndex = this.currentStep) {
        try {
            if (stepIndex >= 0 && stepIndex < this.steps.length) {
                this.steps[stepIndex].completed = true;
                
                // Animate completion
                if (!this.prefersReducedMotion()) {
                    await this.animateStepCompletion(stepIndex);
                }
                
                this.updateProgress();
                this.clearRenderCache();
                
                const step = this.steps[stepIndex];
                this.announceChange(`${step.title} completed`);
                this.emit('stepCompleted', { 
                    stepIndex, 
                    step: this.steps[stepIndex] 
                });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'completeStep');
        }
    }
    
    getLastCompletedStep() {
        for (let i = this.steps.length - 1; i >= 0; i--) {
            if (this.steps[i].completed) {
                return i;
            }
        }
        return -1;
    }
    
    getStepStatus(index) {
        const step = this.steps[index];
        if (step.completed) return 'completed';
        if (index === this.currentStep) return 'active';
        if (step.disabled) return 'disabled';
        return 'inactive';
    }
    
    // Animation methods
    async animateStepTransition(fromIndex, toIndex) {
        const duration = 300;
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeOutCubic',
            onUpdate: (progress) => {
                this.animationState.stepTransitions.set('transition', {
                    fromIndex,
                    toIndex,
                    progress
                });
                this.invalidate();
            },
            onComplete: () => {
                this.animationState.stepTransitions.delete('transition');
                this.invalidate();
            }
        });
        
        return animation.start();
    }
    
    async animateStepCompletion(index) {
        const duration = 500;
        this.animatingSteps.add(index);
        
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeOutElastic',
            onUpdate: (progress) => {
                this.animationState.stepTransitions.set(`completion-${index}`, {
                    type: 'complete',
                    index,
                    progress,
                    scale: 1 + (0.2 * Math.sin(progress * Math.PI))
                });
                this.invalidate();
            },
            onComplete: () => {
                this.animationState.stepTransitions.delete(`completion-${index}`);
                this.animatingSteps.delete(index);
                this.invalidate();
            }
        });
        
        return animation.start();
    }
    
    updateProgress() {
        const completedSteps = this.steps.filter(step => step.completed).length;
        this.progressPercentage = this.steps.length > 0 ? 
            (completedSteps / this.steps.length) * 100 : 0;
        
        // Animate progress if not in reduced motion mode
        if (!this.prefersReducedMotion() && this.animationState.progressAnimation) {
            AnimationManager.cancelAnimation(this.animationState.progressAnimation);
        }
        
        if (!this.prefersReducedMotion()) {
            const currentProgress = this.getAttribute('aria-valuenow') || 0;
            const targetProgress = this.currentStep;
            
            this.animationState.progressAnimation = AnimationManager.createAnimation({
                duration: 400,
                easing: 'easeOutCubic',
                onUpdate: (progress) => {
                    const value = currentProgress + (targetProgress - currentProgress) * progress;
                    this.setAttribute('aria-valuenow', Math.round(value));
                },
                onComplete: () => {
                    this.animationState.progressAnimation = null;
                }
            });
            
            this.animationState.progressAnimation.start();
        } else {
            this.setAttribute('aria-valuenow', this.currentStep);
        }
    }
    
    // Event handlers
    handleClick(event) {
        try {
            if (!this.allowStepClick || this.disabled) return;
            
            const stepIndex = this.getStepIndexFromPosition(event.localX, event.localY);
            if (stepIndex >= 0) {
                this.goToStep(stepIndex);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'handleClick');
        }
    }
    
    handleMouseMove(event) {
        const stepIndex = this.getStepIndexFromPosition(event.localX, event.localY);
        
        if (stepIndex !== this.hoveredStepIndex) {
            this.hoveredStepIndex = stepIndex;
            this.invalidate();
        }
    }
    
    handleKeyDown(event) {
        if (this.disabled) return;
        
        const handler = this.keyboardHandler[event.key];
        if (handler) {
            event.preventDefault();
            handler();
        }
    }
    
    handleFocus() {
        if (this.focusedStepIndex === -1) {
            this.focusedStepIndex = this.currentStep;
        }
        this.invalidate();
    }
    
    handleBlur() {
        this.invalidate();
    }
    
    // Focus and keyboard navigation
    navigateStep(direction) {
        const newIndex = this.focusedStepIndex + direction;
        if (newIndex >= 0 && newIndex < this.steps.length) {
            this.focusedStepIndex = newIndex;
            this.updateFocusVisuals();
        }
    }
    
    navigateToStep(position) {
        switch (position) {
            case 'first':
                this.focusedStepIndex = 0;
                break;
            case 'last':
                this.focusedStepIndex = this.steps.length - 1;
                break;
        }
        this.updateFocusVisuals();
    }
    
    activateFocusedStep() {
        if (this.focusedStepIndex >= 0 && this.focusedStepIndex < this.steps.length) {
            this.goToStep(this.focusedStepIndex);
        }
    }
    
    handleEscape() {
        this.focusedStepIndex = this.currentStep;
        this.updateFocusVisuals();
    }
    
    updateFocusVisuals() {
        this.invalidate();
        
        if (this.focusedStepIndex >= 0 && this.focusedStepIndex < this.steps.length) {
            const step = this.steps[this.focusedStepIndex];
            this.announceChange(`Focused on ${step.title}`);
        }
    }
    
    handleFocusIn() {
        if (this.focusedStepIndex === -1) {
            this.focusedStepIndex = this.currentStep;
        }
        this.updateFocusVisuals();
    }
    
    handleFocusOut() {
        this.updateFocusVisuals();
    }
    
    getStepIndexFromPosition(x, y) {
        try {
            if (this.orientation === 'horizontal') {
                const stepWidth = this.width / this.steps.length;
                const stepIndex = Math.floor(x / stepWidth);
                return stepIndex >= 0 && stepIndex < this.steps.length ? stepIndex : -1;
            } else {
                const stepHeight = this.height / this.steps.length;
                const stepIndex = Math.floor(y / stepHeight);
                return stepIndex >= 0 && stepIndex < this.steps.length ? stepIndex : -1;
            }
        } catch (error) {
            this.errorHandler.handle(error, 'getStepIndexFromPosition');
            return -1;
        }
    }
    
    // Enhanced rendering with theme support
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        try {
            const theme = ComponentTheme.themes[this.theme];
            
            if (this.orientation === 'horizontal') {
                this.renderHorizontalStepper(renderer, theme);
            } else {
                this.renderVerticalStepper(renderer, theme);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    renderHorizontalStepper(renderer, theme) {
        const stepWidth = this.width / this.steps.length;
        const centerY = this.height / 2;
        const circleRadius = 15;
        const lineY = centerY;
        
        // Draw connecting lines with enhanced styling
        for (let i = 0; i < this.steps.length - 1; i++) {
            const startX = (i + 1) * stepWidth - stepWidth / 2 + circleRadius;
            const endX = (i + 1) * stepWidth + stepWidth / 2 - circleRadius;
            
            const isCompleted = this.steps[i].completed && this.steps[i + 1].completed;
            const isActive = i === this.currentStep - 1 || i === this.currentStep;
            
            // Line gradient for better visual appeal
            const gradient = renderer.createLinearGradient(startX, lineY, endX, lineY);
            if (isCompleted) {
                gradient.addColorStop(0, theme.progressComplete);
                gradient.addColorStop(1, theme.progressComplete);
            } else if (isActive) {
                gradient.addColorStop(0, theme.progressFill);
                gradient.addColorStop(1, theme.border);
            } else {
                gradient.addColorStop(0, theme.progressTrack);
                gradient.addColorStop(1, theme.progressTrack);
            }
            
            renderer.strokeStyle = gradient;
            renderer.lineWidth = 3;
            renderer.lineCap = 'round';
            renderer.beginPath();
            renderer.moveTo(startX, lineY);
            renderer.lineTo(endX, lineY);
            renderer.stroke();
        }
        
        // Draw steps with enhanced visual effects
        this.steps.forEach((step, index) => {
            const centerX = (index + 0.5) * stepWidth;
            const status = this.getStepStatus(index);
            const isHovered = index === this.hoveredStepIndex;
            const isFocused = index === this.focusedStepIndex;
            
            // Animation effects
            let scale = 1;
            let opacity = 1;
            const completionAnim = this.animationState.stepTransitions.get(`completion-${index}`);
            if (completionAnim) {
                scale = completionAnim.scale;
            }
            
            const currentRadius = circleRadius * scale;
            
            // Step circle with theme colors
            let fillColor = theme.progressTrack;
            let strokeColor = theme.border;
            let textColor = theme.textSecondary;
            
            switch (status) {
                case 'completed':
                    fillColor = theme.progressComplete;
                    strokeColor = theme.progressComplete;
                    textColor = theme.background;
                    break;
                case 'active':
                    fillColor = theme.progressFill;
                    strokeColor = theme.progressFill;
                    textColor = theme.background;
                    break;
                case 'disabled':
                    fillColor = theme.backgroundDisabled;
                    strokeColor = theme.disabled;
                    textColor = theme.disabled;
                    break;
            }
            
            // Hover and focus effects
            if (isHovered && !step.disabled) {
                fillColor = this.lightenColor(fillColor, 0.1);
            }
            
            // Focus ring
            if (isFocused) {
                renderer.strokeStyle = theme.focus;
                renderer.lineWidth = 3;
                renderer.beginPath();
                renderer.arc(centerX, centerY, currentRadius + 4, 0, Math.PI * 2);
                renderer.stroke();
            }
            
            // Main circle
            renderer.fillStyle = fillColor;
            renderer.strokeStyle = strokeColor;
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.arc(centerX, centerY, currentRadius, 0, Math.PI * 2);
            renderer.fill();
            renderer.stroke();
            
            // Step content with better typography
            if (step.completed) {
                renderer.fillStyle = textColor;
                renderer.font = 'bold 14px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText('✓', centerX, centerY);
            } else if (this.showStepNumbers) {
                renderer.fillStyle = textColor;
                renderer.font = 'bold 12px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText((index + 1).toString(), centerX, centerY);
            } else if (step.icon) {
                renderer.fillStyle = textColor;
                renderer.font = '14px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText(step.icon, centerX, centerY);
            }
            
            // Enhanced step labels
            if (this.showLabels && step.title) {
                renderer.fillStyle = status === 'active' ? theme.text : theme.textSecondary;
                renderer.font = status === 'active' ? 'bold 11px Arial' : '11px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'top';
                
                // Truncate long titles
                const maxWidth = stepWidth - 10;
                let title = step.title;
                if (renderer.measureText(title).width > maxWidth) {
                    while (renderer.measureText(title + '...').width > maxWidth && title.length > 0) {
                        title = title.slice(0, -1);
                    }
                    title += '...';
                }
                
                renderer.fillText(title, centerX, centerY + currentRadius + 10);
                
                // Optional indicator
                if (step.optional) {
                    renderer.fillStyle = theme.textSecondary;
                    renderer.font = '9px Arial';
                    renderer.fillText('(optional)', centerX, centerY + currentRadius + 25);
                }
            }
        });
    }
    
    renderVerticalStepper(renderer, theme) {
        const stepHeight = this.height / this.steps.length;
        const centerX = 30;
        const circleRadius = 12;
        
        // Similar implementation to horizontal but with vertical layout
        // Draw connecting lines
        for (let i = 0; i < this.steps.length - 1; i++) {
            const startY = (i + 1) * stepHeight - stepHeight / 2 + circleRadius;
            const endY = (i + 1) * stepHeight + stepHeight / 2 - circleRadius;
            
            const isCompleted = this.steps[i].completed && this.steps[i + 1].completed;
            renderer.strokeStyle = isCompleted ? theme.progressComplete : theme.progressTrack;
            renderer.lineWidth = 3;
            renderer.lineCap = 'round';
            renderer.beginPath();
            renderer.moveTo(centerX, startY);
            renderer.lineTo(centerX, endY);
            renderer.stroke();
        }
        
        // Draw steps
        this.steps.forEach((step, index) => {
            const centerY = (index + 0.5) * stepHeight;
            const status = this.getStepStatus(index);
            const isHovered = index === this.hoveredStepIndex;
            const isFocused = index === this.focusedStepIndex;
            
            // Colors based on status and theme
            let fillColor = theme.progressTrack;
            let strokeColor = theme.border;
            let textColor = theme.textSecondary;
            
            switch (status) {
                case 'completed':
                    fillColor = theme.progressComplete;
                    strokeColor = theme.progressComplete;
                    textColor = theme.background;
                    break;
                case 'active':
                    fillColor = theme.progressFill;
                    strokeColor = theme.progressFill;
                    textColor = theme.background;
                    break;
                case 'disabled':
                    fillColor = theme.backgroundDisabled;
                    strokeColor = theme.disabled;
                    textColor = theme.disabled;
                    break;
            }
            
            if (isHovered && !step.disabled) {
                fillColor = this.lightenColor(fillColor, 0.1);
            }
            
            // Focus ring
            if (isFocused) {
                renderer.strokeStyle = theme.focus;
                renderer.lineWidth = 3;
                renderer.beginPath();
                renderer.arc(centerX, centerY, circleRadius + 3, 0, Math.PI * 2);
                renderer.stroke();
            }
            
            // Main circle
            renderer.fillStyle = fillColor;
            renderer.strokeStyle = strokeColor;
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            renderer.fill();
            renderer.stroke();
            
            // Step content
            if (step.completed) {
                renderer.fillStyle = textColor;
                renderer.font = 'bold 12px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText('✓', centerX, centerY);
            } else if (this.showStepNumbers) {
                renderer.fillStyle = textColor;
                renderer.font = 'bold 10px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText((index + 1).toString(), centerX, centerY);
            }
            
            // Labels and descriptions
            if (this.showLabels && step.title) {
                renderer.fillStyle = status === 'active' ? theme.text : theme.textSecondary;
                renderer.font = status === 'active' ? 'bold 12px Arial' : '12px Arial';
                renderer.textAlign = 'left';
                renderer.textBaseline = 'middle';
                renderer.fillText(step.title, centerX + circleRadius + 15, centerY - 5);
                
                if (step.description) {
                    renderer.fillStyle = theme.textSecondary;
                    renderer.font = '10px Arial';
                    renderer.fillText(step.description, centerX + circleRadius + 15, centerY + 10);
                }
                
                if (step.optional) {
                    renderer.fillStyle = theme.textSecondary;
                    renderer.font = 'italic 9px Arial';
                    renderer.fillText('(optional)', centerX + circleRadius + 15, centerY + 20);
                }
            }
        });
    }
    
    // Utility methods
    lightenColor(color, amount) {
        const num = parseInt(color.replace("#", ""), 16);
        const r = Math.min(255, Math.floor((num >> 16) + amount * 255));
        const g = Math.min(255, Math.floor(((num >> 8) & 0x00FF) + amount * 255));
        const b = Math.min(255, Math.floor((num & 0x0000FF) + amount * 255));
        return `rgb(${r}, ${g}, ${b})`;
    }
    
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    prefersReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    clearRenderCache() {
        this.renderCache.clear();
        this.invalidate();
    }
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    reset() {
        this.currentStep = 0;
        this.focusedStepIndex = 0;
        this.hoveredStepIndex = -1;
        this.animatingSteps.clear();
        this.animationState.stepTransitions.clear();
        
        this.steps.forEach(step => {
            step.completed = false;
        });
        
        this.updateProgress();
        this.updateStepAccessibility();
        this.clearRenderCache();
        
        this.announceChange('Progress reset');
        this.emit('reset');
    }
    
    destroy() {
        // Clean up resources
        if (this.announcer && this.announcer.parentNode) {
            this.announcer.parentNode.removeChild(this.announcer);
        }
        
        this.animationState.stepTransitions.clear();
        this.animatingSteps.clear();
        AnimationManager.cancelAllAnimations();
        this.renderCache.clear();
        
        super.destroy();
    }
    
    // Public API
    getCurrentStep() {
        return this.steps[this.currentStep];
    }
    
    getProgress() {
        const completedSteps = this.steps.filter(step => step.completed).length;
        return this.steps.length > 0 ? completedSteps / this.steps.length : 0;
    }
    
    getProgressPercentage() {
        return this.progressPercentage;
    }
    
    getSteps() {
        return [...this.steps];
    }
    
    getStepCount() {
        return this.steps.length;
    }
    
    addStep(stepData, index = -1) {
        try {
            const newStep = {
                id: stepData.id || `step-${Date.now()}`,
                title: stepData.title || 'New Step',
                description: stepData.description || '',
                completed: stepData.completed || false,
                disabled: stepData.disabled || false,
                icon: stepData.icon || null,
                optional: stepData.optional || false,
                ...stepData
            };
            
            if (index >= 0 && index < this.steps.length) {
                this.steps.splice(index, 0, newStep);
                if (index <= this.currentStep) {
                    this.currentStep++;
                }
            } else {
                this.steps.push(newStep);
            }
            
            this.validateStepState();
            this.updateStepAccessibility();
            this.clearRenderCache();
            
            this.emit('stepAdded', { step: newStep, index: index >= 0 ? index : this.steps.length - 1 });
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'addStep');
            return false;
        }
    }
    
    removeStep(index) {
        try {
            if (index >= 0 && index < this.steps.length && this.steps.length > 1) {
                const removedStep = this.steps.splice(index, 1)[0];
                
                if (index < this.currentStep) {
                    this.currentStep--;
                } else if (index === this.currentStep && this.currentStep >= this.steps.length) {
                    this.currentStep = this.steps.length - 1;
                }
                
                this.validateStepState();
                this.updateStepAccessibility();
                this.clearRenderCache();
                
                this.emit('stepRemoved', { step: removedStep, index });
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handle(error, 'removeStep');
            return false;
        }
    }
    
    updateStep(index, updates) {
        try {
            if (index >= 0 && index < this.steps.length) {
                const oldStep = { ...this.steps[index] };
                Object.assign(this.steps[index], updates);
                
                this.clearRenderCache();
                this.emit('stepUpdated', { index, step: this.steps[index], updates, oldStep });
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handle(error, 'updateStep');
            return false;
        }
    }
    
    setTheme(theme) {
        this.theme = theme;        this.clearRenderCache();
        this.emit('themeChanged', { theme });
    }
}

// =============================================================================
// SPLIT PANE COMPONENT
// =============================================================================

/**
 * Advanced SplitPane component with accessibility, animations,
 * theme support, and modern interaction patterns.
 */
export class SplitPane extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 600,
            height: options.height || 400,
            ariaRole: 'separator',
            ariaLabel: options.ariaLabel || 'Split Pane'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.orientation = options.orientation || 'horizontal';
        this.split = Math.max(0.1, Math.min(0.9, options.split || 0.5));
        this.minSize = options.minSize || 50;
        this.splitterSize = options.splitterSize || 6;
        this.resizable = options.resizable !== false;
        this.collapsible = options.collapsible || false;
        this.disabled = options.disabled || false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // Pane content
        this.leftPane = options.leftPane || null;
        this.rightPane = options.rightPane || null;
        
        // Enhanced state management
        this.isResizing = false;
        this.isHovering = false;
        this.isFocused = false;
        this.startMousePos = 0;
        this.startSplit = 0;
        this.collapsed = null;
        this.animatedSplit = this.split;
        
        // Animation and performance
        this.animationState = {
            splitTransition: null,
            collapseAnimation: null
        };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('SplitPane');
        
        try {
            this.setupEventHandlers();
            this.setupAccessibility();
            this.updateAccessibility();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.split && (typeof options.split !== 'number' || options.split < 0 || options.split > 1)) {
            throw new ComponentError('split must be a number between 0 and 1', 'SplitPane');
        }
        
        if (options.orientation && !['horizontal', 'vertical'].includes(options.orientation)) {
            throw new ComponentError('orientation must be "horizontal" or "vertical"', 'SplitPane');
        }
        
        if (options.minSize && (typeof options.minSize !== 'number' || options.minSize < 0)) {
            throw new ComponentError('minSize must be a non-negative number', 'SplitPane');
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
            'ArrowLeft': () => this.adjustSplit(-0.05),
            'ArrowRight': () => this.adjustSplit(0.05),
            'ArrowUp': () => this.adjustSplit(-0.05),
            'ArrowDown': () => this.adjustSplit(0.05),
            'Home': () => this.setSplit(0.1),
            'End': () => this.setSplit(0.9),
            'Enter': () => this.toggleCollapse(),
            'Space': () => this.toggleCollapse(),
            'Escape': () => this.handleEscape()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'SplitPane',
                    { context, originalError: error }
                );
                
                console.error('SplitPane Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'resize':
                this.isResizing = false;
                this.split = Math.max(0.1, Math.min(0.9, this.split));
                break;
            case 'animation':
                this.animationState.splitTransition = null;
                this.animationState.collapseAnimation = null;
                AnimationManager.cancelAllAnimations();
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
        this.setAttribute('role', 'separator');
        this.setAttribute('aria-orientation', this.orientation);
        this.setAttribute('aria-valuemin', '10');
        this.setAttribute('aria-valuemax', '90');
        this.setAttribute('aria-valuenow', Math.round(this.split * 100));
        this.setAttribute('aria-valuetext', this.getSplitDescription());
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    updateAccessibility() {
        this.setAttribute('aria-valuenow', Math.round(this.split * 100));
        this.setAttribute('aria-valuetext', this.getSplitDescription());
    }
    
    getSplitDescription() {
        const percentage = Math.round(this.split * 100);
        const orientation = this.orientation === 'horizontal' ? 'left' : 'top';
        return `${orientation} pane ${percentage}%, ${orientation === 'left' ? 'right' : 'bottom'} pane ${100 - percentage}%`;
    }
      
    setupEventHandlers() {
        const eventHandlers = {
            'mouseDown': this.handleMouseDown.bind(this),
            'mouseMove': this.handleMouseMove.bind(this),
            'mouseUp': this.handleMouseUp.bind(this),
            'dblclick': this.handleDoubleClick.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced split management with animations
    async setSplit(newSplit, animate = true) {
        try {
            const clampedSplit = Math.max(0.1, Math.min(0.9, newSplit));
            
            if (clampedSplit === this.split) return;
            
            const oldSplit = this.split;
            
            if (animate && !this.prefersReducedMotion()) {
                await this.animateSplitChange(oldSplit, clampedSplit);
            } else {
                this.split = clampedSplit;
                this.animatedSplit = clampedSplit;
            }
            
            this.updateAccessibility();
            this.clearRenderCache();
            
            this.announceChange(`Split adjusted to ${Math.round(clampedSplit * 100)}%`);
            this.emit('splitChanged', { oldSplit, newSplit: clampedSplit });
            
        } catch (error) {
            this.errorHandler.handle(error, 'setSplit');
        }
    }
    
    adjustSplit(delta) {
        const newSplit = this.split + delta;
        this.setSplit(newSplit);
    }
    
    async toggleCollapse() {
        if (!this.collapsible) return;
        
        try {
            if (this.collapsed) {
                await this.expand();
            } else {
                // Default to collapsing the smaller pane
                const collapseLeft = this.split > 0.5;
                await this.collapse(collapseLeft ? 'left' : 'right');
            }
        } catch (error) {
            this.errorHandler.handle(error, 'toggleCollapse');
        }
    }
    
    async collapse(side) {
        if (!this.collapsible || this.collapsed === side) return;
        
        try {
            const targetSplit = side === 'left' ? 0.05 : 0.95;
            
            if (!this.prefersReducedMotion()) {
                await this.animateCollapse(this.split, targetSplit);
            } else {
                this.split = targetSplit;
                this.animatedSplit = targetSplit;
            }
            
            this.collapsed = side;
            this.updateAccessibility();
            this.clearRenderCache();
            
            this.announceChange(`${side} pane collapsed`);
            this.emit('paneCollapsed', { side });
            
        } catch (error) {
            this.errorHandler.handle(error, 'collapse');
        }
    }
    
    async expand() {
        if (!this.collapsed) return;
        
        try {
            const targetSplit = 0.5;
            
            if (!this.prefersReducedMotion()) {
                await this.animateCollapse(this.split, targetSplit);
            } else {
                this.split = targetSplit;
                this.animatedSplit = targetSplit;
            }
            
            const expandedSide = this.collapsed;
            this.collapsed = null;
            this.updateAccessibility();
            this.clearRenderCache();
            
            this.announceChange(`${expandedSide} pane expanded`);
            this.emit('paneExpanded', { side: expandedSide });
            
        } catch (error) {
            this.errorHandler.handle(error, 'expand');
        }
    }
    
    // Animation methods
    async animateSplitChange(fromSplit, toSplit) {
        const duration = 250;
        
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeOutCubic',
            onUpdate: (progress) => {
                this.animatedSplit = fromSplit + (toSplit - fromSplit) * progress;
                this.invalidate();
            },
            onComplete: () => {
                this.split = toSplit;
                this.animatedSplit = toSplit;
                this.animationState.splitTransition = null;
                this.invalidate();
            }
        });
        
        this.animationState.splitTransition = animation;
        return animation.start();
    }
    
    async animateCollapse(fromSplit, toSplit) {
        const duration = 300;
        
        const animation = AnimationManager.createAnimation({
            duration,
            easing: 'easeInOutCubic',
            onUpdate: (progress) => {
                this.animatedSplit = fromSplit + (toSplit - fromSplit) * progress;
                this.invalidate();
            },
            onComplete: () => {
                this.split = toSplit;
                this.animatedSplit = toSplit;
                this.animationState.collapseAnimation = null;
                this.invalidate();
            }
        });
        
        this.animationState.collapseAnimation = animation;
        return animation.start();
    }
    
    // Enhanced splitter bounds calculation
    getSplitterBounds() {
        const split = this.animatedSplit || this.split;
        
        if (this.orientation === 'horizontal') {
            const splitX = this.width * split;
            return {
                x: splitX - this.splitterSize / 2,
                y: 0,
                width: this.splitterSize,
                height: this.height
            };
        } else {
            const splitY = this.height * split;
            return {
                x: 0,
                y: splitY - this.splitterSize / 2,
                width: this.width,
                height: this.splitterSize
            };
        }
    }
    
    getLeftPaneBounds() {
        const split = this.animatedSplit || this.split;
        const splitterBounds = this.getSplitterBounds();
        
        if (this.orientation === 'horizontal') {
            return {
                x: 0,
                y: 0,
                width: splitterBounds.x,
                height: this.height
            };
        } else {
            return {
                x: 0,
                y: 0,
                width: this.width,
                height: splitterBounds.y
            };
        }
    }
    
    getRightPaneBounds() {
        const split = this.animatedSplit || this.split;
        const splitterBounds = this.getSplitterBounds();
        
        if (this.orientation === 'horizontal') {
            return {
                x: splitterBounds.x + splitterBounds.width,
                y: 0,
                width: this.width - (splitterBounds.x + splitterBounds.width),
                height: this.height
            };
        } else {
            return {
                x: 0,
                y: splitterBounds.y + splitterBounds.height,
                width: this.width,
                height: this.height - (splitterBounds.y + splitterBounds.height)
            };
        }
    }
    
    isPointInSplitter(x, y) {
        const bounds = this.getSplitterBounds();
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    getLeftPaneBounds() {
        if (this.collapsed === 'left') {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        if (this.collapsed === 'right') {
            return { x: 0, y: 0, width: this.width, height: this.height };
        }
        
        if (this.orientation === 'horizontal') {
            const splitX = this.width * this.split;
            return {
                x: 0,
                y: 0,
                width: splitX - this.splitterSize / 2,
                height: this.height
            };
        } else {
            const splitY = this.height * this.split;
            return {
                x: 0,
                y: 0,
                width: this.width,
                height: splitY - this.splitterSize / 2
            };
        }
    }
    
    getRightPaneBounds() {
        if (this.collapsed === 'right') {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        if (this.collapsed === 'left') {
            return { x: 0, y: 0, width: this.width, height: this.height };
        }
        
        if (this.orientation === 'horizontal') {
            const splitX = this.width * this.split;
            return {
                x: splitX + this.splitterSize / 2,
                y: 0,
                width: this.width - splitX - this.splitterSize / 2,
                height: this.height
            };
        } else {
            const splitY = this.height * this.split;
            return {
                x: 0,
                y: splitY + this.splitterSize / 2,
                width: this.width,
                height: this.height - splitY - this.splitterSize / 2
            };
        }
    }
    
    isPointInSplitter(x, y) {
        const bounds = this.getSplitterBounds();
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    setSplit(ratio) {
        const maxDimension = this.orientation === 'horizontal' ? this.width : this.height;
        const minRatio = this.minSize / maxDimension;
        const maxRatio = 1 - (this.minSize + this.splitterSize) / maxDimension;
        
        this.split = Math.max(minRatio, Math.min(maxRatio, ratio));
        this.emit('splitChanged', { split: this.split });
    }
      collapse(pane) {
        if (!this.collapsible) return;
        
        if (pane === 'left' || pane === 'right') {
            this.collapsed = this.collapsed === pane ? null : pane;
            this.emit('paneCollapsed', { collapsed: this.collapsed });
        }
    }
    
    // Event Handlers
    handleMouseDown(event) {
        if (!this.resizable) return;
        
        const { localX, localY } = event;
        if (this.isPointInSplitter(localX, localY)) {
            this.isResizing = true;
            this.startMousePos = this.orientation === 'horizontal' ? localX : localY;
            this.startSplit = this.split;
            event.preventDefault?.();
        }
    }
    
    handleMouseMove(event) {
        const { localX, localY } = event;
        
        if (this.isResizing) {
            const currentPos = this.orientation === 'horizontal' ? localX : localY;
            const delta = currentPos - this.startMousePos;
            const maxDimension = this.orientation === 'horizontal' ? this.width : this.height;
            const deltaRatio = delta / maxDimension;
            
            this.setSplit(this.startSplit + deltaRatio);
        } else {
            this.isHovering = this.isPointInSplitter(localX, localY);
        }
    }
    
    handleMouseUp(event) {
        this.isResizing = false;
    }
    
    handleDoubleClick(event) {
        if (!this.collapsible) return;
        
        const { localX, localY } = event;
        if (this.isPointInSplitter(localX, localY)) {
            // Toggle collapse based on which side is smaller
            const leftBounds = this.getLeftPaneBounds();
            const rightBounds = this.getRightPaneBounds();
            
            if (this.orientation === 'horizontal') {
                this.collapse(leftBounds.width < rightBounds.width ? 'left' : 'right');
            } else {
                this.collapse(leftBounds.height < rightBounds.height ? 'left' : 'right');
            }
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        this.renderPanes(renderer);
        this.renderSplitter(renderer);
    }
    
    renderPanes(renderer) {
        const leftBounds = this.getLeftPaneBounds();
        const rightBounds = this.getRightPaneBounds();
        
        // Left/Top pane
        if (leftBounds.width > 0 && leftBounds.height > 0) {
            renderer.fillStyle = this.paneBackgroundColor;
            renderer.fillRect(leftBounds.x, leftBounds.y, leftBounds.width, leftBounds.height);
            
            renderer.strokeStyle = '#e9ecef';
            renderer.lineWidth = 1;
            renderer.strokeRect(leftBounds.x, leftBounds.y, leftBounds.width, leftBounds.height);
            
            // Render left pane content
            if (this.leftPane) {
                if (typeof this.leftPane === 'string') {
                    renderer.fillStyle = '#333333';
                    renderer.font = '14px Arial';
                    renderer.textAlign = 'left';
                    renderer.textBaseline = 'top';
                    renderer.fillText(this.leftPane, leftBounds.x + 10, leftBounds.y + 10);
                }
                // If leftPane is a component, it should handle its own rendering
            }
        }
        
        // Right/Bottom pane
        if (rightBounds.width > 0 && rightBounds.height > 0) {
            renderer.fillStyle = this.paneBackgroundColor;
            renderer.fillRect(rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
            
            renderer.strokeStyle = '#e9ecef';
            renderer.lineWidth = 1;
            renderer.strokeRect(rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
            
            // Render right pane content
            if (this.rightPane) {
                if (typeof this.rightPane === 'string') {
                    renderer.fillStyle = '#333333';
                    renderer.font = '14px Arial';
                    renderer.textAlign = 'left';                    renderer.textBaseline = 'top';
                    renderer.fillText(this.rightPane, rightBounds.x + 10, rightBounds.y + 10);
                }
            }
        }
    }
    
    // Event handlers
    handleMouseDown(event) {
        try {
            if (!this.resizable || this.disabled) return;
            
            const { localX, localY } = event;
            
            if (this.isPointInSplitter(localX, localY)) {
                this.isResizing = true;
                this.startSplit = this.split;
                
                if (this.orientation === 'horizontal') {
                    this.startMousePos = localX;
                } else {
                    this.startMousePos = localY;
                }
                
                this.announceChange('Started resizing split pane');
                this.emit('resizeStart', { split: this.split });
                event.stopPropagation();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'handleMouseDown');
        }
    }
    
    handleMouseMove(event) {
        try {
            const { localX, localY } = event;
            
            if (this.isResizing) {
                const currentPos = this.orientation === 'horizontal' ? localX : localY;
                const delta = currentPos - this.startMousePos;
                const totalSize = this.orientation === 'horizontal' ? this.width : this.height;
                const deltaRatio = delta / totalSize;
                
                let newSplit = this.startSplit + deltaRatio;
                
                // Apply minimum size constraints
                const minRatio = this.minSize / totalSize;
                newSplit = Math.max(minRatio, Math.min(1 - minRatio, newSplit));
                
                this.split = newSplit;
                this.animatedSplit = newSplit;
                this.updateAccessibility();
                this.clearRenderCache();
                
                this.emit('resize', { split: newSplit });
            } else {
                // Update hover state
                const wasHovering = this.isHovering;
                this.isHovering = this.isPointInSplitter(localX, localY);
                
                if (wasHovering !== this.isHovering) {
                    this.invalidate();
                }
                
                // Update cursor
                if (this.resizable && this.isHovering) {
                    document.body.style.cursor = this.orientation === 'horizontal' ? 'col-resize' : 'row-resize';
                } else {
                    document.body.style.cursor = 'default';
                }
            }
        } catch (error) {
            this.errorHandler.handle(error, 'handleMouseMove');
        }
    }
    
    handleMouseUp(event) {
        try {
            if (this.isResizing) {
                this.isResizing = false;
                document.body.style.cursor = 'default';
                
                this.announceChange(`Split adjusted to ${Math.round(this.split * 100)}%`);
                this.emit('resizeEnd', { split: this.split });
            }
        } catch (error) {
            this.errorHandler.handle(error, 'handleMouseUp');
        }
    }
    
    handleDoubleClick(event) {
        try {
            const { localX, localY } = event;
            
            if (this.isPointInSplitter(localX, localY) && this.collapsible) {
                this.toggleCollapse();
            }
        } catch (error) {
            this.errorHandler.handle(error, 'handleDoubleClick');
        }
    }
    
    handleKeyDown(event) {
        if (this.disabled) return;
        
        const handler = this.keyboardHandler[event.key];
        if (handler) {
            event.preventDefault();
            handler();
        }
    }
    
    handleFocus() {
        this.isFocused = true;
        this.invalidate();
    }
    
    handleBlur() {
        this.isFocused = false;
        this.invalidate();
        document.body.style.cursor = 'default';
    }
    
    handleFocusIn() {
        this.isFocused = true;
        this.invalidate();
    }
    
    handleFocusOut() {
        this.isFocused = false;
        this.invalidate();
    }
    
    handleEscape() {
        if (this.isResizing) {
            this.isResizing = false;
            this.split = this.startSplit;
            this.animatedSplit = this.startSplit;
            this.updateAccessibility();
            this.clearRenderCache();
            document.body.style.cursor = 'default';
            
            this.announceChange('Resize cancelled');
            this.emit('resizeCancel');
        }
    }
    
    // Enhanced rendering with theme support
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        try {
            const theme = ComponentTheme.themes[this.theme];
            
            this.renderPanes(renderer, theme);
            this.renderSplitter(renderer, theme);
            
            if (this.isFocused) {
                this.renderFocusIndicator(renderer, theme);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    renderPanes(renderer, theme) {
        const leftBounds = this.getLeftPaneBounds();
        const rightBounds = this.getRightPaneBounds();
        
        // Left/Top pane background
        renderer.fillStyle = theme.background;
        renderer.fillRect(leftBounds.x, leftBounds.y, leftBounds.width, leftBounds.height);
        
        // Right/Bottom pane background
        renderer.fillStyle = theme.backgroundSecondary;
        renderer.fillRect(rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
        
        // Pane borders
        renderer.strokeStyle = theme.border;
        renderer.lineWidth = 1;
        renderer.strokeRect(leftBounds.x, leftBounds.y, leftBounds.width, leftBounds.height);
        renderer.strokeRect(rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
        
        // Render pane content
        if (this.leftPane && typeof this.leftPane.render === 'function') {
            renderer.save();
            renderer.translate(leftBounds.x, leftBounds.y);
            renderer.beginPath();
            renderer.rect(0, 0, leftBounds.width, leftBounds.height);
            renderer.clip();
            this.leftPane.render(renderer);
            renderer.restore();
        }
        
        if (this.rightPane && typeof this.rightPane.render === 'function') {
            renderer.save();
            renderer.translate(rightBounds.x, rightBounds.y);
            renderer.beginPath();
            renderer.rect(0, 0, rightBounds.width, rightBounds.height);
            renderer.clip();
            this.rightPane.render(renderer);
            renderer.restore();
        }
    }
    
    renderSplitter(renderer, theme) {
        const bounds = this.getSplitterBounds();
        let splitterColor = theme.border;
        
        if (this.isResizing) {
            splitterColor = theme.borderActive;
        } else if (this.isHovering) {
            splitterColor = theme.hover;
        }
        
        // Splitter background
        renderer.fillStyle = splitterColor;
        renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Splitter grip with enhanced styling
        const gripColor = theme.textSecondary;
        renderer.fillStyle = gripColor;
        
        if (this.orientation === 'horizontal') {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            
            // Vertical grip lines
            for (let i = -2; i <= 2; i++) {
                const y = centerY + i * 4;
                renderer.fillRect(centerX - 1, y - 1, 2, 2);
                if (this.isHovering || this.isResizing) {
                    renderer.fillRect(centerX - 3, y - 1, 1, 2);
                    renderer.fillRect(centerX + 2, y - 1, 1, 2);
                }
            }
        } else {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            
            // Horizontal grip lines
            for (let i = -2; i <= 2; i++) {
                const x = centerX + i * 4;
                renderer.fillRect(x - 1, centerY - 1, 2, 2);
                if (this.isHovering || this.isResizing) {
                    renderer.fillRect(x - 1, centerY - 3, 2, 1);
                    renderer.fillRect(x - 1, centerY + 2, 2, 1);
                }
            }
        }
    }
    
    renderFocusIndicator(renderer, theme) {
        const bounds = this.getSplitterBounds();
        
        renderer.strokeStyle = theme.focus;
        renderer.lineWidth = 2;
        renderer.setLineDash([3, 3]);
        renderer.strokeRect(bounds.x - 2, bounds.y - 2, bounds.width + 4, bounds.height + 4);
        renderer.setLineDash([]);
    }
    
    // Utility methods
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    prefersReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    clearRenderCache() {
        this.renderCache.clear();
        this.invalidate();
    }
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    reset() {
        this.split = 0.5;
        this.animatedSplit = 0.5;
        this.collapsed = null;
        this.isResizing = false;
        this.isHovering = false;
        this.isFocused = false;
        
        this.animationState.splitTransition = null;
        this.animationState.collapseAnimation = null;
        AnimationManager.cancelAllAnimations();
        
        this.updateAccessibility();
        this.clearRenderCache();
        
        this.announceChange('Split pane reset');
        this.emit('reset');
    }
    
    destroy() {
        // Clean up resources
        if (this.announcer && this.announcer.parentNode) {
            this.announcer.parentNode.removeChild(this.announcer);
        }
        
        this.animationState.splitTransition = null;
        this.animationState.collapseAnimation = null;
        AnimationManager.cancelAllAnimations();
        this.renderCache.clear();
        
        document.body.style.cursor = 'default';
        
        super.destroy();
    }
    
    // Public API
    setLeftPane(content) {
        this.leftPane = content;
        this.clearRenderCache();
        this.emit('paneChanged', { pane: 'left', content });
    }
    
    setRightPane(content) {
        this.rightPane = content;
        this.clearRenderCache();
        this.emit('paneChanged', { pane: 'right', content });
    }
    
    getSplit() {
        return this.split;
    }
    
    isCollapsed() {
        return this.collapsed;
    }
    
    setOrientation(orientation) {
        if (['horizontal', 'vertical'].includes(orientation) && orientation !== this.orientation) {
            this.orientation = orientation;
            this.setAttribute('aria-orientation', orientation);
            this.clearRenderCache();
            this.emit('orientationChanged', { orientation });
        }
    }
    
    setTheme(theme) {
        this.theme = theme;
        this.clearRenderCache();
        this.emit('themeChanged', { theme });
    }
}

// =============================================================================
// TREE VIEW COMPONENT
// =============================================================================

/**
 * Advanced TreeView component with accessibility, animations,
 * theme support, and modern interaction patterns.
 */
export class TreeView extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 300,
            height: options.height || 400,
            ariaRole: 'tree',
            ariaLabel: options.ariaLabel || 'Tree View'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.data = options.data || [];
        this.selectedNode = options.selectedNode || null;
        this.expandedNodes = new Set(options.expandedNodes || []);
        this.multiSelect = options.multiSelect || false;
        this.selectedNodes = new Set();
        this.disabled = options.disabled || false;
        this.showLines = options.showLines !== false;
        this.showIcons = options.showIcons !== false;
        this.indentSize = options.indentSize || 20;
        this.nodeHeight = options.nodeHeight || 24;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // Enhanced state management
        this.hoveredNode = null;
        this.focusedNode = null;
        this.draggedNode = null;
        this.dropTarget = null;
        this.animatingNodes = new Set();
        this.scrollPosition = { x: 0, y: 0 };
        
        // Animation and performance
        this.animationState = {
            expandAnimations: new Map(),
            collapseAnimations: new Map()
        };
        this.renderCache = new Map();
        this.virtualizedItems = [];
        this.visibleRange = { start: 0, end: 0 };
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('TreeView');
        
        try {
            this.setupNodes();
            this.setupEventHandlers();
            this.setupAccessibility();
            this.updateVirtualization();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.data && !Array.isArray(options.data)) {
            throw new ComponentError('data must be an array', 'TreeView');
        }
        
        if (options.indentSize && (typeof options.indentSize !== 'number' || options.indentSize < 0)) {
            throw new ComponentError('indentSize must be a non-negative number', 'TreeView');
        }
        
        if (options.nodeHeight && (typeof options.nodeHeight !== 'number' || options.nodeHeight < 16)) {
            throw new ComponentError('nodeHeight must be at least 16 pixels', 'TreeView');
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
            'ArrowUp': () => this.navigateNode(-1),
            'ArrowDown': () => this.navigateNode(1),
            'ArrowLeft': () => this.collapseOrNavigateUp(),
            'ArrowRight': () => this.expandOrNavigateDown(),
            'Home': () => this.navigateToNode('first'),
            'End': () => this.navigateToNode('last'),
            'Enter': () => this.activateFocusedNode(),
            'Space': () => this.toggleFocusedNode(),
            'Escape': () => this.handleEscape(),
            '*': () => this.expandAll()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'TreeView',
                    { context, originalError: error }
                );
                
                console.error('TreeView Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'node-management':
                this.validateNodeState();
                break;
            case 'animation':
                this.animationState.expandAnimations.clear();
                this.animationState.collapseAnimations.clear();
                this.animatingNodes.clear();
                AnimationManager.cancelAllAnimations();
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
        this.setAttribute('role', 'tree');
        this.setAttribute('aria-multiselectable', this.multiSelect.toString());
        this.setAttribute('aria-activedescendant', '');
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupNodes() {
        try {
            // Normalize node data
            this.data = this.normalizeNodes(this.data);
            
            // Build flat list for virtualization
            this.updateVirtualization();
            
            // Validate selection state
            this.validateNodeState();
            
        } catch (error) {
            this.errorHandler.handle(error, 'node-setup');
        }
    }
    
    normalizeNodes(nodes, parent = null, level = 0) {
        return nodes.map((node, index) => {
            const normalizedNode = {
                id: node.id || `node-${level}-${index}`,
                label: node.label || node.text || `Node ${index + 1}`,
                children: node.children || [],
                parent,
                level,
                expanded: this.expandedNodes.has(node.id),
                selected: this.selectedNodes.has(node.id),
                disabled: node.disabled || false,
                icon: node.icon || null,
                data: node.data || {},
                ...node
            };
            
            // Recursively normalize children
            if (normalizedNode.children.length > 0) {
                normalizedNode.children = this.normalizeNodes(
                    normalizedNode.children, 
                    normalizedNode, 
                    level + 1
                );
            }
              return normalizedNode;
        });
    }
    
    validateNodeState() {
        // Ensure selected node exists
        if (this.selectedNode && !this.findNodeById(this.selectedNode)) {
            this.selectedNode = null;
        }
        
        // Clean up selected nodes
        const validNodes = new Set();
        for (const nodeId of this.selectedNodes) {
            if (this.findNodeById(nodeId)) {
                validNodes.add(nodeId);
            }
        }
        this.selectedNodes = validNodes;
        
        // Ensure focused node is valid
        if (this.focusedNode && !this.findNodeById(this.focusedNode)) {
            this.focusedNode = null;
        }
    }
    
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'mouseMove': this.handleMouseMove.bind(this),
            'keyDown': this.handleKeyDown.bind(this),
            'wheel': this.handleWheel.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }    
    buildVisibleNodes() {
        this.visibleNodes = [];
        this.buildVisibleNodesRecursive(this.data, 0);
    }
    
    buildVisibleNodesRecursive(nodes, level) {
        for (const node of nodes) {
            const nodeId = node.id || `node-${level}-${this.visibleNodes.length}`;
            this.visibleNodes.push({
                ...node,
                level,
                id: nodeId
            });
            
            if (node.children && this.expandedNodes.has(nodeId)) {
                this.buildVisibleNodesRecursive(node.children, level + 1);
            }
        }
    }
    
    getNodeAtPosition(y) {
        const adjustedY = y + this.scrollY;
        const nodeIndex = Math.floor(adjustedY / this.nodeHeight);
        return nodeIndex >= 0 && nodeIndex < this.visibleNodes.length ? 
               { node: this.visibleNodes[nodeIndex], index: nodeIndex } : null;
    }
    
    expandNode(nodeId) {
        this.expandedNodes.add(nodeId);
        this.buildVisibleNodes();
        this.emit('nodeExpanded', { nodeId });
    }
    
    collapseNode(nodeId) {
        this.expandedNodes.delete(nodeId);
        this.buildVisibleNodes();
        this.emit('nodeCollapsed', { nodeId });
    }
    
    toggleNode(nodeId) {
        if (this.expandedNodes.has(nodeId)) {
            this.collapseNode(nodeId);
        } else {
            this.expandNode(nodeId);
        }
    }
    
    selectNode(nodeId, addToSelection = false) {
        if (this.multiSelect && addToSelection) {
            if (this.selectedNodes.has(nodeId)) {
                this.selectedNodes.delete(nodeId);
            } else {
                this.selectedNodes.add(nodeId);
            }
        } else {
            this.selectedNodes.clear();
            this.selectedNodes.add(nodeId);
            this.selectedNode = nodeId;
        }
        
        this.emit('nodeSelected', { 
            nodeId, 
            selectedNodes: Array.from(this.selectedNodes)        });
    }
    
    findNode(nodeId, nodes = this.data) {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }
            if (node.children) {
                const found = this.findNode(nodeId, node.children);
                if (found) return found;
            }
        }
        return null;
    }
    
    // Event Handlers
    handleClick(event) {
        const { localY } = event;
        const result = this.getNodeAtPosition(localY);
        
        if (result) {
            const { node } = result;
            const x = node.level * this.indentSize;
            
            // Check if clicking on expand/collapse icon
            if (node.children && event.localX >= x && event.localX <= x + 16) {
                this.toggleNode(node.id);
            } else {
                this.selectNode(node.id, event.ctrlKey || event.metaKey);
            }
        }
    }
    
    handleMouseMove(event) {
        const result = this.getNodeAtPosition(event.localY);
        this.hoveredNode = result ? result.node.id : null;
    }
    
    handleKeyDown(event) {
        if (!this.selectedNode) return;
        
        const selectedIndex = this.visibleNodes.findIndex(n => n.id === this.selectedNode);
        if (selectedIndex === -1) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (selectedIndex > 0) {
                    this.selectNode(this.visibleNodes[selectedIndex - 1].id);
                }
                break;
            case 'ArrowDown':
                if (selectedIndex < this.visibleNodes.length - 1) {
                    this.selectNode(this.visibleNodes[selectedIndex + 1].id);
                }
                break;
            case 'ArrowRight':
                const node = this.visibleNodes[selectedIndex];
                if (node.children && !this.expandedNodes.has(node.id)) {
                    this.expandNode(node.id);
                }
                break;
            case 'ArrowLeft':
                const currentNode = this.visibleNodes[selectedIndex];
                if (currentNode.children && this.expandedNodes.has(currentNode.id)) {
                    this.collapseNode(currentNode.id);
                }
                break;
            case 'Enter':
            case ' ':
                this.emit('nodeActivated', { nodeId: this.selectedNode });
                break;
        }
    }
    
    handleWheel(event) {
        const maxScroll = Math.max(0, this.visibleNodes.length * this.nodeHeight - this.height);
        this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollY + event.deltaY));
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Background
        renderer.fillStyle = this.backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Visible area clipping
        renderer.save();
        renderer.beginPath();
        renderer.rect(0, 0, this.width, this.height);
        renderer.clip();
        
        // Render visible nodes
        const startY = -this.scrollY;
        
        this.visibleNodes.forEach((node, index) => {
            const y = startY + index * this.nodeHeight;
            
            // Skip nodes that are outside visible area
            if (y + this.nodeHeight < 0 || y > this.height) return;
            
            this.renderNode(renderer, node, y);
        });
        
        renderer.restore();
        
        // Scrollbar
        if (this.visibleNodes.length * this.nodeHeight > this.height) {
            this.renderScrollbar(renderer);
        }
    }
    
    renderNode(renderer, node, y) {
        const x = node.level * this.indentSize;
        const isSelected = this.selectedNodes.has(node.id);
        const isHovered = this.hoveredNode === node.id;
        
        // Node background
        if (isSelected) {
            renderer.fillStyle = this.selectedColor;
            renderer.fillRect(0, y, this.width, this.nodeHeight);
        } else if (isHovered) {
            renderer.fillStyle = this.hoverColor;
            renderer.fillRect(0, y, this.width, this.nodeHeight);
        }
        
        // Expand/collapse icon
        if (node.children) {
            const iconX = x + 4;
            const iconY = y + this.nodeHeight / 2;
            const isExpanded = this.expandedNodes.has(node.id);
            
            renderer.fillStyle = this.iconColor;
            renderer.font = '12px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(isExpanded ? '▼' : '▶', iconX, iconY);
        }
        
        // Node icon
        let textX = x + 20;
        if (this.showIcons && node.icon) {
            renderer.fillStyle = this.iconColor;
            renderer.font = '14px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            renderer.fillText(node.icon, textX, y + this.nodeHeight / 2);
            textX += 20;
        }
        
        // Checkbox
        if (this.showCheckboxes) {
            const checkboxX = textX;
            const checkboxY = y + (this.nodeHeight - 12) / 2;
            
            renderer.strokeStyle = '#999999';
            renderer.lineWidth = 1;
            renderer.strokeRect(checkboxX, checkboxY, 12, 12);
            
            if (isSelected) {
                renderer.fillStyle = '#007bff';
                renderer.fillRect(checkboxX + 2, checkboxY + 2, 8, 8);
            }
            
            textX += 20;
        }
        
        // Node text
        renderer.fillStyle = this.textColor;
        renderer.font = `${isSelected ? 'bold ' : ''}13px Arial`;
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText(node.label || node.title || node.name || node.id,                         textX, y + this.nodeHeight / 2);
    }
    
    renderScrollbar(renderer) {
        const scrollbarWidth = 8;
        const scrollbarX = this.width - scrollbarWidth;
        
        // Scrollbar track
        renderer.fillStyle = '#f0f0f0';
        renderer.fillRect(scrollbarX, 0, scrollbarWidth, this.height);
        
        // Scrollbar thumb
        const totalHeight = this.visibleNodes.length * this.nodeHeight;
        const thumbHeight = Math.max(20, (this.height / totalHeight) * this.height);
        const scrollRange = totalHeight - this.height;
        const thumbY = scrollRange > 0 ? (this.scrollY / scrollRange) * (this.height - thumbHeight) : 0;
        
        renderer.fillStyle = '#c0c0c0';
        renderer.fillRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight);
    }
    
    // Public API
    setData(data) {
        this.data = data;
        this.buildVisibleNodes();
        this.emit('dataChanged');
    }
    
    getSelectedNodes() {
        return Array.from(this.selectedNodes);
    }
    
    expandAll() {
        const expandAllRecursive = (nodes) => {
            for (const node of nodes) {
                if (node.children) {
                    this.expandedNodes.add(node.id);
                    expandAllRecursive(node.children);
                }
            }
        };
        
        expandAllRecursive(this.data);
        this.buildVisibleNodes();
        this.emit('allExpanded');    }
    
    // Navigation and accessibility methods
    navigateNode(direction) {
        if (!this.visibleNodes.length) return;
        
        let currentIndex = this.focusedNode ? 
            this.visibleNodes.findIndex(n => n.id === this.focusedNode) : -1;
        
        if (currentIndex === -1) {
            currentIndex = 0;
        } else {
            currentIndex = Math.max(0, Math.min(this.visibleNodes.length - 1, currentIndex + direction));
        }
        
        const newNode = this.visibleNodes[currentIndex];
        this.setFocusedNode(newNode.id);
        this.scrollToNode(newNode.id);
        this.announceChange(`Focused: ${newNode.label}`);
    }
    
    navigateToNode(position) {
        if (!this.visibleNodes.length) return;
        
        let nodeIndex;
        switch (position) {
            case 'first':
                nodeIndex = 0;
                break;
            case 'last':
                nodeIndex = this.visibleNodes.length - 1;
                break;
            default:
                return;
        }
        
        const node = this.visibleNodes[nodeIndex];
        this.setFocusedNode(node.id);
        this.scrollToNode(node.id);
        this.announceChange(`Moved to ${position}: ${node.label}`);
    }
    
    collapseOrNavigateUp() {
        const node = this.findNodeById(this.focusedNode);
        if (!node) return;
        
        if (node.children && node.children.length > 0 && this.expandedNodes.has(node.id)) {
            this.collapseNode(node.id);
            this.announceChange(`Collapsed: ${node.label}`);
        } else if (node.parent) {
            this.setFocusedNode(node.parent.id);
            this.scrollToNode(node.parent.id);
            this.announceChange(`Moved to parent: ${node.parent.label}`);
        }
    }
    
    expandOrNavigateDown() {
        const node = this.findNodeById(this.focusedNode);
        if (!node) return;
        
        if (node.children && node.children.length > 0) {
            if (!this.expandedNodes.has(node.id)) {
                this.expandNode(node.id);
                this.announceChange(`Expanded: ${node.label}`);
            } else {
                // Navigate to first child
                const firstChild = node.children[0];
                if (firstChild) {
                    this.setFocusedNode(firstChild.id);
                    this.scrollToNode(firstChild.id);
                    this.announceChange(`Moved to child: ${firstChild.label}`);
                }
            }
        }
    }
    
    activateFocusedNode() {
        if (this.focusedNode) {
            this.selectNode(this.focusedNode);
            this.emit('nodeActivated', { nodeId: this.focusedNode });
        }
    }
    
    toggleFocusedNode() {
        if (this.focusedNode) {
            this.toggleNode(this.focusedNode);
        }
    }
    
    handleEscape() {
        this.selectedNodes.clear();
        this.selectedNode = null;
        this.updateAccessibility();
        this.announceChange('Selection cleared');
        this.emit('selectionCleared');
    }
    
    setFocusedNode(nodeId) {
        this.focusedNode = nodeId;
        this.setAttribute('aria-activedescendant', nodeId || '');
        this.invalidate();
    }
    
    scrollToNode(nodeId) {
        const nodeIndex = this.visibleNodes.findIndex(n => n.id === nodeId);
        if (nodeIndex === -1) return;
        
        const nodeY = nodeIndex * this.nodeHeight;
        const viewportTop = this.scrollY;
        const viewportBottom = this.scrollY + this.height;
        
        if (nodeY < viewportTop) {
            this.scrollY = nodeY;
        } else if (nodeY + this.nodeHeight > viewportBottom) {
            this.scrollY = nodeY + this.nodeHeight - this.height;
        }
        
        this.invalidate();
    }
    
    // Enhanced node management with animations
    expandNode(nodeId, animate = true) {
        const node = this.findNodeById(nodeId);
        if (!node || !node.children || node.children.length === 0) return;
        
        this.expandedNodes.add(nodeId);
        
        if (animate && !this.prefersReducedMotion()) {
            this.animateNodeExpansion(nodeId);
        } else {
            this.updateVirtualization();
        }
        
        this.emit('nodeExpanded', { nodeId, node });
    }
    
    collapseNode(nodeId, animate = true) {
        const node = this.findNodeById(nodeId);
        if (!node) return;
        
        this.expandedNodes.delete(nodeId);
        
        // Also clear any selected nodes that are children of collapsed node
        this.clearChildSelections(node);
        
        if (animate && !this.prefersReducedMotion()) {
            this.animateNodeCollapse(nodeId);
        } else {
            this.updateVirtualization();
        }
        
        this.emit('nodeCollapsed', { nodeId, node });
    }
    
    clearChildSelections(node) {
        const clearChildren = (children) => {
            for (const child of children) {
                this.selectedNodes.delete(child.id);
                if (child.children) {
                    clearChildren(child.children);
                }
            }
        };
        
        if (node.children) {
            clearChildren(node.children);
        }
    }
    
    animateNodeExpansion(nodeId) {
        if (this.animatingNodes.has(nodeId)) return;
        
        this.animatingNodes.add(nodeId);
        
        const animation = AnimationManager.animate({
            duration: ANIMATION_DURATIONS.medium,
            easing: 'easeOutCubic',
            onUpdate: (progress) => {
                // Visual expansion effect
                this.invalidate();
            },
            onComplete: () => {
                this.animatingNodes.delete(nodeId);
                this.updateVirtualization();
                this.invalidate();
            }
        });
        
        this.animationState.expandAnimations.set(nodeId, animation);
    }
    
    animateNodeCollapse(nodeId) {
        if (this.animatingNodes.has(nodeId)) return;
        
        this.animatingNodes.add(nodeId);
        
        const animation = AnimationManager.animate({
            duration: ANIMATION_DURATIONS.medium,
            easing: 'easeInCubic',
            onUpdate: (progress) => {
                // Visual collapse effect
                this.invalidate();
            },
            onComplete: () => {
                this.animatingNodes.delete(nodeId);
                this.updateVirtualization();
                this.invalidate();
            }
        });
        
        this.animationState.collapseAnimations.set(nodeId, animation);
    }
    
    updateVirtualization() {
        this.buildVisibleNodes();
        this.updateVisibleRange();
        this.clearRenderCache();
    }
    
    updateVisibleRange() {
        const buffer = 5; // Render a few extra items for smooth scrolling
        const startIndex = Math.max(0, Math.floor(this.scrollY / this.nodeHeight) - buffer);
        const endIndex = Math.min(
            this.visibleNodes.length - 1,
            Math.ceil((this.scrollY + this.height) / this.nodeHeight) + buffer
        );
        
        this.visibleRange = { start: startIndex, end: endIndex };
    }
    
    findNodeById(nodeId, nodes = this.data) {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }
            if (node.children) {
                const found = this.findNodeById(nodeId, node.children);
                if (found) return found;
            }
        }
        return null;
    }
    
    // Enhanced event handlers
    handleFocusIn() {
        this.isFocused = true;
        if (!this.focusedNode && this.visibleNodes.length > 0) {
            this.setFocusedNode(this.visibleNodes[0].id);
        }
        this.invalidate();
    }
    
    handleFocusOut() {
        this.isFocused = false;
        this.invalidate();
    }
    
    handleFocus() {
        this.handleFocusIn();
    }
    
    handleBlur() {
        this.handleFocusOut();
    }
    
    // Enhanced rendering with performance optimizations
    renderSelf(renderer) {
        const startTime = this.performanceMonitor.startOperation('render');
        
        try {
            if (renderer.type !== 'canvas') return;
            
            // Apply theme
            const colors = this.theme.getColors();
            
            // Background
            renderer.fillStyle = colors.background;
            renderer.fillRect(0, 0, this.width, this.height);
            
            // Update visible range for virtualization
            this.updateVisibleRange();
            
            // Render visible nodes only
            renderer.save();
            renderer.beginPath();
            renderer.rect(0, 0, this.width, this.height);
            renderer.clip();
            
            for (let i = this.visibleRange.start; i <= this.visibleRange.end; i++) {
                if (i >= 0 && i < this.visibleNodes.length) {
                    const node = this.visibleNodes[i];
                    const y = i * this.nodeHeight - this.scrollY;
                    
                    if (y + this.nodeHeight >= 0 && y <= this.height) {
                        this.renderNode(renderer, node, y, colors);
                    }
                }
            }
            
            renderer.restore();
            
            // Render scrollbar if needed
            if (this.needsScrollbar()) {
                this.renderScrollbar(renderer, colors);
            }
            
            // Render focus indicator
            if (this.isFocused && this.focusedNode) {
                this.renderFocusIndicator(renderer, colors);
            }
            
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        } finally {
            this.performanceMonitor.endOperation('render', startTime);
        }
    }
    
    renderNode(renderer, node, y, colors) {
        const cacheKey = `${node.id}-${y}-${node.selected}-${node.expanded}-${this.hoveredNode === node.id}`;
        
        if (this.renderCache.has(cacheKey)) {
            // Use cached render if available
            return;
        }
        
        const x = node.level * this.indentSize;
        const isSelected = this.selectedNodes.has(node.id);
        const isHovered = this.hoveredNode === node.id;
        const isFocused = this.focusedNode === node.id;
        
        // Node background
        if (isSelected) {
            renderer.fillStyle = colors.primary;
            renderer.globalAlpha = 0.2;
            renderer.fillRect(0, y, this.width, this.nodeHeight);
            renderer.globalAlpha = 1;
        } else if (isHovered) {
            renderer.fillStyle = colors.surface;
            renderer.fillRect(0, y, this.width, this.nodeHeight);
        }
        
        // Connection lines
        if (this.showLines) {
            this.renderConnectionLines(renderer, node, x, y, colors);
        }
        
        // Expand/collapse icon
        if (node.children && node.children.length > 0) {
            this.renderExpandIcon(renderer, node, x, y, colors);
        }
        
        // Node icon
        let textX = x + 20;
        if (this.showIcons && node.icon) {
            textX = this.renderNodeIcon(renderer, node, textX, y, colors);
        }
        
        // Node text
        this.renderNodeText(renderer, node, textX, y, colors, isSelected);
        
        // Focus indicator
        if (isFocused) {
            this.renderNodeFocusIndicator(renderer, y, colors);
        }
        
        // Cache the render
        this.renderCache.set(cacheKey, true);
    }
    
    renderConnectionLines(renderer, node, x, y, colors) {
        renderer.strokeStyle = colors.border;
        renderer.lineWidth = 1;
        renderer.setLineDash([2, 2]);
        
        // Vertical line to parent
        if (node.level > 0) {
            renderer.beginPath();
            renderer.moveTo(x - 10, y);
            renderer.lineTo(x - 10, y + this.nodeHeight / 2);
            renderer.stroke();
            
            // Horizontal line to node
            renderer.beginPath();
            renderer.moveTo(x - 10, y + this.nodeHeight / 2);
            renderer.lineTo(x, y + this.nodeHeight / 2);
            renderer.stroke();
        }
        
        renderer.setLineDash([]);
    }
    
    renderExpandIcon(renderer, node, x, y, colors) {
        const iconX = x + 4;
        const iconY = y + this.nodeHeight / 2;
        const isExpanded = this.expandedNodes.has(node.id);
        
        renderer.fillStyle = colors.text;
        renderer.font = '10px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        
        // Use CSS arrow symbols for better accessibility
        const icon = isExpanded ? '▼' : '▶';
        renderer.fillText(icon, iconX, iconY);
    }
    
    renderNodeIcon(renderer, node, x, y, colors) {
        renderer.fillStyle = colors.text;
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText(node.icon, x, y + this.nodeHeight / 2);
        return x + 20;
    }
    
    renderNodeText(renderer, node, x, y, colors, isSelected) {
        renderer.fillStyle = isSelected ? colors.primaryText : colors.text;
        renderer.font = `${isSelected ? 'bold ' : ''}13px Arial`;
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        // Truncate text if too long
        const maxWidth = this.width - x - 10;
        let text = node.label || node.title || node.name || node.id;
        
        if (renderer.measureText(text).width > maxWidth) {
            while (text.length > 0 && renderer.measureText(text + '...').width > maxWidth) {
                text = text.slice(0, -1);
            }
            text += '...';
        }
        
        renderer.fillText(text, x, y + this.nodeHeight / 2);
    }
    
    renderNodeFocusIndicator(renderer, y, colors) {
        renderer.strokeStyle = colors.focus;
        renderer.lineWidth = 2;
        renderer.setLineDash([2, 2]);
        renderer.strokeRect(2, y + 1, this.width - 4, this.nodeHeight - 2);
        renderer.setLineDash([]);
    }
    
    renderFocusIndicator(renderer, colors) {
        if (!this.focusedNode) return;
        
        const nodeIndex = this.visibleNodes.findIndex(n => n.id === this.focusedNode);
        if (nodeIndex === -1) return;
        
        const y = nodeIndex * this.nodeHeight - this.scrollY;
        this.renderNodeFocusIndicator(renderer, y, colors);
    }
    
    needsScrollbar() {
        return this.visibleNodes.length * this.nodeHeight > this.height;
    }
    
    renderScrollbar(renderer, colors) {
        const scrollbarWidth = 8;
        const scrollbarX = this.width - scrollbarWidth;
        
        // Scrollbar track
        renderer.fillStyle = colors.surface;
        renderer.fillRect(scrollbarX, 0, scrollbarWidth, this.height);
        
        // Scrollbar thumb
        const totalHeight = this.visibleNodes.length * this.nodeHeight;
        const thumbHeight = Math.max(20, (this.height / totalHeight) * this.height);
        const scrollRange = totalHeight - this.height;
        const thumbY = scrollRange > 0 ? (this.scrollY / scrollRange) * (this.height - thumbHeight) : 0;
        
        renderer.fillStyle = colors.primary;
        renderer.globalAlpha = 0.6;
        renderer.fillRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight);
        renderer.globalAlpha = 1;
    }
    
    // Enhanced event handling with keyboard support
    handleKeyDown(event) {
        if (this.disabled) return;
        
        const handler = this.keyboardHandler[event.key];
        if (handler) {
            event.preventDefault();
            event.stopPropagation();
            handler();
        }
    }
    
    updateAccessibility() {
        this.setAttribute('aria-multiselectable', this.multiSelect.toString());
        this.setAttribute('aria-disabled', this.disabled.toString());
        
        if (this.focusedNode) {
            this.setAttribute('aria-activedescendant', this.focusedNode);
        } else {
            this.removeAttribute('aria-activedescendant');
        }
    }
    
    // Utility methods
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    prefersReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    clearRenderCache() {
        this.renderCache.clear();
        this.invalidate();
    }
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    reset() {
        this.selectedNodes.clear();
        this.selectedNode = null;
        this.focusedNode = null;
        this.hoveredNode = null;
        this.scrollY = 0;
        this.scrollX = 0;
        
        this.animationState.expandAnimations.clear();
        this.animationState.collapseAnimations.clear();
        this.animatingNodes.clear();
        AnimationManager.cancelAllAnimations();
        
        this.updateAccessibility();
        this.clearRenderCache();
        
        this.announceChange('Tree view reset');
        this.emit('reset');
    }
    
    destroy() {
        // Clean up resources
        if (this.announcer && this.announcer.parentNode) {
            this.announcer.parentNode.removeChild(this.announcer);
        }
        
        this.animationState.expandAnimations.clear();
        this.animationState.collapseAnimations.clear();
        AnimationManager.cancelAllAnimations();
        this.renderCache.clear();
        
        super.destroy();
    }
    
    // Public API methods
    setData(data) {
        this.data = Array.isArray(data) ? data : [];
        this.setupNodes();
        this.announceChange(`Tree updated with ${this.visibleNodes.length} items`);
        this.emit('dataChanged', { data: this.data });
    }
    
    getSelectedNodes() {
        return Array.from(this.selectedNodes).map(id => this.findNodeById(id)).filter(Boolean);
    }
    
    setSelectedNodes(nodeIds) {
        this.selectedNodes.clear();
        
        if (Array.isArray(nodeIds)) {
            for (const nodeId of nodeIds) {
                if (this.findNodeById(nodeId)) {
                    this.selectedNodes.add(nodeId);
                }
            }
        }
        
        this.selectedNode = this.selectedNodes.size > 0 ? Array.from(this.selectedNodes)[0] : null;
        this.updateAccessibility();
        this.invalidate();
        this.emit('selectionChanged', { selectedNodes: this.getSelectedNodes() });
    }
    
    expandAll() {
        const expandAllRecursive = (nodes) => {
            for (const node of nodes) {
                if (node.children && node.children.length > 0) {
                    this.expandedNodes.add(node.id);
                    expandAllRecursive(node.children);
                }
            }
        };
        
        expandAllRecursive(this.data);
        this.updateVirtualization();
        this.announceChange('All nodes expanded');
        this.emit('allExpanded');
    }
    
    collapseAll() {
        this.expandedNodes.clear();
        this.updateVirtualization();
        this.announceChange('All nodes collapsed');
        this.emit('allCollapsed');
    }
    
    setTheme(theme) {
        this.theme = theme;
        this.clearRenderCache();
        this.emit('themeChanged', { theme });
    }
    
    setMultiSelect(enabled) {
        this.multiSelect = enabled;
        this.updateAccessibility();
        if (!enabled && this.selectedNodes.size > 1) {
            // Keep only the first selected node
            const firstSelected = Array.from(this.selectedNodes)[0];
            this.selectedNodes.clear();
            if (firstSelected) {
                this.selectedNodes.add(firstSelected);
                this.selectedNode = firstSelected;
            }
        }
        this.invalidate();
        this.emit('multiSelectChanged', { enabled });
    }
}

// =============================================================================
// FILE UPLOAD COMPONENT
// =============================================================================

/**
 * Advanced FileUpload component with accessibility, animations,
 * theme support, and modern interaction patterns.
 */
export class FileUpload extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 400,
            height: options.height || 200,
            ariaRole: 'button',
            ariaLabel: options.ariaLabel || 'File Upload Area'
        });
        
        // Validate options
        this.validateOptions(options);
        
        // Core properties
        this.multiple = options.multiple || false;
        this.accept = options.accept || '*/*';
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB
        this.maxFiles = options.maxFiles || (this.multiple ? 10 : 1);
        this.disabled = options.disabled || false;
        this.allowDirectories = options.allowDirectories || false;
        
        // Theme integration
        this.theme = options.theme || ComponentTheme.getCurrentTheme();
        
        // Enhanced messaging
        this.uploadText = options.uploadText || 'Drop files here or click to upload';
        this.browseText = options.browseText || 'Browse Files';
        this.errorMessages = {
            fileSize: 'File size exceeds maximum allowed size',
            fileType: 'File type is not supported',
            maxFiles: 'Maximum number of files exceeded',
            ...options.errorMessages
        };
        
        // Enhanced state management
        this.files = [];
        this.isDragOver = false;
        this.isUploading = false;
        this.uploadProgress = new Map(); // Per-file progress
        this.totalProgress = 0;
        this.errors = new Map();
        this.completedUploads = new Set();
        
        // Animation and performance
        this.animationState = {
            dragAnimation: null,
            progressAnimations: new Map()
        };
        this.renderCache = new Map();
        this.throttledRender = this.throttle(this.render.bind(this), PERFORMANCE_THRESHOLDS.eventThrottle);
        
        // Accessibility
        this.announcer = this.createScreenReaderAnnouncer();
        this.keyboardHandler = this.createKeyboardHandler();
        
        // Error handling
        this.errorHandler = this.createErrorHandler();
        
        // Performance monitoring
        this.performanceMonitor = PerformanceMonitor.createInstance('FileUpload');
        
        try {
            this.setupEventHandlers();
            this.setupAccessibility();
            this.setupFileInput();
        } catch (error) {
            this.errorHandler.handle(error, 'constructor');
        }
    }
    
    validateOptions(options) {
        if (options.maxFileSize && (typeof options.maxFileSize !== 'number' || options.maxFileSize <= 0)) {
            throw new ComponentError('maxFileSize must be a positive number', 'FileUpload');
        }
        
        if (options.maxFiles && (typeof options.maxFiles !== 'number' || options.maxFiles < 1)) {
            throw new ComponentError('maxFiles must be at least 1', 'FileUpload');
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
            'Enter': () => this.triggerFileSelect(),
            'Space': () => this.triggerFileSelect(),
            'Escape': () => this.handleEscape()
        };
    }
    
    createErrorHandler() {
        return {
            handle: (error, context) => {
                const componentError = new ComponentError(
                    error.message || 'Unknown error',
                    'FileUpload',
                    { context, originalError: error }
                );
                
                console.error('FileUpload Error:', componentError);
                this.emit('error', componentError);
                
                this.recoverFromError(context);
            }
        };
    }
    
    recoverFromError(context) {
        switch (context) {
            case 'file-validation':
                this.clearErrors();
                break;
            case 'upload':
                this.isUploading = false;
                this.uploadProgress.clear();
                break;
            case 'animation':
                this.animationState.dragAnimation = null;
                this.animationState.progressAnimations.clear();
                AnimationManager.cancelAllAnimations();
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
        this.setAttribute('role', 'button');
        this.setAttribute('aria-label', this.multiple ? 'Upload multiple files' : 'Upload file');
        this.setAttribute('aria-describedby', this.uploadText);
        
        // Keyboard accessibility
        this.setAttribute('tabindex', this.disabled ? '-1' : '0');
        
        // Focus management
        this.addEventListener('focusin', () => this.handleFocusIn());
        this.addEventListener('focusout', () => this.handleFocusOut());
    }
    
    setupFileInput() {
        // Create hidden file input
        this.fileInput = document.createElement('input');
        this.fileInput.type = 'file';
        this.fileInput.multiple = this.multiple;
        this.fileInput.accept = this.accept;
        if (this.allowDirectories) {
            this.fileInput.webkitdirectory = true;
        }
        this.fileInput.style.display = 'none';
        
        this.fileInput.addEventListener('change', (event) => {
            this.handleFileInputChange(event);
        });
        
        document.body.appendChild(this.fileInput);
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('dragEnter', (event) => this.handleDragEnter(event));
        this.on('dragOver', (event) => this.handleDragOver(event));
        this.on('dragLeave', (event) => this.handleDragLeave(event));
        this.on('drop', (event) => this.handleDrop(event));
    }
    
    // File Management
    addFiles(fileList) {
        const newFiles = Array.from(fileList);
        
        // Validate files
        const validFiles = newFiles.filter(file => this.validateFile(file));
        
        if (!this.multiple) {
            this.files = validFiles.slice(0, 1);
        } else {
            this.files = [...this.files, ...validFiles].slice(0, this.maxFiles);
        }
        
        this.emit('filesAdded', { files: validFiles });
        
        if (validFiles.length !== newFiles.length) {
            this.emit('filesRejected', { 
                rejected: newFiles.filter(f => !this.validateFile(f)) 
            });
        }
    }
    
    validateFile(file) {
        // Size validation
        if (file.size > this.maxFileSize) {
            return false;
        }
        
        // Type validation
        if (this.accept !== '*/*') {
            const acceptedTypes = this.accept.split(',').map(type => type.trim());
            const isAccepted = acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    // File extension
                    return file.name.toLowerCase().endsWith(type.toLowerCase());
                } else {
                    // MIME type
                    return file.type === type || file.type.startsWith(type.replace('*', ''));
                }
            });
            
            if (!isAccepted) {
                return false;
            }
        }
        
        return true;
    }
    
    removeFile(index) {
        if (index >= 0 && index < this.files.length) {
            const removedFile = this.files.splice(index, 1)[0];
            this.emit('fileRemoved', { file: removedFile, index });
        }
    }
    
    clearFiles() {
        this.files = [];
        this.emit('filesCleared');
    }
    
    startUpload() {
        if (this.files.length === 0 || this.isUploading) return;
        
        this.isUploading = true;
        this.uploadProgress = 0;
        this.emit('uploadStarted', { files: this.files });
        
        // Simulate upload progress (in real implementation, this would be actual upload)
        this.simulateUpload();
    }
    
    simulateUpload() {
        const interval = setInterval(() => {
            this.uploadProgress += Math.random() * 0.1;
            
            if (this.uploadProgress >= 1) {
                this.uploadProgress = 1;
                this.isUploading = false;
                clearInterval(interval);
                this.emit('uploadCompleted', { files: this.files });
            } else {
                this.emit('uploadProgress', { progress: this.uploadProgress });
            }
        }, 100);
    }
    
    // Event Handlers
    handleClick(event) {
        if (this.disabled) return;
        
        // In a real implementation, this would trigger a file picker dialog
        this.emit('browseRequested');
    }
    
    handleDragEnter(event) {
        if (this.disabled) return;
        
        event.preventDefault?.();
        this.isDragOver = true;
    }
    
    handleDragOver(event) {
        if (this.disabled) return;
        
        event.preventDefault?.();
        this.isDragOver = true;
    }
    
    handleDragLeave(event) {
        if (this.disabled) return;
        
        this.isDragOver = false;
    }
    
    handleDrop(event) {
        if (this.disabled) return;
        
        event.preventDefault?.();
        this.isDragOver = false;
        
        if (event.dataTransfer?.files) {
            this.addFiles(event.dataTransfer.files);
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Background
        let backgroundColor = this.backgroundColor;
        if (this.isDragOver) {
            backgroundColor = this.dragOverColor;
        } else if (this.disabled) {
            backgroundColor = '#f8f9fa';
        }
        
        renderer.fillStyle = backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        renderer.strokeStyle = this.isDragOver ? '#007bff' : this.borderColor;
        renderer.lineWidth = this.isDragOver ? 2 : 1;
        renderer.setLineDash(this.isDragOver ? [5, 5] : []);
        renderer.strokeRect(0, 0, this.width, this.height);
        renderer.setLineDash([]);
        
        if (this.files.length === 0) {
            this.renderEmptyState(renderer);
        } else {
            this.renderFileList(renderer);
        }
        
        if (this.isUploading) {
            this.renderUploadProgress(renderer);
        }
    }
    
    renderEmptyState(renderer) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Upload icon
        renderer.fillStyle = this.iconColor;
        renderer.font = '48px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('📁', centerX, centerY - 30);
        
        // Upload text
        renderer.fillStyle = this.disabled ? '#999999' : this.textColor;
        renderer.font = '14px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(this.uploadText, centerX, centerY + 10);
        
        // Browse button
        if (!this.disabled) {
            const buttonWidth = 120;
            const buttonHeight = 32;
            const buttonX = centerX - buttonWidth / 2;
            const buttonY = centerY + 30;
            
            renderer.fillStyle = '#007bff';
            renderer.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            renderer.fillStyle = '#ffffff';
            renderer.font = '12px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(this.browseText, centerX, buttonY + buttonHeight / 2);
        }
    }
    
    renderFileList(renderer) {
        const itemHeight = 30;
        const startY = 10;
        
        renderer.fillStyle = this.textColor;
        renderer.font = '12px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        this.files.forEach((file, index) => {
            const y = startY + index * itemHeight;
            
            // File icon
            renderer.fillText('📄', 10, y + itemHeight / 2);
            
            // File name
            renderer.fillText(file.name, 35, y + itemHeight / 2);
            
            // File size
            const sizeText = this.formatFileSize(file.size);
            renderer.fillStyle = '#666666';
            renderer.textAlign = 'right';
            renderer.fillText(sizeText, this.width - 50, y + itemHeight / 2);
            
            // Remove button
            renderer.fillStyle = '#dc3545';
            renderer.textAlign = 'center';
            renderer.fillText('×', this.width - 20, y + itemHeight / 2);
            
            renderer.fillStyle = this.textColor;
            renderer.textAlign = 'left';
        });
    }
    
    renderUploadProgress(renderer) {
        const progressHeight = 4;
        const progressY = this.height - progressHeight - 10;
        
        // Progress background
        renderer.fillStyle = '#e9ecef';
        renderer.fillRect(10, progressY, this.width - 20, progressHeight);
        
        // Progress bar
        renderer.fillStyle = '#007bff';
        renderer.fillRect(10, progressY, (this.width - 20) * this.uploadProgress, progressHeight);
        
        // Progress text
        renderer.fillStyle = this.textColor;
        renderer.font = '11px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'bottom';
        renderer.fillText(
            `Uploading... ${Math.round(this.uploadProgress * 100)}%`,
            this.width / 2,
            progressY - 5
        );
    }
    
    // Utility Methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Public API
    getFiles() {
        return [...this.files];
    }
      
    setupEventHandlers() {
        const eventHandlers = {
            'click': this.handleClick.bind(this),
            'dragenter': this.handleDragEnter.bind(this),
            'dragover': this.handleDragOver.bind(this),
            'dragleave': this.handleDragLeave.bind(this),
            'drop': this.handleDrop.bind(this),
            'keydown': this.handleKeyDown.bind(this),
            'focus': this.handleFocus.bind(this),
            'blur': this.handleBlur.bind(this)
        };
        
        Object.entries(eventHandlers).forEach(([event, handler]) => {
            this.on(event, handler);
        });
    }
    
    // Enhanced file management
    async addFiles(fileList) {
        try {
            const newFiles = Array.from(fileList);
            const validFiles = [];
            
            for (const file of newFiles) {
                if (this.validateFile(file)) {
                    validFiles.push({
                        file,
                        id: `file-${Date.now()}-${Math.random()}`,
                        name: file.name,
                        size: file.size,
                        type: file.type,
                        status: 'pending',
                        progress: 0,
                        error: null
                    });
                }
            }
            
            if (!this.multiple) {
                this.files = validFiles.slice(0, 1);
            } else {
                this.files = [...this.files, ...validFiles].slice(0, this.maxFiles);
            }
            
            this.clearRenderCache();
            this.announceChange(`${validFiles.length} file(s) added`);
            this.emit('filesAdded', { files: validFiles });
            
            return validFiles;
        } catch (error) {
            this.errorHandler.handle(error, 'addFiles');
            return [];
        }
    }
    
    validateFile(file) {
        try {
            // Size validation
            if (file.size > this.maxFileSize) {
                this.errors.set(file.name, this.errorMessages.fileSize);
                return false;
            }
            
            // Type validation
            if (this.accept !== '*/*') {
                const acceptTypes = this.accept.split(',').map(type => type.trim());
                const isValid = acceptTypes.some(acceptType => {
                    if (acceptType.startsWith('.')) {
                        return file.name.toLowerCase().endsWith(acceptType.toLowerCase());
                    } else {
                        return file.type.match(acceptType.replace('*', '.*'));
                    }
                });
                
                if (!isValid) {
                    this.errors.set(file.name, this.errorMessages.fileType);
                    return false;
                }
            }
            
            return true;
        } catch (error) {
            this.errorHandler.handle(error, 'validateFile');
            return false;
        }
    }
    
    async removeFile(fileId) {
        try {
            const index = this.files.findIndex(f => f.id === fileId);
            if (index >= 0) {
                const removedFile = this.files.splice(index, 1)[0];
                this.uploadProgress.delete(fileId);
                this.errors.delete(removedFile.name);
                
                this.clearRenderCache();
                this.announceChange(`${removedFile.name} removed`);
                this.emit('fileRemoved', { file: removedFile });
                
                return true;
            }
            return false;
        } catch (error) {
            this.errorHandler.handle(error, 'removeFile');
            return false;
        }
    }
    
    clearFiles() {
        this.files = [];
        this.uploadProgress.clear();
        this.errors.clear();
        this.completedUploads.clear();
        this.clearRenderCache();
        this.announceChange('All files cleared');
        this.emit('filesCleared');
    }
    
    // Event handlers
    handleClick(event) {
        if (!this.disabled) {
            this.triggerFileSelect();
        }
    }
    
    handleDragEnter(event) {
        if (!this.disabled) {
            event.preventDefault();
            this.isDragOver = true;
            this.animateDragState(true);
            this.invalidate();
        }
    }
    
    handleDragOver(event) {
        if (!this.disabled) {
            event.preventDefault();
            this.isDragOver = true;
        }
    }
    
    handleDragLeave(event) {
        if (!this.disabled) {
            this.isDragOver = false;
            this.animateDragState(false);
            this.invalidate();
        }
    }
    
    handleDrop(event) {
        if (!this.disabled) {
            event.preventDefault();
            this.isDragOver = false;
            this.animateDragState(false);
            
            const files = event.dataTransfer.files;
            if (files.length > 0) {
                this.addFiles(files);
            }
            
            this.invalidate();
        }
    }
    
    handleKeyDown(event) {
        if (this.disabled) return;
        
        const handler = this.keyboardHandler[event.key];
        if (handler) {
            event.preventDefault();
            handler();
        }
    }
    
    handleFileInputChange(event) {
        const files = event.target.files;
        if (files && files.length > 0) {
            this.addFiles(files);
        }
        // Reset input
        event.target.value = '';
    }
    
    handleFocus() {
        this.invalidate();
    }
    
    handleBlur() {
        this.invalidate();
    }
    
    handleFocusIn() {
        this.invalidate();
    }
    
    handleFocusOut() {
        this.invalidate();
    }
    
    handleEscape() {
        if (this.isUploading) {
            this.cancelUpload();
        }
    }
    
    // Animation methods
    async animateDragState(isDragOver) {
        if (this.prefersReducedMotion()) return;
        
        const duration = 200;
        const startScale = isDragOver ? 1 : 1.02;
        const endScale = isDragOver ? 1.02 : 1;
        
        if (this.animationState.dragAnimation) {
            AnimationManager.cancelAnimation(this.animationState.dragAnimation);
        }
        
        this.animationState.dragAnimation = AnimationManager.createAnimation({
            duration,
            easing: 'easeOutCubic',
            onUpdate: (progress) => {
                const scale = startScale + (endScale - startScale) * progress;
                this.animationScale = scale;
                this.invalidate();
            },
            onComplete: () => {
                this.animationScale = endScale;
                this.animationState.dragAnimation = null;
                this.invalidate();
            }
        });
        
        return this.animationState.dragAnimation.start();
    }
    
    // File operations
    triggerFileSelect() {
        if (!this.disabled && this.fileInput) {
            this.fileInput.click();
        }
    }
    
    async startUpload(uploadFunction) {
        if (this.isUploading || this.files.length === 0) return;
        
        try {
            this.isUploading = true;
            this.totalProgress = 0;
            
            this.announceChange('Upload started');
            this.emit('uploadStart', { files: this.files });
            
            for (const fileData of this.files) {
                if (fileData.status === 'pending') {
                    fileData.status = 'uploading';
                    
                    try {
                        const result = await uploadFunction(fileData.file, (progress) => {
                            this.uploadProgress.set(fileData.id, progress);
                            this.updateTotalProgress();
                            this.invalidate();
                        });
                        
                        fileData.status = 'completed';
                        this.completedUploads.add(fileData.id);
                        this.emit('fileUploaded', { file: fileData, result });
                        
                    } catch (error) {
                        fileData.status = 'error';
                        fileData.error = error.message;
                        this.errors.set(fileData.name, error.message);
                        this.emit('fileError', { file: fileData, error });
                    }
                }
            }
            
            this.isUploading = false;
            this.announceChange('Upload completed');
            this.emit('uploadComplete', { files: this.files });
            
        } catch (error) {
            this.isUploading = false;
            this.errorHandler.handle(error, 'upload');
        }
    }
    
    cancelUpload() {
        this.isUploading = false;
        this.uploadProgress.clear();
        
        this.files.forEach(fileData => {
            if (fileData.status === 'uploading') {
                fileData.status = 'cancelled';
            }
        });
        
        this.announceChange('Upload cancelled');
        this.emit('uploadCancelled');
    }
    
    updateTotalProgress() {
        if (this.files.length === 0) {
            this.totalProgress = 0;
            return;
        }
        
        const totalProgress = Array.from(this.uploadProgress.values())
            .reduce((sum, progress) => sum + progress, 0);
        
        this.totalProgress = totalProgress / this.files.length;
    }
    
    // Enhanced rendering with theme support
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        try {
            const theme = ComponentTheme.themes[this.theme];
            
            this.renderUploadArea(renderer, theme);
            this.renderFiles(renderer, theme);
            
            if (this.isUploading) {
                this.renderProgress(renderer, theme);
            }
        } catch (error) {
            this.errorHandler.handle(error, 'render');
        }
    }
    
    renderUploadArea(renderer, theme) {
        const scale = this.animationScale || 1;
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        renderer.save();
        renderer.translate(centerX, centerY);
        renderer.scale(scale, scale);
        renderer.translate(-centerX, -centerY);
        
        // Background
        let backgroundColor = theme.background;
        if (this.isDragOver) {
            backgroundColor = theme.uploadHover;
        } else if (this.disabled) {
            backgroundColor = theme.backgroundDisabled;
        }
        
        renderer.fillStyle = backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        const borderColor = this.isDragOver ? theme.uploadBorder : theme.border;
        renderer.strokeStyle = borderColor;
        renderer.lineWidth = this.isDragOver ? 3 : 2;
        renderer.setLineDash(this.isDragOver ? [10, 5] : []);
        renderer.strokeRect(0, 0, this.width, this.height);
        renderer.setLineDash([]);
        
        // Upload icon and text
        if (this.files.length === 0) {
            renderer.fillStyle = theme.textSecondary;
            renderer.font = '48px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText('📁', centerX, centerY - 20);
            
            renderer.fillStyle = theme.text;
            renderer.font = '14px Arial';
            renderer.fillText(this.uploadText, centerX, centerY + 20);
            
            renderer.fillStyle = theme.primary;
            renderer.font = 'bold 12px Arial';
            renderer.fillText(this.browseText, centerX, centerY + 40);
        }
        
        renderer.restore();
    }
    
    renderFiles(renderer, theme) {
        if (this.files.length === 0) return;
        
        const fileHeight = 30;
        const startY = 10;
        
        this.files.forEach((fileData, index) => {
            const y = startY + index * fileHeight;
            
            // File background
            let bgColor = theme.backgroundSecondary;
            if (fileData.status === 'error') {
                bgColor = theme.uploadError;
            } else if (fileData.status === 'completed') {
                bgColor = theme.success;
            }
            
            renderer.fillStyle = bgColor;
            renderer.fillRect(5, y, this.width - 10, fileHeight - 2);
            
            // File name
            renderer.fillStyle = theme.text;
            renderer.font = '12px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            renderer.fillText(fileData.name, 15, y + fileHeight / 2);
            
            // File size
            const sizeText = this.formatFileSize(fileData.size);
            renderer.fillStyle = theme.textSecondary;
            renderer.font = '10px Arial';
            renderer.textAlign = 'right';
            renderer.fillText(sizeText, this.width - 15, y + fileHeight / 2);
            
            // Progress bar
            if (fileData.status === 'uploading') {
                const progress = this.uploadProgress.get(fileData.id) || 0;
                const progressWidth = (this.width - 30) * (progress / 100);
                
                renderer.fillStyle = theme.progressTrack;
                renderer.fillRect(10, y + fileHeight - 8, this.width - 20, 4);
                
                renderer.fillStyle = theme.progressFill;
                renderer.fillRect(10, y + fileHeight - 8, progressWidth, 4);
            }
        });
    }
    
    renderProgress(renderer, theme) {
        if (!this.isUploading) return;
        
        const progressHeight = 20;
        const y = this.height - progressHeight - 10;
        const progressWidth = (this.width - 20) * (this.totalProgress / 100);
        
        // Progress background
        renderer.fillStyle = theme.progressTrack;
        renderer.fillRect(10, y, this.width - 20, progressHeight);
        
        // Progress fill
        renderer.fillStyle = theme.progressFill;
        renderer.fillRect(10, y, progressWidth, progressHeight);
        
        // Progress text
        renderer.fillStyle = theme.text;
        renderer.font = '12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(
            `${Math.round(this.totalProgress)}%`,
            this.width / 2,
            y + progressHeight / 2
        );
    }
    
    // Utility methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 Bytes';
        const k = 1024;
        const sizes = ['Bytes', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
    }
    
    clearErrors() {
        this.errors.clear();
        this.clearRenderCache();
    }
    
    announceChange(message) {
        if (this.announcer) {
            this.announcer.textContent = message;
        }
    }
    
    prefersReducedMotion() {
        return window.matchMedia && 
               window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }
    
    clearRenderCache() {
        this.renderCache.clear();
        this.invalidate();
    }
    
    throttle(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
    
    reset() {
        this.clearFiles();
        this.isUploading = false;
        this.isDragOver = false;
        this.totalProgress = 0;
        this.animationScale = 1;
        
        this.animationState.dragAnimation = null;
        this.animationState.progressAnimations.clear();
        AnimationManager.cancelAllAnimations();
        
        this.announceChange('File upload reset');
        this.emit('reset');
    }
    
    destroy() {
        // Clean up resources
        if (this.fileInput && this.fileInput.parentNode) {
            this.fileInput.parentNode.removeChild(this.fileInput);
        }
        
        if (this.announcer && this.announcer.parentNode) {
            this.announcer.parentNode.removeChild(this.announcer);
        }
        
        this.animationState.dragAnimation = null;
        this.animationState.progressAnimations.clear();
        AnimationManager.cancelAllAnimations();
        this.renderCache.clear();
        
        super.destroy();
    }
    
    // Public API
    getFiles() {
        return [...this.files];
    }
    
    hasFiles() {
        return this.files.length > 0;
    }
    
    getErrors() {
        return new Map(this.errors);
    }
    
    setMultiple(multiple) {
        this.multiple = multiple;
        if (this.fileInput) {
            this.fileInput.multiple = multiple;
        }
        this.setAttribute('aria-label', multiple ? 'Upload multiple files' : 'Upload file');
    }
    
    setAccept(accept) {
        this.accept = accept;
        if (this.fileInput) {
            this.fileInput.accept = accept;
        }
    }
    
    setMaxFileSize(size) {
        this.maxFileSize = size;
    }
    
    getUploadProgress() {
        return this.totalProgress;
    }
    
    setTheme(theme) {
        this.theme = theme;
        this.clearRenderCache();
        this.emit('themeChanged', { theme });
    }
}

// Export all components
export {
    TabContainer,
    ProgressStepper,
    SplitPane,
    TreeView,
    FileUpload
};

export default {
    TabContainer,
    ProgressStepper,
    SplitPane,
    TreeView,
    FileUpload
};
