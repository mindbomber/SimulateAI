// Firebase Performance Monitoring Implementation for SimulateAI
// Comprehensive trace management with all the trace names

export class PerformanceTracing {
  constructor(firebaseService) {
    this.firebaseService = firebaseService;
    this.activeTraces = new Map();

    // Initialize automatic page load tracking
    this.initializePageLoadTracking();
  }

  /**
   * Predefined trace names for SimulateAI
   */
  static TRACE_NAMES = {
    // Application & Navigation
    APP_INITIALIZATION: 'app_initialization',
    PAGE_LOAD_HOME: 'page_load_home',
    PAGE_LOAD_SIMULATION: 'page_load_simulation',
    PAGE_LOAD_ANALYTICS: 'page_load_analytics',
    NAVIGATION_TRANSITION: 'navigation_transition',
    PWA_APP_LAUNCH: 'pwa_app_launch',
    SERVICE_WORKER_INIT: 'service_worker_init',

    // Authentication & Profile
    AUTH_SIGN_IN: 'auth_sign_in',
    AUTH_SIGN_UP: 'auth_sign_up',
    AUTH_SIGN_OUT: 'auth_sign_out',
    AUTH_PROFILE_LOAD: 'auth_profile_load',
    AUTH_GOOGLE_SIGNIN: 'auth_google_signin',
    AUTH_FACEBOOK_SIGNIN: 'auth_facebook_signin',
    PROFILE_PICTURE_UPLOAD: 'profile_picture_upload',

    // Simulation & Content
    SIMULATION_LOAD: 'simulation_load',
    SIMULATION_START: 'simulation_start',
    SIMULATION_DECISION: 'simulation_decision',
    SIMULATION_COMPLETE: 'simulation_complete',
    SCENARIO_GENERATION: 'scenario_generation',
    ETHICS_ANALYSIS: 'ethics_analysis',
    CONTENT_RECOMMENDATION: 'content_recommendation',

    // Data Operations
    FIRESTORE_USER_CREATE: 'firestore_user_create',
    FIRESTORE_DATA_SYNC: 'firestore_data_sync',
    DATA_CONNECT_QUERY: 'data_connect_query',
    HYBRID_DATA_OPERATION: 'hybrid_data_operation',
    CACHE_OPERATION: 'cache_operation',
    OFFLINE_SYNC: 'offline_sync',

    // File & Storage
    FILE_UPLOAD: 'file_upload',
    FILE_DOWNLOAD: 'file_download',
    IMAGE_PROCESSING: 'image_processing',
    AI_CONTENT_ANALYSIS: 'ai_content_analysis',
    MALWARE_SCAN: 'malware_scan',
    STORAGE_BACKUP: 'storage_backup',

    // AI & ML Operations
    AI_IMAGE_ANALYSIS: 'ai_image_analysis',
    AI_TEXT_ANALYSIS: 'ai_text_analysis',
    AI_SENTIMENT_ANALYSIS: 'ai_sentiment_analysis',
    AI_RECOMMENDATION: 'ai_recommendation',
    ML_MODEL_INFERENCE: 'ml_model_inference',
    ETHICS_SCORING: 'ethics_scoring',

    // Analytics & Reporting
    ANALYTICS_QUERY: 'analytics_query',
    REPORT_GENERATION: 'report_generation',
    DASHBOARD_LOAD: 'dashboard_load',
    CHART_RENDERING: 'chart_rendering',
    EXPORT_DATA: 'export_data',
    REAL_TIME_UPDATES: 'real_time_updates',

    // Forum & Community
    FORUM_POST_LOAD: 'forum_post_load',
    FORUM_POST_CREATE: 'forum_post_create',
    COMMENT_THREAD_LOAD: 'comment_thread_load',
    USER_INTERACTION: 'user_interaction',
    NOTIFICATION_DELIVERY: 'notification_delivery',

    // Security & Performance
    SECURITY_VALIDATION: 'security_validation',
    APP_CHECK_TOKEN: 'app_check_token',
    RECAPTCHA_VERIFICATION: 'recaptcha_verification',
    PERMISSION_CHECK: 'permission_check',
    RATE_LIMIT_CHECK: 'rate_limit_check',

    // PWA Specific
    PWA_INSTALL: 'pwa_install',
    PWA_CACHE_UPDATE: 'pwa_cache_update',
    PWA_OFFLINE_MODE: 'pwa_offline_mode',
    PWA_BACKGROUND_SYNC: 'pwa_background_sync',
    PWA_PUSH_NOTIFICATION: 'pwa_push_notification',
  };

  /**
   * Initialize automatic page load tracking
   */
  initializePageLoadTracking() {
    // Track initial page load
    if (document.readyState === 'loading') {
      const pageLoadTrace = this.startTrace(
        PerformanceTracing.TRACE_NAMES.PAGE_LOAD_HOME
      );

      window.addEventListener('load', () => {
        this.stopTrace(pageLoadTrace, {
          page_type: this.getPageType(),
          load_source: 'initial',
          user_agent: navigator.userAgent.substring(0, 100),
        });
      });
    }

    // Track navigation transitions
    this.trackNavigationChanges();
  }

  /**
   * Start a performance trace
   */
  startTrace(traceName, customAttributes = {}) {
    try {
      const traceId = this.firebaseService.startPerformanceTrace(traceName);

      this.activeTraces.set(traceId, {
        name: traceName,
        startTime: Date.now(),
        attributes: customAttributes,
      });

      return traceId;
    } catch (error) {
      console.warn(`Failed to start trace ${traceName}:`, error);
      return null;
    }
  }

  /**
   * Stop a performance trace
   */
  stopTrace(traceId, additionalAttributes = {}) {
    if (!traceId || !this.activeTraces.has(traceId)) {
      return null;
    }

    try {
      const traceData = this.activeTraces.get(traceId);
      const allAttributes = {
        ...traceData.attributes,
        ...additionalAttributes,
        duration: Date.now() - traceData.startTime,
      };

      const duration = this.firebaseService.stopPerformanceTrace(
        traceId,
        allAttributes
      );
      this.activeTraces.delete(traceId);

      return duration;
    } catch (error) {
      console.warn(`Failed to stop trace ${traceId}:`, error);
      return null;
    }
  }

  /**
   * High-level tracking methods for SimulateAI features
   */

  // Authentication tracking
  async trackAuthSignIn(provider = 'email') {
    const traceId = this.startTrace(
      PerformanceTracing.TRACE_NAMES.AUTH_SIGN_IN,
      {
        auth_provider: provider,
      }
    );

    return {
      complete: (success, error = null) => {
        this.stopTrace(traceId, {
          success: success.toString(),
          error_type: error?.name || 'none',
          provider,
        });
      },
    };
  }

  // Simulation tracking
  async trackSimulationFlow(scenarioId, userLevel = 'unknown') {
    const loadTrace = this.startTrace(
      PerformanceTracing.TRACE_NAMES.SIMULATION_LOAD,
      {
        scenario_id: scenarioId,
        user_level: userLevel,
      }
    );

    return {
      loaded: () => {
        this.stopTrace(loadTrace, { scenario_id: scenarioId });
        return this.startTrace(
          PerformanceTracing.TRACE_NAMES.SIMULATION_START,
          {
            scenario_id: scenarioId,
          }
        );
      },

      decision: decisionId => {
        return this.startTrace(
          PerformanceTracing.TRACE_NAMES.SIMULATION_DECISION,
          {
            scenario_id: scenarioId,
            decision_id: decisionId,
          }
        );
      },

      complete: (startTrace, decisions = [], ethicsScore = null) => {
        this.stopTrace(startTrace, {
          decisions_count: decisions.length,
          ethics_score: ethicsScore?.toString() || 'unknown',
          completion_type: 'finished',
        });
      },
    };
  }

  // File upload tracking
  async trackFileUpload(fileType, fileSize) {
    const traceId = this.startTrace(
      PerformanceTracing.TRACE_NAMES.FILE_UPLOAD,
      {
        file_type: fileType,
        file_size: fileSize.toString(),
      }
    );

    return {
      processing: () => {
        return this.startTrace(
          PerformanceTracing.TRACE_NAMES.IMAGE_PROCESSING,
          {
            file_type: fileType,
          }
        );
      },

      aiAnalysis: () => {
        return this.startTrace(
          PerformanceTracing.TRACE_NAMES.AI_CONTENT_ANALYSIS,
          {
            file_type: fileType,
          }
        );
      },

      complete: (success, error = null) => {
        this.stopTrace(traceId, {
          success: success.toString(),
          error_type: error?.name || 'none',
        });
      },
    };
  }

  // Analytics dashboard tracking
  async trackDashboardLoad(dashboardType = 'main') {
    const traceId = this.startTrace(
      PerformanceTracing.TRACE_NAMES.DASHBOARD_LOAD,
      {
        dashboard_type: dashboardType,
      }
    );

    return {
      queryStarted: queryType => {
        return this.startTrace(PerformanceTracing.TRACE_NAMES.ANALYTICS_QUERY, {
          query_type: queryType,
          dashboard_type: dashboardType,
        });
      },

      chartRendering: chartType => {
        return this.startTrace(PerformanceTracing.TRACE_NAMES.CHART_RENDERING, {
          chart_type: chartType,
        });
      },

      complete: (chartsCount = 0, dataPoints = 0) => {
        this.stopTrace(traceId, {
          charts_count: chartsCount.toString(),
          data_points: dataPoints.toString(),
        });
      },
    };
  }

  // Forum interaction tracking
  async trackForumActivity(activityType) {
    const traceName =
      activityType === 'create'
        ? PerformanceTracing.TRACE_NAMES.FORUM_POST_CREATE
        : PerformanceTracing.TRACE_NAMES.FORUM_POST_LOAD;

    const traceId = this.startTrace(traceName, {
      activity_type: activityType,
    });

    return {
      complete: (postsCount = 1, commentsCount = 0) => {
        this.stopTrace(traceId, {
          posts_count: postsCount.toString(),
          comments_count: commentsCount.toString(),
        });
      },
    };
  }

  // AI/ML operations tracking
  async trackAIOperation(operationType, inputType = 'text') {
    const traceMap = {
      image_analysis: PerformanceTracing.TRACE_NAMES.AI_IMAGE_ANALYSIS,
      text_analysis: PerformanceTracing.TRACE_NAMES.AI_TEXT_ANALYSIS,
      sentiment_analysis: PerformanceTracing.TRACE_NAMES.AI_SENTIMENT_ANALYSIS,
      recommendation: PerformanceTracing.TRACE_NAMES.AI_RECOMMENDATION,
      ethics_scoring: PerformanceTracing.TRACE_NAMES.ETHICS_SCORING,
    };

    const traceName =
      traceMap[operationType] ||
      PerformanceTracing.TRACE_NAMES.ML_MODEL_INFERENCE;
    const traceId = this.startTrace(traceName, {
      operation_type: operationType,
      input_type: inputType,
    });

    return {
      complete: (confidence = null, resultCount = 1, error = null) => {
        this.stopTrace(traceId, {
          confidence_score: confidence?.toString() || 'unknown',
          result_count: resultCount.toString(),
          success: (!error).toString(),
          error_type: error?.name || 'none',
        });
      },
    };
  }

  // PWA operations tracking
  async trackPWAOperation(operationType) {
    const traceMap = {
      install: PerformanceTracing.TRACE_NAMES.PWA_INSTALL,
      cache_update: PerformanceTracing.TRACE_NAMES.PWA_CACHE_UPDATE,
      offline_mode: PerformanceTracing.TRACE_NAMES.PWA_OFFLINE_MODE,
      background_sync: PerformanceTracing.TRACE_NAMES.PWA_BACKGROUND_SYNC,
      push_notification: PerformanceTracing.TRACE_NAMES.PWA_PUSH_NOTIFICATION,
    };

    const traceName = traceMap[operationType];
    if (!traceName) return null;

    const traceId = this.startTrace(traceName, {
      operation_type: operationType,
    });

    return {
      complete: (success = true, itemsProcessed = 0) => {
        this.stopTrace(traceId, {
          success: success.toString(),
          items_processed: itemsProcessed.toString(),
        });
      },
    };
  }

  /**
   * Utility methods
   */
  getPageType() {
    const path = window.location.pathname;
    if (path === '/' || path.includes('index')) return 'home';
    if (path.includes('simulation')) return 'simulation';
    if (path.includes('analytics')) return 'analytics';
    if (path.includes('forum')) return 'forum';
    if (path.includes('profile')) return 'profile';
    return 'other';
  }

  trackNavigationChanges() {
    let currentPage = this.getPageType();

    // Track navigation using history API
    const originalPushState = history.pushState;
    const originalReplaceState = history.replaceState;

    const trackNavigation = () => {
      const newPage = this.getPageType();
      if (newPage !== currentPage) {
        const traceId = this.startTrace(
          PerformanceTracing.TRACE_NAMES.NAVIGATION_TRANSITION,
          {
            from_page: currentPage,
            to_page: newPage,
          }
        );

        setTimeout(() => {
          this.stopTrace(traceId, {
            navigation_type: 'spa',
          });
        }, 100);

        currentPage = newPage;
      }
    };

    history.pushState = function (...args) {
      originalPushState.apply(history, args);
      trackNavigation();
    };

    history.replaceState = function (...args) {
      originalReplaceState.apply(history, args);
      trackNavigation();
    };

    window.addEventListener('popstate', trackNavigation);
  }

  /**
   * Get performance summary
   */
  getActiveTraces() {
    return Array.from(this.activeTraces.entries()).map(([id, data]) => ({
      id,
      name: data.name,
      duration: Date.now() - data.startTime,
      attributes: data.attributes,
    }));
  }

  /**
   * Clean up old traces (safety measure)
   */
  cleanupOldTraces() {
    const maxAge = 5 * 60 * 1000; // 5 minutes
    const now = Date.now();

    for (const [id, data] of this.activeTraces.entries()) {
      if (now - data.startTime > maxAge) {
        console.warn(`Force stopping old trace: ${data.name}`);
        this.stopTrace(id, { force_stopped: 'true' });
      }
    }
  }
}

// Usage examples:
/*
// Initialize
const performanceTracing = new PerformanceTracing(firebaseService);

// Track authentication
const authTracker = await performanceTracing.trackAuthSignIn('google');
// ... auth logic ...
authTracker.complete(true);

// Track simulation
const simTracker = await performanceTracing.trackSimulationFlow('ethics_scenario_001', 'advanced');
const startTrace = simTracker.loaded();
const decisionTrace = simTracker.decision('privacy_choice');
// ... simulation logic ...
simTracker.complete(startTrace, ['decision1', 'decision2'], 0.87);

// Track file upload
const uploadTracker = await performanceTracing.trackFileUpload('image/jpeg', 1024000);
const processingTrace = uploadTracker.processing();
const aiTrace = uploadTracker.aiAnalysis();
// ... upload and processing logic ...
uploadTracker.complete(true);

// Track AI operation
const aiTracker = await performanceTracing.trackAIOperation('ethics_scoring', 'decision_data');
// ... AI processing ...
aiTracker.complete(0.92, 1);
*/

export default PerformanceTracing;
