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
} from '../data/badge-config.js';

/**
 * Badge Manager Class
 * Manages badge state, progress tracking, and achievement calculations
 */
export class BadgeManager {
  constructor() {
    this.STORAGE_KEY = 'simulateai_badge_progress';
    this.CATEGORY_PROGRESS_KEY = 'simulateai_category_progress';
    this.badgeState = this.loadBadgeState();
    // Don't load category progress in constructor - always read fresh from localStorage
    this.categoryProgress = {};
  }

  /**
   * Loads badge state from localStorage
   * @returns {Object} Badge state object
   */
  loadBadgeState() {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      // Silent error handling for badge state loading
      return {};
    }
  }

  /**
   * Saves badge state to localStorage
   */
  saveBadgeState() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.badgeState));
    } catch (error) {
      // Silent error handling for badge state saving
      // Could implement user notification here if needed
    }
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

      // Initialize all badge tiers as unearned
      ACTIVE_BADGE_TIERS.forEach(tier => {
        this.badgeState[categoryId].badges[`tier${tier.tier}`] = {
          unlocked: false,
          timestamp: null,
          requirement: tier.requirement,
        };
      });
    }
  }

  /**
   * Updates scenario completion and checks for new badge achievements
   * Follows the same pattern as existing category-grid.js updateProgress method
   * @param {string} categoryId - Category identifier
   * @param {string} _scenarioId - Scenario identifier (for logging/analytics, not used in logic)
   * @returns {Array} Array of newly earned badges
   */
  updateScenarioCompletion(categoryId, _scenarioId) {
    // Initialize category if needed
    this.initializeCategoryBadges(categoryId);

    // Get current completion count for this category from localStorage
    // This matches the existing pattern in category-grid.js and category-page.js
    const stored = localStorage.getItem('simulateai_category_progress');
    const userProgress = stored ? JSON.parse(stored) : {};
    const categoryProgress = userProgress[categoryId] || {};

    const completedScenarios = Object.keys(categoryProgress).filter(
      scenarioKey => categoryProgress[scenarioKey] === true
    );
    const completionCount = completedScenarios.length;

    // Update badge state with current count
    this.badgeState[categoryId].totalCompleted = completionCount;
    this.badgeState[categoryId].lastUpdated = Date.now();

    // Check for newly earned badges
    const newlyEarnedBadges = this.checkForNewBadges(
      categoryId,
      completionCount
    );

    // Save updated state
    this.saveBadgeState();

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

    ACTIVE_BADGE_TIERS.forEach(tier => {
      const tierKey = `tier${tier.tier}`;
      const badgeInfo = categoryBadges[tierKey];

      // Check if badge should be earned but hasn't been unlocked yet
      if (completionCount >= tier.requirement && !badgeInfo.unlocked) {
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

    ACTIVE_BADGE_TIERS.forEach(tier => {
      const tierKey = `tier${tier.tier}`;
      const badgeInfo = categoryBadges[tierKey];

      if (badgeInfo.unlocked) {
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
   * @returns {Object|null} Next badge configuration or null if all earned
   */
  getNextBadge(categoryId) {
    const completionCount = this.getCategoryCompletionCount(categoryId);
    const nextTier = getNextBadgeTier(completionCount);

    return nextTier ? getBadgeConfig(categoryId, nextTier.tier) : null;
  }

  /**
   * Gets completion count for a category using the same localStorage pattern as existing code
   * @param {string} categoryId - Category identifier
   * @returns {number} Number of completed scenarios
   */
  getCategoryCompletionCount(categoryId) {
    // Always load fresh category progress from localStorage to match existing pattern
    const stored = localStorage.getItem('simulateai_category_progress');
    const userProgress = stored ? JSON.parse(stored) : {};
    const categoryProgress = userProgress[categoryId] || {};

    return Object.keys(categoryProgress).filter(
      scenarioKey => categoryProgress[scenarioKey] === true
    ).length;
  }

  /**
   * Gets progress towards next badge
   * @param {string} categoryId - Category identifier
   * @returns {Object} Progress information
   */
  getBadgeProgress(categoryId) {
    const completionCount = this.getCategoryCompletionCount(categoryId);
    const nextBadge = this.getNextBadge(categoryId);
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
              (completionCount / nextBadge.requirement) * 100
            ),
          }
        : null,
    };
  }

  /**
   * Gets all badge states across all categories
   * @returns {Object} Complete badge state summary
   */
  getAllBadgeStates() {
    const allStates = {};

    // Reload category progress to get latest data using consistent localStorage pattern
    const stored = localStorage.getItem('simulateai_category_progress');
    const userProgress = stored ? JSON.parse(stored) : {};

    Object.keys(userProgress).forEach(categoryId => {
      allStates[categoryId] = this.getBadgeProgress(categoryId);
    });

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

    Object.keys(this.badgeState).forEach(categoryId => {
      const categoryBadges = this.badgeState[categoryId].badges;
      total += Object.values(categoryBadges).filter(
        badge => badge.unlocked
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
   * Force updates category progress from current localStorage state
   * Matches the pattern used in existing category-grid.js and category-page.js
   */
  refreshCategoryProgress() {
    // Load fresh data from localStorage using the same key as existing code
    const stored = localStorage.getItem('simulateai_category_progress');
    this.categoryProgress = stored ? JSON.parse(stored) : {};
  }
}

// Create singleton instance
const badgeManager = new BadgeManager();

export default badgeManager;
