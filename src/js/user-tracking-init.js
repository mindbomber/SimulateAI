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
 * Initializes Google Analytics for comprehensive user tracking
 */

import googleAnalytics from "./services/google-analytics.js";
import logger from "./utils/logger.js";

// Initialize Google Analytics when DOM is ready
document.addEventListener("DOMContentLoaded", async () => {
  try {
    logger.info("Initializing Google Analytics tracking system...");

    // Initialize Google Analytics
    await googleAnalytics.initialize();

    // Track app startup in GA4
    googleAnalytics.trackEvent("app_startup", {
      timestamp: Date.now(),
      user_agent: navigator.userAgent,
      viewport: `${window.innerWidth}x${window.innerHeight}`,
    });

    logger.info("Google Analytics tracking system initialized successfully");
  } catch (error) {
    logger.error(
      "Failed to initialize Google Analytics tracking system:",
      error,
    );
  }
});

// Export for use in other modules
export { googleAnalytics };
