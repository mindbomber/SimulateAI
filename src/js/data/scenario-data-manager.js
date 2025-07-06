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
 */

import logger from '../utils/logger.js';

class ScenarioDataManager {
  constructor() {
    this.scenarioCache = new Map();
    this.categoryCache = new Map();
  }

  /**
   * Map category IDs to scenario file names
   */
  getCategoryFileName(categoryId) {
    const categoryFileMap = {
      'trolley-problem': 'trolley-problem-scenarios',
      'ai-black-box': 'ai-black-box-scenarios',
      'automation-oversight': 'automation-oversight-scenarios',
      'consent-surveillance': 'consent-surveillance-scenarios',
      'responsibility-blame': 'responsibility-blame-scenarios',
      'ship-of-theseus': 'ship-of-theseus-scenarios',
      'simulation-hypothesis': 'simulation-hypothesis-scenarios',
      'experience-machine': 'experience-machine-scenarios',
      'sorites-paradox': 'sorites-paradox-scenarios',
      'moral-luck': 'moral-luck-scenarios',
    };

    return categoryFileMap[categoryId] || `${categoryId}-scenarios`;
  }

  /**
   * Load scenario data for a specific category
   */
  async loadCategoryScenarios(categoryId) {
    if (this.categoryCache.has(categoryId)) {
      return this.categoryCache.get(categoryId);
    }

    try {
      const fileName = this.getCategoryFileName(categoryId);
      // Dynamic import based on category ID
      const module = await import(`./scenarios/${fileName}.js`);
      const scenarios = module.default || module.scenarios;

      // Validate scenario data
      this.validateScenarios(scenarios, categoryId);

      // Cache the result
      this.categoryCache.set(categoryId, scenarios);

      logger.info(
        'ScenarioDataManager',
        `Loaded ${Object.keys(scenarios).length} scenarios for category: ${categoryId}`
      );
      return scenarios;
    } catch (error) {
      logger.error(
        `Failed to load scenarios for category ${categoryId}:`,
        error
      );

      // Return empty scenarios object as fallback
      return {};
    }
  }

  /**
   * Get a specific scenario by category and scenario ID
   */
  async getScenario(categoryId, scenarioId) {
    const cacheKey = `${categoryId}:${scenarioId}`;

    if (this.scenarioCache.has(cacheKey)) {
      return this.scenarioCache.get(cacheKey);
    }

    try {
      const categoryScenarios = await this.loadCategoryScenarios(categoryId);
      const scenario = categoryScenarios[scenarioId];

      if (scenario) {
        this.scenarioCache.set(cacheKey, scenario);
        return scenario;
      } else {
        logger.warn(
          `Scenario ${scenarioId} not found in category ${categoryId}`
        );
        return null;
      }
    } catch (error) {
      logger.error(
        `Failed to get scenario ${categoryId}:${scenarioId}:`,
        error
      );
      return null;
    }
  }

  /**
   * Validate scenario data structure
   */
  validateScenarios(scenarios, categoryId) {
    if (!scenarios || typeof scenarios !== 'object') {
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
    const required = ['title', 'dilemma', 'ethicalQuestion', 'options'];

    for (const field of required) {
      if (!scenario[field]) {
        logger.warn(
          `Missing required field '${field}' in scenario ${categoryId}:${scenarioId}`
        );
      }
    }

    // Validate options structure
    if (scenario.options && Array.isArray(scenario.options)) {
      scenario.options.forEach((option, index) => {
        const optionRequired = ['id', 'text', 'description', 'impact'];
        for (const field of optionRequired) {
          if (!option[field]) {
            logger.warn(
              `Missing '${field}' in option ${index} of scenario ${categoryId}:${scenarioId}`
            );
          }
        }

        // Validate impact object
        if (option.impact && typeof option.impact === 'object') {
          const expectedMetrics = [
            'fairness',
            'sustainability',
            'autonomy',
            'beneficence',
            'transparency',
            'accountability',
            'privacy',
            'proportionality',
          ];
          expectedMetrics.forEach(metric => {
            if (typeof option.impact[metric] !== 'number') {
              logger.warn(
                `Missing or invalid impact metric '${metric}' in ${categoryId}:${scenarioId} option ${index}`
              );
            }
          });
        }
      });
    }
  }

  /**
   * Clear cache (useful for development/testing)
   */
  clearCache() {
    this.scenarioCache.clear();
    this.categoryCache.clear();
    logger.info('Scenario data cache cleared');
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
}

// Export singleton instance
export default new ScenarioDataManager();
