/**
 * Advanced UI Components - Specialized interactive components for SimulateAI
 * Addresses gaps in the current Interactive Object System
 * Modal dialogs, navigation, data visualization, forms, etc.
 */

import { BaseObject } from './enhanced-objects.js';

// ===== MODAL DIALOG SYSTEM =====
export class ModalDialog extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 400,
            height: options.height || 300,
            ariaRole: 'dialog',
            modal: true
        });
        
        this.title = options.title || 'Dialog';
        this.content = options.content || '';
        this.buttons = options.buttons || [{ text: 'OK', action: 'close' }];
        this.closable = options.closable !== false;
        this.backdrop = options.backdrop !== false;
        this.animation = options.animation || 'fade';
        
        // State
        this.isOpen = false;
        this.previousFocus = null;
        
        // Modal management
        this.zIndex = 1000;
        this.backdropElement = null;
        this.headerElement = null;
        this.bodyElement = null;
        this.footerElement = null;
        
        this.setupModal();
    }

    setupModal() {
        // Create backdrop
        if (this.backdrop) {
            this.backdropElement = document.createElement('div');
            this.backdropElement.className = 'modal-backdrop';
            this.backdropElement.style.cssText = `
                position: fixed;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                background: rgba(0, 0, 0, 0.5);
                z-index: ${this.zIndex - 1};
                opacity: 0;
                transition: opacity 0.3s ease;
            `;
            
            this.backdropElement.addEventListener('click', () => {
                if (this.closable) this.close();
            });
        }
        
        // Setup accessibility
        this.ariaLabel = this.title;
        this.setAttribute('aria-labelledby', `modal-title-${this.id}`);
        this.setAttribute('aria-describedby', `modal-body-${this.id}`);
    }

    open() {
        if (this.isOpen) return;
        
        // Store previously focused element
        this.previousFocus = document.activeElement;
        
        // Create modal structure
        this.createModalElements();
        
        // Add to DOM
        if (this.backdrop) {
            document.body.appendChild(this.backdropElement);
        }
        
        // Animate in
        this.isOpen = true;
        this.animateIn();
        
        // Focus management
        this.trapFocus();
        
        // Emit event
        this.emit('open');
    }

    close() {
        if (!this.isOpen) return;
        
        this.animateOut(() => {
            // Remove from DOM
            if (this.backdropElement?.parentNode) {
                this.backdropElement.parentNode.removeChild(this.backdropElement);
            }
            
            // Restore focus
            if (this.previousFocus) {
                this.previousFocus.focus();
            }
            
            this.isOpen = false;
            this.emit('close');
        });
    }

    createModalElements() {
        // Header
        this.headerElement = document.createElement('div');
        this.headerElement.className = 'modal-header';
        this.headerElement.innerHTML = `
            <h2 id="modal-title-${this.id}" class="modal-title">${this.title}</h2>
            ${this.closable ? '<button class="modal-close" aria-label="Close">&times;</button>' : ''}
        `;
        
        // Body
        this.bodyElement = document.createElement('div');
        this.bodyElement.className = 'modal-body';
        this.bodyElement.id = `modal-body-${this.id}`;
        this.bodyElement.innerHTML = this.content;
        
        // Footer
        this.footerElement = document.createElement('div');
        this.footerElement.className = 'modal-footer';
        this.createButtons();
        
        // Setup event handlers
        if (this.closable) {
            this.headerElement.querySelector('.modal-close')?.addEventListener('click', () => this.close());
        }
    }

    createButtons() {
        this.buttons.forEach((buttonConfig, index) => {
            const button = document.createElement('button');
            button.className = `modal-button ${buttonConfig.variant || 'primary'}`;
            button.textContent = buttonConfig.text;
            button.addEventListener('click', () => {
                if (buttonConfig.action === 'close') {
                    this.close();
                } else if (buttonConfig.callback) {
                    buttonConfig.callback(this);
                }
            });
            this.footerElement.appendChild(button);
        });
    }

    animateIn() {
        if (this.backdrop) {
            this.backdropElement.style.opacity = '1';
        }
        
        // Add modal-specific animations based on type
        switch (this.animation) {
            case 'slide':
                this.animate('y', this.y, 300, { from: this.y - 100 });
                break;
            case 'scale':
                this.animate('scaleX', 1, 300, { from: 0.8 });
                this.animate('scaleY', 1, 300, { from: 0.8 });
                break;
            default: // fade
                this.animate('alpha', 1, 300, { from: 0 });
        }
    }

    animateOut(callback) {
        if (this.backdrop) {
            this.backdropElement.style.opacity = '0';
        }
        
        this.animate('alpha', 0, 200).then(() => {
            if (callback) callback();
        });
    }

    trapFocus() {
        // Implementation for focus trapping within modal
        // This ensures keyboard navigation stays within the modal
    }
}

// ===== NAVIGATION MENU SYSTEM =====
export class NavigationMenu extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 250,
            height: options.height || 400,
            ariaRole: 'navigation'
        });
        
        this.items = options.items || [];
        this.orientation = options.orientation || 'vertical'; // 'horizontal', 'vertical'
        this.expandable = options.expandable || false;
        this.collapsible = options.collapsible || false;
        this.selectedIndex = options.selectedIndex || 0;
        
        // State
        this.isExpanded = options.isExpanded !== false;
        this.hoveredIndex = -1;
        this.focusedIndex = this.selectedIndex;
        
        this.setupNavigation();
    }

    setupNavigation() {
        this.menuItems = this.items.map((item, index) => ({
            ...item,
            index,
            id: `nav-item-${this.id}-${index}`,
            element: null,
            isSelected: index === this.selectedIndex,
            isHovered: false,
            isFocused: false
        }));
        
        this.on('keyDown', (event) => this.handleKeyNavigation(event));
    }

    addItem(item) {
        const index = this.menuItems.length;
        const menuItem = {
            ...item,
            index,
            id: `nav-item-${this.id}-${index}`,
            element: null,
            isSelected: false,
            isHovered: false,
            isFocused: false
        };
        
        this.menuItems.push(menuItem);
        this.emit('itemAdded', { item: menuItem });
    }

    selectItem(index) {
        if (index < 0 || index >= this.menuItems.length) return;
        
        // Deselect previous
        if (this.selectedIndex >= 0) {
            this.menuItems[this.selectedIndex].isSelected = false;
        }
        
        // Select new
        this.selectedIndex = index;
        this.menuItems[index].isSelected = true;
        
        const item = this.menuItems[index];
        this.emit('itemSelected', { item, index });
        
        if (item.action) {
            item.action(item);
        }
    }

    handleKeyNavigation(event) {
        const isVertical = this.orientation === 'vertical';
        const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
        const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';
        
        switch (event.key) {
            case nextKey:
                this.focusedIndex = Math.min(this.focusedIndex + 1, this.menuItems.length - 1);
                this.updateFocus();
                break;
            case prevKey:
                this.focusedIndex = Math.max(this.focusedIndex - 1, 0);
                this.updateFocus();
                break;
            case 'Enter':
            case ' ':
                this.selectItem(this.focusedIndex);
                break;
            case 'Home':
                this.focusedIndex = 0;
                this.updateFocus();
                break;
            case 'End':
                this.focusedIndex = this.menuItems.length - 1;
                this.updateFocus();
                break;
        }
    }

    updateFocus() {
        this.menuItems.forEach((item, index) => {
            item.isFocused = index === this.focusedIndex;
        });
    }

    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        const itemHeight = this.orientation === 'vertical' ? 
            this.height / this.menuItems.length : this.height;
        const itemWidth = this.orientation === 'horizontal' ? 
            this.width / this.menuItems.length : this.width;
        
        this.menuItems.forEach((item, index) => {
            const x = this.orientation === 'horizontal' ? index * itemWidth : 0;
            const y = this.orientation === 'vertical' ? index * itemHeight : 0;
            
            // Background
            let bgColor = '#FFFFFF';
            if (item.isSelected) bgColor = '#2196F3';
            else if (item.isFocused) bgColor = '#E3F2FD';
            else if (item.isHovered) bgColor = '#F5F5F5';
            
            renderer.fillStyle = bgColor;
            renderer.fillRect(x, y, itemWidth, itemHeight);
            
            // Border
            renderer.strokeStyle = '#E0E0E0';
            renderer.lineWidth = 1;
            renderer.strokeRect(x, y, itemWidth, itemHeight);
            
            // Text
            renderer.fillStyle = item.isSelected ? '#FFFFFF' : '#333333';
            renderer.font = '14px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            renderer.fillText(item.text, x + 10, y + itemHeight / 2);
            
            // Icon (if provided)
            if (item.icon) {
                // Render icon
                renderer.fillText(item.icon, x + itemWidth - 25, y + itemHeight / 2);
            }
        });
    }
}

// ===== DATA VISUALIZATION COMPONENTS =====
export class Chart extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 400,
            height: options.height || 300,
            ariaRole: 'img'
        });
        
        this.type = options.type || 'line'; // 'line', 'bar', 'pie', 'scatter'
        this.data = options.data || [];
        this.labels = options.labels || [];
        this.title = options.title || '';
        this.showLegend = options.showLegend !== false;
        this.showAxis = options.showAxis !== false;
        this.colors = options.colors || ['#2196F3', '#4CAF50', '#FF9800', '#F44336'];
        
        // Chart dimensions (accounting for margins)
        this.margin = { top: 40, right: 30, bottom: 40, left: 60 };
        this.chartWidth = this.width - this.margin.left - this.margin.right;
        this.chartHeight = this.height - this.margin.top - this.margin.bottom;
        
        this.setupChart();
    }

    setupChart() {
        this.processData();
        this.calculateScales();
        this.ariaLabel = this.getAccessibilityDescription();
    }

    processData() {
        // Process data based on chart type
        switch (this.type) {
            case 'line':
            case 'bar':
                this.processSeriesData();
                break;
            case 'pie':
                this.processPieData();
                break;
        }
    }

    processSeriesData() {
        // Handle series data for line/bar charts
        if (!Array.isArray(this.data[0])) {
            this.data = [this.data]; // Single series
        }
        
        // Calculate min/max values
        this.minValue = Math.min(...this.data.flat());
        this.maxValue = Math.max(...this.data.flat());
    }

    processPieData() {
        // Calculate percentages for pie chart
        const total = this.data.reduce((sum, val) => sum + val, 0);
        this.percentages = this.data.map(val => (val / total) * 100);
    }

    calculateScales() {
        // Calculate scales for positioning data points
        this.xScale = this.chartWidth / (this.labels.length - 1);
        this.yScale = this.chartHeight / (this.maxValue - this.minValue);
    }

    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Clear background
        renderer.fillStyle = '#FFFFFF';
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Title
        if (this.title) {
            renderer.fillStyle = '#333333';
            renderer.font = 'bold 16px Arial';
            renderer.textAlign = 'center';
            renderer.fillText(this.title, this.width / 2, 20);
        }
        
        // Render based on chart type
        switch (this.type) {
            case 'line':
                this.renderLineChart(renderer);
                break;
            case 'bar':
                this.renderBarChart(renderer);
                break;
            case 'pie':
                this.renderPieChart(renderer);
                break;
        }
        
        // Legend
        if (this.showLegend) {
            this.renderLegend(renderer);
        }
    }

    renderLineChart(renderer) {
        // Axes
        if (this.showAxis) {
            this.renderAxes(renderer);
        }
        
        // Data lines
        this.data.forEach((series, seriesIndex) => {
            renderer.strokeStyle = this.colors[seriesIndex % this.colors.length];
            renderer.lineWidth = 2;
            renderer.beginPath();
            
            series.forEach((value, index) => {
                const x = this.margin.left + index * this.xScale;
                const y = this.margin.top + this.chartHeight - (value - this.minValue) * this.yScale;
                
                if (index === 0) {
                    renderer.moveTo(x, y);
                } else {
                    renderer.lineTo(x, y);
                }
            });
            
            renderer.stroke();
        });
    }

    renderBarChart(renderer) {
        // Implementation for bar chart
        const barWidth = this.chartWidth / this.data[0].length;
        
        this.data[0].forEach((value, index) => {
            const x = this.margin.left + index * barWidth;
            const height = (value - this.minValue) * this.yScale;
            const y = this.margin.top + this.chartHeight - height;
            
            renderer.fillStyle = this.colors[index % this.colors.length];
            renderer.fillRect(x, y, barWidth * 0.8, height);
        });
    }

    renderPieChart(renderer) {
        // Implementation for pie chart
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = Math.min(this.chartWidth, this.chartHeight) / 2 - 20;
        
        let startAngle = 0;
        
        this.data.forEach((value, index) => {
            const angle = (value / this.data.reduce((a, b) => a + b, 0)) * 2 * Math.PI;
            
            renderer.fillStyle = this.colors[index % this.colors.length];
            renderer.beginPath();
            renderer.moveTo(centerX, centerY);
            renderer.arc(centerX, centerY, radius, startAngle, startAngle + angle);
            renderer.closePath();
            renderer.fill();
            
            startAngle += angle;
        });
    }

    renderAxes(renderer) {
        renderer.strokeStyle = '#333333';
        renderer.lineWidth = 1;
        
        // Y-axis
        renderer.beginPath();
        renderer.moveTo(this.margin.left, this.margin.top);
        renderer.lineTo(this.margin.left, this.margin.top + this.chartHeight);
        renderer.stroke();
        
        // X-axis
        renderer.beginPath();
        renderer.moveTo(this.margin.left, this.margin.top + this.chartHeight);
        renderer.lineTo(this.margin.left + this.chartWidth, this.margin.top + this.chartHeight);
        renderer.stroke();
    }

    renderLegend(renderer) {
        // Simple legend implementation
        const legendY = this.height - 20;
        let legendX = 20;
        
        this.colors.forEach((color, index) => {
            // Color box
            renderer.fillStyle = color;
            renderer.fillRect(legendX, legendY - 10, 15, 10);
            
            // Label
            renderer.fillStyle = '#333333';
            renderer.font = '12px Arial';
            renderer.textAlign = 'left';
            renderer.fillText(`Series ${index + 1}`, legendX + 20, legendY - 2);
            
            legendX += 100;
        });
    }

    getAccessibilityDescription() {
        return `${this.type} chart titled "${this.title}" with ${this.data.length} data series`;
    }
}

// ===== FORM COMPONENTS =====
export class FormField extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 200,
            height: options.height || 40,
            ariaRole: 'group'
        });
        
        this.label = options.label || '';
        this.type = options.type || 'text'; // 'text', 'number', 'email', 'password', 'textarea'
        this.value = options.value || '';
        this.placeholder = options.placeholder || '';
        this.required = options.required || false;
        this.disabled = options.disabled || false;
        this.validation = options.validation || null;
        
        // State
        this.isValid = true;
        this.errorMessage = '';
        this.isFocused = false;
        
        this.setupField();
    }

    setupField() {
        this.on('focus', () => this.handleFocus());
        this.on('blur', () => this.handleBlur());
        this.on('input', (event) => this.handleInput(event));
    }

    setValue(newValue) {
        this.value = newValue;
        this.validate();
        this.emit('change', { value: newValue, isValid: this.isValid });
    }

    validate() {
        if (this.validation) {
            const result = this.validation(this.value);
            this.isValid = result.isValid;
            this.errorMessage = result.message || '';
        } else {
            this.isValid = !this.required || this.value.trim() !== '';
            this.errorMessage = this.isValid ? '' : 'This field is required';
        }
        return this.isValid;
    }

    handleFocus() {
        this.isFocused = true;
    }

    handleBlur() {
        this.isFocused = false;
        this.validate();
    }

    handleInput(event) {
        this.setValue(event.value);
    }

    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Label
        if (this.label) {
            renderer.fillStyle = '#333333';
            renderer.font = '12px Arial';
            renderer.textAlign = 'left';
            renderer.fillText(this.label, 0, -5);
        }
        
        // Field background
        renderer.fillStyle = this.disabled ? '#F5F5F5' : '#FFFFFF';
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        let borderColor = '#CCCCCC';
        if (!this.isValid) borderColor = '#F44336';
        else if (this.isFocused) borderColor = '#2196F3';
        
        renderer.strokeStyle = borderColor;
        renderer.lineWidth = this.isFocused ? 2 : 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Value text
        renderer.fillStyle = this.disabled ? '#999999' : '#333333';
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        const displayValue = this.value || this.placeholder;
        const textColor = this.value ? '#333333' : '#999999';
        renderer.fillStyle = textColor;
        renderer.fillText(displayValue, 10, this.height / 2);
        
        // Error message
        if (!this.isValid && this.errorMessage) {
            renderer.fillStyle = '#F44336';
            renderer.font = '11px Arial';
            renderer.fillText(this.errorMessage, 0, this.height + 15);
        }
    }
}

// ===== TOOLTIP SYSTEM =====
export class Tooltip extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 'auto',
            height: options.height || 'auto',
            ariaRole: 'tooltip'
        });
        
        this.content = options.content || '';
        this.target = options.target || null;
        this.position = options.position || 'top'; // 'top', 'bottom', 'left', 'right'
        this.showDelay = options.showDelay || 500;
        this.hideDelay = options.hideDelay || 200;
        this.offset = options.offset || 10;
        
        // State
        this.isVisible = false;
        this.showTimer = null;
        this.hideTimer = null;
        
        this.setupTooltip();
    }

    setupTooltip() {
        if (this.target) {
            this.target.on('hover', () => this.scheduleShow());
            this.target.on('hoverEnd', () => this.scheduleHide());
        }
    }

    scheduleShow() {
        this.clearTimers();
        this.showTimer = setTimeout(() => this.show(), this.showDelay);
    }

    scheduleHide() {
        this.clearTimers();
        this.hideTimer = setTimeout(() => this.hide(), this.hideDelay);
    }

    clearTimers() {
        if (this.showTimer) clearTimeout(this.showTimer);
        if (this.hideTimer) clearTimeout(this.hideTimer);
    }

    show() {
        if (this.isVisible) return;
        
        this.isVisible = true;
        this.calculatePosition();
        this.animate('alpha', 1, 200, { from: 0 });
        this.emit('show');
    }

    hide() {
        if (!this.isVisible) return;
        
        this.animate('alpha', 0, 200).then(() => {
            this.isVisible = false;
            this.emit('hide');
        });
    }

    calculatePosition() {
        if (!this.target) return;
        
        const targetBounds = this.target.getBounds();
        
        switch (this.position) {
            case 'top':
                this.x = targetBounds.x + targetBounds.width / 2 - this.width / 2;
                this.y = targetBounds.y - this.height - this.offset;
                break;
            case 'bottom':
                this.x = targetBounds.x + targetBounds.width / 2 - this.width / 2;
                this.y = targetBounds.y + targetBounds.height + this.offset;
                break;
            case 'left':
                this.x = targetBounds.x - this.width - this.offset;
                this.y = targetBounds.y + targetBounds.height / 2 - this.height / 2;
                break;
            case 'right':
                this.x = targetBounds.x + targetBounds.width + this.offset;
                this.y = targetBounds.y + targetBounds.height / 2 - this.height / 2;
                break;
        }
    }

    renderSelf(renderer) {
        if (renderer.type !== 'canvas' || !this.isVisible) return;
        
        // Background
        renderer.fillStyle = 'rgba(0, 0, 0, 0.8)';
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Text
        renderer.fillStyle = '#FFFFFF';
        renderer.font = '12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(this.content, this.width / 2, this.height / 2);
    }
}

// ===== EXPORT ALL COMPONENTS =====
export {
    ModalDialog,
    NavigationMenu,
    Chart,
    FormField,
    Tooltip
};
