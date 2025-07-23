/**
 * Enhanced User Metadata Tracking Integration
 * Integrates regional analytics with the existing user tracking system
 *
 * This script sets up the enhanced tracking system with regional capabilities
 * and provides global access points for development and debugging.
 */

import { userEngagementTracker } from "./user-engagement-tracker.js";
import { UserInsightsDashboard } from "../components/user-insights-dashboard.js";
import regionalAnalytics from "./regional-analytics.js";
import regionalAnalyticsDashboard from "../components/regional-analytics-dashboard.js";
import logger from "../utils/logger.js";

/**
 * Constants for analysis
 */
const ANALYSIS_CONSTANTS = {
  ALIGNMENT_THRESHOLDS: {
    HIGH: 0.7,
    MEDIUM: 0.4,
  },
  SCALE_FACTOR: 2,
};

/**
 * Enhanced User Metadata Tracking System
 */
class EnhancedUserTracking {
  constructor() {
    this.userEngagementTracker = userEngagementTracker; // Use singleton instance
    this.userInsightsDashboard = new UserInsightsDashboard();
    this.regionalAnalytics = regionalAnalytics;
    this.regionalAnalyticsDashboard = regionalAnalyticsDashboard;

    this.isInitialized = false;
    this.init();
  }

  /**
   * Initialize the enhanced tracking system
   */
  async init() {
    try {
      // Initialize user engagement tracking
      await this.userEngagementTracker.init();

      // Initialize regional analytics
      await this.regionalAnalytics.init();

      // Set up keyboard shortcuts
      this.setupKeyboardShortcuts();

      // Set up global access points
      this.setupGlobalAccess();

      // Set up integration events
      this.setupIntegrationEvents();

      this.isInitialized = true;
      logger.info(
        "Enhanced User Metadata Tracking System initialized successfully",
      );
    } catch (error) {
      logger.error(
        "Failed to initialize Enhanced User Metadata Tracking System:",
        error,
      );
    }
  }

  /**
   * Public initialize method for external initialization
   */
  async initialize() {
    if (this.isInitialized) {
      logger.info("Enhanced user tracking already initialized");
      return;
    }
    await this.init();
  }

  /**
   * Setup keyboard shortcuts for dashboards
   */
  setupKeyboardShortcuts() {
    document.addEventListener("keydown", (event) => {
      // Only in development mode
      const isDevelopment =
        window.location.hostname === "localhost" ||
        window.location.hostname === "127.0.0.1";
      if (!isDevelopment) return;

      if (event.ctrlKey && event.shiftKey) {
        switch (event.key) {
          case "I":
            event.preventDefault();
            this.toggleUserInsightsDashboard();
            break;
          case "R":
            event.preventDefault();
            this.toggleRegionalAnalyticsDashboard();
            break;
        }
      }
    });
  }

  /**
   * Setup global access points for development
   */
  setupGlobalAccess() {
    // Enhanced user tracking interface
    window.userTracking = {
      // User insights methods
      showInsights: () => this.userInsightsDashboard.show(),
      hideInsights: () => this.userInsightsDashboard.hide(),
      toggleInsights: () => this.userInsightsDashboard.toggle(),

      // Regional analytics methods
      showRegionalDashboard: () => this.regionalAnalyticsDashboard.show(),
      hideRegionalDashboard: () => this.regionalAnalyticsDashboard.hide(),
      toggleRegionalDashboard: () => this.regionalAnalyticsDashboard.toggle(),

      // Data access methods
      getProfile: () => this.userEngagementTracker.getUserProfile(),
      getMetrics: () => this.userEngagementTracker.getEngagementMetrics(),
      getPatterns: () => this.userEngagementTracker.getBehaviorPatterns(),
      generateInsights: () => this.userEngagementTracker.generateInsights(),

      // Regional data methods
      getRegionalStatus: () => this.regionalAnalytics.getStatus(),
      getRegionalInsights: () =>
        this.regionalAnalytics.generateRegionalInsights(),
      exportRegionalData: () => this.regionalAnalytics.exportRegionalData(),
      clearRegionalData: () => this.regionalAnalytics.clearRegionalData(),

      // System status
      getSystemStatus: () => this.getSystemStatus(),

      // Manual tracking
      trackEvent: (eventName, data) =>
        this.userEngagementTracker.trackUserEvent(eventName, data),
      trackScenarioDecision: (decisionData) =>
        this.regionalAnalytics.trackScenarioDecision(decisionData),
    };

    // Legacy compatibility
    window.regionalAnalytics = {
      showDashboard: () => this.regionalAnalyticsDashboard.show(),
      hideDashboard: () => this.regionalAnalyticsDashboard.hide(),
      toggleDashboard: () => this.regionalAnalyticsDashboard.toggle(),
      getStatus: () => this.regionalAnalytics.getStatus(),
      generateInsights: () => this.regionalAnalytics.generateRegionalInsights(),
      exportData: () => this.regionalAnalytics.exportRegionalData(),
      clearData: () => this.regionalAnalytics.clearRegionalData(),
    };
  }

  /**
   * Setup integration events between systems
   */
  setupIntegrationEvents() {
    // When a scenario decision is made, ensure both systems track it
    document.addEventListener("scenario-decision", (event) => {
      const decisionData = event.detail;

      // Track in regional analytics
      this.regionalAnalytics.trackScenarioDecision(decisionData);

      // Track in user engagement
      this.userEngagementTracker.trackUserEvent(
        "scenario_decision",
        decisionData,
      );
    });

    // When user settings change, update regional context if needed
    document.addEventListener("settings-changed", (event) => {
      const settingsData = event.detail;

      // If location settings changed, reinitialize regional analytics
      if (
        settingsData.category === "privacy" &&
        settingsData.setting === "location_consent"
      ) {
        this.regionalAnalytics.loadGeographicData();
      }
    });

    // Cross-dashboard communication
    document.addEventListener("dashboard-opened", (event) => {
      const dashboardType = event.detail.type;

      if (dashboardType === "user-insights") {
        // Load fresh regional data for context
        this.regionalAnalytics.flushPendingData();
      } else if (dashboardType === "regional-analytics") {
        // Ensure user engagement data is up to date
        this.userEngagementTracker.flushMetadata();
      }
    });
  }

  /**
   * Toggle user insights dashboard
   */
  toggleUserInsightsDashboard() {
    this.userInsightsDashboard.toggle();

    // Dispatch event for integration
    document.dispatchEvent(
      new CustomEvent("dashboard-opened", {
        detail: { type: "user-insights" },
      }),
    );
  }

  /**
   * Toggle regional analytics dashboard
   */
  toggleRegionalAnalyticsDashboard() {
    this.regionalAnalyticsDashboard.toggle();

    // Dispatch event for integration
    document.dispatchEvent(
      new CustomEvent("dashboard-opened", {
        detail: { type: "regional-analytics" },
      }),
    );
  }

  /**
   * Get comprehensive system status
   */
  getSystemStatus() {
    return {
      initialized: this.isInitialized,
      userEngagement: {
        initialized: this.userEngagementTracker.isInitialized,
        userProfile: this.userEngagementTracker.getUserProfile(),
        sessionActive: this.userEngagementTracker.currentSession.active,
        metricsCount: Object.keys(
          this.userEngagementTracker.getEngagementMetrics(),
        ).length,
      },
      regionalAnalytics: this.regionalAnalytics.getStatus(),
      dashboards: {
        userInsights: this.userInsightsDashboard.getStatus
          ? this.userInsightsDashboard.getStatus()
          : { visible: false },
        regionalAnalytics: this.regionalAnalyticsDashboard.getStatus(),
      },
      timestamp: new Date().toISOString(),
    };
  }

  /**
   * Generate comprehensive analytics report
   */
  generateComprehensiveReport() {
    const userInsights = this.userEngagementTracker.generateInsights();
    const regionalInsights = this.regionalAnalytics.generateRegionalInsights();

    return {
      metadata: {
        reportDate: new Date().toISOString(),
        reportVersion: "1.0.0",
        systemStatus: this.getSystemStatus(),
      },
      userInsights,
      regionalInsights,
      crossAnalysis: this.performCrossAnalysis(userInsights, regionalInsights),
    };
  }

  /**
   * Perform cross-analysis between user and regional data
   */
  performCrossAnalysis(userInsights, regionalInsights) {
    try {
      const analysis = {
        userRegionalAlignment: this.analyzeUserRegionalAlignment(
          userInsights,
          regionalInsights,
        ),
        behaviorConsistency: this.analyzeBehaviorConsistency(
          userInsights,
          regionalInsights,
        ),
        culturalInfluence: this.analyzeCulturalInfluence(
          userInsights,
          regionalInsights,
        ),
        recommendations: this.generateCrossAnalysisRecommendations(
          userInsights,
          regionalInsights,
        ),
      };

      return analysis;
    } catch (error) {
      logger.error("Failed to perform cross-analysis:", error);
      return { error: "Cross-analysis failed" };
    }
  }

  /**
   * Analyze user-regional alignment
   */
  analyzeUserRegionalAlignment(userInsights, regionalInsights) {
    const userRegion = this.regionalAnalytics.geographicData?.region;
    const regionalData = regionalInsights.regionalComparisons.find(
      (r) => r.region === userRegion,
    );

    if (!regionalData) {
      return { alignment: "unknown", reason: "Regional data not available" };
    }

    // Compare user behavior patterns with regional averages
    const userBehavior = userInsights.behaviorPatterns;
    const regionalBehavior = regionalData.ethicsAverages;

    let alignmentScore = 0;
    let comparisons = 0;

    Object.keys(regionalBehavior).forEach((ethicsCategory) => {
      if (userBehavior[ethicsCategory] !== undefined) {
        const userValue = userBehavior[ethicsCategory];
        const regionalValue = regionalBehavior[ethicsCategory];
        const difference = Math.abs(userValue - regionalValue);

        alignmentScore += Math.max(
          0,
          1 - difference / ANALYSIS_CONSTANTS.SCALE_FACTOR,
        ); // Normalize to 0-1 scale
        comparisons++;
      }
    });

    if (comparisons === 0) {
      return {
        alignment: "insufficient_data",
        reason: "Not enough comparable data",
      };
    }

    const averageAlignment = alignmentScore / comparisons;

    return {
      alignment:
        averageAlignment > ANALYSIS_CONSTANTS.ALIGNMENT_THRESHOLDS.HIGH
          ? "high"
          : averageAlignment > ANALYSIS_CONSTANTS.ALIGNMENT_THRESHOLDS.MEDIUM
            ? "medium"
            : "low",
      score: averageAlignment,
      comparisons,
      details: "User behavior alignment with regional patterns",
    };
  }

  /**
   * Analyze behavior consistency
   */
  analyzeBehaviorConsistency(userInsights, _regionalInsights) {
    // Check if user behavior is consistent with their regional patterns
    const userType = userInsights.userClassification;
    const userRegion = this.regionalAnalytics.geographicData?.region;

    return {
      userType,
      userRegion,
      consistency: "analysis_pending",
      note: "Behavior consistency analysis requires more data collection",
    };
  }

  /**
   * Analyze cultural influence
   */
  analyzeCulturalInfluence(_userInsights, _regionalInsights) {
    const culturalContext =
      this.regionalAnalytics.geographicData?.culturalContext;

    if (!culturalContext) {
      return { influence: "unknown", reason: "Cultural context not available" };
    }

    return {
      culturalContext,
      influence: "moderate",
      indicators: [
        "Settings preferences align with regional patterns",
        "Decision-making patterns show cultural influence",
        "Feature usage reflects regional trends",
      ],
    };
  }

  /**
   * Generate cross-analysis recommendations
   */
  generateCrossAnalysisRecommendations(userInsights, regionalInsights) {
    const recommendations = [];

    // User-specific recommendations
    if (userInsights.userClassification === "power_user") {
      recommendations.push({
        type: "user_enhancement",
        priority: "high",
        suggestion:
          "Provide advanced regional analytics features for power users",
        impact: "Increase engagement with data-driven insights",
      });
    }

    // Regional-specific recommendations
    const userRegion = this.regionalAnalytics.geographicData?.region;
    const regionalRecs = regionalInsights.recommendations.filter(
      (r) => r.region === userRegion,
    );

    regionalRecs.forEach((rec) => {
      recommendations.push({
        type: "regional_personalization",
        priority: rec.priority,
        suggestion: `Personalize experience: ${rec.suggestion}`,
        impact: rec.impact,
      });
    });

    return recommendations;
  }

  /**
   * Export comprehensive data
   */
  exportComprehensiveData() {
    const report = this.generateComprehensiveReport();
    const blob = new Blob([JSON.stringify(report, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = `comprehensive_analytics_${new Date().toISOString().split("T")[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    logger.info("Comprehensive analytics data exported");
  }

  /**
   * Clear all tracking data
   */
  clearAllData() {
    // Clear user engagement data
    this.userEngagementTracker.clearAllData();

    // Clear regional analytics data
    this.regionalAnalytics.clearRegionalData();

    logger.info("All tracking data cleared");
  }
}

// Initialize the enhanced tracking system
const enhancedUserTracking = new EnhancedUserTracking();

// Export for use in other modules
export default enhancedUserTracking;
export { EnhancedUserTracking };
