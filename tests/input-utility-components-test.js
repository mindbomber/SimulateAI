/**
 * Input and Utility Components Test Suite
 * Tests for ColorPicker, DateTimePicker, NumberInput, Accordion, Drawer, and SearchBox
 */

// Mock dependencies for testing
const mockEngine = {
    createComponent: (type, options) => {
        const component = new (getComponentClass(type))(options);
        component.engine = mockEngine;
        return component;
    },
    scene: {
        addObject: () => {},
        removeObject: () => {}
    }
};

function getComponentClass(type) {
    const components = {
        'color-picker': ColorPicker,
        'datetime-picker': DateTimePicker,
        'number-input': NumberInput,
        'accordion': Accordion,
        'drawer': Drawer,
        'search-box': SearchBox
    };
    return components[type];
}

// Test suite class
class InputUtilityComponentsTest {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.setupTests();
    }
    
    setupTests() {
        // ColorPicker tests
        this.addTest('ColorPicker - Basic Creation', () => this.testColorPickerCreation());
        this.addTest('ColorPicker - Color Parsing', () => this.testColorPickerColorParsing());
        this.addTest('ColorPicker - Event Handling', () => this.testColorPickerEvents());
        this.addTest('ColorPicker - Format Conversion', () => this.testColorPickerFormats());
        
        // DateTimePicker tests
        this.addTest('DateTimePicker - Basic Creation', () => this.testDateTimePickerCreation());
        this.addTest('DateTimePicker - Date Validation', () => this.testDateTimePickerValidation());
        this.addTest('DateTimePicker - Format Options', () => this.testDateTimePickerFormats());
        this.addTest('DateTimePicker - Navigation', () => this.testDateTimePickerNavigation());
        
        // NumberInput tests
        this.addTest('NumberInput - Basic Creation', () => this.testNumberInputCreation());
        this.addTest('NumberInput - Value Validation', () => this.testNumberInputValidation());
        this.addTest('NumberInput - Step Operations', () => this.testNumberInputSteps());
        this.addTest('NumberInput - Precision Handling', () => this.testNumberInputPrecision());
        
        // Accordion tests
        this.addTest('Accordion - Basic Creation', () => this.testAccordionCreation());
        this.addTest('Accordion - Item Management', () => this.testAccordionItemManagement());
        this.addTest('Accordion - Expand/Collapse', () => this.testAccordionExpandCollapse());
        this.addTest('Accordion - Multiple Mode', () => this.testAccordionMultipleMode());
        
        // Drawer tests
        this.addTest('Drawer - Basic Creation', () => this.testDrawerCreation());
        this.addTest('Drawer - Open/Close', () => this.testDrawerOpenClose());
        this.addTest('Drawer - Position Handling', () => this.testDrawerPositions());
        this.addTest('Drawer - Animation', () => this.testDrawerAnimation());
        
        // SearchBox tests
        this.addTest('SearchBox - Basic Creation', () => this.testSearchBoxCreation());
        this.addTest('SearchBox - Search Functionality', () => this.testSearchBoxSearch());
        this.addTest('SearchBox - Suggestions', () => this.testSearchBoxSuggestions());
        this.addTest('SearchBox - Debouncing', () => this.testSearchBoxDebouncing());
    }
    
    addTest(name, testFn) {
        this.tests.push({ name, testFn });
    }
    
    async runTests() {
        console.log('🧪 Running Input/Utility Components Tests...\n');
        
        for (const test of this.tests) {
            try {
                await test.testFn();
                this.passed++;
                console.log(`✅ ${test.name}`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${test.name}: ${error.message}`);
            }
        }
        
        this.printResults();
    }
    
    printResults() {
        const total = this.passed + this.failed;
        const passRate = ((this.passed / total) * 100).toFixed(1);
        
        console.log('\n📊 Test Results:');
        console.log(`Total: ${total}`);
        console.log(`Passed: ${this.passed}`);
        console.log(`Failed: ${this.failed}`);
        console.log(`Pass Rate: ${passRate}%`);
        
        if (this.failed === 0) {
            console.log('🎉 All tests passed!');
        } else {
            console.log('⚠️ Some tests failed. Check the logs above.');
        }
    }
    
    // ColorPicker Tests
    testColorPickerCreation() {
        const colorPicker = mockEngine.createComponent('color-picker', {
            value: '#ff0000',
            showAlpha: true
        });
        
        this.assert(colorPicker instanceof ColorPicker, 'Should create ColorPicker instance');
        this.assert(colorPicker.value === '#ff0000', 'Should set initial value');
        this.assert(colorPicker.showAlpha === true, 'Should set showAlpha option');
        this.assert(colorPicker.format === 'hex', 'Should default to hex format');
    }
    
    testColorPickerColorParsing() {
        const colorPicker = mockEngine.createComponent('color-picker', {
            value: '#ff6b6b'
        });
        
        colorPicker.parseColor();
        
        this.assert(colorPicker.hue >= 0 && colorPicker.hue <= 360, 'Should parse hue correctly');
        this.assert(colorPicker.saturation >= 0 && colorPicker.saturation <= 100, 'Should parse saturation correctly');
        this.assert(colorPicker.lightness >= 0 && colorPicker.lightness <= 100, 'Should parse lightness correctly');
    }
    
    testColorPickerEvents() {
        const colorPicker = mockEngine.createComponent('color-picker', {});
        let eventFired = false;
        
        colorPicker.on('colorChanged', () => {
            eventFired = true;
        });
        
        colorPicker.value = '#00ff00';
        colorPicker.emit('colorChanged', { value: colorPicker.value });
        
        this.assert(eventFired, 'Should fire colorChanged event');
    }
    
    testColorPickerFormats() {
        const colorPicker = mockEngine.createComponent('color-picker', {
            format: 'rgb'
        });
        
        this.assert(colorPicker.format === 'rgb', 'Should support RGB format');
        
        // Test HSL to RGB conversion
        const rgb = colorPicker.hslToRgb(0, 100, 50);
        this.assert(rgb.r === 255 && rgb.g === 0 && rgb.b === 0, 'Should convert HSL to RGB correctly');
    }
    
    // DateTimePicker Tests
    testDateTimePickerCreation() {
        const datePicker = mockEngine.createComponent('datetime-picker', {
            showTime: true,
            format: 'MM/DD/YYYY'
        });
        
        this.assert(datePicker instanceof DateTimePicker, 'Should create DateTimePicker instance');
        this.assert(datePicker.showTime === true, 'Should set showTime option');
        this.assert(datePicker.format === 'MM/DD/YYYY', 'Should set format option');
        this.assert(datePicker.value instanceof Date, 'Should have Date value');
    }
    
    testDateTimePickerValidation() {
        const now = new Date();
        const tomorrow = new Date(now.getTime() + 24 * 60 * 60 * 1000);
        
        const datePicker = mockEngine.createComponent('datetime-picker', {
            minDate: now,
            maxDate: tomorrow
        });
        
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        const nextWeek = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
        
        this.assert(datePicker.isDateDisabled(yesterday), 'Should disable dates before minDate');
        this.assert(datePicker.isDateDisabled(nextWeek), 'Should disable dates after maxDate');
        this.assert(!datePicker.isDateDisabled(now), 'Should not disable valid dates');
    }
    
    testDateTimePickerFormats() {
        const datePicker = mockEngine.createComponent('datetime-picker', {
            format: 'DD/MM/YYYY'
        });
        
        const testDate = new Date(2024, 0, 15); // January 15, 2024
        const formatted = datePicker.formatDate(testDate);
        
        this.assert(formatted === '15/01/2024', 'Should format date correctly');
    }
    
    testDateTimePickerNavigation() {
        const datePicker = mockEngine.createComponent('datetime-picker', {});
        
        const initialMonth = datePicker.displayMonth;
        datePicker.navigateMonth(1);
        
        this.assert(datePicker.displayMonth === (initialMonth + 1) % 12, 'Should navigate to next month');
    }
    
    // NumberInput Tests
    testNumberInputCreation() {
        const numberInput = mockEngine.createComponent('number-input', {
            value: 10,
            min: 0,
            max: 100,
            step: 1
        });
        
        this.assert(numberInput instanceof NumberInput, 'Should create NumberInput instance');
        this.assert(numberInput.value === 10, 'Should set initial value');
        this.assert(numberInput.min === 0, 'Should set min value');
        this.assert(numberInput.max === 100, 'Should set max value');
        this.assert(numberInput.step === 1, 'Should set step value');
    }
    
    testNumberInputValidation() {
        const numberInput = mockEngine.createComponent('number-input', {
            min: 0,
            max: 100
        });
        
        const clampedValue1 = numberInput.clampValue(-10);
        const clampedValue2 = numberInput.clampValue(150);
        const clampedValue3 = numberInput.clampValue(50);
        
        this.assert(clampedValue1 === 0, 'Should clamp values below minimum');
        this.assert(clampedValue2 === 100, 'Should clamp values above maximum');
        this.assert(clampedValue3 === 50, 'Should not clamp valid values');
    }
    
    testNumberInputSteps() {
        const numberInput = mockEngine.createComponent('number-input', {
            value: 10,
            step: 5
        });
        
        numberInput.increment();
        this.assert(numberInput.value === 15, 'Should increment by step amount');
        
        numberInput.decrement();
        this.assert(numberInput.value === 10, 'Should decrement by step amount');
    }
    
    testNumberInputPrecision() {
        const numberInput = mockEngine.createComponent('number-input', {
            precision: 2
        });
        
        const formatted = numberInput.formatValue(3.14159);
        this.assert(formatted === '3.14', 'Should format with correct precision');
    }
    
    // Accordion Tests
    testAccordionCreation() {
        const accordion = mockEngine.createComponent('accordion', {
            items: [
                { id: 'item1', title: 'Item 1', content: 'Content 1' },
                { id: 'item2', title: 'Item 2', content: 'Content 2' }
            ]
        });
        
        this.assert(accordion instanceof Accordion, 'Should create Accordion instance');
        this.assert(accordion.items.length === 2, 'Should set items');
        this.assert(accordion.items[0].id === 'item1', 'Should preserve item IDs');
    }
    
    testAccordionItemManagement() {
        const accordion = mockEngine.createComponent('accordion', {});
        
        accordion.addItem({
            title: 'New Item',
            content: 'New Content'
        });
        
        this.assert(accordion.items.length === 1, 'Should add new item');
        this.assert(accordion.items[0].title === 'New Item', 'Should set item title');
        
        const itemId = accordion.items[0].id;
        accordion.removeItem(itemId);
        
        this.assert(accordion.items.length === 0, 'Should remove item');
    }
    
    testAccordionExpandCollapse() {
        const accordion = mockEngine.createComponent('accordion', {
            items: [
                { id: 'item1', title: 'Item 1', content: 'Content 1' }
            ]
        });
        
        accordion.expandItem('item1');
        this.assert(accordion.expandedItems.has('item1'), 'Should expand item');
        
        accordion.collapseItem('item1');
        this.assert(!accordion.expandedItems.has('item1'), 'Should collapse item');
    }
    
    testAccordionMultipleMode() {
        const accordion = mockEngine.createComponent('accordion', {
            allowMultiple: true,
            items: [
                { id: 'item1', title: 'Item 1', content: 'Content 1' },
                { id: 'item2', title: 'Item 2', content: 'Content 2' }
            ]
        });
        
        accordion.expandItem('item1');
        accordion.expandItem('item2');
        
        this.assert(accordion.expandedItems.has('item1'), 'Should keep first item expanded');
        this.assert(accordion.expandedItems.has('item2'), 'Should expand second item');
        this.assert(accordion.expandedItems.size === 2, 'Should allow multiple expanded items');
    }
    
    // Drawer Tests
    testDrawerCreation() {
        const drawer = mockEngine.createComponent('drawer', {
            position: 'left',
            title: 'Test Drawer',
            content: 'Test Content'
        });
        
        this.assert(drawer instanceof Drawer, 'Should create Drawer instance');
        this.assert(drawer.position === 'left', 'Should set position');
        this.assert(drawer.title === 'Test Drawer', 'Should set title');
        this.assert(drawer.content === 'Test Content', 'Should set content');
    }
    
    testDrawerOpenClose() {
        const drawer = mockEngine.createComponent('drawer', {});
        
        this.assert(!drawer.isOpen, 'Should start closed');
        
        drawer.open();
        this.assert(drawer.isOpen, 'Should open drawer');
        
        drawer.close();
        this.assert(!drawer.isOpen, 'Should close drawer');
    }
    
    testDrawerPositions() {
        const positions = ['left', 'right', 'top', 'bottom'];
        
        positions.forEach(position => {
            const drawer = mockEngine.createComponent('drawer', { position });
            const bounds = drawer.getDrawerBounds();
            
            this.assert(typeof bounds.x === 'number', `Should calculate bounds for ${position} position`);
            this.assert(typeof bounds.y === 'number', `Should calculate bounds for ${position} position`);
        });
    }
    
    testDrawerAnimation() {
        const drawer = mockEngine.createComponent('drawer', {
            animationDuration: 100
        });
        
        drawer.startAnimation('open');
        this.assert(drawer.isAnimating, 'Should start animation');
        this.assert(drawer.animationType === 'open', 'Should set animation type');
    }
    
    // SearchBox Tests
    testSearchBoxCreation() {
        const searchBox = mockEngine.createComponent('search-box', {
            placeholder: 'Search...',
            suggestions: ['item1', 'item2', 'item3']
        });
        
        this.assert(searchBox instanceof SearchBox, 'Should create SearchBox instance');
        this.assert(searchBox.placeholder === 'Search...', 'Should set placeholder');
        this.assert(searchBox.suggestions.length === 3, 'Should set suggestions');
    }
    
    testSearchBoxSearch() {
        const searchBox = mockEngine.createComponent('search-box', {});
        let searchTriggered = false;
        
        searchBox.on('search', () => {
            searchTriggered = true;
        });
        
        searchBox.setValue('test query');
        searchBox.performSearch();
        
        this.assert(searchTriggered, 'Should trigger search event');
        this.assert(searchBox.value === 'test query', 'Should set search value');
    }
    
    testSearchBoxSuggestions() {
        const searchBox = mockEngine.createComponent('search-box', {
            suggestions: ['apple', 'application', 'apply', 'banana']
        });
        
        searchBox.setValue('app');
        searchBox.updateSuggestions();
        
        this.assert(searchBox.filteredSuggestions.length === 3, 'Should filter suggestions');
        this.assert(searchBox.filteredSuggestions.includes('apple'), 'Should include matching suggestions');
        this.assert(searchBox.showingSuggestions, 'Should show suggestions');
    }
    
    async testSearchBoxDebouncing() {
        const searchBox = mockEngine.createComponent('search-box', {
            debounceDelay: 50
        });
        
        let searchCount = 0;
        searchBox.on('search', () => {
            searchCount++;
        });
        
        // Rapid typing simulation
        searchBox.setValue('t');
        searchBox.setValue('te');
        searchBox.setValue('tes');
        searchBox.setValue('test');
        
        // Wait for debounce
        await new Promise(resolve => setTimeout(resolve, 100));
        
        this.assert(searchCount <= 1, 'Should debounce search calls');
    }
    
    // Utility methods
    assert(condition, message) {
        if (!condition) {
            throw new Error(message);
        }
    }
}

// Performance tests
class PerformanceTests {
    constructor() {
        this.results = {};
    }
    
    async runPerformanceTests() {
        console.log('\n⚡ Running Performance Tests...\n');
        
        await this.testComponentCreationPerformance();
        await this.testRenderingPerformance();
        await this.testEventHandlingPerformance();
        
        this.printPerformanceResults();
    }
    
    async testComponentCreationPerformance() {
        const iterations = 1000;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            const colorPicker = mockEngine.createComponent('color-picker', {});
            const numberInput = mockEngine.createComponent('number-input', {});
            const searchBox = mockEngine.createComponent('search-box', {});
        }
        
        const end = performance.now();
        const duration = end - start;
        
        this.results.componentCreation = {
            iterations: iterations * 3,
            duration: duration.toFixed(2),
            averagePerComponent: (duration / (iterations * 3)).toFixed(4)
        };
    }
    
    async testRenderingPerformance() {
        const mockRenderer = {
            type: 'canvas',
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 0,
            font: '',
            textAlign: '',
            textBaseline: '',
            fillRect: () => {},
            strokeRect: () => {},
            fillText: () => {},
            measureText: () => ({ width: 100 }),
            beginPath: () => {},
            arc: () => {},
            fill: () => {},
            stroke: () => {},
            moveTo: () => {},
            lineTo: () => {}
        };
        
        const components = [
            mockEngine.createComponent('color-picker', {}),
            mockEngine.createComponent('number-input', {}),
            mockEngine.createComponent('accordion', { items: [{ id: '1', title: 'Test', content: 'Test' }] })
        ];
        
        const iterations = 1000;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            components.forEach(component => {
                component.renderSelf(mockRenderer);
            });
        }
        
        const end = performance.now();
        const duration = end - start;
        
        this.results.rendering = {
            iterations: iterations * components.length,
            duration: duration.toFixed(2),
            averagePerRender: (duration / (iterations * components.length)).toFixed(4)
        };
    }
    
    async testEventHandlingPerformance() {
        const searchBox = mockEngine.createComponent('search-box', {
            suggestions: Array.from({ length: 1000 }, (_, i) => `suggestion ${i}`)
        });
        
        const iterations = 1000;
        const start = performance.now();
        
        for (let i = 0; i < iterations; i++) {
            searchBox.setValue(`test ${i % 10}`);
            searchBox.updateSuggestions();
        }
        
        const end = performance.now();
        const duration = end - start;
        
        this.results.eventHandling = {
            iterations,
            duration: duration.toFixed(2),
            averagePerEvent: (duration / iterations).toFixed(4)
        };
    }
    
    printPerformanceResults() {
        console.log('📊 Performance Results:');
        
        Object.entries(this.results).forEach(([test, result]) => {
            console.log(`\n${test}:`);
            console.log(`  Iterations: ${result.iterations}`);
            console.log(`  Total Duration: ${result.duration}ms`);
            console.log(`  Average: ${result.averagePerComponent || result.averagePerRender || result.averagePerEvent}ms per operation`);
        });
    }
}

// Memory leak tests
class MemoryTests {
    async runMemoryTests() {
        console.log('\n🧠 Running Memory Tests...\n');
        
        if (!performance.memory) {
            console.log('⚠️ Memory testing not available in this environment');
            return;
        }
        
        const initialMemory = performance.memory.usedJSHeapSize;
        
        // Create and destroy many components
        const components = [];
        for (let i = 0; i < 1000; i++) {
            components.push(mockEngine.createComponent('color-picker', {}));
            components.push(mockEngine.createComponent('search-box', {}));
        }
        
        const afterCreation = performance.memory.usedJSHeapSize;
        
        // Clear components
        components.length = 0;
        
        // Force garbage collection if available
        if (window.gc) {
            window.gc();
        }
        
        // Wait a bit for GC
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        const afterCleanup = performance.memory.usedJSHeapSize;
        
        console.log('Memory Usage:');
        console.log(`  Initial: ${Math.round(initialMemory / 1024 / 1024)}MB`);
        console.log(`  After Creation: ${Math.round(afterCreation / 1024 / 1024)}MB`);
        console.log(`  After Cleanup: ${Math.round(afterCleanup / 1024 / 1024)}MB`);
        console.log(`  Memory Reclaimed: ${Math.round((afterCreation - afterCleanup) / 1024 / 1024)}MB`);
    }
}

// Export test runner
export async function runInputUtilityComponentsTests() {
    try {
        // Import the actual components for testing
        const { ColorPicker, DateTimePicker, NumberInput, Accordion, Drawer, SearchBox } = 
            await import('../objects/input-utility-components.js');
        
        // Make components available globally for tests
        globalThis.ColorPicker = ColorPicker;
        globalThis.DateTimePicker = DateTimePicker;
        globalThis.NumberInput = NumberInput;
        globalThis.Accordion = Accordion;
        globalThis.Drawer = Drawer;
        globalThis.SearchBox = SearchBox;
        
        // Run tests
        const functionalTests = new InputUtilityComponentsTest();
        await functionalTests.runTests();
        
        const performanceTests = new PerformanceTests();
        await performanceTests.runPerformanceTests();
        
        const memoryTests = new MemoryTests();
        await memoryTests.runMemoryTests();
        
        console.log('\n✅ All tests completed!');
        
    } catch (error) {
        console.error('❌ Test execution failed:', error);
    }
}

// Auto-run tests if this file is executed directly
if (typeof window !== 'undefined' && window.location.pathname.includes('test')) {
    runInputUtilityComponentsTests();
}

export default { runInputUtilityComponentsTests };
