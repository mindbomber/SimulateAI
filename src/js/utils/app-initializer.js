/**
 * Configuration-Driven App Initializer
 * Orchestrates app startup based on app-config.json settings
 *
 * Benefits:
 * - Configurable initialization order
 * - Feature flag-driven component loading
 * - Performance monitoring during startup
 * - Graceful degradation for failed components
 */

import { configManager } from "./configuration-manager.js";
import logger from "./logger.js";

class AppInitializer {
  constructor(app) {
    this.app = app;
    this.appConfig = null;
    this.initializationSteps = new Map();
    this.componentHealthStatus = new Map();
    this.performanceMetrics = {
      totalInitTime: 0,
      stepTimes: new Map(),
      failedSteps: new Set(),
      startTime: null,
    };
  }

  /**
   * Initialize app using configuration-driven approach
   */
  async initializeApp() {
    this.performanceMetrics.startTime = performance.now();

    try {
      // 1. Initialize configuration manager first
      this.appConfig = await configManager.initialize();
      logger.info("[AppInitializer] Configuration manager initialized");

      // 2. Get initialization order from config
      const initOrder = this.appConfig.computed.getInitializationOrder();

      // 3. Execute initialization steps in configured order
      await this.executeInitializationSteps(initOrder);

      // 4. Track total initialization time
      this.performanceMetrics.totalInitTime =
        performance.now() - this.performanceMetrics.startTime;

      // 5. Check performance against thresholds
      this.checkPerformanceThresholds();

      // 6. Log final status
      this.logInitializationSummary();

      return {
        success: true,
        metrics: this.performanceMetrics,
        componentHealth: Object.fromEntries(this.componentHealthStatus),
      };
    } catch (error) {
      logger.error("[AppInitializer] App initialization failed:", error);

      // Try graceful degradation
      await this.attemptGracefulDegradation();

      throw error;
    }
  }

  /**
   * Execute initialization steps in configured order
   */
  async executeInitializationSteps(initOrder) {
    for (const step of initOrder) {
      const stepStartTime = performance.now();

      try {
        logger.debug(`[AppInitializer] Executing step: ${step}`);

        // Execute the step based on configuration
        await this.executeStep(step);

        // Track success
        const stepTime = performance.now() - stepStartTime;
        this.performanceMetrics.stepTimes.set(step, stepTime);
        this.componentHealthStatus.set(step, "healthy");

        logger.debug(
          `[AppInitializer] Step ${step} completed in ${Math.round(stepTime)}ms`,
        );
      } catch (error) {
        const stepTime = performance.now() - stepStartTime;
        this.performanceMetrics.stepTimes.set(step, stepTime);
        this.performanceMetrics.failedSteps.add(step);
        this.componentHealthStatus.set(step, "failed");

        logger.error(`[AppInitializer] Step ${step} failed:`, error);

        // Check if this step is required
        if (this.isStepRequired(step)) {
          throw new Error(
            `Required initialization step '${step}' failed: ${error.message}`,
          );
        }

        // Continue with non-required steps
        logger.warn(
          `[AppInitializer] Continuing without optional step: ${step}`,
        );
      }
    }
  }

  /**
   * Execute individual initialization step
   */
  async executeStep(step) {
    switch (step) {
      case "theme":
        await this.initializeTheme();
        break;

      case "errorHandling":
        await this.initializeErrorHandling();
        break;

      case "coreSystems":
        await this.initializeCoreSystems();
        break;

      case "ui":
        await this.initializeUI();
        break;

      case "simulations":
        await this.initializeSimulations();
        break;

      case "onboarding":
        await this.initializeOnboarding();
        break;

      case "mcpIntegrations":
        await this.initializeMCPIntegrations();
        break;

      case "firebaseServices":
        await this.initializeFirebaseServices();
        break;

      default:
        logger.warn(`[AppInitializer] Unknown initialization step: ${step}`);
    }
  }

  /**
   * Initialize theme system with config-driven settings
   */
  async initializeTheme() {
    const themeConfig = this.appConfig.app.theming;

    if (themeConfig.enableSystemDetection) {
      this.app.initializeTheme();
    }

    // Set default theme from config
    if (themeConfig.defaultTheme && themeConfig.defaultTheme !== "auto") {
      this.app.setTheme(themeConfig.defaultTheme);
    }
  }

  /**
   * Initialize error handling
   */
  async initializeErrorHandling() {
    this.app.initializeErrorHandling();
  }

  /**
   * Initialize core systems
   */
  async initializeCoreSystems() {
    await this.app.initializeSystems();
  }

  /**
   * Initialize UI components
   */
  async initializeUI() {
    this.app.setupUI();
    await this.app.loadSimulations();
  }

  /**
   * Initialize simulations
   */
  async initializeSimulations() {
    // Simulations are loaded in initializeUI, this step is for additional setup
    logger.debug("[AppInitializer] Simulations already initialized in UI step");
  }

  /**
   * Initialize onboarding tour based on feature flags
   */
  async initializeOnboarding() {
    const onboardingConfig = this.appConfig.app.features.onboardingTour;

    if (!onboardingConfig.enabled) {
      logger.debug(
        "[AppInitializer] Onboarding tour disabled by configuration",
      );
      return;
    }

    try {
      // Only initialize if we're on the app page and tour is enabled
      if (document.body.getAttribute("data-page") === "app") {
        this.app.onboardingTour = new (
          await import("../components/onboarding-tour.js")
        ).default();

        if (onboardingConfig.autoStart) {
          this.app.checkAndStartOnboardingTour();
        }
      }
    } catch (error) {
      logger.error(
        "[AppInitializer] Failed to initialize onboarding tour:",
        error,
      );
    }
  }

  /**
   * Initialize MCP integrations based on feature flags
   */
  async initializeMCPIntegrations() {
    const mcpConfig = this.appConfig.app.features.mcpIntegrations;

    if (!mcpConfig.enabled) {
      logger.debug(
        "[AppInitializer] MCP integrations disabled by configuration",
      );
      return;
    }

    await this.app.initializeMCPIntegrations();
  }

  /**
   * Initialize Firebase services based on feature flags
   */
  async initializeFirebaseServices() {
    const firebaseConfig = this.appConfig.app.features.firebaseServices;

    if (!firebaseConfig.enabled) {
      logger.debug(
        "[AppInitializer] Firebase services disabled by configuration",
      );
      return;
    }

    await this.app.initializeFirebaseServices();
  }

  /**
   * Check if initialization step is required
   */
  isStepRequired(step) {
    const requiredSteps = ["theme", "errorHandling", "coreSystems", "ui"];
    return requiredSteps.includes(step);
  }

  /**
   * Check performance against configured thresholds
   */
  checkPerformanceThresholds() {
    const thresholds = this.appConfig.computed.getPerformanceThresholds();
    const totalTime = this.performanceMetrics.totalInitTime;

    if (totalTime > thresholds.initTime) {
      logger.warn(
        `[AppInitializer] Initialization time ${Math.round(totalTime)}ms exceeds threshold ${thresholds.initTime}ms`,
      );

      // Track performance violation
      if (this.app.simpleAnalytics) {
        this.app.simpleAnalytics.trackEvent("performance_violation", {
          metric: "app_init_time",
          value: totalTime,
          threshold: thresholds.initTime,
        });
      }
    }
  }

  /**
   * Attempt graceful degradation for failed initialization
   */
  async attemptGracefulDegradation() {
    logger.info("[AppInitializer] Attempting graceful degradation...");

    try {
      // Ensure minimum required components are available
      if (!this.componentHealthStatus.get("theme")) {
        this.app.initializeTheme();
      }

      if (!this.componentHealthStatus.get("ui")) {
        this.app.setupUI();
      }

      logger.info("[AppInitializer] Graceful degradation completed");
    } catch (error) {
      logger.error("[AppInitializer] Graceful degradation failed:", error);
    }
  }

  /**
   * Log initialization summary
   */
  logInitializationSummary() {
    const totalSteps = this.performanceMetrics.stepTimes.size;
    const failedSteps = this.performanceMetrics.failedSteps.size;
    const successRate =
      totalSteps > 0 ? ((totalSteps - failedSteps) / totalSteps) * 100 : 0;

    logger.info("[AppInitializer] Initialization complete", {
      totalTime: Math.round(this.performanceMetrics.totalInitTime),
      totalSteps,
      failedSteps,
      successRate: Math.round(successRate),
      stepTimes: Object.fromEntries(
        Array.from(this.performanceMetrics.stepTimes.entries()).map(
          ([step, time]) => [step, Math.round(time)],
        ),
      ),
    });
  }

  /**
   * Get initialization health report
   */
  getHealthReport() {
    return {
      performance: this.performanceMetrics,
      componentHealth: Object.fromEntries(this.componentHealthStatus),
      configHealth: configManager.getHealthStatus(),
      overallHealth:
        this.performanceMetrics.failedSteps.size === 0 ? "healthy" : "degraded",
    };
  }
}

export default AppInitializer;
