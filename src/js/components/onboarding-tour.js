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
 * ⭐ ENTERPRISE-GRADE ONBOARDING TOUR SYSTEM ⭐
 *
 * Advanced onboarding system with comprehensive enterprise monitoring:
 * - Real-time health monitoring and circuit breakers
 * - Performance analytics for onboarding completion rates
 * - User engagement tracking and behavioral analytics
 * - Accessibility compliance monitoring
 * - Error recovery and failsafe mechanisms
 * - Telemetry batching and enterprise logging
 *
 * Onboarding Coach Marks System
 * Creates a guided walkthrough using spotlight/coach marks with auto-scroll
 */

import logger from "../utils/logger.js";
import focusManager from "../utils/focus-manager.js";
import scrollManager from "../utils/scroll-manager.js";
import ModalUtility from "./modal-utility.js";
import { simpleStorage } from "../utils/simple-storage.js";
import { simpleAnalytics } from "../utils/simple-analytics.js";
import DataHandler from "../core/data-handler.js";

// === ENTERPRISE ONBOARDING CONSTANTS ===
const ENTERPRISE_CONSTANTS = {
  // Health monitoring
  HEALTH_CHECK_INTERVAL: 30000, // 30 seconds
  ERROR_THRESHOLD: 5,
  MAX_RECOVERY_ATTEMPTS: 3,
  HEARTBEAT_INTERVAL: 60000, // 1 minute

  // Performance thresholds
  STEP_TRANSITION_TIME: 1000, // Max time for step transition
  ANIMATION_DURATION: 800, // Max animation time
  SCROLL_TIMEOUT: 5000, // Max scroll operation time
  ELEMENT_WAIT_TIMEOUT: 10000, // Max wait for element

  // User engagement
  USER_ENGAGEMENT_THRESHOLD: 5000, // Check every 5 seconds
  MOUSE_MOVEMENT_THRESHOLD: 10, // Pixels for engagement
  INACTIVITY_WARNING: 180000, // 3 minutes
  ABANDONMENT_TIMEOUT: 300000, // 5 minutes

  // Onboarding metrics
  COMPLETION_RATE_TARGET: 0.8, // 80% completion rate
  STEP_COMPLETION_THRESHOLD: 30000, // 30 seconds per step
  TOUR_COMPLETION_THRESHOLD: 600000, // 10 minutes total

  // Accessibility
  ACCESSIBILITY_CHECK_INTERVAL: 2000,
  KEYBOARD_NAVIGATION_TIMEOUT: 5000,
  SCREEN_READER_DELAY: 1500,

  // Telemetry
  TELEMETRY_BATCH_SIZE: 50,
  TELEMETRY_FLUSH_INTERVAL: 30000,

  // Circuit breaker
  CIRCUIT_BREAKER_RESET_TIMEOUT: 60000,
  CIRCUIT_BREAKER_FAILURE_THRESHOLD: 3,
  CIRCUIT_BREAKER_TIMEOUT: 60000,

  // Additional missing constants
  ENGAGEMENT_UPDATE_INTERVAL: 5000,
  HEALTH_THRESHOLD: 70,
  HESITATION_THRESHOLD: 30000,
};

class OnboardingTour {
  static instanceCount = 0;

  constructor() {
    const startTime = performance.now();

    // Initialize DataHandler integration
    this.dataHandler = null;
    this.initializeDataHandler();

    try {
      OnboardingTour.instanceCount++;
      this.instanceId = OnboardingTour.instanceCount;

      const STACK_TRACE_LINES = 5;
      logger.warn(
        "OnboardingTour",
        `🏗️ NEW INSTANCE CREATED #${this.instanceId}`,
        {
          totalInstances: OnboardingTour.instanceCount,
          stackTrace: new Error().stack.split("\n").slice(1, STACK_TRACE_LINES),
        },
      );

      // === ENTERPRISE INITIALIZATION ===
      this.instanceUuid = `onboarding_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      this.isHealthy = true;
      this.errorCount = 0;
      this.lastError = null;
      this.recoveryAttempts = 0;
      this.createdAt = Date.now();
      this.lastHealthCheck = Date.now();

      // Performance metrics tracking
      this.performanceMetrics = {
        tourStartCount: 0,
        totalTourTime: 0,
        averageTourTime: 0,
        stepTransitionCount: 0,
        totalStepTransitionTime: 0,
        averageStepTransitionTime: 0,
        scrollOperationCount: 0,
        totalScrollTime: 0,
        averageScrollTime: 0,
        elementWaitCount: 0,
        totalElementWaitTime: 0,
        averageElementWaitTime: 0,
        userInteractionCount: 0,
        totalUserWaitTime: 0,
        averageUserWaitTime: 0,
        memoryUsage: 0,
        errorRate: 0,
        completionRate: 0,
        abandonmentRate: 0,
        lastTourStartTime: 0,
        lastStepTransitionTime: 0,
        tourCompletionCount: 0,
        tourAbandonmentCount: 0,
      };

      // Circuit breaker for fault tolerance
      this.circuitBreaker = {
        state: "closed", // closed, open, half-open
        failureCount: 0,
        lastFailureTime: null,
        nextAttemptTime: null,
        successCount: 0,
      };

      // Enterprise telemetry batching
      this.telemetryBatch = [];
      this.telemetryBuffer = [];
      this.lastTelemetryFlush = Date.now();

      // Health monitoring intervals
      this.healthCheckInterval = null;
      this.telemetryFlushInterval = null;
      this.heartbeatInterval = null;
      this.engagementTrackingInterval = null;

      // User analytics tracking
      this.userJourney = {
        sessionId: this.instanceUuid,
        startTime: Date.now(),
        steps: [],
        interactions: [],
        abandonmentReason: null,
        completionTime: null,
        deviceInfo: this._getDeviceInfo(),
        engagement: {
          mouseMovements: 0,
          clicks: 0,
          scrolls: 0,
          keystrokes: 0,
          timeOnStep: {},
          hesitationPoints: [],
        },
      };

      // Track all instances for enterprise monitoring
      if (!OnboardingTour._instances) {
        OnboardingTour._instances = new Set();
      }
      OnboardingTour._instances.add(this);

      // Core tour properties
      this.currentStep = 0;
      this.currentTutorial = 1;
      this.isActive = false;
      this.isTransitioning = false; // Prevent race conditions in step transitions
      this.isProcessingAction = false; // Prevent rapid button clicks
      this.isTransitioningTutorial = false; // Prevent multiple tutorial transitions
      this.lastActionTime = null; // Timestamp-based action debouncing
      this.coachMark = null;
      this.overlay = null;
      this.spotlight = null;
      this.contentObserver = null; // For tracking dynamic content changes
      this.contentUpdateTimeout = null; // For debouncing content updates

      // Event handler references to prevent duplicate listeners
      this.currentClickHandler = null;
      this.currentKeyHandler = null;

      // User interaction states
      this.userStates = {
        "option-selected": false,
        "choice-confirmed": false,
        "modal-opened": false,
      };

      // Scroll tracking
      this.isAutoScrolling = false;
      this.userHasManuallyScrolled = false;
      this.lastScrollPosition = 0;
      this.scrollTrackingTimer = null;

      // Initialize enterprise monitoring
      this._initializeEnterpriseMonitoring();

      // Track constructor performance
      const constructorTime = performance.now() - startTime;
      this._recordPerformanceMetric("constructor", constructorTime);

      // Log successful initialization
      this._logTelemetry("instance_created", {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        constructorTime: Math.round(constructorTime * 100) / 100,
        deviceInfo: this.userJourney.deviceInfo,
      });
    } catch (error) {
      this._handleError(error, "constructor");
      throw error;
    }

    // Constants
    this.ANIMATION_DURATION = 300; // ms
    this.SCROLL_DURATION = 800; // ms
    this.SCROLL_OFFSET = 100; // px from top
    this.COACH_MARK_SPACING = 20; // px
    this.AUTO_ADVANCE_DELAY = 3000; // ms for steps with actions
    this.MIN_SCROLL_DISTANCE = 5; // px
    this.EASE_MIDPOINT = 0.5; // easing function midpoint
    this.EASE_MULTIPLIER = 4; // easing function multiplier
    this.DEBOUNCE_DURATION = 300; // ms for preventing rapid clicks
    this.MOBILE_NAVIGATION_SPACE = 60; // px space for mobile navigation
    this.MOBILE_MAX_HEIGHT_RATIO = 0.5; // max height as fraction of viewport
    this.MOBILE_POSITION_RATIO = 0.3; // mobile positioning ratio
    this.MOBILE_COACH_MARK_HEIGHT_RATIO = 0.4; // mobile coach mark max height ratio
    this.MOBILE_BREAKPOINT = 768; // px - mobile breakpoint
    this.SMALL_MOBILE_BREAKPOINT = 480; // px - very small screens
    this.MOBILE_SPACING = 10; // px - reduced spacing on mobile
    this.DESKTOP_SPACING = 20; // px - desktop spacing
    this.MANUAL_SCROLL_RESET_DELAY = 2000; // ms to reset manual scroll flag
    this.LEARNING_LAB_TUTORIAL = 3; // Tutorial number for Learning Lab
    this.TUTORIAL_3_STEP_3_INDEX = 2; // 0-indexed step number for step 3
    this.TUTORIAL_3_BOTTOM_POSITION_START = 2; // 0-indexed: step 3
    this.TUTORIAL_3_BOTTOM_POSITION_END = 7; // 0-indexed: step 8
    this.ACCORDION_CHECK_DELAY = 200; // ms to wait before checking accordion state
    this.MODAL_CHECK_DELAY = 200; // ms between modal closure checks
    this.CHECK_DELAY = 100; // ms for general UI state checks
    this.DEBUG_TEXT_LENGTH = 20; // chars to show in debug logs
    this.CLICK_TIMEOUT = 10000; // ms to wait for user click before fallback
    this.OPTION_TEXT_LENGTH = 50; // chars to show in option logs
    this.CONTENT_UPDATE_DELAY = 100; // ms to debounce content observer updates

    // Keyboard navigation tracking
    this.wasKeyboardNavigation = false;

    // Tutorial steps configuration - Enhanced with robust positioning and element waiting
    this.tutorials = {
      1: {
        // Test Scenario Tutorial
        name: "test-scenario",
        title: "Test Scenario Tutorial",
        steps: [
          {
            id: "welcome",
            title: "Welcome to SimulateAI! 🤖",
            content:
              "A Digital Learning Lab where you journey into the ethical frontiers of AI and Robotics. This tour will guide you through our interactive platform.",
            buttons: [
              { text: "Start Tour", action: "continue", primary: true },
              { text: "Start Exploring", action: "finish", primary: false },
            ],
            target: null,
            position: "center",
            autoScroll: false,
            // Enhanced configuration
            waitForElement: false,
            elementTimeout: 5000,
            retryPositioning: true,
            maxRetries: 3,
            fallbackPosition: "center",
            dimensionHandling: {
              minWidth: 320,
              minHeight: 200,
              maxWidth: 500,
              maxHeight: 400,
            },
            responsiveConfig: {
              mobile: { position: "bottom", padding: 20 },
              tablet: { position: "center", padding: 30 },
              desktop: { position: "center", padding: 40 },
            },
          },
          {
            id: "launch-test",
            title: "Launch Test Scenario",
            content:
              "Click this button to open an interactive ethics simulation and see how moral dilemmas are presented.",
            target: "#test-scenario-modal",
            position: "bottom",
            action: "wait-for-click",
            autoScroll: true,
            highlightClick: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#test-scenario-modal",
              ".test-scenario-button",
              'button[data-target="test-scenario"]',
              ".scenario-launcher",
            ],
            dimensionHandling: {
              minWidth: 280,
              minHeight: 180,
              preferredSpacing: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", spacing: 15 },
              tablet: { position: "bottom", spacing: 25 },
              desktop: { position: "bottom", spacing: 30 },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
            },
          },
          {
            id: "dilemma-section",
            title: "The Dilemma Section",
            content:
              "This section presents the ethical scenario. Read carefully to understand the situation and its complexities.",
            target: ".dilemma-text",
            position: "right",
            waitFor: "scenario-modal",
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".dilemma-text",
              ".scenario-content",
              ".modal-body",
              ".scenario-description",
            ],
            dimensionHandling: {
              minWidth: 300,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 10,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "60%" },
              desktop: { position: "right", maxWidth: "50%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              modalSelector: ".modal-dialog",
              contentSelector: ".dilemma-text",
            },
          },
          {
            id: "ethical-question",
            title: "Ethical Question",
            content:
              "This highlights the core ethical consideration. What values are at stake in this scenario?",
            target: ".ethical-question",
            position: "right",
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 4,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".ethical-question",
              ".question-section",
              ".scenario-question",
              ".ethics-prompt",
            ],
            dimensionHandling: {
              minWidth: 320,
              minHeight: 180,
              preferredSpacing: 20,
              targetPadding: 15,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "95%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              scrollIntoView: true,
            },
          },
          {
            id: "choose-approach",
            title: "Choose Your Approach",
            content:
              "Each approach represents a different ethical framework. Please click the <strong>first option</strong> to continue the tutorial and see how the analysis works!",
            target: ".options-container",
            position: "right",
            action: "wait-for-click",
            highlightClick: true,
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".options-container",
              ".choice-options",
              ".decision-options",
              ".response-options",
            ],
            dimensionHandling: {
              minWidth: 350,
              minHeight: 220,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "60%" },
              desktop: { position: "right", maxWidth: "50%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              scrollIntoView: true,
              ensureVisibility: true,
            },
          },
          {
            id: "pros-cons",
            title: "Pros and Cons Analysis",
            content:
              "Perfect! The details expanded to show the analysis. Every ethical choice has trade-offs - these help you understand the implications.",
            target: ".option-details",
            position: "right",
            autoScroll: true,
            waitForElement: true,
            // Enhanced configuration
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 4,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".option-details",
              ".choice-analysis",
              ".expanded-details",
              ".pros-cons-section",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 200,
              preferredSpacing: 20,
              targetPadding: 15,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "95%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            modalSpecific: {
              waitForExpansion: true,
              expansionDelay: 500,
            },
          },
          {
            id: "radar-chart-preview",
            title: "Radar Chart Visualization",
            content:
              "This radar chart shows how your choice impacts different ethical dimensions. The chart updates based on your selection - we'll explore this in detail in Tutorial 2!",
            target: "#scenario-radar-chart",
            position: "left",
            autoScroll: true,
            waitFor: "option-selected",
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#scenario-radar-chart",
              ".radar-chart",
              ".ethics-chart",
              ".visualization-container",
            ],
            dimensionHandling: {
              minWidth: 320,
              minHeight: 240,
              preferredSpacing: 30,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "left", maxWidth: "60%" },
              desktop: { position: "left", maxWidth: "50%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            chartSpecific: {
              waitForChartRender: true,
              chartRenderTimeout: 3000,
            },
          },
          {
            id: "confirm-choice",
            title: "Confirm Your Decision",
            content:
              'When ready, confirm your choice. Remember - there\'s no "wrong" answer in ethics exploration!',
            target: "#confirm-choice",
            position: "right",
            action: "wait-for-click",
            highlightClick: true,
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#confirm-choice",
              ".confirm-button",
              ".submit-choice",
              ".decision-confirm",
            ],
            dimensionHandling: {
              minWidth: 300,
              minHeight: 180,
              preferredSpacing: 20,
              targetPadding: 15,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "60%" },
              desktop: { position: "right", maxWidth: "50%" },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
          },
          {
            id: "reflection-intro",
            title: "Reflection & Research Portal 🔍",
            content:
              "Welcome to the Reflection and Research portion! Here you can reflect on your answer choice and explore deeper questions that help develop your understanding of the ethical dimensions involved.",
            target: ".reflection-modal, .reusable-modal",
            position: "center",
            waitFor: "reflection-modal",
            autoScroll: false,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 12000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".reflection-modal",
              ".reusable-modal",
              ".modal-dialog",
              ".reflection-container",
            ],
            dimensionHandling: {
              minWidth: 400,
              minHeight: 300,
              preferredSpacing: 40,
              targetPadding: 30,
            },
            responsiveConfig: {
              mobile: { position: "center", maxWidth: "95%" },
              tablet: { position: "center", maxWidth: "80%" },
              desktop: { position: "center", maxWidth: "70%" },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
            },
            modalSpecific: {
              waitForModalOpen: true,
              modalOpenDelay: 1000,
              ensureModalContent: true,
            },
          },
          {
            id: "choice-analysis",
            title: "Your Choice Analysis 📊",
            content:
              "This section analyzes your ethical decision, showing the reasoning behind your choice and its implications across different moral frameworks. Click 'Next' to continue exploring.",
            target: 'button[data-action="next"]',
            position: "left",
            action: "wait-for-click",
            highlightClick: true,
            autoScroll: true,
            waitForElement: true,
            // Enhanced configuration
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              'button[data-action="next"]',
              ".next-button",
              ".continue-button",
              ".modal-footer button:last-child",
            ],
            dimensionHandling: {
              minWidth: 320,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "left", maxWidth: "65%" },
              desktop: { position: "left", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              buttonSelector: 'button[data-action="next"]',
              ensureButtonEnabled: true,
            },
          },
          {
            id: "global-comparison",
            title: "Global Community Comparison 🌍",
            content:
              "See how your choice compares to others in the global community! This data helps you understand different perspectives and decision patterns across diverse backgrounds. Click 'Next' to continue.",
            target: 'button[data-action="next"]',
            position: "left",
            action: "wait-for-click",
            highlightClick: true,
            autoScroll: true,
            waitForElement: true,
            // Enhanced configuration
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              'button[data-action="next"]',
              ".next-button",
              ".continue-button",
              ".modal-footer button:last-child",
            ],
            dimensionHandling: {
              minWidth: 350,
              minHeight: 220,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "left", maxWidth: "65%" },
              desktop: { position: "left", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              waitForDataLoad: true,
              dataLoadTimeout: 5000,
            },
          },
          {
            id: "deeper-reflection",
            title: "Deeper Reflection & Alternative Perspectives 💭",
            content:
              "This section presents alternative viewpoints and encourages deeper reflection on the ethical complexities. Consider how different stakeholders might view this scenario. Click 'Next' to continue.",
            target: 'button[data-action="next"]',
            position: "left",
            action: "wait-for-click",
            highlightClick: true,
            autoScroll: true,
            waitForElement: true,
            // Enhanced configuration
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              'button[data-action="next"]',
              ".next-button",
              ".continue-button",
              ".modal-footer button:last-child",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 220,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "left", maxWidth: "65%" },
              desktop: { position: "left", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              contentSelector: ".reflection-content",
            },
          },
          {
            id: "key-insights",
            title: "Key Insights & Takeaways ✨",
            content:
              "The final reflection step summarizes key insights and learning takeaways from this ethical scenario. These insights help build your ethical reasoning skills. Click 'Complete' to finish the reflection process.",
            target: 'button[data-action="next"]',
            position: "left",
            action: "wait-for-click",
            highlightClick: true,
            autoScroll: true,
            waitForElement: true,
            // Enhanced configuration
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              'button[data-action="next"]',
              ".complete-button",
              ".finish-button",
              ".modal-footer button:last-child",
            ],
            dimensionHandling: {
              minWidth: 350,
              minHeight: 240,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "left", maxWidth: "65%" },
              desktop: { position: "left", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            modalSpecific: {
              waitForModalContent: true,
              finalStep: true,
            },
          },
          {
            id: "tutorial-complete",
            title: "Congratulations! 🎉",
            content:
              "Excellent work! You've successfully completed your first ethical scenario exploration, including the comprehensive reflection and research process. You've learned how to navigate complex moral dilemmas, analyze different approaches, understand the ethical implications through our interactive tools, and engage in deep reflection.<br><br>Would you like to continue with Tutorial 2 to explore the radar chart visualization in more detail?",
            buttons: [
              {
                text: "📊 Continue to Tutorial 2",
                action: "next-tutorial",
                primary: true,
              },
              { text: "Start Exploring", action: "finish", primary: false },
            ],
            target: null,
            position: "center",
            autoScroll: false,
            skipUntil: "choice-confirmed",
            // Enhanced configuration
            waitForElement: false,
            elementTimeout: 3000,
            retryPositioning: false,
            maxRetries: 1,
            fallbackPosition: "center",
            dimensionHandling: {
              minWidth: 400,
              minHeight: 300,
              maxWidth: 600,
              maxHeight: 500,
            },
            responsiveConfig: {
              mobile: { position: "center", padding: 20 },
              tablet: { position: "center", padding: 30 },
              desktop: { position: "center", padding: 40 },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
            },
          },
        ],
      },
      2: {
        // Hero Demo Tutorial - Enhanced with robust positioning and element waiting
        name: "hero-demo",
        title: "Hero Demo Tutorial",
        steps: [
          {
            id: "hero-demo-chart",
            title: "Interactive Radar Chart 📊",
            content:
              "This is our Hero Demo radar chart. It shows how different ethical choices impact various dimensions in real-time, giving you a visual representation of moral decision-making.",
            target: "#hero-ethics-chart",
            position: "bottom",
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#hero-ethics-chart",
              ".hero-chart",
              ".ethics-visualization",
              ".demo-chart-container",
            ],
            dimensionHandling: {
              minWidth: 350,
              minHeight: 240,
              preferredSpacing: 30,
              targetPadding: 25,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "bottom", maxWidth: "70%" },
              desktop: { position: "bottom", maxWidth: "60%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            chartSpecific: {
              waitForChartRender: true,
              chartRenderTimeout: 5000,
              verifyChartData: true,
            },
          },
          {
            id: "ethical-dimensions",
            title: "Ethical Dimensions Explained",
            content:
              "The chart displays 8 key ethical dimensions that represent core moral principles. Each axis shows how your decisions impact different aspects of AI ethics - from fairness to sustainability.",
            target: "#hero-ethics-chart",
            position: "left",
            autoScroll: false,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 4,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#hero-ethics-chart",
              ".chart-dimensions",
              ".ethics-axes",
              ".hero-chart",
            ],
            dimensionHandling: {
              minWidth: 360,
              minHeight: 260,
              preferredSpacing: 35,
              targetPadding: 30,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "95%" },
              tablet: { position: "left", maxWidth: "65%" },
              desktop: { position: "left", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            chartSpecific: {
              waitForChartComplete: true,
              highlightDimensions: true,
            },
          },
          {
            id: "interactive-controls",
            title: "Try the Controls! 🎮",
            content:
              'Use these buttons to see how different ethical approaches affect the dimensions. Watch the chart change in real-time as you explore different scenarios! Click "Next" when you\'re ready to continue.',
            target: ".demo-controls-grid",
            position: "left",
            autoScroll: true,
            highlightClick: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              ".demo-controls-grid",
              ".control-buttons",
              ".demo-controls",
              ".interaction-controls",
            ],
            dimensionHandling: {
              minWidth: 320,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "left", maxWidth: "65%" },
              desktop: { position: "left", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            interactionSpecific: {
              waitForControls: true,
              enableInteraction: true,
            },
          },
          {
            id: "how-to-read",
            title: "How to Read Charts 📖",
            content:
              'This section teaches you about interpreting the visual data and understanding the ethical implications of each choice. Click "Next" to continue exploring.',
            target: ".radar-instructions-accordion",
            position: "bottom",
            autoScroll: true,
            highlightClick: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 4,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".radar-instructions-accordion",
              ".instructions-section",
              ".chart-guide",
              ".reading-instructions",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 220,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "bottom", maxWidth: "70%" },
              desktop: { position: "bottom", maxWidth: "60%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            accordionSpecific: {
              waitForAccordion: true,
              expandAccordion: false,
            },
          },
          {
            id: "glossary",
            title: "Ethical Dimensions Glossary 📚",
            content:
              'This glossary provides detailed definitions of each ethical principle used in our simulations. Click "Next" to complete the radar chart tutorial.',
            target: ".ethics-glossary-accordion",
            position: "bottom",
            autoScroll: true,
            highlightClick: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 4,
            fallbackPosition: "center",
            fallbackSelectors: [
              ".ethics-glossary-accordion",
              ".glossary-section",
              ".definitions-accordion",
              ".ethics-definitions",
            ],
            dimensionHandling: {
              minWidth: 350,
              minHeight: 240,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "bottom", maxWidth: "70%" },
              desktop: { position: "bottom", maxWidth: "60%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            accordionSpecific: {
              waitForAccordion: true,
              glossaryType: "ethics",
            },
          },
          {
            id: "radar-tutorial-complete",
            title: "Radar Chart Mastery! 🎉",
            content:
              "Excellent! You now understand how to interpret ethical impacts visually and interact with our radar chart system. Ready to explore the Learning Lab?",
            buttons: [
              {
                text: "🧪 Learning Lab Tutorial",
                action: "next-tutorial",
                primary: true,
              },
              { text: "Start Exploring", action: "finish", primary: false },
            ],
            target: null,
            position: "center",
            autoScroll: false,
            // Enhanced configuration
            waitForElement: false,
            elementTimeout: 3000,
            retryPositioning: false,
            maxRetries: 1,
            fallbackPosition: "center",
            dimensionHandling: {
              minWidth: 400,
              minHeight: 280,
              maxWidth: 600,
              maxHeight: 450,
            },
            responsiveConfig: {
              mobile: { position: "center", padding: 20 },
              tablet: { position: "center", padding: 30 },
              desktop: { position: "center", padding: 40 },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
            },
          },
        ],
      },
      3: {
        // Learning Lab Pre-Launch Modal Tutorial - Enhanced with robust positioning and element waiting
        name: "learning-lab",
        title: "Learning Lab Tutorial",
        steps: [
          {
            id: "find-trolley-problem",
            title: "Scenario Simulations",
            content:
              "Each scenario includes a fully equipped Learning Lab, offering a detailed overview and curated educator resources to deepen understanding and spark meaningful discussion.",
            target:
              "#category-trolley-problem > div.scenarios-grid > article:nth-child(1)",
            position: "bottom",
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 12000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#category-trolley-problem > div.scenarios-grid > article:nth-child(1)",
              ".scenario-card:first-child",
              ".trolley-problem-card",
              ".scenarios-grid article:first-child",
            ],
            dimensionHandling: {
              minWidth: 350,
              minHeight: 220,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "95%" },
              tablet: { position: "bottom", maxWidth: "70%" },
              desktop: { position: "bottom", maxWidth: "60%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            categorySpecific: {
              waitForCategoryLoad: true,
              categoryId: "trolley-problem",
              verifyScenarioCards: true,
            },
          },
          {
            id: "click-learning-lab",
            title: "Open Learning Lab",
            content:
              'Perfect! Now click the "Learning Lab" button on this Trolley Problem scenario card to open the pre-launch modal.',
            target:
              "#category-trolley-problem > div.scenarios-grid > article:nth-child(1) > div.scenario-footer > button.scenario-start-btn",
            position: "bottom",
            action: "wait-for-click",
            autoScroll: true,
            highlightClick: true,
            waitFor:
              "#category-trolley-problem > div.scenarios-grid > article:nth-child(1)",
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 10000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "center",
            fallbackSelectors: [
              "#category-trolley-problem > div.scenarios-grid > article:nth-child(1) > div.scenario-footer > button.scenario-start-btn",
              ".scenario-start-btn",
              ".learning-lab-btn",
              ".launch-scenario-btn",
            ],
            dimensionHandling: {
              minWidth: 320,
              minHeight: 180,
              preferredSpacing: 20,
              targetPadding: 15,
            },
            responsiveConfig: {
              mobile: { position: "top", maxWidth: "90%" },
              tablet: { position: "bottom", maxWidth: "65%" },
              desktop: { position: "bottom", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
              highlightTarget: true,
            },
            buttonSpecific: {
              waitForButtonEnabled: true,
              verifyButtonFunction: true,
            },
          },
          {
            id: "overview-tab",
            title: "Overview Tab",
            content:
              'This Overview tab provides a comprehensive introduction to the scenario, including the ethical dilemma, key stakeholders, and real-world context. Click "Next" to continue exploring the other tabs.',
            target:
              '.tab-buttons-container [data-tab="overview"], .tab-buttons-container .tab-button[data-tab="overview"]',
            position: "right",
            waitFor: "pre-launch-modal",
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 12000,
            retryPositioning: true,
            maxRetries: 6,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              '.tab-buttons-container [data-tab="overview"]',
              '.tab-button[data-tab="overview"]',
              ".overview-tab",
              ".tab-buttons-container .tab-button:first-child",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            modalSpecific: {
              waitForModalOpen: true,
              modalType: "pre-launch",
              waitForTabsLoad: true,
              tabsLoadTimeout: 5000,
            },
          },
          {
            id: "learning-goals-tab",
            title: "Learning Goals Tab",
            content:
              'The Learning Goals tab outlines what you\'ll discover and understand by completing this simulation, including key ethical principles and decision-making frameworks. Click "Next" to continue exploring the other tabs.',
            target:
              '.tab-buttons-container [data-tab="objectives"], .tab-buttons-container .tab-button[data-tab="objectives"]',
            position: "right",
            highlightClick: true,
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              '.tab-buttons-container [data-tab="objectives"]',
              '.tab-button[data-tab="objectives"]',
              ".objectives-tab",
              ".learning-goals-tab",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            tabSpecific: {
              tabName: "objectives",
              waitForTabContent: true,
            },
          },
          {
            id: "ethics-guide-tab",
            title: "Ethics Guide Tab",
            content:
              'The Ethics Guide provides essential background on moral frameworks, philosophical approaches, and ethical theories relevant to this scenario. Click "Next" to see the next tab.',
            target:
              '.tab-buttons-container [data-tab="ethics"], .tab-buttons-container .tab-button[data-tab="ethics"]',
            position: "right",
            highlightClick: true,
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              '.tab-buttons-container [data-tab="ethics"]',
              '.tab-button[data-tab="ethics"]',
              ".ethics-tab",
              ".ethics-guide-tab",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            tabSpecific: {
              tabName: "ethics",
              waitForTabContent: true,
            },
          },
          {
            id: "get-ready-tab",
            title: "Get Ready Tab",
            content:
              'Get Ready helps you prepare for the simulation with pre-activity questions, reflection prompts, and scenario setup information. Click "Next" to continue.',
            target:
              '.tab-buttons-container [data-tab="preparation"], .tab-buttons-container .tab-button[data-tab="preparation"]',
            position: "right",
            highlightClick: true,
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              '.tab-buttons-container [data-tab="preparation"]',
              '.tab-button[data-tab="preparation"]',
              ".preparation-tab",
              ".get-ready-tab",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            tabSpecific: {
              tabName: "preparation",
              waitForTabContent: true,
            },
          },
          {
            id: "resources-tab",
            title: "Resources Tab",
            content:
              'The Resources tab contains supplementary materials, research papers, case studies, and additional reading to deepen your understanding. Click "Next" to see the final tab.',
            target:
              '.tab-buttons-container [data-tab="resources"], .tab-buttons-container .tab-button[data-tab="resources"]',
            position: "right",
            highlightClick: true,
            autoScroll: true,
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              '.tab-buttons-container [data-tab="resources"]',
              '.tab-button[data-tab="resources"]',
              ".resources-tab",
              ".materials-tab",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 200,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            tabSpecific: {
              tabName: "resources",
              waitForTabContent: true,
            },
          },
          {
            id: "for-educators-tab",
            title: "For Educators Tab",
            content:
              "For Educators provides teaching guides, discussion questions, assessment rubrics, and classroom integration strategies for instructors. This completes our tour of the Learning Lab tabs!",
            target:
              '.tab-buttons-container [data-tab="educator"], .tab-buttons-container .tab-button[data-tab="educator"]',
            position: "right",
            highlightClick: true,
            autoScroll: true,
            hasNextButton: true,
            action: "next",
            // Enhanced configuration
            waitForElement: true,
            elementTimeout: 8000,
            retryPositioning: true,
            maxRetries: 5,
            fallbackPosition: "bottom",
            fallbackSelectors: [
              '.tab-buttons-container [data-tab="educator"]',
              '.tab-button[data-tab="educator"]',
              ".educator-tab",
              ".for-educators-tab",
            ],
            dimensionHandling: {
              minWidth: 340,
              minHeight: 220,
              preferredSpacing: 25,
              targetPadding: 20,
            },
            responsiveConfig: {
              mobile: { position: "bottom", maxWidth: "90%" },
              tablet: { position: "right", maxWidth: "65%" },
              desktop: { position: "right", maxWidth: "55%" },
            },
            accessibility: {
              focusOnShow: false,
              announceContent: true,
              keyboardNavigation: true,
            },
            tabSpecific: {
              tabName: "educator",
              waitForTabContent: true,
              finalTab: true,
            },
            onShow() {
              // OPTIMIZED: Enhanced auto-scroll with visibility check to avoid unnecessary scrolling
              const educatorTab =
                document.querySelector(
                  '.tab-buttons-container [data-tab="educator"]',
                ) ||
                document.querySelector(
                  '.tab-buttons-container .tab-button[data-tab="educator"]',
                );

              if (educatorTab) {
                // OPTIMIZED: Check if element is already in viewport to avoid unnecessary scrolling
                const isInViewport = this.isElementInViewport(educatorTab);

                if (!isInViewport) {
                  // Scroll the tab into view with enhanced positioning
                  educatorTab.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                    inline: "center",
                  });
                }

                // Also check tab container visibility before scrolling
                const tabContainer = educatorTab.closest(
                  ".tab-buttons-container",
                );
                if (tabContainer) {
                  const containerInViewport =
                    this.isElementInViewport(tabContainer);

                  if (!containerInViewport) {
                    tabContainer.scrollIntoView({
                      behavior: "smooth",
                      block: "center",
                      inline: "center",
                    });
                  }
                }

                logger.info(
                  "OnboardingTour",
                  "Auto-scrolled to For Educators tab",
                  {
                    element: educatorTab,
                    container: tabContainer,
                    wasInViewport: isInViewport,
                  },
                );
              } else {
                logger.warn(
                  "OnboardingTour",
                  "Could not find For Educators tab",
                );
              }

              // Also auto-scroll nav menu to highlight educators tab (legacy behavior)
              const navEducatorsTab = document.querySelector(
                'a[href="#educator-tools"]',
              );
              if (navEducatorsTab) {
                // OPTIMIZED: Check if nav element needs scrolling
                const navInViewport = this.isElementInViewport(navEducatorsTab);

                if (!navInViewport) {
                  navEducatorsTab.scrollIntoView({
                    behavior: "smooth",
                    block: "center",
                  });
                }

                logger.info(
                  "OnboardingTour",
                  "Auto-scrolled to Educator Tools nav link",
                  { element: navEducatorsTab, wasInViewport: navInViewport },
                );
              }
            },
          },
          {
            id: "tutorial-complete",
            title: "Mission Accomplished! 🎉🤖",
            content:
              "You've completed the tutorial and unlocked the tools to navigate the ethical terrain of intelligent machines. Ready to begin your journey?",
            buttons: [
              { text: "🚀 Start Exploring", action: "finish", primary: true },
            ],
            target: null,
            position: "center",
            autoScroll: false,
            // Enhanced configuration
            waitForElement: false,
            elementTimeout: 3000,
            retryPositioning: false,
            maxRetries: 1,
            fallbackPosition: "center",
            dimensionHandling: {
              minWidth: 400,
              minHeight: 280,
              maxWidth: 600,
              maxHeight: 450,
            },
            responsiveConfig: {
              mobile: { position: "center", padding: 20 },
              tablet: { position: "center", padding: 30 },
              desktop: { position: "center", padding: 40 },
            },
            accessibility: {
              focusOnShow: true,
              announceContent: true,
              keyboardNavigation: true,
            },
          },
        ],
      },
    };

    // Set up keyboard navigation tracking
    this.setupKeyboardTracking();

    this.init();
  }

  /**
   * Initialize DataHandler integration for advanced tour analytics
   */
  async initializeDataHandler() {
    try {
      this.dataHandler = new DataHandler({
        appName: "SimulateAI-OnboardingTour",
        version: "1.50",
        enableFirebase: true,
        enableCaching: true,
        enableOfflineQueue: true,
      });

      logger.info(
        "OnboardingTour",
        "DataHandler initialized for tour analytics",
      );
    } catch (error) {
      logger.warn(
        "OnboardingTour",
        "DataHandler initialization failed, using fallback",
        error,
      );
      this.dataHandler = null;
    }
  }

  init() {
    logger.info("OnboardingTour", "Initializing onboarding coach marks system");

    // Don't auto-start - let the app control when the tour starts
    logger.debug(
      "OnboardingTour",
      "OnboardingTour initialized, waiting for manual start",
    );
  }

  setupKeyboardTracking() {
    // Track when user uses Tab key for navigation
    document.addEventListener("keydown", (e) => {
      if (e.key === "Tab") {
        this.wasKeyboardNavigation = true;
      }
    });

    // Reset keyboard navigation flag on mouse click
    document.addEventListener("mousedown", () => {
      this.wasKeyboardNavigation = false;
    });
  }

  isFirstTimeVisit() {
    const hasVisited = simpleStorage.get("has_visited", false);
    if (!hasVisited) {
      simpleStorage.set("has_visited", true);
      return true;
    }
    return false;
  }

  /**
   * Check if onboarding tour has been completed with DataHandler integration
   */
  async hasCompletedTour() {
    try {
      // Try DataHandler first
      if (this.dataHandler) {
        const tourData = await this.dataHandler.getData("onboarding_tour_data");
        if (tourData && tourData.completed) {
          logger.info(
            "OnboardingTour",
            "Tour completion status loaded from DataHandler",
            {
              completed: tourData.completed,
              completedAt: tourData.completedAt,
              totalTours: tourData.totalCompletions,
            },
          );
          return tourData.completed;
        }
      }

      // Fallback to simpleStorage with migration
      const legacyCompleted = simpleStorage.get("tour_completed", false);
      if (legacyCompleted && this.dataHandler) {
        // Migrate legacy data to DataHandler
        const migrationData = {
          completed: true,
          completedAt: Date.now(),
          totalCompletions: 1,
          migratedFromLegacy: true,
        };
        await this.dataHandler.saveData("onboarding_tour_data", migrationData);
        logger.info(
          "OnboardingTour",
          "Migrated tour completion from simpleStorage to DataHandler",
        );
        return true;
      }

      return legacyCompleted;
    } catch (error) {
      logger.warn(
        "OnboardingTour",
        "Error checking tour completion, using fallback",
        error,
      );
      return simpleStorage.get("tour_completed", false);
    }
  }

  startTour(tutorialNumber = 1) {
    logger.info(
      "OnboardingTour",
      `🚀 Starting onboarding tour ${tutorialNumber}`,
      {
        instanceId: this.instanceId,
        tutorialNumber,
        isActive: this.isActive,
      },
    );

    if (this.isActive) {
      logger.warn(
        "OnboardingTour",
        "Tour already active, ignoring start request",
      );
      return;
    }

    // Initialize tour state
    this.isActive = true;
    this.currentTutorial = tutorialNumber;
    this.currentStep = 0;

    // Reset user interaction states
    this.userStates = {
      "option-selected": false,
      "choice-confirmed": false,
      "modal-opened": false,
    };

    logger.info("OnboardingTour", `Starting tutorial ${tutorialNumber}`, {
      currentStep: this.currentStep,
      totalSteps: this.tutorials[tutorialNumber]?.steps?.length || 0,
    });

    // Track analytics
    simpleAnalytics.trackEvent("tour_started", {
      tutorial: tutorialNumber,
    });

    // Create UI elements and start
    this.createOverlay();
    this.showStep();
  }

  createOverlay() {
    // Remove existing overlay
    this.removeOverlay();

    logger.debug("OnboardingTour", "Creating overlay elements", {
      tutorial: this.currentTutorial,
      step: this.currentStep,
      existingOverlays: document.querySelectorAll(".onboarding-overlay").length,
    });

    // Create main overlay (darkens everything except spotlight)
    this.overlay = document.createElement("div");
    this.overlay.className = "onboarding-overlay";
    this.overlay.setAttribute("role", "presentation");
    this.overlay.setAttribute("aria-hidden", "true");

    // Create spotlight (highlighted area)
    this.spotlight = document.createElement("div");
    this.spotlight.className = "onboarding-spotlight";

    // Create coach mark popup
    this.coachMark = document.createElement("div");
    this.coachMark.className = "onboarding-coach-mark";
    this.coachMark.setAttribute("role", "dialog");
    this.coachMark.setAttribute("aria-modal", "true");
    this.coachMark.setAttribute("aria-labelledby", "coach-mark-title");
    this.coachMark.setAttribute("aria-describedby", "coach-mark-content");

    // Add to DOM in correct order
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.spotlight);
    document.body.appendChild(this.coachMark);

    // Add body class for styling
    document.body.classList.add("onboarding-active");

    // Special handling for Tutorial 3 Step 3 to ensure maximum visibility
    if (
      this.currentTutorial === this.TUTORIAL_3 &&
      this.currentStep === this.TUTORIAL_3_STEP_3_INDEX
    ) {
      // OPTIMIZED: Batch special tutorial 3 styles
      const tutorial3Styles = {
        zIndex: "10020",
        isolation: "isolate",
        position: "fixed",
      };
      Object.assign(this.coachMark.style, tutorial3Styles);

      logger.warn(
        "OnboardingTour",
        "TUTORIAL 3 STEP 3 - Applied aggressive stacking",
        {
          zIndex: this.coachMark.style.zIndex,
          position: getComputedStyle(this.coachMark).position,
          isolation: this.coachMark.style.isolation,
        },
      );
    }

    logger.debug("OnboardingTour", "Overlay elements created and appended", {
      overlayInDom: !!document.querySelector(".onboarding-overlay"),
      totalOverlays: document.querySelectorAll(".onboarding-overlay").length,
      coachMarkInDom: !!document.querySelector(".onboarding-coach-mark"),
    });

    // Setup scroll tracking
    this.setupScrollTracking();

    // Ensure any existing modals are onboarding-friendly
    this.makeModalsOnboardingFriendly();
  }

  makeModalsOnboardingFriendly() {
    // Find any active modal backdrops and make them onboarding-friendly
    const modalBackdrops = document.querySelectorAll(".modal-backdrop");
    modalBackdrops.forEach((backdrop) => {
      if (backdrop.style.display !== "none") {
        // OPTIMIZED: Batch modal backdrop style changes
        const backdropStyles = {
          pointerEvents: "none",
        };
        Object.assign(backdrop.style, backdropStyles);

        const modalDialog = backdrop.querySelector(".modal-dialog");
        if (modalDialog) {
          // OPTIMIZED: Batch modal dialog style changes
          const dialogStyles = {
            pointerEvents: "auto",
          };
          Object.assign(modalDialog.style, dialogStyles);
        }
        logger.debug("OnboardingTour", "Made modal onboarding-friendly", {
          modalId: backdrop.id,
        });
      }
    });
  }

  removeOverlay() {
    logger.debug("OnboardingTour", "Removing overlay elements", {
      hasOverlay: !!this.overlay,
      hasSpotlight: !!this.spotlight,
      hasCoachMark: !!this.coachMark,
      hasContentObserver: !!this.contentObserver,
      totalOverlaysInDom: document.querySelectorAll(".onboarding-overlay")
        .length,
    });

    // Clean up content observer
    if (this.contentObserver) {
      this.contentObserver.disconnect();
      this.contentObserver = null;
    }

    // Clear any pending content update timeouts
    if (this.contentUpdateTimeout) {
      clearTimeout(this.contentUpdateTimeout);
      this.contentUpdateTimeout = null;
    }

    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
    if (this.spotlight) {
      this.spotlight.remove();
      this.spotlight = null;
    }
    if (this.coachMark) {
      this.coachMark.remove();
      this.coachMark = null;
    }

    // Also remove any orphaned overlay elements
    const orphanedOverlays = document.querySelectorAll(".onboarding-overlay");
    const orphanedSpotlights = document.querySelectorAll(
      ".onboarding-spotlight",
    );
    const orphanedCoachMarks = document.querySelectorAll(
      ".onboarding-coach-mark",
    );

    if (
      orphanedOverlays.length > 0 ||
      orphanedSpotlights.length > 0 ||
      orphanedCoachMarks.length > 0
    ) {
      logger.warn("OnboardingTour", "Found orphaned elements, cleaning up", {
        overlays: orphanedOverlays.length,
        spotlights: orphanedSpotlights.length,
        coachMarks: orphanedCoachMarks.length,
      });

      orphanedOverlays.forEach((el) => el.remove());
      orphanedSpotlights.forEach((el) => el.remove());
      orphanedCoachMarks.forEach((el) => el.remove());
    }

    document.body.classList.remove("onboarding-active");

    logger.debug("OnboardingTour", "Overlay cleanup complete", {
      totalOverlaysInDom: document.querySelectorAll(".onboarding-overlay")
        .length,
    });

    // Clean up scroll tracking
    this.removeScrollTracking();
  }

  setupScrollTracking() {
    this.lastScrollPosition = window.pageYOffset;
    this.userHasManuallyScrolled = false;

    // Track scroll events to detect manual scrolling
    this.scrollHandler = () => {
      if (!this.isAutoScrolling) {
        this.userHasManuallyScrolled = true;
        // Clear any existing timer
        if (this.scrollTrackingTimer) {
          clearTimeout(this.scrollTrackingTimer);
        }
        // Reset manual scroll flag after a delay (user might have finished scrolling)
        this.scrollTrackingTimer = setTimeout(() => {
          this.userHasManuallyScrolled = false;
        }, this.MANUAL_SCROLL_RESET_DELAY);
      }
    };

    window.addEventListener("scroll", this.scrollHandler, { passive: true });
  }

  removeScrollTracking() {
    if (this.scrollHandler) {
      window.removeEventListener("scroll", this.scrollHandler);
      this.scrollHandler = null;
    }
    if (this.scrollTrackingTimer) {
      clearTimeout(this.scrollTrackingTimer);
      this.scrollTrackingTimer = null;
    }
  }

  /**
   * Scroll to element using unified scroll manager
   * @param {HTMLElement} element - Element to scroll to
   * @param {number} offset - Scroll offset
   * @returns {Promise<void>} Promise that resolves when scrolling is complete
   */
  async scrollToElement(element, offset = this.SCROLL_OFFSET) {
    if (!element) return;

    // Use the unified scroll manager
    await scrollManager.scrollToElement(element, {
      behavior: "smooth",
      offset,
    });
  }

  positionSpotlight(targetElement) {
    if (!targetElement || !this.spotlight) return;

    const rect = targetElement.getBoundingClientRect();
    const padding = 8;

    // OPTIMIZED: Batch all spotlight positioning styles to reduce DOM mutations
    const spotlightStyles = {
      left: `${rect.left - padding}px`,
      top: `${rect.top + window.pageYOffset - padding}px`,
      width: `${rect.width + padding * 2}px`,
      height: `${rect.height + padding * 2}px`,
      display: "block",
    };
    Object.assign(this.spotlight.style, spotlightStyles);
  }

  positionCoachMark(
    targetElement,
    position = "bottom",
    step = null,
    retryCount = 0,
  ) {
    if (!this.coachMark) return;

    // OPTIMIZED: Use requestAnimationFrame for smoother positioning
    requestAnimationFrame(() => {
      this._performPositioning(targetElement, position, step, retryCount);
    });
  }

  _performPositioning(targetElement, position, step, retryCount) {
    // Enhanced retry logic with step configuration
    const maxRetries = step?.maxRetries || 3;
    if (retryCount > maxRetries) {
      logger.warn(
        "OnboardingTour",
        `⚠️ Max positioning retries reached for step ${step?.id || "unknown"}`,
        {
          stepId: step?.id,
          maxRetries,
          retryCount,
          willUseFallback: !!step?.fallbackPosition,
        },
      );

      // Use enhanced fallback positioning if available
      if (step?.fallbackPosition) {
        return this.applyFallbackPositioning(step);
      }
      return;
    }

    // Enhanced mobile-aware positioning with responsive configuration
    const isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
    const responsiveConfig = step?.responsiveConfig || {};
    const currentConfig = isMobile
      ? responsiveConfig.mobile
      : window.innerWidth <= 1024
        ? responsiveConfig.tablet
        : responsiveConfig.desktop;

    // Use enhanced dimension handling
    const dimensionConfig = step?.dimensionHandling || {};
    const spacing =
      currentConfig?.spacing ||
      (isMobile ? this.MOBILE_SPACING : this.DESKTOP_SPACING);

    // Get viewport dimensions early for responsive calculations
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;

    // OPTIMIZED: Batch initial style setup with enhanced configuration
    const initialStyles = {
      opacity: "0", // Use opacity instead of visibility for smoother transitions
      display: "block",
      position: "fixed",
      zIndex: "10014",
      width: "", // Reset width
      maxHeight: "", // Reset max height
      overflow: "", // Reset overflow
    };

    // Apply responsive width constraints if configured, but respect CSS max-width limits
    if (currentConfig?.maxWidth) {
      // Convert percentage to pixels and compare with CSS max-width constraint (400px)
      const cssMaxWidthPx = 400; // From CSS: .onboarding-coach-mark { max-width: 400px; }

      if (currentConfig.maxWidth.includes("%")) {
        const percentageValue = parseFloat(currentConfig.maxWidth) / 100;
        const calculatedWidthPx = viewportWidth * percentageValue;

        // Use the smaller of calculated percentage width or CSS max-width
        const effectiveMaxWidth = Math.min(calculatedWidthPx, cssMaxWidthPx);
        initialStyles.maxWidth = `${effectiveMaxWidth}px`;

        logger.debug(
          "OnboardingTour",
          "Responsive width constraint applied with CSS limit",
          {
            stepId: step?.id,
            originalPercentage: currentConfig.maxWidth,
            calculatedPx: calculatedWidthPx,
            cssMaxPx: cssMaxWidthPx,
            effectiveMaxPx: effectiveMaxWidth,
            viewportWidth,
          },
        );
      } else {
        // Non-percentage value, apply directly but still respect CSS limits
        const configuredWidthPx = parseFloat(currentConfig.maxWidth);
        const effectiveMaxWidth = Math.min(configuredWidthPx, cssMaxWidthPx);
        initialStyles.maxWidth = `${effectiveMaxWidth}px`;
      }
    }

    // Apply all initial styles at once
    Object.assign(this.coachMark.style, initialStyles);

    // Reset mobile overlay class in case it was previously set
    this.coachMark.classList.remove("mobile-overlay");

    // Force layout recalculation to ensure getBoundingClientRect reflects the new maxWidth
    this.coachMark.offsetHeight; // Trigger layout reflow

    const coachMarkRect = this.coachMark.getBoundingClientRect();

    logger.debug(
      "OnboardingTour",
      "Coach mark dimensions after style application",
      {
        stepId: step?.id,
        appliedMaxWidth: initialStyles.maxWidth,
        actualWidth: coachMarkRect.width,
        actualHeight: coachMarkRect.height,
        viewportWidth,
      },
    );

    // Enhanced dimension safeguards with step configuration
    const safeCoachMarkWidth =
      coachMarkRect.width > 0
        ? coachMarkRect.width
        : dimensionConfig.minWidth || 320;
    const safeCoachMarkHeight =
      coachMarkRect.height > 0
        ? coachMarkRect.height
        : dimensionConfig.minHeight || 200;

    logger.debug("OnboardingTour", "Enhanced coach mark positioning", {
      originalRect: {
        width: coachMarkRect.width,
        height: coachMarkRect.height,
      },
      safeRect: { width: safeCoachMarkWidth, height: safeCoachMarkHeight },
      stepId: step?.id,
      appliedMaxWidth: initialStyles.maxWidth || "none",
      responsiveConfig: currentConfig,
    });

    let left, top;

    if (targetElement) {
      // Get target position relative to viewport (fixed positioning)
      const targetRect = targetElement.getBoundingClientRect();

      // Ensure target is visible in viewport before positioning
      if (
        targetRect.bottom < 0 ||
        targetRect.top > viewportHeight ||
        targetRect.right < 0 ||
        targetRect.left > viewportWidth
      ) {
        // Target is outside viewport, scroll it into view (only if we haven't exceeded retries)
        if (retryCount < maxRetries) {
          logger.debug(
            "OnboardingTour",
            `Target outside viewport, scrolling into view (retry ${retryCount + 1}/${maxRetries})`,
          );
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          // Wait for scroll to complete and retry with incremented count
          setTimeout(() => {
            this.positionCoachMark(
              targetElement,
              position,
              step,
              retryCount + 1,
            );
          }, this.ANIMATION_DURATION);
          return;
        } else {
          // Exceeded retries, position anyway (might be partially visible)
          logger.warn(
            "OnboardingTour",
            `Target still outside viewport after ${maxRetries} retries, positioning anyway`,
          );
        }
      }

      // MOBILE POSITIONING STRATEGY
      if (isMobile) {
        // On mobile, use a more intelligent positioning strategy that avoids covering the target
        const mobileCoachMarkHeight = Math.min(
          safeCoachMarkHeight,
          viewportHeight * this.MOBILE_COACH_MARK_HEIGHT_RATIO,
        ); // Max 40% of screen

        // Calculate available space in each direction
        const spaceAbove = targetRect.top - spacing;
        const spaceBelow = viewportHeight - targetRect.bottom - spacing;

        logger.debug("OnboardingTour", "Mobile positioning analysis", {
          targetRect: {
            x: targetRect.left,
            y: targetRect.top,
            w: targetRect.width,
            h: targetRect.height,
          },
          spaceAbove,
          spaceBelow,
          coachMarkHeight: safeCoachMarkHeight,
          mobileCoachMarkHeight,
        });

        // Priority order for mobile: below target, above target, full-width overlay at bottom
        if (spaceBelow >= mobileCoachMarkHeight) {
          // Enough space below - position there (preferred)
          position = "bottom";
          left = Math.max(
            spacing,
            Math.min(
              targetRect.left + targetRect.width / 2 - safeCoachMarkWidth / 2,
              viewportWidth - safeCoachMarkWidth - spacing,
            ),
          );
          top = targetRect.bottom + spacing;
          logger.debug("OnboardingTour", "Mobile: Positioning below target");
        } else if (spaceAbove >= mobileCoachMarkHeight) {
          // Enough space above - position there
          position = "top";
          left = Math.max(
            spacing,
            Math.min(
              targetRect.left + targetRect.width / 2 - safeCoachMarkWidth / 2,
              viewportWidth - safeCoachMarkWidth - spacing,
            ),
          );
          top = targetRect.top - safeCoachMarkHeight - spacing;
          logger.debug("OnboardingTour", "Mobile: Positioning above target");
        } else {
          // Not enough space above or below - use full-width overlay at bottom
          this.coachMark.classList.add("mobile-overlay");
          left = spacing;
          top =
            viewportHeight -
            safeCoachMarkHeight -
            spacing -
            this.MOBILE_NAVIGATION_SPACE; // Leave space for navigation

          // OPTIMIZED: Batch mobile overlay styles
          const mobileOverlayStyles = {
            width: `${viewportWidth - spacing * 2}px`,
            maxHeight: `${viewportHeight * this.MOBILE_MAX_HEIGHT_RATIO}px`,
            overflow: "auto",
          };
          Object.assign(this.coachMark.style, mobileOverlayStyles);

          logger.debug(
            "OnboardingTour",
            "Mobile: Using full-width overlay mode to avoid covering content",
          );
        }
      } else {
        // Desktop positioning (existing logic)
        // Calculate initial position based on preferred direction
        // Special handling for Tutorial 3 steps 3-8: force bottom positioning
        if (
          this.currentTutorial === this.LEARNING_LAB_TUTORIAL &&
          this.currentStep >= this.TUTORIAL_3_BOTTOM_POSITION_START &&
          this.currentStep <= this.TUTORIAL_3_BOTTOM_POSITION_END
        ) {
          logger.info(
            "OnboardingTour",
            `Forcing bottom position for Tutorial 3 step ${this.currentStep + 1}`,
          );
          position = "bottom";
        }

        switch (position) {
          case "top":
            left =
              targetRect.left + targetRect.width / 2 - safeCoachMarkWidth / 2;
            top = targetRect.top - safeCoachMarkHeight - spacing;
            break;
          case "bottom":
            left =
              targetRect.left + targetRect.width / 2 - safeCoachMarkWidth / 2;
            top = targetRect.bottom + spacing;
            break;
          case "left":
            left = targetRect.left - safeCoachMarkWidth - spacing;
            top =
              targetRect.top + targetRect.height / 2 - safeCoachMarkHeight / 2;
            break;
          case "right":
            left = targetRect.right + spacing;
            top =
              targetRect.top + targetRect.height / 2 - safeCoachMarkHeight / 2;
            break;
          default: // Default to bottom
            left =
              targetRect.left + targetRect.width / 2 - safeCoachMarkWidth / 2;
            top = targetRect.bottom + spacing;
        }

        // VIEWPORT BOUNDS CHECKING - Always keep within viewport
        const minLeft = spacing;
        const maxLeft = viewportWidth - safeCoachMarkWidth - spacing;
        const minTop = spacing;
        const maxTop = viewportHeight - safeCoachMarkHeight - spacing;

        // Clamp to viewport bounds
        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));
      }

      // Special handling for interactive elements - avoid covering target (both mobile and desktop)
      if (
        step &&
        step.highlightClick &&
        !this.coachMark.classList.contains("mobile-overlay")
      ) {
        // If positioned over target, try alternative positions
        if (
          left < targetRect.right &&
          left + safeCoachMarkWidth > targetRect.left &&
          top < targetRect.bottom &&
          top + safeCoachMarkHeight > targetRect.top
        ) {
          if (isMobile) {
            // On mobile, prefer overlay mode when covering target
            this.coachMark.classList.add("mobile-overlay");
            left = spacing;
            top =
              viewportHeight -
              coachMarkRect.height -
              spacing -
              this.MOBILE_NAVIGATION_SPACE;

            // OPTIMIZED: Batch mobile overlay styles for collision handling
            const mobileCollisionStyles = {
              width: `${viewportWidth - spacing * 2}px`,
            };
            Object.assign(this.coachMark.style, mobileCollisionStyles);
          } else {
            // Desktop fallback positioning
            // Try positioning to the right
            if (
              targetRect.right + safeCoachMarkWidth + spacing <=
              viewportWidth
            ) {
              left = targetRect.right + spacing;
              top = Math.max(
                spacing,
                Math.min(
                  targetRect.top,
                  viewportHeight - safeCoachMarkHeight - spacing,
                ),
              );
            }
            // Try positioning to the left
            else if (targetRect.left - safeCoachMarkWidth - spacing >= 0) {
              left = targetRect.left - safeCoachMarkWidth - spacing;
              top = Math.max(
                spacing,
                Math.min(
                  targetRect.top,
                  viewportHeight - safeCoachMarkHeight - spacing,
                ),
              );
            }
            // Try positioning below
            else if (
              targetRect.bottom + safeCoachMarkHeight + spacing <=
              viewportHeight
            ) {
              left = Math.max(
                spacing,
                Math.min(
                  targetRect.left,
                  viewportWidth - safeCoachMarkWidth - spacing,
                ),
              );
              top = targetRect.bottom + spacing;
            }
            // Try positioning above
            else if (targetRect.top - safeCoachMarkHeight - spacing >= 0) {
              left = Math.max(
                spacing,
                Math.min(
                  targetRect.left,
                  viewportWidth - safeCoachMarkWidth - spacing,
                ),
              );
              top = targetRect.top - safeCoachMarkHeight - spacing;
            }
          }
        }
      }

      logger.debug(
        "OnboardingTour",
        "Coach mark positioned relative to target",
        {
          stepId: step?.id,
          targetRect: {
            x: targetRect.left,
            y: targetRect.top,
            w: targetRect.width,
            h: targetRect.height,
          },
          coachMarkPos: { left, top },
          position,
          isMobile,
          isOverlay: this.coachMark.classList.contains("mobile-overlay"),
        },
      );
    } else {
      // Center on viewport for steps without targets
      logger.warn(
        "OnboardingTour",
        `Target element not found for step ${step?.id}, using fallback positioning`,
        {
          stepId: step?.id,
          targetSelector: step?.target,
        },
      );

      if (isMobile) {
        // On mobile, position towards bottom to avoid header overlap
        left = spacing;
        top = Math.max(
          viewportHeight * this.MOBILE_POSITION_RATIO,
          viewportHeight -
            safeCoachMarkHeight -
            spacing -
            this.MOBILE_NAVIGATION_SPACE,
        );

        // OPTIMIZED: Apply mobile centering styles in batch
        const mobileCenterStyles = {
          width: `${viewportWidth - spacing * 2}px`,
        };
        Object.assign(this.coachMark.style, mobileCenterStyles);
      } else {
        left = Math.max(20, viewportWidth / 2 - safeCoachMarkWidth / 2);
        top = Math.max(20, viewportHeight / 2 - safeCoachMarkHeight / 2);
      }

      logger.info(
        "OnboardingTour",
        "Coach mark centered in viewport (fallback)",
        {
          stepId: step?.id,
          targetSelector: step?.target,
          coachMarkPos: { left, top },
          isMobile,
          viewportSize: { width: viewportWidth, height: viewportHeight },
          coachMarkSize: {
            width: safeCoachMarkWidth,
            height: safeCoachMarkHeight,
          },
        },
      );
    }

    // OPTIMIZED: Apply final position and visibility in batch to reduce DOM mutations
    // Allow CSS animations to handle the opacity transition smoothly
    const finalPositionStyles = {
      left: `${left}px`,
      top: `${top}px`,
      pointerEvents: "auto",
      display: "block",
      // Remove opacity and visibility - let CSS animations handle them
    };
    Object.assign(this.coachMark.style, finalPositionStyles);

    // Trigger CSS animation by removing the initial opacity override after positioning
    requestAnimationFrame(() => {
      this.coachMark.style.opacity = "";
    });

    // Final verification that coach mark is visible
    const finalRect = this.coachMark.getBoundingClientRect();
    const isVisible =
      finalRect.width > 0 &&
      finalRect.height > 0 &&
      finalRect.left >= 0 &&
      finalRect.top >= 0 &&
      finalRect.right <= viewportWidth &&
      finalRect.bottom <= viewportHeight;

    if (!isVisible) {
      logger.warn(
        "OnboardingTour",
        "Coach mark may not be fully visible, adjusting",
        {
          stepId: step?.id,
          finalRect: {
            x: finalRect.left,
            y: finalRect.top,
            w: finalRect.width,
            h: finalRect.height,
          },
          viewport: { w: viewportWidth, h: viewportHeight },
        },
      );

      // OPTIMIZED: Emergency fallback with batched style update
      const fallbackStyles = {
        left: `${viewportWidth / 2 - safeCoachMarkWidth / 2}px`,
        top: `${viewportHeight / 2 - safeCoachMarkHeight / 2}px`,
      };
      Object.assign(this.coachMark.style, fallbackStyles);
    }

    logger.info(
      "OnboardingTour",
      `Coach mark positioned for step ${step?.id || "unknown"}`,
      {
        finalPosition: {
          left: this.coachMark.style.left,
          top: this.coachMark.style.top,
        },
        isVisible,
      },
    );
  }

  async showStep() {
    const tutorial = this.tutorials[this.currentTutorial];
    const step = tutorial.steps[this.currentStep];

    if (!step) {
      logger.error("OnboardingTour", "No step found", {
        currentTutorial: this.currentTutorial,
        currentStep: this.currentStep,
        totalSteps: tutorial?.steps?.length,
      });
      return;
    }

    // Track step analytics with DataHandler
    await this.trackStepAnalytics(step);

    logger.info(
      "OnboardingTour",
      `🚀 Starting step ${this.currentStep + 1}: ${step.id}`,
      {
        currentTutorial: this.currentTutorial,
        currentStep: this.currentStep,
        stepId: step.id,
        totalSteps: tutorial.steps.length,
        enhancedConfig: {
          waitForElement: step.waitForElement,
          elementTimeout: step.elementTimeout,
          fallbackSelectors: step.fallbackSelectors?.length || 0,
          retryPositioning: step.retryPositioning,
          maxRetries: step.maxRetries,
        },
      },
    );

    // Enhanced element finding with robust fallback handling
    let targetElement = await this.findTargetElementWithFallbacks(step);

    // Enhanced element waiting with configurable timeout
    if (step.waitForElement && step.target && !targetElement) {
      targetElement = await this.waitForElementWithTimeout(step);
    }

    // Verify target element or use fallback positioning
    if (step.target && !targetElement) {
      logger.warn(
        "OnboardingTour",
        `Target element not found after all attempts: ${step.target}`,
        {
          stepId: step.id,
          selector: step.target,
          fallbackSelectors: step.fallbackSelectors,
          willUseFallbackPosition: !!step.fallbackPosition,
        },
      );
    }

    // Enhanced auto-scroll with responsive awareness
    if (step.autoScroll && targetElement) {
      await this.performEnhancedAutoScroll(targetElement, step);
    }

    // Auto-scroll to target if needed and element exists
    if (step.autoScroll && targetElement) {
      // Special handling for step 4 (ethical-question) - scroll within modal
      if (step.id === "ethical-question") {
        const modalScrolled = this.scrollToElementInModal(targetElement, step);
        if (modalScrolled) {
          // Wait for modal scroll animation
          await new Promise((resolve) =>
            setTimeout(resolve, this.SCROLL_DURATION),
          );
        }
      } else {
        // Regular page scrolling
        const rect = targetElement.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isInViewport) {
          logger.info(
            "OnboardingTour",
            `Scrolling to bring target into view for step ${step.id}`,
          );
          targetElement.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
          });
          // Wait for scroll animation
          await new Promise((resolve) =>
            setTimeout(resolve, this.SCROLL_DURATION),
          );
        }
      }
    }

    // Position spotlight
    if (targetElement) {
      this.positionSpotlight(targetElement);
    } else if (this.spotlight) {
      this.spotlight.style.display = "none";
    }

    // Create coach mark content - with robust null checking
    if (!this.coachMark || !document.body.contains(this.coachMark)) {
      logger.warn(
        "OnboardingTour",
        "Coach mark element is null or not in DOM, recreating overlay",
        {
          currentTutorial: this.currentTutorial,
          currentStep: this.currentStep,
          stepId: step.id,
          isActive: this.isActive,
          coachMarkExists: !!this.coachMark,
          coachMarkInDom: this.coachMark
            ? document.body.contains(this.coachMark)
            : false,
        },
      );
      this.createOverlay();

      if (!this.coachMark) {
        logger.error(
          "OnboardingTour",
          "Failed to create coach mark element, aborting step",
        );
        return;
      }
    }

    // Additional safety check right before setting innerHTML
    if (!this.coachMark) {
      logger.error(
        "OnboardingTour",
        "Coach mark is null right before setting innerHTML - this should not happen!",
      );
      return;
    }

    // Verify the coach mark is still attached to DOM
    if (!document.body.contains(this.coachMark)) {
      logger.error(
        "OnboardingTour",
        "Coach mark exists but is not in DOM - recreating",
      );
      this.createOverlay();
      if (!this.coachMark) {
        logger.error("OnboardingTour", "Failed to recreate coach mark element");
        return;
      }
    }

    try {
      // OPTIMIZED: Only update innerHTML if content has actually changed
      const newContent = this.createCoachMarkContent(step, tutorial);
      if (this.coachMark.innerHTML !== newContent) {
        this.coachMark.innerHTML = newContent;
      }
    } catch (error) {
      logger.error("OnboardingTour", "Error setting coach mark innerHTML", {
        error: error.message,
        coachMark: this.coachMark,
        step: step.id,
      });
      return;
    }

    // Position coach mark
    this.positionCoachMark(targetElement, step.position, step);

    // OPTIMIZED: Final coach mark setup - let CSS animations handle visibility smoothly
    const finalSetupStyles = {
      display: "block",
      pointerEvents: "auto",
      zIndex: "10014",
      // Don't override opacity/visibility - let CSS animations handle the entrance
    };
    Object.assign(this.coachMark.style, finalSetupStyles);

    // Set up event listeners for buttons
    this.setupEventListeners(step);

    // Special handling for specific steps
    if (step.id === "dilemma-section") {
      // Set up content observer for step 3 to track typewriter expansion
      this.setupContentObserver(targetElement, step);
    }

    // Set up action handling
    if (step.action === "wait-for-click" && targetElement) {
      this.waitForElementClick(targetElement, step);
    } else if (step.action === "wait-for-option-selection" && targetElement) {
      logger.info(
        "OnboardingTour",
        `Setting up option selection waiting for step ${step.id}`,
      );
      this.waitForOptionSelection(targetElement, step);
    }

    // Add click highlighting if needed
    if (step.highlightClick && targetElement) {
      targetElement.classList.add("onboarding-click-highlight");
    }

    // Execute onShow callback if defined
    if (step.onShow && typeof step.onShow === "function") {
      try {
        logger.info(
          "OnboardingTour",
          `Executing onShow callback for step ${step.id}`,
        );
        step.onShow.call(this);
      } catch (error) {
        logger.error(
          "OnboardingTour",
          `Error executing onShow callback for step ${step.id}`,
          {
            error: error.message,
          },
        );
      }
    }

    logger.info("OnboardingTour", `✅ Step ${step.id} rendered successfully`, {
      hasTarget: !!targetElement,
      targetInViewport: targetElement
        ? this.isElementInViewport(targetElement)
        : false,
      coachMarkVisible: this.coachMark.style.visibility === "visible",
      coachMarkPosition: {
        left: this.coachMark.style.left,
        top: this.coachMark.style.top,
      },
    });
  }

  createCoachMarkContent(step, tutorial) {
    const stepNumber = this.currentStep + 1;
    const totalSteps = tutorial.steps.length;
    const tutorialNumber = this.currentTutorial;
    const totalTutorials = Object.keys(this.tutorials).length;

    return `
      <div class="coach-mark-header">
        <div class="coach-mark-progress">
          <span class="tutorial-indicator">Tutorial ${tutorialNumber}/${totalTutorials}</span>
          <div class="step-progress">
            <div class="step-dots">
              ${tutorial.steps
                .map(
                  (_, index) =>
                    `<div class="step-dot ${index === this.currentStep ? "active" : index < this.currentStep ? "completed" : ""}"></div>`,
                )
                .join("")}
            </div>
            <span class="step-counter">${stepNumber}/${totalSteps}</span>
          </div>
        </div>
        <button class="coach-mark-close" aria-label="Close tour" type="button">×</button>
      </div>
      
      <div class="coach-mark-body">
        <h3 id="coach-mark-title" class="coach-mark-title">${step.title}</h3>
        <div id="coach-mark-content" class="coach-mark-content">
          ${step.content}
        </div>
      </div>
      
      <div class="coach-mark-footer">
        ${this.createCoachMarkButtons(step)}
      </div>
    `;
  }

  createCoachMarkButtons(step) {
    if (step.buttons) {
      return step.buttons
        .map(
          (button) =>
            `<button class="coach-mark-btn ${button.primary ? "primary" : "secondary"}" 
                 data-action="${button.action}" 
                 type="button">
          ${button.text}
         </button>`,
        )
        .join("");
    }

    // Default buttons for steps without custom buttons
    const isFirstStep = this.currentStep === 0;
    const isLastStep =
      this.currentStep ===
      this.tutorials[this.currentTutorial].steps.length - 1;
    const isLastTutorial =
      this.currentTutorial === Object.keys(this.tutorials).length;
    const hasUserAction =
      step.action &&
      (step.action === "wait-for-click" ||
        step.action === "wait-for-option-selection");

    logger.debug("OnboardingTour", "Creating buttons", {
      stepId: step.id,
      tutorial: this.currentTutorial,
      step: this.currentStep,
      isFirstStep,
      isLastStep,
      isLastTutorial,
      hasUserAction,
      stepAction: step.action,
    });

    let buttons = "";

    // Back button (show for all steps except the first step of any tutorial)
    if (!isFirstStep) {
      buttons += `<button class="coach-mark-btn secondary" data-action="back" type="button">← Back</button>`;
    }

    // Skip button (show for non-final steps, but not for steps waiting for user action)
    if (!isLastStep && !hasUserAction) {
      buttons += `<button class="coach-mark-btn secondary" data-action="skip" type="button">Skip</button>`;
    }

    // Primary action button - only show if not waiting for user action
    if (!hasUserAction) {
      if (isLastStep && isLastTutorial) {
        buttons += `<button class="coach-mark-btn primary" data-action="finish" type="button">🚀 Start Exploring</button>`;
      } else if (isLastStep) {
        buttons += `<button class="coach-mark-btn primary" data-action="next-tutorial" type="button">Next Tutorial</button>`;
      } else {
        buttons += `<button class="coach-mark-btn primary" data-action="continue" type="button">Next</button>`;
      }
    }

    logger.debug("OnboardingTour", "Buttons created", {
      buttons: buttons.length > 0 ? "yes" : "no",
    });

    return buttons;
  }

  setupEventListeners(step) {
    if (!this.coachMark) {
      logger.warn(
        "OnboardingTour",
        "No coach mark element found for event listeners",
      );
      return;
    }

    logger.debug("OnboardingTour", "Setting up event listeners for step", {
      stepId: step.id,
      buttons: this.coachMark.querySelectorAll(".coach-mark-btn").length,
    });

    // IMPROVED: Remove ALL existing event listeners without DOM recreation
    // Store reference to avoid multiple listeners
    if (this.currentClickHandler) {
      this.coachMark.removeEventListener("click", this.currentClickHandler);
      this.currentClickHandler = null;
    }
    if (this.currentKeyHandler) {
      this.coachMark.removeEventListener("keydown", this.currentKeyHandler);
      this.currentKeyHandler = null;
    }

    // CRITICAL: Remove any orphaned event listeners by cloning and replacing the element
    const newCoachMark = this.coachMark.cloneNode(true);
    this.coachMark.parentNode.replaceChild(newCoachMark, this.coachMark);
    this.coachMark = newCoachMark;

    // Set up click handlers for coach mark buttons
    this.currentClickHandler = (e) => {
      logger.info("OnboardingTour", "Coach mark clicked", {
        target: e.target.tagName,
        className: e.target.className,
        textContent: e.target.textContent,
        dataset: e.target.dataset,
      });

      if (e.target.classList.contains("coach-mark-btn")) {
        const { action } = e.target.dataset;

        if (action) {
          // CRITICAL: Prevent event bubbling and default behavior
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation(); // Prevent other listeners on same element

          // Additional protection: Check if we're already processing an action
          if (this.isProcessingAction) {
            logger.debug(
              "OnboardingTour",
              `Button click ignored - already processing action`,
            );
            return;
          }

          logger.info(
            "OnboardingTour",
            `Button clicked with action: ${action}`,
            {
              tutorial: this.currentTutorial,
              step: this.currentStep,
              stepId: step.id,
            },
          );

          this.handleAction(action);
        } else {
          logger.warn("OnboardingTour", "Button clicked but no action found", {
            target: e.target,
            dataset: e.target.dataset,
          });
        }
      }

      if (e.target.classList.contains("coach-mark-close")) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        logger.info("OnboardingTour", "Close button clicked");
        this.endTour();
      }
    };

    this.coachMark.addEventListener("click", this.currentClickHandler);

    // Keyboard navigation
    this.currentKeyHandler = (e) => {
      if (e.key === "Escape") {
        this.endTour();
      } else if (e.key === "Enter" || e.key === " ") {
        if (e.target.classList.contains("coach-mark-btn")) {
          e.preventDefault();
          e.target.click();
        }
      }
    };

    this.coachMark.addEventListener("keydown", this.currentKeyHandler);

    // Focus management - use centralized focus manager for cleaner implementation
    const firstButton = this.coachMark.querySelector(".coach-mark-btn");
    if (firstButton) {
      // Auto-focus using focus manager which respects keyboard navigation preferences
      focusManager.autoFocus(this.coachMark, {
        keyboardOnly: true,
        delay: 100, // Small delay to ensure coach mark is positioned
      });
    }

    logger.debug("OnboardingTour", "Event listeners set up successfully", {
      stepId: step.id,
      hasFirstButton: !!firstButton,
    });
  }

  handleStepAction(step, targetElement) {
    switch (step.action) {
      case "wait-for-click":
        this.waitForElementClick(targetElement);
        break;
      case "wait-for-option-selection":
        this.waitForOptionSelection();
        break;
    }
  }

  waitForElementClick(targetElement) {
    if (!targetElement) {
      logger.warn(
        "OnboardingTour",
        "waitForElementClick: No target element provided",
      );
      return;
    }

    logger.debug("OnboardingTour", "Setting up click listener", {
      targetTag: targetElement.tagName,
      targetClass: targetElement.className,
      tutorial: this.currentTutorial,
      step: this.currentStep,
    });

    const clickHandler = (event) => {
      logger.info("OnboardingTour", "Target element clicked, advancing step", {
        tutorial: this.currentTutorial,
        step: this.currentStep,
        eventTarget: event.target.tagName,
      });
      targetElement.removeEventListener("click", clickHandler);
      clearTimeout(timeoutId);
      // Advance immediately when user clicks the suggested element
      setTimeout(() => this.nextStep(), this.ANIMATION_DURATION);
    };

    targetElement.addEventListener("click", clickHandler);

    // Add a timeout fallback - if modal appears but user didn't click, advance anyway
    const timeoutId = setTimeout(() => {
      // Check if the expected modal is now open
      const modalAppeared = document.querySelector(
        ".pre-launch-modal, .reusable-modal",
      );
      if (modalAppeared) {
        logger.info(
          "OnboardingTour",
          "Modal appeared without tracked click, advancing step",
          {
            tutorial: this.currentTutorial,
            step: this.currentStep,
          },
        );
        targetElement.removeEventListener("click", clickHandler);
        this.nextStep();
      } else {
        logger.warn(
          "OnboardingTour",
          "Timeout waiting for click, but no modal appeared",
          {
            tutorial: this.currentTutorial,
            step: this.currentStep,
          },
        );
      }
    }, this.CLICK_TIMEOUT);

    // Also log if the target element exists and is visible
    logger.debug("OnboardingTour", "Click listener added to target", {
      elementExists: !!targetElement,
      elementVisible: targetElement.offsetParent !== null,
      elementRect: targetElement.getBoundingClientRect(),
    });
  }

  waitForOptionSelection(targetElement, step) {
    logger.info(
      "OnboardingTour",
      `Waiting for option selection in step ${step.id}`,
      {
        targetSelector: step.target,
      },
    );

    // Set up a broad click listener that will catch any clicks in the target area
    const optionClickListener = (e) => {
      const clickedElement = e.target;

      // Check if this looks like an option click
      const isOption =
        clickedElement.tagName === "BUTTON" ||
        clickedElement.classList.contains("option") ||
        clickedElement.classList.contains("option-card") ||
        clickedElement.classList.contains("choice") ||
        clickedElement.classList.contains("response") ||
        clickedElement.hasAttribute("data-option") ||
        clickedElement.hasAttribute("data-option-id") ||
        clickedElement.hasAttribute("data-choice") ||
        clickedElement.closest(
          ".option, .option-card, .choice, .response-option",
        );

      if (isOption) {
        logger.info(
          "OnboardingTour",
          `✅ Option selection detected in step ${step.id}`,
          {
            clickedElement: clickedElement.tagName,
            clickedClass: clickedElement.className,
            clickedText: clickedElement.textContent.substring(
              0,
              this.OPTION_TEXT_LENGTH,
            ),
          },
        );

        // Remove the listener
        targetElement.removeEventListener("click", optionClickListener);

        // Mark as selected
        this.userStates["option-selected"] = true;
        clickedElement.classList.add("onboarding-selected");

        // Advance to next step
        setTimeout(() => {
          this.nextStep();
        }, this.SELECTION_DELAY);
      }
    };

    targetElement.addEventListener("click", optionClickListener);

    // Also add highlighting to make it clear the area is interactive
    targetElement.classList.add("onboarding-click-highlight");

    logger.debug(
      "OnboardingTour",
      `Option selection listener attached for step ${step.id}`,
    );
  }

  waitForCondition(condition, callback) {
    const checkCondition = () => {
      let conditionMet = false;

      switch (condition) {
        case "scenario-modal":
          conditionMet =
            document.querySelector(".scenario-modal-dialog") !== null;
          // Add delay for modal animation to complete
          if (conditionMet) {
            setTimeout(callback, this.ANIMATION_DURATION);
            return;
          }
          break;
        case "pre-launch-modal":
          conditionMet = document.querySelector(".pre-launch-modal") !== null;
          // Add delay for modal animation to complete
          if (conditionMet) {
            setTimeout(callback, this.ANIMATION_DURATION);
            return;
          }
          break;
        case "option-selected":
          conditionMet = this.userStates["option-selected"];
          break;
        case "choice-confirmed":
          conditionMet = this.userStates["choice-confirmed"];
          break;
        default:
          conditionMet = document.querySelector(condition) !== null;
      }

      if (conditionMet) {
        callback();
      } else {
        setTimeout(checkCondition, this.CHECK_DELAY);
      }
    };

    checkCondition();
  }

  handleAction(action) {
    // Prevent rapid-fire clicks with debouncing - with timestamp protection
    const now = Date.now();
    if (
      this.isProcessingAction ||
      (this.lastActionTime && now - this.lastActionTime < 100)
    ) {
      logger.debug(
        "OnboardingTour",
        `Action ${action} ignored - already processing another action or too soon`,
        {
          isProcessingAction: this.isProcessingAction,
          timeSinceLastAction: this.lastActionTime
            ? now - this.lastActionTime
            : "N/A",
          currentTutorial: this.currentTutorial,
          currentStep: this.currentStep,
        },
      );
      return;
    }

    this.isProcessingAction = true;
    this.lastActionTime = now;

    logger.info("OnboardingTour", `Handling action: ${action}`, {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
      actionTimestamp: now,
      isTransitioning: this.isTransitioning,
      isTransitioningTutorial: this.isTransitioningTutorial,
    });

    switch (action) {
      case "continue":
        this.nextStep();
        // Reset flag after step transition
        setTimeout(() => {
          this.isProcessingAction = false;
        }, this.DEBOUNCE_DURATION);
        break;
      case "back":
        this.previousStep();
        // Reset flag after step transition
        setTimeout(() => {
          this.isProcessingAction = false;
        }, this.DEBOUNCE_DURATION);
        break;
      case "next-tutorial":
        logger.info("OnboardingTour", "next-tutorial action triggered", {
          currentTutorial: this.currentTutorial,
          currentStep: this.currentStep,
          isActive: this.isActive,
          actionTimestamp: now,
        });
        this.nextTutorial();
        // Flag will be reset in nextTutorial() method itself
        break;
      case "finish":
      case "skip":
        this.endTour();
        // Reset flag after tour ends
        setTimeout(() => {
          this.isProcessingAction = false;
        }, this.DEBOUNCE_DURATION);
        break;
      default:
        logger.warn("OnboardingTour", `Unknown action: ${action}`);
        this.isProcessingAction = false;
    }
  }

  nextStep() {
    // Prevent race conditions - don't process if already transitioning
    if (this.isTransitioning) {
      logger.debug(
        "OnboardingTour",
        "Step transition already in progress, ignoring",
      );
      return;
    }

    this.isTransitioning = true;

    // Remove click highlights
    document.querySelectorAll(".onboarding-click-highlight").forEach((el) => {
      el.classList.remove("onboarding-click-highlight");
    });

    const tutorial = this.tutorials[this.currentTutorial];

    logger.info("OnboardingTour", `Moving to next step`, {
      currentStep: this.currentStep,
      totalSteps: tutorial.steps.length,
      currentStepId: tutorial.steps[this.currentStep]?.id,
    });

    if (this.currentStep < tutorial.steps.length - 1) {
      this.currentStep++;
      logger.info(
        "OnboardingTour",
        `Advanced to step ${this.currentStep + 1}`,
        {
          newStepId: tutorial.steps[this.currentStep]?.id,
        },
      );

      // Small delay to ensure clean transition
      const TRANSITION_DELAY = 50; // ms
      setTimeout(() => {
        this.isTransitioning = false;
        this.showStep();
      }, TRANSITION_DELAY);
    } else {
      logger.info(
        "OnboardingTour",
        "Tutorial complete, moving to next tutorial",
      );
      this.isTransitioning = false;
      this.nextTutorial();
    }
  }

  previousStep() {
    // Remove click highlights
    document.querySelectorAll(".onboarding-click-highlight").forEach((el) => {
      el.classList.remove("onboarding-click-highlight");
    });

    // Only go back within the current tutorial
    if (this.currentStep > 0) {
      this.currentStep--;
      // Reset user states when going backwards to allow re-interaction
      this.resetUserStatesForCurrentStep();
      this.showStep();
    }
    // Don't do anything if we're at the first step - back button shouldn't be visible anyway
  }

  resetUserStatesForCurrentStep() {
    // Reset relevant user states when going backwards to allow re-interaction
    const tutorial = this.tutorials[this.currentTutorial];
    const step = tutorial.steps[this.currentStep];

    // If going back to a step that waits for user interaction, reset the relevant state
    if (step && step.action === "wait-for-option-selection") {
      this.userStates["option-selected"] = false;
    }
  }

  nextTutorial() {
    // Prevent multiple simultaneous calls
    if (this.isTransitioningTutorial) {
      logger.warn(
        "OnboardingTour",
        "nextTutorial called while already transitioning",
      );
      return;
    }

    this.isTransitioningTutorial = true;

    // Track tutorial completion
    simpleAnalytics.trackEvent("tour_tutorial_completed", {
      tutorial: this.currentTutorial,
    });

    const totalTutorials = Object.keys(this.tutorials).length;
    logger.info("OnboardingTour", `nextTutorial called`, {
      currentTutorial: this.currentTutorial,
      totalTutorials,
      willContinue: this.currentTutorial < totalTutorials,
    });

    if (this.currentTutorial < totalTutorials) {
      this.currentTutorial++;
      this.currentStep = 0;
      // Reset user states for new tutorial
      this.userStates = {
        "option-selected": false,
        "choice-confirmed": false,
        "modal-opened": false,
      };
      logger.info(
        "OnboardingTour",
        `Starting tutorial ${this.currentTutorial}`,
      );

      // Special handling for Tutorial 2 - close any open modals and scroll to hero demo
      if (this.currentTutorial === 2) {
        // Check if there's a modal open from Tutorial 1
        const scenarioModal = document.querySelector(".scenario-modal");
        const preLaunchModal = document.querySelector(".pre-launch-modal");

        if (scenarioModal || preLaunchModal) {
          logger.info(
            "OnboardingTour",
            "Modal detected, closing modal before starting Tutorial 2",
          );

          // Set a maximum wait time and force progression if needed
          let tutorialStarted = false;
          const forceStartTimeout = setTimeout(() => {
            if (!tutorialStarted) {
              logger.warn(
                "OnboardingTour",
                "Forcing Tutorial 2 start due to modal closure timeout",
              );
              tutorialStarted = true;
              this.scrollToHeroDemoAndStart();
              this.isTransitioningTutorial = false;
            }
          }, 3000); // 3 second maximum wait (reduced from 15 seconds)

          this.waitForModalClosure(() => {
            if (!tutorialStarted) {
              tutorialStarted = true;
              clearTimeout(forceStartTimeout);
              // After modal closes, scroll to hero demo and start tutorial
              this.scrollToHeroDemoAndStart();
              this.isTransitioningTutorial = false;
            }
          });

          // Close the modal
          if (scenarioModal) {
            const closeBtn = scenarioModal.querySelector(
              ".modal-close, .close-modal",
            );
            if (closeBtn) {
              closeBtn.click();
            }
          }
          if (preLaunchModal) {
            const closeBtn = preLaunchModal.querySelector(
              ".modal-close, .close-modal",
            );
            if (closeBtn) {
              closeBtn.click();
            }
          }
        } else {
          logger.info(
            "OnboardingTour",
            "No modal detected, scrolling to hero demo for Tutorial 2",
          );
          this.scrollToHeroDemoAndStart();
          this.isTransitioningTutorial = false;
        }

        // Reset processing flag immediately for Tutorial 2 since async operations will handle the rest
        this.isProcessingAction = false;
        logger.debug(
          "OnboardingTour",
          "Processing flag reset for Tutorial 2 transition",
        );
      }
      // Special handling for Tutorial 3 - wait for scenario modal to close if one is open
      else if (this.currentTutorial === this.LEARNING_LAB_TUTORIAL) {
        // Check if there's actually a modal open before waiting
        const scenarioModal = document.querySelector(".scenario-modal");
        const preLaunchModal = document.querySelector(".pre-launch-modal");

        if (scenarioModal || preLaunchModal) {
          logger.info(
            "OnboardingTour",
            "Modal detected, waiting for closure before starting Tutorial 3",
          );
          this.waitForModalClosure(() => {
            this.showStep();
            this.isTransitioningTutorial = false;
          });
        } else {
          logger.info(
            "OnboardingTour",
            "No modal detected, starting Tutorial 3 immediately",
          );
          this.showStep();
          this.isTransitioningTutorial = false;
        }

        // Reset processing flag after initiating Tutorial 3
        this.isProcessingAction = false;
        logger.debug(
          "OnboardingTour",
          "Processing flag reset for Tutorial 3 transition",
        );
      } else {
        this.showStep();
        this.isTransitioningTutorial = false;
        // Reset processing flag for normal tutorial progression
        this.isProcessingAction = false;
        logger.debug(
          "OnboardingTour",
          "Processing flag reset for normal tutorial transition",
        );
      }
    } else {
      this.endTour();
      this.isTransitioningTutorial = false;
      // Reset processing flag after tour ends
      this.isProcessingAction = false;
      logger.debug("OnboardingTour", "Processing flag reset after tour end");
    }
  }

  previousTutorial() {
    if (this.currentTutorial > 1) {
      this.currentTutorial--;
      // Go to the last step of the previous tutorial
      const previousTutorial = this.tutorials[this.currentTutorial];
      this.currentStep = previousTutorial.steps.length - 1;
      // Reset user states for previous tutorial
      this.userStates = {
        "option-selected": false,
        "choice-confirmed": false,
        "modal-opened": false,
      };
      logger.info(
        "OnboardingTour",
        `Going back to tutorial ${this.currentTutorial}`,
      );
      this.showStep();
    }
  }

  async endTour() {
    const STACK_TRACE_LINES = 5;
    logger.info("OnboardingTour", "Ending tour", {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
      stackTrace: new Error().stack.split("\n").slice(1, STACK_TRACE_LINES),
    });

    // Remove click highlights
    document.querySelectorAll(".onboarding-click-highlight").forEach((el) => {
      el.classList.remove("onboarding-click-highlight");
    });

    // Close pre-launch modal if we're finishing Tutorial 3 (Learning Lab)
    if (this.currentTutorial === this.LEARNING_LAB_TUTORIAL) {
      logger.info(
        "OnboardingTour",
        "Closing pre-launch modal after Tutorial 3 completion",
      );

      // Strategy 1: Look specifically for the pre-launch modal's cancel button
      let modalClosed = false;

      // First try to find a visible pre-launch modal and trigger its cancel button
      const visibleModals = document.querySelectorAll(
        '.modal-backdrop[style*="flex"], [id^="modal-"][style*="flex"], .modal-backdrop.show, .modal-backdrop.visible',
      );
      logger.info(
        "OnboardingTour",
        `Found ${visibleModals.length} potentially visible modals`,
      );

      for (const modal of visibleModals) {
        const modalTitle = modal.querySelector(".modal-title");
        const isPreLaunchModal =
          modalTitle && modalTitle.textContent.includes("Prepare to Explore");

        logger.info(
          "OnboardingTour",
          `Checking modal: ${modal.id || "no-id"}, title: ${modalTitle?.textContent || "no-title"}, isPreLaunch: ${isPreLaunchModal}`,
        );

        if (isPreLaunchModal) {
          const cancelButton = modal.querySelector(
            "#cancel-launch, .btn-cancel",
          );
          if (cancelButton) {
            logger.info(
              "OnboardingTour",
              "Found pre-launch modal, triggering cancel button for proper cleanup",
            );
            try {
              cancelButton.click();
              modalClosed = true;
              logger.info(
                "OnboardingTour",
                "Successfully triggered cancel button",
              );
              break;
            } catch (error) {
              logger.error(
                "OnboardingTour",
                "Error clicking cancel button:",
                error,
              );
            }
          } else {
            logger.warn(
              "OnboardingTour",
              "Pre-launch modal found but no cancel button",
            );
          }
        }
      }

      // Strategy 2: If no pre-launch modal found, try any visible cancel button
      if (!modalClosed) {
        logger.info(
          "OnboardingTour",
          "No pre-launch modal cancel button found, trying fallback approach",
        );
        const cancelButtons = document.querySelectorAll(
          "#cancel-launch, .btn-cancel",
        );
        logger.info(
          "OnboardingTour",
          `Found ${cancelButtons.length} cancel buttons in DOM`,
        );

        cancelButtons.forEach((cancelButton, index) => {
          if (cancelButton && !modalClosed) {
            // Check if this button is in a visible modal
            const modal = cancelButton.closest(
              '.modal-backdrop, [id^="modal-"], #simulation-modal',
            );
            const isVisible =
              modal &&
              (modal.style.display === "flex" ||
                modal.classList.contains("show") ||
                modal.classList.contains("visible"));

            logger.info(
              "OnboardingTour",
              `Cancel button ${index}: modal=${modal?.id || "no-modal"}, visible=${isVisible}`,
            );

            if (isVisible) {
              logger.info(
                "OnboardingTour",
                "Triggering fallback cancel button click for modal cleanup",
              );
              try {
                cancelButton.click();
                modalClosed = true;
                logger.info(
                  "OnboardingTour",
                  "Successfully triggered fallback cancel button",
                );
              } catch (error) {
                logger.error(
                  "OnboardingTour",
                  "Error clicking fallback cancel button:",
                  error,
                );
              }
            }
          }
        });
      }

      // Strategy 3: If no cancel button found, fall back to manual cleanup
      if (!modalClosed) {
        logger.info(
          "OnboardingTour",
          "No accessible cancel button found, using manual cleanup",
        );

        // Use the new ModalUtility cleanup methods to handle orphaned modals
        ModalUtility.cleanupOrphanedModals();

        // First, try to find the modal instance through any available method
        const preLaunchModalElements =
          document.querySelectorAll('[id^="modal-"]');

        preLaunchModalElements.forEach((modalElement) => {
          // Check if this looks like a pre-launch modal by checking content
          const modalTitle = modalElement.querySelector(".modal-title");
          if (
            modalTitle &&
            modalTitle.textContent.includes("Prepare to Explore")
          ) {
            // Try to find the close button and click it
            const closeButton = modalElement.querySelector(
              "[data-modal-close], .modal-close, .close-btn",
            );
            if (closeButton) {
              closeButton.click();
              logger.info(
                "OnboardingTour",
                "Closed pre-launch modal via close button after Tutorial 3 completion",
              );
            } else {
              // Use ModalUtility to force destroy
              ModalUtility.destroyModalById(modalElement.id);
              logger.info(
                "OnboardingTour",
                "Force destroyed pre-launch modal after Tutorial 3 completion",
              );
            }
          }
        });

        // Also try the legacy selector approach as fallback
        const preLaunchModal = document.querySelector(".pre-launch-modal");
        if (preLaunchModal) {
          const closeButton = preLaunchModal.querySelector(
            "[data-modal-close], .modal-close, .close-btn",
          );
          if (closeButton) {
            closeButton.click();
            logger.info(
              "OnboardingTour",
              "Closed legacy pre-launch modal after Tutorial 3 completion",
            );
          } else {
            preLaunchModal.remove();
            logger.info(
              "OnboardingTour",
              "Manually removed legacy pre-launch modal after Tutorial 3 completion",
            );
          }
        }
      }

      // Final cleanup using ModalUtility - use aggressive cleanup for Tutorial 3
      // Add a small delay to ensure all DOM operations are complete
      setTimeout(() => {
        logger.info(
          "OnboardingTour",
          "Running final cleanup after tutorial 3 completion",
        );

        // Count modals before cleanup for comparison
        const modalsBefore = document.querySelectorAll(
          '[id^="modal-"], .modal-backdrop, .modal-dialog, .modal-body, #simulation-modal',
        ).length;
        logger.info(
          "OnboardingTour",
          `Modal elements before cleanup: ${modalsBefore}`,
        );

        ModalUtility.aggressiveModalCleanup();

        // Also run the standard cleanup as a safety net
        ModalUtility.cleanupOrphanedModals();

        // Count modals after cleanup
        const modalsAfter = document.querySelectorAll(
          '[id^="modal-"], .modal-backdrop, .modal-dialog, .modal-body, #simulation-modal',
        ).length;
        logger.info(
          "OnboardingTour",
          `Modal elements after cleanup: ${modalsAfter} (removed ${modalsBefore - modalsAfter})`,
        );

        if (modalsAfter === 0) {
          logger.info(
            "OnboardingTour",
            "✅ All modal elements successfully cleaned up",
          );
        } else {
          logger.warn(
            "OnboardingTour",
            `⚠️ ${modalsAfter} modal elements still remain in DOM`,
          );
        }
      }, 100);
    }

    // Track completion with enhanced analytics
    simpleAnalytics.trackEvent("tour_completed", {
      tutorial: this.currentTutorial,
      step: this.currentStep,
    });

    // Save completion with DataHandler integration
    await this.saveTourCompletion();

    // Clean up
    this.removeOverlay();
    this.isActive = false;
  }

  /**
   * Save tour completion with comprehensive analytics
   */
  async saveTourCompletion() {
    try {
      const completionData = {
        completed: true,
        completedAt: Date.now(),
        completedTutorial: this.currentTutorial,
        totalSteps: this.currentStep + 1,
        sessionId: this.instanceUuid,
        userJourney: this.userJourney,
        performanceMetrics: this.performanceMetrics,
        deviceInfo: this.userJourney.deviceInfo,
        totalCompletions: 1,
      };

      // Try DataHandler first
      if (this.dataHandler) {
        // Get existing data to increment completion count
        const existingData = await this.dataHandler.getData(
          "onboarding_tour_data",
        );
        if (existingData) {
          completionData.totalCompletions =
            (existingData.totalCompletions || 0) + 1;
        }

        await this.dataHandler.saveData("onboarding_tour_data", completionData);
        logger.info("OnboardingTour", "Tour completion saved to DataHandler", {
          tutorial: this.currentTutorial,
          totalCompletions: completionData.totalCompletions,
          sessionDuration: Date.now() - this.userJourney.startTime,
        });

        // Also save detailed analytics
        await this.dataHandler.saveData("onboarding_analytics", {
          sessionId: this.instanceUuid,
          completedAt: Date.now(),
          userJourney: this.userJourney,
          performanceMetrics: this.performanceMetrics,
          telemetryBatch: this.telemetryBatch,
        });
      }

      // Fallback to simpleStorage
      simpleStorage.set("tour_completed", true);
    } catch (error) {
      logger.warn(
        "OnboardingTour",
        "Error saving tour completion, using fallback",
        error,
      );
      simpleStorage.set("tour_completed", true);
    }
  }

  /**
   * Track detailed step analytics with DataHandler
   */
  async trackStepAnalytics(step) {
    try {
      const stepData = {
        sessionId: this.instanceUuid,
        tutorial: this.currentTutorial,
        stepIndex: this.currentStep,
        stepId: step.id,
        stepTitle: step.title,
        timestamp: Date.now(),
        timeOnPreviousStep: this.lastStepStartTime
          ? Date.now() - this.lastStepStartTime
          : 0,
        userInteractions: this.userJourney.interactions.slice(-10), // Last 10 interactions
        performanceSnapshot: {
          ...this.performanceMetrics,
        },
      };

      // Save to DataHandler if available
      if (this.dataHandler) {
        await this.dataHandler.saveData(
          `step_analytics_${this.instanceUuid}_${Date.now()}`,
          stepData,
        );

        // Also update progress tracking
        const progressData = {
          currentTutorial: this.currentTutorial,
          currentStep: this.currentStep,
          lastUpdated: Date.now(),
          sessionId: this.instanceUuid,
        };
        await this.dataHandler.saveData("onboarding_progress", progressData);
      }

      // Update journey tracking
      this.userJourney.steps.push({
        stepId: step.id,
        tutorial: this.currentTutorial,
        stepIndex: this.currentStep,
        startTime: Date.now(),
      });

      this.lastStepStartTime = Date.now();
    } catch (error) {
      logger.warn("OnboardingTour", "Error tracking step analytics", error);
    }
  }

  /**
   * Scroll to hero demo section and start Tutorial 2
   */
  scrollToHeroDemoAndStart() {
    logger.info("OnboardingTour", "scrollToHeroDemoAndStart called", {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
      isActive: this.isActive,
    });

    const heroChart = document.getElementById("hero-ethics-chart");
    if (heroChart) {
      logger.info(
        "OnboardingTour",
        "Hero chart found, scrolling to hero demo for Tutorial 2",
        {
          heroChartRect: heroChart.getBoundingClientRect(),
        },
      );

      // Scroll to the hero demo section
      heroChart.scrollIntoView({
        behavior: "smooth",
        block: "center",
        inline: "center",
      });

      // Wait for scroll animation to complete, then start the tutorial
      setTimeout(() => {
        logger.info(
          "OnboardingTour",
          "Scroll animation complete, ensuring overlay exists before showing step",
          {
            currentTutorial: this.currentTutorial,
            currentStep: this.currentStep,
            isActive: this.isActive,
            overlayExists: !!this.overlay,
            coachMarkExists: !!this.coachMark,
          },
        );

        // Ensure overlay exists before showing step
        if (
          !this.overlay ||
          !this.coachMark ||
          !document.body.contains(this.coachMark)
        ) {
          logger.warn(
            "OnboardingTour",
            "Overlay missing before Tutorial 2, recreating",
          );
          this.createOverlay();
        }

        // Reset all flags to ensure clean state for Tutorial 2
        this.isProcessingAction = false;
        this.isTransitioning = false;
        this.isTransitioningTutorial = false;

        // Additional cleanup for Tutorial 2 - remove any stale event listeners
        this.cleanupStaleEventListeners();

        // Force recreation of overlay elements to ensure clean state
        this.removeOverlay();
        this.createOverlay();

        logger.info("OnboardingTour", "All flags reset for Tutorial 2 start", {
          isProcessingAction: this.isProcessingAction,
          isTransitioning: this.isTransitioning,
          isTransitioningTutorial: this.isTransitioningTutorial,
        });

        this.showStep();
      }, this.SCROLL_DURATION);
    } else {
      logger.warn(
        "OnboardingTour",
        "Hero chart element not found, starting Tutorial 2 anyway",
      );

      // Ensure overlay exists even if hero chart not found
      if (
        !this.overlay ||
        !this.coachMark ||
        !document.body.contains(this.coachMark)
      ) {
        logger.warn(
          "OnboardingTour",
          "Overlay missing before Tutorial 2 (no hero chart), recreating",
        );
        this.createOverlay();
      }

      // Reset all flags to ensure clean state for Tutorial 2
      this.isProcessingAction = false;
      this.isTransitioning = false;
      this.isTransitioningTutorial = false;

      // Additional cleanup for Tutorial 2 - remove any stale event listeners
      this.cleanupStaleEventListeners();

      // Force recreation of overlay elements to ensure clean state
      this.removeOverlay();
      this.createOverlay();

      logger.info(
        "OnboardingTour",
        "All flags reset for Tutorial 2 start (no hero chart)",
        {
          isProcessingAction: this.isProcessingAction,
          isTransitioning: this.isTransitioning,
          isTransitioningTutorial: this.isTransitioningTutorial,
        },
      );

      this.showStep();
    }
  }

  announceStep(step) {
    // Create announcement for screen readers
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = `${step.title}. ${step.content}`;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  waitForModalClosure(callback) {
    logger.info("OnboardingTour", "Starting to wait for modal closure");

    const maxWaitTime = 3000; // 3 seconds maximum wait (reduced from 10 seconds)
    const startTime = Date.now();

    const checkModalClosed = () => {
      // Check if we've been waiting too long
      const elapsedTime = Date.now() - startTime;
      if (elapsedTime > maxWaitTime) {
        logger.warn(
          "OnboardingTour",
          "Modal closure wait timed out, proceeding anyway",
          {
            elapsedTime,
            maxWaitTime,
          },
        );
        setTimeout(callback, this.ANIMATION_DURATION);
        return;
      }

      // Check for scenario modal and pre-launch modal specifically
      const scenarioModal = document.querySelector(".scenario-modal");
      const preLaunchModal = document.querySelector(".pre-launch-modal");

      // Also check for any other modals that might be open
      const otherModals = document.querySelectorAll(
        '.modal, [class*="modal"]:not(.scenario-modal):not(.pre-launch-modal)',
      );
      const hasOpenModal = Array.from(otherModals).some((modal) => {
        const style = getComputedStyle(modal);
        const isVisible =
          style.display !== "none" && style.visibility !== "hidden";
        logger.debug("OnboardingTour", "Other modal check", {
          modal: modal.className,
          isVisible,
        });
        return isVisible;
      });

      logger.info("OnboardingTour", "Checking modal status", {
        scenarioModal: !!scenarioModal,
        preLaunchModal: !!preLaunchModal,
        hasOtherOpenModal: hasOpenModal,
        scenarioModalClass: scenarioModal?.className,
        preLaunchModalClass: preLaunchModal?.className,
        elapsedTime,
      });

      if (!scenarioModal && !preLaunchModal && !hasOpenModal) {
        // All modals are closed, wait a bit for animations then proceed
        logger.info(
          "OnboardingTour",
          "All modals closed, proceeding with step after animation delay",
        );
        setTimeout(callback, this.ANIMATION_DURATION);
      } else {
        // Modal still exists, check again
        logger.debug(
          "OnboardingTour",
          `Modal still open, checking again in ${this.MODAL_CHECK_DELAY}ms`,
        );
        setTimeout(checkModalClosed, this.MODAL_CHECK_DELAY);
      }
    };

    checkModalClosed();
  }

  waitForAccordionOpen(callback) {
    const checkAccordionOpen = () => {
      // Check for the option details that are now visible (not display: none)
      const optionDetails = document.querySelector(".option-details");

      if (
        optionDetails &&
        optionDetails.offsetHeight > 0 &&
        getComputedStyle(optionDetails).display !== "none"
      ) {
        // Option details are visible
        callback();
      } else {
        // Still waiting for option details to appear
        setTimeout(checkAccordionOpen, this.CHECK_DELAY);
      }
    };

    // Start checking after a brief delay to allow the click to process
    setTimeout(checkAccordionOpen, this.ACCORDION_CHECK_DELAY);
  }

  /**
   * Clean up stale event listeners that might interfere with tutorial progression
   */
  cleanupStaleEventListeners() {
    logger.info("OnboardingTour", "Cleaning up stale event listeners");

    // Clear any pending timeouts that might interfere
    if (this.contentUpdateTimeout) {
      clearTimeout(this.contentUpdateTimeout);
      this.contentUpdateTimeout = null;
    }

    // Remove any existing click highlights that might have old listeners
    document.querySelectorAll(".onboarding-click-highlight").forEach((el) => {
      el.classList.remove("onboarding-click-highlight");
    });

    // Clear any stored event handler references
    this.currentClickHandler = null;
    this.currentKeyHandler = null;

    // Reset any user states that might be stuck
    this.userStates = {
      "option-selected": false,
      "choice-confirmed": false,
      "modal-opened": false,
    };

    logger.debug("OnboardingTour", "Stale event listeners cleanup complete");
  }

  /**
   * Check if an element is in the viewport
   */
  isElementInViewport(element) {
    if (!element) return false;
    const rect = element.getBoundingClientRect();
    return (
      rect.top >= 0 &&
      rect.left >= 0 &&
      rect.bottom <= window.innerHeight &&
      rect.right <= window.innerWidth
    );
  }

  // Static methods for manual control
  static startManualTour(tutorialNumber = 1) {
    // Remove existing tour if active
    const existingTour = window.onboardingTourInstance;
    if (existingTour && existingTour.isActive) {
      existingTour.endTour();
    }

    // Create new tour instance
    const tour = new OnboardingTour();
    tour.startTour(tutorialNumber);
    window.onboardingTourInstance = tour;
    return tour;
  }

  static resetTour() {
    simpleStorage.remove("tour_completed");
    simpleStorage.remove("has_visited");
    logger.info("OnboardingTour", "Tour progress reset");
  }

  /**
   * Debug method to force start tour from step 1
   */
  debugForceStartFromStep1() {
    logger.warn("OnboardingTour", "🐛 DEBUG: Force starting tour from step 1");

    if (this.isActive) {
      this.finishTour();
    }

    this.currentStep = 0;
    this.currentTutorial = 1;
    this.isActive = false;

    // Reset user states
    this.userStates = {
      "option-selected": false,
      "choice-confirmed": false,
      "modal-opened": false,
    };

    this.startTour(1);
  }

  // Content observer for dynamic content changes (typewriter effects, etc.)
  setupContentObserver(targetElement, step) {
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }

    this.contentObserver = new MutationObserver((mutations) => {
      // Skip updates during transitions to prevent excessive repositioning
      if (this.isTransitioning) {
        return;
      }

      let shouldUpdate = false;

      mutations.forEach((mutation) => {
        if (
          mutation.type === "childList" ||
          mutation.type === "characterData"
        ) {
          shouldUpdate = true;
        }
        // Also check for attribute changes that might affect size
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "style" ||
            mutation.attributeName === "class")
        ) {
          shouldUpdate = true;
        }
      });

      if (shouldUpdate) {
        // Debounce the updates to avoid excessive repositioning
        clearTimeout(this.contentUpdateTimeout);
        this.contentUpdateTimeout = setTimeout(() => {
          if (this.coachMark && targetElement && !this.isTransitioning) {
            logger.debug(
              "OnboardingTour",
              `Updating coach mark position due to content change in step ${step.id}`,
            );
            this.positionCoachMark(targetElement, step.position, step);
            this.positionSpotlight(targetElement);
          }
        }, this.CONTENT_UPDATE_DELAY); // Small delay to batch updates
      }
    });

    this.contentObserver.observe(targetElement, {
      childList: true,
      subtree: true,
      characterData: true,
      attributes: true,
      attributeFilter: ["style", "class"],
    });

    logger.debug(
      "OnboardingTour",
      `Content observer set up for step ${step.id}`,
    );
  }

  // Scroll within modal content instead of main page
  scrollToElementInModal(targetElement, step) {
    const modal = targetElement.closest(
      ".scenario-modal, .scenario-modal-dialog, .modal-dialog",
    );

    if (modal) {
      const modalBody = modal.querySelector(
        ".scenario-content, .modal-body, .modal-content",
      );

      if (modalBody) {
        const elementRect = targetElement.getBoundingClientRect();
        const modalRect = modalBody.getBoundingClientRect();
        const currentScrollTop = modalBody.scrollTop;

        // Calculate target scroll position within modal
        const elementTopInModal =
          elementRect.top - modalRect.top + currentScrollTop;
        const targetScrollTop = Math.max(0, elementTopInModal - 100); // 100px offset from top

        logger.info(
          "OnboardingTour",
          `Scrolling modal to element for step ${step.id}`,
          {
            elementTop: elementRect.top,
            modalTop: modalRect.top,
            currentScroll: currentScrollTop,
            targetScroll: targetScrollTop,
          },
        );

        modalBody.scrollTo({
          top: targetScrollTop,
          behavior: "smooth",
        });

        return true;
      }
    }

    return false; // Not in a modal or modal body not found
  }

  // === ENTERPRISE MONITORING METHODS ===

  /**
   * Initialize enterprise monitoring infrastructure
   * @private
   */
  _initializeEnterpriseMonitoring() {
    try {
      // Set up health check interval
      this.healthCheckInterval = setInterval(() => {
        this._performHealthCheck();
      }, ENTERPRISE_CONSTANTS.HEALTH_CHECK_INTERVAL);

      // Set up telemetry flush interval
      this.telemetryFlushInterval = setInterval(() => {
        this._flushTelemetryBatch();
      }, ENTERPRISE_CONSTANTS.TELEMETRY_FLUSH_INTERVAL);

      // Set up heartbeat interval
      this.heartbeatInterval = setInterval(() => {
        this._sendHeartbeat();
      }, ENTERPRISE_CONSTANTS.HEARTBEAT_INTERVAL);

      // Initialize user engagement tracking
      this._initializeEngagementTracking();

      logger.info("OnboardingTour", "🏢 Enterprise monitoring initialized", {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        healthCheckInterval: ENTERPRISE_CONSTANTS.HEALTH_CHECK_INTERVAL,
        telemetryFlushInterval: ENTERPRISE_CONSTANTS.TELEMETRY_FLUSH_INTERVAL,
        heartbeatInterval: ENTERPRISE_CONSTANTS.HEARTBEAT_INTERVAL,
      });
    } catch (error) {
      this._handleError(error, "_initializeEnterpriseMonitoring");
    }
  }

  /**
   * Initialize user engagement tracking
   * @private
   */
  _initializeEngagementTracking() {
    try {
      // Track mouse movements
      document.addEventListener(
        "mousemove",
        (event) => this._onMouseMovement(event),
        { passive: true },
      );

      // Track clicks
      document.addEventListener("click", (event) => this._onUserClick(event), {
        passive: true,
      });

      // Track scrolling
      document.addEventListener(
        "scroll",
        (event) => this._onUserScroll(event),
        { passive: true },
      );

      // Track keystrokes
      document.addEventListener(
        "keydown",
        (event) => this._onUserKeydown(event),
        { passive: true },
      );

      // Set up engagement metrics update interval
      this.engagementTrackingInterval = setInterval(() => {
        this._updateEngagementMetrics();
      }, ENTERPRISE_CONSTANTS.ENGAGEMENT_UPDATE_INTERVAL);

      logger.debug("OnboardingTour", "User engagement tracking initialized", {
        instanceId: this.instanceId,
      });
    } catch (error) {
      this._handleError(error, "_initializeEngagementTracking");
    }
  }

  /**
   * Get device information for analytics
   * @private
   * @returns {Object} Device information
   */
  _getDeviceInfo() {
    try {
      return {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        viewportSize: `${window.innerWidth}x${window.innerHeight}`,
        pixelRatio: window.devicePixelRatio || 1,
        touchSupport: "ontouchstart" in window || navigator.maxTouchPoints > 0,
        connectionType: navigator.connection
          ? navigator.connection.effectiveType
          : "unknown",
        memoryInfo: navigator.deviceMemory
          ? `${navigator.deviceMemory}GB`
          : "unknown",
        hardwareConcurrency: navigator.hardwareConcurrency || "unknown",
        doNotTrack: navigator.doNotTrack === "1",
        storageQuota: "unknown", // Will be updated asynchronously if possible
      };
    } catch (error) {
      this._handleError(error, "_getDeviceInfo");
      return {
        userAgent: "unknown",
        platform: "unknown",
        error: error.message,
      };
    }
  }

  /**
   * Enterprise error handling with circuit breaker pattern
   * @private
   * @param {Error} error - The error that occurred
   * @param {string} context - Context where the error occurred
   */
  _handleError(error, context) {
    try {
      this.errorCount++;
      this.lastError = {
        message: error.message,
        stack: error.stack,
        context,
        timestamp: Date.now(),
      };

      // Update circuit breaker
      this.circuitBreaker.failureCount++;
      this.circuitBreaker.lastFailureTime = Date.now();

      // Log error with appropriate level based on frequency
      const logLevel =
        this.errorCount > ENTERPRISE_CONSTANTS.ERROR_THRESHOLD
          ? "error"
          : "warn";

      logger[logLevel]("OnboardingTour", `Enterprise error in ${context}`, {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        error: error.message,
        errorCount: this.errorCount,
        circuitBreakerState: this.circuitBreaker.state,
        context,
      });

      // Update performance metrics
      this.performanceMetrics.errorRate =
        (this.errorCount /
          Math.max(1, this.performanceMetrics.tourStartCount || 1)) *
        100;

      // Circuit breaker logic
      if (
        this.circuitBreaker.failureCount >=
        ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER_THRESHOLD
      ) {
        this.circuitBreaker.state = "open";
        this.circuitBreaker.nextAttemptTime =
          Date.now() + ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER_TIMEOUT;

        logger.error(
          "OnboardingTour",
          "🔴 Circuit breaker opened - entering failsafe mode",
          {
            instanceId: this.instanceId,
            failureCount: this.circuitBreaker.failureCount,
            threshold: ENTERPRISE_CONSTANTS.CIRCUIT_BREAKER_THRESHOLD,
          },
        );

        this._enterFailsafeMode();
      }

      // Log telemetry for error
      this._logTelemetry("error_occurred", {
        error: error.message,
        context,
        errorCount: this.errorCount,
        circuitBreakerState: this.circuitBreaker.state,
      });

      // Attempt recovery if not in failsafe mode
      if (this.circuitBreaker.state !== "open") {
        this._attemptRecovery(context);
      }
    } catch (handleError) {
      // Fallback error handling to prevent infinite loops
      console.error("OnboardingTour: Error in error handler", handleError);
    }
  }

  /**
   * Record performance metrics for enterprise monitoring
   * @private
   * @param {string} operation - Operation being measured
   * @param {number} duration - Duration in milliseconds
   */
  _recordPerformanceMetric(operation, duration) {
    try {
      const metrics = this.performanceMetrics;

      switch (operation) {
        case "constructor":
          // Constructor timing is recorded but not aggregated
          break;

        case "tour_start":
          metrics.tourStartCount++;
          metrics.lastTourStartTime = Date.now();
          break;

        case "tour_complete":
          metrics.tourCompletionCount++;
          metrics.totalTourTime += duration;
          metrics.averageTourTime =
            metrics.totalTourTime / metrics.tourCompletionCount;
          metrics.completionRate =
            (metrics.tourCompletionCount /
              Math.max(1, metrics.tourStartCount)) *
            100;
          break;

        case "tour_abandon":
          metrics.tourAbandonmentCount++;
          metrics.abandonmentRate =
            (metrics.tourAbandonmentCount /
              Math.max(1, metrics.tourStartCount)) *
            100;
          break;

        case "step_transition":
          metrics.stepTransitionCount++;
          metrics.totalStepTransitionTime += duration;
          metrics.averageStepTransitionTime =
            metrics.totalStepTransitionTime / metrics.stepTransitionCount;
          metrics.lastStepTransitionTime = Date.now();
          break;

        case "scroll_operation":
          metrics.scrollOperationCount++;
          metrics.totalScrollTime += duration;
          metrics.averageScrollTime =
            metrics.totalScrollTime / metrics.scrollOperationCount;
          break;

        case "element_wait":
          metrics.elementWaitCount++;
          metrics.totalElementWaitTime += duration;
          metrics.averageElementWaitTime =
            metrics.totalElementWaitTime / metrics.elementWaitCount;
          break;

        case "user_interaction":
          metrics.userInteractionCount++;
          metrics.totalUserWaitTime += duration;
          metrics.averageUserWaitTime =
            metrics.totalUserWaitTime / metrics.userInteractionCount;
          break;

        default:
          logger.debug(
            "OnboardingTour",
            `Unknown performance metric operation: ${operation}`,
          );
      }

      // Update memory usage if available
      if (performance.memory) {
        metrics.memoryUsage =
          Math.round((performance.memory.usedJSHeapSize / 1024 / 1024) * 100) /
          100; // MB
      }

      logger.debug(
        "OnboardingTour",
        `Performance metric recorded: ${operation}`,
        {
          operation,
          duration: Math.round(duration * 100) / 100,
          instanceId: this.instanceId,
        },
      );
    } catch (error) {
      this._handleError(error, "_recordPerformanceMetric");
    }
  }

  /**
   * Log telemetry data for enterprise analytics
   * @private
   * @param {string} event - Event name
   * @param {Object} data - Event data
   */
  _logTelemetry(event, data = {}) {
    try {
      const telemetryEntry = {
        timestamp: Date.now(),
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        event,
        data: {
          ...data,
          currentStep: this.currentStep,
          currentTutorial: this.currentTutorial,
          isActive: this.isActive,
          sessionId: this.userJourney.sessionId,
        },
      };

      // Add to buffer
      this.telemetryBuffer.push(telemetryEntry);

      // Also add to batch for enterprise processing
      this.telemetryBatch.push(telemetryEntry);

      // Auto-flush if buffer is getting large
      if (
        this.telemetryBuffer.length >=
        ENTERPRISE_CONSTANTS.TELEMETRY_BUFFER_SIZE
      ) {
        this._flushTelemetryBatch();
      }

      logger.debug("OnboardingTour", `Telemetry logged: ${event}`, {
        event,
        bufferSize: this.telemetryBuffer.length,
        batchSize: this.telemetryBatch.length,
        instanceId: this.instanceId,
      });
    } catch (error) {
      this._handleError(error, "_logTelemetry");
    }
  }

  /**
   * Flush telemetry batch to enterprise systems
   * @private
   */
  _flushTelemetryBatch() {
    try {
      if (this.telemetryBatch.length === 0) {
        return;
      }

      const batchToFlush = [...this.telemetryBatch];
      this.telemetryBatch = [];
      this.lastTelemetryFlush = Date.now();

      // In a real enterprise environment, this would send to your analytics service
      // For now, we'll use the existing analytics system
      if (
        window.simpleAnalytics &&
        typeof window.simpleAnalytics.trackEvent === "function"
      ) {
        batchToFlush.forEach((entry) => {
          window.simpleAnalytics.trackEvent(`onboarding_${entry.event}`, {
            instanceId: entry.instanceId,
            ...entry.data,
          });
        });
      }

      logger.info(
        "OnboardingTour",
        `Telemetry batch flushed: ${batchToFlush.length} entries`,
        {
          batchSize: batchToFlush.length,
          instanceId: this.instanceId,
          lastFlush: this.lastTelemetryFlush,
        },
      );
    } catch (error) {
      this._handleError(error, "_flushTelemetryBatch");
    }
  }

  /**
   * Perform health check for enterprise monitoring
   * @private
   */
  _performHealthCheck() {
    try {
      const now = Date.now();
      const uptime = now - this.createdAt;
      const timeSinceLastError = this.lastError
        ? now - this.lastError.timestamp
        : uptime;

      // Health score calculation (0-100)
      let healthScore = 100;

      // Reduce score based on error rate
      if (this.performanceMetrics.errorRate > 0) {
        healthScore -= Math.min(50, this.performanceMetrics.errorRate * 10);
      }

      // Reduce score based on memory usage if available
      if (this.performanceMetrics.memoryUsage > 100) {
        // MB
        healthScore -= Math.min(
          20,
          (this.performanceMetrics.memoryUsage - 100) / 10,
        );
      }

      // Reduce score if circuit breaker is open
      if (this.circuitBreaker.state === "open") {
        healthScore -= 30;
      }

      // Update health status
      this.isHealthy = healthScore >= ENTERPRISE_CONSTANTS.HEALTH_THRESHOLD;
      this.lastHealthCheck = now;

      // Log health status
      const logLevel = this.isHealthy ? "debug" : "warn";
      logger[logLevel]("OnboardingTour", `Health check completed`, {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        healthScore: Math.round(healthScore),
        isHealthy: this.isHealthy,
        uptime: Math.round(uptime / 1000), // seconds
        errorCount: this.errorCount,
        timeSinceLastError: Math.round(timeSinceLastError / 1000),
        circuitBreakerState: this.circuitBreaker.state,
        memoryUsage: this.performanceMetrics.memoryUsage,
      });

      // Log telemetry
      this._logTelemetry("health_check", {
        healthScore: Math.round(healthScore),
        isHealthy: this.isHealthy,
        uptime,
        errorCount: this.errorCount,
        circuitBreakerState: this.circuitBreaker.state,
      });
    } catch (error) {
      this._handleError(error, "_performHealthCheck");
    }
  }

  /**
   * Send heartbeat for enterprise monitoring
   * @private
   */
  _sendHeartbeat() {
    try {
      const heartbeatData = {
        instanceId: this.instanceId,
        instanceUuid: this.instanceUuid,
        timestamp: Date.now(),
        isActive: this.isActive,
        isHealthy: this.isHealthy,
        currentStep: this.currentStep,
        currentTutorial: this.currentTutorial,
        uptime: Date.now() - this.createdAt,
        errorCount: this.errorCount,
        circuitBreakerState: this.circuitBreaker.state,
      };

      this._logTelemetry("heartbeat", heartbeatData);

      logger.debug("OnboardingTour", "Heartbeat sent", {
        instanceId: this.instanceId,
        isHealthy: this.isHealthy,
      });
    } catch (error) {
      this._handleError(error, "_sendHeartbeat");
    }
  }

  /**
   * Handle mouse movement for engagement tracking
   * @private
   * @param {MouseEvent} _event - Mouse event
   */
  _onMouseMovement(_event) {
    if (this.isActive) {
      this.userJourney.engagement.mouseMovements++;
    }
  }

  /**
   * Handle user clicks for engagement tracking
   * @private
   * @param {MouseEvent} event - Click event
   */
  _onUserClick(event) {
    if (this.isActive) {
      this.userJourney.engagement.clicks++;

      // Track interaction details
      this.userJourney.interactions.push({
        type: "click",
        timestamp: Date.now(),
        target: event.target.tagName,
        className: event.target.className,
        step: this.currentStep,
        tutorial: this.currentTutorial,
      });
    }
  }

  /**
   * Handle user scrolling for engagement tracking
   * @private
   * @param {Event} _event - Scroll event
   */
  _onUserScroll(_event) {
    if (this.isActive) {
      this.userJourney.engagement.scrolls++;
    }
  }

  /**
   * Handle user keystrokes for engagement tracking
   * @private
   * @param {KeyboardEvent} _event - Keyboard event
   */
  _onUserKeydown(_event) {
    if (this.isActive) {
      this.userJourney.engagement.keystrokes++;
    }
  }

  /**
   * Update engagement metrics calculations
   * @private
   */
  _updateEngagementMetrics() {
    try {
      if (!this.isActive) return;

      const currentStep = `${this.currentTutorial}-${this.currentStep}`;
      const now = Date.now();

      // Track time on current step
      if (!this.userJourney.engagement.timeOnStep[currentStep]) {
        this.userJourney.engagement.timeOnStep[currentStep] = {
          startTime: now,
          totalTime: 0,
          visits: 1,
        };
      } else {
        const stepData = this.userJourney.engagement.timeOnStep[currentStep];
        stepData.totalTime = now - stepData.startTime;
      }

      // Check for hesitation points (user staying on step longer than expected)
      const stepData = this.userJourney.engagement.timeOnStep[currentStep];
      if (
        stepData &&
        stepData.totalTime > ENTERPRISE_CONSTANTS.HESITATION_THRESHOLD
      ) {
        const existingHesitation =
          this.userJourney.engagement.hesitationPoints.find(
            (h) => h.step === currentStep,
          );

        if (!existingHesitation) {
          this.userJourney.engagement.hesitationPoints.push({
            step: currentStep,
            timestamp: now,
            duration: stepData.totalTime,
            tutorial: this.currentTutorial,
            stepIndex: this.currentStep,
          });

          logger.info("OnboardingTour", "Hesitation point detected", {
            step: currentStep,
            duration: Math.round(stepData.totalTime / 1000), // seconds
            instanceId: this.instanceId,
          });

          this._logTelemetry("hesitation_detected", {
            step: currentStep,
            duration: stepData.totalTime,
            tutorial: this.currentTutorial,
            stepIndex: this.currentStep,
          });
        }
      }
    } catch (error) {
      this._handleError(error, "_updateEngagementMetrics");
    }
  }

  /**
   * Attempt recovery from errors
   * @private
   * @param {string} context - Context where recovery is needed
   */
  _attemptRecovery(context) {
    try {
      this.recoveryAttempts++;

      logger.info("OnboardingTour", `Attempting recovery from ${context}`, {
        instanceId: this.instanceId,
        recoveryAttempts: this.recoveryAttempts,
        context,
      });

      // Recovery strategies based on context
      switch (context) {
        case "constructor":
          // Reinitialize core properties
          this.isActive = false;
          this.currentStep = 0;
          this.currentTutorial = 1;
          break;

        case "showStep":
          // Try to recreate overlay elements
          this.removeOverlay();
          setTimeout(() => {
            if (this.isActive) {
              this.createOverlay();
            }
          }, 1000);
          break;

        case "_initializeEnterpriseMonitoring":
          // Clear intervals and reinitialize
          if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
          if (this.telemetryFlushInterval)
            clearInterval(this.telemetryFlushInterval);
          if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);
          if (this.engagementTrackingInterval)
            clearInterval(this.engagementTrackingInterval);

          setTimeout(() => {
            this._initializeEnterpriseMonitoring();
          }, 2000);
          break;

        case "positionCoachMark":
          // Reset coach mark positioning
          if (this.coachMark) {
            this.coachMark.style.position = "fixed";
            this.coachMark.style.left = "50%";
            this.coachMark.style.top = "50%";
            this.coachMark.style.transform = "translate(-50%, -50%)";
          }
          break;

        default:
          // Generic recovery: reset transition flags
          this.isTransitioning = false;
          this.isProcessingAction = false;
      }

      // Update circuit breaker on successful recovery
      if (this.recoveryAttempts <= ENTERPRISE_CONSTANTS.MAX_RECOVERY_ATTEMPTS) {
        this.circuitBreaker.successCount++;

        // Reset circuit breaker if we have enough successes
        if (this.circuitBreaker.successCount >= 3) {
          this.circuitBreaker.state = "closed";
          this.circuitBreaker.failureCount = 0;
          this.circuitBreaker.successCount = 0;

          logger.info(
            "OnboardingTour",
            "Circuit breaker reset after successful recovery",
            {
              instanceId: this.instanceId,
              recoveryAttempts: this.recoveryAttempts,
            },
          );
        }
      }

      this._logTelemetry("recovery_attempted", {
        context,
        recoveryAttempts: this.recoveryAttempts,
        circuitBreakerState: this.circuitBreaker.state,
      });
    } catch (error) {
      logger.error("OnboardingTour", "Recovery attempt failed", {
        context,
        error: error.message,
        instanceId: this.instanceId,
      });
    }
  }

  /**
   * Enter failsafe mode when circuit breaker opens
   * @private
   */
  _enterFailsafeMode() {
    try {
      logger.warn("OnboardingTour", "🚨 Entering failsafe mode", {
        instanceId: this.instanceId,
        errorCount: this.errorCount,
        failureCount: this.circuitBreaker.failureCount,
      });

      // Disable active tour
      this.isActive = false;

      // Clean up UI elements safely
      try {
        this.removeOverlay();
      } catch (cleanupError) {
        logger.error(
          "OnboardingTour",
          "Error during failsafe cleanup",
          cleanupError,
        );
      }

      // Clear all intervals to prevent further errors
      if (this.healthCheckInterval) {
        clearInterval(this.healthCheckInterval);
        this.healthCheckInterval = null;
      }
      if (this.telemetryFlushInterval) {
        clearInterval(this.telemetryFlushInterval);
        this.telemetryFlushInterval = null;
      }
      if (this.heartbeatInterval) {
        clearInterval(this.heartbeatInterval);
        this.heartbeatInterval = null;
      }
      if (this.engagementTrackingInterval) {
        clearInterval(this.engagementTrackingInterval);
        this.engagementTrackingInterval = null;
      }

      // Mark as unhealthy
      this.isHealthy = false;

      // Final telemetry before going silent
      this._logTelemetry("failsafe_mode_entered", {
        errorCount: this.errorCount,
        failureCount: this.circuitBreaker.failureCount,
        uptime: Date.now() - this.createdAt,
      });

      // Flush any remaining telemetry
      this._flushTelemetryBatch();
    } catch (error) {
      // Last resort error handling
      console.error("OnboardingTour: Critical error in failsafe mode", error);
    }
  }

  // === STATIC ENTERPRISE METHODS ===

  /**
   * Get all OnboardingTour instances for enterprise monitoring
   * @static
   * @returns {Set} Set of all OnboardingTour instances
   */
  static getAllInstances() {
    return OnboardingTour._instances || new Set();
  }

  /**
   * Generate enterprise health report for all instances
   * @static
   * @returns {Object} Comprehensive health report
   */
  static getEnterpriseHealthReport() {
    const instances = OnboardingTour.getAllInstances();
    const report = {
      timestamp: Date.now(),
      totalInstances: instances.size,
      healthyInstances: 0,
      unhealthyInstances: 0,
      activeInstances: 0,
      totalErrors: 0,
      averageUptime: 0,
      circuitBreakerStatus: {
        closed: 0,
        open: 0,
        halfOpen: 0,
      },
      performanceMetrics: {
        totalTourStarts: 0,
        totalTourCompletions: 0,
        averageCompletionRate: 0,
        averageAbandonmentRate: 0,
        totalEngagementPoints: 0,
      },
      memoryUsage: {
        total: 0,
        average: 0,
        peak: 0,
      },
      instances: [],
    };

    let totalUptime = 0;
    let totalCompletionRates = 0;
    let totalAbandonmentRates = 0;
    let validMetricsCount = 0;

    instances.forEach((instance) => {
      try {
        const instanceReport = {
          instanceId: instance.instanceId,
          instanceUuid: instance.instanceUuid,
          isHealthy: instance.isHealthy,
          isActive: instance.isActive,
          errorCount: instance.errorCount,
          uptime: Date.now() - instance.createdAt,
          circuitBreakerState: instance.circuitBreaker.state,
          performanceMetrics: { ...instance.performanceMetrics },
          lastHealthCheck: instance.lastHealthCheck,
          recoveryAttempts: instance.recoveryAttempts,
        };

        report.instances.push(instanceReport);

        // Aggregate data
        if (instance.isHealthy) report.healthyInstances++;
        else report.unhealthyInstances++;

        if (instance.isActive) report.activeInstances++;

        report.totalErrors += instance.errorCount;
        totalUptime += instanceReport.uptime;

        // Circuit breaker status
        report.circuitBreakerStatus[instance.circuitBreaker.state]++;

        // Performance metrics
        const metrics = instance.performanceMetrics;
        report.performanceMetrics.totalTourStarts +=
          metrics.tourStartCount || 0;
        report.performanceMetrics.totalTourCompletions +=
          metrics.tourCompletionCount || 0;

        if (metrics.completionRate >= 0) {
          totalCompletionRates += metrics.completionRate;
          validMetricsCount++;
        }

        if (metrics.abandonmentRate >= 0) {
          totalAbandonmentRates += metrics.abandonmentRate;
        }

        // Engagement metrics
        const engagement = instance.userJourney?.engagement;
        if (engagement) {
          report.performanceMetrics.totalEngagementPoints +=
            (engagement.clicks || 0) +
            (engagement.scrolls || 0) +
            (engagement.keystrokes || 0);
        }

        // Memory usage
        if (metrics.memoryUsage > 0) {
          report.memoryUsage.total += metrics.memoryUsage;
          report.memoryUsage.peak = Math.max(
            report.memoryUsage.peak,
            metrics.memoryUsage,
          );
        }
      } catch (error) {
        logger.error("OnboardingTour", "Error generating instance report", {
          instanceId: instance.instanceId,
          error: error.message,
        });
      }
    });

    // Calculate averages
    if (instances.size > 0) {
      report.averageUptime = Math.round(totalUptime / instances.size);
      report.memoryUsage.average =
        Math.round((report.memoryUsage.total / instances.size) * 100) / 100;
    }

    if (validMetricsCount > 0) {
      report.performanceMetrics.averageCompletionRate =
        Math.round((totalCompletionRates / validMetricsCount) * 100) / 100;
      report.performanceMetrics.averageAbandonmentRate =
        Math.round((totalAbandonmentRates / validMetricsCount) * 100) / 100;
    }

    logger.info("OnboardingTour", "📊 Enterprise health report generated", {
      totalInstances: report.totalInstances,
      healthyInstances: report.healthyInstances,
      activeInstances: report.activeInstances,
      totalErrors: report.totalErrors,
    });

    return report;
  }

  /**
   * Debug enterprise status for instance
   * @returns {Object} Debug information
   */
  debugEnterpriseStatus() {
    return {
      instanceUuid: this.instanceUuid,
      instanceId: this.instanceId,
      isHealthy: this.isHealthy,
      errorCount: this.errorCount,
      lastError: this.lastError,
      circuitBreaker: this.circuitBreaker,
      performanceMetrics: this.performanceMetrics,
      userJourney: {
        sessionId: this.userJourney.sessionId,
        startTime: this.userJourney.startTime,
        stepCount: this.userJourney.steps.length,
        interactionCount: this.userJourney.interactions.length,
        engagement: this.userJourney.engagement,
      },
      isActive: this.isActive,
      currentStep: this.currentStep,
      currentTutorial: this.currentTutorial,
      uptime: Date.now() - this.createdAt,
      telemetryBufferSize: this.telemetryBuffer.length,
      lastHealthCheck: this.lastHealthCheck,
      lastTelemetryFlush: this.lastTelemetryFlush,
    };
  }

  // === ENHANCED ELEMENT FINDING AND POSITIONING METHODS ===

  /**
   * Find target element with robust fallback handling
   * @param {Object} step - Step configuration with fallback selectors
   * @returns {Element|null} Found element or null
   */
  async findTargetElementWithFallbacks(step) {
    if (!step.target) return null;

    // Try primary selector first
    let targetElement = document.querySelector(step.target);
    if (targetElement) {
      logger.debug("OnboardingTour", `Primary selector found: ${step.target}`, {
        stepId: step.id,
      });
      return targetElement;
    }

    // Try fallback selectors if available
    if (step.fallbackSelectors && step.fallbackSelectors.length > 0) {
      logger.info(
        "OnboardingTour",
        `Primary selector failed, trying ${step.fallbackSelectors.length} fallback selectors`,
        {
          stepId: step.id,
          primarySelector: step.target,
          fallbackSelectors: step.fallbackSelectors,
        },
      );

      for (const selector of step.fallbackSelectors) {
        targetElement = document.querySelector(selector);
        if (targetElement) {
          logger.info(
            "OnboardingTour",
            `Fallback selector found: ${selector}`,
            {
              stepId: step.id,
              fallbackSelector: selector,
            },
          );
          return targetElement;
        }
      }
    }

    return null;
  }

  /**
   * Wait for element with configurable timeout and enhanced retry logic
   * @param {Object} step - Step configuration
   * @returns {Element|null} Found element or null
   */
  async waitForElementWithTimeout(step) {
    const timeout = step.elementTimeout || 8000; // Default 8 seconds
    const checkInterval = 100; // Check every 100ms
    const maxAttempts = Math.floor(timeout / checkInterval);

    logger.info(
      "OnboardingTour",
      `Enhanced element waiting started for: ${step.target}`,
      {
        stepId: step.id,
        timeout,
        maxAttempts,
        hasFallbacks: !!step.fallbackSelectors?.length,
      },
    );

    for (let attempts = 0; attempts < maxAttempts; attempts++) {
      // Try primary selector
      let targetElement = document.querySelector(step.target);
      if (targetElement) {
        logger.info(
          "OnboardingTour",
          `Element found after ${attempts * checkInterval}ms`,
          {
            stepId: step.id,
            selector: step.target,
            elapsedTime: attempts * checkInterval,
          },
        );
        return targetElement;
      }

      // Try fallback selectors on every 5th attempt
      if (attempts % 5 === 0 && step.fallbackSelectors) {
        for (const selector of step.fallbackSelectors) {
          targetElement = document.querySelector(selector);
          if (targetElement) {
            logger.info(
              "OnboardingTour",
              `Fallback element found after ${attempts * checkInterval}ms`,
              {
                stepId: step.id,
                fallbackSelector: selector,
                elapsedTime: attempts * checkInterval,
              },
            );
            return targetElement;
          }
        }
      }

      // Wait before next attempt
      await new Promise((resolve) => setTimeout(resolve, checkInterval));
    }

    logger.warn(
      "OnboardingTour",
      `Element waiting timeout after ${timeout}ms`,
      {
        stepId: step.id,
        selector: step.target,
        fallbackSelectors: step.fallbackSelectors,
        timeout,
      },
    );

    return null;
  }

  /**
   * Perform enhanced auto-scroll with responsive awareness
   * @param {Element} targetElement - Element to scroll to
   * @param {Object} step - Step configuration
   */
  async performEnhancedAutoScroll(targetElement, step) {
    if (!targetElement) return;

    const rect = targetElement.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const isMobile = viewportWidth <= this.MOBILE_BREAKPOINT;

    // Get responsive configuration
    const responsiveConfig = step.responsiveConfig || {};
    const currentConfig = isMobile
      ? responsiveConfig.mobile
      : viewportWidth <= 1024
        ? responsiveConfig.tablet
        : responsiveConfig.desktop;

    const scrollPadding = currentConfig?.spacing || 20;

    // Check if element is already optimally positioned
    const isOptimallyPositioned =
      rect.top >= scrollPadding &&
      rect.bottom <= viewportHeight - scrollPadding &&
      rect.left >= 0 &&
      rect.right <= viewportWidth;

    if (isOptimallyPositioned) {
      logger.debug(
        "OnboardingTour",
        "Element already optimally positioned, skipping scroll",
        {
          stepId: step.id,
          elementRect: { top: rect.top, bottom: rect.bottom },
          viewport: { width: viewportWidth, height: viewportHeight },
        },
      );
      return;
    }

    logger.info("OnboardingTour", `Enhanced auto-scroll for step ${step.id}`, {
      stepId: step.id,
      isMobile,
      scrollPadding,
      currentConfig,
      elementRect: {
        top: rect.top,
        bottom: rect.bottom,
        left: rect.left,
        right: rect.right,
      },
    });

    // Special handling for modal content
    if (step.modalSpecific?.waitForModalContent) {
      const modalScrolled = this.scrollToElementInModal(targetElement, step);
      if (modalScrolled) {
        await new Promise((resolve) =>
          setTimeout(resolve, this.SCROLL_DURATION),
        );
        return;
      }
    }

    // Standard enhanced scrolling
    const scrollOptions = {
      behavior: "smooth",
      block: isMobile ? "start" : "center",
      inline: "center",
    };

    targetElement.scrollIntoView(scrollOptions);

    // Wait for scroll animation
    await new Promise((resolve) => setTimeout(resolve, this.SCROLL_DURATION));

    logger.debug("OnboardingTour", "Enhanced auto-scroll completed", {
      stepId: step.id,
      scrollOptions,
    });
  }

  /**
   * Enhanced positioning with responsive dimension handling
   * @param {Element} targetElement - Target element
   * @param {Object} step - Step configuration
   * @param {string} position - Position preference
   * @param {number} retryCount - Current retry count
   */
  async performEnhancedPositioning(
    targetElement,
    step,
    position,
    retryCount = 0,
  ) {
    const maxRetries = step.maxRetries || 3;

    if (retryCount > maxRetries) {
      logger.warn(
        "OnboardingTour",
        `Max positioning retries reached for step ${step.id}`,
        {
          stepId: step.id,
          maxRetries,
          retryCount,
        },
      );
      return this.applyFallbackPositioning(step);
    }

    const isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT;
    const responsiveConfig = step.responsiveConfig || {};
    const currentConfig = isMobile
      ? responsiveConfig.mobile
      : window.innerWidth <= 1024
        ? responsiveConfig.tablet
        : responsiveConfig.desktop;

    // Use responsive position override if available
    const effectivePosition =
      currentConfig?.position || position || step.fallbackPosition || "center";

    logger.debug(
      "OnboardingTour",
      `Enhanced positioning attempt ${retryCount + 1}/${maxRetries + 1}`,
      {
        stepId: step.id,
        targetSelector: step.target,
        effectivePosition,
        isMobile,
        currentConfig,
        retryCount,
      },
    );

    // Delegate to existing positioning logic with enhancements
    this.positionCoachMark(targetElement, effectivePosition, step, retryCount);
  }

  /**
   * Apply fallback positioning when primary positioning fails
   * @param {Object} step - Step configuration
   */
  applyFallbackPositioning(step) {
    const fallbackPosition = step.fallbackPosition || "center";
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const isMobile = viewportWidth <= this.MOBILE_BREAKPOINT;

    const dimensionConfig = step.dimensionHandling || {};
    const width = dimensionConfig.minWidth || 320;
    const height = dimensionConfig.minHeight || 200;

    const left = Math.max(20, (viewportWidth - width) / 2);
    const top = Math.max(20, (viewportHeight - height) / 2);

    logger.info(
      "OnboardingTour",
      `Applying fallback positioning for step ${step.id}`,
      {
        stepId: step.id,
        fallbackPosition,
        calculatedPosition: { left, top },
        dimensions: { width, height },
        isMobile,
      },
    );

    if (this.coachMark) {
      const fallbackStyles = {
        left: `${left}px`,
        top: `${top}px`,
        position: "fixed",
        zIndex: "10014",
        pointerEvents: "auto",
        display: "block",
      };

      // Apply responsive width if configured
      if (isMobile && step.responsiveConfig?.mobile?.maxWidth) {
        fallbackStyles.maxWidth = step.responsiveConfig.mobile.maxWidth;
      }

      Object.assign(this.coachMark.style, fallbackStyles);

      // Remove opacity override to let CSS animations handle visibility
      requestAnimationFrame(() => {
        if (this.coachMark) {
          this.coachMark.style.opacity = "";
        }
      });
    }
  }
}

// Export for use in other modules
export default OnboardingTour;

// Make available globally for debugging and manual control
window.OnboardingTour = OnboardingTour;

// Debug helper function
window.debugStartTour = function () {
  if (window.onboardingTourInstance) {
    window.onboardingTourInstance.debugForceStartFromStep1();
  } else {
    logger.warn(
      "OnboardingTour",
      "No onboarding tour instance available. Please initialize through app.js first.",
    );
    logger.warn(
      "OnboardingTour",
      "⚠️ Cannot create OnboardingTour instance directly - must be initialized through app.js to prevent multiple instances",
    );
  }
};

window.debugShowTourState = function () {
  if (window.onboardingTourInstance) {
    logger.info("OnboardingTour", "Tour State:", {
      instanceId: window.onboardingTourInstance.instanceId,
      isActive: window.onboardingTourInstance.isActive,
      currentTutorial: window.onboardingTourInstance.currentTutorial,
      currentStep: window.onboardingTourInstance.currentStep,
      userStates: window.onboardingTourInstance.userStates,
    });
  } else {
    logger.warn("OnboardingTour", "No onboarding tour instance available");
  }
};
