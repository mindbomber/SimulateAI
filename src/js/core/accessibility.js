/**
 * AccessibilityManager - Enhanced accessibility features for simulations
 * Modern implementation with theme support, performance optimization, and advanced features
 * 
 * Features:
 * - WCAG 2.1 AA compliance
 * - Dark mode and theme integration
 * - Performance monitoring
 * - Advanced error handling
 * - Animation management
 * - Touch/gesture support
 * - RTL language support
 * 
 * @version 2.0.0
 * @author SimulateAI Team
 */

// Enhanced constants and configuration
const ACCESSIBILITY_CONSTANTS = {
    ANNOUNCEMENT_DELAY: 100,
    FOCUS_DELAY: 16,
    KEYBOARD_REPEAT_DELAY: 200,
    ANIMATION_DURATION: 250,
    HIGH_CONTRAST_THRESHOLD: 4.5,
    TOUCH_TARGET_MIN_SIZE: 44
};

const SCREEN_READER_PATTERNS = {
    NVDA: /nvda/i,
    JAWS: /jaws/i,
    VOICEOVER: /voiceover/i,
    NARRATOR: /narrator/i,
    DRAGON: /dragon/i
};

/**
 * Enhanced theme management for accessibility features
 */
class AccessibilityTheme {
    static getCurrentTheme() {
        const prefersHighContrast = window.matchMedia?.('(prefers-contrast: high)').matches;
        const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
        const prefersReducedMotion = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
        
        return {
            highContrast: prefersHighContrast,
            darkMode: prefersDark,
            reducedMotion: prefersReducedMotion,
            theme: prefersHighContrast ? 'highContrast' : (prefersDark ? 'dark' : 'light')
        };
    }
    
    static getFocusStyle(theme = null) {
        const currentTheme = theme || this.getCurrentTheme();
        
        if (currentTheme.highContrast) {
            return {
                outline: '3px solid #ffff00',
                outlineOffset: '2px',
                backgroundColor: 'transparent'
            };
        }
        
        return {
            outline: '2px solid #007bff',
            outlineOffset: '2px',
            backgroundColor: currentTheme.darkMode ? 'rgba(77, 166, 255, 0.1)' : 'rgba(0, 123, 255, 0.1)'
        };
    }
}

/**
 * Performance monitoring for accessibility operations
 */
class AccessibilityPerformanceMonitor {
    static metrics = new Map();
    
    static startOperation(operationName) {
        const startTime = performance.now();
        this.metrics.set(operationName, { startTime, operations: 0 });
        return startTime;
    }
    
    static endOperation(operationName, startTime = null) {
        const endTime = performance.now();
        const metric = this.metrics.get(operationName);
        
        if (metric) {
            const duration = endTime - (startTime || metric.startTime);
            metric.operations += 1;
            metric.lastDuration = duration;
            metric.averageDuration = ((metric.averageDuration || 0) * (metric.operations - 1) + duration) / metric.operations;
            
            // Performance warning for slow accessibility operations
            if (duration > ACCESSIBILITY_CONSTANTS.FOCUS_DELAY * 2) {
                console.warn(`Slow accessibility operation: ${operationName} took ${duration.toFixed(2)}ms`);
            }
        }
    }
    
    static getMetrics() {
        return Object.fromEntries(this.metrics);
    }
}

/**
 * Enhanced error handling for accessibility operations
 */
class AccessibilityError extends Error {
    constructor(message, context = {}, originalError = null) {
        super(message);
        this.name = 'AccessibilityError';
        this.context = context;
        this.originalError = originalError;
        this.timestamp = new Date().toISOString();
        this.userAgent = navigator.userAgent;
        this.screenReader = AccessibilityManager.detectScreenReaderType();
    }
}

class AccessibilityManager {
    constructor(container, engine) {
        this.container = container;
        this.engine = engine;
        this.components = new Map();
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.keyboardNavigationEnabled = true;
        this.screenReaderEnabled = this.detectScreenReader();
        
        // Enhanced state management
        this.announcements = [];
        this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY;
        this.theme = AccessibilityTheme.getCurrentTheme();
        this.isHighContrastMode = this.theme.highContrast;
        this.isReducedMotionMode = this.theme.reducedMotion;
        
        // Performance monitoring
        this.performanceMonitor = AccessibilityPerformanceMonitor;
        this.renderCache = new Map();
        
        // Advanced features
        this.gestureHandler = null;
        this.voiceCommands = new Map();
        this.keyboardShortcuts = new Map();
        this.focusHistory = [];
        this.regionManager = new Map();
        
        // Error handling
        this.errorCount = 0;
        this.lastError = null;
          this.init();
    }

    init() {
        const startTime = this.performanceMonitor.startOperation('accessibility-init');
        
        try {
            this.setupContainer();
            this.setupKeyboardNavigation();
            this.setupScreenReaderSupport();
            this.setupFocusManagement();
            this.setupThemeIntegration();
            this.setupGestureSupport();
            this.createAccessibilityOverlay();
            this.setupPerformanceMonitoring();
            
            // Listen for theme changes
            this.setupThemeChangeListeners();
            
            // Setup voice commands if supported
            this.setupVoiceCommands();
            
            console.log('Enhanced AccessibilityManager initialized with advanced features');
        } catch (error) {
            this.handleError(new AccessibilityError('Failed to initialize AccessibilityManager', { container: this.container.id }, error));
        } finally {
            this.performanceMonitor.endOperation('accessibility-init', startTime);
        }
    }

    setupContainer() {
        // Enhanced container setup with theme awareness
        if (!this.container.hasAttribute('tabindex')) {
            this.container.setAttribute('tabindex', '0');
        }
        
        if (!this.container.hasAttribute('role')) {
            this.container.setAttribute('role', 'application');
        }
        
        if (!this.container.hasAttribute('aria-label')) {
            this.container.setAttribute('aria-label', 'AI Ethics Simulation Environment');
        }

        // Enhanced accessibility attributes
        this.container.setAttribute('aria-describedby', 'accessibility-description');
        this.container.setAttribute('aria-live', 'polite');
        this.container.setAttribute('aria-atomic', 'false');
        
        // Theme-aware classes
        this.container.classList.add('accessibility-enabled');
        this.updateContainerTheme();
        
        // Create accessibility description
        this.createAccessibilityDescription();
    }
    
    createAccessibilityDescription() {
        if (document.getElementById('accessibility-description')) return;
        
        const description = document.createElement('div');
        description.id = 'accessibility-description';
        description.className = 'sr-only';
        description.textContent = 'Interactive AI ethics simulation with keyboard navigation, screen reader support, and voice commands. Press ? for help.';
        document.body.appendChild(description);
    }
    
    updateContainerTheme() {
        this.container.classList.toggle('high-contrast', this.theme.highContrast);
        this.container.classList.toggle('dark-mode', this.theme.darkMode);
        this.container.classList.toggle('reduced-motion', this.theme.reducedMotion);
        
        // Update CSS custom properties for enhanced theming
        this.container.style.setProperty('--accessibility-focus-color', 
            this.theme.highContrast ? '#ffff00' : (this.theme.darkMode ? '#4da6ff' : '#007bff'));
        this.container.style.setProperty('--accessibility-bg-color', 
            this.theme.highContrast ? '#000000' : (this.theme.darkMode ? '#1a1a1a' : '#ffffff'));
    }
    
    setupThemeIntegration() {
        // Apply theme-specific accessibility enhancements
        this.applyThemeSpecificStyles();
        
        // Setup automatic theme detection
        this.observeThemeChanges();
    }
    
    applyThemeSpecificStyles() {
        const focusStyle = AccessibilityTheme.getFocusStyle(this.theme);
        
        // Create or update focus style sheet
        let styleSheet = document.getElementById('accessibility-focus-styles');
        if (!styleSheet) {
            styleSheet = document.createElement('style');
            styleSheet.id = 'accessibility-focus-styles';
            document.head.appendChild(styleSheet);
        }
        
        styleSheet.textContent = `
            .accessibility-enabled *:focus {
                outline: ${focusStyle.outline} !important;
                outline-offset: ${focusStyle.outlineOffset} !important;
                background-color: ${focusStyle.backgroundColor} !important;
            }
            
            .accessibility-enabled .focus-indicator {
                border: 3px solid ${this.theme.highContrast ? '#ffff00' : '#007bff'};
                box-shadow: ${this.theme.highContrast ? 'none' : '0 0 0 1px white'};
            }
            
            .accessibility-enabled .high-contrast {
                filter: ${this.theme.highContrast ? 'contrast(200%) brightness(150%)' : 'none'};
            }
        `;
    }
    
    observeThemeChanges() {
        // Watch for system theme changes
        const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const contrastQuery = window.matchMedia('(prefers-contrast: high)');
        const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
        
        const updateTheme = () => {
            this.theme = AccessibilityTheme.getCurrentTheme();
            this.updateContainerTheme();
            this.applyThemeSpecificStyles();
            this.updateFocusIndicatorTheme();
            this.announce(`Theme updated: ${this.theme.theme} mode`);
        };
        
        if (darkModeQuery.addEventListener) {
            darkModeQuery.addEventListener('change', updateTheme);
            contrastQuery.addEventListener('change', updateTheme);
            motionQuery.addEventListener('change', updateTheme);
        } else {
            // Fallback for older browsers
            darkModeQuery.addListener(updateTheme);
            contrastQuery.addListener(updateTheme);
            motionQuery.addListener(updateTheme);
        }
    }
    
    setupThemeChangeListeners() {
        // Custom theme change events
        document.addEventListener('themechange', (event) => {
            this.theme = AccessibilityTheme.getCurrentTheme();
            this.updateContainerTheme();
            this.applyThemeSpecificStyles();
            this.announce(`Application theme changed to ${event.detail.theme}`);
        });
    }
    
    setupGestureSupport() {
        if (!('ontouchstart' in window)) return;
        
        this.gestureHandler = {
            startX: 0,
            startY: 0,
            threshold: 50,
            restraint: 100,
            allowedTime: 300,
            startTime: 0
        };
        
        this.container.addEventListener('touchstart', (e) => this.handleTouchStart(e), { passive: true });
        this.container.addEventListener('touchend', (e) => this.handleTouchEnd(e), { passive: true });
    }
    
    handleTouchStart(e) {
        const touch = e.changedTouches[0];
        this.gestureHandler.startX = touch.pageX;
        this.gestureHandler.startY = touch.pageY;
        this.gestureHandler.startTime = new Date().getTime();
    }
    
    handleTouchEnd(e) {
        const touch = e.changedTouches[0];
        const distX = touch.pageX - this.gestureHandler.startX;
        const distY = touch.pageY - this.gestureHandler.startY;
        const elapsedTime = new Date().getTime() - this.gestureHandler.startTime;
        
        if (elapsedTime <= this.gestureHandler.allowedTime) {
            if (Math.abs(distX) >= this.gestureHandler.threshold && Math.abs(distY) <= this.gestureHandler.restraint) {
                const direction = distX < 0 ? 'left' : 'right';
                this.handleSwipeGesture(direction);
            } else if (Math.abs(distY) >= this.gestureHandler.threshold && Math.abs(distX) <= this.gestureHandler.restraint) {
                const direction = distY < 0 ? 'up' : 'down';
                this.handleSwipeGesture(direction);
            }
        }
    }
    
    handleSwipeGesture(direction) {
        switch (direction) {
            case 'right':
                this.handleTabNavigation(false);
                this.announce('Swiped to next element');
                break;
            case 'left':
                this.handleTabNavigation(true);
                this.announce('Swiped to previous element');
                break;
            case 'up':
                this.cycleFocusRegions(-1);
                break;
            case 'down':
                this.cycleFocusRegions(1);
                break;
        }
    }
    
    setupVoiceCommands() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            return; // Voice commands not supported
        }
        
        try {
            const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
            this.speechRecognition = new SpeechRecognition();
            this.speechRecognition.continuous = false;
            this.speechRecognition.interimResults = false;
            this.speechRecognition.lang = navigator.language || 'en-US';
            
            this.setupVoiceCommandMap();
            
            this.speechRecognition.onresult = (event) => {
                const command = event.results[0][0].transcript.toLowerCase().trim();
                this.processVoiceCommand(command);
            };
            
            this.speechRecognition.onerror = (event) => {
                console.warn('Speech recognition error:', event.error);
            };
        } catch (error) {
            console.warn('Voice commands setup failed:', error);
        }
    }
    
    setupVoiceCommandMap() {
        this.voiceCommands.set('next', () => this.handleTabNavigation(false));
        this.voiceCommands.set('previous', () => this.handleTabNavigation(true));
        this.voiceCommands.set('activate', () => this.activateCurrentElement());
        this.voiceCommands.set('help', () => this.showKeyboardShortcuts());
        this.voiceCommands.set('escape', () => this.handleEscape());
        this.voiceCommands.set('high contrast', () => this.toggleHighContrastMode());
        this.voiceCommands.set('large text', () => this.toggleLargeTextMode());
    }
    
    processVoiceCommand(command) {
        for (const [trigger, action] of this.voiceCommands) {
            if (command.includes(trigger)) {
                action();
                this.announce(`Voice command executed: ${trigger}`);
                return;
            }
        }
        
        this.announce('Voice command not recognized. Say "help" for available commands.');
    }
    
    setupPerformanceMonitoring() {
        // Monitor focus performance
        let focusOperations = 0;
        const originalFocus = this.focusComponent;
        
        this.focusComponent = (...args) => {
            const startTime = this.performanceMonitor.startOperation('focus-component');
            const result = originalFocus.apply(this, args);
            this.performanceMonitor.endOperation('focus-component', startTime);
            
            focusOperations++;
            if (focusOperations % 100 === 0) {
                console.log('Accessibility Performance:', this.performanceMonitor.getMetrics());
            }
            
            return result;        };
    }

    setupKeyboardNavigation() {
        // Enhanced keyboard event handling with performance optimization
        const throttledKeyDown = this.throttle((e) => this.handleKeyDown(e), ACCESSIBILITY_CONSTANTS.KEYBOARD_REPEAT_DELAY);
        
        this.container.addEventListener('keydown', throttledKeyDown);
        this.container.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Enhanced focus management
        this.container.addEventListener('focus', () => this.onContainerFocus());
        this.container.addEventListener('blur', () => this.onContainerBlur());
        
        // Setup advanced keyboard shortcuts
        this.setupKeyboardShortcuts();
    }
    
    setupKeyboardShortcuts() {
        this.keyboardShortcuts.set('ctrl+shift+?', () => this.showKeyboardShortcuts());
        this.keyboardShortcuts.set('ctrl+shift+h', () => this.toggleHighContrastMode());
        this.keyboardShortcuts.set('ctrl+shift+l', () => this.toggleLargeTextMode());
        this.keyboardShortcuts.set('ctrl+shift+v', () => this.toggleVoiceCommands());
        this.keyboardShortcuts.set('ctrl+shift+r', () => this.resetAccessibilitySettings());
        this.keyboardShortcuts.set('ctrl+shift+f', () => this.showAccessibilityReport());
    }
    
    toggleVoiceCommands() {
        if (this.speechRecognition) {
            if (this.voiceCommandsEnabled) {
                this.speechRecognition.stop();
                this.voiceCommandsEnabled = false;
                this.announce('Voice commands disabled');
            } else {
                this.speechRecognition.start();
                this.voiceCommandsEnabled = true;
                this.announce('Voice commands enabled. Say "help" for available commands.');
            }
        } else {
            this.announce('Voice commands not supported in this browser');
        }
    }
    
    showAccessibilityReport() {
        const metrics = this.performanceMonitor.getMetrics();
        const componentCount = this.components.size;
        const focusableCount = this.focusableElements.length;
        
        const report = `
            Accessibility Report:
            - ${componentCount} registered components
            - ${focusableCount} focusable elements
            - Theme: ${this.theme.theme}
            - High contrast: ${this.theme.highContrast ? 'enabled' : 'disabled'}
            - Reduced motion: ${this.theme.reducedMotion ? 'enabled' : 'disabled'}
            - Screen reader: ${this.screenReaderEnabled ? 'detected' : 'not detected'}
            - Voice commands: ${this.voiceCommandsEnabled ? 'available' : 'not available'}
            - Performance: ${Object.keys(metrics).length} tracked operations
        `;
        
        this.announce(report, true);
        console.log('Accessibility Report:', { metrics, theme: this.theme, components: componentCount });
    }
    
    resetAccessibilitySettings() {
        this.setHighContrastMode(false);
        this.setLargeTextMode(false);
        this.setKeyboardNavigationEnabled(true);
        
        if (this.speechRecognition && this.voiceCommandsEnabled) {
            this.speechRecognition.stop();
            this.voiceCommandsEnabled = false;
        }
          this.announce('Accessibility settings reset to defaults');
    }

    setupScreenReaderSupport() {
        // Enhanced screen reader support with multiple announcement regions
        this.createAnnouncementRegions();
        this.setupScreenReaderDetection();
    }
    
    createAnnouncementRegions() {
        // Primary announcement region (polite)
        this.liveRegion = this.createAnnouncementRegion('polite', 'accessibility-announcements');
        
        // Urgent announcements region (assertive)  
        this.urgentRegion = this.createAnnouncementRegion('assertive', 'accessibility-urgent');
        
        // Status region for ongoing updates
        this.statusRegion = this.createAnnouncementRegion('polite', 'accessibility-status');
        this.statusRegion.setAttribute('aria-atomic', 'false');
        
        // Log region for detailed information
        this.logRegion = this.createAnnouncementRegion('polite', 'accessibility-log');
        this.logRegion.setAttribute('role', 'log');
    }
    
    createAnnouncementRegion(liveType, id) {
        if (document.getElementById(id)) {
            return document.getElementById(id);
        }
        
        const region = document.createElement('div');
        region.id = id;
        region.setAttribute('aria-live', liveType);
        region.setAttribute('aria-atomic', 'true');
        region.className = 'sr-only';
        region.style.cssText = `
            position: absolute !important;
            left: -10000px !important;
            width: 1px !important;
            height: 1px !important;
            overflow: hidden !important;
            clip: rect(1px, 1px, 1px, 1px) !important;
            white-space: nowrap !important;
        `;
        document.body.appendChild(region);
        return region;
    }
    
    setupScreenReaderDetection() {
        // Enhanced screen reader detection
        this.screenReaderType = this.detectScreenReaderType();
        this.screenReaderEnabled = this.screenReaderType !== null;
        
        // Customize behavior based on detected screen reader
        if (this.screenReaderType) {
            this.adaptToScreenReader(this.screenReaderType);
        }
    }
    
    detectScreenReaderType() {
        const userAgent = navigator.userAgent;
        
        for (const [type, pattern] of Object.entries(SCREEN_READER_PATTERNS)) {
            if (pattern.test(userAgent)) {
                return type.toLowerCase();
            }
        }
        
        // Check for screen reader APIs
        if (window.speechSynthesis && window.speechSynthesis.getVoices().length > 0) {
            return 'speech-synthesis';
        }
        
        // Check for high contrast as screen reader indicator
        if (window.matchMedia && window.matchMedia('(prefers-contrast: high)').matches) {
            return 'high-contrast-user';
        }
        
        return null;
    }
    
    adaptToScreenReader(screenReaderType) {
        switch (screenReaderType) {
            case 'nvda':
            case 'jaws':
                // Optimize for Windows screen readers
                this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY * 1.5;
                this.verboseMode = true;
                break;
            case 'voiceover':
                // Optimize for macOS VoiceOver
                this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY;
                this.verboseMode = false;
                break;
            case 'narrator':
                // Optimize for Windows Narrator
                this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY * 2;
                this.verboseMode = true;
                break;
            default:
                this.verboseMode = false;
        }
        
        console.log(`Accessibility optimized for ${screenReaderType} screen reader`);
    }

    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => this.onFocusChange(e));        document.addEventListener('focusout', (e) => this.onFocusChange(e));
    }

    createAccessibilityOverlay() {
        // Enhanced accessibility overlay with modern features
        this.overlay = document.createElement('div');
        this.overlay.className = 'accessibility-overlay';
        this.overlay.setAttribute('aria-hidden', 'true');
        this.overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 10000;
            contain: layout style;
        `;
        
        this.container.appendChild(this.overlay);
        
        // Enhanced focus indicator with theme support
        this.createFocusIndicator();
        
        // Create accessibility toolbar
        this.createAccessibilityToolbar();
    }
    
    createFocusIndicator() {
        this.focusIndicator = document.createElement('div');
        this.focusIndicator.className = 'focus-indicator';
        this.focusIndicator.setAttribute('aria-hidden', 'true');
        this.updateFocusIndicatorTheme();
        
        this.overlay.appendChild(this.focusIndicator);
    }
    
    updateFocusIndicatorTheme() {
        if (!this.focusIndicator) return;
        
        const focusStyle = AccessibilityTheme.getFocusStyle(this.theme);
        this.focusIndicator.style.cssText = `
            position: absolute;
            border: 3px solid ${this.theme.highContrast ? '#ffff00' : '#007bff'};
            border-radius: 4px;
            box-shadow: ${this.theme.highContrast ? 'none' : '0 0 0 1px white, 0 0 8px rgba(0, 123, 255, 0.3)'};
            pointer-events: none;
            transition: ${this.theme.reducedMotion ? 'none' : 'all 0.2s ease'};
            display: none;
            z-index: 10001;
        `;
    }
    
    createAccessibilityToolbar() {
        if (!this.theme.highContrast && !this.isAccessibilityToolbarRequested) return;
        
        this.accessibilityToolbar = document.createElement('div');
        this.accessibilityToolbar.className = 'accessibility-toolbar';
        this.accessibilityToolbar.setAttribute('role', 'toolbar');
        this.accessibilityToolbar.setAttribute('aria-label', 'Accessibility Tools');
        
        const toolbarButtons = [
            { id: 'high-contrast', label: 'Toggle High Contrast', action: () => this.toggleHighContrastMode() },
            { id: 'large-text', label: 'Toggle Large Text', action: () => this.toggleLargeTextMode() },
            { id: 'keyboard-help', label: 'Show Keyboard Help', action: () => this.showKeyboardShortcuts() },
            { id: 'voice-commands', label: 'Toggle Voice Commands', action: () => this.toggleVoiceCommands() }
        ];
        
        toolbarButtons.forEach(button => {
            const btn = document.createElement('button');
            btn.id = button.id;
            btn.textContent = button.label;
            btn.setAttribute('aria-label', button.label);
            btn.addEventListener('click', button.action);
            this.accessibilityToolbar.appendChild(btn);
        });
        
        this.accessibilityToolbar.style.cssText = `
            position: fixed;
            top: 10px;
            right: 10px;
            display: flex;
            gap: 5px;
            background: ${this.theme.darkMode ? '#2d2d2d' : '#ffffff'};
            border: 2px solid ${this.theme.highContrast ? '#ffff00' : '#007bff'};
            border-radius: 4px;
            padding: 5px;
            z-index: 10002;
            box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
        `;
          document.body.appendChild(this.accessibilityToolbar);
    }

    // Enhanced component registration with performance monitoring
    registerComponent(component) {
        const startTime = this.performanceMonitor.startOperation('register-component');
        
        try {
            if (!component || !component.id) {
                throw new AccessibilityError('Invalid component for accessibility registration', { component });
            }

            const accessibilityConfig = component.accessibilityConfig || this.getDefaultAccessibilityConfig(component);
            
            // Enhanced component data with performance tracking
            const componentData = {
                component,
                config: accessibilityConfig,
                focusable: accessibilityConfig.focusable !== false,
                description: accessibilityConfig.description || this.generateComponentDescription(component),
                role: accessibilityConfig.role || 'button',
                keyboardActions: accessibilityConfig.keyboardActions || {},
                registrationTime: Date.now(),
                focusCount: 0,
                lastFocused: null
            };

            this.components.set(component.id, componentData);
            this.updateFocusableElements();
            this.applyAccessibilityAttributes(component, accessibilityConfig);
            
            // Register with region manager
            this.registerComponentInRegion(component, accessibilityConfig);
            
            // Announce registration if verbose mode
            if (this.verboseMode) {
                this.announce(`Component registered: ${componentData.description}`);
            }
            
        } catch (error) {
            this.handleError(new AccessibilityError('Failed to register component', { componentId: component?.id }, error));
        } finally {
            this.performanceMonitor.endOperation('register-component', startTime);
        }
    }
    
    generateComponentDescription(component) {
        const type = component.constructor.name.toLowerCase();
        const text = component.text || component.label || component.title || '';
        const value = component.value !== undefined ? ` with value ${component.value}` : '';
        
        return `${type}${text ? ': ' + text : ''}${value}`;
    }
    
    registerComponentInRegion(component, config) {
        const regionName = config.region || 'main';
        
        if (!this.regionManager.has(regionName)) {
            this.regionManager.set(regionName, {
                components: new Set(),
                focusIndex: -1,
                description: config.regionDescription || `${regionName} region`
            });
        }
        
        this.regionManager.get(regionName).components.add(component.id);
    }

    unregisterComponent(component) {
        if (component && component.id) {
            const componentData = this.components.get(component.id);
            if (componentData && this.verboseMode) {
                this.announce(`Component unregistered: ${componentData.description}`);
            }
            
            this.components.delete(component.id);
            this.updateFocusableElements();
            
            // Remove from region manager
            for (const region of this.regionManager.values()) {
                region.components.delete(component.id);
            }
        }
    }

    getDefaultAccessibilityConfig(component) {
        const componentType = component.constructor.name.toLowerCase();
        
        const defaults = {
            button: {
                role: 'button',
                focusable: true,
                keyboardActions: { 'Enter': 'click', 'Space': 'click' },
                description: 'Button'
            },
            slider: {
                role: 'slider',
                focusable: true,
                keyboardActions: { 
                    'ArrowLeft': 'decrease', 
                    'ArrowRight': 'increase',
                    'ArrowDown': 'decrease',
                    'ArrowUp': 'increase',
                    'Home': 'minimum',
                    'End': 'maximum'
                },
                description: 'Slider'
            },
            panel: {
                role: 'region',
                focusable: true,
                keyboardActions: {},
                description: 'Panel'
            },
            tabcontainer: {
                role: 'tablist',
                focusable: true,
                keyboardActions: {
                    'ArrowLeft': 'previousTab',
                    'ArrowRight': 'nextTab',
                    'Home': 'firstTab',
                    'End': 'lastTab'
                },
                description: 'Tab container'
            },
            treeview: {
                role: 'tree',
                focusable: true,
                keyboardActions: {
                    'ArrowUp': 'previousNode',
                    'ArrowDown': 'nextNode',
                    'ArrowLeft': 'collapseNode',
                    'ArrowRight': 'expandNode',
                    'Enter': 'activateNode',
                    'Space': 'toggleNode'
                },
                description: 'Tree view'
            },
            fileupload: {
                role: 'button',
                focusable: true,
                keyboardActions: { 'Enter': 'openFileDialog', 'Space': 'openFileDialog' },
                description: 'File upload'
            }
        };

        return defaults[componentType] || { 
            role: 'generic', 
            focusable: true, 
            keyboardActions: {},
            description: 'Interactive element'
        };
    }

    applyAccessibilityAttributes(component, config) {
        if (!component.element) return;

        const element = component.element;
        
        try {
            // Set ARIA attributes with enhanced support
            this.setAriaAttribute(element, 'role', config.role);
            
            if (config.focusable) {
                element.setAttribute('tabindex', element.hasAttribute('tabindex') ? element.getAttribute('tabindex') : '0');
            }
            
            if (config.description) {
                this.setAriaAttribute(element, 'aria-label', config.description);
            }
            
            // Enhanced ARIA attributes
            if (config.required) {
                this.setAriaAttribute(element, 'aria-required', 'true');
            }
            
            if (config.expanded !== undefined) {
                this.setAriaAttribute(element, 'aria-expanded', config.expanded.toString());
            }
            
            if (config.selected !== undefined) {
                this.setAriaAttribute(element, 'aria-selected', config.selected.toString());
            }
            
            if (config.pressed !== undefined) {
                this.setAriaAttribute(element, 'aria-pressed', config.pressed.toString());
            }
            
            // Add keyboard event listeners with enhanced error handling
            this.addKeyboardListeners(element, component, config.keyboardActions);
            
        } catch (error) {
            this.handleError(new AccessibilityError('Failed to apply accessibility attributes', { 
                componentId: component.id, 
                config 
            }, error));
        }
    }
    
    setAriaAttribute(element, attribute, value) {
        if (value !== null && value !== undefined) {
            element.setAttribute(attribute, value);
        }
    }
    
    addKeyboardListeners(element, component, keyboardActions) {
        Object.entries(keyboardActions).forEach(([key, action]) => {
            const listener = (e) => {
                if (e.key === key || e.code === key) {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleComponentKeyboardAction(component, action, e);
                }
            };
            
            element.addEventListener('keydown', listener);
            
            // Store listener for cleanup
            if (!component._accessibilityListeners) {
                component._accessibilityListeners = [];
            }
            component._accessibilityListeners.push({ element, event: 'keydown', listener });
        });
    }

    updateFocusableElements() {
        const startTime = this.performanceMonitor.startOperation('update-focusable');
        
        try {
            this.focusableElements = Array.from(this.components.values())
                .filter(item => item.focusable && item.component.visible !== false && !item.component.disabled)
                .map(item => item.component)
                .sort((a, b) => {
                    // Sort by tabindex, then by DOM order
                    const aTabIndex = parseInt(a.element?.getAttribute('tabindex') || '0');
                    const bTabIndex = parseInt(b.element?.getAttribute('tabindex') || '0');
                    
                    if (aTabIndex !== bTabIndex) {
                        return aTabIndex - bTabIndex;
                    }
                    
                    // Use DOM order if tabindex is the same
                    if (a.element && b.element && a.element.compareDocumentPosition) {
                        return a.element.compareDocumentPosition(b.element) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1;
                    }
                    
                    return 0;
                });
                
            // Update current focus index if needed
            if (this.currentFocusIndex >= this.focusableElements.length) {
                this.currentFocusIndex = this.focusableElements.length - 1;
            }
            
        } catch (error) {
            this.handleError(new AccessibilityError('Failed to update focusable elements', {}, error));
        } finally {
            this.performanceMonitor.endOperation('update-focusable', startTime);        }
    }

    // Enhanced error handling
    handleError(error) {
        this.errorCount++;
        this.lastError = error;
        
        console.error('Accessibility Error:', error);
        
        // Emit error event for application-level handling
        if (this.engine && this.engine.emit) {
            this.engine.emit('accessibility:error', error);
        }
        
        // Attempt graceful recovery
        this.attemptErrorRecovery(error);
        
        // Rate limiting: if too many errors, temporarily disable features
        if (this.errorCount > 10) {
            console.warn('High error rate detected, temporarily reducing accessibility features');
            this.reduceFeatures();
        }
    }
    
    attemptErrorRecovery(error) {
        switch (error.context?.operation) {
            case 'focus':
                this.currentFocusIndex = -1;
                break;
            case 'register-component':
                // Try to recover component registration
                if (error.context?.componentId) {
                    setTimeout(() => {
                        const component = this.findComponentById(error.context.componentId);
                        if (component) {
                            this.registerComponent(component);
                        }
                    }, 1000);
                }
                break;
            case 'keyboard':
                this.keyboardNavigationEnabled = true;
                break;
        }
    }
    
    reduceFeatures() {
        this.verboseMode = false;
        this.announcementDelay *= 2;
        
        // Re-enable after a delay
        setTimeout(() => {
            this.errorCount = 0;
            this.verboseMode = this.screenReaderType !== null;
            this.announcementDelay = ACCESSIBILITY_CONSTANTS.ANNOUNCEMENT_DELAY;
        }, 30000);
    }
    
    findComponentById(id) {
        const data = this.components.get(id);
        return data ? data.component : null;
    }

    // Enhanced keyboard navigation with performance optimization
    handleKeyDown(e) {
        if (!this.keyboardNavigationEnabled) return;

        const startTime = this.performanceMonitor.startOperation('keyboard-navigation');
        
        try {
            // Check for keyboard shortcuts first
            const shortcutKey = this.getShortcutKey(e);
            if (this.keyboardShortcuts.has(shortcutKey)) {
                e.preventDefault();
                e.stopPropagation();
                this.keyboardShortcuts.get(shortcutKey)();
                return;
            }

            switch (e.key) {
                case 'Tab':
                    e.preventDefault();
                    this.handleTabNavigation(e.shiftKey);
                    break;
                case 'Escape':
                    this.handleEscape();
                    break;
                case 'F6':
                    e.preventDefault();
                    this.cycleFocusRegions(e.shiftKey ? -1 : 1);
                    break;
                case '?':
                    if (e.ctrlKey || e.metaKey) {
                        e.preventDefault();
                        this.showKeyboardShortcuts();
                    }
                    break;
                case 'F1':
                    e.preventDefault();
                    this.showAccessibilityHelp();
                    break;
            }
        } catch (error) {
            this.handleError(new AccessibilityError('Keyboard navigation error', { key: e.key, operation: 'keyboard' }, error));
        } finally {
            this.performanceMonitor.endOperation('keyboard-navigation', startTime);
        }
    }
    
    getShortcutKey(e) {
        const parts = [];
        if (e.ctrlKey) parts.push('ctrl');
        if (e.shiftKey) parts.push('shift');
        if (e.altKey) parts.push('alt');
        if (e.metaKey) parts.push('meta');
        parts.push(e.key.toLowerCase());
        return parts.join('+');
    }
    
    showAccessibilityHelp() {
        const help = `
            Accessibility Help:
            
            Navigation:
            - Tab/Shift+Tab: Move between elements
            - Arrow keys: Navigate within components
            - Enter/Space: Activate elements
            - Escape: Cancel or close
            - F6/Shift+F6: Cycle between regions
            - F1: Show this help
            
            Shortcuts:
            - Ctrl+Shift+?: Show keyboard shortcuts
            - Ctrl+Shift+H: Toggle high contrast
            - Ctrl+Shift+L: Toggle large text
            - Ctrl+Shift+V: Toggle voice commands
            - Ctrl+Shift+R: Reset accessibility settings
            - Ctrl+Shift+F: Show accessibility report
            
            Voice Commands (if available):
            - "Next" or "Previous": Navigate elements
            - "Activate": Activate current element
            - "Help": Show available commands
            - "High contrast": Toggle high contrast mode
            - "Large text": Toggle large text mode
            
            Current Settings:
            - Theme: ${this.theme.theme}
            - High contrast: ${this.theme.highContrast ? 'on' : 'off'}
            - Reduced motion: ${this.theme.reducedMotion ? 'on' : 'off'}
            - Screen reader: ${this.screenReaderEnabled ? 'detected' : 'not detected'}
            - Voice commands: ${this.voiceCommandsEnabled ? 'enabled' : 'disabled'}
        `;
        
        this.announce(help, true);
    }

    handleTabNavigation(backwards = false) {
        if (this.focusableElements.length === 0) return;

        const direction = backwards ? -1 : 1;
        let newIndex = this.currentFocusIndex + direction;
        
        // Wrap around
        if (newIndex >= this.focusableElements.length) {
            newIndex = 0;
        } else if (newIndex < 0) {
            newIndex = this.focusableElements.length - 1;
        }

        this.currentFocusIndex = newIndex;
        this.focusComponent(this.focusableElements[this.currentFocusIndex]);
    }

    handleComponentKeyboardAction(component, action, event) {
        const componentData = this.components.get(component.id);
        if (!componentData) return;

        const startTime = this.performanceMonitor.startOperation('component-action');
        
        try {
            // Update component usage statistics
            componentData.lastFocused = Date.now();
            componentData.focusCount++;

            switch (action) {
                case 'click':
                case 'activate':
                    this.activateComponent(component, componentData);
                    break;
                    
                case 'increase':
                case 'decrease':
                    this.adjustComponentValue(component, action, componentData);
                    break;
                    
                case 'minimum':
                case 'maximum':
                    this.setComponentExtreme(component, action, componentData);
                    break;
                    
                case 'previousTab':
                case 'nextTab':
                case 'firstTab':
                case 'lastTab':
                    this.handleTabAction(component, action, componentData);
                    break;
                    
                case 'previousNode':
                case 'nextNode':
                case 'expandNode':
                case 'collapseNode':
                case 'activateNode':
                case 'toggleNode':
                    this.handleTreeAction(component, action, componentData);
                    break;
                    
                case 'openFileDialog':
                    this.handleFileAction(component, action, componentData);
                    break;
                    
                default:
                    // Custom action handling
                    if (component[action] && typeof component[action] === 'function') {
                        component[action](event);
                        this.announce(`${action} performed on ${componentData.description}`);
                    }
            }
        } catch (error) {
            this.handleError(new AccessibilityError('Component action failed', { 
                componentId: component.id, 
                action, 
                operation: 'component-action' 
            }, error));
        } finally {
            this.performanceMonitor.endOperation('component-action', startTime);
        }
    }
    
    activateComponent(component, componentData) {
        if (component.element && component.element.click) {
            component.element.click();
        } else if (component.onClick) {
            component.onClick();
        } else if (component.activate) {
            component.activate();
        }
        this.announce(`${componentData.description} activated`);
    }
    
    adjustComponentValue(component, action, componentData) {
        if (component.setValue && component.value !== undefined) {
            const delta = action === 'increase' ? 1 : -1;
            const step = component.step || 1;
            const newValue = Math.max(
                component.min || 0, 
                Math.min(
                    component.max || 100, 
                    component.value + (delta * step)
                )
            );
            component.setValue(newValue);
            this.announce(`${componentData.description} ${action}d to ${newValue}`);
        }
    }
    
    setComponentExtreme(component, action, componentData) {
        if (component.setValue) {
            const value = action === 'minimum' ? (component.min || 0) : (component.max || 100);
            component.setValue(value);
            this.announce(`${componentData.description} set to ${action} value: ${value}`);
        }
    }
    
    handleTabAction(component, action, componentData) {
        if (component.handleTabNavigation) {
            component.handleTabNavigation(action);
            this.announce(`Tab navigation: ${action} on ${componentData.description}`);
        }
    }
    
    handleTreeAction(component, action, componentData) {
        if (component[action]) {
            component[action]();
            this.announce(`Tree action: ${action} on ${componentData.description}`);
        }
    }
    
    handleFileAction(component, action, componentData) {
        if (component.openFileDialog) {
            component.openFileDialog();
            this.announce(`File dialog opened for ${componentData.description}`);
        }
    }

    focusComponent(component) {
        if (!component || !component.element) return;

        const startTime = this.performanceMonitor.startOperation('focus-component');
        
        try {
            // Store focus history
            this.focusHistory.push({
                component: component.id,
                timestamp: Date.now()
            });
            
            // Limit history size
            if (this.focusHistory.length > 50) {
                this.focusHistory.shift();
            }

            component.element.focus();
            this.updateFocusIndicator(component);
            
            const componentData = this.components.get(component.id);
            if (componentData) {
                componentData.lastFocused = Date.now();
                componentData.focusCount++;
                
                if (componentData.description) {
                    this.announce(componentData.description);
                }
            }
        } catch (error) {
            this.handleError(new AccessibilityError('Focus operation failed', { 
                componentId: component.id, 
                operation: 'focus' 
            }, error));
        } finally {
            this.performanceMonitor.endOperation('focus-component', startTime);
        }
    }

    updateFocusIndicator(component) {
        if (!component.element || !this.focusIndicator) return;

        try {
            const rect = component.element.getBoundingClientRect();
            const containerRect = this.container.getBoundingClientRect();

            const left = rect.left - containerRect.left - 3;
            const top = rect.top - containerRect.top - 3;
            const width = rect.width + 6;
            const height = rect.height + 6;

            this.focusIndicator.style.cssText += `
                display: block;
                left: ${left}px;
                top: ${top}px;
                width: ${width}px;
                height: ${height}px;
            `;
            
            // Ensure focus indicator is visible
            if (this.theme.reducedMotion) {
                this.focusIndicator.scrollIntoView({ block: 'nearest' });
            } else {
                this.focusIndicator.scrollIntoView({ 
                    block: 'nearest', 
                    behavior: 'smooth' 
                });
            }
        } catch (error) {
            this.handleError(new AccessibilityError('Focus indicator update failed', { 
                componentId: component.id 
            }, error));        }
    }

    // Enhanced screen reader announcements with intelligent queuing
    announce(message, urgent = false, options = {}) {
        if (!message) return;

        const announcement = {
            message: String(message).trim(),
            urgent,
            timestamp: Date.now(),
            category: options.category || 'general',
            priority: urgent ? 'high' : (options.priority || 'normal'),
            delay: options.delay || this.announcementDelay,
            repeat: options.repeat || false
        };

        // Check for duplicate announcements
        if (!options.allowDuplicates && this.isDuplicateAnnouncement(announcement)) {
            return;
        }

        this.announcements.push(announcement);
        
        // Process immediately if urgent, otherwise queue
        if (urgent) {
            this.processUrgentAnnouncement(announcement);
        } else {
            setTimeout(() => this.processAnnouncements(), announcement.delay);
        }
    }
    
    isDuplicateAnnouncement(newAnnouncement) {
        const recentAnnouncements = this.announcements.filter(
            a => Date.now() - a.timestamp < 2000
        );
        
        return recentAnnouncements.some(
            a => a.message === newAnnouncement.message && 
                 a.category === newAnnouncement.category
        );
    }
    
    processUrgentAnnouncement(announcement) {
        if (this.urgentRegion) {
            this.urgentRegion.textContent = announcement.message;
            
            setTimeout(() => {
                if (this.urgentRegion) {
                    this.urgentRegion.textContent = '';
                }
            }, 1500);
        }
    }

    processAnnouncements() {
        if (this.announcements.length === 0) return;

        // Process announcements by priority
        this.announcements.sort((a, b) => {
            const priorityOrder = { high: 3, normal: 2, low: 1 };
            return priorityOrder[b.priority] - priorityOrder[a.priority];
        });

        const announcement = this.announcements.shift();
        
        // Select appropriate region based on announcement type
        let region = this.liveRegion;
        
        if (announcement.urgent) {
            region = this.urgentRegion;
        } else if (announcement.category === 'status') {
            region = this.statusRegion;
        } else if (announcement.category === 'log') {
            region = this.logRegion;
        }
        
        if (region) {
            region.textContent = announcement.message;
            
            // Clear after announcement with variable timing based on content length
            const clearDelay = Math.min(5000, Math.max(1000, announcement.message.length * 50));
            setTimeout(() => {
                if (region && region.textContent === announcement.message) {
                    region.textContent = '';
                }
            }, clearDelay);
        }
        
        // Log announcement for debugging
        if (this.verboseMode) {
            console.log('Accessibility Announcement:', announcement);
        }
    }

    // Enhanced region management
    cycleFocusRegions(direction = 1) {
        const regionNames = Array.from(this.regionManager.keys());
        if (regionNames.length <= 1) return;

        const currentRegion = this.getCurrentRegion();
        let currentIndex = regionNames.indexOf(currentRegion);
        
        if (currentIndex === -1) currentIndex = 0;
        
        currentIndex = (currentIndex + direction + regionNames.length) % regionNames.length;
        const newRegion = regionNames[currentIndex];
        
        this.focusOnRegion(newRegion);
        
        const regionData = this.regionManager.get(newRegion);
        this.announce(`Moved to ${regionData.description}`, false, { category: 'navigation' });
    }
    
    getCurrentRegion() {
        // Determine current region based on focused element
        if (this.currentFocusIndex >= 0 && this.focusableElements[this.currentFocusIndex]) {
            const focusedComponent = this.focusableElements[this.currentFocusIndex];
            
            for (const [regionName, regionData] of this.regionManager) {
                if (regionData.components.has(focusedComponent.id)) {
                    return regionName;
                }
            }
        }
        
        return 'main';
    }
    
    focusOnRegion(regionName) {
        const regionData = this.regionManager.get(regionName);
        if (!regionData || regionData.components.size === 0) return;
        
        // Focus on first component in region
        const firstComponentId = Array.from(regionData.components)[0];
        const componentData = this.components.get(firstComponentId);
        
        if (componentData) {
            const componentIndex = this.focusableElements.indexOf(componentData.component);
            if (componentIndex >= 0) {
                this.currentFocusIndex = componentIndex;
                this.focusComponent(componentData.component);
            }
        }
    }

    // Enhanced configuration methods with persistence
    setKeyboardNavigationEnabled(enabled) {
        this.keyboardNavigationEnabled = enabled;
        this.announce(`Keyboard navigation ${enabled ? 'enabled' : 'disabled'}`, false, { category: 'settings' });
        
        // Persist setting
        this.saveSetting('keyboardNavigation', enabled);
    }

    setHighContrastMode(enabled) {
        this.isHighContrastMode = enabled;
        
        if (enabled) {
            this.container.classList.add('high-contrast');
            document.body.classList.add('high-contrast');
            this.theme.highContrast = true;
        } else {
            this.container.classList.remove('high-contrast');
            document.body.classList.remove('high-contrast');
            this.theme.highContrast = false;
        }
        
        this.updateContainerTheme();
        this.applyThemeSpecificStyles();
        this.updateFocusIndicatorTheme();
        
        this.announce(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`, false, { category: 'settings' });
        
        // Persist setting
        this.saveSetting('highContrast', enabled);
    }
    
    toggleHighContrastMode() {
        this.setHighContrastMode(!this.isHighContrastMode);
    }

    setLargeTextMode(enabled) {
        if (enabled) {
            this.container.classList.add('large-text');
            document.body.classList.add('large-text');
        } else {
            this.container.classList.remove('large-text');
            document.body.classList.remove('large-text');
        }
        
        this.announce(`Large text mode ${enabled ? 'enabled' : 'disabled'}`, false, { category: 'settings' });
        
        // Persist setting
        this.saveSetting('largeText', enabled);
    }
    
    toggleLargeTextMode() {
        const isEnabled = this.container.classList.contains('large-text');
        this.setLargeTextMode(!isEnabled);
    }
    
    saveSetting(key, value) {
        try {
            if (localStorage) {
                const settings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
                settings[key] = value;
                localStorage.setItem('accessibilitySettings', JSON.stringify(settings));
            }
        } catch (error) {
            console.warn('Failed to save accessibility setting:', error);
        }
    }
    
    loadSettings() {
        try {
            if (localStorage) {
                const settings = JSON.parse(localStorage.getItem('accessibilitySettings') || '{}');
                
                if (settings.keyboardNavigation !== undefined) {
                    this.keyboardNavigationEnabled = settings.keyboardNavigation;
                }
                
                if (settings.highContrast) {
                    this.setHighContrastMode(true);
                }
                
                if (settings.largeText) {
                    this.setLargeTextMode(true);
                }
            }
        } catch (error) {
            console.warn('Failed to load accessibility settings:', error);
        }
    }

    // Enhanced utility methods
    throttle(func, wait) {
        let timeout;
        let lastTime = 0;
        
        return function executedFunction(...args) {
            const now = Date.now();
            
            if (now - lastTime >= wait) {
                func.apply(this, args);
                lastTime = now;
            } else {
                clearTimeout(timeout);
                timeout = setTimeout(() => {
                    func.apply(this, args);
                    lastTime = Date.now();
                }, wait - (now - lastTime));
            }
        };
    }
    
    activateCurrentElement() {
        if (this.currentFocusIndex >= 0 && this.focusableElements[this.currentFocusIndex]) {
            const component = this.focusableElements[this.currentFocusIndex];
            this.handleComponentKeyboardAction(component, 'activate', {});
        }
    }

    // Enhanced simulation-specific announcements
    announceEthicsChange(metric, oldValue, newValue, reasoning) {
        const change = newValue - oldValue;
        const direction = change > 0 ? 'increased' : 'decreased';
        const magnitude = Math.abs(change);
        
        let description = 'slightly';
        if (magnitude > 20) description = 'significantly';
        else if (magnitude > 10) description = 'moderately';
        
        const message = `${metric} ${description} ${direction} from ${oldValue} to ${newValue}. ${reasoning}`;
        
        this.announce(message, false, { 
            category: 'ethics',
            priority: magnitude > 15 ? 'high' : 'normal'
        });
    }

    announceScenarioChange(scenarioTitle, scenarioNumber, totalScenarios) {
        const message = `Starting scenario ${scenarioNumber} of ${totalScenarios}: ${scenarioTitle}`;
        this.announce(message, true, { category: 'scenario' });
    }

    announceSimulationComplete(score, totalMetrics) {
        const percentage = Math.round((score / totalMetrics) * 100);
        let performance = 'needs improvement';
        
        if (percentage >= 90) performance = 'excellent';
        else if (percentage >= 75) performance = 'good';
        else if (percentage >= 60) performance = 'satisfactory';
        
        const message = `Simulation complete. Final score: ${score} out of ${totalMetrics} (${percentage}%). Performance: ${performance}.`;        this.announce(message, true, { category: 'completion' });
    }

    // Event handlers with enhanced functionality
    onContainerFocus() {
        if (this.focusableElements.length > 0 && this.currentFocusIndex === -1) {
            this.currentFocusIndex = 0;
            this.focusComponent(this.focusableElements[0]);
        }
        
        // Announce entry to application
        if (this.verboseMode) {
            this.announce('Entered simulation environment', false, { category: 'navigation' });
        }
    }

    onContainerBlur() {
        if (this.focusIndicator) {
            this.focusIndicator.style.display = 'none';
        }
    }

    onFocusChange(e) {
        // Track focus changes for analytics and optimization
        if (e.type === 'focusin') {
            const component = this.findComponentByElement(e.target);
            if (component) {
                this.currentFocusIndex = this.focusableElements.indexOf(component);
                this.updateFocusIndicator(component);
                
                // Update component statistics
                const componentData = this.components.get(component.id);
                if (componentData) {
                    componentData.lastFocused = Date.now();
                    componentData.focusCount++;
                }
            }
        }
    }

    findComponentByElement(element) {
        for (let [id, data] of this.components) {
            if (data.component.element === element || 
                data.component.element?.contains(element)) {
                return data.component;
            }
        }
        return null;
    }

    // Enhanced utility methods with error handling
    detectScreenReader() {
        try {
            return this.detectScreenReaderType() !== null;
        } catch (error) {
            console.warn('Screen reader detection failed:', error);
            return false;
        }
    }

    handleEscape() {
        // Enhanced escape handling with context awareness
        this.announce('Escape pressed', false, { category: 'interaction' });
        
        // Close any open accessibility toolbar
        if (this.accessibilityToolbar && this.accessibilityToolbar.style.display !== 'none') {
            this.accessibilityToolbar.style.display = 'none';
            this.announce('Accessibility toolbar closed');
            return;
        }
        
        // Reset focus if lost
        if (this.currentFocusIndex === -1 && this.focusableElements.length > 0) {
            this.currentFocusIndex = 0;
            this.focusComponent(this.focusableElements[0]);
            return;
        }
        
        if (this.engine && this.engine.emit) {
            this.engine.emit('accessibility:escape');
        }
    }

    showKeyboardShortcuts() {
        const shortcuts = `
            Keyboard Shortcuts:
            
            Basic Navigation:
            • Tab/Shift+Tab: Navigate between elements
            • Arrow keys: Navigate within components
            • Enter/Space: Activate buttons and controls
            • Escape: Cancel, close, or reset focus
            • F6/Shift+F6: Cycle between regions
            • F1: Show accessibility help
            
            Advanced Shortcuts:
            • Ctrl+Shift+?: Show this shortcuts list
            • Ctrl+Shift+H: Toggle high contrast mode
            • Ctrl+Shift+L: Toggle large text mode
            • Ctrl+Shift+V: Toggle voice commands
            • Ctrl+Shift+R: Reset accessibility settings
            • Ctrl+Shift+F: Show accessibility report
            
            Component-Specific:
            • Home/End: First/last item in lists
            • Arrow keys: Navigate trees and tabs
            • Space: Toggle checkboxes and expand/collapse
            • Enter: Activate primary actions
            
            Voice Commands (if supported):
            • "Next" / "Previous": Navigate elements
            • "Activate": Activate current element
            • "High contrast": Toggle high contrast
            • "Large text": Toggle large text
            • "Help": Show voice command help
        `;
        
        this.announce(shortcuts, true, { category: 'help' });
    }

    handleKeyUp(e) {
        // Handle key release events for advanced interactions
        if (e.key === 'Alt' && this.altKeyPressed) {
            this.altKeyPressed = false;
            // Could show accessibility menu on Alt release
        }
    }

    // Enhanced cleanup with comprehensive resource management
    destroy() {
        const startTime = this.performanceMonitor.startOperation('cleanup');
        
        try {
            // Remove event listeners with error handling
            this.removeEventListeners();
            
            // Clean up speech recognition
            if (this.speechRecognition) {
                try {
                    this.speechRecognition.stop();
                    this.speechRecognition = null;
                } catch (error) {
                    console.warn('Speech recognition cleanup failed:', error);
                }
            }
            
            // Remove DOM elements
            this.removeDOMElements();
            
            // Clean up component listeners
            this.cleanupComponentListeners();
            
            // Clear data structures
            this.clearDataStructures();
            
            // Save final settings
            this.saveFinalSettings();
            
            console.log('AccessibilityManager destroyed successfully');
            
        } catch (error) {
            console.error('Error during AccessibilityManager cleanup:', error);
        } finally {
            this.performanceMonitor.endOperation('cleanup', startTime);
            
            // Final performance report
            if (this.verboseMode) {
                console.log('Final Accessibility Performance Report:', this.performanceMonitor.getMetrics());
            }
        }
    }
    
    removeEventListeners() {
        try {
            // Remove container event listeners
            this.container.removeEventListener('keydown', this.handleKeyDown);
            this.container.removeEventListener('keyup', this.handleKeyUp);
            this.container.removeEventListener('focus', this.onContainerFocus);
            this.container.removeEventListener('blur', this.onContainerBlur);
            
            // Remove document event listeners
            document.removeEventListener('focusin', this.onFocusChange);
            document.removeEventListener('focusout', this.onFocusChange);
            
            // Remove theme change listeners
            const darkModeQuery = window.matchMedia('(prefers-color-scheme: dark)');
            const contrastQuery = window.matchMedia('(prefers-contrast: high)');
            const motionQuery = window.matchMedia('(prefers-reduced-motion: reduce)');
            
            if (darkModeQuery.removeEventListener) {
                darkModeQuery.removeEventListener('change', this.updateTheme);
                contrastQuery.removeEventListener('change', this.updateTheme);
                motionQuery.removeEventListener('change', this.updateTheme);
            }
        } catch (error) {
            console.warn('Event listener cleanup failed:', error);
        }
    }
    
    removeDOMElements() {
        const elementsToRemove = [
            this.liveRegion,
            this.urgentRegion,
            this.statusRegion,
            this.logRegion,
            this.overlay,
            this.accessibilityToolbar,
            document.getElementById('accessibility-description'),
            document.getElementById('accessibility-focus-styles')
        ];
        
        elementsToRemove.forEach(element => {
            try {
                if (element && element.parentNode) {
                    element.parentNode.removeChild(element);
                }
            } catch (error) {
                console.warn('Failed to remove DOM element:', error);
            }
        });
    }
    
    cleanupComponentListeners() {
        for (const [id, componentData] of this.components) {
            const component = componentData.component;
            
            if (component._accessibilityListeners) {
                component._accessibilityListeners.forEach(({ element, event, listener }) => {
                    try {
                        element.removeEventListener(event, listener);
                    } catch (error) {
                        console.warn(`Failed to remove listener for component ${id}:`, error);
                    }
                });
                
                delete component._accessibilityListeners;
            }
        }
    }
    
    clearDataStructures() {
        this.components.clear();
        this.focusableElements = [];
        this.announcements = [];
        this.focusHistory = [];
        this.regionManager.clear();
        this.voiceCommands.clear();
        this.keyboardShortcuts.clear();
        this.renderCache.clear();
    }
    
    saveFinalSettings() {
        try {
            if (localStorage) {
                const finalReport = {
                    sessionDuration: Date.now() - (this.initTime || Date.now()),
                    totalComponents: this.components.size,
                    totalAnnouncements: this.announcements.length,
                    errorCount: this.errorCount,
                    performanceMetrics: this.performanceMonitor.getMetrics(),
                    lastSession: Date.now()
                };
                
                localStorage.setItem('accessibilitySessionReport', JSON.stringify(finalReport));
            }
        } catch (error) {
            console.warn('Failed to save session report:', error);
        }
    }

    // Public API for enhanced accessibility features
    getAccessibilityReport() {
        return {
            isEnabled: true,
            componentsRegistered: this.components.size,
            focusableElements: this.focusableElements.length,
            theme: this.theme,
            screenReader: {
                enabled: this.screenReaderEnabled,
                type: this.screenReaderType
            },
            features: {
                keyboardNavigation: this.keyboardNavigationEnabled,
                voiceCommands: this.voiceCommandsEnabled,
                highContrast: this.isHighContrastMode,
                largeText: this.container.classList.contains('large-text')
            },
            performance: this.performanceMonitor.getMetrics(),
            errors: this.errorCount,
            lastError: this.lastError
        };
    }
    
    updateAccessibilityConfig(config) {
        if (config.theme) {
            this.theme = { ...this.theme, ...config.theme };
            this.updateContainerTheme();
        }
        
        if (config.announcements) {
            this.announcementDelay = config.announcements.delay || this.announcementDelay;
            this.verboseMode = config.announcements.verbose !== undefined ? config.announcements.verbose : this.verboseMode;
        }
        
        if (config.performance) {
            // Update performance thresholds
            Object.assign(ACCESSIBILITY_CONSTANTS, config.performance);
        }
        
        this.announce('Accessibility configuration updated', false, { category: 'settings' });
    }
}

// Static methods for global accessibility utilities
AccessibilityManager.detectScreenReaderType = function() {
    const userAgent = navigator.userAgent;
    
    for (const [type, pattern] of Object.entries(SCREEN_READER_PATTERNS)) {
        if (pattern.test(userAgent)) {
            return type.toLowerCase();
        }
    }
    
    return null;
};

AccessibilityManager.createGlobalAccessibilityStyles = function() {
    if (document.getElementById('global-accessibility-styles')) return;
    
    const styleSheet = document.createElement('style');
    styleSheet.id = 'global-accessibility-styles';
    styleSheet.textContent = `
        /* Global accessibility styles */
        .sr-only {
            position: absolute !important;
            width: 1px !important;
            height: 1px !important;
            padding: 0 !important;
            margin: -1px !important;
            overflow: hidden !important;
            clip: rect(0, 0, 0, 0) !important;
            white-space: nowrap !important;
            border: 0 !important;
        }
        
        .accessibility-enabled *:focus {
            outline: 2px solid #007bff !important;
            outline-offset: 2px !important;
        }
        
        .high-contrast *:focus {
            outline: 3px solid #ffff00 !important;
            outline-offset: 2px !important;
        }
        
        .large-text {
            font-size: 120% !important;
            line-height: 1.5 !important;
        }
        
        .reduced-motion * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
        }
        
        @media (prefers-reduced-motion: reduce) {
            .accessibility-enabled * {
                animation-duration: 0.01ms !important;
                animation-iteration-count: 1 !important;
                transition-duration: 0.01ms !important;
            }
        }
    `;
    
    document.head.appendChild(styleSheet);
};

// Initialize global styles when module loads
if (typeof document !== 'undefined') {
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', AccessibilityManager.createGlobalAccessibilityStyles);
    } else {
        AccessibilityManager.createGlobalAccessibilityStyles();
    }
}

// Export for ES6 modules
export default AccessibilityManager;
