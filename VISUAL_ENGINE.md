# Visual Engine System - SimulateAI

A modular, high-performance, and accessible visual engine for interactive simulations. The Visual Engine provides unified rendering, input handling, animation, and accessibility across multiple rendering backends.

## Features

### 🎨 Multi-Renderer Support
- **Canvas Renderer**: High-performance 2D graphics with hardware acceleration
- **SVG Renderer**: Vector graphics with DOM integration and CSS styling
- **WebGL Renderer**: Hardware-accelerated graphics for complex scenes
- **Auto-Detection**: Automatically selects the best renderer based on device capabilities

### 🎮 Advanced Input Handling
- Mouse, keyboard, touch, and gesture support
- Unified event system with consistent API across all input types
- Touch gestures: tap, pan, pinch, with customizable thresholds
- Keyboard navigation with accessibility considerations

### ✨ Animation System
- Smooth interpolation with multiple easing functions
- Timeline-based animation management
- Object property tweening (position, scale, color, etc.)
- Performance-optimized batching and frame limiting
- Preset animations: fade, slide, scale, shake

### ♿ Accessibility Features
- WCAG 2.1 compliant keyboard navigation
- Screen reader support with live regions
- High contrast and large text modes
- Focus management and visual indicators
- Semantic markup and ARIA attributes

### 📊 Performance Monitoring
- Real-time FPS and frame time tracking
- Object count and memory usage monitoring
- Debug panels with detailed performance metrics
- Performance optimization hints and warnings

## Quick Start

### Basic Setup

```javascript
import VisualEngine from './src/js/core/visual-engine.js';
import { Button, Slider, Meter } from './src/js/objects/interactive-objects.js';

// Create engine instance
const engine = new VisualEngine(document.getElementById('canvas-container'), {
    renderMode: 'auto',  // 'canvas', 'svg', 'webgl', or 'auto'
    accessibility: true,
    debug: false,
    width: 800,
    height: 600
});

// Add interactive objects
const button = new Button({
    x: 50,
    y: 50,
    text: 'Click Me!',
    onClick: () => console.log('Button clicked!')
});

const slider = new Slider({
    x: 50,
    y: 100,
    min: 0,
    max: 100,
    value: 50,
    onChange: (value) => console.log('Slider value:', value)
});

engine.addObject(button);
engine.addObject(slider);

// Start the engine
engine.start();
```

### Custom Objects

```javascript
// Create a custom interactive object
class CustomObject extends InteractiveObject {
    constructor(options) {
        super(options);
        this.type = 'custom';
        this.customProperty = options.customProperty || 0;
    }
    
    update(deltaTime) {
        // Update object state
        this.customProperty += deltaTime * 0.001;
    }
    
    render(renderer) {
        // Custom rendering logic
        if (renderer.type === 'canvas') {
            renderer.drawCircle(this.x, this.y, 25, {
                fill: `hsl(${this.customProperty * 360}, 70%, 60%)`
            });
        }
    }
    
    handleInput(eventType, eventData) {
        // Custom input handling
        if (eventType === 'mousedown' && this.containsPoint(eventData.x, eventData.y)) {
            this.customProperty = 0; // Reset animation
            return true; // Consume input
        }
        return false;
    }
}
```

### Animations

```javascript
// Simple property animation
engine.animationManager.to(object, { x: 200, y: 150 }, 1000, {
    easing: 'easeInOut',
    onComplete: () => console.log('Animation complete!')
});

// Timeline animations
const timeline = engine.animationManager.createTimeline();
engine.animationManager.addToTimeline(timeline, object1, { x: 100 }, 500, 0);
engine.animationManager.addToTimeline(timeline, object2, { y: 200 }, 300, 200);
engine.animationManager.playTimeline(timeline);

// Preset animations
engine.animationManager.fadeIn(object, 500);
engine.animationManager.shake(object, 10, 1000);
engine.animationManager.scale(object, 1.2, 300);
```

## Architecture

### Core Components

1. **VisualEngine** - Main engine class that coordinates all subsystems
2. **Scene** - Container for all visual objects with spatial management
3. **Renderers** - Backend-specific rendering implementations
4. **InputManager** - Unified input handling across all input types
5. **AnimationManager** - Timeline and property animation system
6. **AccessibilityManager** - WCAG-compliant accessibility features

### Object System

- **InteractiveObject** - Base class for all interactive elements
- **Button** - Clickable button with hover and pressed states
- **Slider** - Draggable slider with keyboard navigation
- **Meter** - Progress/value display meter
- **Label** - Text display element

### Rendering Pipeline

1. **Update Phase** - Update object properties and animations
2. **Input Phase** - Process input events and interactions
3. **Render Phase** - Render objects using selected renderer
4. **Present Phase** - Display frame and update performance stats

## Demo and Testing

### Running the Demo

1. Start the development server:
   ```bash
   npm run dev
   ```

2. Open `demo.html` in your browser for a comprehensive demonstration

3. Or view the integrated hero demo on the main `index.html` page

### Demo Features

- **Renderer Switching** - Test all rendering backends
- **Interactive Controls** - Buttons, sliders, and meters
- **Animation Showcase** - Various animation types and timelines
- **Accessibility Testing** - Keyboard navigation and screen reader support
- **Performance Monitoring** - Real-time performance statistics
- **Stress Testing** - Multiple animated objects for performance testing

### Browser Support

- **Modern Browsers**: Chrome 80+, Firefox 75+, Safari 13+, Edge 80+
- **WebGL**: Automatic fallback to Canvas if WebGL is not supported
- **Mobile**: Full touch and gesture support on iOS and Android
- **Accessibility**: Screen reader support on all platforms

## Configuration Options

### Engine Options

```javascript
const options = {
    renderMode: 'auto',        // Renderer selection
    accessibility: true,       // Enable accessibility features
    highPerformance: false,    // Enable performance optimizations
    maxFPS: 60,               // Frame rate limit
    debug: false,             // Show debug information
    width: 800,               // Canvas width
    height: 600               // Canvas height
};
```

### Object Options

```javascript
const objectOptions = {
    x: 0, y: 0,               // Position
    width: 100, height: 50,   // Dimensions
    visible: true,            // Visibility
    interactive: true,        // Input handling
    zIndex: 0,               // Rendering order
    alpha: 1,                // Transparency
    fill: '#ffffff',         // Fill color
    stroke: '#000000',       // Border color
    accessibilityConfig: {   // Accessibility settings
        role: 'button',
        description: 'Custom button',
        keyboardActions: { 'Enter': 'click' }
    }
};
```

## Performance Best Practices

1. **Object Pooling** - Reuse objects instead of creating new ones
2. **Batching** - Group similar render operations
3. **Culling** - Hide objects outside the viewport
4. **Animation Limits** - Limit concurrent animations for smooth performance
5. **Renderer Selection** - Choose appropriate renderer for your use case

## Accessibility Guidelines

The Visual Engine follows WCAG 2.1 AA guidelines:

- **Keyboard Navigation** - All interactive elements are keyboard accessible
- **Screen Reader Support** - Proper ARIA labels and live regions
- **High Contrast** - Support for high contrast display modes
- **Focus Management** - Clear focus indicators and logical tab order
- **Alternative Input** - Support for various assistive technologies

## Contributing

When extending the Visual Engine:

1. Follow the existing architecture patterns
2. Add accessibility configuration to new objects
3. Include proper JSDoc documentation
4. Test across all supported renderers
5. Verify accessibility compliance

## Future Enhancements

- **3D Rendering** - WebGL-based 3D object support
- **Physics Integration** - Basic physics simulation
- **Particle Systems** - Efficient particle effect rendering
- **Audio Integration** - Spatial audio and sound effects
- **Mobile Optimizations** - Platform-specific performance improvements

---

The Visual Engine provides a solid foundation for building accessible, performant interactive simulations while maintaining flexibility and ease of use.
