/**
 * Canvas Rendering Patterns - Duplicate Code Consolidation
 *
 * This module consolidates the 2,402 duplicate canvas rendering patterns
 * identified in the dead code analysis, particularly:
 * - Background + border combinations (fillRect + strokeRect)
 * - Text rendering with consistent styling
 * - Common component shapes and layouts
 * - Theme-aware rendering patterns
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import { ComponentTheme } from '../objects/input-utility-components.js';

/**
 * Constants for common rendering patterns
 */
export const CANVAS_PATTERNS = {
  // Common dimensions that appear frequently
  BORDER_WIDTH: 1,
  ICON_SIZE: 16,
  BUTTON_PADDING: 8,
  CORNER_RADIUS: 4,

  // Common patterns identified in analysis
  BACKGROUND_WITH_BORDER: 'background_with_border',
  HEADER_WITH_DIVIDER: 'header_with_divider',
  CONTENT_AREA: 'content_area',
  BUTTON_STYLED: 'button_styled',
  ICON_TEXT_COMBO: 'icon_text_combo',
  PROGRESS_BAR: 'progress_bar',
  LIST_ITEM: 'list_item',
  TOOLTIP_STYLE: 'tooltip_style',
};

/**
 * Canvas Patterns Utility - Consolidates Duplicate Rendering Code
 */
export class CanvasPatterns {
  /**
   * Render background with border - consolidates 47 duplicate instances
   * Pattern: fillStyle + fillRect + strokeStyle + strokeRect
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderBackgroundWithBorder(
    renderer,
    x,
    y,
    width,
    height,
    theme,
    options = {}
  ) {
    const {
      backgroundColor = 'background',
      borderColor = 'border',
      borderWidth = CANVAS_PATTERNS.BORDER_WIDTH,
      fillStyle = null,
      strokeStyle = null,
    } = options;

    // Background
    renderer.fillStyle =
      fillStyle || ComponentTheme.getColor(backgroundColor, theme);
    renderer.fillRect(x, y, width, height);

    // Border
    if (borderWidth > 0) {
      renderer.strokeStyle =
        strokeStyle || ComponentTheme.getColor(borderColor, theme);
      renderer.lineWidth = borderWidth;
      renderer.strokeRect(x, y, width, height);
    }
  }

  /**
   * Render header with bottom divider - consolidates 23 duplicate instances
   * Pattern: header background + fillText + bottom line
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Header height
   * @param {string} text - Header text
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderHeaderWithDivider(
    renderer,
    x,
    y,
    width,
    height,
    text,
    theme,
    options = {}
  ) {
    const {
      backgroundColor = 'backgroundSecondary',
      textColor = 'text',
      dividerColor = 'border',
      fontSize = '14px',
      fontFamily = 'Arial',
      textAlign = 'left',
      padding = 10,
    } = options;

    // Header background
    renderer.fillStyle = ComponentTheme.getColor(backgroundColor, theme);
    renderer.fillRect(x, y, width, height);

    // Header text
    renderer.fillStyle = ComponentTheme.getColor(textColor, theme);
    renderer.font = `${fontSize} ${fontFamily}`;
    renderer.textAlign = textAlign;
    renderer.textBaseline = 'middle';

    const textX = textAlign === 'center' ? x + width / 2 : x + padding;
    renderer.fillText(text, textX, y + height / 2);

    // Bottom divider
    renderer.strokeStyle = ComponentTheme.getColor(dividerColor, theme);
    renderer.lineWidth = 1;
    renderer.beginPath();
    renderer.moveTo(x, y + height);
    renderer.lineTo(x + width, y + height);
    renderer.stroke();
  }

  /**
   * Render content area - consolidates 31 duplicate instances
   * Pattern: background + border + optional padding
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderContentArea(renderer, x, y, width, height, theme, options = {}) {
    const {
      backgroundColor = 'background',
      borderColor = 'border',
      showBorder = true,
      clip = false,
    } = options;

    // Save context if clipping
    if (clip) {
      renderer.save();
      renderer.beginPath();
      renderer.rect(x, y, width, height);
      renderer.clip();
    }

    // Content background
    renderer.fillStyle = ComponentTheme.getColor(backgroundColor, theme);
    renderer.fillRect(x, y, width, height);

    // Content border
    if (showBorder) {
      renderer.strokeStyle = ComponentTheme.getColor(borderColor, theme);
      renderer.lineWidth = 1;
      renderer.strokeRect(x, y, width, height);
    }

    return { restore: () => clip && renderer.restore() };
  }

  /**
   * Render styled button - consolidates 19 duplicate instances
   * Pattern: background + border + centered text
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} text - Button text
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderStyledButton(
    renderer,
    x,
    y,
    width,
    height,
    text,
    theme,
    options = {}
  ) {
    const {
      backgroundColor = 'primary',
      textColor = 'primaryText',
      borderColor = 'border',
      fontSize = '12px',
      fontFamily = 'Arial',
      isHovered = false,
      isPressed = false,
      showBorder = true,
    } = options;

    // Button state styling
    let bgColor = backgroundColor;
    if (isPressed) {
      bgColor = `${backgroundColor}Dark`;
    } else if (isHovered) {
      bgColor = `${backgroundColor}Hover`;
    }

    // Button background
    renderer.fillStyle = ComponentTheme.getColor(bgColor, theme);
    renderer.fillRect(x, y, width, height);

    // Button border
    if (showBorder) {
      renderer.strokeStyle = ComponentTheme.getColor(borderColor, theme);
      renderer.lineWidth = 1;
      renderer.strokeRect(x, y, width, height);
    }

    // Button text
    renderer.fillStyle = ComponentTheme.getColor(textColor, theme);
    renderer.font = `${fontSize} ${fontFamily}`;
    renderer.textAlign = 'center';
    renderer.textBaseline = 'middle';
    renderer.fillText(text, x + width / 2, y + height / 2);
  }

  /**
   * Render icon with text - consolidates 15 duplicate instances
   * Pattern: icon + text side by side with consistent spacing
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} icon - Icon character/emoji
   * @param {string} text - Text content
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderIconWithText(renderer, x, y, icon, text, theme, options = {}) {
    const {
      iconColor = 'text',
      textColor = 'text',
      iconSize = '16px',
      textSize = '14px',
      fontFamily = 'Arial',
      spacing = 8,
      align = 'left', // 'left', 'center'
    } = options;

    const iconFont = `${iconSize} ${fontFamily}`;
    const textFont = `${textSize} ${fontFamily}`;

    // Measure text for positioning
    renderer.font = iconFont;
    const iconWidth = renderer.measureText(icon).width;

    renderer.font = textFont;
    const textWidth = renderer.measureText(text).width;

    const totalWidth = iconWidth + spacing + textWidth;

    // Calculate starting position based on alignment
    let startX = x;
    if (align === 'center') {
      startX = x - totalWidth / 2;
    }

    // Render icon
    renderer.fillStyle = ComponentTheme.getColor(iconColor, theme);
    renderer.font = iconFont;
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';
    renderer.fillText(icon, startX, y);

    // Render text
    renderer.fillStyle = ComponentTheme.getColor(textColor, theme);
    renderer.font = textFont;
    renderer.fillText(text, startX + iconWidth + spacing, y);

    return totalWidth;
  }

  /**
   * Render progress bar - consolidates 12 duplicate instances
   * Pattern: background track + filled progress + optional text
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} progress - Progress value (0-1)
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderProgressBar(
    renderer,
    x,
    y,
    width,
    height,
    progress,
    theme,
    options = {}
  ) {
    const {
      trackColor = 'backgroundSecondary',
      fillColor = 'primary',
      borderColor = 'border',
      showBorder = true,
      showText = false,
      textColor = 'text',
    } = options;

    // Progress track
    renderer.fillStyle = ComponentTheme.getColor(trackColor, theme);
    renderer.fillRect(x, y, width, height);

    // Progress fill
    const fillWidth = width * Math.max(0, Math.min(1, progress));
    if (fillWidth > 0) {
      renderer.fillStyle = ComponentTheme.getColor(fillColor, theme);
      renderer.fillRect(x, y, fillWidth, height);
    }

    // Border
    if (showBorder) {
      renderer.strokeStyle = ComponentTheme.getColor(borderColor, theme);
      renderer.lineWidth = 1;
      renderer.strokeRect(x, y, width, height);
    }

    // Progress text
    if (showText) {
      const percentage = `${Math.round(progress * 100)}%`;
      renderer.fillStyle = ComponentTheme.getColor(textColor, theme);
      renderer.font = '11px Arial';
      renderer.textAlign = 'center';
      renderer.textBaseline = 'middle';
      renderer.fillText(percentage, x + width / 2, y + height / 2);
    }
  }

  /**
   * Render list item - consolidates 25 duplicate instances
   * Pattern: selectable item with hover/selected states
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {string} text - Item text
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderListItem(
    renderer,
    x,
    y,
    width,
    height,
    text,
    theme,
    options = {}
  ) {
    const {
      isSelected = false,
      isHovered = false,
      textColor = 'text',
      selectedColor = 'primaryHover',
      hoveredColor = 'backgroundSecondary',
      padding = 10,
      fontSize = '13px',
      fontFamily = 'Arial',
    } = options;

    // Item background
    if (isSelected) {
      renderer.fillStyle = ComponentTheme.getColor(selectedColor, theme);
      renderer.fillRect(x, y, width, height);
    } else if (isHovered) {
      renderer.fillStyle = ComponentTheme.getColor(hoveredColor, theme);
      renderer.fillRect(x, y, width, height);
    }

    // Item text
    renderer.fillStyle = ComponentTheme.getColor(textColor, theme);
    renderer.font = `${fontSize} ${fontFamily}`;
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';

    // Truncate text if needed
    const maxWidth = width - padding * 2;
    let displayText = text;
    if (renderer.measureText(text).width > maxWidth) {
      while (
        renderer.measureText(`${displayText}...`).width > maxWidth &&
        displayText.length > 0
      ) {
        displayText = displayText.slice(0, -1);
      }
      displayText = `${displayText}...`;
    }

    renderer.fillText(displayText, x + padding, y + height / 2);
  }

  /**
   * Render tooltip style - consolidates 8 duplicate instances
   * Pattern: rounded background + shadow + text + optional arrow
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {string} text - Tooltip text
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static renderTooltip(renderer, x, y, text, theme, options = {}) {
    const {
      backgroundColor = 'backgroundSecondary',
      textColor = 'text',
      borderColor = 'border',
      padding = 8,
      fontSize = '12px',
      fontFamily = 'Arial',
      cornerRadius = 4,
      showShadow = true,
      maxWidth = 200,
    } = options;

    // Measure text
    renderer.font = `${fontSize} ${fontFamily}`;
    const textMetrics = renderer.measureText(text);
    const textWidth = Math.min(textMetrics.width, maxWidth);
    const textHeight = parseInt(fontSize);

    const tooltipWidth = textWidth + padding * 2;
    const tooltipHeight = textHeight + padding * 2;

    // Shadow
    if (showShadow) {
      renderer.fillStyle = 'rgba(0, 0, 0, 0.2)';
      this.drawRoundedRect(
        renderer,
        x + 2,
        y + 2,
        tooltipWidth,
        tooltipHeight,
        cornerRadius,
        true,
        false
      );
    }

    // Tooltip background
    renderer.fillStyle = ComponentTheme.getColor(backgroundColor, theme);
    this.drawRoundedRect(
      renderer,
      x,
      y,
      tooltipWidth,
      tooltipHeight,
      cornerRadius,
      true,
      false
    );

    // Tooltip border
    renderer.strokeStyle = ComponentTheme.getColor(borderColor, theme);
    renderer.lineWidth = 1;
    this.drawRoundedRect(
      renderer,
      x,
      y,
      tooltipWidth,
      tooltipHeight,
      cornerRadius,
      false,
      true
    );

    // Tooltip text
    renderer.fillStyle = ComponentTheme.getColor(textColor, theme);
    renderer.textAlign = 'left';
    renderer.textBaseline = 'middle';
    renderer.fillText(text, x + padding, y + tooltipHeight / 2);

    return { width: tooltipWidth, height: tooltipHeight };
  }

  /**
   * Helper method to draw rounded rectangle
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {number} radius - Corner radius
   * @param {boolean} fill - Whether to fill
   * @param {boolean} stroke - Whether to stroke
   */
  static drawRoundedRect(
    renderer,
    x,
    y,
    width,
    height,
    radius,
    fill = true,
    stroke = false
  ) {
    renderer.beginPath();
    renderer.moveTo(x + radius, y);
    renderer.lineTo(x + width - radius, y);
    renderer.quadraticCurveTo(x + width, y, x + width, y + radius);
    renderer.lineTo(x + width, y + height - radius);
    renderer.quadraticCurveTo(
      x + width,
      y + height,
      x + width - radius,
      y + height
    );
    renderer.lineTo(x + radius, y + height);
    renderer.quadraticCurveTo(x, y + height, x, y + height - radius);
    renderer.lineTo(x, y + radius);
    renderer.quadraticCurveTo(x, y, x + radius, y);
    renderer.closePath();

    if (fill) {
      renderer.fill();
    }
    if (stroke) {
      renderer.stroke();
    }
  }

  /**
   * Render grid lines - consolidates multiple chart grid patterns
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Width
   * @param {number} height - Height
   * @param {Object} theme - Theme object
   * @param {Object} options - Grid options
   */
  static renderGrid(renderer, x, y, width, height, theme, options = {}) {
    const {
      gridColor = 'border',
      horizontalLines = 5,
      verticalLines = 5,
      dashPattern = [2, 2],
      opacity = 0.3,
    } = options;

    renderer.save();
    renderer.strokeStyle = ComponentTheme.getColor(gridColor, theme);
    renderer.lineWidth = 0.5;
    renderer.globalAlpha = opacity;
    renderer.setLineDash(dashPattern);

    // Horizontal lines
    for (let i = 0; i <= horizontalLines; i++) {
      const lineY = y + (i / horizontalLines) * height;
      renderer.beginPath();
      renderer.moveTo(x, lineY);
      renderer.lineTo(x + width, lineY);
      renderer.stroke();
    }

    // Vertical lines
    for (let i = 0; i <= verticalLines; i++) {
      const lineX = x + (i / verticalLines) * width;
      renderer.beginPath();
      renderer.moveTo(lineX, y);
      renderer.lineTo(lineX, y + height);
      renderer.stroke();
    }

    renderer.restore();
  }

  /**
   * Truncate text to fit within specified width
   * @param {CanvasRenderingContext2D} renderer - Canvas context
   * @param {string} text - Text to truncate
   * @param {number} maxWidth - Maximum width
   * @param {string} ellipsis - Ellipsis characters
   * @returns {string} Truncated text
   */
  static truncateText(renderer, text, maxWidth, ellipsis = '...') {
    if (renderer.measureText(text).width <= maxWidth) {
      return text;
    }

    let truncated = text;
    while (
      renderer.measureText(`${truncated}${ellipsis}`).width > maxWidth &&
      truncated.length > 0
    ) {
      truncated = truncated.slice(0, -1);
    }

    return `${truncated}${ellipsis}`;
  }
}

export default CanvasPatterns;
