/**
 * Regional Analytics Service
 * Handles geographic data collection and regional decision pattern analysis
 *
 * Features:
 * - Privacy-compliant geographic data collection
 * - Regional decision pattern analysis
 * - Cultural ethics preference tracking
 * - Cross-regional comparison insights
 * - Global trend analysis
 *
 * Privacy Note: All geographic data is processed locally and anonymized
 * before any optional server-side aggregation.
 */

import logger from "../utils/logger.js";
import AnalyticsManager from "../utils/analytics.js";

/**
 * Constants for regional analytics
 */
const REGIONAL_ANALYTICS_CONSTANTS = {
  STORAGE_PREFIX: "simulateai_regional_",
  MAX_DECISIONS_PER_REGION: 1000,
  TOP_REGIONS_LIMIT: 5,
  TOP_SCENARIOS_LIMIT: 3,
  ACCESSIBILITY_THRESHOLD: 3,
  RANDOM_BASE: 36,
  SESSION_ID_LENGTH: 9,
  VARIATION_THRESHOLD: 1.0,
  TIME_CONSTANTS: {
    HOURS_PER_DAY: 24,
    MINUTES_PER_HOUR: 60,
    SECONDS_PER_MINUTE: 60,
    MILLISECONDS_PER_SECOND: 1000,
  },
};

// Calculate cache duration using constants
REGIONAL_ANALYTICS_CONSTANTS.CACHE_DURATION =
  REGIONAL_ANALYTICS_CONSTANTS.TIME_CONSTANTS.HOURS_PER_DAY *
  REGIONAL_ANALYTICS_CONSTANTS.TIME_CONSTANTS.MINUTES_PER_HOUR *
  REGIONAL_ANALYTICS_CONSTANTS.TIME_CONSTANTS.SECONDS_PER_MINUTE *
  REGIONAL_ANALYTICS_CONSTANTS.TIME_CONSTANTS.MILLISECONDS_PER_SECOND;

REGIONAL_ANALYTICS_CONSTANTS.ETHICS_FRAMEWORKS = [
  "utilitarian",
  "deontological",
  "virtue-ethics",
  "care-ethics",
  "consequentialist",
  "rights-based",
  "cultural-relativist",
];

REGIONAL_ANALYTICS_CONSTANTS.DECISION_CATEGORIES = [
  "fairness",
  "sustainability",
  "autonomy",
  "beneficence",
  "transparency",
  "accountability",
  "privacy",
  "proportionality",
];

/**
 * Regional Analytics Service Class
 */
class RegionalAnalytics {
  constructor() {
    this.isInitialized = false;
    this.geographicData = null;
    this.decisionPatterns = new Map();
    this.regionalInsights = new Map();

    // Initialize on creation
    this.init();
  }

  /**
   * Initialize regional analytics
   */
  async init() {
    // Prevent multiple initializations
    if (this.isInitialized) {
      logger.debug("Regional Analytics already initialized, skipping");
      return;
    }

    try {
      await this.loadGeographicData();
      await this.loadCachedAnalytics();
      this.setupEventListeners();
      this.isInitialized = true;

      logger.info("Regional Analytics initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize Regional Analytics:", error);
    }
  }

  /**
   * Load geographic data from user's browser/IP
   */
  async loadGeographicData() {
    try {
      // Get timezone-based geographic estimation
      const timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
      const locale = navigator.language || navigator.userLanguage;

      // Estimate region from timezone and locale
      const geographic = this.estimateGeographicData(timezone, locale);

      // Try to get more precise location if user consents
      if (navigator.geolocation && this.hasLocationConsent()) {
        await this.requestPreciseLocation(geographic);
      }

      this.geographicData = geographic;
      this.storeGeographicData(geographic);

      logger.info("Geographic data loaded:", {
        region: geographic.region,
        country: geographic.country,
        timezone: geographic.timezone,
      });
    } catch (error) {
      logger.error("Failed to load geographic data:", error);
      // Fallback to minimal data
      this.geographicData = {
        region: "unknown",
        country: "unknown",
        timezone: "UTC",
        locale: "en-US",
      };
    }
  }

  /**
   * Estimate geographic data from timezone and locale
   */
  estimateGeographicData(timezone, locale) {
    // Regional mapping based on timezone
    const regionMapping = {
      "America/": "Americas",
      "Europe/": "Europe",
      "Asia/": "Asia",
      "Africa/": "Africa",
      "Australia/": "Oceania",
      "Pacific/": "Oceania",
    };

    // Country mapping from locale
    const countryMapping = {
      "en-US": "United States",
      "en-GB": "United Kingdom",
      "en-CA": "Canada",
      "en-AU": "Australia",
      "fr-FR": "France",
      "de-DE": "Germany",
      "es-ES": "Spain",
      "it-IT": "Italy",
      "ja-JP": "Japan",
      "ko-KR": "South Korea",
      "zh-CN": "China",
      "pt-BR": "Brazil",
      "ru-RU": "Russia",
      "ar-SA": "Saudi Arabia",
      "hi-IN": "India",
    };

    const region = Object.keys(regionMapping).find((key) =>
      timezone.startsWith(key),
    );
    const estimatedRegion = region ? regionMapping[region] : "Unknown";
    const estimatedCountry = countryMapping[locale] || "Unknown";

    return {
      region: estimatedRegion,
      country: estimatedCountry,
      timezone,
      locale,
      culturalContext: this.getCulturalContext(estimatedRegion),
      timestamp: Date.now(),
    };
  }

  /**
   * Get cultural context indicators
   */
  getCulturalContext(region) {
    const contexts = {
      Americas: {
        individualism: "high",
        collectivism: "low",
        powerDistance: "medium",
        uncertaintyAvoidance: "medium",
      },
      Europe: {
        individualism: "medium",
        collectivism: "medium",
        powerDistance: "low",
        uncertaintyAvoidance: "high",
      },
      Asia: {
        individualism: "low",
        collectivism: "high",
        powerDistance: "high",
        uncertaintyAvoidance: "medium",
      },
      Africa: {
        individualism: "low",
        collectivism: "high",
        powerDistance: "high",
        uncertaintyAvoidance: "medium",
      },
      Oceania: {
        individualism: "high",
        collectivism: "low",
        powerDistance: "low",
        uncertaintyAvoidance: "low",
      },
    };

    return (
      contexts[region] || {
        individualism: "unknown",
        collectivism: "unknown",
        powerDistance: "unknown",
        uncertaintyAvoidance: "unknown",
      }
    );
  }

  /**
   * Check if user has given location consent
   */
  hasLocationConsent() {
    const consent = localStorage.getItem("simulateai_location_consent");
    return consent === "granted";
  }

  /**
   * Request precise location with user consent
   */
  async requestPreciseLocation(geographic) {
    return new Promise((resolve) => {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          geographic.coordinates = {
            latitude: Math.round(position.coords.latitude * 10) / 10, // Rounded for privacy
            longitude: Math.round(position.coords.longitude * 10) / 10,
          };
          geographic.preciseLocation = true;
          resolve(geographic);
        },
        (error) => {
          logger.warn("Precise location not available:", error.message);
          geographic.preciseLocation = false;
          resolve(geographic);
        },
        { timeout: 5000, enableHighAccuracy: false },
      );
    });
  }

  /**
   * Track scenario decision with regional context
   */
  trackScenarioDecision(decisionData) {
    if (!this.isInitialized || !this.geographicData) {
      logger.warn("Regional analytics not initialized for decision tracking");
      return;
    }

    const enhancedDecision = {
      ...decisionData,
      geographic: {
        region: this.geographicData.region,
        country: this.geographicData.country,
        timezone: this.geographicData.timezone,
        culturalContext: this.geographicData.culturalContext,
      },
      timestamp: Date.now(),
      sessionId: this.generateSessionId(),
    };

    // Store decision locally
    this.storeDecisionLocally(enhancedDecision);

    // Update regional patterns
    this.updateRegionalPatterns(enhancedDecision);

    // Track with analytics
    this.trackDecisionAnalytics(enhancedDecision);

    logger.debug("Scenario decision tracked with regional context:", {
      scenario: decisionData.scenario,
      region: this.geographicData.region,
      choice: decisionData.choice,
    });
  }

  /**
   * Store decision locally
   */
  storeDecisionLocally(decision) {
    try {
      const storageKey = `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}decisions`;
      let decisions = JSON.parse(localStorage.getItem(storageKey) || "[]");

      decisions.push(decision);

      // Limit storage size
      if (
        decisions.length > REGIONAL_ANALYTICS_CONSTANTS.MAX_DECISIONS_PER_REGION
      ) {
        decisions = decisions.slice(
          -REGIONAL_ANALYTICS_CONSTANTS.MAX_DECISIONS_PER_REGION,
        );
      }

      localStorage.setItem(storageKey, JSON.stringify(decisions));
    } catch (error) {
      logger.error("Failed to store decision locally:", error);
    }
  }

  /**
   * Update regional decision patterns
   */
  updateRegionalPatterns(decision) {
    const { region } = decision.geographic;

    if (!this.decisionPatterns.has(region)) {
      this.decisionPatterns.set(region, {
        totalDecisions: 0,
        scenarioPatterns: new Map(),
        ethicsPreferences: new Map(),
        culturalTrends: new Map(),
      });
    }

    const patterns = this.decisionPatterns.get(region);
    patterns.totalDecisions++;

    // Update scenario patterns
    if (!patterns.scenarioPatterns.has(decision.scenario)) {
      patterns.scenarioPatterns.set(decision.scenario, {
        choices: new Map(),
        ethicsImpacts: new Map(),
      });
    }

    const scenarioPattern = patterns.scenarioPatterns.get(decision.scenario);
    const choiceCount = scenarioPattern.choices.get(decision.choice) || 0;
    scenarioPattern.choices.set(decision.choice, choiceCount + 1);

    // Update ethics preferences
    if (decision.ethicsImpact) {
      Object.entries(decision.ethicsImpact).forEach(([metric, value]) => {
        if (!patterns.ethicsPreferences.has(metric)) {
          patterns.ethicsPreferences.set(metric, { total: 0, count: 0 });
        }
        const pref = patterns.ethicsPreferences.get(metric);
        pref.total += value;
        pref.count++;
      });
    }
  }

  /**
   * Track decision with analytics
   */
  trackDecisionAnalytics(decision) {
    AnalyticsManager.trackEvent("regional_decision", {
      region: decision.geographic.region,
      country: decision.geographic.country,
      scenario: decision.scenario,
      category: decision.category,
      choice: decision.choice,
      hasReasoning: !!decision.reasoning,
      culturalContext: decision.geographic.culturalContext,
      timestamp: decision.timestamp,
    });
  }

  /**
   * Generate insights for regional decision patterns
   */
  generateRegionalInsights() {
    const insights = {
      globalSummary: this.generateGlobalSummary(),
      regionalComparisons: this.generateRegionalComparisons(),
      culturalTrends: this.generateCulturalTrends(),
      ethicsPreferences: this.generateEthicsPreferences(),
      recommendations: this.generateRecommendations(),
    };

    this.cacheInsights(insights);
    return insights;
  }

  /**
   * Generate global summary statistics
   */
  generateGlobalSummary() {
    const totalDecisions = Array.from(this.decisionPatterns.values()).reduce(
      (sum, pattern) => sum + pattern.totalDecisions,
      0,
    );

    const activeRegions = this.decisionPatterns.size;
    const topRegions = Array.from(this.decisionPatterns.entries())
      .sort((a, b) => b[1].totalDecisions - a[1].totalDecisions)
      .slice(0, REGIONAL_ANALYTICS_CONSTANTS.TOP_REGIONS_LIMIT)
      .map(([region, data]) => ({
        region,
        decisions: data.totalDecisions,
        percentage: ((data.totalDecisions / totalDecisions) * 100).toFixed(1),
      }));

    return {
      totalDecisions,
      activeRegions,
      topRegions,
      dataCollectionPeriod: this.getDataCollectionPeriod(),
    };
  }

  /**
   * Generate regional comparisons
   */
  generateRegionalComparisons() {
    const comparisons = [];

    for (const [region, patterns] of this.decisionPatterns) {
      const ethicsAverages = new Map();

      for (const [metric, data] of patterns.ethicsPreferences) {
        ethicsAverages.set(metric, data.total / data.count);
      }

      comparisons.push({
        region,
        totalDecisions: patterns.totalDecisions,
        ethicsAverages: Object.fromEntries(ethicsAverages),
        topScenarios: this.getTopScenarios(patterns.scenarioPatterns),
        culturalIndicators: this.getCulturalIndicators(region),
      });
    }

    return comparisons.sort((a, b) => b.totalDecisions - a.totalDecisions);
  }

  /**
   * Generate cultural trends analysis
   */
  generateCulturalTrends() {
    const trends = {
      individualismVsCollectivism: this.analyzeIndividualismTrends(),
      powerDistancePatterns: this.analyzePowerDistancePatterns(),
      uncertaintyAvoidance: this.analyzeUncertaintyAvoidance(),
      ethicsFrameworkPreferences: this.analyzeEthicsFrameworks(),
    };

    return trends;
  }

  /**
   * Analyze individualism vs collectivism trends
   */
  analyzeIndividualismTrends() {
    const trends = new Map();

    for (const [region, patterns] of this.decisionPatterns) {
      const cultural = this.getCulturalIndicators(region);
      if (cultural.individualism !== "unknown") {
        trends.set(region, {
          individualism: cultural.individualism,
          autonomyPreference: this.getEthicsAverage(patterns, "autonomy"),
          fairnessPreference: this.getEthicsAverage(patterns, "fairness"),
          beneficencePreference: this.getEthicsAverage(patterns, "beneficence"),
        });
      }
    }

    return Object.fromEntries(trends);
  }

  /**
   * Analyze power distance patterns across regions
   */
  analyzePowerDistancePatterns() {
    const patterns = new Map();

    for (const [region, decisionData] of this.decisionPatterns) {
      const cultural = this.getCulturalIndicators(region);
      if (cultural.powerDistance !== "unknown") {
        patterns.set(region, {
          powerDistance: cultural.powerDistance,
          authorityRespect: this.getEthicsAverage(
            decisionData,
            "accountability",
          ),
          hierarchyPreference: this.getEthicsAverage(
            decisionData,
            "transparency",
          ),
          leadershipStyle:
            cultural.powerDistance === "high" ? "hierarchical" : "egalitarian",
        });
      }
    }

    return Object.fromEntries(patterns);
  }

  /**
   * Analyze uncertainty avoidance patterns
   */
  analyzeUncertaintyAvoidance() {
    const patterns = new Map();

    for (const [region, decisionData] of this.decisionPatterns) {
      const cultural = this.getCulturalIndicators(region);
      patterns.set(region, {
        uncertaintyAvoidance: cultural.uncertaintyAvoidance || "medium",
        riskTolerance: this.getEthicsAverage(decisionData, "proportionality"),
        structurePreference: this.getEthicsAverage(
          decisionData,
          "accountability",
        ),
        innovationOpenness: this.getEthicsAverage(decisionData, "autonomy"),
      });
    }

    return Object.fromEntries(patterns);
  }

  /**
   * Analyze ethics framework preferences
   */
  analyzeEthicsFrameworks() {
    const frameworks = new Map();

    for (const [region, decisionData] of this.decisionPatterns) {
      const frameworkPreferences = {
        utilitarian: this.getEthicsAverage(decisionData, "beneficence"),
        deontological: this.getEthicsAverage(decisionData, "fairness"),
        virtue: this.getEthicsAverage(decisionData, "accountability"),
        care: this.getEthicsAverage(decisionData, "sustainability"),
      };

      frameworks.set(region, frameworkPreferences);
    }

    return Object.fromEntries(frameworks);
  }

  /**
   * Generate ethics preferences analysis
   */
  generateEthicsPreferences() {
    const preferences = {};

    REGIONAL_ANALYTICS_CONSTANTS.DECISION_CATEGORIES.forEach((category) => {
      preferences[category] = this.analyzeEthicsCategory(category);
    });

    return preferences;
  }

  /**
   * Analyze specific ethics category across regions
   */
  analyzeEthicsCategory(category) {
    const analysis = {
      globalAverage: 0,
      regionalVariation: [],
      highestRegion: null,
      lowestRegion: null,
    };

    let totalSum = 0;
    let totalCount = 0;
    const regionalData = [];

    for (const [region, patterns] of this.decisionPatterns) {
      const average = this.getEthicsAverage(patterns, category);
      if (average !== null) {
        regionalData.push({ region, average });
        totalSum += average;
        totalCount++;
      }
    }

    if (totalCount > 0) {
      analysis.globalAverage = totalSum / totalCount;
      analysis.regionalVariation = regionalData.sort(
        (a, b) => b.average - a.average,
      );
      analysis.highestRegion = regionalData[0];
      analysis.lowestRegion = regionalData[regionalData.length - 1];
    }

    return analysis;
  }

  /**
   * Generate recommendations based on regional data
   */
  generateRecommendations() {
    const recommendations = [];

    // Regional customization recommendations
    for (const [region, patterns] of this.decisionPatterns) {
      const ethicsProfile = this.getRegionalEthicsProfile(patterns);
      const culturalContext = this.getCulturalIndicators(region);

      recommendations.push({
        region,
        type: "regional_customization",
        priority: "high",
        suggestion: this.generateRegionalCustomizationSuggestion(
          ethicsProfile,
          culturalContext,
        ),
        impact:
          "Improve user engagement by tailoring content to regional preferences",
      });
    }

    // Global feature recommendations
    const globalTrends = this.identifyGlobalTrends();
    recommendations.push({
      region: "global",
      type: "feature_development",
      priority: "medium",
      suggestion: this.generateGlobalFeatureSuggestion(globalTrends),
      impact: "Enhance platform with features that appeal to global audience",
    });

    return recommendations;
  }

  /**
   * Get data collection period
   */
  getDataCollectionPeriod() {
    const decisions = this.getAllDecisions();
    if (decisions.length === 0) return null;

    const timestamps = decisions.map((d) => d.timestamp);
    const earliest = Math.min(...timestamps);
    const latest = Math.max(...timestamps);

    return {
      start: new Date(earliest).toISOString(),
      end: new Date(latest).toISOString(),
      duration: latest - earliest,
    };
  }

  /**
   * Get all stored decisions
   */
  getAllDecisions() {
    try {
      const storageKey = `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}decisions`;
      return JSON.parse(localStorage.getItem(storageKey) || "[]");
    } catch (error) {
      logger.error("Failed to get all decisions:", error);
      return [];
    }
  }

  /**
   * Get cultural indicators for region
   */
  getCulturalIndicators(_region) {
    return (
      this.geographicData?.culturalContext || {
        individualism: "unknown",
        collectivism: "unknown",
        powerDistance: "unknown",
        uncertaintyAvoidance: "unknown",
      }
    );
  }

  /**
   * Get ethics average for a pattern
   */
  getEthicsAverage(patterns, category) {
    const ethicsData = patterns.ethicsPreferences.get(category);
    return ethicsData ? ethicsData.total / ethicsData.count : null;
  }

  /**
   * Helper methods for analysis
   */
  getTopScenarios(scenarioPatterns) {
    return Array.from(scenarioPatterns.entries())
      .sort((a, b) => b[1].choices.size - a[1].choices.size)
      .slice(0, REGIONAL_ANALYTICS_CONSTANTS.TOP_SCENARIOS_LIMIT)
      .map(([scenario, data]) => ({
        scenario,
        totalChoices: Array.from(data.choices.values()).reduce(
          (sum, count) => sum + count,
          0,
        ),
      }));
  }

  getRegionalEthicsProfile(patterns) {
    const profile = {};
    for (const [category, data] of patterns.ethicsPreferences) {
      profile[category] = data.total / data.count;
    }
    return profile;
  }

  generateRegionalCustomizationSuggestion(ethicsProfile, culturalContext) {
    const suggestions = [];

    // Individualism-based suggestions
    if (culturalContext.individualism === "high") {
      suggestions.push(
        "Emphasize personal autonomy and individual choice scenarios",
      );
    } else if (culturalContext.individualism === "low") {
      suggestions.push(
        "Focus on collective benefit and community-oriented scenarios",
      );
    }

    // Power distance suggestions
    if (culturalContext.powerDistance === "high") {
      suggestions.push(
        "Include scenarios about authority and hierarchical decision-making",
      );
    } else if (culturalContext.powerDistance === "low") {
      suggestions.push(
        "Emphasize egalitarian and participatory decision-making scenarios",
      );
    }

    return suggestions.join("; ");
  }

  generateGlobalFeatureSuggestion(trends) {
    const suggestions = [];

    if (trends.needsTransparency) {
      suggestions.push("Add transparency explanations for AI decisions");
    }

    if (trends.needsAccessibility) {
      suggestions.push("Improve accessibility features for global users");
    }

    if (trends.needsCulturalAdaptation) {
      suggestions.push("Implement cultural adaptation features");
    }

    return suggestions.join("; ");
  }

  identifyGlobalTrends() {
    // Analyze global trends across all regions
    return {
      needsTransparency: this.analyzeTransparencyNeed(),
      needsAccessibility: this.analyzeAccessibilityNeed(),
      needsCulturalAdaptation: this.analyzeCulturalAdaptationNeed(),
    };
  }

  analyzeTransparencyNeed() {
    let transparencySum = 0;
    let count = 0;

    for (const [, patterns] of this.decisionPatterns) {
      const avg = this.getEthicsAverage(patterns, "transparency");
      if (avg !== null) {
        transparencySum += avg;
        count++;
      }
    }

    return count > 0 && transparencySum / count < 0; // Negative average indicates need
  }

  analyzeAccessibilityNeed() {
    // Analyze if accessibility is a concern across regions
    return (
      this.decisionPatterns.size >
      REGIONAL_ANALYTICS_CONSTANTS.ACCESSIBILITY_THRESHOLD
    );
  }

  analyzeCulturalAdaptationNeed() {
    // Check if there are significant regional differences
    const ethicsVariations =
      REGIONAL_ANALYTICS_CONSTANTS.DECISION_CATEGORIES.map((category) => {
        const regionalValues = [];
        for (const [, patterns] of this.decisionPatterns) {
          const avg = this.getEthicsAverage(patterns, category);
          if (avg !== null) regionalValues.push(avg);
        }

        if (regionalValues.length > 1) {
          const min = Math.min(...regionalValues);
          const max = Math.max(...regionalValues);
          return max - min;
        }
        return 0;
      });

    const averageVariation =
      ethicsVariations.reduce((sum, variation) => sum + variation, 0) /
      ethicsVariations.length;
    return averageVariation > REGIONAL_ANALYTICS_CONSTANTS.VARIATION_THRESHOLD;
  }

  /**
   * Cache insights for performance
   */
  cacheInsights(insights) {
    try {
      const cacheKey = `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}insights_cache`;
      const cacheData = {
        insights,
        timestamp: Date.now(),
        expiresAt: Date.now() + REGIONAL_ANALYTICS_CONSTANTS.CACHE_DURATION,
      };

      localStorage.setItem(cacheKey, JSON.stringify(cacheData));
    } catch (error) {
      logger.error("Failed to cache insights:", error);
    }
  }

  /**
   * Load cached analytics
   */
  async loadCachedAnalytics() {
    try {
      const cacheKey = `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}insights_cache`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const cacheData = JSON.parse(cached);
        if (cacheData.expiresAt > Date.now()) {
          this.regionalInsights = new Map(Object.entries(cacheData.insights));
          logger.info("Loaded cached regional insights");
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (error) {
      logger.error("Failed to load cached analytics:", error);
    }
  }

  /**
   * Store geographic data
   */
  storeGeographicData(data) {
    try {
      const storageKey = `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}geographic`;
      localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (error) {
      logger.error("Failed to store geographic data:", error);
    }
  }

  /**
   * Generate session ID
   */
  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(REGIONAL_ANALYTICS_CONSTANTS.RANDOM_BASE).substr(2, REGIONAL_ANALYTICS_CONSTANTS.SESSION_ID_LENGTH)}`;
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for scenario decisions
    document.addEventListener("scenario-decision", (event) => {
      this.trackScenarioDecision(event.detail);
    });

    // Listen for page visibility changes to update session data
    document.addEventListener("visibilitychange", () => {
      if (document.hidden) {
        this.flushPendingData();
      }
    });
  }

  /**
   * Flush pending data
   */
  flushPendingData() {
    // Ensure all pending data is saved
    try {
      this.generateRegionalInsights();
      logger.info("Flushed regional analytics data");
    } catch (error) {
      logger.error("Failed to flush regional analytics data:", error);
    }
  }

  /**
   * Export regional analytics data
   */
  exportRegionalData() {
    const exportData = {
      geographicData: this.geographicData,
      decisions: this.getAllDecisions(),
      insights: this.generateRegionalInsights(),
      metadata: {
        exportDate: new Date().toISOString(),
        version: "1.0.0",
        totalDecisions: this.getAllDecisions().length,
        activeRegions: this.decisionPatterns.size,
      },
    };

    return exportData;
  }

  /**
   * Clear all regional data
   */
  clearRegionalData() {
    const keys = ["geographic", "decisions", "insights_cache", "patterns"].map(
      (key) => `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}${key}`,
    );

    keys.forEach((key) => {
      localStorage.removeItem(key);
    });

    this.decisionPatterns.clear();
    this.regionalInsights.clear();
    this.geographicData = null;

    logger.info("Regional analytics data cleared");
  }

  /**
   * Get current regional analytics status
   */
  getStatus() {
    return {
      initialized: this.isInitialized,
      hasGeographicData: !!this.geographicData,
      currentRegion: this.geographicData?.region,
      totalDecisions: this.getAllDecisions().length,
      activeRegions: this.decisionPatterns.size,
      cacheStatus: this.getCacheStatus(),
    };
  }

  /**
   * Get cache status
   */
  getCacheStatus() {
    try {
      const cacheKey = `${REGIONAL_ANALYTICS_CONSTANTS.STORAGE_PREFIX}insights_cache`;
      const cached = localStorage.getItem(cacheKey);

      if (cached) {
        const cacheData = JSON.parse(cached);
        return {
          exists: true,
          timestamp: cacheData.timestamp,
          expiresAt: cacheData.expiresAt,
          isValid: cacheData.expiresAt > Date.now(),
        };
      }
    } catch (error) {
      logger.error("Failed to get cache status:", error);
    }

    return { exists: false };
  }
}

// Create singleton instance
const regionalAnalytics = new RegionalAnalytics();

// Export for use in other modules
export default regionalAnalytics;
export { RegionalAnalytics };
