/**
 * Input and Utility Components
 * Implementation of ColorPicker, DateTimePicker, NumberInput, Accordion, Drawer, and SearchBox
 */

import { BaseObject } from './enhanced-objects.js';

// =============================================================================
// COLOR PICKER COMPONENT
// =============================================================================

export class ColorPicker extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 280,
            height: options.height || 320,
            ariaRole: 'button'
        });
        
        this.value = options.value || '#ff0000';
        this.format = options.format || 'hex'; // 'hex', 'rgb', 'hsl'
        this.showAlpha = options.showAlpha !== false;
        this.showPresets = options.showPresets !== false;
        this.disabled = options.disabled || false;
        
        // Color presets
        this.presets = options.presets || [
            '#ff0000', '#00ff00', '#0000ff', '#ffff00', '#ff00ff', '#00ffff',
            '#000000', '#ffffff', '#808080', '#800000', '#008000', '#000080'
        ];
        
        // Visual styling
        this.borderColor = options.borderColor || '#dee2e6';
        this.backgroundColor = options.backgroundColor || '#ffffff';
        
        // State
        this.isOpen = false;
        this.hue = 0;
        this.saturation = 100;
        this.lightness = 50;
        this.alpha = 1;
        
        this.parseColor();
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('mouseMove', (event) => this.handleMouseMove(event));
        this.on('mouseDown', (event) => this.handleMouseDown(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
    }
    
    parseColor() {
        let color = this.value;
        
        if (color.startsWith('#')) {
            // Hex color
            const hex = color.slice(1);
            const r = parseInt(hex.substr(0, 2), 16);
            const g = parseInt(hex.substr(2, 2), 16);
            const b = parseInt(hex.substr(4, 2), 16);
            const hsl = this.rgbToHsl(r, g, b);
            this.hue = hsl.h;
            this.saturation = hsl.s;
            this.lightness = hsl.l;
        }
    }
    
    rgbToHsl(r, g, b) {
        r /= 255;
        g /= 255;
        b /= 255;
        
        const max = Math.max(r, g, b);
        const min = Math.min(r, g, b);
        let h, s, l = (max + min) / 2;
        
        if (max === min) {
            h = s = 0;
        } else {
            const d = max - min;
            s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
            
            switch (max) {
                case r: h = (g - b) / d + (g < b ? 6 : 0); break;
                case g: h = (b - r) / d + 2; break;
                case b: h = (r - g) / d + 4; break;
            }
            h /= 6;
        }
        
        return { h: h * 360, s: s * 100, l: l * 100 };
    }
    
    hslToRgb(h, s, l) {
        h /= 360;
        s /= 100;
        l /= 100;
        
        const hue2rgb = (p, q, t) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1/6) return p + (q - p) * 6 * t;
            if (t < 1/2) return q;
            if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        };
        
        let r, g, b;
        
        if (s === 0) {
            r = g = b = l;
        } else {
            const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
            const p = 2 * l - q;
            r = hue2rgb(p, q, h + 1/3);
            g = hue2rgb(p, q, h);
            b = hue2rgb(p, q, h - 1/3);
        }
        
        return {
            r: Math.round(r * 255),
            g: Math.round(g * 255),
            b: Math.round(b * 255)
        };
    }
    
    updateValue() {
        const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
        
        switch (this.format) {
            case 'hex':
                this.value = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
                break;
            case 'rgb':
                this.value = this.showAlpha ? 
                    `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${this.alpha})` :
                    `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
                break;
            case 'hsl':
                this.value = this.showAlpha ?
                    `hsla(${Math.round(this.hue)}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%, ${this.alpha})` :
                    `hsl(${Math.round(this.hue)}, ${Math.round(this.saturation)}%, ${Math.round(this.lightness)}%)`;
                break;
        }
        
        this.emit('colorChanged', { value: this.value, hsl: { h: this.hue, s: this.saturation, l: this.lightness }, alpha: this.alpha });
    }
    
    handleClick(event) {
        if (this.disabled) return;
        
        if (!this.isOpen) {
            this.isOpen = true;
            this.emit('opened');
        } else {
            const { localX, localY } = event;
            this.handleColorSelection(localX, localY);
        }
    }
    
    handleColorSelection(x, y) {
        // Color wheel area (simplified)
        if (y < 200) {
            const centerX = this.width / 2;
            const centerY = 100;
            const radius = 80;
            
            const dx = x - centerX;
            const dy = y - centerY;
            const distance = Math.sqrt(dx * dx + dy * dy);
            
            if (distance <= radius) {
                this.hue = (Math.atan2(dy, dx) * 180 / Math.PI + 360) % 360;
                this.saturation = Math.min(100, (distance / radius) * 100);
                this.updateValue();
            }
        }
        
        // Lightness slider area
        if (y >= 220 && y <= 240 && x >= 20 && x <= this.width - 20) {
            this.lightness = ((x - 20) / (this.width - 40)) * 100;
            this.updateValue();
        }
        
        // Alpha slider area
        if (this.showAlpha && y >= 250 && y <= 270 && x >= 20 && x <= this.width - 20) {
            this.alpha = (x - 20) / (this.width - 40);
            this.updateValue();
        }
        
        // Preset colors
        if (this.showPresets && y >= 280) {
            const presetWidth = (this.width - 40) / this.presets.length;
            const presetIndex = Math.floor((x - 20) / presetWidth);
            
            if (presetIndex >= 0 && presetIndex < this.presets.length) {
                this.value = this.presets[presetIndex];
                this.parseColor();
                this.emit('colorChanged', { value: this.value });
            }
        }
    }
    
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        if (!this.isOpen) {
            this.renderPreview(renderer);
        } else {
            this.renderPicker(renderer);
        }
    }
    
    renderPreview(renderer) {
        // Color preview box
        renderer.fillStyle = this.value;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Dropdown arrow
        renderer.fillStyle = '#666666';
        renderer.font = '12px Arial';
        renderer.textAlign = 'right';
        renderer.textBaseline = 'middle';
        renderer.fillText('▼', this.width - 10, this.height / 2);
    }
    
    renderPicker(renderer) {
        // Background
        renderer.fillStyle = this.backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Color wheel (simplified)
        this.renderColorWheel(renderer);
        
        // Lightness slider
        this.renderLightnessSlider(renderer);
        
        // Alpha slider
        if (this.showAlpha) {
            this.renderAlphaSlider(renderer);
        }
        
        // Preset colors
        if (this.showPresets) {
            this.renderPresets(renderer);
        }
        
        // Current color preview
        this.renderCurrentColor(renderer);
    }
    
    renderColorWheel(renderer) {
        const centerX = this.width / 2;
        const centerY = 100;
        const radius = 80;
        
        // Simplified color wheel representation
        for (let angle = 0; angle < 360; angle += 10) {
            const startAngle = (angle - 5) * Math.PI / 180;
            const endAngle = (angle + 5) * Math.PI / 180;
            
            const rgb = this.hslToRgb(angle, 100, 50);
            renderer.fillStyle = `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`;
            
            renderer.beginPath();
            renderer.arc(centerX, centerY, radius, startAngle, endAngle);
            renderer.arc(centerX, centerY, radius * 0.3, endAngle, startAngle, true);
            renderer.fill();
        }
        
        // Current hue indicator
        const currentAngle = this.hue * Math.PI / 180;
        const indicatorX = centerX + Math.cos(currentAngle) * (radius * 0.65);
        const indicatorY = centerY + Math.sin(currentAngle) * (radius * 0.65);
        
        renderer.fillStyle = '#ffffff';
        renderer.strokeStyle = '#000000';
        renderer.lineWidth = 2;
        renderer.beginPath();
        renderer.arc(indicatorX, indicatorY, 4, 0, Math.PI * 2);
        renderer.fill();
        renderer.stroke();
    }
    
    renderLightnessSlider(renderer) {
        const y = 220;
        const height = 20;
        const startX = 20;
        const endX = this.width - 20;
        
        // Gradient background
        const gradient = renderer.createLinearGradient(startX, y, endX, y);
        gradient.addColorStop(0, '#000000');
        gradient.addColorStop(0.5, `hsl(${this.hue}, ${this.saturation}%, 50%)`);
        gradient.addColorStop(1, '#ffffff');
        
        renderer.fillStyle = gradient;
        renderer.fillRect(startX, y, endX - startX, height);
        
        // Current lightness indicator
        const indicatorX = startX + (this.lightness / 100) * (endX - startX);
        renderer.fillStyle = '#ffffff';
        renderer.strokeStyle = '#000000';
        renderer.lineWidth = 2;
        renderer.fillRect(indicatorX - 2, y - 2, 4, height + 4);
        renderer.strokeRect(indicatorX - 2, y - 2, 4, height + 4);
    }
    
    renderAlphaSlider(renderer) {
        const y = 250;
        const height = 20;
        const startX = 20;
        const endX = this.width - 20;
        
        // Checkerboard background for transparency
        const rgb = this.hslToRgb(this.hue, this.saturation, this.lightness);
        const gradient = renderer.createLinearGradient(startX, y, endX, y);
        gradient.addColorStop(0, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 0)`);
        gradient.addColorStop(1, `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, 1)`);
        
        renderer.fillStyle = gradient;
        renderer.fillRect(startX, y, endX - startX, height);
        
        // Current alpha indicator
        const indicatorX = startX + this.alpha * (endX - startX);
        renderer.fillStyle = '#ffffff';
        renderer.strokeStyle = '#000000';
        renderer.lineWidth = 2;
        renderer.fillRect(indicatorX - 2, y - 2, 4, height + 4);
        renderer.strokeRect(indicatorX - 2, y - 2, 4, height + 4);
    }
    
    renderPresets(renderer) {
        const y = 280;
        const height = 20;
        const startX = 20;
        const presetWidth = (this.width - 40) / this.presets.length;
        
        this.presets.forEach((preset, index) => {
            const x = startX + index * presetWidth;
            
            renderer.fillStyle = preset;
            renderer.fillRect(x, y, presetWidth - 2, height);
            
            renderer.strokeStyle = preset === this.value ? '#000000' : '#cccccc';
            renderer.lineWidth = preset === this.value ? 2 : 1;
            renderer.strokeRect(x, y, presetWidth - 2, height);
        });
    }
    
    renderCurrentColor(renderer) {
        const x = 20;
        const y = this.height - 40;
        const width = this.width - 40;
        const height = 20;
        
        renderer.fillStyle = this.value;
        renderer.fillRect(x, y, width, height);
        
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(x, y, width, height);
        
        // Color value text
        renderer.fillStyle = '#333333';
        renderer.font = '11px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'top';
        renderer.fillText(this.value, this.width / 2, y + height + 2);
    }
    
    // Public API
    getValue() {
        return this.value;
    }
    
    setValue(value) {
        this.value = value;
        this.parseColor();
        this.emit('colorChanged', { value: this.value });
    }
    
    open() {
        this.isOpen = true;
        this.emit('opened');
    }
    
    close() {
        this.isOpen = false;
        this.emit('closed');
    }
}

// =============================================================================
// ACCORDION COMPONENT
// =============================================================================

export class Accordion extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 400,
            height: options.height || 300,
            ariaRole: 'region'
        });
        
        this.items = options.items || [];
        this.allowMultiple = options.allowMultiple || false;
        this.expandedItems = new Set(options.expandedItems || []);
        this.animationDuration = options.animationDuration || 300;
        
        // Visual styling
        this.headerHeight = options.headerHeight || 40;
        this.headerBackgroundColor = options.headerBackgroundColor || '#f8f9fa';
        this.headerActiveColor = options.headerActiveColor || '#e9ecef';
        this.contentBackgroundColor = options.contentBackgroundColor || '#ffffff';
        this.borderColor = options.borderColor || '#dee2e6';
        this.textColor = options.textColor || '#333333';
        
        // State
        this.animatingItems = new Map();
        
        this.setupItems();
        this.setupEventHandlers();
    }
    
    setupItems() {
        this.items = this.items.map((item, index) => ({
            id: item.id || `item-${index}`,
            title: item.title || `Item ${index + 1}`,
            content: item.content || '',
            icon: item.icon || null,
            disabled: item.disabled || false,
            ...item
        }));
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
    }
    
    // Accordion Management
    expandItem(itemId) {
        const item = this.items.find(i => i.id === itemId);
        if (!item || item.disabled) return;
        
        if (!this.allowMultiple) {
            this.expandedItems.clear();
        }
        
        this.expandedItems.add(itemId);
        this.startAnimation(itemId, 'expand');
        this.emit('itemExpanded', { itemId, item });
    }
    
    collapseItem(itemId) {
        this.expandedItems.delete(itemId);
        this.startAnimation(itemId, 'collapse');
        this.emit('itemCollapsed', { itemId });
    }
    
    toggleItem(itemId) {
        if (this.expandedItems.has(itemId)) {
            this.collapseItem(itemId);
        } else {
            this.expandItem(itemId);
        }
    }
    
    startAnimation(itemId, type) {
        this.animatingItems.set(itemId, {
            type,
            startTime: Date.now(),
            duration: this.animationDuration
        });
    }
    
    getItemHeight(item) {
        const isExpanded = this.expandedItems.has(item.id);
        const animation = this.animatingItems.get(item.id);
        
        if (!animation) {
            return isExpanded ? this.getContentHeight(item) : 0;
        }
        
        const elapsed = Date.now() - animation.startTime;
        const progress = Math.min(elapsed / animation.duration, 1);
        const contentHeight = this.getContentHeight(item);
        
        if (animation.type === 'expand') {
            return contentHeight * this.easeInOut(progress);
        } else {
            return contentHeight * (1 - this.easeInOut(progress));
        }
    }
    
    getContentHeight(item) {
        // Simplified content height calculation
        const lines = item.content.split('\n').length;
        return Math.max(60, lines * 20 + 20);
    }
    
    easeInOut(t) {
        return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t;
    }
    
    getItemBounds(itemIndex) {
        let y = 0;
        
        for (let i = 0; i < itemIndex; i++) {
            y += this.headerHeight + this.getItemHeight(this.items[i]);
        }
        
        return {
            x: 0,
            y,
            width: this.width,
            headerHeight: this.headerHeight,
            contentHeight: this.getItemHeight(this.items[itemIndex])
        };
    }
    
    getItemFromPosition(y) {
        let currentY = 0;
        
        for (let i = 0; i < this.items.length; i++) {
            const itemHeight = this.headerHeight + this.getItemHeight(this.items[i]);
            
            if (y >= currentY && y < currentY + itemHeight) {
                const isInHeader = y < currentY + this.headerHeight;
                return { item: this.items[i], index: i, isInHeader };
            }
            
            currentY += itemHeight;
        }
        
        return null;
    }
    
    // Event Handlers
    handleClick(event) {
        const { localY } = event;
        const result = this.getItemFromPosition(localY);
        
        if (result && result.isInHeader) {
            this.toggleItem(result.item.id);
        }
    }
    
    handleKeyDown(event) {
        // Implement keyboard navigation
        switch (event.key) {
            case 'ArrowUp':
                // Navigate to previous item
                break;
            case 'ArrowDown':
                // Navigate to next item
                break;
            case 'Enter':
            case ' ':
                // Toggle focused item
                break;
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        let currentY = 0;
        
        this.items.forEach((item, index) => {
            const bounds = this.getItemBounds(index);
            const isExpanded = this.expandedItems.has(item.id);
            
            // Render header
            this.renderItemHeader(renderer, item, bounds, isExpanded);
            
            // Render content if expanded
            if (isExpanded || this.animatingItems.has(item.id)) {
                this.renderItemContent(renderer, item, bounds);
            }
        });
        
        // Update animations
        this.updateAnimations();
    }
    
    renderItemHeader(renderer, item, bounds, isExpanded) {
        const backgroundColor = isExpanded ? this.headerActiveColor : this.headerBackgroundColor;
        
        // Header background
        renderer.fillStyle = backgroundColor;
        renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);
        
        // Header border
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);
        
        // Expand/collapse icon
        const iconX = bounds.x + 12;
        const iconY = bounds.y + bounds.headerHeight / 2;
        
        renderer.fillStyle = item.disabled ? '#999999' : this.textColor;
        renderer.font = '12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(isExpanded ? '▼' : '▶', iconX, iconY);
        
        // Item icon
        let textX = iconX + 20;
        if (item.icon) {
            renderer.fillText(item.icon, textX, iconY);
            textX += 20;
        }
        
        // Title
        renderer.fillStyle = item.disabled ? '#999999' : this.textColor;
        renderer.font = isExpanded ? 'bold 13px Arial' : '13px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText(item.title, textX, iconY);
    }
    
    renderItemContent(renderer, item, bounds) {
        const contentY = bounds.y + bounds.headerHeight;
        const contentHeight = bounds.contentHeight;
        
        if (contentHeight <= 0) return;
        
        // Content background
        renderer.fillStyle = this.contentBackgroundColor;
        renderer.fillRect(bounds.x, contentY, bounds.width, contentHeight);
        
        // Content border
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(bounds.x, contentY, bounds.width, contentHeight);
        
        // Content text
        renderer.fillStyle = this.textColor;
        renderer.font = '12px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        const lines = item.content.split('\n');
        lines.forEach((line, index) => {
            renderer.fillText(line, bounds.x + 12, contentY + 12 + index * 20);
        });
    }
    
    updateAnimations() {
        const now = Date.now();
        const toRemove = [];
        
        for (const [itemId, animation] of this.animatingItems) {
            const elapsed = now - animation.startTime;
            
            if (elapsed >= animation.duration) {
                toRemove.push(itemId);
            }
        }
        
        toRemove.forEach(itemId => {
            this.animatingItems.delete(itemId);
        });
        
        if (this.animatingItems.size > 0) {
            // Continue animation
            requestAnimationFrame(() => this.updateAnimations());
        }
    }
    
    // Public API
    addItem(item, index = -1) {
        const newItem = {
            id: item.id || `item-${Date.now()}`,
            title: item.title || 'New Item',
            content: item.content || '',
            icon: item.icon || null,
            disabled: item.disabled || false,
            ...item
        };
        
        if (index >= 0 && index < this.items.length) {
            this.items.splice(index, 0, newItem);
        } else {
            this.items.push(newItem);
        }
        
        this.emit('itemAdded', { item: newItem, index });
    }
    
    removeItem(itemId) {
        const index = this.items.findIndex(item => item.id === itemId);
        if (index >= 0) {
            const removedItem = this.items.splice(index, 1)[0];
            this.expandedItems.delete(itemId);
            this.animatingItems.delete(itemId);
            this.emit('itemRemoved', { item: removedItem, index });
        }
    }
    
    updateItem(itemId, updates) {
        const item = this.items.find(i => i.id === itemId);
        if (item) {
            Object.assign(item, updates);
            this.emit('itemUpdated', { itemId, item, updates });
        }
    }
    
    expandAll() {
        this.items.forEach(item => {
            if (!item.disabled) {
                this.expandedItems.add(item.id);
            }
        });
        this.emit('allExpanded');
    }
    
    collapseAll() {
        this.expandedItems.clear();
        this.animatingItems.clear();
        this.emit('allCollapsed');
    }
}

// =============================================================================
// DATE TIME PICKER COMPONENT
// =============================================================================

export class DateTimePicker extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 320,
            height: options.height || 280,
            ariaRole: 'application'
        });
        
        this.value = options.value ? new Date(options.value) : new Date();
        this.format = options.format || 'MM/DD/YYYY';
        this.showTime = options.showTime !== false;
        this.show24Hour = options.show24Hour || false;
        this.minDate = options.minDate ? new Date(options.minDate) : null;
        this.maxDate = options.maxDate ? new Date(options.maxDate) : null;
        this.disabled = options.disabled || false;
        
        // Visual styling
        this.headerBackgroundColor = options.headerBackgroundColor || '#007bff';
        this.headerTextColor = options.headerTextColor || '#ffffff';
        this.todayColor = options.todayColor || '#ffc107';
        this.selectedColor = options.selectedColor || '#007bff';
        this.disabledColor = options.disabledColor || '#e9ecef';
        
        // State
        this.isOpen = false;
        this.currentView = 'calendar'; // 'calendar', 'time'
        this.displayMonth = this.value.getMonth();
        this.displayYear = this.value.getFullYear();
        this.selectedHour = this.value.getHours();
        this.selectedMinute = this.value.getMinutes();
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
    }
    
    // Date manipulation
    formatDate(date) {
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        const year = date.getFullYear();
        
        switch (this.format) {
            case 'DD/MM/YYYY':
                return `${day}/${month}/${year}`;
            case 'YYYY-MM-DD':
                return `${year}-${month}-${day}`;
            default: // MM/DD/YYYY
                return `${month}/${day}/${year}`;
        }
    }
    
    formatTime(hour, minute) {
        if (this.show24Hour) {
            return `${String(hour).padStart(2, '0')}:${String(minute).padStart(2, '0')}`;
        } else {
            const ampm = hour >= 12 ? 'PM' : 'AM';
            const displayHour = hour % 12 || 12;
            return `${displayHour}:${String(minute).padStart(2, '0')} ${ampm}`;
        }
    }
    
    getDaysInMonth(month, year) {
        return new Date(year, month + 1, 0).getDate();
    }
    
    getFirstDayOfMonth(month, year) {
        return new Date(year, month, 1).getDay();
    }
    
    isDateDisabled(date) {
        if (this.minDate && date < this.minDate) return true;
        if (this.maxDate && date > this.maxDate) return true;
        return false;
    }
    
    isToday(date) {
        const today = new Date();
        return date.toDateString() === today.toDateString();
    }
    
    // Event handlers
    handleClick(event) {
        const { localX, localY } = event;
        
        if (!this.isOpen) {
            this.isOpen = true;
            return;
        }
        
        if (this.currentView === 'calendar') {
            this.handleCalendarClick(localX, localY);
        } else if (this.currentView === 'time') {
            this.handleTimeClick(localX, localY);
        }
    }
    
    handleCalendarClick(x, y) {
        // Header navigation
        if (y < 40) {
            if (x < 40) {
                this.navigateMonth(-1);
            } else if (x > this.width - 40) {
                this.navigateMonth(1);
            } else if (this.showTime && x > this.width - 80) {
                this.currentView = 'time';
            }
            return;
        }
        
        // Calendar grid
        const gridY = y - 70; // Account for header and day labels
        const cellWidth = this.width / 7;
        const cellHeight = 30;
        
        if (gridY >= 0) {
            const col = Math.floor(x / cellWidth);
            const row = Math.floor(gridY / cellHeight);
            
            const firstDay = this.getFirstDayOfMonth(this.displayMonth, this.displayYear);
            const dayNumber = row * 7 + col - firstDay + 1;
            const daysInMonth = this.getDaysInMonth(this.displayMonth, this.displayYear);
            
            if (dayNumber >= 1 && dayNumber <= daysInMonth) {
                const selectedDate = new Date(this.displayYear, this.displayMonth, dayNumber);
                
                if (!this.isDateDisabled(selectedDate)) {
                    this.value = selectedDate;
                    this.emit('dateChanged', { value: this.value });
                    
                    if (!this.showTime) {
                        this.isOpen = false;
                    }
                }
            }
        }
    }
    
    handleTimeClick(x, y) {
        // Time selection logic
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        const radius = 80;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance <= radius) {
            const angle = Math.atan2(dy, dx);
            const normalizedAngle = (angle + Math.PI * 2) % (Math.PI * 2);
            
            if (distance < radius * 0.6) {
                // Hour selection
                this.selectedHour = Math.floor((normalizedAngle / (Math.PI * 2)) * 12);
                if (!this.show24Hour && this.selectedHour === 0) {
                    this.selectedHour = 12;
                }
            } else {
                // Minute selection
                this.selectedMinute = Math.floor((normalizedAngle / (Math.PI * 2)) * 60);
            }
            
            this.updateDateTime();
        }
        
        // Back to calendar button
        if (y < 40 && x < 80) {
            this.currentView = 'calendar';
        }
    }
    
    handleKeyDown(event) {
        if (!this.isOpen) return;
        
        switch (event.key) {
            case 'Escape':
                this.isOpen = false;
                break;
            case 'Enter':
                this.isOpen = false;
                break;
            case 'ArrowLeft':
                if (this.currentView === 'calendar') {
                    this.navigateDay(-1);
                }
                break;
            case 'ArrowRight':
                if (this.currentView === 'calendar') {
                    this.navigateDay(1);
                }
                break;
            case 'ArrowUp':
                if (this.currentView === 'calendar') {
                    this.navigateDay(-7);
                }
                break;
            case 'ArrowDown':
                if (this.currentView === 'calendar') {
                    this.navigateDay(7);
                }
                break;
        }
    }
    
    navigateMonth(direction) {
        this.displayMonth += direction;
        
        if (this.displayMonth < 0) {
            this.displayMonth = 11;
            this.displayYear--;
        } else if (this.displayMonth > 11) {
            this.displayMonth = 0;
            this.displayYear++;
        }
    }
    
    navigateDay(days) {
        const newDate = new Date(this.value);
        newDate.setDate(newDate.getDate() + days);
        
        if (!this.isDateDisabled(newDate)) {
            this.value = newDate;
            this.displayMonth = this.value.getMonth();
            this.displayYear = this.value.getFullYear();
            this.emit('dateChanged', { value: this.value });
        }
    }
    
    updateDateTime() {
        this.value.setHours(this.selectedHour);
        this.value.setMinutes(this.selectedMinute);
        this.emit('dateChanged', { value: this.value });
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        if (!this.isOpen) {
            this.renderInputField(renderer);
        } else {
            if (this.currentView === 'calendar') {
                this.renderCalendar(renderer);
            } else {
                this.renderTimePicker(renderer);
            }
        }
    }
    
    renderInputField(renderer) {
        // Input field background
        renderer.fillStyle = this.disabled ? this.disabledColor : '#ffffff';
        renderer.fillRect(0, 0, this.width, 40);
        
        // Border
        renderer.strokeStyle = '#ced4da';
        renderer.lineWidth = 1;
        renderer.strokeRect(0, 0, this.width, 40);
        
        // Date text
        renderer.fillStyle = this.disabled ? '#6c757d' : '#495057';
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        let displayText = this.formatDate(this.value);
        if (this.showTime) {
            displayText += ' ' + this.formatTime(this.selectedHour, this.selectedMinute);
        }
        
        renderer.fillText(displayText, 12, 20);
        
        // Calendar icon
        renderer.fillStyle = '#6c757d';
        renderer.font = '16px Arial';
        renderer.textAlign = 'right';
        renderer.fillText('📅', this.width - 12, 20);
    }
    
    renderCalendar(renderer) {
        // Background
        renderer.fillStyle = '#ffffff';
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        renderer.strokeStyle = '#dee2e6';
        renderer.lineWidth = 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Header
        this.renderCalendarHeader(renderer);
        
        // Day labels
        this.renderDayLabels(renderer);
        
        // Calendar grid
        this.renderCalendarGrid(renderer);
    }
    
    renderCalendarHeader(renderer) {
        // Header background
        renderer.fillStyle = this.headerBackgroundColor;
        renderer.fillRect(0, 0, this.width, 40);
        
        // Month/Year text
        const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                           'July', 'August', 'September', 'October', 'November', 'December'];
        
        renderer.fillStyle = this.headerTextColor;
        renderer.font = 'bold 14px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(`${monthNames[this.displayMonth]} ${this.displayYear}`, this.width / 2, 20);
        
        // Navigation arrows
        renderer.font = '16px Arial';
        renderer.textAlign = 'center';
        renderer.fillText('‹', 20, 20); // Previous month
        renderer.fillText('›', this.width - 20, 20); // Next month
        
        // Time button
        if (this.showTime) {
            renderer.font = '12px Arial';
            renderer.textAlign = 'right';
            renderer.fillText('Time', this.width - 50, 20);
        }
    }
    
    renderDayLabels(renderer) {
        const dayLabels = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        const cellWidth = this.width / 7;
        
        renderer.fillStyle = '#6c757d';
        renderer.font = '12px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        
        dayLabels.forEach((label, index) => {
            const x = index * cellWidth + cellWidth / 2;
            renderer.fillText(label, x, 55);
        });
    }
    
    renderCalendarGrid(renderer) {
        const cellWidth = this.width / 7;
        const cellHeight = 30;
        const startY = 70;
        
        const firstDay = this.getFirstDayOfMonth(this.displayMonth, this.displayYear);
        const daysInMonth = this.getDaysInMonth(this.displayMonth, this.displayYear);
        
        for (let day = 1; day <= daysInMonth; day++) {
            const dayIndex = firstDay + day - 1;
            const row = Math.floor(dayIndex / 7);
            const col = dayIndex % 7;
            
            const x = col * cellWidth;
            const y = startY + row * cellHeight;
            
            const date = new Date(this.displayYear, this.displayMonth, day);
            const isSelected = this.value.toDateString() === date.toDateString();
            const isToday = this.isToday(date);
            const isDisabled = this.isDateDisabled(date);
            
            // Cell background
            if (isSelected) {
                renderer.fillStyle = this.selectedColor;
                renderer.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            } else if (isToday) {
                renderer.fillStyle = this.todayColor;
                renderer.fillRect(x + 2, y + 2, cellWidth - 4, cellHeight - 4);
            }
            
            // Day number
            renderer.fillStyle = isDisabled ? '#adb5bd' : 
                               isSelected ? '#ffffff' : 
                               isToday ? '#000000' : '#495057';
            renderer.font = isSelected ? 'bold 14px Arial' : '14px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(day.toString(), x + cellWidth / 2, y + cellHeight / 2);
        }
    }
    
    renderTimePicker(renderer) {
        // Background
        renderer.fillStyle = '#ffffff';
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        renderer.strokeStyle = '#dee2e6';
        renderer.lineWidth = 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Header
        renderer.fillStyle = this.headerBackgroundColor;
        renderer.fillRect(0, 0, this.width, 40);
        
        // Back button
        renderer.fillStyle = this.headerTextColor;
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText('← Calendar', 12, 20);
        
        // Time display
        const timeText = this.formatTime(this.selectedHour, this.selectedMinute);
        renderer.textAlign = 'center';
        renderer.fillText(timeText, this.width / 2, 20);
        
        // Clock face
        this.renderClockFace(renderer);
    }
    
    renderClockFace(renderer) {
        const centerX = this.width / 2;
        const centerY = this.height / 2 + 20;
        const radius = 80;
        
        // Clock circle
        renderer.strokeStyle = '#dee2e6';
        renderer.lineWidth = 2;
        renderer.beginPath();
        renderer.arc(centerX, centerY, radius, 0, Math.PI * 2);
        renderer.stroke();
        
        // Hour markers
        for (let i = 0; i < 12; i++) {
            const angle = (i * 30 - 90) * Math.PI / 180;
            const x1 = centerX + Math.cos(angle) * (radius - 10);
            const y1 = centerY + Math.sin(angle) * (radius - 10);
            const x2 = centerX + Math.cos(angle) * (radius - 5);
            const y2 = centerY + Math.sin(angle) * (radius - 5);
            
            renderer.strokeStyle = '#6c757d';
            renderer.lineWidth = 1;
            renderer.beginPath();
            renderer.moveTo(x1, y1);
            renderer.lineTo(x2, y2);
            renderer.stroke();
            
            // Hour numbers
            const hour = i === 0 ? 12 : i;
            const textX = centerX + Math.cos(angle) * (radius - 20);
            const textY = centerY + Math.sin(angle) * (radius - 20);
            
            renderer.fillStyle = '#495057';
            renderer.font = '12px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(hour.toString(), textX, textY);
        }
        
        // Selected hour indicator
        const hourAngle = ((this.selectedHour % 12) * 30 - 90) * Math.PI / 180;
        const hourX = centerX + Math.cos(hourAngle) * (radius * 0.5);
        const hourY = centerY + Math.sin(hourAngle) * (radius * 0.5);
        
        renderer.fillStyle = this.selectedColor;
        renderer.beginPath();
        renderer.arc(hourX, hourY, 6, 0, Math.PI * 2);
        renderer.fill();
        
        // Selected minute indicator
        const minuteAngle = (this.selectedMinute * 6 - 90) * Math.PI / 180;
        const minuteX = centerX + Math.cos(minuteAngle) * (radius * 0.8);
        const minuteY = centerY + Math.sin(minuteAngle) * (radius * 0.8);
        
        renderer.fillStyle = this.selectedColor;
        renderer.beginPath();
        renderer.arc(minuteX, minuteY, 4, 0, Math.PI * 2);
        renderer.fill();
    }
}

// =============================================================================
// NUMBER INPUT COMPONENT
// =============================================================================

export class NumberInput extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 150,
            height: options.height || 40,
            ariaRole: 'spinbutton'
        });
        
        this.value = options.value || 0;
        this.min = options.min !== undefined ? options.min : -Infinity;
        this.max = options.max !== undefined ? options.max : Infinity;
        this.step = options.step || 1;
        this.precision = options.precision || 0;
        this.placeholder = options.placeholder || '';
        this.disabled = options.disabled || false;
        this.showControls = options.showControls !== false;
        
        // Visual styling
        this.backgroundColor = options.backgroundColor || '#ffffff';
        this.borderColor = options.borderColor || '#ced4da';
        this.focusColor = options.focusColor || '#007bff';
        this.textColor = options.textColor || '#495057';
        this.controlColor = options.controlColor || '#6c757d';
        
        // State
        this.isFocused = false;
        this.isEditing = false;
        this.editingValue = '';
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
        this.on('focus', () => this.handleFocus());
        this.on('blur', () => this.handleBlur());
        this.on('wheel', (event) => this.handleWheel(event));
    }
    
    // Value management
    setValue(value) {
        const numValue = parseFloat(value);
        if (isNaN(numValue)) return;
        
        this.value = this.clampValue(numValue);
        this.emit('valueChanged', { value: this.value });
    }
    
    clampValue(value) {
        return Math.max(this.min, Math.min(this.max, value));
    }
    
    formatValue(value) {
        if (this.precision > 0) {
            return value.toFixed(this.precision);
        }
        return Math.round(value).toString();
    }
    
    increment() {
        this.setValue(this.value + this.step);
    }
    
    decrement() {
        this.setValue(this.value - this.step);
    }
    
    // Event handlers
    handleClick(event) {
        if (this.disabled) return;
        
        const { localX, localY } = event;
        
        if (this.showControls && localX > this.width - 20) {
            // Spinner controls
            if (localY < this.height / 2) {
                this.increment();
            } else {
                this.decrement();
            }
        } else {
            // Start editing
            this.startEditing();
        }
    }
    
    handleKeyDown(event) {
        if (this.disabled) return;
        
        if (this.isEditing) {
            switch (event.key) {
                case 'Enter':
                    this.commitEdit();
                    break;
                case 'Escape':
                    this.cancelEdit();
                    break;
                case 'Backspace':
                    this.editingValue = this.editingValue.slice(0, -1);
                    break;
                default:
                    if (this.isValidInput(event.key)) {
                        this.editingValue += event.key;
                    }
            }
        } else {
            switch (event.key) {
                case 'ArrowUp':
                    this.increment();
                    break;
                case 'ArrowDown':
                    this.decrement();
                    break;
                case 'Enter':
                case ' ':
                    this.startEditing();
                    break;
            }
        }
    }
    
    handleFocus() {
        this.isFocused = true;
    }
    
    handleBlur() {
        this.isFocused = false;
        if (this.isEditing) {
            this.commitEdit();
        }
    }
    
    handleWheel(event) {
        if (this.disabled || !this.isFocused) return;
        
        event.preventDefault();
        
        if (event.deltaY < 0) {
            this.increment();
        } else {
            this.decrement();
        }
    }
    
    isValidInput(key) {
        const validChars = '0123456789.-';
        if (!validChars.includes(key)) return false;
        
        // Prevent multiple decimal points
        if (key === '.' && this.editingValue.includes('.')) return false;
        
        // Prevent multiple minus signs or minus in wrong position
        if (key === '-' && (this.editingValue.includes('-') || this.editingValue.length > 0)) return false;
        
        return true;
    }
    
    startEditing() {
        this.isEditing = true;
        this.editingValue = this.formatValue(this.value);
    }
    
    commitEdit() {
        const newValue = parseFloat(this.editingValue);
        if (!isNaN(newValue)) {
            this.setValue(newValue);
        }
        this.isEditing = false;
        this.editingValue = '';
    }
    
    cancelEdit() {
        this.isEditing = false;
        this.editingValue = '';
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Background
        renderer.fillStyle = this.disabled ? '#e9ecef' : this.backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        const borderColor = this.isFocused ? this.focusColor : this.borderColor;
        renderer.strokeStyle = borderColor;
        renderer.lineWidth = this.isFocused ? 2 : 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Value text
        const displayValue = this.isEditing ? this.editingValue : this.formatValue(this.value);
        const textColor = this.disabled ? '#6c757d' : this.textColor;
        
        renderer.fillStyle = textColor;
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText(displayValue || this.placeholder, 8, this.height / 2);
        
        // Spinner controls
        if (this.showControls) {
            this.renderSpinnerControls(renderer);
        }
        
        // Cursor
        if (this.isEditing && this.isFocused) {
            this.renderCursor(renderer, displayValue);
        }
    }
    
    renderSpinnerControls(renderer) {
        const controlWidth = 20;
        const controlX = this.width - controlWidth;
        
        // Separator line
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(controlX, 0);
        renderer.lineTo(controlX, this.height);
        renderer.stroke();
        
        // Up arrow
        renderer.fillStyle = this.controlColor;
        renderer.font = '10px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('▲', controlX + controlWidth / 2, this.height / 4);
        
        // Down arrow
        renderer.fillText('▼', controlX + controlWidth / 2, (this.height * 3) / 4);
    }
    
    renderCursor(renderer, text) {
        const textWidth = renderer.measureText(text).width;
        const cursorX = 8 + textWidth;
        
        renderer.strokeStyle = this.textColor;
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(cursorX, 8);
        renderer.lineTo(cursorX, this.height - 8);
        renderer.stroke();
    }
}

// =============================================================================
// DRAWER COMPONENT
// =============================================================================

export class Drawer extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 300,
            height: options.height || 600,
            ariaRole: 'dialog'
        });
        
        this.isOpen = options.isOpen || false;
        this.position = options.position || 'left'; // 'left', 'right', 'top', 'bottom'
        this.modal = options.modal !== false;
        this.persistent = options.persistent || false;
        this.title = options.title || '';
        this.content = options.content || '';
        
        // Animation
        this.animationDuration = options.animationDuration || 300;
        this.isAnimating = false;
        this.animationProgress = this.isOpen ? 1 : 0;
        
        // Visual styling
        this.backgroundColor = options.backgroundColor || '#ffffff';
        this.overlayColor = options.overlayColor || 'rgba(0, 0, 0, 0.5)';
        this.headerBackgroundColor = options.headerBackgroundColor || '#f8f9fa';
        this.borderColor = options.borderColor || '#dee2e6';
        this.textColor = options.textColor || '#333333';
        this.shadowColor = options.shadowColor || 'rgba(0, 0, 0, 0.1)';
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
    }
    
    // Drawer management
    open() {
        if (this.isOpen || this.isAnimating) return;
        
        this.isOpen = true;
        this.startAnimation('open');
        this.emit('drawerOpened');
    }
    
    close() {
        if (!this.isOpen || this.isAnimating) return;
        
        this.isOpen = false;
        this.startAnimation('close');
        this.emit('drawerClosed');
    }
    
    toggle() {
        if (this.isOpen) {
            this.close();
        } else {
            this.open();
        }
    }
    
    startAnimation(type) {
        this.isAnimating = true;
        this.animationType = type;
        this.animationStartTime = Date.now();
        this.animateDrawer();
    }
    
    animateDrawer() {
        const elapsed = Date.now() - this.animationStartTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);
        
        if (this.animationType === 'open') {
            this.animationProgress = this.easeOutCubic(progress);
        } else {
            this.animationProgress = 1 - this.easeOutCubic(progress);
        }
        
        if (progress >= 1) {
            this.isAnimating = false;
            this.animationProgress = this.isOpen ? 1 : 0;
        } else {
            requestAnimationFrame(() => this.animateDrawer());
        }
    }
    
    easeOutCubic(t) {
        return 1 - Math.pow(1 - t, 3);
    }
    
    getDrawerBounds() {
        const progress = this.animationProgress;
        
        switch (this.position) {
            case 'left':
                return {
                    x: -this.width + (this.width * progress),
                    y: 0,
                    width: this.width,
                    height: this.height
                };
            case 'right':
                return {
                    x: this.width - (this.width * progress),
                    y: 0,
                    width: this.width,
                    height: this.height
                };
            case 'top':
                return {
                    x: 0,
                    y: -this.height + (this.height * progress),
                    width: this.width,
                    height: this.height
                };
            case 'bottom':
                return {
                    x: 0,
                    y: this.height - (this.height * progress),
                    width: this.width,
                    height: this.height
                };
            default:
                return { x: 0, y: 0, width: this.width, height: this.height };
        }
    }
    
    // Event handlers
    handleClick(event) {
        const { localX, localY } = event;
        const bounds = this.getDrawerBounds();
        
        // Close button
        if (localY < 40 && localX > bounds.width - 40) {
            this.close();
            return;
        }
        
        // Click on overlay (if modal)
        if (this.modal && !this.persistent) {
            const isInsideDrawer = localX >= bounds.x && localX < bounds.x + bounds.width &&
                                  localY >= bounds.y && localY < bounds.y + bounds.height;
            
            if (!isInsideDrawer) {
                this.close();
            }
        }
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case 'Escape':
                if (!this.persistent) {
                    this.close();
                }
                break;
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        if (this.animationProgress <= 0) return;
        
        // Render overlay if modal
        if (this.modal) {
            this.renderOverlay(renderer);
        }
        
        // Render drawer
        this.renderDrawer(renderer);
    }
    
    renderOverlay(renderer) {
        const alpha = this.animationProgress * 0.5;
        renderer.fillStyle = `rgba(0, 0, 0, ${alpha})`;
        renderer.fillRect(0, 0, this.width * 2, this.height * 2); // Cover entire viewport
    }
    
    renderDrawer(renderer) {
        const bounds = this.getDrawerBounds();
        
        // Shadow
        renderer.shadowColor = this.shadowColor;
        renderer.shadowBlur = 10;
        renderer.shadowOffsetX = this.position === 'left' ? 2 : this.position === 'right' ? -2 : 0;
        renderer.shadowOffsetY = this.position === 'top' ? 2 : this.position === 'bottom' ? -2 : 0;
        
        // Drawer background
        renderer.fillStyle = this.backgroundColor;
        renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Reset shadow
        renderer.shadowColor = 'transparent';
        renderer.shadowBlur = 0;
        renderer.shadowOffsetX = 0;
        renderer.shadowOffsetY = 0;
        
        // Drawer border
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Header
        if (this.title) {
            this.renderHeader(renderer, bounds);
        }
        
        // Content
        this.renderContent(renderer, bounds);
    }
    
    renderHeader(renderer, bounds) {
        const headerHeight = 50;
        
        // Header background
        renderer.fillStyle = this.headerBackgroundColor;
        renderer.fillRect(bounds.x, bounds.y, bounds.width, headerHeight);
        
        // Header border
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(bounds.x, bounds.y + headerHeight);
        renderer.lineTo(bounds.x + bounds.width, bounds.y + headerHeight);
        renderer.stroke();
        
        // Title
        renderer.fillStyle = this.textColor;
        renderer.font = 'bold 16px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText(this.title, bounds.x + 16, bounds.y + headerHeight / 2);
        
        // Close button
        renderer.fillStyle = '#6c757d';
        renderer.font = '18px Arial';
        renderer.textAlign = 'center';
        renderer.fillText('×', bounds.x + bounds.width - 20, bounds.y + headerHeight / 2);
    }
    
    renderContent(renderer, bounds) {
        const contentY = bounds.y + (this.title ? 50 : 0);
        const contentHeight = bounds.height - (this.title ? 50 : 0);
        
        // Content text
        renderer.fillStyle = this.textColor;
        renderer.font = '14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'top';
        
        const lines = this.content.split('\n');
        lines.forEach((line, index) => {
            renderer.fillText(line, bounds.x + 16, contentY + 16 + index * 20);
        });
    }
}

// =============================================================================
// SEARCH BOX COMPONENT
// =============================================================================

export class SearchBox extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 300,
            height: options.height || 40,
            ariaRole: 'searchbox'
        });
        
        this.value = options.value || '';
        this.placeholder = options.placeholder || 'Search...';
        this.disabled = options.disabled || false;
        this.showClearButton = options.showClearButton !== false;
        this.showSearchButton = options.showSearchButton !== false;
        this.debounceDelay = options.debounceDelay || 300;
        
        // Search behavior
        this.searchOnType = options.searchOnType !== false;
        this.minSearchLength = options.minSearchLength || 1;
        this.suggestions = options.suggestions || [];
        this.showSuggestions = options.showSuggestions !== false;
        this.maxSuggestions = options.maxSuggestions || 5;
        
        // Visual styling
        this.backgroundColor = options.backgroundColor || '#ffffff';
        this.borderColor = options.borderColor || '#ced4da';
        this.focusColor = options.focusColor || '#007bff';
        this.textColor = options.textColor || '#495057';
        this.placeholderColor = options.placeholderColor || '#6c757d';
        this.suggestionBackgroundColor = options.suggestionBackgroundColor || '#f8f9fa';
        this.suggestionHoverColor = options.suggestionHoverColor || '#e9ecef';
        
        // State
        this.isFocused = false;
        this.showingSuggestions = false;
        this.filteredSuggestions = [];
        this.selectedSuggestionIndex = -1;
        this.debounceTimer = null;
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
        this.on('keyUp', (event) => this.handleKeyUp(event));
        this.on('focus', () => this.handleFocus());
        this.on('blur', () => this.handleBlur());
    }
    
    // Search functionality
    setValue(value) {
        this.value = value;
        this.updateSuggestions();
        this.emit('valueChanged', { value: this.value });
        
        if (this.searchOnType) {
            this.debouncedSearch();
        }
    }
    
    updateSuggestions() {
        if (!this.showSuggestions || this.value.length < this.minSearchLength) {
            this.filteredSuggestions = [];
            this.showingSuggestions = false;
            return;
        }
        
        const query = this.value.toLowerCase();
        this.filteredSuggestions = this.suggestions
            .filter(suggestion => suggestion.toLowerCase().includes(query))
            .slice(0, this.maxSuggestions);
        
        this.showingSuggestions = this.filteredSuggestions.length > 0;
        this.selectedSuggestionIndex = -1;
    }
    
    debouncedSearch() {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = setTimeout(() => {
            this.performSearch();
        }, this.debounceDelay);
    }
    
    performSearch() {
        if (this.value.length >= this.minSearchLength) {
            this.emit('search', { query: this.value });
        }
    }
    
    selectSuggestion(index) {
        if (index >= 0 && index < this.filteredSuggestions.length) {
            this.setValue(this.filteredSuggestions[index]);
            this.showingSuggestions = false;
            this.performSearch();
        }
    }
    
    clear() {
        this.setValue('');
        this.showingSuggestions = false;
    }
    
    // Event handlers
    handleClick(event) {
        if (this.disabled) return;
        
        const { localX, localY } = event;
        
        // Clear button
        if (this.showClearButton && this.value && localX > this.width - 60 && localX < this.width - 40) {
            this.clear();
            return;
        }
        
        // Search button
        if (this.showSearchButton && localX > this.width - 35) {
            this.performSearch();
            return;
        }
        
        // Suggestion selection
        if (this.showingSuggestions && localY > this.height) {
            const suggestionIndex = Math.floor((localY - this.height) / 30);
            if (suggestionIndex < this.filteredSuggestions.length) {
                this.selectSuggestion(suggestionIndex);
            }
            return;
        }
        
        // Focus the input
        this.isFocused = true;
    }
    
    handleKeyDown(event) {
        if (this.disabled) return;
        
        switch (event.key) {
            case 'Enter':
                if (this.selectedSuggestionIndex >= 0) {
                    this.selectSuggestion(this.selectedSuggestionIndex);
                } else {
                    this.performSearch();
                }
                break;
            case 'Escape':
                this.showingSuggestions = false;
                this.selectedSuggestionIndex = -1;
                break;
            case 'ArrowDown':
                if (this.showingSuggestions) {
                    this.selectedSuggestionIndex = Math.min(
                        this.selectedSuggestionIndex + 1,
                        this.filteredSuggestions.length - 1
                    );
                }
                break;
            case 'ArrowUp':
                if (this.showingSuggestions) {
                    this.selectedSuggestionIndex = Math.max(this.selectedSuggestionIndex - 1, -1);
                }
                break;
            case 'Backspace':
                if (this.value.length > 0) {
                    this.setValue(this.value.slice(0, -1));
                }
                break;
        }
    }
    
    handleKeyUp(event) {
        if (this.disabled) return;
        
        // Handle regular character input
        if (event.key.length === 1) {
            this.setValue(this.value + event.key);
        }
    }
    
    handleFocus() {
        this.isFocused = true;
        this.updateSuggestions();
    }
    
    handleBlur() {
        // Delay hiding suggestions to allow for clicks
        setTimeout(() => {
            this.isFocused = false;
            this.showingSuggestions = false;
        }, 150);
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        this.renderInputField(renderer);
        
        if (this.showingSuggestions) {
            this.renderSuggestions(renderer);
        }
    }
    
    renderInputField(renderer) {
        // Background
        renderer.fillStyle = this.disabled ? '#e9ecef' : this.backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        const borderColor = this.isFocused ? this.focusColor : this.borderColor;
        renderer.strokeStyle = borderColor;
        renderer.lineWidth = this.isFocused ? 2 : 1;
        renderer.strokeRect(0, 0, this.width, this.height);
        
        // Text content
        const displayText = this.value || this.placeholder;
        const textColor = this.value ? this.textColor : this.placeholderColor;
        
        renderer.fillStyle = this.disabled ? '#6c757d' : textColor;
        renderer.font = this.value ? '14px Arial' : 'italic 14px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        const maxTextWidth = this.width - 70; // Account for buttons
        const truncatedText = this.truncateText(renderer, displayText, maxTextWidth);
        renderer.fillText(truncatedText, 12, this.height / 2);
        
        // Search icon
        renderer.fillStyle = '#6c757d';
        renderer.font = '16px Arial';
        renderer.textAlign = 'left';
        renderer.fillText('🔍', 12, this.height / 2);
        
        // Clear button
        if (this.showClearButton && this.value) {
            renderer.fillStyle = '#6c757d';
            renderer.font = '14px Arial';
            renderer.textAlign = 'center';
            renderer.fillText('×', this.width - 50, this.height / 2);
        }
        
        // Search button
        if (this.showSearchButton) {
            renderer.fillStyle = this.focusColor;
            renderer.fillRect(this.width - 35, 2, 33, this.height - 4);
            
            renderer.fillStyle = '#ffffff';
            renderer.font = '12px Arial';
            renderer.textAlign = 'center';
            renderer.fillText('Go', this.width - 18, this.height / 2);
        }
        
        // Cursor
        if (this.isFocused) {
            this.renderCursor(renderer);
        }
    }
    
    renderSuggestions(renderer) {
        const startY = this.height;
        const suggestionHeight = 30;
        const totalHeight = this.filteredSuggestions.length * suggestionHeight;
        
        // Suggestions background
        renderer.fillStyle = this.suggestionBackgroundColor;
        renderer.fillRect(0, startY, this.width, totalHeight);
        
        // Suggestions border
        renderer.strokeStyle = this.borderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(0, startY, this.width, totalHeight);
        
        // Individual suggestions
        this.filteredSuggestions.forEach((suggestion, index) => {
            const y = startY + index * suggestionHeight;
            
            // Highlight selected suggestion
            if (index === this.selectedSuggestionIndex) {
                renderer.fillStyle = this.suggestionHoverColor;
                renderer.fillRect(0, y, this.width, suggestionHeight);
            }
            
            // Suggestion text
            renderer.fillStyle = this.textColor;
            renderer.font = '14px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            renderer.fillText(suggestion, 12, y + suggestionHeight / 2);
            
            // Separator line
            if (index < this.filteredSuggestions.length - 1) {
                renderer.strokeStyle = this.borderColor;
                renderer.lineWidth = 1;
                renderer.beginPath();
                renderer.moveTo(0, y + suggestionHeight);
                renderer.lineTo(this.width, y + suggestionHeight);
                renderer.stroke();
            }
        });
    }
    
    renderCursor(renderer) {
        const textWidth = renderer.measureText(this.value).width;
        const cursorX = 35 + textWidth; // Account for search icon
        
        renderer.strokeStyle = this.textColor;
        renderer.lineWidth = 1;
        renderer.beginPath();
        renderer.moveTo(cursorX, 8);
        renderer.lineTo(cursorX, this.height - 8);
        renderer.stroke();
    }
    
    truncateText(renderer, text, maxWidth) {
        const metrics = renderer.measureText(text);
        if (metrics.width <= maxWidth) {
            return text;
        }
        
        const ellipsis = '...';
        const ellipsisWidth = renderer.measureText(ellipsis).width;
        
        let truncated = text;
        while (renderer.measureText(truncated + ellipsis).width > maxWidth && truncated.length > 0) {
            truncated = truncated.slice(0, -1);
        }
        
        return truncated + ellipsis;
    }
}

// Export all components
export {
    ColorPicker,
    Accordion,
    DateTimePicker,
    NumberInput,
    Drawer,
    SearchBox
};

export default {
    ColorPicker,
    Accordion,
    DateTimePicker,
    NumberInput,
    Drawer,
    SearchBox
};
