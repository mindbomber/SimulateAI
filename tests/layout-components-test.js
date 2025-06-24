/**
 * Layout Components Test Suite
 * Comprehensive tests for TabContainer, ProgressStepper, SplitPane, TreeView, and FileUpload
 */

import { VisualEngine } from '../src/js/core/visual-engine.js';
import { 
    TabContainer, 
    ProgressStepper, 
    SplitPane, 
    TreeView, 
    FileUpload 
} from '../src/js/objects/layout-components.js';

describe('Layout Components', () => {
    let engine;
    let container;

    beforeEach(() => {
        // Create test container
        container = document.createElement('div');
        container.style.width = '800px';
        container.style.height = '600px';
        document.body.appendChild(container);
        
        // Initialize engine
        engine = new VisualEngine(container, {
            width: 800,
            height: 600,
            renderMode: 'canvas'
        });
    });

    afterEach(() => {
        if (engine) {
            engine.destroy();
        }
        if (container) {
            document.body.removeChild(container);
        }
    });

    // =============================================================================
    // TAB CONTAINER TESTS
    // =============================================================================

    describe('TabContainer', () => {
        let tabContainer;

        beforeEach(() => {
            tabContainer = new TabContainer({
                x: 0,
                y: 0,
                width: 400,
                height: 300,
                tabs: [
                    { id: 'tab1', title: 'Tab 1', content: 'Content 1' },
                    { id: 'tab2', title: 'Tab 2', content: 'Content 2' },
                    { id: 'tab3', title: 'Tab 3', content: 'Content 3', closeable: false }
                ]
            });
        });

        it('should initialize with correct default values', () => {
            expect(tabContainer.tabs.length).toBe(3);
            expect(tabContainer.activeTabIndex).toBe(0);
            expect(tabContainer.closeable).toBe(true);
            expect(tabContainer.reorderable).toBe(true);
        });

        it('should create default tab when no tabs provided', () => {
            const emptyContainer = new TabContainer({ x: 0, y: 0 });
            expect(emptyContainer.tabs.length).toBe(1);
            expect(emptyContainer.tabs[0].title).toBe('Tab 1');
        });

        it('should add new tabs correctly', () => {
            const initialCount = tabContainer.tabs.length;
            const result = tabContainer.addTab({
                id: 'new-tab',
                title: 'New Tab',
                content: 'New Content'
            });
            
            expect(result).toBe(true);
            expect(tabContainer.tabs.length).toBe(initialCount + 1);
            expect(tabContainer.tabs[tabContainer.tabs.length - 1].id).toBe('new-tab');
        });

        it('should prevent adding tabs when at maxTabs limit', () => {
            tabContainer.maxTabs = 3;
            const result = tabContainer.addTab({
                id: 'overflow-tab',
                title: 'Overflow Tab'
            });
            
            expect(result).toBe(false);
            expect(tabContainer.tabs.length).toBe(3);
        });

        it('should remove closeable tabs correctly', () => {
            const initialCount = tabContainer.tabs.length;
            const result = tabContainer.removeTab(1); // Remove tab2
            
            expect(result).toBe(true);
            expect(tabContainer.tabs.length).toBe(initialCount - 1);
            expect(tabContainer.tabs.find(tab => tab.id === 'tab2')).toBeUndefined();
        });

        it('should not remove non-closeable tabs', () => {
            const result = tabContainer.removeTab(2); // Try to remove tab3 (closeable: false)
            
            expect(result).toBe(false);
            expect(tabContainer.tabs.length).toBe(3);
        });

        it('should not remove the last remaining tab', () => {
            // Remove all but one tab
            tabContainer.removeTab(1);
            tabContainer.removeTab(0);
            
            const result = tabContainer.removeTab(0);
            expect(result).toBe(false);
            expect(tabContainer.tabs.length).toBe(1);
        });

        it('should set active tab correctly', () => {
            tabContainer.setActiveTab(1);
            expect(tabContainer.activeTabIndex).toBe(1);
            expect(tabContainer.getActiveTab().id).toBe('tab2');
        });

        it('should not set active tab to disabled tab', () => {
            tabContainer.tabs[1].disabled = true;
            tabContainer.setActiveTab(1);
            expect(tabContainer.activeTabIndex).toBe(0); // Should remain unchanged
        });

        it('should update tab properties correctly', () => {
            tabContainer.updateTab(0, { title: 'Updated Title', badge: '5' });
            expect(tabContainer.tabs[0].title).toBe('Updated Title');
            expect(tabContainer.tabs[0].badge).toBe('5');
        });

        it('should handle click events correctly', () => {
            let eventFired = false;
            tabContainer.on('tabChanged', () => { eventFired = true; });
            
            // Simulate click on second tab
            const tabWidth = tabContainer.width / tabContainer.tabs.length;
            tabContainer.handleClick({
                localX: tabWidth * 1.5, // Middle of second tab
                localY: 10
            });
            
            expect(tabContainer.activeTabIndex).toBe(1);
            expect(eventFired).toBe(true);
        });

        it('should handle close button clicks', () => {
            let eventFired = false;
            tabContainer.on('tabRemoved', () => { eventFired = true; });
            
            // Simulate click on close button of first tab
            const tabWidth = tabContainer.width / tabContainer.tabs.length;
            tabContainer.handleClick({
                localX: tabWidth - 10, // Close button area
                localY: 10
            });
            
            expect(eventFired).toBe(true);
        });

        it('should find tabs by ID correctly', () => {
            const tab = tabContainer.getTabById('tab2');
            expect(tab).toBeDefined();
            expect(tab.title).toBe('Tab 2');
            
            const index = tabContainer.getTabIndex('tab2');
            expect(index).toBe(1);
        });
    });

    // =============================================================================
    // PROGRESS STEPPER TESTS
    // =============================================================================

    describe('ProgressStepper', () => {
        let stepper;

        beforeEach(() => {
            stepper = new ProgressStepper({
                x: 0,
                y: 0,
                width: 600,
                height: 80,
                steps: [
                    { id: 'step1', title: 'First Step', completed: true },
                    { id: 'step2', title: 'Second Step', completed: false },
                    { id: 'step3', title: 'Third Step', completed: false }
                ],
                currentStep: 1
            });
        });

        it('should initialize with correct values', () => {
            expect(stepper.steps.length).toBe(3);
            expect(stepper.currentStep).toBe(1);
            expect(stepper.orientation).toBe('horizontal');
            expect(stepper.allowStepClick).toBe(true);
        });

        it('should navigate to next step correctly', () => {
            stepper.nextStep();
            expect(stepper.currentStep).toBe(2);
        });

        it('should navigate to previous step correctly', () => {
            stepper.previousStep();
            expect(stepper.currentStep).toBe(0);
        });

        it('should not navigate beyond boundaries', () => {
            stepper.currentStep = 0;
            stepper.previousStep();
            expect(stepper.currentStep).toBe(0);
            
            stepper.currentStep = 2;
            stepper.nextStep();
            expect(stepper.currentStep).toBe(2);
        });

        it('should complete steps correctly', () => {
            stepper.completeStep(1);
            expect(stepper.steps[1].completed).toBe(true);
        });

        it('should calculate last completed step correctly', () => {
            expect(stepper.getLastCompletedStep()).toBe(0);
            
            stepper.completeStep(1);
            expect(stepper.getLastCompletedStep()).toBe(1);
        });

        it('should determine step status correctly', () => {
            expect(stepper.getStepStatus(0)).toBe('completed');
            expect(stepper.getStepStatus(1)).toBe('active');
            expect(stepper.getStepStatus(2)).toBe('inactive');
            
            stepper.steps[2].disabled = true;
            expect(stepper.getStepStatus(2)).toBe('disabled');
        });

        it('should handle click navigation when allowed', () => {
            let eventFired = false;
            stepper.on('stepChanged', () => { eventFired = true; });
            
            // Click on third step
            const stepWidth = stepper.width / stepper.steps.length;
            stepper.handleClick({
                localX: stepWidth * 2.5,
                localY: 40
            });
            
            expect(stepper.currentStep).toBe(2);
            expect(eventFired).toBe(true);
        });

        it('should respect allowStepClick setting', () => {
            stepper.allowStepClick = false;
            const oldStep = stepper.currentStep;
            
            stepper.handleClick({
                localX: 100,
                localY: 40
            });
            
            expect(stepper.currentStep).toBe(oldStep);
        });

        it('should calculate progress correctly', () => {
            expect(stepper.getProgress()).toBeCloseTo(1/3); // 1 out of 3 completed
            
            stepper.completeStep(1);
            expect(stepper.getProgress()).toBeCloseTo(2/3); // 2 out of 3 completed
        });

        it('should reset correctly', () => {
            stepper.completeStep(1);
            stepper.currentStep = 2;
            
            stepper.reset();
            
            expect(stepper.currentStep).toBe(0);
            expect(stepper.steps.every(step => !step.completed)).toBe(true);
        });
    });

    // =============================================================================
    // SPLIT PANE TESTS
    // =============================================================================

    describe('SplitPane', () => {
        let splitPane;

        beforeEach(() => {
            splitPane = new SplitPane({
                x: 0,
                y: 0,
                width: 400,
                height: 300,
                orientation: 'horizontal',
                split: 0.5,
                leftPane: 'Left content',
                rightPane: 'Right content'
            });
        });

        it('should initialize with correct values', () => {
            expect(splitPane.orientation).toBe('horizontal');
            expect(splitPane.split).toBe(0.5);
            expect(splitPane.resizable).toBe(true);
            expect(splitPane.collapsed).toBeNull();
        });

        it('should calculate splitter bounds correctly', () => {
            const bounds = splitPane.getSplitterBounds();
            expect(bounds.x).toBeCloseTo(200 - splitPane.splitterSize / 2);
            expect(bounds.width).toBe(splitPane.splitterSize);
            expect(bounds.height).toBe(splitPane.height);
        });

        it('should calculate pane bounds correctly', () => {
            const leftBounds = splitPane.getLeftPaneBounds();
            const rightBounds = splitPane.getRightPaneBounds();
            
            expect(leftBounds.width).toBeCloseTo(200 - splitPane.splitterSize / 2);
            expect(rightBounds.x).toBeCloseTo(200 + splitPane.splitterSize / 2);
        });

        it('should detect point in splitter correctly', () => {
            const inSplitter = splitPane.isPointInSplitter(200, 150);
            const notInSplitter = splitPane.isPointInSplitter(100, 150);
            
            expect(inSplitter).toBe(true);
            expect(notInSplitter).toBe(false);
        });

        it('should set split ratio with constraints', () => {
            splitPane.setSplit(0.1);
            expect(splitPane.split).toBeGreaterThan(0.1); // Should be constrained by minSize
            
            splitPane.setSplit(0.9);
            expect(splitPane.split).toBeLessThan(0.9); // Should be constrained by minSize
        });

        it('should handle collapsing correctly', () => {
            splitPane.collapsible = true;
            splitPane.collapse('left');
            expect(splitPane.collapsed).toBe('left');
            
            splitPane.collapse('left'); // Toggle
            expect(splitPane.collapsed).toBeNull();
        });

        it('should handle mouse down for resizing', () => {
            splitPane.handleMouseDown({
                localX: 200,
                localY: 150,
                preventDefault: jest.fn()
            });
            
            expect(splitPane.isResizing).toBe(true);
        });

        it('should handle mouse move for resizing', () => {
            splitPane.isResizing = true;
            splitPane.startMousePos = 200;
            splitPane.startSplit = 0.5;
            
            splitPane.handleMouseMove({
                localX: 250,
                localY: 150
            });
            
            expect(splitPane.split).toBeGreaterThan(0.5);
        });

        it('should handle double click for collapsing', () => {
            splitPane.collapsible = true;
            let eventFired = false;
            splitPane.on('paneCollapsed', () => { eventFired = true; });
            
            splitPane.handleDoubleClick({
                localX: 200,
                localY: 150
            });
            
            expect(eventFired).toBe(true);
            expect(splitPane.collapsed).toBeDefined();
        });
    });

    // =============================================================================
    // TREE VIEW TESTS
    // =============================================================================

    describe('TreeView', () => {
        let treeView;
        const sampleData = [
            {
                id: 'root1',
                label: 'Root 1',
                children: [
                    { id: 'child1', label: 'Child 1' },
                    { id: 'child2', label: 'Child 2' }
                ]
            },
            { id: 'root2', label: 'Root 2' }
        ];

        beforeEach(() => {
            treeView = new TreeView({
                x: 0,
                y: 0,
                width: 300,
                height: 400,
                data: sampleData
            });
        });

        it('should initialize with correct values', () => {
            expect(treeView.data.length).toBe(2);
            expect(treeView.multiSelect).toBe(false);
            expect(treeView.showIcons).toBe(true);
            expect(treeView.nodeHeight).toBe(24);
        });

        it('should build visible nodes correctly', () => {
            expect(treeView.visibleNodes.length).toBe(2); // Only root nodes initially
            expect(treeView.visibleNodes[0].id).toBe('root1');
            expect(treeView.visibleNodes[1].id).toBe('root2');
        });

        it('should expand nodes correctly', () => {
            treeView.expandNode('root1');
            expect(treeView.expandedNodes.has('root1')).toBe(true);
            expect(treeView.visibleNodes.length).toBe(4); // Root1, Child1, Child2, Root2
        });

        it('should collapse nodes correctly', () => {
            treeView.expandNode('root1');
            treeView.collapseNode('root1');
            expect(treeView.expandedNodes.has('root1')).toBe(false);
            expect(treeView.visibleNodes.length).toBe(2);
        });

        it('should toggle nodes correctly', () => {
            treeView.toggleNode('root1');
            expect(treeView.expandedNodes.has('root1')).toBe(true);
            
            treeView.toggleNode('root1');
            expect(treeView.expandedNodes.has('root1')).toBe(false);
        });

        it('should select nodes correctly', () => {
            let eventFired = false;
            treeView.on('nodeSelected', () => { eventFired = true; });
            
            treeView.selectNode('root1');
            expect(treeView.selectedNodes.has('root1')).toBe(true);
            expect(treeView.selectedNode).toBe('root1');
            expect(eventFired).toBe(true);
        });

        it('should handle multi-selection correctly', () => {
            treeView.multiSelect = true;
            
            treeView.selectNode('root1');
            treeView.selectNode('root2', true); // Add to selection
            
            expect(treeView.selectedNodes.has('root1')).toBe(true);
            expect(treeView.selectedNodes.has('root2')).toBe(true);
        });

        it('should find nodes correctly', () => {
            const node = treeView.findNode('child1');
            expect(node).toBeDefined();
            expect(node.label).toBe('Child 1');
            
            const notFound = treeView.findNode('nonexistent');
            expect(notFound).toBeNull();
        });

        it('should get node at position correctly', () => {
            const result = treeView.getNodeAtPosition(12); // Middle of first node
            expect(result).toBeDefined();
            expect(result.node.id).toBe('root1');
            expect(result.index).toBe(0);
        });

        it('should handle click events correctly', () => {
            let selectionFired = false;
            let expandFired = false;
            
            treeView.on('nodeSelected', () => { selectionFired = true; });
            treeView.on('nodeExpanded', () => { expandFired = true; });
            
            // Click on expand icon
            treeView.handleClick({ localX: 10, localY: 12 });
            expect(expandFired).toBe(true);
            
            // Click on node content
            treeView.handleClick({ localX: 50, localY: 12 });
            expect(selectionFired).toBe(true);
        });

        it('should handle wheel events for scrolling', () => {
            const initialScrollY = treeView.scrollY;
            treeView.handleWheel({ deltaY: 50 });
            expect(treeView.scrollY).toBeGreaterThan(initialScrollY);
        });

        it('should expand and collapse all correctly', () => {
            treeView.expandAll();
            expect(treeView.expandedNodes.has('root1')).toBe(true);
            expect(treeView.visibleNodes.length).toBe(4);
            
            treeView.collapseAll();
            expect(treeView.expandedNodes.size).toBe(0);
            expect(treeView.visibleNodes.length).toBe(2);
        });
    });

    // =============================================================================
    // FILE UPLOAD TESTS
    // =============================================================================

    describe('FileUpload', () => {
        let fileUpload;

        beforeEach(() => {
            fileUpload = new FileUpload({
                x: 0,
                y: 0,
                width: 400,
                height: 200,
                multiple: true,
                accept: 'image/*,.pdf',
                maxFileSize: 1024 * 1024 // 1MB
            });
        });

        it('should initialize with correct values', () => {
            expect(fileUpload.multiple).toBe(true);
            expect(fileUpload.accept).toBe('image/*,.pdf');
            expect(fileUpload.maxFileSize).toBe(1024 * 1024);
            expect(fileUpload.files.length).toBe(0);
        });

        it('should validate files correctly', () => {
            const validFile = { 
                name: 'image.jpg', 
                size: 500000, 
                type: 'image/jpeg' 
            };
            const invalidSizeFile = { 
                name: 'large.jpg', 
                size: 2 * 1024 * 1024, 
                type: 'image/jpeg' 
            };
            const invalidTypeFile = { 
                name: 'document.txt', 
                size: 1000, 
                type: 'text/plain' 
            };
            
            expect(fileUpload.validateFile(validFile)).toBe(true);
            expect(fileUpload.validateFile(invalidSizeFile)).toBe(false);
            expect(fileUpload.validateFile(invalidTypeFile)).toBe(false);
        });

        it('should add valid files correctly', () => {
            const files = [
                { name: 'image1.jpg', size: 100000, type: 'image/jpeg' },
                { name: 'document.pdf', size: 200000, type: 'application/pdf' }
            ];
            
            let addedEventFired = false;
            fileUpload.on('filesAdded', () => { addedEventFired = true; });
            
            fileUpload.addFiles(files);
            
            expect(fileUpload.files.length).toBe(2);
            expect(addedEventFired).toBe(true);
        });

        it('should reject invalid files', () => {
            const files = [
                { name: 'valid.jpg', size: 100000, type: 'image/jpeg' },
                { name: 'invalid.txt', size: 1000, type: 'text/plain' }
            ];
            
            let rejectedEventFired = false;
            fileUpload.on('filesRejected', () => { rejectedEventFired = true; });
            
            fileUpload.addFiles(files);
            
            expect(fileUpload.files.length).toBe(1);
            expect(rejectedEventFired).toBe(true);
        });

        it('should respect maxFiles limit', () => {
            fileUpload.maxFiles = 2;
            const files = [
                { name: 'file1.jpg', size: 100000, type: 'image/jpeg' },
                { name: 'file2.jpg', size: 100000, type: 'image/jpeg' },
                { name: 'file3.jpg', size: 100000, type: 'image/jpeg' }
            ];
            
            fileUpload.addFiles(files);
            expect(fileUpload.files.length).toBe(2);
        });

        it('should handle single file mode correctly', () => {
            fileUpload.multiple = false;
            const files = [
                { name: 'file1.jpg', size: 100000, type: 'image/jpeg' },
                { name: 'file2.jpg', size: 100000, type: 'image/jpeg' }
            ];
            
            fileUpload.addFiles(files);
            expect(fileUpload.files.length).toBe(1);
        });

        it('should remove files correctly', () => {
            const files = [
                { name: 'file1.jpg', size: 100000, type: 'image/jpeg' },
                { name: 'file2.jpg', size: 100000, type: 'image/jpeg' }
            ];
            
            fileUpload.addFiles(files);
            
            let removedEventFired = false;
            fileUpload.on('fileRemoved', () => { removedEventFired = true; });
            
            fileUpload.removeFile(0);
            
            expect(fileUpload.files.length).toBe(1);
            expect(removedEventFired).toBe(true);
        });

        it('should clear all files correctly', () => {
            const files = [
                { name: 'file1.jpg', size: 100000, type: 'image/jpeg' }
            ];
            
            fileUpload.addFiles(files);
            
            let clearedEventFired = false;
            fileUpload.on('filesCleared', () => { clearedEventFired = true; });
            
            fileUpload.clearFiles();
            
            expect(fileUpload.files.length).toBe(0);
            expect(clearedEventFired).toBe(true);
        });

        it('should handle drag events correctly', () => {
            fileUpload.handleDragEnter({ preventDefault: jest.fn() });
            expect(fileUpload.isDragOver).toBe(true);
            
            fileUpload.handleDragLeave({});
            expect(fileUpload.isDragOver).toBe(false);
        });

        it('should format file size correctly', () => {
            expect(fileUpload.formatFileSize(0)).toBe('0 B');
            expect(fileUpload.formatFileSize(1024)).toBe('1 KB');
            expect(fileUpload.formatFileSize(1024 * 1024)).toBe('1 MB');
            expect(fileUpload.formatFileSize(1536 * 1024)).toBe('1.5 MB');
        });

        it('should start upload correctly', () => {
            const files = [
                { name: 'file1.jpg', size: 100000, type: 'image/jpeg' }
            ];
            fileUpload.addFiles(files);
            
            let uploadStartedFired = false;
            fileUpload.on('uploadStarted', () => { uploadStartedFired = true; });
            
            fileUpload.startUpload();
            
            expect(fileUpload.isUploading).toBe(true);
            expect(uploadStartedFired).toBe(true);
        });
    });

    // =============================================================================
    // INTEGRATION TESTS
    // =============================================================================

    describe('Component Integration', () => {
        it('should register all layout components in engine', () => {
            expect(engine.componentRegistry.has('tab-container')).toBe(true);
            expect(engine.componentRegistry.has('progress-stepper')).toBe(true);
            expect(engine.componentRegistry.has('split-pane')).toBe(true);
            expect(engine.componentRegistry.has('tree-view')).toBe(true);
            expect(engine.componentRegistry.has('file-upload')).toBe(true);
        });

        it('should create components through engine', () => {
            const tabContainer = engine.createComponent('tab-container', {
                width: 400,
                height: 300
            });
            
            expect(tabContainer).toBeInstanceOf(TabContainer);
            expect(engine.getComponentsByType('tab-container')).toContain(tabContainer);
        });

        it('should destroy components correctly', () => {
            const stepper = engine.createComponent('progress-stepper', {
                width: 400,
                height: 80
            });
            
            engine.destroyComponent(stepper);
            expect(engine.getComponentsByType('progress-stepper')).not.toContain(stepper);
        });

        it('should handle component events correctly', () => {
            const tabContainer = engine.createComponent('tab-container', {
                tabs: [
                    { id: 'tab1', title: 'Tab 1' },
                    { id: 'tab2', title: 'Tab 2' }
                ]
            });
            
            let eventReceived = false;
            tabContainer.on('tabChanged', () => { eventReceived = true; });
            
            tabContainer.setActiveTab(1);
            expect(eventReceived).toBe(true);
        });
    });

    // =============================================================================
    // ACCESSIBILITY TESTS
    // =============================================================================

    describe('Accessibility', () => {
        it('should set correct ARIA roles', () => {
            const tabContainer = new TabContainer({});
            const stepper = new ProgressStepper({});
            const splitPane = new SplitPane({});
            const treeView = new TreeView({ data: [] });
            const fileUpload = new FileUpload({});
            
            expect(tabContainer.ariaRole).toBe('tablist');
            expect(stepper.ariaRole).toBe('progressbar');
            expect(splitPane.ariaRole).toBe('separator');
            expect(treeView.ariaRole).toBe('tree');
            expect(fileUpload.ariaRole).toBe('button');
        });

        it('should support keyboard navigation', () => {
            const tabContainer = new TabContainer({
                tabs: [
                    { id: 'tab1', title: 'Tab 1' },
                    { id: 'tab2', title: 'Tab 2' },
                    { id: 'tab3', title: 'Tab 3' }
                ]
            });
            
            // Test arrow key navigation
            tabContainer.handleKeyDown({ key: 'ArrowRight' });
            expect(tabContainer.activeTabIndex).toBe(1);
            
            tabContainer.handleKeyDown({ key: 'ArrowLeft' });
            expect(tabContainer.activeTabIndex).toBe(0);
            
            tabContainer.handleKeyDown({ key: 'End' });
            expect(tabContainer.activeTabIndex).toBe(2);
            
            tabContainer.handleKeyDown({ key: 'Home' });
            expect(tabContainer.activeTabIndex).toBe(0);
        });
    });

    // =============================================================================
    // PERFORMANCE TESTS
    // =============================================================================

    describe('Performance', () => {
        it('should handle large datasets efficiently', () => {
            const startTime = performance.now();
            
            // Create tree with many nodes
            const largeTreeData = [];
            for (let i = 0; i < 100; i++) {
                largeTreeData.push({
                    id: `node-${i}`,
                    label: `Node ${i}`,
                    children: Array.from({ length: 10 }, (_, j) => ({
                        id: `node-${i}-${j}`,
                        label: `Child ${j}`
                    }))
                });
            }
            
            const treeView = new TreeView({
                x: 0,
                y: 0,
                width: 300,
                height: 400,
                data: largeTreeData
            });
            
            const endTime = performance.now();
            const initTime = endTime - startTime;
            
            expect(initTime).toBeLessThan(100); // Should initialize in less than 100ms
            expect(treeView.visibleNodes.length).toBe(100); // Only root nodes visible initially
        });

        it('should render efficiently', () => {
            const canvas = document.createElement('canvas');
            canvas.width = 800;
            canvas.height = 600;
            const ctx = canvas.getContext('2d');
            
            const mockRenderer = {
                type: 'canvas',
                fillStyle: '',
                strokeStyle: '',
                lineWidth: 1,
                font: '',
                textAlign: '',
                textBaseline: '',
                fillRect: jest.fn(),
                strokeRect: jest.fn(),
                fillText: jest.fn(),
                measureText: jest.fn(() => ({ width: 50 })),
                beginPath: jest.fn(),
                arc: jest.fn(),
                fill: jest.fn(),
                stroke: jest.fn(),
                moveTo: jest.fn(),
                lineTo: jest.fn(),
                save: jest.fn(),
                restore: jest.fn(),
                clip: jest.fn(),
                rect: jest.fn(),
                setLineDash: jest.fn()
            };
            
            const tabContainer = new TabContainer({
                tabs: Array.from({ length: 20 }, (_, i) => ({
                    id: `tab-${i}`,
                    title: `Tab ${i}`
                }))
            });
            
            const startTime = performance.now();
            tabContainer.renderSelf(mockRenderer);
            const endTime = performance.now();
            
            expect(endTime - startTime).toBeLessThan(50); // Should render in less than 50ms
        });
    });
});

// Test helpers and utilities
export const TestUtils = {
    createMockEngine() {
        return {
            createComponent: jest.fn(),
            destroyComponent: jest.fn(),
            addObject: jest.fn(),
            removeObject: jest.fn()
        };
    },
    
    createMockRenderer() {
        return {
            type: 'canvas',
            fillStyle: '',
            strokeStyle: '',
            lineWidth: 1,
            font: '',
            textAlign: '',
            textBaseline: '',
            fillRect: jest.fn(),
            strokeRect: jest.fn(),
            fillText: jest.fn(),
            measureText: jest.fn(() => ({ width: 50 })),
            beginPath: jest.fn(),
            arc: jest.fn(),
            fill: jest.fn(),
            stroke: jest.fn(),
            moveTo: jest.fn(),
            lineTo: jest.fn(),
            save: jest.fn(),
            restore: jest.fn(),
            clip: jest.fn(),
            rect: jest.fn(),
            setLineDash: jest.fn()
        };
    },
    
    simulateMouseEvent(component, type, x, y, options = {}) {
        const event = {
            localX: x,
            localY: y,
            ...options
        };
        
        switch (type) {
            case 'click':
                component.handleClick(event);
                break;
            case 'mousedown':
                component.handleMouseDown(event);
                break;
            case 'mousemove':
                component.handleMouseMove(event);
                break;
            case 'mouseup':
                component.handleMouseUp(event);
                break;
            case 'dblclick':
                component.handleDoubleClick?.(event);
                break;
        }
    },
    
    simulateKeyEvent(component, key, options = {}) {
        const event = {
            key,
            ...options
        };
        
        component.handleKeyDown?.(event);
    },
    
    waitForNextFrame() {
        return new Promise(resolve => requestAnimationFrame(resolve));
    }
};

export default TestUtils;
