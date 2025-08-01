/**
 * Copyright 2025 Armando Sori
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * EthicsSimulation - Base class for all ethics simulations
 * Provides common functionality for ethics tracking, UI management, and educational features
 */

import { simpleStorage } from "../utils/simple-storage.js";
import { simpleAnalytics } from "../utils/simple-analytics.js";
import { UIPanel, EthicsDisplay, FeedbackSystem } from "./ui.js";

// Constants to avoid magic numbers
const SIMULATION_CONSTANTS = {
  DEFAULT_DURATION: 300, // 5 minutes in seconds
  DEFAULT_METRIC_VALUE: 50,
  FEEDBACK_PANEL_WIDTH: 220,
  FEEDBACK_PANEL_MARGIN: 10,
  ETHICS_PANEL_WIDTH: 250,
  ETHICS_PANEL_HEIGHT: 150,
  ETHICS_PANEL_Y_OFFSET: 420,
  ETHICS_PANEL_WIDTH_OFFSET: 240,
  // UI positioning and sizing constants
  UI_POSITIONS: {
    CONTROL_PANEL: { x: 10, y: 10 },
    INFO_PANEL: { x: 10, y: 170 },
  },
  UI_SIZES: {
    CONTROL_PANEL: { width: 200, height: 150 },
    INFO_PANEL: { width: 200, height: 300 },
  },
  // Default values for initialization
  INITIAL_VALUES: {
    SCENARIO_INDEX: 0,
    SCORE: 0,
    TIME_ELAPSED: 0,
    METRIC_MIN: 0,
    METRIC_MAX: 100,
    DEFAULT_WEIGHT: 1,
  },
};

class EthicsSimulation {
  constructor(id, config = {}) {
    this.id = id;
    this.title = config.title || "Untitled Simulation";
    this.description = config.description || "";
    this.difficulty = config.difficulty || "beginner"; // beginner, intermediate, advanced
    this.duration = config.duration || SIMULATION_CONSTANTS.DEFAULT_DURATION;
    this.tags = config.tags || [];

    // Ethics tracking
    this.ethicsMetrics = new Map();
    this.ethicsHistory = [];
    this.currentScenario = SIMULATION_CONSTANTS.INITIAL_VALUES.SCENARIO_INDEX;
    this.scenarios = config.scenarios || [];

    // Simulation state
    this.state = {
      started: false,
      completed: false,
      paused: false,
      score: SIMULATION_CONSTANTS.INITIAL_VALUES.SCORE,
      decisions: [],
      timeElapsed: SIMULATION_CONSTANTS.INITIAL_VALUES.TIME_ELAPSED,
    };

    // Engine reference
    this.engine = null;
    this.components = [];

    // Event system
    this.events = new Map();

    this.initializeEthicsMetrics(config.ethicsMetrics || []);
  }

  initializeEthicsMetrics(metrics) {
    const defaultMetrics = [
      {
        name: "fairness",
        label: "Fairness",
        value: SIMULATION_CONSTANTS.DEFAULT_METRIC_VALUE,
        weight: SIMULATION_CONSTANTS.INITIAL_VALUES.DEFAULT_WEIGHT,
      },
      {
        name: "transparency",
        label: "Transparency",
        value: SIMULATION_CONSTANTS.DEFAULT_METRIC_VALUE,
        weight: SIMULATION_CONSTANTS.INITIAL_VALUES.DEFAULT_WEIGHT,
      },
      {
        name: "privacy",
        label: "Privacy",
        value: SIMULATION_CONSTANTS.DEFAULT_METRIC_VALUE,
        weight: SIMULATION_CONSTANTS.INITIAL_VALUES.DEFAULT_WEIGHT,
      },
      {
        name: "accountability",
        label: "Accountability",
        value: SIMULATION_CONSTANTS.DEFAULT_METRIC_VALUE,
        weight: SIMULATION_CONSTANTS.INITIAL_VALUES.DEFAULT_WEIGHT,
      },
    ];

    const allMetrics = [...defaultMetrics, ...metrics];

    allMetrics.forEach((metric) => {
      this.ethicsMetrics.set(metric.name, {
        label: metric.label,
        value: metric.value || SIMULATION_CONSTANTS.DEFAULT_METRIC_VALUE,
        min: metric.min || SIMULATION_CONSTANTS.INITIAL_VALUES.METRIC_MIN,
        max: metric.max || SIMULATION_CONSTANTS.INITIAL_VALUES.METRIC_MAX,
        weight:
          metric.weight || SIMULATION_CONSTANTS.INITIAL_VALUES.DEFAULT_WEIGHT,
        description: metric.description || "",
      });
    });
  }

  // Engine integration
  init(engineInstance) {
    this.engine = engineInstance;
    this.setupUI();
    this.setupEthicsDisplay();
    this.loadScenario(SIMULATION_CONSTANTS.INITIAL_VALUES.SCENARIO_INDEX);

    // Start tracking time
    this.startTime = Date.now();

    this.emit("simulation:initialized");
  }

  setupUI() {
    // Create base UI components
    this.createControlPanel();
    this.createInformationPanel();
    this.createFeedbackSystem();
  }

  createControlPanel() {
    const panel = new UIPanel({
      id: "control-panel",
      position: SIMULATION_CONSTANTS.UI_POSITIONS.CONTROL_PANEL,
      size: SIMULATION_CONSTANTS.UI_SIZES.CONTROL_PANEL,
      title: "Controls",
    });

    // Add common controls
    panel.addButton("Reset", () => this.reset());
    panel.addButton("Pause", () => this.togglePause());
    panel.addButton("Help", () => this.showHelp());

    this.controlPanel = panel;
    this.engine.addComponent(panel);
  }

  createInformationPanel() {
    const panel = new UIPanel({
      id: "info-panel",
      position: SIMULATION_CONSTANTS.UI_POSITIONS.INFO_PANEL,
      size: SIMULATION_CONSTANTS.UI_SIZES.INFO_PANEL,
      title: "Information",
    });

    this.informationPanel = panel;
    this.engine.addComponent(panel);
  }
  createFeedbackSystem() {
    if (!this.engine || !this.engine.config) {
      this.handleError("Engine not properly initialized for feedback system");
      return;
    }

    this.feedbackSystem = new FeedbackSystem({
      position: {
        x: this.engine.config.width - SIMULATION_CONSTANTS.FEEDBACK_PANEL_WIDTH,
        y: SIMULATION_CONSTANTS.FEEDBACK_PANEL_MARGIN,
      },
      size: { width: 200, height: 400 },
    });

    this.engine.addComponent(this.feedbackSystem);
  }

  setupEthicsDisplay() {
    if (!this.engine || !this.engine.config) {
      this.handleError("Engine not properly initialized for ethics display");
      return;
    }

    // Create ethics meters display
    this.ethicsDisplay = new EthicsDisplay({
      metrics: this.ethicsMetrics,
      position: {
        x: this.engine.config.width - SIMULATION_CONSTANTS.ETHICS_PANEL_WIDTH,
        y: SIMULATION_CONSTANTS.ETHICS_PANEL_Y_OFFSET,
      },
      size: {
        width: SIMULATION_CONSTANTS.ETHICS_PANEL_WIDTH_OFFSET,
        height: SIMULATION_CONSTANTS.ETHICS_PANEL_HEIGHT,
      },
    });

    this.engine.addComponent(this.ethicsDisplay);
  } // Scenario management
  loadScenario(index) {
    if (!this.scenarios || !Array.isArray(this.scenarios)) {
      this.handleError("Scenarios not properly initialized");
      return;
    }

    if (index >= this.scenarios.length) {
      this.completeSimulation();
      return;
    }

    if (index < 0) {
      this.handleError(`Invalid scenario index: ${index}`);
      return;
    }

    this.currentScenario = index;
    const scenario = this.scenarios[index];

    if (!scenario) {
      this.handleError(`Scenario not found at index: ${index}`);
      return;
    }

    this.clearScenarioComponents();
    this.setupScenarioComponents(scenario);
    this.updateInformationPanel(scenario);

    this.emit("scenario:loaded", { scenario, index });
  }

  clearScenarioComponents() {
    // Remove scenario-specific components
    this.components.forEach((component) => {
      if (component.isScenarioComponent) {
        this.engine.removeComponent(component);
      }
    });

    this.components = this.components.filter((c) => !c.isScenarioComponent);
  }

  setupScenarioComponents(scenario) {
    // Override in specific simulations
    // Log scenario setup in development only
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      // eslint-disable-next-line no-console
    }
  }

  updateInformationPanel(scenario) {
    if (!this.informationPanel) {
      this.handleError("Information panel not initialized");
      return;
    }

    if (!scenario) {
      this.handleError(
        "Cannot update information panel: scenario is null/undefined",
      );
      return;
    }

    const title = scenario.title || "Unknown Scenario";
    const description = scenario.description || "No description available";
    const objective = scenario.objective || "No objective specified";

    this.informationPanel.setContent(`
            <h3>${title}</h3>
            <p>${description}</p>
            <div class="scenario-info">
                <p><strong>Objective:</strong> ${objective}</p>
                <p><strong>Scenario ${this.currentScenario + 1}</strong> of ${this.scenarios.length}</p>
            </div>
        `);
  }

  // Ethics tracking methods
  updateEthicsMetric(metricName, change, reasoning = "") {
    const metric = this.ethicsMetrics.get(metricName);
    if (!metric) {
      this.handleError(`Ethics metric '${metricName}' not found`);
      return;
    }

    const oldValue = metric.value;
    metric.value = Math.max(
      metric.min,
      Math.min(metric.max, metric.value + change),
    );

    // Record the change
    const record = {
      timestamp: Date.now(),
      metric: metricName,
      oldValue,
      newValue: metric.value,
      change,
      reasoning,
      scenario: this.currentScenario,
    };

    this.ethicsHistory.push(record);
    this.logEthicalDecision(metricName, change, reasoning);

    // Update display
    if (this.ethicsDisplay) {
      this.ethicsDisplay.updateMetric(metricName, metric.value);
    }

    // Provide feedback
    this.provideFeedback(metricName, change, reasoning);

    this.emit("ethics:updated", record);
  }
  logEthicalDecision(category, change, reasoning) {
    const decision = {
      timestamp: Date.now(),
      simulationId: this.id,
      scenario: this.currentScenario,
      category,
      change,
      reasoning,
      state: { ...this.state },
      allMetrics: Object.fromEntries(this.ethicsMetrics),
    };

    // Store in local storage and analytics with error handling
    try {
      simpleStorage.set(`decision_${this.id}_${Date.now()}`, decision);
    } catch (error) {
      this.handleError("Failed to log decision to storage", error);
    }

    try {
      simpleAnalytics.trackEvent("ethics_decision", decision);
    } catch (error) {
      this.handleError("Failed to track decision in analytics", error);
    }
  }

  provideFeedback(metricName, change, reasoning) {
    if (!this.feedbackSystem) return;

    const metric = this.ethicsMetrics.get(metricName);
    const isPositive = change > 0;

    let feedbackText = "";
    let feedbackType = isPositive ? "positive" : "negative";

    if (Math.abs(change) > 10) {
      feedbackType = isPositive ? "excellent" : "concerning";
    }

    feedbackText = `${metric.label} ${isPositive ? "improved" : "decreased"} by ${Math.abs(change)} points.`;

    if (reasoning) {
      feedbackText += ` ${reasoning}`;
    }

    this.feedbackSystem.addFeedback(feedbackText, feedbackType);
  }

  // Decision making framework
  makeDecision(decisionId, choice, impact = {}) {
    const decision = {
      id: decisionId,
      choice,
      timestamp: Date.now(),
      scenario: this.currentScenario,
      impact,
    };

    this.state.decisions.push(decision);

    // Apply ethics impacts
    Object.entries(impact).forEach(([metric, change]) => {
      if (typeof change === "object") {
        this.updateEthicsMetric(metric, change.value, change.reasoning);
      } else {
        this.updateEthicsMetric(metric, change);
      }
    });

    this.emit("decision:made", decision);

    return decision;
  }

  // Simulation control
  start() {
    if (this.state.started) return;

    this.state.started = true;
    this.state.paused = false;
    this.startTime = Date.now();

    this.emit("simulation:started");
  }

  pause() {
    this.state.paused = true;
    this.emit("simulation:paused");
  }

  resume() {
    this.state.paused = false;
    this.emit("simulation:resumed");
  }

  togglePause() {
    if (this.state.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }

  reset() {
    this.state = {
      started: false,
      completed: false,
      paused: false,
      score: 0,
      decisions: [],
      timeElapsed: 0,
    };

    // Reset ethics metrics to initial values
    this.ethicsMetrics.forEach((metric) => {
      metric.value = 50; // Reset to neutral
    });

    this.ethicsHistory = [];
    this.currentScenario = 0;

    this.loadScenario(0);
    this.emit("simulation:reset");
  }

  nextScenario() {
    if (this.currentScenario < this.scenarios.length - 1) {
      this.loadScenario(this.currentScenario + 1);
    } else {
      this.completeSimulation();
    }
  }

  completeSimulation() {
    this.state.completed = true;
    this.state.timeElapsed = Date.now() - this.startTime;

    // Calculate final score
    this.calculateFinalScore();

    // Generate completion report
    const report = this.generateCompletionReport();

    this.emit("simulation:completed", { score: this.state.score, report });
  }
  calculateFinalScore() {
    if (!this.ethicsMetrics || this.ethicsMetrics.size === 0) {
      this.handleError("No ethics metrics available for score calculation");
      this.state.score = 0;
      return;
    }

    let totalScore = 0;
    let totalWeight = 0;

    this.ethicsMetrics.forEach((metric) => {
      if (
        typeof metric.value === "number" &&
        typeof metric.weight === "number"
      ) {
        totalScore += metric.value * metric.weight;
        totalWeight += metric.weight;
      }
    });

    if (totalWeight === 0) {
      this.handleError("Total weight is zero, cannot calculate score");
      this.state.score = 0;
      return;
    }

    this.state.score = Math.round(totalScore / totalWeight);
  }

  generateCompletionReport() {
    return {
      simulationId: this.id,
      title: this.title,
      duration: this.state.timeElapsed,
      score: this.state.score,
      decisions: this.state.decisions.length,
      ethicsMetrics: Object.fromEntries(this.ethicsMetrics),
      ethicsHistory: this.ethicsHistory,
      scenarios: this.scenarios.length,
      completedAt: new Date().toISOString(),
    };
  }

  // Event system
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  emit(event, data = {}) {
    if (this.events.has(event)) {
      this.events.get(event).forEach((callback) => {
        try {
          callback(data);
        } catch (error) {
          this.handleError(`Error in event handler for ${event}`, error);
        }
      });
    }
  }

  // Accessibility
  getAccessibilityDescription() {
    return `${this.title}: ${this.description}. Current ethics scores: ${Array.from(
      this.ethicsMetrics.entries(),
    )
      .map(([_name, metric]) => `${metric.label}: ${metric.value}`)
      .join(", ")}`;
  }

  // Update method called by engine
  update(deltaTime) {
    if (!this.state.started || this.state.paused || this.state.completed)
      return;

    this.state.timeElapsed += deltaTime;

    // Override in specific simulations for custom update logic
    this.updateSimulation(deltaTime);
  }

  updateSimulation(_deltaTime) {
    // Override in specific simulations
  }

  // Helper methods
  showHelp() {
    // Display help information
    this.emit("help:requested");
  }
  getProgress() {
    const totalScenarios = this.scenarios ? this.scenarios.length : 0;
    const currentScenario = Math.max(0, this.currentScenario);

    if (totalScenarios === 0) {
      return {
        scenario: 0,
        totalScenarios: 0,
        percentage: 0,
      };
    }

    return {
      scenario: currentScenario + 1,
      totalScenarios,
      percentage: ((currentScenario + 1) / totalScenarios) * 100,
    };
  }

  // Error handling
  handleError(message, error = null) {
    const errorData = {
      simulationId: this.id,
      message,
      error: error?.message || "Unknown error",
      timestamp: Date.now(),
      scenario: this.currentScenario,
    };

    // Track error in analytics
    try {
      simpleAnalytics.trackEvent("simulation_error", errorData);
    } catch (analyticsError) {
      // Silent fail for analytics
    }

    // Emit error event for UI handling
    this.emit("error", errorData);

    // Store error for debugging in development
    if (
      typeof process !== "undefined" &&
      process.env?.NODE_ENV === "development"
    ) {
      // eslint-disable-next-line no-console
      console.error(`Simulation Error [${this.id}]:`, message, error);
    }
  }

  // Cleanup and resource management
  destroy() {
    try {
      // Clear all components
      this.clearScenarioComponents();

      // Remove UI components
      if (this.engine) {
        if (this.controlPanel) {
          this.engine.removeComponent(this.controlPanel);
        }
        if (this.informationPanel) {
          this.engine.removeComponent(this.informationPanel);
        }
        if (this.feedbackSystem) {
          this.engine.removeComponent(this.feedbackSystem);
        }
        if (this.ethicsDisplay) {
          this.engine.removeComponent(this.ethicsDisplay);
        }
      }

      // Clear event listeners
      this.events.clear();

      // Reset state
      this.state = null;
      this.ethicsMetrics.clear();
      this.ethicsHistory = [];
      this.components = [];

      // Log destruction in development only
      if (
        typeof process !== "undefined" &&
        process.env?.NODE_ENV === "development"
      ) {
        // eslint-disable-next-line no-console
      }
    } catch (error) {
      this.handleError("Error during simulation cleanup", error);
    }
  }
}

// Export for ES6 modules
export default EthicsSimulation;
