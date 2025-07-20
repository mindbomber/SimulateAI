/**
 * Configuration-Aware Component Registry
 * Manages component lifecycle based on JSON SSOT configurations
 *
 * Features:
 * - Lazy loading based on configuration
 * - Component health monitoring
 * - Configuration hot-reloading
 * - Performance optimization
 */

import { configManager } from "./configuration-manager.js";
import logger from "./logger.js";

class ComponentRegistry {
  constructor() {
    this.components = new Map();
    this.componentFactories = new Map();
    this.healthStatus = new Map();
    this.loadTimes = new Map();
    this.configWatchers = new Map();

    // Register component factories
    this.registerComponentFactories();
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

    this.componentFactories.set("scenario-card", {
      factory: () => import("../components/scenario-card.js"),
      configId: "scenario-card",
      singleton: false,
    });
  }

  /**
   * Get or create component instance with configuration
   */
  async getComponent(componentId, ...args) {
    const factory = this.componentFactories.get(componentId);
    if (!factory) {
      throw new Error(`Component not registered: ${componentId}`);
    }

    // Check if singleton and already exists
    if (factory.singleton && this.components.has(componentId)) {
      return this.components.get(componentId);
    }

    const startTime = performance.now();

    try {
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

      // Set up configuration watching for hot-reload
      this.setupConfigWatcher(componentId, instance);

      logger.debug(`[ComponentRegistry] Created ${componentId}`, {
        loadTime: Math.round(loadTime),
        singleton: factory.singleton,
      });

      return instance;
    } catch (error) {
      this.healthStatus.set(componentId, "failed");
      logger.error(
        `[ComponentRegistry] Failed to create ${componentId}:`,
        error,
      );
      throw error;
    }
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

    return {
      total,
      loaded,
      healthy,
      failed,
      status: failed === 0 ? "healthy" : "degraded",
      components: Object.fromEntries(this.healthStatus),
      loadTimes: Object.fromEntries(this.loadTimes),
    };
  }

  /**
   * Get performance metrics
   */
  getPerformanceMetrics() {
    return {
      averageLoadTime: this.calculateAverageLoadTime(),
      loadTimes: Object.fromEntries(this.loadTimes),
      totalComponents: this.componentFactories.size,
      loadedComponents: this.components.size,
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
}

// Export singleton instance
export const componentRegistry = new ComponentRegistry();
export default componentRegistry;
