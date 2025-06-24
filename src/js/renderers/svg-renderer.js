/**
 * SVG Renderer for the SimulationEngine
 * Handles SVG-based graphics and animations
 */

class SVGRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      preserveAspectRatio: options.preserveAspectRatio || 'xMidYMid meet',
      ...options
    };

    this.svg = null;
    this.defs = null;
    this.mainGroup = null;
    this.layers = new Map();
    this.animations = new Set();
    
    this.initialize();
  }

  initialize() {
    // Create SVG element
    this.svg = this.createSVGElement('svg', {
      width: '100%',
      height: '100%',
      viewBox: `0 0 ${this.options.width} ${this.options.height}`,
      preserveAspectRatio: this.options.preserveAspectRatio,
      role: 'img',
      'aria-label': 'Simulation graphics'
    });

    // Create defs for reusable elements
    this.defs = this.createSVGElement('defs');
    this.svg.appendChild(this.defs);

    // Create main group for all content
    this.mainGroup = this.createSVGElement('g', {
      class: 'main-group'
    });
    this.svg.appendChild(this.mainGroup);

    // Add default styles
    this.addStyles();

    // Append to container
    this.container.appendChild(this.svg);
  }

  createSVGElement(tagName, attributes = {}) {
    const element = document.createElementNS('http://www.w3.org/2000/svg', tagName);
    
    Object.entries(attributes).forEach(([key, value]) => {
      element.setAttribute(key, value);
    });

    return element;
  }

  addStyles() {
    const style = this.createSVGElement('style');
    style.textContent = `
      .svg-renderer {
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', system-ui, sans-serif;
      }
      
      .clickable {
        cursor: pointer;
      }
      
      .clickable:hover {
        opacity: 0.8;
      }
      
      .animated {
        transition: all 0.3s ease;
      }
      
      .text-element {
        user-select: none;
        pointer-events: none;
      }
      
      .interactive {
        pointer-events: all;
      }
    `;
    
    this.defs.appendChild(style);
  }

  createLayer(name, zIndex = 0) {
    const layer = this.createSVGElement('g', {
      class: `layer layer-${name}`,
      'data-layer': name,
      style: `z-index: ${zIndex}`
    });

    this.mainGroup.appendChild(layer);
    this.layers.set(name, layer);
    
    return layer;
  }

  getLayer(name) {
    return this.layers.get(name) || this.createLayer(name);
  }

  // Basic shape methods
  createRect(x, y, width, height, options = {}) {
    return this.createSVGElement('rect', {
      x,
      y,
      width,
      height,
      fill: options.fill || '#333',
      stroke: options.stroke || 'none',
      'stroke-width': options.strokeWidth || 0,
      rx: options.borderRadius || 0,
      class: options.className || '',
      ...options.attributes
    });
  }

  createCircle(cx, cy, radius, options = {}) {
    return this.createSVGElement('circle', {
      cx,
      cy,
      r: radius,
      fill: options.fill || '#333',
      stroke: options.stroke || 'none',
      'stroke-width': options.strokeWidth || 0,
      class: options.className || '',
      ...options.attributes
    });
  }

  createLine(x1, y1, x2, y2, options = {}) {
    return this.createSVGElement('line', {
      x1,
      y1,
      x2,
      y2,
      stroke: options.stroke || '#333',
      'stroke-width': options.strokeWidth || 1,
      'stroke-linecap': options.linecap || 'round',
      class: options.className || '',
      ...options.attributes
    });
  }

  createPath(pathData, options = {}) {
    return this.createSVGElement('path', {
      d: pathData,
      fill: options.fill || 'none',
      stroke: options.stroke || '#333',
      'stroke-width': options.strokeWidth || 1,
      class: options.className || '',
      ...options.attributes
    });
  }

  createText(x, y, text, options = {}) {
    const textElement = this.createSVGElement('text', {
      x,
      y,
      'text-anchor': options.textAnchor || 'start',
      'dominant-baseline': options.dominantBaseline || 'middle',
      'font-size': options.fontSize || '14px',
      'font-family': options.fontFamily || 'inherit',
      'font-weight': options.fontWeight || 'normal',
      fill: options.fill || '#333',
      class: `text-element ${options.className || ''}`,
      ...options.attributes
    });

    textElement.textContent = text;
    return textElement;
  }

  createGroup(options = {}) {
    return this.createSVGElement('g', {
      class: options.className || '',
      transform: options.transform || '',
      ...options.attributes
    });
  }

  // Interactive elements
  createButton(x, y, width, height, text, onClick, options = {}) {
    const button = this.createGroup({
      className: 'svg-button clickable interactive',
      transform: `translate(${x}, ${y})`
    });

    const rect = this.createRect(0, 0, width, height, {
      fill: options.backgroundColor || '#007acc',
      stroke: options.borderColor || '#005a9e',
      strokeWidth: 1,
      borderRadius: options.borderRadius || 4
    });

    const textElement = this.createText(width / 2, height / 2, text, {
      textAnchor: 'middle',
      dominantBaseline: 'middle',
      fill: options.textColor || 'white',
      fontSize: options.fontSize || '14px',
      fontWeight: options.fontWeight || '500'
    });

    button.appendChild(rect);
    button.appendChild(textElement);

    // Add click handler
    button.addEventListener('click', onClick);
    button.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        onClick(e);
      }
    });

    // Make focusable
    button.setAttribute('tabindex', '0');
    button.setAttribute('role', 'button');
    button.setAttribute('aria-label', options.ariaLabel || text);

    return button;
  }

  // Animation methods
  animate(element, properties, duration = 1000, easing = 'ease') {
    const animation = {
      element,
      properties,
      duration,
      easing,
      startTime: performance.now(),
      startValues: {},
      id: Math.random().toString(36).substr(2, 9)
    };

    // Store starting values
    Object.keys(properties).forEach(prop => {
      if (prop === 'transform') {
        animation.startValues[prop] = element.getAttribute('transform') || '';
      } else {
        animation.startValues[prop] = parseFloat(element.getAttribute(prop)) || 0;
      }
    });

    this.animations.add(animation);
    this.runAnimation(animation);

    return animation.id;
  }

  runAnimation(animation) {
    const animate = (currentTime) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      // Apply easing
      const easedProgress = this.applyEasing(progress, animation.easing);

      // Update element properties
      Object.entries(animation.properties).forEach(([prop, endValue]) => {
        const startValue = animation.startValues[prop];
        
        if (prop === 'transform') {
          element.setAttribute(prop, endValue);
        } else {
          const currentValue = startValue + (endValue - startValue) * easedProgress;
          animation.element.setAttribute(prop, currentValue);
        }
      });

      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animations.delete(animation);
      }
    };

    requestAnimationFrame(animate);
  }

  applyEasing(t, easing) {
    switch (easing) {
      case 'linear':
        return t;
      case 'ease-in':
        return t * t;
      case 'ease-out':
        return t * (2 - t);
      case 'ease-in-out':
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
      default:
        return t;
    }
  }

  stopAnimation(animationId) {
    for (const animation of this.animations) {
      if (animation.id === animationId) {
        this.animations.delete(animation);
        break;
      }
    }
  }

  // Required methods for Visual Engine integration
  get type() {
    return 'svg';
  }

  getElement() {
    return this.svg;
  }

  render(scene) {
    this.clear();
    if (scene && scene.render) {
      scene.render(this);
    }
  }

  renderObject(object) {
    if (!object || object.visible === false) return;
    
    // Create SVG group for this object
    const group = this.createSVGElement('g', {
      class: 'scene-object'
    });
    
    // Apply transformations
    const transforms = [];
    
    if (object.x || object.y) {
      transforms.push(`translate(${object.x || 0}, ${object.y || 0})`);
    }
    
    if (object.rotation) {
      transforms.push(`rotate(${object.rotation * 180 / Math.PI})`);
    }
    
    if (object.scale && object.scale !== 1) {
      transforms.push(`scale(${object.scale})`);
    }
    
    if (transforms.length > 0) {
      group.setAttribute('transform', transforms.join(' '));
    }
    
    if (object.alpha !== undefined) {
      group.setAttribute('opacity', object.alpha);
    }
    
    // Render based on object type
    let element;
    if (object.render) {
      // Let object render itself
      object.render(this, group);
    } else if (object.type) {
      element = this.renderByType(object);
    }
    
    if (element) {
      group.appendChild(element);
    }
    
    this.mainGroup.appendChild(group);
  }

  renderByType(object) {
    switch (object.type) {
      case 'rect':
        return this.createSVGElement('rect', {
          width: object.width || 50,
          height: object.height || 50,
          fill: object.fill || 'transparent',
          stroke: object.stroke || 'none',
          'stroke-width': object.strokeWidth || 1
        });
        
      case 'circle':
        return this.createSVGElement('circle', {
          r: object.radius || 25,
          fill: object.fill || 'transparent',
          stroke: object.stroke || 'none',
          'stroke-width': object.strokeWidth || 1
        });
        
      case 'text':
        const textElement = this.createSVGElement('text', {
          'font-family': object.font || 'Arial',
          'font-size': object.fontSize || 14,
          fill: object.fill || '#000000',
          'text-anchor': object.align || 'start'
        });
        textElement.textContent = object.text || '';
        return textElement;
        
      default:
        // Draw a simple placeholder
        return this.createSVGElement('rect', {
          x: -5,
          y: -5,
          width: 10,
          height: 10,
          fill: '#ff0000'
        });
    }
  }

  resize() {
    if (this.container && this.svg) {
      const rect = this.container.getBoundingClientRect();
      this.options.width = rect.width;
      this.options.height = rect.height;
      
      this.svg.setAttribute('viewBox', `0 0 ${this.options.width} ${this.options.height}`);
    }
  }

  destroy() {
    if (this.svg && this.svg.parentNode) {
      this.svg.parentNode.removeChild(this.svg);
    }
    this.animations.clear();
  }

  // Utility methods
  addToLayer(layerName, element) {
    const layer = this.getLayer(layerName);
    layer.appendChild(element);
    return element;
  }

  clear(layerName = null) {
    if (layerName) {
      const layer = this.getLayer(layerName);
      layer.innerHTML = '';
    } else {
      this.mainGroup.innerHTML = '';
      this.layers.clear();
    }
  }

  setViewBox(x, y, width, height) {
    this.svg.setAttribute('viewBox', `${x} ${y} ${width} ${height}`);
  }

  exportSVG() {
    return new XMLSerializer().serializeToString(this.svg);
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.SVGRenderer = SVGRenderer;
}

export default SVGRenderer;
