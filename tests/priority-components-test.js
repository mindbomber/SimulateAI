/**
 * Priority Components Test Suite
 * Comprehensive tests for DataTable, NotificationToast, and LoadingSpinner
 */

import { DataTable, NotificationToast, LoadingSpinner } from '../src/js/objects/priority-components.js';
import VisualEngine from '../src/js/core/visual-engine.js';

class PriorityComponentsTestSuite {
    constructor() {
        this.tests = [];
        this.passed = 0;
        this.failed = 0;
        this.engine = null;
        this.testContainer = null;
    }

    async init() {
        console.log('🧪 Initializing Priority Components Test Suite...');
        
        // Create test container
        this.testContainer = document.createElement('div');
        this.testContainer.id = 'test-container';
        this.testContainer.style.cssText = `
            width: 800px;
            height: 600px;
            border: 1px solid #ccc;
            margin: 20px;
            display: none;
        `;
        document.body.appendChild(this.testContainer);

        // Initialize Visual Engine for testing
        this.engine = new VisualEngine(this.testContainer, {
            width: 800,
            height: 600,
            renderMode: 'canvas'
        });

        this.registerTests();
        await this.runAllTests();
        this.generateReport();
    }

    registerTests() {
        // DataTable Tests
        this.addTest('DataTable Creation', this.testDataTableCreation.bind(this));
        this.addTest('DataTable Data Management', this.testDataTableDataManagement.bind(this));
        this.addTest('DataTable Sorting', this.testDataTableSorting.bind(this));
        this.addTest('DataTable Filtering', this.testDataTableFiltering.bind(this));
        this.addTest('DataTable Selection', this.testDataTableSelection.bind(this));
        this.addTest('DataTable Pagination', this.testDataTablePagination.bind(this));
        this.addTest('DataTable Export', this.testDataTableExport.bind(this));

        // NotificationToast Tests
        this.addTest('NotificationToast Creation', this.testNotificationToastCreation.bind(this));
        this.addTest('NotificationToast Types', this.testNotificationToastTypes.bind(this));
        this.addTest('NotificationToast Auto-dismiss', this.testNotificationToastAutoDismiss.bind(this));
        this.addTest('NotificationToast Actions', this.testNotificationToastActions.bind(this));

        // LoadingSpinner Tests
        this.addTest('LoadingSpinner Creation', this.testLoadingSpinnerCreation.bind(this));
        this.addTest('LoadingSpinner Modes', this.testLoadingSpinnerModes.bind(this));
        this.addTest('LoadingSpinner Progress', this.testLoadingSpinnerProgress.bind(this));
        this.addTest('LoadingSpinner Sizes', this.testLoadingSpinnerSizes.bind(this));

        // Integration Tests
        this.addTest('Component Registry Integration', this.testComponentRegistryIntegration.bind(this));
        this.addTest('Event System Integration', this.testEventSystemIntegration.bind(this));
        this.addTest('Accessibility Features', this.testAccessibilityFeatures.bind(this));
        this.addTest('Performance with Large Data', this.testPerformanceWithLargeData.bind(this));
    }

    addTest(name, testFunction) {
        this.tests.push({ name, testFunction });
    }

    async runAllTests() {
        console.log(`🚀 Running ${this.tests.length} tests...`);
        
        for (const test of this.tests) {
            try {
                console.log(`📝 Testing: ${test.name}`);
                await test.testFunction();
                this.passed++;
                console.log(`✅ ${test.name} - PASSED`);
            } catch (error) {
                this.failed++;
                console.error(`❌ ${test.name} - FAILED:`, error);
            }
        }
    }

    // =============================================================================
    // DATA TABLE TESTS
    // =============================================================================

    async testDataTableCreation() {
        const testData = [
            { id: 1, name: 'Test 1', value: 100 },
            { id: 2, name: 'Test 2', value: 200 }
        ];

        const dataTable = new DataTable({
            x: 10, y: 10, width: 400, height: 200,
            columns: [
                { key: 'id', title: 'ID', sortable: true },
                { key: 'name', title: 'Name', sortable: true },
                { key: 'value', title: 'Value', type: 'number', sortable: true }
            ],
            data: testData
        });

        this.assert(dataTable.data.length === 2, 'DataTable should have 2 rows');
        this.assert(dataTable.columns.length === 3, 'DataTable should have 3 columns');
        this.assert(dataTable.pagination === true, 'Pagination should be enabled by default');
        this.assert(dataTable.selectable === true, 'Selection should be enabled by default');
    }

    async testDataTableDataManagement() {
        const initialData = [
            { id: 1, name: 'Item 1', value: 100 },
            { id: 2, name: 'Item 2', value: 200 }
        ];

        const dataTable = new DataTable({
            columns: [
                { key: 'id', title: 'ID' },
                { key: 'name', title: 'Name' },
                { key: 'value', title: 'Value' }
            ],
            data: initialData
        });

        // Test initial data
        this.assert(dataTable.getFilteredData().length === 2, 'Should have 2 filtered rows initially');

        // Test data update
        const newData = [
            { id: 3, name: 'Item 3', value: 300 },
            { id: 4, name: 'Item 4', value: 400 },
            { id: 5, name: 'Item 5', value: 500 }
        ];

        dataTable.setData(newData);
        this.assert(dataTable.data.length === 3, 'Should have 3 rows after update');
        this.assert(dataTable.selectedRows.size === 0, 'Selection should be cleared after data update');
    }

    async testDataTableSorting() {
        const testData = [
            { id: 3, name: 'Charlie', value: 100 },
            { id: 1, name: 'Alice', value: 300 },
            { id: 2, name: 'Bob', value: 200 }
        ];

        const dataTable = new DataTable({
            columns: [
                { key: 'id', title: 'ID', sortable: true },
                { key: 'name', title: 'Name', sortable: true },
                { key: 'value', title: 'Value', sortable: true }
            ],
            data: testData
        });

        // Test sorting by ID (ascending)
        dataTable.sortByColumn('id');
        const sortedData = dataTable.getFilteredData();
        this.assert(sortedData[0].id === 1, 'First item should have ID 1 after ascending sort');
        this.assert(sortedData[2].id === 3, 'Last item should have ID 3 after ascending sort');

        // Test sorting by ID (descending)
        dataTable.sortByColumn('id');
        const descendingSorted = dataTable.getFilteredData();
        this.assert(descendingSorted[0].id === 3, 'First item should have ID 3 after descending sort');
        this.assert(descendingSorted[2].id === 1, 'Last item should have ID 1 after descending sort');

        // Test sorting by name
        dataTable.sortByColumn('name');
        const nameSorted = dataTable.getFilteredData();
        this.assert(nameSorted[0].name === 'Alice', 'First item should be Alice after name sort');
    }

    async testDataTableFiltering() {
        const testData = [
            { id: 1, name: 'Apple', category: 'Fruit' },
            { id: 2, name: 'Banana', category: 'Fruit' },
            { id: 3, name: 'Carrot', category: 'Vegetable' }
        ];

        const dataTable = new DataTable({
            columns: [
                { key: 'id', title: 'ID' },
                { key: 'name', title: 'Name' },
                { key: 'category', title: 'Category' }
            ],
            data: testData
        });

        // Test name filter
        dataTable.setFilter('name', 'app');
        let filtered = dataTable.getFilteredData();
        this.assert(filtered.length === 1, 'Should have 1 item when filtering by "app"');
        this.assert(filtered[0].name === 'Apple', 'Filtered item should be Apple');

        // Test category filter
        dataTable.setFilter('category', 'fruit');
        filtered = dataTable.getFilteredData();
        this.assert(filtered.length === 0, 'Should have 0 items when filtering by both name and category');

        // Clear name filter
        dataTable.setFilter('name', '');
        filtered = dataTable.getFilteredData();
        this.assert(filtered.length === 2, 'Should have 2 items when filtering only by category');
    }

    async testDataTableSelection() {
        const testData = [
            { id: 1, name: 'Item 1' },
            { id: 2, name: 'Item 2' },
            { id: 3, name: 'Item 3' }
        ];

        const dataTable = new DataTable({
            columns: [
                { key: 'id', title: 'ID' },
                { key: 'name', title: 'Name' }
            ],
            data: testData
        });

        // Test single selection
        dataTable.selectRow(0);
        this.assert(dataTable.selectedRows.has(0), 'Row 0 should be selected');
        this.assert(dataTable.selectedRows.size === 1, 'Should have 1 selected row');

        // Test multi-selection
        dataTable.selectRow(1, true);
        this.assert(dataTable.selectedRows.size === 2, 'Should have 2 selected rows');

        // Test deselection
        dataTable.selectRow(0, true);
        this.assert(!dataTable.selectedRows.has(0), 'Row 0 should be deselected');
        this.assert(dataTable.selectedRows.size === 1, 'Should have 1 selected row after deselection');

        // Test get selected data
        const selectedData = dataTable.getSelectedData();
        this.assert(selectedData.length === 1, 'Should return 1 selected data item');
        this.assert(selectedData[0].id === 2, 'Selected item should have ID 2');
    }

    async testDataTablePagination() {
        const testData = Array.from({ length: 25 }, (_, i) => ({
            id: i + 1,
            name: `Item ${i + 1}`
        }));

        const dataTable = new DataTable({
            columns: [
                { key: 'id', title: 'ID' },
                { key: 'name', title: 'Name' }
            ],
            data: testData,
            pageSize: 10
        });

        // Test initial page
        this.assert(dataTable.currentPage === 1, 'Should start on page 1');
        this.assert(dataTable.totalPages === 3, 'Should have 3 pages total');

        const pageData = dataTable.getCurrentPageData();
        this.assert(pageData.length === 10, 'First page should have 10 items');
        this.assert(pageData[0].id === 1, 'First item on page 1 should have ID 1');

        // Test page navigation
        dataTable.goToPage(2);
        const page2Data = dataTable.getCurrentPageData();
        this.assert(page2Data.length === 10, 'Second page should have 10 items');
        this.assert(page2Data[0].id === 11, 'First item on page 2 should have ID 11');

        // Test last page
        dataTable.goToPage(3);
        const lastPageData = dataTable.getCurrentPageData();
        this.assert(lastPageData.length === 5, 'Last page should have 5 items');
        this.assert(lastPageData[0].id === 21, 'First item on page 3 should have ID 21');
    }

    async testDataTableExport() {
        const testData = [
            { id: 1, name: 'Alice', score: 95.5 },
            { id: 2, name: 'Bob', score: 87.3 }
        ];

        const dataTable = new DataTable({
            columns: [
                { key: 'id', title: 'ID' },
                { key: 'name', title: 'Name' },
                { key: 'score', title: 'Score' }
            ],
            data: testData
        });

        // Test JSON export
        const jsonExport = dataTable.exportData('json');
        const parsed = JSON.parse(jsonExport);
        this.assert(parsed.length === 2, 'JSON export should have 2 items');
        this.assert(parsed[0].name === 'Alice', 'First item should be Alice');

        // Test CSV export
        const csvExport = dataTable.exportData('csv');
        const lines = csvExport.split('\n');
        this.assert(lines[0] === 'ID,Name,Score', 'CSV header should be correct');
        this.assert(lines[1] === '1,Alice,95.5', 'First CSV row should be correct');
    }

    // =============================================================================
    // NOTIFICATION TOAST TESTS
    // =============================================================================

    async testNotificationToastCreation() {
        const toast = new NotificationToast({
            message: 'Test notification',
            type: 'info',
            duration: 3000
        });

        this.assert(toast.message === 'Test notification', 'Message should be set correctly');
        this.assert(toast.type === 'info', 'Type should be set correctly');
        this.assert(toast.duration === 3000, 'Duration should be set correctly');
        this.assert(toast.dismissible === true, 'Should be dismissible by default');
    }

    async testNotificationToastTypes() {
        const types = ['success', 'error', 'warning', 'info'];
        
        for (const type of types) {
            const toast = new NotificationToast({
                message: `Test ${type} notification`,
                type: type
            });

            this.assert(toast.type === type, `Type should be ${type}`);
            
            const colors = toast.getTypeColors();
            this.assert(colors.background, `${type} should have background color`);
            this.assert(colors.accent, `${type} should have accent color`);
            this.assert(colors.text, `${type} should have text color`);
        }
    }

    async testNotificationToastAutoDismiss() {
        return new Promise((resolve, reject) => {
            const toast = new NotificationToast({
                message: 'Auto-dismiss test',
                duration: 100 // Short duration for testing
            });

            let showFired = false;
            let hideFired = false;

            toast.on('show', () => {
                showFired = true;
            });

            toast.on('hide', () => {
                hideFired = true;
            });

            toast.on('remove', () => {
                try {
                    this.assert(showFired, 'Show event should have fired');
                    this.assert(hideFired, 'Hide event should have fired');
                    this.assert(!toast.isVisible, 'Toast should not be visible after removal');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async testNotificationToastActions() {
        let actionCalled = false;

        const toast = new NotificationToast({
            message: 'Test with actions',
            actions: [
                {
                    text: 'Action 1',
                    callback: () => { actionCalled = true; }
                },
                {
                    text: 'Close',
                    action: 'close'
                }
            ]
        });

        this.assert(toast.actions.length === 2, 'Should have 2 actions');
        this.assert(toast.actions[0].text === 'Action 1', 'First action text should be correct');
        
        // Simulate action click
        toast.actions[0].callback();
        this.assert(actionCalled, 'Action callback should be called');
    }

    // =============================================================================
    // LOADING SPINNER TESTS
    // =============================================================================

    async testLoadingSpinnerCreation() {
        const spinner = new LoadingSpinner({
            message: 'Loading test',
            size: 'medium',
            progress: null
        });

        this.assert(spinner.message === 'Loading test', 'Message should be set correctly');
        this.assert(spinner.size === 'medium', 'Size should be set correctly');
        this.assert(spinner.progress === null, 'Should be indeterminate by default');
        this.assert(spinner.overlay === true, 'Overlay should be enabled by default');
    }

    async testLoadingSpinnerModes() {
        // Test indeterminate mode
        const indeterminateSpinner = new LoadingSpinner({
            progress: null
        });
        this.assert(indeterminateSpinner.progress === null, 'Should be indeterminate');

        // Test determinate mode
        const determinateSpinner = new LoadingSpinner({
            progress: 0.5
        });
        this.assert(determinateSpinner.progress === 0.5, 'Should be 50% progress');
    }

    async testLoadingSpinnerProgress() {
        const spinner = new LoadingSpinner({
            progress: 0
        });

        // Test progress update
        spinner.setProgress(0.25);
        this.assert(spinner.progress === 0.25, 'Progress should be updated to 25%');

        spinner.setProgress(0.75);
        this.assert(spinner.progress === 0.75, 'Progress should be updated to 75%');

        // Test progress clamping
        spinner.setProgress(1.5);
        this.assert(spinner.progress === 1, 'Progress should be clamped to 100%');

        spinner.setProgress(-0.1);
        this.assert(spinner.progress === 0, 'Progress should be clamped to 0%');
    }

    async testLoadingSpinnerSizes() {
        const sizes = ['small', 'medium', 'large'];
        
        for (const size of sizes) {
            const spinner = new LoadingSpinner({ size });
            this.assert(spinner.size === size, `Size should be ${size}`);
            this.assert(spinner.spinnerSize > 0, `${size} should have positive spinner size`);
        }
    }

    // =============================================================================
    // INTEGRATION TESTS
    // =============================================================================

    async testComponentRegistryIntegration() {
        // Test component registration
        this.assert(this.engine.componentRegistry.has('data-table'), 'DataTable should be registered');
        this.assert(this.engine.componentRegistry.has('notification-toast'), 'NotificationToast should be registered');
        this.assert(this.engine.componentRegistry.has('loading-spinner'), 'LoadingSpinner should be registered');

        // Test component creation
        const dataTable = this.engine.createComponent('data-table', {
            columns: [{ key: 'test', title: 'Test' }],
            data: [{ test: 'value' }]
        });
        this.assert(dataTable instanceof DataTable, 'Created component should be DataTable instance');

        const toast = this.engine.createComponent('notification-toast', {
            message: 'Test'
        });
        this.assert(toast instanceof NotificationToast, 'Created component should be NotificationToast instance');

        const spinner = this.engine.createComponent('loading-spinner', {
            message: 'Loading'
        });
        this.assert(spinner instanceof LoadingSpinner, 'Created component should be LoadingSpinner instance');

        // Test component tracking
        const allDataTables = this.engine.getComponentsByType('data-table');
        this.assert(allDataTables.length >= 1, 'Should track DataTable instances');
    }

    async testEventSystemIntegration() {
        const dataTable = this.engine.createComponent('data-table', {
            columns: [{ key: 'id', title: 'ID' }],
            data: [{ id: 1 }, { id: 2 }]
        });

        let eventFired = false;
        dataTable.on('sort', () => {
            eventFired = true;
        });

        dataTable.sortByColumn('id');
        this.assert(eventFired, 'Sort event should fire when sorting');

        const toast = this.engine.createComponent('notification-toast', {
            message: 'Event test',
            duration: 50
        });

        return new Promise((resolve, reject) => {
            toast.on('show', () => {
                try {
                    this.assert(true, 'Show event should fire');
                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }

    async testAccessibilityFeatures() {
        const dataTable = this.engine.createComponent('data-table', {
            columns: [{ key: 'test', title: 'Test' }],
            data: [{ test: 'value' }]
        });

        this.assert(dataTable.ariaRole === 'table', 'DataTable should have table ARIA role');

        const toast = this.engine.createComponent('notification-toast', {
            message: 'Accessibility test'
        });

        this.assert(toast.ariaRole === 'alert', 'NotificationToast should have alert ARIA role');

        const spinner = this.engine.createComponent('loading-spinner', {
            message: 'Loading'
        });

        this.assert(spinner.ariaRole === 'progressbar', 'LoadingSpinner should have progressbar ARIA role');
    }

    async testPerformanceWithLargeData() {
        // Generate large dataset
        const largeData = Array.from({ length: 1000 }, (_, i) => ({
            id: i,
            name: `Item ${i}`,
            value: Math.random() * 1000,
            category: `Category ${i % 10}`
        }));

        const startTime = performance.now();

        const dataTable = this.engine.createComponent('data-table', {
            columns: [
                { key: 'id', title: 'ID', sortable: true },
                { key: 'name', title: 'Name', sortable: true },
                { key: 'value', title: 'Value', sortable: true },
                { key: 'category', title: 'Category', sortable: true }
            ],
            data: largeData,
            pageSize: 50
        });

        const creationTime = performance.now() - startTime;
        this.assert(creationTime < 100, 'Large dataset creation should be fast (<100ms)');

        // Test sorting performance
        const sortStartTime = performance.now();
        dataTable.sortByColumn('value');
        const sortTime = performance.now() - sortStartTime;
        this.assert(sortTime < 50, 'Sorting large dataset should be fast (<50ms)');

        // Test filtering performance
        const filterStartTime = performance.now();
        dataTable.setFilter('category', 'Category 5');
        const filterTime = performance.now() - filterStartTime;
        this.assert(filterTime < 20, 'Filtering large dataset should be fast (<20ms)');

        this.assert(dataTable.getFilteredData().length === 100, 'Should filter to 100 items');
    }

    // =============================================================================
    // TEST UTILITIES
    // =============================================================================

    assert(condition, message) {
        if (!condition) {
            throw new Error(`Assertion failed: ${message}`);
        }
    }

    generateReport() {
        const total = this.passed + this.failed;
        const successRate = total > 0 ? (this.passed / total * 100).toFixed(1) : 0;

        console.log('\n' + '='.repeat(60));
        console.log('🧪 PRIORITY COMPONENTS TEST RESULTS');
        console.log('='.repeat(60));
        console.log(`Total Tests: ${total}`);
        console.log(`✅ Passed: ${this.passed}`);
        console.log(`❌ Failed: ${this.failed}`);
        console.log(`📊 Success Rate: ${successRate}%`);
        console.log('='.repeat(60));

        if (this.failed === 0) {
            console.log('🎉 All tests passed! Components are ready for production.');
        } else {
            console.log('⚠️  Some tests failed. Please review and fix issues.');
        }

        // Cleanup
        if (this.engine) {
            this.engine.stop();
        }
        if (this.testContainer) {
            this.testContainer.remove();
        }

        return {
            total,
            passed: this.passed,
            failed: this.failed,
            successRate: parseFloat(successRate)
        };
    }
}

// Export for use in test runner
export default PriorityComponentsTestSuite;

// Auto-run tests if loaded directly
if (typeof window !== 'undefined' && window.location.search.includes('run-tests=true')) {
    document.addEventListener('DOMContentLoaded', async () => {
        const testSuite = new PriorityComponentsTestSuite();
        await testSuite.init();
    });
}
