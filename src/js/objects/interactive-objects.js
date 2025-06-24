/**
 * Interactive Objects - Base classes and common UI components for the Visual Engine
 * Provides buttons, sliders, meters, and other interactive elements
 */

// Base class for all interactive objects
export class InteractiveObject {
    constructor(options = {}) {
        this.id = options.id || this.generateId();
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.width = options.width || 100;
        this.height = options.height || 30;
        this.visible = options.visible !== false;
        this.interactive = options.interactive !== false;
        this.zIndex = options.zIndex || 0;
        this.alpha = options.alpha !== undefined ? options.alpha : 1;
        this.rotation = options.rotation || 0;
        this.scale = options.scale || 1;
        
        // Styling
        this.fill = options.fill || '#ffffff';
        this.stroke = options.stroke || '#cccccc';
        this.strokeWidth = options.strokeWidth || 1;
        
        // State
        this.enabled = options.enabled !== false;
        this.focused = false;
        this.hovered = false;
        this.pressed = false;
        
        // Callbacks
        this.onClick = options.onClick || null;
        this.onMouseDown = options.onMouseDown || null;
        this.onMouseUp = options.onMouseUp || null;
        this.onMouseMove = options.onMouseMove || null;
        this.onMouseEnter = options.onMouseEnter || null;
        this.onMouseLeave = options.onMouseLeave || null;
        this.onFocus = options.onFocus || null;
        this.onBlur = options.onBlur || null;
        this.onChange = options.onChange || null;
        
        // Scene reference (set when added to scene)
        this.scene = null;
        
        // Accessibility
        this.accessibilityConfig = this.getDefaultAccessibilityConfig();
        if (options.accessibilityConfig) {
            Object.assign(this.accessibilityConfig, options.accessibilityConfig);
        }
    }

    generateId() {
        return 'obj_' + Math.random().toString(36).substr(2, 9);
    }

    getDefaultAccessibilityConfig() {
        return {
            role: 'button',
            focusable: true,
            description: 'Interactive object',
            keyboardActions: {
                'Enter': 'click',
                'Space': 'click'
            }
        };
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
        if (!this.enabled || !this.visible) return false;

        switch (eventType) {
            case 'mousedown':
                if (this.containsPoint(eventData.x, eventData.y)) {
                    this.pressed = true;
                    if (this.onMouseDown) this.onMouseDown(eventData);
                    return true;
                }
                break;

            case 'mouseup':
                if (this.pressed) {
                    this.pressed = false;
                    if (this.onMouseUp) this.onMouseUp(eventData);
                    
                    if (this.containsPoint(eventData.x, eventData.y)) {
                        if (this.onClick) this.onClick(eventData);
                    }
                    return true;
                }
                break;

            case 'mousemove':
                const wasHovered = this.hovered;
                this.hovered = this.containsPoint(eventData.x, eventData.y);
                
                if (this.hovered && !wasHovered) {
                    if (this.onMouseEnter) this.onMouseEnter(eventData);
                } else if (!this.hovered && wasHovered) {
                    if (this.onMouseLeave) this.onMouseLeave(eventData);
                }
                
                if (this.hovered && this.onMouseMove) {
                    this.onMouseMove(eventData);
                }
                break;

            case 'keydown':
                if (this.focused && this.accessibilityConfig.keyboardActions) {
                    const action = this.accessibilityConfig.keyboardActions[eventData.key];
                    if (action === 'click' && this.onClick) {
                        this.onClick(eventData);
                        return true;
                    }
                }
                break;
        }

        return false;
    }

    // State management
    setEnabled(enabled) {
        this.enabled = enabled;
        this.updateStyle();
    }

    setFocused(focused) {
        this.focused = focused;
        this.updateStyle();
        
        if (focused && this.onFocus) {
            this.onFocus();
        } else if (!focused && this.onBlur) {
            this.onBlur();
        }
    }

    updateStyle() {
        // Override in subclasses to update visual appearance based on state
    }

    // Update method (called by scene)
    update(deltaTime) {
        // Override in subclasses for animation or state updates
    }

    // Render method (override in subclasses)
    render(renderer) {
        // Default render - just draw a rectangle
        renderer.drawRect(this.x, this.y, this.width, this.height, {
            fill: this.fill,
            stroke: this.stroke,
            strokeWidth: this.strokeWidth
        });
    }
}

// Button component
export class Button extends InteractiveObject {
    constructor(options = {}) {
        super({
            width: 120,
            height: 40,
            fill: '#007cba',
            stroke: '#005a87',
            ...options
        });
        
        this.type = 'button';
        this.text = options.text || 'Button';
        this.textColor = options.textColor || '#ffffff';
        this.font = options.font || '14px Arial';
        this.borderRadius = options.borderRadius || 4;
        
        // Button states
        this.colors = {
            normal: { fill: this.fill, stroke: this.stroke },
            hover: { fill: options.hoverColor || '#0099e6', stroke: this.stroke },
            pressed: { fill: options.pressedColor || '#004d73', stroke: this.stroke },
            disabled: { fill: '#cccccc', stroke: '#999999' }
        };
        
        this.accessibilityConfig.description = options.text || 'Button';
    }

    updateStyle() {
        if (!this.enabled) {
            this.fill = this.colors.disabled.fill;
            this.stroke = this.colors.disabled.stroke;
        } else if (this.pressed) {
            this.fill = this.colors.pressed.fill;
            this.stroke = this.colors.pressed.stroke;
        } else if (this.hovered) {
            this.fill = this.colors.hover.fill;
            this.stroke = this.colors.hover.stroke;
        } else {
            this.fill = this.colors.normal.fill;
            this.stroke = this.colors.normal.stroke;
        }
    }

    render(renderer) {
        this.updateStyle();
        
        // Draw button background
        if (renderer.type === 'canvas') {
            renderer.drawRect(this.x, this.y, this.width, this.height, {
                fill: this.fill,
                stroke: this.stroke,
                strokeWidth: this.strokeWidth,
                borderRadius: this.borderRadius
            });
            
            // Draw text
            renderer.drawText(this.text, 
                this.x + this.width / 2, 
                this.y + this.height / 2, {
                    font: this.font,
                    fill: this.textColor,
                    align: 'center',
                    baseline: 'middle'
                });
        } else if (renderer.type === 'svg') {
            const group = renderer.createSVGElement('g');
            
            // Button background
            const rect = renderer.createSVGElement('rect', {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                fill: this.fill,
                stroke: this.stroke,
                'stroke-width': this.strokeWidth,
                rx: this.borderRadius
            });
            group.appendChild(rect);
            
            // Button text
            const text = renderer.createSVGElement('text', {
                x: this.x + this.width / 2,
                y: this.y + this.height / 2,
                'text-anchor': 'middle',
                'dominant-baseline': 'central',
                fill: this.textColor,
                'font-family': 'Arial',
                'font-size': '14px'
            });
            text.textContent = this.text;
            group.appendChild(text);
            
            return group;
        }
    }
}

// Slider component
export class Slider extends InteractiveObject {
    constructor(options = {}) {
        super({
            width: 200,
            height: 20,
            fill: '#e0e0e0',
            stroke: '#cccccc',
            ...options
        });
        
        this.type = 'slider';
        this.min = options.min || 0;
        this.max = options.max || 100;
        this.value = options.value !== undefined ? options.value : 50;
        this.step = options.step || 1;
        
        // Handle styling
        this.handleWidth = options.handleWidth || 20;
        this.handleHeight = options.handleHeight || this.height + 4;
        this.handleColor = options.handleColor || '#007cba';
        this.trackColor = options.trackColor || '#f0f0f0';
        this.fillColor = options.fillColor || '#007cba';
        
        this.isDragging = false;
        this.dragOffset = 0;
        
        this.accessibilityConfig = {
            role: 'slider',
            focusable: true,
            description: `Slider, value ${this.value}`,
            keyboardActions: {
                'ArrowLeft': 'decrease',
                'ArrowRight': 'increase',
                'ArrowDown': 'decrease',
                'ArrowUp': 'increase'
            }
        };
    }

    getHandlePosition() {
        const progress = (this.value - this.min) / (this.max - this.min);
        return this.x + (this.width - this.handleWidth) * progress;
    }

    setValue(newValue) {
        const oldValue = this.value;
        this.value = Math.max(this.min, Math.min(this.max, newValue));
        
        if (this.value !== oldValue && this.onChange) {
            this.onChange(this.value, oldValue);
        }
        
        this.accessibilityConfig.description = `Slider, value ${this.value}`;
    }

    handleInput(eventType, eventData) {
        if (!this.enabled || !this.visible) return false;

        switch (eventType) {
            case 'mousedown':
                const handleX = this.getHandlePosition();
                const handleBounds = {
                    x: handleX,
                    y: this.y - 2,
                    width: this.handleWidth,
                    height: this.handleHeight
                };
                
                if (eventData.x >= handleBounds.x && eventData.x <= handleBounds.x + handleBounds.width &&
                    eventData.y >= handleBounds.y && eventData.y <= handleBounds.y + handleBounds.height) {
                    this.isDragging = true;
                    this.dragOffset = eventData.x - handleX;
                    return true;
                } else if (this.containsPoint(eventData.x, eventData.y)) {
                    // Click on track - jump to position
                    const progress = (eventData.x - this.x) / this.width;
                    const newValue = this.min + progress * (this.max - this.min);
                    this.setValue(newValue);
                    return true;
                }
                break;

            case 'mousemove':
                if (this.isDragging) {
                    const newHandleX = eventData.x - this.dragOffset;
                    const progress = (newHandleX - this.x) / (this.width - this.handleWidth);
                    const newValue = this.min + Math.max(0, Math.min(1, progress)) * (this.max - this.min);
                    this.setValue(Math.round(newValue / this.step) * this.step);
                    return true;
                }
                break;

            case 'mouseup':
                if (this.isDragging) {
                    this.isDragging = false;
                    return true;
                }
                break;

            case 'keydown':
                if (this.focused) {
                    let changed = false;
                    const stepSize = this.step;
                    
                    switch (eventData.key) {
                        case 'ArrowLeft':
                        case 'ArrowDown':
                            this.setValue(this.value - stepSize);
                            changed = true;
                            break;
                        case 'ArrowRight':
                        case 'ArrowUp':
                            this.setValue(this.value + stepSize);
                            changed = true;
                            break;
                    }
                    
                    if (changed) return true;
                }
                break;
        }

        return super.handleInput(eventType, eventData);
    }

    render(renderer) {
        const handleX = this.getHandlePosition();
        const progress = (this.value - this.min) / (this.max - this.min);
        
        if (renderer.type === 'canvas') {
            // Draw track
            renderer.drawRect(this.x, this.y + this.height / 4, this.width, this.height / 2, {
                fill: this.trackColor,
                stroke: this.stroke,
                strokeWidth: 1
            });
            
            // Draw filled portion
            const fillWidth = this.width * progress;
            if (fillWidth > 0) {
                renderer.drawRect(this.x, this.y + this.height / 4, fillWidth, this.height / 2, {
                    fill: this.fillColor
                });
            }
            
            // Draw handle
            renderer.drawRect(handleX, this.y - 2, this.handleWidth, this.handleHeight, {
                fill: this.handleColor,
                stroke: '#005a87',
                strokeWidth: 2,
                borderRadius: 2
            });
        } else if (renderer.type === 'svg') {
            const group = renderer.createSVGElement('g');
            
            // Track
            const track = renderer.createSVGElement('rect', {
                x: this.x,
                y: this.y + this.height / 4,
                width: this.width,
                height: this.height / 2,
                fill: this.trackColor,
                stroke: this.stroke
            });
            group.appendChild(track);
            
            // Fill
            if (progress > 0) {
                const fill = renderer.createSVGElement('rect', {
                    x: this.x,
                    y: this.y + this.height / 4,
                    width: this.width * progress,
                    height: this.height / 2,
                    fill: this.fillColor
                });
                group.appendChild(fill);
            }
            
            // Handle
            const handle = renderer.createSVGElement('rect', {
                x: handleX,
                y: this.y - 2,
                width: this.handleWidth,
                height: this.handleHeight,
                fill: this.handleColor,
                stroke: '#005a87',
                'stroke-width': 2,
                rx: 2
            });
            group.appendChild(handle);
            
            return group;
        }
    }
}

// Meter/Progress component
export class Meter extends InteractiveObject {
    constructor(options = {}) {
        super({
            width: 200,
            height: 30,
            fill: '#f0f0f0',
            stroke: '#cccccc',
            interactive: false,
            ...options
        });
        
        this.type = 'meter';
        this.min = options.min || 0;
        this.max = options.max || 100;
        this.value = options.value !== undefined ? options.value : 0;
        this.label = options.label || '';
        this.showValue = options.showValue !== false;
        
        // Styling
        this.fillColor = options.fillColor || '#4caf50';
        this.textColor = options.textColor || '#333333';
        this.font = options.font || '12px Arial';
        
        this.accessibilityConfig = {
            role: 'progressbar',
            focusable: false,
            description: `${this.label} progress: ${this.value} of ${this.max}`
        };
    }

    setValue(newValue) {
        this.value = Math.max(this.min, Math.min(this.max, newValue));
        this.accessibilityConfig.description = `${this.label} progress: ${this.value} of ${this.max}`;
    }

    render(renderer) {
        const progress = (this.value - this.min) / (this.max - this.min);
        const fillWidth = this.width * progress;
        
        if (renderer.type === 'canvas') {
            // Draw background
            renderer.drawRect(this.x, this.y, this.width, this.height, {
                fill: this.fill,
                stroke: this.stroke,
                strokeWidth: this.strokeWidth
            });
            
            // Draw fill
            if (fillWidth > 0) {
                renderer.drawRect(this.x, this.y, fillWidth, this.height, {
                    fill: this.fillColor
                });
            }
            
            // Draw text
            if (this.label || this.showValue) {
                const text = this.label + (this.showValue ? ` ${this.value}` : '');
                renderer.drawText(text, 
                    this.x + this.width / 2, 
                    this.y + this.height / 2, {
                        font: this.font,
                        fill: this.textColor,
                        align: 'center',
                        baseline: 'middle'
                    });
            }
        } else if (renderer.type === 'svg') {
            const group = renderer.createSVGElement('g');
            
            // Background
            const bg = renderer.createSVGElement('rect', {
                x: this.x,
                y: this.y,
                width: this.width,
                height: this.height,
                fill: this.fill,
                stroke: this.stroke,
                'stroke-width': this.strokeWidth
            });
            group.appendChild(bg);
            
            // Fill
            if (fillWidth > 0) {
                const fill = renderer.createSVGElement('rect', {
                    x: this.x,
                    y: this.y,
                    width: fillWidth,
                    height: this.height,
                    fill: this.fillColor
                });
                group.appendChild(fill);
            }
            
            // Text
            if (this.label || this.showValue) {
                const text = this.label + (this.showValue ? ` ${this.value}` : '');
                const textElement = renderer.createSVGElement('text', {
                    x: this.x + this.width / 2,
                    y: this.y + this.height / 2,
                    'text-anchor': 'middle',
                    'dominant-baseline': 'central',
                    fill: this.textColor,
                    'font-family': 'Arial',
                    'font-size': '12px'
                });
                textElement.textContent = text;
                group.appendChild(textElement);
            }
            
            return group;
        }
    }
}

// Text label component
export class Label extends InteractiveObject {
    constructor(options = {}) {
        super({
            width: 100,
            height: 20,
            interactive: false,
            fill: 'transparent',
            stroke: 'none',
            ...options
        });
        
        this.type = 'label';
        this.text = options.text || 'Label';
        this.textColor = options.textColor || '#333333';
        this.font = options.font || '14px Arial';
        this.align = options.align || 'left';
        
        this.accessibilityConfig = {
            role: 'text',
            focusable: false,
            description: this.text
        };
    }

    setText(newText) {
        this.text = newText;
        this.accessibilityConfig.description = this.text;
    }

    render(renderer) {
        if (renderer.type === 'canvas') {
            renderer.drawText(this.text, this.x, this.y, {
                font: this.font,
                fill: this.textColor,
                align: this.align
            });
        } else if (renderer.type === 'svg') {
            return renderer.createSVGElement('text', {
                x: this.x,
                y: this.y,
                fill: this.textColor,
                'font-family': 'Arial',
                'font-size': '14px',
                'text-anchor': this.align === 'center' ? 'middle' : this.align
            }, this.text);
        }
    }
}

export { InteractiveObject as default };
