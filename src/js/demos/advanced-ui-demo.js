/**
 * Advanced UI Components Demo - Comprehensive demonstration of enhanced Interactive Object System
 * Showcases modal dialogs, navigation menus, data visualization, forms, tooltips, and more
 */

import VisualEngine from '../core/visual-engine.js';
// Commented out unused imports for now
// import { Button, Slider, Meter, Label } from '../objects/interactive-objects.js';
// import { ModalDialog, NavigationMenu, Chart, FormField, Tooltip } from '../objects/advanced-ui-components.js';

export class AdvancedUIDemo {
    constructor(container, options = {}) {
        this.container = container;
        this.options = {
            title: 'Advanced UI Components Demo',
            description: 'Complete demonstration of SimulateAI\'s enhanced Interactive Object System',
            debug: true,
            ...options
        };
        
        this.engine = null;
        this.components = new Map();
        this.demoData = this.generateDemoData();
        
        this.init();
    }

    async init() {
        console.log('AdvancedUIDemo: Initializing...');
        
        this.setupEngine();
        this.createDemoLayout();
        this.createNavigationMenu();
        this.createModalDialogs();
        this.createChartComponents();
        this.createFormComponents();
        this.createTooltipSystem();
        this.setupInteractivity();
        
        console.log('AdvancedUIDemo: Ready - Showcasing all advanced UI components');
    }

    setupEngine() {
        this.engine = new VisualEngine(this.container, {
            renderMode: 'auto',
            accessibility: true,
            debug: this.options.debug,
            width: 1200,
            height: 800
        });
    }

    generateDemoData() {
        return {
            chartData: {
                line: [[10, 20, 15, 25, 30, 20, 35], [5, 15, 25, 20, 15, 30, 25]],
                bar: [25, 45, 30, 55, 40, 60, 35],
                pie: [30, 25, 20, 15, 10],
                labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']
            },
            formData: {
                ethics: 75,
                fairness: 85,
                transparency: 70,
                accountability: 90
            },
            navigation: [
                { text: 'Dashboard', icon: '📊', action: () => this.showDashboard() },
                { text: 'Analytics', icon: '📈', action: () => this.showAnalytics() },
                { text: 'Settings', icon: '⚙️', action: () => this.showSettings() },
                { text: 'Help', icon: '❓', action: () => this.showHelp() }
            ]
        };
    }

    createDemoLayout() {
        // Title and description
        const titleLabel = this.engine.createComponent('label', {
            x: 20,
            y: 20,
            text: this.options.title,
            font: '28px Arial',
            textColor: '#2c3e50'
        });
        this.components.set('title', titleLabel);

        const descLabel = this.engine.createComponent('label', {
            x: 20,
            y: 55,
            text: this.options.description,
            font: '16px Arial',
            textColor: '#7f8c8d'
        });
        this.components.set('description', descLabel);

        // Create section dividers
        this.createSectionDivider('Navigation Menu Demo', 90);
        this.createSectionDivider('Modal Dialog Demo', 180);
        this.createSectionDivider('Data Visualization Demo', 270);
        this.createSectionDivider('Form Components Demo', 450);
        this.createSectionDivider('Tooltip System Demo', 600);
    }

    createSectionDivider(title, y) {
        const label = this.engine.createComponent('label', {
            x: 20,
            y,
            text: title,
            font: 'bold 18px Arial',
            textColor: '#34495e'
        });
        
        // Add visual separator line (using a meter as a line)
        const line = this.engine.createComponent('meter', {
            x: 20,
            y: y + 25,
            width: 1160,
            height: 2,
            value: 100,
            fillColor: '#ecf0f1',
            stroke: 'none'
        });
        
        return { label, line };
    }

    createNavigationMenu() {
        // Horizontal navigation menu
        const navMenu = this.engine.createComponent('navigation-menu', {
            x: 20,
            y: 120,
            width: 400,
            height: 50,
            orientation: 'horizontal',
            items: this.demoData.navigation
        });
        
        this.components.set('navMenu', navMenu);

        // Vertical navigation menu example
        const verticalNav = this.engine.createComponent('navigation-menu', {
            x: 450,
            y: 120,
            width: 200,
            height: 200,
            orientation: 'vertical',
            items: [
                { text: 'Home', icon: '🏠' },
                { text: 'Profile', icon: '👤' },
                { text: 'Messages', icon: '📧' },
                { text: 'Notifications', icon: '🔔' },
                { text: 'Logout', icon: '🚪' }
            ]
        });
        
        this.components.set('verticalNav', verticalNav);
    }

    createModalDialogs() {
        // Button to trigger info modal
        const infoModalBtn = this.engine.createComponent('button', {
            x: 20,
            y: 210,
            width: 120,
            height: 40,
            text: 'Show Info',
            onClick: () => this.showInfoModal()
        });
        
        // Button to trigger confirmation modal
        const confirmModalBtn = this.engine.createComponent('button', {
            x: 150,
            y: 210,
            width: 140,
            height: 40,
            text: 'Show Confirm',
            onClick: () => this.showConfirmModal()
        });

        // Button to trigger form modal
        const formModalBtn = this.engine.createComponent('button', {
            x: 300,
            y: 210,
            width: 120,
            height: 40,
            text: 'Show Form',
            onClick: () => this.showFormModal()
        });

        this.components.set('infoModalBtn', infoModalBtn);
        this.components.set('confirmModalBtn', confirmModalBtn);
        this.components.set('formModalBtn', formModalBtn);
    }

    createChartComponents() {
        // Line chart
        const lineChart = this.engine.createComponent('chart', {
            x: 20,
            y: 300,
            width: 350,
            height: 120,
            type: 'line',
            data: this.demoData.chartData.line,
            labels: this.demoData.chartData.labels,
            title: 'Performance Trends',
            colors: ['#3498db', '#e74c3c']
        });

        // Bar chart
        const barChart = this.engine.createComponent('chart', {
            x: 390,
            y: 300,
            width: 350,
            height: 120,
            type: 'bar',
            data: [this.demoData.chartData.bar],
            labels: this.demoData.chartData.labels,
            title: 'Monthly Statistics',
            colors: ['#2ecc71']
        });

        // Pie chart
        const pieChart = this.engine.createComponent('chart', {
            x: 760,
            y: 300,
            width: 200,
            height: 120,
            type: 'pie',
            data: this.demoData.chartData.pie,
            labels: ['AI Ethics', 'Fairness', 'Privacy', 'Safety', 'Other'],
            title: 'AI Concerns'
        });

        this.components.set('lineChart', lineChart);
        this.components.set('barChart', barChart);
        this.components.set('pieChart', pieChart);

        // Chart control buttons
        this.createChartControls();
    }

    createChartControls() {
        const updateBtn = this.engine.createComponent('button', {
            x: 1000,
            y: 300,
            width: 100,
            height: 35,
            text: 'Update Data',
            onClick: () => this.updateChartData()
        });

        const resetBtn = this.engine.createComponent('button', {
            x: 1000,
            y: 345,
            width: 100,
            height: 35,
            text: 'Reset Charts',
            onClick: () => this.resetChartData()
        });

        this.components.set('updateChartsBtn', updateBtn);
        this.components.set('resetChartsBtn', resetBtn);
    }

    createFormComponents() {
        // Ethics sliders with live feedback
        const ethicsSlider = this.engine.createComponent('slider', {
            x: 20,
            y: 480,
            width: 200,
            height: 20,
            min: 0,
            max: 100,
            value: this.demoData.formData.ethics,
            onChange: (value) => this.updateEthicsValue('ethics', value)
        });

        const fairnessSlider = this.engine.createComponent('slider', {
            x: 250,
            y: 480,
            width: 200,
            height: 20,
            min: 0,
            max: 100,
            value: this.demoData.formData.fairness,
            onChange: (value) => this.updateEthicsValue('fairness', value)
        });

        // Form field examples
        const nameField = this.engine.createComponent('form-field', {
            x: 500,
            y: 480,
            width: 200,
            height: 35,
            type: 'text',
            placeholder: 'Enter your name',
            label: 'Name'
        });

        const emailField = this.engine.createComponent('form-field', {
            x: 720,
            y: 480,
            width: 200,
            height: 35,
            type: 'email',
            placeholder: 'Enter email address',
            label: 'Email'
        });

        // Labels for sliders
        const ethicsLabel = this.engine.createComponent('label', {
            x: 20,
            y: 465,
            text: `Ethics: ${this.demoData.formData.ethics}%`,
            font: '12px Arial'
        });

        const fairnessLabel = this.engine.createComponent('label', {
            x: 250,
            y: 465,
            text: `Fairness: ${this.demoData.formData.fairness}%`,
            font: '12px Arial'
        });

        this.components.set('ethicsSlider', ethicsSlider);
        this.components.set('fairnessSlider', fairnessSlider);
        this.components.set('nameField', nameField);
        this.components.set('emailField', emailField);
        this.components.set('ethicsLabel', ethicsLabel);
        this.components.set('fairnessLabel', fairnessLabel);

        // Form submit button
        const submitBtn = this.engine.createComponent('button', {
            x: 940,
            y: 480,
            width: 100,
            height: 35,
            text: 'Submit Form',
            onClick: () => this.submitForm()
        });
        this.components.set('submitBtn', submitBtn);
    }

    createTooltipSystem() {
        // Create interactive elements with tooltips
        const tooltipBtn1 = this.engine.createComponent('button', {
            x: 20,
            y: 630,
            width: 120,
            height: 40,
            text: 'Hover for Tip',
            onMouseEnter: () => this.showTooltip('This button demonstrates tooltip functionality', tooltipBtn1),
            onMouseLeave: () => this.hideTooltip()
        });

        const tooltipBtn2 = this.engine.createComponent('button', {
            x: 160,
            y: 630,
            width: 120,
            height: 40,
            text: 'Info Button',
            onMouseEnter: () => this.showTooltip('Additional information appears here', tooltipBtn2),
            onMouseLeave: () => this.hideTooltip()
        });

        const helpBtn = this.engine.createComponent('button', {
            x: 300,
            y: 630,
            width: 100,
            height: 40,
            text: 'Help',
            onMouseEnter: () => this.showTooltip('Get help and support information', helpBtn),
            onMouseLeave: () => this.hideTooltip()
        });

        this.components.set('tooltipBtn1', tooltipBtn1);
        this.components.set('tooltipBtn2', tooltipBtn2);
        this.components.set('helpBtn', helpBtn);

        // Create tooltip component (initially hidden)
        this.currentTooltip = this.engine.createComponent('tooltip', {
            content: '',
            position: 'top',
            showDelay: 300,
            hideDelay: 100
        });
        this.currentTooltip.hide();
    }

    setupInteractivity() {
        // Add keyboard shortcuts
        document.addEventListener('keydown', (event) => {
            switch(event.key) {
                case 'h':
                    if (event.ctrlKey) {
                        this.showHelp();
                        event.preventDefault();
                    }
                    break;
                case 'r':
                    if (event.ctrlKey) {
                        this.resetDemo();
                        event.preventDefault();
                    }
                    break;
                case 'Escape':
                    this.hideAllModals();
                    break;
            }
        });

        // Add demo status display
        this.createStatusDisplay();
    }

    createStatusDisplay() {
        const statusLabel = this.engine.createComponent('label', {
            x: 20,
            y: 750,
            text: 'Demo Status: Ready | Keyboard: Ctrl+H (Help), Ctrl+R (Reset), Esc (Close Modals)',
            font: '12px Arial',
            textColor: '#95a5a6'
        });
        this.components.set('statusLabel', statusLabel);
    }

    // Modal Dialog Methods
    showInfoModal() {
        const modal = this.engine.createComponent('modal-dialog', {
            title: 'Information',
            content: `
                <h3>Advanced UI Components Demo</h3>
                <p>This demonstration showcases the enhanced Interactive Object System for SimulateAI, featuring:</p>
                <ul>
                    <li>Modal dialogs with accessibility support</li>
                    <li>Navigation menus (horizontal and vertical)</li>
                    <li>Data visualization components (line, bar, pie charts)</li>
                    <li>Form components with validation</li>
                    <li>Tooltip system with positioning</li>
                    <li>Component registry and management</li>
                </ul>
                <p>All components are designed with accessibility, responsiveness, and performance in mind.</p>
            `,
            buttons: [
                { text: 'Got it!', action: 'close', variant: 'primary' }
            ]
        });
        modal.open();
    }

    showConfirmModal() {
        const modal = this.engine.createComponent('modal-dialog', {
            title: 'Confirm Action',
            content: `
                <p>Are you sure you want to reset all demo data?</p>
                <p>This will:</p>
                <ul>
                    <li>Reset all chart data to default values</li>
                    <li>Clear all form inputs</li>
                    <li>Return sliders to initial positions</li>
                </ul>
            `,
            buttons: [
                { 
                    text: 'Cancel', 
                    action: 'close', 
                    variant: 'secondary' 
                },
                { 
                    text: 'Reset Demo', 
                    callback: () => { 
                        this.resetDemo(); 
                        modal.close();
                    }, 
                    variant: 'danger' 
                }
            ]
        });
        modal.open();
    }

    showFormModal() {
        const modal = this.engine.createComponent('modal-dialog', {
            title: 'AI Ethics Assessment',
            content: `
                <form id="ethics-form">
                    <div class="form-group">
                        <label for="scenario">Scenario Type:</label>
                        <select id="scenario" name="scenario">
                            <option value="hiring">Hiring Algorithm</option>
                            <option value="lending">Credit Scoring</option>
                            <option value="healthcare">Medical Diagnosis</option>
                            <option value="criminal">Criminal Justice</option>
                        </select>
                    </div>
                    <div class="form-group">
                        <label for="impact">Impact Assessment:</label>
                        <textarea id="impact" name="impact" placeholder="Describe potential impacts..."></textarea>
                    </div>
                    <div class="form-group">
                        <label>
                            <input type="checkbox" name="review" id="review">
                            I have reviewed the ethical implications
                        </label>
                    </div>
                </form>
            `,
            buttons: [
                { text: 'Cancel', action: 'close', variant: 'secondary' },
                { 
                    text: 'Submit Assessment', 
                    callback: () => this.submitEthicsAssessment(modal),
                    variant: 'primary' 
                }
            ]
        });
        modal.open();
    }

    // Chart Methods
    updateChartData() {
        // Generate new random data
        const newLineData = [
            Array.from({length: 7}, () => Math.floor(Math.random() * 40) + 10),
            Array.from({length: 7}, () => Math.floor(Math.random() * 30) + 5)
        ];
        const newBarData = Array.from({length: 7}, () => Math.floor(Math.random() * 60) + 20);
        const newPieData = Array.from({length: 5}, () => Math.floor(Math.random() * 25) + 10);

        // Update chart data (this would be implemented in the Chart component)
        console.log('Updating chart data:', { newLineData, newBarData, newPieData });
        
        // Update status
        this.updateStatus('Charts updated with new data');
    }

    resetChartData() {
        // Reset to original demo data
        console.log('Resetting chart data to defaults');
        this.updateStatus('Charts reset to default data');
    }

    // Form Methods
    updateEthicsValue(field, value) {
        this.demoData.formData[field] = value;
        
        // Update label
        const label = this.components.get(`${field}Label`);
        if (label) {
            label.setText(`${field.charAt(0).toUpperCase() + field.slice(1)}: ${value}%`);
        }
        
        this.updateStatus(`${field} updated to ${value}%`);
    }

    submitForm() {
        const formData = {
            ethics: this.demoData.formData.ethics,
            fairness: this.demoData.formData.fairness,
            // Would collect actual form field values in real implementation
        };
        
        console.log('Form submitted:', formData);
        this.updateStatus('Form submitted successfully');
        
        // Show confirmation
        this.showInfoModal();
    }

    submitEthicsAssessment(modal) {
        // In a real implementation, this would collect and validate form data
        console.log('Ethics assessment submitted');
        this.updateStatus('Ethics assessment submitted');
        modal.close();
    }

    // Tooltip Methods
    showTooltip(content, target) {
        if (this.currentTooltip) {
            this.currentTooltip.setContent(content);
            this.currentTooltip.setTarget(target);
            this.currentTooltip.show();
        }
    }

    hideTooltip() {
        if (this.currentTooltip) {
            this.currentTooltip.hide();
        }
    }

    // Navigation Methods
    showDashboard() {
        this.updateStatus('Navigated to Dashboard');
        console.log('Showing Dashboard view');
    }

    showAnalytics() {
        this.updateStatus('Navigated to Analytics');
        console.log('Showing Analytics view');
    }

    showSettings() {
        this.updateStatus('Navigated to Settings');
        this.showFormModal(); // Show settings as a form modal
    }

    showHelp() {
        this.updateStatus('Showing Help');
        this.showInfoModal(); // Show help as info modal
    }

    // Utility Methods
    updateStatus(message) {
        const statusLabel = this.components.get('statusLabel');
        if (statusLabel) {
            statusLabel.setText(`Demo Status: ${message} | Keyboard: Ctrl+H (Help), Ctrl+R (Reset), Esc (Close)`);
        }
        console.log('Demo Status:', message);
    }

    resetDemo() {
        // Reset all form data
        this.demoData.formData = {
            ethics: 75,
            fairness: 85,
            transparency: 70,
            accountability: 90
        };

        // Reset sliders
        const ethicsSlider = this.components.get('ethicsSlider');
        const fairnessSlider = this.components.get('fairnessSlider');
        if (ethicsSlider) ethicsSlider.setValue(75);
        if (fairnessSlider) fairnessSlider.setValue(85);

        // Update labels
        this.updateEthicsValue('ethics', 75);
        this.updateEthicsValue('fairness', 85);

        // Reset charts
        this.resetChartData();

        this.updateStatus('Demo reset to initial state');
    }

    hideAllModals() {
        // Close any open modals
        this.engine.getAllComponents()
            .filter(component => component.constructor.name === 'ModalDialog')
            .forEach(modal => {
                if (modal.isOpen) modal.close();
            });
        
        this.updateStatus('All modals closed');
    }

    // Cleanup
    destroy() {
        if (this.engine) {
            this.engine.destroy();
        }
        console.log('AdvancedUIDemo: Destroyed');
    }
}

export default AdvancedUIDemo;
