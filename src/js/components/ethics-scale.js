/**
 * Ethics Scale Component
 * A reusable component for displaying ethical dilemma scales
 */

class EthicsScale {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      min: options.min || 0,
      max: options.max || 100,
      value: options.value || 50,
      leftLabel: options.leftLabel || 'Less Ethical',
      rightLabel: options.rightLabel || 'More Ethical',
      centerLabel: options.centerLabel || 'Neutral',
      showValue: options.showValue !== false,
      onChange: options.onChange || (() => {}),
      disabled: options.disabled || false,
      ...options
    };

    this.value = this.options.value;
    this.element = null;
    this.slider = null;
    this.valueDisplay = null;
    
    this.initialize();
  }

  initialize() {
    this.createElement();
    this.attachEvents();
    this.updateDisplay();
  }

  createElement() {
    this.element = document.createElement('div');
    this.element.className = 'ethics-scale';
    this.element.innerHTML = `
      <div class="ethics-scale-header">
        <label class="ethics-scale-label">
          ${this.options.label || 'Ethical Rating'}
        </label>
        ${this.options.showValue ? `<span class="ethics-scale-value">${this.value}</span>` : ''}
      </div>
      
      <div class="ethics-scale-container">
        <div class="ethics-scale-track">
          <div class="ethics-scale-segments">
            <div class="segment segment-low" aria-label="Low ethical rating"></div>
            <div class="segment segment-medium" aria-label="Medium ethical rating"></div>
            <div class="segment segment-high" aria-label="High ethical rating"></div>
          </div>
          
          <input 
            type="range" 
            class="ethics-scale-slider"
            min="${this.options.min}"
            max="${this.options.max}"
            value="${this.value}"
            step="1"
            aria-label="Ethical rating scale"
            ${this.options.disabled ? 'disabled' : ''}
          />
          
          <div class="ethics-scale-thumb" style="left: ${this.getThumbPosition()}%"></div>
        </div>
        
        <div class="ethics-scale-labels">
          <span class="label-left">${this.options.leftLabel}</span>
          <span class="label-center">${this.options.centerLabel}</span>
          <span class="label-right">${this.options.rightLabel}</span>
        </div>
      </div>
      
      <div class="ethics-scale-description">
        <p>${this.getEthicalDescription()}</p>
      </div>
    `;

    this.slider = this.element.querySelector('.ethics-scale-slider');
    this.valueDisplay = this.element.querySelector('.ethics-scale-value');
    this.thumb = this.element.querySelector('.ethics-scale-thumb');
    this.description = this.element.querySelector('.ethics-scale-description p');

    this.container.appendChild(this.element);
  }

  attachEvents() {
    this.slider.addEventListener('input', (e) => {
      this.setValue(parseInt(e.target.value), true);
    });

    this.slider.addEventListener('change', (e) => {
      this.options.onChange(parseInt(e.target.value));
    });

    // Keyboard accessibility
    this.slider.addEventListener('keydown', (e) => {
      let newValue = this.value;
      
      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowDown':
          newValue = Math.max(this.options.min, this.value - 1);
          break;
        case 'ArrowRight':
        case 'ArrowUp':
          newValue = Math.min(this.options.max, this.value + 1);
          break;
        case 'Home':
          newValue = this.options.min;
          break;
        case 'End':
          newValue = this.options.max;
          break;
        case 'PageDown':
          newValue = Math.max(this.options.min, this.value - 10);
          break;
        case 'PageUp':
          newValue = Math.min(this.options.max, this.value + 10);
          break;
      }
      
      if (newValue !== this.value) {
        e.preventDefault();
        this.setValue(newValue, true);
        this.options.onChange(newValue);
      }
    });
  }

  setValue(value, updateSlider = false) {
    this.value = Math.max(this.options.min, Math.min(this.options.max, value));
    
    if (updateSlider && this.slider) {
      this.slider.value = this.value;
    }
    
    this.updateDisplay();
  }

  getValue() {
    return this.value;
  }

  updateDisplay() {
    if (this.valueDisplay) {
      this.valueDisplay.textContent = this.value;
    }
    
    if (this.thumb) {
      this.thumb.style.left = `${this.getThumbPosition()}%`;
      this.thumb.style.backgroundColor = this.getThumbColor();
    }
    
    if (this.description) {
      this.description.textContent = this.getEthicalDescription();
    }

    // Update segment highlights
    this.updateSegmentHighlights();
  }

  getThumbPosition() {
    const range = this.options.max - this.options.min;
    return ((this.value - this.options.min) / range) * 100;
  }

  getThumbColor() {
    const percentage = this.getThumbPosition() / 100;
    
    if (percentage < 0.33) {
      return '#e74c3c'; // Red for low ethical rating
    } else if (percentage < 0.67) {
      return '#f39c12'; // Orange for medium ethical rating
    } else {
      return '#27ae60'; // Green for high ethical rating
    }
  }

  getEthicalDescription() {
    const percentage = this.getThumbPosition() / 100;
    
    if (percentage < 0.2) {
      return 'This choice may have significant negative ethical implications.';
    } else if (percentage < 0.4) {
      return 'This choice has some ethical concerns that should be considered.';
    } else if (percentage < 0.6) {
      return 'This choice is ethically neutral with balanced considerations.';
    } else if (percentage < 0.8) {
      return 'This choice generally aligns with ethical principles.';
    } else {
      return 'This choice strongly upholds ethical values and principles.';
    }
  }

  updateSegmentHighlights() {
    const segments = this.element.querySelectorAll('.segment');
    const percentage = this.getThumbPosition() / 100;
    
    segments.forEach((segment, index) => {
      const segmentStart = index / 3;
      const segmentEnd = (index + 1) / 3;
      
      if (percentage >= segmentStart && percentage <= segmentEnd) {
        segment.classList.add('active');
      } else {
        segment.classList.remove('active');
      }
    });
  }

  disable() {
    this.options.disabled = true;
    this.slider.disabled = true;
    this.element.classList.add('disabled');
  }

  enable() {
    this.options.disabled = false;
    this.slider.disabled = false;
    this.element.classList.remove('disabled');
  }

  destroy() {
    if (this.element && this.element.parentNode) {
      this.element.parentNode.removeChild(this.element);
    }
  }
}

// Add CSS styles for the component
const ethicsScaleStyles = `
  .ethics-scale {
    margin: 20px 0;
    padding: 15px;
    border: 1px solid #ddd;
    border-radius: 8px;
    background: #f9f9f9;
  }

  .ethics-scale-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .ethics-scale-label {
    font-weight: 600;
    color: #333;
  }

  .ethics-scale-value {
    font-weight: 700;
    color: #007acc;
    font-size: 18px;
  }

  .ethics-scale-container {
    margin: 15px 0;
  }

  .ethics-scale-track {
    position: relative;
    height: 40px;
    margin: 10px 0;
  }

  .ethics-scale-segments {
    position: absolute;
    top: 10px;
    left: 0;
    right: 0;
    height: 10px;
    display: flex;
    border-radius: 5px;
    overflow: hidden;
  }

  .segment {
    flex: 1;
    transition: opacity 0.3s ease;
    opacity: 0.3;
  }

  .segment.active {
    opacity: 1;
  }

  .segment-low {
    background: #e74c3c;
  }

  .segment-medium {
    background: #f39c12;
  }

  .segment-high {
    background: #27ae60;
  }

  .ethics-scale-slider {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    height: 40px;
    background: transparent;
    -webkit-appearance: none;
    appearance: none;
    cursor: pointer;
  }

  .ethics-scale-slider::-webkit-slider-track {
    height: 10px;
    background: transparent;
    border-radius: 5px;
  }

  .ethics-scale-slider::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 0;
    height: 0;
    background: transparent;
  }

  .ethics-scale-slider::-moz-range-track {
    height: 10px;
    background: transparent;
    border-radius: 5px;
    border: none;
  }

  .ethics-scale-slider::-moz-range-thumb {
    width: 0;
    height: 0;
    background: transparent;
    border: none;
    border-radius: 0;
  }

  .ethics-scale-thumb {
    position: absolute;
    top: 5px;
    width: 20px;
    height: 20px;
    background: #007acc;
    border: 3px solid white;
    border-radius: 50%;
    box-shadow: 0 2px 4px rgba(0,0,0,0.2);
    transform: translateX(-50%);
    pointer-events: none;
    transition: all 0.2s ease;
  }

  .ethics-scale-labels {
    display: flex;
    justify-content: space-between;
    margin-top: 10px;
    font-size: 12px;
    color: #666;
  }

  .ethics-scale-description {
    margin-top: 15px;
    padding: 10px;
    background: white;
    border-radius: 4px;
    border-left: 4px solid #007acc;
  }

  .ethics-scale-description p {
    margin: 0;
    font-size: 14px;
    color: #555;
    line-height: 1.4;
  }

  .ethics-scale.disabled {
    opacity: 0.6;
    pointer-events: none;
  }

  .ethics-scale:focus-within {
    border-color: #007acc;
    box-shadow: 0 0 0 2px rgba(0, 122, 204, 0.2);
  }
`;

// Inject styles if not already present
if (typeof document !== 'undefined' && !document.getElementById('ethics-scale-styles')) {
  const styleSheet = document.createElement('style');
  styleSheet.id = 'ethics-scale-styles';
  styleSheet.textContent = ethicsScaleStyles;
  document.head.appendChild(styleSheet);
}

// Export for use in other modules
if (typeof window !== 'undefined') {
  window.EthicsScale = EthicsScale;
}

export default EthicsScale;
