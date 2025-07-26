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
 * User Engagement Tracker Service
 * Comprehensive user behavior and settings panel interaction tracking
 * Provides detailed insights for app improvement and user experience optimization
 */

import AnalyticsManager from "../utils/analytics.js";
import logger from "../utils/logger.js";
import regionalAnalytics from "./regional-analytics.js";

// Constants for tracking
const TRACKING_CONSTANTS = {
  SETTINGS_PANEL: {
    INTERACTIONS: {
      OPEN: "settings_panel_open",
      CLOSE: "settings_panel_close",
      SETTING_CHANGE: "settings_panel_setting_change",
      TAB_SWITCH: "settings_panel_tab_switch",
      HOVER: "settings_panel_hover",
      SEARCH: "settings_panel_search",
      RESET: "settings_panel_reset",
      EXPORT: "settings_panel_export",
      IMPORT: "settings_panel_import",
    },
    TABS: {
      APPEARANCE: "appearance",
      ACCESSIBILITY: "accessibility",
      PRIVACY: "privacy",
      NOTIFICATIONS: "notifications",
      ADVANCED: "advanced",
    },
    ENGAGEMENT_THRESHOLDS: {
      QUICK_INTERACTION: 3000, // 3 seconds
      ENGAGED_INTERACTION: 30000, // 30 seconds
      DEEP_ENGAGEMENT: 120000, // 2 minutes
    },
  },

  ANALYSIS: {
    RECENT_ACTIONS_COUNT: 5,
    TEXT_TRUNCATE_LENGTH: 50,
    MAX_STORED_ENTRIES: 100,
    SCROLL_DEBOUNCE_DELAY: 150,
    POWER_USER_SETTINGS_THRESHOLD: 10,
    POWER_USER_FEATURES_THRESHOLD: 15,
    CUSTOMIZER_SETTINGS_THRESHOLD: 5,
    EXPLORER_FEATURES_THRESHOLD: 10,
    GOAL_ORIENTED_SESSIONS_THRESHOLD: 5,
    ID_GENERATION_BASE: 36,
    ID_GENERATION_LENGTH: 9,
    ID_GENERATION_SUBSTR_START: 2,
  },

  USER_BEHAVIOR: {
    EVENTS: {
      NAVIGATION: "user_navigation",
      FEATURE_DISCOVERY: "feature_discovery",
      WORKFLOW_COMPLETION: "workflow_completion",
      HELP_SEEKING: "help_seeking",
      CUSTOMIZATION: "customization",
      SHARING: "sharing",
      FEEDBACK: "feedback",
    },
    PATTERNS: {
      POWER_USER: "power_user",
      CASUAL_USER: "casual_user",
      EXPLORER: "explorer",
      GOAL_ORIENTED: "goal_oriented",
      CUSTOMIZER: "customizer",
    },
  },

  STORAGE_KEYS: {
    USER_PROFILE: "simulateai_user_profile",
    ENGAGEMENT_METRICS: "simulateai_engagement_metrics",
    BEHAVIOR_PATTERNS: "simulateai_behavior_patterns",
    SETTINGS_USAGE: "simulateai_settings_usage",
  },

  TIMING: {
    INTERACTION_TIMEOUT: 5000, // 5 seconds
    SESSION_SUMMARY_INTERVAL: 300000, // 5 minutes
    PATTERN_ANALYSIS_INTERVAL: 900000, // 15 minutes
    METADATA_FLUSH_INTERVAL: 30000, // 30 seconds
  },
};

export class UserEngagementTracker {
  constructor(app = null) {
    // Enhanced integration with DataHandler
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

    // Initialize with empty data - will be loaded async in init()
    this.userProfile = {};
    this.engagementMetrics = {};
    this.behaviorPatterns = {};
    this.settingsUsage = {};

    this.currentSession = {
      startTime: Date.now(),
      interactions: [],
      settingsInteractions: [],
      features: new Set(),
      workflows: new Set(),
      customizations: [],
    };

    this.settingsState = {
      isOpen: false,
      currentTab: null,
      openTime: null,
      interactionCount: 0,
      changesCount: 0,
      timeSpent: 0,
    };

    this.isInitialized = false; // Track initialization state

    // Event listener management
    this.eventListeners = new Map(); // Store listeners for cleanup
    this.isTrackingEnabled = true; // Allow disabling tracking

    // Note: init() is now async and should be called externally for enhanced instances
    if (!this.dataHandler) {
      // Legacy mode - sync initialization for backward compatibility
      this.userProfile = this.loadUserProfileSync();
      this.engagementMetrics = this.loadEngagementMetricsSync();
      this.behaviorPatterns = this.loadBehaviorPatternsSync();
      this.settingsUsage = this.loadSettingsUsageSync();
      this.init();
    }
  }

  /**
   * Async initialization for enhanced DataHandler integration
   */
  async initializeAsync() {
    if (this.isInitialized) {
      return;
    }

    // Load data from DataHandler/localStorage
    this.userProfile = await this.loadUserProfile();
    this.engagementMetrics = await this.loadEngagementMetrics();
    this.behaviorPatterns = await this.loadBehaviorPatterns();
    this.settingsUsage = await this.loadSettingsUsage();

    // Complete initialization
    await this.init();
  }

  /**
   * Sync fallback methods for backward compatibility
   */
  loadUserProfileSync() {
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.USER_PROFILE,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load user profile sync:", error);
      return {};
    }
  }

  loadEngagementMetricsSync() {
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.ENGAGEMENT_METRICS,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load engagement metrics sync:", error);
      return {};
    }
  }

  loadBehaviorPatternsSync() {
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.BEHAVIOR_PATTERNS,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load behavior patterns sync:", error);
      return {};
    }
  }

  loadSettingsUsageSync() {
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.SETTINGS_USAGE,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load settings usage sync:", error);
      return {};
    }
  }

  /**
   * Initialize the engagement tracker
   */
  init() {
    // Prevent multiple initializations
    if (this.isInitialized) {
      return;
    }

    this.setupEventListeners();
    this.startSessionTracking();
    this.schedulePeriodicTasks();

    // Initialize user profile if new user
    if (!this.userProfile.firstVisit) {
      this.initializeNewUser();
    }

    this.isInitialized = true;
    logger.info("UserEngagementTracker initialized");
  }

  /**
   * Initialize tracking for new users
   */
  initializeNewUser() {
    this.userProfile = {
      ...this.userProfile,
      firstVisit: Date.now(),
      userId: this.generateUserId(),
      userType: "new",
      onboardingCompleted: false,
      featureDiscoveryProgress: {},
    };

    this.saveUserProfileSync();
    this.trackUserEvent("new_user_initialized", {
      userId: this.userProfile.userId,
      timestamp: this.userProfile.firstVisit,
    });
  }

  /**
   * Safely check if an element has a specific selector
   * @param {Event} event - The event object
   * @param {string} selector - The CSS selector to check
   * @returns {Element|null} - The matching element or null
   */
  safeClosest(event, selector) {
    if (!event || !event.target || typeof event.target.closest !== "function") {
      return null;
    }
    try {
      return event.target.closest(selector);
    } catch (error) {
      logger.warn("Error in safeClosest:", error);
      return null;
    }
  }

  /**
   * Setup event listeners for comprehensive tracking
   */
  setupEventListeners() {
    // Prevent duplicate listeners
    if (this.eventListeners.size > 0) {
      logger.warn(
        "Event listeners already set up, skipping duplicate registration",
      );
      return;
    }

    // Settings panel specific tracking
    this.setupSettingsPanelTracking();

    // General user interaction tracking
    this.setupGeneralInteractionTracking();

    // Feature usage tracking
    this.setupFeatureUsageTracking();

    // Navigation tracking
    this.setupNavigationTracking();

    // Performance and error tracking
    this.setupPerformanceTracking();

    logger.debug("UserEngagementTracker: Event listeners setup complete", {
      totalListeners: this.eventListeners.size,
    });
  }

  /**
   * Add event listener with tracking for cleanup
   */
  addTrackedEventListener(target, event, handler, options = false) {
    if (!this.isTrackingEnabled) return;

    const key = `${target.constructor.name}_${event}_${Date.now()}`;
    const boundHandler = handler.bind(this);

    target.addEventListener(event, boundHandler, options);

    this.eventListeners.set(key, {
      target,
      event,
      handler: boundHandler,
      options,
    });

    return key;
  }

  /**
   * Setup settings panel specific tracking
   */
  setupSettingsPanelTracking() {
    // Consolidated settings panel click tracking
    this.addTrackedEventListener(document, "click", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".settings-button")) {
        this.trackSettingsPanelOpen(event);
      } else if (this.safeClosest(event, ".settings-close")) {
        this.trackSettingsPanelClose(event);
      } else if (this.safeClosest(event, ".settings-tab")) {
        this.trackSettingsTabSwitch(event);
      }
    });

    // Track settings changes
    this.addTrackedEventListener(document, "change", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".settings-panel")) {
        this.trackSettingsChange(event);
      }
    });

    // Track hover interactions
    this.addTrackedEventListener(
      document,
      "mouseenter",
      (event) => {
        if (!this.isTrackingEnabled) return;

        if (this.safeClosest(event, ".settings-panel")) {
          this.trackSettingsHover(event);
        }
      },
      true,
    );

    // Track search within settings
    this.addTrackedEventListener(document, "input", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".settings-search")) {
        this.trackSettingsSearch(event);
      }
    });
  }

  /**
   * Setup general interaction tracking
   */
  setupGeneralInteractionTracking() {
    // Consolidated general click tracking
    this.addTrackedEventListener(document, "click", (event) => {
      if (!this.isTrackingEnabled) return;
      this.trackUserInteraction("click", event);
    });

    // Track keyboard navigation
    this.addTrackedEventListener(document, "keydown", (event) => {
      if (!this.isTrackingEnabled) return;
      if (event.key === "Tab" || event.key === "Enter" || event.key === " ") {
        this.trackUserInteraction("keyboard", event);
      }
    });

    // Track form interactions
    this.addTrackedEventListener(document, "submit", (event) => {
      if (!this.isTrackingEnabled) return;
      this.trackUserInteraction("form_submit", event);
    });

    // Track scroll behavior with debouncing
    let scrollTimeout;
    this.addTrackedEventListener(window, "scroll", () => {
      if (!this.isTrackingEnabled) return;

      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackUserInteraction("scroll", {
          scrollY: window.scrollY,
          scrollHeight: document.documentElement.scrollHeight,
          viewportHeight: window.innerHeight,
        });
      }, TRACKING_CONSTANTS.ANALYSIS.SCROLL_DEBOUNCE_DELAY);
    });
  }

  /**
   * Setup feature usage tracking
   */
  setupFeatureUsageTracking() {
    // Consolidated feature click tracking
    this.addTrackedEventListener(document, "click", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".scenario-card")) {
        this.trackFeatureUsage("scenario_selection", event);
      } else if (this.safeClosest(event, ".simulation-start")) {
        this.trackFeatureUsage("simulation_start", event);
      } else if (this.safeClosest(event, ".decision-option")) {
        this.trackFeatureUsage("decision_making", event);
        this.trackScenarioDecisionWithRegionalContext(event);
      }
    });

    // Track search and filter usage
    this.addTrackedEventListener(document, "input", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".search-input")) {
        this.trackFeatureUsage("search", event);
      }
    });

    // Track filter usage
    this.addTrackedEventListener(document, "change", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".filter-control")) {
        this.trackFeatureUsage("filtering", event);
      }
    });
  }

  /**
   * Setup navigation tracking
   */
  setupNavigationTracking() {
    // Track page navigation
    let currentPage = window.location.pathname;
    const checkPageChange = () => {
      const newPage = window.location.pathname;
      if (newPage !== currentPage) {
        this.trackNavigation(currentPage, newPage);
        currentPage = newPage;
      }
    };

    // Check for page changes (for SPA navigation)
    this.addTrackedEventListener(window, "popstate", checkPageChange);

    // Track menu navigation
    this.addTrackedEventListener(document, "click", (event) => {
      if (!this.isTrackingEnabled) return;

      if (this.safeClosest(event, ".nav-link")) {
        this.trackNavigation(window.location.pathname, event.target.href);
      }
    });
  }

  /**
   * Setup performance tracking
   */
  setupPerformanceTracking() {
    // Track page load performance
    this.addTrackedEventListener(window, "load", () => {
      if (!this.isTrackingEnabled) return;
      this.trackPerformanceMetrics();
    });

    // Track user-perceived performance
    this.addTrackedEventListener(document, "click", (event) => {
      if (!this.isTrackingEnabled) return;

      const startTime = performance.now();
      requestAnimationFrame(() => {
        const endTime = performance.now();
        this.trackInteractionPerformance(event, endTime - startTime);
      });
    });
  }

  /**
   * Clean up all event listeners
   */
  removeAllEventListeners() {
    this.eventListeners.forEach((listenerInfo) => {
      const { target, event, handler, options } = listenerInfo;
      target.removeEventListener(event, handler, options);
    });

    this.eventListeners.clear();
    logger.debug("UserEngagementTracker: All event listeners removed");
  }

  /**
   * Enable/disable tracking
   */
  setTrackingEnabled(enabled) {
    this.isTrackingEnabled = enabled;
    logger.debug(
      `UserEngagementTracker: Tracking ${enabled ? "enabled" : "disabled"}`,
    );
  }

  /**
   * Destroy the tracker and clean up resources
   */
  destroy() {
    this.removeAllEventListeners();
    this.isInitialized = false;
    this.isTrackingEnabled = false;

    // Clear any running intervals
    if (this.patternAnalysisInterval) {
      clearInterval(this.patternAnalysisInterval);
    }
    if (this.insightsInterval) {
      clearInterval(this.insightsInterval);
    }
    if (this.metadataFlushInterval) {
      clearInterval(this.metadataFlushInterval);
    }

    logger.info("UserEngagementTracker destroyed");
  }

  /**
   * Track settings panel open
   */
  trackSettingsPanelOpen(event) {
    this.settingsState.isOpen = true;
    this.settingsState.openTime = Date.now();
    this.settingsState.interactionCount = 0;
    this.settingsState.changesCount = 0;

    const metadata = {
      trigger: this.getEventTrigger(event),
      userType: this.getUserType(),
      sessionDuration: Date.now() - this.currentSession.startTime,
      previousActions: this.getRecentActions(
        TRACKING_CONSTANTS.ANALYSIS.RECENT_ACTIONS_COUNT,
      ),
      context: this.getPageContext(),
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.SETTINGS_PANEL.INTERACTIONS.OPEN,
      metadata,
    );
    this.updateEngagementMetrics("settings_panel_opens");
  }

  /**
   * Track settings panel close
   */
  trackSettingsPanelClose(event) {
    if (!this.settingsState.isOpen) return;

    const timeSpent = Date.now() - this.settingsState.openTime;
    this.settingsState.timeSpent += timeSpent;
    this.settingsState.isOpen = false;

    const metadata = {
      timeSpent,
      interactionCount: this.settingsState.interactionCount,
      changesCount: this.settingsState.changesCount,
      engagementLevel: this.calculateEngagementLevel(timeSpent),
      trigger: this.getEventTrigger(event),
      userType: this.getUserType(),
      tabs_visited: this.settingsUsage.tabsVisited || [],
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.SETTINGS_PANEL.INTERACTIONS.CLOSE,
      metadata,
    );
    this.updateSettingsUsage("panel_sessions", metadata);
  }

  /**
   * Track settings changes
   */
  trackSettingsChange(event) {
    this.settingsState.changesCount++;
    this.settingsState.interactionCount++;

    const settingName = this.getSettingName(event.target);
    const oldValue = this.getPreviousValue(settingName);
    const newValue = this.getCurrentValue(event.target);

    const metadata = {
      settingName,
      oldValue,
      newValue,
      settingCategory: this.getSettingCategory(settingName),
      changeType: this.getChangeType(oldValue, newValue),
      userType: this.getUserType(),
      sessionChanges: this.settingsState.changesCount,
      timeInPanel: Date.now() - this.settingsState.openTime,
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.SETTINGS_PANEL.INTERACTIONS.SETTING_CHANGE,
      metadata,
    );
    this.updateSettingsUsage("setting_changes", metadata);
    this.analyzeCustomizationBehavior(metadata);
  }

  /**
   * Track settings tab switches
   */
  trackSettingsTabSwitch(event) {
    const newTab = this.getTabName(event.target);
    const oldTab = this.settingsState.currentTab;

    this.settingsState.currentTab = newTab;
    this.settingsState.interactionCount++;

    const metadata = {
      fromTab: oldTab,
      toTab: newTab,
      userType: this.getUserType(),
      timeInPreviousTab: oldTab
        ? Date.now() - this.settingsState.openTime
        : null,
      sequence: this.settingsUsage.tabSequence || [],
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.SETTINGS_PANEL.INTERACTIONS.TAB_SWITCH,
      metadata,
    );
    this.updateSettingsUsage("tab_switches", metadata);
    this.updateTabSequence(newTab);
  }

  /**
   * Track settings hover interactions
   */
  trackSettingsHover(event) {
    const element = event.target;
    const elementType = this.getElementType(element);

    const metadata = {
      elementType,
      elementId: element.id,
      elementClass: element.className,
      position: this.getElementPosition(element),
      userType: this.getUserType(),
      currentTab: this.settingsState.currentTab,
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.SETTINGS_PANEL.INTERACTIONS.HOVER,
      metadata,
    );
  }

  /**
   * Track settings search
   */
  trackSettingsSearch(event) {
    const searchTerm = event.target.value;
    const metadata = {
      searchTerm: searchTerm.substring(
        0,
        TRACKING_CONSTANTS.ANALYSIS.TEXT_TRUNCATE_LENGTH,
      ), // Limit for privacy
      searchLength: searchTerm.length,
      userType: this.getUserType(),
      currentTab: this.settingsState.currentTab,
      hasResults: this.countSearchResults(searchTerm),
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.SETTINGS_PANEL.INTERACTIONS.SEARCH,
      metadata,
    );
    this.updateSettingsUsage("searches", metadata);
  }

  /**
   * Track general user interactions
   */
  trackUserInteraction(type, eventOrData) {
    const metadata = {
      type,
      timestamp: Date.now(),
      userType: this.getUserType(),
      sessionDuration: Date.now() - this.currentSession.startTime,
      context: this.getPageContext(),
    };

    if (eventOrData instanceof Event) {
      metadata.element = {
        tagName: eventOrData.target.tagName,
        id: eventOrData.target.id,
        className: eventOrData.target.className,
        text: eventOrData.target.textContent?.substring(
          0,
          TRACKING_CONSTANTS.ANALYSIS.TEXT_TRUNCATE_LENGTH,
        ),
      };
      metadata.coordinates = {
        x: eventOrData.clientX,
        y: eventOrData.clientY,
      };
    } else {
      metadata.data = eventOrData;
    }

    this.trackUserEvent(
      TRACKING_CONSTANTS.USER_BEHAVIOR.EVENTS.NAVIGATION,
      metadata,
    );
    this.currentSession.interactions.push(metadata);
  }

  /**
   * Track feature usage
   */
  trackFeatureUsage(featureName, event) {
    this.currentSession.features.add(featureName);

    const metadata = {
      feature: featureName,
      userType: this.getUserType(),
      isFirstTimeUse:
        !this.engagementMetrics.featuresUsed?.includes(featureName),
      context: this.getPageContext(),
      element: event.target
        ? {
            tagName: event.target.tagName,
            id: event.target.id,
            className: event.target.className,
          }
        : null,
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.USER_BEHAVIOR.EVENTS.FEATURE_DISCOVERY,
      metadata,
    );
    this.updateEngagementMetrics("features_used", featureName);
  }

  /**
   * Track navigation
   */
  trackNavigation(fromPage, toPage) {
    const metadata = {
      fromPage,
      toPage,
      userType: this.getUserType(),
      navigationTime: Date.now(),
      sessionDuration: Date.now() - this.currentSession.startTime,
      referrer: document.referrer,
    };

    this.trackUserEvent(
      TRACKING_CONSTANTS.USER_BEHAVIOR.EVENTS.NAVIGATION,
      metadata,
    );
    this.updateEngagementMetrics("page_views");
  }

  /**
   * Track performance metrics
   */
  trackPerformanceMetrics() {
    const performanceData = {
      loadTime:
        performance.timing.loadEventEnd - performance.timing.navigationStart,
      domContentLoaded:
        performance.timing.domContentLoadedEventEnd -
        performance.timing.navigationStart,
      firstPaint:
        performance
          .getEntriesByType("paint")
          .find((entry) => entry.name === "first-paint")?.startTime || 0,
      userType: this.getUserType(),
      context: this.getPageContext(),
    };

    this.trackUserEvent("performance_metrics", performanceData);
  }

  /**
   * Track interaction performance
   */
  trackInteractionPerformance(event, duration) {
    if (duration > 100) {
      // Only track slow interactions
      const metadata = {
        element: {
          tagName: event.target.tagName,
          id: event.target.id,
          className: event.target.className,
        },
        duration,
        userType: this.getUserType(),
        context: this.getPageContext(),
      };

      this.trackUserEvent("interaction_performance", metadata);
    }
  }

  /**
   * Update engagement metrics
   */
  updateEngagementMetrics(metric, value = null) {
    if (!this.engagementMetrics[metric]) {
      this.engagementMetrics[metric] = value ? [value] : 0;
    } else if (Array.isArray(this.engagementMetrics[metric])) {
      if (value && !this.engagementMetrics[metric].includes(value)) {
        this.engagementMetrics[metric].push(value);
      }
    } else {
      this.engagementMetrics[metric]++;
    }

    this.engagementMetrics.lastUpdate = Date.now();
    this.saveEngagementMetricsSync();
  }

  /**
   * Update settings usage tracking
   */
  updateSettingsUsage(category, data) {
    if (!this.settingsUsage[category]) {
      this.settingsUsage[category] = [];
    }

    this.settingsUsage[category].push({
      ...data,
      timestamp: Date.now(),
    });

    // Keep only last 100 entries per category
    if (
      this.settingsUsage[category].length >
      TRACKING_CONSTANTS.ANALYSIS.MAX_STORED_ENTRIES
    ) {
      this.settingsUsage[category] = this.settingsUsage[category].slice(
        -TRACKING_CONSTANTS.ANALYSIS.MAX_STORED_ENTRIES,
      );
    }

    this.saveSettingsUsageSync();
  }

  /**
   * Analyze user behavior patterns
   */
  analyzeBehaviorPatterns() {
    const patterns = {
      userType: this.determineUserType(),
      engagementLevel: this.calculateOverallEngagement(),
      preferredFeatures: this.getPreferredFeatures(),
      customizationTendency: this.getCustomizationTendency(),
      helpSeekingBehavior: this.getHelpSeekingBehavior(),
      sessionPatterns: this.getSessionPatterns(),
    };

    this.behaviorPatterns = {
      ...this.behaviorPatterns,
      ...patterns,
      lastAnalysis: Date.now(),
    };

    this.saveBehaviorPatterns();
    this.trackUserEvent("behavior_analysis", patterns);
  }

  /**
   * Generate insights for app improvement
   */
  generateInsights() {
    const insights = {
      settingsUsage: this.analyzeSettingsUsage(),
      userJourney: this.analyzeUserJourney(),
      painPoints: this.identifyPainPoints(),
      featureAdoption: this.analyzeFeatureAdoption(),
      performanceIssues: this.identifyPerformanceIssues(),
      accessibilityUsage: this.analyzeAccessibilityUsage(),
    };

    this.trackUserEvent("insights_generated", insights);
    return insights;
  }

  // Helper methods

  /**
   * Calculate overall engagement level based on multiple metrics
   */
  calculateOverallEngagement() {
    const metrics = this.engagementMetrics;

    // Default to 'casual' if no metrics available
    if (!metrics || Object.keys(metrics).length === 0) {
      return "casual";
    }

    let score = 0;
    let factors = 0;

    // Session metrics (25% weight)
    if (metrics.session_count > 0) {
      factors++;
      if (metrics.session_count >= 10) score += 4;
      else if (metrics.session_count >= 5) score += 3;
      else if (metrics.session_count >= 2) score += 2;
      else score += 1;
    }

    // Feature usage (25% weight)
    const featuresUsed = metrics.features_used?.length || 0;
    if (featuresUsed > 0) {
      factors++;
      if (featuresUsed >= 8) score += 4;
      else if (featuresUsed >= 5) score += 3;
      else if (featuresUsed >= 3) score += 2;
      else score += 1;
    }

    // Time spent metrics (25% weight)
    const avgTimeSpent = metrics.time_spent_per_session || 0;
    if (avgTimeSpent > 0) {
      factors++;
      if (avgTimeSpent >= 300000)
        score += 4; // 5+ minutes
      else if (avgTimeSpent >= 120000)
        score += 3; // 2+ minutes
      else if (avgTimeSpent >= 60000)
        score += 2; // 1+ minute
      else score += 1;
    }

    // Settings customization (25% weight)
    const settingsChanges = this.settingsUsage.setting_changes?.length || 0;
    if (settingsChanges > 0) {
      factors++;
      if (settingsChanges >= 10) score += 4;
      else if (settingsChanges >= 5) score += 3;
      else if (settingsChanges >= 2) score += 2;
      else score += 1;
    }

    // Calculate average score
    const averageScore = factors > 0 ? score / factors : 0;

    // Return engagement level based on average score
    if (averageScore >= 3.5) return "power_user";
    else if (averageScore >= 2.5) return "deep";
    else if (averageScore >= 1.5) return "engaged";
    else return "casual";
  }

  /**
   * Calculate engagement level based on time spent
   */
  calculateEngagementLevel(timeSpent) {
    if (
      timeSpent <
      TRACKING_CONSTANTS.SETTINGS_PANEL.ENGAGEMENT_THRESHOLDS.QUICK_INTERACTION
    ) {
      return "quick";
    } else if (
      timeSpent <
      TRACKING_CONSTANTS.SETTINGS_PANEL.ENGAGEMENT_THRESHOLDS
        .ENGAGED_INTERACTION
    ) {
      return "engaged";
    } else if (
      timeSpent <
      TRACKING_CONSTANTS.SETTINGS_PANEL.ENGAGEMENT_THRESHOLDS.DEEP_ENGAGEMENT
    ) {
      return "deep";
    }
    return "power_user";
  }

  /**
   * Determine user type based on behavior
   */
  determineUserType() {
    const metrics = this.engagementMetrics;
    const settingsChanges = this.settingsUsage.setting_changes?.length || 0;
    const featuresUsed = metrics.features_used?.length || 0;
    const sessionCount = metrics.session_count || 0;

    if (
      settingsChanges >
        TRACKING_CONSTANTS.ANALYSIS.POWER_USER_SETTINGS_THRESHOLD &&
      featuresUsed > TRACKING_CONSTANTS.ANALYSIS.POWER_USER_FEATURES_THRESHOLD
    ) {
      return TRACKING_CONSTANTS.USER_BEHAVIOR.PATTERNS.POWER_USER;
    } else if (
      settingsChanges >
      TRACKING_CONSTANTS.ANALYSIS.CUSTOMIZER_SETTINGS_THRESHOLD
    ) {
      return TRACKING_CONSTANTS.USER_BEHAVIOR.PATTERNS.CUSTOMIZER;
    } else if (
      featuresUsed > TRACKING_CONSTANTS.ANALYSIS.EXPLORER_FEATURES_THRESHOLD
    ) {
      return TRACKING_CONSTANTS.USER_BEHAVIOR.PATTERNS.EXPLORER;
    } else if (
      sessionCount >
      TRACKING_CONSTANTS.ANALYSIS.GOAL_ORIENTED_SESSIONS_THRESHOLD
    ) {
      return TRACKING_CONSTANTS.USER_BEHAVIOR.PATTERNS.GOAL_ORIENTED;
    }
    return TRACKING_CONSTANTS.USER_BEHAVIOR.PATTERNS.CASUAL_USER;
  }

  /**
   * Get user type
   */
  getUserType() {
    return this.userProfile.userType || "unknown";
  }

  /**
   * Get page context
   */
  getPageContext() {
    return {
      url: window.location.href,
      title: document.title,
      referrer: document.referrer,
      timestamp: Date.now(),
    };
  }

  /**
   * Generate unique user ID
   */
  generateUserId() {
    return `user_${Date.now()}_${Math.random().toString(TRACKING_CONSTANTS.ANALYSIS.ID_GENERATION_BASE).substr(TRACKING_CONSTANTS.ANALYSIS.ID_GENERATION_SUBSTR_START, TRACKING_CONSTANTS.ANALYSIS.ID_GENERATION_LENGTH)}`;
  }

  /**
   * Track user event through analytics
   */
  trackUserEvent(eventName, data) {
    AnalyticsManager.trackEvent(eventName, {
      ...data,
      userId: this.userProfile.userId,
      sessionId: this.currentSession.sessionId || "unknown",
      timestamp: Date.now(),
    });
  }

  /**
   * Start session tracking
   */
  startSessionTracking() {
    this.currentSession.sessionId = `session_${Date.now()}_${Math.random().toString(TRACKING_CONSTANTS.ANALYSIS.ID_GENERATION_BASE).substr(TRACKING_CONSTANTS.ANALYSIS.ID_GENERATION_SUBSTR_START, TRACKING_CONSTANTS.ANALYSIS.ID_GENERATION_LENGTH)}`;
    this.updateEngagementMetrics("session_count");
  }

  /**
   * Schedule periodic tasks
   */
  schedulePeriodicTasks() {
    // Analyze behavior patterns every 15 minutes
    this.patternAnalysisInterval = setInterval(() => {
      this.analyzeBehaviorPatterns();
    }, TRACKING_CONSTANTS.TIMING.PATTERN_ANALYSIS_INTERVAL);

    // Generate insights every 5 minutes
    this.insightsInterval = setInterval(() => {
      this.generateInsights();
    }, TRACKING_CONSTANTS.TIMING.SESSION_SUMMARY_INTERVAL);

    // Flush metadata every 30 seconds
    this.metadataFlushInterval = setInterval(() => {
      this.flushMetadata();
    }, TRACKING_CONSTANTS.TIMING.METADATA_FLUSH_INTERVAL);
  }

  /**
   * Flush metadata to storage
   */
  flushMetadata() {
    this.saveUserProfileSync();
    this.saveEngagementMetricsSync();
    this.saveBehaviorPatternsSync();
    this.saveSettingsUsageSync();
  }

  // Storage methods

  async loadUserProfile() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        const profile = await this.dataHandler.getData(
          "userEngagementTracker_userProfile",
        );
        if (profile && Object.keys(profile).length > 0) {
          return profile;
        }
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for userProfile:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.USER_PROFILE,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load user profile:", error);
      return {};
    }
  }

  async saveUserProfile() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "userEngagementTracker_userProfile",
          this.userProfile,
        );
        return;
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for userProfile:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.USER_PROFILE,
        JSON.stringify(this.userProfile),
      );
    } catch (error) {
      logger.error("Failed to save user profile:", error);
    }
  }

  async loadEngagementMetrics() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        const metrics = await this.dataHandler.getData(
          "userEngagementTracker_engagementMetrics",
        );
        if (metrics && Object.keys(metrics).length > 0) {
          return metrics;
        }
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for engagementMetrics:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.ENGAGEMENT_METRICS,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load engagement metrics:", error);
      return {};
    }
  }

  async saveEngagementMetrics() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "userEngagementTracker_engagementMetrics",
          this.engagementMetrics,
        );
        return;
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for engagementMetrics:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.ENGAGEMENT_METRICS,
        JSON.stringify(this.engagementMetrics),
      );
    } catch (error) {
      logger.error("Failed to save engagement metrics:", error);
    }
  }

  async loadBehaviorPatterns() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        const patterns = await this.dataHandler.getData(
          "userEngagementTracker_behaviorPatterns",
        );
        if (patterns && Object.keys(patterns).length > 0) {
          return patterns;
        }
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for behaviorPatterns:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.BEHAVIOR_PATTERNS,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load behavior patterns:", error);
      return {};
    }
  }

  async saveBehaviorPatterns() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "userEngagementTracker_behaviorPatterns",
          this.behaviorPatterns,
        );
        return;
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for behaviorPatterns:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.BEHAVIOR_PATTERNS,
        JSON.stringify(this.behaviorPatterns),
      );
    } catch (error) {
      logger.error("Failed to save behavior patterns:", error);
    }
  }

  async loadSettingsUsage() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        const usage = await this.dataHandler.getData(
          "userEngagementTracker_settingsUsage",
        );
        if (usage && Object.keys(usage).length > 0) {
          return usage;
        }
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for settingsUsage:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      const stored = localStorage.getItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.SETTINGS_USAGE,
      );
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error("Failed to load settings usage:", error);
      return {};
    }
  }

  async saveSettingsUsage() {
    // Try DataHandler first
    if (this.dataHandler) {
      try {
        await this.dataHandler.saveData(
          "userEngagementTracker_settingsUsage",
          this.settingsUsage,
        );
        return;
      } catch (error) {
        console.warn(
          "[UserEngagementTracker] DataHandler failed, using localStorage fallback for settingsUsage:",
          error,
        );
      }
    }

    // Fallback to localStorage
    try {
      localStorage.setItem(
        TRACKING_CONSTANTS.STORAGE_KEYS.SETTINGS_USAGE,
        JSON.stringify(this.settingsUsage),
      );
    } catch (error) {
      logger.error("Failed to save settings usage:", error);
    }
  }

  /**
   * Sync wrapper methods for backward compatibility
   */
  saveUserProfileSync() {
    this.saveUserProfile().catch((error) => {
      console.error(
        "[UserEngagementTracker] Failed to save user profile:",
        error,
      );
    });
  }

  saveEngagementMetricsSync() {
    this.saveEngagementMetrics().catch((error) => {
      console.error(
        "[UserEngagementTracker] Failed to save engagement metrics:",
        error,
      );
    });
  }

  saveBehaviorPatternsSync() {
    this.saveBehaviorPatterns().catch((error) => {
      console.error(
        "[UserEngagementTracker] Failed to save behavior patterns:",
        error,
      );
    });
  }

  saveSettingsUsageSync() {
    this.saveSettingsUsage().catch((error) => {
      console.error(
        "[UserEngagementTracker] Failed to save settings usage:",
        error,
      );
    });
  }

  /**
   * Track scenario decision with regional context
   */
  trackScenarioDecisionWithRegionalContext(event) {
    try {
      const decisionElement = this.safeClosest(event, ".decision-option");
      if (!decisionElement) return;

      // Extract decision data from DOM
      const scenarioContainer = decisionElement.closest(".scenario-container");
      const simulationContainer = decisionElement.closest(
        ".simulation-container",
      );

      const decisionData = {
        scenario:
          scenarioContainer?.getAttribute("data-scenario-id") || "unknown",
        category: scenarioContainer?.getAttribute("data-category") || "unknown",
        choice:
          decisionElement.getAttribute("data-choice-id") ||
          decisionElement.textContent?.trim(),
        choiceText: decisionElement.textContent?.trim(),
        simulationId:
          simulationContainer?.getAttribute("data-simulation-id") || "unknown",
        userId: this.userProfile.userId,
        sessionId: this.currentSession.sessionId,
        timestamp: Date.now(),

        // Extract ethics impact if available
        ethicsImpact: this.extractEthicsImpact(decisionElement),

        // Extract reasoning if available
        reasoning: this.extractUserReasoning(decisionElement),

        // User interaction metadata
        interactionType: "click",
        responseTime: this.calculateResponseTime(scenarioContainer),
        confidence: this.extractConfidenceLevel(decisionElement),
        difficulty: this.extractDifficultyLevel(decisionElement),
      };

      // Track with regional analytics
      regionalAnalytics.trackScenarioDecision(decisionData);

      // Also track with standard analytics
      this.trackUserEvent("scenario_decision_regional", decisionData);

      // Update local engagement metrics
      this.updateEngagementMetrics("scenario_decisions", 1);

      // Dispatch custom event for other components
      document.dispatchEvent(
        new CustomEvent("scenario-decision", {
          detail: decisionData,
        }),
      );

      logger.debug("Scenario decision tracked with regional context:", {
        scenario: decisionData.scenario,
        choice: decisionData.choice,
        userId: decisionData.userId,
      });
    } catch (error) {
      logger.error(
        "Failed to track scenario decision with regional context:",
        error,
      );
    }
  }

  /**
   * Extract ethics impact from decision element
   */
  extractEthicsImpact(decisionElement) {
    try {
      const impactData = decisionElement.getAttribute("data-ethics-impact");
      return impactData ? JSON.parse(impactData) : null;
    } catch (error) {
      logger.warn("Failed to extract ethics impact:", error);
      return null;
    }
  }

  /**
   * Extract user reasoning from decision context
   */
  extractUserReasoning(decisionElement) {
    try {
      const reasoningElement = decisionElement
        .closest(".scenario-container")
        ?.querySelector(".user-reasoning");
      return (
        reasoningElement?.value || reasoningElement?.textContent?.trim() || null
      );
    } catch (error) {
      logger.warn("Failed to extract user reasoning:", error);
      return null;
    }
  }

  /**
   * Calculate response time for decision
   */
  calculateResponseTime(scenarioContainer) {
    try {
      const startTime = parseInt(
        scenarioContainer?.getAttribute("data-start-time") || "0",
      );
      return startTime ? Date.now() - startTime : null;
    } catch (error) {
      logger.warn("Failed to calculate response time:", error);
      return null;
    }
  }

  /**
   * Extract confidence level from decision
   */
  extractConfidenceLevel(decisionElement) {
    try {
      const confidenceElement = decisionElement
        .closest(".scenario-container")
        ?.querySelector(".confidence-slider");
      return confidenceElement?.value
        ? parseFloat(confidenceElement.value)
        : null;
    } catch (error) {
      logger.warn("Failed to extract confidence level:", error);
      return null;
    }
  }

  /**
   * Extract difficulty level from decision
   */
  extractDifficultyLevel(decisionElement) {
    try {
      const difficultyElement = decisionElement
        .closest(".scenario-container")
        ?.querySelector(".difficulty-rating");
      return difficultyElement?.value
        ? parseFloat(difficultyElement.value)
        : null;
    } catch (error) {
      logger.warn("Failed to extract difficulty level:", error);
      return null;
    }
  }

  /**
   * Analyze settings usage patterns
   */
  analyzeSettingsUsage() {
    const settingsData = this.settingsUsage;
    const totalChanges = settingsData.setting_changes?.length || 0;
    const totalOpens = settingsData.panel_opens || 0;
    const avgTimeSpent =
      settingsData.total_time_spent / Math.max(totalOpens, 1);

    return {
      totalChanges,
      totalOpens,
      avgTimeSpent,
      mostChangedSettings: this.getMostChangedSettings(),
      engagementLevel: this.calculateEngagementLevel(avgTimeSpent),
      customizationTendency:
        totalChanges > 5 ? "high" : totalChanges > 2 ? "medium" : "low",
    };
  }

  /**
   * Analyze user journey patterns
   */
  analyzeUserJourney() {
    const metrics = this.engagementMetrics;
    const sessionCount = metrics.session_count || 0;
    const featuresUsed = metrics.features_used?.length || 0;
    const totalTime = metrics.total_time_spent || 0;

    return {
      sessionCount,
      featuresUsed,
      totalTime,
      avgSessionDuration: totalTime / Math.max(sessionCount, 1),
      userType: this.determineUserType(),
      journeyStage:
        sessionCount < 3
          ? "new"
          : sessionCount < 10
            ? "exploring"
            : "established",
    };
  }

  /**
   * Identify pain points in user experience
   */
  identifyPainPoints() {
    const painPoints = [];
    const settingsAnalysis = this.analyzeSettingsUsage();

    if (settingsAnalysis.totalOpens > 5 && settingsAnalysis.totalChanges < 2) {
      painPoints.push(
        "High settings exploration but low changes - possible UX confusion",
      );
    }

    if (
      settingsAnalysis.avgTimeSpent > 120000 &&
      settingsAnalysis.totalChanges < 3
    ) {
      painPoints.push(
        "Long time in settings with few changes - possible difficulty finding options",
      );
    }

    return painPoints;
  }

  /**
   * Analyze feature adoption patterns
   */
  analyzeFeatureAdoption() {
    const metrics = this.engagementMetrics;
    const featuresUsed = metrics.features_used || [];

    return {
      totalFeatures: featuresUsed.length,
      adoptionRate: featuresUsed.length / 15, // Assuming 15 total features
      mostUsedFeatures: featuresUsed.slice(0, 5),
      featureDiscoveryPattern: "gradual", // Can be enhanced with more data
    };
  }

  /**
   * Identify performance issues from user behavior
   */
  identifyPerformanceIssues() {
    const issues = [];
    // This would be enhanced with actual performance metrics
    return issues;
  }

  /**
   * Analyze accessibility feature usage
   */
  analyzeAccessibilityUsage() {
    return {
      accessibilityFeaturesUsed: 0, // Would be enhanced with actual data
      screenReaderUsage: false,
      keyboardNavigation: false,
    };
  }

  /**
   * Get event listener status for debugging
   */
  getEventListenerStatus() {
    return {
      totalListeners: this.eventListeners.size,
      isTrackingEnabled: this.isTrackingEnabled,
      isInitialized: this.isInitialized,
      listeners: Array.from(this.eventListeners.entries()).map(
        ([key, info]) => ({
          key,
          target: info.target.constructor.name,
          event: info.event,
          hasOptions: !!info.options,
        }),
      ),
    };
  }

  /**
   * Get most frequently changed settings
   */
  getMostChangedSettings() {
    const changes = this.settingsUsage.setting_changes || [];
    const settingCounts = {};

    changes.forEach((change) => {
      settingCounts[change.setting] = (settingCounts[change.setting] || 0) + 1;
    });

    return Object.entries(settingCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([setting, count]) => ({ setting, count }));
  }
}

// Create and export singleton instance with enhanced app integration when available
let globalInstance = null;

export function getUserEngagementTracker(app = null) {
  if (!globalInstance) {
    globalInstance = new UserEngagementTracker(app);
  }
  return globalInstance;
}

// Legacy singleton export for backward compatibility
export const userEngagementTracker = getUserEngagementTracker();
export default userEngagementTracker;
