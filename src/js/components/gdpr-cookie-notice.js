/**
 * Simple GDPR Cookie Notice Component
 * Integrates with existing SimulateAI DataHandler for consent management
 */

class GDPRCookieNotice {
  constructor(dataHandler, options = {}) {
    this.dataHandler = dataHandler;
    this.options = {
      position: "bottom", // 'top' or 'bottom'
      theme: "auto", // 'light', 'dark', or 'auto'
      autoHide: false, // Hide after consent
      showDetails: true, // Show detailed cookie info
      ...options,
    };

    this.consentKey = "gdpr_cookie_consent";
    this.isVisible = false;
    this.element = null;

    // Auto-initialize
    this.init();
  }

  async init() {
    try {
      // Check if consent already exists
      const existingConsent = await this.dataHandler.getData(this.consentKey);

      if (!existingConsent || this.isConsentExpired(existingConsent)) {
        this.show();
      }
    } catch (error) {
      console.warn(
        "GDPR Cookie Notice: Error checking existing consent:",
        error,
      );
      // Show notice as fallback
      this.show();
    }
  }

  isConsentExpired(consent) {
    if (!consent.timestamp) return true;

    // Consent expires after 13 months (GDPR best practice)
    const expiryMonths = 13;
    const expiryDate = new Date(consent.timestamp);
    expiryDate.setMonth(expiryDate.getMonth() + expiryMonths);

    return new Date() > expiryDate;
  }

  show() {
    if (this.isVisible) return;

    this.createElement();
    document.body.appendChild(this.element);
    this.isVisible = true;

    // Animate in
    setTimeout(() => {
      this.element.classList.add("gdpr-notice-visible");
    }, 100);
  }

  hide() {
    if (!this.isVisible || !this.element) return;

    this.element.classList.remove("gdpr-notice-visible");

    setTimeout(() => {
      if (this.element && this.element.parentNode) {
        this.element.parentNode.removeChild(this.element);
      }
      this.isVisible = false;
      this.element = null;
    }, 300);
  }

  createElement() {
    const notice = document.createElement("div");
    notice.className = `gdpr-cookie-notice gdpr-notice-${this.options.position}`;
    notice.setAttribute("role", "dialog");
    notice.setAttribute("aria-label", "Cookie consent notice");

    notice.innerHTML = `
      <div class="gdpr-notice-content">
        <div class="gdpr-notice-text">
          <h3>We respect your privacy</h3>
          <p>This website uses cookies to enhance your experience and help us improve our educational research. We use:</p>
          <ul class="gdpr-cookie-types">
            <li><strong>Essential cookies:</strong> Required for basic functionality</li>
            <li><strong>Analytics cookies:</strong> Help us understand how you use SimulateAI</li>
            <li><strong>Research cookies:</strong> Support our educational research (optional)</li>
          </ul>
          <p>You can choose which cookies to accept. Essential cookies cannot be disabled.</p>
        </div>
        
        <div class="gdpr-notice-actions">
          <div class="gdpr-cookie-preferences">
            <label class="gdpr-checkbox-wrapper">
              <input type="checkbox" id="gdpr-essential" checked disabled>
              <span class="gdpr-checkmark"></span>
              Essential cookies (required)
            </label>
            
            <label class="gdpr-checkbox-wrapper">
              <input type="checkbox" id="gdpr-analytics" checked>
              <span class="gdpr-checkmark"></span>
              Analytics cookies
            </label>
            
            <label class="gdpr-checkbox-wrapper">
              <input type="checkbox" id="gdpr-research">
              <span class="gdpr-checkmark"></span>
              Research cookies
            </label>
          </div>
          
          <div class="gdpr-buttons">
            <button type="button" class="gdpr-btn gdpr-btn-secondary" data-action="essential-only">
              Essential Only
            </button>
            <button type="button" class="gdpr-btn gdpr-btn-primary" data-action="accept-selected">
              Accept Selected
            </button>
            <button type="button" class="gdpr-btn gdpr-btn-primary" data-action="accept-all">
              Accept All
            </button>
          </div>
        </div>
        
        <div class="gdpr-notice-footer">
          <a href="/privacy-notice.html" target="_blank" class="gdpr-privacy-link">
            View our Privacy Notice
          </a>
          <button type="button" class="gdpr-close-btn" data-action="close" aria-label="Close">
            ×
          </button>
        </div>
      </div>
    `;

    this.element = notice;
    this.attachEvents();
    return notice;
  }

  attachEvents() {
    if (!this.element) return;

    // Button click handlers
    this.element.addEventListener("click", async (e) => {
      const action = e.target.getAttribute("data-action");
      if (!action) return;

      e.preventDefault();

      switch (action) {
        case "essential-only":
          await this.saveConsent({
            essential: true,
            analytics: false,
            research: false,
          });
          break;

        case "accept-selected":
          await this.saveConsent({
            essential: true,
            analytics: this.element.querySelector("#gdpr-analytics").checked,
            research: this.element.querySelector("#gdpr-research").checked,
          });
          break;

        case "accept-all":
          await this.saveConsent({
            essential: true,
            analytics: true,
            research: true,
          });
          break;

        case "close": {
          // Only allow close if consent exists
          const existingConsent = await this.dataHandler.getData(
            this.consentKey,
          );
          if (existingConsent) {
            this.hide();
          }
          break;
        }
      }
    });

    // Escape key handler
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && this.isVisible) {
        // Only allow escape if consent exists
        this.dataHandler.getData(this.consentKey).then((consent) => {
          if (consent) {
            this.hide();
          }
        });
      }
    });
  }

  async saveConsent(preferences) {
    try {
      const consentData = {
        essential: preferences.essential,
        analytics: preferences.analytics,
        research: preferences.research,
        timestamp: new Date().toISOString(),
        version: "1.0",
        userAgent: navigator.userAgent,
        ipAddress: null, // We don't store IP for privacy
      };

      // Save using existing DataHandler
      await this.dataHandler.saveData(this.consentKey, consentData);

      // Also save to legacy consent system for compatibility
      await this.dataHandler.saveConsentData({
        analytics: preferences.analytics,
        research: preferences.research,
        marketing: false, // We don't use marketing cookies
        timestamp: new Date(),
        version: "1.0",
      });

      // Emit consent change event for other components
      this.emitConsentEvent(consentData);

      // Hide the notice
      this.hide();

      // Show brief confirmation
      this.showConfirmation();
    } catch (error) {
      console.error("GDPR Cookie Notice: Error saving consent:", error);
      console.error(
        "DataHandler methods available:",
        Object.getOwnPropertyNames(this.dataHandler),
      );

      // Provide more specific error messages
      let errorMessage = "Error saving cookie preferences. ";
      if (error.message) {
        errorMessage += `Details: ${error.message}`;
      } else {
        errorMessage +=
          "Please try again or contact support if the problem persists.";
      }

      alert(errorMessage);
    }
  }

  emitConsentEvent(consentData) {
    // Emit custom event for other components to listen to
    const event = new CustomEvent("gdprConsentChanged", {
      detail: consentData,
    });
    window.dispatchEvent(event);

    // Also trigger GlobalEventManager if available
    if (
      window.globalEventManager &&
      typeof window.globalEventManager.handleEvent === "function"
    ) {
      try {
        window.globalEventManager.handleEvent(
          "gdpr.consent-changed",
          consentData,
        );
      } catch (error) {
        console.warn(
          "GDPR Cookie Notice: GlobalEventManager error (safe to ignore in test environment):",
          error,
        );
      }
    } else if (window.globalEventManager) {
      console.warn(
        "GDPR Cookie Notice: GlobalEventManager exists but handleEvent method is not available (test environment)",
      );
    }
  }

  showConfirmation() {
    const confirmation = document.createElement("div");
    confirmation.className = "gdpr-confirmation";
    confirmation.innerHTML = `
      <div class="gdpr-confirmation-content">
        <span class="gdpr-confirmation-icon">✓</span>
        Cookie preferences saved successfully
      </div>
    `;

    document.body.appendChild(confirmation);

    setTimeout(() => {
      confirmation.classList.add("gdpr-confirmation-visible");
    }, 100);

    setTimeout(() => {
      confirmation.classList.remove("gdpr-confirmation-visible");
      setTimeout(() => {
        if (confirmation.parentNode) {
          confirmation.parentNode.removeChild(confirmation);
        }
      }, 300);
    }, 2000);
  }

  // Public methods for external use
  async hasConsent(type = "any") {
    try {
      const consent = await this.dataHandler.getData(this.consentKey);
      if (!consent || this.isConsentExpired(consent)) {
        return false;
      }

      switch (type) {
        case "essential":
          return consent.essential;
        case "analytics":
          return consent.analytics;
        case "research":
          return consent.research;
        case "any":
          return consent.essential || consent.analytics || consent.research;
        default:
          return false;
      }
    } catch (error) {
      console.error("Error checking consent:", error);
      return false;
    }
  }

  async getConsentData() {
    try {
      return await this.dataHandler.getData(this.consentKey);
    } catch (error) {
      console.error("Error getting consent data:", error);
      return null;
    }
  }

  // Method to show preferences again
  showPreferences() {
    this.show();
  }

  // Static method to create and initialize
  static async create(dataHandler, options = {}) {
    return new GDPRCookieNotice(dataHandler, options);
  }
}

// Export for module systems (Node.js environments)
/* global module */
if (typeof module !== "undefined" && module.exports) {
  module.exports = GDPRCookieNotice;
}

// Global assignment for direct script inclusion
if (typeof window !== "undefined") {
  window.GDPRCookieNotice = GDPRCookieNotice;
}
