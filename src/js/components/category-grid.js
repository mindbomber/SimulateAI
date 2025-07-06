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
import badgeManager from '../core/badge-manager.js';
import badgeModal from './badge-modal.js';

// Constants
const PROGRESS_CIRCLE_CIRCUMFERENCE = 163; // 2 * π * 26 (radius)
const HIGHLIGHT_DURATION = 2000;
const BADGE_DELAY_MS = 2000; // Delay between multiple badge reveals
const TOOLTIP_OFFSET = 8; // Tooltip offset from progress ring
const MOBILE_TOOLTIP_DURATION = 3000; // Mobile tooltip display duration

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

    // Attach event listeners after rendering
    this.attachEventListeners();
  }

  createCategorySection(category) {
    const section = document.createElement('section');
    section.className = 'category-section';
    section.setAttribute('data-category-id', category.id);
    section.id = `category-${category.id}`;

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
${this.createProgressRing(category, progress)}
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

    // Listen for scenario modal fully closed (for badge display)
    document.addEventListener('scenario-modal-closed', this.handleScenarioModalClosed.bind(this));
    
    // Add tooltip functionality for progress rings
    this.attachProgressRingTooltips();
  }

  /**
   * Attaches tooltip functionality to progress rings
   */
  attachProgressRingTooltips() {
    const progressRings = this.container.querySelectorAll('.category-progress-ring[data-tooltip]');
    
    progressRings.forEach(ring => {
      // Desktop: hover events
      ring.addEventListener('mouseenter', this.showTooltip.bind(this));
      ring.addEventListener('mouseleave', this.hideTooltip.bind(this));
      
      // Mobile: touch/tap events  
      ring.addEventListener('touchstart', this.handleProgressRingTouch.bind(this));
      ring.addEventListener('click', this.handleProgressRingClick.bind(this));
      
      // Keyboard accessibility
      ring.addEventListener('keydown', this.handleProgressRingKeydown.bind(this));
    });
  }

  /**
   * Shows tooltip for progress ring
   * @param {Event} event - Mouse or touch event
   */
  showTooltip(event) {
    const ring = event.currentTarget;
    const tooltip = ring.getAttribute('data-tooltip');
    
    if (!tooltip) return;

    // Remove any existing tooltips
    this.hideTooltip();

    // Create tooltip element
    const tooltipEl = document.createElement('div');
    tooltipEl.className = 'progress-ring-tooltip';
    tooltipEl.textContent = tooltip;
    tooltipEl.setAttribute('role', 'tooltip');
    
    // Position tooltip
    const rect = ring.getBoundingClientRect();
    tooltipEl.style.position = 'fixed';
    tooltipEl.style.top = `${rect.bottom + TOOLTIP_OFFSET}px`;
    tooltipEl.style.left = `${rect.left + rect.width / 2}px`;
    tooltipEl.style.transform = 'translateX(-50%)';
    tooltipEl.style.zIndex = '1000';
    
    document.body.appendChild(tooltipEl);
    
    // Store reference for cleanup
    ring._tooltip = tooltipEl;
  }

  /**
   * Hides tooltip for progress ring
   */
  hideTooltip() {
    const existingTooltips = document.querySelectorAll('.progress-ring-tooltip');
    existingTooltips.forEach(tooltip => {
      tooltip.remove();
    });
    
    // Clear tooltip references
    const rings = this.container.querySelectorAll('.category-progress-ring');
    rings.forEach(ring => {
      if (ring._tooltip) {
        ring._tooltip = null;
      }
    });
  }

  /**
   * Handles touch events for mobile tooltip
   * @param {Event} event - Touch event
   */
  handleProgressRingTouch(event) {
    event.preventDefault();
    this.showTooltip(event);
    
    // Hide tooltip after delay on mobile
    setTimeout(() => {
      this.hideTooltip();
    }, MOBILE_TOOLTIP_DURATION);
  }

  /**
   * Handles click events for progress ring
   * @param {Event} event - Click event
   */
  handleProgressRingClick(event) {
    event.preventDefault();
    event.stopPropagation();
    
    // On mobile, toggle tooltip
    if ('ontouchstart' in window) {
      const ring = event.currentTarget;
      if (ring._tooltip) {
        this.hideTooltip();
      } else {
        this.showTooltip(event);
        setTimeout(() => this.hideTooltip(), MOBILE_TOOLTIP_DURATION);
      }
    }
  }

  /**
   * Handles keyboard events for progress ring accessibility
   * @param {Event} event - Keyboard event
   */
  handleProgressRingKeydown(event) {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.showTooltip(event);
      
      // Hide tooltip after delay
      setTimeout(() => {
        this.hideTooltip();
      }, MOBILE_TOOLTIP_DURATION);
    } else if (event.key === 'Escape') {
      this.hideTooltip();
    }
  }

  handleScenarioClick(event) {
    const scenarioCard = event.target.closest('.scenario-card');
    if (!scenarioCard) return;

    // Prevent default navigation behavior
    event.preventDefault();

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
   * Handle scenario completion event (immediate progress tracking)
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
      // Update progress (without badge checking)
      this.updateProgress(category.id, scenarioId, true, false);

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

  /**
   * Handle scenario modal fully closed event (for badge display)
   */
  handleScenarioModalClosed(event) {
    const { categoryId, scenarioId } = event.detail;

    logger.info('Scenario modal fully closed, checking for badges:', {
      categoryId,
      scenarioId,
    });

    // Now check for newly earned badges
    this.checkForNewBadges(categoryId, scenarioId);
  }

  updateProgress(categoryId, scenarioId, completed = true, checkBadges = true) {
    if (!this.userProgress[categoryId]) {
      this.userProgress[categoryId] = {};
    }

    this.userProgress[categoryId][scenarioId] = completed;
    this.saveUserProgress();

    // Check for newly earned badges only if explicitly requested
    if (completed && checkBadges) {
      this.checkForNewBadges(categoryId, scenarioId);
    }

    // Re-render to update progress indicators
    this.render();
  }

  /**
   * Checks for newly earned badges and displays them
   * @param {string} categoryId - Category identifier
   * @param {string} scenarioId - Scenario identifier
   */
  async checkForNewBadges(categoryId, scenarioId) {
    try {
      // Refresh badge manager's category progress
      badgeManager.refreshCategoryProgress();
      
      // Check for newly earned badges
      const newBadges = badgeManager.updateScenarioCompletion(categoryId, scenarioId);
      
      if (newBadges && newBadges.length > 0) {
        // Display each new badge with a delay between multiple badges
        for (let i = 0; i < newBadges.length; i++) {
          const badge = newBadges[i];
          
          // Add small delay between multiple badges
          if (i > 0) {
            await this.delay(BADGE_DELAY_MS);
          }
          
          // Show badge modal with main context (from home page)
          await badgeModal.showBadgeModal(badge, 'main');
          
          // Track badge achievement
          logger.info('Badge earned:', {
            categoryId: badge.categoryId,
            badgeTitle: badge.title,
            tier: badge.tier,
            timestamp: badge.timestamp
          });
          
          // Track analytics if available
          if (window.AnalyticsManager) {
            window.AnalyticsManager.trackEvent('badge_earned', {
              categoryId: badge.categoryId,
              badgeTitle: badge.title,
              tier: badge.tier,
              scenarioId
            });
          }
        }
      }
    } catch (error) {
      logger.error('Error checking for new badges:', error);
    }
  }

  /**
   * Utility function to create delays
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise} Promise that resolves after delay
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
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

  /**
   * Checks if user is one scenario away from earning the next badge
   * @param {string} categoryId - Category identifier
   * @returns {Object|null} Next badge info if one scenario away, null otherwise
   */
  isOneScenarioFromNextBadge(categoryId) {
    try {
      // Ensure badge manager has latest progress data
      badgeManager.refreshCategoryProgress();
      
      const progress = badgeManager.getBadgeProgress(categoryId);
      
      if (!progress || !progress.nextBadge || !progress.progress) {
        return null;
      }

      const { remaining } = progress.progress;
      
      // Check if exactly one scenario away from next badge
      if (remaining === 1) {
        return {
          nextBadge: progress.nextBadge,
          current: progress.progress.current,
          required: progress.progress.required,
          badgeTitle: progress.nextBadge.title,
          sidekickEmoji: progress.nextBadge.sidekickEmoji
        };
      }

      return null;
    } catch (error) {
      logger.error('Error checking badge progress:', error);
      return null;
    }
  }

  /**
   * Creates the progress ring with pulse animation and tooltip for badges
   * @param {Object} category - Category object
   * @param {Object} progress - Progress object
   * @returns {string} Progress ring HTML
   */
  createProgressRing(category, progress) {
    const badgeInfo = this.isOneScenarioFromNextBadge(category.id);
    const isPulsingForBadge = badgeInfo !== null;
    
    // Generate tooltip content if one scenario away from badge
    const tooltipContent = badgeInfo ? 
      `${badgeInfo.current} of ${badgeInfo.required} scenarios completed. 1 more to unlock next badge: '${badgeInfo.badgeTitle}' ${badgeInfo.sidekickEmoji}` :
      `${progress.completed} of ${progress.total} scenarios completed`;

    const pulseClass = isPulsingForBadge ? 'pulse-for-badge' : '';
    
    return `
      <div class="category-progress-ring ${pulseClass}" 
           data-tooltip="${tooltipContent}"
           role="button"
           tabindex="0"
           aria-label="Category progress: ${tooltipContent}">
        <svg width="60" height="60" viewBox="0 0 60 60">
          <circle cx="30" cy="30" r="26" fill="none" stroke="#e5e7eb" stroke-width="4"/>
          <circle cx="30" cy="30" r="26" fill="none" stroke="${category.color}" stroke-width="4"
                  stroke-linecap="round" stroke-dasharray="${PROGRESS_CIRCLE_CIRCUMFERENCE}" 
                  stroke-dashoffset="${PROGRESS_CIRCLE_CIRCUMFERENCE - (progress.percentage / 100) * PROGRESS_CIRCLE_CIRCUMFERENCE}"
                  style="transform: rotate(-90deg); transform-origin: 30px 30px;"/>
        </svg>
        <span class="progress-percentage">${progress.percentage}%</span>
      </div>
    `;
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
