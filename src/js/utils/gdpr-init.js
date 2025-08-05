/**
 * GDPR Cookie Notice Integration
 * Easy initialization for SimulateAI platform
 */

/* global GDPRCookieNotice */

// Initialize GDPR Cookie Notice
document.addEventListener("DOMContentLoaded", async () => {
  try {
    // Wait for DataHandler to be available
    const dataHandler = await waitForDataHandler();

    if (!dataHandler) {
      console.warn(
        "GDPR Cookie Notice: DataHandler not available, skipping initialization",
      );
      return;
    }

    // Create and initialize the cookie notice
    const cookieNotice = new GDPRCookieNotice(dataHandler, {
      position: "bottom",
      theme: "auto",
      autoHide: true,
      showDetails: true,
    });

    // Make it globally available for other scripts
    window.gdprCookieNotice = cookieNotice;

    // Listen for consent changes to update analytics
    window.addEventListener("gdprConsentChanged", async (event) => {
      const consent = event.detail;

      // Update Google Analytics consent
      if (window.gtag) {
        window.gtag("consent", "update", {
          analytics_storage: consent.analytics ? "granted" : "denied",
          ad_storage: "denied", // We don't use ads
          functionality_storage: consent.essential ? "granted" : "denied",
          personalization_storage: consent.research ? "granted" : "denied",
        });
      }

      // Update SimpleAnalytics
      if (window.simpleAnalytics) {
        if (consent.analytics) {
          window.simpleAnalytics.enable();
        } else {
          window.simpleAnalytics.disable();
        }
      }

      // Notify other components
      if (window.globalEventManager) {
        window.globalEventManager.handleEvent(
          "analytics.consent-updated",
          consent,
        );
      }

      console.log("GDPR Cookie Notice: Consent updated", consent);
    });

    console.log("GDPR Cookie Notice: Initialized successfully");
  } catch (error) {
    console.error("GDPR Cookie Notice: Initialization failed", error);
  }
});

/**
 * Wait for DataHandler to be available
 */
async function waitForDataHandler(maxAttempts = 50, interval = 100) {
  for (let i = 0; i < maxAttempts; i++) {
    // Check for global DataHandler instance
    if (window.dataHandler) {
      return window.dataHandler;
    }

    // Check for DataHandler class
    if (window.DataHandler) {
      // Try to get from app initialization
      if (window.app && window.app.dataHandler) {
        return window.app.dataHandler;
      }

      // Create new instance as fallback
      try {
        const firebaseService = window.firebaseService || null;
        return new window.DataHandler({
          firebaseService,
          appName: "SimulateAI",
          version: "1.80",
        });
      } catch (error) {
        console.warn("Failed to create DataHandler instance:", error);
      }
    }

    // Wait before next attempt
    await new Promise((resolve) => setTimeout(resolve, interval));
  }

  return null;
}

/**
 * Utility functions for external use
 */
window.GDPRUtils = {
  // Check if user has given consent for specific cookie type
  async hasConsent(type = "analytics") {
    if (!window.gdprCookieNotice) return false;
    return await window.gdprCookieNotice.hasConsent(type);
  },

  // Get full consent data
  async getConsentData() {
    if (!window.gdprCookieNotice) return null;
    return await window.gdprCookieNotice.getConsentData();
  },

  // Show cookie preferences again
  showPreferences() {
    if (window.gdprCookieNotice) {
      window.gdprCookieNotice.showPreferences();
    }
  },

  // Check if analytics tracking is allowed
  async canTrackAnalytics() {
    return await this.hasConsent("analytics");
  },

  // Check if research data collection is allowed
  async canCollectResearchData() {
    return await this.hasConsent("research");
  },
};

// Export for module systems
/* global module */
if (typeof module !== "undefined" && typeof module.exports !== "undefined") {
  module.exports = { GDPRUtils: window.GDPRUtils };
}
