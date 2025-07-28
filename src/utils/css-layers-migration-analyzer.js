/**
 * CSS Layers Migration Analyzer
 * Copyright 2025 Armando Sori - Licensed under Apache License, Version 2.0
 *
 * Analyzes CSS files to determine which need migration to CSS layers architecture
 * Enhanced with DataHandler integration for tracking migration progress
 */

class CSSLayersMigrationAnalyzer {
  constructor(app = null) {
    // DataHandler integration following established patterns
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.persistentAnalytics = this.dataHandler ? true : false;

    // Migration tracking
    this.migrationData = new Map();
    this.layerUsageData = new Map();
    this.sessionData = {
      startTime: performance.now(),
      analysisEvents: [],
      migrationProgress: {},
    };

    // CSS files analysis
    this.cssFiles = {
      migrated: [
        "css-layers.css",
        "hero-consolidated.css",
        "state-management-consolidated.css",
      ],
      needsMigration: [
        "main.css",
        "design-tokens.css",
        "media.css",
        "accessibility.css",
        "navigation-highlight-fix.css",
        "footer.css",
        "simulations.css",
        "layout-components.css",
        "shared-navigation.css",
        "advanced-ui-components.css",
        "enhanced-objects.css",
        "input-utility-components.css",
        "form-input-components.css",
        "notification-toast.css",
        "onboarding-tour.css",
        "scenario-modal.css",
        "radar-chart.css",
        "card-component.css",
        "loader-spinner.css",
      ],
      layerMapping: {
        "design-tokens.css": "tokens",
        "accessibility.css": "base",
        "main.css": "base",
        "layout-components.css": "layout",
        "media.css": "layout",
        "shared-navigation.css": "components",
        "footer.css": "components",
        "simulations.css": "components",
        "advanced-ui-components.css": "components",
        "enhanced-objects.css": "components",
        "input-utility-components.css": "components",
        "form-input-components.css": "components",
        "notification-toast.css": "components",
        "onboarding-tour.css": "components",
        "scenario-modal.css": "components",
        "radar-chart.css": "components",
        "card-component.css": "components",
        "loader-spinner.css": "components",
        "navigation-highlight-fix.css": "overrides",
      },
    };

    // Auto-initialize analytics loading
    if (this.persistentAnalytics) {
      this.initializeAnalyticsAsync();
    }

    // Track initialization
    this.trackMigrationEvent("analyzer_initialized", {
      hasDataHandler: !!this.dataHandler,
      persistentMode: this.persistentAnalytics,
      totalFiles: this.cssFiles.needsMigration.length,
      migratedFiles: this.cssFiles.migrated.length,
    });
  }

  /**
   * Enhanced initialization for persistent analytics loading
   */
  async initializeAnalyticsAsync() {
    if (!this.dataHandler) return;

    try {
      const savedData = await this.loadMigrationData();
      if (savedData) {
        this.migrationData = new Map(savedData.migrationData || []);
        this.layerUsageData = new Map(savedData.layerUsageData || []);
      }
    } catch (error) {
      console.warn(
        "[CSSLayersMigrationAnalyzer] Failed to load migration data:",
        error,
      );
    }
  }

  /**
   * Load migration data from DataHandler
   */
  async loadMigrationData() {
    if (!this.dataHandler) return null;

    try {
      return await this.dataHandler.getData("css_layers_migration_analytics");
    } catch (error) {
      console.warn(
        "[CSSLayersMigrationAnalyzer] Failed to load migration analytics:",
        error,
      );
      return null;
    }
  }

  /**
   * Save migration data to DataHandler
   */
  async saveMigrationData() {
    if (!this.dataHandler) return;

    try {
      const analyticsData = {
        migrationData: Array.from(this.migrationData.entries()),
        layerUsageData: Array.from(this.layerUsageData.entries()),
        sessionData: this.sessionData,
        lastUpdate: new Date().toISOString(),
        version: "1.0",
      };

      await this.dataHandler.setData(
        "css_layers_migration_analytics",
        analyticsData,
      );
    } catch (error) {
      console.warn(
        "[CSSLayersMigrationAnalyzer] Failed to save migration analytics:",
        error,
      );
    }
  }

  /**
   * Track migration events for persistent analytics
   */
  trackMigrationEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      data: data,
      session: this.sessionData.startTime,
    };

    this.sessionData.analysisEvents.push(event);

    // Keep events manageable (last 100 events)
    if (this.sessionData.analysisEvents.length > 100) {
      this.sessionData.analysisEvents =
        this.sessionData.analysisEvents.slice(-100);
    }

    // Auto-save if persistent mode enabled
    if (this.persistentAnalytics) {
      this.saveMigrationData().catch((err) =>
        console.warn("[CSSLayersMigrationAnalyzer] Auto-save failed:", err),
      );
    }
  }

  /**
   * Analyze migration priorities and requirements
   */
  analyzeMigrationPriorities() {
    const analysis = {
      highPriority: [],
      mediumPriority: [],
      lowPriority: [],
      layerDistribution: {
        tokens: 0,
        base: 0,
        layout: 0,
        components: 0,
        utilities: 0,
        overrides: 0,
      },
    };

    // High priority: Core infrastructure files
    const highPriorityFiles = [
      "design-tokens.css",
      "main.css",
      "media.css",
      "accessibility.css",
    ];

    // Medium priority: Layout and component files
    const mediumPriorityFiles = [
      "layout-components.css",
      "shared-navigation.css",
      "footer.css",
      "simulations.css",
    ];

    this.cssFiles.needsMigration.forEach((file) => {
      const targetLayer = this.cssFiles.layerMapping[file];

      if (highPriorityFiles.includes(file)) {
        analysis.highPriority.push({ file, targetLayer });
      } else if (mediumPriorityFiles.includes(file)) {
        analysis.mediumPriority.push({ file, targetLayer });
      } else {
        analysis.lowPriority.push({ file, targetLayer });
      }

      if (targetLayer) {
        analysis.layerDistribution[targetLayer]++;
      }
    });

    // Track analysis
    this.trackMigrationEvent("priorities_analyzed", analysis);

    return analysis;
  }

  /**
   * Generate migration recommendations
   */
  generateMigrationPlan() {
    const priorities = this.analyzeMigrationPriorities();

    const plan = {
      phase1: {
        title: "Foundation Layer Migration",
        description:
          "Migrate core infrastructure files to establish proper layer hierarchy",
        files: priorities.highPriority,
        estimatedEffort: "2-3 hours",
        benefits:
          "Establishes design system foundation and base styles in proper layers",
      },
      phase2: {
        title: "Layout & Component Migration",
        description:
          "Migrate layout systems and major components to components layer",
        files: priorities.mediumPriority,
        estimatedEffort: "4-6 hours",
        benefits:
          "Improves component cascade predictability and reduces specificity conflicts",
      },
      phase3: {
        title: "UI Components & Utilities",
        description: "Migrate remaining UI components and utility styles",
        files: priorities.lowPriority,
        estimatedEffort: "3-4 hours",
        benefits: "Complete CSS layers architecture with full cascade control",
      },
      totalFiles: this.cssFiles.needsMigration.length,
      layerDistribution: priorities.layerDistribution,
      estimatedTotalEffort: "9-13 hours",
    };

    // Track plan generation
    this.trackMigrationEvent("migration_plan_generated", {
      totalPhases: 3,
      totalFiles: plan.totalFiles,
      estimatedEffort: plan.estimatedTotalEffort,
    });

    return plan;
  }

  /**
   * Analyze current CSS layers usage in loaded stylesheets
   */
  analyzeCurrentLayerUsage() {
    const usage = {
      layersDetected: false,
      filesWithLayers: 0,
      filesWithoutLayers: 0,
      layerUsage: {
        reset: 0,
        tokens: 0,
        base: 0,
        layout: 0,
        components: 0,
        utilities: 0,
        overrides: 0,
      },
    };

    // Check if CSS layers are supported
    if (!CSS.supports("@layer", "test")) {
      usage.browserSupport = false;
      usage.fallbackNeeded = true;
    } else {
      usage.browserSupport = true;
      usage.fallbackNeeded = false;
    }

    // Analyze loaded stylesheets for @layer usage
    const stylesheets = Array.from(document.styleSheets);

    stylesheets.forEach((sheet) => {
      try {
        const rules = Array.from(sheet.cssRules || []);
        let hasLayers = false;

        rules.forEach((rule) => {
          if (
            rule.type === CSSRule.SUPPORTS_RULE &&
            rule.cssText.includes("@layer")
          ) {
            hasLayers = true;
            usage.layersDetected = true;

            // Try to detect which layers are used
            Object.keys(usage.layerUsage).forEach((layer) => {
              if (rule.cssText.includes(`@layer ${layer}`)) {
                usage.layerUsage[layer]++;
              }
            });
          }
        });

        if (hasLayers) {
          usage.filesWithLayers++;
        } else {
          usage.filesWithoutLayers++;
        }
      } catch (error) {
        // CORS or other access issues with stylesheet
        console.debug("Could not analyze stylesheet:", sheet.href);
      }
    });

    // Track usage analysis
    this.trackMigrationEvent("layer_usage_analyzed", usage);
    this.layerUsageData.set("current_analysis", usage);

    return usage;
  }

  /**
   * Generate comprehensive migration report
   */
  generateMigrationReport() {
    const plan = this.generateMigrationPlan();
    const usage = this.analyzeCurrentLayerUsage();

    console.group("🔄 CSS Layers Migration Analysis");

    console.log("📊 Current Status:");
    console.log(
      `   • ✅ Files already migrated: ${this.cssFiles.migrated.length}`,
    );
    console.log(
      `   • 🔄 Files needing migration: ${this.cssFiles.needsMigration.length}`,
    );
    console.log(
      `   • 🎯 CSS Layers browser support: ${usage.browserSupport ? "Yes" : "No"}`,
    );
    console.log(
      `   • 📈 Current layer usage detected: ${usage.layersDetected ? "Yes" : "No"}`,
    );

    console.log("\n🚀 Migration Plan:");
    console.log(
      `📋 Phase 1 - ${plan.phase1.title} (${plan.phase1.files.length} files)`,
    );
    plan.phase1.files.forEach((item) => {
      console.log(`   • ${item.file} → @layer ${item.targetLayer}`);
    });

    console.log(
      `📋 Phase 2 - ${plan.phase2.title} (${plan.phase2.files.length} files)`,
    );
    plan.phase2.files.forEach((item) => {
      console.log(`   • ${item.file} → @layer ${item.targetLayer}`);
    });

    console.log(
      `📋 Phase 3 - ${plan.phase3.title} (${plan.phase3.files.length} files)`,
    );
    plan.phase3.files.forEach((item) => {
      console.log(`   • ${item.file} → @layer ${item.targetLayer}`);
    });

    console.log("\n🎯 Expected Benefits:");
    console.log("   • Predictable CSS cascade without specificity wars");
    console.log("   • Better browser optimization opportunities");
    console.log("   • Easier maintenance and debugging");
    console.log("   • Future-proof architecture for scaling");

    console.log(`\n⏱️ Estimated effort: ${plan.estimatedTotalEffort}`);

    // DataHandler integration status
    if (this.dataHandler) {
      console.log("\n💾 Migration Tracking:");
      console.log("   • DataHandler integration active");
      console.log(
        `   • ${this.sessionData.analysisEvents.length} events tracked`,
      );
      console.log("   • Cross-session migration progress saved");
    }

    console.groupEnd();

    return { plan, usage };
  }

  /**
   * Get migration analytics summary for enterprise monitoring
   */
  getMigrationAnalytics() {
    const plan = this.generateMigrationPlan();
    const usage = this.analyzeCurrentLayerUsage();

    return {
      timestamp: new Date().toISOString(),
      session: this.sessionData.startTime,
      hasDataHandler: !!this.dataHandler,
      progress: {
        migratedFiles: this.cssFiles.migrated.length,
        pendingFiles: this.cssFiles.needsMigration.length,
        completionPercentage: Math.round(
          (this.cssFiles.migrated.length /
            (this.cssFiles.migrated.length +
              this.cssFiles.needsMigration.length)) *
            100,
        ),
      },
      browserSupport: usage.browserSupport,
      layerUsage: usage.layerUsage,
      migrationPlan: plan,
      events: this.sessionData.analysisEvents.length,
      recommendations: {
        nextPhase:
          plan.phase1.files.length > 0
            ? "phase1"
            : plan.phase2.files.length > 0
              ? "phase2"
              : "phase3",
        priorityFiles: plan.phase1.files.slice(0, 3).map((item) => item.file),
      },
    };
  }

  /**
   * Export migration analytics for external systems
   */
  exportMigrationAnalytics() {
    const analytics = this.getMigrationAnalytics();

    // Track export event
    this.trackMigrationEvent("analytics_exported", {
      exportTimestamp: analytics.timestamp,
      completionPercentage: analytics.progress.completionPercentage,
    });

    return analytics;
  }
}

// Initialize analyzer when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Try to get app instance for DataHandler integration
  const app = window.app || window.SimulateAI || null;
  const analyzer = new CSSLayersMigrationAnalyzer(app);

  // Store globally for access
  window.CSSLayersMigrationAnalyzer = CSSLayersMigrationAnalyzer;
  window.cssLayersMigrationAnalyzer = analyzer;

  // Generate migration report in console for development
  if (
    window.location.hostname === "localhost" ||
    window.location.hostname === "127.0.0.1"
  ) {
    analyzer.generateMigrationReport();

    // Track page load analytics
    analyzer.trackMigrationEvent("page_load_analysis", {
      hostname: window.location.hostname,
      href: window.location.href,
      timestamp: new Date().toISOString(),
    });
  }

  // Enhanced integration logging
  if (analyzer.dataHandler) {
    console.log(
      "🔗 CSSLayersMigrationAnalyzer: DataHandler integration active",
    );
  } else {
    console.log("ℹ️ CSSLayersMigrationAnalyzer: Running in standalone mode");
  }
});

// Export for external use
window.CSSLayersMigrationAnalyzer = CSSLayersMigrationAnalyzer;
