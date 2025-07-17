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
 * Reusable Scenario Card Component
 * Provides consistent scenario card rendering across the application
 * Used by category-grid.js and scenario-browser.js
 */

class ScenarioCard {
  /**
   * Create a scenario card HTML string
   * @param {Object} scenario - Scenario data
   * @param {Object} category - Category data with color, icon, id
   * @param {boolean} isCompleted - Whether scenario is completed
   * @returns {string} HTML string for the scenario card
   */
  static render(scenario, category, isCompleted = false) {
    // Ensure we have fallback values for category
    const safeCategory = {
      color: category?.color || '#667eea',
      icon: category?.icon || '🤖',
      id: category?.id || scenario.categoryId || 'default',
      ...category,
    };

    return `
      <article class="scenario-card ${isCompleted ? 'completed' : ''}" 
               data-scenario-id="${scenario.id}" 
               data-category-id="${safeCategory.id}"
               aria-label="Scenario: ${scenario.title} - ${scenario.difficulty} difficulty">
          
          <div class="scenario-header">
              <div class="scenario-icon" style="background-color: ${safeCategory.color}15; color: ${safeCategory.color}">
                  ${safeCategory.icon}
              </div>
              <div class="scenario-difficulty difficulty-${scenario.difficulty}">
                  ${scenario.difficulty}
              </div>
          </div>

          <div class="scenario-content">
              <h4 class="scenario-title">${scenario.title}</h4>
              <p class="scenario-description">${scenario.description}</p>
          </div>

          <div class="scenario-footer">
              <button class="scenario-start-btn" aria-label="Learning Lab for ${scenario.title} scenario">
                  Learning Lab
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
              </button>
              <button class="scenario-quick-start-btn" aria-label="${isCompleted ? 'Replay' : 'Start'} ${scenario.title} scenario">
                  ${isCompleted ? 'Replay' : 'Start'}
                  <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M5 3L12 8L5 13V3Z" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/>
                  </svg>
              </button>
          </div>

          ${isCompleted ? '<div class="scenario-completed-badge">✓</div>' : ''}
      </article>
    `;
  }

  /**
   * Resolve category data from various sources
   * @param {Object} scenario - Scenario data
   * @param {Object|null} enhancedCategories - Enhanced categories lookup
   * @param {Function|null} getCategoriesFunction - Function to get all categories
   * @returns {Object} Resolved category data
   */
  static resolveCategory(
    scenario,
    enhancedCategories = null,
    getCategoriesFunction = null
  ) {
    let category = {};

    // Try to get category from enhanced categories first
    if (scenario.categoryId && enhancedCategories?.[scenario.categoryId]) {
      category = enhancedCategories[scenario.categoryId];
    } else if (scenario.category && typeof scenario.category === 'object') {
      ({ category } = { category: scenario.category });
    } else if (scenario.categoryId && getCategoriesFunction) {
      // Fallback: try to find category by ID
      const allCategories = getCategoriesFunction();
      category =
        allCategories.find(cat => cat.id === scenario.categoryId) || {};
    }

    return {
      color: category.color || '#667eea',
      icon: category.icon || '🤖',
      id: category.id || scenario.categoryId || 'default',
      ...category,
    };
  }
}

export default ScenarioCard;
