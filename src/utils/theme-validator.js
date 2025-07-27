/**
 * Theme Validation & Testing Utility
 * Ensures consistent theme implementation across components
 *
 * Copyright 2025 Armando Sori
 * Licensed under the Apache License, Version 2.0
 */

class ThemeValidator {
  constructor() {
    this.requiredTokens = [
      // Background tokens
      "--theme-bg-primary",
      "--theme-bg-secondary",
      "--theme-bg-tertiary",
      "--theme-bg-interactive",
      "--theme-bg-overlay",

      // Text tokens
      "--theme-text-primary",
      "--theme-text-secondary",
      "--theme-text-tertiary",
      "--theme-text-muted",
      "--theme-text-inverse",
      "--theme-text-on-accent",

      // Border tokens
      "--theme-border-primary",
      "--theme-border-secondary",
      "--theme-border-interactive",
      "--theme-border-focus",
      "--theme-border-error",
      "--theme-border-success",

      // Accent tokens
      "--theme-accent-primary",
      "--theme-accent-secondary",
      "--theme-accent-success",
      "--theme-accent-warning",
      "--theme-accent-error",
      "--theme-accent-info",

      // Shadow tokens
      "--theme-shadow-light",
      "--theme-shadow-medium",
      "--theme-shadow-heavy",
      "--theme-shadow-focus",
    ];

    this.themes = ["light", "dark", "high-contrast"];
    this.results = {
      passed: 0,
      failed: 0,
      warnings: 0,
      errors: [],
    };
  }

  /**
   * Validate all theme tokens are available
   */
  validateTokens() {
    console.group("🎨 Theme Token Validation");

    const computedStyle = getComputedStyle(document.documentElement);

    this.requiredTokens.forEach((token) => {
      const value = computedStyle.getPropertyValue(token).trim();

      if (!value) {
        this.results.failed++;
        this.results.errors.push(`Missing token: ${token}`);
        console.error(`❌ Missing required token: ${token}`);
      } else {
        this.results.passed++;
        console.log(`✅ ${token}: ${value}`);
      }
    });

    console.groupEnd();
    return this.results.failed === 0;
  }

  /**
   * Test theme switching functionality
   */
  async testThemeSwitching() {
    console.group("🔄 Theme Switching Test");

    const originalTheme = document.body.className;

    for (const theme of this.themes) {
      try {
        // Apply theme
        document.body.className =
          theme === "light"
            ? ""
            : theme === "dark"
              ? "dark-mode"
              : "theme-high-contrast";

        // Wait for CSS transitions
        await new Promise((resolve) => setTimeout(resolve, 100));

        // Validate theme tokens
        const isValid = this.validateThemeTokens(theme);

        if (isValid) {
          console.log(`✅ ${theme} theme: All tokens valid`);
          this.results.passed++;
        } else {
          console.error(`❌ ${theme} theme: Invalid tokens detected`);
          this.results.failed++;
        }
      } catch (error) {
        console.error(`❌ Error testing ${theme} theme:`, error);
        this.results.failed++;
        this.results.errors.push(
          `Theme switching error: ${theme} - ${error.message}`,
        );
      }
    }

    // Restore original theme
    document.body.className = originalTheme;
    console.groupEnd();
  }

  /**
   * Validate specific theme tokens
   */
  validateThemeTokens(themeName) {
    const computedStyle = getComputedStyle(document.documentElement);
    let isValid = true;

    // Test a subset of critical tokens
    const criticalTokens = [
      "--theme-bg-primary",
      "--theme-text-primary",
      "--theme-border-primary",
      "--theme-accent-primary",
    ];

    criticalTokens.forEach((token) => {
      const value = computedStyle.getPropertyValue(token).trim();
      if (!value) {
        console.warn(`⚠️  ${themeName}: Missing ${token}`);
        isValid = false;
        this.results.warnings++;
      }
    });

    return isValid;
  }

  /**
   * Check for contrast ratio compliance
   */
  validateContrast() {
    console.group("🔍 Contrast Validation");

    const computedStyle = getComputedStyle(document.documentElement);

    // Get colors
    const bgPrimary = computedStyle
      .getPropertyValue("--theme-bg-primary")
      .trim();
    const textPrimary = computedStyle
      .getPropertyValue("--theme-text-primary")
      .trim();

    try {
      const contrast = this.calculateContrastRatio(bgPrimary, textPrimary);

      if (contrast >= 4.5) {
        console.log(
          `✅ Contrast ratio: ${contrast.toFixed(2)} (WCAG AA compliant)`,
        );
        this.results.passed++;
      } else if (contrast >= 3) {
        console.warn(
          `⚠️  Contrast ratio: ${contrast.toFixed(2)} (WCAG AA Large compliant)`,
        );
        this.results.warnings++;
      } else {
        console.error(
          `❌ Contrast ratio: ${contrast.toFixed(2)} (Not WCAG compliant)`,
        );
        this.results.failed++;
        this.results.errors.push(`Poor contrast ratio: ${contrast.toFixed(2)}`);
      }
    } catch (error) {
      console.error("❌ Could not calculate contrast ratio:", error);
      this.results.warnings++;
    }

    console.groupEnd();
  }

  /**
   * Calculate contrast ratio between two colors
   */
  calculateContrastRatio(color1, color2) {
    // Simplified contrast calculation
    // In a real implementation, you'd parse CSS colors properly
    const luminance1 = this.getLuminance(color1);
    const luminance2 = this.getLuminance(color2);

    const lighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);

    return (lighter + 0.05) / (darker + 0.05);
  }

  /**
   * Get relative luminance of a color (simplified)
   */
  getLuminance(color) {
    // This is a simplified version
    // Real implementation would handle all CSS color formats
    if (color.startsWith("#")) {
      const hex = color.substring(1);
      const r = parseInt(hex.substring(0, 2), 16) / 255;
      const g = parseInt(hex.substring(2, 4), 16) / 255;
      const b = parseInt(hex.substring(4, 6), 16) / 255;

      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    }

    // Default for non-hex colors
    return 0.5;
  }

  /**
   * Check for unused CSS custom properties
   */
  findUnusedTokens() {
    console.group("🧹 Unused Token Detection");

    const allStyleSheets = Array.from(document.styleSheets);
    const usedTokens = new Set();

    try {
      allStyleSheets.forEach((sheet) => {
        try {
          const rules = Array.from(sheet.cssRules || sheet.rules || []);
          rules.forEach((rule) => {
            if (rule.style) {
              const cssText = rule.style.cssText;
              // Find var() usage
              const varMatches = cssText.match(/var\(([^)]+)\)/g);
              if (varMatches) {
                varMatches.forEach((match) => {
                  const token = match.match(/var\(([^,)]+)/)?.[1]?.trim();
                  if (token) usedTokens.add(token);
                });
              }
            }
          });
        } catch (e) {
          // Skip inaccessible stylesheets (CORS)
        }
      });

      const unusedTokens = this.requiredTokens.filter(
        (token) => !usedTokens.has(token),
      );

      if (unusedTokens.length === 0) {
        console.log("✅ All theme tokens are in use");
      } else {
        console.warn("⚠️  Potentially unused tokens:", unusedTokens);
        this.results.warnings += unusedTokens.length;
      }
    } catch (error) {
      console.warn("⚠️  Could not analyze token usage:", error.message);
    }

    console.groupEnd();
  }

  /**
   * Run comprehensive theme validation
   */
  async runFullValidation() {
    console.group("🎯 SimulateAI Theme Validation Suite");
    console.log("Starting comprehensive theme validation...");

    this.results = { passed: 0, failed: 0, warnings: 0, errors: [] };

    // Run all validation tests
    this.validateTokens();
    await this.testThemeSwitching();
    this.validateContrast();
    this.findUnusedTokens();

    // Summary
    console.group("📊 Validation Summary");
    console.log(`✅ Passed: ${this.results.passed}`);
    console.log(`❌ Failed: ${this.results.failed}`);
    console.log(`⚠️  Warnings: ${this.results.warnings}`);

    if (this.results.errors.length > 0) {
      console.group("🚨 Errors");
      this.results.errors.forEach((error) => console.error(error));
      console.groupEnd();
    }

    const overall = this.results.failed === 0 ? "PASS" : "FAIL";
    console.log(`🎯 Overall Result: ${overall}`);
    console.groupEnd();

    console.groupEnd();

    return {
      success: this.results.failed === 0,
      results: this.results,
    };
  }

  /**
   * Generate theme usage report
   */
  generateReport() {
    const report = {
      timestamp: new Date().toISOString(),
      themes: this.themes,
      tokens: this.requiredTokens.length,
      validation: this.results,
      recommendations: [],
    };

    if (this.results.failed > 0) {
      report.recommendations.push("Fix missing or invalid theme tokens");
    }

    if (this.results.warnings > 0) {
      report.recommendations.push("Review contrast ratios and unused tokens");
    }

    if (this.results.failed === 0 && this.results.warnings === 0) {
      report.recommendations.push("Theme implementation is excellent!");
    }

    return report;
  }
}

// Export for use in other modules
/* eslint-env node */
/* global module */
if (typeof module !== "undefined" && module.exports) {
  module.exports = ThemeValidator;
}

// Auto-run validation in development
if (typeof window !== "undefined" && window.location.hostname === "localhost") {
  window.ThemeValidator = ThemeValidator;

  // Add validation to window for manual testing
  window.validateTheme = async () => {
    const validator = new ThemeValidator();
    return await validator.runFullValidation();
  };

  console.log("🎨 Theme validation available: Run validateTheme() in console");
}
