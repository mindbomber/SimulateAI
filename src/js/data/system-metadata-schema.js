/**
 * System-Level Metadata Collection Schema
 * For performance analytics, engagement tracking, and platform optimization
 */

export const SYSTEM_METADATA_SCHEMA = {
  // Scenario Performance Metrics
  scenarioMetrics: {
    scenarioId: 'string',
    categoryId: 'string',
    title: 'string',
    difficulty: 'string', // "beginner", "intermediate", "advanced"

    // Performance Metrics
    totalAttempts: 'number',
    completionRate: 'number', // percentage
    bounceRate: 'number', // percentage who quit within 30 seconds
    averageCompletionTime: 'number', // seconds
    dropoffStages: 'array', // which stages users quit most

    // Quality Metrics
    averageRating: 'number', // 1-5 star rating
    ratingCount: 'number',
    reportCount: 'number', // bug/issue reports

    // Engagement Metrics
    remixCount: 'number', // how many users modify answers
    discussionThreads: 'number', // forum discussions spawned
    shareCount: 'number', // social sharing
    bookmarkCount: 'number', // users who saved scenario

    // Temporal Data
    createdAt: 'timestamp',
    lastActivity: 'timestamp',
    weeklyActiveUsers: 'number',
    monthlyActiveUsers: 'number',
  },

  // Philosophical Framework Analytics
  frameworkEngagement: {
    frameworkId: 'string', // "utilitarian", "deontological", etc.
    frameworkName: 'string',

    // User Engagement
    totalUsers: 'number', // users who selected this framework
    activeUsers: 'number', // recent activity
    newUsersThisMonth: 'number',

    // Scenario Performance by Framework
    scenarioPreferences: 'array', // which scenarios they prefer
    averageCompletionRate: 'number',
    averageEngagementTime: 'number',
    conflictResolutionStyle: 'object', // how they handle ethical dilemmas

    // Framework Combinations
    commonSecondaryFrameworks: 'array', // what they pair with
    frameworkEvolution: 'array', // how users change over time

    // Temporal Analysis
    monthlyTrends: 'array', // engagement over time
    seasonalPatterns: 'object', // seasonal preferences
    lastUpdated: 'timestamp',
  },

  // Category Performance Analytics
  categoryMetrics: {
    categoryId: 'string',
    categoryName: 'string',

    // Overall Performance
    totalScenarios: 'number',
    activeScenarios: 'number',
    averageScenarioRating: 'number',

    // User Engagement
    uniqueUsers: 'number',
    returnUsers: 'number', // users who come back to category
    averageSessionDuration: 'number',
    scenariosPerSession: 'number',

    // Content Quality
    highRatedScenarios: 'number', // 4+ stars
    problematicScenarios: 'number', // high report rate
    newScenarioRequests: 'number', // user suggestions

    // User Journey
    entryPoint: 'object', // how users discover category
    exitPoint: 'object', // where users leave
    conversionToOtherCategories: 'array',

    // Demographics
    topUserDemographics: 'object', // age, profession, etc.
    topPhilosophicalFrameworks: 'array',
    culturalPreferences: 'object', // country/region insights
  },

  // Platform-Wide Analytics
  platformMetrics: {
    // User Base Analytics
    totalUsers: 'number',
    activeUsers: 'number', // last 30 days
    newUserRetention: 'object', // 1day, 7day, 30day retention
    userGrowthRate: 'number', // monthly growth percentage

    // Content Analytics
    totalScenarios: 'number',
    totalCategories: 'number',
    averageQualityScore: 'number',
    contentCreationRate: 'number', // new scenarios per month

    // Engagement Analytics
    averageSessionDuration: 'number',
    averageScenariosPerUser: 'number',
    totalTimeSpent: 'number', // across all users
    peakUsageHours: 'array', // hourly usage patterns

    // Research Analytics
    researchParticipants: 'number',
    researchDataPoints: 'number',
    anonymizedInsights: 'object',

    // Technical Performance
    averageLoadTime: 'number',
    errorRate: 'number',
    mobileUsagePercentage: 'number',
    browserDistribution: 'object',

    // Community Analytics
    forumPosts: 'number',
    blogContributions: 'number',
    userGeneratedContent: 'number',

    // Support Analytics
    supportTickets: 'number',
    averageResolutionTime: 'number',
    userSatisfactionScore: 'number',

    lastUpdated: 'timestamp',
  },

  // Real-Time Session Analytics
  sessionMetrics: {
    sessionId: 'string',
    userId: 'string', // hashed for privacy

    // Session Details
    startTime: 'timestamp',
    endTime: 'timestamp',
    duration: 'number', // seconds
    deviceType: 'string', // "mobile", "tablet", "desktop"
    userAgent: 'string',

    // Activity Tracking
    scenariosViewed: 'array',
    scenariosCompleted: 'array',
    scenariosAbandoned: 'array',
    navigationPath: 'array', // user journey through app

    // Interaction Patterns
    averageDecisionTime: 'number',
    thoughtfulnessScore: 'number', // based on time spent
    explorationBehavior: 'string', // "systematic", "exploratory", "focused"

    // Quality Indicators
    engagementScore: 'number', // composite metric
    learningProgress: 'number', // improvement over session
    satisfactionIndicators: 'object', // implicit feedback

    // Technical Metrics
    loadTimes: 'array',
    errors: 'array',
    performanceScore: 'number',
  },

  // A/B Testing and Optimization
  experimentMetrics: {
    experimentId: 'string',
    experimentName: 'string',

    // Experiment Setup
    startDate: 'timestamp',
    endDate: 'timestamp',
    variants: 'array', // different versions tested
    participantCount: 'number',

    // Results
    conversionRates: 'object', // by variant
    engagementMetrics: 'object', // by variant
    userSatisfaction: 'object', // by variant
    statisticalSignificance: 'number',

    // Insights
    winningVariant: 'string',
    improvementPercentage: 'number',
    implementationDate: 'timestamp',
    rollbackDate: 'timestamp', // if experiment failed
  },

  // Content Optimization Insights
  contentInsights: {
    // Scenario Optimization
    topPerformingScenarios: 'array',
    underperformingScenarios: 'array',
    scenarioGaps: 'array', // missing content areas

    // User Journey Optimization
    conversionFunnels: 'object',
    dropoffPoints: 'array',
    optimizationOpportunities: 'array',

    // Personalization Insights
    recommendationEffectiveness: 'number',
    personalizationLift: 'number',
    segmentPerformance: 'object',

    // Content Strategy
    emergingTopics: 'array',
    seasonalTrends: 'object',
    competitiveAnalysis: 'object',

    lastAnalysis: 'timestamp',
  },
};

/**
 * Aggregation Rules for System Metrics
 * Defines how raw data gets aggregated into insights
 */
export const AGGREGATION_RULES = {
  // Daily aggregations
  daily: {
    scenarios: ['totalAttempts', 'completionRate', 'averageTime'],
    users: ['activeUsers', 'newUsers', 'returnUsers'],
    engagement: ['averageSessionDuration', 'scenariosPerUser'],
    quality: ['averageRating', 'reportCount'],
  },

  // Weekly aggregations
  weekly: {
    trends: ['userGrowth', 'engagementTrends', 'contentPerformance'],
    cohorts: ['newUserRetention', 'userLifetimeValue'],
    content: ['topScenarios', 'categoryPreferences'],
  },

  // Monthly aggregations
  monthly: {
    insights: ['frameworkEvolution', 'demographicShifts', 'contentGaps'],
    optimization: ['conversionOptimization', 'personalizationEffectiveness'],
    research: ['anonymizedInsights', 'academicMetrics'],
  },
};

/**
 * Privacy Protection Rules
 * Ensures all system metrics respect user privacy
 */
export const PRIVACY_RULES = {
  // Data minimization
  dataRetention: {
    rawSessions: '90 days',
    aggregatedDaily: '2 years',
    aggregatedWeekly: '5 years',
    aggregatedMonthly: 'indefinite',
  },

  // Anonymization thresholds
  anonymization: {
    minimumSampleSize: 10, // don't report groups smaller than 10
    noiseAddition: 0.02, // add 2% random noise to prevent inference
    roundingPrecision: 1, // round percentages to 1 decimal
  },

  // Excluded data points
  excludeFromAnalytics: [
    'personallyIdentifiableInformation',
    'specificUserBehaviors', // only aggregated patterns
    'sensitivePersonalData',
    'unencryptedUserContent',
  ],

  // Consent requirements
  consentRequired: {
    detailedAnalytics: true, // requires explicit opt-in
    researchDataSharing: true,
    benchmarkingData: false, // anonymous platform metrics ok
  },
};

/**
 * Export interfaces for TypeScript compatibility
 */
export const METRIC_TYPES = {
  SCENARIO_PERFORMANCE: 'scenarioPerformance',
  FRAMEWORK_ENGAGEMENT: 'frameworkEngagement',
  CATEGORY_ANALYTICS: 'categoryAnalytics',
  PLATFORM_METRICS: 'platformMetrics',
  SESSION_TRACKING: 'sessionTracking',
  EXPERIMENT_RESULTS: 'experimentResults',
  CONTENT_OPTIMIZATION: 'contentOptimization',
};

/**
 * Constants for metric calculations
 */
const METRIC_CONSTANTS = {
  MAX_SESSION_TIME_MINUTES: 10,
  SECONDS_PER_MINUTE: 60,
  COMPLETION_WEIGHT_FACTOR: 0.3,
  THOUGHTFULNESS_THRESHOLD_SECONDS: 30,
  ENGAGEMENT_FACTORS_COUNT: 3,
  MAX_RATING_SCALE: 5,
  PERCENTAGE_MULTIPLIER: 100,
  QUALITY_RATING_WEIGHT: 0.4,
  QUALITY_COMPLETION_WEIGHT: 0.4,
  QUALITY_REPORT_WEIGHT: 0.2,
  REPORT_COUNT_THRESHOLD: 100,
  PLACEHOLDER_AFFINITY_SCORE: 85,
};

/**
 * Utility functions for metric calculations
 */
export const METRIC_CALCULATIONS = {
  // Engagement Score: composite metric from multiple factors
  engagementScore: sessionData => {
    const maxSessionSeconds =
      METRIC_CONSTANTS.MAX_SESSION_TIME_MINUTES *
      METRIC_CONSTANTS.SECONDS_PER_MINUTE;
    const timeWeight = Math.min(sessionData.duration / maxSessionSeconds, 1);
    const completionWeight =
      sessionData.scenariosCompleted.length *
      METRIC_CONSTANTS.COMPLETION_WEIGHT_FACTOR;
    const thoughtfulnessWeight = Math.min(
      sessionData.averageDecisionTime /
        METRIC_CONSTANTS.THOUGHTFULNESS_THRESHOLD_SECONDS,
      1
    );

    return Math.round(
      ((timeWeight + completionWeight + thoughtfulnessWeight) /
        METRIC_CONSTANTS.ENGAGEMENT_FACTORS_COUNT) *
        METRIC_CONSTANTS.PERCENTAGE_MULTIPLIER
    );
  },

  // Quality Score: scenario quality based on user feedback
  qualityScore: scenarioData => {
    const ratingScore =
      scenarioData.averageRating / METRIC_CONSTANTS.MAX_RATING_SCALE;
    const completionScore =
      scenarioData.completionRate / METRIC_CONSTANTS.PERCENTAGE_MULTIPLIER;
    const reportPenalty = Math.max(
      0,
      1 - scenarioData.reportCount / METRIC_CONSTANTS.REPORT_COUNT_THRESHOLD
    );

    return Math.round(
      (ratingScore * METRIC_CONSTANTS.QUALITY_RATING_WEIGHT +
        completionScore * METRIC_CONSTANTS.QUALITY_COMPLETION_WEIGHT +
        reportPenalty * METRIC_CONSTANTS.QUALITY_REPORT_WEIGHT) *
        METRIC_CONSTANTS.PERCENTAGE_MULTIPLIER
    );
  },

  // Framework Affinity: how well a framework matches user behavior
  frameworkAffinity: (_userBehavior, _frameworkProfile) => {
    // Implementation would compare user decision patterns to framework predictions
    // Returns 0-100 score of how well user aligns with framework
    return METRIC_CONSTANTS.PLACEHOLDER_AFFINITY_SCORE; // Placeholder
  },
};
