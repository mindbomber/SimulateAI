/**
 * Component Theme Management
 * Extracted from input-utility-components.js for better organization
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

export class ComponentTheme {
  static themes = {
    light: {
      background: "#ffffff",
      surface: "#f8f9fa",
      primary: "#007bff",
      secondary: "#6c757d",
      text: "#333333",
      textSecondary: "#6c757d",
      border: "#dee2e6",
      focus: "#007bff",
      error: "#dc3545",
      warning: "#ffc107",
      success: "#28a745",
      disabled: "#e9ecef",
    },
    dark: {
      background: "#1a1a1a",
      surface: "#2d2d2d",
      primary: "#4da6ff",
      secondary: "#9da5b4",
      text: "#e0e0e0",
      textSecondary: "#9da5b4",
      border: "#404040",
      focus: "#4da6ff",
      error: "#ff5f5f",
      warning: "#ffcc02",
      success: "#4caf50",
      disabled: "#404040",
    },
    highContrast: {
      background: "#000000",
      surface: "#1a1a1a",
      primary: "#ffffff",
      secondary: "#cccccc",
      text: "#ffffff",
      textSecondary: "#cccccc",
      border: "#ffffff",
      focus: "#ffff00",
      error: "#ff0000",
      warning: "#ffff00",
      success: "#00ff00",
      disabled: "#666666",
    },
  };

  static getCurrentTheme() {
    const mediaQuery = window.matchMedia;
    const prefersHighContrast =
      mediaQuery && mediaQuery("(prefers-contrast: high)").matches;

    if (prefersHighContrast) return this.themes.highContrast;
    return this.themes.light;
  }

  static getColor(colorName, customTheme = null) {
    const theme = customTheme || this.getCurrentTheme();
    return theme[colorName] || theme.text;
  }
}

export default ComponentTheme;
