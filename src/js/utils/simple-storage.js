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
 * Simplified Storage Manager - Robust and Educational-Focused
 * Provides essential storage functionality with graceful degradation
 *
 * @version 1.0.0
 * @author SimulateAI Team
 * @license Apache-2.0
 */

import logger from "./logger.js";

/**
 * Simple, robust storage manager with fallbacks
 */
class SimpleStorageManager {
  constructor() {
    this.prefix = "ai_ethics_";
    this.isLocalStorageAvailable =
      this.checkStorageAvailability("localStorage");
    this.isSessionStorageAvailable =
      this.checkStorageAvailability("sessionStorage");
    this.memoryStorage = new Map(); // Fallback storage

    // Initialize with a simple test
    this.init();
  }

  /**
   * Initialize storage and log status
   */
  init() {
    logger.info("Storage", "Storage Status");
    // Storage availability logging disabled for cleaner console output
    // logger.info(
    //   'Storage',
    //   '- localStorage',
    //   this.isLocalStorageAvailable ? '✅ Available' : '❌ Not available'
    // );
    // logger.info(
    //   'Storage',
    //   '- sessionStorage',
    //   this.isSessionStorageAvailable ? '✅ Available' : '❌ Not available'
    // );

    if (!this.isLocalStorageAvailable && !this.isSessionStorageAvailable) {
      logger.warn(
        "⚠️  Browser storage not available. Using memory storage (data will not persist).",
      );
    }
  }

  /**
   * Check if a storage type is available
   */
  checkStorageAvailability(storageType) {
    try {
      const storage = window[storageType];
      if (!storage) return false;

      const testKey = "__storage_test__";
      storage.setItem(testKey, "test");
      storage.removeItem(testKey);
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Get a value from storage with fallback chain
   */
  get(key, defaultValue = null) {
    const fullKey = this.prefix + key;

    try {
      // Try localStorage first
      if (this.isLocalStorageAvailable) {
        const value = localStorage.getItem(fullKey);
        if (value !== null) {
          return JSON.parse(value);
        }
      }

      // Try sessionStorage
      if (this.isSessionStorageAvailable) {
        const value = sessionStorage.getItem(fullKey);
        if (value !== null) {
          return JSON.parse(value);
        }
      }

      // Try memory storage
      if (this.memoryStorage.has(fullKey)) {
        return this.memoryStorage.get(fullKey);
      }
    } catch (e) {
      logger.warn(`Error reading storage key "${key}":`, e);
    }

    return defaultValue;
  }

  /**
   * Set a value in storage with fallback chain
   */
  set(key, value) {
    const fullKey = this.prefix + key;
    let success = false;

    try {
      // Try localStorage first
      if (this.isLocalStorageAvailable) {
        localStorage.setItem(fullKey, JSON.stringify(value));
        success = true;
      }
      // Try sessionStorage as backup
      else if (this.isSessionStorageAvailable) {
        sessionStorage.setItem(fullKey, JSON.stringify(value));
        success = true;
      }

      // Always store in memory as final fallback
      this.memoryStorage.set(fullKey, value);
    } catch (e) {
      logger.warn(`Error saving storage key "${key}":`, e);
      // Fallback to memory storage
      this.memoryStorage.set(fullKey, value);
    }

    return success;
  }

  /**
   * Remove a value from all storage types
   */
  remove(key) {
    const fullKey = this.prefix + key;

    try {
      if (this.isLocalStorageAvailable) {
        localStorage.removeItem(fullKey);
      }
      if (this.isSessionStorageAvailable) {
        sessionStorage.removeItem(fullKey);
      }
      this.memoryStorage.delete(fullKey);
    } catch (e) {
      logger.warn(`Error removing storage key "${key}":`, e);
    }
  }

  /**
   * Clear all app data from storage
   */
  clear() {
    try {
      // Clear from localStorage
      if (this.isLocalStorageAvailable) {
        const keys = Object.keys(localStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            localStorage.removeItem(key);
          }
        });
      }

      // Clear from sessionStorage
      if (this.isSessionStorageAvailable) {
        const keys = Object.keys(sessionStorage);
        keys.forEach((key) => {
          if (key.startsWith(this.prefix)) {
            sessionStorage.removeItem(key);
          }
        });
      }

      // Clear memory storage
      this.memoryStorage.clear();
    } catch (e) {
      logger.warn("Error clearing storage:", e);
    }
  }

  /**
   * Get all keys for debugging
   */
  getAllKeys() {
    const keys = new Set();

    try {
      // From localStorage
      if (this.isLocalStorageAvailable) {
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith(this.prefix)) {
            keys.add(key.replace(this.prefix, ""));
          }
        });
      }

      // From sessionStorage
      if (this.isSessionStorageAvailable) {
        Object.keys(sessionStorage).forEach((key) => {
          if (key.startsWith(this.prefix)) {
            keys.add(key.replace(this.prefix, ""));
          }
        });
      }

      // From memory storage
      this.memoryStorage.forEach((value, key) => {
        if (key.startsWith(this.prefix)) {
          keys.add(key.replace(this.prefix, ""));
        }
      });
    } catch (e) {
      logger.warn("Error getting storage keys:", e);
    }

    return Array.from(keys);
  }

  /**
   * Check storage usage (simplified)
   */
  getStorageInfo() {
    return {
      localStorageAvailable: this.isLocalStorageAvailable,
      sessionStorageAvailable: this.isSessionStorageAvailable,
      memoryStorageKeys: this.memoryStorage.size,
      allKeys: this.getAllKeys(),
    };
  }
}

/**
 * Convenience methods for common storage operations
 * Enhanced with DataHandler integration for Phase 3.3
 */
class UserPreferences {
  constructor(storage, app = null) {
    this.storage = storage;
    this.dataHandler = app?.dataHandler || null;

    if (this.dataHandler) {
      console.log("[UserPreferences] DataHandler integration enabled");
    } else {
      console.log("[UserPreferences] Using storage-only mode");
    }
  }

  // User interface preferences
  async getTheme() {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const theme = await this.dataHandler.getData("userPreferences_theme");
        if (theme !== null && theme !== undefined) {
          return theme;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for theme, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    return this.storage.get("theme", "light");
  }

  async setTheme(theme) {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const success = await this.dataHandler.saveData(
          "userPreferences_theme",
          theme,
        );
        if (success) {
          console.log("[UserPreferences] Theme saved to DataHandler");
          // Also save to storage for immediate access
          this.storage.set("theme", theme);
          return;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for saving theme, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    this.storage.set("theme", theme);
  }

  async getLanguage() {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const language = await this.dataHandler.getData(
          "userPreferences_language",
        );
        if (language !== null && language !== undefined) {
          return language;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for language, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    return this.storage.get("language", "en");
  }

  async setLanguage(language) {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const success = await this.dataHandler.saveData(
          "userPreferences_language",
          language,
        );
        if (success) {
          console.log("[UserPreferences] Language saved to DataHandler");
          // Also save to storage for immediate access
          this.storage.set("language", language);
          return;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for saving language, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    this.storage.set("language", language);
  }

  // Accessibility preferences
  async getAccessibilitySettings() {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const settings = await this.dataHandler.getData(
          "userPreferences_accessibility",
        );
        if (settings !== null && settings !== undefined) {
          return settings;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for accessibility settings, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    return this.storage.get("accessibility", {
      // Note: undefined values mean user hasn't set them explicitly
      // Boolean values mean user has made an explicit choice
    });
  }

  async setAccessibilitySettings(settings) {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const success = await this.dataHandler.saveData(
          "userPreferences_accessibility",
          settings,
        );
        if (success) {
          console.log(
            "[UserPreferences] Accessibility settings saved to DataHandler",
          );
          // Also save to storage for immediate access
          this.storage.set("accessibility", settings);
          return;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for saving accessibility settings, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    this.storage.set("accessibility", settings);
  }

  // Pre-launch modal preferences
  async getPreLaunchSettings() {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const settings = await this.dataHandler.getData(
          "userPreferences_preLaunch",
        );
        if (settings !== null && settings !== undefined) {
          return settings;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for pre-launch settings, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    return this.storage.get("preLaunchSettings", {
      skipPreLaunch: false,
      skipPreLaunchFor: {},
      alwaysShowEducatorResources: true,
    });
  }

  async setPreLaunchSettings(settings) {
    // Try DataHandler first if available
    if (this.dataHandler) {
      try {
        const success = await this.dataHandler.saveData(
          "userPreferences_preLaunch",
          settings,
        );
        if (success) {
          console.log(
            "[UserPreferences] Pre-launch settings saved to DataHandler",
          );
          // Also save to storage for immediate access
          this.storage.set("preLaunchSettings", settings);
          return;
        }
      } catch (error) {
        console.warn(
          "[UserPreferences] DataHandler failed for saving pre-launch settings, using storage fallback:",
          error,
        );
      }
    }

    // Fallback to storage
    this.storage.set("preLaunchSettings", settings);
  }

  // Convenience methods for pre-launch modal
  async shouldSkipPreLaunch(simulationId = null) {
    const settings = await this.getPreLaunchSettings();
    if (simulationId) {
      return settings.skipPreLaunch || settings.skipPreLaunchFor[simulationId];
    }
    return settings.skipPreLaunch;
  }

  async setSkipPreLaunchFor(simulationId, skip = true) {
    const settings = await this.getPreLaunchSettings();
    settings.skipPreLaunchFor[simulationId] = skip;
    await this.setPreLaunchSettings(settings);
  }

  async setSkipPreLaunchGlobally(skip = true) {
    const settings = await this.getPreLaunchSettings();
    settings.skipPreLaunch = skip;
    await this.setPreLaunchSettings(settings);
  }

  // All preferences as one object
  async getAllPreferences() {
    return {
      theme: await this.getTheme(),
      language: await this.getLanguage(),
      accessibility: await this.getAccessibilitySettings(),
      preLaunch: await this.getPreLaunchSettings(),
    };
  }

  /**
   * Enhanced data migration - migrate existing storage data to DataHandler
   */
  async migratePreferencesToDataHandler() {
    if (!this.dataHandler) {
      console.log("[UserPreferences] No DataHandler available for migration");
      return;
    }

    try {
      const migrationKeys = [
        { storage: "theme", dataHandler: "userPreferences_theme" },
        { storage: "language", dataHandler: "userPreferences_language" },
        {
          storage: "accessibility",
          dataHandler: "userPreferences_accessibility",
        },
        {
          storage: "preLaunchSettings",
          dataHandler: "userPreferences_preLaunch",
        },
      ];

      let migratedCount = 0;

      for (const keyMap of migrationKeys) {
        try {
          // Check if data exists in storage but not in DataHandler
          const storageData = this.storage.get(keyMap.storage);
          if (storageData !== null && storageData !== undefined) {
            const existingData = await this.dataHandler.getData(
              keyMap.dataHandler,
            );
            if (existingData === null || existingData === undefined) {
              // Migrate to DataHandler
              await this.dataHandler.saveData(keyMap.dataHandler, storageData, {
                source: "UserPreferences_migration",
              });
              migratedCount++;
              console.log(
                `[UserPreferences] Migrated ${keyMap.storage} to DataHandler`,
              );
            }
          }
        } catch (keyError) {
          console.warn(
            `[UserPreferences] Failed to migrate ${keyMap.storage}:`,
            keyError,
          );
        }
      }

      if (migratedCount > 0) {
        console.log(
          `[UserPreferences] Successfully migrated ${migratedCount} preference keys to DataHandler`,
        );
      } else {
        console.log("[UserPreferences] No preferences required migration");
      }
    } catch (error) {
      console.error("[UserPreferences] Preferences migration failed:", error);
    }
  }

  /**
   * Initialize UserPreferences with enhanced app integration
   * This method allows late binding of DataHandler after initial creation
   */
  async initialize(app = null) {
    this.dataHandler = app?.dataHandler || null;

    if (this.dataHandler) {
      console.log(
        "[UserPreferences] Enhanced integration enabled with DataHandler",
      );
      // Perform migration if DataHandler is available
      await this.migratePreferencesToDataHandler();
    } else {
      console.log("[UserPreferences] Running in storage-only mode");
    }
  }
}

/**
 * User progress tracking
 */
class UserProgress {
  constructor(storage) {
    this.storage = storage;
  }

  // Simulation progress
  getSimulationProgress(simulationId) {
    return this.storage.get(`progress_${simulationId}`, {
      completed: false,
      score: 0,
      scenarios: [],
      timeSpent: 0,
      lastPlayed: null,
    });
  }

  setSimulationProgress(simulationId, progress) {
    this.storage.set(`progress_${simulationId}`, {
      ...progress,
      lastPlayed: new Date().toISOString(),
    });
  }

  // Check if simulation is completed
  isSimulationCompleted(simulationId) {
    const progress = this.getSimulationProgress(simulationId);
    return progress.completed || false;
  }

  // Get completed simulations list
  getCompletedSimulations() {
    const stats = this.getOverallStats();
    return stats.completedSimulations || [];
  }

  // Overall user stats
  getOverallStats() {
    return this.storage.get("overall_stats", {
      totalSimulations: 0,
      totalTimeSpent: 0,
      averageScore: 0,
      completedSimulations: [],
      achievements: [],
    });
  }

  setOverallStats(stats) {
    this.storage.set("overall_stats", stats);
  }

  // Get all progress data
  getAllProgress() {
    const keys = this.storage.getAllKeys();
    const progressKeys = keys.filter((key) => key.startsWith("progress_"));
    const progress = {};

    progressKeys.forEach((key) => {
      const simulationId = key.replace("progress_", "");
      progress[simulationId] = this.getSimulationProgress(simulationId);
    });

    return {
      simulations: progress,
      overall: this.getOverallStats(),
    };
  }
}

/**
 * Enhanced analytics support for storage consolidation
 */
class AnalyticsStorage {
  constructor(storage) {
    this.storage = storage;
  }

  // Session management
  getSessionId() {
    return this.storage.get("analytics_session_id", "");
  }

  setSessionId(sessionId) {
    this.storage.set("analytics_session_id", sessionId);
  }

  // Analytics events batching
  async getAnalyticsBatch() {
    return this.storage.get("analytics_batch", []);
  }

  async setAnalyticsBatch(events) {
    this.storage.set("analytics_batch", events);
  }

  // Analytics sessions
  async getAnalyticsSessions() {
    return this.storage.get("analytics_sessions", []);
  }

  async setAnalyticsSessions(sessions) {
    this.storage.set("analytics_sessions", sessions);
  }

  // Last visit timestamp
  async getLastVisitTimestamp() {
    return this.storage.get("last_visit_timestamp", 0);
  }

  async setLastVisitTimestamp(timestamp) {
    this.storage.set("last_visit_timestamp", timestamp);
  }

  // User decisions storage
  async getDecisions() {
    return this.storage.get("user_decisions", []);
  }

  async setDecisions(decisions) {
    this.storage.set("user_decisions", decisions);
  }

  // Log analytics event
  async logAnalyticsEvent(event) {
    const events = await this.getAnalyticsBatch();
    events.push({
      ...event,
      timestamp: Date.now(),
      id: Math.random().toString(36).substr(2, 9),
    });
    await this.setAnalyticsBatch(events);
  }

  // User preferences bridge methods for analytics compatibility
  async getUserPreferences() {
    return this.storage.get("user_preferences", {
      theme: "light",
      language: "en",
      accessibility: {},
      analytics: {
        enabled: true,
        trackingConsent: false,
      },
    });
  }

  async saveUserPreferences(preferences) {
    this.storage.set("user_preferences", preferences);
  }
}

// Create singleton instances
const simpleStorage = new SimpleStorageManager();
const userPreferences = new UserPreferences(simpleStorage);
const userProgress = new UserProgress(simpleStorage);
const analyticsStorage = new AnalyticsStorage(simpleStorage);

// Export for use in other modules
export {
  SimpleStorageManager,
  simpleStorage,
  userPreferences,
  userProgress,
  analyticsStorage,
};

// Legacy compatibility layer for analytics.js migration
export const StorageManager = {
  // Basic storage operations
  get: (key, defaultValue) => simpleStorage.get(key, defaultValue),
  set: (key, value) => simpleStorage.set(key, value),
  remove: (key) => simpleStorage.remove(key),

  // Analytics-specific methods
  getSessionId: () => analyticsStorage.getSessionId(),
  getUserPreferences: () => analyticsStorage.getUserPreferences(),
  saveUserPreferences: (prefs) => analyticsStorage.saveUserPreferences(prefs),
  getDecisions: () => analyticsStorage.getDecisions(),
  getCompletedSimulations: () => userProgress.getCompletedSimulations(),
  isSimulationCompleted: (id) => userProgress.isSimulationCompleted(id),
  logAnalyticsEvent: (event) => analyticsStorage.logAnalyticsEvent(event),
};

// Make available globally for debugging
window.SimpleStorage = {
  manager: simpleStorage,
  preferences: userPreferences,
  progress: userProgress,
  analytics: analyticsStorage,
  legacy: StorageManager,
};

logger.info("Storage", "✅ Simple Storage Manager initialized");
