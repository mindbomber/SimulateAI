/**
 * Canvas Renderer for the SimulationEngine
 * Handles Canvas-based graphics and animations
 */

class CanvasRenderer {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      width: options.width || 800,
      height: options.height || 600,
      pixelRatio: options.pixelRatio || window.devicePixelRatio || 1,
      alpha: options.alpha !== false,
      antialias: options.antialias !== false,
      ...options
    };

    this.canvas = null;
    this.ctx = null;
    this.layers = new Map();
    this.animations = new Set();
    this.isRendering = false;
    
    this.initialize();
  }

  initialize() {
    // Create canvas element
    this.canvas = document.createElement('canvas');
    this.canvas.style.width = '100%';
    this.canvas.style.height = '100%';
    this.canvas.style.display = 'block';
    
    // Set canvas size with device pixel ratio
    this.canvas.width = this.options.width * this.options.pixelRatio;
    this.canvas.height = this.options.height * this.options.pixelRatio;
    
    // Get 2D context
    this.ctx = this.canvas.getContext('2d', {
      alpha: this.options.alpha,
      antialias: this.options.antialias
    });
    
    // Scale context for high-DPI displays
    this.ctx.scale(this.options.pixelRatio, this.options.pixelRatio);
    
    // Set default styles
    this.ctx.font = '14px -apple-system, BlinkMacSystemFont, "Segoe UI", system-ui, sans-serif';
    this.ctx.textBaseline = 'middle';
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';

    // Add accessibility attributes
    this.canvas.setAttribute('role', 'img');
    this.canvas.setAttribute('aria-label', 'Simulation graphics');
    
    // Append to container
    this.container.appendChild(this.canvas);
  }

  // Basic drawing methods
  clear(x = 0, y = 0, width = this.options.width, height = this.options.height) {
    this.ctx.clearRect(x, y, width, height);
  }

  drawRect(x, y, width, height, options = {}) {
    this.ctx.save();
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      if (options.borderRadius) {
        this.drawRoundedRect(x, y, width, height, options.borderRadius);
        this.ctx.fill();
      } else {
        this.ctx.fillRect(x, y, width, height);
      }
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.strokeWidth || 1;
      if (options.borderRadius) {
        this.drawRoundedRect(x, y, width, height, options.borderRadius);
        this.ctx.stroke();
      } else {
        this.ctx.strokeRect(x, y, width, height);
      }
    }
    
    this.ctx.restore();
  }

  drawRoundedRect(x, y, width, height, radius) {
    this.ctx.beginPath();
    this.ctx.moveTo(x + radius, y);
    this.ctx.lineTo(x + width - radius, y);
    this.ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    this.ctx.lineTo(x + width, y + height - radius);
    this.ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    this.ctx.lineTo(x + radius, y + height);
    this.ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    this.ctx.lineTo(x, y + radius);
    this.ctx.quadraticCurveTo(x, y, x + radius, y);
    this.ctx.closePath();
  }

  drawCircle(x, y, radius, options = {}) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.arc(x, y, radius, 0, 2 * Math.PI);
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawLine(x1, y1, x2, y2, options = {}) {
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(x1, y1);
    this.ctx.lineTo(x2, y2);
    
    this.ctx.strokeStyle = options.stroke || '#333';
    this.ctx.lineWidth = options.strokeWidth || 1;
    
    if (options.lineCap) {
      this.ctx.lineCap = options.lineCap;
    }
    
    this.ctx.stroke();
    this.ctx.restore();
  }

  drawPath(points, options = {}) {
    if (points.length < 2) return;
    
    this.ctx.save();
    this.ctx.beginPath();
    this.ctx.moveTo(points[0].x, points[0].y);
    
    for (let i = 1; i < points.length; i++) {
      this.ctx.lineTo(points[i].x, points[i].y);
    }
    
    if (options.closePath) {
      this.ctx.closePath();
    }
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fill();
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  drawText(text, x, y, options = {}) {
    this.ctx.save();
    
    // Set font properties
    this.ctx.font = `${options.fontWeight || 'normal'} ${options.fontSize || '14px'} ${options.fontFamily || 'inherit'}`;
    this.ctx.textAlign = options.textAlign || 'left';
    this.ctx.textBaseline = options.textBaseline || 'middle';
    
    if (options.fill) {
      this.ctx.fillStyle = options.fill;
      this.ctx.fillText(text, x, y);
    }
    
    if (options.stroke) {
      this.ctx.strokeStyle = options.stroke;
      this.ctx.lineWidth = options.strokeWidth || 1;
      this.ctx.strokeText(text, x, y);
    }
    
    this.ctx.restore();
  }

  // Advanced drawing methods
  drawButton(x, y, width, height, text, options = {}) {
    // Draw button background
    this.drawRect(x, y, width, height, {
      fill: options.backgroundColor || '#007acc',
      stroke: options.borderColor || '#005a9e',
      strokeWidth: 1,
      borderRadius: options.borderRadius || 4
    });
    
    // Draw button text
    this.drawText(text, x + width / 2, y + height / 2, {
      fill: options.textColor || 'white',
      fontSize: options.fontSize || '14px',
      fontWeight: options.fontWeight || '500',
      textAlign: 'center',
      textBaseline: 'middle'
    });
  }

  drawChart(data, x, y, width, height, options = {}) {
    const chartType = options.type || 'bar';
    
    this.ctx.save();
    
    // Draw chart background
    if (options.backgroundColor) {
      this.drawRect(x, y, width, height, {
        fill: options.backgroundColor
      });
    }
    
    // Draw chart border
    if (options.border) {
      this.drawRect(x, y, width, height, {
        stroke: options.borderColor || '#ccc',
        strokeWidth: 1
      });
    }
    
    switch (chartType) {
      case 'bar':
        this.drawBarChart(data, x, y, width, height, options);
        break;
      case 'line':
        this.drawLineChart(data, x, y, width, height, options);
        break;
      case 'pie':
        this.drawPieChart(data, x, y, Math.min(width, height), options);
        break;
    }
    
    this.ctx.restore();
  }

  drawBarChart(data, x, y, width, height, options) {
    const maxValue = Math.max(...data.map(d => d.value));
    const barWidth = width / data.length;
    const padding = barWidth * 0.1;
    
    data.forEach((item, index) => {
      const barHeight = (item.value / maxValue) * height * 0.8;
      const barX = x + index * barWidth + padding;
      const barY = y + height - barHeight - 20;
      
      this.drawRect(barX, barY, barWidth - padding * 2, barHeight, {
        fill: item.color || options.barColor || '#007acc'
      });
      
      // Draw label
      if (item.label) {
        this.drawText(item.label, barX + (barWidth - padding * 2) / 2, y + height - 10, {
          fill: options.labelColor || '#333',
          fontSize: '12px',
          textAlign: 'center'
        });
      }
    });
  }

  drawLineChart(data, x, y, width, height, options) {
    if (data.length < 2) return;
    
    const maxValue = Math.max(...data.map(d => d.value));
    const minValue = Math.min(...data.map(d => d.value));
    const range = maxValue - minValue;
    
    const points = data.map((item, index) => ({
      x: x + (index / (data.length - 1)) * width,
      y: y + height - ((item.value - minValue) / range) * height * 0.8 - 20
    }));
    
    this.drawPath(points, {
      stroke: options.lineColor || '#007acc',
      strokeWidth: options.lineWidth || 2
    });
    
    // Draw points
    points.forEach(point => {
      this.drawCircle(point.x, point.y, 3, {
        fill: options.pointColor || '#007acc'
      });
    });
  }

  drawPieChart(data, x, y, size, options) {
    const centerX = x + size / 2;
    const centerY = y + size / 2;
    const radius = size / 2 * 0.8;
    
    const total = data.reduce((sum, item) => sum + item.value, 0);
    let currentAngle = -Math.PI / 2; // Start at top
    
    data.forEach(item => {
      const sliceAngle = (item.value / total) * 2 * Math.PI;
      
      this.ctx.save();
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.arc(centerX, centerY, radius, currentAngle, currentAngle + sliceAngle);
      this.ctx.closePath();
      
      this.ctx.fillStyle = item.color || '#007acc';
      this.ctx.fill();
      
      this.ctx.strokeStyle = options.borderColor || 'white';
      this.ctx.lineWidth = 2;
      this.ctx.stroke();
      
      this.ctx.restore();
      
      currentAngle += sliceAngle;
    });
  }

  // Animation methods
  animate(callback, duration = 1000) {
    const animation = {
      callback,
      duration,
      startTime: performance.now(),
      id: Math.random().toString(36).substr(2, 9)
    };
    
    this.animations.add(animation);
    this.runAnimation(animation);
    
    return animation.id;
  }

  runAnimation(animation) {
    const animate = (currentTime) => {
      const elapsed = currentTime - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      
      animation.callback(progress);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      } else {
        this.animations.delete(animation);
      }
    };
    
    requestAnimationFrame(animate);
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
    return 'canvas';
  }

  getElement() {
    return this.canvas;
  }

  render(scene) {
    this.clear();
    if (scene && scene.render) {
      scene.render(this);
    }
  }

  renderObject(object) {
    if (!object || object.visible === false) return;
    
    this.ctx.save();
    
    // Apply transformations
    if (object.x || object.y) {
      this.ctx.translate(object.x || 0, object.y || 0);
    }
    
    if (object.rotation) {
      this.ctx.rotate(object.rotation);
    }
    
    if (object.scale && object.scale !== 1) {
      this.ctx.scale(object.scale, object.scale);
    }
    
    if (object.alpha !== undefined) {
      this.ctx.globalAlpha = object.alpha;
    }
    
    // Render based on object type
    if (object.render) {
      object.render(this);
    } else if (object.type) {
      this.renderByType(object);
    }
    
    this.ctx.restore();
  }

  renderByType(object) {
    switch (object.type) {
      case 'rect':
        this.drawRect(0, 0, object.width || 50, object.height || 50, {
          fill: object.fill,
          stroke: object.stroke,
          strokeWidth: object.strokeWidth
        });
        break;
        
      case 'circle':
        this.drawCircle(0, 0, object.radius || 25, {
          fill: object.fill,
          stroke: object.stroke,
          strokeWidth: object.strokeWidth
        });
        break;
        
      case 'text':
        this.drawText(object.text || '', 0, 0, {
          font: object.font,
          fill: object.fill,
          align: object.align
        });
        break;
        
      default:
        // Draw a simple placeholder
        this.drawRect(-5, -5, 10, 10, { fill: '#ff0000' });
    }
  }

  resize() {
    if (this.container) {
      const rect = this.container.getBoundingClientRect();
      this.options.width = rect.width;
      this.options.height = rect.height;
      
      this.canvas.width = this.options.width * this.options.pixelRatio;
      this.canvas.height = this.options.height * this.options.pixelRatio;
      this.ctx.scale(this.options.pixelRatio, this.options.pixelRatio);
    }
  }

  destroy() {
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
    this.animations.clear();
  }

  // Utility methods
  getImageData(x = 0, y = 0, width = this.options.width, height = this.options.height) {
    return this.ctx.getImageData(x, y, width, height);
  }

  putImageData(imageData, x = 0, y = 0) {
    this.ctx.putImageData(imageData, x, y);
  }

  toDataURL(type = 'image/png', quality = 0.92) {
    return this.canvas.toDataURL(type, quality);
  }

  resize(width, height) {
    this.options.width = width;
    this.options.height = height;
    
    this.canvas.width = width * this.options.pixelRatio;
    this.canvas.height = height * this.options.pixelRatio;
    
    this.ctx.scale(this.options.pixelRatio, this.options.pixelRatio);
  }

  destroy() {
    // Stop all animations
    this.animations.clear();
    
    // Remove from DOM
    if (this.canvas && this.canvas.parentNode) {
      this.canvas.parentNode.removeChild(this.canvas);
    }
  }
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.CanvasRenderer = CanvasRenderer;
}

export default CanvasRenderer;
