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
 * Floating Surprise Tab Component
 * Professional floating "Surprise Me!" button that slides out on hover/click
 */

// Constants
const SURPRISE_MOBILE_BREAKPOINT = 768;
const SURPRISE_MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const SURPRISE_RIPPLE_DURATION = 600;
const SURPRISE_DEBOUNCE_DELAY = 300;
const SURPRISE_RIPPLE_DELAY = 50;
const SURPRISE_FEEDBACK_DURATION = 2000;

class FloatingSurpriseTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= SURPRISE_MOBILE_BREAKPOINT;
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
      this.updateVisibility(settings.surpriseTabEnabled);
    });

    // Listen for settings manager ready
    window.addEventListener('settingsManagerReady', e => {
      const { settings } = e.detail;
      this.updateVisibility(settings.surpriseTabEnabled);
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled = window.settingsManager.getSetting('surpriseTabEnabled');
        this.updateVisibility(enabled);
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
    this.container.className = 'floating-surprise-tab';
    this.container.setAttribute('role', 'complementary');
    this.container.setAttribute('aria-label', 'Surprise Me feature');

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-surprise-tab-content">
        <div class="floating-surprise-tab-icon">
          🎉
        </div>
        <div class="floating-surprise-tab-text">
          <span class="surprise-tab-title">Surprise Me!</span>
          <span class="surprise-tab-subtitle">Discover a random scenario</span>
        </div>
        <div class="floating-surprise-tab-arrow">
          <svg class="surprise-arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-surprise-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement('a');
    this.link.href = '#';
    this.link.className = 'floating-surprise-tab-link';
    this.link.setAttribute(
      'aria-label',
      'Surprise Me - Launch random scenario'
    );
    this.link.setAttribute('data-action', 'surprise');
    this.link.id = 'surprise-me-floating';

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

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= SURPRISE_MOBILE_BREAKPOINT;

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
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      if (!this.isExpanded) {
        e.preventDefault();
        this.expand();
        this.scheduleAutoCollapse();
      } else {
        // When expanded, trigger surprise me functionality
        e.preventDefault();
        this.triggerSurpriseMe();
      }
    }
  }

  handleDesktopClick(e) {
    if (!this.isMobile) {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerSurpriseMe();
      // Remove focus to prevent persistent outline
      this.link.blur();
    }
  }

  handleKeyDown(e) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();

      // Check for debouncing
      const now = Date.now();
      if (now - this.lastClickTime < SURPRISE_DEBOUNCE_DELAY) {
        return;
      }
      this.lastClickTime = now;

      this.createRipple(e);
      this.triggerSurpriseMe();
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
    }, SURPRISE_MOBILE_AUTO_COLLAPSE_DELAY);
  }

  clearCollapseTimeout() {
    if (this.collapseTimeout) {
      clearTimeout(this.collapseTimeout);
      this.collapseTimeout = null;
    }
  }

  createRipple(_event) {
    // Reset ripple
    this.container.classList.remove('ripple-active');

    // Trigger ripple effect
    setTimeout(() => {
      this.container.classList.add('ripple-active');
    }, SURPRISE_RIPPLE_DELAY);

    // Remove ripple effect
    setTimeout(() => {
      this.container.classList.remove('ripple-active');
    }, SURPRISE_RIPPLE_DURATION);
  }

  triggerSurpriseMe() {
    // Trigger the surprise me functionality
    if (typeof window.app !== 'undefined' && window.app.launchRandomScenario) {
      window.app.launchRandomScenario();
    } else if (typeof window.triggerSurpriseMe === 'function') {
      window.triggerSurpriseMe();
    } else {
      // Fallback: try to click the original surprise me button
      const originalButton = document.getElementById('surprise-me-nav');
      if (originalButton) {
        originalButton.click();
      }
    }

    // Add visual feedback
    this.addSuccessFeedback();
  }

  addSuccessFeedback() {
    const title = this.container.querySelector('.surprise-tab-title');
    const subtitle = this.container.querySelector('.surprise-tab-subtitle');

    if (title && subtitle) {
      const originalTitle = title.textContent;
      const originalSubtitle = subtitle.textContent;

      title.textContent = 'Loading...';
      subtitle.textContent = 'Finding perfect scenario';

      // Reset after a short delay
      setTimeout(() => {
        title.textContent = originalTitle;
        subtitle.textContent = originalSubtitle;
      }, SURPRISE_FEEDBACK_DURATION);
    }
  }

  unbindEvents() {
    // Remove all event listeners
    this.link.removeEventListener('mouseenter', this.handleMouseEnter);
    this.link.removeEventListener('mouseleave', this.handleMouseLeave);
    this.link.removeEventListener('click', this.handleDesktopClick);
    this.link.removeEventListener('click', this.handleMobileClick);
    this.link.removeEventListener('touchstart', this.handleTouchStart);
    this.link.removeEventListener('touchend', this.handleTouchEnd);
    this.link.removeEventListener('keydown', this.handleKeyDown);
    this.link.removeEventListener('focus', this.handleFocus);
    this.link.removeEventListener('blur', this.handleBlur);
  }

  destroy() {
    this.unbindEvents();
    this.clearCollapseTimeout();

    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }

    this.isInitialized = false;
  }
}

// Initialize the floating surprise tab when the DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Initialize the floating surprise tab
  window.floatingSurpriseTab = new FloatingSurpriseTab();
});

// Export global function for easy access
window.triggerSurpriseMe = function () {
  if (typeof window.app !== 'undefined' && window.app.launchRandomScenario) {
    window.app.launchRandomScenario();
  }
};

// Export for potential manual initialization
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FloatingSurpriseTab;
}
