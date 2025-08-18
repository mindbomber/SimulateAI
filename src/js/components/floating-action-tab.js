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
 * Floating Action Tab Component
 * Professional floating donate button that slides out on hover/click
 * Enhanced with DataHandler integration for comprehensive analytics and cross-device sync
 */

// Import DataHandler for enhanced data management

// Constants
const MOBILE_BREAKPOINT = 768;
const MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const RIPPLE_DURATION = 600;
const SCREEN_READER_ANNOUNCEMENT_DURATION = 1000;

class FloatingActionTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    this.isInitialized = false;

    // DataHandler integration for enhanced analytics and persistence
    this.dataHandler = null;
    this.initializeDataHandler();

    // Analytics tracking
    this.interactionMetrics = {
      hovers: 0,
      expansions: 0,
      clicks: 0,
      completions: 0,
      lastInteraction: null,
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
      // Get DataHandler from multiple possible sources
      const app =
        window.simulateAIApp || window.app || window.simulateAI || null;
      this.dataHandler = app?.dataHandler || window.dataHandler || null;

      if (this.dataHandler) {
        await this.loadAnalyticsData();
        await this.loadUserPreferences();
        if (localStorage.getItem("verbose-css-logs") === "true") {
          console.log(
            "FloatingActionTab: DataHandler initialized successfully",
          );
        }
      } else {
        if (localStorage.getItem("verbose-css-logs") === "true") {
          console.warn(
            "[FloatingActionTab] DataHandler not available, using fallback mode",
          );
        }
        this.loadAnalyticsFromLocalStorage();
        this.loadPreferencesFromLocalStorage();
      }
    } catch (error) {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.warn(
          "[FloatingActionTab] DataHandler initialization failed, using fallback mode:",
          error,
        );
      }
      // Continue without DataHandler - use localStorage fallback
      this.dataHandler = null;
      this.loadAnalyticsFromLocalStorage();
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Load analytics data from DataHandler
   */
  async loadAnalyticsData() {
    if (!this.dataHandler) {
      this.loadAnalyticsFromLocalStorage();
      return;
    }

    try {
      const storedMetrics = await this.dataHandler.getData(
        "floatingActionTab_analytics",
      );
      if (storedMetrics) {
        this.interactionMetrics = {
          ...this.interactionMetrics,
          ...storedMetrics,
          sessionStart: Date.now(), // Reset session start
        };
      }
    } catch (error) {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.warn(
          "[FloatingActionTab] Failed to load analytics from DataHandler, using localStorage:",
          error,
        );
      }
      this.loadAnalyticsFromLocalStorage();
    }
  }

  /**
   * Load analytics data from localStorage fallback
   */
  loadAnalyticsFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingActionTab_analytics");
      if (saved) {
        const storedMetrics = JSON.parse(saved);
        this.interactionMetrics = {
          ...this.interactionMetrics,
          ...storedMetrics,
          sessionStart: Date.now(),
        };
      }
    } catch (error) {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.warn(
          "[FloatingActionTab] Error loading from localStorage:",
          error,
        );
      }
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
        "floatingActionTab_preferences",
      );
      if (preferences) {
        this.userPreferences = preferences;
      }
    } catch (error) {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.warn(
          "[FloatingActionTab] Failed to load user preferences from DataHandler, using localStorage:",
          error,
        );
      }
      this.loadPreferencesFromLocalStorage();
    }
  }

  /**
   * Load user preferences from localStorage fallback
   */
  loadPreferencesFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingActionTab_preferences");
      if (saved) {
        this.userPreferences = JSON.parse(saved);
      }
    } catch (error) {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.warn(
          "[FloatingActionTab] Error loading preferences from localStorage:",
          error,
        );
      }
    }
  }

  /**
   * Save analytics data to DataHandler
   */
  async saveAnalyticsData() {
    const analyticsToSave = {
      ...this.interactionMetrics,
      lastUpdated: Date.now(),
    };

    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "floatingActionTab_analytics",
          analyticsToSave,
        );
        return;
      } catch (error) {
        if (localStorage.getItem("verbose-css-logs") === "true") {
          console.warn(
            "[FloatingActionTab] Failed to save analytics to DataHandler, using localStorage fallback:",
            error,
          );
        }
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        "floatingActionTab_analytics",
        JSON.stringify(analyticsToSave),
      );
    } catch (error) {
      console.error(
        "[FloatingActionTab] Failed to save analytics to localStorage:",
        error,
      );
    }
  }

  /**
   * Track user interaction with enhanced analytics
   */
  trackInteraction(action, metadata = {}) {
    // Update metrics
    this.interactionMetrics[action] =
      (this.interactionMetrics[action] || 0) + 1;
    this.interactionMetrics.lastInteraction = {
      action,
      timestamp: Date.now(),
      metadata,
    };

    // Save analytics data (debounced)
    this.saveAnalyticsData();

    // Track with app analytics if available
    const app = window.simulateAIApp || window.app || window.simulateAI || null;
    if (app?.analyticsManager) {
      app.analyticsManager.trackEvent("floating_action_tab", {
        action,
        isMobile: this.isMobile,
        sessionDuration: Date.now() - this.interactionMetrics.sessionStart,
        ...metadata,
      });
    }
  }

  init() {
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log(
        "FloatingActionTab: init() called, isInitialized =",
        this.isInitialized,
      );
    }
    if (this.isInitialized) return;

    this.createElement();
    this.attachToDOM();
    this.applyInitialSettings();
    this.isInitialized = true;
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log("FloatingActionTab: Initialization complete");
    }
  }

  listenToSettings() {
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log("FloatingActionTab: Setting up settings listeners");
    }

    // Listen for settings changes
    window.addEventListener("settingsChanged", (e) => {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.log(
          "FloatingActionTab: settingsChanged event received",
          e.detail,
        );
      }
      const { settings } = e.detail;
      // Use the getSetting method to ensure we get the default if undefined
      const enabled =
        settings.donateTabEnabled !== undefined
          ? settings.donateTabEnabled
          : true; // Default to true if undefined
      this.updateVisibility(enabled);
    });

    // Listen for settings manager ready
    window.addEventListener("settingsManagerReady", (e) => {
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.log(
          "FloatingActionTab: settingsManagerReady event received",
          e.detail,
        );
      }
      const { settings } = e.detail;
      // Use the getSetting method to ensure we get the default if undefined
      const enabled =
        settings.donateTabEnabled !== undefined
          ? settings.donateTabEnabled
          : true; // Default to true if undefined
      this.updateVisibility(enabled);
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled = window.settingsManager.getSetting("donateTabEnabled");
        if (localStorage.getItem("verbose-css-logs") === "true") {
          console.log(
            "FloatingActionTab: Settings found, donateTabEnabled =",
            enabled,
          );
        }
        this.updateVisibility(enabled);
      } else {
        if (localStorage.getItem("verbose-css-logs") === "true") {
          console.log(
            "FloatingActionTab: Settings manager not ready, using default (true)",
          );
        }
        // Default to true (ON) when settings manager is not ready
        // This ensures fresh browser sessions show the tab initially
        this.updateVisibility(true);
      }
    };

    // Try immediately
    applySettings();

    // Also try after settings manager loads
    setTimeout(applySettings, 100);
    setTimeout(applySettings, 500);
    setTimeout(applySettings, 1000);
  }

  updateVisibility(enabled) {
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log(
        "FloatingActionTab: updateVisibility called with enabled =",
        enabled,
        "link exists =",
        !!this.link,
      );
    }
    if (this.link) {
      // Show tab when enabled (toggle right), hide when disabled (toggle left)
      this.link.style.display = enabled ? "block" : "none";
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.log(
          "FloatingActionTab: Set display to",
          enabled ? "block" : "none",
        );
      }
    }
  }

  createElement() {
    // Create the main container
    this.container = document.createElement("div");
    this.container.className = "floating-action-tab";
    this.container.setAttribute("role", "complementary");
    this.container.setAttribute("aria-label", "Donation support");

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-tab-content">
        <div class="floating-action-tab-icon"></div>
        <div class="floating-tab-text">
          <span class="tab-title">Support Our Mission</span>
          <span class="tab-subtitle">Help us continue developing ethical AI education</span>
        </div>
        <div class="floating-tab-arrow">
          <svg class="floating-action-tab-arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement("a");
    this.link.href = "donate.html";
    this.link.className = "floating-tab-link";
    this.link.setAttribute("aria-label", "Navigate to donation page");
    this.link.setAttribute("data-page", "donate");

    // Wrap the container in the link
    this.link.appendChild(this.container);
  }

  attachToDOM() {
    // Add to the end of the body
    document.body.appendChild(this.link);
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log("FloatingActionTab: Attached to DOM, element:", this.link);
    }
  }

  bindEvents() {
    // Handle resize events
    window.addEventListener("resize", this.handleResize.bind(this));

    // Handle hover/click events
    if (this.isMobile) {
      this.link.addEventListener(
        "touchstart",
        this.handleTouchStart.bind(this),
        { passive: true },
      );
      this.link.addEventListener("click", this.handleMobileClick.bind(this));
    } else {
      this.link.addEventListener("mouseenter", this.handleHover.bind(this));
      this.link.addEventListener("mouseleave", this.handleLeave.bind(this));
      this.link.addEventListener("focus", this.handleFocus.bind(this));
      this.link.addEventListener("blur", this.handleBlur.bind(this));
    }

    // Handle keyboard navigation
    this.link.addEventListener("keydown", this.handleKeydown.bind(this));

    // Handle visibility changes
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (wasMobile !== this.isMobile) {
      // Re-bind events if mobile state changed
      this.removeEvents();
      this.bindEvents();
    }
  }

  handleHover() {
    if (!this.isMobile) {
      // Track hover interaction
      this.trackInteraction("hovers", { device: "desktop" });

      // Add a small delay to make hover more intentional
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.hoverTimeout = setTimeout(() => {
        this.expand();
      }, 100); // 100ms delay
    }
  }

  handleLeave() {
    if (!this.isMobile) {
      // Clear hover timeout if user leaves before delay
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.collapse();
    }
  }

  handleFocus() {
    if (!this.isMobile) {
      this.trackInteraction("focus", { device: "desktop", method: "keyboard" });
      this.expand();
    }
  }

  handleBlur() {
    if (!this.isMobile) {
      this.collapse();
    }
  }

  handleTouchStart(e) {
    if (this.isMobile) {
      this.trackInteraction("touchStart", { device: "mobile" });
      // Allow default behavior to ensure click events work
      this.createRipple(e.touches[0]);
    }
  }

  handleMobileClick(e) {
    if (this.isMobile) {
      if (!this.isExpanded) {
        e.preventDefault();
        this.trackInteraction("expansions", { device: "mobile" });
        this.expand();

        // Auto-collapse after delay
        setTimeout(() => {
          this.collapse();
        }, MOBILE_AUTO_COLLAPSE_DELAY);
      } else {
        // When expanded, navigate to donation page
        this.trackInteraction("completions", {
          device: "mobile",
          destination: "donate.html",
        });
        window.location.href = this.link.href;
      }
    }
  }

  handleKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      if (this.isMobile) {
        e.preventDefault();
        this.trackInteraction("keyboardActivation", {
          device: "mobile",
          key: e.key,
        });
        this.toggle();
      } else {
        // Desktop keyboard navigation
        this.trackInteraction("completions", {
          device: "desktop",
          method: "keyboard",
          destination: "donate.html",
        });
      }
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.collapse();
    }
  }

  expand() {
    if (this.isExpanded) return;

    this.isExpanded = true;
    this.container.classList.add("expanded");

    // Track expansion
    this.trackInteraction("expansions", {
      device: this.isMobile ? "mobile" : "desktop",
    });

    // Add ripple effect
    this.addRipple();

    // Announce to screen readers
    this.announceToScreenReader("Donation tab expanded");
  }

  collapse() {
    if (!this.isExpanded) return;

    this.isExpanded = false;
    this.container.classList.remove("expanded");
  }

  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  /**
   * Get analytics data for reporting
   */
  getAnalytics() {
    return {
      ...this.interactionMetrics,
      conversionRate:
        this.interactionMetrics.hovers > 0
          ? this.interactionMetrics.completions / this.interactionMetrics.hovers
          : 0,
      expansionRate:
        this.interactionMetrics.hovers > 0
          ? this.interactionMetrics.expansions / this.interactionMetrics.hovers
          : 0,
      sessionDuration: Date.now() - this.interactionMetrics.sessionStart,
    };
  }

  /**
   * Export analytics data for external analysis
   */
  async exportAnalytics() {
    if (!this.dataHandler) return null;

    try {
      const allData = await this.dataHandler.exportAllUserData();
      return {
        floatingActionTab: allData.floatingActionTab_analytics || {},
        preferences: allData.floatingActionTab_preferences || {},
        analytics: this.getAnalytics(),
      };
    } catch (error) {
      console.warn("[FloatingActionTab] Failed to export analytics:", error);
      return null;
    }
  }

  addRipple() {
    const ripple = this.container.querySelector(".floating-tab-ripple");
    ripple.classList.add("active");

    setTimeout(() => {
      ripple.classList.remove("active");
    }, RIPPLE_DURATION);
  }

  announceToScreenReader(message) {
    // Create temporary element for screen reader announcement
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, SCREEN_READER_ANNOUNCEMENT_DURATION);
  }

  removeEvents() {
    // Remove all event listeners (for cleanup)
    window.removeEventListener("resize", this.handleResize.bind(this));
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  createRipple(touch) {
    if (!touch) return;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${touch.clientX - this.link.getBoundingClientRect().left}px`;
    ripple.style.top = `${touch.clientY - this.link.getBoundingClientRect().top}px`;

    this.link.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, RIPPLE_DURATION);
  }

  // === Analytics & Reporting Methods ===

  async generateDonationReport() {
    try {
      const analytics =
        await this.dataHandler.getAnalyticsData("donation_analytics");
      const interactions = analytics?.interactions || {};

      const totalInteractions = Object.values(interactions).reduce(
        (sum, count) => sum + count,
        0,
      );
      const expansions = interactions.expansions || 0;
      const clicks = interactions.clicks || 0;
      const hovers = interactions.hovers || 0;

      return {
        totalInteractions,
        expansions,
        clicks,
        hovers,
        engagementRate:
          totalInteractions > 0
            ? ((clicks / totalInteractions) * 100).toFixed(1) + "%"
            : "0%",
        mostFrequentDevice:
          analytics?.device_breakdown?.mobile >
          analytics?.device_breakdown?.desktop
            ? "mobile"
            : "desktop",
        sessionData: analytics?.session_metrics || {},
        lastActive: analytics?.last_interaction
          ? new Date(analytics.last_interaction).toLocaleDateString()
          : "never",
      };
    } catch (error) {
      console.error(
        "FloatingActionTab: Error generating donation report:",
        error,
      );
      return null;
    }
  }

  async exportDonationAnalytics() {
    try {
      const report = await this.generateDonationReport();
      const fullAnalytics =
        await this.dataHandler.getAnalyticsData("donation_analytics");

      const exportData = {
        summary: report,
        detailed_analytics: fullAnalytics,
        preferences: await this.dataHandler.getUserPreferences(),
        export_timestamp: new Date().toISOString(),
        component: "FloatingActionTab",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `donation-tab-analytics-${Date.now()}.json`;
      link.click();

      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.log("FloatingActionTab: Analytics data exported successfully");
      }
      return true;
    } catch (error) {
      console.error(
        "FloatingActionTab: Error exporting analytics data:",
        error,
      );
      return false;
    }
  }

  async resetDonationMetrics() {
    try {
      await this.dataHandler.clearAnalyticsData("donation_analytics");
      if (localStorage.getItem("verbose-css-logs") === "true") {
        console.log("FloatingActionTab: Donation metrics reset successfully");
      }
      return true;
    } catch (error) {
      console.error(
        "FloatingActionTab: Error resetting donation metrics:",
        error,
      );
      return false;
    }
  }

  getInteractionSummary() {
    return {
      sessionStart: this.interactionMetrics.sessionStart,
      currentSession: Date.now() - this.interactionMetrics.sessionStart,
      totalInteractions: this.interactionMetrics.totalInteractions,
      lastInteractionType: this.interactionMetrics.lastInteractionType,
      deviceType: this.isMobile ? "mobile" : "desktop",
    };
  }

  destroy() {
    // Save final analytics data
    if (this.dataHandler) {
      this.trackInteraction("destroy", {
        sessionDuration: Date.now() - this.interactionMetrics.sessionStart,
      });
      this.saveAnalyticsData();
    }

    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }
    this.removeEvents();
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready with timing coordination
function initializeFloatingActionTab() {
  if (localStorage.getItem("verbose-css-logs") === "true") {
    console.log("FloatingActionTab: initializeFloatingActionTab called");
  }
  if (!window.floatingActionTab) {
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log("FloatingActionTab: Creating new instance");
    }
    window.floatingActionTab = new FloatingActionTab();
  } else {
    if (localStorage.getItem("verbose-css-logs") === "true") {
      console.log("FloatingActionTab: Instance already exists");
    }
  }
}

// Initialize with proper timing to ensure settings manager is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    // Small delay to ensure shared navigation and settings manager are ready
    setTimeout(initializeFloatingActionTab, 150);
  });
} else {
  // DOM is already loaded, wait for other components
  setTimeout(initializeFloatingActionTab, 150);
}

export default FloatingActionTab;
