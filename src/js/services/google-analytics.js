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
 * Google Analytics 4 Integration
 * Handles GA4 tracking initialization and event management
 */

import logger from "../utils/logger.js";

class GoogleAnalytics {
  constructor() {
    this.trackingId = "G-4SVB78MBHN";
    this.initialized = false;
    this.dataLayer = [];
  }

  /**
   * Initialize Google Analytics 4
   */
  async initialize() {
    if (this.initialized) {
      logger.warn("GoogleAnalytics", "Already initialized");
      return;
    }

    try {
      // Initialize dataLayer
      window.dataLayer = window.dataLayer || [];
      this.dataLayer = window.dataLayer;

      // Define gtag function
      window.gtag = function () {
        window.dataLayer.push(arguments);
      };

      // Set initial timestamp
      window.gtag("js", new Date());

      // Configure GA4
      window.gtag("config", this.trackingId, {
        // Enhanced measurement settings
        enhanced_measurement: true,
        page_title: document.title,
        page_location: window.location.href,
        // Privacy settings
        anonymize_ip: true,
        // App-specific configuration
        custom_map: {
          custom_parameter_1: "app_section",
          custom_parameter_2: "user_type",
        },
      });

      // Load GA4 script
      await this.loadGAScript();

      this.initialized = true;
      logger.info("GoogleAnalytics", "GA4 initialized successfully", {
        trackingId: this.trackingId,
        enhanced_measurement: true,
      });

      // Track initialization
      this.trackEvent("app_initialized", {
        app_name: "SimulateAI",
        app_version: "1.40",
        initialization_time: Date.now(),
      });
    } catch (error) {
      logger.error("GoogleAnalytics", "Failed to initialize GA4", error);
      throw error;
    }
  }

  /**
   * Load Google Analytics script
   * @private
   */
  loadGAScript() {
    return new Promise((resolve, reject) => {
      // Check if script already exists
      const existingScript = document.querySelector(
        `script[src*="googletagmanager.com/gtag/js"]`,
      );
      if (existingScript) {
        resolve();
        return;
      }

      const script = document.createElement("script");
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${this.trackingId}`;

      script.onload = () => {
        logger.info("GoogleAnalytics", "GA4 script loaded successfully");
        resolve();
      };

      script.onerror = (error) => {
        logger.error("GoogleAnalytics", "Failed to load GA4 script", error);
        reject(error);
      };

      // Insert script in head
      document.head.appendChild(script);
    });
  }

  /**
   * Track custom events
   * @param {string} eventName - Name of the event
   * @param {Object} parameters - Event parameters
   */
  trackEvent(eventName, parameters = {}) {
    if (!this.initialized) {
      logger.warn("GoogleAnalytics", "Cannot track event - not initialized", {
        eventName,
        parameters,
      });
      return;
    }

    try {
      window.gtag("event", eventName, {
        ...parameters,
        timestamp: Date.now(),
        page_title: document.title,
        page_location: window.location.href,
      });

      logger.debug("GoogleAnalytics", "Event tracked", {
        eventName,
        parameters,
      });
    } catch (error) {
      logger.error("GoogleAnalytics", "Failed to track event", {
        eventName,
        parameters,
        error,
      });
    }
  }

  /**
   * Track page views
   * @param {string} pageTitle - Page title
   * @param {string} pagePath - Page path
   */
  trackPageView(
    pageTitle = document.title,
    pagePath = window.location.pathname,
  ) {
    if (!this.initialized) {
      logger.warn(
        "GoogleAnalytics",
        "Cannot track page view - not initialized",
      );
      return;
    }

    try {
      window.gtag("config", this.trackingId, {
        page_title: pageTitle,
        page_location: window.location.href,
        page_path: pagePath,
      });

      logger.debug("GoogleAnalytics", "Page view tracked", {
        pageTitle,
        pagePath,
      });
    } catch (error) {
      logger.error("GoogleAnalytics", "Failed to track page view", {
        pageTitle,
        pagePath,
        error,
      });
    }
  }

  /**
   * Track user engagement events
   * @param {string} action - The action taken
   * @param {string} category - Event category
   * @param {Object} additionalData - Additional tracking data
   */
  trackEngagement(action, category = "engagement", additionalData = {}) {
    this.trackEvent("user_engagement", {
      engagement_action: action,
      engagement_category: category,
      ...additionalData,
    });
  }

  /**
   * Track simulation-specific events
   * @param {string} scenarioId - Scenario identifier
   * @param {string} action - Action taken in simulation
   * @param {Object} data - Simulation data
   */
  trackSimulation(scenarioId, action, data = {}) {
    this.trackEvent("simulation_interaction", {
      scenario_id: scenarioId,
      simulation_action: action,
      simulation_data: JSON.stringify(data),
    });
  }

  /**
   * Track educational content engagement
   * @param {string} contentType - Type of content (article, simulation, etc.)
   * @param {string} contentId - Content identifier
   * @param {string} action - Action taken
   */
  trackEducationalContent(contentType, contentId, action) {
    this.trackEvent("educational_engagement", {
      content_type: contentType,
      content_id: contentId,
      educational_action: action,
    });
  }

  /**
   * Set user properties
   * @param {Object} properties - User properties to set
   */
  setUserProperties(properties = {}) {
    if (!this.initialized) {
      logger.warn(
        "GoogleAnalytics",
        "Cannot set user properties - not initialized",
      );
      return;
    }

    try {
      window.gtag("config", this.trackingId, {
        custom_parameters: properties,
      });

      logger.debug("GoogleAnalytics", "User properties set", properties);
    } catch (error) {
      logger.error("GoogleAnalytics", "Failed to set user properties", {
        properties,
        error,
      });
    }
  }

  /**
   * Check if GA4 is initialized and ready
   * @returns {boolean}
   */
  isReady() {
    return this.initialized && typeof window.gtag === "function";
  }
}

// Create singleton instance
const googleAnalytics = new GoogleAnalytics();

// Auto-initialize on DOM ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => {
    googleAnalytics.initialize().catch((error) => {
      logger.error("GoogleAnalytics", "Auto-initialization failed", error);
    });
  });
} else {
  // DOM already loaded
  googleAnalytics.initialize().catch((error) => {
    logger.error("GoogleAnalytics", "Auto-initialization failed", error);
  });
}

export default googleAnalytics;
