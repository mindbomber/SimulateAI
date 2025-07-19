import { BaseObject } from '../../objects/enhanced-objects.js';
import { logger } from '../../utils/logger.js';
import {
  INPUT_UTILITY_CONSTANTS,
  PERFORMANCE_THRESHOLDS,
} from './constants.js';
import { ComponentTheme } from './theme.js';

// Local utility classes to prevent circular dependencies
class ComponentError extends Error {
  constructor(message, component, details = {}) {
    super(message);
    this.name = 'ComponentError';
    this.component = component;
    this.details = details;
    this.timestamp = new Date().toISOString();
  }
}

class PerformanceMonitor {
  static instances = new Map();

  constructor(name) {
    this.name = name;
    this.measurements = new Map();
    this.startTimes = new Map();
  }

  static createInstance(name) {
    if (!this.instances.has(name)) {
      this.instances.set(name, new PerformanceMonitor(name));
    }
    return this.instances.get(name);
  }

  startMeasurement(key) {
    this.startTimes.set(key, performance.now());
  }

  endMeasurement(key) {
    const startTime = this.startTimes.get(key);
    if (startTime) {
      const duration = performance.now() - startTime;
      this.measurements.set(key, duration);
      this.startTimes.delete(key);
      return duration;
    }
    return 0;
  }

  getMeasurement(key) {
    return this.measurements.get(key) || 0;
  }
}

/**
 * SearchBox - Interactive search input with autocomplete and suggestions
 *
 * Features:
 * - Real-time search with debouncing
 * - Autocomplete suggestions with filtering
 * - Search history tracking
 * - Keyboard navigation
 * - Accessibility support
 * - Theme integration
 *
 * @extends BaseObject
 */
export class SearchBox extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || INPUT_UTILITY_CONSTANTS.SEARCHBOX_DEFAULT_WIDTH,
      height:
        options.height || INPUT_UTILITY_CONSTANTS.SEARCHBOX_DEFAULT_HEIGHT,
      ariaRole: 'searchbox',
      ariaLabel: options.ariaLabel || 'Search',
    });

    // Validate options
    this.validateOptions(options);

    // Core properties
    this.value = options.value || '';
    this.placeholder = options.placeholder || 'Search...';
    this.disabled = options.disabled || false;
    this.showClearButton = options.showClearButton !== false;
    this.showSearchButton = options.showSearchButton !== false;
    this.debounceDelay =
      options.debounceDelay || INPUT_UTILITY_CONSTANTS.SEARCHBOX_DEBOUNCE_DELAY;

    // Search behavior
    this.searchOnType = options.searchOnType !== false;
    this.minSearchLength = options.minSearchLength || 1;
    this.suggestions = options.suggestions || [];
    this.showSuggestions = options.showSuggestions !== false;
    this.maxSuggestions =
      options.maxSuggestions ||
      INPUT_UTILITY_CONSTANTS.SEARCHBOX_MAX_SUGGESTIONS;
    this.caseSensitive = options.caseSensitive || false;
    this.highlightMatches = options.highlightMatches !== false;

    // Theme integration
    this.theme = options.theme || ComponentTheme.getCurrentTheme();

    // State management
    this.isFocused = false;
    this.showingSuggestions = false;
    this.filteredSuggestions = [];
    this.selectedSuggestionIndex = -1;
    this.debounceTimer = null;
    this.searchHistory = [];
    this.maxHistoryLength = options.maxHistoryLength || 10;

    // Animation and performance
    this.animationState = { suggestionProgress: 0 };
    this.renderCache = new Map();
    this.throttledRender = this.throttle(
      this.render.bind(this),
      PERFORMANCE_THRESHOLDS.eventThrottle
    );

    // Accessibility
    this.announcer = this.createScreenReaderAnnouncer();
    this.keyboardHandler = this.createKeyboardHandler();

    // Error handling
    this.errorHandler = this.createErrorHandler();

    // Performance monitoring
    this.performanceMonitor = PerformanceMonitor.createInstance('SearchBox');

    try {
      this.setupEventHandlers();
      this.setupAccessibility();
      this.setupResizeObserver();
    } catch (error) {
      this.errorHandler.handle(error, 'constructor');
    }
  }

  validateOptions(options) {
    if (
      options.debounceDelay &&
      (typeof options.debounceDelay !== 'number' || options.debounceDelay < 0)
    ) {
      throw new ComponentError(
        'Debounce delay must be a positive number',
        'SearchBox'
      );
    }

    if (
      options.minSearchLength &&
      (typeof options.minSearchLength !== 'number' ||
        options.minSearchLength < 0)
    ) {
      throw new ComponentError(
        'Minimum search length must be a positive number',
        'SearchBox'
      );
    }

    if (
      options.maxSuggestions &&
      (typeof options.maxSuggestions !== 'number' || options.maxSuggestions < 1)
    ) {
      throw new ComponentError(
        'Maximum suggestions must be a positive number',
        'SearchBox'
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
      Enter: () => this.handleEnterKey(),
      Escape: () => this.handleEscapeKey(),
      ArrowDown: () => this.navigateSuggestions(1),
      ArrowUp: () => this.navigateSuggestions(-1),
      Tab: event => this.handleTabKey(event),
      Backspace: () => this.handleBackspace(),
      Delete: () => this.handleDelete(),
    };
  }

  createErrorHandler() {
    return {
      handle: (error, context) => {
        const componentError = new ComponentError(
          error.message || 'Unknown error',
          'SearchBox',
          { context, originalError: error }
        );

        logger.error('SearchBox Error:', componentError);
        this.emit('error', componentError);

        this.recoverFromError(context);
      },
    };
  }

  recoverFromError(context) {
    switch (context) {
      case 'search':
        this.clearSuggestions();
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
    this.setAttribute('role', 'searchbox');
    this.setAttribute('aria-autocomplete', 'list');
    this.setAttribute('aria-expanded', 'false');
    this.setAttribute('aria-haspopup', 'listbox');

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

  setupEventHandlers() {
    const eventHandlers = {
      click: this.handleClick.bind(this),
      keyDown: this.handleKeyDown.bind(this),
      keyUp: this.handleKeyUp.bind(this),
      focus: this.handleFocus.bind(this),
      blur: this.handleBlur.bind(this),
    };

    Object.entries(eventHandlers).forEach(([event, handler]) => {
      this.on(event, handler);
    });
  }

  // Enhanced search functionality
  async setValue(value) {
    try {
      const oldValue = this.value;
      this.value = String(value || '');

      if (oldValue !== this.value) {
        this.clearRenderCache();
        this.updateSuggestions();
        this.emit('valueChanged', { value: this.value, oldValue });

        if (this.searchOnType) {
          this.debouncedSearch();
        }
      }
    } catch (error) {
      this.errorHandler.handle(error, 'setValue');
    }
  }

  updateSuggestions() {
    try {
      if (!this.showSuggestions || this.value.length < this.minSearchLength) {
        this.clearSuggestions();
        return;
      }

      const query = this.caseSensitive ? this.value : this.value.toLowerCase();

      // Filter suggestions based on current value
      this.filteredSuggestions = this.suggestions
        .filter(suggestion => {
          const suggestionText = this.caseSensitive
            ? suggestion
            : suggestion.toLowerCase();
          return suggestionText.includes(query);
        })
        .slice(0, this.maxSuggestions);

      // Add search history if enabled
      if (this.searchHistory.length > 0 && query.length > 0) {
        const historyMatches = this.searchHistory
          .filter(item => {
            const itemText = this.caseSensitive ? item : item.toLowerCase();
            return (
              itemText.includes(query) &&
              !this.filteredSuggestions.includes(item)
            );
          })
          .slice(
            0,
            Math.max(0, this.maxSuggestions - this.filteredSuggestions.length)
          );

        this.filteredSuggestions = [
          ...this.filteredSuggestions,
          ...historyMatches,
        ];
      }

      this.showingSuggestions = this.filteredSuggestions.length > 0;
      this.selectedSuggestionIndex = -1;

      // Update ARIA attributes
      this.setAttribute('aria-expanded', this.showingSuggestions.toString());

      if (this.showingSuggestions) {
        this.announceChange(
          `${this.filteredSuggestions.length} suggestions available`
        );
      }
    } catch (error) {
      this.errorHandler.handle(error, 'updateSuggestions');
    }
  }

  clearSuggestions() {
    this.filteredSuggestions = [];
    this.showingSuggestions = false;
    this.selectedSuggestionIndex = -1;
    this.setAttribute('aria-expanded', 'false');
  }

  debouncedSearch() {
    clearTimeout(this.debounceTimer);
    this.debounceTimer = setTimeout(() => {
      this.performSearch();
    }, this.debounceDelay);
  }

  async performSearch() {
    try {
      if (this.value.length >= this.minSearchLength) {
        // Add to search history
        this.addToHistory(this.value);

        this.emit('search', {
          query: this.value,
          timestamp: new Date().toISOString(),
        });
      }
    } catch (error) {
      this.errorHandler.handle(error, 'performSearch');
    }
  }

  addToHistory(query) {
    if (!query || this.searchHistory.includes(query)) return;

    this.searchHistory.unshift(query);
    if (this.searchHistory.length > this.maxHistoryLength) {
      this.searchHistory = this.searchHistory.slice(0, this.maxHistoryLength);
    }

    this.emit('historyUpdated', { history: this.searchHistory });
  }

  selectSuggestion(index) {
    try {
      if (index >= 0 && index < this.filteredSuggestions.length) {
        const selectedValue = this.filteredSuggestions[index];
        this.setValue(selectedValue);
        this.clearSuggestions();
        this.performSearch();

        this.announceChange(`Selected: ${selectedValue}`);
        this.emit('suggestionSelected', { value: selectedValue, index });
      }
    } catch (error) {
      this.errorHandler.handle(error, 'selectSuggestion');
    }
  }

  navigateSuggestions(direction) {
    if (!this.showingSuggestions || this.filteredSuggestions.length === 0)
      return;

    const maxIndex = this.filteredSuggestions.length - 1;
    let newIndex = this.selectedSuggestionIndex + direction;

    // Wrap around navigation
    if (newIndex < -1) {
      newIndex = maxIndex;
    } else if (newIndex > maxIndex) {
      newIndex = -1;
    }

    this.selectedSuggestionIndex = newIndex;

    // Announce current selection
    if (newIndex >= 0) {
      const suggestion = this.filteredSuggestions[newIndex];
      this.announceChange(
        `${newIndex + 1} of ${this.filteredSuggestions.length}: ${suggestion}`
      );
    } else {
      this.announceChange('Back to search input');
    }

    this.clearRenderCache();
  }

  clear() {
    this.setValue('');
    this.clearSuggestions();
    this.emit('cleared');
  }

  announceChange(message) {
    if (this.announcer) {
      this.announcer.textContent = message;
    }
  }

  // Enhanced event handlers with accessibility
  handleClick(event) {
    if (this.disabled) return;

    try {
      const { localX, localY } = event;

      // Clear button
      if (
        this.showClearButton &&
        this.value &&
        localX >=
          this.width - INPUT_UTILITY_CONSTANTS.SEARCHBOX_CLEAR_BUTTON_WIDTH &&
        localX <
          this.width - INPUT_UTILITY_CONSTANTS.SEARCHBOX_CLEAR_BUTTON_OFFSET
      ) {
        this.clear();
        return;
      }

      // Search button
      if (
        this.showSearchButton &&
        localX >=
          this.width - INPUT_UTILITY_CONSTANTS.SEARCHBOX_SEARCH_BUTTON_WIDTH
      ) {
        this.performSearch();
        return;
      }

      // Suggestion selection
      if (this.showingSuggestions && localY > this.height) {
        const suggestionIndex = Math.floor(
          (localY - this.height) /
            INPUT_UTILITY_CONSTANTS.SEARCHBOX_SUGGESTION_HEIGHT
        );
        if (
          suggestionIndex >= 0 &&
          suggestionIndex < this.filteredSuggestions.length
        ) {
          this.selectSuggestion(suggestionIndex);
        }
        return;
      }

      // Focus the input
      this.focus();
    } catch (error) {
      this.errorHandler.handle(error, 'click-handler');
    }
  }

  handleKeyDown(event) {
    if (this.disabled) return;

    try {
      const handler = this.keyboardHandler[event.key];
      if (handler) {
        event.preventDefault();
        handler(event);
      }
    } catch (error) {
      this.errorHandler.handle(error, 'keyboard-handler');
    }
  }

  handleKeyUp(event) {
    if (this.disabled) return;

    try {
      // Handle regular character input
      if (
        event.key.length === 1 &&
        !event.ctrlKey &&
        !event.altKey &&
        !event.metaKey
      ) {
        this.setValue(this.value + event.key);
      }
    } catch (error) {
      this.errorHandler.handle(error, 'keyup-handler');
    }
  }

  handleEnterKey() {
    if (this.selectedSuggestionIndex >= 0) {
      this.selectSuggestion(this.selectedSuggestionIndex);
    } else {
      this.performSearch();
    }
  }

  handleEscapeKey() {
    if (this.showingSuggestions) {
      this.clearSuggestions();
    } else {
      this.clear();
    }
  }

  handleTabKey(event) {
    if (this.showingSuggestions && this.selectedSuggestionIndex >= 0) {
      event.preventDefault();
      this.selectSuggestion(this.selectedSuggestionIndex);
    }
  }

  handleBackspace() {
    if (this.value.length > 0) {
      this.setValue(this.value.slice(0, -1));
    }
  }

  handleDelete() {
    // For now, same as backspace - could be enhanced for cursor position
    this.handleBackspace();
  }

  handleFocus() {
    this.isFocused = true;
    this.updateSuggestions();
    this.emit('focus');
  }

  handleBlur() {
    // Delay hiding suggestions to allow for clicks
    setTimeout(() => {
      this.isFocused = false;
      this.clearSuggestions();
      this.emit('blur');
    }, INPUT_UTILITY_CONSTANTS.SEARCHBOX_SUGGESTION_ANIMATION_DELAY);
  }

  handleFocusIn() {
    this.isFocused = true;
    this.clearRenderCache();
  }

  handleFocusOut() {
    this.isFocused = false;
    this.clearRenderCache();
  }

  // Enhanced rendering with theme support
  renderSelf(renderer) {
    if (renderer.type !== 'canvas') return;

    try {
      this.performanceMonitor.startMeasurement('render');

      this.renderInputField(renderer);

      if (this.showingSuggestions) {
        this.renderSuggestions(renderer);
      }

      this.performanceMonitor.endMeasurement('render');
    } catch (error) {
      this.errorHandler.handle(error, 'render');
    }
  }

  renderInputField(renderer) {
    // Background with theme support
    const bgColor = this.disabled
      ? ComponentTheme.getColor('backgroundDisabled', this.theme)
      : ComponentTheme.getColor('background', this.theme);

    renderer.fillStyle = bgColor;
    renderer.fillRect(0, 0, this.width, this.height);

    // Border with theme support and focus state
    const borderColor = this.isFocused
      ? ComponentTheme.getColor('focus', this.theme)
      : ComponentTheme.getColor('border', this.theme);

    renderer.strokeStyle = borderColor;
    renderer.lineWidth = this.isFocused ? 2 : 1;
    renderer.strokeRect(0, 0, this.width, this.height);

    // Search icon
    this.renderSearchIcon(renderer);

    // Text content
    this.renderTextContent(renderer);

    // Clear button
    if (this.showClearButton && this.value) {
      this.renderClearButton(renderer);
    }

    // Search button
    if (this.showSearchButton) {
      this.renderSearchButton(renderer);
    }

    // Focus indicator for screen readers
    if (this.isFocused) {
      this.renderFocusIndicator(renderer);
    }

    // Cursor
    if (this.isFocused && !this.showingSuggestions) {
      this.renderCursor(renderer);
    }
  }

  renderSearchIcon(renderer) {
    const iconX = 12;
    const iconY = this.height / 2;

    renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
    renderer.font = '16px Arial';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText('🔍', iconX, iconY);
  }

  renderTextContent(renderer) {
    const displayText = this.value || this.placeholder;
    const isPlaceholder = !this.value;
    const textColor = this.disabled
      ? ComponentTheme.getColor('disabled', this.theme)
      : isPlaceholder
        ? ComponentTheme.getColor('textSecondary', this.theme)
        : ComponentTheme.getColor('text', this.theme);

    renderer.fillStyle = textColor;
    renderer.font = isPlaceholder ? 'italic 14px Arial' : '14px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';

    const textX = 30; // Account for search icon
    const maxTextWidth =
      this.width - INPUT_UTILITY_CONSTANTS.SEARCHBOX_BUTTON_SPACING; // Account for buttons and padding
    const truncatedText = this.truncateText(
      renderer,
      displayText,
      maxTextWidth
    );

    renderer.fillText(truncatedText, textX, this.height / 2);
  }

  renderClearButton(renderer) {
    const buttonX =
      this.width - INPUT_UTILITY_CONSTANTS.SEARCHBOX_BUTTON_POSITION;
    const buttonY = this.height / 2;
    const buttonRadius = 8;

    // Button background (hover effect)
    if (this.isClearButtonHovered) {
      renderer.fillStyle = ComponentTheme.getColor('dangerHover', this.theme);
      renderer.beginPath();
      renderer.arc(buttonX, buttonY, buttonRadius, 0, Math.PI * 2);
      renderer.fill();
    }

    // Clear icon
    renderer.fillStyle = ComponentTheme.getColor('textSecondary', this.theme);
    renderer.font = '14px Arial';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText('×', buttonX, buttonY);
  }

  renderSearchButton(renderer) {
    const buttonWidth = 35;
    const buttonHeight =
      this.height - INPUT_UTILITY_CONSTANTS.SEARCHBOX_BUTTON_HEIGHT_OFFSET;
    const buttonX = this.width - buttonWidth - 2;
    const buttonY = 2;

    // Button background
    renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
    renderer.fillRect(buttonX, buttonY, buttonWidth, buttonHeight);

    // Button text
    renderer.fillStyle = ComponentTheme.getColor('primaryText', this.theme);
    renderer.font = '12px Arial';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText(
      'Go',
      buttonX + buttonWidth / 2,
      buttonY + buttonHeight / 2
    );

    // Button border
    renderer.strokeStyle = ComponentTheme.getColor('primaryBorder', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(buttonX, buttonY, buttonWidth, buttonHeight);
  }

  renderFocusIndicator(renderer) {
    renderer.strokeStyle = ComponentTheme.getColor('focus', this.theme);
    renderer.lineWidth = 2;
    renderer.setLineDash([2, 2]);
    renderer.strokeRect(
      INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_OFFSET,
      INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_OFFSET,
      this.width - INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_BORDER,
      this.height - INPUT_UTILITY_CONSTANTS.FOCUS_INDICATOR_BORDER
    );
    renderer.setLineDash([]);
  }

  renderCursor(renderer) {
    const textWidth = renderer.measureText(this.value).width;
    const cursorX =
      INPUT_UTILITY_CONSTANTS.SEARCHBOX_SEARCH_ICON_OFFSET + textWidth; // Account for search icon

    // Animated cursor
    const time = Date.now();
    const opacity =
      Math.sin(
        time * INPUT_UTILITY_CONSTANTS.SEARCHBOX_CURSOR_BLINK_FREQUENCY
      ) *
        INPUT_UTILITY_CONSTANTS.SEARCHBOX_CURSOR_OPACITY_FACTOR +
      INPUT_UTILITY_CONSTANTS.SEARCHBOX_CURSOR_OPACITY_BASE;

    renderer.strokeStyle = `rgba(${this.theme === 'dark' ? '255,255,255' : '0,0,0'}, ${opacity})`;
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(cursorX, INPUT_UTILITY_CONSTANTS.SEARCHBOX_CURSOR_MARGIN);
    renderer.lineTo(
      cursorX,
      this.height - INPUT_UTILITY_CONSTANTS.SEARCHBOX_CURSOR_MARGIN
    );
    renderer.stroke();
  }

  renderSuggestions(renderer) {
    const startY = this.height;
    const suggestionHeight = 30;
    const totalHeight = this.filteredSuggestions.length * suggestionHeight;

    // Suggestions container background
    renderer.fillStyle = ComponentTheme.getColor('background', this.theme);
    renderer.fillRect(0, startY, this.width, totalHeight);

    // Suggestions container border
    renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
    renderer.lineWidth = 1;
    renderer.strokeRect(0, startY, this.width, totalHeight);

    // Individual suggestions
    this.filteredSuggestions.forEach((suggestion, index) => {
      this.renderSuggestion(
        renderer,
        suggestion,
        index,
        startY + index * suggestionHeight,
        suggestionHeight
      );
    });
  }

  renderSuggestion(renderer, suggestion, index, y, height) {
    const isSelected = index === this.selectedSuggestionIndex;

    // Highlight selected suggestion
    if (isSelected) {
      renderer.fillStyle = ComponentTheme.getColor('primaryHover', this.theme);
      renderer.fillRect(0, y, this.width, height);
    }

    // Suggestion text with highlighting
    if (this.highlightMatches && this.value) {
      this.renderHighlightedText(
        renderer,
        suggestion,
        this.value,
        INPUT_UTILITY_CONSTANTS.SEARCHBOX_SUGGESTION_ICON_OFFSET,
        y + height / 2
      );
    } else {
      renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
      renderer.font = '14px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';

      const maxWidth = this.width - INPUT_UTILITY_CONSTANTS.ACCORDION_PADDING;
      const truncatedSuggestion = this.truncateText(
        renderer,
        suggestion,
        maxWidth
      );
      renderer.fillText(
        truncatedSuggestion,
        INPUT_UTILITY_CONSTANTS.ACCORDION_ICON_MARGIN,
        y + height / 2
      );
    }

    // Selection indicator
    if (isSelected) {
      renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
      renderer.font = '12px Arial';
      renderer.textAlign = 'right';
      renderer.textBaseline = 'middle';
      renderer.fillText(
        '↩',
        this.width - INPUT_UTILITY_CONSTANTS.SEARCHBOX_SUGGESTION_ICON_OFFSET,
        y + height / 2
      );
    }

    // Separator line
    if (index < this.filteredSuggestions.length - 1) {
      renderer.strokeStyle = ComponentTheme.getColor('border', this.theme);
      renderer.lineWidth = 1;
      renderer.beginPath();
      renderer.moveTo(0, y + height);
      renderer.lineTo(this.width, y + height);
      renderer.stroke();
    }
  }

  renderHighlightedText(renderer, text, query, x, y) {
    const caseSensitiveText = this.caseSensitive ? text : text.toLowerCase();
    const caseSensitiveQuery = this.caseSensitive ? query : query.toLowerCase();
    const matchIndex = caseSensitiveText.indexOf(caseSensitiveQuery);

    renderer.font = '14px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';

    if (matchIndex === -1) {
      // No match, render normally
      renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
      renderer.fillText(text, x, y);
    } else {
      // Render with highlighting
      const beforeMatch = text.slice(0, matchIndex);
      const match = text.slice(matchIndex, matchIndex + query.length);
      const afterMatch = text.slice(matchIndex + query.length);

      let currentX = x;

      // Before match
      if (beforeMatch) {
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.fillText(beforeMatch, currentX, y);
        currentX += renderer.measureText(beforeMatch).width;
      }

      // Highlighted match
      if (match) {
        renderer.fillStyle = ComponentTheme.getColor('primaryText', this.theme);
        const matchWidth = renderer.measureText(match).width;

        // Highlight background
        renderer.fillStyle = ComponentTheme.getColor('primary', this.theme);
        renderer.fillRect(
          currentX,
          y - INPUT_UTILITY_CONSTANTS.SEARCHBOX_HIGHLIGHT_Y_OFFSET,
          matchWidth,
          INPUT_UTILITY_CONSTANTS.SEARCHBOX_HIGHLIGHT_HEIGHT
        );

        // Match text
        renderer.fillStyle = ComponentTheme.getColor('primaryText', this.theme);
        renderer.fillText(match, currentX, y);
        currentX += matchWidth;
      }

      // After match
      if (afterMatch) {
        renderer.fillStyle = ComponentTheme.getColor('text', this.theme);
        renderer.fillText(afterMatch, currentX, y);
      }
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

  // Public API with enhanced error handling
  getSuggestions() {
    return [...this.suggestions];
  }

  setSuggestions(suggestions) {
    if (!Array.isArray(suggestions)) {
      throw new ComponentError('Suggestions must be an array', 'SearchBox');
    }

    this.suggestions = suggestions.map(s => String(s));
    this.updateSuggestions();
    this.emit('suggestionsChanged', { suggestions: this.suggestions });
  }

  addSuggestion(suggestion) {
    const suggestionStr = String(suggestion);
    if (!this.suggestions.includes(suggestionStr)) {
      this.suggestions.push(suggestionStr);
      this.updateSuggestions();
      this.emit('suggestionAdded', { suggestion: suggestionStr });
    }
  }

  removeSuggestion(suggestion) {
    const index = this.suggestions.indexOf(suggestion);
    if (index >= 0) {
      this.suggestions.splice(index, 1);
      this.updateSuggestions();
      this.emit('suggestionRemoved', { suggestion, index });
    }
  }

  getSearchHistory() {
    return [...this.searchHistory];
  }

  clearSearchHistory() {
    this.searchHistory = [];
    this.emit('historyCleared');
  }

  setPlaceholder(placeholder) {
    this.placeholder = String(placeholder || '');
    this.clearRenderCache();
    this.emit('placeholderChanged', { placeholder: this.placeholder });
  }

  enable() {
    this.disabled = false;
    this.setAttribute('tabindex', '0');
    this.clearRenderCache();
    this.emit('enabled');
  }

  disable() {
    this.disabled = true;
    this.setAttribute('tabindex', '-1');
    this.clearSuggestions();
    this.clearRenderCache();
    this.emit('disabled');
  }

  reset() {
    this.value = '';
    this.clearSuggestions();
    this.clearSearchHistory();
    this.selectedSuggestionIndex = -1;
    this.clearRenderCache();
    this.emit('reset');
  }

  // Cleanup and memory management
  destroy() {
    try {
      // Cancel any pending searches
      if (this.debounceTimer) {
        clearTimeout(this.debounceTimer);
        this.debounceTimer = null;
      }

      // Clean up resize observer
      if (this.resizeObserver) {
        this.resizeObserver.disconnect();
        this.resizeObserver = null;
      }

      // Remove announcer from DOM
      if (this.announcer && this.announcer.parentNode) {
        this.announcer.parentNode.removeChild(this.announcer);
      }

      // Clear caches and state
      this.clearRenderCache();
      this.clearSuggestions();
      this.clearSearchHistory();

      // Call parent cleanup
      super.destroy?.();
      this.emit('destroyed');
    } catch (error) {
      logger.error('Error during SearchBox cleanup:', error);
    }
  }
}
