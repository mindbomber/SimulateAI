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
        const { scenarioId } = scenarioCard.dataset;
        if (scenarioId) {
          this.launchScenario(scenarioId);
        }
      }
    });

    // Add keyboard navigation
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        const scenarioCard = e.target.closest('.scenario-card');
        if (scenarioCard) {
          e.preventDefault();
          const { scenarioId } = scenarioCard.dataset;
          if (scenarioId) {
            this.launchScenario(scenarioId);
          }
        }
      }
    });
  }

  launchScenario(scenarioId) {
    const scenario = this.scenarios.find(s => s.id === scenarioId);
    if (scenario) {
      // For now, redirect to main page with scenario parameter
      // This ensures compatibility with existing simulation system
      window.location.href = `index.html?scenario=${scenarioId}&category=${this.categoryId}`;
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
