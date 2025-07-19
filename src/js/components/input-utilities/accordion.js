/**
 * Accordion Component
 *
 * Advanced Accordion component with accessibility, smooth animations,
 * and modern interaction patterns.
 *
 * Features:
 * - Expandable/collapsible items with smooth animations
 * - Full accessibility support (ARIA attributes, keyboard navigation)
 * - Single or multiple expansion modes
 * - Customizable themes and styling
 * - Performance optimized with render caching
 * - Error handling and recovery
 * - Dynamic item management (add, remove, update)
 * - Hierarchical accordion support
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import { BaseObject } from '../../objects/enhanced-objects.js';
import { INPUT_UTILITY_CONSTANTS } from './constants.js';
import { ComponentTheme } from './theme.js';

// Temporary local utility implementations to avoid circular dependencies
// These will be extracted to shared modules in future iterations

// Temporary local ComponentError class
class ComponentError extends Error {
  constructor(message, component, metadata = {}) {
    super(message);
    this.name = 'ComponentError';
    this.component = component;
    this.metadata = metadata;
    this.timestamp = Date.now();
  }
}

// Temporary local ComponentDebug utility
const ComponentDebug = {
  isEnabled: true,
  error: (message, ...args) => {
    if (ComponentDebug.isEnabled && process.env.NODE_ENV === 'development') {
      // In development, log to console; in production, this could send to logging service
      // eslint-disable-next-line no-console
      console.error(`[ComponentDebug] ${message}`, ...args);
    }
  },
};

// Temporary local AnimationManager
const AnimationManager = {
  cancelAnimation: () => {
    // Simple implementation - in a full system this would track and cancel animations
  },
};

// Performance thresholds
const PERFORMANCE_THRESHOLDS = {
  eventThrottle: 16, // ~60fps
};

class Accordion extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || INPUT_UTILITY_CONSTANTS.DEFAULT_ACCORDION_WIDTH,
      height:
        options.height || INPUT_UTILITY_CONSTANTS.DEFAULT_ACCORDION_HEIGHT,
      ariaRole: 'region',
      ariaLabel: options.ariaLabel || 'Accordion',
    });

    // Validate options
    this.validateOptions(options);

    // Core properties
    this.items = options.items || [];
    this.allowMultiple = options.allowMultiple || false;
    this.expandedItems = new Set(options.expandedItems || []);
    this.animationDuration =
      options.animationDuration ||
      INPUT_UTILITY_CONSTANTS.DEFAULT_ANIMATION_DURATION;
    this.disabled = options.disabled || false;

    // Theme integration
    this.theme = options.theme || ComponentTheme.getCurrentTheme();
    this.headerHeight =
      options.headerHeight || INPUT_UTILITY_CONSTANTS.DEFAULT_HEADER_HEIGHT;

    // Animation and performance
    this.animatingItems = new Map();
    this.renderCache = new Map();
    this.throttledRender = this.throttle(
      this.render.bind(this),
      PERFORMANCE_THRESHOLDS.eventThrottle
    );

    // Accessibility
    this.announcer = this.createScreenReaderAnnouncer();
    this.focusedItemIndex = -1;
    this.keyboardHandler = this.createKeyboardHandler();

    // Error handling
    this.errorHandler = this.createErrorHandler();

    try {
      this.setupItems();
      this.setupEventHandlers();
      this.setupAccessibility();
      this.setupResizeObserver();
    } catch (error) {
      this.errorHandler.handle(error, 'constructor');
    }
  }

  validateOptions(options) {
    if (options.items && !Array.isArray(options.items)) {
      throw new ComponentError('Items must be an array', 'Accordion');
    }

    if (
      options.animationDuration &&
      (typeof options.animationDuration !== 'number' ||
        options.animationDuration < 0)
    ) {
      throw new ComponentError(
        'Animation duration must be a positive number',
        'Accordion'
      );
    }
  }

  createScreenReaderAnnouncer() {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', 'polite');
    announcer.setAttribute('aria-atomic', 'true');
    announcer.style.cssText = `
            position: absolute;
            left: -10000px;
            width: 1px;
            height: 1px;
            overflow: hidden;
        `;
    document.body.appendChild(announcer);
    return announcer;
  }

  createKeyboardHandler() {
    return {
      ArrowUp: () => this.navigateToItem(-1),
      ArrowDown: () => this.navigateToItem(1),
      Home: () => this.navigateToItem('first'),
      End: () => this.navigateToItem('last'),
      Enter: () => this.toggleFocusedItem(),
      Space: () => this.toggleFocusedItem(),
      Escape: () => this.collapseAll(),
    };
  }

  createErrorHandler() {
    return {
      handle: (error, context) => {
        const componentError = new ComponentError(
          error.message || 'Unknown error',
          'Accordion',
          { context, originalError: error }
        );

        ComponentDebug.error('Accordion Error:', componentError);
        this.emit('error', componentError);

        this.recoverFromError(context);
      },
    };
  }

  recoverFromError(context) {
    switch (context) {
      case 'animation':
        this.animatingItems.clear();
        break;
      case 'render':
        this.clearRenderCache();
        break;
      default:
        this.reset();
    }
  }

  setupAccessibility() {
    // ARIA attributes
    this.setAttribute('role', 'region');
    this.setAttribute('aria-multiselectable', this.allowMultiple.toString());

    // Keyboard accessibility
    this.setAttribute('tabindex', this.disabled ? '-1' : '0');

    // Focus management
    this.addEventListener('focusin', () => this.handleFocusIn());
    this.addEventListener('focusout', () => this.handleFocusOut());
  }

  setupResizeObserver() {
    if ('ResizeObserver' in window) {
      this.resizeObserver = new ResizeObserver(_entries => {
        this.clearRenderCache();
        this.throttledRender();
      });

      if (this.element) {
        this.resizeObserver.observe(this.element);
      }
    }
  }

  setupItems() {
    this.items = this.items.map((item, index) => ({
      id: item.id || `item-${index}`,
      title: item.title || `Item ${index + 1}`,
      content: item.content || '',
      icon: item.icon || null,
      disabled: item.disabled || false,
      level: item.level || 1, // For hierarchical accordions
      ...item,
    }));

    // Set up ARIA IDs for each item
    this.items.forEach((item, index) => {
      item.headerId = `accordion-header-${this.id}-${index}`;
      item.panelId = `accordion-panel-${this.id}-${index}`;
    });
  }

  setupEventHandlers() {
    const eventHandlers = {
      click: this.handleClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.on(event, handler);
    });
  }

  // Enhanced item management with animations
  async expandItem(itemId) {
    try {
      const item = this.items.find(i => i.id === itemId);
      if (!item || item.disabled || this.expandedItems.has(itemId)) return;

      if (!this.allowMultiple) {
        await this.collapseAll();
      }

      this.expandedItems.add(itemId);

      // Animate expansion
      if (!this.prefersReducedMotion()) {
        await this.animateItem(itemId, 'expand');
      }

      this.updateItemAccessibility(item, true);
      this.announceChange(`${item.title} expanded`);
      this.emit('itemExpanded', { itemId, item });
    } catch (error) {
      this.errorHandler.handle(error, 'expand-item');
    }
  }

  async collapseItem(itemId) {
    try {
      const item = this.items.find(i => i.id === itemId);
      if (!item || !this.expandedItems.has(itemId)) return;

      this.expandedItems.delete(itemId);

      // Animate collapse
      if (!this.prefersReducedMotion()) {
        await this.animateItem(itemId, 'collapse');
      }

      this.updateItemAccessibility(item, false);
      this.announceChange(`${item.title} collapsed`);
      this.emit('itemCollapsed', { itemId, item });
    } catch (error) {
      this.errorHandler.handle(error, 'collapse-item');
    }
  }

  async toggleItem(itemId) {
    if (this.expandedItems.has(itemId)) {
      await this.collapseItem(itemId);
    } else {
      await this.expandItem(itemId);
    }
  }

  async animateItem(itemId, type) {
    const animationData = {
      type,
      startTime: performance.now(),
      duration: this.animationDuration,
    };

    this.animatingItems.set(itemId, animationData);

    return new Promise(resolve => {
      const animate = () => {
        const elapsed = performance.now() - animationData.startTime;
        const progress = Math.min(elapsed / this.animationDuration, 1);

        if (progress >= 1) {
          this.animatingItems.delete(itemId);
          resolve();
        } else {
          requestAnimationFrame(animate);
        }
      };

      animate();
    });
  }

  updateItemAccessibility(item, isExpanded) {
    // Update ARIA attributes for screen readers
    if (this.element && item.headerId && item.panelId) {
      const header = this.element.querySelector(`#${item.headerId}`);
      const panel = this.element.querySelector(`#${item.panelId}`);

      if (header) {
        header.setAttribute('aria-expanded', isExpanded.toString());
      }

      if (panel) {
        panel.setAttribute('aria-hidden', (!isExpanded).toString());
      }
    }
  }

  // Enhanced keyboard navigation
  navigateToItem(direction) {
    try {
      const enabledItems = this.items.filter(item => !item.disabled);
      if (enabledItems.length === 0) return;

      let newIndex;

      switch (direction) {
        case 'first':
          newIndex = 0;
          break;
        case 'last':
          newIndex = enabledItems.length - 1;
          break;
        case 1: // Down
          newIndex = Math.min(
            this.focusedItemIndex + 1,
            enabledItems.length - 1
          );
          break;
        case -1: // Up
          newIndex = Math.max(this.focusedItemIndex - 1, 0);
          break;
        default:
          return;
      }

      this.focusedItemIndex = newIndex;
      this.updateFocusedItem();
    } catch (error) {
      this.errorHandler.handle(error, 'navigation');
    }
  }

  updateFocusedItem() {
    const enabledItems = this.items.filter(item => !item.disabled);
    const focusedItem = enabledItems[this.focusedItemIndex];

    if (focusedItem) {
      this.announceChange(`Focused on ${focusedItem.title}`);
      this.emit('itemFocused', { item: focusedItem });
    }
  }

  toggleFocusedItem() {
    const enabledItems = this.items.filter(item => !item.disabled);
    const focusedItem = enabledItems[this.focusedItemIndex];

    if (focusedItem) {
      this.toggleItem(focusedItem.id);
    }
  }

  prefersReducedMotion() {
    return (
      window.matchMedia &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches
    );
  }

  announceChange(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // Enhanced calculations with validation
  getItemHeight(item) {
    try {
      const isExpanded = this.expandedItems.has(item.id);
      const animation = this.animatingItems.get(item.id);

      if (!animation) {
        return isExpanded ? this.getContentHeight(item) : 0;
      }

      const elapsed = performance.now() - animation.startTime;
      const progress = Math.min(elapsed / animation.duration, 1);
      const contentHeight = this.getContentHeight(item);
      const easedProgress = this.easeInOut(progress);

      if (animation.type === 'expand') {
        return contentHeight * easedProgress;
      } else {
        return contentHeight * (1 - easedProgress);
      }
    } catch (error) {
      this.errorHandler.handle(error, 'height-calculation');
      return 0;
    }
  }

  getContentHeight(item) {
    // Enhanced content height calculation
    if (!item.content) return 0;

    const baseHeight = 16;
    const padding = 24;
    const lines = item.content.split('\n');

    // Calculate wrapped lines for better height estimation
    let totalLines = 0;
    const maxWidth = this.width - INPUT_UTILITY_CONSTANTS.ACCORDION_PADDING;

    // Create temporary canvas for text measurement
    const tempCanvas = new OffscreenCanvas(1, 1);
    const tempCtx = tempCanvas.getContext('2d');
    tempCtx.font = '12px Arial';

    lines.forEach(line => {
      const wrappedLines = this.wrapText(tempCtx, line, maxWidth);
      totalLines += wrappedLines.length;
    });

    const estimatedHeight = totalLines * baseHeight + padding;

    return Math.max(
      INPUT_UTILITY_CONSTANTS.ACCORDION_MIN_HEIGHT,
      estimatedHeight
    );
  }

  // Enhanced keyboard navigation
  handleKeyDown(event) {
    if (this.disabled) return;

    try {
      const handler = this.keyboardHandler[event.key];
      if (handler) {
        event.preventDefault();
        handler();
      }
    } catch (error) {
      this.errorHandler.handle(error, 'keyboard-navigation');
    }
  }

  handleFocusIn() {
    this.isFocused = true;
    this.focusedItemIndex =
      this.focusedItemIndex >= 0 ? this.focusedItemIndex : 0;
    this.updateFocusedItem();
  }

  handleFocusOut() {
    this.isFocused = false;
    this.focusedItemIndex = -1;
  }

  // Public API with enhanced error handling
  async expandAll() {
    try {
      if (this.allowMultiple) {
        const promises = this.items
          .filter(item => !item.disabled)
          .map(item => this.expandItem(item.id));

        await Promise.all(promises);
        this.emit('allExpanded');
      }
    } catch (error) {
      this.errorHandler.handle(error, 'expand-all');
    }
  }

  async collapseAll() {
    try {
      const promises = Array.from(this.expandedItems).map(itemId =>
        this.collapseItem(itemId)
      );

      await Promise.all(promises);
      this.emit('allCollapsed');
    } catch (error) {
      this.errorHandler.handle(error, 'collapse-all');
    }
  }

  // Performance optimization methods
  clearRenderCache() {
    this.renderCache.clear();
  }

  throttle(func, limit) {
    let inThrottle;
    return function (...args) {
      if (!inThrottle) {
        func.apply(this, args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  }

  // Memory management and cleanup
  destroy() {
    try {
      // Cancel any active animations
      AnimationManager.cancelAnimation(this);

      // Clear animation state
      this.animatingItems.clear();

      // Clean up resize observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // Remove announcer from DOM
      if (this.announcer && this.announcer.parentNode) {
        this.announcer.parentNode.removeChild(this.announcer);
      }

      // Clear caches
      this.clearRenderCache();

      // Clear timers
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
      }

      // Call parent cleanup
      super.destroy?.();
      this.emit('destroyed');
    } catch (error) {
      ComponentDebug.error('Error during Accordion cleanup:', error);
    }
  }

  easeInOut(t) {
    return t < INPUT_UTILITY_CONSTANTS.EASE_IN_OUT_THRESHOLD
      ? INPUT_UTILITY_CONSTANTS.EASE_MULTIPLIER * t * t
      : -1 +
          (INPUT_UTILITY_CONSTANTS.EASE_IN_OUT_MULTIPLIER -
            INPUT_UTILITY_CONSTANTS.EASE_MULTIPLIER * t) *
            t;
  }

  getItemBounds(itemIndex) {
    let y = 0;

    for (let i = 0; i < itemIndex; i++) {
      y += this.headerHeight + this.getItemHeight(this.items[i]);
    }

    return {
      x: 0,
      y,
      width: this.width,
      headerHeight: this.headerHeight,
      contentHeight: this.getItemHeight(this.items[itemIndex]),
    };
  }

  getItemFromPosition(y) {
    let currentY = 0;

    for (let i = 0; i < this.items.length; i++) {
      const itemHeight = this.headerHeight + this.getItemHeight(this.items[i]);

      if (y >= currentY && y < currentY + itemHeight) {
        const isInHeader = y < currentY + this.headerHeight;
        return { item: this.items[i], index: i, isInHeader };
      }

      currentY += itemHeight;
    }

    return null;
  }

  // Event Handlers
  handleClick(event) {
    const { localY } = event;
    const result = this.getItemFromPosition(localY);

    if (result && result.isInHeader) {
      this.toggleItem(result.item.id);
    }
  }

  // Rendering
  renderSelf(renderer) {
    if (renderer.type !== 'canvas') return;

    this.items.forEach((item, index) => {
      const bounds = this.getItemBounds(index);
      const isExpanded = this.expandedItems.has(item.id);

      // Render header
      this.renderItemHeader(renderer, item, bounds, isExpanded);

      // Render content if expanded
      if (isExpanded || this.animatingItems.has(item.id)) {
        this.renderItemContent(renderer, item, bounds);
      }
    });

    // Update animations
    this.updateAnimations();
  }

  renderItemHeader(renderer, item, bounds, isExpanded) {
    const backgroundColor = isExpanded
      ? ComponentTheme.getColor('primaryHover', this.theme)
      : ComponentTheme.getColor('background', this.theme);

    // Header background
    renderer.fillStyle = backgroundColor;
    renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);

    // Header border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);

    // Focus indicator for keyboard navigation
    if (
      this.focusedItemIndex >= 0 &&
      this.items[this.focusedItemIndex] === item
    ) {
      renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
      renderer.lineWidth = 2;
      renderer.setLineDash([2, 2]);
      renderer.strokeRect(
        bounds.x + INPUT_UTILITY_CONSTANTS.ACCORDION_STROKE_OFFSET,
        bounds.y + INPUT_UTILITY_CONSTANTS.ACCORDION_STROKE_OFFSET,
        bounds.width - INPUT_UTILITY_CONSTANTS.ACCORDION_STROKE_BORDER,
        bounds.headerHeight - INPUT_UTILITY_CONSTANTS.ACCORDION_STROKE_BORDER
      );
      renderer.setLineDash([]);
    }

    // Expand/collapse icon
    const iconX = bounds.x + INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_MARGIN;
    const iconY = bounds.y + bounds.headerHeight / 2;

    renderer.fillStyle = item.disabled
      ? ComponentTheme.getColor('disabled', this.theme)
      : ComponentTheme.getColor('textSecondary', this.theme);
    renderer.font = '12px Arial';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText(isExpanded ? '▼' : '▶', iconX, iconY);

    // Item icon
    let textX = iconX + INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_SIZE;
    if (item.icon) {
      renderer.fillStyle = item.disabled
        ? ComponentTheme.getColor('disabled', this.theme)
        : ComponentTheme.getColor('primary', this.theme);
      renderer.fillText(item.icon, textX, iconY);
      textX += INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_SIZE;
    }

    // Title
    renderer.fillStyle = item.disabled
      ? ComponentTheme.getColor('disabled', this.theme)
      : ComponentTheme.getColor('text', this.theme);
    renderer.font = isExpanded ? 'bold 13px Arial' : '13px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';

    // Truncate title if too long
    const maxTitleWidth =
      bounds.width - textX - INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_MARGIN;
    const truncatedTitle = this.truncateText(
      renderer,
      item.title,
      maxTitleWidth
    );
    renderer.fillText(truncatedTitle, textX, iconY);

    // Disabled overlay
    if (item.disabled) {
      renderer.fillStyle = 'rgba(255, 255, 255, 0.6)';
      renderer.fillRect(bounds.x, bounds.y, bounds.width, bounds.headerHeight);
    }
  }

  truncateText(renderer, text, maxWidth) {
    const metrics = renderer.measureText(text);
    if (metrics.width <= maxWidth) {
      return text;
    }

    const ellipsis = '...';

    let truncated = text;
    while (
      renderer.measureText(truncated + ellipsis).width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }

    return truncated + ellipsis;
  }

  renderItemContent(renderer, item, bounds) {
    const contentY = bounds.y + bounds.headerHeight;
    const { contentHeight } = bounds;

    if (contentHeight <= 0) return;

    // Content background with theme support
    renderer.fillStyle = ComponentTheme.getColor(
      'backgroundSecondary',
      this.theme
    );
    renderer.fillRect(bounds.x, contentY, bounds.width, contentHeight);

    // Content border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(bounds.x, contentY, bounds.width, contentHeight);

    // Content text with theme support
    renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
    renderer.font = '12px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'top';

    const lines = item.content.split('\n');
    const maxWidth = bounds.width - INPUT_UTILITY_CONSTANTS.ACCORDION_PADDING; // Account for padding

    lines.forEach((line, lineIndex) => {
      const wrappedLines = this.wrapText(renderer, line, maxWidth);
      wrappedLines.forEach((wrappedLine, wrapIndex) => {
        const totalLineIndex = lineIndex + wrapIndex;
        renderer.fillText(
          wrappedLine,
          bounds.x + INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_MARGIN,
          contentY +
            INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_MARGIN +
            totalLineIndex * INPUT_UTILITY_CONSTANTS.ACCORDION_LINE_HEIGHT
        );
      });
    });
  }

  wrapText(renderer, text, maxWidth) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine + (currentLine ? ' ' : '') + word;
      const metrics = renderer.measureText(testLine);

      if (metrics.width > maxWidth && currentLine) {
        lines.push(currentLine);
        currentLine = word;
      } else {
        currentLine = testLine;
      }
    }

    if (currentLine) {
      lines.push(currentLine);
    }

    return lines.length ? lines : [''];
  }

  updateAnimations() {
    const now = Date.now();
    const toRemove = [];

    for (const [itemId, animation] of this.animatingItems) {
      const elapsed = now - animation.startTime;

      if (elapsed >= animation.duration) {
        toRemove.push(itemId);
      }
    }

    toRemove.forEach(itemId => {
      this.animatingItems.delete(itemId);
    });

    if (this.animatingItems.size > 0) {
      // Continue animation
      requestAnimationFrame(() => this.updateAnimations());
    }
  }

  // Public API
  addItem(item, index = -1) {
    const newItem = {
      id: item.id || `item-${Date.now()}`,
      title: item.title || 'New Item',
      content: item.content || '',
      icon: item.icon || null,
      disabled: item.disabled || false,
      ...item,
    };

    if (index >= 0 && index < this.items.length) {
      this.items.splice(index, 0, newItem);
    } else {
      this.items.push(newItem);
    }

    this.emit('itemAdded', { item: newItem, index });
  }

  removeItem(itemId) {
    const index = this.items.findIndex(item => item.id === itemId);
    if (index >= 0) {
      const removedItem = this.items.splice(index, 1)[0];
      this.expandedItems.delete(itemId);
      this.animatingItems.delete(itemId);
      this.emit('itemRemoved', { item: removedItem, index });
    }
  }

  updateItem(itemId, updates) {
    const item = this.items.find(i => i.id === itemId);
    if (item) {
      Object.assign(item, updates);
      this.emit('itemUpdated', { itemId, item, updates });
    }
  }

  reset() {
    this.expandedItems.clear();
    this.animatingItems.clear();
    this.focusedItemIndex = -1;
    this.clearRenderCache();
    this.emit('reset');
  }
}

export { Accordion };
