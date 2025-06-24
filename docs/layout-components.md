# Layout Components Documentation

This document provides comprehensive information about the layout components available in the SimulateAI Visual Engine: **TabContainer**, **ProgressStepper**, **SplitPane**, **TreeView**, and **FileUpload**.

## Table of Contents

1. [Overview](#overview)
2. [TabContainer](#tabcontainer)
3. [ProgressStepper](#progressstepper)
4. [SplitPane](#splitpane)
5. [TreeView](#treeview)
6. [FileUpload](#fileupload)
7. [Integration Examples](#integration-examples)
8. [Best Practices](#best-practices)
9. [Accessibility](#accessibility)
10. [Performance Considerations](#performance-considerations)

## Overview

The layout components provide essential UI building blocks for creating complex, interactive applications. These components are designed with:

- **Accessibility**: Full ARIA support and keyboard navigation
- **Customization**: Extensive styling and behavior options
- **Performance**: Optimized rendering and event handling
- **Integration**: Seamless integration with the Visual Engine ecosystem
- **Responsiveness**: Adaptive to different screen sizes and contexts

All components extend the `BaseObject` class and integrate with the Visual Engine's component registry system.

## TabContainer

A flexible, interactive tab container supporting multiple tabs with customizable appearance and behavior.

### Features

- **Reorderable tabs** with drag-and-drop support
- **Closeable tabs** with validation
- **Badge notifications** on tab headers
- **Custom icons** and styling
- **Keyboard navigation** (Arrow keys, Home, End, Delete)
- **Maximum tab limits** and overflow handling
- **Disabled state** support

### Basic Usage

```javascript
import { TabContainer } from './src/js/objects/layout-components.js';

const tabContainer = new TabContainer({
    x: 50,
    y: 50,
    width: 600,
    height: 400,
    tabs: [
        {
            id: 'dashboard',
            title: 'Dashboard',
            icon: '📊',
            content: 'Dashboard content',
            closeable: false
        },
        {
            id: 'users',
            title: 'Users',
            icon: '👥',
            content: 'User management',
            badge: '5'
        },
        {
            id: 'settings',
            title: 'Settings',
            icon: '⚙️',
            content: 'Application settings',
            disabled: false
        }
    ],
    activeTab: 0,
    closeable: true,
    reorderable: true,
    maxTabs: 10
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `tabs` | Array | `[]` | Array of tab objects |
| `activeTab` | Number | `0` | Index of initially active tab |
| `closeable` | Boolean | `true` | Whether tabs can be closed |
| `reorderable` | Boolean | `true` | Whether tabs can be reordered |
| `maxTabs` | Number | `20` | Maximum number of tabs |
| `tabHeight` | Number | `40` | Height of tab headers |
| `tabBackgroundColor` | String | `'#f8f9fa'` | Background color for inactive tabs |
| `activeTabColor` | String | `'#ffffff'` | Background color for active tab |
| `tabBorderColor` | String | `'#dee2e6'` | Border color |
| `contentBackgroundColor` | String | `'#ffffff'` | Content area background |

### Tab Object Properties

```javascript
{
    id: 'unique-id',           // Unique identifier
    title: 'Tab Title',        // Display title
    content: 'Tab content',    // Content to display
    icon: '📄',               // Optional icon
    badge: '5',               // Optional badge text
    closeable: true,          // Can this tab be closed
    disabled: false           // Is this tab disabled
}
```

### Methods

#### `addTab(tabData, index?)`
Adds a new tab to the container.

```javascript
tabContainer.addTab({
    id: 'new-tab',
    title: 'New Tab',
    content: 'New content'
}, 2); // Insert at index 2
```

#### `removeTab(index)`
Removes a tab at the specified index.

```javascript
tabContainer.removeTab(1); // Remove second tab
```

#### `setActiveTab(index)`
Sets the active tab by index.

```javascript
tabContainer.setActiveTab(2);
```

#### `updateTab(index, updates)`
Updates properties of an existing tab.

```javascript
tabContainer.updateTab(0, {
    title: 'Updated Title',
    badge: '3'
});
```

#### `getActiveTab()`
Returns the currently active tab object.

#### `getTabById(id)` / `getTabIndex(id)`
Find tab by ID or get its index.

### Events

- **`tabChanged`**: Fired when active tab changes
- **`tabAdded`**: Fired when a new tab is added
- **`tabRemoved`**: Fired when a tab is removed
- **`tabUpdated`**: Fired when tab properties are updated
- **`tabReordered`**: Fired when tabs are reordered

```javascript
tabContainer.on('tabChanged', (event) => {
    console.log('Active tab:', event.tab.title);
});
```

## ProgressStepper

A visual progress indicator for multi-step processes with navigation and validation.

### Features

- **Horizontal and vertical** orientations
- **Step completion tracking** with visual indicators
- **Click navigation** between steps
- **Custom icons and descriptions**
- **Step validation** and disabled states
- **Progress calculation**
- **Keyboard navigation**

### Basic Usage

```javascript
import { ProgressStepper } from './src/js/objects/layout-components.js';

const stepper = new ProgressStepper({
    x: 50,
    y: 100,
    width: 600,
    height: 80,
    orientation: 'horizontal', // or 'vertical'
    steps: [
        {
            id: 'info',
            title: 'Basic Info',
            description: 'Enter your details',
            completed: true
        },
        {
            id: 'validation',
            title: 'Validation',
            description: 'Verify information',
            completed: false
        },
        {
            id: 'payment',
            title: 'Payment',
            description: 'Complete payment',
            completed: false,
            optional: true
        },
        {
            id: 'confirmation',
            title: 'Confirmation',
            description: 'Final confirmation',
            completed: false
        }
    ],
    currentStep: 1,
    allowStepClick: true,
    showStepNumbers: true,
    showLabels: true
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `steps` | Array | `[]` | Array of step objects |
| `currentStep` | Number | `0` | Index of current step |
| `orientation` | String | `'horizontal'` | Layout orientation |
| `allowStepClick` | Boolean | `true` | Allow clicking to navigate |
| `showStepNumbers` | Boolean | `true` | Show step numbers |
| `showLabels` | Boolean | `true` | Show step labels |
| `completedColor` | String | `'#28a745'` | Color for completed steps |
| `activeColor` | String | `'#007bff'` | Color for active step |
| `inactiveColor` | String | `'#e9ecef'` | Color for inactive steps |
| `lineColor` | String | `'#dee2e6'` | Connector line color |

### Step Object Properties

```javascript
{
    id: 'unique-id',           // Unique identifier
    title: 'Step Title',       // Display title
    description: 'Step desc',  // Optional description
    completed: false,          // Is step completed
    disabled: false,          // Is step disabled
    icon: '✓',                // Optional custom icon
    optional: false           // Is step optional
}
```

### Methods

#### `goToStep(stepIndex)`
Navigate to a specific step.

#### `nextStep()` / `previousStep()`
Navigate to next/previous step.

#### `completeStep(stepIndex?)`
Mark a step as completed.

#### `getLastCompletedStep()`
Returns the index of the last completed step.

#### `getStepStatus(index)`
Returns step status: 'completed', 'active', 'inactive', or 'disabled'.

#### `getProgress()`
Returns completion progress as a ratio (0-1).

#### `reset()`
Reset all steps to initial state.

### Events

- **`stepChanged`**: Fired when current step changes
- **`stepCompleted`**: Fired when a step is completed
- **`reset`**: Fired when stepper is reset

## SplitPane

A resizable and collapsible pane component for flexible layout management.

### Features

- **Horizontal and vertical** splitting
- **Drag-to-resize** functionality
- **Collapsible panes** with double-click
- **Minimum size constraints**
- **Nested split layouts** support
- **Keyboard accessibility**

### Basic Usage

```javascript
import { SplitPane } from './src/js/objects/layout-components.js';

const splitPane = new SplitPane({
    x: 50,
    y: 50,
    width: 700,
    height: 400,
    orientation: 'horizontal', // or 'vertical'
    split: 0.3, // 30% / 70% split
    resizable: true,
    collapsible: true,
    minSize: 50, // Minimum pane size
    splitterSize: 6,
    leftPane: 'Left pane content',
    rightPane: 'Right pane content'
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `orientation` | String | `'horizontal'` | Split orientation |
| `split` | Number | `0.5` | Split ratio (0.0 to 1.0) |
| `minSize` | Number | `50` | Minimum pane size in pixels |
| `splitterSize` | Number | `6` | Splitter thickness |
| `resizable` | Boolean | `true` | Enable resizing |
| `collapsible` | Boolean | `false` | Enable collapsing |
| `leftPane` | Any | `null` | Left/top pane content |
| `rightPane` | Any | `null` | Right/bottom pane content |
| `splitterColor` | String | `'#e9ecef'` | Splitter color |
| `splitterHoverColor` | String | `'#dee2e6'` | Hover color |
| `paneBackgroundColor` | String | `'#ffffff'` | Pane background |

### Methods

#### `setSplit(ratio)`
Set the split ratio with constraints.

#### `collapse(pane)`
Collapse 'left' or 'right' pane.

#### `setLeftPane(content)` / `setRightPane(content)`
Set pane content.

#### `getSplit()`
Get current split ratio.

#### `isCollapsed()`
Get collapsed state.

### Events

- **`splitChanged`**: Fired when split ratio changes
- **`paneCollapsed`**: Fired when a pane is collapsed
- **`paneChanged`**: Fired when pane content changes

## TreeView

A hierarchical data display component with expand/collapse, multi-selection, and keyboard navigation.

### Features

- **Hierarchical data** with unlimited nesting
- **Expand/collapse** functionality
- **Multi-selection** with checkboxes
- **Custom icons** and styling
- **Keyboard navigation** (Arrow keys, Enter, Space)
- **Search and filtering** support
- **Lazy loading** compatible
- **Scrolling** for large datasets

### Basic Usage

```javascript
import { TreeView } from './src/js/objects/layout-components.js';

const treeData = [
    {
        id: 'root1',
        label: 'Documents',
        icon: '📁',
        children: [
            {
                id: 'doc1',
                label: 'Report.pdf',
                icon: '📄'
            },
            {
                id: 'folder1',
                label: 'Projects',
                icon: '📁',
                children: [
                    {
                        id: 'project1',
                        label: 'SimulateAI',
                        icon: '🤖'
                    }
                ]
            }
        ]
    }
];

const treeView = new TreeView({
    x: 50,
    y: 50,
    width: 300,
    height: 400,
    data: treeData,
    multiSelect: true,
    showIcons: true,
    showCheckboxes: false,
    expandedNodes: ['root1'], // Initially expanded
    nodeHeight: 24,
    indentSize: 20
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `data` | Array | `[]` | Hierarchical data array |
| `multiSelect` | Boolean | `false` | Enable multi-selection |
| `showIcons` | Boolean | `true` | Show node icons |
| `showCheckboxes` | Boolean | `false` | Show selection checkboxes |
| `expandedNodes` | Array/Set | `[]` | Initially expanded node IDs |
| `nodeHeight` | Number | `24` | Height of each node |
| `indentSize` | Number | `20` | Indentation per level |
| `backgroundColor` | String | `'#ffffff'` | Background color |
| `selectedColor` | String | `'#e3f2fd'` | Selection background |
| `hoverColor` | String | `'#f5f5f5'` | Hover background |
| `textColor` | String | `'#333333'` | Text color |

### Node Object Properties

```javascript
{
    id: 'unique-id',           // Unique identifier
    label: 'Node Label',       // Display text
    icon: '📁',               // Optional icon
    children: [],             // Child nodes array
    disabled: false           // Is node disabled
}
```

### Methods

#### `expandNode(nodeId)` / `collapseNode(nodeId)`
Expand or collapse a specific node.

#### `toggleNode(nodeId)`
Toggle node expansion state.

#### `selectNode(nodeId, addToSelection?)`
Select a node, optionally adding to current selection.

#### `findNode(nodeId)`
Find a node by ID in the tree.

#### `setData(data)`
Replace the entire tree data.

#### `getSelectedNodes()`
Get array of selected node IDs.

#### `expandAll()` / `collapseAll()`
Expand or collapse all nodes.

### Events

- **`nodeSelected`**: Fired when node selection changes
- **`nodeExpanded`**: Fired when a node is expanded
- **`nodeCollapsed`**: Fired when a node is collapsed
- **`nodeActivated`**: Fired when a node is activated (Enter/Space)
- **`dataChanged`**: Fired when tree data is replaced

## FileUpload

A drag-and-drop file upload component with validation, progress tracking, and file management.

### Features

- **Drag and drop** interface
- **File type and size** validation
- **Upload progress** tracking
- **Multiple file** support
- **File preview** and management
- **Custom styling** and messages
- **Accessibility** support

### Basic Usage

```javascript
import { FileUpload } from './src/js/objects/layout-components.js';

const fileUpload = new FileUpload({
    x: 50,
    y: 50,
    width: 400,
    height: 200,
    multiple: true,
    accept: 'image/*,.pdf,.txt',
    maxFileSize: 5 * 1024 * 1024, // 5MB
    maxFiles: 5,
    uploadText: 'Drop files here or click to browse',
    browseText: 'Choose Files'
});
```

### Configuration Options

| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `multiple` | Boolean | `false` | Allow multiple files |
| `accept` | String | `'*/*'` | Accepted file types |
| `maxFileSize` | Number | `10MB` | Maximum file size |
| `maxFiles` | Number | `10` | Maximum number of files |
| `disabled` | Boolean | `false` | Disable component |
| `uploadText` | String | Custom | Main upload message |
| `browseText` | String | Custom | Browse button text |
| `backgroundColor` | String | `'#f8f9fa'` | Background color |
| `dragOverColor` | String | `'#e3f2fd'` | Drag over color |
| `borderColor` | String | `'#dee2e6'` | Border color |

### Methods

#### `addFiles(fileList)`
Add files to the upload queue.

#### `removeFile(index)`
Remove a file from the queue.

#### `clearFiles()`
Clear all files from the queue.

#### `startUpload()`
Start the upload process.

#### `validateFile(file)`
Validate a single file.

#### `getFiles()`
Get array of queued files.

#### `setAccept(accept)` / `setMaxFileSize(size)`
Update validation settings.

### Events

- **`filesAdded`**: Fired when files are added
- **`filesRejected`**: Fired when files are rejected
- **`fileRemoved`**: Fired when a file is removed
- **`filesCleared`**: Fired when all files are cleared
- **`uploadStarted`**: Fired when upload begins
- **`uploadProgress`**: Fired during upload progress
- **`uploadCompleted`**: Fired when upload completes
- **`browseRequested`**: Fired when browse is requested

## Integration Examples

### Complete Application Layout

```javascript
import { VisualEngine } from './src/js/core/visual-engine.js';

// Initialize engine
const engine = new VisualEngine(container, {
    width: 1200,
    height: 800
});

// Create main layout with split pane
const mainLayout = engine.createComponent('split-pane', {
    x: 0,
    y: 0,
    width: 1200,
    height: 800,
    orientation: 'horizontal',
    split: 0.25
});

// Left sidebar with tree navigation
const navigationTree = engine.createComponent('tree-view', {
    x: 20,
    y: 20,
    width: 260,
    height: 760,
    data: navigationData,
    showIcons: true
});

// Right content area with tabs
const contentTabs = engine.createComponent('tab-container', {
    x: 320,
    y: 20,
    width: 860,
    height: 760,
    tabs: [
        { id: 'overview', title: 'Overview', icon: '📊' },
        { id: 'files', title: 'Files', icon: '📁' },
        { id: 'upload', title: 'Upload', icon: '⬆️' }
    ]
});

// Progress stepper for workflows
const workflowStepper = engine.createComponent('progress-stepper', {
    x: 320,
    y: 740,
    width: 860,
    height: 40,
    steps: workflowSteps,
    orientation: 'horizontal'
});

// File upload in upload tab
const fileUploader = engine.createComponent('file-upload', {
    x: 350,
    y: 100,
    width: 800,
    height: 600,
    multiple: true
});

// Wire up interactions
navigationTree.on('nodeSelected', (event) => {
    // Load content based on selected node
    loadContentForNode(event.nodeId);
});

contentTabs.on('tabChanged', (event) => {
    // Show/hide relevant components
    if (event.tab.id === 'upload') {
        fileUploader.visible = true;
    }
});
```

### Event Coordination

```javascript
// Coordinate events between components
class ApplicationController {
    constructor(engine) {
        this.engine = engine;
        this.setupComponents();
        this.setupEventHandlers();
    }
    
    setupEventHandlers() {
        // Tree selection updates content tabs
        this.navigationTree.on('nodeSelected', (event) => {
            this.updateContentForNode(event.nodeId);
        });
        
        // File upload progress updates stepper
        this.fileUpload.on('uploadProgress', (event) => {
            this.workflowStepper.updateStep(2, {
                progress: event.progress
            });
        });
        
        // Tab changes update application state
        this.contentTabs.on('tabChanged', (event) => {
            this.updateApplicationState(event.tab.id);
        });
    }
    
    updateContentForNode(nodeId) {
        // Implementation specific to your application
    }
}
```

## Best Practices

### Performance

1. **Lazy Loading**: For large datasets, implement lazy loading in TreeView
2. **Virtual Scrolling**: Consider virtual scrolling for very large lists
3. **Event Debouncing**: Debounce resize events in SplitPane
4. **Memory Management**: Properly clean up event listeners

### Accessibility

1. **ARIA Labels**: Always provide meaningful ARIA labels
2. **Keyboard Navigation**: Test all keyboard interactions
3. **Focus Management**: Ensure proper focus handling
4. **Screen Reader Support**: Test with screen readers

### User Experience

1. **Visual Feedback**: Provide clear visual feedback for all interactions
2. **Error Handling**: Implement comprehensive error handling
3. **Loading States**: Show loading indicators for async operations
4. **Responsive Design**: Ensure components work on all screen sizes

### Code Organization

1. **Component Composition**: Build complex UIs by composing simple components
2. **Event Driven**: Use events for component communication
3. **State Management**: Centralize state management when needed
4. **Configuration**: Make components highly configurable

## Accessibility

All layout components follow WCAG 2.1 AA guidelines:

### Keyboard Navigation

- **Tab Navigation**: All interactive elements are keyboard accessible
- **Arrow Keys**: Navigate between items in lists and tabs
- **Enter/Space**: Activate buttons and selections
- **Escape**: Cancel operations or close dialogs

### Screen Reader Support

- **ARIA Roles**: Proper semantic roles for all components
- **ARIA Labels**: Descriptive labels for complex interactions
- **Live Regions**: Announce dynamic content changes
- **Focus Management**: Logical focus order and visible focus indicators

### Visual Accessibility

- **High Contrast**: Support for high contrast modes
- **Reduced Motion**: Respect prefers-reduced-motion settings
- **Color Independence**: Don't rely solely on color for information
- **Scalable Text**: Support for browser zoom up to 200%

## Performance Considerations

### Rendering Optimization

1. **Canvas Rendering**: Components use efficient canvas rendering
2. **Clipping**: Render only visible portions of large datasets
3. **Batching**: Batch DOM updates and redraws
4. **Event Throttling**: Throttle high-frequency events like mouse move

### Memory Management

1. **Event Cleanup**: Remove event listeners when components are destroyed
2. **Reference Management**: Avoid circular references
3. **Garbage Collection**: Design for efficient garbage collection
4. **Resource Pooling**: Reuse objects where possible

### Data Handling

1. **Efficient Algorithms**: Use appropriate data structures and algorithms
2. **Lazy Evaluation**: Compute values only when needed
3. **Caching**: Cache expensive computations
4. **Progressive Loading**: Load data progressively for large datasets

---

For more information and examples, see the demo files and test suites included with the components.
