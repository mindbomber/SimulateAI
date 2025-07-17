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
import ScenarioCard from './scenario-card.js';
import CategoryHeader from './category-header.js';
import badgeManager from '../core/badge-manager.js';
import badgeModal from './badge-modal.js';
import { getSystemCollector } from '../services/system-metadata-collector.js';

// Constants
const HIGHLIGHT_DURATION = 2000;
const BADGE_DELAY_MS = 2000; // Delay between multiple badge reveals

class CategoryGrid {
  constructor() {
    this.container = null;
    this.categories = getAllCategories();
    this.userProgress = this.loadUserProgress();
    this.lastModalOpenTime = 0; // Debounce tracking
    this.modalOpenCooldown = 500; // Minimum time between modal opens (ms)
    this.isModalOpen = false; // Track if modal is currently open

    // Initialize category header component
    this.categoryHeader = new CategoryHeader();

    // Initialize system metadata collector for analytics
    this.systemCollector = getSystemCollector();

    this.init();
  }

  init() {
    this.container = document.querySelector(
      '.categories-grid, .simulations-grid'
    );
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

    // Use CategoryHeader component to render the header
    const categoryHeaderHtml = this.categoryHeader.render(category, progress);

    section.innerHTML = `
            ${categoryHeaderHtml}

            <div class="scenarios-grid">
                ${scenarios.map(scenario => this.createScenarioCard(scenario, category)).join('')}
            </div>
        `;

    return section;
  }

  createScenarioCard(scenario, category) {
    const isCompleted = this.userProgress[category.id]?.[scenario.id] || false;

    return ScenarioCard.render(scenario, category, isCompleted);
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
    document.addEventListener(
      'scenario-modal-closed',
      this.handleScenarioModalClosed.bind(this)
    );

    // Attach CategoryHeader event listeners for progress ring tooltips
    this.categoryHeader.attachEventListeners(this.container);
  }

  handleScenarioClick(event) {
    const scenarioCard = event.target.closest('.scenario-card');
    if (!scenarioCard) return;

    // Prevent default navigation behavior
    event.preventDefault();

    const scenarioId = scenarioCard.getAttribute('data-scenario-id');
    const categoryId = scenarioCard.getAttribute('data-category-id');

    // Check if the clicked element is the quick start button
    if (
      event.target.classList.contains('scenario-quick-start-btn') ||
      event.target.closest('.scenario-quick-start-btn')
    ) {
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

    // Track scenario access via pre-launch modal
    this.systemCollector.trackScenarioPerformance({
      scenarioId,
      categoryId,
      action: 'view',
      metadata: {
        source: 'category-grid-prelaunch',
        modalType: 'with-prelaunch',
        scenarioTitle: scenario.title,
        categoryTitle: category.title,
        accessMethod: 'standard',
        timestamp: new Date().toISOString(),
      },
    });

    // Track user interaction with category content
    this.systemCollector.trackInteraction({
      element: 'scenario-card',
      action: 'click',
      metadata: {
        scenarioId,
        categoryId,
        component: 'category-grid',
        interactionType: 'scenario-selection',
      },
    });

    // Dispatch custom event for other components to listen to
    const event = new CustomEvent('scenario-selected', {
      detail: { category, scenario, categoryId, scenarioId },
    });
    document.dispatchEvent(event);

    // Open the PreLaunchModal configured for this category
    this.openCategoryPremodal(category, scenario);
  }

  /**
   * Clean up any existing modal instances to prevent multiple modals
   */
  cleanupExistingModals() {
    // Close any existing pre-launch modals by backdrop
    const existingModalBackdrops = document.querySelectorAll('.modal-backdrop');
    existingModalBackdrops.forEach(backdrop => {
      const modalDialog = backdrop.querySelector('.modal-dialog');
      if (modalDialog && modalDialog.querySelector('.pre-launch-modal')) {
        // Found a pre-launch modal, remove it immediately
        backdrop.remove();
      }
    });

    // Also clean up any orphaned modal elements
    const orphanedPreLaunchModals =
      document.querySelectorAll('.pre-launch-modal');
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

    // Remove any modal-related classes from body
    document.body.classList.remove('modal-open');

    // Remove any lingering inert states from other elements
    document.querySelectorAll('[inert]').forEach(el => {
      if (!el.classList.contains('modal-backdrop')) {
        el.removeAttribute('inert');
      }
    });
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
      // Track scenario view for analytics
      this.systemCollector.trackScenarioPerformance({
        scenarioId,
        categoryId: categoryId || 'unknown',
        action: 'view',
        metadata: {
          source: 'category-grid',
          modalType: 'with-prelaunch',
          timestamp: new Date().toISOString(),
        },
      });

      // Track navigation from category to scenario
      this.systemCollector.trackNavigation({
        from: `category-${categoryId}`,
        to: `scenario-${scenarioId}`,
        action: 'click',
        metadata: {
          component: 'category-grid',
          modalFlow: 'standard',
        },
      });

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
    logger.debug('CategoryGrid: openScenarioModalDirect called', {
      categoryId,
      scenarioId,
    });

    // Enhanced debounce to prevent rapid successive calls
    const now = Date.now();
    const cooldown = this.modalOpenCooldown || 1000; // Increase default cooldown to 1 second

    if (now - this.lastModalOpenTime < cooldown) {
      logger.debug('Modal request debounced - too soon after last request');
      return;
    }

    // Check if a modal is already open
    if (
      this.isModalOpen ||
      document.querySelector('.modal-backdrop:not([aria-hidden="true"])')
    ) {
      logger.debug('Modal already open, ignoring request', {
        isModalOpenFlag: this.isModalOpen,
        hasVisibleModalBackdrop: !!document.querySelector(
          '.modal-backdrop:not([aria-hidden="true"])'
        ),
      });
      return;
    }

    this.lastModalOpenTime = now;
    this.isModalOpen = true;

    const category = this.categories.find(c => c.id === categoryId);
    const scenario = category?.scenarios.find(s => s.id === scenarioId);

    if (!category || !scenario) {
      logger.error('Category or scenario not found:', categoryId, scenarioId);
      return;
    }

    logger.info('CategoryGrid', 'Opening scenario modal directly for:', {
      title: scenario.title,
    });

    // Track direct scenario access for analytics
    this.systemCollector.trackScenarioPerformance({
      scenarioId,
      categoryId,
      action: 'view',
      metadata: {
        source: 'category-grid-direct',
        modalType: 'direct',
        scenarioTitle: scenario.title,
        categoryTitle: category.title,
        timestamp: new Date().toISOString(),
      },
    });

    // Track navigation pattern for direct access
    this.systemCollector.trackNavigation({
      from: `category-${categoryId}`,
      to: `scenario-${scenarioId}`,
      action: 'direct-access',
      metadata: {
        component: 'category-grid',
        modalFlow: 'direct',
        bypassPrelaunch: true,
      },
    });

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
      // Track scenario completion for system analytics
      this.systemCollector.trackScenarioPerformance({
        scenarioId,
        categoryId: category.id,
        action: 'complete',
        metadata: {
          selectedOption,
          optionText: option.text,
          impact: option.impact,
          completionTime: event.detail.completionTime || null,
          source: 'category-grid-completion',
          timestamp: new Date().toISOString(),
        },
      });

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
    const { categoryId, scenarioId, completed = true } = event.detail;

    logger.info('Scenario modal fully closed:', {
      categoryId,
      scenarioId,
      completed,
    });

    // CRITICAL FIX: Always reset modal state to allow new modals to open
    // This ensures subsequent Surprise Me clicks work regardless of how modal was closed
    this.isModalOpen = false;
    logger.debug(
      'CategoryGrid: Modal state reset, subsequent modals can now open'
    );

    // Only check for newly earned badges if scenario was actually completed
    if (completed && categoryId && scenarioId) {
      this.checkForNewBadges(categoryId, scenarioId);
    } else {
      logger.debug(
        'Scenario modal closed without completion - skipping badge check'
      );
    }
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
      const newBadges = badgeManager.updateScenarioCompletion(
        categoryId,
        scenarioId
      );

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
            timestamp: badge.timestamp,
          });

          // Track analytics if available
          if (window.AnalyticsManager) {
            window.AnalyticsManager.trackEvent('badge_earned', {
              categoryId: badge.categoryId,
              badgeTitle: badge.title,
              tier: badge.tier,
              scenarioId,
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

  /**
   * Clean up component resources
   */
  cleanup() {
    if (this.categoryHeader) {
      this.categoryHeader.cleanup();
    }
  }
}

export default CategoryGrid;
