/**
 * Input Manager - Handles all input events for the Visual Engine
 * Supports mouse, keyboard, touch, and gamepad inputs
 * Provides unified event handling and gesture recognition
 */

export class InputManager {
    constructor(engine) {
        this.engine = engine;
        this.container = engine.container;
        this.renderer = engine.renderer;
        
        // Input state
        this.mouse = {
            x: 0,
            y: 0,
            down: false,
            button: -1,
            wheel: 0
        };
        
        this.keyboard = {
            keys: new Set(),
            modifiers: {
                shift: false,
                ctrl: false,
                alt: false,
                meta: false
            }
        };
        
        this.touch = {
            touches: new Map(),
            gestures: {
                pinch: { active: false, scale: 1, startDistance: 0 },
                pan: { active: false, deltaX: 0, deltaY: 0 },
                tap: { active: false, startTime: 0 }
            }
        };
        
        // Event callbacks
        this.eventHandlers = new Map();
        
        // Gesture settings
        this.gestureThreshold = {
            tapTimeout: 300,
            panThreshold: 10,
            pinchThreshold: 20
        };
        
        this.init();
    }

    init() {
        this.setupMouseEvents();
        this.setupKeyboardEvents();
        this.setupTouchEvents();
        this.setupWheelEvents();
        
        console.log('InputManager: Initialized');
    }

    setupMouseEvents() {
        const element = this.renderer.getElement();
        
        element.addEventListener('mousedown', (e) => this.handleMouseDown(e));
        element.addEventListener('mousemove', (e) => this.handleMouseMove(e));
        element.addEventListener('mouseup', (e) => this.handleMouseUp(e));
        element.addEventListener('mouseenter', (e) => this.handleMouseEnter(e));
        element.addEventListener('mouseleave', (e) => this.handleMouseLeave(e));
        element.addEventListener('contextmenu', (e) => this.handleContextMenu(e));
    }

    setupKeyboardEvents() {
        // Use document for keyboard events to capture global shortcuts
        document.addEventListener('keydown', (e) => this.handleKeyDown(e));
        document.addEventListener('keyup', (e) => this.handleKeyUp(e));
    }

    setupTouchEvents() {
        const element = this.renderer.getElement();
        
        element.addEventListener('touchstart', (e) => this.handleTouchStart(e));
        element.addEventListener('touchmove', (e) => this.handleTouchMove(e));
        element.addEventListener('touchend', (e) => this.handleTouchEnd(e));
        element.addEventListener('touchcancel', (e) => this.handleTouchCancel(e));
    }

    setupWheelEvents() {
        const element = this.renderer.getElement();
        element.addEventListener('wheel', (e) => this.handleWheel(e));
    }

    // Mouse event handlers
    handleMouseDown(event) {
        const coords = this.getEventCoordinates(event);
        
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        this.mouse.down = true;
        this.mouse.button = event.button;
        
        this.updateKeyboardModifiers(event);
        
        const inputEvent = {
            type: 'mousedown',
            x: coords.x,
            y: coords.y,
            button: event.button,
            originalEvent: event,
            ...this.keyboard.modifiers
        };
        
        this.emit('mousedown', inputEvent);
        this.notifyScene('mousedown', inputEvent);
    }

    handleMouseMove(event) {
        const coords = this.getEventCoordinates(event);
        
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        
        this.updateKeyboardModifiers(event);
        
        const inputEvent = {
            type: 'mousemove',
            x: coords.x,
            y: coords.y,
            button: this.mouse.button,
            down: this.mouse.down,
            originalEvent: event,
            ...this.keyboard.modifiers
        };
        
        this.emit('mousemove', inputEvent);
        this.notifyScene('mousemove', inputEvent);
    }

    handleMouseUp(event) {
        const coords = this.getEventCoordinates(event);
        
        this.mouse.x = coords.x;
        this.mouse.y = coords.y;
        this.mouse.down = false;
        
        this.updateKeyboardModifiers(event);
        
        const inputEvent = {
            type: 'mouseup',
            x: coords.x,
            y: coords.y,
            button: event.button,
            originalEvent: event,
            ...this.keyboard.modifiers
        };
        
        this.emit('mouseup', inputEvent);
        this.notifyScene('mouseup', inputEvent);
        
        this.mouse.button = -1;
    }

    handleMouseEnter(event) {
        this.emit('mouseenter', { originalEvent: event });
    }

    handleMouseLeave(event) {
        this.mouse.down = false;
        this.mouse.button = -1;
        this.emit('mouseleave', { originalEvent: event });
    }

    handleContextMenu(event) {
        // Prevent default context menu unless specifically allowed
        event.preventDefault();
        this.emit('contextmenu', { originalEvent: event });
    }

    // Keyboard event handlers
    handleKeyDown(event) {
        // Only handle if container has focus or event is global
        if (!this.container.contains(document.activeElement) && !this.isGlobalShortcut(event)) {
            return;
        }

        this.keyboard.keys.add(event.code);
        this.updateKeyboardModifiers(event);
        
        const inputEvent = {
            type: 'keydown',
            key: event.key,
            code: event.code,
            repeat: event.repeat,
            originalEvent: event,
            ...this.keyboard.modifiers
        };
        
        this.emit('keydown', inputEvent);
        this.notifyScene('keydown', inputEvent);
    }

    handleKeyUp(event) {
        this.keyboard.keys.delete(event.code);
        this.updateKeyboardModifiers(event);
        
        const inputEvent = {
            type: 'keyup',
            key: event.key,
            code: event.code,
            originalEvent: event,
            ...this.keyboard.modifiers
        };
        
        this.emit('keyup', inputEvent);
        this.notifyScene('keyup', inputEvent);
    }

    // Touch event handlers
    handleTouchStart(event) {
        event.preventDefault();
        
        const touches = this.processTouches(event.touches);
        
        // Update touch state
        touches.forEach(touch => {
            this.touch.touches.set(touch.identifier, touch);
        });
        
        // Detect gestures
        this.detectGestures(touches);
        
        const inputEvent = {
            type: 'touchstart',
            touches: touches,
            originalEvent: event
        };
        
        this.emit('touchstart', inputEvent);
        this.notifyScene('touchstart', inputEvent);
    }

    handleTouchMove(event) {
        event.preventDefault();
        
        const touches = this.processTouches(event.touches);
        
        // Update touch state
        touches.forEach(touch => {
            this.touch.touches.set(touch.identifier, touch);
        });
        
        // Update gestures
        this.updateGestures(touches);
        
        const inputEvent = {
            type: 'touchmove',
            touches: touches,
            gestures: this.touch.gestures,
            originalEvent: event
        };
        
        this.emit('touchmove', inputEvent);
        this.notifyScene('touchmove', inputEvent);
    }

    handleTouchEnd(event) {
        event.preventDefault();
        
        const touches = this.processTouches(event.changedTouches);
        
        // Remove ended touches
        touches.forEach(touch => {
            this.touch.touches.delete(touch.identifier);
        });
        
        // Finalize gestures
        this.finalizeGestures(touches);
        
        const inputEvent = {
            type: 'touchend',
            touches: touches,
            gestures: this.touch.gestures,
            originalEvent: event
        };
        
        this.emit('touchend', inputEvent);
        this.notifyScene('touchend', inputEvent);
    }

    handleTouchCancel(event) {
        // Clear all touches and gestures
        this.touch.touches.clear();
        this.resetGestures();
        
        this.emit('touchcancel', { originalEvent: event });
    }

    // Wheel event handler
    handleWheel(event) {
        event.preventDefault();
        
        const coords = this.getEventCoordinates(event);
        this.mouse.wheel = event.deltaY;
        
        const inputEvent = {
            type: 'wheel',
            x: coords.x,
            y: coords.y,
            deltaX: event.deltaX,
            deltaY: event.deltaY,
            deltaZ: event.deltaZ,
            originalEvent: event
        };
        
        this.emit('wheel', inputEvent);
        this.notifyScene('wheel', inputEvent);
    }

    // Utility methods
    getEventCoordinates(event) {
        const rect = this.renderer.getElement().getBoundingClientRect();
        return {
            x: event.clientX - rect.left,
            y: event.clientY - rect.top
        };
    }

    processTouches(touchList) {
        const rect = this.renderer.getElement().getBoundingClientRect();
        const touches = [];
        
        for (let i = 0; i < touchList.length; i++) {
            const touch = touchList[i];
            touches.push({
                identifier: touch.identifier,
                x: touch.clientX - rect.left,
                y: touch.clientY - rect.top,
                radiusX: touch.radiusX || 20,
                radiusY: touch.radiusY || 20,
                force: touch.force || 1
            });
        }
        
        return touches;
    }

    updateKeyboardModifiers(event) {
        this.keyboard.modifiers.shift = event.shiftKey;
        this.keyboard.modifiers.ctrl = event.ctrlKey;
        this.keyboard.modifiers.alt = event.altKey;
        this.keyboard.modifiers.meta = event.metaKey;
    }

    isGlobalShortcut(event) {
        // Define global shortcuts that should work regardless of focus
        const globalShortcuts = [
            'F1', 'F11', 'F12', // Help, fullscreen, dev tools
            'Tab' // Accessibility navigation
        ];
        
        return globalShortcuts.includes(event.key) || 
               (event.ctrlKey && ['?', 'h', 'H'].includes(event.key));
    }

    // Gesture detection
    detectGestures(touches) {
        if (touches.length === 1) {
            // Single touch - potential tap
            this.touch.gestures.tap = {
                active: true,
                startTime: performance.now(),
                startX: touches[0].x,
                startY: touches[0].y
            };
        } else if (touches.length === 2) {
            // Two touches - potential pinch
            const distance = this.getTouchDistance(touches[0], touches[1]);
            this.touch.gestures.pinch = {
                active: true,
                scale: 1,
                startDistance: distance,
                centerX: (touches[0].x + touches[1].x) / 2,
                centerY: (touches[0].y + touches[1].y) / 2
            };
        }
    }

    updateGestures(touches) {
        // Update pinch gesture
        if (this.touch.gestures.pinch.active && touches.length === 2) {
            const distance = this.getTouchDistance(touches[0], touches[1]);
            const scale = distance / this.touch.gestures.pinch.startDistance;
            
            this.touch.gestures.pinch.scale = scale;
            this.touch.gestures.pinch.centerX = (touches[0].x + touches[1].x) / 2;
            this.touch.gestures.pinch.centerY = (touches[0].y + touches[1].y) / 2;
            
            // Emit pinch event
            this.emit('pinch', {
                scale: scale,
                centerX: this.touch.gestures.pinch.centerX,
                centerY: this.touch.gestures.pinch.centerY
            });
        }
        
        // Update pan gesture
        if (touches.length === 1 && this.touch.gestures.tap.active) {
            const deltaX = touches[0].x - this.touch.gestures.tap.startX;
            const deltaY = touches[0].y - this.touch.gestures.tap.startY;
            const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
            
            if (distance > this.gestureThreshold.panThreshold) {
                this.touch.gestures.tap.active = false;
                this.touch.gestures.pan = {
                    active: true,
                    deltaX: deltaX,
                    deltaY: deltaY
                };
                
                this.emit('panstart', {
                    x: touches[0].x,
                    y: touches[0].y,
                    deltaX: deltaX,
                    deltaY: deltaY
                });
            }
        }
    }

    finalizeGestures(touches) {
        // Check for tap completion
        if (this.touch.gestures.tap.active) {
            const elapsed = performance.now() - this.touch.gestures.tap.startTime;
            if (elapsed < this.gestureThreshold.tapTimeout) {
                this.emit('tap', {
                    x: this.touch.gestures.tap.startX,
                    y: this.touch.gestures.tap.startY
                });
            }
        }
        
        // Finalize pan gesture
        if (this.touch.gestures.pan.active) {
            this.emit('panend', {
                deltaX: this.touch.gestures.pan.deltaX,
                deltaY: this.touch.gestures.pan.deltaY
            });
        }
        
        this.resetGestures();
    }

    resetGestures() {
        this.touch.gestures = {
            pinch: { active: false, scale: 1, startDistance: 0 },
            pan: { active: false, deltaX: 0, deltaY: 0 },
            tap: { active: false, startTime: 0 }
        };
    }

    getTouchDistance(touch1, touch2) {
        const dx = touch1.x - touch2.x;
        const dy = touch1.y - touch2.y;
        return Math.sqrt(dx * dx + dy * dy);
    }

    // Event system
    on(eventType, callback) {
        if (!this.eventHandlers.has(eventType)) {
            this.eventHandlers.set(eventType, new Set());
        }
        this.eventHandlers.get(eventType).add(callback);
    }

    off(eventType, callback) {
        if (this.eventHandlers.has(eventType)) {
            this.eventHandlers.get(eventType).delete(callback);
        }
    }

    emit(eventType, eventData) {
        if (this.eventHandlers.has(eventType)) {
            this.eventHandlers.get(eventType).forEach(callback => {
                try {
                    callback(eventData);
                } catch (error) {
                    console.error(`Error in input event handler for ${eventType}:`, error);
                }
            });
        }
    }

    notifyScene(eventType, eventData) {
        if (this.engine.scene && this.engine.scene.handleInput) {
            this.engine.scene.handleInput(eventType, eventData);
        }
    }

    // Query methods
    isKeyPressed(keyCode) {
        return this.keyboard.keys.has(keyCode);
    }

    isMouseDown() {
        return this.mouse.down;
    }

    getMousePosition() {
        return { x: this.mouse.x, y: this.mouse.y };
    }

    getTouchCount() {
        return this.touch.touches.size;
    }

    // Update method (called by engine)
    update(deltaTime) {
        // Update any time-based input processing
        // Currently used for gesture timeouts and key repeat handling
    }

    // Cleanup
    destroy() {
        const element = this.renderer.getElement();
        
        // Remove mouse event listeners
        element.removeEventListener('mousedown', this.handleMouseDown);
        element.removeEventListener('mousemove', this.handleMouseMove);
        element.removeEventListener('mouseup', this.handleMouseUp);
        element.removeEventListener('mouseenter', this.handleMouseEnter);
        element.removeEventListener('mouseleave', this.handleMouseLeave);
        element.removeEventListener('contextmenu', this.handleContextMenu);
        
        // Remove keyboard event listeners
        document.removeEventListener('keydown', this.handleKeyDown);
        document.removeEventListener('keyup', this.handleKeyUp);
        
        // Remove touch event listeners
        element.removeEventListener('touchstart', this.handleTouchStart);
        element.removeEventListener('touchmove', this.handleTouchMove);
        element.removeEventListener('touchend', this.handleTouchEnd);
        element.removeEventListener('touchcancel', this.handleTouchCancel);
        
        // Remove wheel event listener
        element.removeEventListener('wheel', this.handleWheel);
        
        // Clear state
        this.eventHandlers.clear();
        this.keyboard.keys.clear();
        this.touch.touches.clear();
        
        console.log('InputManager: Destroyed');
    }
}

export default InputManager;
