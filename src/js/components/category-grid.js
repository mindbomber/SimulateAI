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
 * Category Grid Component
 * Displays the main grid of ethical dilemma categories on the home page
 * Part of the SimulateAI Ethics Platform Revamp - Phase 1.1
 */

import {
  getAllCategories,
  getCategoryProgress,
  getCategoryScenarios,
} from '../../data/categories.js';
import logger from '../utils/logger.js';
import PreLaunchModal from './pre-launch-modal.js';
import ScenarioModal from './scenario-modal.js';

// Constants
const PROGRESS_CIRCLE_CIRCUMFERENCE = 163; // 2 * π * 26 (radius)
const HIGHLIGHT_DURATION = 2000;

class CategoryGrid {
  constructor() {
    this.container = null;
    this.categories = getAllCategories();
    this.userProgress = this.loadUserProgress();

    this.init();
  }

  init() {
    this.container = document.querySelector('.simulations-grid');
    if (!this.container) {
      logger.error('Category grid container not found');
      return;
    }

    this.render();
    this.attachEventListeners();
  }

  loadUserProgress() {
    // Load user progress from localStorage
    try {
      const stored = localStorage.getItem('simulateai_category_progress');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      logger.error('Failed to load user progress:', error);
      return {};
    }
  }

  saveUserProgress() {
    try {
      localStorage.setItem(
        'simulateai_category_progress',
        JSON.stringify(this.userProgress)
      );
    } catch (error) {
      logger.error('Failed to save user progress:', error);
    }
  }

  getCategoryProgress(categoryId) {
    return getCategoryProgress(categoryId, this.userProgress);
  }

  render() {
    this.container.innerHTML = '';

    // Create the complete category-based layout
    this.categories.forEach(category => {
      const categorySection = this.createCategorySection(category);
      this.container.appendChild(categorySection);
    });
  }

  createCategorySection(category) {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.setAttribute('data-category-id', category.id);

    const progress = this.getCategoryProgress(category.id);
    const scenarios = getCategoryScenarios(category.id);

    section.innerHTML = `
            <div class="category-header">
                <div class="category-title-group">
                    <div class="category-icon-large" style="background-color: ${category.color}20; color: ${category.color}">
                        ${category.icon}
                    </div>
                    <div class="category-info">
                        <h3 class="category-title">${category.title}</h3>
                        <p class="category-description">${category.description}</p>
                        <div class="category-meta">
                            <div class="category-meta-items">
                                <span class="category-difficulty difficulty-${category.difficulty}">${category.difficulty}</span>
                                <span class="category-time">${category.estimatedTime} min</span>
                                <span class="category-progress-text">${progress.completed}/${progress.total} completed</span>
                            </div>
                            <a href="category.html?category=${category.id}" class="category-see-all">See All</a>
                        </div>
                    </div>
                </div>
                <div class="category-progress-ring">
                    <svg width="60" height="60" viewBox="0 0 60 60">
                        <circle cx="30" cy="30" r="26" fill="none" stroke="#e5e7eb" stroke-width="4"/>
                        <circle cx="30" cy="30" r="26" fill="none" stroke="${category.color}" stroke-width="4"
                                stroke-linecap="round" stroke-dasharray="${PROGRESS_CIRCLE_CIRCUMFERENCE}" 
                                stroke-dashoffset="${PROGRESS_CIRCLE_CIRCUMFERENCE - (progress.percentage / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE}"
                                style="transform: rotate(-90deg); transform-origin: 30px 30px;"/>
                    </svg>
                    <span class="progress-percentage">${progress.percentage}%</span>
                </div>
            </div>

            <div class="scenarios-grid">
                ${scenarios.map(scenario => this.createScenarioCard(scenario, category)).join('')}
            </div>
        `;

    return section;
  }

  createScenarioCard(scenario, category) {
    const isCompleted = this.userProgress[category.id]?.[scenario.id] || false;

    return `
            <article class="scenario-card ${isCompleted ? 'completed' : ''}" 
                     data-scenario-id="${scenario.id}" 
                     data-category-id="${category.id}"
                     role="button" 
                     tabindex="0"
                     aria-label="Scenario: ${scenario.title} - ${scenario.difficulty} difficulty">
                
                <div class="scenario-header">
                    <div class="scenario-icon" style="background-color: ${category.color}15; color: ${category.color}">
                        ${category.icon}
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

  attachEventListeners() {
    this.container.addEventListener(
      'click',
      this.handleScenarioClick.bind(this)
    );
    this.container.addEventListener(
      'keydown',
      this.handleScenarioKeydown.bind(this)
    );
  }

  handleScenarioClick(event) {
    const scenarioCard = event.target.closest('.scenario-card');
    if (!scenarioCard) return;

    const scenarioId = scenarioCard.getAttribute('data-scenario-id');
    const categoryId = scenarioCard.getAttribute('data-category-id');
    
    // Check if the clicked element is the quick start button
    if (event.target.classList.contains('scenario-quick-start-btn') || 
        event.target.closest('.scenario-quick-start-btn')) {
      this.openScenarioModalDirect(categoryId, scenarioId);
    } else {
      // Regular Learning Lab button - go through pre-launch modal
      this.openScenario(categoryId, scenarioId);
    }
  }

  handleScenarioKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      const scenarioCard = event.target.closest('.scenario-card');
      if (scenarioCard) {
        const scenarioId = scenarioCard.getAttribute('data-scenario-id');
        const categoryId = scenarioCard.getAttribute('data-category-id');
        
        // Check if focus is on the quick start button
        if (event.target.classList.contains('scenario-quick-start-btn')) {
          this.openScenarioModalDirect(categoryId, scenarioId);
        } else {
          // Regular Learning Lab button behavior
          this.openScenario(categoryId, scenarioId);
        }
      }
    }
  }

  openScenario(categoryId, scenarioId) {
    const category = this.categories.find(c => c.id === categoryId);
    const scenario = category?.scenarios.find(s => s.id === scenarioId);

    if (!category || !scenario) {
      logger.error('Category or scenario not found:', categoryId, scenarioId);
      return;
    }

    logger.info('Opening premodal for category:', category);

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('scenario-selected', {
      detail: { category, scenario, categoryId, scenarioId },
    });
    document.dispatchEvent(event);

    // Open the PreLaunchModal configured for this category
    this.openCategoryPremodal(category, scenario);
  }

  openCategoryPremodal(category, scenario) {
    try {
      // Use the category ID as the "simulation ID" and pass category/scenario data
      const preModal = new PreLaunchModal(category.id, {
        categoryData: category,
        scenarioData: scenario,
        onLaunch: () => {
          logger.info('Starting scenario:', scenario.title);
          // Launch the scenario modal with both category and scenario IDs
          this.openScenarioModal(scenario.id, category.id);
        },
        onCancel: () => {
          logger.info('Category premodal cancelled');
        },
        showEducatorResources: true,
      });

      preModal.show();
    } catch (error) {
      logger.error('Failed to open category premodal:', error);
      // Fallback to simple alert
      alert(
        `Opening "${scenario.title}" from ${category.title} - Premodal setup needed for categories!`
      );
    }
  }

  /**
   * Open scenario modal for a specific scenario
   */
  openScenarioModal(scenarioId, categoryId = null) {
    try {
      const scenarioModal = new ScenarioModal();
      scenarioModal.open(scenarioId, categoryId);

      // Listen for scenario completion
      document.addEventListener(
        'scenario-completed',
        this.handleScenarioCompleted.bind(this),
        { once: true }
      );
    } catch (error) {
      logger.error('Failed to open scenario modal:', error);
      // Fallback to alert
      alert(`Failed to open scenario modal for: ${scenarioId}`);
    }
  }

  /**
   * Open scenario modal directly, skipping pre-launch modal
   */
  openScenarioModalDirect(categoryId, scenarioId) {
    const category = this.categories.find(c => c.id === categoryId);
    const scenario = category?.scenarios.find(s => s.id === scenarioId);

    if (!category || !scenario) {
      logger.error('Category or scenario not found:', categoryId, scenarioId);
      return;
    }

    logger.info('Opening scenario modal directly for:', scenario.title);

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('scenario-selected', {
      detail: { category, scenario, categoryId, scenarioId },
    });
    document.dispatchEvent(event);

    // Open the scenario modal directly
    this.openScenarioModal(scenarioId, categoryId);
  }

  /**
   * Handle scenario completion event
   */
  handleScenarioCompleted(event) {
    const { scenarioId, selectedOption, option } = event.detail;

    logger.info('Scenario completed:', {
      scenarioId,
      selectedOption,
      optionText: option.text,
    });

    // Find the category that contains this scenario
    const category = this.categories.find(cat => {
      const scenarios = getCategoryScenarios(cat.id);
      return scenarios.some(scenario => scenario.id === scenarioId);
    });

    if (category) {
      // Update progress
      this.updateProgress(category.id, scenarioId, true);

      // Track analytics if available
      if (window.AnalyticsManager) {
        window.AnalyticsManager.trackEvent('scenario_completed', {
          categoryId: category.id,
          scenarioId,
          selectedOption,
          optionText: option.text,
          impact: option.impact,
        });
      }
    }
  }

  updateProgress(categoryId, scenarioId, completed = true) {
    if (!this.userProgress[categoryId]) {
      this.userProgress[categoryId] = {};
    }

    this.userProgress[categoryId][scenarioId] = completed;
    this.saveUserProgress();

    // Re-render to update progress indicators
    this.render();
  }

  getFilteredCategories(filter = {}) {
    let filtered = [...this.categories];

    if (filter.difficulty) {
      filtered = filtered.filter(c => c.difficulty === filter.difficulty);
    }

    if (filter.tags) {
      filtered = filtered.filter(c =>
        filter.tags.some(tag => c.tags.includes(tag))
      );
    }

    if (filter.completed !== undefined) {
      filtered = filtered.filter(c => {
        const progress = this.getCategoryProgress(c.id);
        return filter.completed
          ? progress.completed === progress.total
          : progress.completed < progress.total;
      });
    }

    return filtered;
  }

  // Public API for external components
  refreshProgress() {
    this.userProgress = this.loadUserProgress();
    this.render();
  }

  highlightScenario(categoryId, scenarioId) {
    const card = this.container.querySelector(
      `[data-category-id="${categoryId}"][data-scenario-id="${scenarioId}"]`
    );
    if (card) {
      card.scrollIntoView({ behavior: 'smooth', block: 'center' });
      card.classList.add('scenario-card-highlighted');
      setTimeout(
        () => card.classList.remove('scenario-card-highlighted'),
        HIGHLIGHT_DURATION
      );
    }
  }

  highlightCategory(categoryId) {
    const section = this.container.querySelector(
      `[data-category-id="${categoryId}"]`
    );
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
      section.classList.add('category-section-highlighted');
      setTimeout(
        () => section.classList.remove('category-section-highlighted'),
        HIGHLIGHT_DURATION
      );
    }
  }
}

export default CategoryGrid;
