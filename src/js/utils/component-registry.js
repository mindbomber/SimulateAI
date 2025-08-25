/**
 * Configuration-Aware Component Registry
 * Phase 3.4: Enhanced with DataHandler integration for persistent component tracking
 * Manages component lifecycle based on JSON SSOT configurations
 *
 * Features:
 * - Lazy loading based on configuration
 * - Component health monitoring
 * - Configuration hot-reloading
 * - Performance optimization
 * - Persistent component lifecycle tracking (Phase 3.4)
 * - Component dependency management
 * - Analytics integration for component usage
 */

import { configManager } from "./configuration-manager.js";
import logger from "./logger.js";

class ComponentRegistry {
  constructor(app = null) {
    // Phase 3.4: Enhanced constructor with app parameter for DataHandler integration
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

    this.components = new Map();
    this.componentFactories = new Map();
    this.healthStatus = new Map();
    this.loadTimes = new Map();
    this.configWatchers = new Map();

    // Phase 3.4: Enhanced tracking capabilities
    this.componentLifecycle = new Map();
    this.dependencyGraph = new Map();
    this.usageMetrics = new Map();
    this.persistentData = {
      componentStats: {},
      lifecycleHistory: [],
      performanceBaseline: {},
      dependencyCache: {},
    };

    // Phase 3.4: Initialize DataHandler integration (warn-once if missing)
    this.initializeDataHandlerIntegration();

    // Register component factories
    this.registerComponentFactories();
  }

  /**
   * Phase 3.4: Initialize DataHandler integration for persistent component tracking
   */
  async initializeDataHandlerIntegration() {
    if (!this.dataHandler) {
      // Warn only once per page load
      try {
        const flagKey = "componentRegistry_warned_no_datahandler";
        const hasWarned =
          window.__componentRegistryWarnedNoDH ||
          (typeof sessionStorage !== "undefined" &&
            sessionStorage.getItem(flagKey) === "true");
        if (!hasWarned) {
          logger.warn(
            "[ComponentRegistry] DataHandler not available, running in standalone mode",
          );
          window.__componentRegistryWarnedNoDH = true;
          try {
            if (typeof sessionStorage !== "undefined") {
              sessionStorage.setItem(flagKey, "true");
            }
          } catch (_) {
            // ignore sessionStorage errors
          }
        }
      } catch (_) {
        // If any error, fall back to a single warn
        logger.warn(
          "[ComponentRegistry] DataHandler not available, running in standalone mode",
        );
      }
      return;
    }

    try {
      // Load persistent component data
      await this.loadComponentData();

      // Initialize component analytics
      this.initializeComponentAnalytics();

      logger.debug(
        "[ComponentRegistry] DataHandler integration initialized successfully",
      );
    } catch (error) {
      logger.error(
        "[ComponentRegistry] Failed to initialize DataHandler integration:",
        error,
      );
    }
  }

  /**
   * Phase 3.4: Load persistent component data from DataHandler
   */
  async loadComponentData() {
    if (!this.dataHandler) return;

    try {
      const componentData =
        (await this.dataHandler.get("component_registry_data")) || {};

      this.persistentData = {
        componentStats: componentData.componentStats || {},
        lifecycleHistory: componentData.lifecycleHistory || [],
        performanceBaseline: componentData.performanceBaseline || {},
        dependencyCache: componentData.dependencyCache || {},
        ...componentData,
      };

      // Restore component health status from persistent data
      if (componentData.healthStatus) {
        for (const [componentId, health] of Object.entries(
          componentData.healthStatus,
        )) {
          this.healthStatus.set(componentId, health);
        }
      }

      // Restore usage metrics
      if (componentData.usageMetrics) {
        for (const [componentId, metrics] of Object.entries(
          componentData.usageMetrics,
        )) {
          this.usageMetrics.set(componentId, metrics);
        }
      }

      logger.debug("[ComponentRegistry] Loaded persistent component data", {
        statsCount: Object.keys(this.persistentData.componentStats).length,
        historyEntries: this.persistentData.lifecycleHistory.length,
      });
    } catch (error) {
      logger.error("[ComponentRegistry] Failed to load component data:", error);
    }
  }

  /**
   * Phase 3.4: Save component data to DataHandler
   */
  async saveComponentData() {
    if (!this.dataHandler) return;

    try {
      const dataToSave = {
        ...this.persistentData,
        healthStatus: Object.fromEntries(this.healthStatus),
        usageMetrics: Object.fromEntries(this.usageMetrics),
        lastUpdate: new Date().toISOString(),
        version: "3.4.0",
      };

      await this.dataHandler.set("component_registry_data", dataToSave);

      logger.debug("[ComponentRegistry] Saved component data to DataHandler");
    } catch (error) {
      logger.error("[ComponentRegistry] Failed to save component data:", error);
    }
  }

  /**
   * Phase 3.4: Initialize component analytics tracking
   */
  initializeComponentAnalytics() {
    if (!this.app?.analyticsManager) return;

    try {
      // Track registry initialization
      this.app.analyticsManager.trackEvent("component_registry_initialized", {
        totalFactories: this.componentFactories.size,
        hasDataHandler: !!this.dataHandler,
        persistentDataLoaded:
          Object.keys(this.persistentData.componentStats).length > 0,
        timestamp: new Date().toISOString(),
      });

      logger.debug("[ComponentRegistry] Analytics tracking initialized");
    } catch (error) {
      logger.warn(
        "[ComponentRegistry] Failed to initialize analytics tracking:",
        error,
      );
    }
  }

  /**
   * Phase 3.4: Track component lifecycle events
   */
  trackComponentLifecycle(componentId, event, metadata = {}) {
    const lifecycleEntry = {
      componentId,
      event,
      timestamp: new Date().toISOString(),
      metadata: {
        ...metadata,
        sessionId: this.app?.sessionId,
        version: this.app?.version,
      },
    };

    // Add to lifecycle history
    this.persistentData.lifecycleHistory.push(lifecycleEntry);

    // Keep only last 1000 entries to prevent memory bloat
    if (this.persistentData.lifecycleHistory.length > 1000) {
      this.persistentData.lifecycleHistory =
        this.persistentData.lifecycleHistory.slice(-1000);
    }

    // Update component lifecycle map
    if (!this.componentLifecycle.has(componentId)) {
      this.componentLifecycle.set(componentId, []);
    }
    this.componentLifecycle.get(componentId).push(lifecycleEntry);

    // Track with analytics if available
    if (this.app?.analyticsManager) {
      this.app.analyticsManager.trackEvent("component_lifecycle_event", {
        componentId,
        event,
        metadata,
      });
    }

    // Auto-save if DataHandler is available (debounced)
    this.debouncedSave();
  }

  /**
   * Phase 3.4: Debounced save to prevent excessive I/O
   */
  debouncedSave() {
    if (this.saveTimeout) {
      clearTimeout(this.saveTimeout);
    }

    this.saveTimeout = setTimeout(() => {
      this.saveComponentData().catch((error) => {
        logger.error("[ComponentRegistry] Debounced save failed:", error);
      });
    }, 2000); // Save after 2 seconds of inactivity
  }

  /**
   * Register all component factories for lazy loading
   */
  registerComponentFactories() {
    this.componentFactories.set("badge-modal", {
      factory: () => import("../components/badge-modal.js"),
      configId: "badge-modal",
      singleton: false,
    });

    this.componentFactories.set("category-header", {
      factory: () => import("../components/category-header.js"),
      configId: "category-header",
      singleton: true,
    });

    this.componentFactories.set("pre-launch-modal", {
      factory: () => import("../components/pre-launch-modal.js"),
      configId: "pre-launch-modal",
      singleton: false,
    });

    this.componentFactories.set("scenario-modal", {
      factory: () => import("../components/scenario-modal.js"),
      configId: "scenario-modal",
      singleton: false,
    });

    this.componentFactories.set("radar-chart", {
      factory: () => import("../components/radar-chart.js"),
      configId: "radar-chart",
      singleton: false,
    });

    // Also register with camelCase naming for app-config.json compatibility
    this.componentFactories.set("radarChart", {
      factory: () => import("../components/radar-chart.js"),
      configId: "radarChart", // Use app-config.json naming
      singleton: false,
    });

    this.componentFactories.set("scenario-card", {
      factory: () => import("../components/scenario-card.js"),
      configId: "scenario-card",
      singleton: false,
    });
  }

  /**
   * Get or create component instance with configuration
   * Phase 3.4: Enhanced with lifecycle tracking and persistent analytics
   */
  async getComponent(componentId, ...args) {
    const factory = this.componentFactories.get(componentId);
    if (!factory) {
      throw new Error(`Component not registered: ${componentId}`);
    }

    // Phase 3.4: Track component request
    this.trackComponentLifecycle(componentId, "requested", {
      args: args.length,
      singleton: factory.singleton,
    });

    // Check if singleton and already exists
    if (factory.singleton && this.components.has(componentId)) {
      this.trackComponentLifecycle(componentId, "singleton_reused");
      this.updateUsageMetrics(componentId, "reuse");
      return this.components.get(componentId);
    }

    const startTime = performance.now();

    try {
      // Phase 3.4: Track component creation start
      this.trackComponentLifecycle(componentId, "creation_started", {
        configId: factory.configId,
      });

      // Load component configuration
      const config = await configManager.getComponentConfig(factory.configId);

      // Load component module
      const module = await factory.factory();
      const ComponentClass =
        module.default || module[this.toPascalCase(componentId)];

      // Special handling for components with static configuration loading
      if (
        ComponentClass.loadConfiguration &&
        typeof ComponentClass.loadConfiguration === "function"
      ) {
        await ComponentClass.loadConfiguration();
        logger.debug(
          `[ComponentRegistry] Loaded static configuration for ${componentId}`,
        );
      }

      // Create instance with appropriate parameters based on component type
      let instance;
      if (componentId === "radar-chart" || componentId === "radarChart") {
        // RadarChart expects (containerId, options)
        // Use provided container ID from args, or fallback to default
        const containerId =
          args[0]?.containerId || args[0] || "ethics-radar-container";
        const options = args[0]?.containerId
          ? args[1] || {}
          : args[1] || args[0] || {};

        // Check if container exists in DOM before creating RadarChart
        if (typeof document !== "undefined") {
          const container = document.getElementById(containerId);
          if (!container) {
            logger.warn(
              `[ComponentRegistry] Container '${containerId}' not found, will be created or RadarChart will handle it`,
            );
          }
        }

        instance = new ComponentClass(containerId, {
          config,
          ...options,
        });
      } else {
        // Standard component creation with config as first parameter
        instance = new ComponentClass(config, ...args);
      }

      // Store singleton instances
      if (factory.singleton) {
        this.components.set(componentId, instance);
      }

      // Track performance and health
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(componentId, loadTime);
      this.healthStatus.set(componentId, "healthy");

      // Phase 3.4: Enhanced analytics and persistence
      this.updateUsageMetrics(componentId, "creation", {
        loadTime,
        successful: true,
      });

      this.updateComponentStats(componentId, {
        lastCreated: new Date().toISOString(),
        loadTime,
        successful: true,
        totalCreations:
          (this.persistentData.componentStats[componentId]?.totalCreations ||
            0) + 1,
      });

      // Set up configuration watching for hot-reload
      this.setupConfigWatcher(componentId, instance);

      // Phase 3.4: Track successful creation
      this.trackComponentLifecycle(componentId, "creation_completed", {
        loadTime: Math.round(loadTime),
        singleton: factory.singleton,
        successful: true,
      });

      logger.debug(`[ComponentRegistry] Created ${componentId}`, {
        loadTime: Math.round(loadTime),
        singleton: factory.singleton,
      });

      return instance;
    } catch (error) {
      this.healthStatus.set(componentId, "failed");

      // Phase 3.4: Track creation failure
      this.trackComponentLifecycle(componentId, "creation_failed", {
        error: error.message,
        loadTime: performance.now() - startTime,
      });

      this.updateUsageMetrics(componentId, "failure", {
        error: error.message,
      });

      logger.error(
        `[ComponentRegistry] Failed to create ${componentId}:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Phase 3.4: Update usage metrics for component analytics
   */
  updateUsageMetrics(componentId, eventType, metadata = {}) {
    if (!this.usageMetrics.has(componentId)) {
      this.usageMetrics.set(componentId, {
        totalRequests: 0,
        totalCreations: 0,
        totalReuses: 0,
        totalFailures: 0,
        averageLoadTime: 0,
        lastUsed: null,
        firstUsed: null,
      });
    }

    const metrics = this.usageMetrics.get(componentId);
    const now = new Date().toISOString();

    // Update first used timestamp
    if (!metrics.firstUsed) {
      metrics.firstUsed = now;
    }
    metrics.lastUsed = now;

    // Update event-specific metrics
    switch (eventType) {
      case "creation":
        metrics.totalCreations++;
        if (metadata.loadTime) {
          // Calculate rolling average load time
          const currentCount = metrics.totalCreations;
          metrics.averageLoadTime =
            (metrics.averageLoadTime * (currentCount - 1) + metadata.loadTime) /
            currentCount;
        }
        break;
      case "reuse":
        metrics.totalReuses++;
        break;
      case "failure":
        metrics.totalFailures++;
        break;
    }

    metrics.totalRequests = metrics.totalCreations + metrics.totalReuses;
  }

  /**
   * Phase 3.4: Update component statistics for persistent storage
   */
  updateComponentStats(componentId, stats) {
    if (!this.persistentData.componentStats[componentId]) {
      this.persistentData.componentStats[componentId] = {
        totalCreations: 0,
        totalFailures: 0,
        averageLoadTime: 0,
        firstCreated: null,
        lastCreated: null,
        version: this.app?.version || "unknown",
      };
    }

    const componentStats = this.persistentData.componentStats[componentId];

    // Merge new stats
    Object.assign(componentStats, stats);

    // Update first created timestamp
    if (!componentStats.firstCreated && stats.lastCreated) {
      componentStats.firstCreated = stats.lastCreated;
    }
  }

  /**
   * Phase 3.4: Get comprehensive component analytics
   */
  getComponentAnalytics(componentId = null) {
    if (componentId) {
      // Get analytics for specific component
      return {
        usageMetrics: this.usageMetrics.get(componentId) || null,
        persistentStats:
          this.persistentData.componentStats[componentId] || null,
        healthStatus: this.healthStatus.get(componentId) || "unknown",
        lifecycle: this.componentLifecycle.get(componentId) || [],
        currentLoadTime: this.loadTimes.get(componentId) || null,
        isLoaded: this.components.has(componentId),
      };
    }

    // Get analytics for all components
    const analytics = {
      overview: {
        totalComponents: this.componentFactories.size,
        loadedComponents: this.components.size,
        healthyComponents: Array.from(this.healthStatus.values()).filter(
          (s) => s === "healthy",
        ).length,
        failedComponents: Array.from(this.healthStatus.values()).filter(
          (s) => s === "failed",
        ).length,
        averageLoadTime: this.calculateAverageLoadTime(),
        totalLifecycleEvents: this.persistentData.lifecycleHistory.length,
      },
      components: {},
      trends: this.getUsageTrends(),
      dependencies: this.analyzeDependencies(),
    };

    // Add detailed analytics for each component
    for (const componentId of this.componentFactories.keys()) {
      analytics.components[componentId] =
        this.getComponentAnalytics(componentId);
    }

    return analytics;
  }

  /**
   * Phase 3.4: Analyze usage trends over time
   */
  getUsageTrends() {
    const trends = {
      hourly: {},
      daily: {},
      popular: [],
      performance: {},
    };

    // Analyze lifecycle history for trends
    this.persistentData.lifecycleHistory.forEach((entry) => {
      const date = new Date(entry.timestamp);
      const hour = date.getHours();
      const day = date.toDateString();

      // Track hourly usage
      if (!trends.hourly[hour]) trends.hourly[hour] = 0;
      trends.hourly[hour]++;

      // Track daily usage
      if (!trends.daily[day]) trends.daily[day] = 0;
      trends.daily[day]++;
    });

    // Get most popular components
    const componentUsage = new Map();
    this.usageMetrics.forEach((metrics, componentId) => {
      componentUsage.set(componentId, metrics.totalRequests);
    });

    trends.popular = Array.from(componentUsage.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([componentId, usage]) => ({ componentId, usage }));

    // Performance trends
    this.loadTimes.forEach((loadTime, componentId) => {
      const avgLoadTime =
        this.usageMetrics.get(componentId)?.averageLoadTime || loadTime;
      trends.performance[componentId] = {
        currentLoadTime: loadTime,
        averageLoadTime: avgLoadTime,
        performanceRating: this.calculatePerformanceRating(
          loadTime,
          avgLoadTime,
        ),
      };
    });

    return trends;
  }

  /**
   * Phase 3.4: Analyze component dependencies
   */
  analyzeDependencies() {
    // This would be enhanced with actual dependency tracking in a real implementation
    // For now, provide basic dependency information
    return {
      graph: Object.fromEntries(this.dependencyGraph),
      circular: [], // Would detect circular dependencies
      depth: {}, // Would calculate dependency depth
      critical: [], // Would identify critical components
    };
  }

  /**
   * Phase 3.4: Calculate performance rating for a component
   */
  calculatePerformanceRating(currentTime, averageTime) {
    if (!averageTime || averageTime === 0) return "unknown";

    const ratio = currentTime / averageTime;
    if (ratio <= 0.8) return "excellent";
    if (ratio <= 1.2) return "good";
    if (ratio <= 1.5) return "fair";
    return "poor";
  }

  /**
   * Set up configuration watcher for hot-reloading
   */
  setupConfigWatcher(componentId, instance) {
    // In a real application, you might set up file watchers or WebSocket connections
    // For now, we'll provide a manual refresh mechanism
    const watcher = {
      refresh: async () => {
        try {
          const newConfig = await configManager.loadComponentConfig(
            componentId,
            true,
          );

          if (instance.updateConfiguration) {
            await instance.updateConfiguration(newConfig);
            logger.info(
              `[ComponentRegistry] Hot-reloaded config for ${componentId}`,
            );
          }
        } catch (error) {
          logger.error(
            `[ComponentRegistry] Failed to hot-reload config for ${componentId}:`,
            error,
          );
        }
      },
    };

    this.configWatchers.set(componentId, watcher);
  }

  /**
   * Preload components marked for preloading
   */
  async preloadComponents() {
    const appConfig = await configManager.initialize();
    if (!appConfig?.app?.components) return;

    const preloadComponents = Object.entries(appConfig.app.components)
      .filter(([, config]) => config.preload)
      .map(([componentId]) => componentId);

    logger.info(
      "[ComponentRegistry] Preloading components:",
      preloadComponents,
    );

    const preloadPromises = preloadComponents.map(async (componentId) => {
      try {
        // Just load the config and module, don't instantiate
        const factory = this.componentFactories.get(componentId);
        if (factory) {
          await Promise.all([
            configManager.getComponentConfig(factory.configId),
            factory.factory(),
          ]);
          logger.debug(`[ComponentRegistry] Preloaded ${componentId}`);
        }
      } catch (error) {
        logger.warn(
          `[ComponentRegistry] Failed to preload ${componentId}:`,
          error,
        );
      }
    });

    await Promise.allSettled(preloadPromises);
  }

  /**
   * Hot-reload configuration for all components
   */
  async hotReloadConfigurations() {
    logger.info("[ComponentRegistry] Hot-reloading all configurations...");

    const reloadPromises = Array.from(this.configWatchers.values()).map(
      (watcher) => watcher.refresh(),
    );

    await Promise.allSettled(reloadPromises);
    logger.info("[ComponentRegistry] Configuration hot-reload completed");
  }

  /**
   * Get component health status
   * Phase 3.4: Enhanced with comprehensive health analytics
   */
  getHealthStatus() {
    const total = this.componentFactories.size;
    const loaded = this.components.size;
    const healthy = Array.from(this.healthStatus.values()).filter(
      (status) => status === "healthy",
    ).length;
    const failed = Array.from(this.healthStatus.values()).filter(
      (status) => status === "failed",
    ).length;

    // Phase 3.4: Enhanced health metrics
    const healthAnalysis = {
      total,
      loaded,
      healthy,
      failed,
      status: failed === 0 ? "healthy" : "degraded",
      loadingRatio: total > 0 ? (loaded / total) * 100 : 0,
      healthRatio: total > 0 ? (healthy / total) * 100 : 0,
      failureRatio: total > 0 ? (failed / total) * 100 : 0,
      components: Object.fromEntries(this.healthStatus),
      loadTimes: Object.fromEntries(this.loadTimes),
      // Add persistent health data
      persistentStats: this.persistentData.componentStats,
      recentFailures: this.getRecentFailures(),
      performanceIssues: this.identifyPerformanceIssues(),
    };

    return healthAnalysis;
  }

  /**
   * Get performance metrics
   * Phase 3.4: Enhanced with analytics and trends
   */
  getPerformanceMetrics() {
    const basicMetrics = {
      averageLoadTime: this.calculateAverageLoadTime(),
      loadTimes: Object.fromEntries(this.loadTimes),
      totalComponents: this.componentFactories.size,
      loadedComponents: this.components.size,
    };

    // Phase 3.4: Add comprehensive performance analytics
    const enhancedMetrics = {
      ...basicMetrics,
      usageAnalytics: Object.fromEntries(this.usageMetrics),
      performanceBaseline: this.persistentData.performanceBaseline,
      componentTrends: this.getUsageTrends(),
      performanceRatings: this.getPerformanceRatings(),
      bottlenecks: this.identifyBottlenecks(),
      efficiency: this.calculateEfficiencyMetrics(),
    };

    return enhancedMetrics;
  }

  /**
   * Phase 3.4: Get recent component failures for health analysis
   */
  getRecentFailures(hours = 24) {
    const cutoffTime = new Date(Date.now() - hours * 60 * 60 * 1000);

    return this.persistentData.lifecycleHistory
      .filter(
        (entry) =>
          entry.event === "creation_failed" &&
          new Date(entry.timestamp) > cutoffTime,
      )
      .map((entry) => ({
        componentId: entry.componentId,
        timestamp: entry.timestamp,
        error: entry.metadata.error,
        loadTime: entry.metadata.loadTime,
      }));
  }

  /**
   * Phase 3.4: Identify components with performance issues
   */
  identifyPerformanceIssues() {
    const issues = [];
    const performanceThreshold = 1000; // 1 second threshold

    this.loadTimes.forEach((loadTime, componentId) => {
      const metrics = this.usageMetrics.get(componentId);

      if (loadTime > performanceThreshold) {
        issues.push({
          componentId,
          issue: "slow_load_time",
          currentTime: loadTime,
          threshold: performanceThreshold,
          severity: loadTime > 2000 ? "high" : "medium",
        });
      }

      if (metrics && metrics.averageLoadTime > performanceThreshold) {
        issues.push({
          componentId,
          issue: "consistently_slow",
          averageTime: metrics.averageLoadTime,
          threshold: performanceThreshold,
          severity: "medium",
        });
      }

      if (metrics && metrics.totalFailures > 0) {
        const failureRate = metrics.totalFailures / metrics.totalRequests;
        if (failureRate > 0.1) {
          // 10% failure rate threshold
          issues.push({
            componentId,
            issue: "high_failure_rate",
            failureRate: Math.round(failureRate * 100),
            threshold: 10,
            severity: failureRate > 0.25 ? "high" : "medium",
          });
        }
      }
    });

    return issues;
  }

  /**
   * Phase 3.4: Get performance ratings for all components
   */
  getPerformanceRatings() {
    const ratings = {};

    this.loadTimes.forEach((loadTime, componentId) => {
      const metrics = this.usageMetrics.get(componentId);
      const avgLoadTime = metrics?.averageLoadTime || loadTime;

      ratings[componentId] = {
        rating: this.calculatePerformanceRating(loadTime, avgLoadTime),
        currentTime: loadTime,
        averageTime: avgLoadTime,
        usageCount: metrics?.totalRequests || 0,
      };
    });

    return ratings;
  }

  /**
   * Phase 3.4: Identify performance bottlenecks
   */
  identifyBottlenecks() {
    const bottlenecks = [];

    // Find slowest components
    const sortedByTime = Array.from(this.loadTimes.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 3);

    sortedByTime.forEach(([componentId, loadTime]) => {
      if (loadTime > 500) {
        // Components taking more than 500ms
        bottlenecks.push({
          componentId,
          type: "slow_initialization",
          loadTime,
          impact: "high",
        });
      }
    });

    // Find frequently failing components
    this.usageMetrics.forEach((metrics, componentId) => {
      if (metrics.totalFailures > 2) {
        bottlenecks.push({
          componentId,
          type: "frequent_failures",
          failures: metrics.totalFailures,
          impact: "medium",
        });
      }
    });

    return bottlenecks;
  }

  /**
   * Phase 3.4: Calculate efficiency metrics
   */
  calculateEfficiencyMetrics() {
    const totalRequests = Array.from(this.usageMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.totalRequests,
      0,
    );

    const totalFailures = Array.from(this.usageMetrics.values()).reduce(
      (sum, metrics) => sum + metrics.totalFailures,
      0,
    );

    const successRate =
      totalRequests > 0
        ? ((totalRequests - totalFailures) / totalRequests) * 100
        : 100;

    const cacheHitRate =
      (Array.from(this.usageMetrics.values()).reduce(
        (sum, metrics) => sum + metrics.totalReuses,
        0,
      ) /
        Math.max(totalRequests, 1)) *
      100;

    return {
      successRate: Math.round(successRate * 100) / 100,
      cacheHitRate: Math.round(cacheHitRate * 100) / 100,
      totalRequests,
      totalFailures,
      averageLoadTime: this.calculateAverageLoadTime(),
      componentsLoaded: this.components.size,
      componentsAvailable: this.componentFactories.size,
    };
  }

  /**
   * Calculate average load time
   */
  calculateAverageLoadTime() {
    if (this.loadTimes.size === 0) return 0;

    const times = Array.from(this.loadTimes.values());
    return times.reduce((sum, time) => sum + time, 0) / times.length;
  }

  /**
   * Clear component cache
   */
  clearCache() {
    this.components.clear();
    this.healthStatus.clear();
    this.loadTimes.clear();
    this.configWatchers.clear();
    logger.info("[ComponentRegistry] Component cache cleared");
  }

  /**
   * Convert string to PascalCase
   */
  toPascalCase(str) {
    return str
      .split("-")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join("");
  }

  /**
   * Check if component is available
   */
  isComponentAvailable(componentId) {
    return this.componentFactories.has(componentId);
  }

  /**
   * Get list of available components
   */
  getAvailableComponents() {
    return Array.from(this.componentFactories.keys());
  }

  /**
   * Phase 3.4: Export component data for external systems
   */
  exportComponentData() {
    return {
      metadata: {
        exportDate: new Date().toISOString(),
        version: "3.4.0",
        totalComponents: this.componentFactories.size,
        appVersion: this.app?.version || "unknown",
      },
      health: this.getHealthStatus(),
      performance: this.getPerformanceMetrics(),
      analytics: this.getComponentAnalytics(),
      lifecycle: this.persistentData.lifecycleHistory.slice(-100), // Last 100 events
      configuration: {
        hasDataHandler: !!this.dataHandler,
        hasAnalytics: !!this.app?.analyticsManager,
        factoryCount: this.componentFactories.size,
      },
    };
  }

  /**
   * Phase 3.4: Get global analytics across all registry instances
   */
  static getGlobalAnalytics() {
    const instances = ComponentRegistry._instances || [componentRegistry];

    const globalData = {
      totalInstances: instances.length,
      aggregatedMetrics: {
        totalComponents: 0,
        totalLoaded: 0,
        totalRequests: 0,
        totalFailures: 0,
        averageLoadTime: 0,
      },
      instanceSummaries: [],
    };

    let totalLoadTimes = [];

    instances.forEach((instance, index) => {
      const health = instance.getHealthStatus();

      globalData.aggregatedMetrics.totalComponents += health.total;
      globalData.aggregatedMetrics.totalLoaded += health.loaded;

      // Aggregate usage metrics
      instance.usageMetrics.forEach((metrics) => {
        globalData.aggregatedMetrics.totalRequests += metrics.totalRequests;
        globalData.aggregatedMetrics.totalFailures += metrics.totalFailures;
      });

      // Collect load times for global average
      totalLoadTimes = totalLoadTimes.concat(
        Array.from(instance.loadTimes.values()),
      );

      globalData.instanceSummaries.push({
        instanceId: index,
        appVersion: instance.app?.version || "standalone",
        hasDataHandler: !!instance.dataHandler,
        componentCount: health.total,
        loadedCount: health.loaded,
        healthStatus: health.status,
      });
    });

    // Calculate global average load time
    if (totalLoadTimes.length > 0) {
      globalData.aggregatedMetrics.averageLoadTime =
        totalLoadTimes.reduce((sum, time) => sum + time, 0) /
        totalLoadTimes.length;
    }

    return globalData;
  }

  /**
   * Phase 3.4: Create enhanced ComponentRegistry with app integration
   */
  static createEnhancedRegistry(app) {
    const registry = new ComponentRegistry(app);

    // Track instances for global analytics
    if (!ComponentRegistry._instances) {
      ComponentRegistry._instances = [];
    }
    ComponentRegistry._instances.push(registry);

    return registry;
  }

  /**
   * Phase 3.4: Get app-specific registry or create new one
   */
  static getAppRegistry(app) {
    if (!app) return componentRegistry;

    // Return existing app registry if available
    if (app._componentRegistry) {
      return app._componentRegistry;
    }

    // Create new registry for this app
    app._componentRegistry = ComponentRegistry.createEnhancedRegistry(app);
    return app._componentRegistry;
  }
}

// Export singleton instance (backward compatibility)
export const componentRegistry = new ComponentRegistry();
export default componentRegistry;

// Phase 3.4: Export class for app-integrated instances
export { ComponentRegistry };
