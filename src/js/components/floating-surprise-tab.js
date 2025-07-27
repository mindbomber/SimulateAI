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
 * Floating Surprise Tab Component
 * Professional floating "Surprise Me!" button that slides out on hover/click
 * Enhanced with DataHandler integration for comprehensive analytics and user preferences
 */

// Import DataHandler for enhanced data management
import DataHandler from "../core/data-handler.js";

// Constants
const SURPRISE_MOBILE_BREAKPOINT = 768;
const SURPRISE_MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const SURPRISE_RIPPLE_DURATION = 600;
const SURPRISE_DEBOUNCE_DELAY = 300;
const SURPRISE_RIPPLE_DELAY = 50;
const SURPRISE_FEEDBACK_DURATION = 2000;

class FloatingSurpriseTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= SURPRISE_MOBILE_BREAKPOINT;
    this.isInitialized = false;
    this.collapseTimeout = null;
    this.lastClickTime = 0;

    // DataHandler integration for enhanced analytics and persistence
    this.dataHandler = null;
    this.initializeDataHandler();

    // Enhanced analytics tracking
    this.surpriseMetrics = {
      triggers: 0,
      successes: 0,
      failures: 0,
      hovers: 0,
      expansions: 0,
      averageResponseTime: 0,
      scenariosLaunched: [],
      lastUsed: null,
      sessionStart: Date.now(),
    };

    this.init();
    this.bindEvents();
    this.listenToSettings();
  }

  /**
   * Initialize DataHandler for enhanced data persistence and analytics
   */
  async initializeDataHandler() {
    try {
      this.dataHandler = new DataHandler();
      await this.dataHandler.initialize();
      await this.loadSurpriseMetrics();
      await this.loadUserPreferences();
      console.log("FloatingSurpriseTab: DataHandler initialized successfully");
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] DataHandler initialization failed, using fallback mode:",
        error,
      );
      // Continue without DataHandler - use localStorage fallback
      this.dataHandler = null;
      this.loadSurpriseMetricsFromLocalStorage();
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Load surprise metrics from DataHandler
   */
  async loadSurpriseMetrics() {
    if (!this.dataHandler) {
      this.loadSurpriseMetricsFromLocalStorage();
      return;
    }

    try {
      const storedMetrics = await this.dataHandler.getData(
        "floatingSurpriseTab_metrics",
      );
      if (storedMetrics) {
        this.surpriseMetrics = {
          ...this.surpriseMetrics,
          ...storedMetrics,
          sessionStart: Date.now(), // Reset session start
        };
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Failed to load surprise metrics from DataHandler, using localStorage:",
        error,
      );
      this.loadSurpriseMetricsFromLocalStorage();
    }
  }

  /**
   * Load surprise metrics from localStorage fallback
   */
  loadSurpriseMetricsFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingSurpriseTab_metrics");
      if (saved) {
        const storedMetrics = JSON.parse(saved);
        this.surpriseMetrics = {
          ...this.surpriseMetrics,
          ...storedMetrics,
          sessionStart: Date.now(),
        };
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Error loading metrics from localStorage:",
        error,
      );
    }
  }

  /**
   * Load user preferences from DataHandler
   */
  async loadUserPreferences() {
    if (!this.dataHandler) {
      this.loadPreferencesFromLocalStorage();
      return;
    }

    try {
      const preferences = await this.dataHandler.getData(
        "floatingSurpriseTab_preferences",
      );
      if (preferences) {
        this.userPreferences = preferences;
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Failed to load user preferences from DataHandler, using localStorage:",
        error,
      );
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Load user preferences from localStorage fallback
   */
  loadPreferencesFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingSurpriseTab_preferences");
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      console.warn(
        "[FloatingSurpriseTab] Error loading preferences from localStorage:",
        error,
      );
    }
  }

  /**
   * Save surprise metrics to DataHandler or localStorage
   */
  async saveSurpriseMetrics() {
    const metricsToSave = {
      ...this.surpriseMetrics,
      lastUpdated: Date.now(),
    };

    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "floatingSurpriseTab_metrics",
          metricsToSave,
        );
        return;
      } catch (error) {
        console.warn(
          "[FloatingSurpriseTab] Failed to save surprise metrics to DataHandler, using localStorage fallback:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        "floatingSurpriseTab_metrics",
        JSON.stringify(metricsToSave),
      );
    } catch (error) {
      console.error(
        "[FloatingSurpriseTab] Failed to save metrics to localStorage:",
        error,
      );
    }
  }

  /**
   * Track surprise interaction with enhanced analytics
   */
  trackSurpriseInteraction(action, metadata = {}) {
    // Update metrics
    this.surpriseMetrics[action] = (this.surpriseMetrics[action] || 0) + 1;
    this.surpriseMetrics.lastUsed = Date.now();

    // Calculate average response time for triggers
    if (action === "triggers" && metadata.responseTime) {
      const currentAvg = this.surpriseMetrics.averageResponseTime || 0;
      const totalTriggers = this.surpriseMetrics.triggers;
      this.surpriseMetrics.averageResponseTime =
        (currentAvg * (totalTriggers - 1) + metadata.responseTime) /
        totalTriggers;
    }

    // Track launched scenarios
    if (action === "successes" && metadata.scenarioId) {
      this.surpriseMetrics.scenariosLaunched.push({
        scenarioId: metadata.scenarioId,
        timestamp: Date.now(),
      });

      // Keep only last 50 scenarios
      if (this.surpriseMetrics.scenariosLaunched.length > 50) {
        this.surpriseMetrics.scenariosLaunched =
          this.surpriseMetrics.scenariosLaunched.slice(-50);
      }
    }

    // Save metrics (debounced)
    this.saveSurpriseMetrics();

    // Track with app analytics if available
    if (window.app?.analyticsManager) {
      window.app.analyticsManager.trackEvent("floating_surprise_tab", {
        action,
        isMobile: this.isMobile,
        sessionDuration: Date.now() - this.surpriseMetrics.sessionStart,
        totalUses: this.surpriseMetrics.triggers,
        successRate:
          this.surpriseMetrics.triggers > 0
            ? this.surpriseMetrics.successes / this.surpriseMetrics.triggers
            : 0,
        ...metadata,
      });
    }
  }

  init() {
    if (this.isInitialized) return;

    this.createElement();
    this.attachToDOM();
    this.applyInitialSettings();
    this.isInitialized = true;
  }

  listenToSettings() {
    // Listen for settings changes
    window.addEventListener("settingsChanged", (e) => {
      const { settings } = e.detail;
      this.updateVisibility(settings.surpriseTabEnabled);
    });

    // Listen for settings manager ready
    window.addEventListener("settingsManagerReady", (e) => {
      const { settings } = e.detail;
      this.updateVisibility(settings.surpriseTabEnabled);
    });

    // Listen for surprise me requests from other components
    document.addEventListener("surpriseMeRequested", (e) => {
      console.log(
        "FloatingSurpriseTab: Received surpriseMeRequested event:",
        e.detail,
      );
      if (e.detail && e.detail.source !== "floating-tab") {
        this.addSuccessFeedback();
      }
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled = window.settingsManager.getSetting("surpriseTabEnabled");
        this.updateVisibility(enabled);
      }
    };

    // Try immediately
    applySettings();

    // Also try after a short delay in case settings manager isn't ready
    setTimeout(applySettings, 100);
  }

  updateVisibility(enabled) {
    if (this.link) {
      this.link.style.display = enabled ? "block" : "none";
    }
  }

  createElement() {
    // Create the main container
    this.container = document.createElement("div");
    this.container.className = "floating-surprise-tab";
    this.container.setAttribute("role", "complementary");
    this.container.setAttribute("aria-label", "Surprise Me feature");

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-surprise-tab-content">
        <div class="floating-surprise-tab-icon">
          🎉
        </div>
        <div class="floating-surprise-tab-text">
          <span class="surprise-tab-title">Surprise Me!</span>
          <span class="surprise-tab-subtitle">Discover a random scenario</span>
        </div>
        <div class="floating-surprise-tab-arrow">
          <svg class="surprise-arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-surprise-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement("a");
    this.link.href = "#";
    this.link.className = "floating-surprise-tab-link";
    this.link.setAttribute(
      "aria-label",
      "Surprise Me - Launch random scenario",
    );
    this.link.setAttribute("data-action", "surprise");
    this.link.id = "surprise-me-floating";

    // Wrap the container in the link
    this.link.appendChild(this.container);
  }

  attachToDOM() {
    // Add to the end of the body
    document.body.appendChild(this.link);
  }

  bindEvents() {
    // Handle resize events
    window.addEventListener("resize", this.handleResize.bind(this));

    // Handle hover/click events
    if (this.isMobile) {
      this.link.addEventListener(
        "touchstart",
        this.handleTouchStart.bind(this),
      );
      this.link.addEventListener("touchend", this.handleTouchEnd.bind(this));
      this.link.addEventListener("click", this.handleMobileClick.bind(this));
    } else {
      this.link.addEventListener(
        "mouseenter",
        this.handleMouseEnter.bind(this),
      );
      this.link.addEventListener(
        "mouseleave",
        this.handleMouseLeave.bind(this),
      );
      this.link.addEventListener("click", this.handleDesktopClick.bind(this));
    }

    // Handle keyboard navigation
    this.link.addEventListener("keydown", this.handleKeyDown.bind(this));
    this.link.addEventListener("focus", this.handleFocus.bind(this));
    this.link.addEventListener("blur", this.handleBlur.bind(this));
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= SURPRISE_MOBILE_BREAKPOINT;

    if (wasMobile !== this.isMobile) {
      this.unbindEvents();
      this.bindEvents();
    }
  }

  handleMouseEnter() {
    if (!this.isMobile) {
      // Add a small delay to make hover more intentional
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.hoverTimeout = setTimeout(() => {
        this.expand();
      }, 100); // 100ms delay
    }
  }

  handleMouseLeave() {
    if (!this.isMobile) {
      // Clear hover timeout if user leaves before delay
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.collapse();
    }
  }

  handleTouchStart(e) {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
      this.createRipple(e.touches[0]);
    }
  }

  handleTouchEnd(_e) {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
    }
  }

  handleMobileClick(e) {
    if (this.isMobile) {
      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      if (!this.isExpanded) {
        e.preventDefault();
        this.expand();
        this.scheduleAutoCollapse();
      } else {
        // When expanded, trigger surprise me functionality
        e.preventDefault();
        this.triggerSurpriseMe();
      }
    }
  }

  handleDesktopClick(e) {
    if (!this.isMobile) {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerSurpriseMe();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerSurpriseMe();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleFocus() {
    if (!this.isMobile) {
      this.expand();
    }
  }

  handleBlur() {
    if (!this.isMobile) {
      this.collapse();
    }
  }

  expand() {
    this.isExpanded = true;
    this.container.classList.add("expanded");
    this.clearCollapseTimeout();
  }

  collapse() {
    this.isExpanded = false;
    this.container.classList.remove("expanded");
    this.clearCollapseTimeout();
  }

  scheduleAutoCollapse() {
    this.clearCollapseTimeout();
    this.collapseTimeout = setTimeout(() => {
      this.collapse();
    }, SURPRISE_MOBILE_AUTO_COLLAPSE_DELAY);
  }

  clearCollapseTimeout() {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
      this.collapseTimeout = null;
    }
  }

  createRipple(_event) {
    // Reset ripple
    this.container.classList.remove("ripple-active");

    // Trigger ripple effect
    setTimeout(() => {
      this.container.classList.add("ripple-active");
    }, SURPRISE_RIPPLE_DELAY);

    // Remove ripple effect
    setTimeout(() => {
      this.container.classList.remove("ripple-active");
    }, SURPRISE_RIPPLE_DURATION);
  }

  triggerSurpriseMe() {
    console.log("FloatingSurpriseTab: triggerSurpriseMe called");

    // Track surprise trigger attempt
    this.trackSurpriseInteraction("surprise_triggered", {
      timestamp: Date.now(),
      source: "floating_tab",
    });

    // Try multiple approaches to trigger surprise me functionality
    let success = false;
    let successMethod = null;

    // Approach 1: Use main grid's launch random scenario method
    if (
      window.mainGrid &&
      typeof window.mainGrid.launchRandomScenario === "function"
    ) {
      console.log("FloatingSurpriseTab: Using mainGrid.launchRandomScenario");
      try {
        window.mainGrid.launchRandomScenario();
        success = true;
        successMethod = "mainGrid.launchRandomScenario";
      } catch (error) {
        console.error(
          "FloatingSurpriseTab: Error with mainGrid.launchRandomScenario:",
          error,
        );
        this.trackSurpriseInteraction("surprise_error", {
          method: "mainGrid.launchRandomScenario",
          error: error.message,
        });
      }
    }

    // Approach 2: Use app's launch random scenario method
    if (
      !success &&
      window.app &&
      typeof window.app.launchRandomScenario === "function"
    ) {
      console.log("FloatingSurpriseTab: Using app.launchRandomScenario");
      try {
        window.app.launchRandomScenario();
        success = true;
        successMethod = "app.launchRandomScenario";
      } catch (error) {
        console.error(
          "FloatingSurpriseTab: Error with app.launchRandomScenario:",
          error,
        );
        this.trackSurpriseInteraction("surprise_error", {
          method: "app.launchRandomScenario",
          error: error.message,
        });
      }
    }

    // Approach 3: Use global triggerSurpriseMe function
    if (
      !success &&
      typeof window.triggerSurpriseMe === "function" &&
      window.triggerSurpriseMe !== this.triggerSurpriseMe
    ) {
      console.log("FloatingSurpriseTab: Using global triggerSurpriseMe");
      try {
        window.triggerSurpriseMe();
        success = true;
        successMethod = "global.triggerSurpriseMe";
      } catch (error) {
        console.error(
          "FloatingSurpriseTab: Error with global triggerSurpriseMe:",
          error,
        );
        this.trackSurpriseInteraction("surprise_error", {
          method: "global.triggerSurpriseMe",
          error: error.message,
        });
      }
    }

    // Approach 4: Fallback to clicking the original surprise me button
    if (!success) {
      console.log("FloatingSurpriseTab: Fallback to clicking original button");
      const originalButton = document.getElementById("surprise-me-nav");
      if (originalButton) {
        try {
          originalButton.click();
          success = true;
          successMethod = "button.click";
        } catch (error) {
          console.error(
            "FloatingSurpriseTab: Error clicking original button:",
            error,
          );
          this.trackSurpriseInteraction("surprise_error", {
            method: "button.click",
            error: error.message,
          });
        }
      }
    }

    // Approach 5: Try to trigger via custom event
    if (!success) {
      console.log("FloatingSurpriseTab: Dispatching custom event");
      try {
        const event = new CustomEvent("surpriseMeRequested", {
          detail: { source: "floating-tab" },
        });
        document.dispatchEvent(event);
        success = true;
        successMethod = "custom.event";
      } catch (error) {
        console.error(
          "FloatingSurpriseTab: Error dispatching custom event:",
          error,
        );
        this.trackSurpriseInteraction("surprise_error", {
          method: "custom.event",
          error: error.message,
        });
      }
    }

    if (success) {
      // Track successful surprise trigger
      this.trackSurpriseInteraction("surprise_success", {
        method: successMethod,
        timestamp: Date.now(),
      });

      // Add visual feedback
      this.addSuccessFeedback();
    } else {
      console.warn(
        "FloatingSurpriseTab: All approaches failed to trigger surprise me",
      );

      // Track complete failure
      this.trackSurpriseInteraction("surprise_complete_failure", {
        timestamp: Date.now(),
        attempts: 5,
      });

      this.addErrorFeedback();
    }
  }

  addSuccessFeedback() {
    const title = this.container.querySelector(".surprise-tab-title");
    const subtitle = this.container.querySelector(".surprise-tab-subtitle");

    if (title && subtitle) {
      const originalTitle = title.textContent;
      const originalSubtitle = subtitle.textContent;

      title.textContent = "Loading...";
      subtitle.textContent = "Finding perfect scenario";

      // Reset after a short delay
      setTimeout(() => {
        title.textContent = originalTitle;
        subtitle.textContent = originalSubtitle;
      }, SURPRISE_FEEDBACK_DURATION);
    }
  }

  addErrorFeedback() {
    const title = this.container.querySelector(".surprise-tab-title");
    const subtitle = this.container.querySelector(".surprise-tab-subtitle");

    if (title && subtitle) {
      const originalTitle = title.textContent;
      const originalSubtitle = subtitle.textContent;

      title.textContent = "Oops!";
      subtitle.textContent = "Try again in a moment";

      // Reset after a short delay
      setTimeout(() => {
        title.textContent = originalTitle;
        subtitle.textContent = originalSubtitle;
      }, SURPRISE_FEEDBACK_DURATION);
    }
  }

  // === Analytics & Data Methods ===

  async generateSurpriseReport() {
    try {
      const metrics =
        await this.dataHandler.getAnalyticsData("surprise_metrics");
      const totalTriggers = metrics?.trigger_count || 0;
      const successfulTriggers = metrics?.success_count || 0;
      const failureRate =
        totalTriggers > 0
          ? (
              ((totalTriggers - successfulTriggers) / totalTriggers) *
              100
            ).toFixed(1)
          : 0;

      return {
        totalSurpriseTriggers: totalTriggers,
        successfulSurprises: successfulTriggers,
        failureRate: `${failureRate}%`,
        mostUsedMethod: metrics?.most_used_method || "unknown",
        lastUsed: metrics?.last_used
          ? new Date(metrics.last_used).toLocaleDateString()
          : "never",
        avgUsagePerDay: metrics?.daily_average || 0,
      };
    } catch (error) {
      console.error(
        "FloatingSurpriseTab: Error generating surprise report:",
        error,
      );
      return null;
    }
  }

  async exportSurpriseData() {
    try {
      const report = await this.generateSurpriseReport();
      const allMetrics =
        await this.dataHandler.getAnalyticsData("surprise_metrics");

      const exportData = {
        summary: report,
        detailed_metrics: allMetrics,
        export_timestamp: new Date().toISOString(),
        component: "FloatingSurpriseTab",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `surprise-tab-analytics-${Date.now()}.json`;
      link.click();

      console.log("FloatingSurpriseTab: Analytics data exported successfully");
      return true;
    } catch (error) {
      console.error(
        "FloatingSurpriseTab: Error exporting analytics data:",
        error,
      );
      return false;
    }
  }

  async resetSurpriseMetrics() {
    try {
      await this.dataHandler.clearAnalyticsData("surprise_metrics");
      console.log("FloatingSurpriseTab: Surprise metrics reset successfully");
      return true;
    } catch (error) {
      console.error(
        "FloatingSurpriseTab: Error resetting surprise metrics:",
        error,
      );
      return false;
    }
  }

  unbindEvents() {
    // Remove all event listeners
    this.link.removeEventListener("mouseenter", this.handleMouseEnter);
    this.link.removeEventListener("mouseleave", this.handleMouseLeave);
    this.link.removeEventListener("click", this.handleDesktopClick);
    this.link.removeEventListener("click", this.handleMobileClick);
    this.link.removeEventListener("touchstart", this.handleTouchStart);
    this.link.removeEventListener("touchend", this.handleTouchEnd);
    this.link.removeEventListener("keydown", this.handleKeyDown);
    this.link.removeEventListener("focus", this.handleFocus);
    this.link.removeEventListener("blur", this.handleBlur);
  }

  destroy() {
    this.unbindEvents();
    this.clearCollapseTimeout();

    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }

    this.isInitialized = false;
  }
}

// Initialize the floating surprise tab when the DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  // Initialize the floating surprise tab
  window.floatingSurpriseTab = new FloatingSurpriseTab();
});

// Export global function for easy access
window.triggerSurpriseMe = function () {
  if (typeof window.app !== "undefined" && window.app.launchRandomScenario) {
    window.app.launchRandomScenario();
  }
};

// Export for potential manual initialization
if (typeof window !== "undefined") {
  window.FloatingSurpriseTab = FloatingSurpriseTab;
}
