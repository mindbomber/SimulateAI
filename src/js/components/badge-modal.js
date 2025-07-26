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
 * Badge Modal Component
 *
 * Handles badge reveal animations, confetti effects, and modal presentation
 * for the SimulateAI badge achievement system.
 */

import logger from "../utils/logger.js";

// Import js-confetti from CDN for GitHub Pages compatibility
let JSConfetti;

// Dynamically import js-confetti
async function loadConfetti() {
  if (!JSConfetti) {
    try {
      const module = await import("https://cdn.skypack.dev/js-confetti@0.12.0");
      JSConfetti = module.default;
    } catch (error) {
      logger.warn(
        "Failed to load js-confetti, confetti effects will be disabled:",
        error,
      );
    }
  }
  return JSConfetti;
}

// Import enhanced badge configuration
import { GLOW_INTENSITY_CLASSES, BADGE_TIERS } from "../data/badge-config.js";

// Import badge modal configuration loader
import { loadBadgeModalConfig } from "../utils/badge-modal-config-loader.js";

/**
 * Badge Modal Class
 * Manages badge reveal modals with confetti animations
 */
export class BadgeModal {
  constructor() {
    this.isVisible = false;
    this.currentModal = null;
    this.confetti = null; // Will be initialized when needed
    this.config = null; // Badge modal configuration from JSON SSOT

    // Initialize configuration loading
    this.loadConfiguration();

    this.bindEvents();
  }

  /**
   * Initialize configuration from JSON SSOT
   */
  async loadConfiguration() {
    try {
      this.config = await loadBadgeModalConfig();
      logger.info("BadgeModal configuration loaded successfully");
      return true;
    } catch (error) {
      logger.error("Error loading BadgeModal configuration:", error);
      return false;
    }
  }

  /**
   * Bind global event listeners
   */
  bindEvents() {
    // Close modal on escape key
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible) {
        this.closeModal();
      }
    });

    // Close modal on backdrop click
    document.addEventListener("click", (e) => {
      if (
        e.target?.classList?.contains("badge-modal-backdrop") &&
        this.isVisible
      ) {
        this.closeModal();
      }
    });
  }

  /**
   * Shows a badge achievement modal with confetti
   * @param {Object} badgeConfig - Badge configuration object
   * @param {string} returnContext - Context to return to ('main' or 'category')
   * @param {Object} options - Additional options for the modal display
   */
  async showBadgeModal(badgeConfig, returnContext = "main", options = {}) {
    try {
      logger.info("🏆 BadgeModal.showBadgeModal called", {
        badgeConfig,
        returnContext,
        options,
      });

      if (this.isVisible) {
        logger.warn("Badge modal already visible, preventing multiple modals");
        return; // Prevent multiple modals
      }

      // Validate badge configuration
      if (!this.validateBadgeConfig(badgeConfig)) {
        logger.error("Invalid badge configuration provided:", badgeConfig);
        return;
      }

      // Ensure configuration is loaded
      if (!this.config) {
        logger.info("Loading badge modal configuration...");
        const configLoaded = await this.loadConfiguration();
        if (!configLoaded) {
          logger.error("Failed to load badge modal configuration");
          return;
        }
      }

      this.isVisible = true;

      // Start confetti celebration (options.showConfetti is for future use)
      logger.info("Starting confetti celebration...");
      this.triggerConfetti(badgeConfig.categoryEmoji, badgeConfig.tier);

      // Delay modal creation to appear with the confetti wave
      const delayDuration =
        this.config?.animations?.confetti?.secondWaveDelay || 500;

      setTimeout(() => {
        try {
          // Create and show modal
          logger.info("Creating and showing badge modal...");
          this.createModal(badgeConfig, returnContext);
          this.animateModalEntrance();
          logger.info("Badge modal displayed successfully");
        } catch (modalError) {
          logger.error("Error creating badge modal:", modalError);
          this.isVisible = false;
        }
      }, delayDuration);
    } catch (error) {
      logger.error("Error in showBadgeModal:", error);
      this.isVisible = false;
      throw error;
    }
  }

  /**
   * Validates badge configuration
   * @param {Object} badgeConfig - Badge configuration to validate
   * @returns {boolean} True if valid
   */
  validateBadgeConfig(badgeConfig) {
    if (!badgeConfig) {
      logger.error("Badge config is null or undefined");
      return false;
    }

    const requiredFields = ["title", "categoryEmoji", "sidekickEmoji", "quote"];
    const missingFields = requiredFields.filter((field) => !badgeConfig[field]);

    if (missingFields.length > 0) {
      logger.error("Missing required badge fields:", missingFields);
      logger.error("Badge config:", badgeConfig);
      return false;
    }

    // Add default values for optional fields
    if (!badgeConfig.timestamp) {
      badgeConfig.timestamp = Date.now();
      logger.warn("Badge config missing timestamp, using current time");
    }

    if (!badgeConfig.tier) {
      badgeConfig.tier = 1;
      logger.warn("Badge config missing tier, defaulting to 1");
    }

    if (!badgeConfig.glowIntensity) {
      badgeConfig.glowIntensity = "low";
      logger.warn("Badge config missing glowIntensity, defaulting to 'low'");
    }

    return true;
  }

  /**
   * Triggers category-specific emoji confetti
   * @param {string} categoryEmoji - Category emoji for confetti
   */
  async triggerConfetti(categoryEmoji, badgeTier = 1) {
    // Initialize confetti if not already loaded
    if (!this.confetti) {
      const ConfettiClass = await loadConfetti();
      if (ConfettiClass) {
        this.confetti = new ConfettiClass();
      } else {
        logger.warn("Confetti disabled - failed to load js-confetti library");
        return;
      }
    }

    // Ensure configuration is loaded
    if (!this.config) {
      await this.loadConfiguration();
    }

    const confettiConfig = this.config?.effects?.confetti || {};

    // Wave 1 - Large confetti (immediate)
    this.confetti.addConfetti({
      emojis: [categoryEmoji],
      emojiSize: confettiConfig.largeSizeEmoji || 60,
      confettiNumber: confettiConfig.largeSizeCount || 8,
    });

    // Wave 2 - Medium confetti (virtually simultaneous with wave 1)
    setTimeout(() => {
      this.confetti.addConfetti({
        emojis: [categoryEmoji],
        emojiSize: confettiConfig.mediumSizeEmoji || 40,
        confettiNumber: confettiConfig.mediumSizeCount || 10,
      });
    }, this.config?.animations?.confetti?.simultaneousDelay || 10);

    // Wave 3 - Small confetti (after delay, with modal appearance)
    setTimeout(() => {
      this.confetti.addConfetti({
        emojis: [categoryEmoji],
        emojiSize: confettiConfig.smallSizeEmoji || 25,
        confettiNumber: confettiConfig.smallSizeCount || 6,
      });
    }, this.config?.animations?.confetti?.secondWaveDelay || 500);

    // Wave 4 - Progressive finale effects based on tier
    setTimeout(() => {
      const finaleConfig = this.config?.effects?.confetti?.finale || {};
      const thresholds = finaleConfig.tierThresholds || {
        large: 3,
        epic: 6,
        legendary: 9,
      };

      // Special finale effects for higher tiers
      if (badgeTier >= thresholds.large) {
        // Tier 3+: Large finale
        this.confetti.addConfetti({
          emojis: [categoryEmoji],
          emojiSize: finaleConfig.largeSizeEmoji || 70,
          confettiNumber: finaleConfig.largeSizeCount || 12,
        });
      }

      if (badgeTier >= thresholds.epic) {
        // Tier 6+: Epic finale with multiple waves
        setTimeout(() => {
          this.confetti.addConfetti({
            emojis: [categoryEmoji],
            emojiSize: finaleConfig.epicSizeEmoji || 80,
            confettiNumber: finaleConfig.epicSizeCount || 15,
          });
        }, this.config?.animations?.confetti?.epicSecondWaveDelay || 200);
      }

      if (badgeTier >= thresholds.legendary) {
        // Tier 9+: Legendary finale
        setTimeout(() => {
          this.confetti.addConfetti({
            emojis: [categoryEmoji, "✨", "🌟"],
            emojiSize: finaleConfig.legendarySizeEmoji || 90,
            confettiNumber: finaleConfig.legendarySizeCount || 20,
          });
        }, this.config?.animations?.confetti?.legendaryWaveDelay || 400);
      }
    }, this.config?.animations?.confetti?.thirdWaveDelay || 1000);
  }

  /**
   * Creates the badge modal DOM structure
   * @param {Object} badgeConfig - Badge configuration
   * @param {string} returnContext - Return context
   */
  createModal(badgeConfig, returnContext) {
    const modal = document.createElement("div");
    modal.className = "badge-modal-backdrop";
    modal.innerHTML = this.generateModalHTML(badgeConfig, returnContext);

    document.body.appendChild(modal);
    this.currentModal = modal;

    // Add floating particles
    this.createFloatingParticles();

    // Add bubbling emoji effect
    this.createBubblingEmojis(
      badgeConfig.categoryEmoji,
      badgeConfig.sidekickEmoji,
    );

    // Bind close button
    const closeBtn = modal.querySelector(".badge-close-btn");
    if (closeBtn) {
      closeBtn.addEventListener("click", () => this.closeModal());
    }

    // Initialize typewriter effect after modal is shown
    const typewriterStartDelay =
      this.config?.animations?.typewriterStartDelay || 1000;
    setTimeout(() => {
      this.initializeTypewriter(badgeConfig.quote);
    }, typewriterStartDelay);
  }

  /**
   * Generates the modal HTML structure
   * @param {Object} badgeConfig - Badge configuration
   * @param {string} returnContext - Return context
   * @returns {string} Modal HTML
   */
  generateModalHTML(badgeConfig, returnContext) {
    // Handle timestamp safely - use current time if not provided
    const badgeTimestamp = badgeConfig.timestamp || Date.now();
    const timestamp = new Date(badgeTimestamp).toLocaleString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });

    const glowClass =
      GLOW_INTENSITY_CLASSES[badgeConfig.glowIntensity] || "badge-glow-low";
    const tierText = this.getTierText(badgeConfig.tier);
    const reasonText = this.getReasonText(badgeConfig, tierText);

    return `
      <div class="badge-modal">
        <div class="badge-modal-content">
          <div class="badge-visual-container">
            <div class="badge-shield ${glowClass}">
              <span class="badge-shield-emoji">🛡️</span>
              <span class="badge-category-emoji">${badgeConfig.categoryEmoji}</span>
              <span class="badge-sidekick-emoji">${badgeConfig.sidekickEmoji}</span>
            </div>
          </div>
          
          <div class="badge-text-content">
            <h2 class="badge-title">${badgeConfig.title}</h2>
            <p class="badge-quote">"${badgeConfig.quote}"</p>
            <div class="badge-details">
              <p class="badge-reason">${reasonText}</p>
              <p class="badge-timestamp">Earned: ${timestamp}</p>
            </div>
          </div>
          
          <div class="badge-modal-footer">
            <button class="badge-close-btn btn-primary">
              Back to ${returnContext === "category" ? "Category" : "Scenarios"}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gets tier-specific text with triangular progression support
   * @param {number} tier - Badge tier
   * @returns {string} Tier description
   */
  getTierText(tier) {
    // Find the requirement for this tier from BADGE_TIERS
    const tierConfig = BADGE_TIERS.find((t) => t.tier === tier);
    const requirement = tierConfig ? tierConfig.requirement : tier;

    // Special cases for lower tiers
    const specialCases = {
      1: "your first scenario",
      2: "three scenarios",
      3: "all six scenarios",
    };

    if (specialCases[tier]) {
      return specialCases[tier];
    }

    // For higher tiers, use the triangular number
    return `${requirement} scenarios`;
  }

  /**
   * Gets reason text for badge achievement
   * @param {Object} badgeConfig - Badge configuration
   * @param {string} tierText - Tier description text
   * @returns {string} Reason text
   */
  getReasonText(badgeConfig, tierText) {
    return `You've earned this badge for completing ${tierText} in the ${badgeConfig.categoryName} category.`;
  }

  /**
   * Animates modal entrance with staggered effects
   */
  animateModalEntrance() {
    if (!this.currentModal) return;

    const modal = this.currentModal.querySelector(".badge-modal");
    const shield = this.currentModal.querySelector(".badge-shield");
    const sidekick = this.currentModal.querySelector(".badge-sidekick-emoji");
    const title = this.currentModal.querySelector(".badge-title");
    const quote = this.currentModal.querySelector(".badge-quote");
    const details = this.currentModal.querySelector(".badge-details");
    const footer = this.currentModal.querySelector(".badge-modal-footer");

    // Get animation configuration with fallbacks
    const animConfig = this.config?.animations || {};
    const modalEnterDuration = animConfig.modalEnterDuration || 600;
    const badgeScaleDuration = animConfig.badgeScaleDuration || 800;
    const sidekickEntranceDuration =
      animConfig.sidekickEntranceDuration || 1200;
    const entranceDelay = animConfig.entranceDelay || 100;
    const shieldDelay = animConfig.shieldDelay || 200;
    const sidekickDelay = animConfig.sidekickDelay || 400;
    const textStartDelay = animConfig.textStartDelay || 400;
    const textStaggerDelay = animConfig.textStaggerDelay || 100;

    // Initial states
    modal.style.transform = "scale(0.8)";
    modal.style.opacity = "0";
    sidekick.style.transform = "scale(0) rotate(-180deg)";
    sidekick.style.opacity = "0";
    title.style.transform = "translateY(20px)";
    title.style.opacity = "0";
    quote.style.transform = "translateY(20px)";
    quote.style.opacity = "0";
    details.style.transform = "translateY(20px)";
    details.style.opacity = "0";
    footer.style.transform = "translateY(20px)";
    footer.style.opacity = "0";

    // Animate modal entrance
    setTimeout(() => {
      modal.style.transition = `all ${modalEnterDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      modal.style.transform = "scale(1)";
      modal.style.opacity = "1";
    }, entranceDelay);

    // Animate shield scale
    setTimeout(() => {
      shield.style.transition = `transform ${badgeScaleDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      shield.style.transform = "scale(1.1)";

      setTimeout(() => {
        shield.style.transform = "scale(1)";
      }, badgeScaleDuration);
    }, shieldDelay);

    // Animate sidekick emoji entrance
    setTimeout(() => {
      sidekick.style.transition = `all ${sidekickEntranceDuration}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      sidekick.style.transform = "scale(1) rotate(0deg)";
      sidekick.style.opacity = "1";
    }, sidekickDelay);

    // Animate text elements with stagger
    const textElements = [title, quote, details, footer];
    textElements.forEach((element, index) => {
      setTimeout(
        () => {
          element.style.transition = "all 400ms ease-out";
          element.style.transform = "translateY(0)";
          element.style.opacity = "1";
        },
        textStartDelay + index * textStaggerDelay,
      );
    });
  }

  /**
   * Closes the badge modal
   */
  closeModal() {
    logger.info("🔒 BadgeModal.closeModal called");

    if (!this.isVisible || !this.currentModal) {
      logger.warn("Badge modal already closed or not visible");
      return;
    }

    const modal = this.currentModal.querySelector(".badge-modal");
    const modalExitDuration = this.config?.animations?.modalExitDuration || 400;

    logger.info("Animating badge modal exit...");

    // Animate exit
    modal.style.transition = `all ${modalExitDuration}ms ease-in`;
    modal.style.transform = "scale(0.9)";
    modal.style.opacity = "0";

    // Remove from DOM
    setTimeout(() => {
      if (this.currentModal) {
        document.body.removeChild(this.currentModal);
        this.currentModal = null;
        logger.info("Badge modal removed from DOM");
      }
      this.isVisible = false;
      logger.info("Badge modal closed successfully");
    }, modalExitDuration);
  }

  /**
   * Checks if modal is currently visible
   * @returns {boolean} True if modal is visible
   */
  isModalVisible() {
    return this.isVisible;
  }

  /**
   * Force closes modal (for cleanup)
   */
  forceClose() {
    if (this.currentModal) {
      document.body.removeChild(this.currentModal);
      this.currentModal = null;
    }
    this.isVisible = false;
  }

  /**
   * Creates floating particles for background atmosphere
   */
  createFloatingParticles() {
    if (!this.currentModal) return;

    const particlesContainer = document.createElement("div");
    particlesContainer.className = "particles-container";

    // Get particle configuration with fallbacks
    const particleConfig = this.config?.effects?.particles || {};
    const particleCount = particleConfig.count || 8;

    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement("div");
      particle.className = "floating-particle";

      // Random properties for each particle
      const size =
        Math.random() * (particleConfig.sizeRange || 3) +
        (particleConfig.minSize || 2);
      const left = Math.random() * 100; // 0-100%
      const animationDelay = Math.random() * (particleConfig.maxDelay || 8);
      const animationDuration =
        Math.random() * (particleConfig.durationRange || 10) +
        (particleConfig.minDuration || 15);
      const drift =
        (Math.random() - (particleConfig.driftOffset || 0.5)) *
        (particleConfig.driftMultiplier || 100);

      particle.style.cssText = `
        width: ${size}px;
        height: ${size}px;
        left: ${left}%;
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        --drift: ${drift}px;
      `;

      particlesContainer.appendChild(particle);
    }

    // Insert particles behind modal content
    const modalBackdrop = this.currentModal;
    modalBackdrop.insertBefore(particlesContainer, modalBackdrop.firstChild);
  }

  /**
   * Creates bubbling emoji background effect
   * @param {string} categoryEmoji - Category emoji to bubble
   * @param {string} sidekickEmoji - Sidekick emoji to bubble
   */
  /**
   * Creates bubbling emoji effects
   * @param {string} categoryEmoji - Category emoji for bubbles
   * @param {string} sidekickEmoji - Sidekick emoji for bubbles
   */
  createBubblingEmojis(categoryEmoji, sidekickEmoji) {
    if (!this.currentModal) return;

    const bubblesContainer = document.createElement("div");
    bubblesContainer.className = "emoji-bubbles-container";

    // Get bubble configuration with fallbacks
    const bubbleConfig = this.config?.effects?.bubbles || {};
    const categoryCount = bubbleConfig.categoryCount || 4;
    const sidekickCount = bubbleConfig.sidekickCount || 3;
    const maxDelay = bubbleConfig.maxDelay || 12;
    const minDuration = bubbleConfig.minDuration || 8;
    const durationRange = bubbleConfig.durationRange || 4;
    const driftRange = bubbleConfig.driftRange || 60;
    const driftOffset = bubbleConfig.driftOffset || 0.5;

    // Create category emoji bubbles
    for (let i = 0; i < categoryCount; i++) {
      const bubble = document.createElement("div");
      bubble.className = "bubbling-emoji category";
      bubble.textContent = categoryEmoji;

      // Random properties for each bubble
      const left = Math.random() * 100; // 0-100%
      const animationDelay = Math.random() * maxDelay; // 0-12s
      const animationDuration = Math.random() * durationRange + minDuration; // 8-12s
      const driftX = (Math.random() - driftOffset) * driftRange; // -30px to 30px horizontal drift

      bubble.style.cssText = `
        left: ${left}%;
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        --drift-x: ${driftX}px;
      `;

      bubblesContainer.appendChild(bubble);
    }

    // Create sidekick emoji bubbles
    for (let i = 0; i < sidekickCount; i++) {
      const bubble = document.createElement("div");
      bubble.className = "bubbling-emoji sidekick";
      bubble.textContent = sidekickEmoji;

      // Random properties for each bubble
      const left = Math.random() * 100; // 0-100%
      const animationDelay = Math.random() * maxDelay; // 0-12s
      const animationDuration = Math.random() * durationRange + minDuration; // 8-12s
      const driftX = (Math.random() - driftOffset) * driftRange; // -30px to 30px horizontal drift

      bubble.style.cssText = `
        left: ${left}%;
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        --drift-x: ${driftX}px;
      `;

      bubblesContainer.appendChild(bubble);
    }

    // Append bubbles container to modal content (behind content) for proper positioning
    const modalContent = this.currentModal.querySelector(
      ".badge-modal-content",
    );
    if (modalContent) {
      modalContent.appendChild(bubblesContainer);
    } else {
      // Fallback to modal if content not found
      this.currentModal.appendChild(bubblesContainer);
    }
  }

  /**
   * Initializes typewriter effect for quote text
   * @param {string} quote - The quote text to animate
   */
  initializeTypewriter(quote) {
    if (!this.currentModal) return;

    const quoteElement = this.currentModal.querySelector(".badge-quote");
    if (!quoteElement) return;

    // Get typewriter configuration with fallbacks
    const typewriterConfig = this.config?.effects?.typewriter || {};
    const typeSpeed = typewriterConfig.characterSpeed || 20;
    const cursorDelay = typewriterConfig.cursorDelay || 600;
    const startDelay = typewriterConfig.startDelay || 50;

    // Reset quote content and prepare for typewriter
    quoteElement.textContent = "";

    // Set up typewriter styles with improved responsive handling
    quoteElement.style.whiteSpace = "nowrap";
    quoteElement.style.overflow = "hidden";
    quoteElement.style.width = "0";
    quoteElement.style.maxWidth = "100%";
    quoteElement.style.borderRight = "2px solid rgba(255, 255, 255, 0.8)";
    quoteElement.style.textOverflow = "clip"; // Prevent ellipsis during animation

    // Start typewriter animation
    let charIndex = 0;

    const typeCharacter = () => {
      if (charIndex < quote.length) {
        quoteElement.textContent += quote.charAt(charIndex);
        charIndex++;
        setTimeout(typeCharacter, typeSpeed);
      } else {
        // Remove cursor and allow proper text wrapping after typing is complete
        setTimeout(() => {
          quoteElement.style.borderRight = "none";
          quoteElement.style.whiteSpace = "normal";
          quoteElement.style.width = "auto";
          quoteElement.style.overflow = "visible";
          quoteElement.style.textOverflow = "unset";
          quoteElement.style.wordWrap = "break-word";
          quoteElement.style.overflowWrap = "break-word";
          quoteElement.style.hyphens = "auto";
        }, cursorDelay);
      }
    };

    // Start the animation with faster CSS width animation
    quoteElement.style.animation = "typewriter 1.5s steps(30) forwards";

    // Start character typing
    setTimeout(typeCharacter, startDelay);
  }
}

// Create singleton instance
const badgeModal = new BadgeModal();

export default badgeModal;
