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
 * Floating Action Tab Component
 * Professional floating donate button that slides out on hover/click
 */

// Constants
const MOBILE_BREAKPOINT = 768;
const MOBILE_AUTO_COLLAPSE_DELAY = 3000;
const RIPPLE_DURATION = 600;
const SCREEN_READER_ANNOUNCEMENT_DURATION = 1000;

class FloatingActionTab {
  constructor() {
    this.isExpanded = false;
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;
    this.isInitialized = false;

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
    window.addEventListener("settingsChanged", (e) => {
      const { settings } = e.detail;
      this.updateVisibility(settings.donateTabEnabled);
    });

    // Listen for settings manager ready
    window.addEventListener("settingsManagerReady", (e) => {
      const { settings } = e.detail;
      this.updateVisibility(settings.donateTabEnabled);
    });
  }

  applyInitialSettings() {
    // Apply initial settings if available
    const applySettings = () => {
      if (window.settingsManager) {
        const enabled = window.settingsManager.getSetting("donateTabEnabled");
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
      this.link.style.display = enabled ? "block" : "none";
    }
  }

  createElement() {
    // Create the main container
    this.container = document.createElement("div");
    this.container.className = "floating-action-tab";
    this.container.setAttribute("role", "complementary");
    this.container.setAttribute("aria-label", "Donation support");

    // Create the tab content
    this.container.innerHTML = `
      <div class="floating-tab-content">
        <div class="floating-tab-icon">
          <svg class="heart-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
          </svg>
        </div>
        <div class="floating-tab-text">
          <span class="tab-title">Support Our Mission</span>
          <span class="tab-subtitle">Help us continue developing ethical AI education</span>
        </div>
        <div class="floating-tab-arrow">
          <svg class="arrow-icon" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <path d="M8.59 16.59L13.17 12 8.59 7.41 10 6l6 6-6 6-1.41-1.41z"/>
          </svg>
        </div>
      </div>
      <div class="floating-tab-ripple"></div>
    `;

    // Create the clickable link
    this.link = document.createElement("a");
    this.link.href = "donate.html";
    this.link.className = "floating-tab-link";
    this.link.setAttribute("aria-label", "Navigate to donation page");
    this.link.setAttribute("data-page", "donate");

    // Wrap the container in the link
    this.link.appendChild(this.container);
  }

  attachToDOM() {
    // Add to the end of the body
    document.body.appendChild(this.link);
  }

  bindEvents() {
    // Handle resize events
    window.addEventListener("resize", this.handleResize.bind(this));

    // Handle hover/click events
    if (this.isMobile) {
      this.link.addEventListener(
        "touchstart",
        this.handleTouchStart.bind(this),
      );
      this.link.addEventListener("click", this.handleMobileClick.bind(this));
    } else {
      this.link.addEventListener("mouseenter", this.handleHover.bind(this));
      this.link.addEventListener("mouseleave", this.handleLeave.bind(this));
      this.link.addEventListener("focus", this.handleFocus.bind(this));
      this.link.addEventListener("blur", this.handleBlur.bind(this));
    }

    // Handle keyboard navigation
    this.link.addEventListener("keydown", this.handleKeydown.bind(this));

    // Handle visibility changes
    document.addEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  handleResize() {
    const wasMobile = this.isMobile;
    this.isMobile = window.innerWidth <= MOBILE_BREAKPOINT;

    if (wasMobile !== this.isMobile) {
      // Re-bind events if mobile state changed
      this.removeEvents();
      this.bindEvents();
    }
  }

  handleHover() {
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

  handleLeave() {
    if (!this.isMobile) {
      // Clear hover timeout if user leaves before delay
      if (this.hoverTimeout) {
        clearTimeout(this.hoverTimeout);
        this.hoverTimeout = null;
      }
      this.collapse();
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

  handleTouchStart(e) {
    if (this.isMobile) {
      // Allow default behavior to ensure click events work
      this.createRipple(e.touches[0]);
    }
  }

  handleMobileClick(e) {
    if (this.isMobile) {
      if (!this.isExpanded) {
        e.preventDefault();
        this.expand();

        // Auto-collapse after delay
        setTimeout(() => {
          this.collapse();
        }, MOBILE_AUTO_COLLAPSE_DELAY);
      } else {
        // When expanded, navigate to donation page
        window.location.href = this.link.href;
      }
    }
  }

  handleKeydown(e) {
    if (e.key === "Enter" || e.key === " ") {
      if (this.isMobile) {
        e.preventDefault();
        this.toggle();
      }
    }
  }

  handleVisibilityChange() {
    if (document.hidden) {
      this.collapse();
    }
  }

  expand() {
    if (this.isExpanded) return;

    this.isExpanded = true;
    this.container.classList.add("expanded");

    // Add ripple effect
    this.addRipple();

    // Announce to screen readers
    this.announceToScreenReader("Donation tab expanded");
  }

  collapse() {
    if (!this.isExpanded) return;

    this.isExpanded = false;
    this.container.classList.remove("expanded");
  }

  toggle() {
    if (this.isExpanded) {
      this.collapse();
    } else {
      this.expand();
    }
  }

  addRipple() {
    const ripple = this.container.querySelector(".floating-tab-ripple");
    ripple.classList.add("active");

    setTimeout(() => {
      ripple.classList.remove("active");
    }, RIPPLE_DURATION);
  }

  announceToScreenReader(message) {
    // Create temporary element for screen reader announcement
    const announcement = document.createElement("div");
    announcement.setAttribute("aria-live", "polite");
    announcement.setAttribute("aria-atomic", "true");
    announcement.className = "sr-only";
    announcement.textContent = message;

    document.body.appendChild(announcement);

    setTimeout(() => {
      document.body.removeChild(announcement);
    }, SCREEN_READER_ANNOUNCEMENT_DURATION);
  }

  removeEvents() {
    // Remove all event listeners (for cleanup)
    window.removeEventListener("resize", this.handleResize.bind(this));
    document.removeEventListener(
      "visibilitychange",
      this.handleVisibilityChange.bind(this),
    );
  }

  createRipple(touch) {
    if (!touch) return;

    const ripple = document.createElement("span");
    ripple.className = "ripple";
    ripple.style.left = `${touch.clientX - this.link.getBoundingClientRect().left}px`;
    ripple.style.top = `${touch.clientY - this.link.getBoundingClientRect().top}px`;

    this.link.appendChild(ripple);

    setTimeout(() => {
      if (ripple.parentNode) {
        ripple.parentNode.removeChild(ripple);
      }
    }, RIPPLE_DURATION);
  }

  destroy() {
    if (this.link && this.link.parentNode) {
      this.link.parentNode.removeChild(this.link);
    }
    this.removeEvents();
    this.isInitialized = false;
  }
}

// Auto-initialize when DOM is ready
document.addEventListener("DOMContentLoaded", () => {
  new FloatingActionTab();
});

export default FloatingActionTab;
