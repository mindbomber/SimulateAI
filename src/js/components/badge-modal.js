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

// Import js-confetti using package name - let Vite resolve it
import JSConfetti from 'js-confetti';
import { GLOW_INTENSITY_CLASSES } from '../data/badge-config.js';

/**
 * Badge Modal Class
 * Manages badge reveal modals with confetti animations
 */
export class BadgeModal {
  constructor() {
    this.isVisible = false;
    this.currentModal = null;
    this.confetti = new JSConfetti();
    this.ANIMATION_DURATION = {
      CONFETTI: 3000,
      CONFETTI_SECOND_DELAY: 500,
      CONFETTI_THIRD_DELAY: 1000,
      CONFETTI_FOURTH_DELAY: 1500,
      CONFETTI_FIFTH_DELAY: 2000,
      CONFETTI_SIMULTANEOUS: 10,
      CONFETTI_NEAR_SIMULTANEOUS: 50,
      CONFETTI_OVERLAP_SHORT: 100,
      CONFETTI_OVERLAP_MEDIUM: 150,
      CONFETTI_OVERLAP_LONG: 200,
      MODAL_ENTER: 600,
      MODAL_EXIT: 400,
      BADGE_SCALE: 800,
      SIDEKICK_ENTRANCE: 1200,
      ENTRANCE_DELAY: 100,
      SHIELD_DELAY: 200,
      SIDEKICK_DELAY: 400,
      TEXT_START_DELAY: 400,
      TEXT_STAGGER_DELAY: 100,
      TYPEWRITER_START_DELAY: 1000
    };
    
    this.PARTICLE_CONFIG = {
      COUNT: 15,
      MIN_SIZE: 2,
      SIZE_RANGE: 3,
      MAX_DELAY: 8,
      MIN_DURATION: 15,
      DURATION_RANGE: 10,
      DRIFT_MULTIPLIER: 100,
      DRIFT_OFFSET: 0.5
    };
    
    this.EMOJI_BUBBLE_CONFIG = {
      CATEGORY_COUNT: 8,
      SIDEKICK_COUNT: 6,
      MAX_DELAY: 12,
      MIN_DURATION: 8,
      DURATION_RANGE: 4,
      DRIFT_RANGE: 60
    };
    
    this.TYPEWRITER_CONFIG = {
      CHAR_SPEED: 20,
      CURSOR_DELAY: 600,
      START_DELAY: 50
    };
    
    this.BADGE_TIERS = {
      MAX_TIER: 3
    };
    
    this.bindEvents();
  }

  /**
   * Bind global event listeners
   */
  bindEvents() {
    // Close modal on escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.isVisible) {
        this.closeModal();
      }
    });

    // Close modal on backdrop click
    document.addEventListener('click', (e) => {
      if (e.target?.classList?.contains('badge-modal-backdrop') && this.isVisible) {
        this.closeModal();
      }
    });
  }

  /**
   * Shows a badge achievement modal with confetti
   * @param {Object} badgeConfig - Badge configuration object
   * @param {string} returnContext - Context to return to ('main' or 'category')
   */
  async showBadgeModal(badgeConfig, returnContext = 'main') {
    if (this.isVisible) {
      return; // Prevent multiple modals
    }

    this.isVisible = true;

    // Start confetti celebration
    this.triggerConfetti(badgeConfig.categoryEmoji, badgeConfig.tier);

    // Delay modal creation to appear with the third wave (second group)
    setTimeout(() => {
      // Create and show modal
      this.createModal(badgeConfig, returnContext);
      this.animateModalEntrance();
    }, this.ANIMATION_DURATION.CONFETTI_SECOND_DELAY);
  }

  /**
   * Triggers category-specific emoji confetti
   * @param {string} categoryEmoji - Category emoji for confetti
   */
  async triggerConfetti(categoryEmoji, badgeTier = 1) {
    // Wave 1 - Large confetti (immediate)
    this.confetti.addConfetti({
      emojis: [categoryEmoji],
      emojiSize: 60,
      confettiNumber: 15,
    });
    
    // Wave 2 - Medium confetti (virtually simultaneous with wave 1)
    setTimeout(() => {
      this.confetti.addConfetti({
        emojis: [categoryEmoji],
        emojiSize: 40,
        confettiNumber: 20,
      });
    }, this.ANIMATION_DURATION.CONFETTI_SIMULTANEOUS);
    
    // Wave 3 - Small confetti (after 500ms gap, with modal appearance)
    setTimeout(() => {
      this.confetti.addConfetti({
        emojis: [categoryEmoji],
        emojiSize: 25,
        confettiNumber: 10,
      });
    }, this.ANIMATION_DURATION.CONFETTI_SECOND_DELAY);

    // Wave 4 - Extra large finale for tier 3 badges only
    setTimeout(() => {
      if (badgeTier === this.BADGE_TIERS.MAX_TIER) {
        this.confetti.addConfetti({
          emojis: [categoryEmoji],
          emojiSize: 70,
          confettiNumber: 25,
        });
      }
    }, this.ANIMATION_DURATION.CONFETTI_THIRD_DELAY);
  }

  /**
   * Creates the badge modal DOM structure
   * @param {Object} badgeConfig - Badge configuration
   * @param {string} returnContext - Return context
   */
  createModal(badgeConfig, returnContext) {
    const modal = document.createElement('div');
    modal.className = 'badge-modal-backdrop';
    modal.innerHTML = this.generateModalHTML(badgeConfig, returnContext);
    
    document.body.appendChild(modal);
    this.currentModal = modal;

    // Add floating particles
    this.createFloatingParticles();

    // Add bubbling emoji effect
    this.createBubblingEmojis(badgeConfig.categoryEmoji, badgeConfig.sidekickEmoji);

    // Bind close button
    const closeBtn = modal.querySelector('.badge-close-btn');
    if (closeBtn) {
      closeBtn.addEventListener('click', () => this.closeModal());
    }

    // Initialize typewriter effect after modal is shown
    setTimeout(() => {
      this.initializeTypewriter(badgeConfig.quote);
    }, this.ANIMATION_DURATION.TYPEWRITER_START_DELAY);
  }

  /**
   * Generates the modal HTML structure
   * @param {Object} badgeConfig - Badge configuration
   * @param {string} returnContext - Return context
   * @returns {string} Modal HTML
   */
  generateModalHTML(badgeConfig, returnContext) {
    const timestamp = new Date(badgeConfig.timestamp).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });

    const glowClass = GLOW_INTENSITY_CLASSES[badgeConfig.glowIntensity] || 'badge-glow-low';
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
              Back to ${returnContext === 'category' ? 'Category' : 'Scenarios'}
            </button>
          </div>
        </div>
      </div>
    `;
  }

  /**
   * Gets tier-specific text
   * @param {number} tier - Badge tier
   * @returns {string} Tier description
   */
  getTierText(tier) {
    const tierMap = {
      1: 'your first scenario',
      2: 'three scenarios',
      3: 'all six scenarios'
    };
    return tierMap[tier] || `${tier} scenarios`;
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

    const modal = this.currentModal.querySelector('.badge-modal');
    const shield = this.currentModal.querySelector('.badge-shield');
    const sidekick = this.currentModal.querySelector('.badge-sidekick-emoji');
    const title = this.currentModal.querySelector('.badge-title');
    const quote = this.currentModal.querySelector('.badge-quote');
    const details = this.currentModal.querySelector('.badge-details');
    const footer = this.currentModal.querySelector('.badge-modal-footer');

    // Initial states
    modal.style.transform = 'scale(0.8)';
    modal.style.opacity = '0';
    sidekick.style.transform = 'scale(0) rotate(-180deg)';
    sidekick.style.opacity = '0';
    title.style.transform = 'translateY(20px)';
    title.style.opacity = '0';
    quote.style.transform = 'translateY(20px)';
    quote.style.opacity = '0';
    details.style.transform = 'translateY(20px)';
    details.style.opacity = '0';
    footer.style.transform = 'translateY(20px)';
    footer.style.opacity = '0';

    // Animate modal entrance
    setTimeout(() => {
      modal.style.transition = `all ${this.ANIMATION_DURATION.MODAL_ENTER}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      modal.style.transform = 'scale(1)';
      modal.style.opacity = '1';
    }, this.ANIMATION_DURATION.ENTRANCE_DELAY);

    // Animate shield scale
    setTimeout(() => {
      shield.style.transition = `transform ${this.ANIMATION_DURATION.BADGE_SCALE}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      shield.style.transform = 'scale(1.1)';
      
      setTimeout(() => {
        shield.style.transform = 'scale(1)';
      }, this.ANIMATION_DURATION.BADGE_SCALE);
    }, this.ANIMATION_DURATION.SHIELD_DELAY);

    // Animate sidekick emoji entrance
    setTimeout(() => {
      sidekick.style.transition = `all ${this.ANIMATION_DURATION.SIDEKICK_ENTRANCE}ms cubic-bezier(0.68, -0.55, 0.265, 1.55)`;
      sidekick.style.transform = 'scale(1) rotate(0deg)';
      sidekick.style.opacity = '1';
    }, this.ANIMATION_DURATION.SIDEKICK_DELAY);

    // Animate text elements with stagger
    const textElements = [title, quote, details, footer];
    textElements.forEach((element, index) => {
      setTimeout(() => {
        element.style.transition = 'all 400ms ease-out';
        element.style.transform = 'translateY(0)';
        element.style.opacity = '1';
      }, this.ANIMATION_DURATION.TEXT_START_DELAY + (index * this.ANIMATION_DURATION.TEXT_STAGGER_DELAY));
    });
  }

  /**
   * Closes the badge modal
   */
  closeModal() {
    if (!this.isVisible || !this.currentModal) return;

    const modal = this.currentModal.querySelector('.badge-modal');
    
    // Animate exit
    modal.style.transition = `all ${this.ANIMATION_DURATION.MODAL_EXIT}ms ease-in`;
    modal.style.transform = 'scale(0.9)';
    modal.style.opacity = '0';

    // Remove from DOM
    setTimeout(() => {
      if (this.currentModal) {
        document.body.removeChild(this.currentModal);
        this.currentModal = null;
      }
      this.isVisible = false;
    }, this.ANIMATION_DURATION.MODAL_EXIT);
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

    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles-container';
    
    const particleCount = this.PARTICLE_CONFIG.COUNT;
    for (let i = 0; i < particleCount; i++) {
      const particle = document.createElement('div');
      particle.className = 'floating-particle';
      
      // Random properties for each particle
      const size = Math.random() * this.PARTICLE_CONFIG.SIZE_RANGE + this.PARTICLE_CONFIG.MIN_SIZE;
      const left = Math.random() * 100; // 0-100%
      const animationDelay = Math.random() * this.PARTICLE_CONFIG.MAX_DELAY;
      const animationDuration = Math.random() * this.PARTICLE_CONFIG.DURATION_RANGE + this.PARTICLE_CONFIG.MIN_DURATION;
      const drift = (Math.random() - this.PARTICLE_CONFIG.DRIFT_OFFSET) * this.PARTICLE_CONFIG.DRIFT_MULTIPLIER;
      
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
  createBubblingEmojis(categoryEmoji, sidekickEmoji) {
    if (!this.currentModal) return;

    const bubblesContainer = document.createElement('div');
    bubblesContainer.className = 'emoji-bubbles-container';
    
    // Create category emoji bubbles
    for (let i = 0; i < this.EMOJI_BUBBLE_CONFIG.CATEGORY_COUNT; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubbling-emoji category';
      bubble.textContent = categoryEmoji;
      
      // Random properties for each bubble
      const left = Math.random() * 100; // 0-100%
      const animationDelay = Math.random() * this.EMOJI_BUBBLE_CONFIG.MAX_DELAY; // 0-12s
      const animationDuration = Math.random() * this.EMOJI_BUBBLE_CONFIG.DURATION_RANGE + this.EMOJI_BUBBLE_CONFIG.MIN_DURATION; // 8-12s
      const driftX = (Math.random() - this.PARTICLE_CONFIG.DRIFT_OFFSET) * this.EMOJI_BUBBLE_CONFIG.DRIFT_RANGE; // -30px to 30px horizontal drift
      
      bubble.style.cssText = `
        left: ${left}%;
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        --drift-x: ${driftX}px;
      `;
      
      bubblesContainer.appendChild(bubble);
    }
    
    // Create sidekick emoji bubbles
    for (let i = 0; i < this.EMOJI_BUBBLE_CONFIG.SIDEKICK_COUNT; i++) {
      const bubble = document.createElement('div');
      bubble.className = 'bubbling-emoji sidekick';
      bubble.textContent = sidekickEmoji;
      
      // Random properties for each bubble
      const left = Math.random() * 100; // 0-100%
      const animationDelay = Math.random() * this.EMOJI_BUBBLE_CONFIG.MAX_DELAY; // 0-12s
      const animationDuration = Math.random() * this.EMOJI_BUBBLE_CONFIG.DURATION_RANGE + this.EMOJI_BUBBLE_CONFIG.MIN_DURATION; // 8-12s
      const driftX = (Math.random() - this.PARTICLE_CONFIG.DRIFT_OFFSET) * this.EMOJI_BUBBLE_CONFIG.DRIFT_RANGE; // -30px to 30px horizontal drift
      
      bubble.style.cssText = `
        left: ${left}%;
        animation-delay: ${animationDelay}s;
        animation-duration: ${animationDuration}s;
        --drift-x: ${driftX}px;
      `;
      
      bubblesContainer.appendChild(bubble);
    }
    
    // Insert bubbles inside the modal as background
    const modal = this.currentModal.querySelector('.badge-modal');
    if (modal) {
      modal.insertBefore(bubblesContainer, modal.firstChild);
    }
  }

  /**
   * Initializes typewriter effect for quote text
   * @param {string} quote - The quote text to animate
   */
  initializeTypewriter(quote) {
    if (!this.currentModal) return;

    const quoteElement = this.currentModal.querySelector('.badge-quote');
    if (!quoteElement) return;

    // Reset quote content and prepare for typewriter
    quoteElement.textContent = '';
    
    // Set up typewriter styles with improved responsive handling
    quoteElement.style.whiteSpace = 'nowrap';
    quoteElement.style.overflow = 'hidden';
    quoteElement.style.width = '0';
    quoteElement.style.maxWidth = '100%';
    quoteElement.style.borderRight = '2px solid rgba(255, 255, 255, 0.8)';
    quoteElement.style.textOverflow = 'clip'; // Prevent ellipsis during animation
    
    // Start typewriter animation
    let charIndex = 0;
    const typeSpeed = this.TYPEWRITER_CONFIG.CHAR_SPEED;
    
    const typeCharacter = () => {
      if (charIndex < quote.length) {
        quoteElement.textContent += quote.charAt(charIndex);
        charIndex++;
        setTimeout(typeCharacter, typeSpeed);
      } else {
        // Remove cursor and allow proper text wrapping after typing is complete
        setTimeout(() => {
          quoteElement.style.borderRight = 'none';
          quoteElement.style.whiteSpace = 'normal';
          quoteElement.style.width = 'auto';
          quoteElement.style.overflow = 'visible';
          quoteElement.style.textOverflow = 'unset';
          quoteElement.style.wordWrap = 'break-word';
          quoteElement.style.overflowWrap = 'break-word';
          quoteElement.style.hyphens = 'auto';
        }, this.TYPEWRITER_CONFIG.CURSOR_DELAY);
      }
    };
    
    // Start the animation with faster CSS width animation
    quoteElement.style.animation = 'typewriter 1.5s steps(30) forwards';
    
    // Start character typing
    setTimeout(typeCharacter, this.TYPEWRITER_CONFIG.START_DELAY);
  }
}

// Create singleton instance
const badgeModal = new BadgeModal();

export default badgeModal;
