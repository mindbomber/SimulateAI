/**
 * Scenario Browser SimulateAI Integration Helper
 * Provides integration utilities to connect scenario-browser with SimulateAI architecture
 *
 * @author SimulateAI Development Team
 * @version 1.0.0
 */

import ScenarioBrowser from "../components/scenario-browser.js";

/**
 * Integration manager for connecting ScenarioBrowser with SimulateAI ecosystem
 */
export class ScenarioBrowserIntegration {
  constructor(app) {
    this.app = app;
    this.scenarioBrowser = null;
    this.integrationConfig = {
      routeThroughSimulateAI: true,
      useSimulateAIModals: true,
      enableUnifiedNavigation: true,
      preserveEducationalContext: true,
    };
  }

  /**
   * Initialize and configure scenario browser with SimulateAI integration
   * @param {HTMLElement|string} container - Container element or selector
   * @param {Object} options - Configuration options
   * @returns {ScenarioBrowser} Configured scenario browser instance
   */
  initializeScenarioBrowser(container, options = {}) {
    const integrationOptions = {
      integrateWithSimulateAI: true,
      routeThroughSimulateAI: this.integrationConfig.routeThroughSimulateAI,
      useSimulateAIModals: this.integrationConfig.useSimulateAIModals,
      parentContext: "simulateai-integrated",
      onNavigationRequest: this.handleNavigationRequest.bind(this),
      ...options,
    };

    this.scenarioBrowser = new ScenarioBrowser(integrationOptions);

    // Store global reference
    window.scenarioBrowser = this.scenarioBrowser;

    console.log(
      "✅ ScenarioBrowserIntegration: Initialized with SimulateAI integration",
      {
        container:
          typeof container === "string" ? container : container?.tagName,
        config: integrationOptions,
      },
    );

    return this.scenarioBrowser;
  }

  /**
   * Handle navigation requests from scenario browser
   * @param {string} action - The navigation action requested
   * @param {Object} data - Associated data for the navigation
   */
  handleNavigationRequest(action, data) {
    console.log("🔗 ScenarioBrowserIntegration: Handling navigation request", {
      action,
      data,
    });

    switch (action) {
      case "scenario":
        return this.navigateToScenario(data.categoryId, data.scenarioId);

      case "modal-direct":
        return this.openScenarioModalDirect(data.categoryId, data.scenarioId);

      case "learning-lab":
        return this.navigateToLearningLab(data.scenarioId);

      case "start-scenario":
        return this.startScenario(data.scenarioId);

      case "scenario-details":
        return this.showScenarioDetails(data.scenarioId);

      case "fallback":
        return this.handleFallbackNavigation(data.scenarioId, data.context);

      default:
        console.warn(
          "⚠️ ScenarioBrowserIntegration: Unknown navigation action",
          action,
        );
        return this.handleFallbackNavigation(
          data.scenarioId || "unknown",
          action,
        );
    }
  }

  /**
   * Navigate to scenario through SimulateAI architecture
   */
  navigateToScenario(categoryId, scenarioId) {
    try {
      // First route through simulateai to maintain educational context
      if (this.app && typeof this.app.startSimulation === "function") {
        console.log(
          "🎯 SimulateAI: Routing scenario through simulateai gateway",
          { categoryId, scenarioId },
        );

        // Launch simulateai first, then navigate to specific scenario
        this.app.startSimulation("simulateai", {
          autoNavigateToScenario: true,
          targetCategory: categoryId,
          targetScenario: scenarioId,
          sourceContext: "scenario-browser",
          preserveEducationalFlow:
            this.integrationConfig.preserveEducationalContext,
        });

        return true;
      }

      // Fallback to MainGrid navigation
      return this.navigateViaMainGrid(categoryId, scenarioId);
    } catch (error) {
      console.error("❌ ScenarioBrowserIntegration: Navigation error", error);
      return this.handleFallbackNavigation(scenarioId, "navigation-error");
    }
  }

  /**
   * Navigate via MainGrid (secondary option)
   */
  navigateViaMainGrid(categoryId, scenarioId) {
    try {
      if (this.app && this.app.categoryGrid) {
        console.log("🔄 MainGrid: Using category grid navigation", {
          categoryId,
          scenarioId,
        });

        // Switch to category view and trigger navigation
        this.app.categoryGrid.switchView("category").then(() => {
          // If we have a specific category, try to navigate there
          if (categoryId) {
            const categoryElement = document.querySelector(
              `[data-category-id="${categoryId}"]`,
            );
            if (categoryElement) {
              // Simulate click to open category
              categoryElement.click();

              // After a brief delay, try to find and click the specific scenario
              setTimeout(() => {
                const scenarioElement = document.querySelector(
                  `[data-scenario-id="${scenarioId}"]`,
                );
                if (scenarioElement) {
                  scenarioElement.click();
                }
              }, 500);
            }
          }
        });

        return true;
      }

      return false;
    } catch (error) {
      console.error("❌ MainGrid navigation failed", error);
      return false;
    }
  }

  /**
   * Open scenario modal directly (for quick start actions)
   */
  async openScenarioModalDirect(categoryId, scenarioId) {
    try {
      // Try to use the existing modal system from the main app
      if (this.app && this.app.scenarioModal) {
        this.app.scenarioModal.open(scenarioId, categoryId);
        return true;
      }

      // Fallback to creating new modal
      const { default: ScenarioModal } = await import(
        "../components/scenario-modal.js"
      );
      const scenarioModal = new ScenarioModal();
      scenarioModal.open(scenarioId, categoryId);
      return true;
    } catch (error) {
      console.error("❌ ScenarioBrowserIntegration: Modal open error", error);
      return this.handleFallbackNavigation(scenarioId, "modal-error");
    }
  }

  /**
   * Navigate to learning lab with SimulateAI context
   */
  navigateToLearningLab(scenarioId) {
    const url = `learning-lab.html?scenario=${scenarioId}&source=scenario-browser&via=simulateai`;
    window.location.href = url;
  }

  /**
   * Start scenario with SimulateAI context
   */
  startScenario(scenarioId) {
    const url = `simulation.html?scenario=${scenarioId}&source=scenario-browser&via=simulateai`;
    window.location.href = url;
  }

  /**
   * Show scenario details with SimulateAI context
   */
  showScenarioDetails(scenarioId) {
    // Try to use integrated details modal, fallback to navigation
    if (this.integrationConfig.useSimulateAIModals && this.app?.detailsModal) {
      this.app.detailsModal.show(scenarioId);
    } else {
      const url = `simulation.html?scenario=${scenarioId}&mode=details&source=scenario-browser`;
      window.location.href = url;
    }
  }

  /**
   * Handle fallback navigation when integrated options fail
   */
  handleFallbackNavigation(scenarioId, context) {
    console.log(
      `🔄 Fallback: Direct navigation to scenario ${scenarioId} (context: ${context})`,
    );
    const url = `simulation.html?scenario=${scenarioId}&fallback=${context}&source=scenario-browser`;
    window.location.href = url;
    return true;
  }

  /**
   * Configure integration settings
   * @param {Object} config - Configuration options
   */
  configure(config) {
    this.integrationConfig = { ...this.integrationConfig, ...config };

    // Update scenario browser if it exists
    if (this.scenarioBrowser) {
      this.scenarioBrowser.enableSimulateAIIntegration({
        routeThroughSimulateAI: this.integrationConfig.routeThroughSimulateAI,
        useSimulateAIModals: this.integrationConfig.useSimulateAIModals,
        onNavigationRequest: this.handleNavigationRequest.bind(this),
      });
    }

    console.log(
      "⚙️ ScenarioBrowserIntegration: Configuration updated",
      this.integrationConfig,
    );
  }

  /**
   * Get integration status and diagnostics
   */
  getStatus() {
    return {
      config: this.integrationConfig,
      scenarioBrowser: {
        initialized: !!this.scenarioBrowser,
        integrationEnabled:
          this.scenarioBrowser?.simulateAIIntegration?.enabled || false,
        status: this.scenarioBrowser?.getSimulateAIIntegrationStatus(),
      },
      app: {
        available: !!this.app,
        hasStartSimulation: !!(
          this.app && typeof this.app.startSimulation === "function"
        ),
        hasCategoryGrid: !!(this.app && this.app.categoryGrid),
        hasScenarioModal: !!(this.app && this.app.scenarioModal),
      },
    };
  }
}

/**
 * Helper function to quickly initialize scenario browser with SimulateAI integration
 * @param {Object} app - Main app instance
 * @param {HTMLElement|string} container - Container for scenario browser
 * @param {Object} options - Configuration options
 * @returns {ScenarioBrowser} Configured scenario browser
 */
export function initializeIntegratedScenarioBrowser(
  app,
  container,
  options = {},
) {
  const integration = new ScenarioBrowserIntegration(app);
  return integration.initializeScenarioBrowser(container, options);
}

/**
 * Helper function to configure existing scenario browser for SimulateAI integration
 * @param {ScenarioBrowser} scenarioBrowser - Existing scenario browser instance
 * @param {Object} app - Main app instance
 * @param {Object} options - Integration options
 */
export function configureScenarioBrowserIntegration(
  scenarioBrowser,
  app,
  options = {},
) {
  const integration = new ScenarioBrowserIntegration(app);

  scenarioBrowser.enableSimulateAIIntegration({
    onNavigationRequest: integration.handleNavigationRequest.bind(integration),
    ...options,
  });

  console.log("✅ ScenarioBrowser: Configured for SimulateAI integration");
  return integration;
}

export default ScenarioBrowserIntegration;
