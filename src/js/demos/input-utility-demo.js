/**
 * Input and Utility Components Demo
 * Demonstrates ColorPicker, DateTimePicker, NumberInput, Accordion, Drawer, and SearchBox
 */

import { VisualEngine } from '../core/visual-engine.js';

export class InputUtilityComponentsDemo {
    constructor(container) {
        this.container = container;
        this.engine = new VisualEngine(container, {
            width: 1200,
            height: 800,
            renderMode: 'canvas'
        });
        
        this.components = {};
        this.setupDemo();
    }
    
    setupDemo() {
        console.log('Setting up Input/Utility Components Demo...');
        
        // Create demo sections
        this.createColorPickerDemo();
        this.createDateTimePickerDemo();
        this.createNumberInputDemo();
        this.createAccordionDemo();
        this.createDrawerDemo();
        this.createSearchBoxDemo();
        
        // Add event listeners
        this.setupEventListeners();
        
        // Start the engine
        this.engine.start();
        
        console.log('Input/Utility Components Demo initialized');
    }
    
    createColorPickerDemo() {
        // Basic color picker
        const colorPicker1 = this.engine.createComponent('color-picker', {
            x: 50,
            y: 50,
            value: '#ff6b6b',
            showAlpha: true,
            showPresets: true
        });
        
        // Color picker with custom presets
        const colorPicker2 = this.engine.createComponent('color-picker', {
            x: 350,
            y: 50,
            value: '#4ecdc4',
            presets: ['#ff6b6b', '#4ecdc4', '#45b7d1', '#96ceb4', '#ffeaa7', '#dda0dd'],
            format: 'rgb'
        });
        
        // Disabled color picker
        const colorPicker3 = this.engine.createComponent('color-picker', {
            x: 650,
            y: 50,
            value: '#95a5a6',
            disabled: true
        });
        
        this.components.colorPickers = [colorPicker1, colorPicker2, colorPicker3];
        
        // Event listeners
        colorPicker1.on('colorChanged', (event) => {
            console.log('Color 1 changed:', event.value);
        });
        
        colorPicker2.on('colorChanged', (event) => {
            console.log('Color 2 changed (RGB):', event.value);
        });
    }
    
    createDateTimePickerDemo() {
        // Basic date picker
        const datePicker1 = this.engine.createComponent('datetime-picker', {
            x: 50,
            y: 150,
            showTime: false,
            format: 'MM/DD/YYYY'
        });
        
        // Date and time picker
        const dateTimePicker = this.engine.createComponent('datetime-picker', {
            x: 400,
            y: 150,
            showTime: true,
            show24Hour: false,
            format: 'DD/MM/YYYY'
        });
        
        // Date picker with constraints
        const constrainedPicker = this.engine.createComponent('datetime-picker', {
            x: 750,
            y: 150,
            minDate: new Date(),
            maxDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 days from now
            showTime: false
        });
        
        this.components.datePickers = [datePicker1, dateTimePicker, constrainedPicker];
        
        // Event listeners
        datePicker1.on('dateChanged', (event) => {
            console.log('Date 1 changed:', event.value);
        });
        
        dateTimePicker.on('dateChanged', (event) => {
            console.log('DateTime changed:', event.value);
        });
    }
    
    createNumberInputDemo() {
        // Basic number input
        const numberInput1 = this.engine.createComponent('number-input', {
            x: 50,
            y: 250,
            value: 10,
            min: 0,
            max: 100,
            step: 1
        });
        
        // Decimal number input
        const numberInput2 = this.engine.createComponent('number-input', {
            x: 250,
            y: 250,
            value: 3.14,
            min: 0,
            max: 10,
            step: 0.1,
            precision: 2
        });
        
        // Currency input
        const currencyInput = this.engine.createComponent('number-input', {
            x: 450,
            y: 250,
            value: 1299.99,
            min: 0,
            step: 0.01,
            precision: 2,
            placeholder: '0.00'
        });
        
        // Disabled number input
        const disabledInput = this.engine.createComponent('number-input', {
            x: 650,
            y: 250,
            value: 42,
            disabled: true
        });
        
        this.components.numberInputs = [numberInput1, numberInput2, currencyInput, disabledInput];
        
        // Event listeners
        numberInput1.on('valueChanged', (event) => {
            console.log('Number 1 changed:', event.value);
        });
        
        numberInput2.on('valueChanged', (event) => {
            console.log('Decimal changed:', event.value);
        });
        
        currencyInput.on('valueChanged', (event) => {
            console.log('Currency changed:', event.value);
        });
    }
    
    createAccordionDemo() {
        // Basic accordion
        const accordion1 = this.engine.createComponent('accordion', {
            x: 50,
            y: 350,
            width: 350,
            height: 200,
            allowMultiple: false,
            items: [
                {
                    id: 'section1',
                    title: 'Getting Started',
                    icon: '🚀',
                    content: 'Welcome to SimulateAI! Begin your open-ended exploration of AI ethics, robotics, and emerging technologies through consequence-driven simulations.'
                },
                {
                    id: 'section2',
                    title: 'Advanced Features',
                    icon: '⚡',
                    content: 'Explore advanced simulation features including custom models, real-time analysis, and data visualization.'
                },
                {
                    id: 'section3',
                    title: 'Troubleshooting',
                    icon: '🔧',
                    content: 'Common issues and solutions for simulation problems. Contact support if you need additional help.'
                }
            ],
            expandedItems: ['section1']
        });
        
        // Multi-expand accordion
        const accordion2 = this.engine.createComponent('accordion', {
            x: 450,
            y: 350,
            width: 350,
            height: 200,
            allowMultiple: true,
            items: [
                {
                    id: 'api1',
                    title: 'REST API',
                    content: 'Documentation for the REST API endpoints and authentication methods.'
                },
                {
                    id: 'api2',
                    title: 'WebSocket API',
                    content: 'Real-time communication using WebSocket connections for live data streaming.'
                },
                {
                    id: 'api3',
                    title: 'GraphQL API',
                    content: 'Flexible data querying using GraphQL for complex data relationships.',
                    disabled: true
                }
            ]
        });
        
        this.components.accordions = [accordion1, accordion2];
        
        // Event listeners
        accordion1.on('itemExpanded', (event) => {
            console.log('Accordion 1 expanded:', event.itemId);
        });
        
        accordion1.on('itemCollapsed', (event) => {
            console.log('Accordion 1 collapsed:', event.itemId);
        });
        
        accordion2.on('itemExpanded', (event) => {
            console.log('Accordion 2 expanded:', event.itemId);
        });
    }
    
    createDrawerDemo() {
        // Left drawer
        const leftDrawer = this.engine.createComponent('drawer', {
            x: 0,
            y: 0,
            width: 300,
            height: 600,
            position: 'left',
            title: 'Navigation Menu',
            content: 'Dashboard\nSimulations\nData Analysis\nSettings\nHelp & Support\n\nThis is a navigation drawer that slides in from the left side.'
        });
        
        // Right drawer
        const rightDrawer = this.engine.createComponent('drawer', {
            x: 0,
            y: 0,
            width: 280,
            height: 600,
            position: 'right',
            title: 'Properties Panel',
            content: 'Simulation Properties:\n\n• Model Type: Neural Network\n• Training Data: 10,000 samples\n• Epochs: 100\n• Learning Rate: 0.001\n• Batch Size: 32\n\nThis drawer shows detailed properties and settings.'
        });
        
        this.components.drawers = [leftDrawer, rightDrawer];
        
        // Create buttons to open drawers
        this.createDrawerButtons();
        
        // Event listeners
        leftDrawer.on('drawerOpened', () => {
            console.log('Left drawer opened');
        });
        
        rightDrawer.on('drawerOpened', () => {
            console.log('Right drawer opened');
        });
    }
    
    createDrawerButtons() {
        // Left drawer button
        const leftButton = this.engine.createComponent('button', {
            x: 50,
            y: 600,
            width: 120,
            height: 40,
            text: 'Open Left Drawer',
            backgroundColor: '#007bff'
        });
        
        // Right drawer button
        const rightButton = this.engine.createComponent('button', {
            x: 200,
            y: 600,
            width: 120,
            height: 40,
            text: 'Open Right Drawer',
            backgroundColor: '#28a745'
        });
        
        // Button event listeners
        leftButton.on('click', () => {
            this.components.drawers[0].open();
        });
        
        rightButton.on('click', () => {
            this.components.drawers[1].open();
        });
        
        this.components.drawerButtons = [leftButton, rightButton];
    }
    
    createSearchBoxDemo() {
        // Basic search box
        const searchBox1 = this.engine.createComponent('search-box', {
            x: 850,
            y: 350,
            placeholder: 'Search simulations...',
            suggestions: [
                'Neural Network Training',
                'Deep Learning Models',
                'Computer Vision',
                'Natural Language Processing',
                'Reinforcement Learning',
                'Genetic Algorithms',
                'Decision Trees',
                'Support Vector Machines'
            ]
        });
        
        // Search box with custom behavior
        const searchBox2 = this.engine.createComponent('search-box', {
            x: 850,
            y: 420,
            placeholder: 'Search documentation...',
            debounceDelay: 500,
            minSearchLength: 3,
            maxSuggestions: 3,
            suggestions: [
                'API Documentation',
                'Getting Started Guide',
                'Advanced Tutorials',
                'Troubleshooting Guide',
                'Best Practices',
                'Code Examples'
            ]
        });
        
        // Search box without suggestions
        const searchBox3 = this.engine.createComponent('search-box', {
            x: 850,
            y: 490,
            placeholder: 'Simple search...',
            showSuggestions: false,
            showClearButton: true,
            showSearchButton: true
        });
        
        this.components.searchBoxes = [searchBox1, searchBox2, searchBox3];
        
        // Event listeners
        searchBox1.on('search', (event) => {
            console.log('Search 1:', event.query);
        });
        
        searchBox1.on('valueChanged', (event) => {
            console.log('Search 1 value changed:', event.value);
        });
        
        searchBox2.on('search', (event) => {
            console.log('Search 2:', event.query);
        });
        
        searchBox3.on('search', (event) => {
            console.log('Search 3:', event.query);
        });
    }
    
    setupEventListeners() {
        // Global component interactions
        this.setupColorPickerInteractions();
        this.setupAccordionInteractions();
        this.setupNumberInputInteractions();
    }
    
    setupColorPickerInteractions() {
        // Change background color based on color picker
        if (this.components.colorPickers && this.components.colorPickers[0]) {
            this.components.colorPickers[0].on('colorChanged', (event) => {
                // Update demo background or other visual elements
                this.updateDemoColors(event.value);
            });
        }
    }
    
    setupAccordionInteractions() {
        // Add dynamic accordion controls
        if (this.components.accordions && this.components.accordions[0]) {
            const accordion = this.components.accordions[0];
            
            // Add expand all button
            const expandAllBtn = this.engine.createComponent('button', {
                x: 50,
                y: 570,
                width: 100,
                height: 30,
                text: 'Expand All',
                backgroundColor: '#17a2b8'
            });
            
            // Add collapse all button
            const collapseAllBtn = this.engine.createComponent('button', {
                x: 160,
                y: 570,
                width: 100,
                height: 30,
                text: 'Collapse All',
                backgroundColor: '#dc3545'
            });
            
            expandAllBtn.on('click', () => {
                accordion.expandAll();
            });
            
            collapseAllBtn.on('click', () => {
                accordion.collapseAll();
            });
        }
    }
    
    setupNumberInputInteractions() {
        // Link number inputs for calculations
        if (this.components.numberInputs && this.components.numberInputs.length >= 2) {
            const input1 = this.components.numberInputs[0];
            const input2 = this.components.numberInputs[1];
            
            // Create result display
            const resultLabel = this.engine.createComponent('label', {
                x: 850,
                y: 250,
                width: 200,
                height: 40,
                text: 'Result: 0',
                backgroundColor: '#f8f9fa',
                borderColor: '#dee2e6'
            });
            
            const updateResult = () => {
                const result = input1.value * input2.value;
                resultLabel.text = `Result: ${result.toFixed(2)}`;
            };
            
            input1.on('valueChanged', updateResult);
            input2.on('valueChanged', updateResult);
            
            this.components.resultLabel = resultLabel;
        }
    }
    
    updateDemoColors(color) {
        // Update visual elements based on selected color
        if (this.components.accordions && this.components.accordions[0]) {
            this.components.accordions[0].headerBackgroundColor = color;
        }
    }
    
    // Public API methods
    addAccordionItem(title, content, icon = null) {
        if (this.components.accordions && this.components.accordions[0]) {
            this.components.accordions[0].addItem({
                title,
                content,
                icon
            });
        }
    }
    
    openDrawer(position) {
        const drawer = this.components.drawers?.find(d => d.position === position);
        if (drawer) {
            drawer.open();
        }
    }
    
    setSearchSuggestions(suggestions) {
        if (this.components.searchBoxes && this.components.searchBoxes[0]) {
            this.components.searchBoxes[0].suggestions = suggestions;
        }
    }
    
    getComponentValues() {
        return {
            colors: this.components.colorPickers?.map(cp => cp.value) || [],
            dates: this.components.datePickers?.map(dp => dp.value) || [],
            numbers: this.components.numberInputs?.map(ni => ni.value) || [],
            searchQueries: this.components.searchBoxes?.map(sb => sb.value) || []
        };
    }
    
    destroy() {
        if (this.engine) {
            this.engine.stop();
            this.engine = null;
        }
        this.components = {};
    }
}

// Export for use in other modules
export default InputUtilityComponentsDemo;
