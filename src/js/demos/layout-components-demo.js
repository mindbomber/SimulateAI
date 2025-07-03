/**
 * Layout Components Demo
 * Demonstrates TabContainer, ProgressStepper, SplitPane, TreeView, and FileUpload components
 */

import { VisualEngine } from '../core/visual-engine.js';
import logger from '../utils/logger.js';

export class LayoutComponentsDemo {
  constructor(container) {
    this.container = container;
    this.engine = new VisualEngine(container, {
      width: 1200,
      height: 800,
      renderMode: 'canvas',
    });

    this.components = {};
    this.currentDemo = 'tabs';

    this.setupDemoControls();
    this.initializeComponents();
    this.setupEventHandlers();
    this.engine.start();
  }

  setupDemoControls() {
    const controlPanel = document.createElement('div');
    controlPanel.className = 'demo-controls';
    controlPanel.innerHTML = `
            <h3>Layout Components Demo</h3>
            <div class="demo-buttons">
                <button data-demo="tabs" class="demo-btn active">Tab Container</button>
                <button data-demo="stepper" class="demo-btn">Progress Stepper</button>
                <button data-demo="splitpane" class="demo-btn">Split Pane</button>
                <button data-demo="treeview" class="demo-btn">Tree View</button>
                <button data-demo="fileupload" class="demo-btn">File Upload</button>
                <button data-demo="combined" class="demo-btn">Combined Demo</button>
            </div>
            <div class="demo-info">
                <p id="demo-description">Click components to interact with them</p>
            </div>
        `;

    this.container.parentNode.insertBefore(controlPanel, this.container);

    // Add event listeners for demo buttons
    controlPanel.addEventListener('click', event => {
      if (event.target.classList.contains('demo-btn')) {
        const { demo } = event.target.dataset;
        this.switchDemo(demo);

        // Update active button
        controlPanel
          .querySelectorAll('.demo-btn')
          .forEach(btn => btn.classList.remove('active'));
        event.target.classList.add('active');
      }
    });
  }

  initializeComponents() {
    this.createTabContainerDemo();
    this.createProgressStepperDemo();
    this.createSplitPaneDemo();
    this.createTreeViewDemo();
    this.createFileUploadDemo();
    this.createCombinedDemo();

    this.switchDemo('tabs');
  }

  createTabContainerDemo() {
    const tabContainer = this.engine.createComponent('tab-container', {
      x: 50,
      y: 50,
      width: 700,
      height: 400,
      tabs: [
        {
          id: 'dashboard',
          title: 'Dashboard',
          icon: '📊',
          content: 'Dashboard content with charts and metrics',
          closeable: false,
        },
        {
          id: 'users',
          title: 'Users',
          icon: '👥',
          content: 'User management interface',
          badge: '5',
        },
        {
          id: 'settings',
          title: 'Settings',
          icon: '⚙️',
          content: 'Application settings and configuration',
        },
        {
          id: 'reports',
          title: 'Reports',
          icon: '📈',
          content: 'Generated reports and analytics',
          disabled: true,
        },
      ],
      activeTab: 0,
      closeable: true,
      reorderable: true,
    });

    // Tab event handlers
    tabContainer.on('tabChanged', event => {
      logger.debug('Tab changed:', event);
      this.updateDescription(`Active tab: ${event.tab.title}`);
    });

    tabContainer.on('tabAdded', event => {
      logger.debug('Tab added:', event);
      this.updateDescription(`Tab "${event.tab.title}" added`);
    });

    tabContainer.on('tabRemoved', event => {
      logger.debug('Tab removed:', event);
      this.updateDescription(`Tab "${event.tab.title}" removed`);
    });

    // Add sample controls
    const addTabButton = this.createButton(800, 100, 'Add Tab', () => {
      const newTabId = `tab-${Date.now()}`;
      tabContainer.addTab({
        id: newTabId,
        title: `New Tab ${tabContainer.tabs.length + 1}`,
        content: `Content for ${newTabId}`,
        icon: '📄',
      });
    });

    this.components.tabs = {
      container: tabContainer,
      controls: [addTabButton],
      description:
        'Interactive tab container with reorderable tabs, close buttons, and badges',
    };
  }

  createProgressStepperDemo() {
    const horizontalStepper = this.engine.createComponent('progress-stepper', {
      x: 50,
      y: 100,
      width: 600,
      height: 80,
      orientation: 'horizontal',
      steps: [
        {
          id: 'info',
          title: 'Basic Info',
          description: 'Enter your details',
          completed: true,
        },
        {
          id: 'validation',
          title: 'Validation',
          description: 'Verify information',
          completed: true,
        },
        {
          id: 'payment',
          title: 'Payment',
          description: 'Complete payment',
          completed: false,
        },
        {
          id: 'confirmation',
          title: 'Confirmation',
          description: 'Final confirmation',
          completed: false,
          disabled: false,
        },
      ],
      currentStep: 2,
      allowStepClick: true,
    });

    const verticalStepper = this.engine.createComponent('progress-stepper', {
      x: 700,
      y: 100,
      width: 200,
      height: 300,
      orientation: 'vertical',
      steps: [
        {
          id: 'setup',
          title: 'Setup',
          description: 'Initial setup',
          completed: true,
        },
        {
          id: 'configure',
          title: 'Configure',
          description: 'Configure settings',
          completed: false,
        },
        {
          id: 'deploy',
          title: 'Deploy',
          description: 'Deploy application',
          completed: false,
        },
      ],
      currentStep: 1,
    });

    // Stepper event handlers
    const handleStepChange = event => {
      logger.debug('Step changed:', event);
      this.updateDescription(`Current step: ${event.step.title}`);
    };

    horizontalStepper.on('stepChanged', handleStepChange);
    verticalStepper.on('stepChanged', handleStepChange);

    // Navigation controls
    const prevButton = this.createButton(50, 250, 'Previous', () => {
      horizontalStepper.previousStep();
    });

    const nextButton = this.createButton(150, 250, 'Next', () => {
      horizontalStepper.nextStep();
    });

    const completeButton = this.createButton(250, 250, 'Complete Step', () => {
      horizontalStepper.completeStep();
    });

    this.components.stepper = {
      container: [horizontalStepper, verticalStepper],
      controls: [prevButton, nextButton, completeButton],
      description:
        'Progress steppers in horizontal and vertical orientations with step validation',
    };
  }

  createSplitPaneDemo() {
    const splitPane = this.engine.createComponent('split-pane', {
      x: 50,
      y: 50,
      width: 700,
      height: 400,
      orientation: 'horizontal',
      split: 0.3,
      resizable: true,
      collapsible: true,
      leftPane:
        'Left pane content\\n\\nThis pane can be resized by dragging the splitter.',
      rightPane:
        'Right pane content\\n\\nDouble-click the splitter to collapse/expand panes.',
    });

    const nestedSplitPane = this.engine.createComponent('split-pane', {
      x: 800,
      y: 50,
      width: 300,
      height: 400,
      orientation: 'vertical',
      split: 0.6,
      resizable: true,
      leftPane: 'Top pane',
      rightPane: 'Bottom pane',
    });

    // Split pane event handlers
    splitPane.on('splitChanged', event => {
      this.updateDescription(`Split ratio: ${(event.split * 100).toFixed(1)}%`);
    });

    splitPane.on('paneCollapsed', event => {
      const state = event.collapsed
        ? `${event.collapsed} pane collapsed`
        : 'panes expanded';
      this.updateDescription(`Split pane: ${state}`);
    });

    // Controls
    const toggleOrientationButton = this.createButton(
      50,
      500,
      'Toggle Orientation',
      () => {
        splitPane.orientation =
          splitPane.orientation === 'horizontal' ? 'vertical' : 'horizontal';
      }
    );

    const resetSplitButton = this.createButton(200, 500, 'Reset Split', () => {
      splitPane.setSplit(0.5);
    });

    this.components.splitpane = {
      container: [splitPane, nestedSplitPane],
      controls: [toggleOrientationButton, resetSplitButton],
      description:
        'Resizable and collapsible split panes with drag handles and keyboard navigation',
    };
  }

  createTreeViewDemo() {
    const treeData = [
      {
        id: 'root1',
        label: 'Documents',
        icon: '📁',
        children: [
          {
            id: 'doc1',
            label: 'Report.pdf',
            icon: '📄',
          },
          {
            id: 'folder1',
            label: 'Projects',
            icon: '📁',
            children: [
              {
                id: 'project1',
                label: 'SimulateAI',
                icon: '🤖',
              },
              {
                id: 'project2',
                label: 'Web App',
                icon: '🌐',
              },
            ],
          },
        ],
      },
      {
        id: 'root2',
        label: 'Images',
        icon: '📁',
        children: [
          {
            id: 'img1',
            label: 'photo1.jpg',
            icon: '🖼️',
          },
          {
            id: 'img2',
            label: 'screenshot.png',
            icon: '🖼️',
          },
        ],
      },
      {
        id: 'root3',
        label: 'Settings',
        icon: '⚙️',
      },
    ];

    const treeView = this.engine.createComponent('tree-view', {
      x: 50,
      y: 50,
      width: 300,
      height: 400,
      data: treeData,
      multiSelect: true,
      showIcons: true,
      showCheckboxes: false,
      expandedNodes: ['root1', 'folder1'],
    });

    const treeViewWithCheckboxes = this.engine.createComponent('tree-view', {
      x: 400,
      y: 50,
      width: 300,
      height: 400,
      data: JSON.parse(JSON.stringify(treeData)), // Deep clone
      multiSelect: true,
      showCheckboxes: true,
      expandedNodes: ['root1'],
    });

    // Tree view event handlers
    const handleNodeSelection = event => {
      logger.debug('Node selected:', event);
      this.updateDescription(
        `Selected: ${event.nodeId} (${event.selectedNodes.length} total)`
      );
    };

    treeView.on('nodeSelected', handleNodeSelection);
    treeViewWithCheckboxes.on('nodeSelected', handleNodeSelection);

    treeView.on('nodeExpanded', event => {
      logger.debug('Node expanded:', event.nodeId);
    });

    treeView.on('nodeActivated', event => {
      this.updateDescription(`Activated node: ${event.nodeId}`);
    });

    // Controls
    const expandAllButton = this.createButton(750, 100, 'Expand All', () => {
      treeView.expandAll();
      treeViewWithCheckboxes.expandAll();
    });

    const collapseAllButton = this.createButton(
      750,
      150,
      'Collapse All',
      () => {
        treeView.collapseAll();
        treeViewWithCheckboxes.collapseAll();
      }
    );

    this.components.treeview = {
      container: [treeView, treeViewWithCheckboxes],
      controls: [expandAllButton, collapseAllButton],
      description:
        'Hierarchical tree views with multi-selection, checkboxes, and keyboard navigation',
    };
  }

  createFileUploadDemo() {
    const fileUpload = this.engine.createComponent('file-upload', {
      x: 50,
      y: 50,
      width: 400,
      height: 200,
      multiple: true,
      accept: 'image/*,.pdf,.txt',
      maxFileSize: 5 * 1024 * 1024, // 5MB
      maxFiles: 5,
      uploadText: 'Drop files here or click to browse',
      browseText: 'Choose Files',
    });

    const singleFileUpload = this.engine.createComponent('file-upload', {
      x: 500,
      y: 50,
      width: 400,
      height: 150,
      multiple: false,
      accept: '.jpg,.png,.gif',
      uploadText: 'Drop a single image file here',
      browseText: 'Select Image',
    });

    // File upload event handlers
    fileUpload.on('filesAdded', event => {
      logger.debug('Files added:', event.files);
      const fileNames = event.files.map(f => f.name).join(', ');
      this.updateDescription(`Added files: ${fileNames}`);
    });

    fileUpload.on('filesRejected', event => {
      logger.debug('Files rejected:', event.rejected);
      this.updateDescription(
        `${event.rejected.length} files rejected due to validation`
      );
    });

    fileUpload.on('uploadStarted', event => {
      this.updateDescription(`Uploading ${event.files.length} files...`);
    });

    fileUpload.on('uploadProgress', event => {
      const percent = Math.round(event.progress * 100);
      this.updateDescription(`Upload progress: ${percent}%`);
    });

    fileUpload.on('uploadCompleted', event => {
      this.updateDescription(
        `Upload completed! ${event.files.length} files uploaded.`
      );
    });

    fileUpload.on('browseRequested', () => {
      // In a real implementation, this would open a file dialog
      this.updateDescription('File browser would open here');
    });

    // Controls
    const simulateFilesButton = this.createButton(
      50,
      300,
      'Simulate Files',
      () => {
        // Simulate adding files
        const mockFiles = [
          { name: 'document.pdf', size: 1024000, type: 'application/pdf' },
          { name: 'image.jpg', size: 512000, type: 'image/jpeg' },
          { name: 'data.txt', size: 2048, type: 'text/plain' },
        ];
        fileUpload.addFiles(mockFiles);
      }
    );

    const startUploadButton = this.createButton(
      200,
      300,
      'Start Upload',
      () => {
        fileUpload.startUpload();
      }
    );

    const clearFilesButton = this.createButton(350, 300, 'Clear Files', () => {
      fileUpload.clearFiles();
    });

    this.components.fileupload = {
      container: [fileUpload, singleFileUpload],
      controls: [simulateFilesButton, startUploadButton, clearFilesButton],
      description:
        'Drag-and-drop file upload with validation, progress tracking, and multiple file support',
    };
  }

  createCombinedDemo() {
    // Create a complex layout combining multiple components
    const mainSplitPane = this.engine.createComponent('split-pane', {
      x: 50,
      y: 50,
      width: 1000,
      height: 500,
      orientation: 'horizontal',
      split: 0.25,
      leftPane: 'Navigation Area',
      rightPane: 'Main Content Area',
    });

    const tabContainer = this.engine.createComponent('tab-container', {
      x: 300,
      y: 80,
      width: 700,
      height: 350,
      tabs: [
        {
          id: 'overview',
          title: 'Overview',
          content: 'Dashboard overview',
          icon: '📊',
        },
        {
          id: 'files',
          title: 'File Manager',
          content: 'File management interface',
          icon: '📁',
        },
        {
          id: 'upload',
          title: 'Upload',
          content: 'File upload area',
          icon: '⬆️',
        },
      ],
    });

    const progressStepper = this.engine.createComponent('progress-stepper', {
      x: 300,
      y: 450,
      width: 700,
      height: 60,
      steps: [
        { id: 'start', title: 'Start', completed: true },
        { id: 'process', title: 'Process', completed: true },
        { id: 'review', title: 'Review', completed: false },
        { id: 'finish', title: 'Finish', completed: false },
      ],
      currentStep: 2,
    });

    const treeView = this.engine.createComponent('tree-view', {
      x: 70,
      y: 80,
      width: 200,
      height: 400,
      data: [
        {
          id: 'workspace',
          label: 'Workspace',
          icon: '💼',
          children: [
            { id: 'projects', label: 'Projects', icon: '📁' },
            { id: 'templates', label: 'Templates', icon: '📄' },
            { id: 'shared', label: 'Shared', icon: '🤝' },
          ],
        },
      ],
      expandedNodes: ['workspace'],
    });

    this.components.combined = {
      container: [mainSplitPane, tabContainer, progressStepper, treeView],
      controls: [],
      description:
        'Combined demo showing how multiple layout components work together in a real application',
    };
  }

  createButton(x, y, text, onClick) {
    const button = this.engine.createComponent('interactive-button', {
      x,
      y,
      width: 120,
      height: 30,
      label: text,
      backgroundColor: '#007bff',
      textColor: '#ffffff',
    });

    button.on('click', onClick);
    return button;
  }

  switchDemo(demo) {
    // Hide all components
    Object.values(this.components).forEach(demoData => {
      const containers = Array.isArray(demoData.container)
        ? demoData.container
        : [demoData.container];
      containers.forEach(component => {
        if (component) component.visible = false;
      });

      demoData.controls.forEach(control => {
        if (control) control.visible = false;
      });
    });

    // Show selected demo
    if (this.components[demo]) {
      const demoData = this.components[demo];
      const containers = Array.isArray(demoData.container)
        ? demoData.container
        : [demoData.container];

      containers.forEach(component => {
        if (component) component.visible = true;
      });

      demoData.controls.forEach(control => {
        if (control) control.visible = true;
      });

      this.updateDescription(demoData.description);
    }

    this.currentDemo = demo;
  }

  updateDescription(text) {
    const descElement = document.getElementById('demo-description');
    if (descElement) {
      descElement.textContent = text;
    }
  }

  setupEventHandlers() {
    // Global event handlers for demo interactions
    window.addEventListener('keydown', event => {
      if (event.key === 'Escape') {
        // Reset all components to default state
        this.resetDemo();
      }
    });
  }

  resetDemo() {
    // Reset current demo to initial state
    this.switchDemo(this.currentDemo);
    this.updateDescription('Demo reset to initial state');
  }

  destroy() {
    this.engine.stop();
    this.engine.destroy();
  }
}

export default LayoutComponentsDemo;
