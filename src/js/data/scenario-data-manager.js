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
 * Scenario Data Manager
 * Centralized manager for loading and validating scenario data across all categories
 * Enhanced with DataHandler integration for Phase 3.4 and creation date metadata
 */

import logger from "../utils/logger.js";
import {
  addCreationMetadata,
  getScenarioCreationDate,
  getCategoryCreationDate,
} from "./scenario-creation-dates.js";

class ScenarioDataManager {
  constructor(app = null) {
    this.scenarioCache = new Map();
    this.categoryCache = new Map();

    // DataHandler integration for centralized data management
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

    if (this.dataHandler) {
      console.log("[ScenarioDataManager] DataHandler integration enabled");
    } else {
      console.log("[ScenarioDataManager] Using cache-only mode");
    }
  }

  /**
   * Map category IDs to scenario file names
   */
  getCategoryFileName(categoryId) {
    const categoryFileMap = {
      "trolley-problem": "trolley-problem-scenarios",
      "ai-black-box": "ai-black-box-scenarios",
      "automation-oversight": "automation-oversight-scenarios",
      "consent-surveillance": "consent-surveillance-scenarios",
      "responsibility-blame": "responsibility-blame-scenarios",
      "ship-of-theseus": "ship-of-theseus-scenarios",
      "simulation-hypothesis": "simulation-hypothesis-scenarios",
      "experience-machine": "experience-machine-scenarios",
      "sorites-paradox": "sorites-paradox-scenarios",
      "moral-luck": "moral-luck-scenarios",
    };

    return categoryFileMap[categoryId] || `${categoryId}-scenarios`;
  }

  /**
   * Load scenario data for a specific category with DataHandler caching
   */
  async loadCategoryScenarios(categoryId) {
    // Check memory cache first
    if (this.categoryCache.has(categoryId)) {
      return this.categoryCache.get(categoryId);
    }

    // Try DataHandler cache second if available
    if (this.dataHandler) {
      try {
        const cachedScenarios = await this.dataHandler.getData(
          `scenarioDataManager_category_${categoryId}`,
        );
        if (cachedScenarios && Object.keys(cachedScenarios).length > 0) {
          console.log(
            `[ScenarioDataManager] Category ${categoryId} loaded from DataHandler cache`,
          );
          // Store in memory cache for immediate access
          this.categoryCache.set(categoryId, cachedScenarios);
          return cachedScenarios;
        }
      } catch (error) {
        console.warn(
          `[ScenarioDataManager] DataHandler failed for category ${categoryId}, loading from file:`,
          error,
        );
      }
    }

    try {
      const fileName = this.getCategoryFileName(categoryId);
      // Dynamic import based on category ID
      const module = await import(`./scenarios/${fileName}.js`);
      const scenarios = module.default || module.scenarios;

      // Validate scenario data
      this.validateScenarios(scenarios, categoryId);

      // Cache in memory
      this.categoryCache.set(categoryId, scenarios);

      // Cache in DataHandler if available
      if (this.dataHandler) {
        try {
          await this.dataHandler.saveData(
            `scenarioDataManager_category_${categoryId}`,
            scenarios,
            {
              source: "ScenarioDataManager_fileLoad",
              categoryId: categoryId,
              timestamp: new Date().toISOString(),
            },
          );
          console.log(
            `[ScenarioDataManager] Category ${categoryId} cached in DataHandler`,
          );
        } catch (error) {
          console.warn(
            `[ScenarioDataManager] Failed to cache category ${categoryId} in DataHandler:`,
            error,
          );
        }
      }

      logger.info(
        "ScenarioDataManager",
        `Loaded ${Object.keys(scenarios).length} scenarios for category: ${categoryId}`,
      );
      return scenarios;
    } catch (error) {
      logger.error(
        `Failed to load scenarios for category ${categoryId}:`,
        error,
      );

      // Return empty scenarios object as fallback
      return {};
    }
  }

  /**
   * Get a specific scenario by category and scenario ID with DataHandler caching
   */
  async getScenario(categoryId, scenarioId) {
    const cacheKey = `${categoryId}:${scenarioId}`;

    // Check memory cache first
    if (this.scenarioCache.has(cacheKey)) {
      return this.scenarioCache.get(cacheKey);
    }

    // Try DataHandler cache for individual scenario
    if (this.dataHandler) {
      try {
        const cachedScenario = await this.dataHandler.getData(
          `scenarioDataManager_scenario_${cacheKey}`,
        );
        if (cachedScenario && typeof cachedScenario === "object") {
          console.log(
            `[ScenarioDataManager] Scenario ${cacheKey} loaded from DataHandler cache`,
          );
          // Store in memory cache for immediate access
          this.scenarioCache.set(cacheKey, cachedScenario);
          return cachedScenario;
        }
      } catch (error) {
        console.warn(
          `[ScenarioDataManager] DataHandler failed for scenario ${cacheKey}, loading from category:`,
          error,
        );
      }
    }

    try {
      const categoryScenarios = await this.loadCategoryScenarios(categoryId);
      const scenario = categoryScenarios[scenarioId];

      if (scenario) {
        // Add creation metadata to scenario
        const enhancedScenario = addCreationMetadata(scenario, scenarioId);

        // Cache enhanced scenario in memory
        this.scenarioCache.set(cacheKey, enhancedScenario);

        // Cache in DataHandler if available
        if (this.dataHandler) {
          try {
            await this.dataHandler.saveData(
              `scenarioDataManager_scenario_${cacheKey}`,
              enhancedScenario,
              {
                source: "ScenarioDataManager_scenarioLoad",
                categoryId: categoryId,
                scenarioId: scenarioId,
                timestamp: new Date().toISOString(),
              },
            );
            console.log(
              `[ScenarioDataManager] Scenario ${cacheKey} cached in DataHandler with metadata`,
            );
          } catch (error) {
            console.warn(
              `[ScenarioDataManager] Failed to cache scenario ${cacheKey} in DataHandler:`,
              error,
            );
          }
        }

        return enhancedScenario;
      } else {
        logger.warn(
          `Scenario ${scenarioId} not found in category ${categoryId}`,
        );
        return null;
      }
    } catch (error) {
      logger.error(
        `Failed to get scenario ${categoryId}:${scenarioId}:`,
        error,
      );
      return null;
    }
  }

  /**
   * Validate scenario data structure
   */
  validateScenarios(scenarios, categoryId) {
    if (!scenarios || typeof scenarios !== "object") {
      throw new Error(`Invalid scenarios object for category ${categoryId}`);
    }

    for (const [scenarioId, scenario] of Object.entries(scenarios)) {
      this.validateScenario(scenario, scenarioId, categoryId);
    }
  }

  /**
   * Validate individual scenario structure
   */
  validateScenario(scenario, scenarioId, categoryId) {
    const required = ["title", "dilemma", "ethicalQuestion", "options"];

    for (const field of required) {
      if (!scenario[field]) {
        logger.warn(
          `Missing required field '${field}' in scenario ${categoryId}:${scenarioId}`,
        );
      }
    }

    // Validate options structure
    if (scenario.options && Array.isArray(scenario.options)) {
      scenario.options.forEach((option, index) => {
        const optionRequired = ["id", "text", "description", "impact"];
        for (const field of optionRequired) {
          if (!option[field]) {
            logger.warn(
              `Missing '${field}' in option ${index} of scenario ${categoryId}:${scenarioId}`,
            );
          }
        }

        // Validate impact object
        if (option.impact && typeof option.impact === "object") {
          const expectedMetrics = [
            "fairness",
            "sustainability",
            "autonomy",
            "beneficence",
            "transparency",
            "accountability",
            "privacy",
            "proportionality",
          ];
          expectedMetrics.forEach((metric) => {
            if (typeof option.impact[metric] !== "number") {
              logger.warn(
                `Missing or invalid impact metric '${metric}' in ${categoryId}:${scenarioId} option ${index}`,
              );
            }
          });
        }
      });
    }
  }

  /**
   * Clear cache (useful for development/testing) with DataHandler cleanup
   */
  async clearCache() {
    this.scenarioCache.clear();
    this.categoryCache.clear();

    // Clear DataHandler cache if available
    if (this.dataHandler) {
      try {
        // Note: DataHandler doesn't have a pattern-based clear method
        // We'll track keys and clear them individually
        const cacheKeys = [
          ...Array.from(this.categoryCache.keys()).map(
            (key) => `scenarioDataManager_category_${key}`,
          ),
          ...Array.from(this.scenarioCache.keys()).map(
            (key) => `scenarioDataManager_scenario_${key}`,
          ),
        ];

        for (const key of cacheKeys) {
          try {
            await this.dataHandler.removeData(key);
          } catch (keyError) {
            console.warn(
              `[ScenarioDataManager] Failed to remove ${key} from DataHandler:`,
              keyError,
            );
          }
        }

        console.log(
          `[ScenarioDataManager] Cleared ${cacheKeys.length} items from DataHandler cache`,
        );
      } catch (error) {
        console.warn(
          "[ScenarioDataManager] Failed to clear DataHandler cache:",
          error,
        );
      }
    }

    logger.info("Scenario data cache cleared");
  }

  /**
   * Get all cached categories
   */
  getCachedCategories() {
    return Array.from(this.categoryCache.keys());
  }

  /**
   * Get all cached scenarios
   */
  getCachedScenarios() {
    return Array.from(this.scenarioCache.keys());
  }

  /**
   * Initialize ScenarioDataManager with enhanced app integration
   * This method allows late binding of DataHandler after initial creation
   */
  async initialize(app = null) {
    this.app = app;
    this.dataHandler = app?.dataHandler || null;

    if (this.dataHandler) {
      console.log(
        "[ScenarioDataManager] Enhanced integration enabled with DataHandler",
      );
      // Perform any necessary migration or preloading
      await this.performInitialDataSync();
    } else {
      console.log("[ScenarioDataManager] Running in cache-only mode");
    }
  }

  /**
   * Perform initial data synchronization and migration
   */
  async performInitialDataSync() {
    if (!this.dataHandler) return;

    try {
      // Check if we have any cached scenarios in DataHandler
      const existingCacheInfo = await this.dataHandler.getData(
        "scenarioDataManager_cacheInfo",
      );

      if (existingCacheInfo) {
        console.log(
          `[ScenarioDataManager] Found existing cache info in DataHandler:`,
          existingCacheInfo,
        );
      } else {
        // Save initial cache info
        await this.dataHandler.saveData("scenarioDataManager_cacheInfo", {
          initialized: true,
          version: "1.0.0",
          timestamp: new Date().toISOString(),
          categories: [],
          scenarios: [],
        });
        console.log(
          "[ScenarioDataManager] Initialized DataHandler cache tracking",
        );
      }
    } catch (error) {
      console.warn(
        "[ScenarioDataManager] Failed to perform initial data sync:",
        error,
      );
    }
  }

  /**
   * Preload commonly used scenarios into DataHandler cache
   */
  async preloadCommonScenarios() {
    if (!this.dataHandler) return;

    const commonCategories = [
      "trolley-problem",
      "ai-black-box",
      "automation-oversight",
      "consent-surveillance",
    ];

    console.log("[ScenarioDataManager] Preloading common scenarios...");

    for (const categoryId of commonCategories) {
      try {
        await this.loadCategoryScenarios(categoryId);
        console.log(`[ScenarioDataManager] Preloaded category: ${categoryId}`);
      } catch (error) {
        console.warn(
          `[ScenarioDataManager] Failed to preload category ${categoryId}:`,
          error,
        );
      }
    }

    console.log("[ScenarioDataManager] Preloading complete");
  }

  /**
   * Get cache statistics
   */
  getCacheStats() {
    const stats = {
      memoryCache: {
        categories: this.categoryCache.size,
        scenarios: this.scenarioCache.size,
        totalMemoryItems: this.categoryCache.size + this.scenarioCache.size,
      },
      dataHandlerEnabled: !!this.dataHandler,
      timestamp: new Date().toISOString(),
    };

    return stats;
  }

  /**
   * Get scenario creation metadata
   * @param {string} scenarioId - The scenario identifier
   * @returns {object|null} Metadata object with creation date and theme
   */
  getScenarioMetadata(scenarioId) {
    const creationDate = getScenarioCreationDate(scenarioId);
    if (!creationDate) return null;

    return {
      createdAt: creationDate,
      updatedAt: creationDate, // Initially same as creation date
      version: 1.0,
      isPublished: true,
    };
  }

  /**
   * Get category creation metadata
   * @param {string} categoryId - The category identifier
   * @returns {object|null} Metadata object with creation date
   */
  getCategoryMetadata(categoryId) {
    const creationDate = getCategoryCreationDate(categoryId);
    if (!creationDate) return null;

    return {
      createdAt: creationDate,
      updatedAt: creationDate,
      version: 1.0,
      isPublished: true,
    };
  }
}

// Export the class for enhanced app integration
export { ScenarioDataManager };

// Export singleton instance for backward compatibility
export default new ScenarioDataManager();
