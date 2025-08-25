/**
 * App Configuration Startup
 * Integrates JSON SSOT configuration system with app.html
 *
 * This module should be loaded early in app.html initialization
 * to enable configuration-driven application startup
 */

import { configManager } from "./utils/configuration-manager.js";
import { componentRegistry } from "./utils/component-registry.js";
import logger from "./utils/logger.js";

class AppStartup {
  constructor() {
    this.initialized = false;
    this.startTime = performance.now();
    this.initializationSteps = [];
  }

  /**
   * Initialize the configuration-driven application
   */
  async initialize() {
    if (this.initialized) {
      logger.warn("[AppStartup] Already initialized");
      return;
    }

    try {
      logger.info(
        "[AppStartup] Starting configuration-driven initialization...",
      );

      // Step 1: Load app configuration
      this.logStep("Loading app configuration");
      const appConfig = await configManager.initialize();

      // Step 2: Initialize component registry
      this.logStep("Initializing component registry");
      await componentRegistry.preloadComponents();

      // Step 3: Set up configuration monitoring
      this.logStep("Setting up configuration monitoring");
      this.setupConfigurationMonitoring();

      // Step 5: Initialize feature flags
      this.logStep("Initializing feature flags");
      this.initializeFeatureFlags(appConfig);

      // Step 6: Set up performance monitoring
      this.logStep("Setting up performance monitoring");
      this.setupPerformanceMonitoring(appConfig);

      const totalTime = performance.now() - this.startTime;
      this.initialized = true;

      logger.info(
        "[AppStartup] Configuration-driven initialization completed",
        {
          totalTime: Math.round(totalTime),
          steps: this.initializationSteps,
        },
      );

      // Dispatch custom event for other modules
      window.dispatchEvent(
        new CustomEvent("app:config-initialized", {
          detail: {
            appConfig,
            totalTime,
            steps: this.initializationSteps,
          },
        }),
      );
    } catch (error) {
      logger.error("[AppStartup] Initialization failed:", error);
      this.handleInitializationError(error);
      throw error;
    }
  }

  /**
   * Log initialization step
   */
  logStep(step) {
    const stepTime = performance.now() - this.startTime;
    this.initializationSteps.push({
      step,
      timestamp: stepTime,
    });
    logger.debug(`[AppStartup] ${step} (${Math.round(stepTime)}ms)`);
  }

  /**
   * Set up configuration monitoring for hot-reload
   */
  setupConfigurationMonitoring() {
    // Listen for configuration updates
    window.addEventListener("keydown", async (e) => {
      // Ctrl+Shift+R for config reload (development)
      if (e.ctrlKey && e.shiftKey && e.key === "R") {
        e.preventDefault();
        await this.reloadConfigurations();
      }
    });

    // Set up periodic health checks
    setInterval(() => {
      this.performHealthCheck();
    }, 60000); // Every minute
  }

  /**
   * Initialize feature flags based on configuration
   */
  initializeFeatureFlags(appConfig) {
    if (!appConfig?.app?.features) return;

    const features = appConfig.app.features;

    // Set feature flags on window for global access
    window.SimulateAI = window.SimulateAI || {};
    window.SimulateAI.features = {
      onboarding: features.onboarding?.enabled || false,
      enterprise: features.enterprise?.enabled || false,
      mcp: features.mcp?.enabled || false,
      firebase: features.firebase?.enabled || false,
      analytics: features.analytics?.enabled || false,
      accessibility: features.accessibility?.enabled || true,
      darkMode: features.darkMode?.enabled || false,
    };

    logger.info(
      "[AppStartup] Feature flags initialized:",
      window.SimulateAI.features,
    );
  }

  /**
   * Set up performance monitoring
   */
  setupPerformanceMonitoring(appConfig) {
    const perfConfig = appConfig?.app?.performance;
    if (!perfConfig?.enabled) return;

    // Monitor initialization performance
    const initTime = performance.now() - this.startTime;
    if (initTime > perfConfig.initThreshold) {
      logger.warn("[AppStartup] Initialization exceeded threshold", {
        actual: Math.round(initTime),
        threshold: perfConfig.initThreshold,
      });
    }

    // Set up ongoing performance monitoring
    if (perfConfig.monitoring) {
      this.startPerformanceObserver();
    }
  }

  /**
   * Start performance observer for ongoing monitoring
   */
  startPerformanceObserver() {
    if (!window.PerformanceObserver) return;

    const observer = new PerformanceObserver((list) => {
      list.getEntries().forEach((entry) => {
        if (entry.entryType === "navigation") {
          logger.info("[AppStartup] Navigation performance", {
            domContentLoaded: Math.round(
              entry.domContentLoadedEventEnd - entry.domContentLoadedEventStart,
            ),
            loadComplete: Math.round(entry.loadEventEnd - entry.loadEventStart),
          });
        }
      });
    });

    observer.observe({ entryTypes: ["navigation", "measure", "mark"] });
  }

  /**
   * Reload all configurations
   */
  async reloadConfigurations() {
    logger.info("[AppStartup] Reloading configurations...");

    try {
      await configManager.clearCache();
      await componentRegistry.hotReloadConfigurations();

      logger.success("[AppStartup] Configurations reloaded successfully");

      // Dispatch reload event
      window.dispatchEvent(new CustomEvent("app:config-reloaded"));
    } catch (error) {
      logger.error("[AppStartup] Configuration reload failed:", error);
    }
  }

  /**
   * Perform health check
   */
  performHealthCheck() {
    const configHealth = configManager.getHealthStatus();
    const componentHealth = componentRegistry.getHealthStatus();

    const overallHealth = {
      status:
        configHealth.status === "healthy" &&
        componentHealth.status === "healthy"
          ? "healthy"
          : "degraded",
      config: configHealth,
      components: componentHealth,
      timestamp: Date.now(),
    };

    // Store health status for debugging
    window.SimulateAI = window.SimulateAI || {};
    window.SimulateAI.health = overallHealth;

    if (overallHealth.status !== "healthy") {
      logger.warn("[AppStartup] Health check detected issues:", overallHealth);
    }
  }

  /**
   * Handle initialization error
   */
  handleInitializationError() {
    // Create error notification
    const errorDiv = document.createElement("div");
    errorDiv.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: #ff4444;
      color: white;
      padding: 16px;
      border-radius: 8px;
      z-index: 10000;
      max-width: 400px;
      font-family: system-ui, sans-serif;
    `;
    errorDiv.innerHTML = `
      <strong>Configuration Error</strong><br>
      The application failed to initialize properly.<br>
      <small>Check console for details.</small>
    `;

    document.body.appendChild(errorDiv);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (errorDiv.parentNode) {
        errorDiv.parentNode.removeChild(errorDiv);
      }
    }, 10000);
  }

  /**
   * Get component instance with configuration
   */
  async getComponent(componentId, ...args) {
    if (!this.initialized) {
      await this.initialize();
    }
    return componentRegistry.getComponent(componentId, ...args);
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(featureName) {
    return window.SimulateAI?.features?.[featureName] || false;
  }

  /**
   * Get initialization metrics
   */
  getMetrics() {
    return {
      initialized: this.initialized,
      totalTime: performance.now() - this.startTime,
      steps: this.initializationSteps,
      config: configManager.getPerformanceMetrics(),
      components: componentRegistry.getPerformanceMetrics(),
    };
  }
}

// Export singleton instance
export const appStartup = new AppStartup();
export default appStartup;

// Auto-initialize when DOM is ready (for app.html integration)
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    appStartup.initialize().catch(console.error);
  });
} else {
  // DOM already loaded
  appStartup.initialize().catch(console.error);
}
