/**
 * Advanced UI Components - Specialized interactive components for SimulateAI
 * Modern, accessible, and performant UI components
 *
 * @version 2.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import {
  BaseObject,
  clamp,
  validateNumber,
  validateString,
  FOCUS_RING_WIDTH,
} from './enhanced-objects.js';
import logger from '../utils/logger.js';

// Constants to avoid magic numbers
const COMPONENT_CONSTANTS = {
  // Modal defaults
  DEFAULT_MODAL_WIDTH: 400,
  DEFAULT_MODAL_HEIGHT: 300,
  MODAL_SHADOW_OFFSET: 4,
  MODAL_CLOSE_BUTTON_SIZE: 24,
  MODAL_CLOSE_BUTTON_PADDING: 6,

  // Button defaults
  DEFAULT_BUTTON_WIDTH: 100,
  DEFAULT_BUTTON_HEIGHT: 36,
  CLOSE_BUTTON_X_PADDING: 6,

  // Navigation menu defaults
  DEFAULT_NAV_WIDTH: 250,
  DEFAULT_NAV_HEIGHT: 400,
  ANIMATION_STAGGER_OFFSET: 50,

  // Text and layout
  DEFAULT_LINE_HEIGHT: 20,
  ICON_WIDTH: 25,
  BADGE_WIDTH: 30,
  BADGE_MIN_WIDTH: 20,
  BADGE_CHAR_WIDTH: 8,
  BADGE_PADDING: 5,
  BADGE_HEIGHT: 16,
  SUBMENU_INDICATOR_SIZE: 15,
  SUBMENU_ARROW_SIZE: 6,

  // Animation values
  SELECTION_SCALE: 1.05,
  FOCUS_SCALE: 1.02,
  ANIMATION_FAST: 100,
  ANIMATION_NORMAL: 150,
  PERFORMANCE_THRESHOLD: 16, // 1 frame at 60fps

  // Color calculations
  RANDOM_BASE: 36,
  RANDOM_LENGTH: 9,
  COLOR_SUBSTR_START: 4,
  COLOR_SUBSTR_LENGTH: 2,
  RGB_MAX: 255,
  LUMINANCE_THRESHOLD: 0.5,
  LUMINANCE_RED: 0.299,
  LUMINANCE_GREEN: 0.587,
  LUMINANCE_BLUE: 0.114,

  // Chart defaults
  DEFAULT_CHART_WIDTH: 400,
  DEFAULT_CHART_HEIGHT: 300,
  CHART_PADDING_RATIO: 0.1,
  CHART_RADIUS_MARGIN: 20,
  CHART_LEGEND_WIDTH: 150,
  CHART_SUBTITLE_Y: 35,
  CHART_POINT_RADIUS: 4,
  CHART_OPACITY: 0.3,
  CHART_BAR_WIDTH_RATIO: 0.8,
  CHART_LABEL_RADIUS_RATIO: 0.7,
  CHART_SCATTER_POINT_RADIUS: 5,
  CHART_LEGEND_ITEM_HEIGHT: 20,
  CHART_LEGEND_INDICATOR_SIZE: 15,
  CHART_LEGEND_INDICATOR_HEIGHT: 10,
  CHART_LEGEND_TEXT_OFFSET: 35,
  CHART_TOOLTIP_HEIGHT: 20,
  CHART_TOOLTIP_RADIUS: 4,

  // Form defaults
  DEFAULT_FORM_WIDTH: 200,
  DEFAULT_FORM_HEIGHT: 40,
  VALIDATION_DEBOUNCE_TIME: 300,
  FORM_LABEL_HEIGHT: 20,
  FORM_HELP_HEIGHT: 20,
  FORM_MESSAGE_Y_OFFSET: 15,
  FORM_COUNT_Y_OFFSET: 30,
  FORM_CURSOR_OFFSET: 4,
  CHECKBOX_SIZE: 18,
  CHECKBOX_CHECK_MARGIN: 4,
  CHECKBOX_CHECK_OFFSET: 6,
  RADIO_CHECK_RADIUS_DIVISOR: 4,

  // Tooltip defaults
  TOOLTIP_SHOW_DELAY: 500,
  TOOLTIP_HIDE_DELAY: 200,
  TOOLTIP_MAX_WIDTH: 250,
  TOOLTIP_BASELINE_SIZE: 16,
  TOOLTIP_ANIMATION_IN: 200,
  TOOLTIP_ANIMATION_OUT: 150,
  TOOLTIP_SLIDE_OFFSET: 10,

  // Animation and alignment constants
  ALIGNMENT_CENTER_BASE: 50,
  ANIMATION_FADE_IN: 200,
  ANIMATION_SCALE_IN: 200,
  ANIMATION_SLIDE_IN: 200,
};

// Easing functions for animations
const EASING_FUNCTIONS = {
  EASE_OUT_CUBIC: 'easeOutCubic',
  EASE_OUT_QUAD: 'easeOutQuad',
  EASE_OUT_BACK: 'easeOutBack',
};

// Enhanced constants for UI components
const UI_CONSTANTS = {
  MODAL_Z_INDEX: 2000,
  TOOLTIP_Z_INDEX: 3000,
  DROPDOWN_Z_INDEX: 1500,
  ANIMATION_DURATION: {
    FAST: 150,
    NORMAL: 300,
    SLOW: 500,
  },
  COLORS: {
    PRIMARY: '#2196F3',
    SECONDARY: '#757575',
    SUCCESS: '#4CAF50',
    WARNING: '#FF9800',
    ERROR: '#F44336',
    WHITE: '#FFFFFF',
    BLACK: '#000000',
    GRAY_50: '#FAFAFA',
    GRAY_100: '#F5F5F5',
    GRAY_200: '#EEEEEE',
    GRAY_300: '#E0E0E0',
    GRAY_400: '#BDBDBD',
    GRAY_500: '#9E9E9E',
    GRAY_600: '#757575',
    GRAY_700: '#616161',
    GRAY_800: '#424242',
    GRAY_900: '#212121',
  },
  SPACING: {
    XS: 4,
    SM: 8,
    MD: 16,
    LG: 24,
    XL: 32,
    XXL: 48,
  },
  BORDER_RADIUS: {
    SM: 4,
    MD: 8,
    LG: 12,
    XL: 16,
  },
};

// Utility functions for UI components
const UIUtils = {
  /**
   * Debug-aware logging utility
   * @param {string} level - 'info', 'warn', 'error'
   * @param {string} message
   * @param {*} data
   */
  debugLog(level, message, data = null) {
    if (typeof window !== 'undefined' && window.DEBUG_MODE) {
      if (data) {
        logger[level](`[UI] ${message}:`, data);
      } else {
        logger[level](`[UI] ${message}`);
      }
    }
  },

  /**
   * Creates a unique ID for UI components
   * @param {string} prefix
   * @returns {string}
   */
  generateId(prefix = 'ui') {
    return `${prefix}_${Date.now()}_${Math.random().toString(COMPONENT_CONSTANTS.RANDOM_BASE).substr(2, COMPONENT_CONSTANTS.RANDOM_LENGTH)}`;
  },

  /**
   * Calculates optimal text color based on background
   * @param {string} backgroundColor
   * @returns {string}
   */
  getContrastColor(backgroundColor) {
    // Simple contrast calculation
    const color = backgroundColor.replace('#', '');
    const r = parseInt(color.substr(0, 2), 16);
    const g = parseInt(color.substr(2, 2), 16);
    const b = parseInt(
      color.substr(
        COMPONENT_CONSTANTS.COLOR_SUBSTR_START,
        COMPONENT_CONSTANTS.COLOR_SUBSTR_LENGTH
      ),
      16
    );
    const luminance =
      (COMPONENT_CONSTANTS.LUMINANCE_RED * r +
        COMPONENT_CONSTANTS.LUMINANCE_GREEN * g +
        COMPONENT_CONSTANTS.LUMINANCE_BLUE * b) /
      COMPONENT_CONSTANTS.RGB_MAX;
    return luminance > COMPONENT_CONSTANTS.LUMINANCE_THRESHOLD
      ? UI_CONSTANTS.COLORS.BLACK
      : UI_CONSTANTS.COLORS.WHITE;
  },

  /**
   * Measures text dimensions
   * @param {string} text
   * @param {string} font
   * @param {CanvasRenderingContext2D} renderer
   * @returns {Object}
   */
  measureText(text, font, renderer) {
    renderer.save();
    renderer.font = font;
    const metrics = renderer.measureText(text);
    renderer.restore();

    return {
      width: metrics.width,
      height: parseInt(font.match(/\d+/)[0]), // Extract font size as approximation
    };
  },

  /**
   * Wraps text to fit within specified width
   * @param {string} text
   * @param {number} maxWidth
   * @param {string} font
   * @param {CanvasRenderingContext2D} renderer
   * @returns {string[]}
   */
  wrapText(text, maxWidth, font, renderer) {
    renderer.save();
    renderer.font = font;

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

    renderer.restore();
    return lines;
  },
};

// ===== ENHANCED MODAL DIALOG SYSTEM =====
class ModalDialog extends BaseObject {
  /**
   * Creates a new modal dialog
   * @param {Object} options - Configuration options
   */
  constructor(options = {}) {
    super({
      ...options,
      width: validateNumber(
        options.width,
        COMPONENT_CONSTANTS.DEFAULT_MODAL_WIDTH
      ),
      height: validateNumber(
        options.height,
        COMPONENT_CONSTANTS.DEFAULT_MODAL_HEIGHT
      ),
      ariaRole: 'dialog',
      ariaModal: true,
      tabIndex: -1,
    });

    // Content properties
    this.title = validateString(options.title, 'Dialog');
    this.content = validateString(options.content);
    this.buttons = Array.isArray(options.buttons)
      ? options.buttons
      : [{ text: 'OK', action: 'close' }];

    // Behavior properties
    this.closable = options.closable !== false;
    this.backdrop = options.backdrop !== false;
    this.animation = validateString(options.animation, 'fade');
    this.autoFocus = options.autoFocus !== false;
    this.trapFocus = options.trapFocus !== false;
    this.closeOnEscape = options.closeOnEscape !== false;
    this.closeOnBackdrop = options.closeOnBackdrop !== false;

    // State management
    this.isOpen = false;
    this.isAnimating = false;
    this.previousFocus = null;
    this.firstFocusableElement = null;
    this.lastFocusableElement = null;

    // Visual properties
    this.zIndex = UI_CONSTANTS.MODAL_Z_INDEX;
    this.backdropColor = options.backdropColor || 'rgba(0, 0, 0, 0.5)';
    this.borderRadius = UI_CONSTANTS.BORDER_RADIUS.LG;
    this.padding = UI_CONSTANTS.SPACING.LG;

    // Layout sections
    this.headerHeight = 60;
    this.footerHeight = 60;
    this.bodyHeight = this.height - this.headerHeight - this.footerHeight;

    // Button management
    this.buttonElements = [];
    this.focusedButtonIndex = 0;

    this.setupModal();
  }

  /**
   * Initializes the modal component
   */
  setupModal() {
    // Set up accessibility attributes
    this.ariaLabel = this.title;
    this.ariaLabelledBy = `modal-title-${this.id}`;
    this.ariaDescribedBy = `modal-body-${this.id}`;

    // Set up event handlers
    this.setupEventHandlers();

    // Prepare button data
    this.prepareButtons();

    // Initially hide the modal
    this.alpha = 0;
    this.visible = false;
  }

  /**
   * Sets up event handlers for the modal
   */
  setupEventHandlers() {
    // Keyboard handling
    this.on('keyDown', event => this.handleKeyDown(event));

    // Mouse handling for backdrop
    this.on('click', event => this.handleBackdropClick(event));

    // Handle animation completion
    this.on('animationComplete', () => {
      this.isAnimating = false;
    });
  }

  /**
   * Prepares button configurations
   */
  prepareButtons() {
    this.buttonElements = this.buttons.map((buttonConfig, index) => ({
      ...buttonConfig,
      id: `modal-btn-${this.id}-${index}`,
      x: 0,
      y: 0,
      width: COMPONENT_CONSTANTS.DEFAULT_BUTTON_WIDTH,
      height: COMPONENT_CONSTANTS.DEFAULT_BUTTON_HEIGHT,
      isFocused: index === 0,
      isHovered: false,
      isPressed: false,
    }));
  }

  /**
   * Opens the modal with animation
   * @returns {Promise}
   */
  async open() {
    if (this.isOpen || this.isAnimating) return;

    try {
      this.isAnimating = true;

      // Store previously focused element
      this.previousFocus = document.activeElement;

      // Show modal
      this.visible = true;
      this.isOpen = true;

      // Calculate center position
      this.centerOnScreen();

      // Animate in based on animation type
      await this.animateIn();

      // Set up focus management
      if (this.autoFocus) {
        this.focusFirstElement();
      }

      // Emit open event
      this.emit('open', { modal: this });
    } catch (error) {
      this.errorHandler(error, 'open');
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Closes the modal with animation
   * @returns {Promise}
   */
  async close() {
    if (!this.isOpen || this.isAnimating) return;

    try {
      this.isAnimating = true;

      // Animate out
      await this.animateOut();

      // Hide modal
      this.visible = false;
      this.isOpen = false;

      // Restore focus
      if (
        this.previousFocus &&
        typeof this.previousFocus.focus === 'function'
      ) {
        this.previousFocus.focus();
      }

      // Emit close event
      this.emit('close', { modal: this });
    } catch (error) {
      this.errorHandler(error, 'close');
    } finally {
      this.isAnimating = false;
    }
  }

  /**
   * Centers the modal on screen
   */
  centerOnScreen() {
    if (this.scene) {
      // Assume scene represents viewport
      this.x = (this.scene.width - this.width) / 2;
      this.y = (this.scene.height - this.height) / 2;
    } else {
      // Default centering
      this.x = (window.innerWidth - this.width) / 2;
      this.y = (window.innerHeight - this.height) / 2;
    }
  }

  /**
   * Animates modal entrance
   * @returns {Promise}
   */
  async animateIn() {
    const animations = [];

    switch (this.animation) {
      case 'slide':
        this.y -= 100;
        animations.push(
          this.animate(
            'y',
            this.y + 100,
            UI_CONSTANTS.ANIMATION_DURATION.NORMAL,
            'easeOutCubic'
          ),
          this.animate('alpha', 1, UI_CONSTANTS.ANIMATION_DURATION.NORMAL)
        );
        break;

      case 'scale':
        this.scaleX = 0.8;
        this.scaleY = 0.8;
        animations.push(
          this.animate(
            'scaleX',
            1,
            UI_CONSTANTS.ANIMATION_DURATION.NORMAL,
            'easeOutBack'
          ),
          this.animate(
            'scaleY',
            1,
            UI_CONSTANTS.ANIMATION_DURATION.NORMAL,
            'easeOutBack'
          ),
          this.animate('alpha', 1, UI_CONSTANTS.ANIMATION_DURATION.NORMAL)
        );
        break;

      case 'bounce':
        this.scaleX = 0.3;
        this.scaleY = 0.3;
        animations.push(
          this.animate(
            'scaleX',
            1,
            UI_CONSTANTS.ANIMATION_DURATION.SLOW,
            'bounce'
          ),
          this.animate(
            'scaleY',
            1,
            UI_CONSTANTS.ANIMATION_DURATION.SLOW,
            'bounce'
          ),
          this.animate('alpha', 1, UI_CONSTANTS.ANIMATION_DURATION.FAST)
        );
        break;

      default: // fade
        animations.push(
          this.animate('alpha', 1, UI_CONSTANTS.ANIMATION_DURATION.NORMAL)
        );
    }

    await Promise.all(animations);
  }

  /**
   * Animates modal exit
   * @returns {Promise}
   */
  async animateOut() {
    return this.animate('alpha', 0, UI_CONSTANTS.ANIMATION_DURATION.FAST);
  }

  /**
   * Handles keyboard input
   * @param {Object} event
   */
  handleKeyDown(event) {
    if (!this.isOpen) return;

    switch (event.key) {
      case 'Escape':
        if (this.closeOnEscape && this.closable) {
          event.preventDefault();
          this.close();
        }
        break;

      case 'Tab':
        if (this.trapFocus) {
          this.handleTabNavigation(event);
        }
        break;

      case 'Enter':
      case ' ': {
        const focusedButton = this.buttonElements[this.focusedButtonIndex];
        if (focusedButton) {
          event.preventDefault();
          this.executeButtonAction(focusedButton);
        }
        break;
      }

      case 'ArrowLeft':
      case 'ArrowRight':
        this.navigateButtons(event.key === 'ArrowRight' ? 1 : -1);
        break;
    }
  }

  /**
   * Handles tab navigation within modal
   * @param {Object} event
   */
  handleTabNavigation(event) {
    // Simple tab trapping - in a real implementation, you'd identify all focusable elements
    event.preventDefault();

    if (event.shiftKey) {
      this.focusedButtonIndex = Math.max(0, this.focusedButtonIndex - 1);
    } else {
      this.focusedButtonIndex = Math.min(
        this.buttonElements.length - 1,
        this.focusedButtonIndex + 1
      );
    }

    this.updateButtonFocus();
  }

  /**
   * Navigates between buttons
   * @param {number} direction
   */
  navigateButtons(direction) {
    this.focusedButtonIndex = clamp(
      this.focusedButtonIndex + direction,
      0,
      this.buttonElements.length - 1
    );
    this.updateButtonFocus();
  }

  /**
   * Updates button focus states
   */
  updateButtonFocus() {
    this.buttonElements.forEach((button, index) => {
      button.isFocused = index === this.focusedButtonIndex;
    });
  }

  /**
   * Focuses the first focusable element
   */
  focusFirstElement() {
    if (this.buttonElements.length > 0) {
      this.focusedButtonIndex = 0;
      this.updateButtonFocus();
    }
  }

  /**
   * Handles backdrop click
   * @param {Object} event
   */
  handleBackdropClick(event) {
    // Check if click is outside modal content area
    if (
      !this.containsPoint(event.x, event.y) &&
      this.closeOnBackdrop &&
      this.closable
    ) {
      this.close();
    }
  }

  /**
   * Executes button action
   * @param {Object} button
   */
  executeButtonAction(button) {
    try {
      if (button.action === 'close') {
        this.close();
      } else if (typeof button.callback === 'function') {
        const result = button.callback(this, button);

        // If callback returns a promise, handle it
        if (result && typeof result.then === 'function') {
          result.catch(error => this.errorHandler(error, 'buttonCallback'));
        }
      }

      this.emit('buttonClick', { button, modal: this });
    } catch (error) {
      this.errorHandler(error, 'executeButtonAction');
    }
  }

  /**
   * Calculates button layout
   */
  calculateButtonLayout() {
    const buttonSpacing = UI_CONSTANTS.SPACING.SM;
    const totalButtonWidth = this.buttonElements.reduce(
      (sum, btn) => sum + btn.width,
      0
    );
    const totalSpacing = (this.buttonElements.length - 1) * buttonSpacing;
    const startX = (this.width - totalButtonWidth - totalSpacing) / 2;

    let currentX = startX;
    this.buttonElements.forEach(button => {
      button.x = currentX;
      button.y =
        this.height -
        this.footerHeight +
        (this.footerHeight - button.height) / 2;
      currentX += button.width + buttonSpacing;
    });
  }

  /**
   * Enhanced rendering for canvas
   * @param {CanvasRenderingContext2D} renderer
   */
  renderSelf(renderer) {
    if (renderer.type !== 'canvas' || !this.visible) return;

    try {
      // Draw backdrop if enabled
      if (this.backdrop && this.isOpen) {
        this.renderBackdrop(renderer);
      }

      // Draw modal background
      this.renderModalBackground(renderer);

      // Draw header
      this.renderHeader(renderer);

      // Draw body
      this.renderBody(renderer);

      // Draw footer with buttons
      this.renderFooter(renderer);

      // Draw focus ring if focused
      if (this.isFocused) {
        this.renderFocusRing(renderer);
      }
    } catch (error) {
      this.errorHandler(error, 'renderSelf');
    }
  }

  /**
   * Renders the modal backdrop
   * @param {CanvasRenderingContext2D} renderer
   */
  renderBackdrop(renderer) {
    renderer.save();

    // Reset transforms to draw full screen backdrop
    renderer.setTransform(1, 0, 0, 1, 0, 0);

    renderer.fillStyle = this.backdropColor;
    renderer.fillRect(0, 0, renderer.canvas.width, renderer.canvas.height);

    renderer.restore();
  }

  /**
   * Renders the modal background
   * @param {CanvasRenderingContext2D} renderer
   */
  renderModalBackground(renderer) {
    // Shadow
    renderer.fillStyle = 'rgba(0, 0, 0, 0.2)';
    renderer.fillRect(
      COMPONENT_CONSTANTS.MODAL_SHADOW_OFFSET,
      COMPONENT_CONSTANTS.MODAL_SHADOW_OFFSET,
      this.width,
      this.height
    );

    // Background
    renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
    renderer.fillRect(0, 0, this.width, this.height);

    // Border
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_300;
    renderer.lineWidth = 1;
    renderer.strokeRect(0, 0, this.width, this.height);
  }

  /**
   * Renders the modal header
   * @param {CanvasRenderingContext2D} renderer
   */
  renderHeader(renderer) {
    const headerY = 0;

    // Header background
    renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_50;
    renderer.fillRect(0, headerY, this.width, this.headerHeight);

    // Header border
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_200;
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(0, this.headerHeight);
    renderer.lineTo(this.width, this.headerHeight);
    renderer.stroke();

    // Title
    renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_900;
    renderer.font = 'bold 16px Arial';
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';
    renderer.fillText(
      this.title,
      this.padding,
      headerY + this.headerHeight / 2
    );

    // Close button (if closable)
    if (this.closable) {
      this.renderCloseButton(renderer);
    }
  }

  /**
   * Renders the close button
   * @param {CanvasRenderingContext2D} renderer
   */
  renderCloseButton(renderer) {
    const buttonSize = COMPONENT_CONSTANTS.MODAL_CLOSE_BUTTON_SIZE;
    const buttonX = this.width - this.padding - buttonSize;
    const buttonY = (this.headerHeight - buttonSize) / 2;

    // Button background
    renderer.fillStyle = this.closeButtonHovered
      ? UI_CONSTANTS.COLORS.GRAY_200
      : 'transparent';
    renderer.fillRect(buttonX, buttonY, buttonSize, buttonSize);

    // X symbol
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_600;
    renderer.lineWidth = 2;
    renderer.beginPath();
    renderer.moveTo(
      buttonX + COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING,
      buttonY + COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING
    );
    renderer.lineTo(
      buttonX + buttonSize - COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING,
      buttonY + buttonSize - COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING
    );
    renderer.moveTo(
      buttonX + buttonSize - COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING,
      buttonY + COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING
    );
    renderer.lineTo(
      buttonX + COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING,
      buttonY + buttonSize - COMPONENT_CONSTANTS.CLOSE_BUTTON_X_PADDING
    );
    renderer.stroke();
  }

  /**
   * Renders the modal body
   * @param {CanvasRenderingContext2D} renderer
   */
  renderBody(renderer) {
    const bodyY = this.headerHeight;

    // Body background
    renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
    renderer.fillRect(0, bodyY, this.width, this.bodyHeight);

    // Content text
    if (this.content) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_700;
      renderer.font = '14px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'top';

      // Wrap text to fit in body
      const maxWidth = this.width - this.padding * 2;
      const lines = UIUtils.wrapText(
        this.content,
        maxWidth,
        '14px Arial',
        renderer
      );

      let lineY = bodyY + this.padding;
      lines.forEach(line => {
        renderer.fillText(line, this.padding, lineY);
        lineY += COMPONENT_CONSTANTS.DEFAULT_LINE_HEIGHT;
      });
    }
  }

  /**
   * Renders the modal footer with buttons
   * @param {CanvasRenderingContext2D} renderer
   */
  renderFooter(renderer) {
    const footerY = this.height - this.footerHeight;

    // Footer background
    renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_50;
    renderer.fillRect(0, footerY, this.width, this.footerHeight);

    // Footer border
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_200;
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(0, footerY);
    renderer.lineTo(this.width, footerY);
    renderer.stroke();

    // Calculate and render buttons
    this.calculateButtonLayout();
    this.buttonElements.forEach(button => {
      this.renderButton(renderer, button);
    });
  }

  /**
   * Renders a modal button
   * @param {CanvasRenderingContext2D} renderer
   * @param {Object} button
   */
  renderButton(renderer, button) {
    // Button background
    let bgColor = UI_CONSTANTS.COLORS.PRIMARY;
    let textColor = UI_CONSTANTS.COLORS.WHITE;

    if (button.variant === 'secondary') {
      bgColor = UI_CONSTANTS.COLORS.GRAY_300;
      textColor = UI_CONSTANTS.COLORS.GRAY_700;
    }

    if (button.isPressed) {
      bgColor = UI_CONSTANTS.COLORS.GRAY_700;
    } else if (button.isHovered) {
      bgColor =
        button.variant === 'secondary'
          ? UI_CONSTANTS.COLORS.GRAY_400
          : '#1976D2';
    }

    renderer.fillStyle = bgColor;
    renderer.fillRect(button.x, button.y, button.width, button.height);

    // Button border
    if (button.isFocused) {
      renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
      renderer.lineWidth = 2;
    } else {
      renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_400;
      renderer.lineWidth = 1;
    }
    renderer.strokeRect(button.x, button.y, button.width, button.height);

    // Button text
    renderer.fillStyle = textColor;
    renderer.font = '14px Arial';
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText(
      button.text,
      button.x + button.width / 2,
      button.y + button.height / 2
    );
  }

  /**
   * Renders focus ring around modal
   * @param {CanvasRenderingContext2D} renderer
   */
  renderFocusRing(renderer) {
    renderer.strokeStyle = UI_CONSTANTS.COLORS.PRIMARY;
    renderer.lineWidth = FOCUS_RING_WIDTH;
    renderer.setLineDash([2, 2]);
    renderer.strokeRect(
      -FOCUS_RING_WIDTH,
      -FOCUS_RING_WIDTH,
      this.width + FOCUS_RING_WIDTH * 2,
      this.height + FOCUS_RING_WIDTH * 2
    );
    renderer.setLineDash([]);
  }

  /**
   * Enhanced input handling for modal interactions
   * @param {string} eventType
   * @param {Object} eventData
   * @returns {boolean}
   */
  handleInput(eventType, eventData) {
    if (!this.isOpen || this.isAnimating) return false;

    // Handle button interactions
    for (const button of this.buttonElements) {
      const buttonBounds = {
        x: this.x + button.x,
        y: this.y + button.y,
        width: button.width,
        height: button.height,
      };

      const inButton =
        eventData.x >= buttonBounds.x &&
        eventData.x <= buttonBounds.x + buttonBounds.width &&
        eventData.y >= buttonBounds.y &&
        eventData.y <= buttonBounds.y + buttonBounds.height;

      switch (eventType) {
        case 'mousemove':
          button.isHovered = inButton;
          break;

        case 'mousedown':
          if (inButton) {
            button.isPressed = true;
            this.focusedButtonIndex = this.buttonElements.indexOf(button);
            this.updateButtonFocus();
            return true;
          }
          break;

        case 'mouseup':
          if (button.isPressed) {
            button.isPressed = false;
            if (inButton) {
              this.executeButtonAction(button);
            }
            return true;
          }
          break;
      }
    }

    // Handle close button if closable
    if (this.closable && eventType === 'mousedown') {
      const closeButtonBounds = {
        x:
          this.x +
          this.width -
          this.padding -
          COMPONENT_CONSTANTS.MODAL_CLOSE_BUTTON_SIZE,
        y:
          this.y +
          (this.headerHeight - COMPONENT_CONSTANTS.MODAL_CLOSE_BUTTON_SIZE) / 2,
        width: COMPONENT_CONSTANTS.MODAL_CLOSE_BUTTON_SIZE,
        height: COMPONENT_CONSTANTS.MODAL_CLOSE_BUTTON_SIZE,
      };

      if (
        eventData.x >= closeButtonBounds.x &&
        eventData.x <= closeButtonBounds.x + closeButtonBounds.width &&
        eventData.y >= closeButtonBounds.y &&
        eventData.y <= closeButtonBounds.y + closeButtonBounds.height
      ) {
        this.close();
        return true;
      }
    }

    return super.handleInput(eventType, eventData);
  }

  /**
   * Enhanced destroy method
   */
  destroy() {
    // Close modal if open
    if (this.isOpen) {
      this.close();
    }

    // Clean up any remaining timers or animations
    this.stopAnimations();

    super.destroy();
  }
}

// ===== NAVIGATION MENU SYSTEM =====
class NavigationMenu extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || COMPONENT_CONSTANTS.DEFAULT_NAV_WIDTH,
      height: options.height || COMPONENT_CONSTANTS.DEFAULT_NAV_HEIGHT,
      ariaRole: 'navigation',
    });

    this.items = options.items || [];
    this.orientation = options.orientation || 'vertical'; // 'horizontal', 'vertical'
    this.expandable = options.expandable || false;
    this.collapsible = options.collapsible || false;
    this.selectedIndex = options.selectedIndex || 0;
    this.multiSelect = options.multiSelect || false;
    this.showIcons = options.showIcons !== false;
    this.showTooltips = options.showTooltips || false;
    this.animationDuration =
      options.animationDuration || UI_CONSTANTS.ANIMATION.DURATION.FAST;

    // State management
    this.isExpanded = options.isExpanded !== false;
    this.hoveredIndex = -1;
    this.focusedIndex = this.selectedIndex;
    this.selectedIndices = new Set([this.selectedIndex]);
    this.isAnimating = false;

    // Accessibility
    this.ariaLabel = options.ariaLabel || 'Navigation menu';
    this.ariaOrientation = this.orientation;

    // Error handling
    this.errorHandler =
      options.errorHandler || this.defaultErrorHandler.bind(this);

    // Performance tracking
    this.lastRenderTime = 0;
    this.renderCount = 0;

    this.setupNavigation();
    this.bindEvents();
  }

  /**
   * Sets up navigation items with enhanced properties
   */
  setupNavigation() {
    try {
      this.menuItems = this.items.map((item, index) => ({
        ...item,
        index,
        id: `nav-item-${this.id}-${index}`,
        element: null,
        isSelected: this.multiSelect
          ? this.selectedIndices.has(index)
          : index === this.selectedIndex,
        isHovered: false,
        isFocused: false,
        isDisabled: item.disabled || false,
        badge: item.badge || null,
        submenu: item.submenu || null,
        tooltip: item.tooltip || null,
        animationOffset: index * COMPONENT_CONSTANTS.ANIMATION_STAGGER_OFFSET, // Staggered animations
      }));

      this.updateAccessibilityAttributes();
    } catch (error) {
      this.errorHandler(error, 'setupNavigation');
    }
  }

  /**
   * Binds event handlers with error handling
   */
  bindEvents() {
    try {
      this.on('keyDown', event => this.handleKeyNavigation(event));
      this.on('focus', () => this.handleFocus());
      this.on('blur', () => this.handleBlur());

      // Animation events
      this.on('animationStart', () => {
        this.isAnimating = true;
      });
      this.on('animationEnd', () => {
        this.isAnimating = false;
      });
    } catch (error) {
      this.errorHandler(error, 'bindEvents');
    }
  }

  /**
   * Adds a new item with enhanced validation
   * @param {Object} item
   * @returns {boolean} Success status
   */
  addItem(item) {
    try {
      if (!item || typeof item !== 'object') {
        throw new Error('Invalid item provided to addItem');
      }

      const index = this.menuItems.length;
      const menuItem = {
        text: item.text || `Item ${index + 1}`,
        icon: item.icon || null,
        action: item.action || null,
        disabled: item.disabled || false,
        badge: item.badge || null,
        submenu: item.submenu || null,
        tooltip: item.tooltip || null,
        ...item,
        index,
        id: `nav-item-${this.id}-${index}`,
        element: null,
        isSelected: false,
        isHovered: false,
        isFocused: false,
        isDisabled: item.disabled || false,
        animationOffset: index * COMPONENT_CONSTANTS.ANIMATION_STAGGER_OFFSET,
      };

      this.menuItems.push(menuItem);
      this.updateAccessibilityAttributes();

      // Animate item addition
      this.animateItemAddition(menuItem);

      this.emit('itemAdded', { item: menuItem, index });
      return true;
    } catch (error) {
      this.errorHandler(error, 'addItem');
      return false;
    }
  }

  /**
   * Removes an item by index
   * @param {number} index
   * @returns {boolean} Success status
   */
  removeItem(index) {
    try {
      if (index < 0 || index >= this.menuItems.length) {
        throw new Error(`Invalid index ${index} for removeItem`);
      }

      const item = this.menuItems[index];
      this.menuItems.splice(index, 1);

      // Update indices
      this.menuItems.forEach((item, newIndex) => {
        item.index = newIndex;
        item.id = `nav-item-${this.id}-${newIndex}`;
      });

      // Adjust selection
      if (this.selectedIndex >= index) {
        this.selectedIndex = Math.max(0, this.selectedIndex - 1);
      }

      this.updateAccessibilityAttributes();
      this.emit('itemRemoved', { item, index });

      return true;
    } catch (error) {
      this.errorHandler(error, 'removeItem');
      return false;
    }
  }

  /**
   * Enhanced item selection with multi-select support
   * @param {number} index
   * @param {boolean} addToSelection
   */
  selectItem(index, addToSelection = false) {
    try {
      if (index < 0 || index >= this.menuItems.length) {
        throw new Error(`Invalid index ${index} for selectItem`);
      }

      const item = this.menuItems[index];
      if (item.isDisabled) {
        return;
      }

      if (this.multiSelect && addToSelection) {
        // Toggle selection in multi-select mode
        if (this.selectedIndices.has(index)) {
          this.selectedIndices.delete(index);
          item.isSelected = false;
        } else {
          this.selectedIndices.add(index);
          item.isSelected = true;
        }
      } else {
        // Single selection
        this.clearSelection();
        this.selectedIndex = index;
        this.selectedIndices.clear();
        this.selectedIndices.add(index);
        item.isSelected = true;
      }

      // Update visual state
      this.updateSelectionState();

      // Execute action
      if (item.action && typeof item.action === 'function') {
        const result = item.action(item, this);
        if (result && typeof result.then === 'function') {
          result.catch(error => this.errorHandler(error, 'itemAction'));
        }
      }

      // Animate selection
      this.animateSelection(item);

      this.emit('itemSelected', {
        item,
        index,
        selectedIndices: Array.from(this.selectedIndices),
        multiSelect: this.multiSelect && addToSelection,
      });
    } catch (error) {
      this.errorHandler(error, 'selectItem');
    }
  }

  /**
   * Clears all selections
   */
  clearSelection() {
    this.menuItems.forEach(item => {
      item.isSelected = false;
    });
    this.selectedIndices.clear();
  }

  /**
   * Updates selection state for all items
   */
  updateSelectionState() {
    this.menuItems.forEach((item, index) => {
      item.isSelected = this.selectedIndices.has(index);
    });
  }

  /**
   * Enhanced keyboard navigation with ARIA support
   * @param {Object} event
   */
  handleKeyNavigation(event) {
    try {
      if (this.isAnimating) return;

      const isVertical = this.orientation === 'vertical';
      const nextKey = isVertical ? 'ArrowDown' : 'ArrowRight';
      const prevKey = isVertical ? 'ArrowUp' : 'ArrowLeft';

      switch (event.key) {
        case nextKey:
          event.preventDefault();
          this.navigateToNextItem();
          break;

        case prevKey:
          event.preventDefault();
          this.navigateToPreviousItem();
          break;

        case 'Enter':
        case ' ':
          event.preventDefault();
          this.activateCurrentItem(event.ctrlKey || event.metaKey);
          break;

        case 'Home':
          event.preventDefault();
          this.navigateToFirstItem();
          break;

        case 'End':
          event.preventDefault();
          this.navigateToLastItem();
          break;

        case 'Escape':
          if (this.collapsible) {
            this.collapse();
          }
          break;

        case 'Tab':
          // Allow natural tab navigation
          break;

        default:
          // Handle character navigation
          this.handleCharacterNavigation(event.key);
          break;
      }
    } catch (error) {
      this.errorHandler(error, 'handleKeyNavigation');
    }
  }

  /**
   * Navigates to next available item
   */
  navigateToNextItem() {
    const startIndex = this.focusedIndex;
    let nextIndex = startIndex;

    do {
      nextIndex = (nextIndex + 1) % this.menuItems.length;
    } while (this.menuItems[nextIndex].isDisabled && nextIndex !== startIndex);

    if (nextIndex !== startIndex || !this.menuItems[nextIndex].isDisabled) {
      this.focusedIndex = nextIndex;
      this.updateFocus();
    }
  }

  /**
   * Navigates to previous available item
   */
  navigateToPreviousItem() {
    const startIndex = this.focusedIndex;
    let prevIndex = startIndex;

    do {
      prevIndex = prevIndex === 0 ? this.menuItems.length - 1 : prevIndex - 1;
    } while (this.menuItems[prevIndex].isDisabled && prevIndex !== startIndex);

    if (prevIndex !== startIndex || !this.menuItems[prevIndex].isDisabled) {
      this.focusedIndex = prevIndex;
      this.updateFocus();
    }
  }

  /**
   * Navigates to first available item
   */
  navigateToFirstItem() {
    for (let i = 0; i < this.menuItems.length; i++) {
      if (!this.menuItems[i].isDisabled) {
        this.focusedIndex = i;
        this.updateFocus();
        break;
      }
    }
  }

  /**
   * Navigates to last available item
   */
  navigateToLastItem() {
    for (let i = this.menuItems.length - 1; i >= 0; i--) {
      if (!this.menuItems[i].isDisabled) {
        this.focusedIndex = i;
        this.updateFocus();
        break;
      }
    }
  }

  /**
   * Activates the currently focused item
   * @param {boolean} addToSelection
   */
  activateCurrentItem(addToSelection = false) {
    if (this.focusedIndex >= 0 && this.focusedIndex < this.menuItems.length) {
      this.selectItem(this.focusedIndex, addToSelection);
    }
  }

  /**
   * Handles character-based navigation (type-ahead)
   * @param {string} char
   */
  handleCharacterNavigation(char) {
    if (char.length !== 1 || char < ' ') return;

    const searchChar = char.toLowerCase();
    const startIndex = (this.focusedIndex + 1) % this.menuItems.length;

    for (let i = 0; i < this.menuItems.length; i++) {
      const index = (startIndex + i) % this.menuItems.length;
      const item = this.menuItems[index];

      if (
        !item.isDisabled &&
        item.text &&
        item.text.toLowerCase().startsWith(searchChar)
      ) {
        this.focusedIndex = index;
        this.updateFocus();
        break;
      }
    }
  }

  /**
   * Updates focus state with animations
   */
  updateFocus() {
    try {
      this.menuItems.forEach((item, index) => {
        const wasFocused = item.isFocused;
        item.isFocused = index === this.focusedIndex;

        // Animate focus change
        if (item.isFocused && !wasFocused) {
          this.animateFocus(item);
        }
      });

      this.emit('focusChanged', {
        focusedIndex: this.focusedIndex,
        focusedItem: this.menuItems[this.focusedIndex],
      });
    } catch (error) {
      this.errorHandler(error, 'updateFocus');
    }
  }

  /**
   * Handles menu focus
   */
  handleFocus() {
    if (this.focusedIndex < 0 || this.focusedIndex >= this.menuItems.length) {
      this.focusedIndex = this.selectedIndex >= 0 ? this.selectedIndex : 0;
    }
    this.updateFocus();
  }

  /**
   * Handles menu blur
   */
  handleBlur() {
    this.menuItems.forEach(item => {
      item.isFocused = false;
    });
  }

  /**
   * Expands the menu with animation
   */
  expand() {
    if (this.isExpanded || this.isAnimating) return;

    this.isExpanded = true;
    this.animateExpansion(true);
    this.emit('expanded');
  }

  /**
   * Collapses the menu with animation
   */
  collapse() {
    if (!this.isExpanded || this.isAnimating) return;

    this.isExpanded = false;
    this.animateExpansion(false);
    this.emit('collapsed');
  }

  /**
   * Toggles menu expansion
   */
  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  // Animation methods
  animateItemAddition(item) {
    if (!this.animationsEnabled) return;

    this.animate('alpha', 1, this.animationDuration, {
      from: 0,
      delay: item.animationOffset,
      easing: EASING_FUNCTIONS.EASE_OUT_CUBIC,
    });
  }

  animateSelection(_item) {
    if (!this.animationsEnabled) return;

    // Pulse animation for selection
    this.animate(
      'scale',
      COMPONENT_CONSTANTS.SELECTION_SCALE,
      COMPONENT_CONSTANTS.ANIMATION_FAST,
      {
        from: 1,
        yoyo: true,
        easing: EASING_FUNCTIONS.EASE_OUT_QUAD,
      }
    );
  }

  animateFocus(item) {
    if (!this.animationsEnabled) return;

    // Subtle scale animation for focus
    item.focusScale = item.focusScale || 1;
    this.animate(
      'focusScale',
      COMPONENT_CONSTANTS.FOCUS_SCALE,
      COMPONENT_CONSTANTS.ANIMATION_NORMAL,
      {
        from: 1,
        target: item,
        easing: EASING_FUNCTIONS.EASE_OUT_QUAD,
      }
    );
  }

  animateExpansion(expanding) {
    if (!this.animationsEnabled) return;

    const targetHeight = expanding ? this.originalHeight : 0;
    this.animate('height', targetHeight, this.animationDuration, {
      easing: EASING_FUNCTIONS.EASE_OUT_CUBIC,
    });
  }

  /**
   * Updates accessibility attributes
   */
  updateAccessibilityAttributes() {
    this.ariaLabel = `Navigation menu with ${this.menuItems.length} items`;
    if (this.selectedIndices.size > 0) {
      this.ariaLabel += `, ${this.selectedIndices.size} selected`;
    }
  }

  /**
   * Enhanced input handling with touch support
   * @param {string} eventType
   * @param {Object} eventData
   * @returns {boolean}
   */
  handleInput(eventType, eventData) {
    try {
      if (!this.visible || this.isAnimating) return false;

      const { x, y } = eventData;
      const itemHeight =
        this.orientation === 'vertical'
          ? this.height / this.menuItems.length
          : this.height;
      const itemWidth =
        this.orientation === 'horizontal'
          ? this.width / this.menuItems.length
          : this.width;

      // Find hovered item
      let hoveredIndex = -1;
      for (let i = 0; i < this.menuItems.length; i++) {
        const itemX = this.orientation === 'horizontal' ? i * itemWidth : 0;
        const itemY = this.orientation === 'vertical' ? i * itemHeight : 0;

        if (
          x >= this.x + itemX &&
          x <= this.x + itemX + itemWidth &&
          y >= this.y + itemY &&
          y <= this.y + itemY + itemHeight
        ) {
          hoveredIndex = i;
          break;
        }
      }

      // Update hover states
      this.menuItems.forEach((item, index) => {
        item.isHovered = index === hoveredIndex;
      });

      switch (eventType) {
        case 'mousemove':
          if (hoveredIndex !== this.hoveredIndex) {
            this.hoveredIndex = hoveredIndex;
            this.emit('hoverChanged', {
              hoveredIndex,
              hoveredItem: this.menuItems[hoveredIndex],
            });
          }
          break;

        case 'mousedown':
        case 'touchstart':
          if (hoveredIndex >= 0) {
            this.focusedIndex = hoveredIndex;
            this.updateFocus();
            return true;
          }
          break;

        case 'mouseup':
        case 'touchend':
          if (hoveredIndex >= 0) {
            this.selectItem(
              hoveredIndex,
              eventData.ctrlKey || eventData.metaKey
            );
            return true;
          }
          break;
      }

      return super.handleInput(eventType, eventData);
    } catch (error) {
      this.errorHandler(error, 'handleInput');
      return false;
    }
  }

  /**
   * Enhanced canvas rendering with modern styling
   * @param {CanvasRenderingContext2D} renderer
   */
  renderSelf(renderer) {
    if (renderer.type !== 'canvas' || !this.visible) return;

    try {
      const startTime = performance.now();

      // Performance optimization: skip rendering if not visible
      if (this.alpha <= 0 || this.scale <= 0) return;

      const itemHeight =
        this.orientation === 'vertical'
          ? this.height / this.menuItems.length
          : this.height;
      const itemWidth =
        this.orientation === 'horizontal'
          ? this.width / this.menuItems.length
          : this.width;

      // Render menu background
      this.renderMenuBackground(renderer);

      // Render items
      this.menuItems.forEach((item, index) => {
        if (this.isExpanded || !this.collapsible) {
          this.renderMenuItem(renderer, item, index, itemWidth, itemHeight);
        }
      });

      // Render focus ring
      if (this.isFocused && this.focusedIndex >= 0) {
        this.renderFocusRing(renderer, itemWidth, itemHeight);
      }

      // Performance tracking
      const renderTime = performance.now() - startTime;
      this.lastRenderTime = renderTime;
      this.renderCount++;

      if (renderTime > COMPONENT_CONSTANTS.PERFORMANCE_THRESHOLD) {
        // Longer than 1 frame
        UIUtils.debugLog(
          'warn',
          `NavigationMenu render took ${renderTime.toFixed(2)}ms`
        );
      }
    } catch (error) {
      this.errorHandler(error, 'renderSelf');
    }
  }

  /**
   * Renders menu background
   * @param {CanvasRenderingContext2D} renderer
   */
  renderMenuBackground(renderer) {
    // Menu background
    renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
    renderer.fillRect(0, 0, this.width, this.height);

    // Menu border
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_300;
    renderer.lineWidth = 1;
    renderer.strokeRect(0, 0, this.width, this.height);

    // Shadow
    renderer.fillStyle = 'rgba(0, 0, 0, 0.1)';
    renderer.fillRect(2, 2, this.width, this.height);
  }

  /**
   * Renders individual menu item
   * @param {CanvasRenderingContext2D} renderer
   * @param {Object} item
   * @param {number} index
   * @param {number} itemWidth
   * @param {number} itemHeight
   */
  renderMenuItem(renderer, item, index, itemWidth, itemHeight) {
    const x = this.orientation === 'horizontal' ? index * itemWidth : 0;
    const y = this.orientation === 'vertical' ? index * itemHeight : 0;

    // Item background
    let bgColor = UI_CONSTANTS.COLORS.WHITE;
    if (item.isDisabled) {
      bgColor = UI_CONSTANTS.COLORS.GRAY_100;
    } else if (item.isSelected) {
      bgColor = UI_CONSTANTS.COLORS.PRIMARY;
    } else if (item.isFocused) {
      bgColor = UI_CONSTANTS.COLORS.PRIMARY_LIGHT;
    } else if (item.isHovered) {
      bgColor = UI_CONSTANTS.COLORS.GRAY_50;
    }

    renderer.fillStyle = bgColor;
    renderer.fillRect(x, y, itemWidth, itemHeight);

    // Item border
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_200;
    renderer.lineWidth = 1;
    renderer.strokeRect(x, y, itemWidth, itemHeight);

    // Focus indicator
    if (item.isFocused) {
      renderer.strokeStyle = UI_CONSTANTS.COLORS.PRIMARY;
      renderer.lineWidth = 2;
      renderer.strokeRect(x + 1, y + 1, itemWidth - 2, itemHeight - 2);
    }

    // Text
    const textColor = item.isSelected
      ? UI_CONSTANTS.COLORS.WHITE
      : item.isDisabled
        ? UI_CONSTANTS.COLORS.GRAY_400
        : UI_CONSTANTS.COLORS.GRAY_900;

    renderer.fillStyle = textColor;
    renderer.font = `${item.isSelected ? 'bold ' : ''}14px Arial`;
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';

    let textX = x + UI_CONSTANTS.SPACING.SM;
    const textY = y + itemHeight / 2;

    // Icon
    if (this.showIcons && item.icon) {
      renderer.fillText(item.icon, textX, textY);
      textX += COMPONENT_CONSTANTS.ICON_WIDTH;
    }

    // Text with truncation
    const availableWidth =
      itemWidth -
      (textX - x) -
      UI_CONSTANTS.SPACING.SM -
      (item.badge ? COMPONENT_CONSTANTS.BADGE_WIDTH : 0);
    const truncatedText = UIUtils.truncateText(
      item.text,
      availableWidth,
      renderer.font,
      renderer
    );
    renderer.fillText(truncatedText, textX, textY);

    // Badge
    if (item.badge) {
      this.renderBadge(
        renderer,
        item.badge,
        x + itemWidth - COMPONENT_CONSTANTS.ICON_WIDTH,
        y + COMPONENT_CONSTANTS.BADGE_PADDING
      );
    }

    // Submenu indicator
    if (item.submenu) {
      const indicatorX =
        x + itemWidth - COMPONENT_CONSTANTS.SUBMENU_INDICATOR_SIZE;
      const indicatorY = y + itemHeight / 2;
      this.renderSubmenuIndicator(
        renderer,
        indicatorX,
        indicatorY,
        item.isSelected
      );
    }
  }

  /**
   * Renders item badge
   * @param {CanvasRenderingContext2D} renderer
   * @param {string|number} badge
   * @param {number} x
   * @param {number} y
   */
  renderBadge(renderer, badge, x, y) {
    const badgeText = String(badge);
    const badgeWidth = Math.max(
      COMPONENT_CONSTANTS.BADGE_MIN_WIDTH,
      badgeText.length * COMPONENT_CONSTANTS.BADGE_CHAR_WIDTH
    );

    // Badge background
    renderer.fillStyle = UI_CONSTANTS.COLORS.DANGER;
    UIUtils.fillRoundedRect(
      renderer,
      x - badgeWidth / 2,
      y,
      badgeWidth,
      COMPONENT_CONSTANTS.BADGE_HEIGHT,
      UI_CONSTANTS.BORDER_RADIUS.SM
    );

    // Badge text
    renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
    renderer.font = 'bold 10px Arial';
    renderer.textAlign = 'center';
    renderer.fillText(badgeText, x, y + UI_CONSTANTS.SPACING.SM);
  }

  /**
   * Renders submenu indicator
   * @param {CanvasRenderingContext2D} renderer
   * @param {number} x
   * @param {number} y
   * @param {boolean} isSelected
   */
  renderSubmenuIndicator(renderer, x, y, isSelected) {
    const size = 6;
    const color = isSelected
      ? UI_CONSTANTS.COLORS.WHITE
      : UI_CONSTANTS.COLORS.GRAY_600;

    renderer.fillStyle = color;
    renderer.beginPath();
    renderer.moveTo(x - size, y - size);
    renderer.lineTo(x + size, y);
    renderer.lineTo(x - size, y + size);
    renderer.closePath();
    renderer.fill();
  }

  /**
   * Renders focus ring around focused item
   * @param {CanvasRenderingContext2D} renderer
   * @param {number} itemWidth
   * @param {number} itemHeight
   */
  renderFocusRing(renderer, itemWidth, itemHeight) {
    const item = this.menuItems[this.focusedIndex];
    if (!item) return;

    const x = this.orientation === 'horizontal' ? item.index * itemWidth : 0;
    const y = this.orientation === 'vertical' ? item.index * itemHeight : 0;

    renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
    renderer.lineWidth = FOCUS_RING_WIDTH;
    renderer.setLineDash([2, 2]);
    renderer.strokeRect(
      x - FOCUS_RING_WIDTH,
      y - FOCUS_RING_WIDTH,
      itemWidth + FOCUS_RING_WIDTH * 2,
      itemHeight + FOCUS_RING_WIDTH * 2
    );
    renderer.setLineDash([]);
  }

  /**
   * Gets accessibility description
   * @returns {string}
   */
  getAccessibilityDescription() {
    const selectedCount = this.selectedIndices.size;
    const totalCount = this.menuItems.length;
    const enabledCount = this.menuItems.filter(item => !item.isDisabled).length;

    return (
      `Navigation menu with ${totalCount} items, ${enabledCount} enabled, ${selectedCount} selected. ` +
      `Currently ${this.isExpanded ? 'expanded' : 'collapsed'}. ` +
      `Orientation: ${this.orientation}.`
    );
  }

  /**
   * Default error handler
   * @param {Error} error
   * @param {string} context
   */
  defaultErrorHandler(error, context) {
    UIUtils.debugLog('error', `NavigationMenu error in ${context}`, error);
    this.emit('error', { error, context, component: 'NavigationMenu' });
  }

  /**
   * Enhanced destroy method with cleanup
   */
  destroy() {
    try {
      // Clear any running animations
      this.stopAnimations();

      // Clear timers
      this.clearTimers();

      // Clean up menu items
      this.menuItems = [];
      this.selectedIndices.clear();

      super.destroy();
    } catch (error) {
      this.errorHandler(error, 'destroy');
    }
  }
}

// ===== DATA VISUALIZATION COMPONENTS =====
class Chart extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || COMPONENT_CONSTANTS.DEFAULT_CHART_WIDTH,
      height: options.height || COMPONENT_CONSTANTS.DEFAULT_CHART_HEIGHT,
      ariaRole: 'img',
    });

    this.type = options.type || 'line'; // 'line', 'bar', 'pie', 'scatter', 'area'
    this.data = options.data || [];
    this.labels = options.labels || [];
    this.title = options.title || '';
    this.subtitle = options.subtitle || '';
    this.showLegend = options.showLegend !== false;
    this.showAxis = options.showAxis !== false;
    this.showGrid = options.showGrid !== false;
    this.showTooltips = options.showTooltips !== false;
    this.interactive = options.interactive !== false;
    this.animated = options.animated !== false;
    this.colors = options.colors || [
      UI_CONSTANTS.COLORS.PRIMARY,
      UI_CONSTANTS.COLORS.SUCCESS,
      UI_CONSTANTS.COLORS.WARNING,
      UI_CONSTANTS.COLORS.DANGER,
      UI_CONSTANTS.COLORS.INFO,
      '#9C27B0',
      '#607D8B',
      '#795548',
    ];

    // Chart dimensions (accounting for margins)
    this.margin = options.margin || {
      top: 50,
      right: 40,
      bottom: 50,
      left: 70,
    };
    this.chartWidth = this.width - this.margin.left - this.margin.right;
    this.chartHeight = this.height - this.margin.top - this.margin.bottom;

    // Animation and interaction state
    this.animationProgress = 0;
    this.isAnimating = false;
    this.hoveredDataPoint = null;
    this.selectedDataPoints = new Set();

    // Performance and accessibility
    this.errorHandler =
      options.errorHandler || this.defaultErrorHandler.bind(this);
    this.lastRenderTime = 0;
    this.renderCount = 0;

    // Chart-specific data
    this.processedData = null;
    this.scales = null;
    this.legend = null;
    this.tooltip = null;

    this.setupChart();
    this.bindEvents();
  }

  /**
   * Sets up chart with data processing and validation
   */
  setupChart() {
    try {
      this.validateData();
      this.processData();
      this.calculateScales();
      this.setupLegend();
      this.setupTooltip();
      this.updateAccessibilityAttributes();

      if (this.animated) {
        this.startEntranceAnimation();
      }
    } catch (error) {
      this.errorHandler(error, 'setupChart');
    }
  }

  /**
   * Binds interaction events
   */
  bindEvents() {
    try {
      if (this.interactive) {
        this.on('mousemove', event => this.handleMouseMove(event));
        this.on('mousedown', event => this.handleMouseDown(event));
        this.on('mouseup', event => this.handleMouseUp(event));
        this.on('keyDown', event => this.handleKeyDown(event));
      }
    } catch (error) {
      this.errorHandler(error, 'bindEvents');
    }
  }

  /**
   * Validates input data
   */
  validateData() {
    if (!Array.isArray(this.data)) {
      throw new Error('Chart data must be an array');
    }

    if (this.data.length === 0) {
      throw new Error('Chart data cannot be empty');
    }

    // Type-specific validation
    switch (this.type) {
      case 'pie':
        if (!this.data.every(val => typeof val === 'number' && val >= 0)) {
          throw new Error('Pie chart data must be positive numbers');
        }
        break;

      case 'line':
      case 'area':
      case 'bar':
        if (!Array.isArray(this.data[0])) {
          // Single series
          if (!this.data.every(val => typeof val === 'number')) {
            throw new Error('Line/Bar chart data must be numbers');
          }
        } else {
          // Multiple series
          if (
            !this.data.every(
              series =>
                Array.isArray(series) &&
                series.every(val => typeof val === 'number')
            )
          ) {
            throw new Error('Multi-series data must be arrays of numbers');
          }
        }
        break;

      case 'scatter':
        if (
          !this.data.every(
            point =>
              Array.isArray(point) &&
              point.length >= 2 &&
              typeof point[0] === 'number' &&
              typeof point[1] === 'number'
          )
        ) {
          throw new Error('Scatter plot data must be [x, y] coordinate pairs');
        }
        break;
    }
  }

  /**
   * Processes data based on chart type
   */
  processData() {
    try {
      switch (this.type) {
        case 'line':
        case 'area':
        case 'bar':
          this.processSeriesData();
          break;
        case 'pie':
          this.processPieData();
          break;
        case 'scatter':
          this.processScatterData();
          break;
      }
    } catch (error) {
      this.errorHandler(error, 'processData');
    }
  }

  /**
   * Processes series data for line/bar/area charts
   */
  processSeriesData() {
    // Normalize to multi-series format
    if (!Array.isArray(this.data[0])) {
      this.data = [this.data]; // Single series
    }

    // Calculate statistics
    const allValues = this.data.flat();
    this.minValue = Math.min(...allValues);
    this.maxValue = Math.max(...allValues);
    this.avgValue =
      allValues.reduce((sum, val) => sum + val, 0) / allValues.length;

    // Add padding to min/max for better visualization
    const range = this.maxValue - this.minValue;
    const padding = range * COMPONENT_CONSTANTS.CHART_PADDING_RATIO;
    this.minValue = Math.max(0, this.minValue - padding);
    this.maxValue = this.maxValue + padding;

    // Process each series
    this.processedData = this.data.map((series, seriesIndex) => ({
      values: series,
      color: this.colors[seriesIndex % this.colors.length],
      label: this.labels[seriesIndex] || `Series ${seriesIndex + 1}`,
      visible: true,
      opacity: 1,
    }));
  }

  /**
   * Processes data for pie charts
   */
  processPieData() {
    const total = this.data.reduce((sum, val) => sum + val, 0);

    if (total === 0) {
      throw new Error('Pie chart total cannot be zero');
    }

    this.processedData = this.data.map((value, index) => ({
      value,
      percentage: (value / total) * 100,
      angle: (value / total) * 2 * Math.PI,
      color: this.colors[index % this.colors.length],
      label: this.labels[index] || `Slice ${index + 1}`,
      visible: true,
      opacity: 1,
    }));

    // Calculate cumulative angles for rendering
    let cumulativeAngle = 0;
    this.processedData.forEach(slice => {
      slice.startAngle = cumulativeAngle;
      slice.endAngle = cumulativeAngle + slice.angle;
      cumulativeAngle += slice.angle;
    });
  }

  /**
   * Processes scatter plot data
   */
  processScatterData() {
    this.minX = Math.min(...this.data.map(point => point[0]));
    this.maxX = Math.max(...this.data.map(point => point[0]));
    this.minY = Math.min(...this.data.map(point => point[1]));
    this.maxY = Math.max(...this.data.map(point => point[1]));

    // Add padding
    const xRange = this.maxX - this.minX;
    const yRange = this.maxY - this.minY;
    const xPadding = xRange * COMPONENT_CONSTANTS.CHART_PADDING_RATIO;
    const yPadding = yRange * COMPONENT_CONSTANTS.CHART_PADDING_RATIO;

    this.minX -= xPadding;
    this.maxX += xPadding;
    this.minY -= yPadding;
    this.maxY += yPadding;

    this.processedData = this.data.map((point, index) => ({
      x: point[0],
      y: point[1],
      color: this.colors[index % this.colors.length],
      label: this.labels[index] || `Point ${index + 1}`,
      visible: true,
      opacity: 1,
    }));
  }

  /**
   * Calculates scales for positioning data
   */
  calculateScales() {
    try {
      switch (this.type) {
        case 'line':
        case 'area':
        case 'bar':
          this.xScale =
            this.chartWidth / (this.processedData[0].values.length - 1);
          this.yScale = this.chartHeight / (this.maxValue - this.minValue);
          break;

        case 'scatter':
          this.xScale = this.chartWidth / (this.maxX - this.minX);
          this.yScale = this.chartHeight / (this.maxY - this.minY);
          break;

        case 'pie':
          // Pie charts use radius calculation instead
          this.radius =
            Math.min(this.chartWidth, this.chartHeight) / 2 -
            COMPONENT_CONSTANTS.CHART_RADIUS_MARGIN;
          break;
      }
    } catch (error) {
      this.errorHandler(error, 'calculateScales');
    }
  }

  /**
   * Sets up legend configuration
   */
  setupLegend() {
    if (!this.showLegend) return;

    this.legend = {
      x: this.width - COMPONENT_CONSTANTS.CHART_LEGEND_WIDTH,
      y: this.margin.top,
      width: 140,
      itemHeight: 20,
      items: this.processedData.map(item => ({
        color: item.color,
        label: item.label,
        visible: item.visible,
      })),
    };
  }

  /**
   * Sets up tooltip configuration
   */
  setupTooltip() {
    if (!this.showTooltips) return;

    this.tooltip = {
      visible: false,
      x: 0,
      y: 0,
      content: '',
      width: 'auto',
      height: 'auto',
    };
  }

  /**
   * Starts entrance animation
   */
  startEntranceAnimation() {
    if (!this.animationsEnabled) return;

    this.animationProgress = 0;
    this.isAnimating = true;

    this.animate('animationProgress', 1, UI_CONSTANTS.ANIMATION.DURATION.SLOW, {
      easing: EASING_FUNCTIONS.EASE_OUT_CUBIC,
      onComplete: () => {
        this.isAnimating = false;
        this.emit('animationComplete');
      },
    });
  }

  /**
   * Handles mouse movement for interactions
   * @param {Object} event
   */
  handleMouseMove(event) {
    try {
      if (!this.interactive) return;

      const { x, y } = event;
      const localX = x - this.x - this.margin.left;
      const localY = y - this.y - this.margin.top;

      // Find data point near cursor
      const dataPoint = this.findDataPointAt(localX, localY);

      if (dataPoint !== this.hoveredDataPoint) {
        this.hoveredDataPoint = dataPoint;

        if (dataPoint && this.showTooltips) {
          this.showTooltip(dataPoint, x, y);
        } else {
          this.hideTooltip();
        }

        this.emit('dataPointHover', { dataPoint, x: localX, y: localY });
      }
    } catch (error) {
      this.errorHandler(error, 'handleMouseMove');
    }
  }

  /**
   * Handles mouse down for selection
   * @param {Object} event
   */
  handleMouseDown(event) {
    try {
      if (!this.interactive) return;

      const { x, y } = event;
      const localX = x - this.x - this.margin.left;
      const localY = y - this.y - this.margin.top;

      const dataPoint = this.findDataPointAt(localX, localY);

      if (dataPoint) {
        if (event.ctrlKey || event.metaKey) {
          // Multi-select
          if (this.selectedDataPoints.has(dataPoint)) {
            this.selectedDataPoints.delete(dataPoint);
          } else {
            this.selectedDataPoints.add(dataPoint);
          }
        } else {
          // Single select
          this.selectedDataPoints.clear();
          this.selectedDataPoints.add(dataPoint);
        }

        this.emit('dataPointSelect', {
          dataPoint,
          selectedPoints: Array.from(this.selectedDataPoints),
        });
      }
    } catch (error) {
      this.errorHandler(error, 'handleMouseDown');
    }
  }

  /**
   * Handles mouse up events
   * @param {Object} event
   */
  handleMouseUp(_event) {
    // Placeholder for future drag interactions
  }

  /**
   * Handles keyboard navigation
   * @param {Object} event
   */
  handleKeyDown(event) {
    try {
      if (!this.interactive) return;

      switch (event.key) {
        case 'Escape':
          this.selectedDataPoints.clear();
          this.hideTooltip();
          this.emit('selectionCleared');
          break;

        case 'Enter':
        case ' ':
          if (this.hoveredDataPoint) {
            this.selectedDataPoints.clear();
            this.selectedDataPoints.add(this.hoveredDataPoint);
            this.emit('dataPointSelect', {
              dataPoint: this.hoveredDataPoint,
              selectedPoints: Array.from(this.selectedDataPoints),
            });
          }
          break;
      }
    } catch (error) {
      this.errorHandler(error, 'handleKeyDown');
    }
  }

  /**
   * Finds data point at given coordinates
   * @param {number} x
   * @param {number} y
   * @returns {Object|null}
   */
  findDataPointAt(x, y) {
    const tolerance = 10; // Pixel tolerance for hit detection

    switch (this.type) {
      case 'line':
      case 'area':
        return this.findLineDataPoint(x, y, tolerance);

      case 'bar':
        return this.findBarDataPoint(x, y);

      case 'pie':
        return this.findPieDataPoint(x, y);

      case 'scatter':
        return this.findScatterDataPoint(x, y, tolerance);

      default:
        return null;
    }
  }

  /**
   * Finds data point for line charts
   * @param {number} x
   * @param {number} y
   * @param {number} tolerance
   * @returns {Object|null}
   */
  findLineDataPoint(x, y, tolerance) {
    for (const series of this.processedData) {
      for (let i = 0; i < series.values.length; i++) {
        const pointX = i * this.xScale;
        const pointY =
          this.chartHeight - (series.values[i] - this.minValue) * this.yScale;

        const distance = Math.sqrt(
          Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2)
        );

        if (distance <= tolerance) {
          return {
            series: series.label,
            index: i,
            value: series.values[i],
            x: pointX,
            y: pointY,
            color: series.color,
          };
        }
      }
    }
    return null;
  }

  /**
   * Finds data point for bar charts
   * @param {number} x
   * @param {number} y
   * @returns {Object|null}
   */
  findBarDataPoint(x, y) {
    const barWidth = this.chartWidth / this.processedData[0].values.length;
    const barIndex = Math.floor(x / barWidth);

    if (barIndex >= 0 && barIndex < this.processedData[0].values.length) {
      for (const series of this.processedData) {
        const value = series.values[barIndex];
        const barHeight = (value - this.minValue) * this.yScale;
        const barY = this.chartHeight - barHeight;

        if (y >= barY && y <= this.chartHeight) {
          return {
            series: series.label,
            index: barIndex,
            value,
            x: barIndex * barWidth + barWidth / 2,
            y: barY + barHeight / 2,
            color: series.color,
          };
        }
      }
    }
    return null;
  }

  /**
   * Finds data point for pie charts
   * @param {number} x
   * @param {number} y
   * @returns {Object|null}
   */
  findPieDataPoint(x, y) {
    const centerX = this.chartWidth / 2;
    const centerY = this.chartHeight / 2;

    const distance = Math.sqrt(
      Math.pow(x - centerX, 2) + Math.pow(y - centerY, 2)
    );

    if (distance <= this.radius) {
      const angle = Math.atan2(y - centerY, x - centerX);
      const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle;

      for (const slice of this.processedData) {
        if (
          normalizedAngle >= slice.startAngle &&
          normalizedAngle <= slice.endAngle
        ) {
          return {
            label: slice.label,
            value: slice.value,
            percentage: slice.percentage,
            color: slice.color,
            angle: normalizedAngle,
          };
        }
      }
    }
    return null;
  }

  /**
   * Finds data point for scatter plots
   * @param {number} x
   * @param {number} y
   * @param {number} tolerance
   * @returns {Object|null}
   */
  findScatterDataPoint(x, y, tolerance) {
    for (const point of this.processedData) {
      const pointX = (point.x - this.minX) * this.xScale;
      const pointY = this.chartHeight - (point.y - this.minY) * this.yScale;

      const distance = Math.sqrt(
        Math.pow(x - pointX, 2) + Math.pow(y - pointY, 2)
      );

      if (distance <= tolerance) {
        return {
          ...point,
          screenX: pointX,
          screenY: pointY,
        };
      }
    }
    return null;
  }

  /**
   * Shows tooltip for data point
   * @param {Object} dataPoint
   * @param {number} x
   * @param {number} y
   */
  showTooltip(dataPoint, x, y) {
    if (!this.tooltip) return;

    this.tooltip.visible = true;
    this.tooltip.x = x + 10;
    this.tooltip.y = y - 10;
    this.tooltip.content = this.formatTooltipContent(dataPoint);
  }

  /**
   * Hides tooltip
   */
  hideTooltip() {
    if (this.tooltip) {
      this.tooltip.visible = false;
    }
  }

  /**
   * Formats tooltip content
   * @param {Object} dataPoint
   * @returns {string}
   */
  formatTooltipContent(dataPoint) {
    switch (this.type) {
      case 'pie':
        return `${dataPoint.label}: ${dataPoint.value} (${dataPoint.percentage.toFixed(1)}%)`;

      case 'scatter':
        return `${dataPoint.label}: (${dataPoint.x}, ${dataPoint.y})`;

      default:
        return `${dataPoint.series}: ${dataPoint.value}`;
    }
  }

  /**
   * Enhanced canvas rendering with performance optimization
   * @param {CanvasRenderingContext2D} renderer
   */
  renderSelf(renderer) {
    if (renderer.type !== 'canvas' || !this.visible) return;

    try {
      const startTime = performance.now();

      // Clear background
      renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
      renderer.fillRect(0, 0, this.width, this.height);

      // Render title and subtitle
      this.renderTitles(renderer);

      // Set up chart area clipping
      renderer.save();
      renderer.beginPath();
      renderer.rect(
        this.margin.left,
        this.margin.top,
        this.chartWidth,
        this.chartHeight
      );
      renderer.clip();

      // Render grid and axes
      if (this.showGrid && this.type !== 'pie') {
        this.renderGrid(renderer);
      }

      if (this.showAxis && this.type !== 'pie') {
        this.renderAxes(renderer);
      }

      // Render chart based on type
      switch (this.type) {
        case 'line':
          this.renderLineChart(renderer);
          break;
        case 'area':
          this.renderAreaChart(renderer);
          break;
        case 'bar':
          this.renderBarChart(renderer);
          break;
        case 'pie':
          this.renderPieChart(renderer);
          break;
        case 'scatter':
          this.renderScatterPlot(renderer);
          break;
      }

      renderer.restore();

      // Render legend
      if (this.showLegend) {
        this.renderLegend(renderer);
      }

      // Render tooltip
      if (this.tooltip && this.tooltip.visible) {
        this.renderTooltip(renderer);
      }

      // Performance tracking
      const renderTime = performance.now() - startTime;
      this.lastRenderTime = renderTime;
      this.renderCount++;

      if (renderTime > COMPONENT_CONSTANTS.PERFORMANCE_THRESHOLD) {
        UIUtils.debugLog(
          'warn',
          `Chart render took ${renderTime.toFixed(2)}ms`
        );
      }
    } catch (error) {
      this.errorHandler(error, 'renderSelf');
    }
  }

  /**
   * Renders chart titles
   * @param {CanvasRenderingContext2D} renderer
   */
  renderTitles(renderer) {
    // Main title
    if (this.title) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_900;
      renderer.font = 'bold 18px Arial';
      renderer.textAlign = 'center';
      renderer.textBaseline = 'top';
      renderer.fillText(this.title, this.width / 2, 10);
    }

    // Subtitle
    if (this.subtitle) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_600;
      renderer.font = '14px Arial';
      renderer.textAlign = 'center';
      renderer.textBaseline = 'top';
      renderer.fillText(
        this.subtitle,
        this.width / 2,
        COMPONENT_CONSTANTS.CHART_SUBTITLE_Y
      );
    }
  }

  /**
   * Renders grid lines
   * @param {CanvasRenderingContext2D} renderer
   */
  renderGrid(renderer) {
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_200;
    renderer.lineWidth = 1;
    renderer.setLineDash([2, 2]);

    // Horizontal grid lines
    const gridLines = 5;
    for (let i = 0; i <= gridLines; i++) {
      const y = this.margin.top + (i / gridLines) * this.chartHeight;
      renderer.beginPath();
      renderer.moveTo(this.margin.left, y);
      renderer.lineTo(this.margin.left + this.chartWidth, y);
      renderer.stroke();
    }

    // Vertical grid lines (for non-pie charts)
    if (this.type !== 'pie') {
      const verticalLines =
        this.type === 'bar'
          ? this.processedData[0].values.length
          : Math.min(10, this.processedData[0].values.length);

      for (let i = 0; i <= verticalLines; i++) {
        const x = this.margin.left + (i / verticalLines) * this.chartWidth;
        renderer.beginPath();
        renderer.moveTo(x, this.margin.top);
        renderer.lineTo(x, this.margin.top + this.chartHeight);
        renderer.stroke();
      }
    }

    renderer.setLineDash([]);
  }

  /**
   * Renders axes with labels
   * @param {CanvasRenderingContext2D} renderer
   */
  renderAxes(renderer) {
    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_400;
    renderer.lineWidth = 2;

    // Y-axis
    renderer.beginPath();
    renderer.moveTo(this.margin.left, this.margin.top);
    renderer.lineTo(this.margin.left, this.margin.top + this.chartHeight);
    renderer.stroke();

    // X-axis
    renderer.beginPath();
    renderer.moveTo(this.margin.left, this.margin.top + this.chartHeight);
    renderer.lineTo(
      this.margin.left + this.chartWidth,
      this.margin.top + this.chartHeight
    );
    renderer.stroke();

    // Y-axis labels
    renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_700;
    renderer.font = '12px Arial';
    renderer.textAlign = 'right';
    renderer.textBaseline = 'middle';

    const ySteps = 5;
    for (let i = 0; i <= ySteps; i++) {
      const value =
        this.minValue + (i / ySteps) * (this.maxValue - this.minValue);
      const y =
        this.margin.top + this.chartHeight - (i / ySteps) * this.chartHeight;
      renderer.fillText(value.toFixed(1), this.margin.left - 10, y);
    }

    // X-axis labels (for applicable chart types)
    if (this.labels.length > 0) {
      renderer.textAlign = 'center';
      renderer.textBaseline = 'top';

      this.labels.forEach((label, index) => {
        const x =
          this.margin.left +
          (index / (this.labels.length - 1)) * this.chartWidth;
        const y = this.margin.top + this.chartHeight + 10;
        renderer.fillText(label, x, y);
      });
    }
  }

  /**
   * Renders line chart
   * @param {CanvasRenderingContext2D} renderer
   */
  renderLineChart(renderer) {
    this.processedData.forEach((series, _seriesIndex) => {
      if (!series.visible) return;

      renderer.strokeStyle = series.color;
      renderer.lineWidth = 3;
      renderer.lineCap = 'round';
      renderer.lineJoin = 'round';
      renderer.globalAlpha =
        series.opacity * (this.animated ? this.animationProgress : 1);

      renderer.beginPath();

      series.values.forEach((value, index) => {
        const x = this.margin.left + index * this.xScale;
        const y =
          this.margin.top +
          this.chartHeight -
          (value - this.minValue) * this.yScale;

        if (index === 0) {
          renderer.moveTo(x, y);
        } else {
          renderer.lineTo(x, y);
        }
      });

      renderer.stroke();

      // Render data points
      series.values.forEach((value, index) => {
        const x = this.margin.left + index * this.xScale;
        const y =
          this.margin.top +
          this.chartHeight -
          (value - this.minValue) * this.yScale;

        renderer.fillStyle = series.color;
        renderer.beginPath();
        renderer.arc(
          x,
          y,
          COMPONENT_CONSTANTS.CHART_POINT_RADIUS,
          0,
          2 * Math.PI
        );
        renderer.fill();

        // Highlight selected points
        const dataPoint = {
          series: series.label,
          index,
          value,
          x: x - this.margin.left,
          y: y - this.margin.top,
        };

        if (this.selectedDataPoints.has(dataPoint)) {
          renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
          renderer.lineWidth = 2;
          renderer.stroke();
        }
      });

      renderer.globalAlpha = 1;
    });
  }

  /**
   * Renders area chart
   * @param {CanvasRenderingContext2D} renderer
   */
  renderAreaChart(renderer) {
    this.processedData.forEach((series, _seriesIndex) => {
      if (!series.visible) return;

      // Fill area
      renderer.fillStyle = series.color;
      renderer.globalAlpha =
        COMPONENT_CONSTANTS.CHART_OPACITY *
        series.opacity *
        (this.animated ? this.animationProgress : 1);

      renderer.beginPath();

      // Start from bottom-left
      renderer.moveTo(this.margin.left, this.margin.top + this.chartHeight);

      // Draw line
      series.values.forEach((value, index) => {
        const x = this.margin.left + index * this.xScale;
        const y =
          this.margin.top +
          this.chartHeight -
          (value - this.minValue) * this.yScale;
        renderer.lineTo(x, y);
      });

      // Close to bottom-right
      const lastX = this.margin.left + (series.values.length - 1) * this.xScale;
      renderer.lineTo(lastX, this.margin.top + this.chartHeight);
      renderer.closePath();
      renderer.fill();

      renderer.globalAlpha = 1;

      // Draw line on top
      this.renderLineChart(renderer);
    });
  }

  /**
   * Renders bar chart
   * @param {CanvasRenderingContext2D} renderer
   */
  renderBarChart(renderer) {
    const barWidth = this.chartWidth / this.processedData[0].values.length;
    const seriesBarWidth =
      (barWidth / this.processedData.length) *
      COMPONENT_CONSTANTS.CHART_BAR_WIDTH_RATIO;

    this.processedData.forEach((series, seriesIndex) => {
      if (!series.visible) return;

      renderer.fillStyle = series.color;
      renderer.globalAlpha =
        series.opacity * (this.animated ? this.animationProgress : 1);

      series.values.forEach((value, index) => {
        const x =
          this.margin.left + index * barWidth + seriesIndex * seriesBarWidth;
        const height = (value - this.minValue) * this.yScale;
        const y = this.margin.top + this.chartHeight - height;

        renderer.fillRect(x, y, seriesBarWidth, height);

        // Selection highlight
        const dataPoint = {
          series: series.label,
          index,
          value,
          x: x + seriesBarWidth / 2 - this.margin.left,
          y: y + height / 2 - this.margin.top,
        };

        if (this.selectedDataPoints.has(dataPoint)) {
          renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
          renderer.lineWidth = 3;
          renderer.strokeRect(x, y, seriesBarWidth, height);
        }
      });

      renderer.globalAlpha = 1;
    });
  }

  /**
   * Renders pie chart
   * @param {CanvasRenderingContext2D} renderer
   */
  renderPieChart(renderer) {
    const centerX = this.margin.left + this.chartWidth / 2;
    const centerY = this.margin.top + this.chartHeight / 2;

    this.processedData.forEach((slice, _index) => {
      if (!slice.visible) return;

      const animationRadius =
        this.radius * (this.animated ? this.animationProgress : 1);

      renderer.fillStyle = slice.color;
      renderer.globalAlpha = slice.opacity;

      renderer.beginPath();
      renderer.moveTo(centerX, centerY);
      renderer.arc(
        centerX,
        centerY,
        animationRadius,
        slice.startAngle,
        slice.endAngle
      );
      renderer.closePath();
      renderer.fill();

      // Slice border
      renderer.strokeStyle = UI_CONSTANTS.COLORS.WHITE;
      renderer.lineWidth = 2;
      renderer.stroke();

      // Selection highlight
      if (this.selectedDataPoints.has(slice)) {
        renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
        renderer.lineWidth = 4;
        renderer.stroke();
      }

      // Labels
      const labelAngle = (slice.startAngle + slice.endAngle) / 2;
      const labelRadius =
        animationRadius * COMPONENT_CONSTANTS.CHART_LABEL_RADIUS_RATIO;
      const labelX = centerX + Math.cos(labelAngle) * labelRadius;
      const labelY = centerY + Math.sin(labelAngle) * labelRadius;

      renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
      renderer.font = 'bold 12px Arial';
      renderer.textAlign = 'center';
      renderer.textBaseline = 'middle';
      renderer.fillText(`${slice.percentage.toFixed(1)}%`, labelX, labelY);

      renderer.globalAlpha = 1;
    });
  }

  /**
   * Renders scatter plot
   * @param {CanvasRenderingContext2D} renderer
   */
  renderScatterPlot(renderer) {
    this.processedData.forEach((point, _index) => {
      if (!point.visible) return;

      const x = this.margin.left + (point.x - this.minX) * this.xScale;
      const y =
        this.margin.top +
        this.chartHeight -
        (point.y - this.minY) * this.yScale;

      renderer.fillStyle = point.color;
      renderer.globalAlpha =
        point.opacity * (this.animated ? this.animationProgress : 1);

      renderer.beginPath();
      renderer.arc(
        x,
        y,
        COMPONENT_CONSTANTS.CHART_SCATTER_POINT_RADIUS,
        0,
        2 * Math.PI
      );
      renderer.fill();

      // Selection highlight
      if (this.selectedDataPoints.has(point)) {
        renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
        renderer.lineWidth = 3;
        renderer.stroke();
      }

      renderer.globalAlpha = 1;
    });
  }

  /**
   * Renders legend
   * @param {CanvasRenderingContext2D} renderer
   */
  renderLegend(renderer) {
    if (!this.legend) return;

    const { x, y, width, itemHeight, items } = this.legend;

    // Legend background
    renderer.fillStyle = 'rgba(255, 255, 255, 0.9)';
    renderer.fillRect(
      x,
      y,
      width,
      items.length * itemHeight + COMPONENT_CONSTANTS.CHART_LEGEND_ITEM_HEIGHT
    );

    renderer.strokeStyle = UI_CONSTANTS.COLORS.GRAY_300;
    renderer.lineWidth = 1;
    renderer.strokeRect(
      x,
      y,
      width,
      items.length * itemHeight + COMPONENT_CONSTANTS.CHART_LEGEND_ITEM_HEIGHT
    );

    // Legend items
    items.forEach((item, index) => {
      const itemY = y + 10 + index * itemHeight;

      // Color box
      renderer.fillStyle = item.color;
      renderer.fillRect(
        x + UI_CONSTANTS.SPACING.MD / 2,
        itemY + UI_CONSTANTS.SPACING.XS,
        COMPONENT_CONSTANTS.CHART_LEGEND_INDICATOR_SIZE,
        COMPONENT_CONSTANTS.CHART_LEGEND_INDICATOR_HEIGHT
      );

      // Label
      renderer.fillStyle = item.visible
        ? UI_CONSTANTS.COLORS.GRAY_900
        : UI_CONSTANTS.COLORS.GRAY_400;
      renderer.font = '12px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';
      renderer.fillText(
        item.label,
        x + COMPONENT_CONSTANTS.CHART_LEGEND_TEXT_OFFSET,
        itemY + UI_CONSTANTS.SPACING.MD / 2
      );
    });
  }

  /**
   * Renders tooltip
   * @param {CanvasRenderingContext2D} renderer
   */
  renderTooltip(renderer) {
    if (!this.tooltip || !this.tooltip.visible) return;

    const { x, y, content } = this.tooltip;

    // Measure text
    renderer.font = '12px Arial';
    const textWidth = renderer.measureText(content).width;
    const padding = 8;
    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight =
      COMPONENT_CONSTANTS.CHART_TOOLTIP_HEIGHT + padding * 2;

    // Tooltip background
    renderer.fillStyle = 'rgba(0, 0, 0, 0.8)';
    UIUtils.fillRoundedRect(
      renderer,
      x,
      y,
      tooltipWidth,
      tooltipHeight,
      COMPONENT_CONSTANTS.CHART_TOOLTIP_RADIUS
    );

    // Tooltip text
    renderer.fillStyle = UI_CONSTANTS.COLORS.WHITE;
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';
    renderer.fillText(content, x + padding, y + tooltipHeight / 2);
  }

  /**
   * Updates accessibility attributes
   */
  updateAccessibilityAttributes() {
    this.ariaLabel = this.getAccessibilityDescription();
  }

  /**
   * Gets accessibility description
   * @returns {string}
   */
  getAccessibilityDescription() {
    const dataCount =
      this.type === 'pie'
        ? this.processedData.length
        : this.processedData.reduce(
            (sum, series) => sum + series.values.length,
            0
          );

    return (
      `${this.type} chart titled "${this.title}" with ${dataCount} data points. ` +
      `${this.subtitle ? `${this.subtitle} ` : ''}` +
      `Interactive: ${this.interactive ? 'yes' : 'no'}.`
    );
  }

  /**
   * Default error handler
   * @param {Error} error
   * @param {string} context
   */
  defaultErrorHandler(error, context) {
    UIUtils.debugLog('error', `Chart error in ${context}`, error);
    this.emit('error', { error, context, component: 'Chart' });
  }

  /**
   * Enhanced destroy method with cleanup
   */
  destroy() {
    try {
      // Stop any running animations
      this.stopAnimations();

      // Clean up data
      this.processedData = null;
      this.selectedDataPoints.clear();
      this.hoveredDataPoint = null;

      super.destroy();
    } catch (error) {
      this.errorHandler(error, 'destroy');
    }
  }
}

// ===== FORM COMPONENTS =====
class FormField extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || COMPONENT_CONSTANTS.DEFAULT_FORM_WIDTH,
      height: options.height || COMPONENT_CONSTANTS.DEFAULT_FORM_HEIGHT,
      ariaRole: 'group',
    });

    this.label = options.label || '';
    this.type = options.type || 'text'; // 'text', 'number', 'email', 'password', 'textarea', 'select', 'checkbox', 'radio'
    this.value = options.value || '';
    this.placeholder = options.placeholder || '';
    this.required = options.required || false;
    this.disabled = options.disabled || false;
    this.readonly = options.readonly || false;
    this.maxLength = options.maxLength || null;
    this.minLength = options.minLength || null;
    this.pattern = options.pattern || null;
    this.options = options.options || []; // For select, radio, checkbox
    this.multiSelect = options.multiSelect || false;
    this.validation = options.validation || null;
    this.validateOnChange = options.validateOnChange !== false;
    this.validateOnBlur = options.validateOnBlur !== false;
    this.showCharacterCount = options.showCharacterCount || false;
    this.helpText = options.helpText || '';

    // State management
    this.isValid = true;
    this.errorMessage = '';
    this.warningMessage = '';
    this.successMessage = '';
    this.isFocused = false;
    this.isDirty = false;
    this.isTouched = false;
    this.isAnimating = false;

    // Enhanced validation
    this.validationRules = new Map();
    this.asyncValidation = options.asyncValidation || null;
    this.validationDebounceTime =
      options.validationDebounceTime ||
      COMPONENT_CONSTANTS.VALIDATION_DEBOUNCE_TIME;
    this.validationTimer = null;

    // Accessibility
    this.ariaDescribedBy = [];
    this.fieldId = options.fieldId || `field-${this.id}`;
    this.errorId = `${this.fieldId}-error`;
    this.helpId = `${this.fieldId}-help`;

    // Performance and error handling
    this.errorHandler =
      options.errorHandler || this.defaultErrorHandler.bind(this);
    this.lastRenderTime = 0;
    this.renderCount = 0;

    this.setupField();
    this.setupValidation();
    this.bindEvents();
  }

  /**
   * Sets up the form field with initial configuration
   */
  setupField() {
    try {
      // Process options for select/radio/checkbox types
      if (['select', 'radio', 'checkbox'].includes(this.type)) {
        this.processOptions();
      }

      // Set initial accessibility attributes
      this.updateAccessibilityAttributes();

      // Initialize validation state
      if (this.validateOnChange) {
        this.validate();
      }
    } catch (error) {
      this.errorHandler(error, 'setupField');
    }
  }

  /**
   * Sets up validation rules
   */
  setupValidation() {
    try {
      // Built-in validation rules
      if (this.required) {
        this.addValidationRule('required', value => {
          if (this.type === 'checkbox') {
            return {
              isValid: value === true,
              message: 'This field is required',
            };
          }
          const isEmpty = !value || value.toString().trim() === '';
          return { isValid: !isEmpty, message: 'This field is required' };
        });
      }

      if (this.minLength !== null) {
        this.addValidationRule('minLength', value => {
          const length = value ? value.toString().length : 0;
          return {
            isValid: length >= this.minLength,
            message: `Minimum length is ${this.minLength} characters`,
          };
        });
      }

      if (this.maxLength !== null) {
        this.addValidationRule('maxLength', value => {
          const length = value ? value.toString().length : 0;
          return {
            isValid: length <= this.maxLength,
            message: `Maximum length is ${this.maxLength} characters`,
          };
        });
      }

      if (this.pattern) {
        this.addValidationRule('pattern', value => {
          if (!value) return { isValid: true, message: '' };
          const regex = new RegExp(this.pattern);
          return {
            isValid: regex.test(value.toString()),
            message: 'Please enter a valid format',
          };
        });
      }

      // Type-specific validation
      switch (this.type) {
        case 'email':
          this.addValidationRule('email', value => {
            if (!value) return { isValid: true, message: '' };
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            return {
              isValid: emailRegex.test(value),
              message: 'Please enter a valid email address',
            };
          });
          break;

        case 'number':
          this.addValidationRule('number', value => {
            if (!value) return { isValid: true, message: '' };
            const isValid = !isNaN(value) && isFinite(value);
            return {
              isValid,
              message: 'Please enter a valid number',
            };
          });
          break;
      }
    } catch (error) {
      this.errorHandler(error, 'setupValidation');
    }
  }

  /**
   * Binds event handlers
   */
  bindEvents() {
    try {
      this.on('focus', () => this.handleFocus());
      this.on('blur', () => this.handleBlur());
      this.on('input', event => this.handleFieldInput(event));
      this.on('change', event => this.handleChange(event));
      this.on('keyDown', event => this.handleKeyDown(event));
    } catch (error) {
      this.errorHandler(error, 'bindEvents');
    }
  }

  /**
   * Processes options for select/radio/checkbox types
   */
  processOptions() {
    this.processedOptions = this.options.map((option, index) => {
      if (typeof option === 'string') {
        return {
          value: option,
          label: option,
          disabled: false,
          selected: false,
          id: `${this.fieldId}-option-${index}`,
        };
      } else {
        return {
          value: option.value,
          label: option.label || option.value,
          disabled: option.disabled || false,
          selected: option.selected || false,
          id: `${this.fieldId}-option-${index}`,
          ...option,
        };
      }
    });
  }

  /**
   * Adds a validation rule
   * @param {string} name
   * @param {Function} validator
   */
  addValidationRule(name, validator) {
    this.validationRules.set(name, validator);
  }

  /**
   * Removes a validation rule
   * @param {string} name
   */
  removeValidationRule(name) {
    this.validationRules.delete(name);
  }

  /**
   * Sets the field value with validation
   * @param {any} newValue
   * @param {boolean} skipValidation
   */
  setValue(newValue, skipValidation = false) {
    try {
      const oldValue = this.value;
      this.value = newValue;
      this.isDirty = true;

      if (!skipValidation && this.validateOnChange) {
        this.debouncedValidate();
      }

      this.emit('change', {
        value: newValue,
        oldValue,
        isValid: this.isValid,
        field: this,
      });

      // Update character count if enabled
      if (this.showCharacterCount) {
        this.updateCharacterCount();
      }
    } catch (error) {
      this.errorHandler(error, 'setValue');
    }
  }

  /**
   * Validates the field value
   * @returns {boolean} Is valid
   */
  async validate() {
    try {
      this.clearMessages();
      let isValid = true;
      let firstErrorMessage = '';

      // Run synchronous validation rules
      for (const [name, validator] of this.validationRules) {
        try {
          const result = validator(this.value);
          if (!result.isValid) {
            isValid = false;
            if (!firstErrorMessage) {
              firstErrorMessage = result.message;
            }
          }
        } catch (error) {
          UIUtils.debugLog('warn', `Validation rule '${name}' failed`, error);
        }
      }

      // Run custom validation if provided
      if (this.validation && typeof this.validation === 'function') {
        try {
          const result = this.validation(this.value, this);
          if (result && !result.isValid) {
            isValid = false;
            if (!firstErrorMessage) {
              firstErrorMessage = result.message || 'Invalid value';
            }
          }
        } catch (error) {
          UIUtils.debugLog('warn', 'Custom validation failed', error);
          isValid = false;
          if (!firstErrorMessage) {
            firstErrorMessage = 'Validation error occurred';
          }
        }
      }

      // Run async validation if provided
      if (this.asyncValidation && typeof this.asyncValidation === 'function') {
        try {
          const result = await this.asyncValidation(this.value, this);
          if (result && !result.isValid) {
            isValid = false;
            if (!firstErrorMessage) {
              firstErrorMessage = result.message || 'Invalid value';
            }
          }
        } catch (error) {
          UIUtils.debugLog('warn', 'Async validation failed', error);
          isValid = false;
          if (!firstErrorMessage) {
            firstErrorMessage = 'Async validation error occurred';
          }
        }
      }

      this.isValid = isValid;
      this.errorMessage = firstErrorMessage;

      this.updateAccessibilityAttributes();
      this.emit('validation', {
        isValid: this.isValid,
        message: this.errorMessage,
        field: this,
      });

      return this.isValid;
    } catch (error) {
      this.errorHandler(error, 'validate');
      return false;
    }
  }

  /**
   * Debounced validation
   */
  debouncedValidate() {
    if (this.validationTimer) {
      clearTimeout(this.validationTimer);
    }

    this.validationTimer = setTimeout(() => {
      this.validate();
    }, this.validationDebounceTime);
  }

  /**
   * Clears all validation messages
   */
  clearMessages() {
    this.errorMessage = '';
    this.warningMessage = '';
    this.successMessage = '';
  }

  /**
   * Sets a success message
   * @param {string} message
   */
  setSuccessMessage(message) {
    this.clearMessages();
    this.successMessage = message;
    this.isValid = true;
  }

  /**
   * Sets a warning message
   * @param {string} message
   */
  setWarningMessage(message) {
    this.warningMessage = message;
  }

  /**
   * Sets an error message
   * @param {string} message
   */
  setErrorMessage(message) {
    this.clearMessages();
    this.errorMessage = message;
    this.isValid = false;
  }

  /**
   * Handles field focus
   */
  handleFocus() {
    try {
      this.isFocused = true;
      this.animateFocus(true);
      this.emit('fieldFocus', { field: this });
    } catch (error) {
      this.errorHandler(error, 'handleFocus');
    }
  }

  /**
   * Handles field blur
   */
  handleBlur() {
    try {
      this.isFocused = false;
      this.isTouched = true;
      this.animateFocus(false);

      if (this.validateOnBlur) {
        this.validate();
      }

      this.emit('fieldBlur', { field: this });
    } catch (error) {
      this.errorHandler(error, 'handleBlur');
    }
  }

  /**
   * Handles field value input events (internal event handling)
   * @param {Object} event
   */
  handleFieldInput(event) {
    try {
      const newValue = event.value;
      this.setValue(newValue);
    } catch (error) {
      this.errorHandler(error, 'handleFieldInput');
    }
  }

  /**
   * Handles change events
   * @param {Object} event
   */
  handleChange(event) {
    try {
      // For certain field types, change might be different from input
      if (this.type === 'select' || this.type === 'radio') {
        this.setValue(event.value);
      }
    } catch (error) {
      this.errorHandler(error, 'handleChange');
    }
  }

  /**
   * Handles keyboard events
   * @param {Object} event
   */
  handleKeyDown(event) {
    try {
      switch (event.key) {
        case 'Enter':
          if (this.type === 'textarea') {
            // Allow line breaks in textarea
            return;
          }
          event.preventDefault();
          this.emit('submit', { field: this, value: this.value });
          break;

        case 'Escape':
          this.blur();
          break;

        case 'Tab':
          // Allow natural tab navigation
          break;

        default:
          // Handle type-specific key behaviors
          this.handleTypeSpecificKeys(event);
          break;
      }
    } catch (error) {
      this.errorHandler(error, 'handleKeyDown');
    }
  }

  /**
   * Handles type-specific key behaviors
   * @param {Object} event
   */
  handleTypeSpecificKeys(event) {
    switch (this.type) {
      case 'number':
        // Only allow numeric input
        if (
          !/[0-9\-+.,]/.test(event.key) &&
          ![
            'Backspace',
            'Delete',
            'ArrowLeft',
            'ArrowRight',
            'Home',
            'End',
          ].includes(event.key)
        ) {
          event.preventDefault();
        }
        break;

      case 'select':
      case 'radio':
        this.handleSelectableKeyDown(event);
        break;
    }
  }

  /**
   * Handles keyboard navigation for selectable fields
   * @param {Object} event
   */
  handleSelectableKeyDown(event) {
    if (!this.processedOptions || this.processedOptions.length === 0) return;

    const currentIndex = this.processedOptions.findIndex(
      opt => opt.value === this.value
    );
    let newIndex = currentIndex;

    switch (event.key) {
      case 'ArrowDown':
        event.preventDefault();
        newIndex = Math.min(currentIndex + 1, this.processedOptions.length - 1);
        break;

      case 'ArrowUp':
        event.preventDefault();
        newIndex = Math.max(currentIndex - 1, 0);
        break;

      case 'Home':
        event.preventDefault();
        newIndex = 0;
        break;

      case 'End':
        event.preventDefault();
        newIndex = this.processedOptions.length - 1;
        break;
    }

    if (
      newIndex !== currentIndex &&
      !this.processedOptions[newIndex].disabled
    ) {
      this.setValue(this.processedOptions[newIndex].value);
    }
  }

  /**
   * Updates character count display
   */
  updateCharacterCount() {
    if (!this.showCharacterCount) return;

    const currentLength = this.value ? this.value.toString().length : 0;
    this.characterCount = {
      current: currentLength,
      max: this.maxLength,
      remaining: this.maxLength ? this.maxLength - currentLength : null,
    };
  }

  /**
   * Animates focus state
   * @param {boolean} focused
   */
  animateFocus(focused) {
    if (!this.animationsEnabled) return;

    this.isAnimating = true;

    const targetScale = focused ? COMPONENT_CONSTANTS.FOCUS_SCALE : 1;
    this.animate(
      'focusScale',
      targetScale,
      COMPONENT_CONSTANTS.ANIMATION_NORMAL,
      {
        from: this.focusScale || 1,
        easing: EASING_FUNCTIONS.EASE_OUT_QUAD,
        onComplete: () => {
          this.isAnimating = false;
        },
      }
    );
  }

  /**
   * Updates accessibility attributes
   */
  updateAccessibilityAttributes() {
    this.ariaDescribedBy = [];

    if (this.helpText) {
      this.ariaDescribedBy.push(this.helpId);
    }

    if (!this.isValid && this.errorMessage) {
      this.ariaDescribedBy.push(this.errorId);
    }

    this.ariaInvalid = !this.isValid;
    this.ariaRequired = this.required;
    this.ariaDisabled = this.disabled;
    this.ariaReadonly = this.readonly;
  }

  /**
   * Enhanced input handling for mouse and touch events
   * @param {string} eventType
   * @param {Object} eventData
   * @returns {boolean}
   */
  handleInput(eventType, eventData) {
    try {
      if (!this.visible || this.disabled) return false;

      const inBounds = this.containsPoint(eventData.x, eventData.y);

      switch (eventType) {
        case 'mousedown':
        case 'touchstart':
          if (inBounds) {
            this.focus();
            return true;
          }
          break;

        case 'mousemove':
          // Handle hover states for interactive elements
          if (this.type === 'select' && this.processedOptions) {
            this.updateOptionHover(eventData);
          }
          break;
      }

      return super.handleInput(eventType, eventData);
    } catch (error) {
      this.errorHandler(error, 'handleInput');
      return false;
    }
  }

  /**
   * Updates hover state for options
   * @param {Object} eventData
   */
  updateOptionHover(_eventData) {
    // Implementation for hovering over select options
    // This would be used in dropdown rendering
  }

  /**
   * Enhanced canvas rendering with modern styling
   * @param {CanvasRenderingContext2D} renderer
   */
  renderSelf(renderer) {
    if (renderer.type !== 'canvas' || !this.visible) return;

    try {
      const startTime = performance.now();

      // Render based on field type
      switch (this.type) {
        case 'text':
        case 'email':
        case 'password':
        case 'number':
          this.renderTextInput(renderer);
          break;

        case 'textarea':
          this.renderTextarea(renderer);
          break;

        case 'select':
          this.renderSelect(renderer);
          break;

        case 'checkbox':
          this.renderCheckbox(renderer);
          break;

        case 'radio':
          this.renderRadioGroup(renderer);
          break;
      }

      // Render label
      this.renderLabel(renderer);

      // Render messages
      this.renderMessages(renderer);

      // Render character count if enabled
      if (this.showCharacterCount && this.characterCount) {
        this.renderCharacterCount(renderer);
      }

      // Render focus ring if focused
      if (this.isFocused && !this.disabled) {
        this.renderFocusRing(renderer);
      }

      // Performance tracking
      const renderTime = performance.now() - startTime;
      this.lastRenderTime = renderTime;
      this.renderCount++;

      if (renderTime > COMPONENT_CONSTANTS.PERFORMANCE_THRESHOLD) {
        UIUtils.debugLog(
          'warn',
          `FormField render took ${renderTime.toFixed(2)}ms`
        );
      }
    } catch (error) {
      this.errorHandler(error, 'renderSelf');
    }
  }

  /**
   * Renders text input field
   * @param {CanvasRenderingContext2D} renderer
   */
  renderTextInput(renderer) {
    const fieldY = this.label ? COMPONENT_CONSTANTS.FORM_LABEL_HEIGHT : 0;
    const fieldHeight =
      this.height -
      fieldY -
      (this.errorMessage || this.helpText
        ? COMPONENT_CONSTANTS.FORM_HELP_HEIGHT
        : 0);

    // Field background
    let bgColor = this.disabled
      ? UI_CONSTANTS.COLORS.GRAY_100
      : UI_CONSTANTS.COLORS.WHITE;
    if (this.readonly) {
      bgColor = UI_CONSTANTS.COLORS.GRAY_50;
    }

    const scale = this.focusScale || 1;
    const scaledWidth = this.width * scale;
    const scaledHeight = fieldHeight * scale;
    const offsetX = (this.width - scaledWidth) / 2;
    const offsetY = (fieldHeight - scaledHeight) / 2;

    renderer.fillStyle = bgColor;
    renderer.fillRect(offsetX, fieldY + offsetY, scaledWidth, scaledHeight);

    // Border
    let borderColor = UI_CONSTANTS.COLORS.GRAY_300;
    let borderWidth = 1;

    if (!this.isValid) {
      borderColor = UI_CONSTANTS.COLORS.DANGER;
      borderWidth = 2;
    } else if (this.isFocused) {
      borderColor = UI_CONSTANTS.COLORS.PRIMARY;
      borderWidth = 2;
    } else if (this.successMessage) {
      borderColor = UI_CONSTANTS.COLORS.SUCCESS;
    } else if (this.warningMessage) {
      borderColor = UI_CONSTANTS.COLORS.WARNING;
    }

    renderer.strokeStyle = borderColor;
    renderer.lineWidth = borderWidth;
    renderer.strokeRect(offsetX, fieldY + offsetY, scaledWidth, scaledHeight);

    // Value text or placeholder
    const displayValue = this.value || this.placeholder;
    const isPlaceholder = !this.value && this.placeholder;

    if (displayValue) {
      renderer.fillStyle = this.disabled
        ? UI_CONSTANTS.COLORS.GRAY_400
        : isPlaceholder
          ? UI_CONSTANTS.COLORS.GRAY_500
          : UI_CONSTANTS.COLORS.GRAY_900;

      renderer.font = `${isPlaceholder ? 'italic ' : ''}14px Arial`;
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';

      // Handle password masking
      const textToRender =
        this.type === 'password' && this.value
          ? '•'.repeat(this.value.length)
          : displayValue;

      // Truncate text if too long
      const padding = UI_CONSTANTS.SPACING.SM;
      const maxWidth = scaledWidth - padding * 2;
      const truncatedText = UIUtils.truncateText(
        textToRender,
        maxWidth,
        renderer.font,
        renderer
      );

      renderer.fillText(
        truncatedText,
        offsetX + padding,
        fieldY + offsetY + scaledHeight / 2
      );
    }

    // Cursor (if focused and not readonly)
    if (this.isFocused && !this.readonly && !this.disabled) {
      this.renderCursor(renderer, offsetX, fieldY + offsetY, scaledHeight);
    }
  }

  /**
   * Renders textarea field
   * @param {CanvasRenderingContext2D} renderer
   */
  renderTextarea(renderer) {
    // Similar to text input but with multi-line support
    this.renderTextInput(renderer);

    // TODO: Implement multi-line text rendering
    // This would require text wrapping and line management
  }

  /**
   * Renders select dropdown field
   * @param {CanvasRenderingContext2D} renderer
   */
  renderSelect(renderer) {
    const fieldY = this.label ? COMPONENT_CONSTANTS.FORM_LABEL_HEIGHT : 0;
    const fieldHeight =
      this.height -
      fieldY -
      (this.errorMessage || this.helpText
        ? COMPONENT_CONSTANTS.FORM_HELP_HEIGHT
        : 0);

    // Render as text input first
    this.renderTextInput(renderer);

    // Add dropdown arrow
    const arrowSize = 8;
    const arrowX = this.width - UI_CONSTANTS.SPACING.SM - arrowSize;
    const arrowY = fieldY + fieldHeight / 2;

    renderer.fillStyle = this.disabled
      ? UI_CONSTANTS.COLORS.GRAY_400
      : UI_CONSTANTS.COLORS.GRAY_600;

    renderer.beginPath();
    renderer.moveTo(arrowX, arrowY - arrowSize / 2);
    renderer.lineTo(arrowX + arrowSize, arrowY - arrowSize / 2);
    renderer.lineTo(arrowX + arrowSize / 2, arrowY + arrowSize / 2);
    renderer.closePath();
    renderer.fill();
  }

  /**
   * Renders checkbox field
   * @param {CanvasRenderingContext2D} renderer
   */
  renderCheckbox(renderer) {
    const checkboxSize = COMPONENT_CONSTANTS.CHECKBOX_SIZE;
    const checkboxY = this.label
      ? COMPONENT_CONSTANTS.FORM_LABEL_HEIGHT
      : (this.height - checkboxSize) / 2;

    // Checkbox background
    renderer.fillStyle = this.disabled
      ? UI_CONSTANTS.COLORS.GRAY_100
      : UI_CONSTANTS.COLORS.WHITE;
    renderer.fillRect(0, checkboxY, checkboxSize, checkboxSize);

    // Checkbox border
    let borderColor = UI_CONSTANTS.COLORS.GRAY_300;
    if (!this.isValid) {
      borderColor = UI_CONSTANTS.COLORS.DANGER;
    } else if (this.isFocused) {
      borderColor = UI_CONSTANTS.COLORS.PRIMARY;
    }

    renderer.strokeStyle = borderColor;
    renderer.lineWidth = this.isFocused ? 2 : 1;
    renderer.strokeRect(0, checkboxY, checkboxSize, checkboxSize);

    // Checkbox check mark
    if (this.value === true) {
      renderer.strokeStyle = UI_CONSTANTS.COLORS.PRIMARY;
      renderer.lineWidth = 2;
      renderer.lineCap = 'round';

      renderer.beginPath();
      renderer.moveTo(
        COMPONENT_CONSTANTS.CHECKBOX_CHECK_MARGIN,
        checkboxY + checkboxSize / 2
      );
      renderer.lineTo(
        checkboxSize / 2,
        checkboxY + checkboxSize - COMPONENT_CONSTANTS.CHECKBOX_CHECK_OFFSET
      );
      renderer.lineTo(
        checkboxSize - COMPONENT_CONSTANTS.CHECKBOX_CHECK_MARGIN,
        checkboxY + COMPONENT_CONSTANTS.CHECKBOX_CHECK_OFFSET
      );
      renderer.stroke();
    }

    // Label text (to the right of checkbox)
    if (this.label) {
      renderer.fillStyle = this.disabled
        ? UI_CONSTANTS.COLORS.GRAY_400
        : UI_CONSTANTS.COLORS.GRAY_900;
      renderer.font = '14px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';
      renderer.fillText(
        this.label,
        checkboxSize + UI_CONSTANTS.SPACING.SM,
        checkboxY + checkboxSize / 2
      );
    }
  }

  /**
   * Renders radio button group
   * @param {CanvasRenderingContext2D} renderer
   */
  renderRadioGroup(renderer) {
    if (!this.processedOptions) return;

    const radioSize = 18;
    const spacing = 25;
    const currentY = this.label ? COMPONENT_CONSTANTS.FORM_LABEL_HEIGHT : 0;

    this.processedOptions.forEach((option, index) => {
      const radioY = currentY + index * spacing;
      const isSelected = this.value === option.value;

      // Radio background
      renderer.fillStyle = option.disabled
        ? UI_CONSTANTS.COLORS.GRAY_100
        : UI_CONSTANTS.COLORS.WHITE;
      renderer.beginPath();
      renderer.arc(
        radioSize / 2,
        radioY + radioSize / 2,
        radioSize / 2,
        0,
        2 * Math.PI
      );
      renderer.fill();

      // Radio border
      let borderColor = UI_CONSTANTS.COLORS.GRAY_300;
      if (!this.isValid) {
        borderColor = UI_CONSTANTS.COLORS.DANGER;
      } else if (this.isFocused && isSelected) {
        borderColor = UI_CONSTANTS.COLORS.PRIMARY;
      }

      renderer.strokeStyle = borderColor;
      renderer.lineWidth = this.isFocused && isSelected ? 2 : 1;
      renderer.stroke();

      // Radio selection
      if (isSelected) {
        renderer.fillStyle = UI_CONSTANTS.COLORS.PRIMARY;
        renderer.beginPath();
        renderer.arc(
          radioSize / 2,
          radioY + radioSize / 2,
          radioSize / COMPONENT_CONSTANTS.RADIO_CHECK_RADIUS_DIVISOR,
          0,
          2 * Math.PI
        );
        renderer.fill();
      }

      // Option label
      renderer.fillStyle = option.disabled
        ? UI_CONSTANTS.COLORS.GRAY_400
        : UI_CONSTANTS.COLORS.GRAY_900;
      renderer.font = '14px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'middle';
      renderer.fillText(
        option.label,
        radioSize + UI_CONSTANTS.SPACING.SM,
        radioY + radioSize / 2
      );
    });
  }

  /**
   * Renders field label
   * @param {CanvasRenderingContext2D} renderer
   */
  renderLabel(renderer) {
    if (!this.label || this.type === 'checkbox') return; // Checkbox renders label differently

    renderer.fillStyle = this.disabled
      ? UI_CONSTANTS.COLORS.GRAY_400
      : UI_CONSTANTS.COLORS.GRAY_700;
    renderer.font = `${this.required ? 'bold ' : ''}12px Arial`;
    renderer.textAlign = 'left';
    renderer.textBaseline = 'top';

    let labelText = this.label;
    if (this.required) {
      labelText += ' *';
    }

    renderer.fillText(labelText, 0, 0);
  }

  /**
   * Renders validation and help messages
   * @param {CanvasRenderingContext2D} renderer
   */
  renderMessages(renderer) {
    const messageY = this.height - COMPONENT_CONSTANTS.FORM_MESSAGE_Y_OFFSET;

    if (this.errorMessage) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.DANGER;
      renderer.font = '11px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'top';
      renderer.fillText(this.errorMessage, 0, messageY);
    } else if (this.successMessage) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.SUCCESS;
      renderer.font = '11px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'top';
      renderer.fillText(this.successMessage, 0, messageY);
    } else if (this.warningMessage) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.WARNING;
      renderer.font = '11px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'top';
      renderer.fillText(this.warningMessage, 0, messageY);
    } else if (this.helpText) {
      renderer.fillStyle = UI_CONSTANTS.COLORS.GRAY_500;
      renderer.font = '11px Arial';
      renderer.textAlign = 'left';
      renderer.textBaseline = 'top';
      renderer.fillText(this.helpText, 0, messageY);
    }
  }

  /**
   * Renders character count
   * @param {CanvasRenderingContext2D} renderer
   */
  renderCharacterCount(renderer) {
    if (!this.characterCount) return;

    const countText = this.characterCount.max
      ? `${this.characterCount.current}/${this.characterCount.max}`
      : this.characterCount.current.toString();

    const isOverLimit =
      this.characterCount.max &&
      this.characterCount.current > this.characterCount.max;

    renderer.fillStyle = isOverLimit
      ? UI_CONSTANTS.COLORS.DANGER
      : UI_CONSTANTS.COLORS.GRAY_500;
    renderer.font = '10px Arial';
    renderer.textAlign = 'right';
    renderer.textBaseline = 'top';
    renderer.fillText(
      countText,
      this.width,
      this.height - COMPONENT_CONSTANTS.FORM_COUNT_Y_OFFSET
    );
  }

  /**
   * Renders text cursor
   * @param {CanvasRenderingContext2D} renderer
   * @param {number} x
   * @param {number} y
   * @param {number} height
   */
  renderCursor(renderer, x, y, height) {
    // Simple blinking cursor
    const cursorX =
      x +
      UI_CONSTANTS.SPACING.SM +
      (this.value ? renderer.measureText(this.value).width : 0);

    renderer.strokeStyle = UI_CONSTANTS.COLORS.PRIMARY;
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(cursorX, y + COMPONENT_CONSTANTS.FORM_CURSOR_OFFSET);
    renderer.lineTo(
      cursorX,
      y + height - COMPONENT_CONSTANTS.FORM_CURSOR_OFFSET
    );
    renderer.stroke();
  }

  /**
   * Renders focus ring
   * @param {CanvasRenderingContext2D} renderer
   */
  renderFocusRing(renderer) {
    const fieldY = this.label ? COMPONENT_CONSTANTS.FORM_LABEL_HEIGHT : 0;
    const fieldHeight =
      this.height -
      fieldY -
      (this.errorMessage || this.helpText
        ? COMPONENT_CONSTANTS.FORM_HELP_HEIGHT
        : 0);

    renderer.strokeStyle = UI_CONSTANTS.COLORS.WARNING;
    renderer.lineWidth = FOCUS_RING_WIDTH;
    renderer.setLineDash([2, 2]);
    renderer.strokeRect(
      -FOCUS_RING_WIDTH,
      fieldY - FOCUS_RING_WIDTH,
      this.width + FOCUS_RING_WIDTH * 2,
      fieldHeight + FOCUS_RING_WIDTH * 2
    );
    renderer.setLineDash([]);
  }

  /**
   * Gets accessibility description
   * @returns {string}
   */
  getAccessibilityDescription() {
    let description = `${this.type} field`;
    if (this.label) description += ` labeled "${this.label}"`;
    if (this.required) description += ', required';
    if (this.disabled) description += ', disabled';
    if (this.readonly) description += ', read-only';
    if (!this.isValid) description += ', invalid';
    return description;
  }

  /**
   * Default error handler
   * @param {Error} error
   * @param {string} context
   */
  defaultErrorHandler(error, context) {
    UIUtils.debugLog('error', `FormField error in ${context}`, error);
    this.emit('error', { error, context, component: 'FormField' });
  }

  /**
   * Enhanced destroy method with cleanup
   */
  destroy() {
    try {
      // Clear validation timer
      if (this.validationTimer) {
        clearTimeout(this.validationTimer);
      }

      // Stop any running animations
      this.stopAnimations();

      // Clear validation rules
      this.validationRules.clear();

      super.destroy();
    } catch (error) {
      this.errorHandler(error, 'destroy');
    }
  }
}

// ===== TOOLTIP SYSTEM =====
class Tooltip extends BaseObject {
  constructor(options = {}) {
    super({
      ...options,
      width: options.width || 'auto',
      height: options.height || 'auto',
      ariaRole: 'tooltip',
    });

    this.content = options.content || '';
    this.target = options.target || null;
    this.position = options.position || 'top'; // 'top', 'bottom', 'left', 'right', 'auto'
    this.showDelay =
      options.showDelay || COMPONENT_CONSTANTS.TOOLTIP_SHOW_DELAY;
    this.hideDelay =
      options.hideDelay || COMPONENT_CONSTANTS.TOOLTIP_HIDE_DELAY;
    this.offset = options.offset || 10;
    this.maxWidth = options.maxWidth || COMPONENT_CONSTANTS.TOOLTIP_MAX_WIDTH;
    this.theme = options.theme || 'dark'; // 'dark', 'light', 'custom'
    this.allowHtml = options.allowHtml || false;
    this.interactive = options.interactive || false;
    this.followCursor = options.followCursor || false;
    this.persistent = options.persistent || false; // Stay open until explicitly closed
    this.arrow = options.arrow !== false;
    this.animation = options.animation || 'fade'; // 'fade', 'scale', 'slide', 'none'

    // State management
    this.isVisible = false;
    this.isAnimating = false;
    this.showTimer = null;
    this.hideTimer = null;
    this.currentPosition = this.position;
    this.calculatedDimensions = { width: 0, height: 0 };
    this.arrowPosition = { x: 0, y: 0, direction: 'up' };

    // Performance and accessibility
    this.errorHandler =
      options.errorHandler || this.defaultErrorHandler.bind(this);
    this.lastRenderTime = 0;
    this.renderCount = 0;

    // Auto-positioning boundaries
    this.viewportBounds = null;
    this.autoPositionPadding = 10;

    // Touch handling
    this.touchStartTime = 0;
    this.longPressDuration = 500;
    this.longPressTimer = null;

    this.setupTooltip();
    this.bindEvents();
  }

  /**
   * Sets up tooltip with initial configuration
   */
  setupTooltip() {
    try {
      if (this.target) {
        this.bindTargetEvents();
      }

      this.updateViewportBounds();
      this.calculateDimensions();
      this.updateAccessibilityAttributes();
    } catch (error) {
      this.errorHandler(error, 'setupTooltip');
    }
  }

  /**
   * Binds event handlers
   */
  bindEvents() {
    try {
      // Global events for positioning updates
      if (typeof window !== 'undefined') {
        window.addEventListener('resize', () => this.updateViewportBounds());
        window.addEventListener('scroll', () => this.updatePosition());
      }
    } catch (error) {
      this.errorHandler(error, 'bindEvents');
    }
  }

  /**
   * Binds events to target element
   */
  bindTargetEvents() {
    if (!this.target) return;

    try {
      // Mouse events
      this.target.on('mouseenter', event => this.handleTargetMouseEnter(event));
      this.target.on('mouseleave', event => this.handleTargetMouseLeave(event));
      this.target.on('mousemove', event => this.handleTargetMouseMove(event));

      // Touch events for mobile
      this.target.on('touchstart', event => this.handleTargetTouchStart(event));
      this.target.on('touchend', event => this.handleTargetTouchEnd(event));
      this.target.on('touchcancel', event =>
        this.handleTargetTouchCancel(event)
      );

      // Focus events for accessibility
      this.target.on('focus', () => this.handleTargetFocus());
      this.target.on('blur', () => this.handleTargetBlur());

      // Keyboard events
      this.target.on('keydown', event => this.handleTargetKeyDown(event));
    } catch (error) {
      this.errorHandler(error, 'bindTargetEvents');
    }
  }

  /**
   * Sets new content for the tooltip
   * @param {string} content
   */
  setContent(content) {
    try {
      this.content = content;
      this.calculateDimensions();

      if (this.isVisible) {
        this.updatePosition();
      }
    } catch (error) {
      this.errorHandler(error, 'setContent');
    }
  }

  /**
   * Sets new target for the tooltip
   * @param {Object} target
   */
  setTarget(target) {
    try {
      // Remove old target events
      if (this.target) {
        this.unbindTargetEvents();
      }

      this.target = target;

      if (target) {
        this.bindTargetEvents();
      }
    } catch (error) {
      this.errorHandler(error, 'setTarget');
    }
  }

  /**
   * Unbinds events from current target
   */
  unbindTargetEvents() {
    if (!this.target) return;

    // Remove all event listeners
    // This would depend on the event system implementation
    this.target.off('mouseenter');
    this.target.off('mouseleave');
    this.target.off('mousemove');
    this.target.off('touchstart');
    this.target.off('touchend');
    this.target.off('touchcancel');
    this.target.off('focus');
    this.target.off('blur');
    this.target.off('keydown');
  }

  /**
   * Calculates tooltip dimensions based on content
   */
  calculateDimensions() {
    try {
      if (!this.content) {
        this.calculatedDimensions = { width: 0, height: 0 };
        return;
      }

      // Create temporary canvas to measure text
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');

      ctx.font = this.getFont();

      // Split content into lines and measure
      const lines = this.wrapText(this.content, this.maxWidth, ctx);
      const lineHeight = this.getLineHeight();
      const padding = this.getPadding();

      const textWidth = Math.max(
        ...lines.map(line => ctx.measureText(line).width)
      );
      const textHeight = lines.length * lineHeight;

      this.calculatedDimensions = {
        width: Math.min(textWidth + padding.horizontal, this.maxWidth),
        height: textHeight + padding.vertical,
        lines,
      };

      // Update actual dimensions
      this.width = this.calculatedDimensions.width;
      this.height = this.calculatedDimensions.height;
    } catch (error) {
      this.errorHandler(error, 'calculateDimensions');
    }
  }

  /**
   * Wraps text to fit within max width
   * @param {string} text
   * @param {number} maxWidth
   * @param {CanvasRenderingContext2D} ctx
   * @returns {Array<string>}
   */
  wrapText(text, maxWidth, ctx) {
    const words = text.split(' ');
    const lines = [];
    let currentLine = '';

    for (const word of words) {
      const testLine = currentLine ? `${currentLine} ${word}` : word;
      const metrics = ctx.measureText(testLine);

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

    return lines;
  }

  /**
   * Gets font string for text measurement
   * @returns {string}
   */
  getFont() {
    return '12px Arial';
  }

  /**
   * Gets line height for text
   * @returns {number}
   */
  getLineHeight() {
    return COMPONENT_CONSTANTS.TOOLTIP_BASELINE_SIZE;
  }

  /**
   * Gets padding values
   * @returns {Object}
   */
  getPadding() {
    return {
      horizontal: UI_CONSTANTS.SPACING.SM * 2,
      vertical: UI_CONSTANTS.SPACING.XS * 2,
      top: UI_CONSTANTS.SPACING.XS,
      right: UI_CONSTANTS.SPACING.SM,
      bottom: UI_CONSTANTS.SPACING.XS,
      left: UI_CONSTANTS.SPACING.SM,
    };
  }

  /**
   * Updates viewport bounds for auto-positioning
   */
  updateViewportBounds() {
    try {
      if (typeof window !== 'undefined') {
        this.viewportBounds = {
          width: window.innerWidth,
          height: window.innerHeight,
          scrollX: window.scrollX || 0,
          scrollY: window.scrollY || 0,
        };
      } else {
        // Fallback for non-browser environments
        this.viewportBounds = {
          width: 1920,
          height: 1080,
          scrollX: 0,
          scrollY: 0,
        };
      }
    } catch (error) {
      this.errorHandler(error, 'updateViewportBounds');
    }
  }

  /**
   * Schedules tooltip to show
   * @param {Object} event
   */
  scheduleShow(event) {
    try {
      this.clearTimers();

      if (this.isVisible) return;

      this.showTimer = setTimeout(() => {
        this.show(event);
      }, this.showDelay);
    } catch (error) {
      this.errorHandler(error, 'scheduleShow');
    }
  }

  /**
   * Schedules tooltip to hide
   */
  scheduleHide() {
    try {
      this.clearTimers();

      if (!this.isVisible || this.persistent) return;

      this.hideTimer = setTimeout(() => {
        this.hide();
      }, this.hideDelay);
    } catch (error) {
      this.errorHandler(error, 'scheduleHide');
    }
  }

  /**
   * Clears all timers
   */
  clearTimers() {
    if (this.showTimer) {
      clearTimeout(this.showTimer);
      this.showTimer = null;
    }
    if (this.hideTimer) {
      clearTimeout(this.hideTimer);
      this.hideTimer = null;
    }
    if (this.longPressTimer) {
      clearTimeout(this.longPressTimer);
      this.longPressTimer = null;
    }
  }

  /**
   * Shows the tooltip with animation
   * @param {Object} event
   */
  show(event) {
    try {
      if (this.isVisible || this.isAnimating || !this.content) return;

      this.calculateDimensions();
      this.calculatePosition(event);

      this.isVisible = true;
      this.isAnimating = true;

      // Start entrance animation
      this.startEntranceAnimation();

      this.emit('show', { tooltip: this });
    } catch (error) {
      this.errorHandler(error, 'show');
    }
  }

  /**
   * Hides the tooltip with animation
   */
  hide() {
    try {
      if (!this.isVisible || this.isAnimating) return;

      this.isAnimating = true;

      // Start exit animation
      this.startExitAnimation().then(() => {
        this.isVisible = false;
        this.isAnimating = false;
        this.emit('hide', { tooltip: this });
      });
    } catch (error) {
      this.errorHandler(error, 'hide');
    }
  }

  /**
   * Toggles tooltip visibility
   */
  toggle(event) {
    if (this.isVisible) {
      this.hide();
    } else {
      this.show(event);
    }
  }

  /**
   * Calculates optimal position for tooltip
   * @param {Object} event
   */
  calculatePosition(event) {
    try {
      if (!this.target && !event) return;

      let targetBounds;

      if (this.followCursor && event) {
        // Position near cursor
        targetBounds = {
          x: event.x || event.clientX || 0,
          y: event.y || event.clientY || 0,
          width: 0,
          height: 0,
        };
      } else if (this.target) {
        // Position relative to target
        targetBounds = this.target.getBounds
          ? this.target.getBounds()
          : {
              x: this.target.x || 0,
              y: this.target.y || 0,
              width: this.target.width || 0,
              height: this.target.height || 0,
            };
      } else {
        return;
      }

      // Try preferred position first
      let position = this.tryPosition(this.position, targetBounds);

      // If auto-positioning or preferred position doesn't fit, find best position
      if ((this.position === 'auto' || !position.fits) && this.viewportBounds) {
        position = this.findBestPosition(targetBounds);
      }

      this.x = position.x;
      this.y = position.y;
      this.currentPosition = position.direction;
      this.arrowPosition = position.arrow;
    } catch (error) {
      this.errorHandler(error, 'calculatePosition');
    }
  }

  /**
   * Tries to position tooltip in specified direction
   * @param {string} direction
   * @param {Object} targetBounds
   * @returns {Object}
   */
  tryPosition(direction, targetBounds) {
    const tooltip = {
      width: this.calculatedDimensions.width,
      height: this.calculatedDimensions.height,
    };

    let x, y, arrowX, arrowY, arrowDirection;

    switch (direction) {
      case 'top':
        x = targetBounds.x + targetBounds.width / 2 - tooltip.width / 2;
        y = targetBounds.y - tooltip.height - this.offset;
        arrowX = tooltip.width / 2;
        arrowY = tooltip.height;
        arrowDirection = 'down';
        break;

      case 'bottom':
        x = targetBounds.x + targetBounds.width / 2 - tooltip.width / 2;
        y = targetBounds.y + targetBounds.height + this.offset;
        arrowX = tooltip.width / 2;
        arrowY = 0;
        arrowDirection = 'up';
        break;

      case 'left':
        x = targetBounds.x - tooltip.width - this.offset;
        y = targetBounds.y + targetBounds.height / 2 - tooltip.height / 2;
        arrowX = tooltip.width;
        arrowY = tooltip.height / 2;
        arrowDirection = 'right';
        break;

      case 'right':
        x = targetBounds.x + targetBounds.width + this.offset;
        y = targetBounds.y + targetBounds.height / 2 - tooltip.height / 2;
        arrowX = 0;
        arrowY = tooltip.height / 2;
        arrowDirection = 'left';
        break;

      default:
        // Default to top
        return this.tryPosition('top', targetBounds);
    }

    // Check if position fits in viewport
    const fits = this.checkViewportFit(x, y, tooltip.width, tooltip.height);

    return {
      x,
      y,
      direction,
      fits,
      arrow: { x: arrowX, y: arrowY, direction: arrowDirection },
    };
  }

  /**
   * Finds the best position that fits in viewport
   * @param {Object} targetBounds
   * @returns {Object}
   */
  findBestPosition(targetBounds) {
    const positions = ['top', 'bottom', 'right', 'left'];

    // Try each position and score them
    const scoredPositions = positions.map(pos => {
      const result = this.tryPosition(pos, targetBounds);
      result.score = this.scorePosition(result, targetBounds);
      return result;
    });

    // Sort by score (higher is better)
    scoredPositions.sort((a, b) => b.score - a.score);

    // Return best position, with adjustments if needed
    const bestPosition = scoredPositions[0];
    return this.adjustPositionToFit(bestPosition);
  }

  /**
   * Scores a position based on visibility and alignment
   * @param {Object} position
   * @param {Object} targetBounds
   * @returns {number}
   */
  scorePosition(position, targetBounds) {
    let score = 0;

    // Prefer positions that fit completely in viewport
    if (position.fits) {
      score += 100;
    }

    // Prefer positions with better alignment to target center
    const targetCenterX = targetBounds.x + targetBounds.width / 2;
    const targetCenterY = targetBounds.y + targetBounds.height / 2;
    const tooltipCenterX = position.x + this.calculatedDimensions.width / 2;
    const tooltipCenterY = position.y + this.calculatedDimensions.height / 2;

    const alignmentScore =
      COMPONENT_CONSTANTS.ALIGNMENT_CENTER_BASE -
      Math.min(
        COMPONENT_CONSTANTS.ALIGNMENT_CENTER_BASE,
        Math.abs(targetCenterX - tooltipCenterX) +
          Math.abs(targetCenterY - tooltipCenterY)
      );
    score += alignmentScore;

    // Prefer top and bottom positions over left and right
    if (position.direction === 'top' || position.direction === 'bottom') {
      score += 10;
    }

    return score;
  }

  /**
   * Adjusts position to fit better in viewport
   * @param {Object} position
   * @returns {Object}
   */
  adjustPositionToFit(position) {
    if (!this.viewportBounds) return position;

    let { x, y } = position;
    const padding = this.autoPositionPadding;

    // Adjust horizontally
    if (x < padding) {
      x = padding;
    } else if (
      x + this.calculatedDimensions.width >
      this.viewportBounds.width - padding
    ) {
      x = this.viewportBounds.width - this.calculatedDimensions.width - padding;
    }

    // Adjust vertically
    if (y < padding) {
      y = padding;
    } else if (
      y + this.calculatedDimensions.height >
      this.viewportBounds.height - padding
    ) {
      y =
        this.viewportBounds.height - this.calculatedDimensions.height - padding;
    }

    return {
      ...position,
      x,
      y,
      fits: true,
    };
  }

  /**
   * Checks if tooltip fits in viewport at given position
   * @param {number} x
   * @param {number} y
   * @param {number} width
   * @param {number} height
   * @returns {boolean}
   */
  checkViewportFit(x, y, width, height) {
    if (!this.viewportBounds) return true;

    const padding = this.autoPositionPadding;

    return (
      x >= padding &&
      y >= padding &&
      x + width <= this.viewportBounds.width - padding &&
      y + height <= this.viewportBounds.height - padding
    );
  }

  /**
   * Updates tooltip position (for following cursor or target movement)
   * @param {Object} event
   */
  updatePosition(event) {
    if (this.isVisible && !this.isAnimating) {
      this.calculatePosition(event);
    }
  }

  /**
   * Starts entrance animation
   */
  startEntranceAnimation() {
    if (!this.animationsEnabled || this.animation === 'none') {
      this.isAnimating = false;
      return Promise.resolve();
    }

    return new Promise(resolve => {
      switch (this.animation) {
        case 'fade':
          this.alpha = 0;
          this.animate('alpha', 1, COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_IN, {
            easing: EASING_FUNCTIONS.EASE_OUT_QUAD,
            onComplete: () => {
              this.isAnimating = false;
              resolve();
            },
          });
          break;

        case 'scale':
          this.scale = 0;
          this.animate('scale', 1, COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_IN, {
            easing: EASING_FUNCTIONS.EASE_OUT_BACK,
            onComplete: () => {
              this.isAnimating = false;
              resolve();
            },
          });
          break;

        case 'slide': {
          const slideOffset =
            this.currentPosition === 'top' || this.currentPosition === 'bottom'
              ? this.currentPosition === 'top'
                ? -COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET
                : COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET
              : this.currentPosition === 'left'
                ? -COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET
                : COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET;

          if (
            this.currentPosition === 'top' ||
            this.currentPosition === 'bottom'
          ) {
            this.y += slideOffset;
            this.animate(
              'y',
              this.y - slideOffset,
              COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_IN,
              {
                easing: EASING_FUNCTIONS.EASE_OUT_QUAD,
                onComplete: () => {
                  this.isAnimating = false;
                  resolve();
                },
              }
            );
          } else {
            this.x += slideOffset;
            this.animate(
              'x',
              this.x - slideOffset,
              COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_IN,
              {
                easing: EASING_FUNCTIONS.EASE_OUT_QUAD,
                onComplete: () => {
                  this.isAnimating = false;
                  resolve();
                },
              }
            );
          }
          break;
        }

        default:
          this.isAnimating = false;
          resolve();
          break;
      }
    });
  }

  /**
   * Starts exit animation
   */
  startExitAnimation() {
    if (!this.animationsEnabled || this.animation === 'none') {
      return Promise.resolve();
    }

    return new Promise(resolve => {
      switch (this.animation) {
        case 'fade':
          this.animate('alpha', 0, COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_OUT, {
            easing: EASING_FUNCTIONS.EASE_IN_QUAD,
            onComplete: resolve,
          });
          break;

        case 'scale':
          this.animate('scale', 0, COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_OUT, {
            easing: EASING_FUNCTIONS.EASE_IN_BACK,
            onComplete: resolve,
          });
          break;

        case 'slide': {
          const slideOffset =
            this.currentPosition === 'top' || this.currentPosition === 'bottom'
              ? this.currentPosition === 'top'
                ? -COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET
                : COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET
              : this.currentPosition === 'left'
                ? -COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET
                : COMPONENT_CONSTANTS.TOOLTIP_SLIDE_OFFSET;

          if (
            this.currentPosition === 'top' ||
            this.currentPosition === 'bottom'
          ) {
            this.animate(
              'y',
              this.y + slideOffset,
              COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_OUT,
              {
                easing: EASING_FUNCTIONS.EASE_IN_QUAD,
                onComplete: resolve,
              }
            );
          } else {
            this.animate(
              'x',
              this.x + slideOffset,
              COMPONENT_CONSTANTS.TOOLTIP_ANIMATION_OUT,
              {
                easing: EASING_FUNCTIONS.EASE_IN_QUAD,
                onComplete: resolve,
              }
            );
          }
          break;
        }

        default:
          resolve();
          break;
      }
    });
  }

  // Event handlers for target interactions
  handleTargetMouseEnter(event) {
    this.scheduleShow(event);
  }

  handleTargetMouseLeave(_event) {
    if (!this.interactive) {
      this.scheduleHide();
    }
  }

  handleTargetMouseMove(event) {
    if (this.followCursor && this.isVisible) {
      this.updatePosition(event);
    }
  }

  handleTargetTouchStart(event) {
    this.touchStartTime = Date.now();
    this.longPressTimer = setTimeout(() => {
      this.show(event);
    }, this.longPressDuration);
  }

  handleTargetTouchEnd(event) {
    this.clearTimers();

    const touchDuration = Date.now() - this.touchStartTime;
    if (touchDuration < this.longPressDuration) {
      // Short tap - toggle tooltip
      this.toggle(event);
    }
  }

  handleTargetTouchCancel(_event) {
    this.clearTimers();
    this.scheduleHide();
  }

  handleTargetFocus() {
    this.scheduleShow();
  }

  handleTargetBlur() {
    this.scheduleHide();
  }

  handleTargetKeyDown(event) {
    if (event.key === 'Escape' && this.isVisible) {
      this.hide();
    }
  }

  /**
   * Updates accessibility attributes
   */
  updateAccessibilityAttributes() {
    this.ariaLabel = this.content;
    this.ariaLive = 'polite';
    this.ariaAtomic = true;
  }

  /**
   * Enhanced canvas rendering with modern styling
   * @param {CanvasRenderingContext2D} renderer
   */
  renderSelf(renderer) {
    if (renderer.type !== 'canvas' || !this.visible || !this.isVisible) return;

    try {
      const startTime = performance.now();

      // Skip rendering if not visible or transparent
      if (this.alpha <= 0 || this.scale <= 0) return;

      renderer.save();

      // Apply transformations
      if (this.scale !== 1) {
        renderer.scale(this.scale, this.scale);
      }

      renderer.globalAlpha = this.alpha;

      // Render tooltip background
      this.renderBackground(renderer);

      // Render arrow if enabled
      if (this.arrow) {
        this.renderArrow(renderer);
      }

      // Render content
      this.renderContent(renderer);

      renderer.restore();

      // Performance tracking
      const renderTime = performance.now() - startTime;
      this.lastRenderTime = renderTime;
      this.renderCount++;

      if (renderTime > COMPONENT_CONSTANTS.PERFORMANCE_THRESHOLD) {
        UIUtils.debugLog(
          'warn',
          `Tooltip render took ${renderTime.toFixed(2)}ms`
        );
      }
    } catch (error) {
      this.errorHandler(error, 'renderSelf');
    }
  }

  /**
   * Renders tooltip background
   * @param {CanvasRenderingContext2D} renderer
   */
  renderBackground(renderer) {
    const bgColor = this.getBackgroundColor();
    const borderColor = this.getBorderColor();
    const borderRadius = 6;

    // Shadow
    renderer.fillStyle = 'rgba(0, 0, 0, 0.1)';
    UIUtils.fillRoundedRect(
      renderer,
      2,
      2,
      this.width,
      this.height,
      borderRadius
    );

    // Background
    renderer.fillStyle = bgColor;
    UIUtils.fillRoundedRect(
      renderer,
      0,
      0,
      this.width,
      this.height,
      borderRadius
    );

    // Border
    if (borderColor) {
      renderer.strokeStyle = borderColor;
      renderer.lineWidth = 1;
      UIUtils.strokeRoundedRect(
        renderer,
        0,
        0,
        this.width,
        this.height,
        borderRadius
      );
    }
  }

  /**
   * Gets background color based on theme
   * @returns {string}
   */
  getBackgroundColor() {
    switch (this.theme) {
      case 'light':
        return UI_CONSTANTS.COLORS.WHITE;
      case 'dark':
        return 'rgba(0, 0, 0, 0.9)';
      default:
        return 'rgba(0, 0, 0, 0.8)';
    }
  }

  /**
   * Gets border color based on theme
   * @returns {string|null}
   */
  getBorderColor() {
    switch (this.theme) {
      case 'light':
        return UI_CONSTANTS.COLORS.GRAY_300;
      default:
        return null;
    }
  }

  /**
   * Gets text color based on theme
   * @returns {string}
   */
  getTextColor() {
    switch (this.theme) {
      case 'light':
        return UI_CONSTANTS.COLORS.GRAY_900;
      case 'dark':
      default:
        return UI_CONSTANTS.COLORS.WHITE;
    }
  }

  /**
   * Renders tooltip arrow
   * @param {CanvasRenderingContext2D} renderer
   */
  renderArrow(renderer) {
    if (!this.arrowPosition) return;

    const { x, y, direction } = this.arrowPosition;
    const arrowSize = 6;
    const bgColor = this.getBackgroundColor();

    renderer.fillStyle = bgColor;
    renderer.beginPath();

    switch (direction) {
      case 'up':
        renderer.moveTo(x - arrowSize, y);
        renderer.lineTo(x + arrowSize, y);
        renderer.lineTo(x, y - arrowSize);
        break;

      case 'down':
        renderer.moveTo(x - arrowSize, y);
        renderer.lineTo(x + arrowSize, y);
        renderer.lineTo(x, y + arrowSize);
        break;

      case 'left':
        renderer.moveTo(x, y - arrowSize);
        renderer.lineTo(x, y + arrowSize);
        renderer.lineTo(x - arrowSize, y);
        break;

      case 'right':
        renderer.moveTo(x, y - arrowSize);
        renderer.lineTo(x, y + arrowSize);
        renderer.lineTo(x + arrowSize, y);
        break;
    }

    renderer.closePath();
    renderer.fill();

    // Arrow border
    const borderColor = this.getBorderColor();
    if (borderColor) {
      renderer.strokeStyle = borderColor;
      renderer.lineWidth = 1;
      renderer.stroke();
    }
  }

  /**
   * Renders tooltip content
   * @param {CanvasRenderingContext2D} renderer
   */
  renderContent(renderer) {
    if (!this.content || !this.calculatedDimensions.lines) return;

    const padding = this.getPadding();
    const lineHeight = this.getLineHeight();
    const textColor = this.getTextColor();

    renderer.fillStyle = textColor;
    renderer.font = this.getFont();
    renderer.textAlign = 'left';
    renderer.textBaseline = 'top';

    this.calculatedDimensions.lines.forEach((line, index) => {
      const x = padding.left;
      const y = padding.top + index * lineHeight;
      renderer.fillText(line, x, y);
    });
  }

  /**
   * Gets accessibility description
   * @returns {string}
   */
  getAccessibilityDescription() {
    return (
      `Tooltip with content: "${this.content}". Position: ${this.currentPosition}. ` +
      `${this.isVisible ? 'Currently visible' : 'Currently hidden'}.`
    );
  }

  /**
   * Default error handler
   * @param {Error} error
   * @param {string} context
   */
  defaultErrorHandler(error, context) {
    UIUtils.debugLog('error', `Tooltip error in ${context}`, error);
    this.emit('error', { error, context, component: 'Tooltip' });
  }

  /**
   * Enhanced destroy method with cleanup
   */
  destroy() {
    try {
      // Clear all timers
      this.clearTimers();

      // Hide tooltip if visible
      if (this.isVisible) {
        this.hide();
      }

      // Unbind target events
      if (this.target) {
        this.unbindTargetEvents();
      }

      // Remove global event listeners
      if (typeof window !== 'undefined') {
        window.removeEventListener('resize', this.updateViewportBounds);
        window.removeEventListener('scroll', this.updatePosition);
      }

      // Stop any running animations
      this.stopAnimations();

      super.destroy();
    } catch (error) {
      this.errorHandler(error, 'destroy');
    }
  }
}

// ===== EXPORT ALL COMPONENTS =====
export { ModalDialog, NavigationMenu, Chart, FormField, Tooltip };
