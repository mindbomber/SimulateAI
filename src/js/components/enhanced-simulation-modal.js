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
 * ⭐ ENTERPRISE-GRADE ENHANCED SIMULATION MODAL SYSTEM ⭐
 *
 * Advanced simulation interface with comprehensive enterprise monitoring:
 * - Real-time performance tracking and health monitoring
 * - User interaction analytics and engagement metrics
 * - Modal session duration and tab usage tracking
 * - Circuit breaker pattern for fault tolerance
 * - Enterprise telemetry and error recovery
 * - Memory usage monitoring and resource tracking
 * - Static enterprise methods for instance management
 * - Simulation performance optimization analytics
 */

import { TIMING, BREAKPOINTS } from "../utils/constants.js";
import focusManager from "../utils/focus-manager.js";
import { getSystemCollector } from "../services/system-metadata-collector.js";
import logger from "../utils/logger.js";

// === ENTERPRISE SIMULATION MODAL CONSTANTS ===
const ENTERPRISE_CONSTANTS = {
  // Health monitoring thresholds
  HEALTH: {
    CHECK_INTERVAL: 30000, // 30 seconds
    HEARTBEAT_INTERVAL: 60000, // 1 minute
    MEMORY_THRESHOLD_MB: 150, // Memory usage threshold
    RENDER_TIME_THRESHOLD_MS: 800, // Modal render time threshold
    ERROR_THRESHOLD: 5, // Max errors before failsafe mode
    PERFORMANCE_SAMPLE_SIZE: 15, // Rolling average sample size
  },

  // Performance monitoring
  PERFORMANCE: {
    MODAL_RENDER_TIMEOUT: 8000, // 8 seconds max render time
    TAB_SWITCH_TIMEOUT: 2000, // 2 seconds max tab switch time
    SIMULATION_LOAD_TIMEOUT: 15000, // 15 seconds max simulation load
    INTERACTION_TIMEOUT: 45000, // User interaction timeout
    RESIZE_DEBOUNCE: 250, // Resize event debouncing
  },

  // Telemetry configuration
  TELEMETRY: {
    FLUSH_INTERVAL: 45000, // 45 seconds
    BATCH_SIZE: 40, // Events per batch
    EVENT_TYPES: {
      MODAL_SHOW: "modal_show",
      MODAL_CLOSE: "modal_close",
      TAB_SWITCH: "tab_switch",
      USER_INTERACTION: "user_interaction",
      PERFORMANCE_METRIC: "performance_metric",
      ERROR_EVENT: "error_event",
      SESSION_UPDATE: "session_update",
    },
  },

  // Error recovery settings
  ERROR_RECOVERY: {
    MAX_RETRY_ATTEMPTS: 3,
    RETRY_DELAY: 1500, // Base delay between retries
    CIRCUIT_BREAKER_THRESHOLD: 4,
    CIRCUIT_BREAKER_TIMEOUT: 90000, // 90 seconds
  },
};

export class EnhancedSimulationModal {
  static instanceCount = 0;
  static allInstances = new Set();

  constructor(simulationId, options = {}) {
    // === ENTERPRISE INITIALIZATION ===

    // Generate unique instance identifiers
    EnhancedSimulationModal.instanceCount++;
    this.instanceId = `enhanced-modal-${EnhancedSimulationModal.instanceCount}`;
    this.instanceUuid = this._generateUUID();
    this.createdAt = Date.now();

    // Core properties
    this.simulationId = simulationId;
    this.options = {
      onClose: options.onClose || (() => {}),
      showTabs: options.showTabs !== false,
      showResourcePanel: options.showResourcePanel !== false,
      collapseEthicsMeters: options.collapseEthicsMeters || false,
      size: options.size || "large", // small, medium, large, fullscreen
      ...options,
    };

    // Modal state
    this.currentTab = "simulation";
    this.isEthicsMetersCollapsed = this.options.collapseEthicsMeters;
    this.modal = null;
    this.resizeObserver = null;
    this.focusTrap = null;

    // Enterprise health monitoring
    this.isHealthy = true;
    this.errorCount = 0;
    this.lastError = null;
    this.lastHealthCheck = Date.now();
    this.lastHeartbeat = Date.now();

    // Performance tracking
    this.performanceMetrics = {
      modalRenderTimes: [],
      tabSwitchTimes: [],
      simulationLoadTimes: [],
      totalRenders: 0,
      totalTabSwitches: 0,
      totalInteractions: 0,
      memoryUsage: 0,
      sessionDuration: 0,
      lastRenderTime: 0,
    };

    // Circuit breaker for error recovery
    this.circuitBreaker = {
      failures: 0,
      lastFailureTime: 0,
      state: "closed", // closed, open, half-open
      isOpen: false,
    };

    // Enterprise telemetry batching
    this.telemetryBuffer = [];
    this.lastTelemetryFlush = Date.now();

    // User session tracking
    this.userSession = {
      sessionId: this._generateUUID(),
      startTime: Date.now(),
      tabHistory: [],
      interactionCount: 0,
      modalShown: false,
      resizeEvents: 0,
      errorOccurred: false,
    };

    // Initialize system metadata collector for tracking
    this.systemCollector = getSystemCollector();
    this.modalStartTime = new Date();

    // Track all instances for enterprise monitoring
    EnhancedSimulationModal.allInstances.add(this);

    // Initialize enterprise monitoring intervals
    this.healthCheckInterval = null;
    this.heartbeatInterval = null;
    this.telemetryFlushInterval = null;

    // Initialize enterprise monitoring
    this._initializeEnterpriseMonitoring();

    logger.info(
      "EnhancedSimulationModal",
      "🏢 Enterprise simulation modal instance created",
      {
        instanceId: this.instanceId,
        simulationId: this.simulationId,
        totalInstances: EnhancedSimulationModal.instanceCount,
      },
    );
  }

  /**
   * Generate UUID for instance tracking
   * @private
   * @returns {string} UUID
   */
  _generateUUID() {
    return "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
      /[xy]/g,
      function (c) {
        const r = (Math.random() * 16) | 0;
        const v = c === "x" ? r : (r & 0x3) | 0x8;
        return v.toString(16);
      },
    );
  }

  /**
   * Shows the enhanced simulation modal
   */
  show() {
    const startTime = performance.now();

    try {
      // Check circuit breaker
      if (this.circuitBreaker.isOpen) {
        logger.warn(
          "EnhancedSimulationModal",
          "Circuit breaker open, cannot show modal",
          {
            instanceId: this.instanceId,
          },
        );
        return;
      }

      // Track modal show
      this.userSession.modalShown = true;
      this.userSession.startTime = Date.now();

      this.createModal();
      this.setupEventListeners();
      this.setupResizeObserver();
      document.body.appendChild(this.modal);

      // Force reflow and then show
      this.modal.offsetHeight;
      this.modal.classList.add("visible");

      // Focus management - create focus trap
      this.focusTrap = focusManager.createTrap(this.modal, {
        autoFocus: true,
        restoreFocus: true,
      });

      // Record performance metrics
      const renderDuration = performance.now() - startTime;
      this._recordPerformanceMetric("modal_render", renderDuration);
      this.performanceMetrics.totalRenders++;

      // Track user session and telemetry
      this.userSession.interactionCount++;
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.MODAL_SHOW,
        {
          simulationId: this.simulationId,
          size: this.options.size,
          tabsEnabled: this.options.showTabs,
          renderDuration,
        },
      );

      // Track analytics
      this.trackAnalytics("enhanced_modal_opened", {
        simulationId: this.simulationId,
        size: this.options.size,
        tabsEnabled: this.options.showTabs,
      });

      logger.info("EnhancedSimulationModal", "Modal shown successfully", {
        instanceId: this.instanceId,
        renderDuration,
        simulationId: this.simulationId,
      });
    } catch (error) {
      this._handleError(error, "show");
    }
  }

  /**
   * Closes the modal
   */
  close() {
    try {
      if (this.modal) {
        // Calculate session duration for analytics
        const sessionDuration = new Date() - this.modalStartTime;
        this.performanceMetrics.sessionDuration = sessionDuration;

        // Update user session
        this.userSession.sessionDuration = sessionDuration;

        // Track modal session completion
        this.systemCollector.trackInteraction({
          element: "enhanced-simulation-modal",
          action: "close",
          duration: sessionDuration,
          metadata: {
            simulationId: this.simulationId,
            sessionDurationSeconds: Math.round(sessionDuration / 1000),
            finalTab: this.currentTab,
            component: "enhanced-simulation-modal",
            timestamp: new Date().toISOString(),
          },
        });

        // Log enterprise telemetry
        this._logTelemetry(
          ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.MODAL_CLOSE,
          {
            sessionDuration,
            finalTab: this.currentTab,
            totalTabSwitches: this.performanceMetrics.totalTabSwitches,
            totalInteractions: this.performanceMetrics.totalInteractions,
          },
        );

        // Clean up focus trap
        if (this.focusTrap) {
          this.focusTrap.destroy();
          this.focusTrap = null;
        }

        this.modal.classList.remove("visible");
        setTimeout(() => {
          if (this.modal && this.modal.parentNode) {
            this.modal.parentNode.removeChild(this.modal);
          }
          this.cleanup();
        }, TIMING.FAST);
      }

      this.options.onClose();
      this.trackAnalytics("enhanced_modal_closed");

      logger.info("EnhancedSimulationModal", "Modal closed successfully", {
        instanceId: this.instanceId,
        sessionDuration: this.performanceMetrics.sessionDuration,
      });
    } catch (error) {
      this._handleError(error, "close");
    }
  }

  /**
   * Creates the modal structure
   */
  createModal() {
    this.modal = document.createElement("div");
    this.modal.className = `enhanced-simulation-modal modal-size-${this.options.size}`;
    this.modal.setAttribute("role", "dialog");
    this.modal.setAttribute("aria-modal", "true");
    this.modal.setAttribute("aria-labelledby", "enhanced-modal-title");

    this.modal.innerHTML = `
            <div class="enhanced-modal-backdrop" aria-hidden="true"></div>
            <div class="enhanced-modal-container">
                <div class="enhanced-modal-header">
                    <h2 id="enhanced-modal-title" class="enhanced-modal-title">Simulation</h2>
                    <div class="enhanced-modal-controls">
                        <button class="btn-icon btn-expand" title="Toggle fullscreen" aria-label="Toggle fullscreen">
                            <span class="icon">⛶</span>
                        </button>
                        <button class="btn-icon btn-close" title="Close simulation" aria-label="Close simulation">
                            <span class="icon">×</span>
                        </button>
                    </div>
                </div>
                
                ${this.options.showTabs ? this.generateTabNavigation() : ""}
                
                <div class="enhanced-modal-body">
                    <div class="simulation-main-area">
                        <div class="simulation-content-wrapper">
                            <div id="enhanced-simulation-container" class="enhanced-simulation-container">
                                <!-- Simulation content will be injected here -->
                            </div>
                            
                            ${this.generateEthicsMetersPanel()}
                        </div>
                        
                        ${this.options.showResourcePanel ? this.generateResourcePanel() : ""}
                    </div>
                    
                    ${this.generateTabContent()}
                </div>
                
                <div class="enhanced-modal-footer">
                    <div class="simulation-status">
                        <span class="status-indicator" id="simulation-status">Ready</span>
                    </div>
                    <div class="simulation-actions">
                        <button class="btn btn-secondary" id="reset-enhanced-simulation">Reset</button>
                        <button class="btn btn-secondary" id="pause-enhanced-simulation">Pause</button>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates tab navigation
   */
  generateTabNavigation() {
    return `
            <div class="enhanced-modal-tabs" role="tablist">
                <button class="enhanced-tab active" role="tab" data-tab="simulation" aria-selected="true" aria-controls="tab-simulation">
                    <span class="tab-icon">🎮</span>
                    <span class="tab-label">Simulation</span>
                </button>
                <button class="enhanced-tab" role="tab" data-tab="resources" aria-selected="false" aria-controls="tab-resources">
                    <span class="tab-icon">📚</span>
                    <span class="tab-label">Resources</span>
                </button>
                <button class="enhanced-tab" role="tab" data-tab="progress" aria-selected="false" aria-controls="tab-progress">
                    <span class="tab-icon">📊</span>
                    <span class="tab-label">Progress</span>
                </button>
                <button class="enhanced-tab" role="tab" data-tab="help" aria-selected="false" aria-controls="tab-help">
                    <span class="tab-icon">❓</span>
                    <span class="tab-label">Help</span>
                </button>
            </div>
        `;
  }

  /**
   * Generates ethics meters panel
   */
  generateEthicsMetersPanel() {
    return `
            <div class="ethics-meters-panel ${this.isEthicsMetersCollapsed ? "collapsed" : ""}" id="ethics-meters-panel">
                <div class="ethics-meters-header">
                    <h3>Ethics Monitoring</h3>
                    <button class="btn-icon btn-collapse" title="Toggle ethics meters" aria-label="Toggle ethics meters">
                        <span class="icon">${this.isEthicsMetersCollapsed ? "▶" : "▼"}</span>
                    </button>
                </div>
                <div class="ethics-meters-content">
                    <p class="ethics-description">Track how your decisions affect different ethical dimensions</p>
                    <div class="meters-container" role="group" aria-label="Ethics meters">
                        <!-- Enhanced meters will be dynamically created here -->
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates resource panel
   */
  generateResourcePanel() {
    return `
            <div class="resource-panel" id="resource-panel">
                <div class="resource-panel-header">
                    <h3>Quick Resources</h3>
                    <button class="btn-icon btn-collapse" title="Toggle resources" aria-label="Toggle resources">
                        <span class="icon">◀</span>
                    </button>
                </div>
                <div class="resource-panel-content">
                    <div class="resource-section">
                        <h4>Key Concepts</h4>
                        <ul class="resource-list" id="quick-concepts">
                            <!-- Quick concepts will be populated here -->
                        </ul>
                    </div>
                    <div class="resource-section">
                        <h4>Need Help?</h4>
                        <ul class="resource-list" id="quick-help">
                            <li><a href="#" class="resource-link" data-action="show-hints">Show Hints</a></li>
                            <li><a href="#" class="resource-link" data-action="explain-scenario">Explain Scenario</a></li>
                            <li><a href="#" class="resource-link" data-action="ethics-guide">Ethics Guide</a></li>
                        </ul>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Generates tab content panels
   */
  generateTabContent() {
    if (!this.options.showTabs) return "";

    return `
            <div class="enhanced-tab-content">
                <div class="tab-panel" id="tab-simulation" role="tabpanel" aria-labelledby="tab-simulation" style="display: none;">
                    <!-- Simulation tab content is handled by main area -->
                </div>
                
                <div class="tab-panel" id="tab-resources" role="tabpanel" aria-labelledby="tab-resources" style="display: none;">
                    <div class="tab-content-header">
                        <h3>Educational Resources</h3>
                        <p>Supporting materials and deeper learning opportunities</p>
                    </div>
                    <div class="resources-grid">
                        <div class="resource-category">
                            <h4>Background Reading</h4>
                            <div class="resource-items" id="background-reading">
                                <!-- Resources will be populated here -->
                            </div>
                        </div>
                        <div class="resource-category">
                            <h4>Related Videos</h4>
                            <div class="resource-items" id="related-videos">
                                <!-- Videos will be populated here -->
                            </div>
                        </div>
                        <div class="resource-category">
                            <h4>Discussion Questions</h4>
                            <div class="resource-items" id="discussion-questions">
                                <!-- Questions will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-panel" id="tab-progress" role="tabpanel" aria-labelledby="tab-progress" style="display: none;">
                    <div class="tab-content-header">
                        <h3>Your Progress</h3>
                        <p>Track your learning journey and decisions</p>
                    </div>
                    <div class="progress-content">
                        <div class="progress-summary">
                            <div class="progress-stat">
                                <span class="stat-value" id="decisions-made">0</span>
                                <span class="stat-label">Decisions Made</span>
                            </div>
                            <div class="progress-stat">
                                <span class="stat-value" id="time-spent">0:00</span>
                                <span class="stat-label">Time Spent</span>
                            </div>
                            <div class="progress-stat">
                                <span class="stat-value" id="concepts-explored">0</span>
                                <span class="stat-label">Concepts Explored</span>
                            </div>
                        </div>
                        <div class="decision-history">
                            <h4>Decision History</h4>
                            <div class="decisions-timeline" id="decisions-timeline">
                                <!-- Decision history will be populated here -->
                            </div>
                        </div>
                    </div>
                </div>
                
                <div class="tab-panel" id="tab-help" role="tabpanel" aria-labelledby="tab-help" style="display: none;">
                    <div class="tab-content-header">
                        <h3>Help & Support</h3>
                        <p>Get assistance and learn how to use the simulation</p>
                    </div>
                    <div class="help-content">
                        <div class="help-section">
                            <h4>How to Use</h4>
                            <div class="help-steps">
                                <ol>
                                    <li>Read the scenario and understand the context</li>
                                    <li>Make decisions by clicking on available options</li>
                                    <li>Observe how ethics meters change with your choices</li>
                                    <li>Reflect on the consequences of your decisions</li>
                                </ol>
                            </div>
                        </div>
                        <div class="help-section">
                            <h4>Understanding Ethics Meters</h4>
                            <div class="ethics-explanation" id="ethics-explanation">
                                <!-- Ethics meter explanations will be populated here -->
                            </div>
                        </div>
                        <div class="help-section">
                            <h4>Need More Help?</h4>
                            <div class="help-actions">
                                <button class="btn btn-secondary" id="show-tutorial">Show Tutorial</button>
                                <button class="btn btn-secondary" id="contact-support">Contact Support</button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        `;
  }

  /**
   * Sets up event listeners
   */
  setupEventListeners() {
    // Close button
    const closeBtn = this.modal.querySelector(".btn-close");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.close());
    }

    // Backdrop click
    const backdrop = this.modal.querySelector(".enhanced-modal-backdrop");
    if (backdrop) {
      backdrop.addEventListener("click", () => this.close());
    }

    // Escape key
    document.addEventListener("keydown", this.handleKeyDown.bind(this));

    // Tab switching
    if (this.options.showTabs) {
      const tabButtons = this.modal.querySelectorAll(".enhanced-tab");
      tabButtons.forEach((button) => {
        button.addEventListener("click", (e) => {
          this.switchTab(e.target.closest(".enhanced-tab").dataset.tab);
        });
      });
    }

    // Collapsible panels
    this.setupCollapsiblePanels();

    // Fullscreen toggle
    const expandBtn = this.modal.querySelector(".btn-expand");
    if (expandBtn) {
      expandBtn.addEventListener("click", () => this.toggleFullscreen());
    }

    // Simulation controls
    this.setupSimulationControls();
  }

  /**
   * Sets up collapsible panels
   */
  setupCollapsiblePanels() {
    const collapseButtons = this.modal.querySelectorAll(".btn-collapse");
    collapseButtons.forEach((button) => {
      button.addEventListener("click", (e) => {
        const panel = e.target.closest(".ethics-meters-panel, .resource-panel");
        if (panel) {
          panel.classList.toggle("collapsed");
          const icon = button.querySelector(".icon");
          if (panel.classList.contains("ethics-meters-panel")) {
            icon.textContent = panel.classList.contains("collapsed")
              ? "▶"
              : "▼";
          } else {
            icon.textContent = panel.classList.contains("collapsed")
              ? "▶"
              : "◀";
          }
        }
      });
    });
  }

  /**
   * Sets up simulation controls
   */
  setupSimulationControls() {
    const resetBtn = this.modal.querySelector("#reset-enhanced-simulation");
    const pauseBtn = this.modal.querySelector("#pause-enhanced-simulation");

    if (resetBtn) {
      resetBtn.addEventListener("click", () => {
        this.resetSimulation();
      });
    }

    if (pauseBtn) {
      pauseBtn.addEventListener("click", () => {
        this.togglePause();
      });
    }
  }

  /**
   * Switches to a different tab
   */
  switchTab(tabName) {
    const startTime = performance.now();

    try {
      const previousTab = this.currentTab;

      // Update tab buttons
      const tabButtons = this.modal.querySelectorAll(".enhanced-tab");
      tabButtons.forEach((button) => {
        const isActive = button.dataset.tab === tabName;
        button.classList.toggle("active", isActive);
        button.setAttribute("aria-selected", isActive);
      });

      // Show/hide tab content
      const tabPanels = this.modal.querySelectorAll(".tab-panel");
      tabPanels.forEach((panel) => {
        panel.style.display = panel.id === `tab-${tabName}` ? "block" : "none";
      });

      // Update main area visibility
      const simulationArea = this.modal.querySelector(".simulation-main-area");
      if (simulationArea) {
        simulationArea.style.display =
          tabName === "simulation" ? "flex" : "none";
      }

      this.currentTab = tabName;

      // Record performance metrics
      const switchDuration = performance.now() - startTime;
      this._recordPerformanceMetric("tab_switch", switchDuration);
      this.performanceMetrics.totalTabSwitches++;

      // Track tab history and user session
      this.userSession.tabHistory.push({
        from: previousTab,
        to: tabName,
        timestamp: Date.now(),
        duration: switchDuration,
      });

      // Track tab switching for system analytics
      this.systemCollector.trackInteraction({
        element: "simulation-modal-tab",
        action: "click",
        metadata: {
          tabName,
          simulationId: this.simulationId,
          previousTab: previousTab,
          component: "enhanced-simulation-modal",
          timestamp: new Date().toISOString(),
        },
      });

      // Log enterprise telemetry for tab switch
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.TAB_SWITCH,
        {
          tabName,
          previousTab,
          switchDuration,
          totalTabSwitches: this.performanceMetrics.totalTabSwitches,
        },
      );

      // Track navigation within simulation for UX analysis
      this.systemCollector.trackNavigation({
        from: `simulation-tab-${previousTab}`,
        to: `simulation-tab-${tabName}`,
        action: "tab-switch",
        metadata: {
          component: "enhanced-simulation-modal",
          simulationId: this.simulationId,
        },
      });

      this.trackAnalytics("tab_switched", { tab: tabName });

      logger.debug("EnhancedSimulationModal", "Tab switched successfully", {
        instanceId: this.instanceId,
        from: previousTab,
        to: tabName,
        duration: switchDuration,
      });
    } catch (error) {
      this._handleError(error, "switchTab");
    }
  }

  /**
   * Toggles fullscreen mode
   */
  toggleFullscreen() {
    this.modal.classList.toggle("fullscreen-mode");
    const expandBtn = this.modal.querySelector(".btn-expand .icon");
    if (expandBtn) {
      expandBtn.textContent = this.modal.classList.contains("fullscreen-mode")
        ? "⛶"
        : "⛶";
    }

    this.trackAnalytics("fullscreen_toggled", {
      isFullscreen: this.modal.classList.contains("fullscreen-mode"),
    });
  }

  /**
   * Resets the simulation
   */
  resetSimulation() {
    // This will be called by the parent application
    if (this.options.onReset) {
      this.options.onReset();
    }
    this.trackAnalytics("simulation_reset");
  }

  /**
   * Toggles simulation pause
   */
  togglePause() {
    const pauseBtn = this.modal.querySelector("#pause-enhanced-simulation");
    const isPaused = pauseBtn.textContent === "Resume";

    pauseBtn.textContent = isPaused ? "Pause" : "Resume";

    if (this.options.onPause) {
      this.options.onPause(!isPaused);
    }

    this.trackAnalytics("simulation_pause_toggled", { isPaused: !isPaused });
  }

  /**
   * Updates simulation status
   */
  updateStatus(status) {
    const statusIndicator = this.modal.querySelector("#simulation-status");
    if (statusIndicator) {
      statusIndicator.textContent = status;
    }
  }

  /**
   * Updates progress tracking
   */
  updateProgress(progress) {
    const decisionsElement = this.modal.querySelector("#decisions-made");
    const timeElement = this.modal.querySelector("#time-spent");
    const conceptsElement = this.modal.querySelector("#concepts-explored");

    if (decisionsElement && progress.decisions !== undefined) {
      decisionsElement.textContent = progress.decisions;
    }

    if (timeElement && progress.timeSpent !== undefined) {
      timeElement.textContent = this.formatTime(progress.timeSpent);
    }

    if (conceptsElement && progress.concepts !== undefined) {
      conceptsElement.textContent = progress.concepts;
    }
  }

  /**
   * Adds a decision to the timeline
   */
  addDecisionToTimeline(decision) {
    const timeline = this.modal.querySelector("#decisions-timeline");
    if (timeline) {
      const decisionElement = document.createElement("div");
      decisionElement.className = "decision-item";
      decisionElement.innerHTML = `
                <div class="decision-time">${new Date().toLocaleTimeString()}</div>
                <div class="decision-description">${decision.description}</div>
                <div class="decision-impact">${decision.impact}</div>
            `;
      timeline.appendChild(decisionElement);

      // Scroll to bottom
      timeline.scrollTop = timeline.scrollHeight;
    }
  }

  /**
   * Gets the simulation container for injecting content
   */
  getSimulationContainer() {
    return this.modal.querySelector("#enhanced-simulation-container");
  }

  /**
   * Gets the ethics meters container
   */
  getEthicsMetersContainer() {
    return this.modal.querySelector(".meters-container");
  }

  /**
   * Sets up resize observer for responsive behavior
   */
  setupResizeObserver() {
    if (window.ResizeObserver) {
      this.resizeObserver = new ResizeObserver((entries) => {
        for (const entry of entries) {
          this.handleResize(entry.contentRect);
        }
      });

      this.resizeObserver.observe(this.modal);
    }
  }

  /**
   * Handles resize events
   */
  handleResize(rect) {
    // Adjust layout based on size
    if (rect.width < BREAKPOINTS.MOBILE) {
      this.modal.classList.add("mobile-layout");
    } else {
      this.modal.classList.remove("mobile-layout");
    }

    // Auto-collapse panels on small screens
    if (rect.width < BREAKPOINTS.TABLET) {
      const resourcePanel = this.modal.querySelector(".resource-panel");
      if (resourcePanel && !resourcePanel.classList.contains("collapsed")) {
        resourcePanel.classList.add("collapsed");
      }
    }
  }

  /**
   * Handles keyboard navigation
   */
  handleKeyDown(event) {
    if (event.key === "Escape") {
      this.close();
    } else if (event.key === "Tab") {
      this.handleTabNavigation(event);
    }
  }

  /**
   * Handles tab navigation for accessibility
   */
  handleTabNavigation(event) {
    const focusableElements = this.modal.querySelectorAll(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );

    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];

    if (event.shiftKey) {
      if (document.activeElement === firstFocusable) {
        lastFocusable.focus();
        event.preventDefault();
      }
    } else {
      if (document.activeElement === lastFocusable) {
        firstFocusable.focus();
        event.preventDefault();
      }
    }
  }

  /**
   * Sets up focus trapping (now handled by focus manager)
   * @deprecated Use focusManager.createTrap() instead
   */
  trapFocus() {
    // This method is deprecated and focus is now managed by the centralized focus manager
    // Kept for backward compatibility but focus trap is set up in open() method
  }

  /**
   * Formats time in MM:SS format
   */
  formatTime(seconds) {
    const mins = Math.floor(seconds / TIMING.SECONDS_PER_MINUTE);
    const secs = seconds % TIMING.SECONDS_PER_MINUTE;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  }

  /**
   * Tracks analytics events
   */
  trackAnalytics(eventName, data = {}) {
    if (window.simpleAnalytics) {
      window.simpleAnalytics.trackEvent(eventName, {
        simulationId: this.simulationId,
        modalType: "enhanced",
        ...data,
      });
    }
  }

  /**
   * Cleanup when modal is closed
   */
  cleanup() {
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }

    document.removeEventListener("keydown", this.handleKeyDown.bind(this));
    this.modal = null;
  }

  // ⭐ ENTERPRISE MONITORING METHODS ⭐

  /**
   * Initialize enterprise monitoring systems
   * @private
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Initialize health monitoring
      this.healthMetrics = {
        modalRenderTime: 0,
        tabSwitchCount: 0,
        errorCount: 0,
        lastHealthCheck: Date.now(),
        circuitBreakerTrips: 0,
        memoryUsage: performance.memory ? performance.memory.usedJSHeapSize : 0,
      };

      // Initialize performance tracking
      this.performanceTracker = {
        startTime: performance.now(),
        renderMetrics: {},
        tabSwitchTimes: [],
        userInteractionCount: 0,
      };

      // Setup telemetry batching
      this.telemetryBatch = [];
      this.lastTelemetryFlush = Date.now();

      logger.info(
        "EnhancedSimulationModal",
        "Enterprise monitoring initialized",
        {
          instanceId: this.instanceId,
          healthMetrics: this.healthMetrics,
          timestamp: new Date().toISOString(),
        },
      );

      return true;
    } catch (error) {
      logger.error(
        "EnhancedSimulationModal",
        "Failed to initialize enterprise monitoring",
        error,
      );
      return false;
    }
  }

  /**
   * Handle errors with enterprise error management
   * @param {Error} error - The error to handle
   * @param {string} context - Context where the error occurred
   * @private
   */
  _handleError(error, context = "unknown") {
    this.errorCount++;
    this.healthMetrics.errorCount++;

    const errorData = {
      instanceId: this.instanceId,
      context,
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
      errorCount: this.errorCount,
      simulationId: this.simulationId,
    };

    // Check if circuit breaker should trip
    if (this.errorCount >= ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER.MAX_ERRORS) {
      this.circuitBreakerTripped = true;
      this.healthMetrics.circuitBreakerTrips++;

      logger.error("EnhancedSimulationModal", "Circuit breaker tripped", {
        ...errorData,
        circuitBreakerState: "OPEN",
      });

      // Auto-recovery after timeout
      setTimeout(() => {
        this.circuitBreakerTripped = false;
        this.errorCount = 0;
        logger.info(
          "EnhancedSimulationModal",
          "Circuit breaker auto-recovery",
          {
            instanceId: this.instanceId,
          },
        );
      }, ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER.RECOVERY_TIMEOUT);
    }

    // Log to enterprise telemetry
    this._logTelemetry(
      ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.ERROR,
      errorData,
    );

    logger.error("EnhancedSimulationModal", `Error in ${context}`, errorData);
  }

  /**
   * Record performance metric with enterprise analytics
   * @param {string} metricName - Name of the metric
   * @param {number} value - Metric value
   * @param {Object} metadata - Additional metadata
   * @private
   */
  _recordPerformanceMetric(metricName, value, metadata = {}) {
    try {
      const metric = {
        name: metricName,
        value,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        simulationId: this.simulationId,
        ...metadata,
      };

      // Store in performance tracker
      if (!this.performanceTracker.renderMetrics[metricName]) {
        this.performanceTracker.renderMetrics[metricName] = [];
      }
      this.performanceTracker.renderMetrics[metricName].push(metric);

      // Check performance thresholds
      if (
        metricName === "modalRenderTime" &&
        value > ENTERPRISE_CONSTANTS.PERFORMANCE.MODAL_RENDER_THRESHOLD
      ) {
        logger.warn(
          "EnhancedSimulationModal",
          "Modal render time exceeded threshold",
          {
            threshold: ENTERPRISE_CONSTANTS.PERFORMANCE.MODAL_RENDER_THRESHOLD,
            actual: value,
            instanceId: this.instanceId,
          },
        );
      }

      if (
        metricName === "tabSwitchTime" &&
        value > ENTERPRISE_CONSTANTS.PERFORMANCE.TAB_SWITCH_THRESHOLD
      ) {
        logger.warn(
          "EnhancedSimulationModal",
          "Tab switch time exceeded threshold",
          {
            threshold: ENTERPRISE_CONSTANTS.PERFORMANCE.TAB_SWITCH_THRESHOLD,
            actual: value,
            instanceId: this.instanceId,
          },
        );
      }

      // Log to enterprise telemetry
      this._logTelemetry(
        ENTERPRISE_CONSTANTS.TELEMETRY.EVENT_TYPES.PERFORMANCE,
        metric,
      );

      logger.debug(
        "EnhancedSimulationModal",
        "Performance metric recorded",
        metric,
      );
    } catch (error) {
      logger.error(
        "EnhancedSimulationModal",
        "Failed to record performance metric",
        error,
      );
    }
  }

  /**
   * Log enterprise telemetry with batching
   * @param {string} eventType - Type of telemetry event
   * @param {Object} data - Event data
   * @private
   */
  _logTelemetry(eventType, data) {
    try {
      const telemetryEvent = {
        eventType,
        timestamp: Date.now(),
        instanceId: this.instanceId,
        sessionId: this.sessionId,
        simulationId: this.simulationId,
        data,
        version: "1.20.0",
      };

      // Add to batch
      this.telemetryBatch.push(telemetryEvent);

      // Check if batch should be flushed
      const shouldFlush =
        this.telemetryBatch.length >=
          ENTERPRISE_CONSTANTS.TELEMETRY.BATCH_SIZE ||
        Date.now() - this.lastTelemetryFlush >=
          ENTERPRISE_CONSTANTS.TELEMETRY.FLUSH_INTERVAL;

      if (shouldFlush) {
        this._flushTelemetryBatch();
      }
    } catch (error) {
      logger.error("EnhancedSimulationModal", "Failed to log telemetry", error);
    }
  }

  /**
   * Flush telemetry batch to analytics service
   * @private
   */
  _flushTelemetryBatch() {
    if (this.telemetryBatch.length === 0) return;

    try {
      const batchData = {
        events: [...this.telemetryBatch],
        batchId: `${this.instanceId}-${Date.now()}`,
        timestamp: Date.now(),
        instanceCount: this.telemetryBatch.length,
      };

      // Send to analytics service (placeholder for actual implementation)
      logger.info("EnhancedSimulationModal", "Telemetry batch flushed", {
        batchSize: this.telemetryBatch.length,
        batchId: batchData.batchId,
        instanceId: this.instanceId,
      });

      // Clear batch
      this.telemetryBatch = [];
      this.lastTelemetryFlush = Date.now();
    } catch (error) {
      logger.error(
        "EnhancedSimulationModal",
        "Failed to flush telemetry batch",
        error,
      );
    }
  }

  /**
   * Perform health check with enterprise monitoring
   * @returns {Object} Health status report
   */
  performHealthCheck() {
    try {
      const now = Date.now();
      const healthStatus = {
        instanceId: this.instanceId,
        healthy: true,
        timestamp: now,
        uptime: now - this.startTime,
        metrics: {
          ...this.healthMetrics,
          memoryUsage: performance.memory
            ? performance.memory.usedJSHeapSize
            : 0,
          lastHealthCheck: now,
        },
        performance: {
          averageRenderTime: this._calculateAverageMetric("modalRenderTime"),
          averageTabSwitchTime: this._calculateAverageMetric("tabSwitchTime"),
          totalInteractions: this.performanceTracker.userInteractionCount,
        },
        circuitBreakerStatus: this.circuitBreakerTripped ? "OPEN" : "CLOSED",
        telemetryBatchSize: this.telemetryBatch.length,
      };

      // Determine overall health
      if (
        this.circuitBreakerTripped ||
        this.healthMetrics.errorCount >
          ENTERPRISE_CONSTANTS.HEALTH.MAX_ERRORS ||
        healthStatus.performance.averageRenderTime >
          ENTERPRISE_CONSTANTS.PERFORMANCE.MODAL_RENDER_THRESHOLD
      ) {
        healthStatus.healthy = false;
      }

      this.healthMetrics.lastHealthCheck = now;

      logger.debug(
        "EnhancedSimulationModal",
        "Health check completed",
        healthStatus,
      );

      return healthStatus;
    } catch (error) {
      logger.error("EnhancedSimulationModal", "Health check failed", error);
      return {
        instanceId: this.instanceId,
        healthy: false,
        error: error.message,
        timestamp: Date.now(),
      };
    }
  }

  /**
   * Calculate average for a performance metric
   * @param {string} metricName - Name of the metric
   * @returns {number} Average value
   * @private
   */
  _calculateAverageMetric(metricName) {
    const metrics = this.performanceTracker.renderMetrics[metricName] || [];
    if (metrics.length === 0) return 0;

    const sum = metrics.reduce((acc, metric) => acc + metric.value, 0);
    return sum / metrics.length;
  }

  // ⭐ STATIC ENTERPRISE METHODS ⭐

  /**
   * Get all active EnhancedSimulationModal instances
   * @returns {Array} Array of active instances
   * @static
   */
  static getAllInstances() {
    return Array.from(EnhancedSimulationModal._instances || []);
  }

  /**
   * Generate enterprise health report for all instances
   * @returns {Object} Comprehensive health report
   * @static
   */
  static getEnterpriseHealthReport() {
    const instances = EnhancedSimulationModal.getAllInstances();

    const report = {
      timestamp: Date.now(),
      totalInstances: instances.length,
      healthyInstances: 0,
      unhealthyInstances: 0,
      instances: [],
      aggregateMetrics: {
        totalErrors: 0,
        totalInteractions: 0,
        averageUptime: 0,
        circuitBreakerTrips: 0,
      },
    };

    instances.forEach((instance) => {
      const health = instance.performHealthCheck();
      report.instances.push(health);

      if (health.healthy) {
        report.healthyInstances++;
      } else {
        report.unhealthyInstances++;
      }

      report.aggregateMetrics.totalErrors += health.metrics?.errorCount || 0;
      report.aggregateMetrics.totalInteractions +=
        health.performance?.totalInteractions || 0;
      report.aggregateMetrics.circuitBreakerTrips +=
        health.metrics?.circuitBreakerTrips || 0;
    });

    if (instances.length > 0) {
      const totalUptime = instances.reduce(
        (acc, instance) => acc + (Date.now() - instance.startTime),
        0,
      );
      report.aggregateMetrics.averageUptime = totalUptime / instances.length;
    }

    return report;
  }

  /**
   * Debug enterprise status for all instances
   * @static
   */
  static debugEnterpriseStatus() {
    const healthReport = EnhancedSimulationModal.getEnterpriseHealthReport();

    console.group("🏢 EnhancedSimulationModal Enterprise Status");
    console.log("📊 Health Report:", healthReport);
    console.log("📈 Instance Count:", healthReport.totalInstances);
    console.log("✅ Healthy Instances:", healthReport.healthyInstances);
    console.log("❌ Unhealthy Instances:", healthReport.unhealthyInstances);
    console.log("⚡ Aggregate Metrics:", healthReport.aggregateMetrics);

    healthReport.instances.forEach((instance, index) => {
      console.group(`📱 Instance ${index + 1} (${instance.instanceId})`);
      console.log(
        "Health Status:",
        instance.healthy ? "✅ Healthy" : "❌ Unhealthy",
      );
      console.log("Uptime:", `${Math.round(instance.uptime / 1000)}s`);
      console.log("Circuit Breaker:", instance.circuitBreakerStatus);
      console.log("Performance Metrics:", instance.performance);
      console.groupEnd();
    });

    console.groupEnd();

    return healthReport;
  }
}

// ⭐ STATIC INSTANCE TRACKING ⭐
EnhancedSimulationModal._instances = new Set();

// ⭐ GLOBAL ENTERPRISE DEBUG FUNCTIONS ⭐

/**
 * Global debug function for EnhancedSimulationModal enterprise status
 * Usage: debugSimulationModals() in browser console
 */
window.debugSimulationModals = function () {
  return EnhancedSimulationModal.debugEnterpriseStatus();
};

/**
 * Global function to get simulation modal health report
 * Usage: getSimulationModalHealth() in browser console
 */
window.getSimulationModalHealth = function () {
  return EnhancedSimulationModal.getEnterpriseHealthReport();
};

/**
 * Global function to list all active simulation modal instances
 * Usage: listSimulationModals() in browser console
 */
window.listSimulationModals = function () {
  const instances = EnhancedSimulationModal.getAllInstances();
  console.table(
    instances.map((instance) => ({
      instanceId: instance.instanceId,
      simulationId: instance.simulationId,
      isOpen: instance.isOpen,
      currentTab: instance.currentTab,
      startTime: new Date(instance.startTime).toLocaleString(),
      errorCount: instance.errorCount,
      circuitBreakerTripped: instance.circuitBreakerTripped,
    })),
  );
  return instances;
};
