/**
 * Hero Animation Performance Optimizer
 * Manages will-change properties for optimal performance
 * Cleans up GPU acceleration hints after animations complete
 *
 * @version 1.70.0
 * @since 2025-01-31
 */

class HeroAnimationOptimizer {
  constructor() {
    this.animationTimeout = null;
    this.elementsToCleanup = [
      ".hero",
      ".hero-content",
      ".hero-content h1",
      ".hero-content p",
      ".hero-simulation",
      ".hero-actions",
    ];

    // Total animation duration including delays (800ms + 200ms delay)
    this.totalAnimationDuration = 1000;
  }

  /**
   * Initialize the performance optimizer
   * Sets up cleanup after animations complete
   */
  initialize() {
    // Wait for DOM to be ready
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => this.setupCleanup());
    } else {
      this.setupCleanup();
    }
  }

  /**
   * Setup cleanup after animations complete
   */
  setupCleanup() {
    // Clear any existing timeout
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }

    // Wait for animations to complete, then clean up will-change
    this.animationTimeout = setTimeout(() => {
      this.cleanupWillChange();
    }, this.totalAnimationDuration + 200); // Extra 200ms buffer
  }

  /**
   * Remove will-change properties after animations complete
   * This helps maintain optimal performance
   */
  cleanupWillChange() {
    this.elementsToCleanup.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      elements.forEach((element) => {
        if (element && element.style) {
          element.style.willChange = "auto";
        }
      });
    });

    console.log(
      "🎯 Hero animations complete - will-change properties cleaned up for optimal performance",
    );
  }

  /**
   * Force cleanup (useful for testing or manual cleanup)
   */
  forceCleanup() {
    if (this.animationTimeout) {
      clearTimeout(this.animationTimeout);
    }
    this.cleanupWillChange();
  }

  /**
   * Reinitialize animations (useful for SPA navigation)
   */
  reinitialize() {
    this.setupCleanup();
  }
}

// Auto-initialize when script loads
const heroAnimationOptimizer = new HeroAnimationOptimizer();
heroAnimationOptimizer.initialize();

// Make available globally for manual control if needed
window.heroAnimationOptimizer = heroAnimationOptimizer;

export default HeroAnimationOptimizer;
