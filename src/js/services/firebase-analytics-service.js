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
 * Firebase Analytics and Monitoring Service for SimulateAI
 * Real-time analytics, performance monitoring, and user insights
 */

import {
  getFirestore,
  doc,
  setDoc,
  addDoc,
  collection,
  query,
  where,
  orderBy,
  limit,
  getDocs,
  onSnapshot,
  serverTimestamp,
  writeBatch,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js";

import {
  getAnalytics,
  logEvent,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js";

import {
  getPerformance,
  trace,
} from "https://www.gstatic.com/firebasejs/10.7.1/firebase-performance.js";

/**
 * Analytics Configuration
 */
const ANALYTICS_CONFIG = {
  // Event tracking settings
  EVENTS: {
    STORAGE_UPLOAD: "storage_upload",
    STORAGE_DOWNLOAD: "storage_download",
    STORAGE_DELETE: "storage_delete",
    STORAGE_SHARE: "storage_share",
    AI_ANALYSIS: "ai_analysis",
    SECURITY_SCAN: "security_scan",
    SEARCH_PERFORMED: "search_performed",
    COLLECTION_CREATED: "collection_created",
    USER_SESSION: "user_session",
    ERROR_OCCURRED: "error_occurred",
  },

  // Metrics collection intervals
  COLLECTION_INTERVALS: {
    REAL_TIME: 5000, // 5 seconds
    PERFORMANCE: 60000, // 1 minute
    USAGE_STATS: 300000, // 5 minutes
    DAILY_SUMMARY: 86400000, // 24 hours
  },

  // Data retention periods
  RETENTION: {
    REAL_TIME_EVENTS: 7, // 7 days
    PERFORMANCE_METRICS: 30, // 30 days
    USAGE_ANALYTICS: 90, // 90 days
    SUMMARY_REPORTS: 365, // 1 year
  },

  // Batch processing settings
  BATCH: {
    MAX_EVENTS: 500,
    FLUSH_INTERVAL: 30000, // 30 seconds
    MAX_RETRIES: 3,
  },

  // Time constants
  TIME: {
    SECOND_MS: 1000,
    MINUTE_MS: 60000, // 60 * 1000
    HOUR_MS: 3600000, // 60 * 60 * 1000
    DAY_MS: 86400000, // 24 * 60 * 60 * 1000
    WEEK_MS: 604800000, // 7 * 24 * 60 * 60 * 1000
    MONTH_MS: 2592000000, // 30 * 24 * 60 * 60 * 1000
    QUARTER_MS: 7776000000, // 90 * 24 * 60 * 60 * 1000
    FIVE_MINUTES_MS: 300000, // 5 * 60 * 1000
  },

  // UI constants
  UI: {
    HOURS_END_OF_DAY: 23,
    MINUTES_END_OF_DAY: 59,
    SECONDS_END_OF_DAY: 59,
    MILLISECONDS_END_OF_DAY: 999,
    SESSION_ID_RADIX: 36,
    SESSION_ID_LENGTH: 9,
    TOP_ITEMS_LIMIT: 5,
  },
};

/**
 * Firebase Analytics and Monitoring Service
 */
export class FirebaseAnalyticsService {
  constructor(firebaseApp, hybridDataService = null) {
    this.app = firebaseApp;
    this.db = getFirestore(firebaseApp);
    this.analytics = getAnalytics(firebaseApp);
    this.performance = getPerformance(firebaseApp);
    this.hybridData = hybridDataService;

    // Check if we're in development mode
    this.isDevelopmentMode =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1";

    // Initialize internal state
    this.eventQueue = [];
    this.metricsCache = new Map();
    this.activeTraces = new Map();
    this.sessionData = {
      sessionId: this.generateSessionId(),
      startTime: Date.now(),
      userId: null,
      events: [],
    };

    // Start background processes only in production
    this.initializeMonitoring();
    this.startPerformanceTracking();

    // Only schedule analytics collection in production to prevent Firestore loops
    if (!this.isDevelopmentMode) {
      this.scheduleAnalyticsCollection();
    }
    // Analytics collection is disabled in development mode
  }

  /**
   * Initialize monitoring and event tracking
   */
  initializeMonitoring() {
    // Track page visibility changes
    document.addEventListener("visibilitychange", () => {
      this.trackEvent(ANALYTICS_CONFIG.EVENTS.USER_SESSION, {
        action: document.hidden ? "hidden" : "visible",
        timestamp: Date.now(),
      });
    });

    // Track errors
    window.addEventListener("error", (event) => {
      this.trackError(event.error, {
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
      });
    });

    // Track unhandled promise rejections
    window.addEventListener("unhandledrejection", (event) => {
      this.trackError(event.reason, {
        type: "unhandled_promise_rejection",
        promise: event.promise,
      });
    });

    // Start session tracking
    this.startSession();
  }

  /**
   * Start performance tracking
   */
  startPerformanceTracking() {
    // Track navigation timing
    if ("navigation" in performance) {
      const navTiming = performance.getEntriesByType("navigation")[0];
      if (navTiming) {
        this.trackPerformanceMetric("page_load", {
          loadTime: navTiming.loadEventEnd - navTiming.navigationStart,
          domContentLoaded:
            navTiming.domContentLoadedEventEnd - navTiming.navigationStart,
          firstPaint: this.getFirstPaint(),
          firstContentfulPaint: this.getFirstContentfulPaint(),
        });
      }
    }

    // Start continuous performance monitoring
    setInterval(() => {
      this.collectPerformanceMetrics();
    }, ANALYTICS_CONFIG.COLLECTION_INTERVALS.PERFORMANCE);
  }

  /**
   * Schedule analytics collection
   */
  scheduleAnalyticsCollection() {
    // Real-time event processing
    setInterval(() => {
      this.processEventQueue();
    }, ANALYTICS_CONFIG.COLLECTION_INTERVALS.REAL_TIME);

    // Usage statistics collection
    setInterval(() => {
      this.collectUsageStatistics();
    }, ANALYTICS_CONFIG.COLLECTION_INTERVALS.USAGE_STATS);

    // Daily summary generation
    setInterval(() => {
      this.generateDailySummary();
    }, ANALYTICS_CONFIG.COLLECTION_INTERVALS.DAILY_SUMMARY);
  }

  /**
   * Track storage events
   */
  async trackStorageEvent(eventType, data = {}) {
    const event = {
      type: eventType,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      userId: this.sessionData.userId,
      data: {
        ...data,
        userAgent: navigator.userAgent,
        url: window.location.href,
      },
    };

    // Add to queue for batch processing
    this.eventQueue.push(event);

    // Log to Firebase Analytics
    logEvent(this.analytics, eventType, {
      file_size: data.fileSize || 0,
      file_type: data.fileType || "unknown",
      operation_duration: data.duration || 0,
      success: data.success || true,
    });

    // Store detailed event in Firestore
    await this.storeEvent(event);

    return event;
  }

  /**
   * Track AI analysis events
   */
  async trackAIAnalysis(analysisType, data = {}) {
    const event = await this.trackStorageEvent(
      ANALYTICS_CONFIG.EVENTS.AI_ANALYSIS,
      {
        analysisType,
        confidence: data.confidence,
        processingTime: data.processingTime,
        tagsGenerated: data.tagsGenerated || 0,
        textExtracted: data.textExtracted ? data.textExtracted.length : 0,
        objectsDetected: data.objectsDetected || 0,
        ...data,
      },
    );

    // Update AI analytics aggregations
    await this.updateAIAnalytics(analysisType, data);

    return event;
  }

  /**
   * Track security events
   */
  async trackSecurityEvent(eventType, data = {}) {
    const event = await this.trackStorageEvent(
      ANALYTICS_CONFIG.EVENTS.SECURITY_SCAN,
      {
        securityEventType: eventType,
        threatLevel: data.threatLevel || "low",
        scanResult: data.scanResult || "passed",
        scanDuration: data.scanDuration || 0,
        ...data,
      },
    );

    // Immediately escalate high-threat events
    if (data.threatLevel === "high" || data.scanResult === "failed") {
      await this.escalateSecurityEvent(event);
    }

    return event;
  }

  /**
   * Track search and discovery events
   */
  async trackSearchEvent(query, results = {}) {
    return await this.trackStorageEvent(
      ANALYTICS_CONFIG.EVENTS.SEARCH_PERFORMED,
      {
        query: query.toLowerCase(),
        queryLength: query.length,
        resultsCount: results.totalFound || 0,
        searchDuration: results.duration || 0,
        relevanceScores: results.averageRelevance || 0,
        searchType: results.type || "standard",
      },
    );
  }

  /**
   * Track performance metrics
   */
  async trackPerformanceMetric(metricName, data = {}) {
    const metric = {
      name: metricName,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      userId: this.sessionData.userId,
      value: data.value || 0,
      unit: data.unit || "ms",
      metadata: data,
    };

    // Store in cache for real-time access
    this.metricsCache.set(`${metricName}_${Date.now()}`, metric);

    // Store in Firestore
    await this.storePerformanceMetric(metric);

    return metric;
  }

  /**
   * Track errors and exceptions
   */
  async trackError(error, context = {}) {
    const errorEvent = {
      type: ANALYTICS_CONFIG.EVENTS.ERROR_OCCURRED,
      timestamp: Date.now(),
      sessionId: this.sessionData.sessionId,
      userId: this.sessionData.userId,
      error: {
        message: error.message || "Unknown error",
        stack: error.stack || "No stack trace",
        name: error.name || "Error",
      },
      context,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Log to Firebase Analytics
    logEvent(this.analytics, ANALYTICS_CONFIG.EVENTS.ERROR_OCCURRED, {
      error_type: error.name || "Unknown",
      error_fatal: context.fatal || false,
    });

    // Store detailed error in Firestore
    await this.storeError(errorEvent);

    return errorEvent;
  }

  /**
   * Start Firebase Performance trace
   */
  startTrace(traceName) {
    const performanceTrace = trace(this.performance, traceName);
    performanceTrace.start();

    this.activeTraces.set(traceName, {
      trace: performanceTrace,
      startTime: Date.now(),
    });

    return traceName;
  }

  /**
   * Stop Firebase Performance trace
   */
  stopTrace(traceName, customAttributes = {}) {
    const traceData = this.activeTraces.get(traceName);
    if (!traceData) return null;

    const { trace: performanceTrace, startTime } = traceData;
    const duration = Date.now() - startTime;

    // Add custom attributes
    Object.entries(customAttributes).forEach(([key, value]) => {
      performanceTrace.putAttribute(key, String(value));
    });

    // Stop the trace
    performanceTrace.stop();
    this.activeTraces.delete(traceName);

    // Track custom performance metric
    this.trackPerformanceMetric(traceName, {
      value: duration,
      unit: "ms",
      ...customAttributes,
    });

    return duration;
  }

  /**
   * Get real-time analytics dashboard data
   */
  async getRealTimeAnalytics() {
    try {
      const now = Date.now();
      const oneHourAgo = now - ANALYTICS_CONFIG.TIME.HOUR_MS;

      // Get real-time events from last hour
      const eventsQuery = query(
        collection(this.db, "analytics_events"),
        where("timestamp", ">=", oneHourAgo),
        orderBy("timestamp", "desc"),
        limit(1000),
      );

      const eventsSnapshot = await getDocs(eventsQuery);
      const events = eventsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      // Aggregate real-time metrics
      const analytics = {
        realTime: {
          activeUsers: this.countActiveUsers(events),
          eventsPerMinute: this.calculateEventsPerMinute(events),
          topEvents: this.getTopEvents(events),
          errorRate: this.calculateErrorRate(events),
        },
        storage: await this.getStorageAnalytics(),
        performance: await this.getPerformanceAnalytics(),
        ai: await this.getAIAnalytics(),
        security: await this.getSecurityAnalytics(),
        generatedAt: now,
      };

      return { success: true, analytics };
    } catch (error) {
      await this.trackError(error, { context: "getRealTimeAnalytics" });
      return { success: false, error: error.message };
    }
  }

  /**
   * Get historical analytics data
   */
  async getHistoricalAnalytics(timeRange = "7d") {
    try {
      const { startTime, endTime } = this.parseTimeRange(timeRange);

      const [events, performanceMetrics, dailySummaries] = await Promise.all([
        this.getEventsByTimeRange(startTime, endTime),
        this.getPerformanceMetricsByTimeRange(startTime, endTime),
        this.getDailySummariesByTimeRange(startTime, endTime),
      ]);

      const analytics = {
        overview: this.calculateOverviewMetrics(events, performanceMetrics),
        trends: this.calculateTrends(dailySummaries),
        storage: this.aggregateStorageMetrics(events),
        users: this.aggregateUserMetrics(events),
        performance: this.aggregatePerformanceMetrics(performanceMetrics),
        ai: this.aggregateAIMetrics(events),
        security: this.aggregateSecurityMetrics(events),
        timeRange: { start: startTime, end: endTime },
      };

      return { success: true, analytics };
    } catch (error) {
      await this.trackError(error, { context: "getHistoricalAnalytics" });
      return { success: false, error: error.message };
    }
  }

  /**
   * Generate and store daily summary
   */
  async generateDailySummary(date = null) {
    try {
      const targetDate = date || new Date();
      const startOfDay = new Date(targetDate.setHours(0, 0, 0, 0)).getTime();
      const endOfDay = new Date(
        targetDate.setHours(
          ANALYTICS_CONFIG.UI.HOURS_END_OF_DAY,
          ANALYTICS_CONFIG.UI.MINUTES_END_OF_DAY,
          ANALYTICS_CONFIG.UI.SECONDS_END_OF_DAY,
          ANALYTICS_CONFIG.UI.MILLISECONDS_END_OF_DAY,
        ),
      ).getTime();

      // Get all events for the day
      const events = await this.getEventsByTimeRange(startOfDay, endOfDay);
      const performanceMetrics = await this.getPerformanceMetricsByTimeRange(
        startOfDay,
        endOfDay,
      );

      const summary = {
        date: targetDate.toISOString().split("T")[0],
        timestamp: Date.now(),
        overview: {
          totalEvents: events.length,
          uniqueUsers: new Set(events.map((e) => e.userId).filter(Boolean))
            .size,
          totalSessions: new Set(events.map((e) => e.sessionId)).size,
          averageSessionDuration: this.calculateAverageSessionDuration(events),
        },
        storage: {
          uploadsCount: events.filter(
            (e) => e.type === ANALYTICS_CONFIG.EVENTS.STORAGE_UPLOAD,
          ).length,
          downloadsCount: events.filter(
            (e) => e.type === ANALYTICS_CONFIG.EVENTS.STORAGE_DOWNLOAD,
          ).length,
          totalBytesProcessed: this.calculateTotalBytesProcessed(events),
          averageFileSize: this.calculateAverageFileSize(events),
        },
        ai: {
          analysesPerformed: events.filter(
            (e) => e.type === ANALYTICS_CONFIG.EVENTS.AI_ANALYSIS,
          ).length,
          averageConfidence: this.calculateAverageAIConfidence(events),
          topAnalysisTypes: this.getTopAnalysisTypes(events),
        },
        security: {
          scansPerformed: events.filter(
            (e) => e.type === ANALYTICS_CONFIG.EVENTS.SECURITY_SCAN,
          ).length,
          threatsDetected: events.filter(
            (e) =>
              e.type === ANALYTICS_CONFIG.EVENTS.SECURITY_SCAN &&
              e.data?.threatLevel === "high",
          ).length,
          scanSuccessRate: this.calculateScanSuccessRate(events),
        },
        performance: {
          averageResponseTime:
            this.calculateAverageResponseTime(performanceMetrics),
          errorRate: this.calculateErrorRate(events),
          topPerformanceIssues:
            this.getTopPerformanceIssues(performanceMetrics),
        },
        errors: {
          totalErrors: events.filter(
            (e) => e.type === ANALYTICS_CONFIG.EVENTS.ERROR_OCCURRED,
          ).length,
          topErrors: this.getTopErrors(events),
          errorsByType: this.groupErrorsByType(events),
        },
      };

      // Store daily summary only in production
      if (!this.isDevelopmentMode) {
        await setDoc(
          doc(this.db, "analytics_daily_summaries", summary.date),
          summary,
        );
      }

      return { success: true, summary };
    } catch (error) {
      await this.trackError(error, { context: "generateDailySummary" });
      return { success: false, error: error.message };
    }
  }

  /**
   * Set up real-time analytics listeners
   */
  setupRealtimeListeners(callback) {
    const listeners = [];

    // Listen to recent events
    const eventsQuery = query(
      collection(this.db, "analytics_events"),
      where(
        "timestamp",
        ">=",
        Date.now() - ANALYTICS_CONFIG.TIME.FIVE_MINUTES_MS,
      ), // Last 5 minutes
      orderBy("timestamp", "desc"),
    );

    const eventsListener = onSnapshot(eventsQuery, (snapshot) => {
      const events = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback({
        type: "events",
        data: events,
        timestamp: Date.now(),
      });
    });

    listeners.push(eventsListener);

    // Listen to performance metrics
    const metricsQuery = query(
      collection(this.db, "analytics_performance"),
      where(
        "timestamp",
        ">=",
        Date.now() - ANALYTICS_CONFIG.TIME.FIVE_MINUTES_MS,
      ),
      orderBy("timestamp", "desc"),
    );

    const metricsListener = onSnapshot(metricsQuery, (snapshot) => {
      const metrics = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));
      callback({
        type: "performance",
        data: metrics,
        timestamp: Date.now(),
      });
    });

    listeners.push(metricsListener);

    return listeners;
  }

  /**
   * Private helper methods
   */

  async storeEvent(event) {
    // Skip Firestore writes in development mode
    if (this.isDevelopmentMode) {
      return;
    }

    try {
      await addDoc(collection(this.db, "analytics_events"), {
        ...event,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      // Failed to store event - handled silently to prevent infinite loops
    }
  }

  async storePerformanceMetric(metric) {
    // Skip Firestore writes in development mode
    if (this.isDevelopmentMode) {
      return;
    }

    try {
      await addDoc(collection(this.db, "analytics_performance"), {
        ...metric,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      // Failed to store performance metric - handled silently
    }
  }

  async storeError(errorEvent) {
    // Skip Firestore writes in development mode
    if (this.isDevelopmentMode) {
      return;
    }

    try {
      await addDoc(collection(this.db, "analytics_errors"), {
        ...errorEvent,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      // Failed to store error - handled silently to prevent infinite error loops
    }
  }

  generateSessionId() {
    return `session_${Date.now()}_${Math.random().toString(ANALYTICS_CONFIG.UI.SESSION_ID_RADIX).substr(2, ANALYTICS_CONFIG.UI.SESSION_ID_LENGTH)}`;
  }

  startSession() {
    this.sessionData.startTime = Date.now();
    this.trackEvent(ANALYTICS_CONFIG.EVENTS.USER_SESSION, {
      action: "start",
      timestamp: this.sessionData.startTime,
    });
  }

  async processEventQueue() {
    if (this.eventQueue.length === 0) return;

    // Skip processing in development mode
    if (this.isDevelopmentMode) {
      this.eventQueue.length = 0; // Clear queue without processing
      return;
    }

    const eventsToProcess = this.eventQueue.splice(
      0,
      ANALYTICS_CONFIG.BATCH.MAX_EVENTS,
    );

    try {
      const batch = writeBatch(this.db);

      eventsToProcess.forEach((event) => {
        const docRef = doc(collection(this.db, "analytics_events"));
        batch.set(docRef, {
          ...event,
          timestamp: serverTimestamp(),
        });
      });

      await batch.commit();
    } catch (error) {
      // Re-add failed events to queue for retry
      this.eventQueue.unshift(...eventsToProcess);
      await this.trackError(error, { context: "processEventQueue" });
    }
  }

  async collectPerformanceMetrics() {
    const metrics = {
      memory: this.getMemoryUsage(),
      timing: this.getTimingMetrics(),
      network: this.getNetworkMetrics(),
      storage: await this.getStorageMetrics(),
    };

    Object.entries(metrics).forEach(([category, data]) => {
      Object.entries(data).forEach(([metric, value]) => {
        this.trackPerformanceMetric(`${category}_${metric}`, { value });
      });
    });
  }

  getMemoryUsage() {
    if ("memory" in performance) {
      return {
        usedJSHeapSize: performance.memory.usedJSHeapSize,
        totalJSHeapSize: performance.memory.totalJSHeapSize,
        jsHeapSizeLimit: performance.memory.jsHeapSizeLimit,
      };
    }
    return {};
  }

  getTimingMetrics() {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (!navigation) return {};

    return {
      domContentLoaded:
        navigation.domContentLoadedEventEnd - navigation.navigationStart,
      loadComplete: navigation.loadEventEnd - navigation.navigationStart,
      firstByte: navigation.responseStart - navigation.navigationStart,
      dnsLookup: navigation.domainLookupEnd - navigation.domainLookupStart,
    };
  }

  getNetworkMetrics() {
    const connection =
      navigator.connection ||
      navigator.mozConnection ||
      navigator.webkitConnection;
    if (!connection) return {};

    return {
      effectiveType: connection.effectiveType,
      downlink: connection.downlink,
      rtt: connection.rtt,
      saveData: connection.saveData,
    };
  }

  async getStorageMetrics() {
    if ("storage" in navigator && "estimate" in navigator.storage) {
      try {
        const estimate = await navigator.storage.estimate();
        return {
          usedStorage: estimate.usage || 0,
          availableStorage: estimate.quota || 0,
          storageUsagePercent: estimate.quota
            ? (estimate.usage / estimate.quota) * 100
            : 0,
        };
      } catch (error) {
        return {};
      }
    }
    return {};
  }

  getFirstPaint() {
    const paintEntries = performance.getEntriesByType("paint");
    const fpEntry = paintEntries.find((entry) => entry.name === "first-paint");
    return fpEntry ? fpEntry.startTime : 0;
  }

  getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType("paint");
    const fcpEntry = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint",
    );
    return fcpEntry ? fcpEntry.startTime : 0;
  }

  // Additional helper methods for analytics calculations
  countActiveUsers(events) {
    const fiveMinutesAgo = Date.now() - ANALYTICS_CONFIG.TIME.FIVE_MINUTES_MS;
    const recentEvents = events.filter((e) => e.timestamp >= fiveMinutesAgo);
    return new Set(recentEvents.map((e) => e.userId).filter(Boolean)).size;
  }

  calculateEventsPerMinute(events) {
    const oneMinuteAgo = Date.now() - ANALYTICS_CONFIG.TIME.MINUTE_MS;
    const recentEvents = events.filter((e) => e.timestamp >= oneMinuteAgo);
    return recentEvents.length;
  }

  getTopEvents(events) {
    const eventCounts = {};
    events.forEach((e) => {
      eventCounts[e.type] = (eventCounts[e.type] || 0) + 1;
    });

    return Object.entries(eventCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, ANALYTICS_CONFIG.UI.TOP_ITEMS_LIMIT)
      .map(([type, count]) => ({ type, count }));
  }

  calculateErrorRate(events) {
    const totalEvents = events.length;
    const errorEvents = events.filter(
      (e) => e.type === ANALYTICS_CONFIG.EVENTS.ERROR_OCCURRED,
    ).length;
    return totalEvents > 0 ? (errorEvents / totalEvents) * 100 : 0;
  }

  parseTimeRange(timeRange) {
    const now = Date.now();
    const ranges = {
      "1h": ANALYTICS_CONFIG.TIME.HOUR_MS,
      "24h": ANALYTICS_CONFIG.TIME.DAY_MS,
      "7d": ANALYTICS_CONFIG.TIME.WEEK_MS,
      "30d": ANALYTICS_CONFIG.TIME.MONTH_MS,
      "90d": ANALYTICS_CONFIG.TIME.QUARTER_MS,
    };

    const duration = ranges[timeRange] || ranges["7d"];
    return {
      startTime: now - duration,
      endTime: now,
    };
  }

  async getEventsByTimeRange(startTime, endTime) {
    const q = query(
      collection(this.db, "analytics_events"),
      where("timestamp", ">=", startTime),
      where("timestamp", "<=", endTime),
      orderBy("timestamp", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async getPerformanceMetricsByTimeRange(startTime, endTime) {
    const q = query(
      collection(this.db, "analytics_performance"),
      where("timestamp", ">=", startTime),
      where("timestamp", "<=", endTime),
      orderBy("timestamp", "desc"),
    );

    const snapshot = await getDocs(q);
    return snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
  }

  async trackEvent(eventType, data) {
    return await this.trackStorageEvent(eventType, data);
  }

  async collectUsageStatistics() {
    // Collect and aggregate usage statistics
    const stats = {
      timestamp: Date.now(),
      activeUsers: this.sessionData.userId ? 1 : 0,
      sessionDuration: Date.now() - this.sessionData.startTime,
      eventsInSession: this.sessionData.events.length,
      url: window.location.href,
      userAgent: navigator.userAgent,
    };

    // Skip Firestore writes in development mode
    if (!this.isDevelopmentMode) {
      await addDoc(collection(this.db, "analytics_usage_stats"), stats);
    }
  }

  // Placeholder methods for aggregation calculations
  async getStorageAnalytics() {
    return {};
  }
  async getPerformanceAnalytics() {
    return {};
  }
  async getAIAnalytics() {
    return {};
  }
  async getSecurityAnalytics() {
    return {};
  }
  async updateAIAnalytics() {
    return {};
  }
  async escalateSecurityEvent() {
    return {};
  }
  async getDailySummariesByTimeRange() {
    return [];
  }
  calculateOverviewMetrics() {
    return {};
  }
  calculateTrends() {
    return {};
  }
  aggregateStorageMetrics() {
    return {};
  }
  aggregateUserMetrics() {
    return {};
  }
  aggregatePerformanceMetrics() {
    return {};
  }
  aggregateAIMetrics() {
    return {};
  }
  aggregateSecurityMetrics() {
    return {};
  }
  calculateAverageSessionDuration() {
    return 0;
  }
  calculateTotalBytesProcessed() {
    return 0;
  }
  calculateAverageFileSize() {
    return 0;
  }
  calculateAverageAIConfidence() {
    return 0;
  }
  getTopAnalysisTypes() {
    return [];
  }
  calculateScanSuccessRate() {
    return 0;
  }
  calculateAverageResponseTime() {
    return 0;
  }
  getTopPerformanceIssues() {
    return [];
  }
  getTopErrors() {
    return [];
  }
  groupErrorsByType() {
    return {};
  }
}

export default FirebaseAnalyticsService;
