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
import { simpleStorage } from '../utils/simple-storage.js';
import { simpleAnalytics } from '../utils/simple-analytics.js';

class OnboardingTour {
  static instanceCount = 0;
  
  constructor() {
    OnboardingTour.instanceCount++;
    this.instanceId = OnboardingTour.instanceCount;
    
    const STACK_TRACE_LINES = 5;
    logger.warn('OnboardingTour', `🏗️ NEW INSTANCE CREATED #${this.instanceId}`, {
      totalInstances: OnboardingTour.instanceCount,
      stackTrace: new Error().stack.split('\n').slice(1, STACK_TRACE_LINES)
    });
    
    this.currentStep = 0;
    this.currentTutorial = 1;
    this.isActive = false;
    this.isTransitioning = false; // Prevent race conditions in step transitions
    this.coachMark = null;
    this.overlay = null;
    this.spotlight = null;
    
    // User interaction states
    this.userStates = {
      'option-selected': false,
      'choice-confirmed': false,
      'modal-opened': false
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
    this.MANUAL_SCROLL_RESET_DELAY = 2000; // ms to reset manual scroll flag
    this.LEARNING_LAB_TUTORIAL = 3; // Tutorial number for Learning Lab
    this.ACCORDION_CHECK_DELAY = 200; // ms to wait before checking accordion state
    this.MODAL_CHECK_DELAY = 200; // ms between modal closure checks
    this.DEBUG_TEXT_LENGTH = 20; // chars to show in debug logs
    this.TUTORIAL_3_STEP_3_INDEX = 2; // 0-indexed step number for step 3
    this.CLICK_TIMEOUT = 10000; // ms to wait for user click before fallback
    
    // Tutorial steps configuration
    this.tutorials = {
      1: { // Test Scenario Tutorial
        name: 'test-scenario',
        title: 'Test Scenario Tutorial',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to SimulateAI! 🤖',
            content: 'A Digital Learning Lab where you journey into the ethical frontiers of AI and Robotics. This tour will guide you through our interactive platform.',
            buttons: [
              { text: 'Continue Tour', action: 'continue', primary: true },
              { text: 'Start Exploring', action: 'finish', primary: false }
            ],
            target: null,
            position: 'center',
            autoScroll: false
          },
          {
            id: 'launch-test',
            title: 'Launch Test Scenario',
            content: 'Click this button to open an interactive ethics simulation and see how moral dilemmas are presented.',
            target: '#test-scenario-modal',
            position: 'bottom',
            action: 'wait-for-click',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'dilemma-section',
            title: 'The Dilemma Section',
            content: 'This section presents the ethical scenario. Read carefully to understand the situation and its complexities.',
            target: '.dilemma-text',
            position: 'right',
            waitFor: 'scenario-modal',
            autoScroll: true
          },
          {
            id: 'ethical-question',
            title: 'Ethical Question',
            content: 'This highlights the core ethical consideration. What values are at stake in this scenario?',
            target: '.ethical-question',
            position: 'right',
            autoScroll: true
          },
          {
            id: 'choose-approach',
            title: 'Choose Your Approach',
            content: 'Each approach represents a different ethical framework. Please click the <strong>first option</strong> to continue the tutorial and see how the analysis works!',
            target: '.options-container',
            position: 'left',
            action: 'wait-for-option-selection',
            highlightClick: true,
            autoScroll: true,
            waitFor: '.options-container'
          },
          {
            id: 'pros-cons',
            title: 'Pros and Cons Analysis',
            content: 'Perfect! The details expanded to show the analysis. Every ethical choice has trade-offs - these help you understand the implications.',
            target: '.option-details',
            position: 'left',
            autoScroll: true,
            waitFor: '.option-details',
            skipUntil: 'option-selected'
          },
          {
            id: 'radar-chart-preview',
            title: 'Radar Chart Visualization',
            content: 'This radar chart shows how your choice impacts different ethical dimensions. The chart updates based on your selection - we\'ll explore this in detail in Tutorial 2!',
            target: '#scenario-radar-chart',
            position: 'left',
            autoScroll: true,
            waitFor: 'option-selected'
          },
          {
            id: 'confirm-choice',
            title: 'Confirm Your Decision',
            content: 'When ready, confirm your choice. Remember - there\'s no "wrong" answer in ethics exploration!',
            target: '#confirm-choice',
            position: 'left',
            action: 'wait-for-confirm',
            highlightClick: true,
            autoScroll: true,
            waitFor: 'option-selected'
          },
          {
            id: 'tutorial-complete',
            title: 'Congratulations! 🎉',
            content: 'Excellent work! You\'ve successfully completed your first ethical scenario exploration. You\'ve learned how to navigate complex moral dilemmas, analyze different approaches, and understand the ethical implications through our interactive tools.<br><br>Would you like to continue with Tutorial 2 to explore the radar chart visualization in more detail?',
            buttons: [
              { text: '📊 Continue to Tutorial 2', action: 'next-tutorial', primary: true },
              { text: 'Start Exploring', action: 'finish', primary: false }
            ],
            target: null,
            position: 'center',
            autoScroll: false,
            skipUntil: 'choice-confirmed'
          }
        ]
      },
      2: { // Hero Demo Tutorial
        name: 'hero-demo',
        title: 'Hero Demo Tutorial',
        steps: [
          {
            id: 'hero-demo-chart',
            title: 'Interactive Radar Chart',
            content: 'This is our Hero Demo radar chart. It shows how different choices impact ethical dimensions in real-time.',
            target: '#hero-ethics-chart',
            position: 'bottom',
            autoScroll: true
          },
          {
            id: 'ethical-dimensions',
            title: 'Ethical Dimensions',
            content: 'The chart has 8 key dimensions that represent core ethical principles. Each axis shows how decisions impact different aspects of AI ethics.',
            target: '#hero-ethics-chart',
            position: 'bottom',
            autoScroll: false
          },
          {
            id: 'interactive-controls',
            title: 'Try the Controls',
            content: 'Use these buttons to see how different scenarios affect the ethical dimensions. Watch the chart change in real-time!',
            target: '.demo-controls-grid',
            position: 'bottom',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'how-to-read',
            title: 'How to Read Charts',
            content: 'Click this accordion to learn about interpreting the visual data and understanding the ethical implications.',
            target: '.radar-instructions-accordion',
            position: 'bottom',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'glossary',
            title: 'Ethical Dimensions Glossary',
            content: 'Click this accordion to explore detailed definitions of each ethical principle used in our simulations.',
            target: '.ethics-glossary-accordion',
            position: 'bottom',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'radar-tutorial-complete',
            title: 'Radar Chart Mastery! 📊',
            content: 'Excellent! You now understand how to interpret ethical impacts visually. Ready to explore the Learning Lab?',
            buttons: [
              { text: '🧪 Learning Lab Tutorial', action: 'next-tutorial', primary: true },
              { text: 'Start Exploring', action: 'finish', primary: false }
            ],
            target: null,
            position: 'center',
            autoScroll: false
          }
        ]
      },
      3: { // Learning Lab Pre-Launch Modal Tutorial
        name: 'learning-lab',
        title: 'Learning Lab Tutorial',
        steps: [
          {
            id: 'find-trolley-problem',
            title: 'Find the Trolley Problem',
            content: 'Let\'s explore the Learning Lab! We\'ll automatically scroll to the first scenario in "The Trolley Problem" category.',
            target: '#category-trolley-problem > div.scenarios-grid > article:nth-child(1)',
            position: 'bottom',
            autoScroll: true
          },
          {
            id: 'click-learning-lab',
            title: 'Open Learning Lab',
            content: 'Perfect! Now click the "Learning Lab" button on this Trolley Problem scenario card to open the pre-launch modal.',
            target: '#category-trolley-problem > div.scenarios-grid > article:nth-child(1) > div.scenario-footer > button.scenario-start-btn',
            position: 'bottom',
            action: 'wait-for-click',
            autoScroll: true,
            highlightClick: true,
            waitFor: '#category-trolley-problem > div.scenarios-grid > article:nth-child(1)'
          },
          {
            id: 'overview-tab',
            title: 'Overview Tab',
            content: 'This Overview tab provides a comprehensive introduction to the scenario, including the ethical dilemma, key stakeholders, and real-world context. Click "Next" to continue exploring the other tabs.',
            target: '.tab-overview, [data-tab="overview"], .overview-tab',
            position: 'right',
            waitFor: 'pre-launch-modal',
            autoScroll: true
          },
          {
            id: 'learning-goals-tab',
            title: 'Learning Goals Tab',
            content: 'The Learning Goals tab outlines what you\'ll discover and understand by completing this simulation, including key ethical principles and decision-making frameworks.',
            target: '.tab-learning-goals, [data-tab="learning-goals"], .learning-goals-tab',
            position: 'right',
            autoScroll: true
          },
          {
            id: 'ethics-guide-tab',
            title: 'Ethics Guide Tab',
            content: 'The Ethics Guide provides essential background on moral frameworks, philosophical approaches, and ethical theories relevant to this scenario.',
            target: '.tab-ethics-guide, [data-tab="ethics-guide"], .ethics-guide-tab',
            position: 'right',
            autoScroll: true
          },
          {
            id: 'get-ready-tab',
            title: 'Get Ready Tab',
            content: 'Get Ready helps you prepare for the simulation with pre-activity questions, reflection prompts, and scenario setup information.',
            target: '.tab-get-ready, [data-tab="get-ready"], .get-ready-tab',
            position: 'right',
            autoScroll: true
          },
          {
            id: 'resources-tab',
            title: 'Resources Tab',
            content: 'The Resources tab contains supplementary materials, research papers, case studies, and additional reading to deepen your understanding.',
            target: '.tab-resources, [data-tab="resources"], .resources-tab',
            position: 'right',
            autoScroll: true
          },
          {
            id: 'for-educators-tab',
            title: 'For Educators Tab',
            content: 'For Educators provides teaching guides, discussion questions, assessment rubrics, and classroom integration strategies for instructors.',
            target: '.tab-educators, [data-tab="educators"], .for-educators-tab',
            position: 'right',
            autoScroll: true
          },
          {
            id: 'tutorial-complete',
            title: 'Mission Accomplished! 🎉🤖',
            content: 'You\'ve completed the tutorial and unlocked the tools to navigate the ethical terrain of intelligent machines. Ready to begin your journey?',
            buttons: [
              { text: '🚀 Start Exploring', action: 'finish', primary: true }
            ],
            target: null,
            position: 'center',
            autoScroll: false
          }
        ]
      }
    };

    this.init();
  }

  init() {
    logger.info('OnboardingTour', 'Initializing onboarding coach marks system');
    
    // Don't auto-start - let the app control when the tour starts
    logger.debug('OnboardingTour', 'OnboardingTour initialized, waiting for manual start');
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
    logger.info('OnboardingTour', `🚀 Starting onboarding tour ${tutorialNumber}`, {
      instanceId: this.instanceId,
      tutorialNumber,
      isActive: this.isActive
    });
    
    if (this.isActive) {
      logger.warn('OnboardingTour', 'Tour already active, ignoring start request');
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
      'modal-opened': false
    };

    logger.info('OnboardingTour', `Starting tutorial ${tutorialNumber}`, {
      currentStep: this.currentStep,
      totalSteps: this.tutorials[tutorialNumber]?.steps?.length || 0
    });

    // Track analytics
    simpleAnalytics.trackEvent('tour_started', {
      tutorial: tutorialNumber
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
      existingOverlays: document.querySelectorAll('.onboarding-overlay').length
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
    if (this.currentTutorial === this.TUTORIAL_3 && this.currentStep === this.TUTORIAL_3_STEP_3_INDEX) {
      this.coachMark.style.zIndex = '10020';
      this.coachMark.style.isolation = 'isolate';
      this.coachMark.style.position = 'fixed';
      logger.warn('OnboardingTour', 'TUTORIAL 3 STEP 3 - Applied aggressive stacking', {
        zIndex: this.coachMark.style.zIndex,
        position: getComputedStyle(this.coachMark).position,
        isolation: this.coachMark.style.isolation
      });
    }
    
    logger.debug('OnboardingTour', 'Overlay elements created and appended', {
      overlayInDom: !!document.querySelector('.onboarding-overlay'),
      totalOverlays: document.querySelectorAll('.onboarding-overlay').length,
      coachMarkInDom: !!document.querySelector('.onboarding-coach-mark')
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
          modalId: backdrop.id
        });
      }
    });
  }

  removeOverlay() {
    logger.debug('OnboardingTour', 'Removing overlay elements', {
      hasOverlay: !!this.overlay,
      hasSpotlight: !!this.spotlight,
      hasCoachMark: !!this.coachMark,
      totalOverlaysInDom: document.querySelectorAll('.onboarding-overlay').length
    });

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
    const orphanedSpotlights = document.querySelectorAll('.onboarding-spotlight');
    const orphanedCoachMarks = document.querySelectorAll('.onboarding-coach-mark');
    
    if (orphanedOverlays.length > 0 || orphanedSpotlights.length > 0 || orphanedCoachMarks.length > 0) {
      logger.warn('OnboardingTour', 'Found orphaned elements, cleaning up', {
        overlays: orphanedOverlays.length,
        spotlights: orphanedSpotlights.length,
        coachMarks: orphanedCoachMarks.length
      });
      
      orphanedOverlays.forEach(el => el.remove());
      orphanedSpotlights.forEach(el => el.remove());
      orphanedCoachMarks.forEach(el => el.remove());
    }

    document.body.classList.remove('onboarding-active');
    
    logger.debug('OnboardingTour', 'Overlay cleanup complete', {
      totalOverlaysInDom: document.querySelectorAll('.onboarding-overlay').length
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

  scrollToElement(element, offset = this.SCROLL_OFFSET) {
    if (!element) return Promise.resolve();

    // Check if element is inside a modal
    const modalContainer = element.closest('.scenario-modal, .pre-launch-modal, .modal, [role="dialog"]');
    
    if (modalContainer) {
      // Scroll within the modal container
      return this.scrollWithinModal(element, modalContainer, offset);
    } else {
      // Scroll the main window
      return this.scrollMainWindow(element, offset);
    }
  }

  scrollWithinModal(element, modalContainer, offset = this.SCROLL_OFFSET) {
    const modalScrollContainer = modalContainer.querySelector('.modal-content, .scenario-content, .modal-body') || modalContainer;
    
    const elementRect = element.getBoundingClientRect();
    const containerRect = modalScrollContainer.getBoundingClientRect();
    const currentScrollTop = modalScrollContainer.scrollTop;
    
    // Calculate relative position within the modal
    const elementTopInModal = (elementRect.top - containerRect.top) + currentScrollTop;
    const targetScrollTop = Math.max(0, elementTopInModal - offset);

    return new Promise((resolve) => {
      const startScrollTop = currentScrollTop;
      const distance = targetScrollTop - startScrollTop;
      const duration = this.SCROLL_DURATION;
      let startTime = null;

      if (Math.abs(distance) < this.MIN_SCROLL_DISTANCE) {
        resolve();
        return;
      }

      this.isAutoScrolling = true; // Set flag before animation starts

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Ease-in-out function
        const ease = progress < this.EASE_MIDPOINT 
          ? 2 * progress * progress 
          : -1 + (this.EASE_MULTIPLIER - 2 * progress) * progress;

        modalScrollContainer.scrollTop = startScrollTop + distance * ease;

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          this.isAutoScrolling = false; // Clear flag when animation completes
          resolve();
        }
      };

      requestAnimationFrame(animation);
    });
  }

  scrollMainWindow(element, offset = this.SCROLL_OFFSET) {
    const elementRect = element.getBoundingClientRect();
    const absoluteElementTop = elementRect.top + window.pageYOffset;
    const targetScrollTop = Math.max(0, absoluteElementTop - offset);

    return new Promise((resolve) => {
      const startScrollTop = window.pageYOffset;
      const distance = targetScrollTop - startScrollTop;
      const duration = this.SCROLL_DURATION;
      let startTime = null;

      if (Math.abs(distance) < this.MIN_SCROLL_DISTANCE) {
        resolve();
        return;
      }

      this.isAutoScrolling = true; // Set flag before animation starts

      const animation = (currentTime) => {
        if (startTime === null) startTime = currentTime;
        const timeElapsed = currentTime - startTime;
        const progress = Math.min(timeElapsed / duration, 1);

        // Ease-in-out function
        const ease = progress < this.EASE_MIDPOINT 
          ? 2 * progress * progress 
          : -1 + (this.EASE_MULTIPLIER - 2 * progress) * progress;

        window.scrollTo(0, startScrollTop + distance * ease);

        if (progress < 1) {
          requestAnimationFrame(animation);
        } else {
          this.isAutoScrolling = false; // Clear flag when animation completes
          resolve();
        }
      };

      requestAnimationFrame(animation);
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

  positionCoachMark(targetElement, position = 'bottom', step = null) {
    if (!this.coachMark) return;

    // SIMPLIFIED AND ROBUST POSITIONING LOGIC
    // Always position relative to viewport to ensure visibility
    
    // Get coach mark dimensions after content is set
    this.coachMark.style.visibility = 'hidden';
    this.coachMark.style.display = 'block';
    this.coachMark.style.position = 'fixed'; // Use fixed positioning for consistent behavior
    this.coachMark.style.zIndex = '10014';
    
    const coachMarkRect = this.coachMark.getBoundingClientRect();
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const spacing = 20; // Fixed spacing
    
    let left, top;

    if (targetElement) {
      // Get target position relative to viewport (fixed positioning)
      const targetRect = targetElement.getBoundingClientRect();
      
      // Ensure target is visible in viewport before positioning
      if (targetRect.bottom < 0 || targetRect.top > viewportHeight || 
          targetRect.right < 0 || targetRect.left > viewportWidth) {
        // Target is outside viewport, scroll it into view
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center', 
          inline: 'center' 
        });
        // Wait for scroll to complete
        setTimeout(() => {
          this.positionCoachMark(targetElement, position, step);
        }, this.ANIMATION_DURATION);
        return;
      }
      
      // Calculate initial position based on preferred direction
      switch (position) {
        case 'top':
          left = targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2);
          top = targetRect.top - coachMarkRect.height - spacing;
          break;
        case 'bottom':
          left = targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2);
          top = targetRect.bottom + spacing;
          break;
        case 'left':
          left = targetRect.left - coachMarkRect.width - spacing;
          top = targetRect.top + (targetRect.height / 2) - (coachMarkRect.height / 2);
          break;
        case 'right':
          left = targetRect.right + spacing;
          top = targetRect.top + (targetRect.height / 2) - (coachMarkRect.height / 2);
          break;
        default: // Default to bottom
          left = targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2);
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
      
      // Special handling for interactive elements - avoid covering target
      if (step && step.highlightClick) {
        // If positioned over target, try alternative positions
        if (left < targetRect.right && left + coachMarkRect.width > targetRect.left &&
            top < targetRect.bottom && top + coachMarkRect.height > targetRect.top) {
          
          // Try positioning to the right
          if (targetRect.right + coachMarkRect.width + spacing <= viewportWidth) {
            left = targetRect.right + spacing;
            top = Math.max(minTop, Math.min(targetRect.top, maxTop));
          }
          // Try positioning to the left
          else if (targetRect.left - coachMarkRect.width - spacing >= 0) {
            left = targetRect.left - coachMarkRect.width - spacing;
            top = Math.max(minTop, Math.min(targetRect.top, maxTop));
          }
          // Try positioning below
          else if (targetRect.bottom + coachMarkRect.height + spacing <= viewportHeight) {
            left = Math.max(minLeft, Math.min(targetRect.left, maxLeft));
            top = targetRect.bottom + spacing;
          }
          // Try positioning above
          else if (targetRect.top - coachMarkRect.height - spacing >= 0) {
            left = Math.max(minLeft, Math.min(targetRect.left, maxLeft));
            top = targetRect.top - coachMarkRect.height - spacing;
          }
        }
      }
      
      logger.debug('OnboardingTour', 'Coach mark positioned relative to target', {
        stepId: step?.id,
        targetRect: { x: targetRect.left, y: targetRect.top, w: targetRect.width, h: targetRect.height },
        coachMarkPos: { left, top },
        position
      });
      
    } else {
      // Center on viewport for steps without targets
      left = (viewportWidth / 2) - (coachMarkRect.width / 2);
      top = (viewportHeight / 2) - (coachMarkRect.height / 2);
      
      logger.debug('OnboardingTour', 'Coach mark centered in viewport', {
        stepId: step?.id,
        coachMarkPos: { left, top }
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
    const isVisible = finalRect.width > 0 && finalRect.height > 0 &&
                     finalRect.left >= 0 && finalRect.top >= 0 &&
                     finalRect.right <= viewportWidth && finalRect.bottom <= viewportHeight;
    
    if (!isVisible) {
      logger.warn('OnboardingTour', 'Coach mark may not be fully visible, adjusting', {
        stepId: step?.id,
        finalRect: { x: finalRect.left, y: finalRect.top, w: finalRect.width, h: finalRect.height },
        viewport: { w: viewportWidth, h: viewportHeight }
      });
      
      // Emergency fallback: center in viewport
      this.coachMark.style.left = `${(viewportWidth / 2) - (coachMarkRect.width / 2)}px`;
      this.coachMark.style.top = `${(viewportHeight / 2) - (coachMarkRect.height / 2)}px`;
    }
    
    logger.info('OnboardingTour', `Coach mark positioned for step ${step?.id || 'unknown'}`, {
      finalPosition: { left: this.coachMark.style.left, top: this.coachMark.style.top },
      isVisible
    });
  }

  async showStep() {
    const tutorial = this.tutorials[this.currentTutorial];
    const step = tutorial.steps[this.currentStep];
    
    if (!step) {
      logger.error('OnboardingTour', 'No step found', {
        currentTutorial: this.currentTutorial,
        currentStep: this.currentStep,
        totalSteps: tutorial?.steps?.length
      });
      return;
    }

    logger.info('OnboardingTour', `🚀 Starting step ${this.currentStep + 1}: ${step.id}`, {
      currentTutorial: this.currentTutorial,
      currentStep: this.currentStep,
      stepId: step.id,
      totalSteps: tutorial.steps.length
    });

    // SIMPLIFIED STEP RENDERING - Removed complex conditions that could cause skipping
    
    // Find target element if specified
    const targetElement = step.target ? document.querySelector(step.target) : null;
    
    if (step.target && !targetElement) {
      logger.warn('OnboardingTour', `Target element not found: ${step.target}`, {
        stepId: step.id,
        selector: step.target
      });
    }

    // Auto-scroll to target if needed and element exists
    if (step.autoScroll && targetElement) {
      // Check if target is in viewport
      const rect = targetElement.getBoundingClientRect();
      const isInViewport = rect.top >= 0 && rect.bottom <= window.innerHeight;
      
      if (!isInViewport) {
        logger.info('OnboardingTour', `Scrolling to bring target into view for step ${step.id}`);
        targetElement.scrollIntoView({ 
          behavior: 'smooth', 
          block: 'center',
          inline: 'center'
        });
        // Wait for scroll animation
        await new Promise(resolve => setTimeout(resolve, this.SCROLL_DURATION));
      }
    }

    // Position spotlight
    if (targetElement) {
      this.positionSpotlight(targetElement);
    } else if (this.spotlight) {
      this.spotlight.style.display = 'none';
    }

    // Create coach mark content
    this.coachMark.innerHTML = this.createCoachMarkContent(step, tutorial);
    
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
    
    // Add click highlighting if needed
    if (step.highlightClick && targetElement) {
      targetElement.classList.add('onboarding-click-highlight');
    }

    // Set up action handling
    if (step.action === 'wait-for-click' && targetElement) {
      this.waitForElementClick(targetElement, step);
    }

    logger.info('OnboardingTour', `✅ Step ${step.id} rendered successfully`, {
      hasTarget: !!targetElement,
      targetInViewport: targetElement ? this.isElementInViewport(targetElement) : false,
      coachMarkVisible: this.coachMark.style.visibility === 'visible',
      coachMarkPosition: { 
        left: this.coachMark.style.left, 
        top: this.coachMark.style.top 
      }
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
              ${tutorial.steps.map((_, index) => 
                `<div class="step-dot ${index === this.currentStep ? 'active' : index < this.currentStep ? 'completed' : ''}"></div>`
              ).join('')}
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
      return step.buttons.map(button => 
        `<button class="coach-mark-btn ${button.primary ? 'primary' : 'secondary'}" 
                 data-action="${button.action}" 
                 type="button">
          ${button.text}
         </button>`
      ).join('');
    }

    // Default buttons for steps without custom buttons
    const isFirstStep = this.currentStep === 0;
    const isLastStep = this.currentStep === this.tutorials[this.currentTutorial].steps.length - 1;
    const isLastTutorial = this.currentTutorial === Object.keys(this.tutorials).length;
    const hasUserAction = step.action && (step.action === 'wait-for-click' || step.action === 'wait-for-option-selection' || step.action === 'wait-for-confirm');
    
    logger.debug('OnboardingTour', 'Creating buttons', {
      stepId: step.id,
      tutorial: this.currentTutorial,
      step: this.currentStep,
      isFirstStep,
      isLastStep,
      isLastTutorial,
      hasUserAction,
      stepAction: step.action
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
    
    logger.debug('OnboardingTour', 'Buttons created', { buttons: buttons.length > 0 ? 'yes' : 'no' });
    
    return buttons;
  }

  setupEventListeners(step) {
    if (!this.coachMark) {
      logger.warn('OnboardingTour', 'No coach mark element found for event listeners');
      return;
    }

    logger.debug('OnboardingTour', 'Setting up event listeners for step', {
      stepId: step.id,
      buttons: this.coachMark.querySelectorAll('.coach-mark-btn').length
    });

    // Set up click handlers for coach mark buttons
    this.coachMark.addEventListener('click', (e) => {
      logger.info('OnboardingTour', 'Coach mark clicked', {
        target: e.target.tagName,
        className: e.target.className,
        textContent: e.target.textContent,
        dataset: e.target.dataset
      });
      
      if (e.target.classList.contains('coach-mark-btn')) {
        const { action } = e.target.dataset;
        
        if (action) {
          e.preventDefault();
          e.stopPropagation();
          
          logger.info('OnboardingTour', `Button clicked with action: ${action}`, {
            tutorial: this.currentTutorial,
            step: this.currentStep,
            stepId: step.id
          });
          
          this.handleAction(action);
        } else {
          logger.warn('OnboardingTour', 'Button clicked but no action found', {
            target: e.target,
            dataset: e.target.dataset
          });
        }
      }
      
      if (e.target.classList.contains('coach-mark-close')) {
        e.preventDefault();
        e.stopPropagation();
        logger.info('OnboardingTour', 'Close button clicked');
        this.endTour();
      }
    });

    // Keyboard navigation
    this.coachMark.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.endTour();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('coach-mark-btn')) {
          e.preventDefault();
          e.target.click();
        }
      }
    });

    // Focus management - focus first button
    const firstButton = this.coachMark.querySelector('.coach-mark-btn');
    if (firstButton) {
      const FOCUS_DELAY = 100; // ms - Small delay to ensure coach mark is positioned
      setTimeout(() => {
        firstButton.focus();
      }, FOCUS_DELAY);
    }

    logger.debug('OnboardingTour', 'Event listeners set up successfully', {
      stepId: step.id,
      hasFirstButton: !!firstButton
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
      case 'wait-for-confirm':
        this.waitForConfirm();
        break;
    }
  }

  waitForElementClick(targetElement) {
    if (!targetElement) {
      logger.warn('OnboardingTour', 'waitForElementClick: No target element provided');
      return;
    }

    logger.debug('OnboardingTour', 'Setting up click listener', {
      targetTag: targetElement.tagName,
      targetClass: targetElement.className,
      tutorial: this.currentTutorial,
      step: this.currentStep
    });

    const clickHandler = (event) => {
      logger.info('OnboardingTour', 'Target element clicked, advancing step', {
        tutorial: this.currentTutorial,
        step: this.currentStep,
        eventTarget: event.target.tagName
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
      const modalAppeared = document.querySelector('.pre-launch-modal, .reusable-modal');
      if (modalAppeared) {
        logger.info('OnboardingTour', 'Modal appeared without tracked click, advancing step', {
          tutorial: this.currentTutorial,
          step: this.currentStep
        });
        targetElement.removeEventListener('click', clickHandler);
        this.nextStep();
      } else {
        logger.warn('OnboardingTour', 'Timeout waiting for click, but no modal appeared', {
          tutorial: this.currentTutorial,
          step: this.currentStep
        });
      }
    }, this.CLICK_TIMEOUT);
    
    // Also log if the target element exists and is visible
    logger.debug('OnboardingTour', 'Click listener added to target', {
      elementExists: !!targetElement,
      elementVisible: targetElement.offsetParent !== null,
      elementRect: targetElement.getBoundingClientRect()
    });
  }

  waitForOptionSelection() {
    const optionHandler = (event) => {
      // Check if an option card was clicked
      if (event.target.closest('.option-card')) {
        this.userStates['option-selected'] = true;
        document.removeEventListener('click', optionHandler);
        
        // Wait for option details to appear before advancing
        this.waitForAccordionOpen(() => {
          setTimeout(() => this.nextStep(), this.ANIMATION_DURATION);
        });
      }
    };

    document.addEventListener('click', optionHandler);
  }

  waitForConfirm() {
    const confirmHandler = (event) => {
      // Check if confirm button was clicked
      if (event.target.closest('#confirm-choice, .confirm-button, [data-confirm]')) {
        this.userStates['choice-confirmed'] = true;
        document.removeEventListener('click', confirmHandler);
        
        // Listen for the scenario modal closed event
        logger.info('OnboardingTour', 'Choice confirmed, waiting for scenario-modal-closed event');
        
        const modalClosedHandler = (_event) => {
          logger.info('OnboardingTour', 'Received scenario-modal-closed event, advancing to next step');
          document.removeEventListener('scenario-modal-closed', modalClosedHandler);
          setTimeout(() => this.nextStep(), this.ANIMATION_DURATION);
        };
        
        document.addEventListener('scenario-modal-closed', modalClosedHandler);
      }
    };

    document.addEventListener('click', confirmHandler);
  }

  waitForCondition(condition, callback) {
    const checkCondition = () => {
      let conditionMet = false;
      
      switch (condition) {
        case 'scenario-modal':
          conditionMet = document.querySelector('.scenario-modal-dialog') !== null;
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
        setTimeout(checkCondition, 100);
      }
    };

    checkCondition();
  }

  handleAction(action) {
    logger.info('OnboardingTour', `Handling action: ${action}`, { 
      currentTutorial: this.currentTutorial, 
      currentStep: this.currentStep 
    });
    
    switch (action) {
      case 'continue':
        this.nextStep();
        break;
      case 'back':
        this.previousStep();
        break;
      case 'next-tutorial':
        this.nextTutorial();
        break;
      case 'finish':
      case 'skip':
        this.endTour();
        break;
      default:
        logger.warn('OnboardingTour', `Unknown action: ${action}`);
    }
  }

  nextStep() {
    // Prevent race conditions - don't process if already transitioning
    if (this.isTransitioning) {
      logger.debug('OnboardingTour', 'Step transition already in progress, ignoring');
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
      currentStepId: tutorial.steps[this.currentStep]?.id
    });
    
    if (this.currentStep < tutorial.steps.length - 1) {
      this.currentStep++;
      logger.info('OnboardingTour', `Advanced to step ${this.currentStep + 1}`, {
        newStepId: tutorial.steps[this.currentStep]?.id
      });
      
      // Small delay to ensure clean transition
      const TRANSITION_DELAY = 50; // ms
      setTimeout(() => {
        this.isTransitioning = false;
        this.showStep();
      }, TRANSITION_DELAY);
    } else {
      logger.info('OnboardingTour', 'Tutorial complete, moving to next tutorial');
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
    if (step && step.action === 'wait-for-confirm') {
      this.userStates['choice-confirmed'] = false;
    }
  }

  nextTutorial() {
    // Track tutorial completion
    simpleAnalytics.trackEvent('tour_tutorial_completed', {
      tutorial: this.currentTutorial
    });

    const totalTutorials = Object.keys(this.tutorials).length;
    if (this.currentTutorial < totalTutorials) {
      this.currentTutorial++;
      this.currentStep = 0;
      // Reset user states for new tutorial
      this.userStates = {
        'option-selected': false,
        'choice-confirmed': false,
        'modal-opened': false
      };
      logger.info('OnboardingTour', `Starting tutorial ${this.currentTutorial}`);
      
      // Special handling for Tutorial 3 - wait for scenario modal to close if one is open
      if (this.currentTutorial === this.LEARNING_LAB_TUTORIAL) {
        // Check if there's actually a modal open before waiting
        const scenarioModal = document.querySelector('.scenario-modal');
        const preLaunchModal = document.querySelector('.pre-launch-modal');
        
        if (scenarioModal || preLaunchModal) {
          logger.info('OnboardingTour', 'Modal detected, waiting for closure before starting Tutorial 3');
          this.waitForModalClosure(() => {
            this.showStep();
          });
        } else {
          logger.info('OnboardingTour', 'No modal detected, starting Tutorial 3 immediately');
          this.showStep();
        }
      } else {
        this.showStep();
      }
    } else {
      this.endTour();
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
        'modal-opened': false
      };
      logger.info('OnboardingTour', `Going back to tutorial ${this.currentTutorial}`);
      this.showStep();
    }
  }

  endTour() {
    logger.info('OnboardingTour', 'Ending tour');

    // Remove click highlights
    document.querySelectorAll('.onboarding-click-highlight').forEach(el => {
      el.classList.remove('onboarding-click-highlight');
    });

    // Track completion
    simpleAnalytics.trackEvent('tour_completed', {
      tutorial: this.currentTutorial,
      step: this.currentStep
    });

    // Mark as completed
    simpleStorage.set('tour_completed', true);

    // Clean up
    this.removeOverlay();
    this.isActive = false;
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
      const otherModals = document.querySelectorAll('.modal, [class*="modal"]:not(.scenario-modal):not(.pre-launch-modal)');
      const hasOpenModal = Array.from(otherModals).some(modal => {
        const style = getComputedStyle(modal);
        const isVisible = style.display !== 'none' && style.visibility !== 'hidden';
        logger.debug('OnboardingTour', 'Other modal check', { modal: modal.className, isVisible });
        return isVisible;
      });
      
      logger.info('OnboardingTour', 'Checking modal status', {
        scenarioModal: !!scenarioModal,
        preLaunchModal: !!preLaunchModal,
        hasOtherOpenModal: hasOpenModal,
        scenarioModalClass: scenarioModal?.className,
        preLaunchModalClass: preLaunchModal?.className
      });
      
      if (!scenarioModal && !preLaunchModal && !hasOpenModal) {
        // All modals are closed, wait a bit for animations then proceed
        logger.info('OnboardingTour', 'All modals closed, proceeding with step after animation delay');
        setTimeout(callback, this.ANIMATION_DURATION);
      } else {
        // Modal still exists, check again
        logger.debug('OnboardingTour', `Modal still open, checking again in ${this.MODAL_CHECK_DELAY}ms`);
        setTimeout(checkModalClosed, this.MODAL_CHECK_DELAY);
      }
    };
    
    checkModalClosed();
  }

  waitForAccordionOpen(callback) {
    const checkAccordionOpen = () => {
      // Check for the option details that are now visible (not display: none)
      const optionDetails = document.querySelector('.option-details');
      
      if (optionDetails && optionDetails.offsetHeight > 0 && 
          getComputedStyle(optionDetails).display !== 'none') {
        // Option details are visible
        callback();
      } else {
        // Still waiting for option details to appear
        setTimeout(checkAccordionOpen, 100);
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
      'modal-opened': false
    };
    
    this.startTour(1);
  }
}

// Export for use in other modules
export default OnboardingTour;

// Make available globally for debugging and manual control
window.OnboardingTour = OnboardingTour;

// Debug helper function
window.debugStartTour = function() {
  if (window.onboardingTourInstance) {
    window.onboardingTourInstance.debugForceStartFromStep1();
  } else {
    logger.warn('OnboardingTour', 'No onboarding tour instance available. Create one first.');
    window.onboardingTourInstance = new OnboardingTour();
    window.onboardingTourInstance.debugForceStartFromStep1();
  }
};

window.debugShowTourState = function() {
  if (window.onboardingTourInstance) {
    logger.info('OnboardingTour', 'Tour State:', {
      instanceId: window.onboardingTourInstance.instanceId,
      isActive: window.onboardingTourInstance.isActive,
      currentTutorial: window.onboardingTourInstance.currentTutorial,
      currentStep: window.onboardingTourInstance.currentStep,
      userStates: window.onboardingTourInstance.userStates
    });
  } else {
    logger.warn('OnboardingTour', 'No onboarding tour instance available');
  }
};
