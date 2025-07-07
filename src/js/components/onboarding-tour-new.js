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
  constructor() {
    this.currentStep = 0;
    this.currentTutorial = 1;
    this.isActive = false;
    this.coachMark = null;
    this.overlay = null;
    this.spotlight = null;
    
    // Constants
    this.ANIMATION_DURATION = 300; // ms
    this.SCROLL_DURATION = 800; // ms
    this.SCROLL_OFFSET = 100; // px from top
    this.COACH_MARK_SPACING = 20; // px
    this.AUTO_ADVANCE_DELAY = 3000; // ms for steps with actions
    this.MIN_SCROLL_DISTANCE = 5; // px
    this.EASE_MIDPOINT = 0.5; // easing function midpoint
    this.EASE_MULTIPLIER = 4; // easing function multiplier
    
    // Tutorial steps configuration
    this.tutorials = {
      1: { // Test Scenario Tutorial
        name: 'test-scenario',
        title: 'Test Scenario Tutorial',
        steps: [
          {
            id: 'welcome',
            title: 'Welcome to SimulateAI! 🤖',
            content: 'Explore difficult ethical AI and robotics safety scenarios. This tour will guide you through our interactive platform.',
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
            autoScroll: false
          },
          {
            id: 'ethical-question',
            title: 'Ethical Question',
            content: 'This highlights the core ethical consideration. What values are at stake in this scenario?',
            target: '.ethical-question',
            position: 'right',
            autoScroll: false
          },
          {
            id: 'choose-approach',
            title: 'Choose Your Approach',
            content: 'Each approach represents a different ethical framework. Select one to see how it affects the analysis.',
            target: '.scenario-options',
            position: 'left',
            action: 'wait-for-option-selection',
            highlightClick: true,
            autoScroll: false
          },
          {
            id: 'pros-cons',
            title: 'Pros and Cons Analysis',
            content: 'Every ethical choice has trade-offs. These help you understand the implications of your decision.',
            target: '.option-details',
            position: 'left',
            autoScroll: false
          },
          {
            id: 'radar-chart',
            title: 'Ethics Radar Chart',
            content: 'This visualization shows how your choice affects different ethical dimensions. Each axis represents a core principle.',
            target: '#scenario-radar-chart',
            position: 'left',
            autoScroll: false
          },
          {
            id: 'confirm-choice',
            title: 'Confirm Your Decision',
            content: 'When ready, confirm your choice. Remember - there\'s no "wrong" answer in ethics exploration!',
            target: '#confirm-choice',
            position: 'top',
            action: 'wait-for-confirm',
            highlightClick: true,
            autoScroll: false
          },
          {
            id: 'tutorial-complete',
            title: 'Tutorial 1 Complete! 🎉',
            content: 'Great job! You\'ve learned how to navigate ethical scenarios. Ready to explore the radar chart in detail?',
            buttons: [
              { text: '📊 Radar Chart Tutorial', action: 'next-tutorial', primary: true },
              { text: 'Start Exploring', action: 'finish', primary: false }
            ],
            target: null,
            position: 'center',
            autoScroll: false
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
            content: 'The chart has 5 key dimensions: Fairness, Sustainability, Privacy, Autonomy, and Proportionality. Each represents a core ethical principle.',
            target: '#hero-ethics-chart',
            position: 'bottom',
            autoScroll: false
          },
          {
            id: 'interactive-controls',
            title: 'Try the Controls',
            content: 'Use these buttons to see how different scenarios affect the ethical dimensions. Watch the chart change in real-time!',
            target: '.demo-controls-grid',
            position: 'top',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'how-to-read',
            title: 'How to Read Charts',
            content: 'Click this accordion to learn about interpreting the visual data and understanding the ethical implications.',
            target: '.radar-instructions-accordion',
            position: 'top',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'glossary',
            title: 'Ethical Dimensions Glossary',
            content: 'Click this accordion to explore detailed definitions of each ethical principle used in our simulations.',
            target: '.ethics-glossary-accordion',
            position: 'top',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'radar-tutorial-complete',
            title: 'Radar Chart Mastery! 📊',
            content: 'Excellent! You now understand how to interpret ethical impacts visually. Ready for the final tutorial?',
            buttons: [
              { text: '🎓 Explore Simulations', action: 'next-tutorial', primary: true },
              { text: 'Start Exploring', action: 'finish', primary: false }
            ],
            target: null,
            position: 'center',
            autoScroll: false
          }
        ]
      },
      3: { // Explore Simulations Tutorial
        name: 'explore-simulations',
        title: 'Explore Simulations Tutorial',
        steps: [
          {
            id: 'simulations-intro',
            title: 'AI Ethics Simulations',
            content: 'Below you\'ll find our collection of interactive AI ethics simulations. Each one explores different real-world scenarios.',
            target: '.category-grid',
            position: 'top',
            autoScroll: true
          },
          {
            id: 'simulation-cards',
            title: 'Simulation Categories',
            content: 'Each card represents a different category of AI ethics challenges. Click any card to explore scenarios in that area.',
            target: '.category-card',
            position: 'bottom',
            autoScroll: false,
            highlightClick: true
          },
          {
            id: 'start-exploring-button',
            title: 'Ready to Start',
            content: 'When you\'re ready to begin exploring, click the main "Start Exploring" button to dive into AI ethics scenarios.',
            target: '#start-learning',
            position: 'top',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'educator-resources',
            title: 'Educator Resources',
            content: 'Scroll down to find comprehensive educator support, ISTE-aligned curriculum, and assessment tools.',
            target: '.educator-section',
            position: 'top',
            autoScroll: true
          },
          {
            id: 'take-tour-again',
            title: 'Take the Tour Again',
            content: 'You can always retake this tour by clicking the "Take Tour" button in the navigation menu.',
            target: '#take-tour',
            position: 'bottom',
            autoScroll: true,
            highlightClick: true
          },
          {
            id: 'tour-complete',
            title: 'Congratulations! 🎉🎓',
            content: 'You\'ve completed all three tutorials! You\'re now ready to explore ethical AI scenarios with confidence. Happy learning!',
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
    
    // Check if user has completed the tour
    if (this.hasCompletedTour()) {
      logger.info('OnboardingTour', 'User has already completed tour');
      return;
    }

    // Check if this is a first-time visit
    if (this.isFirstTimeVisit()) {
      logger.info('OnboardingTour', 'First-time visit detected, starting tour');
      this.startTour();
    }
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
    if (this.isActive) {
      logger.warn('OnboardingTour', 'Tour already active');
      return;
    }

    this.isActive = true;
    this.currentTutorial = tutorialNumber;
    this.currentStep = 0;

    logger.info('OnboardingTour', `Starting tutorial ${tutorialNumber}`);

    // Track analytics
    simpleAnalytics.track('tour_started', {
      tutorial: tutorialNumber
    });

    this.createOverlay();
    this.showStep();
  }

  createOverlay() {
    // Remove existing overlay
    this.removeOverlay();

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
  }

  removeOverlay() {
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

    document.body.classList.remove('onboarding-active');
  }

  scrollToElement(element, offset = this.SCROLL_OFFSET) {
    if (!element) return Promise.resolve();

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

  positionCoachMark(targetElement, position = 'bottom') {
    if (!this.coachMark) return;

    // Get coach mark dimensions after content is set
    this.coachMark.style.visibility = 'hidden';
    this.coachMark.style.display = 'block';
    const coachMarkRect = this.coachMark.getBoundingClientRect();
    
    const spacing = this.COACH_MARK_SPACING;
    let left, top;

    if (targetElement) {
      const targetRect = targetElement.getBoundingClientRect();
      const scrollY = window.pageYOffset;
      
      switch (position) {
        case 'top':
          left = targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2);
          top = targetRect.top + scrollY - coachMarkRect.height - spacing;
          break;
        case 'bottom':
          left = targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2);
          top = targetRect.bottom + scrollY + spacing;
          break;
        case 'left':
          left = targetRect.left - coachMarkRect.width - spacing;
          top = targetRect.top + scrollY + (targetRect.height / 2) - (coachMarkRect.height / 2);
          break;
        case 'right':
          left = targetRect.right + spacing;
          top = targetRect.top + scrollY + (targetRect.height / 2) - (coachMarkRect.height / 2);
          break;
        default:
          left = targetRect.left + (targetRect.width / 2) - (coachMarkRect.width / 2);
          top = targetRect.bottom + scrollY + spacing;
      }

      // Keep within viewport bounds
      const viewportWidth = window.innerWidth;
      left = Math.max(spacing, Math.min(left, viewportWidth - coachMarkRect.width - spacing));
      top = Math.max(spacing + scrollY, top);
    } else {
      // Center on viewport
      left = (window.innerWidth / 2) - (coachMarkRect.width / 2);
      top = (window.innerHeight / 2) - (coachMarkRect.height / 2) + window.pageYOffset;
    }

    this.coachMark.style.left = `${left}px`;
    this.coachMark.style.top = `${top}px`;
    this.coachMark.style.visibility = 'visible';
  }

  async showStep() {
    const tutorial = this.tutorials[this.currentTutorial];
    const step = tutorial.steps[this.currentStep];
    
    if (!step) {
      logger.error('OnboardingTour', 'Step not found', { tutorial: this.currentTutorial, step: this.currentStep });
      return;
    }

    logger.info('OnboardingTour', `Showing step ${this.currentStep + 1}`, { step: step.id });

    // Wait for target element if specified
    if (step.waitFor) {
      this.waitForCondition(step.waitFor, () => {
        this.renderCoachMark(step, tutorial);
      });
    } else {
      await this.renderCoachMark(step, tutorial);
    }
  }

  async renderCoachMark(step, tutorial) {
    const targetElement = step.target ? document.querySelector(step.target) : null;

    // Auto-scroll to element if specified
    if (step.autoScroll && targetElement) {
      await this.scrollToElement(targetElement);
      // Small delay after scroll to ensure element is visible
      await new Promise(resolve => setTimeout(resolve, this.ANIMATION_DURATION));
    }

    // Position spotlight on target
    if (targetElement) {
      this.positionSpotlight(targetElement);
    } else {
      // Hide spotlight for center-positioned steps
      if (this.spotlight) {
        this.spotlight.style.display = 'none';
      }
    }

    // Create coach mark content
    this.coachMark.innerHTML = this.createCoachMarkContent(step, tutorial);

    // Position coach mark
    this.positionCoachMark(targetElement, step.position);

    // Add click highlight for interactive elements
    if (step.highlightClick && targetElement) {
      targetElement.classList.add('onboarding-click-highlight');
    }

    // Setup event listeners
    this.setupEventListeners(step);

    // Handle automatic progression for action steps
    if (step.action) {
      this.handleStepAction(step, targetElement);
    }

    // Announce to screen readers
    this.announceStep(step);
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
    const isLastStep = this.currentStep === this.tutorials[this.currentTutorial].steps.length - 1;
    const isLastTutorial = this.currentTutorial === Object.keys(this.tutorials).length;
    
    if (isLastStep && isLastTutorial) {
      return `<button class="coach-mark-btn primary" data-action="finish" type="button">🚀 Start Exploring</button>`;
    } else if (isLastStep) {
      return `
        <button class="coach-mark-btn secondary" data-action="finish" type="button">Start Exploring</button>
        <button class="coach-mark-btn primary" data-action="next-tutorial" type="button">Next Tutorial</button>
      `;
    } else {
      return `
        <button class="coach-mark-btn secondary" data-action="skip" type="button">Skip</button>
        <button class="coach-mark-btn primary" data-action="continue" type="button">Next</button>
      `;
    }
  }

  setupEventListeners(_step) {
    if (!this.coachMark) return;

    // Remove existing listeners
    this.coachMark.replaceWith(this.coachMark.cloneNode(true));
    this.coachMark = document.querySelector('.onboarding-coach-mark');

    // Button click handlers
    this.coachMark.addEventListener('click', (e) => {
      const { action } = e.target.dataset;
      if (action) {
        e.preventDefault();
        this.handleAction(action);
      }

      if (e.target.classList.contains('coach-mark-close')) {
        this.endTour();
      }
    });

    // Keyboard navigation
    this.coachMark.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        this.endTour();
      } else if (e.key === 'Enter' || e.key === ' ') {
        if (e.target.classList.contains('coach-mark-btn')) {
          e.target.click();
        }
      }
    });

    // Focus management
    const firstButton = this.coachMark.querySelector('.coach-mark-btn');
    if (firstButton) {
      firstButton.focus();
    }
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
    if (!targetElement) return;

    const clickHandler = () => {
      targetElement.removeEventListener('click', clickHandler);
      setTimeout(() => this.nextStep(), this.AUTO_ADVANCE_DELAY);
    };

    targetElement.addEventListener('click', clickHandler);
  }

  waitForOptionSelection() {
    const optionHandler = () => {
      document.removeEventListener('click', optionHandler);
      setTimeout(() => this.nextStep(), this.AUTO_ADVANCE_DELAY);
    };

    document.addEventListener('click', optionHandler);
  }

  waitForConfirm() {
    const confirmHandler = () => {
      document.removeEventListener('click', confirmHandler);
      setTimeout(() => this.nextStep(), this.AUTO_ADVANCE_DELAY);
    };

    document.addEventListener('click', confirmHandler);
  }

  waitForCondition(condition, callback) {
    const checkCondition = () => {
      let conditionMet = false;
      
      switch (condition) {
        case 'scenario-modal':
          conditionMet = document.querySelector('.scenario-modal') !== null;
          break;
        case 'pre-launch-modal':
          conditionMet = document.querySelector('.pre-launch-modal') !== null;
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
    switch (action) {
      case 'continue':
        this.nextStep();
        break;
      case 'next-tutorial':
        this.nextTutorial();
        break;
      case 'finish':
      case 'skip':
        this.endTour();
        break;
    }
  }

  nextStep() {
    // Remove click highlights
    document.querySelectorAll('.onboarding-click-highlight').forEach(el => {
      el.classList.remove('onboarding-click-highlight');
    });

    const tutorial = this.tutorials[this.currentTutorial];
    if (this.currentStep < tutorial.steps.length - 1) {
      this.currentStep++;
      this.showStep();
    } else {
      this.nextTutorial();
    }
  }

  nextTutorial() {
    // Track tutorial completion
    simpleAnalytics.track('tour_tutorial_completed', {
      tutorial: this.currentTutorial
    });

    const totalTutorials = Object.keys(this.tutorials).length;
    if (this.currentTutorial < totalTutorials) {
      this.currentTutorial++;
      this.currentStep = 0;
      logger.info('OnboardingTour', `Starting tutorial ${this.currentTutorial}`);
      this.showStep();
    } else {
      this.endTour();
    }
  }

  endTour() {
    logger.info('OnboardingTour', 'Ending tour');

    // Remove click highlights
    document.querySelectorAll('.onboarding-click-highlight').forEach(el => {
      el.classList.remove('onboarding-click-highlight');
    });

    // Track completion
    simpleAnalytics.track('tour_completed', {
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
}

// Export for use in other modules
export default OnboardingTour;

// Auto-initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
  window.onboardingTourInstance = new OnboardingTour();
});

// Make available globally for debugging and manual control
window.OnboardingTour = OnboardingTour;
