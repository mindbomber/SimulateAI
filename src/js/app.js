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
 * Main Application - SimulateAI Educational Platform
 * Initializes the platform and manages the overall application state
 *
 * ARCHITECTURE: Improved Component Coordination
 * ============================================
 * app.js          → Application lifecycle, services, error handling
 * MainGrid        → UI coordination, event handling, view management
 * SimulateAI fn   → Business logic, component coordination, navigation
 * category-grid   → Category display and interaction (future)
 * scenario-browser → Scenario browsing and filtering
 *
 * The MainGrid component now receives a SimulateAI function from app.js
 * that coordinates category-grid and scenario-browser components while
 * providing access to app services, analytics, and configuration.
 */

// Import core modules
import AccessibilityManager from "./core/accessibility.js";
import AnimationManager from "./core/animation-manager.js";
import globalEventManager from "./core/global-event-manager.js";
import DataHandler from "./core/data-handler.js";
import UIBinder from "./core/ui-binder.js";
import { UIManager } from "./core/ui.js"; // Phase 3.2: UIManager integration
import EducatorToolkit from "./core/educator-toolkit.js";
import DigitalScienceLab from "./core/digital-science-lab.js";
import ScenarioGenerator from "./core/scenario-generator.js";
import PerformanceMonitor from "./utils/performance-monitor.js"; // Phase 3.3: PerformanceMonitor integration
import { ComponentRegistry } from "./utils/component-registry.js"; // Phase 3.4: ComponentRegistry integration

// Import MCP integrations
import MCPIntegrationManager from "./integrations/mcp-integration-manager.js";

// Import badge system
import badgeManager from "./core/badge-manager.js";
import badgeModal from "./components/badge-modal.js";

// Import user tracking system
import "./user-tracking-init.js";

// Import Firebase Cloud Messaging - DISABLED to prevent duplicate initializations
// Firebase is now handled through ServiceManager to avoid conflicts
// import './fcm-simple-init.js';

// Import utilities
import { userPreferences, userProgress } from "./utils/simple-storage.js";
import { simpleAnalytics } from "./utils/simple-analytics.js";
import AnalyticsManager from "./utils/analytics.js";
import Helpers from "./utils/helpers.js";
import canvasManager from "./utils/canvas-manager-compat.js";
import logger from "./utils/logger.js";
import focusManager from "./utils/focus-manager.js";
import scrollManager from "./utils/scroll-manager.js";
import { loopDetector } from "./utils/infinite-loop-detector.js";
import configIntegrator from "./utils/config-integrator.js";
import "./utils/console-cleanup.js"; // Initialize console cleanup utility
import "./utils/tooltip-auto-init.js"; // Initialize automatic tooltips for all users

// Import system metadata collection
import { getSystemCollector } from "./services/system-metadata-collector.js";
import { PWAService } from "./services/pwa-service.js"; // Phase 3.5: PWAService integration

// Import enhanced objects (loaded dynamically as needed)
// import { EthicsMeter, InteractiveButton, InteractiveSlider } from './objects/enhanced-objects.js';

// Import new modal components
import { ScenarioReflectionModal } from "./components/scenario-reflection-modal.js";
import ModalFooterManager from "./components/modal-footer-manager.js";
import MainGrid from "./components/main-grid.js";
import OnboardingTour from "./components/onboarding-tour.js";
import { getAllCategories, getCategoryScenarios } from "../data/categories.js";

// JSON SSOT Configuration System
import { appStartup } from "./app-startup.js";

// Community and Authentication Services
// import AuthService from './services/auth-service.js'; // Now handled by ServiceManager

// Constants for app configuration
const APP_CONSTANTS = {
  VIEWPORT: {
    MOBILE_BREAKPOINT: 767,
  },
  DEFAULTS: {
    SCORE_VALUE: 0.5,
    SLIDER_VALUE: 50,
    METER_VALUE: 0.5,
    ETHICS_METER_VALUE: 50,
  },
  FEEDBACK: {
    EXCELLENT_THRESHOLD: 70,
    GOOD_THRESHOLD: 50,
  },
  TIMING: {
    ANIMATION_DELAY: 300,
    NOTIFICATION_DURATION: 4000,
    STAGGER_DELAY: 300,
    QUICK_DELAY: 50,
    FOCUS_DELAY: 100,
    NAV_CLOSE_DELAY: 0,
  },
  ENTERPRISE: {
    HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
    PERFORMANCE_MONITORING_INTERVAL: 60000, // 1 minute
    ERROR_REPORT_BATCH_SIZE: 10,
    TELEMETRY_BATCH_SIZE: 20,
    MAX_RETRY_ATTEMPTS: 3,
    CIRCUIT_BREAKER_THRESHOLD: 5,
    MEMORY_WARNING_THRESHOLD: 100 * 1024 * 1024, // 100MB
    PERFORMANCE_WARNING_THRESHOLD: 3000, // 3 seconds
  },
};

// Enterprise-grade debug and logging utility
const AppDebug = {
  logBuffer: [],
  maxBufferSize: 1000,
  errorQueue: [],
  telemetryBatch: [],

  log: (message, data = null) => {
    if (window.DEBUG_MODE || localStorage.getItem("debug") === "true") {
      // eslint-disable-next-line no-console
      console.log(`[App] ${message}`, data || "");
      AppDebug._bufferLog("log", message, data);
    }
  },
  info: (message, data = null) => {
    if (window.DEBUG_MODE || localStorage.getItem("debug") === "true") {
      // eslint-disable-next-line no-console
      console.info(`[App] ${message}`, data || "");
      AppDebug._bufferLog("info", message, data);
    }
  },
  warn: (message, data = null) => {
    if (window.DEBUG_MODE || localStorage.getItem("debug") === "true") {
      // eslint-disable-next-line no-console
      console.warn(`[App] ${message}`, data || "");
      AppDebug._bufferLog("warn", message, data);
    }
  },
  error: (message, error = null) => {
    // Always show errors
    // eslint-disable-next-line no-console
    console.error(`[App] ${message}`, error || "");
    AppDebug._bufferLog("error", message, error);
    AppDebug._queueError(message, error);
  },

  // Enterprise logging methods
  _bufferLog: (level, message, data) => {
    const logEntry = {
      timestamp: new Date().toISOString(),
      level,
      message,
      data,
      sessionId: AppDebug._getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
    };

    AppDebug.logBuffer.push(logEntry);

    // Maintain buffer size
    if (AppDebug.logBuffer.length > AppDebug.maxBufferSize) {
      AppDebug.logBuffer.shift();
    }

    // Add to telemetry batch for enterprise monitoring
    AppDebug.telemetryBatch.push(logEntry);
    if (
      AppDebug.telemetryBatch.length >=
      APP_CONSTANTS.ENTERPRISE.TELEMETRY_BATCH_SIZE
    ) {
      AppDebug._flushTelemetry();
    }
  },

  _queueError: (message, error) => {
    const errorEntry = {
      timestamp: new Date().toISOString(),
      message,
      error: error
        ? {
            message: error.message,
            stack: error.stack,
            name: error.name,
          }
        : null,
      sessionId: AppDebug._getSessionId(),
      userAgent: navigator.userAgent,
      url: window.location.href,
      memoryUsage: AppDebug._getMemoryUsage(),
    };

    AppDebug.errorQueue.push(errorEntry);

    // Batch error reporting
    if (
      AppDebug.errorQueue.length >=
      APP_CONSTANTS.ENTERPRISE.ERROR_REPORT_BATCH_SIZE
    ) {
      AppDebug._flushErrors();
    }
  },

  _flushTelemetry: () => {
    if (AppDebug.telemetryBatch.length === 0) return;

    // Send to enterprise monitoring service
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send(
        "app_telemetry",
        AppDebug.telemetryBatch,
      );
    }

    // Store locally as backup
    try {
      const existing = JSON.parse(
        localStorage.getItem("app_telemetry") || "[]",
      );
      const combined = [...existing, ...AppDebug.telemetryBatch].slice(-500); // Keep last 500
      localStorage.setItem("app_telemetry", JSON.stringify(combined));
    } catch (e) {
      // Storage error - continue without local backup
    }

    AppDebug.telemetryBatch = [];
  },

  _flushErrors: () => {
    if (AppDebug.errorQueue.length === 0) return;

    // Send to enterprise error tracking
    if (window.enterpriseErrorTracking) {
      window.enterpriseErrorTracking.reportBatch(AppDebug.errorQueue);
    }

    // Store locally as backup
    try {
      const existing = JSON.parse(localStorage.getItem("app_errors") || "[]");
      const combined = [...existing, ...AppDebug.errorQueue].slice(-100); // Keep last 100
      localStorage.setItem("app_errors", JSON.stringify(combined));
    } catch (e) {
      // Storage error - continue without local backup
    }

    AppDebug.errorQueue = [];
  },

  _getSessionId: () => {
    if (!AppDebug.sessionId) {
      AppDebug.sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }
    return AppDebug.sessionId;
  },

  _getMemoryUsage: () => {
    if ("memory" in performance) {
      return {
        used: performance.memory.usedJSHeapSize,
        total: performance.memory.totalJSHeapSize,
        limit: performance.memory.jsHeapSizeLimit,
      };
    }
    return null;
  },

  // Enterprise diagnostic methods
  getDiagnostics: () => {
    return {
      sessionId: AppDebug._getSessionId(),
      logBufferSize: AppDebug.logBuffer.length,
      errorQueueSize: AppDebug.errorQueue.length,
      telemetryBatchSize: AppDebug.telemetryBatch.length,
      memoryUsage: AppDebug._getMemoryUsage(),
      timestamp: new Date().toISOString(),
    };
  },

  exportLogs: () => {
    return {
      logs: AppDebug.logBuffer,
      errors: AppDebug.errorQueue,
      telemetry: AppDebug.telemetryBatch,
      diagnostics: AppDebug.getDiagnostics(),
    };
  },

  clearBuffers: () => {
    AppDebug.logBuffer = [];
    AppDebug.errorQueue = [];
    AppDebug.telemetryBatch = [];
  },
};

class SimulateAIApp {
  constructor() {
    // Version identifier for debugging
    this.version = "v2.1.0-enterprise";
    this.buildTimestamp = new Date().toISOString();
    this.sessionId = AppDebug._getSessionId();

    AppDebug.info(
      `[App] Initializing SimulateAI Platform ${this.version} (Build: ${this.buildTimestamp})`,
    );

    // Core application state
    this.currentSimulation = null;
    this.engine = null;
    this.isInitialized = false;

    // Enterprise monitoring and health
    this.healthStatus = {
      overall: "healthy",
      components: new Map(),
      lastCheck: null,
      issues: [],
    };
    this.performanceMetrics = {
      initTime: 0,
      memoryUsage: 0,
      errorCount: 0,
      simulationLoads: 0,
      averageLoadTime: 0,
      lastPerformanceCheck: null,
    };
    this.circuitBreakers = new Map();
    this.retryCounters = new Map();
    this.enterpriseConfig = {
      monitoringEnabled: true,
      telemetryEnabled: true,
      errorReportingEnabled: true,
      performanceTrackingEnabled: true,
      healthChecksEnabled: true,
      circuitBreakerEnabled: true,
    };

    // Enhanced Analytics Manager - Phase 3.1 Integration
    this.analyticsManager = AnalyticsManager; // Keep static reference for backward compatibility
    this.analyticsInstance = null; // New instance with DataHandler support
    this.simpleAnalytics = simpleAnalytics; // Keep for backward compatibility

    // Modernized managers
    this.accessibilityManager = null;
    this.animationManager = null;

    // Phase 3.3: Performance Monitor Integration
    this.performanceMonitor = null; // Enhanced instance with DataHandler support
    this.appPerformanceMonitor = null; // Application-level performance tracking

    // Core educational modules
    this.educatorToolkit = null;
    this.digitalScienceLab = null;
    this.scenarioGenerator = null;

    // Badge management system
    this.badgeManager = null;

    // Canvas management IDs (only keeping essential ones)
    this.currentSimulationCanvasId = null; // May be needed for cleanup

    // UI elements
    this.modal = null;
    this.enhancedModal = null;
    this.simulationContainer = null;
    this.categoriesGrid = null;
    this.lastFocusedElement = null; // For focus restoration

    // Theme and preferences
    this.currentTheme = "light";
    this.preferences = {
      reducedMotion: false,
      highContrast: false,
      largeText: false,
    };

    // Enhanced error handling and recovery
    this.errorBoundary = null;
    this.lastError = null;
    this.errorRecoveryStrategies = new Map();
    this.criticalErrorCount = 0;
    this.errorPatterns = new Map();

    // Onboarding tour
    this.onboardingTour = null;

    // MCP Integration Manager
    this.mcpManager = null;
    this.mcpInitialized = false; // Track MCP initialization state
    this.mcpCapabilities = new Set();

    // Community and Authentication Services
    this.firebaseService = null;
    this.authService = null;
    this.currentUser = null;
    this.userWelcomed = false; // Track if user has been welcomed this session

    // Phase 3.5: PWA Service Integration
    this.pwaService = null; // Enhanced PWA management with DataHandler integration

    // Firebase Cloud Messaging
    this.messagingService = null;
    this.notificationToken = null;
    this.messagingInitialized = false;

    // Scenario Browser Integration
    this.scenarioBrowserIntegration = null;
    this.scenarioBrowser = null;
    this.scenarioBrowserInitialized = false;

    // Debouncing for user actions
    this.lastSurpriseTime = 0; // Track last surprise me action for debouncing

    // Enterprise monitoring intervals
    this.healthCheckInterval = null;
    this.performanceMonitoringInterval = null;
    this.telemetryFlushInterval = null;

    // Main simulation entry point - connects to the full scenario system
    // This launches the ScenarioModal which provides access to all scenario categories
    this.simulateaiConfig = {
      id: "simulateai",
      title: "Simulation Launcher",
      description:
        "Launch the scenario browser to explore AI ethics simulations. Choose from multiple scenario categories covering fairness, bias, transparency, and real-world AI impact.",
      difficulty: "beginner",
      duration: 1200, // 20 minutes
      thumbnail: null, // Placeholder - will use default thumbnail
      tags: ["launcher", "scenarios", "ethics", "education", "gateway"],
      useCanvas: false, // HTML-only simulation, no canvas needed
      renderMode: "html",
    };

    // Initialize enterprise monitoring
    this._initializeEnterpriseMonitoring();
  }

  /**
   * Get component configuration from ConfigurationIntegrator
   * @param {string} componentName - Name of the component
   * @returns {Object|null} Component configuration or null if not found
   */
  async getComponentConfig(componentName) {
    try {
      // Try to get cached config first
      let config = configIntegrator.getComponentConfig(componentName);

      // If not cached, load it
      if (!config) {
        config = await configIntegrator.loadComponentConfig(componentName);
      }

      return config;
    } catch (error) {
      AppDebug.error(`Failed to get config for ${componentName}:`, error);
      return null;
    }
  }

  /**
   * Get app configuration from ConfigurationIntegrator
   * @returns {Object|null} App configuration or null if not loaded
   */
  getAppConfig() {
    return configIntegrator.getAppConfig();
  }

  /**
   * Check if a component should be preloaded based on configuration
   * @param {string} componentName - Name of the component
   * @returns {boolean} Whether component should be preloaded
   */
  shouldPreloadComponent(componentName) {
    return configIntegrator.shouldPreloadComponent(componentName);
  }

  /**
   * Check if a component is required for app functionality
   * @param {string} componentName - Name of the component
   * @returns {boolean} Whether component is required
   */
  isComponentRequired(componentName) {
    return configIntegrator.isComponentRequired(componentName);
  }

  /**
   * Initialize enterprise-grade monitoring and health systems
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Set up error recovery strategies
      this._setupErrorRecoveryStrategies();

      // Initialize circuit breakers for critical components
      this._initializeCircuitBreakers();

      // Set up performance baseline
      this._establishPerformanceBaseline();

      AppDebug.info("Enterprise monitoring systems initialized");
    } catch (error) {
      AppDebug.error("Failed to initialize enterprise monitoring:", error);
      // Continue initialization even if monitoring fails
    }
  }

  /**
   * Set up error recovery strategies for different types of failures
   */
  _setupErrorRecoveryStrategies() {
    this.errorRecoveryStrategies.set("simulation_load_failure", {
      strategy: "retry_with_fallback",
      maxRetries: 3,
      fallbackAction: "show_basic_simulation",
      cooldownMs: 5000,
    });

    this.errorRecoveryStrategies.set("firebase_connection_failure", {
      strategy: "offline_mode",
      maxRetries: 5,
      fallbackAction: "enable_offline_features",
      cooldownMs: 10000,
    });

    this.errorRecoveryStrategies.set("memory_exhaustion", {
      strategy: "cleanup_and_restart",
      maxRetries: 1,
      fallbackAction: "force_cleanup_heavy_components",
      cooldownMs: 2000,
    });
  }

  /**
   * Initialize circuit breakers for critical system components
   */
  _initializeCircuitBreakers() {
    const criticalComponents = [
      "simulation_engine",
      "firebase_service",
      "analytics_service",
      "authentication_service",
    ];

    criticalComponents.forEach((component) => {
      this.circuitBreakers.set(component, {
        state: "closed", // closed, open, half-open
        failureCount: 0,
        threshold: APP_CONSTANTS.ENTERPRISE.CIRCUIT_BREAKER_THRESHOLD,
        timeout: 60000, // 1 minute
        lastFailureTime: null,
        successCount: 0,
      });
    });
  }

  /**
   * Establish performance baseline metrics
   */
  _establishPerformanceBaseline() {
    this.performanceMetrics = {
      initTime: performance.now(),
      memoryUsage: this._getCurrentMemoryUsage(),
      errorCount: 0,
      simulationLoads: 0,
      averageLoadTime: 0,
      loadTimes: [],
      lastPerformanceCheck: Date.now(),
      criticalMetrics: {
        timeToInteractive: 0,
        firstContentfulPaint: 0,
        largestContentfulPaint: 0,
        cumulativeLayoutShift: 0,
      },
    };
  }

  /**
   * Get current memory usage if available
   */
  _getCurrentMemoryUsage() {
    if ("memory" in performance) {
      return performance.memory.usedJSHeapSize;
    }
    return 0;
  }

  /**
   * Get accessibility features currently in use
   */
  _getUsedAccessibilityFeatures() {
    const features = [];

    if (this.preferences.highContrast) {
      features.push("high_contrast");
    }

    if (this.preferences.largeText) {
      features.push("large_text");
    }

    if (this.preferences.reducedMotion) {
      features.push("reduced_motion");
    }

    // Check for screen reader usage
    if (
      navigator.userAgent.includes("NVDA") ||
      navigator.userAgent.includes("JAWS") ||
      navigator.userAgent.includes("VoiceOver")
    ) {
      features.push("screen_reader");
    }

    // Check for keyboard navigation
    if (
      document.activeElement &&
      document.activeElement.matches(":focus-visible")
    ) {
      features.push("keyboard_navigation");
    }

    return features;
  }

  /**
   * Start enterprise monitoring intervals
   */
  _startEnterpriseMonitoring() {
    if (!this.enterpriseConfig.monitoringEnabled) return;

    // Health check interval
    if (this.enterpriseConfig.healthChecksEnabled) {
      this.healthCheckInterval = setInterval(() => {
        this._performHealthCheck();
      }, APP_CONSTANTS.ENTERPRISE.HEALTH_CHECK_INTERVAL);
    }

    // Performance monitoring interval
    if (this.enterpriseConfig.performanceTrackingEnabled) {
      this.performanceMonitoringInterval = setInterval(() => {
        this._performPerformanceCheck();
      }, APP_CONSTANTS.ENTERPRISE.PERFORMANCE_MONITORING_INTERVAL);
    }

    // Telemetry flush interval
    if (this.enterpriseConfig.telemetryEnabled) {
      this.telemetryFlushInterval = setInterval(() => {
        AppDebug._flushTelemetry();
      }, 30000); // Flush every 30 seconds
    }

    AppDebug.info("Enterprise monitoring intervals started");
  }

  /**
   * Perform comprehensive health check
   */
  _performHealthCheck() {
    const healthCheck = {
      timestamp: new Date().toISOString(),
      overall: "healthy",
      components: {},
      memory: this._getCurrentMemoryUsage(),
      errors: AppDebug.errorQueue.length,
      warnings: [],
    };

    // Check memory usage
    const memoryUsage = this._getCurrentMemoryUsage();
    if (memoryUsage > APP_CONSTANTS.ENTERPRISE.MEMORY_WARNING_THRESHOLD) {
      healthCheck.warnings.push(
        `High memory usage: ${(memoryUsage / 1024 / 1024).toFixed(2)}MB`,
      );
      healthCheck.overall = "warning";
    }

    // Check error rate
    if (this.performanceMetrics.errorCount > 10) {
      healthCheck.warnings.push(
        `High error count: ${this.performanceMetrics.errorCount}`,
      );
      healthCheck.overall = "warning";
    }

    // Check circuit breaker states
    let hasOpenCircuits = false;
    this.circuitBreakers.forEach((breaker, component) => {
      healthCheck.components[component] = breaker.state;
      if (breaker.state === "open") {
        hasOpenCircuits = true;
        healthCheck.warnings.push(`Circuit breaker open for ${component}`);
      }
    });

    if (hasOpenCircuits) {
      healthCheck.overall = "degraded";
    }

    // Store health status
    this.healthStatus = {
      ...healthCheck,
      lastCheck: Date.now(),
      issues: healthCheck.warnings,
    };

    // Send to enterprise monitoring
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("health_check", healthCheck);
    }

    AppDebug.info("Health check completed", {
      status: healthCheck.overall,
      warnings: healthCheck.warnings.length,
    });
  }

  /**
   * Perform performance monitoring check
   * Phase 3.3: Enhanced with PerformanceMonitor integration
   */
  _performPerformanceCheck() {
    const performanceData = {
      timestamp: new Date().toISOString(),
      memory: this._getCurrentMemoryUsage(),
      timing: this._getPerformanceTimings(),
      userTiming: this._getUserTimingMetrics(),
      resourceTiming: this._getResourceTimingMetrics(),
    };

    // Phase 3.3: Integrate with PerformanceMonitor analytics
    if (this.performanceMonitor) {
      const analytics = PerformanceMonitor.getGlobalAnalytics();
      performanceData.monitorAnalytics = analytics;

      // Track this performance check as a measurement
      this.appPerformanceMonitor?.startMeasurement("performance_check");
    }

    // Update performance metrics
    this.performanceMetrics.lastPerformanceCheck = Date.now();
    this.performanceMetrics.memoryUsage = performanceData.memory;

    // Check for performance issues
    const issues = [];
    if (
      performanceData.timing.loadTime >
      APP_CONSTANTS.ENTERPRISE.PERFORMANCE_WARNING_THRESHOLD
    ) {
      issues.push(`Slow load time: ${performanceData.timing.loadTime}ms`);
    }

    if (
      performanceData.memory > APP_CONSTANTS.ENTERPRISE.MEMORY_WARNING_THRESHOLD
    ) {
      issues.push(
        `High memory usage: ${(performanceData.memory / 1024 / 1024).toFixed(2)}MB`,
      );
    }

    // Phase 3.3: Add PerformanceMonitor health assessment
    if (performanceData.monitorAnalytics) {
      if (performanceData.monitorAnalytics.systemHealth === "critical") {
        issues.push("Critical performance issues detected by monitors");
      } else if (performanceData.monitorAnalytics.systemHealth === "degraded") {
        issues.push("Performance degradation detected by monitors");
      }
    }

    // Send to enterprise monitoring
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("performance_metrics", {
        ...performanceData,
        issues,
      });
    }

    if (issues.length > 0) {
      AppDebug.warn("Performance issues detected", issues);
    }

    // Phase 3.3: Complete performance check measurement
    if (this.appPerformanceMonitor) {
      this.appPerformanceMonitor.endMeasurement("performance_check", {
        issuesFound: issues.length,
        systemHealth:
          performanceData.monitorAnalytics?.systemHealth || "unknown",
      });
    }
  }

  /**
   * Get performance timing metrics
   */
  _getPerformanceTimings() {
    const navigation = performance.getEntriesByType("navigation")[0];
    if (!navigation) return {};

    return {
      loadTime: navigation.loadEventEnd - navigation.navigationStart,
      domContentLoaded:
        navigation.domContentLoadedEventEnd - navigation.navigationStart,
      firstPaint: this._getFirstPaint(),
      firstContentfulPaint: this._getFirstContentfulPaint(),
    };
  }

  /**
   * Get First Paint timing
   */
  _getFirstPaint() {
    const paintEntries = performance.getEntriesByType("paint");
    const firstPaint = paintEntries.find(
      (entry) => entry.name === "first-paint",
    );
    return firstPaint ? firstPaint.startTime : 0;
  }

  /**
   * Get First Contentful Paint timing
   */
  _getFirstContentfulPaint() {
    const paintEntries = performance.getEntriesByType("paint");
    const fcp = paintEntries.find(
      (entry) => entry.name === "first-contentful-paint",
    );
    return fcp ? fcp.startTime : 0;
  }

  /**
   * Get user timing metrics
   */
  _getUserTimingMetrics() {
    const userTimings = performance.getEntriesByType("measure");
    return userTimings.map((timing) => ({
      name: timing.name,
      duration: timing.duration,
      startTime: timing.startTime,
    }));
  }

  /**
   * Get resource timing metrics
   */
  _getResourceTimingMetrics() {
    const resourceEntries = performance.getEntriesByType("resource");
    return {
      totalResources: resourceEntries.length,
      slowResources: resourceEntries.filter((r) => r.duration > 1000).length,
      failedResources: resourceEntries.filter((r) => r.responseEnd === 0)
        .length,
      averageLoadTime:
        resourceEntries.reduce((sum, r) => sum + r.duration, 0) /
        resourceEntries.length,
    };
  }

  /**
   * Stop enterprise monitoring intervals
   */
  _stopEnterpriseMonitoring() {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }

    if (this.performanceMonitoringInterval) {
      clearInterval(this.performanceMonitoringInterval);
      this.performanceMonitoringInterval = null;
    }

    if (this.telemetryFlushInterval) {
      clearInterval(this.telemetryFlushInterval);
      this.telemetryFlushInterval = null;
    }

    AppDebug.info("Enterprise monitoring intervals stopped");
  }
  async init() {
    if (this.isInitialized) return;

    const initStartTime = performance.now();

    try {
      AppDebug.log("🚀 Starting SimulateAI Platform phased initialization...");
      performance.mark("app-init-start");

      // ========================================================================
      // PHASE 1: FOUNDATION - Core infrastructure and configuration
      // ========================================================================
      await this._initializePhase1Foundation();

      // ========================================================================
      // PHASE 2: SERVICES - Backend services and data management
      // ========================================================================
      await this._initializePhase2Services();

      // ========================================================================
      // PHASE 3: COMPONENTS - Main application components
      // ========================================================================
      await this._initializePhase3Components();

      // ========================================================================
      // PHASE 4: INTERACTIONS - Events, accessibility, and user tracking
      // ========================================================================
      await this._initializePhase4Interactions();

      // ========================================================================
      // PHASE 5: EDUCATIONAL - Advanced features and enhancements
      // ========================================================================
      await this._initializePhase5Educational();

      // ========================================================================
      // FINALIZATION - Complete initialization and start monitoring
      // ========================================================================
      await this._finalizeInitialization(initStartTime);
    } catch (error) {
      await this._handleInitializationFailure(error);
    }
  }

  /**
   * Phase 1: Foundation - Core infrastructure and configuration
   * Sets up the fundamental systems needed for the app to function
   */
  async _initializePhase1Foundation() {
    AppDebug.log(
      "📋 Phase 1: Foundation - Initializing core infrastructure...",
    );
    const phaseStartTime = performance.now();

    try {
      // Configuration System
      AppDebug.log("⚙️ Setting up configuration system...");
      if (!appStartup.initialized) {
        await appStartup.initialize();
      }
      this._updateComponentHealth("config_system", "healthy");

      // Configuration Integrator
      try {
        await configIntegrator.initialize();
        this._updateComponentHealth("config_integrator", "healthy");
        AppDebug.log("✅ Configuration integrator ready");
      } catch (error) {
        AppDebug.error("Failed to initialize configuration integrator", error);
        this._updateComponentHealth("config_integrator", "error");
        // Continue with degraded functionality
      }

      // Register simulateai with configuration system
      this.registerSimulateaiWithConfig();

      // Scroll Manager
      scrollManager.init();
      this._updateComponentHealth("scroll_manager", "healthy");

      // Theme System
      this.initializeTheme();
      this._updateComponentHealth("theme_system", "healthy");

      // Error Handling
      this.initializeErrorHandling();
      this._updateComponentHealth("error_handling", "healthy");

      // Development Tools (in dev mode only)
      this.initializeLoopDetection();

      const phaseTime = performance.now() - phaseStartTime;
      AppDebug.log(
        `✅ Phase 1 Foundation completed (${phaseTime.toFixed(2)}ms)`,
      );
      this._trackPhaseCompletion("foundation", phaseTime);
    } catch (error) {
      AppDebug.error("Phase 1 Foundation failed:", error);
      this._updateComponentHealth("foundation_phase", "critical");
      throw new Error(`Foundation phase failed: ${error.message}`);
    }
  }

  /**
   * Phase 2: Services - Backend services and data management
   * Initializes external services, authentication, and data systems
   */
  async _initializePhase2Services() {
    AppDebug.log("🔧 Phase 2: Services - Initializing backend services...");
    const phaseStartTime = performance.now();

    try {
      // Core Systems (Analytics, Storage, etc.)
      await this.initializeSystems();
      this._updateComponentHealth("core_systems", "healthy");

      // Firebase and Authentication
      await this.initializeFirebaseServices();
      this._updateComponentHealth("firebase_system", "healthy");

      // Firebase Cloud Messaging (if supported)
      try {
        await this.initializeFirebaseMessaging();
        this._updateComponentHealth("firebase_messaging", "healthy");
      } catch (error) {
        AppDebug.warn("Firebase messaging not available:", error.message);
        this._updateComponentHealth("firebase_messaging", "degraded");
        // Continue without messaging - not critical
      }

      const phaseTime = performance.now() - phaseStartTime;
      AppDebug.log(`✅ Phase 2 Services completed (${phaseTime.toFixed(2)}ms)`);
      this._trackPhaseCompletion("services", phaseTime);
    } catch (error) {
      AppDebug.error("Phase 2 Services failed:", error);
      this._updateComponentHealth("services_phase", "critical");
      throw new Error(`Services phase failed: ${error.message}`);
    }
  }

  /**
   * Phase 3: Components - Main application components
   * Sets up UI components, modals, and core functionality
   */
  async _initializePhase3Components() {
    AppDebug.log("🧩 Phase 3: Components - Initializing UI components...");
    const phaseStartTime = performance.now();

    try {
      // UI Setup
      this.setupUI();
      this._updateComponentHealth("ui_system", "healthy");

      // Simulation System
      this._updateComponentHealth("simulation_system", "healthy");

      // Modal Management
      this.initializeModalFooterManager();
      this._updateComponentHealth("modal_system", "healthy");

      // Ethics Radar Demo
      await this.initializeEthicsRadarDemo();
      this._updateComponentHealth("ethics_radar", "healthy");

      // Scenario Browser Integration
      await this.initializeScenarioBrowserIntegration();
      this._updateComponentHealth("scenario_browser", "healthy");

      // Scroll Reveal Header
      this.initializeScrollRevealHeader();
      this._updateComponentHealth("scroll_reveal", "healthy");

      // Initial Render
      this.render();
      this._updateComponentHealth("render_system", "healthy");

      const phaseTime = performance.now() - phaseStartTime;
      AppDebug.log(
        `✅ Phase 3 Components completed (${phaseTime.toFixed(2)}ms)`,
      );
      this._trackPhaseCompletion("components", phaseTime);
    } catch (error) {
      AppDebug.error("Phase 3 Components failed:", error);
      this._updateComponentHealth("components_phase", "critical");
      throw new Error(`Components phase failed: ${error.message}`);
    }
  }

  /**
   * Phase 4: Interactions - Events, accessibility, and user tracking
   * Sets up event handlers, accessibility features, and user interaction tracking
   */
  async _initializePhase4Interactions() {
    AppDebug.log("⚡ Phase 4: Interactions - Setting up user interactions...");
    const phaseStartTime = performance.now();

    try {
      // Initialize Global Event Manager
      globalEventManager.initialize();

      // Register this app with the event manager
      this.registerWithEventManager();

      // Event Listeners (now handled by Global Event Manager)
      this.setupEventListeners();
      this._updateComponentHealth("event_system", "healthy");

      // Accessibility
      this.setupAccessibility();
      this._updateComponentHealth("accessibility_system", "healthy");

      // Authentication State Listener
      this.setupAuthStateListener();
      this._updateComponentHealth("auth_state_listener", "healthy");

      // Research Data Integration
      this.setupResearchDataIntegration();
      this._updateComponentHealth("research_integration", "healthy");

      // Hero Animations
      this.initializeHeroAnimations();
      this._updateComponentHealth("hero_animations", "healthy");

      const phaseTime = performance.now() - phaseStartTime;
      AppDebug.log(
        `✅ Phase 4 Interactions completed (${phaseTime.toFixed(2)}ms)`,
      );
      this._trackPhaseCompletion("interactions", phaseTime);
    } catch (error) {
      AppDebug.error("Phase 4 Interactions failed:", error);
      this._updateComponentHealth("interactions_phase", "critical");
      throw new Error(`Interactions phase failed: ${error.message}`);
    }
  }

  /**
   * Phase 5: Educational - Advanced features and enhancements
   * Initializes educational tools, badges, onboarding, and MCP integrations
   */
  async _initializePhase5Educational() {
    AppDebug.log(
      "🎓 Phase 5: Educational - Initializing educational features...",
    );
    const phaseStartTime = performance.now();

    try {
      // MCP Integrations
      await this.initializeMCPIntegrations();
      this._updateComponentHealth("mcp_system", "healthy");

      // Onboarding Tour (app page only)
      const isAppPage =
        window.location.pathname.includes("app.html") ||
        document.querySelector(".categories-grid") !== null;

      if (isAppPage && !this.onboardingTour && !window.onboardingTourInstance) {
        this.onboardingTour = new OnboardingTour();
        window.onboardingTourInstance = this.onboardingTour;
        this.instrumentOnboardingTour(this.onboardingTour);
        this.checkAndStartOnboardingTour();
        this._updateComponentHealth("onboarding_system", "healthy");
      } else if (!isAppPage) {
        AppDebug.info("Skipping onboarding tour - not on app page");
      } else {
        AppDebug.warn("OnboardingTour instance already exists");
      }

      const phaseTime = performance.now() - phaseStartTime;
      AppDebug.log(
        `✅ Phase 5 Educational completed (${phaseTime.toFixed(2)}ms)`,
      );
      this._trackPhaseCompletion("educational", phaseTime);
    } catch (error) {
      AppDebug.error("Phase 5 Educational failed:", error);
      this._updateComponentHealth("educational_phase", "degraded");
      // Don't throw - educational features are non-critical
      AppDebug.warn(
        "Educational features may be limited due to initialization failure",
      );
    }
  }

  /**
   * Finalization - Complete initialization and start monitoring
   * Wraps up initialization, starts monitoring, and tracks metrics
   */
  async _finalizeInitialization(initStartTime) {
    AppDebug.log("🏁 Finalizing initialization...");

    try {
      // Mark performance end
      performance.mark("app-init-end");
      performance.measure(
        "app-initialization",
        "app-init-start",
        "app-init-end",
      );

      const initTime = performance.now() - initStartTime;
      this.performanceMetrics.initTime = initTime;

      // Start enterprise monitoring
      this._startEnterpriseMonitoring();

      // Set initialization flag
      this.isInitialized = true;

      // Perform initial health check
      this._performHealthCheck();

      // Track initialization analytics
      this._trackInitializationComplete(initTime);

      // Set up shutdown handler
      window.addEventListener("beforeunload", () => {
        this._handleApplicationShutdown();
      });

      AppDebug.log(
        `🎉 SimulateAI Platform initialized successfully (${initTime.toFixed(2)}ms)`,
      );
    } catch (error) {
      AppDebug.error("Finalization failed:", error);
      this._updateComponentHealth("finalization", "error");
      throw new Error(`Finalization failed: ${error.message}`);
    }
  }

  /**
   * Handle initialization failure with recovery options
   */
  async _handleInitializationFailure(error) {
    this.criticalErrorCount++;
    this._updateComponentHealth("application_core", "critical");

    AppDebug.error("Application initialization failed:", error);

    // Attempt graceful degradation
    try {
      AppDebug.log("Attempting graceful degradation...");

      // Set minimal working state
      this.isInitialized = false;

      // Track the failure
      simpleAnalytics.trackEvent("app_initialization_failed", {
        error_message: error.message,
        error_phase: this._getCurrentPhase(),
        timestamp: new Date().toISOString(),
        session_id: this.sessionId,
      });

      // Show user-friendly error
      this.handleEnterpriseError(
        error,
        "The application failed to start properly. Please refresh the page to try again.",
        "initialization_failure",
      );
    } catch (recoveryError) {
      AppDebug.error(
        "Failed to handle initialization failure gracefully:",
        recoveryError,
      );

      // Last resort: basic error display
      console.error(
        "Critical initialization failure. Please refresh the page.",
      );
    }
  }

  /**
   * Track phase completion for analytics and monitoring
   */
  _trackPhaseCompletion(phaseName, phaseTime) {
    // Store phase timing for diagnostics
    if (!this.performanceMetrics.phaseTimings) {
      this.performanceMetrics.phaseTimings = {};
    }
    this.performanceMetrics.phaseTimings[phaseName] = phaseTime;

    // Track with analytics
    if (this.analyticsManager.isInitialized) {
      this.analyticsManager.trackEvent("initialization_phase_complete", {
        phase: phaseName,
        duration: phaseTime,
        sessionId: this.sessionId,
        timestamp: new Date().toISOString(),
      });
    }
  }

  /**
   * Get current initialization phase for error reporting
   */
  _getCurrentPhase() {
    const phases = [
      "foundation",
      "services",
      "components",
      "interactions",
      "educational",
    ];
    const completedPhases = Object.keys(
      this.performanceMetrics.phaseTimings || {},
    );

    if (completedPhases.length === 0) return "foundation";
    if (completedPhases.length >= phases.length) return "finalization";

    return phases[completedPhases.length];
  }

  /**
   * Track complete initialization analytics
   */
  _trackInitializationComplete(initTime) {
    // Track platform initialization for system analytics
    this.systemCollector.updatePlatformMetrics("platform_initialization", {
      simulationsAvailable: 1,
      categoriesAvailable: this.categories?.length || 0,
      browserInfo: Helpers.getBrowserInfo(),
      deviceType: Helpers.getDeviceType(),
      currentTheme: this.currentTheme,
      accessibilityEnabled:
        this.preferences.highContrast || this.preferences.largeText,
      timestamp: new Date().toISOString(),
      initTime,
      version: this.version,
      sessionId: this.sessionId,
      phaseTimings: this.performanceMetrics.phaseTimings,
      enterpriseFeatures: {
        monitoring: this.enterpriseConfig.monitoringEnabled,
        telemetry: this.enterpriseConfig.telemetryEnabled,
        errorReporting: this.enterpriseConfig.errorReportingEnabled,
        performanceTracking: this.enterpriseConfig.performanceTrackingEnabled,
        healthChecks: this.enterpriseConfig.healthChecksEnabled,
        circuitBreaker: this.enterpriseConfig.circuitBreakerEnabled,
      },
    });

    // Track user session start
    this.systemCollector.trackNavigation({
      from: "external",
      to: "platform-home",
      action: "page-load",
      metadata: {
        component: "main-app",
        referrer: document.referrer,
        userAgent: navigator.userAgent,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        version: this.version,
        initTime,
        phaseTimings: this.performanceMetrics.phaseTimings,
      },
    });

    // Track initialization with simple analytics
    simpleAnalytics.trackEvent("app_initialized", {
      simulations_available: 1,
      browser: Helpers.getBrowserInfo().browser,
      device: Helpers.getDeviceType(),
      theme: this.currentTheme,
      accessibility_enabled:
        this.preferences.highContrast || this.preferences.largeText,
      version: this.version,
      session_id: this.sessionId,
      init_time: initTime,
      phase_timings: this.performanceMetrics.phaseTimings,
      enterprise_features_enabled: Object.values(this.enterpriseConfig).filter(
        Boolean,
      ).length,
      memory_usage: this._getCurrentMemoryUsage(),
    });

    // Track with Enhanced Analytics Manager
    if (this.analyticsManager.isInitialized) {
      this.analyticsManager.trackEvent("app_initialized", {
        version: this.version,
        sessionId: this.sessionId,
        initTime,
        phaseTimings: this.performanceMetrics.phaseTimings,
        enterpriseFeatures: this.enterpriseConfig,
        accessibility: this.preferences,
        deviceInfo: {
          browser: Helpers.getBrowserInfo().browser,
          device: Helpers.getDeviceType(),
        },
        memoryUsage: this._getCurrentMemoryUsage(),
      });
    }
  }

  /**
   * Update component health status
   */
  _updateComponentHealth(component, status) {
    this.healthStatus.components.set(component, {
      status,
      lastUpdate: Date.now(),
      timestamp: new Date().toISOString(),
    });

    // Update circuit breaker if it exists
    if (this.circuitBreakers.has(component)) {
      const breaker = this.circuitBreakers.get(component);
      if (status === "healthy") {
        breaker.successCount++;
        if (breaker.state === "half-open" && breaker.successCount >= 3) {
          breaker.state = "closed";
          breaker.failureCount = 0;
          AppDebug.info(`Circuit breaker closed for ${component}`);
        }
      } else if (status === "critical") {
        breaker.failureCount++;
        breaker.lastFailureTime = Date.now();
        if (breaker.failureCount >= breaker.threshold) {
          breaker.state = "open";
          AppDebug.warn(`Circuit breaker opened for ${component}`);
        }
      }
    }
  }

  /**
   * Handle enterprise-grade error with recovery strategies
   */
  handleEnterpriseError(
    error,
    userMessage = "An unexpected error occurred",
    errorType = "general",
  ) {
    this.lastError = error;
    this.performanceMetrics.errorCount++;

    AppDebug.error(`Enterprise Error [${errorType}]:`, error);

    // Track error pattern
    if (!this.errorPatterns.has(errorType)) {
      this.errorPatterns.set(errorType, { count: 0, lastOccurrence: null });
    }
    const pattern = this.errorPatterns.get(errorType);
    pattern.count++;
    pattern.lastOccurrence = Date.now();

    // Update circuit breaker for error type
    this._updateComponentHealth(errorType, "critical");

    // Check if we have a recovery strategy
    const recoveryStrategy = this.errorRecoveryStrategies.get(errorType);
    if (recoveryStrategy) {
      this._executeRecoveryStrategy(errorType, recoveryStrategy, error);
    }

    // Safely extract error message
    let errorMessage = "Unknown error";
    if (error && typeof error === "object") {
      errorMessage =
        error.message || error.toString() || "Error object without message";
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error) {
      errorMessage = String(error);
    }

    // Enhanced analytics tracking
    simpleAnalytics.trackEvent("enterprise_error", {
      error_type: errorType,
      error_message: errorMessage,
      error_stack:
        error && error.stack ? error.stack : "No stack trace available",
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
      session_id: this.sessionId,
      version: this.version,
      memory_usage: this._getCurrentMemoryUsage(),
      component_health: Array.from(
        this.healthStatus.components.entries(),
      ).reduce((acc, [key, value]) => {
        acc[key] = value.status;
        return acc;
      }, {}),
      retry_count: this.retryCounters.get(errorType) || 0,
    });

    // Enhanced analytics error tracking
    if (this.analyticsManager.isInitialized) {
      this.analyticsManager.trackError(error, {
        errorType,
        userImpact: "high",
        recoveryAttempted: this.retryCounters.has(errorType),
        componentHealth: Object.fromEntries(this.healthStatus.components),
        context: "enterprise_error_handler",
      });
    }

    // Send to enterprise error tracking
    if (window.enterpriseErrorTracking) {
      window.enterpriseErrorTracking.reportError({
        type: errorType,
        message: errorMessage,
        stack: error.stack,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        version: this.version,
        userAgent: navigator.userAgent,
        url: window.location.href,
        memoryUsage: this._getCurrentMemoryUsage(),
        componentStates: Object.fromEntries(this.healthStatus.components),
        recoveryAttempted: !!recoveryStrategy,
      });
    }

    // Show error to user with recovery options
    this.showEnterpriseError(userMessage, errorType, !!recoveryStrategy);

    // Announce error for accessibility
    if (this.accessibilityManager) {
      this.accessibilityManager.announce(`Error: ${userMessage}`, "assertive");
    }
  }

  /**
   * Execute recovery strategy for a specific error type
   */
  _executeRecoveryStrategy(errorType, strategy, originalError) {
    const retryKey = errorType;
    const currentRetries = this.retryCounters.get(retryKey) || 0;

    if (currentRetries >= strategy.maxRetries) {
      AppDebug.warn(
        `Max retries exceeded for ${errorType}, executing fallback`,
      );
      this._executeFallbackAction(strategy.fallbackAction);
      return;
    }

    this.retryCounters.set(retryKey, currentRetries + 1);

    AppDebug.info(
      `Executing recovery strategy for ${errorType} (attempt ${currentRetries + 1}/${strategy.maxRetries})`,
    );

    setTimeout(() => {
      switch (strategy.strategy) {
        case "retry_with_fallback":
          this._retryLastOperation(errorType, originalError);
          break;
        case "html_fallback":
          this._switchToHtmlRendering();
          break;
        case "offline_mode":
          this._enableOfflineMode();
          break;
        case "cleanup_and_restart":
          this._performEmergencyCleanup();
          break;
        default:
          AppDebug.warn(`Unknown recovery strategy: ${strategy.strategy}`);
      }
    }, strategy.cooldownMs);
  }

  /**
   * Execute fallback action when recovery fails
   */
  _executeFallbackAction(action) {
    AppDebug.info(`Executing fallback action: ${action}`);

    switch (action) {
      case "show_basic_simulation":
        this._showBasicSimulationFallback();
        break;
      case "use_html_rendering":
        this._switchToHtmlRendering();
        break;
      case "enable_offline_features":
        this._enableOfflineMode();
        break;
      case "force_cleanup_heavy_components":
        this._performEmergencyCleanup();
        break;
      default:
        AppDebug.warn(`Unknown fallback action: ${action}`);
        this.showError(
          "The application encountered an error and is running in degraded mode.",
        );
    }
  }

  /**
   * Retry the last operation that failed
   */
  _retryLastOperation(errorType) {
    // Implementation depends on the specific error type
    AppDebug.info(`Retrying operation for error type: ${errorType}`);
    // This would contain specific retry logic for different operations
  }

  /**
   * Switch to HTML-only rendering mode (default for simulateai)
   */
  _switchToHtmlRendering() {
    AppDebug.info("HTML-only rendering mode active");
    // Already in HTML mode - simulateai is HTML-only by design
    this.enterpriseConfig.performanceTrackingEnabled = false; // Reduce overhead
  }

  /**
   * Enable offline mode features
   */
  _enableOfflineMode() {
    AppDebug.info("Enabling offline mode");
    // Disable features that require network connectivity
    this.enterpriseConfig.telemetryEnabled = false;
    this.enterpriseConfig.errorReportingEnabled = false;
    // Show offline indicator to user
    this.showNotification(
      "Application is running in offline mode",
      "info",
      10000,
    );
  }

  /**
   * Perform emergency cleanup of heavy components
   */
  _performEmergencyCleanup() {
    AppDebug.warn("Performing emergency cleanup");

    // Clean up canvases
    if (this.currentSimulationCanvasId) {
      canvasManager.removeCanvas(this.currentSimulationCanvasId);
      this.currentSimulationCanvasId = null;
    }

    // Clear large data structures
    this.ethicsMeters.clear();
    this.interactiveButtons.clear();
    this.simulationSliders.clear();

    // Force garbage collection if available
    if (window.gc) {
      window.gc();
    }

    // Clear log buffers
    AppDebug.clearBuffers();

    AppDebug.info("Emergency cleanup completed");
  }

  /**
   * Show basic simulation fallback
   */
  _showBasicSimulationFallback() {
    AppDebug.info("Showing basic simulation fallback");
    // Show a simple text-based version of the simulation
    if (this.simulationContainer) {
      this.simulationContainer.innerHTML = `
        <div class="fallback-simulation">
          <h3>Simulation Launcher - Basic Mode</h3>
          <p>We're running in a simplified mode due to technical limitations.</p>
          <p>You can still explore ethical scenarios through this basic interface.</p>
          <button class="btn btn-primary" onclick="location.reload()">Try Full Version Again</button>
        </div>
      `;
    }
  }

  /**
   * Show enterprise error with recovery options
   */
  showEnterpriseError(message, errorType, hasRecovery = false) {
    if (!this.errorBoundary) {
      // Fallback to notification
      this.showNotification(message, "error");
      return;
    }

    // OPTIMIZED: Cache DOM queries and batch operations
    const errorContent = this.errorBoundary.querySelector(".error-content");
    if (errorContent) {
      // Get all elements at once
      const elements = {
        messageEl: errorContent.querySelector(".error-message"),
        retryBtn: errorContent.querySelector("#retry-action"),
        reportBtn: errorContent.querySelector("#report-error"),
        fallbackBtn: errorContent.querySelector("#fallback-action"),
      };

      if (elements.messageEl) elements.messageEl.textContent = message;

      // OPTIMIZED: Batch style operations
      const styleUpdates = {};

      // Setup retry functionality
      if (elements.retryBtn) {
        if (hasRecovery) {
          styleUpdates.retryDisplay = "inline-block";
          elements.retryBtn.onclick = () => {
            this.hideError();
            // Reset retry counter for this error type
            this.retryCounters.set(errorType, 0);
            // Attempt to recover
            const strategy = this.errorRecoveryStrategies.get(errorType);
            if (strategy) {
              this._executeRecoveryStrategy(
                errorType,
                strategy,
                this.lastError,
              );
            }
          };
        } else {
          styleUpdates.retryDisplay = "none";
        }
      }

      // Setup fallback action
      if (elements.fallbackBtn) {
        styleUpdates.fallbackDisplay = "inline-block";
        elements.fallbackBtn.onclick = () => {
          this.hideError();
          const strategy = this.errorRecoveryStrategies.get(errorType);
          if (strategy) {
            this._executeFallbackAction(strategy.fallbackAction);
          }
        };
      }

      // Setup error reporting
      if (elements.reportBtn) {
        elements.reportBtn.onclick = () => {
          this.reportEnterpriseError(errorType);
        };
      }

      // Apply all style updates at once
      if (elements.retryBtn && styleUpdates.retryDisplay) {
        elements.retryBtn.style.display = styleUpdates.retryDisplay;
      }
      if (elements.fallbackBtn && styleUpdates.fallbackDisplay) {
        elements.fallbackBtn.style.display = styleUpdates.fallbackDisplay;
      }
    }

    // OPTIMIZED: Batch attribute and style changes
    Object.assign(this.errorBoundary.style, {
      display: "flex",
    });
    this.errorBoundary.setAttribute("aria-hidden", "false");
  }

  /**
   * Report error to enterprise systems
   */
  reportEnterpriseError(errorType) {
    if (this.lastError) {
      const errorReport = {
        type: errorType,
        message: this.lastError.message || String(this.lastError),
        stack: this.lastError.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        sessionId: this.sessionId,
        version: this.version,
        appState: {
          initialized: this.isInitialized,
          currentSimulation: this.currentSimulation?.id,
          theme: this.currentTheme,
          memoryUsage: this._getCurrentMemoryUsage(),
          componentHealth: Object.fromEntries(this.healthStatus.components),
          circuitBreakerStates: Object.fromEntries(this.circuitBreakers),
          errorPatterns: Object.fromEntries(this.errorPatterns),
          performanceMetrics: this.performanceMetrics,
        },
      };

      // Send to analytics
      simpleAnalytics.trackEvent("error_reported", errorReport);

      // Send to enterprise error tracking
      if (window.enterpriseErrorTracking) {
        window.enterpriseErrorTracking.reportUserFeedback(errorReport);
      }

      // Show confirmation
      this.showNotification(
        "Error report sent. Thank you for helping us improve the application.",
        "success",
      );
    }
  }

  /**
   * Handle application shutdown for cleanup
   */
  _handleApplicationShutdown() {
    AppDebug.info("Application shutting down, performing cleanup");

    // Stop monitoring intervals
    this._stopEnterpriseMonitoring();

    // Flush remaining telemetry and errors
    AppDebug._flushTelemetry();
    AppDebug._flushErrors();

    // Send final health status
    if (window.enterpriseMonitoring) {
      window.enterpriseMonitoring.send("app_shutdown", {
        sessionId: this.sessionId,
        version: this.version,
        timestamp: new Date().toISOString(),
        finalHealthStatus: this.healthStatus,
        finalPerformanceMetrics: this.performanceMetrics,
        sessionDuration: Date.now() - this.performanceMetrics.initTime,
      });
    }
  }
  initializeTheme() {
    // Detect system preferences
    const prefersReducedMotion = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    ).matches;
    const prefersHighContrast = window.matchMedia?.(
      "(prefers-contrast: high)",
    ).matches;

    // Get saved user preferences (they override system preferences)
    const savedPreferences = userPreferences.getAccessibilitySettings();

    // Use saved preferences if they exist, otherwise use system preferences
    this.preferences = {
      reducedMotion:
        savedPreferences.reducedMotion !== undefined
          ? savedPreferences.reducedMotion
          : prefersReducedMotion,
      highContrast:
        savedPreferences.highContrast !== undefined
          ? savedPreferences.highContrast
          : prefersHighContrast,
      largeText: savedPreferences.largeText || false, // Default to false
    };

    this.currentTheme = this.preferences.highContrast
      ? "high-contrast"
      : "light";

    // Apply initial theme
    this.applyTheme();

    // Monitor theme changes
    this.setupThemeMonitoring();

    AppDebug.log("Theme initialized:", this.currentTheme, this.preferences);
  }

  /**
   * Initialize scroll reveal header functionality
   */
  initializeScrollRevealHeader() {
    const header = document.querySelector(".header");
    if (!header) return;

    let lastScrollY = window.scrollY;
    let headerState = "visible"; // Track current state to avoid redundant changes

    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      let newState = headerState;

      // Don't hide header at the very top of the page
      if (currentScrollY <= 10) {
        newState = "visible";
      } else {
        // Hide header when scrolling down, show when scrolling up
        if (currentScrollY > lastScrollY && currentScrollY > 100) {
          // Scrolling down - hide header
          newState = "hidden";
        } else if (currentScrollY < lastScrollY) {
          // Scrolling up - show header
          newState = "visible";
        }
      }

      // OPTIMIZED: Only update DOM if state actually changed
      if (newState !== headerState) {
        headerState = newState;

        // OPTIMIZED: Batch class operations
        if (newState === "hidden") {
          header.classList.remove("header-visible");
          header.classList.add("header-hidden");
        } else {
          header.classList.remove("header-hidden");
          header.classList.add("header-visible");
        }
      }

      lastScrollY = currentScrollY;
    };

    // Throttle scroll events for better performance
    let ticking = false;
    const throttledHandleScroll = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          handleScroll();
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", throttledHandleScroll, { passive: true });

    // Initialize header as visible
    header.classList.add("header-visible");
    headerState = "visible";

    AppDebug.log("Scroll reveal header initialized");
  }

  /**
   * Register simulateai configuration with the global configuration system
   */
  registerSimulateaiWithConfig() {
    try {
      // Register simulateai as the primary simulation gateway
      if (window.appStartup && window.appStartup.registerComponent) {
        window.appStartup.registerComponent("simulateai", {
          config: this.simulateaiConfig,
          capabilities: [
            "scenario-browser-integration",
            "mcp-enhanced-content",
            "educational-alignment",
            "enterprise-monitoring",
            "accessibility-compliant",
          ],
          dependencies: [
            "scenario-browser",
            "category-metadata-manager",
            "pre-launch-modal",
            "educational-modules",
          ],
        });
      }

      // Update feature flags for simulateai
      if (window.SimulateAI && window.SimulateAI.features) {
        window.SimulateAI.features.simulateaiIntegration = true;
        window.SimulateAI.features.scenarioBrowserIntegration =
          this.scenarioBrowserInitialized;
        window.SimulateAI.features.mcpIntegration = this.mcpInitialized;
        window.SimulateAI.features.educationalModules = !!(
          this.educatorToolkit &&
          this.digitalScienceLab &&
          this.scenarioGenerator
        );
      }

      AppDebug.log("SimulateAI registered with configuration system");
    } catch (error) {
      AppDebug.error(
        "Failed to register simulateai with config system:",
        error,
      );
    }
  }

  /**
   * Initialize scenario browser integration for enhanced navigation
   */
  async initializeScenarioBrowserIntegration() {
    try {
      AppDebug.log("Initializing scenario browser integration...");

      // Import the integration utilities dynamically
      const { ScenarioBrowserIntegration } = await import(
        "./utils/scenario-browser-integration.js"
      );

      // Create integration manager
      this.scenarioBrowserIntegration = new ScenarioBrowserIntegration(this);

      // Configure integration settings
      this.scenarioBrowserIntegration.configure({
        routeThroughSimulateAI: true,
        useSimulateAIModals: true,
        enableUnifiedNavigation: true,
        preserveEducationalContext: true,
      });

      this.scenarioBrowserInitialized = true;
      AppDebug.log("Scenario browser integration initialized successfully");

      // Make integration available globally for debugging
      window.scenarioBrowserIntegration = this.scenarioBrowserIntegration;
    } catch (error) {
      AppDebug.error(
        "Failed to initialize scenario browser integration:",
        error,
      );
      // Continue without integration - app should still function
      this.scenarioBrowserInitialized = false;
    }
  }

  /**
   * Setup theme change monitoring
   */
  setupThemeMonitoring() {
    const reducedMotionQuery = window.matchMedia?.(
      "(prefers-reduced-motion: reduce)",
    );
    const highContrastQuery = window.matchMedia?.("(prefers-contrast: high)");

    const handleThemeChange = () => {
      // Get current saved preferences to check which ones are user-set
      const savedPreferences = userPreferences.getAccessibilitySettings();

      // Only update preferences that haven't been explicitly set by the user
      const newPreferences = { ...this.preferences };

      // Update system-based preferences only if user hasn't overridden them
      if (savedPreferences.reducedMotion === undefined) {
        newPreferences.reducedMotion = reducedMotionQuery?.matches || false;
      }
      if (savedPreferences.highContrast === undefined) {
        newPreferences.highContrast = highContrastQuery?.matches || false;
      }
      // largeText is always user-controlled, so never auto-update it

      if (JSON.stringify(newPreferences) !== JSON.stringify(this.preferences)) {
        this.preferences = newPreferences;
        this.currentTheme = newPreferences.highContrast
          ? "high-contrast"
          : "light";
        this.applyTheme();
        this.announceThemeChange();

        AppDebug.log(
          "System theme changed, updated non-user-set preferences:",
          newPreferences,
        );
      }
    };

    reducedMotionQuery?.addEventListener?.("change", handleThemeChange);
    highContrastQuery?.addEventListener?.("change", handleThemeChange);
  }

  /**
   * Apply current theme to the application
   */
  applyTheme() {
    const { body } = document;

    // OPTIMIZED: Batch class operations to avoid multiple layout recalculations
    const classesToRemove = ["high-contrast", "reduced-motion", "large-text"];
    const classesToAdd = [];

    // Determine which classes to add
    if (this.preferences.highContrast) classesToAdd.push("high-contrast");
    if (this.preferences.reducedMotion) classesToAdd.push("reduced-motion");
    if (this.preferences.largeText) classesToAdd.push("large-text");

    // Remove existing theme classes
    body.classList.remove(...classesToRemove);

    // Add new theme classes
    if (classesToAdd.length > 0) {
      body.classList.add(...classesToAdd);
    }

    // Update button states (aria-pressed attributes)
    this.updateButtonStates();

    // OPTIMIZED: Cache theme color meta query
    if (!this._themeColorMeta) {
      this._themeColorMeta = document.querySelector('meta[name="theme-color"]');
    }

    // Update theme color meta tag
    if (this._themeColorMeta) {
      const themeColor = "#1a73e8"; // Always use light theme color
      this._themeColorMeta.setAttribute("content", themeColor);
    }

    // Update managers if they exist
    if (this.animationManager) {
      // Update the animation manager theme when preferences change
      this.animationManager.updateAnimationDefaults();
    }

    if (this.accessibilityManager) {
      this.accessibilityManager.updateTheme(this.preferences);
    }
  }

  /**
   * Update accessibility button states
   */
  updateButtonStates() {
    // OPTIMIZED: Cache button queries and batch attribute updates
    if (!this._accessibilityButtons) {
      this._accessibilityButtons = {
        highContrast: document.getElementById("toggle-high-contrast"),
        largeText: document.getElementById("toggle-large-text"),
        reducedMotion: document.getElementById("toggle-reduced-motion"),
      };
    }

    const { highContrast, largeText, reducedMotion } =
      this._accessibilityButtons;

    // OPTIMIZED: Batch attribute updates to minimize DOM mutations
    const updates = [];

    if (highContrast) {
      updates.push({
        element: highContrast,
        value: this.preferences.highContrast.toString(),
      });
    }
    if (largeText) {
      updates.push({
        element: largeText,
        value: this.preferences.largeText.toString(),
      });
    }
    if (reducedMotion) {
      updates.push({
        element: reducedMotion,
        value: this.preferences.reducedMotion.toString(),
      });
    }

    // Apply all updates
    updates.forEach(({ element, value }) => {
      element.setAttribute("aria-pressed", value);
    });
  }

  /**
   * Announce theme changes for accessibility
   */
  announceThemeChange() {
    const announcement = `Theme changed to ${this.currentTheme.replace("-", " ")} mode`;

    if (this.accessibilityManager) {
      this.accessibilityManager.announce(announcement);
    } else {
      // OPTIMIZED: Cache live region query
      if (!this._liveRegion) {
        this._liveRegion = document.getElementById("aria-live-polite");
      }

      // Fallback announcement
      if (this._liveRegion) {
        this._liveRegion.textContent = announcement;
      }
    }
  }

  /**
   * Initialize error handling and recovery
   */
  initializeErrorHandling() {
    // Create error boundary element
    this.errorBoundary = document.getElementById("error-boundary");

    // Global error handlers
    window.addEventListener("error", (event) => {
      const error = event.error || event.message || event;
      this.handleError(error, "A JavaScript error occurred");
    });

    window.addEventListener("unhandledrejection", (event) => {
      this.handleError(event.reason, "An unhandled promise rejection occurred");
    });

    AppDebug.log("Error handling initialized");
  }

  /**
   * Register this app with the Global Event Manager
   */
  registerWithEventManager() {
    globalEventManager.registerComponent("simulateAIApp", this, {
      "navigation.start_learning": this.handleStartLearning.bind(this),
      "simulation.start": this.handleSimulationStart.bind(this),
      "simulation.quick-start": this.handleSimulationQuickStart.bind(this),
      "simulation.reset": this.handleSimulationReset.bind(this),
      "simulation.next": this.handleSimulationNext.bind(this),
      "simulation.close": this.handleSimulationClose.bind(this),
      "modal.close": this.handleModalClose.bind(this),
      "modal.backdrop-click": this.handleModalBackdropClick.bind(this),
      "modal.tab-trap": this.handleModalTabTrap.bind(this),
      "demo.pattern": this.handleDemoPattern.bind(this),
      "system.escape": this.handleEscapeKey.bind(this),
      "system.scroll": this.handleScrollEvent.bind(this),
      "accessibility.theme_change": this.handleThemeChange.bind(this),
      "system.app_shutdown": this.handleAppShutdown.bind(this),
      "system.error": this.handleGlobalError.bind(this),
      "system.unhandled_rejection": this.handleUnhandledRejection.bind(this),
    });
  }

  /**
   * Handle start learning event from Global Event Manager
   */
  handleStartLearning() {
    const categoriesSection = document.getElementById("categories");
    if (categoriesSection) {
      categoriesSection.scrollIntoView({ behavior: "smooth" });
    }
  }

  /**
   * Handle simulation start events from Global Event Manager
   */
  handleSimulationStart(data) {
    const { simulationId } = data;
    if (simulationId) {
      this.startSimulation(simulationId);
    }
  }

  /**
   * Handle simulation quick start events from Global Event Manager
   */
  handleSimulationQuickStart(data) {
    const { simulationId } = data;
    if (simulationId) {
      this.launchSimulationDirect(simulationId);
    }
  }

  /**
   * Handle simulation reset from Global Event Manager
   */
  handleSimulationReset() {
    this.resetCurrentSimulation();
  }

  /**
   * Handle simulation next from Global Event Manager
   */
  handleSimulationNext() {
    this.nextScenario();
  }

  /**
   * Handle simulation close from Global Event Manager
   */
  handleSimulationClose() {
    this.closeSimulation();
  }

  /**
   * Handle modal close from Global Event Manager
   */
  handleModalClose() {
    this.closeSimulation();
  }

  /**
   * Handle modal backdrop clicks from Global Event Manager
   */
  handleModalBackdropClick(data) {
    const { event } = data;
    if (event.target === this.modal) {
      this.closeSimulation();
    }
  }

  /**
   * Handle modal tab trapping from Global Event Manager
   */
  handleModalTabTrap(data) {
    const { event } = data;
    this.trapFocusInModal(event);
  }

  /**
   * Handle demo pattern events from Global Event Manager
   */
  handleDemoPattern(data) {
    const { pattern } = data;
    if (window.simulateEthicsPattern) {
      window.simulateEthicsPattern(pattern);
    }
  }

  /**
   * Handle escape key from Global Event Manager
   */
  handleEscapeKey() {
    if (this.modal && this.modal.classList.contains("visible")) {
      this.closeSimulation();
    }
  }

  /**
   * Handle scroll events from Global Event Manager
   */
  handleScrollEvent() {
    // The scroll reveal header is already handled by individual components
    // This could be used for additional scroll-based features if needed
  }

  /**
   * Handle theme changes from Global Event Manager
   */
  handleThemeChange(data) {
    const { type, matches } = data;

    if (type === "reduced_motion") {
      this.preferences.reducedMotion = matches;
    } else if (type === "high_contrast") {
      this.preferences.highContrast = matches;
    }

    this.currentTheme = this.preferences.highContrast
      ? "high-contrast"
      : "light";
    this.applyTheme();
    this.announceThemeChange();
  }

  /**
   * Handle app shutdown from Global Event Manager
   */
  handleAppShutdown() {
    this._handleApplicationShutdown();
  }

  /**
   * Handle global errors from Global Event Manager
   */
  handleGlobalError(data) {
    const { event } = data;
    this.handleError(event.error || event.message);
  }

  /**
   * Handle unhandled promise rejections from Global Event Manager
   */
  handleUnhandledRejection(data) {
    const { event } = data;
    this.handleError(event.reason, "An unhandled promise rejection occurred");
  }
  handleError(error, userMessage = "An unexpected error occurred") {
    this.lastError = error;
    AppDebug.error("App Error:", error);

    // Safely extract error message
    let errorMessage = "Unknown error";
    if (error && typeof error === "object") {
      errorMessage =
        error.message || error.toString() || "Error object without message";
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error) {
      errorMessage = String(error);
    }

    // Track error for analytics
    simpleAnalytics.trackEvent("app_error", {
      error_message: errorMessage,
      error_stack:
        error && error.stack ? error.stack : "No stack trace available",
      user_agent: navigator.userAgent,
      timestamp: new Date().toISOString(),
    });

    // Show error to user
    this.showError(userMessage);

    // Announce error for accessibility
    if (this.accessibilityManager) {
      this.accessibilityManager.announce(`Error: ${userMessage}`, "assertive");
    }
  }

  /**
   * Show error in error boundary
   */
  showError(message, isRecoverable = true) {
    if (!this.errorBoundary) {
      // Fallback to alert if no error boundary
      alert(message);
      return;
    }

    // OPTIMIZED: Cache DOM queries for error content
    if (!this._errorElements) {
      const errorContent = this.errorBoundary.querySelector(".error-content");
      if (errorContent) {
        this._errorElements = {
          content: errorContent,
          messageEl: errorContent.querySelector(".error-message"),
          retryBtn: errorContent.querySelector("#retry-action"),
          reportBtn: errorContent.querySelector("#report-error"),
        };
      }
    }

    if (this._errorElements && this._errorElements.content) {
      const { messageEl, retryBtn, reportBtn } = this._errorElements;

      if (messageEl) messageEl.textContent = message;

      // OPTIMIZED: Batch style operations
      if (retryBtn) {
        const displayValue = isRecoverable ? "inline-block" : "none";
        retryBtn.style.display = displayValue;

        if (isRecoverable) {
          retryBtn.onclick = () => {
            this.hideError();
            // Attempt to recover by reinitializing
            if (!this.isInitialized) {
              this.init();
            }
          };
        }
      }

      // Setup error reporting
      if (reportBtn) {
        reportBtn.onclick = () => {
          this.reportError();
        };
      }
    }

    // OPTIMIZED: Batch attribute and style changes
    Object.assign(this.errorBoundary.style, {
      display: "flex",
    });
    this.errorBoundary.setAttribute("aria-hidden", "false");
  }

  /**
   * Hide error boundary
   */
  hideError() {
    if (this.errorBoundary) {
      // OPTIMIZED: Batch attribute and style changes
      Object.assign(this.errorBoundary.style, {
        display: "none",
      });
      this.errorBoundary.setAttribute("aria-hidden", "true");
    }
  }

  /**
   * Report error to analytics/support
   */
  reportError() {
    if (this.lastError) {
      const errorReport = {
        message: this.lastError.message || String(this.lastError),
        stack: this.lastError.stack,
        userAgent: navigator.userAgent,
        url: window.location.href,
        timestamp: new Date().toISOString(),
        appState: {
          initialized: this.isInitialized,
          currentSimulation: this.currentSimulation?.id,
          theme: this.currentTheme,
        },
      };

      // Send to analytics
      simpleAnalytics.trackEvent("error_reported", errorReport);

      // Show confirmation
      alert(
        "Error report sent. Thank you for helping us improve the application.",
      );
    }
  }

  async initializeSystems() {
    try {
      // Initialize system metadata collector for analytics
      // Note: Firebase service may not be available yet, will be updated after Firebase init
      this.systemCollector = getSystemCollector();
      AppDebug.log(
        "System metadata collector initialized (will connect to Firebase when available)",
      );

      // Initialize animation manager with theme preferences
      this.animationManager = new AnimationManager({
        enableAnimations: !this.preferences.reducedMotion,
        reducedMotion: this.preferences.reducedMotion,
        performanceMode: this.preferences.reducedMotion
          ? "compatibility"
          : "balanced",
      });

      // Initialize accessibility manager with current preferences
      this.accessibilityManager = new AccessibilityManager(document.body, {
        theme: this.currentTheme,
        preferences: this.preferences,
      });

      // Initialize core educational modules
      await this.initializeCoreModules();

      // Visual Engine configuration (HTML-only for simulateai)
      // Simplified for focused gateway architecture
      this.visualEngineConfig = {
        renderMode: "html",
        accessibility: true,
        debug: false,
      };

      // Systems are already initialized via their modules
      // Simple analytics auto-initializes

      // Initialize Enhanced Analytics Manager - Phase 3.1 Integration
      try {
        // Initialize static version for backward compatibility
        await this.analyticsManager.init({
          enabled: true,
          anonymizeData: true,
          batchSize: 20,
          flushInterval: 30000,
          debug: AppDebug.isDebugMode(),
          trackPerformance: true,
          trackAccessibility: true,
          trackErrors: true,
          gdprCompliant: true,
          retentionDays: 90,
        });

        // Create enhanced instance with DataHandler support
        this.analyticsInstance = new AnalyticsManager(this);
        await this.analyticsInstance.init({
          enabled: true,
          anonymizeData: true,
          batchSize: 20,
          flushInterval: 30000,
          debug: AppDebug.isDebugMode(),
          trackPerformance: true,
          trackAccessibility: true,
          trackErrors: true,
          gdprCompliant: true,
          retentionDays: 90,
        });
        AppDebug.log("Enhanced Analytics Manager initialized successfully");
      } catch (error) {
        AppDebug.warn(
          "Enhanced Analytics Manager initialization failed:",
          error,
        );
        // Fall back to simple analytics only
      }

      AppDebug.log("Core systems initialized with modernized infrastructure");
    } catch (error) {
      AppDebug.error("Failed to initialize systems:", error);
      throw error;
    }
  }

  /**
   * Initialize core educational modules
   */
  async initializeCoreModules() {
    try {
      // Initialize DataHandler for centralized data management
      this.dataHandler = new DataHandler({
        appName: "SimulateAI",
        version: "1.40",
        enableFirebase: true,
        enableCaching: true,
        enableOfflineQueue: true,
      });
      await this.dataHandler.initialize(this.firebaseService);
      AppDebug.log("DataHandler initialized");

      // Initialize UIBinder for unified UI management
      this.uiBinder = new UIBinder({
        enableThemeManager: true,
        enableAccessibility: true,
        enablePerformanceMonitoring: true,
        dataHandler: this.dataHandler,
      });
      await this.uiBinder.initialize();
      AppDebug.log("UIBinder initialized");

      // Initialize UIManager for enhanced UI state management (Phase 3.2)
      this.uiManager = new UIManager(this);
      await this.uiManager.initialize();
      AppDebug.log("UIManager initialized with DataHandler integration");

      // Initialize PerformanceMonitor for enhanced metrics tracking (Phase 3.3)
      this.performanceMonitor = PerformanceMonitor.getAppMonitor(this);
      this.appPerformanceMonitor = PerformanceMonitor.createEnhancedMonitor(
        "app_lifecycle",
        this,
      );
      PerformanceMonitor.enable(); // Enable global monitoring
      AppDebug.log(
        "PerformanceMonitor initialized with DataHandler integration",
      );

      // Initialize ComponentRegistry for enhanced component tracking (Phase 3.4)
      this.componentRegistry = ComponentRegistry.getAppRegistry(this);
      await this.componentRegistry.initializeDataHandlerIntegration();
      AppDebug.log(
        "ComponentRegistry initialized with DataHandler integration",
      );

      // Initialize PWAService for enhanced Progressive Web App features (Phase 3.5)
      this.pwaService = new PWAService(this.firebaseService, this);
      await this.pwaService.init();
      AppDebug.log("PWAService initialized with DataHandler integration");

      // Initialize Educator Toolkit
      this.educatorToolkit = new EducatorToolkit();
      AppDebug.log("Educator Toolkit initialized");

      // Initialize Digital Science Lab
      this.digitalScienceLab = new DigitalScienceLab();
      AppDebug.log("Digital Science Lab initialized");

      // Initialize Scenario Generator
      this.scenarioGenerator = new ScenarioGenerator();
      AppDebug.log("Scenario Generator initialized");

      // Initialize Badge Manager (using existing singleton)
      this.badgeManager = badgeManager;
      AppDebug.log("Badge Manager initialized (using singleton instance)");

      // Connect the modules for integrated functionality
      this.connectEducationalModules();
    } catch (error) {
      AppDebug.error("Failed to initialize core educational modules:", error);
      throw error;
    }
  }

  /**
   * Connect educational modules for integrated functionality
   */
  connectEducationalModules() {
    // Connect DataHandler and UIBinder to provide centralized services
    if (this.dataHandler && this.uiBinder) {
      try {
        // Make DataHandler available to all educational modules
        if (
          this.educatorToolkit &&
          typeof this.educatorToolkit.setDataHandler === "function"
        ) {
          this.educatorToolkit.setDataHandler(this.dataHandler);
        }
        if (
          this.digitalScienceLab &&
          typeof this.digitalScienceLab.setDataHandler === "function"
        ) {
          this.digitalScienceLab.setDataHandler(this.dataHandler);
        }
        if (
          this.scenarioGenerator &&
          typeof this.scenarioGenerator.setDataHandler === "function"
        ) {
          this.scenarioGenerator.setDataHandler(this.dataHandler);
        }

        // Make UIBinder available for consistent theming and UI management
        if (
          this.educatorToolkit &&
          typeof this.educatorToolkit.setUIBinder === "function"
        ) {
          this.educatorToolkit.setUIBinder(this.uiBinder);
        }
        if (
          this.digitalScienceLab &&
          typeof this.digitalScienceLab.setUIBinder === "function"
        ) {
          this.digitalScienceLab.setUIBinder(this.uiBinder);
        }
        if (
          this.scenarioGenerator &&
          typeof this.scenarioGenerator.setUIBinder === "function"
        ) {
          this.scenarioGenerator.setUIBinder(this.uiBinder);
        }

        AppDebug.log(
          "DataHandler and UIBinder connected to educational modules",
        );
      } catch (error) {
        AppDebug.warn(
          "Failed to connect DataHandler/UIBinder to educational modules:",
          error,
        );
      }
    }

    // Connect scenario generator to educator toolkit for assessment alignment
    if (this.educatorToolkit && this.scenarioGenerator) {
      try {
        if (typeof this.educatorToolkit.setScenarioGenerator === "function") {
          this.educatorToolkit.setScenarioGenerator(this.scenarioGenerator);
        } else {
          AppDebug.warn(
            "EducatorToolkit.setScenarioGenerator method not available",
          );
        }
      } catch (error) {
        AppDebug.warn(
          "Failed to connect scenario generator to educator toolkit:",
          error,
        );
      }
    }

    // Connect digital science lab to both toolkit and generator
    if (this.digitalScienceLab) {
      if (this.educatorToolkit) {
        try {
          if (typeof this.digitalScienceLab.setEducatorToolkit === "function") {
            this.digitalScienceLab.setEducatorToolkit(this.educatorToolkit);
          } else {
            AppDebug.warn(
              "DigitalScienceLab.setEducatorToolkit method not available",
            );
          }
        } catch (error) {
          AppDebug.warn(
            "Failed to connect educator toolkit to digital science lab:",
            error,
          );
        }
      }
      if (this.scenarioGenerator) {
        try {
          if (
            typeof this.digitalScienceLab.setScenarioGenerator === "function"
          ) {
            this.digitalScienceLab.setScenarioGenerator(this.scenarioGenerator);
          } else {
            AppDebug.warn(
              "DigitalScienceLab.setScenarioGenerator method not available",
            );
          }
        } catch (error) {
          AppDebug.warn(
            "Failed to connect scenario generator to digital science lab:",
            error,
          );
        }
      }
    }

    AppDebug.log("Educational modules connected successfully");

    // Enhance simulateai configuration with educational context
    this.enhanceSimulateaiWithEducationalModules();
  }

  /**
   * Enhance the simulateai configuration with educational module capabilities
   */
  enhanceSimulateaiWithEducationalModules() {
    try {
      // Add educational context to simulateai config
      if (this.simulateaiConfig) {
        this.simulateaiConfig.educationalEnhancements = {
          curriculumAlignment: true,
          assessmentIntegration: true,
          labStationSupport: true,
          scenarioGeneration: true,
        };

        // Add educational metadata
        this.simulateaiConfig.educationalMetadata = {
          gradeLevel: "6-12",
          subjects: [
            "Computer Science",
            "Ethics",
            "Social Studies",
            "Critical Thinking",
          ],
          standards: ["ISTE", "NGSS", "CCSS"],
          learningObjectives: [
            "Understand AI bias and fairness",
            "Analyze ethical decision-making frameworks",
            "Evaluate societal impact of AI systems",
            "Develop critical thinking about technology",
          ],
        };

        // Connect educational modules to simulateai
        if (this.educatorToolkit) {
          try {
            // Check if method exists before calling
            if (
              typeof this.educatorToolkit.getAvailableAssessments === "function"
            ) {
              this.simulateaiConfig.assessmentCapabilities =
                this.educatorToolkit.getAvailableAssessments();
            } else {
              this.simulateaiConfig.assessmentCapabilities = [
                "basic-assessment",
              ];
            }
          } catch (error) {
            AppDebug.warn("Failed to get educator toolkit assessments:", error);
            this.simulateaiConfig.assessmentCapabilities = ["basic-assessment"];
          }
        }

        if (this.digitalScienceLab) {
          try {
            // Check if method exists before calling
            if (
              typeof this.digitalScienceLab.getAvailableStations === "function"
            ) {
              this.simulateaiConfig.labStations =
                this.digitalScienceLab.getAvailableStations();
            } else {
              this.simulateaiConfig.labStations = ["ethics-analysis-station"];
            }
          } catch (error) {
            AppDebug.warn("Failed to get digital science lab stations:", error);
            this.simulateaiConfig.labStations = ["ethics-analysis-station"];
          }
        }

        if (this.scenarioGenerator) {
          try {
            // Check if method exists before calling
            if (typeof this.scenarioGenerator.getCapabilities === "function") {
              this.simulateaiConfig.generationCapabilities =
                this.scenarioGenerator.getCapabilities();
            } else {
              this.simulateaiConfig.generationCapabilities = [
                "basic-generation",
              ];
            }
          } catch (error) {
            AppDebug.warn(
              "Failed to get scenario generator capabilities:",
              error,
            );
            this.simulateaiConfig.generationCapabilities = ["basic-generation"];
          }
        }

        AppDebug.log(
          "SimulateAI configuration enhanced with educational modules",
          this.simulateaiConfig.educationalEnhancements,
        );
      }
    } catch (error) {
      AppDebug.error(
        "Failed to enhance simulateai with educational modules:",
        error,
      );
    }
  }

  /**
   * Get educational context for a simulation configuration
   * Enhanced with better error handling, fallback data, and debugging
   * @param {Object} config - The simulation configuration
   * @returns {Object} Educational context with curriculum alignment, assessments, and lab stations
   */
  getEducationalContext(config) {
    const context = {
      curriculum: null,
      assessments: null,
      labStations: null,
      scenarioTemplates: null,
    };

    try {
      AppDebug.log("Getting educational context for config:", config);

      // Validate config
      if (!config) {
        AppDebug.warn("No simulation config provided for educational context");
        return this._getEducationalContextFallback("simulateai");
      }

      // Educational methods are now handled by PreLaunchModal dynamically
      // This avoids redundant calls and centralizes educational content generation

      // Get relevant lab stations from Digital Science Lab
      if (this.digitalScienceLab && config?.tags) {
        try {
          context.labStations = this.digitalScienceLab.getRelevantStations(
            config.tags,
          );
          AppDebug.log("Lab stations retrieved:", context.labStations);
        } catch (error) {
          AppDebug.error("Error getting lab stations:", error);
          context.labStations = null;
        }
      } else {
        AppDebug.warn(
          "Digital Science Lab not available or config missing tags",
          {
            hasLab: !!this.digitalScienceLab,
            hasTags: !!config?.tags,
          },
        );
      }

      // Get scenario templates from Scenario Generator
      if (this.scenarioGenerator && config?.tags) {
        try {
          context.scenarioTemplates =
            this.scenarioGenerator.getTemplatesForTags(config.tags);
          AppDebug.log(
            "Scenario templates retrieved:",
            context.scenarioTemplates,
          );
        } catch (error) {
          AppDebug.error("Error getting scenario templates:", error);
          context.scenarioTemplates = null;
        }
      } else {
        AppDebug.warn(
          "Scenario Generator not available or config missing tags",
          {
            hasGenerator: !!this.scenarioGenerator,
            hasTags: !!config?.tags,
          },
        );
      }

      // Check if we have any valid educational data
      const hasValidData =
        (context.curriculum &&
          Array.isArray(context.curriculum) &&
          context.curriculum.length > 0) ||
        (context.assessments &&
          Array.isArray(context.assessments) &&
          context.assessments.length > 0) ||
        (context.labStations &&
          Array.isArray(context.labStations) &&
          context.labStations.length > 0) ||
        (context.scenarioTemplates &&
          Array.isArray(context.scenarioTemplates) &&
          context.scenarioTemplates.length > 0);

      if (!hasValidData) {
        AppDebug.warn(
          "No valid educational data found, using fallback",
          context,
        );
        return this._getEducationalContextFallback(config.id || "simulateai");
      }

      AppDebug.log("Educational context successfully generated:", context);
      return context;
    } catch (error) {
      AppDebug.error("Failed to get educational context:", error);
      return this._getEducationalContextFallback(config?.id || "simulateai"); // Return fallback context on error
    }
  }

  /**
   * Generate fallback educational context for testing and demonstration
   * @private
   */
  _getEducationalContextFallback(simulationId) {
    AppDebug.log("Generating fallback educational context for:", simulationId);

    return {
      curriculum: [
        {
          standard: "CCSS.ELA-LITERACY.RST.9-10.7",
          code: "RST.9-10.7",
          description:
            "Translate quantitative or technical information expressed in words in a text into visual form",
          gradeLevel: "9-12",
          subject: "English Language Arts & Literacy",
        },
        {
          standard: "NGSS.HS-ETS1-3",
          code: "HS-ETS1-3",
          description:
            "Evaluate a solution to a complex real-world problem based on prioritized criteria",
          gradeLevel: "9-12",
          subject: "Engineering Design",
        },
        {
          standard: "CSTA.3A-AP-13",
          code: "3A-AP-13",
          description:
            "Create prototypes that use algorithms to solve computational problems",
          gradeLevel: "9-12",
          subject: "Computer Science",
        },
      ],
      assessments: [
        {
          name: "Ethical Decision Making Rubric",
          type: "Performance Assessment",
          description:
            "Evaluate student ability to analyze ethical dilemmas and propose solutions",
          difficulty: "intermediate",
          timeEstimate: 15,
        },
        {
          name: "AI Ethics Knowledge Check",
          type: "Formative Assessment",
          description:
            "Quick check of understanding for key AI ethics concepts",
          difficulty: "beginner",
          timeEstimate: 10,
        },
        {
          name: "Scenario Analysis Portfolio",
          type: "Summative Assessment",
          description:
            "Students demonstrate learning through reflection and analysis",
          difficulty: "advanced",
          timeEstimate: 45,
        },
      ],
      labStations: [
        {
          name: "AI Bias Detection Lab",
          category: "Hands-on Investigation",
          purpose:
            "Students examine real-world examples of AI bias and develop detection strategies",
          equipment: ["Computers", "Dataset samples", "Analysis worksheets"],
          duration: 30,
          groupSize: "2-3",
        },
        {
          name: "Ethical Framework Station",
          category: "Collaborative Discussion",
          purpose: "Apply different ethical frameworks to AI scenarios",
          equipment: [
            "Framework reference cards",
            "Scenario cards",
            "Flipchart paper",
          ],
          duration: 25,
          groupSize: "4-5",
        },
        {
          name: "AI Impact Timeline",
          category: "Research & Analysis",
          purpose: "Create timeline of AI development and its societal impacts",
          equipment: [
            "Research materials",
            "Timeline template",
            "Presentation tools",
          ],
          duration: 40,
          groupSize: "3-4",
        },
      ],
      scenarioTemplates: [
        {
          title: "AI in Healthcare Decisions",
          description:
            "Explore ethical considerations when AI systems make medical recommendations",
          difficulty: "intermediate",
          estimatedTime: 20,
          tags: ["healthcare", "bias", "transparency"],
        },
        {
          title: "Autonomous Vehicle Dilemma",
          description: "Examine moral choices in self-driving car programming",
          difficulty: "advanced",
          estimatedTime: 25,
          tags: ["transportation", "safety", "decision-making"],
        },
        {
          title: "AI Hiring Systems",
          description:
            "Analyze fairness and bias in AI-powered recruitment tools",
          difficulty: "beginner",
          estimatedTime: 18,
          tags: ["employment", "fairness", "discrimination"],
        },
      ],
    };
  }

  /**
   * Connect core educational modules to a simulation instance
   * @param {Object} simulation - The simulation instance
   * @param {Object} config - The simulation configuration
   */
  connectModulesToSimulation(simulation, config) {
    try {
      // Connect Educator Toolkit
      if (this.educatorToolkit && simulation) {
        simulation.educatorToolkit = this.educatorToolkit;
        // Educational methods are now called dynamically by PreLaunchModal
        // This avoids redundant property assignment
      }

      // Connect Digital Science Lab
      if (this.digitalScienceLab && simulation) {
        simulation.digitalScienceLab = this.digitalScienceLab;

        // Get relevant lab stations for this simulation
        const relevantStations = this.digitalScienceLab.getRelevantStations(
          config.tags || [],
        );
        if (relevantStations) {
          simulation.labStations = relevantStations;
        }
      }

      // Connect Scenario Generator
      if (this.scenarioGenerator && simulation) {
        simulation.scenarioGenerator = this.scenarioGenerator;

        // If this simulation can use generated scenarios, provide them
        if (simulation.supportsGeneratedScenarios) {
          const generatedScenarios = this.scenarioGenerator.generateScenarios(
            config.tags?.[0] || "general",
            config.difficulty || "beginner",
          );
          if (generatedScenarios) {
            simulation.generatedScenarios = generatedScenarios;
          }
        }
      }

      AppDebug.log(
        `Educational modules connected to simulation: ${simulation.id || "unknown"}`,
      );
    } catch (error) {
      AppDebug.error(
        "Failed to connect educational modules to simulation:",
        error,
      );
      // Non-critical error - simulation can still function without full integration
    }
  }

  setupUI() {
    // Check if we're on the main app page (not the landing page)
    const isAppPage =
      window.location.pathname.includes("app.html") ||
      document.querySelector(".categories-grid") !== null;

    if (!isAppPage) {
      // We're on the landing page, skip UI setup
      return;
    }

    // Get key UI elements
    this.modal = document.getElementById("simulation-modal");
    this.simulationContainer = document.getElementById("simulation-container");
    this.categoriesGrid = document.querySelector(".categories-grid");
    this.loading = document.getElementById("loading");

    if (!this.categoriesGrid) {
      AppDebug.error("Categories grid not found");
      return;
    }

    // Initialize MainGrid
    this.initializeMainGrid();
  }

  /**
   * Initialize the main grid system
   */
  initializeMainGrid() {
    try {
      AppDebug.log("Attempting to initialize MainGrid...");

      // Add a small delay to ensure DOM is fully ready
      setTimeout(() => {
        this.categoryGrid = new MainGrid();

        // Pass the SimulateAI initializer function to MainGrid for coordination
        this.categoryGrid.setSimulateAIInitializer(
          this.createSimulateAIFunction(),
        );

        AppDebug.log(
          "Main grid initialized successfully with SimulateAI coordination",
        );
      }, 100);
    } catch (error) {
      AppDebug.error("Failed to initialize main grid:", error);
      // Fallback to legacy simulation loading if category grid fails
      this.loadLegacySimulations();
    }
  }

  /**
   * Create the SimulateAI function that MainGrid can use to coordinate
   * category-grid and scenario-browser components
   * @returns {Object} SimulateAI coordination interface
   */
  createSimulateAIFunction() {
    return {
      // Core simulation launcher
      launchSimulation: (config) => this.startSimulation("simulateai", config),

      // Navigation coordination
      navigateToCategory: (categoryId) =>
        this.navigateToSpecificScenario(categoryId, null, "category_nav"),
      navigateToScenario: (categoryId, scenarioId) =>
        this.navigateToSpecificScenario(categoryId, scenarioId, "scenario_nav"),

      // Component integration methods
      initializeCategoryGrid: () => this.initializeCategoryGridComponent(),
      initializeScenarioBrowser: () =>
        this.initializeScenarioBrowserComponent(),

      // App services access - Phase 3.1 Enhanced Analytics
      getAnalytics: () => this.analyticsManager, // Static version for backward compatibility
      getAnalyticsInstance: () => this.analyticsInstance, // Enhanced instance with DataHandler
      getBadgeManager: () => this.badgeManager,
      getAccessibilityManager: () => this.accessibilityManager,
      getAnimationManager: () => this.animationManager,
      getDataHandler: () => this.dataHandler,
      getUIBinder: () => this.uiBinder,

      // Configuration access
      getConfig: () => this.simulateaiConfig,
      getAppConfig: () => this.getAppConfig(),
      getPreferences: () => this.preferences,

      // Event coordination
      onSimulationComplete: (data) => this.handleSimulationComplete(data),
      onError: (error, context) => this.handleError(error, context),

      // State management
      getCurrentUser: () => this.currentUser,
      getCurrentTheme: () => this.currentTheme,

      // Enhanced features
      trackEvent: (eventName, data) =>
        this.trackUserInteraction(eventName, data),
      showBadge: (badgeId) => this.badgeManager?.showBadgeModal?.(badgeId),

      // Performance and monitoring
      getHealthStatus: () => this.healthStatus,
      getPerformanceMetrics: () => this.performanceMetrics,

      // Enterprise features
      handleEnterpriseError: (error, context) =>
        this.handleEnterpriseError(
          error,
          "MainGrid coordination error",
          context,
        ),

      // Accessibility support
      announceToScreenReader: (message, priority = "polite") => {
        if (this.accessibilityManager) {
          this.accessibilityManager.announce(message, priority);
        }
      },
    };
  }

  /**
   * Initialize category grid component (called by MainGrid)
   * @returns {boolean} Success status
   */
  initializeCategoryGridComponent() {
    try {
      AppDebug.log(
        "Initializing category grid component for MainGrid coordination",
      );

      // Category grid initialization logic
      // This would load and setup category-grid.js if it exists as a separate component

      // For now, category functionality is built into MainGrid
      // Future: This could initialize a separate CategoryGrid component

      AppDebug.log("Category grid component initialized successfully");
      return true;
    } catch (error) {
      AppDebug.error("Failed to initialize category grid component:", error);
      this.handleEnterpriseError(
        error,
        "Category grid component initialization failed",
        "category_grid_init",
      );
      return false;
    }
  }

  /**
   * Initialize scenario browser component (called by MainGrid)
   * @returns {Object|null} Scenario browser instance or null
   */
  initializeScenarioBrowserComponent() {
    try {
      AppDebug.log(
        "Initializing scenario browser component for MainGrid coordination",
      );

      // Check if ScenarioBrowser is available globally
      if (window.ScenarioBrowser) {
        this.scenarioBrowser = new window.ScenarioBrowser({
          integrateWithSimulateAI: true,
          routeThroughSimulateAI: true,
          useSimulateAIModals: true,
          parentContext: "main-grid",
          onNavigationRequest: (categoryId, scenarioId) => {
            // Handle navigation requests from scenario browser
            this.navigateToSpecificScenario(
              categoryId,
              scenarioId,
              "scenario_browser",
            );
          },
        });

        // Initialize the scenario browser
        if (this.scenarioBrowser.init) {
          this.scenarioBrowser.init();
        }

        AppDebug.log("Scenario browser component initialized successfully");
        return this.scenarioBrowser;
      } else {
        AppDebug.warn(
          "ScenarioBrowser not available, using built-in scenario functionality",
        );
        return null;
      }
    } catch (error) {
      AppDebug.error("Failed to initialize scenario browser component:", error);
      this.handleEnterpriseError(
        error,
        "Scenario browser component initialization failed",
        "scenario_browser_init",
      );
      return null;
    }
  }

  /**
   * Fallback method for legacy simulation loading
   */
  loadLegacySimulations() {
    AppDebug.log("Loading legacy simulation cards as fallback");
    // This will be populated with existing simulation loading logic if needed
    // For now, just log that we're in fallback mode
  }

  /**
   * Initialize hero entrance animations
   * Triggers elegant fade-in and slide-up animations for the hero section
   */
  initializeHeroAnimations() {
    try {
      // Add 'loaded' class to html element to trigger CSS animations
      document.documentElement.classList.add("loaded");

      // Optional: Add slight delay to ensure all elements are rendered
      setTimeout(() => {
        // Additional animation triggers can be added here if needed
        logger.info("Hero entrance animations initialized successfully");
      }, 100);
    } catch (error) {
      logger.error("Failed to initialize hero animations:", error);
      // Non-critical error - page will still function without animations
    }
  }

  /**
   * Initialize modal footer management system
   */
  initializeModalFooterManager() {
    try {
      // Initialize the modal footer manager
      this.modalFooterManager = new ModalFooterManager();

      // Store reference for cleanup
      this.modalFooterManager.app = this;

      logger.info("Modal footer manager initialized successfully");
    } catch (error) {
      logger.error("Failed to initialize modal footer manager:", error);
      // Non-critical error - modals will still work with basic functionality
    }
  }

  /**
   * Initialize ethics radar demo system
   */
  async initializeEthicsRadarDemo() {
    try {
      // Only initialize if the hero demo container exists
      const demoContainer = document.getElementById("hero-ethics-chart");
      if (demoContainer) {
        // Initialize the ethics radar demo
        ethicsDemo = new EthicsRadarDemo();

        logger.info("Ethics radar demo initialized successfully");
      } else {
        logger.warn(
          "Hero ethics chart container not found, skipping radar demo initialization",
        );
      }
    } catch (error) {
      logger.error("Failed to initialize ethics radar demo:", error);
      // Non-critical error - the demo is optional
    }
  }

  setupEventListeners() {
    console.log("Setting up event listeners with Global Event Manager...");

    try {
      // Initialize Global Event Manager if not already done
      if (!globalEventManager.isInitialized) {
        globalEventManager.initialize();
      }

      // Register this app component with the Global Event Manager
      this.registerWithEventManager();

      // Setup accessibility preference monitoring
      this.setupAccessibilityListeners();

      // Setup Surprise Me functionality (UI-specific)
      this.setupSurpriseMe();

      // Setup scenario completion and suggested scenario listeners
      this.setupScenarioEventListeners();

      console.log("Event listeners setup completed with Global Event Manager");
    } catch (error) {
      console.error("Error setting up event listeners:", error);
      this.showErrorMessage(
        "Failed to setup event listeners. Some features may not work properly.",
      );
    }
  }

  /**
   * Setup accessibility preference listeners
   */
  setupAccessibilityListeners() {
    const reducedMotionQuery = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    );
    reducedMotionQuery.addEventListener("change", (e) => {
      globalEventManager.notifyComponents("accessibility.theme_change", {
        type: "reduced_motion",
        matches: e.matches,
      });
    });

    const highContrastQuery = window.matchMedia("(prefers-contrast: high)");
    highContrastQuery.addEventListener("change", (e) => {
      globalEventManager.notifyComponents("accessibility.theme_change", {
        type: "high_contrast",
        matches: e.matches,
      });
    });
  }

  /**
   * Setup scenario-specific event listeners
   */
  setupScenarioEventListeners() {
    // Scenario completion event listener
    document.addEventListener("scenario-completed", (event) => {
      this.handleScenarioCompleted(event);
    });

    // Suggested scenario navigation
    document.addEventListener("open-suggested-scenario", (event) => {
      this.handleSuggestedScenario(event);
    });
  }

  /**
   * Check if this is a first-time visit and start onboarding tour
   */
  checkAndStartOnboardingTour() {
    if (!this.onboardingTour) {
      return;
    }

    // Check if user has completed the tour
    if (this.onboardingTour.hasCompletedTour()) {
      AppDebug.log("User has already completed onboarding tour");
      return;
    }

    // Check if this is a first-time visit
    if (this.onboardingTour.isFirstTimeVisit()) {
      AppDebug.log("First-time visit detected, starting onboarding tour");
      // Small delay to ensure all UI is ready
      const UI_READY_DELAY = 500; // ms
      setTimeout(() => {
        this.onboardingTour.startTour(1);
      }, UI_READY_DELAY);
    }
  }

  /**
   * Manually start the onboarding tour (for testing)
   */
  startOnboardingTour() {
    // Check if we're on the app page
    const isAppPage =
      window.location.pathname.includes("app.html") ||
      document.querySelector(".categories-grid") !== null;

    if (!isAppPage) {
      AppDebug.warn("Cannot start onboarding tour - not on app page");
      return;
    }

    if (!this.onboardingTour && !window.onboardingTourInstance) {
      this.onboardingTour = new OnboardingTour();
      // Make onboarding tour available globally for debugging
      window.onboardingTourInstance = this.onboardingTour;
    } else if (window.onboardingTourInstance) {
      this.onboardingTour = window.onboardingTourInstance;
    }

    // Clear localStorage to force tour to start
    localStorage.removeItem("has_visited");
    localStorage.removeItem("tour_completed");

    AppDebug.log("Manually starting onboarding tour");
    this.onboardingTour.startTour(1);
  }

  setupAccessibility() {
    // Preferences are now loaded in initializeTheme(), so we just need to ensure
    // the theme is applied (which was already done in initializeTheme)
    // This method is kept for future accessibility setup if needed
  }

  render() {
    // Skip rendering the old simulations grid if MainGrid is active
    if (!this.categoryGrid) {
      this.renderSimulationsGrid();
    }
    // Hero demo is now handled by the HeroDemo class
  }

  renderSimulationsGrid() {
    if (!this.categoriesGrid) return;

    this.categoriesGrid.innerHTML = "";

    // For simulateai focused architecture, show single simulation
    if (this.simulateaiConfig) {
      const card = this.createSimulationCard(this.simulateaiConfig);
      this.categoriesGrid.appendChild(card);
    }
  }

  createSimulationCard(simulation) {
    const card = Helpers.createElement("div", "simulation-card", {
      role: "gridcell",
      tabindex: "0",
      "aria-label": `${simulation.title} simulation`,
    });

    const progress = userProgress.getSimulationProgress(simulation.id);
    const isCompleted = progress.completed || false;
    const score = progress.score || 0;

    card.innerHTML = `
            <div class="card-thumbnail">
                <img src="${simulation.thumbnail}" alt="${simulation.title}" onerror="this.style.display='none'; this.nextElementSibling.style.display='flex';">
                <div style="display:none; width:100%; height:200px; background:#f0f0f0; border-radius:8px; align-items:center; justify-content:center; color:#666; font-size:14px;">
                    <svg width="64" height="64" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <rect width="64" height="64" rx="8" fill="#e5e7eb"/>
                        <path d="M20 24h24v16H20z" fill="#9ca3af"/>
                        <circle cx="26" cy="30" r="2" fill="#6b7280"/>
                        <path d="m32 36-4-4-4 4h8z" fill="#6b7280"/>
                    </svg>
                </div>
                ${isCompleted ? '<div class="completion-badge">✓</div>' : ""}
            </div>
            
            <div class="card-content">
                <h3 class="card-title">${simulation.title}</h3>
                <p class="card-description">${simulation.description}</p>
                
                <div class="card-meta">
                    <span class="difficulty difficulty-${simulation.difficulty}">${Helpers.capitalize(simulation.difficulty)}</span>
                    <span class="duration">${Helpers.formatDuration(simulation.duration * 1000)}</span>
                </div>
                
                <div class="card-tags">
                    ${simulation.tags.map((tag) => `<span class="tag">${tag}</span>`).join("")}
                </div>
                
                ${
                  isCompleted
                    ? `
                    <div class="completion-info">
                        <span class="score">Score: ${score}/100</span>
                        <span class="grade">${Helpers.getEthicsGrade(score).grade}</span>
                    </div>
                `
                    : ""
                }
                  <div class="card-actions">
                    <button class="btn btn-primary enhanced-sim-button" data-simulation="${simulation.id}">
                        Learning Lab Simulation
                    </button>
                    <button class="btn btn-secondary simulation-quick-start-btn" data-simulation="${simulation.id}">
                        ${isCompleted ? "Retry" : "Start"} Simulation
                    </button>
                </div>
            </div>
        `;

    // Add hover and focus effects
    card.addEventListener("mouseenter", () => {
      card.style.transform = "translateY(-2px)";
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = "translateY(0)";
    });

    card.addEventListener("keydown", (e) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        this.startSimulation(simulation.id);
      }
    });

    return card;
  }

  /**
   * Simulation management - Two-stage launch flow
   */
  async startSimulation(simulationId) {
    try {
      // Verify 'this' context is correct
      if (!this || typeof this.showNotification !== "function") {
        throw new Error(
          "App context not properly bound. startSimulation called with wrong context.",
        );
      }

      // Check if we should show the pre-launch modal first
      const shouldShowPreLaunch =
        !userPreferences.shouldSkipPreLaunch(simulationId);

      if (shouldShowPreLaunch) {
        await this.showPreLaunchModal(simulationId);
        return; // Pre-launch modal will call launchSimulationDirect when ready
      }

      // Direct launch (skipping pre-launch modal)
      await this.launchSimulationDirect(simulationId);
    } catch (error) {
      AppDebug.error("Failed to start simulation:", error);
      this.hideLoading();

      // Use fallback notification if this.showNotification is not available
      if (typeof this.showNotification === "function") {
        this.showNotification(
          "Failed to start simulation. Please try again.",
          "error",
        );
      } else {
        // Fallback to logger and direct notification system
        logger.error("Failed to start simulation:", error.message);
        if (window.NotificationToast) {
          window.NotificationToast.show({
            type: "error",
            message: "Failed to start simulation. Please try again.",
            duration: 5000,
            closable: true,
          });
        }
      }
    }
  }

  /**
   * Shows the pre-launch information modal
   * Enhanced with better educational context integration and debugging
   * Updated to use JSON SSOT configuration system
   */
  async showPreLaunchModal(simulationId) {
    logger.debug("Showing pre-launch modal for:", simulationId);

    try {
      // Get simulation configuration and educational context
      // Get simulation config - only simulateai is supported
      const simConfig =
        simulationId === "simulateai" ? this.simulateaiConfig : null;
      AppDebug.log("Simulation config for pre-launch modal:", simConfig);

      if (!simConfig) {
        AppDebug.error("No simulation config found for ID:", simulationId);
        throw new Error(
          `No simulation configuration found for: ${simulationId}`,
        );
      }

      const educationalContext = this.getEducationalContext(simConfig);
      AppDebug.log(
        "Educational context for pre-launch modal:",
        educationalContext,
      );

      // Get configured component instead of direct instantiation
      const prelaunchModal = await appStartup.getComponent(
        "pre-launch-modal",
        simulationId,
        {
          onLaunch: (id) => {
            logger.debug("Pre-launch modal onLaunch called with:", id);
            // User clicked "Start Exploration" - proceed with simulation
            this.launchSimulationDirect(id || simulationId);
          },
          onCancel: () => {
            logger.debug("Pre-launch modal cancelled");
            // User clicked "Maybe Later" - just close modal
            this.hideLoading();
          },
          showEducatorResources: true, // Always show educator resources
          educationalContext: educationalContext, // Pass educational context to pre-launch modal
        },
      );

      // Additional debugging for educational context
      AppDebug.log("Pre-launch modal created with options:", {
        simulationId,
        hasEducationalContext: !!educationalContext,
        educationalContextKeys: educationalContext
          ? Object.keys(educationalContext)
          : [],
        educationalContextSummary: educationalContext
          ? {
              curriculum: educationalContext.curriculum?.length || 0,
              assessments: educationalContext.assessments?.length || 0,
              labStations: educationalContext.labStations?.length || 0,
              scenarioTemplates:
                educationalContext.scenarioTemplates?.length || 0,
            }
          : null,
      });

      await prelaunchModal.show();
    } catch (error) {
      logger.error("Failed to show pre-launch modal:", error);
      AppDebug.error("Pre-launch modal error details:", {
        simulationId,
        error: error.message,
        stack: error.stack,
        availableSimulations: Array.from(this.simulations.keys()),
      });
      // Fallback to direct launch
      this.launchSimulationDirect(simulationId);
    }
  }

  /**
   * Direct simulation launch (bypasses pre-launch modal)
   */
  async launchSimulationDirect(simulationId) {
    try {
      this.showLoading();

      // Cleanup previous simulation canvases and engines
      if (this.currentSimulation && this.currentSimulation.cleanup) {
        this.currentSimulation.cleanup();
      }

      // Cleanup any existing simulation canvas
      if (this.currentSimulationCanvasId) {
        canvasManager.removeCanvas(this.currentSimulationCanvasId);
        this.currentSimulationCanvasId = null;
      }

      // Get simulation config - only simulateai is supported
      const simConfig =
        simulationId === "simulateai" ? this.simulateaiConfig : null;
      if (!simConfig) {
        throw new Error(`Simulation ${simulationId} not found`);
      }

      // Track simulation start
      simpleAnalytics.trackSimulationStart(simulationId, simConfig.title);

      // Enhanced analytics for simulation start
      if (this.analyticsManager.isInitialized) {
        this.analyticsManager.trackSimulationStart(
          simulationId,
          "ethics_simulation",
          {
            title: simConfig.title,
            userLevel: "intermediate", // Could be derived from user progress
            expectedDuration: simConfig.estimatedTime || 600000, // 10 minutes default
            prerequisites: simConfig.prerequisites || [],
            learningObjectives: simConfig.learningObjectives || [],
          },
        );
      }

      // Get simulation container
      const simulationContainer = document.getElementById(
        "simulation-container",
      );
      if (!simulationContainer) {
        throw new Error("Simulation container not found");
      }

      // Add loading state to container
      simulationContainer.classList.add("loading");
      simulationContainer.setAttribute("aria-busy", "true");
      simulationContainer.setAttribute(
        "aria-label",
        `Loading ${simConfig.title} simulation`,
      );

      // Clear previous content and remove any error states
      simulationContainer.innerHTML = "";
      simulationContainer.classList.remove("error");

      // Check if simulation needs canvas or is HTML-only
      if (simConfig.useCanvas !== false && simConfig.renderMode !== "html") {
        // Create managed canvas for the simulation
        const { canvas, id } = await canvasManager.createCanvas({
          width: 600,
          height: 400,
          container: simulationContainer,
          className: "simulation-canvas",
          id: `simulation-${simulationId}`,
        });

        // Store canvas ID for cleanup
        this.currentSimulationCanvasId = id;

        // Apply responsive styling to canvas
        canvas.style.cssText = `
                    max-width: 100%;
                    max-height: 100%;
                    width: auto;
                    height: auto;
                    border: 1px solid #ddd;
                    border-radius: 8px;
                    background: #fff;
                `;

        // Create visual engine using canvas manager
        this.engine = await canvasManager.createVisualEngine(id, {
          renderMode: "canvas",
          accessibility: true,
          debug: false,
          width: 600,
          height: 400,
        });

        // Set the container reference on the engine for simulation compatibility
        this.engine.container = simulationContainer;
      } else {
        // For HTML-only simulations, create a simple mock engine with just the container
        this.engine = {
          container: simulationContainer,
          type: "html",
          renderMode: "html",
          start: () => {
            // Mock engine started for HTML simulation
          },
          stop: () => {
            // Mock engine stopped for HTML simulation
          },
          destroy: () => {
            // Mock engine destroyed for HTML simulation
          },
        };
      }

      // Route simulateai to use the main grid category browser
      if (simulationId === "simulateai") {
        this.hideLoading();

        // Handle enhanced navigation from scenario browser
        const navigationContext = simConfig?.sourceContext || "direct";
        const targetScenario = simConfig?.targetScenario;
        const targetCategory = simConfig?.targetCategory;
        const autoNavigate = simConfig?.autoNavigateToScenario;

        // Enhance simulateai with all integrated capabilities
        await this.enhanceSimulateaiExperience(simConfig);

        // Display the main grid category browser (provides access to all scenario categories)
        if (this.categoryGrid) {
          // Ensure we're in category view mode
          if (this.categoryGrid.currentView !== "category") {
            await this.categoryGrid.switchView("category");
          }

          // Handle automatic navigation to specific scenario if requested
          if (autoNavigate && targetScenario) {
            AppDebug.log(
              `SimulateAI: Auto-navigating to scenario ${targetScenario} in category ${targetCategory || "unknown"} (source: ${navigationContext})`,
            );

            // Use enhanced navigation if available
            if (this.scenarioBrowserIntegration) {
              this.scenarioBrowserIntegration.navigateToScenario(
                targetCategory,
                targetScenario,
              );
            } else {
              // Delay navigation to allow main grid to fully render
              setTimeout(() => {
                this.navigateToSpecificScenario(
                  targetCategory,
                  targetScenario,
                  navigationContext,
                );
              }, 500);
            }
          }

          AppDebug.log(
            `Launched Simulation Launcher via MainGrid category browser (context: ${navigationContext}, educational context shown in pre-launch modal)`,
          );
        } else {
          AppDebug.error(
            "MainGrid not initialized, cannot display category browser",
          );
          throw new Error("Category browser not available");
        }
        return;
      }

      // For any other simulations (none currently exist), show error
      this.hideLoading();
      throw new Error(
        `Simulation ${simulationId} is not implemented. Only 'simulateai' is available.`,
      );
    } catch (error) {
      AppDebug.error("Failed to start simulation:", error);
      this.hideLoading();

      // Add error state to container
      const simulationContainer = document.getElementById(
        "simulation-container",
      );
      if (simulationContainer) {
        simulationContainer.classList.remove("loading");
        simulationContainer.classList.add("error");
        simulationContainer.removeAttribute("aria-busy");
        simulationContainer.setAttribute(
          "aria-label",
          "Simulation failed to load",
        );
        simulationContainer.innerHTML = `
                    <div style="text-align: center; padding: 2rem;">
                        <h3>Simulation Failed to Load</h3>
                        <p>There was an error loading the simulation. Please try again.</p>
                        <button class="btn btn-primary" onclick="this.closest('.modal').querySelector('.modal-close').click()">Close</button>
                    </div>
                `;
      }

      this.showError("Failed to start the simulation. Please try again.");
    }
  }

  /**
   * Navigate to a specific scenario within the MainGrid system
   * Used for scenario browser integration and direct scenario navigation
   * @param {string} categoryId - Target category ID
   * @param {string} scenarioId - Target scenario ID
   * @param {string} context - Navigation context for logging
   */
  navigateToSpecificScenario(categoryId, scenarioId, context = "direct") {
    try {
      AppDebug.log(
        `Navigating to specific scenario: ${scenarioId} in category: ${categoryId} (context: ${context})`,
      );

      // Ensure category grid is available and in category view
      if (!this.categoryGrid) {
        throw new Error("CategoryGrid not available for navigation");
      }

      // Method 1: Try to find and click the category card
      if (categoryId) {
        const categorySelector = `[data-category-id="${categoryId}"], [data-category="${categoryId}"]`;
        const categoryElement = document.querySelector(categorySelector);

        if (categoryElement) {
          AppDebug.log(
            `Found category element for ${categoryId}, simulating click`,
          );
          categoryElement.click();

          // After category opens, try to find and click the scenario
          setTimeout(() => {
            this.navigateToScenarioInCategory(scenarioId, context);
          }, 750); // Give time for category to open

          return true;
        }
      }

      // Method 2: Try direct scenario navigation if no category found
      return this.navigateToScenarioInCategory(scenarioId, context);
    } catch (error) {
      AppDebug.error("Error navigating to specific scenario:", error);

      // Fallback: direct navigation to simulation.html
      const fallbackUrl = `simulation.html?scenario=${scenarioId}&category=${categoryId || "unknown"}&source=${context}`;
      AppDebug.log(`Using fallback navigation to: ${fallbackUrl}`);
      window.location.href = fallbackUrl;

      return false;
    }
  }

  /**
   * Enhanced navigation that integrates with scenario browser
   * @param {string} action - Navigation action ('scenario', 'category', 'learning-lab')
   * @param {Object} data - Navigation data
   */
  handleEnhancedNavigation(action, data) {
    try {
      AppDebug.log(`Enhanced navigation request: ${action}`, data);

      // Use scenario browser integration if available
      if (this.scenarioBrowserIntegration) {
        return this.scenarioBrowserIntegration.handleNavigationRequest(
          action,
          data,
        );
      }

      // Fallback to standard navigation
      switch (action) {
        case "scenario":
          return this.navigateToSpecificScenario(
            data.categoryId,
            data.scenarioId,
            data.context || "enhanced-nav",
          );
        case "category":
          return this.switchToCategory(data.categoryId);
        case "learning-lab":
          window.location.href = `learning-lab.html?scenario=${data.scenarioId}&source=enhanced-nav`;
          return true;
        default:
          AppDebug.warn(`Unknown enhanced navigation action: ${action}`);
          return false;
      }
    } catch (error) {
      AppDebug.error("Enhanced navigation failed:", error);
      return false;
    }
  }

  /**
   * Navigate to a scenario within the currently displayed category
   * @param {string} scenarioId - Target scenario ID
   * @param {string} context - Navigation context
   */
  navigateToScenarioInCategory(scenarioId, context = "direct") {
    try {
      // Look for scenario card with the target ID
      const scenarioSelectors = [
        `[data-scenario-id="${scenarioId}"]`,
        `[data-scenario="${scenarioId}"]`,
        `.scenario-card[data-id="${scenarioId}"]`,
      ];

      for (const selector of scenarioSelectors) {
        const scenarioElement = document.querySelector(selector);
        if (scenarioElement) {
          AppDebug.log(
            `Found scenario element for ${scenarioId}, simulating click (context: ${context})`,
          );
          scenarioElement.click();
          return true;
        }
      }

      // If scenario not found in DOM, it might not be visible yet
      // Try to find a "Show More" or "Load More" button
      const loadMoreBtn = document.querySelector(
        '#load-more-btn, .load-more-btn, [data-action="load-more"]',
      );
      if (loadMoreBtn && loadMoreBtn.style.display !== "none") {
        AppDebug.log(
          `Scenario ${scenarioId} not visible, trying to load more scenarios`,
        );
        loadMoreBtn.click();

        // Retry after loading more
        setTimeout(() => {
          this.navigateToScenarioInCategory(scenarioId, `${context}-retry`);
        }, 1000);

        return true;
      }

      AppDebug.warn(
        `Scenario element not found for ${scenarioId} in current view`,
      );
      return false;
    } catch (error) {
      AppDebug.error("Error navigating to scenario in category:", error);
      return false;
    }
  }

  /**
   * Handle simulation completion (called by MainGrid via SimulateAI function)
   * @param {Object} data - Simulation completion data
   */
  handleSimulationComplete(data) {
    AppDebug.log("SimulateAI function - Simulation completion:", data);

    try {
      // Delegate to the existing simulation completion handler
      this.onSimulationCompleted(data);

      // Track via enhanced analytics if available
      if (this.analyticsManager.isInitialized) {
        this.analyticsManager.trackEvent("simulation_complete_via_maingrid", {
          ...data,
          source: "main_grid_coordination",
          timestamp: new Date().toISOString(),
          sessionId: this.sessionId,
        });
      }

      // Update component health
      this._updateComponentHealth("simulation_completion", "healthy");
    } catch (error) {
      AppDebug.error(
        "Error handling simulation completion via MainGrid:",
        error,
      );
      this.handleEnterpriseError(
        error,
        "Failed to handle simulation completion",
        "simulation_completion",
      );
    }
  }

  /**
   * Handle simulation completion - show post-simulation modal
   */
  onSimulationCompleted(data) {
    AppDebug.log("Simulation completed:", data);

    try {
      // Close the enhanced simulation modal first
      const enhancedModal = document.querySelector(
        ".enhanced-simulation-modal",
      );
      if (enhancedModal) {
        enhancedModal.style.display = "none";
        enhancedModal.setAttribute("aria-hidden", "true");
      }

      // Track simulation completion
      if (this.currentSimulation && this.currentSimulation.id) {
        simpleAnalytics.trackSimulationComplete(
          this.currentSimulation.id,
          data,
        );

        // Enhanced analytics for simulation completion
        if (this.analyticsManager.isInitialized) {
          const completionReport = {
            duration: data.duration || 0,
            score: data.finalScore || 0,
            decisions: data.decisions || [],
            scenarios: data.totalScenarios || 1,
            ethicsMetrics: data.ethicsMetrics || {},
            completionRate: 100, // Assuming full completion
            hintsUsed: data.hintsUsed || 0,
            errorsEncountered: data.errorsEncountered || 0,
            accessibilityFeaturesUsed: this._getUsedAccessibilityFeatures(),
            learningOutcomes: data.learningOutcomes || {},
            userFeedback: data.userFeedback || null,
          };

          this.analyticsManager.trackSimulationComplete(
            this.currentSimulation.id,
            completionReport,
          );
        }

        // Save simulation completion to Firestore
        if (this.authService) {
          this.authService
            .saveScenarioCompletion({
              scenarioId: this.currentSimulation.id,
              categoryId: this.currentSimulation.category || "unknown",
              selectedOption: data.selectedOption || null,
              optionText: data.optionText || "",
              impact: data.impact || {},
              simulationData: data,
            })
            .then((result) => {
              if (result.success) {
                AppDebug.log(
                  "Simulation completion saved to Firestore:",
                  result,
                );
              } else if (
                result.reason !== "not_authenticated_or_no_firestore"
              ) {
                AppDebug.warn(
                  "Failed to save simulation completion to Firestore:",
                  result.error,
                );
              }
            })
            .catch((error) => {
              AppDebug.warn(
                "Error saving simulation completion to Firestore:",
                error,
              );
            });
        }
      }

      // Show post-simulation modal
      this.showPostSimulationModal(data);
    } catch (error) {
      AppDebug.error("Error handling simulation completion:", error);
      // Fallback to basic completion handling
      this.hideModal();
      this.showNotification(
        "Simulation completed! Thank you for exploring AI Ethics.",
        "success",
      );
    }
  }

  /**
   * Handle scenario completion and show reflection modal
   */
  handleScenarioCompleted(event) {
    const { categoryId, scenarioId, selectedOption, option, scenarioData } =
      event.detail;

    AppDebug.log("Scenario completed in app.js:", {
      categoryId,
      scenarioId,
      selectedOption: selectedOption?.id || option?.id,
      hasScenarioData: !!scenarioData,
      optionsCount: scenarioData?.options?.length || 0,
    });

    // Show the scenario reflection modal
    this.showScenarioReflectionModal({
      categoryId,
      scenarioId,
      selectedOption: selectedOption || option,
      scenarioData: scenarioData || {},
    });
  }

  /**
   * Handle suggested scenario navigation
   */
  handleSuggestedScenario(event) {
    const { categoryId, scenarioId } = event.detail;

    AppDebug.log("Opening suggested scenario:", { categoryId, scenarioId });

    // Import and open the scenario modal
    import("./components/scenario-modal.js")
      .then(({ default: ScenarioModal }) => {
        const scenarioConfig = this.getComponentConfig("scenario-modal");
        const scenarioModal = new ScenarioModal(scenarioConfig);
        scenarioModal.open(scenarioId, categoryId);
      })
      .catch((error) => {
        AppDebug.error("Failed to open suggested scenario:", error);
      });
  }

  /**
   * Show the scenario-specific reflection modal
   */
  showScenarioReflectionModal(data) {
    const { categoryId, scenarioId, selectedOption } = data;

    try {
      // Get scenario reflection modal configuration (fallback to empty object if not found)
      const reflectionConfig =
        this.getComponentConfig("scenario-reflection-modal") || {};

      // The ScenarioReflectionModal automatically shows itself when constructed
      new ScenarioReflectionModal({
        categoryId: categoryId,
        scenarioId: scenarioId,
        selectedOption: selectedOption,
        scenarioData: data.scenarioData || {},
        ...reflectionConfig,
        onComplete: (reflectionData) => {
          // User finished reflection - show success message
          this.showNotification(
            "Thank you for your thoughtful reflection! Your insights contribute to our research.",
            "success",
          );

          // Track completion
          simpleAnalytics.trackEvent("scenario_reflection", "completed", {
            category_id: categoryId,
            scenario_id: scenarioId,
            selected_option: selectedOption?.id,
            research_data_points: Object.keys(reflectionData).length,
          });
        },
        onSkip: () => {
          // User skipped reflection - show gentle reminder
          this.showNotification(
            "Reflection skipped. You can always revisit scenarios to explore different perspectives.",
            "info",
          );
        },
      });
    } catch (error) {
      console.warn(
        "Failed to get config for scenario-reflection-modal:",
        error.message,
      );

      // Fallback: create reflection modal without config (but with same callbacks)
      new ScenarioReflectionModal({
        categoryId: categoryId,
        scenarioId: scenarioId,
        selectedOption: selectedOption,
        scenarioData: data.scenarioData || {},
        onComplete: (reflectionData) => {
          // User finished reflection - show success message
          this.showNotification(
            "Thank you for your thoughtful reflection! Your insights contribute to our research.",
            "success",
          );

          // Track completion
          simpleAnalytics.trackEvent("scenario_reflection", "completed", {
            category_id: categoryId,
            scenario_id: scenarioId,
            selected_option: selectedOption?.id,
            research_data_points: Object.keys(reflectionData).length,
          });
        },
        onSkip: () => {
          // User skipped reflection - show gentle reminder
          this.showNotification(
            "Reflection skipped. You can always revisit scenarios to explore different perspectives.",
            "info",
          );
        },
      });
    }
  }

  /**
   * Show the post-simulation reflection modal (legacy - for old simulation system)
   */
  showPostSimulationModal(data) {
    // Legacy method - redirect to scenario reflection for now
    // This maintains compatibility with any old simulation completion events
    AppDebug.warn(
      "showPostSimulationModal called - redirecting to scenario reflection",
    );

    this.showScenarioReflectionModal({
      categoryId: "unknown",
      scenarioId: "legacy-simulation",
      selectedOption: {
        id: "legacy",
        text: "Legacy simulation choice",
        description: "Completed legacy simulation",
      },
      scenarioData: data,
    });
  }

  showSimulationModal(simConfig) {
    if (!this.modal) return;

    const title = this.modal.querySelector("#modal-title");
    if (title) {
      title.textContent = simConfig.title;
    }

    // Store the currently focused element to restore later
    this.lastFocusedElement = document.activeElement;

    // Remove inert from modal and set aria-hidden to false
    this.modal.removeAttribute("inert");
    this.modal.setAttribute("aria-hidden", "false");
    this.modal.style.display = "flex";

    // Add visible class for CSS opacity transition
    requestAnimationFrame(() => {
      this.modal.classList.add("visible");
    });

    // Make background content inert
    const mainContent = document.getElementById("main-content");
    if (mainContent) {
      mainContent.setAttribute("inert", "");
    }

    // Focus management - create focus trap for modal
    this.modalFocusTrap = focusManager.createTrap(this.modal, {
      autoFocus: true,
      restoreFocus: true,
    });
  }

  /**
   * Handle keyboard navigation in modal (delegated to focus manager)
   */
  trapFocusInModal(event) {
    // This is now handled by the focus manager
    // Keep method for backward compatibility but delegate to focus manager
    if (this.modalFocusTrap && event.key === "Tab") {
      // Focus manager handles this automatically
      return;
    }
  }

  closeSimulation() {
    if (this.currentSimulation) {
      this.currentSimulation.reset();
      this.currentSimulation = null;
    }

    if (this.engine) {
      this.engine.stop();
      this.engine.destroy();
      this.engine = null;
    }

    // Cleanup all managed canvases
    const canvasesToCleanup = [this.currentSimulationCanvasId];

    canvasesToCleanup.forEach((canvasId) => {
      if (canvasId) {
        canvasManager.removeCanvas(canvasId);
      }
    });

    // Reset canvas IDs
    this.currentSimulationCanvasId = null;

    if (this.modal) {
      // Clean up focus trap
      if (this.modalFocusTrap) {
        this.modalFocusTrap.destroy();
        this.modalFocusTrap = null;
      }

      // Make modal inert and hide it
      this.modal.setAttribute("inert", "");
      this.modal.setAttribute("aria-hidden", "true");
      this.modal.classList.remove("visible");
      this.modal.style.display = "none";

      // Remove inert from main content
      const mainContent = document.getElementById("main-content");
      if (mainContent) {
        mainContent.removeAttribute("inert");
      }
    } // Clear simulation container
    if (this.simulationContainer) {
      this.simulationContainer.innerHTML = "";
      this.simulationContainer.classList.remove("loading", "error");
      this.simulationContainer.removeAttribute("aria-busy");
      this.simulationContainer.removeAttribute("aria-label");
    }
  }

  /**
   * Resets the current simulation
   */
  resetCurrentSimulation() {
    if (this.currentSimulation && this.currentSimulation.reset) {
      this.currentSimulation.reset();
    }
  }

  /**
   * Shows the loading indicator
   */
  showLoading() {
    if (this.loading) {
      this.loading.style.display = "flex";
      this.loading.setAttribute("aria-hidden", "false");
    }
  }

  /**
   * Hides the loading indicator
   */
  hideLoading() {
    if (this.loading) {
      this.loading.style.display = "none";
      this.loading.setAttribute("aria-hidden", "true");
    }
  }

  /**
   * Toggles simulation pause state
   */
  toggleSimulationPause(isPaused) {
    if (this.currentSimulation) {
      if (isPaused && this.currentSimulation.pause) {
        this.currentSimulation.pause();
      } else if (!isPaused && this.currentSimulation.resume) {
        this.currentSimulation.resume();
      }
    }
  }

  /**
   * Populates the enhanced modal with simulation-specific data
   */
  async populateEnhancedModalData(simulationId) {
    try {
      // Import simulation data
      const { simulationInfo } = await import("./data/simulation-info.js");
      const simData = simulationInfo[simulationId];

      if (!simData) {
        AppDebug.warn(`No simulation data found for ${simulationId}`);
        return;
      }

      // Populate resource tab
      this.populateResourcesTab(simData);

      // Populate help tab
      this.populateHelpTab(simData);

      // Populate quick resources panel
      this.populateQuickResourcesPanel(simData);
    } catch (error) {
      AppDebug.error("Failed to populate enhanced modal data:", error);
    }
  }

  /**
   * Populates the resources tab with simulation data
   */
  populateResourcesTab(simData) {
    if (!this.currentEnhancedModal) return;

    const { modal } = this.currentEnhancedModal;
    if (!modal) return;

    // Background reading
    const readingContainer = modal.querySelector("#background-reading");
    if (readingContainer && simData.resources?.backgroundReading) {
      readingContainer.innerHTML = simData.resources.backgroundReading
        .map(
          (resource) => `
                <div class="resource-item">
                    <a href="${resource.url}" target="_blank" class="resource-title">${resource.title}</a>
                    <p class="resource-description">${resource.description}</p>
                </div>
            `,
        )
        .join("");
    }

    // Related videos
    const videosContainer = modal.querySelector("#related-videos");
    if (videosContainer && simData.resources?.videos) {
      videosContainer.innerHTML = simData.resources.videos
        .map(
          (video) => `
                <div class="resource-item">
                    <a href="${video.url}" target="_blank" class="resource-title">${video.title}</a>
                    <p class="resource-description">${video.description}</p>
                    <span class="resource-duration">${video.duration}</span>
                </div>
            `,
        )
        .join("");
    }

    // Discussion questions
    const questionsContainer = modal.querySelector("#discussion-questions");
    if (questionsContainer && simData.educatorResources?.discussionQuestions) {
      questionsContainer.innerHTML =
        simData.educatorResources.discussionQuestions
          .map(
            (question) => `
                <div class="resource-item">
                    <p class="discussion-question">${question}</p>
                </div>
            `,
          )
          .join("");
    }
  }

  /**
   * Populates the help tab with simulation-specific information
   */
  populateHelpTab(simData) {
    if (!this.currentEnhancedModal) return;

    const { modal } = this.currentEnhancedModal;
    if (!modal) return;

    // Ethics explanation
    const ethicsContainer = modal.querySelector("#ethics-explanation");
    if (ethicsContainer && simData.vocabulary) {
      ethicsContainer.innerHTML = Object.entries(simData.vocabulary)
        .map(
          ([term, definition]) => `
                <div class="ethics-term">
                    <h5>${term}</h5>
                    <p>${definition}</p>
                </div>
            `,
        )
        .join("");
    }
  }

  /**
   * Populates the quick resources panel
   */
  populateQuickResourcesPanel(simData) {
    if (!this.currentEnhancedModal) return;

    const { modal } = this.currentEnhancedModal;
    if (!modal) return;

    // Quick concepts
    const conceptsContainer = modal.querySelector("#quick-concepts");
    if (conceptsContainer && simData.vocabulary) {
      const MAX_QUICK_TERMS = 5;
      const keyTerms = Object.keys(simData.vocabulary).slice(
        0,
        MAX_QUICK_TERMS,
      );
      conceptsContainer.innerHTML = keyTerms
        .map(
          (term) => `
                <li><a href="#" class="resource-link" data-term="${term}">${term}</a></li>
            `,
        )
        .join("");

      // Add click handlers for terms
      conceptsContainer.querySelectorAll("[data-term]").forEach((link) => {
        link.addEventListener("click", (e) => {
          e.preventDefault();
          const {
            dataset: { term },
          } = e.target;
          const definition = simData.vocabulary[term];
          this.showQuickHelp(term, definition);
        });
      });
    }
  }

  /**
   * Shows quick help tooltip or modal
   */
  showQuickHelp(term, definition) {
    // Create a simple tooltip or notification
    const NOTIFICATION_DURATION = 5000;
    this.showNotification(
      `${term}: ${definition}`,
      "info",
      NOTIFICATION_DURATION,
    );
  }

  /**
   * Shows a notification toast message
   * @param {string} message - The notification message
   * @param {string} type - The notification type ('success', 'error', 'warning', 'info')
   * @param {number} duration - Auto-dismiss duration in ms (optional)
   * @returns {string|null} - Toast ID or null if failed
   */
  showNotification(message, type = "info", duration = 5000) {
    if (window.NotificationToast) {
      // Use the global notification toast instance
      return window.NotificationToast.show({
        type,
        message,
        duration,
        closable: true,
      });
    } else {
      // Fallback to logger if notification system not available
      logger.info(`[${type.toUpperCase()}] ${message}`);
      return null;
    }
  }

  /**
   * Sets up Surprise Me functionality
   */
  setupSurpriseMe() {
    // Surprise Me functionality is now handled by the shared navigation component
    // The shared navigation component calls window.app.launchRandomScenario() when clicked
    // No need to add duplicate event listeners here

    const surpriseMeBtn = document.getElementById("surprise-me-nav");
    if (surpriseMeBtn) {
      // Just verify the button exists for debugging
      AppDebug.log(
        "Surprise Me button found - handled by shared navigation component",
      );
    } else {
      AppDebug.warn("Surprise Me button not found in DOM");
    }
  }

  /**
   * Launches a random uncompleted scenario
   */
  launchRandomScenario() {
    logger.debug("Surprise Me: launchRandomScenario called");

    // Debounce to prevent rapid successive calls
    const now = Date.now();
    if (!this.lastSurpriseTime) this.lastSurpriseTime = 0;

    const SURPRISE_COOLDOWN = 500; // Reduced to 500ms - just prevent double-clicks
    if (now - this.lastSurpriseTime < SURPRISE_COOLDOWN) {
      logger.debug(
        "Surprise Me action debounced - too soon after last request",
        `Time since last: ${now - this.lastSurpriseTime}ms`,
      );
      return;
    }
    this.lastSurpriseTime = now;

    // Refresh category grid progress to ensure we have latest state
    if (this.categoryGrid) {
      this.categoryGrid.userProgress = this.categoryGrid.loadUserProgress();
      logger.debug("Surprise Me: Refreshed category grid progress");
    }

    const randomScenario = this.getRandomUncompletedScenario();

    if (!randomScenario) {
      logger.debug("Surprise Me: No uncompleted scenarios found");
      this.showNotification(
        "🎉 Congratulations! You've completed all scenarios! Try replaying your favorites.",
        "success",
        APP_CONSTANTS.TIMING.NOTIFICATION_DURATION,
      );
      return;
    }

    // Show notification about the selected scenario
    logger.debug(
      "Surprise Me: Launching scenario:",
      randomScenario.scenario.title,
    );
    this.showNotification(
      `🎉 Surprise! Opening "${randomScenario.scenario.title}" from ${randomScenario.category.title}`,
      "info",
      APP_CONSTANTS.TIMING.NOTIFICATION_DURATION,
    );

    // Launch the scenario directly (skip pre-launch modal for surprise factor)
    if (this.categoryGrid) {
      logger.debug("Surprise Me: Opening via mainGrid");
      this.categoryGrid.openScenarioModalDirect(
        randomScenario.category.id,
        randomScenario.scenario.id,
      );
    } else {
      // Fallback if mainGrid is not available
      logger.warn("MainGrid not available, redirecting to scenario");
      window.location.href = `#scenario-${randomScenario.scenario.id}`;
    }
  }

  /**
   * Debug utility: Clear all progress for testing Surprise Me functionality
   */
  clearAllProgress() {
    localStorage.removeItem("simulateai_category_progress");
    logger.info("All progress cleared for testing");
    if (this.categoryGrid) {
      this.categoryGrid.userProgress = {};
      this.categoryGrid.render();
    }
  }

  /**
   * Debug utility: Mark a few scenarios as completed for testing
   */
  markSomeScenariosCompleted() {
    const progress = {
      "trolley-problem": {
        "autonomous-vehicle-split": true,
        // Leave tunnel-dilemma and bias-healthcare uncompleted
      },
      simulateai: {
        "hiring-algorithm-bias": true,
        // Leave other scenarios uncompleted
      },
    };

    localStorage.setItem(
      "simulateai_category_progress",
      JSON.stringify(progress),
    );
    logger.info("Some scenarios marked as completed for testing");

    if (this.categoryGrid) {
      this.categoryGrid.userProgress = progress;
      this.categoryGrid.render();
    }
  }

  /**
   * Debug utility: Show all available categories and scenarios
   */
  debugShowAllContent() {
    const categories = getAllCategories();
    logger.info("=== DEBUG: All Available Content ===");
    logger.info("Total categories:", categories.length);

    categories.forEach((category) => {
      const scenarios = getCategoryScenarios(category.id);
      logger.info(`Category: ${category.id} (${category.title})`);
      logger.info(
        `  Scenarios (${scenarios.length}):`,
        scenarios.map((s) => `${s.id} - ${s.title}`),
      );
    });

    const progress = localStorage.getItem("simulateai_category_progress");
    logger.info("Current progress:", progress ? JSON.parse(progress) : "None");

    return {
      categories,
      totalScenarios: categories.reduce(
        (sum, cat) => sum + getCategoryScenarios(cat.id).length,
        0,
      ),
    };
  }

  /**
   * Debug utility: Check current modal state
   */
  debugModalState() {
    const modalState = {
      categoryGridModalOpen: this.categoryGrid?.isModalOpen || false,
      lastModalOpenTime: this.categoryGrid?.lastModalOpenTime || 0,
      timeSinceLastModal: this.categoryGrid?.lastModalOpenTime
        ? Date.now() - this.categoryGrid.lastModalOpenTime
        : "N/A",
      modalCooldown: this.categoryGrid?.modalOpenCooldown || 1000,
      visibleModalBackdrops: document.querySelectorAll(
        '.modal-backdrop:not([aria-hidden="true"])',
      ).length,
      lastSurpriseTime: this.lastSurpriseTime || 0,
      timeSinceLastSurprise: this.lastSurpriseTime
        ? Date.now() - this.lastSurpriseTime
        : "N/A",
    };

    logger.info("=== DEBUG: Modal State ===", modalState);
    return modalState;
  }

  /**
   * Gets a random uncompleted scenario from all categories
   * @returns {Object|null} Object with category and scenario, or null if all completed
   */
  getRandomUncompletedScenario() {
    try {
      // Get all categories and their scenarios
      const allCategories = getAllCategories();
      logger.debug("Surprise Me: Found categories:", allCategories.length);

      // Load user progress (fresh from localStorage each time)
      const stored = localStorage.getItem("simulateai_category_progress");
      const userProgress = stored ? JSON.parse(stored) : {};
      logger.debug("Surprise Me: User progress:", userProgress);

      // Collect all uncompleted scenarios
      const uncompletedScenarios = [];

      allCategories.forEach((category) => {
        const scenarios = getCategoryScenarios(category.id);
        logger.debug(
          `Surprise Me: Category ${category.id} has ${scenarios.length} scenarios`,
        );

        scenarios.forEach((scenario) => {
          const isCompleted = userProgress[category.id]?.[scenario.id] || false;
          logger.debug(
            `Surprise Me: Scenario ${scenario.id} completed: ${isCompleted}`,
          );

          if (!isCompleted) {
            uncompletedScenarios.push({
              category,
              scenario,
            });
          }
        });
      });

      logger.debug(
        "Surprise Me: Found uncompleted scenarios:",
        uncompletedScenarios.length,
      );
      logger.debug(
        "Surprise Me: Uncompleted scenario list:",
        uncompletedScenarios.map((s) => `${s.category.id}/${s.scenario.id}`),
      );

      // Return random uncompleted scenario
      if (uncompletedScenarios.length === 0) {
        logger.debug("Surprise Me: All scenarios completed");
        return null; // All scenarios completed
      }

      const randomIndex = Math.floor(
        Math.random() * uncompletedScenarios.length,
      );
      const selectedScenario = uncompletedScenarios[randomIndex];
      logger.debug(
        "Surprise Me: Selected scenario:",
        selectedScenario.scenario.id,
        "from category:",
        selectedScenario.category.id,
      );

      return selectedScenario;
    } catch (error) {
      logger.error("Failed to get random uncompleted scenario:", error);
      return null;
    }
  }

  /**
   * Scroll to the simulations section
   */
  /**
   * Scroll to Ethics Categories section using unified scroll manager
   */
  async scrollToSimulations() {
    try {
      // Ensure the target element exists before scrolling
      const categoriesSection = document.getElementById("categories");
      if (!categoriesSection) {
        logger.warn("Categories section not found, cannot scroll");
        return;
      }

      // Start scrolling immediately (don't wait for navigation state)
      const scrollPromise = scrollManager.scrollToElement("#categories", {
        behavior: "smooth",
        offset: 80,
        respectReducedMotion: true,
      });

      // Set navigation active state with a small delay to ensure DOM is ready
      setTimeout(() => {
        if (window.sharedNav) {
          window.sharedNav.setActivePage("simulation-hub");
        }
      }, 100);

      // Wait for scroll to complete
      await scrollPromise;

      logger.info("Scrolled to Ethics Categories section");

      // Track the navigation
      simpleAnalytics.trackEvent("navigation_to_categories", {
        source: "start_learning_button",
        target: "ethics_categories",
        method: "smooth_scroll",
      });

      // Announce to screen readers for accessibility
      if (this.accessibilityManager) {
        this.accessibilityManager.announce(
          "Navigated to Ethics Categories section",
          false,
        );
      }
    } catch (error) {
      logger.error("Failed to scroll to Ethics Categories:", error);

      // Fallback: try basic scroll without smooth animation
      try {
        const categoriesSection = document.getElementById("categories");
        if (categoriesSection) {
          categoriesSection.scrollIntoView({ block: "start" });
          logger.info("Used fallback scroll to Ethics Categories");
        }
      } catch (fallbackError) {
        logger.error("Fallback scroll also failed:", fallbackError);
      }
    }
  }

  /**
   * Test scenario modal functionality (debug method)
   * Updated to use JSON SSOT configuration system
   */
  async testScenarioModal() {
    try {
      logger.info("Testing scenario modal with trolley problem scenario");

      // Get configured component instead of direct instantiation
      const scenarioModal = await appStartup.getComponent("scenario-modal", {
        isTestMode: true,
      });

      // Open with the first trolley problem scenario in test mode
      await scenarioModal.open(
        "autonomous-vehicle-split",
        "trolley-problem",
        true,
      );

      logger.info("Scenario modal test launched successfully (TEST MODE)");
    } catch (error) {
      logger.error("Failed to test scenario modal:", error);
      this.showNotification("Failed to open test scenario modal", "error");
    }
  }

  /**
   * Open educator tools or guide
   */
  openEducatorTools() {
    // For now, we can scroll to simulations or open a modal with educator resources
    // This can be enhanced later with dedicated educator functionality
    logger.info("Opening educator tools");

    // Track the event
    simpleAnalytics.trackEvent("educator_tools_accessed", {
      source: "educator_guide_button",
    });

    // For now, scroll to simulations as a placeholder
    this.scrollToSimulations();
  }

  /**
   * Initialize infinite loop detection for development
   */
  initializeLoopDetection() {
    // Only enable in development mode or when explicitly requested
    const isDevelopment =
      window.location.hostname === "localhost" ||
      window.location.hostname === "127.0.0.1" ||
      window.location.protocol === "file:" ||
      window.location.search.includes("debug=true");

    if (isDevelopment) {
      // Enable the loop detector
      loopDetector.setEnabled(true);

      // Add to window for easy access in development
      window.loopDetector = loopDetector;

      // Track critical onboarding methods that previously had loops
      if (window.onboardingTourInstance) {
        this.instrumentOnboardingTour(window.onboardingTourInstance);
      }

      logger.info(
        "InfiniteLoopDetector",
        "🔧 Loop detection enabled for development",
      );
    } else {
      // Disable in production
      loopDetector.setEnabled(false);
      logger.info(
        "InfiniteLoopDetector",
        "🔒 Loop detection disabled for production",
      );
    }
  }

  /**
   * Instrument onboarding tour methods for loop detection
   */
  instrumentOnboardingTour(tour) {
    const criticalMethods = [
      "positionCoachMark",
      "showStep",
      "nextStep",
      "handleAction",
    ];

    criticalMethods.forEach((methodName) => {
      if (tour[methodName]) {
        const original = tour[methodName];
        tour[methodName] = function (...args) {
          loopDetector.trackExecution(`OnboardingTour.${methodName}`);
          return original.apply(this, args);
        };
      }
    });

    logger.info(
      "InfiniteLoopDetector",
      "📊 Instrumented OnboardingTour methods for monitoring",
    );
  }

  /**
   * Initialize MCP (Model Context Protocol) integrations
   */
  async initializeMCPIntegrations() {
    // Prevent duplicate initialization
    if (this.mcpInitialized) {
      AppDebug.debug("MCP integrations already initialized, skipping");
      return;
    }

    try {
      AppDebug.log("Initializing MCP integrations...");

      this.mcpManager = new MCPIntegrationManager(this);
      const mcpResult = await this.mcpManager.initializeIntegrations();

      if (mcpResult.success) {
        this.mcpCapabilities = new Set(mcpResult.capabilities);
        this.mcpInitialized = true; // Mark as initialized
        AppDebug.log("MCP integrations initialized:", mcpResult.capabilities);

        // Enhance existing features with MCP capabilities
        await this.enhanceWithMCPCapabilities();
      } else {
        AppDebug.warn("MCP integrations failed to initialize");
      }
    } catch (error) {
      AppDebug.error("Failed to initialize MCP integrations:", error);
      // Continue without MCP - app should still function
    }
  }

  /**
   * Enhance existing features with MCP capabilities
   */
  async enhanceWithMCPCapabilities() {
    if (!this.mcpManager) return;

    try {
      // Enhance scenario creation
      if (this.mcpCapabilities.has("scenario_generation")) {
        this.enhanceScenarioCreation();
      }

      // Enhance analytics
      if (this.mcpCapabilities.has("enhanced_analytics")) {
        this.enhanceAnalytics();
      }

      // Enhance content with real-world examples
      if (this.mcpCapabilities.has("real_time_content")) {
        this.enhanceContentWithRealWorld();
      }

      // Enhance community features with GitHub integration
      if (this.mcpCapabilities.has("github_integration")) {
        this.enhanceCommunityFeatures();
      }

      // Enhance project generation capabilities
      if (this.mcpCapabilities.has("project_generation")) {
        this.enhanceProjectGeneration();
      }

      // Connect MCP to scenario browser if available
      if (this.scenarioBrowserIntegration && this.mcpManager) {
        this.connectMCPToScenarioBrowser();
      }

      AppDebug.log("Existing features enhanced with MCP capabilities");
    } catch (error) {
      AppDebug.error("Failed to enhance features with MCP:", error);
    }
  }

  /**
   * Enhanced scenario creation using MCP capabilities
   */
  enhanceScenarioCreation() {
    // Add MCP-enhanced scenario creation to the platform
    this.createEnhancedScenario = async (scenarioConfig) => {
      return await this.mcpManager.createEnhancedScenario(scenarioConfig);
    };
  }

  /**
   * Enhanced analytics using MCP capabilities
   */
  enhanceAnalytics() {
    // Extend existing analytics with MCP enhancements
    if (this.analytics) {
      this.getAnalyticsInsights = async () => {
        return await this.mcpManager.generateAnalyticsInsights();
      };
    }
  }

  /**
   * Enhanced content with real-world examples
   */
  enhanceContentWithRealWorld() {
    // Add real-world context to scenarios
    this.addRealWorldContext = async (scenarioId, category) => {
      const webResearch = this.mcpManager.integrations.get("webResearch");
      if (webResearch) {
        return await webResearch.enrichScenarioWithRealExamples(
          scenarioId,
          category,
        );
      }
      return null;
    };
  }

  /**
   * Enhanced community features with GitHub integration
   */
  enhanceCommunityFeatures() {
    const githubIntegration =
      this.mcpManager.integrations.get("githubIntegration");
    if (githubIntegration) {
      // Add community collaboration features
      this.submitCommunityContent = async (content) => {
        return await githubIntegration.submitCommunityContribution(content);
      };

      // Add educational pattern analysis
      this.analyzeEducationalPatterns = async () => {
        return await githubIntegration.analyzeEducationalPatterns();
      };
    }
  }

  /**
   * Enhanced project generation capabilities
   */
  enhanceProjectGeneration() {
    const projectGenerator =
      this.mcpManager.integrations.get("projectGenerator");
    if (projectGenerator) {
      // Add automated scenario generation
      this.generateNewScenario = async (category, parameters) => {
        return await projectGenerator.generateScenarioCategory(
          category,
          parameters,
        );
      };

      // Add ISTE standards alignment
      this.alignWithStandards = async (content) => {
        return await projectGenerator.alignWithEducationalStandards(content);
      };
    }
  }

  /**
   * Connect MCP capabilities to scenario browser
   */
  connectMCPToScenarioBrowser() {
    if (this.scenarioBrowserIntegration && this.mcpManager) {
      // Enhance scenario browser with MCP content enrichment
      this.scenarioBrowserIntegration.mcpManager = this.mcpManager;

      // Add real-time content updates
      this.scenarioBrowserIntegration.enableRealTimeUpdates = true;

      AppDebug.log("MCP capabilities connected to scenario browser");
    }
  }

  /**
   * Enhance the simulateai experience with all integrated capabilities
   * @param {Object} config - Configuration passed to simulateai
   */
  async enhanceSimulateaiExperience(config = {}) {
    try {
      AppDebug.log(
        "Enhancing simulateai experience with integrated capabilities...",
      );

      // Apply MCP enhancements if available
      if (this.mcpInitialized && this.mcpManager) {
        // Add real-world context to scenarios
        if (this.mcpCapabilities.has("real_time_content")) {
          await this.addRealWorldContextToSimulateai();
        }

        // Generate enhanced scenarios if needed
        if (
          this.mcpCapabilities.has("scenario_generation") &&
          config.generateContent
        ) {
          await this.generateEnhancedContent(config.contentType || "ethics");
        }
      }

      // Apply educational enhancements
      if (
        this.educatorToolkit ||
        this.digitalScienceLab ||
        this.scenarioGenerator
      ) {
        this.applyEducationalEnhancements();
      }

      // Apply badge system enhancements
      if (this.badgeManager) {
        this.applyBadgeSystemEnhancements(config);
      }

      // Apply scenario browser integration enhancements
      if (this.scenarioBrowserIntegration) {
        this.scenarioBrowserIntegration.configure({
          routeThroughSimulateAI: true,
          useSimulateAIModals: true,
          parentContext: config.sourceContext || "simulateai-enhanced",
        });
      }

      // Track enhanced experience
      simpleAnalytics.trackEvent("simulateai_enhanced_experience", {
        mcp_enabled: this.mcpInitialized,
        educational_modules: !!(
          this.educatorToolkit &&
          this.digitalScienceLab &&
          this.scenarioGenerator
        ),
        badge_system_enabled: !!this.badgeManager,
        scenario_browser_integration: this.scenarioBrowserInitialized,
        context: config.sourceContext || "direct",
        timestamp: new Date().toISOString(),
      });

      AppDebug.log("SimulateAI experience enhanced successfully");
    } catch (error) {
      AppDebug.error("Failed to enhance simulateai experience:", error);
      // Continue with basic experience
    }
  }

  /**
   * Add real-world context to simulateai scenarios
   */
  async addRealWorldContextToSimulateai() {
    if (this.addRealWorldContext) {
      try {
        const realWorldData = await this.addRealWorldContext(
          "ai-ethics",
          "general",
        );
        if (realWorldData) {
          AppDebug.log("Real-world context added to simulateai");
        }
      } catch (error) {
        AppDebug.warn("Failed to add real-world context:", error);
      }
    }
  }

  /**
   * Generate enhanced content using MCP capabilities
   */
  async generateEnhancedContent(contentType) {
    if (this.generateNewScenario) {
      try {
        const enhancedContent = await this.generateNewScenario(contentType, {
          difficulty: "adaptive",
          realWorldExamples: true,
          educationalAlignment: true,
        });
        if (enhancedContent) {
          AppDebug.log("Enhanced content generated for simulateai");
        }
      } catch (error) {
        AppDebug.warn("Failed to generate enhanced content:", error);
      }
    }
  }

  /**
   * Apply educational enhancements to simulateai
   */
  applyEducationalEnhancements() {
    // Enhance with educator toolkit capabilities
    if (this.educatorToolkit) {
      // Add assessment integration
      window.simulateaiAssessments =
        this.educatorToolkit.getAvailableAssessments();
    }

    // Enhance with digital science lab capabilities
    if (this.digitalScienceLab) {
      // Add lab station integration
      window.simulateaiLabStations =
        this.digitalScienceLab.getAvailableStations();
    }

    // Enhance with scenario generator capabilities
    if (this.scenarioGenerator) {
      // Add dynamic scenario generation
      window.simulateaiScenarioGeneration =
        this.scenarioGenerator.getCapabilities();
    }

    AppDebug.log("Educational enhancements applied to simulateai");
  }

  /**
   * Apply badge system enhancements to simulateai
   */
  applyBadgeSystemEnhancements(config = {}) {
    if (!this.badgeManager) {
      AppDebug.warn("Badge manager not available for simulateai enhancement");
      return;
    }

    try {
      // Make badge manager globally available for scenario completion tracking
      window.simulateaiBadgeManager = this.badgeManager;

      // Add badge progress tracking capabilities
      window.simulateaiBadgeTracking = {
        trackScenarioCompletion: (categoryId, scenarioId) => {
          return this.trackBadgeProgress(categoryId, scenarioId);
        },
        getBadgeProgress: async (categoryId) => {
          return await this.badgeManager.getBadgeProgress(categoryId);
        },
        getEarnedBadges: (categoryId) => {
          return this.badgeManager.getEarnedBadges(categoryId);
        },
      };

      // Add badge celebration functionality
      window.simulateaiBadgeCelebration = {
        showBadgeModal: (badges) => {
          return this.showBadgeCelebrationModal(badges);
        },
      };

      AppDebug.log("Badge system enhancements applied to simulateai");
    } catch (error) {
      AppDebug.error("Failed to apply badge system enhancements:", error);
    }
  }

  /**
   * Track badge progress for scenario completion
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   * @returns {Array} Newly earned badges
   */
  async trackBadgeProgress(categoryId, scenarioId) {
    if (!this.badgeManager) {
      AppDebug.warn("Badge manager not available for progress tracking");
      return [];
    }

    try {
      // Update scenario completion and check for new badges (now async)
      const newlyEarnedBadges =
        await this.badgeManager.updateScenarioCompletion(
          categoryId,
          scenarioId,
        );

      // If badges were earned, show celebration and sync with Firebase
      if (newlyEarnedBadges.length > 0) {
        AppDebug.log(
          `New badges earned in ${categoryId}:`,
          newlyEarnedBadges.map((b) => b.title),
        );

        // Sync badges with Firebase backend (if authenticated)
        await this.syncBadgesWithFirebase(newlyEarnedBadges);

        // Show badge celebration modal
        await this.showBadgeCelebrationModal(newlyEarnedBadges);

        // Track badge achievements
        simpleAnalytics.trackEvent("badge_earned", {
          categoryId,
          scenarioId,
          badgeCount: newlyEarnedBadges.length,
          badgeTiers: newlyEarnedBadges.map((b) => b.tier),
          timestamp: new Date().toISOString(),
        });
      }

      // Submit research data if user is authenticated and participating
      await this.submitScenarioResearchData(categoryId, scenarioId);

      return newlyEarnedBadges;
    } catch (error) {
      AppDebug.error("Failed to track badge progress:", error);
      return [];
    }
  }

  /**
   * Show badge celebration modal for newly earned badges
   * @param {Array} badges - Array of newly earned badge configurations
   */
  async showBadgeCelebrationModal(badges) {
    if (!badges || badges.length === 0) return;

    try {
      // Pause notifications during badge celebration to prevent interference
      if (window.NotificationToast) {
        window.NotificationToast.pause();
      }

      // Try to use the BadgeModal component
      if (badgeModal) {
        console.log("Using BadgeModal for celebration:", badges);

        // Show each badge with proper timing
        for (let i = 0; i < badges.length; i++) {
          const badge = badges[i];

          // Add delay between multiple badges and wait for previous modal to close
          if (i > 0) {
            // Wait for previous modal to close
            while (badgeModal.isModalVisible && badgeModal.isModalVisible()) {
              await new Promise((resolve) => setTimeout(resolve, 100));
            }
            // Additional delay between badges
            await new Promise((resolve) => setTimeout(resolve, 1000));
          }

          try {
            await badgeModal.showBadgeModal(badge, "main", {
              showConfetti: true,
              isMultiple: badges.length > 1,
              badgeIndex: i + 1,
              totalBadges: badges.length,
            });
          } catch (modalError) {
            console.error(
              `Error showing badge modal for badge ${i + 1}:`,
              modalError,
            );
            // Continue with next badge
          }
        }

        // Wait for final modal to complete
        await new Promise((resolve) => setTimeout(resolve, 1000));
      } else {
        console.warn("BadgeModal not available, using fallback notification");
        // Fallback to simple notification only if BadgeModal truly isn't available
        const badgeTitle =
          badges.length === 1 ? badges[0].title : `${badges.length} new badges`;

        if (window.NotificationToast) {
          window.NotificationToast.show({
            type: "success",
            message: `🎉 Congratulations! You earned: ${badgeTitle}`,
            duration: 5000,
            closable: true,
            force: true, // Force show even though notifications are paused
          });
        }
      }
    } catch (error) {
      console.error("Failed to show badge celebration:", error);
    } finally {
      // Always resume notifications after badge celebration (with delay)
      setTimeout(() => {
        if (window.NotificationToast) {
          window.NotificationToast.resume();
          console.log("Badge celebration complete - notifications resumed");
        }
      }, 2000);
    }
  }

  /**
   * Sync newly earned badges with Firebase backend
   * @param {Array} badges - Array of newly earned badge configurations
   */
  async syncBadgesWithFirebase(badges) {
    if (!this.authService || !this.currentUser) {
      AppDebug.log("User not authenticated, skipping Firebase badge sync");
      return;
    }

    try {
      for (const badge of badges) {
        AppDebug.log(`Syncing badge with Firebase: ${badge.title}`);

        // Call Firebase Function to award badge
        const result = await this.callFirebaseFunction(
          "awardBadge",
          {
            targetUserId: this.currentUser.uid,
            badgeData: {
              category: badge.categoryId,
              tier: badge.tier,
              title: badge.title,
              description: badge.description,
              icon: badge.icon,
              color: badge.color,
            },
          },
          true,
        ); // requiresAuth = true

        if (result.success) {
          AppDebug.log(`Badge synced successfully: ${badge.title}`);
        } else {
          AppDebug.warn(`Failed to sync badge: ${badge.title}`, result.error);
        }
      }
    } catch (error) {
      AppDebug.error("Failed to sync badges with Firebase:", error);
      // Continue execution - local badges still work
    }
  }

  /**
   * Submit research data for scenario completion
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   */
  async submitScenarioResearchData(categoryId, scenarioId) {
    if (!this.authService || !this.currentUser) {
      AppDebug.log("User not authenticated, skipping research data submission");
      return;
    }

    try {
      // Get user profile to check research participation
      const userProfile = await this.getUserProfile();
      if (!userProfile?.researchParticipant) {
        AppDebug.log("User not enrolled in research, skipping data submission");
        return;
      }

      // Collect scenario completion data
      const researchData = {
        scenarioId: `${categoryId}_${scenarioId}`,
        responses: this.getScenarioResponses(categoryId, scenarioId),
        ethicsScores: this.getScenarioEthicsScores(categoryId, scenarioId),
        completionTime: this.getScenarioCompletionTime(categoryId, scenarioId),
      };

      // Submit to Firebase Function
      const result = await this.callFirebaseFunction(
        "submitResearchData",
        researchData,
        true,
      );

      if (result.success) {
        AppDebug.log(`Research data submitted for ${categoryId}/${scenarioId}`);
      } else {
        AppDebug.warn(`Failed to submit research data: ${result.error}`);
      }
    } catch (error) {
      AppDebug.error("Failed to submit research data:", error);
      // Continue execution - research submission is optional
    }
  }

  /**
   * Call Firebase Function with authentication
   * @param {string} functionName - Name of the Firebase Function
   * @param {Object} data - Data to send to the function
   * @param {boolean} requiresAuth - Whether the function requires authentication
   * @returns {Object} Function result
   */
  async callFirebaseFunction(functionName, data, requiresAuth = false) {
    try {
      if (!this.firebaseService) {
        throw new Error("Firebase service not initialized");
      }

      if (requiresAuth && !this.currentUser) {
        throw new Error("Authentication required for this function");
      }

      // Get Firebase Functions instance
      const functions = this.firebaseService.getFunctions();
      if (!functions) {
        throw new Error("Firebase Functions not available");
      }

      // Get ID token for authentication
      let headers = {};
      if (requiresAuth && this.currentUser) {
        const idToken = await this.currentUser.getIdToken();
        headers["Authorization"] = `Bearer ${idToken}`;
      }

      // Call the function
      const functionCall = functions.httpsCallable(functionName);
      const result = await functionCall(data);

      return result.data;
    } catch (error) {
      AppDebug.error(`Firebase function call failed (${functionName}):`, error);
      return { success: false, error: error.message };
    }
  }

  /**
   * Get user profile from Firebase
   * @returns {Object|null} User profile data
   */
  async getUserProfile() {
    try {
      if (!this.currentUser) return null;

      const result = await this.callFirebaseFunction(
        "getUserAnalytics",
        {},
        true,
      );
      return result.success ? result.analytics.profile : null;
    } catch (error) {
      AppDebug.error("Failed to get user profile:", error);
      return null;
    }
  }

  /**
   * Get scenario responses for research data
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   * @returns {Object} Scenario responses
   */
  getScenarioResponses(categoryId, scenarioId) {
    // This would be implemented based on how scenario responses are stored
    // For now, return empty object as placeholder
    return {};
  }

  /**
   * Get scenario ethics scores for research data
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   * @returns {Object} Ethics scores
   */
  getScenarioEthicsScores(categoryId, scenarioId) {
    // This would be implemented based on how ethics scores are stored
    // For now, return empty object as placeholder
    return {};
  }

  /**
   * Get scenario completion time for research data
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   * @returns {number} Completion time in milliseconds
   */
  getScenarioCompletionTime(categoryId, scenarioId) {
    // This would be implemented based on how completion times are tracked
    // For now, return 0 as placeholder
    return 0;
  }

  /**
   * Get MCP status and capabilities
   */
  getMCPStatus() {
    if (!this.mcpManager) {
      return { initialized: false, capabilities: [] };
    }
    return this.mcpManager.getMCPStatus();
  }

  /**
   * Initialize Firebase and Authentication Services
   */
  async initializeFirebaseServices() {
    try {
      AppDebug.log("Initializing Firebase services...");

      // Import service manager to prevent duplicate initializations
      const { default: serviceManager } = await import(
        "./services/service-manager.js"
      );

      // Initialize services through service manager
      const servicesInitialized = await serviceManager.initialize();

      if (servicesInitialized) {
        AppDebug.log(
          "Services initialized successfully through ServiceManager",
        );

        // Get service references
        this.authService = serviceManager.getAuthService();
        this.firebaseService = serviceManager.getFirebaseService();

        if (this.authService && this.firebaseService) {
          // Make auth service globally accessible for Firestore logging
          window.authService = this.authService;

          // Connect system metadata collector to Firebase
          if (this.systemCollector && this.firebaseService) {
            this.systemCollector = getSystemCollector(this.firebaseService);
            AppDebug.log(
              "System metadata collector connected to Firebase for analytics storage",
            );
          }

          // Set up authentication state listener (Firebase best practice)
          this.setupAuthStateListener();

          // Set up research data logging integration
          this.setupResearchDataIntegration();

          // Initialize Firebase Cloud Messaging
          await this.initializeFirebaseMessaging();

          // Update UI for current auth state
          this.updateUIForAuthState();
        } else {
          AppDebug.warn("Failed to get service references from ServiceManager");
        }
      } else {
        AppDebug.warn("ServiceManager initialization failed");
      }
    } catch (error) {
      AppDebug.error("Failed to initialize Firebase services:", error);
      // Continue without Firebase - app should still function
    }
  }

  /**
   * Set up authentication state listener (Firebase best practice)
   * This ensures reliable user state detection across page loads and sessions
   */
  setupAuthStateListener() {
    if (!this.firebaseService) {
      AppDebug.warn("Firebase service not available for auth state listener");
      return;
    }

    try {
      // Set up Firebase onAuthStateChanged listener early in app lifecycle
      this.firebaseService.onAuthStateChanged((user) => {
        AppDebug.log(
          "Authentication state changed:",
          user ? "User signed in" : "User signed out",
        );

        // Update current user state
        this.currentUser = user;

        // Update UI to reflect auth state
        this.updateUIForAuthState();

        // Handle user-specific initialization
        if (user) {
          this.handleUserSignedIn(user);
        } else {
          this.handleUserSignedOut();
        }
      });

      AppDebug.log("Authentication state listener set up successfully");
    } catch (error) {
      AppDebug.error("Failed to set up authentication state listener:", error);
    }
  }

  /**
   * Handle user signed in state
   */
  handleUserSignedIn(user) {
    // Update user profile in auth service
    if (this.authService) {
      this.authService.setCurrentUser(user);
    }

    // Load user-specific data, preferences, etc.
    this.loadUserData(user);

    // Show welcome message for new sessions
    if (!this.userWelcomed) {
      this.showWelcomeMessage(user);
      this.userWelcomed = true;
    }
  }

  /**
   * Handle user signed out state
   */
  handleUserSignedOut() {
    // Clear user-specific data
    this.currentUser = null;
    this.userWelcomed = false;

    // Reset auth service state
    if (this.authService) {
      this.authService.clearCurrentUser();
    }

    // Clear any cached user data
    this.clearUserData();
  }

  /**
   * Load user-specific data and preferences
   */
  async loadUserData(user) {
    try {
      if (!this.firebaseService) return;

      // Load user profile and preferences
      const userProfile = await this.firebaseService.getUserProfile(user.uid);
      if (userProfile) {
        AppDebug.log("User profile loaded successfully");
        // Apply user preferences, load progress, etc.
      }
    } catch (error) {
      AppDebug.error("Error loading user data:", error);
    }
  }

  /**
   * Clear user-specific data
   */
  clearUserData() {
    // Clear any cached user data, preferences, progress, etc.
    AppDebug.log("User data cleared");
  }

  /**
   * Show welcome message for authenticated users
   */
  showWelcomeMessage(user) {
    const displayName = user.displayName || user.email || "User";
    AppDebug.log(`Welcome back, ${displayName}!`);

    // Could show a toast notification or other welcome UI
    // Example: this.showToast(`Welcome back, ${displayName}!`);
  }

  /**
   * Set up research data logging integration
   */
  setupResearchDataIntegration() {
    // Override the existing simulation completion flow to include research logging
    const originalHandleSimulationComplete =
      this.handleSimulationComplete?.bind(this);

    if (originalHandleSimulationComplete) {
      this.handleSimulationComplete = async (simulationData) => {
        // Call original completion handler
        await originalHandleSimulationComplete(simulationData);

        // Log research data if user is authenticated and opted in
        if (
          this.authService?.isAuthenticated() &&
          this.authService?.canAccessResearch()
        ) {
          await this.logResearchData(simulationData);
        }
      };
    }
  }

  /**
   * Log research data for authenticated research participants
   */
  async logResearchData(simulationData) {
    try {
      const user = this.authService.getCurrentUser();
      if (!user) return;

      const researchData = {
        scenarioId: simulationData.scenarioId,
        responses: simulationData.userChoices || {},
        ethicsScores: simulationData.ethicsScores || {},
        reflectionAnswers: simulationData.reflectionAnswers || [],
        completionTime: simulationData.completionTime || 0,
        timestamp: new Date().toISOString(),
      };

      const result = await this.firebaseService.logResearchResponse(
        user.uid,
        researchData,
      );

      if (result.success) {
        AppDebug.log("Research data logged successfully");
      } else {
        AppDebug.warn(
          "Research data logging failed:",
          result.reason || "Unknown error",
        );
      }
    } catch (error) {
      AppDebug.error("Error logging research data:", error);
    }
  }

  /**
   * Initialize Firebase Cloud Messaging for push notifications
   */
  async initializeFirebaseMessaging() {
    try {
      AppDebug.log("Initializing Firebase Cloud Messaging...");

      if (!this.firebaseService) {
        AppDebug.warn("Firebase service not available for messaging");
        return;
      }

      // Check if messaging is supported
      if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
        AppDebug.warn("Browser does not support push notifications");
        return;
      }

      // Register service worker
      await this.registerMessagingServiceWorker();

      // Get messaging instance
      if (
        this.firebaseService &&
        typeof this.firebaseService.getMessaging === "function"
      ) {
        this.messagingService = this.firebaseService.getMessaging();
        if (!this.messagingService) {
          AppDebug.warn("Firebase messaging not available");
          return;
        }

        // Set up foreground message handling
        this.setupForegroundMessageHandling();

        // Request notification permission and get token
        await this.requestNotificationPermission();
      } else {
        AppDebug.warn("Firebase messaging service method not available");
        return;
      }

      this.messagingInitialized = true;
      AppDebug.log("Firebase Cloud Messaging initialized successfully");
    } catch (error) {
      AppDebug.error("Failed to initialize Firebase Cloud Messaging:", error);
      // Continue without messaging - app should still function
    }
  }

  /**
   * Register Firebase Messaging Service Worker
   */
  async registerMessagingServiceWorker() {
    try {
      // Register the service worker
      const registration = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/" },
      );

      AppDebug.log("Firebase messaging service worker registered successfully");

      // Set up message handling from service worker
      navigator.serviceWorker.addEventListener("message", (event) => {
        if (event.data && event.data.type) {
          this.handleServiceWorkerMessage(event.data);
        }
      });

      return registration;
    } catch (error) {
      AppDebug.error(
        "Failed to register Firebase messaging service worker:",
        error,
      );
      throw error;
    }
  }

  /**
   * Set up foreground message handling
   */
  setupForegroundMessageHandling() {
    if (!this.messagingService) return;

    // Handle messages when app is in foreground
    this.messagingService.onMessage((payload) => {
      AppDebug.log("Foreground message received:", payload);

      // Show in-app notification
      this.showInAppNotification(payload);

      // Track analytics
      this.trackNotificationReceived(payload, "foreground");
    });
  }

  /**
   * Request notification permission and get FCM token
   */
  async requestNotificationPermission() {
    try {
      // Check current permission
      const permission = Notification.permission;

      if (permission === "denied") {
        AppDebug.warn("Notification permission denied by user");
        return;
      }

      let finalPermission = permission;

      // Request permission if not already granted
      if (permission === "default") {
        finalPermission = await Notification.requestPermission();
      }

      if (finalPermission === "granted") {
        // Get FCM token
        await this.getFCMToken();
      } else {
        AppDebug.log("Notification permission not granted");
      }
    } catch (error) {
      AppDebug.error("Error requesting notification permission:", error);
    }
  }

  /**
   * Get FCM registration token
   */
  async getFCMToken() {
    try {
      if (!this.messagingService) {
        throw new Error("Messaging service not initialized");
      }

      // Get token
      const token = await this.messagingService.getToken({
        vapidKey:
          "BH7Q8X9XJ9Y8Z7A6B5C4D3E2F1G0H9I8J7K6L5M4N3O2P1Q0R9S8T7U6V5W4X3Y2Z1",
      });

      if (token) {
        this.notificationToken = token;
        AppDebug.log("FCM token obtained successfully");

        // Store token for current user
        await this.storeFCMTokenForUser(token);

        // Set up token refresh handling
        this.setupTokenRefreshHandling();
      } else {
        AppDebug.warn("No FCM token available");
      }
    } catch (error) {
      AppDebug.error("Error getting FCM token:", error);
    }
  }

  /**
   * Store FCM token for current user
   */
  async storeFCMTokenForUser(token) {
    try {
      if (!this.currentUser || !this.firebaseService) return;

      // Store token in user profile
      await this.firebaseService.updateUserFCMToken(
        this.currentUser.uid,
        token,
      );
      AppDebug.log("FCM token stored for user");
    } catch (error) {
      AppDebug.error("Error storing FCM token for user:", error);
    }
  }

  /**
   * Set up token refresh handling
   */
  setupTokenRefreshHandling() {
    if (!this.messagingService) return;

    this.messagingService.onTokenRefresh(async () => {
      try {
        AppDebug.log("FCM token refreshed");
        await this.getFCMToken(); // Get new token and store it
      } catch (error) {
        AppDebug.error("Error handling token refresh:", error);
      }
    });
  }

  /**
   * Handle messages from service worker
   */
  handleServiceWorkerMessage(data) {
    AppDebug.log("Message from service worker:", data);

    switch (data.type) {
      case "notification-clicked":
        this.trackNotificationClicked(data);
        break;
      case "notification-dismissed":
        this.trackNotificationDismissed(data);
        break;
      default:
        AppDebug.log("Unknown service worker message type:", data.type);
    }
  }

  /**
   * Show in-app notification for foreground messages
   */
  showInAppNotification(payload) {
    const { notification, data } = payload;

    // Use existing notification system if available
    if (typeof this.showNotification === "function") {
      this.showNotification(
        notification.title || "SimulateAI Notification",
        "info",
        {
          body: notification.body,
          icon: notification.icon,
          data: data,
        },
      );
    } else if (window.NotificationToast) {
      window.NotificationToast.show({
        type: "info",
        message: `${notification.title}: ${notification.body}`,
        duration: 6000,
        closable: true,
        data: data,
      });
    }
  }

  /**
   * Track notification analytics
   */
  trackNotificationReceived(payload, context) {
    simpleAnalytics.trackEvent("notification_received", {
      type: payload.data?.type || "general",
      context: context, // 'foreground' or 'background'
      title: payload.notification?.title,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track notification click analytics
   */
  trackNotificationClicked(data) {
    simpleAnalytics.trackEvent("notification_clicked", {
      type: data.notificationType || "general",
      threadId: data.threadId,
      messageId: data.messageId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Track notification dismissal analytics
   */
  trackNotificationDismissed(data) {
    simpleAnalytics.trackEvent("notification_dismissed", {
      type: data.notificationType || "general",
      threadId: data.threadId,
      messageId: data.messageId,
      timestamp: new Date().toISOString(),
    });
  }

  /**
   * Update UI based on current authentication state
   */
  updateUIForAuthState() {
    const user = this.getCurrentUser();
    const isAuthenticated = !!user;

    // Update navigation authentication state
    if (this.authService) {
      this.authService.updateAuthenticationUI(isAuthenticated, user);
    }

    // Update any auth-dependent UI elements
    const authButtons = document.querySelectorAll("[data-auth-required]");
    authButtons.forEach((button) => {
      if (isAuthenticated) {
        button.style.display = "";
        button.disabled = false;
      } else {
        button.style.display = "none";
        button.disabled = true;
      }
    });

    // Update user-specific content
    const userContent = document.querySelectorAll("[data-user-content]");
    userContent.forEach((element) => {
      element.style.display = isAuthenticated ? "" : "none";
    });

    // Update guest content
    const guestContent = document.querySelectorAll("[data-guest-content]");
    guestContent.forEach((element) => {
      element.style.display = isAuthenticated ? "none" : "";
    });

    AppDebug.log(
      "UI updated for authentication state:",
      isAuthenticated ? "authenticated" : "guest",
    );
  }

  /**
   * Get current user authentication status
   */
  getCurrentUser() {
    return this.authService?.getCurrentUser() || null;
  }

  // ...existing methods...
}

/**
 * Ethics Radar Demo Class for Hero Section
 * Handles the interactive radar chart demonstration in the hero area
 */
class EthicsRadarDemo {
  constructor() {
    this.demoChart = null;
    this.ANIMATION_DELAY = 200; // Animation delay in milliseconds
    this.RESET_DELAY = 300; // Reset animation delay in milliseconds
    this.initializeDemo();
  }

  async initializeDemo() {
    try {
      console.log("🔄 EthicsRadarDemo: Starting initialization...");

      // Check if demo already exists to prevent double initialization
      if (this.demoChart) {
        console.log("⚠️ EthicsRadarDemo: Demo already initialized, skipping");
        return;
      }

      // Check if container is already in use
      const container = document.getElementById("hero-ethics-chart");
      if (container.hasChildNodes()) {
        console.log(
          "⚠️ EthicsRadarDemo: Container already has content, clearing it",
        );
        container.innerHTML = "";
      }

      // Get radar chart configuration (fix: use 'radarChart' not 'radar-chart')
      const radarConfig =
        window.simulateAIApp?.getComponentConfig("radarChart") || {};

      console.log("📋 EthicsRadarDemo: Radar config loaded:", radarConfig);

      // Get configured component instead of direct instantiation
      this.demoChart = await appStartup.getComponent(
        "radarChart", // Fix: use 'radarChart' not 'radar-chart'
        "hero-ethics-chart",
        {
          title: "Ethical Impact Analysis",
          ...radarConfig,
          width: 580,
          height: 580,
          realTime: false,
          showLabels: true,
          animated: true,
          isDemo: true, // Use minimal container styling
        },
      );

      console.log(
        "✅ EthicsRadarDemo: Chart component created:",
        this.demoChart,
      );
      logger.info("Ethics radar demo initialized successfully");
    } catch (error) {
      console.error("❌ EthicsRadarDemo: Initialization failed:", error);
      logger.error("Failed to initialize ethics radar demo:", error);
    }
  }

  simulatePattern(pattern) {
    console.log("🎨 EthicsRadarDemo: simulatePattern called with:", pattern);
    console.log("📊 Chart instance:", this.demoChart);

    const patterns = {
      utilitarian: {
        fairness: 3,
        sustainability: 4,
        autonomy: 2,
        beneficence: 5,
        transparency: 3,
        accountability: 4,
        privacy: 2,
        proportionality: 4,
      },
      deontological: {
        fairness: 5,
        sustainability: 3,
        autonomy: 5,
        beneficence: 4,
        transparency: 4,
        accountability: 5,
        privacy: 4,
        proportionality: 3,
      },
      virtue: {
        fairness: 4,
        sustainability: 4,
        autonomy: 4,
        beneficence: 4,
        transparency: 3,
        accountability: 4,
        privacy: 3,
        proportionality: 4,
      },
      balanced: {
        fairness: 4,
        sustainability: 4,
        autonomy: 4,
        beneficence: 4,
        transparency: 4,
        accountability: 4,
        privacy: 4,
        proportionality: 4,
      },
    };

    if (this.demoChart && patterns[pattern]) {
      console.log("✅ Applying pattern scores:", patterns[pattern]);

      // Add visual feedback for pattern application
      this.highlightChartChange(pattern);

      setTimeout(() => {
        try {
          // Debug: Check chart data before and after
          const beforeData = this.demoChart.chart?.data?.datasets?.[0]?.data;
          console.log("🔍 Chart data BEFORE setScores:", beforeData);

          this.demoChart.setScores(patterns[pattern]);

          // Check data after a brief delay to ensure update completed
          setTimeout(() => {
            const afterData = this.demoChart.chart?.data?.datasets?.[0]?.data;
            console.log("🔍 Chart data AFTER setScores:", afterData);
            console.log("🔍 Pattern values:", Object.values(patterns[pattern]));

            // Force chart update if data didn't change when it should have
            if (
              beforeData &&
              afterData &&
              JSON.stringify(beforeData) === JSON.stringify(afterData)
            ) {
              console.log("⚠️ Chart data unchanged - forcing update");
              this.demoChart.chart.update("active");
            }
          }, 50);

          // TEMPORARILY DISABLE FEEDBACK TO TEST CHART UPDATES
          // this.showFeedback(pattern);
          console.log(
            "📈 Pattern applied successfully - feedback disabled for testing",
          );

          // Show values in console for debugging
          console.log(
            "🎨 Visual values applied:",
            Object.entries(patterns[pattern])
              .map(([key, val]) => `${key}: ${val}`)
              .join(", "),
          );
        } catch (error) {
          console.error("❌ Error applying pattern:", error);
        }
      }, this.ANIMATION_DELAY);
    } else {
      console.error("❌ Cannot apply pattern:", {
        demoChart: !!this.demoChart,
        patternExists: !!patterns[pattern],
        pattern: pattern,
      });
    }
  }

  highlightChartChange(pattern) {
    const chartContainer = document.getElementById("hero-ethics-chart");
    if (!chartContainer) return;

    // Add visual emphasis to show chart is updating
    chartContainer.style.transition = "all 0.3s ease";
    chartContainer.style.transform = "scale(1.02)";
    chartContainer.style.boxShadow = "0 0 20px rgba(0, 123, 255, 0.5)";

    // Show pattern name briefly
    const patternLabels = {
      utilitarian: "🎯 Utilitarian",
      deontological: "⚖️ Rights-Based",
      virtue: "🌟 Virtue Ethics",
      balanced: "⚡ Balanced",
    };

    const label = document.createElement("div");
    label.textContent = patternLabels[pattern] || pattern;
    label.style.cssText = `
      position: absolute;
      top: -30px;
      left: 50%;
      transform: translateX(-50%);
      background: #007bff;
      color: white;
      padding: 8px 16px;
      border-radius: 20px;
      font-weight: bold;
      font-size: 14px;
      z-index: 1000;
      animation: fadeInOut 2s ease-in-out;
    `;

    chartContainer.style.position = "relative";
    chartContainer.appendChild(label);

    // Reset after animation
    setTimeout(() => {
      chartContainer.style.transform = "scale(1)";
      chartContainer.style.boxShadow = "none";
      if (label.parentNode) {
        label.remove();
      }
    }, 1000);
  }

  // DEBUG: Test chart updating directly without any popovers or other interference
  testDirectChartUpdate(pattern) {
    console.log("🧪 TESTING: Direct chart update for pattern:", pattern);

    if (!this.demoChart) {
      console.error("❌ TESTING: No chart instance available");
      return;
    }

    const patterns = {
      utilitarian: {
        fairness: 1,
        sustainability: 5,
        autonomy: 1,
        beneficence: 5,
        transparency: 2,
        accountability: 3,
        privacy: 1,
        proportionality: 4,
      },
      deontological: {
        fairness: 5,
        sustainability: 2,
        autonomy: 5,
        beneficence: 3,
        transparency: 5,
        accountability: 5,
        privacy: 5,
        proportionality: 2,
      },
      virtue: {
        fairness: 4,
        sustainability: 4,
        autonomy: 4,
        beneficence: 4,
        transparency: 3,
        accountability: 4,
        privacy: 3,
        proportionality: 4,
      },
      balanced: {
        fairness: 4,
        sustainability: 4,
        autonomy: 4,
        beneficence: 4,
        transparency: 4,
        accountability: 4,
        privacy: 4,
        proportionality: 4,
      },
    };

    const testPattern = patterns[pattern];
    if (!testPattern) {
      console.error("❌ TESTING: Invalid pattern:", pattern);
      return;
    }

    console.log("🧪 TESTING: Applying values:", testPattern);

    // Get data before
    const before = this.demoChart.chart?.data?.datasets?.[0]?.data?.slice();
    console.log("🧪 TESTING: Data BEFORE:", before);

    // Apply pattern
    this.demoChart.setScores(testPattern);

    // Force immediate update
    this.demoChart.chart.update("none");

    setTimeout(() => {
      const after = this.demoChart.chart?.data?.datasets?.[0]?.data?.slice();
      console.log("🧪 TESTING: Data AFTER:", after);

      // Visual comparison
      const changed =
        !before || !after || JSON.stringify(before) !== JSON.stringify(after);
      console.log("🧪 TESTING: Data changed:", changed);

      if (changed) {
        console.log("✅ TESTING: Chart updated successfully!");
      } else {
        console.log("❌ TESTING: Chart data did not change");
        console.log("🧪 TESTING: Forcing redraw...");
        this.demoChart.chart.update("active");
      }
    }, 100);
  }

  reset() {
    if (this.demoChart) {
      setTimeout(() => {
        this.demoChart.resetScores();
        this.hideFeedback();
      }, this.RESET_DELAY);
    }
  }

  showFeedback(pattern) {
    const feedbackContainer = document.getElementById("hero-demo-feedback");
    if (!feedbackContainer) return;

    const popoverContent = feedbackContainer.querySelector(".popover-content");
    if (!popoverContent) return;

    // Clear any existing auto-hide timer
    if (popoverHideTimeout) {
      clearTimeout(popoverHideTimeout);
      popoverHideTimeout = null;
    }

    const feedbackMessages = {
      utilitarian: {
        title: "Utilitarian Ethics",
        message:
          "This approach prioritizes the greatest good for the greatest number, emphasizing beneficence and outcomes over individual rights.",
      },
      deontological: {
        title: "Rights-Based Ethics",
        message:
          "This framework focuses on duties and rights, giving priority to fairness, autonomy, and accountability regardless of consequences.",
      },
      virtue: {
        title: "Virtue Ethics",
        message:
          "This approach emphasizes character and moral virtues, seeking balance across all ethical dimensions through practical wisdom.",
      },
      balanced: {
        title: "Balanced Approach",
        message:
          "This represents a comprehensive ethical framework that considers all dimensions equally, often used in complex real-world scenarios.",
      },
    };

    const feedback = feedbackMessages[pattern];
    if (feedback) {
      popoverContent.innerHTML = `
                <h5>${feedback.title}</h5>
                <p>${feedback.message}</p>
            `;
      feedbackContainer.classList.add("show");

      // Set auto-hide timer for 5 seconds
      const AUTO_HIDE_DELAY = 5000; // 5 seconds
      popoverHideTimeout = setTimeout(() => {
        this.hideFeedback();
        popoverHideTimeout = null;
      }, AUTO_HIDE_DELAY);
    }
  }

  /**
   * Enhanced analytics helper methods
   */

  /**
   * Track user interaction with enhanced analytics
   */
  trackUserInteraction(interactionType, elementId, additionalData = {}) {
    if (this.analyticsManager.isInitialized) {
      this.analyticsManager.trackUserInteraction(interactionType, elementId, {
        ...additionalData,
        sessionId: this.sessionId,
        currentTheme: this.currentTheme,
        accessibility: this.preferences,
        inputMethod: additionalData.inputMethod || "unknown",
      });
    }
  }

  /**
   * Track educational outcome with enhanced analytics
   */
  trackEducationalOutcome(assessment) {
    if (this.analyticsManager.isInitialized) {
      this.analyticsManager.trackEducationalOutcome({
        ...assessment,
        sessionId: this.sessionId,
        accessibility: this._getUsedAccessibilityFeatures(),
        theme: this.currentTheme,
      });
    }
  }

  /**
   * Track ethics decision with enhanced analytics
   */
  trackEthicsDecision(decision) {
    if (this.analyticsManager.isInitialized) {
      this.analyticsManager.trackEthicsDecision({
        ...decision,
        sessionId: this.sessionId,
        accessibility: this._getUsedAccessibilityFeatures(),
        theme: this.currentTheme,
      });
    }
  }

  /**
   * Generate analytics insights
   */
  async generateAnalyticsInsights() {
    if (this.analyticsManager.isInitialized) {
      try {
        return await this.analyticsManager.generateInsights();
      } catch (error) {
        AppDebug.warn("Failed to generate analytics insights:", error);
        return null;
      }
    }
    return null;
  }

  hideFeedback() {
    // Clear any existing auto-hide timer
    if (popoverHideTimeout) {
      clearTimeout(popoverHideTimeout);
      popoverHideTimeout = null;
    }

    const feedbackContainer = document.getElementById("hero-demo-feedback");
    if (!feedbackContainer) return;

    const popoverContent = feedbackContainer.querySelector(".popover-content");

    feedbackContainer.classList.remove("show");
    const FADE_OUT_DELAY = 300; // ms delay for fade out animation
    setTimeout(() => {
      if (popoverContent) {
        popoverContent.innerHTML = "";
      }
    }, FADE_OUT_DELAY);
  }
}

// Initialize the ethics radar demo when DOM is ready
let ethicsDemo = null;
let currentActivePattern = null; // Track currently active pattern
let popoverHideTimeout = null; // Track auto-hide timer for popover

// Global functions for radar demo controls with toggle functionality
window.simulateEthicsPattern = function (pattern, buttonElement) {
  console.log("🎯 Button clicked:", pattern, "ethicsDemo:", ethicsDemo);

  if (ethicsDemo) {
    console.log("✅ EthicsDemo found, processing pattern:", pattern);
    // If clicking the same pattern, toggle it off (deselect)
    if (currentActivePattern === pattern) {
      console.log("🔄 Toggling off current pattern:", pattern);
      ethicsDemo.reset();
      currentActivePattern = null;
      updateButtonStates(null);
    } else {
      // Otherwise, select the new pattern
      console.log("🎨 Applying new pattern:", pattern);
      ethicsDemo.simulatePattern(pattern);
      currentActivePattern = pattern;
      updateButtonStates(pattern);

      // Position and show popover above the clicked button
      if (buttonElement) {
        positionPopoverAboveButton(buttonElement);
      }
    }
  } else {
    console.error(
      "❌ EthicsDemo not initialized - chart may have failed to load",
    );
  }
};

window.resetEthicsDemo = function () {
  if (ethicsDemo) {
    ethicsDemo.reset();
    currentActivePattern = null;
    updateButtonStates(null);
  }
};

// DEBUG: Add direct chart testing function
window.testChartDirect = function (pattern) {
  if (ethicsDemo) {
    ethicsDemo.testDirectChartUpdate(pattern);
  } else {
    console.error("❌ EthicsDemo not initialized");
  }
};

// Helper function to position popover above a specific button
function positionPopoverAboveButton(button) {
  const feedbackContainer = document.getElementById("hero-demo-feedback");
  if (!feedbackContainer || !button) return;

  // Get button position and dimensions
  const buttonRect = button.getBoundingClientRect();
  const controlsContainer = button.closest(".demo-controls-grid");
  const controlsRect = controlsContainer.getBoundingClientRect();

  // Calculate position relative to the controls container
  const leftOffset = buttonRect.left - controlsRect.left + buttonRect.width / 2;

  // Apply positioning
  feedbackContainer.style.left = `${leftOffset}px`;
  feedbackContainer.style.transform = "translateX(-50%)";
}

// Helper function to update button visual states
function updateButtonStates(activePattern) {
  const buttons = document.querySelectorAll(".hero-demo-controls .demo-btn");

  buttons.forEach((button) => {
    const buttonText = button.textContent.toLowerCase();
    let patternName = "";

    // Map button text to pattern names
    if (buttonText.includes("utilitarian")) patternName = "utilitarian";
    else if (buttonText.includes("rights-based")) patternName = "deontological";
    else if (buttonText.includes("virtue")) patternName = "virtue";
    else if (buttonText.includes("balanced")) patternName = "balanced";

    // Update button state
    if (activePattern === patternName) {
      button.classList.add("active");
    } else {
      button.classList.remove("active");
    }
  });
}

window.toggleRadarInstructions = function () {
  const accordion = document.querySelector(".radar-instructions-accordion");
  const content = document.querySelector(
    ".radar-instructions-accordion .accordion-content",
  );

  if (accordion && content) {
    const isOpen = accordion.classList.contains("open");

    if (isOpen) {
      accordion.classList.remove("open");
      content.classList.add("collapsed");
      content.style.maxHeight = "0";
      content.style.opacity = "0";
    } else {
      accordion.classList.add("open");
      content.classList.remove("collapsed");
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.style.opacity = "1";
    }
  }
};

window.toggleEthicsGlossary = function () {
  const accordion = document.querySelector(".ethics-glossary-accordion");
  const content = document.querySelector(
    ".ethics-glossary-accordion .accordion-content",
  );

  if (accordion && content) {
    const isOpen = accordion.classList.contains("open");

    if (isOpen) {
      accordion.classList.remove("open");
      content.classList.add("collapsed");
      content.style.maxHeight = "0";
      content.style.opacity = "0";
    } else {
      accordion.classList.add("open");
      content.classList.remove("collapsed");
      content.style.maxHeight = `${content.scrollHeight}px`;
      content.style.opacity = "1";
    }
  }
};

// Add click-to-close functionality for accordion content areas
document.addEventListener("DOMContentLoaded", () => {
  // Add click listener for radar instructions accordion content
  document.addEventListener("click", (event) => {
    const radarContent = document.querySelector(
      ".radar-instructions-accordion.open .accordion-content",
    );
    if (radarContent && radarContent.contains(event.target)) {
      // Check if click is within the content area but not on the header
      const header = document.querySelector(
        ".radar-instructions-accordion .accordion-header",
      );
      if (!header || !header.contains(event.target)) {
        window.toggleRadarInstructions();
      }
    }

    // Add click listener for ethics glossary accordion content
    const glossaryContent = document.querySelector(
      ".ethics-glossary-accordion.open .accordion-content",
    );
    if (glossaryContent && glossaryContent.contains(event.target)) {
      // Check if click is within the content area but not on the header
      const header = document.querySelector(
        ".ethics-glossary-accordion .accordion-header",
      );
      if (!header || !header.contains(event.target)) {
        window.toggleEthicsGlossary();
      }
    }
  });
});

/**
 * Fallback for script loading issues
 */
window.addEventListener("error", (event) => {
  const errorMessage =
    event.message || event.error?.message || "Unknown error occurred";
  AppDebug.error("Error occurred:", errorMessage);
  AppDebug.error("Event details:", event);
});

// Initialize the application
const app = new SimulateAIApp();

// ============================================================================
// ENTERPRISE STATIC UTILITIES
// ============================================================================

/**
 * Get enterprise application health report
 */
SimulateAIApp.getEnterpriseHealthReport = function () {
  const app = window.simulateAIApp;
  if (!app) {
    return { error: "Application instance not found" };
  }

  return {
    timestamp: new Date().toISOString(),
    version: app.version,
    sessionId: app.sessionId,
    overallHealth: app.healthStatus.overall,
    componentHealth: Object.fromEntries(app.healthStatus.components),
    performanceMetrics: app.performanceMetrics,
    circuitBreakerStates: Object.fromEntries(app.circuitBreakers),
    errorPatterns: Object.fromEntries(app.errorPatterns),
    memoryUsage: app._getCurrentMemoryUsage(),
    recommendations: SimulateAIApp._generateHealthRecommendations(app),
  };
};

/**
 * Generate health recommendations based on current state
 */
SimulateAIApp._generateHealthRecommendations = function (app) {
  const recommendations = [];

  // Memory usage recommendations
  const memoryUsage = app._getCurrentMemoryUsage();
  if (memoryUsage > APP_CONSTANTS.ENTERPRISE.MEMORY_WARNING_THRESHOLD) {
    recommendations.push({
      type: "memory",
      severity: "warning",
      message: `High memory usage detected (${(memoryUsage / 1024 / 1024).toFixed(2)}MB)`,
      action: "Consider refreshing the page or closing unused simulations",
    });
  }

  // Error rate recommendations
  if (app.performanceMetrics.errorCount > 10) {
    recommendations.push({
      type: "errors",
      severity: "warning",
      message: `High error count (${app.performanceMetrics.errorCount})`,
      action: "Check console for error details and consider reporting issues",
    });
  }

  // Circuit breaker recommendations
  app.circuitBreakers.forEach((breaker, component) => {
    if (breaker.state === "open") {
      recommendations.push({
        type: "circuit_breaker",
        severity: "critical",
        message: `Service degraded: ${component}`,
        action: "Some features may be unavailable. Try refreshing the page.",
      });
    }
  });

  // Performance recommendations
  if (
    app.performanceMetrics.initTime >
    APP_CONSTANTS.ENTERPRISE.PERFORMANCE_WARNING_THRESHOLD
  ) {
    recommendations.push({
      type: "performance",
      severity: "info",
      message: `Slow initialization time (${app.performanceMetrics.initTime.toFixed(2)}ms)`,
      action: "Consider checking network connection or browser performance",
    });
  }

  return recommendations;
};

/**
 * Export enterprise diagnostics for support
 */
SimulateAIApp.exportDiagnostics = function () {
  const app = window.simulateAIApp;
  if (!app) {
    return { error: "Application instance not found" };
  }

  return {
    timestamp: new Date().toISOString(),
    sessionInfo: {
      sessionId: app.sessionId,
      version: app.version,
      buildTimestamp: app.buildTimestamp,
      userAgent: navigator.userAgent,
      url: window.location.href,
    },
    healthReport: SimulateAIApp.getEnterpriseHealthReport(),
    applicationLogs: AppDebug.exportLogs(),
    performanceData: {
      navigation: performance.getEntriesByType("navigation"),
      resources: performance.getEntriesByType("resource"),
      measures: performance.getEntriesByType("measure"),
      memory: "memory" in performance ? performance.memory : null,
    },
    componentStates: {
      initialized: app.isInitialized,
      currentSimulation: app.currentSimulation?.id || null,
      theme: app.currentTheme,
      preferences: app.preferences,
      enterpriseConfig: app.enterpriseConfig,
    },
  };
};

// Start the app when DOM is loaded
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => app.init());
} else {
  app.init();
}

// Make app globally available for inline event handlers
window.app = app;

// Make app available as SimulateAI app instance
window.simulateAIApp = app;

// Add backward compatibility
window.aiEthicsApp = app;

// Add debug functions for testing Surprise Me functionality
window.clearAllProgress = () => app.clearAllProgress();
window.markSomeScenariosCompleted = () => app.markSomeScenariosCompleted();
window.testSurpriseMe = () => app.launchRandomScenario();
window.debugShowAllContent = () => app.debugShowAllContent();
window.debugModalState = () => app.debugModalState();

// Deferred badge debugging functions
window.getDeferredBadgeStatus = () => {
  if (
    app.mainGrid &&
    typeof app.mainGrid.getDeferredBadgeStatus === "function"
  ) {
    return app.mainGrid.getDeferredBadgeStatus();
  } else {
    console.log("MainGrid not available or method not found");
    return null;
  }
};

// Enterprise debugging functions
window.getEnterpriseHealth = () => SimulateAIApp.getEnterpriseHealthReport();
window.exportDiagnostics = () => SimulateAIApp.exportDiagnostics();

// Configuration system debugging functions
window.getConfigStatus = () => {
  console.log("🔧 Configuration System Status:", {
    initialized: appStartup.initialized,
    health: window.SimulateAI?.health,
    features: window.SimulateAI?.features,
    metrics: appStartup.getMetrics(),
  });
  return appStartup.getMetrics();
};
window.reloadConfigs = () => appStartup.reloadConfigurations();
window.testConfigComponent = (componentId) =>
  appStartup.getComponent(componentId);
window.getAppLogs = () => AppDebug.exportLogs();
window.getAppDiagnostics = () => AppDebug.getDiagnostics();
window.flushTelemetry = () => AppDebug._flushTelemetry();
window.clearAppBuffers = () => AppDebug.clearBuffers();

// Phased Initialization debugging functions
window.getInitializationStatus = () => {
  const app = window.simulateAIApp;
  if (!app) {
    return { error: "Application instance not found" };
  }

  return {
    isInitialized: app.isInitialized,
    currentPhase: app._getCurrentPhase(),
    phaseTimings: app.performanceMetrics.phaseTimings || {},
    totalInitTime: app.performanceMetrics.initTime || 0,
    componentHealth: Object.fromEntries(app.healthStatus.components),
    criticalErrorCount: app.criticalErrorCount || 0,
    timestamp: new Date().toISOString(),
  };
};

window.getPhaseTimings = () => {
  const app = window.simulateAIApp;
  if (!app || !app.performanceMetrics.phaseTimings) {
    return { error: "Phase timings not available" };
  }

  const timings = app.performanceMetrics.phaseTimings;
  const totalTime = Object.values(timings).reduce((sum, time) => sum + time, 0);

  console.log("⏱️ Initialization Phase Timings:");
  Object.entries(timings).forEach(([phase, time]) => {
    const percentage = ((time / totalTime) * 100).toFixed(1);
    console.log(`  ${phase}: ${time.toFixed(2)}ms (${percentage}%)`);
  });
  console.log(`  Total: ${totalTime.toFixed(2)}ms`);

  return {
    timings,
    totalTime,
    breakdown: Object.entries(timings).map(([phase, time]) => ({
      phase,
      time: Math.round(time),
      percentage: Math.round((time / totalTime) * 100),
    })),
  };
};

window.retryFailedPhase = async (phaseName) => {
  const app = window.simulateAIApp;
  if (!app) {
    console.error("Application instance not found");
    return false;
  }

  console.log(`🔄 Attempting to retry ${phaseName} phase...`);

  try {
    switch (phaseName) {
      case "foundation":
        await app._initializePhase1Foundation();
        break;
      case "services":
        await app._initializePhase2Services();
        break;
      case "components":
        await app._initializePhase3Components();
        break;
      case "interactions":
        await app._initializePhase4Interactions();
        break;
      case "educational":
        await app._initializePhase5Educational();
        break;
      default:
        console.error(`Unknown phase: ${phaseName}`);
        return false;
    }
    console.log(`✅ ${phaseName} phase retry completed successfully`);
    return true;
  } catch (error) {
    console.error(`❌ ${phaseName} phase retry failed:`, error);
    return false;
  }
};

window.debugInitialization = () => {
  console.log("🔍 Initialization Debug Report:");
  console.log("================================");

  const status = window.getInitializationStatus();
  console.log("Status:", status);

  const timings = window.getPhaseTimings();
  console.log("Timings:", timings);

  const health = window.getEnterpriseHealth();
  console.log("Health:", health);

  return { status, timings, health };
};

// Enhanced Analytics debugging functions
window.getAnalyticsStatus = () => {
  const status = {
    enhanced: {
      initialized: AnalyticsManager.isInitialized,
      config: AnalyticsManager.config,
      queueSize: AnalyticsManager.eventQueue?.length || 0,
      retryQueueSize: AnalyticsManager.retryQueue?.length || 0,
    },
    simple: {
      available: typeof simpleAnalytics !== "undefined",
      initialized: simpleAnalytics.isInitialized || false,
    },
  };
  console.log("🔍 Analytics System Status:", status);
  return status;
};

window.flushAnalytics = () => {
  if (AnalyticsManager.isInitialized) {
    AnalyticsManager.flush();
    console.log("📤 Enhanced analytics flushed");
  }
};

window.generateAnalyticsInsights = async () => {
  if (app.analyticsManager.isInitialized) {
    const insights = await app.generateAnalyticsInsights();
    console.log("📊 Analytics Insights:", insights);
    return insights;
  }
  console.warn("Enhanced analytics not initialized");
  return null;
};

window.trackTestEvent = (eventName, data = {}) => {
  if (app.analyticsManager.isInitialized) {
    app.analyticsManager.trackEvent(eventName, { ...data, test: true });
    console.log(`📝 Test event tracked: ${eventName}`, data);
  }
};

// SimulateAI Coordination debugging functions
window.getCoordinationStatus = () => {
  if (app && app.categoryGrid && app.categoryGrid.getCoordinationStatus) {
    const status = app.categoryGrid.getCoordinationStatus();
    console.log("🔗 MainGrid Coordination Status:", status);
    return status;
  }
  console.warn("MainGrid coordination not available");
  return null;
};

window.testCoordinatedLaunch = (
  categoryId = "fairness",
  scenarioId = "hiring-algorithm",
) => {
  if (app && app.categoryGrid && app.categoryGrid.launchCoordinatedScenario) {
    console.log(
      `🚀 Testing coordinated scenario launch: ${scenarioId} in ${categoryId}`,
    );
    app.categoryGrid.launchCoordinatedScenario(categoryId, scenarioId, {
      test: true,
    });
  } else {
    console.warn("Coordinated scenario launch not available");
  }
};

window.getCoordinatedService = (serviceName) => {
  if (app && app.categoryGrid && app.categoryGrid.getCoordinatedService) {
    const service = app.categoryGrid.getCoordinatedService(serviceName);
    console.log(`🔧 Coordinated service '${serviceName}':`, service);
    return service;
  }
  console.warn("Coordinated services not available");
  return null;
};

window.testSimulateAIFunction = () => {
  if (app && app.createSimulateAIFunction) {
    const simulateAIFunc = app.createSimulateAIFunction();
    console.log(
      "🎯 SimulateAI Function Interface:",
      Object.keys(simulateAIFunc),
    );
    console.log("📊 Available services:", {
      analytics: !!simulateAIFunc.getAnalytics(),
      badges: !!simulateAIFunc.getBadgeManager(),
      accessibility: !!simulateAIFunc.getAccessibilityManager(),
      config: !!simulateAIFunc.getConfig(),
    });
    return simulateAIFunc;
  }
  console.warn("SimulateAI function not available");
  return null;
};

// Export the class for ES6 modules
export default SimulateAIApp;
