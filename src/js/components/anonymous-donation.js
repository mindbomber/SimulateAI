/**
 * Anonymous Donation Component
 * Allows users to donate without authentication
 */
class AnonymousDonation {
  constructor(options = {}) {
    this.container = options.container || document.body;
    this.firebase = options.firebase; // Pass in Firebase instance
    this.priceIds = {
      1: 'price_1RkyADJDA3nPZHAFQJr2ySBR', // $5 Bronze
      2: 'price_1RkyADJDA3nPZHAFXasv2dM0', // $10 Silver
      3: 'price_1RkyADJDA3nPZHAFoyRLGmpQ', // $20 Gold
    };
    this.init();
  }

  init() {
    this.render();
    this.attachEventListeners();
  }

  render() {
    const donationHTML = `
      <div class="anonymous-donation-widget" style="
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        border-radius: 12px;
        padding: 24px;
        margin: 20px 0;
        color: white;
        font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
        box-shadow: 0 8px 32px rgba(0,0,0,0.1);
      ">
        <div style="text-align: center; margin-bottom: 20px;">
          <h3 style="margin: 0 0 8px 0; font-size: 1.5em; font-weight: 600;">
            🎓 Support AI Ethics Research
          </h3>
          <p style="margin: 0; opacity: 0.9; font-size: 0.95em;">
            Help advance ethical AI education with a one-time donation
          </p>
        </div>

        <div class="donation-tiers" style="
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 12px;
          margin-bottom: 20px;
        ">
          <button class="donation-btn" data-tier="1" data-amount="5" style="
            background: rgba(205, 127, 50, 0.9);
            border: none;
            border-radius: 8px;
            padding: 16px 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9em;
          ">
            🥉 Bronze<br>
            <span style="font-size: 1.2em;">$5</span>
          </button>

          <button class="donation-btn" data-tier="2" data-amount="10" style="
            background: rgba(192, 192, 192, 0.9);
            border: none;
            border-radius: 8px;
            padding: 16px 8px;
            color: white;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9em;
          ">
            🥈 Silver<br>
            <span style="font-size: 1.2em;">$10</span>
          </button>

          <button class="donation-btn" data-tier="3" data-amount="20" style="
            background: rgba(255, 215, 0, 0.9);
            border: none;
            border-radius: 8px;
            padding: 16px 8px;
            color: #333;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.2s ease;
            font-size: 0.9em;
          ">
            🏆 Gold<br>
            <span style="font-size: 1.2em;">$20</span>
          </button>
        </div>

        <div class="email-input" style="margin-bottom: 16px;">
          <input 
            type="email" 
            id="donor-email" 
            placeholder="Email (optional - for receipt)"
            style="
              width: 100%;
              padding: 12px;
              border: none;
              border-radius: 6px;
              font-size: 0.95em;
              box-sizing: border-box;
              background: rgba(255,255,255,0.1);
              color: white;
              backdrop-filter: blur(10px);
            "
          >
        </div>

        <div class="donation-status" style="
          min-height: 20px;
          text-align: center;
          font-size: 0.9em;
          margin-top: 12px;
        "></div>

        <div style="text-align: center; margin-top: 16px; font-size: 0.8em; opacity: 0.8;">
          <p style="margin: 0;">
            🔒 Secure payment via Stripe • No account required
          </p>
        </div>
      </div>
    `;

    if (typeof this.container === 'string') {
      document.querySelector(this.container).innerHTML = donationHTML;
    } else {
      this.container.innerHTML = donationHTML;
    }
  }

  attachEventListeners() {
    const buttons = document.querySelectorAll('.donation-btn');
    const statusDiv = document.querySelector('.donation-status');

    buttons.forEach(button => {
      button.addEventListener('mouseenter', () => {
        button.style.transform = 'translateY(-2px)';
        button.style.boxShadow = '0 4px 16px rgba(0,0,0,0.2)';
      });

      button.addEventListener('mouseleave', () => {
        button.style.transform = 'translateY(0)';
        button.style.boxShadow = 'none';
      });

      button.addEventListener('click', async e => {
        const { tier } = e.target.dataset;

        if (!tier) return;

        const donorEmail = document.getElementById('donor-email').value;

        // Disable buttons and show loading
        buttons.forEach(btn => (btn.disabled = true));
        statusDiv.innerHTML = '⏳ Creating secure checkout...';

        try {
          await this.createCheckout(tier, donorEmail);
        } catch (error) {
          statusDiv.innerHTML = '❌ Error creating checkout. Please try again.';
          buttons.forEach(btn => (btn.disabled = false));
        }
      });
    });
  }

  async createCheckout(tier, donorEmail = '') {
    if (!this.firebase) {
      throw new Error('Firebase instance not provided');
    }

    try {
      const createAnonymousCheckout = this.firebase
        .functions()
        .httpsCallable('createAnonymousCheckout');

      const result = await createAnonymousCheckout({
        priceId: this.priceIds[tier],
        tier,
        donorEmail: donorEmail.trim(),
      });

      if (result.data.url) {
        // Redirect to Stripe Checkout
        window.location.href = result.data.url;
      } else {
        throw new Error('No checkout URL received');
      }
    } catch (error) {
      // Fallback for local development
      this.simulateCheckout(tier, donorEmail);
    }
  }

  simulateCheckout(tier, donorEmail = '') {
    const flairText = donorEmail ? ` for ${donorEmail}` : '';
    const message = `🧪 Development Mode: This would redirect to Stripe checkout for tier ${
      tier
    } donation${flairText}.\n\nIn production, this will redirect to a real Stripe checkout page.`;

    const confirmText = `${message}\n\nWould you like to see a mock checkout URL?`;

    if (window.confirm(confirmText)) {
      const tierNames = { 1: 'Bronze', 2: 'Silver', 3: 'Gold' };
      const tierAmounts = { 1: 5, 2: 10, 3: 20 };
      const tierName = tierNames[tier] || 'Unknown';
      const amount = tierAmounts[tier] || 0;

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
        `<div class="amount">$${amount}</div>` +
        `<div class="description">${tierName} Tier - Anonymous Donation</div></div>` +
        `<div class="note"><strong>🧪 Development Mode:</strong> This is a mock checkout page. In production, this would be a real Stripe checkout that processes payments.</div>` +
        `<button class="btn" onclick="alert('In production, this would process the payment and redirect back to your site with success status.')">Pay $${amount}</button>` +
        `<button class="btn" style="background: #6c757d;" onclick="window.close()">Cancel</button></div></body></html>`;

      const dataUrl = `data:text/html;charset=utf-8,${encodeURIComponent(htmlContent)}`;
      window.open(dataUrl, '_blank');
    }
  }

  // Static method to easily create donation widgets
  static create(container, firebase) {
    return new AnonymousDonation({ container, firebase });
  }
}

// Auto-initialize if Firebase is available globally
if (typeof window !== 'undefined') {
  // Look for donation containers and auto-initialize
  document.addEventListener('DOMContentLoaded', () => {
    // Wait a bit for Firebase to be initialized
    setTimeout(() => {
      if (
        window.firebase &&
        window.firebase.apps &&
        window.firebase.apps.length > 0
      ) {
        const containers = document.querySelectorAll(
          '.donation-widget-container'
        );
        containers.forEach(container => {
          new AnonymousDonation({
            container,
            firebase: window.firebase,
          });
        });

        // If no containers found, create one and append to body
        if (containers.length === 0) {
          new AnonymousDonation({
            container: document.body,
            firebase: window.firebase,
          });
        }
      } else {
        // Firebase not properly initialized - silently fail
      }
    }, 100);
  });
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AnonymousDonation;
}

// Make available globally
if (typeof window !== 'undefined') {
  window.AnonymousDonation = AnonymousDonation;
}
