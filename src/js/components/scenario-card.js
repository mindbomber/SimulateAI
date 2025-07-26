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
 * Reusable Scenario Card Component with JSON SSOT Configuration
 * Provides consistent scenario card rendering across the application
 * Used by category-grid.js and scenario-browser.js
 */

import {
  loadScenarioCardConfig,
  applyScenarioCardFallbacks,
  validateScenarioCardData,
} from "../utils/scenario-card-config-loader.js";

class ScenarioCard {
  /**
   * Initialize configuration
   */
  static async loadConfiguration() {
    try {
      this.config = await loadScenarioCardConfig();
      console.log("ScenarioCard configuration loaded successfully");
      return true;
    } catch (error) {
      console.error("Error loading ScenarioCard configuration:", error);
      return false;
    }
  }

  /**
   * Create a scenario card HTML string using JSON SSOT configuration
   * @param {Object} scenario - Scenario data
   * @param {Object} category - Category data with color, icon, id
   * @param {boolean} isCompleted - Whether scenario is completed
   * @returns {Promise<string>} HTML string for the scenario card
   */
  static async render(scenario, category, isCompleted = false) {
    // Ensure configuration is loaded
    if (!this.config) {
      this.config = await loadScenarioCardConfig();
    }

    // Apply fallbacks for missing data
    const { safeScenario, safeCategory } = applyScenarioCardFallbacks(
      scenario,
      category,
      this.config,
    );

    // Validate data
    const validation = validateScenarioCardData(
      safeScenario,
      safeCategory,
      this.config,
    );
    if (!validation.isValid) {
      console.warn("ScenarioCard validation warnings:", validation.errors);
    }

    const config = this.config;
    const classes = config.computed.cssClasses;
    const structure = config.card.structure;
    const buttons = config.card.buttons;

    // Generate card classes
    const cardClass = isCompleted ? classes.completed : classes.base;

    // Generate icon styles
    const iconBackgroundStyle = config.computed.styles.iconBackground(
      safeCategory.color,
    );
    const iconColorStyle = config.computed.styles.iconColor(safeCategory.color);

    // Generate difficulty class
    const difficultyClass = config.computed.styles.difficultyClass(
      safeScenario.difficulty,
    );

    // Generate text content
    const ariaLabel = config.computed.textTemplates.ariaLabel(safeScenario);
    const learningLabAriaLabel =
      config.computed.textTemplates.learningLabAriaLabel(safeScenario.title);
    const quickStartText = isCompleted
      ? buttons.quickStart.text.completed
      : buttons.quickStart.text.default;
    const quickStartAriaLabel =
      config.computed.textTemplates.quickStartAriaLabel(
        safeScenario.title,
        isCompleted,
      );

    // Generate SVG icons
    const learningLabIcon = config.computed.svgTemplates.learningLabIcon;
    const quickStartIcon = config.computed.svgTemplates.quickStartIcon;

    return `
      <${structure.container.element} class="${cardClass}" 
               data-scenario-id="${safeScenario.id}" 
               data-category-id="${safeCategory.id}"
               aria-label="${ariaLabel}">
          
          <div class="${classes.header}">
              <div class="${classes.icon}" style="${iconBackgroundStyle}; ${iconColorStyle}">
                  ${safeCategory.icon}
              </div>
              <div class="${classes.difficulty} ${difficultyClass}">
                  ${safeScenario.difficulty}
              </div>
          </div>

          <div class="${classes.content}">
              <${structure.content.title.element} class="${classes.title}">${safeScenario.title}</${structure.content.title.element}>
              <${structure.content.description.element} class="${classes.description}">${safeScenario.description}</${structure.content.description.element}>
          </div>

          <div class="${classes.footer}">
              <button class="${classes.learningLabBtn}" aria-label="${learningLabAriaLabel}">
                  ${buttons.learningLab.text}
                  ${learningLabIcon}
              </button>
              <button class="${classes.quickStartBtn}" aria-label="${quickStartAriaLabel}">
                  ${quickStartText}
                  ${quickStartIcon}
              </button>
          </div>
      </${structure.container.element}>
    `;
  }

  /**
   * Resolve category data from various sources using configuration fallbacks
   * @param {Object} scenario - Scenario data
   * @param {Object|null} enhancedCategories - Enhanced categories lookup
   * @param {Function|null} getCategoriesFunction - Function to get all categories
   * @returns {Promise<Object>} Resolved category data
   */
  static async resolveCategory(
    scenario,
    enhancedCategories = null,
    getCategoriesFunction = null,
  ) {
    // Ensure configuration is loaded
    if (!this.config) {
      this.config = await loadScenarioCardConfig();
    }

    let category = {};

    // Try to get category from enhanced categories first
    if (scenario.categoryId && enhancedCategories?.[scenario.categoryId]) {
      category = enhancedCategories[scenario.categoryId];
    } else if (scenario.category && typeof scenario.category === "object") {
      ({ category } = { category: scenario.category });
    } else if (scenario.categoryId && getCategoriesFunction) {
      // Fallback: try to find category by ID
      const allCategories = getCategoriesFunction();
      category =
        allCategories.find((cat) => cat.id === scenario.categoryId) || {};
    }

    // Apply fallbacks using configuration
    const { safeCategory } = applyScenarioCardFallbacks(
      scenario,
      category,
      this.config,
    );
    return safeCategory;
  }

  /**
   * Get configuration object (useful for debugging or external access)
   * @returns {Promise<Object>} Current configuration
   */
  static async getConfiguration() {
    if (!this.config) {
      this.config = await loadScenarioCardConfig();
    }
    return this.config;
  }

  /**
   * Refresh configuration cache
   * @returns {Promise<boolean>} Success status
   */
  static async refreshConfiguration() {
    return await this.loadConfiguration();
  }
}

export default ScenarioCard;
