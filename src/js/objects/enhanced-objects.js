/**
 * Enhanced Interactive Objects - Complete object system for SimulateAI
 * Provides sophisticated UI components with accessibility and animations
 */

// Base Object Foundation
export class BaseObject {
    constructor(options = {}) {
        // Core properties
        this.id = options.id || this.generateId();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.z = options.z || 0;
        this.width = options.width || 100;
        this.height = options.height || 50;
        this.rotation = options.rotation || 0;
        this.scaleX = options.scaleX || 1;
        this.scaleY = options.scaleY || 1;
        this.alpha = options.alpha !== undefined ? options.alpha : 1;
        this.visible = options.visible !== false;
        
        // Interaction states
        this.isInteractive = options.interactive !== false;
        this.isDraggable = options.draggable || false;
        this.isResizable = options.resizable || false;
        this.isFocusable = options.focusable !== false;
        this.isSelectable = options.selectable || false;
        
        // Current states
        this.isHovered = false;
        this.isFocused = false;
        this.isDragging = false;
        this.isSelected = false;
        this.isPressed = false;
        this.isDisabled = options.disabled || false;
        
        // Styling
        this.theme = options.theme || 'default';
        this.className = options.className || '';
        this.style = { ...options.style };
        
        // Accessibility
        this.ariaLabel = options.ariaLabel || '';
        this.ariaRole = options.ariaRole || 'generic';
        this.ariaDescribedBy = options.ariaDescribedBy || '';
        this.tabIndex = options.tabIndex || (this.isInteractive ? 0 : -1);
        
        // Event handlers
        this.eventHandlers = new Map();
        this.setupDefaultHandlers(options);
        
        // Animation support
        this.animations = new Map();
        this.transitions = new Map();
        
        // Parent/child relationships
        this.parent = null;
        this.children = [];
        this.scene = null;
        
        // Layout properties
        this.layout = {
            type: options.layout?.type || 'absolute',
            padding: options.layout?.padding || { top: 0, right: 0, bottom: 0, left: 0 },
            margin: options.layout?.margin || { top: 0, right: 0, bottom: 0, left: 0 },
            align: options.layout?.align || 'start',
            justify: options.layout?.justify || 'start'
        };
    }

    generateId() {
        return `obj_${Math.random().toString(36).substr(2, 9)}`;
    }

    setupDefaultHandlers(options) {
        const events = ['click', 'doubleClick', 'hover', 'focus', 'blur', 'keyDown', 'keyUp', 'drag', 'drop'];
        events.forEach(event => {
            const handlerName = `on${event.charAt(0).toUpperCase()}${event.slice(1)}`;
            if (options[handlerName]) {
                this.on(event, options[handlerName]);
            }
        });
    }

    // Event system
    on(event, handler) {
        if (!this.eventHandlers.has(event)) {
            this.eventHandlers.set(event, []);
        }
        this.eventHandlers.get(event).push(handler);
        return this;
    }

    off(event, handler) {
        if (this.eventHandlers.has(event)) {
            const handlers = this.eventHandlers.get(event);
            const index = handlers.indexOf(handler);
            if (index > -1) {
                handlers.splice(index, 1);
            }
        }
        return this;
    }

    emit(event, data = {}) {
        if (this.eventHandlers.has(event)) {
            this.eventHandlers.get(event).forEach(handler => {
                try {
                    handler.call(this, { ...data, target: this, type: event });
                } catch (error) {
                    console.error(`Error in event handler for ${event}:`, error);
                }
            });
        }
        return this;
    }

    // Parent/child management
    addChild(child) {
        if (child.parent) {
            child.parent.removeChild(child);
        }
        child.parent = this;
        this.children.push(child);
        return this;
    }

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index > -1) {
            this.children.splice(index, 1);
            child.parent = null;
        }
        return this;
    }

    // Bounds checking
    containsPoint(x, y) {
        return x >= this.x && x <= this.x + this.width &&
               y >= this.y && y <= this.y + this.height;
    }

    getBounds() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            right: this.x + this.width,
            bottom: this.y + this.height
        };
    }

    // Input handling
    handleInput(eventType, eventData) {
        if (!this.isInteractive || !this.visible || this.isDisabled) return false;

        switch (eventType) {
            case 'mousedown':
                if (this.containsPoint(eventData.x, eventData.y)) {
                    this.isPressed = true;
                    this.emit('mouseDown', { ...eventData, localX: eventData.x - this.x, localY: eventData.y - this.y });
                    return true;
                }
                break;

            case 'mouseup':
                if (this.isPressed) {
                    this.isPressed = false;
                    this.emit('mouseUp', eventData);
                    
                    if (this.containsPoint(eventData.x, eventData.y)) {
                        this.emit('click', eventData);
                    }
                    return true;
                }
                break;

            case 'mousemove':
                const wasHovered = this.isHovered;
                this.isHovered = this.containsPoint(eventData.x, eventData.y);
                
                if (this.isHovered && !wasHovered) {
                    this.emit('hover', { ...eventData, localX: eventData.x - this.x, localY: eventData.y - this.y });
                } else if (!this.isHovered && wasHovered) {
                    this.emit('hoverEnd', eventData);
                }
                
                if (this.isHovered) {
                    this.emit('mouseMove', { ...eventData, localX: eventData.x - this.x, localY: eventData.y - this.y });
                }
                break;

            case 'keydown':
                if (this.isFocused) {
                    this.emit('keyDown', eventData);
                    return true;
                }
                break;
        }

        return false;
    }

    // Animation support
    animate(property, targetValue, duration = 300, easing = 'easeInOut') {
        return new Promise((resolve) => {
            const startValue = this[property];
            const startTime = performance.now();
            
            const animationId = `${property}_${Date.now()}`;
            
            const animate = (currentTime) => {
                const elapsed = currentTime - startTime;
                const progress = Math.min(elapsed / duration, 1);
                const easedProgress = this.applyEasing(progress, easing);
                
                this[property] = startValue + (targetValue - startValue) * easedProgress;
                
                if (progress < 1) {
                    requestAnimationFrame(animate);
                } else {
                    this.animations.delete(animationId);
                    resolve();
                }
            };
            
            this.animations.set(animationId, animate);
            requestAnimationFrame(animate);
        });
    }

    applyEasing(progress, easing) {
        switch (easing) {
            case 'linear': return progress;
            case 'easeIn': return progress * progress;
            case 'easeOut': return 1 - (1 - progress) * (1 - progress);
            case 'easeInOut': return progress < 0.5 
                ? 2 * progress * progress 
                : 1 - 2 * (1 - progress) * (1 - progress);
            default: return progress;
        }
    }

    // Update lifecycle
    update(deltaTime) {
        this.children.forEach(child => {
            if (child.update) {
                child.update(deltaTime);
            }
        });
    }

    // Render lifecycle
    render(renderer) {
        if (!this.visible) return;
        
        renderer.save();
        
        // Apply transformations
        if (this.x || this.y) renderer.translate(this.x, this.y);
        if (this.rotation) renderer.rotate(this.rotation);
        if (this.scaleX !== 1 || this.scaleY !== 1) renderer.scale(this.scaleX, this.scaleY);
        if (this.alpha !== 1) renderer.setAlpha(this.alpha);
        
        // Render this object
        this.renderSelf(renderer);
        
        // Render children
        this.children.forEach(child => {
            if (child.render) {
                child.render(renderer);
            }
        });
        
        renderer.restore();
    }

    renderSelf(renderer) {
        // Override in subclasses
    }

    // Cleanup
    destroy() {
        this.eventHandlers.clear();
        this.animations.clear();
        this.children.forEach(child => child.destroy());
        this.children = [];
        
        if (this.parent) {
            this.parent.removeChild(this);
        }
    }
}

// Ethics Meter Component
export class EthicsMeter extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 200,
            height: options.height || 60,
            ariaRole: 'progressbar',
            interactive: false
        });
        
        this.category = options.category || 'ethics';
        this.value = options.value || 50;
        this.minValue = options.minValue || 0;
        this.maxValue = options.maxValue || 100;
        this.label = options.label || this.category.charAt(0).toUpperCase() + this.category.slice(1);
        this.showValue = options.showValue !== false;
        this.showLabel = options.showLabel !== false;
        this.animated = options.animated !== false;
        
        // Visual styling
        this.colors = {
            excellent: options.colors?.excellent || '#4CAF50',
            good: options.colors?.good || '#8BC34A',
            fair: options.colors?.fair || '#FFC107',
            poor: options.colors?.poor || '#FF9800',
            critical: options.colors?.critical || '#F44336',
            background: options.colors?.background || '#E0E0E0',
            text: options.colors?.text || '#333333'
        };
        
        this.thresholds = {
            excellent: options.thresholds?.excellent || 90,
            good: options.thresholds?.good || 70,
            fair: options.thresholds?.fair || 50,
            poor: options.thresholds?.poor || 30
        };
        
        // Animation state
        this.displayValue = this.value;
        this.targetValue = this.value;
        
        // Accessibility
        this.ariaLabel = `${this.label} ethics score: ${this.value} out of ${this.maxValue}`;
    }

    updateScore(newValue, reason = '') {
        const clampedValue = Math.max(this.minValue, Math.min(this.maxValue, newValue));
        
        if (this.animated) {
            this.targetValue = clampedValue;
            this.animateToTarget();
        } else {
            this.setValue(clampedValue);
        }
        
        this.emit('scoreUpdate', { 
            oldValue: this.value, 
            newValue: clampedValue, 
            reason,
            category: this.category 
        });
    }

    setValue(value) {
        this.value = value;
        this.displayValue = value;
        this.updateAccessibility();
    }

    animateToTarget() {
        if (Math.abs(this.displayValue - this.targetValue) < 0.1) {
            this.setValue(this.targetValue);
            return;
        }
        
        const diff = this.targetValue - this.displayValue;
        this.displayValue += diff * 0.1;
        
        requestAnimationFrame(() => this.animateToTarget());
    }

    updateAccessibility() {
        this.ariaLabel = `${this.label} ethics score: ${Math.round(this.displayValue)} out of ${this.maxValue}`;
    }

    getScoreColor() {
        const value = this.displayValue;
        if (value >= this.thresholds.excellent) return this.colors.excellent;
        if (value >= this.thresholds.good) return this.colors.good;
        if (value >= this.thresholds.fair) return this.colors.fair;
        if (value >= this.thresholds.poor) return this.colors.poor;
        return this.colors.critical;
    }

    getScoreLabel() {
        const value = this.displayValue;
        if (value >= this.thresholds.excellent) return 'Excellent';
        if (value >= this.thresholds.good) return 'Good';
        if (value >= this.thresholds.fair) return 'Fair';
        if (value >= this.thresholds.poor) return 'Poor';
        return 'Critical';
    }

    renderSelf(renderer) {
        const percentage = (this.displayValue - this.minValue) / (this.maxValue - this.minValue);
        const fillWidth = this.width * percentage;
        
        if (renderer.type === 'canvas') {
            // Background track
            renderer.fillStyle = this.colors.background;
            renderer.fillRect(0, this.height * 0.4, this.width, this.height * 0.3);
            
            // Progress fill
            renderer.fillStyle = this.getScoreColor();
            renderer.fillRect(0, this.height * 0.4, fillWidth, this.height * 0.3);
            
            // Focus ring
            if (this.isFocused) {
                renderer.strokeStyle = '#2196F3';
                renderer.lineWidth = 2;
                renderer.strokeRect(-2, this.height * 0.4 - 2, this.width + 4, this.height * 0.3 + 4);
            }
            
            // Label
            if (this.showLabel) {
                renderer.fillStyle = this.colors.text;
                renderer.font = '14px Arial';
                renderer.textAlign = 'left';
                renderer.fillText(this.label, 0, this.height * 0.3);
            }
            
            // Value display
            if (this.showValue) {
                renderer.fillStyle = this.colors.text;
                renderer.font = '12px Arial';
                renderer.textAlign = 'right';
                const valueText = `${Math.round(this.displayValue)}/${this.maxValue}`;
                renderer.fillText(valueText, this.width, this.height * 0.3);
                
                // Score label
                renderer.font = '10px Arial';
                renderer.fillText(this.getScoreLabel(), this.width, this.height * 0.9);
            }
        }
    }
}

// Enhanced Button Component
export class InteractiveButton extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 120,
            height: options.height || 40,
            ariaRole: 'button'
        });
        
        this.text = options.text || 'Button';
        this.icon = options.icon || null;
        this.variant = options.variant || 'primary';
        this.size = options.size || 'medium';
        
        // Visual states
        this.colors = this.getColorScheme();
        this.currentColor = this.colors.normal;
        
        // Button state
        this.isLoading = false;
        this.loadingText = options.loadingText || 'Loading...';
        
        // Ripple effect
        this.ripples = [];
        
        this.setupEventHandlers();
    }

    getColorScheme() {
        const schemes = {
            primary: {
                normal: { bg: '#2196F3', text: '#FFFFFF', border: '#2196F3' },
                hover: { bg: '#1976D2', text: '#FFFFFF', border: '#1976D2' },
                pressed: { bg: '#0D47A1', text: '#FFFFFF', border: '#0D47A1' },
                disabled: { bg: '#CCCCCC', text: '#666666', border: '#CCCCCC' }
            },
            secondary: {
                normal: { bg: '#757575', text: '#FFFFFF', border: '#757575' },
                hover: { bg: '#616161', text: '#FFFFFF', border: '#616161' },
                pressed: { bg: '#424242', text: '#FFFFFF', border: '#424242' },
                disabled: { bg: '#CCCCCC', text: '#666666', border: '#CCCCCC' }
            },
            outline: {
                normal: { bg: 'transparent', text: '#2196F3', border: '#2196F3' },
                hover: { bg: '#E3F2FD', text: '#1976D2', border: '#1976D2' },
                pressed: { bg: '#BBDEFB', text: '#0D47A1', border: '#0D47A1' },
                disabled: { bg: 'transparent', text: '#CCCCCC', border: '#CCCCCC' }
            }
        };
        
        return schemes[this.variant] || schemes.primary;
    }

    setupEventHandlers() {
        this.on('hover', () => {
            if (!this.isDisabled && !this.isPressed) {
                this.currentColor = this.colors.hover;
                this.animate('scaleX', 1.02, 150);
                this.animate('scaleY', 1.02, 150);
            }
        });

        this.on('hoverEnd', () => {
            if (!this.isDisabled && !this.isPressed) {
                this.currentColor = this.colors.normal;
                this.animate('scaleX', 1, 150);
                this.animate('scaleY', 1, 150);
            }
        });

        this.on('mouseDown', (event) => {
            if (!this.isDisabled) {
                this.isPressed = true;
                this.currentColor = this.colors.pressed;
                this.createRipple(event.localX, event.localY);
            }
        });

        this.on('mouseUp', () => {
            if (!this.isDisabled) {
                this.isPressed = false;
                this.currentColor = this.isHovered ? this.colors.hover : this.colors.normal;
            }
        });

        this.on('keyDown', (event) => {
            if ((event.key === 'Enter' || event.key === ' ') && !this.isDisabled) {
                event.preventDefault();
                this.handleClick();
            }
        });
    }

    createRipple(x, y) {
        const ripple = {
            x: x || this.width / 2,
            y: y || this.height / 2,
            radius: 0,
            maxRadius: Math.max(this.width, this.height),
            alpha: 0.3,
            startTime: performance.now()
        };
        
        this.ripples.push(ripple);
        
        setTimeout(() => {
            const index = this.ripples.indexOf(ripple);
            if (index > -1) {
                this.ripples.splice(index, 1);
            }
        }, 600);
    }

    handleClick() {
        if (!this.isDisabled && !this.isLoading) {
            this.emit('click', { button: this });
        }
    }

    setLoading(loading, text = null) {
        this.isLoading = loading;
        if (text) this.loadingText = text;
        this.isDisabled = loading;
    }

    updateRipples() {
        const currentTime = performance.now();
        this.ripples.forEach(ripple => {
            const elapsed = currentTime - ripple.startTime;
            const progress = Math.min(elapsed / 600, 1);
            
            ripple.radius = ripple.maxRadius * progress;
            ripple.alpha = 0.3 * (1 - progress);
        });
    }

    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        this.updateRipples();
        
        const color = this.isDisabled ? this.colors.disabled : this.currentColor;
        
        // Button background
        if (color.bg !== 'transparent') {
            renderer.fillStyle = color.bg;
            renderer.fillRect(0, 0, this.width, this.height);
        }
        
        // Button border
        if (color.border) {
            renderer.strokeStyle = color.border;
            renderer.lineWidth = 2;
            renderer.strokeRect(0, 0, this.width, this.height);
        }
        
        // Ripple effects
        this.ripples.forEach(ripple => {
            renderer.save();
            renderer.globalAlpha = ripple.alpha;
            renderer.fillStyle = '#FFFFFF';
            renderer.beginPath();
            renderer.arc(ripple.x, ripple.y, ripple.radius, 0, Math.PI * 2);
            renderer.fill();
            renderer.restore();
        });
        
        // Focus ring
        if (this.isFocused) {
            renderer.strokeStyle = '#FF9800';
            renderer.lineWidth = 3;
            renderer.strokeRect(-2, -2, this.width + 4, this.height + 4);
        }
        
        // Button text
        const displayText = this.isLoading ? this.loadingText : this.text;
        renderer.fillStyle = color.text;
        renderer.font = this.getFontSize();
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        
        const textX = this.width / 2;
        const textY = this.height / 2;
        
        // Loading spinner
        if (this.isLoading) {
            this.renderLoadingSpinner(renderer, textX - 30, textY);
            renderer.fillText(displayText, textX + 10, textY);
        } else {
            renderer.fillText(displayText, textX, textY);
        }
    }

    getFontSize() {
        const sizes = {
            small: '12px Arial',
            medium: '14px Arial',
            large: '16px Arial'
        };
        return sizes[this.size] || sizes.medium;
    }

    renderLoadingSpinner(renderer, x, y) {
        const time = performance.now() / 1000;
        const rotation = time * Math.PI * 2;
        
        renderer.save();
        renderer.translate(x, y);
        renderer.rotate(rotation);
        
        renderer.strokeStyle = this.currentColor.text;
        renderer.lineWidth = 2;
        renderer.beginPath();
        renderer.arc(0, 0, 8, 0, Math.PI * 1.5);
        renderer.stroke();
        
        renderer.restore();
    }
}

// Enhanced Slider Component
export class InteractiveSlider extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 200,
            height: options.height || 40,
            ariaRole: 'slider',
            draggable: true
        });
        
        this.min = options.min || 0;
        this.max = options.max || 100;
        this.value = Math.max(this.min, Math.min(this.max, options.value || 50));
        this.step = options.step || 1;
        this.label = options.label || '';
        this.unit = options.unit || '';
        
        // Visual properties
        this.trackHeight = options.trackHeight || 6;
        this.handleSize = options.handleSize || 20;
        this.showValue = options.showValue !== false;
        this.showLabel = options.showLabel !== false;
        
        // Colors
        this.colors = {
            track: options.colors?.track || '#E0E0E0',
            fill: options.colors?.fill || '#2196F3',
            handle: options.colors?.handle || '#FFFFFF',
            handleBorder: options.colors?.handleBorder || '#2196F3',
            text: options.colors?.text || '#333333'
        };
        
        // State
        this.isDraggingHandle = false;
        this.dragOffset = 0;
        this.hoverHandle = false;
        
        this.setupEventHandlers();
        this.updateAccessibility();
    }

    setupEventHandlers() {
        this.on('mouseDown', (event) => {
            const handleX = this.getHandlePosition();
            const clickX = event.localX;
            
            if (Math.abs(clickX - handleX) <= this.handleSize / 2) {
                this.isDraggingHandle = true;
                this.dragOffset = clickX - handleX;
                this.emit('dragStart', { value: this.value });
            } else {
                this.jumpToPosition(clickX);
            }
        });

        this.on('hover', (event) => {
            const handleX = this.getHandlePosition();
            this.hoverHandle = Math.abs(event.localX - handleX) <= this.handleSize / 2;
        });

        this.on('keyDown', (event) => {
            let newValue = this.value;
            
            switch (event.key) {
                case 'ArrowLeft':
                case 'ArrowDown':
                    newValue = Math.max(this.min, this.value - this.step);
                    break;
                case 'ArrowRight':
                case 'ArrowUp':
                    newValue = Math.min(this.max, this.value + this.step);
                    break;
                case 'Home':
                    newValue = this.min;
                    break;
                case 'End':
                    newValue = this.max;
                    break;
                default:
                    return;
            }
            
            if (newValue !== this.value) {
                event.preventDefault();
                this.setValue(newValue, true);
            }
        });
    }

    jumpToPosition(x) {
        const trackStart = this.handleSize / 2;
        const trackWidth = this.width - this.handleSize;
        const percentage = Math.max(0, Math.min(1, (x - trackStart) / trackWidth));
        const newValue = this.min + (this.max - this.min) * percentage;
        this.setValue(this.snapToStep(newValue), true);
    }

    snapToStep(value) {
        return Math.round((value - this.min) / this.step) * this.step + this.min;
    }

    setValue(newValue, emitChange = false) {
        const clampedValue = Math.max(this.min, Math.min(this.max, newValue));
        const oldValue = this.value;
        
        this.value = clampedValue;
        this.updateAccessibility();
        
        if (emitChange && oldValue !== clampedValue) {
            this.emit('change', { 
                oldValue, 
                newValue: clampedValue, 
                percentage: (clampedValue - this.min) / (this.max - this.min) 
            });
        }
    }

    updateAccessibility() {
        const percentage = Math.round(((this.value - this.min) / (this.max - this.min)) * 100);
        this.ariaLabel = `${this.label || 'Slider'}: ${this.value}${this.unit} (${percentage}%)`;
    }

    getHandlePosition() {
        const trackStart = this.handleSize / 2;
        const trackWidth = this.width - this.handleSize;
        const percentage = (this.value - this.min) / (this.max - this.min);
        return trackStart + trackWidth * percentage;
    }

    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        const trackY = this.height / 2 - this.trackHeight / 2;
        const handleX = this.getHandlePosition();
        const handleY = this.height / 2;
        
        // Label
        if (this.showLabel && this.label) {
            renderer.fillStyle = this.colors.text;
            renderer.font = '12px Arial';
            renderer.textAlign = 'left';
            renderer.fillText(this.label, 0, -5);
        }
        
        // Track background
        renderer.fillStyle = this.colors.track;
        renderer.fillRect(this.handleSize / 2, trackY, this.width - this.handleSize, this.trackHeight);
        
        // Track fill
        const fillWidth = handleX - this.handleSize / 2;
        renderer.fillStyle = this.colors.fill;
        renderer.fillRect(this.handleSize / 2, trackY, fillWidth, this.trackHeight);
        
        // Handle
        renderer.fillStyle = this.colors.handle;
        renderer.beginPath();
        renderer.arc(handleX, handleY, this.handleSize / 2, 0, Math.PI * 2);
        renderer.fill();
        
        // Handle border
        renderer.strokeStyle = this.colors.handleBorder;
        renderer.lineWidth = this.hoverHandle || this.isDraggingHandle ? 3 : 2;
        renderer.stroke();
        
        // Focus ring
        if (this.isFocused) {
            renderer.strokeStyle = '#FF9800';
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.arc(handleX, handleY, this.handleSize / 2 + 3, 0, Math.PI * 2);
            renderer.stroke();
        }
        
        // Value display
        if (this.showValue) {
            renderer.fillStyle = this.colors.text;
            renderer.font = '11px Arial';
            renderer.textAlign = 'center';
            const valueText = `${Math.round(this.value)}${this.unit}`;            renderer.fillText(valueText, handleX, this.height + 15);
        }
    }
}
