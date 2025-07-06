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

// Constants
const COLOR_LIGHTEN_AMOUNT = 20; // Amount to lighten colors for pulse effects
const COLOR_DARKEN_AMOUNT = 20; // Amount to darken colors for pulse effects
const TOOLTIP_TRANSITION_DURATION = 200; // Match CSS transition duration in ms
const TOOLTIP_HOVER_DELAY = 300; // Delay before showing tooltip on hover in ms
import { getCategoryScenarios, getCategoryProgress, getCategoryById } from '../data/categories.js';
import PreLaunchModal from './components/pre-launch-modal.js';
import ScenarioModal from './components/scenario-modal.js';
import badgeManager from './core/badge-manager.js';
import badgeModal from './components/badge-modal.js';
import logger from './utils/logger.js';

class CategoryPage {
  constructor() {
    this.categoryId = null;
    this.category = null;
    this.scenarios = [];
    
    // Badge system constants
    this.BADGE_DELAY_MS = 2000; // Delay between multiple badge reveals
    
    this.initializePage();
  }

  initializePage() {
    this.init();
  }

  init() {
    logger.info('CategoryPage init called');
    // Get category ID from URL parameters
    this.categoryId = this.getCategoryIdFromUrl();
    
    logger.info('Extracted category ID:', this.categoryId);
    
    if (!this.categoryId) {
      this.handleError('No category specified');
      return;
    }

    // Find the category using direct lookup
    this.category = getCategoryById(this.categoryId);
    
    if (!this.category) {
      this.handleError(`Category '${this.categoryId}' not found`);
      return;
    }

    // Load category data
    this.loadCategoryData();
    
    // Set up event listeners
    this.setupEventListeners();
  }

  getCategoryIdFromUrl() {
    // Try multiple methods to get the category ID
    const urlParams = new URLSearchParams(window.location.search);
    let categoryId = urlParams.get('category') || urlParams.get('id');
    
    // If URLSearchParams didn't work, try manual parsing for both parameter names
    if (!categoryId) {
      const url = window.location.href;
      const match = url.match(/[?&](?:id|category)=([^&]+)/);
      if (match) {
        categoryId = decodeURIComponent(match[1]);
      }
    }
    
    // Also try looking for the hash-based routing
    if (!categoryId) {
      const { hash } = window.location;
      const hashMatch = hash.match(/#category\/([^/?]+)/);
      if (hashMatch) {
        categoryId = hashMatch[1];
      }
    }
    
    return categoryId;
  }

  loadCategoryData() {
    try {
      // Get scenarios for this category
      this.scenarios = getCategoryScenarios(this.categoryId);
      
      // Render category header
      this.renderCategoryHeader();
      
      // Render scenarios grid
      this.renderScenariosGrid();
      
      // Setup tooltips
      this.setupProgressRingTooltips();
      
    } catch (error) {
      this.handleError('Failed to load category data');
    }
  }

  renderCategoryHeader() {
    const headerContainer = document.getElementById('category-header-content');
    if (!headerContainer) return;

    const progress = getCategoryProgress(this.categoryId);
    const PROGRESS_CIRCLE_CIRCUMFERENCE = 163.36;
    
    // Check for badge alert condition
    const badgeProgress = badgeManager.getBadgeProgress(this.categoryId);
    const isOneScenarioAwayFromBadge = badgeProgress.nextBadge && badgeProgress.progress.remaining === 1;
    const badgeAlertClass = isOneScenarioAwayFromBadge ? ' badge-alert' : '';
    
    // Set CSS custom properties for progress ring pulse colors based on category color
    const progressRing = document.querySelector('.category-progress-ring');
    if (progressRing) {
      progressRing.style.setProperty('--progress-pulse-color', this.category.color);
      // Create lighter and darker variants for the pulse animation
      const hexColor = this.category.color;
      const lightColor = this.lightenColor(hexColor, COLOR_LIGHTEN_AMOUNT);
      const darkColor = this.darkenColor(hexColor, COLOR_DARKEN_AMOUNT);
      progressRing.style.setProperty('--progress-pulse-light', lightColor);
      progressRing.style.setProperty('--progress-pulse-dark', darkColor);
    }
    
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
      <div class="category-progress-ring${badgeAlertClass}" 
           data-tooltip="${this.getProgressTooltip()}"
           role="button"
           tabindex="0"
           aria-label="Category progress: ${this.getProgressTooltip()}"
           style="--progress-pulse-color: ${this.category.color}; --progress-pulse-light: ${this.lightenColor(this.category.color, COLOR_LIGHTEN_AMOUNT)}; --progress-pulse-dark: ${this.darkenColor(this.category.color, COLOR_DARKEN_AMOUNT)}">
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

  /**
   * Generate tooltip text for progress ring
   * @returns {string} Tooltip text
   */
  getProgressTooltip() {
    const progress = getCategoryProgress(this.categoryId);
    const badgeProgress = badgeManager.getBadgeProgress(this.categoryId);
    
    // Create enhanced tooltip content
    let tooltipContent = `${progress.completed} of ${progress.total} scenarios completed`;
    
    if (badgeProgress.nextBadge) {
      if (badgeProgress.progress.remaining === 1) {
        tooltipContent += `. 1 more to unlock next badge: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
      } else {
        const { remaining } = badgeProgress.progress;
        tooltipContent += `. ${remaining} more to unlock next badge: '${badgeProgress.nextBadge.title}' ${badgeProgress.nextBadge.sidekickEmoji}`;
      }
    } else {
      tooltipContent += ` (${progress.percentage}%)`;
    }
    
    return tooltipContent;
  }

  /**
   * Setup tooltip functionality for progress rings
   */
  setupProgressRingTooltips() {
    const progressRings = document.querySelectorAll('.category-progress-ring[data-tooltip]');
    
    progressRings.forEach(ring => {
      let tooltip = null;
      let hoverTimeout = null;
      let leaveTimeout = null;
      
      const showTooltip = () => {
        if (leaveTimeout) {
          clearTimeout(leaveTimeout);
          leaveTimeout = null;
        }
        
        if (!tooltip) {
          tooltip = document.createElement('div');
          tooltip.className = 'progress-ring-tooltip';
          tooltip.textContent = ring.getAttribute('data-tooltip');
          document.body.appendChild(tooltip);
        }
        
        const ringRect = ring.getBoundingClientRect();
        const tooltipRect = tooltip.getBoundingClientRect();
        
        tooltip.style.position = 'fixed';
        tooltip.style.left = `${ringRect.left + ringRect.width / 2}px`;
        tooltip.style.top = `${ringRect.top - tooltipRect.height - 10}px`;
        tooltip.style.zIndex = '10000';
        
        // Add visible class for animation
        requestAnimationFrame(() => {
          tooltip.classList.add('visible');
        });
      };
      
      const hideTooltip = () => {
        if (hoverTimeout) {
          clearTimeout(hoverTimeout);
          hoverTimeout = null;
        }
        
        if (tooltip) {
          tooltip.classList.remove('visible');
          leaveTimeout = setTimeout(() => {
            if (tooltip) {
              document.body.removeChild(tooltip);
              tooltip = null;
            }
          }, TOOLTIP_TRANSITION_DURATION); // Match CSS transition duration
        }
      };
      
      ring.addEventListener('mouseenter', () => {
        hoverTimeout = setTimeout(showTooltip, TOOLTIP_HOVER_DELAY); // Small delay for better UX
      });
      
      ring.addEventListener('mouseleave', hideTooltip);
      
      ring.addEventListener('focus', showTooltip);
      ring.addEventListener('blur', hideTooltip);
    });
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

    // Listen for scenario modal fully closed (for badge display)
    document.addEventListener('scenario-modal-closed', this.handleScenarioModalClosed.bind(this));
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

  /**
   * Clean up any existing modal instances to prevent multiple modals
   */
  cleanupExistingModals() {
    // Close any existing pre-launch modals
    const existingModalBackdrops = document.querySelectorAll('.modal-backdrop');
    existingModalBackdrops.forEach(backdrop => {
      const modalDialog = backdrop.querySelector('.modal-dialog');
      if (modalDialog && modalDialog.querySelector('.pre-launch-modal')) {
        // Found a pre-launch modal, close it
        const closeButton = backdrop.querySelector('.modal-close');
        if (closeButton) {
          closeButton.click();
        } else {
          // Force remove if no close button found
          backdrop.remove();
        }
      }
    });

    // Also clean up any orphaned modal elements
    const orphanedPreLaunchModals = document.querySelectorAll('.pre-launch-modal');
    orphanedPreLaunchModals.forEach(modal => {
      const parentBackdrop = modal.closest('.modal-backdrop');
      if (parentBackdrop) {
        parentBackdrop.remove();
      } else {
        modal.remove();
      }
    });

    // Clean up body styles that might be left behind
    document.body.style.overflow = '';
  }

  openCategoryPremodal(category, scenario) {
    try {
      // Clean up any existing modals first
      this.cleanupExistingModals();

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
   * Handle scenario completion event (immediate progress tracking)
   */
  handleScenarioCompleted(event) {
    const { scenarioId, selectedOption, option } = event.detail;

    logger.info('Scenario completed:', {
      scenarioId,
      selectedOption,
      optionText: option.text,
    });

    // Update progress (without badge checking)
    this.updateProgress(this.categoryId, scenarioId, true, false);

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

    // Check for newly earned badges only if explicitly requested
    if (completed && checkBadges) {
      this.checkForNewBadges(categoryId, scenarioId);
    }

    // Re-render to update progress indicators
    this.renderCategoryHeader();
    this.renderScenariosGrid();
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
            await this.delay(this.BADGE_DELAY_MS);
          }
          
          // Show badge modal with category context
          await badgeModal.showBadgeModal(badge, 'category');
          
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

  /**
   * Lighten a hex color by a percentage
   * @param {string} color - Hex color string (e.g., "#ff6b35")
   * @param {number} percent - Percentage to lighten (0-100)
   * @returns {string} Lightened hex color
   */
  lightenColor(color, percent) {
    const HEX_BASE = 16;
    const RGB_MAX = 255;
    const PERCENT_TO_RGB = 2.55;
    const HEX_OFFSET = 0x1000000;
    const RED_SHIFT = 16;
    const GREEN_SHIFT = 8;
    const GREEN_MASK = 0x00FF;
    const BLUE_MASK = 0x0000FF;
    const RED_MULTIPLIER = 0x10000;
    const GREEN_MULTIPLIER = 0x100;
    const HEX_SLICE_START = 1;
    
    const num = parseInt(color.replace("#", ""), HEX_BASE);
    const amt = Math.round(PERCENT_TO_RGB * percent);
    const R = (num >> RED_SHIFT) + amt;
    const G = (num >> GREEN_SHIFT & GREEN_MASK) + amt;
    const B = (num & BLUE_MASK) + amt;
    
    const clampedR = R < RGB_MAX ? R < 1 ? 0 : R : RGB_MAX;
    const clampedG = G < RGB_MAX ? G < 1 ? 0 : G : RGB_MAX;
    const clampedB = B < RGB_MAX ? B < 1 ? 0 : B : RGB_MAX;
    
    const hexResult = (HEX_OFFSET + clampedR * RED_MULTIPLIER + clampedG * GREEN_MULTIPLIER + clampedB).toString(HEX_BASE).slice(HEX_SLICE_START);
    return `#${hexResult}`;
  }

  /**
   * Darken a hex color by a percentage
   * @param {string} color - Hex color string (e.g., "#ff6b35")
   * @param {number} percent - Percentage to darken (0-100)
   * @returns {string} Darkened hex color
   */
  darkenColor(color, percent) {
    const HEX_BASE = 16;
    const RGB_MAX = 255;
    const PERCENT_TO_RGB = 2.55;
    const HEX_OFFSET = 0x1000000;
    const RED_SHIFT = 16;
    const GREEN_SHIFT = 8;
    const GREEN_MASK = 0x00FF;
    const BLUE_MASK = 0x0000FF;
    const RED_MULTIPLIER = 0x10000;
    const GREEN_MULTIPLIER = 0x100;
    const HEX_SLICE_START = 1;
    
    const num = parseInt(color.replace("#", ""), HEX_BASE);
    const amt = Math.round(PERCENT_TO_RGB * percent);
    const R = (num >> RED_SHIFT) - amt;
    const G = (num >> GREEN_SHIFT & GREEN_MASK) - amt;
    const B = (num & BLUE_MASK) - amt;
    
    const clampedR = R > RGB_MAX ? RGB_MAX : R < 0 ? 0 : R;
    const clampedG = G > RGB_MAX ? RGB_MAX : G < 0 ? 0 : G;
    const clampedB = B > RGB_MAX ? RGB_MAX : B < 0 ? 0 : B;
    
    const hexResult = (HEX_OFFSET + clampedR * RED_MULTIPLIER + clampedG * GREEN_MULTIPLIER + clampedB).toString(HEX_BASE).slice(HEX_SLICE_START);
    return `#${hexResult}`;
  }

  /**
   * Get badge information for progress ring pulse effects
   * @returns {object|null} Badge info or null if no badge available
   */
  getBadgeInfo() {
    try {
      // Check if badge manager is available and has badge info for this category
      if (badgeManager && typeof badgeManager.getBadgeInfo === 'function') {
        return badgeManager.getBadgeInfo(this.categoryId);
      }
      return null;
    } catch (error) {
      logger.error('Error getting badge info:', error);
      return null;
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
  logger.info('DOMContentLoaded event fired, creating CategoryPage...');
  new CategoryPage();
});

// Export for potential use by other modules
export { CategoryPage };
