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
 * User Tracking Initialization
 * Initializes comprehensive user metadata tracking and insights dashboard
 * with enhanced regional analytics capabilities
 */

import enhancedUserTracking from "./services/enhanced-user-tracking.js";
import googleAnalytics from "./services/google-analytics.js";
import logger from "./utils/logger.js";

// Initialize enhanced user tracking when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  try {
    logger.info("Initializing enhanced user tracking system...");

    // Initialize Google Analytics first
    await googleAnalytics.initialize();

    // Initialize the enhanced user tracking system
    enhancedUserTracking.initialize();

    // Track app startup in GA4
    googleAnalytics.trackEvent("app_startup", {
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    logger.info("Enhanced user tracking system initialized successfully");
  } catch (error) {
    logger.error("Failed to initialize enhanced user tracking system:", error);
  }
});

// Export for use in other modules
export { enhancedUserTracking, googleAnalytics };
