/**
 * Canvas Rendering Utilities - Refactored Common Patterns
 *
 * This module consolidates duplicate canvas rendering patterns found
 * throughout the codebase, particularly in input-utility-components.js
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

import { ComponentTheme } from "../objects/input-utility-components.js";

/**
 * Common canvas rendering utilities
 */
export class CanvasRenderer {
  /**
   * Apply common theme-based styling to canvas context
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {Object} theme - Theme object
   * @param {Object} options - Styling options
   */
  static applyThemeStyles(ctx, theme, options = {}) {
    const {
      fillColor = "background",
      strokeColor = "border",
      fillStyle = null,
      strokeStyle = null,
    } = options;

    if (fillStyle) {
      ctx.fillStyle = fillStyle;
    } else if (fillColor) {
      ctx.fillStyle = ComponentTheme.getColor(fillColor, theme);
    }

    if (strokeStyle) {
      ctx.strokeStyle = strokeStyle;
    } else if (strokeColor) {
      ctx.strokeStyle = ComponentTheme.getColor(strokeColor, theme);
    }
  }

  /**
   * Create and apply a linear gradient
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x0 - Start x coordinate
   * @param {number} y0 - Start y coordinate
   * @param {number} x1 - End x coordinate
   * @param {number} y1 - End y coordinate
   * @param {Array} colorStops - Array of {offset, color} objects
   */
  static createLinearGradient(ctx, x0, y0, x1, y1, colorStops) {
    const gradient = ctx.createLinearGradient(x0, y0, x1, y1);

    colorStops.forEach((stop) => {
      gradient.addColorStop(stop.offset, stop.color);
    });

    return gradient;
  }

  /**
   * Draw a rounded rectangle with theme styling
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Rectangle width
   * @param {number} height - Rectangle height
   * @param {number} radius - Corner radius
   * @param {Object} theme - Theme object
   * @param {Object} options - Drawing options
   */
  static drawThemedRoundedRect(
    ctx,
    x,
    y,
    width,
    height,
    radius,
    theme,
    options = {},
  ) {
    const {
      fill = true,
      stroke = true,
      fillColor = "background",
      strokeColor = "border",
      lineWidth = 1,
    } = options;

    // Create rounded rectangle path
    ctx.beginPath();
    ctx.moveTo(x + radius, y);
    ctx.lineTo(x + width - radius, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius);
    ctx.lineTo(x + width, y + height - radius);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius, y + height);
    ctx.lineTo(x + radius, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius);
    ctx.lineTo(x, y + radius);
    ctx.quadraticCurveTo(x, y, x + radius, y);
    ctx.closePath();

    // Apply styling and draw
    if (fill) {
      ctx.fillStyle = ComponentTheme.getColor(fillColor, theme);
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = ComponentTheme.getColor(strokeColor, theme);
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  /**
   * Draw a circle with theme styling
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} centerX - Center X coordinate
   * @param {number} centerY - Center Y coordinate
   * @param {number} radius - Circle radius
   * @param {Object} theme - Theme object
   * @param {Object} options - Drawing options
   */
  static drawThemedCircle(ctx, centerX, centerY, radius, theme, options = {}) {
    const {
      fill = true,
      stroke = true,
      fillColor = "background",
      strokeColor = "border",
      lineWidth = 1,
    } = options;

    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);

    if (fill) {
      ctx.fillStyle = ComponentTheme.getColor(fillColor, theme);
      ctx.fill();
    }

    if (stroke) {
      ctx.strokeStyle = ComponentTheme.getColor(strokeColor, theme);
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    }
  }

  /**
   * Draw text with theme styling and automatic wrapping
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {string} text - Text to draw
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} maxWidth - Maximum text width
   * @param {Object} theme - Theme object
   * @param {Object} options - Text options
   */
  static drawThemedText(ctx, text, x, y, maxWidth, theme, options = {}) {
    const {
      fontSize = 14,
      fontFamily = "Inter, sans-serif",
      textColor = "text",
      textAlign = "left",
      textBaseline = "top",
      lineHeight = 1.2,
    } = options;

    // Set font and styling
    ctx.font = `${fontSize}px ${fontFamily}`;
    ctx.fillStyle = ComponentTheme.getColor(textColor, theme);
    ctx.textAlign = textAlign;
    ctx.textBaseline = textBaseline;

    // Handle text wrapping if maxWidth is specified
    if (maxWidth && ctx.measureText(text).width > maxWidth) {
      const words = text.split(" ");
      let line = "";
      let currentY = y;

      for (const word of words) {
        const testLine = `${line + word} `;
        const metrics = ctx.measureText(testLine);

        if (metrics.width > maxWidth && line !== "") {
          ctx.fillText(line.trim(), x, currentY);
          line = `${word} `;
          currentY += fontSize * lineHeight;
        } else {
          line = testLine;
        }
      }

      ctx.fillText(line.trim(), x, currentY);
    } else {
      ctx.fillText(text, x, y);
    }
  }

  /**
   * Create a checkerboard pattern for transparency backgrounds
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Pattern width
   * @param {number} height - Pattern height
   * @param {number} checkSize - Size of each check
   */
  static drawCheckerboardPattern(ctx, x, y, width, height, checkSize = 8) {
    const checksX = Math.ceil(width / checkSize);
    const checksY = Math.ceil(height / checkSize);

    for (let row = 0; row < checksY; row++) {
      for (let col = 0; col < checksX; col++) {
        const checkX = x + col * checkSize;
        const checkY = y + row * checkSize;
        const isEven = (row + col) % 2 === 0;

        ctx.fillStyle = isEven ? "#ffffff" : "#e0e0e0";
        ctx.fillRect(checkX, checkY, checkSize, checkSize);
      }
    }
  }

  /**
   * Get canvas context with common setup
   * @param {HTMLCanvasElement} canvas - Canvas element
   * @param {Object} options - Setup options
   * @returns {CanvasRenderingContext2D}
   */
  static getOptimizedContext(canvas, options = {}) {
    const {
      willReadFrequently = false,
      alpha = true,
      desynchronized = false,
    } = options;

    const ctx = canvas.getContext("2d", {
      willReadFrequently,
      alpha,
      desynchronized,
    });

    // Apply common optimizations
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = "high";

    return ctx;
  }

  /**
   * Clear canvas with theme background
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} width - Canvas width
   * @param {number} height - Canvas height
   * @param {Object} theme - Theme object
   * @param {string} bgColor - Background color key
   */
  static clearWithThemeBackground(
    ctx,
    width,
    height,
    theme,
    bgColor = "background",
  ) {
    ctx.clearRect(0, 0, width, height);
    ctx.fillStyle = ComponentTheme.getColor(bgColor, theme);
    ctx.fillRect(0, 0, width, height);
  }
}

/**
 * Canvas focus management utilities
 */
export class CanvasFocusRenderer {
  /**
   * Draw focus ring around element
   * @param {CanvasRenderingContext2D} ctx - Canvas context
   * @param {number} x - X coordinate
   * @param {number} y - Y coordinate
   * @param {number} width - Element width
   * @param {number} height - Element height
   * @param {Object} theme - Theme object
   * @param {Object} options - Focus options
   */
  static drawFocusRing(ctx, x, y, width, height, theme, options = {}) {
    const {
      radius = 4,
      offset = 2,
      lineWidth = 2,
      focusColor = "focus",
    } = options;

    const focusX = x - offset;
    const focusY = y - offset;
    const focusWidth = width + offset * 2;
    const focusHeight = height + offset * 2;

    ctx.strokeStyle = ComponentTheme.getColor(focusColor, theme);
    ctx.lineWidth = lineWidth;
    ctx.setLineDash([4, 2]);

    CanvasRenderer.drawThemedRoundedRect(
      ctx,
      focusX,
      focusY,
      focusWidth,
      focusHeight,
      radius,
      theme,
      { fill: false, stroke: true, strokeColor: focusColor },
    );

    ctx.setLineDash([]);
  }
}

export default CanvasRenderer;
