/**
 * Enhanced Donation Widget
 * Provides both anonymous and authenticated donation options
 * with flair incentives for authenticated users
 */

class EnhancedDonationWidget {
  constructor() {
    this.isAuthenticated = false;
    this.currentUser = null;

    // Performance Optimization: DOM Element Cache
    this.domCache = new Map();
    this.updateScheduled = false;
    this.boundEventHandler = null;

    this.donationTiers = [
      {
        id: 1,
        amount: 5,
        name: "Bronze Supporter",
        flair: "🥉",
        priceId: "price_1RkyADJDA3nPZHAFQJr2ySBR", // $5 Bronze tier
      },
      {
        id: 2,
        amount: 10,
        name: "Silver Patron",
        flair: "🥈",
        priceId: "price_1RkyADJDA3nPZHAFXasv2dM0", // $10 Silver tier
      },
      {
        id: 3,
        amount: 20,
        name: "Gold Champion",
        flair: "🏆",
        priceId: "price_1RkyADJDA3nPZHAFoyRLGmpQ", // $20 Gold tier
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

    if (!key || key === "PLACEHOLDER_KEY") {
      throw new Error(
        "Stripe publishable key not configured. Please set VITE_STRIPE_PUBLISHABLE_KEY environment variable.",
      );
    }

    return key;
  }

  /**
   * Dynamically load Stripe JavaScript SDK
   * @returns {Promise<boolean>} True if Stripe is loaded successfully
   */
  async loadStripe() {
    // Check if Stripe is already loaded
    if (window.Stripe) {
      return true;
    }

    try {
      // Create and load Stripe script
      const script = document.createElement("script");
      script.src = "https://js.stripe.com/v3/";
      script.async = true;

      // Return a promise that resolves when script is loaded
      return new Promise((resolve, reject) => {
        script.onload = () => {
          if (window.Stripe) {
            console.log("✅ Stripe SDK loaded successfully");
            resolve(true);
          } else {
            console.error("❌ Stripe SDK failed to initialize");
            reject(new Error("Stripe SDK failed to initialize"));
          }
        };

        script.onerror = () => {
          console.error("❌ Failed to load Stripe SDK");
          reject(new Error("Failed to load Stripe SDK"));
        };

        document.head.appendChild(script);
      });
    } catch (error) {
      console.error("❌ Error loading Stripe SDK:", error);
      return false;
    }
  }

  async init() {
    // Check authentication status
    if (window.firebase && window.firebase.auth) {
      window.firebase.auth().onAuthStateChanged((user) => {
        this.isAuthenticated = !!user;
        this.currentUser = user;
        this.updateUI();
      });
    }
  }

  // ========================================
  // Performance Optimization Methods
  // ========================================

  /**
   * Get cached DOM element (optimized querySelector)
   */
  getCachedElement(selector) {
    if (!this.domCache.has(selector)) {
      const element = document.querySelector(selector);
      if (element) {
        this.domCache.set(selector, element);
      }
    }
    return this.domCache.get(selector) || null;
  }

  /**
   * Get cached DOM elements (optimized querySelectorAll)
   */
  getCachedElements(selector) {
    const cacheKey = `${selector}:all`;
    if (!this.domCache.has(cacheKey)) {
      const elements = Array.from(document.querySelectorAll(selector));
      this.domCache.set(cacheKey, elements);
    }
    return this.domCache.get(cacheKey) || [];
  }

  /**
   * Clear DOM cache (called when DOM structure changes)
   */
  clearDOMCache() {
    this.domCache.clear();
  }

  /**
   * Schedule DOM update for batching
   */
  scheduleDOMUpdate(updateFn) {
    if (!this.updateScheduled) {
      this.updateScheduled = true;
      requestAnimationFrame(() => {
        try {
          updateFn();
        } catch (error) {
          console.error("[DonationWidget] DOM update failed:", error);
        }
        this.updateScheduled = false;
      });
    }
  }

  /**
   * Batch multiple style updates to prevent layout thrashing
   */
  batchStyleUpdates(updates) {
    this.scheduleDOMUpdate(() => {
      updates.forEach(({ element, styles }) => {
        Object.assign(element.style, styles);
      });
    });
  }

  render(containerId, options = {}) {
    const container = document.getElementById(containerId);
    if (!container) return;

    // Clear DOM cache before rendering new content
    this.clearDOMCache();

    const defaultOptions = {
      title: "💖 Support SimulateAI Research",
      subtitle: "Help advance AI ethics education for everyone",
      showBenefits: true,
      style: "accordion", // 'card', 'inline', 'minimal', 'accordion'
    };

    const config = { ...defaultOptions, ...options };

    if (config.style === "accordion") {
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
          <div class="accordion-content collapsed no-transition">
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
                  ${config.showBenefits ? this.renderBenefits() : ""}

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
          ${config.showBenefits ? this.renderBenefits() : ""}

          <!-- Instructions -->
          <div class="donation-instructions">
            <p class="instruction-text">
              💳 Click any tier above to proceed to secure checkout
            </p>
            <div class="donation-security">
              🔒 Secured by Stripe
            </div>
            <button class="donation-preferences-btn" style="
              display: inline-flex;
              align-items: center;
              gap: 0.5rem;
              padding: 0.5rem 0.75rem;
              background: transparent;
              border: 1px solid rgba(255, 255, 255, 0.3);
              color: rgba(255, 255, 255, 0.9);
              border-radius: 6px;
              font-size: 0.875rem;
              cursor: pointer;
              transition: all 0.2s ease;
              margin-top: 0.75rem;
            ">
              <span>⚙️</span>
              <span>Privacy & Display Preferences</span>
            </button>
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
        this.currentUser?.displayName || this.currentUser?.email || "User";

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
        (tier) => `
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
    `,
      )
      .join("");
  }

  getTierDescription(tier) {
    const descriptions = {
      1: "Support basic research and development",
      2: "Help fund new simulation scenarios",
      3: "Enable major platform enhancements",
    };
    return descriptions[tier.id] || "";
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
          <div class="benefit-item authenticated-only ${this.isAuthenticated ? "" : "hidden"}">
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
    // Remove any existing listeners to prevent duplicates
    if (this.boundEventHandler) {
      document.body.removeEventListener("click", this.boundEventHandler);
    }

    // Single optimized event handler using delegation
    this.boundEventHandler = (e) => {
      // Donation type selector
      if (e.target.classList.contains("donation-type-btn")) {
        this.handleDonationTypeSelection(e.target);
        return;
      }

      // Tier selection - directly process donation
      if (e.target.closest(".tier-option")) {
        this.handleTierSelection(e.target.closest(".tier-option"));
        return;
      }

      // Handle other clicks
      this.handleOtherClicks(e.target, e);
    };

    document.body.addEventListener("click", this.boundEventHandler);
  }

  /**
   * Handle donation type button selection
   */
  handleDonationTypeSelection(target) {
    this.getCachedElements(".donation-type-btn").forEach((btn) =>
      btn.classList.remove("active"),
    );
    target.classList.add("active");
    this.updateTierDisplay();
  }

  /**
   * Handle tier option selection
   */
  handleTierSelection(tierOption) {
    this.getCachedElements(".tier-option").forEach((option) =>
      option.classList.remove("selected"),
    );
    tierOption.classList.add("selected");

    const tierId = tierOption.dataset.tier;
    const tier = this.donationTiers.find((t) => t.id == tierId);
    if (tier) {
      this.processTierSelection(tier);
    }
  }

  /**
   * Handle other click events
   */
  handleOtherClicks(target, event) {
    if (target.id === "sign-in-link") {
      event.preventDefault();
      this.showSignInModal();
    } else if (target.id === "create-account-btn") {
      this.showSignUpModal();
    } else if (target.id === "skip-recognition-btn") {
      this.hideRecognitionPrompt();
    }
  }

  updateUI() {
    const authBanner = this.getCachedElement("#auth-status-banner");
    if (authBanner) {
      this.scheduleDOMUpdate(() => {
        authBanner.innerHTML = this.renderAuthBanner();
      });
    }

    // Batch update authenticated benefits visibility
    const authenticatedBenefits = this.getCachedElements(".authenticated-only");
    if (authenticatedBenefits.length > 0) {
      this.scheduleDOMUpdate(() => {
        authenticatedBenefits.forEach((element) => {
          element.classList.toggle("hidden", !this.isAuthenticated);
        });
      });
    }

    // Update donation type selection based on auth status
    this.updateDonationTypeSelection();
  }

  updateDonationTypeSelection() {
    if (this.isAuthenticated) {
      const quickBtn = this.getCachedElement("#quick-donate-btn");
      const recognizedBtn = this.getCachedElement("#recognized-donate-btn");

      this.scheduleDOMUpdate(() => {
        if (quickBtn) quickBtn.classList.remove("active");
        if (recognizedBtn) recognizedBtn.classList.add("active");
      });
    }
  }

  updateTierDisplay() {
    const selectedType = this.getCachedElement(".donation-type-btn.active")
      ?.dataset.type;
    const tierOptions = this.getCachedElements(".tier-option");

    if (tierOptions.length === 0) return;

    // Batch all style updates to prevent layout thrashing
    const styleUpdates = [];

    tierOptions.forEach((option) => {
      const tierHeader = option.querySelector(".tier-header");
      if (!tierHeader) return;

      if (selectedType === "recognized" && this.isAuthenticated) {
        styleUpdates.push({
          element: tierHeader,
          styles: { background: "linear-gradient(135deg, #f8f9fa, #e3f2fd)" },
        });
        styleUpdates.push({
          element: option,
          styles: { border: "2px solid #2196f3" },
        });
      } else {
        styleUpdates.push({
          element: tierHeader,
          styles: { background: "" },
        });
        styleUpdates.push({
          element: option,
          styles: { border: "" },
        });
      }
    });

    // Apply all style updates in a single batch
    this.batchStyleUpdates(styleUpdates);
  }

  async processTierSelection(tier) {
    const selectedType = this.getCachedElement(".donation-type-btn.active")
      ?.dataset.type;

    try {
      if (selectedType === "recognized" && this.isAuthenticated) {
        // Authenticated donation with flair
        await this.processAuthenticatedDonation(tier);
      } else {
        // Anonymous donation
        await this.processAnonymousDonation(tier);
      }
    } catch (error) {
      // Log error for debugging
      if (window.console && window.console.error) {
        window.console.error("Donation processing error:", error);
      }
      alert("Error processing donation. Please try again.");
    }
  }

  async processDonation() {
    const selectedTier = this.getCachedElement(".tier-option.selected");
    const selectedType = this.getCachedElement(".donation-type-btn.active")
      ?.dataset.type;

    if (!selectedTier) {
      alert("Please select a donation tier");
      return;
    }

    const tier = this.donationTiers.find(
      (t) => t.id == selectedTier.dataset.tier,
    );

    try {
      if (selectedType === "recognized" && this.isAuthenticated) {
        // Authenticated donation with flair
        await this.processAuthenticatedDonation(tier);
      } else {
        // Anonymous donation
        await this.processAnonymousDonation(tier);
      }
    } catch (error) {
      // Log error for debugging
      if (window.console && window.console.error) {
        window.console.error("Donation processing error:", error);
      }
      alert("Error processing donation. Please try again.");
    }
  }

  async processAuthenticatedDonation(tier) {
    try {
      // Ensure Stripe SDK is loaded
      const stripeLoaded = await this.loadStripe();
      if (!stripeLoaded) {
        throw new Error("Failed to load Stripe SDK");
      }

      // Try Firebase Functions first
      const functions = window.firebase.functions();
      const createCheckoutSession = functions.httpsCallable(
        "createCheckoutSession",
      );

      const result = await createCheckoutSession({
        priceId: tier.priceId,
        tier: tier.id.toString(),
        userId: this.currentUser?.uid,
        userEmail: this.currentUser?.email,
        displayName: this.currentUser?.displayName || this.currentUser?.email,
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
      console.warn("Firebase Functions not available, using fallback:", error);
      // Fallback for local development
      this.simulateStripeCheckout(tier, "authenticated");

      // Simulate adding to donor wall in development
      await this.simulateAddToDonorWall(tier, "authenticated");
    }
  }

  async processAnonymousDonation(tier) {
    // Removed email prompt - Stripe handles receipt emails automatically during checkout
    const message = this.promptForMessage();

    try {
      // Ensure Stripe SDK is loaded
      const stripeLoaded = await this.loadStripe();
      if (!stripeLoaded) {
        throw new Error("Failed to load Stripe SDK");
      }

      const functions = window.firebase.functions();
      const createAnonymousCheckout = functions.httpsCallable(
        "createAnonymousCheckout",
      );

      const result = await createAnonymousCheckout({
        tier: tier.id.toString(),
        email: "", // Let Stripe collect email during checkout for receipts
        message,
        amount: tier.amount,
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
      this.simulateStripeCheckout(tier, "anonymous", ""); // Empty email, Stripe will collect

      // Simulate adding to donor wall in development
      await this.simulateAddToDonorWall(tier, "anonymous", "", message); // Empty email
    }
  }

  /**
   * Simulate adding donation to Firebase for development
   */
  async simulateAddToDonorWall(tier, donationType, email = "", message = "") {
    if (!window.firebase || !window.firebase.firestore) {
      console.log(
        "Firebase not available - donation would appear in production",
      );
      return;
    }

    try {
      const db = window.firebase.firestore();
      const donationData = {
        amount: tier.amount,
        tier: tier.id,
        timestamp: window.firebase.firestore.FieldValue.serverTimestamp(),
        visibility: this.getUserVisibilityPreference(),
        message: message || null,
        userId: donationType === "authenticated" ? this.currentUser?.uid : null,
        userEmail:
          donationType === "authenticated" ? this.currentUser?.email : email,
        displayName:
          donationType === "authenticated"
            ? this.currentUser?.displayName || this.currentUser?.email
            : "Anonymous Supporter",
      };

      // Add to donations collection
      await db.collection("donations").add(donationData);

      console.log(
        "✅ Donation added to Firebase - donor wall will update automatically",
      );

      // Show success notification
      this.showDonationSuccessNotification();
    } catch (error) {
      console.error("Error adding donation to Firebase:", error);
    }
  }

  /**
   * Show success notification for donation
   */
  showDonationSuccessNotification() {
    const notification = document.createElement("div");
    notification.innerHTML = `
      <div style="
        position: fixed;
        top: 20px;
        right: 20px;
        background: #4CAF50;
        color: white;
        padding: 16px 20px;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.2);
        z-index: 10000;
        font-family: var(--font-family);
        max-width: 300px;
      ">
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-size: 1.2em;">🎉</span>
          <div>
            <div style="font-weight: 600; margin-bottom: 4px;">Thank you for your donation!</div>
            <div style="font-size: 0.9em; opacity: 0.9;">Your support will appear in the donor wall shortly.</div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(notification);

    setTimeout(() => {
      if (notification.parentNode) {
        notification.style.animation = "fadeOut 0.3s ease";
        setTimeout(() => {
          if (notification.parentNode) {
            notification.parentNode.removeChild(notification);
          }
        }, 300);
      }
    }, 5000);
  }

  /**
   * Prompt for optional donation message
   */
  promptForMessage() {
    // Check user preferences first
    if (
      window.donationPreferences &&
      !window.donationPreferences.allowsMessages()
    ) {
      return "";
    }

    const wantMessage = confirm(
      "Would you like to leave a message about why you support AI ethics research? (This will appear on your donor card)",
    );

    if (wantMessage) {
      return prompt("Your message (will be displayed publicly):") || "";
    }

    return "";
  }

  /**
   * Get user's preferred visibility setting
   */
  getUserVisibilityPreference() {
    if (window.donationPreferences) {
      return window.donationPreferences.getVisibilityForDonation();
    }

    // Default behavior
    return this.isAuthenticated ? "username" : "anonymous";
  }

  getUserFlair() {
    if (!this.currentUser || !window.enhancedProfile) return "";
    return window.enhancedProfile.getUserFlair() || "";
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
    const prompt = this.getCachedElement("#recognition-prompt");
    if (prompt) {
      this.scheduleDOMUpdate(() => {
        prompt.classList.remove("hidden");
      });
    }
  }

  hideRecognitionPrompt() {
    const prompt = this.getCachedElement("#recognition-prompt");
    if (prompt) {
      this.scheduleDOMUpdate(() => {
        prompt.classList.add("hidden");
      });
    }
  }

  toggleDonationAccordion() {
    const accordionHeader = this.getCachedElement(
      ".donation-accordion .accordion-header",
    );
    const accordionContent = this.getCachedElement(
      ".donation-accordion .accordion-content",
    );
    const accordionIcon = this.getCachedElement(
      ".donation-accordion .accordion-icon",
    );

    if (!accordionHeader || !accordionContent || !accordionIcon) return;

    // Enable transitions after first user interaction
    if (accordionContent.classList.contains("no-transition")) {
      accordionContent.classList.remove("no-transition");
    }

    const isExpanded = accordionHeader.getAttribute("aria-expanded") === "true";

    this.scheduleDOMUpdate(() => {
      if (isExpanded) {
        // Collapse
        accordionHeader.setAttribute("aria-expanded", "false");
        accordionContent.classList.add("collapsed");
        accordionIcon.textContent = "▶";
      } else {
        // Expand
        accordionHeader.setAttribute("aria-expanded", "true");
        accordionContent.classList.remove("collapsed");
        accordionIcon.textContent = "▼";
      }
    });

    // Clear cache after accordion state change to ensure fresh DOM queries
    if (!isExpanded) {
      setTimeout(() => {
        this.clearDOMCache();
      }, 100);
    }
  }

  simulateStripeCheckout(tier, donationType, email = "") {
    const flairText =
      donationType === "authenticated" && this.isAuthenticated
        ? ` with flair: ${tier.flair}`
        : "";
    const emailText = email ? ` for ${email}` : "";

    const message = `🧪 Development Mode: This would redirect to Stripe checkout for ${
      tier.name
    } ($${tier.amount})${flairText}${
      emailText
    }.\n\nIn production, this will redirect to a real Stripe checkout page.`;

    const confirmText = `${message}\n\nWould you like to see a mock checkout URL?`;

    if (window.confirm(confirmText)) {
      const tierDescription =
        donationType === "authenticated" ? ` - ${tier.flair}` : "";

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
      window.open(dataUrl, "_blank");
    }
  }

  /**
   * Cleanup method for component destruction
   */
  cleanup() {
    // Remove event listeners
    if (this.boundEventHandler) {
      document.body.removeEventListener("click", this.boundEventHandler);
      this.boundEventHandler = null;
    }

    // Clear DOM cache
    this.clearDOMCache();

    // Cancel any pending DOM updates
    this.updateScheduled = false;

    // Clear component references
    this.isAuthenticated = false;
    this.currentUser = null;
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
