/**
 * High-Priority Reusable Components Implementation
 * Starting with the most critical components for SimulateAI
 */

import { BaseObject } from './enhanced-objects.js';

// =============================================================================
// PRIORITY 1: DATA TABLE COMPONENT
// =============================================================================

class DataTable extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || 600,
      height: options.height || 400,
      ariaRole: 'table',
    });

    this.columns = options.columns || [];
    this.data = options.data || [];
    this.sortColumn = options.sortColumn || null;
    this.sortDirection = options.sortDirection || 'asc'; // 'asc' or 'desc'
    this.selectedRows = new Set(options.selectedRows || []);
    this.currentPage = options.currentPage || 1;
    this.pageSize = options.pageSize || 25;
    this.pagination = options.pagination !== false;
    this.selectable = options.selectable !== false;
    this.filterable = options.filterable !== false;

    // Styling
    this.headerHeight = options.headerHeight || 40;
    this.rowHeight = options.rowHeight || 30;
    this.borderColor = options.borderColor || '#CCCCCC';
    this.headerBackground = options.headerBackground || '#F5F5F5';
    this.alternateRowColor = options.alternateRowColor || '#FAFAFA';
    this.selectedRowColor = options.selectedRowColor || '#E3F2FD';

    // State
    this.filters = new Map();
    this.scrollTop = 0;
    this.hoveredRow = -1;

    this.setupTable();
  }

  setupTable() {
    // Calculate display metrics
    this.visibleRows = Math.floor(
      (this.height - this.headerHeight) / this.rowHeight
    );
    this.totalPages = Math.ceil(this.getFilteredData().length / this.pageSize);

    // Event handlers
    this.on('click', event => this.handleClick(event));
    this.on('mouseMove', event => this.handleMouseMove(event));
    this.on('keyDown', event => this.handleKeyDown(event));
    this.on('scroll', event => this.handleScroll(event));
  }

  // Data Management Methods
  getFilteredData() {
    let filteredData = [...this.data];

    // Apply filters
    for (const [column, filterValue] of this.filters) {
      if (filterValue && filterValue.trim() !== '') {
        filteredData = filteredData.filter(row => {
          const cellValue = row[column];
          return String(cellValue)
            .toLowerCase()
            .includes(filterValue.toLowerCase());
        });
      }
    }

    // Apply sorting
    if (this.sortColumn) {
      filteredData.sort((a, b) => {
        const aVal = a[this.sortColumn];
        const bVal = b[this.sortColumn];

        let comparison = 0;
        if (aVal < bVal) comparison = -1;
        else if (aVal > bVal) comparison = 1;

        return this.sortDirection === 'desc' ? -comparison : comparison;
      });
    }

    return filteredData;
  }

  getCurrentPageData() {
    const filteredData = this.getFilteredData();
    const startIndex = (this.currentPage - 1) * this.pageSize;
    const endIndex = Math.min(startIndex + this.pageSize, filteredData.length);
    return filteredData.slice(startIndex, endIndex);
  }

  // Interaction Methods
  sortByColumn(columnKey) {
    if (this.sortColumn === columnKey) {
      this.sortDirection = this.sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = 'asc';
    }
    this.emit('sort', { column: columnKey, direction: this.sortDirection });
  }

  selectRow(rowIndex, multiSelect = false) {
    if (!this.selectable) return;

    if (!multiSelect) {
      this.selectedRows.clear();
    }

    if (this.selectedRows.has(rowIndex)) {
      this.selectedRows.delete(rowIndex);
    } else {
      this.selectedRows.add(rowIndex);
    }

    this.emit('selectionChange', {
      selectedRows: Array.from(this.selectedRows),
    });
  }

  setFilter(columnKey, value) {
    if (value && value.trim() !== '') {
      this.filters.set(columnKey, value);
    } else {
      this.filters.delete(columnKey);
    }
    this.currentPage = 1; // Reset to first page
    this.emit('filter', { column: columnKey, value });
  }

  goToPage(page) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.emit('pageChange', { page: this.currentPage });
  }

  // Event Handlers
  handleClick(event) {
    const { localX, localY } = event;

    // Check header clicks (for sorting)
    if (localY <= this.headerHeight) {
      const columnIndex = Math.floor(
        localX / (this.width / this.columns.length)
      );
      const column = this.columns[columnIndex];
      if (column && column.sortable !== false) {
        this.sortByColumn(column.key);
      }
      return;
    }

    // Check row clicks (for selection)
    const rowIndex = Math.floor((localY - this.headerHeight) / this.rowHeight);
    const actualRowIndex = (this.currentPage - 1) * this.pageSize + rowIndex;

    if (rowIndex >= 0 && rowIndex < this.getCurrentPageData().length) {
      this.selectRow(actualRowIndex, event.ctrlKey || event.metaKey);
    }
  }

  handleMouseMove(event) {
    const { localY } = event;
    const newHoveredRow = Math.floor(
      (localY - this.headerHeight) / this.rowHeight
    );

    if (newHoveredRow !== this.hoveredRow) {
      this.hoveredRow = newHoveredRow;
    }
  }

  handleKeyDown(event) {
    switch (event.key) {
      case 'ArrowUp':
        // Navigate up
        break;
      case 'ArrowDown':
        // Navigate down
        break;
      case 'Enter':
      case ' ':
        // Select current row
        break;
      case 'PageUp':
        this.goToPage(this.currentPage - 1);
        break;
      case 'PageDown':
        this.goToPage(this.currentPage + 1);
        break;
    }
  }

  // Rendering
  renderSelf(renderer) {
    if (renderer.type !== 'canvas') return;

    this.renderTable(renderer);
    this.renderHeader(renderer);
    this.renderRows(renderer);

    if (this.pagination) {
      this.renderPagination(renderer);
    }
  }

  renderTable(renderer) {
    // Table background
    renderer.fillStyle = '#FFFFFF';
    renderer.fillRect(0, 0, this.width, this.height);

    // Table border
    renderer.strokeStyle = this.borderColor;
    renderer.lineWidth = 1;
    renderer.strokeRect(0, 0, this.width, this.height);
  }

  renderHeader(renderer) {
    // Header background
    renderer.fillStyle = this.headerBackground;
    renderer.fillRect(0, 0, this.width, this.headerHeight);

    // Header border
    renderer.strokeStyle = this.borderColor;
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(0, this.headerHeight);
    renderer.lineTo(this.width, this.headerHeight);
    renderer.stroke();

    // Column headers
    const columnWidth = this.width / this.columns.length;

    this.columns.forEach((column, index) => {
      const x = index * columnWidth;

      // Column separator
      if (index > 0) {
        renderer.beginPath();
        renderer.moveTo(x, 0);
        renderer.lineTo(x, this.headerHeight);
        renderer.stroke();
      }

      // Header text
      renderer.fillStyle = '#333333';
      renderer.font = 'bold 12px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';
      renderer.fillText(
        column.title || column.key,
        x + 10,
        this.headerHeight / 2
      );

      // Sort indicator
      if (this.sortColumn === column.key) {
        const sortX = x + columnWidth - 20;
        const sortY = this.headerHeight / 2;
        const arrow = this.sortDirection === 'asc' ? '▲' : '▼';

        renderer.font = '10px Arial';
        renderer.textAlign = 'center';
        renderer.fillText(arrow, sortX, sortY);
      }
    });
  }

  renderRows(renderer) {
    const pageData = this.getCurrentPageData();
    const columnWidth = this.width / this.columns.length;

    pageData.forEach((row, index) => {
      const y = this.headerHeight + index * this.rowHeight;
      const actualRowIndex = (this.currentPage - 1) * this.pageSize + index;

      // Row background
      let backgroundColor = '#FFFFFF';
      if (this.selectedRows.has(actualRowIndex)) {
        backgroundColor = this.selectedRowColor;
      } else if (index % 2 === 1) {
        backgroundColor = this.alternateRowColor;
      } else if (index === this.hoveredRow) {
        backgroundColor = '#F0F0F0';
      }

      renderer.fillStyle = backgroundColor;
      renderer.fillRect(0, y, this.width, this.rowHeight);

      // Row border
      renderer.strokeStyle = this.borderColor;
      renderer.lineWidth = 0.5;
      renderer.beginPath();
      renderer.moveTo(0, y + this.rowHeight);
      renderer.lineTo(this.width, y + this.rowHeight);
      renderer.stroke();

      // Cell content
      this.columns.forEach((column, colIndex) => {
        const cellX = colIndex * columnWidth;
        const cellValue = row[column.key];

        // Column separator
        if (colIndex > 0) {
          renderer.beginPath();
          renderer.moveTo(cellX, y);
          renderer.lineTo(cellX, y + this.rowHeight);
          renderer.stroke();
        }

        // Cell text
        renderer.fillStyle = '#333333';
        renderer.font = '11px Arial';
        renderer.textAlign = 'left';
        renderer.textBaseline = 'middle';

        let displayValue = cellValue;
        if (column.format && typeof column.format === 'function') {
          displayValue = column.format(cellValue);
        } else if (column.type === 'number' && typeof cellValue === 'number') {
          displayValue = cellValue.toFixed(2);
        }

        renderer.fillText(
          String(displayValue || ''),
          cellX + 10,
          y + this.rowHeight / 2
        );
      });
    });
  }

  renderPagination(renderer) {
    const paginationY = this.height - 30;
    const totalData = this.getFilteredData().length;

    // Pagination background
    renderer.fillStyle = '#F9F9F9';
    renderer.fillRect(0, paginationY, this.width, 30);

    // Pagination info
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, totalData);
    const infoText = `${startItem}-${endItem} of ${totalData}`;

    renderer.fillStyle = '#666666';
    renderer.font = '11px Arial';
    renderer.textAlign = 'left';
    renderer.fillText(infoText, 10, paginationY + 15);

    // Page controls
    const buttonWidth = 60;
    const buttonY = paginationY + 5;
    const prevX = this.width - 140;
    const nextX = this.width - 70;

    // Previous button
    renderer.fillStyle = this.currentPage > 1 ? '#2196F3' : '#CCCCCC';
    renderer.fillRect(prevX, buttonY, buttonWidth, 20);
    renderer.fillStyle = '#FFFFFF';
    renderer.textAlign = 'center';
    renderer.fillText('Previous', prevX + 30, buttonY + 10);

    // Next button
    renderer.fillStyle =
      this.currentPage < this.totalPages ? '#2196F3' : '#CCCCCC';
    renderer.fillRect(nextX, buttonY, buttonWidth, 20);
    renderer.fillStyle = '#FFFFFF';
    renderer.fillText('Next', nextX + 30, buttonY + 10);
  }

  // Public API Methods
  setData(newData) {
    this.data = newData;
    this.selectedRows.clear();
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.getFilteredData().length / this.pageSize);
    this.emit('dataChange', { data: newData });
  }

  getSelectedData() {
    const filteredData = this.getFilteredData();
    return Array.from(this.selectedRows)
      .map(index => filteredData[index])
      .filter(Boolean);
  }

  exportData(format = 'json') {
    const data = this.getFilteredData();

    if (format === 'csv') {
      const headers = this.columns.map(col => col.title || col.key).join(',');
      const rows = data
        .map(row => this.columns.map(col => row[col.key]).join(','))
        .join('\n');
      return `${headers}\n${rows}`;
    }

    return JSON.stringify(data, null, 2);
  }
}

// =============================================================================
// PRIORITY 2: NOTIFICATION TOAST COMPONENT
// =============================================================================

class NotificationToast extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || 320,
      height: options.height || 80,
      ariaRole: 'alert',
    });

    this.message = options.message || 'Notification';
    this.type = options.type || 'info'; // 'success', 'error', 'warning', 'info'
    this.duration = options.duration || 5000; // Auto-dismiss time
    this.dismissible = options.dismissible !== false;
    this.actions = options.actions || [];
    this.icon = options.icon || this.getDefaultIcon();

    // State
    this.isVisible = false;
    this.progress = 0;
    this.startTime = null;

    this.setupToast();
  }

  getDefaultIcon() {
    const icons = {
      success: '✓',
      error: '✗',
      warning: '⚠',
      info: 'ℹ',
    };
    return icons[this.type] || icons.info;
  }

  setupToast() {
    // Position toast (typically managed by a ToastManager)
    this.y = this.y || 20;
    this.x = this.x || window.innerWidth - this.width - 20;

    this.show();
  }

  show() {
    this.isVisible = true;
    this.startTime = performance.now();
    this.emit('show', this);

    // Auto-dismiss timer
    if (this.duration > 0) {
      setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }

  hide() {
    this.isVisible = false;
    this.emit('hide', this);

    // Remove from parent/engine after animation
    setTimeout(() => {
      this.emit('remove', this);
    }, 300);
  }

  renderSelf(renderer) {
    if (!this.isVisible || renderer.type !== 'canvas') return;

    // Update progress for auto-dismiss
    if (this.duration > 0 && this.startTime) {
      const elapsed = performance.now() - this.startTime;
      this.progress = Math.min(elapsed / this.duration, 1);
    }

    // Toast background
    const colors = this.getTypeColors();
    renderer.fillStyle = colors.background;
    renderer.fillRect(0, 0, this.width, this.height);

    // Left border accent
    renderer.fillStyle = colors.accent;
    renderer.fillRect(0, 0, 4, this.height);

    // Icon
    renderer.fillStyle = colors.accent;
    renderer.font = '16px Arial';
    renderer.textAlign = 'center';
    renderer.fillText(this.icon, 25, this.height / 2);

    // Message
    renderer.fillStyle = colors.text;
    renderer.font = '13px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';
    renderer.fillText(this.message, 50, this.height / 2);

    // Dismiss button
    if (this.dismissible) {
      renderer.fillStyle = colors.text;
      renderer.font = '14px Arial';
      renderer.textAlign = 'center';
      renderer.fillText('×', this.width - 15, this.height / 2);
    }

    // Progress bar
    if (this.duration > 0) {
      const progressWidth = this.width * this.progress;
      renderer.fillStyle = colors.accent;
      renderer.globalAlpha = 0.3;
      renderer.fillRect(0, this.height - 2, progressWidth, 2);
      renderer.globalAlpha = 1;
    }
  }

  getTypeColors() {
    const colorSchemes = {
      success: {
        background: '#E8F5E8',
        accent: '#4CAF50',
        text: '#2E7D32',
      },
      error: {
        background: '#FFEBEE',
        accent: '#F44336',
        text: '#C62828',
      },
      warning: {
        background: '#FFF3E0',
        accent: '#FF9800',
        text: '#E65100',
      },
      info: {
        background: '#E3F2FD',
        accent: '#2196F3',
        text: '#1565C0',
      },
    };

    return colorSchemes[this.type] || colorSchemes.info;
  }
}

// =============================================================================
// PRIORITY 3: LOADING SPINNER COMPONENT
// =============================================================================

class LoadingSpinner extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || 100,
      height: options.height || 100,
      ariaRole: 'progressbar',
    });

    this.message = options.message || 'Loading...';
    this.size = options.size || 'medium'; // 'small', 'medium', 'large'
    this.progress = options.progress || null; // null for indeterminate
    this.cancellable = options.cancellable || false;
    this.overlay = options.overlay !== false;

    // Animation state
    this.rotation = 0;
    this.animationSpeed = options.animationSpeed || 2; // rotations per second

    this.setupSpinner();
  }

  setupSpinner() {
    // Size-based dimensions
    const sizes = {
      small: { spinner: 20, font: '11px Arial' },
      medium: { spinner: 40, font: '13px Arial' },
      large: { spinner: 60, font: '15px Arial' },
    };

    const sizeConfig = sizes[this.size] || sizes.medium;
    this.spinnerSize = sizeConfig.spinner;
    this.font = sizeConfig.font;

    // Start animation
    this.startAnimation();
  }

  startAnimation() {
    const animate = () => {
      if (this.visible) {
        this.rotation += this.animationSpeed * (16.67 / 1000) * Math.PI * 2; // Assuming 60fps
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    this.emit('progressChange', { progress: this.progress });
  }

  renderSelf(renderer) {
    if (renderer.type !== 'canvas') return;

    // Overlay background
    if (this.overlay) {
      renderer.fillStyle = 'rgba(255, 255, 255, 0.8)';
      renderer.fillRect(0, 0, this.width, this.height);
    }

    const centerX = this.width / 2;
    const centerY = this.height / 2;

    // Spinner
    if (this.progress === null) {
      // Indeterminate spinner
      this.renderIndeterminateSpinner(renderer, centerX, centerY);
    } else {
      // Determinate progress circle
      this.renderProgressCircle(renderer, centerX, centerY);
    }

    // Message
    if (this.message) {
      renderer.fillStyle = '#666666';
      renderer.font = this.font;
      renderer.textAlign = 'center';
      renderer.textBaseline = 'top';
      renderer.fillText(
        this.message,
        centerX,
        centerY + this.spinnerSize / 2 + 15
      );
    }

    // Progress percentage
    if (this.progress !== null) {
      const percentage = `${Math.round(this.progress * 100)}%`;
      renderer.fillStyle = '#333333';
      renderer.font = this.font;
      renderer.textAlign = 'center';
      renderer.textBaseline = 'middle';
      renderer.fillText(percentage, centerX, centerY);
    }

    // Cancel button
    if (this.cancellable) {
      const cancelY = centerY + this.spinnerSize / 2 + 40;
      renderer.fillStyle = '#F44336';
      renderer.fillRect(centerX - 30, cancelY, 60, 25);

      renderer.fillStyle = '#FFFFFF';
      renderer.font = '11px Arial';
      renderer.textAlign = 'center';
      renderer.fillText('Cancel', centerX, cancelY + 12);
    }
  }

  renderIndeterminateSpinner(renderer, centerX, centerY) {
    const radius = this.spinnerSize / 2;

    renderer.save();
    renderer.translate(centerX, centerY);
    renderer.rotate(this.rotation);

    // Spinner arc
    renderer.strokeStyle = '#2196F3';
    renderer.lineWidth = 3;
    renderer.beginPath();
    renderer.arc(0, 0, radius, 0, Math.PI * 1.5);
    renderer.stroke();

    renderer.restore();
  }

  renderProgressCircle(renderer, centerX, centerY) {
    const radius = this.spinnerSize / 2;

    // Background circle
    renderer.strokeStyle = '#E0E0E0';
    renderer.lineWidth = 4;
    renderer.beginPath();
    renderer.arc(centerX, centerY, radius, 0, Math.PI * 2);
    renderer.stroke();

    // Progress arc
    if (this.progress > 0) {
      const progressAngle = this.progress * Math.PI * 2;

      renderer.strokeStyle = '#2196F3';
      renderer.lineWidth = 4;
      renderer.beginPath();
      renderer.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + progressAngle
      );
      renderer.stroke();
    }
  }
}

// =============================================================================
// EXPORTS
// =============================================================================

export { DataTable, NotificationToast, LoadingSpinner };

export default {
  DataTable,
  NotificationToast,
  LoadingSpinner,
};
