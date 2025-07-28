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
 * Floating Tour Tab Component
 * Professional floating "Take Tour" button that slides out on hover/click
 * Positioned above the surprise tab
 */

// Import DataHandler for enhanced data management and future onboarding features
import DataHandler from "../core/data-handler.js";

// Constants
const TOUR_MOBILE_BREAKPOINT = 768;
const TOUR_MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const TOUR_RIPPLE_DURATION = 600;
const TOUR_DEBOUNCE_DELAY = 300;
const TOUR_RIPPLE_DELAY = 50;
const TOUR_FEEDBACK_DURATION = 2000;

class FloatingTourTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= TOUR_MOBILE_BREAKPOINT;
    this.isInitialized = false;
    this.collapseTimeout = null;
    this.lastClickTime = 0;

    // DOM caching system
    this.cachedElements = new Map();
    this.cachedMeasurements = new Map();
    this.measurementInvalidated = true;

    // Bound method references for event listeners
    this.boundMethods = {
      handleResize: this.handleResize.bind(this),
      handleMouseEnter: this.handleMouseEnter.bind(this),
      handleMouseLeave: this.handleMouseLeave.bind(this),
      handleDesktopClick: this.handleDesktopClick.bind(this),
      handleTouchStart: this.handleTouchStart.bind(this),
      handleTouchEnd: this.handleTouchEnd.bind(this),
      handleMobileClick: this.handleMobileClick.bind(this),
      handleKeyDown: this.handleKeyDown.bind(this),
      handleFocus: this.handleFocus.bind(this),
      handleBlur: this.handleBlur.bind(this),
    };

    // Current event mode for smart listener management
    this.currentEventMode = null;

    // Initialize DataHandler for analytics and future onboarding features
    this.dataHandler = null;
    this.tourMetrics = {
      sessionStart: Date.now(),
      totalInteractions: 0,
      tourTriggers: 0,
      lastInteractionType: null,
      onboardingProgress: {},
      interactions: [], // Initialize interactions array
    };

    this.initializeDataHandler();
    this.init();
    this.bindEvents();
    this.listenToSettings();
  }

  async initializeDataHandler() {
    try {
      // Access firebaseService from global app instance
      const firebaseService =
        window.app && window.app.firebaseService
          ? window.app.firebaseService
          : null;

      if (!window.app) {
        console.warn(
          "FloatingTourTab: window.app not available, using localStorage only",
        );
      }

      this.dataHandler = new DataHandler({
        appName: "SimulateAI",
        version: "1.40",
        enableFirebase: !!firebaseService,
        enableCaching: true,
        enableOfflineQueue: true,
        firebaseService: firebaseService,
      });

      await this.dataHandler.initialize(firebaseService);
      await this.loadTourMetrics();
      console.log("FloatingTourTab: DataHandler initialized successfully");
    } catch (error) {
      console.warn(
        "FloatingTourTab: DataHandler initialization failed, using fallback mode:",
        error,
      );
      // Continue without DataHandler - use localStorage fallback
      this.dataHandler = null;
      this.loadTourMetricsFromLocalStorage();
    }
  }

  async loadTourMetrics() {
    if (!this.dataHandler) {
      this.loadTourMetricsFromLocalStorage();
      return;
    }

    try {
      const savedMetrics =
        await this.dataHandler.getAnalyticsData("tour_metrics");
      if (savedMetrics) {
        this.tourMetrics = {
          ...this.tourMetrics,
          ...savedMetrics,
          // Only reset session start if not already set
          sessionStart: this.tourMetrics.sessionStart || Date.now(),
        };
      }
    } catch (error) {
      console.warn(
        "FloatingTourTab: Error loading tour metrics from DataHandler, using localStorage:",
        error,
      );
      this.loadTourMetricsFromLocalStorage();
    }
  }

  loadTourMetricsFromLocalStorage() {
    try {
      const saved = localStorage.getItem("floatingTourTab_metrics");
      if (saved) {
        const savedMetrics = JSON.parse(saved);
        this.tourMetrics = {
          ...this.tourMetrics,
          ...savedMetrics,
          // Only reset session start if not already set
          sessionStart: this.tourMetrics.sessionStart || Date.now(),
        };
      }
    } catch (error) {
      console.warn("FloatingTourTab: Error loading from localStorage:", error);
    }
  }

  async saveTourMetrics() {
    const metricsToSave = {
      ...this.tourMetrics,
      lastUpdated: Date.now(),
    };

    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveAnalyticsData("tour_metrics", metricsToSave);
        return;
      } catch (error) {
        console.warn(
          "FloatingTourTab: Error saving to DataHandler, using localStorage fallback:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        "floatingTourTab_metrics",
        JSON.stringify(metricsToSave),
      );
    } catch (error) {
      console.error("FloatingTourTab: Error saving to localStorage:", error);
    }
  }

  trackTourInteraction(interactionType, data = {}) {
    this.tourMetrics.totalInteractions++;
    this.tourMetrics.lastInteractionType = interactionType;

    const interactionData = {
      type: interactionType,
      timestamp: Date.now(),
      ...this.getDeviceInfo(),
      ...data,
    };

    // Initialize interactions array if not present
    if (!this.tourMetrics.interactions) {
      this.tourMetrics.interactions = [];
    }

    // Add new interaction
    this.tourMetrics.interactions.push(interactionData);

    // Maintain circular buffer - remove oldest when exceeding limit
    if (this.tourMetrics.interactions.length > 50) {
      this.tourMetrics.interactions.shift(); // Remove oldest item
    }

    this.saveTourMetrics();
    console.log(`FloatingTourTab: Tracked ${interactionType}`, interactionData);
  }

  // === Helper Methods ===

  /**
   * Get cached DOM element or query and cache it
   */
  getCachedElement(selector, parent = document) {
    if (!this.cachedElements.has(selector)) {
      const element = parent.querySelector(selector);
      this.cachedElements.set(selector, element);
    }
    return this.cachedElements.get(selector);
  }

  /**
   * Get cached measurements or calculate and cache them
   */
  getCachedMeasurement(element, measurementType = "rect") {
    const key = `${element.className}-${measurementType}`;

    if (this.measurementInvalidated || !this.cachedMeasurements.has(key)) {
      let measurement;
      switch (measurementType) {
        case "rect":
          measurement = element.getBoundingClientRect();
          break;
        case "offset":
          measurement = {
            width: element.offsetWidth,
            height: element.offsetHeight,
          };
          break;
        default:
          measurement = element.getBoundingClientRect();
      }
      this.cachedMeasurements.set(key, measurement);
      this.measurementInvalidated = false;
    }

    return this.cachedMeasurements.get(key);
  }

  /**
   * Invalidate cached measurements (call on resize)
   */
  invalidateMeasurements() {
    this.cachedMeasurements.clear();
    this.measurementInvalidated = true;
  }

  /**
   * Debounce helper method
   */
  checkDebounce() {
    const now = Date.now();
    if (now - this.lastClickTime < TOUR_DEBOUNCE_DELAY) {
      return false;
    }
    this.lastClickTime = now;
    return true;
  }

  /**
   * Get device information for tracking
   */
  getDeviceInfo() {
    return {
      type: this.isMobile ? "mobile" : "desktop",
      breakpoint: window.innerWidth,
      timestamp: Date.now(),
    };
  }

  /**
   * Get current event mode for smart listener management
   */
  getEventMode() {
    return this.isMobile ? "mobile" : "desktop";
  }

  /**
   * Batch DOM style updates using requestAnimationFrame
   */
  batchStyleUpdate(element, styles) {
    return new Promise((resolve) => {
      requestAnimationFrame(() => {
        Object.assign(element.style, styles);
        resolve();
      });
    });
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
      this.updateVisibility(settings.tourTabEnabled);
    });

    // Listen for settings manager ready
    window.addEventListener("settingsManagerReady", (e) => {
      const { settings } = e.detail;
      this.updateVisibility(settings.tourTabEnabled);
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled = window.settingsManager.getSetting("tourTabEnabled");
        this.updateVisibility(enabled);
      } else {
        // Default to enabled if settings manager not available
        this.updateVisibility(true);
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
    this.container.className = "floating-tour-tab";
    this.container.setAttribute("role", "complementary");
    this.container.setAttribute("aria-label", "Take Tour feature");

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-tour-tab-content">
        <div class="floating-tour-tab-icon">
          📚
        </div>
        <div class="floating-tour-tab-text">
          <span class="tour-tab-title">Take Tour</span>
          <span class="tour-tab-subtitle">Learn how to use SimulateAI</span>
        </div>
        <div class="floating-tour-tab-arrow">
          <svg class="tour-arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-tour-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement("a");
    this.link.href = "#";
    this.link.className = "floating-tour-tab-link";
    this.link.setAttribute(
      "aria-label",
      "Take Tour - Start interactive onboarding",
    );
    this.link.setAttribute("data-action", "tour");
    this.link.id = "take-tour-floating";

    // Wrap the container in the link
    this.link.appendChild(this.container);
  }

  attachToDOM() {
    // Add to the end of the body
    document.body.appendChild(this.link);
  }

  bindEvents() {
    // Handle resize events
    window.addEventListener("resize", this.boundMethods.handleResize);

    // Update event listeners based on device type
    this.updateEventListeners(true);

    // Always bind keyboard navigation
    this.link.addEventListener("keydown", this.boundMethods.handleKeyDown);
    this.link.addEventListener("focus", this.boundMethods.handleFocus);
    this.link.addEventListener("blur", this.boundMethods.handleBlur);
  }

  updateEventListeners(force = false) {
    const newEventMode = this.getEventMode();

    // Only update if mode changed or forced
    if (this.currentEventMode === newEventMode && !force) {
      return;
    }

    // Remove old listeners if they exist
    if (this.currentEventMode !== null) {
      this.removeEventListeners();
    }

    // Add new listeners based on device type
    if (newEventMode === "mobile") {
      this.link.addEventListener(
        "touchstart",
        this.boundMethods.handleTouchStart,
      );
      this.link.addEventListener("touchend", this.boundMethods.handleTouchEnd);
      this.link.addEventListener("click", this.boundMethods.handleMobileClick);
    } else {
      this.link.addEventListener(
        "mouseenter",
        this.boundMethods.handleMouseEnter,
      );
      this.link.addEventListener(
        "mouseleave",
        this.boundMethods.handleMouseLeave,
      );
      this.link.addEventListener("click", this.boundMethods.handleDesktopClick);
    }

    this.currentEventMode = newEventMode;
  }

  removeEventListeners() {
    // Remove mobile listeners
    this.link.removeEventListener(
      "touchstart",
      this.boundMethods.handleTouchStart,
    );
    this.link.removeEventListener("touchend", this.boundMethods.handleTouchEnd);
    this.link.removeEventListener("click", this.boundMethods.handleMobileClick);

    // Remove desktop listeners
    this.link.removeEventListener(
      "mouseenter",
      this.boundMethods.handleMouseEnter,
    );
    this.link.removeEventListener(
      "mouseleave",
      this.boundMethods.handleMouseLeave,
    );
    this.link.removeEventListener(
      "click",
      this.boundMethods.handleDesktopClick,
    );
  }

  unbindEvents() {
    // Cleanup method to remove event listeners if needed
    window.removeEventListener("resize", this.boundMethods.handleResize);

    // Remove device-specific listeners
    this.removeEventListeners();

    // Remove always-bound listeners
    this.link.removeEventListener("keydown", this.boundMethods.handleKeyDown);
    this.link.removeEventListener("focus", this.boundMethods.handleFocus);
    this.link.removeEventListener("blur", this.boundMethods.handleBlur);
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= TOUR_MOBILE_BREAKPOINT;

    // Invalidate cached measurements
    this.invalidateMeasurements();

    // Only update event listeners if mobile state actually changed
    if (wasMobile !== this.isMobile) {
      this.updateEventListeners(true);

      // Track device change
      this.trackTourInteraction("device_change", {
        from: wasMobile ? "mobile" : "desktop",
        to: this.isMobile ? "mobile" : "desktop",
        width: window.innerWidth,
      });
    }
  }

  handleMouseEnter() {
    if (!this.isMobile) {
      // Track hover interaction
      this.trackTourInteraction("hover_enter");

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
      // Track hover leave
      this.trackTourInteraction("hover_leave");

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

  handleTouchEnd() {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
      // No specific action needed for touch end
    }
  }

  handleMobileClick(e) {
    if (this.isMobile) {
      // Check for debouncing using helper method
      if (!this.checkDebounce()) {
        return;
      }

      if (!this.isExpanded) {
        e.preventDefault();
        this.trackTourInteraction("mobile_expand_click");
        this.expand();
        this.scheduleAutoCollapse();
      } else {
        // When expanded, trigger tour functionality
        e.preventDefault();
        this.trackTourInteraction("mobile_tour_trigger");
        this.triggerTour();
      }
    }
  }

  handleDesktopClick(e) {
    if (!this.isMobile) {
      e.preventDefault();

      // Check for debouncing using helper method
      if (!this.checkDebounce()) {
        return;
      }

      this.trackTourInteraction("desktop_tour_trigger");
      this.createRipple(e);
      this.triggerTour();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleKeyDown(e) {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();

      // Check for debouncing using helper method
      if (!this.checkDebounce()) {
        return;
      }

      this.trackTourInteraction("keyboard_tour_trigger", {
        key: e.key,
      });
      this.createRipple(e);
      this.triggerTour();
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
    if (this.isExpanded) return; // Prevent unnecessary state changes

    this.isExpanded = true;
    this.container.classList.add("expanded");
    this.trackTourInteraction("tab_expanded", this.getDeviceInfo());
    this.clearCollapseTimeout();
  }

  collapse() {
    if (!this.isExpanded) return; // Prevent unnecessary state changes

    this.isExpanded = false;
    this.container.classList.remove("expanded");
    this.trackTourInteraction("tab_collapsed");
    this.clearCollapseTimeout();
  }

  scheduleAutoCollapse() {
    this.clearCollapseTimeout();
    this.collapseTimeout = setTimeout(() => {
      this.collapse();
    }, TOUR_MOBILE_AUTO_COLLAPSE_DELAY);
  }

  clearCollapseTimeout() {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
      this.collapseTimeout = null;
    }
  }

  createRipple(event) {
    const ripple = this.getCachedElement(
      ".floating-tour-tab-ripple",
      this.container,
    );
    if (!ripple) return;

    // Get coordinates relative to the container
    let clientX, clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.clientX !== undefined) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      // Keyboard event - center the ripple
      const rect = this.getCachedMeasurement(this.container);
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    // Use cached measurement (only one getBoundingClientRect call)
    const rect = this.getCachedMeasurement(this.container);
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Batch style updates using requestAnimationFrame
    this.batchStyleUpdate(ripple, {
      left: `${x}px`,
      top: `${y}px`,
      animation: "none", // Reset animation first
    }).then(() => {
      // Start animation after reset
      setTimeout(() => {
        this.batchStyleUpdate(ripple, {
          animation: `tour-ripple ${TOUR_RIPPLE_DURATION}ms ease-out`,
        });
      }, TOUR_RIPPLE_DELAY);

      // Clean up after animation
      setTimeout(() => {
        this.batchStyleUpdate(ripple, {
          animation: "none",
        });
      }, TOUR_RIPPLE_DURATION + TOUR_RIPPLE_DELAY);
    });
  }

  triggerTour() {
    // Track tour trigger attempt
    this.tourMetrics.tourTriggers++;
    this.trackTourInteraction("tour_triggered", {
      timestamp: Date.now(),
      source: "floating_tab",
    });

    // Provide visual feedback
    this.showFeedback();

    let success = false;
    let method = null;

    // Try multiple methods to trigger the tour
    if (typeof window.app !== "undefined" && window.app.startOnboardingTour) {
      try {
        window.app.startOnboardingTour();
        success = true;
        method = "app.startOnboardingTour";
      } catch (error) {
        console.error(
          "FloatingTourTab: Error with app.startOnboardingTour:",
          error,
        );
        this.trackTourInteraction("tour_error", {
          method: "app.startOnboardingTour",
          error: error.message,
        });
      }
    } else if (
      typeof window.sharedNav !== "undefined" &&
      window.sharedNav.handleTourAction
    ) {
      try {
        window.sharedNav.handleTourAction();
        success = true;
        method = "sharedNav.handleTourAction";
      } catch (error) {
        console.error(
          "FloatingTourTab: Error with sharedNav.handleTourAction:",
          error,
        );
        this.trackTourInteraction("tour_error", {
          method: "sharedNav.handleTourAction",
          error: error.message,
        });
      }
    } else {
      // Fallback: Try to find and click the tour button in navigation
      const tourBtn = document.getElementById("start-tour-nav");
      if (tourBtn) {
        try {
          tourBtn.click();
          success = true;
          method = "button.click";
        } catch (error) {
          console.error("FloatingTourTab: Error clicking tour button:", error);
          this.trackTourInteraction("tour_error", {
            method: "button.click",
            error: error.message,
          });
        }
      } else {
        this.showUnavailableFeedback();
        this.trackTourInteraction("tour_unavailable", {
          reason: "no_tour_button_found",
        });
      }
    }

    if (success) {
      this.trackTourInteraction("tour_success", {
        method: method,
        timestamp: Date.now(),
      });
    } else {
      this.trackTourInteraction("tour_failure", {
        timestamp: Date.now(),
        attempts: 1,
      });
    }
  }

  showFeedback() {
    // Add temporary feedback class
    this.container.classList.add("tour-clicked");
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove("tour-clicked");
      }
    }, TOUR_FEEDBACK_DURATION);
  }

  showUnavailableFeedback() {
    // Show that tour is unavailable
    this.container.classList.add("tour-unavailable");
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove("tour-unavailable");
      }
    }, TOUR_FEEDBACK_DURATION);
  }

  // === Analytics & Future Onboarding Methods ===

  async generateTourReport() {
    try {
      let metrics;

      if (this.dataHandler) {
        metrics = await this.dataHandler.getAnalyticsData("tour_metrics");
      } else {
        // Fallback to localStorage
        const saved = localStorage.getItem("floatingTourTab_metrics");
        metrics = saved ? JSON.parse(saved) : null;
      }

      const totalInteractions = metrics?.totalInteractions || 0;
      const tourTriggers = metrics?.tourTriggers || 0;
      const interactions = metrics?.interactions || [];

      // Calculate engagement patterns
      const hoverCount = interactions.filter(
        (i) => i.type === "hover_enter",
      ).length;
      const clickCount = interactions.filter((i) =>
        i.type.includes("tour_trigger"),
      ).length;
      const expandCount = interactions.filter(
        (i) => i.type === "tab_expanded",
      ).length;

      return {
        totalTourInteractions: totalInteractions,
        tourTriggersAttempted: tourTriggers,
        hoverEngagements: hoverCount,
        clickEngagements: clickCount,
        tabExpansions: expandCount,
        deviceBreakdown: this.calculateDeviceBreakdown(interactions),
        engagementRate:
          totalInteractions > 0
            ? ((clickCount / totalInteractions) * 100).toFixed(1) + "%"
            : "0%",
        lastUsed: metrics?.lastUpdated
          ? new Date(metrics.lastUpdated).toLocaleDateString()
          : "never",
        onboardingReadiness: this.assessOnboardingReadiness(interactions),
        dataSource: this.dataHandler ? "DataHandler" : "localStorage",
      };
    } catch (error) {
      console.error("FloatingTourTab: Error generating tour report:", error);
      return null;
    }
  }

  calculateDeviceBreakdown(interactions) {
    const deviceCounts = interactions.reduce((acc, interaction) => {
      const device = interaction.device || "unknown";
      acc[device] = (acc[device] || 0) + 1;
      return acc;
    }, {});

    return deviceCounts;
  }

  assessOnboardingReadiness(interactions) {
    // Future: This method will help determine if user is ready for advanced onboarding
    const recentInteractions = interactions.filter(
      (i) => Date.now() - i.timestamp < 7 * 24 * 60 * 60 * 1000, // Last 7 days
    );

    const engagement = recentInteractions.length;
    const tourAttempts = recentInteractions.filter(
      (i) => i.type === "tour_triggered",
    ).length;

    return {
      recentEngagement: engagement,
      recentTourAttempts: tourAttempts,
      readinessScore: Math.min(100, engagement * 10 + tourAttempts * 25),
      recommendations: this.generateOnboardingRecommendations(
        engagement,
        tourAttempts,
      ),
    };
  }

  generateOnboardingRecommendations(engagement, tourAttempts) {
    const recommendations = [];

    if (tourAttempts === 0) {
      recommendations.push(
        "User has not tried the tour yet - consider promoting tour visibility",
      );
    } else if (tourAttempts > 3) {
      recommendations.push(
        "High tour engagement - user may benefit from advanced features tutorial",
      );
    }

    if (engagement < 3) {
      recommendations.push(
        "Low engagement - consider improving tour tab visibility or incentives",
      );
    } else if (engagement > 10) {
      recommendations.push(
        "High engagement - user is actively exploring, ready for guided learning paths",
      );
    }

    return recommendations;
  }

  async exportTourAnalytics() {
    try {
      const report = await this.generateTourReport();

      let fullMetrics;
      if (this.dataHandler) {
        fullMetrics = await this.dataHandler.getAnalyticsData("tour_metrics");
      } else {
        const saved = localStorage.getItem("floatingTourTab_metrics");
        fullMetrics = saved ? JSON.parse(saved) : null;
      }

      const exportData = {
        summary: report,
        detailed_metrics: fullMetrics,
        onboarding_insights: report?.onboardingReadiness || {},
        export_timestamp: new Date().toISOString(),
        component: "FloatingTourTab",
        data_source: this.dataHandler ? "DataHandler" : "localStorage",
      };

      const dataStr = JSON.stringify(exportData, null, 2);
      const dataBlob = new Blob([dataStr], { type: "application/json" });

      const link = document.createElement("a");
      link.href = URL.createObjectURL(dataBlob);
      link.download = `tour-tab-analytics-${Date.now()}.json`;
      link.click();

      console.log("FloatingTourTab: Analytics data exported successfully");
      return true;
    } catch (error) {
      console.error("FloatingTourTab: Error exporting analytics data:", error);
      return false;
    }
  }

  async resetTourMetrics() {
    try {
      // Clear DataHandler data if available
      if (this.dataHandler) {
        await this.dataHandler.clearAnalyticsData("tour_metrics");
      }

      // Clear localStorage fallback
      localStorage.removeItem("floatingTourTab_metrics");

      // Reset in-memory metrics
      this.tourMetrics = {
        sessionStart: Date.now(),
        totalInteractions: 0,
        tourTriggers: 0,
        lastInteractionType: null,
        onboardingProgress: {},
      };

      console.log("FloatingTourTab: Tour metrics reset successfully");
      return true;
    } catch (error) {
      console.error("FloatingTourTab: Error resetting tour metrics:", error);
      return false;
    }
  }

  // Future: Method to track onboarding progression
  async updateOnboardingProgress(step, completed = true) {
    try {
      this.tourMetrics.onboardingProgress[step] = {
        completed,
        timestamp: Date.now(),
        device: this.isMobile ? "mobile" : "desktop",
      };

      await this.saveTourMetrics();
      this.trackTourInteraction("onboarding_progress", {
        step,
        completed,
        totalStepsCompleted: Object.keys(
          this.tourMetrics.onboardingProgress,
        ).filter((key) => this.tourMetrics.onboardingProgress[key].completed)
          .length,
      });

      console.log(
        `FloatingTourTab: Onboarding step '${step}' marked as ${completed ? "completed" : "incomplete"}`,
      );
    } catch (error) {
      console.error(
        "FloatingTourTab: Error updating onboarding progress:",
        error,
      );
    }
  }

  getTourInteractionSummary() {
    return {
      sessionStart: this.tourMetrics.sessionStart,
      currentSessionDuration: Date.now() - this.tourMetrics.sessionStart,
      totalInteractions: this.tourMetrics.totalInteractions,
      tourTriggers: this.tourMetrics.tourTriggers,
      lastInteractionType: this.tourMetrics.lastInteractionType,
      deviceType: this.isMobile ? "mobile" : "desktop",
      onboardingStepsCompleted: Object.keys(
        this.tourMetrics.onboardingProgress || {},
      ).filter((key) => this.tourMetrics.onboardingProgress[key].completed)
        .length,
    };
  }

  destroy() {
    // Save final analytics data before cleanup
    if (this.dataHandler) {
      this.trackTourInteraction("component_destroyed", {
        sessionDuration: Date.now() - this.tourMetrics.sessionStart,
        totalSessionInteractions: this.tourMetrics.totalInteractions,
      });
      this.saveTourMetrics();
    }

    // Cleanup all timeouts
    this.clearCollapseTimeout();
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
      this.hoverTimeout = null;
    }

    // Remove all event listeners
    this.unbindEvents();

    // Clean up DOM
    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }

    // Clear caches
    this.cachedElements.clear();
    this.cachedMeasurements.clear();

    // Reset state
    this.isInitialized = false;
    this.currentEventMode = null;
  }
}

// Auto-initialize when DOM and app are ready
function initializeFloatingTourTab() {
  if (!window.floatingTourTab) {
    window.floatingTourTab = new FloatingTourTab();
  }
}

function checkAppReady() {
  // Check if app is available
  if (window.app) {
    initializeFloatingTourTab();
  } else {
    // Wait for app to be ready
    setTimeout(checkAppReady, 100);
  }
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", checkAppReady);
} else {
  // DOM is already ready
  checkAppReady();
}

// Export for ES6 module usage
export default FloatingTourTab;
