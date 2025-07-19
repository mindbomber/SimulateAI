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
 * Floating Tour Tab Component
 * Professional floating "Take Tour" button that slides out on hover/click
 * Positioned above the surprise tab
 */

// Constants
const TOUR_MOBILE_BREAKPOINT = 768;
const TOUR_MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const TOUR_RIPPLE_DURATION = 600;
const TOUR_DEBOUNCE_DELAY = 300;
const TOUR_RIPPLE_DELAY = 50;
const TOUR_FEEDBACK_DURATION = 2000;

class FloatingTourTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= TOUR_MOBILE_BREAKPOINT;
    this.isInitialized = false;
    this.collapseTimeout = null;
    this.lastClickTime = 0;

    this.init();
    this.bindEvents();
    this.listenToSettings();
  }

  init() {
    if (this.isInitialized) return;

    this.createElement();
    this.attachToDOM();
    this.applyInitialSettings();
    this.isInitialized = true;
  }

  listenToSettings() {
    // Listen for settings changes
    window.addEventListener('settingsChanged', e => {
      const { settings } = e.detail;
      this.updateVisibility(settings.tourTabEnabled);
    });

    // Listen for settings manager ready
    window.addEventListener('settingsManagerReady', e => {
      const { settings } = e.detail;
      this.updateVisibility(settings.tourTabEnabled);
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled = window.settingsManager.getSetting('tourTabEnabled');
        this.updateVisibility(enabled);
      } else {
        // Default to enabled if settings manager not available
        this.updateVisibility(true);
      }
    };

    // Try immediately
    applySettings();

    // Also try after a short delay in case settings manager isn't ready
    setTimeout(applySettings, 100);
  }

  updateVisibility(enabled) {
    if (this.link) {
      this.link.style.display = enabled ? 'block' : 'none';
    }
  }

  createElement() {
    // Create the main container
    this.container = document.createElement('div');
    this.container.className = 'floating-tour-tab';
    this.container.setAttribute('role', 'complementary');
    this.container.setAttribute('aria-label', 'Take Tour feature');

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-tour-tab-content">
        <div class="floating-tour-tab-icon">
          📚
        </div>
        <div class="floating-tour-tab-text">
          <span class="tour-tab-title">Take Tour</span>
          <span class="tour-tab-subtitle">Learn how to use SimulateAI</span>
        </div>
        <div class="floating-tour-tab-arrow">
          <svg class="tour-arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-tour-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement('a');
    this.link.href = '#';
    this.link.className = 'floating-tour-tab-link';
    this.link.setAttribute(
      'aria-label',
      'Take Tour - Start interactive onboarding'
    );
    this.link.setAttribute('data-action', 'tour');
    this.link.id = 'take-tour-floating';

    // Wrap the container in the link
    this.link.appendChild(this.container);
  }

  attachToDOM() {
    // Add to the end of the body
    document.body.appendChild(this.link);
  }

  bindEvents() {
    // Handle resize events
    window.addEventListener('resize', this.handleResize.bind(this));

    // Handle hover/click events
    if (this.isMobile) {
      this.link.addEventListener(
        'touchstart',
        this.handleTouchStart.bind(this)
      );
      this.link.addEventListener('touchend', this.handleTouchEnd.bind(this));
      this.link.addEventListener('click', this.handleMobileClick.bind(this));
    } else {
      this.link.addEventListener(
        'mouseenter',
        this.handleMouseEnter.bind(this)
      );
      this.link.addEventListener(
        'mouseleave',
        this.handleMouseLeave.bind(this)
      );
      this.link.addEventListener('click', this.handleDesktopClick.bind(this));
    }

    // Handle keyboard navigation
    this.link.addEventListener('keydown', this.handleKeyDown.bind(this));
    this.link.addEventListener('focus', this.handleFocus.bind(this));
    this.link.addEventListener('blur', this.handleBlur.bind(this));
  }

  unbindEvents() {
    // Cleanup method to remove event listeners if needed
    window.removeEventListener('resize', this.handleResize.bind(this));
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= TOUR_MOBILE_BREAKPOINT;

    if (wasMobile !== this.isMobile) {
      this.unbindEvents();
      this.bindEvents();
    }
  }

  handleMouseEnter() {
    if (!this.isMobile) {
      // Add a small delay to make hover more intentional
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
      }
      this.hoverTimeout = setTimeout(() => {
        this.expand();
      }, 100); // 100ms delay
    }
  }

  handleMouseLeave() {
    if (!this.isMobile) {
      // Clear hover timeout if user leaves before delay
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.collapse();
    }
  }

  handleTouchStart(e) {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
      this.createRipple(e.touches[0]);
    }
  }

  handleTouchEnd(_e) {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
    }
  }

  handleMobileClick(e) {
    if (this.isMobile) {
      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < TOUR_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      if (!this.isExpanded) {
        e.preventDefault();
        this.expand();
        this.scheduleAutoCollapse();
      } else {
        // When expanded, trigger tour functionality
        e.preventDefault();
        this.triggerTour();
      }
    }
  }

  handleDesktopClick(e) {
    if (!this.isMobile) {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < TOUR_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerTour();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < TOUR_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerTour();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleFocus() {
    if (!this.isMobile) {
      this.expand();
    }
  }

  handleBlur() {
    if (!this.isMobile) {
      this.collapse();
    }
  }

  expand() {
    this.isExpanded = true;
    this.container.classList.add('expanded');
    this.clearCollapseTimeout();
  }

  collapse() {
    this.isExpanded = false;
    this.container.classList.remove('expanded');
    this.clearCollapseTimeout();
  }

  scheduleAutoCollapse() {
    this.clearCollapseTimeout();
    this.collapseTimeout = setTimeout(() => {
      this.collapse();
    }, TOUR_MOBILE_AUTO_COLLAPSE_DELAY);
  }

  clearCollapseTimeout() {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
      this.collapseTimeout = null;
    }
  }

  createRipple(event) {
    const ripple = this.container.querySelector('.floating-tour-tab-ripple');
    if (!ripple) return;

    // Clear any existing animation
    ripple.style.animation = 'none';

    // Get coordinates relative to the container
    let clientX, clientY;
    if (event.touches && event.touches[0]) {
      clientX = event.touches[0].clientX;
      clientY = event.touches[0].clientY;
    } else if (event.clientX !== undefined) {
      clientX = event.clientX;
      clientY = event.clientY;
    } else {
      // Keyboard event - center the ripple
      const rect = this.container.getBoundingClientRect();
      clientX = rect.left + rect.width / 2;
      clientY = rect.top + rect.height / 2;
    }

    const rect = this.container.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;

    // Set position and trigger animation
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;

    // Force reflow and start animation
    setTimeout(() => {
      ripple.style.animation = `tour-ripple ${TOUR_RIPPLE_DURATION}ms ease-out`;
    }, TOUR_RIPPLE_DELAY);

    // Clean up after animation
    setTimeout(() => {
      ripple.style.animation = 'none';
    }, TOUR_RIPPLE_DURATION + TOUR_RIPPLE_DELAY);
  }

  triggerTour() {

    // Provide visual feedback
    this.showFeedback();

    // Try multiple methods to trigger the tour
    if (typeof window.app !== 'undefined' && window.app.startOnboardingTour) {

      window.app.startOnboardingTour();
    } else if (
      typeof window.sharedNav !== 'undefined' &&
      window.sharedNav.handleTourAction
    ) {

      window.sharedNav.handleTourAction();
    } else {
      // Fallback: Try to find and click the tour button in navigation
      const tourBtn = document.getElementById('start-tour-nav');
      if (tourBtn) {

        tourBtn.click();
      } else {

        this.showUnavailableFeedback();
      }
    }
  }

  showFeedback() {
    // Add temporary feedback class
    this.container.classList.add('tour-clicked');
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('tour-clicked');
      }
    }, TOUR_FEEDBACK_DURATION);
  }

  showUnavailableFeedback() {
    // Show that tour is unavailable
    this.container.classList.add('tour-unavailable');
    setTimeout(() => {
      if (this.container) {
        this.container.classList.remove('tour-unavailable');
      }
    }, TOUR_FEEDBACK_DURATION);
  }

  destroy() {
    // Cleanup method
    this.clearCollapseTimeout();
    if (this.hoverTimeout) {
      clearTimeout(this.hoverTimeout);
    }
    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    if (!window.floatingTourTab) {
      window.floatingTourTab = new FloatingTourTab();
    }
  });
} else {
  // DOM is already ready
  if (!window.floatingTourTab) {
    window.floatingTourTab = new FloatingTourTab();
  }
}

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingTourTab;
}
