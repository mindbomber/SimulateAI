/**
 * Priority Components Demo - Demonstration of high-priority reusable components
 * Shows DataTable, NotificationToast, and LoadingSpinner in action
 */

import VisualEngine from '../core/visual-engine.js';
import logger from '../utils/logger.js';

export class PriorityComponentsDemo {
  constructor() {
    this.engine = null;
    this.components = new Map();
    this.demoData = this.generateDemoData();
    this.notifications = [];
    this.loadingOperations = [];
  }

  async init() {
    // Create container for the demo
    const container =
      document.getElementById('demo-container') || this.createDemoContainer();

    // Initialize Visual Engine
    this.engine = new VisualEngine(container, {
      width: 1200,
      height: 800,
      renderMode: 'canvas',
      debug: true,
    });

    this.setupDemo();
    this.engine.start();

    logger.info('Priority Components Demo initialized');
  }

  createDemoContainer() {
    const container = document.createElement('div');
    container.id = 'demo-container';
    container.style.cssText = `
            width: 1200px;
            height: 800px;
            border: 1px solid #ccc;
            margin: 20px auto;
            position: relative;
            background: #f9f9f9;
        `;
    document.body.appendChild(container);
    return container;
  }

  setupDemo() {
    this.createDataTableDemo();
    this.createNotificationDemo();
    this.createLoadingSpinnerDemo();
    this.createControlButtons();
  }

  // =============================================================================
  // DATA TABLE DEMO
  // =============================================================================

  createDataTableDemo() {
    logger.debug('Creating DataTable demo...');

    const dataTable = this.engine.createComponent('data-table', {
      x: 20,
      y: 60,
      width: 700,
      height: 350,
      columns: [
        {
          key: 'id',
          title: 'Model ID',
          sortable: true,
        },
        {
          key: 'name',
          title: 'Model Name',
          sortable: true,
        },
        {
          key: 'accuracy',
          title: 'Accuracy',
          type: 'number',
          sortable: true,
          format: value => `${(value * 100).toFixed(1)}%`,
        },
        {
          key: 'bias_score',
          title: 'Bias Score',
          type: 'number',
          sortable: true,
          format: value => value.toFixed(3),
        },
        {
          key: 'ethics_rating',
          title: 'Ethics Rating',
          sortable: true,
        },
        {
          key: 'training_time',
          title: 'Training Time',
          sortable: true,
        },
      ],
      data: this.demoData.aiModels,
      pagination: true,
      pageSize: 10,
      selectable: true,
      filterable: true,
    });

    // Event handlers
    dataTable.on('sort', event => {
      logger.debug('Table sorted by:', event.column, event.direction);
      this.showNotification(
        `Sorted by ${event.column} (${event.direction})`,
        'info'
      );
    });

    dataTable.on('selectionChange', event => {
      logger.debug('Selection changed:', event.selectedRows);
      if (event.selectedRows.length > 0) {
        this.showNotification(
          `${event.selectedRows.length} model(s) selected`,
          'success'
        );
      }
    });

    dataTable.on('pageChange', event => {
      logger.debug('Page changed to:', event.page);
    });

    this.components.set('dataTable', dataTable);

    // Table title
    const tableTitle = this.engine.createComponent('label', {
      x: 20,
      y: 30,
      text: 'AI Models Performance Comparison',
      font: 'bold 16px Arial',
      textColor: '#333333',
    });
    this.components.set('tableTitle', tableTitle);
  }

  generateDemoData() {
    const modelTypes = [
      'CNN',
      'RNN',
      'Transformer',
      'GAN',
      'BERT',
      'GPT',
      'ResNet',
      'LSTM',
    ];
    const ethicsRatings = ['Excellent', 'Good', 'Fair', 'Poor', 'Critical'];

    const aiModels = [];
    for (let i = 1; i <= 50; i++) {
      aiModels.push({
        id: `M${i.toString().padStart(3, '0')}`,
        name: `${modelTypes[i % modelTypes.length]}-${Math.floor(Math.random() * 100)}`,
        accuracy: 0.5 + Math.random() * 0.5, // 50-100%
        bias_score: Math.random() * 0.5, // 0-0.5
        ethics_rating:
          ethicsRatings[Math.floor(Math.random() * ethicsRatings.length)],
        training_time: `${Math.floor(Math.random() * 24)}h ${Math.floor(Math.random() * 60)}m`,
      });
    }

    return { aiModels };
  }

  // =============================================================================
  // NOTIFICATION DEMO
  // =============================================================================

  createNotificationDemo() {
    logger.debug('Setting up notification system...');

    // Notification area (invisible container for positioning)
    this.notificationContainer = {
      x: 750,
      y: 60,
      width: 400,
      height: 600,
    };
  }

  showNotification(message, type = 'info', duration = 4000) {
    // Calculate position for new notification
    const notificationY =
      this.notificationContainer.y + this.notifications.length * 90;

    const notification = this.engine.createComponent('notification-toast', {
      x: this.notificationContainer.x,
      y: notificationY,
      width: 320,
      height: 80,
      message,
      type,
      duration,
      dismissible: true,
    });

    // Handle notification removal
    notification.on('remove', () => {
      this.notifications = this.notifications.filter(n => n !== notification);
      this.repositionNotifications();
    });

    this.notifications.push(notification);
    this.components.set(`notification-${Date.now()}`, notification);

    return notification;
  }

  repositionNotifications() {
    this.notifications.forEach((notification, index) => {
      const targetY = this.notificationContainer.y + index * 90;
      notification.y = targetY;
    });
  }

  // =============================================================================
  // LOADING SPINNER DEMO
  // =============================================================================

  createLoadingSpinnerDemo() {
    logger.debug('Setting up loading spinner demos...');

    // Static spinner examples
    const smallSpinner = this.engine.createComponent('loading-spinner', {
      x: 800,
      y: 450,
      width: 80,
      height: 80,
      size: 'small',
      message: 'Loading...',
      overlay: false,
    });

    const mediumSpinner = this.engine.createComponent('loading-spinner', {
      x: 900,
      y: 430,
      width: 120,
      height: 120,
      size: 'medium',
      message: 'Processing data...',
      progress: 0.65,
      overlay: false,
    });

    const largeSpinner = this.engine.createComponent('loading-spinner', {
      x: 1040,
      y: 400,
      width: 140,
      height: 140,
      size: 'large',
      message: 'Training model...',
      cancellable: true,
      overlay: false,
    });

    this.components.set('smallSpinner', smallSpinner);
    this.components.set('mediumSpinner', mediumSpinner);
    this.components.set('largeSpinner', largeSpinner);

    // Progress animation for medium spinner
    setInterval(() => {
      if (mediumSpinner.progress !== null) {
        mediumSpinner.setProgress((mediumSpinner.progress + 0.02) % 1);
      }
    }, 100);

    // Spinner labels
    const spinnersTitle = this.engine.createComponent('label', {
      x: 800,
      y: 420,
      text: 'Loading Spinners:',
      font: 'bold 14px Arial',
      textColor: '#333333',
    });
    this.components.set('spinnersTitle', spinnersTitle);
  }

  // =============================================================================
  // CONTROL BUTTONS
  // =============================================================================

  createControlButtons() {
    logger.debug('Creating control buttons...');

    // Notification test buttons
    const successBtn = this.engine.createComponent('button', {
      x: 20,
      y: 450,
      width: 120,
      height: 35,
      text: 'Success Toast',
      onClick: () =>
        this.showNotification('Operation completed successfully!', 'success'),
    });

    const errorBtn = this.engine.createComponent('button', {
      x: 150,
      y: 450,
      width: 120,
      height: 35,
      text: 'Error Toast',
      onClick: () =>
        this.showNotification('An error occurred during processing', 'error'),
    });

    const warningBtn = this.engine.createComponent('button', {
      x: 280,
      y: 450,
      width: 120,
      height: 35,
      text: 'Warning Toast',
      onClick: () =>
        this.showNotification('Model bias detected in results', 'warning'),
    });

    const infoBtn = this.engine.createComponent('button', {
      x: 410,
      y: 450,
      width: 120,
      height: 35,
      text: 'Info Toast',
      onClick: () =>
        this.showNotification('Training will begin in 30 seconds', 'info'),
    });

    // Data manipulation buttons
    const refreshDataBtn = this.engine.createComponent('button', {
      x: 20,
      y: 500,
      width: 120,
      height: 35,
      text: 'Refresh Data',
      onClick: () => this.refreshTableData(),
    });

    const exportBtn = this.engine.createComponent('button', {
      x: 150,
      y: 500,
      width: 120,
      height: 35,
      text: 'Export CSV',
      onClick: () => this.exportTableData(),
    });

    const selectAllBtn = this.engine.createComponent('button', {
      x: 280,
      y: 500,
      width: 120,
      height: 35,
      text: 'Select All',
      onClick: () => this.selectAllRows(),
    });

    const clearBtn = this.engine.createComponent('button', {
      x: 410,
      y: 500,
      width: 120,
      height: 35,
      text: 'Clear Selection',
      onClick: () => this.clearSelection(),
    });

    // Loading operation buttons
    const simulateLoadBtn = this.engine.createComponent('button', {
      x: 20,
      y: 550,
      width: 150,
      height: 35,
      text: 'Simulate Loading',
      onClick: () => this.simulateLoadingOperation(),
    });

    // Store button references
    this.components.set('successBtn', successBtn);
    this.components.set('errorBtn', errorBtn);
    this.components.set('warningBtn', warningBtn);
    this.components.set('infoBtn', infoBtn);
    this.components.set('refreshDataBtn', refreshDataBtn);
    this.components.set('exportBtn', exportBtn);
    this.components.set('selectAllBtn', selectAllBtn);
    this.components.set('clearBtn', clearBtn);
    this.components.set('simulateLoadBtn', simulateLoadBtn);

    // Demo title
    const demoTitle = this.engine.createComponent('label', {
      x: 20,
      y: 10,
      text: 'Priority Components Demo - DataTable, Notifications, Loading Spinners',
      font: 'bold 18px Arial',
      textColor: '#2196F3',
    });
    this.components.set('demoTitle', demoTitle);
  }

  // =============================================================================
  // BUTTON ACTIONS
  // =============================================================================

  refreshTableData() {
    const dataTable = this.components.get('dataTable');
    if (dataTable) {
      const newData = this.generateDemoData();
      dataTable.setData(newData.aiModels);
      this.showNotification('Table data refreshed', 'success', 3000);
    }
  }

  exportTableData() {
    const dataTable = this.components.get('dataTable');
    if (dataTable) {
      const csvData = dataTable.exportData('csv');

      // Create download link
      const blob = new Blob([csvData], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'ai-models-data.csv';
      a.click();
      URL.revokeObjectURL(url);

      this.showNotification('Data exported to CSV', 'success', 3000);
    }
  }

  selectAllRows() {
    const dataTable = this.components.get('dataTable');
    if (dataTable) {
      // Select all visible rows
      const pageData = dataTable.getCurrentPageData();
      for (let i = 0; i < pageData.length; i++) {
        const actualIndex =
          (dataTable.currentPage - 1) * dataTable.pageSize + i;
        dataTable.selectedRows.add(actualIndex);
      }
      this.showNotification(`${pageData.length} rows selected`, 'info', 2000);
    }
  }

  clearSelection() {
    const dataTable = this.components.get('dataTable');
    if (dataTable) {
      dataTable.selectedRows.clear();
      this.showNotification('Selection cleared', 'info', 2000);
    }
  }

  simulateLoadingOperation() {
    // Show overlay spinner
    const overlaySpinner = this.engine.createComponent('loading-spinner', {
      x: 0,
      y: 0,
      width: 1200,
      height: 800,
      size: 'large',
      message: 'Training AI model...',
      progress: 0,
      cancellable: true,
      overlay: true,
    });

    let progress = 0;
    const interval = setInterval(() => {
      progress += 0.05;
      overlaySpinner.setProgress(progress);

      if (progress >= 1) {
        clearInterval(interval);
        this.engine.destroyComponent(overlaySpinner);
        this.showNotification('AI model training completed!', 'success', 5000);
      }
    }, 200);

    // Handle cancellation
    overlaySpinner.on('cancel', () => {
      clearInterval(interval);
      this.engine.destroyComponent(overlaySpinner);
      this.showNotification('Training cancelled by user', 'warning', 3000);
    });

    this.showNotification('Starting AI model training...', 'info', 3000);
  }

  // =============================================================================
  // DEMO LIFECYCLE
  // =============================================================================

  destroy() {
    if (this.engine) {
      this.engine.stop();
      this.engine = null;
    }
    this.components.clear();
    this.notifications = [];
    logger.info('Priority Components Demo destroyed');
  }

  // Public API for external control
  getComponentStats() {
    return {
      totalComponents: this.components.size,
      notifications: this.notifications.length,
      registeredTypes: this.engine ? this.engine.componentRegistry.size : 0,
    };
  }
}

export default PriorityComponentsDemo;
