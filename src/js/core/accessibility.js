/**
 * AccessibilityManager - Handles accessibility features for simulations
 * Provides keyboard navigation, screen reader support, and accessibility enhancements
 */

class AccessibilityManager {
    constructor(container, engine) {
        this.container = container;
        this.engine = engine;
        this.components = new Map();
        this.focusableElements = [];
        this.currentFocusIndex = -1;
        this.keyboardNavigationEnabled = true;
        this.screenReaderEnabled = this.detectScreenReader();
        
        this.announcements = [];
        this.announcementDelay = 100; // ms
        
        this.init();
    }

    init() {
        this.setupContainer();
        this.setupKeyboardNavigation();
        this.setupScreenReaderSupport();
        this.setupFocusManagement();
        this.createAccessibilityOverlay();
        
        console.log('AccessibilityManager initialized');
    }

    setupContainer() {
        // Ensure container is accessible
        if (!this.container.hasAttribute('tabindex')) {
            this.container.setAttribute('tabindex', '0');
        }
        
        if (!this.container.hasAttribute('role')) {
            this.container.setAttribute('role', 'application');
        }
        
        if (!this.container.hasAttribute('aria-label')) {
            this.container.setAttribute('aria-label', 'AI Ethics Simulation');
        }

        // Add accessibility CSS class
        this.container.classList.add('accessibility-enabled');
    }

    setupKeyboardNavigation() {
        this.container.addEventListener('keydown', (e) => this.handleKeyDown(e));
        this.container.addEventListener('keyup', (e) => this.handleKeyUp(e));
        
        // Focus management
        this.container.addEventListener('focus', () => this.onContainerFocus());
        this.container.addEventListener('blur', () => this.onContainerBlur());
    }

    setupScreenReaderSupport() {
        // Create aria-live region for announcements
        this.liveRegion = document.createElement('div');
        this.liveRegion.setAttribute('aria-live', 'polite');
        this.liveRegion.setAttribute('aria-atomic', 'true');
        this.liveRegion.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
        document.body.appendChild(this.liveRegion);

        // Create urgent announcements region
        this.urgentRegion = document.createElement('div');
        this.urgentRegion.setAttribute('aria-live', 'assertive');
        this.urgentRegion.setAttribute('aria-atomic', 'true');
        this.urgentRegion.style.cssText = this.liveRegion.style.cssText;
        document.body.appendChild(this.urgentRegion);
    }

    setupFocusManagement() {
        // Track focus changes
        document.addEventListener('focusin', (e) => this.onFocusChange(e));
        document.addEventListener('focusout', (e) => this.onFocusChange(e));
    }

    createAccessibilityOverlay() {
        this.overlay = document.createElement('div');
        this.overlay.className = 'accessibility-overlay';
        this.overlay.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            pointer-events: none;
            z-index: 1000;
        `;
        
        this.container.appendChild(this.overlay);
        
        // Create focus indicator
        this.focusIndicator = document.createElement('div');
        this.focusIndicator.className = 'focus-indicator';
        this.focusIndicator.style.cssText = `
            position: absolute;
            border: 3px solid #007cba;
            border-radius: 3px;
            box-shadow: 0 0 0 1px white;
            pointer-events: none;
            transition: all 0.2s ease;
            display: none;
        `;
        
        this.overlay.appendChild(this.focusIndicator);
    }

    // Component registration
    registerComponent(component) {
        if (!component || !component.id) {
            console.warn('Invalid component for accessibility registration');
            return;
        }

        const accessibilityConfig = component.accessibilityConfig || this.getDefaultAccessibilityConfig(component);
        
        this.components.set(component.id, {
            component,
            config: accessibilityConfig,
            focusable: accessibilityConfig.focusable !== false,
            description: accessibilityConfig.description || '',
            role: accessibilityConfig.role || 'button',
            keyboardActions: accessibilityConfig.keyboardActions || {}
        });

        this.updateFocusableElements();
        this.applyAccessibilityAttributes(component, accessibilityConfig);
    }

    unregisterComponent(component) {
        if (component && component.id) {
            this.components.delete(component.id);
            this.updateFocusableElements();
        }
    }

    getDefaultAccessibilityConfig(component) {
        const componentType = component.constructor.name.toLowerCase();
        
        const defaults = {
            button: {
                role: 'button',
                focusable: true,
                keyboardActions: { 'Enter': 'click', 'Space': 'click' }
            },
            slider: {
                role: 'slider',
                focusable: true,
                keyboardActions: { 
                    'ArrowLeft': 'decrease', 
                    'ArrowRight': 'increase',
                    'ArrowDown': 'decrease',
                    'ArrowUp': 'increase'
                }
            },
            panel: {
                role: 'region',
                focusable: true,
                keyboardActions: {}
            }
        };

        return defaults[componentType] || { role: 'generic', focusable: true, keyboardActions: {} };
    }

    applyAccessibilityAttributes(component, config) {
        if (!component.element) return;

        const element = component.element;
        
        // Set ARIA attributes
        if (config.role) {
            element.setAttribute('role', config.role);
        }
        
        if (config.focusable) {
            element.setAttribute('tabindex', '0');
        }
        
        if (config.description) {
            element.setAttribute('aria-label', config.description);
        }
        
        // Add keyboard event listeners
        Object.entries(config.keyboardActions).forEach(([key, action]) => {
            element.addEventListener('keydown', (e) => {
                if (e.key === key || e.code === key) {
                    e.preventDefault();
                    this.handleComponentKeyboardAction(component, action, e);
                }
            });
        });
    }

    updateFocusableElements() {
        this.focusableElements = Array.from(this.components.values())
            .filter(item => item.focusable && item.component.visible !== false)
            .map(item => item.component);
    }

    // Keyboard navigation
    handleKeyDown(e) {
        if (!this.keyboardNavigationEnabled) return;

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
                this.cycleFocusRegions();
                break;
            case '?':
                if (e.ctrlKey) {
                    e.preventDefault();
                    this.showKeyboardShortcuts();
                }
                break;
        }
    }

    handleKeyUp(e) {
        // Handle key up events if needed
    }

    handleTabNavigation(backwards = false) {
        if (this.focusableElements.length === 0) return;

        if (backwards) {
            this.currentFocusIndex = this.currentFocusIndex <= 0 
                ? this.focusableElements.length - 1 
                : this.currentFocusIndex - 1;
        } else {
            this.currentFocusIndex = this.currentFocusIndex >= this.focusableElements.length - 1 
                ? 0 
                : this.currentFocusIndex + 1;
        }

        this.focusComponent(this.focusableElements[this.currentFocusIndex]);
    }

    handleComponentKeyboardAction(component, action, event) {
        const componentData = this.components.get(component.id);
        if (!componentData) return;

        switch (action) {
            case 'click':
                if (component.element && component.element.click) {
                    component.element.click();
                } else if (component.onClick) {
                    component.onClick();
                }
                this.announce(`${componentData.description || 'Button'} activated`);
                break;
                
            case 'increase':
            case 'decrease':
                if (component.setValue && component.value !== undefined) {
                    const delta = action === 'increase' ? 1 : -1;
                    const newValue = Math.max(component.min || 0, 
                                            Math.min(component.max || 100, 
                                                   component.value + delta));
                    component.setValue(newValue);
                    this.announce(`${componentData.description} set to ${newValue}`);
                }
                break;
        }
    }

    focusComponent(component) {
        if (!component || !component.element) return;

        component.element.focus();
        this.updateFocusIndicator(component);
        
        const componentData = this.components.get(component.id);
        if (componentData && componentData.description) {
            this.announce(componentData.description);
        }
    }

    updateFocusIndicator(component) {
        if (!component.element || !this.focusIndicator) return;

        const rect = component.element.getBoundingClientRect();
        const containerRect = this.container.getBoundingClientRect();

        this.focusIndicator.style.cssText += `
            display: block;
            left: ${rect.left - containerRect.left - 3}px;
            top: ${rect.top - containerRect.top - 3}px;
            width: ${rect.width + 6}px;
            height: ${rect.height + 6}px;
        `;
    }

    // Screen reader support
    announce(message, urgent = false) {
        if (!message) return;

        this.announcements.push({ message, urgent, timestamp: Date.now() });
        
        setTimeout(() => this.processAnnouncements(), this.announcementDelay);
    }

    processAnnouncements() {
        if (this.announcements.length === 0) return;

        const announcement = this.announcements.shift();
        const region = announcement.urgent ? this.urgentRegion : this.liveRegion;
        
        if (region) {
            region.textContent = announcement.message;
            
            // Clear after announcement
            setTimeout(() => {
                region.textContent = '';
            }, 1000);
        }
    }

    // Event handlers
    onContainerFocus() {
        if (this.focusableElements.length > 0 && this.currentFocusIndex === -1) {
            this.currentFocusIndex = 0;
            this.focusComponent(this.focusableElements[0]);
        }
    }

    onContainerBlur() {
        this.focusIndicator.style.display = 'none';
    }

    onFocusChange(e) {
        // Track focus changes for analytics
        if (e.type === 'focusin') {
            const component = this.findComponentByElement(e.target);
            if (component) {
                this.currentFocusIndex = this.focusableElements.indexOf(component);
                this.updateFocusIndicator(component);
            }
        }
    }

    findComponentByElement(element) {
        for (let [id, data] of this.components) {
            if (data.component.element === element || 
                data.component.element.contains(element)) {
                return data.component;
            }
        }
        return null;
    }

    // Utility methods
    detectScreenReader() {
        // Basic screen reader detection
        return !!(
            navigator.userAgent.includes('NVDA') ||
            navigator.userAgent.includes('JAWS') ||
            navigator.userAgent.includes('VoiceOver') ||
            window.speechSynthesis
        );
    }

    handleEscape() {
        // Handle escape key - close modals, cancel actions, etc.
        this.announce('Escape pressed');
        
        if (this.engine && this.engine.emit) {
            this.engine.emit('accessibility:escape');
        }
    }

    cycleFocusRegions() {
        // Implement region cycling with F6
        this.announce('Cycling focus regions');
    }

    showKeyboardShortcuts() {
        const shortcuts = `
            Keyboard Shortcuts:
            Tab/Shift+Tab: Navigate between elements
            Enter/Space: Activate buttons
            Arrow keys: Adjust sliders
            Escape: Cancel or close
            Ctrl+?: Show this help
            F6: Cycle focus regions
        `;
        
        this.announce(shortcuts, true);
    }

    // Configuration methods
    setKeyboardNavigationEnabled(enabled) {
        this.keyboardNavigationEnabled = enabled;
        this.announce(`Keyboard navigation ${enabled ? 'enabled' : 'disabled'}`);
    }

    setHighContrastMode(enabled) {
        if (enabled) {
            this.container.classList.add('high-contrast');
            document.body.classList.add('high-contrast');
        } else {
            this.container.classList.remove('high-contrast');
            document.body.classList.remove('high-contrast');
        }
        
        this.announce(`High contrast mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    setLargeTextMode(enabled) {
        if (enabled) {
            this.container.classList.add('large-text');
            document.body.classList.add('large-text');
        } else {
            this.container.classList.remove('large-text');
            document.body.classList.remove('large-text');
        }
        
        this.announce(`Large text mode ${enabled ? 'enabled' : 'disabled'}`);
    }

    // Simulation-specific announcements
    announceEthicsChange(metric, oldValue, newValue, reasoning) {
        const change = newValue - oldValue;
        const direction = change > 0 ? 'increased' : 'decreased';
        const message = `${metric} ${direction} from ${oldValue} to ${newValue}. ${reasoning}`;
        
        this.announce(message);
    }

    announceScenarioChange(scenarioTitle, scenarioNumber, totalScenarios) {
        const message = `Starting scenario ${scenarioNumber} of ${totalScenarios}: ${scenarioTitle}`;
        this.announce(message, true);
    }

    announceSimulationComplete(score, totalMetrics) {
        const message = `Simulation complete. Final score: ${score} out of ${totalMetrics}.`;
        this.announce(message, true);
    }

    // Cleanup
    destroy() {
        // Remove event listeners
        this.container.removeEventListener('keydown', this.handleKeyDown);
        this.container.removeEventListener('keyup', this.handleKeyUp);
        
        // Remove live regions
        if (this.liveRegion) {
            this.liveRegion.remove();
        }
        
        if (this.urgentRegion) {
            this.urgentRegion.remove();
        }
        
        // Remove overlay
        if (this.overlay) {
            this.overlay.remove();
        }
        
        // Clear data
        this.components.clear();
        this.focusableElements = [];
        this.announcements = [];
    }
}

// Export for ES6 modules
export default AccessibilityManager;
