/**
 * Centralized Configuration Manager
 * Enterprise-grade configuration orchestration for SimulateAI
 *
 * Features:
 * - Orchestrates all component configurations
 * - Intelligent preloading based on app-config.json
 * - Performance monitoring and health checks
 * - Feature flag management
 * - Environment-specific configuration loading
 */

import logger from "./logger.js";

class ConfigurationManager {
  constructor() {
    this.configs = new Map();
    this.loaders = new Map();
    this.appConfig = null;
    this.initialized = false;
    this.preloadPromises = new Map();

    // Performance tracking
    this.loadTimes = new Map();
    this.errorCounts = new Map();

    // Register all configuration loaders
    this.registerLoaders();
  }

  /**
   * Register all component configuration loaders
   */
  registerLoaders() {
    // Dynamic imports to avoid circular dependencies
    // Register with both kebab-case and camelCase names for compatibility
    this.loaders.set(
      "badge-modal",
      () => import("./badge-modal-config-loader.js"),
    );
    this.loaders.set(
      "badgeModal",
      () => import("./badge-modal-config-loader.js"),
    );
    this.loaders.set(
      "category-header",
      () => import("./category-header-config-loader.js"),
    );
    this.loaders.set(
      "categoryGrid",
      () => import("./category-header-config-loader.js"),
    );
    this.loaders.set(
      "pre-launch-modal",
      () => import("./pre-launch-modal-config-loader.js"),
    );
    this.loaders.set(
      "preLaunchModal",
      () => import("./pre-launch-modal-config-loader.js"),
    );
    this.loaders.set("radar-chart", () => import("./radar-config-loader.js"));
    this.loaders.set("radarChart", () => import("./radar-config-loader.js"));
    this.loaders.set(
      "scenario-card",
      () => import("./scenario-card-config-loader.js"),
    );
    this.loaders.set(
      "scenarioCard",
      () => import("./scenario-card-config-loader.js"),
    );
    this.loaders.set(
      "scenario-modal",
      () => import("./scenario-modal-config-loader.js"),
    );
    this.loaders.set(
      "scenarioModal",
      () => import("./scenario-modal-config-loader.js"),
    );

    // Debug: Log registered loaders
    logger.info("[ConfigManager] Registered loaders:", {
      loaderCount: this.loaders.size,
      loaderNames: Array.from(this.loaders.keys()),
    });
  }

  /**
   * Initialize configuration manager with app config
   */
  async initialize() {
    if (this.initialized) return this.appConfig;

    const startTime = performance.now();

    try {
      // Load app-level configuration
      this.appConfig = await this.loadAppConfig();

      // Start preloading configs marked as preload=true
      await this.startPreloading();

      // Track initialization performance
      const initTime = performance.now() - startTime;
      this.loadTimes.set("configuration-manager", initTime);

      logger.info("[ConfigManager] Initialized successfully", {
        initTime: Math.round(initTime),
        preloadingComponents: Array.from(this.preloadPromises.keys()),
      });

      this.initialized = true;
      return this.appConfig;
    } catch (error) {
      logger.error("[ConfigManager] Initialization failed:", error);
      throw error;
    }
  }

  /**
   * Load app-level configuration
   */
  async loadAppConfig() {
    try {
      const response = await fetch("/src/config/app-config.json");
      if (!response.ok) {
        throw new Error(`Failed to load app config: ${response.status}`);
      }

      const config = await response.json();

      // Add computed properties
      config.computed = {
        isProduction: () => config.app.metadata.environment === "production",
        isDevelopment: () => config.app.metadata.environment === "development",
        isFeatureEnabled: (feature) => this.isFeatureEnabled(feature),
        getComponentConfig: (componentId) =>
          this.getComponentConfig(componentId),
        getInitializationOrder: () => config.app.initialization.order,
        getPerformanceThresholds: () => config.app.performance.thresholds,
      };

      return config;
    } catch (error) {
      logger.error("[ConfigManager] Failed to load app config:", error);

      // Return minimal fallback config
      return {
        app: {
          features: { onboardingTour: { enabled: true } },
          components: {},
          initialization: { order: ["theme", "ui"] },
          performance: { thresholds: { initTime: 3000 } },
        },
      };
    }
  }

  /**
   * Start preloading configurations marked for preload
   */
  async startPreloading() {
    if (!this.appConfig?.app?.components) return;

    const preloadComponents = Object.entries(this.appConfig.app.components)
      .filter(([, config]) => config.preload)
      .map(([componentId]) => componentId);

    logger.info(
      "[ConfigManager] Starting preload for components:",
      preloadComponents,
    );

    // Start preloading (fire and forget)
    preloadComponents.forEach((componentId) => {
      this.preloadPromises.set(
        componentId,
        this.loadComponentConfig(componentId),
      );
    });
  }

  /**
   * Load configuration for a specific component
   */
  async loadComponentConfig(componentId, forceReload = false) {
    // Check if already loaded and not forcing reload
    if (!forceReload && this.configs.has(componentId)) {
      return this.configs.get(componentId);
    }

    // Check if preload is in progress
    if (this.preloadPromises.has(componentId)) {
      return await this.preloadPromises.get(componentId);
    }

    const startTime = performance.now();

    try {
      // Get the loader for this component
      const loaderFactory = this.loaders.get(componentId);
      if (!loaderFactory) {
        // Debug: Show available loaders
        const availableLoaders = Array.from(this.loaders.keys());
        logger.error(`No loader registered for component: ${componentId}`, {
          requestedComponent: componentId,
          availableLoaders,
          totalLoaders: availableLoaders.length,
        });
        throw new Error(`No loader registered for component: ${componentId}`);
      }

      // Dynamically import the loader
      const loaderModule = await loaderFactory();
      const loadFunction =
        loaderModule.default ||
        loaderModule[`load${this.toPascalCase(componentId)}Config`];

      if (!loadFunction) {
        throw new Error(
          `Load function not found for component: ${componentId}`,
        );
      }

      // Load the configuration
      const config = await loadFunction();

      // Cache the configuration
      this.configs.set(componentId, config);

      // Track performance
      const loadTime = performance.now() - startTime;
      this.loadTimes.set(componentId, loadTime);

      logger.debug(`[ConfigManager] Loaded ${componentId} config`, {
        loadTime: Math.round(loadTime),
        cached: true,
      });

      return config;
    } catch (error) {
      // Track error
      this.errorCounts.set(
        componentId,
        (this.errorCounts.get(componentId) || 0) + 1,
      );

      logger.error(
        `[ConfigManager] Failed to load ${componentId} config:`,
        error,
      );
      throw error;
    }
  }

  /**
   * Check if a feature is enabled
   */
  isFeatureEnabled(featurePath) {
    if (!this.appConfig) return false;

    const pathParts = featurePath.split(".");
    let current = this.appConfig.app.features;

    for (const part of pathParts) {
      if (!current || typeof current !== "object") return false;
      current = current[part];
    }

    return current?.enabled === true;
  }

  /**
   * Get component configuration with lazy loading
   */
  async getComponentConfig(componentId) {
    // If not loaded, load it now
    if (!this.configs.has(componentId)) {
      return await this.loadComponentConfig(componentId);
    }

    return this.configs.get(componentId);
  }

  /**
   * Preload all configurations (for performance optimization)
   */
  async preloadAllConfigs() {
    if (!this.appConfig?.app?.components) return;

    const componentIds = Object.keys(this.appConfig.app.components);
    const promises = componentIds.map((id) => this.loadComponentConfig(id));

    try {
      await Promise.allSettled(promises);
      logger.info("[ConfigManager] All configurations preloaded");
    } catch (error) {
      logger.warn(
        "[ConfigManager] Some configurations failed to preload:",
        error,
      );
    }
  }

  /**
   * Get performance metrics for configuration loading
   */
  getPerformanceMetrics() {
    return {
      loadTimes: Object.fromEntries(this.loadTimes),
      errorCounts: Object.fromEntries(this.errorCounts),
      cachedConfigs: Array.from(this.configs.keys()),
      preloadingConfigs: Array.from(this.preloadPromises.keys()),
    };
  }

  /**
   * Clear all cached configurations (for development/testing)
   */
  clearCache() {
    this.configs.clear();
    this.preloadPromises.clear();
    this.loadTimes.clear();
    this.errorCounts.clear();
    logger.info("[ConfigManager] Configuration cache cleared");
  }

  /**
   * Get configuration health status
   */
  getHealthStatus() {
    const totalComponents = this.loaders.size;
    const loadedComponents = this.configs.size;
    const errorComponents = this.errorCounts.size;

    return {
      status: errorComponents === 0 ? "healthy" : "degraded",
      totalComponents,
      loadedComponents,
      errorComponents,
      loadSuccess: totalComponents > 0 ? loadedComponents / totalComponents : 0,
      details: {
        loaded: Array.from(this.configs.keys()),
        errors: Object.fromEntries(this.errorCounts),
      },
    };
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
   * Get initialization order from app config
   */
  getInitializationOrder() {
    return this.appConfig?.app?.initialization?.order || [];
  }

  /**
   * Get performance thresholds from app config
   */
  getPerformanceThresholds() {
    return this.appConfig?.app?.performance?.thresholds || {};
  }

  /**
   * Check if component is required for app functionality
   */
  isComponentRequired(componentId) {
    return this.appConfig?.app?.components?.[componentId]?.required === true;
  }
}

// Export singleton instance
export const configManager = new ConfigurationManager();
export default configManager;
