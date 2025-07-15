/**
 * Enhanced Donation Widget
 * Provides both anonymous and authenticated donation options
 * with flair incentives for authenticated users
 */

class EnhancedDonationWidget {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;
    this.donationTiers = [
      {
        id: 1,
        amount: 5,
        name: 'Bronze Supporter',
        flair: '🥉',
        priceId: 'price_1RkyADJDA3nPZHAFQJr2ySBR', // $5 Bronze tier
      },
      {
        id: 2,
        amount: 10,
        name: 'Silver Patron',
        flair: '🥈',
        priceId: 'price_1RkyADJDA3nPZHAFXasv2dM0', // $10 Silver tier
      },
      {
        id: 3,
        amount: 20,
        name: 'Gold Champion',
        flair: '🏆',
        priceId: 'price_1RkyADJDA3nPZHAFoyRLGmpQ', // $20 Gold tier
      },
    ];

    this.init();
  }

  /**
   * Get Stripe publishable key from environment
   */
  getStripeKey() {
    const key =
      window.envConfig?.getStripePublishableKey() ||
      import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY;

    if (!key || key === 'PLACEHOLDER_KEY') {
      throw new Error(
        'Stripe publishable key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY environment variable.'
      );
    }

    return key;
  }

  async init() {
    // Check authentication status
    if (window.firebase && window.firebase.auth) {
      window.firebase.auth().onAuthStateChanged(user => {
        this.isAuthenticated = !!user;
        this.currentUser = user;
        this.updateUI();
      });
    }
  }

  render(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    const defaultOptions = {
      title: '💖 Support SimulateAI Research',
      subtitle: 'Help advance AI ethics education for everyone',
      showBenefits: true,
      style: 'accordion', // 'card', 'inline', 'minimal', 'accordion'
    };

    const config = { ...defaultOptions, ...options };

    if (config.style === 'accordion') {
      container.innerHTML = this.renderAccordionVersion(config);
    } else {
      container.innerHTML = this.renderCardVersion(config);
    }

    this.attachEventListeners();
    this.updateUI();
  }

  renderAccordionVersion(config) {
    return `
      <div class="donation-accordion">
        <div class="accordion-item">
          <div class="accordion-header" role="button" tabindex="0" aria-expanded="false" onclick="window.donationWidget.toggleDonationAccordion()">
            <span class="accordion-icon">▶</span>
            <span class="accordion-title">${config.title}</span>
            <span class="accordion-subtitle">${config.subtitle}</span>
          </div>
          <div class="accordion-content collapsed">
            <div class="accordion-content-inner">
              <div class="enhanced-donation-widget card">
                <!-- Authentication Status Banner -->
                <div class="auth-status-banner" id="auth-status-banner">
                  ${this.renderAuthBanner()}
                </div>

                <!-- Donation Options -->
                <div class="donation-options">
                  <div class="donation-type-selector">
                    <button class="donation-type-btn active" data-type="quick" id="quick-donate-btn">
                      ⚡ Quick Donate
                      <span class="type-description">Anonymous, no account needed</span>
                    </button>
                    <button class="donation-type-btn" data-type="recognized" id="recognized-donate-btn">
                      🏆 Donate & Get Recognition
                      <span class="type-description">Get supporter badge & flair</span>
                    </button>
                  </div>

                  <!-- Tier Selection -->
                  <div class="tier-selection" id="tier-selection">
                    ${this.renderTierOptions()}
                  </div>

                  <!-- Benefits Section -->
                  ${config.showBenefits ? this.renderBenefits() : ''}

                  <!-- Instructions -->
                  <div class="donation-instructions">
                    <p class="instruction-text">
                      💳 Click any tier above to proceed to secure checkout
                    </p>
                    <div class="donation-security">
                      🔒 Secured by Stripe
                    </div>
                  </div>
                </div>

                <!-- Post-Donation Recognition Prompt -->
                <div class="recognition-prompt hidden" id="recognition-prompt">
                  ${this.renderRecognitionPrompt()}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
  }

  renderCardVersion(config) {
    return `
      <div class="enhanced-donation-widget ${config.style}">
        <div class="donation-header">
          <h3 class="donation-title">${config.title}</h3>
          <p class="donation-subtitle">${config.subtitle}</p>
        </div>

        <!-- Authentication Status Banner -->
        <div class="auth-status-banner" id="auth-status-banner">
          ${this.renderAuthBanner()}
        </div>

        <!-- Donation Options -->
        <div class="donation-options">
          <div class="donation-type-selector">
            <button class="donation-type-btn active" data-type="quick" id="quick-donate-btn">
              ⚡ Quick Donate
              <span class="type-description">Anonymous, no account needed</span>
            </button>
            <button class="donation-type-btn" data-type="recognized" id="recognized-donate-btn">
              🏆 Donate & Get Recognition
              <span class="type-description">Get supporter badge & flair</span>
            </button>
          </div>

          <!-- Tier Selection -->
          <div class="tier-selection" id="tier-selection">
            ${this.renderTierOptions()}
          </div>

          <!-- Benefits Section -->
          ${config.showBenefits ? this.renderBenefits() : ''}

          <!-- Instructions -->
          <div class="donation-instructions">
            <p class="instruction-text">
              💳 Click any tier above to proceed to secure checkout
            </p>
            <div class="donation-security">
              🔒 Secured by Stripe
            </div>
          </div>
        </div>

        <!-- Post-Donation Recognition Prompt -->
        <div class="recognition-prompt hidden" id="recognition-prompt">
          ${this.renderRecognitionPrompt()}
        </div>
      </div>
    `;
  }

  renderAuthBanner() {
    if (this.isAuthenticated) {
      const userFlair = this.getUserFlair();
      const userName =
        this.currentUser?.displayName || this.currentUser?.email || 'User';

      return `
        <div class="auth-banner authenticated">
          <div class="user-info">
            <span class="user-name">${userName} ${userFlair}</span>
            <span class="auth-status">✅ You'll receive recognition for your donation</span>
          </div>
        </div>
      `;
    } else {
      return `
        <div class="auth-banner not-authenticated">
          <div class="auth-message">
            <span class="auth-icon">👤</span>
            <span class="auth-text">
              <strong>Want recognition?</strong> 
              <a href="#" class="auth-link" id="sign-in-link">Sign in</a> to get your supporter badge!
            </span>
          </div>
        </div>
      `;
    }
  }

  renderTierOptions() {
    return this.donationTiers
      .map(
        tier => `
      <div class="tier-option" data-tier="${tier.id}">
        <div class="tier-header">
          <span class="tier-flair">${tier.flair}</span>
          <span class="tier-name">${tier.name}</span>
          <span class="tier-amount">$${tier.amount}</span>
        </div>
        <div class="tier-description">
          ${this.getTierDescription(tier)}
        </div>
      </div>
    `
      )
      .join('');
  }

  getTierDescription(tier) {
    const descriptions = {
      1: 'Support basic research and development',
      2: 'Help fund new simulation scenarios',
      3: 'Enable major platform enhancements',
    };
    return descriptions[tier.id] || '';
  }

  renderBenefits() {
    return `
      <div class="donation-benefits">
        <h4>Your Impact</h4>
        <div class="benefits-grid">
          <div class="benefit-item">
            <span class="benefit-icon">🔬</span>
            <span class="benefit-text">Fund AI ethics research</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🎓</span>
            <span class="benefit-text">Create educational content</span>
          </div>
          <div class="benefit-item">
            <span class="benefit-icon">🌍</span>
            <span class="benefit-text">Keep platform free & open</span>
          </div>
          <div class="benefit-item authenticated-only ${this.isAuthenticated ? '' : 'hidden'}">
            <span class="benefit-icon">🏆</span>
            <span class="benefit-text">Get supporter recognition</span>
          </div>
        </div>
      </div>
    `;
  }

  renderRecognitionPrompt() {
    return `
      <div class="recognition-content">
        <h4>🎉 Thank You for Your Support!</h4>
        <p>Your donation helps advance AI ethics education.</p>
        <div class="recognition-actions">
          <button class="btn btn-outline" id="create-account-btn">
            Create Account & Get Recognition
          </button>
          <button class="btn btn-text" id="skip-recognition-btn">
            Continue as Anonymous
          </button>
        </div>
      </div>
    `;
  }

  attachEventListeners() {
    // Use event delegation for buttons that might be inside collapsed accordion content
    const container = document.body;

    // Remove any existing listeners to prevent duplicates
    if (this.handleDelegatedClick) {
      container.removeEventListener('click', this.handleDelegatedClick);
    }

    // Bind the event handler to this instance
    this.handleDelegatedClick = e => {
      // Donation type selector
      if (e.target.classList.contains('donation-type-btn')) {
        document
          .querySelectorAll('.donation-type-btn')
          .forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        this.updateTierDisplay();
        return;
      }

      // Tier selection - directly process donation
      if (e.target.closest('.tier-option')) {
        const tierOption = e.target.closest('.tier-option');

        document
          .querySelectorAll('.tier-option')
          .forEach(o => o.classList.remove('selected'));
        tierOption.classList.add('selected');

        // Directly process the donation without needing submit button
        const tierId = tierOption.dataset.tier;
        const tier = this.donationTiers.find(t => t.id == tierId);
        if (tier) {
          this.processTierSelection(tier);
        }
        return;
      }

      // Submit donation (keeping for any legacy references)
      if (
        e.target.id === 'submit-donation' ||
        e.target.closest('#submit-donation')
      ) {
        e.preventDefault();
        // Legacy fallback - shouldn't happen with new UI
        return;
      }

      // Sign in link
      if (e.target.id === 'sign-in-link') {
        e.preventDefault();
        this.showSignInModal();
        return;
      }

      // Recognition prompt actions
      if (e.target.id === 'create-account-btn') {
        this.showSignUpModal();
        return;
      }

      if (e.target.id === 'skip-recognition-btn') {
        this.hideRecognitionPrompt();
        return;
      }
    };

    container.addEventListener('click', this.handleDelegatedClick);

    // Also add direct listeners as a fallback after a short delay to ensure DOM is ready
    const DOM_READY_DELAY = 100;
    setTimeout(() => {
      this.addDirectEventListeners();
    }, DOM_READY_DELAY);
  }

  addDirectEventListeners() {
    // Direct event listeners as fallback
    document.querySelectorAll('.tier-option').forEach(option => {
      option.addEventListener('click', () => {
        document
          .querySelectorAll('.tier-option')
          .forEach(o => o.classList.remove('selected'));
        option.classList.add('selected');

        // Directly process the donation
        const tierId = option.dataset.tier;
        const tier = this.donationTiers.find(t => t.id == tierId);
        if (tier) {
          this.processTierSelection(tier);
        }
      });
    });

    document.querySelectorAll('.donation-type-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document
          .querySelectorAll('.donation-type-btn')
          .forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.updateTierDisplay();
      });
    });
  }

  updateUI() {
    const authBanner = document.getElementById('auth-status-banner');
    if (authBanner) {
      authBanner.innerHTML = this.renderAuthBanner();
    }

    // Update benefits section
    const authenticatedBenefits = document.querySelectorAll(
      '.authenticated-only'
    );
    authenticatedBenefits.forEach(element => {
      element.classList.toggle('hidden', !this.isAuthenticated);
    });

    // Update donation type selection based on auth status
    this.updateDonationTypeSelection();
  }

  updateDonationTypeSelection() {
    const quickBtn = document.getElementById('quick-donate-btn');
    const recognizedBtn = document.getElementById('recognized-donate-btn');

    if (this.isAuthenticated) {
      // If authenticated, default to recognized donation
      if (quickBtn) quickBtn.classList.remove('active');
      if (recognizedBtn) recognizedBtn.classList.add('active');
    }
  }

  updateTierDisplay() {
    const selectedType = document.querySelector('.donation-type-btn.active')
      ?.dataset.type;
    const tierOptions = document.querySelectorAll('.tier-option');

    tierOptions.forEach(option => {
      const tierHeader = option.querySelector('.tier-header');

      if (selectedType === 'recognized' && this.isAuthenticated) {
        // Show flair for recognized donations
        tierHeader.style.background =
          'linear-gradient(135deg, #f8f9fa, #e3f2fd)';
        option.style.border = '2px solid #2196f3';
      } else {
        // Standard styling for quick donations
        tierHeader.style.background = '';
        option.style.border = '';
      }
    });
  }

  async processTierSelection(tier) {
    const selectedType = document.querySelector('.donation-type-btn.active')
      ?.dataset.type;

    try {
      if (selectedType === 'recognized' && this.isAuthenticated) {
        // Authenticated donation with flair
        await this.processAuthenticatedDonation(tier);
      } else {
        // Anonymous donation
        await this.processAnonymousDonation(tier);
      }
    } catch (error) {
      // Log error for debugging
      if (window.console && window.console.error) {
        window.console.error('Donation processing error:', error);
      }
      alert('Error processing donation. Please try again.');
    }
  }

  async processDonation() {
    const selectedTier = document.querySelector('.tier-option.selected');
    const selectedType = document.querySelector('.donation-type-btn.active')
      ?.dataset.type;

    if (!selectedTier) {
      alert('Please select a donation tier');
      return;
    }

    const tier = this.donationTiers.find(
      t => t.id == selectedTier.dataset.tier
    );

    try {
      if (selectedType === 'recognized' && this.isAuthenticated) {
        // Authenticated donation with flair
        await this.processAuthenticatedDonation(tier);
      } else {
        // Anonymous donation
        await this.processAnonymousDonation(tier);
      }
    } catch (error) {
      // Log error for debugging
      if (window.console && window.console.error) {
        window.console.error('Donation processing error:', error);
      }
      alert('Error processing donation. Please try again.');
    }
  }

  async processAuthenticatedDonation(tier) {
    try {
      // Try Firebase Functions first
      const functions = window.firebase.functions();
      const createCheckoutSession = functions.httpsCallable(
        'createCheckoutSession'
      );

      const result = await createCheckoutSession({
        priceId: tier.priceId,
        tier: tier.id.toString(),
      });

      // Redirect to Stripe Checkout
      const stripe = window.Stripe(this.getStripeKey());
      const { error } = await stripe.redirectToCheckout({
        sessionId: result.data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      console.warn('Firebase Functions not available, using fallback:', error);
      // Fallback for local development
      this.simulateStripeCheckout(tier, 'authenticated');
    }
  }

  async processAnonymousDonation(tier) {
    const email = this.promptForEmail();

    try {
      const functions = window.firebase.functions();
      const createAnonymousCheckout = functions.httpsCallable(
        'createAnonymousCheckout'
      );

      const result = await createAnonymousCheckout({
        tier: tier.id.toString(),
        email,
      });

      // Redirect to Stripe Checkout
      const stripe = window.Stripe(this.getStripeKey());
      const { error } = await stripe.redirectToCheckout({
        sessionId: result.data.sessionId,
      });

      if (error) {
        throw error;
      }
    } catch (error) {
      // Fallback for local development
      this.simulateStripeCheckout(tier, 'anonymous', email);
    }
  }

  promptForEmail() {
    // Simple email prompt - could be enhanced with a modal
    return prompt('Email address for receipt (optional):') || '';
  }

  getUserFlair() {
    if (!this.currentUser || !window.enhancedProfile) return '';
    return window.enhancedProfile.getUserFlair() || '';
  }

  showSignInModal() {
    // Trigger existing auth modal
    if (window.authService) {
      window.authService.showSignInModal();
    }
  }

  showSignUpModal() {
    // Trigger existing auth modal for sign up
    if (window.authService) {
      window.authService.showSignUpModal();
    }
  }

  showRecognitionPrompt() {
    const prompt = document.getElementById('recognition-prompt');
    if (prompt) {
      prompt.classList.remove('hidden');
    }
  }

  hideRecognitionPrompt() {
    const prompt = document.getElementById('recognition-prompt');
    if (prompt) {
      prompt.classList.add('hidden');
    }
  }

  toggleDonationAccordion() {
    const accordionHeader = document.querySelector(
      '.donation-accordion .accordion-header'
    );
    const accordionContent = document.querySelector(
      '.donation-accordion .accordion-content'
    );
    const accordionIcon = document.querySelector(
      '.donation-accordion .accordion-icon'
    );

    if (!accordionHeader || !accordionContent || !accordionIcon) return;

    const isExpanded = accordionHeader.getAttribute('aria-expanded') === 'true';

    if (isExpanded) {
      // Collapse
      accordionHeader.setAttribute('aria-expanded', 'false');
      accordionContent.classList.add('collapsed');
      accordionIcon.textContent = '▶';
    } else {
      // Expand
      accordionHeader.setAttribute('aria-expanded', 'true');
      accordionContent.classList.remove('collapsed');
      accordionIcon.textContent = '▼';

      // Re-attach event listeners after expanding to ensure buttons work
      const ACCORDION_ANIMATION_DELAY = 50;
      setTimeout(() => {
        this.addDirectEventListeners();
      }, ACCORDION_ANIMATION_DELAY);
    }
  }

  simulateStripeCheckout(tier, donationType, email = '') {
    const randomStr = Math.random().toString(36).substring(2, 11);
    const mockSessionId = `b1${randomStr}`;

    const flairText =
      donationType === 'authenticated' && this.isAuthenticated
        ? ` with flair: ${tier.flair}`
        : '';
    const emailText = email ? ` for ${email}` : '';

    const message = `🧪 Development Mode: This would redirect to Stripe checkout for ${
      tier.name
    } ($${tier.amount})${flairText}${
      emailText
    }.\n\nIn production, this will redirect to a real Stripe checkout page.`;

    const confirmText = `${message}\n\nWould you like to see a mock checkout URL?`;

    if (window.confirm(confirmText)) {
      const tierDescription =
        donationType === 'authenticated' ? ` - ${tier.flair}` : '';

      const htmlContent =
        `<!DOCTYPE html><html><head><title>Mock Stripe Checkout</title>` +
        `<style>body { font-family: Arial, sans-serif; margin: 40px; background: #f6f9fc; }` +
        `.checkout { background: white; padding: 30px; border-radius: 8px; max-width: 400px; margin: 0 auto; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }` +
        `.header { text-align: center; margin-bottom: 20px; }` +
        `.amount { font-size: 24px; font-weight: bold; color: #424770; }` +
        `.description { color: #6b7280; margin: 10px 0; }` +
        `.btn { background: #635bff; color: white; padding: 12px 24px; border: none; border-radius: 6px; font-size: 16px; cursor: pointer; width: 100%; margin: 10px 0; }` +
        `.btn:hover { background: #5a52f3; }` +
        `.note { background: #fef3cd; border: 1px solid #faebcd; padding: 10px; border-radius: 4px; margin: 20px 0; font-size: 14px; }` +
        `</style></head><body><div class="checkout"><div class="header"><h2>SimulateAI Donation</h2>` +
        `<div class="amount">$${tier.amount}</div>` +
        `<div class="description">${tier.name} Tier${tierDescription}</div></div>` +
        `<div class="note"><strong>🧪 Development Mode:</strong> This is a mock checkout page. In production, this would be a real Stripe checkout that processes payments.</div>` +
        `<button class="btn" onclick="alert('In production, this would process the payment and redirect back to your site with success status.')">Pay $${tier.amount}</button>` +
        `<button class="btn" style="background: #6c757d;" onclick="window.close()">Cancel</button></div></body></html>`;

      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      window.open(dataUrl, '_blank');
    }
  }

  // Static method for easy initialization
  static init(containerId, options = {}) {
    const widget = new EnhancedDonationWidget();
    widget.render(containerId, options);
    // Make widget available globally for accordion toggle
    window.donationWidget = widget;
    return widget;
  }
}

// Make available globally
window.EnhancedDonationWidget = EnhancedDonationWidget;
