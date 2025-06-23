/**
 * UI Components System
 * Provides reusable UI components for simulations
 */

class UIComponent {
    constructor(config = {}) {
        this.id = config.id || `ui-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
        this.position = config.position || { x: 0, y: 0 };
        this.size = config.size || { width: 100, height: 100 };
        this.visible = config.visible !== false;
        this.active = config.active !== false;
        this.zIndex = config.zIndex || 0;
        
        this.engine = null;
        this.element = null;
        this.styles = config.styles || {};
        
        this.events = new Map();
        
        this.createElement();
        this.applyStyles();
    }

    createElement() {
        this.element = document.createElement('div');
        this.element.className = `ui-component ${this.constructor.name.toLowerCase()}`;
        this.element.id = this.id;
        
        this.updateElementPosition();
    }

    applyStyles() {
        Object.assign(this.element.style, {
            position: 'absolute',
            boxSizing: 'border-box',
            userSelect: 'none',
            ...this.styles
        });
    }

    updateElementPosition() {
        if (this.element) {
            this.element.style.left = `${this.position.x}px`;
            this.element.style.top = `${this.position.y}px`;
            this.element.style.width = `${this.size.width}px`;
            this.element.style.height = `${this.size.height}px`;
            this.element.style.zIndex = this.zIndex;
        }
    }

    setEngine(engine) {
        this.engine = engine;
        if (engine && engine.container) {
            engine.container.appendChild(this.element);
        }
    }

    setPosition(x, y) {
        this.position.x = x;
        this.position.y = y;
        this.updateElementPosition();
    }

    setSize(width, height) {
        this.size.width = width;
        this.size.height = height;
        this.updateElementPosition();
    }

    show() {
        this.visible = true;
        if (this.element) {
            this.element.style.display = 'block';
        }
    }

    hide() {
        this.visible = false;
        if (this.element) {
            this.element.style.display = 'none';
        }
    }

    on(event, callback) {
        if (!this.events.has(event)) {
            this.events.set(event, []);
        }
        this.events.get(event).push(callback);
    }

    emit(event, data = {}) {
        if (this.events.has(event)) {
            this.events.get(event).forEach(callback => callback(data));
        }
    }

    update(deltaTime) {
        // Override in subclasses
    }

    render(renderer) {
        // UI components render to DOM, not canvas/svg
    }

    destroy() {
        if (this.element && this.element.parentNode) {
            this.element.parentNode.removeChild(this.element);
        }
        this.events.clear();
    }
}

class UIPanel extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            styles: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ccc',
                borderRadius: '8px',
                padding: '10px',
                boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                ...config.styles
            }
        });

        this.title = config.title || '';
        this.content = config.content || '';
        this.components = [];

        this.createContent();
    }

    createContent() {
        this.element.innerHTML = `
            ${this.title ? `<div class="panel-header">${this.title}</div>` : ''}
            <div class="panel-content">${this.content}</div>
            <div class="panel-controls"></div>
        `;

        // Style the header
        const header = this.element.querySelector('.panel-header');
        if (header) {
            Object.assign(header.style, {
                fontWeight: 'bold',
                marginBottom: '10px',
                paddingBottom: '5px',
                borderBottom: '1px solid #eee'
            });
        }

        // Style the content
        const content = this.element.querySelector('.panel-content');
        if (content) {
            Object.assign(content.style, {
                marginBottom: '10px',
                lineHeight: '1.4'
            });
        }
    }

    setContent(html) {
        const contentEl = this.element.querySelector('.panel-content');
        if (contentEl) {
            contentEl.innerHTML = html;
        }
    }

    addButton(text, onClick, styles = {}) {
        const button = document.createElement('button');
        button.textContent = text;
        button.className = 'panel-button';
        
        Object.assign(button.style, {
            padding: '5px 10px',
            margin: '2px',
            border: '1px solid #007cba',
            backgroundColor: '#007cba',
            color: 'white',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '12px',
            ...styles
        });

        button.addEventListener('click', onClick);
        button.addEventListener('mouseenter', () => {
            button.style.backgroundColor = '#005a87';
        });
        button.addEventListener('mouseleave', () => {
            button.style.backgroundColor = '#007cba';
        });

        const controls = this.element.querySelector('.panel-controls');
        if (controls) {
            controls.appendChild(button);
        }

        return button;
    }

    addSlider(label, min, max, value, onChange, styles = {}) {
        const container = document.createElement('div');
        container.className = 'slider-container';
        container.style.marginBottom = '10px';

        const labelEl = document.createElement('label');
        labelEl.textContent = label;
        labelEl.style.display = 'block';
        labelEl.style.marginBottom = '5px';
        labelEl.style.fontSize = '12px';

        const slider = document.createElement('input');
        slider.type = 'range';
        slider.min = min;
        slider.max = max;
        slider.value = value;
        slider.className = 'panel-slider';

        Object.assign(slider.style, {
            width: '100%',
            marginBottom: '5px',
            ...styles
        });

        const valueDisplay = document.createElement('span');
        valueDisplay.textContent = value;
        valueDisplay.style.fontSize = '12px';
        valueDisplay.style.color = '#666';

        slider.addEventListener('input', (e) => {
            const newValue = parseFloat(e.target.value);
            valueDisplay.textContent = newValue;
            onChange(newValue);
        });

        container.appendChild(labelEl);
        container.appendChild(slider);
        container.appendChild(valueDisplay);

        const controls = this.element.querySelector('.panel-controls');
        if (controls) {
            controls.appendChild(container);
        }

        return { container, slider, valueDisplay };
    }
}

class EthicsDisplay extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            styles: {
                backgroundColor: 'rgba(0, 0, 0, 0.8)',
                color: 'white',
                borderRadius: '8px',
                padding: '15px',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
                ...config.styles
            }
        });

        this.metrics = config.metrics || new Map();
        this.createMetersDisplay();
    }

    createMetersDisplay() {
        this.element.innerHTML = '<h3 style="margin: 0 0 10px 0; font-size: 14px;">Ethics Metrics</h3>';

        this.metrics.forEach((metric, name) => {
            const meterContainer = document.createElement('div');
            meterContainer.className = 'ethics-meter';
            meterContainer.style.marginBottom = '8px';

            const label = document.createElement('div');
            label.textContent = metric.label;
            label.style.fontSize = '11px';
            label.style.marginBottom = '3px';

            const meterBg = document.createElement('div');
            meterBg.style.cssText = `
                width: 100%;
                height: 12px;
                background: #333;
                border-radius: 6px;
                overflow: hidden;
                position: relative;
            `;

            const meterFill = document.createElement('div');
            meterFill.className = 'meter-fill';
            meterFill.style.cssText = `
                height: 100%;
                background: linear-gradient(90deg, #ff4444 0%, #ffaa00 50%, #00aa00 100%);
                width: ${metric.value}%;
                transition: width 0.3s ease;
                border-radius: 6px;
            `;

            const valueLabel = document.createElement('div');
            valueLabel.className = 'meter-value';
            valueLabel.textContent = metric.value;
            valueLabel.style.cssText = `
                position: absolute;
                right: 5px;
                top: 50%;
                transform: translateY(-50%);
                font-size: 10px;
                color: white;
                text-shadow: 1px 1px 1px rgba(0,0,0,0.7);
            `;

            meterBg.appendChild(meterFill);
            meterBg.appendChild(valueLabel);
            meterContainer.appendChild(label);
            meterContainer.appendChild(meterBg);

            this.element.appendChild(meterContainer);
        });
    }

    updateMetric(metricName, value) {
        const meterFill = this.element.querySelector(`.ethics-meter:nth-child(${
            Array.from(this.metrics.keys()).indexOf(metricName) + 2
        }) .meter-fill`);
        
        const valueLabel = this.element.querySelector(`.ethics-meter:nth-child(${
            Array.from(this.metrics.keys()).indexOf(metricName) + 2
        }) .meter-value`);

        if (meterFill) {
            meterFill.style.width = `${value}%`;
        }
        
        if (valueLabel) {
            valueLabel.textContent = Math.round(value);
        }

        // Update the metric value
        const metric = this.metrics.get(metricName);
        if (metric) {
            metric.value = value;
        }
    }
}

class FeedbackSystem extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            styles: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '10px',
                fontSize: '12px',
                fontFamily: 'Arial, sans-serif',
                overflow: 'hidden',
                ...config.styles
            }
        });

        this.feedbacks = [];
        this.maxFeedbacks = config.maxFeedbacks || 5;
        
        this.createFeedbackDisplay();
    }

    createFeedbackDisplay() {
        this.element.innerHTML = `
            <h3 style="margin: 0 0 10px 0; font-size: 14px;">Feedback</h3>
            <div class="feedback-list" style="height: calc(100% - 30px); overflow-y: auto;"></div>
        `;
    }

    addFeedback(text, type = 'neutral', duration = 5000) {
        const feedback = {
            id: Date.now(),
            text,
            type,
            timestamp: new Date(),
            duration
        };

        this.feedbacks.unshift(feedback);
        
        // Remove old feedbacks
        if (this.feedbacks.length > this.maxFeedbacks) {
            this.feedbacks = this.feedbacks.slice(0, this.maxFeedbacks);
        }

        this.renderFeedbacks();

        // Auto-remove after duration
        if (duration > 0) {
            setTimeout(() => {
                this.removeFeedback(feedback.id);
            }, duration);
        }
    }

    removeFeedback(id) {
        this.feedbacks = this.feedbacks.filter(f => f.id !== id);
        this.renderFeedbacks();
    }

    renderFeedbacks() {
        const list = this.element.querySelector('.feedback-list');
        if (!list) return;

        list.innerHTML = '';

        this.feedbacks.forEach(feedback => {
            const item = document.createElement('div');
            item.className = `feedback-item feedback-${feedback.type}`;
            
            const colors = {
                positive: '#4caf50',
                negative: '#f44336',
                neutral: '#2196f3',
                excellent: '#8bc34a',
                concerning: '#ff9800'
            };

            item.style.cssText = `
                padding: 8px;
                margin-bottom: 5px;
                border-left: 3px solid ${colors[feedback.type] || colors.neutral};
                background: rgba(0,0,0,0.05);
                border-radius: 3px;
                font-size: 11px;
                line-height: 1.3;
                animation: slideIn 0.3s ease;
            `;

            const time = feedback.timestamp.toLocaleTimeString();
            item.innerHTML = `
                <div style="color: #666; font-size: 10px; margin-bottom: 2px;">${time}</div>
                <div>${feedback.text}</div>
            `;

            list.appendChild(item);
        });
    }

    clear() {
        this.feedbacks = [];
        this.renderFeedbacks();
    }
}

class Button extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            styles: {
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                borderRadius: '6px',
                padding: '10px 20px',
                cursor: 'pointer',
                fontSize: '14px',
                fontFamily: 'Arial, sans-serif',
                textAlign: 'center',
                lineHeight: '1',
                transition: 'background-color 0.2s ease',
                ...config.styles
            }
        });

        this.text = config.text || 'Button';
        this.onClick = config.onClick || (() => {});
        
        this.setupButton();
    }

    setupButton() {
        this.element.textContent = this.text;
        this.element.style.display = 'flex';
        this.element.style.alignItems = 'center';
        this.element.style.justifyContent = 'center';

        this.element.addEventListener('click', this.onClick);
        this.element.addEventListener('mouseenter', () => {
            this.element.style.backgroundColor = '#005a87';
        });
        this.element.addEventListener('mouseleave', () => {
            this.element.style.backgroundColor = '#007cba';
        });
        this.element.addEventListener('mousedown', () => {
            this.element.style.transform = 'scale(0.98)';
        });
        this.element.addEventListener('mouseup', () => {
            this.element.style.transform = 'scale(1)';
        });
    }

    setText(text) {
        this.text = text;
        this.element.textContent = text;
    }

    setEnabled(enabled) {
        this.element.disabled = !enabled;
        this.element.style.opacity = enabled ? '1' : '0.6';
        this.element.style.cursor = enabled ? 'pointer' : 'not-allowed';
    }
}

class Slider extends UIComponent {
    constructor(config = {}) {
        super({
            ...config,
            size: config.size || { width: 200, height: 40 }
        });

        this.min = config.min || 0;
        this.max = config.max || 100;
        this.value = config.value || 50;
        this.step = config.step || 1;
        this.label = config.label || '';
        this.onChange = config.onChange || (() => {});

        this.createSlider();
    }

    createSlider() {
        this.element.innerHTML = `
            ${this.label ? `<label style="display: block; margin-bottom: 5px; font-size: 12px;">${this.label}</label>` : ''}
            <div style="position: relative; height: 20px;">
                <input type="range" 
                       min="${this.min}" 
                       max="${this.max}" 
                       value="${this.value}" 
                       step="${this.step}"
                       style="width: 100%; height: 100%;">
                <div class="slider-value" style="position: absolute; right: 0; top: 22px; font-size: 11px; color: #666;">
                    ${this.value}
                </div>
            </div>
        `;

        const input = this.element.querySelector('input[type="range"]');
        const valueDisplay = this.element.querySelector('.slider-value');

        input.addEventListener('input', (e) => {
            this.value = parseFloat(e.target.value);
            valueDisplay.textContent = this.value;
            this.onChange(this.value);
        });
    }

    setValue(value) {
        this.value = Math.max(this.min, Math.min(this.max, value));
        const input = this.element.querySelector('input[type="range"]');
        const valueDisplay = this.element.querySelector('.slider-value');
        
        if (input) input.value = this.value;
        if (valueDisplay) valueDisplay.textContent = this.value;
    }
}

// Export for ES6 modules
export {
    UIComponent,
    UIPanel,
    EthicsDisplay,
    FeedbackSystem,
    Button,
    Slider
};
