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
 * Category Page JavaScript
 * Handles the dedicated category page functionality
 */

import { getAllCategories, getCategoryScenarios, getCategoryProgress } from '../data/categories.js';
import PreLaunchModal from './components/pre-launch-modal.js';
import ScenarioModal from './components/scenario-modal.js';
import logger from './utils/logger.js';

class CategoryPage {
  constructor() {
    this.categoryId = null;
    this.category = null;
    this.scenarios = [];
    
    this.init();
  }

  init() {
    // Get category ID from URL parameters
    this.categoryId = this.getCategoryIdFromUrl();
    
    if (!this.categoryId) {
      this.handleError('No category specified');
      return;
    }

    // Find the category
    const allCategories = getAllCategories();
    this.category = allCategories.find(cat => cat.id === this.categoryId);
    
    if (!this.category) {
      this.handleError('Category not found');
      return;
    }

    // Load category data
    this.loadCategoryData();
    
    // Set up event listeners
    this.setupEventListeners();
    
    // Set up Surprise Me functionality
    this.setupSurpriseMe();
    
    // Update page metadata
    this.updatePageMetadata();
  }

  getCategoryIdFromUrl() {
    const urlParams = new URLSearchParams(window.location.search);
    return urlParams.get('category');
  }

  loadCategoryData() {
    try {
      // Get scenarios for this category
      this.scenarios = getCategoryScenarios(this.categoryId);
      
      // Render category header
      this.renderCategoryHeader();
      
      // Render scenarios grid
      this.renderScenariosGrid();
      
    } catch (error) {
      this.handleError('Failed to load category data');
    }
  }

  renderCategoryHeader() {
    const headerContainer = document.getElementById('category-header-content');
    if (!headerContainer) return;

    const progress = getCategoryProgress(this.categoryId);
    const PROGRESS_CIRCLE_CIRCUMFERENCE = 163.36;
    
    headerContainer.innerHTML = `
      <div class="category-title-group">
        <div class="category-icon-large" style="background-color: ${this.category.color}20; color: ${this.category.color}">
          ${this.category.icon}
        </div>
        <div class="category-info">
          <h1 class="category-title">${this.category.title}</h1>
          <p class="category-description">${this.category.description}</p>
          <div class="category-meta">
            <div class="category-meta-items">
              <span class="category-difficulty difficulty-${this.category.difficulty}">${this.category.difficulty}</span>
              <span class="category-time">${this.category.estimatedTime} min</span>
              <span class="category-progress-text">${progress.completed}/${progress.total} completed</span>
            </div>
            <a href="index.html#simulations" class="back-to-categories">Back to All Categories</a>
          </div>
        </div>
      </div>
      <div class="category-progress-ring">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#e5e7eb" stroke-width="4"/>
          <circle cx="30" cy="30" r="26" fill="none" stroke="${this.category.color}" stroke-width="4"
                  stroke-linecap="round" stroke-dasharray="${PROGRESS_CIRCLE_CIRCUMFERENCE}" 
                  stroke-dashoffset="${PROGRESS_CIRCLE_CIRCUMFERENCE - (progress.percentage / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE}"
                  style="transform: rotate(-90deg); transform-origin: 30px 30px;"/>
        </svg>
        <span class="progress-percentage">${progress.percentage}%</span>
      </div>
    `;
  }

  renderScenariosGrid() {
    const gridContainer = document.getElementById('category-scenarios-grid');
    if (!gridContainer) return;

    if (this.scenarios.length === 0) {
      gridContainer.innerHTML = `
        <div class="no-scenarios">
          <h3>No scenarios available</h3>
          <p>This category doesn't have any scenarios yet. Check back later for new content!</p>
        </div>
      `;
      return;
    }

    // Create scenario cards
    const scenarioCards = this.scenarios.map(scenario => 
      this.createScenarioCard(scenario, this.category)
    ).join('');

    gridContainer.innerHTML = scenarioCards;
  }

  createScenarioCard(scenario, category) {
    // Load user progress
    const userProgress = this.loadUserProgress();
    const isCompleted = userProgress[category.id]?.[scenario.id] || false;

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

  loadUserProgress() {
    // Load user progress from localStorage
    try {
      const stored = localStorage.getItem('simulateai_category_progress');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      return {};
    }
  }

  setupEventListeners() {
    // Add click handlers for scenario cards
    document.addEventListener('click', (e) => {
      const scenarioCard = e.target.closest('.scenario-card');
      if (scenarioCard) {
        // Prevent default navigation behavior
        e.preventDefault();
        
        const scenarioId = scenarioCard.getAttribute('data-scenario-id');
        const categoryId = scenarioCard.getAttribute('data-category-id');
        
        // Check if the clicked element is the quick start button
        if (e.target.classList.contains('scenario-quick-start-btn') || 
            e.target.closest('.scenario-quick-start-btn')) {
          this.openScenarioModalDirect(categoryId, scenarioId);
        } else {
          // Regular Learning Lab button - go through pre-launch modal
          this.openScenario(categoryId, scenarioId);
        }
      }
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const scenarioCard = e.target.closest('.scenario-card');
        if (scenarioCard) {
          e.preventDefault();
          
          const scenarioId = scenarioCard.getAttribute('data-scenario-id');
          const categoryId = scenarioCard.getAttribute('data-category-id');
          
          // Check if focus is on the quick start button
          if (e.target.classList.contains('scenario-quick-start-btn')) {
            this.openScenarioModalDirect(categoryId, scenarioId);
          } else {
            // Regular Learning Lab button behavior
            this.openScenario(categoryId, scenarioId);
          }
        }
      }
    });
  }

  openScenario(categoryId, scenarioId) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);

    if (!this.category || !scenario) {
      logger.error('Category or scenario not found:', categoryId, scenarioId);
      return;
    }

    logger.info('Opening premodal for category:', this.category);

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('scenario-selected', {
      detail: { category: this.category, scenario, categoryId, scenarioId },
    });
    document.dispatchEvent(event);

    // Open the PreLaunchModal configured for this category
    this.openCategoryPremodal(this.category, scenario);
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
    const scenario = this.scenarios.find(s => s.id === scenarioId);

    if (!this.category || !scenario) {
      logger.error('Category or scenario not found:', categoryId, scenarioId);
      return;
    }

    logger.info('Opening scenario modal directly for:', scenario.title);

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('scenario-selected', {
      detail: { category: this.category, scenario, categoryId, scenarioId },
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

    // Update progress
    this.updateProgress(this.categoryId, scenarioId, true);

    // Track analytics if available
    if (window.AnalyticsManager) {
      window.AnalyticsManager.trackEvent('scenario_completed', {
        categoryId: this.categoryId,
        scenarioId,
        selectedOption,
        optionText: option.text,
        impact: option.impact,
      });
    }
  }

  updateProgress(categoryId, scenarioId, completed = true) {
    const userProgress = this.loadUserProgress();
    
    if (!userProgress[categoryId]) {
      userProgress[categoryId] = {};
    }

    userProgress[categoryId][scenarioId] = completed;
    
    // Save progress
    try {
      localStorage.setItem('simulateai_category_progress', JSON.stringify(userProgress));
    } catch (error) {
      logger.error('Failed to save user progress:', error);
    }

    // Re-render to update progress indicators
    this.renderCategoryHeader();
    this.renderScenariosGrid();
  }

  /**
   * Sets up Surprise Me functionality
   */
  setupSurpriseMe() {
    const surpriseMeBtn = document.getElementById('surprise-me-nav');
    if (surpriseMeBtn) {
      surpriseMeBtn.addEventListener('click', (e) => {
        e.preventDefault();
        this.launchRandomScenario();
      });
    }
  }

  /**
   * Launches a random uncompleted scenario
   */
  launchRandomScenario() {
    const randomScenario = this.getRandomUncompletedScenario();
    
    if (!randomScenario) {
      this.showNotification(
        '🎉 Congratulations! You\'ve completed all scenarios! Try replaying your favorites.',
        'success'
      );
      return;
    }

    // Show notification about the selected scenario
    this.showNotification(
      `🎉 Surprise! Opening "${randomScenario.scenario.title}" from ${randomScenario.category.title}`,
      'info'
    );

    // Launch the scenario directly (skip pre-launch modal for surprise factor)
    this.openScenarioModalDirect(randomScenario.category.id, randomScenario.scenario.id);
  }

  /**
   * Gets a random uncompleted scenario from all categories
   * @returns {Object|null} Object with category and scenario, or null if all completed
   */
  getRandomUncompletedScenario() {
    try {
      // Get all categories and their scenarios
      const allCategories = getAllCategories();
      
      // Load user progress
      const userProgress = this.loadUserProgress();

      // Collect all uncompleted scenarios
      const uncompletedScenarios = [];

      allCategories.forEach(category => {
        const scenarios = getCategoryScenarios(category.id);
        scenarios.forEach(scenario => {
          const isCompleted = userProgress[category.id]?.[scenario.id] || false;
          if (!isCompleted) {
            uncompletedScenarios.push({
              category,
              scenario
            });
          }
        });
      });

      // Return random uncompleted scenario
      if (uncompletedScenarios.length === 0) {
        return null; // All scenarios completed
      }

      const randomIndex = Math.floor(Math.random() * uncompletedScenarios.length);
      return uncompletedScenarios[randomIndex];

    } catch (error) {
      logger.error('Failed to get random uncompleted scenario:', error);
      return null;
    }
  }

  /**
   * Shows a notification message
   * @param {string} message - The notification message
   * @param {string} type - The notification type ('success', 'error', 'warning', 'info')
   */
  showNotification(message, type = 'info') {
    if (window.NotificationToast) {
      // Use the global notification toast instance
      return window.NotificationToast.show({
        type,
        message,
        duration: 4000,
        closable: true,
      });
    } else {
      // Fallback to logger if notification system not available
      logger.info(`[${type.toUpperCase()}] ${message}`);
      return null;
    }
  }

  updatePageMetadata() {
    // Update page title
    document.title = `${this.category.title} - SimulateAI`;
    
    // Update meta description
    const metaDescription = document.querySelector('meta[name="description"]');
    if (metaDescription) {
      metaDescription.setAttribute('content', 
        `Explore ${this.category.title} scenarios - ${this.category.description}`
      );
    }
    
    // Update breadcrumb
    const breadcrumbTitle = document.getElementById('category-breadcrumb-title');
    if (breadcrumbTitle) {
      breadcrumbTitle.textContent = this.category.title;
    }
  }

  handleError(message) {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      mainContent.innerHTML = `
        <div class="error-page">
          <div class="container">
            <div class="error-content">
              <h1>Oops! Something went wrong</h1>
              <p>${message}</p>
              <div class="error-actions">
                <a href="index.html" class="btn btn-primary">Back to Home</a>
                <a href="index.html#simulations" class="btn btn-secondary">View All Categories</a>
              </div>
            </div>
          </div>
        </div>
      `;
    }
  }
}

// Initialize the category page when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
  new CategoryPage();
});

// Export for potential use by other modules
export { CategoryPage };
