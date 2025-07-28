/**
 * CSS Layers Diagnostic Tool
 * Copyright 2025 Armando Sori - Licensed under Apache License, Version 2.0
 *
 * Diagnoses CSS layers implementation and color system
 */

class CSSLayersDiagnostic {
  constructor() {
    this.diagnostics = {
      layers: {},
      colors: {},
      fonts: {},
      issues: [],
    };
  }

  runDiagnostics() {
    console.group("🔍 CSS Layers Diagnostic Report");

    this.checkBrowserSupport();
    this.checkColorSystem();
    this.checkFontSystem();
    this.checkLayerImplementation();
    this.generateReport();

    console.groupEnd();

    return this.diagnostics;
  }

  checkBrowserSupport() {
    const hasLayerSupport = CSS.supports("@layer", "test");
    console.log(
      `📱 Browser Support: CSS Layers ${hasLayerSupport ? "✅ Supported" : "❌ Not Supported"}`,
    );

    this.diagnostics.browserSupport = hasLayerSupport;

    if (!hasLayerSupport) {
      this.diagnostics.issues.push("Browser does not support CSS Layers");
    }
  }

  checkColorSystem() {
    const rootStyles = getComputedStyle(document.documentElement);

    const colors = {
      primary: rootStyles.getPropertyValue("--color-primary").trim(),
      primaryDark: rootStyles.getPropertyValue("--color-primary-dark").trim(),
      primaryLight: rootStyles.getPropertyValue("--color-primary-light").trim(),
      fontSizeBase: rootStyles.getPropertyValue("--font-size-base").trim(),
    };

    console.log("🎨 Color System Values:");
    console.log(`   • Primary: ${colors.primary || "Not defined"}`);
    console.log(`   • Primary Dark: ${colors.primaryDark || "Not defined"}`);
    console.log(`   • Primary Light: ${colors.primaryLight || "Not defined"}`);
    console.log(`   • Font Size Base: ${colors.fontSizeBase || "Not defined"}`);

    this.diagnostics.colors = colors;

    // Check for expected values
    if (colors.primary && colors.primary !== "#1a73e8") {
      this.diagnostics.issues.push(
        `Primary color mismatch: Expected #1a73e8, got ${colors.primary}`,
      );
    }

    if (!colors.primary) {
      this.diagnostics.issues.push("Primary color not defined");
    }
  }

  checkFontSystem() {
    const rootStyles = getComputedStyle(document.documentElement);
    const bodyStyles = getComputedStyle(document.body);

    const fonts = {
      baseFontSize: rootStyles.getPropertyValue("--font-size-base").trim(),
      bodyFontSize: bodyStyles.fontSize,
      fontFamily: bodyStyles.fontFamily,
    };

    console.log("📝 Font System:");
    console.log(`   • Base Font Size: ${fonts.baseFontSize || "Not defined"}`);
    console.log(`   • Body Font Size: ${fonts.bodyFontSize}`);
    console.log(`   • Font Family: ${fonts.fontFamily}`);

    this.diagnostics.fonts = fonts;
  }

  checkLayerImplementation() {
    const stylesheets = Array.from(document.styleSheets);
    const layerInfo = {
      totalStylesheets: stylesheets.length,
      stylesheetsWithLayers: 0,
      detectedLayers: new Set(),
    };

    console.log("📊 CSS Layers Implementation:");

    stylesheets.forEach((sheet, index) => {
      try {
        const href = sheet.href
          ? sheet.href.split("/").pop()
          : `Inline ${index + 1}`;
        const rules = Array.from(sheet.cssRules || []);
        let hasLayers = false;

        rules.forEach((rule) => {
          if (rule.cssText && rule.cssText.includes("@layer")) {
            hasLayers = true;
            // Extract layer names
            const layerMatch = rule.cssText.match(/@layer\s+([^{;]+)/);
            if (layerMatch) {
              const layers = layerMatch[1].split(",").map((l) => l.trim());
              layers.forEach((layer) => layerInfo.detectedLayers.add(layer));
            }
          }
        });

        if (hasLayers) {
          layerInfo.stylesheetsWithLayers++;
          console.log(`   ✅ ${href}: Has @layer rules`);
        } else {
          console.log(`   ⚠️ ${href}: No @layer rules`);
        }
      } catch (error) {
        console.log(`   ❌ ${sheet.href || "Unknown"}: Access denied (CORS)`);
      }
    });

    console.log(`📈 Layer Summary:`);
    console.log(`   • Total stylesheets: ${layerInfo.totalStylesheets}`);
    console.log(`   • With @layer rules: ${layerInfo.stylesheetsWithLayers}`);
    console.log(
      `   • Detected layers: ${Array.from(layerInfo.detectedLayers).join(", ")}`,
    );

    this.diagnostics.layers = layerInfo;
  }

  generateReport() {
    console.log("\n📋 Diagnostic Summary:");

    if (this.diagnostics.issues.length === 0) {
      console.log("   ✅ No issues detected");
    } else {
      console.log("   ⚠️ Issues found:");
      this.diagnostics.issues.forEach((issue) => {
        console.log(`     • ${issue}`);
      });
    }

    console.log("\n🔧 Recommendations:");

    if (!this.diagnostics.browserSupport) {
      console.log(
        "   • Consider fallback CSS for browsers without @layer support",
      );
    }

    if (this.diagnostics.layers.stylesheetsWithLayers < 3) {
      console.log("   • Consider migrating more CSS files to use @layer");
    }

    if (this.diagnostics.issues.length > 0) {
      console.log("   • Review css-layers-fix.css for additional fixes");
      console.log("   • Check CSS loading order in app.html");
    }

    console.log("\n💡 Quick Fixes:");
    console.log("   • Clear browser cache and reload");
    console.log("   • Check browser developer tools for CSS errors");
    console.log("   • Verify all CSS files are loading correctly");
  }

  // Method to test specific elements
  testElementStyles(selector) {
    const elements = document.querySelectorAll(selector);
    if (elements.length === 0) {
      console.log(`❌ No elements found for selector: ${selector}`);
      return;
    }

    console.group(`🎯 Testing styles for: ${selector}`);
    elements.forEach((el, index) => {
      const styles = getComputedStyle(el);
      console.log(`Element ${index + 1}:`);
      console.log(`   • Color: ${styles.color}`);
      console.log(`   • Background: ${styles.backgroundColor}`);
      console.log(`   • Font Size: ${styles.fontSize}`);
      console.log(`   • Font Family: ${styles.fontFamily}`);
    });
    console.groupEnd();
  }
}

// Auto-run diagnostics when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  const diagnostic = new CSSLayersDiagnostic();

  // Store globally for manual testing
  window.cssLayersDiagnostic = diagnostic;

  // Run diagnostics in development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    // Delay slightly to ensure all CSS is loaded
    setTimeout(() => {
      diagnostic.runDiagnostics();

      // Test key elements
      diagnostic.testElementStyles(".btn-primary");
      diagnostic.testElementStyles(".hero");
    }, 1000);
  }
});

// Export for manual use
window.CSSLayersDiagnostic = CSSLayersDiagnostic;
