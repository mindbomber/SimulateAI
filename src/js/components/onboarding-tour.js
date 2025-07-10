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
 * Onboarding Coach Marks System
 * Creates a guided walkthrough using spotlight/coach marks with auto-scroll
 */

import logger from '../utils/logger.js';
import focusManager from '../utils/focus-manager.js';
import scrollManager from '../utils/scroll-manager.js';
import ModalUtility from './modal-utility.js';
import { simpleStorage } from '../utils/simple-storage.js';
import { simpleAnalytics } from '../utils/simple-analytics.js';

class OnboardingTour {
  static instanceCount = 0;

  constructor() {
    OnboardingTour.instanceCount++;
    this.instanceId = OnboardingTour.instanceCount;

    const STACK_TRACE_LINES = 5;
    logger.warn(
      'OnboardingTour',
      `🏗️ NEW INSTANCE CREATED #${this.instanceId}`,
      {
        totalInstances: OnboardingTour.instanceCount,
        stackTrace: new Error().stack.split('\n').slice(1, STACK_TRACE_LINES),
      }
    );

    this.currentStep = 0;
    this.currentTutorial = 1;
    this.isActive = false;
    this.isTransitioning = false; // Prevent race conditions in step transitions
    this.isProcessingAction = false; // Prevent rapid button clicks
    this.coachMark = null;
    this.overlay = null;
    this.spotlight = null;
    this.contentObserver = null; // For tracking dynamic content changes
    this.contentUpdateTimeout = null; // For debouncing content updates

    // User interaction states
    this.userStates = {
      'option-selected': false,
      'choice-confirmed': false,
      'modal-opened': false,
    };

    // Scroll tracking
    this.isAutoScrolling = false;
    this.userHasManuallyScrolled = false;
    this.lastScrollPosition = 0;
    this.scrollTrackingTimer = null;

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

    // Tutorial steps configuration
    this.tutorials = {
      1: {
        // Test Scenario Tutorial
        name: 'test-scenario',
        title: 'Test Scenario Tutorial',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to SimulateAI! 🤖',
            content:
              'A Digital Learning Lab where you journey into the ethical frontiers of AI and Robotics. This tour will guide you through our interactive platform.',
            buttons: [
              { text: 'Start Tour', action: 'continue', primary: true },
              { text: 'Start Exploring', action: 'finish', primary: false },
            ],
            target: null,
            position: 'center',
            autoScroll: false,
          },
          {
            id: 'launch-test',
            title: 'Launch Test Scenario',
            content:
              'Click this button to open an interactive ethics simulation and see how moral dilemmas are presented.',
            target: '#test-scenario-modal',
            position: 'bottom',
            action: 'wait-for-click',
            autoScroll: true,
            highlightClick: true,
          },
          {
            id: 'dilemma-section',
            title: 'The Dilemma Section',
            content:
              'This section presents the ethical scenario. Read carefully to understand the situation and its complexities.',
            target: '.dilemma-text',
            position: 'right',
            waitFor: 'scenario-modal',
            autoScroll: true,
          },
          {
            id: 'ethical-question',
            title: 'Ethical Question',
            content:
              'This highlights the core ethical consideration. What values are at stake in this scenario?',
            target: '.ethical-question',
            position: 'right',
            autoScroll: true,
          },
          {
            id: 'choose-approach',
            title: 'Choose Your Approach',
            content:
              'Each approach represents a different ethical framework. Please click the <strong>first option</strong> to continue the tutorial and see how the analysis works!',
            target: '.options-container',
            position: 'right',
            action: 'wait-for-click',
            highlightClick: true,
            autoScroll: true,
          },
          {
            id: 'pros-cons',
            title: 'Pros and Cons Analysis',
            content:
              'Perfect! The details expanded to show the analysis. Every ethical choice has trade-offs - these help you understand the implications.',
            target: '.option-details',
            position: 'right',
            autoScroll: true,
            waitForElement: true,
          },
          {
            id: 'radar-chart-preview',
            title: 'Radar Chart Visualization',
            content:
              "This radar chart shows how your choice impacts different ethical dimensions. The chart updates based on your selection - we'll explore this in detail in Tutorial 2!",
            target: '#scenario-radar-chart',
            position: 'left',
            autoScroll: true,
            waitFor: 'option-selected',
          },
          {
            id: 'confirm-choice',
            title: 'Confirm Your Decision',
            content:
              'When ready, confirm your choice. Remember - there\'s no "wrong" answer in ethics exploration!',
            target: '#confirm-choice',
            position: 'right',
            action: 'wait-for-click',
            highlightClick: true,
            autoScroll: true,
          },
          {
            id: 'tutorial-complete',
            title: 'Congratulations! 🎉',
            content:
              "Excellent work! You've successfully completed your first ethical scenario exploration. You've learned how to navigate complex moral dilemmas, analyze different approaches, and understand the ethical implications through our interactive tools.<br><br>Would you like to continue with Tutorial 2 to explore the radar chart visualization in more detail?",
            buttons: [
              {
                text: '📊 Continue to Tutorial 2',
                action: 'next-tutorial',
                primary: true,
              },
              { text: 'Start Exploring', action: 'finish', primary: false },
            ],
            target: null,
            position: 'center',
            autoScroll: false,
            skipUntil: 'choice-confirmed',
          },
        ],
      },
      2: {
        // Hero Demo Tutorial
        name: 'hero-demo',
        title: 'Hero Demo Tutorial',
        steps: [
          {
            id: 'hero-demo-chart',
            title: 'Interactive Radar Chart 📊',
            content:
              'This is our Hero Demo radar chart. It shows how different ethical choices impact various dimensions in real-time, giving you a visual representation of moral decision-making.',
            target: '#hero-ethics-chart',
            position: 'bottom',
            autoScroll: true,
          },
          {
            id: 'ethical-dimensions',
            title: 'Ethical Dimensions Explained',
            content:
              'The chart displays 8 key ethical dimensions that represent core moral principles. Each axis shows how your decisions impact different aspects of AI ethics - from fairness to sustainability.',
            target: '#hero-ethics-chart',
            position: 'left',
            autoScroll: false,
          },
          {
            id: 'interactive-controls',
            title: 'Try the Controls! 🎮',
            content:
              'Use these buttons to see how different ethical approaches affect the dimensions. Watch the chart change in real-time as you explore different scenarios! Click "Next" when you\'re ready to continue.',
            target: '.demo-controls-grid',
            position: 'left',
            autoScroll: true,
            highlightClick: true,
          },
          {
            id: 'how-to-read',
            title: 'How to Read Charts 📖',
            content:
              'This section teaches you about interpreting the visual data and understanding the ethical implications of each choice. Click "Next" to continue exploring.',
            target: '.radar-instructions-accordion',
            position: 'bottom',
            autoScroll: true,
            highlightClick: true,
          },
          {
            id: 'glossary',
            title: 'Ethical Dimensions Glossary 📚',
            content:
              'This glossary provides detailed definitions of each ethical principle used in our simulations. Click "Next" to complete the radar chart tutorial.',
            target: '.ethics-glossary-accordion',
            position: 'bottom',
            autoScroll: true,
            highlightClick: true,
          },
          {
            id: 'radar-tutorial-complete',
            title: 'Radar Chart Mastery! 🎉',
            content:
              'Excellent! You now understand how to interpret ethical impacts visually and interact with our radar chart system. Ready to explore the Learning Lab?',
            buttons: [
              {
                text: '🧪 Learning Lab Tutorial',
                action: 'next-tutorial',
                primary: true,
              },
              { text: 'Start Exploring', action: 'finish', primary: false },
            ],
            target: null,
            position: 'center',
            autoScroll: false,
          },
        ],
      },
      3: {
        // Learning Lab Pre-Launch Modal Tutorial
        name: 'learning-lab',
        title: 'Learning Lab Tutorial',
        steps: [
          {
            id: 'find-trolley-problem',
            title: 'Scenario Simulations',
            content:
              'Each scenario includes a fully equipped Learning Lab, offering a detailed overview and curated educator resources to deepen understanding and spark meaningful discussion.',
            target:
              '#category-trolley-problem > div.scenarios-grid > article:nth-child(1)',
            position: 'bottom',
            autoScroll: true,
          },
          {
            id: 'click-learning-lab',
            title: 'Open Learning Lab',
            content:
              'Perfect! Now click the "Learning Lab" button on this Trolley Problem scenario card to open the pre-launch modal.',
            target:
              '#category-trolley-problem > div.scenarios-grid > article:nth-child(1) > div.scenario-footer > button.scenario-start-btn',
            position: 'bottom',
            action: 'wait-for-click',
            autoScroll: true,
            highlightClick: true,
            waitFor:
              '#category-trolley-problem > div.scenarios-grid > article:nth-child(1)',
          },
          {
            id: 'overview-tab',
            title: 'Overview Tab',
            content:
              'This Overview tab provides a comprehensive introduction to the scenario, including the ethical dilemma, key stakeholders, and real-world context. Click "Next" to continue exploring the other tabs.',
            target:
              '.tab-buttons-container [data-tab="overview"], .tab-buttons-container .tab-button[data-tab="overview"]',
            position: 'right',
            waitFor: 'pre-launch-modal',
            autoScroll: true,
          },
          {
            id: 'learning-goals-tab',
            title: 'Learning Goals Tab',
            content:
              'The Learning Goals tab outlines what you\'ll discover and understand by completing this simulation, including key ethical principles and decision-making frameworks. Click "Next" to continue exploring the other tabs.',
            target:
              '.tab-buttons-container [data-tab="objectives"], .tab-buttons-container .tab-button[data-tab="objectives"]',
            position: 'right',
            highlightClick: true,
            autoScroll: true,
          },
          {
            id: 'ethics-guide-tab',
            title: 'Ethics Guide Tab',
            content:
              'The Ethics Guide provides essential background on moral frameworks, philosophical approaches, and ethical theories relevant to this scenario. Click "Next" to see the next tab.',
            target:
              '.tab-buttons-container [data-tab="ethics"], .tab-buttons-container .tab-button[data-tab="ethics"]',
            position: 'right',
            highlightClick: true,
            autoScroll: true,
          },
          {
            id: 'get-ready-tab',
            title: 'Get Ready Tab',
            content:
              'Get Ready helps you prepare for the simulation with pre-activity questions, reflection prompts, and scenario setup information. Click "Next" to continue.',
            target:
              '.tab-buttons-container [data-tab="preparation"], .tab-buttons-container .tab-button[data-tab="preparation"]',
            position: 'right',
            highlightClick: true,
            autoScroll: true,
          },
          {
            id: 'resources-tab',
            title: 'Resources Tab',
            content:
              'The Resources tab contains supplementary materials, research papers, case studies, and additional reading to deepen your understanding. Click "Next" to see the final tab.',
            target:
              '.tab-buttons-container [data-tab="resources"], .tab-buttons-container .tab-button[data-tab="resources"]',
            position: 'right',
            highlightClick: true,
            autoScroll: true,
          },
          {
            id: 'for-educators-tab',
            title: 'For Educators Tab',
            content:
              'For Educators provides teaching guides, discussion questions, assessment rubrics, and classroom integration strategies for instructors. This completes our tour of the Learning Lab tabs!',
            target:
              '.tab-buttons-container [data-tab="educator"], .tab-buttons-container .tab-button[data-tab="educator"]',
            position: 'right',
            highlightClick: true,
            autoScroll: true,
            hasNextButton: true,
            action: 'next',
            onShow() {
              // Enhanced auto-scroll to ensure "For Educators" tab is visible
              const educatorTab =
                document.querySelector(
                  '.tab-buttons-container [data-tab="educator"]'
                ) ||
                document.querySelector(
                  '.tab-buttons-container .tab-button[data-tab="educator"]'
                );

              if (educatorTab) {
                // Scroll the tab into view with enhanced positioning
                educatorTab.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                  inline: 'center',
                });

                // Also scroll the tab container to ensure proper visibility
                const tabContainer = educatorTab.closest(
                  '.tab-buttons-container'
                );
                if (tabContainer) {
                  tabContainer.scrollIntoView({
                    behavior: 'smooth',
                    block: 'center',
                    inline: 'center',
                  });
                }

                logger.info(
                  'OnboardingTour',
                  'Auto-scrolled to For Educators tab',
                  {
                    element: educatorTab,
                    container: tabContainer,
                  }
                );
              } else {
                logger.warn(
                  'OnboardingTour',
                  'Could not find For Educators tab'
                );
              }

              // Also auto-scroll nav menu to highlight educators tab (legacy behavior)
              const navEducatorsTab = document.querySelector(
                'a[href="#educator-tools"]'
              );
              if (navEducatorsTab) {
                navEducatorsTab.scrollIntoView({
                  behavior: 'smooth',
                  block: 'center',
                });
                logger.info(
                  'OnboardingTour',
                  'Auto-scrolled to Educator Tools nav link',
                  { element: navEducatorsTab }
                );
              }
            },
          },
          {
            id: 'tutorial-complete',
            title: 'Mission Accomplished! 🎉🤖',
            content:
              "You've completed the tutorial and unlocked the tools to navigate the ethical terrain of intelligent machines. Ready to begin your journey?",
            buttons: [
              { text: '🚀 Start Exploring', action: 'finish', primary: true },
            ],
            target: null,
            position: 'center',
            autoScroll: false,
          },
        ],
      },
    };

    // Set up keyboard navigation tracking
    this.setupKeyboardTracking();

    this.init();
  }

  init() {
    logger.info('OnboardingTour', 'Initializing onboarding coach marks system');

    // Don't auto-start - let the app control when the tour starts
    logger.debug(
      'OnboardingTour',
      'OnboardingTour initialized, waiting for manual start'
    );
  }

  setupKeyboardTracking() {
    // Track when user uses Tab key for navigation
    document.addEventListener('keydown', e => {
      if (e.key === 'Tab') {
        this.wasKeyboardNavigation = true;
      }
    });

    // Reset keyboard navigation flag on mouse click
    document.addEventListener('mousedown', () => {
      this.wasKeyboardNavigation = false;
    });
  }

  isFirstTimeVisit() {
    const hasVisited = simpleStorage.get('has_visited', false);
    if (!hasVisited) {
      simpleStorage.set('has_visited', true);
      return true;
    }
    return false;
  }

  hasCompletedTour() {
    return simpleStorage.get('tour_completed', false);
  }

  startTour(tutorialNumber = 1) {
    logger.info(
      'OnboardingTour',
      `🚀 Starting onboarding tour ${tutorialNumber}`,
      {
        instanceId: this.instanceId,
        tutorialNumber,
        isActive: this.isActive,
      }
    );

    if (this.isActive) {
      logger.warn(
        'OnboardingTour',
        'Tour already active, ignoring start request'
      );
      return;
    }

    // Initialize tour state
    this.isActive = true;
    this.currentTutorial = tutorialNumber;
    this.currentStep = 0;

    // Reset user interaction states
    this.userStates = {
      'option-selected': false,
      'choice-confirmed': false,
      'modal-opened': false,
    };

    logger.info('OnboardingTour', `Starting tutorial ${tutorialNumber}`, {
      currentStep: this.currentStep,
      totalSteps: this.tutorials[tutorialNumber]?.steps?.length || 0,
    });

    // Track analytics
    simpleAnalytics.trackEvent('tour_started', {
      tutorial: tutorialNumber,
    });

    // Create UI elements and start
    this.createOverlay();
    this.showStep();
  }

  createOverlay() {
    // Remove existing overlay
    this.removeOverlay();

    logger.debug('OnboardingTour', 'Creating overlay elements', {
      tutorial: this.currentTutorial,
      step: this.currentStep,
      existingOverlays: document.querySelectorAll('.onboarding-overlay').length,
    });

    // Create main overlay (darkens everything except spotlight)
    this.overlay = document.createElement('div');
    this.overlay.className = 'onboarding-overlay';
    this.overlay.setAttribute('role', 'presentation');
    this.overlay.setAttribute('aria-hidden', 'true');

    // Create spotlight (highlighted area)
    this.spotlight = document.createElement('div');
    this.spotlight.className = 'onboarding-spotlight';

    // Create coach mark popup
    this.coachMark = document.createElement('div');
    this.coachMark.className = 'onboarding-coach-mark';
    this.coachMark.setAttribute('role', 'dialog');
    this.coachMark.setAttribute('aria-modal', 'true');
    this.coachMark.setAttribute('aria-labelledby', 'coach-mark-title');
    this.coachMark.setAttribute('aria-describedby', 'coach-mark-content');

    // Add to DOM in correct order
    document.body.appendChild(this.overlay);
    document.body.appendChild(this.spotlight);
    document.body.appendChild(this.coachMark);

    // Add body class for styling
    document.body.classList.add('onboarding-active');

    // Special handling for Tutorial 3 Step 3 to ensure maximum visibility
    if (
      this.currentTutorial === this.TUTORIAL_3 &&
      this.currentStep === this.TUTORIAL_3_STEP_3_INDEX
    ) {
      this.coachMark.style.zIndex = '10020';
      this.coachMark.style.isolation = 'isolate';
      this.coachMark.style.position = 'fixed';
      logger.warn(
        'OnboardingTour',
        'TUTORIAL 3 STEP 3 - Applied aggressive stacking',
        {
          zIndex: this.coachMark.style.zIndex,
          position: getComputedStyle(this.coachMark).position,
          isolation: this.coachMark.style.isolation,
        }
      );
    }

    logger.debug('OnboardingTour', 'Overlay elements created and appended', {
      overlayInDom: !!document.querySelector('.onboarding-overlay'),
      totalOverlays: document.querySelectorAll('.onboarding-overlay').length,
      coachMarkInDom: !!document.querySelector('.onboarding-coach-mark'),
    });

    // Setup scroll tracking
    this.setupScrollTracking();

    // Ensure any existing modals are onboarding-friendly
    this.makeModalsOnboardingFriendly();
  }

  makeModalsOnboardingFriendly() {
    // Find any active modal backdrops and make them onboarding-friendly
    const modalBackdrops = document.querySelectorAll('.modal-backdrop');
    modalBackdrops.forEach(backdrop => {
      if (backdrop.style.display !== 'none') {
        backdrop.style.pointerEvents = 'none';
        const modalDialog = backdrop.querySelector('.modal-dialog');
        if (modalDialog) {
          modalDialog.style.pointerEvents = 'auto';
        }
        logger.debug('OnboardingTour', 'Made modal onboarding-friendly', {
          modalId: backdrop.id,
        });
      }
    });
  }

  removeOverlay() {
    logger.debug('OnboardingTour', 'Removing overlay elements', {
      hasOverlay: !!this.overlay,
      hasSpotlight: !!this.spotlight,
      hasCoachMark: !!this.coachMark,
      hasContentObserver: !!this.contentObserver,
      totalOverlaysInDom: document.querySelectorAll('.onboarding-overlay')
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
    const orphanedOverlays = document.querySelectorAll('.onboarding-overlay');
    const orphanedSpotlights = document.querySelectorAll(
      '.onboarding-spotlight'
    );
    const orphanedCoachMarks = document.querySelectorAll(
      '.onboarding-coach-mark'
    );

    if (
      orphanedOverlays.length > 0 ||
      orphanedSpotlights.length > 0 ||
      orphanedCoachMarks.length > 0
    ) {
      logger.warn('OnboardingTour', 'Found orphaned elements, cleaning up', {
        overlays: orphanedOverlays.length,
        spotlights: orphanedSpotlights.length,
        coachMarks: orphanedCoachMarks.length,
      });

      orphanedOverlays.forEach(el => el.remove());
      orphanedSpotlights.forEach(el => el.remove());
      orphanedCoachMarks.forEach(el => el.remove());
    }

    document.body.classList.remove('onboarding-active');

    logger.debug('OnboardingTour', 'Overlay cleanup complete', {
      totalOverlaysInDom: document.querySelectorAll('.onboarding-overlay')
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

    window.addEventListener('scroll', this.scrollHandler, { passive: true });
  }

  removeScrollTracking() {
    if (this.scrollHandler) {
      window.removeEventListener('scroll', this.scrollHandler);
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
      behavior: 'smooth',
      offset,
    });
  }

  positionSpotlight(targetElement) {
    if (!targetElement || !this.spotlight) return;

    const rect = targetElement.getBoundingClientRect();
    const padding = 8;

    this.spotlight.style.left = `${rect.left - padding}px`;
    this.spotlight.style.top = `${rect.top + window.pageYOffset - padding}px`;
    this.spotlight.style.width = `${rect.width + padding * 2}px`;
    this.spotlight.style.height = `${rect.height + padding * 2}px`;
    this.spotlight.style.display = 'block';
  }

  positionCoachMark(
    targetElement,
    position = 'bottom',
    step = null,
    retryCount = 0
  ) {
    if (!this.coachMark) return;

    // Prevent infinite recursion - max 3 retries
    const MAX_POSITION_RETRIES = 3;
    if (retryCount > MAX_POSITION_RETRIES) {
      logger.warn(
        'OnboardingTour',
        `⚠️ Max positioning retries reached for step ${step?.id || 'unknown'}`
      );
      return;
    }

    // MOBILE-AWARE POSITIONING LOGIC
    const isMobile = window.innerWidth <= this.MOBILE_BREAKPOINT; // Mobile breakpoint

    // Get coach mark dimensions after content is set
    this.coachMark.style.visibility = 'hidden';
    this.coachMark.style.display = 'block';
    this.coachMark.style.position = 'fixed'; // Use fixed positioning for consistent behavior
    this.coachMark.style.zIndex = '10014';

    // Reset mobile overlay class in case it was previously set
    this.coachMark.classList.remove('mobile-overlay');
    this.coachMark.style.width = ''; // Reset width
    this.coachMark.style.maxHeight = ''; // Reset max height
    this.coachMark.style.overflow = ''; // Reset overflow

    const coachMarkRect = this.coachMark.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spacing = isMobile ? this.MOBILE_SPACING : this.DESKTOP_SPACING;

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
        if (retryCount < MAX_POSITION_RETRIES) {
          logger.debug(
            'OnboardingTour',
            `Target outside viewport, scrolling into view (retry ${retryCount + 1}/${MAX_POSITION_RETRIES})`
          );
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
          // Wait for scroll to complete and retry with incremented count
          setTimeout(() => {
            this.positionCoachMark(
              targetElement,
              position,
              step,
              retryCount + 1
            );
          }, this.ANIMATION_DURATION);
          return;
        } else {
          // Exceeded retries, position anyway (might be partially visible)
          logger.warn(
            'OnboardingTour',
            `Target still outside viewport after ${MAX_POSITION_RETRIES} retries, positioning anyway`
          );
        }
      }

      // MOBILE POSITIONING STRATEGY
      if (isMobile) {
        // On mobile, use a more intelligent positioning strategy that avoids covering the target
        const mobileCoachMarkHeight = Math.min(
          coachMarkRect.height,
          viewportHeight * this.MOBILE_COACH_MARK_HEIGHT_RATIO
        ); // Max 40% of screen

        // Calculate available space in each direction
        const spaceAbove = targetRect.top - spacing;
        const spaceBelow = viewportHeight - targetRect.bottom - spacing;

        logger.debug('OnboardingTour', 'Mobile positioning analysis', {
          targetRect: {
            x: targetRect.left,
            y: targetRect.top,
            w: targetRect.width,
            h: targetRect.height,
          },
          spaceAbove,
          spaceBelow,
          coachMarkHeight: coachMarkRect.height,
          mobileCoachMarkHeight,
        });

        // Priority order for mobile: below target, above target, full-width overlay at bottom
        if (spaceBelow >= mobileCoachMarkHeight) {
          // Enough space below - position there (preferred)
          position = 'bottom';
          left = Math.max(
            spacing,
            Math.min(
              targetRect.left + targetRect.width / 2 - coachMarkRect.width / 2,
              viewportWidth - coachMarkRect.width - spacing
            )
          );
          top = targetRect.bottom + spacing;
          logger.debug('OnboardingTour', 'Mobile: Positioning below target');
        } else if (spaceAbove >= mobileCoachMarkHeight) {
          // Enough space above - position there
          position = 'top';
          left = Math.max(
            spacing,
            Math.min(
              targetRect.left + targetRect.width / 2 - coachMarkRect.width / 2,
              viewportWidth - coachMarkRect.width - spacing
            )
          );
          top = targetRect.top - coachMarkRect.height - spacing;
          logger.debug('OnboardingTour', 'Mobile: Positioning above target');
        } else {
          // Not enough space above or below - use full-width overlay at bottom
          this.coachMark.classList.add('mobile-overlay');
          left = spacing;
          top =
            viewportHeight -
            coachMarkRect.height -
            spacing -
            this.MOBILE_NAVIGATION_SPACE; // Leave space for navigation
          this.coachMark.style.width = `${viewportWidth - spacing * 2}px`;
          this.coachMark.style.maxHeight = `${viewportHeight * this.MOBILE_MAX_HEIGHT_RATIO}px`;
          this.coachMark.style.overflow = 'auto';

          logger.debug(
            'OnboardingTour',
            'Mobile: Using full-width overlay mode to avoid covering content'
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
            'OnboardingTour',
            `Forcing bottom position for Tutorial 3 step ${this.currentStep + 1}`
          );
          position = 'bottom';
        }

        switch (position) {
          case 'top':
            left =
              targetRect.left + targetRect.width / 2 - coachMarkRect.width / 2;
            top = targetRect.top - coachMarkRect.height - spacing;
            break;
          case 'bottom':
            left =
              targetRect.left + targetRect.width / 2 - coachMarkRect.width / 2;
            top = targetRect.bottom + spacing;
            break;
          case 'left':
            left = targetRect.left - coachMarkRect.width - spacing;
            top =
              targetRect.top + targetRect.height / 2 - coachMarkRect.height / 2;
            break;
          case 'right':
            left = targetRect.right + spacing;
            top =
              targetRect.top + targetRect.height / 2 - coachMarkRect.height / 2;
            break;
          default: // Default to bottom
            left =
              targetRect.left + targetRect.width / 2 - coachMarkRect.width / 2;
            top = targetRect.bottom + spacing;
        }

        // VIEWPORT BOUNDS CHECKING - Always keep within viewport
        const minLeft = spacing;
        const maxLeft = viewportWidth - coachMarkRect.width - spacing;
        const minTop = spacing;
        const maxTop = viewportHeight - coachMarkRect.height - spacing;

        // Clamp to viewport bounds
        left = Math.max(minLeft, Math.min(left, maxLeft));
        top = Math.max(minTop, Math.min(top, maxTop));
      }

      // Special handling for interactive elements - avoid covering target (both mobile and desktop)
      if (
        step &&
        step.highlightClick &&
        !this.coachMark.classList.contains('mobile-overlay')
      ) {
        // If positioned over target, try alternative positions
        if (
          left < targetRect.right &&
          left + coachMarkRect.width > targetRect.left &&
          top < targetRect.bottom &&
          top + coachMarkRect.height > targetRect.top
        ) {
          if (isMobile) {
            // On mobile, prefer overlay mode when covering target
            this.coachMark.classList.add('mobile-overlay');
            left = spacing;
            top =
              viewportHeight -
              coachMarkRect.height -
              spacing -
              this.MOBILE_NAVIGATION_SPACE;
            this.coachMark.style.width = `${viewportWidth - spacing * 2}px`;
          } else {
            // Desktop fallback positioning
            // Try positioning to the right
            if (
              targetRect.right + coachMarkRect.width + spacing <=
              viewportWidth
            ) {
              left = targetRect.right + spacing;
              top = Math.max(
                spacing,
                Math.min(
                  targetRect.top,
                  viewportHeight - coachMarkRect.height - spacing
                )
              );
            }
            // Try positioning to the left
            else if (targetRect.left - coachMarkRect.width - spacing >= 0) {
              left = targetRect.left - coachMarkRect.width - spacing;
              top = Math.max(
                spacing,
                Math.min(
                  targetRect.top,
                  viewportHeight - coachMarkRect.height - spacing
                )
              );
            }
            // Try positioning below
            else if (
              targetRect.bottom + coachMarkRect.height + spacing <=
              viewportHeight
            ) {
              left = Math.max(
                spacing,
                Math.min(
                  targetRect.left,
                  viewportWidth - coachMarkRect.width - spacing
                )
              );
              top = targetRect.bottom + spacing;
            }
            // Try positioning above
            else if (targetRect.top - coachMarkRect.height - spacing >= 0) {
              left = Math.max(
                spacing,
                Math.min(
                  targetRect.left,
                  viewportWidth - coachMarkRect.width - spacing
                )
              );
              top = targetRect.top - coachMarkRect.height - spacing;
            }
          }
        }
      }

      logger.debug(
        'OnboardingTour',
        'Coach mark positioned relative to target',
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
          isOverlay: this.coachMark.classList.contains('mobile-overlay'),
        }
      );
    } else {
      // Center on viewport for steps without targets
      if (isMobile) {
        // On mobile, position towards bottom to avoid header overlap
        left = spacing;
        top = Math.max(
          viewportHeight * this.MOBILE_POSITION_RATIO,
          viewportHeight -
            coachMarkRect.height -
            spacing -
            this.MOBILE_NAVIGATION_SPACE
        );
        this.coachMark.style.width = `${viewportWidth - spacing * 2}px`;
      } else {
        left = viewportWidth / 2 - coachMarkRect.width / 2;
        top = viewportHeight / 2 - coachMarkRect.height / 2;
      }

      logger.debug('OnboardingTour', 'Coach mark centered in viewport', {
        stepId: step?.id,
        coachMarkPos: { left, top },
        isMobile,
      });
    }

    // Apply position
    this.coachMark.style.left = `${left}px`;
    this.coachMark.style.top = `${top}px`;
    this.coachMark.style.visibility = 'visible';
    this.coachMark.style.opacity = '1';
    this.coachMark.style.pointerEvents = 'auto';
    this.coachMark.style.display = 'block';

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
        'OnboardingTour',
        'Coach mark may not be fully visible, adjusting',
        {
          stepId: step?.id,
          finalRect: {
            x: finalRect.left,
            y: finalRect.top,
            w: finalRect.width,
            h: finalRect.height,
          },
          viewport: { w: viewportWidth, h: viewportHeight },
        }
      );

      // Emergency fallback: center in viewport
      this.coachMark.style.left = `${viewportWidth / 2 - coachMarkRect.width / 2}px`;
      this.coachMark.style.top = `${viewportHeight / 2 - coachMarkRect.height / 2}px`;
    }

    logger.info(
      'OnboardingTour',
      `Coach mark positioned for step ${step?.id || 'unknown'}`,
      {
        finalPosition: {
          left: this.coachMark.style.left,
          top: this.coachMark.style.top,
        },
        isVisible,
      }
    );
  }

  async showStep() {
    const tutorial = this.tutorials[this.currentTutorial];
    const step = tutorial.steps[this.currentStep];

    if (!step) {
      logger.error('OnboardingTour', 'No step found', {
        currentTutorial: this.currentTutorial,
        currentStep: this.currentStep,
        totalSteps: tutorial?.steps?.length,
      });
      return;
    }

    logger.info(
      'OnboardingTour',
      `🚀 Starting step ${this.currentStep + 1}: ${step.id}`,
      {
        currentTutorial: this.currentTutorial,
        currentStep: this.currentStep,
        stepId: step.id,
        totalSteps: tutorial.steps.length,
      }
    );

    // SIMPLIFIED STEP RENDERING - Removed complex conditions that could cause skipping

    // Find target element if specified
    let targetElement = step.target
      ? document.querySelector(step.target)
      : null;

    // If step requires waiting for element to appear, wait for it
    if (step.waitForElement && step.target && !targetElement) {
      logger.info(
        'OnboardingTour',
        `Waiting for element to appear: ${step.target}`,
        {
          stepId: step.id,
          selector: step.target,
        }
      );

      // Wait for element to appear with a timeout
      let attempts = 0;
      const maxAttempts = 30; // 3 seconds with 100ms intervals

      while (!targetElement && attempts < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, this.CHECK_DELAY));
        targetElement = document.querySelector(step.target);
        attempts++;
      }

      if (!targetElement) {
        logger.warn(
          'OnboardingTour',
          `Target element still not found after waiting: ${step.target}`,
          {
            stepId: step.id,
            selector: step.target,
            attemptsUsed: attempts,
          }
        );
      } else {
        logger.info(
          'OnboardingTour',
          `Target element found after ${attempts * 100}ms`,
          {
            stepId: step.id,
            selector: step.target,
          }
        );
      }
    }

    if (step.target && !targetElement) {
      logger.warn(
        'OnboardingTour',
        `Target element not found: ${step.target}`,
        {
          stepId: step.id,
          selector: step.target,
        }
      );
    }

    // Auto-scroll to target if needed and element exists
    if (step.autoScroll && targetElement) {
      // Special handling for step 4 (ethical-question) - scroll within modal
      if (step.id === 'ethical-question') {
        const modalScrolled = this.scrollToElementInModal(targetElement, step);
        if (modalScrolled) {
          // Wait for modal scroll animation
          await new Promise(resolve =>
            setTimeout(resolve, this.SCROLL_DURATION)
          );
        }
      } else {
        // Regular page scrolling
        const rect = targetElement.getBoundingClientRect();
        const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;

        if (!isInViewport) {
          logger.info(
            'OnboardingTour',
            `Scrolling to bring target into view for step ${step.id}`
          );
          targetElement.scrollIntoView({
            behavior: 'smooth',
            block: 'center',
            inline: 'center',
          });
          // Wait for scroll animation
          await new Promise(resolve =>
            setTimeout(resolve, this.SCROLL_DURATION)
          );
        }
      }
    }

    // Position spotlight
    if (targetElement) {
      this.positionSpotlight(targetElement);
    } else if (this.spotlight) {
      this.spotlight.style.display = 'none';
    }

    // Create coach mark content - with robust null checking
    if (!this.coachMark || !document.body.contains(this.coachMark)) {
      logger.warn(
        'OnboardingTour',
        'Coach mark element is null or not in DOM, recreating overlay',
        {
          currentTutorial: this.currentTutorial,
          currentStep: this.currentStep,
          stepId: step.id,
          isActive: this.isActive,
          coachMarkExists: !!this.coachMark,
          coachMarkInDom: this.coachMark
            ? document.body.contains(this.coachMark)
            : false,
        }
      );
      this.createOverlay();

      if (!this.coachMark) {
        logger.error(
          'OnboardingTour',
          'Failed to create coach mark element, aborting step'
        );
        return;
      }
    }

    // Additional safety check right before setting innerHTML
    if (!this.coachMark) {
      logger.error(
        'OnboardingTour',
        'Coach mark is null right before setting innerHTML - this should not happen!'
      );
      return;
    }

    // Verify the coach mark is still attached to DOM
    if (!document.body.contains(this.coachMark)) {
      logger.error(
        'OnboardingTour',
        'Coach mark exists but is not in DOM - recreating'
      );
      this.createOverlay();
      if (!this.coachMark) {
        logger.error('OnboardingTour', 'Failed to recreate coach mark element');
        return;
      }
    }

    try {
      this.coachMark.innerHTML = this.createCoachMarkContent(step, tutorial);
    } catch (error) {
      logger.error('OnboardingTour', 'Error setting coach mark innerHTML', {
        error: error.message,
        coachMark: this.coachMark,
        step: step.id,
      });
      return;
    }

    // Position coach mark
    this.positionCoachMark(targetElement, step.position, step);

    // Ensure coach mark is visible and interactive
    this.coachMark.style.display = 'block';
    this.coachMark.style.visibility = 'visible';
    this.coachMark.style.opacity = '1';
    this.coachMark.style.pointerEvents = 'auto';
    this.coachMark.style.zIndex = '10014';

    // Set up event listeners for buttons
    this.setupEventListeners(step);

    // Special handling for specific steps
    if (step.id === 'dilemma-section') {
      // Set up content observer for step 3 to track typewriter expansion
      this.setupContentObserver(targetElement, step);
    }

    // Set up action handling
    if (step.action === 'wait-for-click' && targetElement) {
      this.waitForElementClick(targetElement, step);
    } else if (step.action === 'wait-for-option-selection' && targetElement) {
      logger.info(
        'OnboardingTour',
        `Setting up option selection waiting for step ${step.id}`
      );
      this.waitForOptionSelection(targetElement, step);
    }

    // Add click highlighting if needed
    if (step.highlightClick && targetElement) {
      targetElement.classList.add('onboarding-click-highlight');
    }

    // Execute onShow callback if defined
    if (step.onShow && typeof step.onShow === 'function') {
      try {
        logger.info(
          'OnboardingTour',
          `Executing onShow callback for step ${step.id}`
        );
        step.onShow();
      } catch (error) {
        logger.error(
          'OnboardingTour',
          `Error executing onShow callback for step ${step.id}`,
          {
            error: error.message,
          }
        );
      }
    }

    logger.info('OnboardingTour', `✅ Step ${step.id} rendered successfully`, {
      hasTarget: !!targetElement,
      targetInViewport: targetElement
        ? this.isElementInViewport(targetElement)
        : false,
      coachMarkVisible: this.coachMark.style.visibility === 'visible',
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
                    `<div class="step-dot ${index === this.currentStep ? 'active' : index < this.currentStep ? 'completed' : ''}"></div>`
                )
                .join('')}
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
          button =>
            `<button class="coach-mark-btn ${button.primary ? 'primary' : 'secondary'}" 
                 data-action="${button.action}" 
                 type="button">
          ${button.text}
         </button>`
        )
        .join('');
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
      (step.action === 'wait-for-click' ||
        step.action === 'wait-for-option-selection');

    logger.debug('OnboardingTour', 'Creating buttons', {
      stepId: step.id,
      tutorial: this.currentTutorial,
      step: this.currentStep,
      isFirstStep,
      isLastStep,
      isLastTutorial,
      hasUserAction,
      stepAction: step.action,
    });

    let buttons = '';

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

    logger.debug('OnboardingTour', 'Buttons created', {
      buttons: buttons.length > 0 ? 'yes' : 'no',
    });

    return buttons;
  }

  setupEventListeners(step) {
    if (!this.coachMark) {
      logger.warn(
        'OnboardingTour',
        'No coach mark element found for event listeners'
      );
      return;
    }

    logger.debug('OnboardingTour', 'Setting up event listeners for step', {
      stepId: step.id,
      buttons: this.coachMark.querySelectorAll('.coach-mark-btn').length,
    });

    // IMPROVED: Remove existing event listeners without DOM recreation
    // Store reference to avoid multiple listeners
    if (this.currentClickHandler) {
      this.coachMark.removeEventListener('click', this.currentClickHandler);
    }
    if (this.currentKeyHandler) {
      this.coachMark.removeEventListener('keydown', this.currentKeyHandler);
    }

    // Set up click handlers for coach mark buttons
    this.currentClickHandler = e => {
      logger.info('OnboardingTour', 'Coach mark clicked', {
        target: e.target.tagName,
        className: e.target.className,
        textContent: e.target.textContent,
        dataset: e.target.dataset,
      });

      if (e.target.classList.contains('coach-mark-btn')) {
        const { action } = e.target.dataset;

        if (action) {
          // CRITICAL: Prevent event bubbling and default behavior
          e.preventDefault();
          e.stopPropagation();
          e.stopImmediatePropagation(); // Prevent other listeners on same element

          // Additional protection: Check if we're already processing an action
          if (this.isProcessingAction) {
            logger.debug(
              'OnboardingTour',
              `Button click ignored - already processing action`
            );
            return;
          }

          logger.info(
            'OnboardingTour',
            `Button clicked with action: ${action}`,
            {
              tutorial: this.currentTutorial,
              step: this.currentStep,
              stepId: step.id,
            }
          );

          this.handleAction(action);
        } else {
          logger.warn('OnboardingTour', 'Button clicked but no action found', {
            target: e.target,
            dataset: e.target.dataset,
          });
        }
      }

      if (e.target.classList.contains('coach-mark-close')) {
        e.preventDefault();
        e.stopPropagation();
        e.stopImmediatePropagation();
        logger.info('OnboardingTour', 'Close button clicked');
        this.endTour();
      }
    };

    this.coachMark.addEventListener('click', this.currentClickHandler);

    // Keyboard navigation
    this.currentKeyHandler = e => {
      if (e.key === 'Escape') {
        this.endTour();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('coach-mark-btn')) {
          e.preventDefault();
          e.target.click();
        }
      }
    };

    this.coachMark.addEventListener('keydown', this.currentKeyHandler);

    // Focus management - use centralized focus manager for cleaner implementation
    const firstButton = this.coachMark.querySelector('.coach-mark-btn');
    if (firstButton) {
      // Auto-focus using focus manager which respects keyboard navigation preferences
      focusManager.autoFocus(this.coachMark, {
        keyboardOnly: true,
        delay: 100, // Small delay to ensure coach mark is positioned
      });
    }

    logger.debug('OnboardingTour', 'Event listeners set up successfully', {
      stepId: step.id,
      hasFirstButton: !!firstButton,
    });
  }

  handleStepAction(step, targetElement) {
    switch (step.action) {
      case 'wait-for-click':
        this.waitForElementClick(targetElement);
        break;
      case 'wait-for-option-selection':
        this.waitForOptionSelection();
        break;
    }
  }

  waitForElementClick(targetElement) {
    if (!targetElement) {
      logger.warn(
        'OnboardingTour',
        'waitForElementClick: No target element provided'
      );
      return;
    }

    logger.debug('OnboardingTour', 'Setting up click listener', {
      targetTag: targetElement.tagName,
      targetClass: targetElement.className,
      tutorial: this.currentTutorial,
      step: this.currentStep,
    });

    const clickHandler = event => {
      logger.info('OnboardingTour', 'Target element clicked, advancing step', {
        tutorial: this.currentTutorial,
        step: this.currentStep,
        eventTarget: event.target.tagName,
      });
      targetElement.removeEventListener('click', clickHandler);
      clearTimeout(timeoutId);
      // Advance immediately when user clicks the suggested element
      setTimeout(() => this.nextStep(), this.ANIMATION_DURATION);
    };

    targetElement.addEventListener('click', clickHandler);

    // Add a timeout fallback - if modal appears but user didn't click, advance anyway
    const timeoutId = setTimeout(() => {
      // Check if the expected modal is now open
      const modalAppeared = document.querySelector(
        '.pre-launch-modal, .reusable-modal'
      );
      if (modalAppeared) {
        logger.info(
          'OnboardingTour',
          'Modal appeared without tracked click, advancing step',
          {
            tutorial: this.currentTutorial,
            step: this.currentStep,
          }
        );
        targetElement.removeEventListener('click', clickHandler);
        this.nextStep();
      } else {
        logger.warn(
          'OnboardingTour',
          'Timeout waiting for click, but no modal appeared',
          {
            tutorial: this.currentTutorial,
            step: this.currentStep,
          }
        );
      }
    }, this.CLICK_TIMEOUT);

    // Also log if the target element exists and is visible
    logger.debug('OnboardingTour', 'Click listener added to target', {
      elementExists: !!targetElement,
      elementVisible: targetElement.offsetParent !== null,
      elementRect: targetElement.getBoundingClientRect(),
    });
  }

  waitForOptionSelection(targetElement, step) {
    logger.info(
      'OnboardingTour',
      `Waiting for option selection in step ${step.id}`,
      {
        targetSelector: step.target,
      }
    );

    // Set up a broad click listener that will catch any clicks in the target area
    const optionClickListener = e => {
      const clickedElement = e.target;

      // Check if this looks like an option click
      const isOption =
        clickedElement.tagName === 'BUTTON' ||
        clickedElement.classList.contains('option') ||
        clickedElement.classList.contains('option-card') ||
        clickedElement.classList.contains('choice') ||
        clickedElement.classList.contains('response') ||
        clickedElement.hasAttribute('data-option') ||
        clickedElement.hasAttribute('data-option-id') ||
        clickedElement.hasAttribute('data-choice') ||
        clickedElement.closest(
          '.option, .option-card, .choice, .response-option'
        );

      if (isOption) {
        logger.info(
          'OnboardingTour',
          `✅ Option selection detected in step ${step.id}`,
          {
            clickedElement: clickedElement.tagName,
            clickedClass: clickedElement.className,
            clickedText: clickedElement.textContent.substring(
              0,
              this.OPTION_TEXT_LENGTH
            ),
          }
        );

        // Remove the listener
        targetElement.removeEventListener('click', optionClickListener);

        // Mark as selected
        this.userStates['option-selected'] = true;
        clickedElement.classList.add('onboarding-selected');

        // Advance to next step
        setTimeout(() => {
          this.nextStep();
        }, this.SELECTION_DELAY);
      }
    };

    targetElement.addEventListener('click', optionClickListener);

    // Also add highlighting to make it clear the area is interactive
    targetElement.classList.add('onboarding-click-highlight');

    logger.debug(
      'OnboardingTour',
      `Option selection listener attached for step ${step.id}`
    );
  }

  waitForCondition(condition, callback) {
    const checkCondition = () => {
      let conditionMet = false;

      switch (condition) {
        case 'scenario-modal':
          conditionMet =
            document.querySelector('.scenario-modal-dialog') !== null;
          // Add delay for modal animation to complete
          if (conditionMet) {
            setTimeout(callback, this.ANIMATION_DURATION);
            return;
          }
          break;
        case 'pre-launch-modal':
          conditionMet = document.querySelector('.pre-launch-modal') !== null;
          // Add delay for modal animation to complete
          if (conditionMet) {
            setTimeout(callback, this.ANIMATION_DURATION);
            return;
          }
          break;
        case 'option-selected':
          conditionMet = this.userStates['option-selected'];
          break;
        case 'choice-confirmed':
          conditionMet = this.userStates['choice-confirmed'];
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
    // Prevent rapid-fire clicks with debouncing
    if (this.isProcessingAction) {
      logger.debug(
        'OnboardingTour',
        `Action ${action} ignored - already processing another action`
      );
      return;
    }

    this.isProcessingAction = true;

    logger.info('OnboardingTour', `Handling action: ${action}`, {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
    });

    switch (action) {
      case 'continue':
        this.nextStep();
        // Reset flag after step transition
        setTimeout(() => {
          this.isProcessingAction = false;
        }, this.DEBOUNCE_DURATION);
        break;
      case 'back':
        this.previousStep();
        // Reset flag after step transition
        setTimeout(() => {
          this.isProcessingAction = false;
        }, this.DEBOUNCE_DURATION);
        break;
      case 'next-tutorial':
        logger.info('OnboardingTour', 'next-tutorial action triggered', {
          currentTutorial: this.currentTutorial,
          currentStep: this.currentStep,
          isActive: this.isActive,
        });
        this.nextTutorial();
        // Flag will be reset in nextTutorial() method itself
        break;
      case 'finish':
      case 'skip':
        this.endTour();
        // Reset flag after tour ends
        setTimeout(() => {
          this.isProcessingAction = false;
        }, this.DEBOUNCE_DURATION);
        break;
      default:
        logger.warn('OnboardingTour', `Unknown action: ${action}`);
        this.isProcessingAction = false;
    }
  }

  nextStep() {
    // Prevent race conditions - don't process if already transitioning
    if (this.isTransitioning) {
      logger.debug(
        'OnboardingTour',
        'Step transition already in progress, ignoring'
      );
      return;
    }

    this.isTransitioning = true;

    // Remove click highlights
    document.querySelectorAll('.onboarding-click-highlight').forEach(el => {
      el.classList.remove('onboarding-click-highlight');
    });

    const tutorial = this.tutorials[this.currentTutorial];

    logger.info('OnboardingTour', `Moving to next step`, {
      currentStep: this.currentStep,
      totalSteps: tutorial.steps.length,
      currentStepId: tutorial.steps[this.currentStep]?.id,
    });

    if (this.currentStep < tutorial.steps.length - 1) {
      this.currentStep++;
      logger.info(
        'OnboardingTour',
        `Advanced to step ${this.currentStep + 1}`,
        {
          newStepId: tutorial.steps[this.currentStep]?.id,
        }
      );

      // Small delay to ensure clean transition
      const TRANSITION_DELAY = 50; // ms
      setTimeout(() => {
        this.isTransitioning = false;
        this.showStep();
      }, TRANSITION_DELAY);
    } else {
      logger.info(
        'OnboardingTour',
        'Tutorial complete, moving to next tutorial'
      );
      this.isTransitioning = false;
      this.nextTutorial();
    }
  }

  previousStep() {
    // Remove click highlights
    document.querySelectorAll('.onboarding-click-highlight').forEach(el => {
      el.classList.remove('onboarding-click-highlight');
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
    if (step && step.action === 'wait-for-option-selection') {
      this.userStates['option-selected'] = false;
    }
  }

  nextTutorial() {
    // Track tutorial completion
    simpleAnalytics.trackEvent('tour_tutorial_completed', {
      tutorial: this.currentTutorial,
    });

    const totalTutorials = Object.keys(this.tutorials).length;
    logger.info('OnboardingTour', `nextTutorial called`, {
      currentTutorial: this.currentTutorial,
      totalTutorials,
      willContinue: this.currentTutorial < totalTutorials,
    });

    if (this.currentTutorial < totalTutorials) {
      this.currentTutorial++;
      this.currentStep = 0;
      // Reset user states for new tutorial
      this.userStates = {
        'option-selected': false,
        'choice-confirmed': false,
        'modal-opened': false,
      };
      logger.info(
        'OnboardingTour',
        `Starting tutorial ${this.currentTutorial}`
      );

      // Special handling for Tutorial 2 - close any open modals and scroll to hero demo
      if (this.currentTutorial === 2) {
        // Check if there's a modal open from Tutorial 1
        const scenarioModal = document.querySelector('.scenario-modal');
        const preLaunchModal = document.querySelector('.pre-launch-modal');

        if (scenarioModal || preLaunchModal) {
          logger.info(
            'OnboardingTour',
            'Modal detected, closing modal before starting Tutorial 2'
          );
          this.waitForModalClosure(() => {
            // After modal closes, scroll to hero demo and start tutorial
            this.scrollToHeroDemoAndStart();
          });

          // Close the modal
          if (scenarioModal) {
            const closeBtn = scenarioModal.querySelector(
              '.modal-close, .close-modal'
            );
            if (closeBtn) {
              closeBtn.click();
            }
          }
          if (preLaunchModal) {
            const closeBtn = preLaunchModal.querySelector(
              '.modal-close, .close-modal'
            );
            if (closeBtn) {
              closeBtn.click();
            }
          }
        } else {
          logger.info(
            'OnboardingTour',
            'No modal detected, scrolling to hero demo for Tutorial 2'
          );
          this.scrollToHeroDemoAndStart();
        }

        // Reset processing flag immediately for Tutorial 2 since async operations will handle the rest
        this.isProcessingAction = false;
        logger.debug(
          'OnboardingTour',
          'Processing flag reset for Tutorial 2 transition'
        );
      }
      // Special handling for Tutorial 3 - wait for scenario modal to close if one is open
      else if (this.currentTutorial === this.LEARNING_LAB_TUTORIAL) {
        // Check if there's actually a modal open before waiting
        const scenarioModal = document.querySelector('.scenario-modal');
        const preLaunchModal = document.querySelector('.pre-launch-modal');

        if (scenarioModal || preLaunchModal) {
          logger.info(
            'OnboardingTour',
            'Modal detected, waiting for closure before starting Tutorial 3'
          );
          this.waitForModalClosure(() => {
            this.showStep();
          });
        } else {
          logger.info(
            'OnboardingTour',
            'No modal detected, starting Tutorial 3 immediately'
          );
          this.showStep();
        }

        // Reset processing flag after initiating Tutorial 3
        this.isProcessingAction = false;
        logger.debug(
          'OnboardingTour',
          'Processing flag reset for Tutorial 3 transition'
        );
      } else {
        this.showStep();
        // Reset processing flag for normal tutorial progression
        this.isProcessingAction = false;
        logger.debug(
          'OnboardingTour',
          'Processing flag reset for normal tutorial transition'
        );
      }
    } else {
      this.endTour();
      // Reset processing flag after tour ends
      this.isProcessingAction = false;
      logger.debug('OnboardingTour', 'Processing flag reset after tour end');
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
        'option-selected': false,
        'choice-confirmed': false,
        'modal-opened': false,
      };
      logger.info(
        'OnboardingTour',
        `Going back to tutorial ${this.currentTutorial}`
      );
      this.showStep();
    }
  }

  endTour() {
    const STACK_TRACE_LINES = 5;
    logger.info('OnboardingTour', 'Ending tour', {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
      stackTrace: new Error().stack.split('\n').slice(1, STACK_TRACE_LINES),
    });

    // Remove click highlights
    document.querySelectorAll('.onboarding-click-highlight').forEach(el => {
      el.classList.remove('onboarding-click-highlight');
    });

    // Close pre-launch modal if we're finishing Tutorial 3 (Learning Lab)
    if (this.currentTutorial === this.LEARNING_LAB_TUTORIAL) {
      logger.info(
        'OnboardingTour',
        'Closing pre-launch modal after Tutorial 3 completion'
      );

      // Strategy 1: Look specifically for the pre-launch modal's cancel button
      let modalClosed = false;

      // First try to find a visible pre-launch modal and trigger its cancel button
      const visibleModals = document.querySelectorAll(
        '.modal-backdrop[style*="flex"], [id^="modal-"][style*="flex"], .modal-backdrop.show, .modal-backdrop.visible'
      );
      logger.info(
        'OnboardingTour',
        `Found ${visibleModals.length} potentially visible modals`
      );

      for (const modal of visibleModals) {
        const modalTitle = modal.querySelector('.modal-title');
        const isPreLaunchModal =
          modalTitle && modalTitle.textContent.includes('Prepare to Explore');

        logger.info(
          'OnboardingTour',
          `Checking modal: ${modal.id || 'no-id'}, title: ${modalTitle?.textContent || 'no-title'}, isPreLaunch: ${isPreLaunchModal}`
        );

        if (isPreLaunchModal) {
          const cancelButton = modal.querySelector(
            '#cancel-launch, .btn-cancel'
          );
          if (cancelButton) {
            logger.info(
              'OnboardingTour',
              'Found pre-launch modal, triggering cancel button for proper cleanup'
            );
            try {
              cancelButton.click();
              modalClosed = true;
              logger.info(
                'OnboardingTour',
                'Successfully triggered cancel button'
              );
              break;
            } catch (error) {
              logger.error(
                'OnboardingTour',
                'Error clicking cancel button:',
                error
              );
            }
          } else {
            logger.warn(
              'OnboardingTour',
              'Pre-launch modal found but no cancel button'
            );
          }
        }
      }

      // Strategy 2: If no pre-launch modal found, try any visible cancel button
      if (!modalClosed) {
        logger.info(
          'OnboardingTour',
          'No pre-launch modal cancel button found, trying fallback approach'
        );
        const cancelButtons = document.querySelectorAll(
          '#cancel-launch, .btn-cancel'
        );
        logger.info(
          'OnboardingTour',
          `Found ${cancelButtons.length} cancel buttons in DOM`
        );

        cancelButtons.forEach((cancelButton, index) => {
          if (cancelButton && !modalClosed) {
            // Check if this button is in a visible modal
            const modal = cancelButton.closest(
              '.modal-backdrop, [id^="modal-"], #simulation-modal'
            );
            const isVisible =
              modal &&
              (modal.style.display === 'flex' ||
                modal.classList.contains('show') ||
                modal.classList.contains('visible'));

            logger.info(
              'OnboardingTour',
              `Cancel button ${index}: modal=${modal?.id || 'no-modal'}, visible=${isVisible}`
            );

            if (isVisible) {
              logger.info(
                'OnboardingTour',
                'Triggering fallback cancel button click for modal cleanup'
              );
              try {
                cancelButton.click();
                modalClosed = true;
                logger.info(
                  'OnboardingTour',
                  'Successfully triggered fallback cancel button'
                );
              } catch (error) {
                logger.error(
                  'OnboardingTour',
                  'Error clicking fallback cancel button:',
                  error
                );
              }
            }
          }
        });
      }

      // Strategy 3: If no cancel button found, fall back to manual cleanup
      if (!modalClosed) {
        logger.info(
          'OnboardingTour',
          'No accessible cancel button found, using manual cleanup'
        );

        // Use the new ModalUtility cleanup methods to handle orphaned modals
        ModalUtility.cleanupOrphanedModals();

        // First, try to find the modal instance through any available method
        const preLaunchModalElements =
          document.querySelectorAll('[id^="modal-"]');

        preLaunchModalElements.forEach(modalElement => {
          // Check if this looks like a pre-launch modal by checking content
          const modalTitle = modalElement.querySelector('.modal-title');
          if (
            modalTitle &&
            modalTitle.textContent.includes('Prepare to Explore')
          ) {
            // Try to find the close button and click it
            const closeButton = modalElement.querySelector(
              '[data-modal-close], .modal-close, .close-btn'
            );
            if (closeButton) {
              closeButton.click();
              logger.info(
                'OnboardingTour',
                'Closed pre-launch modal via close button after Tutorial 3 completion'
              );
            } else {
              // Use ModalUtility to force destroy
              ModalUtility.destroyModalById(modalElement.id);
              logger.info(
                'OnboardingTour',
                'Force destroyed pre-launch modal after Tutorial 3 completion'
              );
            }
          }
        });

        // Also try the legacy selector approach as fallback
        const preLaunchModal = document.querySelector('.pre-launch-modal');
        if (preLaunchModal) {
          const closeButton = preLaunchModal.querySelector(
            '[data-modal-close], .modal-close, .close-btn'
          );
          if (closeButton) {
            closeButton.click();
            logger.info(
              'OnboardingTour',
              'Closed legacy pre-launch modal after Tutorial 3 completion'
            );
          } else {
            preLaunchModal.remove();
            logger.info(
              'OnboardingTour',
              'Manually removed legacy pre-launch modal after Tutorial 3 completion'
            );
          }
        }
      }

      // Final cleanup using ModalUtility - use aggressive cleanup for Tutorial 3
      // Add a small delay to ensure all DOM operations are complete
      setTimeout(() => {
        logger.info(
          'OnboardingTour',
          'Running final cleanup after tutorial 3 completion'
        );

        // Count modals before cleanup for comparison
        const modalsBefore = document.querySelectorAll(
          '[id^="modal-"], .modal-backdrop, .modal-dialog, .modal-body, #simulation-modal'
        ).length;
        logger.info(
          'OnboardingTour',
          `Modal elements before cleanup: ${modalsBefore}`
        );

        ModalUtility.aggressiveModalCleanup();

        // Also run the standard cleanup as a safety net
        ModalUtility.cleanupOrphanedModals();

        // Count modals after cleanup
        const modalsAfter = document.querySelectorAll(
          '[id^="modal-"], .modal-backdrop, .modal-dialog, .modal-body, #simulation-modal'
        ).length;
        logger.info(
          'OnboardingTour',
          `Modal elements after cleanup: ${modalsAfter} (removed ${modalsBefore - modalsAfter})`
        );

        if (modalsAfter === 0) {
          logger.info(
            'OnboardingTour',
            '✅ All modal elements successfully cleaned up'
          );
        } else {
          logger.warn(
            'OnboardingTour',
            `⚠️ ${modalsAfter} modal elements still remain in DOM`
          );
        }
      }, 100);
    }

    // Track completion
    simpleAnalytics.trackEvent('tour_completed', {
      tutorial: this.currentTutorial,
      step: this.currentStep,
    });

    // Mark as completed
    simpleStorage.set('tour_completed', true);

    // Clean up
    this.removeOverlay();
    this.isActive = false;
  }

  /**
   * Scroll to hero demo section and start Tutorial 2
   */
  scrollToHeroDemoAndStart() {
    logger.info('OnboardingTour', 'scrollToHeroDemoAndStart called', {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
      isActive: this.isActive,
    });

    const heroChart = document.getElementById('hero-ethics-chart');
    if (heroChart) {
      logger.info(
        'OnboardingTour',
        'Hero chart found, scrolling to hero demo for Tutorial 2',
        {
          heroChartRect: heroChart.getBoundingClientRect(),
        }
      );

      // Scroll to the hero demo section
      heroChart.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
        inline: 'center',
      });

      // Wait for scroll animation to complete, then start the tutorial
      setTimeout(() => {
        logger.info(
          'OnboardingTour',
          'Scroll animation complete, ensuring overlay exists before showing step',
          {
            currentTutorial: this.currentTutorial,
            currentStep: this.currentStep,
            isActive: this.isActive,
            overlayExists: !!this.overlay,
            coachMarkExists: !!this.coachMark,
          }
        );

        // Ensure overlay exists before showing step
        if (
          !this.overlay ||
          !this.coachMark ||
          !document.body.contains(this.coachMark)
        ) {
          logger.warn(
            'OnboardingTour',
            'Overlay missing before Tutorial 2, recreating'
          );
          this.createOverlay();
        }

        this.showStep();
      }, this.SCROLL_DURATION);
    } else {
      logger.warn(
        'OnboardingTour',
        'Hero chart element not found, starting Tutorial 2 anyway'
      );

      // Ensure overlay exists even if hero chart not found
      if (
        !this.overlay ||
        !this.coachMark ||
        !document.body.contains(this.coachMark)
      ) {
        logger.warn(
          'OnboardingTour',
          'Overlay missing before Tutorial 2 (no hero chart), recreating'
        );
        this.createOverlay();
      }

      this.showStep();
    }
  }

  announceStep(step) {
    // Create announcement for screen readers
    const announcement = document.createElement('div');
    announcement.setAttribute('aria-live', 'polite');
    announcement.setAttribute('aria-atomic', 'true');
    announcement.className = 'sr-only';
    announcement.textContent = `${step.title}. ${step.content}`;

    document.body.appendChild(announcement);

    // Remove after announcement
    setTimeout(() => {
      announcement.remove();
    }, 1000);
  }

  waitForModalClosure(callback) {
    logger.info('OnboardingTour', 'Starting to wait for modal closure');

    const checkModalClosed = () => {
      // Check for scenario modal and pre-launch modal specifically
      const scenarioModal = document.querySelector('.scenario-modal');
      const preLaunchModal = document.querySelector('.pre-launch-modal');

      // Also check for any other modals that might be open
      const otherModals = document.querySelectorAll(
        '.modal, [class*="modal"]:not(.scenario-modal):not(.pre-launch-modal)'
      );
      const hasOpenModal = Array.from(otherModals).some(modal => {
        const style = getComputedStyle(modal);
        const isVisible =
          style.display !== 'none' && style.visibility !== 'hidden';
        logger.debug('OnboardingTour', 'Other modal check', {
          modal: modal.className,
          isVisible,
        });
        return isVisible;
      });

      logger.info('OnboardingTour', 'Checking modal status', {
        scenarioModal: !!scenarioModal,
        preLaunchModal: !!preLaunchModal,
        hasOtherOpenModal: hasOpenModal,
        scenarioModalClass: scenarioModal?.className,
        preLaunchModalClass: preLaunchModal?.className,
      });

      if (!scenarioModal && !preLaunchModal && !hasOpenModal) {
        // All modals are closed, wait a bit for animations then proceed
        logger.info(
          'OnboardingTour',
          'All modals closed, proceeding with step after animation delay'
        );
        setTimeout(callback, this.ANIMATION_DURATION);
      } else {
        // Modal still exists, check again
        logger.debug(
          'OnboardingTour',
          `Modal still open, checking again in ${this.MODAL_CHECK_DELAY}ms`
        );
        setTimeout(checkModalClosed, this.MODAL_CHECK_DELAY);
      }
    };

    checkModalClosed();
  }

  waitForAccordionOpen(callback) {
    const checkAccordionOpen = () => {
      // Check for the option details that are now visible (not display: none)
      const optionDetails = document.querySelector('.option-details');

      if (
        optionDetails &&
        optionDetails.offsetHeight > 0 &&
        getComputedStyle(optionDetails).display !== 'none'
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
    simpleStorage.remove('tour_completed');
    simpleStorage.remove('has_visited');
    logger.info('OnboardingTour', 'Tour progress reset');
  }

  /**
   * Debug method to force start tour from step 1
   */
  debugForceStartFromStep1() {
    logger.warn('OnboardingTour', '🐛 DEBUG: Force starting tour from step 1');

    if (this.isActive) {
      this.finishTour();
    }

    this.currentStep = 0;
    this.currentTutorial = 1;
    this.isActive = false;

    // Reset user states
    this.userStates = {
      'option-selected': false,
      'choice-confirmed': false,
      'modal-opened': false,
    };

    this.startTour(1);
  }

  // Content observer for dynamic content changes (typewriter effects, etc.)
  setupContentObserver(targetElement, step) {
    if (this.contentObserver) {
      this.contentObserver.disconnect();
    }

    this.contentObserver = new MutationObserver(mutations => {
      // Skip updates during transitions to prevent excessive repositioning
      if (this.isTransitioning) {
        return;
      }

      let shouldUpdate = false;

      mutations.forEach(mutation => {
        if (
          mutation.type === 'childList' ||
          mutation.type === 'characterData'
        ) {
          shouldUpdate = true;
        }
        // Also check for attribute changes that might affect size
        if (
          mutation.type === 'attributes' &&
          (mutation.attributeName === 'style' ||
            mutation.attributeName === 'class')
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
              'OnboardingTour',
              `Updating coach mark position due to content change in step ${step.id}`
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
      attributeFilter: ['style', 'class'],
    });

    logger.debug(
      'OnboardingTour',
      `Content observer set up for step ${step.id}`
    );
  }

  // Scroll within modal content instead of main page
  scrollToElementInModal(targetElement, step) {
    const modal = targetElement.closest(
      '.scenario-modal, .scenario-modal-dialog, .modal-dialog'
    );

    if (modal) {
      const modalBody = modal.querySelector(
        '.scenario-content, .modal-body, .modal-content'
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
          'OnboardingTour',
          `Scrolling modal to element for step ${step.id}`,
          {
            elementTop: elementRect.top,
            modalTop: modalRect.top,
            currentScroll: currentScrollTop,
            targetScroll: targetScrollTop,
          }
        );

        modalBody.scrollTo({
          top: targetScrollTop,
          behavior: 'smooth',
        });

        return true;
      }
    }

    return false; // Not in a modal or modal body not found
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
      'OnboardingTour',
      'No onboarding tour instance available. Please initialize through app.js first.'
    );
    logger.warn(
      'OnboardingTour',
      '⚠️ Cannot create OnboardingTour instance directly - must be initialized through app.js to prevent multiple instances'
    );
  }
};

window.debugShowTourState = function () {
  if (window.onboardingTourInstance) {
    logger.info('OnboardingTour', 'Tour State:', {
      instanceId: window.onboardingTourInstance.instanceId,
      isActive: window.onboardingTourInstance.isActive,
      currentTutorial: window.onboardingTourInstance.currentTutorial,
      currentStep: window.onboardingTourInstance.currentStep,
      userStates: window.onboardingTourInstance.userStates,
    });
  } else {
    logger.warn('OnboardingTour', 'No onboarding tour instance available');
  }
};
