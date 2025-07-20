/**
 * Configuration Integration Manager
 * Connects app-level configuration with component-specific configurations
 */

import logger from "../utils/logger.js";

class ConfigurationIntegrator {
  constructor() {
    this.appConfig = null;
    this.componentConfigs = new Map();
    this.integrationRules = new Map();
    this.isInitialized = false;
  }

  /**
   * Initialize the configuration integrator
   */
  async initialize() {
    try {
      // Load main app configuration
      await this.loadAppConfig();

      // Set up integration rules
      this.setupIntegrationRules();

      this.isInitialized = true;
      logger.info("ConfigurationIntegrator", "Initialized successfully");

      return true;
    } catch (error) {
      logger.error("ConfigurationIntegrator", "Failed to initialize", error);
      throw error;
    }
  }

  /**
   * Load the main app configuration
   */
  async loadAppConfig() {
    try {
      const response = await fetch("/src/config/app-config.json");
      if (!response.ok) {
        throw new Error(`Failed to load app config: ${response.status}`);
      }
      this.appConfig = await response.json();
      logger.info("ConfigurationIntegrator", "App config loaded");
    } catch (error) {
      logger.error(
        "ConfigurationIntegrator",
        "Failed to load app config",
        error,
      );
      throw error;
    }
  }

  /**
   * Load a component configuration and integrate with app settings
   */
  async loadComponentConfig(componentName) {
    if (!this.isInitialized) {
      throw new Error("ConfigurationIntegrator not initialized");
    }

    const componentInfo = this.appConfig.app.components[componentName];
    if (!componentInfo) {
      throw new Error(`Component ${componentName} not found in app config`);
    }

    try {
      // Load component-specific configuration
      const response = await fetch(`/src/config/${componentInfo.configPath}`);
      if (!response.ok) {
        throw new Error(
          `Failed to load ${componentName} config: ${response.status}`,
        );
      }

      const componentConfig = await response.json();

      // Apply integration rules
      const integratedConfig = this.integrateConfigurations(
        componentName,
        componentConfig,
      );

      // Cache the integrated configuration
      this.componentConfigs.set(componentName, integratedConfig);

      logger.info(
        "ConfigurationIntegrator",
        `${componentName} config loaded and integrated`,
      );
      return integratedConfig;
    } catch (error) {
      logger.error(
        "ConfigurationIntegrator",
        `Failed to load ${componentName} config`,
        error,
      );
      throw error;
    }
  }

  /**
   * Set up integration rules for different components
   */
  setupIntegrationRules() {
    // Radar Chart Integration Rules
    this.integrationRules.set("radarChart", {
      // Theme integration
      applyTheme: (componentConfig, appConfig) => {
        if (
          appConfig.app.theming.componentTheming?.radarChart?.inheritAppTheme
        ) {
          const currentTheme = this.getCurrentTheme();
          componentConfig.themeOverrides = {
            currentTheme,
            systemTheme: appConfig.app.theming.enableSystemDetection,
            supportedThemes: appConfig.app.theming.supportedThemes,
          };
        }
        return componentConfig;
      },

      // Performance integration
      applyPerformance: (componentConfig, appConfig) => {
        const perfSettings = appConfig.app.performance;
        if (perfSettings.monitoring.componentMetrics?.radarChart) {
          // Override component performance settings with app-level settings
          componentConfig.enterprise.performance = {
            ...componentConfig.enterprise.performance,
            chartRenderTimeout: perfSettings.thresholds.radarChartRender || 500,
            reportingInterval: perfSettings.monitoring.reportingInterval,
            metricsRetention: perfSettings.monitoring.metricsRetention,
          };
        }
        return componentConfig;
      },

      // Enterprise monitoring integration
      applyEnterpriseSettings: (componentConfig, appConfig) => {
        const enterpriseSettings = appConfig.app.features.enterpriseMonitoring;
        if (enterpriseSettings.enabled) {
          componentConfig.enterprise.telemetry.enabled =
            enterpriseSettings.telemetryEnabled;
          componentConfig.enterprise.performance.trackingEnabled =
            enterpriseSettings.performanceTracking;
        }
        return componentConfig;
      },
    });

    logger.info("ConfigurationIntegrator", "Integration rules established");
  }

  /**
   * Apply integration rules to merge configurations
   */
  integrateConfigurations(componentName, componentConfig) {
    const rules = this.integrationRules.get(componentName);
    if (!rules) {
      logger.warn(
        "ConfigurationIntegrator",
        `No integration rules for ${componentName}`,
      );
      return componentConfig;
    }

    let integratedConfig = { ...componentConfig };

    // Apply each integration rule
    Object.keys(rules).forEach((ruleName) => {
      try {
        integratedConfig = rules[ruleName](integratedConfig, this.appConfig);
        logger.debug(
          "ConfigurationIntegrator",
          `Applied rule ${ruleName} to ${componentName}`,
        );
      } catch (error) {
        logger.error(
          "ConfigurationIntegrator",
          `Failed to apply rule ${ruleName}`,
          error,
        );
      }
    });

    // Add integration metadata
    integratedConfig._integration = {
      timestamp: new Date().toISOString(),
      appConfigVersion: this.appConfig.app.metadata.version,
      componentName,
      rulesApplied: Object.keys(rules),
    };

    return integratedConfig;
  }

  /**
   * Get current theme based on app configuration
   */
  getCurrentTheme() {
    const themeConfig = this.appConfig.app.theming;

    if (
      themeConfig.defaultTheme === "auto" &&
      themeConfig.enableSystemDetection
    ) {
      return window.matchMedia("(prefers-color-scheme: dark)").matches
        ? "dark"
        : "light";
    }

    return localStorage.getItem("theme") || themeConfig.defaultTheme || "light";
  }

  /**
   * Get integrated configuration for a component
   */
  getComponentConfig(componentName) {
    return this.componentConfigs.get(componentName);
  }

  /**
   * Get app configuration
   */
  getAppConfig() {
    return this.appConfig;
  }

  /**
   * Check if a component should be preloaded
   */
  shouldPreloadComponent(componentName) {
    const componentInfo = this.appConfig?.app?.components?.[componentName];
    return componentInfo?.preload === true;
  }

  /**
   * Check if a component is required for app functionality
   */
  isComponentRequired(componentName) {
    const componentInfo = this.appConfig?.app?.components?.[componentName];
    return componentInfo?.required === true;
  }

  /**
   * Get component loading priority based on app initialization order
   */
  getComponentPriority(componentName) {
    const initOrder = this.appConfig?.app?.initialization?.order || [];
    return initOrder.indexOf(componentName);
  }

  /**
   * Validate configuration compatibility
   */
  validateConfigurationCompatibility() {
    const results = {
      compatible: true,
      issues: [],
      warnings: [],
    };

    // Check version compatibility
    this.componentConfigs.forEach((config, componentName) => {
      if (config.version && this.appConfig.app.metadata.version) {
        const componentVersion = config.version;
        const appVersion = this.appConfig.app.metadata.version;

        if (componentVersion !== appVersion) {
          results.warnings.push(
            `Version mismatch: ${componentName} (${componentVersion}) vs app (${appVersion})`,
          );
        }
      }
    });

    return results;
  }

  /**
   * Export configuration diagnostics
   */
  exportDiagnostics() {
    return {
      timestamp: new Date().toISOString(),
      isInitialized: this.isInitialized,
      appConfig: this.appConfig?.app?.metadata || null,
      loadedComponents: Array.from(this.componentConfigs.keys()),
      integrationRules: Array.from(this.integrationRules.keys()),
      compatibility: this.validateConfigurationCompatibility(),
      currentTheme: this.getCurrentTheme(),
    };
  }
}

// Create singleton instance
const configIntegrator = new ConfigurationIntegrator();

// Global access for debugging
window.configIntegrator = configIntegrator;

export default configIntegrator;
