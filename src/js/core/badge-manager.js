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
 * Badge Progress Manager
 *
 * Handles badge state management, progress tracking, and achievement logic
 * for the SimulateAI badge system. Integrates with existing localStorage
 * progress tracking.
 */

import {
  getBadgeConfig,
  getNextBadgeTier,
  ACTIVE_BADGE_TIERS,
} from "../data/badge-config.js";

/**
 * Badge Manager Class
 * Manages badge state, progress tracking, and achievement calculations
 */
export class BadgeManager {
  constructor(app = null) {
    this.app = app;
    this.dataHandler = app?.dataHandler || null;
    this.STORAGE_KEY = "simulateai_badge_progress";
    this.CATEGORY_PROGRESS_KEY = "simulateai_category_progress";
    this.badgeState = {}; // Will be loaded async in initializeAsync()
    // Don't load category progress in constructor - always read fresh from localStorage
    this.categoryProgress = {};
    this.isInitialized = false;

    // Auto-initialize for backward compatibility
    this.initializeAsync();
  }

  /**
   * Async initialization for enhanced DataHandler integration
   */
  async initializeAsync() {
    if (this.isInitialized) return;

    try {
      this.badgeState = await this.loadBadgeState();
      this.isInitialized = true;
    } catch (error) {
      console.warn("[BadgeManager] Async initialization failed:", error);
      // Fallback to empty state
      this.badgeState = {};
      this.isInitialized = true;
    }
  }

  /**
   * Loads badge state from DataHandler with localStorage fallback
   * @returns {Object} Badge state object
   */
  async loadBadgeState() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const stored = await this.dataHandler.getData("badge_manager_state");
        if (stored && Object.keys(stored).length > 0) {
          console.log("[BadgeManager] Badge state loaded from DataHandler");
          return stored;
        }
      }

      // Fallback to localStorage
      const stored = localStorage.getItem(this.STORAGE_KEY);
      const badgeState = stored ? JSON.parse(stored) : {};

      // If we found badge state in localStorage and have DataHandler, migrate it
      if (
        badgeState &&
        Object.keys(badgeState).length > 0 &&
        this.dataHandler
      ) {
        await this.dataHandler.saveData("badge_manager_state", badgeState);
        console.log(
          "[BadgeManager] Migrated badge state from localStorage to DataHandler",
        );
      }

      return badgeState;
    } catch (error) {
      console.warn("[BadgeManager] Failed to load badge state:", error);
      return {};
    }
  }

  /**
   * Saves badge state with DataHandler-first approach
   */
  async saveBadgeState() {
    try {
      // Try DataHandler first if available
      if (this.dataHandler) {
        const success = await this.dataHandler.saveData(
          "badge_manager_state",
          this.badgeState,
        );
        if (success) {
          console.log("[BadgeManager] Badge state saved to DataHandler");
          // Also save to localStorage for immediate access
          localStorage.setItem(
            this.STORAGE_KEY,
            JSON.stringify(this.badgeState),
          );
          return;
        }
      }

      // Fallback to localStorage
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.badgeState));
      console.log("[BadgeManager] Badge state saved to localStorage");
    } catch (error) {
      console.warn("[BadgeManager] Failed to save badge state:", error);
      // Try localStorage as final fallback
      try {
        localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.badgeState));
      } catch (fallbackError) {
        console.error("[BadgeManager] All save methods failed:", fallbackError);
      }
    }
  }

  /**
   * Synchronous badge state save wrapper for immediate operations
   */
  saveBadgeStateSync() {
    this.saveBadgeState().catch((error) => {
      console.warn("[BadgeManager] Async badge state save failed:", error);
    });
  }

  /**
   * Initializes badge state for a category if not exists
   * @param {string} categoryId - Category identifier
   */
  initializeCategoryBadges(categoryId) {
    if (!this.badgeState[categoryId]) {
      this.badgeState[categoryId] = {
        badges: {},
        totalCompleted: 0,
        lastUpdated: Date.now(),
      };
    }

    // Ensure all active badge tiers exist (handles tier expansion)
    ACTIVE_BADGE_TIERS.forEach((tier) => {
      const tierKey = `tier${tier.tier}`;
      if (!this.badgeState[categoryId].badges[tierKey]) {
        this.badgeState[categoryId].badges[tierKey] = {
          unlocked: false,
          timestamp: null,
          requirement: tier.requirement,
        };
      }
    });
  }

  /**
   * Updates scenario completion and checks for new badge achievements
   * Enhanced to use DataHandler with localStorage fallback
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier (for logging/analytics)
   * @returns {Promise<Array>} Array of newly earned badges
   */
  async updateScenarioCompletion(categoryId, scenarioId) {
    // Initialize category if needed
    this.initializeCategoryBadges(categoryId);

    // Get current completion count using DataHandler-first approach
    const completionCount = await this.getCategoryCompletionCount(categoryId);

    // Update badge state with current count
    this.badgeState[categoryId].totalCompleted = completionCount;
    this.badgeState[categoryId].lastUpdated = Date.now();

    // Check for newly earned badges
    const newlyEarnedBadges = this.checkForNewBadges(
      categoryId,
      completionCount,
    );

    // Save updated state using async operation
    await this.saveBadgeState();

    // Log for analytics if scenario provided
    if (scenarioId) {
      console.log(
        `[BadgeManager] Updated completion for ${categoryId}:${scenarioId}, earned ${newlyEarnedBadges.length} new badges`,
      );
    }

    return newlyEarnedBadges;
  }

  /**
   * Checks for newly earned badges based on completion count
   * @param {string} categoryId - Category identifier
   * @param {number} completionCount - Number of completed scenarios
   * @returns {Array} Array of newly earned badge configurations
   */
  checkForNewBadges(categoryId, completionCount) {
    const newlyEarned = [];
    const categoryBadges = this.badgeState[categoryId].badges;

    ACTIVE_BADGE_TIERS.forEach((tier) => {
      const tierKey = `tier${tier.tier}`;
      const badgeInfo = categoryBadges[tierKey];

      // Safety check: ensure badgeInfo exists before accessing properties
      if (
        badgeInfo &&
        completionCount >= tier.requirement &&
        !badgeInfo.unlocked
      ) {
        // Mark badge as earned
        badgeInfo.unlocked = true;
        badgeInfo.timestamp = Date.now();

        // Get full badge configuration
        const badgeConfig = getBadgeConfig(categoryId, tier.tier);
        if (badgeConfig) {
          newlyEarned.push({
            ...badgeConfig,
            categoryId,
            timestamp: badgeInfo.timestamp,
          });
        }
      }
    });

    return newlyEarned;
  }

  /**
   * Gets all earned badges for a category
   * @param {string} categoryId - Category identifier
   * @returns {Array} Array of earned badge configurations
   */
  getEarnedBadges(categoryId) {
    this.initializeCategoryBadges(categoryId);

    const categoryBadges = this.badgeState[categoryId].badges;
    const earnedBadges = [];

    ACTIVE_BADGE_TIERS.forEach((tier) => {
      const tierKey = `tier${tier.tier}`;
      const badgeInfo = categoryBadges[tierKey];

      // Safety check: ensure badgeInfo exists before accessing properties
      if (badgeInfo && badgeInfo.unlocked) {
        const badgeConfig = getBadgeConfig(categoryId, tier.tier);
        if (badgeConfig) {
          earnedBadges.push({
            ...badgeConfig,
            categoryId,
            timestamp: badgeInfo.timestamp,
          });
        }
      }
    });

    return earnedBadges.sort((a, b) => a.tier - b.tier);
  }

  /**
   * Gets next available badge for a category
   * @param {string} categoryId - Category identifier
   * @returns {Promise<Object|null>} Next badge configuration or null if all earned
   */
  async getNextBadge(categoryId) {
    const completionCount = await this.getCategoryCompletionCount(categoryId);
    const nextTier = getNextBadgeTier(completionCount);

    return nextTier ? getBadgeConfig(categoryId, nextTier.tier) : null;
  }

  /**
   * Gets completion count for a category using DataHandler with localStorage fallback
   * @param {string} categoryId - Category identifier
   * @returns {number} Number of completed scenarios
   */
  async getCategoryCompletionCount(categoryId) {
    try {
      let userProgress = {};

      // Try DataHandler first if available
      if (this.dataHandler) {
        userProgress = (await this.dataHandler.getData("user_progress")) || {};
      }

      // Fallback to localStorage if DataHandler unavailable or returns empty
      if (!userProgress || Object.keys(userProgress).length === 0) {
        const stored = localStorage.getItem("simulateai_category_progress");
        userProgress = stored ? JSON.parse(stored) : {};
      }

      const categoryProgress = userProgress[categoryId] || {};
      return Object.keys(categoryProgress).filter(
        (scenarioKey) => categoryProgress[scenarioKey] === true,
      ).length;
    } catch (error) {
      console.warn(
        `[BadgeManager] Failed to get completion count for ${categoryId}:`,
        error,
      );
      // Final fallback to localStorage
      const stored = localStorage.getItem("simulateai_category_progress");
      const userProgress = stored ? JSON.parse(stored) : {};
      const categoryProgress = userProgress[categoryId] || {};
      return Object.keys(categoryProgress).filter(
        (scenarioKey) => categoryProgress[scenarioKey] === true,
      ).length;
    }
  }

  /**
   * Gets progress towards next badge
   * @param {string} categoryId - Category identifier
   * @returns {Promise<Object>} Progress information
   */
  async getBadgeProgress(categoryId) {
    const completionCount = await this.getCategoryCompletionCount(categoryId);
    const nextBadge = await this.getNextBadge(categoryId);
    const earnedBadges = this.getEarnedBadges(categoryId);

    return {
      completed: completionCount,
      nextBadge,
      earnedBadges,
      progress: nextBadge
        ? {
            current: completionCount,
            required: nextBadge.requirement,
            remaining: Math.max(0, nextBadge.requirement - completionCount),
            percentage: Math.min(
              100,
              (completionCount / nextBadge.requirement) * 100,
            ),
          }
        : null,
    };
  }

  /**
   * Gets all badge states across all categories
   * @returns {Promise<Object>} Complete badge state summary
   */
  async getAllBadgeStates() {
    const allStates = {};

    try {
      // Get user progress from DataHandler with localStorage fallback
      let userProgress = {};

      if (this.dataHandler) {
        userProgress = (await this.dataHandler.getData("user_progress")) || {};
      }

      if (!userProgress || Object.keys(userProgress).length === 0) {
        const stored = localStorage.getItem("simulateai_category_progress");
        userProgress = stored ? JSON.parse(stored) : {};
      }

      // Process each category asynchronously
      const categoryIds = Object.keys(userProgress);
      const promises = categoryIds.map(async (categoryId) => {
        const badgeProgress = await this.getBadgeProgress(categoryId);
        return { categoryId, badgeProgress };
      });

      const results = await Promise.all(promises);
      results.forEach(({ categoryId, badgeProgress }) => {
        allStates[categoryId] = badgeProgress;
      });
    } catch (error) {
      console.warn("[BadgeManager] Failed to get all badge states:", error);
      // Fallback to localStorage
      const stored = localStorage.getItem("simulateai_category_progress");
      const userProgress = stored ? JSON.parse(stored) : {};

      for (const categoryId of Object.keys(userProgress)) {
        try {
          allStates[categoryId] = await this.getBadgeProgress(categoryId);
        } catch (catError) {
          console.warn(
            `[BadgeManager] Failed to get badge progress for ${categoryId}:`,
            catError,
          );
        }
      }
    }

    return allStates;
  }

  /**
   * Checks if a specific badge is earned
   * @param {string} categoryId - Category identifier
   * @param {number} tier - Badge tier
   * @returns {boolean} True if badge is earned
   */
  isBadgeEarned(categoryId, tier) {
    this.initializeCategoryBadges(categoryId);
    const tierKey = `tier${tier}`;
    return this.badgeState[categoryId].badges[tierKey]?.unlocked || false;
  }

  /**
   * Gets total number of earned badges across all categories
   * @returns {number} Total earned badge count
   */
  getTotalEarnedBadges() {
    let total = 0;

    Object.keys(this.badgeState).forEach((categoryId) => {
      const categoryBadges = this.badgeState[categoryId].badges;
      total += Object.values(categoryBadges).filter(
        (badge) => badge.unlocked,
      ).length;
    });

    return total;
  }

  /**
   * Resets all badge progress (for testing/debugging)
   */
  resetBadgeProgress() {
    this.badgeState = {};
    localStorage.removeItem(this.STORAGE_KEY);
    // Badge progress reset - for development/testing
  }

  /**
   * Force updates category progress from DataHandler with localStorage fallback
   * Enhanced to use DataHandler-first approach for consistency
   */
  async refreshCategoryProgress() {
    try {
      let categoryProgress = {};

      // Try DataHandler first if available
      if (this.dataHandler) {
        categoryProgress =
          (await this.dataHandler.getData("user_progress")) || {};
      }

      // Fallback to localStorage if DataHandler unavailable or returns empty
      if (!categoryProgress || Object.keys(categoryProgress).length === 0) {
        const stored = localStorage.getItem("simulateai_category_progress");
        categoryProgress = stored ? JSON.parse(stored) : {};
      }

      this.categoryProgress = categoryProgress;
    } catch (error) {
      console.warn(
        "[BadgeManager] Failed to refresh category progress:",
        error,
      );
      // Final fallback to localStorage
      const stored = localStorage.getItem("simulateai_category_progress");
      this.categoryProgress = stored ? JSON.parse(stored) : {};
    }
  }

  /**
   * Synchronous version for backward compatibility
   * Uses localStorage directly for immediate access
   */
  refreshCategoryProgressSync() {
    try {
      const stored = localStorage.getItem("simulateai_category_progress");
      this.categoryProgress = stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.warn(
        "[BadgeManager] Failed to refresh category progress (sync):",
        error,
      );
      this.categoryProgress = {};
    }
  }
}

// Create singleton instance
let badgeManager;

// Enhanced initialization for app integration
if (typeof window !== "undefined" && window.app) {
  badgeManager = new BadgeManager(window.app);
} else {
  badgeManager = new BadgeManager();
}

export default badgeManager;
