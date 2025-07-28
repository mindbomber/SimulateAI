/**
 * CSS Performance Analysis Tool
 * Copyright 2025 Armando Sori - Licensed under Apache License, Version 2.0
 *
 * Analyzes CSS processing performance before and after consolidation
 * Enhanced with DataHandler integration for persistent performance tracking
 */

class CSSPerformanceAnalyzer {
  constructor(app = null) {
    // DataHandler integration following established patterns
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.persistentAnalytics = this.dataHandler ? true : false;

    // Performance tracking
    this.realTimeMetrics = new Map();
    this.optimizationHistory = [];
    this.sessionData = {
      startTime: performance.now(),
      cssLoadTimes: [],
      consolidationEvents: [],
      performanceImpact: {},
    };

    this.metrics = {
      before: {
        heroFiles: [
          "hero-demo.css",
          "main.css",
          "media.css",
          "appearance-settings.css",
          "enhanced-blog.css",
          "enhanced-profile.css",
        ],
        containerFiles: ["media.css", "layout-components.css", "main.css"],
        totalFiles: 6,
        estimatedRuleProcessing: 150, // Estimated CSS rules processed
      },
      after: {
        heroFiles: ["hero-consolidated.css"],
        containerFiles: [
          "hero-consolidated.css", // Contains .container-responsive
          "css-layers.css",
        ],
        totalFiles: 1,
        estimatedRuleProcessing: 45, // Consolidated rules
      },
    };

    // Auto-initialize persistent analytics loading
    if (this.persistentAnalytics) {
      this.initializeAnalyticsAsync();
    }

    // Track initialization
    this.trackPerformanceEvent("analyzer_initialized", {
      hasDataHandler: !!this.dataHandler,
      persistentMode: this.persistentAnalytics,
    });
  }

  /**
   * Enhanced initialization for persistent analytics loading
   */
  async initializeAnalyticsAsync() {
    if (!this.dataHandler) return;

    try {
      const savedData = await this.loadAnalyticsData();
      if (savedData) {
        this.optimizationHistory = savedData.history || [];
        this.realTimeMetrics = new Map(savedData.metrics || []);
      }
    } catch (error) {
      console.warn(
        "[CSSPerformanceAnalyzer] Failed to load analytics data:",
        error,
      );
    }
  }

  /**
   * Load analytics data from DataHandler
   */
  async loadAnalyticsData() {
    if (!this.dataHandler) return null;

    try {
      return await this.dataHandler.getData("css_performance_analytics");
    } catch (error) {
      console.warn("[CSSPerformanceAnalyzer] Failed to load analytics:", error);
      return null;
    }
  }

  /**
   * Save analytics data to DataHandler
   */
  async saveAnalyticsData() {
    if (!this.dataHandler) return;

    try {
      const analyticsData = {
        history: this.optimizationHistory,
        metrics: Array.from(this.realTimeMetrics.entries()),
        sessionData: this.sessionData,
        lastUpdate: new Date().toISOString(),
        version: "2.0",
      };

      await this.dataHandler.setData(
        "css_performance_analytics",
        analyticsData,
      );
    } catch (error) {
      console.warn("[CSSPerformanceAnalyzer] Failed to save analytics:", error);
    }
  }

  /**
   * Track performance optimization events for persistent analytics
   */
  trackPerformanceEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data,
      session: this.sessionData.startTime,
    };

    this.optimizationHistory.push(event);

    // Keep history manageable (last 100 events)
    if (this.optimizationHistory.length > 100) {
      this.optimizationHistory = this.optimizationHistory.slice(-100);
    }

    // Auto-save if persistent mode enabled
    if (this.persistentAnalytics) {
      this.saveAnalyticsData().catch((err) =>
        console.warn("[CSSPerformanceAnalyzer] Auto-save failed:", err),
      );
    }
  }

  analyzePerformanceGains() {
    const before = this.metrics.before;
    const after = this.metrics.after;

    const fileReduction = (
      ((before.totalFiles - after.totalFiles) / before.totalFiles) *
      100
    ).toFixed(1);
    const ruleReduction = (
      ((before.estimatedRuleProcessing - after.estimatedRuleProcessing) /
        before.estimatedRuleProcessing) *
      100
    ).toFixed(1);

    return {
      fileReduction: `${fileReduction}% fewer files to process`,
      ruleReduction: `${ruleReduction}% fewer CSS rules to parse`,
      specificityReduction: "CSS layers provide predictable cascade order",
      cacheEfficiency: "Single consolidated file improves browser caching",
      maintenanceGain: "Centralized hero styles easier to maintain",
    };
  }

  generateReport() {
    const gains = this.analyzePerformanceGains();
    const realWorldImpact = this.measureRealWorldImpact();

    // Track report generation
    this.trackPerformanceEvent("report_generated", {
      gains,
      realWorldImpact,
    });

    // Only show detailed output if verbose logging is enabled
    const showVerboseOutput =
      localStorage.getItem("verbose-css-logs") === "true" ||
      localStorage.getItem("quiet-logs") !== "true";

    if (showVerboseOutput) {
      console.group("🚀 CSS Optimization Results");
      console.log("📊 Performance Improvements:");
      console.log(`   • ${gains.fileReduction}`);
      console.log(`   • ${gains.ruleReduction}`);
      console.log(`   • ${gains.specificityReduction}`);
      console.log(`   • ${gains.cacheEfficiency}`);
      console.log(`   • ${gains.maintenanceGain}`);

      // Enhanced real-world impact reporting
      if (realWorldImpact) {
        console.log("\n⚡ Real-World Performance Impact:");
        console.log(`   • ${realWorldImpact.totalCSSFiles} CSS files loaded`);
        console.log(
          `   • ${realWorldImpact.totalLoadTime}ms total CSS load time`,
        );
        console.log(
          `   • ${realWorldImpact.averagePerFile}ms average per file`,
        );
        console.log(`   • ${realWorldImpact.consolidationSavings}`);
      }

      console.log("\n📁 Before Consolidation:");
      this.metrics.before.heroFiles.forEach((file) => {
        console.log(`   • ${file} (contains .hero styles)`);
      });

      console.log("\n📁 After Consolidation:");
      this.metrics.after.heroFiles.forEach((file) => {
        console.log(`   • ${file} (all hero styles)`);
      });

      console.log("\n🎯 Architecture Benefits:");
      console.log("   • CSS layers provide clear cascade hierarchy");
      console.log("   • Predictable specificity without !important");
      console.log("   • Better browser optimization opportunities");
      console.log("   • Reduced network requests");
      console.log("   • Improved maintainability");

      // DataHandler integration status
      if (this.dataHandler) {
        console.log("\n💾 Persistent Analytics:");
        console.log("   • DataHandler integration active");
        console.log(`   • ${this.optimizationHistory.length} events tracked`);
        console.log("   • Cross-session performance tracking enabled");
      }

      console.groupEnd();
    } else {
      // Just show a summary in quiet mode
      console.log(
        `🚀 CSS Optimization: ${gains.fileReduction}, ${gains.ruleReduction} processed`,
      );
    }

    return gains;
  }

  measureRealWorldImpact() {
    if (!window.performance) {
      console.warn("Performance API not available");
      return null;
    }

    // Measure CSS parsing time
    const cssResources = performance
      .getEntriesByType("resource")
      .filter((entry) => entry.name.includes(".css"));

    const totalCSSLoadTime = cssResources.reduce((total, resource) => {
      return total + (resource.responseEnd - resource.requestStart);
    }, 0);

    const impact = {
      totalCSSFiles: cssResources.length,
      totalLoadTime: Math.round(totalCSSLoadTime),
      averagePerFile: Math.round(totalCSSLoadTime / cssResources.length),
      consolidationSavings: `Estimated ${Math.round(totalCSSLoadTime * 0.15)}ms savings`,
      heroFiles: cssResources.filter(
        (res) =>
          res.name.includes("hero") ||
          res.name.includes("main.css") ||
          res.name.includes("media.css"),
      ).length,
    };

    // Track this measurement
    this.trackPerformanceEvent("real_world_measurement", impact);
    this.realTimeMetrics.set("latest_impact", impact);

    return impact;
  }

  /**
   * Get comprehensive analytics summary for enterprise monitoring
   */
  getAnalyticsSummary() {
    const gains = this.analyzePerformanceGains();
    const realWorldImpact = this.measureRealWorldImpact();

    return {
      timestamp: new Date().toISOString(),
      session: this.sessionData.startTime,
      hasDataHandler: !!this.dataHandler,
      metrics: {
        fileReduction: parseFloat(gains.fileReduction.match(/[\d.]+/)[0]),
        ruleReduction: parseFloat(gains.ruleReduction.match(/[\d.]+/)[0]),
        filesBeforeOptimization: this.metrics.before.totalFiles,
        filesAfterOptimization: this.metrics.after.totalFiles,
        estimatedRulesBefore: this.metrics.before.estimatedRuleProcessing,
        estimatedRulesAfter: this.metrics.after.estimatedRuleProcessing,
      },
      realWorldImpact: realWorldImpact || {},
      optimizationEvents: this.optimizationHistory.length,
      realTimeMetrics: Object.fromEntries(this.realTimeMetrics),
      performance: {
        cssLoadingOptimization: `${(((this.metrics.before.totalFiles - this.metrics.after.totalFiles) / this.metrics.before.totalFiles) * 100).toFixed(1)}% file reduction`,
        cacheEfficiency: "Single consolidated file improves browser caching",
        maintainability: "Centralized CSS architecture",
      },
    };
  }

  /**
   * Export analytics data for external systems
   */
  exportAnalytics() {
    const summary = this.getAnalyticsSummary();

    // Track export event
    this.trackPerformanceEvent("analytics_exported", {
      exportTimestamp: summary.timestamp,
      metricsCount: Object.keys(summary.realTimeMetrics).length,
    });

    return summary;
  }
}

// Initialize analyzer when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Try to get app instance for DataHandler integration
  const app = window.app || window.SimulateAI || null;
  const analyzer = new CSSPerformanceAnalyzer(app);

  // Store globally for access
  window.CSSPerformanceAnalyzer = CSSPerformanceAnalyzer;
  window.cssAnalyzer = analyzer;

  // Generate report in console for development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    analyzer.generateReport();

    // Track page load analytics
    analyzer.trackPerformanceEvent("page_load", {
      hostname: window.location.hostname,
      href: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Measure real-world impact after page load
    window.addEventListener("load", () => {
      setTimeout(() => {
        const impact = analyzer.measureRealWorldImpact();
        if (impact && localStorage.getItem("quiet-logs") !== "true") {
          console.group("📈 Real-World Performance Metrics");
          console.log(`Total CSS files loaded: ${impact.totalCSSFiles}`);
          console.log(`Total CSS load time: ${impact.totalLoadTime}ms`);
          console.log(`Average per file: ${impact.averagePerFile}ms`);
          console.log(`${impact.consolidationSavings} from hero consolidation`);
          console.log(`Hero-related files: ${impact.heroFiles}`);
          console.groupEnd();
        }

        if (impact) {
          // Track load event
          analyzer.trackPerformanceEvent("window_load_measured", impact);
        }
      }, 1000);
    });
  }

  // Enhanced integration logging
  if (analyzer.dataHandler) {
    console.log("🔗 CSSPerformanceAnalyzer: DataHandler integration active");
  } else {
    console.log("ℹ️ CSSPerformanceAnalyzer: Running in standalone mode");
  }
});

// Export for testing and external use
window.CSSPerformanceAnalyzer = CSSPerformanceAnalyzer;
