/**
 * Donor Flair Display Component
 * Shows donor recognition badges and flair throughout the platform
 */

class DonorFlairDisplay {
  constructor() {
    this.flairMapping = {
      bronze: {
        emoji: '🥉',
        name: 'Bronze Supporter',
        color: '#cd7f32',
        tier: 1,
        description: 'Contributed $5+ to AI ethics research',
        threshold: 5,
      },
      silver: {
        emoji: '🥈',
        name: 'Silver Patron',
        color: '#c0c0c0',
        tier: 2,
        description: 'Contributed $10+ to AI ethics research',
        threshold: 10,
      },
      gold: {
        emoji: '🏆',
        name: 'Gold Champion',
        color: '#ffd700',
        tier: 3,
        description: 'Contributed $20+ to AI ethics research',
        threshold: 20,
      },
    };
  }

  /**
   * Get flair information for a given flair type
   */
  getFlairInfo(flairType) {
    return this.flairMapping[flairType] || null;
  }

  /**
   * Create a flair badge element
   */
  createFlairBadge(flairType, options = {}) {
    const flairInfo = this.getFlairInfo(flairType);
    if (!flairInfo) return null;

    const defaultOptions = {
      showTooltip: true,
      showText: false,
      size: 'normal', // 'small', 'normal', 'large'
      style: 'inline', // 'inline', 'block', 'floating'
    };

    const config = { ...defaultOptions, ...options };

    const badge = document.createElement('span');
    badge.className = `donor-flair-badge ${config.size} ${config.style}`;
    badge.setAttribute('data-tier', flairInfo.tier);
    badge.setAttribute('data-flair', flairType);

    // Set up the badge content
    let content = flairInfo.emoji;
    if (config.showText) {
      content += ` ${flairInfo.name}`;
    }
    badge.textContent = content;

    // Add tooltip if enabled
    if (config.showTooltip) {
      badge.title = flairInfo.description;
      badge.setAttribute('aria-label', flairInfo.description);
    }

    // Add color styling
    badge.style.setProperty('--flair-color', flairInfo.color);

    return badge;
  }

  /**
   * Enhanced display name with flair
   */
  formatDisplayNameWithFlair(displayName, flairType, options = {}) {
    const defaultOptions = {
      flairPosition: 'before', // 'before', 'after'
      separator: ' ',
    };

    const config = { ...defaultOptions, ...options };
    const flairInfo = this.getFlairInfo(flairType);

    if (!flairInfo) return displayName;

    const flairBadge = flairInfo.emoji;

    if (config.flairPosition === 'before') {
      return `${flairBadge}${config.separator}${displayName}`;
    } else {
      return `${displayName}${config.separator}${flairBadge}`;
    }
  }

  /**
   * Add flair to existing username elements on the page
   */
  enhanceExistingUsernames() {
    // Find elements with user data
    const userElements = document.querySelectorAll('[data-user-flair]');

    userElements.forEach(element => {
      const flairType = element.getAttribute('data-user-flair');
      const currentText = element.textContent;

      if (flairType && this.getFlairInfo(flairType)) {
        const enhancedText = this.formatDisplayNameWithFlair(
          currentText,
          flairType
        );
        element.textContent = enhancedText;
        element.classList.add('has-donor-flair');
      }
    });
  }

  /**
   * Create a donor appreciation section
   */
  createDonorAppreciationSection(containerSelector, donors = []) {
    const container = document.querySelector(containerSelector);
    if (!container) return;

    const section = document.createElement('div');
    section.className = 'donor-appreciation-section';
    section.innerHTML = `
      <h3 class="appreciation-title">
        <span class="appreciation-icon">💝</span>
        Thank You to Our Supporters!
      </h3>
      <div class="donor-showcase">
        ${this.renderDonorShowcase(donors)}
      </div>
      <div class="become-supporter">
        <p>Want to see your name here?</p>
        <button class="btn btn-outline become-supporter-btn">
          💖 Become a Supporter
        </button>
      </div>
    `;

    container.appendChild(section);

    // Add event listener for become supporter button
    const becomeBtn = section.querySelector('.become-supporter-btn');
    if (becomeBtn) {
      becomeBtn.addEventListener('click', () => {
        this.scrollToDonationSection();
      });
    }
  }

  /**
   * Render donor showcase
   */
  renderDonorShowcase(donors) {
    if (!donors || donors.length === 0) {
      return `
        <div class="donor-placeholder">
          <p>Be the first to support AI ethics research!</p>
        </div>
      `;
    }

    // Group donors by tier
    const groupedDonors = this.groupDonorsByTier(donors);

    return Object.entries(groupedDonors)
      .sort(([a], [b]) => b - a) // Sort by tier descending
      .map(([tier, tierDonors]) => this.renderTierGroup(tier, tierDonors))
      .join('');
  }

  /**
   * Group donors by their tier
   */
  groupDonorsByTier(donors) {
    return donors.reduce((groups, donor) => {
      const tier = this.getFlairInfo(donor.flair)?.tier || 0;
      if (!groups[tier]) groups[tier] = [];
      groups[tier].push(donor);
      return groups;
    }, {});
  }

  /**
   * Render a tier group of donors
   */
  renderTierGroup(tier, donors) {
    const flairType = Object.keys(this.flairMapping).find(
      key => this.flairMapping[key].tier === parseInt(tier)
    );

    if (!flairType) return '';

    const flairInfo = this.flairMapping[flairType];

    return `
      <div class="donor-tier-group" data-tier="${tier}">
        <h4 class="tier-title">
          <span class="tier-flair">${flairInfo.emoji}</span>
          ${flairInfo.name}s
        </h4>
        <div class="donor-list">
          ${donors.map(donor => this.renderDonorCard(donor)).join('')}
        </div>
      </div>
    `;
  }

  /**
   * Render individual donor card
   */
  renderDonorCard(donor) {
    const flairBadge = this.createFlairBadge(donor.flair, {
      showTooltip: true,
      size: 'small',
    });

    return `
      <div class="donor-card">
        <div class="donor-info">
          <span class="donor-name">${donor.displayName || 'Anonymous'}</span>
          <span class="donor-flair">${flairBadge ? flairBadge.outerHTML : ''}</span>
        </div>
        <div class="donor-date">
          Supporter since ${this.formatDate(donor.supportSince)}
        </div>
      </div>
    `;
  }

  /**
   * Format date for display
   */
  formatDate(dateString) {
    if (!dateString) return 'Recently';

    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
      });
    } catch {
      return 'Recently';
    }
  }

  /**
   * Scroll to donation section
   */
  scrollToDonationSection() {
    const donationSection = document.querySelector(
      '#homepage-donation-button, .donation-widget-container, .enhanced-donation-widget'
    );
    if (donationSection) {
      donationSection.scrollIntoView({
        behavior: 'smooth',
        block: 'center',
      });
    } else {
      // Fallback - open donation page
      window.open('donate.html', '_blank');
    }
  }

  /**
   * Add flair animations
   */
  addFlairAnimations() {
    const style = document.createElement('style');
    style.textContent = `
      .donor-flair-badge {
        display: inline-block;
        animation: subtle-glow 3s ease-in-out infinite alternate;
      }
      
      .donor-flair-badge[data-tier="3"] {
        animation: gold-shimmer 4s ease-in-out infinite;
      }
      
      @keyframes subtle-glow {
        0% { text-shadow: 0 0 2px rgba(255, 215, 0, 0.3); }
        100% { text-shadow: 0 0 8px rgba(255, 215, 0, 0.6); }
      }
      
      @keyframes gold-shimmer {
        0%, 100% { text-shadow: 0 0 4px rgba(255, 215, 0, 0.5); }
        50% { text-shadow: 0 0 12px rgba(255, 215, 0, 0.8), 0 0 20px rgba(255, 215, 0, 0.4); }
      }
    `;
    document.head.appendChild(style);
  }

  /**
   * Initialize flair display system
   */
  init() {
    this.addFlairAnimations();
    this.enhanceExistingUsernames();

    // Set up mutation observer to handle dynamically added content
    this.setupMutationObserver();
  }

  /**
   * Set up mutation observer for dynamic content
   */
  setupMutationObserver() {
    const observer = new MutationObserver(mutations => {
      mutations.forEach(mutation => {
        mutation.addedNodes.forEach(node => {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const flairElements = node.querySelectorAll('[data-user-flair]');
            flairElements.forEach(element => {
              const flairType = element.getAttribute('data-user-flair');
              if (flairType && !element.classList.contains('has-donor-flair')) {
                const currentText = element.textContent;
                const enhancedText = this.formatDisplayNameWithFlair(
                  currentText,
                  flairType
                );
                element.textContent = enhancedText;
                element.classList.add('has-donor-flair');
              }
            });
          }
        });
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  /**
   * Calculate flair tier based on cumulative donation amount
   * Supports multiple donations - users can donate multiple times and tier up
   */
  calculateFlairFromAmount(totalAmount) {
    if (totalAmount >= this.flairMapping.gold.threshold) {
      return 'gold';
    } else if (totalAmount >= this.flairMapping.silver.threshold) {
      return 'silver';
    } else if (totalAmount >= this.flairMapping.bronze.threshold) {
      return 'bronze';
    }
    return null;
  }

  /**
   * Get all donation amounts for a user and calculate current flair
   * This method should be called after each donation to update user flair
   */
  async updateUserFlairFromDonations(userId) {
    try {
      // In a real implementation, this would query the database for all user donations
      // For now, we'll simulate the cumulative tracking logic

      if (!window.firebase || !window.firebase.firestore) {
        console.warn('Firebase not available for flair calculation');
        return null;
      }

      const db = window.firebase.firestore();
      const userDoc = await db.collection('users').doc(userId).get();

      if (userDoc.exists) {
        const userData = userDoc.data();
        const totalDonated = userData.totalDonated || 0;
        const newFlair = this.calculateFlairFromAmount(totalDonated);

        // Update user document with new flair if it changed
        if (newFlair && userData.donorFlair !== newFlair) {
          await db.collection('users').doc(userId).update({
            donorFlair: newFlair,
            flairUpdatedAt: new Date(),
          });

        }

        return newFlair;
      }
    } catch (error) {
      console.error('Error updating user flair:', error);
    }

    return null;
  }

  /**
   * Record a new donation and update user flair
   */
  async recordDonationAndUpdateFlair(userId, donationAmount) {
    try {
      if (!window.firebase || !window.firebase.firestore) {
        console.warn('Firebase not available for donation recording');
        return null;
      }

      const db = window.firebase.firestore();
      const userRef = db.collection('users').doc(userId);

      // Use transaction to safely update total
      await db.runTransaction(async transaction => {
        const userDoc = await transaction.get(userRef);

        if (userDoc.exists) {
          const userData = userDoc.data();
          const currentTotal = userData.totalDonated || 0;
          const newTotal = currentTotal + donationAmount;
          const newFlair = this.calculateFlairFromAmount(newTotal);

          transaction.update(userRef, {
            totalDonated: newTotal,
            donorFlair: newFlair,
            lastDonationAmount: donationAmount,
            lastDonationDate: new Date(),
            flairUpdatedAt: new Date(),
          });
        } else {
          // Create new user record
          const newFlair = this.calculateFlairFromAmount(donationAmount);
          transaction.set(userRef, {
            totalDonated: donationAmount,
            donorFlair: newFlair,
            lastDonationAmount: donationAmount,
            lastDonationDate: new Date(),
            flairUpdatedAt: new Date(),
            createdAt: new Date(),
          });
        }
      });

      // Return updated flair
      return await this.updateUserFlairFromDonations(userId);
    } catch (error) {
      console.error('Error recording donation:', error);
      return null;
    }
  }

  // Static methods for easy access
  static init() {
    const instance = new DonorFlairDisplay();
    instance.init();
    return instance;
  }

  static formatName(displayName, flairType, options = {}) {
    const instance = new DonorFlairDisplay();
    return instance.formatDisplayNameWithFlair(displayName, flairType, options);
  }
}

// Make available globally
window.DonorFlairDisplay = DonorFlairDisplay;

// Auto-initialize if DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    DonorFlairDisplay.init();
  });
} else {
  DonorFlairDisplay.init();
}
