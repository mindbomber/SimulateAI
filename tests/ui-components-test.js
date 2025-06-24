/**
 * Enhanced Interactive Object System - Test Suite
 * Comprehensive tests for all advanced UI components and registry functionality
 */

import VisualEngine from '../src/js/core/visual-engine.js';
import { Button, Slider, Meter, Label } from '../src/js/objects/interactive-objects.js';
import { ModalDialog, NavigationMenu, Chart, FormField, Tooltip } from '../src/js/objects/advanced-ui-components.js';

class UIComponentTestSuite {
    constructor() {
        this.tests = [];
        this.results = {
            passed: 0,
            failed: 0,
            total: 0
        };
        this.engine = null;
    }

    // Test framework methods
    describe(suiteName, testFunction) {
        console.group(`📋 Testing: ${suiteName}`);
        testFunction();
        console.groupEnd();
    }

    test(testName, testFunction) {
        this.results.total++;
        try {
            testFunction();
            this.results.passed++;
            console.log(`✅ ${testName}`);
        } catch (error) {
            this.results.failed++;
            console.error(`❌ ${testName}:`, error.message);
        }
    }

    expect(actual) {
        return {
            toBe: (expected) => {
                if (actual !== expected) {
                    throw new Error(`Expected ${expected}, got ${actual}`);
                }
            },
            toBeInstanceOf: (expectedClass) => {
                if (!(actual instanceof expectedClass)) {
                    throw new Error(`Expected instance of ${expectedClass.name}, got ${actual.constructor.name}`);
                }
            },
            toBeDefined: () => {
                if (actual === undefined) {
                    throw new Error('Expected value to be defined');
                }
            },
            toContain: (expected) => {
                if (!actual.includes(expected)) {
                    throw new Error(`Expected array to contain ${expected}`);
                }
            },
            toHaveProperty: (property) => {
                if (!(property in actual)) {
                    throw new Error(`Expected object to have property ${property}`);
                }
            }
        };
    }

    // Setup and teardown
    async setup() {
        // Create test container
        const container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);

        // Initialize Visual Engine
        this.engine = new VisualEngine(container, {
            renderMode: 'canvas',
            accessibility: true,
            debug: true
        });

        // Wait for initialization
        await new Promise(resolve => setTimeout(resolve, 100));
    }

    teardown() {
        if (this.engine) {
            this.engine.destroy();
        }
        // Remove test containers
        document.querySelectorAll('div[style*="width: 800px"]').forEach(el => el.remove());
    }

    // Core component tests
    testCoreComponents() {
        this.describe('Core Interactive Components', () => {
            this.test('Button creates with default properties', () => {
                const button = new Button({ text: 'Test Button' });
                this.expect(button.text).toBe('Test Button');
                this.expect(button.type).toBe('button');
                this.expect(button.width).toBe(120);
                this.expect(button.height).toBe(40);
            });

            this.test('Button handles click events', () => {
                let clicked = false;
                const button = new Button({
                    text: 'Click Me',
                    onClick: () => { clicked = true; }
                });

                // Simulate click
                button.handleInput('mousedown', { x: 50, y: 20 });
                button.handleInput('mouseup', { x: 50, y: 20 });
                
                this.expect(clicked).toBe(true);
            });

            this.test('Slider sets and updates values', () => {
                const slider = new Slider({
                    min: 0,
                    max: 100,
                    value: 50
                });

                this.expect(slider.value).toBe(50);
                
                slider.setValue(75);
                this.expect(slider.value).toBe(75);
            });

            this.test('Meter displays progress correctly', () => {
                const meter = new Meter({
                    min: 0,
                    max: 100,
                    value: 60,
                    label: 'Progress'
                });

                this.expect(meter.value).toBe(60);
                this.expect(meter.label).toBe('Progress');
            });

            this.test('Label displays and updates text', () => {
                const label = new Label({
                    text: 'Initial Text'
                });

                this.expect(label.text).toBe('Initial Text');
                
                label.setText('Updated Text');
                this.expect(label.text).toBe('Updated Text');
            });
        });
    }

    // Advanced UI component tests
    testAdvancedComponents() {
        this.describe('Advanced UI Components', () => {
            this.test('ModalDialog creates with proper structure', () => {
                const modal = new ModalDialog({
                    title: 'Test Modal',
                    content: '<p>Test content</p>',
                    buttons: [{ text: 'OK', action: 'close' }]
                });

                this.expect(modal.title).toBe('Test Modal');
                this.expect(modal.content).toBe('<p>Test content</p>');
                this.expect(modal.buttons.length).toBe(1);
                this.expect(modal.isOpen).toBe(false);
            });

            this.test('NavigationMenu handles items correctly', () => {
                const nav = new NavigationMenu({
                    items: [
                        { text: 'Home', action: () => {} },
                        { text: 'About', action: () => {} }
                    ],
                    orientation: 'horizontal'
                });

                this.expect(nav.menuItems.length).toBe(2);
                this.expect(nav.orientation).toBe('horizontal');
                this.expect(nav.selectedIndex).toBe(0);
            });

            this.test('Chart handles different data types', () => {
                const chart = new Chart({
                    type: 'line',
                    data: [[10, 20, 30], [5, 15, 25]],
                    labels: ['A', 'B', 'C'],
                    title: 'Test Chart'
                });

                this.expect(chart.type).toBe('line');
                this.expect(chart.data.length).toBe(2);
                this.expect(chart.labels.length).toBe(3);
                this.expect(chart.title).toBe('Test Chart');
            });

            this.test('FormField validates input types', () => {
                const textField = new FormField({
                    type: 'text',
                    label: 'Name',
                    required: true
                });

                this.expect(textField.type).toBe('text');
                this.expect(textField.label).toBe('Name');
                this.expect(textField.required).toBe(true);
            });

            this.test('Tooltip positioning and content', () => {
                const button = new Button({ text: 'Test' });
                const tooltip = new Tooltip({
                    content: 'Helpful tip',
                    target: button,
                    position: 'top'
                });

                this.expect(tooltip.content).toBe('Helpful tip');
                this.expect(tooltip.position).toBe('top');
                this.expect(tooltip.target).toBe(button);
            });
        });
    }

    // Component registry tests
    testComponentRegistry() {
        this.describe('Component Registry System', () => {
            this.test('Registry registers components correctly', () => {
                const registrySize = this.engine.componentRegistry.size;
                this.expect(registrySize).toBe(10); // 5 core + 5 advanced components
            });

            this.test('Registry creates components by type', () => {
                const button = this.engine.createComponent('button', {
                    text: 'Registry Button'
                });

                this.expect(button).toBeInstanceOf(Button);
                this.expect(button.text).toBe('Registry Button');
            });

            this.test('Registry tracks component instances', () => {
                const button1 = this.engine.createComponent('button', { text: 'Button 1' });
                const button2 = this.engine.createComponent('button', { text: 'Button 2' });

                const buttons = this.engine.getComponentsByType('button');
                this.expect(buttons.length).toBe(2);
                this.expect(buttons).toContain(button1);
                this.expect(buttons).toContain(button2);
            });

            this.test('Registry destroys components correctly', () => {
                const slider = this.engine.createComponent('slider', {});
                const initialCount = this.engine.getComponentsByType('slider').length;

                this.engine.destroyComponent(slider);
                const finalCount = this.engine.getComponentsByType('slider').length;

                this.expect(finalCount).toBe(initialCount - 1);
            });

            this.test('Registry handles all component types', () => {
                const componentTypes = [
                    'button', 'slider', 'meter', 'label',
                    'modal-dialog', 'navigation-menu', 'chart', 'form-field', 'tooltip'
                ];

                componentTypes.forEach(type => {
                    const component = this.engine.createComponent(type, {});
                    this.expect(component).toBeDefined();
                });
            });
        });
    }

    // Accessibility tests
    testAccessibility() {
        this.describe('Accessibility Features', () => {
            this.test('Components have proper ARIA roles', () => {
                const button = new Button({ text: 'Accessible Button' });
                const slider = new Slider({});
                const meter = new Meter({});

                this.expect(button.accessibilityConfig.role).toBe('button');
                this.expect(slider.accessibilityConfig.role).toBe('slider');
                this.expect(meter.accessibilityConfig.role).toBe('progressbar');
            });

            this.test('Components support keyboard navigation', () => {
                const button = new Button({ text: 'Keyboard Button' });
                
                this.expect(button.accessibilityConfig.keyboardActions).toHaveProperty('Enter');
                this.expect(button.accessibilityConfig.keyboardActions).toHaveProperty(' ');
            });

            this.test('Components have focusable elements', () => {
                const slider = new Slider({});
                const button = new Button({});

                this.expect(slider.accessibilityConfig.focusable).toBe(true);
                this.expect(button.accessibilityConfig.focusable).toBe(true);
            });

            this.test('Modal dialogs handle focus management', () => {
                const modal = new ModalDialog({
                    title: 'Focus Test',
                    content: 'Test content'
                });

                this.expect(modal.ariaRole).toBe('dialog');
                this.expect(modal.modal).toBe(true);
            });
        });
    }

    // Performance tests
    testPerformance() {
        this.describe('Performance and Memory Management', () => {
            this.test('Component creation is efficient', () => {
                const startTime = performance.now();
                
                // Create multiple components
                for (let i = 0; i < 100; i++) {
                    this.engine.createComponent('button', { text: `Button ${i}` });
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Should complete in reasonable time (less than 100ms)
                this.expect(duration < 100).toBe(true);
            });

            this.test('Component cleanup prevents memory leaks', () => {
                const initialCount = this.engine.getAllComponents().length;
                
                // Create and destroy components
                const components = [];
                for (let i = 0; i < 10; i++) {
                    components.push(this.engine.createComponent('slider', {}));
                }
                
                components.forEach(comp => this.engine.destroyComponent(comp));
                
                const finalCount = this.engine.getAllComponents().length;
                this.expect(finalCount).toBe(initialCount);
            });

            this.test('Registry lookup is fast', () => {
                const startTime = performance.now();
                
                // Perform many lookups
                for (let i = 0; i < 1000; i++) {
                    this.engine.componentRegistry.get('button');
                }
                
                const endTime = performance.now();
                const duration = endTime - startTime;
                
                // Should be very fast (less than 10ms)
                this.expect(duration < 10).toBe(true);
            });
        });
    }

    // Integration tests
    testIntegration() {
        this.describe('Component Integration', () => {
            this.test('Components work together in complex scenarios', () => {
                // Create a modal with navigation and form
                const modal = this.engine.createComponent('modal-dialog', {
                    title: 'Complex Dialog'
                });

                const nav = this.engine.createComponent('navigation-menu', {
                    items: [{ text: 'Tab 1' }, { text: 'Tab 2' }]
                });

                const form = this.engine.createComponent('form-field', {
                    type: 'text',
                    label: 'Input'
                });

                this.expect(modal).toBeDefined();
                this.expect(nav).toBeDefined();
                this.expect(form).toBeDefined();
            });

            this.test('Event handling works across components', () => {
                let eventTriggered = false;

                const button = this.engine.createComponent('button', {
                    text: 'Event Test',
                    onClick: () => { eventTriggered = true; }
                });

                // Simulate event
                button.handleInput('mousedown', { x: 50, y: 20 });
                button.handleInput('mouseup', { x: 50, y: 20 });

                this.expect(eventTriggered).toBe(true);
            });

            this.test('Visual Engine manages all components', () => {
                const totalBefore = this.engine.getAllComponents().length;

                // Create various components
                this.engine.createComponent('button', {});
                this.engine.createComponent('slider', {});
                this.engine.createComponent('chart', { data: [1, 2, 3] });

                const totalAfter = this.engine.getAllComponents().length;
                this.expect(totalAfter).toBe(totalBefore + 3);
            });
        });
    }

    // Error handling tests
    testErrorHandling() {
        this.describe('Error Handling and Edge Cases', () => {
            this.test('Invalid component type handling', () => {
                const component = this.engine.createComponent('nonexistent-type', {});
                this.expect(component).toBe(null);
            });

            this.test('Component destruction of non-existent component', () => {
                const button = new Button({}); // Create but don't add to registry
                
                // Should not throw error
                try {
                    this.engine.destroyComponent(button);
                    this.expect(true).toBe(true); // Test passes if no error
                } catch (error) {
                    throw new Error('Should not throw error for non-existent component');
                }
            });

            this.test('Empty configuration handling', () => {
                const button = this.engine.createComponent('button', {});
                this.expect(button).toBeDefined();
                this.expect(button.text).toBe('Button'); // Default text
            });

            this.test('Invalid data handling in charts', () => {
                const chart = this.engine.createComponent('chart', {
                    type: 'line',
                    data: null // Invalid data
                });
                
                this.expect(chart).toBeDefined();
                this.expect(Array.isArray(chart.data)).toBe(true);
            });
        });
    }

    // Run all tests
    async runAllTests() {
        console.log('🧪 Starting Enhanced Interactive Object System Test Suite');
        console.log('=' * 60);

        try {
            await this.setup();

            this.testCoreComponents();
            this.testAdvancedComponents();
            this.testComponentRegistry();
            this.testAccessibility();
            this.testPerformance();
            this.testIntegration();
            this.testErrorHandling();

        } catch (error) {
            console.error('❌ Test suite setup failed:', error);
        } finally {
            this.teardown();
        }

        this.printResults();
    }

    printResults() {
        console.log('\n' + '=' * 60);
        console.log('📊 Test Results Summary');
        console.log('=' * 60);
        console.log(`✅ Passed: ${this.results.passed}`);
        console.log(`❌ Failed: ${this.results.failed}`);
        console.log(`📈 Total: ${this.results.total}`);
        console.log(`📊 Success Rate: ${((this.results.passed / this.results.total) * 100).toFixed(1)}%`);

        if (this.results.failed === 0) {
            console.log('\n🎉 All tests passed! The Enhanced Interactive Object System is working correctly.');
        } else {
            console.log(`\n⚠️  ${this.results.failed} test(s) failed. Please review the errors above.`);
        }
    }
}

// Export for use in testing environments
export default UIComponentTestSuite;

// Auto-run tests if this file is loaded directly
if (typeof window !== 'undefined' && window.document) {
    // Add a global test runner function
    window.runUITests = async () => {
        const testSuite = new UIComponentTestSuite();
        await testSuite.runAllTests();
        return testSuite.results;
    };

    // Add test button to page if in development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        document.addEventListener('DOMContentLoaded', () => {
            const testButton = document.createElement('button');
            testButton.textContent = '🧪 Run UI Tests';
            testButton.style.cssText = `
                position: fixed;
                top: 10px;
                left: 10px;
                z-index: 9999;
                padding: 10px;
                background: #4CAF50;
                color: white;
                border: none;
                border-radius: 4px;
                cursor: pointer;
            `;
            testButton.onclick = window.runUITests;
            document.body.appendChild(testButton);
        });
    }
}
