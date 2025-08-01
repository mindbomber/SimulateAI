/**
 * Environment Configuration Utility
 * Handles secure loading of environment variables
 */

class EnvironmentConfig {
  constructor() {
    this.config = this.loadConfig();
  }

  loadConfig() {
    // Check if running in development or production
    // Add fallback for when import.meta.env is not available
    const metaEnv = import.meta.env || {};
    const isDevelopment =
      metaEnv.DEV ||
      (!metaEnv.PROD && window.location.hostname === "localhost");
    const isProduction =
      metaEnv.PROD ||
      (!metaEnv.DEV && window.location.hostname !== "localhost");

    // Load environment variables
    const config = {
      // Firebase Configuration
      firebase: {
        apiKey: metaEnv.VITE_FIREBASE_API_KEY || "demo-api-key",
        authDomain:
          metaEnv.VITE_FIREBASE_AUTH_DOMAIN || "demo-project.firebaseapp.com",
        projectId: metaEnv.VITE_FIREBASE_PROJECT_ID || "demo-project",
        storageBucket:
          metaEnv.VITE_FIREBASE_STORAGE_BUCKET || "demo-project.appspot.com",
        messagingSenderId:
          metaEnv.VITE_FIREBASE_MESSAGING_SENDER_ID || "123456789",
        appId: metaEnv.VITE_FIREBASE_APP_ID || "1:123456789:web:abcdef",
        measurementId: metaEnv.VITE_FIREBASE_MEASUREMENT_ID || "G-ABCDEF1234",
      },

      // Stripe Configuration (with fallback)
      stripe: {
        publishableKey: metaEnv.VITE_STRIPE_PUBLISHABLE_KEY || "pk_demo_key",
      },

      // Environment Settings
      environment:
        metaEnv.VITE_ENVIRONMENT ||
        (isProduction ? "production" : "development"),
      isDevelopment,
      isProduction,
    };

    // Validate required configuration
    this.validateConfig(config);

    return config;
  }

  validateConfig(config) {
    const requiredKeys = [
      "firebase.apiKey",
      "firebase.authDomain",
      "firebase.projectId",
      "stripe.publishableKey",
    ];

    const missing = [];

    requiredKeys.forEach((keyPath) => {
      const value = this.getNestedValue(config, keyPath);
      if (!value) {
        missing.push(keyPath);
      }
    });

    if (missing.length > 0) {
      // Log missing environment variables for debugging
      if (window.console && window.console.error) {
        window.console.error(
          "❌ Missing required environment variables:",
          missing,
        );
        window.console.error(
          "Please check your .env file and ensure all required variables are set.",
        );

        // In development, show helpful message
        if (config.isDevelopment && window.console.info) {
          window.console.info(
            "💡 Copy .env.example to .env and fill in your values",
          );
        }
      }
    }
  }

  getNestedValue(obj, path) {
    return path.split(".").reduce((current, key) => current?.[key], obj);
  }

  // Getter methods for easy access
  getFirebaseConfig() {
    return this.config.firebase;
  }

  getStripePublishableKey() {
    return this.config.stripe.publishableKey;
  }

  getEnvironment() {
    return this.config.environment;
  }

  isDevelopment() {
    return this.config.isDevelopment;
  }

  isProduction() {
    return this.config.isProduction;
  }

  // Security check for sensitive data
  hasSensitiveDataInCode() {
    const warnings = [];

    // Check for hardcoded API keys (basic patterns)
    const codeText = document.documentElement.innerHTML;

    if (codeText.includes("AIzaSy") && this.isProduction()) {
      warnings.push("Firebase API key may be hardcoded");
    }

    if (codeText.includes("sk_live_") && this.isProduction()) {
      warnings.push("Stripe secret key found in code (CRITICAL)");
    }

    if (codeText.includes("pk_live_") && this.isProduction()) {
      warnings.push("Stripe publishable key may be hardcoded");
    }

    if (warnings.length > 0) {
      if (window.console && window.console.warn) {
        window.console.warn("🔒 Security Warning:", warnings);
      }
    }

    return warnings;
  }
}

// Create singleton instance
const envConfig = new EnvironmentConfig();

// Export for use throughout the application
export default envConfig;

// Also make available globally for legacy code
window.envConfig = envConfig;
