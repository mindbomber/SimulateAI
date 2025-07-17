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
 * Back to Top Component
 * A global back-to-top button that appears when the user scrolls down
 * and smoothly scrolls back to the top of the page when clicked.
 */

// Constants for responsive behavior - much higher thresholds
const BACK_TO_TOP_DESKTOP_MIN_SCROLL = 1200; // Show after scrolling 1200px (much further down)
const BACK_TO_TOP_DESKTOP_MAX_SCROLL = 1800; // Maximum scroll for desktop
const BACK_TO_TOP_DESKTOP_VIEWPORT_MULTIPLIER = 3; // Desktop: 3+ viewport heights (increased from 2)
const BACK_TO_TOP_MOBILE_VIEWPORT_MULTIPLIER = 5; // Mobile: 5+ screen lengths (increased from 4)
const BACK_TO_TOP_MOBILE_BREAKPOINT = 768; // Mobile breakpoint in pixels
const SCROLL_ANIMATION_DELAY = 500; // Delay before re-checking visibility after scroll

class BackToTop {
  constructor() {
    this.button = null;
    this.isVisible = false;
    this.boundScrollHandler = null;
    this.init();
  }

  /**
   * Initialize the back-to-top component
   */
  init() {
    // Create the button dynamically
    this.createButton();

    if (!this.button) {
      return;
    }

    this.setupEventListeners();
    this.updateVisibility(); // Initial check
  }

  /**
   * Create the back-to-top button dynamically
   */
  createButton() {
    // Check if button already exists
    if (document.getElementById('back-to-top')) {
      this.button = document.getElementById('back-to-top');
      return;
    }

    // Create button element
    this.button = document.createElement('button');
    this.button.id = 'back-to-top';
    this.button.className = 'back-to-top';
    this.button.setAttribute('aria-label', 'Back to top');
    this.button.setAttribute('title', 'Back to top');
    this.button.type = 'button';
    this.button.innerHTML = '↑';

    // Add to page
    document.body.appendChild(this.button);
  }

  /**
   * Set up event listeners for scroll and click events
   */
  setupEventListeners() {
    // Throttled scroll handler
    let ticking = false;
    this.boundScrollHandler = () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          this.updateVisibility();
          ticking = false;
        });
        ticking = true;
      }
    };

    // Add scroll listener
    window.addEventListener('scroll', this.boundScrollHandler, {
      passive: true,
    });

    // Click handler for smooth scroll
    this.button.addEventListener('click', e => {
      e.preventDefault();
      this.scrollToTop();
    });
  }

  /**
   * Update button visibility based on scroll position
   */
  updateVisibility() {
    const viewportHeight = window.innerHeight;
    const viewportWidth = window.innerWidth;
    const currentScroll =
      window.pageYOffset || document.documentElement.scrollTop;

    // Calculate scroll threshold based on device type
    let scrollThreshold;
    if (viewportWidth <= BACK_TO_TOP_MOBILE_BREAKPOINT) {
      // Mobile: Wait until 4 screen lengths to avoid cluttering small screens
      scrollThreshold = viewportHeight * BACK_TO_TOP_MOBILE_VIEWPORT_MULTIPLIER;
    } else {
      // Desktop: Show after scrolling 300-600px or 2+ viewport heights
      const viewportBasedThreshold =
        viewportHeight * BACK_TO_TOP_DESKTOP_VIEWPORT_MULTIPLIER;
      scrollThreshold = Math.max(
        BACK_TO_TOP_DESKTOP_MIN_SCROLL,
        Math.min(BACK_TO_TOP_DESKTOP_MAX_SCROLL, viewportBasedThreshold)
      );
    }

    const shouldShow = currentScroll > scrollThreshold;

    // Update visibility if changed
    if (shouldShow !== this.isVisible) {
      this.isVisible = shouldShow;

      if (shouldShow) {
        this.button.classList.add('visible');
      } else {
        this.button.classList.remove('visible');
      }
    }
  }

  /**
   * Smooth scroll to top of page
   */
  scrollToTop() {
    // Hide button immediately when clicked
    this.button.classList.remove('visible');
    this.isVisible = false;

    // Smooth scroll to top
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });

    // Keep button hidden until scroll position changes significantly
    // This prevents it from flickering back on during the smooth scroll
    setTimeout(() => {
      this.updateVisibility();
    }, SCROLL_ANIMATION_DELAY);
  }

  /**
   * Clean up event listeners and remove button
   */
  destroy() {
    if (this.boundScrollHandler) {
      window.removeEventListener('scroll', this.boundScrollHandler);
    }

    if (this.button && this.button.parentNode) {
      this.button.parentNode.removeChild(this.button);
      this.button = null;
    }
  }
}

// Initialize the back-to-top component when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new BackToTop();
});

export default BackToTop;
