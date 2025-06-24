/**
 * Additional High-Priority Components
 * Implementation of TabContainer, ProgressStepper, SplitPane, TreeView, and FileUpload
 */

import { BaseObject } from './enhanced-objects.js';

// =============================================================================
// TAB CONTAINER COMPONENT
// =============================================================================

export class TabContainer extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 600,
            height: options.height || 400,
            ariaRole: 'tablist'
        });
        
        this.tabs = options.tabs || [];
        this.activeTabIndex = options.activeTab || 0;
        this.tabHeight = options.tabHeight || 40;
        this.closeable = options.closeable !== false;
        this.reorderable = options.reorderable !== false;
        this.maxTabs = options.maxTabs || 20;
        
        // Visual styling
        this.tabBackgroundColor = options.tabBackgroundColor || '#f8f9fa';
        this.activeTabColor = options.activeTabColor || '#ffffff';
        this.tabBorderColor = options.tabBorderColor || '#dee2e6';
        this.contentBackgroundColor = options.contentBackgroundColor || '#ffffff';
        
        // State
        this.hoveredTabIndex = -1;
        this.draggedTabIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
        
        this.setupTabs();
    }
    
    setupTabs() {
        // Ensure we have at least one tab
        if (this.tabs.length === 0) {
            this.tabs.push({
                id: 'default',
                title: 'Tab 1',
                content: 'Default content',
                closeable: false
            });
        }
        
        // Normalize tab data
        this.tabs = this.tabs.map((tab, index) => ({
            id: tab.id || `tab-${index}`,
            title: tab.title || `Tab ${index + 1}`,
            content: tab.content || '',
            closeable: tab.closeable !== false && this.closeable,
            icon: tab.icon || null,
            badge: tab.badge || null,
            disabled: tab.disabled || false,
            ...tab
        }));
        
        // Clamp active tab index
        this.activeTabIndex = Math.max(0, Math.min(this.activeTabIndex, this.tabs.length - 1));
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('mouseMove', (event) => this.handleMouseMove(event));
        this.on('mouseDown', (event) => this.handleMouseDown(event));
        this.on('mouseUp', (event) => this.handleMouseUp(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
    }
    
    // Tab Management
    addTab(tabData, index = -1) {
        if (this.tabs.length >= this.maxTabs) {
            console.warn('Maximum number of tabs reached');
            return false;
        }
        
        const newTab = {
            id: tabData.id || `tab-${Date.now()}`,
            title: tabData.title || 'New Tab',
            content: tabData.content || '',
            closeable: tabData.closeable !== false && this.closeable,
            icon: tabData.icon || null,
            badge: tabData.badge || null,
            disabled: tabData.disabled || false,
            ...tabData
        };
        
        if (index >= 0 && index < this.tabs.length) {
            this.tabs.splice(index, 0, newTab);
            if (index <= this.activeTabIndex) {
                this.activeTabIndex++;
            }
        } else {
            this.tabs.push(newTab);
        }
        
        this.emit('tabAdded', { tab: newTab, index: this.tabs.length - 1 });
        return true;
    }
    
    removeTab(index) {
        if (index < 0 || index >= this.tabs.length || this.tabs.length <= 1) {
            return false;
        }
        
        const removedTab = this.tabs[index];
        if (!removedTab.closeable) {
            return false;
        }
        
        this.tabs.splice(index, 1);
        
        // Adjust active tab index
        if (index < this.activeTabIndex) {
            this.activeTabIndex--;
        } else if (index === this.activeTabIndex) {
            this.activeTabIndex = Math.min(this.activeTabIndex, this.tabs.length - 1);
        }
        
        this.emit('tabRemoved', { tab: removedTab, index });
        return true;
    }
    
    setActiveTab(index) {
        if (index >= 0 && index < this.tabs.length && !this.tabs[index].disabled) {
            const previousIndex = this.activeTabIndex;
            this.activeTabIndex = index;
            this.emit('tabChanged', { 
                previousIndex, 
                activeIndex: index, 
                tab: this.tabs[index] 
            });
        }
    }
    
    updateTab(index, updates) {
        if (index >= 0 && index < this.tabs.length) {
            Object.assign(this.tabs[index], updates);
            this.emit('tabUpdated', { index, tab: this.tabs[index], updates });
        }
    }
    
    // Event Handlers
    handleClick(event) {
        const { localX, localY } = event;
        
        if (localY <= this.tabHeight) {
            const tabIndex = this.getTabIndexFromX(localX);
            
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                const tab = this.tabs[tabIndex];
                const tabBounds = this.getTabBounds(tabIndex);
                
                // Check if clicking close button
                if (tab.closeable && localX >= tabBounds.x + tabBounds.width - 20) {
                    this.removeTab(tabIndex);
                } else if (!tab.disabled) {
                    this.setActiveTab(tabIndex);
                }
            }
        }
    }
    
    handleMouseMove(event) {
        const { localX, localY } = event;
        
        if (localY <= this.tabHeight) {
            this.hoveredTabIndex = this.getTabIndexFromX(localX);
        } else {
            this.hoveredTabIndex = -1;
        }
        
        // Handle tab dragging
        if (this.draggedTabIndex >= 0 && this.reorderable) {
            const newIndex = this.getTabIndexFromX(localX);
            if (newIndex >= 0 && newIndex !== this.draggedTabIndex) {
                this.reorderTab(this.draggedTabIndex, newIndex);
                this.draggedTabIndex = newIndex;
            }
        }
    }
    
    handleMouseDown(event) {
        const { localX, localY } = event;
        
        if (localY <= this.tabHeight && this.reorderable) {
            const tabIndex = this.getTabIndexFromX(localX);
            if (tabIndex >= 0 && tabIndex < this.tabs.length) {
                this.draggedTabIndex = tabIndex;
                this.dragOffset.x = localX - this.getTabBounds(tabIndex).x;
            }
        }
    }
    
    handleMouseUp(event) {
        this.draggedTabIndex = -1;
        this.dragOffset = { x: 0, y: 0 };
    }
    
    handleKeyDown(event) {
        switch (event.key) {
            case 'ArrowLeft':
                if (this.activeTabIndex > 0) {
                    this.setActiveTab(this.activeTabIndex - 1);
                }
                break;
            case 'ArrowRight':
                if (this.activeTabIndex < this.tabs.length - 1) {
                    this.setActiveTab(this.activeTabIndex + 1);
                }
                break;
            case 'Home':
                this.setActiveTab(0);
                break;
            case 'End':
                this.setActiveTab(this.tabs.length - 1);
                break;
            case 'Delete':
                if (this.tabs[this.activeTabIndex]?.closeable) {
                    this.removeTab(this.activeTabIndex);
                }
                break;
        }
    }
    
    // Utility Methods
    getTabIndexFromX(x) {
        const tabWidth = this.width / this.tabs.length;
        return Math.floor(x / tabWidth);
    }
    
    getTabBounds(index) {
        const tabWidth = this.width / this.tabs.length;
        return {
            x: index * tabWidth,
            y: 0,
            width: tabWidth,
            height: this.tabHeight
        };
    }
    
    reorderTab(fromIndex, toIndex) {
        if (fromIndex === toIndex) return;
        
        const tab = this.tabs.splice(fromIndex, 1)[0];
        this.tabs.splice(toIndex, 0, tab);
        
        // Update active tab index
        if (this.activeTabIndex === fromIndex) {
            this.activeTabIndex = toIndex;
        } else if (fromIndex < this.activeTabIndex && toIndex >= this.activeTabIndex) {
            this.activeTabIndex--;
        } else if (fromIndex > this.activeTabIndex && toIndex <= this.activeTabIndex) {
            this.activeTabIndex++;
        }
        
        this.emit('tabReordered', { fromIndex, toIndex, tab });
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        this.renderTabHeaders(renderer);
        this.renderActiveContent(renderer);
    }
    
    renderTabHeaders(renderer) {
        const tabWidth = this.width / this.tabs.length;
        
        this.tabs.forEach((tab, index) => {
            const bounds = this.getTabBounds(index);
            const isActive = index === this.activeTabIndex;
            const isHovered = index === this.hoveredTabIndex;
            
            // Tab background
            let backgroundColor = this.tabBackgroundColor;
            if (isActive) {
                backgroundColor = this.activeTabColor;
            } else if (isHovered) {
                backgroundColor = '#e9ecef';
            }
            
            renderer.fillStyle = backgroundColor;
            renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
            
            // Tab border
            renderer.strokeStyle = this.tabBorderColor;
            renderer.lineWidth = 1;
            renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.height);
            
            // Active tab indicator
            if (isActive) {
                renderer.fillStyle = '#007bff';
                renderer.fillRect(bounds.x, bounds.y + bounds.height - 3, bounds.width, 3);
            }
            
            // Tab content
            const contentX = bounds.x + 10;
            let textX = contentX;
            
            // Icon
            if (tab.icon) {
                renderer.fillStyle = tab.disabled ? '#999999' : '#333333';
                renderer.font = '14px Arial';
                renderer.textAlign = 'left';
                renderer.fillText(tab.icon, textX, bounds.y + bounds.height / 2 + 2);
                textX += 20;
            }
            
            // Title
            renderer.fillStyle = tab.disabled ? '#999999' : '#333333';
            renderer.font = isActive ? 'bold 12px Arial' : '12px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            
            const maxTextWidth = bounds.width - (textX - bounds.x) - 30;
            let title = tab.title;
            if (renderer.measureText(title).width > maxTextWidth) {
                while (renderer.measureText(title + '...').width > maxTextWidth && title.length > 0) {
                    title = title.slice(0, -1);
                }
                title += '...';
            }
            
            renderer.fillText(title, textX, bounds.y + bounds.height / 2);
            
            // Badge
            if (tab.badge) {
                const badgeX = bounds.x + bounds.width - 35;
                const badgeY = bounds.y + 5;
                
                renderer.fillStyle = '#dc3545';
                renderer.beginPath();
                renderer.arc(badgeX, badgeY, 8, 0, Math.PI * 2);
                renderer.fill();
                
                renderer.fillStyle = '#ffffff';
                renderer.font = 'bold 10px Arial';
                renderer.textAlign = 'center';
                renderer.fillText(tab.badge, badgeX, badgeY + 1);
            }
            
            // Close button
            if (tab.closeable) {
                const closeX = bounds.x + bounds.width - 15;
                const closeY = bounds.y + bounds.height / 2;
                
                renderer.fillStyle = isHovered ? '#dc3545' : '#666666';
                renderer.font = '12px Arial';
                renderer.textAlign = 'center';
                renderer.fillText('×', closeX, closeY);
            }
        });
    }
    
    renderActiveContent(renderer) {
        const contentY = this.tabHeight;
        const contentHeight = this.height - this.tabHeight;
        
        // Content background
        renderer.fillStyle = this.contentBackgroundColor;
        renderer.fillRect(0, contentY, this.width, contentHeight);
        
        // Content border
        renderer.strokeStyle = this.tabBorderColor;
        renderer.lineWidth = 1;
        renderer.strokeRect(0, contentY, this.width, contentHeight);
        
        // Active tab content
        if (this.activeTabIndex >= 0 && this.activeTabIndex < this.tabs.length) {
            const activeTab = this.tabs[this.activeTabIndex];
            
            if (typeof activeTab.content === 'string') {
                renderer.fillStyle = '#333333';
                renderer.font = '14px Arial';
                renderer.textAlign = 'left';
                renderer.textBaseline = 'top';
                renderer.fillText(activeTab.content, 20, contentY + 20);
            }
            // If content is a component/object, it should render itself
        }
    }
    
    // Public API
    getActiveTab() {
        return this.tabs[this.activeTabIndex];
    }
    
    getTabById(id) {
        return this.tabs.find(tab => tab.id === id);
    }
    
    getTabIndex(id) {
        return this.tabs.findIndex(tab => tab.id === id);
    }
}

// =============================================================================
// PROGRESS STEPPER COMPONENT
// =============================================================================

export class ProgressStepper extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 600,
            height: options.height || 80,
            ariaRole: 'progressbar'
        });
        
        this.steps = options.steps || [];
        this.currentStep = options.currentStep || 0;
        this.orientation = options.orientation || 'horizontal'; // 'horizontal' or 'vertical'
        this.allowStepClick = options.allowStepClick !== false;
        this.showStepNumbers = options.showStepNumbers !== false;
        this.showLabels = options.showLabels !== false;
        
        // Visual styling
        this.completedColor = options.completedColor || '#28a745';
        this.activeColor = options.activeColor || '#007bff';
        this.inactiveColor = options.inactiveColor || '#e9ecef';
        this.lineColor = options.lineColor || '#dee2e6';
        this.textColor = options.textColor || '#333333';
        
        this.setupSteps();
    }
    
    setupSteps() {
        // Normalize step data
        this.steps = this.steps.map((step, index) => ({
            id: step.id || `step-${index}`,
            title: step.title || `Step ${index + 1}`,
            description: step.description || '',
            completed: step.completed || false,
            disabled: step.disabled || false,
            icon: step.icon || null,
            optional: step.optional || false,
            ...step
        }));
        
        // Clamp current step
        this.currentStep = Math.max(0, Math.min(this.currentStep, this.steps.length - 1));
        
        this.on('click', (event) => this.handleClick(event));
    }
    
    // Step Management
    goToStep(stepIndex) {
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
            const step = this.steps[stepIndex];
            if (!step.disabled && (this.allowStepClick || stepIndex <= this.getLastCompletedStep() + 1)) {
                const previousStep = this.currentStep;
                this.currentStep = stepIndex;
                this.emit('stepChanged', { 
                    previousStep, 
                    currentStep: stepIndex, 
                    step: this.steps[stepIndex] 
                });
            }
        }
    }
    
    nextStep() {
        if (this.currentStep < this.steps.length - 1) {
            this.goToStep(this.currentStep + 1);
        }
    }
    
    previousStep() {
        if (this.currentStep > 0) {
            this.goToStep(this.currentStep - 1);
        }
    }
    
    completeStep(stepIndex = this.currentStep) {
        if (stepIndex >= 0 && stepIndex < this.steps.length) {
            this.steps[stepIndex].completed = true;
            this.emit('stepCompleted', { 
                stepIndex, 
                step: this.steps[stepIndex] 
            });
        }
    }
    
    getLastCompletedStep() {
        for (let i = this.steps.length - 1; i >= 0; i--) {
            if (this.steps[i].completed) {
                return i;
            }
        }
        return -1;
    }
    
    getStepStatus(index) {
        const step = this.steps[index];
        if (step.completed) return 'completed';
        if (index === this.currentStep) return 'active';
        if (step.disabled) return 'disabled';
        return 'inactive';
    }
    
    // Event Handlers
    handleClick(event) {
        if (!this.allowStepClick) return;
        
        const stepIndex = this.getStepIndexFromPosition(event.localX, event.localY);
        if (stepIndex >= 0) {
            this.goToStep(stepIndex);
        }
    }
    
    getStepIndexFromPosition(x, y) {
        if (this.orientation === 'horizontal') {
            const stepWidth = this.width / this.steps.length;
            const stepIndex = Math.floor(x / stepWidth);
            return stepIndex >= 0 && stepIndex < this.steps.length ? stepIndex : -1;
        } else {
            const stepHeight = this.height / this.steps.length;
            const stepIndex = Math.floor(y / stepHeight);
            return stepIndex >= 0 && stepIndex < this.steps.length ? stepIndex : -1;
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        if (this.orientation === 'horizontal') {
            this.renderHorizontalStepper(renderer);
        } else {
            this.renderVerticalStepper(renderer);
        }
    }
    
    renderHorizontalStepper(renderer) {
        const stepWidth = this.width / this.steps.length;
        const centerY = this.height / 2;
        const circleRadius = 15;
        const lineY = centerY;
        
        // Draw connecting lines
        for (let i = 0; i < this.steps.length - 1; i++) {
            const startX = (i + 1) * stepWidth - stepWidth / 2 + circleRadius;
            const endX = (i + 1) * stepWidth + stepWidth / 2 - circleRadius;
            
            const isCompleted = this.steps[i].completed && this.steps[i + 1].completed;
            renderer.strokeStyle = isCompleted ? this.completedColor : this.lineColor;
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.moveTo(startX, lineY);
            renderer.lineTo(endX, lineY);
            renderer.stroke();
        }
        
        // Draw steps
        this.steps.forEach((step, index) => {
            const centerX = (index + 0.5) * stepWidth;
            const status = this.getStepStatus(index);
            
            // Step circle
            let fillColor = this.inactiveColor;
            let strokeColor = this.inactiveColor;
            
            switch (status) {
                case 'completed':
                    fillColor = this.completedColor;
                    strokeColor = this.completedColor;
                    break;
                case 'active':
                    fillColor = this.activeColor;
                    strokeColor = this.activeColor;
                    break;
                case 'disabled':
                    fillColor = '#f8f9fa';
                    strokeColor = '#e9ecef';
                    break;
            }
            
            renderer.fillStyle = fillColor;
            renderer.strokeStyle = strokeColor;
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            renderer.fill();
            renderer.stroke();
            
            // Step content
            if (step.completed) {
                // Checkmark
                renderer.fillStyle = '#ffffff';
                renderer.font = 'bold 14px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText('✓', centerX, centerY);
            } else if (this.showStepNumbers) {
                // Step number
                renderer.fillStyle = status === 'active' ? '#ffffff' : '#666666';
                renderer.font = 'bold 12px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText((index + 1).toString(), centerX, centerY);
            } else if (step.icon) {
                // Icon
                renderer.fillStyle = status === 'active' ? '#ffffff' : '#666666';
                renderer.font = '14px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText(step.icon, centerX, centerY);
            }
            
            // Step label
            if (this.showLabels && step.title) {
                renderer.fillStyle = this.textColor;
                renderer.font = status === 'active' ? 'bold 11px Arial' : '11px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'top';
                renderer.fillText(step.title, centerX, centerY + circleRadius + 10);
            }
        });
    }
    
    renderVerticalStepper(renderer) {
        const stepHeight = this.height / this.steps.length;
        const centerX = 30;
        const circleRadius = 12;
        
        // Draw connecting lines
        for (let i = 0; i < this.steps.length - 1; i++) {
            const startY = (i + 1) * stepHeight - stepHeight / 2 + circleRadius;
            const endY = (i + 1) * stepHeight + stepHeight / 2 - circleRadius;
            
            const isCompleted = this.steps[i].completed && this.steps[i + 1].completed;
            renderer.strokeStyle = isCompleted ? this.completedColor : this.lineColor;
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.moveTo(centerX, startY);
            renderer.lineTo(centerX, endY);
            renderer.stroke();
        }
        
        // Draw steps
        this.steps.forEach((step, index) => {
            const centerY = (index + 0.5) * stepHeight;
            const status = this.getStepStatus(index);
            
            // Step circle (similar to horizontal)
            let fillColor = this.inactiveColor;
            let strokeColor = this.inactiveColor;
            
            switch (status) {
                case 'completed':
                    fillColor = this.completedColor;
                    strokeColor = this.completedColor;
                    break;
                case 'active':
                    fillColor = this.activeColor;
                    strokeColor = this.activeColor;
                    break;
                case 'disabled':
                    fillColor = '#f8f9fa';
                    strokeColor = '#e9ecef';
                    break;
            }
            
            renderer.fillStyle = fillColor;
            renderer.strokeStyle = strokeColor;
            renderer.lineWidth = 2;
            renderer.beginPath();
            renderer.arc(centerX, centerY, circleRadius, 0, Math.PI * 2);
            renderer.fill();
            renderer.stroke();
            
            // Step content (similar logic as horizontal)
            if (step.completed) {
                renderer.fillStyle = '#ffffff';
                renderer.font = 'bold 12px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText('✓', centerX, centerY);
            } else if (this.showStepNumbers) {
                renderer.fillStyle = status === 'active' ? '#ffffff' : '#666666';
                renderer.font = 'bold 10px Arial';
                renderer.textAlign = 'center';
                renderer.textBaseline = 'middle';
                renderer.fillText((index + 1).toString(), centerX, centerY);
            }
            
            // Step label
            if (this.showLabels && step.title) {
                renderer.fillStyle = this.textColor;
                renderer.font = status === 'active' ? 'bold 12px Arial' : '12px Arial';
                renderer.textAlign = 'left';
                renderer.textBaseline = 'middle';
                renderer.fillText(step.title, centerX + circleRadius + 15, centerY);
                
                // Description
                if (step.description) {
                    renderer.fillStyle = '#666666';
                    renderer.font = '10px Arial';
                    renderer.fillText(step.description, centerX + circleRadius + 15, centerY + 15);
                }
            }
        });
    }
    
    // Public API
    getCurrentStep() {
        return this.steps[this.currentStep];
    }
    
    getProgress() {
        const completedSteps = this.steps.filter(step => step.completed).length;
        return completedSteps / this.steps.length;
    }
    
    reset() {
        this.currentStep = 0;
        this.steps.forEach(step => {
            step.completed = false;
        });
        this.emit('reset');
    }
}

// =============================================================================
// SPLIT PANE COMPONENT
// =============================================================================

export class SplitPane extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 600,
            height: options.height || 400,
            ariaRole: 'separator'
        });
        
        this.orientation = options.orientation || 'horizontal'; // 'horizontal' or 'vertical'
        this.split = options.split || 0.5; // Split ratio (0.0 to 1.0)
        this.minSize = options.minSize || 50; // Minimum pane size in pixels
        this.splitterSize = options.splitterSize || 6; // Splitter thickness
        this.resizable = options.resizable !== false;
        this.collapsible = options.collapsible || false;
        
        // Pane content
        this.leftPane = options.leftPane || null; // Top pane for vertical
        this.rightPane = options.rightPane || null; // Bottom pane for vertical
        
        // Visual styling
        this.splitterColor = options.splitterColor || '#e9ecef';
        this.splitterHoverColor = options.splitterHoverColor || '#dee2e6';
        this.paneBackgroundColor = options.paneBackgroundColor || '#ffffff';
        
        // State
        this.isResizing = false;
        this.isHovering = false;
        this.startMousePos = 0;
        this.startSplit = 0;
        this.collapsed = null; // 'left', 'right', or null
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('mouseDown', (event) => this.handleMouseDown(event));
        this.on('mouseMove', (event) => this.handleMouseMove(event));
        this.on('mouseUp', (event) => this.handleMouseUp(event));
        this.on('dblclick', (event) => this.handleDoubleClick(event));
    }
    
    // Splitter Management
    getSplitterBounds() {
        if (this.orientation === 'horizontal') {
            const splitX = this.width * this.split;
            return {
                x: splitX - this.splitterSize / 2,
                y: 0,
                width: this.splitterSize,
                height: this.height
            };
        } else {
            const splitY = this.height * this.split;
            return {
                x: 0,
                y: splitY - this.splitterSize / 2,
                width: this.width,
                height: this.splitterSize
            };
        }
    }
    
    getLeftPaneBounds() {
        if (this.collapsed === 'left') {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        if (this.collapsed === 'right') {
            return { x: 0, y: 0, width: this.width, height: this.height };
        }
        
        if (this.orientation === 'horizontal') {
            const splitX = this.width * this.split;
            return {
                x: 0,
                y: 0,
                width: splitX - this.splitterSize / 2,
                height: this.height
            };
        } else {
            const splitY = this.height * this.split;
            return {
                x: 0,
                y: 0,
                width: this.width,
                height: splitY - this.splitterSize / 2
            };
        }
    }
    
    getRightPaneBounds() {
        if (this.collapsed === 'right') {
            return { x: 0, y: 0, width: 0, height: 0 };
        }
        if (this.collapsed === 'left') {
            return { x: 0, y: 0, width: this.width, height: this.height };
        }
        
        if (this.orientation === 'horizontal') {
            const splitX = this.width * this.split;
            return {
                x: splitX + this.splitterSize / 2,
                y: 0,
                width: this.width - splitX - this.splitterSize / 2,
                height: this.height
            };
        } else {
            const splitY = this.height * this.split;
            return {
                x: 0,
                y: splitY + this.splitterSize / 2,
                width: this.width,
                height: this.height - splitY - this.splitterSize / 2
            };
        }
    }
    
    isPointInSplitter(x, y) {
        const bounds = this.getSplitterBounds();
        return x >= bounds.x && x <= bounds.x + bounds.width &&
               y >= bounds.y && y <= bounds.y + bounds.height;
    }
    
    setSplit(ratio) {
        const maxDimension = this.orientation === 'horizontal' ? this.width : this.height;
        const minRatio = this.minSize / maxDimension;
        const maxRatio = 1 - (this.minSize + this.splitterSize) / maxDimension;
        
        this.split = Math.max(minRatio, Math.min(maxRatio, ratio));
        this.emit('splitChanged', { split: this.split });
    }
    
    collapse(pane) {
        if (!this.collapsible) return;
        
        if (pane === 'left' || pane === 'right') {
            this.collapsed = this.collapsed === pane ? null : pane;
            this.emit('paneCollapsed', { collapsed: this.collapsed });
        }
    }
    
    // Event Handlers
    handleMouseDown(event) {
        if (!this.resizable) return;
        
        const { localX, localY } = event;
        if (this.isPointInSplitter(localX, localY)) {
            this.isResizing = true;
            this.startMousePos = this.orientation === 'horizontal' ? localX : localY;
            this.startSplit = this.split;
            event.preventDefault?.();
        }
    }
    
    handleMouseMove(event) {
        const { localX, localY } = event;
        
        if (this.isResizing) {
            const currentPos = this.orientation === 'horizontal' ? localX : localY;
            const delta = currentPos - this.startMousePos;
            const maxDimension = this.orientation === 'horizontal' ? this.width : this.height;
            const deltaRatio = delta / maxDimension;
            
            this.setSplit(this.startSplit + deltaRatio);
        } else {
            this.isHovering = this.isPointInSplitter(localX, localY);
        }
    }
    
    handleMouseUp(event) {
        this.isResizing = false;
    }
    
    handleDoubleClick(event) {
        if (!this.collapsible) return;
        
        const { localX, localY } = event;
        if (this.isPointInSplitter(localX, localY)) {
            // Toggle collapse based on which side is smaller
            const leftBounds = this.getLeftPaneBounds();
            const rightBounds = this.getRightPaneBounds();
            
            if (this.orientation === 'horizontal') {
                this.collapse(leftBounds.width < rightBounds.width ? 'left' : 'right');
            } else {
                this.collapse(leftBounds.height < rightBounds.height ? 'left' : 'right');
            }
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        this.renderPanes(renderer);
        this.renderSplitter(renderer);
    }
    
    renderPanes(renderer) {
        const leftBounds = this.getLeftPaneBounds();
        const rightBounds = this.getRightPaneBounds();
        
        // Left/Top pane
        if (leftBounds.width > 0 && leftBounds.height > 0) {
            renderer.fillStyle = this.paneBackgroundColor;
            renderer.fillRect(leftBounds.x, leftBounds.y, leftBounds.width, leftBounds.height);
            
            renderer.strokeStyle = '#e9ecef';
            renderer.lineWidth = 1;
            renderer.strokeRect(leftBounds.x, leftBounds.y, leftBounds.width, leftBounds.height);
            
            // Render left pane content
            if (this.leftPane) {
                if (typeof this.leftPane === 'string') {
                    renderer.fillStyle = '#333333';
                    renderer.font = '14px Arial';
                    renderer.textAlign = 'left';
                    renderer.textBaseline = 'top';
                    renderer.fillText(this.leftPane, leftBounds.x + 10, leftBounds.y + 10);
                }
                // If leftPane is a component, it should handle its own rendering
            }
        }
        
        // Right/Bottom pane
        if (rightBounds.width > 0 && rightBounds.height > 0) {
            renderer.fillStyle = this.paneBackgroundColor;
            renderer.fillRect(rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
            
            renderer.strokeStyle = '#e9ecef';
            renderer.lineWidth = 1;
            renderer.strokeRect(rightBounds.x, rightBounds.y, rightBounds.width, rightBounds.height);
            
            // Render right pane content
            if (this.rightPane) {
                if (typeof this.rightPane === 'string') {
                    renderer.fillStyle = '#333333';
                    renderer.font = '14px Arial';
                    renderer.textAlign = 'left';
                    renderer.textBaseline = 'top';
                    renderer.fillText(this.rightPane, rightBounds.x + 10, rightBounds.y + 10);
                }
            }
        }
    }
    
    renderSplitter(renderer) {
        if (this.collapsed) return;
        
        const bounds = this.getSplitterBounds();
        const color = this.isHovering || this.isResizing ? this.splitterHoverColor : this.splitterColor;
        
        renderer.fillStyle = color;
        renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.height);
        
        // Splitter grip
        const gripColor = '#999999';
        renderer.fillStyle = gripColor;
        
        if (this.orientation === 'horizontal') {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            
            for (let i = -2; i <= 2; i++) {
                renderer.fillRect(centerX - 1, centerY + i * 4 - 1, 2, 2);
            }
        } else {
            const centerX = bounds.x + bounds.width / 2;
            const centerY = bounds.y + bounds.height / 2;
            
            for (let i = -2; i <= 2; i++) {
                renderer.fillRect(centerX + i * 4 - 1, centerY - 1, 2, 2);
            }
        }
    }
    
    // Public API
    setLeftPane(content) {
        this.leftPane = content;
        this.emit('paneChanged', { pane: 'left', content });
    }
    
    setRightPane(content) {
        this.rightPane = content;
        this.emit('paneChanged', { pane: 'right', content });
    }
    
    getSplit() {
        return this.split;
    }
    
    isCollapsed() {
        return this.collapsed;
    }
}

// =============================================================================
// TREE VIEW COMPONENT
// =============================================================================

export class TreeView extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 300,
            height: options.height || 400,
            ariaRole: 'tree'
        });
        
        this.data = options.data || [];
        this.selectedNode = options.selectedNode || null;
        this.expandedNodes = new Set(options.expandedNodes || []);
        this.multiSelect = options.multiSelect || false;
        this.selectedNodes = new Set();
        
        // Visual settings
        this.nodeHeight = options.nodeHeight || 24;
        this.indentSize = options.indentSize || 20;
        this.showIcons = options.showIcons !== false;
        this.showCheckboxes = options.showCheckboxes || false;
        
        // Colors
        this.backgroundColor = options.backgroundColor || '#ffffff';
        this.selectedColor = options.selectedColor || '#e3f2fd';
        this.hoverColor = options.hoverColor || '#f5f5f5';
        this.textColor = options.textColor || '#333333';
        this.iconColor = options.iconColor || '#666666';
        
        // State
        this.hoveredNode = null;
        this.scrollY = 0;
        this.visibleNodes = [];
        
        this.buildVisibleNodes();
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('mouseMove', (event) => this.handleMouseMove(event));
        this.on('keyDown', (event) => this.handleKeyDown(event));
        this.on('wheel', (event) => this.handleWheel(event));
    }
    
    // Tree Management
    buildVisibleNodes() {
        this.visibleNodes = [];
        this.buildVisibleNodesRecursive(this.data, 0);
    }
    
    buildVisibleNodesRecursive(nodes, level) {
        for (const node of nodes) {
            this.visibleNodes.push({
                ...node,
                level,
                id: node.id || `node-${this.visibleNodes.length}`
            });
            
            if (node.children && this.expandedNodes.has(node.id)) {
                this.buildVisibleNodesRecursive(node.children, level + 1);
            }
        }
    }
    
    getNodeAtPosition(y) {
        const adjustedY = y + this.scrollY;
        const nodeIndex = Math.floor(adjustedY / this.nodeHeight);
        return nodeIndex >= 0 && nodeIndex < this.visibleNodes.length ? 
               { node: this.visibleNodes[nodeIndex], index: nodeIndex } : null;
    }
    
    expandNode(nodeId) {
        this.expandedNodes.add(nodeId);
        this.buildVisibleNodes();
        this.emit('nodeExpanded', { nodeId });
    }
    
    collapseNode(nodeId) {
        this.expandedNodes.delete(nodeId);
        this.buildVisibleNodes();
        this.emit('nodeCollapsed', { nodeId });
    }
    
    toggleNode(nodeId) {
        if (this.expandedNodes.has(nodeId)) {
            this.collapseNode(nodeId);
        } else {
            this.expandNode(nodeId);
        }
    }
    
    selectNode(nodeId, addToSelection = false) {
        if (this.multiSelect && addToSelection) {
            if (this.selectedNodes.has(nodeId)) {
                this.selectedNodes.delete(nodeId);
            } else {
                this.selectedNodes.add(nodeId);
            }
        } else {
            this.selectedNodes.clear();
            this.selectedNodes.add(nodeId);
            this.selectedNode = nodeId;
        }
        
        this.emit('nodeSelected', { 
            nodeId, 
            selectedNodes: Array.from(this.selectedNodes) 
        });
    }
    
    findNode(nodeId, nodes = this.data) {
        for (const node of nodes) {
            if (node.id === nodeId) {
                return node;
            }
            if (node.children) {
                const found = this.findNode(nodeId, node.children);
                if (found) return found;
            }
        }
        return null;
    }
    
    // Event Handlers
    handleClick(event) {
        const { localY } = event;
        const result = this.getNodeAtPosition(localY);
        
        if (result) {
            const { node } = result;
            const x = node.level * this.indentSize;
            
            // Check if clicking on expand/collapse icon
            if (node.children && event.localX >= x && event.localX <= x + 16) {
                this.toggleNode(node.id);
            } else {
                this.selectNode(node.id, event.ctrlKey || event.metaKey);
            }
        }
    }
    
    handleMouseMove(event) {
        const result = this.getNodeAtPosition(event.localY);
        this.hoveredNode = result ? result.node.id : null;
    }
    
    handleKeyDown(event) {
        if (!this.selectedNode) return;
        
        const selectedIndex = this.visibleNodes.findIndex(n => n.id === this.selectedNode);
        if (selectedIndex === -1) return;
        
        switch (event.key) {
            case 'ArrowUp':
                if (selectedIndex > 0) {
                    this.selectNode(this.visibleNodes[selectedIndex - 1].id);
                }
                break;
            case 'ArrowDown':
                if (selectedIndex < this.visibleNodes.length - 1) {
                    this.selectNode(this.visibleNodes[selectedIndex + 1].id);
                }
                break;
            case 'ArrowRight':
                const node = this.visibleNodes[selectedIndex];
                if (node.children && !this.expandedNodes.has(node.id)) {
                    this.expandNode(node.id);
                }
                break;
            case 'ArrowLeft':
                const currentNode = this.visibleNodes[selectedIndex];
                if (currentNode.children && this.expandedNodes.has(currentNode.id)) {
                    this.collapseNode(currentNode.id);
                }
                break;
            case 'Enter':
            case ' ':
                this.emit('nodeActivated', { nodeId: this.selectedNode });
                break;
        }
    }
    
    handleWheel(event) {
        const maxScroll = Math.max(0, this.visibleNodes.length * this.nodeHeight - this.height);
        this.scrollY = Math.max(0, Math.min(maxScroll, this.scrollY + event.deltaY));
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Background
        renderer.fillStyle = this.backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Visible area clipping
        renderer.save();
        renderer.beginPath();
        renderer.rect(0, 0, this.width, this.height);
        renderer.clip();
        
        // Render visible nodes
        const startY = -this.scrollY;
        
        this.visibleNodes.forEach((node, index) => {
            const y = startY + index * this.nodeHeight;
            
            // Skip nodes that are outside visible area
            if (y + this.nodeHeight < 0 || y > this.height) return;
            
            this.renderNode(renderer, node, y);
        });
        
        renderer.restore();
        
        // Scrollbar
        if (this.visibleNodes.length * this.nodeHeight > this.height) {
            this.renderScrollbar(renderer);
        }
    }
    
    renderNode(renderer, node, y) {
        const x = node.level * this.indentSize;
        const isSelected = this.selectedNodes.has(node.id);
        const isHovered = this.hoveredNode === node.id;
        
        // Node background
        if (isSelected) {
            renderer.fillStyle = this.selectedColor;
            renderer.fillRect(0, y, this.width, this.nodeHeight);
        } else if (isHovered) {
            renderer.fillStyle = this.hoverColor;
            renderer.fillRect(0, y, this.width, this.nodeHeight);
        }
        
        // Expand/collapse icon
        if (node.children) {
            const iconX = x + 4;
            const iconY = y + this.nodeHeight / 2;
            const isExpanded = this.expandedNodes.has(node.id);
            
            renderer.fillStyle = this.iconColor;
            renderer.font = '12px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(isExpanded ? '▼' : '▶', iconX, iconY);
        }
        
        // Node icon
        let textX = x + 20;
        if (this.showIcons && node.icon) {
            renderer.fillStyle = this.iconColor;
            renderer.font = '14px Arial';
            renderer.textAlign = 'left';
            renderer.textBaseline = 'middle';
            renderer.fillText(node.icon, textX, y + this.nodeHeight / 2);
            textX += 20;
        }
        
        // Checkbox
        if (this.showCheckboxes) {
            const checkboxX = textX;
            const checkboxY = y + (this.nodeHeight - 12) / 2;
            
            renderer.strokeStyle = '#999999';
            renderer.lineWidth = 1;
            renderer.strokeRect(checkboxX, checkboxY, 12, 12);
            
            if (isSelected) {
                renderer.fillStyle = '#007bff';
                renderer.fillRect(checkboxX + 2, checkboxY + 2, 8, 8);
            }
            
            textX += 20;
        }
        
        // Node text
        renderer.fillStyle = this.textColor;
        renderer.font = `${isSelected ? 'bold ' : ''}13px Arial`;
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        renderer.fillText(node.label || node.title || node.name || node.id, 
                         textX, y + this.nodeHeight / 2);
    }
    
    renderScrollbar(renderer) {
        const scrollbarWidth = 8;
        const scrollbarX = this.width - scrollbarWidth;
        
        // Scrollbar track
        renderer.fillStyle = '#f0f0f0';
        renderer.fillRect(scrollbarX, 0, scrollbarWidth, this.height);
        
        // Scrollbar thumb
        const totalHeight = this.visibleNodes.length * this.nodeHeight;
        const thumbHeight = Math.max(20, (this.height / totalHeight) * this.height);
        const thumbY = (this.scrollY / (totalHeight - this.height)) * (this.height - thumbHeight);
        
        renderer.fillStyle = '#c0c0c0';
        renderer.fillRect(scrollbarX + 1, thumbY, scrollbarWidth - 2, thumbHeight);
    }
    
    // Public API
    setData(data) {
        this.data = data;
        this.buildVisibleNodes();
        this.emit('dataChanged');
    }
    
    getSelectedNodes() {
        return Array.from(this.selectedNodes);
    }
    
    expandAll() {
        const expandAllRecursive = (nodes) => {
            for (const node of nodes) {
                if (node.children) {
                    this.expandedNodes.add(node.id);
                    expandAllRecursive(node.children);
                }
            }
        };
        
        expandAllRecursive(this.data);
        this.buildVisibleNodes();
        this.emit('allExpanded');
    }
    
    collapseAll() {
        this.expandedNodes.clear();
        this.buildVisibleNodes();
        this.emit('allCollapsed');
    }
}

// =============================================================================
// FILE UPLOAD COMPONENT
// =============================================================================

export class FileUpload extends BaseObject {
    constructor(options = {}) {
        super({
            ...options,
            width: options.width || 400,
            height: options.height || 200,
            ariaRole: 'button'
        });
        
        this.multiple = options.multiple || false;
        this.accept = options.accept || '*/*'; // MIME types or file extensions
        this.maxFileSize = options.maxFileSize || 10 * 1024 * 1024; // 10MB default
        this.maxFiles = options.maxFiles || this.multiple ? 10 : 1;
        this.disabled = options.disabled || false;
        
        // Visual styling
        this.backgroundColor = options.backgroundColor || '#f8f9fa';
        this.borderColor = options.borderColor || '#dee2e6';
        this.dragOverColor = options.dragOverColor || '#e3f2fd';
        this.textColor = options.textColor || '#333333';
        this.iconColor = options.iconColor || '#6c757d';
        
        // Messages
        this.uploadText = options.uploadText || 'Drop files here or click to upload';
        this.browseText = options.browseText || 'Browse Files';
        
        // State
        this.files = [];
        this.isDragOver = false;
        this.isUploading = false;
        this.uploadProgress = 0;
        
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        this.on('click', (event) => this.handleClick(event));
        this.on('dragEnter', (event) => this.handleDragEnter(event));
        this.on('dragOver', (event) => this.handleDragOver(event));
        this.on('dragLeave', (event) => this.handleDragLeave(event));
        this.on('drop', (event) => this.handleDrop(event));
    }
    
    // File Management
    addFiles(fileList) {
        const newFiles = Array.from(fileList);
        
        // Validate files
        const validFiles = newFiles.filter(file => this.validateFile(file));
        
        if (!this.multiple) {
            this.files = validFiles.slice(0, 1);
        } else {
            this.files = [...this.files, ...validFiles].slice(0, this.maxFiles);
        }
        
        this.emit('filesAdded', { files: validFiles });
        
        if (validFiles.length !== newFiles.length) {
            this.emit('filesRejected', { 
                rejected: newFiles.filter(f => !this.validateFile(f)) 
            });
        }
    }
    
    validateFile(file) {
        // Size validation
        if (file.size > this.maxFileSize) {
            return false;
        }
        
        // Type validation
        if (this.accept !== '*/*') {
            const acceptedTypes = this.accept.split(',').map(type => type.trim());
            const isAccepted = acceptedTypes.some(type => {
                if (type.startsWith('.')) {
                    // File extension
                    return file.name.toLowerCase().endsWith(type.toLowerCase());
                } else {
                    // MIME type
                    return file.type === type || file.type.startsWith(type.replace('*', ''));
                }
            });
            
            if (!isAccepted) {
                return false;
            }
        }
        
        return true;
    }
    
    removeFile(index) {
        if (index >= 0 && index < this.files.length) {
            const removedFile = this.files.splice(index, 1)[0];
            this.emit('fileRemoved', { file: removedFile, index });
        }
    }
    
    clearFiles() {
        this.files = [];
        this.emit('filesCleared');
    }
    
    startUpload() {
        if (this.files.length === 0 || this.isUploading) return;
        
        this.isUploading = true;
        this.uploadProgress = 0;
        this.emit('uploadStarted', { files: this.files });
        
        // Simulate upload progress (in real implementation, this would be actual upload)
        this.simulateUpload();
    }
    
    simulateUpload() {
        const interval = setInterval(() => {
            this.uploadProgress += Math.random() * 0.1;
            
            if (this.uploadProgress >= 1) {
                this.uploadProgress = 1;
                this.isUploading = false;
                clearInterval(interval);
                this.emit('uploadCompleted', { files: this.files });
            } else {
                this.emit('uploadProgress', { progress: this.uploadProgress });
            }
        }, 100);
    }
    
    // Event Handlers
    handleClick(event) {
        if (this.disabled) return;
        
        // In a real implementation, this would trigger a file picker dialog
        this.emit('browseRequested');
    }
    
    handleDragEnter(event) {
        if (this.disabled) return;
        
        event.preventDefault?.();
        this.isDragOver = true;
    }
    
    handleDragOver(event) {
        if (this.disabled) return;
        
        event.preventDefault?.();
        this.isDragOver = true;
    }
    
    handleDragLeave(event) {
        if (this.disabled) return;
        
        this.isDragOver = false;
    }
    
    handleDrop(event) {
        if (this.disabled) return;
        
        event.preventDefault?.();
        this.isDragOver = false;
        
        if (event.dataTransfer?.files) {
            this.addFiles(event.dataTransfer.files);
        }
    }
    
    // Rendering
    renderSelf(renderer) {
        if (renderer.type !== 'canvas') return;
        
        // Background
        let backgroundColor = this.backgroundColor;
        if (this.isDragOver) {
            backgroundColor = this.dragOverColor;
        } else if (this.disabled) {
            backgroundColor = '#f8f9fa';
        }
        
        renderer.fillStyle = backgroundColor;
        renderer.fillRect(0, 0, this.width, this.height);
        
        // Border
        renderer.strokeStyle = this.isDragOver ? '#007bff' : this.borderColor;
        renderer.lineWidth = this.isDragOver ? 2 : 1;
        renderer.setLineDash(this.isDragOver ? [5, 5] : []);
        renderer.strokeRect(0, 0, this.width, this.height);
        renderer.setLineDash([]);
        
        if (this.files.length === 0) {
            this.renderEmptyState(renderer);
        } else {
            this.renderFileList(renderer);
        }
        
        if (this.isUploading) {
            this.renderUploadProgress(renderer);
        }
    }
    
    renderEmptyState(renderer) {
        const centerX = this.width / 2;
        const centerY = this.height / 2;
        
        // Upload icon
        renderer.fillStyle = this.iconColor;
        renderer.font = '48px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText('📁', centerX, centerY - 30);
        
        // Upload text
        renderer.fillStyle = this.disabled ? '#999999' : this.textColor;
        renderer.font = '14px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'middle';
        renderer.fillText(this.uploadText, centerX, centerY + 10);
        
        // Browse button
        if (!this.disabled) {
            const buttonWidth = 120;
            const buttonHeight = 32;
            const buttonX = centerX - buttonWidth / 2;
            const buttonY = centerY + 30;
            
            renderer.fillStyle = '#007bff';
            renderer.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);
            
            renderer.fillStyle = '#ffffff';
            renderer.font = '12px Arial';
            renderer.textAlign = 'center';
            renderer.textBaseline = 'middle';
            renderer.fillText(this.browseText, centerX, buttonY + buttonHeight / 2);
        }
    }
    
    renderFileList(renderer) {
        const itemHeight = 30;
        const startY = 10;
        
        renderer.fillStyle = this.textColor;
        renderer.font = '12px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';
        
        this.files.forEach((file, index) => {
            const y = startY + index * itemHeight;
            
            // File icon
            renderer.fillText('📄', 10, y + itemHeight / 2);
            
            // File name
            renderer.fillText(file.name, 35, y + itemHeight / 2);
            
            // File size
            const sizeText = this.formatFileSize(file.size);
            renderer.fillStyle = '#666666';
            renderer.textAlign = 'right';
            renderer.fillText(sizeText, this.width - 50, y + itemHeight / 2);
            
            // Remove button
            renderer.fillStyle = '#dc3545';
            renderer.textAlign = 'center';
            renderer.fillText('×', this.width - 20, y + itemHeight / 2);
            
            renderer.fillStyle = this.textColor;
            renderer.textAlign = 'left';
        });
    }
    
    renderUploadProgress(renderer) {
        const progressHeight = 4;
        const progressY = this.height - progressHeight - 10;
        
        // Progress background
        renderer.fillStyle = '#e9ecef';
        renderer.fillRect(10, progressY, this.width - 20, progressHeight);
        
        // Progress bar
        renderer.fillStyle = '#007bff';
        renderer.fillRect(10, progressY, (this.width - 20) * this.uploadProgress, progressHeight);
        
        // Progress text
        renderer.fillStyle = this.textColor;
        renderer.font = '11px Arial';
        renderer.textAlign = 'center';
        renderer.textBaseline = 'bottom';
        renderer.fillText(
            `Uploading... ${Math.round(this.uploadProgress * 100)}%`,
            this.width / 2,
            progressY - 5
        );
    }
    
    // Utility Methods
    formatFileSize(bytes) {
        if (bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    // Public API
    getFiles() {
        return [...this.files];
    }
    
    setAccept(accept) {
        this.accept = accept;
    }
    
    setMaxFileSize(size) {
        this.maxFileSize = size;
    }
    
    getUploadProgress() {
        return this.uploadProgress;
    }
}

// Export all components
export {
    TabContainer,
    ProgressStepper,
    SplitPane,
    TreeView,
    FileUpload
};

export default {
    TabContainer,
    ProgressStepper,
    SplitPane,
    TreeView,
    FileUpload
};
