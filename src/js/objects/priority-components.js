/**
 * High-Priority Reusable Components Implementation
 * Starting with the most critical components for SimulateAI
 */

import { BaseObject } from "./enhanced-objects.js";

// Constants to eliminate magic numbers
const PRIORITY_COMPONENT_CONSTANTS = {
  // DataTable constants
  DATA_TABLE_DEFAULT_WIDTH: 600,
  DATA_TABLE_DEFAULT_HEIGHT: 400,
  DATA_TABLE_DEFAULT_PAGE_SIZE: 25,
  DATA_TABLE_DEFAULT_HEADER_HEIGHT: 40,
  DATA_TABLE_DEFAULT_ROW_HEIGHT: 30,
  DATA_TABLE_SORT_INDICATOR_OFFSET: 20,
  DATA_TABLE_PAGINATION_HEIGHT: 30,
  DATA_TABLE_PAGINATION_TEXT_OFFSET: 10,
  DATA_TABLE_PAGINATION_TEXT_Y_OFFSET: 15,
  DATA_TABLE_PAGINATION_BUTTON_Y_OFFSET: 5,
  DATA_TABLE_PAGINATION_PREV_X_OFFSET: 140,
  DATA_TABLE_PAGINATION_NEXT_X_OFFSET: 70,
  DATA_TABLE_PAGINATION_BUTTON_HEIGHT: 20,
  DATA_TABLE_PAGINATION_BUTTON_WIDTH: 60,
  DATA_TABLE_PAGINATION_BUTTON_TEXT_X_OFFSET: 30,
  DATA_TABLE_PAGINATION_BUTTON_TEXT_Y_OFFSET: 10,

  // NotificationToast constants
  NOTIFICATION_TOAST_DEFAULT_WIDTH: 320,
  NOTIFICATION_TOAST_DEFAULT_HEIGHT: 80,
  NOTIFICATION_TOAST_DEFAULT_DURATION: 5000,
  NOTIFICATION_TOAST_DEFAULT_Y: 20,
  NOTIFICATION_TOAST_DEFAULT_X_OFFSET: 20,
  NOTIFICATION_TOAST_REMOVE_DELAY: 300,
  NOTIFICATION_TOAST_BORDER_WIDTH: 4,
  NOTIFICATION_TOAST_ICON_X: 25,
  NOTIFICATION_TOAST_MESSAGE_X: 50,
  NOTIFICATION_TOAST_DISMISS_X_OFFSET: 15,
  NOTIFICATION_TOAST_PROGRESS_HEIGHT: 2,
  NOTIFICATION_TOAST_PROGRESS_ALPHA: 0.3,

  // LoadingSpinner constants
  LOADING_SPINNER_DEFAULT_WIDTH: 100,
  LOADING_SPINNER_DEFAULT_HEIGHT: 100,
  LOADING_SPINNER_DEFAULT_ANIMATION_SPEED: 2,
  LOADING_SPINNER_FRAME_TIME: 16.67,
  LOADING_SPINNER_FRAME_TIME_DIVISOR: 1000,
  LOADING_SPINNER_MESSAGE_Y_OFFSET: 15,
  LOADING_SPINNER_CANCEL_Y_OFFSET: 40,
  LOADING_SPINNER_CANCEL_BUTTON_WIDTH: 60,
  LOADING_SPINNER_CANCEL_BUTTON_HEIGHT: 25,
  LOADING_SPINNER_CANCEL_BUTTON_X_OFFSET: 30,
  LOADING_SPINNER_CANCEL_BUTTON_TEXT_Y_OFFSET: 12,
  LOADING_SPINNER_LINE_WIDTH: 3,
  LOADING_SPINNER_PROGRESS_LINE_WIDTH: 4,
  LOADING_SPINNER_ARC_END_MULTIPLIER: 1.5,
  LOADING_SPINNER_OVERLAY_ALPHA: 0.8,

  // Size configurations
  SPINNER_SIZE_SMALL: 20,
  SPINNER_SIZE_MEDIUM: 40,
  SPINNER_SIZE_LARGE: 60,
};

// =============================================================================
// PRIORITY 1: DATA TABLE COMPONENT
// =============================================================================

class DataTable extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width:
        options.width || PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_DEFAULT_WIDTH,
      height:
        options.height ||
        PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_DEFAULT_HEIGHT,
      ariaRole: "table",
    });

    this.columns = options.columns || [];
    this.data = options.data || [];
    this.sortColumn = options.sortColumn || null;
    this.sortDirection = options.sortDirection || "asc"; // 'asc' or 'desc'
    this.selectedRows = new Set(options.selectedRows || []);
    this.currentPage = options.currentPage || 1;
    this.pageSize =
      options.pageSize ||
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_DEFAULT_PAGE_SIZE;
    this.pagination = options.pagination !== false;
    this.selectable = options.selectable !== false;
    this.filterable = options.filterable !== false;

    // Styling
    this.headerHeight =
      options.headerHeight ||
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_DEFAULT_HEADER_HEIGHT;
    this.rowHeight =
      options.rowHeight ||
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_DEFAULT_ROW_HEIGHT;
    this.borderColor = options.borderColor || "#CCCCCC";
    this.headerBackground = options.headerBackground || "#F5F5F5";
    this.alternateRowColor = options.alternateRowColor || "#FAFAFA";
    this.selectedRowColor = options.selectedRowColor || "#E3F2FD";

    // State
    this.filters = new Map();
    this.scrollTop = 0;
    this.hoveredRow = -1;

    this.setupTable();
  }

  setupTable() {
    // Calculate display metrics
    this.visibleRows = Math.floor(
      (this.height - this.headerHeight) / this.rowHeight,
    );
    this.totalPages = Math.ceil(this.getFilteredData().length / this.pageSize);

    // Event handlers
    this.on("click", (event) => this.handleClick(event));
    this.on("mouseMove", (event) => this.handleMouseMove(event));
    this.on("keyDown", (event) => this.handleKeyDown(event));
    this.on("scroll", (event) => this.handleScroll(event));
  }

  // Data Management Methods
  getFilteredData() {
    let filteredData = [...this.data];

    // Apply filters
    for (const [column, filterValue] of this.filters) {
      if (filterValue && filterValue.trim() !== "") {
        filteredData = filteredData.filter((row) => {
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

        return this.sortDirection === "desc" ? -comparison : comparison;
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
      this.sortDirection = this.sortDirection === "asc" ? "desc" : "asc";
    } else {
      this.sortColumn = columnKey;
      this.sortDirection = "asc";
    }
    this.emit("sort", { column: columnKey, direction: this.sortDirection });
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

    this.emit("selectionChange", {
      selectedRows: Array.from(this.selectedRows),
    });
  }

  setFilter(columnKey, value) {
    if (value && value.trim() !== "") {
      this.filters.set(columnKey, value);
    } else {
      this.filters.delete(columnKey);
    }
    this.currentPage = 1; // Reset to first page
    this.emit("filter", { column: columnKey, value });
  }

  goToPage(page) {
    this.currentPage = Math.max(1, Math.min(page, this.totalPages));
    this.emit("pageChange", { page: this.currentPage });
  }

  // Event Handlers
  handleClick(event) {
    const { localX, localY } = event;

    // Check header clicks (for sorting)
    if (localY <= this.headerHeight) {
      const columnIndex = Math.floor(
        localX / (this.width / this.columns.length),
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
      (localY - this.headerHeight) / this.rowHeight,
    );

    if (newHoveredRow !== this.hoveredRow) {
      this.hoveredRow = newHoveredRow;
    }
  }

  handleKeyDown(event) {
    switch (event.key) {
      case "ArrowUp":
        // Navigate up
        break;
      case "ArrowDown":
        // Navigate down
        break;
      case "Enter":
      case " ":
        // Select current row
        break;
      case "PageUp":
        this.goToPage(this.currentPage - 1);
        break;
      case "PageDown":
        this.goToPage(this.currentPage + 1);
        break;
    }
  }

  // Rendering
  renderSelf(renderer) {
    if (renderer.type !== "canvas") return;

    this.renderTable(renderer);
    this.renderHeader(renderer);
    this.renderRows(renderer);

    if (this.pagination) {
      this.renderPagination(renderer);
    }
  }

  renderTable(renderer) {
    // Table background
    renderer.fillStyle = "#FFFFFF";
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
      renderer.fillStyle = "#333333";
      renderer.font = "bold 12px Arial";
      renderer.textAlign = "left";
      renderer.textBaseline = "middle";
      renderer.fillText(
        column.title || column.key,
        x + 10,
        this.headerHeight / 2,
      );

      // Sort indicator
      if (this.sortColumn === column.key) {
        const sortX =
          x +
          columnWidth -
          PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_SORT_INDICATOR_OFFSET;
        const sortY = this.headerHeight / 2;
        const arrow = this.sortDirection === "asc" ? "▲" : "▼";

        renderer.font = "10px Arial";
        renderer.textAlign = "center";
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
      let backgroundColor = "#FFFFFF";
      if (this.selectedRows.has(actualRowIndex)) {
        backgroundColor = this.selectedRowColor;
      } else if (index % 2 === 1) {
        backgroundColor = this.alternateRowColor;
      } else if (index === this.hoveredRow) {
        backgroundColor = "#F0F0F0";
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
        renderer.fillStyle = "#333333";
        renderer.font = "11px Arial";
        renderer.textAlign = "left";
        renderer.textBaseline = "middle";

        let displayValue = cellValue;
        if (column.format && typeof column.format === "function") {
          displayValue = column.format(cellValue);
        } else if (column.type === "number" && typeof cellValue === "number") {
          displayValue = cellValue.toFixed(2);
        }

        renderer.fillText(
          String(displayValue || ""),
          cellX + 10,
          y + this.rowHeight / 2,
        );
      });
    });
  }

  renderPagination(renderer) {
    const paginationY =
      this.height - PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_HEIGHT;
    const totalData = this.getFilteredData().length;

    // Pagination background
    renderer.fillStyle = "#F9F9F9";
    renderer.fillRect(
      0,
      paginationY,
      this.width,
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_HEIGHT,
    );

    // Pagination info
    const startItem = (this.currentPage - 1) * this.pageSize + 1;
    const endItem = Math.min(this.currentPage * this.pageSize, totalData);
    const infoText = `${startItem}-${endItem} of ${totalData}`;

    renderer.fillStyle = "#666666";
    renderer.font = "11px Arial";
    renderer.textAlign = "left";
    renderer.fillText(
      infoText,
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_TEXT_OFFSET,
      paginationY +
        PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_TEXT_Y_OFFSET,
    );

    // Page controls
    const buttonWidth =
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_WIDTH;
    const buttonY =
      paginationY +
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_Y_OFFSET;
    const prevX =
      this.width -
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_PREV_X_OFFSET;
    const nextX =
      this.width -
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_NEXT_X_OFFSET;

    // Previous button
    renderer.fillStyle = this.currentPage > 1 ? "#2196F3" : "#CCCCCC";
    renderer.fillRect(
      prevX,
      buttonY,
      buttonWidth,
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_HEIGHT,
    );
    renderer.fillStyle = "#FFFFFF";
    renderer.textAlign = "center";
    renderer.fillText(
      "Previous",
      prevX +
        PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_TEXT_X_OFFSET,
      buttonY +
        PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_TEXT_Y_OFFSET,
    );

    // Next button
    renderer.fillStyle =
      this.currentPage < this.totalPages ? "#2196F3" : "#CCCCCC";
    renderer.fillRect(
      nextX,
      buttonY,
      buttonWidth,
      PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_HEIGHT,
    );
    renderer.fillStyle = "#FFFFFF";
    renderer.fillText(
      "Next",
      nextX +
        PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_TEXT_X_OFFSET,
      buttonY +
        PRIORITY_COMPONENT_CONSTANTS.DATA_TABLE_PAGINATION_BUTTON_TEXT_Y_OFFSET,
    );
  }

  // Public API Methods
  setData(newData) {
    this.data = newData;
    this.selectedRows.clear();
    this.currentPage = 1;
    this.totalPages = Math.ceil(this.getFilteredData().length / this.pageSize);
    this.emit("dataChange", { data: newData });
  }

  getSelectedData() {
    const filteredData = this.getFilteredData();
    return Array.from(this.selectedRows)
      .map((index) => filteredData[index])
      .filter(Boolean);
  }

  exportData(format = "json") {
    const data = this.getFilteredData();

    if (format === "csv") {
      const headers = this.columns.map((col) => col.title || col.key).join(",");
      const rows = data
        .map((row) => this.columns.map((col) => row[col.key]).join(","))
        .join("\n");
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
      width:
        options.width ||
        PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_DEFAULT_WIDTH,
      height:
        options.height ||
        PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_DEFAULT_HEIGHT,
      ariaRole: "alert",
    });

    this.message = options.message || "Notification";
    this.type = options.type || "info"; // 'success', 'error', 'warning', 'info'
    this.duration =
      options.duration ||
      PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_DEFAULT_DURATION; // Auto-dismiss time
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
      success: "✓",
      error: "✗",
      warning: "⚠",
      info: "ℹ",
    };
    return icons[this.type] || icons.info;
  }

  setupToast() {
    // Position toast (typically managed by a ToastManager)
    this.y =
      this.y || PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_DEFAULT_Y;
    this.x =
      this.x ||
      window.innerWidth -
        this.width -
        PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_DEFAULT_X_OFFSET;

    this.show();
  }

  show() {
    this.isVisible = true;
    this.startTime = performance.now();
    this.emit("show", this);

    // Auto-dismiss timer
    if (this.duration > 0) {
      setTimeout(() => {
        this.hide();
      }, this.duration);
    }
  }

  hide() {
    this.isVisible = false;
    this.emit("hide", this);

    // Remove from parent/engine after animation
    setTimeout(() => {
      this.emit("remove", this);
    }, PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_REMOVE_DELAY);
  }

  renderSelf(renderer) {
    if (!this.isVisible || renderer.type !== "canvas") return;

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
    renderer.fillRect(
      0,
      0,
      PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_BORDER_WIDTH,
      this.height,
    );

    // Icon
    renderer.fillStyle = colors.accent;
    renderer.font = "16px Arial";
    renderer.textAlign = "center";
    renderer.fillText(
      this.icon,
      PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_ICON_X,
      this.height / 2,
    );

    // Message
    renderer.fillStyle = colors.text;
    renderer.font = "13px Arial";
    renderer.textAlign = "left";
    renderer.textBaseline = "middle";
    renderer.fillText(
      this.message,
      PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_MESSAGE_X,
      this.height / 2,
    );

    // Dismiss button
    if (this.dismissible) {
      renderer.fillStyle = colors.text;
      renderer.font = "14px Arial";
      renderer.textAlign = "center";
      renderer.fillText(
        "×",
        this.width -
          PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_DISMISS_X_OFFSET,
        this.height / 2,
      );
    }

    // Progress bar
    if (this.duration > 0) {
      const progressWidth = this.width * this.progress;
      renderer.fillStyle = colors.accent;
      renderer.globalAlpha =
        PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_PROGRESS_ALPHA;
      renderer.fillRect(
        0,
        this.height -
          PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_PROGRESS_HEIGHT,
        progressWidth,
        PRIORITY_COMPONENT_CONSTANTS.NOTIFICATION_TOAST_PROGRESS_HEIGHT,
      );
      renderer.globalAlpha = 1;
    }
  }

  getTypeColors() {
    const colorSchemes = {
      success: {
        background: "#E8F5E8",
        accent: "#4CAF50",
        text: "#2E7D32",
      },
      error: {
        background: "#FFEBEE",
        accent: "#F44336",
        text: "#C62828",
      },
      warning: {
        background: "#FFF3E0",
        accent: "#FF9800",
        text: "#E65100",
      },
      info: {
        background: "#E3F2FD",
        accent: "#2196F3",
        text: "#1565C0",
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
      width:
        options.width ||
        PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_DEFAULT_WIDTH,
      height:
        options.height ||
        PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_DEFAULT_HEIGHT,
      ariaRole: "progressbar",
    });

    this.message = options.message || "Loading...";
    this.size = options.size || "medium"; // 'small', 'medium', 'large'
    this.progress = options.progress || null; // null for indeterminate
    this.cancellable = options.cancellable || false;
    this.overlay = options.overlay !== false;

    // Animation state
    this.rotation = 0;
    this.animationSpeed =
      options.animationSpeed ||
      PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_DEFAULT_ANIMATION_SPEED; // rotations per second

    this.setupSpinner();
  }

  setupSpinner() {
    // Size-based dimensions
    const sizes = {
      small: {
        spinner: PRIORITY_COMPONENT_CONSTANTS.SPINNER_SIZE_SMALL,
        font: "11px Arial",
      },
      medium: {
        spinner: PRIORITY_COMPONENT_CONSTANTS.SPINNER_SIZE_MEDIUM,
        font: "13px Arial",
      },
      large: {
        spinner: PRIORITY_COMPONENT_CONSTANTS.SPINNER_SIZE_LARGE,
        font: "15px Arial",
      },
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
        this.rotation +=
          this.animationSpeed *
          (PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_FRAME_TIME /
            PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_FRAME_TIME_DIVISOR) *
          Math.PI *
          2; // Assuming 60fps
        requestAnimationFrame(animate);
      }
    };
    animate();
  }

  setProgress(progress) {
    this.progress = Math.max(0, Math.min(1, progress));
    this.emit("progressChange", { progress: this.progress });
  }

  renderSelf(renderer) {
    if (renderer.type !== "canvas") return;

    // Overlay background
    if (this.overlay) {
      renderer.fillStyle = `rgba(255, 255, 255, ${PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_OVERLAY_ALPHA})`;
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
      renderer.fillStyle = "#666666";
      renderer.font = this.font;
      renderer.textAlign = "center";
      renderer.textBaseline = "top";
      renderer.fillText(
        this.message,
        centerX,
        centerY +
          this.spinnerSize / 2 +
          PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_MESSAGE_Y_OFFSET,
      );
    }

    // Progress percentage
    if (this.progress !== null) {
      const percentage = `${Math.round(this.progress * 100)}%`;
      renderer.fillStyle = "#333333";
      renderer.font = this.font;
      renderer.textAlign = "center";
      renderer.textBaseline = "middle";
      renderer.fillText(percentage, centerX, centerY);
    }

    // Cancel button
    if (this.cancellable) {
      const cancelY =
        centerY +
        this.spinnerSize / 2 +
        PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_CANCEL_Y_OFFSET;
      renderer.fillStyle = "#F44336";
      renderer.fillRect(
        centerX -
          PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_CANCEL_BUTTON_X_OFFSET,
        cancelY,
        PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_CANCEL_BUTTON_WIDTH,
        PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_CANCEL_BUTTON_HEIGHT,
      );

      renderer.fillStyle = "#FFFFFF";
      renderer.font = "11px Arial";
      renderer.textAlign = "center";
      renderer.fillText(
        "Cancel",
        centerX,
        cancelY +
          PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_CANCEL_BUTTON_TEXT_Y_OFFSET,
      );
    }
  }

  renderIndeterminateSpinner(renderer, centerX, centerY) {
    const radius = this.spinnerSize / 2;

    renderer.save();
    renderer.translate(centerX, centerY);
    renderer.rotate(this.rotation);

    // Spinner arc
    renderer.strokeStyle = "#2196F3";
    renderer.lineWidth =
      PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_LINE_WIDTH;
    renderer.beginPath();
    renderer.arc(
      0,
      0,
      radius,
      0,
      Math.PI * PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_ARC_END_MULTIPLIER,
    );
    renderer.stroke();

    renderer.restore();
  }

  renderProgressCircle(renderer, centerX, centerY) {
    const radius = this.spinnerSize / 2;

    // Background circle
    renderer.strokeStyle = "#E0E0E0";
    renderer.lineWidth =
      PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_PROGRESS_LINE_WIDTH;
    renderer.beginPath();
    renderer.arc(centerX, centerY, radius, 0, Math.PI * 2);
    renderer.stroke();

    // Progress arc
    if (this.progress > 0) {
      const progressAngle = this.progress * Math.PI * 2;

      renderer.strokeStyle = "#2196F3";
      renderer.lineWidth =
        PRIORITY_COMPONENT_CONSTANTS.LOADING_SPINNER_PROGRESS_LINE_WIDTH;
      renderer.beginPath();
      renderer.arc(
        centerX,
        centerY,
        radius,
        -Math.PI / 2,
        -Math.PI / 2 + progressAngle,
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
