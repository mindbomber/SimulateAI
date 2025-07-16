/**
 * System Metadata Collector
 * Collects and processes system-level analytics data for optimization and insights
 */

import { 
  METRIC_CALCULATIONS, 
  METRIC_TYPES,
  PRIVACY_RULES 
} from '../data/system-metadata-schema.js';

/**
 * Constants for system metadata collection
 */
const SYSTEM_CONSTANTS = {
  BATCH_SIZE: 10,
  BATCH_TIMEOUT_MS: 30000, // 30 seconds
  MAX_LOCAL_ENTRIES: 1000,
  NOISE_RANDOM_OFFSET: 0.5,
  NOISE_MULTIPLIER: 2,
  DECIMAL_PRECISION: 10,
  BASE36: 36,
  SUBSTRING_START: 2,
  HASH_LENGTH: 16,
  MILLISECONDS_TO_SECONDS: 1000,
  SECONDS_TO_MINUTES: 60,
  MIN_PATH_LENGTH: 3,
  EXPLORATORY_THRESHOLD: 0.7,
  MIXED_THRESHOLD: 0.4,
  MAX_CONTENT_PREFERENCES: 3,
  SCROLL_DEBOUNCE_MS: 100,
};

export class SystemMetadataCollector {
  constructor(firebaseService = null) {
    this.firebaseService = firebaseService;
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: new Date(),
      scenariosViewed: [],
      scenariosCompleted: [],
      scenariosAbandoned: [],
      navigationPath: [],
      interactions: [],
      deviceInfo: this.getDeviceInfo(),
    };
    
    // Performance tracking
    this.performanceMetrics = {
      loadTimes: [],
      errors: [],
      interactionTimes: [],
    };
    
    // Batch processing for efficiency
    this.batchQueue = [];
    this.batchTimeout = null;
    this.BATCH_SIZE = SYSTEM_CONSTANTS.BATCH_SIZE;
    this.BATCH_TIMEOUT_MS = SYSTEM_CONSTANTS.BATCH_TIMEOUT_MS;
    
    this.init();
  }

  /**
   * Initialize the system metadata collector
   */
  init() {
    this.startSession();
    this.setupEventListeners();
    this.startPerformanceMonitoring();
    
    // Set up periodic data flushing
    setInterval(() => this.flushBatch(), this.BATCH_TIMEOUT_MS);
    
    // Clean up on page unload
    window.addEventListener('beforeunload', () => this.endSession());
  }

  /**
   * Track scenario performance metrics
   */
  async trackScenarioPerformance(scenarioData) {
    const {
      scenarioId,
      categoryId,
      action, // 'view', 'start', 'complete', 'abandon', 'rate'
      metadata = {}
    } = scenarioData;

    const performanceMetric = {
      type: METRIC_TYPES.SCENARIO_PERFORMANCE,
      scenarioId,
      categoryId,
      action,
      timestamp: new Date(),
      sessionId: this.sessionData.sessionId,
      userId: this.getAnonymizedUserId(),
      metadata: {
        ...metadata,
        deviceType: this.sessionData.deviceInfo.type,
        userAgent: this.sessionData.deviceInfo.userAgent,
      },
    };

    // Update session tracking
    switch (action) {
      case 'view':
        this.sessionData.scenariosViewed.push({
          scenarioId,
          timestamp: new Date(),
          timeSpent: 0, // Will be updated when user leaves
        });
        break;
      case 'complete':
        this.sessionData.scenariosCompleted.push({
          scenarioId,
          timestamp: new Date(),
          completionTime: metadata.completionTime || 0,
          rating: metadata.rating,
        });
        break;
      case 'abandon':
        this.sessionData.scenariosAbandoned.push({
          scenarioId,
          timestamp: new Date(),
          timeSpent: metadata.timeSpent || 0,
          stage: metadata.stage || 'unknown',
        });
        break;
    }

    this.addToBatch(performanceMetric);
  }

  /**
   * Track philosophical framework engagement
   */
  async trackFrameworkEngagement(frameworkData) {
    const {
      frameworkId,
      action, // 'select', 'change', 'apply', 'conflict'
      scenarioId,
      metadata = {}
    } = frameworkData;

    const engagementMetric = {
      type: METRIC_TYPES.FRAMEWORK_ENGAGEMENT,
      frameworkId,
      action,
      scenarioId,
      timestamp: new Date(),
      sessionId: this.sessionData.sessionId,
      userId: this.getAnonymizedUserId(),
      metadata: {
        ...metadata,
        decisionTime: metadata.decisionTime || 0,
        confidenceLevel: metadata.confidenceLevel,
        conflictResolution: metadata.conflictResolution,
      },
    };

    this.addToBatch(engagementMetric);
  }

  /**
   * Track user navigation and engagement patterns
   */
  trackNavigation(navigationData) {
    const {
      from,
      to,
      action, // 'click', 'scroll', 'search', 'filter'
      metadata = {}
    } = navigationData;

    this.sessionData.navigationPath.push({
      from,
      to,
      action,
      timestamp: new Date(),
      metadata,
    });

    // Track for session analytics
    const navigationMetric = {
      type: METRIC_TYPES.SESSION_TRACKING,
      action: 'navigation',
      from,
      to,
      timestamp: new Date(),
      sessionId: this.sessionData.sessionId,
      metadata,
    };

    this.addToBatch(navigationMetric);
  }

  /**
   * Track user interactions for UX optimization
   */
  trackInteraction(interactionData) {
    const {
      element,
      action, // 'click', 'hover', 'focus', 'scroll'
      duration = 0,
      metadata = {}
    } = interactionData;

    const interaction = {
      element,
      action,
      duration,
      timestamp: new Date(),
      metadata,
    };

    this.sessionData.interactions.push(interaction);
    this.performanceMetrics.interactionTimes.push(duration);

    // Add to batch for analysis
    const interactionMetric = {
      type: METRIC_TYPES.SESSION_TRACKING,
      action: 'interaction',
      element,
      interactionType: action,
      duration,
      timestamp: new Date(),
      sessionId: this.sessionData.sessionId,
      metadata,
    };

    this.addToBatch(interactionMetric);
  }

  /**
   * Track platform-wide metrics
   */
  async updatePlatformMetrics(updateType, data = {}) {
    const platformMetric = {
      type: METRIC_TYPES.PLATFORM_METRICS,
      updateType, // 'user_registration', 'content_creation', 'system_performance'
      data,
      timestamp: new Date(),
      source: 'system_collector',
    };

    this.addToBatch(platformMetric);
  }

  /**
   * Performance monitoring
   */
  startPerformanceMonitoring() {
    // Monitor page load times
    if (window.performance && window.performance.timing) {
      const loadTime = window.performance.timing.loadEventEnd - 
                      window.performance.timing.navigationStart;
      this.performanceMetrics.loadTimes.push(loadTime);
    }

    // Monitor errors
    window.addEventListener('error', (event) => {
      this.performanceMetrics.errors.push({
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        timestamp: new Date(),
      });
    });

    // Monitor unhandled promise rejections
    window.addEventListener('unhandledrejection', (event) => {
      this.performanceMetrics.errors.push({
        message: 'Unhandled Promise Rejection',
        reason: event.reason,
        timestamp: new Date(),
      });
    });
  }

  /**
   * Calculate real-time insights
   */
  calculateEngagementInsights() {
    const currentTime = new Date();
    const sessionDuration = currentTime - this.sessionData.startTime;
    
    return {
      sessionDuration: Math.round(sessionDuration / 1000), // seconds
      scenariosViewed: this.sessionData.scenariosViewed.length,
      scenariosCompleted: this.sessionData.scenariosCompleted.length,
      completionRate: this.sessionData.scenariosViewed.length > 0 ? 
        (this.sessionData.scenariosCompleted.length / this.sessionData.scenariosViewed.length * 100) : 0,
      averageDecisionTime: this.calculateAverageDecisionTime(),
      engagementScore: this.calculateEngagementScore(),
      navigationPattern: this.analyzeNavigationPattern(),
    };
  }

  /**
   * Generate anonymized insights for research
   */
  generateAnonymizedInsights() {
    const insights = this.calculateEngagementInsights();
    
    // Apply privacy protection
    return this.applyPrivacyProtection({
      sessionMetrics: {
        duration: insights.sessionDuration,
        engagementScore: insights.engagementScore,
        completionRate: Math.round(insights.completionRate),
        behaviorPattern: insights.navigationPattern,
      },
      performanceMetrics: {
        averageLoadTime: this.calculateAverageLoadTime(),
        errorCount: this.performanceMetrics.errors.length,
        interactionFrequency: this.calculateInteractionFrequency(),
      },
      contentPreferences: this.analyzeContentPreferences(),
      timestamp: new Date(),
    });
  }

  /**
   * Apply privacy protection rules
   */
  applyPrivacyProtection(data) {
    // Add noise to prevent inference attacks
    const addNoise = (value, noiseLevel = PRIVACY_RULES.anonymization.noiseAddition) => {
      const noise = (Math.random() - SYSTEM_CONSTANTS.NOISE_RANDOM_OFFSET) * 
                   SYSTEM_CONSTANTS.NOISE_MULTIPLIER * noiseLevel * value;
      return Math.round((value + noise) * SYSTEM_CONSTANTS.DECIMAL_PRECISION) / SYSTEM_CONSTANTS.DECIMAL_PRECISION;
    };

    // Apply noise to numeric values
    const protectedData = { ...data };
    if (protectedData.sessionMetrics) {
      protectedData.sessionMetrics.duration = addNoise(protectedData.sessionMetrics.duration);
      protectedData.sessionMetrics.engagementScore = addNoise(protectedData.sessionMetrics.engagementScore);
    }

    // Remove identifying information
    delete protectedData.userId;
    delete protectedData.sessionId;
    delete protectedData.deviceInfo;

    return protectedData;
  }

  /**
   * Batch processing for efficient data handling
   */
  addToBatch(metric) {
    this.batchQueue.push(metric);
    
    if (this.batchQueue.length >= this.BATCH_SIZE) {
      this.flushBatch();
    } else if (!this.batchTimeout) {
      this.batchTimeout = setTimeout(() => this.flushBatch(), this.BATCH_TIMEOUT_MS);
    }
  }

  /**
   * Flush batch queue to storage
   */
  async flushBatch() {
    if (this.batchQueue.length === 0) return;

    const batch = [...this.batchQueue];
    this.batchQueue = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }

    try {
      if (this.firebaseService) {
        await this.firebaseService.addSystemMetricsBatch(batch);
      } else {
        // Fallback to local storage for development
        this.storeBatchLocally(batch);
      }
    } catch (error) {
      // Silent fail for metrics - don't interrupt user experience
      // Could send to error tracking service in production
      if (this.firebaseService?.logError) {
        this.firebaseService.logError('Failed to flush metrics batch', error);
      }
      // Re-queue failed batch items
      this.batchQueue.unshift(...batch);
    }
  }

  /**
   * Store batch locally for development/testing
   */
  storeBatchLocally(batch) {
    const existingData = JSON.parse(localStorage.getItem('systemMetrics') || '[]');
    existingData.push(...batch);
    
    // Keep only last entries to prevent storage overflow
    if (existingData.length > SYSTEM_CONSTANTS.MAX_LOCAL_ENTRIES) {
      existingData.splice(0, existingData.length - SYSTEM_CONSTANTS.MAX_LOCAL_ENTRIES);
    }
    
    localStorage.setItem('systemMetrics', JSON.stringify(existingData));
  }

  /**
   * Helper methods
   */
  generateSessionId() {
    const randomPart = Math.random().toString(SYSTEM_CONSTANTS.BASE36).substring(SYSTEM_CONSTANTS.SUBSTRING_START);
    const timestampPart = Date.now().toString(SYSTEM_CONSTANTS.BASE36);
    return `sess_${randomPart}${timestampPart}`;
  }

  getAnonymizedUserId() {
    // Create a session-specific hash that can't be traced back to user
    const hashInput = this.sessionData.sessionId + new Date().toDateString();
    const encodedHash = btoa(hashInput).substring(0, SYSTEM_CONSTANTS.HASH_LENGTH);
    return `anon_${encodedHash}`;
  }

  getDeviceInfo() {
    return {
      type: this.detectDeviceType(),
      userAgent: navigator.userAgent,
      language: navigator.language,
      platform: navigator.platform,
      cookiesEnabled: navigator.cookieEnabled,
      onlineStatus: navigator.onLine,
    };
  }

  detectDeviceType() {
    if (/Mobi|Android/i.test(navigator.userAgent)) return 'mobile';
    if (/Tablet|iPad/i.test(navigator.userAgent)) return 'tablet';
    return 'desktop';
  }

  calculateAverageDecisionTime() {
    const decisions = this.sessionData.interactions.filter(i => 
      i.action === 'click' && i.element.includes('decision')
    );
    if (decisions.length === 0) return 0;
    
    const totalTime = decisions.reduce((sum, d) => sum + (d.duration || 0), 0);
    return Math.round(totalTime / decisions.length);
  }

  calculateEngagementScore() {
    return METRIC_CALCULATIONS.engagementScore({
      duration: (new Date() - this.sessionData.startTime) / 1000,
      scenariosCompleted: this.sessionData.scenariosCompleted,
      averageDecisionTime: this.calculateAverageDecisionTime(),
    });
  }

  calculateAverageLoadTime() {
    if (this.performanceMetrics.loadTimes.length === 0) return 0;
    const total = this.performanceMetrics.loadTimes.reduce((sum, time) => sum + time, 0);
    return Math.round(total / this.performanceMetrics.loadTimes.length);
  }

  calculateInteractionFrequency() {
    const sessionDurationMinutes = (new Date() - this.sessionData.startTime) / 
                                   SYSTEM_CONSTANTS.MILLISECONDS_TO_SECONDS / 
                                   SYSTEM_CONSTANTS.SECONDS_TO_MINUTES;
    return sessionDurationMinutes > 0 ? Math.round(this.sessionData.interactions.length / sessionDurationMinutes) : 0;
  }

  analyzeNavigationPattern() {
    const pathLength = this.sessionData.navigationPath.length;
    if (pathLength < SYSTEM_CONSTANTS.MIN_PATH_LENGTH) return 'exploratory';
    
    const uniquePages = new Set(this.sessionData.navigationPath.map(p => p.to)).size;
    const explorationRatio = uniquePages / pathLength;
    
    if (explorationRatio > SYSTEM_CONSTANTS.EXPLORATORY_THRESHOLD) return 'exploratory';
    if (explorationRatio > SYSTEM_CONSTANTS.MIXED_THRESHOLD) return 'mixed';
    return 'focused';
  }

  analyzeContentPreferences() {
    const categoryViews = {};
    this.sessionData.scenariosViewed.forEach(scenario => {
      const category = scenario.categoryId || 'unknown';
      categoryViews[category] = (categoryViews[category] || 0) + 1;
    });
    
    return Object.entries(categoryViews)
      .sort(([,a], [,b]) => b - a)
      .slice(0, SYSTEM_CONSTANTS.MAX_CONTENT_PREFERENCES)
      .map(([category]) => category);
  }

  setupEventListeners() {
    // Track page visibility changes
    document.addEventListener('visibilitychange', () => {
      this.trackInteraction({
        element: 'page',
        action: document.hidden ? 'blur' : 'focus',
        metadata: { visibility: document.visibilityState },
      });
    });

    // Track scroll behavior
    let scrollTimeout;
    window.addEventListener('scroll', () => {
      clearTimeout(scrollTimeout);
      scrollTimeout = setTimeout(() => {
        this.trackInteraction({
          element: 'page',
          action: 'scroll',
          metadata: { 
            scrollY: window.scrollY,
            scrollPercent: Math.round((window.scrollY / 
              (document.documentElement.scrollHeight - window.innerHeight)) * 100)
          },
        });
      }, SYSTEM_CONSTANTS.SCROLL_DEBOUNCE_MS);
    });
  }

  startSession() {
    this.trackInteraction({
      element: 'session',
      action: 'start',
      metadata: {
        referrer: document.referrer,
        deviceInfo: this.sessionData.deviceInfo,
      },
    });
  }

  endSession() {
    const sessionInsights = this.generateAnonymizedInsights();
    
    this.trackInteraction({
      element: 'session',
      action: 'end',
      metadata: sessionInsights,
    });

    // Flush any remaining data
    this.flushBatch();
  }

  /**
   * Public API for external components
   */
  getSessionInsights() {
    return this.calculateEngagementInsights();
  }

  exportLocalData() {
    const localData = JSON.parse(localStorage.getItem('systemMetrics') || '[]');
    return {
      sessionData: this.sessionData,
      performanceMetrics: this.performanceMetrics,
      storedMetrics: localData,
      insights: this.generateAnonymizedInsights(),
    };
  }
}

// Singleton pattern for global access
let systemCollector = null;

export const getSystemCollector = (firebaseService = null) => {
  if (!systemCollector) {
    systemCollector = new SystemMetadataCollector(firebaseService);
  }
  return systemCollector;
};

export default SystemMetadataCollector;
